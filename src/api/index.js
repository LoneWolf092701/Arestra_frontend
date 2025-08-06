/**
 * API Index - Centralized API Exports
 * This file provides a single entry point for all API functions
 * organized by feature domain for easy importing in components
 */

// Authentication API imports
import {
  loginUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  resendEmailVerification,
  validateToken,
  changePasswordAuth,
  logoutUser,
  checkAuthStatus,
  getCurrentUserRole,
  getCurrentUserId,
  refreshToken,
  getCurrentUser,
  updateLastLogin,
  getAuthConfig,
  validatePasswordStrength
} from './authApi';

// Profile Management API imports
import {
  getUserProfile,
  updateUserProfile,
  changePassword as changePasswordProfile,
  uploadProfileImage,
  deleteProfileImage,
  getProfileStatistics,
  updateProfilePreferences,
  getProfilePreferences,
  updateNotificationSettings,
  getNotificationSettings,
  getProfileActivityHistory,
  updateSecuritySettings,
  getSecuritySettings,
  enableTwoFactorAuth,
  disableTwoFactorAuth,
  generateBackupCodes,
  verifyTwoFactorSetup,
  requestAccountDeletion,
  exportProfileData,
  validateProfileCompleteness,
  updateProfileAvatar,
  getProfileConnectedAccounts,
  connectAccount,
  disconnectAccount
} from './profileApi';

// Property Management API imports
import {
  getAllPublicProperties,
  getAllProperties,
  getPropertyDetailsById,
  getPublicPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getMyProperties,
  getOwnerProperties,
  addPropertyDetails,
  togglePropertyStatus,
  uploadPropertyImages,
  deletePropertyImage,
  getPropertyStatistics,
  searchProperties,
  getPropertyTypes,
  recordPropertyView,
  incrementPropertyViews,
  getSimilarProperties
} from './propertyApi';

// User Interactions API imports
import {
  submitPropertyRating,
  getUserPropertyRating,
  addToFavorites,
  removeFromFavorites,
  checkFavoriteStatus,
  getUserFavorites,
  getFavouriteProperties,
  setFavouriteStatus,
  isFavouriteStatus,
  getPropertyRating,
  submitPropertyReview,
  getPropertyReviews,
  getPropertyRatingSummary,
  submitReport,
  submitComplaint,
  getPropertyComplaints,
  getUserInteractionHistory,
  updateUserReview
} from './userInteractionApi';

// Booking Management API imports
import {
  submitBookingRequest,
  getUserBookings,
  getOwnerBookings,
  respondToBookingRequest,
  submitPayment,
  verifyPayment,
  getBookingDetails,
  getPropertyAvailability,
  getPropertyAvailabilityStatus,
  updateBookingStatus,
  cancelBooking,
  getBookingStatistics,
  uploadBookingDocuments,
  getBookingsByDateRange,
  getBookingHistory,
  exportBookingData,
  validateBookingRequest
} from './bookingApi';

// Admin Management API imports
import {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  getUserDetails,
  getPendingProperties,
  getAllPropertiesAdmin,
  getApprovedProperties,
  approveRejectProperty,
  approveProperty,
  rejectProperty,
  getPropertyDetailsAdmin,
  deletePropertyAdmin,
  removeProperty,
  getBookingRequestsAdmin,
  getActivityLogs,
  getPropertyApprovalStats,
  getUserStatistics,
  updateSystemConfig,
  getSystemConfig,
  createAnnouncement,
  getAnnouncements,
  getReportedContent,
  resolveReport,
  exportAdminData,
  getSystemHealth,
  getFinancialReports
} from './adminAPI';

// Image Upload API imports
import {
  validateImageFile,
  uploadSingleImage,
  uploadImage,
  uploadMultipleImages,
  uploadMixedFiles,
  deleteUploadedFile,
  getUploadProgress,
  cancelUpload,
  resizeImage
} from './ImageUploadApi';

// API Configuration imports
import {
  createApiClient,
  createUploadClient,
  createJsonClient,
  API_ENDPOINTS,
  buildEndpoint
} from './apiConfig';

// Re-export all functions for individual imports
export {
  loginUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  resendEmailVerification,
  validateToken,
  changePasswordAuth,
  logoutUser,
  checkAuthStatus,
  getCurrentUserRole,
  getCurrentUserId,
  refreshToken,
  getCurrentUser,
  updateLastLogin,
  getAuthConfig,
  validatePasswordStrength
};

export {
  getUserProfile,
  updateUserProfile,
  changePasswordProfile,
  uploadProfileImage,
  deleteProfileImage,
  getProfileStatistics,
  updateProfilePreferences,
  getProfilePreferences,
  updateNotificationSettings,
  getNotificationSettings,
  getProfileActivityHistory,
  updateSecuritySettings,
  getSecuritySettings,
  enableTwoFactorAuth,
  disableTwoFactorAuth,
  generateBackupCodes,
  verifyTwoFactorSetup,
  requestAccountDeletion,
  exportProfileData,
  validateProfileCompleteness,
  updateProfileAvatar,
  getProfileConnectedAccounts,
  connectAccount,
  disconnectAccount
};

