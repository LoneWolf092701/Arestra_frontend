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
  Rating
} from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import HotelIcon from '@mui/icons-material/Hotel';
import BathtubIcon from '@mui/icons-material/Bathtub';
import PetsIcon from '@mui/icons-material/Pets';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { getPropertyById } from '../../api/propertyApi';
import { isFavouriteStatus, setFavouriteStatus, submitComplaint } from '../../api/userInteractionApi';
import { useParams, useNavigate } from 'react-router-dom';

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

const UserPropertyViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [isFavourite, setIsFavourite] = useState(false);
  //const [favouriteStatus, setFavouriteStatus] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [bookingDateFrom, setBookingDateFrom] = useState('');
  const [bookingDateTo, setBookingDateTo] = useState('');
  const [complaintText, setComplaintText] = useState('');
  const [popupTitle, setPopupTitle] = useState('');
  const [popupContent, setPopupContent] = useState('');

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        const data = await getPropertyById(id);
        const isFavouriteData = await isFavouriteStatus({ property_id: id });
        setIsFavourite(isFavouriteData.isFavourite);
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
  }, [id]);

  const handleFavouriteToggle = async () => {
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
    alert(
      `Booking request from ${bookingDateFrom} to ${bookingDateTo} for starting at $${property.price_range ? property.price_range[0] : 'N/A'}`
    );
  };

  const handleWhatsApp = () => {
    const phone = '1234567890'; // Landlord's phone number
    const text = encodeURIComponent(`Hello, I am interested in your property: ${property.property_type} - ${property.unit_type}`);
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  const handleSendComplaint = async () => {
    try {
      await submitComplaint({ property_id: property.id, complaint: complaintText });
      alert('Complaint sent!');
      setComplaintText('');
    } catch (error) {
      console.error('Error sending complaint:', error);
      alert('Failed to send complaint.');
    }
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
      {/* Title, Favourite & Rating */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h4">
          {property.property_type} - {property.unit_type}
        </Typography>
        <Box display="flex" alignItems="center">
          <IconButton onClick={handleFavouriteToggle} color="error">
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
            />
          </Grid>
        </Grid>
        <Typography variant="body1" mt={2}>
          Total Price: ${property.price_range ? property.price_range[0] : 'N/A'} (per booking period)
        </Typography>
        <Button variant="contained" color="primary" onClick={handleBook} sx={{ mt: 2 }}>
          Request to Book
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
        />
        <Button variant="contained" color="error" onClick={handleSendComplaint} sx={{ mt: 2 }}>
          Send Complaint
        </Button>
      </Box>
    </Container>
  );
};

export default UserPropertyViewPage;
