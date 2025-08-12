import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  Chip,
  Rating,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Breadcrumbs,
  Link,
  Paper,
  Badge,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  LocationOn as LocationOnIcon,
  Bed as BedIcon,
  Bathtub as BathtubIcon,
  CalendarToday as CalendarTodayIcon,
  Visibility as VisibilityIcon,
  Share as ShareIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Home as HomeIcon,
  Star as StarIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Report as ReportIcon,
  BookOnline as BookOnlineIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  SquareFoot as AreaIcon,
  LocalParking as ParkingIcon,
  Wifi as WifiIcon,
  Kitchen as KitchenIcon,
  AcUnit as AcIcon,
  Tv as TvIcon,
  LocalLaundryService as LaundryIcon,
  Security as SecurityIcon,
  Pool as PoolIcon,
  FitnessCenter as GymIcon,
  Balcony as BalconyIcon,
  Yard as GardenIcon
} from '@mui/icons-material';
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
import { useTheme } from '../../contexts/ThemeContext';
import { isAuthenticated } from '../../utils/auth';
import AppSnackbar from '../../components/common/AppSnackbar';

// Enhanced Image carousel component for property images
const ImageCarousel = ({ images, propertyTitle }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  
  // Parse images safely - handle both JSON string and array formats
  const imageArray = React.useMemo(() => {
    if (!images) return ['/placeholder-property.jpg'];
    try {
      const parsed = typeof images === 'string' ? JSON.parse(images) : images;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : ['/placeholder-property.jpg'];
    } catch (error) {
      console.warn('Error parsing images:', error);
      return ['/placeholder-property.jpg'];
    }
  }, [images]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % imageArray.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + imageArray.length) % imageArray.length);
  };

  return (
    <React.Fragment>
      <Card sx={{ borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
        <CardMedia
          component="img"
          height="500"
          image={imageArray[currentImageIndex]}
          alt={`${propertyTitle} - Image ${currentImageIndex + 1}`}
          sx={{ objectFit: 'cover', cursor: 'pointer' }}
          onClick={() => setImageViewerOpen(true)}
          onError={(e) => {
            e.target.src = '/placeholder-property.jpg';
          }}
        />
        
        {/* Image counter badge */}
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            px: 2,
            py: 1,
            borderRadius: 2,
            fontSize: '0.875rem'
          }}
        >
          {currentImageIndex + 1} / {imageArray.length}
        </Box>
        
        {imageArray.length > 1 && (
          <React.Fragment>
            <IconButton
              onClick={prevImage}
              sx={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.7)' }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            
            <IconButton
              onClick={nextImage}
              sx={{
                position: 'absolute',
                right: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.7)' }
              }}
            >
              <ArrowForwardIcon />
            </IconButton>
            
            {/* Thumbnail navigation */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 1,
                maxWidth: 'calc(100% - 32px)',
                overflowX: 'auto',
                '&::-webkit-scrollbar': { display: 'none' }
              }}
            >
              {imageArray.map((image, index) => (
                <Box
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  sx={{
                    width: 60,
                    height: 40,
                    borderRadius: 1,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: index === currentImageIndex ? '3px solid white' : '2px solid rgba(255,255,255,0.5)',
                    transition: 'all 0.3s ease',
                    flexShrink: 0
                  }}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.src = '/placeholder-property.jpg';
                    }}
                  />
                </Box>
              ))}
            </Box>
          </React.Fragment>
        )}
      </Card>

      {/* Full screen image viewer */}
      <Dialog
        open={imageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { backgroundColor: 'rgba(0,0,0,0.9)' }
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <img
            src={imageArray[currentImageIndex]}
            alt={`${propertyTitle} - Full view`}
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '90vh',
              objectFit: 'contain'
            }}
          />
          <IconButton
            onClick={() => setImageViewerOpen(false)}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              color: 'white',
              backgroundColor: 'rgba(0,0,0,0.5)'
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};