export {
  getAllPublicProperties,
  getAllProperties,
  getPropertyDetailsById,
  getPublicPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getMyProperties,
  getOwnerProperties,
  addPropertyDetails,
  togglePropertyStatus,
  uploadPropertyImages,
  deletePropertyImage,
  getPropertyStatistics,
  searchProperties,
  getPropertyTypes,
  recordPropertyView,
  incrementPropertyViews,
  getSimilarProperties
};

export {
  submitPropertyRating,
  getUserPropertyRating,
  addToFavorites,
  removeFromFavorites,
  checkFavoriteStatus,
  getUserFavorites,
  getFavouriteProperties,
  setFavouriteStatus,
  isFavouriteStatus,
  getPropertyRating,
  submitPropertyReview,
  getPropertyReviews,
  getPropertyRatingSummary,
  submitReport,
  submitComplaint,
  getPropertyComplaints,
  getUserInteractionHistory,
  updateUserReview
};

export {
  submitBookingRequest,
  getUserBookings,
  getOwnerBookings,
  respondToBookingRequest,
  submitPayment,
  verifyPayment,
  getBookingDetails,
  getPropertyAvailability,
  getPropertyAvailabilityStatus,
  updateBookingStatus,
  cancelBooking,
  getBookingStatistics,
  uploadBookingDocuments,
  getBookingsByDateRange,
  getBookingHistory,
  exportBookingData,
  validateBookingRequest
};

export {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  getUserDetails,
  getPendingProperties,
  getAllPropertiesAdmin,
  getApprovedProperties,
  approveRejectProperty,
  approveProperty,
  rejectProperty,
  getPropertyDetailsAdmin,
  deletePropertyAdmin,
  removeProperty,
  getBookingRequestsAdmin,
  getActivityLogs,
  getPropertyApprovalStats,
  getUserStatistics,
  updateSystemConfig,
  getSystemConfig,
  createAnnouncement,
  getAnnouncements,
  getReportedContent,
  resolveReport,
  exportAdminData,
  getSystemHealth,
  getFinancialReports
};

export {
  validateImageFile,
  uploadSingleImage,
  uploadImage,
  uploadMultipleImages,
  uploadMixedFiles,
  deleteUploadedFile,
  getUploadProgress,
  cancelUpload,
  resizeImage
};

export {
  createApiClient,
  createUploadClient,
  createJsonClient,
  API_ENDPOINTS,
  buildEndpoint
};

