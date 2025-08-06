import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Paper,
  IconButton,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HomeIcon from '@mui/icons-material/Home';
import StarIcon from '@mui/icons-material/Star';
import SecurityIcon from '@mui/icons-material/Security';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { isAuthenticated } from '../../utils/auth';
import CarouselComponent from '../../components/specific/CarouselComponent';

const UserHome = () => {
  const [searchLocation, setSearchLocation] = useState('');
  const navigate = useNavigate();
  const { theme, isDark } = useTheme();
  const authenticated = isAuthenticated();
  const userRole = localStorage.getItem('userRole');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchLocation.trim()) {
      navigate(`/user-properties?search=${encodeURIComponent(searchLocation.trim())}`);
    } else {
      navigate('/user-properties');
    }
  };

  const handleButtonClick = () => {
    navigate('/user-properties');
  };

  const handleGetStarted = () => {
    if (authenticated) {
      switch (userRole) {
        case 'user':
          navigate('/user-properties');
          break;
        case 'propertyowner':
          navigate('/home');
          break;
        case 'admin':
          navigate('/admin/home');
          break;
        default:
          navigate('/user-properties');
      }
    } else {
      navigate('/signup');
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const features = [
    {
      icon: <HomeIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Verified Properties',
      description: 'All properties are thoroughly verified and inspected for quality and safety standards.'
    },
    {
      icon: <StarIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      title: 'Rated by Tenants',
      description: 'Read authentic reviews from previous tenants to make informed decisions.'
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      title: 'Secure Transactions',
      description: 'Safe and secure payment processing with buyer protection guarantees.'
    },
    {
      icon: <SupportAgentIcon sx={{ fontSize: 40, color: 'info.main' }} />,
      title: '24/7 Support',
      description: 'Round-the-clock customer support to assist you throughout your rental journey.'
    }
  ];

  const quickSearchLocations = [
    'Colombo', 'Kandy', 'Galle', 'Negombo', 'Anuradhapura', 
    'Kurunegala', 'Ratnapura', 'Batticaloa', 'Jaffna', 'Matara'
  ];

  return (
    <Box>
      <Box
        sx={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          background: isDark 
            ? 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' 
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url('/api/placeholder/1920/1080')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.2,
            zIndex: 1
          }}
        />

        <Container 
          maxWidth="lg" 
          sx={{ 
            position: 'relative', 
            zIndex: 2,
            textAlign: 'center',
            py: 8
          }}
        >
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom
            sx={{
              fontWeight: 'bold',
              mb: 2,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
            }}
          >
            Find Your Perfect Home
          </Typography>
          
          <Typography 
            variant="h5" 
            component="h2" 
            gutterBottom
            sx={{
              mb: 4,
              fontWeight: 300,
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              maxWidth: '800px',
              mx: 'auto'
            }}
          >
            Discover quality accommodations verified by our team. From cozy rooms to luxury villas, 
            find the perfect place to call home in Sri Lanka.
          </Typography>

          <Paper
            elevation={6}
            sx={{
              p: 4,
              borderRadius: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              color: 'text.primary',
              maxWidth: 800,
              mx: 'auto',
              mb: 6
            }}
          >
            <form onSubmit={handleSearchSubmit}>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Enter city, area, or landmark..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon color="primary" />
                      </InputAdornment>
                    ),
                    sx: {
                      backgroundColor: 'white',
                      '& fieldset': {
                        borderColor: theme.primary,
                      }
                    }
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={<SearchIcon />}
                  sx={{
                    px: 4,
                    backgroundColor: theme.primary,
                    '&:hover': {
                      backgroundColor: theme.secondary,
                      transform: 'translateY(-2px)',
                      boxShadow: 4,
                    },
                    transition: 'all 0.3s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {searchLocation.trim() ? 'Search Location' : 'Search All'}
                </Button>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center', mb: 3 }}>
                {quickSearchLocations.map((location) => (
                  <Button
                    key={location}
                    variant="outlined"
                    size="small"
                    onClick={() => setSearchLocation(location)}
                    sx={{
                      borderColor: theme.primary,
                      color: theme.primary,
                      '&:hover': {
                        backgroundColor: `${theme.primary}10`,
                        borderColor: theme.secondary,
                        color: theme.secondary,
                      }
                    }}
                  >
                    {location}
                  </Button>
                ))}
              </Box>
            </form>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button 
                variant="outlined" 
                color="primary" 
                size="large"
                onClick={handleButtonClick} 
                sx={{
                  px: 4,
                  py: 1.5,
                  borderColor: theme.primary,
                  color: theme.primary,
                  '&:hover': {
                    backgroundColor: `${theme.primary}10`,
                    borderColor: theme.secondary,
                    color: theme.secondary,
                    transform: 'translateY(-1px)',
                    boxShadow: 2,
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                Browse All Properties
              </Button>

              {!authenticated && (
                <>
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    size="large"
                    onClick={handleGetStarted}
                    sx={{
                      px: 4,
                      py: 1.5,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 4,
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Get Started
                  </Button>

                  <Button 
                    variant="outlined" 
                    color="secondary" 
                    size="large"
                    onClick={handleLogin}
                    sx={{
                      px: 4,
                      py: 1.5,
                      '&:hover': {
                        transform: 'translateY(-1px)',
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Login
                  </Button>
                </>
              )}
            </Box>
          </Paper>

          {authenticated && (
            <Paper sx={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(15px)',
              color: 'white',
              padding: 3,
              borderRadius: 3,
              maxWidth: 600,
              mx: 'auto'
            }}>
              <Typography variant="h6" gutterBottom>
                Welcome back, {userRole === 'user' ? 'Tenant' : userRole === 'propertyowner' ? 'Property Owner' : 'Admin'}!
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {userRole === 'user' && 'Ready to find your next home? Start browsing properties now.'}
                {userRole === 'propertyowner' && 'Manage your properties and bookings from your dashboard.'}
                {userRole === 'admin' && 'Access your admin dashboard to manage the platform.'}
              </Typography>
              <Button
                variant="contained"
                onClick={() => {
                  switch (userRole) {
                    case 'user':
                      navigate('/user-properties');
                      break;
                    case 'propertyowner':
                      navigate('/home');
                      break;
                    case 'admin':
                      navigate('/admin/home');
                      break;
                    default:
                      navigate('/user-properties');
                  }
                }}
                sx={{
                  backgroundColor: theme.primary,
                  '&:hover': { backgroundColor: theme.secondary }
                }}
              >
                Go to Dashboard
              </Button>
            </Paper>
          )}
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography 
          variant="h3" 
          component="h2" 
          align="center" 
          gutterBottom
          sx={{ fontWeight: 'bold', mb: 6, color: theme.textPrimary }}
        >
          Why Choose StayWise?
        </Typography>
        
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  p: 3,
                  borderRadius: 3,
                  boxShadow: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                    borderColor: theme.primary,
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box
        sx={{
          background: isDark 
            ? 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)' 
            : 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
          py: 8
        }}
      >
        <Container maxWidth="lg">
          <Typography 
            variant="h3" 
            component="h2" 
            align="center" 
            gutterBottom
            sx={{ fontWeight: 'bold', mb: 6, color: theme.textPrimary }}
          >
            Featured Properties
          </Typography>
          
          <CarouselComponent />
          
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button 
              variant="contained" 
              size="large"
              onClick={handleButtonClick}
              sx={{
                px: 6,
                py: 2,
                backgroundColor: theme.primary,
                '&:hover': {
                  backgroundColor: theme.secondary,
                  transform: 'translateY(-2px)',
                  boxShadow: 4,
                },
                transition: 'all 0.3s ease'
              }}
            >
              View All Properties
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Card
          sx={{
            p: 6,
            textAlign: 'center',
            background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
            color: 'white',
            borderRadius: 4,
            boxShadow: 6
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Ready to Find Your Perfect Home?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of satisfied tenants who found their ideal accommodation through StayWise
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleButtonClick}
              sx={{
                px: 6,
                py: 2,
                backgroundColor: 'white',
                color: theme.primary,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  transform: 'translateY(-2px)',
                  boxShadow: 4,
                }
              }}
            >
              Start Browsing
            </Button>
            {!authenticated && (
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/signup')}
                sx={{
                  px: 6,
                  py: 2,
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderColor: 'white',
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                Create Account
              </Button>
            )}
          </Box>
        </Card>
      </Container>
    </Box>
  );
};

export default UserHome;