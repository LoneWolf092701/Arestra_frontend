import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
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
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
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

const validatePropertyId = (propertyId) => {
  const id = parseInt(propertyId);
  if (isNaN(id) || id <= 0) {
    throw new Error('Invalid property ID provided');
  }
  return id;
};

const handleApiError = (error, operation) => {
  console.error(`Error ${operation}:`, error);
  
  if (error.response?.status === 400) {
    throw new Error(error.response.data?.message || `Invalid data for ${operation}`);
  } else if (error.response?.status === 401) {
    throw new Error('Please log in to continue');
  } else if (error.response?.status === 403) {
    throw new Error('Access denied. You do not have permission for this action.');
  } else if (error.response?.status === 404) {
    throw new Error('Property not found');
  } else if (error.response?.status >= 500) {
    throw new Error('Server error. Please try again later.');
  }
  
  throw new Error(error.response?.data?.message || `Failed to ${operation}`);
};

export const getAllPublicProperties = async (options = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    Object.entries(options).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            queryParams.append(key, value.join(','));
          }
        } else if (typeof value === 'object' && key === 'priceRange') {
          queryParams.append('min_price', value[0]);
          queryParams.append('max_price', value[1]);
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    const url = `/properties/public${queryParams.toString() ? `?${queryParams}` : ''}`;
    
    const response = await apiClient.get(url);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching public properties');
  }
};

export const getAllProperties = getAllPublicProperties;

export const getPropertyDetailsById = async (propertyId) => {
  try {
    const validatedId = validatePropertyId(propertyId);
    
    const response = await apiClient.get(`/properties/details/${validatedId}`);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching property details');
  }
};

export const getPublicPropertyById = async (propertyId) => {
  try {
    const validatedId = validatePropertyId(propertyId);
    
    const response = await apiClient.get(`/properties/public/${validatedId}`);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching public property');
  }
};

export const createProperty = async (propertyData) => {
  try {
    if (!propertyData || typeof propertyData !== 'object') {
      throw new Error('Property data is required');
    }

    const response = await apiClient.post('/properties', propertyData);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleApiError(error, 'creating property');
  }
};

export const updateProperty = async (propertyId, updateData) => {
  try {
    const validatedId = validatePropertyId(propertyId);
    
    if (!updateData || typeof updateData !== 'object') {
      throw new Error('Update data is required');
    }

    const response = await apiClient.put(`/properties/${validatedId}`, updateData);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleApiError(error, 'updating property');
  }
};

export const deleteProperty = async (propertyId) => {
  try {
    const validatedId = validatePropertyId(propertyId);
    
    const response = await apiClient.delete(`/properties/${validatedId}`);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleApiError(error, 'deleting property');
  }
};

export const getMyProperties = async (options = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    Object.entries(options).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const url = `/properties/owner/mine${queryParams.toString() ? `?${queryParams}` : ''}`;
    
    const response = await apiClient.get(url);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching owner properties');
  }
};

export const getOwnerProperties = getMyProperties;

export const addPropertyDetails = async (propertyId, detailsData) => {
  try {
    const validatedId = validatePropertyId(propertyId);
    
    if (!detailsData || typeof detailsData !== 'object') {
      throw new Error('Property details data is required');
    }

    const response = await apiClient.post(`/properties/${validatedId}/details`, detailsData);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleApiError(error, 'adding property details');
  }
};

export const togglePropertyStatus = async (propertyId, isActive = null) => {
  try {
    const validatedId = validatePropertyId(propertyId);
    
    const payload = isActive !== null ? { is_active: isActive } : {};
    
    const response = await apiClient.put(`/properties/${validatedId}/status`, payload);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleApiError(error, 'toggling property status');
  }
};

export const uploadPropertyImages = async (propertyId, imageFiles) => {
  try {
    const validatedId = validatePropertyId(propertyId);
    
    if (!imageFiles || imageFiles.length === 0) {
      throw new Error('Image files are required');
    }

    const formData = new FormData();
    
    if (Array.isArray(imageFiles)) {
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });
    } else {
      formData.append('images', imageFiles);
    }
    
    const response = await axios.post(
      `${API_BASE_URL}/properties/${validatedId}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        timeout: 60000
      }
    );
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleApiError(error, 'uploading property images');
  }
};

export const deletePropertyImage = async (propertyId, imageId) => {
  try {
    const validatedId = validatePropertyId(propertyId);
    
    if (!imageId) {
      throw new Error('Image ID is required');
    }

    const response = await apiClient.delete(`/properties/${validatedId}/images/${imageId}`);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleApiError(error, 'deleting property image');
  }
};

export const getPropertyStatistics = async (propertyId) => {
  try {
    const validatedId = validatePropertyId(propertyId);
    
    const response = await apiClient.get(`/properties/${validatedId}/statistics`);
    
    if (!response.data) {
      return {
        views_count: 0,
        rating_count: 0,
        average_rating: 0,
        favorite_count: 0,
        booking_requests: 0
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching property statistics:', error);
    
    return {
      views_count: 0,
      rating_count: 0,
      average_rating: 0,
      favorite_count: 0,
      booking_requests: 0
    };
  }
};

export const searchProperties = async (searchOptions) => {
  try {
    const queryParams = new URLSearchParams();
    
    Object.entries(searchOptions).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            queryParams.append(key, value.join(','));
          }
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    const response = await apiClient.get(`/properties/search?${queryParams.toString()}`);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleApiError(error, 'searching properties');
  }
};

export const getPropertyTypes = async () => {
  try {
    const response = await apiClient.get('/properties/types');
    
    if (!response.data) {
      return ['Apartment', 'Villa', 'House', 'Flat', 'Room', 'Condo'];
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching property types:', error);
    
    return ['Apartment', 'Villa', 'House', 'Flat', 'Room', 'Condo'];
  }
};

export const recordPropertyView = async (propertyId, viewData = {}) => {
  try {
    const validatedId = validatePropertyId(propertyId);
    
    const payload = {
      property_id: validatedId,
      view_duration: viewData.duration || null,
      source: viewData.source || 'unknown',
      user_location: viewData.user_location || null
    };
    
    const response = await apiClient.post(`/properties/${validatedId}/view`, payload);
    
    return response.data || true;
  } catch (error) {
    console.error('Error recording property view:', error);
    return false;
  }
};

export const incrementPropertyViews = recordPropertyView;

export const getSimilarProperties = async (propertyId, options = {}) => {
  try {
    const validatedId = validatePropertyId(propertyId);
    const { limit = 6, includeType = true, includeLocation = true, includePriceRange = true } = options;
    
    const queryParams = new URLSearchParams();
    queryParams.append('limit', limit.toString());
    queryParams.append('include_type', includeType.toString());
    queryParams.append('include_location', includeLocation.toString());
    queryParams.append('include_price_range', includePriceRange.toString());
    
    const response = await apiClient.get(`/properties/${validatedId}/similar?${queryParams.toString()}`);
    
    if (!response.data) {
      return [];
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching similar properties:', error);
    
    return [];
  }
};