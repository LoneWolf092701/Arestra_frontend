import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  TextField,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  LocationOn as LocationIcon,
  Bed as BedIcon,
  Bathtub as BathtubIcon,
  Visibility as ViewsIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Work as WorkIcon,
  Rule as RuleIcon,
  Policy as PolicyIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { getPropertyDetailsAdmin, approveProperty, rejectProperty, deletePropertyAdmin } from '../../api/adminAPI';
import AppSnackbar from '../../components/common/AppSnackbar';

const AdminPropertyView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    fetchPropertyDetails();
  }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      const data = await getPropertyDetailsAdmin(id);
      setProperty(data);
    } catch (error) {
      console.error('Error fetching property details:', error);
      setSnackbarMessage('Error loading property details');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const parseJsonField = (field) => {
    if (!field) return null;
    if (typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch {
        return null;
      }
    }
    return field;
  };

  const handleApprove = async () => {
    try {
      await approveProperty(id);
      setSnackbarMessage('Property approved successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      fetchPropertyDetails();
    } catch (error) {
      setSnackbarMessage('Error approving property');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setSnackbarMessage('Please provide a rejection reason');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      await rejectProperty(id, rejectReason);
      setSnackbarMessage('Property rejected successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setShowRejectForm(false);
      setRejectReason('');
      fetchPropertyDetails();
    } catch (error) {
      setSnackbarMessage('Error rejecting property');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      try {
        await deletePropertyAdmin(id, 'Deleted by admin');
        setSnackbarMessage('Property deleted successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        navigate('/admin/all-properties');
      } catch (error) {
        setSnackbarMessage('Error deleting property');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6">Loading property details...</Typography>
      </Container>
    );
  }

  if (!property) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6">Property not found</Typography>
        <Button onClick={() => navigate('/admin/all-properties')} sx={{ mt: 2 }}>
          Back to All Properties
        </Button>
      </Container>
    );
  }

  const amenities = parseJsonField(property.amenities);
  const facilities = parseJsonField(property.facilities);
  const rules = parseJsonField(property.rules);
  const roommates = parseJsonField(property.roommates);
  const contractPolicy = property.contract_policy || property.contractPolicy;
  const images = parseJsonField(property.images);

  const primaryImage = images && images.length > 0 ? 
    (typeof images[0] === 'string' ? images[0] : images[0]?.url || images[0]?.path) : 
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/all-properties')}
          sx={{ mr: 2 }}
        >
          Back to All Properties
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Property Details - Admin Review
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <img
              src={primaryImage}
              alt={property.property_type}
              style={{ width: '100%', height: '400px', objectFit: 'cover' }}
            />
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {property.property_type} - {property.unit_type}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1">{property.address}</Typography>
              </Box>

              <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold', mb: 2 }}>
                LKR {property.price?.toLocaleString() || 'N/A'}/month
              </Typography>

              <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                <Box display="flex" alignItems="center">
                  <BedIcon sx={{ mr: 0.5 }} />
                  <Typography>{property.bedrooms || facilities?.Bedroom || 0} Beds</Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <BathtubIcon sx={{ mr: 0.5 }} />
                  <Typography>{property.bathrooms || facilities?.Bathroom || 0} Baths</Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <ViewsIcon sx={{ mr: 0.5 }} />
                  <Typography>{property.views_count || 0} Views</Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {property.description && (
                <>
                  <Typography variant="h6" gutterBottom>Description</Typography>
                  <Typography variant="body1" paragraph>{property.description}</Typography>
                  <Divider sx={{ my: 2 }} />
                </>
              )}

              {facilities && Object.keys(facilities).length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom>Property Details</Typography>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    {Object.entries(facilities).map(([facility, count]) => {
                      if (count > 0) {
                        return (
                          <Grid item xs={6} sm={4} key={facility}>
                            <Typography variant="body2">
                              <strong>{count}</strong> {facility.replace(/([A-Z])/g, ' $1').trim()}
                            </Typography>
                          </Grid>
                        );
                      }
                      return null;
                    })}
                  </Grid>
                  <Divider sx={{ my: 2 }} />
                </>
              )}

              {amenities && Object.keys(amenities).length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom>Amenities</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {Object.entries(amenities).map(([amenity, quantity]) => {
                      if (quantity > 0) {
                        return (
                          <Chip 
                            key={amenity} 
                            label={quantity > 1 ? `${amenity} (${quantity})` : amenity} 
                            variant="outlined" 
                          />
                        );
                      }
                      return null;
                    })}
                  </Box>
                  <Divider sx={{ my: 2 }} />
                </>
              )}

              {roommates && roommates.length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon />
                    Roommate Information
                  </Typography>
                  {roommates.map((roommate, index) => (
                    <Accordion key={index} sx={{ mb: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1">Roommate {index + 1}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <WorkIcon color="action" />
                              <Box>
                                <Typography variant="body2" color="text.secondary">Occupation</Typography>
                                <Typography variant="body1" fontWeight="medium">
                                  {roommate.occupation || 'Not specified'}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <WorkIcon color="action" />
                              <Box>
                                <Typography variant="body2" color="text.secondary">Field/Industry</Typography>
                                <Typography variant="body1" fontWeight="medium">
                                  {roommate.field || 'Not specified'}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                  <Divider sx={{ my: 2 }} />
                </>
              )}

              {rules && rules.length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <RuleIcon />
                    House Rules
                  </Typography>
                  <List dense>
                    {rules.filter(rule => rule && rule.trim()).map((rule, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <InfoIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                        </ListItemIcon>
                        <ListItemText primary={<Typography variant="body2">{rule}</Typography>} />
                      </ListItem>
                    ))}
                  </List>
                  <Divider sx={{ my: 2 }} />
                </>
              )}

              {contractPolicy && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PolicyIcon />
                    Contract Policy
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
                    {contractPolicy}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                </>
              )}

              <Typography variant="h6" gutterBottom>Availability</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Available From</Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {property.available_from ? 
                      new Date(property.available_from).toLocaleDateString() : 
                      'Immediately'
                    }
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Available Until</Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {property.available_to ? 
                      new Date(property.available_to).toLocaleDateString() : 
                      'No end date'
                    }
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Approval Status
              </Typography>
              <Chip 
                label={property.approval_status?.toUpperCase() || 'PENDING'} 
                color={
                  property.approval_status === 'approved' ? 'success' :
                  property.approval_status === 'pending' ? 'warning' : 'error'
                }
                sx={{ mb: 2 }}
              />
              
              {property.approval_status === 'pending' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<ApproveIcon />}
                    onClick={handleApprove}
                    fullWidth
                  >
                    Approve Property
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<RejectIcon />}
                    onClick={() => setShowRejectForm(true)}
                    fullWidth
                  >
                    Reject Property
                  </Button>
                </Box>
              )}

              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
                fullWidth
                sx={{ mt: 2 }}
              >
                Delete Property
              </Button>
            </CardContent>
          </Card>

          {property.owner_info && (
            <Card>
              <CardContent>
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
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      <Dialog open={showRejectForm} onClose={() => setShowRejectForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Property</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Rejection Reason"
            fullWidth
            multiline
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Please provide a clear reason for rejecting this property..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRejectForm(false)}>Cancel</Button>
          <Button onClick={handleReject} variant="contained" color="error">
            Reject Property
          </Button>
        </DialogActions>
      </Dialog>

      <AppSnackbar
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={() => setSnackbarOpen(false)}
      />
    </Container>
  );
};

export default AdminPropertyView;