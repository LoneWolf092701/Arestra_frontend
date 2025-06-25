import React from 'react';
import { Button, Typography, Box, Container, Divider } from '@mui/material';
import CarouselComponent from '../../components/specific/CarouselComponent';
import { useNavigate } from 'react-router-dom';
import PropertyGrid from '../../components/common/PropertyGrid';

const AdminHome = () => {
  const navigate = useNavigate();

  return (
    <Container sx={{ textAlign: 'center', py: 4 }}>
      {/* Hero Section with Carousel */}
      <CarouselComponent />

      <Typography variant="h4" component="h2" sx={{ mt: 4 }}>
        Admin Dashboard - StayWise.lk
      </Typography>
      
      <Typography variant="subtitle1" sx={{ mt: 2, mb: 4 }}>
        Manage property listings and review new submissions.
      </Typography>

      {/* Main Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 4 }}>
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          onClick={() => navigate("/admin/new-listings")}
          sx={{ px: 4, py: 1.5 }}
        >
          Review New Listings
        </Button>
        <Button 
          variant="outlined" 
          color="approved" 
          size="large"
          onClick={() => navigate("/admin/all-properties")}
          sx={{ px: 4, py: 1.5 }}
        >
          View All Properties
        </Button>
      </Box>

      <Divider sx={{ marginTop: "20px", marginBottom: "30px" }} />

      {/* Recently Approved Properties Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h3" sx={{ textAlign: 'left' }}>
            Recently Approved Properties
          </Typography>
          <Button 
            variant="outlined" 
            color="primary"
            onClick={() => navigate("/admin/all-properties")}
            sx={{ textTransform: 'none' }}
          >
            View All Approved Properties
          </Button>
        </Box>
        {/* Display recently approved properties with limit */}
        <PropertyGrid isAdminPage={true} showApprovedProperties={true} limit={6} />
      </Box>

      {/* Quick Stats Section */}
      <Box sx={{ mt: 4, p: 3, backgroundColor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
        <Typography variant="h6" gutterBottom>
          Quick Overview
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              --
            </Typography>
            <Typography variant="body2">
              Pending Reviews
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="success.main">
              --
            </Typography>
            <Typography variant="body2">
              Approved Properties
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main">
              --
            </Typography>
            <Typography variant="body2">
              Total Users
            </Typography>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default AdminHome;