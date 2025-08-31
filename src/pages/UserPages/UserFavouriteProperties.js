import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Button,
  Alert,
  IconButton,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  SearchOff as SearchOffIcon
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import { getUserFavorites, removeFromFavorites } from '../../api/userInteractionApi';
import PropertyGrid from '../../components/common/PropertyGrid';
import Pagination from '../../components/common/Pagination';
import AppSnackbar from '../../components/common/AppSnackbar';

const UserFavouriteProperties = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  // State management
  const [favouriteProperties, setFavouriteProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  // Snackbar state
  const [snackbarProps, setSnackbarProps] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [propertyToRemove, setPropertyToRemove] = useState(null);
  const [removingFavorite, setRemovingFavorite] = useState(null);

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbarProps({
      open: true,
      message,
      severity
    });
  }, []);

  const fetchFavouriteProperties = useCallback(async (page = 1, showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    
    try {
      const response = await getUserFavorites({ 
        page: page, 
        limit: pagination.limit 
      });
      
      if (response?.favorites && Array.isArray(response.favorites)) {
        // MINIMAL transformation - just ensure both id and property_id exist
        const transformedProperties = response.favorites.map(item => ({
          ...item,
          id: item.id || item.property_id, // Ensure id exists
          property_id: item.property_id || item.id, // Ensure property_id exists
          isFavorited: true
        }));
        
        setFavouriteProperties(transformedProperties);
        
        // Update pagination
        setPagination(prev => ({
          ...prev,
          page: response.pagination?.current_page || page,
          total: response.pagination?.total_items || response.favorites.length,
          totalPages: response.pagination?.total_pages || Math.ceil((response.pagination?.total_items || response.favorites.length) / prev.limit)
        }));
      } else {
        setFavouriteProperties([]);
        setPagination(prev => ({
          ...prev,
          page: 1,
          total: 0,
          totalPages: 0
        }));
      }
    } catch (error) {
      console.error('Error fetching favourite properties:', error);
      setError('Failed to load favourite properties. Please try again.');
      showSnackbar('Failed to load favourite properties', 'error');
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
    }
  }, [pagination.limit, showSnackbar]);

  // Initial load
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

  const handleViewProperty = (property) => {
    // Use whichever ID is available
    const propertyId = property.id || property.property_id;
    navigate(`/user-property-view/${propertyId}`);
  };

  const handleRemoveFromFavorites = (property) => {
    setPropertyToRemove(property);
    setConfirmDialog(true);
  };

  const confirmRemoveFromFavorites = async () => {
    if (!propertyToRemove) return;

    const propertyId = propertyToRemove.id || propertyToRemove.property_id;
    setRemovingFavorite(propertyId);
    setConfirmDialog(false);
    
    try {
      await removeFromFavorites(propertyId);
      
      // Remove property from local state
      setFavouriteProperties(prev => 
        prev.filter(prop => (prop.id || prop.property_id) !== propertyId)
      );

      // Update pagination total
      setPagination(prev => ({ 
        ...prev, 
        total: Math.max(0, prev.total - 1),
        totalPages: Math.ceil(Math.max(0, prev.total - 1) / prev.limit)
      }));

      showSnackbar('Property removed from favorites successfully');
    } catch (error) {
      console.error('Error removing from favorites:', error);
      showSnackbar('Failed to remove property from favorites', 'error');
    } finally {
      setRemovingFavorite(null);
      setPropertyToRemove(null);
    }
  };

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
        Start browsing properties and add them to your favorites to see them here. 
        You can easily access and manage all your favorite properties in one place.
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
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
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

      {/* Error Alert */}
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

      {/* Content */}
      {favouriteProperties.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Property Grid - Using the same component as UserAllProperties */}
          <PropertyGrid
            properties={favouriteProperties}
            loading={false}
            onViewProperty={handleViewProperty}
            showFavoriteButton={true}
            onToggleFavorite={handleRemoveFromFavorites}
            favoriteButtonProps={{
              isFavorited: true,
              isRemoving: (propertyId) => removingFavorite === propertyId,
              tooltipText: "Remove from favorites"
            }}
            emptyStateMessage="No favorite properties found"
            emptyStateSubtitle="Your favorite properties will appear here"
          />

          {/* Pagination */}
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

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog}
        onClose={() => setConfirmDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Remove from Favorites</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove "{propertyToRemove?.property_type} - {propertyToRemove?.unit_type}" from your favorites? 
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

      {/* Snackbar */}
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