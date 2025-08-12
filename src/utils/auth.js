/**
 * Authentication utility functions
 * This module provides centralized authentication state management
 * and token handling functionality used throughout the application
 */

/**
 * Check if user is currently authenticated
 * This function validates both token presence and expiration
 * @returns {boolean} True if user is authenticated, false otherwise
 */
export const isAuthenticated = () => {
  try {
    const token = localStorage.getItem('token');
    const expiry = localStorage.getItem('tokenExpiry');
    
    if (!token) {
      return false;
    }
    
    if (expiry && Date.now() > parseInt(expiry)) {
      clearAuthData();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking authentication status:', error);
    clearAuthData();
    return false;
  }
};

/**
 * Get current user's role
 * This function retrieves the user role from localStorage
 * @returns {string|null} User role or null if not authenticated
 */
export const getUserRole = () => {
  try {
    if (!isAuthenticated()) {
      return null;
    }
    
    return localStorage.getItem('userRole');
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

/**
 * Get current user's ID
 * This function retrieves the user ID from localStorage
 * @returns {string|null} User ID or null if not authenticated
 */
export const getUserId = () => {
  try {
    if (!isAuthenticated()) {
      return null;
    }
    
    return localStorage.getItem('userId');
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};

/**
 * Get authentication token
 * This function retrieves the current JWT token
 * @returns {string|null} JWT token or null if not authenticated
 */
export const getAuthToken = () => {
  try {
    if (!isAuthenticated()) {
      return null;
    }
    
    return localStorage.getItem('token');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Store authentication data after successful login
 * This function securely stores all authentication-related data
 * @param {Object} authData - Authentication response from server
 * @param {string} authData.token - JWT access token
 * @param {Object} authData.user - User information
 * @param {number} authData.expiresIn - Token expiration time in seconds
 */
export const setAuthData = (authData) => {
  try {
    const { token, user, expiresIn } = authData;
    
    if (!token || !user) {
      throw new Error('Invalid authentication data');
    }
    
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', user.role);
    localStorage.setItem('userId', user.id.toString());
    
    if (expiresIn && typeof expiresIn === 'number') {
      const expiryTime = Date.now() + (expiresIn * 1000);
      localStorage.setItem('tokenExpiry', expiryTime.toString());
    }
    
    console.log('Authentication data stored successfully');
  } catch (error) {
    console.error('Error storing authentication data:', error);
    clearAuthData();
    throw new Error('Failed to store authentication data');
  }
};

/**
 * Clear all authentication data
 * This function removes all auth-related data from localStorage
 */
export const clearAuthData = () => {
  try {
    const authKeys = ['token', 'userRole', 'userId', 'tokenExpiry'];
    authKeys.forEach(key => localStorage.removeItem(key));
    
    console.log('Authentication data cleared');
  } catch (error) {
    console.error('Error clearing authentication data:', error);
  }
};

/**
 * Check if current user has specific role
 * This function validates user permissions for role-based access control
 * @param {string|string[]} requiredRole - Single role or array of allowed roles
 * @returns {boolean} True if user has required role, false otherwise
 */
export const hasRole = (requiredRole) => {
  try {
    const userRole = getUserRole();
    
    if (!userRole) {
      return false;
    }
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(userRole);
    }
    
    return userRole === requiredRole;
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
};

/**
 * Check if current user is an admin
 * This is a convenience function for admin role checking
 * @returns {boolean} True if user is admin, false otherwise
 */
export const isAdmin = () => {
  return hasRole('admin');
};

/**
 * Check if current user is a property owner
 * This is a convenience function for property owner role checking
 * @returns {boolean} True if user is property owner, false otherwise
 */
export const isPropertyOwner = () => {
  return hasRole('propertyowner');
};

/**
 * Check if current user is a regular user
 * This is a convenience function for regular user role checking
 * @returns {boolean} True if user is regular user, false otherwise
 */
export const isRegularUser = () => {
  return hasRole('user');
};

/**
 * Get time until token expires
 * This function calculates remaining token validity time
 * @returns {number} Minutes until token expires, or -1 if expired/invalid
 */
export const getTimeUntilExpiry = () => {
  try {
    const expiry = localStorage.getItem('tokenExpiry');
    
    if (!expiry || !isAuthenticated()) {
      return -1;
    }
    
    const expiryTime = parseInt(expiry);
    const currentTime = Date.now();
    
    if (currentTime >= expiryTime) {
      return -1;
    }
    
    return Math.floor((expiryTime - currentTime) / (1000 * 60));
  } catch (error) {
    console.error('Error calculating token expiry time:', error);
    return -1;
  }
};

/**
 * Check if token will expire soon
 * This function determines if token refresh is needed
 * @param {number} thresholdMinutes - Warning threshold in minutes (default: 15)
 * @returns {boolean} True if token expires within threshold, false otherwise
 */
export const isTokenExpiringSoon = (thresholdMinutes = 15) => {
  try {
    const minutesUntilExpiry = getTimeUntilExpiry();
    
    if (minutesUntilExpiry === -1) {
      return false;
    }
    
    return minutesUntilExpiry <= thresholdMinutes;
  } catch (error) {
    console.error('Error checking token expiry warning:', error);
    return false;
  }
};

/**
 * Get appropriate redirect path based on user role
 * This function determines where to redirect users after login
 * @param {string} userRole - User's role (optional, will get from storage if not provided)
 * @returns {string} Appropriate redirect path for the user role
 */
export const getHomePathForRole = (userRole = null) => {
  try {
    const role = userRole || getUserRole();
    
    switch (role) {
      case 'admin':
        return '/admin/home';
      case 'propertyowner':
        return '/home';
      case 'user':
        return '/user-home';
      default:
        console.warn('Unknown user role:', role);
        return '/user-home';
    }
  } catch (error) {
    console.error('Error determining home path:', error);
    return '/user-home';
  }
};

/**
 * Get user-friendly role name
 * This function converts internal role names to display-friendly versions
 * @param {string} role - Internal role name (optional, will get from storage if not provided)
 * @returns {string} User-friendly role name
 */
export const getRoleDisplayName = (role = null) => {
  try {
    const userRole = role || getUserRole();
    
    switch (userRole) {
      case 'admin':
        return 'Administrator';
      case 'propertyowner':
        return 'Property Owner';
      case 'user':
        return 'User';
      default:
        return 'Unknown Role';
    }
  } catch (error) {
    console.error('Error getting role display name:', error);
    return 'Unknown Role';
  }
};

/**
 * Check if user can access a specific route
 * This function validates route access based on authentication and role requirements
 * @param {string} route - Route path to check
 * @param {string[]} allowedRoles - Array of roles allowed to access the route
 * @param {boolean} requireAuth - Whether authentication is required (default: true)
 * @returns {boolean} True if user can access the route, false otherwise
 */
export const canAccessRoute = (route, allowedRoles = [], requireAuth = true) => {
  try {
    if (requireAuth && !isAuthenticated()) {
      return false;
    }
    
    if (allowedRoles.length === 0) {
      return !requireAuth || isAuthenticated();
    }
    
    return hasRole(allowedRoles);
  } catch (error) {
    console.error('Error checking route access:', error);
    return false;
  }
};

/**
 * Get redirect path for unauthorized access
 * This function determines where to redirect users who don't have access
 * @param {boolean} isAuthenticated - Whether user is authenticated
 * @param {string} currentRole - User's current role
 * @returns {string} Appropriate redirect path
 */
export const getUnauthorizedRedirectPath = (isAuthenticated = false, currentRole = null) => {
  try {
    if (!isAuthenticated) {
      return '/login';
    }
    
    return getHomePathForRole(currentRole);
  } catch (error) {
    console.error('Error determining unauthorized redirect path:', error);
    return '/login';
  }
};

/**
 * Validate token format
 * This function performs basic JWT format validation
 * @param {string} token - Token to validate
 * @returns {boolean} True if token format is valid, false otherwise
 */
export const isValidTokenFormat = (token) => {
  try {
    if (!token || typeof token !== 'string') {
      return false;
    }
    
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }
    
    return parts.every(part => part.length > 0);
  } catch (error) {
    console.error('Error validating token format:', error);
    return false;
  }
};

/**
 * Get token payload without verification
 * This function extracts payload from JWT for client-side inspection
 * WARNING: This does not verify token authenticity - only use for non-sensitive data
 * @param {string} token - JWT token (optional, will get from storage if not provided)
 * @returns {Object|null} Token payload or null if invalid
 */
export const getTokenPayload = (token = null) => {
  try {
    const authToken = token || getAuthToken();
    
    if (!authToken || !isValidTokenFormat(authToken)) {
      return null;
    }
    
    const payload = authToken.split('.')[1];
    const decodedPayload = atob(payload);
    
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error('Error decoding token payload:', error);
    return null;
  }
};

/**
 * Set up authentication event listeners
 * This function sets up listeners for authentication state changes
 * @param {Function} onAuthChange - Callback function for auth changes
 * @returns {Function} Cleanup function to remove listeners
 */
export const setupAuthListeners = (onAuthChange) => {
  try {
    const handleStorageChange = (event) => {
      if (['token', 'userRole', 'userId', 'tokenExpiry'].includes(event.key)) {
        const isAuth = isAuthenticated();
        const userRole = getUserRole();
        const userId = getUserId();
        
        onAuthChange({
          isAuthenticated: isAuth,
          userRole,
          userId,
          token: isAuth ? getAuthToken() : null
        });
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  } catch (error) {
    console.error('Error setting up auth listeners:', error);
    return () => {};
  }
};

/**
 * Logout user and redirect appropriately
 * This function handles complete logout process including cleanup and redirection
 * @param {string} redirectPath - Optional custom redirect path
 */
export const logoutUser = (redirectPath = '/login') => {
  try {
    clearAuthData();
    
    if (typeof window !== 'undefined') {
      window.location.href = redirectPath;
    }
  } catch (error) {
    console.error('Error during logout:', error);
    clearAuthData();
    
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
};