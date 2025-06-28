import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardMedia,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  Alert,
  Divider
} from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import HotelIcon from '@mui/icons-material/Hotel';
import BathtubIcon from '@mui/icons-material/Bathtub';
import PetsIcon from '@mui/icons-material/Pets';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import CancelIcon from '@mui/icons-material/Cancel';
import LoginIcon from '@mui/icons-material/Login';
import { getPropertyById } from '../../api/propertyApi';
import { isFavouriteStatus, setFavouriteStatus, submitComplaint } from '../../api/userInteractionApi';
import { approveProperty, rejectProperty } from '../../api/adminAPI';
import { useParams, useNavigate } from 'react-router-dom';
import AppSnackbar from '../../components/common/AppSnackbar';
import { isAuthenticated } from '../../utils/auth';

// Helper function to format ISO dates to yyyy-MM-dd for date inputs.
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = (`0${date.getMonth() + 1}`).slice(-2);
  const day = (`0${date.getDate()}`).slice(-2);
  return `${year}-${month}-${day}`;
};

// Popup Component for Rules, Contract Details & Cancellation Policy
const InfoPopup = ({ open, onClose, title, content }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent dividers>
      <Typography variant="body2">{content || 'No details provided.'}</Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} variant="contained" color="primary">
        Close
      </Button>
    </DialogActions>
  </Dialog>
);

