import React, { useState, useContext } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useNavigate, useLocation } from 'react-router-dom';
import { createProperty } from '../api/propertyApi';
import { ThemeContext } from '../contexts/ThemeContext';
import ImageUpload from '../components/common/ImageUpload';

const validationSchema = yup.object().shape({
  unitType: yup.string().required('Unit type is required'),
  address: yup.string().required('Address is required'),
  description: yup.string().required('Description is required'),
  price: yup.number().positive('Price must be positive').required('Price is required'),
  amenities: yup.object(),
  facilities: yup.object().shape({
    Bedroom: yup.number().min(0, 'Bedrooms cannot be negative').required('Number of bedrooms is required'),
    Bathroom: yup.number().min(1, 'At least 1 bathroom is required').required('Number of bathrooms is required'),
    Kitchen: yup.number().min(0, 'Kitchens cannot be negative'),
    LivingRoom: yup.number().min(0, 'Living rooms cannot be negative'),
    DiningRoom: yup.number().min(0, 'Dining rooms cannot be negative'),
    ParkingSpace: yup.number().min(0, 'Parking spaces cannot be negative')
  }).required('Facilities information is required'),
  availableFrom: yup.date().required('Available from date is required'),
  contractPolicy: yup.string().required('Contract policy is required'),
  roommates: yup.array().of(yup.object().shape({
    occupation: yup.string().required('Roommate occupation is required'),
    field: yup.string().required('Roommate field/industry is required')
  })),
  rules: yup.array().of(yup.string())
});

const unitOptions = [
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
  'WiFi', 'TV', 'Air Conditioning', 'Kitchen', 'Washing Machine', 'Parking',
  'Swimming Pool', 'Gym', 'Security', 'Garden', 'Balcony', 'Furnished'
];

