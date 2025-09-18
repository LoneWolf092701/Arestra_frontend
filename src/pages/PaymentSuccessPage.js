import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  CheckCircle as CheckCircleIcon,
  Home as HomeIcon,
  Receipt as ReceiptIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  CreditCard as CreditCardIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const PaymentSuccessPage = () => {
  const { paymentIntentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmationData, setConfirmationData] = useState(null);

  useEffect(() => {
    if (paymentIntentId) {
      fetchPaymentConfirmation();
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

  const handleDownloadReceipt = () => {
    // This would typically generate and download a PDF receipt
    // For now, we'll just show an alert
    alert('Receipt download functionality would be implemented here');
  };

  const handleViewBooking = () => {
    if (confirmationData?.booking?.id) {
      // Add a flag to indicate we should refresh bookings
      localStorage.setItem('refreshBookings', 'true');
      navigate(`/user/bookings`);
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={48} />
      </Container>
    );
  }

  if (error || !confirmationData) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Payment confirmation not found'}
        </Alert>
        <Button onClick={handleGoHome} variant="contained">
          Go Home
        </Button>
      </Container>
    );
  }

  const { booking, payment } = confirmationData;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Success Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Avatar
            sx={{
              bgcolor: 'success.main',
              width: 80,
              height: 80,
              mx: 'auto',
              mb: 2
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 48 }} />
          </Avatar>
          <Typography variant="h4" gutterBottom color="success.main">
            Payment Successful!
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Your booking has been confirmed
          </Typography>
          <Chip
            label={`Payment ID: ${payment?.id?.slice(-8) || 'N/A'}`}
            variant="outlined"
            sx={{ mt: 2 }}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Booking Details */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <LocationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Property Details
                </Typography>
                <Typography variant="h5" gutterBottom>
                  {booking.property_title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {booking.address}
                </Typography>
                
                {booking.images && booking.images.length > 0 && (
                  <Box
                    component="img"
                    src={booking.images[0]}
                    alt={booking.property_title}
                    sx={{
                      width: '100%',
                      height: 200,
                      objectFit: 'cover',
                      borderRadius: 1,
                      mb: 2
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <CalendarIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Booking Details
                </Typography>
                
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Check-in"
                      secondary={format(new Date(booking.check_in), 'PPP')}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <CalendarIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Check-out"
                      secondary={format(new Date(booking.check_out), 'PPP')}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Guest Name"
                      secondary={booking.guest_name}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email"
                      secondary={booking.guest_email}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Payment Summary */}
        <Card variant="outlined" sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <CreditCardIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Payment Summary
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Advance Payment
                </Typography>
                <Typography variant="h6">
                  LKR {booking.advance_amount?.toLocaleString()}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Total Amount
                </Typography>
                <Typography variant="h6">
                  LKR {booking.total_amount?.toLocaleString()}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Payment Status
                </Typography>
                <Chip
                  label={booking.payment_status || 'Confirmed'}
                  color="success"
                  size="small"
                />
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Payment Method
                </Typography>
                <Typography variant="body2">
                  Stripe (Card)
                </Typography>
              </Grid>
            </Grid>

            {payment && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Transaction Details
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Transaction ID: {payment.id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Amount: ${(payment.amount / 100).toFixed(2)} {payment.currency?.toUpperCase()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Status: {payment.status}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Date: {format(new Date(payment.created * 1000), 'PPP p')}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            What's Next?
          </Typography>
          <Typography variant="body2">
            • You will receive a confirmation email shortly<br/>
            • The property owner has been notified of your booking<br/>
            • You can view your booking details in "My Bookings"<br/>
            • Contact the property owner for any special requests
          </Typography>
        </Alert>

        {/* Action Buttons */}
        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadReceipt}
          >
            Download Receipt
          </Button>
          
          <Button
            variant="contained"
            startIcon={<ReceiptIcon />}
            onClick={handleViewBooking}
          >
            View My Bookings
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={handleGoHome}
          >
            Go Home
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default PaymentSuccessPage;
