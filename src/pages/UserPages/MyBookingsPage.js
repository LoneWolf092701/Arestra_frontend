import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Divider,
  Avatar,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  Home as HomeIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { getUserBookings } from '../../api/bookingApi';
import PaymentOptionsModal from '../../components/booking/PaymentOptionsModal';
import { useTheme } from '../../contexts/ThemeContext';
import AppSnackbar from '../../components/common/AppSnackbar';

const MyBookingsPage = () => {
  const { theme, isDark } = useTheme();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    
    try {
      const response = await getUserBookings();
      setBookings(response.bookings || []);
      setError('');
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to fetch bookings. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'pending': 'warning',
      'approved': 'info',
      'payment_submitted': 'primary',
      'confirmed': 'success',
      'rejected': 'error',
      'auto_rejected': 'error',
      'payment_rejected': 'error',
      'cancelled': 'default'
    };
    return statusColors[status] || 'default';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      'pending': 'Pending Approval',
      'approved': 'Payment Required',
      'payment_submitted': 'Payment Under Review',
      'confirmed': 'Booking Confirmed',
      'rejected': 'Rejected',
      'auto_rejected': 'Auto Rejected',
      'payment_rejected': 'Payment Rejected',
      'cancelled': 'Cancelled'
    };
    return statusTexts[status] || status;
  };

  const getBookingSteps = (booking) => {
    const steps = [
      {
        label: 'Request Submitted',
        completed: true,
        active: booking.status === 'pending'
      },
      {
        label: 'Owner Response',
        completed: ['approved', 'payment_submitted', 'confirmed'].includes(booking.status),
        active: booking.status === 'pending',
        rejected: ['rejected', 'auto_rejected'].includes(booking.status)
      },
      {
        label: 'Payment',
        completed: ['payment_submitted', 'confirmed'].includes(booking.status),
        active: booking.status === 'approved',
        rejected: booking.status === 'payment_rejected'
      },
      {
        label: 'Booking Confirmed',
        completed: booking.status === 'confirmed',
        active: booking.status === 'payment_submitted'
      }
    ];
    return steps;
  };

  const handlePaymentClick = (booking) => {
    setSelectedBooking(booking);
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = async (paymentMethod, paymentData) => {
    try {
      setShowPaymentModal(false);
      setSnackbar({
        open: true,
        message: 'Payment submitted successfully! Waiting for owner confirmation...',
        severity: 'success'
      });

      // Refresh bookings to show updated status
      setTimeout(() => {
        fetchBookings(true);
      }, 2000);
      
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Payment processing failed. Please try again.',
        severity: 'error'
      });
    }
  };

  const renderBookingCard = (booking) => {
    const steps = getBookingSteps(booking);
    
    return (
      <Card key={booking.id} sx={{ 
        mb: 3, 
        backgroundColor: isDark ? theme.cardBackground : '#ffffff',
        border: isDark ? `1px solid ${theme.border}` : 'none'
      }}>
        <CardContent>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                {booking.property_type} - {booking.unit_type}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {booking.property_address}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Booking ID: #{booking.id}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Chip
                label={getStatusText(booking.status)}
                color={getStatusColor(booking.status)}
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                {new Date(booking.created_at).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Booking Details */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">Check-in</Typography>
              <Typography variant="body1">
                {new Date(booking.check_in_date).toLocaleDateString()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">Check-out</Typography>
              <Typography variant="body1">
                {new Date(booking.check_out_date).toLocaleDateString()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">Duration</Typography>
              <Typography variant="body1">{booking.booking_days} days</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">Total Amount</Typography>
              <Typography variant="body1" color="primary">
                LKR {booking.total_price?.toLocaleString()}
              </Typography>
            </Grid>
          </Grid>

          {/* Progress Stepper */}
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Booking Progress</Typography>
            <Stepper activeStep={steps.findIndex(step => step.active)} orientation="horizontal">
              {steps.map((step, index) => (
                <Step key={step.label} completed={step.completed}>
                  <StepLabel 
                    error={step.rejected}
                    icon={
                      step.rejected ? <CancelIcon /> :
                      step.completed ? <CheckCircleIcon /> :
                      step.active ? <ScheduleIcon /> : undefined
                    }
                  >
                    {step.label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>

          {/* Action Messages and Buttons */}
          {booking.status === 'pending' && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Your booking request has been sent to the property owner. You'll be notified once they respond.
            </Alert>
          )}

          {booking.status === 'approved' && (
            <Alert severity="success" sx={{ mb: 2 }} action={
              <Button color="inherit" size="small" onClick={() => handlePaymentClick(booking)}>
                Pay Now
              </Button>
            }>
              Great! Your booking has been approved. Please proceed with payment to confirm your booking.
              <br />
              <strong>Advance Payment Required: LKR {booking.advance_amount?.toLocaleString()}</strong>
            </Alert>
          )}

          {booking.status === 'payment_submitted' && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Payment submitted successfully! The property owner is reviewing your payment.
              {booking.payment_method === 'stripe' && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Payment processed via Stripe: {booking.stripe_payment_intent_id}
                </Typography>
              )}
            </Alert>
          )}

          {booking.status === 'confirmed' && (
            <Alert severity="success" sx={{ mb: 2 }} action={
              <Button color="inherit" size="small" startIcon={<HomeIcon />}>
                View Details
              </Button>
            }>
              🎉 Congratulations! Your booking is confirmed. 
              <Typography variant="body2" sx={{ mt: 1 }}>
                You can now proceed with your travel plans. Check-in: {new Date(booking.check_in_date).toLocaleDateString()}
              </Typography>
            </Alert>
          )}

          {['rejected', 'auto_rejected', 'payment_rejected'].includes(booking.status) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {booking.status === 'payment_rejected' 
                ? 'Your payment was rejected by the property owner.' 
                : 'Your booking request was not approved.'}
              {booking.owner_response_message && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Message:</strong> {booking.owner_response_message}
                </Typography>
              )}
            </Alert>
          )}

          {booking.status === 'cancelled' && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              This booking has been cancelled.
            </Alert>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button 
              variant="outlined" 
              size="small" 
              startIcon={<VisibilityIcon />}
              onClick={() => {/* Navigate to booking details */}}
            >
              View Details
            </Button>
            
            {booking.status === 'approved' && (
              <Button
                variant="contained"
                size="small"
                startIcon={<PaymentIcon />}
                onClick={() => handlePaymentClick(booking)}
              >
                Make Payment
              </Button>
            )}

            {booking.status === 'pending' && (
              <Button
                variant="outlined"
                size="small"
                color="error"
                onClick={() => {/* Handle cancellation */}}
              >
                Cancel Request
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">
          My Bookings
        </Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={() => fetchBookings(true)} disabled={refreshing}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {refreshing && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Refreshing bookings...
          </Typography>
        </Box>
      )}

      {bookings.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 6 }}>
          <CardContent>
            <HomeIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Bookings Yet
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              You haven't made any booking requests yet.
            </Typography>
            <Button variant="contained" sx={{ mt: 2 }} href="/user-properties">
              Browse Properties
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container>
          <Grid item xs={12}>
            {bookings.map(booking => renderBookingCard(booking))}
          </Grid>
        </Grid>
      )}

      {/* Payment Options Modal */}
      {showPaymentModal && selectedBooking && (
        <PaymentOptionsModal
          open={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          booking={selectedBooking}
          accountInfo={selectedBooking.payment_account_info || 'Payment account details will be provided by the property owner.'}
          onPaymentComplete={handlePaymentComplete}
        />
      )}

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Container>
  );
};

export default MyBookingsPage;