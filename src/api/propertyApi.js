import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    config.metadata = { startTime: new Date() };
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    const endTime = new Date();
    const duration = endTime - response.config.metadata.startTime;
    console.debug(`API Request to ${response.config.url} took ${duration}ms`);
    
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('tokenExpiry');
      
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export const addProperty = async (propertyData) => {
  try {
    const response = await apiClient.post('/properties', propertyData);
    return response.data;
  } catch (error) {
    console.error('Error adding property:', error);
    throw error;
  }
};

export const getProperties = async () => {
  try {
    const response = await apiClient.get('/properties');
    return response.data;
  } catch (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }
};

export const getAllPublicProperties = async (options = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (options.limit) params.append('limit', options.limit);
    if (options.search) params.append('search', options.search);
    if (options.location) params.append('location', options.location);
    if (options.propertyType) params.append('propertyType', options.propertyType);
    if (options.minPrice) params.append('minPrice', options.minPrice);
    if (options.maxPrice) params.append('maxPrice', options.maxPrice);
    
    const queryString = params.toString();
    const url = `/properties/public${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching public properties:', error);
    throw error;
  }
};

export const getPropertyDetailsById = async (propertyId) => {
  try {
    if (!propertyId) {
      throw new Error('Property ID is required');
    }
    
    const response = await apiClient.get(`/properties/details/${propertyId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching property details:', error);
    throw error;
  }
};

export const getPublicPropertyById = async (propertyId) => {
  try {
    if (!propertyId) {
      throw new Error('Property ID is required');
    }
    
    const response = await apiClient.get(`/properties/public/${propertyId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching public property details:', error);
    throw error;
  }
};

export const addPropertyDetails = async (detailsData) => {
  try {
    const response = await apiClient.post('/properties/details', detailsData);
    return response.data;
  } catch (error) {
    console.error('Error adding property details:', error);
    throw error;
  }
};

export const updateProperty = async (propertyId, updateData) => {
  try {
    if (!propertyId) {
      throw new Error('Property ID is required');
    }
    
    const response = await apiClient.put(`/properties/${propertyId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating property:', error);
    throw error;
  }
};

export const updatePropertyDetails = async (propertyId, updateData) => {
  try {
    if (!propertyId) {
      throw new Error('Property ID is required');
    }
    
    const response = await apiClient.put(`/properties/details/${propertyId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating property details:', error);
    throw error;
  }
};

export const deleteProperty = async (propertyId) => {
  try {
    if (!propertyId) {
      throw new Error('Property ID is required');
    }
    
    const response = await apiClient.delete(`/properties/${propertyId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting property:', error);
    throw error;
  }
};

export const deletePropertyDetails = async (propertyId) => {
  try {
    if (!propertyId) {
      throw new Error('Property ID is required');
    }
    
    const response = await apiClient.delete(`/properties/details/${propertyId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting property details:', error);
    throw error;
  }
};

export const searchProperties = async (searchParams) => {
  try {
    const response = await apiClient.get('/properties/search', {
      params: searchParams
    });
    return response.data;
  } catch (error) {
    console.error('Error searching properties:', error);
    throw error;
  }
};

export const getPropertiesByLocation = async (location) => {
  try {
    if (!location) {
      throw new Error('Location is required');
    }
    
    const response = await apiClient.get(`/properties/location/${encodeURIComponent(location)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching properties by location:', error);
    throw error;
  }
};

export const getPropertyStats = async () => {
  try {
    const response = await apiClient.get('/properties/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching property stats:', error);
    throw error;
  }
};

export const uploadPropertyImage = async (imageFile) => {
  try {
    if (!imageFile) {
      throw new Error('Image file is required');
    }
    
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await apiClient.post('/properties/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading property image:', error);
    throw error;
  }
};

export const getFeaturedProperties = async (limit = 6) => {
  try {
    const response = await apiClient.get(`/properties/featured?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching featured properties:', error);
    try {
      const fallbackResponse = await getAllPublicProperties({ limit });
      return fallbackResponse;
    } catch (fallbackError) {
      console.error('Error fetching fallback properties:', fallbackError);
      throw fallbackError;
    }
  }
};

export const getPropertyRecommendations = async (preferences = {}) => {
  try {
    const response = await apiClient.get('/properties/recommendations', {
      params: preferences
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching property recommendations:', error);
    try {
      const fallbackResponse = await getAllPublicProperties({ limit: 6 });
      return fallbackResponse;
    } catch (fallbackError) {
      console.error('Error fetching fallback recommendations:', fallbackError);
      throw fallbackError;
    }
  }
};

export const reportPropertyIssue = async (propertyId, issueData) => {
  try {
    if (!propertyId || !issueData) {
      throw new Error('Property ID and issue data are required');
    }
    
    const response = await apiClient.post(`/properties/${propertyId}/report`, issueData);
    return response.data;
  } catch (error) {
    console.error('Error reporting property issue:', error);
    throw error;
  }
};

export const checkPropertyAvailability = async (propertyId, checkInDate, checkOutDate) => {
  try {
    if (!propertyId || !checkInDate || !checkOutDate) {
      throw new Error('Property ID, check-in date, and check-out date are required');
    }
    
    const response = await apiClient.get(`/properties/availability/${propertyId}`, {
      params: {
        checkIn: checkInDate,
        checkOut: checkOutDate
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error checking property availability:', error);
    throw error;
  }
};

export const getSimilarProperties = async (propertyId, limit = 4) => {
  try {
    if (!propertyId) {
      throw new Error('Property ID is required');
    }
    
    const response = await apiClient.get(`/properties/public/${propertyId}/similar?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching similar properties:', error);
    
    try {
      const fallbackResponse = await getAllPublicProperties({ limit });
      return fallbackResponse.slice(0, limit);
    } catch (fallbackError) {
      console.error('Error fetching fallback properties:', fallbackError);
      throw fallbackError;
    }
  }
};

export const incrementPropertyViews = async (propertyId) => {
  try {
    if (!propertyId) {
      throw new Error('Property ID is required');
    }
    
    const response = await apiClient.post(`/properties/public/${propertyId}/view`);
    return response.data;
  } catch (error) {
    console.error('Error incrementing property views:', error);
  }
};

export const getOwnerProperties = async () => {
  try {
    const response = await apiClient.get('/properties/details');
    return response.data;
  } catch (error) {
    console.error('Error fetching owner properties:', error);
    throw error;
  }
};

export const getAllProperties = getAllPublicProperties;
export const getPropertyById = getPublicPropertyById;

export default {
  addProperty,
  getProperties,
  getAllPublicProperties,
  getAllProperties,
  getPropertyDetailsById,
  getPublicPropertyById,
  getPropertyById,
  addPropertyDetails,
  updateProperty,
  updatePropertyDetails,
  deleteProperty,
  deletePropertyDetails,
  searchProperties,
  getPropertiesByLocation,
  getPropertyStats,
  uploadPropertyImage,
  getFeaturedProperties,
  getPropertyRecommendations,
  reportPropertyIssue,
  checkPropertyAvailability,
  getSimilarProperties,
  incrementPropertyViews,
  getOwnerProperties
};