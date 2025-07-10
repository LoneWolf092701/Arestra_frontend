import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Badge,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import BookingIcon from '@mui/icons-material/Book';
import HomeIcon from '@mui/icons-material/Home';
import MessageIcon from '@mui/icons-material/Message';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import MarkAsUnreadIcon from '@mui/icons-material/MarkAsUnread';
import DraftsIcon from '@mui/icons-material/Drafts';
import { formatDistanceToNow } from 'date-fns';

// Notification API functions (mock implementation - replace with actual API calls)
const notificationApi = {
  getUserNotifications: async () => {
    // Mock data - replace with actual API call
    return [
      {
        id: 1,
        type: 'booking_status',
        title: 'Booking Request Updated',
        message: 'Your booking request for Luxury Apartment in Colombo has been approved!',
        created_at: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false,
        property_name: 'Luxury Apartment in Colombo',
        booking_id: 123
      },
      {
        id: 2,
        type: 'property_update',
        title: 'New Property Available',
        message: 'A new property matching your preferences has been listed.',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: true,
        property_name: 'Modern Studio in Kandy'
      },
      {
        id: 3,
        type: 'system',
        title: 'Profile Update Required',
        message: 'Please update your profile to improve your booking success rate.',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        read: false
      }
    ];
  },
  
  markAsRead: async (notificationId) => {
    // Mock implementation - replace with actual API call
    console.log(`Marking notification ${notificationId} as read`);
    return { success: true };
  },
  
  markAsUnread: async (notificationId) => {
    // Mock implementation - replace with actual API call
    console.log(`Marking notification ${notificationId} as unread`);
    return { success: true };
  },
  
  deleteNotification: async (notificationId) => {
    // Mock implementation - replace with actual API call
    console.log(`Deleting notification ${notificationId}`);
    return { success: true };
  },
  
  markAllAsRead: async () => {
    // Mock implementation - replace with actual API call
    console.log('Marking all notifications as read');
    return { success: true };
  }
};

const UserNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Load notifications on component mount
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationApi.getUserNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError('Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read/unread
  const toggleReadStatus = async (notificationId, currentReadStatus) => {
    try {
      if (currentReadStatus) {
        await notificationApi.markAsUnread(notificationId);
      } else {
        await notificationApi.markAsRead(notificationId);
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: !currentReadStatus }
            : notification
        )
      );
    } catch (err) {
      console.error('Error updating notification status:', err);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await notificationApi.deleteNotification(notificationId);
      
      // Remove from local state
      setNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      );
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  // Open notification details dialog
  const openNotificationDialog = (notification) => {
    setSelectedNotification(notification);
    setDialogOpen(true);
    
    // Mark as read when opened
    if (!notification.read) {
      toggleReadStatus(notification.id, false);
    }
  };

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking_status':
        return <BookingIcon color="primary" />;
      case 'property_update':
        return <HomeIcon color="secondary" />;
      case 'system':
        return <NotificationsIcon color="action" />;
      default:
        return <MessageIcon color="action" />;
    }
  };

  // Get color based on notification type
  const getNotificationColor = (type) => {
    switch (type) {
      case 'booking_status':
        return 'success';
      case 'property_update':
        return 'info';
      case 'system':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h4" component="h1">
            <Badge badgeContent={unreadCount} color="error" sx={{ mr: 2 }}>
              <NotificationsIcon sx={{ mr: 1 }} />
            </Badge>
            Notifications
          </Typography>
          
          {unreadCount > 0 && (
            <Button
              variant="outlined"
              startIcon={<CheckCircleIcon />}
              onClick={markAllAsRead}
            >
              Mark All Read
            </Button>
          )}
        </Box>
        
        <Typography variant="body1" color="text.secondary">
          Stay updated with your booking requests and property updates
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <NotificationsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No notifications yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You'll see updates about your bookings and new properties here
          </Typography>
        </Paper>
      ) : (
        <Paper sx={{ overflow: 'hidden' }}>
          <List disablePadding>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  sx={{
                    backgroundColor: notification.read ? 'transparent' : 'action.hover',
                    borderLeft: notification.read ? 'none' : '4px solid',
                    borderLeftColor: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'action.selected',
                      cursor: 'pointer'
                    }
                  }}
                  onClick={() => openNotificationDialog(notification)}
                >
                  <ListItemIcon>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            fontWeight: notification.read ? 'normal' : 'bold',
                            flexGrow: 1
                          }}
                        >
                          {notification.title}
                        </Typography>
                        <Chip
                          label={notification.type.replace('_', ' ')}
                          size="small"
                          color={getNotificationColor(notification.type)}
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </Typography>
                      </Box>
                    }
                  />
                  
                  {/* Action buttons */}
                  <Box display="flex" gap={1}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleReadStatus(notification.id, notification.read);
                      }}
                      title={notification.read ? 'Mark as unread' : 'Mark as read'}
                    >
                      {notification.read ? <MarkAsUnreadIcon /> : <DraftsIcon />}
                    </IconButton>
                    
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      title="Delete notification"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </ListItem>
                
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      {/* Notification Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedNotification && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={1}>
                {getNotificationIcon(selectedNotification.type)}
                {selectedNotification.title}
              </Box>
            </DialogTitle>
            
            <DialogContent>
              <Typography variant="body1" paragraph>
                {selectedNotification.message}
              </Typography>
              
              {selectedNotification.property_name && (
                <Typography variant="body2" color="text.secondary" paragraph>
                  <strong>Property:</strong> {selectedNotification.property_name}
                </Typography>
              )}
              
              {selectedNotification.booking_id && (
                <Typography variant="body2" color="text.secondary" paragraph>
                  <strong>Booking ID:</strong> {selectedNotification.booking_id}
                </Typography>
              )}
              
              <Typography variant="caption" color="text.secondary">
                Received {formatDistanceToNow(new Date(selectedNotification.created_at), { addSuffix: true })}
              </Typography>
            </DialogContent>
            
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>
                Close
              </Button>
              
              {selectedNotification.booking_id && (
                <Button 
                  variant="contained" 
                  onClick={() => {
                    // Navigate to booking details - implement based on your routing
                    console.log('Navigate to booking:', selectedNotification.booking_id);
                    setDialogOpen(false);
                  }}
                >
                  View Booking
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default UserNotifications;