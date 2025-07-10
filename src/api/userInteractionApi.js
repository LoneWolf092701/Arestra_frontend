// userInteractionApi.js - Complete User Interaction API Client
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with base configuration for user interactions
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add authentication token to all requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle authentication errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear authentication data and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('tokenExpiry');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Validates and normalizes property ID input
 * This helper function ensures property IDs are properly formatted before API calls
 * @param {string|number} propertyId - The property ID to validate
 * @returns {number} Validated property ID as integer
 * @throws {Error} If property ID is invalid
 */
const validatePropertyId = (propertyId) => {
  const id = parseInt(propertyId);
  if (isNaN(id) || id <= 0) {
    throw new Error('Invalid property ID provided');
  }
  return id;
};

/**
 * Submit or update a property rating
 * This function allows users to rate properties on a 1-5 scale
 * The backend handles both new ratings and updates to existing ratings
 * @param {number} propertyId - The ID of the property to rate
 * @param {Object} ratingData - Object containing rating information
 * @param {number} ratingData.rating - Rating value (1-5)
 * @returns {Promise<Object>} Response containing success message and updated rating info
 */
export const submitPropertyRating = async (propertyId, { rating }) => {
  try {
    const validatedId = validatePropertyId(propertyId);

    // Validate rating value on the frontend before sending to server
    if (!rating || isNaN(rating)) {
      throw new Error('Rating is required and must be a number');
    }

    const ratingValue = parseInt(rating);
    if (ratingValue < 1 || ratingValue > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Send the rating to the backend API
    const response = await apiClient.post('/user-interactions/rating', {
      property_id: validatedId,
      rating: ratingValue
    });

    return response.data;
  } catch (error) {
    console.error('Error submitting rating:', error);
    
    // Handle different types of errors with specific messages
    if (error.response?.status === 400) {
      const errorMessage = error.response.data?.error;
      if (errorMessage?.includes('own property')) {
        throw new Error('You cannot rate your own property');
      }
      throw new Error(errorMessage || 'Invalid rating data');
    } else if (error.response?.status === 401) {
      throw new Error('Please login to rate properties');
    } else if (error.response?.status === 404) {
      throw new Error('Property not found');
    }
    
    throw new Error('Failed to submit rating. Please try again.');
  }
};

/**
 * Get the current user's rating for a specific property
 * This function retrieves the rating that the logged-in user has given to a property
 * @param {Object} params - Parameters object
 * @param {number} params.property_id - The property ID to get rating for
 * @returns {Promise<Object>} Object containing rating and timestamp, or null if no rating
 */
export const getPropertyRating = async ({ property_id }) => {
  try {
    const validatedId = validatePropertyId(property_id);
    const response = await apiClient.get(`/user-interactions/rating/${validatedId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching property rating:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Please login to view ratings');
    } else if (error.response?.status === 404) {
      throw new Error('Property not found');
    }
    
    throw new Error('Failed to load rating. Please try again.');
  }
};

/**
 * Submit a complaint about a property
 * This function allows users to report issues with properties to the property owner
 * @param {number} propertyId - The ID of the property to complain about
 * @param {string} complaintText - The complaint message (10-1000 characters)
 * @returns {Promise<Object>} Response confirming complaint submission
 */
export const submitComplaint = async (propertyId, complaintText) => {
  try {
    const validatedId = validatePropertyId(propertyId);

    // Validate complaint text before submission
    if (!complaintText || typeof complaintText !== 'string') {
      throw new Error('Complaint text is required');
    }

    const trimmedComplaint = complaintText.trim();
    if (trimmedComplaint.length < 10) {
      throw new Error('Complaint must be at least 10 characters long');
    }

    if (trimmedComplaint.length > 1000) {
      throw new Error('Complaint must not exceed 1000 characters');
    }

    const response = await apiClient.post('/user-interactions/complaint', {
      property_id: validatedId,
      complaint: trimmedComplaint
    });

    return response.data;
  } catch (error) {
    console.error('Error submitting complaint:', error);
    
    if (error.response?.status === 400) {
      throw new Error(error.response.data?.error || 'Invalid complaint data');
    } else if (error.response?.status === 401) {
      throw new Error('Please login to submit complaints');
    } else if (error.response?.status === 404) {
      throw new Error('Property not found');
    }
    
    throw new Error('Failed to submit complaint. Please try again.');
  }
};

/**
 * Check if a property is in the user's favorites
 * This function determines whether the current user has marked a property as favorite
 * @param {Object} params - Parameters object
 * @param {number} params.property_id - The property ID to check
 * @returns {Promise<Object>} Object with isFavourite boolean property
 */
export const isFavouriteStatus = async ({ property_id }) => {
  try {
    const validatedId = validatePropertyId(property_id);
    const response = await apiClient.get(`/user-interactions/favourite-status/${validatedId}`);
    return response.data;
  } catch (error) {
    console.error('Error checking favourite status:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Please login to check favorites');
    }
    
    // Return false as default if there's an error
    return { isFavourite: false };
  }
};

/**
 * Add or remove a property from user's favorites
 * This function toggles the favorite status of a property for the current user
 * @param {Object} params - Parameters object
 * @param {number} params.property_id - The property ID to update
 * @param {boolean} params.isFavourite - Whether to add (true) or remove (false) from favorites
 * @returns {Promise<Object>} Response confirming the favorite status change
 */
export const setFavouriteStatus = async ({ property_id, isFavourite }) => {
  try {
    const validatedId = validatePropertyId(property_id);

    const response = await apiClient.post('/user-interactions/favourite', {
      property_id: validatedId,
      isFavourite: Boolean(isFavourite)
    });

    return response.data;
  } catch (error) {
    console.error('Error setting favourite status:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Please login to manage favorites');
    } else if (error.response?.status === 404) {
      throw new Error('Property not found');
    }
    
    throw new Error('Failed to update favorites. Please try again.');
  }
};

/**
 * Get all properties marked as favorites by the current user
 * This function retrieves the complete list of properties the user has favorited
 * @param {Object} params - Optional parameters for pagination and filtering
 * @param {number} params.page - Page number for pagination (default: 1)
 * @param {number} params.limit - Number of items per page (default: 20)
 * @returns {Promise<Object>} Object containing favorite properties and pagination info
 */
export const getFavouriteProperties = async (params = {}) => {
  try {
    const { page = 1, limit = 20 } = params;
    const response = await apiClient.get('/user-interactions/favourites', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching favourite properties:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Please login to view favorites');
    }
    
    throw new Error('Failed to load favorite properties. Please try again.');
  }
};

/**
 * Get property complaints (for property owners)
 * This function allows property owners to view complaints submitted about their properties
 * @returns {Promise<Array>} Array of complaint objects with user and property information
 */
export const getPropertyComplaints = async () => {
  try {
    const response = await apiClient.get('/user-interactions/complaints');
    return response.data;
  } catch (error) {
    console.error('Error fetching property complaints:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Please login to view complaints');
    } else if (error.response?.status === 403) {
      throw new Error('Access denied. Property owner role required.');
    }
    
    throw new Error('Failed to load complaints. Please try again.');
  }
};

/**
 * Get detailed statistics for a property (for property owners)
 * This function provides comprehensive analytics about user interactions with a property
 * @param {number} propertyId - The property ID to get statistics for
 * @returns {Promise<Object>} Detailed statistics including ratings, favorites, and complaints
 */
export const getPropertyStatistics = async (propertyId) => {
  try {
    const validatedId = validatePropertyId(propertyId);
    const response = await apiClient.get(`/user-interactions/property-stats/${validatedId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching property statistics:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Please login to view statistics');
    } else if (error.response?.status === 403) {
      throw new Error('Access denied. You can only view stats for your own properties.');
    } else if (error.response?.status === 404) {
      throw new Error('Property not found');
    }
    
    throw new Error('Failed to load property statistics. Please try again.');
  }
};

/**
 * Toggle favorite status for a property
 * This convenience function automatically determines current status and toggles it
 * @param {number} propertyId - The property ID to toggle
 * @returns {Promise<Object>} Object with new favorite status and success message
 */
export const toggleFavourite = async (propertyId) => {
  try {
    const validatedId = validatePropertyId(propertyId);
    
    // First, get the current favorite status
    const currentStatus = await isFavouriteStatus({ property_id: validatedId });
    const newStatus = !currentStatus.isFavourite;
    
    // Then set the opposite status
    const result = await setFavouriteStatus({ 
      property_id: validatedId, 
      isFavourite: newStatus 
    });
    
    return { ...result, isFavourite: newStatus };
  } catch (error) {
    console.error('Error toggling favourite:', error);
    throw error;
  }
};

/**
 * Check if the current user has rated a specific property
 * This utility function helps determine whether to show rating or edit rating UI
 * @param {number} propertyId - The property ID to check
 * @returns {Promise<boolean>} True if user has rated the property, false otherwise
 */
export const hasUserRatedProperty = async (propertyId) => {
  try {
    const validatedId = validatePropertyId(propertyId);
    const rating = await getPropertyRating({ property_id: validatedId });
    return rating.rating !== null && rating.rating !== undefined;
  } catch (error) {
    console.error('Error checking if user has rated property:', error);
    return false;
  }
};

/**
 * Get comprehensive interaction data for a property
 * This function combines multiple API calls to provide complete interaction information
 * @param {number} propertyId - The property ID to get interactions for
 * @returns {Promise<Object>} Object containing favorite status, user rating, and interaction flags
 */
export const getPropertyInteractions = async (propertyId) => {
  try {
    const validatedId = validatePropertyId(propertyId);
    
    // Use Promise.allSettled to handle cases where some API calls might fail
    const [favouriteStatus, userRating] = await Promise.allSettled([
      isFavouriteStatus({ property_id: validatedId }),
      getPropertyRating({ property_id: validatedId })
    ]);

    return {
      isFavourite: favouriteStatus.status === 'fulfilled' ? favouriteStatus.value.isFavourite : false,
      userRating: userRating.status === 'fulfilled' ? userRating.value.rating : null,
      hasRated: userRating.status === 'fulfilled' ? 
        (userRating.value.rating !== null && userRating.value.rating !== undefined) : false
    };
  } catch (error) {
    console.error('Error fetching property interactions:', error);
    
    // Return safe defaults if there's an error
    return {
      isFavourite: false,
      userRating: null,
      hasRated: false
    };
  }
};

/**
 * Search properties with user interaction context
 * This function enhances property search results with user interaction data
 * @param {Object} searchParams - Search parameters
 * @param {string} searchParams.query - Search query string
 * @param {Object} searchParams.filters - Filter criteria
 * @param {number} searchParams.page - Page number for pagination
 * @param {number} searchParams.limit - Items per page
 * @returns {Promise<Object>} Search results with interaction data included
 */
export const searchPropertiesWithInteractions = async (searchParams = {}) => {
  try {
    const { query = '', filters = {}, page = 1, limit = 20 } = searchParams;
    
    const response = await apiClient.get('/user-interactions/search', {
      params: {
        q: query,
        page,
        limit,
        ...filters
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error searching properties with interactions:', error);
    
    if (error.response?.status === 400) {
      throw new Error('Invalid search parameters');
    }
    
    throw new Error('Failed to search properties. Please try again.');
  }
};

/**
 * Mark a complaint as resolved (for property owners)
 * This function allows property owners to mark complaints about their properties as resolved
 * @param {number} complaintId - The ID of the complaint to resolve
 * @returns {Promise<Object>} Response confirming the complaint resolution
 */
export const resolveComplaint = async (complaintId) => {
  try {
    const id = parseInt(complaintId);
    if (isNaN(id) || id <= 0) {
      throw new Error('Invalid complaint ID');
    }

    const response = await apiClient.patch(`/user-interactions/complaint/${id}/resolve`);
    return response.data;
  } catch (error) {
    console.error('Error resolving complaint:', error);
    
    if (error.response?.status === 403) {
      throw new Error('Access denied. You can only resolve complaints about your own properties.');
    } else if (error.response?.status === 404) {
      throw new Error('Complaint not found');
    }
    
    throw new Error('Failed to resolve complaint. Please try again.');
  }
};

/**
 * Get user's interaction history
 * This function provides a comprehensive view of all user interactions across properties
 * @param {Object} params - Parameters for filtering and pagination
 * @param {string} params.type - Type of interactions to filter ('rating', 'favourite', 'complaint', 'all')
 * @param {number} params.page - Page number for pagination
 * @param {number} params.limit - Items per page
 * @returns {Promise<Object>} User interaction history with pagination
 */
export const getUserInteractionHistory = async (params = {}) => {
  try {
    const { type = 'all', page = 1, limit = 20 } = params;
    
    const response = await apiClient.get('/user-interactions/history', {
      params: { type, page, limit }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching user interaction history:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Please login to view interaction history');
    }
    
    throw new Error('Failed to load interaction history. Please try again.');
  }
};

// Export all functions for easy importing in components
export default {
  submitPropertyRating,
  getPropertyRating,
  submitComplaint,
  isFavouriteStatus,
  setFavouriteStatus,
  getFavouriteProperties,
  getPropertyComplaints,
  getPropertyStatistics,
  toggleFavourite,
  hasUserRatedProperty,
  getPropertyInteractions,
  searchPropertiesWithInteractions,
  resolveComplaint,
  getUserInteractionHistory
};