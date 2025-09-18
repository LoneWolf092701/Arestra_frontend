import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Button,
  Grid,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  AttachMoney as PriceIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import PaymentOptionsModal from './PaymentOptionsModal';
import Room from '../../assets/images/Room.jpg';

const BookingCard = ({ 
  booking, 
  onRefresh,
  onPaymentComplete 
}) => {
  const navigate = useNavigate();
  const { theme, isDark } = useTheme();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const safeJsonParse = (str, fallback = null) => {
    if (!str) return fallback;
    if (typeof str === 'object') return str;
    if (typeof str !== 'string') return fallback;
    
    try {
      const parsed = JSON.parse(str);
      return parsed !== null ? parsed : fallback;
    } catch (error) {
      return fallback;
    }
  };

  const getImageUrl = (images) => {
    // Handle different image data formats
    if (!images) {
      return Room;
    }

    let parsedImages = [];
    
    // If images is already an array, use it
    if (Array.isArray(images)) {
      parsedImages = images;
    } else {
      // Try to parse as JSON
      parsedImages = safeJsonParse(images, []);
    }
    
    if (!Array.isArray(parsedImages) || parsedImages.length === 0) {
      return Room;
    }

    const firstImage = parsedImages[0];
    
    // Ensure firstImage is a string before calling includes
    if (firstImage && typeof firstImage === 'string' && firstImage.includes('localhost:5000/uploads/')) {
      return firstImage.replace('http://localhost:5000/uploads/', 'http://127.0.0.1:10000/devstoreaccount1/staywise-uploads/');
    }
    
    return (typeof firstImage === 'string' ? firstImage : null) || Room;
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return {
          color: 'warning',
          icon: <ScheduleIcon />,
          label: 'Pending Approval',
          description: 'Waiting for property owner approval'
        };
      case 'approved':
        return {
          color: 'info',
          icon: <CheckCircleIcon />,
          label: 'Approved',
          description: 'Ready for payment'
        };
      case 'payment_submitted':
        return {
          color: 'primary',
          icon: <ReceiptIcon />,
          label: 'Payment Submitted',
          description: 'Payment under review'
        };
      case 'confirmed':
        return {
          color: 'success',
          icon: <CheckCircleIcon />,
          label: 'Confirmed',
          description: 'Booking confirmed'
        };
      case 'rejected':
        return {
          color: 'error',
          icon: <ErrorIcon />,
          label: 'Rejected',
          description: 'Booking rejected'
        };
      case 'cancelled':
        return {
          color: 'default',
          icon: <ErrorIcon />,
          label: 'Cancelled',
          description: 'Booking cancelled'
        };
      default:
        return {
          color: 'default',
          icon: <ScheduleIcon />,
          label: status || 'Unknown',
          description: 'Status unknown'
        };
    }
  };

  const canMakePayment = (status) => {
    return ['approved', 'payment_submitted'].includes(status);
  };

  const canViewInvoice = (status) => {
    return ['payment_submitted', 'confirmed'].includes(status);
  };

  const handleViewProperty = () => {
    navigate(`/user-property-view/${booking.property_id}`);
  };

  const handlePayment = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = (method, data) => {
    if (onPaymentComplete) {
      onPaymentComplete(method, data);
    }
    setShowPaymentModal(false);
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleViewInvoice = () => {
    // Navigate to invoice page or open invoice modal
    navigate(`/booking/${booking.booking_id}/invoice`);
  };

  const statusInfo = getStatusInfo(booking.booking_status);

  return (
    <>
      <Card 
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 4
          }
        }}
      >
        <CardMedia
          component="img"
          height="200"
          image={getImageUrl(booking.images)}
          alt={`${booking.property_type || 'Property'} - ${booking.unit_type || 'Unit'}`}
          sx={{ objectFit: 'cover' }}
        />

        <CardContent sx={{ flexGrow: 1, p: 3 }}>
          {/* Property Title */}
          <Typography variant="h6" component="h3" gutterBottom>
            {booking.property_type || 'Property'} - {booking.unit_type || 'Unit'}
          </Typography>

          {/* Address */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LocationIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
            <Typography variant="body2" color="text.secondary" noWrap>
              {booking.address || 'Address not available'}
            </Typography>
          </Box>

          {/* Booking Dates */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {booking.check_in_date ? new Date(booking.check_in_date).toLocaleDateString() : 'N/A'} - {booking.check_out_date ? new Date(booking.check_out_date).toLocaleDateString() : 'N/A'}
            </Typography>
          </Box>

          {/* Price */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PriceIcon sx={{ color: theme.primary, fontSize: 20, mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: theme.primary }}>
              LKR {booking.advance_amount?.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              advance
            </Typography>
          </Box>

          {/* Status Chip */}
          <Box sx={{ mb: 2 }}>
            <Chip
              icon={statusInfo.icon}
              label={statusInfo.label}
              color={statusInfo.color}
              size="small"
              sx={{ mb: 1 }}
            />
            <Typography variant="caption" color="text.secondary" display="block">
              {statusInfo.description}
            </Typography>
          </Box>

          {/* Payment Account Info */}
          {booking.payment_account_info && (
            <Box sx={{ 
              p: 2, 
              bgcolor: isDark ? '#2a2a2a' : '#f5f5f5', 
              borderRadius: 1,
              mb: 2
            }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>Account Details:</strong>
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                {booking.payment_account_info}
              </Typography>
            </Box>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleViewProperty}
              sx={{ flexGrow: 1 }}
            >
              View Property
            </Button>

            {canMakePayment(booking.booking_status) && (
              <Button
                variant="contained"
                size="small"
                startIcon={<PaymentIcon />}
                onClick={handlePayment}
                sx={{ flexGrow: 1 }}
              >
                {booking.booking_status === 'payment_submitted' ? 'Pay Again' : 'Make Payment'}
              </Button>
            )}

            {canViewInvoice(booking.booking_status) && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<ReceiptIcon />}
                onClick={handleViewInvoice}
                sx={{ flexGrow: 1 }}
              >
                View Invoice
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentOptionsModal
          open={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          booking={{
            id: booking.booking_id,
            advance_amount: booking.advance_amount,
            guest_name: `${booking.first_name || ''} ${booking.last_name || ''}`.trim(),
            email: booking.email || ''
          }}
          accountInfo={booking.payment_account_info || ''}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </>
  );
};

export default BookingCard;
