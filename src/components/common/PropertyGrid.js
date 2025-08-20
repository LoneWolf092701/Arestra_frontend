import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Button,
  Container,
  CircularProgress
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  AttachMoney as PriceIcon,
  Bed as BedIcon,
  Bathtub as BathtubIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Home as HomeIcon,
  FavoriteBorder as FavoriteIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import { getUserRole } from '../../utils/auth';
import Room from '../../assets/images/Room.jpg';

const PropertyGrid = ({ 
  properties = [], 
  loading = false,
  isLoading = false,
  myProperties = false,
  showMyProperties = false,
  onViewProperty,
  onEditProperty,
  limit,
  variant = 'default',
  emptyStateMessage = 'No properties available',
  emptyStateSubtitle
}) => {
  const navigate = useNavigate();
  const { theme, isDark } = useTheme();
  const userRole = getUserRole();
  const [imageErrors, setImageErrors] = useState(new Set());

  const safeJsonParse = (str, fallback = null) => {
    if (!str) return fallback;
    if (typeof str === 'object') return str;
    if (typeof str !== 'string') return fallback;
    
    try {
      const parsed = JSON.parse(str);
      return parsed !== null ? parsed : fallback;
    } catch (error) {
      return fallback;
    }
  };

  const getImageUrl = (images, propertyId) => {
    const imageKey = `property_${propertyId}`;
    
    if (imageErrors.has(imageKey)) {
      return Room;
    }

    const parsedImages = safeJsonParse(images, []);
    
    if (!Array.isArray(parsedImages) || parsedImages.length === 0) {
      return Room;
    }

    const firstImage = parsedImages[0];
    
    if (typeof firstImage === 'string' && firstImage.trim()) {
      return firstImage.trim();
    }
    
    if (typeof firstImage === 'object' && firstImage?.url && typeof firstImage.url === 'string') {
      return firstImage.url.trim();
    }
    
    return Room;
  };

  const handleImageError = (propertyId) => {
    const imageKey = `property_${propertyId}`;
    setImageErrors(prev => new Set([...prev, imageKey]));
  };

  const formatPrice = (price) => {
    if (!price) return 'Price not set';
    return `LKR ${parseInt(price).toLocaleString()}`;
  };

  const getTruncatedAddress = (address) => {
    if (!address) return 'Address not provided';
    return address.length > 60 ? `${address.substring(0, 60)}...` : address;
  };

  const normalizeProperties = (props) => {
    if (!Array.isArray(props)) return [];
    
    return props.map(property => ({
      ...property,
      amenities: safeJsonParse(property.amenities, []),
      facilities: safeJsonParse(property.facilities, {}),
      images: safeJsonParse(property.images, [])
    }));
  };

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

  const handleView = (property) => {
    if (onViewProperty) {
      onViewProperty(property);
    } else {
      if (userRole === 'propertyowner' && myProperties) {
        navigate(`/view-property/${property.id}`);
      } else {
        navigate(`/property/${property.id}`);
      }
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

  const displayProperties = myProperties ? 
    normalizeProperties(properties) : 
    normalizeProperties(properties);

  const deduplicatedProperties = deduplicateProperties(displayProperties);
  const limitedProperties = limit ? deduplicatedProperties.slice(0, limit) : deduplicatedProperties;

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

  if (!limitedProperties || limitedProperties.length === 0) {
    return (
      <Box sx={{ 
        textAlign: 'center', 
        py: 8,
        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
        borderRadius: 3,
        border: `2px dashed ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        minHeight: 200,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <HomeIcon sx={{ 
          fontSize: 80, 
          color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
          mb: 2 
        }} />
        <Typography 
          variant="h6" 
          sx={{ 
            color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
            mb: 1,
            fontWeight: 600
          }}
        >
          {emptyStateMessage}
        </Typography>
        {emptyStateSubtitle && (
          <Typography 
            variant="body1" 
            sx={{ 
              color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
              maxWidth: 400
            }}
          >
            {emptyStateSubtitle}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        {limitedProperties.map((property, index) => {
          if (!property || !property.id) {
            return null;
          }

          const amenities = safeJsonParse(property.amenities, []);
          const displayAmenities = Array.isArray(amenities) ? amenities.slice(0, 3) : [];

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={`${property.id}-${index}`}>
              <Card 
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : theme.cardBackground,
                  borderRadius: 3,
                  overflow: 'hidden',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: isDark 
                      ? '0 12px 40px rgba(255,255,255,0.1)' 
                      : '0 12px 40px rgba(0,0,0,0.15)',
                    '& .property-image': {
                      transform: 'scale(1.05)',
                    }
                  }
                }}
                onClick={() => handleView(property)}
              >
                <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={getImageUrl(property.images, property.id)}
                    alt={`${property.property_type} - ${property.unit_type}`}
                    className="property-image"
                    onError={() => handleImageError(property.id)}
                    sx={{
                      transition: 'transform 0.3s ease',
                      objectFit: 'cover'
                    }}
                  />
                  
                  <Box sx={{ 
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    zIndex: 2
                  }}>
                    <Chip
                      label={property.unit_type || 'Room'}
                      size="small"
                      sx={{
                        backgroundColor: theme.primary,
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }}
                    />
                  </Box>

                  <Box sx={{ 
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    zIndex: 2,
                    backgroundColor: isDark ? 
                      'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)',
                    borderRadius: 2,
                    padding: '4px 8px',
                    backdropFilter: 'blur(8px)',
                    border: `1px solid ${isDark ? 
                      'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                  }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleView(property);
                        }}
                        sx={{ 
                          color: theme.primary,
                          '&:hover': { backgroundColor: theme.primary + '20' }
                        }}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                      
                      {userRole === 'propertyowner' && myProperties && (
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(property.id);
                          }}
                          sx={{ 
                            color: theme.secondary,
                            '&:hover': { backgroundColor: theme.secondary + '20' }
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}

                      {userRole === 'user' && !myProperties && (
                        <>
                          <IconButton 
                            size="small"
                            sx={{ 
                              color: theme.textSecondary,
                              '&:hover': { color: theme.primary }
                            }}
                          >
                            <FavoriteIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small"
                            sx={{ 
                              color: theme.textSecondary,
                              '&:hover': { color: theme.primary }
                            }}
                          >
                            <ShareIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </Box>
                  </Box>
                </Box>

                <CardContent sx={{ 
                  flexGrow: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  p: 2.5
                }}>
                  <Typography 
                    variant="h6" 
                    component="h3" 
                    sx={{ 
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: isDark ? 'white' : theme.textPrimary,
                      mb: 1,
                      lineHeight: 1.3,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {property.property_type} - {property.unit_type}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <LocationIcon sx={{ 
                      fontSize: 16, 
                      color: theme.textSecondary, 
                      mr: 0.5,
                      mt: 0.2,
                      flexShrink: 0
                    }} />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: theme.textSecondary,
                        fontSize: '0.875rem',
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {getTruncatedAddress(property.address)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PriceIcon sx={{ 
                      fontSize: 18, 
                      color: theme.primary, 
                      mr: 0.5 
                    }} />
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: theme.primary,
                        fontWeight: 700,
                        fontSize: '1.1rem'
                      }}
                    >
                      {formatPrice(property.price)}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: theme.textSecondary,
                        ml: 0.5,
                        fontSize: '0.85rem'
                      }}
                    >
                      /month
                    </Typography>
                  </Box>

                  {(property.bedrooms || property.bathrooms) && (
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      {property.bedrooms && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <BedIcon sx={{ 
                            fontSize: 16, 
                            color: theme.textSecondary, 
                            mr: 0.5 
                          }} />
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: theme.textSecondary,
                              fontSize: '0.8rem'
                            }}
                          >
                            {property.bedrooms} bed{property.bedrooms > 1 ? 's' : ''}
                          </Typography>
                        </Box>
                      )}
                      {property.bathrooms && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <BathtubIcon sx={{ 
                            fontSize: 16, 
                            color: theme.textSecondary, 
                            mr: 0.5 
                          }} />
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: theme.textSecondary,
                              fontSize: '0.8rem'
                            }}
                          >
                            {property.bathrooms} bath{property.bathrooms > 1 ? 's' : ''}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}

                  {displayAmenities.length > 0 && (
                    <Box sx={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: 0.5, 
                      mb: 2,
                      mt: 'auto'
                    }}>
                      {displayAmenities.map((amenity, amenityIndex) => (
                        <Chip
                          key={amenityIndex}
                          label={amenity}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: '0.7rem',
                            height: 24,
                            borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                            color: isDark ? 'rgba(255,255,255,0.8)' : theme.textSecondary,
                            '&:hover': {
                              borderColor: theme.primary,
                              color: theme.primary
                            }
                          }}
                        />
                      ))}
                      {amenities.length > 3 && (
                        <Chip
                          label={`+${amenities.length - 3} more`}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: '0.7rem',
                            height: 24,
                            borderColor: theme.primary,
                            color: theme.primary
                          }}
                        />
                      )}
                    </Box>
                  )}

                  <Box sx={{ 
                    mt: 'auto',
                    pt: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    {userRole === 'user' && !myProperties && (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBook(property.id);
                        }}
                        sx={{
                          backgroundColor: theme.primary,
                          color: 'white',
                          px: 2,
                          py: 0.5,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          '&:hover': {
                            backgroundColor: theme.secondary,
                          },
                        }}
                      >
                        Book Now
                      </Button>
                    )}
                  </Box>
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