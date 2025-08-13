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
    if (typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch {
        return null;
      }
    }
    return field;
  };

  const amenities = parseJsonField(property.amenities);
  const facilities = parseJsonField(property.facilities);
  const rules = parseJsonField(property.rules);
  const roommates = parseJsonField(property.roommates);
  const contractPolicy = property.contract_policy || property.contractPolicy;
  const images = parseJsonField(property.images);

  const primaryImage = images && images.length > 0 ? 
    (typeof images[0] === 'string' ? images[0] : images[0]?.url) : 
    '/api/placeholder/400/250';

  const getAmenitiesDisplay = () => {
    if (!amenities) return [];
    
    if (Array.isArray(amenities)) {
      return amenities;
    }
    
    if (typeof amenities === 'object') {
      return Object.keys(amenities).filter(key => amenities[key] > 0);
    }
    
    return [];
  };

  const getFacilitiesDisplay = () => {
    if (!facilities || typeof facilities !== 'object') return {};
    
    const displayFacilities = {};
    Object.entries(facilities).forEach(([key, value]) => {
      if (value && parseInt(value) > 0) {
        displayFacilities[key] = parseInt(value);
      }
    });
    
    return displayFacilities;
  };

  const handleDetailsOpen = () => {
    setDetailsOpen(true);
  };

  const handleDetailsClose = () => {
    setDetailsOpen(false);
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
          '&:hover': { boxShadow: 6 }
        }}
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

          <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
            LKR {property.price?.toLocaleString() || 'N/A'}/month
          </Typography>

          {Object.keys(displayFacilities).length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Facilities
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {Object.entries(displayFacilities).map(([facility, count]) => (
                  <Chip
                    key={facility}
                    label={`${count} ${facility}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.75rem' }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {displayAmenities.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Amenities
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {displayAmenities.slice(0, 3).map((amenity) => (
                  <Chip
                    key={amenity}
                    label={amenity}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontSize: '0.75rem' }}
                  />
                ))}
                {displayAmenities.length > 3 && (
                  <Chip
                    label={`+${displayAmenities.length - 3} more`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.75rem' }}
                  />
                )}
              </Box>
            </Box>
          )}

          {roommates && roommates.length > 0 && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PersonIcon fontSize="small" />
                {roommates.length} Roommate{roommates.length > 1 ? 's' : ''}
              </Typography>
            </Box>
          )}

          {contractPolicy && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PolicyIcon fontSize="small" />
                Contract Policy Available
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 2 }}>
            <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
            <Typography variant="caption" color="text.secondary">
              Available from {property.available_from ? 
                new Date(property.available_from).toLocaleDateString() : 
                'Immediately'
              }
            </Typography>
          </Box>

          {showActions && (
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<VisibilityIcon />}
                onClick={handleDetailsOpen}
                fullWidth
              >
                View Details
              </Button>
              {(userRole === 'propertyowner' || userRole === 'admin') && onEdit && (
                <IconButton
                  onClick={() => onEdit(property)}
                  color="primary"
                  size="small"
                >
                  <EditIcon />
                </IconButton>
              )}
              {(userRole === 'propertyowner' || userRole === 'admin') && onDelete && (
                <IconButton
                  onClick={() => onDelete(property)}
                  color="error"
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Property Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={handleDetailsClose}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {property.property_type} - {property.unit_type}
          </Typography>
          <IconButton onClick={handleDetailsClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers>
          {/* Property Images */}
          {images && images.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <CardMedia
                component="img"
                height="300"
                image={primaryImage}
                alt={property.property_type}
                sx={{ objectFit: 'cover', borderRadius: 1 }}
              />
            </Box>
          )}

          {/* Basic Information */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Property Type</Typography>
              <Typography variant="body1" fontWeight="medium">{property.property_type}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Unit Type</Typography>
              <Typography variant="body1" fontWeight="medium">{property.unit_type}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">Address</Typography>
              <Typography variant="body1" fontWeight="medium">{property.address}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">Monthly Rent</Typography>
              <Typography variant="h6" color="primary" fontWeight="bold">
                LKR {property.price?.toLocaleString() || 'N/A'}
              </Typography>
            </Grid>
            {property.description && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Description</Typography>
                <Typography variant="body1">{property.description}</Typography>
              </Grid>
            )}
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Facilities */}
          {Object.keys(displayFacilities).length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HomeIcon />
                Facilities
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(displayFacilities).map(([facility, count]) => (
                  <Grid item xs={6} sm={4} key={facility}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {facility.toLowerCase().includes('bathroom') && <BathtubIcon />}
                      {facility.toLowerCase().includes('kitchen') && <KitchenIcon />}
                      {facility.toLowerCase().includes('parking') && <ParkingIcon />}
                      {!facility.toLowerCase().includes('bathroom') && 
                       !facility.toLowerCase().includes('kitchen') && 
                       !facility.toLowerCase().includes('parking') && <HomeIcon />}
                      <Typography variant="body1">{count} {facility}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Amenities */}
          {displayAmenities.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Amenities
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {displayAmenities.map((amenity) => (
                  <Chip
                    key={amenity}
                    label={amenity}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Roommates */}
          {roommates && roommates.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon />
                Roommates ({roommates.length})
              </Typography>
              <Grid container spacing={2}>
                {roommates.map((roommate, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Card variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Roommate {index + 1}</Typography>
                      {roommate.occupation && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <WorkIcon fontSize="small" />
                          <Typography variant="body2">{roommate.occupation}</Typography>
                        </Box>
                      )}
                      {roommate.field && (
                        <Typography variant="body2" color="text.secondary">
                          Field: {roommate.field}
                        </Typography>
                      )}
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* House Rules */}
          {rules && rules.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <RuleIcon />
                House Rules
              </Typography>
              <List dense>
                {rules.map((rule, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <InfoIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Typography variant="body2">{rule}</Typography>
                      } 
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Contract Policy */}
          {contractPolicy && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PolicyIcon />
                Contract Policy
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {contractPolicy}
              </Typography>
            </Box>
          )}

          {/* Availability */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>Availability</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Available From</Typography>
                <Typography variant="body1" fontWeight="medium">
                  {property.available_from ? 
                    new Date(property.available_from).toLocaleDateString() : 
                    'Immediately'
                  }
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Available Until</Typography>
                <Typography variant="body1" fontWeight="medium">
                  {property.available_to ? 
                    new Date(property.available_to).toLocaleDateString() : 
                    'No end date'
                  }
                </Typography>
              </Grid>
            </Grid>
          </Box>
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