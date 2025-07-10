import React, { useState, useEffect, useRef } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
  Badge
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import FavoriteIcon from '@mui/icons-material/Favorite';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import AddHomeIcon from '@mui/icons-material/AddHome';
import BusinessIcon from '@mui/icons-material/Business';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import ViewListIcon from '@mui/icons-material/ViewList';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import MessageIcon from '@mui/icons-material/Message';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { isAuthenticated } from '../../utils/auth';

const HamburgerMenuDropdown = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const navigate = useNavigate();
  const { toggleTheme, isDark } = useTheme();
  const menuRef = useRef(null);

  const authenticated = isAuthenticated();
  const roleValue = localStorage.getItem('userRole');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setAnchorEl(null);
      }
    };

    if (anchorEl) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [anchorEl]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (action) => {
    handleMenuClose();
    
    switch (action) {
      case 'home':
        if (!authenticated) {
          navigate('/user-home');
        } else {
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
              navigate('/user-home');
          }
        }
        break;

      case 'properties':
        if (!authenticated) {
          navigate('/user-allproperties');
        } else {
          navigate(roleValue === "propertyowner" ? '/myproperties' : '/user-allproperties');
        }
        break;
      
      case 'add-property':
        if (!authenticated) {
          navigate('/login');
        } else if (roleValue === "propertyowner") {
          navigate('/addproperty');
        } else {
          navigate('/login');
        }
        break;
      
      case 'notifications':
        if (!authenticated) {
          navigate('/login');
        } else {
          navigate(roleValue === "propertyowner" ? '/notifications' : '/user-notifications');
        }
        break;

      case 'theme':
        toggleTheme();
        break;
      
      case 'favourites':
        if (!authenticated) {
          navigate('/login');
        } else if (roleValue === 'user') {
          navigate('/user-favourites');
        } else {
          navigate('/login');
        }
        break;
      
      case 'admin-home':
        if (roleValue === 'admin') {
          navigate('/admin/home');
        }
        break;
      
      case 'review-listings':
        if (roleValue === 'admin') {
          navigate('/admin/new-listings');
        }
        break;
      
      case 'all-properties':
        if (roleValue === 'admin') {
          navigate('/admin/all-properties');
        }
        break;

      case 'booking-requests':
        if (!authenticated) {
          navigate('/login');
        } else if (roleValue === "propertyowner") {
          navigate('/bookings');
        } else if (roleValue === "user") {
          navigate('/user-bookings');
        } else {
          navigate('/login');
        }
        break;
      
      case 'logout':
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        localStorage.removeItem('tokenExpiry');
        localStorage.clear();
        navigate('/user-home');
        window.location.reload();
        break;
      
      case 'account':
        if (!authenticated) {
          navigate('/login');
        } else {
          navigate('/profile');
        }
        break;
      
      case 'messages':
        if (!authenticated) {
          navigate('/login');
        } else {
          navigate('/messages');
        }
        break;
        
      case 'transactions':
        if (!authenticated) {
          navigate('/login');
        } else {
          navigate('/transactions');
        }
        break;
      
      default:
        console.warn('Unknown menu action:', action);
    }
  };

  const getMenuItems = () => {
    const baseItems = [
      {
        label: 'Home',
        icon: <HomeIcon />,
        action: 'home',
        show: true
      },
      {
        label: 'Theme',
        icon: isDark ? <Brightness7Icon /> : <Brightness4Icon />,
        action: 'theme',
        show: true
      }
    ];

    if (!authenticated) {
      return [
        ...baseItems,
        {
          label: 'All Properties',
          icon: <ViewListIcon />,
          action: 'properties',
          show: true
        }
      ];
    }

    const authenticatedItems = [
      {
        label: 'Account',
        icon: <PersonIcon />,
        action: 'account',
        show: true
      },
      {
        label: 'Messages',
        icon: <MessageIcon />,
        action: 'messages',
        show: true
      },
      {
        label: 'Transactions',
        icon: <AccountBalanceWalletIcon />,
        action: 'transactions',
        show: true
      }
    ];

    switch (roleValue) {
      case 'user':
        return [
          ...baseItems,
          {
            label: 'All Properties',
            icon: <ViewListIcon />,
            action: 'properties',
            show: true
          },
          {
            label: 'Favourites',
            icon: <FavoriteIcon />,
            action: 'favourites',
            show: true
          },
          {
            label: 'My Bookings',
            icon: <BookmarkIcon />,
            action: 'booking-requests',
            show: true
          },
          {
            label: 'Notifications',
            icon: notificationCount > 0 ? (
              <Badge badgeContent={notificationCount} color="error">
                <NotificationsIcon />
              </Badge>
            ) : (
              <NotificationsIcon />
            ),
            action: 'notifications',
            show: true
          },
          { divider: true },
          ...authenticatedItems,
          { divider: true },
          {
            label: 'Logout',
            icon: <LogoutIcon />,
            action: 'logout',
            show: true
          }
        ];

      case 'propertyowner':
        return [
          ...baseItems,
          {
            label: 'My Properties',
            icon: <BusinessIcon />,
            action: 'properties',
            show: true
          },
          {
            label: 'Add Property',
            icon: <AddHomeIcon />,
            action: 'add-property',
            show: true
          },
          {
            label: 'Booking Requests',
            icon: <PendingActionsIcon />,
            action: 'booking-requests',
            show: true
          },
          {
            label: 'Notifications',
            icon: notificationCount > 0 ? (
              <Badge badgeContent={notificationCount} color="error">
                <NotificationsIcon />
              </Badge>
            ) : (
              <NotificationsIcon />
            ),
            action: 'notifications',
            show: true
          },
          { divider: true },
          ...authenticatedItems,
          { divider: true },
          {
            label: 'Logout',
            icon: <LogoutIcon />,
            action: 'logout',
            show: true
          }
        ];

      case 'admin':
        return [
          ...baseItems,
          {
            label: 'Admin Dashboard',
            icon: <AdminPanelSettingsIcon />,
            action: 'admin-home',
            show: true
          },
          {
            label: 'Review New Listings',
            icon: <PendingActionsIcon />,
            action: 'review-listings',
            show: true
          },
          {
            label: 'All Properties',
            icon: <ViewListIcon />,
            action: 'all-properties',
            show: true
          },
          { divider: true },
          ...authenticatedItems,
          { divider: true },
          {
            label: 'Logout',
            icon: <LogoutIcon />,
            action: 'logout',
            show: true
          }
        ];

      default:
        return [
          ...authenticatedItems,
          { divider: true },
          {
            label: 'Logout',
            icon: <LogoutIcon />,
            action: 'logout',
            show: true
          }
        ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <>
      <IconButton
        edge="start"
        color="inherit"
        aria-label="menu"
        onClick={handleMenuOpen}
        sx={{ 
          mr: 2,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }
        }}
      >
        <MenuIcon />
      </IconButton>
      
      <Menu
        ref={menuRef}
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            minWidth: 200,
            mt: 1,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1,
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }
          }
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
      >
        {authenticated && (
          <>
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {roleValue === 'propertyowner' ? 'Property Owner' : 
                 roleValue === 'admin' ? 'Administrator' : 'User'}
              </Typography>
            </Box>
            <Divider />
          </>
        )}

        {menuItems.map((item, index) => {
          if (item.divider) {
            return <Divider key={`divider-${index}`} />;
          }

          if (!item.show) return null;

          return (
            <MenuItem
              key={item.action || index}
              onClick={() => handleMenuItemClick(item.action)}
              sx={{
                minHeight: 48,
                gap: 1
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

export default HamburgerMenuDropdown;