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
          switch (roleValue) {
            case 'user':
              navigate('/user-allproperties');
              break;
            case 'propertyowner':
              navigate('/myproperties');
              break;
            case 'admin':
              navigate('/admin/all-properties');
              break;
            default:
              navigate('/user-allproperties');
          }
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
              navigate('/login');
          }
        }
        break;

      case 'favourites':
        if (!authenticated) {
          navigate('/login');
        } else if (roleValue === "user") {
          navigate('/user-favourites');
        } else {
          navigate('/login');
        }
        break;

      case 'bookings':
        if (!authenticated) {
          navigate('/login');
        } else {
          switch (roleValue) {
            case 'user':
              navigate('/user-bookings');
              break;
            case 'propertyowner':
              navigate('/bookings');
              break;
            case 'admin':
              navigate('/bookings');
              break;
            default:
              navigate('/login');
          }
        }
        break;

      case 'admin-new-listings':
        if (roleValue === 'admin') {
          navigate('/admin/new-listings');
        }
        break;

      case 'admin-all-properties':
        if (roleValue === 'admin') {
          navigate('/admin/all-properties');
        }
        break;

      case 'profile':
        if (authenticated) {
          navigate('/profile');
        } else {
          navigate('/login');
        }
        break;

      case 'messages':
        if (authenticated) {
          navigate('/messages');
        } else {
          navigate('/login');
        }
        break;

      case 'transactions':
        if (authenticated) {
          navigate('/transactions');
        } else {
          navigate('/login');
        }
        break;

      case 'logout':
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('tokenExpiry');
        navigate('/user-home');
        break;

      default:
        console.warn('Unknown action:', action);
    }
  };

  const getMenuItems = () => {
    const commonItems = [
      {
        label: 'Home',
        icon: <HomeIcon />,
        action: 'home'
      },
      {
        label: 'Theme',
        icon: isDark ? <Brightness7Icon /> : <Brightness4Icon />,
        action: () => toggleTheme(),
        onClick: true
      }
    ];

    if (!authenticated) {
      return [
        ...commonItems,
        {
          label: 'All Properties',
          icon: <ViewListIcon />,
          action: 'properties'
        }
      ];
    }

    const userItems = [
      ...commonItems,
      {
        label: 'All Properties',
        icon: <ViewListIcon />,
        action: 'properties'
      },
      {
        label: 'Favourites',
        icon: <FavoriteIcon />,
        action: 'favourites'
      },
      {
        label: 'Notifications',
        icon: <NotificationsIcon />,
        action: 'notifications',
        badge: notificationCount > 0 ? notificationCount : null
      },
      { divider: true },
      {
        label: 'Profile',
        icon: <PersonIcon />,
        action: 'profile'
      },
      {
        label: 'Messages',
        icon: <MessageIcon />,
        action: 'messages'
      },
      {
        label: 'Transactions',
        icon: <AccountBalanceWalletIcon />,
        action: 'transactions'
      },
      { divider: true },
      {
        label: 'Logout',
        icon: <LogoutIcon />,
        action: 'logout'
      }
    ];

    const propertyOwnerItems = [
      ...commonItems,
      {
        label: 'My Properties',
        icon: <BusinessIcon />,
        action: 'properties'
      },
      {
        label: 'Add Property',
        icon: <AddHomeIcon />,
        action: 'add-property'
      },
      {
        label: 'Booking Requests',
        icon: <BookmarkIcon />,
        action: 'bookings'
      },
      {
        label: 'Notifications',
        icon: <NotificationsIcon />,
        action: 'notifications',
        badge: notificationCount > 0 ? notificationCount : null
      },
      { divider: true },
      {
        label: 'Profile',
        icon: <PersonIcon />,
        action: 'profile'
      },
      {
        label: 'Messages',
        icon: <MessageIcon />,
        action: 'messages'
      },
      {
        label: 'Transactions',
        icon: <AccountBalanceWalletIcon />,
        action: 'transactions'
      },
      { divider: true },
      {
        label: 'Logout',
        icon: <LogoutIcon />,
        action: 'logout'
      }
    ];

    const adminItems = [
      ...commonItems,
      {
        label: 'Admin Dashboard',
        icon: <AdminPanelSettingsIcon />,
        action: 'home'
      },
      {
        label: 'Review New Listings',
        icon: <PendingActionsIcon />,
        action: 'admin-new-listings'
      },
      {
        label: 'All Properties',
        icon: <ViewListIcon />,
        action: 'admin-all-properties'
      },
      {
        label: 'Notifications',
        icon: <NotificationsIcon />,
        action: 'notifications',
        badge: notificationCount > 0 ? notificationCount : null
      },
      { divider: true },
      {
        label: 'Profile',
        icon: <PersonIcon />,
        action: 'profile'
      },
      {
        label: 'Messages',
        icon: <MessageIcon />,
        action: 'messages'
      },
      {
        label: 'Transactions',
        icon: <AccountBalanceWalletIcon />,
        action: 'transactions'
      },
      { divider: true },
      {
        label: 'Logout',
        icon: <LogoutIcon />,
        action: 'logout'
      }
    ];

    switch (roleValue) {
      case 'user':
        return userItems;
      case 'propertyowner':
        return propertyOwnerItems;
      case 'admin':
        return adminItems;
      default:
        return commonItems;
    }
  };

  const menuItems = getMenuItems();

  return (
    <Box ref={menuRef}>
      <IconButton
        edge="start"
        color="inherit"
        aria-label="menu"
        onClick={handleMenuOpen}
        sx={{ mr: 2 }}
      >
        <MenuIcon />
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 220,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1
            }
          }
        }}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      >
        {authenticated && (
          <>
            <Box sx={{ px: 2, py: 1, backgroundColor: 'grey.100' }}>
              <Typography variant="caption" color="text.secondary">
                Logged in as: {roleValue || 'Unknown'}
              </Typography>
            </Box>
            <Divider />
          </>
        )}
        
        {menuItems.map((item, index) => {
          if (item.divider) {
            return <Divider key={index} />;
          }

          if (item.onClick) {
            return (
              <MenuItem key={index} onClick={() => {
                handleMenuClose();
                item.action();
              }}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </MenuItem>
            );
          }

          return (
            <MenuItem key={index} onClick={() => handleMenuItemClick(item.action)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
              {item.badge && (
                <Badge badgeContent={item.badge} color="error" sx={{ ml: 1 }} />
              )}
            </MenuItem>
          );
        })}
      </Menu>
    </Box>
  );
};

export default HamburgerMenuDropdown;