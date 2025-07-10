import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('tokenExpiry');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const submitBookingRequest = async (bookingData) => {
  try {
    const requiredFields = [
      'property_id', 'first_name', 'last_name', 'email', 'mobile_number',
      'check_in_date', 'check_out_date', 'occupation', 'field'
    ];

    for (const field of requiredFields) {
      if (!bookingData[field]) {
        throw new Error(`${field.replace('_', ' ')} is required`);
      }
    }

    const checkIn = new Date(bookingData.check_in_date);
    const checkOut = new Date(bookingData.check_out_date);
    const today = new Date();

    if (checkIn <= today) {
      throw new Error('Check-in date must be in the future');
    }

    if (checkOut <= checkIn) {
      throw new Error('Check-out date must be after check-in date');
    }

    const response = await apiClient.post('/bookings/request', bookingData);
    return response.data;
  } catch (error) {
    console.error('Error submitting booking request:', error);
    throw error;
  }
};

export const getUserBookings = async () => {
  try {
    const response = await apiClient.get('/bookings/user');
    return response.data;
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    throw error;
  }
};

export const getPropertyOwnerBookings = async () => {
  try {
    const response = await apiClient.get('/bookings/owner');
    return response.data;
  } catch (error) {
    console.error('Error fetching property owner bookings:', error);
    throw error;
  }
};

export const respondToBookingRequest = async (bookingId, action, message = '', payment_account_info = '') => {
  try {
    if (!bookingId || !action) {
      throw new Error('Booking ID and action are required');
    }

    const validActions = ['approve', 'reject'];
    if (!validActions.includes(action)) {
      throw new Error('Action must be either "approve" or "reject"');
    }

    if (action === 'approve' && !payment_account_info) {
      throw new Error('Payment account information is required for approval');
    }

    const response = await apiClient.put(`/bookings/respond/${bookingId}`, {
      action,
      message,
      payment_account_info
    });
    return response.data;
  } catch (error) {
    console.error('Error responding to booking request:', error);
    throw error;
  }
};

