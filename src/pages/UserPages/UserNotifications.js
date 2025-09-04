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
  Tooltip,
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
import { Payment, LocationOn } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import AppSnackbar from '../../components/common/AppSnackbar';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadNotificationCount
} from '../../api/notificationApi';

const UserNotifications = () => {
  const navigate = useNavigate();
  const { theme, isDark } = useTheme();
  
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

  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        const response = await getNotifications({ page: 1, limit: 50 });
        setNotifications(response.notifications || []);
        setLoading(false);
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
      case 'booking_request':
      case 'booking_response':
        return <BookingIcon color="primary" />;
      case 'property_approval':
        return <PropertyIcon color="success" />;
      case 'property_rejection':
        return <PropertyIcon color="error" />;
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
      case 'booking_response':
        return 'success';
      case 'booking_request':
        return 'primary';
      case 'property_approval':
        return 'success';
      case 'property_rejection':
        return 'error';
      case 'rating_request':
        return 'warning';
      case 'report_update':
        return 'error';
      case 'system':
        return 'info';
      default:
        return 'default';
    }
  };

  // Format notification date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  // Mark notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read_at: new Date().toISOString() }
            : notification
        )
      );
      setSnackbar({
        open: true,
        message: 'Notification marked as read',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error marking as read:', error);
      setSnackbar({
        open: true,
        message: 'Failed to mark as read',
        severity: 'error'
      });
    }
  };

  // Delete notification
  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setSnackbar({
        open: true,
        message: 'Notification deleted',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete notification',
        severity: 'error'
      });
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
  if (notification.type === 'booking_approved_payment') {
    handlePaymentNotificationClick(notification);
    return;
  }
  
  // Existing click handling...
  if (!notification.read_at) {
    handleMarkAsRead(notification.id);
  }

  if (notification.booking_id) {
    navigate(`/payment/${notification.booking_id}`);
  } else if (notification.property_id) {
    navigate(`/user-property-view/${notification.property_id}`);
  }
};

