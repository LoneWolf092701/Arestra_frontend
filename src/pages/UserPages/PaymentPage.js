import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
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
  Input,
  Divider,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  CreditCard as CreditCardIcon,
  Upload as UploadIcon,
  PhotoCamera as PhotoCameraIcon,
  Security as SecurityIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  Lock as LockIcon,
  Shield as ShieldIcon
} from '@mui/icons-material';
import {
  Payment as VisaIcon,
  CreditCard as MasterCardIcon,
  AccountBalance as AmexIcon,
  CreditScore as MaestroIcon
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  getBookingDetails, 
  uploadBookingDocuments, 
  createStripePaymentIntent, 
  updateBookingStripePayment 
} from '../../api/bookingApi';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const ProfessionalStripeForm = ({ booking, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [cardComplete, setCardComplete] = useState({
    cardNumber: false,
    cardExpiry: false,
    cardCvc: false
  });
  const { theme, isDark } = useTheme();

  const handleCardChange = (elementType) => (event) => {
    setCardComplete(prev => ({
      ...prev,
      [elementType]: event.complete
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) return;
    
    setProcessing(true);
    
    try {
      const cardNumberElement = elements.getElement(CardNumberElement);
      
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardNumberElement,
        billing_details: {
          name: `${booking.first_name || ''} ${booking.last_name || ''}`,
          email: booking.email,
        },
      });

      if (error) {
        onError(error.message);
        setProcessing(false);
        return;
      }

      const intentResponse = await createStripePaymentIntent(
        booking.id, 
        booking.advance_amount, 
        paymentMethod.id
      );

      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        intentResponse.client_secret
      );
      
      if (confirmError) {
        onError(confirmError.message);
      } else {
        await updateBookingStripePayment(
          booking.id, 
          paymentIntent.id, 
          paymentMethod.id
        );
        onSuccess(paymentIntent);
      }
    } catch (error) {
      onError(error.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const elementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: theme.textPrimary,
        fontFamily: '"Roboto", sans-serif',
        fontSmoothing: 'antialiased',
        '::placeholder': {
          color: theme.placeholder || theme.textSecondary,
        },
      },
      invalid: {
        color: theme.error,
        iconColor: theme.error
      }
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {/* Payment Method Header */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 3,
          backgroundColor: theme.paperBackground,
          border: `1px solid ${theme.border}`,
        }}
      >
        <Typography variant="h6" fontWeight="bold" mb={1} color={theme.textPrimary}>
          PAYMENT METHOD
        </Typography>
        
        {/* Credit/Debit Card Section */}
        <Box sx={{ 
          border: `2px solid ${theme.border}`,
          borderRadius: 2,
          p: 3,
          mb: 2,
          backgroundColor: theme.cardBackground || theme.paperBackground
        }}>
          {/* Header with card brands */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight="bold" color={theme.textPrimary}>
              CREDIT / DEBIT CARD
            </Typography>
            <Box display="flex" gap={1}>
              <Box sx={{ 
                width: 40, 
                height: 25, 
                borderRadius: 1, 
                backgroundColor: '#1a1f71',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '10px',
                fontWeight: 'bold'
              }}>
                VISA
              </Box>
              <Box sx={{ 
                width: 40, 
                height: 25, 
                borderRadius: 1, 
                background: 'linear-gradient(45deg, #eb001b 0%, #ff5f00 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Box sx={{ width: 15, height: 15, borderRadius: '50%', backgroundColor: '#eb001b', mr: -1 }} />
                <Box sx={{ width: 15, height: 15, borderRadius: '50%', backgroundColor: '#ff5f00' }} />
              </Box>
              <Box sx={{ 
                width: 40, 
                height: 25, 
                borderRadius: 1, 
                backgroundColor: '#006fcf',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '8px',
                fontWeight: 'bold'
              }}>
                AMEX
              </Box>
              <Box sx={{ 
                width: 40, 
                height: 25, 
                borderRadius: 1, 
                backgroundColor: '#0099df',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Box sx={{ width: 12, height: 8, borderRadius: 1, backgroundColor: 'white' }} />
              </Box>
            </Box>
          </Box>

          <Typography variant="body2" color={theme.textSecondary} mb={3}>
            You may be directed to your bank's 3D secure process to authenticate your information.
          </Typography>

          {/* Card Number Field */}
          <Box sx={{ 
            border: `1px solid ${theme.inputBorder || theme.border}`,
            borderRadius: 1,
            p: 2,
            mb: 2,
            position: 'relative',
            backgroundColor: theme.inputBackground || theme.paperBackground
          }}>
            <Typography variant="caption" color={theme.textSecondary} sx={{ 
              position: 'absolute', 
              top: -8, 
              left: 8, 
              backgroundColor: theme.inputBackground || theme.paperBackground,
              px: 1 
            }}>
              Card number
            </Typography>
            <CardNumberElement 
              options={elementOptions}
              onChange={handleCardChange('cardNumber')}
            />
            {cardComplete.cardNumber && (
              <Box sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}>
                <Box sx={{ 
                  width: 25, 
                  height: 15, 
                  borderRadius: 1, 
                  background: 'linear-gradient(45deg, #eb001b 0%, #ff5f00 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#eb001b', mr: -0.5 }} />
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ff5f00' }} />
                </Box>
              </Box>
            )}
          </Box>

          {/* Expiry and CVC Row */}
          <Grid container spacing={2} mb={2}>
            <Grid item xs={6}>
              <Box sx={{ 
                border: `1px solid ${theme.inputBorder || theme.border}`,
                borderRadius: 1,
                p: 2,
                position: 'relative',
                backgroundColor: theme.inputBackground || theme.paperBackground
              }}>
                <Typography variant="caption" color={theme.textSecondary} sx={{ 
                  position: 'absolute', 
                  top: -8, 
                  left: 8, 
                  backgroundColor: theme.inputBackground || theme.paperBackground,
                  px: 1 
                }}>
                  Expiry date
                </Typography>
                <CardExpiryElement 
                  options={elementOptions}
                  onChange={handleCardChange('cardExpiry')}
                />
                {cardComplete.cardExpiry && (
                  <CheckIcon sx={{ 
                    position: 'absolute', 
                    right: 8, 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: theme.success,
                    fontSize: 20
                  }} />
                )}
              </Box>
            </Grid>
            
            <Grid item xs={6}>
              <Box sx={{ 
                border: `1px solid ${theme.inputBorder || theme.border}`,
                borderRadius: 1,
                p: 2,
                position: 'relative',
                backgroundColor: theme.inputBackground || theme.paperBackground
              }}>
                <Typography variant="caption" color={theme.textSecondary} sx={{ 
                  position: 'absolute', 
                  top: -8, 
                  left: 8, 
                  backgroundColor: theme.inputBackground || theme.paperBackground,
                  px: 1 
                }}>
                  CVC / CVV
                </Typography>
                <CardCvcElement 
                  options={elementOptions}
                  onChange={handleCardChange('cardCvc')}
                />
                {cardComplete.cardCvc && (
                  <CheckIcon sx={{ 
                    position: 'absolute', 
                    right: 8, 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: theme.success,
                    fontSize: 20
                  }} />
                )}
              </Box>
            </Grid>
          </Grid>

          {/* Name on Card Field */}
          <Box sx={{ 
            border: `1px solid ${theme.inputBorder || theme.border}`,
            borderRadius: 1,
            p: 2,
            position: 'relative',
            backgroundColor: theme.inputBackground || theme.paperBackground
          }}>
            <Typography variant="caption" color={theme.textSecondary} sx={{ 
              position: 'absolute', 
              top: -8, 
              left: 8, 
              backgroundColor: theme.inputBackground || theme.paperBackground,
              px: 1 
            }}>
              Name on card
            </Typography>
            <Input
              fullWidth
              disableUnderline
              value={`${booking?.first_name || ''} ${booking?.last_name || ''}`.trim()}
              readOnly
              sx={{
                fontSize: '16px',
                color: theme.textPrimary,
                fontFamily: '"Roboto", sans-serif',
              }}
            />
            <CheckIcon sx={{ 
              position: 'absolute', 
              right: 8, 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: theme.success,
              fontSize: 20
            }} />
          </Box>
        </Box>
      </Paper>

      {/* Security Features */}
      <Card 
  elevation={2}
  sx={{ 
    borderRadius: 3,
    backgroundColor: theme.paperBackground,
    border: `1px solid ${theme.border}`,
  }}
>
  <CardContent sx={{ p: 3 }}>
    <Box display="flex" alignItems="center" mb={2}>
      <ShieldIcon sx={{ 
        mr: 2, 
        fontSize: 28,
        color: theme.success 
      }} />
      <Typography variant="h6" fontWeight="bold" sx={{ color: theme.success }}>
        Secure Payment
      </Typography>
    </Box>
    
    <Typography variant="body2" color={theme.textSecondary} mb={2} lineHeight={1.6}>
      Your payment is protected by industry-leading security measures:
    </Typography>
    
    <List dense>
      <ListItem sx={{ px: 0, py: 0.5 }}>
        <ListItemIcon sx={{ minWidth: 32 }}>
          <LockIcon sx={{ fontSize: 20, color: theme.success }} />
        </ListItemIcon>
        <ListItemText 
          primary="256-bit SSL Encryption"
          primaryTypographyProps={{ 
            fontSize: '0.9rem', 
            fontWeight: 500,
            color: theme.textPrimary 
          }}
        />
      </ListItem>
      
      <ListItem sx={{ px: 0, py: 0.5 }}>
        <ListItemIcon sx={{ minWidth: 32 }}>
          <SecurityIcon sx={{ fontSize: 20, color: theme.success }} />
        </ListItemIcon>
        <ListItemText 
          primary="PCI DSS Compliant"
          primaryTypographyProps={{ 
            fontSize: '0.9rem', 
            fontWeight: 500,
            color: theme.textPrimary 
          }}
        />
      </ListItem>
      
      <ListItem sx={{ px: 0, py: 0.5 }}>
        <ListItemIcon sx={{ minWidth: 32 }}>
          <CheckIcon sx={{ fontSize: 20, color: theme.success }} />
        </ListItemIcon>
        <ListItemText 
          primary="Stripe Secured"
          primaryTypographyProps={{ 
            fontSize: '0.9rem', 
            fontWeight: 500,
            color: theme.textPrimary 
          }}
        />
      </ListItem>
    </List>
  </CardContent>
</Card>

      {/* Payment Summary */}
      <Card 
  elevation={3}
  sx={{ 
    mb: 3, 
    borderRadius: 3,
    backgroundColor: theme.paperBackground,
    border: `1px solid ${theme.border}`,
    boxShadow: theme.shadows?.medium || '0 4px 6px rgba(0, 0, 0, 0.1)'
  }}
>
  <CardContent sx={{ p: 3 }}>
    <Box display="flex" alignItems="center" mb={2}>
      <ReceiptIcon sx={{ 
        mr: 2, 
        fontSize: 28,
        color: theme.primary 
      }} />
      <Typography variant="h5" fontWeight="bold" sx={{ color: theme.primary }}>
        Booking Summary
      </Typography>
    </Box>
    
    <Box sx={{ 
      backgroundColor: theme.surfaceBackground,
      borderRadius: 2,
      p: 2,
      mb: 3
    }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <Box display="flex" alignItems="center" mb={1.5}>
            <PersonIcon sx={{ mr: 1.5, color: theme.textSecondary, fontSize: 20 }} />
            <Box>
              <Typography variant="body2" sx={{ color: theme.textSecondary, fontWeight: 500 }}>
                Guest Name
              </Typography>
              <Typography variant="body1" fontWeight={600} color={theme.textPrimary}>
                {booking?.first_name} {booking?.last_name}
              </Typography>
            </Box>
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={8}>
          <Box display="flex" alignItems="center" mb={1.5}>
            <LocationIcon sx={{ mr: 1.5, color: theme.textSecondary, fontSize: 20 }} />
            <Box>
              <Typography variant="body2" sx={{ color: theme.textSecondary, fontWeight: 500 }}>
                Property
              </Typography>
              <Typography variant="body1" fontWeight={600} color={theme.textPrimary}>
                {booking?.property_address}
              </Typography>
            </Box>
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Box display="flex" alignItems="center" mb={1.5}>
            <CalendarIcon sx={{ mr: 1.5, color: theme.textSecondary, fontSize: 20 }} />
            <Box>
              <Typography variant="body2" sx={{ color: theme.textSecondary, fontWeight: 500 }}>
                Check-in Date
              </Typography>
              <Typography variant="body1" fontWeight={600} color={theme.textPrimary}>
                {booking?.check_in_date}
              </Typography>
            </Box>
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={8}>
          <Box display="flex" alignItems="center" mb={1.5}>
            <CalendarIcon sx={{ mr: 1.5, color: theme.textSecondary, fontSize: 20 }} />
            <Box>
              <Typography variant="body2" sx={{ color: theme.textSecondary, fontWeight: 500 }}>
                Check-out Date
              </Typography>
              <Typography variant="body1" fontWeight={600} color={theme.textPrimary}>
                {booking?.check_out_date}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
    
    <Divider sx={{ my: 2, borderColor: theme.divider }} />
    
    <Box sx={{
      backgroundColor: `${theme.primary}20`,
      borderRadius: 2,
      p: 2,
      border: `1px solid ${theme.primary}40`
    }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center">
          <MoneyIcon sx={{ mr: 1.5, color: theme.primary, fontSize: 24 }} />
          <Typography variant="h6" fontWeight="bold" sx={{ color: theme.primary }}>
            Advance Payment
          </Typography>
        </Box>
        <Typography variant="h4" fontWeight="bold" sx={{ color: theme.primary }}>
          LKR {booking?.advance_amount?.toLocaleString() || '0'}
        </Typography>
      </Box>
    </Box>
  </CardContent>
</Card>

      {/* Pay Button */}
      <Button
        type="submit"
        variant="contained"
        size="large"
        fullWidth
        disabled={processing || !stripe}
        startIcon={processing ? <CircularProgress size={20} /> : <LockIcon />}
        sx={{
          py: 2,
          px: 4,
          fontSize: '1.1rem',
          fontWeight: 600,
          borderRadius: 2,
          backgroundColor: theme.primary,
          '&:hover': {
            backgroundColor: theme.primary,
            opacity: 0.9
          }
        }}
      >
        {processing ? (
          <>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            Processing Payment...
          </>
        ) : (
          <>
            Pay LKR {booking?.advance_amount?.toLocaleString()} Securely
          </>
        )}
      </Button>
    </Box>
  );
};

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [files, setFiles] = useState({ payment_receipt: null, nic_document: null });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    if (!bookingId) {
      setError('Invalid booking ID');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const bookingData = await getBookingDetails(bookingId);
      setBooking(bookingData);
    } catch (error) {
      setError(error.message || 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a valid image file (JPG, PNG, WEBP) or PDF document');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      setFiles(prev => ({ ...prev, [type]: file }));
      setError('');
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
      const formData = new FormData();
      formData.append('paymentReceipt', files.payment_receipt);
      formData.append('nicPhoto', files.nic_document);

      await uploadBookingDocuments(booking.id, formData);
      setSuccess('Documents uploaded successfully! Your payment is being processed.');
      
      setTimeout(() => {
        navigate('/user/bookings');
      }, 2000);

    } catch (error) {
      setError(error.message || 'Failed to upload documents. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleStripeSuccess = (paymentIntent) => {
    setSuccess('Payment completed successfully!');
    setTimeout(() => {
      navigate('/user/bookings');
    }, 2000);
  };

  const handleStripeError = (error) => {
    setError(error);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={48} />
      </Container>
    );
  }

  if (error && !booking) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button onClick={() => navigate('/user/bookings')} variant="contained">
          Back to Bookings
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Left Column - Booking Details */}
        <Grid item xs={12} lg={5}>
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
            Complete Your Payment
          </Typography>

          {/* Booking Summary Card */}
          <Card sx={{ mb: 3, border: `1px solid ${theme.border}` }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoIcon sx={{ color: theme.primary }} />
                Booking Summary
              </Typography>

              <List sx={{ py: 0 }}>
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <LocationIcon sx={{ color: theme.textSecondary }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Property"
                    secondary={booking?.property_title || booking?.property_address || 'Property Details'}
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                </ListItem>

                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <PersonIcon sx={{ color: theme.textSecondary }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Guest"
                    secondary={`${booking?.first_name || ''} ${booking?.last_name || ''}`}
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                </ListItem>

                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <CalendarIcon sx={{ color: theme.textSecondary }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Check-in & Check-out"
                    secondary={`${booking?.check_in_date || ''} - ${booking?.check_out_date || ''}`}
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                </ListItem>

                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <MoneyIcon sx={{ color: theme.success }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Advance Payment"
                    secondary={`LKR ${booking?.advance_amount?.toLocaleString() || '0'}`}
                    primaryTypographyProps={{ fontWeight: 500, color: theme.success }}
                    secondaryTypographyProps={{ fontWeight: 600, fontSize: '1.1rem', color: theme.success }}
                  />
                </ListItem>
              </List>

              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Total Amount
                </Typography>
                <Typography variant="h5" sx={{ color: theme.primary, fontWeight: 700 }}>
                  LKR {booking?.advance_amount?.toLocaleString() || '0'}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Payment Security Info */}
          <Paper sx={{ p: 3, backgroundColor: theme.surfaceBackground, border: `1px solid ${theme.border}` }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <SecurityIcon sx={{ color: theme.success }} />
              Secure Payment
            </Typography>
            <Typography variant="body2" sx={{ color: theme.textSecondary, mb: 2 }}>
              Your payment is protected by industry-leading security measures:
            </Typography>
            <List dense sx={{ py: 0 }}>
              <ListItem sx={{ px: 0, py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckIcon sx={{ color: theme.success, fontSize: 16 }} />
                </ListItemIcon>
                <ListItemText
                  primary="256-bit SSL encryption"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
              <ListItem sx={{ px: 0, py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckIcon sx={{ color: theme.success, fontSize: 16 }} />
                </ListItemIcon>
                <ListItemText
                  primary="PCI DSS compliant processing"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
              <ListItem sx={{ px: 0, py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckIcon sx={{ color: theme.success, fontSize: 16 }} />
                </ListItemIcon>
                <ListItemText
                  primary="Card details never stored"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Right Column - Payment Methods */}
        <Grid item xs={12} lg={7}>
          <Card sx={{ border: `1px solid ${theme.border}` }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Select Payment Method
              </Typography>

              {/* Payment Method Selection */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Card 
                    variant="outlined"
                    sx={{ 
                      cursor: 'pointer',
                      border: 2,
                      borderColor: paymentMethod === 'stripe' ? 'primary.main' : 'divider',
                      backgroundColor: paymentMethod === 'stripe' ? `${theme.primary}10` : 'transparent',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: `${theme.primary}05`
                      }
                    }}
                    onClick={() => setPaymentMethod('stripe')}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <CreditCardIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Card Payment
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Instant & Secure with Stripe
                      </Typography>
                      {paymentMethod === 'stripe' && (
                        <Chip 
                          label="Recommended" 
                          size="small" 
                          color="primary" 
                          sx={{ mt: 1 }} 
                        />
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Card 
                    variant="outlined"
                    sx={{ 
                      cursor: 'pointer',
                      border: 2,
                      borderColor: paymentMethod === 'receipt' ? 'primary.main' : 'divider',
                      backgroundColor: paymentMethod === 'receipt' ? `${theme.primary}10` : 'transparent',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: `${theme.primary}05`
                      }
                    }}
                    onClick={() => setPaymentMethod('receipt')}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <ReceiptIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Upload Receipt
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Manual verification required
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Payment Content */}
              {paymentMethod === 'stripe' && booking && (
                <Box>
                  <Elements stripe={stripePromise}>
                    <ProfessionalStripeForm
                      booking={booking}
                      onSuccess={handleStripeSuccess}
                      onError={handleStripeError}
                    />
                  </Elements>
                </Box>
              )}

              {paymentMethod === 'receipt' && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>Upload Payment Documents</Typography>
                  <Alert severity="info" sx={{ mb: 3 }}>
                    Make your payment to the property owner and upload both your payment receipt and NIC for verification.
                  </Alert>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ 
                        textAlign: 'center', 
                        p: 3, 
                        border: `2px dashed ${theme.border}`,
                        '&:hover': {
                          borderColor: theme.primary,
                          backgroundColor: `${theme.primary}05`
                        }
                      }}>
                        <ReceiptIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                          Payment Receipt
                        </Typography>
                        <Input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileChange(e, 'payment_receipt')}
                          sx={{ mb: 1 }}
                        />
                        {files.payment_receipt && (
                          <Chip 
                            label={files.payment_receipt.name}
                            color="success"
                            size="small"
                            icon={<CheckIcon />}
                            sx={{ mt: 1 }}
                          />
                        )}
                      </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ 
                        textAlign: 'center', 
                        p: 3, 
                        border: `2px dashed ${theme.border}`,
                        '&:hover': {
                          borderColor: theme.primary,
                          backgroundColor: `${theme.primary}05`
                        }
                      }}>
                        <PhotoCameraIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                          NIC Document
                        </Typography>
                        <Input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileChange(e, 'nic_document')}
                          sx={{ mb: 1 }}
                        />
                        {files.nic_document && (
                          <Chip 
                            label={files.nic_document.name}
                            color="success"
                            size="small"
                            icon={<CheckIcon />}
                            sx={{ mt: 1 }}
                          />
                        )}
                      </Paper>
                    </Grid>
                  </Grid>

                  <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleReceiptUpload}
                      disabled={!files.payment_receipt || !files.nic_document || uploading}
                      startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
                      sx={{
                        py: 2,
                        px: 4,
                        fontSize: '1.1rem',
                        fontWeight: 600
                      }}
                    >
                      {uploading ? 'Uploading Documents...' : 'Submit Payment Proof'}
                    </Button>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Error and Success Messages */}
          {error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mt: 3 }}>
              {success}
            </Alert>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default PaymentPage;