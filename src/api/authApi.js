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
      clearAuthData();
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const clearAuthData = () => {
  try {
    const authKeys = ['token', 'userRole', 'userId', 'tokenExpiry'];
    authKeys.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error('Error clearing authentication data:', error);
  }
};

const setAuthData = (authData) => {
  try {
    const { token, user, expires_in } = authData;
    
    if (!token || !user) {
      throw new Error('Invalid authentication data');
    }
    
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', user.role);
    localStorage.setItem('userId', user.id.toString());
    
    if (expires_in && typeof expires_in === 'number') {
      const expiryTime = Date.now() + (expires_in * 1000);
      localStorage.setItem('tokenExpiry', expiryTime.toString());
    }
  } catch (error) {
    console.error('Error storing authentication data:', error);
    clearAuthData();
    throw new Error('Failed to store authentication data');
  }
};

const handleAuthError = (error, operation) => {
  console.error(`Error ${operation}:`, error);
  
  if (error.response?.status === 400) {
    throw new Error(error.response.data?.message || `Invalid data for ${operation}`);
  } else if (error.response?.status === 401) {
    throw new Error(error.response.data?.message || 'Invalid credentials');
  } else if (error.response?.status === 403) {
    throw new Error('Access denied. Please contact support.');
  } else if (error.response?.status === 404) {
    throw new Error('User not found');
  } else if (error.response?.status === 409) {
    throw new Error(error.response.data?.message || 'Username or email already exists');
  } else if (error.response?.status >= 500) {
    throw new Error('Server error. Please try again later.');
  }
  
  throw new Error(error.response?.data?.message || `Failed to ${operation}`);
};

export const loginUser = async (credentials) => {
  try {
    if (!credentials || !credentials.username || !credentials.password) {
      throw new Error('Username and password are required');
    }

    const response = await apiClient.post('/auth/login', {
      username: credentials.username.trim(),
      password: credentials.password
    });

    if (!response.data) {
      throw new Error('Invalid response from server');
    }

    const { token, user, expires_in } = response.data;
    
    if (token && user) {
      setAuthData({ token, user, expires_in });
    }
    
    return {
      success: true,
      ...response.data
    };

  } catch (error) {
    console.error('Login error:', error);
    
    // Handle email verification error specifically
    if (error.response?.status === 403 && error.response?.data?.requiresVerification) {
      return {
        success: false,
        error: 'Email not verified',
        message: error.response.data.message,
        email: error.response.data.email,
        requiresVerification: true
      };
    }
    
    if (error.response?.status === 401) {
      throw new Error('Invalid username or password');
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data?.message || 'Please provide username and password');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }
    
    throw new Error(error.message || 'Login failed. Please try again.');
  }
};

export const registerUser = async (userData) => {
  try {
    if (!userData || typeof userData !== 'object') {
      throw new Error('User data is required');
    }

    const requiredFields = ['username', 'email', 'password', 'role'];
    
    for (const field of requiredFields) {
      if (!userData[field]) {
        throw new Error(`${field} is required`);
      }
    }

    if (userData.username.trim().length < 3) {
      throw new Error('Username must be at least 3 characters long');
    }

    if (userData.password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw new Error('Please enter a valid email address');
    }

    if (!['user', 'propertyowner', 'admin'].includes(userData.role)) {
      throw new Error('Invalid role selected');
    }

    const requestData = {
      username: userData.username.trim(),
      email: userData.email.toLowerCase().trim(),
      password: userData.password,
      role: userData.role
    };

    if (userData.profile && Object.keys(userData.profile).length > 0) {
      requestData.profile = userData.profile;
    }

    const response = await apiClient.post('/auth/register', requestData);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleAuthError(error, 'registering user');
  }
};

export const requestPasswordReset = async (email) => {
  try {
    if (!email) {
      throw new Error('Email address is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Please enter a valid email address');
    }

    const response = await apiClient.post('/auth/forgot-password', {
      email: email.toLowerCase().trim()
    });
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleAuthError(error, 'requesting password reset');
  }
};

