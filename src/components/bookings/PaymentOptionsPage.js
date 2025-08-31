import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Alert,
  CircularProgress,
  Divider,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  CreditCard as CreditCardIcon,
  Upload as UploadIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import { getBookingDetails } from '../../api/bookingApi';
import AppSnackbar from '../common/AppSnackbar';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const PaymentForm = ({ booking, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    const cardElement = elements.getElement(CardElement);

    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: `${booking.first_name} ${booking.last_name}`,
          email: booking.email,
        },
      });

      if (error) {
        onError(error.message);
      } else {
        const response = await fetch(`/api/bookings/${booking.id}/payment/stripe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            payment_method_id: paymentMethod.id,
            amount: booking.advance_amount
          })
        });

        const result = await response.json();

        if (response.ok) {
          onSuccess(result);
        } else {
          onError(result.message || 'Payment failed');
        }
      }
    } catch (error) {
      onError(error.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ mb: 3 }}>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </Box>
      <Button
        type="submit"
        variant="contained"
        disabled={!stripe || processing}
        fullWidth
        startIcon={processing ? <CircularProgress size={20} /> : <CreditCardIcon />}
        sx={{ py: 1.5 }}
      >
        {processing ? 'Processing Payment...' : `Pay LKR ${booking?.advance_amount?.toLocaleString()}`}
      </Button>
    </form>
  );
};

const PaymentOptionsPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { theme, isDark } = useTheme();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('receipt');
  const [uploadFiles, setUploadFiles] = useState({ receipt: null, nic: null });
  const [uploading, setUploading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    if (bookingId) {
      loadBookingDetails();
    }
  }, [bookingId]);

  const loadBookingDetails = async () => {
    try {
      setLoading(true);
      const bookingData = await getBookingDetails(bookingId);
      setBooking(bookingData);
    } catch (error) {
      console.error('Error loading booking:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load booking details',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event, fileType) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setSnackbar({
          open: true,
          message: 'File size must be less than 10MB',
          severity: 'error'
        });
        return;
      }
      
      setUploadFiles(prev => ({ ...prev, [fileType]: file }));
    }
  };

  const handleReceiptUpload = async () => {
    if (!uploadFiles.receipt || !uploadFiles.nic) {
      setSnackbar({
        open: true,
        message: 'Please select both payment receipt and NIC photo',
        severity: 'warning'
      });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('receipt', uploadFiles.receipt);
      formData.append('nic_photo', uploadFiles.nic);

      const response = await fetch(`/api/bookings/${bookingId}/payment/receipt`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'Payment receipt and verification documents uploaded successfully!',
          severity: 'success'
        });
        setTimeout(() => {
          navigate('/user/bookings');
        }, 2000);
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to upload documents',
        severity: 'error'
      });
    } finally {
      setUploading(false);
      setUploadDialogOpen(false);
    }
  };

  const handleStripeSuccess = (result) => {
    setSnackbar({
      open: true,
      message: 'Payment completed successfully!',
      severity: 'success'
    });
    setTimeout(() => {
      navigate('/user/bookings');
    }, 2000);
  };

  const handleStripeError = (error) => {
    setSnackbar({
      open: true,
      message: error,
      severity: 'error'
    });
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!booking) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">Booking not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, textAlign: 'center' }}>
        Complete Your Payment
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Booking Summary</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography><strong>Property:</strong> {booking.property_address}</Typography>
              <Typography><strong>Check-in:</strong> {new Date(booking.check_in_date).toLocaleDateString()}</Typography>
              <Typography><strong>Check-out:</strong> {new Date(booking.check_out_date).toLocaleDateString()}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography><strong>Amount to Pay:</strong> LKR {booking.advance_amount?.toLocaleString()}</Typography>
              {booking.payment_account_info && (
                <Box sx={{ mt: 1, p: 2, bgcolor: isDark ? '#2a2a2a' : '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    <AccountBalanceIcon sx={{ fontSize: 16, mr: 1 }} />
                    <strong>Account Details:</strong>
                  </Typography>
                  <Typography variant="body2">{booking.payment_account_info}</Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3 }}>Choose Payment Method</Typography>
          
          <FormControl component="fieldset" sx={{ mb: 3 }}>
            <RadioGroup
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <FormControlLabel
                value="receipt"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ReceiptIcon sx={{ mr: 1 }} />
                    Upload Payment Receipt & NIC Photo
                  </Box>
                }
              />
              <FormControlLabel
                value="stripe"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CreditCardIcon sx={{ mr: 1 }} />
                    Pay with Credit/Debit Card (Stripe)
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>

          <Divider sx={{ my: 3 }} />

          {paymentMethod === 'receipt' ? (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Upload Payment Documents</Typography>
              <Alert severity="info" sx={{ mb: 3 }}>
                Please transfer the amount to the provided account and upload your payment receipt along with a clear photo of your NIC for verification.
              </Alert>
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={() => setUploadDialogOpen(true)}
                fullWidth
                sx={{ py: 1.5 }}
              >
                Upload Receipt & NIC Photo
              </Button>
            </Box>
          ) : (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Pay with Card</Typography>
              <Alert severity="info" sx={{ mb: 3 }}>
                Pay securely using your credit or debit card through Stripe.
              </Alert>
              <Elements stripe={stripePromise}>
                <PaymentForm
                  booking={booking}
                  onSuccess={handleStripeSuccess}
                  onError={handleStripeError}
                />
              </Elements>
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog 
        open={uploadDialogOpen} 
        onClose={() => setUploadDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload Payment Documents</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Payment Receipt</Typography>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(e) => handleFileChange(e, 'receipt')}
              style={{ marginBottom: 16, width: '100%' }}
            />
            
            <Typography variant="subtitle2" sx={{ mb: 1 }}>NIC Photo</Typography>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(e) => handleFileChange(e, 'nic')}
              style={{ marginBottom: 16, width: '100%' }}
            />
            
            {uploadFiles.receipt && (
              <Typography variant="body2" color="textSecondary">
                Receipt: {uploadFiles.receipt.name}
              </Typography>
            )}
            {uploadFiles.nic && (
              <Typography variant="body2" color="textSecondary">
                NIC: {uploadFiles.nic.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleReceiptUpload}
            variant="contained"
            disabled={uploading || !uploadFiles.receipt || !uploadFiles.nic}
            startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
          >
            {uploading ? 'Uploading...' : 'Upload Documents'}
          </Button>
        </DialogActions>
      </Dialog>

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Container>
  );
};

export default PaymentOptionsPage;