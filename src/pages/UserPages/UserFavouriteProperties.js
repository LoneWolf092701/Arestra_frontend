import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  Chip,
  Rating,
  Tooltip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  Paper,
  Skeleton
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BedIcon from '@mui/icons-material/Bed';
import BathtubIcon from '@mui/icons-material/Bathtub';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ShareIcon from '@mui/icons-material/Share';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { getUserFavorites, removeFromFavorites, getPropertyRating } from '../../api/userInteractionApi';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import AppSnackbar from '../../components/common/AppSnackbar';

const UserFavouriteProperties = () => {
  const [favouriteProperties, setFavouriteProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingFavorite, setRemovingFavorite] = useState(null);
  const [propertyRatings, setPropertyRatings] = useState({});
  const [ratingsLoading, setRatingsLoading] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarProps, setSnackbarProps] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const navigate = useNavigate();
  const { theme, isDark } = useTheme();

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbarProps({
      open: true,
      message,
      severity
    });
  }, []);

  const fetchPropertyRatings = useCallback(async (properties) => {
    if (!properties || properties.length === 0) return;

    const ratingsToFetch = properties.filter(prop => 
      prop.property_id && !propertyRatings[prop.property_id] && !ratingsLoading[prop.property_id]
    );

    if (ratingsToFetch.length === 0) return;

    const loadingState = {};
    ratingsToFetch.forEach(prop => {
      loadingState[prop.property_id] = true;
    });
    setRatingsLoading(prev => ({ ...prev, ...loadingState }));

    const ratingsPromises = ratingsToFetch.map(async (property) => {
      try {
        const rating = await getPropertyRating(property.property_id);
        return {
          propertyId: property.property_id,
          rating: rating || { average_rating: 0, total_ratings: 0 }
        };
      } catch (error) {
        console.warn(`Failed to fetch rating for property ${property.property_id}:`, error);
        return {
          propertyId: property.property_id,
          rating: { average_rating: 0, total_ratings: 0 }
        };
      }
    });

    try {
      const ratingsResults = await Promise.allSettled(ratingsPromises);
      const successfulRatings = {};
      const completedLoading = {};

      ratingsResults.forEach((result, index) => {
        const propertyId = ratingsToFetch[index].property_id;
        completedLoading[propertyId] = false;

        if (result.status === 'fulfilled') {
          successfulRatings[result.value.propertyId] = result.value.rating;
        } else {
          successfulRatings[propertyId] = { average_rating: 0, total_ratings: 0 };
        }
      });

      setPropertyRatings(prev => ({ ...prev, ...successfulRatings }));
      setRatingsLoading(prev => ({ ...prev, ...completedLoading }));
    } catch (error) {
      console.error('Error fetching property ratings:', error);
      const completedLoading = {};
      ratingsToFetch.forEach(prop => {
        completedLoading[prop.property_id] = false;
      });
      setRatingsLoading(prev => ({ ...prev, ...completedLoading }));
    }
  }, [propertyRatings, ratingsLoading]);

  const fetchFavouriteProperties = useCallback(async (page = 1, showLoading = true) => {
    if (showLoading) setLoading(true);
    setError('');
    
    try {
      const data = await getUserFavorites({ 
        page, 
        limit: pagination.limit 
      });
      
      setFavouriteProperties(data.favorites || []);
      setPagination(prev => ({
        ...prev,
        page: data.pagination?.page || page,
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.totalPages || 0
      }));
      
      if (data.favorites && data.favorites.length > 0) {
        await fetchPropertyRatings(data.favorites);
      }
    } catch (error) {
      console.error('Error fetching favourite properties:', error);
      setError('Failed to load favourite properties. Please try again.');
      showSnackbar('Failed to load favourite properties', 'error');
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
    }
  }, [pagination.limit, fetchPropertyRatings, showSnackbar]);

  useEffect(() => {
    fetchFavouriteProperties(1, true);
  }, []);

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchFavouriteProperties(newPage, true);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFavouriteProperties(pagination.page, false);
  };

  const handleMenuOpen = (event, property) => {
    setAnchorEl(event.currentTarget);
    setSelectedProperty(property);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProperty(null);
  };

  const handleRemoveFromFavorites = () => {
    setConfirmDialog(true);
    handleMenuClose();
  };

  const confirmRemoveFromFavorites = async () => {
    if (!selectedProperty) return;

    setRemovingFavorite(selectedProperty.property_id);
    setConfirmDialog(false);
    
    try {
      await removeFromFavorites(selectedProperty.property_id);
      
      setFavouriteProperties(prev => 
        prev.filter(prop => prop.property_id !== selectedProperty.property_id)
      );
      
      setPropertyRatings(prev => {
        const updated = { ...prev };
        delete updated[selectedProperty.property_id];
        return updated;
      });

      setPagination(prev => ({ 
        ...prev, 
        total: Math.max(0, prev.total - 1) 
      }));

      showSnackbar('Property removed from favorites successfully');
    } catch (error) {
      console.error('Error removing from favorites:', error);
      showSnackbar('Failed to remove property from favorites', 'error');
    } finally {
      setRemovingFavorite(null);
      setSelectedProperty(null);
    }
  };

  const handleViewProperty = (propertyId) => {
    navigate(`/user-property-view/${propertyId}`);
  };

  const handleShareProperty = async (property) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${property.property_type} in ${property.address}`,
          text: `Check out this amazing ${property.property_type} for ${property.price}`,
          url: `${window.location.origin}/user-property-view/${property.property_id}`
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          fallbackShare(property);
        }
      }
    } else {
      fallbackShare(property);
    }
    handleMenuClose();
  };

  const fallbackShare = (property) => {
    const url = `${window.location.origin}/user-property-view/${property.property_id}`;
    navigator.clipboard.writeText(url).then(() => {
      showSnackbar('Property link copied to clipboard!');
    }).catch(() => {
      showSnackbar('Failed to copy link', 'error');
    });
  };

  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? 'Price not available' : `$${numPrice.toLocaleString()}`;
  };

  const getImageUrl = (images) => {
    if (!images) return '/placeholder-property.jpg';
    
    if (typeof images === 'string') {
      try {
        const parsed = JSON.parse(images);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : '/placeholder-property.jpg';
      } catch {
        return images.includes('http') ? images : '/placeholder-property.jpg';
      }
    }
    
    if (Array.isArray(images) && images.length > 0) {
      return images[0];
    }
    
    return '/placeholder-property.jpg';
  };

  const LoadingSkeleton = () => (
    <Grid container spacing={3}>
      {[...Array(6)].map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card sx={{ height: '100%' }}>
            <Skeleton variant="rectangular" height={200} />
            <CardContent>
              <Skeleton variant="text" height={24} />
              <Skeleton variant="text" height={20} width="60%" />
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Skeleton variant="circular" width={20} height={20} />
                <Skeleton variant="text" height={20} width="40%" sx={{ ml: 1 }} />
              </Box>
              <Skeleton variant="text" height={28} width="50%" sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const EmptyState = () => (
    <Paper
      sx={{
        textAlign: 'center',
        py: 8,
        px: 4,
        backgroundColor: theme.cardBackground,
        borderRadius: 3
      }}
    >
      <SearchOffIcon sx={{ fontSize: 80, color: theme.textSecondary, mb: 2 }} />
      <Typography variant="h5" sx={{ color: theme.textPrimary, mb: 2, fontWeight: 600 }}>
        No Favorite Properties Yet
      </Typography>
      <Typography variant="body1" sx={{ color: theme.textSecondary, mb: 4, maxWidth: 400, mx: 'auto' }}>
        Start browsing properties and add them to your favorites to see them here. You can easily access and manage all your favorite properties in one place.
      </Typography>
      <Button
        variant="contained"
        size="large"
        onClick={() => navigate('/user-allproperties')}
        sx={{
          backgroundColor: theme.primary,
          '&:hover': { backgroundColor: theme.secondary },
          px: 4,
          py: 1.5,
          borderRadius: 2,
          fontWeight: 600
        }}
      >
        Browse Properties
      </Button>
    </Paper>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 4, color: theme.textPrimary, fontWeight: 600 }}>
          My Favorite Properties
        </Typography>
        <LoadingSkeleton />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ color: theme.textPrimary, fontWeight: 600 }}>
          My Favorite Properties
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Refresh favorites">
            <IconButton
              onClick={handleRefresh}
              disabled={refreshing}
              sx={{ 
                backgroundColor: theme.cardBackground,
                '&:hover': { backgroundColor: theme.primary, color: 'white' }
              }}
            >
              {refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 4, borderRadius: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => fetchFavouriteProperties(1, true)}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {favouriteProperties.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <Grid container spacing={3}>
            {favouriteProperties.map((property) => {
              const rating = propertyRatings[property.property_id];
              const isRatingLoading = ratingsLoading[property.property_id];
              const isRemoving = removingFavorite === property.property_id;

              return (
                <Grid item xs={12} sm={6} md={4} key={property.property_id}>
                  <Card
                    sx={{
                      height: '100%',
                      backgroundColor: theme.cardBackground,
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      opacity: isRemoving ? 0.5 : 1,
                      transform: 'translateY(0)',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                      },
                      position: 'relative'
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={getImageUrl(property.images)}
                        alt={property.property_type}
                        sx={{ 
                          objectFit: 'cover',
                          backgroundColor: theme.isDark ? '#444' : '#f5f5f5'
                        }}
                        onError={(e) => {
                          e.target.src = '/placeholder-property.jpg';
                        }}
                      />
                      
                      <IconButton
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          '&:hover': { backgroundColor: 'rgba(255,255,255,1)' }
                        }}
                        onClick={(e) => handleMenuOpen(e, property)}
                        disabled={isRemoving}
                      >
                        <MoreVertIcon />
                      </IconButton>

                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          backgroundColor: theme.primary,
                          color: 'white',
                          borderRadius: 1,
                          px: 1,
                          py: 0.5,
                          typography: 'caption',
                          fontWeight: 600
                        }}
                      >
                        {property.unit_type || property.property_type}
                      </Box>
                    </Box>

                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: theme.textPrimary, 
                          fontWeight: 600,
                          mb: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {property.property_type}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOnIcon sx={{ fontSize: 16, color: theme.textSecondary, mr: 0.5 }} />
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: theme.textSecondary,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {property.address}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        {property.bedrooms && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <BedIcon sx={{ fontSize: 16, color: theme.textSecondary, mr: 0.5 }} />
                            <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                              {property.bedrooms}
                            </Typography>
                          </Box>
                        )}
                        {property.bathrooms && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <BathtubIcon sx={{ fontSize: 16, color: theme.textSecondary, mr: 0.5 }} />
                            <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                              {property.bathrooms}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        {isRatingLoading ? (
                          <Skeleton variant="rectangular" width={100} height={20} />
                        ) : rating ? (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Rating 
                              value={rating.average_rating || 0} 
                              precision={0.1} 
                              size="small" 
                              readOnly 
                            />
                            <Typography variant="body2" sx={{ color: theme.textSecondary, ml: 1 }}>
                              ({rating.total_ratings || 0})
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                            No ratings yet
                          </Typography>
                        )}

                        {property.views_count !== undefined && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <VisibilityIcon sx={{ fontSize: 16, color: theme.textSecondary, mr: 0.5 }} />
                            <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                              {property.views_count}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: theme.primary, 
                          fontWeight: 700,
                          mb: 2 
                        }}
                      >
                        {formatPrice(property.price)}/month
                      </Typography>

                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => handleViewProperty(property.property_id)}
                        disabled={isRemoving}
                        sx={{
                          backgroundColor: theme.primary,
                          '&:hover': { backgroundColor: theme.secondary },
                          mt: 'auto',
                          borderRadius: 2,
                          fontWeight: 600
                        }}
                      >
                        {isRemoving ? <CircularProgress size={20} color="inherit" /> : 'View Details'}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {pagination.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
                sx={{
                  '& .MuiPaginationItem-root': {
                    backgroundColor: theme.cardBackground,
                    '&:hover': {
                      backgroundColor: theme.primary,
                      color: 'white'
                    },
                    '&.Mui-selected': {
                      backgroundColor: theme.primary,
                      color: 'white'
                    }
                  }
                }}
              />
            </Box>
          )}
        </>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => handleShareProperty(selectedProperty)}>
          <ShareIcon sx={{ mr: 1 }} />
          Share Property
        </MenuItem>
        <MenuItem onClick={handleRemoveFromFavorites} sx={{ color: 'error.main' }}>
          <FavoriteIcon sx={{ mr: 1 }} />
          Remove from Favorites
        </MenuItem>
      </Menu>

      <Dialog
        open={confirmDialog}
        onClose={() => setConfirmDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Remove from Favorites</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove this property from your favorites? 
            You can always add it back later.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>Cancel</Button>
          <Button 
            onClick={confirmRemoveFromFavorites} 
            color="error" 
            variant="contained"
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      <AppSnackbar
        open={snackbarProps.open}
        message={snackbarProps.message}
        severity={snackbarProps.severity}
        onClose={() => setSnackbarProps(prev => ({ ...prev, open: false }))}
      />
    </Container>
  );
};

export default UserFavouriteProperties;