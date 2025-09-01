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
import Pagination from '../../components/common/Pagination';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

const UserAllProperties = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [paginationData, setPaginationData] = useState({
    total: 0,
    totalPages: 0,
    page: 1,
    limit: 12,
    hasNext: false,
    hasPrevious: false
  });

  const [filters, setFilters] = useState({
    property_type: searchParams.get('property_type') || '',
    unit_type: searchParams.get('unit_type') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    bathrooms: searchParams.get('bathrooms') || '',
    amenities: searchParams.get('amenities')?.split(',').filter(Boolean) || [],
    facilities: searchParams.get('facilities')?.split(',').filter(Boolean) || [],
    location: searchParams.get('location') || '',
    available_from: searchParams.get('available_from') || '',
    available_to: searchParams.get('available_to') || '',
    sort: searchParams.get('sort') || 'created_at_desc'
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

  const extractPaginationData = (response) => {
    if (response?.pagination) {
      return {
        total: response.pagination.total || 0,
        totalPages: response.pagination.totalPages || 0,
        page: response.pagination.page || 1,
        limit: response.pagination.limit || 12,
        hasNext: response.pagination.hasNext || false,
        hasPrevious: response.pagination.hasPrevious || false
      };
    }
    
    const properties = response?.properties || [];
    return {
      total: properties.length,
      totalPages: 1,
      page: 1,
      limit: 12,
      hasNext: false,
      hasPrevious: false
    };
  };

  const extractProperties = (response) => {
    console.log('Raw API response:', response);
    
    let propertyData = [];
    
    if (response) {
      propertyData = response.results || 
                   response.properties || 
                   response.data || 
                   (Array.isArray(response) ? response : []);
    }
    
    const properties = Array.isArray(propertyData) ? propertyData : [];
    
    console.log('Extracted properties:', {
      count: properties.length,
      firstProperty: properties[0] || null
    });
    
    return properties;
  };

  const buildSearchParams = (page = currentPage) => {
    const params = {
      page: page,
      limit: itemsPerPage,
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

    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key];
      }
    });

    return params;
  };

  const updateURLParams = useCallback((page = currentPage) => {
    const params = new URLSearchParams();
    
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (page > 1) params.set('page', page.toString());
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        if (Array.isArray(value) && value.length > 0) {
          params.set(key, value.join(','));
        } else if (!Array.isArray(value)) {
          params.set(key, value);
        }
      }
    });

    setSearchParams(params);
  }, [searchQuery, filters, currentPage, setSearchParams]);

  const fetchProperties = async (page = 1) => {
    try {
      setLoading(true);
      setError('');

      const params = buildSearchParams(page);
      console.log('Fetching properties with params:', params);
      
      const response = await getAllPublicProperties(params);
      const propertyData = extractProperties(response);
      const pagination = extractPaginationData(response);

      setProperties(propertyData);
      setPaginationData(pagination);
      setCurrentPage(page);
      
      updateURLParams(page);

    } catch (error) {
      console.error('Error fetching properties:', error);
      setError(error.message || 'Failed to load properties. Please try again.');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchProperties(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    fetchProperties(1);
  };

  const handleSearch = useCallback(() => {
    setCurrentPage(1);
    fetchProperties(1);
  }, [searchQuery, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      return newFilters;
    });
    // Don't auto-search here, let user apply manually
  };

const countActiveFilters = useMemo(() => {
  let count = 0;
  Object.entries(filters).forEach(([key, value]) => {
    if (key === 'sort') return; // Skip sort as it's not a filter
    if (Array.isArray(value)) {
      count += value.length; // Count each item in arrays like amenities and facilities
    } else if (typeof value === 'string' && value.trim() !== '') {
      count += 1; // Count non-empty strings
    }
  });
  if (searchQuery.trim() !== '') count += 1; // Count non-empty search query
  console.log('countActiveFilters:', count); // Debug log to verify count
  return count;
}, [filters, searchQuery]);

useEffect(() => {
  setActiveFiltersCount(countActiveFilters);
}, [countActiveFilters]);

const clearAllFilters = () => {
  const resetFilters = {
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
  };
  setFilters(resetFilters);
  setSearchQuery('');
  setCurrentPage(1);
  setActiveFiltersCount(0); // Explicitly reset count
  setSearchParams({}); // Clear URL search params
  fetchProperties(1);
};

  const handlePropertyView = async (property) => {
    try {
      await recordPropertyView(property.id, {
        source: 'search_results',
        duration: null
      });
    } catch (error) {
      console.error('Error recording property view:', error);
    }
    navigate(`/user-property-view/${property.id}`);
  };

  console.log({countActiveFilters})

  useEffect(() => {
    fetchProperties(currentPage);
  }, []);

  const toggleAmenity = (amenity) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const toggleFacility = (facility) => {
    setFilters(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility]
    }));
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.textPrimary }}>
          Find Your Perfect Property
        </Typography>
        <Typography variant="body1" sx={{ color: theme.textSecondary, mb: 3 }}>
          Discover amazing properties that match your needs
        </Typography>

        <Paper sx={{ p: 3, mb: 3, bgcolor: theme.cardBackground, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              fullWidth
              placeholder="Search properties by location, type, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: theme.textSecondary }} />
                  </InputAdornment>
                ),
                sx: { bgcolor: theme.inputBackground }
              }}
              sx={{ flex: 1, minWidth: 300 }}
            />

            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
              sx={{
                bgcolor: theme.primary,
                '&:hover': { bgcolor: theme.primaryDark },
                minWidth: 120
              }}
            >
              Search
            </Button>

            <Badge badgeContent={activeFiltersCount} color="primary">
              <IconButton
                onClick={() => setFilterDrawerOpen(true)}
                sx={{
                  bgcolor: theme.cardBackground,
                  border: `1px solid ${theme.borderColor}`,
                  '&:hover': { bgcolor: theme.hoverBackground }
                }}
              >
                <FilterListIcon />
              </IconButton>
            </Badge>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={filters.sort}
                onChange={(e) => {
                  handleFilterChange('sort', e.target.value);
                  fetchProperties(1);
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

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
            <Button onClick={() => fetchProperties(currentPage)} sx={{ ml: 2 }}>
              Retry
            </Button>
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ color: theme.textPrimary }}>
            {paginationData.total > 0 
              ? `${paginationData.total} ${paginationData.total === 1 ? 'Property' : 'Properties'} Found` 
              : 'No Properties Found'
            }
          </Typography>
        </Box>

        {properties && properties.length > 0 ? (
          <>
            <PropertyGrid 
              properties={properties}
              onViewProperty={handlePropertyView}
              loading={loading}
              showActions={true}
              showMyProperties={false}
              variant="public"
              emptyStateMessage="No properties found"
              emptyStateSubtitle="Try adjusting your search criteria"
            />

            <Pagination
              currentPage={paginationData.page}
              totalPages={paginationData.totalPages}
              totalItems={paginationData.total}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              disabled={loading}
              itemsPerPageOptions={[12, 24, 36]}
              showInfo={true}
              showFirstLast={true}
            />
          </>
        ) : (
          !loading && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" sx={{ color: theme.textSecondary, mb: 2 }}>
                No properties found
              </Typography>
              <Typography variant="body1" sx={{ color: theme.textSecondary, mb: 3 }}>
                Try adjusting your search criteria or browse all properties
              </Typography>
              <Button
                variant="contained"
                onClick={clearAllFilters}
                sx={{
                  bgcolor: theme.primary,
                  '&:hover': { bgcolor: theme.primaryDark }
                }}
              >
                Clear All Filters
              </Button>
            </Box>
          )
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={60} />
          </Box>
        )}
      </Box>

      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 400 }, p: 3 }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Filters
          </Typography>
          <IconButton onClick={() => setFilterDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Property Type</InputLabel>
            <Select
              value={filters.property_type}
              onChange={(e) => handleFilterChange('property_type', e.target.value)}
              label="Property Type"
            >
              <MenuItem value="">All Types</MenuItem>
              {propertyTypes.map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Unit Type</InputLabel>
            <Select
              value={filters.unit_type}
              onChange={(e) => handleFilterChange('unit_type', e.target.value)}
              label="Unit Type"
            >
              <MenuItem value="">All Units</MenuItem>
              {unitTypes.map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Price Range (LKR)
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Min Price"
                type="number"
                value={filters.min_price}
                onChange={(e) => handleFilterChange('min_price', e.target.value)}
                fullWidth
              />
              <TextField
                label="Max Price"
                type="number"
                value={filters.max_price}
                onChange={(e) => handleFilterChange('max_price', e.target.value)}
                fullWidth
              />
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Amenities
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {commonAmenities.map(amenity => (
                <Chip
  key={amenity}
  label={amenity}
  onClick={() => toggleAmenity(amenity)}
  sx={{
    backgroundColor: filters.amenities.includes(amenity) ? theme.success : undefined,
    color: filters.amenities.includes(amenity) ? theme.successText : undefined,
  }}
  variant={filters.amenities.includes(amenity) ? 'filled' : 'outlined'}
  clickable
  size="small"
/>
              ))}
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Facilities
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {commonFacilities.map(facility => (
                <Chip
  key={facility}
  label={facility}
  onClick={() => toggleFacility(facility)}
  sx={{
    backgroundColor: filters.facilities.includes(facility) ? theme.success : undefined,
    color: filters.facilities.includes(facility) ? theme.successText : undefined,
  }}
  variant={filters.facilities.includes(facility) ? 'filled' : 'outlined'}
  clickable
  size="small"
/>
              ))}
            </Box>
          </Box>

          <Divider />

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
              onClick={() => {
                setFilterDrawerOpen(false);
                handleSearch();
              }}
              fullWidth
              sx={{
                bgcolor: theme.primary,
                '&:hover': { bgcolor: theme.primaryDark }
              }}
            >
              Apply Filters
            </Button>
          </Box>
        </Box>
      </Drawer>
    </Container>
  );
};

export default UserAllProperties;
