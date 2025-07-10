import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Rating,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  CircularProgress,
  Skeleton,
  Paper,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  WhatsApp as WhatsAppIcon,
  Login as LoginIcon,
  Send as SendIcon,
  LocationOn as LocationOnIcon,
  Bed as BedIcon,
  Bathtub as BathtubIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  SquareFoot as SquareFootIcon,
  Visibility as VisibilityIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Event as EventIcon,
  Description as DescriptionIcon,
  ExpandMore as ExpandMoreIcon,
  VerifiedUser as VerifiedUserIcon,
  AccessTime as AccessTimeIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { getPropertyById, incrementPropertyViews } from '../../api/propertyApi';
import { 
  setFavouriteStatus, 
  isFavouriteStatus, 
  submitComplaint,
  submitPropertyRating,
  getPropertyRating 
} from '../../api/userInteractionApi';
import { isAuthenticated } from '../../utils/auth';
import { useTheme } from '../../contexts/ThemeContext';
import AppSnackbar, { useSnackbar } from '../../components/common/AppSnackbar';

const LoginRequiredDialog = ({ open, onClose, onLogin, action }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
      Login Required
    </DialogTitle>
    <DialogContent>
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <LoginIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Please login to {action}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Don't worry, you'll be brought back to this property after logging in.
        </Typography>
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button variant="contained" onClick={onLogin}>
        Login
      </Button>
    </DialogActions>
  </Dialog>
);

const UserViewProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme, isDark } = useTheme();
  const { showSnackbar, snackbarProps } = useSnackbar();

  // Property and user state
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // User interaction states
  const [isFavourite, setIsFavourite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  
  // Booking states
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  
  // UI states
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [complaintText, setComplaintText] = useState('');
  const [complaintSubmitting, setComplaintSubmitting] = useState(false);
  const [loginRequiredDialogOpen, setLoginRequiredDialogOpen] = useState(false);
  const [loginAction, setLoginAction] = useState('');

  // Authentication checks
  const authenticated = isAuthenticated();
  const userRole = localStorage.getItem('userRole');
  const isUser = userRole === 'user';

  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-image.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${imagePath}`;
  };

  // Parse JSON safely
  const safeParse = (jsonString, defaultValue = {}) => {
  // Add debugging to see what we're actually receiving
  console.log('SafeParse input:', jsonString);
  console.log('SafeParse input type:', typeof jsonString);
  
  try {
    // If it's already an object, return it as-is
    if (typeof jsonString === 'object' && jsonString !== null) {
      console.log('Input is already an object:', jsonString);
      return jsonString;
    }
    
    // If it's a string, try to parse it
    if (typeof jsonString === 'string' && jsonString.trim() !== '') {
      const parsed = JSON.parse(jsonString);
      console.log('Successfully parsed JSON:', parsed);
      return parsed;
    }
    
    // If it's empty string, null, or undefined
    console.log('Input is empty, null, or undefined, returning default:', defaultValue);
    return defaultValue;
    
  } catch (error) {
    console.error('JSON parse error:', error);
    console.log('Returning default value:', defaultValue);
    return defaultValue;
  }
};

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Format relative time (for created_at)
  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      
      if (diffInDays === 0) return 'Today';
      if (diffInDays === 1) return 'Yesterday';
      if (diffInDays < 30) return `${diffInDays} days ago`;
      if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
      return `${Math.floor(diffInDays / 365)} years ago`;
    } catch {
      return 'Unknown';
    }
  };

  // Memoized property details
  const facilities = useMemo(() => safeParse(property?.facilities), [property]);
  const amenities = useMemo(() => safeParse(property?.amenities, []), [property]);
  const images = useMemo(() => safeParse(property?.images, []), [property]);
  const ratingDistribution = useMemo(() => safeParse(property?.rating_distribution), [property]);
  const roommates = useMemo(() => safeParse(property?.roommates), [property]);
  const rules = useMemo(() => safeParse(property?.rules, []), [property]);
  const billsInclusive = useMemo(() => safeParse(property?.bills_inclusive, []), [property]);

  // Fetch property data and user interactions
  useEffect(() => {
    const fetchPropertyData = async () => {
      if (!id || isNaN(id)) {
        setError('Invalid property ID');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const propertyData = await getPropertyById(id);
        setProperty(propertyData);
        
        // Increment view count
        await incrementPropertyViews(id);
        
        // Check favorite status if user is authenticated
        if (authenticated && isUser) {
          try {
            const favStatus = await isFavouriteStatus({ property_id: parseInt(id) });
            setIsFavourite(favStatus.isFavourite || false);
          } catch (error) {
            console.error('Error checking favorite status:', error);
            setIsFavourite(false);
          }
        }
        
        // Load user's rating if authenticated
        if (authenticated && isUser) {
          try {
            const ratingData = await getPropertyRating({ property_id: parseInt(id) });
            if (ratingData && ratingData.rating !== null) {
              setUserRating(ratingData.rating);
            }
          } catch (error) {
            console.error('Error loading user rating:', error);
            setUserRating(0);
          }
        }
        
      } catch (error) {
        console.error('Error fetching property:', error);
        setError('Failed to load property details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyData();
  }, [id, authenticated, isUser]);

  // Calculate rating statistics for detailed display
 const ratingStats = useMemo(() => {
  // First, check if we have valid rating data
  if (!ratingDistribution || !property?.total_ratings) {
    return { breakdown: [], hasRatings: false };
  }

  const totalRatings = parseInt(property.total_ratings) || 0;
  
  // If no total ratings, return empty state
  if (totalRatings === 0) {
    return { breakdown: [], hasRatings: false };
  }
  console.log('Rating Distribution:', ratingDistribution);

  // Create the breakdown array with proper data conversion
  // Note: We're handling the database field names exactly as they come
  const breakdown = [
    { 
      stars: 5, 
      count: parseInt(ratingDistribution.five_star) || 0,
      label: 'five_star'
    },
    { 
      stars: 4, 
      count: parseInt(ratingDistribution.four_star) || 0,
      label: 'four_star'
    },
    { 
      stars: 3, 
      count: parseInt(ratingDistribution.three_star) || 0,
      label: 'three_star'
    },
    { 
      stars: 2, 
      count: parseInt(ratingDistribution.two_star) || 0,
      label: 'two_star'
    },
    { 
      stars: 1, 
      count: parseInt(ratingDistribution.one_star) || 0,
      label: 'one_star'
    }
  ].map(item => ({
    ...item,
    // Calculate percentage with proper rounding
    percentage: totalRatings > 0 ? Math.round((item.count / totalRatings) * 100) : 0
  }));

  console.log('Rating Breakdown:', breakdown);

  // Debug logging to help troubleshoot (remove in production)
  console.log('Rating Distribution Debug:', {
    totalRatings,
    ratingDistribution,
    breakdown
  });

  return { breakdown, hasRatings: totalRatings > 0 };
}, [ratingDistribution, property?.total_ratings, property]);

  const handleFavouriteToggle = useCallback(async () => {
    if (!authenticated) {
      setLoginAction('add properties to favorites');
      setLoginRequiredDialogOpen(true);
      return;
    }

    if (!isUser) {
      showSnackbar('Only users can add properties to favorites', 'warning');
      return;
    }

    if (favoriteLoading) return;

    setFavoriteLoading(true);
    const originalStatus = isFavourite;
    const newStatus = !isFavourite;
    
    // Optimistically update UI
    setIsFavourite(newStatus);

    try {
      await setFavouriteStatus({ property_id: parseInt(id), isFavourite: newStatus });
      showSnackbar(
        newStatus ? 'Added to favorites!' : 'Removed from favorites',
        'success'
      );
      
    } catch (error) {
      console.error('Error updating favourite status:', error);
      
      // Revert on error
      setIsFavourite(originalStatus);
      showSnackbar('Failed to update favorites. Please try again.', 'error');
    } finally {
      setFavoriteLoading(false);
    }
  }, [authenticated, isUser, isFavourite, favoriteLoading, id, showSnackbar]);

  const handleRatingSubmit = useCallback(async () => {
    if (!authenticated) {
      setLoginAction('rate properties');
      setLoginRequiredDialogOpen(true);
      return;
    }

    if (!isUser) {
      showSnackbar('Only users can rate properties', 'warning');
      return;
    }

    if (userRating === 0) {
      showSnackbar('Please select a rating', 'warning');
      return;
    }

    setRatingSubmitting(true);

    try {
      const response = await submitPropertyRating(parseInt(id), {
        rating: userRating
      });
      
      showSnackbar(
        response.is_update ? 'Rating updated successfully!' : 'Rating submitted successfully!', 
        'success'
      );
      
      // Update property rating display if response includes updated property rating
      if (property && response.property_rating) {
        const updatedProperty = {
          ...property,
          rating: parseFloat(response.property_rating.average),
          total_ratings: response.property_rating.total_count
        };
        setProperty(updatedProperty);
      }
      
    } catch (error) {
      console.error('Error submitting rating:', error);
      showSnackbar(error.message || 'Failed to submit rating. Please try again.', 'error');
    } finally {
      setRatingSubmitting(false);
    }
  }, [authenticated, isUser, userRating, id, property, showSnackbar]);

  const handleComplaintSubmit = useCallback(async () => {
    if (!authenticated) {
      setLoginAction('report issues');
      setLoginRequiredDialogOpen(true);
      return;
    }

    if (!complaintText.trim()) {
      showSnackbar('Please enter a complaint message', 'warning');
      return;
    }

    if (complaintText.trim().length < 10) {
      showSnackbar('Complaint must be at least 10 characters long', 'warning');
      return;
    }

    setComplaintSubmitting(true);

    try {
      await submitComplaint(parseInt(id), complaintText.trim());
      showSnackbar('Complaint submitted successfully!', 'success');
      setComplaintText('');
      setReportDialogOpen(false);
      
    } catch (error) {
      console.error('Error submitting complaint:', error);
      showSnackbar(error.message || 'Failed to submit complaint. Please try again.', 'error');
    } finally {
      setComplaintSubmitting(false);
    }
  }, [authenticated, complaintText, id, showSnackbar]);

  const handleBookingRequest = () => {
    if (!authenticated) {
      setLoginAction('book properties');
      setLoginRequiredDialogOpen(true);
      return;
    }

    if (!isUser) {
      showSnackbar('Only users can book properties', 'warning');
      return;
    }

    // Navigate to booking page with property ID and dates
    const bookingUrl = `/user-bookproperty/${id}`;
    if (checkInDate && checkOutDate) {
      navigate(`${bookingUrl}?checkIn=${checkInDate}&checkOut=${checkOutDate}`);
    } else {
      navigate(bookingUrl);
    }
  };

  const handleWhatsAppContact = () => {
    if (property?.phone) {
      const phoneNumber = property.phone.replace(/[^0-9]/g, '');
      const message = `Hi! I'm interested in your property: ${property.property_type} - ${property.unit_type} at ${property.address}. Can we discuss more details?`;
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } else {
      showSnackbar('Contact number not available', 'warning');
    }
  };

  const handleLoginRequired = () => {
    localStorage.setItem('redirectAfterLogin', window.location.pathname);
    navigate('/login');
  };

  // Get today's date for minimum date validation
  const today = new Date().toISOString().split('T')[0];

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={400} sx={{ mb: 2 }} />
            <Skeleton variant="text" height={40} />
            <Skeleton variant="text" height={30} />
            <Skeleton variant="text" height={100} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          {error}
        </Typography>
        <Button variant="contained" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Container>
    );
  }

  // Property not found
  if (!property) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Property not found
        </Typography>
        <Button variant="contained" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Property Images */}
          <Box sx={{ mb: 3 }}>
            {images.length > 0 ? (
              <Box
                component="img"
                src={getImageUrl(images[0])}
                alt={`${property.property_type} in ${property.address}`}
                sx={{
                  width: '100%',
                  height: 400,
                  objectFit: 'cover',
                  borderRadius: 2
                }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: 400,
                  bgcolor: 'grey.200',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 2,
                  border: '2px dashed',
                  borderColor: 'grey.400'
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  No images available
                </Typography>
              </Box>
            )}
          </Box>

          {/* Property Title and Details */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    {property.property_type} - {property.unit_type}
                  </Typography>
                  {property.featured === 1 && (
                    <Chip
                      icon={<VerifiedUserIcon />}
                      label="Featured"
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOnIcon sx={{ color: 'text.secondary', mr: 1 }} />
                  <Typography variant="body1" color="text.secondary">
                    {property.address}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Rating value={parseFloat(property.rating) || 0} readOnly precision={0.5} />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      ({property.total_ratings || 0} reviews)
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <VisibilityIcon sx={{ color: 'text.secondary', mr: 0.5, fontSize: 18 }} />
                    <Typography variant="body2" color="text.secondary">
                      {property.views_count || 0} views
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTimeIcon sx={{ color: 'text.secondary', mr: 0.5, fontSize: 18 }} />
                    <Typography variant="body2" color="text.secondary">
                      Listed {formatRelativeTime(property.created_at)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              {authenticated && isUser && (
                <IconButton
                  onClick={handleFavouriteToggle}
                  disabled={favoriteLoading}
                  sx={{ 
                    color: isFavourite ? 'red' : 'grey.400',
                    '&:hover': { color: 'red' }
                  }}
                >
                  {favoriteLoading ? (
                    <CircularProgress size={24} />
                  ) : isFavourite ? (
                    <FavoriteIcon />
                  ) : (
                    <FavoriteBorderIcon />
                  )}
                </IconButton>
              )}
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
              LKR {parseFloat(property.price || 0).toLocaleString()}.00
            </Typography>

            {/* Additional Property Description */}
            {property.other_facility && (
              <Box sx={{ mb: 3 }}>
                <Card sx={{ p: 2, bgcolor: 'primary', color: 'white' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <DescriptionIcon sx={{ mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Property Highlights
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {property.other_facility}
                  </Typography>
                </Card>
              </Box>
            )}

            {/* Property Features Grid */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <BedIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {facilities.Bedroom || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bedrooms
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <BathtubIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {facilities.Bathroom || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bathrooms
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <SquareFootIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    N/A
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Sq Ft
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <PeopleIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {facilities.MaxPeople || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Max Guests
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Availability and Contract Information */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <EventIcon sx={{ color: 'primary.main', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Availability
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Available from: {formatDate(property.available_from)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Available until: {formatDate(property.available_to)}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AssignmentIcon sx={{ color: 'primary.main', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Contract Terms
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {property.contract_policy || 'Contact owner for lease terms'}
                  </Typography>
                </Card>
              </Grid>
            </Grid>

            {/* Detailed Rating Breakdown */}
            {ratingStats.hasRatings && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Rating Breakdown
                </Typography>
                <Card sx={{ p: 3 }}>
                  {/* Detailed breakdown */}
                  {ratingStats.breakdown.map((item) => (
                    <Box key={item.stars} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      {/* Star rating label */}
                      <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 80 }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          {item.stars}
                        </Typography>
                        <StarIcon sx={{ fontSize: 16, color: '#ffc107' }} />
                      </Box>

                      {/* Progress bar container */}
                      <Box sx={{ flex: 1, mx: 2 }}>
                        <LinearProgress
                          variant="determinate"
                          value={item.percentage}
                          sx={{ 
                            height: 12, 
                            borderRadius: 2,
                            backgroundColor: 'rgba(0,0,0,0.1)',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 2,
                              backgroundColor: item.percentage > 0 ? '#ffc107' : 'transparent'
                            }
                          }}
                        />
                      </Box>

                      {/* Count and percentage display */}
                      <Box sx={{ minWidth: 60, textAlign: 'right' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {item.count}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({item.percentage}%)
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Card>
              </Box>
            )}

            {/* Additional Information Sections */}
            {(roommates || rules.length > 0 || billsInclusive.length > 0) && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Additional Information
                </Typography>
                
                {roommates && (
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        Roommate Information
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2">
                        {JSON.stringify(roommates, null, 2)}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                )}

                {rules.length > 0 && (
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        House Rules
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box>
                        {rules.map((rule, index) => (
                          <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                            • {rule}
                          </Typography>
                        ))}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                )}

                {billsInclusive.length > 0 && (
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        Bills Included
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box>
                        {billsInclusive.map((bill, index) => (
                          <Chip key={index} label={bill} sx={{ mr: 1, mb: 1 }} />
                        ))}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                )}
              </Box>
            )}

            {/* Pricing Details */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Pricing Details
              </Typography>
              <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Item</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Monthly Rent</TableCell>
                      <TableCell align="right">LKR {parseFloat(property.price || 0).toLocaleString()}.00</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* User Rating Section */}
            {authenticated && isUser && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Rate This Property
                </Typography>
                <Card sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body1" sx={{ mr: 2 }}>
                      Your Rating:
                    </Typography>
                    <Rating
                      value={userRating}
                      onChange={(event, newValue) => setUserRating(newValue || 0)}
                      size="large"
                    />
                  </Box>
                  <Button
                    variant="contained"
                    onClick={handleRatingSubmit}
                    disabled={ratingSubmitting || userRating === 0}
                    startIcon={ratingSubmitting ? <CircularProgress size={20} /> : null}
                  >
                    {ratingSubmitting ? 'Submitting...' : 'Submit Rating'}
                  </Button>
                </Card>
              </Box>
            )}
          </Box>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Box sx={{ position: 'sticky', top: 20 }}>
            {/* Contact Information */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Contact Information
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {property.owner_username || 'Property Owner'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Property Owner
                    </Typography>
                  </Box>
                </Box>
                
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  startIcon={<WhatsAppIcon />}
                  onClick={handleWhatsAppContact}
                  sx={{ mb: 2 }}
                >
                  Contact
                </Button>
              </CardContent>
            </Card>

            {/* Book This Property */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Book This Property
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Check-in Date
                  </Typography>
                  <TextField
                    type="date"
                    fullWidth
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    inputProps={{ min: today }}
                    placeholder="dd/mm/yyyy"
                  />
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Check-out Date
                  </Typography>
                  <TextField
                    type="date"
                    fullWidth
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    inputProps={{ min: checkInDate || today }}
                    placeholder="dd/mm/yyyy"
                  />
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleBookingRequest}
                  startIcon={<CalendarIcon />}
                  sx={{ mb: 2 }}
                >
                  Request Booking
                </Button>
                
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  You won't be charged yet. The property owner will review your request.
                </Typography>
              </CardContent>
            </Card>

            {/* Report an Issue */}
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Report an Issue
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Found something wrong with this listing? Let us know.
                </Typography>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => setReportDialogOpen(true)}
                >
                  Report Issue
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>

      {/* Login Required Dialog */}
      <LoginRequiredDialog
        open={loginRequiredDialogOpen}
        onClose={() => setLoginRequiredDialogOpen(false)}
        onLogin={handleLoginRequired}
        action={loginAction}
      />

      {/* Report Issue Dialog */}
      <Dialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Report an Issue</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Describe the issue you found with this property..."
            value={complaintText}
            onChange={(e) => setComplaintText(e.target.value)}
            sx={{ mt: 1 }}
          />
          <Typography variant="caption" color="text.secondary">
            Minimum 10 characters required
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained"
            onClick={handleComplaintSubmit}
            disabled={complaintSubmitting || complaintText.trim().length < 10}
            startIcon={complaintSubmitting ? <CircularProgress size={20} /> : <SendIcon />}
          >
            {complaintSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <AppSnackbar {...snackbarProps} />
    </Container>
  );
};

export default UserViewProperty;