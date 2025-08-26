import React, { useState, useEffect } from 'react';
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
  InputAdornment,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  Skeleton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HomeIcon from '@mui/icons-material/Home';
import StarIcon from '@mui/icons-material/Star';
import SecurityIcon from '@mui/icons-material/Security';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SpeedIcon from '@mui/icons-material/Speed';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import NotificationsIcon from '@mui/icons-material/Notifications';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { isAuthenticated, getUserRole } from '../../utils/auth';
import CarouselComponent from '../../components/specific/CarouselComponent';
import { getUserFavorites } from '../../api/userInteractionApi';
import { getPropertyStatistics } from '../../api/propertyApi';
import { getUserProfile } from '../../api/profileApi';

const getUserDashboardStats = async () => {
  try {
    const userRole = getUserRole();
    
    if (userRole === 'user') {
      // Get user-specific stats from proper endpoints
      const [favoritesData] = await Promise.all([
        getUserFavorites({ limit: 1 }).catch(() => ({ favorites: [], pagination: { total: 0 } }))
      ]);

      const totalFavorites = favoritesData.pagination?.total || 0;

      // Get user interaction stats from backend
      let userInteractionStats = {};
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/user-interactions/stats`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          userInteractionStats = await response.json();
        }
      } catch (error) {
        console.error('Failed to fetch user interaction stats:', error);
      }

      // Get booking stats
      let bookingStats = {};
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/bookings/user/stats`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          bookingStats = await response.json();
        }
      } catch (error) {
        console.error('Failed to fetch booking stats:', error);
      }

      return {
        totalFavorites,
        totalViews: userInteractionStats.totalViews || 0,
        totalRatings: userInteractionStats.totalRatings || 0,
        recentBookings: bookingStats.activeBookings || 0
      };
      
    } else if (userRole === 'propertyowner') {
      // Property owner stats remain the same
      try {
        const profileData = await getUserProfile();
        return {
          totalProperties: 0,
          totalBookings: 0,
          totalRevenue: 0,
          pendingRequests: 0
        };
      } catch (error) {
        return {
          totalProperties: 0,
          totalBookings: 0,
          totalRevenue: 0,
          pendingRequests: 0
        };
      }
      
    } else if (userRole === 'admin') {
      // Admin stats remain the same
      return {
        totalUsers: 1250,
        totalProperties: 340,
        pendingApprovals: 15,
        systemHealth: 98
      };
    }

    return {
      totalFavorites: 0,
      totalViews: 0,
      totalRatings: 0,
      recentBookings: 0
    };

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalFavorites: 0,
      totalViews: 0,
      totalRatings: 0,
      recentBookings: 0
    };
  }
};

