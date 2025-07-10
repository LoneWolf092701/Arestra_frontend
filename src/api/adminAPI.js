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
 * Get all pending properties awaiting approval
 * @returns {Promise<Array>} List of pending properties
 */
export const getPendingProperties = async () => {
  try {
    const response = await apiClient.get('/admin/pending-properties');
    return response.data;
  } catch (error) {
    console.error('Error fetching pending properties:', error);
    
    if (error.response?.status === 403) {
      throw new Error('Access denied. Admin role required.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error(error.response?.data?.message || 'Failed to fetch pending properties');
    }
  }
};

/**
 * Get all approved properties
 * @returns {Promise<Array>} List of approved properties
 */
export const getApprovedProperties = async () => {
  try {
    const response = await apiClient.get('/admin/approved-properties');
    return response.data;
  } catch (error) {
    console.error('Error fetching approved properties:', error);
    
    if (error.response?.status === 403) {
      throw new Error('Access denied. Admin role required.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error(error.response?.data?.message || 'Failed to fetch approved properties');
    }
  }
};

/**
 * Get detailed information about a specific property
 * @param {string|number} propertyId - Property ID
 * @returns {Promise<Object>} Property details
 */
export const getPropertyDetails = async (propertyId) => {
  try {
    if (!propertyId) {
      throw new Error('Property ID is required');
    }

    const response = await apiClient.get(`/admin/property/${propertyId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching property details:', error);
    
    if (error.response?.status === 404) {
      throw new Error('Property not found');
    } else if (error.response?.status === 403) {
      throw new Error('Access denied. Admin role required.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error(error.response?.data?.message || 'Failed to fetch property details');
    }
  }
};

/**
 * Approve a pending property listing
 * @param {string|number} propertyId - Property ID to approve
 * @param {number} price - Monthly price set by admin
 * @returns {Promise<Object>} Approval response
 */
export const approveProperty = async (propertyId, price) => {
  try {
    if (!propertyId) {
      throw new Error('Property ID is required');
    }

    if (!price || isNaN(price) || price <= 0) {
      throw new Error('Valid price is required for property approval');
    }

    const response = await apiClient.post(`/admin/approve-property/${propertyId}`, {
      price: parseFloat(price)
    });

    return response.data;
  } catch (error) {
    console.error('Error approving property:', error);
    
    if (error.response?.status === 404) {
      throw new Error('Property not found or not in pending status');
    } else if (error.response?.status === 403) {
      throw new Error('Access denied. Admin role required.');
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data.message || 'Invalid approval data');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error(error.response?.data?.message || 'Failed to approve property');
    }
  }
};

/**
 * Reject a pending property listing
 * @param {string|number} propertyId - Property ID to reject
 * @param {string} reason - Reason for rejection
 * @returns {Promise<Object>} Rejection response
 */
export const rejectProperty = async (propertyId, reason) => {
  try {
    if (!propertyId) {
      throw new Error('Property ID is required');
    }

    if (!reason || reason.trim().length < 10) {
      throw new Error('Rejection reason is required and must be at least 10 characters long');
    }

    const response = await apiClient.post(`/admin/reject-property/${propertyId}`, {
      reason: reason.trim()
    });

    return response.data;
  } catch (error) {
    console.error('Error rejecting property:', error);
    
    if (error.response?.status === 404) {
      throw new Error('Property not found or not in pending status');
    } else if (error.response?.status === 403) {
      throw new Error('Access denied. Admin role required.');
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data.message || 'Invalid rejection data');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error(error.response?.data?.message || 'Failed to reject property');
    }
  }
};

/**
 * Get admin dashboard statistics
 * @returns {Promise<Object>} Dashboard statistics
 */
export const getAdminStats = async () => {
  try {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    
    if (error.response?.status === 403) {
      throw new Error('Access denied. Admin role required.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error(error.response?.data?.message || 'Failed to fetch admin statistics');
    }
  }
};

/**
 * Get list of all users with pagination
 * @param {Object} options - Query options
 * @param {string} options.role - Filter by user role
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 * @returns {Promise<Object>} Users list with pagination info
 */
export const getUsers = async (options = {}) => {
  try {
    const { role, page = 1, limit = 20 } = options;
    
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await apiClient.get(`/admin/users?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    
    if (error.response?.status === 403) {
      throw new Error('Access denied. Admin role required.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  }
};

/**
 * Update user account status
 * @param {string|number} userId - User ID
 * @param {string} status - New status ('active' or 'inactive')
 * @returns {Promise<Object>} Update response
 */
export const updateUserStatus = async (userId, status) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!['active', 'inactive'].includes(status)) {
      throw new Error('Status must be either "active" or "inactive"');
    }

    const response = await apiClient.put(`/admin/user/${userId}/status`, {
      status
    });

    return response.data;
  } catch (error) {
    console.error('Error updating user status:', error);
    
    if (error.response?.status === 404) {
      throw new Error('User not found');
    } else if (error.response?.status === 403) {
      throw new Error('Access denied. Admin role required.');
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data.message || 'Invalid status update');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error(error.response?.data?.message || 'Failed to update user status');
    }
  }
};

/**
 * Get system activity logs (if implemented)
 * @param {Object} options - Query options
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 * @param {string} options.startDate - Start date filter
 * @param {string} options.endDate - End date filter
 * @returns {Promise<Object>} Activity logs with pagination
 */
export const getActivityLogs = async (options = {}) => {
  try {
    const { page = 1, limit = 50, startDate, endDate } = options;
    
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await apiClient.get(`/admin/activity-logs?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    
    if (error.response?.status === 403) {
      throw new Error('Access denied. Admin role required.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error(error.response?.data?.message || 'Failed to fetch activity logs');
    }
  }
};

/**
 * Get property approval statistics
 * @param {Object} options - Query options
 * @param {string} options.startDate - Start date for statistics
 * @param {string} options.endDate - End date for statistics
 * @returns {Promise<Object>} Property approval statistics
 */
export const getPropertyApprovalStats = async (options = {}) => {
  try {
    const { startDate, endDate } = options;
    
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await apiClient.get(`/admin/property-approval-stats?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching property approval stats:', error);
    
    if (error.response?.status === 403) {
      throw new Error('Access denied. Admin role required.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error(error.response?.data?.message || 'Failed to fetch property approval statistics');
    }
  }
};

/**
 * Bulk approve multiple properties
 * @param {Array} propertyApprovals - Array of {propertyId, price} objects
 * @returns {Promise<Object>} Bulk approval response
 */
export const bulkApproveProperties = async (propertyApprovals) => {
  try {
    if (!Array.isArray(propertyApprovals) || propertyApprovals.length === 0) {
      throw new Error('Property approvals array is required');
    }

    // Validate each approval
    for (const approval of propertyApprovals) {
      if (!approval.propertyId || !approval.price || approval.price <= 0) {
        throw new Error('Each approval must have a valid propertyId and price');
      }
    }

    const promises = propertyApprovals.map(approval => 
      approveProperty(approval.propertyId, approval.price)
    );

    const results = await Promise.allSettled(promises);
    
    const successful = results.filter(result => result.status === 'fulfilled');
    const failed = results.filter(result => result.status === 'rejected');

    return {
      successful: successful.length,
      failed: failed.length,
      total: propertyApprovals.length,
      results: results
    };
  } catch (error) {
    console.error('Error bulk approving properties:', error);
    throw error;
  }
};

/**
 * Search properties with admin filters
 * @param {Object} filters - Search filters
 * @param {string} filters.status - approval_status filter
 * @param {string} filters.propertyType - property_type filter
 * @param {string} filters.ownerUsername - owner username filter
 * @param {string} filters.startDate - creation date start
 * @param {string} filters.endDate - creation date end
 * @returns {Promise<Array>} Filtered properties
 */
export const searchProperties = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });

    const response = await apiClient.get(`/admin/search-properties?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error searching properties:', error);
    
    if (error.response?.status === 403) {
      throw new Error('Access denied. Admin role required.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error(error.response?.data?.message || 'Failed to search properties');
    }
  }
};

/**
 * Export data to CSV format
 * @param {string} dataType - Type of data to export ('properties', 'users', 'bookings')
 * @param {Object} filters - Export filters
 * @returns {Promise<Blob>} CSV file blob
 */
export const exportData = async (dataType, filters = {}) => {
  try {
    if (!dataType) {
      throw new Error('Data type is required');
    }

    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });

    const response = await apiClient.get(`/admin/export/${dataType}?${params.toString()}`, {
      responseType: 'blob'
    });

    return new Blob([response.data], { type: 'text/csv' });
  } catch (error) {
    console.error('Error exporting data:', error);
    
    if (error.response?.status === 403) {
      throw new Error('Access denied. Admin role required.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error('Failed to export data');
    }
  }
};

/**
 * Remove/deactivate a property (soft delete)
 * This is typically used by admins to remove problematic properties
 * @param {string|number} propertyId - Property ID to remove
 * @param {string} reason - Reason for removal
 * @returns {Promise<Object>} Removal response
 */
export const removeProperty = async (propertyId, reason = 'Removed by admin') => {
  try {
    if (!propertyId) {
      throw new Error('Property ID is required');
    }

    const response = await apiClient.put(`/admin/remove-property/${propertyId}`, {
      reason: reason.trim()
    });

    return response.data;
  } catch (error) {
    console.error('Error removing property:', error);
    
    if (error.response?.status === 404) {
      throw new Error('Property not found');
    } else if (error.response?.status === 403) {
      throw new Error('Access denied. Admin role required.');
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data.message || 'Invalid removal request');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error(error.response?.data?.message || 'Failed to remove property');
    }
  }
};

export default {
  getPendingProperties,
  getApprovedProperties,
  getPropertyDetails,
  approveProperty,
  rejectProperty,
  removeProperty,
  getAdminStats,
  getUsers,
  updateUserStatus,
  getActivityLogs,
  getPropertyApprovalStats,
  bulkApproveProperties,
  searchProperties,
  exportData
};