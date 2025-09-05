import axios from 'axios';
import { createApiClient, createUploadClient } from './apiConfig';


const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = createApiClient();

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

const validatePropertyId = (propertyId) => {
  if (!propertyId) return null;
  const id = parseInt(propertyId);
  if (isNaN(id) || id <= 0) {
    throw new Error('Property ID must be a valid positive number');
  }
  return id;
};

const validateBookingId = (bookingId) => {
  if (!bookingId) {
    throw new Error('Booking ID is required');
  }
  const id = parseInt(bookingId);
  if (isNaN(id) || id <= 0) {
    throw new Error('Booking ID must be a valid positive number');
  }
  return id;
};

const processBookingData = (booking) => {
  if (!booking) return booking;
  
  return {
    ...booking,
    check_in_date: booking.check_in_date ? new Date(booking.check_in_date).toISOString().split('T')[0] : null,
    check_out_date: booking.check_out_date ? new Date(booking.check_out_date).toISOString().split('T')[0] : null,
    created_at: booking.created_at ? new Date(booking.created_at) : null,
    updated_at: booking.updated_at ? new Date(booking.updated_at) : null,
    total_price: parseFloat(booking.total_price) || 0,
    advance_amount: parseFloat(booking.advance_amount) || 0,
    service_fee: parseFloat(booking.service_fee) || 0,
    remaining_amount: (parseFloat(booking.total_price) || 0) - (parseFloat(booking.advance_amount) || 0)
  };
};

const handleBookingError = (error, operation) => {
  console.error(`Error ${operation}:`, error);
  
  if (error.response?.status === 403) {
    throw new Error('You do not have permission for this action.');
  } else if (error.response?.status === 401) {
    throw new Error('Please log in to access booking features.');
  } else if (error.response?.status === 400) {
    throw new Error(error.response.data?.message || `Invalid data for ${operation}`);
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

    const validatedPropertyId = validatePropertyId(bookingData.property_id);
    if (!validatedPropertyId) {
      throw new Error('Valid property ID is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bookingData.email)) {
      throw new Error('Please enter a valid email address');
    }

    const payload = {
      ...bookingData,
      property_id: validatedPropertyId
    };

    const response = await apiClient.post('/bookings', payload);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return processBookingData(response.data);
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
    
    if (status && ['pending', 'approved', 'payment_submitted', 'confirmed', 'rejected', 'auto_rejected', 'payment_rejected', 'cancelled'].includes(status)) {
      params.append('status', status);
    }
    
    if (property_id) {
      const validatedId = validatePropertyId(property_id);
      if (validatedId) {
        params.append('property_id', validatedId.toString());
      }
    }
    
    if (date_from && typeof date_from === 'string' && date_from.trim() !== '') {
      params.append('date_from', date_from);
    }
    
    if (date_to && typeof date_to === 'string' && date_to.trim() !== '') {
      params.append('date_to', date_to);
    }

    const response = await apiClient.get(`/bookings/user?${params.toString()}`);
    
    if (!response.data) {
      return {
        bookings: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrevious: false
        }
      };
    }
    
    const processedData = {
      ...response.data,
      bookings: response.data.bookings?.map(processBookingData) || []
    };
    
    return processedData;
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    
    return {
      bookings: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false
      }
    };
  }
};

export const getOwnerBookings = async (options = {}) => {
  try {
    const { page = 1, limit = 20, status, property_id, date_from, date_to } = options;
    
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (status && ['pending', 'approved', 'payment_submitted', 'confirmed', 'rejected', 'auto_rejected', 'payment_rejected', 'cancelled'].includes(status)) {
      params.append('status', status);
    }
    
    if (property_id) {
      const validatedId = validatePropertyId(property_id);
      if (validatedId) {
        params.append('property_id', validatedId.toString());
      }
    }
    
    if (date_from && typeof date_from === 'string' && date_from.trim() !== '') {
      params.append('date_from', date_from);
    }
    
    if (date_to && typeof date_to === 'string' && date_to.trim() !== '') {
      params.append('date_to', date_to);
    }

    const response = await apiClient.get(`/bookings/owner?${params.toString()}`);
    
    if (!response.data) {
      return {
        bookings: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrevious: false
        }
      };
    }
    
    const processedData = {
      ...response.data,
      bookings: response.data.bookings?.map(processBookingData) || []
    };
    
    return processedData;
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

    if (responseData.action === 'reject' && !responseData.message) {
      throw new Error('Rejection reason is required');
    }

    const response = await apiClient.put(`/bookings/${validatedId}/respond`, responseData);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return processBookingData(response.data);
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
    
    return processBookingData(response.data);
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
    
    return processBookingData(response.data);
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
    
    return processBookingData(response.data);
  } catch (error) {
    handleBookingError(error, 'fetching booking details');
  }
};

