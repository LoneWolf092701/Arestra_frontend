import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Avatar,
  Tab,
  Tabs,
  Badge
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';
import AppSnackbar from '../components/common/AppSnackbar';

const PropertyOwnerBookings = () => {
  const { theme, isDark } = useTheme();
  const [bookingRequests, setBookingRequests] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [responseDialog, setResponseDialog] = useState({ open: false, type: '', request: null });
  const [responseForm, setResponseForm] = useState({
    message: '',
    paymentAccountInfo: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Tab configuration
  const tabs = [
    { label: 'Pending Requests', status: 'pending' },
    { label: 'Approved', status: 'approved' },
    { label: 'Payment Submitted', status: 'payment_submitted' },
    { label: 'Confirmed', status: 'confirmed' },
    { label: 'All Requests', status: 'all' }
  ];

  // Load booking requests
  useEffect(() => {
    fetchBookingRequests();
  }, []);

  const fetchBookingRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/bookings/owner-requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBookingRequests(data);
      } else {
        showSnackbar('Failed to load booking requests', 'error');
      }
    } catch (error) {
      console.error('Error fetching booking requests:', error);
      showSnackbar('Network error loading requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Filter requests based on selected tab
  const getFilteredRequests = () => {
    const currentTab = tabs[selectedTab];
    if (currentTab.status === 'all') {
      return bookingRequests;
    }
    return bookingRequests.filter(request => request.status === currentTab.status);
  };

  // Get count for each tab
  const getTabCount = (status) => {
    if (status === 'all') return bookingRequests.length;
    return bookingRequests.filter(request => request.status === status).length;
  };

  // Handle owner response (approve/reject)
  const handleOwnerResponse = async (action) => {
    if (!responseDialog.request) return;

    if (action === 'approve' && !responseForm.paymentAccountInfo.trim()) {
      showSnackbar('Payment account information is required for approval', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookings/owner-response/${responseDialog.request.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action,
          message: responseForm.message,
          payment_account_info: action === 'approve' ? responseForm.paymentAccountInfo : null
        })
      });

      if (response.ok) {
        showSnackbar(`Request ${action}d successfully`, 'success');
        setResponseDialog({ open: false, type: '', request: null });
        setResponseForm({ message: '', paymentAccountInfo: '' });
        fetchBookingRequests(); // Refresh the list
      } else {
        const errorData = await response.json();
        showSnackbar(errorData.error || `Failed to ${action} request`, 'error');
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      showSnackbar('Network error. Please try again.', 'error');
    }
  };

  // Handle payment confirmation
  const handlePaymentConfirmation = async (requestId, action) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookings/confirm/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          action, 
          message: action === 'reject_payment' ? 'Payment verification failed' : 'Payment confirmed' 
        })
      });

      if (response.ok) {
        showSnackbar(`Booking ${action === 'confirm' ? 'confirmed' : 'rejected'} successfully`, 'success');
        fetchBookingRequests();
      } else {
        const errorData = await response.json();
        showSnackbar(errorData.error || 'Failed to process request', 'error');
      }
    } catch (error) {
      console.error('Error processing payment confirmation:', error);
      showSnackbar('Network error. Please try again.', 'error');
    }
  };

  // Get status color and icon
  const getStatusDisplay = (status) => {
    const configs = {
      pending: { color: '#ff9800', icon: '⏳', label: 'Pending Review' },
      approved: { color: '#4caf50', icon: '✅', label: 'Approved' },
      rejected: { color: '#f44336', icon: '❌', label: 'Rejected' },
      payment_submitted: { color: '#2196f3', icon: '💳', label: 'Payment Submitted' },
      confirmed: { color: '#4caf50', icon: '🎉', label: 'Confirmed' },
      cancelled: { color: '#9e9e9e', icon: '🚫', label: 'Cancelled' }
    };
    return configs[status] || { color: '#9e9e9e', icon: '❓', label: status };
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render booking request card
  const renderBookingCard = (request) => {
    const statusConfig = getStatusDisplay(request.status);
    
    return (
      <Card 
        key={request.id}
        sx={{ 
          mb: 2,
          backgroundColor: theme.cardBackground,
          border: `1px solid ${theme.border}`,
          '&:hover': {
            boxShadow: theme.shadows.medium,
            borderColor: theme.primary
          }
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ color: theme.textPrimary, fontWeight: 600 }}>
                {request.property_type} - {request.unit_type}
              </Typography>
              <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                Request #{request.id} • {formatDate(request.created_at)}
              </Typography>
            </Box>
            <Chip 
              label={statusConfig.label}
              sx={{ 
                backgroundColor: `${statusConfig.color}20`,
                color: statusConfig.color,
                fontWeight: 600
              }}
            />
          </Box>

          {/* Tenant Information */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: theme.primary, mr: 2 }}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {request.first_name} {request.last_name}
              </Typography>
              <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                {request.email} • {request.country_code} {request.mobile_number}
              </Typography>
            </Box>
          </Box>

          {/* Booking Details */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                <strong>Check-in:</strong> {new Date(request.check_in_date).toLocaleDateString()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                <strong>Check-out:</strong> {new Date(request.check_out_date).toLocaleDateString()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                <strong>Occupation:</strong> {request.occupation}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                <strong>Field:</strong> {request.field}
              </Typography>
            </Grid>
          </Grid>

          {/* Total Amount */}
          <Box sx={{ 
            p: 2, 
            backgroundColor: theme.surfaceBackground, 
            borderRadius: 1, 
            mb: 3 
          }}>
            <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 600 }}>
              Total Amount: LKR {(request.total_price + request.service_fee).toLocaleString()}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.textSecondary }}>
              Rent: LKR {request.total_price.toLocaleString()} + Service Fee: LKR {request.service_fee.toLocaleString()}
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {request.status === 'pending' && (
              <>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => setResponseDialog({ open: true, type: 'approve', request })}
                >
                  Approve
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => setResponseDialog({ open: true, type: 'reject', request })}
                >
                  Reject
                </Button>
              </>
            )}

            {request.status === 'payment_submitted' && (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => handlePaymentConfirmation(request.id, 'confirm')}
                >
                  Confirm Payment
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => handlePaymentConfirmation(request.id, 'reject_payment')}
                >
                  Reject Payment
                </Button>
                {request.payment_proof_url && (
                  <Button
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    onClick={() => window.open(request.payment_proof_url, '_blank')}
                  >
                    View Payment Proof
                  </Button>
                )}
                {request.verification_document_url && (
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => window.open(request.verification_document_url, '_blank')}
                  >
                    View ID Document
                  </Button>
                )}
              </>
            )}

            <Button
              variant="text"
              startIcon={<VisibilityIcon />}
              onClick={() => setSelectedRequest(request)}
            >
              View Details
            </Button>
          </Box>

          {/* Additional Information */}
          {request.relocation_details && (
            <Accordion sx={{ mt: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">About the Tenant</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                  {request.relocation_details}
                </Typography>
              </AccordionDetails>
            </Accordion>
          )}
        </CardContent>
      </Card>
    );
  };

  const filteredRequests = getFilteredRequests();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Typography variant="h4" gutterBottom sx={{ color: theme.textPrimary, fontWeight: 600 }}>
        Booking Requests
      </Typography>
      <Typography variant="body1" sx={{ color: theme.textSecondary, mb: 4 }}>
        Manage booking requests for your properties
      </Typography>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={selectedTab} 
          onChange={(e, newValue) => setSelectedTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabs.map((tab, index) => (
            <Tab 
              key={tab.status}
              label={
                <Badge 
                  badgeContent={getTabCount(tab.status)} 
                  color="primary"
                  sx={{ '& .MuiBadge-badge': { right: -8, top: -8 } }}
                >
                  <Typography variant="body2" sx={{ textTransform: 'none' }}>
                    {tab.label}
                  </Typography>
                </Badge>
              }
            />
          ))}
        </Tabs>
      </Box>

      {/* Content */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" sx={{ color: theme.textSecondary }}>
            Loading booking requests...
          </Typography>
        </Box>
      ) : filteredRequests.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <HomeIcon sx={{ fontSize: 80, color: theme.textSecondary, mb: 2 }} />
          <Typography variant="h6" sx={{ color: theme.textSecondary, mb: 1 }}>
            No {tabs[selectedTab].label.toLowerCase()} found
          </Typography>
          <Typography variant="body2" sx={{ color: theme.textSecondary }}>
            {selectedTab === 0 
              ? "New booking requests will appear here"
              : "Check other tabs for requests in different statuses"
            }
          </Typography>
        </Box>
      ) : (
        <Box>
          {filteredRequests.map(request => renderBookingCard(request))}
        </Box>
      )}

      {/* Response Dialog */}
      <Dialog 
        open={responseDialog.open} 
        onClose={() => setResponseDialog({ open: false, type: '', request: null })}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          {responseDialog.type === 'approve' ? 'Approve Booking Request' : 'Reject Booking Request'}
        </DialogTitle>
        <DialogContent>
          {responseDialog.type === 'approve' && (
            <Alert severity="info" sx={{ mb: 3 }}>
              Approving this request will allow the tenant to submit payment and documents.
            </Alert>
          )}
          
          <TextField
            label="Message to Tenant"
            multiline
            rows={3}
            fullWidth
            value={responseForm.message}
            onChange={(e) => setResponseForm(prev => ({ ...prev, message: e.target.value }))}
            placeholder={responseDialog.type === 'approve' 
              ? "Welcome! Your request has been approved..." 
              : "Thank you for your interest, however..."
            }
            sx={{ mb: 3 }}
          />

          {responseDialog.type === 'approve' && (
            <TextField
              label="Payment Account Information *"
              multiline
              rows={4}
              fullWidth
              value={responseForm.paymentAccountInfo}
              onChange={(e) => setResponseForm(prev => ({ ...prev, paymentAccountInfo: e.target.value }))}
              placeholder={`Bank: Commercial Bank of Ceylon
Account Name: John Doe
Account Number: 123456789
Branch: Colombo 03

Please transfer the full amount and upload the receipt.`}
              required
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResponseDialog({ open: false, type: '', request: null })}>
            Cancel
          </Button>
          <Button 
            onClick={() => handleOwnerResponse(responseDialog.type)} 
            variant="contained"
            color={responseDialog.type === 'approve' ? 'success' : 'error'}
          >
            {responseDialog.type === 'approve' ? 'Approve Request' : 'Reject Request'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detailed View Dialog */}
      <Dialog
        open={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedRequest && (
          <>
            <DialogTitle>
              Booking Request Details - #{selectedRequest.id}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>Tenant Information</Typography>
                  <Typography variant="body2">Name: {selectedRequest.first_name} {selectedRequest.last_name}</Typography>
                  <Typography variant="body2">Email: {selectedRequest.email}</Typography>
                  <Typography variant="body2">Phone: {selectedRequest.country_code} {selectedRequest.mobile_number}</Typography>
                  <Typography variant="body2">Nationality: {selectedRequest.nationality}</Typography>
                  <Typography variant="body2">Gender: {selectedRequest.gender}</Typography>
                  <Typography variant="body2">Date of Birth: {selectedRequest.birthdate}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>Professional Information</Typography>
                  <Typography variant="body2">Occupation: {selectedRequest.occupation}</Typography>
                  <Typography variant="body2">Field: {selectedRequest.field}</Typography>
                  {selectedRequest.destination && (
                    <Typography variant="body2">Destination: {selectedRequest.destination}</Typography>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>Booking Details</Typography>
                  <Typography variant="body2">Property: {selectedRequest.property_type} - {selectedRequest.unit_type}</Typography>
                  <Typography variant="body2">Check-in: {selectedRequest.check_in_date}</Typography>
                  <Typography variant="body2">Check-out: {selectedRequest.check_out_date}</Typography>
                  <Typography variant="body2">Total Amount: LKR {(selectedRequest.total_price + selectedRequest.service_fee).toLocaleString()}</Typography>
                </Grid>
                {selectedRequest.relocation_details && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>About the Tenant</Typography>
                    <Typography variant="body2">{selectedRequest.relocation_details}</Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedRequest(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Snackbar */}
      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleSnackbarClose}
      />
    </Container>
  );
};

export default PropertyOwnerBookings;