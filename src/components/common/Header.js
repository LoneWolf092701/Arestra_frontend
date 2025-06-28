import React from 'react';
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

const Header = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Get authentication status and user role
  const authenticated = isAuthenticated();
  const roleValue = localStorage.getItem('userRole');
  
  // Don't show navigation elements on authentication pages
  const isAuthPage = ['/login', '/signup', '/forgot-password'].includes(location.pathname);

  const handleLogoClick = () => {
    if (!authenticated) {
      // For non-authenticated users, go to public home page
      navigate('/user-home');
      return;
    }

    // Route to appropriate home page based on user role
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
        break;
    }
  };

  /**
   * Dynamic Avatar Generation Based on User Role
   * This function creates role-specific avatars with theme-aware colors
   * Notice how we use theme colors for consistency with the overall design
   */
  const getAvatarSrc = () => {
    if (!authenticated) {
      // Guest user avatar
      return `https://via.placeholder.com/40/${theme.textDisabled.substring(1)}/white?text=G`;
    }

    // Base URL for generating colored avatars with initials
    const baseUrl = 'https://via.placeholder.com/40';
    
    switch (roleValue) {
      case 'admin':
        // Using theme secondary color for admin identification
        return `${baseUrl}/${theme.secondary.substring(1)}/white?text=A`;
      case 'propertyowner':
        // Using theme primary color for property owners
        return `${baseUrl}/${theme.primary.substring(1)}/white?text=O`;
      case 'user':
        // Using theme accent color for regular users
        return `${baseUrl}/${theme.accent.substring(1)}/white?text=U`;
      default:
        // Fallback for unknown roles
        return `${baseUrl}/757575/white?text=?`;
    }
  };

  /**
   * Role-Based Tooltip Generation
   * Provides contextual information about the user's current role and capabilities
   */
  const getAvatarTitle = () => {
    if (!authenticated) {
      return 'Guest User - Login to access more features';
    }

    switch (roleValue) {
      case 'admin':
        return 'Admin Dashboard - Full platform management';
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
      // Future enhancement: could open user profile menu
      navigate('/profile');
    }
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{ 
        // The borderBottom uses theme colors for consistency
        borderBottom: `1px solid ${theme.border}`,
        // Material-UI automatically handles the background color based on our theme
        background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primary}dd 100%)`,
        // Smooth transitions make theme changes feel polished and professional
        transition: 'all 0.3s ease',
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
        {/* 
          Logo Section with Smart Navigation
        */}
        <Box
          component="img"
          src={logo}
          alt="StayWise.lk Logo"
          sx={{
            width: '250px',
            height: '68px',
            objectFit: 'contain',
            cursor: 'pointer',
            // Hover effects that work with both light and dark themes
            transition: 'transform 0.2s ease-in-out, filter 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.05)',
              // Slight brightness adjustment on hover, adapting to theme
              filter: isDark ? 'brightness(1.1)' : 'brightness(0.95)',
            }
          }}
          onClick={handleLogoClick}
          title={authenticated ? `Go to ${roleValue || 'user'} dashboard` : 'Go to home page'}
        />

        {/* 
          Navigation Controls Section
        */}
        {!isAuthPage ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Theme Toggle Button */}
            <Tooltip title={`Switch to ${isDark ? 'light' : 'dark'} theme`}>
              <IconButton
                onClick={toggleTheme}
                sx={{
                  color: 'white',
                  // Visual feedback for theme toggle interaction
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transform: 'rotate(180deg)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {/* Icon changes based on current theme state */}
                {isDark ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>
            
            {/* Show different content for authenticated vs non-authenticated users */}
            {authenticated ? (
              <>
                {/* Hamburger Menu with Role-Based Options */}
                <HamburgerMenuDropdown />
                
                {/* User Avatar with Role-Based Styling */}
                <Tooltip title={getAvatarTitle()}>
                  <Avatar
                    alt={`${roleValue || 'User'} Avatar`}
                    src={getAvatarSrc()}
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'scale(1.1)',
                        // Theme-aware glow effect on hover
                        boxShadow: `0 0 0 3px ${theme.accent}40`,
                      },
                      // Role-specific border colors using theme properties
                      border: '2px solid',
                      borderColor: roleValue === 'admin' ? theme.secondary : 
                                 roleValue === 'propertyowner' ? theme.primary : 
                                 roleValue === 'user' ? theme.accent : 'transparent',
                    }}
                    onClick={handleAvatarClick}
                  />
                </Tooltip>
              </>
            ) : (
              <>
                {/* Login and Sign Up buttons for non-authenticated users */}
                <Button
                  variant="outlined"
                  startIcon={<LoginIcon />}
                  onClick={() => navigate('/login')}
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  Login
                </Button>
                
                <Button
                  variant="contained"
                  startIcon={<PersonAddIcon />}
                  onClick={() => navigate('/signup')}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    color: theme.primary,
                    '&:hover': {
                      backgroundColor: 'white',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  Sign Up
                </Button>
                
                {/* Guest Avatar */}
                <Tooltip title={getAvatarTitle()}>
                  <Avatar
                    alt="Guest User"
                    src={getAvatarSrc()}
                    sx={{ 
                      cursor: 'pointer',
                      opacity: 0.8,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        opacity: 1,
                        transform: 'scale(1.05)',
                      },
                    }}
                    onClick={handleAvatarClick}
                  />
                </Tooltip>
              </>
            )}
          </Box>
        ) : (
          /* 
            Authentication pages - minimal header
          */
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Theme toggle available even on auth pages */}
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
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;