export const getPropertyAvailability = async (propertyId, options = {}) => {
  try {
    const validatedId = validatePropertyId(propertyId);
    if (!validatedId) {
      throw new Error('Valid property ID is required');
    }
    
    const { date_from, date_to } = options;
    
    const params = new URLSearchParams();
    if (date_from) params.append('date_from', date_from);
    if (date_to) params.append('date_to', date_to);
    
    const url = `/bookings/property/${validatedId}/availability${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiClient.get(url);
    
    if (!response.data) {
      return {
        property_id: validatedId,
        available: true,
        availability_windows: [],
        blocked_dates: []
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching property availability:', error);
    
    return {
      property_id: propertyId,
      available: true,
      availability_windows: [],
      blocked_dates: []
    };
  }
};

export const getPropertyAvailabilityStatus = async (propertyId, checkInDate, checkOutDate) => {
  try {
    const validatedId = validatePropertyId(propertyId);
    if (!validatedId) {
      throw new Error('Valid property ID is required');
    }
    
    if (!checkInDate || !checkOutDate) {
      throw new Error('Check-in and check-out dates are required');
    }
    
    const availability = await getPropertyAvailability(validatedId, {
      date_from: checkInDate,
      date_to: checkOutDate
    });
    
    return {
      property_id: validatedId,
      available: availability.available,
      check_in_date: checkInDate,
      check_out_date: checkOutDate
    };
  } catch (error) {
    console.error('Error checking property availability status:', error);
    
    return {
      property_id: propertyId,
      available: false,
      check_in_date: checkInDate,
      check_out_date: checkOutDate
    };
  }
};

export const updateBookingStatus = async (bookingId, statusData) => {
  try {
    const validatedId = validateBookingId(bookingId);
    
    if (!statusData || !statusData.status) {
      throw new Error('Status is required');
    }

    if (!['pending', 'approved', 'payment_submitted', 'confirmed', 'rejected', 'auto_rejected', 'payment_rejected', 'cancelled'].includes(statusData.status)) {
      throw new Error('Invalid status value');
    }

    const response = await apiClient.put(`/bookings/${validatedId}/status`, statusData);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return processBookingData(response.data);
  } catch (error) {
    handleBookingError(error, 'updating booking status');
  }
};

export const cancelBooking = async (bookingId, cancelData = {}) => {
  try {
    const validatedId = validateBookingId(bookingId);
    
    const response = await apiClient.put(`/bookings/${validatedId}/cancel`, cancelData);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return processBookingData(response.data);
  } catch (error) {
    handleBookingError(error, 'cancelling booking');
  }
};

export const getBookingStatistics = async (options = {}) => {
  try {
    const { property_id, date_from, date_to } = options;
    
    const params = new URLSearchParams();
    if (property_id) {
      const validatedId = validatePropertyId(property_id);
      if (validatedId) {
        params.append('property_id', validatedId.toString());
      }
    }
    if (date_from) params.append('date_from', date_from);
    if (date_to) params.append('date_to', date_to);
    
    const url = `/bookings/owner/statistics${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiClient.get(url);
    
    if (!response.data) {
      return {
        total_bookings: 0,
        confirmed_bookings: 0,
        pending_bookings: 0,
        cancelled_bookings: 0,
        total_revenue: 0,
        average_booking_value: 0
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
      average_booking_value: 0
    };
  }
};

export const uploadBookingDocuments = async (bookingId, formData) => {
  try {
    const validatedId = validateBookingId(bookingId);
    
    const uploadClient = createUploadClient();
    const response = await uploadClient.post(`/bookings/${validatedId}/upload-documents`, formData);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleBookingError(error, 'uploading documents');
  }
};

export const getBookingsByDateRange = async (options = {}) => {
  try {
    const { date_from, date_to, property_id, status } = options;
    
    const params = new URLSearchParams();
    if (date_from) params.append('date_from', date_from);
    if (date_to) params.append('date_to', date_to);
    if (property_id) {
      const validatedId = validatePropertyId(property_id);
      if (validatedId) {
        params.append('property_id', validatedId.toString());
      }
    }
    if (status) params.append('status', status);
    
    const response = await apiClient.get(`/bookings/date-range?${params.toString()}`);
    
    if (!response.data) {
      return [];
    }
    
    return response.data.map(processBookingData);
  } catch (error) {
    console.error('Error fetching bookings by date range:', error);
    return [];
  }
};

export const getBookingHistory = async (options = {}) => {
  try {
    const { page = 1, limit = 20 } = options;
    
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    const response = await apiClient.get(`/bookings/history?${params.toString()}`);
    
    if (!response.data) {
      return {
        bookings: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrevious: false
        }
      };
    }
    
    const processedData = {
      ...response.data,
      bookings: response.data.bookings?.map(processBookingData) || []
    };
    
    return processedData;
  } catch (error) {
    console.error('Error fetching booking history:', error);
    
    return {
      bookings: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false
      }
    };
  }
};

