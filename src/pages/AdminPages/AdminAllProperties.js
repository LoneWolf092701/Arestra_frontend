import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Rating
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import HotelIcon from '@mui/icons-material/Hotel';
import BathtubIcon from '@mui/icons-material/Bathtub';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useNavigate } from 'react-router-dom';
import { getApprovedProperties, removeProperty } from '../../api/adminAPI';
import AppSnackbar from '../../components/common/AppSnackbar';
import Room from '../../assets/images/Room.jpg';

const safeParse = (str) => {
  try {
    return typeof str === 'string' ? JSON.parse(str) : (str || []);
  } catch (error) {
    return [];
  }
};

const RemovePropertyDialog = ({ open, onClose, property, onConfirm }) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(property.id, reason);
      setReason('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Remove Property</DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Are you sure you want to remove this property?
        </Typography>
        {property && (
          <Box sx={{ mb: 2, p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              {property.property_type} - {property.unit_type}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {property.address}
            </Typography>
          </Box>
        )}
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Reason for removal"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Please provide a reason for removing this property..."
          required
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleConfirm} 
          color="error" 
          variant="contained"
          disabled={!reason.trim()}
        >
          Remove Property
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const AdminAllProperties = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('');
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const navigate = useNavigate();

  const uniquePropertyTypes = React.useMemo(() => {
    const types = properties.map(property => property.property_type).filter(Boolean);
    return [...new Set(types)].sort();
  }, [properties]);

  useEffect(() => {
    fetchApprovedProperties();
  }, []);

  useEffect(() => {
    let filtered = properties;

    if (searchTerm) {
      filtered = filtered.filter(property =>
        property.property_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.unit_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (propertyTypeFilter) {
      filtered = filtered.filter(property => property.property_type === propertyTypeFilter);
    }

    setFilteredProperties(filtered);
  }, [properties, searchTerm, propertyTypeFilter]);

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

  const handleRemoveProperty = async (propertyId, reason) => {
    try {
      const token = localStorage.getItem('token');
      await removeProperty(propertyId, reason, token);
      setSnackbarMessage('Property removed successfully');
      setSnackbarOpen(true);
      
      setProperties(prev => prev.filter(p => p.id !== propertyId));
      setFilteredProperties(prev => prev.filter(p => p.id !== propertyId));
    } catch (error) {
      console.error('Error removing property:', error);
      setSnackbarMessage('Error removing property');
      setSnackbarOpen(true);
    }
  };

  const handleRemoveClick = (property) => {
    setSelectedProperty(property);
    setRemoveDialogOpen(true);
  };

  const handleViewProperty = (propertyId) => {
    navigate(`/property/${propertyId}`);
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        All Properties Management
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage all approved properties in the system. You can view details and remove properties if necessary.
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
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

      <Typography variant="h6" sx={{ mb: 3 }}>
        {filteredProperties.length} Properties
        {(searchTerm || propertyTypeFilter) && ` (filtered from ${properties.length} total)`}
      </Typography>

      {loading ? (
        <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
          Loading properties...
        </Typography>
      ) : filteredProperties.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography variant="h6" color="text.secondary">
            {properties.length === 0 ? 'No approved properties found' : 'No properties match your filters'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {properties.length === 0 
              ? 'Properties will appear here once they are approved' 
              : 'Try adjusting your search or filter criteria'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredProperties.map((property) => {
            const amenities = safeParse(property.amenities);
            const facilities = safeParse(property.facilities);
            const images = safeParse(property.images);
            const primaryImage = images && images.length > 0 ? images[0] : Room;

            return (
              <Grid item xs={12} sm={6} md={4} key={property.id}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  }
                }}>
                  <CardMedia
                    component="img"
                    height="180"
                    image={primaryImage}
                    alt={property.property_type}
                    sx={{ objectFit: 'cover' }}
                  />
                  
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {property.property_type}
                      </Typography>
                      <Chip 
                        label={property.status || 'Active'} 
                        color="success" 
                        size="small" 
                      />
                    </Box>

                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      {property.unit_type}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOnIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {property.address}
                      </Typography>
                    </Box>

                    {property.rating && parseFloat(property.rating) > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Rating value={parseFloat(property.rating)} precision={0.1} size="small" readOnly />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          ({property.total_ratings || 0} reviews)
                        </Typography>
                      </Box>
                    )}

                    <Typography variant="h6" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
                      LKR {parseFloat(property.price || 0).toLocaleString()}/month
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                      <Box display="flex" alignItems="center">
                        <HotelIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {facilities?.Bedroom || facilities?.bedroom || 0}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <BathtubIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {facilities?.Bathroom || facilities?.bathroom || 0}
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
                      onClick={() => handleViewProperty(property.id)}
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

      <RemovePropertyDialog
        open={removeDialogOpen}
        onClose={() => setRemoveDialogOpen(false)}
        property={selectedProperty}
        onConfirm={handleRemoveProperty}
      />

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