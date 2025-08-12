import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  Rating,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  LocationOn as LocationIcon,
  Hotel as HotelIcon,
  Bathtub as BathtubIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  CalendarToday as CalendarTodayIcon,
  Block as BlockIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Room from '../../assets/images/Room.jpg';

const safeParse = (str) => {
  try {
    return typeof str === 'string' ? JSON.parse(str) : (str || []);
  } catch (error) {
    return [];
  }
};

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
      icon: <TrendingUpIcon />,
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
  variant = 'standard',
  showActions = true,
  showEditButton = false,
  showAvailabilityStatus = true,
  onView,
  onEdit,
  onBook,
  userRole
}) => {
  const navigate = useNavigate();
  
  if (!property) return null;

  const amenities = safeParse(property.amenities);
  const facilities = safeParse(property.facilities);
  const images = safeParse(property.images);
  
  const availabilityDetails = getAvailabilityDetails(property);
  const canBook = ['available', 'high_demand', 'partially_occupied'].includes(property.availability_status);

  const currentUserRole = userRole || localStorage.getItem('userRole');

  const handleView = (e) => {
    e.stopPropagation();
    if (onView) {
      onView(property.id);
    } else {
      navigate(`/property/${property.id}`);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(property.id);
    } else {
      switch (currentUserRole) {
        case 'propertyowner':
          navigate(`/updateproperty/${property.id}`);
          break;
        case 'admin':
          console.warn('Admin edit functionality not implemented');
          break;
        default:
          console.warn('Edit not allowed for this role');
      }
    }
  };

  const handleBook = (e) => {
    e.stopPropagation();
    if (onBook) {
      onBook(property.id);
    } else {
      switch (currentUserRole) {
        case 'user':
          navigate(`/user-booking/${property.id}`);
          break;
        case 'propertyowner':
          console.warn('Property owners cannot book their own properties');
          break;
        case 'admin':
          console.warn('Admin booking functionality not implemented');
          break;
        default:
          navigate(`/login`);
      }
    }
  };

  const handleCardClick = () => {
    if (variant !== 'compact') {
      handleView({ stopPropagation: () => {} });
    }
  };

  const primaryImage = images && images.length > 0 ? images[0] : Room;
  const bedroomCount = facilities?.Bedroom || facilities?.bedroom || 0;
  const bathroomCount = facilities?.Bathroom || facilities?.bathroom || 0;
  const price = property.price || 0;
  const rating = parseFloat(property.rating) || 0;
  const reviewCount = parseInt(property.total_ratings) || 0;

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
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        <CardMedia
          className="property-image"
          component="img"
          height={variant === 'compact' ? 140 : variant === 'expanded' ? 220 : 180}
          image={primaryImage}
          alt={property.property_type || 'Property'}
          sx={{ 
            transition: 'transform 0.3s ease-in-out',
            objectFit: 'cover'
          }}
        />
        
        {showAvailabilityStatus && (
          <Chip
            icon={availabilityDetails.icon}
            label={availabilityDetails.label}
            color={availabilityDetails.color}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              fontWeight: 'bold',
              backdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(255, 255, 255, 0.9)'
            }}
          />
        )}

        {property.property_type && (
          <Chip
            label={property.property_type}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              fontWeight: 'bold',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white'
            }}
          />
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, p: variant === 'compact' ? 1.5 : 2 }}>
        <Typography 
          variant={variant === 'compact' ? 'subtitle1' : 'h6'} 
          component="h3" 
          gutterBottom
          sx={{ 
            fontWeight: 'bold',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {property.unit_type || property.property_type}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {property.address || 'Location not specified'}
          </Typography>
        </Box>

        {rating > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Rating value={rating} precision={0.1} size="small" readOnly />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              {rating.toFixed(1)} ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          {bedroomCount > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <HotelIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {bedroomCount} bedroom{bedroomCount > 1 ? 's' : ''}
              </Typography>
            </Box>
          )}
          
          {bathroomCount > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <BathtubIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {bathroomCount} bathroom{bathroomCount > 1 ? 's' : ''}
              </Typography>
            </Box>
          )}
        </Box>

        {amenities && amenities.length > 0 && variant !== 'compact' && (
          <Box sx={{ mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {amenities.length} amenitie{amenities.length > 1 ? 's' : ''} available
            </Typography>
          </Box>
        )}

        <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold', mt: 'auto' }}>
          LKR {parseFloat(price).toLocaleString()}/month
        </Typography>

        {showAvailabilityStatus && availabilityDetails.message && (
          <Typography variant="caption" color={`${availabilityDetails.color}.main`} sx={{ fontWeight: 'medium' }}>
            {availabilityDetails.message}
          </Typography>
        )}
      </CardContent>

      {showActions && (
        <CardActions sx={{ pt: 0, px: variant === 'compact' ? 1.5 : 2, pb: variant === 'compact' ? 1.5 : 2 }}>
          <Button 
            size="small" 
            startIcon={<VisibilityIcon />}
            onClick={handleView}
            disabled={property.availability_status === 'unavailable'}
          >
            View
          </Button>
          
          {showEditButton && currentUserRole === 'propertyowner' && (
            <Button 
              size="small" 
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              Edit
            </Button>
          )}
          
          {canBook && !showEditButton && currentUserRole === 'user' && (
            <Button 
              size="small" 
              variant="contained"
              color="primary"
              onClick={handleBook}
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