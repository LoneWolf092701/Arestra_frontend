import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import PropertyGrid from '../components/common/PropertyGrid';
import { getMyProperties } from '../api/propertyApi';

const MyProperties = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getMyProperties();
      setProperties(response?.properties || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError(error.message || 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleViewProperty = (propertyId) => {
    navigate(`/property/${propertyId}`);
  };

  const handleEditProperty = (propertyId) => {
    if (userRole === 'propertyowner') {
      navigate(`/update-property/${propertyId}`);
    } else {
      console.warn('Edit not allowed for this role');
    }
  };

  const handleAddProperty = () => {
    if (userRole === 'propertyowner') {
      navigate('/add-property');
    } else {
      console.warn('Adding properties not allowed for this role');
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Properties
        </Typography>
        
        {userRole === 'propertyowner' && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddProperty}
            sx={{ minWidth: 160 }}
          >
            Add New Property
          </Button>
        )}
      </Box>

      {userRole !== 'propertyowner' && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          You must be a property owner to view and manage properties. Please contact support if you believe this is an error.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <PropertyGrid 
          properties={properties}
          loading={loading}
          showMyProperties={true}
          showActions={true}
          showEditButton={userRole === 'propertyowner'}
          showSummary={true}
          onViewProperty={handleViewProperty}
          onEditProperty={handleEditProperty}
          emptyStateMessage="You haven't added any properties yet"
          emptyStateSubtitle="Click 'Add New Property' to get started with your first listing"
        />
      )}
    </Container>
  );
};

export default MyProperties;