// Amenities icon mapping
const getAmenityIcon = (amenity) => {
  const iconMap = {
    'WiFi': <WifiIcon />,
    'TV': <TvIcon />,
    'Air Conditioning': <AcIcon />,
    'Kitchen': <KitchenIcon />,
    'Washing Machine': <LaundryIcon />,
    'Parking': <ParkingIcon />,
    'Swimming Pool': <PoolIcon />,
    'Gym': <GymIcon />,
    'Security': <SecurityIcon />,
    'Garden': <GardenIcon />,
    'Balcony': <BalconyIcon />
  };
  return iconMap[amenity] || <CheckCircleIcon />;
};

const UserViewProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  // Property state
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [propertyStats, setPropertyStats] = useState(null);
  
  // User interaction state
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [userRatingData, setUserRatingData] = useState({ has_rated: false, rating: null });
  const [propertyRating, setPropertyRating] = useState(null);
  
  // Dialog states
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  
  // Form states
  const [userRating, setUserRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [reportCategory, setReportCategory] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [loginAction, setLoginAction] = useState('');
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const isLoggedIn = isAuthenticated();

  // Safe JSON parsing function
  const parseJsonSafely = (jsonString) => {
    if (!jsonString) return [];
    try {
      return typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
    } catch (error) {
      console.warn('Error parsing JSON:', error);
      return [];
    }
  };

  // Format price function
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Load property data
  useEffect(() => {
    const loadProperty = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch property details
        const propertyData = await getPublicPropertyById(id);
        setProperty(propertyData);
        
        // Record property view (works for both authenticated and non-authenticated users)
        try {
          await recordPropertyView(id);
        } catch (viewError) {
          console.warn('Failed to record property view:', viewError);
        }
        
        // If user is logged in, fetch user-specific data
        if (isLoggedIn) {
          try {
            // Check favorite status
            const favoriteStatus = await checkFavoriteStatus(id);
            setIsFavorite(favoriteStatus);
            
            // Get user's rating for this property
            const userRating = await getUserPropertyRating(id);
            setUserRatingData(userRating);
            
            // Set rating form data if user has already rated
            if (userRating.has_rated && userRating.rating) {
              setUserRating(userRating.rating.rating_score || 0);
              setRatingComment(userRating.rating.rating_comment || '');
            }
          } catch (userDataError) {
            console.warn('Failed to load user-specific data:', userDataError);
          }
        }
        
        // Get overall property rating (public data)
        try {
          const ratingData = await getPropertyRating(id);
          setPropertyRating(ratingData);
        } catch (ratingError) {
          console.warn('Failed to load property rating:', ratingError);
        }

        // Get property statistics
        try {
          const statsData = await getPropertyStatistics(id);
          setPropertyStats(statsData);
        } catch (statsError) {
          console.warn('Failed to load property statistics:', statsError);
        }
        
      } catch (error) {
        console.error('Error loading property:', error);
        setError(error.message || 'Failed to load property details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProperty();
    }
  }, [id, isLoggedIn]);

  // Handle favorite toggle
  const handleFavoriteToggle = async () => {
    if (!isLoggedIn) {
      setLoginAction('favorite this property');
      setLoginDialogOpen(true);
      return;
    }

    try {
      setFavoriteLoading(true);
      
      if (isFavorite) {
        await removeFromFavorites(id);
        setIsFavorite(false);
        setSnackbar({
          open: true,
          message: 'Property removed from favorites',
          severity: 'info'
        });
      } else {
        await addToFavorites(id);
        setIsFavorite(true);
        setSnackbar({
          open: true,
          message: 'Property added to favorites',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to update favorite status',
        severity: 'error'
      });
    } finally {
      setFavoriteLoading(false);
    }
  };

  // Handle rating submission
  const handleRatingSubmit = async () => {
    if (!isLoggedIn) {
      setLoginAction('rate this property');
      setLoginDialogOpen(true);
      return;
    }

    if (userRating === 0) {
      setSnackbar({
        open: true,
        message: 'Please select a rating',
        severity: 'warning'
      });
      return;
    }

    try {
      setSubmittingRating(true);
      await submitPropertyRating(id, {
        rating_score: userRating,
        rating_comment: ratingComment
      });
      
      setRatingDialogOpen(false);
      setSnackbar({
        open: true,
        message: 'Rating submitted successfully',
        severity: 'success'
      });
      
      // Refresh user rating data and property rating
      const updatedUserRating = await getUserPropertyRating(id);
      setUserRatingData(updatedUserRating);
      
      const updatedPropertyRating = await getPropertyRating(id);
      setPropertyRating(updatedPropertyRating);
      
    } catch (error) {
      console.error('Error submitting rating:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to submit rating',
        severity: 'error'
      });
    } finally {
      setSubmittingRating(false);
    }
  };

  // Handle report submission
  const handleReportSubmit = async () => {
    if (!isLoggedIn) {
      setLoginAction('report this property');
      setLoginDialogOpen(true);
      return;
    }

    if (!reportCategory || !reportDescription.trim()) {
      setSnackbar({
        open: true,
        message: 'Please fill in all report fields',
        severity: 'warning'
      });
      return;
    }

    try {
      setSubmittingReport(true);
      await submitReport(id, {
        category: reportCategory,
        description: reportDescription
      });
      
      setReportDialogOpen(false);
      setReportCategory('');
      setReportDescription('');
      setSnackbar({
        open: true,
        message: 'Report submitted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error submitting report:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to submit report',
        severity: 'error'
      });
    } finally {
      setSubmittingReport(false);
    }
  };

  // Handle booking navigation
  const handleBooking = () => {
    if (!isLoggedIn) {
      setLoginAction('book this property');
      setLoginDialogOpen(true);
      return;
    }
    navigate(`/user-booking/${id}`);
  };

  // Handle share functionality
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${property.property_type} - ${property.unit_type}`,
        text: property.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setSnackbar({
        open: true,
        message: 'Link copied to clipboard',
        severity: 'success'
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  // Error state
  if (error || !property) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Property not found'}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/user-allproperties')}
          sx={{ backgroundColor: theme.primary }}
        >
          Back to Properties
        </Button>
      </Container>
    );
  }

  const amenities = parseJsonSafely(property.amenities);
  const facilities = parseJsonSafely(property.facilities);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumb navigation */}
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        sx={{ mb: 3 }}
      >
        <Link 
          color="inherit" 
          href="/user-allproperties"
          onClick={(e) => {
            e.preventDefault();
            navigate('/user-allproperties');
          }}
        >
          Properties
        </Link>
        <Typography color="text.primary">
          {property.property_type} - {property.unit_type}
        </Typography>
      </Breadcrumbs>

      <Grid container spacing={4}>
        {/* Property Images */}
        <Grid item xs={12} md={8}>
          <ImageCarousel 
            images={property.images} 
            propertyTitle={`${property.property_type} - ${property.unit_type}`}
          />
        </Grid>

        {/* Property Summary Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, position: 'sticky', top: 20 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: theme.textPrimary }}>
                {formatPrice(property.price)}
                <Typography component="span" variant="body2" sx={{ color: theme.textSecondary, ml: 1 }}>
                  / month
                </Typography>
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
                  <IconButton 
                    onClick={handleFavoriteToggle}
                    disabled={favoriteLoading}
                    sx={{ color: isFavorite ? 'error.main' : 'text.secondary' }}
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
                
                <Tooltip title="Share property">
                  <IconButton onClick={handleShare}>
                    <ShareIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Report property">
                  <IconButton onClick={() => setReportDialogOpen(true)}>
                    <ReportIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Property Type and Location */}
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              {property.property_type} - {property.unit_type}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationOnIcon sx={{ color: theme.textSecondary, fontSize: 20, mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {property.address}
              </Typography>
            </Box>

            {/* Property Features */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              {property.bedrooms > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <BedIcon sx={{ fontSize: 18, mr: 0.5, color: theme.textSecondary }} />
                  <Typography variant="body2">{property.bedrooms} Bed</Typography>
                </Box>
              )}
              {property.bathrooms > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <BathtubIcon sx={{ fontSize: 18, mr: 0.5, color: theme.textSecondary }} />
                  <Typography variant="body2">{property.bathrooms} Bath</Typography>
                </Box>
              )}
            </Box>

            {/* Availability */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Availability
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ScheduleIcon sx={{ fontSize: 16, mr: 1, color: theme.textSecondary }} />
                <Typography variant="body2">
                  From: {formatDate(property.available_from)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ScheduleIcon sx={{ fontSize: 16, mr: 1, color: theme.textSecondary }} />
                <Typography variant="body2">
                  To: {formatDate(property.available_to)}
                </Typography>
              </Box>
            </Box>

            {/* Rating Section */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Rating 
                  value={property.average_rating || 0} 
                  readOnly 
                  precision={0.1} 
                />
                <Typography variant="body2" sx={{ ml: 1, color: theme.textSecondary }}>
                  {property.average_rating ? property.average_rating.toFixed(1) : 'No ratings'} 
                  ({property.total_ratings || 0} {property.total_ratings === 1 ? 'review' : 'reviews'})
                </Typography>
              </Box>
              
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setRatingDialogOpen(true)}
                sx={{ mb: 1 }}
              >
                {userRatingData.has_rated ? 'Update Rating' : 'Rate Property'}
              </Button>
            </Box>

            {/* Action Buttons */}
            <Button
              variant="contained"
              fullWidth
              startIcon={<BookOnlineIcon />}
              onClick={handleBooking}
              sx={{ 
                backgroundColor: theme.primary,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                mb: 2
              }}
            >
              Book Property
            </Button>

            {/* Property Stats */}
            <Box sx={{ pt: 2, borderTop: `1px solid ${theme.border}` }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Property Statistics
              </Typography>
              
              {propertyStats && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Total Views</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {propertyStats.total_views || 0}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Favorites</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {propertyStats.total_favorites || 0}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Total Ratings</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {propertyStats.total_ratings || 0}
                    </Typography>
                  </Box>
                </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Listed</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {new Date(property.created_at).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Property Details */}
        <Grid item xs={12}>
          <Paper sx={{ p: 4, borderRadius: 3 }}>
            {/* Property Overview */}
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              Property Overview
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell><strong>Property Type</strong></TableCell>
                        <TableCell>{property.property_type}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Unit Type</strong></TableCell>
                        <TableCell>{property.unit_type}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Bedrooms</strong></TableCell>
                        <TableCell>{property.bedrooms || 'Not specified'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Bathrooms</strong></TableCell>
                        <TableCell>{property.bathrooms || 'Not specified'}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell><strong>Monthly Rent</strong></TableCell>
                        <TableCell>{formatPrice(property.price)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Available From</strong></TableCell>
                        <TableCell>{formatDate(property.available_from)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Available To</strong></TableCell>
                        <TableCell>{formatDate(property.available_to)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Property ID</strong></TableCell>
                        <TableCell>#{property.id}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            {/* Description */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Description
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                  {property.description}
                </Typography>
              </AccordionDetails>
            </Accordion>

            {/* Amenities */}
            {amenities && amenities.length > 0 && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Amenities ({amenities.length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {amenities.map((amenity, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
                          {getAmenityIcon(amenity)}
                          <Typography variant="body2" sx={{ ml: 2 }}>
                            {amenity}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            )}

            {/* Facilities */}
            {facilities && Object.keys(facilities).length > 0 && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Facilities & Features
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {Object.entries(facilities).map(([facility, count], index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          p: 2,
                          border: `1px solid ${theme.border}`,
                          borderRadius: 2,
                          backgroundColor: theme.surfaceBackground
                        }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {facility}
                          </Typography>
                          <Chip 
                            label={count} 
                            size="small" 
                            color="primary"
                          />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            )}

            {/* Property Owner Info */}
            {property.owner_info && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Property Owner Information
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ mr: 2, backgroundColor: theme.primary, width: 60, height: 60 }}>
                      {property.owner_info.username?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {property.owner_info.username}
                      </Typography>
                      {property.owner_info.business_name && (
                        <Typography variant="body2" color="text.secondary">
                          {property.owner_info.business_name}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {property.owner_info.phone && (
                      <Button
                        variant="outlined"
                        startIcon={<PhoneIcon />}
                        href={`tel:${property.owner_info.phone}`}
                      >
                        Call Owner
                      </Button>
                    )}
                    {property.owner_info.email && (
                      <Button
                        variant="outlined"
                        startIcon={<EmailIcon />}
                        href={`mailto:${property.owner_info.email}`}
                      >
                        Email Owner
                      </Button>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            )}

            {/* Recent Reviews */}
            {propertyRating && propertyRating.recent_ratings && propertyRating.recent_ratings.length > 0 && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Recent Reviews ({propertyRating.recent_ratings.length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {propertyRating.recent_ratings.map((review, index) => (
                      <React.Fragment key={index}>
                        <ListItem sx={{ px: 0, alignItems: 'flex-start' }}>
                          <Avatar sx={{ mr: 2, backgroundColor: theme.primary }}>
                            {review.reviewer_username?.charAt(0).toUpperCase()}
                          </Avatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mr: 2 }}>
                                  {review.reviewer_username}
                                </Typography>
                                <Rating value={review.rating_score} readOnly size="small" />
                                <Typography variant="caption" sx={{ ml: 'auto', color: theme.textSecondary }}>
                                  {new Date(review.created_at).toLocaleDateString()}
                                </Typography>
                              </Box>
                            }
                            secondary={review.rating_comment || 'No comment provided'}
                          />
                        </ListItem>
                        {index < propertyRating.recent_ratings.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            )}

            {/* Rating Distribution */}
            {propertyRating && propertyRating.rating_distribution && Object.keys(propertyRating.rating_distribution).length > 0 && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Rating Distribution
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    {[5, 4, 3, 2, 1].map(star => {
                      const count = propertyRating.rating_distribution[star] || 0;
                      const percentage = propertyRating.total_ratings > 0 ? (count / propertyRating.total_ratings) * 100 : 0;
                      
                      return (
                        <Box key={star} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" sx={{ minWidth: 20 }}>
                            {star}
                          </Typography>
                          <StarIcon sx={{ color: 'gold', fontSize: 16, mx: 1 }} />
                          <LinearProgress
                            variant="determinate"
                            value={percentage}
                            sx={{ flex: 1, mx: 2, height: 8, borderRadius: 4 }}
                          />
                          <Typography variant="body2" sx={{ minWidth: 40, textAlign: 'right' }}>
                            {count}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </AccordionDetails>
              </Accordion>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Rating Dialog */}
      <Dialog open={ratingDialogOpen} onClose={() => setRatingDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {userRatingData.has_rated ? 'Update Your Rating' : 'Rate This Property'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>Rating</Typography>
              <Rating
                value={userRating}
                onChange={(event, newValue) => setUserRating(newValue || 0)}
                size="large"
              />
            </Box>
            <TextField
              label="Comment (Optional)"
              multiline
              rows={3}
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              placeholder="Share your experience with this property..."
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRatingDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleRatingSubmit} 
            variant="contained"
            disabled={submittingRating || userRating === 0}
          >
            {submittingRating ? <CircularProgress size={20} /> : 'Submit Rating'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onClose={() => setReportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Report Property</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              select
              label="Category"
              value={reportCategory}
              onChange={(e) => setReportCategory(e.target.value)}
              fullWidth
              SelectProps={{ native: true }}
            >
              <option value="">Select a category</option>
              <option value="misleading_info">Misleading Information</option>
              <option value="property_condition">Property Condition</option>
              <option value="safety_concerns">Safety Concerns</option>
              <option value="harassment">Harassment</option>
              <option value="fraud">Fraud</option>
              <option value="other">Other</option>
            </TextField>
            <TextField
              label="Description"
              multiline
              rows={4}
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="Please provide details about your concern..."
              fullWidth
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
            disabled={submittingReport || !reportCategory || !reportDescription.trim()}
          >
            {submittingReport ? <CircularProgress size={20} /> : 'Submit Report'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Login Dialog */}
      <Dialog open={loginDialogOpen} onClose={() => setLoginDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Login Required</DialogTitle>
        <DialogContent>
          <Typography>
            You need to be logged in to {loginAction}. Please log in to continue.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLoginDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => navigate('/login')} 
            variant="contained"
          >
            Login
          </Button>
        </DialogActions>
      </Dialog>

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

export default UserViewProperty;