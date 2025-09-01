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
  Alert,
  ImageList,
  ImageListItem,
  CircularProgress
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
import { getPropertyById, updateProperty } from '../api/propertyApi';
import { ThemeContext } from '../contexts/ThemeContext';
import ImageUpload from '../components/common/ImageUpload';
import AppSnackbar from '../components/common/AppSnackbar';
import MapSearch from '../components/specific/MapSearch';

const propertyTypes = ['ROOMS', 'FLATS', 'HOTELS', 'VILLAS', 'Hostels', 'Apartments', 'Rooms', 'Flats', 'Villas'];

const unitOptions = [
  { label: 'Annex', value: 'Annex' },
  { label: 'Full House', value: 'Full House' },
  { label: 'Single Room', value: 'Single Room' },
  { label: 'Shared Room', value: 'Shared Room' },
  { label: 'Studio Apartment', value: 'Studio Apartment' },
  { label: 'One Bedroom', value: 'One Bedroom' },
  { label: 'Two Bedroom', value: 'Two Bedroom' },
  { label: 'Three Bedroom', value: 'Three Bedroom' },
  { label: 'Rental unit', value: 'Rental unit' },
];

const availableAmenities = [
  'WiFi', 'TV', 'Air Conditioning', 'Kitchen', 'Washing Machine', 'Parking',
  'Swimming Pool', 'Gym', 'Security', 'Garden', 'Balcony', 'Furnished', 'Recreation Room'
];

const availableFacilities = ['Bedrooms', 'Bathrooms', 'Kitchen', 'Balcony', 'Living Area'];

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

const EditableSection = ({ title, isEditing, onEdit, onSave, onCancel, children, error }) => {
  const { theme } = useContext(ThemeContext);
  
  return (
    <Card sx={{ 
      mb: 4, 
      borderRadius: 3,
      backgroundColor: theme.cardBackground,
      border: `1px solid ${theme.border}`
    }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 600,
            color: theme.textPrimary
          }}>
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
};

// Azurite Image Component with proper handling
const AzuriteImage = ({ src, alt, style }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (src) {
      setLoading(true);
      setError(false);
      
      // Create image to test loading
      const img = new Image();
      img.onload = () => {
        setLoading(false);
        setError(false);
      };
      img.onerror = () => {
        setLoading(false);
        setError(true);
      };
      // Add timestamp to bypass cache if needed
      img.src = src.includes('?') ? src : `${src}?t=${Date.now()}`;
    }
  }, [src]);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: 200,
        backgroundColor: '#f5f5f5',
        ...style 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: 200,
        backgroundColor: '#f5f5f5',
        border: '1px dashed #ccc',
        ...style 
      }}>
        <Typography variant="body2" color="textSecondary">
          Image failed to load
        </Typography>
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
          {src}
        </Typography>
      </Box>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      style={{ 
        width: '100%', 
        height: 200, 
        objectFit: 'cover',
        ...style 
      }}
      onError={() => setError(true)}
    />
  );
};

const AmenityQuantitySelector = ({ amenity, quantity, onQuantityChange, onRemove, disabled }) => {
  const { theme } = useContext(ThemeContext);
  
  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      p: 2,
      border: `1px solid ${theme.border}`,
      borderRadius: 2,
      backgroundColor: disabled ? theme.surfaceBackground : 'transparent',
      color: theme.textPrimary
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
};

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
  const [customAmenity, setCustomAmenity] = useState('');

  const [latitude, setLatitude] = useState(null);
