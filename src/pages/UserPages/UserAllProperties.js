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

  const propertyTypes = ['All', 'Villa', 'Flat', 'Room', 'Hostels'];
  
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
          return parts[parts.length - 1]?.trim();
        })
        .filter(location => location && location !== 'Unknown')
        .filter((location, index, arr) => arr.indexOf(location) === index),
      amenities: getUniqueFilterValues(properties, 'amenities')
        .filter(amenity => amenity && amenity !== 'Unknown')
    };
  }, [properties]);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllProperties();
      setProperties(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to load properties. Please try again.');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = useCallback((event, newValue) => {
    setSelectedTab(newValue);
  }, []);

  const handleSearch = useCallback((event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  }, []);

  const handleFilterChange = useCallback((filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  }, []);

  const applyFilters = useCallback(() => {
    setAppliedFilters({ ...filters });
    setFilterDrawerOpen(false);
  }, [filters]);

  const resetFilters = useCallback(() => {
    const defaultFilters = {
      priceRange: [0, 100000],
      starRating: 0,
      availabilityDate: '',
      location: '',
      bedrooms: 0,
      bathrooms: 0,
      requiredAmenities: [],
      isAvailable: true
    };
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
  }, []);

  const filteredAndSortedProperties = useMemo(() => {
    let filtered = [...properties];

    // Apply tab-based property type filtering
    const selectedPropertyType = propertyTypes[selectedTab];
    if (selectedPropertyType && selectedPropertyType !== 'All') {
      filtered = filtered.filter(property => {
        const propertyType = property.property_type;
        if (!propertyType) return false;
        
        // Handle different property type names and case variations
        const normalizedPropertyType = propertyType.toLowerCase().trim();
        const normalizedSelectedType = selectedPropertyType.toLowerCase().trim();
        
        // Handle plural/singular variations
        if (normalizedSelectedType === 'hostels' && normalizedPropertyType === 'hostel') return true;
        if (normalizedSelectedType === 'hostel' && normalizedPropertyType === 'hostels') return true;
        
        return normalizedPropertyType === normalizedSelectedType;
      });
    }

    // Apply search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(property =>
        property.property_type?.toLowerCase().includes(query) ||
        property.unit_type?.toLowerCase().includes(query) ||
        property.address?.toLowerCase().includes(query) ||
        property.description?.toLowerCase().includes(query)
      );
    }

    // Apply price range filter
    if (appliedFilters.priceRange && appliedFilters.priceRange[0] > 0 || appliedFilters.priceRange[1] < 100000) {
      filtered = filtered.filter(property => {
        const price = parseFloat(property.price);
        return price >= appliedFilters.priceRange[0] && price <= appliedFilters.priceRange[1];
      });
    }

    // Apply star rating filter
    if (appliedFilters.starRating > 0) {
      filtered = filtered.filter(property => {
        const rating = parseFloat(property.rating) || 0;
        return rating >= appliedFilters.starRating;
      });
    }

    // Apply location filter
    if (appliedFilters.location) {
      filtered = filtered.filter(property =>
        property.address?.toLowerCase().includes(appliedFilters.location.toLowerCase())
      );
    }

    // Apply bedroom filter
    if (appliedFilters.bedrooms > 0) {
      filtered = filtered.filter(property => {
        try {
          const facilities = typeof property.facilities === 'string' 
            ? JSON.parse(property.facilities) 
            : property.facilities || {};
          const bedrooms = parseInt(facilities.Bedroom || facilities.bedroom || 0);
          return bedrooms >= appliedFilters.bedrooms;
        } catch (e) {
          return false;
        }
      });
    }

    // Apply bathroom filter
    if (appliedFilters.bathrooms > 0) {
      filtered = filtered.filter(property => {
        try {
          const facilities = typeof property.facilities === 'string' 
            ? JSON.parse(property.facilities) 
            : property.facilities || {};
          const bathrooms = parseInt(facilities.Bathroom || facilities.bathroom || 0);
          return bathrooms >= appliedFilters.bathrooms;
        } catch (e) {
          return false;
        }
      });
    }

    // Apply amenities filter
    if (appliedFilters.requiredAmenities.length > 0) {
      filtered = filtered.filter(property => {
        try {
          const amenities = typeof property.amenities === 'string' 
            ? JSON.parse(property.amenities) 
            : property.amenities || {};
          
          return appliedFilters.requiredAmenities.every(requiredAmenity =>
            Object.keys(amenities).some(key =>
              key.toLowerCase().includes(requiredAmenity.toLowerCase()) && amenities[key]
            )
          );
        } catch (e) {
          return false;
        }
      });
    }

    // Apply availability filter
    if (appliedFilters.isAvailable) {
      filtered = filtered.filter(property => 
        property.is_available !== false && property.is_active !== false
      );
    }

    // Apply sorting
    if (sortBy) {
      filtered.sort((a, b) => {
        let aValue, bValue;

        switch (sortBy) {
          case 'price':
            aValue = parseFloat(a.price) || 0;
            bValue = parseFloat(b.price) || 0;
            break;
          case 'rating':
            aValue = parseFloat(a.rating) || 0;
            bValue = parseFloat(b.rating) || 0;
            break;
          case 'date':
            aValue = new Date(a.available_from || a.created_at);
            bValue = new Date(b.available_from || b.created_at);
            break;
          case 'newest':
            aValue = new Date(a.created_at);
            bValue = new Date(b.created_at);
            break;
          case 'bedrooms':
            try {
              const aFacilities = typeof a.facilities === 'string' ? JSON.parse(a.facilities) : a.facilities || {};
              const bFacilities = typeof b.facilities === 'string' ? JSON.parse(b.facilities) : b.facilities || {};
              aValue = parseInt(aFacilities.Bedroom || aFacilities.bedroom || 0);
              bValue = parseInt(bFacilities.Bedroom || bFacilities.bedroom || 0);
            } catch (e) {
              aValue = 0;
              bValue = 0;
            }
            break;
          case 'popularity':
            aValue = parseInt(a.total_ratings) || 0;
            bValue = parseInt(b.total_ratings) || 0;
            break;
          default:
            return 0;
        }

        if (sortOrder === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
    }

    return filtered;
  }, [properties, selectedTab, searchQuery, appliedFilters, sortBy, sortOrder, propertyTypes]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (appliedFilters.priceRange[0] > 0 || appliedFilters.priceRange[1] < 100000) count++;
    if (appliedFilters.starRating > 0) count++;
    if (appliedFilters.location) count++;
    if (appliedFilters.bedrooms > 0) count++;
    if (appliedFilters.bathrooms > 0) count++;
    if (appliedFilters.requiredAmenities.length > 0) count++;
    if (!appliedFilters.isAvailable) count++;
    return count;
  }, [appliedFilters]);

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6">Loading properties...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchProperties}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Find Your Perfect Stay
      </Typography>

      {properties.length > 0 && (
        <Paper sx={{ p: 2, mb: 3, backgroundColor: isDark ? 'grey.900' : 'grey.50' }}>
          <Grid container spacing={2} alignItems="center">
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
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
          }}
        />
        
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={() => setFilterDrawerOpen(true)}
          sx={{ minWidth: 120 }}
        >
          Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </Button>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            label="Sort By"
          >
            {sortOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {sortBy && (
          <Button
            variant="outlined"
            startIcon={<SortIcon />}
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            sx={{ minWidth: 100 }}
          >
            {sortOrder === 'asc' ? 'Asc' : 'Desc'}
          </Button>
        )}
      </Box>

      {(searchQuery || activeFiltersCount > 0 || propertyTypes[selectedTab] !== 'All') && (
        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Active filters:
          </Typography>
          
          {propertyTypes[selectedTab] !== 'All' && (
            <Chip 
              label={`Type: ${propertyTypes[selectedTab]}`}
              size="small"
              onDelete={() => setSelectedTab(0)}
            />
          )}
          
          {searchQuery && (
            <Chip 
              label={`Search: ${searchQuery}`}
              size="small"
              onDelete={() => setSearchQuery('')}
            />
          )}
          
          {activeFiltersCount > 0 && (
            <Chip 
              label={`${activeFiltersCount} filter${activeFiltersCount > 1 ? 's' : ''}`}
              size="small"
              onDelete={resetFilters}
            />
          )}
        </Box>
      )}

      <Typography variant="h6" sx={{ mb: 2 }}>
        {filteredAndSortedProperties.length} Properties Found
        {propertyTypes[selectedTab] !== 'All' && ` in ${propertyTypes[selectedTab]}`}
      </Typography>

      <PropertyGrid 
        properties={filteredAndSortedProperties} 
        loading={loading}
        onPropertyClick={(property) => navigate(`/user-viewproperty/${property.id}`)}
      />

      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: 350, p: 3 } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Filters</Typography>
          <IconButton onClick={() => setFilterDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button variant="contained" onClick={applyFilters} fullWidth>
            Apply
          </Button>
          <Button variant="outlined" onClick={resetFilters} fullWidth>
            Reset
          </Button>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom>Price Range (LKR)</Typography>
          <Slider
            value={filters.priceRange}
            onChange={(e, newValue) => handleFilterChange('priceRange', newValue)}
            valueLabelDisplay="auto"
            min={0}
            max={100000}
            step={1000}
            valueLabelFormat={(value) => `${value.toLocaleString()}`}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="caption">LKR 0</Typography>
            <Typography variant="caption">LKR 100,000+</Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom>Minimum Rating</Typography>
          <Rating
            value={filters.starRating}
            onChange={(e, newValue) => handleFilterChange('starRating', newValue)}
            precision={0.5}
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
              <MenuItem value="">Any Location</MenuItem>
              {filterOptions.locations.map(location => (
                <MenuItem key={location} value={location}>{location}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom>Minimum Bedrooms</Typography>
          <Slider
            value={filters.bedrooms}
            onChange={(e, newValue) => handleFilterChange('bedrooms', newValue)}
            valueLabelDisplay="auto"
            min={0}
            max={5}
            step={1}
            marks={[
              { value: 0, label: 'Any' },
              { value: 1, label: '1+' },
              { value: 2, label: '2+' },
              { value: 3, label: '3+' },
              { value: 4, label: '4+' },
              { value: 5, label: '5+' }
            ]}
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom>Minimum Bathrooms</Typography>
          <Slider
            value={filters.bathrooms}
            onChange={(e, newValue) => handleFilterChange('bathrooms', newValue)}
            valueLabelDisplay="auto"
            min={0}
            max={3}
            step={1}
            marks={[
              { value: 0, label: 'Any' },
              { value: 1, label: '1+' },
              { value: 2, label: '2+' },
              { value: 3, label: '3+' }
            ]}
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={filters.isAvailable}
                onChange={(e) => handleFilterChange('isAvailable', e.target.checked)}
              />
            }
            label="Show only available properties"
          />
        </Box>
      </Drawer>
    </Container>
  );
};

export default UserAllProperties;