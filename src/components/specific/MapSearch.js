import React, { useState, useCallback, useEffect } from 'react';
import { TextField, Button, Box, Typography, Alert, CircularProgress } from '@mui/material';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '8px'
};

const defaultCenter = {
  lat: 6.9271,
  lng: 79.8612
};

const libraries = ['places', 'geometry'];

const MapSearch = ({ 
  address, 
  setAddress, 
  onLocationSelect, 
  latitude, 
  longitude, 
  readonly = false,
  showSearch = true 
}) => {
  const [mapCenter, setMapCenter] = useState(
    latitude && longitude ? { lat: latitude, lng: longitude } : defaultCenter
  );
  const [markerPosition, setMarkerPosition] = useState(
    latitude && longitude ? { lat: latitude, lng: longitude } : null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (latitude && longitude) {
      const position = { lat: latitude, lng: longitude };
      setMapCenter(position);
      setMarkerPosition(position);
    }
  }, [latitude, longitude]);

  // Cleanup on unmount to prevent state issues
  useEffect(() => {
    return () => {
      setIsMapLoaded(false);
      setError('');
    };
  }, []);

  const geocodeLocation = useCallback((location, callback) => {
    if (!window.google?.maps) {
      callback(null, 'Google Maps not loaded');
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode(location, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        callback(results[0], null);
      } else {
        const errorMap = {
          'ZERO_RESULTS': 'No results found for this location',
          'OVER_QUERY_LIMIT': 'Geocoding quota exceeded',
          'REQUEST_DENIED': 'Geocoding request denied - check API permissions',
          'INVALID_REQUEST': 'Invalid geocoding request',
          'UNKNOWN_ERROR': 'Unknown geocoding error'
        };
        callback(null, errorMap[status] || `Geocoding failed: ${status}`);
      }
    });
  }, []);

  const handleSearch = useCallback(() => {
    if (!address || readonly || !isMapLoaded) return;
    
    setIsLoading(true);
    setError('');
    
    geocodeLocation({ address }, (result, error) => {
      setIsLoading(false);
      
      if (error) {
        setError(error);
        return;
      }
      
      if (result) {
        const location = result.geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        const newPosition = { lat, lng };
        
        setMapCenter(newPosition);
        setMarkerPosition(newPosition);
        
        if (onLocationSelect) {
          onLocationSelect(lat, lng, result.formatted_address);
        }
        if (setAddress) {
          setAddress(result.formatted_address);
        }
      }
    });
  }, [address, readonly, isMapLoaded, geocodeLocation, onLocationSelect, setAddress]);

  const reverseGeocode = useCallback((lat, lng) => {
    if (!isMapLoaded) return;
    
    geocodeLocation({ location: { lat, lng } }, (result, error) => {
      if (error) {
        console.warn('Reverse geocoding failed:', error);
        if (onLocationSelect) {
          onLocationSelect(lat, lng, address || '');
        }
        return;
      }
      
      if (result) {
        const formattedAddress = result.formatted_address;
        if (setAddress) {
          setAddress(formattedAddress);
        }
        if (onLocationSelect) {
          onLocationSelect(lat, lng, formattedAddress);
        }
      }
    });
  }, [isMapLoaded, geocodeLocation, onLocationSelect, setAddress, address]);

  const handleMapClick = useCallback((event) => {
    if (!readonly && event.latLng && isMapLoaded) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      const newPosition = { lat, lng };
      
      setMarkerPosition(newPosition);
      reverseGeocode(lat, lng);
    }
  }, [readonly, isMapLoaded, reverseGeocode]);

  const handleMarkerDragEnd = useCallback((event) => {
    if (!readonly && event.latLng && isMapLoaded) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      const newPosition = { lat, lng };
      
      setMarkerPosition(newPosition);
      reverseGeocode(lat, lng);
    }
  }, [readonly, isMapLoaded, reverseGeocode]);

  if (!apiKey || apiKey.trim() === '') {
    return (
      <Alert severity="error">
        Google Maps API key not configured. Please set a valid API key in environment variables.
      </Alert>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {showSearch && !readonly && (
        <>
          <TextField 
            fullWidth 
            label="Search Address" 
            variant="outlined" 
            margin="normal"
            value={address || ''}
            onChange={(e) => setAddress?.(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            disabled={isLoading || !isMapLoaded}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Button 
              variant="contained" 
              onClick={handleSearch} 
              disabled={!address || isLoading || !isMapLoaded}
            >
              {isLoading ? <CircularProgress size={20} /> : 'Search Location'}
            </Button>
          </Box>
        </>
      )}

      <LoadScript 
        googleMapsApiKey={apiKey}
        libraries={libraries}
        onLoad={() => setIsMapLoaded(true)}
        onError={(error) => {
          console.error('Failed to load Google Maps:', error);
          setError('Failed to load Google Maps. Please check your internet connection and API key.');
          setIsMapLoaded(false);
        }}
        loadingElement={
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading Google Maps...</Typography>
          </Box>
        }
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={mapCenter}
          zoom={markerPosition ? 15 : 10}
          onClick={handleMapClick}
          options={{
            disableDefaultUI: readonly,
            zoomControl: !readonly,
            mapTypeControl: false,
            scaleControl: true,
            streetViewControl: !readonly,
            rotateControl: false,
            fullscreenControl: !readonly
          }}
        >
          {markerPosition && (
            <Marker 
              position={markerPosition} 
              draggable={!readonly}
              onDragEnd={handleMarkerDragEnd}
              title={readonly ? "Property Location" : "Drag to adjust location"}
            />
          )}
        </GoogleMap>
      </LoadScript>
    </Box>
  );
};

export default MapSearch;