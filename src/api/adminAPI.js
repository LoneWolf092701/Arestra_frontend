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

const handleAdminError = (error, operation) => {
  console.error(`Error ${operation}:`, error);
  
  if (error.response?.status === 403) {
    throw new Error('Admin access required. You do not have permission to perform this action.');
  } else if (error.response?.status === 401) {
    throw new Error('Please log in to access admin features.');
  } else if (error.response?.status === 400) {
    throw new Error(error.response.data?.message || `Invalid data for ${operation}`);
  } else if (error.response?.status === 404) {
    throw new Error('Resource not found');
  } else if (error.response?.status >= 500) {
    throw new Error('Server error. Please try again later.');
  }
  
  throw new Error(error.response?.data?.message || `Failed to ${operation}`);
};

export const getDashboardStats = async () => {
  try {
    const response = await apiClient.get('/admin/dashboard-stats');
    
    if (!response.data) {
      return {
        total_users: 0,
        total_properties: 0,
        total_bookings: 0,
        pending_approvals: 0,
        monthly_revenue: 0,
        active_properties: 0,
        new_users_this_month: 0,
        approval_rate: 0
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    
    return {
      total_users: 0,
      total_properties: 0,
      total_bookings: 0,
      pending_approvals: 0,
      monthly_revenue: 0,
      active_properties: 0,
      new_users_this_month: 0,
      approval_rate: 0
    };
  }
};

export const getUsers = async (options = {}) => {
  try {
    const { page = 1, limit = 20, role = 'all', status = 'all', search, sort_by = 'created_at', sort_order = 'desc' } = options;
    
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    params.append('sort_by', sort_by);
    params.append('sort_order', sort_order);
    
    if (role && role !== 'all') params.append('role', role);
    if (status && status !== 'all') params.append('status', status);
    if (search) params.append('search', search);

    const response = await apiClient.get(`/admin/users?${params.toString()}`);
    
    if (!response.data) {
      return {
        users: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
      };
    }
    
    return response.data;
  } catch (error) {
    handleAdminError(error, 'fetching users');
  }
};

export const updateUserStatus = async (userId, status, reason = '') => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!['active', 'inactive', 'activate', 'deactivate'].includes(status)) {
      throw new Error('Invalid status. Must be "active", "inactive", "activate", or "deactivate"');
    }

    const action = status === 'active' ? 'activate' : 
                  status === 'inactive' ? 'deactivate' : status;

    const payload = {
      action,
      reason: reason || ''
    };

    const response = await apiClient.put(`/admin/users/${userId}/status`, payload);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleAdminError(error, 'updating user status');
  }
};

export const getUserDetails = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const response = await apiClient.get(`/admin/users/${userId}`);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleAdminError(error, 'fetching user details');
  }
};

export const getPendingProperties = async (options = {}) => {
  try {
    const { page = 1, limit = 20, sort_by = 'created_at', sort_order = 'desc' } = options;
    
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    params.append('sort_by', sort_by);
    params.append('sort_order', sort_order);

    const response = await apiClient.get(`/admin/properties/pending?${params.toString()}`);
    
    if (!response.data) {
      return {
        properties: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
      };
    }
    
    return response.data;
  } catch (error) {
    handleAdminError(error, 'fetching pending properties');
  }
};

export const getAllPropertiesAdmin = async (options = {}) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status = 'all', 
      approval_status = 'all',
      sort_by = 'created_at', 
      sort_order = 'desc',
      search,
      owner_id
    } = options;
    
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    params.append('sort_by', sort_by);
    params.append('sort_order', sort_order);
    
    if (status && status !== 'all') params.append('status', status);
    if (approval_status && approval_status !== 'all') params.append('approval_status', approval_status);
    if (search) params.append('search', search);
    if (owner_id) params.append('owner_id', owner_id.toString());

    const response = await apiClient.get(`/admin/properties?${params.toString()}`);
    
    if (!response.data) {
      return {
        properties: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
      };
    }
    
    return response.data;
  } catch (error) {
    handleAdminError(error, 'fetching admin properties');
  }
};

export const getApprovedProperties = async (options = {}) => {
  return getAllPropertiesAdmin({ ...options, approval_status: 'approved' });
};

