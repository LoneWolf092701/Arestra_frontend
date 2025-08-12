import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  IconButton,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  MarkEmailRead as MarkReadIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Home as PropertyIcon,
  BookOnline as BookingIcon,
  Star as RatingIcon,
  Report as ReportIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import AppSnackbar from '../../components/common/AppSnackbar';

const UserNotifications = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  // State management
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Mock notifications data - replace with actual API call
  const mockNotifications = [
    {
      id: 1,
      type: 'booking_confirmed',
      title: 'Booking Confirmed',
      message: 'Your booking for Studio Apartment in Colombo has been confirmed.',
      read: false,
      created_at: new Date().toISOString(),
      property_id: 1,
      booking_id: 1
    },
    {
      id: 2,
      type: 'property_update',
      title: 'Property Update',
      message: 'New photos have been added to your favorite property.',
      read: true,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      property_id: 2
    },
    {
      id: 3,
      type: 'rating_request',
      title: 'Rate Your Stay',
      message: 'How was your recent stay? Please rate the property.',
      read: false,
      created_at: new Date(Date.now() - 172800000).toISOString(),
      property_id: 3
    }
  ];

  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        // Replace with actual API call
        // const response = await getUserNotifications();
        // setNotifications(response.data);
        
        // Using mock data for now
        setTimeout(() => {
          setNotifications(mockNotifications);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error loading notifications:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load notifications',
          severity: 'error'
        });
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking_confirmed':
      case 'booking_update':
        return <BookingIcon color="primary" />;
      case 'property_update':
        return <PropertyIcon color="info" />;
      case 'rating_request':
        return <RatingIcon color="warning" />;
      case 'report_update':
        return <ReportIcon color="error" />;
      default:
        return <InfoIcon color="action" />;
    }
  };

  // Get notification color based on type
  const getNotificationColor = (type) => {
    switch (type) {
      case 'booking_confirmed':
        return 'success';
      case 'booking_update':
        return 'primary';
      case 'property_update':
        return 'info';
      case 'rating_request':
        return 'warning';
      case 'report_update':
        return 'error';
      default:
        return 'default';
    }
  };

  // Format relative time
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return date.toLocaleDateString();
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setDetailDialogOpen(true);
    
    // Mark as read if not already read
    if (!notification.read) {
      toggleReadStatus(notification.id, true);
    }
  };

  // Handle menu click
  const handleMenuClick = (event, notification) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedNotification(notification);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Toggle read status
  const toggleReadStatus = async (notificationId, markAsRead = true) => {
    try {
      // Replace with actual API call
      // await updateNotificationReadStatus(notificationId, markAsRead);
      
      setNotifications(prev => prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: markAsRead }
          : notification
      ));
      
      setSnackbar({
        open: true,
        message: markAsRead ? 'Marked as read' : 'Marked as unread',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating notification status:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update notification',
        severity: 'error'
      });
    }
  };

  // Delete notification
  const handleDeleteNotification = async (notificationId) => {
    try {
      // Replace with actual API call
      // await deleteNotification(notificationId);
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setSnackbar({
        open: true,
        message: 'Notification deleted',
        severity: 'success'
      });
      handleMenuClose();
    } catch (error) {
      console.error('Error deleting notification:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete notification',
        severity: 'error'
      });
    }
  };

  // Handle action button click
  const handleActionClick = () => {
    if (!selectedNotification) return;
    
    if (selectedNotification.booking_id) {
      navigate(`/bookings/${selectedNotification.booking_id}`);
    } else if (selectedNotification.property_id) {
      navigate(`/user-property-view/${selectedNotification.property_id}`);
    }
    
    setDetailDialogOpen(false);
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      // Replace with actual API call
      // await markAllNotificationsAsRead();
      
      setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
      setSnackbar({
        open: true,
        message: 'All notifications marked as read',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      setSnackbar({
        open: true,
        message: 'Failed to mark all as read',
        severity: 'error'
      });
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon sx={{ fontSize: 32, color: theme.primary }} />
          </Badge>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Notifications
          </Typography>
        </Box>
        
        {unreadCount > 0 && (
          <Button
            variant="outlined"
            onClick={markAllAsRead}
            sx={{ borderColor: theme.primary, color: theme.primary }}
          >
            Mark All as Read
          </Button>
        )}
      </Box>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <NotificationsIcon sx={{ fontSize: 64, color: theme.textSecondary, mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No notifications yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You'll see notifications about your bookings, properties, and account here.
          </Typography>
        </Card>
      ) : (
        <List sx={{ p: 0 }}>
          {notifications.map((notification, index) => (
            <Box key={notification.id}>
              <Card 
                sx={{ 
                  mb: 2, 
                  borderRadius: 2,
                  border: notification.read ? 'none' : `2px solid ${theme.primary}`,
                  backgroundColor: notification.read ? theme.surfaceBackground : theme.paperBackground,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows.medium
                  }
                }}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    {/* Notification Icon */}
                    <Box sx={{ mt: 0.5 }}>
                      {getNotificationIcon(notification.type)}
                    </Box>
                    
                    {/* Notification Content */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: notification.read ? 500 : 700,
                            color: notification.read ? theme.textSecondary : theme.textPrimary
                          }}
                        >
                          {notification.title}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={getNotificationColor(notification.type)}
                            size="small"
                            color={getNotificationColor(notification.type)}
                            variant="outlined"
                          />
                          
                          {!notification.read && (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: theme.primary
                              }}
                            />
                          )}
                          
                          <Tooltip title="More options">
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuClick(e, notification)}
                              sx={{ color: theme.textSecondary }}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                      
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: theme.textSecondary,
                          mb: 1,
                          lineHeight: 1.5
                        }}
                      >
                        {notification.message}
                      </Typography>
                      
                      <Typography variant="caption" sx={{ color: theme.textSecondary }}>
                        {formatRelativeTime(notification.created_at)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </List>
      )}

      {/* Notification Detail Dialog */}
      <Dialog 
        open={detailDialogOpen} 
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedNotification && (
          <React.Fragment>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {getNotificationIcon(selectedNotification.type)}
                {selectedNotification.title}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedNotification.message}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Received {formatRelativeTime(selectedNotification.created_at)}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailDialogOpen(false)}>
                Close
              </Button>
              {(selectedNotification.booking_id || selectedNotification.property_id) && (
                <Button 
                  onClick={handleActionClick}
                  variant="contained"
                  sx={{ backgroundColor: theme.primary }}
                >
                  {selectedNotification.booking_id ? 'View Booking' : 
                   selectedNotification.property_id ? 'View Property' : 
                   'Update Profile'}
                </Button>
              )}
            </DialogActions>
          </React.Fragment>
        )}
      </Dialog>

      {/* Context Menu - FIXED Fragment Issue */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedNotification && selectedNotification.read && (
          <MenuItem 
            onClick={() => {
              toggleReadStatus(selectedNotification.id, false);
              handleMenuClose();
            }}
          >
            <MarkReadIcon sx={{ mr: 1 }} />
            Mark as Unread
          </MenuItem>
        )}
        {selectedNotification && !selectedNotification.read && (
          <MenuItem 
            onClick={() => {
              toggleReadStatus(selectedNotification.id, true);
              handleMenuClose();
            }}
          >
            <MarkReadIcon sx={{ mr: 1 }} />
            Mark as Read
          </MenuItem>
        )}
        <MenuItem 
          onClick={() => {
            handleDeleteNotification(selectedNotification?.id);
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      />
    </Container>
  );
};

export default UserNotifications;