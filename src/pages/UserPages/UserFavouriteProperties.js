import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  CardActions, 
  Button, 
  IconButton, 
  Alert,
  Skeleton,
  Fade,
  Rating,
  Chip,
  CircularProgress
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import VisibilityIcon from '@mui/icons-material/Visibility';
import HotelIcon from '@mui/icons-material/Hotel';
import BathtubIcon from '@mui/icons-material/Bathtub';
import PeopleIcon from '@mui/icons-material/People';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { getFavouriteProperties, setFavouriteStatus } from '../../api/userInteractionApi';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import AppSnackbar, { useSnackbar } from '../../components/common/AppSnackbar';

// Helper function for safely parsing JSON
const safeParse = (str, defaultValue = {}) => {
  try {
    return str ? JSON.parse(str) : defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

const UserFavouriteProperties = () => {
  const [favouriteProperties, setFavouriteProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingFavorites, setRemovingFavorites] = useState(new Set());
  const navigate = useNavigate();
  const { theme, isDark } = useTheme();
  const { showSnackbar, snackbarProps } = useSnackbar();

  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-image.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${imagePath}`;
  };

  useEffect(() => {
    const fetchFavouriteProperties = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getFavouriteProperties();
        // The backend returns { properties: [...], pagination: {...} }
        setFavouriteProperties(response.properties || []);
      } catch (error) {
        console.error('Error fetching favourite properties:', error);
        setError(error.message || 'Failed to load favourite properties. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchFavouriteProperties();
  }, []);

  const handleRemoveFromFavorites = async (propertyId) => {
    if (removingFavorites.has(propertyId)) return;

    setRemovingFavorites(prev => new Set(prev).add(propertyId));

    try {
      await setFavouriteStatus({ property_id: propertyId, isFavourite: false });
      
      // Remove property from the list
      setFavouriteProperties(prev => 
        prev.filter(property => property.id !== propertyId)
      );
      
      showSnackbar('Removed from favorites successfully!', 'success');
    } catch (error) {
      console.error('Error removing from favorites:', error);
      showSnackbar('Failed to remove from favorites. Please try again.', 'error');
    } finally {
      setRemovingFavorites(prev => {
        const newSet = new Set(prev);
        newSet.delete(propertyId);
        return newSet;
      });
    }
  };

  const handleViewProperty = (propertyId) => {
    navigate(`/user-viewproperty/${propertyId}`);
  };

  const renderPropertyCard = (property, index) => {
    const images = safeParse(property.images, []);
    const facilities = safeParse(property.facilities, {});
    const isRemoving = removingFavorites.has(property.id);

    return (
      <Fade in={true} timeout={500 + index * 100} key={property.id}>
        <Grid item xs={12} sm={6} md={4}>
          <Card 
            sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              position: 'relative',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: isDark ? 
                  `0 8px 25px ${theme.shadowColor}` : 
                  '0 8px 25px rgba(0,0,0,0.15)',
              },
              backgroundColor: isDark ? theme.cardBackground : '#FFFFFF',
              border: `1px solid ${theme.border}`,
            }}
            onClick={() => handleViewProperty(property.id)}
          >
            {/* Property Image */}
            <Box sx={{ position: 'relative' }}>
              {images.length > 0 ? (
                <CardMedia
                  component="img"
                  height="200"
                  image={getImageUrl(images[0])}
                  alt={`${property.property_type} in ${property.address}`}
                  sx={{ objectFit: 'cover' }}
                />
              ) : (
                <Box
                  sx={{
                    height: 200,
                    backgroundColor: theme.surfaceBackground,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: theme.textDisabled,
                  }}
                >
                  <ImageNotSupportedIcon sx={{ fontSize: 40 }} />
                </Box>
              )}
              
              {/* Favorite Button */}
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFromFavorites(property.id);
                }}
                disabled={isRemoving}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                  },
                  color: 'red',
                }}
              >
                {isRemoving ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <FavoriteIcon />
                )}
              </IconButton>

              {/* Property Type Chip */}
              <Chip
                label={property.property_type}
                size="small"
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  left: 8,
                  backgroundColor: theme.primary,
                  color: isDark ? theme.textPrimary : '#FFFFFF',
                  fontWeight: 'bold',
                }}
              />
            </Box>

            {/* Property Details */}
            <CardContent sx={{ flexGrow: 1, p: 2 }}>
              {/* Title and Location */}
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 'bold',
                  color: theme.textPrimary,
                  mb: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {property.property_type} - {property.unit_type}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationOnIcon sx={{ color: theme.textSecondary, mr: 0.5, fontSize: 18 }} />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: theme.textSecondary,
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {property.address}
                </Typography>
              </Box>

              {/* Price */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AttachMoneyIcon sx={{ color: theme.primary, mr: 0.5, fontSize: 20 }} />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: theme.primary,
                  }}
                >
                  LKR {parseFloat(property.price || 0).toLocaleString()}/month
                </Typography>
              </Box>

              {/* Rating */}
              {property.rating && property.rating > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Rating 
                    value={parseFloat(property.rating)} 
                    readOnly 
                    size="small" 
                    precision={0.5}
                  />
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      ml: 1, 
                      color: theme.textSecondary 
                    }}
                  >
                    ({property.total_ratings || 0})
                  </Typography>
                </Box>
              )}

              {/* Facilities */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {facilities.Bedroom && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <HotelIcon sx={{ color: theme.textSecondary, mr: 0.5, fontSize: 16 }} />
                    <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                      {facilities.Bedroom}
                    </Typography>
                  </Box>
                )}
                {facilities.Bathroom && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <BathtubIcon sx={{ color: theme.textSecondary, mr: 0.5, fontSize: 16 }} />
                    <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                      {facilities.Bathroom}
                    </Typography>
                  </Box>
                )}
                {facilities.MaxPeople && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PeopleIcon sx={{ color: theme.textSecondary, mr: 0.5, fontSize: 16 }} />
                    <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                      {facilities.MaxPeople}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>

            {/* Action Buttons */}
            <CardActions sx={{ p: 2, pt: 0 }}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<VisibilityIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewProperty(property.id);
                }}
                sx={{
                  backgroundColor: theme.primary,
                  color: isDark ? theme.textPrimary : '#FFFFFF',
                  '&:hover': {
                    backgroundColor: theme.secondary,
                  },
                }}
              >
                View Details
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Fade>
    );
  };

  // Loading skeleton
  const renderLoadingSkeleton = () => (
    <Grid container spacing={3}>
      {[...Array(6)].map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card>
            <Skeleton variant="rectangular" height={200} />
            <CardContent>
              <Skeleton variant="text" height={30} />
              <Skeleton variant="text" height={20} width="60%" />
              <Skeleton variant="text" height={25} width="40%" />
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Skeleton variant="text" height={20} width={30} />
                <Skeleton variant="text" height={20} width={30} />
                <Skeleton variant="text" height={20} width={30} />
              </Box>
            </CardContent>
            <CardActions>
              <Skeleton variant="rectangular" height={36} width="100%" />
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box sx={{
      background: isDark ? 
        `linear-gradient(135deg, ${theme.background} 0%, ${theme.surfaceBackground} 50%, ${theme.background} 100%)` :
        `linear-gradient(135deg, ${theme.background} 0%, ${theme.primary}05 50%, ${theme.background} 100%)`,
      minHeight: '100vh',
      py: 4
    }}>
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              color: theme.textPrimary, 
              fontWeight: 600,
              mb: 2
            }}
          >
            My Favourite Properties
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: theme.textSecondary,
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            Properties you've saved for later viewing. Click the heart icon to remove from favourites.
          </Typography>
        </Box>

        {/* Error State */}
        {error && (
          <Alert 
            severity="error"
            sx={{
              mb: 4,
              backgroundColor: `${theme.error}10`,
              color: theme.error,
              border: `1px solid ${theme.error}30`,
              '& .MuiAlert-icon': {
                color: theme.error,
              },
            }}
          >
            {error}
          </Alert>
        )}

        {/* Content */}
        {loading ? (
          renderLoadingSkeleton()
        ) : favouriteProperties.length > 0 ? (
          <>
            <Typography 
              variant="h6" 
              sx={{ 
                color: theme.textPrimary, 
                mb: 3,
                fontWeight: 500
              }}
            >
              {favouriteProperties.length} Favourite {favouriteProperties.length === 1 ? 'Property' : 'Properties'}
            </Typography>
            <Grid container spacing={3}>
              {favouriteProperties.map((property, index) => renderPropertyCard(property, index))}
            </Grid>
          </>
        ) : (
          /* Empty State */
          <Box 
            sx={{ 
              textAlign: 'center', 
              mt: 6, 
              p: 6,
              backgroundColor: isDark ? theme.surfaceBackground : `${theme.primary}05`,
              borderRadius: 3,
              border: `2px dashed ${theme.border}`,
            }}
          >
            <FavoriteIcon 
              sx={{ 
                fontSize: 80, 
                color: theme.textDisabled, 
                mb: 2 
              }} 
            />
            <Typography 
              variant="h5" 
              sx={{ 
                color: theme.textSecondary, 
                mb: 2,
                fontWeight: 500,
              }}
            >
              No Favourite Properties Yet
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: theme.textSecondary,
                maxWidth: 400,
                mx: 'auto',
                mb: 3
              }}
            >
              Start browsing properties and click the heart icon to save your favourites here.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/user-allproperties')}
              sx={{
                backgroundColor: theme.primary,
                color: isDark ? theme.textPrimary : '#FFFFFF',
                '&:hover': {
                  backgroundColor: theme.secondary,
                },
                px: 4,
                py: 1.5
              }}
            >
              Browse Properties
            </Button>
          </Box>
        )}

        {/* Snackbar for notifications */}
        <AppSnackbar {...snackbarProps} />
      </Container>
    </Box>
  );
};

export default UserFavouriteProperties;