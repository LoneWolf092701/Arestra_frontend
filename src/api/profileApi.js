import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('tokenExpiry');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Fetch the current user's profile information
 * This function adapts the response based on the user's role
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} User profile data
 */
export const getUserProfile = async (token) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    const response = await axios.get(`${API_URL}/profile`, config);
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    
    // Provide specific error messages
    if (error.response?.status === 401) {
      throw new Error('Authentication expired. Please log in again.');
    } else if (error.response?.status === 404) {
      throw new Error('User profile not found.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
};

/**
 * Update the current user's profile information
 * This function handles different fields based on user role
 * @param {Object} profileData - Updated profile information
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Success response
 */
export const updateUserProfile = async (profileData, token) => {
  try {
    // Validate required fields
    if (!profileData.username || profileData.username.trim().length < 3) {
      throw new Error('Username must be at least 3 characters long');
    }

    if (!profileData.email || !profileData.email.includes('@')) {
      throw new Error('Valid email address is required');
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    const response = await axios.put(`${API_URL}/profile`, profileData, config);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    
    // Provide specific error messages for profile update issues
    if (error.response?.status === 400) {
      throw new Error(error.response.data.message || 'Invalid profile data provided');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication expired. Please log in again.');
    } else if (error.response?.status === 409) {
      throw new Error('Email or username already exists. Please choose different values.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  }
};

/**
 * Change the current user's password
 * This function handles password changes with proper validation
 * @param {Object} passwordData - Object containing currentPassword, newPassword, confirmPassword
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Success response
 */
export const changePassword = async (passwordData, token) => {
  try {
    // Validate password data
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      throw new Error('All password fields are required');
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      throw new Error('New password and confirmation must match');
    }

    if (passwordData.newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long');
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    const response = await axios.put(`${API_URL}/profile/password`, passwordData, config);
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    
    // Provide specific error messages for password change issues
    if (error.response?.status === 400) {
      throw new Error(error.response.data.message || 'Invalid password data provided');
    } else if (error.response?.status === 401) {
      throw new Error('Current password is incorrect');
    } else if (error.response?.status === 422) {
      throw new Error('New password does not meet security requirements');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error(error.response?.data?.message || 'Failed to change password');
    }
  }
};

/**
 * Upload a profile picture for the current user
 * This function handles profile image uploads
 * @param {File} imageFile - Image file to upload
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Response with image URL
 */
export const uploadProfileImage = async (imageFile, token) => {
  try {
    // Validate file
    if (!imageFile) {
      throw new Error('Image file is required');
    }

    // Check file size (5MB limit)
    if (imageFile.size > 5 * 1024 * 1024) {
      throw new Error('Image file must be less than 5MB');
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(imageFile.type)) {
      throw new Error('Only JPG, PNG, and GIF images are allowed');
    }

    const formData = new FormData();
    formData.append('profileImage', imageFile);

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    };

    const response = await axios.post(`${API_URL}/profile/image`, formData, config);
    return response.data;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    
    if (error.response?.status === 400) {
      throw new Error('Invalid image file. Please upload a JPG, PNG, or GIF file under 5MB.');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication expired. Please log in again.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error(error.response?.data?.message || 'Failed to upload profile image');
    }
  }
};

/**
 * Delete the current user's account
 * This function handles account deletion with proper confirmation
 * @param {string} password - User's current password for confirmation
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Success response
 */
export const deleteUserAccount = async (password, token) => {
  try {
    if (!password) {
      throw new Error('Password is required to delete account');
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      data: { password }
    };

    const response = await axios.delete(`${API_URL}/profile`, config);
    return response.data;
  } catch (error) {
    console.error('Error deleting user account:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Incorrect password or authentication expired');
    } else if (error.response?.status === 403) {
      throw new Error('Account deletion not allowed for your user type');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error(error.response?.data?.message || 'Failed to delete account');
    }
  }
};

/**
 * Get profile statistics for property owners
 * This function fetches statistics like property count, views, etc.
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Profile statistics
 */
export const getProfileStats = async (token) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    const response = await axios.get(`${API_URL}/profile/stats`, config);
    return response.data;
  } catch (error) {
    console.error('Error fetching profile stats:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Authentication expired. Please log in again.');
    } else if (error.response?.status === 403) {
      throw new Error('Statistics are only available for property owners');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile statistics');
    }
  }
};

/**
 * Validate profile data based on user role
 * This function performs client-side validation before sending data to server
 * @param {Object} profileData - Profile data to validate
 * @param {string} userRole - User's role (user, propertyowner, admin)
 * @returns {Object} Validation result
 */
export const validateProfileData = (profileData, userRole) => {
  const errors = {};

  // Common validation
  if (!profileData.username || profileData.username.trim().length < 3) {
    errors.username = 'Username must be at least 3 characters long';
  }

  if (!profileData.email || !profileData.email.includes('@')) {
    errors.email = 'Valid email address is required';
  }

  // Role-specific validation
  if (userRole === 'user') {
    if (!profileData.firstName || profileData.firstName.trim().length < 1) {
      errors.firstName = 'First name is required';
    }
    if (!profileData.lastName || profileData.lastName.trim().length < 1) {
      errors.lastName = 'Last name is required';
    }
  } else if (userRole === 'propertyowner') {
    if (!profileData.businessName || profileData.businessName.trim().length < 1) {
      errors.businessName = 'Business name is required';
    }
    if (!profileData.contactPerson || profileData.contactPerson.trim().length < 1) {
      errors.contactPerson = 'Contact person is required';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Format profile data for display
 * This function formats profile data for consistent display across components
 * @param {Object} profileData - Raw profile data from API
 * @returns {Object} Formatted profile data
 */
export const formatProfileData = (profileData) => {
  const formatted = { ...profileData };

  // Format dates
  if (formatted.createdAt) {
    formatted.memberSince = new Date(formatted.createdAt).toLocaleDateString();
  }

  if (formatted.birthdate) {
    formatted.formattedBirthdate = new Date(formatted.birthdate).toLocaleDateString();
  }

  // Calculate age if birthdate is available
  if (formatted.birthdate) {
    const today = new Date();
    const birthDate = new Date(formatted.birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    formatted.age = age;
  }

  // Format full name for users and admins
  if (formatted.firstName && formatted.lastName) {
    formatted.fullName = `${formatted.firstName} ${formatted.lastName}`;
  }

  return formatted;
};

/**
 * Check if profile is complete based on user role
 * @param {Object} profileData - Profile data to check
 * @param {string} userRole - User's role
 * @returns {Object} Completion status
 */
export const checkProfileCompletion = (profileData, userRole) => {
  const requiredFields = ['username', 'email'];
  
  if (userRole === 'user') {
    requiredFields.push('firstName', 'lastName');
  } else if (userRole === 'propertyowner') {
    requiredFields.push('businessName', 'contactPerson');
  }

  const missingFields = requiredFields.filter(field => 
    !profileData[field] || profileData[field].trim().length === 0
  );

  const completionPercentage = Math.round(
    ((requiredFields.length - missingFields.length) / requiredFields.length) * 100
  );

  return {
    isComplete: missingFields.length === 0,
    completionPercentage,
    missingFields
  };
};

export default {
  getUserProfile,
  updateUserProfile,
  changePassword,
  uploadProfileImage,
  deleteUserAccount,
  getProfileStats,
  validateProfileData,
  formatProfileData,
  checkProfileCompletion
};