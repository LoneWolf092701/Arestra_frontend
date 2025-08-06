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

const validateBookingId = (bookingId) => {
  const id = parseInt(bookingId);
  if (isNaN(id) || id <= 0) {
    throw new Error('Invalid booking ID provided');
  }
  return id;
};

const validatePropertyId = (propertyId) => {
  const id = parseInt(propertyId);
  if (isNaN(id) || id <= 0) {
    throw new Error('Invalid property ID provided');
  }
  return id;
};

const handleBookingError = (error, operation) => {
  console.error(`Error ${operation}:`, error);
  
  if (error.response?.status === 400) {
    throw new Error(error.response.data?.message || `Invalid data for ${operation}`);
  } else if (error.response?.status === 401) {
    throw new Error('Please log in to access booking features');
  } else if (error.response?.status === 403) {
    throw new Error('Access denied. You do not have permission for this action.');
  } else if (error.response?.status === 404) {
    throw new Error('Booking not found');
  } else if (error.response?.status >= 500) {
    throw new Error('Server error. Please try again later.');
  }
  
  throw new Error(error.response?.data?.message || `Failed to ${operation}`);
};

export const submitBookingRequest = async (bookingData) => {
  try {
    if (!bookingData || typeof bookingData !== 'object') {
      throw new Error('Booking data is required');
    }

    const requiredFields = ['property_id', 'first_name', 'last_name', 'email', 'mobile_number', 'check_in_date', 'check_out_date'];
    
    for (const field of requiredFields) {
      if (!bookingData[field]) {
        throw new Error(`${field.replace('_', ' ')} is required`);
      }
    }

    const response = await apiClient.post('/bookings', bookingData);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleBookingError(error, 'submitting booking request');
  }
};

export const getUserBookings = async (options = {}) => {
  try {
    const { page = 1, limit = 20, status, property_id, date_from, date_to } = options;
    
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (status) params.append('status', status);
    if (property_id) params.append('property_id', property_id.toString());
    if (date_from) params.append('date_from', date_from);
    if (date_to) params.append('date_to', date_to);

    const response = await apiClient.get(`/bookings/user?${params.toString()}`);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleBookingError(error, 'fetching user bookings');
  }
};

export const getOwnerBookings = async (options = {}) => {
  try {
    const { page = 1, limit = 20, status, property_id, date_from, date_to } = options;
    
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (status) params.append('status', status);
    if (property_id) params.append('property_id', property_id.toString());
    if (date_from) params.append('date_from', date_from);
    if (date_to) params.append('date_to', date_to);

    const response = await apiClient.get(`/bookings/owner?${params.toString()}`);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleBookingError(error, 'fetching owner bookings');
  }
};

export const respondToBookingRequest = async (bookingId, responseData) => {
  try {
    const validatedId = validateBookingId(bookingId);
    
    if (!responseData || typeof responseData !== 'object') {
      throw new Error('Response data is required');
    }

    if (!responseData.action || !['approve', 'reject'].includes(responseData.action)) {
      throw new Error('Action must be either "approve" or "reject"');
    }

    const response = await apiClient.put(`/bookings/${validatedId}/respond`, responseData);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleBookingError(error, 'responding to booking request');
  }
};

export const submitPayment = async (bookingId, paymentData) => {
  try {
    const validatedId = validateBookingId(bookingId);
    
    if (!paymentData || typeof paymentData !== 'object') {
      throw new Error('Payment data is required');
    }

    const response = await apiClient.post(`/bookings/${validatedId}/payment`, paymentData);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleBookingError(error, 'submitting payment');
  }
};

export const verifyPayment = async (bookingId, verificationData = {}) => {
  try {
    const validatedId = validateBookingId(bookingId);
    
    const response = await apiClient.post(`/bookings/${validatedId}/verify-payment`, verificationData);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleBookingError(error, 'verifying payment');
  }
};

export const getBookingDetails = async (bookingId) => {
  try {
    const validatedId = validateBookingId(bookingId);
    
    const response = await apiClient.get(`/bookings/${validatedId}`);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleBookingError(error, 'fetching booking details');
  }
};

