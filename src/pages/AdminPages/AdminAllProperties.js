import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Button,
  TextField,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  RemoveCircle as RemoveCircleIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  LocationOn as LocationOnIcon,
  Bed as BedIcon,
  Bathtub as BathtubIcon,
  Star as StarIcon,
  ViewInAr as ViewsIcon
} from '@mui/icons-material';

import { getAllPropertiesAdmin, deletePropertyAdmin } from '../../api/adminAPI';
import AppSnackbar from '../../components/common/AppSnackbar';
import Room from '../../assets/images/Room.jpg';

const safeParse = (jsonString, fallback = []) => {
  try {
    if (typeof jsonString === 'string') {
      return JSON.parse(jsonString);
    }
    return Array.isArray(jsonString) ? jsonString : fallback;
  } catch (error) {
    console.warn('Error parsing JSON:', error);
    return fallback;
  }
};

const RemovePropertyDialog = ({ open, onClose, property, onConfirm }) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (reason.trim() && property) {
      onConfirm(property.id, reason.trim());
      setReason('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Remove Property</DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Are you sure you want to remove this property? This action cannot be undone.
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
  const [approvalStatusFilter, setApprovalStatusFilter] = useState('all');
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [stats, setStats] = useState({});
  
  const navigate = useNavigate();

  const uniquePropertyTypes = React.useMemo(() => {
    if (!Array.isArray(properties)) return [];
    const types = properties.map(property => property.property_type).filter(Boolean);
    return [...new Set(types)].sort();
  }, [properties]);

  useEffect(() => {
    fetchAllProperties();
  }, []);

  useEffect(() => {
    if (!Array.isArray(properties)) {
      setFilteredProperties([]);
      return;
    }

    let filtered = [...properties];

    if (searchTerm) {
      filtered = filtered.filter(property =>
        property.property_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.unit_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.owner_info?.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (propertyTypeFilter) {
      filtered = filtered.filter(property => property.property_type === propertyTypeFilter);
    }

    if (approvalStatusFilter && approvalStatusFilter !== 'all') {
      filtered = filtered.filter(property => property.approval_status === approvalStatusFilter);
    }

    setFilteredProperties(filtered);
  }, [properties, searchTerm, propertyTypeFilter, approvalStatusFilter]);

  const fetchAllProperties = async () => {
    setLoading(true);
    try {
      const response = await getAllPropertiesAdmin({
        page: 1,
        limit: 100,
        status: 'all',
        approval_status: 'all'
      });
      
      // Ensure we extract the properties array from the response
      const propertiesData = response?.properties || [];
      const statsData = response?.stats || {};
      
      setProperties(Array.isArray(propertiesData) ? propertiesData : []);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setSnackbarMessage('Error fetching properties');
      setSnackbarOpen(true);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveProperty = async (propertyId, reason) => {
    try {
      await deletePropertyAdmin(propertyId, reason);
      setSnackbarMessage('Property removed successfully');
      setSnackbarOpen(true);
      
      // Remove from local state
      setProperties(prev => Array.isArray(prev) ? prev.filter(p => p.id !== propertyId) : []);
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
    navigate(`/admin/property/${propertyId}`);
  };

  const getStatusColor = (approvalStatus) => {
    switch (approvalStatus) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        All Properties Management
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage all properties in the system. You can view details, approve/reject, and remove properties.
      </Typography>

      {/* Stats Summary */}
      {stats && Object.keys(stats).length > 0 && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h4" color="primary">{stats.total || 0}</Typography>
              <Typography variant="body2">Total</Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h4" color="warning.main">{stats.pending || 0}</Typography>
              <Typography variant="body2">Pending</Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h4" color="success.main">{stats.approved || 0}</Typography>
              <Typography variant="body2">Approved</Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h4" color="error.main">{stats.rejected || 0}</Typography>
              <Typography variant="body2">Rejected</Typography>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          label="Search properties"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by type, location, address, or owner..."
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
          }}
          sx={{ flexGrow: 1, minWidth: 250 }}
        />

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Property Type</InputLabel>
          <Select
            value={propertyTypeFilter}
            onChange={(e) => setPropertyTypeFilter(e.target.value)}
            label="Property Type"
          >
            <MenuItem value="">All Types</MenuItem>
            {uniquePropertyTypes.map(type => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={approvalStatusFilter}
            onChange={(e) => setApprovalStatusFilter(e.target.value)}
            label="Status"
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>

        {(searchTerm || propertyTypeFilter || approvalStatusFilter !== 'all') && (
          <Button 
            variant="outlined" 
            onClick={() => {
              setSearchTerm('');
              setPropertyTypeFilter('');
              setApprovalStatusFilter('all');
            }}
          >
            Clear Filters
          </Button>
        )}
      </Box>

      <Typography variant="h6" sx={{ mb: 3 }}>
        {Array.isArray(filteredProperties) ? filteredProperties.length : 0} Properties
        {(searchTerm || propertyTypeFilter || approvalStatusFilter !== 'all') && 
          ` (filtered from ${Array.isArray(properties) ? properties.length : 0} total)`}
      </Typography>

      {loading ? (
        <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
          Loading properties...
        </Typography>
      ) : !Array.isArray(filteredProperties) || filteredProperties.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography variant="h6" color="text.secondary">
            {!Array.isArray(properties) || properties.length === 0 ? 'No properties found' : 'No properties match your filters'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {!Array.isArray(properties) || properties.length === 0 
              ? 'Properties will appear here when they are created' 
              : 'Try adjusting your search or filter criteria'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredProperties.map((property) => {
            const amenities = safeParse(property.amenities);
            const facilities = safeParse(property.facilities);
            const images = safeParse(property.images);
            const primaryImage = images && images.length > 0 ? 
              (typeof images[0] === 'string' ? images[0] : images[0]?.url || Room) : Room;

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
                      <Typography variant="h6" component="h3">
                        {property.property_type}
                      </Typography>
                      <Chip 
                        label={property.approval_status || 'Unknown'} 
                        color={getStatusColor(property.approval_status)}
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

                    <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
                      LKR {parseInt(property.price || 0).toLocaleString()}
                    </Typography>

                    {property.owner_info && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Owner: {property.owner_info.username}
                      </Typography>
                    )}

                    <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                      <Box display="flex" alignItems="center">
                        <BedIcon sx={{ fontSize: 16, mr: 0.5 }} />
                        <Typography variant="body2">
                          {property.bedrooms || 0}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <BathtubIcon sx={{ fontSize: 16, mr: 0.5 }} />
                        <Typography variant="body2">
                          {property.bathrooms || 0}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <ViewsIcon sx={{ fontSize: 16, mr: 0.5 }} />
                        <Typography variant="body2">
                          {property.views_count || 0}
                        </Typography>
                      </Box>
                    </Box>

                    <Box display="flex" alignItems="center">
                      <Typography variant="body2">
                        {amenities?.length || 0} amenities
                      </Typography>
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