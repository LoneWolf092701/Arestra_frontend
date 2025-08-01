import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Box,
  Button,
  Chip,
  Rating,
  Alert
} from '@mui/material';
import {
  LocationOn as LocationOnIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  CalendarToday as CalendarTodayIcon,
  People as PeopleIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Block as BlockIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Helper function to safely parse JSON strings
const safeParse = (str) => {
  try {
    return typeof str === 'string' ? JSON.parse(str) : (str || []);
  } catch (error) {
    return [];
  }
};

// Helper function to get the first image URL
const getImageUrl = (images) => {
  const imageArray = safeParse(images);
  if (imageArray.length > 0 && imageArray[0].url) {
    return imageArray[0].url;
  }
  return 'https://via.placeholder.com/300x200?text=No+Image';
};

// Helper function to format price
const formatPrice = (price) => {
  if (!price) return 'Price on request';
  return `LKR ${parseInt(price).toLocaleString()}/month`;
};

// Helper function to get availability status details
const getAvailabilityDetails = (property) => {
  const status = property.availability_status || 'available';
  const pendingRequests = property.pending_requests || 0;
  const confirmedBookings = property.confirmed_bookings || 0;
  
  const statusConfig = {
    available: {
      color: 'success',
      icon: <CheckCircleIcon />,
      label: 'Available',
      message: 'Ready for booking',
      severity: 'success'
    },
    high_demand: {
      color: 'warning',
      icon: <PeopleIcon />,
      label: 'High Demand',
      message: `${pendingRequests} guest${pendingRequests > 1 ? 's' : ''} interested`,
      severity: 'warning'
    },
    partially_occupied: {
      color: 'info',
      icon: <ScheduleIcon />,
      label: 'Partially Booked',
      message: `${confirmedBookings} confirmed booking${confirmedBookings > 1 ? 's' : ''}`,
      severity: 'info'
    },
    coming_soon: {
      color: 'default',
      icon: <CalendarTodayIcon />,
      label: 'Coming Soon',
      message: property.available_from ? `Available from ${new Date(property.available_from).toLocaleDateString()}` : 'Available soon',
      severity: 'info'
    },
    expired: {
      color: 'error',
      icon: <BlockIcon />,
      label: 'Expired',
      message: 'Availability period expired',
      severity: 'error'
    },
    unavailable: {
      color: 'error',
      icon: <BlockIcon />,
      label: 'Unavailable',
      message: 'Currently not available',
      severity: 'error'
    }
  };

  return statusConfig[status] || statusConfig.available;
};

const PropertyCard = ({ 
  property, 
  variant = 'standard', // 'standard', 'compact', 'expanded'
  showActions = true,
  showEditButton = false,
  showAvailabilityStatus = true,
  onView,
  onEdit
}) => {
  const navigate = useNavigate();
  
  if (!property) return null;

  // Parse property data
  const amenities = safeParse(property.amenities);
  const facilities = safeParse(property.facilities);
  const images = safeParse(property.images);
  
  // Get availability status configuration
  const availabilityDetails = getAvailabilityDetails(property);
  const canBook = ['available', 'high_demand', 'partially_occupied'].includes(property.availability_status);

  // Handle action functions
  const handleView = () => {
    if (onView) {
      onView(property.id);
    } else {
      navigate(`/user-viewproperty/${property.id}`);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(property.id);
    } else {
      navigate(`/properties/edit/${property.id}`);
    }
  };

  const handleCardClick = () => {
    if (variant !== 'compact') {
      handleView();
    }
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'all 0.3s ease-in-out',
        cursor: variant === 'compact' ? 'default' : 'pointer',
        '&:hover': {
          transform: variant === 'compact' ? 'none' : 'translateY(-4px)',
          boxShadow: variant === 'compact' ? 1 : 6,
          '& .property-image': {
            transform: 'scale(1.05)'
          }
        },
        position: 'relative'
      }}
      onClick={handleCardClick}
    >
      {/* Property Image */}
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        <CardMedia
          className="property-image"
          component="img"
          height={variant === 'compact' ? 140 : variant === 'expanded' ? 220 : 180}
          image={getImageUrl(images)}
          alt={`${property.property_type} in ${property.address}`}
          sx={{ 
            objectFit: 'cover',
            transition: 'transform 0.3s ease-in-out'
          }}
        />
        
        {/* Availability Status Overlay */}
        {showAvailabilityStatus && (
          <Box sx={{ 
            position: 'absolute', 
            top: 8, 
            right: 8,
            display: 'flex',
            gap: 0.5
          }}>
            <Chip 
              icon={availabilityDetails.icon}
              label={availabilityDetails.label}
              color={availabilityDetails.color}
              size="small"
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                fontWeight: 'bold',
                fontSize: '0.7rem'
              }}
            />
          </Box>
        )}

        {/* Property Type Badge */}
        <Box sx={{ 
          position: 'absolute', 
          top: 8, 
          left: 8 
        }}>
          <Chip 
            label={property.property_type || 'Property'}
            size="small"
            sx={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '0.7rem'
            }}
          />
        </Box>
      </Box>
      
      <CardContent sx={{ flexGrow: 1, p: variant === 'compact' ? 1.5 : 2 }}>
        {/* Property Title */}
        <Typography 
          variant={variant === 'compact' ? 'subtitle1' : 'h6'} 
          component="div" 
          sx={{ 
            fontWeight: 'bold',
            mb: 1,
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {property.unit_type || 'Unit'}
        </Typography>
        
        {/* Location */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationOnIcon sx={{ color: 'text.secondary', mr: 0.5, fontSize: 16 }} />
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {property.address}
          </Typography>
        </Box>

        {/* Rating (if available) */}
        {property.rating !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Rating value={property.rating || 0} readOnly size="small" precision={0.5} />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({property.total_ratings || 0})
            </Typography>
          </Box>
        )}

        {/* Availability Status Message */}
        {showAvailabilityStatus && availabilityDetails.message && (
          <Alert 
            severity={availabilityDetails.severity}
            variant="outlined"
            sx={{ 
              mb: 1.5,
              py: 0.5,
              '& .MuiAlert-message': {
                fontSize: '0.75rem',
                fontWeight: 500
              }
            }}
            icon={false}
          >
            {availabilityDetails.message}
          </Alert>
        )}

        {/* Price */}
        <Typography 
          variant={variant === 'compact' ? 'h6' : 'h5'} 
          color="primary" 
          sx={{ fontWeight: 'bold', mb: 1 }}
        >
          {formatPrice(property.price)}
        </Typography>

        {/* Property Details */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {facilities.Bedroom || property.bedrooms || 0} bed • {facilities.Bathroom || property.bathrooms || 0} bath
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {amenities.length} amenities
          </Typography>
        </Box>

        {/* Availability Date */}
        {property.available_from && availabilityDetails.severity === 'info' && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <CalendarTodayIcon sx={{ color: 'text.secondary', mr: 0.5, fontSize: 14 }} />
            <Typography variant="body2" color="text.secondary">
              Available from: {new Date(property.available_from).toLocaleDateString()}
            </Typography>
          </Box>
        )}

        {/* Booking Competition Warning */}
        {property.pending_requests > 0 && showAvailabilityStatus && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mt: 1,
            p: 1,
            backgroundColor: 'warning.light',
            borderRadius: 1,
            opacity: 0.8
          }}>
            <WarningIcon sx={{ color: 'warning.dark', mr: 0.5, fontSize: 16 }} />
            <Typography variant="caption" color="warning.dark">
              {property.pending_requests} other{property.pending_requests > 1 ? 's' : ''} interested
            </Typography>
          </Box>
        )}

        {/* Property Description (for expanded variant) */}
        {variant === 'expanded' && property.description && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mt: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {property.description}
          </Typography>
        )}
      </CardContent>
      
      {/* Action Buttons */}
      {showActions && (
        <CardActions sx={{ p: variant === 'compact' ? 1 : 2 }}>
          <Button 
            size="small" 
            startIcon={<VisibilityIcon />}
            onClick={(e) => {
              e.stopPropagation();
              handleView();
            }}
            disabled={property.availability_status === 'unavailable'}
          >
            View
          </Button>
          {showEditButton && (
            <Button 
              size="small" 
              startIcon={<EditIcon />}
              onClick={(e) => {
                e.stopPropagation();
                handleEdit();
              }}
            >
              Edit
            </Button>
          )}
          {/* Book Now Button */}
          {canBook && !showEditButton && (
            <Button 
              size="small" 
              variant="contained"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/book/${property.id}`);
              }}
              sx={{ ml: 'auto' }}
            >
              {property.availability_status === 'high_demand' ? 'Book Quick!' : 'Book Now'}
            </Button>
          )}
        </CardActions>
      )}
    </Card>
  );
};

export default PropertyCard;