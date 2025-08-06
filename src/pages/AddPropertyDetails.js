import React, { useState, useContext, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Box,
  Button,
  TextField,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Dialog,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  CircularProgress
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

const FacilityCounter = ({ facility, count, onIncrement, onDecrement, error, required = false }) => (
  <>
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      p={1}
      border="1px solid #ccc"
      borderRadius={2}
    >
      <Typography variant="subtitle1">
        <RequiredFieldLabel required={required}>{facility}</RequiredFieldLabel>
      </Typography>
      <Box display="flex" alignItems="center">
        <IconButton 
          onClick={onDecrement} 
          disabled={count <= 0}
          size="small"
        >
          <RemoveIcon />
        </IconButton>
        <Typography variant="h6" sx={{ mx: 2, minWidth: '30px', textAlign: 'center' }}>
          {count}
        </Typography>
        <IconButton 
          onClick={onIncrement}
          size="small"
        >
          <AddIcon />
        </IconButton>
      </Box>
    </Box>
    {error && (
      <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
        {error}
      </Typography>
    )}
  </>
);

const validationSchema = yup.object({
  unitType: yup.string().required('Unit type is required'),
  address: yup.string().required('Address is required'),
  price: yup.number()
    .required('Price is required')
    .positive('Price must be a positive number')
    .min(1000, 'Price must be at least LKR 1,000'),
  description: yup.string()
    .required('Description is required')
    .min(50, 'Description must be at least 50 characters'),
  amenities: yup.array().min(1, 'Please select at least one amenity'),
  facilities: yup.array().min(1, 'Please select at least one facility'),
  availableFrom: yup.date().required('Available from date is required'),
  availableTo: yup.date()
    .required('Available to date is required')
    .min(yup.ref('availableFrom'), 'Available to date must be after available from date')
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
  
  const userRole = localStorage.getItem('userRole');

  const [bedrooms, setBedrooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(0);

  const unitTypes = {
    'Apartment': ['Studio', '1BR', '2BR', '3BR', '4BR+', 'Penthouse'],
    'Villa': ['2BR Villa', '3BR Villa', '4BR Villa', '5BR+ Villa', 'Luxury Villa'],
    'Flat': ['1BR Flat', '2BR Flat', '3BR Flat', '4BR+ Flat'],
    'Room': ['Single Room', 'Shared Room', 'Master Room', 'Ensuite Room']
  };

  const amenitiesList = [
    'WiFi', 'Air Conditioning', 'Heating', 'TV', 'Kitchen', 'Refrigerator',
    'Washing Machine', 'Dryer', 'Dishwasher', 'Microwave', 'Coffee Maker',
    'Iron', 'Hair Dryer', 'Towels', 'Bed Linens', 'Toiletries'
  ];

  const facilitiesList = [
    'Parking', 'Gym', 'Swimming Pool', 'Security', 'Elevator', 'Balcony',
    'Garden', 'Rooftop Access', 'Storage', 'Laundry Room', 'Common Area',
    'Study Room', 'Conference Room', 'Recreation Room', 'BBQ Area'
  ];

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues
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

  useEffect(() => {
    if (!propertyType) {
      navigate('/add-property');
    }
    if (userRole !== 'propertyowner') {
      navigate('/user-home');
    }
  }, [propertyType, userRole, navigate]);

  const handleBackToPropertyType = () => {
    navigate('/add-property');
  };

  const handleBackToMyProperties = () => {
    navigate('/my-properties');
  };

  const onSubmit = async (data) => {
    if (uploadedImages.length === 0) {
      setSubmitError('Please upload at least one image');
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
        amenities: data.amenities,
        facilities: data.facilities,
        images: uploadedImages,
        available_from: data.availableFrom ? dayjs(data.availableFrom).format('YYYY-MM-DD') : null,
        available_to: data.availableTo ? dayjs(data.availableTo).format('YYYY-MM-DD') : null,
        is_active: true,
        approval_status: 'pending'
      };

      const response = await createProperty(propertyData);
      
      if (response.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          navigate('/my-properties');
        }, 2000);
      } else {
        setSubmitError(response.message || 'Failed to create property');
      }
    } catch (error) {
      console.error('Error creating property:', error);
      setSubmitError(error.message || 'An error occurred while creating the property');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAmenityToggle = (amenity) => {
    const currentAmenities = getValues('amenities') || [];
    const updatedAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(item => item !== amenity)
      : [...currentAmenities, amenity];
    setValue('amenities', updatedAmenities);
  };

  const handleFacilityToggle = (facility) => {
    const currentFacilities = getValues('facilities') || [];
    const updatedFacilities = currentFacilities.includes(facility)
      ? currentFacilities.filter(item => item !== facility)
      : [...currentFacilities, facility];
    setValue('facilities', updatedFacilities);
  };

  const handleImageUpload = (imageUrls) => {
    setUploadedImages(imageUrls);
  };

  if (submitSuccess) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Property Added Successfully!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Your property has been submitted and is pending approval.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/my-properties')}>
          View My Properties
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton 
          onClick={handleBackToPropertyType}
          sx={{ mr: 2, color: theme.primary }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          Add {propertyType} Details
        </Typography>
      </Box>

      {submitError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {submitError}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <RequiredFieldLabel required>Basic Information</RequiredFieldLabel>
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="unitType"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.unitType}>
                      <InputLabel>
                        <RequiredFieldLabel required>Unit Type</RequiredFieldLabel>
                      </InputLabel>
                      <Select {...field} label="Unit Type">
                        {unitTypes[propertyType]?.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
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
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="price"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={<RequiredFieldLabel required>Monthly Rent (LKR)</RequiredFieldLabel>}
                      type="number"
                      fullWidth
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
                      label={<RequiredFieldLabel required>Full Address</RequiredFieldLabel>}
                      fullWidth
                      multiline
                      rows={3}
                      error={!!errors.address}
                      helperText={errors.address?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Property Features
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FacilityCounter
                  facility="Bedrooms"
                  count={bedrooms}
                  onIncrement={() => setBedrooms(prev => prev + 1)}
                  onDecrement={() => setBedrooms(prev => Math.max(0, prev - 1))}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
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

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <RequiredFieldLabel required>Description</RequiredFieldLabel>
            </Typography>
            
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Property Description"
                  fullWidth
                  multiline
                  rows={5}
                  error={!!errors.description}
                  helperText={errors.description?.message || 'Describe your property in detail (minimum 50 characters)'}
                />
              )}
            />
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <RequiredFieldLabel required>Amenities</RequiredFieldLabel>
            </Typography>
            
            <Grid container spacing={1}>
              {amenitiesList.map((amenity) => (
                <Grid item key={amenity}>
                  <Chip
                    label={amenity}
                    clickable
                    color={watch('amenities')?.includes(amenity) ? 'primary' : 'default'}
                    onClick={() => handleAmenityToggle(amenity)}
                  />
                </Grid>
              ))}
            </Grid>
            
            {errors.amenities && (
              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                {errors.amenities.message}
              </Typography>
            )}
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <RequiredFieldLabel required>Facilities</RequiredFieldLabel>
            </Typography>
            
            <Grid container spacing={1}>
              {facilitiesList.map((facility) => (
                <Grid item key={facility}>
                  <Chip
                    label={facility}
                    clickable
                    color={watch('facilities')?.includes(facility) ? 'primary' : 'default'}
                    onClick={() => handleFacilityToggle(facility)}
                  />
                </Grid>
              ))}
            </Grid>
            
            {errors.facilities && (
              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                {errors.facilities.message}
              </Typography>
            )}
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <RequiredFieldLabel required>Availability Period</RequiredFieldLabel>
            </Typography>
            
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="availableFrom"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        label={<RequiredFieldLabel required>Available From</RequiredFieldLabel>}
                        value={field.value}
                        onChange={field.onChange}
                        minDate={dayjs()}
                        renderInput={(params) => (
                          <TextField 
                            {...params} 
                            fullWidth 
                            error={!!errors.availableFrom}
                            helperText={errors.availableFrom?.message}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Controller
                    name="availableTo"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        label={<RequiredFieldLabel required>Available To</RequiredFieldLabel>}
                        value={field.value}
                        onChange={field.onChange}
                        minDate={watch('availableFrom') ? dayjs(watch('availableFrom')).add(1, 'day') : dayjs()}
                        renderInput={(params) => (
                          <TextField 
                            {...params} 
                            fullWidth 
                            error={!!errors.availableTo}
                            helperText={errors.availableTo?.message}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </LocalizationProvider>
          </CardContent>
        </Card>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <RequiredFieldLabel required>Property Images</RequiredFieldLabel>
            </Typography>
            
            <ImageUpload
              onUpload={handleImageUpload}
              maxImages={10}
              acceptedFileTypes={['image/jpeg', 'image/jpg', 'image/png']}
              maxFileSize={10 * 1024 * 1024}
            />
            
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Upload up to 10 high-quality images of your property. First image will be used as the main photo.
            </Typography>
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={handleBackToMyProperties}
            disabled={isSubmitting}
          >
            Back to My Properties
          </Button>
          
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isSubmitting}
            sx={{ px: 4 }}
          >
            {isSubmitting ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Creating Property...
              </>
            ) : (
              'Create Property Listing'
            )}
          </Button>
        </Box>
      </form>

      <AppSnackbar />
    </Container>
  );
};

export default AddPropertyDetails;