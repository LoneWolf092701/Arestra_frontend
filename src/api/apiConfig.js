import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const createApiClient = (config = {}) => {
  const defaultConfig = {
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const apiClient = axios.create({ ...defaultConfig, ...config });

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

  return apiClient;
};

const handleApiError = (error) => {
  console.error('API Error:', error);
  
  const message = 'An error occurred. Please try again later.';
  
  if (typeof window !== 'undefined' && window.showErrorMessage) {
    window.showErrorMessage(message);
  }
};

const handleNetworkError = (error) => {
  console.error('Network error:', error.message);
  
  const message = 'Network error. Please check your connection and try again.';
  
  if (typeof window !== 'undefined' && window.showErrorMessage) {
    window.showErrorMessage(message);
  }
};

export const createUploadClient = () => {
  return createApiClient({
    timeout: 120000,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const createJsonClient = () => {
  return createApiClient({
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

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
    PUBLIC_DETAILS: '/properties/public/{id}',
    MY_PROPERTIES: '/properties/owner/mine',
    CREATE: '/properties',
    UPDATE: '/properties/{id}',
    DELETE: '/properties/{id}',
    IMAGES: '/properties/{id}/images',
    STATISTICS: '/properties/{id}/statistics',
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
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    USER_STATUS: '/admin/users/{id}/status',
    USER_DETAILS: '/admin/users/{id}',
    PENDING_PROPERTIES: '/admin/properties/pending',
    ALL_PROPERTIES: '/admin/properties',
    PROPERTY_APPROVAL: '/admin/properties/{id}/approval',
    PROPERTY_DETAILS: '/admin/properties/{id}',
    DELETE_PROPERTY: '/admin/properties/{id}',
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

  SETTINGS: {
  GET: '/settings',
  UPDATE: '/settings'
}
};

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