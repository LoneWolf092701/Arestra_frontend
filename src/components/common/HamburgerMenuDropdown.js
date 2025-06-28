import React, { useState, useContext } from 'react';
import { Menu, MenuItem, IconButton, Divider, ListItemIcon, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MessageIcon from '@mui/icons-material/Message';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HomeIcon from '@mui/icons-material/Home';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import PaletteIcon from '@mui/icons-material/Palette';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ReviewsIcon from '@mui/icons-material/Reviews';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RequestPageIcon from '@mui/icons-material/RequestPage';
import HistoryIcon from '@mui/icons-material/History';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../../contexts/ThemeContext';
import { isAuthenticated } from '../../utils/auth';

const HamburgerMenuDropdown = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const roleValue = localStorage.getItem('userRole');
  const { toggleTheme } = useContext(ThemeContext);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Guest/Non-authenticated Menu Options
  const menuOptionsGuest = [
    { 
      label: 'Browse Properties', 
      icon: <SearchIcon />, 
      action: 'browse-properties',
      description: 'View all available properties'
    },
    { 
      label: 'Login', 
      icon: <LoginIcon />, 
      action: 'login',
      description: 'Sign in to your account'
    },
    { 
      label: 'Sign Up', 
      icon: <PersonAddIcon />, 
      action: 'signup',
      description: 'Create a new account'
    },
    { 
      label: 'Switch Theme', 
      icon: <PaletteIcon />, 
      action: 'theme',
      description: 'Toggle between light and dark themes'
    }
  ];

  // Property Owner Menu Options
  // Property owners need to manage their listings, view booking requests, and track performance
  const menuOptionsOwner = [
    { 
      label: 'Messages', 
      icon: <MessageIcon />, 
      action: 'messages',
      description: 'Communication with potential tenants'
    },
    { 
      label: 'Notifications', 
      icon: <NotificationsIcon />, 
      action: 'notifications',
      description: 'Alerts about property inquiries and updates'
    },
    { 
      label: 'Properties', 
      icon: <HomeIcon />, 
      action: 'properties',
      description: 'Manage your property listings'
    },
    { 
      label: 'Booking Request', 
      icon: <RequestPageIcon />, 
      action: 'booking-requests',
      description: 'Review and respond to booking requests'
    },
    { 
      label: 'Transaction History', 
      icon: <HistoryIcon />, 
      action: 'transactions',
      description: 'View payment and booking history'
    },
    { 
      label: 'Account', 
      icon: <AccountCircleIcon />, 
      action: 'account',
      description: 'Manage your account settings'
    },
    { 
      label: 'Switch Theme', 
      icon: <PaletteIcon />, 
      action: 'theme',
      description: 'Toggle between light and dark themes'
    },
    { 
      label: 'Logout', 
      icon: <LogoutIcon />, 
      action: 'logout',
      description: 'Sign out of your account'
    }
  ];

  // User Menu Options  
  // End users need to browse properties, manage favorites, and track their bookings
  const menuOptionsUser = [
    { 
      label: 'Browse Properties', 
      icon: <SearchIcon />, 
      action: 'browse-properties',
      description: 'View all available properties'
    },
    { 
      label: 'Messages', 
      icon: <MessageIcon />, 
      action: 'messages',
      description: 'Chat with property owners'
    },
    { 
      label: 'Notifications', 
      icon: <NotificationsIcon />, 
      action: 'notifications',
      description: 'Important updates and alerts'
    },
    { 
      label: 'Favourites', 
      icon: <FavoriteIcon />, 
      action: 'favourites',
      description: 'Your saved properties'
    },
    { 
      label: 'Account', 
      icon: <AccountCircleIcon />, 
      action: 'account',
      description: 'Manage your profile and preferences'
    },
    { 
      label: 'Switch Theme', 
      icon: <PaletteIcon />, 
      action: 'theme',
      description: 'Customize your viewing experience'
    },
    { 
      label: 'Logout', 
      icon: <LogoutIcon />, 
      action: 'logout',
      description: 'Sign out securely'
    }
  ];

  // Admin Menu Options
  // Admins need comprehensive platform management capabilities
  const menuOptionsAdmin = [
    { 
      label: 'Dashboard', 
      icon: <AdminPanelSettingsIcon />, 
      action: 'admin-home',
      description: 'Admin overview and statistics'
    },
    { 
      label: 'Review New Listings', 
      icon: <ReviewsIcon />, 
      action: 'review-listings',
      description: 'Approve or reject pending property submissions'
    },
    { 
      label: 'All Properties', 
      icon: <VisibilityIcon />, 
      action: 'all-properties',
      description: 'Monitor all approved properties'
    },
    { 
      label: 'Browse Properties', 
      icon: <SearchIcon />, 
      action: 'browse-properties',
      description: 'View properties as users see them'
    },
    { 
      label: 'Messages', 
      icon: <MessageIcon />, 
      action: 'messages',
      description: 'Platform-wide communication management'
    },
    { 
      label: 'Notifications', 
      icon: <NotificationsIcon />, 
      action: 'notifications',
      description: 'System alerts and admin notifications'
    },
    { 
      label: 'Account', 
      icon: <AccountCircleIcon />, 
      action: 'account',
      description: 'Admin account settings'
    },
    { 
      label: 'Switch Theme', 
      icon: <PaletteIcon />, 
      action: 'theme',
      description: 'Interface appearance settings'
    },
    { 
      label: 'Logout', 
      icon: <LogoutIcon />, 
      action: 'logout',
      description: 'Secure admin logout'
    }
  ];

  /**
   * Navigation Handler Function
   */
  const handleMenuItemClick = (action) => {
    switch (action) {
      // Public browsing - available to all users
      case 'browse-properties':
        navigate('/user-allproperties');
        break;
      
      // Authentication actions
      case 'login':
        navigate('/login');
        break;
      
      case 'signup':
        navigate('/signup');
        break;
      
      // Property-related navigation
      case 'properties':
        navigate(roleValue === "propertyowner" ? '/myproperties' : '/user-allproperties');
        break;
      
      // Notification handling - routes to role-specific notification pages
      case 'notifications':
        if (!authenticated) {
          navigate('/login');
        } else {
          navigate(roleValue === "propertyowner" ? '/notifications' : '/user-notifications');
        }
        break;

      // Theme switching - immediate UI change without navigation
      case 'theme':
        toggleTheme();
        break;
      
      // User-specific navigation
      case 'favourites':
        if (!authenticated) {
          navigate('/login');
        } else {
          navigate('/user-favourites');
        }
        break;
      
      // Admin-specific navigation - implements our new admin system
      case 'admin-home':
        navigate('/admin/home');
        break;
      
      case 'review-listings':
        navigate('/admin/new-listings');
        break;
      
      case 'all-properties':
        navigate('/admin/all-properties');
        break;
      
      // Security-critical logout functionality
      case 'logout':
        // Clear all authentication data to ensure complete logout
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('tokenExpiry');
        navigate('/user-home'); // Redirect to public home page after logout
        break;
      
      // Account management
      case 'account':
        if (!authenticated) {
          navigate('/login');
        } else {
          navigate('/profile');
        }
        break;
      
      // Placeholder actions for future implementation
      case 'messages':
      case 'booking-requests':
      case 'transactions':
        if (!authenticated) {
          navigate('/login');
        } else {
          navigate('/profile');
        }
        break;
      
      default:
        console.log(`Unhandled menu action: ${action}`);
    }
    
    // Always close the menu after handling the action
    handleMenuClose();
  };

  /**
   * Dynamic Menu Selection
   */
  const getMenuOptions = () => {
    if (!authenticated) {
      return menuOptionsGuest;
    }

    switch (roleValue) {
      case "propertyowner":
        return menuOptionsOwner;
      case "user":
        return menuOptionsUser;
      case "admin":
        return menuOptionsAdmin;
      default:
        // Fallback for undefined roles - basic options only
        return [
          { label: 'Browse Properties', icon: <SearchIcon />, action: 'browse-properties' },
          { label: 'Switch Theme', icon: <PaletteIcon />, action: 'theme' },
          { label: 'Logout', icon: <LogoutIcon />, action: 'logout' }
        ];
    }
  };

  const currentMenuOptions = getMenuOptions();

  return (
    <>
      {/* Menu trigger button with accessible design */}
      <IconButton
        edge="start"
        color="inherit"
        aria-label="menu"
        onClick={handleMenuOpen}
        aria-haspopup="true"
        aria-expanded={Boolean(anchorEl)}
      >
        <MenuIcon sx={{ color: "#fff" }} />
      </IconButton>

      {/* Dynamic menu with role-based content */}
      <Menu 
        anchorEl={anchorEl} 
        open={Boolean(anchorEl)} 
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 220,
            mt: 1.5,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1.5,
            },
          },
        }}
      >
        {/* Role indicator at the top of the menu */}
        <MenuItem disabled sx={{ opacity: 0.6, fontWeight: 'bold' }}>
          {!authenticated && "Guest User"}
          {authenticated && roleValue === "propertyowner" && "Property Owner"}
          {authenticated && roleValue === "user" && "Tenant"}
          {authenticated && roleValue === "admin" && "Administrator"}
        </MenuItem>
        
        <Divider />

        {/* Dynamic menu items based on user role and authentication status */}
        {currentMenuOptions.map((option, index) => (
          <MenuItem 
            key={index} 
            onClick={() => handleMenuItemClick(option.action)}
            sx={{
              '&:hover': {
                backgroundColor: 'action.hover',
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              {option.icon}
            </ListItemIcon>
            <ListItemText 
              primary={option.label}
              primaryTypographyProps={{ fontSize: '0.875rem' }}
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default HamburgerMenuDropdown;