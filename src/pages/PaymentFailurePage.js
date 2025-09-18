import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  Alert,
  CircularProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Error as ErrorIcon,
  Home as HomeIcon,
  Refresh as RefreshIcon,
  CreditCard as CreditCardIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Support as SupportIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const PaymentFailurePage = () => {
  const { paymentIntentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmationData, setConfirmationData] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Get error message from location state or URL params
  const errorMessage = location.state?.error || new URLSearchParams(location.search).get('error') || 'Payment failed';

  useEffect(() => {
    if (paymentIntentId) {
      fetchPaymentConfirmation();
    } else {
      setLoading(false);
    }
  }, [paymentIntentId]);

  const fetchPaymentConfirmation = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/payments/confirmation/${paymentIntentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payment confirmation');
      }

      const data = await response.json();
      setConfirmationData(data);
    } catch (error) {
      console.error('Error fetching payment confirmation:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryPayment = () => {
    if (confirmationData?.booking?.id) {
      navigate(`/payment/${confirmationData.booking.id}`);
    } else {
      navigate('/user/bookings');
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleContactSupport = () => {
    // This would typically open a support chat or email
    window.open('mailto:support@staywise.com?subject=Payment Issue', '_blank');
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={48} />
      </Container>
    );
  }

  const booking = confirmationData?.booking;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Error Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Avatar
            sx={{
              bgcolor: 'error.main',
              width: 80,
              height: 80,
              mx: 'auto',
              mb: 2
            }}
          >
            <ErrorIcon sx={{ fontSize: 48 }} />
          </Avatar>
          <Typography variant="h4" gutterBottom color="error.main">
            Payment Failed
          </Typography>
          <Typography variant="h6" color="text.secondary">
            We couldn't process your payment
          </Typography>
          {paymentIntentId && (
            <Chip
              label={`Payment ID: ${paymentIntentId.slice(-8)}`}
              variant="outlined"
              color="error"
              sx={{ mt: 2 }}
            />
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Error Details */}
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Error Details:
          </Typography>
          <Typography variant="body2">
            {errorMessage}
          </Typography>
        </Alert>

        {/* Common Reasons */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Common reasons for payment failure:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText
                  primary="• Insufficient funds in your account"
                  secondary="Check your account balance and try again"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="• Incorrect card details"
                  secondary="Verify your card number, expiry date, and CVV"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="• Card expired or blocked"
                  secondary="Contact your bank to verify card status"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="• International transaction restrictions"
                  secondary="Enable international transactions with your bank"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="• Network connectivity issues"
                  secondary="Check your internet connection and try again"
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* Booking Details (if available) */}
        {booking && (
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <LocationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Booking Details
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    {booking.property_title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {booking.address}
                  </Typography>
                  
                  <List dense>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <CalendarIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Check-in"
                        secondary={format(new Date(booking.check_in), 'PPP')}
                      />
                    </ListItem>
                    
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <CalendarIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Check-out"
                        secondary={format(new Date(booking.check_out), 'PPP')}
                      />
                    </ListItem>
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Payment Summary
                  </Typography>
                  
                  <List dense>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary="Advance Payment"
                        secondary={`LKR ${booking.advance_amount?.toLocaleString()}`}
                      />
                    </ListItem>
                    
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary="Total Amount"
                        secondary={`LKR ${booking.total_amount?.toLocaleString()}`}
                      />
                    </ListItem>
                    
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary="Payment Status"
                        secondary={
                          <Chip
                            label={booking.payment_status || 'Failed'}
                            color="error"
                            size="small"
                          />
                        }
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Retry Information */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Don't worry, your booking is still reserved!
          </Typography>
          <Typography variant="body2">
            • Your booking details have been saved<br/>
            • You can retry payment using a different payment method<br/>
            • Contact support if you continue to experience issues
          </Typography>
        </Alert>

        {/* Action Buttons */}
        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={handleRetryPayment}
            color="primary"
          >
            Try Payment Again
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<SupportIcon />}
            onClick={handleContactSupport}
          >
            Contact Support
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={handleGoHome}
          >
            Go Home
          </Button>
        </Box>

        {/* Additional Help */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Need help? Contact our support team at{' '}
            <Typography
              component="a"
              href="mailto:support@staywise.com"
              color="primary"
              sx={{ textDecoration: 'none' }}
            >
              support@staywise.com
            </Typography>
            {' '}or call +94 11 123 4567
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default PaymentFailurePage;

