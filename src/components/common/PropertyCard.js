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
                {displayFacilities.Bedroom || property.bedrooms || 0} Bed
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <BathtubIcon sx={{ fontSize: 16, mr: 0.5 }} />
              <Typography variant="caption">
                {displayFacilities.Bathroom || property.bathrooms || 0} Bath
              </Typography>
            </Box>
          </Box>

          {property.approval_status && (
            <Chip 
              label={property.approval_status.toUpperCase()} 
              color={
                property.approval_status === 'approved' ? 'success' :
                property.approval_status === 'pending' ? 'warning' : 'error'
              }
              size="small"
              sx={{ mb: 1 }}
            />
          )}

          {displayAmenities.length > 0 && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Amenities: {displayAmenities.slice(0, 3).join(', ')}
                {displayAmenities.length > 3 && '...'}
              </Typography>
            </Box>
          )}
        </CardContent>

        {showActions && (
          <Box sx={{ p: 2, pt: 0 }}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<InfoIcon />}
                onClick={handleDetailsOpen}
              >
                Details
              </Button>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                {onView && (
                  <IconButton size="small" onClick={() => onView(property)} color="primary">
                    <VisibilityIcon />
                  </IconButton>
                )}
                {onEdit && (
                  <IconButton size="small" onClick={() => onEdit(property)} color="info">
                    <EditIcon />
                  </IconButton>
                )}
                {onDelete && (
                  <IconButton size="small" onClick={() => onDelete(property)} color="error">
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            </Box>
          </Box>
        )}
      </Card>

      <Dialog open={detailsOpen} onClose={handleDetailsClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Property Details
            <IconButton onClick={handleDetailsClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              {property.property_type} - {property.unit_type}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {property.address}
            </Typography>
            <Typography variant="h6" color="primary">
              LKR {parseInt(property.price || 0).toLocaleString()} / month
            </Typography>
          </Box>

          {property.description && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>Description</Typography>
              <Typography variant="body2">{property.description}</Typography>
            </Box>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Property Details</Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><HomeIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Bedrooms" 
                    secondary={displayFacilities.Bedroom || property.bedrooms || 0}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><BathtubIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Bathrooms" 
                    secondary={displayFacilities.Bathroom || property.bathrooms || 0}
                  />
                </ListItem>
                {Object.entries(displayFacilities).map(([key, value]) => (
                  key !== 'Bedroom' && key !== 'Bathroom' && (
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

          {rules && rules.length > 0 && (
            <Accordion sx={{ mt: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">House Rules</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  {rules.map((rule, index) => (
                    <ListItem key={index}>
                      <ListItemIcon><RuleIcon /></ListItemIcon>
                      <ListItemText primary={rule} />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          )}

          {contractPolicy && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Contract Policy</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">{contractPolicy}</Typography>
              </AccordionDetails>
            </Accordion>
          )}

          {roommates && roommates.length > 0 && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Roommate Preferences</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  {roommates.map((roommate, index) => (
                    <ListItem key={index}>
                      <ListItemIcon><PersonIcon /></ListItemIcon>
                      <ListItemText 
                        primary={`${roommate.gender || 'Any'} - ${roommate.age_range || 'Any age'}`}
                        secondary={roommate.preferences || ''}
                      />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          )}

          {property.available_from && (
            <Grid container spacing={2} sx={{ mt: 2 }}>
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
          )}
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