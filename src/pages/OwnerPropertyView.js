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
import { useTheme } from '../contexts/ThemeContext';
import { getOwnerPropertyById } from '../api/propertyApi';
import AppSnackbar from '../components/common/AppSnackbar';
import MapSearch from '../components/specific/MapSearch';

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
    return images.filter(img => typeof img === 'string' && img.trim() !== '');
  };

  const validImages = getValidImages();

  if (validImages.length === 0) {
    return (
      <Card sx={{ mb: 3 }}>
        <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.cardBackground, color: theme.textSecondary }}>
          <Typography variant="h6">No images available</Typography>
        </Box>
      </Card>
    );
  }

  const getCurrentImageUrl = () => transformUrlToAzure(validImages[currentImageIndex]);

  const previousImage = () => {
    setCurrentImageIndex(prev => (prev === 0 ? validImages.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentImageIndex(prev => (prev === validImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <Card sx={{ mb: 3, position: 'relative', overflow: 'hidden' }}>
        <CardMedia
          component="img"
          height="400"
          image={getCurrentImageUrl()}
          alt={propertyTitle}
          sx={{ objectFit: 'cover', cursor: 'pointer' }}
          onClick={() => setImageViewerOpen(true)}
        />
        {validImages.length > 1 && (
          <>
            <IconButton
              sx={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(0, 0, 0, 0.5)', color: 'white', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.7)' } }}
              onClick={previousImage}
            >
              <ArrowBackIcon />
            </IconButton>
            <IconButton
              sx={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(0, 0, 0, 0.5)', color: 'white', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.7)' } }}
              onClick={nextImage}
            >
              <ArrowForwardIcon />
            </IconButton>
            <Box sx={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 1 }}>
              {validImages.map((_, index) => (
                <Box
                  key={index}
                  sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: index === currentImageIndex ? 'white' : 'rgba(255,255,255,0.5)', cursor: 'pointer' }}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </Box>
          </>
        )}
        <Box sx={{ position: 'absolute', top: 16, right: 16, backgroundColor: 'rgba(0, 0, 0, 0.6)', color: 'white', px: 2, py: 1, borderRadius: 2, fontSize: '0.875rem' }}>
          {currentImageIndex + 1} / {validImages.length}
        </Box>
      </Card>
      <Dialog
        open={imageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { backgroundColor: 'transparent', boxShadow: 'none' } }}
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', color: 'white', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.7)' } }}
            onClick={() => setImageViewerOpen(false)}
          >
            <CloseIcon />
          </IconButton>
          <img
            src={getCurrentImageUrl()}
            alt={propertyTitle}
            style={{ width: '100%', height: 'auto', maxHeight: '80vh', objectFit: 'contain' }}
          />
          {validImages.length > 1 && (
            <>
              <IconButton
                sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(0, 0, 0, 0.5)', color: 'white', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.7)' } }}
                onClick={previousImage}
              >
                <ArrowBackIcon />
              </IconButton>
              <IconButton
                sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' } }}
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

const OwnerPropertyView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  console.log("Owner Property ID:", id);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError('');
        const propertyData = await getOwnerPropertyById(id);
        setProperty(propertyData);
      } catch (err) {
        console.error('Error fetching property:', err);
        setError('Failed to load property details');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProperty();
  }, [id]);

  const parseJsonField = (field) => {
    if (!field) return [];
    if (typeof field === 'object') return field;
    if (typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch {
        return field.split(',').map(item => item.trim()).filter(item => item.length > 0);
      }
    }
    return [];
  };

  const formatPrice = (price) => {
    if (!price) return 'Price not set';
    return `LKR ${parseInt(price).toLocaleString()}`;
  };

  const handleEdit = () => {
    navigate(`/update-property/${id}`);
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

  const amenities = parseJsonField(property.amenities);
  const facilities = parseJsonField(property.facilities);
  const rules = parseJsonField(property.rules);
  const roommates = parseJsonField(property.roommates);
  const images = parseJsonField(property.images);
  const billsInclusive = parseJsonField(property.bills_inclusive);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link color="inherit" href="/home">Home</Link>
        <Link color="inherit" href="/my-properties">Properties</Link>
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

          {amenities.length > 0 && (
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
                    sx={{ backgroundColor: 'rgba(25, 118, 210, 0.04)', '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.08)' } }}
                  />
                ))}
              </Box>
            </Paper>
          )}

          {facilities.length > 0 && (
            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                Facilities
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {facilities.map((facility, index) => {
                  let count = 1;
                  if (facility === 'Bedrooms' && property.bedrooms !== undefined) count = property.bedrooms;
                  else if (facility === 'Bathrooms' && property.bathrooms !== undefined) count = property.bathrooms;
                  return (
                    <Chip
                      key={index}
                      label={`${facility}: ${count}`}
                      variant="outlined"
                      color="secondary"
                      size="small"
                      sx={{ backgroundColor: 'rgba(156, 39, 176, 0.04)', '&:hover': { backgroundColor: 'rgba(156, 39, 176, 0.08)' } }}
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
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: theme.primary }} />
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
                    <Box sx={{ display: 'flex', alignItems: 'center', p: 2, backgroundColor: theme.cardBackground, borderRadius: 2, border: `1px solid ${theme.borderColor}` }}>
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

              {billsInclusive.length > 0 && (
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
                    {property.available_to && <> - {new Date(property.available_to).toLocaleDateString()}</>}
                  </Typography>
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 3 }} />

            {property.latitude && property.longitude ? (
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
            ) : property.address && (
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

            <Divider sx={{ my: 3 }} />

            <Alert severity="info" sx={{ mt: 2 }}>
              This is your property listing.
            </Alert>
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleEdit}
              sx={{ backgroundColor: theme.secondary, mt: 2, py: 1.5, fontSize: '1.1rem', fontWeight: 600, '&:hover': { backgroundColor: theme.secondaryDark } }}
            >
              Edit Property
            </Button>

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
          </Paper>
        </Grid>
      </Grid>

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      />
    </Container>
  );
};

export default OwnerPropertyView;