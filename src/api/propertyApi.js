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

const safeJsonParse = (value) => {
  if (!value) return [];
  
  // If already an array, return it
  if (Array.isArray(value)) return value;
  
  // If it's a string, try to parse as JSON first
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      
      // If parsed is an object (like {"Parking": 1, "Pool": 1}), extract keys where value > 0
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        return Object.keys(parsed).filter(key => parsed[key] > 0);
      }
      
      // If parsed is an array, return it
      if (Array.isArray(parsed)) {
        return parsed;
      }
      
      // If single value, wrap in array
      return [parsed];
    } catch (error) {
      // If JSON parsing fails, treat as comma-separated string
      return value.split(',').map(item => item.trim()).filter(item => item.length > 0);
    }
  }
  
  // If it's already an object, extract keys where value > 0
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return Object.keys(value).filter(key => value[key] > 0);
  }
  
  return [];
};


const processPropertyData = (property) => {
  if (!property) return property;
  
  return {
    ...property,
    price: parseFloat(property.price) || 0,
    amenities: safeJsonParse(property.amenities),
    facilities: safeJsonParse(property.facilities),
    images: safeJsonParse(property.images),
    average_rating: parseFloat(property.average_rating) || 0,
    total_ratings: parseInt(property.total_ratings) || 0,
    total_favorites: parseInt(property.total_favorites) || 0,
    views_count: parseInt(property.views_count) || 0,
  };
};

const handleApiError = (error, operation) => {
  console.error(`Error ${operation}:`, error);
  
  if (error.response?.status === 400) {
    throw new Error(error.response.data?.message || `Invalid data for ${operation}`);
  } else if (error.response?.status === 401) {
    throw new Error('Please log in to access property features');
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
    
    const processedData = {
      ...response.data,
      properties: response.data.properties?.map(processPropertyData) || []
    };
    
    return processedData;
  } catch (error) {
    handleApiError(error, 'fetching public properties');
  }
};

export const getAllProperties = getAllPublicProperties;

export const getPropertyDetailsById = async (propertyId) => {
  try {
    const validatedId = validatePropertyId(propertyId);
    
    const response = await apiClient.get(`/properties/public/${validatedId}`);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return processPropertyData(response.data);
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
    
    return processPropertyData(response.data);
  } catch (error) {
    handleApiError(error, 'fetching public property');
  }
};

export const createProperty = async (propertyData) => {
  try {
    
    if ((propertyData.latitude || propertyData.longitude) && 
        (!propertyData.latitude || !propertyData.longitude)) {
      throw new Error('Both latitude and longitude must be provided together');
    }
    
    if (propertyData.latitude && propertyData.longitude) {
      const lat = parseFloat(propertyData.latitude);
      const lng = parseFloat(propertyData.longitude);
      
      if (isNaN(lat) || isNaN(lng)) {
        throw new Error('Invalid coordinate format');
      }
      
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        throw new Error('Coordinates out of valid range');
      }
    }

    const payload = {
      ...propertyData,
      latitude: propertyData.latitude ? parseFloat(propertyData.latitude) : null,
      longitude: propertyData.longitude ? parseFloat(propertyData.longitude) : null
    };

    console.log('Creating property with coordinates:', {
      latitude: payload.latitude,
      longitude: payload.longitude,
      address: payload.address
    });

    if (!propertyData || typeof propertyData !== 'object') {
      throw new Error('Property data is required');
    }

    const response = await apiClient.post('/properties', payload);
    
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
    
    if ((updateData.latitude || updateData.longitude) && 
        (!updateData.latitude || !updateData.longitude)) {
      throw new Error('Both latitude and longitude must be provided together');
    }
    
    if (updateData.latitude && updateData.longitude) {
      const lat = parseFloat(updateData.latitude);
      const lng = parseFloat(updateData.longitude);
      
      if (isNaN(lat) || isNaN(lng)) {
        throw new Error('Invalid coordinate format');
      }
      
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        throw new Error('Coordinates out of valid range');
      }
    }

    const payload = {
      ...updateData,
      latitude: updateData.latitude ? parseFloat(updateData.latitude) : null,
      longitude: updateData.longitude ? parseFloat(updateData.longitude) : null
    };

    const response = await apiClient.put(`/properties/${validatedId}`, payload);
    
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
    
    const processedData = {
      ...response.data,
      properties: response.data.properties?.map(processPropertyData) || []
    };
    
    return processedData;
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
    
    const response = await apiClient.patch(`/properties/${validatedId}/status`, payload);
    
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
      throw new Error('At least one image file is required');
    }

    const formData = new FormData();
    
    if (Array.isArray(imageFiles)) {
      imageFiles.forEach((file, index) => {
        formData.append('propertyImages', file);
      });
    } else {
      formData.append('propertyImages', imageFiles);
    }

    const uploadClient = axios.create({
      baseURL: API_BASE_URL,
      timeout: 120000,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    uploadClient.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      }
    );

    const response = await uploadClient.post(`/properties/${validatedId}/images`, formData);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleApiError(error, 'uploading property images');
  }
};

export const deletePropertyImage = async (propertyId, imageUrl) => {
  try {
    const validatedId = validatePropertyId(propertyId);
    
    if (!imageUrl) {
      throw new Error('Image URL is required');
    }

    const response = await apiClient.delete(`/properties/${validatedId}/images`, {
      data: { imageUrl }
    });
    
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
    
    const processedData = {
      ...response.data,
      properties: response.data.properties?.map(processPropertyData) || []
    };
    
    return processedData;
  } catch (error) {
    handleApiError(error, 'searching properties');
  }
};

export const getPropertyTypes = async () => {
  try {
    const response = await apiClient.get('/properties/types');
    
    if (!response.data) {
      return ['Apartment', 'Villa', 'House', 'Boarding'];
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching property types:', error);
    
    return ['Apartment', 'Villa', 'House', 'Boarding'];
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
    
    const response = await apiClient.post(`/user-interactions/view`, payload);
    
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
    
    return response.data.map(processPropertyData);
  } catch (error) {
    console.error('Error fetching similar properties:', error);
    
    return [];
  }
};

/**
 * Get property by ID for owner (authenticated endpoint)
 * This allows owners to access their own properties for editing/viewing
 * @param {number|string} propertyId - The property ID
 * @returns {Promise} Property data
 */
export const getPropertyById = async (propertyId) => {
  try {
    const validatedId = validatePropertyId(propertyId);
    
    const response = await apiClient.get(`/properties/${validatedId}`);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return processPropertyData(response.data);
  } catch (error) {
    handleApiError(error, 'fetching property');
  }
};

/**
 * Get property details by ID for owner (alias for consistency)
 * @param {number|string} propertyId - The property ID
 * @returns {Promise} Property data
 */
// export const getOwnerPropertyById = async (propertyId) => {
//   return getPropertyById(propertyId);
// };

export const getOwnerPropertyById = async (propertyId) => {
  try {
    const validatedId = validatePropertyId(propertyId);
    
    const response = await apiClient.get(`/properties/owner/${validatedId}`);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return processPropertyData(response.data);
  } catch (error) {
    handleApiError(error, 'fetching owner property');
  }
};