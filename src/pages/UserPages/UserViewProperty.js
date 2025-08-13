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
  Check as CheckIcon
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

const ImageCarousel = ({ images, propertyTitle }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const { theme } = useTheme();
  
  // Handle different image data structures from the API
  let imageArray = [];
  
  if (Array.isArray(images)) {
    // If images is array of objects with url property
    imageArray = images.map(img => {
      if (typeof img === 'object' && img.url) {
        return img.url;
      }
      // If images is array of strings
      return img;
    });
  } else if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images);
      if (Array.isArray(parsed)) {
        imageArray = parsed.map(img => {
          if (typeof img === 'object' && img.url) {
            return img.url;
          }
          return img;
        });
      }
    } catch (error) {
      console.error('Error parsing images:', error);
    }
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % imageArray.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + imageArray.length) % imageArray.length);
  };

  const openImageViewer = () => {
    setImageViewerOpen(true);
  };

  const closeImageViewer = () => {
    setImageViewerOpen(false);
  };

  return (
    <>
      <Card sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden' }}>
        {imageArray.length > 0 ? (
          <Box sx={{ position: 'relative' }}>
            <CardMedia
              component="img"
              height="400"
              image={imageArray[currentImageIndex]}
              alt={`${propertyTitle} - Image ${currentImageIndex + 1}`}
              sx={{ cursor: 'pointer', objectFit: 'cover' }}
              onClick={openImageViewer}
            />
            
            {imageArray.length > 1 && (
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
                  onClick={prevImage}
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
                
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    px: 2,
                    py: 1,
                    borderRadius: 2
                  }}
                >
                  <Typography variant="body2">
                    {currentImageIndex + 1} / {imageArray.length}
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        ) : (
          <Box
            sx={{
              height: 400,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f5f5f5'
            }}
          >
            <Typography variant="h6" color="text.secondary">
              No images available
            </Typography>
          </Box>
        )}
      </Card>

      <Dialog
        open={imageViewerOpen}
        onClose={closeImageViewer}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { backgroundColor: 'black' }
        }}
      >
        <DialogContent sx={{ p: 0, backgroundColor: 'black' }}>
          <Box sx={{ position: 'relative' }}>
            <img
              src={imageArray[currentImageIndex]}
              alt={`${propertyTitle} - Image ${currentImageIndex + 1}`}
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '90vh',
                objectFit: 'contain'
              }}
            />
            
            <IconButton
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
              }}
              onClick={closeImageViewer}
            >
              <CloseIcon />
            </IconButton>
            
            {imageArray.length > 1 && (
              <>
                <IconButton
                  sx={{
                    position: 'absolute',
                    left: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
                  }}
                  onClick={prevImage}
                >
                  <ArrowBackIcon />
                </IconButton>
                
                <IconButton
                  sx={{
                    position: 'absolute',
                    right: 16,
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
          </Box>
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
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);
  
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportData, setReportData] = useState({
    reason: '',
    description: ''
  });
  const [submittingReport, setSubmittingReport] = useState(false);
  
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const isLoggedIn = isAuthenticated();
  const currentUserId = getUserId();
  const isPropertyOwner = property && currentUserId && property.owner_id === parseInt(currentUserId);

  const parseJsonSafely = (jsonString) => {
    if (!jsonString) return [];
    if (Array.isArray(jsonString)) return jsonString;
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return [];
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price || 0);
  };

  useEffect(() => {
    if (id) {
      loadProperty();
      if (isLoggedIn) {
        checkFavoriteStatusAsync();
        loadUserRating();
        recordView();
      }
      loadPropertyRating();
    }
  }, [id, isLoggedIn]);

  const loadProperty = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await getPublicPropertyById(id);
      setProperty(data);
    } catch (error) {
      console.error('Error loading property:', error);
      setError('Failed to load property details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatusAsync = async () => {
    try {
      const status = await checkFavoriteStatus(id);
      setIsFavorite(status.isFavorite);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const loadUserRating = async () => {
    try {
      const rating = await getUserPropertyRating(id);
      setUserRatingData(rating);
      setUserRating(rating.rating || 0);
    } catch (error) {
      console.error('Error loading user rating:', error);
    }
  };

  const loadPropertyRating = async () => {
    try {
      const rating = await getPropertyRating(id);
      setPropertyRating(rating);
    } catch (error) {
      console.error('Error loading property rating:', error);
    }
  };

  const recordView = async () => {
    try {
      await recordPropertyView(id);
    } catch (error) {
      console.error('Error recording view:', error);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!isLoggedIn) {
      setSnackbar({
        open: true,
        message: 'Please log in to add favorites',
        severity: 'warning'
      });
      return;
    }

    setFavoriteLoading(true);
    
    try {
      if (isFavorite) {
        await removeFromFavorites(id);
        setIsFavorite(false);
        setSnackbar({
          open: true,
          message: 'Removed from favorites',
          severity: 'success'
        });
      } else {
        await addToFavorites(id);
        setIsFavorite(true);
        setSnackbar({
          open: true,
          message: 'Added to favorites',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update favorites',
        severity: 'error'
      });
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = `${property.property_type} - ${property.unit_type}`;
    const text = `Check out this amazing ${property.property_type} for ${formatPrice(property.price)} per month!`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (error) {
        if (error.name !== 'AbortError') {
          fallbackShare(url);
        }
      }
    } else {
      fallbackShare(url);
    }
  };

  const fallbackShare = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      setSnackbar({
        open: true,
        message: 'Property link copied to clipboard!',
        severity: 'success'
      });
    }).catch(() => {
      setSnackbar({
        open: true,
        message: 'Failed to copy link',
        severity: 'error'
      });
    });
  };

  const handleRatingSubmit = async () => {
    if (!isLoggedIn) {
      setSnackbar({
        open: true,
        message: 'Please log in to rate properties',
        severity: 'warning'
      });
      return;
    }

    setSubmittingRating(true);
    
    try {
      await submitPropertyRating(id, userRating);
      await loadPropertyRating();
      await loadUserRating();
      setRatingDialogOpen(false);
      setSnackbar({
        open: true,
        message: 'Rating submitted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error submitting rating:', error);
      setSnackbar({
        open: true,
        message: 'Failed to submit rating',
        severity: 'error'
      });
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleReportSubmit = async () => {
    if (!isLoggedIn) {
      setSnackbar({
        open: true,
        message: 'Please log in to report properties',
        severity: 'warning'
      });
      return;
    }

    if (!reportData.reason.trim()) {
      setSnackbar({
        open: true,
        message: 'Please select a reason for reporting',
        severity: 'warning'
      });
      return;
    }

    setSubmittingReport(true);
    
    try {
      await submitReport({
        type: 'property',
        target_id: id,
        reason: reportData.reason,
        description: reportData.description
      });
      
      setReportDialogOpen(false);
      setReportData({ reason: '', description: '' });
      setSnackbar({
        open: true,
        message: 'Report submitted successfully. We will review it shortly.',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error submitting report:', error);
      setSnackbar({
        open: true,
        message: 'Failed to submit report. Please try again.',
        severity: 'error'
      });
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleEditProperty = () => {
    navigate(`/update-property/${id}`);
  };

  if (loading) {
    return (
      <Container sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress size={60} sx={{ color: theme.primary }} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Container>
    );
  }

  if (!property) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6">Property not found</Typography>
        <Button variant="contained" onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Container>
    );
  }

  const amenities = parseJsonSafely(property.amenities);
  const facilities = parseJsonSafely(property.facilities);
  const rules = parseJsonSafely(property.rules);
  const roommates = parseJsonSafely(property.roommates);
  const billsInclusive = parseJsonSafely(property.bills_inclusive);
  const images = property.images;

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link underline="hover" color="inherit" onClick={() => navigate('/user-home')} sx={{ cursor: 'pointer' }}>
          Home
        </Link>
        <Link underline="hover" color="inherit" onClick={() => navigate('/user-all-properties')} sx={{ cursor: 'pointer' }}>
          Properties
        </Link>
        <Typography color="text.primary">
          {property.property_type} - {property.unit_type}
        </Typography>
      </Breadcrumbs>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <ImageCarousel 
            images={images} 
            propertyTitle={`${property.property_type} - ${property.unit_type}`}
          />

          <Paper sx={{ mt: 3, p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {property.property_type} - {property.unit_type}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body1" color="text.secondary">
                    {property.address}
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ color: theme.primary, fontWeight: 'bold' }}>
                  {formatPrice(property.price)} / month
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                {isPropertyOwner && (
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={handleEditProperty}
                    sx={{
                      backgroundColor: theme.primary,
                      color: 'white',
                      '&:hover': {
                        backgroundColor: theme.secondary,
                      },
                    }}
                  >
                    Edit Property
                  </Button>
                )}
                
                {isLoggedIn && !isPropertyOwner && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton 
                      onClick={handleFavoriteToggle} 
                      disabled={favoriteLoading}
                      color="error"
                    >
                      {favoriteLoading ? (
                        <CircularProgress size={24} />
                      ) : isFavorite ? (
                        <FavoriteIcon />
                      ) : (
                        <FavoriteBorderIcon />
                      )}
                    </IconButton>
                    <IconButton onClick={handleShare}>
                      <ShareIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => setReportDialogOpen(true)}
                      sx={{ color: '#f44336' }}
                    >
                      <ReportIcon />
                    </IconButton>
                  </Box>
                )}
              </Box>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Property Type</TableCell>
                        <TableCell>{property.property_type}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Unit Type</TableCell>
                        <TableCell>{property.unit_type}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Bedrooms</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <BedIcon sx={{ mr: 1, fontSize: 20 }} />
                            {property.bedrooms || 0}
                          </Box>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Bathrooms</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <BathtubIcon sx={{ mr: 1, fontSize: 20 }} />
                            {property.bathrooms || 0}
                          </Box>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Available From</TableCell>
                        <TableCell>{formatDate(property.available_from)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Available Until</TableCell>
                        <TableCell>{formatDate(property.available_to)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                        <TableCell>
                          <Chip 
                            label={property.is_active ? 'Available' : 'Not Available'} 
                            color={property.is_active ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  p: 2, 
                  backgroundColor: theme.surfaceBackground, 
                  borderRadius: 2, 
                  mb: 2,
                  border: `1px solid ${theme.border}`
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <StarIcon sx={{ color: '#ffc107', mr: 1 }} />
                    <Typography variant="h6" sx={{ 
                      fontWeight: 600,
                      color: theme.textPrimary
                    }}>
                      {propertyRating.averageRating?.toFixed(1) || '0.0'}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      ml: 1, 
                      color: theme.textSecondary
                    }}>
                      ({propertyRating.totalRatings || 0} reviews)
                    </Typography>
                  </Box>
                  {isLoggedIn && !isPropertyOwner && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setRatingDialogOpen(true)}
                      sx={{
                        borderColor: theme.primary,
                        color: theme.primary,
                        '&:hover': {
                          backgroundColor: theme.primary,
                          color: 'white'
                        }
                      }}
                    >
                      {userRatingData?.has_rated ? 'Update Rating' : 'Rate Property'}
                    </Button>
                  )}
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  p: 2, 
                  backgroundColor: theme.surfaceBackground, 
                  borderRadius: 2,
                  border: `1px solid ${theme.border}`
                }}>
                  <ViewsIcon sx={{ color: theme.primary, mr: 1 }} />
                  <Typography variant="body1" sx={{ 
                    fontWeight: 500,
                    color: theme.textPrimary
                  }}>
                    {property.views_count || 0} views
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Description
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.6 }}>
              {property.description}
            </Typography>

            {amenities && amenities.length > 0 && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Amenities ({amenities.length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {amenities.map((amenity, index) => (
                      <Chip 
                        key={index} 
                        label={amenity} 
                        color="primary" 
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            )}

            {facilities && facilities.length > 0 && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Facilities & Features ({facilities.length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {facilities.map((facility, index) => (
                      <Chip 
                        key={index} 
                        label={facility} 
                        color="secondary" 
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            )}

            {rules && rules.length > 0 && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <RuleIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      House Rules ({rules.length})
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {rules.map((rule, index) => (
                      <ListItem key={index} sx={{ py: 1 }}>
                        <ListItemIcon>
                          <CheckIcon sx={{ color: 'success.main', fontSize: 20 }} />
                        </ListItemIcon>
                        <ListItemText primary={rule} />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            )}

            {roommates && roommates.length > 0 && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <RoommateIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Roommates ({roommates.length})
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {roommates.map((roommate, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Paper sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                            {roommate.name || 'Roommate'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Age: {roommate.age || 'Not specified'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Occupation: {roommate.occupation || 'Not specified'}
                          </Typography>
                          {roommate.preferences && (
                            <Typography variant="body2" color="text.secondary">
                              Preferences: {roommate.preferences}
                            </Typography>
                          )}
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            )}

            {property.contract_policy && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    <PolicyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Contract Policy
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {property.contract_policy}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            )}

            {billsInclusive && billsInclusive.length > 0 && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Bills Included ({billsInclusive.length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {billsInclusive.map((bill, index) => (
                      <Chip 
                        key={index} 
                        label={bill} 
                        color="success" 
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            )}

            {property.owner_info && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Property Owner
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ width: 60, height: 60, mr: 2, backgroundColor: theme.primary }}>
                      {property.owner_info.first_name ? property.owner_info.first_name.charAt(0).toUpperCase() : 
                       property.owner_info.username ? property.owner_info.username.charAt(0).toUpperCase() : 'O'}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {property.owner_info.first_name && property.owner_info.last_name 
                          ? `${property.owner_info.first_name} ${property.owner_info.last_name}`
                          : property.owner_info.username || 'Property Owner'}
                      </Typography>
                      <Chip icon={<CheckIcon />} label="Verified Owner" color="success" size="small" sx={{ mt: 1 }} />
                    </Box>
                  </Box>
                  
                  <Grid container spacing={2}>
                    {property.owner_info.email && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <EmailIcon sx={{ mr: 1, color: theme.primary }} />
                          <Typography variant="body2">
                            {property.owner_info.email}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    
                    {property.owner_info.phone && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PhoneIcon sx={{ mr: 1, color: theme.primary }} />
                          <Typography variant="body2">
                            {property.owner_info.phone}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Quick Info
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ViewsIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="body2">
                  {property.views_count || 0} views
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CalendarIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="body2">
                  Available from {formatDate(property.available_from)}
                </Typography>
              </Box>
            </Box>

            {isLoggedIn && !isPropertyOwner && (
              <>
                <Divider sx={{ my: 2 }} />
                
                <Button 
                  variant="contained" 
                  fullWidth 
                  sx={{ 
                    mb: 2,
                    backgroundColor: theme.primary,
                    '&:hover': { backgroundColor: theme.secondary }
                  }}
                  onClick={() => navigate(`/user-booking/${id}`)}
                >
                  Book Now
                </Button>

                <Button 
                  variant="outlined" 
                  fullWidth 
                  onClick={() => setRatingDialogOpen(true)}
                >
                  {userRatingData?.has_rated ? 'Update Rating' : 'Rate Property'}
                </Button>
              </>
            )}

            {!isLoggedIn && (
              <>
                <Divider sx={{ my: 2 }} />
                <Alert severity="info" sx={{ mb: 2 }}>
                  Please log in to book properties or add to favorites
                </Alert>
                <Button 
                  variant="contained" 
                  fullWidth 
                  onClick={() => navigate('/login')}
                >
                  Login to Book
                </Button>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={ratingDialogOpen} onClose={() => setRatingDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {userRatingData?.has_rated ? 'Update Your Rating' : 'Rate This Property'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              How would you rate this property?
            </Typography>
            <Rating
              value={userRating}
              onChange={(event, newValue) => setUserRating(newValue)}
              size="large"
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary">
              Your rating helps other users make better decisions
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRatingDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleRatingSubmit}
            disabled={submittingRating || userRating === 0}
            variant="contained"
          >
            {submittingRating ? <CircularProgress size={20} /> : 'Submit Rating'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={reportDialogOpen} onClose={() => setReportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <ReportIcon sx={{ mr: 1, color: '#f44336' }} />
          Report Property
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            Please help us maintain a safe community by reporting any issues with this property.
          </Typography>
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Reason for reporting</InputLabel>
            <Select
              value={reportData.reason}
              onChange={(e) => setReportData(prev => ({ ...prev, reason: e.target.value }))}
              label="Reason for reporting"
            >
              <MenuItem value="false_information">False or misleading information</MenuItem>
              <MenuItem value="inappropriate_content">Inappropriate content</MenuItem>
              <MenuItem value="fraud">Suspected fraud</MenuItem>
              <MenuItem value="safety_concerns">Safety concerns</MenuItem>
              <MenuItem value="copyright_violation">Copyright violation</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Additional details (optional)"
            placeholder="Please provide any additional information that might help us investigate this report..."
            value={reportData.description}
            onChange={(e) => setReportData(prev => ({ ...prev, description: e.target.value }))}
          />
          
          <Alert severity="warning" sx={{ mt: 2 }}>
            Reports are reviewed by our moderation team. False reports may result in account restrictions.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleReportSubmit}
            disabled={submittingReport || !reportData.reason}
            variant="contained"
            color="error"
          >
            {submittingReport ? <CircularProgress size={20} /> : 'Submit Report'}
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