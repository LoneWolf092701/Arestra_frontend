import axios from 'axios';
import { clearAuthData, isAuthenticated, getAuthToken } from '../utils/auth';

/**
 * API Configuration and Client Setup
 * This module provides centralized configuration for all API clients
 * including authentication, error handling, and request/response interceptors
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Default axios configuration
 * This configuration is used across all API clients for consistency
 */
export const defaultAxiosConfig = {
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * Create a configured axios instance
 * This factory function creates axios instances with standard configuration
 * @param {Object} customConfig - Custom configuration to override defaults
 * @returns {AxiosInstance} Configured axios instance
 */
export const createApiClient = (customConfig = {}) => {
  const client = axios.create({
    ...defaultAxiosConfig,
    ...customConfig,
  });

  setupRequestInterceptor(client);
  setupResponseInterceptor(client);

  return client;
};

/**
 * Setup request interceptor for authentication
 * This interceptor automatically adds authentication tokens to requests
 * @param {AxiosInstance} client - Axios instance to configure
 */
export const setupRequestInterceptor = (client) => {
  client.interceptors.request.use(
    (config) => {
      try {
        if (isAuthenticated()) {
          const token = getAuthToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }

        if (process.env.NODE_ENV === 'development') {
          console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        }

        return config;
      } catch (error) {
        console.error('Request interceptor error:', error);
        return config;
      }
    },
    (error) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  );
};

/**
 * Setup response interceptor for error handling
 * This interceptor handles common HTTP errors and authentication failures
 * @param {AxiosInstance} client - Axios instance to configure
 */
export const setupResponseInterceptor = (client) => {
  client.interceptors.response.use(
    (response) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`API Response: ${response.status} ${response.config.url}`);
      }

      handleTokenWarning(response);
      return response;
    },
    (error) => {
      handleApiError(error);
      return Promise.reject(error);
    }
  );
};

/**
 * Handle token expiration warnings from server
 * This function processes server-side token warnings
 * @param {AxiosResponse} response - API response to check for warnings
 */
const handleTokenWarning = (response) => {
  try {
    const tokenWarning = response.headers['x-token-warning'];
    if (tokenWarning) {
      console.warn('Token expiring soon:', tokenWarning);
      
      if (typeof window !== 'undefined' && window.showTokenWarning) {
        window.showTokenWarning('Your session will expire soon. Please save your work.');
      }
    }
  } catch (error) {
    console.error('Error handling token warning:', error);
  }
};

/**
 * Handle API errors globally
 * This function provides consistent error handling across all API calls
 * @param {AxiosError} error - Axios error object
 */
const handleApiError = (error) => {
  try {
    const { response, request, config } = error;

    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', {
        url: config?.url,
        method: config?.method,
        status: response?.status,
        message: error.message,
      });
    }

    if (response) {
      switch (response.status) {
        case 401:
          handleUnauthorizedError(error);
          break;
        case 403:
          handleForbiddenError(error);
          break;
        case 404:
          handleNotFoundError(error);
          break;
        case 422:
          handleValidationError(error);
          break;
        case 429:
          handleRateLimitError(error);
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          handleServerError(error);
          break;
        default:
          console.error('Unhandled API error:', response.status, response.data);
      }
    } else if (request) {
      handleNetworkError(error);
    } else {
      console.error('Request setup error:', error.message);
    }
  } catch (handlingError) {
    console.error('Error in error handler:', handlingError);
  }
};

/**
 * Handle 401 Unauthorized errors
 * This clears authentication data and redirects to login
 * @param {AxiosError} error - The 401 error
 */
const handleUnauthorizedError = (error) => {
  console.warn('Authentication failed, clearing auth data');
  clearAuthData();

  if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
    const currentPath = window.location.pathname;
    const redirectPath = `/login?redirect=${encodeURIComponent(currentPath)}`;
    window.location.href = redirectPath;
  }
};

/**
 * Handle 403 Forbidden errors
 * This handles insufficient permissions errors
 * @param {AxiosError} error - The 403 error
 */
const handleForbiddenError = (error) => {
  console.warn('Access forbidden:', error.response?.data?.message);
  
  if (typeof window !== 'undefined' && window.showErrorMessage) {
    window.showErrorMessage(
      error.response?.data?.message || 'You do not have permission to perform this action.'
    );
  }
};

/**
 * Handle 404 Not Found errors
 * This handles resource not found errors
 * @param {AxiosError} error - The 404 error
 */
const handleNotFoundError = (error) => {
  console.warn('Resource not found:', error.config?.url);
  
  if (process.env.NODE_ENV === 'development') {
    console.error('404 Error details:', error.response?.data);
  }
};

/**
 * Handle 422 Validation errors
 * This handles form validation and data validation errors
 * @param {AxiosError} error - The 422 error
 */
const handleValidationError = (error) => {
  console.warn('Validation error:', error.response?.data);
  
  if (typeof window !== 'undefined' && window.showValidationErrors) {
    const errors = error.response?.data?.errors || {};
    window.showValidationErrors(errors);
  }
};

/**
 * Handle 429 Rate Limit errors
 * This handles too many requests errors
 * @param {AxiosError} error - The 429 error
 */
const handleRateLimitError = (error) => {
  console.warn('Rate limit exceeded');
  
  const retryAfter = error.response?.headers['retry-after'] || '60';
  const message = `Too many requests. Please wait ${retryAfter} seconds before trying again.`;
  
  if (typeof window !== 'undefined' && window.showErrorMessage) {
    window.showErrorMessage(message);
  }
};

