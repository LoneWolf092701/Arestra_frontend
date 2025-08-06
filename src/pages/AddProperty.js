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
  Tooltip,
  Alert,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import Room from '../assets/images/Room.jpg';
import { PropertyContext } from '../contexts/PropertyContext';
import { ThemeContext } from '../contexts/ThemeContext';

const AddProperty = () => {
  const navigate = useNavigate();
  const { propertyType, setPropertyType } = useContext(PropertyContext);
  const { theme } = useContext(ThemeContext);
  const userRole = localStorage.getItem('userRole');
  
  console.log({propertyType});
  console.log(localStorage.getItem('propertyType'));

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
      navigate('/add-property-details/new');
    } else {
      alert('Please select a property type.');
    }
  };

  const handleBackToHome = () => {
    switch (userRole) {
      case 'propertyowner':
        navigate('/home');
        break;
      case 'admin':
        navigate('/admin/home');
        break;
      default:
        navigate('/home');
    }
  };

  const handleBackToMyProperties = () => {
    navigate('/my-properties');
  };

  if (userRole !== 'propertyowner') {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Access denied. Only property owners can add new properties.
        </Alert>
        <Button variant="contained" onClick={() => navigate('/user-home')}>
          Go to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton 
          onClick={handleBackToHome}
          sx={{ mr: 2, color: theme.primary }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          Select Property Type
        </Typography>
      </Box>
      
      <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
        Choose the type of property you want to list. Hover over each option to learn more about what each type includes.
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {propertyTypes.map((property) => (
          <Grid item xs={12} sm={6} md={6} key={property.label}>
            <Tooltip 
              title={property.description} 
              arrow
              sx={{
                minWidth: 1200,
                fontSize: '0.9rem',
              }} 
              placement="top"
              enterDelay={500}
              leaveDelay={200}
            >
              <Card
                sx={{
                  border: propertyType === property.label ? `2px solid ${theme.secondary}` : '1px solid #ccc',
                  boxShadow: propertyType === property.label ? `0 0 20px ${theme.secondary}30` : '0 2px 8px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 8px 25px ${theme.primary}30`,
                    border: `2px solid ${theme.primary}`,
                  },
                }}
                onClick={() => setPropertyType(property.label)}
              >
                <CardActionArea>
                  <CardMedia
                    component="img"
                    height="200"
                    image={property.image}
                    alt={property.label}
                    sx={{
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                      },
                    }}
                  />
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold', color: theme.textPrimary }}>
                      {property.label}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Tooltip>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleNext}
          disabled={!propertyType}
          sx={{
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
            fontWeight: 'bold',
            backgroundColor: theme.primary,
            '&:hover': {
              backgroundColor: theme.secondary,
            },
            '&:disabled': {
              backgroundColor: '#ccc',
              color: '#666',
            },
          }}
        >
          Next: Add Property Details
        </Button>
      </Box>

      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Button
          variant="text"
          onClick={handleBackToMyProperties}
          sx={{ color: theme.textSecondary }}
        >
          Back to My Properties
        </Button>
      </Box>
    </Container>
  );
};

export default AddProperty;