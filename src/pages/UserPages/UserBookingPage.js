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
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip
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
  Description as DescriptionIcon
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
  formatPricingBreakdown,
  checkDateConflicts
} from '../../utils/BookingCalculationUtils';
import AppSnackbar from '../../components/common/AppSnackbar';

const steps = ['Select Dates', 'Personal Details', 'Review & Confirm'];

const safeParse = (str) => {
  try {
    return typeof str === 'string' ? JSON.parse(str) : (str || []);
  } catch (error) {
    return [];
  }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2
  }).format(amount || 0);
};

const formatDate = (dateString) => {
  if (!dateString) return 'Not specified';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return 'Not specified';
  return new Date(dateTimeString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusColor = (status) => {
  const statusColors = {
    'pending': 'warning',
    'approved': 'info',
    'payment_submitted': 'primary',
    'confirmed': 'success',
    'rejected': 'error',
    'auto_rejected': 'error',
    'payment_rejected': 'error',
    'cancelled': 'default'
  };
  return statusColors[status] || 'default';
};

const getStatusLabel = (status) => {
  const statusLabels = {
    'pending': 'Pending Owner Response',
    'approved': 'Approved - Payment Needed',
    'payment_submitted': 'Payment Under Review',
    'confirmed': 'Booking Confirmed',
    'rejected': 'Rejected by Owner',
    'auto_rejected': 'Auto Rejected',
    'payment_rejected': 'Payment Rejected',
    'cancelled': 'Cancelled'
  };
  return statusLabels[status] || status;
};

const UserBookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState(0);
  const [property, setProperty] = useState(null);
  const [propertyStatus, setPropertyStatus] = useState(null);
  const [existingBookings, setExistingBookings] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
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
  const [bookingDetailsDialog, setBookingDetailsDialog] = useState(false);

  useEffect(() => {
    const loadPropertyData = async () => {
      try {
        setLoading(true);
        
        const propertyData = await getPublicPropertyById(id);
        setProperty(propertyData);
        
        const statusData = await getPropertyAvailabilityStatus(id);
        setPropertyStatus(statusData);
        setExistingBookings(statusData.confirmed_bookings || []);
        
        if (statusData.statistics?.pending_requests > 0) {
          setCompetitionInfo({
            count: statusData.statistics.pending_requests,
            message: statusData.status_message
          });
        }
        
        const bookingsData = await getUserBookings({ property_id: id });
        setUserBookings(bookingsData.bookings || []);
        
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

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const userProfile = await getUserProfile();
        setPersonalDetails(prev => ({
          ...prev,
          firstName: userProfile.firstName || userProfile.first_name || '',
          lastName: userProfile.lastName || userProfile.last_name || '',
          email: userProfile.email || '',
          mobileNumber: userProfile.phone || userProfile.mobile_number || '',
          birthdate: userProfile.birthdate ? dayjs(userProfile.birthdate) : null,
          gender: userProfile.gender || '',
          nationality: userProfile.nationality || '',
          occupation: userProfile.occupation || '',
          field: userProfile.field || ''
        }));
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };

    loadUserProfile();
  }, []);

  useEffect(() => {
    if (bookingDates.checkIn && bookingDates.checkOut && property) {
      const validation = validateBookingDates(bookingDates.checkIn, bookingDates.checkOut);
      setDateValidation(validation);
      
      if (validation.isValid) {
        const pricing = calculateBookingPricing({
          monthlyRent: parseFloat(property.price) || 0,
          checkInDate: bookingDates.checkIn,
          checkOutDate: bookingDates.checkOut,
          serviceFee: 300
        });
        
        setPricingBreakdown(pricing);
        
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
            message: `${conflicts.pendingCount} other guests have requests for overlapping dates`
          });
        }
      } else {
        setPricingBreakdown(null);
      }
    }
  }, [bookingDates, property, existingBookings]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleBookingSubmit = async () => {
    try {
      setSubmitting(true);
      
      const bookingData = {
        property_id: parseInt(id),
        first_name: personalDetails.firstName,
        last_name: personalDetails.lastName,
        email: personalDetails.email,
        country_code: personalDetails.countryCode,
        mobile_number: personalDetails.mobileNumber,
        birthdate: personalDetails.birthdate ? personalDetails.birthdate.format('YYYY-MM-DD') : null,
        gender: personalDetails.gender || null,
        nationality: personalDetails.nationality || null,
        occupation: personalDetails.occupation || null,
        field: personalDetails.field || null,
        destination: personalDetails.destination || null,
        relocation_details: personalDetails.relocationDetails || null,
        check_in_date: dayjs(bookingDates.checkIn).format('YYYY-MM-DD'),
        check_out_date: dayjs(bookingDates.checkOut).format('YYYY-MM-DD'),
        total_price: pricingBreakdown.totalAmount,
        service_fee: pricingBreakdown.serviceFee,
        booking_days: pricingBreakdown.totalDays,
        booking_months: pricingBreakdown.totalMonths
      };

      const response = await submitBookingRequest(bookingData);
      
      setSnackbar({
        open: true,
        message: 'Booking request submitted successfully! You will be notified when the owner responds.',
        severity: 'success'
      });
      
      setTimeout(() => {
        navigate('/user-bookings');
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
      setConfirmDialog(false);
    }
  };

  const handleViewBookingDetails = async (bookingId) => {
    try {
      const bookingDetails = await getBookingDetails(bookingId);
      setSelectedBooking(bookingDetails);
      setBookingDetailsDialog(true);
    } catch (error) {
      console.error('Error fetching booking details:', error);
      setSnackbar({
        open: true,
        message: 'Error loading booking details',
        severity: 'error'
      });
    }
  };

  const renderExistingBookingsSection = () => {
    if (userBookings.length === 0) return null;

    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Your Previous Bookings for This Property
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Booking ID</TableCell>
                <TableCell>Dates</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Submitted</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {userBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>#{booking.id}</TableCell>
                  <TableCell>
                    {formatDate(booking.check_in_date)} - {formatDate(booking.check_out_date)}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getStatusLabel(booking.status)} 
                      color={getStatusColor(booking.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatCurrency(booking.total_price)}</TableCell>
                  <TableCell>{formatDate(booking.created_at)}</TableCell>
                  <TableCell>
                    <Button 
                      size="small" 
                      onClick={() => handleViewBookingDetails(booking.id)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  };

  const renderBookingDetailsDialog = () => {
    if (!selectedBooking) return null;

    return (
      <Dialog 
        open={bookingDetailsDialog} 
        onClose={() => setBookingDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Booking Details - #{selectedBooking.id}
          <Chip 
            label={getStatusLabel(selectedBooking.status)} 
            color={getStatusColor(selectedBooking.status)}
            sx={{ ml: 2 }}
          />
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Personal Information
                </Typography>
                <Typography><strong>Name:</strong> {selectedBooking.first_name} {selectedBooking.last_name}</Typography>
                <Typography><strong>Email:</strong> {selectedBooking.email}</Typography>
                <Typography><strong>Phone:</strong> {selectedBooking.country_code} {selectedBooking.mobile_number}</Typography>
                {selectedBooking.birthdate && (
                  <Typography><strong>Birthdate:</strong> {formatDate(selectedBooking.birthdate)}</Typography>
                )}
                {selectedBooking.gender && (
                  <Typography><strong>Gender:</strong> {selectedBooking.gender}</Typography>
                )}
                {selectedBooking.nationality && (
                  <Typography><strong>Nationality:</strong> {selectedBooking.nationality}</Typography>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Professional Information
                </Typography>
                {selectedBooking.occupation && (
                  <Typography><strong>Occupation:</strong> {selectedBooking.occupation}</Typography>
                )}
                {selectedBooking.field && (
                  <Typography><strong>Field:</strong> {selectedBooking.field}</Typography>
                )}
                {selectedBooking.destination && (
                  <Typography><strong>Destination:</strong> {selectedBooking.destination}</Typography>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  <CalendarTodayIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Booking Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography><strong>Check-in:</strong> {formatDate(selectedBooking.check_in_date)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography><strong>Check-out:</strong> {formatDate(selectedBooking.check_out_date)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography><strong>Duration:</strong> {selectedBooking.booking_days} days ({selectedBooking.booking_months} months)</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography><strong>Total Price:</strong> {formatCurrency(selectedBooking.total_price)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography><strong>Service Fee:</strong> {formatCurrency(selectedBooking.service_fee)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography><strong>Submitted:</strong> {formatDateTime(selectedBooking.created_at)}</Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {selectedBooking.relocation_details && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    <DescriptionIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Relocation Details
                  </Typography>
                  <Typography>{selectedBooking.relocation_details}</Typography>
                </Paper>
              </Grid>
            )}

            {(selectedBooking.owner_response_message || selectedBooking.owner_responded_at) && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Owner Response
                  </Typography>
                  {selectedBooking.owner_responded_at && (
                    <Typography><strong>Responded on:</strong> {formatDateTime(selectedBooking.owner_responded_at)}</Typography>
                  )}
                  {selectedBooking.owner_response_message && (
                    <Typography sx={{ mt: 1 }}><strong>Message:</strong> {selectedBooking.owner_response_message}</Typography>
                  )}
                </Paper>
              </Grid>
            )}

            {(selectedBooking.payment_account_info || selectedBooking.payment_proof_url) && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    <PaymentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Payment Information
                  </Typography>
                  {selectedBooking.payment_account_info && (
                    <Typography><strong>Account Info:</strong> {selectedBooking.payment_account_info}</Typography>
                  )}
                  {selectedBooking.payment_proof_url && (
                    <Typography sx={{ mt: 1 }}>
                      <strong>Payment Proof:</strong> 
                      <Button size="small" href={selectedBooking.payment_proof_url} target="_blank" sx={{ ml: 1 }}>
                        View Document
                      </Button>
                    </Typography>
                  )}
                  {selectedBooking.payment_submitted_at && (
                    <Typography><strong>Payment Submitted:</strong> {formatDateTime(selectedBooking.payment_submitted_at)}</Typography>
                  )}
                  {selectedBooking.payment_confirmed_at && (
                    <Typography><strong>Payment Confirmed:</strong> {formatDateTime(selectedBooking.payment_confirmed_at)}</Typography>
                  )}
                </Paper>
              </Grid>
            )}

            {(selectedBooking.verification_document_url || selectedBooking.verification_document_type) && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    <AttachFileIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Verification Documents
                  </Typography>
                  {selectedBooking.verification_document_type && (
                    <Typography><strong>Document Type:</strong> {selectedBooking.verification_document_type}</Typography>
                  )}
                  {selectedBooking.verification_document_url && (
                    <Typography sx={{ mt: 1 }}>
                      <strong>Document:</strong> 
                      <Button size="small" href={selectedBooking.verification_document_url} target="_blank" sx={{ ml: 1 }}>
                        View Document
                      </Button>
                    </Typography>
                  )}
                </Paper>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookingDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select Your Stay Dates
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Check-in Date"
                    value={bookingDates.checkIn}
                    onChange={(newValue) => setBookingDates(prev => ({ ...prev, checkIn: newValue }))}
                    minDate={dayjs()}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Check-out Date"
                    value={bookingDates.checkOut}
                    onChange={(newValue) => setBookingDates(prev => ({ ...prev, checkOut: newValue }))}
                    minDate={bookingDates.checkIn ? dayjs(bookingDates.checkIn).add(1, 'day') : dayjs().add(1, 'day')}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
              </Grid>
            </LocalizationProvider>

            {dateValidation.errors.length > 0 && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {dateValidation.errors.map((error, index) => (
                  <Typography key={index}>{error}</Typography>
                ))}
              </Alert>
            )}

            {dateValidation.warnings.length > 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                {dateValidation.warnings.map((warning, index) => (
                  <Typography key={index}>{warning}</Typography>
                ))}
              </Alert>
            )}

            {competitionInfo && (
              <Alert severity="info" sx={{ mt: 2 }} icon={<InfoIcon />}>
                <Typography variant="body2">
                  {competitionInfo.message}
                </Typography>
              </Alert>
            )}

            {pricingBreakdown && (
              <Paper sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Pricing Breakdown
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography>Duration: {pricingBreakdown.totalDays} days ({pricingBreakdown.totalMonths} months)</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>Monthly Rate: {formatCurrency(property.price)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>Rental Amount: {formatCurrency(pricingBreakdown.rentalAmount)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>Service Fee: {formatCurrency(pricingBreakdown.serviceFee)}</Typography>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6">
                  Total Amount: {formatCurrency(pricingBreakdown.totalAmount)}
                </Typography>
              </Paper>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={personalDetails.firstName}
                  onChange={(e) => setPersonalDetails(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={personalDetails.lastName}
                  onChange={(e) => setPersonalDetails(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={personalDetails.email}
                  onChange={(e) => setPersonalDetails(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    label="Code"
                    value={personalDetails.countryCode}
                    onChange={(e) => setPersonalDetails(prev => ({ ...prev, countryCode: e.target.value }))}
                    sx={{ width: 100 }}
                  />
                  <TextField
                    fullWidth
                    label="Mobile Number"
                    value={personalDetails.mobileNumber}
                    onChange={(e) => setPersonalDetails(prev => ({ ...prev, mobileNumber: e.target.value }))}
                    required
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Birth Date"
                    value={personalDetails.birthdate}
                    onChange={(newValue) => setPersonalDetails(prev => ({ ...prev, birthdate: newValue }))}
                    maxDate={dayjs().subtract(18, 'year')}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={personalDetails.gender}
                    label="Gender"
                    onChange={(e) => setPersonalDetails(prev => ({ ...prev, gender: e.target.value }))}
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nationality"
                  value={personalDetails.nationality}
                  onChange={(e) => setPersonalDetails(prev => ({ ...prev, nationality: e.target.value }))}
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
                  label="Field of Work"
                  value={personalDetails.field}
                  onChange={(e) => setPersonalDetails(prev => ({ ...prev, field: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Destination/Purpose"
                  value={personalDetails.destination}
                  onChange={(e) => setPersonalDetails(prev => ({ ...prev, destination: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Relocation Details"
                  multiline
                  rows={3}
                  value={personalDetails.relocationDetails}
                  onChange={(e) => setPersonalDetails(prev => ({ ...prev, relocationDetails: e.target.value }))}
                  placeholder="Please provide any additional details about your relocation or stay requirements..."
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Booking
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Booking Summary
                  </Typography>
                  <Typography><strong>Check-in:</strong> {formatDate(bookingDates.checkIn)}</Typography>
                  <Typography><strong>Check-out:</strong> {formatDate(bookingDates.checkOut)}</Typography>
                  <Typography><strong>Duration:</strong> {pricingBreakdown?.totalDays} days</Typography>
                  <Typography><strong>Guest:</strong> {personalDetails.firstName} {personalDetails.lastName}</Typography>
                  <Typography><strong>Contact:</strong> {personalDetails.email}</Typography>
                  <Typography><strong>Phone:</strong> {personalDetails.countryCode} {personalDetails.mobileNumber}</Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="h6" color="primary">
                    Total Amount: {formatCurrency(pricingBreakdown?.totalAmount)}
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Property Details
                  </Typography>
                  <Typography><strong>Type:</strong> {property?.property_type}</Typography>
                  <Typography><strong>Location:</strong> {property?.address}</Typography>
                  <Typography><strong>Monthly Rate:</strong> {formatCurrency(property?.price)}</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!property) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          Property not found or not available for booking.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Book Property: {property.property_type} - {property.unit_type}
      </Typography>

      {renderExistingBookingsSection()}

      <Paper sx={{ p: 4 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent(activeStep)}

        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
          <Button
            color="inherit"
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={() => setConfirmDialog(true)}
              disabled={!dateValidation.isValid || !personalDetails.firstName || !personalDetails.lastName || !personalDetails.email}
            >
              Submit Booking Request
            </Button>
          ) : (
            <Button 
              variant="contained" 
              onClick={handleNext}
              disabled={
                (activeStep === 0 && !dateValidation.isValid) ||
                (activeStep === 1 && (!personalDetails.firstName || !personalDetails.lastName || !personalDetails.email))
              }
            >
              Next
            </Button>
          )}
        </Box>
      </Paper>

      <Dialog
        open={confirmDialog}
        onClose={() => setConfirmDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Booking Request</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to submit this booking request? You will be charged {formatCurrency(pricingBreakdown?.totalAmount)} if approved.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>Cancel</Button>
          <Button onClick={handleBookingSubmit} variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={24} /> : 'Confirm Booking'}
          </Button>
        </DialogActions>
      </Dialog>

      {renderBookingDetailsDialog()}

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Container>
  );
};

export default UserBookingPage;