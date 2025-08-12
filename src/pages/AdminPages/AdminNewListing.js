import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Divider,
  Alert,
  Rating,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import HotelIcon from '@mui/icons-material/Hotel';
import BathtubIcon from '@mui/icons-material/Bathtub';
import PeopleIcon from '@mui/icons-material/People';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import InfoIcon from '@mui/icons-material/Info';
import { useNavigate } from 'react-router-dom';
import { getPendingProperties, approveProperty, rejectProperty } from '../../api/adminAPI';
import AppSnackbar from '../../components/common/AppSnackbar';
import Room from '../../assets/images/Room.jpg';

const safeParse = (str) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    return [];
  }
};

const PropertyDetailsDialog = ({ open, onClose, property, onApprove, onReject }) => {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const navigate = useNavigate();

  if (!property) return null;

  const amenities = safeParse(property.amenities);
  const facilities = safeParse(property.facilities);
  const roommates = safeParse(property.roommates);
  const rules = safeParse(property.rules);
  const billsInclusive = safeParse(property.bills_inclusive);
  const priceRange = safeParse(property.price_range);
  const images = safeParse(property.images);

  const handleApprove = () => {
    onApprove(property.id);
    onClose();
  };

  const handleReject = () => {
    if (rejectReason.trim()) {
      onReject(property.id, rejectReason);
      setRejectReason('');
      setShowRejectForm(false);
      onClose();
    }
  };

  const handleViewFullProperty = () => {
    onClose();
    navigate(`/property/${property.id}`);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Property Review Details
          <Button
            startIcon={<VisibilityIcon />}
            onClick={handleViewFullProperty}
            size="small"
          >
            View Full Property
          </Button>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <CardMedia
              component="img"
              height="200"
              image={images && images.length > 0 ? images[0] : Room}
              alt={property.property_type}
              sx={{ borderRadius: 1, objectFit: 'cover' }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              {property.property_type} - {property.unit_type}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationOnIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2">{property.address}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AttachMoneyIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2">LKR {parseFloat(property.price || 0).toLocaleString()}/month</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CalendarTodayIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2">
                Available from: {property.available_from ? new Date(property.available_from).toLocaleDateString() : 'Immediately'}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Chip icon={<HotelIcon />} label={`${facilities?.Bedroom || 0} Bedrooms`} size="small" />
              <Chip icon={<BathtubIcon />} label={`${facilities?.Bathroom || 0} Bathrooms`} size="small" />
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {property.description && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Description:</Typography>
            <Typography variant="body2" color="text.secondary">
              {property.description}
            </Typography>
          </Box>
        )}

        {amenities && amenities.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Amenities:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Object.entries(amenities).map(([key, value]) => (
                value && <Chip key={key} label={key} size="small" />
              ))}
            </Box>
          </Box>
        )}

        {rules && rules.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Property Rules:</Typography>
            <List dense>
              {rules.map((rule, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <InfoIcon sx={{ fontSize: 16 }} />
                  </ListItemIcon>
                  <ListItemText primary={rule} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {showRejectForm && (
          <Box sx={{ mt: 3 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Rejection Reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Please provide a clear reason for rejecting this property..."
              required
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {!showRejectForm ? (
          <>
            <Button 
              onClick={() => setShowRejectForm(true)}
              color="error"
              startIcon={<CloseIcon />}
            >
              Reject
            </Button>
            <Button 
              onClick={handleApprove}
              color="success"
              variant="contained"
              startIcon={<CheckIcon />}
            >
              Approve
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => setShowRejectForm(false)}>Cancel</Button>
            <Button 
              onClick={handleReject}
              color="error"
              variant="contained"
              disabled={!rejectReason.trim()}
            >
              Confirm Rejection
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

const AdminNewListings = () => {
  const [pendingProperties, setPendingProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchPendingProperties();
  }, []);

  const fetchPendingProperties = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const data = await getPendingProperties(token);
      setPendingProperties(data);
    } catch (error) {
      console.error('Error fetching pending properties:', error);
      setSnackbarMessage('Error fetching pending properties');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProperty = (property) => {
    setSelectedProperty(property);
    setDialogOpen(true);
  };

  const handleApproveProperty = async (propertyId) => {
    try {
      const token = localStorage.getItem('token');
      await approveProperty(propertyId, token);
      setSnackbarMessage('Property approved successfully');
      setSnackbarOpen(true);
      setPendingProperties(prev => prev.filter(p => p.id !== propertyId));
    } catch (error) {
      console.error('Error approving property:', error);
      setSnackbarMessage('Error approving property');
      setSnackbarOpen(true);
    }
  };

  const handleRejectProperty = async (propertyId, reason) => {
    try {
      const token = localStorage.getItem('token');
      await rejectProperty(propertyId, reason, token);
      setSnackbarMessage('Property rejected');
      setSnackbarOpen(true);
      setPendingProperties(prev => prev.filter(p => p.id !== propertyId));
    } catch (error) {
      console.error('Error rejecting property:', error);
      setSnackbarMessage('Error rejecting property');
      setSnackbarOpen(true);
    }
  };

  const handleNavigateToProperty = (propertyId) => {
    navigate(`/property/${propertyId}`);
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        New Property Listings
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Review and approve new property submissions from property owners.
      </Typography>

      {loading ? (
        <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
          Loading pending properties...
        </Typography>
      ) : pendingProperties.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography variant="h6" color="text.secondary">
            No pending properties to review
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            New property submissions will appear here for your review.
          </Typography>
        </Box>
      ) : (
        <>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>{pendingProperties.length}</strong> propert{pendingProperties.length > 1 ? 'ies' : 'y'} awaiting your review.
              Review each submission carefully before approving.
            </Typography>
          </Alert>

          <Grid container spacing={3}>
            {pendingProperties.map((property) => {
              const amenities = safeParse(property.amenities);
              const facilities = safeParse(property.facilities);
              const images = safeParse(property.images);
              const primaryImage = images && images.length > 0 ? images[0] : Room;

              return (
                <Grid item xs={12} sm={6} md={4} key={property.id}>
                  <Card sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3
                    }
                  }}>
                    <CardMedia
                      component="img"
                      height="180"
                      image={primaryImage}
                      alt={property.property_type}
                      sx={{ objectFit: 'cover' }}
                    />
                    
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" component="h3">
                          {property.property_type}
                        </Typography>
                        <Chip 
                          label="Pending Review" 
                          color="warning" 
                          size="small" 
                        />
                      </Box>

                      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                        {property.unit_type}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOnIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {property.address}
                        </Typography>
                      </Box>

                      <Typography variant="h6" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
                        LKR {parseFloat(property.price || 0).toLocaleString()}/month
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                        <Box display="flex" alignItems="center">
                          <HotelIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {facilities?.Bedroom || facilities?.bedroom || 0}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center">
                          <BathtubIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {facilities?.Bathroom || facilities?.bathroom || 0}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center">
                          <Typography variant="body2">
                            {amenities?.length || 0} amenities
                          </Typography>
                        </Box>
                      </Box>

                      <Typography variant="caption" color="text.secondary">
                        Submitted: {new Date(property.created_at).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                    
                    <CardActions>
                      <Button 
                        size="small" 
                        color="primary" 
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewProperty(property)}
                        fullWidth
                      >
                        View Details
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </>
      )}

      <PropertyDetailsDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        property={selectedProperty}
        onApprove={handleApproveProperty}
        onReject={handleRejectProperty}
      />

      <AppSnackbar
        open={snackbarOpen}
        message={snackbarMessage}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
      />
    </Container>
  );
};

export default AdminNewListings;