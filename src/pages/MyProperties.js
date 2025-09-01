import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Skeleton,
} from '@mui/material';
import { useTheme } from '../contexts/ThemeContext';
import { getMyProperties, deleteProperty } from '../api/propertyApi';
import { getUserId } from '../utils/auth';
import AppSnackbar from '../components/common/AppSnackbar';
import Pagination from '../components/common/Pagination';
import Room from '../assets/images/Room.jpg';
import dayjs from 'dayjs';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import HotelIcon from '@mui/icons-material/Hotel';
import BathtubIcon from '@mui/icons-material/Bathtub';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const MyProperties = () => {
  const navigate = useNavigate();
  const { theme, isDark } = useTheme();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageErrors, setImageErrors] = useState(new Set());
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  
  // Pagination state
  const [paginationData, setPaginationData] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
    itemsPerPage: 12
  });

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchMyProperties = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const userId = getUserId();
      const response = await getMyProperties({ page, limit: paginationData.itemsPerPage });
      
      if (response?.properties) {
        setProperties(response.properties);
        setPaginationData(prev => ({
          ...prev,
          page: response.pagination?.current_page || page,
          total: response.pagination?.total || response.properties.length,
          totalPages: response.pagination?.total_pages || Math.ceil(response.properties.length / prev.itemsPerPage)
        }));
      } else {
        setProperties([]);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError('Failed to load properties. Please try again.');
      showSnackbar('Failed to load properties', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProperties();
  }, []);

  const handlePageChange = (event, newPage) => {
    setPaginationData(prev => ({ ...prev, page: newPage }));
    fetchMyProperties(newPage);
  };

  const handleImageError = (propertyId) => {
    setImageErrors(prev => new Set([...prev, propertyId]));
  };

  const getImageUrl = (images, propertyId) => {
    if (imageErrors.has(propertyId)) return Room;
    
    if (!images) return Room;
    
    let parsedImages;
    try {
      parsedImages = typeof images === 'string' ? JSON.parse(images) : images;
    } catch {
      return Room;
    }
    
    if (!Array.isArray(parsedImages) || parsedImages.length === 0) return Room;
    
    const firstImage = parsedImages[0];
    if (typeof firstImage === 'string' && firstImage.trim()) {
      return firstImage.trim();
    }
    if (typeof firstImage === 'object' && firstImage?.url) {
      return firstImage.url.trim();
    }
    
    return Room;
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
      case 'approved': return <CheckCircleIcon />;
      case 'pending': return <PauseCircleOutlineIcon />;
      case 'rejected': return <RemoveCircleOutlineIcon />;
      default: return null;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return dayjs(dateString).format('MMM DD, YYYY');
  };

  const getDisplayAmenities = (amenities) => {
    if (!amenities) return [];
    
    let parsed;
    try {
      parsed = typeof amenities === 'string' ? JSON.parse(amenities) : amenities;
    } catch {
      return [];
    }
    
    if (Array.isArray(parsed)) {
      return parsed.filter(amenity => amenity && amenity.trim());
    }
    
    if (typeof parsed === 'object') {
      return Object.keys(parsed).filter(key => parsed[key] && parsed[key] > 0);
    }
    
    return [];
  };

  const getDisplayFacilities = (facilities) => {
    if (!facilities) return {};
    
    let parsed;
    try {
      parsed = typeof facilities === 'string' ? JSON.parse(facilities) : facilities;
    } catch {
      return {};
    }
    
    if (typeof parsed !== 'object') return {};
    
    const displayFacilities = {};
    Object.entries(parsed).forEach(([key, value]) => {
      if (value && parseInt(value) > 0) {
        displayFacilities[key] = parseInt(value);
      }
    });
    
    return displayFacilities;
  };

  const handleViewProperty = (property) => {
  const propertyId = property.id || property.property_id;
  
  // Use owner route for all properties in MyProperties to ensure owners can view their pending properties
  navigate(`/owner-property/${propertyId}`);
};

  const handleEditProperty = (property) => {
    navigate(`/update-property/${property.id}`);
  };

  const handleDeleteClick = (property) => {
    setPropertyToDelete(property);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!propertyToDelete) return;

    try {
      await deleteProperty(propertyToDelete.id);
      setProperties(prev => prev.filter(p => p.id !== propertyToDelete.id));
      showSnackbar('Property deleted successfully');
      setPaginationData(prev => ({
        ...prev,
        total: Math.max(0, prev.total - 1)
      }));
    } catch (error) {
      console.error('Error deleting property:', error);
      showSnackbar('Failed to delete property', 'error');
    } finally {
      setDeleteConfirmOpen(false);
      setPropertyToDelete(null);
    }
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
          <Typography variant="h6" sx={{ color: theme.textSecondary, mb: 2 }}>
            No properties found
          </Typography>
          <Typography variant="body2" sx={{ color: theme.textSecondary, mb: 3 }}>
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
              const displayAmenities = getDisplayAmenities(property.amenities);
              const displayFacilities = getDisplayFacilities(property.facilities);

              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={property.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s ease',
                      backgroundColor: theme.cardBackground,
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: isDark ? 
                          '0 8px 32px rgba(0,0,0,0.4)' : 
                          '0 8px 32px rgba(0,0,0,0.15)',
                      },
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={imageUrl}
                        alt={`${property.property_type} - ${property.unit_type}`}
                        onError={() => handleImageError(property.id)}
                        sx={{ objectFit: 'cover' }}
                      />
                      
                      {/* Status Badge */}
                      <Chip
                        icon={getStatusIcon(property.approval_status)}
                        label={property.approval_status?.charAt(0).toUpperCase() + property.approval_status?.slice(1)}
                        color={getStatusColor(property.approval_status)}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
                          color: isDark ? 'white' : 'inherit'
                        }}
                      />

                      {/* Top Right Buttons: Delete and Edit only */}
                      <Box sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        display: 'flex',
                        gap: 1
                      }}>
                        <Button
                          size="small"
                          startIcon={<DeleteOutlineIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(property);
                          }}
                          sx={{
                            minWidth: 'auto',
                            px: 1,
                            py: 0.5,
                            backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)',
                            color: theme.error || '#f44336',
                            fontSize: '0.75rem',
                            '&:hover': { 
                              backgroundColor: isDark ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,1)',
                              transform: 'scale(1.05)'
                            }
                          }}
                        >
                          Delete
                        </Button>
                        {property.approval_status !== 'rejected' && (
  <Button
    size="small"
    startIcon={<EditIcon />}
    onClick={(e) => {
      e.stopPropagation();
      handleEditProperty(property);
    }}
    sx={{
      minWidth: 'auto',
      px: 1,
      py: 0.5,
      backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)',
      color: theme.primary,
      fontSize: '0.75rem',
      '&:hover': { 
        backgroundColor: isDark ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,1)'
      }
    }}
  >
    Edit
  </Button>
)}
                      </Box>
                    </Box>

                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                      <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', mb: 1, color: theme.textPrimary }}>
                        {property.property_type}
                      </Typography>
                      
                      <Typography variant="body2" sx={{ mb: 1, color: theme.textSecondary }}>
                        {property.unit_type}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOnIcon sx={{ fontSize: 16, color: theme.textSecondary, mr: 0.5 }} />
                        <Typography variant="body2" sx={{ color: theme.textSecondary }} noWrap>
                          {property.address?.length > 30 ? 
                            `${property.address.substring(0, 30)}...` : 
                            property.address || 'Address not provided'
                          }
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AttachMoneyIcon sx={{ fontSize: 16, color: theme.primary, mr: 0.5 }} />
                        <Typography 
                          variant="h6" 
                          sx={{ fontWeight: 'bold', color: theme.primary }}
                        >
                          {formatPrice(property.price)}
                        </Typography>
                      </Box>

                      {/* Facilities Display */}
                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        {(displayFacilities.Bedrooms || property.bedrooms) && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <HotelIcon sx={{ fontSize: 16, mr: 0.5, color: theme.textSecondary }} />
                            <Typography variant="caption" sx={{ color: theme.textSecondary }}>
                              {displayFacilities.Bedrooms || property.bedrooms} Bed
                            </Typography>
                          </Box>
                        )}
                        {(displayFacilities.Bathrooms || property.bathrooms) && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <BathtubIcon sx={{ fontSize: 16, mr: 0.5, color: theme.textSecondary }} />
                            <Typography variant="caption" sx={{ color: theme.textSecondary }}>
                              {displayFacilities.Bathrooms || property.bathrooms} Bath
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {/* Amenities Display */}
                      {displayAmenities.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {displayAmenities.slice(0, 3).map((amenity, index) => (
                              <Chip 
                                key={index} 
                                label={amenity} 
                                size="small" 
                                variant="outlined"
                                sx={{ 
                                  fontSize: '0.7rem', 
                                  height: 20,
                                  color: theme.textPrimary,
                                  borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'
                                }}
                              />
                            ))}
                            {displayAmenities.length > 3 && (
                              <Chip 
                                label={`+${displayAmenities.length - 3}`} 
                                size="small" 
                                variant="outlined"
                                sx={{ 
                                  fontSize: '0.7rem', 
                                  height: 20,
                                  color: theme.textPrimary,
                                  borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                      )}

                      {/* Additional Facilities */}
                      {Object.keys(displayFacilities).length > 2 && (
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="caption" sx={{ display: 'block', color: theme.textSecondary }}>
                            Other facilities: {
                              Object.entries(displayFacilities)
                                .filter(([key]) => key !== 'Bedrooms' && key !== 'Bathrooms')
                                .slice(0, 2)
                                .map(([key, value]) => `${key} (${value})`)
                                .join(', ')
                            }
                            {Object.keys(displayFacilities).length > 4 && '...'}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>

                    {/* VIEW BUTTON AT THE BOTTOM */}
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewProperty(property)}
                        sx={{
                          backgroundColor: theme.primary,
                          color: 'white',
                          fontWeight: 600,
                          py: 1,
                          '&:hover': { 
                            backgroundColor: theme.secondary,
                            transform: 'translateY(-1px)'
                          }
                        }}
                      >
                        View Details
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Pagination */}
          {paginationData.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={paginationData.totalPages}
                page={paginationData.page}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: theme.cardBackground,
            color: theme.textPrimary
          }
        }}
      >
        <DialogTitle sx={{ color: theme.textPrimary }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: theme.textPrimary }}>
            Are you sure you want to delete this property? This action cannot be undone.
          </Typography>
          {propertyToDelete && (
            <Box sx={{ 
              mt: 2, 
              p: 2, 
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', 
              borderRadius: 1 
            }}>
              <Typography variant="subtitle2" sx={{ color: theme.textPrimary }}>
                {propertyToDelete.property_type} - {propertyToDelete.unit_type}
              </Typography>
              <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                {propertyToDelete.address}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} sx={{ color: theme.textPrimary }}>
            Cancel
          </Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            variant="contained"
            sx={{
              backgroundColor: theme.error || '#f44336',
              '&:hover': {
                backgroundColor: theme.error ? `${theme.error}cc` : '#d32f2f'
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      />
    </Container>
  );
};

export default MyProperties;