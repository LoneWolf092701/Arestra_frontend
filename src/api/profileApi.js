import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Get the current user's profile information
 * This function fetches profile data based on the user's role and authentication token
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
    
    // Provide more specific error messages based on response
    if (error.response?.status === 401) {
      throw new Error('Authentication expired. Please log in again.');
    } else if (error.response?.status === 404) {
      throw new Error('Profile not found. Please contact support.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile data');
    }
  }
};

/**
 * Update the current user's profile information
 * This function handles profile updates for all user types (user, propertyowner, admin)
 * @param {Object} profileData - Updated profile information
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Updated profile data
 */
export const updateUserProfile = async (profileData, token) => {
  try {
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
    
    // Handle validation errors specifically
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
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      data: { password } // Send password in request body for DELETE request
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
      throw new Error('Statistics not available for your user type');
    } else {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile statistics');
    }
  }
};

/**
 * Verify user's email address
 * This function sends a verification email to the user
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Success response
 */
export const sendEmailVerification = async (token) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    const response = await axios.post(`${API_URL}/profile/verify-email`, {}, config);
    return response.data;
  } catch (error) {
    console.error('Error sending email verification:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Authentication expired. Please log in again.');
    } else if (error.response?.status === 429) {
      throw new Error('Too many verification emails sent. Please wait before requesting another.');
    } else {
      throw new Error(error.response?.data?.message || 'Failed to send verification email');
    }
  }
};

/**
 * Get user activity log
 * This function fetches recent user activity for security purposes
 * @param {string} token - JWT authentication token
 * @param {number} limit - Number of activities to fetch (default: 10)
 * @returns {Promise<Array>} Array of user activities
 */
export const getUserActivity = async (token, limit = 10) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    const response = await axios.get(`${API_URL}/profile/activity?limit=${limit}`, config);
    return response.data;
  } catch (error) {
    console.error('Error fetching user activity:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Authentication expired. Please log in again.');
    } else {
      throw new Error(error.response?.data?.message || 'Failed to fetch user activity');
    }
  }
};