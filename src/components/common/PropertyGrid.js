import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Typography,
  Box,
  Chip,
  Alert,
  Skeleton,
  Fade,
  useMediaQuery,
  IconButton
} from '@mui/material';
import ConfirmationDialog from '../common/ConfirmationDialog';
import { getProperties, deleteProperty, getAllProperties } from '../../api/propertyApi';
import { getApprovedProperties } from '../../api/adminAPI';
import { useNavigate } from 'react-router-dom';
import HotelIcon from '@mui/icons-material/Hotel';
import BathtubIcon from '@mui/icons-material/Bathtub';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import { useTheme } from '../../contexts/ThemeContext';
import { isFavouriteStatus, setFavouriteStatus } from '../../api/userInteractionApi';

// Helper function for safely parsing JSON - remains unchanged but documented
const safeParse = (str) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    return [];
  }
};

const PropertyGrid = ({ 
  limit, 
  isUserPage, 
  filters, 
  isAdminPage, 
  showApprovedProperties,
  showMyProperties,
  appliedFilters 
}) => {
  const [properties, setProperties] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [favouriteStatuses, setFavouriteStatuses] = useState({});
  const navigate = useNavigate();
  
  // Enhanced theme integration with responsive design considerations
  const { theme, isDark } = useTheme();
  const isMobile = useMediaQuery('(max-width:600px)');
  const isTablet = useMediaQuery('(max-width:900px)');

  // Data fetching logic remains the same but with enhanced error handling
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('token');
        let data = [];

        if (isAdminPage && showApprovedProperties) {
          data = await getApprovedProperties(token);
        } else if (isUserPage) {
          data = await getAllProperties();
        } else {
          data = await getProperties(token);
        }
        
        if (limit) {
          data = data.slice(-limit);
        }

        setProperties(data);
        
        // Apply filters
        let filtered = data;
        
        // Apply type filter if provided
        if (filters) {
          filtered = data.filter((property) =>
              Array.isArray(filters)
                ? filters.includes(property.property_type)
                : property.property_type === filters
            );
        }

        // Apply advanced filters if provided
        if (appliedFilters) {
          filtered = filtered.filter(property => {
            // Price filter
            if (appliedFilters.priceRange && property.price) {
              const price = property.price;
              if (price < appliedFilters.priceRange[0] || price > appliedFilters.priceRange[1]) {
                return false;
              }
            }

            // Rating filter
            if (appliedFilters.starRating > 0 && property.rating) {
              if (property.rating < appliedFilters.starRating) {
                return false;
              }
            }

            // Date availability filter
            if (appliedFilters.availabilityDate && property.available_from) {
              const availableDate = new Date(property.available_from);
              const filterDate = new Date(appliedFilters.availabilityDate);
              if (availableDate > filterDate) {
                return false;
              }
            }

            // Location filter
            if (appliedFilters.location && property.address) {
              if (!property.address.toLowerCase().includes(appliedFilters.location.toLowerCase())) {
                return false;
              }
            }

            return true;
          });
        }
            
        setFilteredProperties(filtered);

        // Fetch favourite statuses for user pages
        if (isUserPage && filtered.length > 0) {
          const userRole = localStorage.getItem('userRole');
          if (userRole === 'user') {
            const statuses = {};
            for (const property of filtered) {
              try {
                const favStatus = await isFavouriteStatus({ property_id: property.id });
                statuses[property.id] = favStatus.isFavourite;
              } catch (error) {
                console.error('Error fetching favourite status:', error);
                statuses[property.id] = false;
              }
            }
            setFavouriteStatuses(statuses);
          }
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
        setError('Failed to load properties. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [limit, filters, isUserPage, isAdminPage, showApprovedProperties, appliedFilters]);

  // Handle favourite toggle
  const handleFavouriteToggle = async (propertyId, currentStatus) => {
    const newStatus = !currentStatus;
    
    // Optimistically update UI
    setFavouriteStatuses(prev => ({
      ...prev,
      [propertyId]: newStatus
    }));

    try {
      await setFavouriteStatus({ property_id: propertyId, isFavourite: newStatus });
    } catch (error) {
      console.error('Error updating favourite status:', error);
      // Revert on error
      setFavouriteStatuses(prev => ({
        ...prev,
        [propertyId]: currentStatus
      }));
    }
  };

  // Dialog handling functions remain the same
  const handleRemoveClick = (property) => {
    setSelectedProperty(property);
    setOpenDialog(true);
  };

  const handleConfirmRemove = async () => {
    try {
      const token = localStorage.getItem('token');
      await deleteProperty(selectedProperty.id, token);
      setProperties(properties.filter((p) => p.id !== selectedProperty.id));
      setFilteredProperties(filteredProperties.filter((p) => p.id !== selectedProperty.id));
      setOpenDialog(false);
      setSelectedProperty(null);
    } catch (error) {
      console.error('Error removing property:', error);
      setError('Failed to remove property. Please try again.');
    }
  };

  const handleCancelRemove = () => {
    setOpenDialog(false);
    setSelectedProperty(null);
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

  // Advanced Status Chip Component with Theme Integration
  const getStatusChip = (property) => {
    const status = property.approval_status || 'unknown';
    
    // Define status configurations with theme-aware colors
    const statusConfig = {
      pending: {
        icon: <PendingIcon />,
        label: 'Under Review',
        color: theme.warning,
        backgroundColor: isDark ? `${theme.warning}20` : `${theme.warning}10`,
      },
      approved: {
        icon: <CheckCircleIcon />,
        label: 'Live',
        color: theme.success,
        backgroundColor: isDark ? `${theme.success}20` : `${theme.success}10`,
      },
      rejected: {
        icon: <CancelIcon />,
        label: 'Needs Revision',
        color: theme.error,
        backgroundColor: isDark ? `${theme.error}20` : `${theme.error}10`,
      },
      unknown: {
        icon: null,
        label: 'Unknown',
        color: theme.textDisabled,
        backgroundColor: theme.surfaceBackground,
      }
    };

    const config = statusConfig[status];
    
    return (
      <Chip 
        icon={config.icon}
        label={config.label}
        size="small"
        sx={{
          backgroundColor: config.backgroundColor,
          color: config.color,
          border: `1px solid ${config.color}40`,
          fontWeight: 500,
          '& .MuiChip-icon': {
            color: config.color,
          },
          transition: 'all 0.2s ease',
        }}
      />
    );
  };

  // Updated Action Button Generation
  const getPropertyActions = (property) => {
    const status = property.approval_status || 'unknown';
    
    // Base button styles that work across themes
    const baseButtonStyles = {
      borderRadius: 2,
      textTransform: 'none',
      fontWeight: 500,
      transition: 'all 0.2s ease',
      '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: theme.shadows.medium,
      },
    };

    if (isUserPage) {
      return (
        <Button 
          size="small" 
          variant="contained"
          startIcon={<VisibilityIcon />}
          onClick={() => navigate(`/user-viewproperty/${property.id}`)}
          sx={{
            ...baseButtonStyles,
            backgroundColor: theme.primary,
            color: isDark ? theme.textPrimary : '#FFFFFF',
            '&:hover': {
              ...baseButtonStyles['&:hover'],
              backgroundColor: theme.secondary,
            },
          }}
        >
          View Details
        </Button>
      );
    }

    if (isAdminPage) {
      return (
        <Button 
          size="small" 
          variant="outlined"
          startIcon={<VisibilityIcon />}
          onClick={() => navigate(`/user-viewproperty/${property.id}`)}
          sx={{
            ...baseButtonStyles,
            borderColor: theme.primary,
            color: theme.primary,
            '&:hover': {
              ...baseButtonStyles['&:hover'],
              backgroundColor: `${theme.primary}10`,
              borderColor: theme.secondary,
              color: theme.secondary,
            },
          }}
        >
          Review Property
        </Button>
      );
    }

    // Property owner actions with sophisticated styling
    const canEdit = status === 'pending' || status === 'rejected';
    
    return (
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {canEdit && (
          <Button
            size="small"
            variant="contained"
            onClick={() => navigate(`/updateproperty/${property.id}`)}
            sx={{
              ...baseButtonStyles,
              backgroundColor: theme.info,
              color: '#FFFFFF',
              '&:hover': {
                ...baseButtonStyles['&:hover'],
                backgroundColor: isDark ? theme.primary : theme.info,
              },
            }}
          >
            Edit
          </Button>
        )}
        
        {status === 'approved' && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<VisibilityIcon />}
            onClick={() => navigate(`/user-viewproperty/${property.id}`)}
            sx={{
              ...baseButtonStyles,
              borderColor: theme.success,
              color: theme.success,
              '&:hover': {
                ...baseButtonStyles['&:hover'],
                backgroundColor: `${theme.success}10`,
              },
            }}
          >
            View Live
          </Button>
        )}
        
        <Button
          size="small"
          variant="text"
          onClick={() => handleRemoveClick(property)}
          sx={{
            ...baseButtonStyles,
            color: theme.error,
            '&:hover': {
              ...baseButtonStyles['&:hover'],
              backgroundColor: `${theme.error}10`,
            },
          }}
        >
          Remove
        </Button>
      </Box>
    );
  };

  // Advanced Property Card Component with Theme-Responsive Design
  const renderPropertyCard = (property, index) => {
    const amenities = safeParse(property.amenities);
    const facilities = safeParse(property.facilities);
    const status = property.approval_status || 'unknown';
    const isFavourite = favouriteStatuses[property.id] || false;

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
              
              // Advanced hover effects that work across themes
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: theme.shadows.heavy,
                borderColor: theme.primary,
                
                // Subtle background gradient on hover
                background: isDark 
                  ? `linear-gradient(135deg, ${theme.cardBackground} 0%, ${theme.surfaceBackground} 100%)`
                  : `linear-gradient(135deg, ${theme.cardBackground} 0%, ${theme.primary}05 100%)`,
                
                '& .property-image': {
                  transform: 'scale(1.05)',
                },
              },
            }}
          >
            {/* Property Image with Theme-Aware Overlay */}
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
              
              {/* Favourite Button for User Pages */}
              {isUserPage && (
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
                      handleFavouriteToggle(property.id, isFavourite);
                    }}
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      color: isFavourite ? theme.error : theme.textDisabled,
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 1)',
                        transform: 'scale(1.1)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {isFavourite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </IconButton>
                </Box>
              )}
              
              {/* Status Badge with Theme Integration */}
              {!isUserPage && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    zIndex: 2,
                  }}
                >
                  {getStatusChip(property)}
                </Box>
              )}
              
              {/* Gradient Overlay for Better Text Readability */}
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

            {/* Property Information with Enhanced Typography */}
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

              {/* Price Information with Theme-Aware Highlighting */}
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

              {/* Property Features with Icon Integration */}
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
                    color: theme.textPrimary,
                    fontSize: '0.875rem',
                  }}
                >
                  <strong>Amenities:</strong> {amenities.slice(0, 3).join(', ')}
                  {amenities.length > 3 && ` +${amenities.length - 3} more`}
                </Typography>
              )}

              {/* Status-Specific Information */}
              {!isUserPage && (
                <Box sx={{ mt: 2 }}>
                  {status === 'rejected' && property.rejection_reason && (
                    <Alert 
                      severity="error" 
                      sx={{ 
                        fontSize: '0.8rem',
                        backgroundColor: `${theme.error}10`,
                        color: theme.error,
                        border: `1px solid ${theme.error}30`,
                        '& .MuiAlert-icon': {
                          color: theme.error,
                        },
                      }}
                    >
                      <strong>Rejection:</strong> {property.rejection_reason}
                    </Alert>
                  )}
                  
                  {status === 'pending' && (
                    <Alert 
                      severity="info" 
                      sx={{ 
                        fontSize: '0.8rem',
                        backgroundColor: `${theme.info}10`,
                        color: theme.info,
                        border: `1px solid ${theme.info}30`,
                        '& .MuiAlert-icon': {
                          color: theme.info,
                        },
                      }}
                    >
                      Under admin review - you'll be notified once approved
                    </Alert>
                  )}
                </Box>
              )}
            </CardContent>
            
            {/* Action Buttons Section */}
            <CardActions sx={{ p: 3, pt: 0 }}>
              {getPropertyActions(property)}
            </CardActions>
          </Card>
        </Grid>
      </Fade>
    );
  };

  // Loading State with Theme-Consistent Skeletons
  if (loading) {
    return (
      <Box sx={{ padding: '2rem' }}>
        <Typography 
          variant="h4" 
          align="center" 
          gutterBottom
          sx={{ color: theme.textPrimary, mb: 4 }}
        >
          Loading Properties...
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
      </Box>
    );
  }

  // Error State with Theme Integration
  if (error) {
    return (
      <Box sx={{ padding: '2rem' }}>
        <Alert 
          severity="error"
          sx={{
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
      </Box>
    );
  }

  const renderList = filters ? filteredProperties : properties;

  const getTitle = () => {
    if (isAdminPage) return 'Admin Property Management';
    if (isUserPage) return 'Available Properties';
    if (limit) return 'Recently Added Properties';
    return 'My Properties';
  };

  return (
    <Box sx={{ padding: '2rem' }}>
      {/* Page Header with Theme Integration */}
      {!isUserPage && (
        <Typography 
          variant="h4" 
          align="center" 
          gutterBottom
          sx={{
            color: theme.textPrimary,
            fontWeight: 600,
            mb: 2,
          }}
        >
          {getTitle()}
        </Typography>
      )}

      {/* Property Owner Summary */}
      {!isUserPage && !isAdminPage && renderList.length > 0 && (
        <Box 
          sx={{ 
            mb: 4, 
            textAlign: 'center',
            p: 3,
            backgroundColor: isDark ? theme.surfaceBackground : `${theme.primary}05`,
            borderRadius: 2,
            border: `1px solid ${theme.border}`,
          }}
        >
          <Typography variant="h6" sx={{ color: theme.textPrimary, mb: 1 }}>
            Property Portfolio Status
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: theme.success, fontWeight: 600 }}>
                {renderList.filter(p => p.approval_status === 'approved').length}
              </Typography>
              <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                Live Properties
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: theme.warning, fontWeight: 600 }}>
                {renderList.filter(p => p.approval_status === 'pending').length}
              </Typography>
              <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                Under Review
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: theme.error, fontWeight: 600 }}>
                {renderList.filter(p => p.approval_status === 'rejected').length}
              </Typography>
              <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                Need Revision
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Properties Grid */}
      <Grid container spacing={3}>
        {renderList?.map((property, index) => renderPropertyCard(property, index))}
      </Grid>

      {/* Empty State with Theme Integration */}
      {renderList?.length === 0 && (
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
          <Typography 
            variant="h5" 
            sx={{ 
              color: theme.textSecondary, 
              mb: 2,
              fontWeight: 500,
            }}
          >
            {isUserPage ? 'No properties available' : 'No properties found'}
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: theme.textSecondary,
              maxWidth: 400,
              mx: 'auto',
            }}
          >
            {isUserPage 
              ? 'Check back later for new listings or try adjusting your search criteria'
              : 'Start by adding your first property listing to get started'
            }
          </Typography>
        </Box>
      )}

      {/* Confirmation Dialog with Theme Integration */}
      <ConfirmationDialog
        open={openDialog}
        title="Confirm Removal"
        content={`Are you sure you want to remove "${selectedProperty?.property_type} - ${selectedProperty?.unit_type}"? This action cannot be undone.`}
        onConfirm={handleConfirmRemove}
        onCancel={handleCancelRemove}
      />
    </Box>
  );
};

export default PropertyGrid;