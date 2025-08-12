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
    (typeof images[0] === 'string' ? images[0] : images[0]?.url || images[0]?.path) : 
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';

  const handleDetailsOpen = () => {
    setDetailsOpen(true);
  };

  const handleDetailsClose = () => {
    setDetailsOpen(false);
  };

  const getFacilityIcon = (facility) => {
    switch (facility.toLowerCase()) {
      case 'bedroom':
        return <HomeIcon fontSize="small" />;
      case 'bathroom':
        return <BathtubIcon fontSize="small" />;
      case 'kitchen':
        return <KitchenIcon fontSize="small" />;
      case 'parkingspace':
        return <ParkingIcon fontSize="small" />;
      default:
        return <HomeIcon fontSize="small" />;
    }
  };

  const formatFacilityName = (facility) => {
    switch (facility) {
      case 'Bedroom':
        return 'Bedrooms';
      case 'Bathroom':
        return 'Bathrooms';
      case 'Kitchen':
        return 'Kitchens';
      case 'LivingRoom':
        return 'Living Rooms';
      case 'DiningRoom':
        return 'Dining Rooms';
      case 'ParkingSpace':
        return 'Parking Spaces';
      default:
        return facility;
    }
  };

  return (
    <>
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4
          }
        }}
      >
        <CardMedia
          component="img"
          height="200"
          image={primaryImage}
          alt={property.property_type}
          sx={{ objectFit: 'cover' }}
        />
        
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
              {property.property_type} - {property.unit_type}
            </Typography>
            {property.approval_status && (
              <Chip 
                label={property.approval_status} 
                size="small"
                color={
                  property.approval_status === 'approved' ? 'success' :
                  property.approval_status === 'pending' ? 'warning' : 'error'
                }
              />
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
            <Typography variant="body2" color="text.secondary" noWrap>
              {property.address}
            </Typography>
          </Box>

          <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold', mb: 2 }}>
            LKR {property.price?.toLocaleString() || 'N/A'}/month
          </Typography>

          {facilities && (
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              {Object.entries(facilities).map(([facility, count]) => {
                if (count > 0) {
                  return (
                    <Box key={facility} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {getFacilityIcon(facility)}
                      <Typography variant="caption">
                        {count} {formatFacilityName(facility)}
                      </Typography>
                    </Box>
                  );
                }
                return null;
              })}
            </Box>
          )}

          {amenities && Object.keys(amenities).length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Amenities:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                {Object.entries(amenities).slice(0, 3).map(([amenity, quantity]) => {
                  if (quantity > 0) {
                    return (
                      <Chip 
                        key={amenity} 
                        label={amenity} 
                        size="small" 
                        variant="outlined" 
                      />
                    );
                  }
                  return null;
                })}
                {Object.keys(amenities).length > 3 && (
                  <Chip 
                    label={`+${Object.keys(amenities).length - 3} more`} 
                    size="small" 
                    variant="outlined" 
                  />
                )}
              </Box>
            </Box>
          )}

          {rules && rules.length > 0 && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <RuleIcon fontSize="small" />
                {rules.length} House Rule{rules.length > 1 ? 's' : ''}
              </Typography>
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
          {facilities && Object.keys(facilities).length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>Property Details</Typography>
              <Grid container spacing={2}>
                {Object.entries(facilities).map(([facility, count]) => {
                  if (count > 0) {
                    return (
                      <Grid item xs={6} sm={4} key={facility}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getFacilityIcon(facility)}
                          <Box>
                            <Typography variant="h6" component="span">{count}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                              {formatFacilityName(facility)}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    );
                  }
                  return null;
                })}
              </Grid>
            </Box>
          )}

          {/* Amenities */}
          {amenities && Object.keys(amenities).length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>Amenities</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {Object.entries(amenities).map(([amenity, quantity]) => {
                  if (quantity > 0) {
                    return (
                      <Chip
                        key={amenity}
                        label={quantity > 1 ? `${amenity} (${quantity})` : amenity}
                        variant="outlined"
                        color="primary"
                      />
                    );
                  }
                  return null;
                })}
              </Box>
            </Box>
          )}

          {/* Roommate Details */}
          {roommates && roommates.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon />
                Roommate Information
              </Typography>
              {roommates.map((roommate, index) => (
                <Accordion key={index} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">Roommate {index + 1}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <WorkIcon color="action" />
                          <Box>
                            <Typography variant="body2" color="text.secondary">Occupation</Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {roommate.occupation || 'Not specified'}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <WorkIcon color="action" />
                          <Box>
                            <Typography variant="body2" color="text.secondary">Field/Industry</Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {roommate.field || 'Not specified'}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
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
                {rules.filter(rule => rule && rule.trim()).map((rule, index) => (
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