const [longitude, setLongitude] = useState(null);

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
      billsInclusive: [],
      images: []
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
  const imagesValue = watch('images') || [];

  useEffect(() => {
    const loadPropertyData = async () => {
      try {
        setLoading(true);
        const propertyData = await getPropertyById(id);
        
        if (propertyData) {
          // Parse JSON fields - handle both string and object formats
          // const amenities = propertyData.amenities || {};
          // const facilities = propertyData.facilities || {};

          // Handle different data formats for facilities
      let facilities = {};
      if (propertyData.facilities) {
        if (Array.isArray(propertyData.facilities)) {
          // Convert array format to object format for editing
          propertyData.facilities.forEach(facility => {
            facilities[facility] = 1; // Default count
          });
        } else if (typeof propertyData.facilities === 'object') {
          facilities = propertyData.facilities;
        }
      }
      
      // Handle amenities
      let amenities = {};
      if (propertyData.amenities) {
        if (Array.isArray(propertyData.amenities)) {
          propertyData.amenities.forEach(amenity => {
            amenities[amenity] = 1;
          });
        } else if (typeof propertyData.amenities === 'object') {
          amenities = propertyData.amenities;
        }
      }
      
          const rules = Array.isArray(propertyData.rules) ? propertyData.rules : 
                       (propertyData.rules ? [propertyData.rules] : []);
          const roommates = Array.isArray(propertyData.roommates) ? propertyData.roommates : [];
          const billsInclusive = Array.isArray(propertyData.bills_inclusive) ? propertyData.bills_inclusive : [];
          const images = Array.isArray(propertyData.images) ? propertyData.images : [];
          
           setLatitude(propertyData.latitude);
      setLongitude(propertyData.longitude);

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
            billsInclusive: billsInclusive,
            images: images
          });

          console.log('Loaded property data:', {
            amenities, facilities, images, rules, roommates, billsInclusive
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
  
  const handleLocationSelect = (lat, lng, formattedAddress) => {
  console.log('Location updated:', { lat, lng, formattedAddress });
  
  // Validate coordinates
  if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
    console.error('Invalid coordinates received');
    return;
  }
  
  // Validate coordinate ranges
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    console.error('Coordinates out of valid range');
    return;
  }
  
  setLatitude(lat);
  setLongitude(lng);
  
  if (formattedAddress) {
    setValue('address', formattedAddress);
  }
};

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      if (editingSection === 'location' && (!latitude || !longitude)) {
      setSnackbarMessage('Please select a valid location on the map');
      setSnackbarOpen(true);
      setLoading(false);
      return;
    }
      
      const updateData = {
        property_type: data.propertyType,
        unit_type: data.unitType,
        address: data.address,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
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
        bills_inclusive: data.billsInclusive.filter(bill => bill && bill.trim().length > 0),
        images: data.images
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

  const updateAmenityQuantity = (amenity, quantity) => {
    const currentAmenities = { ...amenitiesValue };
    if (quantity <= 0) {
      delete currentAmenities[amenity];
    } else {
      currentAmenities[amenity] = quantity;
    }
    setValue('amenities', currentAmenities);
  };

  const removeAmenity = (amenity) => {
    const currentAmenities = { ...amenitiesValue };
    delete currentAmenities[amenity];
    setValue('amenities', currentAmenities);
  };

  const addAmenity = () => {
    if (selectedAmenityToAdd && !amenitiesValue[selectedAmenityToAdd]) {
      updateAmenityQuantity(selectedAmenityToAdd, 1);
      setSelectedAmenityToAdd('');
    }
  };

  const addAmenitySimple = (amenity) => {
  if (amenity && !amenitiesValue[amenity]) {
    const currentAmenities = { ...amenitiesValue };
    currentAmenities[amenity] = 1;
    setValue('amenities', currentAmenities);
  }
};

const addCustomAmenitySimple = () => {
  if (customAmenity.trim() && !amenitiesValue[customAmenity.trim()]) {
    addAmenitySimple(customAmenity.trim());
    setCustomAmenity('');
  }
};

  const updateFacilityCount = (facility, increment) => {
    const currentValue = facilitiesValue[facility] || 0;
    const newValue = increment ? currentValue + 1 : Math.max(0, currentValue - 1);
    
    const currentFacilities = { ...facilitiesValue };
    if (newValue <= 0) {
      delete currentFacilities[facility];
    } else {
      currentFacilities[facility] = newValue;
    }
    setValue('facilities', currentFacilities);
  };

  const addFacility = () => {
    if (selectedFacilityToAdd && !facilitiesValue[selectedFacilityToAdd]) {
      const currentFacilities = { ...facilitiesValue };
      currentFacilities[selectedFacilityToAdd] = 1;
      setValue('facilities', currentFacilities);
      setSelectedFacilityToAdd('');
    }
  };

  if (loading) {
    return (
      <Container sx={{ 
        textAlign: 'center', 
        py: 8,
        backgroundColor: theme.background,
        color: theme.textPrimary
      }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading property details...</Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      backgroundColor: theme.background, 
      minHeight: '100vh', 
      py: 4,
      color: theme.textPrimary
    }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ 
          mb: 4, 
          textAlign: 'center', 
          fontWeight: 'bold',
          color: theme.textPrimary
        }}>
          Update Property
        </Typography>

        <Alert severity="info" sx={{ mb: 4 }}>
          You can edit one section at a time.
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
          value={watch('propertyType') || ''} // Ensure value is set even if undefined
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
          value={watch('unitType') || ''} // Ensure value is set even if undefined
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
  title="Location & Address"
  isEditing={editingSection === 'location'}
  onEdit={() => setEditingSection('location')}
  onSave={() => setEditingSection('')}
  onCancel={handleCancelEdit}
  error={errors.address?.message}
>
  <Grid container spacing={3}>
    <Grid item xs={12}>
      <TextField
        fullWidth
        label={<RequiredFieldLabel required>Property Address</RequiredFieldLabel>}
        variant="outlined"
        disabled={editingSection !== 'location'}
        {...register('address')}
        error={!!errors.address}
        helperText={errors.address?.message}
      />
    </Grid>
    
    {editingSection === 'location' ? (
      <Grid item xs={12}>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
          Property Location on Map
        </Typography>
        <MapSearch
          address={watch('address')}
          setAddress={(addr) => setValue('address', addr)}
          onLocationSelect={handleLocationSelect}
          latitude={latitude}
          longitude={longitude}
          readonly={false}
          showSearch={true}
        />
        {latitude && longitude && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(76, 175, 80, 0.1)', borderRadius: 1 }}>
            <Typography variant="body2" color="success.main">
              Current location: {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </Typography>
          </Box>
        )}
        {(!latitude || !longitude) && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255, 152, 0, 0.1)', borderRadius: 1 }}>
            <Typography variant="body2" color="warning.main">
              Please select a location on the map to save coordinates
            </Typography>
          </Box>
        )}
      </Grid>
    ) : (
      // Display map when not editing
      latitude && longitude && (
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Property Location
          </Typography>
          <MapSearch
            address={watch('address')}
            latitude={latitude}
            longitude={longitude}
            readonly={true}
            showSearch={false}
          />
        </Grid>
      )
    )}

    {/* <Grid item xs={12}>
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
    </Grid> */}
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
  {Object.keys(amenitiesValue).length > 0 && (
    <Box sx={{ mb: 3 }}>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Selected Amenities:
      </Typography>
      <Grid container spacing={1}>
        {Object.keys(amenitiesValue).map((amenity) => (
          <Grid item key={amenity}>
            <Chip
              label={amenity}
              variant="filled"
              color="primary"
              onClick={() => editingSection === 'amenities' ? removeAmenity(amenity) : null}
              onDelete={editingSection === 'amenities' ? () => removeAmenity(amenity) : undefined}
              sx={{ 
                m: 0.5, 
                cursor: editingSection === 'amenities' ? 'pointer' : 'default',
                backgroundColor: theme.primary,
                color: 'white'
              }}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  )}

  {editingSection === 'amenities' && (
    <>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Available Amenities:
      </Typography>
      <Grid container spacing={1} sx={{ mb: 3 }}>
        {availableAmenities
          .filter(amenity => !amenitiesValue[amenity])
          .map((amenity) => (
            <Grid item key={amenity}>
              <Chip
                label={amenity}
                variant="outlined"
                onClick={() => addAmenitySimple(amenity)}
                sx={{ 
                  m: 0.5, 
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: `${theme.primary}20`
                  }
                }}
              />
            </Grid>
          ))}
      </Grid>
      
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          value={customAmenity}
          onChange={(e) => setCustomAmenity(e.target.value)}
          placeholder="Add custom amenity"
          size="small"
          sx={{ flexGrow: 1 }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addCustomAmenitySimple();
            }
          }}
        />
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={addCustomAmenitySimple}
          disabled={!customAmenity.trim()}
        >
          Add Custom
        </Button>
      </Box>
    </>
  )}
</EditableSection>

          <EditableSection
            title="Property Facilities"
            isEditing={editingSection === 'facilities'}
            onEdit={() => setEditingSection('facilities')}
            onSave={() => setEditingSection('')}
            onCancel={handleCancelEdit}
            error={errors.facilities?.message}
          >
            {Object.keys(facilitiesValue).length > 0 && (
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {availableFacilities.map((facility) => {
                  const count = facilitiesValue[facility];
                  if (count === undefined) return null;
                  
                  return (
                    <Grid item xs={12} sm={6} md={4} key={facility}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        p: 2,
                        border: `1px solid ${theme.border}`,
                        borderRadius: 2,
                        backgroundColor: theme.cardBackground,
                        color: theme.textPrimary
                      }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {facility}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconButton 
                            size="small" 
                            onClick={() => updateFacilityCount(facility, false)}
                            disabled={editingSection !== 'facilities' || count <= 0}
                          >
                            <RemoveIcon />
                          </IconButton>
                          <Typography variant="body1" sx={{ 
                            minWidth: '30px', 
                            textAlign: 'center',
                            fontWeight: 600
                          }}>
                            {count}
                          </Typography>
                          <IconButton 
                            size="small" 
                            onClick={() => updateFacilityCount(facility, true)}
                            disabled={editingSection !== 'facilities'}
                          >
                            <AddIcon />
                          </IconButton>
                          {editingSection === 'facilities' && (
                            <Button 
                              size="small" 
                              color="error" 
                              onClick={() => {
                                const currentFacilities = { ...facilitiesValue };
                                delete currentFacilities[facility];
                                setValue('facilities', currentFacilities);
                              }}
                            >
                              Remove
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            )}

            {editingSection === 'facilities' && (
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Add Facility</InputLabel>
                  <Select
                    value={selectedFacilityToAdd}
                    onChange={(e) => setSelectedFacilityToAdd(e.target.value)}
                  >
                    {availableFacilities.filter(facility => facilitiesValue[facility] === undefined).map(facility => (
                      <MenuItem key={facility} value={facility}>
                        {facility}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button variant="contained" onClick={addFacility} disabled={!selectedFacilityToAdd}>
                  Add
                </Button>
              </Box>
            )}
          </EditableSection>

          <EditableSection
            title="Property Images"
            isEditing={editingSection === 'images'}
            onEdit={() => setEditingSection('images')}
            onSave={() => setEditingSection('')}
            onCancel={handleCancelEdit}
          >
            {imagesValue?.length > 0 ? (
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {imagesValue.map((image, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card>
                      <AzuriteImage 
                        src={image.url} 
                        alt={image.originalname || `Property image ${index + 1}`}
                      />
                      <CardContent>
                        <Typography variant="body2" color="textSecondary">
                          {image.originalname || 'Property Image'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Size: {Math.round(image.size / 1024)}KB
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                No images uploaded yet
              </Typography>
            )}

            {editingSection === 'images' && (
              <ImageUpload
                onImagesUploaded={(images) => setValue('images', images)}
                disabled={false}
                maxImages={10}
              />
            )}
          </EditableSection>

          <EditableSection
            title="Availability Period"
            isEditing={editingSection === 'availability'}
            onEdit={() => setEditingSection('availability')}
            onSave={() => setEditingSection('')}
            onCancel={handleCancelEdit}
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
                        onChange={field.onChange}
                        disabled={editingSection !== 'availability'}
                        renderInput={(params) => <TextField {...params} fullWidth />}
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
                        label="Available To"
                        value={field.value}
                        onChange={field.onChange}
                        disabled={editingSection !== 'availability'}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </LocalizationProvider>
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
                  <IconButton onClick={() => removeRule(index)} color="error">
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
            title="Bills Inclusive (Optional)"
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
                  disabled={editingSection !== 'bills'}
                  {...register(`billsInclusive.${index}`)}
                  error={!!errors.billsInclusive?.[index]}
                  helperText={errors.billsInclusive?.[index]?.message}
                />
                {editingSection === 'bills' && (
                  <IconButton onClick={() => removeBill(index)} color="error">
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
                Add Bill
              </Button>
            )}
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