export const approveRejectProperty = async (propertyId, action, reason = '') => {
  try {
    if (!propertyId) {
      throw new Error('Property ID is required');
    }

    if (!['approve', 'reject'].includes(action)) {
      throw new Error('Action must be either "approve" or "reject"');
    }

    // FIX: Convert frontend action to backend approval_status and use correct field names
    const approval_status = action === 'approve' ? 'approved' : 'rejected';
    
    const payload = {
      approval_status,  // Backend expects 'approval_status' not 'action'
      rejection_reason: reason || ''  // Backend expects 'rejection_reason' not 'reason'
    };

    const response = await apiClient.put(`/admin/properties/${propertyId}/approval`, payload);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleAdminError(error, `${action}ing property`);
  }
};

export const approveProperty = async (propertyId, reason = '') => {
  return approveRejectProperty(propertyId, 'approve', reason);
};

export const rejectProperty = async (propertyId, reason = '') => {
  return approveRejectProperty(propertyId, 'reject', reason);
};

export const getPropertyDetailsAdmin = async (propertyId) => {
  try {
    if (!propertyId) {
      throw new Error('Property ID is required');
    }

    const response = await apiClient.get(`/admin/properties/${propertyId}`);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleAdminError(error, 'fetching property details');
  }
};

export const deletePropertyAdmin = async (propertyId, reason = '') => {
  try {
    if (!propertyId) {
      throw new Error('Property ID is required');
    }

    const payload = reason ? { reason } : {};

    const response = await apiClient.delete(`/admin/properties/${propertyId}`, {
      data: payload
    });
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleAdminError(error, 'deleting property');
  }
};

export const removeProperty = deletePropertyAdmin;

