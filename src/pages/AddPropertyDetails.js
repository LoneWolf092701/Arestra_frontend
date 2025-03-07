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
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import MapSearch from '../components/specific/MapSearch';
import ImageUpload from '../components/common/ImageUpload';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { PropertyContext } from '../contexts/PropertyContext';
import { useNavigate } from 'react-router-dom';
import { addPropertyDetails } from '../api/propertyApi';
import { ThemeContext } from '../contexts/ThemeContext';
import AppSnackbar from '../components/common/AppSnackbar';

const FacilityCounter = ({ facility, count, onIncrement, onDecrement }) => (
  <Box
    display="flex"
    alignItems="center"
    justifyContent="space-between"
    p={1}
    border="1px solid #ccc"
    borderRadius={2}
  >
    <Typography variant="subtitle1">{facility}</Typography>
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
);

const schema = yup.object().shape({
  propertyType: yup.string().required('Property type is required'),
  unitType: yup.string().required('Unit type is required'),
  selectedAmenities: yup
    .array()
    .of(yup.string())
    .min(1, 'Select at least one amenity'),
  facilities: yup.object().shape({
    Bathroom: yup.number().min(0).required(),
    Bedroom: yup.number().min(0).required()
  }),
  otherFacility: yup.string().notRequired(),
  address: yup.string().required('Address is required'),
  // For roommates, allow an empty array.
  // If any field is provided in a roommate object, then all three fields become required.
  roommates: yup.array().of(
    yup.object().shape({
      name: yup.string(),
      occupation: yup.string(),
      field: yup.string()
    }).test(
      'all-or-none',
      'If one roommate field is provided, then all fields are required',
      function (value) {
        if (!value) return true;
        const { name, occupation, field } = value;
        const anyProvided = Boolean(name || occupation || field);
        const allProvided = Boolean(name && occupation && field);
        return !anyProvided || allProvided;
      }
    )
  ),
  // Rules
  rules: yup
    .array()
    .of(yup.string().trim().min(1, 'Rule cannot be empty'))
    .required('Rules are required'),
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
    priceRange: yup
    .array()
    .of(yup.number())
    .test(
      'priceRange',
      'Min price must be less than or equal to max price',
      (value) => Array.isArray(value) && value[0] <= value[1]
    ),
  // Bills inclusive
  billsInclusive: yup
    .array()
    .of(yup.string().trim().min(1, 'Bills inclusive cannot be empty'))
    .notRequired()
});

