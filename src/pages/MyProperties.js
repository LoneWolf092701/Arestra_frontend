import {
  Box
} from '@mui/material';
import React from 'react';
import PropertyGrid from '../components/common/PropertyGrid';

const safeParse = (str) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    return [];
  }
};

const MyProperties = () => {
  

  return (
    <Box sx={{ padding: '2rem' }}>
     <PropertyGrid />
    </Box>
  );
};

export default MyProperties;
