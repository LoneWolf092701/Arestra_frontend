import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const addPropertyDetails = async (propertyData, token) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };
  const response = await axios.post(`${API_URL}/properties/details`, propertyData, config);
  return response.data;
};

export const getProperties = async (token) => {
  const config = {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
  const response = await axios.get(`${API_URL}/properties/details`, config);
  return response.data;
};

export const updateProperty = async (propertyId, propertyData, token) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };
  const response = await axios.put(`${API_URL}/properties/details/${propertyId}`, propertyData, config);
  return response.data;
};

export const deleteProperty = async (propertyId, token) => {
  const config = {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
  const response = await axios.delete(`${API_URL}/properties/details/${propertyId}`, config);
  return response.data;
};
