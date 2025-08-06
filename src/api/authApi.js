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

const handleAuthError = (error, operation) => {
  console.error(`Error ${operation}:`, error);
  
  if (error.response?.status === 400) {
    throw new Error(error.response.data?.message || `Invalid data for ${operation}`);
  } else if (error.response?.status === 401) {
    throw new Error('Invalid credentials');
  } else if (error.response?.status === 403) {
    throw new Error('Access denied');
  } else if (error.response?.status === 404) {
    throw new Error('User not found');
  } else if (error.response?.status === 409) {
    throw new Error('User already exists');
  } else if (error.response?.status >= 500) {
    throw new Error('Server error. Please try again later.');
  }
  
  throw new Error(error.response?.data?.message || `Failed to ${operation}`);
};

export const loginUser = async (credentials) => {

    console.log('Logging in with credentials:', credentials);
  try {
    if (!credentials || !credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }

    const response = await apiClient.post('/auth/login', {
      email: credentials.email.toLowerCase().trim(),
      password: credentials.password
    });
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }

    const { token, user, expires_in } = response.data;
    
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', user?.role || '');
      localStorage.setItem('userId', user?.id?.toString() || '');
      
      if (expires_in) {
        const expiryTime = new Date().getTime() + (expires_in * 1000);
        localStorage.setItem('tokenExpiry', expiryTime.toString());
      }
    }
    
    return response.data;
  } catch (error) {
    handleAuthError(error, 'logging in');
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

    if (!['user', 'propertyowner'].includes(userData.role)) {
      throw new Error('Invalid role specified');
    }

    const payload = {
      username: userData.username.trim(),
      email: userData.email.toLowerCase().trim(),
      password: userData.password,
      role: userData.role,
      first_name: userData.firstName?.trim() || '',
      last_name: userData.lastName?.trim() || '',
      phone: userData.phone?.trim() || ''
    };

    const response = await apiClient.post('/auth/register', payload);
    
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
    if (!email || typeof email !== 'string') {
      throw new Error('Email address is required');
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
    if (!resetData || typeof resetData !== 'object') {
      throw new Error('Reset data is required');
    }

    if (!resetData.token || !resetData.password) {
      throw new Error('Reset token and new password are required');
    }

    const response = await apiClient.post('/auth/reset-password', {
      token: resetData.token,
      password: resetData.password,
      confirm_password: resetData.confirmPassword || resetData.password
    });
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleAuthError(error, 'resetting password');
  }
};

export const verifyEmail = async (verificationToken) => {
  try {
    if (!verificationToken) {
      throw new Error('Verification token is required');
    }

    const response = await apiClient.post('/auth/verify-email', {
      token: verificationToken
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

export const validateToken = async (token = null) => {
  try {
    const authToken = token || localStorage.getItem('token');
    
    if (!authToken) {
      return { valid: false, user: null };
    }

    const response = await apiClient.post('/auth/validate-token', {
      token: authToken
    });
    
    if (!response.data) {
      return { valid: false, user: null };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error validating token:', error);
    return { valid: false, user: null };
  }
};

export const changePasswordAuth = async (passwordData) => {
  try {
    if (!passwordData || typeof passwordData !== 'object') {
      throw new Error('Password data is required');
    }

    const requiredFields = ['currentPassword', 'newPassword'];
    
    for (const field of requiredFields) {
      if (!passwordData[field]) {
        throw new Error(`${field} is required`);
      }
    }

    const response = await apiClient.post('/auth/change-password', {
      current_password: passwordData.currentPassword,
      new_password: passwordData.newPassword,
      confirm_password: passwordData.confirmPassword || passwordData.newPassword
    });
    
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
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        await apiClient.post('/auth/logout');
      } catch (error) {
        console.warn('Server logout failed, continuing with local cleanup:', error);
      }
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('tokenExpiry');
    
    return { success: true, message: 'Logged out successfully' };
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('tokenExpiry');
    
    return { success: true, message: 'Logged out successfully' };
  }
};

export const checkAuthStatus = async () => {
  try {
    const token = localStorage.getItem('token');
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    
    if (!token) {
      return { 
        authenticated: false, 
        user: null, 
        reason: 'No token found' 
      };
    }
    
    if (tokenExpiry) {
      const expiryTime = parseInt(tokenExpiry);
      const currentTime = new Date().getTime();
      
      if (currentTime >= expiryTime) {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        localStorage.removeItem('tokenExpiry');
        
        return { 
          authenticated: false, 
          user: null, 
          reason: 'Token expired' 
        };
      }
    }
    
    const validation = await validateToken(token);
    
    if (!validation.valid) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('tokenExpiry');
      
      return { 
        authenticated: false, 
        user: null, 
        reason: 'Invalid token' 
      };
    }
    
    return { 
      authenticated: true, 
      user: validation.user,
      token: token
    };
  } catch (error) {
    console.error('Error checking auth status:', error);
    
    return { 
      authenticated: false, 
      user: null, 
      reason: error.message 
    };
  }
};

export const getCurrentUserRole = () => {
  try {
    const role = localStorage.getItem('userRole');
    return role || null;
  } catch (error) {
    console.error('Error getting current user role:', error);
    return null;
  }
};

export const getCurrentUserId = () => {
  try {
    const userId = localStorage.getItem('userId');
    return userId ? parseInt(userId) : null;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
};

export const refreshToken = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token to refresh');
    }

    const response = await apiClient.post('/auth/refresh-token');
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }

    const { token: newToken, expires_in } = response.data;
    
    if (newToken) {
      localStorage.setItem('token', newToken);
      
      if (expires_in) {
        const expiryTime = new Date().getTime() + (expires_in * 1000);
        localStorage.setItem('tokenExpiry', expiryTime.toString());
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('Error refreshing token:', error);
    
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('tokenExpiry');
    
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
          min_length: 8,
          require_uppercase: true,
          require_lowercase: true,
          require_numbers: true,
          require_special_chars: false
        },
        session_timeout: 24 * 60 * 60 * 1000
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error getting auth config:', error);
    
    return {
      registration_enabled: true,
      email_verification_required: true,
      password_requirements: {
        min_length: 8,
        require_uppercase: true,
        require_lowercase: true,
        require_numbers: true,
        require_special_chars: false
      },
      session_timeout: 24 * 60 * 60 * 1000
    };
  }
};

export const validatePasswordStrength = (password) => {
  const checks = {
    length: password.length >= 8,
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
    isValid: checks.length && checks.uppercase && checks.lowercase && checks.numbers
  };
};