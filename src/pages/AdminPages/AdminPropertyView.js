import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Avatar,
  CardContent,
  IconButton
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Star as StarIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Bed as BedIcon,
  Bathtub as BathtubIcon,
  Visibility as ViewsIcon,
  ExpandMore as ExpandMoreIcon,
  Rule as RuleIcon,
  Description as PolicyIcon,
  Group as RoommateIcon,
  Home as HomeIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  WhatsApp as WhatsAppIcon
} from '@mui/icons-material';
import { getPropertyDetailsAdmin, approveRejectProperty } from '../../api/adminAPI';
import AppSnackbar from '../../components/common/AppSnackbar';
import Room from '../../assets/images/Room.jpg';
import MapSearch from '../../components/specific/MapSearch';

const ApprovalDialog = ({ open, onClose, onConfirm, action, loading }) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    onConfirm(reason);
    setReason('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {action === 'approve' ? 'Approve Property' : 'Reject Property'}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Are you sure you want to {action} this property?
        </Typography>
        {action === 'reject' && (
          <TextField
            label="Reason for rejection"
            multiline
            rows={4}
            fullWidth
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please provide a reason for rejecting this property..."
            required
          />
        )}
        {action === 'approve' && (
          <TextField
            label="Approval notes (optional)"
            multiline
            rows={3}
            fullWidth
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Any additional notes for the property owner..."
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
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

  const formatPhoneForWhatsApp = (phone) => {
  if (!phone) return null;
  return phone.replace(/\D/g, '');
};

const openWhatsApp = (phone, propertyTitle) => {
  if (!phone) return;
  const formattedPhone = formatPhoneForWhatsApp(phone);
  const message = encodeURIComponent(`Hi! I'm interested in the property: ${propertyTitle}`);
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${message}`;
  window.open(whatsappUrl, '_blank');
};

  const safeParse = (jsonString) => {
    try {
      return typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
    } catch (error) {
      console.warn('Error parsing JSON:', error);
      return {};
    }
  };
  
  const getAmenitiesForDisplay = (amenitiesData) => {
  if (!amenitiesData) return {};
  
  // If it's already an object, return as is
  if (typeof amenitiesData === 'object' && !Array.isArray(amenitiesData)) {
    return amenitiesData;
  }
  
  // If it's an array, convert to object format for this component
  if (Array.isArray(amenitiesData)) {
    const amenitiesObj = {};
    amenitiesData.forEach(amenity => {
      if (amenity && amenity.trim()) {
        amenitiesObj[amenity] = 1;
      }
    });
    return amenitiesObj;
  }
  
  // If it's a string, try to parse
  if (typeof amenitiesData === 'string') {
    try {
      const parsed = JSON.parse(amenitiesData);
      if (typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed;
      }
      if (Array.isArray(parsed)) {
        const amenitiesObj = {};
        parsed.forEach(amenity => {
          if (amenity && amenity.trim()) {
            amenitiesObj[amenity] = 1;
          }
        });
        return amenitiesObj;
      }
    } catch {
      // If parsing fails, treat as comma-separated string
      const amenitiesObj = {};
      amenitiesData.split(',').forEach(item => {
        const amenity = item.trim();
        if (amenity.length > 0) {
          amenitiesObj[amenity] = 1;
        }
      });
      return amenitiesObj;
    }
  }
  
  return {};
};

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

const amenities = getAmenitiesForDisplay(property.amenities);
  const facilities = safeParse(property.facilities);
  const images = safeParse(property.images);
  const rules = safeParse(property.rules);
  const roommates = safeParse(property.roommates);
  const billsInclusive = safeParse(property.bills_inclusive);

  return (
    <Container sx={{ mt: 4 }}>
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
                    alt={`Property image ${index + 2}`}
                    sx={{
                      width: 100,
                      height: 80,
                      objectFit: 'cover',
                      borderRadius: 1,
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </Box>
            )}
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
              {formatPrice(property.price)}
              <Typography component="span" variant="body2" sx={{ color: 'text.secondary', ml: 1 }}>
                / month
              </Typography>
            </Typography>

            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              {property.property_type} - {property.unit_type}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {property.address}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
              <Box display="flex" alignItems="center">
                <BedIcon sx={{ mr: 0.5 }} />
                <Typography>{facilities.Bedroom || 0} Beds</Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <BathtubIcon sx={{ mr: 0.5 }} />
                <Typography>{facilities.Bathroom || 0} Baths</Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <ViewsIcon sx={{ mr: 0.5 }} />
                <Typography>{property.views_count || 0} Views</Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

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
                  {/* {property.owner_info.phone && (
                    <ListItem disableGutters>
                      <ListItemIcon><PhoneIcon /></ListItemIcon>
                      <ListItemText primary={property.owner_info.phone} />
                    </ListItem>
                  )} */}
                  {property.owner_info.phone && (
  <ListItem disableGutters>
    <ListItemIcon><PhoneIcon /></ListItemIcon>
    <ListItemText primary={property.owner_info.phone} />
    <IconButton
      onClick={() => openWhatsApp(property.owner_info.phone, property.property_name)}
      sx={{ 
        color: '#25D366',
        '&:hover': { backgroundColor: 'rgba(37, 211, 102, 0.1)' }
      }}
      title="Contact on WhatsApp"
    >
      <WhatsAppIcon />
    </IconButton>
  </ListItem>
)}
                  {property.owner_info.business_name && (
                    <ListItem disableGutters>
                      <ListItemIcon><BusinessIcon /></ListItemIcon>
                      <ListItemText primary={property.owner_info.business_name} />
                    </ListItem>
                  )}
                </List>

                <Divider sx={{ my: 2 }} />
              </>
            )}

            <Typography variant="subtitle2" gutterBottom>
              Property Details
            </Typography>
            <List dense>
              <ListItem disableGutters>
                <ListItemText 
                  primary="Created"
                  secondary={formatDate(property.created_at)}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText 
                  primary="Available From"
                  secondary={formatDate(property.available_from)}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText 
                  primary="Available To"
                  secondary={formatDate(property.available_to)}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText 
                  primary="Status"
                  secondary={
                    <Chip 
                      label={property.approval_status?.toUpperCase() || 'UNKNOWN'}
                      color={getStatusColor(property.approval_status)}
                      size="small"
                    />
                  }
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              Property Information
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell><strong>Property Type</strong></TableCell>
                        <TableCell>{property.property_type}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Unit Type</strong></TableCell>
                        <TableCell>{property.unit_type}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Bedrooms</strong></TableCell>
                        <TableCell>{facilities.Bedroom || 'Not specified'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Bathrooms</strong></TableCell>
                        <TableCell>{facilities.Bathroom || 'Not specified'}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell><strong>Monthly Rent</strong></TableCell>
                        <TableCell>{formatPrice(property.price)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Available From</strong></TableCell>
                        <TableCell>{formatDate(property.available_from)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Available To</strong></TableCell>
                        <TableCell>{formatDate(property.available_to)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Property Status</strong></TableCell>
                        <TableCell>
                          <Chip 
                            label={property.is_active ? 'Active' : 'Inactive'} 
                            color={property.is_active ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>

            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Description
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.6 }}>
              {property.description}
            </Typography>

            {amenities && Object.keys(amenities).length > 0 && (
  <Accordion>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        Amenities ({Object.keys(amenities).length})
      </Typography>
    </AccordionSummary>
    <AccordionDetails>
      <Grid container spacing={2}>
        {Object.entries(amenities).map(([amenity, quantity], index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              p: 2,
              border: '1px solid #e0e0e0',
              borderRadius: 2
            }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {amenity}
              </Typography>
              <Chip 
                label={quantity || 1} 
                size="small" 
                color="primary"
              />
            </Box>
          </Grid>
        ))}
      </Grid>
    </AccordionDetails>
  </Accordion>
)}

            {facilities && Object.keys(facilities).length > 0 && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Facilities & Features
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {Object.entries(facilities).map(([facility, count], index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          p: 2,
                          border: '1px solid #e0e0e0',
                          borderRadius: 2
                        }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {facility}
                          </Typography>
                          <Chip 
                            label={count} 
                            size="small" 
                            color="primary"
                          />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            )}

            {rules && rules.length > 0 && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <RuleIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      House Rules ({rules.length})
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {rules.map((rule, index) => (
                      <ListItem key={index} divider={index < rules.length - 1}>
                        <ListItemIcon>
                          <RuleIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={rule}
                          primaryTypographyProps={{
                            variant: 'body2',
                            sx: { fontWeight: 500 }
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            )}

            {property.contract_policy && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PolicyIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Contract & Cancellation Policy
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Paper variant="outlined" sx={{ p: 3, backgroundColor: '#f9f9f9' }}>
                    <Typography variant="body2" sx={{ lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                      {property.contract_policy}
                    </Typography>
                  </Paper>
                </AccordionDetails>
              </Accordion>
            )}

            {property.property_type === 'Rooms' && roommates && roommates.length > 0 && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <RoommateIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Roommate Information ({roommates.length})
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    {roommates.map((roommate, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card variant="outlined" sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                              <PersonIcon />
                            </Avatar>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              Roommate {index + 1}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Occupation:</strong> {roommate.occupation || 'Not specified'}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Field/Industry:</strong> {roommate.field || 'Not specified'}
                          </Typography>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            )}

            {billsInclusive && billsInclusive.length > 0 && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Bills Included ({billsInclusive.length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {billsInclusive.map((bill, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Chip 
                          label={bill}
                          variant="outlined"
                          color="secondary"
                          sx={{ m: 0.5 }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            )}

            {property.other_facility && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Additional Facilities
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                    {property.other_facility}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            )}

            {property.approval_reason && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Admin Notes
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                  <Typography variant="body2">
                    {property.approval_reason}
                  </Typography>
                </Paper>
              </Box>
            )}
          </Paper>
        </Grid>

        {property.latitude && property.longitude && (
  <Card sx={{ mb: 3 }}>
    <CardContent>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
        <LocationIcon sx={{ mr: 1 }} />
        Property Location
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {property.address}
      </Typography>
      <MapSearch
        address={property.address}
        latitude={property.latitude}
        longitude={property.longitude}
        readonly={true}
        showSearch={false}
      />
    </CardContent>
  </Card>
)}

{/* Alternative: If coordinates aren't available but address exists */}
{(!property.latitude || !property.longitude) && property.address && (
  <Card sx={{ mb: 3 }}>
    <CardContent>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
        <LocationIcon sx={{ mr: 1 }} />
        Property Location
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        {property.address}
      </Typography>
      <Typography variant="body2" color="warning.main" sx={{ mb: 2 }}>
        ⚠️ Precise coordinates not available. Showing approximate location based on address.
      </Typography>
      <MapSearch
        address={property.address}
        readonly={true}
        showSearch={false}
      />
    </CardContent>
  </Card>
)}
      </Grid>

      <ApprovalDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleConfirmAction}
        action={dialogAction}
        loading={actionLoading}
      />

      <AppSnackbar
        open={snackbarOpen}
        message={snackbarMessage}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      />
    </Container>
  );
};

export default AdminPropertyView;