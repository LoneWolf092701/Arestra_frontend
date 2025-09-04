import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  Input,
  FormLabel
} from '@mui/material';
import {
  Upload as UploadIcon,
  Receipt as ReceiptIcon,
  PhotoCamera as PhotoCameraIcon,
  CreditCard as CreditCardIcon
} from '@mui/icons-material';
import { getBookingDetails, submitPaymentReceipt } from '../../api/bookingApi'; // Import submitPaymentReceipt

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('receipt');
  const [files, setFiles] = useState({
    payment_receipt: null,
    nic_document: null
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadBookingDetails();
  }, [bookingId]);

  const loadBookingDetails = async () => {
    try {
      const bookingData = await getBookingDetails(bookingId);
      setBooking(bookingData);
    } catch (error) {
      setError('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event, fileType) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setFiles(prev => ({ ...prev, [fileType]: file }));
    }
  };

  const handleReceiptUpload = async () => {
    if (!files.payment_receipt || !files.nic_document) {
      setError('Please select both payment receipt and NIC document');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Use submitPaymentReceipt from bookingApi.js
      const response = await submitPaymentReceipt(bookingId, files.payment_receipt, files.nic_document);
      setSuccess('Payment receipt and documents uploaded successfully! The property owner will review and confirm your payment.');
      setTimeout(() => {
        navigate('/user-bookings');
      }, 3000);
    } catch (error) {
      setError(error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!booking) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Booking not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Complete Your Payment
      </Typography>

      {/* Booking Details */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Booking Details</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="textSecondary">Property</Typography>
              <Typography variant="body1">{booking.property_address}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="textSecondary">Amount to Pay</Typography>
              <Typography variant="h6" color="primary">
                LKR {booking.advance_amount?.toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary">Check-in to Check-out</Typography>
              <Typography variant="body1">
                {new Date(booking.check_in_date).toLocaleDateString()} to {new Date(booking.check_out_date).toLocaleDateString()}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Payment Account Info */}
      {booking.payment_account_info && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Payment Account Details:
          </Typography>
          <Typography variant="body2" style={{ whiteSpace: 'pre-line' }}>
            {booking.payment_account_info}
          </Typography>
        </Alert>
      )}

      {/* Payment Methods */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Choose Payment Method</Typography>
          
          <Grid container spacing={3}>
            {/* Receipt Upload Method */}
            <Grid item xs={12} md={6}>
              <Card 
                variant="outlined"
                sx={{ 
                  cursor: 'pointer',
                  border: paymentMethod === 'receipt' ? 2 : 1,
                  borderColor: paymentMethod === 'receipt' ? 'primary.main' : 'divider'
                }}
                onClick={() => setPaymentMethod('receipt')}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <ReceiptIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    Upload Payment Receipt
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Make payment and upload receipt with NIC verification
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Card Payment Method */}
            <Grid item xs={12} md={6}>
              <Card 
                variant="outlined"
                sx={{ 
                  cursor: 'pointer',
                  opacity: 0.6,
                  border: 1,
                  borderColor: 'divider'
                }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <CreditCardIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="h6" gutterBottom color="textSecondary">
                    Card Payment
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Coming soon - Direct card payment
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Receipt Upload Section */}
      {paymentMethod === 'receipt' && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Upload Payment Documents
            </Typography>

            <Grid container spacing={3}>
              {/* Payment Receipt Upload */}
              <Grid item xs={12} md={6}>
                <Box sx={{ textAlign: 'center', p: 2, border: '1px dashed grey', borderRadius: 1 }}>
                  <ReceiptIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="subtitle1" gutterBottom>
                    Payment Receipt
                  </Typography>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'payment_receipt')}
                    sx={{ mb: 1 }}
                  />
                  {files.payment_receipt && (
                    <Typography variant="body2" color="primary">
                      ✓ {files.payment_receipt.name}
                    </Typography>
                  )}
                </Box>
              </Grid>

              {/* NIC Upload */}
              <Grid item xs={12} md={6}>
                <Box sx={{ textAlign: 'center', p: 2, border: '1px dashed grey', borderRadius: 1 }}>
                  <PhotoCameraIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="subtitle1" gutterBottom>
                    NIC Photo
                  </Typography>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'nic_document')}
                    sx={{ mb: 1 }}
                  />
                  {files.nic_document && (
                    <Typography variant="body2" color="primary">
                      ✓ {files.nic_document.name}
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleReceiptUpload}
                disabled={!files.payment_receipt || !files.nic_document || uploading}
                startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
              >
                {uploading ? 'Uploading...' : 'Submit Payment Proof'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Messages */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {success}
        </Alert>
      )}
    </Container>
  );
};

export default PaymentPage;