import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
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

// Response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stored auth data
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('tokenExpiry');
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * User login function
 * @param {Object} credentials - User login credentials
 * @param {string} credentials.username - Username or email
 * @param {string} credentials.password - User password
 * @returns {Promise<Object>} Login response with token and user info
 */
export const loginApi = async (credentials) => {
  try {
    // Validate input
    if (!credentials.username || !credentials.password) {
      throw new Error('Username and password are required');
    }

    const response = await apiClient.post('/auth/login', {
      username: credentials.username.trim(),
      password: credentials.password
    });

    const data = response.data;
    
    // Validate response structure
    if (!data.token || !data.user) {
      throw new Error('Invalid response from server');
    }

    // Save authentication data to localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('userRole', data.user.role);
    
    // Set expiry to 8 hours from now (matching backend token expiry)
    const expiryTime = Date.now() + 8 * 60 * 60 * 1000;
    localStorage.setItem('tokenExpiry', expiryTime);

    return data;
  } catch (error) {
    console.error('Login error:', error);
    
    // Provide user-friendly error messages
    if (error.response?.status === 401) {
      throw new Error('Invalid username or password');
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data.message || 'Invalid login data');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else if (error.response) {
      console.error('Login error response:', error.response.data.message);
      const enhancedError = new Error(error.message);
      enhancedError.response = error.response;
      enhancedError.status = error.response.status;
      throw enhancedError;
    } else {
      throw new Error('Login failed. Please try again.');
    }
  }
};

/**
 * User registration function
 * @param {Object} userData - User registration data
 * @param {string} userData.username - Desired username
 * @param {string} userData.email - User email address
 * @param {string} userData.password - User password
 * @param {string} userData.role - User role (user, propertyowner)
 * @returns {Promise<Object>} Registration response
 */
export const registerApi = async (userData) => {
  try {
    // Validate input
    if (!userData.username || !userData.email || !userData.password) {
      throw new Error('Username, email, and password are required');
    }

    if (userData.username.trim().length < 3) {
      throw new Error('Username must be at least 3 characters long');
    }

    if (userData.password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw new Error('Please enter a valid email address');
    }

    const response = await apiClient.post('/auth/register', {
      username: userData.username.trim(),
      email: userData.email.trim().toLowerCase(),
      password: userData.password,
      role: userData.role || 'user'
    });

    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    
    // Provide user-friendly error messages
    if (error.response?.status === 409) {
      const errorMsg = error.response.data.message || error.response.data.error;
      if (errorMsg.includes('username')) {
        throw new Error('Username already exists. Please choose a different username.');
      } else if (errorMsg.includes('email')) {
        throw new Error('An account with this email already exists.');
      } else {
        throw new Error('Username or email already exists.');
      }
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data.message || 'Invalid registration data');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Registration failed. Please try again.');
    }
  }
};

/**
 * Forgot password function
 * @param {string} email - User email address
 * @returns {Promise<Object>} Forgot password response
 */
export const forgotPasswordApi = async (email) => {
  try {
    if (!email) {
      throw new Error('Email address is required');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Please enter a valid email address');
    }

    const response = await apiClient.post('/auth/forgot-password', {
      email: email.trim().toLowerCase()
    });

    return response.data;
  } catch (error) {
    console.error('Forgot password error:', error);
    
    if (error.response?.status === 400) {
      throw new Error(error.response.data.message || 'Invalid email address');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Failed to send password reset email');
    }
  }
};

/**
 * Reset password function
 * @param {Object} resetData - Password reset data
 * @param {string} resetData.token - Reset token from email
 * @param {string} resetData.newPassword - New password
 * @param {string} resetData.confirmPassword - Password confirmation
 * @returns {Promise<Object>} Reset password response
 */