const getNotificationData = (notification) => {
  try {
    return typeof notification.data === 'string' 
      ? JSON.parse(notification.data) 
      : notification.data || {};
  } catch {
    return {};
  }
};

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      
      setNotifications(prev => prev.map(notification => ({ 
        ...notification, 
        read_at: notification.read_at || new Date().toISOString() 
      })));
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

  const handlePaymentNotificationClick = (notification) => {
  if (notification.type === 'booking_approved_payment') {
    // Navigate to payment page
    navigate(`/payment/${notification.booking_id}`);
  }
  
  // Mark as read if not already read
  if (!notification.read_at) {
    handleMarkAsRead(notification.id);
  }
};

  // Menu handlers
  const handleMenuOpen = (event, notification) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedNotification(notification);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNotification(null);
  };

  const handleViewDetails = () => {
    setDetailDialogOpen(true);
    handleMenuClose();
  };

  const unreadCount = notifications.filter(n => !n.read_at).length;

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ 
        py: 4, 
        display: 'flex', 
        justifyContent: 'center',
        backgroundColor: theme.background,
        minHeight: '50vh'
      }}>
        <CircularProgress sx={{ color: theme.primary }} />
      </Container>
    );
  }

  return (
    <Box sx={{ 
      backgroundColor: theme.background, 
      minHeight: '100vh',
      color: theme.textPrimary 
    }}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4,
          p: 3,
          backgroundColor: theme.paperBackground,
          borderRadius: 2,
          boxShadow: theme.shadows.light,
          border: `1px solid ${theme.border}`
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon sx={{ 
                fontSize: 32, 
                color: theme.primary 
              }} />
            </Badge>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                fontWeight: 700,
                color: theme.textPrimary
              }}
            >
              Notifications
            </Typography>
          </Box>
          
          {unreadCount > 0 && (
            <Button
              variant="outlined"
              onClick={markAllAsRead}
              sx={{ 
                borderColor: theme.primary, 
                color: theme.primary,
                '&:hover': {
                  backgroundColor: theme.hover,
                  borderColor: theme.primary
                }
              }}
            >
              Mark All as Read
            </Button>
          )}
        </Box>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <Card sx={{ 
            p: 4, 
            textAlign: 'center', 
            borderRadius: 3,
            backgroundColor: theme.paperBackground,
            border: `1px solid ${theme.border}`,
            boxShadow: theme.shadows.light
          }}>
            <NotificationsIcon sx={{ 
              fontSize: 64, 
              color: theme.textSecondary, 
              mb: 2 
            }} />
            <Typography 
              variant="h6" 
              sx={{ color: theme.textSecondary }} 
              gutterBottom
            >
              No notifications yet
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ color: theme.textSecondary }}
            >
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
                    border: notification.read_at ? 
                      `1px solid ${theme.border}` : 
                      `2px solid ${theme.primary}`,
                    backgroundColor: notification.read_at ? 
                      theme.paperBackground : 
                      isDark ? 
                        `${theme.primary}10` : 
                        `${theme.primary}05`,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: theme.shadows.light,
                    '&:hover': {
                      backgroundColor: isDark ? 
                        theme.hover : 
                        theme.selected,
                      transform: 'translateY(-1px)',
                      boxShadow: theme.shadows.medium
                    }
                  }}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start' 
                    }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: 2, 
                        flex: 1 
                      }}>
                        <Box sx={{ mt: 0.5 }}>
                          {getNotificationIcon(notification.type)}
                        </Box>
                        
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1, 
                            mb: 1 
                          }}>
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                fontWeight: notification.read_at ? 500 : 700,
                                color: theme.textPrimary,
                                fontSize: '1.1rem'
                              }}
                            >
                              {notification.title}
                            </Typography>
                            <Chip 
                              label={notification.type.replace('_', ' ')} 
                              size="small" 
                              color={getNotificationColor(notification.type)}
                              sx={{
                                textTransform: 'capitalize',
                                fontSize: '0.75rem'
                              }}
                            />
                          </Box>
                          
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: theme.textSecondary,
                              mb: 2,
                              lineHeight: 1.5
                            }}
                          >
                            {notification.message}
                          </Typography>
                          
                          {/* Additional notification data */}
                          {notification.data && (
                            <Box sx={{ 
                              backgroundColor: isDark ? 
                                theme.surfaceBackground : 
                                theme.background,
                              p: 2, 
                              borderRadius: 1,
                              border: `1px solid ${theme.divider}`,
                              mt: 1
                            }}>
                              {notification.data.tenant_name && (
                                <Typography 
                                  variant="body2" 
                                  sx={{ color: theme.textSecondary }}
                                >
                                  <strong>From:</strong> {notification.data.tenant_name}
                                </Typography>
                              )}
                              {notification.data.property_address && (
                                <Typography 
                                  variant="body2" 
                                  sx={{ color: theme.textSecondary }}
                                >
                                  <strong>Property:</strong> {notification.data.property_address}
                                </Typography>
                              )}
                              {notification.data.check_in_date && (
                                <Typography 
                                  variant="body2" 
                                  sx={{ color: theme.textSecondary }}
                                >
                                  <strong>Dates:</strong> {notification.data.check_in_date} to {notification.data.check_out_date}
                                </Typography>
                              )}
                              {notification.data.total_price && (
                                <Typography 
                                  variant="body2" 
                                  sx={{ color: theme.textSecondary }}
                                >
                                  <strong>Amount:</strong> LKR {notification.data.total_price.toLocaleString()}
                                </Typography>
                              )}
                            </Box>
                          )}
                          
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            mt: 2 
                          }}>
                            <Typography 
                              variant="caption" 
                              sx={{ color: theme.textDisabled }}
                            >
                              {formatDate(notification.created_at)}
                            </Typography>
                            
                            {!notification.read_at && (
                              <Chip 
                                label="New" 
                                size="small" 
                                color="primary"
                                sx={{ 
                                  fontSize: '0.7rem',
                                  height: 20
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                      </Box>
                      
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, notification)}
                        sx={{ 
                          color: theme.textSecondary,
                          '&:hover': {
                            backgroundColor: theme.hover
                          }
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
                
                {index < notifications.length - 1 && (
                  <Divider sx={{ 
                    backgroundColor: theme.divider,
                    my: 1
                  }} />
                )}
              </Box>
            ))}
          </List>
        )}

        {/* Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              backgroundColor: theme.paperBackground,
              border: `1px solid ${theme.border}`,
              boxShadow: theme.shadows.medium
            }
          }}
        >
          {selectedNotification && !selectedNotification.read_at && (
            <MenuItem 
              onClick={() => {
                handleMarkAsRead(selectedNotification.id);
                handleMenuClose();
              }}
              sx={{
                color: theme.textPrimary,
                '&:hover': {
                  backgroundColor: theme.hover
                }
              }}
            >
              <ListItemIcon>
                <MarkReadIcon sx={{ color: theme.textSecondary }} />
              </ListItemIcon>
              <ListItemText>Mark as Read</ListItemText>
            </MenuItem>
          )}
          
          <MenuItem 
            onClick={handleViewDetails}
            sx={{
              color: theme.textPrimary,
              '&:hover': {
                backgroundColor: theme.hover
              }
            }}
          >
            <ListItemIcon>
              <InfoIcon sx={{ color: theme.textSecondary }} />
            </ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem>
          
          <MenuItem 
            onClick={() => {
              handleDelete(selectedNotification.id);
              handleMenuClose();
            }}
            sx={{
              color: theme.error,
              '&:hover': {
                backgroundColor: `${theme.error}10`
              }
            }}
          >
            <ListItemIcon>
              <DeleteIcon sx={{ color: theme.error }} />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>

        {/* Detail Dialog */}
        <Dialog
          open={detailDialogOpen}
          onClose={() => setDetailDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: theme.paperBackground,
              color: theme.textPrimary,
              border: `1px solid ${theme.border}`
            }
          }}
        >
          {selectedNotification && (
            <>
              <DialogTitle sx={{ 
                color: theme.textPrimary,
                borderBottom: `1px solid ${theme.divider}`
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {getNotificationIcon(selectedNotification.type)}
                  {selectedNotification.title}
                </Box>
              </DialogTitle>
              
              <DialogContent sx={{ p: 3 }}>
  <Box sx={{ mb: 3 }}>
    <Typography 
      variant="h6" 
      sx={{ 
        color: theme.textPrimary,
        mb: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}
    >
      {getNotificationIcon(selectedNotification.type)}
      {selectedNotification.title}
    </Typography>
    
    <Chip 
      label={selectedNotification.type.replace('_', ' ')}
      size="small"
      color={getNotificationColor(selectedNotification.type)}
      sx={{ textTransform: 'capitalize', mb: 2 }}
    />
    
    <Typography 
      variant="body1" 
      sx={{ 
        color: theme.textSecondary,
        lineHeight: 1.6,
        mb: 3
      }}
    >
      {selectedNotification.message}
    </Typography>

    {/* Account Details Card for Payment Notifications */}
    {(selectedNotification.type === 'booking_approved_payment' || 
      (selectedNotification.type === 'booking_response' && selectedNotification.data)) && (
      <Card sx={{ 
        mb: 3, 
        backgroundColor: theme.surfaceBackground,
        border: `1px solid ${theme.border}`,
        borderLeft: `4px solid ${theme.success}`
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Payment sx={{ color: theme.success }} />
            <Typography 
              variant="h6" 
              sx={{ 
                color: theme.textPrimary,
                fontWeight: 600
              }}
            >
              Payment Details
            </Typography>
          </Box>
          
          {(() => {
            const notificationData = getNotificationData(selectedNotification);
            const accountInfo = notificationData.account_info || selectedNotification.payment_account_info;
            
            return (
              <>
                {/* Payment Amount */}
                {notificationData.amount && (
                  <Box sx={{ mb: 2, p: 2, backgroundColor: theme.cardBackground, borderRadius: 1 }}>
                    <Typography variant="subtitle2" sx={{ color: theme.textSecondary }}>
                      Amount to Pay:
                    </Typography>
                    <Typography variant="h6" sx={{ color: theme.success, fontWeight: 600 }}>
                      LKR {notificationData.amount.toLocaleString()}
                    </Typography>
                  </Box>
                )}

                {/* Account Information */}
                {accountInfo && (
                  <Box sx={{ mb: 2 }}>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        color: theme.textPrimary, 
                        fontWeight: 600,
                        mb: 1
                      }}
                    >
                      Owner's Payment Information:
                    </Typography>
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: theme.inputBackground,
                      borderRadius: 1,
                      border: `1px solid ${theme.border}`,
                      fontFamily: 'monospace'
                    }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: theme.textPrimary,
                          whiteSpace: 'pre-line',
                          lineHeight: 1.4
                        }}
                      >
                        {accountInfo}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Property Address */}
                {notificationData.property_address && (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <LocationOn sx={{ color: theme.textSecondary, fontSize: 20, mt: 0.2 }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: theme.textSecondary }}>
                        Property:
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.textPrimary }}>
                        {notificationData.property_address}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Payment Instructions */}
                <Alert 
                  severity="info" 
                  sx={{ 
                    mt: 2,
                    backgroundColor: `${theme.info}10`,
                    border: `1px solid ${theme.info}30`
                  }}
                >
                  <Typography variant="body2">
                    Please make the payment using the above details and upload your payment receipt 
                    through the booking page for verification.
                  </Typography>
                </Alert>
              </>
            );
          })()}
        </CardContent>
      </Card>
    )}

    {/* Booking Information Card */}
    {selectedNotification.booking_id && (
      <Card sx={{ 
        mb: 2, 
        backgroundColor: theme.cardBackground,
        border: `1px solid ${theme.border}`
      }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <BookingIcon sx={{ color: theme.primary, fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ color: theme.textPrimary, fontWeight: 600 }}>
              Booking ID: {selectedNotification.booking_id}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: theme.textSecondary }}>
            Click "View Booking" to see full details or make payment
          </Typography>
        </CardContent>
      </Card>
    )}
    
    <Typography 
      variant="caption" 
      sx={{ 
        color: theme.textDisabled,
        display: 'block'
      }}
    >
      Received: {formatDate(selectedNotification.created_at)}
    </Typography>
  </Box>
