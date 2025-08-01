// BookingCalculationUtils.js - Enhanced booking calculation utilities for monthly rentals

/**
 * Calculate the number of months and days for a given date range
 * @param {string|Date} checkInDate - Check-in date
 * @param {string|Date} checkOutDate - Check-out date
 * @returns {Object} Object containing months, days, and total days
 */
export const calculateBookingDuration = (checkInDate, checkOutDate) => {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  
  // Reset time to avoid timezone issues
  checkIn.setHours(0, 0, 0, 0);
  checkOut.setHours(0, 0, 0, 0);
  
  // Calculate total days
  const totalDays = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  
  if (totalDays <= 0) {
    return { months: 0, days: 0, totalDays: 0 };
  }
  
  // Calculate months and remaining days
  // We consider 30 days = 1 month for billing purposes
  const DAYS_PER_MONTH = 30;
  const months = Math.floor(totalDays / DAYS_PER_MONTH);
  const remainingDays = totalDays % DAYS_PER_MONTH;
  
  return {
    months,
    days: remainingDays,
    totalDays
  };
};

/**
 * Calculate rental pricing based on property price and booking duration
 * Enhanced logic: 31+ days under 60 days = 2 months charge
 * @param {Object} params - Calculation parameters
 * @param {number} params.monthlyRent - Monthly rent amount
 * @param {string|Date} params.checkInDate - Check-in date
 * @param {string|Date} params.checkOutDate - Check-out date
 * @param {number} params.serviceFee - Service fee (default: 300)
 * @param {number} params.dailyRate - Daily rate multiplier (default: 1/25 of monthly rate)
 * @returns {Object} Pricing breakdown
 */
export const calculateBookingPricing = ({
  monthlyRent,
  checkInDate,
  checkOutDate,
  serviceFee = 300,
  dailyRate = null
}) => {
  const duration = calculateBookingDuration(checkInDate, checkOutDate);
  
  if (duration.totalDays <= 0) {
    return {
      duration,
      monthlyRent: 0,
      dailyRent: 0,
      serviceFee,
      subtotal: 0,
      total: serviceFee,
      breakdown: {
        months: 0,
        days: 0,
        monthlyCharge: 0,
        dailyCharge: 0
      }
    };
  }
  
  // Calculate daily rate if not provided
  // Default: monthly rent / 25 (business days in a month)
  const defaultDailyRate = dailyRate || (monthlyRent / 25);
  
  let bookingMonths = duration.months;
  let bookingDays = duration.days;
  let monthlyCharge = 0;
  let dailyCharge = 0;
  
  // Special logic: If total days is 31+ but less than 60, charge for 2 months
  // This handles the business requirement mentioned
  if (duration.totalDays >= 31 && duration.totalDays < 60) {
    bookingMonths = 2;
    bookingDays = 0;
    monthlyCharge = 2 * monthlyRent;
    dailyCharge = 0;
  } else {
    // Standard calculation
    if (bookingMonths > 0) {
      monthlyCharge = bookingMonths * monthlyRent;
    }
    
    if (bookingDays > 0) {
      // For remaining days, use daily rate
      dailyCharge = bookingDays * defaultDailyRate;
    }
  }
  
  const subtotal = monthlyCharge + dailyCharge;
  const total = subtotal + serviceFee;
  
  return {
    duration,
    monthlyRent,
    dailyRate: defaultDailyRate,
    serviceFee,
    subtotal,
    total,
    breakdown: {
      months: bookingMonths,
      days: bookingDays,
      monthlyCharge,
      dailyCharge,
      totalDays: duration.totalDays,
      isSpecialRate: duration.totalDays >= 31 && duration.totalDays < 60
    }
  };
};

/**
 * Validate booking dates
 * @param {string|Date} checkInDate - Check-in date
 * @param {string|Date} checkOutDate - Check-out date
 * @returns {Object} Validation result
 */