export const resetPasswordApi = async (resetData) => {
  try {
    if (!resetData.token || !resetData.newPassword || !resetData.confirmPassword) {
      throw new Error('All fields are required');
    }

    if (resetData.newPassword !== resetData.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    if (resetData.newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    const response = await apiClient.post('/auth/reset-password', {
      token: resetData.token,
      newPassword: resetData.newPassword,
      confirmPassword: resetData.confirmPassword
    });

    return response.data;
  } catch (error) {
    console.error('Reset password error:', error);
    
    if (error.response?.status === 400) {
      throw new Error(error.response.data.message || 'Invalid or expired reset token');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Failed to reset password');
    }
  }
};

/**
 * Verify token function
 * @returns {Promise<Object>} Token verification response
 */
export const verifyTokenApi = async () => {
  try {
    const response = await apiClient.get('/auth/verify-token');
    return response.data;
  } catch (error) {
    console.error('Token verification error:', error);
    throw error;
  }
};

/**
 * Logout function
 * @returns {Promise<Object>} Logout response
 */
export const logoutApi = async () => {
  try {
    // Call backend logout endpoint
    await apiClient.post('/auth/logout');
    
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('tokenExpiry');
    
    return { success: true, message: 'Logged out successfully' };
  } catch (error) {
    console.error('Logout error:', error);
    
    // Even if backend call fails, clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('tokenExpiry');
    
    return { success: true, message: 'Logged out successfully' };
  }
};

/**
 * Change password function (for authenticated users)
 * @param {Object} passwordData - Password change data
 * @param {string} passwordData.currentPassword - Current password
 * @param {string} passwordData.newPassword - New password
 * @param {string} passwordData.confirmPassword - Password confirmation
 * @returns {Promise<Object>} Change password response
 */
export const changePasswordApi = async (passwordData) => {
  try {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      throw new Error('All password fields are required');
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      throw new Error('New passwords do not match');
    }

    if (passwordData.newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long');
    }

    const response = await apiClient.post('/auth/change-password', passwordData);
    return response.data;
  } catch (error) {
    console.error('Change password error:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Current password is incorrect');
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data.message || 'Invalid password data');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Failed to change password');
    }
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} Authentication status
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const tokenExpiry = localStorage.getItem('tokenExpiry');
  
  if (!token || !tokenExpiry) {
    return false;
  }
  
  // Check if token has expired
  if (Date.now() > parseInt(tokenExpiry)) {
    // Token expired, clear storage
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('tokenExpiry');
    return false;
  }
  
  return true;
};

/**
 * Get current user role
 * @returns {string|null} User role or null if not authenticated
 */
export const getUserRole = () => {
  if (!isAuthenticated()) {
    return null;
  }
  return localStorage.getItem('userRole');
};

/**
 * Get current user token
 * @returns {string|null} JWT token or null if not authenticated
 */
export const getToken = () => {
  if (!isAuthenticated()) {
    return null;
  }
  return localStorage.getItem('token');
};

/**
 * Refresh token function (if implemented in backend)
 * @returns {Promise<Object>} Refresh token response
 */
export const refreshTokenApi = async () => {
  try {
    const response = await apiClient.post('/auth/refresh-token');
    const data = response.data;
    
    if (data.token) {
      localStorage.setItem('token', data.token);
      // Update expiry
      const expiryTime = Date.now() + 8 * 60 * 60 * 1000;
      localStorage.setItem('tokenExpiry', expiryTime);
    }
    
    return data;
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
};

/**
 * Get time until token expires
 * @returns {number} Minutes until token expires, or 0 if expired/invalid
 */
export const getTokenTimeRemaining = () => {
  const tokenExpiry = localStorage.getItem('tokenExpiry');
  
  if (!tokenExpiry) {
    return 0;
  }
  
  const remaining = parseInt(tokenExpiry) - Date.now();
  
  if (remaining <= 0) {
    return 0;
  }
  
  return Math.floor(remaining / (1000 * 60)); // Return minutes
};

// Export default object with all functions
export default {
  loginApi,
  registerApi,
  forgotPasswordApi,
  resetPasswordApi,
  verifyTokenApi,
  logoutApi,
  changePasswordApi,
  isAuthenticated,
  getUserRole,
  getToken,
  refreshTokenApi,
  getTokenTimeRemaining,
  apiClient
};