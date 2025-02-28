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

const UpdateProperty = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const [address, setAddress] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [unitType, setUnitType] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const amenitiesOptions = ['TV', 'AC', 'Couch', 'Wi-Fi', 'Fridge'];
  const toggleAmenity = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((item) => item !== amenity)
        : [...prev, amenity]
    );
  };

  const [unitOptions] = useState([
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
  ]);

  const [facilities, setFacilities] = useState({ Bathroom: 0, Bedroom: 0 });
  const incrementFacility = (facility) => {
    setFacilities((prev) => ({ ...prev, [facility]: prev[facility] + 1 }));
  };
  const decrementFacility = (facility) => {
    setFacilities((prev) => ({
      ...prev,
      [facility]: Math.max(prev[facility] - 1, 0)
    }));
  };
  const [otherFacility, setOtherFacility] = useState('');

  const handleImageUpload = (uploadedFiles) => {
    console.log('Uploaded files:', uploadedFiles);
  };

  const [roommates, setRoommates] = useState([{ name: '', occupation: '', field: '' }]);
  const occupationOptions = ['Student', 'Professional', 'Other'];
  const fieldOptions = ['Engineering', 'Arts', 'Science', 'Business', 'Other'];
  const addRoommate = () => setRoommates([...roommates, { name: '', occupation: '', field: '' }]);
  const removeRoommate = (index) => {
    setRoommates(roommates.filter((_, i) => i !== index));
  };
  const updateRoommate = (index, key, value) => {
    const updated = [...roommates];
    updated[index][key] = value;
    setRoommates(updated);
  };

  const [rules, setRules] = useState(['']);
  const addRule = () => setRules([...rules, '']);
  const removeRule = (index) => {
    setRules(rules.filter((_, i) => i !== index));
  };
  const updateRule = (index, value) => {
    const updated = [...rules];
    updated[index] = value;
    setRules(updated);
  };

  const [contractPolicy, setContractPolicy] = useState('');

  const [availableFrom, setAvailableFrom] = useState(null);
  const [availableTo, setAvailableTo] = useState(null);

  const [priceRange, setPriceRange] = useState([500, 2000]);
  const handlePriceRangeChange = (event, newValue) => {
    setPriceRange(newValue);
  };
  const handleMinPriceChange = (event) => {
    const min = Number(event.target.value);
    setPriceRange([min, priceRange[1]]);
  };
  const handleMaxPriceChange = (event) => {
    const max = Number(event.target.value);
    setPriceRange([priceRange[0], max]);
  };

  const [billsInclusive, setBillsInclusive] = useState(['']);
  const addbillsInclusive = () => setBillsInclusive([...billsInclusive, '']);
  const removebillsInclusive = (index) => {
    setBillsInclusive(billsInclusive.filter((_, i) => i !== index));
  };
  const updatebillsInclusive = (index, value) => {
    const updated = [...billsInclusive];
    updated[index] = value;
    setBillsInclusive(updated);
  };

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const token = localStorage.getItem('token');
        const data = await getProperties(token);
        const prop = data.find((p) => p.id === parseInt(id));
        if (prop) {
          setPropertyType(prop.property_type || '');
          setUnitType(prop.unit_type || '');
          setSelectedAmenities(prop.amenities ? JSON.parse(prop.amenities) : []);
          setFacilities(prop.facilities ? JSON.parse(prop.facilities) : { Bathroom: 0, Bedroom: 0 });
          setOtherFacility(prop.other_facility || '');
          setRoommates(prop.roommates ? JSON.parse(prop.roommates) : [{ name: '', occupation: '', field: '' }]);
          setRules(prop.rules ? JSON.parse(prop.rules) : ['']);
          setAddress(prop.address || '');
          setContractPolicy(prop.contract_policy || '');
          setAvailableFrom(prop.available_from ? dayjs(prop.available_from) : null);
          setAvailableTo(prop.available_to ? dayjs(prop.available_to) : null);
          setPriceRange(prop.price_range ? JSON.parse(prop.price_range) : [500, 2000]);
          setBillsInclusive(prop.bills_inclusive ? JSON.parse(prop.bills_inclusive) : ['']);
        }
      } catch (error) {
        console.error('Error fetching property details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedData = {
      propertyType,
      unitType,
      selectedAmenities,
      facilities,
      otherFacility,
      roommates,
      rules,
      address,
      contractPolicy,
      availableFrom: availableFrom ? dayjs(availableFrom).format('YYYY-MM-DD HH:mm:ss') : null,
      availableTo: availableTo ? dayjs(availableTo).format('YYYY-MM-DD HH:mm:ss') : null,
      priceRange,
      billsInclusive
    };

    try {
      const token = localStorage.getItem('token');
      await updateProperty(id, updatedData, token);
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
    return <SkeletonLoader/>;
  }

  return (
    <Container sx={{ my: 4, backgroundColor: '#e3f2fd', borderRadius: 2, boxShadow: 3, p: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', color: '#0d47a1' }}>
        Update Your Property
      </Typography>
      <form onSubmit={handleSubmit}>
        <Typography variant="h6" gutterBottom>
          Select Unit Type
        </Typography>
        <Grid container spacing={2}>
          {unitOptions.map((option) => (
            <Grid item xs={12} sm={6} md={4} key={option.label}>
              <Card
                sx={{
                  border: unitType === option.label ? '2px solid #0d47a1' : '1px solid #ccc',
                  cursor: 'pointer',
                  backgroundColor: unitType === option.label ? '#bbdefb' : 'inherit'
                }}
                onClick={() => setUnitType(option.label)}
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
                    border: selectedAmenities.includes(amenity)
                      ? '2px solid #2e7d32'
                      : '1px solid #ccc',
                    cursor: 'pointer',
                    backgroundColor: selectedAmenities.includes(amenity) ? '#c8e6c9' : 'inherit'
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
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Add Facilities available at your place
          </Typography>
          <Grid container spacing={2}>
            {Object.keys(facilities).map((facility) => (
              <Grid item xs={12} sm={6} md={4} key={facility}>
                <FacilityCounter
                  facility={facility}
                  count={facilities[facility]}
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
              value={otherFacility}
              onChange={(e) => setOtherFacility(e.target.value)}
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
          <MapSearch address={address} setAddress={setAddress} />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Existing Roommates
          </Typography>
          {roommates.map((roommate, index) => (
            <Box display="flex" alignItems="center" key={index} my={1} gap={1}>
              <TextField
                fullWidth
                label="Roommate Name"
                variant="outlined"
                value={roommate.name}
                onChange={(e) => updateRoommate(index, 'name', e.target.value)}
              />
              <FormControl variant="outlined" sx={{ minWidth: 180 }}>
                <InputLabel>Occupation</InputLabel>
                <Select
                  label="Occupation"
                  value={roommate.occupation}
                  onChange={(e) => updateRoommate(index, 'occupation', e.target.value)}
                >
                  {occupationOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl variant="outlined" sx={{ minWidth: 180 }}>
                <InputLabel>Field</InputLabel>
                <Select
                  label="Field"
                  value={roommate.field}
                  onChange={(e) => updateRoommate(index, 'field', e.target.value)}
                >
                  {fieldOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <IconButton onClick={() => removeRoommate(index)}>
                <RemoveIcon />
              </IconButton>
            </Box>
          ))}
          <Button onClick={addRoommate} startIcon={<AddIcon />}>
            Add Roommate
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Rules
          </Typography>
          {rules.map((rule, index) => (
            <Box display="flex" alignItems="center" key={index} my={1} gap={1}>
              <TextField
                fullWidth
                label="Rule"
                variant="outlined"
                value={rule}
                onChange={(e) => updateRule(index, e.target.value)}
              />
              <IconButton onClick={() => removeRule(index)}>
                <RemoveIcon />
              </IconButton>
            </Box>
          ))}
          <Button onClick={addRule} startIcon={<AddIcon />}>
            Add Rule
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

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
            value={contractPolicy}
            onChange={(e) => setContractPolicy(e.target.value)}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Available Dates
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <DatePicker
                label="From"
                value={availableFrom}
                onChange={(newValue) => setAvailableFrom(newValue)}
              />
              <DatePicker
                label="To"
                value={availableTo}
                onChange={(newValue) => setAvailableTo(newValue)}
              />
            </Box>
          </LocalizationProvider>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Set Price Range
          </Typography>
          <Slider
            value={priceRange}
            onChange={handlePriceRangeChange}
            min={100}
            max={5000}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              label="Min Price"
              type="number"
              value={priceRange[0]}
              onChange={handleMinPriceChange}
            />
            <TextField
              label="Max Price"
              type="number"
              value={priceRange[1]}
              onChange={handleMaxPriceChange}
            />
          </Box>
          <Box sx={{ mt: 2 }}>
            {billsInclusive.map((bill, index) => (
              <Box display="flex" alignItems="center" key={index} my={1} gap={1}>
                <TextField
                  fullWidth
                  label="Bills Inclusive"
                  variant="outlined"
                  value={bill}
                  onChange={(e) => updatebillsInclusive(index, e.target.value)}
                />
                <IconButton onClick={() => removebillsInclusive(index)}>
                  <RemoveIcon />
                </IconButton>
              </Box>
            ))}
            <Button onClick={addbillsInclusive} startIcon={<AddIcon />}>
              Add Bills Inclusive
            </Button>
          </Box>
        </Box>

        <Button variant="contained" sx={{ mt: 4 }} type="submit">
          Update Property
        </Button>
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
