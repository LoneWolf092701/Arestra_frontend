import React from 'react';
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
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ImageUpload from '../components/common/ImageUpload';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { PropertyContext } from '../contexts/PropertyContext';
import { useNavigate } from 'react-router-dom';
import { addPropertyDetails } from '../api/propertyApi';
import { ThemeContext } from '../contexts/ThemeContext';
import AppSnackbar from '../components/common/AppSnackbar';

// Component for displaying required field indicator (red asterisk)
const RequiredFieldLabel = ({ children, required = false }) => (
  <Box component="span">
    {children}
    {required && <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>*</Box>}
  </Box>
);

// Component for managing facility counts (bedrooms, bathrooms)
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
        <IconButton onClick={onDecrement} size="small">
          <RemoveIcon />
        </IconButton>
        <Typography variant="body1" sx={{ mx: 1 }}>
          {count}
        </Typography>
        <IconButton onClick={onIncrement} size="small">
          <AddIcon />
        </IconButton>
      </Box>
    </Box>
    <Typography variant='caption' color='error'>{error}</Typography>
  </>
);

// Amenity componen
const AmenityQuantitySelector = ({ amenity, quantity, onQuantityChange, onRemove }) => (
  <Box 
    sx={{ 
      p: 2, 
      border: '1px solid #e0e0e0', 
      borderRadius: 2, 
      backgroundColor: 'background.paper',
      transition: 'all 0.2s ease',
      '&:hover': {
        borderColor: 'primary.main',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }
    }}
  >
    <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
      {amenity}
    </Typography>
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <Box display="flex" alignItems="center">
        <IconButton 
          size="small" 
          onClick={() => onQuantityChange(Math.max(0, quantity - 1))}
          disabled={quantity <= 0}
          sx={{ mr: 1 }}
        >
          <RemoveIcon />
        </IconButton>
        <Typography 
          variant="h6" 
          sx={{ 
            minWidth: 40, 
            textAlign: 'center',
            px: 1,
            py: 0.5,
            border: '1px solid #ddd',
            borderRadius: 1,
            backgroundColor: 'grey.50'
          }}
        >
          {quantity}
        </Typography>
        <IconButton 
          size="small" 
          onClick={() => onQuantityChange(quantity + 1)}
          sx={{ ml: 1 }}
        >
          <AddIcon />
        </IconButton>
      </Box>
      <IconButton 
        size="small" 
        color="error"
        onClick={onRemove}
        sx={{ 
          '&:hover': { 
            backgroundColor: 'error.light',
            color: 'error.contrastText'
          }
        }}
      >
        <RemoveIcon />
      </IconButton>
    </Box>
  </Box>
);

// Validation schema with required field definitions
const schema = yup.object().shape({
  propertyType: yup.string().required('Property type is required'),
  unitType: yup.string().required('Unit type is required'),
  
  // Amenities now stored as objects with quantities
  amenities: yup.object().test(
    'at-least-one-amenity',
    'At least one amenity with quantity > 0 is required',
    function(value) {
      if (!value) return false;
      return Object.values(value).some(qty => qty > 0);
    }
  ),
  
  facilities: yup.object().shape({
    Bathroom: yup.number().min(1, "At least one bathroom is required").required("Bathroom count is required"),
    Bedroom: yup.number().min(1, "At least one bedroom is required").required("Bedroom count is required")
  }),
  
  otherFacility: yup.string().notRequired(),
  address: yup.string().required('Address is required'),
  
  // Simplified roommates validation (still optional)
  roommates: yup.array().of(
    yup.object().shape({
      occupation: yup.string().required('Occupation is required'),
      field: yup.string().required('Field is required')
    })
  ),
  
  rules: yup
    .array()
    .of(yup.string().trim().min(1, 'Rule cannot be empty'))
    .min(1, 'At least one rule is required'),
  
  contractPolicy: yup.string().required('Contract policy is required'),
  
  availableFrom: yup.date()
    .min(new Date(), 'Available from date cannot be in the past')
    .required('Available from date is required'),
  
  availableTo: yup.date()
    .required('Available to date is required')
    .test(
      'date-not-equal',
      'Available to date must be later than available from date',
      function (value) {
        const { availableFrom } = this.parent;
        if (!value || !availableFrom) return true;
        return dayjs(value).isAfter(dayjs(availableFrom));
      }
    ),
  
  price: yup.number()
    .min(1, 'Price must be greater than 0')
    .required('Monthly rent price is required'),
  
  billsInclusive: yup
    .array()
    .of(yup.string().trim().min(1, 'Bills inclusive cannot be empty'))
    .notRequired()
});

