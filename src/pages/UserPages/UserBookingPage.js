import React, { useState, useEffect } from "react";
import {
  Container,
  Stepper,
  Step,
  StepLabel,
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Divider,
  Alert,
  Checkbox,
  IconButton,
  LinearProgress,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PaymentIcon from '@mui/icons-material/Payment';
import { useTheme } from '../../contexts/ThemeContext';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getPropertyById } from '../../api/propertyApi';

const UserBookingPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const { theme, isDark } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Property and booking state
  const [property, setProperty] = useState(null);
  const [bookingRequest, setBookingRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Get dates from URL parameters if coming from property view
  const urlParams = new URLSearchParams(location.search);
  const [bookingDates, setBookingDates] = useState({
    checkIn: urlParams.get('from') || '',
    checkOut: urlParams.get('to') || ''
  });

  // Form states
  const [personalDetails, setPersonalDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+94',
    mobileNumber: '',
    birthdate: '',
    gender: '',
    nationality: '',
    occupation: '',
    field: '',
    destination: '',
    relocationDetails: ''
  });

  const [paymentDetails, setPaymentDetails] = useState({
    paymentProof: null,
    verificationDocument: '',
    verificationFile: null,
    agreeTerms: false
  });

  const [successDialog, setSuccessDialog] = useState({ open: false, message: '', title: '' });

  const steps = ["Booking Overview", "Personal Details", "Waiting for Approval", "Payment & Documents"];

  // Calculate price details
  const calculatePricing = () => {
    if (!property || !bookingDates.checkIn || !bookingDates.checkOut) {
      return { monthlyRent: 0, serviceFee: 300, total: 300 };
    }

    const monthlyRent = property.price || 0;
    const serviceFee = 300;
    const total = monthlyRent + serviceFee;

    return { monthlyRent, serviceFee, total };
  };

  const pricing = calculatePricing();

  // Load property and check for existing booking request
  useEffect(() => {
    const loadPropertyAndBooking = async () => {
      try {
        setLoading(true);
        
        // Load property details
        const propertyData = await getPropertyById(id);
        if (propertyData && propertyData.length > 0) {
          setProperty(propertyData[0]);
        }

        // Check for existing booking request
        const token = localStorage.getItem('token');
        if (token) {
          const response = await fetch('/api/bookings/user-requests', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const requests = await response.json();
            const existingRequest = requests.find(req => 
              req.property_id === parseInt(id) && 
              ['pending', 'approved', 'payment_pending', 'payment_submitted'].includes(req.status)
            );
            
            if (existingRequest) {
              setBookingRequest(existingRequest);
              // Set appropriate step based on request status
              switch (existingRequest.status) {
                case 'pending':
                  setActiveStep(2); // Waiting for approval
                  break;
                case 'approved':
                  setActiveStep(3); // Can submit payment
                  break;
                case 'payment_submitted':
                  setActiveStep(3); // Payment submitted, waiting for confirmation
                  break;
                default:
                  setActiveStep(0);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load booking information');
      } finally {
        setLoading(false);
      }
    };

    loadPropertyAndBooking();
  }, [id]);

  const BookingSummary = () => (
    <Card 
      variant="outlined" 
      sx={{ 
        backgroundColor: theme.cardBackground,
        border: `1px solid ${theme.border}`,
        position: 'sticky',
        top: 20
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ color: theme.textPrimary, fontWeight: 600 }}>
          {property?.property_type} - {property?.unit_type}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {property?.address}
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ color: theme.textPrimary, mb: 2 }}>
            Booking Dates
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box sx={{ 
                p: 2, 
                backgroundColor: theme.surfaceBackground, 
                borderRadius: 1,
                textAlign: 'center'
              }}>
                <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                  Check In
                </Typography>
                <Typography variant="body2" sx={{ color: theme.textPrimary, fontWeight: 600 }}>
                  {bookingDates.checkIn || 'Not set'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ 
                p: 2, 
                backgroundColor: theme.surfaceBackground, 
                borderRadius: 1,
                textAlign: 'center'
              }}>
                <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                  Check Out
                </Typography>
                <Typography variant="body2" sx={{ color: theme.textPrimary, fontWeight: 600 }}>
                  {bookingDates.checkOut || 'Not set'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Alert severity="info" sx={{ mb: 3, fontSize: '0.875rem' }}>
          Payment is required only after owner approval
        </Alert>

        <Box>
          <Typography variant="subtitle2" sx={{ color: theme.textPrimary, mb: 2 }}>
            Price Breakdown
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Monthly Rent</Typography>
            <Typography variant="body2">LKR {pricing.monthlyRent.toLocaleString()}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body2">Service Fee</Typography>
            <Typography variant="body2">LKR {pricing.serviceFee.toLocaleString()}</Typography>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Total Amount</Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              LKR {pricing.total.toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const BookingLayout = ({ children }) => (
    <Grid container spacing={4}>
      <Grid item xs={12} md={7}>
        {children}
      </Grid>
      <Grid item xs={12} md={5}>
        <BookingSummary />
      </Grid>
    </Grid>
  );

  // Step 0: Booking Overview
  const BookingOverview = () => (
    <BookingLayout>
      <Card variant="outlined" sx={{ backgroundColor: theme.cardBackground }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ color: theme.textPrimary, fontWeight: 600 }}>
            Booking Process Overview
          </Typography>
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ color: theme.primary, mb: 2 }}>
              Step 1: Submit Your Request
            </Typography>
            <Box sx={{ pl: 2 }}>
              <Typography variant="body2" sx={{ mb: 1, color: theme.textSecondary }}>
                • Complete your personal details and booking information
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, color: theme.textSecondary }}>
                • Submit your booking request to the property owner
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: theme.textSecondary }}>
                • No payment required at this stage
              </Typography>
            </Box>

            <Typography variant="h6" sx={{ color: theme.primary, mb: 2 }}>
              Step 2: Wait for Owner Approval
            </Typography>
            <Box sx={{ pl: 2 }}>
              <Typography variant="body2" sx={{ mb: 1, color: theme.textSecondary }}>
                • The property owner will review your request
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, color: theme.textSecondary }}>
                • You'll receive a notification once they respond
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: theme.textSecondary }}>
                • If approved, payment account details will be provided
              </Typography>
            </Box>

            <Typography variant="h6" sx={{ color: theme.primary, mb: 2 }}>
              Step 3: Submit Payment & Documents
            </Typography>
            <Box sx={{ pl: 2 }}>
              <Typography variant="body2" sx={{ mb: 1, color: theme.textSecondary }}>
                • Make payment to the provided account details
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, color: theme.textSecondary }}>
                • Upload payment receipt and verification documents
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: theme.textSecondary }}>
                • Wait for final confirmation from the owner
              </Typography>
            </Box>
          </Box>

          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Your booking will be confirmed once the owner verifies your payment. 
              This process typically takes 1-2 business days.
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    </BookingLayout>
  );

  // Step 1: Personal Details Form
  const PersonalDetailsForm = () => (
    <BookingLayout>
      <Card variant="outlined" sx={{ backgroundColor: theme.cardBackground }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ color: theme.textPrimary, fontWeight: 600 }}>
            Personal Details
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="First Name *"
                variant="outlined"
                fullWidth
                value={personalDetails.firstName}
                onChange={(e) => setPersonalDetails(prev => ({...prev, firstName: e.target.value}))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Last Name *"
                variant="outlined"
                fullWidth
                value={personalDetails.lastName}
                onChange={(e) => setPersonalDetails(prev => ({...prev, lastName: e.target.value}))}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Email Address *"
                variant="outlined"
                type="email"
                fullWidth
                value={personalDetails.email}
                onChange={(e) => setPersonalDetails(prev => ({...prev, email: e.target.value}))}
                required
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Country Code"
                variant="outlined"
                fullWidth
                value={personalDetails.countryCode}
                onChange={(e) => setPersonalDetails(prev => ({...prev, countryCode: e.target.value}))}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                label="Mobile Number *"
                variant="outlined"
                fullWidth
                value={personalDetails.mobileNumber}
                onChange={(e) => setPersonalDetails(prev => ({...prev, mobileNumber: e.target.value}))}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Date of Birth *"
                type="date"
                variant="outlined"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={personalDetails.birthdate}
                onChange={(e) => setPersonalDetails(prev => ({...prev, birthdate: e.target.value}))}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl component="fieldset" sx={{ mt: 1 }}>
                <FormLabel component="legend" sx={{ color: theme.textPrimary }}>Gender *</FormLabel>
                <RadioGroup
                  row
                  value={personalDetails.gender}
                  onChange={(e) => setPersonalDetails(prev => ({...prev, gender: e.target.value}))}
                >
                  <FormControlLabel value="Male" control={<Radio />} label="Male" />
                  <FormControlLabel value="Female" control={<Radio />} label="Female" />
                  <FormControlLabel value="Other" control={<Radio />} label="Other" />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Nationality *"
                variant="outlined"
                fullWidth
                value={personalDetails.nationality}
                onChange={(e) => setPersonalDetails(prev => ({...prev, nationality: e.target.value}))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Occupation *"
                variant="outlined"
                fullWidth
                value={personalDetails.occupation}
                onChange={(e) => setPersonalDetails(prev => ({...prev, occupation: e.target.value}))}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Field of Work/Study *"
                variant="outlined"
                fullWidth
                value={personalDetails.field}
                onChange={(e) => setPersonalDetails(prev => ({...prev, field: e.target.value}))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Destination (University/Workplace)"
                variant="outlined"
                fullWidth
                placeholder="Optional"
                value={personalDetails.destination}
                onChange={(e) => setPersonalDetails(prev => ({...prev, destination: e.target.value}))}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Tell us about yourself"
                placeholder="Why are you relocating? Any additional information that might help the owner..."
                variant="outlined"
                multiline
                rows={4}
                fullWidth
                value={personalDetails.relocationDetails}
                onChange={(e) => setPersonalDetails(prev => ({...prev, relocationDetails: e.target.value}))}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ color: theme.textPrimary, mb: 2 }}>
                Booking Dates
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Check-in Date *"
                    type="date"
                    variant="outlined"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={bookingDates.checkIn}
                    onChange={(e) => setBookingDates(prev => ({...prev, checkIn: e.target.value}))}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Check-out Date *"
                    type="date"
                    variant="outlined"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={bookingDates.checkOut}
                    onChange={(e) => setBookingDates(prev => ({...prev, checkOut: e.target.value}))}
                    required
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </BookingLayout>
  );

  // Step 2: Waiting for Approval
  const WaitingForApproval = () => (
    <BookingLayout>
      <Card variant="outlined" sx={{ backgroundColor: theme.cardBackground }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <HourglassEmptyIcon sx={{ fontSize: 80, color: theme.warning, mb: 3 }} />
          
          <Typography variant="h5" gutterBottom sx={{ color: theme.textPrimary, fontWeight: 600 }}>
            Waiting for Owner Approval
          </Typography>
          
          <Typography variant="body1" sx={{ color: theme.textSecondary, mb: 4 }}>
            Your booking request has been submitted successfully. The property owner will review 
            your request and respond within 24-48 hours.
          </Typography>

          {bookingRequest && (
            <Box sx={{ 
              p: 3, 
              backgroundColor: theme.surfaceBackground, 
              borderRadius: 2,
              textAlign: 'left',
              mb: 3
            }}>
              <Typography variant="h6" sx={{ color: theme.primary, mb: 2 }}>
                Request Details
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Request ID:</strong> #{bookingRequest.id}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Submitted:</strong> {new Date(bookingRequest.created_at).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Status:</strong> {bookingRequest.status?.toUpperCase()}
              </Typography>
              <Typography variant="body2">
                <strong>Check-in:</strong> {bookingRequest.check_in_date} | <strong>Check-out:</strong> {bookingRequest.check_out_date}
              </Typography>
            </Box>
          )}

          <Alert severity="info">
            You will receive a notification once the owner responds to your request. 
            If approved, you'll be able to proceed to the payment step.
          </Alert>
        </CardContent>
      </Card>
    </BookingLayout>
  );

  // Step 3: Payment Form (only shown after approval)
  const PaymentForm = () => {
    const canSubmitPayment = bookingRequest?.status === 'approved';
    const paymentSubmitted = bookingRequest?.status === 'payment_submitted';

    return (
      <BookingLayout>
        <Card variant="outlined" sx={{ backgroundColor: theme.cardBackground }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: theme.textPrimary, fontWeight: 600 }}>
              Payment & Documents
            </Typography>

            {paymentSubmitted ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CheckCircleIcon sx={{ fontSize: 80, color: theme.success, mb: 3 }} />
                <Typography variant="h6" gutterBottom sx={{ color: theme.success }}>
                  Payment Submitted Successfully
                </Typography>
                <Typography variant="body1" sx={{ color: theme.textSecondary, mb: 3 }}>
                  Your payment and documents have been submitted. The property owner will verify 
                  your payment and confirm your booking.
                </Typography>
                <Alert severity="success">
                  You will receive a final confirmation once the owner verifies your payment.
                </Alert>
              </Box>
            ) : canSubmitPayment ? (
              <>
                {/* Payment Account Information */}
                {bookingRequest?.payment_account_info && (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      Payment Account Details:
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                      {bookingRequest.payment_account_info}
                    </Typography>
                  </Alert>
                )}

                {/* Upload Payment Proof */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: theme.textPrimary }}>
                    Upload Payment Proof
                  </Typography>
                  <Box sx={{ 
                    p: 3, 
                    border: `2px dashed ${theme.border}`,
                    borderRadius: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: theme.hover
                    }
                  }}>
                    <UploadFileIcon sx={{ fontSize: 48, color: theme.textSecondary, mb: 2 }} />
                    <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                      Upload payment receipt (JPG, PNG, or PDF - Max 5MB)
                    </Typography>
                    <Button variant="outlined" sx={{ mt: 2 }}>
                      Browse Files
                    </Button>
                  </Box>
                </Box>

                {/* Verification Documents */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: theme.textPrimary }}>
                    Verification Document
                  </Typography>
                  
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <TextField
                      select
                      label="Document Type"
                      value={paymentDetails.verificationDocument}
                      onChange={(e) => setPaymentDetails(prev => ({...prev, verificationDocument: e.target.value}))}
                      SelectProps={{ native: true }}
                    >
                      <option value="">Select Document Type</option>
                      <option value="nic">National Identity Card</option>
                      <option value="passport">Passport</option>
                      <option value="license">Driving License</option>
                    </TextField>
                  </FormControl>

                  <Box sx={{ 
                    p: 3, 
                    border: `2px dashed ${theme.border}`,
                    borderRadius: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: theme.hover
                    }
                  }}>
                    <UploadFileIcon sx={{ fontSize: 48, color: theme.textSecondary, mb: 2 }} />
                    <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                      Upload verification document
                    </Typography>
                    <Button variant="outlined" sx={{ mt: 2 }}>
                      Browse Files
                    </Button>
                  </Box>
                </Box>

                {/* Terms and Conditions */}
                <Box sx={{ mb: 3 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={paymentDetails.agreeTerms}
                        onChange={(e) => setPaymentDetails(prev => ({...prev, agreeTerms: e.target.checked}))}
                        color="primary"
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                        I agree with the Terms & Conditions and confirm the payment information is accurate
                      </Typography>
                    }
                  />
                </Box>
              </>
            ) : (
              <Alert severity="warning">
                Payment can only be submitted after the property owner approves your booking request.
              </Alert>
            )}
          </CardContent>
        </Card>
      </BookingLayout>
    );
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <BookingOverview />;
      case 1:
        return <PersonalDetailsForm />;
      case 2:
        return <WaitingForApproval />;
      case 3:
        return <PaymentForm />;
      default:
        return <Typography>Unknown step</Typography>;
    }
  };

  const validatePersonalDetails = () => {
    const required = ['firstName', 'lastName', 'email', 'mobileNumber', 'birthdate', 'gender', 'nationality', 'occupation', 'field'];
    const missing = required.filter(field => !personalDetails[field]);
    
    if (missing.length > 0) {
      setError(`Please fill in all required fields: ${missing.join(', ')}`);
      return false;
    }

    if (!bookingDates.checkIn || !bookingDates.checkOut) {
      setError('Please select both check-in and check-out dates');
      return false;
    }

    const checkIn = new Date(bookingDates.checkIn);
    const checkOut = new Date(bookingDates.checkOut);
    const today = new Date();

    if (checkIn <= today) {
      setError('Check-in date must be in the future');
      return false;
    }

    if (checkOut <= checkIn) {
      setError('Check-out date must be after check-in date');
      return false;
    }

    return true;
  };

  const handleNext = async () => {
    setError('');

    if (activeStep === 1) {
      // Submit booking request
      if (!validatePersonalDetails()) {
        return;
      }

      setSubmitting(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/bookings/request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            property_id: parseInt(id),
            ...personalDetails,
            check_in_date: bookingDates.checkIn,
            check_out_date: bookingDates.checkOut
          })
        });

        if (response.ok) {
          const result = await response.json();
          setBookingRequest(result);
          setActiveStep(2);
          setSuccessDialog({
            open: true,
            title: 'Request Submitted Successfully',
            message: 'Your booking request has been sent to the property owner. You will be notified once they respond.'
          });
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to submit booking request');
        }
      } catch (error) {
        console.error('Error submitting booking request:', error);
        setError('Network error. Please try again.');
      } finally {
        setSubmitting(false);
      }
    } else if (activeStep === 3) {
      // Submit payment (implement file upload logic here)
      if (!paymentDetails.agreeTerms) {
        setError('Please agree to the terms and conditions');
        return;
      }
      // Implementation for payment submission would go here
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0 && activeStep !== 2) {
      setActiveStep(prev => prev - 1);
    }
  };

  const getNextButtonText = () => {
    switch (activeStep) {
      case 0:
        return "Start Booking Process";
      case 1:
        return submitting ? "Submitting..." : "Submit Booking Request";
      case 2:
        return "Waiting for Approval";
      case 3:
        return "Submit Payment & Documents";
      default:
        return "Next";
    }
  };

  const isNextButtonDisabled = () => {
    switch (activeStep) {
      case 1:
        return submitting;
      case 2:
        return true; // Always disabled while waiting
      case 3:
        return !paymentDetails.agreeTerms || bookingRequest?.status !== 'approved';
      default:
        return false;
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      background: isDark 
        ? `linear-gradient(135deg, ${theme.background} 0%, ${theme.surfaceBackground} 50%, ${theme.background} 100%)`
        : `linear-gradient(135deg, ${theme.background} 0%, ${theme.primary}05 50%, ${theme.background} 100%)`,
      minHeight: '100vh',
      py: 4
    }}>
      <Container maxWidth="lg">
        <Typography variant="body2" sx={{ color: theme.textSecondary, mb: 2 }}>
          Home / Booking
        </Typography>

        {/* Stepper */}
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel
                  sx={{
                    '& .MuiStepLabel-label': {
                      color: activeStep === index ? theme.primary : theme.textSecondary,
                      fontWeight: activeStep === index ? 600 : 400,
                    },
                    '& .MuiStepIcon-root': {
                      color: activeStep >= index ? theme.primary : theme.textDisabled,
                    },
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
          
          <LinearProgress 
            variant="determinate" 
            value={(activeStep / (steps.length - 1)) * 100} 
            sx={{ 
              mt: 2, 
              height: 6, 
              borderRadius: 3,
              backgroundColor: theme.surfaceBackground,
              '& .MuiLinearProgress-bar': {
                backgroundColor: theme.primary,
              }
            }} 
          />
        </Box>

        {/* Step Content */}
        <Box sx={{ mb: 4 }}>
          {getStepContent(activeStep)}
        </Box>

        {/* Navigation Buttons */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Button
            disabled={activeStep === 0 || activeStep === 2}
            onClick={handleBack}
            variant="outlined"
            sx={{
              borderColor: theme.textSecondary,
              color: theme.textSecondary,
              '&:hover': {
                backgroundColor: `${theme.textSecondary}10`,
              },
              px: 4,
              py: 1.5
            }}
          >
            Back
          </Button>
          
          <Button 
            onClick={handleNext} 
            variant="contained" 
            disabled={isNextButtonDisabled()}
            sx={{
              backgroundColor: theme.primary,
              color: isDark ? theme.textPrimary : '#FFFFFF',
              '&:hover': {
                backgroundColor: theme.secondary,
              },
              px: 4,
              py: 1.5
            }}
          >
            {getNextButtonText()}
          </Button>
        </Box>

        {/* Success Dialog */}
        <Dialog open={successDialog.open} onClose={() => setSuccessDialog({ ...successDialog, open: false })}>
          <DialogTitle>{successDialog.title}</DialogTitle>
          <DialogContent>
            <Typography>{successDialog.message}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSuccessDialog({ ...successDialog, open: false })}>
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default UserBookingPage;