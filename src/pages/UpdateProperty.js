import React, { useState, useEffect, useContext } from 'react';
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

const propertyTypes = ['ROOMS', 'FLATS', 'HOTELS', 'VILLAS'];

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
  'Swimming Pool', 'Recreation Room', 'Bed Linens', 'Hot Water', 'Air Conditioning', 'Kitchen',
  'Washing Machine', 'WiFi', 'TV', 'Parking', 'Security', 'Garden'
];

const schema = yup.object().shape({
  propertyType: yup.string().required('Property type is required'),
  unitType: yup.string().required('Unit type is required'),
  address: yup.string().required('Address is required'),
  description: yup.string().required('Description is required'),
  price: yup.number().positive('Price must be positive').required('Price is required'),
  contractPolicy: yup.string().required('Contract policy is required'),
});

const RequiredFieldLabel = ({ children, required = false }) => (
  <Box component="span">
    {children}
    {required && <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>*</Box>}
  </Box>
);

const EditableSection = ({ title, isEditing, onEdit, onSave, onCancel, children, error }) => (
  <Card sx={{ mb: 4, borderRadius: 3 }}>
    <CardContent sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        {!isEditing ? (
          <IconButton onClick={onEdit} color="primary">
            <EditIcon />
          </IconButton>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={onSave} color="primary">
              <SaveIcon />
            </IconButton>
            <IconButton onClick={onCancel} color="secondary">
              <CancelIcon />
            </IconButton>
          </Box>
        )}
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

const AmenityQuantitySelector = ({ amenity, quantity, onQuantityChange, onRemove, disabled }) => (
  <Box sx={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    p: 2,
    border: '1px solid #ccc',
    borderRadius: 2,
    backgroundColor: disabled ? '#f5f5f5' : 'transparent'
  }}>
    <Typography variant="body1" sx={{ fontWeight: 500 }}>
      {amenity}
    </Typography>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <IconButton 
        size="small" 
        onClick={() => onQuantityChange(Math.max(0, quantity - 1))}
        disabled={disabled || quantity <= 0}
      >
        <RemoveIcon />
      </IconButton>
      <Typography variant="body1" sx={{ minWidth: '20px', textAlign: 'center' }}>
        {quantity}
      </Typography>
      <IconButton 
        size="small" 
        onClick={() => onQuantityChange(quantity + 1)}
        disabled={disabled}
      >
        <AddIcon />
      </IconButton>
      {!disabled && (
        <Button size="small" color="error" onClick={onRemove}>
          Remove
        </Button>
      )}
    </Box>
  </Box>
);

const UpdateProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme, isDark } = useContext(ThemeContext);
  
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [selectedAmenityToAdd, setSelectedAmenityToAdd] = useState('');
  const [selectedFacilityToAdd, setSelectedFacilityToAdd] = useState('');

  const { register, handleSubmit, control, watch, setValue, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      propertyType: '',
      unitType: '',
      address: '',
      description: '',
      price: '',
      amenities: {},
      facilities: {},
      contractPolicy: '',
      availableFrom: null,
      availableTo: null,
      roommates: [],
      rules: [],
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

  // Load property data when component mounts
  useEffect(() => {
    const loadPropertyData = async () => {
      try {
        setLoading(true);
        const propertyData = await getPropertyDetailsById(id);
        
        if (propertyData) {
          // Parse JSON fields safely
          const amenities = typeof propertyData.amenities === 'string' ? 
            JSON.parse(propertyData.amenities || '{}') : propertyData.amenities || {};
          
          const facilities = typeof propertyData.facilities === 'string' ? 
            JSON.parse(propertyData.facilities || '{}') : propertyData.facilities || {};
          
          const rules = typeof propertyData.rules === 'string' ? 
            JSON.parse(propertyData.rules || '[]') : propertyData.rules || [];
          
          const roommates = typeof propertyData.roommates === 'string' ? 
            JSON.parse(propertyData.roommates || '[]') : propertyData.roommates || [];
          
          const billsInclusive = typeof propertyData.bills_inclusive === 'string' ? 
            JSON.parse(propertyData.bills_inclusive || '[]') : propertyData.bills_inclusive || [];

          // Populate form with existing data
          reset({
            propertyType: propertyData.property_type || '',
            unitType: propertyData.unit_type || '',
            address: propertyData.address || '',
            description: propertyData.description || '',
            price: propertyData.price || '',
            amenities: amenities,
            facilities: facilities,
            contractPolicy: propertyData.contract_policy || '',
            availableFrom: propertyData.available_from ? dayjs(propertyData.available_from) : null,
            availableTo: propertyData.available_to ? dayjs(propertyData.available_to) : null,
            roommates: roommates,
            rules: rules,
            billsInclusive: billsInclusive
          });
        }
      } catch (error) {
        console.error('Error loading property data:', error);
        setSnackbarMessage('Error loading property details');
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadPropertyData();
    }
  }, [id, reset]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Prepare data for API submission
      const updateData = {
        property_type: data.propertyType,
        unit_type: data.unitType,
        address: data.address,
        description: data.description,
        price: parseFloat(data.price),
        amenities: data.amenities,
        facilities: data.facilities,
        contract_policy: data.contractPolicy,
        available_from: data.availableFrom ? dayjs(data.availableFrom).format('YYYY-MM-DD') : null,
        available_to: data.availableTo ? dayjs(data.availableTo).format('YYYY-MM-DD') : null,
        rules: data.rules.filter(rule => rule && rule.trim().length > 0),
        roommates: data.roommates.filter(roommate => 
          roommate && (roommate.occupation || roommate.field)
        ),
        bills_inclusive: data.billsInclusive.filter(bill => bill && bill.trim().length > 0)
      };

      await updateProperty(id, updateData);
      setSnackbarMessage('Property updated successfully!');
      setSnackbarOpen(true);
      
      setTimeout(() => {
        navigate('/myproperties');
      }, 2000);
      
    } catch (error) {
      console.error('Error updating property:', error);
      setSnackbarMessage('Error updating property. Please try again.');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingSection('');
  };

  const handleBackToMyProperties = () => {
    navigate('/myproperties');
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleImageUpload = (uploadedFiles) => {
    setValue('images', uploadedFiles);
  };

  const updateFacilityCount = (facility, increment) => {
    const currentValue = facilitiesValue[facility] || 0;
    const newValue = increment ? currentValue + 1 : Math.max(0, currentValue - 1);
    setValue(`facilities.${facility}`, newValue);
  };

  const updateAmenityQuantity = (amenity, newQuantity) => {
    setValue(`amenities.${amenity}`, newQuantity);
  };

  const removeAmenity = (amenity) => {
    const newAmenities = { ...amenitiesValue };
    delete newAmenities[amenity];
    setValue('amenities', newAmenities);
  };

  const addAmenity = () => {
    if (selectedAmenityToAdd) {
      setValue(`amenities.${selectedAmenityToAdd}`, 1);
      setSelectedAmenityToAdd('');
    }
  };

  const addFacility = () => {
    if (selectedFacilityToAdd) {
      setValue(`facilities.${selectedFacilityToAdd}`, 1);
      setSelectedFacilityToAdd('');
    }
  };

  const getAvailableAmenitiesForDropdown = () => {
    return availableAmenities.filter(amenity => !amenitiesValue[amenity]);
  };

  const getAvailableFacilitiesForDropdown = () => {
    return availableFacilities.filter(facility => !facilitiesValue[facility]);
  };

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
                <FormControl fullWidth disabled={editingSection !== 'basic'}>
                  <InputLabel>Property Type</InputLabel>
                  <Select
                    value={watch('propertyType')}
                    onChange={(e) => setValue('propertyType', e.target.value)}
                    error={!!errors.propertyType}
                  >
                    {propertyTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={<RequiredFieldLabel required>Monthly Rent (LKR)</RequiredFieldLabel>}
                  type="number"
                  variant="outlined"
                  disabled={editingSection !== 'basic'}
                  {...register('price')}
                  error={!!errors.price}
                  helperText={errors.price?.message}
                />
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
          </EditableSection>

          <EditableSection
            title="Property Facilities"
            isEditing={editingSection === 'facilities'}
            onEdit={() => setEditingSection('facilities')}
            onSave={() => setEditingSection('')}
            onCancel={handleCancelEdit}
          >
            <Grid container spacing={3}>
              {['Bedrooms', 'Bathrooms', 'Kitchen', 'Balcony', 'Living Area', 'Other'].map((facility) => (
                <Grid item xs={12} sm={6} md={4} key={facility}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    p={2}
                    border="1px solid #ccc"
                    borderRadius={2}
                    sx={{ backgroundColor: editingSection !== 'facilities' ? '#f5f5f5' : 'transparent' }}
                  >
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {facility}
                      {(facility === 'Bedrooms' || facility === 'Bathrooms') && 
                        <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>*</Box>
                      }
                    </Typography>
                    <Box display="flex" alignItems="center">
                      <IconButton 
                        onClick={() => updateFacilityCount(facility, false)} 
                        disabled={editingSection !== 'facilities' || (facilitiesValue[facility] || 0) <= 0}
                      >
                        <RemoveIcon />
                      </IconButton>
                      <Typography variant="h6" sx={{ mx: 2, minWidth: '20px', textAlign: 'center' }}>
                        {facilitiesValue[facility] || 0}
                      </Typography>
                      <IconButton 
                        onClick={() => updateFacilityCount(facility, true)}
                        disabled={editingSection !== 'facilities'}
                      >
                        <AddIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
            
            {editingSection === 'facilities' && (
              <Box sx={{ mt: 3 }}>
                <Alert severity="info">
                  Bedrooms and Bathrooms are required. Set Bedrooms to 0 for studio apartments.
                </Alert>
              </Box>
            )}
          </EditableSection>

          <EditableSection
            title="Availability"
            isEditing={editingSection === 'availability'}
            onEdit={() => setEditingSection('availability')}
            onSave={() => setEditingSection('')}
            onCancel={handleCancelEdit}
            error={errors.availableFrom?.message || errors.availableTo?.message}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Controller
                    name="availableFrom"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        label="Available From"
                        value={field.value}
                        onChange={field.onChange}
                        disabled={editingSection !== 'availability'}
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
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Controller
                    name="availableTo"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        label="Available Until"
                        value={field.value}
                        onChange={field.onChange}
                        disabled={editingSection !== 'availability'}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            error={!!errors.availableTo}
                            helperText={errors.availableTo?.message || "Leave empty for no end date"}
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
            title="Contract Policy"
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
              label={<RequiredFieldLabel required>Contract Policy</RequiredFieldLabel>}
              variant="outlined"
              placeholder="Enter contract terms, payment policy, lease duration, etc."
              disabled={editingSection !== 'contract'}
              {...register('contractPolicy')}
              error={!!errors.contractPolicy}
              helperText={errors.contractPolicy?.message}
            />
          </EditableSection>

          <EditableSection
            title="Roommate Details (Optional)"
            isEditing={editingSection === 'roommates'}
            onEdit={() => setEditingSection('roommates')}
            onSave={() => setEditingSection('')}
            onCancel={handleCancelEdit}
          >
            {roommateFields.map((item, index) => (
              <Accordion key={item.id} sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Roommate {index + 1}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
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
                    {editingSection === 'roommates' && (
                      <Grid item xs={12}>
                        <Button 
                          onClick={() => removeRoommate(index)} 
                          color="error"
                          startIcon={<RemoveIcon />}
                        >
                          Remove Roommate
                        </Button>
                      </Grid>
                    )}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
            {editingSection === 'roommates' && (
              <Button 
                onClick={() => appendRoommate({ occupation: '', field: '' })} 
                startIcon={<AddIcon />}
                variant="outlined"
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
              <Box key={item.id} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                <TextField
                  fullWidth
                  label={`Rule ${index + 1}`}
                  variant="outlined"
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
                Add House Rule
              </Button>
            )}
          </EditableSection>

          <EditableSection
            title="Bills Included (Optional)"
            isEditing={editingSection === 'bills'}
            onEdit={() => setEditingSection('bills')}
            onSave={() => setEditingSection('')}
            onCancel={handleCancelEdit}
          >
            {billFields.map((item, index) => (
              <Box key={item.id} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                <TextField
                  fullWidth
                  label={`Bill ${index + 1}`}
                  variant="outlined"
                  placeholder="e.g., Water, Electricity, Internet"
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