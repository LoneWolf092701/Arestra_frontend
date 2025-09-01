import React, { useState, useEffect } from 'react';
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
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Alert,
  LinearProgress,
  Fab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useParams, useNavigate } from 'react-router-dom';
import { createProperty } from '../api/propertyApi';
import { ThemeContext } from '../contexts/ThemeContext';
import { PropertyContext } from '../contexts/PropertyContext';
import ImageUpload from '../components/common/ImageUpload';
import AppSnackbar from '../components/common/AppSnackbar';
import MapSearch from '../components/specific/MapSearch';

const unitOptions = [
  { label: 'Rental unit', value: 'Rental unit' },
  { label: 'Shared unit', value: 'Shared unit' },
  { label: 'Entire Unit', value: 'Entire Unit' },
  { label: 'Annex', value: 'Annex' },
  { label: 'Full House', value: 'Full House' },
  { label: 'Single Room', value: 'Single Room' },
  { label: 'Shared Room', value: 'Shared Room' },
  { label: 'Studio Apartment', value: 'Studio Apartment' },
  { label: 'One Bedroom', value: 'One Bedroom' },
  { label: 'Two Bedroom', value: 'Two Bedroom' },
  { label: 'Three Bedroom', value: 'Three Bedroom' },
];

const availableAmenities = [
  'Swimming Pool', 'Recreation Room', 'Bed Linens', 'Hot Water', 'Air Conditioning',
  'Kitchen', 'Washing Machine', 'WiFi', 'TV', 'Parking', 'Security', 'Garden',
  'Balcony', 'Furnished', 'Fridge', 'Cleaner', 'Lift'
];

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
      border={error ? "1px solid red" : "1px solid #ccc"}
      borderRadius={2}
    >
      <Typography variant="body1" sx={{ fontWeight: 500 }}>
        {facility}
        {required && <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>*</Box>}
      </Typography>
      <Box display="flex" alignItems="center">
        <IconButton onClick={onDecrement} disabled={count <= 0}>
          <RemoveIcon />
        </IconButton>
        <Typography variant="h6" sx={{ mx: 2, minWidth: '20px', textAlign: 'center' }}>
          {count}
        </Typography>
        <IconButton onClick={onIncrement}>
          <AddIcon />
        </IconButton>
      </Box>
    </Box>
    {error && (
      <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
        {error.message}
      </Typography>
    )}
  </>
);

const validationSchema = yup.object().shape({
  unitType: yup.string().required('Unit type is required'),
  address: yup.string().required('Address is required'),
  description: yup.string().required('Description is required'),
  price: yup.number().positive('Price must be a positive number').required('Price is required'),
  availableFrom: yup.date().required('Available from date is required'),
  availableTo: yup.date().min(yup.ref('availableFrom'), 'Available to date must be after available from date'),
  contractPolicy: yup.string().required('Contract policy is required')
});

const AddPropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme, isDark } = React.useContext(ThemeContext);
  const { propertyType } = React.useContext(PropertyContext);
  
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [customAmenity, setCustomAmenity] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);

  const [addressValue, setAddressValue] = useState('');
const [latitude, setLatitude] = useState(null);
const [longitude, setLongitude] = useState(null);
const [locationError, setLocationError] = useState('');
const [isLocationValid, setIsLocationValid] = useState(false);

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      unitType: '',
      address: '',
      description: '',
      facilities: {
        Bedrooms: 0,
        Bathrooms: 0,
        Kitchen: 0,
        Balcony: 0,
        'Living Area': 0,
        // Other: 0
      },
      roommates: [],
      rules: [],
      contractPolicy: '',
      availableFrom: null,
      availableTo: null,
      price: '',
      advancePercentage: 30,
      billsInclusive: []
    }
  });

  const { fields: roommateFields, append: appendRoommate, remove: removeRoommate } = useFieldArray({
    control,
    name: 'roommates'
  });

  const { fields: ruleFields, append: appendRule, remove: removeRule } = useFieldArray({
    control,
    name: 'rules'
  });

  const { fields: billFields, append: appendBill, remove: removeBill } = useFieldArray({
    control,
    name: 'billsInclusive'
  });

  const facilitiesValue = watch('facilities') || {};
  
  const handleLocationSelect = (lat, lng, formattedAddress) => {
  console.log('Location selected:', { lat, lng, formattedAddress });
  
  // Validate coordinates
  if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
    setLocationError('Invalid coordinates received');
    setIsLocationValid(false);
    return;
  }
  
  // Validate coordinate ranges
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    setLocationError('Coordinates out of valid range');
    setIsLocationValid(false);
    return;
  }
  
  setLatitude(lat);
  setLongitude(lng);
  setIsLocationValid(true);
  setLocationError('');
  
  if (formattedAddress) {
    setValue('address', formattedAddress);
    setAddressValue(formattedAddress);
  }
};

