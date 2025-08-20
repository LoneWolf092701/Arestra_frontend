import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Box,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Divider,
  IconButton,
  Skeleton
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  LocationOn as LocationIcon,
  AttachMoney as PriceIcon,
  CheckCircle as ApprovedIcon,
  Pending as PendingIcon,
  Cancel as RejectedIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { getAllPropertiesAdmin, deletePropertyAdmin } from '../../api/adminAPI';
import Pagination from '../../components/common/Pagination';
import AppSnackbar from '../../components/common/AppSnackbar';
import Room from '../../assets/images/Room.jpg';

const AdminAllProperties = () => {
  const navigate = useNavigate();
  
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('');
  const [approvalStatusFilter, setApprovalStatusFilter] = useState('all');
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [stats, setStats] = useState({});
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [paginationData, setPaginationData] = useState({
    total: 0,
    totalPages: 0,
    page: 1,
    limit: 12,
    hasNext: false,
    hasPrevious: false
  });

  const safeJsonParse = (str, fallback = null) => {
    if (!str) return fallback;
    if (typeof str === 'object') return str;
    if (typeof str !== 'string') return fallback;
    
    try {
      const parsed = JSON.parse(str);
      return parsed !== null ? parsed : fallback;
    } catch (error) {
      console.warn('JSON parse error:', error);
      return fallback;
    }
  };

  const extractPaginationData = (response) => {
    if (response?.pagination) {
      return {
        total: response.pagination.total_items || response.pagination.total || 0,
        totalPages: response.pagination.total_pages || response.pagination.totalPages || 0,
        page: response.pagination.current_page || response.pagination.page || 1,
        limit: response.pagination.items_per_page || response.pagination.limit || 12,
        hasNext: response.pagination.has_next || response.pagination.hasNext || false,
        hasPrevious: response.pagination.has_prev || response.pagination.hasPrevious || false
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

  const getImageUrl = (images) => {
    const parsedImages = safeJsonParse(images, []);
    
    if (!Array.isArray(parsedImages) || parsedImages.length === 0) {
      return Room;
    }

    const firstImage = parsedImages[0];
    
    if (typeof firstImage === 'string' && firstImage.trim()) {
      return firstImage.trim();
    }
    
    if (typeof firstImage === 'object' && firstImage !== null && firstImage.url) {
      if (typeof firstImage.url === 'string' && firstImage.url.trim()) {
        return firstImage.url.trim();
      }
    }
    
    return Room;
  };

  const fetchAllProperties = async (page = 1) => {
    setLoading(true);
    try {
      const response = await getAllPropertiesAdmin({
        page: page,
        limit: itemsPerPage,
        status: 'all',
        approval_status: approvalStatusFilter !== 'all' ? approvalStatusFilter : '',
        search: searchTerm.trim(),
        sort_by: 'created_at',
        sort_order: 'DESC'
      });
      
      const propertiesData = response?.properties || [];
      const statsData = response?.stats || {};
      const pagination = extractPaginationData(response);
      
      setProperties(Array.isArray(propertiesData) ? propertiesData : []);
      setStats(statsData);
      setPaginationData(pagination);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setSnackbarMessage('Error fetching properties');
      setSnackbarOpen(true);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchAllProperties(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    fetchAllProperties(1);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchAllProperties(1);
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
    fetchAllProperties(1);
  };

  useEffect(() => {
    fetchAllProperties(currentPage);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== '') {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    handleFilterChange();
  }, [approvalStatusFilter]);

  const handleRemoveProperty = async (propertyId, reason) => {
    try {
      await deletePropertyAdmin(propertyId, reason);
      setSnackbarMessage('Property removed successfully');
      setSnackbarOpen(true);
      
      if (properties.length === 1 && currentPage > 1) {
        const newPage = currentPage - 1;
        setCurrentPage(newPage);
        fetchAllProperties(newPage);
      } else {
        fetchAllProperties(currentPage);
      }
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <ApprovedIcon />;
      case 'pending': return <PendingIcon />;
      case 'rejected': return <RejectedIcon />;
      default: return null;
    }
  };

  const formatPrice = (price) => {
    return `LKR ${parseInt(price || 0).toLocaleString()}`;
  };

  if (loading && currentPage === 1) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          All Properties Management
        </Typography>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={30} />
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="text" height={20} width="60%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        All Properties Management
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage all properties in the system. You can view details, approve/reject, and remove properties.
      </Typography>

      {stats && Object.keys(stats).length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Property Statistics
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {stats.total || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Properties
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {stats.pending || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Approval
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {stats.approved || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Approved
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="error.main">
                  {stats.rejected || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Rejected
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <FilterListIcon sx={{ mr: 1 }} />
          Filters
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search Properties"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by address, type, or owner"
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Approval Status</InputLabel>
              <Select
                value={approvalStatusFilter}
                onChange={(e) => setApprovalStatusFilter(e.target.value)}
                label="Approval Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => fetchAllProperties(currentPage)}
              disabled={loading}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">
          Showing {paginationData.total} Properties
        </Typography>
      </Box>

      {properties.length === 0 && !loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
            No properties found
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            No properties match your current filters.
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {properties.map((property) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={property.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={getImageUrl(property.images)}
                    alt={`${property.property_type} - ${property.unit_type}`}
                    sx={{
                      objectFit: 'cover',
                      backgroundColor: 'grey.200'
                    }}
                  />
                  
                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                        {property.property_type}
                      </Typography>
                      <Chip
                        icon={getStatusIcon(property.approval_status)}
                        label={property.approval_status?.charAt(0).toUpperCase() + property.approval_status?.slice(1)}
                        color={getStatusColor(property.approval_status)}
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {property.unit_type}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PersonIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                        Owner: {property.owner_info?.username || 'Unknown'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                        {property.address?.length > 40 ? `${property.address.substring(0, 40)}...` : property.address}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PriceIcon sx={{ fontSize: 16, color: 'primary.main', mr: 0.5 }} />
                      <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold', fontSize: '1rem' }}>
                        {formatPrice(property.price)} / month
                      </Typography>
                    </Box>
                  </CardContent>
                  
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ViewIcon />}
                      onClick={() => handleViewProperty(property.id)}
                      sx={{ mr: 1 }}
                    >
                      View Details
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleRemoveClick(property)}
                    >
                      Remove
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

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
      )}

      <Dialog
        open={removeDialogOpen}
        onClose={() => setRemoveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Remove Property</DialogTitle>
        <DialogContent>
          {selectedProperty && (
            <Box>
              <Typography variant="body1" gutterBottom>
                Are you sure you want to remove this property from the system?
              </Typography>
              
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="subtitle2">
                  {selectedProperty.property_type} - {selectedProperty.unit_type}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedProperty.address}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Owner: {selectedProperty.owner_info?.username}
                </Typography>
              </Box>
              
              <Alert severity="warning" sx={{ mt: 2 }}>
                This action cannot be undone. The property will be permanently removed from the system.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (selectedProperty) {
                handleRemoveProperty(selectedProperty.id, 'Removed by admin');
                setRemoveDialogOpen(false);
                setSelectedProperty(null);
              }
            }}
            color="error"
            variant="contained"
          >
            Remove Property
          </Button>
        </DialogActions>
      </Dialog>

      <AppSnackbar
        open={snackbarOpen}
        message={snackbarMessage}
        severity="info"
        onClose={() => setSnackbarOpen(false)}
      />
    </Container>
  );
};

export default AdminAllProperties;