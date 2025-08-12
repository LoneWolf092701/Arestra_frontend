import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  IconButton,
  Chip,
  Rating,
  Alert,
  CircularProgress,
  Container,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  BookOnline as BookingIcon,
  LocationOn as LocationIcon,
  Bed as BedIcon,
  Bathtub as BathtubIcon,
  AttachMoney as PriceIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { getMyProperties } from '../../api/propertyApi';

const PropertyGrid = ({ 
  properties = [], 
  loading = false,
  showActions = true,
  showMyProperties = false,
  variant = 'standard',
  onViewProperty,
  onEditProperty,
  showSummary = false,
  emptyStateMessage = 'No properties found',
  emptyStateSubtitle = '',
  limit
}) => {
  const navigate = useNavigate();
  const { theme, isDark } = useTheme();
  const userRole = localStorage.getItem('userRole');
  const [myProperties, setMyProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (showMyProperties) {
      fetchMyProperties();
    }
  }, [showMyProperties]);

  const fetchMyProperties = async () => {
    try {
      setIsLoading(true);
      const response = await getMyProperties();
      if (response && response.properties) {
        setMyProperties(response.properties);
      }
    } catch (error) {
      console.error('Error fetching my properties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle different property data structures
  const normalizeProperties = (props) => {
    if (!Array.isArray(props)) {
      console.warn('Properties is not an array:', props);
      return [];
    }
    
    return props.map(property => ({
      id: property.id,
      property_type: property.property_type || property.type || 'Property',
      unit_type: property.unit_type || property.subtype || '',
      description: property.description || '',
      price: property.price || 0,
      address: property.address || property.location || '',
      bedrooms: property.bedrooms || 0,
      bathrooms: property.bathrooms || 0,
      images: property.images || [],
      amenities: property.amenities || [],
      facilities: property.facilities || [],
      approval_status: property.approval_status || 'approved',
      is_active: property.is_active !== false,
      views_count: property.views_count || 0,
      average_rating: property.average_rating || 0,
      total_ratings: property.total_ratings || 0,
      created_at: property.created_at,
      updated_at: property.updated_at,
      user_id: property.user_id,
      available_from: property.available_from,
      available_to: property.available_to
    }));
  };

  const propertiesToUse = showMyProperties ? myProperties : properties;
  const normalizedProperties = normalizeProperties(propertiesToUse);
  const displayProperties = limit ? normalizedProperties.slice(0, limit) : normalizedProperties;

  // Parse JSON data safely
  const parseJsonSafely = (jsonString) => {
    if (!jsonString) return [];
    try {
      return typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
    } catch (error) {
      return [];
    }
  };

  // Get image URL from images array - handle both string and object formats
  const getImageUrl = (images) => {
    const imageArray = parseJsonSafely(images);
    if (Array.isArray(imageArray) && imageArray.length > 0) {
      const firstImage = imageArray[0];
      if (typeof firstImage === 'string') {
        return firstImage;
      }
      if (typeof firstImage === 'object' && firstImage?.url) {
        return firstImage.url;
      }
      return firstImage;
    }
    return '/placeholder-property.jpg';
  };

  // Format price for display
  const formatPrice = (price) => {
    if (!price) return 'Price on request';
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return 'Location not specified';
    return address.length > 60 ? `${address.substring(0, 60)}...` : address;
  };

  // Handle property view
  const handleView = (propertyId) => {
    if (onViewProperty) {
      onViewProperty(propertyId);
    } else if (showMyProperties) {
      navigate(`/property/${propertyId}`);
    } else {
      navigate(`/user-property-view/${propertyId}`);
    }
  };

  // Handle property edit
  const handleEdit = (propertyId) => {
    if (onEditProperty) {
      onEditProperty(propertyId);
    } else {
      navigate(`/update-property/${propertyId}`);
    }
  };

  // Handle property booking
  const handleBook = (propertyId) => {
    navigate(`/user-booking/${propertyId}`);
  };

  if (loading || isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading properties...
        </Typography>
      </Container>
    );
  }

  if (!displayProperties || displayProperties.length === 0) {
    return (
      <Box sx={{ 
        textAlign: 'center', 
        py: 8,
        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
        borderRadius: 3,
        border: `2px dashed ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
      }}>
        <HomeIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h5" sx={{ color: 'text.secondary', mb: 1, fontWeight: 500 }}>
          {emptyStateMessage}
        </Typography>
        {emptyStateSubtitle && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {emptyStateSubtitle}
          </Typography>
        )}
        {showMyProperties && userRole === 'propertyowner' && (
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate('/add-property')}
            sx={{ mt: 2 }}
          >
            Add Your First Property
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {displayProperties.map((property) => (
          <Grid item xs={12} sm={6} md={4} lg={variant === 'compact' ? 2 : 3} key={property.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                boxShadow: `0 4px 20px ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'}`,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: `0 8px 30px ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.25)'}`,
                },
              }}
              onClick={() => handleView(property.id)}
            >
              <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="220"
                  image={getImageUrl(property.images)}
                  alt={`${property.property_type} ${property.unit_type}`}
                  sx={{ objectFit: 'cover' }}
                />
                
                {/* Status chip */}
                <Chip 
                  label={property.approval_status || 'approved'} 
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    backgroundColor: property.approval_status === 'approved' ? 'success.main' : 
                                   property.approval_status === 'pending' ? 'warning.main' : 'error.main',
                    color: 'white',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}
                />

                {/* Action buttons overlay */}
                {showActions && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      display: 'flex',
                      gap: 1,
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      '.MuiCard-root:hover &': {
                        opacity: 1,
                      },
                    }}
                  >
                    {showMyProperties && (
                      <Tooltip title="Edit Property">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(property.id);
                          }}
                          sx={{
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            '&:hover': { backgroundColor: 'white' },
                            color: theme.primary
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    
                    {!showMyProperties && userRole === 'user' && (
                      <Tooltip title="Book Property">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBook(property.id);
                          }}
                          sx={{
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            '&:hover': { backgroundColor: 'white' },
                            color: theme.primary
                          }}
                        >
                          <BookingIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                )}
              </Box>

              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography 
                      variant="h6" 
                      component="h3" 
                      sx={{ 
                        fontWeight: 'bold',
                        color: theme.textPrimary,
                        mb: 0.5,
                        lineHeight: 1.2
                      }}
                    >
                      {property.property_type}
                    </Typography>
                    <Typography 
                      variant="subtitle2" 
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      {property.unit_type}
                    </Typography>
                  </Box>
                  
                  {property.average_rating > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                      <Rating 
                        value={property.average_rating} 
                        readOnly 
                        size="small" 
                        precision={0.1}
                        sx={{ mr: 0.5 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        ({property.total_ratings})
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flexGrow: 1
                    }}
                  >
                    {formatAddress(property.address)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <BedIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {property.bedrooms || 0}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <BathtubIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {property.bathrooms || 0}
                    </Typography>
                  </Box>
                  {property.views_count > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <VisibilityIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        {property.views_count}
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: theme.primary,
                      fontSize: '1.1rem'
                    }}
                  >
                    {formatPrice(property.price)}
                  </Typography>
                  
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleView(property.id);
                    }}
                    sx={{
                      borderColor: theme.primary,
                      color: theme.primary,
                      '&:hover': {
                        backgroundColor: `${theme.primary}10`,
                        borderColor: theme.primary,
                      },
                    }}
                  >
                    View
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PropertyGrid;