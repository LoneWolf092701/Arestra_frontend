import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  IconButton,
  Badge,
  Alert,
  CircularProgress,
  List,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Divider
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  Home as HomeIcon,
  Bookmark as BookingIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  Report as ReportIcon,
  Message as MessageIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  takeNotificationAction,
  deleteNotification,
  getUnreadNotificationCount
} from '../api/notificationApi';
import { getBookingDetails } from '../api/bookingApi';
import { getPublicPropertyById } from '../api/propertyApi';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import PaymentIcon from '@mui/icons-material/Payment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Grid, } from '@mui/material';
import AppSnackbar from '../components/common/AppSnackbar';

const Notifications = () => {
  const navigate = useNavigate();
  const { theme, isDark } = useTheme();
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [actionDialog, setActionDialog] = useState({
    open: false,
    notificationId: null,
    action: null,
    booking: null
  });
  const [responseMessage, setResponseMessage] = useState('');
  
  const [bookingDetailsModal, setBookingDetailsModal] = useState({
  open: false,
  booking: null,
  property: null,
  loading: false
});

const [accountInfo, setAccountInfo] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });


  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await getNotifications({ page: 1, limit: 50 });
      setNotifications(response.notifications || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setError(error.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await getUnreadNotificationCount();
      setUnreadCount(response.unread_count || 0);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

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
      loadUnreadCount();
    } catch (error) {
      setError(error.message || 'Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => 
        prev.map(notification => ({ 
          ...notification, 
          read_at: notification.read_at || new Date().toISOString() 
        }))
      );
      setUnreadCount(0);
    } catch (error) {
      setError(error.message || 'Failed to mark all as read');
    }
  };

  const handleActionClick = (notification, action) => {
    setActionDialog({
      open: true,
      notificationId: notification.id,
      action: action,
      booking: notification.data
    });
    setResponseMessage('');
  };

  const handleActionConfirm = async () => {
  // Validate account info if accepting booking
  if (actionDialog.action === 'accepted' && !accountInfo.trim()) {
    setError('Bank account information is required to accept booking');
    return;
  }

  try {
    const { notificationId, action } = actionDialog;
    
    // Call the API with account info if accepting
    await takeNotificationAction(
      notificationId, 
      action, 
      responseMessage,
      action === 'accepted' ? accountInfo : undefined
    );
    
    setActionDialog({ open: false, notificationId: null, action: null, booking: null });
    setResponseMessage('');
    setAccountInfo('');
    
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, action_taken: action, read_at: new Date().toISOString() }
          : notification
      )
    );
    
    loadUnreadCount();
    
    // Show success message
    setError('');
    setSnackbar({
        open: true,
        message: action === 'accepted' 
      ? 'Booking accepted successfully! Account details sent to tenant.' 
      : 'Booking rejected successfully.',
        severity: 'success'
      });
    
  } catch (error) {
    setError(error.message || 'Failed to process action');
    setSnackbar({
        open: true,
        message: error.message || 'Failed to process action',
        severity: 'error'
      });
  }
};
  
  const handleViewBookingDetails = async (notification) => {
  if (!notification.booking_id) return;
  
  setBookingDetailsModal(prev => ({ ...prev, open: true, loading: true }));
  
  try {
    const [bookingDetails, propertyDetails] = await Promise.all([
      getBookingDetails(notification.booking_id),
      notification.property_id ? getPublicPropertyById(notification.property_id) : null
    ]);
    
    setBookingDetailsModal({
      open: true,
      booking: bookingDetails,
      property: propertyDetails,
      loading: false
    });
  } catch (error) {
    console.error('Error fetching booking details:', error);
    setBookingDetailsModal(prev => ({ ...prev, loading: false }));
    setError('Failed to load booking details');
  }
};

  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      loadUnreadCount();
    } catch (error) {
      setError(error.message || 'Failed to delete notification');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking_request':
      case 'booking_response':
        return <BookingIcon color="primary" />;
      case 'property_approval':
      case 'property_rejection':
        return <HomeIcon color="info" />;
      case 'complaint':
        return <ReportIcon color="warning" />;
      case 'system':
        return <NotificationsIcon color="success" />;
      default:
        return <MessageIcon color="action" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'booking_request':
        return 'primary';
      case 'booking_response':
        return 'success';
      case 'property_approval':
        return 'success';
      case 'property_rejection':
        return 'error';
      case 'complaint':
        return 'warning';
      case 'system':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Box sx={{ 
        backgroundColor: theme.background, 
        minHeight: '100vh',
        color: theme.textPrimary
      }}>
        <Container sx={{ 
          mt: 4, 
          textAlign: 'center',
          py: 8
        }}>
          <CircularProgress 
            size={60} 
            sx={{ color: theme.primary }}
          />
          <Typography 
            variant="h6" 
            sx={{ 
              mt: 2,
              color: theme.textPrimary
            }}
          >
            Loading notifications...
          </Typography>
        </Container>
      </Box>
    );
  }

  return (
    <>
    <Box sx={{ 
      backgroundColor: theme.background, 
      minHeight: '100vh',
      color: theme.textPrimary
    }}>
      <Container sx={{ 
        maxWidth: 800, 
        mx: 'auto', 
        mt: 4, 
        p: 2 
      }}>
        {/* Header Section */}
        <Box sx={{ 
          mb: 4,
          p: 3,
          backgroundColor: theme.paperBackground,
          borderRadius: 2,
          boxShadow: theme.shadows.light,
          border: `1px solid ${theme.border}`
        }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography 
              variant="h4" 
              component="h1"
              sx={{ 
                color: theme.textPrimary,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon sx={{ 
                  fontSize: 32,
                  color: theme.primary 
                }} />
              </Badge>
              Property Owner Notifications
            </Typography>
            
            {unreadCount > 0 && (
              <Button
                variant="outlined"
                startIcon={<CheckCircleIcon />}
                onClick={handleMarkAllAsRead}
                sx={{
                  borderColor: theme.primary,
                  color: theme.primary,
                  '&:hover': {
                    backgroundColor: theme.hover,
                    borderColor: theme.primary
                  }
                }}
              >
                Mark All Read
              </Button>
            )}
          </Box>
          
          <Typography 
            variant="body1" 
            sx={{ color: theme.textSecondary }}
          >
            Stay updated with booking requests, property approvals, and system notifications
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              backgroundColor: isDark ? `${theme.error}20` : undefined,
              color: theme.textPrimary,
              border: `1px solid ${theme.error}`,
              '& .MuiAlert-icon': {
                color: theme.error
              }
            }} 
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <Card sx={{ 
            p: 4, 
            textAlign: 'center',
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
              You'll see booking requests, property updates, and system notifications here
            </Typography>
          </Card>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                sx={{
                  mb: 2,
                  border: notification.read_at ? 
                    `1px solid ${theme.border}` : 
                    `2px solid ${theme.primary}`,
                  backgroundColor: notification.read_at ? 
                    theme.paperBackground : 
                    isDark ? 
                      `${theme.primary}15` : 
                      `${theme.primary}08`,
                  borderRadius: 2,
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
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                    <Box display="flex" alignItems="flex-start" flex={1}>
                      <Box sx={{ mr: 2, mt: 0.5 }}>
                        {getNotificationIcon(notification.type)}
                      </Box>
                      
                      <Box flex={1}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <Typography 
                            variant="h6" 
                            component="h3" 
                            sx={{ 
                              mr: 1,
                              color: theme.textPrimary,
                              fontWeight: notification.read_at ? 500 : 700
                            }}
                          >
                            {notification.title}
                          </Typography>
                          <Chip
                            label={notification.type.replace('_', ' ')}
                            color={getNotificationColor(notification.type)}
                            size="small"
                            sx={{
                              textTransform: 'capitalize',
                              fontSize: '0.75rem'
                            }}
                          />
                        </Box>
                        
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            color: theme.textPrimary,
                            mb: 2,
                            lineHeight: 1.5
                          }}
                        >
                          {notification.message}
                        </Typography>
                        
                        {/* Notification Data Display */}
                        {notification.data && (
                          <Box sx={{
                            mb: 2,
                            p: 2,
                            backgroundColor: isDark ? 
                              theme.surfaceBackground : 
                              theme.background,
                            borderRadius: 1,
                            border: `1px solid ${theme.divider}`
                          }}>
                            {notification.data.tenant_name && (
                              <Typography 
                                variant="body2" 
                                sx={{ color: theme.textSecondary }}
                              >
                                <strong>From:</strong> {notification.data.tenant_name} ({notification.data.tenant_email})
                              </Typography>
                            )}
                            {notification.data.tenant_phone && (
                              <Typography 
                                variant="body2" 
                                sx={{ color: theme.textSecondary }}
                              >
                                <strong>Phone:</strong> {notification.data.tenant_phone}
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
                                <strong>Total:</strong> LKR {notification.data.total_price.toLocaleString()}
                              </Typography>
                            )}
                            {notification.data.advance_amount && (
                              <Typography 
                                variant="body2" 
                                sx={{ color: theme.textSecondary }}
                              >
                                <strong>Advance:</strong> LKR {notification.data.advance_amount.toLocaleString()}
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
                            {notification.data.rejection_reason && (
                              <Typography 
                                variant="body2" 
                                sx={{ color: theme.error }}
                              >
                                <strong>Reason:</strong> {notification.data.rejection_reason}
                              </Typography>
                            )}
                          </Box>
                        )}
                        
                        {/* Action Buttons for Booking Requests */}
                        {notification.type === 'booking_request' && notification.action_taken === 'pending' && (
                          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <Button
    size="small"
    startIcon={<VisibilityIcon />}
    onClick={() => handleViewBookingDetails(notification)}
    sx={{ 
      color: theme.textSecondary,
      '&:hover': { color: theme.primary }
    }}
  >
    View Details
  </Button>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              startIcon={<CheckCircleIcon />}
                              onClick={() => handleActionClick(notification, 'accepted')}
                              sx={{
                                backgroundColor: theme.success,
                                '&:hover': {
                                  backgroundColor: `${theme.success}dd`
                                }
                              }}
                            >
                              Accept
                            </Button>
                            <Button
                              variant="contained"
                              color="error"
                              size="small"
                              startIcon={<CancelIcon />}
                              onClick={() => handleActionClick(notification, 'rejected')}
                              sx={{
                                backgroundColor: theme.error,
                                '&:hover': {
                                  backgroundColor: `${theme.error}dd`
                                }
                              }}
                            >
                              Reject
                            </Button>
                          </Box>
                        )}

                        {notification.type === 'booking_request' && notification.action_taken === 'accepted' && (

                        <Button
    size="small"
    startIcon={<VisibilityIcon />}
    onClick={() => handleViewBookingDetails(notification)}
    sx={{ 
      color: theme.textSecondary,
      '&:hover': { color: theme.primary }
    }}
  >
    View Details
  </Button>
                        )}
                        
                        {/* Status Chips */}
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
                          
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
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
                            {notification.action_taken && notification.action_taken !== 'pending' && (
                              <Chip 
                                label={notification.action_taken} 
                                size="small" 
                                color={notification.action_taken === 'accepted' ? 'success' : 'error'}
                                sx={{ 
                                  fontSize: '0.7rem',
                                  height: 20,
                                  textTransform: 'capitalize'
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                    
                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 2 }}>
                      {!notification.read_at && (
                        <IconButton
                          size="small"
                          onClick={() => handleMarkAsRead(notification.id)}
                          sx={{ 
                            color: theme.textSecondary,
                            '&:hover': {
                              backgroundColor: theme.hover
                            }
                          }}
                        >
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(notification.id)}
                        sx={{ 
                          color: theme.error,
                          '&:hover': {
                            backgroundColor: `${theme.error}20`
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </List>
        )}

        {/* Action Dialog */}
        <Dialog
          open={actionDialog.open}
          onClose={() => setActionDialog({ open: false, notificationId: null, action: null, booking: null })}
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
          <DialogTitle sx={{ 
            color: theme.textPrimary,
            borderBottom: `1px solid ${theme.divider}`
          }}>
            {actionDialog.action === 'accepted' ? 'Accept Booking Request' : 'Reject Booking Request'}
          </DialogTitle>
          
          <DialogContent sx={{ pt: 3 }}>
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 2,
                color: theme.textPrimary
              }}
            >
              Are you sure you want to {actionDialog.action === 'accepted' ? 'accept' : 'reject'} this booking request?
            </Typography>
            
            {actionDialog.booking && (
              <Box sx={{ 
                p: 2, 
                backgroundColor: theme.surfaceBackground,
                borderRadius: 1,
                mb: 2,
                border: `1px solid ${theme.border}`
              }}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    color: theme.textPrimary,
                    mb: 1,
                    fontWeight: 600
                  }}
                >
                  Booking Details:
                </Typography>
                {actionDialog.booking.tenant_name && (
                  <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                    Tenant: {actionDialog.booking.tenant_name}
                  </Typography>
                )}
                {actionDialog.booking.check_in_date && (
                  <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                    Dates: {actionDialog.booking.check_in_date} to {actionDialog.booking.check_out_date}
                  </Typography>
                )}
                {actionDialog.booking.total_price && (
                  <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                    Total: LKR {actionDialog.booking.total_price.toLocaleString()}
                  </Typography>
                )}
              </Box>
            )}
            
            {actionDialog.action === 'accepted' && (
  <Box sx={{ mt: 2 }}>
    <TextField
      fullWidth
      multiline
      rows={5}
      label="Bank Account Information *"
      placeholder="Example: 
Bank: Commercial Bank
Account Name: John Doe  
Account Number: 12345678
Branch: Colombo 03"
      value={accountInfo}
      onChange={(e) => setAccountInfo(e.target.value)}
      required
      sx={{ mt: 2 }}
      helperText="Provide your bank account or mobile payment details for the tenant to make payment"
    />
  </Box>
)}

            <TextField
              fullWidth
              multiline
              rows={3}
              label={actionDialog.action === 'accepted' ? 'Acceptance Message (Optional)' : 'Rejection Reason'}
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              placeholder={
                actionDialog.action === 'accepted' 
                  ? 'Any message for the tenant...'
                  : 'Please provide a reason for rejection...'
              }
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: theme.inputBackground,
                  '& fieldset': {
                    borderColor: theme.border
                  },
                  '&:hover fieldset': {
                    borderColor: theme.primary
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.primary
                  }
                },
                '& .MuiInputLabel-root': {
                  color: theme.textSecondary
                },
                '& .MuiInputBase-input': {
                  color: theme.textPrimary
                }
              }}
            />
          </DialogContent>
          
          <DialogActions sx={{ 
            borderTop: `1px solid ${theme.divider}`,
            p: 3
          }}>
            <Button 
              onClick={() => setActionDialog({ open: false, notificationId: null, action: null, booking: null })}
              sx={{ 
                color: theme.textSecondary,
                '&:hover': {
                  backgroundColor: theme.hover
                }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleActionConfirm}
              variant="contained"
              color={actionDialog.action === 'accepted' ? 'success' : 'error'}
              sx={{
                backgroundColor: actionDialog.action === 'accepted' ? theme.success : theme.error,
                '&:hover': {
                  backgroundColor: actionDialog.action === 'accepted' ? `${theme.success}dd` : `${theme.error}dd`
                }
              }}
            >
              {actionDialog.action === 'accepted' ? 'Accept Booking' : 'Reject Booking'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
      
      {/* Booking Details Modal */}
<Dialog
  open={bookingDetailsModal.open}
  onClose={() => setBookingDetailsModal(prev => ({ ...prev, open: false }))}
  maxWidth="md"
  fullWidth
  PaperProps={{
    sx: {
      backgroundColor: theme.paperBackground,
      border: `1px solid ${theme.border}`
    }
  }}
>
  <DialogTitle sx={{ 
    color: theme.textPrimary,
    borderBottom: `1px solid ${theme.border}`,
    pb: 2
  }}>
    <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <BookingIcon />
      Booking Request Details
    </Typography>
  </DialogTitle>
  
  <DialogContent sx={{ p: 0 }}>
    {bookingDetailsModal.loading ? (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    ) : bookingDetailsModal.booking && (
      <Box sx={{ p: 3 }}>
        {/* Property Information */}
        {bookingDetailsModal.property && (
          <Card sx={{ mb: 3, backgroundColor: theme.surfaceBackground }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: theme.textPrimary }}>
                Property Information
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LocationOnIcon sx={{ color: theme.textSecondary, fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                  {bookingDetailsModal.property.address}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                {bookingDetailsModal.property.property_type} • {bookingDetailsModal.property.unit_type}
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Booking Information */}
        <Card sx={{ mb: 3, backgroundColor: theme.surfaceBackground }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: theme.textPrimary }}>
              Booking Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <PersonIcon sx={{ color: theme.textSecondary, fontSize: 20 }} />
                  <Box>
                    <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                      Guest Name
                    </Typography>
                    <Typography variant="body1" sx={{ color: theme.textPrimary }}>
                      {bookingDetailsModal.booking.first_name} {bookingDetailsModal.booking.last_name}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <CalendarTodayIcon sx={{ color: theme.textSecondary, fontSize: 20 }} />
                  <Box>
                    <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                      Check-in Date
                    </Typography>
                    <Typography variant="body1" sx={{ color: theme.textPrimary }}>
                      {new Date(bookingDetailsModal.booking.check_in_date).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <CalendarTodayIcon sx={{ color: theme.textSecondary, fontSize: 20 }} />
                  <Box>
                    <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                      Check-out Date
                    </Typography>
                    <Typography variant="body1" sx={{ color: theme.textPrimary }}>
                      {new Date(bookingDetailsModal.booking.check_out_date).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <PaymentIcon sx={{ color: theme.textSecondary, fontSize: 20 }} />
                  <Box>
                    <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                      Total Amount
                    </Typography>
                    <Typography variant="body1" sx={{ color: theme.textPrimary }}>
                      LKR {bookingDetailsModal.booking.total_price?.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {/* Contact Information */}
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom sx={{ color: theme.textPrimary }}>
              Contact Information
            </Typography>
            <Typography variant="body2" sx={{ color: theme.textSecondary, mb: 1 }}>
              Email: {bookingDetailsModal.booking.email}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.textSecondary }}>
              Phone: {bookingDetailsModal.booking.country_code}{bookingDetailsModal.booking.mobile_number}
            </Typography>
            
            {/* Status */}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1" sx={{ color: theme.textPrimary }}>
                Status:
              </Typography>
              <Chip
                label={bookingDetailsModal.booking.status?.toUpperCase()}
                color={bookingDetailsModal.booking.status === 'pending' ? 'warning' : 'default'}
                size="small"
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
    )}
  </DialogContent>
  
  <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.border}` }}>
    <Button
      onClick={() => setBookingDetailsModal(prev => ({ ...prev, open: false }))}
      sx={{ color: theme.textSecondary }}
    >
      Close
    </Button>
  </DialogActions>
</Dialog>
    </Box>
    <AppSnackbar
            open={snackbar.open}
            message={snackbar.message}
            severity={snackbar.severity}
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          />
          </>
  );
};

export default Notifications;