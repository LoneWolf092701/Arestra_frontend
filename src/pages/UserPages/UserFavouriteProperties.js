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
  Fade
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import VisibilityIcon from '@mui/icons-material/Visibility';
import HotelIcon from '@mui/icons-material/Hotel';
import BathtubIcon from '@mui/icons-material/Bathtub';
import PeopleIcon from '@mui/icons-material/People';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import { getFavouriteProperties, setFavouriteStatus } from '../../api/userInteractionApi';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

// Helper function for safely parsing JSON
const safeParse = (str) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    return [];
  }
};

const UserFavouriteProperties = () => {
  const [favouriteProperties, setFavouriteProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { theme, isDark } = useTheme();

  useEffect(() => {
    const fetchFavouriteProperties = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getFavouriteProperties();
        setFavouriteProperties(data);
      } catch (error) {
        console.error('Error fetching favourite properties:', error);
        setError('Failed to load favourite properties. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchFavouriteProperties();
  }, []);

  const handleRemoveFromFavourites = async (propertyId) => {
    try {
      await setFavouriteStatus({ property_id: propertyId, isFavourite: false });
      setFavouriteProperties(prev => prev.filter(property => property.id !== propertyId));
    } catch (error) {
      console.error('Error removing from favourites:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Enhanced No Image Component
  const NoImagePlaceholder = ({ propertyType }) => (
    <Box
      sx={{
        width: '100%',
        height: 180,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.surfaceBackground,
        border: `2px dashed ${theme.border}`,
        borderRadius: 1,
      }}
    >
      <ImageNotSupportedIcon 
        sx={{ 
          fontSize: 48, 
          color: theme.textDisabled,
          mb: 1
        }} 
      />
      <Typography 
        variant="body2" 
        sx={{ 
          color: theme.textDisabled,
          textAlign: 'center',
          fontWeight: 500
        }}
      >
        No Image Available
      </Typography>
      <Typography 
        variant="caption" 
        sx={{ 
          color: theme.textDisabled,
          textAlign: 'center',
          mt: 0.5
        }}
      >
        {propertyType}
      </Typography>
    </Box>
  );

  const renderPropertyCard = (property, index) => {
    const amenities = safeParse(property.amenities);
    const facilities = safeParse(property.facilities);

    return (
      <Fade in={true} timeout={300 + (index * 100)} key={property.id}>
        <Grid item xs={12} sm={6} md={4}>
          <Card 
            sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: theme.cardBackground,
              borderRadius: 3,
              border: `1px solid ${theme.border}`,
              boxShadow: theme.shadows.light,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: theme.shadows.heavy,
                borderColor: theme.primary,
                
                background: isDark 
                  ? `linear-gradient(135deg, ${theme.cardBackground} 0%, ${theme.surfaceBackground} 100%)`
                  : `linear-gradient(135deg, ${theme.cardBackground} 0%, ${theme.primary}05 100%)`,
                
                '& .property-image': {
                  transform: 'scale(1.05)',
                },
              },
            }}
          >
            {/* Property Image */}
            <Box sx={{ position: 'relative', overflow: 'hidden' }}>
              {property.image ? (
                <CardMedia
                  component="img"
                  height="180"
                  image={property.image}
                  alt={property.property_type}
                  className="property-image"
                  sx={{
                    transition: 'transform 0.3s ease',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <NoImagePlaceholder propertyType={property.property_type} />
              )}
              
              {/* Favourite Button */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  zIndex: 3,
                }}
              >
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFromFavourites(property.id);
                  }}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    color: theme.error,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 1)',
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <FavoriteIcon />
                </IconButton>
              </Box>
              
              {/* Gradient Overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '50%',
                  background: isDark 
                    ? 'linear-gradient(transparent, rgba(0,0,0,0.7))'
                    : 'linear-gradient(transparent, rgba(0,0,0,0.3))',
                  pointerEvents: 'none',
                }}
              />
            </Box>

            {/* Property Information */}
            <CardContent sx={{ flexGrow: 1, p: 3 }}>
              <Typography 
                variant="h6" 
                component="h3"
                sx={{
                  color: theme.textPrimary,
                  fontWeight: 600,
                  mb: 1,
                  lineHeight: 1.3,
                }}
              >
                {property.property_type} - {property.unit_type}
              </Typography>

              <Typography 
                variant="body2" 
                sx={{
                  color: theme.textSecondary,
                  mb: 2,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: 1.4,
                }}
              >
                <strong>Address:</strong> {property.address}
              </Typography>

              <Typography 
                variant="body2" 
                sx={{
                  color: theme.textSecondary,
                  mb: 2,
                }}
              >
                <strong>Available:</strong> {formatDate(property.available_from)} – {formatDate(property.available_to)}
              </Typography>

              {/* Price Information */}
              {property.price && (
                <Typography 
                  variant="h6" 
                  sx={{
                    color: theme.primary,
                    fontWeight: 600,
                    mb: 2,
                  }}
                >
                  LKR {property.price.toLocaleString()}/month
                </Typography>
              )}

              {/* Property Features */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                  p: 2,
                  backgroundColor: isDark ? theme.surfaceBackground : `${theme.primary}05`,
                  borderRadius: 2,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HotelIcon sx={{ color: theme.primary, fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: theme.textPrimary, fontWeight: 500 }}>
                    {facilities?.Bedroom || 0} Bed
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BathtubIcon sx={{ color: theme.primary, fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: theme.textPrimary, fontWeight: 500 }}>
                    {facilities?.Bathroom || 0} Bath
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PeopleIcon sx={{ color: theme.primary, fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: theme.textPrimary, fontWeight: 500 }}>
                    {safeParse(property.roommates)?.length || 0} Mate
                  </Typography>
                </Box>
              </Box>

              {/* Amenities Preview */}
              {amenities?.length > 0 && (
                <Typography 
                  variant="body2" 
                  sx={{
                    color: theme.textSecondary,
                    fontSize: '0.875rem',
                  }}
                >
                  <strong>Amenities:</strong> {amenities.slice(0, 3).join(', ')}
                  {amenities.length > 3 && ` +${amenities.length - 3} more`}
                </Typography>
              )}
            </CardContent>
            
            {/* Action Buttons */}
            <CardActions sx={{ p: 3, pt: 0 }}>
              <Button 
                size="small" 
                variant="contained"
                startIcon={<VisibilityIcon />}
                onClick={() => navigate(`/user-viewproperty/${property.id}`)}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  backgroundColor: theme.primary,
                  color: isDark ? theme.textPrimary : '#FFFFFF',
                  '&:hover': {
                    backgroundColor: theme.secondary,
                    transform: 'translateY(-1px)',
                    boxShadow: theme.shadows.medium,
                  },
                  transition: 'all 0.2s ease',
                }}
                fullWidth
              >
                View Details
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Fade>
    );
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ 
        background: isDark 
          ? `linear-gradient(135deg, ${theme.background} 0%, ${theme.surfaceBackground} 50%, ${theme.background} 100%)`
          : `linear-gradient(135deg, ${theme.background} 0%, ${theme.primary}05 50%, ${theme.background} 100%)`,
        minHeight: '100vh',
        py: 4
      }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h4" 
            align="center" 
            gutterBottom
            sx={{ color: theme.textPrimary, mb: 4 }}
          >
            Loading Favourite Properties...
          </Typography>
          <Grid container spacing={3}>
            {[...Array(6)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ backgroundColor: theme.cardBackground, border: `1px solid ${theme.border}` }}>
                  <Skeleton 
                    variant="rectangular" 
                    height={180} 
                    sx={{ backgroundColor: theme.surfaceBackground }}
                  />
                  <CardContent>
                    <Skeleton 
                      variant="text" 
                      height={32} 
                      sx={{ backgroundColor: theme.surfaceBackground, mb: 1 }}
                    />
                    <Skeleton 
                      variant="text" 
                      height={20} 
                      sx={{ backgroundColor: theme.surfaceBackground, mb: 1 }}
                    />
                    <Skeleton 
                      variant="text" 
                      height={20} 
                      width="60%" 
                      sx={{ backgroundColor: theme.surfaceBackground }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      background: isDark 
        ? `linear-gradient(135deg, ${theme.background} 0%, ${theme.surfaceBackground} 50%, ${theme.background} 100%)`
        : `linear-gradient(135deg, ${theme.background} 0%, ${theme.primary}05 50%, ${theme.background} 100%)`,
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

        {/* Properties Grid */}
        {favouriteProperties.length > 0 ? (
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
      </Container>
    </Box>
  );
};

export default UserFavouriteProperties;