export const validateBookingDates = (checkInDate, checkOutDate) => {
  const errors = [];
  const warnings = [];
  
  if (!checkInDate || !checkOutDate) {
    errors.push('Both check-in and check-out dates are required');
    return { isValid: false, errors, warnings };
  }
  
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check if dates are valid
  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
    errors.push('Invalid date format');
    return { isValid: false, errors, warnings };
  }
  
  // Check if check-in is in the past
  if (checkIn < today) {
    errors.push('Check-in date cannot be in the past');
  }
  
  // Check if check-out is after check-in
  if (checkOut <= checkIn) {
    errors.push('Check-out date must be after check-in date');
  }
  
  // Calculate duration for warnings
  const duration = calculateBookingDuration(checkInDate, checkOutDate);
  
  // Warning for very short stays
  if (duration.totalDays < 7) {
    warnings.push('Short stay: Daily rates may apply for stays under 7 days');
  }
  
  // Warning for the special 31-59 day rate
  if (duration.totalDays >= 31 && duration.totalDays < 60) {
    warnings.push(`Special rate: ${duration.totalDays} days will be charged as 2 full months`);
  }
  
  // Warning for very long stays
  if (duration.totalDays > 365) {
    warnings.push('Long stay: Please contact property owner for long-term rental rates');
  }
  
  // Warning for check-in very soon
  const daysTillCheckIn = Math.ceil((checkIn - today) / (1000 * 60 * 60 * 24));
  if (daysTillCheckIn < 2) {
    warnings.push('Last-minute booking: Please confirm availability with property owner');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    duration
  };
};

/**
 * Format pricing breakdown for display
 * @param {Object} pricingData - Result from calculateBookingPricing
 * @returns {Object} Formatted strings for display
 */
export const formatPricingBreakdown = (pricingData) => {
  const {
    duration,
    monthlyRent,
    dailyRate,
    serviceFee,
    subtotal,
    total,
    breakdown
  } = pricingData;
  
  const formatter = new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  const formatCurrency = (amount) => `LKR ${amount.toLocaleString()}`;
  
  return {
    // Duration display
    durationText: `${duration.totalDays} day${duration.totalDays > 1 ? 's' : ''}`,
    monthsText: breakdown.months > 0 ? `${breakdown.months} month${breakdown.months > 1 ? 's' : ''}` : '',
    daysText: breakdown.days > 0 ? `${breakdown.days} day${breakdown.days > 1 ? 's' : ''}` : '',
    
    // Pricing display
    monthlyRentText: formatCurrency(monthlyRent),
    dailyRateText: formatCurrency(dailyRate),
    serviceFeeText: formatCurrency(serviceFee),
    subtotalText: formatCurrency(subtotal),
    totalText: formatCurrency(total),
    
    // Breakdown display
    monthlyChargeText: breakdown.monthlyCharge > 0 ? formatCurrency(breakdown.monthlyCharge) : '',
    dailyChargeText: breakdown.dailyCharge > 0 ? formatCurrency(breakdown.dailyCharge) : '',
    
    // Special messaging
    specialRateMessage: breakdown.isSpecialRate 
      ? `${duration.totalDays} days charged as 2 months (special rate for 31-59 day stays)`
      : null,
    
    // Summary for receipts/confirmations
    summary: {
      period: breakdown.isSpecialRate 
        ? `${duration.totalDays} days (charged as 2 months)`
        : `${breakdown.months > 0 ? `${breakdown.months} month${breakdown.months > 1 ? 's' : ''}` : ''}${breakdown.months > 0 && breakdown.days > 0 ? ' + ' : ''}${breakdown.days > 0 ? `${breakdown.days} day${breakdown.days > 1 ? 's' : ''}` : ''}`,
      rent: formatCurrency(subtotal),
      serviceFee: formatCurrency(serviceFee),
      total: formatCurrency(total)
    }
  };
};

/**
 * Calculate refund amount based on cancellation policy
 * @param {Object} params - Calculation parameters
 * @param {number} params.totalPaid - Total amount paid
 * @param {string|Date} params.checkInDate - Check-in date
 * @param {string} params.cancellationPolicy - Cancellation policy type
 * @returns {Object} Refund calculation
 */
