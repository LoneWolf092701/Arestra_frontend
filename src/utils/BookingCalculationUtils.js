export const calculateBookingDuration = (checkInDate, checkOutDate) => {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  
  checkIn.setHours(0, 0, 0, 0);
  checkOut.setHours(0, 0, 0, 0);
  
  const totalDays = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  
  if (totalDays <= 0) {
    return { totalDays: 0, months: 0, weeks: 0, days: 0 };
  }
  
  return {
    totalDays,
    months: Math.floor(totalDays / 30),
    weeks: Math.floor((totalDays % 30) / 7),
    days: totalDays % 7
  };
};

export const calculateBookingPricing = ({
  monthlyRent,
  checkInDate,
  checkOutDate,
  serviceFee = 300,
  advancePercentage = 30
}) => {
  const duration = calculateBookingDuration(checkInDate, checkOutDate);
  
  if (duration.totalDays <= 0) {
    return {
      duration,
      monthlyRent: 0,
      serviceFee,
      subtotal: 0,
      total: serviceFee,
      advanceAmount: 0,
      remainingAmount: serviceFee,
      breakdown: {
        fullMonths: 0,
        partialMonthCharge: 0,
        totalCharge: 0,
        description: 'Invalid date range'
      }
    };
  }
  
  
  const totalDays = duration.totalDays;
  let totalCharge = 0;
  let description = '';
  let fullMonths = 0;
  let partialMonthCharge = 0;
  
  if (totalDays <= 7) {
    partialMonthCharge = monthlyRent * 0.25;
    totalCharge = partialMonthCharge;
    description = `${totalDays} days (Quarter rate)`;
  } else if (totalDays <= 15) {
    partialMonthCharge = monthlyRent * 0.5;
    totalCharge = partialMonthCharge;
    description = `${totalDays} days (Half rate)`;
  } else if (totalDays <= 30) {
    partialMonthCharge = monthlyRent;
    totalCharge = partialMonthCharge;
    description = `${totalDays} days (Full month rate)`;
  } else {
    fullMonths = Math.floor(totalDays / 30);
    const remainingDays = totalDays % 30;
    
    totalCharge = fullMonths * monthlyRent;
    
    if (remainingDays > 0) {
      const remainingWeeks = Math.floor(remainingDays / 7);
      const extraDays = remainingDays % 7;
      
      const weeklyRate = monthlyRent / 4;
      const weeklyCharge = remainingWeeks * weeklyRate;
      
      let extraDaysCharge = 0;
      if (extraDays > 0) {
        const dailyRate = weeklyRate / 7;
        extraDaysCharge = extraDays * dailyRate;
      }
      
      partialMonthCharge = weeklyCharge + extraDaysCharge;
      totalCharge += partialMonthCharge;
      
      description = `${fullMonths} month${fullMonths > 1 ? 's' : ''}`;
      if (remainingWeeks > 0) {
        description += ` + ${remainingWeeks} week${remainingWeeks > 1 ? 's' : ''}`;
      }
      if (extraDays > 0) {
        description += ` + ${extraDays} day${extraDays > 1 ? 's' : ''}`;
      }
    } else {
      description = `${fullMonths} month${fullMonths > 1 ? 's' : ''} (exact)`;
    }
  }
  
  const subtotal = totalCharge;
  const total = subtotal + serviceFee;
  const advanceAmount = (subtotal * advancePercentage) / 100;
  const remainingAmount = total - advanceAmount;
  
  return {
    duration,
    monthlyRent,
    serviceFee,
    subtotal,
    total,
    advanceAmount,
    remainingAmount,
    advancePercentage,
    breakdown: {
      fullMonths,
      partialMonthCharge,
      totalCharge,
      description,
      rateType: totalDays <= 7 ? 'quarter' : 
                totalDays <= 15 ? 'half' : 
                totalDays <= 30 ? 'full' : 'mixed'
    }
  };
};

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
  
  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
    errors.push('Invalid date format');
    return { isValid: false, errors, warnings };
  }
  
  if (checkIn < today) {
    errors.push('Check-in date cannot be in the past');
  }
  
  if (checkOut <= checkIn) {
    errors.push('Check-out date must be after check-in date');
  }
  
  const duration = calculateBookingDuration(checkInDate, checkOutDate);
  
  if (duration.totalDays < 1) {
    errors.push('Minimum stay is 1 day');
  }
  
  if (duration.totalDays > 365) {
    warnings.push('Long-term stays over 1 year may require special arrangements');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const formatCurrency = (amount, currency = 'LKR') => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
};

export const getPricingTiers = (monthlyRent) => {
  return {
    quarter: {
      rate: monthlyRent * 0.25,
      description: '1-7 days (Quarter rate)',
      percentage: '25%'
    },
    half: {
      rate: monthlyRent * 0.5,
      description: '8-15 days (Half rate)',
      percentage: '50%'
    },
    full: {
      rate: monthlyRent,
      description: '16-30 days (Full month rate)',
      percentage: '100%'
    },
    weekly: {
      rate: monthlyRent / 4,
      description: 'Weekly rate (for stays over 30 days)',
      percentage: '25% (per week)'
    }
  };
};

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
  
  const policies = {
    flexible: {
      24: 100,
      0: 0
    },
    moderate: {
      168: 100,
      24: 50,
      0: 0
    },
    strict: {
      336: 50,
      0: 0
    }
  };
  
  const policy = policies[cancellationPolicy] || policies.moderate;
  const hoursUntilCheckIn = daysUntilCheckIn * 24;
  
  const sortedThresholds = Object.keys(policy)
    .map(Number)
    .sort((a, b) => b - a);
  
  for (const threshold of sortedThresholds) {
    if (hoursUntilCheckIn >= threshold) {
      refundPercentage = policy[threshold];
      break;
    }
  }
  
  const refundAmount = (totalPaid * refundPercentage) / 100;
  const serviceFeeRefund = refundPercentage === 100 ? 300 : 0;
  const totalRefund = refundAmount - (refundPercentage === 100 ? 0 : 300);
  
  switch (refundPercentage) {
    case 100:
      refundReason = 'Full refund - cancelled with sufficient notice';
      break;
    case 50:
      refundReason = 'Partial refund - cancelled within moderate notice period';
      break;
    case 0:
      refundReason = 'No refund - cancelled too close to check-in date';
      break;
    default:
      refundReason = `${refundPercentage}% refund based on cancellation policy`;
  }
  
  return {
    refundPercentage,
    refundAmount: Math.max(0, totalRefund),
    serviceFeeRefund,
    refundReason,
    daysUntilCheckIn,
    cancellationPolicy
  };
};

export const generateBookingSummary = (pricingData) => {
  const { duration, breakdown, subtotal, serviceFee, total } = pricingData;
  
  return {
    stayDuration: `${duration.totalDays} day${duration.totalDays !== 1 ? 's' : ''}`,
    billingDescription: breakdown.description,
    rentAmount: formatCurrency(breakdown.totalCharge),
    serviceFee: formatCurrency(serviceFee),
    totalAmount: formatCurrency(total),
    rateType: breakdown.rateType,
    isDiscounted: breakdown.rateType === 'quarter' || breakdown.rateType === 'half'
  };
};

export default {
  calculateBookingDuration,
  calculateBookingPricing,
  validateBookingDates,
  formatCurrency,
  getPricingTiers,
  calculateRefund,
  generateBookingSummary
};