// Utility functions for common operations
export const apiUtils = {
  formatCurrency: (amount, currency = 'LKR') => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount || 0);
  },

  formatDate: (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  formatDateTime: (dateTimeString) => {
    if (!dateTimeString) return 'Not specified';
    return new Date(dateTimeString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  getStatusColor: (status) => {
    const statusColors = {
      'pending': 'warning',
      'approved': 'info',
      'payment_submitted': 'primary',
      'confirmed': 'success',
      'rejected': 'error',
      'auto_rejected': 'error',
      'payment_rejected': 'error',
      'cancelled': 'default',
      'active': 'success',
      'inactive': 'default'
    };
    return statusColors[status] || 'default';
  },

  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  validatePhone: (phone) => {
    const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
    return phoneRegex.test(phone);
  },

  sanitizeInput: (input) => {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/[<>]/g, '');
  },

  buildQueryString: (params) => {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            searchParams.append(key, value.join(','));
          }
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });
    
    return searchParams.toString();
  },

  handleApiError: (error, defaultMessage = 'An error occurred') => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    } else if (error.message) {
      return error.message;
    } else {
      return defaultMessage;
    }
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    
    if (!token) return false;
    
    if (tokenExpiry) {
      const expiryTime = parseInt(tokenExpiry);
      const currentTime = new Date().getTime();
      
      if (currentTime >= expiryTime) {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        localStorage.removeItem('tokenExpiry');
        return false;
      }
    }
    
    return true;
  },

  getUserRole: () => {
    return localStorage.getItem('userRole');
  },

  getUserId: () => {
    const userId = localStorage.getItem('userId');
    return userId ? parseInt(userId) : null;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('tokenExpiry');
  },

  getAuthHeaders: () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  retryOperation: async (operation, maxRetries = 3, delay = 1000) => {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (i < maxRetries - 1) {
          await apiUtils.sleep(delay * Math.pow(2, i));
        }
      }
    }
    
    throw lastError;
  },

  chunk: (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },

  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  throttle: (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

// Deprecated function mappings for backward compatibility
export const deprecatedMappings = {
  getAllPropertyData: getAllPublicProperties,
  getPropertyInfo: getPropertyDetailsById,
  createNewProperty: createProperty,
  updatePropertyInfo: updateProperty,
  removeProperty: deleteProperty,
  getOwnerPropertyList: getMyProperties,
  rateProperty: submitPropertyRating,
  addFavorite: addToFavorites,
  removeFavorite: removeFromFavorites,
  getFavorites: getUserFavorites,
  createBooking: submitBookingRequest,
  getMyBookings: getUserBookings,
  getPropertyBookings: getOwnerBookings,
  respondToBooking: respondToBookingRequest,
  getAdminStats: getDashboardStats,
  getUserList: getUsers,
  getPropertyList: getAllPropertiesAdmin,
  approvePropertyRequest: approveProperty,
  rejectPropertyRequest: rejectProperty
};

// Default export with all functions organized by domain
const api = {
  auth: {
    loginUser,
    registerUser,
    requestPasswordReset,
    resetPassword,
    verifyEmail,
    resendEmailVerification,
    validateToken,
    changePasswordAuth,
    logoutUser,
    checkAuthStatus,
    getCurrentUserRole,
    getCurrentUserId,
    refreshToken,
    getCurrentUser,
    updateLastLogin,
    getAuthConfig,
    validatePasswordStrength
  },
  
  profile: {
    getUserProfile,
    updateUserProfile,
    changePassword: changePasswordProfile,
    uploadProfileImage,
    deleteProfileImage,
    getProfileStatistics,
    updateProfilePreferences,
    getProfilePreferences,
    updateNotificationSettings,
    getNotificationSettings,
    getProfileActivityHistory,
    updateSecuritySettings,
    getSecuritySettings,
    enableTwoFactorAuth,
    disableTwoFactorAuth,
    generateBackupCodes,
    verifyTwoFactorSetup,
    requestAccountDeletion,
    exportProfileData,
    validateProfileCompleteness,
    updateProfileAvatar,
    getProfileConnectedAccounts,
    connectAccount,
    disconnectAccount
  },
  
  properties: {
    getAllPublicProperties,
    getAllProperties,
    getPropertyDetailsById,
    getPublicPropertyById,
    createProperty,
    updateProperty,
    deleteProperty,
    getMyProperties,
    getOwnerProperties,
    addPropertyDetails,
    togglePropertyStatus,
    uploadPropertyImages,
    deletePropertyImage,
    getPropertyStatistics,
    searchProperties,
    getPropertyTypes,
    recordPropertyView,
    incrementPropertyViews,
    getSimilarProperties
  },
  
  interactions: {
    submitPropertyRating,
    getUserPropertyRating,
    addToFavorites,
    removeFromFavorites,
    checkFavoriteStatus,
    getUserFavorites,
    getFavouriteProperties,
    setFavouriteStatus,
    isFavouriteStatus,
    getPropertyRating,
    submitPropertyReview,
    getPropertyReviews,
    getPropertyRatingSummary,
    submitReport,
    submitComplaint,
    getPropertyComplaints,
    getUserInteractionHistory,
    updateUserReview
  },
  
  bookings: {
    submitBookingRequest,
    getUserBookings,
    getOwnerBookings,
    respondToBookingRequest,
    submitPayment,
    verifyPayment,
    getBookingDetails,
    getPropertyAvailability,
    getPropertyAvailabilityStatus,
    updateBookingStatus,
    cancelBooking,
    getBookingStatistics,
    uploadBookingDocuments,
    getBookingsByDateRange,
    getBookingHistory,
    exportBookingData,
    validateBookingRequest
  },
  
  admin: {
    getDashboardStats,
    getUsers,
    updateUserStatus,
    getUserDetails,
    getPendingProperties,
    getAllPropertiesAdmin,
    getApprovedProperties,
    approveRejectProperty,
    approveProperty,
    rejectProperty,
    getPropertyDetailsAdmin,
    deletePropertyAdmin,
    removeProperty,
    getBookingRequestsAdmin,
    getActivityLogs,
    getPropertyApprovalStats,
    getUserStatistics,
    updateSystemConfig,
    getSystemConfig,
    createAnnouncement,
    getAnnouncements,
    getReportedContent,
    resolveReport,
    exportAdminData,
    getSystemHealth,
    getFinancialReports
  },
  
  uploads: {
    validateImageFile,
    uploadSingleImage,
    uploadImage,
    uploadMultipleImages,
    uploadMixedFiles,
    deleteUploadedFile,
    getUploadProgress,
    cancelUpload,
    resizeImage
  },
  
  config: {
    createApiClient,
    createUploadClient,
    createJsonClient,
    API_ENDPOINTS,
    buildEndpoint
  },
  
  utils: apiUtils
};

export default api;