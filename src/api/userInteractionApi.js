import { createApiClient } from './apiConfig';

const apiClient = createApiClient();

/**
 * Record a property view
 * @param {number} propertyId - The property ID
 * @param {number} viewDuration - Optional view duration in seconds
 * @returns {Promise} API response
 */
export const recordPropertyView = async (propertyId, viewDuration = null) => {
  try {
    const response = await apiClient.post('/user-interactions/view', {
      property_id: propertyId,
      view_duration: viewDuration
    });
    return response.data;
  } catch (error) {
    console.error('Error recording property view:', error);
    throw new Error(error.response?.data?.message || 'Failed to record property view');
  }
};

/**
 * Add property to favorites
 * @param {number} propertyId - The property ID to favorite
 * @returns {Promise} API response
 */
export const addToFavorites = async (propertyId) => {
  try {
    const response = await apiClient.post('/user-interactions/favorite', {
      property_id: propertyId
    });
    return response.data;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw new Error(error.response?.data?.message || 'Failed to add to favorites');
  }
};

/**
 * Remove property from favorites
 * @param {number} propertyId - The property ID to unfavorite
 * @returns {Promise} API response
 */
export const removeFromFavorites = async (propertyId) => {
  try {
    console.log('Removing property from favorites:', propertyId);
    
    const response = await apiClient.post('/user-interactions/favorite', {
      property_id: propertyId
    });
    
    console.log('Remove from favorites response:', response.data);
    
    // The API returns action: 'removed' when successfully removed
    if (response.data.action !== 'removed') {
      console.warn('Expected "removed" action but got:', response.data.action);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    console.error('Error response:', error.response?.data);
    throw new Error(error.response?.data?.message || 'Failed to remove from favorites');
  }
};

/**
 * Force remove property from favorites (for cases where toggle might not work)
 * @param {number} propertyId - The property ID to unfavorite
 * @returns {Promise} API response
 */
export const forceRemoveFromFavorites = async (propertyId) => {
  try {
    // First check if it's actually favorited
    const status = await checkFavoriteStatus(propertyId);
    
    if (status.is_favorited) {
      // If it's favorited, toggle to remove
      return await removeFromFavorites(propertyId);
    } else {
      // Already not favorited
      return {
        message: 'Property not in favorites',
        action: 'removed',
        property_id: propertyId
      };
    }
  } catch (error) {
    console.error('Error force removing from favorites:', error);
    throw new Error(error.response?.data?.message || 'Failed to remove from favorites');
  }
};

/**
 * Check if property is favorited by current user
 * @param {number} propertyId - The property ID to check
 * @returns {Promise} Full API response with status code handling
 */
export const checkFavoriteStatus = async (propertyId) => {
  try {
    const response = await apiClient.get(`/user-interactions/favorite/${propertyId}`);
    // Return full response for 304 handling
    if (response.status === 304 || response.status === 200) {
      return {
        status: response.status,
        data: response.data || { is_favorited: false, isFavorite: false }
      };
    }
    return response.data || { is_favorited: false, isFavorite: false };
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return { is_favorited: false, isFavorite: false };
  }
};

/**
 * Submit a property rating
 * @param {number} propertyId - The property ID
 * @param {Object} ratingData - Rating data containing rating_score and optional rating_comment
 * @returns {Promise} API response
 */
export const submitPropertyRating = async (propertyId, ratingData) => {
  try {
    const response = await apiClient.post('/user-interactions/rating', {
      property_id: propertyId,
      rating_score: ratingData.rating || ratingData.rating_score,
      rating_comment: ratingData.rating_comment || null
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting rating:', error);
    throw new Error(error.response?.data?.message || 'Failed to submit rating');
  }
};

/**
 * Get user's rating for a specific property
 * @param {number} propertyId - The property ID
 * @returns {Promise} Full API response with status code handling
 */
export const getUserPropertyRating = async (propertyId) => {
  try {
    const response = await apiClient.get(`/user-interactions/rating/${propertyId}`);
    // Return full response for 304 handling
    if (response.status === 304 || response.status === 200) {
      return {
        status: response.status,
        data: response.data || { has_rated: false, rating: null }
      };
    }
    return response.data || { has_rated: false, rating: null };
  } catch (error) {
    console.error('Error fetching user rating:', error);
    return { has_rated: false, rating: null };
  }
};

/**
 * Get overall property rating information
 * @param {number} propertyId - The property ID
 * @returns {Promise} Full API response with status code handling
 */
export const getPropertyRating = async (propertyId) => {
  try {
    const response = await apiClient.get(`/user-interactions/property-rating/${propertyId}`);
    // Return full response for 304 handling
    if (response.status === 304 || response.status === 200) {
      return {
        status: response.status,
        data: response.data || { 
          property_id: propertyId,
          total_ratings: 0,
          average_rating: 0,
          rating_distribution: {},
          recent_ratings: [],
          user_rating: null,
          has_rated: false
        }
      };
    }
    return response.data || { 
      property_id: propertyId,
      total_ratings: 0,
      average_rating: 0,
      rating_distribution: {},
      recent_ratings: [],
      user_rating: null,
      has_rated: false
    };
  } catch (error) {
    console.error('Error fetching property rating:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch property rating');
  }
};

/**
 * Get property statistics (public access for basic stats)
 * @param {number} propertyId - The property ID
 * @returns {Promise} Property statistics
 */
export const getPropertyStatistics = async (propertyId) => {
  try {
    const response = await apiClient.get(`/user-interactions/statistics/${propertyId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching property statistics:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch property statistics');
  }
};

/**
 * Submit a report about a property
 * @param {number} propertyId - The property ID
 * @param {Object} reportData - Report data containing reason and description
 * @returns {Promise} API response
 */
export const submitReport = async (propertyId, reportData) => {
  try {
    const response = await apiClient.post('/user-interactions/complaint', {
      property_id: propertyId,
      category: reportData.reason,
      description: reportData.description
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting report:', error);
    throw new Error(error.response?.data?.message || 'Failed to submit report');
  }
};

/**
 * Submit a complaint about a property
 * @param {number} propertyId - The property ID
 * @param {Object} complaintData - Complaint data
 * @returns {Promise} API response
 */
export const submitComplaint = async (propertyId, complaintData) => {
  try {
    const response = await apiClient.post('/user-interactions/complaint', {
      property_id: propertyId,
      category: complaintData.category,
      description: complaintData.description
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting complaint:', error);
    throw new Error(error.response?.data?.message || 'Failed to submit complaint');
  }
};

/**
 * Get user's favorite properties
 * @param {Object} options - Query options (page, limit)
 * @returns {Promise} User's favorite properties
 */
export const getUserFavorites = async (options = {}) => {
  try {
    const { page = 1, limit = 10 } = options;
    const response = await apiClient.get(`/user-interactions/favorites?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user favorites:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch favorites');
  }
};

/**
 * Get user's favourite properties (alias for getUserFavorites)
 * @param {Object} options - Query options (page, limit)
 * @returns {Promise} User's favourite properties
 */
export const getFavouriteProperties = async (options = {}) => {
  return getUserFavorites(options);
};

/**
 * Set favorite status for a property (toggle functionality)
 * @param {number} propertyId - The property ID
 * @param {boolean} isFavorite - Whether to set as favorite or not
 * @returns {Promise} API response
 */
export const setFavouriteStatus = async (propertyId, isFavorite) => {
  try {
    const response = await apiClient.post('/user-interactions/favorite', {
      property_id: propertyId
    });
    return response.data;
  } catch (error) {
    console.error('Error setting favorite status:', error);
    throw new Error(error.response?.data?.message || 'Failed to update favorite status');
  }
};

/**
 * Check if property is favorited (alias for checkFavoriteStatus)
 * @param {number} propertyId - The property ID
 * @returns {Promise<boolean>} Whether the property is favorited
 */
export const isFavouriteStatus = async (propertyId) => {
  return checkFavoriteStatus(propertyId);
};

/**
 * Submit a property review (alias for submitPropertyRating)
 * @param {number} propertyId - The property ID
 * @param {Object} reviewData - Review data
 * @returns {Promise} API response
 */
export const submitPropertyReview = async (propertyId, reviewData) => {
  return submitPropertyRating(propertyId, reviewData);
};

/**
 * Get property reviews (gets overall rating data)
 * @param {number} propertyId - The property ID
 * @returns {Promise} Property reviews
 */
export const getPropertyReviews = async (propertyId) => {
  return getPropertyRating(propertyId);
};

/**
 * Get property rating summary (alias for getPropertyRating)
 * @param {number} propertyId - The property ID
 * @returns {Promise} Rating summary
 */
export const getPropertyRatingSummary = async (propertyId) => {
  return getPropertyRating(propertyId);
};

/**
 * Get property complaints (for property owners/admins)
 * @param {number} propertyId - The property ID
 * @returns {Promise} Property complaints
 */
export const getPropertyComplaints = async (propertyId) => {
  try {
    const response = await apiClient.get(`/user-interactions/complaints/${propertyId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching property complaints:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch complaints');
  }
};

/**
 * Get user interaction history
 * @param {Object} options - Filter options (type, page, limit)
 * @returns {Promise} User interaction history
 */
export const getUserInteractionHistory = async (options = {}) => {
  try {
    const { type, page = 1, limit = 10 } = options;
    let url = `/user-interactions/history?page=${page}&limit=${limit}`;
    if (type) {
      url += `&type=${type}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching user interaction history:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch interaction history');
  }
};

/**
 * Update a user review/rating
 * @param {number} propertyId - The property ID
 * @param {Object} reviewData - Updated review data
 * @returns {Promise} API response
 */
export const updateUserReview = async (propertyId, reviewData) => {
  return submitPropertyRating(propertyId, reviewData);
};

/**
 * Delete a user's rating for a property
 * @param {number} propertyId - The property ID
 * @returns {Promise} API response
 */
export const deletePropertyRating = async (propertyId) => {
  try {
    const response = await apiClient.delete(`/user-interactions/rating/${propertyId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting rating:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete rating');
  }
};

export default {
  recordPropertyView,
  addToFavorites,
  removeFromFavorites,
  checkFavoriteStatus,
  submitPropertyRating,
  getUserPropertyRating,
  getPropertyRating,
  getPropertyStatistics,
  submitReport,
  submitComplaint,
  getUserFavorites,
  getFavouriteProperties,
  setFavouriteStatus,
  isFavouriteStatus,
  submitPropertyReview,
  getPropertyReviews,
  getPropertyRatingSummary,
  getPropertyComplaints,
  getUserInteractionHistory,
  updateUserReview,
  deletePropertyRating
};