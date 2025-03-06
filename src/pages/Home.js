import React from 'react';
import { Button, Typography, Box, Container, Divider } from '@mui/material';
import CarouselComponent from '../components/specific/CarouselComponent';
import { useNavigate } from 'react-router-dom';
import PropertyGrid from '../components/common/PropertyGrid';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Container  sx={{ textAlign: 'center', py: 4 }}>
      <CarouselComponent />

      <Typography variant="h4" component="h2" sx={{ mt: 4 }}>
        Welcome to StayWise.lk
      </Typography>
      
      <Typography variant="subtitle1" sx={{ mt: 2, mb: 4 }}>
        Your one-stop solution for finding and adding rental properties.
      </Typography>

      <Button variant="contained" color="primary" onClick={() => navigate("/addproperty")}>
        Post my property
      </Button>
      <Divider sx={{marginTop:"20px"}}/>
      <PropertyGrid limit={3}/>
    </Container>
  );
};

export default Home;
