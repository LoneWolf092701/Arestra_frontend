import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  DatePicker,
  LocalizationProvider
} from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
// import isBefore from 'dayjs/plugin/isBefore';
// import isAfter from 'dayjs/plugin/isAfter';
import {
  CalendarToday as CalendarTodayIcon,
  People as PeopleIcon,
  Home as HomeIcon,
  Payment as PaymentIcon,
  LocationOn as LocationOnIcon,
  Bed as BedIcon,
  Bathtub as BathtubIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  AccountBalance as AccountBalanceIcon,
  Receipt as ReceiptIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { getPublicPropertyById } from '../../api/propertyApi';
import { getUserProfile } from '../../api/profileApi';
import { submitBookingRequest } from '../../api/bookingApi';
import { calculateBookingPricing, formatCurrency } from '../../utils/BookingCalculationUtils';
import AppSnackbar from '../../components/common/AppSnackbar';
import { useTheme } from '../../contexts/ThemeContext';
import PaymentOptionsModal from '../../components/bookings/PaymentOptionsModal';


// Extend dayjs with required plugins
dayjs.extend(isSameOrBefore);
// dayjs.extend(isBefore);
// dayjs.extend(isAfter);

const steps = ['Booking Overview', 'Personal Details', 'Payment', 'Status'];

const UserBookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme, isDark } = useTheme();
  
  const [activeStep, setActiveStep] = useState(0);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [bookingApproved, setBookingApproved] = useState(false);
