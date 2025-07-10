import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import HotelIcon from '@mui/icons-material/Hotel';
import BathtubIcon from '@mui/icons-material/Bathtub';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import { getApprovedProperties, removeProperty } from '../../api/adminAPI';
import AppSnackbar from '../../components/common/AppSnackbar';

// when the database contains malformed JSON data
const safeParse = (str) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    return [];
  }
};

// Component for the property removal confirmation dialog
const RemovePropertyDialog = ({ open, onClose, property, onConfirm }) => {
  const [removalReason, setRemovalReason] = useState('');

  const handleConfirm = () => {
    if (removalReason.trim()) {
      onConfirm(property.id, removalReason);
      onClose();
      setRemovalReason('');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Remove Property Listing
      </DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          This will hide the property from users and notify the property owner.
        </Alert>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Property: <strong>{property?.property_type} - {property?.unit_type}</strong>
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Reason for Removal"
          value={removalReason}
          onChange={(e) => setRemovalReason(e.target.value)}
          placeholder="Please provide a clear reason for removing this property..."
          required
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleConfirm} 
          color="error" 
          variant="contained"
          disabled={!removalReason.trim()}
        >
          Remove Property
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const AdminAllProperties = () => {
  // State management for the component
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Effect hook to fetch data when component mounts
  useEffect(() => {
    fetchApprovedProperties();
  }, []);

  // Effect hook to handle filtering when search or filter criteria change
  useEffect(() => {
    let filtered = properties;

    // Apply text search filter
    if (searchTerm) {
      filtered = filtered.filter(property =>
        property.property_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.unit_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply property type filter
    if (propertyTypeFilter) {
      filtered = filtered.filter(property => property.property_type === propertyTypeFilter);
    }

    setFilteredProperties(filtered);
  }, [properties, searchTerm, propertyTypeFilter]);

  // Function to fetch approved properties from the server
  const fetchApprovedProperties = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const data = await getApprovedProperties(token);
      setProperties(data);
      setFilteredProperties(data);
    } catch (error) {
      console.error('Error fetching approved properties:', error);
      setSnackbarMessage('Error fetching properties');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle property removal
  const handleRemoveProperty = async (propertyId, reason) => {
    try {
      const token = localStorage.getItem('token');
      await removeProperty(propertyId, reason, token);
      setSnackbarMessage('Property removed successfully');
      setSnackbarOpen(true);
      
      // Update the local state to reflect the change immediately
      setProperties(prev => prev.filter(p => p.id !== propertyId));
    } catch (error) {
      console.error('Error removing property:', error);
      setSnackbarMessage('Error removing property');
      setSnackbarOpen(true);
    }
  };

  // Function to open the removal confirmation dialog
  const handleRemoveClick = (property) => {
    setSelectedProperty(property);
    setRemoveDialogOpen(true);
  };

  // Helper function to format dates for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Get unique property types for the filter dropdown
  const uniquePropertyTypes = [...new Set(properties.map(p => p.property_type))];

  // Loading state display
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <Typography variant="h6">Loading approved properties...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumb navigation for user orientation */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Home / All Properties
      </Typography>

      <Typography variant="h4" align="center" gutterBottom>
        All Listings
      </Typography>
      
      <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
        Manage all approved properties currently visible to users
      </Typography>

      {/* Search and Filter Controls */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search by text */}
        <TextField
          label="Search properties"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by type, location, or address..."
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
          }}
          sx={{ flexGrow: 1, minWidth: 250 }}
        />

        {/* Filter by property type */}
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Property Type</InputLabel>
          <Select
            value={propertyTypeFilter}
            onChange={(e) => setPropertyTypeFilter(e.target.value)}
            label="Property Type"
            startAdornment={<FilterListIcon sx={{ mr: 1, color: 'action.active' }} />}
          >
            <MenuItem value="">All Types</MenuItem>
            {uniquePropertyTypes.map(type => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Clear filters button */}
        {(searchTerm || propertyTypeFilter) && (
          <Button 
            variant="outlined" 
            onClick={() => {
              setSearchTerm('');
              setPropertyTypeFilter('');
            }}
          >
            Clear Filters
          </Button>
        )}
      </Box>

      {/* Results summary */}
      <Typography variant="h6" sx={{ mb: 3 }}>
        {filteredProperties.length} Properties
        {(searchTerm || propertyTypeFilter) && ` (filtered from ${properties.length} total)`}
      </Typography>

      {/* Properties grid display */}
      {filteredProperties.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography variant="h6" color="text.secondary">
            {properties.length === 0 ? 'No approved properties found' : 'No properties match your filters'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {properties.length === 0 
              ? 'Properties will appear here once they are approved' 
              : 'Try adjusting your search criteria'
            }
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredProperties.map((property) => {
            // Parse JSON data safely for each property
            const amenities = safeParse(property.amenities);
            const facilities = safeParse(property.facilities);
            const priceRange = safeParse(property.price_range);

            return (
              <Grid item xs={12} sm={6} md={4} key={property.id}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}>
                  <CardMedia
                    component="img"
                    height="140"
                    // image={property.image || 'https://via.placeholder.com/300x200'}
                    alt={property.property_type}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="h6" component="div">
                        {property.property_type}
                      </Typography>
                      <Chip label="Active" color="success" size="small" />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {property.unit_type}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Address:</strong> {property.address?.substring(0, 50)}
                      {property.address?.length > 50 && '...'}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Available:</strong> {formatDate(property.available_from)} – {formatDate(property.available_to)}
                    </Typography>
                    
                    {priceRange?.length === 2 && (
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Price:</strong> LKR {priceRange[0]} - {priceRange[1]}
                      </Typography>
                    )}

                    {/* Property statistics display */}
                    <Box display="flex" justifyContent="space-around" mt={2}>
                      <Box display="flex" alignItems="center">
                        <HotelIcon fontSize="small" />
                        <Typography variant="body2" ml={0.5}>
                          {facilities?.Bedroom || 0}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <BathtubIcon fontSize="small" />
                        <Typography variant="body2" ml={0.5}>
                          {facilities?.Bathroom || 0}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <Typography variant="body2">
                          {amenities?.length || 0} amenities
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                  
                  <CardActions>
                    <Button 
                      size="small" 
                      color="primary" 
                      startIcon={<VisibilityIcon />}
                      onClick={() => window.open(`/user-viewproperty/${property.id}`, '_blank')}
                    >
                      View
                    </Button>
                    <Button 
                      size="small" 
                      color="error" 
                      startIcon={<RemoveCircleIcon />}
                      onClick={() => handleRemoveClick(property)}
                    >
                      Remove
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Property removal confirmation dialog */}
      <RemovePropertyDialog
        open={removeDialogOpen}
        onClose={() => setRemoveDialogOpen(false)}
        property={selectedProperty}
        onConfirm={handleRemoveProperty}
      />

      {/* Notification snackbar */}
      <AppSnackbar
        open={snackbarOpen}
        message={snackbarMessage}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
      />
    </Container>
  );
};

export default AdminAllProperties;