const availableFacilities = [
  'Swimming Pool', 'Recreation Room', 'Bed Linens', 'Hot Water', 
  'Air Conditioning', 'Kitchen', 'Washing Machine', 'WiFi', 'TV', 
  'Parking', 'Security', 'Garden'
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
      <Typography variant="body1" sx={{ flex: 1 }}>
        {facility}
        {required && <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>*</Box>}
      </Typography>
      <Box display="flex" alignItems="center" gap={1}>
        <IconButton onClick={onDecrement} size="small" disabled={count === 0}>
          <RemoveIcon />
        </IconButton>
        <Typography variant="body1" sx={{ minWidth: 30, textAlign: 'center' }}>
          {count}
        </Typography>
        <IconButton onClick={onIncrement} size="small">
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

const AmenityQuantitySelector = ({ amenity, quantity, onQuantityChange, onRemove }) => (
  <Box
    display="flex"
    alignItems="center"
    justifyContent="space-between"
    p={1}
    border="1px solid #ccc"
    borderRadius={2}
  >
    <Typography variant="body2" sx={{ flex: 1 }}>
      {amenity}
    </Typography>
    <Box display="flex" alignItems="center" gap={1}>
      <IconButton 
        onClick={() => onQuantityChange(Math.max(0, quantity - 1))} 
        size="small"
        disabled={quantity === 0}
      >
        <RemoveIcon />
      </IconButton>
      <Typography variant="body2" sx={{ minWidth: 20, textAlign: 'center' }}>
        {quantity}
      </Typography>
      <IconButton onClick={() => onQuantityChange(quantity + 1)} size="small">
        <AddIcon />
      </IconButton>
      <IconButton onClick={onRemove} size="small" color="error">
        <RemoveIcon />
      </IconButton>
    </Box>
  </Box>
);

const AddPropertyDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useContext(ThemeContext);
  const propertyType = location.state?.propertyType || '';
  const [selectedAmenityToAdd, setSelectedAmenityToAdd] = useState('');
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      unitType: '',
      address: '',
      description: '',
      amenities: {},
      facilities: {
        Bedroom: 0,
        Bathroom: 0,
        Kitchen: 0,
        LivingRoom: 0,
        DiningRoom: 0,
        ParkingSpace: 0
      },
      roommates: [],
      rules: [],
      contractPolicy: '',
      availableFrom: null,
      availableTo: null,
      price: ''
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

  const amenitiesValue = watch('amenities') || {};
  const facilitiesValue = watch('facilities') || {};

  const handleBackToPropertySelection = () => {
    navigate('/add-property');
  };

  const updateFacilityCount = (facility, increment) => {
    const currentValue = facilitiesValue[facility] || 0;
    const newValue = increment ? currentValue + 1 : Math.max(0, currentValue - 1);
    setValue(`facilities.${facility}`, newValue);
  };

  const updateAmenityQuantity = (amenity, newQuantity) => {
    const updatedAmenities = { ...amenitiesValue };
    if (newQuantity > 0) {
      updatedAmenities[amenity] = newQuantity;
    } else {
      delete updatedAmenities[amenity];
    }
    setValue('amenities', updatedAmenities);
  };

  const removeAmenity = (amenity) => {
    const updatedAmenities = { ...amenitiesValue };
    delete updatedAmenities[amenity];
    setValue('amenities', updatedAmenities);
  };

  const addAmenity = () => {
    if (selectedAmenityToAdd && !amenitiesValue[selectedAmenityToAdd]) {
      updateAmenityQuantity(selectedAmenityToAdd, 1);
      setSelectedAmenityToAdd('');
    }
  };

  const getAvailableAmenitiesForDropdown = () => {
    return availableAmenities.filter(amenity => !amenitiesValue[amenity]);
  };

  const handleFacilityToggle = (facility) => {
    const newFacilities = selectedFacilities.includes(facility)
      ? selectedFacilities.filter(f => f !== facility)
      : [...selectedFacilities, facility];
    setSelectedFacilities(newFacilities);
  };

  const handleImageUpload = (uploadedFiles) => {
    console.log('Uploaded files:', uploadedFiles);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const propertyData = {
        ...data,
        property_type: propertyType,
        unit_type: data.unitType,
        available_from: data.availableFrom ? dayjs(data.availableFrom).format('YYYY-MM-DD') : null,
        available_to: data.availableTo ? dayjs(data.availableTo).format('YYYY-MM-DD') : null,
        contract_policy: data.contractPolicy,
        amenities: JSON.stringify(data.amenities),
        facilities: JSON.stringify(data.facilities),
        roommates: JSON.stringify(data.roommates),
        rules: JSON.stringify(data.rules),
        other_facility: selectedFacilities.join(',')
      };

      await createProperty(propertyData, token);
      setSnackbarMessage('Property added successfully!');
      setSnackbarOpen(true);
      
      setTimeout(() => {
        navigate('/myproperties');
      }, 2000);
    } catch (error) {
      console.error('Error creating property:', error);
      setSnackbarMessage('Error creating property. Please try again.');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton onClick={handleBackToPropertySelection} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 700, color: theme.textPrimary }}>
            Add {propertyType} Details
          </Typography>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Property Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Unit Type *</InputLabel>
                    <Select
                      value={watch('unitType')}
                      onChange={(e) => setValue('unitType', e.target.value)}
                      error={!!errors.unitType}
                    >
                      {unitOptions.map((option) => (
                        <MenuItem key={option.label} value={option.label}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={<RequiredFieldLabel required>Monthly Rent (LKR)</RequiredFieldLabel>}
                    variant="outlined"
                    type="number"
                    {...register('price')}
                    error={!!errors.price}
                    helperText={errors.price?.message}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={<RequiredFieldLabel required>Property Address</RequiredFieldLabel>}
                    variant="outlined"
                    {...register('address')}
                    error={!!errors.address}
                    helperText={errors.address?.message}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label={<RequiredFieldLabel required>Description</RequiredFieldLabel>}
                    variant="outlined"
                    {...register('description')}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Property Details
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
                      required={facility === 'Bedroom' || facility === 'Bathroom'}
                    />
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Availability
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label={<RequiredFieldLabel required>Available From</RequiredFieldLabel>}
                    value={watch('availableFrom')}
                    onChange={(date) => setValue('availableFrom', date)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={!!errors.availableFrom}
                        helperText={errors.availableFrom?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Available Until (Optional)"
                    value={watch('availableTo')}
                    onChange={(date) => setValue('availableTo', date)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={!!errors.availableTo}
                        helperText={errors.availableTo?.message || "Leave empty for no end date"}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Amenities
              </Typography>
              {Object.keys(amenitiesValue)?.length > 0 && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {Object.entries(amenitiesValue).map(([amenity, quantity]) => (
                    <Grid item xs={12} sm={6} md={4} key={amenity}>
                      <AmenityQuantitySelector
                        amenity={amenity}
                        quantity={quantity}
                        onQuantityChange={(newQuantity) => updateAmenityQuantity(amenity, newQuantity)}
                        onRemove={() => removeAmenity(amenity)}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <FormControl sx={{ minWidth: 250 }}>
                  <InputLabel>Add Custom Amenity</InputLabel>
                  <Select
                    value={selectedAmenityToAdd}
                    onChange={(e) => setSelectedAmenityToAdd(e.target.value)}
                    label="Add Custom Amenity"
                  >
                    {getAvailableAmenitiesForDropdown().map((amenity) => (
                      <MenuItem key={amenity} value={amenity}>
                        {amenity}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addAmenity}
                  disabled={!selectedAmenityToAdd}
                >
                  Add
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Facilities
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {availableFacilities.map((facility) => (
                  <Chip
                    key={facility}
                    label={facility}
                    clickable
                    variant={selectedFacilities.includes(facility) ? "filled" : "outlined"}
                    color={selectedFacilities.includes(facility) ? "primary" : "default"}
                    onClick={() => handleFacilityToggle(facility)}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Property Images
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Upload high-quality images of your property (Required)
              </Typography>
              <ImageUpload onUpload={handleImageUpload} />
            </CardContent>
          </Card>

          {(propertyType === 'Rooms' || watch('unitType') === 'Shared Room') && (
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Roommate Details
                </Typography>
                {roommateFields.map((item, index) => (
                  <Accordion key={item.id} sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>
                        Roommate {index + 1}
                        {roommateFields.length > 1 && (
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              removeRoommate(index);
                            }}
                            size="small"
                            color="error"
                            sx={{ ml: 2 }}
                          >
                            <RemoveIcon />
                          </IconButton>
                        )}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Occupation"
                            variant="outlined"
                            {...register(`roommates.${index}.occupation`)}
                            error={!!errors.roommates?.[index]?.occupation}
                            helperText={errors.roommates?.[index]?.occupation?.message}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Field/Industry"
                            variant="outlined"
                            {...register(`roommates.${index}.field`)}
                            error={!!errors.roommates?.[index]?.field}
                            helperText={errors.roommates?.[index]?.field?.message}
                          />
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))}
                <Button 
                  onClick={() => appendRoommate({ occupation: '', field: '' })} 
                  startIcon={<AddIcon />}
                  variant="outlined"
                  sx={{ mt: 2 }}
                >
                  Add Roommate
                </Button>
              </CardContent>
            </Card>
          )}

          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                House Rules (Optional)
              </Typography>
              {ruleFields.map((item, index) => (
                <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                  <TextField
                    fullWidth
                    label={`Rule ${index + 1}`}
                    variant="outlined"
                    placeholder="e.g., No smoking, No pets, Quiet hours after 10 PM..."
                    {...register(`rules.${index}`)}
                    error={!!errors.rules?.[index]}
                    helperText={errors.rules?.[index]?.message}
                  />
                  <IconButton
                    onClick={() => removeRule(index)}
                    color="error"
                    disabled={ruleFields.length === 1}
                  >
                    <RemoveIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                onClick={() => appendRule('')}
                startIcon={<AddIcon />}
                variant="outlined"
                sx={{ mt: 1 }}
              >
                Add Rule
              </Button>
            </CardContent>
          </Card>

          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Contract Policy
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                label={<RequiredFieldLabel required>Contract Policy</RequiredFieldLabel>}
                variant="outlined"
                placeholder="Describe your rental terms, lease duration, security deposit requirements, payment terms, etc."
                {...register('contractPolicy')}
                error={!!errors.contractPolicy}
                helperText={errors.contractPolicy?.message}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Submit Property
              </Typography>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                  py: 2,
                  backgroundColor: theme.primary,
                  '&:hover': { backgroundColor: theme.secondary }
                }}
              >
                {loading ? 'Adding Property...' : 'Add Property'}
              </Button>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                Your property will be reviewed before being published
              </Typography>
            </CardContent>
          </Card>
        </form>

        {snackbarOpen && (
          <Alert
            severity={snackbarMessage.includes('Error') ? 'error' : 'success'}
            onClose={handleSnackbarClose}
            sx={{ mt: 2 }}
          >
            {snackbarMessage}
          </Alert>
        )}
      </Container>
    </LocalizationProvider>
  );
};

export default AddPropertyDetails;