</DialogContent>
              
              <DialogActions sx={{ 
  borderTop: `1px solid ${theme.divider}`,
  p: 3,
  gap: 1
}}>
  <Button 
    onClick={() => setDetailDialogOpen(false)}
    sx={{ 
      color: theme.textSecondary,
      '&:hover': {
        backgroundColor: theme.hover
      }
    }}
  >
    Close
  </Button>
  
  {selectedNotification.booking_id && (
    <Button 
      variant="outlined"
      onClick={() => {
        navigate(`/user/bookings`);
        setDetailDialogOpen(false);
      }}
      sx={{
        borderColor: theme.primary,
        color: theme.primary,
        '&:hover': {
          backgroundColor: `${theme.primary}10`
        }
      }}
    >
      View Booking
    </Button>
  )}
  
  {selectedNotification.type === 'booking_approved_payment' && selectedNotification.booking_id && (
    <Button 
      variant="contained"
      onClick={() => {
        navigate(`/user/payment/${selectedNotification.booking_id}`);
        setDetailDialogOpen(false);
      }}
      sx={{
        backgroundColor: theme.success,
        '&:hover': {
          backgroundColor: `${theme.success}dd`
        }
      }}
    >
      Make Payment
    </Button>
  )}
</DialogActions>
            </>
          )}
        </Dialog>

        {/* Snackbar */}
        <AppSnackbar
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        />
      </Container>
    </Box>
  );
};

export default UserNotifications;