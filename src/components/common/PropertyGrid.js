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
import Room from '../../assets/images/Room.jpg';

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
  const [imageErrors, setImageErrors] = useState(new Set());

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

  const normalizeProperties = (props) => {
    if (!Array.isArray(props)) {
      console.warn('Properties is not an array:', props);
      return [];
    }
    
    return props.map(property => ({
      id: property.id,
      property_type: property.property_type,
      unit_type: property.unit_type,
      address: property.address,
      price: property.price,
      amenities: property.amenities,
      facilities: property.facilities,
      images: property.images,
      description: property.description,
      available_from: property.available_from,
      available_to: property.available_to,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      views_count: property.views_count || 0,
      approval_status: property.approval_status,
      is_active: property.is_active,
      created_at: property.created_at,
      user_id: property.user_id
    }));
  };

  const displayProperties = showMyProperties ? 
    normalizeProperties(myProperties) : 
    normalizeProperties(properties);

  const limitedProperties = limit ? displayProperties.slice(0, limit) : displayProperties;

  // Enhanced image URL resolver to handle API response format
  const getImageUrl = (images, propertyId) => {
    const imageKey = `property_${propertyId}`;
    
    if (imageErrors.has(imageKey)) {
      return Room;
    }

    // Handle different image data structures from API
    let imageArray = [];
    
    if (Array.isArray(images)) {
      imageArray = images;
    } else if (typeof images === 'string') {
      try {
        imageArray = JSON.parse(images);
      } catch {
        return Room;
      }
    } else {
      return Room;
    }
    
    if (!Array.isArray(imageArray) || imageArray.length === 0) {
      return Room;
    }

    const firstImage = imageArray[0];
    
    // Handle string URLs
    if (typeof firstImage === 'string' && firstImage.trim()) {
      return firstImage.trim();
    }
    
    // Handle object with URL property (API format)
    if (typeof firstImage === 'object' && firstImage?.url && typeof firstImage.url === 'string') {
      return firstImage.url.trim();
    }
    
    return Room;
  };

  // Handle image loading errors
  const handleImageError = (propertyId) => {
    const imageKey = `property_${propertyId}`;
    setImageErrors(prev => new Set([...prev, imageKey]));
  };

  const safeJsonParse = (str) => {
    if (!str) return null;
    if (typeof str === 'object') return str;
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'Price not set';
    return `LKR ${parseInt(price).toLocaleString()}`;
  };

  const getTruncatedAddress = (address) => {
    if (!address) return 'Address not provided';
    return address.length > 60 ? `${address.substring(0, 60)}...` : address;
  };

  const handleView = (propertyId) => {
    if (onViewProperty) {
      onViewProperty(propertyId);
    } else {
      // Always navigate to view-property page for better UX
      navigate(`/view-property/${propertyId}`);
    }
  };

  const handleEdit = (propertyId) => {
    if (onEditProperty) {
      onEditProperty(propertyId);
    } else {
      navigate(`/update-property/${propertyId}`);
    }
  };

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
        {limitedProperties.map((property) => {
          const amenities = safeJsonParse(property.amenities);
          const facilities = safeJsonParse(property.facilities);
          
          const primaryImage = getImageUrl(property.images, property.id);
          const bedroomCount = facilities?.Bedroom || facilities?.Bedrooms || property.bedrooms || 0;
          const bathroomCount = facilities?.Bathroom || facilities?.Bathrooms || property.bathrooms || 0;

          return (
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
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                }}
                onClick={() => handleView(property.id)}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={primaryImage}
                  alt={`${property.property_type} - ${property.unit_type}`}
                  onError={() => handleImageError(property.id)}
                  sx={{ 
                    objectFit: 'cover',
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                  }}
                />

                <CardContent sx={{ 
                  flexGrow: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  p: 2.5,
                  backgroundColor: theme.surfaceBackground,
                }}>
                  <Typography 
                    variant="h6" 
                    component="h3" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 600,
                      color: theme.textPrimary,
                      fontSize: '1.1rem',
                      lineHeight: 1.3
                    }}
                  >
                    {property.property_type} - {property.unit_type}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <LocationIcon sx={{ 
                      fontSize: 18, 
                      color: theme.textSecondary, 
                      mr: 0.5, 
                      mt: 0.1,
                      flexShrink: 0 
                    }} />
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        lineHeight: 1.4,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {getTruncatedAddress(property.address)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PriceIcon sx={{ fontSize: 18, color: theme.primary, mr: 0.5 }} />
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700, 
                        color: theme.primary,
                        fontSize: '1.25rem'
                      }}
                    >
                      {formatPrice(property.price)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                      /month
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <BedIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                      <Typography variant="caption" color="text.secondary">
                        {bedroomCount} Bed
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <BathtubIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                      <Typography variant="caption" color="text.secondary">
                        {bathroomCount} Bath
                      </Typography>
                    </Box>
                  </Box>

                  {showActions && (
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 1, 
                      mt: 'auto',
                      pt: 1,
                      borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                    }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleView(property.id);
                        }}
                        sx={{ flex: 1 }}
                      >
                        View
                      </Button>
                      
                      {showMyProperties && userRole === 'propertyowner' && (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<EditIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(property.id);
                          }}
                          sx={{ flex: 1 }}
                        >
                          Edit
                        </Button>
                      )}
                      
                      {!showMyProperties && userRole === 'user' && (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<BookingIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBook(property.id);
                          }}
                          color="primary"
                          sx={{ flex: 1 }}
                        >
                          Book
                        </Button>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default PropertyGrid;