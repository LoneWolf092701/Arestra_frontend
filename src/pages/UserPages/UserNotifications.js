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
import SystemUpdateIcon from '@mui/icons-material/SystemUpdate';
import StarIcon from '@mui/icons-material/Star';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const UserNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const mockNotifications = [
        {
          id: 1,
          type: 'booking_status',
          title: 'Booking Request Updated',
          message: 'Your booking request for Luxury Apartment in Colombo has been approved!',
          created_at: new Date(Date.now() - 1000 * 60 * 30),
          read: false,
          property_name: 'Luxury Apartment in Colombo',
          booking_id: 123,
          property_id: 1
        },
        {
          id: 2,
          type: 'property_update',
          title: 'New Property Available',
          message: 'A new property matching your preferences has been listed in your favorite area.',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2),
          read: true,
          property_name: 'Modern Studio in Kandy',
          property_id: 2
        },
        {
          id: 3,
          type: 'system',
          title: 'Profile Update Required',
          message: 'Please update your profile information to improve your booking success rate.',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24),
          read: false
        },
        {
          id: 4,
          type: 'booking_reminder',
          title: 'Booking Reminder',
          message: 'Your booking check-in is tomorrow. Please contact the property owner for details.',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 6),
          read: false,
          property_name: 'Cozy Room in Galle',
          booking_id: 124,
          property_id: 3
        },
        {
          id: 5,
          type: 'favorite_update',
          title: 'Favorite Property Updated',
          message: 'A property in your favorites list has updated its price and availability.',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 12),
          read: true,
          property_name: 'Sea View Apartment',
          property_id: 4
        }
      ];
      
      setNotifications(mockNotifications);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError('Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleReadStatus = async (notificationId, currentReadStatus) => {
    try {
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: !currentReadStatus }
            : notification
        )
      );
    } catch (err) {
      console.error('Error updating notification status:', err);
      setError('Failed to update notification status.');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      setNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      );
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError('Failed to delete notification.');
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (err) {
      console.error('Error marking all as read:', err);
      setError('Failed to mark all notifications as read.');
    }
  };

  const openNotificationDialog = (notification) => {
    setSelectedNotification(notification);
    setDialogOpen(true);
    
    if (!notification.read) {
      toggleReadStatus(notification.id, false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking_status':
      case 'booking_reminder':
        return <BookingIcon color="primary" />;
      case 'property_update':
        return <HomeIcon color="info" />;
      case 'favorite_update':
        return <FavoriteIcon color="secondary" />;
      case 'system':
        return <SystemUpdateIcon color="warning" />;
      case 'rating':
        return <StarIcon color="success" />;
      default:
        return <MessageIcon color="action" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'booking_status':
      case 'booking_reminder':
        return 'primary';
      case 'property_update':
        return 'info';
      case 'favorite_update':
        return 'secondary';
      case 'system':
        return 'warning';
      case 'rating':
        return 'success';
      default:
        return 'default';
    }
  };

  const handleNotificationAction = (notification) => {
    setDialogOpen(false);
    
    if (notification.booking_id) {
      console.log('Navigate to booking details:', notification.booking_id);
    } else if (notification.property_id) {
      navigate(`/user-property-view/${notification.property_id}`);
    } else if (notification.type === 'system') {
      navigate('/profile');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading notifications...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
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

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

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
                  secondaryAction={
                    <Box sx={{ display: 'flex', gap: 1 }}>
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
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
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
                            flex: 1
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
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {notification.message}
                        </Typography>
                        
                        {notification.property_name && (
                          <Typography variant="caption" color="primary.main">
                            {notification.property_name}
                          </Typography>
                        )}
                        
                        <Typography variant="caption" display="block" color="text.secondary">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

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
              
              {(selectedNotification.property_id || selectedNotification.booking_id || selectedNotification.type === 'system') && (
                <Button 
                  variant="contained" 
                  onClick={() => handleNotificationAction(selectedNotification)}
                >
                  {selectedNotification.booking_id ? 'View Booking' : 
                   selectedNotification.property_id ? 'View Property' : 
                   'Update Profile'}
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