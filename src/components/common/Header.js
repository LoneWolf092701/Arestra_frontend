import React from 'react';
import { AppBar, Toolbar, Avatar, Box, IconButton, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import HamburgerMenuDropdown from './HamburgerMenuDropdown';
import logo from '../../assets/images/Logo.png';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';


const Header = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Get user role from localStorage to determine navigation behavior
  const roleValue = localStorage.getItem('userRole');
  const isAuthenticated = !!localStorage.getItem('token');
  
  // Don't show navigation elements on authentication pages
  const isAuthPage = ['/login', '/signup', '/forgot-password'].includes(location.pathname);

  const handleLogoClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
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
        navigate('/login');
        break;
    }
  };

  /**
   * Dynamic Avatar Generation Based on User Role
   * This function creates role-specific avatars with theme-aware colors
   * Notice how we use theme colors for consistency with the overall design
   */
  const getAvatarSrc = () => {
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
          title={isAuthenticated ? `Go to ${roleValue || 'user'} dashboard` : 'Go to login'}
        />

        {/* 
          Navigation Controls Section
        */}
        {!isAuthPage && isAuthenticated ? (
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
                onClick={() => {
                  // Future enhancement: could open user profile menu
                  console.log('Avatar clicked - future: open profile menu');
                }}
              />
            </Tooltip>
          </Box>
        ) : (
          /* 
            Guest User Indicator
          */
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Theme toggle available even for non-authenticated users */}
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
            
            <Avatar
              alt="Guest User"
              src={`https://via.placeholder.com/40/${theme.border.substring(1)}/white?text=?`}
              sx={{ 
                opacity: 0.7,
                transition: 'opacity 0.3s ease',
              }}
            />
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;