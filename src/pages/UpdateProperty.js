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
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useParams, useNavigate } from 'react-router-dom';
import { getPropertyDetailsById, updateProperty } from '../api/propertyApi';
import { ThemeContext } from '../contexts/ThemeContext';
import ImageUpload from '../components/common/ImageUpload';
import AppSnackbar from '../components/common/AppSnackbar';

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

const RequiredFieldLabel = ({ children, required = false }) => (
  <Box component="span">
    {children}
    {required && <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>*</Box>}
  </Box>
);

const FacilityCounter = ({ facility, count, onIncrement, onDecrement, error, required = false, disabled = false }) => (
  <>
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      p={1}
      border={error ? "1px solid red" : "1px solid #ccc"}
      borderRadius={2}
      sx={{ opacity: disabled ? 0.6 : 1 }}
    >
      <Typography variant="subtitle1">
        <RequiredFieldLabel required={required}>{facility}</RequiredFieldLabel>
      </Typography>
      <Box display="flex" alignItems="center">
        <IconButton 
          onClick={onDecrement} 
          disabled={count <= 0 || disabled}
          size="small"
        >
          <RemoveIcon />
        </IconButton>
        <Typography variant="h6" sx={{ mx: 2, minWidth: 30, textAlign: 'center' }}>
          {count}
        </Typography>
        <IconButton 
          onClick={onIncrement} 
          disabled={disabled}
          size="small"
        >
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

const AmenityQuantitySelector = ({ amenity, quantity, onQuantityChange, onRemove, disabled = false }) => (
  <Card variant="outlined" sx={{ p: 2, opacity: disabled ? 0.6 : 1 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
      <Typography variant="subtitle2">{amenity}</Typography>
      {!disabled && (
        <IconButton 
          onClick={onRemove} 
          size="small" 
          color="error"
        >
          <RemoveIcon />
        </IconButton>
      )}
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <IconButton 
        onClick={() => onQuantityChange(Math.max(0, quantity - 1))} 
        size="small"
        disabled={quantity <= 0 || disabled}
      >
        <RemoveIcon />
      </IconButton>
      <Typography variant="h6" sx={{ mx: 2, minWidth: 30, textAlign: 'center' }}>
        {quantity || 0}
      </Typography>
      <IconButton 
        onClick={() => onQuantityChange((quantity || 0) + 1)} 
        size="small"
        disabled={disabled}
      >
        <AddIcon />
      </IconButton>
    </Box>
  </Card>
);

const validationSchema = yup.object({
  propertyType: yup.string().required('Property type is required'),
  unitType: yup.string().required('Unit type is required'),
  address: yup.string().required('Address is required'),
  description: yup.string().required('Description is required'),
  price: yup.number().positive('Price must be positive').required('Price is required'),
  facilities: yup.object({
    Bedroom: yup.number().min(0, 'Bedrooms cannot be negative').required('Number of bedrooms is required'),
    Bathroom: yup.number().min(1, 'At least 1 bathroom is required').required('Number of bathrooms is required'),
    Kitchen: yup.number().min(0, 'Kitchens cannot be negative'),
    LivingRoom: yup.number().min(0, 'Living rooms cannot be negative'),
    DiningRoom: yup.number().min(0, 'Dining rooms cannot be negative'),
    ParkingSpace: yup.number().min(0, 'Parking spaces cannot be negative')
  }).required('Facilities information is required'),
  availableFrom: yup.date().required('Available from date is required'),
  availableTo: yup.date().min(yup.ref('availableFrom'), 'Available to date must be after available from date'),
  contractPolicy: yup.string().required('Contract policy is required')
});

const UpdateProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme, isDark } = React.useContext(ThemeContext);
  
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [selectedAmenityToAdd, setSelectedAmenityToAdd] = useState('');

  const { register, handleSubmit, control, watch, setValue, reset, formState: { errors } } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      propertyType: '',
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
      price: '',
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

  const amenitiesValue = watch('amenities') || {};
  const facilitiesValue = watch('facilities') || {};

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const property = await getPropertyDetailsById(id);
        if (property) {
          reset({
            propertyType: property.property_type || '',
            unitType: property.unit_type || '',
            address: property.address || '',
            description: property.description || '',
            amenities: property.amenities ? JSON.parse(property.amenities) : {},
            facilities: property.facilities ? JSON.parse(property.facilities) : {
              Bedroom: 0, Bathroom: 0, Kitchen: 0, LivingRoom: 0, DiningRoom: 0, ParkingSpace: 0
            },
            roommates: property.roommates ? JSON.parse(property.roommates) : [],
            rules: property.rules ? JSON.parse(property.rules) : [],
            contractPolicy: property.contract_policy || '',
            availableFrom: property.available_from ? dayjs(property.available_from) : null,
            availableTo: property.available_to ? dayjs(property.available_to) : null,
            price: property.price || '',
            billsInclusive: property.bills_inclusive ? JSON.parse(property.bills_inclusive) : []
          });
        }
      } catch (error) {
        console.error('Error fetching property details:', error);
        setSnackbarMessage('Error loading property details');
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id, reset]);

  const onSubmit = async (data) => {
    const formattedData = {
      ...data,
      availableFrom: data.availableFrom ? dayjs(data.availableFrom).format('YYYY-MM-DD HH:mm:ss') : null,
      availableTo: data.availableTo ? dayjs(data.availableTo).format('YYYY-MM-DD HH:mm:ss') : null
    };
    
    try {
      const token = localStorage.getItem('token');
      await updateProperty(id, formattedData, token);
      setSnackbarMessage('Property updated successfully!');
      setSnackbarOpen(true);
      setTimeout(() => {
        navigate('/myproperties');
      }, 2000);
    } catch (error) {
      console.error('Error updating property details:', error);
      setSnackbarMessage('Error updating property details');
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleImageUpload = (uploadedFiles) => {
    console.log('Uploaded files:', uploadedFiles);
  };

  const handleBackToMyProperties = () => {
    navigate('/myproperties');
  };

  const handleCancelEdit = () => {
    setEditingSection('');
  };

  const updateFacilityCount = (facility, increment) => {
    const currentValue = facilitiesValue[facility] || 0;
    const newValue = increment ? currentValue + 1 : Math.max(0, currentValue - 1);
    setValue(`facilities.${facility}`, newValue);
  };

  const updateAmenityQuantity = (amenity, quantity) => {
    const updatedAmenities = { ...amenitiesValue };
    if (quantity <= 0) {
      delete updatedAmenities[amenity];
    } else {
      updatedAmenities[amenity] = quantity;
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
      const updatedAmenities = { ...amenitiesValue, [selectedAmenityToAdd]: 1 };
      setValue('amenities', updatedAmenities);
      setSelectedAmenityToAdd('');
    }
  };

  const getAvailableAmenitiesForDropdown = () => {
    return availableAmenities.filter(amenity => !amenitiesValue[amenity]);
  };

  const EditableSection = ({ title, isEditing, onEdit, onSave, onCancel, children, error }) => (
    <Card 
      sx={{ 
        mb: 3, 
        backgroundColor: theme.cardBackground,
        border: `2px solid ${isEditing ? theme.primary : theme.border}`,
        borderStyle: isEditing ? 'dashed' : 'solid',
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: isEditing ? theme.secondary : theme.primary,
          boxShadow: theme.shadows.medium,
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ color: theme.textPrimary, fontWeight: 600 }}>
            {title}
            {isEditing && (
              <Chip 
                label="EDITING" 
                size="small" 
                sx={{ 
                  ml: 2, 
                  backgroundColor: theme.warning,
                  color: '#FFFFFF',
                  fontWeight: 600
                }} 
              />
            )}
          </Typography>
          <Box>
            {isEditing ? (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton onClick={onSave} color="primary" size="small">
                  <SaveIcon />
                </IconButton>
                <IconButton onClick={onCancel} color="secondary" size="small">
                  <CancelIcon />
                </IconButton>
              </Box>
            ) : (
              <IconButton onClick={onEdit} color="primary" size="small">
                <EditIcon />
              </IconButton>
            )}
          </Box>
        </Box>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {children}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6">Loading property details...</Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: theme.background, minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton 
            onClick={handleBackToMyProperties}
            sx={{ mr: 2, color: theme.primary }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" sx={{ color: theme.textPrimary, fontWeight: 700 }}>
            Update Property Details
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 4 }}>
          Click the edit icon on any section to modify that information. You can edit one section at a time.
        </Alert>

        <form onSubmit={handleSubmit(onSubmit)}>
          <EditableSection
            title="Basic Information"
            isEditing={editingSection === 'basic'}
            onEdit={() => setEditingSection('basic')}
            onSave={() => setEditingSection('')}
            onCancel={handleCancelEdit}
            error={errors.propertyType?.message || errors.unitType?.message}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={<RequiredFieldLabel required>Property Type</RequiredFieldLabel>}
                  variant="outlined"
                  disabled={editingSection !== 'basic'}
                  {...register('propertyType')}
                  error={!!errors.propertyType}
                  helperText={errors.propertyType?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={editingSection !== 'basic'}>
                  <InputLabel>Unit Type</InputLabel>
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
            </Grid>
          </EditableSection>

          <EditableSection
            title="Location & Description"
            isEditing={editingSection === 'location'}
            onEdit={() => setEditingSection('location')}
            onSave={() => setEditingSection('')}
            onCancel={handleCancelEdit}
            error={errors.address?.message || errors.description?.message}
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={<RequiredFieldLabel required>Address</RequiredFieldLabel>}
                  variant="outlined"
                  disabled={editingSection !== 'location'}
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
                  disabled={editingSection !== 'location'}
                  {...register('description')}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              </Grid>
            </Grid>
          </EditableSection>

          <EditableSection
            title="Property Amenities"
            isEditing={editingSection === 'amenities'}
            onEdit={() => setEditingSection('amenities')}
            onSave={() => setEditingSection('')}
            onCancel={handleCancelEdit}
            error={errors.amenities?.message}
          >
            {Object.keys(amenitiesValue)?.length > 0 && (
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {Object.entries(amenitiesValue).map(([amenity, quantity]) => (
                  <Grid item xs={12} sm={6} md={4} key={amenity}>
                    <AmenityQuantitySelector
                      amenity={amenity}
                      quantity={quantity}
                      onQuantityChange={(newQuantity) => updateAmenityQuantity(amenity, newQuantity)}
                      onRemove={() => removeAmenity(amenity)}
                      disabled={editingSection !== 'amenities'}
                    />
                  </Grid>
                ))}
              </Grid>
            )}

            {editingSection === 'amenities' && (
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
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
                >
                  Add
                </Button>
              </Box>
            )}

            {Object.keys(amenitiesValue)?.length > 0 && (
              <Typography variant="body2" sx={{ color: theme.primary, mt: 2 }}>
                {Object.keys(amenitiesValue)?.length} amenities configured
              </Typography>
            )}
          </EditableSection>

          <EditableSection
            title="Basic Facilities"
            isEditing={editingSection === 'facilities'}
            onEdit={() => setEditingSection('facilities')}
            onSave={() => setEditingSection('')}
            onCancel={handleCancelEdit}
          >
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
                    disabled={editingSection !== 'facilities'}
                  />
                </Grid>
              ))}
            </Grid>
          </EditableSection>

          <EditableSection
            title="Pricing & Availability"
            isEditing={editingSection === 'pricing'}
            onEdit={() => setEditingSection('pricing')}
            onSave={() => setEditingSection('')}
            onCancel={handleCancelEdit}
            error={errors.price?.message || errors.availableFrom?.message || errors.availableTo?.message}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label={<RequiredFieldLabel required>Monthly Rent (LKR)</RequiredFieldLabel>}
                  variant="outlined"
                  type="number"
                  disabled={editingSection !== 'pricing'}
                  {...register('price')}
                  error={!!errors.price}
                  helperText={errors.price?.message}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Controller
                    name="availableFrom"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        label={<RequiredFieldLabel required>Available From</RequiredFieldLabel>}
                        value={field.value}
                        onChange={field.onChange}
                        disabled={editingSection !== 'pricing'}
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
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={4}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Controller
                    name="availableTo"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        label="Available Until (Optional)"
                        value={field.value}
                        onChange={field.onChange}
                        disabled={editingSection !== 'pricing'}
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
                </LocalizationProvider>
              </Grid>
            </Grid>
          </EditableSection>

          <EditableSection
            title="Roommate Information (Optional)"
            isEditing={editingSection === 'roommates'}
            onEdit={() => setEditingSection('roommates')}
            onSave={() => setEditingSection('')}
            onCancel={handleCancelEdit}
          >
            {roommateFields.map((item, index) => (
              <Accordion key={item.id} sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">
                    Roommate {index + 1}
                    {editingSection === 'roommates' && (
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
                        disabled={editingSection !== 'roommates'}
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
                        disabled={editingSection !== 'roommates'}
                        {...register(`roommates.${index}.field`)}
                        error={!!errors.roommates?.[index]?.field}
                        helperText={errors.roommates?.[index]?.field?.message}
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
            {editingSection === 'roommates' && (
              <Button 
                onClick={() => appendRoommate({ occupation: '', field: '' })} 
                startIcon={<AddIcon />}
                variant="outlined"
                sx={{ mt: 2 }}
              >
                Add Roommate
              </Button>
            )}
          </EditableSection>

          <EditableSection
            title="House Rules (Optional)"
            isEditing={editingSection === 'rules'}
            onEdit={() => setEditingSection('rules')}
            onSave={() => setEditingSection('')}
            onCancel={handleCancelEdit}
          >
            {ruleFields.map((item, index) => (
              <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                <TextField
                  fullWidth
                  label={`Rule ${index + 1}`}
                  variant="outlined"
                  placeholder="e.g., No smoking, No pets, Quiet hours after 10 PM..."
                  disabled={editingSection !== 'rules'}
                  {...register(`rules.${index}`)}
                  error={!!errors.rules?.[index]}
                  helperText={errors.rules?.[index]?.message}
                />
                {editingSection === 'rules' && (
                  <IconButton 
                    onClick={() => removeRule(index)}
                    color="error"
                  >
                    <RemoveIcon />
                  </IconButton>
                )}
              </Box>
            ))}
            {editingSection === 'rules' && (
              <Button 
                onClick={() => appendRule('')} 
                startIcon={<AddIcon />}
                variant="outlined"
              >
                Add Rule
              </Button>
            )}
          </EditableSection>

          <EditableSection
            title="Contract & Cancellation Policy"
            isEditing={editingSection === 'contract'}
            onEdit={() => setEditingSection('contract')}
            onSave={() => setEditingSection('')}
            onCancel={handleCancelEdit}
            error={errors.contractPolicy?.message}
          >
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder="Include lease duration, deposit amount, notice period for cancellation..."
              disabled={editingSection !== 'contract'}
              {...register('contractPolicy')}
              error={!!errors.contractPolicy}
              helperText={errors.contractPolicy?.message}
            />
          </EditableSection>

          <EditableSection
            title="Bills Included (Optional)"
            isEditing={editingSection === 'bills'}
            onEdit={() => setEditingSection('bills')}
            onSave={() => setEditingSection('')}
            onCancel={handleCancelEdit}
          >
            {billFields.map((item, index) => (
              <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                <TextField
                  fullWidth
                  label={`Bill ${index + 1}`}
                  variant="outlined"
                  placeholder="e.g., Electricity, Water, Internet..."
                  disabled={editingSection !== 'bills'}
                  {...register(`billsInclusive.${index}`)}
                  error={!!errors.billsInclusive?.[index]}
                  helperText={errors.billsInclusive?.[index]?.message}
                />
                {editingSection === 'bills' && (
                  <IconButton 
                    onClick={() => removeBill(index)}
                    color="error"
                  >
                    <RemoveIcon />
                  </IconButton>
                )}
              </Box>
            ))}
            {editingSection === 'bills' && (
              <Button 
                onClick={() => appendBill('')} 
                startIcon={<AddIcon />}
                variant="outlined"
              >
                Add Bills Included
              </Button>
            )}
          </EditableSection>

          <EditableSection
            title="Property Images"
            isEditing={editingSection === 'images'}
            onEdit={() => setEditingSection('images')}
            onSave={() => setEditingSection('')}
            onCancel={handleCancelEdit}
          >
            <ImageUpload 
              onUpload={handleImageUpload}
              maxFiles={10}
              disabled={editingSection !== 'images'}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Upload high-quality images of your property to attract more tenants.
            </Typography>
          </EditableSection>

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
              Update Property
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

export default UpdateProperty;