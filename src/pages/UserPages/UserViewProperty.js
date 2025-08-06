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
import { getPublicPropertyById, incrementPropertyViews } from '../../api/propertyApi';
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
    <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
      <Button variant="contained" onClick={onLogin} size="large">
        Login Now
      </Button>
      <Button variant="text" onClick={onClose}>
        Cancel
      </Button>
    </DialogActions>
  </Dialog>
);

const PropertyImageGallery = ({ images, title }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const imageList = useMemo(() => {
    if (!images) return [];
    if (typeof images === 'string') {
      try {
        return JSON.parse(images);
      } catch {
        return [images];
      }
    }
    return Array.isArray(images) ? images : [];
  }, [images]);

  if (imageList.length === 0) {
    return (
      <Box sx={{ height: 400, bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" color="text.secondary">No images available</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        component="img"
        src={imageList[currentImageIndex]}
        alt={`${title} - Image ${currentImageIndex + 1}`}
        sx={{
          width: '100%',
          height: 400,
          objectFit: 'cover',
          borderRadius: 2,
          mb: 2
        }}
      />
      {imageList.length > 1 && (
        <Grid container spacing={1}>
          {imageList.map((image, index) => (
            <Grid item xs={3} key={index}>
              <Box
                component="img"
                src={image}
                alt={`${title} - Thumbnail ${index + 1}`}
                onClick={() => setCurrentImageIndex(index)}
                sx={{
                  width: '100%',
                  height: 80,
                  objectFit: 'cover',
                  borderRadius: 1,
                  cursor: 'pointer',
                  border: currentImageIndex === index ? 2 : 1,
                  borderColor: currentImageIndex === index ? 'primary.main' : 'grey.300',
                  '&:hover': {
                    borderColor: 'primary.main'
                  }
                }}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

const UserPropertyViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { showSnackbar } = useSnackbar();
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [loginAction, setLoginAction] = useState('');
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [complaintDialogOpen, setComplaintDialogOpen] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [complaintText, setComplaintText] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [submittingComplaint, setSubmittingComplaint] = useState(false);

  const isLoggedIn = isAuthenticated();

  useEffect(() => {
    fetchPropertyDetails();
  }, [id]);

  useEffect(() => {
    if (isLoggedIn && property) {
      checkFavoriteStatus();
    }
  }, [isLoggedIn, property]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      const data = await getPublicPropertyById(id);
      setProperty(data);
      
      await incrementPropertyViews(id);
    } catch (error) {
      console.error('Error fetching property:', error);
      setError(error.message || 'Failed to load property details');
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const status = await isFavouriteStatus(id);
      setIsFavorite(status);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!isLoggedIn) {
      setLoginAction('add this property to favorites');
      setLoginDialogOpen(true);
      return;
    }

    try {
      setFavoriteLoading(true);
      await setFavouriteStatus(id, !isFavorite);
      setIsFavorite(!isFavorite);
      showSnackbar(
        isFavorite ? 'Removed from favorites' : 'Added to favorites',
        'success'
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showSnackbar('Failed to update favorites', 'error');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleBooking = () => {
    if (!isLoggedIn) {
      setLoginAction('book this property');
      setLoginDialogOpen(true);
      return;
    }
    navigate(`/user-booking/${id}`);
  };

  const handleRating = () => {
    if (!isLoggedIn) {
      setLoginAction('rate this property');
      setLoginDialogOpen(true);
      return;
    }
    setRatingDialogOpen(true);
  };

  const handleComplaint = () => {
    if (!isLoggedIn) {
      setLoginAction('report this property');
      setLoginDialogOpen(true);
      return;
    }
    setComplaintDialogOpen(true);
  };

  const submitRating = async () => {
    if (userRating === 0) {
      showSnackbar('Please select a rating', 'warning');
      return;
    }

    try {
      setSubmittingRating(true);
      await submitPropertyRating(id, { rating: userRating });
      setRatingDialogOpen(false);
      setUserRating(0);
      showSnackbar('Rating submitted successfully', 'success');
    } catch (error) {
      console.error('Error submitting rating:', error);
      showSnackbar('Failed to submit rating', 'error');
    } finally {
      setSubmittingRating(false);
    }
  };

  const submitComplaintForm = async () => {
    if (!complaintText.trim()) {
      showSnackbar('Please enter your complaint details', 'warning');
      return;
    }

    try {
      setSubmittingComplaint(true);
      await submitComplaint({
        propertyId: id,
        complaint: complaintText.trim(),
        type: 'property_issue'
      });
      setComplaintDialogOpen(false);
      setComplaintText('');
      showSnackbar('Complaint submitted successfully', 'success');
    } catch (error) {
      console.error('Error submitting complaint:', error);
      showSnackbar('Failed to submit complaint', 'error');
    } finally {
      setSubmittingComplaint(false);
    }
  };

  const handleLogin = () => {
    localStorage.setItem('redirectAfterLogin', `/user-property-view/${id}`);
    navigate('/login');
  };

  const formatAmenities = (amenities) => {
    if (!amenities) return [];
    if (typeof amenities === 'string') {
      try {
        return JSON.parse(amenities);
      } catch {
        return amenities.split(',').map(item => item.trim());
      }
    }
    return Array.isArray(amenities) ? amenities : [];
  };

  const formatFacilities = (facilities) => {
    if (!facilities) return [];
    if (typeof facilities === 'string') {
      try {
        return JSON.parse(facilities);
      } catch {
        return facilities.split(',').map(item => item.trim());
      }
    }
    return Array.isArray(facilities) ? facilities : [];
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={400} sx={{ mb: 2 }} />
            <Skeleton variant="text" height={60} />
            <Skeleton variant="text" height={40} />
            <Skeleton variant="text" height={100} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          {error}
        </Typography>
        <Button variant="contained" onClick={() => navigate('/user-properties')}>
          Back to Properties
        </Button>
      </Container>
    );
  }

  if (!property) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Property not found
        </Typography>
        <Button variant="contained" onClick={() => navigate('/user-properties')}>
          Back to Properties
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <PropertyImageGallery 
            images={property.images} 
            title={`${property.property_type} - ${property.unit_type}`}
          />
          
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                {property.property_type} - {property.unit_type}
              </Typography>
              <IconButton 
                onClick={handleFavoriteToggle}
                disabled={favoriteLoading}
                sx={{ color: isFavorite ? 'red' : 'grey.500' }}
              >
                {favoriteLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />
                )}
              </IconButton>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationOnIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" color="text.secondary">
                {property.address}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
              {property.bedrooms !== undefined && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <BedIcon sx={{ mr: 0.5, color: 'primary.main' }} />
                  <Typography>{property.bedrooms} Bedrooms</Typography>
                </Box>
              )}
              {property.bathrooms !== undefined && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <BathtubIcon sx={{ mr: 0.5, color: 'primary.main' }} />
                  <Typography>{property.bathrooms} Bathrooms</Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <VisibilityIcon sx={{ mr: 0.5, color: 'primary.main' }} />
                <Typography>{property.views_count || 0} Views</Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              Description
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
              {property.description || 'No description available for this property.'}
            </Typography>

            {formatAmenities(property.amenities).length > 0 && (
              <Accordion sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Amenities
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={1}>
                    {formatAmenities(property.amenities).map((amenity, index) => (
                      <Grid item key={index}>
                        <Chip label={amenity} variant="outlined" size="small" />
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            )}

            {formatFacilities(property.facilities).length > 0 && (
              <Accordion sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Facilities
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={1}>
                    {formatFacilities(property.facilities).map((facility, index) => (
                      <Grid item key={index}>
                        <Chip label={facility} variant="outlined" size="small" />
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            )}

            <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
              <Button
                variant="outlined"
                startIcon={<StarIcon />}
                onClick={handleRating}
                sx={{ flex: 1 }}
              >
                Rate Property
              </Button>
              <Button
                variant="outlined"
                startIcon={<AssignmentIcon />}
                onClick={handleComplaint}
                sx={{ flex: 1 }}
              >
                Report Issue
              </Button>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 20 }}>
            <CardContent>
              <Typography variant="h4" color="primary.main" gutterBottom sx={{ fontWeight: 'bold' }}>
                LKR {property.price ? property.price.toLocaleString() : 'N/A'}
                <Typography component="span" variant="body1" color="text.secondary">
                  /month
                </Typography>
              </Typography>

              {property.available_from && property.available_to && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Available Period
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarIcon sx={{ fontSize: 16 }} />
                    <Typography variant="body2">
                      {new Date(property.available_from).toLocaleDateString()} - {new Date(property.available_to).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              )}

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleBooking}
                sx={{ 
                  mb: 2,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}
              >
                Book Now
              </Button>

              <Button
                variant="outlined"
                fullWidth
                startIcon={<WhatsAppIcon />}
                href={`https://wa.me/94771234567?text=Hi, I'm interested in the ${property.property_type} at ${property.address}`}
                target="_blank"
              >
                Contact via WhatsApp
              </Button>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Property Details
              </Typography>
              
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Property Type</TableCell>
                      <TableCell>{property.property_type}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Unit Type</TableCell>
                      <TableCell>{property.unit_type}</TableCell>
                    </TableRow>
                    {property.bedrooms !== undefined && (
                      <TableRow>
                        <TableCell>Bedrooms</TableCell>
                        <TableCell>{property.bedrooms}</TableCell>
                      </TableRow>
                    )}
                    {property.bathrooms !== undefined && (
                      <TableRow>
                        <TableCell>Bathrooms</TableCell>
                        <TableCell>{property.bathrooms}</TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell>Status</TableCell>
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
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <LoginRequiredDialog
        open={loginDialogOpen}
        onClose={() => setLoginDialogOpen(false)}
        onLogin={handleLogin}
        action={loginAction}
      />

      <Dialog open={ratingDialogOpen} onClose={() => setRatingDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Rate this Property</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="body1" gutterBottom>
              How would you rate this property?
            </Typography>
            <Rating
              value={userRating}
              onChange={(event, newValue) => setUserRating(newValue)}
              size="large"
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRatingDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={submitRating} 
            variant="contained" 
            disabled={submittingRating || userRating === 0}
          >
            {submittingRating ? <CircularProgress size={20} /> : 'Submit Rating'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={complaintDialogOpen} onClose={() => setComplaintDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Report Property Issue</DialogTitle>
        <DialogContent>
          <TextField
            multiline
            rows={4}
            fullWidth
            label="Describe the issue"
            value={complaintText}
            onChange={(e) => setComplaintText(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setComplaintDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={submitComplaintForm} 
            variant="contained" 
            disabled={submittingComplaint || !complaintText.trim()}
          >
            {submittingComplaint ? <CircularProgress size={20} /> : 'Submit Report'}
          </Button>
        </DialogActions>
      </Dialog>

      <AppSnackbar />
    </Container>
  );
};

export default UserPropertyViewPage;