// Success Dialog without conflicting backdrop
const SuccessDialog = ({ open, onClose }) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="sm"
    fullWidth
    // Z-index management without conflicting backdrop
    sx={{
      '& .MuiBackdrop-root': {
        backgroundColor: 'rgba(255, 255, 255, 0.95)', // White backdrop
      },
      '& .MuiDialog-paper': {
        zIndex: 1301, // Ensure dialog appears above backdrop
      }
    }}
    PaperProps={{
      sx: {
        borderRadius: 3,
        p: 2,
        textAlign: 'center',
        boxShadow: '0px 10px 40px rgba(0,0,0,0.3)', // Enhanced shadow for better visibility
        border: '2px solid',
        borderColor: 'success.main'
      }
    }}
    // Prevent the dialog from closing accidentally and ensure proper cleanup
    disableEscapeKeyDown
  >
    <DialogContent sx={{ pt: 4, pb: 2 }}>
      <CheckCircleIcon 
        sx={{ 
          fontSize: 80, 
          color: 'success.main', 
          mb: 2,
        }} 
      />
      <Typography variant="h4" gutterBottom color="success.main" sx={{ fontWeight: 'bold' }}>
        Property Added Successfully!
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
        Your property has been submitted and is now waiting for admin approval.
      </Typography>
      <Typography variant="body1" color="text.secondary">
        You will be notified once your property listing is approved and goes live on the platform.
      </Typography>
    </DialogContent>
    <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
      <Button 
        variant="contained" 
        size="large"
        onClick={onClose}
        sx={{ px: 4, py: 1.5, borderRadius: 2 }}
      >
        Back to Home
      </Button>
    </DialogActions>
  </Dialog>
);

