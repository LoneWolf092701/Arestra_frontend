import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Get property availability status with detailed information
 * @param {number} propertyId - Property ID
 * @returns {Promise<Object>} Availability status and statistics
 */
export const getPropertyAvailabilityStatus = async (propertyId) => {
  try {
    if (!propertyId) {
      throw new Error('Property ID is required');
    }
    
    const response = await apiClient.get(`/bookings/property/${propertyId}/status`);
    return response.data;
  } catch (error) {
    console.error('Error fetching property availability status:', error);
    
    if (error.response?.status === 404) {
      throw new Error('Property not found');
    }
    
    throw new Error(error.response?.data?.error || 'Failed to fetch property availability status');
  }
};

/**
 * Get property availability calendar with bookings  
 * @param {number} propertyId - Property ID
 * @param {Object} params - Optional date range parameters
 * @returns {Promise<Object>} Availability calendar data
 */
export const getPropertyAvailability = async (propertyId, params = {}) => {
  try {
    if (!propertyId) {
      throw new Error('Property ID is required');
    }
    
    const response = await apiClient.get(`/bookings/property/${propertyId}/availability`, {
      params
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching property availability:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch property availability');
  }
};

/**
 * Submit a new booking request
 * @param {Object} bookingData - Booking request data
 * @returns {Promise<Object>} Booking submission response
 */
export const submitBookingRequest = async (bookingData) => {
  try {
    if (!bookingData) {
      throw new Error('Booking data is required');
    }
    
    // Validate required fields
    const requiredFields = ['propertyId', 'checkInDate', 'checkOutDate', 'personalDetails'];
    const missingFields = requiredFields.filter(field => !bookingData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    // Validate personal details
    const requiredPersonalFields = ['firstName', 'lastName', 'email'];
    const missingPersonalFields = requiredPersonalFields.filter(
      field => !bookingData.personalDetails[field]
    );
    
    if (missingPersonalFields.length > 0) {
      throw new Error(`Missing required personal details: ${missingPersonalFields.join(', ')}`);
    }
    
    const response = await apiClient.post('/bookings', bookingData);
    return response.data;
  } catch (error) {
    console.error('Error submitting booking request:', error);
    
    if (error.response?.status === 400) {
      throw new Error(error.response.data?.error || 'Invalid booking data');
    } else if (error.response?.status === 401) {
      throw new Error('Please log in to submit a booking request');
    } else if (error.response?.status === 404) {
      throw new Error('Property not found or not available');
    } else if (error.response?.status === 409) {
      throw new Error(error.response.data?.error || 'Booking conflict with existing reservations');
    }
    
    throw new Error(error.response?.data?.error || 'Failed to submit booking request');
  }
};

/**
 * Get user's booking requests
 * @returns {Promise<Array>} User's booking requests
 */
export const getUserBookings = async () => {
  try {
    const response = await apiClient.get('/bookings/user');
    return response.data;
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Please log in to view your bookings');
    }
    
    throw new Error('Failed to fetch your booking requests');
  }
};

/**
 * Get property owner's booking requests
 * @returns {Promise<Array>} Property owner's booking requests
 */
export const getOwnerBookings = async () => {
  try {
    const response = await apiClient.get('/bookings/owner');
    return response.data;
  } catch (error) {
    console.error('Error fetching owner bookings:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Please log in to view booking requests');
    } else if (error.response?.status === 403) {
      throw new Error('Access denied. Property owner role required.');
    }
    
    throw new Error('Failed to fetch booking requests');
  }
};

/**
 * Respond to a booking request (approve/reject)
 * @param {number} requestId - Booking request ID
 * @param {Object} responseData - Response data (action, message, payment_account_info)
 * @returns {Promise<Object>} Response result
 */
export const respondToBookingRequest = async (requestId, responseData) => {
  try {
    if (!requestId) {
      throw new Error('Request ID is required');
    }
    
    if (!responseData.action || !['approve', 'reject'].includes(responseData.action)) {
      throw new Error('Valid action (approve/reject) is required');
    }
    
    if (responseData.action === 'approve' && !responseData.payment_account_info) {
      throw new Error('Payment account information is required for approval');
    }
    
    const response = await apiClient.put(`/bookings/respond/${requestId}`, responseData);
    return response.data;
  } catch (error) {
    console.error('Error responding to booking request:', error);
    
    if (error.response?.status === 400) {
      throw new Error(error.response.data?.error || 'Invalid response data');
    } else if (error.response?.status === 401) {
      throw new Error('Please log in to respond to booking requests');
    } else if (error.response?.status === 403) {
      throw new Error('Access denied. Property owner role required.');
    } else if (error.response?.status === 404) {
      throw new Error('Booking request not found');
    } else if (error.response?.status === 409) {
      throw new Error(error.response.data?.error || 'Booking conflict detected');
    }
    
    throw new Error(error.response?.data?.error || 'Failed to respond to booking request');
  }
};

/**
 * Submit payment proof for approved booking
 * @param {number} requestId - Booking request ID
 * @param {FormData} paymentData - Payment proof and verification documents
 * @returns {Promise<Object>} Submission result
 */
export const submitPaymentProof = async (requestId, paymentData) => {
  try {
    if (!requestId) {
      throw new Error('Request ID is required');
    }
    
    if (!paymentData || !(paymentData instanceof FormData)) {
      throw new Error('Payment data must be provided as FormData');
    }
    
    const response = await apiClient.put(`/bookings/submit-payment/${requestId}`, paymentData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // Extended timeout for file uploads
    });
    
    return response.data;
  } catch (error) {
    console.error('Error submitting payment proof:', error);
    
    if (error.response?.status === 400) {
      throw new Error(error.response.data?.error || 'Invalid payment documents');
    } else if (error.response?.status === 401) {
      throw new Error('Please log in to submit payment proof');
    } else if (error.response?.status === 404) {
      throw new Error('Booking request not found or not in approved status');
    } else if (error.response?.status === 413) {
      throw new Error('File size too large. Please upload smaller files.');
    }
    
    throw new Error(error.response?.data?.error || 'Failed to submit payment proof');
  }
};

