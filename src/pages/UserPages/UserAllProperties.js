import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  Container, 
  Grid, 
  Tab, 
  Tabs, 
  TextField, 
  Typography, 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Slider, 
  Rating, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Drawer,
  IconButton,
  Chip,
  Switch,
  FormControlLabel,
  Divider,
  Paper,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import TuneIcon from '@mui/icons-material/Tune';
import SortIcon from '@mui/icons-material/Sort';
import ClearIcon from '@mui/icons-material/Clear';
import { getAllProperties } from '../../api/propertyApi';
import PropertyGrid from '../../components/common/PropertyGrid';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { getPropertyStats, getUniqueFilterValues } from '../../utils/PropertyFilterUtils';

const UserAllProperties = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedTab, setSelectedTab] = useState(0);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  
  const { theme, isDark } = useTheme();
  const navigate = useNavigate();
  
  const [filters, setFilters] = useState({
    priceRange: [0, 100000],
    starRating: 0,
    availabilityDate: '',
    location: '',
    bedrooms: 0,
    bathrooms: 0,
    requiredAmenities: [],
    isAvailable: true
  });

  const [appliedFilters, setAppliedFilters] = useState({
    priceRange: [0, 100000],
    starRating: 0,
    availabilityDate: '',
    location: '',
    bedrooms: 0,
    bathrooms: 0,
    requiredAmenities: [],
    isAvailable: true
  });

  const propertyTypes = ['All', 'Apartment', 'Villa', 'Flat', 'Room', 'House'];
  
  const sortOptions = [
    { value: '', label: 'Default' },
    { value: 'price', label: 'Price' },
    { value: 'rating', label: 'Rating' },
    { value: 'date', label: 'Availability Date' },
    { value: 'newest', label: 'Recently Added' },
    { value: 'bedrooms', label: 'Bedrooms' },
    { value: 'popularity', label: 'Popularity' }
  ];

  const propertyStats = useMemo(() => {
    return getPropertyStats(properties);
  }, [properties]);

  const filterOptions = useMemo(() => {
    if (!properties.length) return { locations: [], amenities: [] };
    
    return {
      locations: getUniqueFilterValues(properties, 'address')
        .map(addr => {
          const parts = addr.split(',');
          return parts[parts.length - 1]?.trim() || addr;
        })
        .filter((city, index, arr) => arr.indexOf(city) === index)
        .slice(0, 20),
      
      amenities: properties.reduce((acc, property) => {
        try {
          const amenities = JSON.parse(property.amenities || '[]');
          amenities.forEach(amenity => {
            if (amenity && !acc.includes(amenity)) {
              acc.push(amenity);
            }
          });
        } catch (error) {
          // Handle invalid JSON gracefully
        }
        return acc;
      }, []).slice(0, 15)
    };
  }, [properties]);

  // Single API call to fetch all properties - no loops
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await getAllProperties();
        setProperties(data);
        
        const prices = data.map(p => p.price).filter(p => p > 0);
        if (prices.length > 0) {
          const maxPrice = Math.max(...prices);
          const defaultMax = Math.min(100000, maxPrice);
          
          setFilters(prev => ({
            ...prev,
            priceRange: [0, defaultMax]
          }));
          setAppliedFilters(prev => ({
            ...prev,
            priceRange: [0, defaultMax]
          }));
        }
        
      } catch (error) {
        console.error('Error fetching properties:', error);
        setError('Failed to load properties. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const handleTabChange = useCallback((event, newValue) => {
    setSelectedTab(newValue);
    
    if (newValue === 0) {
      setAppliedFilters(prev => ({ ...prev, propertyType: '' }));
    } else {
      const selectedType = propertyTypes[newValue];
      setAppliedFilters(prev => ({ ...prev, propertyType: selectedType }));
    }
  }, [propertyTypes]);

  const handleSearch = useCallback((event) => {
    if (event.key === 'Enter') {
      // The PropertyGrid will handle the search filtering
      event.preventDefault();
    }
  }, []);

  const handleFilterChange = useCallback((filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  }, []);

  const applyFilters = useCallback(() => {
    setAppliedFilters({ ...filters });
    setFilterDrawerOpen(false);
  }, [filters]);

  const clearFilters = useCallback(() => {
    const clearedFilters = {
      priceRange: [0, 100000],
      starRating: 0,
      availabilityDate: '',
      location: '',
      bedrooms: 0,
      bathrooms: 0,
      requiredAmenities: [],
      isAvailable: true
    };
    setFilters(clearedFilters);
    setAppliedFilters(clearedFilters);
  }, []);

  const handleSortChange = useCallback((event) => {
    setSortBy(event.target.value);
  }, []);

  const handleSortOrderChange = useCallback((event) => {
    setSortOrder(event.target.value);
  }, []);

  const handleAmenityToggle = useCallback((amenity) => {
    setFilters(prev => ({
      ...prev,
      requiredAmenities: prev.requiredAmenities.includes(amenity)
        ? prev.requiredAmenities.filter(a => a !== amenity)
        : [...prev.requiredAmenities, amenity]
    }));
  }, []);

  const FilterDrawer = () => (
    <Drawer
      anchor="right"
      open={filterDrawerOpen}
      onClose={() => setFilterDrawerOpen(false)}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 400 }, p: 2 }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Filter Properties</Typography>
        <IconButton onClick={() => setFilterDrawerOpen(false)}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Price Range</Typography>
        <Slider
          value={filters.priceRange}
          onChange={(e, value) => handleFilterChange('priceRange', value)}
          valueLabelDisplay="auto"
          min={0}
          max={200000}
          step={1000}
          valueLabelFormat={(value) => `LKR ${value.toLocaleString()}`}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="body2">LKR {filters.priceRange[0].toLocaleString()}</Typography>
          <Typography variant="body2">LKR {filters.priceRange[1].toLocaleString()}</Typography>
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Minimum Rating</Typography>
        <Rating
          value={filters.starRating}
          onChange={(e, value) => handleFilterChange('starRating', value || 0)}
          size="large"
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Location</InputLabel>
          <Select
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            label="Location"
          >
            <MenuItem value="">All Locations</MenuItem>
            {filterOptions.locations.map(location => (
              <MenuItem key={location} value={location}>
                {location}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Bedrooms</InputLabel>
          <Select
            value={filters.bedrooms}
            onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
            label="Bedrooms"
          >
            <MenuItem value={0}>Any</MenuItem>
            <MenuItem value={1}>1+</MenuItem>
            <MenuItem value={2}>2+</MenuItem>
            <MenuItem value={3}>3+</MenuItem>
            <MenuItem value={4}>4+</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Bathrooms</InputLabel>
          <Select
            value={filters.bathrooms}
            onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
            label="Bathrooms"
          >
            <MenuItem value={0}>Any</MenuItem>
            <MenuItem value={1}>1+</MenuItem>
            <MenuItem value={2}>2+</MenuItem>
            <MenuItem value={3}>3+</MenuItem>
            <MenuItem value={4}>4+</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          type="date"
          label="Available From"
          value={filters.availabilityDate}
          onChange={(e) => handleFilterChange('availabilityDate', e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Amenities</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {filterOptions.amenities.map(amenity => (
            <Chip
              key={amenity}
              label={amenity}
              clickable
              color={filters.requiredAmenities.includes(amenity) ? 'primary' : 'default'}
              onClick={() => handleAmenityToggle(amenity)}
              variant={filters.requiredAmenities.includes(amenity) ? 'filled' : 'outlined'}
            />
          ))}
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={filters.isAvailable}
              onChange={(e) => handleFilterChange('isAvailable', e.target.checked)}
            />
          }
          label="Available Only"
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
        <Button
          variant="outlined"
          onClick={clearFilters}
          startIcon={<ClearIcon />}
          fullWidth
        >
          Clear
        </Button>
        <Button
          variant="contained"
          onClick={applyFilters}
          startIcon={<TuneIcon />}
          fullWidth
        >
          Apply Filters
        </Button>
      </Box>
    </Drawer>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 'bold' }}>
        All Properties
      </Typography>

      {propertyStats.total > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Property Statistics</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">Total Properties</Typography>
              <Typography variant="h6">{propertyStats.total}</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">Average Price</Typography>
              <Typography variant="h6">LKR {propertyStats.averagePrice.toLocaleString()}</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">Average Rating</Typography>
              <Typography variant="h6">{propertyStats.averageRating.toFixed(1)}</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">Available Now</Typography>
              <Typography variant="h6">{propertyStats.availableCount}</Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {propertyTypes.map((type, index) => (
            <Tab key={type} label={type} />
          ))}
        </Tabs>
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <TextField
          fullWidth
          placeholder="Search properties by location, type, or amenities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleSearch}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
        
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Sort By</InputLabel>
          <Select value={sortBy} onChange={handleSortChange} label="Sort By">
            {sortOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 100 }}>
          <InputLabel>Order</InputLabel>
          <Select value={sortOrder} onChange={handleSortOrderChange} label="Order">
            <MenuItem value="asc">Ascending</MenuItem>
            <MenuItem value="desc">Descending</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          onClick={() => setFilterDrawerOpen(true)}
          startIcon={<FilterListIcon />}
          sx={{ minWidth: 120 }}
        >
          Filters
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <PropertyGrid
        searchQuery={searchQuery}
        filters={filters}
        appliedFilters={appliedFilters}
        sortBy={sortBy}
        sortOrder={sortOrder}
        isUserPage={true}
      />

      <FilterDrawer />
    </Container>
  );
};

export default UserAllProperties;