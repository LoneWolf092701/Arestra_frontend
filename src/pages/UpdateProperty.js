import React, { useState, useEffect } from 'react';
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
import { useParams, useNavigate } from 'react-router-dom';
import { getProperties, updateProperty } from '../api/propertyApi';
import SkeletonLoader from '../components/specific/SkeletonLoader';
import AppSnackbar from '../components/common/AppSnackbar';
import { useForm, Controller, useFieldArray, get } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Reuse the same Yup schema from the add form
const schema = yup.object().shape({
  propertyType: yup.string().required('Property type is required'),
  unitType: yup.string().required('Unit type is required'),
  selectedAmenities: yup
    .array()
    .of(yup.string())
    .min(1, 'Select at least one amenity'),
  facilities: yup.object().shape({
    Bathroom: yup.number().min(1, "One or more bathrooms must").required("Bathroom count is required"),
    Bedroom: yup.number().min(1, "one or more bedrooms must").required("Bedroom count is required")
  }),
  otherFacility: yup.string().notRequired(),
  address: yup.string().required('Address is required'),
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
  rules: yup
    .array()
    .of(yup.string().trim().min(1, 'Rule cannot be empty'))
    .required('Rules are required'),
  contractPolicy: yup.string().required('Contract policy is required'),
  availableFrom: yup
    .date()
    .min(new Date(), 'Available from date cannot be in the past')
    .required('Available from date is required'),
  availableTo: yup
    .date()
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
  billsInclusive: yup
    .array()
    .of(yup.string().trim().min(1, 'Bills inclusive cannot be empty'))
    .notRequired()
});

const FacilityCounter = ({ facility, count, onIncrement, onDecrement, error }) => (
  <>
  <Box
    display="flex"
    alignItems="center"
    justifyContent="space-between"
    p={1}
    border="1px solid #ccc"
    borderRadius={2}
  >
    {console.log({facility})}
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
  <Typography variant='caption' color='error'>{error}</Typography>
  </>
);

const UpdateProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Initialize the form with default values
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    getValues,  // New
    formState: { errors }
  } = useForm({
    defaultValues: {
      propertyType: '',
      unitType: '',
      selectedAmenities: [],
      facilities: { Bathroom: 0, Bedroom: 0 },
      otherFacility: '',
      address: '',
      roommates: [],
      rules: [''],
      contractPolicy: '',
      availableFrom: null,
      availableTo: null,
      priceRange: [500, 2000],
      billsInclusive: []
    },
    resolver: yupResolver(schema)
  });

  console.log({errors});  // New
  console.log(getValues("facilities")); // New

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

  // selection cards and toggles
  const unitOptions = [
    { label: 'Rental unit', description: 'A rented place within a multi-unit residential building or complex.' },
    { label: 'Shared unit', description: 'A rented place shared with other tenants.' },
    { label: 'Entire unit', description: 'An entire place rented by a single tenant.' }
  ];
  const amenitiesOptions = ['TV', 'AC', 'Couch', 'Wi-Fi', 'Fridge'];

  // Toggle amenities selection
  const toggleAmenity = (amenity) => {
    const currentAmenities = watch('selectedAmenities');
    if (currentAmenities.includes(amenity)) {
      setValue('selectedAmenities', currentAmenities.filter((item) => item !== amenity));
    } else {
      setValue('selectedAmenities', [...currentAmenities, amenity]);
    }
  };

  // Fetch property details 
  // set the form values via reset()
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const token = localStorage.getItem('token');
        const data = await getProperties(token);
        const prop = data.find((p) => p.id === parseInt(id));
        if (prop) {
          reset({
            propertyType: prop.property_type || '',
            unitType: prop.unit_type || '',
            selectedAmenities: prop.amenities ? JSON.parse(prop.amenities) : [],
            facilities: prop.facilities ? JSON.parse(prop.facilities) : { Bathroom: 0, Bedroom: 0 },
            otherFacility: prop.other_facility || '',
            address: prop.address || '',
            roommates: prop.roommates ? JSON.parse(prop.roommates) : [],
            rules: prop.rules ? JSON.parse(prop.rules) : [''],
            contractPolicy: prop.contract_policy || '',
            availableFrom: prop.available_from ? dayjs(prop.available_from) : null,
            availableTo: prop.available_to ? dayjs(prop.available_to) : null,
            priceRange: prop.price_range ? JSON.parse(prop.price_range) : [500, 2000],
            billsInclusive: prop.bills_inclusive ? JSON.parse(prop.bills_inclusive) : []
          });
        }
      } catch (error) {
        console.error('Error fetching property details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id, reset]);

  // form submission
  const onSubmit = async (data) => {
    const formattedData = {
      ...data,
      availableFrom: data.availableFrom ? dayjs(data.availableFrom).format('YYYY-MM-DD HH:mm:ss') : null,
      availableTo: data.availableTo ? dayjs(data.availableTo).format('YYYY-MM-DD HH:mm:ss') : null
    };
    try {
      const token = localStorage.getItem('token');
      await updateProperty(id, formattedData, token);
      setSnackbarMessage('Property details updated successfully!');
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

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <Container sx={{ my: 4, backgroundColor: '#e3f2fd', borderRadius: 2, boxShadow: 3, p: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', color: '#0d47a1' }}>
        Update Your Property
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Unit Type Section */}
        <Typography variant="h6" gutterBottom>
          Select Unit Type
        </Typography>
        <Grid container spacing={2}>
          {unitOptions.map((option) => (
            <Grid item xs={12} sm={6} md={4} key={option.label}>
              <Card
                sx={{
                  border: watch('unitType') === option.label ? '2px solid #0d47a1' : '1px solid #ccc',
                  cursor: 'pointer',
                  backgroundColor: watch('unitType') === option.label ? '#bbdefb' : 'inherit'
                }}
                onClick={() => setValue('unitType', option.label)}
              >
                <CardActionArea>
                  <CardContent>
                    <Typography variant="h6" align="center">
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

        {/* Amenities Section */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Add Amenities available at your place
          </Typography>
          <Grid container spacing={2}>
            {amenitiesOptions.map((amenity) => (
              <Grid item xs={12} sm={4} md={3} key={amenity}>
                <Card
                  sx={{
                    border: watch('selectedAmenities').includes(amenity)
                      ? '2px solid #2e7d32'
                      : '1px solid #ccc',
                    cursor: 'pointer',
                    backgroundColor: watch('selectedAmenities').includes(amenity) ? '#c8e6c9' : 'inherit'
                  }}
                  onClick={() => toggleAmenity(amenity)}
                >
                  <CardActionArea>
                    <CardContent>
                      <Typography variant="body1" align="center">
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

        {/* Facilities Section */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Add Facilities available at your place
          </Typography>
          <Grid container spacing={2}>
            {Object.keys(watch('facilities')).map((facility) => (
              <Grid item xs={12} sm={6} md={4} key={facility}>
                <FacilityCounter
                  facility={facility}
                  count={watch('facilities')[facility]}
                  onIncrement={() =>
                    setValue('facilities', {
                      ...watch('facilities'),
                      [facility]: watch('facilities')[facility] + 1
                    })
                  }
                  onDecrement={() =>
                    {console.log("facilitySection", facility)
                    setValue('facilities', {
                      ...watch('facilities'),
                      [facility]: Math.max(watch('facilities')[facility] - 1, 0)
                    })}
                  }
                  error={errors.facilities?.[facility]?.message}
                />
                {console.log("getValues",getValues("facilities"))}
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

        {/* Image Upload Section */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Add Photos of your place
          </Typography>
          <ImageUpload onUpload={() => {}} />
        </Box>
        <Divider sx={{ my: 2 }} />

        {/* Address Section */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Add the Address
          </Typography>
          <MapSearch
            address={watch('address')}
            setAddress={(addr) => setValue('address', addr)}
          />
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
                  {['Student', 'Professional', 'Other'].map((option) => (
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
                  {['Engineering', 'Arts', 'Science', 'Business', 'Other'].map((option) => (
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

        {/* Available Dates Section */}
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
                    onChange={(e) =>
                      field.onChange([Number(e.target.value), field.value[1]])
                    }
                  />
                  <TextField
                    label="Max Price"
                    type="number"
                    value={field.value[1]}
                    onChange={(e) =>
                      field.onChange([field.value[0], Number(e.target.value)])
                    }
                  />
                </Box>
              </>
            )}
          />
        </Box>
        <Divider sx={{ my: 2 }} />

        {/* Bills Inclusive Section */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Bills Inclusive
          </Typography>
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
          <Button variant="contained" type="submit">
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
  );
};

export default UpdateProperty;