export const getBookingRequestsAdmin = async (options = {}) => {
  try {
    const { page = 1, limit = 20, status = 'all', sort_by = 'created_at', sort_order = 'desc' } = options;
    
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    params.append('sort_by', sort_by);
    params.append('sort_order', sort_order);
    
    if (status && status !== 'all') params.append('status', status);

    const response = await apiClient.get(`/admin/booking-requests?${params.toString()}`);
    
    if (!response.data) {
      return {
        booking_requests: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching booking requests:', error);
    
    return {
      booking_requests: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
    };
  }
};

export const getActivityLogs = async (options = {}) => {
  try {
    const { page = 1, limit = 50, user_id, action_type, date_from, date_to } = options;
    
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (user_id) params.append('user_id', user_id.toString());
    if (action_type) params.append('action_type', action_type);
    if (date_from) params.append('date_from', date_from);
    if (date_to) params.append('date_to', date_to);

    const response = await apiClient.get(`/admin/activity-logs?${params.toString()}`);
    
    if (!response.data) {
      return {
        logs: [],
        pagination: { page: 1, limit: 50, total: 0, totalPages: 0 }
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    
    return {
      logs: [],
      pagination: { page: 1, limit: 50, total: 0, totalPages: 0 }
    };
  }
};

export const getPropertyApprovalStats = async (options = {}) => {
  try {
    const { period = 'monthly', year, month } = options;
    
    const params = new URLSearchParams();
    params.append('period', period);
    
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());

    const response = await apiClient.get(`/admin/property-approval-stats?${params.toString()}`);
    
    if (!response.data) {
      return {
        total_submitted: 0,
        total_approved: 0,
        total_rejected: 0,
        pending_approval: 0,
        approval_rate: 0,
        average_approval_time: 0,
        monthly_breakdown: [],
        category_breakdown: {}
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching property approval stats:', error);
    
    return {
      total_submitted: 0,
      total_approved: 0,
      total_rejected: 0,
      pending_approval: 0,
      approval_rate: 0,
      average_approval_time: 0,
      monthly_breakdown: [],
      category_breakdown: {}
    };
  }
};

export const getUserStatistics = async (options = {}) => {
  try {
    const { period = 'monthly', year, month, role } = options;
    
    const params = new URLSearchParams();
    params.append('period', period);
    
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());
    if (role && role !== 'all') params.append('role', role);

    const response = await apiClient.get(`/admin/user-statistics?${params.toString()}`);
    
    if (!response.data) {
      return {
        total_users: 0,
        active_users: 0,
        new_registrations: 0,
        user_retention_rate: 0,
        role_distribution: {},
        monthly_registrations: [],
        activity_metrics: {}
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    
    return {
      total_users: 0,
      active_users: 0,
      new_registrations: 0,
      user_retention_rate: 0,
      role_distribution: {},
      monthly_registrations: [],
      activity_metrics: {}
    };
  }
};

export const updateSystemConfig = async (configData) => {
  try {
    if (!configData || typeof configData !== 'object') {
      throw new Error('Configuration data is required');
    }

    const response = await apiClient.put('/admin/system-config', configData);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error updating system config:', error);
    throw new Error('Failed to update system configuration');
  }
};

export const getSystemConfig = async () => {
  try {
    const response = await apiClient.get('/admin/system-config');
    
    if (!response.data) {
      return {};
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching system config:', error);
    return {};
  }
};

export const createAnnouncement = async (announcementData) => {
  try {
    if (!announcementData || typeof announcementData !== 'object') {
      throw new Error('Announcement data is required');
    }

    const response = await apiClient.post('/admin/announcements', announcementData);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error creating announcement:', error);
    throw new Error('Failed to create announcement');
  }
};

export const getAnnouncements = async (options = {}) => {
  try {
    const { page = 1, limit = 20, status = 'all' } = options;
    
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (status && status !== 'all') params.append('status', status);

    const response = await apiClient.get(`/admin/announcements?${params.toString()}`);
    
    if (!response.data) {
      return {
        announcements: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching announcements:', error);
    
    return {
      announcements: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
    };
  }
};

export const getReportedContent = async (options = {}) => {
  try {
    const { page = 1, limit = 20, status = 'all', content_type, sort_by = 'created_at', sort_order = 'desc' } = options;
    
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    params.append('sort_by', sort_by);
    params.append('sort_order', sort_order);
    
    if (status && status !== 'all') params.append('status', status);
    if (content_type) params.append('content_type', content_type);

    const response = await apiClient.get(`/admin/reported-content?${params.toString()}`);
    
    if (!response.data) {
      return {
        reports: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching reported content:', error);
    
    return {
      reports: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
    };
  }
};

export const resolveReport = async (reportId, resolutionData) => {
  try {
    if (!reportId) {
      throw new Error('Report ID is required');
    }

    if (!resolutionData || typeof resolutionData !== 'object') {
      throw new Error('Resolution data is required');
    }

    const response = await apiClient.put(`/admin/reported-content/${reportId}/resolve`, resolutionData);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error resolving report:', error);
    throw new Error('Failed to resolve report');
  }
};

export const exportAdminData = async (options = {}) => {
  try {
    const { 
      data_type = 'users', 
      format = 'csv',
      date_from,
      date_to,
      include_sensitive_data = false
    } = options;
    
    const params = new URLSearchParams();
    params.append('data_type', data_type);
    params.append('format', format);
    
    if (date_from) params.append('date_from', date_from);
    if (date_to) params.append('date_to', date_to);
    if (include_sensitive_data) params.append('include_sensitive_data', 'true');

    const response = await apiClient.get(`/admin/export?${params.toString()}`, {
      responseType: 'blob'
    });
    
    const blob = new Blob([response.data], { type: response.headers['content-type'] });
    const filename = response.headers['content-disposition']?.split('filename=')[1] || `export.${format}`;
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true, message: 'Export downloaded successfully' };
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};

export const getSystemHealth = async () => {
  try {
    const response = await apiClient.get('/admin/system-health');
    
    if (!response.data) {
      return {
        status: 'unknown',
        uptime: 0,
        memory_usage: 0,
        cpu_usage: 0,
        database_status: 'unknown',
        services: []
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching system health:', error);
    
    return {
      status: 'error',
      uptime: 0,
      memory_usage: 0,
      cpu_usage: 0,
      database_status: 'error',
      services: []
    };
  }
};

export const getFinancialReports = async (options = {}) => {
  try {
    const { period = 'monthly', year, month, report_type = 'revenue' } = options;
    
    const params = new URLSearchParams();
    params.append('period', period);
    params.append('report_type', report_type);
    
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());

    const response = await apiClient.get(`/admin/financial-reports?${params.toString()}`);
    
    if (!response.data) {
      return {
        total_revenue: 0,
        total_transactions: 0,
        average_transaction: 0,
        commission_earned: 0,
        monthly_breakdown: [],
        payment_methods: {}
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching financial reports:', error);
    
    return {
      total_revenue: 0,
      total_transactions: 0,
      average_transaction: 0,
      commission_earned: 0,
      monthly_breakdown: [],
      payment_methods: {}
    };
  }
};