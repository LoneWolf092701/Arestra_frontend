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

// to get all properties - property owner
export const getProperties = async (token) => {
  const config = {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
  const response = await axios.get(`${API_URL}/properties/details`, config);
  return response.data;
};

// to get a property by id - property owner
export const getPropertyDetailsById = async (propertyId, token) => {
  const config = {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  };
  const response = await axios.get(`${API_URL}/properties/details/${propertyId}`, config);
  return response.data;
};

// Enhanced getAllProperties function with filtering support
export const getAllProperties = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Add filters to query parameters
    if (filters.propertyType && filters.propertyType !== 'All') {
      params.append('propertyType', filters.propertyType);
    }
    if (filters.minPrice) {
      params.append('minPrice', filters.minPrice);
    }
    if (filters.maxPrice) {
      params.append('maxPrice', filters.maxPrice);
    }
    if (filters.location) {
      params.append('location', filters.location);
    }
    if (filters.bedrooms) {
      params.append('bedrooms', filters.bedrooms);
    }
    if (filters.bathrooms) {
      params.append('bathrooms', filters.bathrooms);
    }
    if (filters.availableFrom) {
      params.append('availableFrom', filters.availableFrom);
    }
    if (filters.rating) {
      params.append('minRating', filters.rating);
    }
    if (filters.amenities && filters.amenities.length > 0) {
      params.append('amenities', filters.amenities.join(','));
    }
    
    const queryString = params.toString();
    const url = queryString ? `${API_URL}/properties/all?${queryString}` : `${API_URL}/properties/all`;
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }
};

// Enhanced getPropertyById function
export const getPropertyById = async (propertyId) => {
  try {
    const response = await axios.get(`${API_URL}/properties/all/${propertyId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching property:', error);
    throw error;
  }
};

// Search properties function
export const searchProperties = async (searchQuery, filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (searchQuery) {
      params.append('search', searchQuery);
    }
    
    // Add filters
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        if (Array.isArray(filters[key])) {
          params.append(key, filters[key].join(','));
        } else {
          params.append(key, filters[key]);
        }
      }
    });
    
    const queryString = params.toString();
    const url = queryString ? `${API_URL}/properties/search?${queryString}` : `${API_URL}/properties/all`;
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error searching properties:', error);
    throw error;
  }
};

// Get recommended properties
export const getRecommendedProperties = async (limit = 6, userPreferences = {}) => {
  try {
    const params = new URLSearchParams();
    params.append('limit', limit);
    
    if (userPreferences.propertyType) {
      params.append('preferredType', userPreferences.propertyType);
    }
    if (userPreferences.maxPrice) {
      params.append('maxPrice', userPreferences.maxPrice);
    }
    if (userPreferences.location) {
      params.append('preferredLocation', userPreferences.location);
    }
    
    const response = await axios.get(`${API_URL}/properties/recommended?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recommended properties:', error);
    // Fallback to regular properties if recommendation endpoint doesn't exist
    const allProperties = await getAllProperties();
    return allProperties.slice(0, limit);
  }
};

// Get property statistics
export const getPropertyStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/properties/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching property stats:', error);
    throw error;
  }
};

// Get properties by location
export const getPropertiesByLocation = async (location) => {
  try {
    const response = await axios.get(`${API_URL}/properties/location/${encodeURIComponent(location)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching properties by location:', error);
    throw error;
  }
};

// Get properties with advanced filtering
export const getFilteredProperties = async (filters) => {
  try {
    const response = await axios.post(`${API_URL}/properties/filter`, filters);
    return response.data;
  } catch (error) {
    console.error('Error fetching filtered properties:', error);
    // Fallback to client-side filtering
    const allProperties = await getAllProperties();
    return allProperties;
  }
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

// Booking related functions
export const submitBookingRequest = async (bookingData, token) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };
  const response = await axios.post(`${API_URL}/bookings/request`, bookingData, config);
  return response.data;
};

export const getUserBookings = async (token) => {
  const config = {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
  const response = await axios.get(`${API_URL}/bookings/user`, config);
  return response.data;
};

export const getPropertyBookings = async (propertyId, token) => {
  const config = {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
  const response = await axios.get(`${API_URL}/bookings/property/${propertyId}`, config);
  return response.data;
};

// Property availability functions
export const checkPropertyAvailability = async (propertyId, startDate, endDate) => {
  try {
    const params = new URLSearchParams({
      startDate,
      endDate
    });
    const response = await axios.get(`${API_URL}/properties/${propertyId}/availability?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error checking availability:', error);
    throw error;
  }
};

export const updatePropertyAvailability = async (propertyId, availabilityData, token) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };
  const response = await axios.put(`${API_URL}/properties/${propertyId}/availability`, availabilityData, config);
  return response.data;
};

// Utility function to format property data for API
export const formatPropertyDataForAPI = (propertyData) => {
  return {
    ...propertyData,
    amenities: typeof propertyData.amenities === 'object' 
      ? JSON.stringify(propertyData.amenities) 
      : propertyData.amenities,
    facilities: typeof propertyData.facilities === 'object'
      ? JSON.stringify(propertyData.facilities)
      : propertyData.facilities,
    roommates: Array.isArray(propertyData.roommates)
      ? JSON.stringify(propertyData.roommates)
      : propertyData.roommates,
    rules: Array.isArray(propertyData.rules)
      ? JSON.stringify(propertyData.rules)
      : propertyData.rules,
    billsInclusive: Array.isArray(propertyData.billsInclusive)
      ? JSON.stringify(propertyData.billsInclusive)
      : propertyData.billsInclusive
  };
};

// Export all functions as named exports
// export {
//   // getRecommendedProperties,
//   searchProperties,
//   getPropertyStats,
//   getPropertiesByLocation,
//   getFilteredProperties,
//   formatPropertyDataForAPI
// };