export const exportBookingData = async (options = {}) => {
  try {
    const { format = 'csv', date_from, date_to, property_id } = options;
    
    const params = new URLSearchParams();
    params.append('format', format);
    if (date_from) params.append('date_from', date_from);
    if (date_to) params.append('date_to', date_to);
    if (property_id) {
      const validatedId = validatePropertyId(property_id);
      if (validatedId) {
        params.append('property_id', validatedId.toString());
      }
    }
    
    const response = await apiClient.get(`/bookings/export?${params.toString()}`, {
      responseType: 'blob'
    });
    
    return response.data;
  } catch (error) {
    handleBookingError(error, 'exporting booking data');
  }
};

export const validateBookingRequest = (bookingData) => {
  const errors = [];
  
  if (!bookingData) {
    errors.push('Booking data is required');
    return { isValid: false, errors };
  }
  
  const requiredFields = ['property_id', 'first_name', 'last_name', 'email', 'mobile_number', 'check_in_date', 'check_out_date'];
  
  requiredFields.forEach(field => {
    if (!bookingData[field]) {
      errors.push(`${field.replace('_', ' ')} is required`);
    }
  });
  
  if (bookingData.property_id) {
    try {
      validatePropertyId(bookingData.property_id);
    } catch (error) {
      errors.push(error.message);
    }
  }
  
  if (bookingData.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bookingData.email)) {
      errors.push('Please enter a valid email address');
    }
  }
  
  if (bookingData.check_in_date && bookingData.check_out_date) {
    const checkIn = new Date(bookingData.check_in_date);
    const checkOut = new Date(bookingData.check_out_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (checkIn < today) {
      errors.push('Check-in date cannot be in the past');
    }
    
    if (checkOut <= checkIn) {
      errors.push('Check-out date must be after check-in date');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const submitPaymentReceipt = async (bookingId, receiptFile, nicFile) => {
  try {
    const validatedId = validateBookingId(bookingId);
    
    const formData = new FormData();
    formData.append('payment_receipt', receiptFile);
    formData.append('nic_document', nicFile);

    const response = await apiClient.post(`/bookings/${validatedId}/payment-receipt`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleBookingError(error, 'submitting payment receipt');
  }
};

export const createStripePaymentIntent = async (bookingId, amount, paymentMethodId) => {
  try {
    const validatedId = validateBookingId(bookingId);
    
    const response = await apiClient.post('/payments/create-payment-intent', {
      booking_id: validatedId,
      amount: amount,
      payment_method_id: paymentMethodId
    });
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleBookingError(error, 'creating payment intent');
  }
};

export const updateBookingStripePayment = async (bookingId, paymentIntentId, paymentMethodId) => {
  try {
    const validatedId = validateBookingId(bookingId);
    
    const response = await apiClient.post(`/bookings/${validatedId}/stripe-payment`, {
      payment_intent_id: paymentIntentId,
      payment_method_id: paymentMethodId
    });
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleBookingError(error, 'updating stripe payment');
  }
};

export const verifyStripePayment = async (paymentIntentId) => {
  try {
    const response = await apiClient.post('/payments/verify-stripe-payment', {
      payment_intent_id: paymentIntentId
    });
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleBookingError(error, 'verifying stripe payment');
  }
};

export default {
  submitBookingRequest,
  getUserBookings,
  getOwnerBookings,
  respondToBookingRequest,
  submitPayment,
  verifyPayment,
  submitPaymentReceipt,
  getBookingDetails,
  getPropertyAvailability,
  getPropertyAvailabilityStatus,
  updateBookingStatus,
  cancelBooking,
  getBookingStatistics,
  uploadBookingDocuments,
  getBookingsByDateRange,
  getBookingHistory,
  exportBookingData,
  validateBookingRequest,
  createStripePaymentIntent,
  updateBookingStripePayment,
  verifyStripePayment
};