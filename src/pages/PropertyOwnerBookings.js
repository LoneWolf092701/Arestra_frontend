import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  LinearProgress
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Payment as PaymentIcon,
  AttachFile as AttachFileIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarTodayIcon,
  Download as DownloadIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { 
  getOwnerBookings, 
  respondToBookingRequest, 
  getBookingDetails,
  getBookingStatistics,
  updateBookingStatus,
  exportBookingData
} from '../api/bookingApi';
import { getMyProperties } from '../api/propertyApi';
import { useTheme } from '../contexts/ThemeContext';
import AppSnackbar from '../components/common/AppSnackbar';
import {
  CardMedia
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  Receipt as ReceiptIcon,
  PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';

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
    'pending': 'Pending Your Response',
    'approved': 'Approved - Awaiting Payment',
    'payment_submitted': 'Payment Submitted - Review Required',
    'confirmed': 'Booking Confirmed',
    'rejected': 'Rejected',
    'auto_rejected': 'Auto Rejected',
    'payment_rejected': 'Payment Rejected',
    'cancelled': 'Cancelled'
  };
  return statusLabels[status] || status;
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

const PropertyOwnerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [responseDialog, setResponseDialog] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
  const [selectedTab, setSelectedTab] = useState(0);
  const [filters, setFilters] = useState({
    status: 'all',
    property_id: 'all',
    date_from: '',
    date_to: ''
  });
  
  const [responseData, setResponseData] = useState({
    action: 'approve',
    message: '',
    payment_instructions: ''
  });

  const [paymentVerification, setPaymentVerification] = useState({
    status: 'approved',
    notes: ''
  });

  const { isDark } = useTheme();

  const statusTabs = [
    { label: 'All Bookings', value: 'all' },
    { label: 'Pending', value: 'pending', badge: true },
    { label: 'Payment Review', value: 'payment_submitted', badge: true },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Completed', value: 'completed' },
    { label: 'Rejected/Cancelled', value: 'rejected,cancelled' }
  ];

  useEffect(() => {
    loadBookings();
    loadProperties();
    loadStatistics();
  }, [filters, selectedTab]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      
      const filterParams = { ...filters };
      
      if (selectedTab > 0) {
        const tabStatus = statusTabs[selectedTab].value;
        if (tabStatus !== 'all') {
          filterParams.status = tabStatus;
        }
      }
      
      const response = await getOwnerBookings({
        ...filterParams,
        page: 1,
        limit: 100,
        include_user_info: true,
        include_property_info: true,
        sort_by: 'created_at',
        sort_order: 'desc'
      });
      
      setBookings(response.bookings || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
      setSnackbar({
        open: true,
        message: 'Error loading bookings',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProperties = async () => {
    try {
      const response = await getMyProperties({ include_inactive: true });
      setProperties(response.properties || response || []);
    } catch (error) {
      console.error('Error loading properties:', error);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await getBookingStatistics({ period: 'monthly' });
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const handleBookingResponse = async () => {
    try {
      await respondToBookingRequest(selectedBooking.id, responseData);
      
      setResponseDialog(false);
      setResponseData({ action: 'approve', message: '', payment_instructions: '' });
      
      await loadBookings();
      
      setSnackbar({
        open: true,
        message: `Booking ${responseData.action}d successfully`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error responding to booking:', error);
      setSnackbar({
        open: true,
        message: 'Error responding to booking',
        severity: 'error'
      });
    }
  };

  const handlePaymentVerification = async () => {
    try {
      await updateBookingStatus(selectedBooking.id, {
        status: paymentVerification.status === 'approved' ? 'confirmed' : 'payment_rejected',
        verification_notes: paymentVerification.notes
      });
      
      setPaymentDialog(false);
      setPaymentVerification({ status: 'approved', notes: '' });
      
      await loadBookings();
      
      setSnackbar({
        open: true,
        message: `Payment ${paymentVerification.status}`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error verifying payment:', error);
      setSnackbar({
        open: true,
        message: 'Error verifying payment',
        severity: 'error'
      });
    }
  };

  const handleViewDetails = async (bookingId) => {
    try {
      const details = await getBookingDetails(bookingId);
      setSelectedBooking(details);
      setDetailsDialog(true);
    } catch (error) {
      console.error('Error loading booking details:', error);
      setSnackbar({
        open: true,
        message: 'Error loading booking details',
        severity: 'error'
      });
    }
  };

  const handleExportBookings = async () => {
    try {
      const blob = await exportBookingData({
        format: 'csv',
        ...filters,
        include_personal_data: true
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'property_owner_bookings.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setSnackbar({
        open: true,
        message: 'Bookings exported successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error exporting bookings:', error);
      setSnackbar({
        open: true,
        message: 'Error exporting bookings',
        severity: 'error'
      });
    }
  };

  const getPendingCount = (status) => {
    return bookings.filter(b => b.status === status).length;
  };

  const renderStatisticsCard = () => (
  <Card sx={{ mb: 3 }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Booking Statistics
      </Typography>
      {statistics ? (
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Typography variant="h4" color="primary">
              {statistics.total_bookings || 0}
            </Typography>
            <Typography variant="body2">Total Bookings</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="h4" color="success.main">
              {formatCurrency(statistics.total_revenue || 0)}
            </Typography>
            <Typography variant="body2">Total Revenue</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="h4" color="info.main">
              {formatCurrency(statistics.advance_collected || 0)}
            </Typography>
            <Typography variant="body2">Advance Collected</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="h4" color="warning.main">
              {formatCurrency(statistics.pending_advance || 0)}
            </Typography>
            <Typography variant="body2">Pending Advance</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="h4" color="secondary.main">
              {statistics.confirmed_bookings || 0}
            </Typography>
            <Typography variant="body2">Confirmed</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="h4" color="warning.main">
              {statistics.pending_bookings || 0}
            </Typography>
            <Typography variant="body2">Pending</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="h4" color="info.main">
              {formatCurrency(statistics.average_booking_value || 0)}
            </Typography>
            <Typography variant="body2">Avg Booking Value</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="h4" color="success.main">
              {formatCurrency(statistics.average_advance || 0)}
            </Typography>
            <Typography variant="body2">Avg Advance</Typography>
          </Grid>
        </Grid>
      ) : (
        <Typography>Loading statistics...</Typography>
      )}
    </CardContent>
  </Card>
);

  const renderFilters = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          <FilterListIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Filters
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Property</InputLabel>
              <Select
                value={filters.property_id}
                label="Property"
                onChange={(e) => setFilters(prev => ({ ...prev, property_id: e.target.value }))}
              >
                <MenuItem value="all">All Properties</MenuItem>
                {properties.map((property) => (
                  <MenuItem key={property.id} value={property.id}>
                    {property.property_type} - {property.address}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="From Date"
              InputLabelProps={{ shrink: true }}
              value={filters.date_from}
              onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="To Date"
              InputLabelProps={{ shrink: true }}
              value={filters.date_to}
              onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadBookings}
                size="small"
              >
                Refresh
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleExportBookings}
                size="small"
              >
                Export
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderBookingCard = (booking) => (
    <Card key={booking.id} sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Booking #{booking.id}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {booking.property_type} - {booking.property_address || booking.address}
            </Typography>
          </Box>
          <Chip
            label={getStatusLabel(booking.status)}
            color={getStatusColor(booking.status)}
            size="small"
          />
        </Box>

        <Grid container spacing={2} sx={{ mb: 2 }}>
  <Grid item xs={12} sm={6} md={3}>
    <Typography variant="body2">
      <PersonIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
      <strong>Guest:</strong> {booking.first_name} {booking.last_name}
    </Typography>
  </Grid>
  <Grid item xs={12} sm={6} md={3}>
    <Typography variant="body2">
      <CalendarTodayIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
      <strong>Dates:</strong> {formatDate(booking.check_in_date)} - {formatDate(booking.check_out_date)}
    </Typography>
  </Grid>
  <Grid item xs={12} sm={6} md={3}>
    <Typography variant="body2">
      <strong>Duration:</strong> {booking.booking_days} days ({booking.booking_months} months)
    </Typography>
  </Grid>
  <Grid item xs={12} sm={6} md={3}>
    <Typography variant="body2">
      <strong>Total:</strong> {formatCurrency(booking.total_price)}
    </Typography>
  </Grid>
  <Grid item xs={12} sm={6} md={3}>
    <Typography variant="body2">
      <strong>Advance:</strong> {formatCurrency(booking.advance_amount)}
    </Typography>
  </Grid>
  <Grid item xs={12} sm={6} md={3}>
    <Typography variant="body2">
      <strong>Remaining:</strong> {formatCurrency((booking.total_price || 0) - (booking.advance_amount || 0))}
    </Typography>
  </Grid>
</Grid>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2">Guest Information & Details</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Contact Information</Typography>
                <Typography variant="body2">
                  <EmailIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                  {booking.email}
                </Typography>
                <Typography variant="body2">
                  <PhoneIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                  {booking.country_code} {booking.mobile_number}
                </Typography>
                {booking.birthdate && (
                  <Typography variant="body2">
                    <strong>Birth Date:</strong> {formatDate(booking.birthdate)}
                  </Typography>
                )}
                {booking.gender && (
                  <Typography variant="body2">
                    <strong>Gender:</strong> {booking.gender}
                  </Typography>
                )}
                {booking.nationality && (
                  <Typography variant="body2">
                    <strong>Nationality:</strong> {booking.nationality}
                  </Typography>
                )}
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Professional Information</Typography>
                {booking.occupation && (
                  <Typography variant="body2">
                    <BusinessIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                    <strong>Occupation:</strong> {booking.occupation}
                  </Typography>
                )}
                {booking.field && (
                  <Typography variant="body2">
                    <strong>Field:</strong> {booking.field}
                  </Typography>
                )}
                {booking.destination && (
                  <Typography variant="body2">
                    <strong>Destination:</strong> {booking.destination}
                  </Typography>
                )}
              </Grid>

              {booking.relocation_details && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>Relocation Details</Typography>
                  <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                    "{booking.relocation_details}"
                  </Typography>
                </Grid>
              )}

              {booking.owner_response_message && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>Your Response</Typography>
                  <Typography variant="body2">
                    {booking.owner_response_message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Responded on: {formatDateTime(booking.owner_responded_at)}
                  </Typography>
                </Grid>
              )}

              {(booking.payment_proof_url || booking.payment_account_info) && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>Payment Information</Typography>
                  {booking.payment_account_info && (
                    <Typography variant="body2">
                      <strong>Account Info:</strong> {booking.payment_account_info}
                    </Typography>
                  )}
                  {booking.payment_proof_url && (
                    <Typography variant="body2">
                      <AttachFileIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                      <Button 
                        size="small" 
                        href={booking.payment_proof_url} 
                        target="_blank"
                        sx={{ textTransform: 'none' }}
                      >
                        View Payment Proof
                      </Button>
                    </Typography>
                  )}
                  {booking.payment_submitted_at && (
                    <Typography variant="caption" color="text.secondary">
                      Payment submitted: {formatDateTime(booking.payment_submitted_at)}
                    </Typography>
                  )}
                </Grid>
              )}

              {booking.verification_document_url && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>Verification Document</Typography>
                  <Typography variant="body2">
                    <strong>Document Type:</strong> {booking.verification_document_type}
                  </Typography>
                  <Button 
                    size="small" 
                    href={booking.verification_document_url} 
                    target="_blank"
                    startIcon={<AttachFileIcon />}
                    sx={{ textTransform: 'none' }}
                  >
                    View Document
                  </Button>
                </Grid>
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Submitted: {formatDateTime(booking.created_at)}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              startIcon={<VisibilityIcon />}
              onClick={() => handleViewDetails(booking.id)}
            >
              View Details
            </Button>
            
            {booking.status === 'pending' && (
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={() => {
                  setSelectedBooking(booking);
                  setResponseDialog(true);
                }}
              >
                Respond
              </Button>
            )}
            
            {booking.status === 'payment_submitted' && (
              <Button
                size="small"
                variant="contained"
                color="warning"
                startIcon={<PaymentIcon />}
                onClick={() => {
                  setSelectedBooking(booking);
                  setPaymentDialog(true);
                }}
              >
                Verify Payment
              </Button>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading && bookings.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        Property Owner Bookings
      </Typography>

      {renderStatisticsCard()}
      {renderFilters()}

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(e, newValue) => setSelectedTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {statusTabs.map((tab, index) => (
            <Tab
              key={index}
              label={
                tab.badge ? (
                  <Badge
                    badgeContent={getPendingCount(tab.value)}
                    color="error"
                    invisible={getPendingCount(tab.value) === 0}
                  >
                    {tab.label}
                  </Badge>
                ) : tab.label
              }
            />
          ))}
        </Tabs>
      </Paper>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {bookings.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No bookings found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            When guests book your properties, they will appear here.
          </Typography>
        </Paper>
      ) : (
        <Box>
          {bookings.map(renderBookingCard)}
        </Box>
      )}

      <Dialog
        open={responseDialog}
        onClose={() => setResponseDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Respond to Booking Request</DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body1" gutterBottom>
  <strong>Guest:</strong> {selectedBooking.first_name} {selectedBooking.last_name}
</Typography>
<Typography variant="body1" gutterBottom>
  <strong>Dates:</strong> {formatDate(selectedBooking.check_in_date)} - {formatDate(selectedBooking.check_out_date)}
</Typography>
<Typography variant="body1" gutterBottom>
  <strong>Total Amount:</strong> {formatCurrency(selectedBooking.total_price)}
</Typography>
<Typography variant="body1" gutterBottom>
  <strong>Advance Required:</strong> {formatCurrency(selectedBooking.advance_amount)}
</Typography>
<Typography variant="body1" gutterBottom sx={{ mb: 3 }}>
  <strong>Remaining on Check-in:</strong> {formatCurrency((selectedBooking.total_price || 0) - (selectedBooking.advance_amount || 0))}
</Typography>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Response</InputLabel>
                <Select
                  value={responseData.action}
                  label="Response"
                  onChange={(e) => setResponseData(prev => ({ ...prev, action: e.target.value }))}
                >
                  <MenuItem value="approve">Approve Booking</MenuItem>
                  <MenuItem value="reject">Reject Booking</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Message to Guest"
                value={responseData.message}
                onChange={(e) => setResponseData(prev => ({ ...prev, message: e.target.value }))}
                sx={{ mb: 3 }}
              />
              
              {responseData.action === 'approve' && (
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Payment Instructions"
                  value={responseData.payment_instructions}
                  onChange={(e) => setResponseData(prev => ({ ...prev, payment_instructions: e.target.value }))}
                  placeholder="Provide payment details, bank account information, or payment methods..."
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResponseDialog(false)}>Cancel</Button>
          <Button onClick={handleBookingResponse} variant="contained">
            Send Response
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={paymentDialog}
        onClose={() => setPaymentDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Verify Payment</DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body1" gutterBottom>
  <strong>Booking:</strong> #{selectedBooking.id}
</Typography>
<Typography variant="body1" gutterBottom>
  <strong>Total Amount:</strong> {formatCurrency(selectedBooking.total_price)}
</Typography>
<Typography variant="body1" gutterBottom>
  <strong>Advance Amount:</strong> {formatCurrency(selectedBooking.advance_amount)}
</Typography>
<Typography variant="body1" gutterBottom sx={{ mb: 3 }}>
  <strong>Payment Status:</strong> {selectedBooking.status}
</Typography>

<Alert severity="info" sx={{ mb: 2 }}>
  Guest needs to pay advance of {formatCurrency(selectedBooking.advance_amount)} to confirm booking.
  Remaining {formatCurrency((selectedBooking.total_price || 0) - (selectedBooking.advance_amount || 0))} 
  will be collected on check-in.
</Alert>
              
              {selectedBooking.payment_proof_url && (
                <Box sx={{ mb: 3 }}>
                  <Button
                    variant="outlined"
                    href={selectedBooking.payment_proof_url}
                    target="_blank"
                    startIcon={<AttachFileIcon />}
                    fullWidth
                  >
                    View Payment Proof
                  </Button>
                </Box>
              )}
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Payment Status</InputLabel>
                <Select
                  value={paymentVerification.status}
                  label="Payment Status"
                  onChange={(e) => setPaymentVerification(prev => ({ ...prev, status: e.target.value }))}
                >
                  <MenuItem value="approved">Approve Payment - Confirm Booking</MenuItem>
                  <MenuItem value="rejected">Reject Payment - Request Resubmission</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Verification Notes"
                value={paymentVerification.notes}
                onChange={(e) => setPaymentVerification(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add notes about the payment verification..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialog(false)}>Cancel</Button>
          <Button onClick={handlePaymentVerification} variant="contained">
            Update Payment Status
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

export default PropertyOwnerBookings;