import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Box,
  Button,
  Chip,
  Rating,
  IconButton,
  Tooltip
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useNavigate } from 'react-router-dom';
import PropertyValidationUtils from '../../utils/PropertyValidationUtils';

// Helper function to safely parse JSON
const safeParse = (str, defaultValue = []) => {
  try {
    return JSON.parse(str || '[]');
  } catch {
    return defaultValue;
  }
};

const PropertyCard = ({ 
  property, 
  showActions = true, 
  showEditButton = false, 
  showFavoriteButton = false,
  isFavorite = false,
  onFavoriteToggle = null,
  onView = null,
  onEdit = null,
  variant = 'default',
  elevation = 1 
}) => {
  const navigate = useNavigate();

  // Parse property data
  const amenities = safeParse(property.amenities);
  const images = safeParse(property.images);
  const facilities = safeParse(property.facilities, {});

  // Get availability status
  const availabilityStatus = (() => {
    const validation = PropertyValidationUtils.validatePropertyAvailability(property);
    
    if (validation.isAvailable) {
      if (validation.warnings.length > 0) {
        return {
          status: 'warning',
          label: 'Available Soon',
          icon: <WarningIcon sx={{ fontSize: 16 }} />,
          color: 'warning',
          tooltip: validation.warnings[0]
        };
      }
      return {
        status: 'available',
        label: 'Available',
        icon: <CheckCircleIcon sx={{ fontSize: 16 }} />,
        color: 'success',
        tooltip: 'Property is currently available for booking'
      };
    } else {
      return {
        status: 'unavailable',
        label: 'Unavailable',
        icon: <ErrorIcon sx={{ fontSize: 16 }} />,
        color: 'error',
        tooltip: validation.reasons.join(', ')
      };
    }
  })();

  // Get the first image or placeholder
  const getImageUrl = () => {
    if (images.length > 0) {
      return images[0];
    }
    return 'https://via.placeholder.com/300x200?text=No+Image';
  };

  // Handle view action
  const handleView = () => {
    if (onView) {
      onView(property.id);
    } else {
      if (showEditButton) {
        navigate(`/property-details/${property.id}`);
      } else {
        navigate(`/user-viewproperty/${property.id}`);
      }
    }
  };

  // Handle edit action
  const handleEdit = () => {
    if (onEdit) {
      onEdit(property.id);
    } else {
      navigate(`/updateproperty/${property.id}`);
    }
  };

  // Handle favorite toggle
  const handleFavoriteToggle = (e) => {
    e.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle(property.id, !isFavorite);
    }
  };

  // Format price
  const formatPrice = (price) => {
    if (!price) return 'Price on request';
    return `LKR ${price.toLocaleString()}/month`;
  };

  // Get property status chip
  const getStatusChip = () => {
    if (property.approval_status === 'approved') {
      return <Chip label="Active" color="success" size="small" />;
    } else if (property.approval_status === 'pending') {
      return <Chip label="Pending" color="warning" size="small" />;
    } else if (property.approval_status === 'rejected') {
      return <Chip label="Rejected" color="error" size="small" />;
    }
    return <Chip label={property.status || 'Unknown'} color="default" size="small" />;
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        cursor: 'pointer',
        '&:hover': {
          transform: variant === 'compact' ? 'none' : 'translateY(-4px)',
          boxShadow: variant === 'compact' ? 2 : 4
        },
        ...(variant === 'compact' && { maxWidth: 300 })
      }}
      elevation={elevation}
      onClick={handleView}
    >
      {/* Property Image */}
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height={variant === 'compact' ? 150 : 200}
          image={getImageUrl()}
          alt={`${property.property_type} in ${property.address}`}
          sx={{ objectFit: 'cover' }}
        />
        
        {/* Favorite Button */}
        {showFavoriteButton && (
          <IconButton
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 1)',
              }
            }}
            onClick={handleFavoriteToggle}
          >
            {isFavorite ? (
              <FavoriteIcon sx={{ color: 'red' }} />
            ) : (
              <FavoriteBorderIcon />
            )}
          </IconButton>
        )}

        {/* Property Status (for owner view) */}
        {showEditButton && (
          <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
            {getStatusChip()}
          </Box>
        )}
      </Box>
      
      <CardContent sx={{ flexGrow: 1, p: variant === 'compact' ? 2 : 3 }}>
        {/* Property Title and Status */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography 
            variant={variant === 'compact' ? 'subtitle1' : 'h6'} 
            component="div" 
            sx={{ fontWeight: 'bold', flexGrow: 1 }}
          >
            {property.property_type} - {property.unit_type}
          </Typography>
          {!showEditButton && (
            <Tooltip title={availabilityStatus.tooltip} placement="top">
              <Chip
                icon={availabilityStatus.icon}
                label={availabilityStatus.label}
                color={availabilityStatus.color}
                size="small"
                variant="outlined"
                sx={{ 
                  fontSize: '0.75rem',
                  height: 24,
                  ml: 1
                }}
              />
            </Tooltip>
          )}
        </Box>
        
        {/* Location */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationOnIcon sx={{ color: 'text.secondary', mr: 0.5, fontSize: 16 }} />
          <Typography variant="body2" color="text.secondary" noWrap>
            {property.address}
          </Typography>
        </Box>

        {/* Rating */}
        {property.rating !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Rating value={property.rating || 0} readOnly size="small" precision={0.5} />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({property.total_ratings || 0})
            </Typography>
          </Box>
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
        {property.available_from && availabilityStatus.status === 'warning' && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <CalendarTodayIcon sx={{ color: 'text.secondary', mr: 0.5, fontSize: 14 }} />
            <Typography variant="body2" color="text.secondary">
              Available from: {new Date(property.available_from).toLocaleDateString()}
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
        </CardActions>
      )}
    </Card>
  );
};

export default PropertyCard;