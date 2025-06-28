import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ImageIcon from '@mui/icons-material/Image';
import HotelIcon from '@mui/icons-material/Hotel';
import BathtubIcon from '@mui/icons-material/Bathtub';
import PeopleIcon from '@mui/icons-material/People';
import ImageUpload from '../components/common/ImageUpload';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useParams, useNavigate } from 'react-router-dom';
import { getPropertyDetailsById, updateProperty } from '../api/propertyApi';
import AppSnackbar from '../components/common/AppSnackbar';
import { useTheme } from '../contexts/ThemeContext';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Updated validation schema - house rules are now optional
const schema = yup.object().shape({
  propertyType: yup.string().required('Property type is required'),
  unitType: yup.string().required('Unit type is required'),
  
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
  
  roommates: yup.array().of(
    yup.object().shape({
      occupation: yup.string().required('Occupation is required'),
      field: yup.string().required('Field is required')
    })
  ),
  
  // Rules are now optional
  rules: yup.array().of(yup.string().trim()).notRequired(),
  
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
  
  billsInclusive: yup.array().of(yup.string().trim()).notRequired()
});

const UpdateProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [editingSection, setEditingSection] = useState('');
  const { theme, isDark } = useTheme();

  // Available amenities and options
  const [availableAmenities] = useState([
    'Television (TV)', 'Air Conditioning (AC)', 'Refrigerator', 'Wi-Fi Internet', 
    'Washing Machine', 'Microwave', 'Parking Space', 'Balcony', 'Garden Access',
    'Swimming Pool Access', 'Gym Access', 'Security System', 'Furnished', 'Kitchen'
  ]);
  
  const [selectedAmenityToAdd, setSelectedAmenityToAdd] = useState('');

  const unitOptions = [
    { label: 'Rental unit', description: 'A rented place within a multi-unit residential building or complex.' },
    { label: 'Shared unit', description: 'A rented place shared with other tenants.' },
    { label: 'Entire unit', description: 'An entire place rented by a single tenant.' }
  ];

  const occupationOptions = ['Student', 'Professional', 'Other'];
  const fieldOptions = ['Engineering', 'Arts', 'Science', 'Business', 'Other'];

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    getValues,
    formState: { errors }
  } = useForm({
    defaultValues: {
      propertyType: '',
      unitType: '',
      amenities: {},
      facilities: { Bathroom: 0, Bedroom: 0 },
      otherFacility: '',
      address: '',
      roommates: [],
      rules: [],
      contractPolicy: '',
      availableFrom: null,
      availableTo: null,
      price: '',
      billsInclusive: []
    },
    resolver: yupResolver(schema)
  });

  // Field arrays
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

  const getAvailableAmenitiesForDropdown = () => {
    return availableAmenities.filter(amenity => !amenitiesValue[amenity]);
  };

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

  // Fetch property details and populate form
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const token = localStorage.getItem('token');
        const property = await getPropertyDetailsById(id, token);
        
        if (property) {
          reset({
            propertyType: property.property_type || '',
            unitType: property.unit_type || '',
            amenities: property.amenities ? JSON.parse(property.amenities) : {},
            facilities: property.facilities ? JSON.parse(property.facilities) : { Bathroom: 0, Bedroom: 0 },
            otherFacility: property.other_facility || '',
            address: property.address || '',
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

  // Edit Section Component
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
              <>
                <IconButton 
                  onClick={onSave} 
                  sx={{ color: theme.success, mr: 1 }}
                  title="Save changes"
                >
                  <SaveIcon />
                </IconButton>
                <IconButton 
                  onClick={onCancel} 
                  sx={{ color: theme.error }}
                  title="Cancel editing"
                >
                  <CancelIcon />
                </IconButton>
              </>
            ) : (
              <IconButton 
                onClick={onEdit} 
                sx={{ color: theme.primary }}
                title="Edit this section"
              >
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

  // Facility Counter Component
  const FacilityCounter = ({ facility, count, onIncrement, onDecrement, error, disabled = false }) => (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          border: `1px solid ${error ? theme.error : theme.border}`,
          borderRadius: 2,
          backgroundColor: disabled ? theme.surfaceBackground : theme.inputBackground,
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <Typography variant="subtitle1" sx={{ color: theme.textPrimary }}>
          {facility}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            onClick={onDecrement} 
            size="small" 
            disabled={disabled}
            sx={{ color: theme.primary }}
          >
            <RemoveIcon />
          </IconButton>
          <Typography variant="h6" sx={{ mx: 2, color: theme.textPrimary }}>
            {count}
          </Typography>
          <IconButton 
            onClick={onIncrement} 
            size="small" 
            disabled={disabled}
            sx={{ color: theme.primary }}
          >
            <AddIcon />
          </IconButton>
        </Box>
      </Box>
      {error && (
        <Typography variant="caption" sx={{ color: theme.error, mt: 1 }}>
          {error}
        </Typography>
      )}
    </Box>
  );

  // Amenity Quantity Selector Component
  const AmenityQuantitySelector = ({ amenity, quantity, onQuantityChange, onRemove, disabled = false }) => (
    <Box 
      sx={{ 
        p: 2, 
        border: `1px solid ${theme.border}`, 
        borderRadius: 2, 
        backgroundColor: disabled ? theme.surfaceBackground : theme.cardBackground,
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.2s ease',
        '&:hover': !disabled && {
          borderColor: theme.primary,
          boxShadow: theme.shadows.light
        }
      }}
    >
      <Typography variant="body1" sx={{ mb: 1, fontWeight: 500, color: theme.textPrimary }}>
        {amenity}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            size="small" 
            onClick={() => onQuantityChange(Math.max(0, quantity - 1))}
            disabled={quantity <= 0 || disabled}
            sx={{ mr: 1, color: theme.primary }}
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
              border: `1px solid ${theme.border}`,
              borderRadius: 1,
              backgroundColor: theme.inputBackground,
              color: theme.textPrimary
            }}
          >
            {quantity}
          </Typography>
          <IconButton 
            size="small" 
            onClick={() => onQuantityChange(quantity + 1)}
            disabled={disabled}
            sx={{ ml: 1, color: theme.primary }}
          >
            <AddIcon />
          </IconButton>
        </Box>
        <IconButton 
          size="small" 
          color="error"
          onClick={onRemove}
          disabled={disabled}
          sx={{ 
            '&:hover': { 
              backgroundColor: `${theme.error}10`,
            }
          }}
        >
          <RemoveIcon />
        </IconButton>
      </Box>
    </Box>
  );

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ color: theme.textPrimary }}>
          Loading Property Details...
        </Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      background: isDark 
        ? `linear-gradient(135deg, ${theme.background} 0%, ${theme.surfaceBackground} 50%, ${theme.background} 100%)`
        : `linear-gradient(135deg, ${theme.background} 0%, ${theme.primary}05 50%, ${theme.background} 100%)`,
      minHeight: '100vh',
      py: 4
    }}>
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" sx={{ color: theme.textPrimary, fontWeight: 600, mb: 2 }}>
            Edit Property Details
          </Typography>
          <Typography variant="h5" sx={{ color: theme.textSecondary, mb: 3 }}>
            {watch('propertyType')} - {watch('unitType')}
          </Typography>
          
          <Alert severity="info" sx={{ maxWidth: 600, mx: 'auto' }}>
            <Typography variant="body2">
              Click the edit icon on any section to modify that information. 
              Changes are saved automatically when you submit the form.
            </Typography>
          </Alert>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Basic Information Section */}
          <EditableSection
            title="Basic Information"
            isEditing={editingSection === 'basic'}
            onEdit={() => setEditingSection('basic')}
            onSave={() => setEditingSection('')}
            onCancel={() => setEditingSection('')}
            error={errors.propertyType?.message || errors.unitType?.message}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Property Type"
                  fullWidth
                  value={watch('propertyType')}
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

          {/* Amenities Section */}
          <EditableSection
            title="Property Amenities"
            isEditing={editingSection === 'amenities'}
            onEdit={() => setEditingSection('amenities')}
            onSave={() => setEditingSection('')}
            onCancel={() => setEditingSection('')}
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

          {/* Facilities Section */}
          <EditableSection
            title="Basic Facilities"
            isEditing={editingSection === 'facilities'}
            onEdit={() => setEditingSection('facilities')}
            onSave={() => setEditingSection('')}
            onCancel={() => setEditingSection('')}
            error={errors.facilities?.Bedroom?.message || errors.facilities?.Bathroom?.message}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FacilityCounter
                  facility="Bedrooms"
                  count={facilitiesValue.Bedroom || 0}
                  onIncrement={() => incrementFacility('Bedroom')}
                  onDecrement={() => decrementFacility('Bedroom')}
                  error={errors.facilities?.Bedroom?.message}
                  disabled={editingSection !== 'facilities'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FacilityCounter
                  facility="Bathrooms"
                  count={facilitiesValue.Bathroom || 0}
                  onIncrement={() => incrementFacility('Bathroom')}
                  onDecrement={() => decrementFacility('Bathroom')}
                  error={errors.facilities?.Bathroom?.message}
                  disabled={editingSection !== 'facilities'}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Other Facilities (Optional)"
                  variant="outlined"
                  placeholder="Describe any additional facilities..."
                  disabled={editingSection !== 'facilities'}
                  {...register('otherFacility')}
                  error={!!errors.otherFacility}
                  helperText={errors.otherFacility?.message}
                />
              </Grid>
            </Grid>

            {/* Display facility summary */}
            <Box sx={{ 
              mt: 3, 
              p: 2, 
              backgroundColor: theme.surfaceBackground, 
              borderRadius: 2,
              display: 'flex',
              justifyContent: 'center',
              gap: 4
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HotelIcon sx={{ color: theme.primary }} />
                <Typography variant="body1" sx={{ color: theme.textPrimary }}>
                  {facilitiesValue.Bedroom || 0} Bedrooms
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BathtubIcon sx={{ color: theme.primary }} />
                <Typography variant="body1" sx={{ color: theme.textPrimary }}>
                  {facilitiesValue.Bathroom || 0} Bathrooms
                </Typography>
              </Box>
            </Box>
          </EditableSection>

          {/* Images Section */}
          <EditableSection
            title="Property Images"
            isEditing={editingSection === 'images'}
            onEdit={() => setEditingSection('images')}
            onSave={() => setEditingSection('')}
            onCancel={() => setEditingSection('')}
          >
            {editingSection === 'images' ? (
              <ImageUpload onUpload={handleImageUpload} />
            ) : (
              <Box sx={{ 
                p: 4, 
                textAlign: 'center', 
                backgroundColor: theme.surfaceBackground,
                borderRadius: 2,
                border: `1px solid ${theme.border}`
              }}>
                <ImageIcon sx={{ fontSize: 48, color: theme.textSecondary, mb: 2 }} />
                <Typography variant="body1" sx={{ color: theme.textSecondary }}>
                  Click edit to manage property images
                </Typography>
              </Box>
            )}
          </EditableSection>

          {/* Address Section */}
          <EditableSection
            title="Property Address"
            isEditing={editingSection === 'address'}
            onEdit={() => setEditingSection('address')}
            onSave={() => setEditingSection('')}
            onCancel={() => setEditingSection('')}
            error={errors.address?.message}
          >
            <TextField
              fullWidth
              label="Complete Address"
              variant="outlined"
              placeholder="Include street address, city, and postal code"
              multiline
              rows={3}
              disabled={editingSection !== 'address'}
              {...register('address')}
              error={!!errors.address}
              helperText={errors.address?.message}
            />
          </EditableSection>

          {/* Roommates Section */}
          <EditableSection
            title="Current Roommates (Optional)"
            isEditing={editingSection === 'roommates'}
            onEdit={() => setEditingSection('roommates')}
            onSave={() => setEditingSection('')}
            onCancel={() => setEditingSection('')}
          >
            {roommateFields.map((item, index) => (
              <Accordion key={item.id} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Roommate {index + 1}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth disabled={editingSection !== 'roommates'}>
                        <InputLabel>Occupation</InputLabel>
                        <Select
                          value={watch(`roommates.${index}.occupation`) || ''}
                          {...register(`roommates.${index}.occupation`)}
                        >
                          {occupationOptions.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth disabled={editingSection !== 'roommates'}>
                        <InputLabel>Field</InputLabel>
                        <Select
                          value={watch(`roommates.${index}.field`) || ''}
                          {...register(`roommates.${index}.field`)}
                        >
                          {fieldOptions.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
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
                sx={{ mt: 2 }}
              >
                Add Roommate
              </Button>
            )}
          </EditableSection>

          {/* House Rules Section - Now Optional */}
          <EditableSection
            title="House Rules (Optional)"
            isEditing={editingSection === 'rules'}
            onEdit={() => setEditingSection('rules')}
            onSave={() => setEditingSection('')}
            onCancel={() => setEditingSection('')}
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

          {/* Contract Policy Section */}
          <EditableSection
            title="Contract & Cancellation Policy"
            isEditing={editingSection === 'contract'}
            onEdit={() => setEditingSection('contract')}
            onSave={() => setEditingSection('')}
            onCancel={() => setEditingSection('')}
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

          {/* Availability & Pricing Section */}
          <EditableSection
            title="Availability & Pricing"
            isEditing={editingSection === 'pricing'}
            onEdit={() => setEditingSection('pricing')}
            onSave={() => setEditingSection('')}
            onCancel={() => setEditingSection('')}
            error={errors.availableFrom?.message || errors.availableTo?.message || errors.price?.message}
          >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="availableFrom"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        label="Available From"
                        value={field.value}
                        onChange={(newValue) => field.onChange(newValue)}
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
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="availableTo"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        label="Available Until"
                        value={field.value}
                        onChange={(newValue) => field.onChange(newValue)}
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
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Monthly Rent (LKR)"
                    type="number"
                    variant="outlined"
                    fullWidth
                    placeholder="e.g., 25000"
                    disabled={editingSection !== 'pricing'}
                    {...register('price')}
                    error={!!errors.price}
                    helperText={errors.price?.message || "Enter amount in Sri Lankan Rupees"}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1, color: theme.textSecondary }}>LKR</Typography>
                    }}
                  />
                </Grid>
              </Grid>
            </LocalizationProvider>
          </EditableSection>

          {/* Bills Inclusive Section */}
          <EditableSection
            title="Bills Included in Rent (Optional)"
            isEditing={editingSection === 'bills'}
            onEdit={() => setEditingSection('bills')}
            onSave={() => setEditingSection('')}
            onCancel={() => setEditingSection('')}
          >
            {billsFields.map((item, index) => (
              <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                <TextField
                  fullWidth
                  label={`Bill ${index + 1}`}
                  variant="outlined"
                  placeholder="e.g., Electricity, Water, Internet, Gas..."
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

          {/* Action Buttons */}
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
              onClick={() => navigate('/myproperties')}
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
              Cancel Changes
            </Button>
            <Button 
              variant="contained" 
              size="large" 
              type="submit"
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