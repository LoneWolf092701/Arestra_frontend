import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Home as HomeIcon,
  Bathtub as BathtubIcon,
  Kitchen as KitchenIcon,
  LocalParking as ParkingIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Rule as RuleIcon,
  Policy as PolicyIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const PropertyCard = ({ 
  property, 
  onView, 
  onEdit, 
  onDelete, 
  showActions = true, 
  variant = 'default',
  userRole = 'user'
}) => {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const parseJsonField = (field) => {
    if (!field) return null;
    if (typeof field === 'object') return field;
    if (typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch {
        return null;
      }
    }
    return field;
  };

  const getImageUrl = (images) => {
    const parsedImages = parseJsonField(images);
    
    if (!parsedImages || !Array.isArray(parsedImages) || parsedImages.length === 0) {
      return '/api/placeholder/400/250';
    }

    const firstImage = parsedImages[0];
    
    if (typeof firstImage === 'string' && firstImage.trim()) {
      return firstImage.trim();
    }
    
    if (typeof firstImage === 'object' && firstImage?.url && typeof firstImage.url === 'string') {
      return firstImage.url.trim();
    }
    
    return '/api/placeholder/400/250';
  };

  const amenities = parseJsonField(property.amenities);
  const facilities = parseJsonField(property.facilities);
  const rules = parseJsonField(property.rules);
  const roommates = parseJsonField(property.roommates);
  const contractPolicy = property.contract_policy || property.contractPolicy;
  const images = parseJsonField(property.images);

  const primaryImage = getImageUrl(property.images);

  const getAmenitiesDisplay = () => {
    if (!amenities) return [];
    
    // If amenities is already an array, return it
    if (Array.isArray(amenities)) {
      return amenities.filter(amenity => amenity && amenity.trim());
    }
    
    // If amenities is an object, extract keys where value > 0
    if (typeof amenities === 'object') {
      return Object.keys(amenities).filter(key => 
        amenities[key] && (amenities[key] === 1 || amenities[key] > 0)
      );
    }
    
    // If amenities is a string, try to parse or split
    if (typeof amenities === 'string') {
      try {
        const parsed = JSON.parse(amenities);
        if (Array.isArray(parsed)) {
          return parsed.filter(amenity => amenity && amenity.trim());
        }
        if (typeof parsed === 'object') {
          return Object.keys(parsed).filter(key => 
            parsed[key] && (parsed[key] === 1 || parsed[key] > 0)
          );
        }
      } catch {
        // If parsing fails, treat as comma-separated string
        return amenities.split(',').map(item => item.trim()).filter(item => item.length > 0);
      }
    }
    
    return [];
  };

  const getFacilitiesDisplay = () => {
    if (!facilities) return {};
    
    const displayFacilities = {};
    
    // If facilities is an array (like ["Bedrooms", "Living Area"])
    if (Array.isArray(facilities)) {
      if (facilities.length === 0) return {};
      facilities.forEach(facility => {
        if (facility && facility.trim()) {
          displayFacilities[facility] = 1;
        }
      });
      return displayFacilities;
    }
    
    // If facilities is already an object
    if (typeof facilities === 'object') {
      Object.entries(facilities).forEach(([key, value]) => {
        if (value > 0) {
          displayFacilities[key] = value;
        }
      });
      return displayFacilities;
    }
    
    return {};
  };

  const handleDetailsOpen = () => {
    setDetailsOpen(true);
  };

  const handleDetailsClose = () => {
    setDetailsOpen(false);
  };

  const handleCardClick = () => {
    // Make the entire card clickable to view property
    if (onView) {
      onView(property);
    }
  };

  const handleViewClick = (e) => {
    // Prevent card click when view button is clicked
    e.stopPropagation();
    if (onView) {
      onView(property);
    }
  };

  const displayAmenities = getAmenitiesDisplay();
  const displayFacilities = getFacilitiesDisplay();

  return (
    <>
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          borderRadius: 2,
          boxShadow: 3,
          cursor: 'pointer', // Make card appear clickable
          transition: 'all 0.3s ease',
          '&:hover': { 
            boxShadow: 6,
            transform: 'translateY(-2px)' // Add hover effect
          }
        }}
        onClick={handleCardClick} // Make entire card clickable
      >
        <CardMedia
          component="img"
          height="200"
          image={primaryImage}
          alt={property.property_type}
          sx={{ objectFit: 'cover' }}
        />

        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          <Typography variant="h6" component="h3" gutterBottom>
            {property.property_type} - {property.unit_type}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
            <Typography variant="body2" color="text.secondary" noWrap>
              {property.address?.substring(0, 50)}
              {property.address?.length > 50 ? '...' : ''}
            </Typography>
          </Box>

          <Typography 
            variant="h6" 
            color="primary" 
            sx={{ fontWeight: 'bold', mb: 1 }}
          >
            LKR {parseInt(property.price || 0).toLocaleString()} / month
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <HomeIcon sx={{ fontSize: 16, mr: 0.5 }} />
              <Typography variant="caption">
                {displayFacilities.Bedroom || displayFacilities.bedroom || property.bedrooms || 0} Bed
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <BathtubIcon sx={{ fontSize: 16, mr: 0.5 }} />
              <Typography variant="caption">
                {displayFacilities.Bathroom || displayFacilities.bathroom || property.bathrooms || 0} Bath
              </Typography>
            </Box>
          </Box>

          {property.approval_status && (
            <Chip 
              label={property.approval_status.toUpperCase()} 
              color={
                property.approval_status === 'approved' ? 
                'success' :
                property.approval_status === 'pending' ? 'warning' : 'error'
              }
              size="small"
              sx={{ mb: 1 }}
            />
          )}

          {/* Fixed Amenities Display */}
          {displayAmenities.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                Amenities:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {displayAmenities.slice(0, 3).map((amenity, index) => (
                  <Chip 
                    key={index}
                    label={amenity} 
                    size="small" 
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: '20px' }}
                  />
                ))}
                {displayAmenities.length > 3 && (
                  <Chip 
                    label={`+${displayAmenities.length - 3} more`} 
                    size="small" 
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: '20px' }}
                  />
                )}
              </Box>
            </Box>
          )}

          {/* Fixed Facilities Display */}
          {Object.keys(displayFacilities).length > 0 && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                Facilities:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {Object.entries(displayFacilities).map(([key, value]) => (
                  <Chip
                    key={key}
                    label={`${value} ${key}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: '20px' }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </CardContent>

        {showActions && (
          <Box sx={{ p: 2, pt: 0 }}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}>
              {/* View Button - Always show */}
              <Button
                size="small"
                variant="contained"
                color="primary"
                startIcon={<VisibilityIcon />}
                onClick={handleViewClick}
                sx={{ flexGrow: 1 }}
              >
                View
              </Button>
              
              <Button
                size="small"
                variant="outlined"
                startIcon={<InfoIcon />}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card click
                  handleDetailsOpen();
                }}
              >
                Details
              </Button>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                {onEdit && (
                  <IconButton 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click
                      onEdit(property);
                    }} 
                    color="info"
                  >
                    <EditIcon />
                  </IconButton>
                )}
                {onDelete && (
                  <IconButton 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click
                      onDelete(property);
                    }} 
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            </Box>
          </Box>
        )}
      </Card>

      {/* Details Dialog */}
      <Dialog 
        open={detailsOpen} 
        onClose={handleDetailsClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Property Details
            <IconButton onClick={handleDetailsClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <List dense>
                <ListItem>
                  <ListItemIcon><HomeIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Bedrooms" 
                    secondary={displayFacilities.Bedroom || displayFacilities.bedroom || property.bedrooms || 0}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><BathtubIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Bathrooms" 
                    secondary={displayFacilities.Bathroom || displayFacilities.bathroom || property.bathrooms || 0}
                  />
                </ListItem>
                {Object.entries(displayFacilities).map(([key, value]) => (
                  key !== 'Bedroom' && key !== 'Bathroom' && key !== 'bedroom' && key !== 'bathroom' && (
                    <ListItem key={key}>
                      <ListItemIcon><HomeIcon /></ListItemIcon>
                      <ListItemText primary={key} secondary={value} />
                    </ListItem>
                  )
                ))}
              </List>
            </Grid>

            <Grid item xs={12} md={6}>
              {displayAmenities.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>Amenities</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {displayAmenities.map((amenity, index) => (
                      <Chip key={index} label={amenity} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}

              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Available From
              </Typography>
              <Typography variant="body1" fontWeight="medium" sx={{ mb: 2 }}>
                {property.available_from ? 
                  new Date(property.available_from).toLocaleDateString() : 
                  'Immediately'
                }
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Available Until
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {property.available_to ? 
                  new Date(property.available_to).toLocaleDateString() : 
                  'No end date'
                }
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleDetailsClose}>Close</Button>
          {onView && (
            <Button variant="contained" onClick={() => { onView(property); handleDetailsClose(); }}>
              View Full Details
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PropertyCard;