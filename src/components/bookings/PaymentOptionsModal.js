import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Avatar
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  CreditCard as CreditCardIcon,
  Upload as UploadIcon,
  PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const PaymentOptionsModal = ({ 
  open, 
  onClose, 
  booking, 
  accountInfo,
  onPaymentComplete 
}) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [nicFile, setNicFile] = useState(null);

  const handleReceiptUpload = async () => {
    if (!receiptFile || !nicFile) {
      setError('Please upload both payment receipt and NIC photo');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('paymentReceipt', receiptFile);
      formData.append('nicPhoto', nicFile);

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookings/${booking.id}/payment-proof`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit documents');
      }

      const result = await response.json();
      onPaymentComplete('receipt_upload', {
        receipt_url: result.payment_receipt_url,
        nic_url: result.nic_photo_url
      });
      
    } catch (error) {
      setError(error.message || 'Failed to upload documents');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Choose Payment Method</Typography>
        <Typography variant="body2" color="text.secondary">
          Amount to pay: LKR {booking?.advance_amount?.toLocaleString()}
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Payment Account Details:
          </Typography>
          <Typography variant="body2" style={{ whiteSpace: 'pre-line' }}>
            {accountInfo}
          </Typography>
        </Alert>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                border: selectedMethod === 'receipt' ? 2 : 1,
                borderColor: selectedMethod === 'receipt' ? 'primary.main' : 'divider',
                height: '100%'
              }}
              onClick={() => setSelectedMethod('receipt')}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2 }}>
                  <ReceiptIcon />
                </Avatar>
                <Typography variant="h6" gutterBottom>
                  Upload Receipt + NIC
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Make payment via bank transfer and upload receipt with NIC photo
                </Typography>
                
                {selectedMethod === 'receipt' && (
                  <Box sx={{ mt: 2, textAlign: 'left' }}>
                    <Box sx={{ mb: 2 }}>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="receipt-upload"
                        type="file"
                        onChange={(e) => setReceiptFile(e.target.files[0])}
                      />
                      <label htmlFor="receipt-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<UploadIcon />}
                          fullWidth
                        >
                          Upload Payment Receipt
                        </Button>
                      </label>
                      {receiptFile && (
                        <Typography variant="caption" color="success.main">
                          ✓ {receiptFile.name}
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="nic-upload"
                        type="file"
                        onChange={(e) => setNicFile(e.target.files[0])}
                      />
                      <label htmlFor="nic-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<PhotoCameraIcon />}
                          fullWidth
                        >
                          Upload NIC Photo
                        </Button>
                      </label>
                      {nicFile && (
                        <Typography variant="caption" color="success.main">
                          ✓ {nicFile.name}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                border: selectedMethod === 'stripe' ? 2 : 1,
                borderColor: selectedMethod === 'stripe' ? 'primary.main' : 'divider',
                height: '100%'
              }}
              onClick={() => setSelectedMethod('stripe')}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mx: 'auto', mb: 2 }}>
                  <CreditCardIcon />
                </Avatar>
                <Typography variant="h6" gutterBottom>
                  Pay with Stripe
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Secure online payment with credit/debit card
                </Typography>

                {selectedMethod === 'stripe' && (
                  <Elements stripe={stripePromise}>
                    <StripePaymentForm 
                      booking={booking}
                      onPaymentSuccess={(paymentIntent) => {
                        onPaymentComplete('stripe', { payment_intent_id: paymentIntent.id });
                      }}
                    />
                  </Elements>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {selectedMethod === 'receipt' && (
          <Button
            variant="contained"
            onClick={handleReceiptUpload}
            disabled={!receiptFile || !nicFile || uploading}
          >
            {uploading ? <CircularProgress size={24} /> : 'Submit Documents'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

const StripePaymentForm = ({ booking, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);
    setError('');

    const cardElement = elements.getElement(CardElement);

    const { error: methodError, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (methodError) {
      setError(methodError.message);
      setProcessing(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          booking_id: booking.id,
          amount: Math.round(booking.advance_amount * 100),
          payment_method_id: paymentMethod.id
        })
      });

      const { client_secret } = await response.json();

      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(client_secret);

      if (confirmError) {
        setError(confirmError.message);
      } else {
        await fetch(`/api/bookings/${booking.id}/stripe-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            payment_intent_id: paymentIntent.id,
            payment_method_id: paymentMethod.id
          })
        });

        onPaymentSuccess(paymentIntent);
      }
    } catch (error) {
      setError('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, textAlign: 'left' }}>
      <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1, mb: 2 }}>
        <CardElement />
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={!stripe || processing}
      >
        {processing ? <CircularProgress size={24} /> : `Pay LKR ${booking?.advance_amount?.toLocaleString()}`}
      </Button>
    </Box>
  );
};

export default PaymentOptionsModal;