import React, { useEffect, useState } from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Box, 
  Button, 
  Chip,
  CircularProgress,
  Alert,
  Rating,
  CardActions
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import { getAllProperties, getOwnerProperties } from '../../api/propertyApi';
import { useNavigate } from 'react-router-dom';

const safeParse = (str) => {
  try {
    return JSON.parse(str || '[]');
  } catch (error) {
    return [];
  }
};

const PropertyGrid = ({ showMyProperties = false, limit = null, showActions = true }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let data;
        if (showMyProperties) {
          data = await getOwnerProperties();
        } else {
          data = await getAllProperties();
        }
        
        // Apply limit if specified
        const limitedData = limit ? data.slice(0, limit) : data;
        setProperties(limitedData);
        
      } catch (error) {
        console.error('Error fetching properties:', error);
        setError('Failed to load properties. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [showMyProperties, limit]);

  const handleViewProperty = (propertyId) => {
    if (showMyProperties) {
      navigate(`/property-details/${propertyId}`);
    } else {
      navigate(`/user-viewproperty/${propertyId}`);
    }
  };

  const handleEditProperty = (propertyId) => {
    navigate(`/updateproperty/${propertyId}`);
  };

  const getImageUrl = (images) => {
    const parsedImages = safeParse(images);
    if (parsedImages.length > 0) {
      return parsedImages[0];
    }
    return 'https://via.placeholder.com/300x200?text=No+Image';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  if (properties.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          {showMyProperties ? 'No properties found' : 'No properties available'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {showMyProperties 
            ? 'Start by adding your first property listing' 
            : 'Check back later for new listings'
          }
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {properties.map((property) => {
        const amenities = safeParse(property.amenities);
        const images = safeParse(property.images);
        
        return (
          <Grid item xs={12} sm={6} md={4} key={property.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={getImageUrl(property.images)}
                alt={`${property.property_type} in ${property.address}`}
                sx={{ objectFit: 'cover' }}
              />
              
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                    {property.property_type} - {property.unit_type}
                  </Typography>
                  <Chip 
                    label={property.status || 'Active'} 
                    color={property.status === 'approved' ? 'success' : 'default'} 
                    size="small" 
                  />
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOnIcon sx={{ color: 'text.secondary', mr: 0.5, fontSize: 16 }} />
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {property.address}
                  </Typography>
                </Box>

                {property.rating !== undefined && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating value={property.rating || 0} readOnly size="small" precision={0.5} />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      ({property.total_ratings || 0})
                    </Typography>
                  </Box>
                )}

                <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
                  LKR {property.price ? property.price.toLocaleString() : 'N/A'}/month
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {property.bedrooms || 0} bed • {property.bathrooms || 0} bath
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {amenities.length} amenities
                  </Typography>
                </Box>

                {property.availability_date && (
                  <Typography variant="body2" color="text.secondary">
                    Available: {new Date(property.availability_date).toLocaleDateString()}
                  </Typography>
                )}
              </CardContent>
              
              {showActions && (
                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleViewProperty(property.id)}
                  >
                    View
                  </Button>
                  {showMyProperties && (
                    <Button 
                      size="small" 
                      startIcon={<EditIcon />}
                      onClick={() => handleEditProperty(property.id)}
                    >
                      Edit
                    </Button>
                  )}
                </CardActions>
              )}
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default PropertyGrid;