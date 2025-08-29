import React, { useState, useCallback, useEffect } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '300px'
};

const defaultCenter = {
  lat: 6.9271,
  lng: 79.8612 // Colombo, Sri Lanka
};

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

  useEffect(() => {
    if (latitude && longitude) {
      const position = { lat: latitude, lng: longitude };
      setMapCenter(position);
      setMarkerPosition(position);
    }
  }, [latitude, longitude]);

  const handleSearch = useCallback(() => {
    if (window.google && address && !readonly) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();
          const newPosition = { lat, lng };
          
          setMapCenter(newPosition);
          setMarkerPosition(newPosition);
          
          if (onLocationSelect) {
            onLocationSelect(lat, lng, results[0].formatted_address);
          }
        } else {
          console.error('Geocode was not successful for the following reason: ' + status);
        }
      });
    }
  }, [address, readonly, onLocationSelect]);

  const handleMapClick = useCallback((event) => {
    if (!readonly && event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      const newPosition = { lat, lng };
      
      setMarkerPosition(newPosition);
      
      // Reverse geocode to get address
      if (window.google) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: newPosition }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const formattedAddress = results[0].formatted_address;
            if (setAddress) {
              setAddress(formattedAddress);
            }
            if (onLocationSelect) {
              onLocationSelect(lat, lng, formattedAddress);
            }
          } else {
            if (onLocationSelect) {
              onLocationSelect(lat, lng, address || '');
            }
          }
        });
      } else {
        if (onLocationSelect) {
          onLocationSelect(lat, lng, address || '');
        }
      }
    }
  }, [readonly, onLocationSelect, setAddress, address]);

  const handleMarkerDragEnd = useCallback((event) => {
    if (!readonly && event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      const newPosition = { lat, lng };
      
      setMarkerPosition(newPosition);
      
      // Reverse geocode to get address
      if (window.google) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: newPosition }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const formattedAddress = results[0].formatted_address;
            if (setAddress) {
              setAddress(formattedAddress);
            }
            if (onLocationSelect) {
              onLocationSelect(lat, lng, formattedAddress);
            }
          } else {
            if (onLocationSelect) {
              onLocationSelect(lat, lng, address || '');
            }
          }
        });
      }
    }
  }, [readonly, onLocationSelect, setAddress, address]);

  return (
    <Box>
      {showSearch && !readonly && (
        <>
          <TextField 
            fullWidth 
            label="Search Address" 
            variant="outlined" 
            margin="normal"
            value={address || ''}
            onChange={(e) => setAddress && setAddress(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button 
            variant="contained" 
            onClick={handleSearch} 
            sx={{ mb: 2 }} 
            disabled={!address}
          >
            Search Location
          </Button>
        </>
      )}
      
      {readonly && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Property Location
        </Typography>
      )}

      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "AIzaSyAj859D2RRgws_IF64BnN-qy8QsHwCzJZM"}> 
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
      
      {!readonly && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Click on the map or drag the marker to set the exact property location
        </Typography>
      )}
    </Box>
  );
};

export default MapSearch;