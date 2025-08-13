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
      label: 'Rooms', 
      image: Room,
      description: 'Individual rooms in shared accommodation. Perfect for students and young professionals looking for affordable housing with shared facilities and social living.'
    },
    { 
      label: 'Flats', 
      image: Room,
      description: 'Complete apartment units with private facilities including kitchen, bathroom, and living areas. Ideal for families, couples, or individuals seeking independence.'
    },
    { 
      label: 'Hostels', 
      image: Room,
      description: 'Budget-friendly shared accommodation with basic amenities. Great for short-term stays, students, or travelers looking for economical housing options.'
    },
    { 
      label: 'Villas', 
      image: Room,
      description: 'Premium standalone houses with private grounds, multiple bedrooms, and luxury amenities. Perfect for families or groups seeking spacious, high-end living.'
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
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToHome}
          sx={{ backgroundColor: theme.primary }}
        >
          Back to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Tooltip title="Back to My Properties">
          <IconButton onClick={handleBackToMyProperties} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Add New Property
        </Typography>
      </Box>
      
      <Typography 
        variant="h6" 
        color="text.secondary" 
        sx={{ mb: 4, textAlign: 'center' }}
      >
        Choose the type of property you want to list
      </Typography>

      <Grid container spacing={4} sx={{ mb: 4 }}>
        {propertyTypes.map((type) => (
          <Grid item xs={12} sm={6} md={3} key={type.label}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: propertyType === type.label ? 
                  `2px solid ${theme.primary}` : '2px solid transparent',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
                ...(propertyType === type.label && {
                  boxShadow: `0 0 0 2px ${theme.primary}`,
                  backgroundColor: `${theme.primary}10`,
                }),
              }}
              onClick={() => setPropertyType(type.label)}
            >
              <CardActionArea sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={type.image}
                  alt={type.label}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                  <Typography
                    variant="h5"
                    component="h2"
                    gutterBottom
                    sx={{ fontWeight: 600, color: theme.primary }}
                  >
                    {type.label}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ lineHeight: 1.6 }}
                  >
                    {type.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {propertyType && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 4,
            backgroundColor: `${theme.primary}10`,
            border: `1px solid ${theme.primary}30`,
          }}
        >
          <Typography variant="body1">
            <strong>{propertyType}</strong> selected. Click "Continue" to proceed with property details.
          </Typography>
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={handleBackToMyProperties}
          sx={{ px: 4, py: 1.5 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={!propertyType}
          sx={{
            px: 4,
            py: 1.5,
            backgroundColor: theme.primary,
            '&:hover': {
              backgroundColor: theme.secondary,
            },
          }}
        >
          Continue
        </Button>
      </Box>
    </Container>
  );
};

export default AddProperty;