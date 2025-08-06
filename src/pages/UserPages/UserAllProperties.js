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
  const [enrichedProperties, setEnrichedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enriching, setEnriching] = useState(false);
  
  const [selectedTab, setSelectedTab] = useState(0);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  
  const { theme, isDark } = useTheme();
  const navigate = useNavigate();
  
  const [filters, setFilters] = useState({
    priceRange: [0, 200000],
    minRating: 0,
    availabilityDate: '',
    location: '',
    bedrooms: 0,
    bathrooms: 0,
    amenities: [],
    isAvailable: true,
    approvalStatus: 'approved',
    showPending: false,
    minViews: 0,
    hasImages: false
  });

  const [appliedFilters, setAppliedFilters] = useState({
    priceRange: [0, 200000],
    minRating: 0,
    availabilityDate: '',
    location: '',
    bedrooms: 0,
    bathrooms: 0,
    amenities: [],
    isAvailable: true,
    approvalStatus: 'approved',
    showPending: false,
    minViews: 0,
    hasImages: false
  });

  const propertyTypes = ['All', 'Apartment', 'Villa', 'Flat', 'Room', 'House', 'Condo'];
  
  const sortOptions = [
    { value: 'created_at', label: 'Newest First' },
    { value: 'price', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'views_count', label: 'Most Viewed' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'updated_at', label: 'Recently Updated' },
    { value: 'available_from', label: 'Available Soon' }
  ];

  const availableAmenities = [
    'WiFi', 'Air Conditioning', 'Heating', 'TV', 'Kitchen', 'Refrigerator',
    'Washing Machine', 'Dryer', 'Dishwasher', 'Microwave', 'Coffee Maker',
    'Iron', 'Hair Dryer', 'Towels', 'Bed Linens', 'Parking', 'Gym',
    'Swimming Pool', 'Security', 'Elevator', 'Balcony', 'Garden', 'Pet Friendly',
    'Furnished', 'Utilities Included', 'Internet Included', 'Cable TV'
  ];

  const approvalStatusOptions = [
    { value: 'approved', label: 'Approved Properties' },
    { value: 'pending', label: 'Pending Approval' },
    { value: 'all', label: 'All Statuses' }
  ];

  useEffect(() => {
    fetchProperties();
  }, [appliedFilters, sortBy, sortOrder, selectedTab]);

  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl && searchFromUrl !== searchQuery) {
      setSearchQuery(searchFromUrl);
      handleSearch(searchFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    if (properties.length > 0) {
      enrichPropertiesWithInteractionData();
    }
  }, [properties]);

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = {
        page: 1,
        limit: 100,
        sortBy: sortBy === 'price_desc' ? 'price' : sortBy,
        sortOrder: sortBy === 'price_desc' ? 'desc' : sortOrder,
        includeInactive: appliedFilters.showPending,
        includeDetails: true,
        includeOwnerInfo: true,
        includeStats: true,
        ...appliedFilters
      };

      if (selectedTab > 0) {
        queryParams.property_type = propertyTypes[selectedTab];
      }

      if (searchQuery.trim()) {
        queryParams.search = searchQuery.trim();
      }

      if (appliedFilters.approvalStatus !== 'all') {
        queryParams.approval_status = appliedFilters.approvalStatus;
      }

      if (appliedFilters.minViews > 0) {
        queryParams.min_views = appliedFilters.minViews;
      }

      if (appliedFilters.hasImages) {
        queryParams.has_images = true;
      }

      if (appliedFilters.amenities.length > 0) {
        queryParams.amenities = appliedFilters.amenities.join(',');
      }

      const response = await getAllPublicProperties(queryParams);
      const propertyList = Array.isArray(response) ? response : response.properties || [];
      
      setProperties(propertyList);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError('Failed to load properties. Please try again.');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, sortBy, sortOrder, selectedTab, searchQuery]);

  const enrichPropertiesWithInteractionData = useCallback(async () => {
    if (!properties.length) return;
    
    setEnriching(true);
    try {
      const enrichmentPromises = properties.map(async (property) => {
        try {
          const [ratingData, favoriteStatus] = await Promise.all([
            getPropertyRating(property.id).catch(() => ({ average_rating: 0, total_ratings: 0 })),
            checkFavoriteStatus(property.id).catch(() => false)
          ]);

          return {
            ...property,
            enriched_rating: ratingData.average_rating || 0,
            enriched_rating_count: ratingData.total_ratings || 0,
            enriched_is_favorite: favoriteStatus,
            enriched_view_count: property.views_count || property.view_count || 0,
            enriched_approval_status: property.approval_status || 'unknown',
            enriched_is_active: property.is_active !== false,
            enriched_available_from: property.available_from,
            enriched_available_to: property.available_to,
            enriched_owner_name: property.owner_username || property.owner_name || 'Unknown Owner',
            enriched_created_at: property.created_at,
            enriched_updated_at: property.updated_at,
            enriched_image_count: (property.images && Array.isArray(property.images)) ? property.images.length : 0,
            enriched_amenities: property.amenities || property.facilities || [],
            enriched_property_details: {
              bedrooms: property.bedrooms || property.bedroom_count || 0,
              bathrooms: property.bathrooms || property.bathroom_count || 0,
              square_feet: property.square_feet || property.area || null,
              furnished: property.furnished || false,
              parking: property.parking || false,
              pet_friendly: property.pet_friendly || false,
              utilities_included: property.utilities_included || false
            }
          };
        } catch (error) {
          console.error(`Error enriching property ${property.id}:`, error);
          return {
            ...property,
            enriched_rating: 0,
            enriched_rating_count: 0,
            enriched_is_favorite: false,
            enriched_view_count: property.views_count || 0,
            enriched_approval_status: property.approval_status || 'approved',
            enriched_is_active: property.is_active !== false,
            enriched_image_count: 0,
            enriched_amenities: [],
            enriched_property_details: {}
          };
        }
      });

      const enriched = await Promise.all(enrichmentPromises);
      setEnrichedProperties(enriched);
    } catch (error) {
      console.error('Error enriching properties:', error);
      setEnrichedProperties(properties);
    } finally {
      setEnriching(false);
    }
  }, [properties]);

  const handleSearch = useCallback((query = searchQuery) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (query.trim()) {
      newSearchParams.set('search', query.trim());
    } else {
      newSearchParams.delete('search');
    }
    setSearchParams(newSearchParams);
    fetchProperties();
  }, [searchQuery, searchParams, setSearchParams, fetchProperties]);

  const handlePropertyView = async (property) => {
    try {
      await recordPropertyView(property.id, { 
        duration: null,
        source: 'property_list',
        user_location: null 
      });
      navigate(`/user-property-view/${property.id}`);
    } catch (error) {
      console.error('Error recording property view:', error);
      navigate(`/user-property-view/${property.id}`);
    }
  };

  const applyFilters = () => {
    setAppliedFilters({ ...filters });
    setFilterDrawerOpen(false);
  };

  const clearFilters = () => {
    const defaultFilters = {
      priceRange: [0, 200000],
      minRating: 0,
      availabilityDate: '',
      location: '',
      bedrooms: 0,
      bathrooms: 0,
      amenities: [],
      isAvailable: true,
      approvalStatus: 'approved',
      showPending: false,
      minViews: 0,
      hasImages: false
    };
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setFilterDrawerOpen(false);
  };

  const filteredAndSortedProperties = useMemo(() => {
    let filtered = [...enrichedProperties];

    if (appliedFilters.minRating > 0) {
      filtered = filtered.filter(p => p.enriched_rating >= appliedFilters.minRating);
    }

    if (appliedFilters.minViews > 0) {
      filtered = filtered.filter(p => p.enriched_view_count >= appliedFilters.minViews);
    }

    if (appliedFilters.hasImages) {
      filtered = filtered.filter(p => p.enriched_image_count > 0);
    }

    if (!appliedFilters.showPending) {
      filtered = filtered.filter(p => p.enriched_is_active && p.enriched_approval_status === 'approved');
    }

    return filtered;
  }, [enrichedProperties, appliedFilters]);

  const renderPropertyCard = (property) => {
    const statusColor = property.enriched_approval_status === 'approved' ? 'success' : 
                       property.enriched_approval_status === 'pending' ? 'warning' : 'error';
    
    return (
      <Card 
        key={property.id} 
        sx={{ 
          mb: 2, 
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[8]
          }
        }}
        onClick={() => handlePropertyView(property)}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
              {property.property_type} - {property.unit_type}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
              <Chip
                icon={statusColor === 'approved' ? <CheckCircleIcon /> : <PendingIcon />}
                label={property.enriched_approval_status}
                color={statusColor}
                size="small"
              />
              {property.enriched_is_favorite && (
                <Chip label="Favorite" color="primary" size="small" />
              )}
            </Box>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {property.address}
          </Typography>

          <Typography variant="h5" color="primary" sx={{ mb: 2, fontWeight: 700 }}>
            LKR {property.price?.toLocaleString()} /month
          </Typography>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <Typography variant="body2">
                <strong>Bedrooms:</strong> {property.enriched_property_details.bedrooms || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">
                <strong>Bathrooms:</strong> {property.enriched_property_details.bathrooms || 'N/A'}
              </Typography>
            </Grid>
            {property.enriched_property_details.square_feet && (
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Area:</strong> {property.enriched_property_details.square_feet} sq ft
                </Typography>
              </Grid>
            )}
            <Grid item xs={6}>
              <Typography variant="body2">
                <strong>Owner:</strong> {property.enriched_owner_name}
              </Typography>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Rating value={property.enriched_rating} precision={0.1} readOnly size="small" />
              <Typography variant="body2" color="text.secondary">
                ({property.enriched_rating_count})
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <VisibilityIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {property.enriched_view_count} views
              </Typography>
            </Box>
            {property.enriched_image_count > 0 && (
              <Chip label={`${property.enriched_image_count} photos`} size="small" variant="outlined" />
            )}
          </Box>

          {property.enriched_amenities.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                Amenities:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {property.enriched_amenities.slice(0, 4).map((amenity, index) => (
                  <Chip key={index} label={amenity} size="small" variant="outlined" />
                ))}
                {property.enriched_amenities.length > 4 && (
                  <Chip label={`+${property.enriched_amenities.length - 4} more`} size="small" />
                )}
              </Box>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Available: {property.enriched_available_from ? 
                new Date(property.enriched_available_from).toLocaleDateString() : 'Now'}
              {property.enriched_available_to && 
                ` - ${new Date(property.enriched_available_to).toLocaleDateString()}`}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Listed: {new Date(property.enriched_created_at).toLocaleDateString()}
            </Typography>
          </Box>

          {property.enriched_property_details.furnished && (
            <Box sx={{ mt: 1 }}>
              <Chip label="Furnished" color="primary" size="small" />
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderFilterDrawer = () => (
    <Drawer
      anchor="right"
      open={filterDrawerOpen}
      onClose={() => setFilterDrawerOpen(false)}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 400 }, p: 2 }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Filters</Typography>
        <IconButton onClick={() => setFilterDrawerOpen(false)}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography gutterBottom>Price Range (LKR)</Typography>
        <Slider
          value={filters.priceRange}
          onChange={(e, newValue) => setFilters(prev => ({ ...prev, priceRange: newValue }))}
          valueLabelDisplay="auto"
          min={0}
          max={500000}
          step={5000}
          valueLabelFormat={(value) => `LKR ${value.toLocaleString()}`}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="caption">LKR {filters.priceRange[0].toLocaleString()}</Typography>
          <Typography variant="caption">LKR {filters.priceRange[1].toLocaleString()}</Typography>
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography gutterBottom>Minimum Rating</Typography>
        <Rating
          value={filters.minRating}
          onChange={(e, newValue) => setFilters(prev => ({ ...prev, minRating: newValue || 0 }))}
          precision={0.5}
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography gutterBottom>Minimum Views</Typography>
        <Slider
          value={filters.minViews}
          onChange={(e, newValue) => setFilters(prev => ({ ...prev, minViews: newValue }))}
          valueLabelDisplay="auto"
          min={0}
          max={1000}
          step={10}
        />
      </Box>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Approval Status</InputLabel>
        <Select
          value={filters.approvalStatus}
          label="Approval Status"
          onChange={(e) => setFilters(prev => ({ ...prev, approvalStatus: e.target.value }))}
        >
          {approvalStatusOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControlLabel
        control={
          <Switch
            checked={filters.hasImages}
            onChange={(e) => setFilters(prev => ({ ...prev, hasImages: e.target.checked }))}
          />
        }
        label="Has Images Only"
        sx={{ mb: 2 }}
      />

      <FormControlLabel
        control={
          <Switch
            checked={filters.showPending}
            onChange={(e) => setFilters(prev => ({ ...prev, showPending: e.target.checked }))}
          />
        }
        label="Show Pending Properties"
        sx={{ mb: 3 }}
      />

      <Box sx={{ mb: 3 }}>
        <Typography gutterBottom>Amenities</Typography>
        <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
          {availableAmenities.map((amenity) => (
            <FormControlLabel
              key={amenity}
              control={
                <Switch
                  checked={filters.amenities.includes(amenity)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFilters(prev => ({ 
                        ...prev, 
                        amenities: [...prev.amenities, amenity] 
                      }));
                    } else {
                      setFilters(prev => ({ 
                        ...prev, 
                        amenities: prev.amenities.filter(a => a !== amenity) 
                      }));
                    }
                  }}
                  size="small"
                />
              }
              label={amenity}
              sx={{ display: 'block', mb: 0.5 }}
            />
          ))}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Button onClick={clearFilters} variant="outlined" fullWidth>
          Clear All
        </Button>
        <Button onClick={applyFilters} variant="contained" fullWidth>
          Apply Filters
        </Button>
      </Box>
    </Drawer>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
        All Properties
        {enrichedProperties.length > 0 && (
          <Typography component="span" variant="h6" color="text.secondary" sx={{ ml: 2 }}>
            ({enrichedProperties.length} properties)
          </Typography>
        )}
      </Typography>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search properties by location, type, or features..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton onClick={() => setSearchQuery('')} size="small">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(e, newValue) => setSelectedTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {propertyTypes.map((type, index) => (
            <Tab key={type} label={type} />
          ))}
        </Tabs>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            label="Sort By"
            onChange={(e) => setSortBy(e.target.value)}
            startAdornment={<SortIcon fontSize="small" />}
          >
            {sortOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={() => setFilterDrawerOpen(true)}
          sx={{ minWidth: 120 }}
        >
          Filters
          {Object.values(appliedFilters).some(value => 
            Array.isArray(value) ? value.length > 0 : 
            typeof value === 'boolean' ? value : 
            value !== '' && value !== 0 && value !== 'approved'
          ) && <Badge color="primary" variant="dot" sx={{ ml: 1 }} />}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {enriching && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Loading additional property data...
          </Typography>
        </Box>
      )}

      {filteredAndSortedProperties.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No properties found matching your criteria
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Try adjusting your filters or search terms
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredAndSortedProperties.map((property) => (
            <Grid item xs={12} md={6} lg={4} key={property.id}>
              {renderPropertyCard(property)}
            </Grid>
          ))}
        </Grid>
      )}

      {renderFilterDrawer()}
    </Container>
  );
};

export default UserAllProperties;