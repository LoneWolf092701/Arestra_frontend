import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Search as SearchIcon,
  Favorite as FavoriteIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Info as InfoIcon,
  Help as HelpIcon,
  ContactSupport as ContactIcon,
  Business as BusinessIcon,
  Dashboard as DashboardIcon,
  List as ListIcon,
  Add as AddIcon,
  BookOnline as BookingIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { isAuthenticated, getUserRole, logoutUser } from '../../utils/auth';

const HamburgerMenuDropdown = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  const isLoggedIn = isAuthenticated();
  const userRole = getUserRole();
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (path) => {
    handleMenuClose();
    navigate(path);
  };

  const handleLogout = () => {
    handleMenuClose();
    logoutUser();
    navigate('/user-home');
  };

  // Define menu items based on authentication status and user role
  const getMenuItems = () => {
    const menuItems = [];

    if (!isLoggedIn) {
      // Guest menu items
      menuItems.push(
        { icon: <HomeIcon />, text: 'Home', path: '/user-home' },
        { icon: <SearchIcon />, text: 'Browse Properties', path: '/user-allproperties' },
        { icon: <InfoIcon />, text: 'About Us', path: '/about-us' },
        { icon: <HelpIcon />, text: 'Help', path: '/help-support' },
        { icon: <ContactIcon />, text: 'Contact', path: '/contact' }
      );
    } else {
      // Common authenticated user items
      if (userRole === 'user') {
        menuItems.push(
          { icon: <HomeIcon />, text: 'Home', path: '/user-home' },
          { icon: <SearchIcon />, text: 'Browse Properties', path: '/user-allproperties' },
          { icon: <FavoriteIcon />, text: 'My Favorites', path: '/user-favourites' },
          { icon: <BookingIcon />, text: 'My Bookings', path: '/user-bookings' },
          { icon: <NotificationsIcon />, text: 'Notifications', path: '/user-notifications' },
          { icon: <PersonIcon />, text: 'Profile', path: '/profile' }
        );
      } else if (userRole === 'propertyowner') {
        menuItems.push(
          { icon: <DashboardIcon />, text: 'Dashboard', path: '/home' },
          { icon: <ListIcon />, text: 'My Properties', path: '/my-properties' },
          { icon: <AddIcon />, text: 'Add Property', path: '/add-property' },
          { icon: <BookingIcon />, text: 'Booking Requests', path: '/property-owner-bookings' },
          { icon: <NotificationsIcon />, text: 'Notifications', path: '/notifications' },
          { icon: <PersonIcon />, text: 'Profile', path: '/profile' }
        );
      } else if (userRole === 'admin') {
        menuItems.push(
          { icon: <DashboardIcon />, text: 'Admin Dashboard', path: '/admin/home' },
          { icon: <BusinessIcon />, text: 'All Properties', path: '/admin/all-properties' },
          { icon: <ListIcon />, text: 'New Listings', path: '/admin/new-listings' },
          { icon: <PersonIcon />, text: 'Manage Users', path: '/admin/user-management' },
          { icon: <NotificationsIcon />, text: 'Notifications', path: '/notifications' },
          { icon: <SettingsIcon />, text: 'Settings', path: '/admin/settings' },
          { icon: <PersonIcon />, text: 'Profile', path: '/profile' }
        );
      }

      // Add common items for all authenticated users
      menuItems.push(
        { divider: true },
        { icon: <SettingsIcon />, text: 'Settings', path: '/settings' },
        { icon: <HelpIcon />, text: 'Help & Support', path: '/help-support' },
        { icon: <LogoutIcon />, text: 'Logout', action: 'logout' }
      );
    }

    return menuItems;
  };

  const menuItems = getMenuItems();

  return (
    <React.Fragment>
      <Tooltip title="Menu">
        <IconButton
          onClick={handleMenuOpen}
          sx={{
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              transform: 'scale(1.05)',
            },
            transition: 'all 0.2s ease-in-out',
          }}
          aria-label="navigation menu"
          aria-controls={open ? 'navigation-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <MenuIcon />
        </IconButton>
      </Tooltip>

      <Menu
        id="navigation-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        MenuListProps={{
          'aria-labelledby': 'navigation-menu-button',
        }}
        PaperProps={{
          sx: {
            backgroundColor: theme.paperBackground,
            border: `1px solid ${theme.border}`,
            borderRadius: 2,
            boxShadow: theme.shadows.heavy,
            minWidth: 220,
            mt: 1
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {!isLoggedIn && (
          <Box sx={{ px: 2, py: 1, borderBottom: `1px solid ${theme.border}` }}>
            <Typography variant="body2" color="text.secondary">
              Welcome to StayWise.lk
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Please log in to access all features
            </Typography>
          </Box>
        )}

        {isLoggedIn && (
          <Box sx={{ px: 2, py: 1, borderBottom: `1px solid ${theme.border}` }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: theme.textPrimary }}>
              {userRole === 'admin' ? 'Admin Panel' : 
               userRole === 'propertyowner' ? 'Property Owner' : 'User Dashboard'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {userRole === 'admin' ? 'Manage platform operations' : 
               userRole === 'propertyowner' ? 'Manage your properties' : 'Find your perfect home'}
            </Typography>
          </Box>
        )}

        {menuItems.map((item, index) => {
          if (item.divider) {
            return <Divider key={`divider-${index}`} sx={{ my: 1 }} />;
          }

          return (
            <MenuItem
              key={item.text}
              onClick={() => {
                if (item.action === 'logout') {
                  handleLogout();
                } else {
                  handleMenuItemClick(item.path);
                }
              }}
              sx={{
                px: 2,
                py: 1.5,
                color: theme.textPrimary,
                '&:hover': {
                  backgroundColor: theme.hover,
                  transform: 'translateX(4px)',
                },
                transition: 'all 0.2s ease-in-out',
                ...(item.action === 'logout' && {
                  color: 'error.main',
                  '&:hover': {
                    backgroundColor: 'rgba(211, 47, 47, 0.08)',
                  }
                })
              }}
            >
              <ListItemIcon sx={{ 
                color: item.action === 'logout' ? 'error.main' : theme.primary,
                minWidth: 36
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  variant: 'body2',
                  sx: { fontWeight: 500 }
                }}
              />
            </MenuItem>
          );
        })}
      </Menu>
    </React.Fragment>
  );
};

export default HamburgerMenuDropdown;