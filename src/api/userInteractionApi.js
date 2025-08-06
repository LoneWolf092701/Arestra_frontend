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

const validateRating = (rating) => {
  const numRating = parseFloat(rating);
  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }
  return numRating;
};

export const submitPropertyRating = async (propertyId, ratingData) => {
  try {
    const validatedId = validatePropertyId(propertyId);
    const validatedRating = validateRating(ratingData.rating);
    
    const payload = {
      property_id: validatedId,
      rating_score: validatedRating,
      rating_comment: ratingData.comment || ''
    };
    
    const response = await apiClient.post('/user-interactions/rating', payload);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error submitting property rating:', error);
    
    if (error.response?.status === 400) {
      throw new Error(error.response.data?.message || 'Invalid rating data');
    } else if (error.response?.status === 401) {
      throw new Error('Please log in to rate properties');
    } else if (error.response?.status === 409) {
      throw new Error('You have already rated this property');
    }
    
    throw new Error('Failed to submit rating');
  }
};

export const getUserPropertyRating = async (propertyId) => {
  try {
    const validatedId = validatePropertyId(propertyId);
    
    const response = await apiClient.get(`/user-interactions/rating/${validatedId}`);
    
    if (!response.data) {
      return null;
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching user property rating:', error);
    
    if (error.response?.status === 404) {
      return null;
    }
    
    return null;
  }
};

export const addToFavorites = async (propertyId) => {
  try {
    const validatedId = validatePropertyId(propertyId);
    
    const payload = {
      property_id: validatedId,
      interaction_type: 'favorite'
    };
    
    const response = await apiClient.post('/user-interactions/favorite', payload);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Please log in to add favorites');
    } else if (error.response?.status === 409) {
      throw new Error('Property is already in your favorites');
    }
    
    throw new Error('Failed to add to favorites');
  }
};

export const removeFromFavorites = async (propertyId) => {
  try {
    const validatedId = validatePropertyId(propertyId);
    
    const response = await apiClient.delete(`/user-interactions/favorite/${validatedId}`);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Please log in to manage favorites');
    } else if (error.response?.status === 404) {
      throw new Error('Property is not in your favorites');
    }
    
    throw new Error('Failed to remove from favorites');
  }
};

export const checkFavoriteStatus = async (propertyId) => {
  try {
    const validatedId = validatePropertyId(propertyId);
    
    const response = await apiClient.get(`/user-interactions/favorite-status/${validatedId}`);
    
    return response.data?.is_favorite || false;
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
};

export const getUserFavorites = async (options = {}) => {
  try {
    const { page = 1, limit = 20 } = options;
    
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    const response = await apiClient.get(`/user-interactions/favorites?${params.toString()}`);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching user favorites:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Please log in to view favorites');
    }
    
    return {
      favorites: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
      }
    };
  }
};

export const getFavouriteProperties = getUserFavorites;

export const setFavouriteStatus = async (propertyId, isFavorite) => {
  try {
    const validatedId = validatePropertyId(propertyId);
    
    if (isFavorite) {
      return await addToFavorites(validatedId);
    } else {
      return await removeFromFavorites(validatedId);
    }
  } catch (error) {
    throw error;
  }
};

export const isFavouriteStatus = checkFavoriteStatus;

export const getPropertyRating = async (propertyId) => {
  try {
    const validatedId = validatePropertyId(propertyId);
    
    const response = await apiClient.get(`/user-interactions/property-rating/${validatedId}`);
    
    if (!response.data) {
      return {
        average_rating: 0,
        total_ratings: 0
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching property rating:', error);
    
    return {
      average_rating: 0,
      total_ratings: 0
    };
  }
};

export const submitPropertyReview = async (propertyId, reviewData) => {
  try {
    const validatedId = validatePropertyId(propertyId);
    
    const payload = {
      property_id: validatedId,
      rating_score: validateRating(reviewData.rating),
      rating_comment: reviewData.comment || ''
    };
    
    const response = await apiClient.post('/user-interactions/review', payload);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error submitting property review:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Please log in to submit reviews');
    }
    
    throw new Error('Failed to submit review');
  }
};

export const getPropertyReviews = async (propertyId, options = {}) => {
  try {
    const validatedId = validatePropertyId(propertyId);
    const { page = 1, limit = 10 } = options;
    
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    const response = await apiClient.get(`/user-interactions/reviews/${validatedId}?${params.toString()}`);
    
    if (!response.data) {
      return {
        reviews: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching property reviews:', error);
    
    return {
      reviews: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      }
    };
  }
};

export const getPropertyRatingSummary = async (propertyId) => {
  try {
    const validatedId = validatePropertyId(propertyId);
    
    const response = await apiClient.get(`/user-interactions/rating-summary/${validatedId}`);
    
    if (!response.data) {
      return {
        average_rating: 0,
        total_ratings: 0,
        rating_distribution: {
          5: 0, 4: 0, 3: 0, 2: 0, 1: 0
        }
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching property rating summary:', error);
    
    return {
      average_rating: 0,
      total_ratings: 0,
      rating_distribution: {
        5: 0, 4: 0, 3: 0, 2: 0, 1: 0
      }
    };
  }
};

export const submitReport = async (reportData) => {
  try {
    const payload = {
      property_id: reportData.propertyId,
      complaint_category: reportData.category,
      complaint_description: reportData.description
    };
    
    const response = await apiClient.post('/user-interactions/report', payload);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error submitting report:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Please log in to submit reports');
    }
    
    throw new Error('Failed to submit report');
  }
};

export const submitComplaint = submitReport;

export const getPropertyComplaints = async (options = {}) => {
  try {
    const response = await apiClient.get('/user-interactions/complaints', {
      params: {
        type: 'property',
        ...options
      }
    });
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching property complaints:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Please log in to view complaints');
    }
    
    return [];
  }
};

export const getUserInteractionHistory = async (options = {}) => {
  try {
    const { page = 1, limit = 20, type } = options;
    
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (type) params.append('type', type);
    
    const response = await apiClient.get(`/user-interactions/history?${params.toString()}`);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching interaction history:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Please log in to view interaction history');
    }
    
    return {
      interactions: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
      }
    };
  }
};

export const updateUserReview = async (interactionId, reviewData) => {
  try {
    const payload = {
      rating_score: validateRating(reviewData.rating),
      rating_comment: reviewData.comment || ''
    };
    
    const response = await apiClient.put(`/user-interactions/review/${interactionId}`, payload);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error updating user review:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Please log in to update reviews');
    } else if (error.response?.status === 404) {
      throw new Error('Review not found');
    }
    
    throw new Error('Failed to update review');
  }
};

export const recordPropertyView = async (propertyId, viewData = {}) => {
  try {
    const validatedId = validatePropertyId(propertyId);
    
    const payload = {
      property_id: validatedId,
      interaction_type: 'view',
      view_duration: viewData.duration || null
    };
    
    const response = await apiClient.post('/user-interactions/view', payload);
    
    return response.data || true;
  } catch (error) {
    console.error('Error recording property view:', error);
    return false;
  }
};

export const incrementPropertyViews = recordPropertyView;