import React, { useState } from 'react';
import { Container, TextField, Button, Box, Typography } from '@mui/material';
import CarouselComponent from '../../components/specific/CarouselComponent';
import { useNavigate } from 'react-router-dom';

const UserHome = () => {
  const [location, setLocation] = useState('');
  const navigate = useNavigate();
  
  const handleSearch = () => {
    console.log('Searching for properties in:', location);
    
  };
  
  const handleButtonClick = () => {
    navigate('/user-allproperties');
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      
      <CarouselComponent />

      <Container
        maxWidth="sm"
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: 3,
          borderRadius: 2,
          boxShadow: 3,
          textAlign: 'center',
        }}
      >
        <Typography variant="h5" gutterBottom>
          Search Properties by Location
        </Typography>
        <TextField
          label="Enter location"
          variant="outlined"
          fullWidth
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button variant="contained" color="primary" fullWidth onClick={handleSearch}>
          Search
        </Button>
        <Button variant="contained" color="primary" fullWidth onClick={handleButtonClick} sx={{mt:2}}>
          All Properties
        </Button>
      </Container>
    </Box>
  );
};

export default UserHome;
