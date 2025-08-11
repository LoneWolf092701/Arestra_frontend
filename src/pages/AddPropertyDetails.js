import React, { useState, useContext, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  TextField,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ImageUpload from '../components/common/ImageUpload';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { PropertyContext } from '../contexts/PropertyContext';
import { useNavigate, useParams } from 'react-router-dom';
import { createProperty, addPropertyDetails } from '../api/propertyApi';
import { ThemeContext } from '../contexts/ThemeContext';
import AppSnackbar from '../components/common/AppSnackbar';

const RequiredFieldLabel = ({ children, required = false }) => (
  <Box component="span">
    {children}
    {required && <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>*</Box>}
  </Box>
);

const FacilityCounter = ({ facility, count, onIncrement, onDecrement }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
    <Typography variant="subtitle1" sx={{ minWidth: 100 }}>{facility}</Typography>
    <IconButton onClick={onDecrement} disabled={count <= 0}>
      <RemoveIcon />
    </IconButton>
    <Typography variant="h6" sx={{ minWidth: 40, textAlign: 'center' }}>{count}</Typography>
    <IconButton onClick={onIncrement}>
      <AddIcon />
    </IconButton>
  </Box>
);

const validationSchema = yup.object({
  unitType: yup.string().required('Unit type is required'),
  address: yup.string().required('Address is required').min(10, 'Address must be at least 10 characters'),
  price: yup.number().required('Price is required').positive('Price must be positive'),
  description: yup.string().required('Description is required').min(50, 'Description must be at least 50 characters'),
  amenities: yup.array().min(1, 'Please select at least one amenity'),
  facilities: yup.array().min(1, 'Please select at least one facility'),
  availableFrom: yup.date().required('Available from date is required'),
  availableTo: yup.date()
    .nullable()
    .when('availableFrom', (availableFrom, schema) => {
      if (availableFrom) {
        return schema.min(yup.ref('availableFrom'), 'Available to date must be after available from date');
      }
      return schema;
    })
});

const AddPropertyDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { propertyType } = useContext(PropertyContext);
  const { theme } = useContext(ThemeContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [bedrooms, setBedrooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [customAmenityDialog, setCustomAmenityDialog] = useState(false);
  const [customFacilityDialog, setCustomFacilityDialog] = useState(false);
  const [customAmenityText, setCustomAmenityText] = useState('');
  const [customFacilityText, setCustomFacilityText] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const unitOptions = [
    { label: 'Annex', value: 'Annex' },
    { label: 'Full House', value: 'Full House' },
    { label: 'Single Room', value: 'Single Room' },
    { label: 'Shared Room', value: 'Shared Room' },
    { label: 'Studio Apartment', value: 'Studio Apartment' },
    { label: 'One Bedroom', value: 'One Bedroom' },
    { label: 'Two Bedroom', value: 'Two Bedroom' },
    { label: 'Three Bedroom', value: 'Three Bedroom' }
  ];

  const availableAmenities = [
    'WiFi', 'TV', 'Air Conditioning', 'Kitchen', 'Washing Machine', 'Parking',
    'Swimming Pool', 'Gym', 'Security', 'Garden', 'Balcony', 'Furnished'
  ];

  const availableFacilities = [
    'Swimming Pool', 'Recreation Room', 'Bed Linens', 'Hot Water', 'Air Conditioning',
    'Kitchen', 'Washing Machine', 'WiFi', 'TV', 'Parking', 'Security', 'Garden'
  ];

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      unitType: '',
      address: '',
      price: '',
      description: '',
      amenities: [],
      facilities: [],
      availableFrom: null,
      availableTo: null
    }
  });

  const showToast = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleImageUpload = (uploadedFiles) => {
    console.log('Images uploaded:', uploadedFiles);
    setUploadedImages(prev => [...prev, ...uploadedFiles]);
    showToast(`${uploadedFiles.length} image(s) uploaded successfully!`, 'success');
  };

  const handleRemoveImage = (indexToRemove) => {
    setUploadedImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const toggleAmenity = (amenity) => {
    setSelectedAmenities(prev => {
      const newAmenities = prev.includes(amenity) 
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity];
      setValue('amenities', newAmenities);
      return newAmenities;
    });
  };

  const toggleFacility = (facility) => {
    setSelectedFacilities(prev => {
      const newFacilities = prev.includes(facility) 
        ? prev.filter(f => f !== facility)
        : [...prev, facility];
      setValue('facilities', newFacilities);
      return newFacilities;
    });
  };

  const addCustomAmenity = () => {
    if (customAmenityText.trim()) {
      const newAmenity = customAmenityText.trim();
      if (!selectedAmenities.includes(newAmenity)) {
        setSelectedAmenities(prev => {
          const newAmenities = [...prev, newAmenity];
          setValue('amenities', newAmenities);
          return newAmenities;
        });
      }
      setCustomAmenityText('');
      setCustomAmenityDialog(false);
    }
  };

  const addCustomFacility = () => {
    if (customFacilityText.trim()) {
      const newFacility = customFacilityText.trim();
      if (!selectedFacilities.includes(newFacility)) {
        setSelectedFacilities(prev => {
          const newFacilities = [...prev, newFacility];
          setValue('facilities', newFacilities);
          return newFacilities;
        });
      }
      setCustomFacilityText('');
      setCustomFacilityDialog(false);
    }
  };

  const onSubmit = async (data) => {
    const formErrors = Object.keys(errors);
    if (formErrors.length > 0) {
      const firstError = errors[formErrors[0]];
      showToast(firstError?.message || 'Please fill in all required fields', 'error');
      return;
    }

    if (!data.unitType) {
      showToast('Please select a unit type', 'error');
      return;
    }

    if (!data.address || data.address.length < 10) {
      showToast('Please enter a valid address (minimum 10 characters)', 'error');
      return;
    }

    if (!data.price || parseFloat(data.price) <= 0) {
      showToast('Please enter a valid price', 'error');
      return;
    }

    if (!data.description || data.description.length < 50) {
      showToast('Please enter a detailed description (minimum 50 characters)', 'error');
      return;
    }

    if (!data.availableFrom) {
      showToast('Please select an available from date', 'error');
      return;
    }

    if (uploadedImages.length === 0) {
      showToast('Please upload at least one image of your property', 'error');
      return;
    }

    if (selectedAmenities.length === 0) {
      showToast('Please select at least one amenity', 'error');
      return;
    }

    if (selectedFacilities.length === 0) {
      showToast('Please select at least one facility', 'error');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const propertyData = {
        property_type: propertyType,
        unit_type: data.unitType,
        address: data.address,
        price: parseFloat(data.price),
        description: data.description,
        bedrooms: bedrooms,
        bathrooms: bathrooms,
        amenities: selectedAmenities,
        facilities: selectedFacilities,
        images: uploadedImages.map(img => ({
          url: img.url || img,
          filename: img.filename || '',
          size: img.size || 0
        })),
        available_from: data.availableFrom ? dayjs(data.availableFrom).format('YYYY-MM-DD') : '2025-01-05',
        available_to: data.availableTo ? dayjs(data.availableTo).format('YYYY-MM-DD') : null,
        is_active: true,
        approval_status: 'pending'
      };

      console.log('Submitting property data:', propertyData);

      const response = await createProperty(propertyData);
      
      if (response && (response.success || response.property || response.message?.includes('successfully'))) {
        showToast('Property added successfully!', 'success');
        setSubmitSuccess(true);
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        throw new Error(response?.message || 'Failed to create property');
      }
    } catch (error) {
      console.error('Property creation error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add property. Please try again.';
      setSubmitError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!propertyType) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          No property type selected. Please go back and select a property type first.
        </Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/add-property')}
          sx={{ mt: 2 }}
        >
          Back to Property Type Selection
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/add-property')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Add {propertyType} Details
        </Typography>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Property Information
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="unitType"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.unitType}>
                          <InputLabel>
                            <RequiredFieldLabel required>Unit Type</RequiredFieldLabel>
                          </InputLabel>
                          <Select {...field} label="Unit Type *">
                            {unitOptions.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.unitType && (
                            <Typography variant="caption" color="error">
                              {errors.unitType.message}
                            </Typography>
                          )}
                        </FormControl>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="price"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label={<RequiredFieldLabel required>Monthly Rent (LKR)</RequiredFieldLabel>}
                          type="number"
                          error={!!errors.price}
                          helperText={errors.price?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Controller
                      name="address"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label={<RequiredFieldLabel required>Property Address</RequiredFieldLabel>}
                          multiline
                          rows={2}
                          error={!!errors.address}
                          helperText={errors.address?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Controller
                      name="description"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label={<RequiredFieldLabel required>Description</RequiredFieldLabel>}
                          multiline
                          rows={4}
                          error={!!errors.description}
                          helperText={errors.description?.message}
                          placeholder="Describe your property in detail..."
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Property Details
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FacilityCounter
                      facility="Bedrooms"
                      count={bedrooms}
                      onIncrement={() => setBedrooms(prev => prev + 1)}
                      onDecrement={() => setBedrooms(prev => Math.max(0, prev - 1))}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FacilityCounter
                      facility="Bathrooms"
                      count={bathrooms}
                      onIncrement={() => setBathrooms(prev => prev + 1)}
                      onDecrement={() => setBathrooms(prev => Math.max(0, prev - 1))}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Availability
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="availableFrom"
                      control={control}
                      render={({ field }) => (
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            {...field}
                            label={<RequiredFieldLabel required>Available From</RequiredFieldLabel>}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                error: !!errors.availableFrom,
                                helperText: errors.availableFrom?.message
                              }
                            }}
                            minDate={dayjs()}
                          />
                        </LocalizationProvider>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="availableTo"
                      control={control}
                      render={({ field }) => (
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            {...field}
                            label="Available Until (Optional)"
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                error: !!errors.availableTo,
                                helperText: errors.availableTo?.message || 'Leave empty for no end date'
                              }
                            }}
                            minDate={watch('availableFrom') ? dayjs(watch('availableFrom')).add(1, 'day') : dayjs()}
                          />
                        </LocalizationProvider>
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <RequiredFieldLabel required>Amenities</RequiredFieldLabel>
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {availableAmenities.map((amenity) => (
                    <Chip
                      key={amenity}
                      label={amenity}
                      onClick={() => toggleAmenity(amenity)}
                      color={selectedAmenities.includes(amenity) ? 'primary' : 'default'}
                      variant={selectedAmenities.includes(amenity) ? 'filled' : 'outlined'}
                    />
                  ))}
                </Box>

                <Button
                  variant="outlined"
                  onClick={() => setCustomAmenityDialog(true)}
                  startIcon={<AddIcon />}
                >
                  Add Custom Amenity
                </Button>

                {selectedAmenities.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Selected Amenities:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {selectedAmenities.map((amenity) => (
                        <Chip
                          key={amenity}
                          label={amenity}
                          onDelete={() => toggleAmenity(amenity)}
                          color="primary"
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {errors.amenities && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    {errors.amenities.message}
                  </Typography>
                )}
              </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <RequiredFieldLabel required>Facilities</RequiredFieldLabel>
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {availableFacilities.map((facility) => (
                    <Chip
                      key={facility}
                      label={facility}
                      onClick={() => toggleFacility(facility)}
                      color={selectedFacilities.includes(facility) ? 'primary' : 'default'}
                      variant={selectedFacilities.includes(facility) ? 'filled' : 'outlined'}
                    />
                  ))}
                </Box>

                <Button
                  variant="outlined"
                  onClick={() => setCustomFacilityDialog(true)}
                  startIcon={<AddIcon />}
                >
                  Add Custom Facility
                </Button>

                {selectedFacilities.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Selected Facilities:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {selectedFacilities.map((facility) => (
                        <Chip
                          key={facility}
                          label={facility}
                          onDelete={() => toggleFacility(facility)}
                          color="primary"
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {errors.facilities && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    {errors.facilities.message}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Property Images
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Upload high-quality images of your property (Required)
                </Typography>

                <ImageUpload
                  onUpload={handleImageUpload}
                  maxFiles={10}
                  maxFileSize={10 * 1024 * 1024}
                />

                {uploadedImages.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Uploaded Images ({uploadedImages.length}):
                    </Typography>
                    <Grid container spacing={1}>
                      {uploadedImages.map((image, index) => (
                        <Grid item xs={6} key={index}>
                          <Box
                            sx={{
                              position: 'relative',
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 1,
                              overflow: 'hidden'
                            }}
                          >
                            <Box
                              component="img"
                              src={image.url || image}
                              alt={`Property ${index + 1}`}
                              sx={{
                                width: '100%',
                                height: 80,
                                objectFit: 'cover'
                              }}
                            />
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveImage(index)}
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                '&:hover': {
                                  backgroundColor: 'rgba(255, 255, 255, 0.9)'
                                }
                              }}
                            >
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Submit Property
                </Typography>

                {submitError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {submitError}
                  </Alert>
                )}

                {submitSuccess && (
                  <Alert severity="success" sx={{ mb: 2 }} icon={<CheckCircleIcon />}>
                    Property submitted successfully! Redirecting to dashboard...
                  </Alert>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                >
                  {isSubmitting ? 'Adding Property...' : 'Add Property'}
                </Button>

                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Your property will be reviewed before being published
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </form>

      <Dialog
        open={customAmenityDialog}
        onClose={() => setCustomAmenityDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Custom Amenity</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Amenity Name"
            value={customAmenityText}
            onChange={(e) => setCustomAmenityText(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomAmenityDialog(false)}>Cancel</Button>
          <Button onClick={addCustomAmenity} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={customFacilityDialog}
        onClose={() => setCustomFacilityDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Custom Facility</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Facility Name"
            value={customFacilityText}
            onChange={(e) => setCustomFacilityText(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomFacilityDialog(false)}>Cancel</Button>
          <Button onClick={addCustomFacility} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>

      <AppSnackbar
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={() => setSnackbarOpen(false)}
      />
    </Container>
  );
};

export default AddPropertyDetails;