/**
 * Handle 5xx Server errors
 * This handles internal server errors
 * @param {AxiosError} error - The server error
 */
const handleServerError = (error) => {
  console.error('Server error:', error.response?.status, error.response?.data);
  
  const message = 'Server error occurred. Please try again later.';
  
  if (typeof window !== 'undefined' && window.showErrorMessage) {
    window.showErrorMessage(message);
  }
};

/**
 * Handle network errors
 * This handles connection and network-related errors
 * @param {AxiosError} error - The network error
 */
const handleNetworkError = (error) => {
  console.error('Network error:', error.message);
  
  const message = 'Network error. Please check your connection and try again.';
  
  if (typeof window !== 'undefined' && window.showErrorMessage) {
    window.showErrorMessage(message);
  }
};

/**
 * Create API client for file uploads
 * This creates a specialized client for multipart form uploads
 * @returns {AxiosInstance} Upload-configured axios instance
 */
export const createUploadClient = () => {
  return createApiClient({
    timeout: 120000,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * Create API client for JSON requests
 * This creates a standard client for JSON API requests
 * @returns {AxiosInstance} JSON-configured axios instance
 */
export const createJsonClient = () => {
  return createApiClient({
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/**
 * API endpoint constants
 * This provides centralized endpoint definitions
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    VALIDATE: '/auth/validate',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  
  PROPERTIES: {
    PUBLIC: '/properties/public',
    MY_PROPERTIES: '/properties/my-properties',
    DETAILS: '/properties/details',
    CREATE: '/properties',
    UPDATE: '/properties',
    DELETE: '/properties',
    IMAGES: '/properties/{id}/images',
    STATISTICS: '/properties/statistics',
    SEARCH: '/properties/search',
    TYPES: '/properties/types',
    SIMILAR: '/properties/{id}/similar',
    VIEW: '/properties/{id}/view',
  },
  
  USER_INTERACTIONS: {
    RATING: '/user-interactions/properties/{id}/rating',
    MY_RATING: '/user-interactions/properties/{id}/my-rating',
    FAVORITE: '/user-interactions/properties/{id}/favorite',
    FAVORITE_STATUS: '/user-interactions/properties/{id}/favorite-status',
    FAVORITES: '/user-interactions/favorites',
    REVIEW: '/user-interactions/properties/{id}/review',
    REVIEWS: '/user-interactions/properties/{id}/reviews',
    RATING_SUMMARY: '/user-interactions/properties/{id}/rating-summary',
    REPORT: '/user-interactions/report',
    HISTORY: '/user-interactions/history',
  },
  
  BOOKINGS: {
    CREATE: '/bookings',
    USER_BOOKINGS: '/bookings/user',
    OWNER_BOOKINGS: '/bookings/owner',
    RESPOND: '/bookings/{id}/respond',
    PAYMENT: '/bookings/{id}/payment',
    VERIFY_PAYMENT: '/bookings/{id}/verify-payment',
    DETAILS: '/bookings/{id}',
    AVAILABILITY: '/bookings/property/{id}/availability',
    STATUS: '/bookings/property/{id}/status',
    UPDATE_STATUS: '/bookings/{id}/status',
    CANCEL: '/bookings/{id}/cancel',
    STATISTICS: '/bookings/owner/statistics',
  },
  
  ADMIN: {
    DASHBOARD_STATS: '/admin/dashboard-stats',
    USERS: '/admin/users',
    USER_STATUS: '/admin/user/{id}/status',
    USER_DETAILS: '/admin/user/{id}',
    PENDING_PROPERTIES: '/admin/properties/pending',
    ALL_PROPERTIES: '/admin/properties',
    PROPERTY_APPROVAL: '/admin/property/{id}/approval',
    PROPERTY_DETAILS: '/admin/property/{id}',
    DELETE_PROPERTY: '/admin/property/{id}',
    BOOKINGS: '/admin/bookings',
    ACTIVITY_LOGS: '/admin/activity-logs',
    PROPERTY_APPROVAL_STATS: '/admin/property-approval-stats',
    USER_STATISTICS: '/admin/user-statistics',
    SYSTEM_CONFIG: '/admin/system-config',
    ANNOUNCEMENTS: '/admin/announcements',
    REPORTED_CONTENT: '/admin/reported-content',
    RESOLVE_REPORT: '/admin/reported-content/{id}/resolve',
    EXPORT: '/admin/export',
  },
  
  PROFILE: {
    GET: '/profile',
    UPDATE: '/profile',
    CHANGE_PASSWORD: '/profile/password',
    UPLOAD_IMAGE: '/profile/upload-image',
    DELETE_IMAGE: '/profile/image',
  },
  
  UPLOAD: {
    SINGLE: '/upload/single',
    MULTIPLE: '/upload/multiple',
    MIXED: '/upload/mixed',
    DELETE_FILE: '/upload/file',
    PROGRESS: '/upload/progress/{id}',
    CANCEL: '/upload/cancel/{id}',
  },
};

/**
 * Utility function to replace path parameters
 * This helps build URLs with dynamic parameters
 * @param {string} endpoint - Endpoint template with {id} placeholders
 * @param {Object} params - Parameters to replace in the template
 * @returns {string} Endpoint with parameters replaced
 */
export const buildEndpoint = (endpoint, params = {}) => {
  let builtEndpoint = endpoint;
  
  Object.keys(params).forEach(key => {
    builtEndpoint = builtEndpoint.replace(`{${key}}`, params[key]);
  });
  
  return builtEndpoint;
};

export default {
  createApiClient,
  createUploadClient,
  createJsonClient,
  API_ENDPOINTS,
  buildEndpoint,
};