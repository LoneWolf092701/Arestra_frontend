import React from 'react';
import {
  Box,
  Typography,
  Container,
  Button,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import PropertyGrid from '../components/common/PropertyGrid';

const safeParse = (str) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    return [];
  }
};

const MyProperties = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');

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

      <PropertyGrid 
        showMyProperties={true}
        showActions={true}
        showEditButton={userRole === 'propertyowner'}
        showSummary={true}
        onViewProperty={handleViewProperty}
        onEditProperty={handleEditProperty}
        emptyStateMessage="You haven't added any properties yet"
        emptyStateSubtitle="Click 'Add New Property' to get started with your first listing"
      />
    </Container>
  );
};

export default MyProperties;