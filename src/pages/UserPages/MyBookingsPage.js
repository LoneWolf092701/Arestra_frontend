import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Button,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import {
  BookmarkBorder as RequestedIcon,
  CheckCircle as AcceptedIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { getUserBookings } from '../../api/bookingApi';
import PropertyGrid from '../../components/common/PropertyGrid';
import AppSnackbar from '../../components/common/AppSnackbar';
import { isAuthenticated, getUserId } from '../../utils/auth';

const MyBookingsPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    date_from: '',
    date_to: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  const authenticated = isAuthenticated();
  const userId = getUserId();

  const loadBookings = async () => {
    if (!authenticated) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await getUserBookings({
        page: 1,
        limit: 100,
        status: filters.status !== 'all' ? filters.status : undefined,
        date_from: filters.date_from || undefined,
        date_to: filters.date_to || undefined
      });

      setBookings(response.bookings || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
      setError(`Failed to load bookings: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated) {
      loadBookings();
    }
  }, [authenticated, filters]);

  const transformBookingToProperty = (booking) => ({
    id: booking.property_id,
    booking_id: booking.id,
    property_type: booking.property_type || 'Property',
    unit_type: booking.unit_type || 'Unit',
    address: booking.property_address || booking.address || 'Address not available',
    price: booking.total_price || booking.price || 0,
    images: booking.images,
    amenities: booking.amenities,
    facilities: booking.facilities,
    description: booking.description,
    booking_status: booking.status,
    booking_date: booking.created_at,
    check_in_date: booking.check_in_date,
    check_out_date: booking.check_out_date,
    advance_amount: booking.advance_amount,
    service_fee: booking.service_fee,
    owner_response_message: booking.owner_response_message,
    payment_account_info: booking.payment_account_info,
    payment_method: booking.payment_method,
    owner_responded_at: booking.owner_responded_at,
    payment_submitted_at: booking.payment_submitted_at,
    payment_confirmed_at: booking.payment_confirmed_at,
    owner_username: booking.owner_username
  });

  const getFilteredBookings = (statusFilter) => {
    return bookings.filter(booking => {
      if (statusFilter === 'requested') {
        return ['pending', 'approved'].includes(booking.status);
      } else if (statusFilter === 'accepted') {
        return ['confirmed', 'payment_submitted'].includes(booking.status);
      }
      return true;
    }).map(transformBookingToProperty);
  };

  const requestedProperties = getFilteredBookings('requested');
  const acceptedProperties = getFilteredBookings('accepted');

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewProperty = (property) => {
    navigate(`/property/${property.id}`, {
      state: { 
        fromBookings: true, 
        bookingId: property.booking_id,
        bookingStatus: property.booking_status
      }
    });
  };

  if (!authenticated) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <Alert severity="warning">
          Please log in to view your bookings.
        </Alert>
        <Button variant="contained" onClick={() => navigate('/login')} sx={{ mt: 2 }}>
          Go to Login
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <HomeIcon sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h4" component="h1">
            My Bookings
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadBookings}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading your bookings...</Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color="primary">
                    {bookings.length}
                  </Typography>
                  <Typography variant="body2">Total Requests</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color="success.main">
                    {bookings.filter(b => ['confirmed', 'payment_submitted'].includes(b.status)).length}
                  </Typography>
                  <Typography variant="body2">Confirmed</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color="warning.main">
                    {bookings.filter(b => b.status === 'pending').length}
                  </Typography>
                  <Typography variant="body2">Pending</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color="info.main">
                    {bookings.filter(b => b.status === 'approved').length}
                  </Typography>
                  <Typography variant="body2">Approved</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FilterIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Filters</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filters.status}
                      label="Status"
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    >
                      <MenuItem value="all">All Statuses</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="approved">Approved</MenuItem>
                      <MenuItem value="payment_submitted">Payment Submitted</MenuItem>
                      <MenuItem value="confirmed">Confirmed</MenuItem>
                      <MenuItem value="rejected">Rejected</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
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
                <Grid item xs={12} sm={3}>
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
                <Grid item xs={12} sm={2}>
                  <Button
                    variant="outlined"
                    onClick={() => setFilters({ status: 'all', date_from: '', date_to: '' })}
                    fullWidth
                    size="small"
                  >
                    Clear
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab 
                  icon={<RequestedIcon />} 
                  label={`Requested (${requestedProperties.length})`}
                  iconPosition="start"
                />
                <Tab 
                  icon={<AcceptedIcon />} 
                  label={`Confirmed (${acceptedProperties.length})`}
                  iconPosition="start"
                />
              </Tabs>
            </Box>

            <Box sx={{ p: 3 }}>
              {activeTab === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Properties I Requested
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    These are properties where you've submitted booking requests.
                  </Typography>
                  
                  {requestedProperties.length > 0 ? (
                    <PropertyGrid
                      properties={requestedProperties}
                      loading={false}
                      onViewProperty={handleViewProperty}
                      variant="bookings"
                      emptyStateMessage="No requested properties found"
                      emptyStateSubtitle="You haven't made any booking requests yet."
                    />
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <RequestedIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No booking requests found
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        You haven't made any booking requests yet.
                      </Typography>
                      <Button 
                        variant="contained" 
                        onClick={() => navigate('/properties')}
                      >
                        Browse Properties
                      </Button>
                    </Box>
                  )}
                </Box>
              )}

              {activeTab === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Confirmed Bookings
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    These are your confirmed bookings where payment has been approved.
                  </Typography>
                  
                  {acceptedProperties.length > 0 ? (
                    <PropertyGrid
                      properties={acceptedProperties}
                      loading={false}
                      onViewProperty={handleViewProperty}
                      variant="bookings"
                      emptyStateMessage="No confirmed bookings found"
                      emptyStateSubtitle="You don't have any confirmed bookings yet."
                    />
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <AcceptedIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No confirmed bookings found
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        You don't have any confirmed bookings yet.
                      </Typography>
                      <Button 
                        variant="contained" 
                        onClick={() => navigate('/properties')}
                      >
                        Browse Properties
                      </Button>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Card>
        </>
      )}

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Container>
  );
};

export default MyBookingsPage;