import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  LocationOn as LocationOnIcon,
  Bed as BedIcon,
  Bathtub as BathtubIcon,
  ViewComfy as ViewsIcon,
  Star as StarIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Home as HomeIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

import { getPropertyDetailsAdmin, approveRejectProperty } from '../../api/adminAPI';
import AppSnackbar from '../../components/common/AppSnackbar';
import Room from '../../assets/images/Room.jpg';

const safeParse = (jsonString, fallback = []) => {
  try {
    if (typeof jsonString === 'string') {
      return JSON.parse(jsonString);
    }
    return Array.isArray(jsonString) ? jsonString : fallback;
  } catch (error) {
    console.warn('Error parsing JSON:', error);
    return fallback;
  }
};

const ApprovalDialog = ({ open, onClose, action, onConfirm, property }) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (action === 'reject' && !reason.trim()) return;
    onConfirm(reason.trim());
    setReason('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {action === 'approve' ? 'Approve Property' : 'Reject Property'}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {action === 'approve' 
            ? 'Are you sure you want to approve this property? It will become visible to users.'
            : 'Are you sure you want to reject this property? Please provide a reason.'}
        </Typography>
        {property && (
          <Box sx={{ mb: 2, p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              {property.property_type} - {property.unit_type}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {property.address}
            </Typography>
          </Box>
        )}
        {action === 'reject' ? (
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Rejection reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please provide a detailed reason for rejection..."
            required
          />
        ) : (
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Approval notes (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Any additional notes for approval..."
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleConfirm} 
          color={action === 'approve' ? 'success' : 'error'}
          variant="contained"
          disabled={action === 'reject' && !reason.trim()}
        >
          {action === 'approve' ? 'Approve' : 'Reject'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const AdminPropertyView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPropertyDetails();
    }
  }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      const data = await getPropertyDetailsAdmin(id);
      setProperty(data);
    } catch (error) {
      console.error('Error fetching property details:', error);
      setSnackbarMessage('Error fetching property details');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalAction = (action) => {
    setDialogAction(action);
    setDialogOpen(true);
  };

  const handleConfirmAction = async (reason) => {
    try {
      setActionLoading(true);
      await approveRejectProperty(id, dialogAction, reason);
      setSnackbarMessage(`Property ${dialogAction}d successfully`);
      setSnackbarOpen(true);
      
      // Update local property state
      setProperty(prev => ({
        ...prev,
        approval_status: dialogAction === 'approve' ? 'approved' : 'rejected',
        is_active: dialogAction === 'approve' ? 1 : 0
      }));
    } catch (error) {
      console.error(`Error ${dialogAction}ing property:`, error);
      setSnackbarMessage(`Error ${dialogAction}ing property`);
      setSnackbarOpen(true);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircleIcon />;
      case 'pending': return <StarIcon />;
      case 'rejected': return <CancelIcon />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!property) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Property not found</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/all-properties')}
          sx={{ mt: 2 }}
        >
          Back to Properties
        </Button>
      </Container>
    );
  }

  const amenities = safeParse(property.amenities);
  const facilities = safeParse(property.facilities);
  const images = safeParse(property.images);

  return (
    <Container sx={{ mt: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/all-properties')}
          sx={{ mr: 2 }}
        >
          Back to Properties
        </Button>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Property Details - Admin View
        </Typography>
        <Chip 
          icon={getStatusIcon(property.approval_status)}
          label={property.approval_status?.toUpperCase() || 'UNKNOWN'}
          color={getStatusColor(property.approval_status)}
          size="large"
        />
      </Box>

      {/* Action Buttons */}
      {property.approval_status === 'pending' && (
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckIcon />}
            onClick={() => handleApprovalAction('approve')}
            disabled={actionLoading}
          >
            Approve Property
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<CloseIcon />}
            onClick={() => handleApprovalAction('reject')}
            disabled={actionLoading}
          >
            Reject Property
          </Button>
        </Box>
      )}

      <Grid container spacing={3}>
        {/* Property Images */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardMedia
              component="img"
              height="400"
              image={images.length > 0 ? 
                (typeof images[0] === 'string' ? images[0] : images[0]?.url || Room) : Room}
              alt={property.property_type}
              sx={{ objectFit: 'cover' }}
            />
            {images.length > 1 && (
              <Box sx={{ p: 2, display: 'flex', gap: 1, overflowX: 'auto' }}>
                {images.slice(1, 5).map((image, index) => (
                  <Box
                    key={index}
                    component="img"
                    src={typeof image === 'string' ? image : image?.url || Room}
                    alt={`${property.property_type} ${index + 2}`}
                    sx={{
                      width: 100,
                      height: 80,
                      objectFit: 'cover',
                      borderRadius: 1,
                      flexShrink: 0
                    }}
                  />
                ))}
                {images.length > 5 && (
                  <Box
                    sx={{
                      width: 100,
                      height: 80,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'grey.200',
                      borderRadius: 1,
                      flexShrink: 0
                    }}
                  >
                    <Typography variant="body2">
                      +{images.length - 5} more
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Card>
        </Grid>

        {/* Property Information */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 'fit-content' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {property.property_type}
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {property.unit_type}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationOnIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1">{property.address}</Typography>
              </Box>

              <Typography variant="h4" color="primary" sx={{ mb: 2 }}>
                LKR {parseInt(property.price || 0).toLocaleString()}
              </Typography>

              <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                <Box display="flex" alignItems="center">
                  <BedIcon sx={{ mr: 0.5 }} />
                  <Typography>{property.bedrooms || 0} Beds</Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <BathtubIcon sx={{ mr: 0.5 }} />
                  <Typography>{property.bathrooms || 0} Baths</Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <ViewsIcon sx={{ mr: 0.5 }} />
                  <Typography>{property.views_count || 0} Views</Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Owner Information */}
              {property.owner_info && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Property Owner
                  </Typography>
                  <List dense>
                    <ListItem disableGutters>
                      <ListItemIcon><PersonIcon /></ListItemIcon>
                      <ListItemText primary={property.owner_info.username} />
                    </ListItem>
                    <ListItem disableGutters>
                      <ListItemIcon><EmailIcon /></ListItemIcon>
                      <ListItemText primary={property.owner_info.email} />
                    </ListItem>
                    {property.owner_info.phone && (
                      <ListItem disableGutters>
                        <ListItemIcon><PhoneIcon /></ListItemIcon>
                        <ListItemText primary={property.owner_info.phone} />
                      </ListItem>
                    )}
                    {property.owner_info.business_name && (
                      <ListItem disableGutters>
                        <ListItemIcon><BusinessIcon /></ListItemIcon>
                        <ListItemText primary={property.owner_info.business_name} />
                      </ListItem>
                    )}
                  </List>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Description */}
        {property.description && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1">
                {property.description}
              </Typography>
            </Paper>
          </Grid>
        )}

        {/* Amenities */}
        {amenities.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Amenities
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {amenities.map((amenity, index) => (
                  <Chip key={index} label={amenity} variant="outlined" />
                ))}
              </Box>
            </Paper>
          </Grid>
        )}

        {/* Facilities */}
        {facilities.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Facilities
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {facilities.map((facility, index) => (
                  <Chip key={index} label={facility} variant="outlined" />
                ))}
              </Box>
            </Paper>
          </Grid>
        )}

        {/* Property Metadata */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Property Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Created</Typography>
                <Typography variant="body1">
                  {new Date(property.created_at).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Last Updated</Typography>
                <Typography variant="body1">
                  {new Date(property.updated_at).toLocaleDateString()}
                </Typography>
              </Grid>
              {property.available_from && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Available From</Typography>
                  <Typography variant="body1">
                    {new Date(property.available_from).toLocaleDateString()}
                  </Typography>
                </Grid>
              )}
              {property.available_to && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Available To</Typography>
                  <Typography variant="body1">
                    {new Date(property.available_to).toLocaleDateString()}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Approval Dialog */}
      <ApprovalDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        action={dialogAction}
        onConfirm={handleConfirmAction}
        property={property}
      />

      {/* Snackbar */}
      <AppSnackbar
        open={snackbarOpen}
        message={snackbarMessage}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
      />
    </Container>
  );
};

export default AdminPropertyView;