import React, { useState, useEffect } from 'react';
import { Container, Typography } from '@mui/material';
import PropertyGrid from '../../components/common/PropertyGrid';
import { getFavouriteProperties } from '../../api/userInteractionApi';

const UserFavouriteProperties = () => {
  const [favouriteProperties, setFavouriteProperties] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFavouriteProperties = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const data = await getFavouriteProperties(token);
        setFavouriteProperties(data);
      } catch (error) {
        console.error('Error fetching favourite properties:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFavouriteProperties();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        My Favourite Properties
      </Typography>
      {loading ? (
        <Typography variant="h6" align="center">Loading...</Typography>
      ) : favouriteProperties.length > 0 ? (
        <PropertyGrid properties={favouriteProperties} isUserPage={true} />
      ) : (
        <Typography variant="h6" align="center">No favourite properties found.</Typography>
      )}
    </Container>
  );
};

export default UserFavouriteProperties;
