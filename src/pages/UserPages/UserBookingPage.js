import React, { useState, useEffect, useRef } from "react";
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
import { getUserProfile } from '../../api/profileApi';

const UserBookingPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const { theme, isDark } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Ref for first field focus - simple approach
  const firstFieldRef = useRef(null);

  // Property and booking state
  const [property, setProperty] = useState(null);
  const [bookingRequest, setBookingRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Get dates from URL parameters - fix parameter reading
  const urlParams = new URLSearchParams(location.search);
  const [bookingDates, setBookingDates] = useState(() => {
    // Check both possible parameter names for compatibility
    const checkIn = urlParams.get('checkIn') || urlParams.get('from') || '';
    const checkOut = urlParams.get('checkOut') || urlParams.get('to') || '';
    
    return { checkIn, checkOut };
  });

  // Form states - start with empty form, will be populated from API
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

  console.log("Property:", property);
  // Calculate pricing using property data from API
  const calculatePricing = () => {
    if (!property || !property.price) {
      return { monthlyRent: 0, serviceFee: 300, total: 300 };
    }

    // Use actual property price from database
    const monthlyRent = parseFloat(property.price) || 0;
    const serviceFee = 300; // Standard service fee
    const total = monthlyRent + serviceFee;

    return { monthlyRent, serviceFee, total };
  };

  const pricing = calculatePricing();

  // Load user profile data to pre-populate form - fixed API call
  const loadUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, using empty form');
        return;
      }

      console.log('Loading user profile...');
      const userProfile = await getUserProfile(token);
      console.log('User profile loaded:', userProfile);

      // Map profile data to form fields correctly
      setPersonalDetails(prev => ({
        ...prev,
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        email: userProfile.email || '',
        mobileNumber: userProfile.phone || '',
        birthdate: userProfile.birthdate || '',
        gender: userProfile.gender || '',
        nationality: userProfile.nationality || ''
        // Keep existing values for occupation, field, destination, relocationDetails
      }));

    } catch (error) {
      console.error('Error loading user profile:', error);
      // Continue with empty form if profile loading fails
    }
  };

  // Load property details using API call - fixed property loading
  const loadPropertyDetails = async () => {
    try {
      console.log('Loading property details for ID:', id);
      const propertyData = await getPropertyById(id);
      console.log('Property data received:', propertyData);

      if (propertyData) {
        setProperty(propertyData);
      } else {
        setError('Property not found');
      }
    } catch (error) {
      console.error('Error loading property:', error);
      setError('Failed to load property details');
    }
  };

  // Check for existing booking request
  const checkExistingBooking = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

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
              setActiveStep(2);
              break;
            case 'approved':
              setActiveStep(3);
              break;
            case 'payment_submitted':
              setActiveStep(3);
              break;
            default:
              setActiveStep(0);
          }
        }
      }
    } catch (error) {
      console.error('Error checking existing booking:', error);
    }
  };

  // Main data loading effect
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      
      try {
        // Load property details first (required)
        await loadPropertyDetails();
        
        // Load user profile (optional, for pre-filling form)
        await loadUserProfile();
        
        // Check for existing booking requests
        await checkExistingBooking();
        
      } catch (error) {
        console.error('Error in data loading:', error);
        setError('Failed to load booking information');
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [id]);

  // Simple focus management - only focus first field when step changes
  useEffect(() => {
    if (activeStep === 1 && firstFieldRef.current) {
      // Add small delay to ensure component is rendered
      setTimeout(() => {
        firstFieldRef.current.focus();
      }, 150);
    }
  }, [activeStep]);

  // Layout wrapper component
  const BookingLayout = ({ children }) => (
    <Grid container spacing={4}>
      <Grid item xs={12} md={8}>
        {children}
      </Grid>
      <Grid item xs={12} md={4}>
        <BookingSummary />
      </Grid>
    </Grid>
  );

  // Booking summary with proper property price display
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
          {property?.property_type || 'Property'} - {property?.unit_type || 'Unit'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {property?.address || 'Address not available'}
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

        <Divider sx={{ my: 2 }} />

        <Box>
          <Typography variant="subtitle2" sx={{ color: theme.textPrimary, mb: 2 }}>
            Pricing Details
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ color: theme.textSecondary }}>
              Monthly Rent
            </Typography>
            <Typography variant="body2" sx={{ color: theme.textPrimary }}>
              LKR {pricing.monthlyRent.toLocaleString()}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body2" sx={{ color: theme.textSecondary }}>
              Service Fee
            </Typography>
            <Typography variant="body2" sx={{ color: theme.textPrimary }}>
              LKR {pricing.serviceFee.toLocaleString()}
            </Typography>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="subtitle2" sx={{ color: theme.textPrimary, fontWeight: 600 }}>
              Total
            </Typography>
            <Typography variant="subtitle2" sx={{ color: theme.primary, fontWeight: 600 }}>
              LKR {pricing.total.toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  // Step 0: Booking Overview
  const BookingOverview = () => (
    <BookingLayout>
      <Card variant="outlined" sx={{ backgroundColor: theme.cardBackground }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <InfoIcon sx={{ color: theme.primary, mr: 2, fontSize: 32 }} />
            <Typography variant="h5" sx={{ color: theme.textPrimary, fontWeight: 600 }}>
              How the Booking Process Works
            </Typography>
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Please review the booking process below before proceeding with your request.
            </Typography>
          </Alert>

          <Typography variant="h6" sx={{ color: theme.primary, mb: 2 }}>
            Step 1: Submit Booking Request
          </Typography>
          <Box sx={{ pl: 2, mb: 3 }}>
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
          <Box sx={{ pl: 2, mb: 3 }}>
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

          <Alert severity="success" sx={{ mt: 3 }}>
            <Typography variant="body2">
              Your booking will be confirmed once the owner verifies your payment. 
              This process typically takes 1-2 business days.
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    </BookingLayout>
  );

  // Step 1: Personal Details Form - using normal TextField components
  const PersonalDetailsForm = () => (
    <BookingLayout>
      <Card variant="outlined" sx={{ backgroundColor: theme.cardBackground }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ color: theme.textPrimary, fontWeight: 600 }}>
            Personal Details
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, color: theme.textSecondary }}>
            Please provide your personal information for the booking request.
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
                // ref={firstFieldRef}
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
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email Address *"
                type="email"
                variant="outlined"
                fullWidth
                value={personalDetails.email}
                onChange={(e) => setPersonalDetails(prev => ({...prev, email: e.target.value}))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <TextField
                    label="Code"
                    variant="outlined"
                    fullWidth
                    value={personalDetails.countryCode}
                    onChange={(e) => setPersonalDetails(prev => ({...prev, countryCode: e.target.value}))}
                  />
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    label="Mobile Number *"
                    variant="outlined"
                    fullWidth
                    value={personalDetails.mobileNumber}
                    onChange={(e) => setPersonalDetails(prev => ({...prev, mobileNumber: e.target.value}))}
                    required
                  />
                </Grid>
              </Grid>
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
              <FormControl component="fieldset" fullWidth>
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
                label="Field of Work *"
                variant="outlined"
                fullWidth
                value={personalDetails.field}
                onChange={(e) => setPersonalDetails(prev => ({...prev, field: e.target.value}))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Destination/Purpose"
                variant="outlined"
                fullWidth
                value={personalDetails.destination}
                onChange={(e) => setPersonalDetails(prev => ({...prev, destination: e.target.value}))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Additional Information"
                placeholder="Any additional information that might help the owner..."
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
                    inputProps={{ min: new Date().toISOString().split('T')[0] }}
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
                    inputProps={{ min: bookingDates.checkIn || new Date().toISOString().split('T')[0] }}
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
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                Request ID: #{bookingRequest.id} | 
                Submitted: {new Date(bookingRequest.created_at).toLocaleDateString()}
              </Typography>
            </Alert>
          )}

          <Typography variant="body2" sx={{ color: theme.textSecondary }}>
            You'll receive a notification once the owner responds to your request.
          </Typography>
        </CardContent>
      </Card>
    </BookingLayout>
  );

  // Step 3: Payment Form
  const PaymentForm = () => (
    <BookingLayout>
      <Card variant="outlined" sx={{ backgroundColor: theme.cardBackground }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ color: theme.textPrimary, fontWeight: 600 }}>
            Payment & Documents
          </Typography>
          
          {bookingRequest?.status === 'approved' ? (
            <>
              <Alert severity="success" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  Congratulations! Your booking request has been approved.
                </Typography>
              </Alert>

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Payment Instructions</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Please make payment to the following account details:
                </Typography>
                <Alert severity="info">
                  <Typography variant="body2">
                    Payment account details will be provided by the property owner.
                  </Typography>
                </Alert>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ border: `2px dashed ${theme.border}`, p: 3, borderRadius: 1, textAlign: 'center' }}>
                    <UploadFileIcon sx={{ fontSize: 48, color: theme.textSecondary, mb: 1 }} />
                    <Typography variant="body2" sx={{ mb: 1 }}>Upload Payment Receipt</Typography>
                    <Button variant="outlined" component="label">
                      Choose File
                      <input type="file" hidden accept="image/*,application/pdf" 
                        onChange={(e) => setPaymentDetails(prev => ({...prev, paymentProof: e.target.files[0]}))}
                      />
                    </Button>
                    {paymentDetails.paymentProof && (
                      <Typography variant="body2" sx={{ mt: 1, color: theme.primary }}>
                        {paymentDetails.paymentProof.name}
                      </Typography>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ border: `2px dashed ${theme.border}`, p: 3, borderRadius: 1, textAlign: 'center' }}>
                    <UploadFileIcon sx={{ fontSize: 48, color: theme.textSecondary, mb: 1 }} />
                    <Typography variant="body2" sx={{ mb: 1 }}>Upload Verification Document</Typography>
                    <Button variant="outlined" component="label">
                      Choose File
                      <input type="file" hidden accept="image/*,application/pdf"
                        onChange={(e) => setPaymentDetails(prev => ({...prev, verificationFile: e.target.files[0]}))}
                      />
                    </Button>
                    {paymentDetails.verificationFile && (
                      <Typography variant="body2" sx={{ mt: 1, color: theme.primary }}>
                        {paymentDetails.verificationFile.name}
                      </Typography>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={paymentDetails.agreeTerms}
                        onChange={(e) => setPaymentDetails(prev => ({...prev, agreeTerms: e.target.checked}))}
                      />
                    }
                    label="I agree to the terms and conditions and confirm that all information provided is accurate."
                  />
                </Grid>
              </Grid>
            </>
          ) : (
            <Alert severity="warning">
              <Typography variant="body2">
                Please wait for the property owner to approve your request before proceeding with payment.
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>
    </BookingLayout>
  );

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
            first_name: personalDetails.firstName,
            last_name: personalDetails.lastName,
            email: personalDetails.email,
            country_code: personalDetails.countryCode,
            mobile_number: personalDetails.mobileNumber,
            birthdate: personalDetails.birthdate,
            gender: personalDetails.gender,
            nationality: personalDetails.nationality,
            occupation: personalDetails.occupation,
            field: personalDetails.field,
            destination: personalDetails.destination,
            relocation_details: personalDetails.relocationDetails,
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
      // Submit payment
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
                      color: activeStep >= index ? theme.primary : theme.textSecondary,
                    },
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Step Content */}
        {getStepContent(activeStep)}

        {/* Navigation Buttons */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0 || activeStep === 2}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={isNextButtonDisabled()}
            sx={{ minWidth: 200 }}
          >
            {getNextButtonText()}
          </Button>
        </Box>

        {/* Success Dialog */}
        <Dialog
          open={successDialog.open}
          onClose={() => setSuccessDialog({ open: false, message: '', title: '' })}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
              {successDialog.title}
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography>
              {successDialog.message}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSuccessDialog({ open: false, message: '', title: '' })}>
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default UserBookingPage;