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
  CircularProgress,
  Tooltip,
  Menu,
  MenuItem,
  CardActions
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  AttachMoney as PriceIcon,
  Bed as BedIcon,
  Bathtub as BathtubIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Home as HomeIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon
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
  onToggleFavorite,
  showFavoriteButton = false,
  favoriteButtonProps = {},
  limit,
  variant = 'default',
  emptyStateMessage = 'No properties available',
  emptyStateSubtitle
}) => {
  const navigate = useNavigate();
  const { theme, isDark } = useTheme();
  const userRole = getUserRole();
  const [imageErrors, setImageErrors] = useState(new Set());
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);

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

  // Transform Azure URLs - same logic as in UserViewProperty
  const transformUrlToAzure = (url) => {
    if (!url || typeof url !== 'string') return url;
    
    // Transform localhost URLs to Azure Blob Storage URLs
    if (url.includes('localhost:5000/uploads/')) {
      return url.replace('http://localhost:5000/uploads/', 'http://127.0.0.1:10000/devstoreaccount1/staywise-uploads/');
    }
    
    return url;
  };

  const getImageUrl = (images, propertyId) => {
    // Use either property.id or property.property_id - whichever exists
    const imageKey = `property_${propertyId}`;
    
    if (imageErrors.has(imageKey)) {
      return Room;
    }

    const parsedImages = safeJsonParse(images, []);
    
    if (!Array.isArray(parsedImages) || parsedImages.length === 0) {
      return Room;
    }

    const firstImage = parsedImages[0];
    
    let imageUrl = '';
    if (typeof firstImage === 'string' && firstImage.trim()) {
      imageUrl = firstImage.trim();
    } else if (typeof firstImage === 'object' && firstImage?.url && typeof firstImage.url === 'string') {
      imageUrl = firstImage.url.trim();
    } else {
      return Room;
    }
    
    // Apply Azure URL transformation - THIS FIXES THE IMAGE ISSUE
    return transformUrlToAzure(imageUrl);
  };

  const handleImageError = (propertyId) => {
    // Handle both id and property_id
    const imageKey = `property_${propertyId}`;
    setImageErrors(prev => new Set([...prev, imageKey]));
  };

  const formatPrice = (price) => {
    if (!price) return 'Price not set';
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numericPrice)) return 'Price not set';
    return `LKR ${Math.round(numericPrice).toLocaleString()}`;
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
      facilities: safeJsonParse(property.facilities, []),
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
    // Use whichever ID is available - THIS FIXES THE UNDEFINED PROPERTY ID ISSUE
    const propertyId = property.id || property.property_id;
    
    if (onViewProperty) {
      onViewProperty(property);
    } else {
      if (userRole === 'propertyowner' && myProperties) {
        navigate(`/view-property/${propertyId}`);
      } else {
        navigate(`/user-property-view/${propertyId}`);
      }
    }
  };

  const handleEdit = (property) => {
    const propertyId = property.id || property.property_id;

    if (onEditProperty) {
      onEditProperty(propertyId);
    } else {
      navigate(`/update-property/${propertyId}`);
    }
  };

  const handleBook = (propertyId) => {
    navigate(`/user-booking/${propertyId}`);
  };

  const handleFavoriteToggle = (property, event) => {
    if (event) {
      event.stopPropagation();
    }
    if (onToggleFavorite) {
      onToggleFavorite(property);
    }
  };

  const handleMenuOpen = (event, property) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedProperty(property);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedProperty(null);
  };

  const handleShare = async (property) => {
    const propertyId = property.id || property.property_id;
    const shareData = {
      title: `${property.property_type} - ${property.unit_type}`,
      text: `Check out this ${property.property_type} in ${property.address}`,
      url: `${window.location.origin}/user-property-view/${propertyId}`
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if (error.name !== 'AbortError') {
          // Fallback to clipboard
          navigator.clipboard.writeText(shareData.url);
        }
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareData.url);
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
    handleMenuClose();
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
              maxWidth: 400,
              mx: 'auto'
            }}
          >
            {emptyStateSubtitle}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {limitedProperties.map((property, index) => {
        // Use whichever ID is available for all operations
        const propertyId = property.id || property.property_id;
        const imageUrl = getImageUrl(property.images, propertyId);
        const amenities = Array.isArray(property.amenities) ? property.amenities : [];
        const isFavorited = property.isFavorited || favoriteButtonProps.isFavorited;
        const isRemoving = favoriteButtonProps.isRemoving && favoriteButtonProps.isRemoving(propertyId);

        return (
          <Grid item xs={12} sm={6} md={4} key={`${propertyId}-${index}`}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                backgroundColor: theme.cardBackground,
                borderRadius: 3,
                overflow: 'hidden',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: isDark 
                    ? '0 20px 40px rgba(0,0,0,0.4)' 
                    : '0 20px 40px rgba(0,0,0,0.15)',
                  '& .property-image': {
                    transform: 'scale(1.05)',
                  },
                  '& .property-actions': {
                    opacity: 1,
                    transform: 'translateY(0)',
                  }
                }
              }}
              onClick={() => handleView(property)}
            >
              {/* Property Image */}
              <Box sx={{ position: 'relative', overflow: 'hidden', height: 220 }}>
                <CardMedia
                  component="img"
                  className="property-image"
                  height="220"
                  image={imageUrl}
                  alt={`${property.property_type} - ${property.unit_type}`}
                  onError={() => handleImageError(propertyId)}
                  sx={{
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease',
                    width: '100%',
                    height: '100%'
                  }}
                />
                
                {/* Property Type Badge */}
                <Chip
                  label={property.property_type}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    backgroundColor: theme.primary,
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.75rem'
                  }}
                />

                {/* Favorite Button */}
                {showFavoriteButton && (
                  <IconButton
                    onClick={(e) => handleFavoriteToggle(property, e)}
                    disabled={isRemoving}
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      color: isFavorited ? 'error.main' : 'grey.600',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,1)',
                        transform: 'scale(1.1)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {isRemoving ? (
                      <CircularProgress size={18} />
                    ) : (
                      isFavorited ? <FavoriteIcon /> : <FavoriteBorderIcon />
                    )}
                  </IconButton>
                )}

                {/* Menu Button */}
                <IconButton
                  onClick={(e) => handleMenuOpen(e, property)}
                  sx={{
                    position: 'absolute',
                    bottom: 12,
                    right: 12,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    opacity: 0,
                    transform: 'translateY(10px)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.8)',
                    }
                  }}
                  className="property-actions"
                >
                  <MoreVertIcon />
                </IconButton>
              </Box>

              {/* Property Details */}
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 1,
                    color: theme.textPrimary,
                    fontSize: '1.1rem',
                    lineHeight: 1.3
                  }}
                >
                  {property.unit_type}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <LocationIcon 
                    sx={{ 
                      color: theme.textSecondary, 
                      fontSize: 18, 
                      mt: 0.2, 
                      mr: 1 
                    }} 
                  />
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: theme.textSecondary,
                      fontSize: '0.9rem',
                      lineHeight: 1.4
                    }}
                  >
                    {getTruncatedAddress(property.address)}
                  </Typography>
                </Box>

                {/* Property Features */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  {property.bedrooms && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <BedIcon sx={{ fontSize: 16, color: theme.textSecondary }} />
                      <Typography variant="body2" sx={{ color: theme.textSecondary, fontSize: '0.85rem' }}>
                        {property.bedrooms}
                      </Typography>
                    </Box>
                  )}
                  {property.bathrooms && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <BathtubIcon sx={{ fontSize: 16, color: theme.textSecondary }} />
                      <Typography variant="body2" sx={{ color: theme.textSecondary, fontSize: '0.85rem' }}>
                        {property.bathrooms}
                      </Typography>
                    </Box>
                  )}
                  {property.views_count > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ViewIcon sx={{ fontSize: 16, color: theme.textSecondary }} />
                      <Typography variant="body2" sx={{ color: theme.textSecondary, fontSize: '0.85rem' }}>
                        {property.views_count}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Amenities */}
                {amenities && amenities.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {amenities.slice(0, 3).map((amenity, idx) => (
                        <Chip
                          key={idx}
                          label={amenity}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: '0.7rem',
                            height: 24,
                            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                            borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'
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
                            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                            borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                )}

                {/* Price */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PriceIcon sx={{ color: theme.primary, fontSize: 20, mr: 1 }} />
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700,
                      color: theme.primary,
                      fontSize: '1.15rem'
                    }}
                  >
                    {formatPrice(property.price)}
                  </Typography>
                </Box>
              </CardContent>

              {/* Action Buttons */}
              <CardActions sx={{ px: 3, pb: 3, pt: 0 }}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<ViewIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleView(property);
                  }}
                  sx={{
                    backgroundColor: theme.primary,
                    color: 'white',
                    fontWeight: 600,
                    py: 1,
                    '&:hover': {
                      backgroundColor: theme.secondary,
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  View Details
                </Button>

                {showMyProperties && property.approval_status !== 'rejected' && (
  <Button
    variant="outlined"
    startIcon={<EditIcon />}
    onClick={(e) => {
      e.stopPropagation();
      handleEdit(property);
    }}
    sx={{
      ml: 1,
      borderColor: theme.primary,
      color: theme.primary,
      '&:hover': {
        backgroundColor: theme.primary,
        color: 'white'
      }
    }}
  >
    Edit
  </Button>
)}
              </CardActions>
            </Card>
          </Grid>
        );
      })}

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => selectedProperty && handleShare(selectedProperty)}>
          <ShareIcon sx={{ mr: 1 }} />
          Share
        </MenuItem>
        {showFavoriteButton && selectedProperty && (
          <MenuItem 
            onClick={() => {
              handleFavoriteToggle(selectedProperty);
              handleMenuClose();
            }}
            sx={{ 
              color: selectedProperty.isFavorited ? 'error.main' : 'inherit' 
            }}
          >
            {selectedProperty.isFavorited ? <FavoriteIcon sx={{ mr: 1 }} /> : <FavoriteBorderIcon sx={{ mr: 1 }} />}
            {selectedProperty.isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
          </MenuItem>
        )}
      </Menu>
    </Grid>
  );
};

export default PropertyGrid;