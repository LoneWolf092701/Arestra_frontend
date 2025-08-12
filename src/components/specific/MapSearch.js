import React, { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '300px'
};

const defaultCenter = {
  lat: -34.397,
  lng: 150.644
};

const MapSearch = ({ address, setAddress }) => {
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [markerPosition, setMarkerPosition] = useState(null);

  const handleSearch = () => {
    if (window.google && address) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();
          setMapCenter({ lat, lng });
          setMarkerPosition({ lat, lng });
        } else {
          alert('Geocode was not successful for the following reason: ' + status);
        }
      });
    }
  };

  return (
    <Box>
      <TextField 
        fullWidth 
        label="Search Address" 
        variant="outlined" 
        margin="normal"
        value={address}
        onChange={(e) => {setAddress(e.target.value);
          console.log({e});
        }}
      />
      <Button variant="contained" onClick={handleSearch} sx={{ mb: 2 }} disabled={!address}>
        Search
      </Button>
      {/* <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}> */}
      <LoadScript googleMapsApiKey="AIzaSyAj859D2RRgws_IF64BnN-qy8QsHwCzJZM"> 
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={mapCenter}
          zoom={14}
          // id=''
        >
          {markerPosition && <Marker position={markerPosition} />}
        </GoogleMap>
      </LoadScript>
    </Box>
  );
};

export default MapSearch;
