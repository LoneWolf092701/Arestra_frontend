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
  
  // Calculate charges based on duration
  let monthlyCharge = 0;
  let dailyCharge = 0;
  
  if (duration.months > 0) {
    monthlyCharge = duration.months * monthlyRent;
  }
  
  if (duration.days > 0) {
    // For remaining days, use daily rate
    dailyCharge = duration.days * defaultDailyRate;
  }
  
  // Special logic: If total days is 31 or more but less than 60, charge for 2 months
  // This handles the case mentioned in requirements
  if (duration.totalDays >= 31 && duration.totalDays < 60) {
    monthlyCharge = 2 * monthlyRent;
    dailyCharge = 0; // No additional daily charge
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
      months: duration.months,
      days: duration.days,
      monthlyCharge,
      dailyCharge
    }
  };
};

/**
 * Get formatted pricing description for display
 * @param {Object} pricing - Pricing object from calculateBookingPricing
 * @returns {Object} Formatted strings for display
 */
export const formatPricingDisplay = (pricing) => {
  if (!pricing || pricing.total <= 0) {
    return {
      duration: 'No dates selected',
      breakdown: '',
      total: 'LKR 0'
    };
  }
  
  const { duration, breakdown, serviceFee, total } = pricing;
  
  // Format duration
  let durationText = '';
  if (duration.months > 0 && duration.days > 0) {
    durationText = `${duration.months} month(s) and ${duration.days} day(s)`;
  } else if (duration.months > 0) {
    durationText = `${duration.months} month(s)`;
  } else {
    durationText = `${duration.days} day(s)`;
  }
  
  // Format breakdown
  let breakdownText = '';
  const parts = [];
  
  if (breakdown.monthlyCharge > 0) {
    parts.push(`${breakdown.months} month(s): LKR ${breakdown.monthlyCharge.toLocaleString()}`);
  }
  
  if (breakdown.dailyCharge > 0) {
    parts.push(`${breakdown.days} day(s): LKR ${breakdown.dailyCharge.toLocaleString()}`);
  }
  
  if (parts.length > 0) {
    breakdownText = parts.join(' + ');
  }
  
  // Add service fee to breakdown
  if (serviceFee > 0) {
    breakdownText += (breakdownText ? ' + ' : '') + `Service Fee: LKR ${serviceFee.toLocaleString()}`;
  }
  
  return {
    duration: `Total Duration: ${durationText} (${duration.totalDays} days)`,
    breakdown: breakdownText,
    subtotal: `LKR ${pricing.subtotal.toLocaleString()}`,
    total: `LKR ${total.toLocaleString()}`
  };
};

/**
 * Validate booking dates
 * @param {string|Date} checkInDate - Check-in date
 * @param {string|Date} checkOutDate - Check-out date
 * @param {Object} property - Property object (optional, for availability validation)
 * @returns {Object} Validation result
 */
export const validateBookingDates = (checkInDate, checkOutDate, property = null) => {
  const validation = {
    isValid: true,
    errors: [],
    warnings: []
  };
  
  if (!checkInDate || !checkOutDate) {
    validation.isValid = false;
    validation.errors.push('Both check-in and check-out dates are required');
    return validation;
  }
  
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Basic date validation
  if (checkIn <= today) {
    validation.isValid = false;
    validation.errors.push('Check-in date must be in the future');
  }
  
  if (checkOut <= checkIn) {
    validation.isValid = false;
    validation.errors.push('Check-out date must be after check-in date');
  }
  
  const duration = calculateBookingDuration(checkInDate, checkOutDate);
  
  // Minimum booking duration (1 day)
  if (duration.totalDays < 1) {
    validation.isValid = false;
    validation.errors.push('Booking duration must be at least 1 day');
  }
  
  // Maximum booking duration warning (1 year)
  if (duration.totalDays > 365) {
    validation.warnings.push('Booking duration exceeds 1 year. Please confirm with property owner.');
  }
  
  // Property availability validation
  if (property) {
    if (property.available_from) {
      const availableFrom = new Date(property.available_from);
      availableFrom.setHours(0, 0, 0, 0);
      
      if (checkIn < availableFrom) {
        validation.isValid = false;
        validation.errors.push(`Property is not available until ${availableFrom.toLocaleDateString()}`);
      }
    }
    
    if (property.available_to) {
      const availableTo = new Date(property.available_to);
      availableTo.setHours(23, 59, 59, 999);
      
      if (checkOut > availableTo) {
        validation.isValid = false;
        validation.errors.push(`Property is not available after ${availableTo.toLocaleDateString()}`);
      }
    }
  }
  
  return validation;
};

/**
 * Get recommended booking durations based on property pricing
 * @param {number} monthlyRent - Monthly rent amount
 * @returns {Array} Array of recommended durations with pricing
 */
export const getRecommendedDurations = (monthlyRent) => {
  const recommendations = [
    { days: 30, label: '1 Month', description: 'Most popular choice' },
    { days: 60, label: '2 Months', description: 'Better value' },
    { days: 90, label: '3 Months', description: 'Quarterly stay' },
    { days: 180, label: '6 Months', description: 'Long-term stay' },
    { days: 365, label: '1 Year', description: 'Best value' }
  ];
  
  return recommendations.map(rec => {
    const duration = calculateBookingDuration(
      new Date(),
      new Date(Date.now() + rec.days * 24 * 60 * 60 * 1000)
    );
    
    const pricing = calculateBookingPricing({
      monthlyRent,
      checkInDate: new Date(),
      checkOutDate: new Date(Date.now() + rec.days * 24 * 60 * 60 * 1000)
    });
    
    return {
      ...rec,
      pricing: pricing.total,
      monthlyEquivalent: pricing.total / (rec.days / 30)
    };
  });
};