const AppPropertyDetails = () => {
  const { propertyType } = React.useContext(PropertyContext);
  const { theme } = React.useContext(ThemeContext);
  const navigate = useNavigate();

  // State for success dialog and notifications
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [successDialogOpen, setSuccessDialogOpen] = React.useState(false);

  // State for managing available amenities and selected amenities
  const [availableAmenities] = React.useState([
    'Television (TV)', 'Air Conditioning (AC)', 'Refrigerator', 'Wi-Fi Internet', 
    'Washing Machine', 'Microwave', 'Parking Space', 'Balcony', 'Garden Access',
    'Swimming Pool Access', 'Gym Access', 'Security System', 'Furnished', 'Kitchen'
  ]);
  
  const [selectedAmenityToAdd, setSelectedAmenityToAdd] = React.useState('');

  const {
    control,
    handleSubmit,
    register,
    setValue,
    getValues,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      propertyType: propertyType || '',
      unitType: '',
      // Amenities stored as object with quantities: { 'Wi-Fi Internet': 1, 'Television (TV)': 2 }
      amenities: {},
      facilities: { Bathroom: 0, Bedroom: 0 },
      otherFacility: '',
      address: '',
      roommates: [],
      rules: [''],
      contractPolicy: '',
      availableFrom: dayjs(),
      availableTo: dayjs().add(1, 'year'),
      price: '',
      billsInclusive: []
    },
    resolver: yupResolver(schema)
  });

  console.log('Form errors:', errors);
  console.log('Current amenities:', watch('amenities'));

  // Field arrays for dynamic sections
  const { fields: roommateFields, append: appendRoommate, remove: removeRoommate } = useFieldArray({
    control,
    name: 'roommates'
  });

  const { fields: ruleFields, append: appendRule, remove: removeRule } = useFieldArray({
    control,
    name: 'rules'
  });

  const { fields: billsFields, append: appendBill, remove: removeBill } = useFieldArray({
    control,
    name: 'billsInclusive'
  });

  // Unit type options (unchanged)
  const unitOptions = [
    {
      label: 'Rental unit',
      description: 'A rented place within a multi-unit residential building or complex.'
    },
    {
      label: 'Shared unit',
      description: 'A rented place shared with other tenants.'
    },
    {
      label: 'Entire unit',
      description: 'An entire place rented by a single tenant.'
    }
  ];

  // Functions for managing facility counts
  const facilitiesValue = watch('facilities');
  const incrementFacility = (facility) => {
    const currentFacilities = getValues('facilities');
    setValue('facilities', { ...currentFacilities, [facility]: currentFacilities[facility] + 1 });
  };

  const decrementFacility = (facility) => {
    const currentFacilities = getValues('facilities');
    setValue('facilities', { ...currentFacilities, [facility]: Math.max(currentFacilities[facility] - 1, 0) });
  };

  // Functions for managing amenities with quantities
  const amenitiesValue = watch('amenities');
  
  const addAmenity = () => {
    if (selectedAmenityToAdd && !amenitiesValue[selectedAmenityToAdd]) {
      setValue('amenities', { ...amenitiesValue, [selectedAmenityToAdd]: 1 });
      setSelectedAmenityToAdd('');
    }
  };

  const updateAmenityQuantity = (amenity, newQuantity) => {
    if (newQuantity === 0) {
      // Remove amenity if quantity becomes 0
      const newAmenities = { ...amenitiesValue };
      delete newAmenities[amenity];
      setValue('amenities', newAmenities);
    } else {
      setValue('amenities', { ...amenitiesValue, [amenity]: newQuantity });
    }
  };

  const removeAmenity = (amenity) => {
    const newAmenities = { ...amenitiesValue };
    delete newAmenities[amenity];
    setValue('amenities', newAmenities);
  };

  // Get available amenities for dropdown (exclude already selected ones)
  const getAvailableAmenitiesForDropdown = () => {
    return availableAmenities.filter(amenity => !amenitiesValue[amenity]);
  };

  const occupationOptions = ['Student', 'Professional', 'Other'];
  const fieldOptions = ['Engineering', 'Arts', 'Science', 'Business', 'Other'];

  const handleImageUpload = (uploadedFiles) => {
    console.log('Uploaded files:', uploadedFiles);
  };

  const onSubmit = async (data) => {
    // Format the available dates
    const formattedData = {
      ...data,
      availableFrom: data.availableFrom ? dayjs(data.availableFrom).format('YYYY-MM-DD HH:mm:ss') : null,
      availableTo: data.availableTo ? dayjs(data.availableTo).format('YYYY-MM-DD HH:mm:ss') : null
    };

    try {
      const token = localStorage.getItem('token');
      const result = await addPropertyDetails(formattedData, token);
      console.log('Submitting property data:', result);
      
      setSuccessDialogOpen(true);
      
    } catch (error) {
      console.error('Error submitting property details:', error);
      setSnackbarMessage('Error submitting property details');
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Navigation handling to prevent DOM conflicts
  const handleSuccessDialogClose = () => {
    setSuccessDialogOpen(false);
    // Use setTimeout to ensure dialog is fully closed before navigation
    setTimeout(() => {
      navigate('/home');
    }, 100);
  };

  return (
    <>
      <Container sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Add Property Details
        </Typography>
        
        {/* Explanation of required fields */}
        <Box sx={{ mb: 3, p: 2, backgroundColor: 'info.light', borderRadius: 1 }}>
          <Typography variant="body2" color="info.dark">
            <strong>Note:</strong> Fields marked with an asterisk (*) are mandatory and must be completed.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Unit Type Selection - REQUIRED */}
        <Typography variant="h6" gutterBottom>
          <RequiredFieldLabel required>Select Unit Type</RequiredFieldLabel>
        </Typography>
        <Grid container spacing={2}>
          {unitOptions.map((option) => (
            <Grid item xs={12} sm={6} md={4} key={option.label}>
              <Card
                sx={{
                  border:
                    watch('unitType') === option.label
                      ? `2px solid ${theme.secondary}`
                      : '1px solid #ccc',
                  cursor: 'pointer'
                }}
                onClick={() => setValue('unitType', option.label)}
              >
                <CardActionArea>
                  <CardContent>
                    <Typography
                      variant="h6"
                      align="center"
                      color={watch('unitType') === option.label ? theme.secondary : 'inherit'}
                    >
                      {option.label}
                    </Typography>
                    <Typography variant="body2" align="center">
                      {option.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
        {errors.unitType && <Typography color="error">{errors.unitType.message}</Typography>}

        <Divider sx={{ my: 2 }} />

        {/* Amenities with 3-column Grid Layout */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            <RequiredFieldLabel required>Amenities Available at Your Property</RequiredFieldLabel>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Select amenities and specify how many of each are available. This helps tenants understand exactly what your property offers.
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

          {/* Add new amenity section */}
          <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControl sx={{ minWidth: 250 }}>
              <InputLabel>Add Amenity</InputLabel>
              <Select
                value={selectedAmenityToAdd}
                onChange={(e) => setSelectedAmenityToAdd(e.target.value)}
                label="Add Amenity"
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
              sx={{ height: 'fit-content' }}
            >
              Add
            </Button>
          </Box>
          
          {/* Show available amenities count */}
          {Object.keys(amenitiesValue)?.length > 0 && (
            <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
              {Object.keys(amenitiesValue)?.length} amenities selected
            </Typography>
          )}
          
          {errors.amenities && (
            <Typography color="error" sx={{ mt: 1 }}>{errors.amenities.message}</Typography>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Facilities Section - REQUIRED */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            <RequiredFieldLabel required>Basic Facilities</RequiredFieldLabel>
          </Typography>
          <Grid container spacing={2}>
            {Object.keys(facilitiesValue).map((facility) => (
              <Grid item xs={12} sm={6} md={4} key={facility}>
                <FacilityCounter
                  facility={facility}
                  count={facilitiesValue[facility]}
                  onIncrement={() => incrementFacility(facility)}
                  onDecrement={() => decrementFacility(facility)}
                  error={errors.facilities?.[facility]?.message}
                  required={true}
                />
              </Grid>
            ))}
          </Grid>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Other Facilities (Optional)"
              variant="outlined"
              placeholder="Describe any additional facilities not mentioned above..."
              {...register('otherFacility')}
              error={!!errors.otherFacility}
              helperText={errors.otherFacility?.message}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Image Upload Section - Optional but Recommended */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Property Photos (Recommended)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            High-quality photos significantly increase inquiry rates. Add multiple photos to showcase your property's best features.
          </Typography>
          <ImageUpload onUpload={handleImageUpload} />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Simplified Address Section - REQUIRED */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            <RequiredFieldLabel required>Property Address</RequiredFieldLabel>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Provide the complete address including street number, city, and postal code.
          </Typography>
          <TextField
            fullWidth
            label="Complete Address"
            variant="outlined"
            placeholder="e.g., 123 Main Street, Colombo 03, Sri Lanka"
            multiline
            rows={2}
            {...register('address')}
            error={!!errors.address}
            helperText={errors.address?.message || "Include street address, city, and postal code for better visibility"}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Roommates Section - Optional */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Current Roommates (Optional)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Share information about existing roommates to help potential tenants understand the living environment. Personal details remain confidential.
          </Typography>
          {roommateFields.map((item, index) => (
            <Card key={item.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="subtitle1" color="primary">
                  Roommate {index + 1}
                </Typography>
                <IconButton onClick={() => removeRoommate(index)} color="error">
                  <RemoveIcon />
                </IconButton>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined" required>
                    <InputLabel>
                      <RequiredFieldLabel required>Occupation</RequiredFieldLabel>
                    </InputLabel>
                    <Select
                      label="Occupation *"
                      defaultValue={item.occupation}
                      {...register(`roommates.${index}.occupation`)}
                      error={!!errors.roommates?.[index]?.occupation}
                    >
                      {occupationOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.roommates?.[index]?.occupation && (
                      <Typography color="error" variant="caption">
                        {errors.roommates[index].occupation.message}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined" required>
                    <InputLabel>
                      <RequiredFieldLabel required>Field</RequiredFieldLabel>
                    </InputLabel>
                    <Select
                      label="Field *"
                      defaultValue={item.field}
                      {...register(`roommates.${index}.field`)}
                      error={!!errors.roommates?.[index]?.field}
                    >
                      {fieldOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.roommates?.[index]?.field && (
                      <Typography color="error" variant="caption">
                        {errors.roommates[index].field.message}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
              </Grid>
            </Card>
          ))}
          <Button 
            onClick={() => appendRoommate({ occupation: '', field: '' })} 
            startIcon={<AddIcon />}
            variant="outlined"
          >
            Add Roommate Information
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Rules Section - REQUIRED */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            <RequiredFieldLabel required>House Rules</RequiredFieldLabel>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Clear house rules help set expectations and ensure compatibility with potential tenants.
          </Typography>
          {ruleFields.map((item, index) => (
            <Box display="flex" alignItems="center" key={item.id} my={1} gap={1}>
              <TextField
                fullWidth
                label={`Rule ${index + 1} *`}
                variant="outlined"
                placeholder="e.g., No smoking, No pets, Quiet hours after 10 PM..."
                {...register(`rules.${index}`)}
                error={!!errors.rules?.[index]}
                helperText={errors.rules?.[index]?.message}
                required
              />
              <IconButton 
                onClick={() => removeRule(index)}
                disabled={ruleFields?.length === 1} // Keep at least one rule
              >
                <RemoveIcon />
              </IconButton>
            </Box>
          ))}
          <Button onClick={() => appendRule('')} startIcon={<AddIcon />}>
            Add Another Rule
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Contract Policy Section - REQUIRED */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            <RequiredFieldLabel required>Contract & Cancellation Policy</RequiredFieldLabel>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Clearly outline your lease terms, deposit requirements, and cancellation policies.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            placeholder="Include lease duration, deposit amount, notice period for cancellation, and any other important terms..."
            {...register('contractPolicy')}
            error={!!errors.contractPolicy}
            helperText={errors.contractPolicy?.message}
            required
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Available Dates - REQUIRED */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            <RequiredFieldLabel required>Available Dates</RequiredFieldLabel>
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller
                name="availableFrom"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Available From *"
                    value={field.value}
                    onChange={(newValue) => field.onChange(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={!!errors.availableFrom}
                        helperText={errors.availableFrom?.message}
                        required
                      />
                    )}
                  />
                )}
              />
              <Controller
                name="availableTo"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Available Until *"
                    value={field.value}
                    onChange={(newValue) => field.onChange(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={!!errors.availableTo}
                        helperText={errors.availableTo?.message}
                        required
                      />
                    )}
                  />
                )}
              />
            </Box>
          </LocalizationProvider>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Monthly Rent Price - REQUIRED */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            <RequiredFieldLabel required>Monthly Rent Price</RequiredFieldLabel>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Set a competitive monthly rent based on your property's location, size, and amenities.
          </Typography>
          <TextField
            label="Monthly Rent (LKR) *"
            type="number"
            variant="outlined"
            fullWidth
            placeholder="e.g., 25000"
            {...register('price')}
            error={!!errors.price}
            helperText={errors.price?.message || "Enter amount in Sri Lankan Rupees"}
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>LKR</Typography>
            }}
            required
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Bills Inclusive Section - Optional */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Bills Included in Rent (Optional)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Specify which utility bills are included in the monthly rent to attract more tenants.
          </Typography>
          {billsFields.map((item, index) => (
            <Box display="flex" alignItems="center" key={item.id} my={1} gap={1}>
              <TextField
                fullWidth
                label={`Bill ${index + 1}`}
                variant="outlined"
                placeholder="e.g., Electricity, Water, Internet, Gas..."
                {...register(`billsInclusive.${index}`)}
                error={!!errors.billsInclusive?.[index]}
                helperText={errors.billsInclusive?.[index]?.message}
              />
              <IconButton onClick={() => removeBill(index)}>
                <RemoveIcon />
              </IconButton>
            </Box>
          ))}
          <Button onClick={() => appendBill('')} startIcon={<AddIcon />}>
            Add Bills Included
          </Button>
        </Box>

        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Button 
            variant="contained" 
            size="large" 
            onClick={handleSubmit(onSubmit)}
            sx={{ px: 6, py: 1.5 }}
          >
            Submit Property for Approval
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Your property will be reviewed by our team and published within 24-48 hours.
          </Typography>
        </Box>

        <AppSnackbar
          open={snackbarOpen}
          message={snackbarMessage}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
        />
      </Container>

      {/* Success Dialog with proper z-index management */}
      <SuccessDialog 
        open={successDialogOpen} 
        onClose={handleSuccessDialogClose} 
      />
    </>
  );
};

export default AppPropertyDetails;