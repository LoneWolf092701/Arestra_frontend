import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Avatar, Box, IconButton, Tooltip, Button } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HamburgerMenuDropdown from './HamburgerMenuDropdown';
import logo from '../../assets/images/Logo.png';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { isAuthenticated } from '../../utils/auth';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { getNotifications, getUnreadNotificationCount } from '../../api/notificationApi';

const Header = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const authenticated = isAuthenticated();
  const roleValue = localStorage.getItem('userRole');
  
  const isAuthPage = ['/login', '/signup', '/forgot-password'].includes(location.pathname);

  const handleLogoClick = () => {
    if (!authenticated) {
      navigate('/user-home');
      return;
    }

    switch (roleValue) {
      case 'user':
        navigate('/user-home');
        break;
      case 'propertyowner':
        navigate('/home');
        break;
      case 'admin':
        navigate('/admin/home');
        break;
      default:
        console.warn('Unknown user role:', roleValue);
        navigate('/user-home');
    }
  };
  
  const handleNotificationsClick = () => {
    if (!authenticated) {
      navigate('/login');
      return;
    }

    switch (roleValue) {
      case 'user':
        navigate('/user-notifications');
        break;
      case 'propertyowner':
        navigate('/notifications');
        break;
      case 'admin':
        navigate('/notifications');
        break;
      default:
        console.warn('Unknown user role:', roleValue);
        navigate('/login');
    }
  };

  const getPageTitle = () => {
    switch (roleValue) {
      case 'admin':
        return 'Admin Dashboard - Manage the platform';
      case 'propertyowner':
        return 'Property Owner Dashboard - Manage your listings';
      case 'user':
        return 'User Dashboard - Find your perfect home';
      default:
        return 'User Profile';
    }
  };

  const handleAvatarClick = () => {
    if (!authenticated) {
      navigate('/login');
    } else {
      navigate('/profile');
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleSignupClick = () => {
    navigate('/signup');
  };

  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (authenticated) {
      try {
        const notifications = await getNotifications();
        const countResponse = await getUnreadNotificationCount();
        setUnreadCount(countResponse.unread_count || 0);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    }
  };

  useEffect(() => {
    fetchNotifications(); // Fetch on mount
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000); // Fetch every 5 minutes
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [authenticated]);

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{ 
        borderBottom: `1px solid ${theme.border || '#e0e0e0'}`,
        background: `linear-gradient(135deg, ${theme.primary || '#1976d2'} 0%, ${theme.primary + 'dd' || '#1976d2dd'} 100%)`,
        transition: 'all 0.3s ease',
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
        <Box
          component="img"
          src={logo}
          alt="StayWise.lk Logo"
          sx={{
            width: '250px',
            height: '68px',
            objectFit: 'contain',
            cursor: 'pointer',
            transition: 'transform 0.2s ease-in-out, filter 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.05)',
              filter: isDark ? 'brightness(1.1)' : 'brightness(0.95)',
            }
          }}
          onClick={handleLogoClick}
          title={authenticated ? `Go to ${roleValue || 'user'} dashboard` : 'Go to home page'}
        />

        {!isAuthPage && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title={`You have ${unreadCount} unread notifications`}>
              <IconButton
                onClick={handleNotificationsClick}
                sx={{
                  color: 'white',
                  position: 'relative',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <NotificationsIcon />
                {unreadCount > 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      backgroundColor: 'red',
                      color: 'white',
                      borderRadius: '50%',
                      width: 16,
                      height: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                    }}
                  >
                    {unreadCount}
                  </Box>
                )}
              </IconButton>
            </Tooltip>
            
            <Tooltip title={`Switch to ${isDark ? 'light' : 'dark'} theme`}>
              <IconButton
                onClick={toggleTheme}
                sx={{
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transform: 'rotate(180deg)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {isDark ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>
            
            {authenticated ? (
              <>
                <HamburgerMenuDropdown />
                
                <Tooltip title={`${getPageTitle()} - Click to view profile`}>
                  <IconButton
                    onClick={handleAvatarClick}
                    sx={{
                      p: 0,
                      ml: 1,
                      '&:hover': {
                        transform: 'scale(1.1)',
                      },
                      transition: 'transform 0.2s ease-in-out',
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: roleValue === 'admin' ? theme.accent || '#f44336' : 
                               roleValue === 'propertyowner' ? theme.secondary || '#ff9800' : theme.primary || '#1976d2',
                        color: 'white',
                        fontWeight: 'bold',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      }}
                    >
                      {roleValue === 'admin' ? 'A' : 
                       roleValue === 'propertyowner' ? 'P' : 'U'}
                    </Avatar>
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <>
                <HamburgerMenuDropdown />
                
                <Button
                  startIcon={<LoginIcon />}
                  variant="outlined"
                  onClick={handleLoginClick}
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    ml: 1,
                  }}
                >
                  Login
                </Button>
                
                <Button
                  startIcon={<PersonAddIcon />}
                  variant="contained"
                  onClick={handleSignupClick}
                  sx={{
                    backgroundColor: theme.accent || '#f44336',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: theme.secondary || '#ff9800',
                      transform: 'translateY(-1px)',
                    },
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;