import React from 'react';
import { Grid, Box, Typography, Button } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import BookingCard from './BookingCard';

const BookingGrid = ({ 
  bookings = [], 
  loading = false,
  onRefresh,
  onPaymentComplete,
  emptyStateMessage = 'No bookings found',
  emptyStateSubtitle = 'You don\'t have any bookings yet.',
  showBrowseButton = true
}) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h6" color="text.secondary">
          Loading bookings...
        </Typography>
      </Box>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <HomeIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {emptyStateMessage}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {emptyStateSubtitle}
        </Typography>
        {showBrowseButton && (
          <Button 
            variant="contained" 
            onClick={() => navigate('/properties')}
            startIcon={<HomeIcon />}
          >
            Browse Properties
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {bookings.map((booking, index) => (
        <Grid item xs={12} sm={6} md={4} key={booking.booking_id || booking.id || index}>
          <BookingCard
            booking={booking}
            onRefresh={onRefresh}
            onPaymentComplete={onPaymentComplete}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default BookingGrid;