export const calculateRefund = ({
  totalPaid,
  checkInDate,
  cancellationPolicy = 'moderate'
}) => {
  const checkIn = new Date(checkInDate);
  const today = new Date();
  const daysUntilCheckIn = Math.ceil((checkIn - today) / (1000 * 60 * 60 * 24));
  
  let refundPercentage = 0;
  let refundReason = '';
  
  // Define cancellation policies
  const policies = {
    flexible: {
      24: 100, // 100% refund if cancelled 24+ hours before
      0: 0     // No refund if cancelled within 24 hours
    },
    moderate: {
      168: 100, // 100% refund if cancelled 7+ days before (168 hours)
      24: 50,   // 50% refund if cancelled 1-7 days before
      0: 0      // No refund if cancelled within 24 hours
    },
    strict: {
      336: 50,  // 50% refund if cancelled 14+ days before (336 hours)
      0: 0      // No refund if cancelled within 14 days
    }
  };
  
  const policy = policies[cancellationPolicy] || policies.moderate;
  const hoursUntilCheckIn = daysUntilCheckIn * 24;
  
  // Find applicable refund percentage
  const sortedThresholds = Object.keys(policy)
    .map(Number)
    .sort((a, b) => b - a); // Sort descending
  
  for (const threshold of sortedThresholds) {
    if (hoursUntilCheckIn >= threshold) {
      refundPercentage = policy[threshold];
      break;
    }
  }
  
  // Calculate refund amount
  const refundAmount = (totalPaid * refundPercentage) / 100;
  const serviceFeeRefund = refundPercentage === 100 ? 300 : 0; // Service fee only refunded for full refunds
  const totalRefund = refundAmount - (refundPercentage === 100 ? 0 : 300); // Subtract service fee unless full refund
  
  // Generate refund reason
  if (refundPercentage === 100) {
    refundReason = `Full refund - cancelled ${daysUntilCheckIn} days before check-in`;
  } else if (refundPercentage > 0) {
    refundReason = `${refundPercentage}% refund - cancelled ${daysUntilCheckIn} days before check-in`;
  } else {
    refundReason = `No refund - cancelled within ${cancellationPolicy} policy timeframe`;
  }
  
  return {
    refundPercentage,
    refundAmount: Math.max(0, totalRefund),
    serviceFeeRefund,
    totalRefund: Math.max(0, totalRefund),
    refundReason,
    daysUntilCheckIn,
    cancellationPolicy
  };
};

/**
 * Get available date ranges for a property based on existing bookings
 * @param {Array} existingBookings - Array of existing bookings
 * @param {string|Date} startDate - Start date for search
 * @param {string|Date} endDate - End date for search
 * @returns {Array} Array of available date ranges
 */
export const getAvailableDateRanges = (existingBookings, startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Filter confirmed bookings only
  const confirmedBookings = existingBookings
    .filter(booking => ['confirmed', 'payment_submitted'].includes(booking.status))
    .map(booking => ({
      start: new Date(booking.check_in_date),
      end: new Date(booking.check_out_date)
    }))
    .sort((a, b) => a.start - b.start);
  
  const availableRanges = [];
  let currentStart = start;
  
  for (const booking of confirmedBookings) {
    // If there's a gap before this booking, add it as available
    if (currentStart < booking.start) {
      availableRanges.push({
        start: new Date(currentStart),
        end: new Date(booking.start.getTime() - 24 * 60 * 60 * 1000), // Day before booking
        days: Math.ceil((booking.start - currentStart) / (1000 * 60 * 60 * 24))
      });
    }
    
    // Move current start to after this booking
    currentStart = new Date(booking.end.getTime() + 24 * 60 * 60 * 1000);
  }
  
  // Add remaining period if any
  if (currentStart <= end) {
    availableRanges.push({
      start: new Date(currentStart),
      end: new Date(end),
      days: Math.ceil((end - currentStart) / (1000 * 60 * 60 * 1000) + 1)
    });
  }
  
  return availableRanges.filter(range => range.days > 0);
};

/**
 * Check if a date range conflicts with existing bookings
 * @param {string|Date} checkInDate - Proposed check-in date
 * @param {string|Date} checkOutDate - Proposed check-out date
 * @param {Array} existingBookings - Array of existing bookings
 * @returns {Object} Conflict check result
 */
export const checkDateConflicts = (checkInDate, checkOutDate, existingBookings) => {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  
  const conflicts = existingBookings.filter(booking => {
    if (!['confirmed', 'payment_submitted'].includes(booking.status)) {
      return false; // Only check confirmed bookings
    }
    
    const bookingStart = new Date(booking.check_in_date);
    const bookingEnd = new Date(booking.check_out_date);
    
    // Check for overlap
    return (
      (checkIn <= bookingStart && checkOut > bookingStart) ||
      (checkIn < bookingEnd && checkOut >= bookingEnd) ||
      (checkIn >= bookingStart && checkOut <= bookingEnd)
    );
  });
  
  const pendingRequests = existingBookings.filter(booking => 
    ['pending', 'approved'].includes(booking.status) &&
    (
      (checkIn <= new Date(booking.check_in_date) && checkOut > new Date(booking.check_in_date)) ||
      (checkIn < new Date(booking.check_out_date) && checkOut >= new Date(booking.check_out_date)) ||
      (checkIn >= new Date(booking.check_in_date) && checkOut <= new Date(booking.check_out_date))
    )
  );
  
  return {
    hasConflicts: conflicts.length > 0,
    conflicts,
    hasPendingRequests: pendingRequests.length > 0,
    pendingRequests,
    conflictCount: conflicts.length,
    pendingCount: pendingRequests.length,
    canBook: conflicts.length === 0 // Can book if no confirmed conflicts
  };
};