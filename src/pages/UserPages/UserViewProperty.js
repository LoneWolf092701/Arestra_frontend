import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Chip,
  Button,
  Card,
  CardMedia,
  IconButton,
  Rating,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Breadcrumbs,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  CircularProgress,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  Star as StarIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  NavigateNext as NavigateNextIcon,
  Bed as BedIcon,
  Bathtub as BathtubIcon,
  Visibility as ViewsIcon,
  Home as HomeIcon,
  Rule as RuleIcon,
  Description as PolicyIcon,
  Group as RoommateIcon,
  Edit as EditIcon,
  Flag as ReportIcon,
  Check as CheckIcon,
  WhatsApp as WhatsAppIcon
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import { getPublicPropertyById } from '../../api/propertyApi';
import { 
  addToFavorites, 
  removeFromFavorites, 
  checkFavoriteStatus,
  submitPropertyRating,
  getUserPropertyRating,
  getPropertyRating,
  submitReport,
  recordPropertyView,
  getPropertyStatistics
} from '../../api/userInteractionApi';
import { isAuthenticated, getUserId } from '../../utils/auth';
import AppSnackbar from '../../components/common/AppSnackbar';
import MapSearch from '../../components/specific/MapSearch';
import { getUserRole } from '../../api/loginApi';

const ImageCarousel = ({ images, propertyTitle }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const { theme } = useTheme();
  
  const transformUrlToAzure = (url) => {
    if (!url || typeof url !== 'string') return url;
    
    if (url.includes('localhost:5000/uploads/')) {
      return url.replace('http://localhost:5000/uploads/', 'http://127.0.0.1:10000/devstoreaccount1/staywise-uploads/');
    }
    
    return url;
  };

  const getValidImages = () => {
    if (!images || !Array.isArray(images) || images.length === 0) {
      return [];
    }
    
    return images.filter(img => {
      if (typeof img === 'string') return img.trim() !== '';
      if (typeof img === 'object' && img?.url) return img.url.trim() !== '';
      return false;
    });
  };

  const validImages = getValidImages();

  if (validImages.length === 0) {
    return (
      <Card sx={{ mb: 3 }}>
        <Box sx={ 
          { 
            height: 400, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: theme.cardBackground,
            color: theme.textSecondary
          }}>
          <Typography variant="h6">No images available</Typography>
        </Box>
      </Card>
    );
  }

  const getCurrentImageUrl = () => {
    const currentImg = validImages[currentImageIndex];
    if (typeof currentImg === 'string') {
      return transformUrlToAzure(currentImg);
    }
    if (typeof currentImg === 'object' && currentImg?.url) {
      return transformUrlToAzure(currentImg.url);
    }
    return '';
  };

  const previousImage = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? validImages.length - 1 : prev - 1
    );
  };

  const nextImage = () => {
    setCurrentImageIndex(prev => 
      prev === validImages.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <>
      <Card sx={{ mb: 3, position: 'relative', overflow: 'hidden' }}>
        <CardMedia
          component="img"
          height="400"
          image={getCurrentImageUrl()}
          alt={propertyTitle}
          sx={{ 
            objectFit: 'cover',
            cursor: 'pointer'
          }}
          onClick={() => setImageViewerOpen(true)}
        />
        
        {validImages.length > 1 && (
          <>
            <IconButton
              sx={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.7)' }
              }}
              onClick={previousImage}
            >
              <ArrowBackIcon />
            </IconButton>
            
            <IconButton
              sx={{
                position: 'absolute',
                right: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.7)' }
              }}
              onClick={nextImage}
            >
              <ArrowForwardIcon />
            </IconButton>

            <Box sx={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 1
            }}>
              {validImages.map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: index === currentImageIndex ? 'white' : 'rgba(255,255,255,0.5)',
                    cursor: 'pointer'
                  }}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </Box>
          </>
        )}

        <Box sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          color: 'white',
          px: 2,
          py: 1,
          borderRadius: 2,
          fontSize: '0.875rem'
        }}>
          {currentImageIndex + 1} / {validImages.length}
        </Box>
      </Card>

      <Dialog
        open={imageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { backgroundColor: 'transparent', boxShadow: 'none' }
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.7)' }
            }}
            onClick={() => setImageViewerOpen(false)}
          >
            <CloseIcon />
          </IconButton>
          
          <img
            src={getCurrentImageUrl()}
            alt={propertyTitle}
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '80vh',
              objectFit: 'contain'
            }}
          />
          
          {validImages.length > 1 && (
            <>
              <IconButton
                sx={{
                  position: 'absolute',
                  left: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.7)' }
                }}
                onClick={previousImage}
              >
                <ArrowBackIcon />
              </IconButton>
              
              <IconButton
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
                }}
                onClick={nextImage}
              >
                <ArrowForwardIcon />
              </IconButton>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

const UserViewProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  
  const [userRating, setUserRating] = useState(0);
  const [userRatingData, setUserRatingData] = useState({ has_rated: false, rating: 0 });
  const [propertyRating, setPropertyRating] = useState({ averageRating: 0, totalRatings: 0 });
  const [ratingLoading, setRatingLoading] = useState(false);
  
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');

  const [propertyBookings, setPropertyBookings] = useState([]);

  
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const isLoggedIn = isAuthenticated();
  const currentUserId = getUserId();

  const userRole = getUserRole();

  const isPropertyOwner = userRole === 'propertyowner';

  console.log({property})
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const propertyData = await getPublicPropertyById(id);
        setProperty(propertyData);
        
        if (isLoggedIn) {
          try {
            await recordPropertyView(id);
          } catch (viewError) {
            console.warn('Error recording property view:', viewError);
          }
          
          try {
            const favoriteStatus = await checkFavoriteStatus(id);
            if (favoriteStatus && (favoriteStatus.status === 200 || favoriteStatus.status === 304)) {
              const responseData = favoriteStatus.data || favoriteStatus;
              if (responseData && typeof responseData.isFavorite === 'boolean') {
                setIsFavorite(responseData.isFavorite);
              } else if (responseData && typeof responseData.is_favorited === 'boolean') {
                setIsFavorite(responseData.is_favorited);
              } else {
                setIsFavorite(false);
              }
            } else {
              setIsFavorite(false);
            }
          } catch (favoriteError) {
            console.warn('Error checking favorite status:', favoriteError);
            setIsFavorite(false);
          }

          try {
            const userRatingResponse = await getUserPropertyRating(id);
            if (userRatingResponse && (userRatingResponse.status === 200 || userRatingResponse.status === 304 || userRatingResponse.data)) {
              const responseData = userRatingResponse.data || userRatingResponse;
              if (responseData && typeof responseData === 'object') {
                const ratingData = responseData.rating || responseData;
                setUserRatingData({
                  has_rated: Boolean(responseData.has_rated || ratingData.has_rated),
                  rating: Number(responseData.rating || ratingData.rating_score || ratingData.rating) || 0
                });
                setUserRating(Number(responseData.rating || ratingData.rating_score || ratingData.rating) || 0);
              } else {
                setUserRatingData({ has_rated: false, rating: 0 });
                setUserRating(0);
              }
            } else {
              setUserRatingData({ has_rated: false, rating: 0 });
              setUserRating(0);
            }
          } catch (ratingError) {
            console.warn('Error fetching user rating:', ratingError);
            setUserRatingData({ has_rated: false, rating: 0 });
            setUserRating(0);
          }
        }

        try {
          const ratingResponse = await getPropertyRating(id);
          if (ratingResponse && (ratingResponse.status === 200 || ratingResponse.status === 304 || ratingResponse.data)) {
            const responseData = ratingResponse.data || ratingResponse;
            if (responseData && typeof responseData === 'object') {
              setPropertyRating({
                averageRating: Number(responseData.averageRating || responseData.average_rating) || 0,
                totalRatings: Number(responseData.totalRatings || responseData.total_ratings) || 0
              });
            } else {
              setPropertyRating({ averageRating: 0, totalRatings: 0 });
            }
          } else {
            setPropertyRating({ averageRating: 0, totalRatings: 0 });
          }
        } catch (ratingError) {
          console.warn('Error fetching property rating:', ratingError);
          setPropertyRating({ averageRating: 0, totalRatings: 0 });
        }

      } catch (err) {
        console.error('Error fetching property:', err);
        setError('Failed to load property details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
      checkPropertyBookings();
    }
  }, [id, isLoggedIn]);
  
  const formatPhoneForWhatsApp = (phone) => {
    if (!phone) return null;
    return phone.replace(/\D/g, '');
  };

  const openWhatsApp = (phone, property) => {
    if (!phone) return;
    const formattedPhone = formatPhoneForWhatsApp(phone);
    
    // Create comprehensive property message
    const propertyTitle = `${property?.property_type} - ${property?.unit_type}`;
    const location = property?.address;
    const price = `LKR ${property?.price?.toLocaleString()}`;
    const bedrooms = property?.bedrooms > 0 ? `${property?.bedrooms} Bed` : '';
    const bathrooms = property?.bathrooms > 0 ? `${property?.bathrooms} Bath` : '';
    const availableFrom = property?.available_from ? `Available from ${property?.available_from}` : '';
    
    let message = `Hi! I'm interested in this property:\n\n`;
    message += `🏠 ${propertyTitle}\n`;
    message += `📍 ${location}\n`;
    message += `💰 ${price}\n`;
    if (bedrooms || bathrooms) {
      message += `🛏️ ${[bedrooms, bathrooms].filter(Boolean).join(', ')}\n`;
    }
    if (availableFrom) {
      message += `📅 ${availableFrom}\n`;
    }
    message += `\nCould you please provide more details?`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const parseJsonField = (field) => {
    if (!field) return null;
    
    // If already parsed/object, return as is
    if (typeof field === 'object') return field;
    
    // If string, try to parse
    if (typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch {
        return null;
      }
    }
    
    return field;
  };

  const formatPrice = (price) => {
    if (!price) return 'Price not set';
    return `LKR ${parseInt(price).toLocaleString()}`;
  };

  const handleFavoriteToggle = async () => {
    if (!isLoggedIn) {
      setSnackbar({ open: true, message: 'Please login to add favorites', severity: 'warning' });
      return;
    }

    try {
      setFavoriteLoading(true);
      if (isFavorite) {
        await removeFromFavorites(id);
        setIsFavorite(false);
        setSnackbar({ open: true, message: 'Removed from favorites', severity: 'success' });
      } else {
        await addToFavorites(id);
        setIsFavorite(true);
        setSnackbar({ open: true, message: 'Added to favorites', severity: 'success' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to update favorites', severity: 'error' });
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleRatingSubmit = async () => {
    if (!isLoggedIn) {
      setSnackbar({ open: true, message: 'Please login to rate properties', severity: 'warning' });
      return;
    }

    if (userRating === 0) {
      setSnackbar({ open: true, message: 'Please select a rating', severity: 'warning' });
      return;
    }

    try {
      setRatingLoading(true);
      await submitPropertyRating(id, { rating: userRating });
      
      setUserRatingData({ has_rated: true, rating: userRating });
      
      try {
        const updatedRating = await getPropertyRating(id);
        if (updatedRating && (updatedRating.status === 200 || updatedRating.status === 304 || updatedRating.data)) {
          const responseData = updatedRating.data || updatedRating;
          if (responseData && typeof responseData === 'object') {
            setPropertyRating({
              averageRating: Number(responseData.averageRating || responseData.average_rating) || 0,
              totalRatings: Number(responseData.totalRatings || responseData.total_ratings) || 0
            });
          }
        }
      } catch (fetchError) {
        console.warn('Error fetching updated rating:', fetchError);
      }
      
      setSnackbar({ open: true, message: 'Rating submitted successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to submit rating', severity: 'error' });
    } finally {
      setRatingLoading(false);
    }
  };

  const handleReportSubmit = async () => {
    if (!isLoggedIn) {
      setSnackbar({ open: true, message: 'Please login to report properties', severity: 'warning' });
      return;
    }

    if (!reportReason.trim()) {
      setSnackbar({ open: true, message: 'Please select a reason for reporting', severity: 'warning' });
      return;
    }

    try {
      await submitReport(id, {
        reason: reportReason,
        description: reportDescription.trim()
      });
      
      setReportDialogOpen(false);
      setReportReason('');
      setReportDescription('');
      setSnackbar({ open: true, message: 'Report submitted successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to submit report', severity: 'error' });
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${property.property_type} - ${property.unit_type}`,
          text: `Check out this property: ${property.property_type} in ${property.address}`,
          url: url
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          copyToClipboard(url);
        }
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setSnackbar({ open: true, message: 'Link copied to clipboard', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to copy link', severity: 'error' });
    }
  };

  const handleBooking = () => {
    if (!isLoggedIn) {
      setSnackbar({ open: true, message: 'Please login to book properties', severity: 'warning' });
      return;
    }
    
    navigate(`/user-booking/${id}`);
  };

  const checkPropertyBookings = async () => {
  try {
    const response = await fetch(`/api/bookings/property/${id}/status`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const bookings = await response.json();
      setPropertyBookings(bookings.active_bookings || []);
    }
  } catch (error) {
    console.error('Error checking property bookings:', error);
  }
};

const renderBookingButton = () => {
  const hasActiveBooking = propertyBookings.some(booking => 
    booking.status === 'confirmed' || booking.status === 'payment_submitted'
  );
  
  if (hasActiveBooking) {
    return (
      <Button
        variant="outlined"
        fullWidth
        disabled
        sx={{ mt: 2 }}
      >
        Currently Booked
      </Button>
    );
  }
  
  return (
    <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleBooking}
                sx={{
                  backgroundColor: theme.primary,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: theme.primaryDark
                  }
                }}
              >
                Book Now
              </Button>
  );
};


  const handleEdit = () => {
    if (isPropertyOwner) {
      navigate(`/update-property/${id}`);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading property details...</Typography>
      </Container>
    );
  }

  if (error || !property) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Property not found'}
        </Alert>
        <Button variant="contained" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Container>
    );
  }

  const amenities = parseJsonField(property.amenities) || [];
  const facilities = parseJsonField(property.facilities) || {};
  const rules = parseJsonField(property.rules) || [];
  const roommates = parseJsonField(property.roommates) || [];
  const images = parseJsonField(property.images) || [];
  const billsInclusive = parseJsonField(property.bills_inclusive) || [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link color="inherit" href="/user-home">Home</Link>
        <Link color="inherit" href="/user-all-properties">Properties</Link>
        <Typography color="text.primary">Property Details</Typography>
      </Breadcrumbs>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <ImageCarousel images={images} propertyTitle={`${property.property_type} - ${property.unit_type}`} />
          
          {property.description && (
            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                Description
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                {property.description}
              </Typography>
            </Paper>
          )}

          {amenities && amenities.length > 0 && (
  <Paper sx={{ p: 3, mt: 3 }}>
    <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
      Amenities
    </Typography>
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {amenities.map((amenity, index) => (
        <Chip
          key={index}
          label={amenity}
          variant="outlined"
          color="primary"
          size="small"
          sx={{
            backgroundColor: 'rgba(25, 118, 210, 0.04)',
            '&:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.08)',
            }
          }}
        />
      ))}
    </Box>
  </Paper>
)}

         {facilities && Object.keys(facilities).length > 0 && (
  <Paper sx={{ p: 3, mt: 3 }}>
    <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
      Facilities
    </Typography>
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {facilities.map((facility, index) => {
        let count = 1; // Default count if not specified
        if (facility === 'Bedrooms' && property.bedrooms !== undefined) {
          count = property.bedrooms;
        } else if (facility === 'Bathrooms' && property.bathrooms !== undefined) {
          count = property.bathrooms;
        }
        return (
          <Chip
            key={index}
            label={`${facility}: ${count}`}
            variant="outlined"
            color="secondary"
            size="small"
            sx={{
              backgroundColor: 'rgba(156, 39, 176, 0.04)',
              '&:hover': {
                backgroundColor: 'rgba(156, 39, 176, 0.08)',
              }
            }}
          />
        );
      })}
    </Box>
  </Paper>
)}

          {rules.length > 0 && (
            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                <RuleIcon sx={{ mr: 1 }} />
                House Rules
              </Typography>
              <List>
                {rules.map((rule, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Box sx={ 
                        { 
                          width: 6, 
                          height: 6, 
                          borderRadius: '50%', 
                          backgroundColor: theme.primary 
                        } 
                      } />
                    </ListItemIcon>
                    <ListItemText primary={rule} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          {roommates.length > 0 && (
            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                <RoommateIcon sx={{ mr: 1 }} />
                Current Roommates
              </Typography>
              <Grid container spacing={2}>
                {roommates.map((roommate, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      p: 2,
                      backgroundColor: theme.cardBackground,
                      borderRadius: 2,
                      border: `1px solid ${theme.borderColor}`
                    }}>
                      <Avatar sx={{ mr: 2, bgcolor: theme.primary }}>
                        {roommate.name ? roommate.name.charAt(0).toUpperCase() : 'R'}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {roommate.name || 'Roommate'}
                        </Typography>
                        {roommate.occupation && (
                          <Typography variant="body2" color="text.secondary">
                            {roommate.occupation}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}

          {property.contract_policy && (
            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                <PolicyIcon sx={{ mr: 1 }} />
                Contract Policy
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                {property.contract_policy}
              </Typography>
            </Paper>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 24 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {formatPrice(property.price)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                per month
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                {property.property_type} - {property.unit_type}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationIcon sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />
                <Typography variant="body1">{property.address}</Typography>
              </Box>

              {(property.bedrooms || property.bathrooms) && (
                <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                  {property.bedrooms && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <BedIcon sx={{ fontSize: 18, color: 'text.secondary', mr: 0.5 }} />
                      <Typography variant="body2">
                        {property.bedrooms} bedroom{property.bedrooms > 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  )}
                  {property.bathrooms && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <BathtubIcon sx={{ fontSize: 18, color: 'text.secondary', mr: 0.5 }} />
                      <Typography variant="body2">
                        {property.bathrooms} bathroom{property.bathrooms > 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              {billsInclusive && billsInclusive.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Bills Inclusive:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {billsInclusive.join(', ')}
                  </Typography>
                </Box>
              )}

              {property.views_count && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ViewsIcon sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {property.views_count} view{property.views_count !== 1 ? 's' : ''}
                  </Typography>
                </Box>
              )}

              {property.available_from && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CalendarIcon sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />
                  <Typography variant="body2">
                    Available: {new Date(property.available_from).toLocaleDateString()}
                    {property.available_to && (
                      <> - {new Date(property.available_to).toLocaleDateString()}</>
                    )}
                  </Typography>
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Property Rating
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Rating 
                  value={propertyRating.averageRating || 0} 
                  readOnly 
                  precision={0.1}
                  sx={{ mr: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  ({propertyRating.totalRatings || 0} review{propertyRating.totalRatings !== 1 ? 's' : ''})
                </Typography>
              </Box>

              {isLoggedIn && !isPropertyOwner && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    {userRatingData.has_rated ? 'Update your rating:' : 'Rate this property:'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Rating
                      value={userRating}
                      onChange={(event, newValue) => setUserRating(newValue || 0)}
                      precision={1}
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleRatingSubmit}
                      disabled={ratingLoading}
                    >
                      {ratingLoading ? <CircularProgress size={16} /> : 'Submit'}
                    </Button>
                  </Box>
                </Box>
              )}
              {/* Property Location Map */}
{property.latitude && property.longitude && (
  <Paper sx={{ p: 3, mt: 3 }}>
    <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
      <LocationIcon sx={{ mr: 1 }} />
      Location
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
      {property.address}
    </Typography>
    <MapSearch
      address={property.address}
      latitude={property.latitude}
      longitude={property.longitude}
      readonly={true}
      showSearch={false}
    />
  </Paper>
)}

{(!property.latitude || !property.longitude) && property.address && (
  <Paper sx={{ p: 3, mt: 3 }}>
    <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
      <LocationIcon sx={{ mr: 1 }} />
      Location
    </Typography>
    <Typography variant="body1" sx={{ mb: 2 }}>
      {property.address}
    </Typography>
    <MapSearch
      address={property.address}
      readonly={true}
      showSearch={false}
    />
  </Paper>
)}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              {isLoggedIn && !isPropertyOwner && (
                <Tooltip title={isFavorite ? "Remove from favorites" : "Add to favorites"}>
                  <IconButton
                    onClick={handleFavoriteToggle}
                    disabled={favoriteLoading}
                    sx={{
                      color: isFavorite ? theme.error : theme.textSecondary,
                      '&:hover': {
                        color: theme.error,
                        backgroundColor: theme.error + '10'
                      }
                    }}
                  >
                    {favoriteLoading ? (
                      <CircularProgress size={24} />
                    ) : isFavorite ? (
                      <FavoriteIcon />
                    ) : (
                      <FavoriteBorderIcon />
                    )}
                  </IconButton>
                </Tooltip>
              )}

              <Tooltip title="Share property">
                <IconButton
                  onClick={handleShare}
                  sx={{
                    color: theme.textSecondary,
                    '&:hover': {
                      color: theme.primary,
                      backgroundColor: theme.primary + '10'
                    }
                  }}
                >
                  <ShareIcon />
                </IconButton>
              </Tooltip>

              {isLoggedIn && !isPropertyOwner && (
                <Tooltip title="Report property">
                  <IconButton
                    onClick={() => setReportDialogOpen(true)}
                    sx={{
                      color: theme.textSecondary,
                      '&:hover': {
                        color: theme.warning,
                        backgroundColor: theme.warning + '10'
                      }
                    }}
                  >
                    <ReportIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            {!isPropertyOwner && (
  <>
    {renderBookingButton()}
  </>
)}

            {isPropertyOwner && (
              <>
                <Alert severity="info" sx={{ mt: 2 }}>
                  This is your property listing.
                </Alert>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleEdit}
                  sx={{
                    backgroundColor: theme.secondary,
                    mt: 2,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: theme.secondaryDark
                    }
                  }}
                >
                  Edit Property
                </Button>
              </>
            )}

            {(property.created_at || property.updated_at) && (
              <Paper sx={{ p: 2, mt: 2, backgroundColor: theme.cardBackground }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Property Information
                </Typography>
                {property.created_at && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Listed: {new Date(property.created_at).toLocaleDateString()}
                  </Typography>
                )}
                {property.updated_at && (
                  <Typography variant="body2" color="text.secondary">
                    Updated: {new Date(property.updated_at).toLocaleDateString()}
                  </Typography>
                )}
              </Paper>
            )}
            {!isPropertyOwner && property.owner_info && (
  <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
    <Typography variant="h6" gutterBottom sx={{ color: theme.primary, fontWeight: 600 }}>
      Contact Property Owner
    </Typography>
    <List dense>
      <ListItem disableGutters>
        <ListItemIcon><PersonIcon /></ListItemIcon>
        <ListItemText primary={property.owner_info.username} />
      </ListItem>
      <ListItem disableGutters>
        <ListItemIcon><EmailIcon /></ListItemIcon>
        <ListItemText primary={property.owner_info.email} />
      </ListItem>
      {property.owner_info.phone && (
        <ListItem disableGutters>
          <ListItemIcon><PhoneIcon /></ListItemIcon>
          <ListItemText primary={property.owner_info.phone} />
          <IconButton
            onClick={() => openWhatsApp(property.owner_info.phone, property)}
            sx={{ 
              color: '#25D366',
              '&:hover': { backgroundColor: 'rgba(37, 211, 102, 0.1)' }
            }}
            title="Contact on WhatsApp"
          >
            <WhatsAppIcon />
          </IconButton>
        </ListItem>
      )}
      {property.owner_info.business_name && (
        <ListItem disableGutters>
          <ListItemIcon><BusinessIcon /></ListItemIcon>
          <ListItemText primary={property.owner_info.business_name} />
        </ListItem>
      )}
    </List>
  </Paper>
)}
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Report Property</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Reason for reporting</InputLabel>
              <Select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                label="Reason for reporting"
              >
                <MenuItem value="misleading_info">False Information</MenuItem>
                <MenuItem value="property_condition">Property Condition Issues</MenuItem>
                <MenuItem value="safety_concerns">Safety Concerns</MenuItem>
                <MenuItem value="harassment">Harassment</MenuItem>
                <MenuItem value="fraud">Fraud</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Additional details (optional)"
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="Please provide any additional details about the issue..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleReportSubmit}
            variant="contained"
            color="error"
          >
            Submit Report
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

export default UserViewProperty;