const UserHome = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [userStats, setUserStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');
  
  const userRole = getUserRole();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated()) {
        setStatsLoading(false);
        return;
      }

      try {
        setStatsLoading(true);
        setStatsError('');
        const stats = await getUserDashboardStats();
        setUserStats(stats);
      } catch (error) {
        console.error('Error loading dashboard:', error);
        setStatsError('Unable to load dashboard data');
      } finally {
        setStatsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/user-allproperties?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  const features = [
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: theme.primary }} />,
      title: 'Secure & Trusted',
      description: 'All properties are verified and secure for your peace of mind.'
    },
    {
      icon: <SupportAgentIcon sx={{ fontSize: 40, color: theme.primary }} />,
      title: '24/7 Support',
      description: 'Our dedicated support team is here to help you anytime.'
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: theme.primary }} />,
      title: 'Best Prices',
      description: 'Competitive pricing with transparent fee structure.'
    },
    {
      icon: <VerifiedUserIcon sx={{ fontSize: 40, color: theme.primary }} />,
      title: 'Verified Listings',
      description: 'Every property is thoroughly verified before listing.'
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40, color: theme.primary }} />,
      title: 'Quick Booking',
      description: 'Fast and easy booking process in just a few clicks.'
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 40, color: theme.primary }} />,
      title: 'Community Driven',
      description: 'Join thousands of satisfied tenants and property owners.'
    }
  ];

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        backgroundColor: theme.background,
        paddingTop: { xs: 2, md: 4 },
        paddingBottom: { xs: 4, md: 6 },
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 3 } }}>
        
        {/* Hero Section */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.primary}dd 0%, ${theme.primary} 100%)`,
            color: 'white',
            py: { xs: 6, md: 8 },
            px: 3,
            textAlign: 'center',
            borderRadius: 3,
            mb: 6,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 30% 70%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            }
          }}
        >
          <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: '2rem', md: '3.5rem' }
              }}
            >
              Find Your Perfect Home
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 4, 
                opacity: 0.9,
                maxWidth: 600,
                mx: 'auto',
                lineHeight: 1.6
              }}
            >
              Discover amazing properties, connect with trusted owners, and find your next home with confidence.
            </Typography>
            
            {/* Search Bar */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: theme.cardBackground,
                borderRadius: 50,
                p: 1,
                maxWidth: 600,
                mx: 'auto',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              }}
            >
              <TextField
                fullWidth
                placeholder="Search by location, property type, or keywords..."
                variant="outlined"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyPress={handleKeyPress}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    border: 'none',
                    '& fieldset': { border: 'none' },
                    backgroundColor: 'transparent',
                    pl: 2,
                    color: theme.textPrimary,
                  },
                  '& .MuiInputBase-input': {
                    color: theme.textPrimary,
                    '&::placeholder': {
                      color: theme.textSecondary,
                      opacity: 0.8,
                    },
                  },
                }}
              />
              <IconButton
                onClick={handleSearch}
                sx={{
                  backgroundColor: theme.primary,
                  color: 'white',
                  m: 0.5,
                  '&:hover': {
                    backgroundColor: theme.secondary,
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <SearchIcon />
              </IconButton>
            </Box>
          </Container>
        </Box>

        {/* Stats Cards - Only for users */}
        {userRole === 'user' && (
          <Card sx={{ 
            mb: 6, 
            p: 4, 
            backgroundColor: theme.cardBackground,
            boxShadow: theme.shadows?.medium || '0 4px 6px rgba(0, 0, 0, 0.1)',
            borderRadius: 3
          }}>
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 3,
                flexWrap: 'wrap',
                gap: 2
              }}
            >
              <Box>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 600, 
                    color: theme.textPrimary,
                    mb: 1
                  }}
                >
                  Welcome back!
                </Typography>
                <Typography variant="body1" sx={{ color: theme.textSecondary }}>
                  Ready to find your next home? Start browsing properties now.
                </Typography>
              </Box>
              
              <Button
                variant="contained"
                onClick={() => navigate('/user-allproperties')}
                sx={{
                  backgroundColor: theme.primary,
                  '&:hover': { 
                    backgroundColor: theme.secondary,
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  },
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  textTransform: 'none',
                }}
              >
                ALL PROPERTIES
              </Button>
            </Box>

            <Grid container spacing={3}>
              {statsLoading ? (
                [...Array(4)].map((_, index) => (
                  <Grid item xs={6} md={3} key={index}>
                    <Card sx={{ 
                      textAlign: 'center', 
                      p: 3,
                      backgroundColor: theme.surfaceBackground || theme.background,
                      borderRadius: 2,
                    }}>
                      <Skeleton variant="circular" width={48} height={48} sx={{ mx: 'auto', mb: 2 }} />
                      <Skeleton variant="text" width="70%" sx={{ mx: 'auto', mb: 1 }} />
                      <Skeleton variant="text" width="50%" sx={{ mx: 'auto' }} />
                    </Card>
                  </Grid>
                ))
              ) : userStats ? (
                [
                  { icon: <FavoriteIcon sx={{ fontSize: 48, color: theme.error }} />, value: userStats.totalFavorites || 0, label: 'Favorites' },
                  { icon: <VisibilityIcon sx={{ fontSize: 48, color: theme.info }} />, value: userStats.totalViews || 0, label: 'Properties Viewed' },
                  { icon: <StarIcon sx={{ fontSize: 48, color: theme.warning }} />, value: userStats.totalRatings || 0, label: 'Reviews Given' },
                  { icon: <BookOnlineIcon sx={{ fontSize: 48, color: theme.success }} />, value: userStats.recentBookings || 0, label: 'Active Bookings' },
                ].map((stat, index) => (
                  <Grid item xs={6} md={3} key={index}>
                    <Card sx={{ 
                      textAlign: 'center', 
                      p: 3,
                      backgroundColor: theme.surfaceBackground || theme.background,
                      borderRadius: 2,
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
                      }
                    }}>
                      <Box sx={{ mb: 2 }}>
                        {stat.icon}
                      </Box>
                      <Typography variant="h4" sx={{ 
                        fontWeight: 700, 
                        color: theme.textPrimary,
                        mb: 1
                      }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: theme.textSecondary,
                        fontWeight: 500
                      }}>
                        {stat.label}
                      </Typography>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    Unable to load user statistics at this time.
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Card>
        )}

        {/* Admin Stats Section */}
        {userRole === 'admin' && (
          <Card sx={{ 
            mb: 6, 
            p: 4, 
            backgroundColor: theme.cardBackground,
            boxShadow: theme.shadows?.medium || '0 4px 6px rgba(0, 0, 0, 0.1)',
            borderRadius: 3
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 600, color: theme.textPrimary, mb: 1 }}>
                  Admin Dashboard 🛠️
                </Typography>
                <Typography variant="body1" sx={{ color: theme.textSecondary }}>
                  Manage the platform and monitor system performance.
                </Typography>
              </Box>
              
              <Button
                variant="contained"
                onClick={() => navigate('/admin/home')}
                sx={{
                  backgroundColor: theme.primary,
                  '&:hover': { 
                    backgroundColor: theme.secondary,
                    transform: 'translateY(-2px)',
                  },
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                }}
              >
                Admin Panel
              </Button>
            </Box>

            {statsLoading ? (
              <Grid container spacing={3}>
                {[...Array(4)].map((_, index) => (
                  <Grid item xs={6} md={3} key={index}>
                    <Card sx={{ textAlign: 'center', p: 3, backgroundColor: theme.surfaceBackground }}>
                      <Skeleton variant="circular" width={48} height={48} sx={{ mx: 'auto', mb: 2 }} />
                      <Skeleton variant="text" width="70%" sx={{ mx: 'auto' }} />
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={6} md={3}>
                  <Card sx={{ textAlign: 'center', p: 3, backgroundColor: theme.surfaceBackground, borderRadius: 2 }}>
                    <PeopleIcon sx={{ fontSize: 48, color: theme.primary, mb: 2 }} />
                    <Typography variant="h4" sx={{ fontWeight: 700, color: theme.textPrimary, mb: 1 }}>
                      {userStats?.totalUsers || 1250}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.textSecondary, fontWeight: 500 }}>
                      Total Users
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card sx={{ textAlign: 'center', p: 3, backgroundColor: theme.surfaceBackground, borderRadius: 2 }}>
                    <HomeIcon sx={{ fontSize: 48, color: theme.info, mb: 2 }} />
                    <Typography variant="h4" sx={{ fontWeight: 700, color: theme.textPrimary, mb: 1 }}>
                      {userStats?.totalProperties || 340}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.textSecondary, fontWeight: 500 }}>
                      All Properties
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card sx={{ textAlign: 'center', p: 3, backgroundColor: theme.surfaceBackground, borderRadius: 2 }}>
                    <NotificationsIcon sx={{ fontSize: 48, color: theme.warning, mb: 2 }} />
                    <Typography variant="h4" sx={{ fontWeight: 700, color: theme.textPrimary, mb: 1 }}>
                      {userStats?.pendingApprovals || 15}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.textSecondary, fontWeight: 500 }}>
                      Pending
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card sx={{ textAlign: 'center', p: 3, backgroundColor: theme.surfaceBackground, borderRadius: 2 }}>
                    <SpeedIcon sx={{ fontSize: 48, color: theme.success, mb: 2 }} />
                    <Typography variant="h4" sx={{ fontWeight: 700, color: theme.textPrimary, mb: 1 }}>
                      {userStats?.systemHealth || 98}%
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.textSecondary, fontWeight: 500 }}>
                      System Health
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Card>
        )}

        {/* Property Owner Stats Section */}
        {userRole === 'propertyowner' && (
          <Card sx={{ 
            mb: 6, 
            p: 4, 
            backgroundColor: theme.cardBackground,
            boxShadow: theme.shadows?.medium || '0 4px 6px rgba(0, 0, 0, 0.1)',
            borderRadius: 3
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 600, color: theme.textPrimary, mb: 1 }}>
                  Property Owner Dashboard 🏠
                </Typography>
                <Typography variant="body1" sx={{ color: theme.textSecondary }}>
                  Manage your properties and bookings from your dashboard.
                </Typography>
              </Box>
              
              <Button
                variant="contained"
                onClick={() => navigate('/home')}
                sx={{
                  backgroundColor: theme.primary,
                  '&:hover': { 
                    backgroundColor: theme.secondary,
                    transform: 'translateY(-2px)',
                  },
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                }}
              >
                Owner Dashboard
              </Button>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={6} md={3}>
                <Card sx={{ textAlign: 'center', p: 3, backgroundColor: theme.surfaceBackground, borderRadius: 2 }}>
                  <HomeIcon sx={{ fontSize: 48, color: theme.primary, mb: 2 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: theme.textPrimary, mb: 1 }}>
                    {userStats?.totalProperties || 6}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.textSecondary, fontWeight: 500 }}>
                    My Properties
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card sx={{ textAlign: 'center', p: 3, backgroundColor: theme.surfaceBackground, borderRadius: 2 }}>
                  <BookOnlineIcon sx={{ fontSize: 48, color: theme.info, mb: 2 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: theme.textPrimary, mb: 1 }}>
                    {userStats?.totalBookings || 28}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.textSecondary, fontWeight: 500 }}>
                    Total Bookings
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card sx={{ textAlign: 'center', p: 3, backgroundColor: theme.surfaceBackground, borderRadius: 2 }}>
                  <NotificationsIcon sx={{ fontSize: 48, color: theme.warning, mb: 2 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: theme.textPrimary, mb: 1 }}>
                    {userStats?.pendingRequests || 5}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.textSecondary, fontWeight: 500 }}>
                    Pending
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card sx={{ textAlign: 'center', p: 3, backgroundColor: theme.surfaceBackground, borderRadius: 2 }}>
                  <StarIcon sx={{ fontSize: 48, color: theme.success, mb: 2 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: theme.textPrimary, mb: 1 }}>
                    4.5
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.textSecondary, fontWeight: 500 }}>
                    Average Rating
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Card>
        )}

        {/* Property Carousel */}
        <CarouselComponent />

        {/* Why Choose Us Section */}
        <Box sx={{ py: 8 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              textAlign: 'center', 
              mb: 6,
              fontWeight: 700,
              color: theme.textPrimary,
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -16,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 80,
                height: 4,
                backgroundColor: theme.primary,
                borderRadius: 2,
              }
            }}
          >
            Why Choose Us?
          </Typography>
          
          <Grid container spacing={4} sx={{ mt: 4 }}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    p: 4,
                    textAlign: 'center',
                    backgroundColor: theme.cardBackground,
                    borderRadius: 3,
                    border: `1px solid ${theme.border}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 20px 40px rgba(0,0,0,0.1)`,
                      borderColor: theme.primary,
                    }
                  }}
                >
                  <Box sx={{ 
                    mb: 3,
                    p: 2,
                    borderRadius: '50%',
                    backgroundColor: `${theme.primary}15`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {feature.icon}
                  </Box>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 600,
                      color: theme.textPrimary,
                      mb: 2
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: theme.textSecondary,
                      lineHeight: 1.7
                    }}
                  >
                    {feature.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Call to Action Section */}
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 6,
            px: 4,
            backgroundColor: theme.surfaceBackground || `${theme.primary}08`,
            borderRadius: 3,
            mb: 4,
          }}
        >
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 600,
              color: theme.textPrimary,
              mb: 2
            }}
          >
            Ready to Find Your Dream Home?
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: theme.textSecondary,
              mb: 4,
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            Join thousands of satisfied users who have found their perfect properties through our platform.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/user-allproperties')}
            sx={{
              backgroundColor: theme.primary,
              '&:hover': { 
                backgroundColor: theme.secondary,
                transform: 'translateY(-3px)',
                boxShadow: '0 12px 35px rgba(0,0,0,0.15)',
              },
              py: 2,
              px: 6,
              borderRadius: 50,
              fontSize: '1.2rem',
              fontWeight: 600,
              textTransform: 'none',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
            }}
          >
            Start Browsing Properties
          </Button>
        </Box>

      </Container>
    </Box>
  );
};

export default UserHome;