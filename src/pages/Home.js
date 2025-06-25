import React from 'react';
import { Button, Typography, Box, Container, Divider } from '@mui/material';
import CarouselComponent from '../components/specific/CarouselComponent';
import { useNavigate } from 'react-router-dom';
import PropertyGrid from '../components/common/PropertyGrid';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Container sx={{ textAlign: 'center', py: 4 }}>
      {/* Hero Section with Carousel */}
      <CarouselComponent />

      <Typography variant="h4" component="h2" sx={{ mt: 4 }}>
        Welcome to StayWise.lk
      </Typography>
      
      <Typography variant="subtitle1" sx={{ mt: 2, mb: 4 }}>
        Your one-stop solution for finding and adding rental properties.
      </Typography>

      {/* Main Action Button */}
      <Button 
        variant="contained" 
        color="primary" 
        size="large"
        onClick={() => navigate("/addproperty")}
        sx={{ mb: 4, px: 4, py: 1.5 }}
      >
        Post my property
      </Button>

      <Divider sx={{ marginTop: "20px", marginBottom: "30px" }} />

      {/* My Properties Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h3" sx={{ textAlign: 'left' }}>
            My Properties
          </Typography>
          <Button 
            variant="outlined" 
            color="primary"
            onClick={() => navigate("/myproperties")}
            sx={{ textTransform: 'none' }}
          >
            View All My Properties
          </Button>
        </Box>
        {/* Display user's properties without the limit, but we'll modify PropertyGrid to handle this */}
        <PropertyGrid showMyProperties={true} />
      </Box>
    </Container>
  );
};

export default Home;