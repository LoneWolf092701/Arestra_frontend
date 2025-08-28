import React, { useState, useEffect, useCallback } from 'react';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px'
};

const defaultCenter = {
  lat: 6.9271,
  lng: 79.8612
};

const MapSearch = ({ 
  address, 
  setAddress, 
  onLocationSelect = null,
  coordinates = null,
  setCoordinates = null,
  readOnly = false,
  showSearch = true
}) => {
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (coordinates && coordinates.latitude && coordinates.longitude) {
      const position = { 
        lat: parseFloat(coordinates.latitude), 
        lng: parseFloat(coordinates.longitude) 
      };
      setMapCenter(position);
      setMarkerPosition(position);
    }
  }, [coordinates]);

  const geocodeAddress = useCallback(async (addressToGeocode) => {
    if (!window.google || !addressToGeocode.trim()) return;

    setIsLoading(true);
    setError('');

    const geocoder = new window.google.maps.Geocoder();
    
    try {
      const results = await new Promise((resolve, reject) => {
        geocoder.geocode({ address: addressToGeocode }, (results, status) => {
          if (status === 'OK' && results[0]) {
            resolve(results);
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        });
      });

      const location = results[0].geometry.location;
      const lat = location.lat();
      const lng = location.lng();
      const formattedAddress = results[0].formatted_address;

      const newPosition = { lat, lng };
      setMapCenter(newPosition);
      setMarkerPosition(newPosition);

      if (onLocationSelect) {
        onLocationSelect(lat, lng, formattedAddress);
      }
      
      if (setCoordinates) {
        setCoordinates({ latitude: lat, longitude: lng });
      }

      if (setAddress && formattedAddress !== address) {
        setAddress(formattedAddress);
      }

    } catch (error) {
      setError(`Location not found: ${error.message}`);
      console.error('Geocoding error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [address, onLocationSelect, setAddress, setCoordinates]);

  const handleSearch = () => {
    if (address && address.trim()) {
      geocodeAddress(address.trim());
    }
  };

  const handleMapClick = useCallback(async (event) => {
    if (readOnly) return;

    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    const newPosition = { lat, lng };

    setMarkerPosition(newPosition);
    setMapCenter(newPosition);

    if (window.google) {
      const geocoder = new window.google.maps.Geocoder();
      try {
        const results = await new Promise((resolve, reject) => {
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results[0]) {
              resolve(results);
            } else {
              reject(new Error('Reverse geocoding failed'));
            }
          });
        });

        const formattedAddress = results[0].formatted_address;
        if (setAddress) {
          setAddress(formattedAddress);
        }

        if (onLocationSelect) {
          onLocationSelect(lat, lng, formattedAddress);
        }

      } catch (error) {
        console.error('Reverse geocoding error:', error);
        if (onLocationSelect) {
          onLocationSelect(lat, lng, null);
        }
      }
    }

    if (setCoordinates) {
      setCoordinates({ latitude: lat, longitude: lng });
    }
  }, [readOnly, setAddress, onLocationSelect, setCoordinates]);

  const onMapLoad = useCallback((map) => {
    setMapInstance(map);
  }, []);

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSearch();
    }
  };

  return (
    <Box>
      {showSearch && (
        <Box sx={{ mb: 2 }}>
          <TextField 
            fullWidth 
            label="Search Address or Location" 
            variant="outlined"
            value={address || ''}
            onChange={(e) => setAddress && setAddress(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading || readOnly}
            sx={{ mb: 2 }}
          />
          <Button 
            variant="contained" 
            onClick={handleSearch} 
            disabled={!address || isLoading || readOnly}
            sx={{ mr: 2 }}
          >
            {isLoading ? 'Searching...' : 'Search Location'}
          </Button>
          {!readOnly && (
            <Typography variant="body2" color="text.secondary">
              Click on the map to select a precise location
            </Typography>
          )}
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <LoadScript googleMapsApiKey="AIzaSyAj859D2RRgws_IF64BnN-qy8QsHwCzJZM">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={mapCenter}
          zoom={15}
          onLoad={onMapLoad}
          onClick={handleMapClick}
          options={{
            zoomControl: true,
            mapTypeControl: true,
            scaleControl: true,
            streetViewControl: true,
            rotateControl: true,
            fullscreenControl: true,
            gestureHandling: 'cooperative'
          }}
        >
          {markerPosition && (
            <Marker 
              position={markerPosition}
              title={address || 'Selected Location'}
              animation={window.google?.maps?.Animation?.DROP}
            />
          )}
        </GoogleMap>
      </LoadScript>

      {markerPosition && (
        <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
          Selected coordinates: {markerPosition.lat.toFixed(6)}, {markerPosition.lng.toFixed(6)}
        </Typography>
      )}
    </Box>
  );
};

export default MapSearch;