const AppPropertyDetails = () => {
  const { propertyType } = React.useContext(PropertyContext);
  const { theme } = React.useContext(ThemeContext);
  const navigate = useNavigate();

  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');

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
      selectedAmenities: [],
      facilities: { Bathroom: 0, Bedroom: 0 },
      otherFacility: '',
      address: '',
      roommates: [],
      rules: [''],
      contractPolicy: '',
      availableFrom: dayjs(),
      availableTo: dayjs(),
      priceRange: [500, 2000],
      billsInclusive: []
    },
    resolver: yupResolver(schema)
  });

  console.log({errors});

  // For Roommates field array
  const { fields: roommateFields, append: appendRoommate, remove: removeRoommate } = useFieldArray({
    control,
    name: 'roommates'
  });

  // For Rules field array
  const { fields: ruleFields, append: appendRule, remove: removeRule } = useFieldArray({
    control,
    name: 'rules'
  });

  // For Bills Inclusive
  const { fields: billsFields, append: appendBill, remove: removeBill } = useFieldArray({
    control,
    name: 'billsInclusive'
  });

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

  const amenitiesOptions = ['TV', 'AC', 'Couch', 'Wi-Fi', 'Fridge'];

  // Toggle amenities by updating the form value directly
  const toggleAmenity = (amenity) => {
    const currentAmenities = getValues('selectedAmenities');
    if (currentAmenities.includes(amenity)) {
      setValue('selectedAmenities', currentAmenities.filter((item) => item !== amenity));
    } else {
      setValue('selectedAmenities', [...currentAmenities, amenity]);
    }
  };

  const facilitiesValue = watch('facilities');
  const incrementFacility = (facility) => {
    const currentFacilities = getValues('facilities');
    setValue('facilities', { ...currentFacilities, [facility]: currentFacilities[facility] + 1 });
  };

  const decrementFacility = (facility) => {
    const currentFacilities = getValues('facilities');
    setValue('facilities', { ...currentFacilities, [facility]: Math.max(currentFacilities[facility] - 1, 0) });
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
      setSnackbarMessage('Property details submitted successfully!');
      setSnackbarOpen(true);
      setTimeout(() => {
        navigate('/home');
      }, 2000);
    } catch (error) {
      console.error('Error submitting property details:', error);
      setSnackbarMessage('Error submitting property details');
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container sx={{ my: 4 }}>
      <Typography variant="h4" gutterBottom>
        Add Property Details
      </Typography>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6" gutterBottom>
        Select Unit Type
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

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Add Amenities available at your place
        </Typography>
        <Grid container spacing={2}>
          {amenitiesOptions.map((amenity) => (
            <Grid item xs={12} sm={4} md={3} key={amenity}>
              <Card
                sx={{
                  border: getValues('selectedAmenities').includes(amenity)
                    ? '2px solid green'
                    : '1px solid #ccc',
                  cursor: 'pointer'
                }}
                onClick={() => toggleAmenity(amenity)}
              >
                <CardActionArea>
                  <CardContent>
                    <Typography
                      variant="body1"
                      align="center"
                      color={getValues('selectedAmenities').includes(amenity) ? 'green' : 'inherit'}
                    >
                      {amenity}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
        {errors.selectedAmenities && (
          <Typography color="error">{errors.selectedAmenities.message}</Typography>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Add Facilities available at your place
        </Typography>
        <Grid container spacing={2}>
          {Object.keys(facilitiesValue).map((facility) => (
            <Grid item xs={12} sm={6} md={4} key={facility}>
              <FacilityCounter
                facility={facility}
                count={facilitiesValue[facility]}
                onIncrement={() => incrementFacility(facility)}
                onDecrement={() => decrementFacility(facility)}
              />
            </Grid>
          ))}
        </Grid>
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Other Facilities"
            variant="outlined"
            {...register('otherFacility')}
            error={!!errors.otherFacility}
            helperText={errors.otherFacility?.message}
          />
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Add Photos of your place
        </Typography>
        <ImageUpload onUpload={handleImageUpload} />
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Add the Address
        </Typography>
        <MapSearch address={watch('address')} setAddress={(addr) => setValue('address', addr)} />
        {errors.address && <Typography color="error">{errors.address.message}</Typography>}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Roommates Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Existing Roommates
        </Typography>
        {roommateFields.map((item, index) => (
          <Box display="flex" alignItems="center" key={item.id} my={1} gap={1}>
            <TextField
              fullWidth
              label="Roommate Name"
              variant="outlined"
              {...register(`roommates.${index}.name`)}
              error={!!errors.roommates?.[index]?.name}
              helperText={errors.roommates?.[index]?.name?.message}
            />
            <FormControl variant="outlined" sx={{ minWidth: 180 }}>
              <InputLabel>Occupation</InputLabel>
              <Select
                label="Occupation"
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
            <FormControl variant="outlined" sx={{ minWidth: 180 }}>
              <InputLabel>Field</InputLabel>
              <Select
                label="Field"
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
            <IconButton onClick={() => removeRoommate(index)}>
              <RemoveIcon />
            </IconButton>
          </Box>
        ))}
        <Button onClick={() => appendRoommate({ name: '', occupation: '', field: '' })} startIcon={<AddIcon />}>
          Add Roommate
        </Button>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Rules Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Rules
        </Typography>
        {ruleFields.map((item, index) => (
          <Box display="flex" alignItems="center" key={item.id} my={1} gap={1}>
            <TextField
              fullWidth
              label="Rule"
              variant="outlined"
              {...register(`rules.${index}`)}
              error={!!errors.rules?.[index]}
              helperText={errors.rules?.[index]?.message}
            />
            <IconButton onClick={() => removeRule(index)}>
              <RemoveIcon />
            </IconButton>
          </Box>
        ))}
        <Button onClick={() => appendRule('')} startIcon={<AddIcon />}>
          Add Rule
        </Button>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Contract Policy Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Contract & Cancellation Policy
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          placeholder="Enter contract details..."
          {...register('contractPolicy')}
          error={!!errors.contractPolicy}
          helperText={errors.contractPolicy?.message}
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Available Dates */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Available Dates
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Controller
              name="availableFrom"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="From"
                  value={field.value}
                  onChange={(newValue) => field.onChange(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      error={!!errors.availableFrom}
                      helperText={errors.availableFrom?.message}
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
                  label="To"
                  value={field.value}
                  onChange={(newValue) => field.onChange(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      error={!!errors.availableTo}
                      helperText={errors.availableTo?.message}
                    />
                  )}
                />
              )}
            />
          </Box>
        </LocalizationProvider>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Price Range Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Set Price Range
        </Typography>
        <Controller
          name="priceRange"
          control={control}
          render={({ field }) => (
            <>
              <Slider
                value={field.value}
                onChange={(event, newValue) => field.onChange(newValue)}
                min={100}
                max={5000}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                  label="Min Price"
                  type="number"
                  value={field.value[0]}
                  onChange={(e) => {
                    const min = Number(e.target.value);
                    field.onChange([min, field.value[1]]);
                  }}
                />
                <TextField
                  label="Max Price"
                  type="number"
                  value={field.value[1]}
                  onChange={(e) => {
                    const max = Number(e.target.value);
                    field.onChange([field.value[0], max]);
                  }}
                />
              </Box>
            </>
          )}
        />
      </Box>

      {/* Bills Inclusive Section */}
      <Box sx={{ mt: 2 }}>
        {billsFields.map((item, index) => (
          <Box display="flex" alignItems="center" key={item.id} my={1} gap={1}>
            <TextField
              fullWidth
              label="Bills Inclusive"
              variant="outlined"
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
          Add Bills Inclusive
        </Button>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Button variant="contained" onClick={handleSubmit(onSubmit)}>
          Next
        </Button>
      </Box>

      <AppSnackbar
        open={snackbarOpen}
        message={snackbarMessage}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
      />
    </Container>
  );
};

export default AppPropertyDetails;