export const updateBookingStatus = async (bookingId, status, message = '') => {
  try {
    if (!bookingId || !status) {
      throw new Error('Booking ID and status are required');
    }

    const validStatuses = ['approved', 'rejected', 'pending'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status. Must be approved, rejected, or pending');
    }

    const response = await apiClient.put(`/bookings/${bookingId}/status`, {
      status,
      message
    });
    return response.data;
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};

export const getBookingById = async (bookingId) => {
  try {
    if (!bookingId) {
      throw new Error('Booking ID is required');
    }

    const response = await apiClient.get(`/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching booking details:', error);
    throw error;
  }
};

export const cancelBooking = async (bookingId, reason = '') => {
  try {
    if (!bookingId) {
      throw new Error('Booking ID is required');
    }

    const response = await apiClient.delete(`/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw error;
  }
};

export const submitPaymentProof = async (bookingId, paymentData) => {
  try {
    if (!bookingId || !paymentData) {
      throw new Error('Booking ID and payment data are required');
    }

    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.put(
      `${API_URL}/bookings/submit-payment/${bookingId}`,
      paymentData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        timeout: 30000,
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error submitting payment proof:', error);
    throw error;
  }
};

export const confirmBooking = async (bookingId, action, message = '') => {
  try {
    if (!bookingId || !action) {
      throw new Error('Booking ID and action are required');
    }

    const validActions = ['confirm', 'reject_payment'];
    if (!validActions.includes(action)) {
      throw new Error('Action must be either "confirm" or "reject_payment"');
    }

    const response = await apiClient.put(`/bookings/confirm/${bookingId}`, {
      action,
      message
    });
    return response.data;
  } catch (error) {
    console.error('Error confirming booking:', error);
    throw error;
  }
};

export const getBookingStats = async () => {
  try {
    const response = await apiClient.get('/bookings/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching booking stats:', error);
    throw error;
  }
};

export const searchBookings = async (filters = {}) => {
  try {
    const response = await apiClient.get('/bookings/search', {
      params: filters
    });
    return response.data;
  } catch (error) {
    console.error('Error searching bookings:', error);
    throw error;
  }
};

export const sendBookingMessage = async (bookingId, message, type = 'note') => {
  try {
    if (!bookingId || !message) {
      throw new Error('Booking ID and message are required');
    }

    const response = await apiClient.post(`/bookings/${bookingId}/message`, {
      message,
      type
    });
    return response.data;
  } catch (error) {
    console.error('Error sending booking message:', error);
    throw error;
  }
};

export const getBookingMessages = async (bookingId) => {
  try {
    if (!bookingId) {
      throw new Error('Booking ID is required');
    }

    const response = await apiClient.get(`/bookings/${bookingId}/messages`);
    return response.data;
  } catch (error) {
    console.error('Error fetching booking messages:', error);
    throw error;
  }
};

export const getBookingHistory = async (userId = null, propertyOwnerId = null) => {
  try {
    const params = {};
    if (userId) params.userId = userId;
    if (propertyOwnerId) params.propertyOwnerId = propertyOwnerId;

    const response = await apiClient.get('/bookings/history', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching booking history:', error);
    throw error;
  }
};

export const updateBookingDates = async (bookingId, checkInDate, checkOutDate) => {
  try {
    if (!bookingId || !checkInDate || !checkOutDate) {
      throw new Error('Booking ID, check-in date, and check-out date are required');
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const today = new Date();

    if (checkIn <= today) {
      throw new Error('Check-in date must be in the future');
    }

    if (checkOut <= checkIn) {
      throw new Error('Check-out date must be after check-in date');
    }

    const response = await apiClient.put(`/bookings/${bookingId}/dates`, {
      check_in_date: checkInDate,
      check_out_date: checkOutDate
    });
    return response.data;
  } catch (error) {
    console.error('Error updating booking dates:', error);
    throw error;
  }
};

export const requestBookingModification = async (bookingId, modificationType, newData, reason) => {
  try {
    if (!bookingId || !modificationType || !reason) {
      throw new Error('Booking ID, modification type, and reason are required');
    }

    const response = await apiClient.post(`/bookings/${bookingId}/modify`, {
      modification_type: modificationType,
      new_data: newData,
      reason
    });
    return response.data;
  } catch (error) {
    console.error('Error requesting booking modification:', error);
    throw error;
  }
};

export const approveBookingModification = async (modificationId, approved = true, adminMessage = '') => {
  try {
    if (!modificationId) {
      throw new Error('Modification ID is required');
    }

    const response = await apiClient.put(`/bookings/modifications/${modificationId}`, {
      approved,
      admin_message: adminMessage
    });
    return response.data;
  } catch (error) {
    console.error('Error approving booking modification:', error);
    throw error;
  }
};

export const getBookingModifications = async (bookingId) => {
  try {
    if (!bookingId) {
      throw new Error('Booking ID is required');
    }

    const response = await apiClient.get(`/bookings/${bookingId}/modifications`);
    return response.data;
  } catch (error) {
    console.error('Error fetching booking modifications:', error);
    throw error;
  }
};

export const generateBookingReport = async (startDate, endDate, propertyId = null) => {
  try {
    if (!startDate || !endDate) {
      throw new Error('Start date and end date are required');
    }

    const params = {
      start_date: startDate,
      end_date: endDate
    };

    if (propertyId) {
      params.property_id = propertyId;
    }

    const response = await apiClient.get('/bookings/report', { params });
    return response.data;
  } catch (error) {
    console.error('Error generating booking report:', error);
    throw error;
  }
};

export default {
  submitBookingRequest,
  getUserBookings,
  getPropertyOwnerBookings,
  respondToBookingRequest,
  updateBookingStatus,
  getBookingById,
  cancelBooking,
  submitPaymentProof,
  confirmBooking,
  getBookingStats,
  searchBookings,
  sendBookingMessage,
  getBookingMessages,
  getBookingHistory,
  updateBookingDates,
  requestBookingModification,
  approveBookingModification,
  getBookingModifications,
  generateBookingReport
};