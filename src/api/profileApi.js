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

const handleProfileError = (error, operation) => {
  console.error(`Error ${operation}:`, error);
  
  if (error.response?.status === 400) {
    throw new Error(error.response.data?.message || `Invalid data for ${operation}`);
  } else if (error.response?.status === 401) {
    throw new Error('Please log in to access profile features');
  } else if (error.response?.status === 403) {
    throw new Error('Access denied. You do not have permission for this action.');
  } else if (error.response?.status === 404) {
    throw new Error('Profile not found');
  } else if (error.response?.status >= 500) {
    throw new Error('Server error. Please try again later.');
  }
  
  throw new Error(error.response?.data?.message || `Failed to ${operation}`);
};

export const getUserProfile = async () => {
  try {
    const response = await apiClient.get('/profile');
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleProfileError(error, 'fetching user profile');
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    if (!profileData || typeof profileData !== 'object') {
      throw new Error('Profile data is required');
    }

    const response = await apiClient.put('/profile', profileData);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleProfileError(error, 'updating user profile');
  }
};

export const changePassword = async (passwordData) => {
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

    const payload = {
      current_password: passwordData.currentPassword,
      new_password: passwordData.newPassword,
      confirm_password: passwordData.confirmPassword || passwordData.newPassword
    };

    const response = await apiClient.put('/profile/password', payload);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleProfileError(error, 'changing password');
  }
};

export const changePasswordProfile = changePassword;