export const resetPassword = async (resetData) => {
  try {
    if (!resetData || !resetData.token || !resetData.password) {
      throw new Error('Reset token and new password are required');
    }

    if (resetData.password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    const response = await apiClient.post('/auth/reset-password', {
      token: resetData.token,
      newPassword: resetData.password,
      confirmPassword: resetData.confirmPassword || resetData.password
    });
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleAuthError(error, 'resetting password');
  }
};

// Add this function to your existing authApi.js file

export const validateEmployeeId = async (employeeId) => {
  try {
    if (!employeeId || typeof employeeId !== 'string') {
      throw new Error('Employee ID is required');
    }

    const response = await apiClient.post('/auth/validate-employee-id', {
      employee_id: employeeId.trim()
    });

    if (!response.data) {
      throw new Error('Invalid response from server');
    }

    return {
      success: true,
      valid: response.data.valid,
      message: response.data.message
    };

  } catch (error) {
    console.error('Employee ID validation error:', error);
    
    if (error.response?.status === 400) {
      return {
        success: false,
        valid: false,
        message: 'Employee ID is required'
      };
    } else if (error.response?.status === 500) {
      return {
        success: false,
        valid: false,
        message: 'Server error. Please try again later.'
      };
    } else if (error.response?.data?.message) {
      return {
        success: false,
        valid: false,
        message: error.response.data.message
      };
    }
    
    return {
      success: false,
      valid: false,
      message: error.message || 'Failed to validate Employee ID'
    };
  }
};

export const verifyEmail = async (token) => {
  try {
    if (!token) {
      throw new Error('Verification token is required');
    }

    const response = await apiClient.post('/auth/verify-email', {
      token
    });
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleAuthError(error, 'verifying email');
  }
};

export const resendEmailVerification = async (email) => {
  try {
    if (!email) {
      throw new Error('Email address is required');
    }

    const response = await apiClient.post('/auth/resend-verification', {
      email: email.toLowerCase().trim()
    });
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleAuthError(error, 'resending email verification');
  }
};

export const validateToken = async () => {
  try {
    const response = await apiClient.get('/auth/verify-token');
    
    if (!response.data) {
      return { valid: false, user: null };
    }
    
    return response.data;
  } catch (error) {
    console.error('Token validation error:', error);
    return { valid: false, user: null };
  }
};

export const changePasswordAuth = async (passwordData) => {
  try {
    if (!passwordData || typeof passwordData !== 'object') {
      throw new Error('Password data is required');
    }

    const requiredFields = ['currentPassword', 'newPassword', 'confirmPassword'];
    
    for (const field of requiredFields) {
      if (!passwordData[field]) {
        throw new Error(`${field} is required`);
      }
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      throw new Error('New passwords do not match');
    }

    if (passwordData.newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long');
    }

    const response = await apiClient.post('/auth/change-password', passwordData);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleAuthError(error, 'changing password');
  }
};

export const logoutUser = async () => {
  try {
    await apiClient.post('/auth/logout');
    
    clearAuthData();
    
    return { success: true, message: 'Logged out successfully' };
  } catch (error) {
    console.error('Logout error:', error);
    
    clearAuthData();
    
    return { success: true, message: 'Logged out successfully' };
  }
};

export const checkAuthStatus = async () => {
  try {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');
    const tokenExpiry = localStorage.getItem('tokenExpiry');

    if (!token || !userRole || !userId) {
      return {
        authenticated: false,
        user: null,
        token: null,
        expired: false
      };
    }

    const isExpired = tokenExpiry && Date.now() > parseInt(tokenExpiry);
    if (isExpired) {
      clearAuthData();
      return {
        authenticated: false,
        user: null,
        token: null,
        expired: true
      };
    }

    return {
      authenticated: true,
      user: {
        id: parseInt(userId),
        role: userRole
      },
      token: token,
      expired: false
    };
  } catch (error) {
    console.error('Error checking auth status:', error);
    clearAuthData();
    return {
      authenticated: false,
      user: null,
      token: null,
      expired: false
    };
  }
};

export const getCurrentUserRole = () => {
  try {
    return localStorage.getItem('userRole');
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

export const getCurrentUserId = () => {
  try {
    const userId = localStorage.getItem('userId');
    return userId ? parseInt(userId) : null;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};

export const refreshToken = async () => {
  try {
    const response = await apiClient.post('/auth/refresh-token');
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }

    const { token, user, expires_in } = response.data;
    
    if (token && user) {
      setAuthData({ token, user, expires_in });
    }
    
    return response.data;
  } catch (error) {
    console.error('Token refresh error:', error);
    clearAuthData();
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const authStatus = await checkAuthStatus();
    
    if (!authStatus.authenticated) {
      return null;
    }
    
    const response = await apiClient.get('/auth/me');
    
    if (!response.data) {
      return authStatus.user;
    }
    
    return response.data;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const updateLastLogin = async () => {
  try {
    await apiClient.post('/auth/update-last-login');
    return true;
  } catch (error) {
    console.error('Error updating last login:', error);
    return false;
  }
};

export const getAuthConfig = async () => {
  try {
    const response = await apiClient.get('/auth/config');
    
    if (!response.data) {
      return {
        registration_enabled: true,
        email_verification_required: true,
        password_requirements: {
          min_length: 6,
          require_uppercase: false,
          require_lowercase: false,
          require_numbers: false,
          require_special_chars: false
        },
        session_timeout: 8 * 60 * 60 * 1000
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error getting auth config:', error);
    
    return {
      registration_enabled: true,
      email_verification_required: true,
      password_requirements: {
        min_length: 6,
        require_uppercase: false,
        require_lowercase: false,
        require_numbers: false,
        require_special_chars: false
      },
      session_timeout: 8 * 60 * 60 * 1000
    };
  }
};

export const validatePasswordStrength = (password) => {
  const checks = {
    length: password.length >= 6,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /\d/.test(password),
    specialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };
  
  const score = Object.values(checks).filter(Boolean).length;
  
  let strength = 'weak';
  if (score >= 4) strength = 'strong';
  else if (score >= 3) strength = 'medium';
  
  return {
    score,
    strength,
    checks,
    isValid: checks.length
  };
};