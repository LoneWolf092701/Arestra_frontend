import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  IconButton,
  Chip,
  Rating,
  Alert,
  CircularProgress,
  Container
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  CalendarToday as BookingIcon,
  LocationOn as LocationIcon,
  Bed as BedIcon,
  Bathtub as BathtubIcon,
  AttachMoney as PriceIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getOwnerProperties } from '../../api/propertyApi';
import { useTheme } from '../../contexts/ThemeContext';

const PropertyStatsSummary = ({ properties, showMyProperties }) => {
  const stats = React.useMemo(() => {
    if (!properties || properties.length === 0) {
      return { total: 0, available: 0, highDemand: 0, partiallyOccupied: 0, totalRequests: 0, totalBookings: 0 };
    }

    const total = properties.length;
    const available = properties.filter(p => p.is_active && p.approval_status === 'approved').length;
    const highDemand = properties.filter(p => p.views_count && p.views_count > 100).length;
    const partiallyOccupied = properties.filter(p => p.booking_status === 'partial').length;
    const totalRequests = properties.reduce((sum, p) => sum + (p.pending_requests || 0), 0);
    const totalBookings = properties.reduce((sum, p) => sum + (p.confirmed_bookings || 0), 0);

    return { total, available, highDemand, partiallyOccupied, totalRequests, totalBookings };
  }, [properties]);

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        {showMyProperties ? 'Your Properties Overview' : 'Properties Overview'}
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary.main">{stats.total}</Typography>
            <Typography variant="body2" color="text.secondary">Total Properties</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main">{stats.available}</Typography>
            <Typography variant="body2" color="text.secondary">Available</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main">{stats.highDemand}</Typography>
            <Typography variant="body2" color="text.secondary">High Demand</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="info.main">{stats.partiallyOccupied}</Typography>
            <Typography variant="body2" color="text.secondary">Partially Booked</Typography>
          </Card>
        </Grid>
      </Grid>

      {showMyProperties && (stats.totalRequests > 0 || stats.totalBookings > 0) && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            You have {stats.totalRequests} pending request{stats.totalRequests !== 1 ? 's' : ''} 
            {stats.totalBookings > 0 && ` and ${stats.totalBookings} confirmed booking${stats.totalBookings !== 1 ? 's' : ''}`}
            {stats.totalRequests > 0 && ' awaiting your response'}
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

const PropertyGrid = ({ 
  properties: propProperties, 
  loading: propLoading = false,
  showActions = true,
  showMyProperties = false,
  variant = 'standard',
  onViewProperty,
  onEditProperty,
  showSummary = false,
  emptyStateMessage,
  emptyStateSubtitle,
  limit
}) => {
  const [internalProperties, setInternalProperties] = useState([]);
  const [internalLoading, setInternalLoading] = useState(false);
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');

  const properties = propProperties || internalProperties;
  const loading = propLoading || internalLoading;

  useEffect(() => {
    if (!propProperties && showMyProperties) {
      fetchOwnerProperties();
    }
  }, [propProperties, showMyProperties]);

  const fetchOwnerProperties = async () => {
    try {
      setInternalLoading(true);
      const token = localStorage.getItem('token');
      const data = await getOwnerProperties(token);
      setInternalProperties(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching owner properties:', error);
      setInternalProperties([]);
    } finally {
      setInternalLoading(false);
    }
  };

  const getRoleBasedNavigationHandlers = () => {
    const handleView = (propertyId) => {
      if (onViewProperty) {
        onViewProperty(propertyId);
        return;
      }

      switch (userRole) {
        case 'user':
          navigate(`/user-property-view/${propertyId}`);
          break;
        case 'propertyowner':
          navigate(`/propertyowner-viewproperty/${propertyId}`);
          break;
        case 'admin':
          navigate(`/admin-viewproperty/${propertyId}`);
          break;
        default:
          navigate(`/user-property-view/${propertyId}`);
      }
    };

    const handleEdit = (propertyId) => {
      if (onEditProperty) {
        onEditProperty(propertyId);
        return;
      }

      switch (userRole) {
        case 'propertyowner':
          navigate(`/update-property/${propertyId}`);
          break;
        case 'admin':
          console.warn('Admin edit functionality not implemented');
          break;
        default:
          console.warn('Edit not allowed for this role');
      }
    };

    const handleBook = (propertyId) => {
      switch (userRole) {
        case 'user':
          navigate(`/user-booking/${propertyId}`);
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
    };

    return { handleView, handleEdit, handleBook };
  };

  const { handleView, handleEdit, handleBook } = getRoleBasedNavigationHandlers();

  const sortedProperties = React.useMemo(() => {
    if (!properties || properties.length === 0) {
      return [];
    }
    
    let sorted = [...properties].sort((a, b) => {
      const statusPriority = {
        'available': 1,
        'high_demand': 2,
        'partially_occupied': 3,
        'occupied': 4,
        'unavailable': 5
      };
      
      return statusPriority[a.availability_status] - statusPriority[b.availability_status];
    });
    
    if (limit && limit > 0) {
      sorted = sorted.slice(0, limit);
    }
    
    return sorted;
  }, [properties, limit]);

  const { theme } = useTheme();

  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
          Loading properties...
        </Typography>
      </Container>
    );
  }

  if (!sortedProperties || sortedProperties.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          {emptyStateMessage || 'No properties found'}
        </Typography>
        {emptyStateSubtitle && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {emptyStateSubtitle}
          </Typography>
        )}
        {showMyProperties && userRole === 'propertyowner' && (
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate('/add-property')}
            sx={{ mt: 2 }}
          >
            Add Your First Property
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Box>
      {showSummary && <PropertyStatsSummary properties={sortedProperties} showMyProperties={showMyProperties} />}
      
      <Grid container spacing={3}>
        {sortedProperties.map((property) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={property.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
              onClick={() => handleView(property.id)}
            >
              <CardMedia
                component="img"
                height="200"
                image={property.images && property.images.length > 0 ? 
                  (typeof property.images === 'string' ? 
                    JSON.parse(property.images)[0] : 
                    property.images[0]) : 
                  '/default-property-image.jpg'
                }
                alt={property.property_type || property.title}
                sx={{ objectFit: 'cover' }}
              />
              
              <CardContent sx={{ flexGrow: 1, p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                  <Typography variant="h6" component="h3" noWrap sx={{ fontWeight: 'bold', flex: 1, mr: 1 }}>
                    {property.property_type || property.title} - {property.unit_type || 'Property'}
                  </Typography>
                  <Chip 
                    label={property.approval_status || 'approved'} 
                    size="small"
                    color={
                      property.approval_status === 'approved' ? 'success' :
                      property.approval_status === 'pending' ? 'warning' : 'error'
                    }
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {property.address || property.location}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PriceIcon sx={{ fontSize: 16, mr: 0.5, color: 'primary.main' }} />
                  <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
                    LKR {property.price ? property.price.toLocaleString() : 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                    /month
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  {property.bedrooms !== undefined && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <BedIcon sx={{ fontSize: 16, mr: 0.5 }} />
                      <Typography variant="body2">{property.bedrooms}</Typography>
                    </Box>
                  )}
                  {property.bathrooms !== undefined && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <BathtubIcon sx={{ fontSize: 16, mr: 0.5 }} />
                      <Typography variant="body2">{property.bathrooms}</Typography>
                    </Box>
                  )}
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  mb: 2
                }}>
                  {property.description || 'No description available'}
                </Typography>

                {showActions && (
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between', mt: 'auto' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleView(property.id);
                      }}
                      sx={{ flex: 1 }}
                    >
                      View
                    </Button>
                    
                    {userRole === 'propertyowner' && showMyProperties && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(property.id);
                        }}
                        sx={{ flex: 1 }}
                      >
                        Edit
                      </Button>
                    )}
                    
                    {userRole === 'user' && !showMyProperties && (
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<BookingIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBook(property.id);
                        }}
                        sx={{ flex: 1 }}
                      >
                        Book
                      </Button>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PropertyGrid;