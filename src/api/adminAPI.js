// API functions for admin operations

const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to create headers with authentication token
const createAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
});

// Helper function to handle API responses and errors consistently
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

/**
 * Fetch all properties that are pending admin approval
 * @param {string} token - Admin authentication token
 * @returns {Promise<Array>} Array of pending properties
 */
export const getPendingProperties = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/pending-properties`, {
      method: 'GET',
      headers: createAuthHeaders(token)
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching pending properties:', error);
    throw error;
  }
};

/**
 * Fetch all approved properties visible to users
 * @param {string} token - Admin authentication token
 * @returns {Promise<Array>} Array of approved properties
 */
export const getApprovedProperties = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/approved-properties`, {
      method: 'GET',
      headers: createAuthHeaders(token)
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching approved properties:', error);
    throw error;
  }
};

/**
 * Approve a property listing
 * @param {number} propertyId - ID of the property to approve
 * @param {string} token - Admin authentication token
 * @returns {Promise<Object>} Success response
 */
export const approveProperty = async (propertyId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/approve-property/${propertyId}`, {
      method: 'POST',
      headers: createAuthHeaders(token),
      body: JSON.stringify({ status: 'approved' })
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error approving property:', error);
    throw error;
  }
};

/**
 * Reject a property listing with a reason
 * @param {number} propertyId - ID of the property to reject
 * @param {string} reason - Reason for rejection (sent to property owner)
 * @param {string} token - Admin authentication token
 * @returns {Promise<Object>} Success response
 */
export const rejectProperty = async (propertyId, reason, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/reject-property/${propertyId}`, {
      method: 'POST',
      headers: createAuthHeaders(token),
      body: JSON.stringify({ 
        status: 'rejected',
        rejection_reason: reason 
      })
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error rejecting property:', error);
    throw error;
  }
};

/**
 * Get admin dashboard statistics
 * @param {string} token - Admin authentication token
 * @returns {Promise<Object>} Dashboard statistics
 */
export const getAdminStats = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      method: 'GET',
      headers: createAuthHeaders(token)
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw error;
  }
};

/**
 * Get detailed information about a specific property for admin review
 * @param {number} propertyId - ID of the property
 * @param {string} token - Admin authentication token
 * @returns {Promise<Object>} Detailed property information
 */
export const getPropertyDetails = async (propertyId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/property/${propertyId}`, {
      method: 'GET',
      headers: createAuthHeaders(token)
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching property details:', error);
    throw error;
  }
};

/**
 * Remove/hide an approved property (admin moderation)
 * @param {number} propertyId - ID of the property to remove
 * @param {string} reason - Reason for removal
 * @param {string} token - Admin authentication token
 * @returns {Promise<Object>} Success response
 */
export const removeProperty = async (propertyId, reason, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/remove-property/${propertyId}`, {
      method: 'POST',
      headers: createAuthHeaders(token),
      body: JSON.stringify({ 
        status: 'removed',
        removal_reason: reason 
      })
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error removing property:', error);
    throw error;
  }
};