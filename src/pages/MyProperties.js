import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Box,
  Button,
  Chip,
  Avatar,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Skeleton
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  AttachMoney as PriceIcon,
  CalendarToday as CalendarIcon,
  Hotel as BedroomIcon,
  Bathtub as BathroomIcon,
  CheckCircle as ApprovedIcon,
  Pending as PendingIcon,
  Cancel as RejectedIcon,
  Rule as RuleIcon,
  Description as PolicyIcon,
  Group as RoommateIcon,
  Receipt as BillIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { getMyProperties, deleteProperty } from '../api/propertyApi';
import { ThemeContext } from '../contexts/ThemeContext';
import AppSnackbar from '../components/common/AppSnackbar';

const MyProperties = () => {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await getMyProperties();
        setProperties(response.properties || []);
      } catch (error) {
        console.error('Error fetching properties:', error);
        setError('Failed to load properties. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const handleAddProperty = () => {
    navigate('/add-property');
  };

  const handleEditProperty = (propertyId) => {
    navigate(`/update-property/${propertyId}`);
  };

  const handleViewProperty = (property) => {
    setSelectedProperty(property);
    setViewDialogOpen(true);
  };

  const handleDeleteClick = (property) => {
    setPropertyToDelete(property);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteProperty(propertyToDelete.id);
      setProperties(prev => prev.filter(p => p.id !== propertyToDelete.id));
      setSnackbar({
        open: true,
        message: 'Property deleted successfully',
        severity: 'success'
      });
      setDeleteDialogOpen(false);
      setPropertyToDelete(null);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to delete property',
        severity: 'error'
      });
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    return dayjs(dateString).format('MMM DD, YYYY');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <ApprovedIcon color="success" />;
      case 'rejected':
        return <RejectedIcon color="error" />;
      case 'pending':
        return <PendingIcon color="warning" />;
      default:
        return <PendingIcon color="warning" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const PropertyCard = ({ property }) => {
    const images = property.images || [];
    const amenities = property.amenities || {};
    const facilities = property.facilities || {};
    const roommates = property.roommates || [];
    const rules = property.rules || [];
    const billsInclusive = property.bills_inclusive || [];

    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: theme.surface }}>
        <Box sx={{ position: 'relative' }}>
          {images.length > 0 ? (
            <Box
              component="img"
              src={images[0]?.url}
              alt="Property"
              sx={{
                width: '100%',
                height: 200,
                objectFit: 'cover'
              }}
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: 200,
                backgroundColor: theme.secondary + '20',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No Image
              </Typography>
            </Box>
          )}
          <Chip
            icon={getStatusIcon(property.approval_status)}
            label={property.approval_status?.toUpperCase()}
            color={getStatusColor(property.approval_status)}
            size="small"
            sx={{ position: 'absolute', top: 8, right: 8 }}
          />
        </Box>

        <CardContent sx={{ flexGrow: 1, p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: theme.textPrimary }}>
            {property.property_type} - {property.unit_type}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LocationIcon sx={{ fontSize: 16, mr: 1, color: theme.primary }} />
            <Typography variant="body2" color="text.secondary" noWrap>
              {property.address}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PriceIcon sx={{ fontSize: 16, mr: 0.5, color: theme.primary }} />
              <Typography variant="h6" color="primary" fontWeight="bold">
                {formatPrice(property.price)}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              /month
            </Typography>
          </Box>

          <Grid container spacing={1} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BedroomIcon sx={{ fontSize: 14, mr: 0.5 }} />
                <Typography variant="body2">
                  {property.bedrooms || facilities.Bedroom || 0} Bed
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BathroomIcon sx={{ fontSize: 14, mr: 0.5 }} />
                <Typography variant="body2">
                  {property.bathrooms || facilities.Bathroom || 0} Bath
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Available from: {formatDate(property.available_from)}
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {Object.keys(amenities).slice(0, 3).map((amenity) => (
              <Chip key={amenity} label={amenity} size="small" variant="outlined" />
            ))}
            {Object.keys(amenities).length > 3 && (
              <Chip 
                label={`+${Object.keys(amenities).length - 3} more`} 
                size="small" 
                variant="outlined"
                color="primary"
              />
            )}
          </Box>

          {roommates.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <RoommateIcon sx={{ fontSize: 14, mr: 0.5, color: theme.primary }} />
              <Typography variant="body2" color="text.secondary">
                {roommates.length} Roommate{roommates.length > 1 ? 's' : ''}
              </Typography>
            </Box>
          )}

          {rules.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <RuleIcon sx={{ fontSize: 14, mr: 0.5, color: theme.primary }} />
              <Typography variant="body2" color="text.secondary">
                {rules.length} House Rule{rules.length > 1 ? 's' : ''}
              </Typography>
            </Box>
          )}

          {billsInclusive.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <BillIcon sx={{ fontSize: 14, mr: 0.5, color: theme.primary }} />
              <Typography variant="body2" color="text.secondary">
                {billsInclusive.length} Bill{billsInclusive.length > 1 ? 's' : ''} Included
              </Typography>
            </Box>
          )}
        </CardContent>

        <CardActions sx={{ p: 2, pt: 0 }}>
          <Button
            size="small"
            startIcon={<ViewIcon />}
            onClick={() => handleViewProperty(property)}
          >
            View Details
          </Button>
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={() => handleEditProperty(property.id)}
          >
            Edit
          </Button>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDeleteClick(property)}
          >
            <DeleteIcon />
          </IconButton>
        </CardActions>
      </Card>
    );
  };

  const PropertyDetailsDialog = ({ property, open, onClose }) => {
    if (!property) return null;

    const amenities = property.amenities || {};
    const facilities = property.facilities || {};
    const roommates = property.roommates || [];
    const rules = property.rules || [];
    const billsInclusive = property.bills_inclusive || [];

    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6">
            {property.property_type} - {property.unit_type}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {property.address}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" gutterBottom>Price</Typography>
              <Typography variant="h6" color="primary">
                {formatPrice(property.price)} /month
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" gutterBottom>Status</Typography>
              <Chip
                label={property.approval_status?.toUpperCase()}
                color={getStatusColor(property.approval_status)}
                size="small"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom>Description</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {property.description}
          </Typography>

          {Object.keys(amenities).length > 0 && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">
                  Amenities ({Object.keys(amenities).length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {Object.entries(amenities).map(([amenity, quantity]) => (
                    <Chip
                      key={amenity}
                      label={`${amenity}${quantity > 1 ? ` (${quantity})` : ''}`}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          )}

          {roommates.length > 0 && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">
                  Roommates ({roommates.length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  {roommates.map((roommate, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: theme.primary }}>
                          <PersonIcon sx={{ fontSize: 20 }} />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={roommate.occupation || 'Not specified'}
                        secondary={roommate.field || 'Field not specified'}
                      />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          )}

          {rules.length > 0 && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">
                  House Rules ({rules.length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  {rules.map((rule, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={`• ${rule}`} />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          )}

          {property.contract_policy && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">Contract & Policy</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">{property.contract_policy}</Typography>
              </AccordionDetails>
            </Accordion>
          )}

          {billsInclusive.length > 0 && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">
                  Bills Included ({billsInclusive.length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {billsInclusive.map((bill, index) => (
                    <Chip
                      key={index}
                      label={bill}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
          <Button variant="contained" onClick={() => handleEditProperty(property.id)}>
            Edit Property
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item}>
              <Card sx={{ height: 400 }}>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={30} sx={{ mb: 1 }} />
                  <Skeleton variant="text" height={20} sx={{ mb: 2 }} />
                  <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
                  <Skeleton variant="text" height={20} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: theme.background, minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: theme.textPrimary }}>
            My Properties
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddProperty}
            sx={{
              backgroundColor: theme.primary,
              '&:hover': {
                backgroundColor: theme.secondary,
              },
            }}
          >
            Add New Property
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {properties.length === 0 && !loading && !error ? (
          <Card sx={{ textAlign: 'center', py: 8 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                No Properties Found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                You haven't added any properties yet. Get started by adding your first property.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddProperty}
                sx={{
                  backgroundColor: theme.primary,
                  '&:hover': {
                    backgroundColor: theme.secondary,
                  },
                }}
              >
                Add Your First Property
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {properties.map((property) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={property.id}>
                <PropertyCard property={property} />
              </Grid>
            ))}
          </Grid>
        )}

        <PropertyDetailsDialog
          property={selectedProperty}
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
        />

        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete Property</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this property? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <AppSnackbar
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        />
      </Container>
    </Box>
  );
};

export default MyProperties;