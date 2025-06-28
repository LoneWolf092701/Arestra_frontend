import React, { useEffect, useState } from 'react';
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
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import { getAllProperties } from '../../api/propertyApi';
import PropertyGrid from '../../components/common/PropertyGrid';
import { useTheme } from '../../contexts/ThemeContext';

const UserAllProperties = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendedProperties, setRecommendedProperties] = useState([]);
  const [properties, setProperties] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const { theme, isDark } = useTheme();
  
  // Filter states
  const [filters, setFilters] = useState({
    priceRange: [0, 100000],
    starRating: 0,
    availabilityDate: '',
    location: ''
  });

  // Applied filters for actual filtering
  const [appliedFilters, setAppliedFilters] = useState({
    priceRange: [0, 100000],
    starRating: 0,
    availabilityDate: '',
    location: ''
  });

  const propertyTypes = ['All', 'Apartment', 'Villa', 'Flat', 'Room'];

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await getAllProperties();
        setProperties(data);
        setRecommendedProperties(data.slice(0, 6)); // Top 6 properties for recommendations
      } catch (error) {
        console.error('Error fetching properties:', error);
      }
    };
    fetchProperties();
  }, []);

  const handleSearch = () => {
    console.log('Searching for properties with query:', searchQuery);
    // Implement search functionality here
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const applyFilters = () => {
    setAppliedFilters({ ...filters });
    setFilterDrawerOpen(false);
  };

  const clearFilters = () => {
    const defaultFilters = {
      priceRange: [0, 100000],
      starRating: 0,
      availabilityDate: '',
      location: ''
    };
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
  };

  const getFilteredPropertiesForTab = () => {
    const selectedType = propertyTypes[selectedTab];
    const typeFilter = selectedType === 'All' ? null : selectedType;
    return typeFilter;
  };

  return (
    <Box sx={{ 
      background: isDark 
        ? `linear-gradient(135deg, ${theme.background} 0%, ${theme.surfaceBackground} 50%, ${theme.background} 100%)`
        : `linear-gradient(135deg, ${theme.background} 0%, ${theme.primary}05 50%, ${theme.background} 100%)`,
      minHeight: '100vh',
      pt: 4
    }}>
      <Container maxWidth="lg">
        {/* Hero Search Section */}
        <Box sx={{ 
          textAlign: 'center',
          py: 6,
          mb: 4,
          background: isDark 
            ? `linear-gradient(135deg, ${theme.surfaceBackground} 0%, ${theme.cardBackground} 100%)`
            : `linear-gradient(135deg, ${theme.primary}10 0%, ${theme.secondary}05 100%)`,
          borderRadius: 3,
          border: `1px solid ${theme.border}`
        }}>
          <Typography variant="h4" gutterBottom sx={{ 
            color: theme.textPrimary, 
            fontWeight: 600,
            mb: 2
          }}>
            Find Your Perfect Place
          </Typography>
          
          <Typography variant="body1" sx={{ 
            color: theme.textSecondary, 
            mb: 4,
            maxWidth: 600,
            mx: 'auto'
          }}>
            Discover thousands of properties available for rent across Sri Lanka
          </Typography>

          {/* Property Type Tabs */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 1, 
            mb: 4,
            flexWrap: 'wrap'
          }}>
            {propertyTypes.map((type, index) => (
              <Button
                key={type}
                variant={selectedTab === index ? "contained" : "outlined"}
                onClick={() => setSelectedTab(index)}
                sx={{
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: selectedTab === index ? 600 : 500,
                  backgroundColor: selectedTab === index ? theme.primary : 'transparent',
                  borderColor: theme.primary,
                  color: selectedTab === index 
                    ? (isDark ? theme.textPrimary : '#FFFFFF') 
                    : theme.primary,
                  '&:hover': {
                    backgroundColor: selectedTab === index 
                      ? theme.secondary 
                      : `${theme.primary}10`,
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                {type}
              </Button>
            ))}
          </Box>

          {/* Search Bar */}
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            maxWidth: 600, 
            mx: 'auto',
            alignItems: 'center'
          }}>
            <TextField
              label="Search by location"
              variant="outlined"
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: theme.inputBackground,
                  '&:hover': {
                    backgroundColor: isDark ? theme.surfaceBackground : theme.inputBackground,
                  },
                },
              }}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={handleSearch} sx={{ color: theme.primary }}>
                    <SearchIcon />
                  </IconButton>
                ),
              }}
            />
            
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setFilterDrawerOpen(true)}
              sx={{
                borderColor: theme.primary,
                color: theme.primary,
                '&:hover': {
                  backgroundColor: `${theme.primary}10`,
                },
                py: 1.8,
                px: 3,
                whiteSpace: 'nowrap'
              }}
            >
              Filters
            </Button>
          </Box>
        </Box>

        {/* Recommended Properties Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" gutterBottom sx={{ 
            color: theme.textPrimary, 
            fontWeight: 600,
            mb: 3
          }}>
            Latest Listings
          </Typography>
          <PropertyGrid 
            isUserPage={true} 
            limit={6} 
            filters={null}
            appliedFilters={appliedFilters}
          />
        </Box>

        {/* All Listings Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ 
            color: theme.textPrimary, 
            fontWeight: 600,
            mb: 3
          }}>
            All Listings
          </Typography>
          <PropertyGrid 
            isUserPage={true} 
            filters={getFilteredPropertiesForTab()}
            appliedFilters={appliedFilters}
          />
        </Box>

        {/* Filter Drawer */}
        <Drawer
          anchor="right"
          open={filterDrawerOpen}
          onClose={() => setFilterDrawerOpen(false)}
          PaperProps={{
            sx: {
              width: 350,
              backgroundColor: theme.cardBackground,
              color: theme.textPrimary
            }
          }}
        >
          <Box sx={{ p: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 3 
            }}>
              <Typography variant="h6" sx={{ color: theme.textPrimary, fontWeight: 600 }}>
                Filters
              </Typography>
              <IconButton 
                onClick={() => setFilterDrawerOpen(false)}
                sx={{ color: theme.textSecondary }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Price Range Filter */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ color: theme.textPrimary }}>
                Price Range (LKR)
              </Typography>
              <Slider
                value={filters.priceRange}
                onChange={(event, newValue) => handleFilterChange('priceRange', newValue)}
                valueLabelDisplay="auto"
                min={0}
                max={100000}
                step={5000}
                sx={{
                  color: theme.primary,
                  '& .MuiSlider-thumb': {
                    backgroundColor: theme.primary,
                  },
                  '& .MuiSlider-track': {
                    backgroundColor: theme.primary,
                  },
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                  LKR {filters.priceRange[0].toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                  LKR {filters.priceRange[1].toLocaleString()}
                </Typography>
              </Box>
            </Box>

            {/* Star Rating Filter */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ color: theme.textPrimary }}>
                Minimum Rating
              </Typography>
              <Rating
                value={filters.starRating}
                onChange={(event, newValue) => handleFilterChange('starRating', newValue || 0)}
                sx={{
                  '& .MuiRating-iconFilled': {
                    color: theme.accent,
                  },
                }}
              />
            </Box>

            {/* Availability Date Filter */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ color: theme.textPrimary }}>
                Available From
              </Typography>
              <TextField
                type="date"
                fullWidth
                value={filters.availabilityDate}
                onChange={(e) => handleFilterChange('availabilityDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: theme.inputBackground,
                  },
                }}
              />
            </Box>

            {/* Location Filter */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ color: theme.textPrimary }}>
                Location
              </Typography>
              <FormControl fullWidth>
                <InputLabel sx={{ color: theme.textSecondary }}>Select Location</InputLabel>
                <Select
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  sx={{
                    backgroundColor: theme.inputBackground,
                    '& .MuiSelect-select': {
                      color: theme.textPrimary,
                    },
                  }}
                >
                  <MenuItem value="">All Locations</MenuItem>
                  <MenuItem value="colombo">Colombo</MenuItem>
                  <MenuItem value="kandy">Kandy</MenuItem>
                  <MenuItem value="galle">Galle</MenuItem>
                  <MenuItem value="jaffna">Jaffna</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={clearFilters}
                sx={{
                  borderColor: theme.textSecondary,
                  color: theme.textSecondary,
                  '&:hover': {
                    backgroundColor: `${theme.textSecondary}10`,
                  },
                }}
              >
                Clear All
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={applyFilters}
                sx={{
                  backgroundColor: theme.primary,
                  color: isDark ? theme.textPrimary : '#FFFFFF',
                  '&:hover': {
                    backgroundColor: theme.secondary,
                  },
                }}
              >
                Apply Filters
              </Button>
            </Box>
          </Box>
        </Drawer>
      </Container>
    </Box>
  );
};

export default UserAllProperties;