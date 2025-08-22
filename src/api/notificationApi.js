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

const handleNotificationError = (error, operation) => {
  console.error(`Error ${operation}:`, error);
  
  if (error.response?.status === 400) {
    throw new Error(error.response.data?.message || `Invalid data for ${operation}`);
  } else if (error.response?.status === 401) {
    throw new Error('Please log in to access notifications');
  } else if (error.response?.status === 403) {
    throw new Error('Access denied');
  } else if (error.response?.status === 404) {
    throw new Error('Notification not found');
  } else if (error.response?.status >= 500) {
    throw new Error('Server error. Please try again later.');
  }
  
  throw new Error(error.response?.data?.message || `Failed to ${operation}`);
};

export const getNotifications = async (options = {}) => {
  try {
    const { page = 1, limit = 20, unread_only = false } = options;
    
    const response = await apiClient.get('/notifications', {
      params: { page, limit, unread_only }
    });
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleNotificationError(error, 'fetching notifications');
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    if (!notificationId) {
      throw new Error('Notification ID is required');
    }

    const response = await apiClient.put(`/notifications/${notificationId}/read`);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleNotificationError(error, 'marking notification as read');
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const response = await apiClient.put('/notifications/mark-all-read');
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleNotificationError(error, 'marking all notifications as read');
  }
};

export const takeNotificationAction = async (notificationId, action, message = '') => {
  try {
    if (!notificationId || !action) {
      throw new Error('Notification ID and action are required');
    }

    if (!['accepted', 'rejected'].includes(action)) {
      throw new Error('Action must be accepted or rejected');
    }

    const response = await apiClient.put(`/notifications/${notificationId}/action`, {
      action,
      message
    });
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleNotificationError(error, 'taking notification action');
  }
};

export const getUnreadNotificationCount = async () => {
  try {
    const response = await apiClient.get('/notifications/unread-count');
    
    if (!response.data) {
      return { unread_count: 0 };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return { unread_count: 0 };
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    if (!notificationId) {
      throw new Error('Notification ID is required');
    }

    const response = await apiClient.delete(`/notifications/${notificationId}`);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleNotificationError(error, 'deleting notification');
  }
};