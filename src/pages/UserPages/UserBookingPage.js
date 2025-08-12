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
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
  Breadcrumbs,
  Link
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
  Home as HomeIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  AttachFile as AttachFileIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import { getPublicPropertyById } from '../../api/propertyApi';
import { getUserProfile } from '../../api/profileApi';
import { 
  submitBookingRequest, 
  getPropertyAvailabilityStatus,
  getUserBookings,
  getBookingDetails 
} from '../../api/bookingApi';
import { 
  calculateBookingPricing, 
  validateBookingDates, 
  formatCurrency,
  generateBookingSummary 
} from '../../utils/BookingCalculationUtils';
import AppSnackbar from '../../components/common/AppSnackbar';
import { useTheme } from '../../contexts/ThemeContext';

const steps = ['Select Dates', 'Personal Details', 'Review & Confirm'];

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
  const { theme, isDark } = useTheme();
  
  const [activeStep, setActiveStep] = useState(0);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [propertyStatus, setPropertyStatus] = useState(null);
  const [existingBookings, setExistingBookings] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  
  const [bookingData, setBookingData] = useState({
    check_in_date: null,
    check_out_date: null,
    number_of_guests: 1,
    booking_type: 'monthly',
    special_requests: ''
  });
  
  const [personalDetails, setPersonalDetails] = useState({
    first_name: '',
    last_name: '',
    email: '',
    mobile_number: '',
    alternative_contact: '',
    emergency_contact_name: '',
    emergency_contact_number: '',
    occupation: '',
    current_address: '',
    id_number: '',
    purpose_of_stay: ''
  });
  
  const [dateErrors, setDateErrors] = useState({});
  const [personalDetailsErrors, setPersonalDetailsErrors] = useState({});
  const [pricingBreakdown, setPricingBreakdown] = useState(null);
  const [dateValidation, setDateValidation] = useState({ isValid: false, errors: [], warnings: [] });
  const [competitionInfo, setCompetitionInfo] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (id) {
      loadPropertyAndUserData();
    }
  }, [id]);

  useEffect(() => {
    if (bookingData.check_in_date && bookingData.check_out_date && property) {
      validateDates();
      calculatePricing();
    } else {
      setPricingBreakdown(null);
    }
  }, [bookingData.check_in_date, bookingData.check_out_date, property]);

  const loadPropertyAndUserData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const [propertyData, userProfile, userBookingsData] = await Promise.all([
        getPublicPropertyById(id).catch(err => {
          console.error('Property fetch error:', err);
          throw new Error('Failed to load property details');
        }),
        getUserProfile().catch(err => {
          console.warn('User profile fetch failed:', err);
          return null;
        }),
        getUserBookings({ property_id: id }).catch(err => {
          console.warn('User bookings fetch failed:', err);
          return { bookings: [] };
        })
      ]);

      if (!propertyData) {
        throw new Error('Property not found');
      }

      setProperty(propertyData);
      setUserBookings(userBookingsData.bookings || []);

      if (userProfile) {
        setPersonalDetails(prev => ({
          ...prev,
          first_name: userProfile.first_name || '',
          last_name: userProfile.last_name || '',
          email: userProfile.email || '',
          mobile_number: userProfile.phone || ''
        }));
      }

      const today = dayjs();
      const availableFrom = propertyData.available_from ? dayjs(propertyData.available_from) : today.add(1, 'day');
      const defaultCheckIn = availableFrom.isAfter(today) ? availableFrom : today.add(1, 'day');
      
      setBookingData(prev => ({
        ...prev,
        check_in_date: defaultCheckIn,
        check_out_date: defaultCheckIn.add(30, 'day')
      }));

    } catch (error) {
      console.error('Error loading property data:', error);
      setError(error.message || 'Failed to load property details');
    } finally {
      setLoading(false);
    }
  };

  const validateDates = () => {
    if (!bookingData.check_in_date || !bookingData.check_out_date) {
      setDateValidation({ isValid: false, errors: [], warnings: [] });
      setDateErrors({});
      return;
    }

    const checkIn = dayjs(bookingData.check_in_date);
    const checkOut = dayjs(bookingData.check_out_date);
    const validation = validateBookingDates(checkIn.toDate(), checkOut.toDate());
    
    const errors = {};
    
    if (property?.available_from && checkIn.isBefore(dayjs(property.available_from))) {
      errors.check_in_date = `Property is available from ${dayjs(property.available_from).format('MMM DD, YYYY')}`;
      validation.isValid = false;
    }

    if (property?.available_to && checkOut.isAfter(dayjs(property.available_to))) {
      errors.check_out_date = `Property is available until ${dayjs(property.available_to).format('MMM DD, YYYY')}`;
      validation.isValid = false;
    }

    const hasConflict = existingBookings.some(booking => {
      const bookingStart = dayjs(booking.check_in_date);
      const bookingEnd = dayjs(booking.check_out_date);
      return checkIn.isBefore(bookingEnd) && checkOut.isAfter(bookingStart);
    });

    if (hasConflict) {
      errors.check_in_date = 'Selected dates conflict with existing booking';
      errors.check_out_date = 'Selected dates conflict with existing booking';
      validation.isValid = false;
    }

    setDateErrors(errors);
    setDateValidation(validation);
  };

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

  const validatePersonalDetails = () => {
    const errors = {};
    const required = ['first_name', 'last_name', 'email', 'mobile_number', 'id_number'];
    
    required.forEach(field => {
      if (!personalDetails[field]?.trim()) {
        errors[field] = `${field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} is required`;
      }
    });

    if (personalDetails.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalDetails.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (personalDetails.mobile_number && !/^\+?[\d\s-()]+$/.test(personalDetails.mobile_number)) {
      errors.mobile_number = 'Please enter a valid mobile number';
    }

    setPersonalDetailsErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!dateValidation.isValid || Object.keys(dateErrors).length > 0) {
        setSnackbar({
          open: true,
          message: 'Please select valid dates before proceeding',
          severity: 'error'
        });
        return;
      }
    }
    
    if (activeStep === 1) {
      if (!validatePersonalDetails()) {
        setSnackbar({
          open: true,
          message: 'Please fill in all required fields correctly',
          severity: 'error'
        });
        return;
      }
    }
    
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmitBooking = async () => {
    if (!validatePersonalDetails()) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields correctly',
        severity: 'error'
      });
      return;
    }

    setConfirmDialog(true);
  };

  const confirmSubmitBooking = async () => {
    setSubmitting(true);
    setConfirmDialog(false);

    try {
      const bookingRequest = {
        property_id: parseInt(id),
        check_in_date: dayjs(bookingData.check_in_date).format('YYYY-MM-DD'),
        check_out_date: dayjs(bookingData.check_out_date).format('YYYY-MM-DD'),
        number_of_guests: bookingData.number_of_guests,
        booking_type: bookingData.booking_type,
        special_requests: bookingData.special_requests,
        total_price: pricingBreakdown?.totalAmount || 0,
        service_fee: pricingBreakdown?.serviceFee || 300,
        booking_days: pricingBreakdown?.totalDays || 0,
        booking_months: pricingBreakdown?.totalMonths || 0,
        ...personalDetails
      };

      const response = await submitBookingRequest(bookingRequest);
      
      setSnackbar({
        open: true,
        message: 'Booking request submitted successfully! You will receive a notification once the owner responds.',
        severity: 'success'
      });

      setTimeout(() => {
        navigate('/user-allproperties');
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

  const renderDateSelection = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ color: theme.textPrimary, mb: 2 }}>
          Select Your Dates
        </Typography>
        <Alert severity="info" sx={{ mb: 3 }}>
          Choose your check-in and check-out dates. Minimum booking period is 1 day.
        </Alert>
      </Grid>

      <Grid item xs={12} md={6}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Check-in Date"
            value={bookingData.check_in_date}
            onChange={(newValue) => setBookingData(prev => ({ ...prev, check_in_date: newValue }))}
            minDate={property?.available_from ? dayjs(property.available_from) : dayjs()}
            maxDate={property?.available_to ? dayjs(property.available_to) : dayjs().add(2, 'year')}
            slotProps={{
              textField: {
                fullWidth: true,
                error: !!dateErrors.check_in_date,
                helperText: dateErrors.check_in_date
              }
            }}
          />
        </LocalizationProvider>
      </Grid>

      <Grid item xs={12} md={6}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Check-out Date"
            value={bookingData.check_out_date}
            onChange={(newValue) => setBookingData(prev => ({ ...prev, check_out_date: newValue }))}
            minDate={bookingData.check_in_date ? dayjs(bookingData.check_in_date).add(1, 'day') : dayjs().add(1, 'day')}
            maxDate={property?.available_to ? dayjs(property.available_to) : dayjs().add(2, 'year')}
            slotProps={{
              textField: {
                fullWidth: true,
                error: !!dateErrors.check_out_date,
                helperText: dateErrors.check_out_date
              }
            }}
          />
        </LocalizationProvider>
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Booking Type</InputLabel>
          <Select
            value={bookingData.booking_type}
            onChange={(e) => setBookingData(prev => ({ ...prev, booking_type: e.target.value }))}
            label="Booking Type"
          >
            <MenuItem value="daily">Daily</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
            <MenuItem value="long_term">Long Term (6+ months)</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Number of Guests"
          type="number"
          inputProps={{ min: 1, max: 10 }}
          value={bookingData.number_of_guests}
          onChange={(e) => setBookingData(prev => ({ ...prev, number_of_guests: parseInt(e.target.value) || 1 }))}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Special Requests (Optional)"
          multiline
          rows={3}
          value={bookingData.special_requests}
          onChange={(e) => setBookingData(prev => ({ ...prev, special_requests: e.target.value }))}
          placeholder="Any specific requirements or requests for your stay..."
        />
      </Grid>

      {pricingBreakdown && (
        <Grid item xs={12}>
          <Paper 
            sx={{ 
              p: 3, 
              backgroundColor: theme.cardBackground,
              border: `1px solid ${theme.isDark ? '#333' : '#e0e0e0'}`
            }}
          >
            <Typography variant="h6" sx={{ color: theme.textPrimary, mb: 2 }}>
              Pricing Breakdown
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                  Base Price ({pricingBreakdown.totalDays} days):
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ color: theme.textPrimary, textAlign: 'right' }}>
                  {formatCurrency(pricingBreakdown.baseAmount)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                  Service Fee:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ color: theme.textPrimary, textAlign: 'right' }}>
                  {formatCurrency(pricingBreakdown.serviceFee)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h6" sx={{ color: theme.textPrimary, fontWeight: 600 }}>
                  Total:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h6" sx={{ color: theme.primary, textAlign: 'right', fontWeight: 600 }}>
                  {formatCurrency(pricingBreakdown.totalAmount)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      )}

      {property && (
        <Grid item xs={12}>
          <Card sx={{ backgroundColor: theme.cardBackground }}>
            <Grid container>
              <Grid item xs={12} md={4}>
                <CardMedia
                  component="img"
                  height="200"
                  image={safeParse(property.images)?.[0] || '/placeholder-property.jpg'}
                  alt={property.property_type}
                  sx={{ objectFit: 'cover' }}
                />
              </Grid>
              <Grid item xs={12} md={8}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: theme.textPrimary, mb: 1 }}>
                    {property.property_type} - {property.unit_type}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.textSecondary, mb: 2 }}>
                    <LocationOnIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    {property.address}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                    Monthly Rent: {formatCurrency(property.price)}
                  </Typography>
                </CardContent>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      )}
    </Grid>
  );

  const renderPersonalDetails = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ color: theme.textPrimary, mb: 2 }}>
          Personal Information
        </Typography>
        <Alert severity="info" sx={{ mb: 3 }}>
          Please provide your personal details for the booking request.
        </Alert>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="First Name *"
          value={personalDetails.first_name}
          onChange={(e) => setPersonalDetails(prev => ({ ...prev, first_name: e.target.value }))}
          error={!!personalDetailsErrors.first_name}
          helperText={personalDetailsErrors.first_name}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Last Name *"
          value={personalDetails.last_name}
          onChange={(e) => setPersonalDetails(prev => ({ ...prev, last_name: e.target.value }))}
          error={!!personalDetailsErrors.last_name}
          helperText={personalDetailsErrors.last_name}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Email *"
          type="email"
          value={personalDetails.email}
          onChange={(e) => setPersonalDetails(prev => ({ ...prev, email: e.target.value }))}
          error={!!personalDetailsErrors.email}
          helperText={personalDetailsErrors.email}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Mobile Number *"
          value={personalDetails.mobile_number}
          onChange={(e) => setPersonalDetails(prev => ({ ...prev, mobile_number: e.target.value }))}
          error={!!personalDetailsErrors.mobile_number}
          helperText={personalDetailsErrors.mobile_number}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Alternative Contact"
          value={personalDetails.alternative_contact}
          onChange={(e) => setPersonalDetails(prev => ({ ...prev, alternative_contact: e.target.value }))}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="ID Number *"
          value={personalDetails.id_number}
          onChange={(e) => setPersonalDetails(prev => ({ ...prev, id_number: e.target.value }))}
          error={!!personalDetailsErrors.id_number}
          helperText={personalDetailsErrors.id_number}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Emergency Contact Name"
          value={personalDetails.emergency_contact_name}
          onChange={(e) => setPersonalDetails(prev => ({ ...prev, emergency_contact_name: e.target.value }))}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Emergency Contact Number"
          value={personalDetails.emergency_contact_number}
          onChange={(e) => setPersonalDetails(prev => ({ ...prev, emergency_contact_number: e.target.value }))}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Occupation"
          value={personalDetails.occupation}
          onChange={(e) => setPersonalDetails(prev => ({ ...prev, occupation: e.target.value }))}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Purpose of Stay"
          value={personalDetails.purpose_of_stay}
          onChange={(e) => setPersonalDetails(prev => ({ ...prev, purpose_of_stay: e.target.value }))}
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
        />
      </Grid>
    </Grid>
  );

  const renderReviewConfirm = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ color: theme.textPrimary, mb: 2 }}>
          Review & Confirm Booking
        </Typography>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Please review all details carefully before submitting your booking request.
        </Alert>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, backgroundColor: theme.cardBackground }}>
          <Typography variant="h6" sx={{ color: theme.textPrimary, mb: 2 }}>
            <CalendarTodayIcon sx={{ mr: 1 }} />
            Booking Details
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText 
                primary="Check-in Date" 
                secondary={dayjs(bookingData.check_in_date).format('MMM DD, YYYY')} 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Check-out Date" 
                secondary={dayjs(bookingData.check_out_date).format('MMM DD, YYYY')} 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Booking Type" 
                secondary={bookingData.booking_type} 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Number of Guests" 
                secondary={bookingData.number_of_guests} 
              />
            </ListItem>
            {bookingData.special_requests && (
              <ListItem>
                <ListItemText 
                  primary="Special Requests" 
                  secondary={bookingData.special_requests} 
                />
              </ListItem>
            )}
          </List>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, backgroundColor: theme.cardBackground }}>
          <Typography variant="h6" sx={{ color: theme.textPrimary, mb: 2 }}>
            <PersonIcon sx={{ mr: 1 }} />
            Personal Details
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText 
                primary="Name" 
                secondary={`${personalDetails.first_name} ${personalDetails.last_name}`} 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Email" 
                secondary={personalDetails.email} 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Mobile" 
                secondary={personalDetails.mobile_number} 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="ID Number" 
                secondary={personalDetails.id_number} 
              />
            </ListItem>
            {personalDetails.occupation && (
              <ListItem>
                <ListItemText 
                  primary="Occupation" 
                  secondary={personalDetails.occupation} 
                />
              </ListItem>
            )}
          </List>
        </Paper>
      </Grid>

      {pricingBreakdown && (
        <Grid item xs={12}>
          <Paper sx={{ p: 3, backgroundColor: theme.cardBackground }}>
            <Typography variant="h6" sx={{ color: theme.textPrimary, mb: 2 }}>
              <ReceiptIcon sx={{ mr: 1 }} />
              Final Pricing
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <Typography variant="body1" sx={{ color: theme.textSecondary }}>
                  Base Price ({pricingBreakdown.totalDays} days):
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body1" sx={{ color: theme.textPrimary, textAlign: 'right' }}>
                  {formatCurrency(pricingBreakdown.baseAmount)}
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body1" sx={{ color: theme.textSecondary }}>
                  Service Fee:
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body1" sx={{ color: theme.textPrimary, textAlign: 'right' }}>
                  {formatCurrency(pricingBreakdown.serviceFee)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>
              <Grid item xs={8}>
                <Typography variant="h5" sx={{ color: theme.textPrimary, fontWeight: 600 }}>
                  Total Amount:
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="h5" sx={{ color: theme.primary, textAlign: 'right', fontWeight: 600 }}>
                  {formatCurrency(pricingBreakdown.totalAmount)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      )}

      <Grid item xs={12}>
        <Alert severity="info">
          After submitting your booking request, the property owner will review your application and respond within 24-48 hours. 
          You will receive a notification once they approve or provide feedback on your request.
        </Alert>
      </Grid>
    </Grid>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
        <Button onClick={() => navigate('/user-allproperties')}>
          Back to Properties
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs sx={{ mb: 4 }}>
        <Link 
          color="inherit" 
          href="/user-allproperties"
          sx={{ color: theme.textSecondary }}
        >
          Properties
        </Link>
        <Typography sx={{ color: theme.textPrimary }}>
          Book Property
        </Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ color: theme.textPrimary, fontWeight: 600, mb: 2 }}>
          Book Your Stay
        </Typography>
        {property && (
          <Typography variant="body1" sx={{ color: theme.textSecondary }}>
            Complete your booking for {property.property_type} in {property.address}
          </Typography>
        )}
      </Box>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Card sx={{ backgroundColor: theme.cardBackground, mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          {activeStep === 0 && renderDateSelection()}
          {activeStep === 1 && renderPersonalDetails()}
          {activeStep === 2 && renderReviewConfirm()}
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          onClick={handleBack}
          disabled={activeStep === 0}
          sx={{ color: theme.textPrimary }}
        >
          Back
        </Button>
        
        <Box>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmitBooking}
              disabled={submitting}
              sx={{
                backgroundColor: theme.primary,
                '&:hover': { backgroundColor: theme.secondary }
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Booking Request'}
            </Button>
          ) : (
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
      </Box>

      <Dialog
        open={confirmDialog}
        onClose={() => setConfirmDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Booking Request</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to submit this booking request? Once submitted, 
            you cannot modify the details until the owner responds.
          </Typography>
          {pricingBreakdown && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: theme.isDark ? '#333' : '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="h6" sx={{ color: theme.primary }}>
                Total Amount: {formatCurrency(pricingBreakdown.totalAmount)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)} sx={{ color: theme.textSecondary }}>
            Cancel
          </Button>
          <Button 
            onClick={confirmSubmitBooking} 
            variant="contained"
            disabled={submitting}
            sx={{
              backgroundColor: theme.primary,
              '&:hover': { backgroundColor: theme.secondary }
            }}
          >
            {submitting ? 'Submitting...' : 'Confirm & Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      />
    </Container>
  );
};

export default UserBookingPage;