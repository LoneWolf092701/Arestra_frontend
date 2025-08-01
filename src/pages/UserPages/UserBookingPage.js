import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  TextField,
  Button,
  Box,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Divider,
  Paper,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  DatePicker,
  LocalizationProvider
} from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import {
  ExpandMore as ExpandMoreIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  LocationOn as LocationOnIcon,
  CalendarToday as CalendarTodayIcon,
  People as PeopleIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { getPublicPropertyById } from '../../api/propertyApi';
import { getUserProfile } from '../../api/profileApi';
import { submitBookingRequest, getPropertyAvailabilityStatus } from '../../api/bookingApi';
import { 
  calculateBookingPricing, 
  validateBookingDates, 
  formatPricingBreakdown,
  checkDateConflicts
} from '../../utils/BookingCalculationUtils';
import AppSnackbar from '../../components/common/AppSnackbar';

const steps = ['Select Dates', 'Personal Details', 'Review & Confirm'];

// Helper function to safely parse JSON
const safeParse = (str) => {
  try {
    return typeof str === 'string' ? JSON.parse(str) : (str || []);
  } catch (error) {
    return [];
  }
};

const UserBookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [activeStep, setActiveStep] = useState(0);
  const [property, setProperty] = useState(null);
  const [propertyStatus, setPropertyStatus] = useState(null);
  const [existingBookings, setExistingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
  // Booking form state
  const [bookingDates, setBookingDates] = useState({
    checkIn: null,
    checkOut: null
  });
  
  const [personalDetails, setPersonalDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+94',
    mobileNumber: '',
    birthdate: null,
    gender: '',
    nationality: '',
    occupation: '',
    field: '',
    destination: '',
    relocationDetails: ''
  });
  
  const [pricingBreakdown, setPricingBreakdown] = useState(null);
  const [dateValidation, setDateValidation] = useState({ isValid: false, errors: [], warnings: [] });
  const [competitionInfo, setCompetitionInfo] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(false);

  // Load property details and availability status
  useEffect(() => {
    const loadPropertyData = async () => {
      try {
        setLoading(true);
        
        // Load property details
        const propertyData = await getPublicPropertyById(id);
        setProperty(propertyData);
        
        // Load property availability status
        const statusData = await getPropertyAvailabilityStatus(id);
        setPropertyStatus(statusData);
        setExistingBookings(statusData.confirmed_bookings || []);
        
        // Set competition warning if needed
        if (statusData.statistics?.pending_requests > 0) {
          setCompetitionInfo({
            count: statusData.statistics.pending_requests,
            message: statusData.status_message
          });
        }
        
      } catch (error) {
        console.error('Error loading property data:', error);
        setSnackbar({
          open: true,
          message: 'Error loading property details. Please try again.',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadPropertyData();
    }
  }, [id]);

  // Load user profile data to pre-populate form
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const userProfile = await getUserProfile(token);
        setPersonalDetails(prev => ({
          ...prev,
          firstName: userProfile.firstName || '',
          lastName: userProfile.lastName || '',
          email: userProfile.email || '',
          mobileNumber: userProfile.phone || '',
          birthdate: userProfile.birthdate ? dayjs(userProfile.birthdate).toDate() : null,
          gender: userProfile.gender || '',
          nationality: userProfile.nationality || ''
        }));
      } catch (error) {
        console.error('Error loading user profile:', error);
        // Continue with empty form if profile loading fails
      }
    };

    loadUserProfile();
  }, []);

  // Calculate pricing when dates change
  useEffect(() => {
    if (bookingDates.checkIn && bookingDates.checkOut && property) {
      // Validate dates first
      const validation = validateBookingDates(bookingDates.checkIn, bookingDates.checkOut);
      setDateValidation(validation);
      
      if (validation.isValid) {
        // Calculate pricing
        const pricing = calculateBookingPricing({
          monthlyRent: parseFloat(property.price) || 0,
          checkInDate: bookingDates.checkIn,
          checkOutDate: bookingDates.checkOut,
          serviceFee: 300
        });
        
        setPricingBreakdown(pricing);
        
        // Check for conflicts with existing bookings
        const conflicts = checkDateConflicts(
          bookingDates.checkIn, 
          bookingDates.checkOut, 
          existingBookings
        );
        
        if (conflicts.hasConflicts) {
          setDateValidation(prev => ({
            ...prev,
            errors: [...prev.errors, 'Selected dates conflict with existing bookings']
          }));
        }
        
        if (conflicts.hasPendingRequests) {
          setCompetitionInfo({
            count: conflicts.pendingCount,
            message: `${conflicts.pendingCount} other guest${conflicts.pendingCount > 1 ? 's have' : ' has'} requested overlapping dates`
          });
        }
      } else {
        setPricingBreakdown(null);
      }
    }
  }, [bookingDates.checkIn, bookingDates.checkOut, property, existingBookings]);

  // Handle step navigation
  const handleNext = () => {
    if (activeStep === 0) {
      // Validate dates before proceeding
      if (!dateValidation.isValid || !pricingBreakdown) {
        setSnackbar({
          open: true,
          message: 'Please select valid check-in and check-out dates',
          severity: 'error'
        });
        return;
      }
    } else if (activeStep === 1) {
      // Validate personal details
      const requiredFields = ['firstName', 'lastName', 'email', 'mobileNumber'];
      const missingFields = requiredFields.filter(field => !personalDetails[field]);
      
      if (missingFields.length > 0) {
        setSnackbar({
          open: true,
          message: 'Please fill in all required personal details',
          severity: 'error'
        });
        return;
      }
    }
    
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  // Handle booking submission
  const handleSubmitBooking = async () => {
    try {
      setSubmitting(true);
      
      const bookingData = {
        propertyId: parseInt(id),
        checkInDate: bookingDates.checkIn.toISOString().split('T')[0],
        checkOutDate: bookingDates.checkOut.toISOString().split('T')[0],
        personalDetails,
        pricingBreakdown
      };
      
      const response = await submitBookingRequest(bookingData);
      
      setSnackbar({
        open: true,
        message: response.message || 'Booking request submitted successfully!',
        severity: 'success'
      });
      
      // Show competition warning if applicable
      if (response.competition_warning) {
        setTimeout(() => {
          setSnackbar({
            open: true,
            message: response.competition_warning,
            severity: 'warning'
          });
        }, 2000);
      }
      
      // Navigate to bookings page after delay
      setTimeout(() => {
        navigate('/user/bookings');
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting booking:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Error submitting booking request',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
      setConfirmDialog(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (!property) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          Property not found or not available for booking.
        </Alert>
      </Container>
    );
  }

  // Check if property can be booked
  const canBook = propertyStatus?.can_book && 
    !['unavailable', 'expired'].includes(propertyStatus?.availability_status);

  if (!canBook) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning">
          <Typography variant="h6" gutterBottom>
            Property Not Available for Booking
          </Typography>
          <Typography>
            {propertyStatus?.status_message || 'This property is currently not available for booking.'}
          </Typography>
          <Button 
            variant="outlined" 
            sx={{ mt: 2 }}
            onClick={() => navigate(`/property/${id}`)}
          >
            View Property Details
          </Button>
        </Alert>
      </Container>
    );
  }

  const amenities = safeParse(property.amenities);
  const facilities = safeParse(property.facilities);
  const images = safeParse(property.images);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          Book Your Stay
        </Typography>

        {/* Competition Warning */}
        {competitionInfo && (
          <Alert 
            severity="warning" 
            icon={<PeopleIcon />}
            sx={{ mb: 3 }}
          >
            <Typography variant="body2">
              <strong>High Demand Property:</strong> {competitionInfo.message}
            </Typography>
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Left Column - Property Info */}
          <Grid item xs={12} md={4}>
            <Card sx={{ position: 'sticky', top: 20 }}>
              <CardMedia
                component="img"
                height="200"
                image={images[0]?.url || 'https://via.placeholder.com/400x200'}
                alt={property.property_type}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {property.property_type} - {property.unit_type}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOnIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {property.address}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <HomeIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {facilities.Bedroom || 0} bed • {facilities.Bathroom || 0} bath
                  </Typography>
                </Box>

                <Chip 
                  label={propertyStatus?.status_message || 'Available'}
                  color={propertyStatus?.availability_status === 'available' ? 'success' : 'warning'}
                  size="small"
                  sx={{ mb: 2 }}
                />

                <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                  LKR {parseInt(property.price).toLocaleString()}/month
                </Typography>

                {/* Pricing Breakdown */}
                {pricingBreakdown && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Pricing Breakdown
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    {pricingBreakdown.breakdown.isSpecialRate && (
                      <Alert severity="info" sx={{ mb: 2, fontSize: '0.8rem' }}>
                        {formatPricingBreakdown(pricingBreakdown).specialRateMessage}
                      </Alert>
                    )}
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Duration:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {formatPricingBreakdown(pricingBreakdown).durationText}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Rent:</Typography>
                      <Typography variant="body2">
                        {formatPricingBreakdown(pricingBreakdown).subtotalText}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Service Fee:</Typography>
                      <Typography variant="body2">
                        {formatPricingBreakdown(pricingBreakdown).serviceFeeText}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h6" fontWeight="bold">Total:</Typography>
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        {formatPricingBreakdown(pricingBreakdown).totalText}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column - Booking Form */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              {/* Stepper */}
              <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {/* Step Content */}
              {activeStep === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Select Your Dates
                  </Typography>
                  
                  <Grid container spacing={3} sx={{ mt: 2 }}>
                    <Grid item xs={12} sm={6}>
                      <DatePicker
                        label="Check-in Date"
                        value={bookingDates.checkIn ? dayjs(bookingDates.checkIn) : null}
                        onChange={(newValue) => 
                          setBookingDates(prev => ({ ...prev, checkIn: newValue ? newValue.toDate() : null }))
                        }
                        minDate={dayjs()}
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <DatePicker
                        label="Check-out Date"
                        value={bookingDates.checkOut ? dayjs(bookingDates.checkOut) : null}
                        onChange={(newValue) => 
                          setBookingDates(prev => ({ ...prev, checkOut: newValue ? newValue.toDate() : null }))
                        }
                        minDate={bookingDates.checkIn ? dayjs(bookingDates.checkIn) : dayjs()}
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    </Grid>
                  </Grid>

                  {/* Date Validation Messages */}
                  {dateValidation.errors.length > 0 && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {dateValidation.errors.map((error, index) => (
                        <Typography key={index} variant="body2">
                          {error}
                        </Typography>
                      ))}
                    </Alert>
                  )}

                  {dateValidation.warnings.length > 0 && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      {dateValidation.warnings.map((warning, index) => (
                        <Typography key={index} variant="body2">
                          {warning}
                        </Typography>
                      ))}
                    </Alert>
                  )}
                </Box>
              )}

              {activeStep === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Personal Details
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="First Name"
                        required
                        fullWidth
                        value={personalDetails.firstName}
                        onChange={(e) => setPersonalDetails(prev => ({ 
                          ...prev, firstName: e.target.value 
                        }))}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Last Name"
                        required
                        fullWidth
                        value={personalDetails.lastName}
                        onChange={(e) => setPersonalDetails(prev => ({ 
                          ...prev, lastName: e.target.value 
                        }))}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        label="Email"
                        type="email"
                        required
                        fullWidth
                        value={personalDetails.email}
                        onChange={(e) => setPersonalDetails(prev => ({ 
                          ...prev, email: e.target.value 
                        }))}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Mobile Number"
                        required
                        fullWidth
                        value={personalDetails.mobileNumber}
                        onChange={(e) => setPersonalDetails(prev => ({ 
                          ...prev, mobileNumber: e.target.value 
                        }))}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Gender</InputLabel>
                        <Select
                          value={personalDetails.gender}
                          onChange={(e) => setPersonalDetails(prev => ({ 
                            ...prev, gender: e.target.value 
                          }))}
                        >
                          <MenuItem value="male">Male</MenuItem>
                          <MenuItem value="female">Female</MenuItem>
                          <MenuItem value="other">Other</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Nationality"
                        fullWidth
                        value={personalDetails.nationality}
                        onChange={(e) => setPersonalDetails(prev => ({ 
                          ...prev, nationality: e.target.value 
                        }))}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Occupation"
                        fullWidth
                        value={personalDetails.occupation}
                        onChange={(e) => setPersonalDetails(prev => ({ 
                          ...prev, occupation: e.target.value 
                        }))}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        label="Purpose of Stay"
                        fullWidth
                        multiline
                        rows={3}
                        value={personalDetails.relocationDetails}
                        onChange={(e) => setPersonalDetails(prev => ({ 
                          ...prev, relocationDetails: e.target.value 
                        }))}
                        placeholder="Please describe the purpose of your stay..."
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}

              {activeStep === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Review & Confirm
                  </Typography>
                  
                  {/* Booking Summary */}
                  <Alert severity="info" sx={{ mt: 2, mb: 3 }}>
                    <Typography variant="body2">
                      <strong>Please review your booking details carefully.</strong> 
                      Once submitted, you will need to wait for the property owner's approval.
                    </Typography>
                  </Alert>

                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Booking Details
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">Check-in:</Typography>
                          <Typography variant="body1">
                            {bookingDates.checkIn?.toLocaleDateString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">Check-out:</Typography>
                          <Typography variant="body1">
                            {bookingDates.checkOut?.toLocaleDateString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">Duration:</Typography>
                          <Typography variant="body1">
                            {pricingBreakdown && formatPricingBreakdown(pricingBreakdown).durationText}
                          </Typography>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>

                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Personal Information
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">Name:</Typography>
                          <Typography variant="body1">
                            {personalDetails.firstName} {personalDetails.lastName}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">Email:</Typography>
                          <Typography variant="body1">{personalDetails.email}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">Mobile:</Typography>
                          <Typography variant="body1">{personalDetails.mobileNumber}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">Nationality:</Typography>
                          <Typography variant="body1">{personalDetails.nationality || 'Not specified'}</Typography>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>

                  {/* Competition Warning */}
                  {competitionInfo && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        <strong>Competition Notice:</strong> {competitionInfo.message}. 
                        The property owner will review all requests and choose which one to approve.
                      </Typography>
                    </Alert>
                  )}
                </Box>
              )}

              {/* Navigation Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  onClick={handleBack}
                  disabled={activeStep === 0}
                  variant="outlined"
                >
                  Back
                </Button>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {activeStep === steps.length - 1 ? (
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => setConfirmDialog(true)}
                      disabled={!dateValidation.isValid || submitting}
                      startIcon={submitting ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                    >
                      {submitting ? 'Submitting...' : 'Submit Booking Request'}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={
                        (activeStep === 0 && (!dateValidation.isValid || !pricingBreakdown)) ||
                        (activeStep === 1 && (!personalDetails.firstName || !personalDetails.lastName || !personalDetails.email || !personalDetails.mobileNumber))
                      }
                    >
                      Next
                    </Button>
                  )}
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Confirmation Dialog */}
        <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <WarningIcon sx={{ mr: 1, color: 'warning.main' }} />
              Confirm Booking Request
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              Are you sure you want to submit this booking request?
            </Typography>
            
            {pricingBreakdown && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>Final Amount:</Typography>
                <Typography variant="h5" color="primary" fontWeight="bold">
                  {formatPricingBreakdown(pricingBreakdown).totalText}
                </Typography>
              </Box>
            )}
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              After submission, you'll need to wait for the property owner to approve your request 
              and provide payment instructions.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitBooking} 
              variant="contained"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Confirm & Submit'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <AppSnackbar
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        />
      </Container>
    </LocalizationProvider>
  );
};

export default UserBookingPage;