const validateLocationData = () => {
  if (!latitude || !longitude) {
    setLocationError('Please select a location on the map');
    return false;
  }
  
  if (!isLocationValid) {
    setLocationError('Invalid location data');
    return false;
  }
  
  return true;
};

  const onSubmit = async (data) => {
    

    if (selectedAmenities.length === 0) {
      setSnackbarMessage('Please select at least one amenity');
      setSnackbarOpen(true);
      return;
    }

    if (uploadedImages.length === 0) {
      setSnackbarMessage('Please upload at least one image');
      setSnackbarOpen(true);
      return;
    }

     setLocationError('');
  
  // Validate location
  if (!validateLocationData()) {
    setSnackbarMessage('Please select a valid location on the map');
    setSnackbarOpen(true);
    return;
  }

    const formattedData = {
      property_type: propertyType,
      unit_type: data.unitType,
      address: data.address,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      description: data.description,
      price: parseFloat(data.price),
      advance_percentage: parseFloat(data.advancePercentage) || 30.00, 
      amenities: selectedAmenities.reduce((acc, amenity) => {
        acc[amenity] = 1;
        return acc;
      }, {}),
      facilities: data.facilities,
      images: uploadedImages,
      rules: data.rules.filter(rule => rule && rule.trim().length > 0),
      roommates: data.roommates.filter(roommate => 
        roommate && (roommate.occupation || roommate.field || roommate.gender)
      ),
      contractPolicy: data.contractPolicy,
      billsInclusive: data.billsInclusive.filter(bill => bill && bill.trim().length > 0),
      availableFrom: data.availableFrom ? dayjs(data.availableFrom).format('YYYY-MM-DD') : null,
      availableTo: data.availableTo ? dayjs(data.availableTo).format('YYYY-MM-DD') : null,
      bedrooms: data.facilities.Bedrooms || 0,
      bathrooms: data.facilities.Bathrooms || 0
    };
    
    try {
      setLoading(true);
      await createProperty(formattedData);
      setSnackbarMessage('Property details added successfully!');
      setSnackbarOpen(true);
      setTimeout(() => {
        navigate('/myproperties');
      }, 2000);
    } catch (error) {
      console.error('Error adding property details:', error);
      setSnackbarMessage('Error adding property details');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleImageUpload = (uploadedFiles) => {
    setUploadedImages(uploadedFiles);
  };

  const handleBackToMyProperties = () => {
    navigate('/myproperties');
  };

  const updateFacilityCount = (facility, increment) => {
    const currentValue = facilitiesValue[facility] || 0;
    const newValue = increment ? currentValue + 1 : Math.max(0, currentValue - 1);
    setValue(`facilities.${facility}`, newValue);
  };

  const handleAmenityToggle = (amenity) => {
    setSelectedAmenities(prev => {
      if (prev.includes(amenity)) {
        return prev.filter(item => item !== amenity);
      } else {
        return [...prev, amenity];
      }
    });
  };

  const addCustomAmenity = () => {
    if (customAmenity.trim() && !selectedAmenities.includes(customAmenity.trim())) {
      setSelectedAmenities(prev => [...prev, customAmenity.trim()]);
      setCustomAmenity('');
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: 'center' }}>Adding property details...</Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: theme.backgroundPrimary, minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: theme.textPrimary }}>
          {propertyType} Details Form
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card sx={{ mb: 4, p: 4, borderRadius: 3, backgroundColor: theme.surfaceBackground }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Select Unit Type*
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {unitOptions.slice(0, 3).map((option) => (
                <Grid item xs={12} sm={4} key={option.value}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: watch('unitType') === option.value ? `2px solid ${theme.primary}` : '1px solid #e0e0e0',
                      backgroundColor: watch('unitType') === option.value ? `${theme.primary}10` : 'transparent',
                      '&:hover': { borderColor: theme.primary }
                    }}
                    onClick={() => setValue('unitType', option.value)}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {option.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {option.label === 'Rental unit' && 'A rented place within a multi-unit residential building or complex.'}
                        {option.label === 'Shared unit' && 'A rented place within a multi-unit residential building or complex.'}
                        {option.label === 'Entire Unit' && 'A rented place within a multi-unit residential building or complex.'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            {errors.unitType && (
              <Typography variant="caption" color="error">
                {errors.unitType.message}
              </Typography>
            )}
          </Card>

          <Card sx={{ mb: 4, p: 4, borderRadius: 3, backgroundColor: theme.surfaceBackground }}>
  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
    Amenities
  </Typography>
  
  {/* Display all amenities (predefined + custom) */}
  <Grid container spacing={1} sx={{ mb: 3 }}>
    {/* Display predefined amenities */}
    {availableAmenities.map((amenity) => (
      <Grid item key={amenity}>
        <Chip
          label={amenity}
          variant={selectedAmenities.includes(amenity) ? "filled" : "outlined"}
          color={selectedAmenities.includes(amenity) ? "primary" : "default"}
          onClick={() => handleAmenityToggle(amenity)}
          sx={{ 
            m: 0.5, 
            cursor: 'pointer',
            backgroundColor: selectedAmenities.includes(amenity) ? theme.primary : 'transparent',
            color: selectedAmenities.includes(amenity) ? 'white' : 'inherit',
            '&:hover': {
              backgroundColor: selectedAmenities.includes(amenity) ? theme.secondary : `${theme.primary}20`
            }
          }}
        />
      </Grid>
    ))}
    
    {/* Display custom amenities */}
    {selectedAmenities
      .filter(amenity => !availableAmenities.includes(amenity))
      .map((customAmenity) => (
        <Grid item key={customAmenity}>
          <Chip
            label={customAmenity}
            variant="filled"
            color="primary"
            onClick={() => handleAmenityToggle(customAmenity)}
            onDelete={() => {
              setSelectedAmenities(prev => prev.filter(item => item !== customAmenity));
            }}
            sx={{ 
              m: 0.5, 
              cursor: 'pointer',
              backgroundColor: theme.primary,
              color: 'white',
              '&:hover': {
                backgroundColor: theme.secondary
              }
            }}
          />
        </Grid>
      ))}
  </Grid>
  
  {/* Custom amenity input */}
  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
    <TextField
      value={customAmenity}
      onChange={(e) => setCustomAmenity(e.target.value)}
      placeholder="Add custom amenity"
      size="small"
      sx={{ flexGrow: 1 }}
      onKeyPress={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          addCustomAmenity();
        }
      }}
    />
    <Button
      variant="outlined"
      startIcon={<AddIcon />}
      onClick={addCustomAmenity}
      disabled={!customAmenity.trim()}
    >
      Add Custom Amenity
    </Button>
  </Box>
</Card>

          <Card sx={{ mb: 4, p: 4, borderRadius: 3, backgroundColor: theme.surfaceBackground }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Add facilities available at your place*
            </Typography>
            <Grid container spacing={3}>
              {Object.entries(facilitiesValue).map(([facility, count]) => (
                <Grid item xs={12} sm={6} md={4} key={facility}>
                  <FacilityCounter
                    facility={facility}
                    count={count || 0}
                    onIncrement={() => updateFacilityCount(facility, true)}
                    onDecrement={() => updateFacilityCount(facility, false)}
                    error={errors.facilities?.[facility]}
                    required={facility === 'Bedrooms' || facility === 'Bathrooms'}
                  />
                </Grid>
              ))}
            </Grid>
          </Card>

          <Card sx={{ mb: 4, p: 4, borderRadius: 3, backgroundColor: theme.surfaceBackground }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Add Photos your place*
            </Typography>
            <ImageUpload 
              onUpload={handleImageUpload}
              maxFiles={10}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Upload high-quality images of your property to attract more tenants.
            </Typography>
          </Card>

          <Card sx={{ mb: 4, p: 4, borderRadius: 3, backgroundColor: theme.surfaceBackground }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Add Description*
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder="Describe your property..."
              {...register('description')}
              error={!!errors.description}
              helperText={errors.description?.message}
            />
          </Card>

          {/* <Card sx={{ mb: 4, p: 4, borderRadius: 3, backgroundColor: theme.surfaceBackground }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Add the Address*
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Enter property address..."
              {...register('address')}
              error={!!errors.address}
              helperText={errors.address?.message}
            />
          </Card> */}

          <Card sx={{ mb: 4, p: 4, borderRadius: 3, backgroundColor: theme.surfaceBackground }}>
  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
    Property Address & Location*
  </Typography>
  <TextField
    fullWidth
    variant="outlined"
    label="Property Address"
    placeholder="Enter property address..."
    {...register('address')}
    value={addressValue}
    onChange={(e) => {
      setAddressValue(e.target.value);
      setValue('address', e.target.value);
    }}
    error={!!errors.address}
    helperText={errors.address?.message || "Enter the property address or search on the map below"}
    sx={{ mb: 3 }}
  />
  
  <MapSearch
    address={addressValue}
    setAddress={setAddressValue}
    onLocationSelect={handleLocationSelect}
    latitude={latitude}
    longitude={longitude}
    readonly={false}
    showSearch={true}
  />
  
  {latitude && longitude && isLocationValid && (
    <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(76, 175, 80, 0.1)', borderRadius: 1 }}>
      <Typography variant="body2" color="success.main">
        Location confirmed: {latitude.toFixed(6)}, {longitude.toFixed(6)}
      </Typography>
    </Box>
  )}

  {locationError && (
    <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(244, 67, 54, 0.1)', borderRadius: 1 }}>
      <Typography variant="body2" color="error.main">
        {locationError}
      </Typography>
    </Box>
  )}
</Card>

          {propertyType === 'Rooms' && (
            <Card sx={{ mb: 4, p: 4, borderRadius: 3, backgroundColor: theme.surfaceBackground }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Add Existing Room-mate Details
              </Typography>
              {roommateFields.map((item, index) => (
                <Accordion key={item.id} sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">
                      Roommate {index + 1}
                      <IconButton 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRoommate(index);
                        }}
                        color="error"
                        size="small"
                        sx={{ ml: 2 }}
                      >
                        <RemoveIcon />
                      </IconButton>
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Occupation"
                          variant="outlined"
                          placeholder="Student"
                          {...register(`roommates.${index}.occupation`)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Field"
                          variant="outlined"
                          placeholder="Bio"
                          {...register(`roommates.${index}.field`)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                          <InputLabel>Gender</InputLabel>
                          <Select
                            {...register(`roommates.${index}.gender`)}
                            label="Gender"
                          >
                            <MenuItem value="Male">Male</MenuItem>
                            <MenuItem value="Female">Female</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
              <Button 
                onClick={() => appendRoommate({ occupation: '', field: '', gender: '' })} 
                startIcon={<AddIcon />}
                variant="outlined"
                sx={{ mt: 2 }}
              >
                Add Roommate
              </Button>
            </Card>
          )}

          <Card sx={{ mb: 4, p: 4, borderRadius: 3, backgroundColor: theme.surfaceBackground }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Add Rules
            </Typography>
            {ruleFields.map((item, index) => (
              <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Add a house rule..."
                  {...register(`rules.${index}`)}
                />
                <IconButton 
                  onClick={() => removeRule(index)}
                  color="error"
                >
                  <RemoveIcon />
                </IconButton>
              </Box>
            ))}
            <Button 
              onClick={() => appendRule('')} 
              startIcon={<AddIcon />}
              variant="outlined"
            >
              Add Rule
            </Button>
          </Card>

          <Card sx={{ mb: 4, p: 4, borderRadius: 3, backgroundColor: theme.surfaceBackground }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Add Contract and Cancellation Policy*
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder="Include lease duration, deposit amount, notice period for cancellation..."
              {...register('contractPolicy')}
              error={!!errors.contractPolicy}
              helperText={errors.contractPolicy?.message}
            />
          </Card>

          <Card sx={{ mb: 4, p: 4, borderRadius: 3, backgroundColor: theme.surfaceBackground }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Set the Available Date*
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Controller
                    name="availableFrom"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <DatePicker
                        label="Available From"
                        value={field.value}
                        // minDate={dayjs()}   
                        onChange={field.onChange}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            error={!!error}
                            helperText={error?.message}
                          />
                        )}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Controller
                    name="availableTo"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <DatePicker
                        label="Available To"
                        value={field.value}
                        onChange={field.onChange}
                        minDate={dayjs()}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            error={!!error}
                            helperText={error?.message}
                          />
                        )}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </Card>

          {/* <Card sx={{ mb: 4, p: 4, borderRadius: 3, backgroundColor: theme.surfaceBackground }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Set Price Range*
            </Typography>
            <TextField
              fullWidth
              label="Monthly Rent (LKR)"
              variant="outlined"
              type="number"
              {...register('price')}
              error={!!errors.price}
              helperText={errors.price?.message}
            />
          </Card> */}

          <Card sx={{ mb: 4, p: 4, borderRadius: 3, backgroundColor: theme.surfaceBackground }}>
  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
    Set Price Range*
  </Typography>
  <Grid container spacing={3}>
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        label="Monthly Rent (LKR)"
        variant="outlined"
        type="number"
        {...register('price')}
        error={!!errors.price}
        helperText={errors.price?.message}
      />
    </Grid>
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        label="Advance Percentage (%)"
        variant="outlined"
        type="number"
        inputProps={{ min: 10, max: 100, step: 5 }}
        placeholder="30"
        {...register('advancePercentage')}
        error={!!errors.advancePercentage}
        helperText={errors.advancePercentage?.message || "Default is 30% if not specified"}
      />
    </Grid>
  </Grid>
</Card>


          <Card sx={{ mb: 4, p: 4, borderRadius: 3, backgroundColor: theme.surfaceBackground }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Add if any bill inclusive
            </Typography>
            {billFields.map((item, index) => (
              <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="e.g., Electricity, Water, Internet..."
                  {...register(`billsInclusive.${index}`)}
                />
                <IconButton 
                  onClick={() => removeBill(index)}
                  color="error"
                >
                  <RemoveIcon />
                </IconButton>
              </Box>
            ))}
            <Button 
              onClick={() => appendBill('')} 
              startIcon={<AddIcon />}
              variant="outlined"
            >
              Add Bill
            </Button>
          </Card>

          <Box sx={{ 
            mt: 6, 
            display: 'flex', 
            gap: 3, 
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <Button 
              variant="outlined" 
              size="large"
              onClick={handleBackToMyProperties}
              startIcon={<ArrowBackIcon />}
              sx={{ 
                px: 6, 
                py: 1.5,
                borderColor: theme.textSecondary,
                color: theme.textSecondary,
                '&:hover': {
                  backgroundColor: `${theme.textSecondary}10`,
                }
              }}
            >
              Back to My Properties
            </Button>
            <Button 
              variant="contained" 
              size="large" 
              type="submit"
              startIcon={<SaveIcon />}
              disabled={loading}
              sx={{ 
                px: 6, 
                py: 1.5,
                backgroundColor: theme.primary,
                color: isDark ? theme.textPrimary : '#FFFFFF',
                '&:hover': {
                  backgroundColor: theme.secondary,
                }
              }}
            >
              Add Property Details
            </Button>
          </Box>
        </form>

        <AppSnackbar
          open={snackbarOpen}
          message={snackbarMessage}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
        />
      </Container>
    </Box>
  );
};

export default AddPropertyDetails;