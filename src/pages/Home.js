import React, {useState, useEffect} from 'react';
import { 
  Button, 
  Typography, 
  Box, 
  Container, 
  Divider, 
  Grid, 
  Card, 
  CardContent,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddHomeIcon from '@mui/icons-material/AddHome';
import ViewListIcon from '@mui/icons-material/ViewList';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CarouselComponent from '../components/specific/CarouselComponent';
import PropertyGrid from '../components/common/PropertyGrid';
import { getMyProperties } from '../api/propertyApi';

const Home = () => {
  const navigate = useNavigate();

const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchRecentProperties();
  }, []);

  const fetchRecentProperties = async () => {
    try {
      setLoading(true);
      const result = await getMyProperties({ 
        limit: 6,
        sort_by: 'created_at',
        sort_order: 'DESC'
      });
      
      setProperties(result?.properties || []);
    } catch (error) {
      console.error('Error fetching recent properties:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddProperty = () => {
    navigate("/add-property");
  };

  const handleViewMyProperties = () => {
    navigate("/my-properties");
  };

  const handleViewBookings = () => {
    navigate("/property-owner-bookings");
  };

  const handleViewNotifications = () => {
    navigate("/notifications");
  };

  const handleViewProperty = (property) => {
  const propertyId = property.id || property.property_id;
  
  // Check if the property is approved - use public route, otherwise use owner route
  if (property.approval_status === 'approved') {
    navigate(`/view-property/${propertyId}`);
  } else {
    // For pending/rejected properties, use the owner route
    navigate(`/owner-property/${propertyId}`);
  }
};


  const handleEditProperty = (propertyId) => {
    // This receives propertyId directly from PropertyGrid
    navigate(`/update-property/${propertyId}`);
  };

  const quickActions = [
    {
      title: 'Add New Property',
      description: 'List a new property for rent',
      icon: <AddHomeIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      action: handleAddProperty,
      color: 'primary'
    },
    {
      title: 'My Properties',
      description: 'Manage your property listings',
      icon: <ViewListIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
      action: handleViewMyProperties,
      color: 'secondary'
    },
    {
      title: 'Booking Requests',
      description: 'Review and respond to booking requests',
      icon: <BookmarkIcon sx={{ fontSize: 40, color: 'info.main' }} />,
      action: handleViewBookings,
      color: 'info'
    },
    {
      title: 'Notifications',
      description: 'Check your latest notifications',
      icon: <NotificationsIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      action: handleViewNotifications,
      color: 'warning'
    }
  ];

  return (
    <Container sx={{ py: 4 }}>
      <CarouselComponent />

      <Typography variant="h4" component="h1" sx={{ mt: 4, mb: 2, textAlign: 'center' }}>
        Welcome to StayWise.lk
      </Typography>
      
      <Typography variant="subtitle1" sx={{ mb: 4, textAlign: 'center', color: 'text.secondary' }}>
        Your comprehensive solution for managing rental properties and connecting with tenants.
      </Typography>

      <Paper sx={{ p: 3, mb: 4, backgroundColor: 'primary.main', color: 'white' }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Property Owner Dashboard
        </Typography>
        <Typography variant="body1">
          Manage your properties, handle booking requests, and grow your rental business with our platform.
        </Typography>
      </Paper>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
              onClick={action.action}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ mb: 2 }}>
                  {action.icon}
                </Box>
                <Typography variant="h6" component="h3" gutterBottom>
                  {action.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {action.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h5" component="h2" gutterBottom sx={{ textAlign: 'center' }}>
        Your Recent Properties
      </Typography>
      
      <PropertyGrid 
      properties={properties}
        showMyProperties={true}
        showActions={true}
        showEditButton={true}
        limit={3}
        onViewProperty={handleViewProperty}
        onEditProperty={handleEditProperty}
        emptyStateMessage="You haven't added any properties yet"
        emptyStateSubtitle="Click 'Add New Property' to get started with your first listing"
      />

      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button 
          variant="contained" 
          size="large" 
          onClick={handleViewMyProperties}
          sx={{ px: 4 }}
        >
          View All My Properties
        </Button>
      </Box>
    </Container>
  );
};

export default Home;