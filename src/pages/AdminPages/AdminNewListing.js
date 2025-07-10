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
  Alert
} from '@mui/material';
import HotelIcon from '@mui/icons-material/Hotel';
import BathtubIcon from '@mui/icons-material/Bathtub';
import PeopleIcon from '@mui/icons-material/People';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { getPendingProperties, approveProperty, rejectProperty } from '../../api/adminAPI';
import AppSnackbar from '../../components/common/AppSnackbar';

// Helper function to safely parse JSON strings
const safeParse = (str) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    return [];
  }
};

// Component for displaying property details in a dialog
const PropertyDetailsDialog = ({ open, onClose, property, onApprove, onReject }) => {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  if (!property) return null;

  const amenities = safeParse(property.amenities);
  const facilities = safeParse(property.facilities);
  const roommates = safeParse(property.roommates);
  const rules = safeParse(property.rules);
  const billsInclusive = safeParse(property.bills_inclusive);
  const priceRange = safeParse(property.price_range);

  const handleApprove = () => {
    onApprove(property.id);
    onClose();
  };

  const handleReject = () => {
    if (rejectReason.trim()) {
      onReject(property.id, rejectReason);
      onClose();
      setRejectReason('');
      setShowRejectForm(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">
            {property.property_type} - {property.unit_type}
          </Typography>
          <Chip 
            label="Pending Review" 
            color="warning" 
            variant="outlined"
          />
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {/* Basic Information */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom color="primary">
            Basic Information
          </Typography>
          <Typography variant="body1">
            <strong>Address:</strong> {property.address}
          </Typography>
          <Typography variant="body1">
            <strong>Available:</strong> {formatDate(property.available_from)} – {formatDate(property.available_to)}
          </Typography>
          {priceRange?.length === 2 && (
            <Typography variant="body1">
              <strong>Price Range:</strong> LKR {priceRange[0]} - {priceRange[1]}
            </Typography>
          )}
        </Box>

        {/* Facilities */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom color="primary">
            Facilities
          </Typography>
          <Box display="flex" gap={3}>
            <Box display="flex" alignItems="center">
              <HotelIcon sx={{ mr: 1 }} />
              <Typography variant="body1">
                {facilities?.Bedroom || 0} Bedrooms
              </Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <BathtubIcon sx={{ mr: 1 }} />
              <Typography variant="body1">
                {facilities?.Bathroom || 0} Bathrooms
              </Typography>
            </Box>
          </Box>
          {property.other_facility && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Other Facilities:</strong> {property.other_facility}
            </Typography>
          )}
        </Box>

        {/* Amenities */}
        {amenities?.length > 0 && (
          <Box mb={3}>
            <Typography variant="h6" gutterBottom color="primary">
              Amenities
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {amenities.map((amenity, index) => (
                <Chip key={index} label={amenity} variant="outlined" size="small" />
              ))}
            </Box>
          </Box>
        )}

        {/* Roommates */}
        {roommates?.length > 0 && (
          <Box mb={3}>
            <Typography variant="h6" gutterBottom color="primary">
              Current Roommates
            </Typography>
            {roommates.map((roommate, index) => (
              <Typography key={index} variant="body2">
                • {roommate.occupation} in {roommate.field}
              </Typography>
            ))}
          </Box>
        )}

        {/* Rules */}
        {rules?.length > 0 && (
          <Box mb={3}>
            <Typography variant="h6" gutterBottom color="primary">
              House Rules
            </Typography>
            {rules.map((rule, index) => (
              <Typography key={index} variant="body2">
                • {rule}
              </Typography>
            ))}
          </Box>
        )}

        {/* Contract Policy */}
        {property.contract_policy && (
          <Box mb={3}>
            <Typography variant="h6" gutterBottom color="primary">
              Contract Policy
            </Typography>
            <Typography variant="body2">
              {property.contract_policy}
            </Typography>
          </Box>
        )}

        {/* Bills Inclusive */}
        {billsInclusive?.length > 0 && (
          <Box mb={3}>
            <Typography variant="h6" gutterBottom color="primary">
              Bills Included
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {billsInclusive.map((bill, index) => (
                <Chip key={index} label={bill} color="success" variant="outlined" size="small" />
              ))}
            </Box>
          </Box>
        )}

        {/* Reject Form */}
        {showRejectForm && (
          <Box mt={3}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Please provide a reason for rejecting this property listing.
            </Alert>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Rejection Reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explain why this property cannot be approved..."
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
        <Button 
          onClick={() => setShowRejectForm(!showRejectForm)} 
          color="error"
          startIcon={<CloseIcon />}
        >
          {showRejectForm ? 'Cancel Reject' : 'Reject'}
        </Button>
        {showRejectForm ? (
          <Button 
            onClick={handleReject} 
            color="error" 
            variant="contained"
            disabled={!rejectReason.trim()}
          >
            Confirm Rejection
          </Button>
        ) : (
          <Button 
            onClick={handleApprove} 
            color="success" 
            variant="contained"
            startIcon={<CheckIcon />}
          >
            Approve
          </Button>
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

  // Fetch pending properties on component mount
  useEffect(() => {
    fetchPendingProperties();
  }, []);

  const fetchPendingProperties = async () => {
    setLoading(true);
    try {
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
      setSnackbarMessage('Property approved successfully!');
      setSnackbarOpen(true);
      // Remove from pending list
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
      setSnackbarMessage('Property rejected successfully');
      setSnackbarOpen(true);
      // Remove from pending list
      setPendingProperties(prev => prev.filter(p => p.id !== propertyId));
    } catch (error) {
      console.error('Error rejecting property:', error);
      setSnackbarMessage('Error rejecting property');
      setSnackbarOpen(true);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <Typography variant="h6">Loading pending properties...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumb */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Home / New Listings
      </Typography>

      <Typography variant="h4" align="center" gutterBottom>
        New Listings
      </Typography>
      
      <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
        Review and approve new property submissions from property owners
      </Typography>

      {pendingProperties.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography variant="h6" color="text.secondary">
            No new listings to review
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            All property submissions have been processed
          </Typography>
        </Box>
      ) : (
        <>
          <Typography variant="h6" sx={{ mb: 3 }}>
            {pendingProperties.length} Properties Awaiting Review
          </Typography>
          
          <Grid container spacing={3}>
            {pendingProperties.map((property) => {
              const amenities = safeParse(property.amenities);
              const facilities = safeParse(property.facilities);
              const priceRange = safeParse(property.price_range);

              return (
                <Grid item xs={12} sm={6} md={4} key={property.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardMedia
                      component="img"
                      height="140"
                      // image={property.image || 'https://via.placeholder.com/300x200'}
                      alt={property.property_type}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="h6" component="div">
                          {property.property_type}
                        </Typography>
                        <Chip label="Pending" color="warning" size="small" />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {property.unit_type}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Address:</strong> {property.address?.substring(0, 50)}...
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Available:</strong> {formatDate(property.available_from)} – {formatDate(property.available_to)}
                      </Typography>
                      
                      {priceRange?.length === 2 && (
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Price:</strong> LKR {priceRange[0]} - {priceRange[1]}
                        </Typography>
                      )}

                      {/* Property Stats */}
                      <Box display="flex" justifyContent="space-around" mt={2}>
                        <Box display="flex" alignItems="center">
                          <HotelIcon fontSize="small" />
                          <Typography variant="body2" ml={0.5}>
                            {facilities?.Bedroom || 0}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center">
                          <BathtubIcon fontSize="small" />
                          <Typography variant="body2" ml={0.5}>
                            {facilities?.Bathroom || 0}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center">
                          <Typography variant="body2">
                            {amenities?.length || 0} amenities
                          </Typography>
                        </Box>
                      </Box>
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

      {/* Property Details Dialog */}
      <PropertyDetailsDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        property={selectedProperty}
        onApprove={handleApproveProperty}
        onReject={handleRejectProperty}
      />

      {/* Snackbar for notifications */}
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