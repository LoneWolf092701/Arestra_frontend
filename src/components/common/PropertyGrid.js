import React from 'react';
import {
  Grid,
  Typography,
  Box,
  Chip,
  Alert,
  Skeleton,
  Card,
  CardContent
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import PropertyCard from './PropertyCard';

// Helper function to safely parse JSON strings
const safeParse = (str) => {
  try {
    return typeof str === 'string' ? JSON.parse(str) : (str || []);
  } catch (error) {
    return [];
  }
};

// Loading skeleton component
const PropertyCardSkeleton = () => (
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <Skeleton variant="rectangular" height={180} />
    <CardContent sx={{ flexGrow: 1 }}>
      <Skeleton variant="text" sx={{ fontSize: '1.5rem', mb: 1 }} />
      <Skeleton variant="text" sx={{ mb: 1 }} />
      <Skeleton variant="text" sx={{ mb: 1 }} />
      <Skeleton variant="text" sx={{ width: '60%', mb: 2 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Skeleton variant="text" sx={{ width: '40%' }} />
        <Skeleton variant="text" sx={{ width: '30%' }} />
      </Box>
    </CardContent>
  </Card>
);

// Summary statistics component
const PropertyGridSummary = ({ properties, showMyProperties = false }) => {
  const stats = React.useMemo(() => {
    if (!properties || properties.length === 0) return {
      total: 0,
      available: 0,
      highDemand: 0,
      partiallyOccupied: 0,
      unavailable: 0,
      comingSoon: 0,
      totalRequests: 0,
      totalBookings: 0
    };

    const available = properties.filter(p => p.availability_status === 'available').length;
    const highDemand = properties.filter(p => p.availability_status === 'high_demand').length;
    const partiallyOccupied = properties.filter(p => p.availability_status === 'partially_occupied').length;
    const unavailable = properties.filter(p => ['unavailable', 'expired'].includes(p.availability_status)).length;
    const comingSoon = properties.filter(p => p.availability_status === 'coming_soon').length;

    const totalRequests = properties.reduce((sum, p) => sum + (p.pending_requests || 0), 0);
    const totalBookings = properties.reduce((sum, p) => sum + (p.confirmed_bookings || 0), 0);

    return {
      total: properties.length,
      available,
      highDemand,
      partiallyOccupied,
      unavailable,
      comingSoon,
      totalRequests,
      totalBookings
    };
  }, [properties]);

  if (stats.total === 0) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        {showMyProperties ? 'Your Property Portfolio' : 'Property Availability Overview'}
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {stats.available > 0 && (
          <Grid item xs={6} sm={4} md={2}>
            <Box sx={{ textAlign: 'center', p: 1 }}>
              <Chip 
                icon={<CheckCircleIcon />}
                label={`${stats.available} Available`}
                color="success"
                size="small"
                sx={{ mb: 0.5 }}
              />
            </Box>
          </Grid>
        )}
        
        {stats.highDemand > 0 && (
          <Grid item xs={6} sm={4} md={2}>
            <Box sx={{ textAlign: 'center', p: 1 }}>
              <Chip 
                icon={<TrendingUpIcon />}
                label={`${stats.highDemand} High Demand`}
                color="warning"
                size="small"
                sx={{ mb: 0.5 }}
              />
            </Box>
          </Grid>
        )}
        
        {stats.partiallyOccupied > 0 && (
          <Grid item xs={6} sm={4} md={2}>
            <Box sx={{ textAlign: 'center', p: 1 }}>
              <Chip 
                icon={<ScheduleIcon />}
                label={`${stats.partiallyOccupied} Partially Booked`}
                color="info"
                size="small"
                sx={{ mb: 0.5 }}
              />
            </Box>
          </Grid>
        )}
        
        {stats.comingSoon > 0 && (
          <Grid item xs={6} sm={4} md={2}>
            <Box sx={{ textAlign: 'center', p: 1 }}>
              <Chip 
                label={`${stats.comingSoon} Coming Soon`}
                color="default"
                size="small"
                sx={{ mb: 0.5 }}
              />
            </Box>
          </Grid>
        )}
      </Grid>

      {showMyProperties && (stats.totalRequests > 0 || stats.totalBookings > 0) && (
        <Alert 
          severity="info" 
          icon={<InfoIcon />}
          sx={{ mb: 2 }}
        >
          <Typography variant="body2">
            You have <strong>{stats.totalRequests}</strong> pending booking request{stats.totalRequests !== 1 ? 's' : ''} 
            {stats.totalBookings > 0 && ` and ${stats.totalBookings} confirmed booking${stats.totalBookings !== 1 ? 's' : ''}`}
            {stats.totalRequests > 0 && ' awaiting your response'}
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

const PropertyGrid = ({ 
  properties, 
  loading = false,
  showActions = true,
  showMyProperties = false,
  variant = 'standard',
  onViewProperty,
  onEditProperty,
  showSummary = false,
  emptyStateMessage,
  emptyStateSubtitle
}) => {
  // Sort properties by availability status priority - this hook must be at the top
  const sortedProperties = React.useMemo(() => {
    if (!properties || properties.length === 0) {
      return [];
    }
    
    return [...properties].sort((a, b) => {
      const statusPriority = {
        'available': 1,
        'high_demand': 2,
        'partially_occupied': 3,
        'coming_soon': 4,
        'expired': 5,
        'unavailable': 6
      };
      
      const aPriority = statusPriority[a.availability_status] || 7;
      const bPriority = statusPriority[b.availability_status] || 7;
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      // Secondary sort by creation date (newest first)
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });
  }, [properties]);

  // Handle loading state
  if (loading) {
    return (
      <Grid container spacing={3}>
        {[...Array(6)].map((_, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <PropertyCardSkeleton />
          </Grid>
        ))}
      </Grid>
    );
  }

  // Handle empty state
  if (!properties || properties.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', mt: 6, mb: 6 }}>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
          {emptyStateMessage || (showMyProperties 
            ? 'No properties found' : 'No properties available')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {emptyStateSubtitle || (showMyProperties 
            ? 'Start by adding your first property listing' 
            : 'Check back later for new listings')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Summary Statistics */}
      {showSummary && (
        <PropertyGridSummary 
          properties={properties} 
          showMyProperties={showMyProperties} 
        />
      )}

      {/* Property Grid */}
      <Grid container spacing={3}>
        {sortedProperties.map((property) => {
          return (
            <Grid item xs={12} sm={6} md={4} key={property.id}>
              <PropertyCard
                property={property}
                variant={variant}
                showActions={showActions}
                showEditButton={showMyProperties}
                showAvailabilityStatus={true}
                onView={onViewProperty}
                onEdit={onEditProperty}
              />
            </Grid>
          );
        })}
      </Grid>

      {/* Additional Information for Property Owners */}
      {showMyProperties && sortedProperties.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Alert severity="info" variant="outlined">
            <Typography variant="body2">
              <strong>Availability Status Guide:</strong>
            </Typography>
            <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
              <li><strong>Available:</strong> Ready for new bookings</li>
              <li><strong>High Demand:</strong> Multiple guests interested - respond quickly!</li>
              <li><strong>Partially Booked:</strong> Has confirmed bookings but other dates available</li>
              <li><strong>Coming Soon:</strong> Will be available from specified date</li>
            </Box>
          </Alert>
        </Box>
      )}
    </Box>
  );
};

export default PropertyGrid;