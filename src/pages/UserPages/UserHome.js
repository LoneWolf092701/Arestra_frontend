import React, { useState } from 'react';
import { Container, TextField, Button, Box, Typography, Alert } from '@mui/material';
import CarouselComponent from '../../components/specific/CarouselComponent';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../../utils/auth';
import { useTheme } from '../../contexts/ThemeContext';

const UserHome = () => {
  const [location, setLocation] = useState('');
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const userRole = localStorage.getItem('userRole');
  const { theme, isDark } = useTheme();
  
  const handleSearch = () => {
    console.log('Searching for properties in:', location);
    // Navigate to properties page with search query
    if (location.trim()) {
      navigate(`/user-allproperties?search=${encodeURIComponent(location)}`);
    } else {
      navigate('/user-allproperties');
    }
  };
  
  const handleButtonClick = () => {
    navigate('/user-allproperties');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleSignUpClick = () => {
    navigate('/signup');
  };

  return (
    <Box sx={{ 
      position: 'relative', 
      width: '100%', 
      minHeight: '100vh',
      background: isDark 
        ? `linear-gradient(135deg, ${theme.background} 0%, ${theme.surfaceBackground} 50%, ${theme.background} 100%)`
        : `linear-gradient(135deg, ${theme.background} 0%, ${theme.primary}05 50%, ${theme.background} 100%)`,
      overflow: 'hidden' 
    }}>
      
      {/* Carousel Background */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <CarouselComponent />
      </Box>

      {/* Welcome Section for Non-Authenticated Users */}
      {!authenticated && (
        <Container
          maxWidth="md"
          sx={{
            position: 'absolute',
            top: '15%',
            left: '50%',
            transform: 'translate(-50%, 0)',
            zIndex: 2,
            textAlign: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            padding: 4,
            borderRadius: 3,
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            border: `1px solid ${theme.border}`,
          }}
        >
          <Typography variant="h3" gutterBottom sx={{ 
            color: theme.primary, 
            fontWeight: 700,
            mb: 2
          }}>
            Welcome to StayWise.lk
          </Typography>
          
          <Typography variant="h6" sx={{ 
            color: theme.textSecondary, 
            mb: 3,
            maxWidth: 600,
            mx: 'auto'
          }}>
            Discover your perfect rental property in Sri Lanka. Browse thousands of verified listings or join our community to unlock premium features.
          </Typography>

          <Alert 
            severity="info" 
            sx={{ 
              mb: 3,
              backgroundColor: `${theme.info}10`,
              color: theme.info,
              '& .MuiAlert-icon': {
                color: theme.info,
              },
            }}
          >
            You're browsing as a guest. Create an account to save favorites, book properties, and get personalized recommendations!
          </Alert>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
            <Button 
              variant="contained" 
              size="large"
              onClick={handleSignUpClick}
              sx={{
                backgroundColor: theme.primary,
                color: isDark ? theme.textPrimary : '#FFFFFF',
                px: 4,
                py: 1.5,
                '&:hover': {
                  backgroundColor: theme.secondary,
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows.medium,
                },
                transition: 'all 0.2s ease'
              }}
            >
              Join StayWise
            </Button>
            
            <Button 
              variant="outlined" 
              size="large"
              onClick={handleLoginClick}
              sx={{
                borderColor: theme.primary,
                color: theme.primary,
                px: 4,
                py: 1.5,
                '&:hover': {
                  backgroundColor: `${theme.primary}10`,
                  borderColor: theme.secondary,
                  color: theme.secondary,
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows.light,
                },
                transition: 'all 0.2s ease'
              }}
            >
              Login
            </Button>
          </Box>
        </Container>
      )}

      {/* Welcome Section for Authenticated Users */}
      {authenticated && (
        <Container
          maxWidth="md"
          sx={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translate(-50%, 0)',
            zIndex: 2,
            textAlign: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            padding: 4,
            borderRadius: 3,
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            border: `1px solid ${theme.border}`,
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ 
            color: theme.primary, 
            fontWeight: 600,
            mb: 2
          }}>
            Welcome back!
          </Typography>
          
          <Typography variant="h6" sx={{ 
            color: theme.textSecondary, 
            mb: 3
          }}>
            Ready to find your next home?
          </Typography>
        </Container>
      )}

      {/* Search Section */}
      <Container
        maxWidth="sm"
        sx={{
          position: 'absolute',
          top: authenticated ? '55%' : '60%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          padding: 3,
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          border: `1px solid ${theme.border}`,
          textAlign: 'center',
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ 
          color: theme.textPrimary,
          fontWeight: 600,
          mb: 2
        }}>
          Find Properties by Location
        </Typography>
        
        <TextField
          label="Enter location (e.g., Colombo, Kandy, Galle)"
          variant="outlined"
          fullWidth
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          sx={{ 
            mb: 2,
            '& .MuiOutlinedInput-root': {
              backgroundColor: theme.inputBackground,
              '&:hover': {
                backgroundColor: isDark ? theme.surfaceBackground : theme.inputBackground,
              },
            },
          }}
        />
        
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Button 
            variant="contained" 
            color="primary" 
            fullWidth 
            onClick={handleSearch}
            sx={{
              py: 1.5,
              backgroundColor: theme.primary,
              '&:hover': {
                backgroundColor: theme.secondary,
                transform: 'translateY(-1px)',
                boxShadow: theme.shadows.medium,
              },
              transition: 'all 0.2s ease'
            }}
          >
            {location.trim() ? 'Search Location' : 'Search All'}
          </Button>
          
          <Button 
            variant="outlined" 
            color="primary" 
            fullWidth 
            onClick={handleButtonClick} 
            sx={{
              py: 1.5,
              borderColor: theme.primary,
              color: theme.primary,
              '&:hover': {
                backgroundColor: `${theme.primary}10`,
                borderColor: theme.secondary,
                color: theme.secondary,
                transform: 'translateY(-1px)',
                boxShadow: theme.shadows.light,
              },
              transition: 'all 0.2s ease'
            }}
          >
            Browse All Properties
          </Button>
        </Box>
      </Container>

      {/* Bottom Info Section for Guests */}
      {!authenticated && (
        <Container
          maxWidth="lg"
          sx={{
            position: 'absolute',
            bottom: '5%',
            left: '50%',
            transform: 'translate(-50%, 0)',
            zIndex: 2,
            textAlign: 'center',
          }}
        >
          <Box sx={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            padding: 3,
            borderRadius: 2,
            display: 'flex',
            justifyContent: 'space-around',
            flexWrap: 'wrap',
            gap: 3,
          }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.accent }}>
                1000+
              </Typography>
              <Typography variant="body2">
                Verified Properties
              </Typography>
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.accent }}>
                500+
              </Typography>
              <Typography variant="body2">
                Happy Tenants
              </Typography>
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.accent }}>
                100+
              </Typography>
              <Typography variant="body2">
                Trusted Owners
              </Typography>
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.accent }}>
                24/7
              </Typography>
              <Typography variant="body2">
                Support Available
              </Typography>
            </Box>
          </Box>
        </Container>
      )}
    </Box>
  );
};

export default UserHome;