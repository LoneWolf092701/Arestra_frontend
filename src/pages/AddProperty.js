import React, { useContext } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Room from '../assets/images/Room.jpg';
import { PropertyContext } from '../contexts/PropertyContext';
import { ThemeContext } from '../contexts/ThemeContext';


const AddProperty = () => {
  const navigate = useNavigate();
  const { propertyType, setPropertyType } = useContext(PropertyContext);
  const { theme } = useContext(ThemeContext);
  

  console.log({propertyType});
  console.log(localStorage.getItem('propertyType'));

  const propertyTypes = [
    { label: 'Apartment', image: Room },
    { label: 'Villa', image: Room },
    { label: 'Flat', image: Room },
    { label: 'Room', image: Room }
  ];

  const handleNext = () => {
    if (propertyType) {
      navigate('/addproperty/details');
    } else {
      alert('Please select a property type.');
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Select Property Type
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        {propertyTypes.map((property) => (
          <Grid item xs={12} sm={6} md={6} key={property.label}>
            <Card
              sx={{
                border: propertyType === property.label ?  `2px solid ${theme.secondary}` : '1px solid #ccc',
                boxShadow: propertyType === property.label ? `0px 0px 10px ${theme.secondary}` : 'none'
              }}
            >
              <CardActionArea onClick={() => setPropertyType(property.label)}>
                <CardMedia
                  component="img"
                  height="250"
                  image={property.image}
                  alt={property.label}
                />
                <CardContent>
                  <Typography variant="h6" align="center">
                    {property.label}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-start' }}>
        <Button variant="contained" color="primary" onClick={handleNext}>
          Next
        </Button>
      </Box>
    </Container>
  );
};

export default AddProperty;