// Admin Rejection Dialog Component
const RejectionDialog = ({ open, onClose, onConfirm, loading }) => {
  const [rejectionReason, setRejectionReason] = useState('');

  const handleConfirm = () => {
    if (rejectionReason.trim()) {
      onConfirm(rejectionReason);
      setRejectionReason('');
    }
  };

  const handleClose = () => {
    setRejectionReason('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Reject Property Listing</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          This property will be rejected and the owner will be notified with your reason.
        </Alert>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Rejection Reason"
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          placeholder="Please provide a clear reason for rejecting this property..."
          required
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleConfirm} 
          color="error" 
          variant="contained"
          disabled={!rejectionReason.trim() || loading}
        >
          {loading ? 'Rejecting...' : 'Reject Property'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Login Required Dialog Component
const LoginRequiredDialog = ({ open, onClose, onLogin, action }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Login Required</DialogTitle>
    <DialogContent>
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <LoginIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Please log in to {action}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          You need to be logged in to access this feature. Don't worry, you'll be brought back to this property after logging in.
        </Typography>
      </Box>
    </DialogContent>
    <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
      <Button onClick={onClose} color="inherit">
        Cancel
      </Button>
      <Button onClick={onLogin} variant="contained" startIcon={<LoginIcon />}>
        Login
      </Button>
    </DialogActions>
  </Dialog>
);

const UserPropertyViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [isFavourite, setIsFavourite] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [bookingDateFrom, setBookingDateFrom] = useState('');
  const [bookingDateTo, setBookingDateTo] = useState('');
  const [complaintText, setComplaintText] = useState('');
  const [popupTitle, setPopupTitle] = useState('');
  const [popupContent, setPopupContent] = useState('');
  const [loginRequiredDialogOpen, setLoginRequiredDialogOpen] = useState(false);
  const [loginAction, setLoginAction] = useState('');
  
  // Check authentication and user role
  const authenticated = isAuthenticated();
  const userRole = localStorage.getItem('userRole');
  const isAdmin = userRole === 'admin';
  const isUser = userRole === 'user';
  
  // Admin-specific states
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        const data = await getPropertyById(id);
        
        // Only fetch favourite status for authenticated users
        if (authenticated && isUser) {
          const isFavouriteData = await isFavouriteStatus({ property_id: id });
          setIsFavourite(isFavouriteData.isFavourite);
        }
        
        // Assume data is an array and we take the first item.
        if (data && data.length > 0) {
          const propertyData = data[0];
          setProperty(propertyData);
          // Set the booking dates to the already booked dates from the API.
          setBookingDateFrom(formatDateForInput(propertyData.available_from));
          setBookingDateTo(formatDateForInput(propertyData.available_to));
        }
      } catch (error) {
        console.error('Error fetching property details:', error);
      }
    };
    fetchPropertyDetails();
  }, [id, authenticated, isUser]);

  const handleLoginRequired = (action) => {
    setLoginAction(action);
    setLoginRequiredDialogOpen(true);
  };

  const handleLoginRedirect = () => {
    // Store the current URL to return after login
    const returnUrl = encodeURIComponent(window.location.pathname);
    navigate(`/login?returnUrl=${returnUrl}`);
  };

  const handleFavouriteToggle = async () => {
    if (!authenticated) {
      handleLoginRequired('add to favourites');
      return;
    }

    if (!isUser) {
      setSnackbarMessage('Only users can add properties to favourites');
      setSnackbarOpen(true);
      return;
    }

    const newStatus = !isFavourite;
    setIsFavourite(newStatus);
    try {
      await setFavouriteStatus({ property_id: property.id, isFavourite: newStatus });
    } catch (error) {
      console.error('Error updating favourite status:', error);
      // Optionally revert UI if API call fails.
      setIsFavourite(!newStatus);
    }
  };

  const openDetailsPopup = (title, content) => {
    setPopupTitle(title);
    setPopupContent(content);
    setPopupOpen(true);
  };

  const closeDetailsPopup = () => {
    setPopupOpen(false);
  };

  const handleBook = () => {
    if (!authenticated) {
      handleLoginRequired('book this property');
      return;
    }

    if (!isUser) {
      setSnackbarMessage('Only users can book properties');
      setSnackbarOpen(true);
      return;
    }

    // Navigate to booking page
    navigate(`/user-bookproperty/${property.id}`);
  };

  const handleWhatsApp = () => {
    const phone = '1234567890'; // Landlord's phone number
    const text = encodeURIComponent(`Hello, I am interested in your property: ${property.property_type} - ${property.unit_type}`);
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  const handleSendComplaint = async () => {
    if (!authenticated) {
      handleLoginRequired('send a complaint');
      return;
    }

    if (!isUser) {
      setSnackbarMessage('Only users can send complaints');
      setSnackbarOpen(true);
      return;
    }

    try {
      await submitComplaint({ property_id: property.id, complaint: complaintText });
      setSnackbarMessage('Complaint sent successfully!');
      setSnackbarOpen(true);
      setComplaintText('');
    } catch (error) {
      console.error('Error sending complaint:', error);
      setSnackbarMessage('Failed to send complaint.');
      setSnackbarOpen(true);
    }
  };

  // Admin functions
  const handleApproveProperty = async () => {
    setAdminLoading(true);
    try {
      const token = localStorage.getItem('token');
      await approveProperty(property.id, token);
      setSnackbarMessage('Property approved successfully!');
      setSnackbarOpen(true);
      
      // Navigate back to admin listings or refresh property data
      setTimeout(() => {
        navigate('/admin/new-listings');
      }, 2000);
    } catch (error) {
      console.error('Error approving property:', error);
      setSnackbarMessage('Error approving property');
      setSnackbarOpen(true);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleRejectProperty = async (rejectionReason) => {
    setAdminLoading(true);
    try {
      const token = localStorage.getItem('token');
      await rejectProperty(property.id, rejectionReason, token);
      setSnackbarMessage('Property rejected successfully');
      setSnackbarOpen(true);
      setRejectionDialogOpen(false);
      
      // Navigate back to admin listings
      setTimeout(() => {
        navigate('/admin/new-listings');
      }, 2000);
    } catch (error) {
      console.error('Error rejecting property:', error);
      setSnackbarMessage('Error rejecting property');
      setSnackbarOpen(true);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleCancelAdmin = () => {
    navigate('/admin/new-listings');
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (!property) {
    return (
      <Typography variant="h4" align="center" gutterBottom>
        Loading...
      </Typography>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Admin Controls Section */}
      {authenticated && isAdmin && (
        <Box sx={{ mb: 4, p: 3, backgroundColor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
          <Typography variant="h6" gutterBottom color="primary">
            Admin Controls
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Review this property listing and take appropriate action.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckIcon />}
              onClick={handleApproveProperty}
              disabled={adminLoading}
            >
              {adminLoading ? 'Approving...' : 'Approve'}
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<CloseIcon />}
              onClick={() => setRejectionDialogOpen(true)}
              disabled={adminLoading}
            >
              Reject
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<CancelIcon />}
              onClick={handleCancelAdmin}
              disabled={adminLoading}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      )}

      {/* Property Details Section */}
      {/* Title, Favourite & Rating */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h4">
          {property.property_type} - {property.unit_type}
        </Typography>
        {/* Show favourite and rating only for authenticated users or as disabled for guests */}
        <Box display="flex" alignItems="center">
          <IconButton 
            onClick={handleFavouriteToggle} 
            color="error"
            disabled={!authenticated || !isUser}
          >
            {isFavourite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
          <Rating name="read-only" value={property.rating || 0} readOnly />
        </Box>
      </Box>

      {/* Address & Verification */}
      <Box display="flex" alignItems="center" mb={2}>
        <Typography variant="subtitle1" color="textSecondary">
          {property.address || 'Address not provided'}
        </Typography>
        <Box ml={2} display="flex" alignItems="center">
          <VerifiedUserIcon color="primary" />
          <Typography variant="subtitle2" ml={0.5}>
            Trusted landlord
          </Typography>
        </Box>
      </Box>

      {/* Images Grid */}
      {property.images && property.images.length > 0 ? (
        <Grid container spacing={1} mb={2}>
          {property.images.map((img, index) => (
            <Grid item xs={6} sm={4} key={index}>
              <CardMedia component="img" image={img} alt={`Property image ${index + 1}`} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <CardMedia
          component="img"
          height="200"
          image="https://via.placeholder.com/600x400"
          alt="Placeholder"
          sx={{ mb: 2 }}
        />
      )}

      {/* Price */}
      <Typography variant="h5" color="primary" mb={2}>
        Starting at ${property.price_range ? property.price_range[0] : 'N/A'}
      </Typography>

      {/* 4 Cards for Details */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={3}>
          <Card sx={{ textAlign: 'center', p: 1 }}>
            <HotelIcon color="action" />
            <Typography variant="body2">{property.facilities?.Bedroom || 0} Beds</Typography>
          </Card>
        </Grid>
        <Grid item xs={3}>
          <Card sx={{ textAlign: 'center', p: 1 }}>
            <BathtubIcon color="action" />
            <Typography variant="body2">{property.facilities?.Bathroom || 0} Baths</Typography>
          </Card>
        </Grid>
        <Grid item xs={3}>
          <Card sx={{ textAlign: 'center', p: 1 }}>
            <PetsIcon color="action" />
            <Typography variant="body2">
              {property.petsAllowed ? 'Allowed' : 'Not Allowed'}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={3}>
          <Card sx={{ textAlign: 'center', p: 1 }}>
            <LocalParkingIcon color="action" />
            <Typography variant="body2">
              {property.parkingAvailable ? 'Available' : 'Not Available'}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Accommodation Details */}
      {property.accommodationDetails && (
        <>
          <Typography variant="subtitle1" gutterBottom>
            Accommodation Details
          </Typography>
          <Typography variant="body2" mb={2}>
            {property.accommodationDetails}
          </Typography>
        </>
      )}

      {/* Offered Amenities */}
      {property.amenities && property.amenities.length > 0 && (
        <>
          <Typography variant="subtitle1" gutterBottom>
            Offered Amenities
          </Typography>
          <Grid container spacing={1} mb={2}>
            {property.amenities.map((amenity, index) => (
              <Grid item xs={6} key={index}>
                <Typography variant="body2">• {amenity}</Typography>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Roommate Details */}
      {property.roommateDetails && (
        <>
          <Typography variant="subtitle1" gutterBottom>
            Roommate Details
          </Typography>
          <Typography variant="body2" mb={2}>
            {property.roommateDetails}
          </Typography>
        </>
      )}

       {/* Rules, Contract Policy, and Cancellation Policy Buttons */}
      <Box mt={3} mb={2}>
        <Typography variant="h6">Property Rules</Typography>
        <Button variant="outlined" onClick={() => openDetailsPopup('Rules', property.rules?.join(', ') || 'No rules specified.')}>
          View Rules
        </Button>
      </Box>

      <Box mb={2}>
        <Typography variant="h6">Contract Policy</Typography>
        <Button variant="outlined" onClick={() => openDetailsPopup('Contract Policy', property.contract_policy || 'No contract policy available.')}>
          View Contract Policy
        </Button>
      </Box>

      <Box mb={2}>
        <Typography variant="h6">Cancellation Policy</Typography>
        <Button variant="outlined" onClick={() => openDetailsPopup('Cancellation Policy', property.cancellation_policy || 'No cancellation policy available.')}>
          View Cancellation Policy
        </Button>
      </Box>

      {/* Reusable Popup Component */}
      <InfoPopup open={popupOpen} onClose={closeDetailsPopup} title={popupTitle} content={popupContent} />

      {/* Non-admin sections */}
      {!isAdmin && (
        <>
          <Divider sx={{ my: 3 }} />
          
          {/* Booking Section */}
          <Box mb={2}>
            <Typography variant="h6" gutterBottom>
              Book This Property
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={6}>
                <TextField
                  label="From"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  value={bookingDateFrom}
                  onChange={(e) => setBookingDateFrom(e.target.value)}
                  disabled={!authenticated || !isUser}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="To"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  value={bookingDateTo}
                  onChange={(e) => setBookingDateTo(e.target.value)}
                  disabled={!authenticated || !isUser}
                />
              </Grid>
            </Grid>
            <Typography variant="body1" mt={2}>
              Total Price: ${property.price_range ? property.price_range[0] : 'N/A'} (per booking period)
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleBook} 
              sx={{ mt: 2 }}
            >
              {authenticated ? 'Request to Book' : 'Login to Book'}
            </Button>
          </Box>

          {/* Message Landlord via WhatsApp */}
          <Button
            variant="contained"
            color="success"
            startIcon={<WhatsAppIcon />}
            onClick={handleWhatsApp}
            sx={{ mb: 2 }}
          >
            Message Landlord
          </Button>

          {/* Complaint Section */}
          <Box mb={4}>
            <Typography variant="subtitle1" gutterBottom>
              Write a Complaint
            </Typography>
            <TextField
              label="Your Complaint"
              variant="outlined"
              multiline
              rows={3}
              fullWidth
              value={complaintText}
              onChange={(e) => setComplaintText(e.target.value)}
              disabled={!authenticated || !isUser}
              placeholder={!authenticated ? "Login required to send complaints" : ""}
            />
            <Button 
              variant="contained" 
              color="error" 
              onClick={handleSendComplaint} 
              sx={{ mt: 2 }}
              disabled={!authenticated || !isUser || !complaintText.trim()}
            >
              {authenticated ? 'Send Complaint' : 'Login to Send Complaint'}
            </Button>
          </Box>
        </>
      )}

      {/* Login Required Dialog */}
      <LoginRequiredDialog
        open={loginRequiredDialogOpen}
        onClose={() => setLoginRequiredDialogOpen(false)}
        onLogin={handleLoginRedirect}
        action={loginAction}
      />

      {/* Admin Rejection Dialog */}
      <RejectionDialog
        open={rejectionDialogOpen}
        onClose={() => setRejectionDialogOpen(false)}
        onConfirm={handleRejectProperty}
        loading={adminLoading}
      />

      {/* Snackbar for notifications */}
      <AppSnackbar
        open={snackbarOpen}
        message={snackbarMessage}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
      />
    </Container>
  );
};

export default UserPropertyViewPage;