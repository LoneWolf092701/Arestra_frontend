import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia,
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
  ExpandMore as ExpandMoreIcon,
  Image as ImageIcon,
  BrokenImage as BrokenImageIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { getMyProperties, deleteProperty } from '../api/propertyApi';
import { ThemeContext } from '../contexts/ThemeContext';
import AppSnackbar from '../components/common/AppSnackbar';
import Room from '../assets/images/Room.jpg';

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
  const [imageErrors, setImageErrors] = useState(new Set());

  // Robust JSON parser with comprehensive error handling
  const safeJsonParse = (str, fallback = null) => {
    if (!str) return fallback;
    if (typeof str === 'object') return str;
    if (typeof str !== 'string') return fallback;
    
    try {
      const parsed = JSON.parse(str);
      return parsed !== null ? parsed : fallback;
    } catch (error) {
      console.warn('JSON parse error:', error, 'Input:', str);
      return fallback;
    }
  };

  // Comprehensive image URL resolver with multiple fallbacks
  const getImageUrl = (images, propertyId) => {
    console.log('=== getImageUrl Debug ===');
    console.log('Raw images input:', images);
    console.log('Property ID:', propertyId);
    
    const parsedImages = safeJsonParse(images, []);
    console.log('Parsed images:', parsedImages);
    console.log('Is array?', Array.isArray(parsedImages));
    console.log('Array length:', parsedImages?.length);
    
    if (!Array.isArray(parsedImages) || parsedImages.length === 0) {
      console.log('❌ No valid images array, using fallback');
      return Room;
    }

    const firstImage = parsedImages[0];
    console.log('First image:', firstImage);
    console.log('First image type:', typeof firstImage);
    
    // Check if it's a direct string URL
    if (typeof firstImage === 'string' && firstImage.trim()) {
      const url = firstImage.trim();
      console.log('✅ Using string URL:', url);
      return url;
    }
    
    // Check if it's an object with url property
    if (typeof firstImage === 'object' && firstImage !== null && firstImage.url) {
      console.log('Image object details:', firstImage);
      console.log('URL property:', firstImage.url);
      console.log('URL type:', typeof firstImage.url);
      
      if (typeof firstImage.url === 'string' && firstImage.url.trim()) {
        const url = firstImage.url.trim();
        console.log('✅ Using object URL:', url);
        return url;
      }
    }
    
    console.log('❌ No valid image URL found, using fallback');
    return Room;
  };

  // Handle image loading errors
  const handleImageError = (propertyId) => {
    const imageKey = `property_${propertyId}`;
    setImageErrors(prev => new Set([...prev, imageKey]));
  };

  // Remove duplicate properties by ID
  const deduplicateProperties = (props) => {
    if (!Array.isArray(props)) return [];
    
    const seen = new Set();
    return props.filter(property => {
      if (!property?.id || seen.has(property.id)) {
        return false;
      }
      seen.add(property.id);
      return true;
    });
  };

  // Fetch properties with comprehensive error handling
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await getMyProperties();
        
        if (!response) {
          throw new Error('No response received from server');
        }
        
        const rawProperties = response.properties || [];
        
        if (!Array.isArray(rawProperties)) {
          console.warn('Properties is not an array:', rawProperties);
          setProperties([]);
          return;
        }
        
        // Remove duplicates and validate data
        const deduplicatedProperties = deduplicateProperties(rawProperties);
        
        console.log('Properties loaded:', {
          total: deduplicatedProperties.length,
          duplicatesRemoved: rawProperties.length - deduplicatedProperties.length,
          properties: deduplicatedProperties.map(p => ({ id: p.id, type: p.property_type, unit: p.unit_type }))
        });
        
        setProperties(deduplicatedProperties);
        
      } catch (error) {
        console.error('Error fetching properties:', error);
        setError(error.message || 'Failed to load properties. Please try again.');
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const handleAddProperty = () => {
    navigate('/add-property');
  };

  const handleEditProperty = (id) => {
    navigate(`/update-property/${id}`);
  };

  const handleViewProperty = (property) => {
    setSelectedProperty(property);
    setViewDialogOpen(true);
  };

  const handleDeleteProperty = (property) => {
    setPropertyToDelete(property);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!propertyToDelete) return;
    
    try {
      await deleteProperty(propertyToDelete.id);
      setProperties(prev => prev.filter(p => p.id !== propertyToDelete.id));
      setSnackbar({
        open: true,
        message: 'Property deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting property:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to delete property',
        severity: 'error'
      });
    } finally {
      setDeleteDialogOpen(false);
      setPropertyToDelete(null);
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
      case 'approved': return <ApprovedIcon />;
      case 'pending': return <PendingIcon />;
      case 'rejected': return <RejectedIcon />;
      default: return <PendingIcon />;
    }
  };

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return 'Price not set';
    return `LKR ${parseFloat(price).toLocaleString()}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not specified';
    try {
      return dayjs(dateStr).format('MMM DD, YYYY');
    } catch {
      return 'Invalid date';
    }
  };

  const getTruncatedAddress = (address, maxLength = 100) => {
    if (!address || typeof address !== 'string') return 'Address not provided';
    return address.length > maxLength ? `${address.substring(0, maxLength)}...` : address;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: theme.textPrimary }}>
          My Properties
        </Typography>
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
            My Properties ({properties.length})
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
                sx={{ backgroundColor: theme.primary }}
              >
                Add Your First Property
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {properties.map((property) => {
              const amenities = safeJsonParse(property.amenities, {});
              const facilities = safeJsonParse(property.facilities, {});
              const images = safeJsonParse(property.images, []);
              const rules = safeJsonParse(property.rules, []);
              const roommates = safeJsonParse(property.roommates, []);
              const billsInclusive = safeJsonParse(property.bills_inclusive, []);

              const primaryImageUrl = getImageUrl(property.images, property.id);
              const bedroomCount = facilities?.Bedroom || facilities?.Bedrooms || property.bedrooms || 0;
              const bathroomCount = facilities?.Bathroom || facilities?.Bathrooms || property.bathrooms || 0;

              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={`property-${property.id}`}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                      },
                      border: `1px solid ${theme.borderColor || '#e0e0e0'}`,
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={primaryImageUrl}
                      alt={`${property.property_type} - ${property.unit_type}`}
                      onError={() => handleImageError(property.id)}
                      sx={{ 
                        objectFit: 'cover',
                        backgroundColor: '#f5f5f5',
                        '&:hover': {
                          opacity: 0.9
                        }
                      }}
                    />
                    
                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                          {property.property_type || 'Unknown Type'}
                        </Typography>
                        <Chip
                          icon={getStatusIcon(property.approval_status)}
                          label={property.approval_status || 'pending'}
                          color={getStatusColor(property.approval_status)}
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </Box>

                      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                        {property.unit_type || 'Unit type not specified'}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                          {getTruncatedAddress(property.address, 50)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PriceIcon sx={{ fontSize: 16, color: 'primary.main', mr: 0.5 }} />
                        <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          {formatPrice(property.price)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                          /month
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <BedroomIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                          <Typography variant="caption" color="text.secondary">
                            {bedroomCount} Bed
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <BathroomIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                          <Typography variant="caption" color="text.secondary">
                            {bathroomCount} Bath
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CalendarIcon sx={{ fontSize: 14, color: 'text.secondary', mr: 0.5 }} />
                        <Typography variant="caption" color="text.secondary">
                          Available: {formatDate(property.available_from)}
                        </Typography>
                      </Box>

                      {Array.isArray(images) && images.length > 0 && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                          <ImageIcon sx={{ fontSize: 14, mr: 0.5 }} />
                          {images.length} image{images.length !== 1 ? 's' : ''}
                        </Typography>
                      )}
                    </CardContent>

                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button
                        size="small"
                        startIcon={<ViewIcon />}
                        onClick={() => handleViewProperty(property)}
                        sx={{ mr: 1 }}
                      >
                        View
                      </Button>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleEditProperty(property.id)}
                        color="primary"
                        sx={{ mr: 1 }}
                      >
                        Edit
                      </Button>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteProperty(property)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Property Details Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          {selectedProperty && (
            <>
              <DialogTitle>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {selectedProperty.property_type} - {selectedProperty.unit_type}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {selectedProperty.address}
                </Typography>
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><PriceIcon /></ListItemIcon>
                        <ListItemText 
                          primary="Price" 
                          secondary={formatPrice(selectedProperty.price)} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CalendarIcon /></ListItemIcon>
                        <ListItemText 
                          primary="Available Period" 
                          secondary={`${formatDate(selectedProperty.available_from)} - ${formatDate(selectedProperty.available_to)}`} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><BedroomIcon /></ListItemIcon>
                        <ListItemText 
                          primary="Rooms" 
                          secondary={`${safeJsonParse(selectedProperty.facilities, {})?.Bedroom || 0} Bedrooms, ${safeJsonParse(selectedProperty.facilities, {})?.Bathroom || 0} Bathrooms`} 
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Amenities</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                      {Object.keys(safeJsonParse(selectedProperty.amenities, {})).map((amenity) => (
                        <Chip key={amenity} label={amenity} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Description</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedProperty.description || 'No description provided.'}
                    </Typography>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
                <Button 
                  onClick={() => handleEditProperty(selectedProperty.id)}
                  variant="contained"
                  startIcon={<EditIcon />}
                >
                  Edit Property
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Delete Property</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this property? This action cannot be undone.
            </Typography>
            {propertyToDelete && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="subtitle2">
                  {propertyToDelete.property_type} - {propertyToDelete.unit_type}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {propertyToDelete.address}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmDelete} color="error" variant="contained">
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