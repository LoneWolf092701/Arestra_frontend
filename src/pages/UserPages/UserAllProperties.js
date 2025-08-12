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
  Alert,
  InputAdornment,
  CircularProgress,
  Badge,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import TuneIcon from '@mui/icons-material/Tune';
import SortIcon from '@mui/icons-material/Sort';
import ClearIcon from '@mui/icons-material/Clear';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import { getAllPublicProperties } from '../../api/propertyApi';
import { getPropertyRating, checkFavoriteStatus, recordPropertyView } from '../../api/userInteractionApi';
import PropertyGrid from '../../components/common/PropertyGrid';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

const UserAllProperties = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [filters, setFilters] = useState({
    property_type: '',
    unit_type: '',
    min_price: '',
    max_price: '',
    bedrooms: '',
    bathrooms: '',
    amenities: [],
    facilities: [],
    location: '',
    available_from: '',
    available_to: '',
    sort: 'created_at_desc'
  });

  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const navigate = useNavigate();
  const { theme, isDark } = useTheme();

  const propertyTypes = [
    'Apartment', 'Villa', 'House', 'Boarding'
  ];

  const unitTypes = [
    'Studio', '1 Bedroom', '2 Bedroom', '3 Bedroom', '4 Bedroom', '5+ Bedroom',
    'Single Room', 'Shared Room', 'Entire Place'
  ];

  const commonAmenities = [
    'WiFi', 'Air Conditioning', 'Parking', 'Swimming Pool', 'Gym', 'Security',
    'Furnished', 'Kitchen', 'Balcony', 'Garden', 'Laundry', 'Pet Friendly'
  ];

  const commonFacilities = [
    'Electricity', 'Water', 'Gas', 'Internet', 'Cable TV', 'Cleaning Service',
    'Maintenance', '24/7 Security', 'CCTV', 'Backup Power', 'Elevator'
  ];

  const sortOptions = [
    { value: 'created_at_desc', label: 'Newest First' },
    { value: 'created_at_asc', label: 'Oldest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'views_desc', label: 'Most Viewed' },
    { value: 'relevance', label: 'Most Relevant' }
  ];

  // Extract and process response data
  const extractProperties = (response) => {
    console.log('Raw API response:', response);
    
    // Handle different response structures
    let propertyData = [];
    let totalCount = 0;
    
    if (response) {
      // Try different property array keys
      propertyData = response.results || 
                   response.properties || 
                   response.data || 
                   (Array.isArray(response) ? response : []);
      
      // Try different total count keys
      totalCount = response.search_metadata?.total_results || 
                  response.pagination?.total || 
                  response.total_count || 
                  response.total ||
                  (Array.isArray(propertyData) ? propertyData.length : 0);
    }
    
    // Ensure we have an array
    const properties = Array.isArray(propertyData) ? propertyData : [];
    
    console.log('Extracted properties:', {
      count: properties.length,
      total: totalCount,
      firstProperty: properties[0] || null
    });
    
    return { properties, totalCount };
  };

  // Build search parameters
  const buildSearchParams = (resetPage = false) => {
    const params = {
      page: resetPage ? 1 : currentPage,
      limit: 12,
      ...filters
    };

    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }

    if (filters.amenities.length > 0) {
      params.amenities = filters.amenities.join(',');
    }

    if (filters.facilities.length > 0) {
      params.facilities = filters.facilities.join(',');
    }

    // Clean up empty parameters
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key];
      }
    });

    return params;
  };

  // Fetch properties function
  const fetchProperties = async (resetResults = false) => {
    try {
      if (resetResults) {
        setLoading(true);
        setCurrentPage(1);
        setProperties([]);
        setError('');
      } else {
        setLoadingMore(true);
      }

      const params = buildSearchParams(resetResults);
      console.log('Fetching properties with params:', params);
      
      const response = await getAllPublicProperties(params);
      const { properties: propertyData, totalCount } = extractProperties(response);

      if (resetResults) {
        setProperties(propertyData);
        console.log('Set properties (reset):', propertyData.length);
      } else {
        setProperties(prev => {
          const newProperties = [...prev, ...propertyData];
          console.log('Added properties (append):', propertyData.length, 'Total:', newProperties.length);
          return newProperties;
        });
      }

      setTotalResults(totalCount);
      setHasMore(propertyData.length === 12);

    } catch (error) {
      console.error('Error fetching properties:', error);
      setError(error.message || 'Failed to load properties. Please try again.');
      if (resetResults) {
        setProperties([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    const searchTerm = searchParams.get('search');
    if (searchTerm !== searchQuery) {
      setSearchQuery(searchTerm || '');
    }
    console.log('Initial load triggered');
    fetchProperties(true);
  }, [searchParams]);

  useEffect(() => {
    countActiveFilters();
  }, [filters]);

  // Debug logging for properties state
  useEffect(() => {
    console.log('Properties state updated:', {
      count: properties.length,
      loading,
      error,
      totalResults,
      hasMore
    });
  }, [properties, loading, error, totalResults, hasMore]);

  // Count active filters
  const countActiveFilters = () => {
    let count = 0;
    if (filters.property_type) count++;
    if (filters.unit_type) count++;
    if (filters.min_price) count++;
    if (filters.max_price) count++;
    if (filters.bedrooms) count++;
    if (filters.bathrooms) count++;
    if (filters.amenities.length > 0) count++;
    if (filters.facilities.length > 0) count++;
    if (filters.location) count++;
    if (filters.available_from) count++;
    if (filters.available_to) count++;
    setActiveFiltersCount(count);
  };

  // Handle search
  const handleSearch = (event) => {
    event.preventDefault();
    console.log('Search triggered:', searchQuery);
    
    const newSearchParams = new URLSearchParams(searchParams);
    
    if (searchQuery.trim()) {
      newSearchParams.set('search', searchQuery.trim());
    } else {
      newSearchParams.delete('search');
    }
    
    setSearchParams(newSearchParams);
  };

  // Filter handlers
  const handleFilterChange = (filterName, value) => {
    console.log('Filter changed:', filterName, value);
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleArrayFilterToggle = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: prev[filterName].includes(value)
        ? prev[filterName].filter(item => item !== value)
        : [...prev[filterName], value]
    }));
  };

  const applyFilters = () => {
    console.log('Applying filters:', filters);
    setFilterDrawerOpen(false);
    fetchProperties(true);
  };

  const clearAllFilters = () => {
    console.log('Clearing all filters');
    setFilters({
      property_type: '',
      unit_type: '',
      min_price: '',
      max_price: '',
      bedrooms: '',
      bathrooms: '',
      amenities: [],
      facilities: [],
      location: '',
      available_from: '',
      available_to: '',
      sort: 'created_at_desc'
    });
    setSearchQuery('');
    setSearchParams(new URLSearchParams());
    fetchProperties(true);
  };

  // Load more properties
  const loadMoreProperties = () => {
    if (!loadingMore && hasMore && properties.length > 0) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      
      const params = buildSearchParams(false);
      params.page = nextPage;
      
      console.log('Loading more properties, page:', nextPage);
      fetchProperties(false);
    }
  };

  // Handle property view
  const handlePropertyView = async (propertyId) => {
    try {
      await recordPropertyView(propertyId);
    } catch (error) {
      console.error('Error recording property view:', error);
    }
    navigate(`/user-property-view/${propertyId}`);
  };

  // Render filter drawer
  const renderFilterDrawer = () => (
    <Drawer
      anchor="right"
      open={filterDrawerOpen}
      onClose={() => setFilterDrawerOpen(false)}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 400 }, p: 0 }
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Filter Properties
          </Typography>
          <IconButton onClick={() => setFilterDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Property Type</Typography>
          <FormControl fullWidth size="small">
            <Select
              value={filters.property_type}
              onChange={(e) => handleFilterChange('property_type', e.target.value)}
              displayEmpty
            >
              <MenuItem value="">All Types</MenuItem>
              {propertyTypes.map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Unit Type</Typography>
          <FormControl fullWidth size="small">
            <Select
              value={filters.unit_type}
              onChange={(e) => handleFilterChange('unit_type', e.target.value)}
              displayEmpty
            >
              <MenuItem value="">All Unit Types</MenuItem>
              {unitTypes.map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Price Range (LKR)</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                size="small"
                label="Min"
                type="number"
                value={filters.min_price}
                onChange={(e) => handleFilterChange('min_price', e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                size="small"
                label="Max"
                type="number"
                value={filters.max_price}
                onChange={(e) => handleFilterChange('max_price', e.target.value)}
                fullWidth
              />
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Bedrooms</Typography>
          <FormControl fullWidth size="small">
            <Select
              value={filters.bedrooms}
              onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
              displayEmpty
            >
              <MenuItem value="">Any</MenuItem>
              <MenuItem value="1">1+</MenuItem>
              <MenuItem value="2">2+</MenuItem>
              <MenuItem value="3">3+</MenuItem>
              <MenuItem value="4">4+</MenuItem>
              <MenuItem value="5">5+</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Bathrooms</Typography>
          <FormControl fullWidth size="small">
            <Select
              value={filters.bathrooms}
              onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
              displayEmpty
            >
              <MenuItem value="">Any</MenuItem>
              <MenuItem value="1">1+</MenuItem>
              <MenuItem value="2">2+</MenuItem>
              <MenuItem value="3">3+</MenuItem>
              <MenuItem value="4">4+</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Location</Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Enter location"
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Amenities</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {commonAmenities.map(amenity => (
              <Chip
                key={amenity}
                label={amenity}
                clickable
                color={filters.amenities.includes(amenity) ? 'primary' : 'default'}
                onClick={() => handleArrayFilterToggle('amenities', amenity)}
                size="small"
              />
            ))}
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Facilities</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {commonFacilities.map(facility => (
              <Chip
                key={facility}
                label={facility}
                clickable
                color={filters.facilities.includes(facility) ? 'primary' : 'default'}
                onClick={() => handleArrayFilterToggle('facilities', facility)}
                size="small"
              />
            ))}
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Availability</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                size="small"
                label="Available From"
                type="date"
                value={filters.available_from}
                onChange={(e) => handleFilterChange('available_from', e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                size="small"
                label="Available To"
                type="date"
                value={filters.available_to}
                onChange={(e) => handleFilterChange('available_to', e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={clearAllFilters}
            fullWidth
          >
            Clear All
          </Button>
          <Button
            variant="contained"
            onClick={applyFilters}
            fullWidth
            sx={{ backgroundColor: theme.primary }}
          >
            Apply Filters
          </Button>
        </Box>
      </Box>
    </Drawer>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading properties...
        </Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: isDark ? theme.background : '#fafafa', minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: theme.textPrimary,
            mb: 1,
            textAlign: 'center',
          }}
        >
          Find Your Perfect Stay
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: theme.textSecondary,
            mb: 4,
            textAlign: 'center',
            maxWidth: 600,
            mx: 'auto',
          }}
        >
          Discover thousands of verified properties across Sri Lanka
        </Typography>

        {/* Search and Filter Section */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <form onSubmit={handleSearch}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                fullWidth
                placeholder="Search by location, property type, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: theme.textSecondary }} />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                variant="contained"
                sx={{
                  minWidth: 120,
                  backgroundColor: theme.primary,
                  '&:hover': { backgroundColor: theme.secondary },
                }}
              >
                Search
              </Button>

              <Badge badgeContent={activeFiltersCount} color="error">
                <Button
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  onClick={() => setFilterDrawerOpen(true)}
                  sx={{
                    minWidth: 100,
                    borderColor: theme.primary,
                    color: theme.primary,
                  }}
                >
                  Filters
                </Button>
              </Badge>
            </Box>
          </form>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={filters.sort}
                onChange={(e) => {
                  handleFilterChange('sort', e.target.value);
                  fetchProperties(true);
                }}
                label="Sort By"
              >
                {sortOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {activeFiltersCount > 0 && (
              <Button
                startIcon={<ClearIcon />}
                onClick={clearAllFilters}
                size="small"
                sx={{ color: theme.textSecondary }}
              >
                Clear Filters ({activeFiltersCount})
              </Button>
            )}
          </Box>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
            <Button onClick={() => fetchProperties(true)} sx={{ ml: 2 }}>
              Retry
            </Button>
          </Alert>
        )}

        {/* Results Summary */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ color: theme.textPrimary }}>
            {totalResults > 0 
              ? `${totalResults} ${totalResults === 1 ? 'Property' : 'Properties'} Found` 
              : 'No Properties Found'
            }
          </Typography>
        </Box>

        {/* Property Grid or Empty State */}
        {properties && properties.length > 0 ? (
          <>
            <PropertyGrid 
              properties={properties}
              onViewProperty={handlePropertyView}
              loading={false}
              showActions={true}
              showMyProperties={false}
              variant="public"
              emptyStateMessage="No properties found"
              emptyStateSubtitle="Try adjusting your search criteria"
            />

            {hasMore && (
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={loadMoreProperties}
                  disabled={loadingMore}
                  size="large"
                  sx={{
                    minWidth: 200,
                    borderColor: theme.primary,
                    color: theme.primary,
                  }}
                >
                  {loadingMore ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Loading...
                    </>
                  ) : 'Load More Properties'}
                </Button>
              </Box>
            )}
          </>
        ) : (
          !loading && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" sx={{ color: theme.textSecondary, mb: 2 }}>
                No properties found matching your criteria
              </Typography>
              <Typography variant="body2" sx={{ color: theme.textSecondary, mb: 3 }}>
                Try adjusting your search terms or filters to see more results
              </Typography>
              <Button
                variant="contained"
                onClick={clearAllFilters}
                sx={{ backgroundColor: theme.primary }}
              >
                Clear Filters & Show All
              </Button>
            </Box>
          )
        )}

        {/* Filter Drawer */}
        {renderFilterDrawer()}
      </Container>
    </Box>
  );
};

export default UserAllProperties;