const [paymentAccountInfo, setPaymentAccountInfo] = useState('');
const [showPaymentModal, setShowPaymentModal] = useState(false);
const [currentBookingId, setCurrentBookingId] = useState(null);
  
  const [bookingData, setBookingData] = useState({
    check_in_date: null,
    check_out_date: null,
    number_of_guests: 1,
    special_requests: ''
  });
  
  const [personalDetails, setPersonalDetails] = useState({
    first_name: '',
    last_name: '',
    email: '',
    mobile_number: '',
    emergency_contact_name: '',
    emergency_contact_number: '',
    occupation: '',
    current_address: '',
    id_number: '',
    purpose_of_stay: ''
  });
  
  const [errors, setErrors] = useState({});
  const [pricingBreakdown, setPricingBreakdown] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (id) {
      loadPropertyAndUserData();
    }
  }, [id]);

  useEffect(() => {
    if (bookingData.check_in_date && bookingData.check_out_date && property) {
      calculatePricing();
    } else {
      setPricingBreakdown(null);
    }
  }, [bookingData.check_in_date, bookingData.check_out_date, property]);

  const loadPropertyAndUserData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const [propertyData, userProfile] = await Promise.all([
        getPublicPropertyById(id),
        getUserProfile().catch(() => null)
      ]);
      
      setProperty(propertyData);
      
      // Auto-fill user profile information when available
      if (userProfile) {
        console.log('Raw user profile data received:', JSON.stringify(userProfile, null, 2));
        
        // Extract profile data - handle both nested and flat structures
        const profileData = userProfile.profile || userProfile;
        const userData = userProfile.user || userProfile;
        
        console.log('Extracted profile data:', JSON.stringify(profileData, null, 2));
        console.log('Extracted user data:', JSON.stringify(userData, null, 2));
        
        // Build the auto-fill object
        const autoFillData = {
          first_name: profileData.first_name || userData.first_name || '',
          last_name: profileData.last_name || userData.last_name || '',
          email: userData.email || userProfile.email || profileData.email || '',
          mobile_number: profileData.phone || userData.phone || '',
          current_address: profileData.business_address || profileData.address || userData.address || '',
          occupation: profileData.occupation || profileData.business_type || '',
          id_number: profileData.id_number || profileData.national_id || userData.id_number || '',
          emergency_contact_name: profileData.emergency_contact_name || profileData.contact_person || '',
          emergency_contact_number: profileData.emergency_contact_number || '',
          purpose_of_stay: profileData.purpose_of_stay || ''
        };
        
        console.log('Auto-fill data being set:', JSON.stringify(autoFillData, null, 2));
        
        // Set the personal details state
        setPersonalDetails(autoFillData);
        
        // Count how many fields were auto-filled
        const filledFields = Object.values(autoFillData).filter(value => value && value.trim() !== '').length;
        
        if (filledFields > 0) {
          setSnackbar({
            open: true,
            message: `Profile information auto-filled (${filledFields} fields). Please review and update as needed.`,
            severity: 'info'
          });
        }
      } else {
        console.log('No user profile data available for auto-fill');
      }
        
        setSnackbar({
          open: true,
          message: 'Profile information auto-filled. Please review and update as needed.',
          severity: 'info'
        });
      
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load property details. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
  const checkBookingStatus = () => {
    // In a real app, this would be done via WebSocket or periodic API calls
    // For now, we'll check for updates in localStorage (you can implement real-time updates)
    const bookingStatus = localStorage.getItem(`booking_${currentBookingId}_status`);
    const accountInfo = localStorage.getItem(`booking_${currentBookingId}_account_info`);
    
    if (bookingStatus === 'approved' && accountInfo && !bookingApproved) {
      setBookingApproved(true);
      setPaymentAccountInfo(accountInfo);
      setShowPaymentModal(true);
    }
  };

  if (currentBookingId) {
    const interval = setInterval(checkBookingStatus, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }
}, [currentBookingId, bookingApproved]);

  const calculatePricing = () => {
    if (!property || !bookingData.check_in_date || !bookingData.check_out_date) {
      setPricingBreakdown(null);
      return;
    }

    const checkIn = dayjs(bookingData.check_in_date);
    const checkOut = dayjs(bookingData.check_out_date);
    const basePrice = parseFloat(property.price) || 0;

    try {
      const pricing = calculateBookingPricing({
        monthlyRent: basePrice,
        checkInDate: checkIn.toDate(),
        checkOutDate: checkOut.toDate(),
        serviceFee: 300
      });

      setPricingBreakdown(pricing);
    } catch (error) {
      console.error('Error calculating pricing:', error);
      setPricingBreakdown(null);
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 0) {
      if (!bookingData.check_in_date) {
        newErrors.check_in_date = 'Check-in date is required';
      }
      if (!bookingData.check_out_date) {
        newErrors.check_out_date = 'Check-out date is required';
      }
      
      if (bookingData.check_in_date && bookingData.check_out_date) {
        const checkIn = dayjs(bookingData.check_in_date);
        const checkOut = dayjs(bookingData.check_out_date);
        const today = dayjs().startOf('day');
        
        if (checkIn.isBefore(today)) {
          newErrors.check_in_date = 'Check-in date cannot be in the past';
        }
        
        if (checkOut.isSameOrBefore(checkIn)) {
          newErrors.check_out_date = 'Check-out date must be after check-in date';
        }
      }
    }
    
    if (step === 1) {
      const required = ['first_name', 'last_name', 'email', 'mobile_number', 'id_number'];
      
      required.forEach(field => {
        if (!personalDetails[field]?.trim()) {
          newErrors[field] = `${field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} is required`;
        }
      });

      if (personalDetails.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalDetails.email)) {
        newErrors.email = 'Please enter a valid email address';
      }

      if (personalDetails.mobile_number && !/^[\d\+\-\(\)\s]+$/.test(personalDetails.mobile_number)) {
        newErrors.mobile_number = 'Please enter a valid mobile number';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      if (activeStep === steps.length - 1) {
        handleSubmit();
      } else {
        setActiveStep(prev => prev + 1);
      }
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };
  
  const handleSubmit = async () => {
    if (!validateStep(1)) return;
    
    setSubmitting(true);
    
    try {
      const bookingRequest = {
        property_id: parseInt(id),
        ...bookingData,
        ...personalDetails,
        check_in_date: dayjs(bookingData.check_in_date).format('YYYY-MM-DD'),
        check_out_date: dayjs(bookingData.check_out_date).format('YYYY-MM-DD'),
        total_amount: pricingBreakdown?.total || 0,
        advance_amount: pricingBreakdown?.advanceAmount || 0
      };

      const response = await submitBookingRequest(bookingRequest);
      setCurrentBookingId(response.booking_id);       
      
      setSnackbar({
        open: true,
        message: 'Booking request submitted successfully! You will receive a confirmation email shortly.',
        severity: 'success'
      });
      
      setTimeout(() => {
        navigate('/user-home');
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting booking:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to submit booking request. Please try again.',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const handlePaymentComplete = async (paymentMethod, paymentData) => {
  try {
    setShowPaymentModal(false);
    
    setSnackbar({
      open: true,
      message: 'Payment submitted successfully! Waiting for owner confirmation...',
      severity: 'success'
    });

    setTimeout(() => {
      navigate('/user-bookings'); // Navigate to user bookings page
    }, 3000);
    
  } catch (error) {
    setSnackbar({
      open: true,
      message: 'Payment processing failed. Please try again.',
      severity: 'error'
    });
  }
};

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return renderBookingOverview();
      case 1:
        return renderPersonalDetails();
      case 2:
        return renderPayment();
      case 3:
        return renderPaymentStatus();
      default:
        return null;
    }
  };

  const renderBookingOverview = () => (
    <Grid container spacing={4}>
      <Grid item xs={12} md={8}>
        {/* Property Details Section */}
        {property && (
          <Card sx={{ 
            mb: 3, 
            backgroundColor: isDark ? theme.cardBackground : '#ffffff',
            border: isDark ? `1px solid ${theme.border}` : 'none'
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ 
                mb: 2, 
                fontWeight: 600,
                color: isDark ? theme.textPrimary : 'inherit'
              }}>
                Property Details
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <HomeIcon sx={{ mr: 1, color: theme.primary }} />
                    <Typography variant="body2" sx={{ color: isDark ? theme.textSecondary : 'inherit' }}>
                      Property Type:
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ 
                    ml: 4,
                    color: isDark ? theme.textPrimary : 'inherit'
                  }}>
                    {property.property_type} - {property.unit_type}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOnIcon sx={{ mr: 1, color: theme.primary }} />
                    <Typography variant="body2" sx={{ color: isDark ? theme.textSecondary : 'inherit' }}>
                      Location:
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ 
                    ml: 4,
                    color: isDark ? theme.textPrimary : 'inherit'
                  }}>
                    {property.address}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <BedIcon sx={{ mr: 1, color: theme.primary }} />
                    <Typography variant="body2" sx={{ color: isDark ? theme.textSecondary : 'inherit' }}>
                      Bedrooms:
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ 
                    ml: 4,
                    color: isDark ? theme.textPrimary : 'inherit'
                  }}>
                    {property.bedrooms || 0}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <BathtubIcon sx={{ mr: 1, color: theme.primary }} />
                    <Typography variant="body2" sx={{ color: isDark ? theme.textSecondary : 'inherit' }}>
                      Bathrooms:
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ 
                    ml: 4,
                    color: isDark ? theme.textPrimary : 'inherit'
                  }}>
                    {property.bathrooms || 0}
                  </Typography>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2, borderColor: isDark ? theme.divider : 'rgba(0, 0, 0, 0.12)' }} />
              
              <Typography variant="body2" sx={{ 
                color: isDark ? theme.textSecondary : 'inherit',
                mb: 1 
              }}>
                Description:
              </Typography>
              <Typography variant="body1" sx={{ color: isDark ? theme.textPrimary : 'inherit' }}>
                {property.description}
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Date Selection Section */}
        <Card sx={{ 
          mb: 3, 
          backgroundColor: isDark ? theme.cardBackground : '#ffffff',
          border: isDark ? `1px solid ${theme.border}` : 'none'
        }}>
          <CardContent>
            <Typography variant="h6" sx={{ 
              mb: 3, 
              fontWeight: 600,
              color: isDark ? theme.textPrimary : 'inherit'
            }}>
              Select Your Dates
            </Typography>
            
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Move In"
                    value={bookingData.check_in_date}
                    onChange={(newValue) => {
                      setBookingData(prev => ({ ...prev, check_in_date: newValue }));
                      if (errors.check_in_date) {
                        setErrors(prev => ({ ...prev, check_in_date: '' }));
                      }
                    }}
                    minDate={dayjs()}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={!!errors.check_in_date}
                        helperText={errors.check_in_date}
                        sx={{
                          '& .MuiInputBase-root': {
                            backgroundColor: isDark ? theme.inputBackground : '#ffffff',
                            color: isDark ? theme.textPrimary : 'inherit',
                          },
                          '& .MuiInputLabel-root': {
                            color: isDark ? theme.textSecondary : 'inherit',
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: isDark ? theme.inputBorder : 'rgba(0, 0, 0, 0.23)',
                          },
                          '& .MuiFormHelperText-root': {
                            color: isDark ? theme.textSecondary : 'inherit',
                          }
                        }}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Move Out"
                    value={bookingData.check_out_date}
                    onChange={(newValue) => {
                      setBookingData(prev => ({ ...prev, check_out_date: newValue }));
                      if (errors.check_out_date) {
                        setErrors(prev => ({ ...prev, check_out_date: '' }));
                      }
                    }}
                    minDate={bookingData.check_in_date ? dayjs(bookingData.check_in_date).add(1, 'day') : dayjs().add(1, 'day')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={!!errors.check_out_date}
                        helperText={errors.check_out_date}
                        sx={{
                          '& .MuiInputBase-root': {
                            backgroundColor: isDark ? theme.inputBackground : '#ffffff',
                            color: isDark ? theme.textPrimary : 'inherit',
                          },
                          '& .MuiInputLabel-root': {
                            color: isDark ? theme.textSecondary : 'inherit',
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: isDark ? theme.inputBorder : 'rgba(0, 0, 0, 0.23)',
                          },
                          '& .MuiFormHelperText-root': {
                            color: isDark ? theme.textSecondary : 'inherit',
                          }
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </LocalizationProvider>

            <Box sx={{ mt: 3 }}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: isDark ? theme.textSecondary : 'inherit' }}>
                  Number of Guests
                </InputLabel>
                <Select
                  value={bookingData.number_of_guests}
                  onChange={(e) => setBookingData(prev => ({ ...prev, number_of_guests: e.target.value }))}
                  label="Number of Guests"
                  sx={{
                    backgroundColor: isDark ? theme.inputBackground : '#ffffff',
                    color: isDark ? theme.textPrimary : 'inherit',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: isDark ? theme.inputBorder : 'rgba(0, 0, 0, 0.23)',
                    },
                  }}
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <MenuItem key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ mt: 3 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Special Requests (Optional)"
                placeholder="Any special requests or requirements..."
                value={bookingData.special_requests}
                onChange={(e) => setBookingData(prev => ({ ...prev, special_requests: e.target.value }))}
                sx={{
                  '& .MuiInputBase-root': {
                    backgroundColor: isDark ? theme.inputBackground : '#ffffff',
                    color: isDark ? theme.textPrimary : 'inherit',
                  },
                  '& .MuiInputLabel-root': {
                    color: isDark ? theme.textSecondary : 'inherit',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: isDark ? theme.inputBorder : 'rgba(0, 0, 0, 0.23)',
                  },
                  '& .MuiFormHelperText-root': {
                    color: isDark ? theme.textSecondary : 'inherit',
                  }
                }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Pricing Details */}
        {pricingBreakdown && (
  <Card sx={{ 
    mb: 3, 
    backgroundColor: isDark ? theme.cardBackground : '#ffffff',
    border: isDark ? `1px solid ${theme.border}` : 'none'
  }}>
    <CardContent>
      <Typography variant="h6" sx={{ 
        mb: 2, 
        fontWeight: 600,
        color: isDark ? theme.textPrimary : 'inherit'
      }}>
        Pricing Breakdown
      </Typography>
      
      <Box sx={{ space: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">Rent ({pricingBreakdown.breakdown.description}):</Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {formatCurrency(pricingBreakdown.subtotal)}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">Service Fee:</Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {formatCurrency(pricingBreakdown.serviceFee)}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 1 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>Total Amount:</Typography>
          <Typography variant="body1" sx={{ fontWeight: 600, color: theme.primary }}>
            {formatCurrency(pricingBreakdown.total)}
          </Typography>
        </Box>
        
        <Box sx={{ 
          backgroundColor: isDark ? theme.surfaceBackground : '#f5f5f5',
          borderRadius: 2,
          p: 2,
          mb: 1
        }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Payment Structure:
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">
              Advance Payment ({pricingBreakdown.advancePercentage || 30}%):
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: theme.primary }}>
              {formatCurrency(pricingBreakdown.advanceAmount)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2">Remaining Amount:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {formatCurrency(pricingBreakdown.remainingAmount)}
            </Typography>
          </Box>
        </Box>
        
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            You only need to pay the advance amount ({formatCurrency(pricingBreakdown.advanceAmount)}) 
            to confirm your booking. The remaining amount will be paid upon check-in.
          </Typography>
        </Alert>
      </Box>
    </CardContent>
  </Card>
)}
      </Grid>

      {/* Right Side - Next Steps Section */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ 
          p: 4, 
          mb: 4, 
          backgroundColor: isDark ? theme.surfaceBackground : '#f5f5f5',
          border: isDark ? `1px solid ${theme.border}` : 'none',
          position: 'sticky',
          top: 20
        }}>
          <Typography variant="h5" sx={{ 
            fontWeight: 600, 
            mb: 3,
            color: isDark ? theme.textPrimary : 'inherit'
          }}>
            Next Steps – Payment Procedure
          </Typography>
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              mb: 2,
              color: isDark ? theme.textPrimary : 'inherit'
            }}>
              1. After Request is Sent
            </Typography>
            <List dense>
              <ListItem sx={{ pl: 0 }}>
                <ListItemText 
                  primary="• The landlord will review your request."
                  primaryTypographyProps={{
                    color: isDark ? theme.textPrimary : 'inherit'
                  }}
                />
              </ListItem>
              <ListItem sx={{ pl: 0 }}>
                <ListItemText 
                  primary="• Once the landlord accepts the request, you will receive a confirmation message."
                  primaryTypographyProps={{
                    color: isDark ? theme.textPrimary : 'inherit'
                  }}
                />
              </ListItem>
              <ListItem sx={{ pl: 0 }}>
                <ListItemText 
                  primary="• The landlord's account number will also be shared with you for payment."
                  primaryTypographyProps={{
                    color: isDark ? theme.textPrimary : 'inherit'
                  }}
                />
              </ListItem>
            </List>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              mb: 2,
              color: isDark ? theme.textPrimary : 'inherit'
            }}>
              2. Payment Submission
            </Typography>
            <List dense>
              <ListItem sx={{ pl: 0 }}>
                <ListItemText 
                  primary="• Make the payment to the provided account."
                  primaryTypographyProps={{
                    color: isDark ? theme.textPrimary : 'inherit'
                  }}
                />
              </ListItem>
              <ListItem sx={{ pl: 0 }}>
                <ListItemText 
                  primary="• Upload the payment receipt (photo or screenshot) via the platform and relevant details."
                  primaryTypographyProps={{
                    color: isDark ? theme.textPrimary : 'inherit'
                  }}
                />
              </ListItem>
              <ListItem sx={{ pl: 0 }}>
                <ListItemText 
                  primary="• Your submission will be sent to the landlord for verification."
                  primaryTypographyProps={{
                    color: isDark ? theme.textPrimary : 'inherit'
                  }}
                />
              </ListItem>
            </List>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              mb: 2,
              color: isDark ? theme.textPrimary : 'inherit'
            }}>
              3. Booking Confirmation
            </Typography>
            <List dense>
              <ListItem sx={{ pl: 0 }}>
                <ListItemText 
                  primary="• Once the landlord approves the payment, your booking is confirmed."
                  primaryTypographyProps={{
                    color: isDark ? theme.textPrimary : 'inherit'
                  }}
                />
              </ListItem>
              <ListItem sx={{ pl: 0 }}>
                <ListItemText 
                  primary="• You will receive a final confirmation once this step is completed."
                  primaryTypographyProps={{
                    color: isDark ? theme.textPrimary : 'inherit'
                  }}
                />
              </ListItem>
            </List>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 3, 
            p: 2, 
            backgroundColor: isDark ? theme.cardBackground : '#e3f2fd', 
            borderRadius: 1,
            border: isDark ? `1px solid ${theme.border}` : 'none'
          }}>
            <HomeIcon sx={{ mr: 2, color: isDark ? theme.primary : '#1976d2' }} />
            <Box>
              <Typography variant="subtitle2" sx={{ 
                fontWeight: 600,
                color: isDark ? theme.textPrimary : 'inherit'
              }}>
                On Move In
              </Typography>
              <Typography variant="body2" sx={{
                color: isDark ? theme.textSecondary : 'inherit'
              }}>
                You have 24 hours to report any issues with the accommodation.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            p: 2, 
            backgroundColor: isDark ? theme.cardBackground : '#e8f5e8', 
            borderRadius: 1,
            border: isDark ? `1px solid ${theme.border}` : 'none'
          }}>
            <HomeIcon sx={{ mr: 2, color: isDark ? theme.success : '#2e7d32' }} />
            <Box>
              <Typography variant="subtitle2" sx={{ 
                fontWeight: 600,
                color: isDark ? theme.textPrimary : 'inherit'
              }}>
                On Move Out
              </Typography>
              <Typography variant="body2" sx={{
                color: isDark ? theme.textSecondary : 'inherit'
              }}>
                If the property is in good condition, the landlord should return your security deposit.
              </Typography>
              <Typography variant="body2" sx={{ 
                mt: 1,
                color: isDark ? theme.textSecondary : 'inherit'
              }}>
                If you leave before the agreed date, the landlord may retain the deposit.
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Booking Summary for Right Side */}
        {pricingBreakdown && (
  <Card sx={{ 
    backgroundColor: isDark ? theme.cardBackground : '#ffffff',
    border: isDark ? `1px solid ${theme.border}` : 'none',
    position: 'sticky',
    top: 20
  }}>
    <CardContent>
      <Typography variant="h6" sx={{ 
        mb: 2, 
        fontWeight: 600,
        color: isDark ? theme.textPrimary : 'inherit'
      }}>
        {property?.property_type} - {property?.unit_type}
      </Typography>
      
      <Typography variant="body2" sx={{ 
        mb: 2,
        color: isDark ? theme.textSecondary : 'inherit'
      }}>
        {property?.address}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <BedIcon sx={{ mr: 1, fontSize: 18, color: theme.primary }} />
        <Typography variant="body2" sx={{ color: isDark ? theme.textPrimary : 'inherit' }}>
          {property?.bedrooms || 0} Bedrooms
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <BathtubIcon sx={{ mr: 1, fontSize: 18, color: theme.primary }} />
        <Typography variant="body2" sx={{ color: isDark ? theme.textPrimary : 'inherit' }}>
          {property?.bathrooms || 0} Bathrooms
        </Typography>
      </Box>

      {property?.parking && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <HomeIcon sx={{ mr: 1, fontSize: 18, color: theme.primary }} />
          <Typography variant="body2" sx={{ color: isDark ? theme.textPrimary : 'inherit' }}>
            {property?.parking} Parking
          </Typography>
        </Box>
      )}

      <Divider sx={{ mb: 2, borderColor: isDark ? theme.divider : 'rgba(0, 0, 0, 0.12)' }} />

      <Typography variant="h6" sx={{ 
        mb: 2, 
        fontWeight: 600,
        color: isDark ? theme.textPrimary : 'inherit'
      }}>
        Price Details
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" sx={{ color: isDark ? theme.textSecondary : 'inherit' }}>
          Rental for the first Month:
        </Typography>
        <Typography variant="body2" sx={{ 
          fontWeight: 600,
          color: isDark ? theme.textPrimary : 'inherit'
        }}>
          Rs. {pricingBreakdown.subtotal.toLocaleString()}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" sx={{ color: isDark ? theme.textSecondary : 'inherit' }}>
          One time service fee:
        </Typography>
        <Typography variant="body2" sx={{ 
          fontWeight: 600,
          color: isDark ? theme.textPrimary : 'inherit'
        }}>
          Rs. {pricingBreakdown.serviceFee.toLocaleString()}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" sx={{ color: isDark ? theme.textSecondary : 'inherit' }}>
          Advance Payment ({pricingBreakdown.advancePercentage || 30}%):
        </Typography>
        <Typography variant="body2" sx={{ 
          fontWeight: 600,
          color: isDark ? theme.textPrimary : 'inherit'
        }}>
          Rs. {pricingBreakdown.advanceAmount.toLocaleString()}
        </Typography>
      </Box>

      <Divider sx={{ mb: 2, borderColor: isDark ? theme.divider : 'rgba(0, 0, 0, 0.12)' }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
    <Typography variant="h7" sx={{ 
      fontWeight: 600,
      color: isDark ? theme.textPrimary : 'inherit'
    }}>
      Total Amount
    </Typography>
    <Typography variant="h7" sx={{ 
      fontWeight: 600,
      color: theme.primary
    }}>
      Rs. {pricingBreakdown.total.toLocaleString()}
    </Typography>
  </Box>
  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
    <Typography variant="h6" sx={{ 
      fontWeight: 600,
      color: isDark ? theme.textPrimary : 'inherit'
    }}>
      Advance Amount
    </Typography>
    <Typography variant="h6" sx={{ 
      fontWeight: 600,
      color: theme.primary
    }}>
      Rs. {pricingBreakdown.advanceAmount.toLocaleString()}
    </Typography>
  </Box>
</Box>

      <Alert 
        severity="info" 
        sx={{ 
          mt: 2,
          backgroundColor: isDark ? theme.surfaceBackground : undefined,
          color: isDark ? theme.textPrimary : undefined,
          '& .MuiAlert-icon': {
            color: isDark ? theme.info : undefined,
          }
        }}
      >
        <Typography variant="body2" sx={{ color: isDark ? theme.textPrimary : 'inherit' }}>
          You will be charged once the owner accepts your request
        </Typography>
      </Alert>
    </CardContent>
  </Card>
)}
      </Grid>
    </Grid>
  );

  const renderPersonalDetails = () => (
    <Card sx={{ 
      backgroundColor: isDark ? theme.cardBackground : '#ffffff',
      border: isDark ? `1px solid ${theme.border}` : 'none'
    }}>
      <CardContent>
        <Typography variant="h6" sx={{ 
          mb: 3, 
          fontWeight: 600,
          color: isDark ? theme.textPrimary : 'inherit'
        }}>
          Personal Information
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              required
              value={personalDetails.first_name}
              onChange={(e) => setPersonalDetails(prev => ({ ...prev, first_name: e.target.value }))}
              error={!!errors.first_name}
              helperText={errors.first_name}
              sx={{
                '& .MuiInputBase-root': {
                  backgroundColor: isDark ? theme.inputBackground : '#ffffff',
                  color: isDark ? theme.textPrimary : 'inherit',
                },
                '& .MuiInputLabel-root': {
                  color: isDark ? theme.textSecondary : 'inherit',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDark ? theme.inputBorder : 'rgba(0, 0, 0, 0.23)',
                },
                '& .MuiFormHelperText-root': {
                  backgroundColor: isDark ? theme.cardBackground : 'transparent',
                  color: isDark ? theme.textSecondary : 'inherit',
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              required
              value={personalDetails.last_name}
              onChange={(e) => setPersonalDetails(prev => ({ ...prev, last_name: e.target.value }))}
              error={!!errors.last_name}
              helperText={errors.last_name}
              sx={{
                '& .MuiInputBase-root': {
                  backgroundColor: isDark ? theme.inputBackground : '#ffffff',
                  color: isDark ? theme.textPrimary : 'inherit',
                },
                '& .MuiInputLabel-root': {
                  color: isDark ? theme.textSecondary : 'inherit',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDark ? theme.inputBorder : 'rgba(0, 0, 0, 0.23)',
                },
                '& .MuiFormHelperText-root': {
                  backgroundColor: isDark ? theme.cardBackground : 'transparent',
                  color: isDark ? theme.textSecondary : 'inherit',
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              required
              value={personalDetails.email}
              onChange={(e) => setPersonalDetails(prev => ({ ...prev, email: e.target.value }))}
              error={!!errors.email}
              helperText={errors.email}
              sx={{
                '& .MuiInputBase-root': {
                  backgroundColor: isDark ? theme.inputBackground : '#ffffff',
                  color: isDark ? theme.textPrimary : 'inherit',
                },
                '& .MuiInputLabel-root': {
                  color: isDark ? theme.textSecondary : 'inherit',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDark ? theme.inputBorder : 'rgba(0, 0, 0, 0.23)',
                },
                '& .MuiFormHelperText-root': {
                  backgroundColor: isDark ? theme.cardBackground : 'transparent',
                  color: isDark ? theme.textSecondary : 'inherit',
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Mobile Number"
              required
              value={personalDetails.mobile_number}
              onChange={(e) => setPersonalDetails(prev => ({ ...prev, mobile_number: e.target.value }))}
              error={!!errors.mobile_number}
              helperText={errors.mobile_number}
              sx={{
                '& .MuiInputBase-root': {
                  backgroundColor: isDark ? theme.inputBackground : '#ffffff',
                  color: isDark ? theme.textPrimary : 'inherit',
                },
                '& .MuiInputLabel-root': {
                  color: isDark ? theme.textSecondary : 'inherit',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDark ? theme.inputBorder : 'rgba(0, 0, 0, 0.23)',
                },
                '& .MuiFormHelperText-root': {
                  backgroundColor: isDark ? theme.cardBackground : 'transparent',
                  color: isDark ? theme.textSecondary : 'inherit',
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="ID Number"
              required
              value={personalDetails.id_number}
              onChange={(e) => setPersonalDetails(prev => ({ ...prev, id_number: e.target.value }))}
              error={!!errors.id_number}
              helperText={errors.id_number}
              sx={{
                '& .MuiInputBase-root': {
                  backgroundColor: isDark ? theme.inputBackground : '#ffffff',
                  color: isDark ? theme.textPrimary : 'inherit',
                },
                '& .MuiInputLabel-root': {
                  color: isDark ? theme.textSecondary : 'inherit',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDark ? theme.inputBorder : 'rgba(0, 0, 0, 0.23)',
                },
                '& .MuiFormHelperText-root': {
                  backgroundColor: isDark ? theme.cardBackground : 'transparent',
                  color: isDark ? theme.textSecondary : 'inherit',
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Occupation"
              value={personalDetails.occupation}
              onChange={(e) => setPersonalDetails(prev => ({ ...prev, occupation: e.target.value }))}
              sx={{
                '& .MuiInputBase-root': {
                  backgroundColor: isDark ? theme.inputBackground : '#ffffff',
                  color: isDark ? theme.textPrimary : 'inherit',
                },
                '& .MuiInputLabel-root': {
                  color: isDark ? theme.textSecondary : 'inherit',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDark ? theme.inputBorder : 'rgba(0, 0, 0, 0.23)',
                },
                '& .MuiFormHelperText-root': {
                  backgroundColor: isDark ? theme.cardBackground : 'transparent',
                  color: isDark ? theme.textSecondary : 'inherit',
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Current Address"
              multiline
              rows={2}
              value={personalDetails.current_address}
              onChange={(e) => setPersonalDetails(prev => ({ ...prev, current_address: e.target.value }))}
              sx={{
                '& .MuiInputBase-root': {
                  backgroundColor: isDark ? theme.inputBackground : '#ffffff',
                  color: isDark ? theme.textPrimary : 'inherit',
                },
                '& .MuiInputLabel-root': {
                  color: isDark ? theme.textSecondary : 'inherit',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDark ? theme.inputBorder : 'rgba(0, 0, 0, 0.23)',
                },
                '& .MuiFormHelperText-root': {
                  backgroundColor: isDark ? theme.cardBackground : 'transparent',
                  color: isDark ? theme.textSecondary : 'inherit',
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Emergency Contact Name"
              value={personalDetails.emergency_contact_name}
              onChange={(e) => setPersonalDetails(prev => ({ ...prev, emergency_contact_name: e.target.value }))}
              sx={{
                '& .MuiInputBase-root': {
                  backgroundColor: isDark ? theme.inputBackground : '#ffffff',
                  color: isDark ? theme.textPrimary : 'inherit',
                },
                '& .MuiInputLabel-root': {
                  color: isDark ? theme.textSecondary : 'inherit',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDark ? theme.inputBorder : 'rgba(0, 0, 0, 0.23)',
                },
                '& .MuiFormHelperText-root': {
                  backgroundColor: isDark ? theme.cardBackground : 'transparent',
                  color: isDark ? theme.textSecondary : 'inherit',
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Emergency Contact Number"
              value={personalDetails.emergency_contact_number}
              onChange={(e) => setPersonalDetails(prev => ({ ...prev, emergency_contact_number: e.target.value }))}
              sx={{
                '& .MuiInputBase-root': {
                  backgroundColor: isDark ? theme.inputBackground : '#ffffff',
                  color: isDark ? theme.textPrimary : 'inherit',
                },
                '& .MuiInputLabel-root': {
                  color: isDark ? theme.textSecondary : 'inherit',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDark ? theme.inputBorder : 'rgba(0, 0, 0, 0.23)',
                },
                '& .MuiFormHelperText-root': {
                  backgroundColor: isDark ? theme.cardBackground : 'transparent',
                  color: isDark ? theme.textSecondary : 'inherit',
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Purpose of Stay"
              value={personalDetails.purpose_of_stay}
              onChange={(e) => setPersonalDetails(prev => ({ ...prev, purpose_of_stay: e.target.value }))}
              sx={{
                '& .MuiInputBase-root': {
                  backgroundColor: isDark ? theme.inputBackground : '#ffffff',
                  color: isDark ? theme.textPrimary : 'inherit',
                },
                '& .MuiInputLabel-root': {
                  color: isDark ? theme.textSecondary : 'inherit',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDark ? theme.inputBorder : 'rgba(0, 0, 0, 0.23)',
                },
                '& .MuiFormHelperText-root': {
                  backgroundColor: isDark ? theme.cardBackground : 'transparent',
                  color: isDark ? theme.textSecondary : 'inherit',
                }
              }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderPayment = () => (
    <Card sx={{ 
      backgroundColor: isDark ? theme.cardBackground : '#ffffff',
      border: isDark ? `1px solid ${theme.border}` : 'none'
    }}>
      <CardContent>
        <Typography variant="h6" sx={{ 
          mb: 3, 
          fontWeight: 600,
          color: isDark ? theme.textPrimary : 'inherit'
        }}>
          Booking Summary & Payment
        </Typography>
        
        {pricingBreakdown && (
          <>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                mb: 3, 
                backgroundColor: isDark ? theme.surfaceBackground : '#f5f5f5',
                border: isDark ? `1px solid ${theme.border}` : 'none'
              }}
            >
              <Typography variant="h6" sx={{ 
                mb: 2,
                color: isDark ? theme.textPrimary : 'inherit'
              }}>
                Price Breakdown
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1" sx={{ color: isDark ? theme.textSecondary : 'inherit' }}>
                  Duration: {pricingBreakdown.breakdown?.description || 'N/A'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1" sx={{ color: isDark ? theme.textSecondary : 'inherit' }}>
                  Rental Amount:
                </Typography>
                <Typography variant="body1" sx={{ color: isDark ? theme.textPrimary : 'inherit' }}>
                  {formatCurrency(pricingBreakdown.subtotal)}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1" sx={{ color: isDark ? theme.textSecondary : 'inherit' }}>
                  Service Fee:
                </Typography>
                <Typography variant="body1" sx={{ color: isDark ? theme.textPrimary : 'inherit' }}>
                  {formatCurrency(pricingBreakdown.serviceFee)}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2, borderColor: isDark ? theme.divider : 'rgba(0, 0, 0, 0.12)' }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600,
                  color: isDark ? theme.textPrimary : 'inherit'
                }}>
                  Total Amount:
                </Typography>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  color: theme.primary 
                }}>
                  {formatCurrency(pricingBreakdown.total)}
                </Typography>
              </Box>
            </Paper>

            <Alert 
              severity="info" 
              sx={{ 
                mb: 3,
                backgroundColor: isDark ? theme.surfaceBackground : undefined,
                color: isDark ? theme.textPrimary : undefined,
                '& .MuiAlert-icon': {
                  color: isDark ? theme.info : undefined,
                }
              }}
            >
              <List dense>
                <ListItem sx={{ pl: 0 }}>
                  <ListItemIcon>
                    <CheckCircleIcon sx={{ color: theme.success, fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="The landlord will review your request."
                    primaryTypographyProps={{ 
                      variant: 'body2',
                      sx: { color: isDark ? theme.textPrimary : 'inherit' }
                    }}
                  />
                </ListItem>
                
                <ListItem sx={{ pl: 0 }}>
                  <ListItemIcon>
                    <EmailIcon sx={{ color: theme.info, fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Once the landlord accepts the request, you will receive a confirmation message."
                    primaryTypographyProps={{ 
                      variant: 'body2',
                      sx: { color: isDark ? theme.textPrimary : 'inherit' }
                    }}
                  />
                </ListItem>
                
                <ListItem sx={{ pl: 0 }}>
                  <ListItemIcon>
                    <AccountBalanceIcon sx={{ color: theme.warning, fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="The landlord's account number will also be shared with you for payment."
                    primaryTypographyProps={{ 
                      variant: 'body2',
                      sx: { color: isDark ? theme.textPrimary : 'inherit' }
                    }}
                  />
                </ListItem>
                
                <ListItem sx={{ pl: 0 }}>
                  <ListItemIcon>
                    <PaymentIcon sx={{ color: theme.primary, fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Make the payment to the provided account."
                    primaryTypographyProps={{ 
                      variant: 'body2',
                      sx: { color: isDark ? theme.textPrimary : 'inherit' }
                    }}
                  />
                </ListItem>
              </List>
            </Alert>

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={submitting}
              sx={{
                backgroundColor: theme.primary,
                color: 'white',
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: theme.secondary,
                },
                '&:disabled': {
                  backgroundColor: isDark ? theme.textDisabled : 'rgba(0, 0, 0, 0.12)',
                }
              }}
            >
              {submitting ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                  Submitting Request...
                </Box>
              ) : (
                'Submit Booking Request'
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
  
  const renderPaymentStatus = () => (
  <Card sx={{ backgroundColor: isDark ? theme.cardBackground : '#ffffff' }}>
    <CardContent sx={{ textAlign: 'center', py: 4 }}>
      {!bookingApproved && (
        <>
          <ScheduleIcon sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Waiting for Property Owner Approval
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your booking request has been sent. You'll be notified when the owner responds.
          </Typography>
          <CircularProgress sx={{ mt: 2 }} />
        </>
      )}

      {bookingApproved && (
        <>
          <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Booking Approved! Choose Payment Method
          </Typography>
          <Button
            variant="contained"
            onClick={() => setShowPaymentModal(true)}
            sx={{ mt: 2 }}
          >
            Proceed to Payment
          </Button>
        </>
      )}
    </CardContent>
  </Card>
);

  if (loading) {
    return (
      <Container sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress size={60} sx={{ color: theme.primary }} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            backgroundColor: isDark ? theme.surfaceBackground : undefined,
            color: isDark ? theme.textPrimary : undefined,
          }}
        >
          {error}
        </Alert>
        <Button 
          onClick={() => navigate('/user-home')} 
          variant="outlined"
          sx={{ 
            color: theme.primary,
            borderColor: theme.primary 
          }}
        >
          Back to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs 
        separator="/" 
        sx={{ 
          mb: 3,
          '& .MuiBreadcrumbs-separator': {
            color: isDark ? theme.textSecondary : 'inherit',
          }
        }}
      >
        <Link 
          color="inherit" 
          href="/user-home" 
          underline="hover"
          sx={{ color: isDark ? theme.textSecondary : 'inherit' }}
        >
          Home
        </Link>
        <Link 
          color="inherit" 
          href="/user-all-properties" 
          underline="hover"
          sx={{ color: isDark ? theme.textSecondary : 'inherit' }}
        >
          Booking
        </Link>
        <Typography sx={{ color: isDark ? theme.textPrimary : 'inherit' }}>
          Boarding
        </Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 4 }}>
        <Stepper 
          activeStep={activeStep} 
          sx={{ 
            '& .MuiStepConnector-line': {
              borderColor: isDark ? theme.border : 'rgba(0, 0, 0, 0.12)',
            }
          }}
        >
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: activeStep >= index ? theme.primary : isDark ? theme.textDisabled : '#e0e0e0',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    mr: 2
                  }}>
                    {index + 1}
                  </Box>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: activeStep === index ? 600 : 400,
                      color: isDark ? theme.textPrimary : 'inherit'
                    }}
                  >
                    {label}
                  </Typography>
                </Box>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {renderStepContent()}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          onClick={handleBack}
          disabled={activeStep === 0}
          sx={{ color: isDark ? theme.textPrimary : 'inherit' }}
        >
          Back
        </Button>
        
        {activeStep < steps.length - 1 && (
          <Button
            variant="contained"
            onClick={handleNext}
            sx={{
              backgroundColor: theme.primary,
              '&:hover': { backgroundColor: theme.secondary }
            }}
          >
            Next
          </Button>
        )}
      </Box>

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      />
      
      {/* Payment Options Modal */}
{showPaymentModal && pricingBreakdown && (
  <PaymentOptionsModal
    open={showPaymentModal}
    onClose={() => setShowPaymentModal(false)}
    booking={{
      id: currentBookingId,
      advance_amount: pricingBreakdown.advanceAmount
    }}
    accountInfo={paymentAccountInfo}
    onPaymentComplete={handlePaymentComplete}
  />
)}

    </Container>
  );
};

export default UserBookingPage;