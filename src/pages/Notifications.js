import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  List, 
  ListItem, 
  ListItemText,
  ListItemIcon,
  Paper,
  Container,
  Alert,
  CircularProgress,
  Chip,
  Button,
  Badge
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsIcon from '@mui/icons-material/Notifications';
import BookingIcon from '@mui/icons-material/Book';
import HomeIcon from '@mui/icons-material/Home';
import ReportIcon from '@mui/icons-material/Report';
import MessageIcon from '@mui/icons-material/Message';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { getPropertyComplaints } from '../api/userInteractionApi';
import { formatDistanceToNow } from 'date-fns';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      
      const complaintsData = await getPropertyComplaints();
      
      const complaintNotifications = complaintsData.map(item => ({
        id: `complaint-${item.id}`,
        type: 'complaint',
        title: 'Property Complaint Received',
        message: `Complaint on ${item.property_type || 'Property'} - ${item.unit_type || 'Unit'}: ${item.complaint}`,
        property_type: item.property_type,
        unit_type: item.unit_type,
        complaint: item.complaint,
        created_at: item.created_at ? new Date(item.created_at) : new Date(),
        read: false
      }));

      const systemNotifications = [
        {
          id: 'system-1',
          type: 'system',
          title: 'Welcome to StayWise',
          message: 'Welcome to your property owner dashboard. Start by adding your first property listing.',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24),
          read: false
        }
      ];

      const allNotifications = [...complaintNotifications, ...systemNotifications];
      setNotifications(allNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const handleMarkAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'complaint':
        return <ReportIcon color="warning" />;
      case 'booking':
        return <BookingIcon color="primary" />;
      case 'property':
        return <HomeIcon color="info" />;
      case 'system':
        return <NotificationsIcon color="success" />;
      default:
        return <MessageIcon color="action" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'complaint':
        return 'warning';
      case 'booking':
        return 'primary';
      case 'property':
        return 'info';
      case 'system':
        return 'success';
      default:
        return 'default';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading notifications...
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 2 }}>
      <Box sx={{ mb: 4 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h4" component="h1">
            <Badge badgeContent={unreadCount} color="error" sx={{ mr: 2 }}>
              <NotificationsIcon sx={{ mr: 1 }} />
            </Badge>
            Property Owner Notifications
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
          Stay updated with property complaints, booking requests, and system notifications
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
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
            You'll see property complaints, booking requests, and system updates here
          </Typography>
        </Paper>
      ) : (
        <Paper sx={{ overflow: 'hidden' }}>
          <List disablePadding>
            {notifications.map(notification => (
              <ListItem
                key={notification.id}
                sx={{
                  backgroundColor: notification.read ? 'transparent' : 'action.hover',
                  borderLeft: notification.read ? 'none' : '4px solid',
                  borderLeftColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'action.selected'
                  }
                }}
                secondaryAction={
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {!notification.read && (
                      <Button
                        size="small"
                        onClick={() => handleMarkAsRead(notification.id)}
                        variant="outlined"
                      >
                        Mark Read
                      </Button>
                    )}
                    <IconButton 
                      edge="end" 
                      aria-label="delete" 
                      onClick={() => handleDelete(notification.id)}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemIcon>
                  {getNotificationIcon(notification.type)}
                </ListItemIcon>
                
                <ListItemText 
                  primary={
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
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
                        label={notification.type} 
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
                      
                      {notification.property_type && notification.unit_type && (
                        <Typography variant="caption" color="primary.main" display="block">
                          Property: {notification.property_type} - {notification.unit_type}
                        </Typography>
                      )}
                      
                      <Typography variant="caption" color="text.secondary">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Container>
  );
};

export default Notifications;