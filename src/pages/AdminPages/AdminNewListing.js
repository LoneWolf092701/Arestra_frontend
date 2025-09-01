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
import KitchenIcon from '@mui/icons-material/Kitchen';
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

  const amenities = property.amenities ? 
  Object.entries(property.amenities)
    .filter(([key, value]) => value === 1 || value === true)
    .map(([key]) => key) : [];

    const facilities = property.facilities ? 
  Object.entries(property.facilities)
    .filter(([key, value]) => value === 1 || value === true)
    .map(([key]) => key) : [];

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
      onClose();
      setRejectReason('');
      setShowRejectForm(false); // FIX: Complete function name instead of "setSh"
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Property Review</Typography>
          <Chip 
            label="Pending Review" 
            color="warning" 
            size="small" 
          />
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Property Images */}
          {images && images.length > 0 && (
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>Property Images</Typography>
                <Grid container spacing={1}>
                  {images.slice(0, 4).map((image, index) => (
                    <Grid item xs={6} sm={3} key={index}>
                      <Card>
                        <CardMedia
                          component="img"
                          height="120"
                          image={image}
                          alt={`Property image ${index + 1}`}
                          sx={{ objectFit: 'cover' }}
                        />
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                {images.length > 4 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    +{images.length - 4} more images
                  </Typography>
                )}
              </Box>
            </Grid>
          )}

          {/* Basic Property Information */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Property Details</Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <InfoIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Property Type" 
                  secondary={property.property_type} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <InfoIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Unit Type" 
                  secondary={property.unit_type} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LocationOnIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Address" 
                  secondary={property.address} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <AttachMoneyIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Price" 
                  secondary={`LKR ${property.price}`} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CalendarTodayIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Available From" 
                  secondary={property.available_from ? new Date(property.available_from).toLocaleDateString() : 'Not specified'} 
                />
              </ListItem>
            </List>
          </Grid>

        {/* Facility Information */}
<Grid item xs={12} md={6}>
  <Typography variant="h6" gutterBottom>Facilities</Typography>
  <List dense>
    <ListItem>
      <ListItemIcon>
        <HotelIcon />
      </ListItemIcon>
      <ListItemText 
        primary="Bedrooms" 
        secondary={property.bedrooms || 'Not specified'} 
      />
    </ListItem>
    <ListItem>
      <ListItemIcon>
        <BathtubIcon />
      </ListItemIcon>
      <ListItemText 
        primary="Bathrooms" 
        secondary={property.bathrooms || 'Not specified'} 
      />
    </ListItem>
    <ListItem>
  <ListItemIcon>
    <KitchenIcon />
  </ListItemIcon>
  <ListItemText 
    primary="Kitchen" 
    secondary={typeof property.facilities?.Kitchen === 'number' ? property.facilities.Kitchen : 'Not specified'} 
  />
</ListItem>
  </List>
</Grid>

          {/* Amenities */}
          {amenities && amenities.length > 0 && (
  <Grid item xs={12}>
    <Typography variant="h6" gutterBottom>Amenities</Typography>
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {amenities.map((amenity, index) => (
        <Chip 
          key={index} 
          label={amenity} 
          size="small" 
          color="primary"
        />
      ))}
    </Box>
  </Grid>
)}

          {/* Facilities */}
{facilities && facilities.length > 0 && (
  <Grid item xs={12}>
    <Typography variant="h6" gutterBottom>Facilities</Typography>
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {facilities.map((facility, index) => (
        <Chip 
          key={index} 
          label={facility} 
          size="small" 
          color="primary"
        />
      ))}
    </Box>
  </Grid>
)}
          {/* Property Description */}
          {property.description && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Description</Typography>
              <Typography variant="body2" color="text.secondary">
                {property.description}
              </Typography>
            </Grid>
          )}

          {/* House Rules */}
          {rules && rules.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>House Rules</Typography>
              <List dense>
                {rules.map((rule, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={rule} />
                  </ListItem>
                ))}
              </List>
            </Grid>
          )}

          {/* Roommate Information */}
          {roommates && roommates.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Roommate Information</Typography>
              <List dense>
                {roommates.map((roommate, index) => (
                  <ListItem key={index}>
                    <ListItemText 
                      primary={`${roommate.name} (${roommate.age} years)`} 
                      secondary={`Gender: ${roommate.gender}, Occupation: ${roommate.occupation}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
          )}

          {/* Bills Inclusive Information */}
          {billsInclusive && billsInclusive.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Bills Included</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {billsInclusive.map((bill, index) => (
                  <Chip 
                    key={index} 
                    label={bill} 
                    size="small" 
                    color="primary"
                  />
                ))}
              </Box>
            </Grid>
          )}

          {/* Owner Information */}
          {property.owner_info && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Property Owner</Typography>
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Username" 
                    secondary={property.owner_info.username} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Email" 
                    secondary={property.owner_info.email} 
                  />
                </ListItem>
                {property.owner_info.business_name && (
                  <ListItem>
                    <ListItemText 
                      primary="Business Name" 
                      secondary={property.owner_info.business_name} 
                    />
                  </ListItem>
                )}
                {property.owner_info.phone && (
                  <ListItem>
                    <ListItemText 
                      primary="Phone" 
                      secondary={property.owner_info.phone} 
                    />
                  </ListItem>
                )}
              </List>
            </Grid>
          )}

          {/* Rejection Form */}
          {showRejectForm && (
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom color="error">
                Reject Property
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Reason for Rejection"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Please provide a clear reason for rejecting this property..."
                required
              />
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions>
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
      const response = await getPendingProperties({ page: 1, limit: 50 });
      setPendingProperties(response?.pending_properties || []);
    } catch (error) {
      console.error('Error fetching pending properties:', error);
      setSnackbarMessage('Error fetching pending properties');
      setSnackbarOpen(true);
      setPendingProperties([]);
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
      await approveProperty(propertyId);
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
      await rejectProperty(propertyId, reason);
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
              const primaryImage = images && images.length > 0 ? 
                images[0] : Room;

              return (
                <Grid item xs={12} sm={6} md={4} key={property.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={primaryImage}
                      alt={property.property_type}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography gutterBottom variant="h6" component="div" noWrap>
                          {property.property_type}
                        </Typography>
                        <Chip label={property.unit_type} size="small" color="primary" />
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOnIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }} noWrap>
                          {property.address}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AttachMoneyIcon fontSize="small" color="action" />
                        <Typography variant="h6" color="primary" sx={{ ml: 0.5 }}>
                          LKR {property.price?.toLocaleString()}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        {property.bedrooms && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <HotelIcon fontSize="small" color="action" />
                            <Typography variant="body2" sx={{ ml: 0.5 }}>
                              {property.bedrooms}
                            </Typography>
                          </Box>
                        )}
                        {property.bathrooms && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <BathtubIcon fontSize="small" color="action" />
                            <Typography variant="body2" sx={{ ml: 0.5 }}>
                              {property.bathrooms}
                            </Typography>
                          </Box>
                        )}
                        {property.occupancy && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PeopleIcon fontSize="small" color="action" />
                            <Typography variant="body2" sx={{ ml: 0.5 }}>
                              {property.occupancy}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CalendarTodayIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                          Available: {property.available_from ? 
                            new Date(property.available_from).toLocaleDateString() : 
                            'Not specified'
                          }
                        </Typography>
                      </Box>

                      {amenities && amenities.length > 0 && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            {amenities.slice(0, 3).join(', ')}
                            {amenities.length > 3 && ` +${amenities.length - 3} more`}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>

                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button 
                        size="small" 
                        onClick={() => handleViewProperty(property)}
                        startIcon={<VisibilityIcon />}
                      >
                        Review
                      </Button>
                      <Button 
                        size="small" 
                        color="success"
                        onClick={() => handleApproveProperty(property.id)}
                        startIcon={<CheckIcon />}
                      >
                        Quick Approve
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
        onClose={() => setSnackbarOpen(false)}
      />
    </Container>
  );
};

export default AdminNewListings;