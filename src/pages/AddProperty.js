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
  Button,
  Tooltip
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

  // Property types with detailed descriptions for tooltips
  const propertyTypes = [
    { 
      label: 'Apartment', 
      image: Room,
      description: 'A self-contained housing unit that occupies part of a building, typically on a single floor. Perfect for urban living with modern amenities and security features.'
    },
    { 
      label: 'Villa', 
      image: Room,
      description: 'A large, luxurious house typically situated in a suburban or rural area. Usually features private gardens, multiple bedrooms, and spacious living areas.'
    },
    { 
      label: 'Flat', 
      image: Room,
      description: 'A set of rooms forming a complete residence, typically on one floor of a building. Similar to apartments but often used in different regional contexts.'
    },
    { 
      label: 'Room', 
      image: Room,
      description: 'A single private room within a shared property. Ideal for students or professionals looking for affordable accommodation with shared common areas.'
    }
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
      
      {/* Helpful instruction text */}
      <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
        Choose the type of property you want to list. Hover over each option to learn more about what each type includes.
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {propertyTypes.map((property) => (
          <Grid item xs={12} sm={6} md={6} key={property.label}>
            {/* Tooltip wrapper that shows description on hover */}
            <Tooltip 
              title={property.description} 
              arrow
              sx={{
                minWidth: 1200, // Limit tooltip width for better readability
                fontSize: '0.9rem', // Slightly smaller font size for tooltip text
              }} 
              placement="top"
              enterDelay={500} // Small delay before showing tooltip
              leaveDelay={200} // Small delay before hiding tooltip
            >
              <Card
                sx={{
                  border: propertyType === property.label ? `2px solid ${theme.secondary}` : '1px solid #ccc',
                  boxShadow: propertyType === property.label ? `0px 0px 10px ${theme.secondary}` : 'none',
                  transition: 'all 0.3s ease', // Smooth transition for hover effects
                  '&:hover': {
                    transform: 'translateY(-4px)', // Slight lift effect on hover
                    boxShadow: '0px 8px 25px rgba(0,0,0,0.15)'
                  }
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
                    {/* Show first few words of description as a preview */}
                    <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 1 }}>
                      {property.description.split('.')[0] + '...'}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Tooltip>
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