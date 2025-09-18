import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Paper,
  Alert,
  CircularProgress,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Avatar,
  Skeleton
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Payment as PaymentIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  ExpandMore as ExpandMoreIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import { getBookingRequestsAdmin, getActivityLogs } from '../../api/adminAPI';
import Pagination from '../../components/common/Pagination';
import AppSnackbar from '../../components/common/AppSnackbar';
import BookingExportDialog from '../../components/specific/BookingExportDialog';

const AdminBookingManagement = () => {
  const navigate = useNavigate();
  const { theme, isDark } = useTheme();
  
  // State management
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Pagination state
  const [paginationData, setPaginationData] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  
  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  
  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch bookings data
  const fetchBookings = async (page = 1) => {
    try {
      setLoading(true);
      const options = {
        page,
        limit: paginationData.limit,
        status: statusFilter,
        sort_by: sortBy,
        sort_order: sortOrder
      };
      
      const response = await getBookingRequestsAdmin(options);
      
      if (response && response.booking_requests) {
        setBookings(response.booking_requests);
        setPaginationData(prev => ({
          ...prev,
          page: response.pagination?.page || page,
          total: response.pagination?.total || 0,
          totalPages: response.pagination?.totalPages || 0
        }));
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to fetch booking data');
      setSnackbar({
        open: true,
        message: 'Failed to fetch booking data',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchBookings();
  }, [statusFilter, sortBy, sortOrder]);

  // Handle pagination
  const handlePageChange = (newPage) => {
    fetchBookings(newPage);
  };

  // Status configuration
  const getStatusConfig = (status) => {
    const configs = {
      'pending': { color: 'warning', icon: <PendingIcon />, label: 'Pending' },
      'approved': { color: 'success', icon: <CheckCircleIcon />, label: 'Approved' },
      'rejected': { color: 'error', icon: <CancelIcon />, label: 'Rejected' },
      'completed': { color: 'info', icon: <CheckCircleIcon />, label: 'Completed' },
      'cancelled': { color: 'default', icon: <CancelIcon />, label: 'Cancelled' }
    };
    return configs[status] || { color: 'default', icon: null, label: status };
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return `LKR ${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle view booking details
  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setViewDialogOpen(true);
  };

  // Filter bookings based on search query
  const filteredBookings = bookings.filter(booking => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      booking.first_name?.toLowerCase().includes(searchLower) ||
      booking.last_name?.toLowerCase().includes(searchLower) ||
      booking.email?.toLowerCase().includes(searchLower) ||
      booking.property_address?.toLowerCase().includes(searchLower) ||
      booking.id?.toString().includes(searchQuery)
    );
  });

  // Refresh data
  const handleRefresh = () => {
    fetchBookings(paginationData.page);
  };

  // Export functionality - Opens the export dialog
  const handleExport = () => {
    setExportDialogOpen(true);
  };

  return (
    <Container maxWidth="xl">
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton 
          onClick={() => navigate('/admin/dashboard')}
          sx={{ color: theme.primary }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ 
          fontWeight: 'bold', 
          color: isDark ? theme.textPrimary : 'inherit' 
        }}>
          Booking Management
        </Typography>
      </Box>

      {/* Controls Bar */}
      <Card sx={{ 
        mb: 3, 
        backgroundColor: isDark ? theme.cardBackground : '#ffffff',
        border: isDark ? `1px solid ${theme.border}` : 'none'
      }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            {/* Search */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: theme.primary }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: isDark ? theme.inputBackground : '#f8f9fa',
                  }
                }}
              />
            </Grid>

            {/* Status Filter */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Sort By */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="created_at">Date Created</MenuItem>
                  <MenuItem value="check_in_date">Check-in Date</MenuItem>
                  <MenuItem value="total_price">Total Amount</MenuItem>
                  <MenuItem value="status">Status</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Sort Order */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Order</InputLabel>
                <Select
                  value={sortOrder}
                  label="Order"
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <MenuItem value="desc">Newest First</MenuItem>
                  <MenuItem value="asc">Oldest First</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12} md={2}>
              <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                <Tooltip title="Refresh Data">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleRefresh}
                    startIcon={<RefreshIcon />}
                    sx={{ 
                      color: theme.primary,
                      borderColor: theme.primary,
                      '&:hover': {
                        borderColor: theme.primaryDark,
                        backgroundColor: `${theme.primary}10`
                      }
                    }}
                  >
                    Refresh
                  </Button>
                </Tooltip>
                <Tooltip title="Export Booking Data">
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleExport}
                    startIcon={<DownloadIcon />}
                    sx={{ 
                      backgroundColor: theme.secondary,
                      '&:hover': { 
                        backgroundColor: theme.secondaryDark || '#ff6b35'
                      }
                    }}
                  >
                    Export
                  </Button>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Bookings Table */}
      <Card sx={{
        backgroundColor: isDark ? theme.cardBackground : '#ffffff',
        border: isDark ? `1px solid ${theme.border}` : 'none'
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600,
              color: isDark ? theme.textPrimary : 'inherit'
            }}>
              Booking Requests ({filteredBookings.length} results)
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: theme.primary }} />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Guest</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Property</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Dates</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Duration</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Created</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredBookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          No booking requests found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBookings.map((booking) => {
                      const statusConfig = getStatusConfig(booking.status);
                      return (
                        <TableRow key={booking.id} hover>
                          <TableCell>#{booking.id}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 32, height: 32, bgcolor: theme.primary }}>
                                {booking.first_name?.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {booking.first_name} {booking.last_name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {booking.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {booking.property_type} - {booking.unit_type}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {booking.property_address}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(booking.check_in_date)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              to {formatDate(booking.check_out_date)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {booking.booking_days} days
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ({booking.booking_months} months)
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {formatCurrency(booking.total_price)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Advance: {formatCurrency(booking.advance_amount)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={statusConfig.icon}
                              label={statusConfig.label}
                              color={statusConfig.color}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(booking.created_at)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleViewBooking(booking)}
                                sx={{ color: theme.primary }}
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Pagination */}
          {paginationData.totalPages > 1 && (
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                currentPage={paginationData.page}
                totalPages={paginationData.totalPages}
                onPageChange={handlePageChange}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Booking Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <Typography variant="h6">
            Booking Details - #{selectedBooking?.id}
          </Typography>
          {selectedBooking && (
            <Chip
              icon={getStatusConfig(selectedBooking.status).icon}
              label={getStatusConfig(selectedBooking.status).label}
              color={getStatusConfig(selectedBooking.status).color}
              size="small"
            />
          )}
        </DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Grid container spacing={3}>
              {/* Guest Information */}
              <Grid item xs={12}>
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Guest Information
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" gutterBottom>
                          <strong>Name:</strong> {selectedBooking.first_name} {selectedBooking.last_name}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Email:</strong> {selectedBooking.email}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Phone:</strong> {selectedBooking.country_code} {selectedBooking.mobile_number}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" gutterBottom>
                          <strong>Birthdate:</strong> {formatDate(selectedBooking.birthdate)}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Nationality:</strong> {selectedBooking.nationality || 'N/A'}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Guests:</strong> {selectedBooking.number_of_guests || 1}
                        </Typography>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grid>

              {/* Property Information */}
              <Grid item xs={12}>
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      <HomeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Property Information
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" gutterBottom>
                          <strong>Type:</strong> {selectedBooking.property_type} - {selectedBooking.unit_type}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Address:</strong> {selectedBooking.property_address}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" gutterBottom>
                          <strong>Property ID:</strong> #{selectedBooking.property_id}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Owner ID:</strong> #{selectedBooking.property_owner_id}
                        </Typography>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grid>

              {/* Booking Details */}
              <Grid item xs={12}>
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      <CalendarIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Booking Details
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" gutterBottom>
                          <strong>Check-in:</strong> {formatDate(selectedBooking.check_in_date)}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Check-out:</strong> {formatDate(selectedBooking.check_out_date)}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Duration:</strong> {selectedBooking.booking_days} days ({selectedBooking.booking_months} months)
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" gutterBottom>
                          <strong>Total Price:</strong> {formatCurrency(selectedBooking.total_price)}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Advance Amount:</strong> {formatCurrency(selectedBooking.advance_amount)}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Remaining:</strong> {formatCurrency((selectedBooking.total_price || 0) - (selectedBooking.advance_amount || 0))}
                        </Typography>
                      </Grid>
                    </Grid>
                    {selectedBooking.special_requests && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" gutterBottom>
                          <strong>Special Requests:</strong>
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          backgroundColor: isDark ? theme.surfaceBackground : '#f8f9fa',
                          p: 2,
                          borderRadius: 1,
                          border: `1px solid ${isDark ? theme.border : '#e9ecef'}`
                        }}>
                          {selectedBooking.special_requests}
                        </Typography>
                      </Box>
                    )}
                  </AccordionDetails>
                </Accordion>
              </Grid>

              {/* Emergency Contact */}
              {(selectedBooking.emergency_contact_name || selectedBooking.emergency_contact_number) && (
                <Grid item xs={12}>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        <PhoneIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Emergency Contact
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" gutterBottom>
                        <strong>Name:</strong> {selectedBooking.emergency_contact_name || 'N/A'}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Number:</strong> {selectedBooking.emergency_contact_number || 'N/A'}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setViewDialogOpen(false)}
            sx={{ color: theme.primary }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Dialog */}
      <BookingExportDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        currentFilters={{
          status: statusFilter,
          sortBy: sortBy,
          sortOrder: sortOrder
        }}
      />

      {/* Snackbar */}
      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      />
    </Container>
  );
};

export default AdminBookingManagement;