/**
 * Confirm or reject payment verification (property owner)
 * @param {number} requestId - Booking request ID
 * @param {Object} verificationData - Verification action data
 * @returns {Promise<Object>} Verification result
 */
export const verifyPayment = async (requestId, verificationData) => {
  try {
    if (!requestId) {
      throw new Error('Request ID is required');
    }
    
    if (!verificationData.action || !['confirm', 'reject'].includes(verificationData.action)) {
      throw new Error('Valid verification action (confirm/reject) is required');
    }
    
    const response = await apiClient.put(`/bookings/confirm-payment/${requestId}`, verificationData);
    return response.data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    
    if (error.response?.status === 400) {
      throw new Error(error.response.data?.error || 'Invalid verification data');
    } else if (error.response?.status === 401) {
      throw new Error('Please log in to verify payments');
    } else if (error.response?.status === 403) {
      throw new Error('Access denied. Property owner role required.');
    } else if (error.response?.status === 404) {
      throw new Error('Booking request not found or not in payment submitted status');
    }
    
    throw new Error(error.response?.data?.error || 'Failed to verify payment');
  }
};

/**
 * Get specific booking details
 * @param {number} bookingId - Booking ID
 * @returns {Promise<Object>} Booking details
 */
export const getBookingDetails = async (bookingId) => {
  try {
    if (!bookingId) {
      throw new Error('Booking ID is required');
    }
    
    const response = await apiClient.get(`/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching booking details:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Please log in to view booking details');
    } else if (error.response?.status === 403) {
      throw new Error('Access denied. You can only view your own bookings.');
    } else if (error.response?.status === 404) {
      throw new Error('Booking not found');
    }
    
    throw new Error('Failed to fetch booking details');
  }
};

/**
 * Cancel a booking request
 * @param {number} bookingId - Booking ID
 * @returns {Promise<Object>} Cancellation result
 */
export const cancelBookingRequest = async (bookingId) => {
  try {
    if (!bookingId) {
      throw new Error('Booking ID is required');
    }
    
    const response = await apiClient.delete(`/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error('Error cancelling booking:', error);
    
    if (error.response?.status === 400) {
      throw new Error('Booking cannot be cancelled at this stage');
    } else if (error.response?.status === 401) {
      throw new Error('Please log in to cancel bookings');
    } else if (error.response?.status === 404) {
      throw new Error('Booking not found or cannot be cancelled');
    }
    
    throw new Error(error.response?.data?.error || 'Failed to cancel booking');
  }
};

/**
 * Calculate booking pricing (client-side helper)
 * This function can be used for immediate feedback before API calls
 * @param {Object} params - Pricing calculation parameters
 * @returns {Object} Pricing breakdown
 */
export const calculateBookingPrice = (params) => {
  const {
    monthlyRent,
    checkInDate,
    checkOutDate,
    serviceFee = 300
  } = params;
  
  if (!monthlyRent || !checkInDate || !checkOutDate) {
    return null;
  }
  
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const totalDays = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  
  if (totalDays <= 0) {
    return null;
  }
  
  // Business logic: 31+ days under 60 days = 2 months charge
  let bookingMonths, bookingDays;
  if (totalDays >= 31 && totalDays < 60) {
    bookingMonths = 2;
    bookingDays = 0;
  } else {
    const DAYS_PER_MONTH = 30;
    bookingMonths = Math.floor(totalDays / DAYS_PER_MONTH);
    bookingDays = totalDays % DAYS_PER_MONTH;
  }
  
  const dailyRate = monthlyRent / 25; // 25 business days per month
  const monthlyCharge = bookingMonths * monthlyRent;
  const dailyCharge = totalDays >= 31 && totalDays < 60 ? 0 : bookingDays * dailyRate;
  
  const subtotal = monthlyCharge + dailyCharge;
  const total = subtotal + serviceFee;
  
  return {
    totalDays,
    bookingMonths,
    bookingDays,
    monthlyCharge,
    dailyCharge,
    subtotal,
    serviceFee,
    total,
    isSpecialRate: totalDays >= 31 && totalDays < 60
  };
};

/**
 * Validate booking dates (client-side helper)
 * @param {Date|string} checkIn - Check-in date
 * @param {Date|string} checkOut - Check-out date
 * @returns {Object} Validation result
 */
export const validateBookingDates = (checkIn, checkOut) => {
  const errors = [];
  
  if (!checkIn || !checkOut) {
    errors.push('Both check-in and check-out dates are required');
    return { isValid: false, errors };
  }
  
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    errors.push('Invalid date format');
    return { isValid: false, errors };
  }
  
  if (checkInDate < today) {
    errors.push('Check-in date cannot be in the past');
  }
  
  if (checkOutDate <= checkInDate) {
    errors.push('Check-out date must be after check-in date');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export default {
  getPropertyAvailabilityStatus,
  getPropertyAvailability,
  submitBookingRequest,
  getUserBookings,
  getOwnerBookings,
  respondToBookingRequest,
  submitPaymentProof,
  verifyPayment,
  getBookingDetails,
  cancelBookingRequest,
  calculateBookingPrice,
  validateBookingDates
};