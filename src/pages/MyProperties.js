import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Typography,
  Box
} from '@mui/material';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import { getProperties, deleteProperty } from '../api/propertyApi';
import { useNavigate } from 'react-router-dom';

const safeParse = (str) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    return [];
  }
};

const MyProperties = () => {
  const [properties, setProperties] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const token = localStorage.getItem('token');
        const data = await getProperties(token);
        setProperties(data);
      } catch (error) {
        console.error('Error fetching properties:', error);
      }
    };
    fetchProperties();
  }, []);

  const handleRemoveClick = (property) => {
    setSelectedProperty(property);
    setOpenDialog(true);
  };

  const handleConfirmRemove = async () => {
    try {
      const token = localStorage.getItem('token');
      await deleteProperty(selectedProperty.id, token);
      setProperties(properties.filter((p) => p.id !== selectedProperty.id));
      setOpenDialog(false);
      setSelectedProperty(null);
    } catch (error) {
      console.error('Error removing property:', error);
    }
  };

  const handleCancelRemove = () => {
    setOpenDialog(false);
    setSelectedProperty(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Box sx={{ padding: '2rem' }}>
      <Typography variant="h4" align="center" gutterBottom>
        My Properties
      </Typography>
      <Grid container spacing={2}>
        {properties.map((property) => {
          const amenities = safeParse(property.amenities);
          const priceRange = safeParse(property.price_range);
          return (
            <Grid item xs={12} sm={6} md={4} key={property.id}>
              <Card sx={{ minHeight: 320 }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={property.image || 'https://via.placeholder.com/300x200'}
                  alt={property.property_type}
                />
                <CardContent>
                  <Typography variant="h6" component="div">
                    {property.property_type} - {property.unit_type}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Address:</strong> {property.address}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Available:</strong> {formatDate(property.available_from)} – {formatDate(property.available_to)}
                  </Typography>
                  {priceRange.length === 2 && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Price Range:</strong> ${priceRange[0]} - ${priceRange[1]}
                    </Typography>
                  )}
                  {amenities.length > 0 && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Amenities:</strong> {amenities.join(', ')}
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => navigate(`/updateproperty/${property.id}`)}
                  >
                    Modify
                  </Button>
                  <Button size="small" color="secondary" onClick={() => handleRemoveClick(property)}>
                    Remove
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      <ConfirmationDialog
        open={openDialog}
        title="Confirm Removal"
        content={`Are you sure you want to remove "${selectedProperty?.property_type} - ${selectedProperty?.unit_type}"?`}
        onConfirm={handleConfirmRemove}
        onCancel={handleCancelRemove}
      />
    </Box>
  );
};

export default MyProperties;