export const getPropertyAvailability = async (propertyId, options = {}) => {
  try {
    const validatedId = validatePropertyId(propertyId);
    const { date_from, date_to } = options;
    
    const params = new URLSearchParams();
    if (date_from) params.append('date_from', date_from);
    if (date_to) params.append('date_to', date_to);
    
    const url = `/bookings/property/${validatedId}/availability${params.toString() ? `?${params}` : ''}`;
    
    const response = await apiClient.get(url);
    
    if (!response.data) {
      return {
        available: true,
        conflicting_bookings: [],
        available_periods: []
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching property availability:', error);
    
    return {
      available: true,
      conflicting_bookings: [],
      available_periods: []
    };
  }
};

export const getPropertyAvailabilityStatus = async (propertyId) => {
  try {
    const validatedId = validatePropertyId(propertyId);
    
    const response = await apiClient.get(`/bookings/property/${validatedId}/status`);
    
    if (!response.data) {
      return {
        property_id: validatedId,
        is_available: true,
        pending_requests: 0,
        confirmed_bookings: [],
        statistics: {
          total_bookings: 0,
          pending_requests: 0,
          confirmed_bookings: 0,
          revenue_generated: 0
        }
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching property availability status:', error);
    const validatedId = parseInt(propertyId); 
    return {
      property_id: validatedId,
      is_available: true,
      pending_requests: 0,
      confirmed_bookings: [],
      statistics: {
        total_bookings: 0,
        pending_requests: 0,
        confirmed_bookings: 0,
        revenue_generated: 0
      }
    };
  }
};

export const updateBookingStatus = async (bookingId, statusData) => {
  try {
    const validatedId = validateBookingId(bookingId);
    
    if (!statusData || typeof statusData !== 'object') {
      throw new Error('Status data is required');
    }

    if (!statusData.status) {
      throw new Error('Status is required');
    }

    const validStatuses = ['pending', 'approved', 'payment_submitted', 'confirmed', 'rejected', 'auto_rejected', 'payment_rejected', 'cancelled'];
    
    if (!validStatuses.includes(statusData.status)) {
      throw new Error('Invalid status provided');
    }

    const response = await apiClient.put(`/bookings/${validatedId}/status`, statusData);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleBookingError(error, 'updating booking status');
  }
};

export const cancelBooking = async (bookingId, cancellationData = {}) => {
  try {
    const validatedId = validateBookingId(bookingId);
    
    const payload = {
      status: 'cancelled',
      cancellation_reason: cancellationData.reason || '',
      cancelled_by: cancellationData.cancelled_by || 'user'
    };

    const response = await apiClient.put(`/bookings/${validatedId}/cancel`, payload);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleBookingError(error, 'cancelling booking');
  }
};

export const getBookingStatistics = async (options = {}) => {
  try {
    const { period = 'monthly', year, month, property_id } = options;
    
    const params = new URLSearchParams();
    params.append('period', period);
    
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());
    if (property_id) params.append('property_id', property_id.toString());

    const response = await apiClient.get(`/bookings/owner/statistics?${params.toString()}`);
    
    if (!response.data) {
      return {
        total_bookings: 0,
        confirmed_bookings: 0,
        pending_bookings: 0,
        cancelled_bookings: 0,
        total_revenue: 0,
        average_booking_value: 0,
        occupancy_rate: 0,
        monthly_breakdown: [],
        property_breakdown: [],
        status_breakdown: {}
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching booking statistics:', error);
    
    return {
      total_bookings: 0,
      confirmed_bookings: 0,
      pending_bookings: 0,
      cancelled_bookings: 0,
      total_revenue: 0,
      average_booking_value: 0,
      occupancy_rate: 0,
      monthly_breakdown: [],
      property_breakdown: [],
      status_breakdown: {}
    };
  }
};

export const uploadBookingDocuments = async (bookingId, documentData) => {
  try {
    const validatedId = validateBookingId(bookingId);
    
    const formData = new FormData();
    
    if (documentData.paymentProof) {
      formData.append('payment_proof', documentData.paymentProof);
    }
    
    if (documentData.verificationDocument) {
      formData.append('verification_document', documentData.verificationDocument);
    }
    
    if (documentData.documentType) {
      formData.append('document_type', documentData.documentType);
    }
    
    const response = await axios.post(
      `${API_BASE_URL}/bookings/${validatedId}/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        timeout: 60000
      }
    );
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleBookingError(error, 'uploading booking documents');
  }
};

export const getBookingsByDateRange = async (dateFrom, dateTo, options = {}) => {
  try {
    if (!dateFrom || !dateTo) {
      throw new Error('Date range is required');
    }
    
    const { property_id, status, include_user_info = true, include_property_info = true } = options;
    
    const params = new URLSearchParams();
    params.append('date_from', dateFrom);
    params.append('date_to', dateTo);
    
    if (property_id) params.append('property_id', property_id.toString());
    if (status) params.append('status', status);
    if (include_user_info) params.append('include_user_info', 'true');
    if (include_property_info) params.append('include_property_info', 'true');

    const response = await apiClient.get(`/bookings/date-range?${params.toString()}`);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleBookingError(error, 'fetching bookings by date range');
  }
};

export const getBookingHistory = async (options = {}) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      include_cancelled = true, 
      include_completed = true,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = options;
    
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    params.append('include_cancelled', include_cancelled.toString());
    params.append('include_completed', include_completed.toString());
    params.append('sort_by', sort_by);
    params.append('sort_order', sort_order);

    const response = await apiClient.get(`/bookings/history?${params.toString()}`);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleBookingError(error, 'fetching booking history');
  }
};

export const exportBookingData = async (options = {}) => {
  try {
    const { 
      format = 'csv', 
      date_from, 
      date_to, 
      property_id, 
      status,
      include_personal_data = false 
    } = options;
    
    const params = new URLSearchParams();
    params.append('format', format);
    
    if (date_from) params.append('date_from', date_from);
    if (date_to) params.append('date_to', date_to);
    if (property_id) params.append('property_id', property_id.toString());
    if (status) params.append('status', status);
    if (include_personal_data) params.append('include_personal_data', 'true');

    const response = await apiClient.get(`/bookings/export?${params.toString()}`, {
      responseType: 'blob'
    });
    
    return response.data;
  } catch (error) {
    handleBookingError(error, 'exporting booking data');
  }
};

export const validateBookingRequest = async (bookingData) => {
  try {
    if (!bookingData || typeof bookingData !== 'object') {
      throw new Error('Booking data is required');
    }

    const response = await apiClient.post('/bookings/validate', bookingData);
    
    if (!response.data) {
      return {
        is_valid: false,
        errors: ['Invalid response from server'],
        warnings: []
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error validating booking request:', error);
    
    return {
      is_valid: false,
      errors: [error.message || 'Validation failed'],
      warnings: []
    };
  }
};