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
      const [favoritesData, profileData] = await Promise.all([
        getUserFavorites({ limit: 5 }).catch(() => ({ favorites: [], pagination: { total: 0 } })),
        getUserProfile().catch(() => ({}))
      ]);

      const favoriteProperties = favoritesData.favorites || [];
      const totalFavorites = favoritesData.pagination?.total || 0;

      let totalViews = 0;
      let totalRatings = 0;
      let recentBookings = 0;

      for (const property of favoriteProperties) {
        if (property?.property_id) {
          try {
            const stats = await getPropertyStatistics(property.property_id);
            totalViews += stats.total_views || 0;
            totalRatings += stats.total_ratings || 0;
          } catch (error) {
            console.log('Could not fetch stats for property:', property.property_id);
          }
        }
      }

      return {
        totalFavorites,
        totalViews,
        totalRatings,
        recentBookings,
        profileCompleteness: profileData.username ? 85 : 45
      };
      
    } else if (userRole === 'propertyowner') {
      try {
        const profileData = await getUserProfile();
        return {
          totalProperties: 0,
          totalBookings: 0,
          totalRevenue: 0,
          pendingRequests: 0,
          profileCompleteness: profileData.business_name ? 90 : 50
        };
      } catch (error) {
        return {
          totalProperties: 0,
          totalBookings: 0,
          totalRevenue: 0,
          pendingRequests: 0,
          profileCompleteness: 50
        };
      }
      
    } else if (userRole === 'admin') {
      try {
        const profileData = await getUserProfile();
        return {
          totalUsers: 0,
          totalProperties: 0,
          pendingApprovals: 0,
          systemHealth: 95,
          profileCompleteness: profileData.username ? 100 : 70
        };
      } catch (error) {
        return {
          totalUsers: 0,
          totalProperties: 0,
          pendingApprovals: 0,
          systemHealth: 95,
          profileCompleteness: 70
        };
      }
    }

    return {
      totalFavorites: 0,
      totalViews: 0,
      totalRatings: 0,
      recentBookings: 0,
      profileCompleteness: 50
    };

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalFavorites: 0,
      totalViews: 0,
      totalRatings: 0,
      recentBookings: 0,
      profileCompleteness: 50
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
    <Box sx={{ 
      minHeight: '100vh',
      background: theme.background,
      pt: 4,
      pb: 8
    }}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 6 }}>
          <Typography 
            variant="h2" 
            sx={{ 
              textAlign: 'center', 
              mb: 2,
              fontWeight: 700,
              background: `linear-gradient(45deg, ${theme.primary}, ${theme.secondary})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '2.5rem', md: '3.5rem' }
            }}
          >
            Find Your Perfect Home
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              textAlign: 'center', 
              color: theme.textSecondary, 
              mb: 4,
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            Discover amazing properties, connect with trusted owners, and find your next home with confidence.
          </Typography>

          <Paper
            component="form"
            onSubmit={handleSearch}
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              maxWidth: 600,
              mx: 'auto',
              mb: 4,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              borderRadius: 3,
              background: theme.cardBackground,
            }}
          >
            <TextField
              fullWidth
              placeholder="Search by location, property type, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  border: 'none',
                  '& fieldset': { border: 'none' },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOnIcon sx={{ color: theme.textSecondary }} />
                  </InputAdornment>
                ),
              }}
            />
            <IconButton 
              type="submit" 
              sx={{ 
                p: 2,
                backgroundColor: theme.primary,
                color: 'white',
                '&:hover': { backgroundColor: theme.secondary },
                ml: 1
              }}
            >
              <SearchIcon />
            </IconButton>
          </Paper>
        </Box>

        {isAuthenticated() && (
          <Card sx={{ 
            mb: 6, 
            borderRadius: 3,
            background: theme.isDark ? 
              'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, color: theme.textPrimary, mb: 1 }}>
                  Welcome back! 👋
                </Typography>
                <Typography variant="body1" sx={{ color: theme.textSecondary }}>
                  {userRole === 'user' && 'Ready to find your next home? Start browsing properties now.'}
                  {userRole === 'propertyowner' && 'Manage your properties and bookings from your dashboard.'}
                  {userRole === 'admin' && 'Access your admin dashboard to manage the platform.'}
                </Typography>
              </Box>
              
              <Button
                variant="contained"
                onClick={() => {
                  switch (userRole) {
                    case 'user':
                      navigate('/user-allproperties');
                      break;
                    case 'propertyowner':
                      navigate('/home');
                      break;
                    case 'admin':
                      navigate('/admin/home');
                      break;
                    default:
                      navigate('/user-allproperties');
                  }
                }}
                sx={{
                  backgroundColor: theme.primary,
                  '&:hover': { backgroundColor: theme.secondary },
                  borderRadius: 2,
                  px: 3
                }}
              >
                ALL PROPERTIES
              </Button>
            </Box>

            {userRole === 'user' && (
              <Grid container spacing={2}>
                {statsLoading ? (
                  [...Array(4)].map((_, index) => (
                    <Grid item xs={6} md={3} key={index}>
                      <Card sx={{ textAlign: 'center', p: 2 }}>
                        <Skeleton variant="circular" width={40} height={40} sx={{ mx: 'auto', mb: 1 }} />
                        <Skeleton variant="text" />
                        <Skeleton variant="text" width="60%" sx={{ mx: 'auto' }} />
                      </Card>
                    </Grid>
                  ))
                ) : userStats ? (
                  <>
                    <Grid item xs={6} md={3}>
                      <Card sx={{ textAlign: 'center', p: 2, backgroundColor: theme.cardBackground }}>
                        <FavoriteIcon sx={{ fontSize: 40, color: theme.primary, mb: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: theme.textPrimary }}>
                          {userStats.totalFavorites}
                        </Typography>
                        <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                          Favorites
                        </Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Card sx={{ textAlign: 'center', p: 2, backgroundColor: theme.cardBackground }}>
                        <HomeIcon sx={{ fontSize: 40, color: theme.primary, mb: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: theme.textPrimary }}>
                          {userStats.totalViews}
                        </Typography>
                        <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                          Properties Viewed
                        </Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Card sx={{ textAlign: 'center', p: 2, backgroundColor: theme.cardBackground }}>
                        <StarIcon sx={{ fontSize: 40, color: theme.primary, mb: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: theme.textPrimary }}>
                          {userStats.totalRatings}
                        </Typography>
                        <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                          Reviews Given
                        </Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Card sx={{ textAlign: 'center', p: 2, backgroundColor: theme.cardBackground }}>
                        <BookOnlineIcon sx={{ fontSize: 40, color: theme.primary, mb: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: theme.textPrimary }}>
                          {userStats.recentBookings}
                        </Typography>
                        <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                          Active Bookings
                        </Typography>
                      </Card>
                    </Grid>
                  </>
                ) : statsError ? (
                  <Grid item xs={12}>
                    <Alert severity="warning" sx={{ borderRadius: 2 }}>
                      {statsError}. Please refresh the page to try again.
                    </Alert>
                  </Grid>
                ) : null}
              </Grid>
            )}

            {userRole === 'propertyowner' && userStats && (
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <Card sx={{ textAlign: 'center', p: 2, backgroundColor: theme.cardBackground }}>
                    <HomeIcon sx={{ fontSize: 40, color: theme.primary, mb: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: theme.textPrimary }}>
                      {userStats.totalProperties}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                      Properties
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card sx={{ textAlign: 'center', p: 2, backgroundColor: theme.cardBackground }}>
                    <BookOnlineIcon sx={{ fontSize: 40, color: theme.primary, mb: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: theme.textPrimary }}>
                      {userStats.totalBookings}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                      Bookings
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card sx={{ textAlign: 'center', p: 2, backgroundColor: theme.cardBackground }}>
                    <TrendingUpIcon sx={{ fontSize: 40, color: theme.primary, mb: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: theme.textPrimary }}>
                      ${userStats.totalRevenue}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                      Revenue
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card sx={{ textAlign: 'center', p: 2, backgroundColor: theme.cardBackground }}>
                    <NotificationsIcon sx={{ fontSize: 40, color: theme.primary, mb: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: theme.textPrimary }}>
                      {userStats.pendingRequests}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                      Pending
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            )}

            {userRole === 'admin' && userStats && (
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <Card sx={{ textAlign: 'center', p: 2, backgroundColor: theme.cardBackground }}>
                    <PeopleIcon sx={{ fontSize: 40, color: theme.primary, mb: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: theme.textPrimary }}>
                      {userStats.totalUsers}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                      Users
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card sx={{ textAlign: 'center', p: 2, backgroundColor: theme.cardBackground }}>
                    <HomeIcon sx={{ fontSize: 40, color: theme.primary, mb: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: theme.textPrimary }}>
                      {userStats.totalProperties}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                      Properties
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card sx={{ textAlign: 'center', p: 2, backgroundColor: theme.cardBackground }}>
                    <NotificationsIcon sx={{ fontSize: 40, color: theme.primary, mb: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: theme.textPrimary }}>
                      {userStats.pendingApprovals}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                      Pending
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card sx={{ textAlign: 'center', p: 2, backgroundColor: theme.cardBackground }}>
                    <SpeedIcon sx={{ fontSize: 40, color: theme.primary, mb: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: theme.textPrimary }}>
                      {userStats.systemHealth}%
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                      System Health
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Card>
        )}

        <CarouselComponent />

        <Box sx={{ mt: 8, mb: 6 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              textAlign: 'center', 
              mb: 6,
              fontWeight: 600,
              color: theme.textPrimary
            }}
          >
            Why Choose Us?
          </Typography>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    p: 3,
                    textAlign: 'center',
                    backgroundColor: theme.cardBackground,
                    borderRadius: 3,
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                    }
                  }}
                >
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography 
                    variant="h6" 
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
                      lineHeight: 1.6
                    }}
                  >
                    {feature.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/user-allproperties')}
            sx={{
              backgroundColor: theme.primary,
              '&:hover': { backgroundColor: theme.secondary },
              py: 2,
              px: 4,
              borderRadius: 3,
              fontSize: '1.1rem',
              fontWeight: 600
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