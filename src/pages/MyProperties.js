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
import Pagination from '../components/common/Pagination';
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
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [paginationData, setPaginationData] = useState({
    total: 0,
    totalPages: 0,
    page: 1,
    limit: 12,
    hasNext: false,
    hasPrevious: false
  });

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

  const extractPaginationData = (response) => {
    if (response?.pagination) {
      return {
        total: response.pagination.total || 0,
        totalPages: response.pagination.totalPages || 0,
        page: response.pagination.page || 1,
        limit: response.pagination.limit || 12,
        hasNext: response.pagination.hasNext || false,
        hasPrevious: response.pagination.hasPrevious || false
      };
    }
    
    const properties = response?.properties || [];
    return {
      total: properties.length,
      totalPages: 1,
      page: 1,
      limit: 12,
      hasNext: false,
      hasPrevious: false
    };
  };

  const getImageUrl = (images, propertyId) => {
    const parsedImages = safeJsonParse(images, []);
    
    if (!Array.isArray(parsedImages) || parsedImages.length === 0) {
      return Room;
    }

    const firstImage = parsedImages[0];
    
    if (typeof firstImage === 'string' && firstImage.trim()) {
      return firstImage.trim();
    }
    
    if (typeof firstImage === 'object' && firstImage !== null && firstImage.url) {
      if (typeof firstImage.url === 'string' && firstImage.url.trim()) {
        return firstImage.url.trim();
      }
    }
    
    return Room;
  };

  const handleImageError = (propertyId) => {
    const imageKey = `property_${propertyId}`;
    setImageErrors(prev => new Set([...prev, imageKey]));
  };

  const fetchProperties = async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await getMyProperties({
        page: page,
        limit: itemsPerPage
      });
      
      console.log('API Response:', response);
      
      if (response === undefined || response === null) {
        console.warn('Response is undefined/null');
        setProperties([]);
        setPaginationData({
          total: 0,
          totalPages: 0,
          page: 1,
          limit: 12,
          hasNext: false,
          hasPrevious: false
        });
        return;
      }
      
      const rawProperties = response.properties || [];
      const pagination = extractPaginationData(response);
      
      if (!Array.isArray(rawProperties)) {
        console.warn('Properties is not an array:', rawProperties);
        setProperties([]);
        setPaginationData(pagination);
        return;
      }
      
      setProperties(rawProperties);
      setPaginationData(pagination);
      setCurrentPage(page);
      
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError(error.message || 'Failed to load properties. Please try again.');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchProperties(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    fetchProperties(1);
  };

  useEffect(() => {
    fetchProperties(currentPage);
  }, []);

  const handleView = (property) => {
    navigate(`/view-property/${property.id}`);
  };

  const handleEdit = (property) => {
    navigate(`/update-property/${property.id}`);
  };

  const handleDelete = (property) => {
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
      
      if (properties.length === 1 && currentPage > 1) {
        const newPage = currentPage - 1;
        setCurrentPage(newPage);
        fetchProperties(newPage);
      } else {
        fetchProperties(currentPage);
      }
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

  const handleViewDetails = (property) => {
    setSelectedProperty(property);
    setViewDialogOpen(true);
  };

  const formatPrice = (price) => {
    return `LKR ${parseInt(price || 0).toLocaleString()}`;
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
      default: return null;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return dayjs(dateString).format('MMM DD, YYYY');
  };

  const getDisplayAmenities = (amenities) => {
    if (!amenities) return [];
    
    if (Array.isArray(amenities)) {
      return amenities;
    }
    
    if (typeof amenities === 'object') {
      return Object.keys(amenities).filter(key => amenities[key] > 0);
    }
    
    return [];
  };

  const getDisplayFacilities = (facilities) => {
    if (!facilities || typeof facilities !== 'object') return {};
    
    const displayFacilities = {};
    Object.entries(facilities).forEach(([key, value]) => {
      if (value && parseInt(value) > 0) {
        displayFacilities[key] = parseInt(value);
      }
    });
    
    return displayFacilities;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: theme.textPrimary }}>
          My Properties
        </Typography>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={30} />
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="text" height={20} width="60%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.textPrimary }}>
          My Properties ({paginationData.total})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/add-property')}
          sx={{
            backgroundColor: theme.primary,
            color: 'white',
            '&:hover': { backgroundColor: theme.secondary }
          }}
        >
          Add New Property
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {properties.length === 0 && !error ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
            No properties found
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Start building your property portfolio by adding your first property.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/add-property')}
            sx={{
              backgroundColor: theme.primary,
              color: 'white',
              '&:hover': { backgroundColor: theme.secondary }
            }}
          >
            Add Your First Property
          </Button>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {properties.map((property) => {
              const imageKey = `property_${property.id}`;
              const hasImageError = imageErrors.has(imageKey);
              const imageUrl = hasImageError ? Room : getImageUrl(property.images, property.id);
              
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={property.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6,
                      },
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={imageUrl}
                      alt={`${property.property_type} - ${property.unit_type}`}
                      onError={() => handleImageError(property.id)}
                      sx={{
                        objectFit: 'cover',
                        backgroundColor: 'grey.200'
                      }}
                    />
                    
                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                          {property.property_type}
                        </Typography>
                        <Chip
                          icon={getStatusIcon(property.approval_status)}
                          label={property.approval_status?.charAt(0).toUpperCase() + property.approval_status?.slice(1)}
                          color={getStatusColor(property.approval_status)}
                          size="small"
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {property.unit_type}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                          {property.address?.length > 50 ? `${property.address.substring(0, 50)}...` : property.address}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <PriceIcon sx={{ fontSize: 16, color: theme.primary, mr: 0.5 }} />
                        <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 'bold', fontSize: '1rem' }}>
                          {formatPrice(property.price)} / month
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        {Object.entries(getDisplayFacilities(property.facilities)).slice(0, 2).map(([key, value]) => (
                          <Chip
                            key={key}
                            icon={key === 'Bedrooms' ? <BedroomIcon /> : <BathroomIcon />}
                            label={`${value} ${key}`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem' }}
                          />
                        ))}
                      </Box>
                    </CardContent>
                    
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ViewIcon />}
                        onClick={() => handleViewDetails(property)}
                        sx={{ mr: 1 }}
                      >
                        View
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => handleEdit(property)}
                        sx={{ mr: 1 }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(property)}
                      >
                        Delete
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          <Pagination
            currentPage={paginationData.page}
            totalPages={paginationData.totalPages}
            totalItems={paginationData.total}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            disabled={loading}
            itemsPerPageOptions={[12, 24, 36]}
            showInfo={true}
            showFirstLast={true}
          />
        </>
      )}

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete this property? This action cannot be undone.
          </Typography>
          {propertyToDelete && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
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

      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Property Details
            <IconButton onClick={() => setViewDialogOpen(false)}>
              <BrokenImageIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedProperty && (
            <Box>
              <Typography variant="h5" gutterBottom>
                {selectedProperty.property_type} - {selectedProperty.unit_type}
              </Typography>
              
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {selectedProperty.address}
              </Typography>

              <Typography variant="h6" sx={{ color: theme.primary, mb: 2 }}>
                {formatPrice(selectedProperty.price)} / month
              </Typography>

              {selectedProperty.description && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>Description</Typography>
                  <Typography variant="body2">{selectedProperty.description}</Typography>
                </Box>
              )}

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Facilities</Typography>
                  <List dense>
                    {Object.entries(getDisplayFacilities(selectedProperty.facilities)).map(([key, value]) => (
                      <ListItem key={key}>
                        <ListItemText primary={`${key}: ${value}`} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Amenities</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {getDisplayAmenities(selectedProperty.amenities).map((amenity, index) => (
                      <Chip key={index} label={amenity} size="small" />
                    ))}
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>Availability</Typography>
                <Typography variant="body2">
                  Available from: {formatDate(selectedProperty.available_from)}
                </Typography>
                {selectedProperty.available_to && (
                  <Typography variant="body2">
                    Available until: {formatDate(selectedProperty.available_to)}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Container>
  );
};

export default MyProperties;