export const uploadProfileImage = async (imageFile, options = {}) => {
  try {
    if (!imageFile) {
      throw new Error('Image file is required');
    }

    const formData = new FormData();
    formData.append('profile_image', imageFile);
    
    if (options.resize_width) {
      formData.append('resize_width', options.resize_width.toString());
    }
    
    if (options.resize_height) {
      formData.append('resize_height', options.resize_height.toString());
    }

    const response = await axios.post(
      `${API_BASE_URL}/profile/upload-image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        timeout: 60000,
        onUploadProgress: options.onProgress || undefined
      }
    );
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleProfileError(error, 'uploading profile image');
  }
};

export const deleteProfileImage = async () => {
  try {
    const response = await apiClient.delete('/profile/image');
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleProfileError(error, 'deleting profile image');
  }
};

export const getProfileStatistics = async () => {
  try {
    const response = await apiClient.get('/profile/statistics');
    
    if (!response.data) {
      return {
        profile_completion: 0,
        account_age_days: 0,
        last_login: null,
        total_logins: 0,
        properties_owned: 0,
        bookings_made: 0,
        reviews_written: 0,
        favorite_properties: 0
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching profile statistics:', error);
    
    return {
      profile_completion: 0,
      account_age_days: 0,
      last_login: null,
      total_logins: 0,
      properties_owned: 0,
      bookings_made: 0,
      reviews_written: 0,
      favorite_properties: 0
    };
  }
};

export const updateProfilePreferences = async (preferences) => {
  try {
    if (!preferences || typeof preferences !== 'object') {
      throw new Error('Preferences data is required');
    }

    const response = await apiClient.put('/profile/preferences', preferences);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleProfileError(error, 'updating profile preferences');
  }
};

export const getProfilePreferences = async () => {
  try {
    const response = await apiClient.get('/profile/preferences');
    
    if (!response.data) {
      return {
        email_notifications: true,
        sms_notifications: false,
        marketing_emails: false,
        booking_reminders: true,
        property_updates: true,
        theme: 'system',
        language: 'en',
        currency: 'LKR',
        timezone: 'Asia/Colombo'
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching profile preferences:', error);
    
    return {
      email_notifications: true,
      sms_notifications: false,
      marketing_emails: false,
      booking_reminders: true,
      property_updates: true,
      theme: 'system',
      language: 'en',
      currency: 'LKR',
      timezone: 'Asia/Colombo'
    };
  }
};

export const updateNotificationSettings = async (settings) => {
  try {
    if (!settings || typeof settings !== 'object') {
      throw new Error('Notification settings are required');
    }

    const response = await apiClient.put('/profile/notifications', settings);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleProfileError(error, 'updating notification settings');
  }
};

export const getNotificationSettings = async () => {
  try {
    const response = await apiClient.get('/profile/notifications');
    
    if (!response.data) {
      return {
        email_bookings: true,
        email_property_updates: true,
        email_marketing: false,
        sms_bookings: false,
        sms_important: true,
        push_notifications: true,
        weekly_digest: true
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    
    return {
      email_bookings: true,
      email_property_updates: true,
      email_marketing: false,
      sms_bookings: false,
      sms_important: true,
      push_notifications: true,
      weekly_digest: true
    };
  }
};

export const getProfileActivityHistory = async (options = {}) => {
  try {
    const { page = 1, limit = 20, activity_type, date_from, date_to } = options;
    
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (activity_type) params.append('activity_type', activity_type);
    if (date_from) params.append('date_from', date_from);
    if (date_to) params.append('date_to', date_to);

    const response = await apiClient.get(`/profile/activity?${params.toString()}`);
    
    if (!response.data) {
      return {
        activities: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching profile activity history:', error);
    
    return {
      activities: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
    };
  }
};

export const updateSecuritySettings = async (securityData) => {
  try {
    if (!securityData || typeof securityData !== 'object') {
      throw new Error('Security settings are required');
    }

    const response = await apiClient.put('/profile/security', securityData);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleProfileError(error, 'updating security settings');
  }
};

export const getSecuritySettings = async () => {
  try {
    const response = await apiClient.get('/profile/security');
    
    if (!response.data) {
      return {
        two_factor_enabled: false,
        login_notifications: true,
        session_timeout: 24,
        trusted_devices: [],
        recent_logins: []
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching security settings:', error);
    
    return {
      two_factor_enabled: false,
      login_notifications: true,
      session_timeout: 24,
      trusted_devices: [],
      recent_logins: []
    };
  }
};

export const enableTwoFactorAuth = async (method = 'email') => {
  try {
    const response = await apiClient.post('/profile/two-factor/enable', {
      method
    });
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleProfileError(error, 'enabling two-factor authentication');
  }
};

export const disableTwoFactorAuth = async (verificationCode) => {
  try {
    if (!verificationCode) {
      throw new Error('Verification code is required');
    }

    const response = await apiClient.post('/profile/two-factor/disable', {
      verification_code: verificationCode
    });
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleProfileError(error, 'disabling two-factor authentication');
  }
};

export const generateBackupCodes = async () => {
  try {
    const response = await apiClient.post('/profile/two-factor/backup-codes');
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleProfileError(error, 'generating backup codes');
  }
};

export const verifyTwoFactorSetup = async (verificationCode) => {
  try {
    if (!verificationCode) {
      throw new Error('Verification code is required');
    }

    const response = await apiClient.post('/profile/two-factor/verify', {
      verification_code: verificationCode
    });
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleProfileError(error, 'verifying two-factor setup');
  }
};

export const requestAccountDeletion = async (reason = '', password) => {
  try {
    if (!password) {
      throw new Error('Password is required for account deletion');
    }

    const response = await apiClient.post('/profile/delete-account', {
      reason,
      password,
      confirm: true
    });
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleProfileError(error, 'requesting account deletion');
  }
};

export const exportProfileData = async (format = 'json') => {
  try {
    const response = await apiClient.get(`/profile/export?format=${format}`, {
      responseType: 'blob'
    });
    
    return response.data;
  } catch (error) {
    handleProfileError(error, 'exporting profile data');
  }
};

export const validateProfileCompleteness = async () => {
  try {
    const response = await apiClient.get('/profile/completeness');
    
    if (!response.data) {
      return {
        completion_percentage: 0,
        missing_fields: [],
        recommendations: [],
        is_complete: false
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error validating profile completeness:', error);
    
    return {
      completion_percentage: 0,
      missing_fields: [],
      recommendations: [],
      is_complete: false
    };
  }
};

export const updateProfileAvatar = uploadProfileImage;

export const getProfileConnectedAccounts = async () => {
  try {
    const response = await apiClient.get('/profile/connected-accounts');
    
    if (!response.data) {
      return {
        google: { connected: false },
        facebook: { connected: false },
        apple: { connected: false }
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching connected accounts:', error);
    
    return {
      google: { connected: false },
      facebook: { connected: false },
      apple: { connected: false }
    };
  }
};

export const connectAccount = async (provider, authCode) => {
  try {
    if (!provider || !authCode) {
      throw new Error('Provider and authorization code are required');
    }

    const response = await apiClient.post('/profile/connect-account', {
      provider,
      auth_code: authCode
    });
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleProfileError(error, 'connecting account');
  }
};

export const disconnectAccount = async (provider) => {
  try {
    if (!provider) {
      throw new Error('Provider is required');
    }

    const response = await apiClient.post('/profile/disconnect-account', {
      provider
    });
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleProfileError(error, 'disconnecting account');
  }
};