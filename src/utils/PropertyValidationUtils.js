/**
 * Property Validation Utilities
 * Provides comprehensive validation functions for property data
 */

/**
 * Validate property availability based on dates and status
 * @param {Object} property - Property object
 * @returns {Object} Availability validation result
 */
export const validatePropertyAvailability = (property) => {
  const validation = {
    isAvailable: true,
    reasons: []
  };

  if (!property) {
    validation.isAvailable = false;
    validation.reasons.push('Property data not found');
    return validation;
  }

  if (!property.is_active) {
    validation.isAvailable = false;
    validation.reasons.push('Property is currently inactive');
  }

  if (property.approval_status !== 'approved') {
    validation.isAvailable = false;
    validation.reasons.push(`Property is ${property.approval_status}, not approved for booking`);
  }

  const currentDate = new Date();
  const availableFrom = property.available_from ? new Date(property.available_from) : null;
  const availableTo = property.available_to ? new Date(property.available_to) : null;

  if (availableFrom && currentDate < availableFrom) {
    validation.isAvailable = false;
    validation.reasons.push(`Property will be available from ${availableFrom.toLocaleDateString()}`);
  }

  if (availableTo && currentDate > availableTo) {
    validation.isAvailable = false;
    validation.reasons.push(`Property availability ended on ${availableTo.toLocaleDateString()}`);
  }

  return validation;
};

/**
 * Validate property pricing reasonableness
 * @param {Object} property - Property object
 * @returns {Object} Pricing validation result
 */
export const validatePropertyPricing = (property) => {
  const validation = {
    isReasonable: true,
    warnings: [],
    suggestions: []
  };

  if (!property || !property.price) {
    validation.isReasonable = false;
    validation.warnings.push('Property price is not set');
    return validation;
  }

  const price = parseFloat(property.price);
  const propertyType = property.property_type;
  const unitType = property.unit_type;

  const pricingRanges = {
    'Rooms': {
      'Single Room': { min: 8000, max: 25000 },
      'Shared Room': { min: 5000, max: 15000 },
      'Annex': { min: 12000, max: 35000 }
    },
    'Flats': {
      'Studio Apartment': { min: 20000, max: 50000 },
      'One Bedroom': { min: 25000, max: 60000 },
      'Two Bedroom': { min: 35000, max: 80000 },
      'Three Bedroom': { min: 50000, max: 120000 }
    },
    'Hostels': {
      'Single Room': { min: 6000, max: 20000 },
      'Shared Room': { min: 3000, max: 12000 },
      'Dormitory': { min: 2000, max: 8000 }
    },
    'Villas': {
      'Full House': { min: 80000, max: 300000 },
      'Villa': { min: 100000, max: 500000 }
    }
  };

  const range = pricingRanges[propertyType]?.[unitType];
  
  if (range) {
    if (price < range.min) {
      validation.warnings.push(
        `Price seems low for ${propertyType} - ${unitType}. Typical range: LKR ${range.min.toLocaleString()} - ${range.max.toLocaleString()}`
      );
      validation.suggestions.push('Consider reviewing your pricing to ensure it reflects the property value');
    } else if (price > range.max) {
      validation.warnings.push(
        `Price seems high for ${propertyType} - ${unitType}. Typical range: LKR ${range.min.toLocaleString()} - ${range.max.toLocaleString()}`
      );
      validation.suggestions.push('High pricing may reduce interest. Consider pricing competitively or highlighting premium features');
    }
  }

  if (price > range?.max * 1.5) {
    validation.suggestions.push(
      'Consider pricing 20-50% higher than typical range.'
    );
  }

  return validation;
};

/**
 * Validate property data completeness
 * @param {Object} property - Property object
 * @returns {Object} Completeness validation result
 */
export const validatePropertyCompleteness = (property) => {
  const validation = {
    score: 0,
    maxScore: 100,
    missingRequired: [],
    missingOptional: [],
    recommendations: []
  };

  if (!property) {
    validation.missingRequired.push('Property data');
    return validation;
  }

  const requiredFields = [
    { field: 'property_type', weight: 10, label: 'Property Type' },
    { field: 'unit_type', weight: 8, label: 'Unit Type' },
    { field: 'address', weight: 15, label: 'Address' },
    { field: 'description', weight: 10, label: 'Description' },
    { field: 'price', weight: 15, label: 'Price' },
    { field: 'available_from', weight: 8, label: 'Available From Date' },
    { field: 'available_to', weight: 8, label: 'Available To Date' },
    { field: 'amenities', weight: 10, label: 'Amenities' },
    { field: 'facilities', weight: 6, label: 'Facilities' }
  ];

  const optionalFields = [
    { field: 'other_facility', weight: 3, label: 'Additional Facilities' },
    { field: 'rules', weight: 5, label: 'House Rules' },
    { field: 'contract_policy', weight: 4, label: 'Contract Policy' },
    { field: 'bills_inclusive', weight: 3, label: 'Bills Included' },
    { field: 'roommates', weight: 2, label: 'Roommate Information' },
    { field: 'images', weight: 3, label: 'Property Photos' }
  ];

  requiredFields.forEach(({ field, weight, label }) => {
    const value = property[field];
    let hasValue = false;

    if (typeof value === 'string') {
      hasValue = value.trim().length > 0;
    } else if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        hasValue = value.length > 0;
      } else {
        hasValue = Object.keys(value).length > 0;
      }
    } else if (typeof value === 'number') {
      hasValue = value > 0;
    } else {
      hasValue = Boolean(value);
    }

    if (hasValue) {
      validation.score += weight;
    } else {
      validation.missingRequired.push(label);
    }
  });

  optionalFields.forEach(({ field, weight, label }) => {
    const value = property[field];
    let hasValue = false;

    if (typeof value === 'string') {
      hasValue = value.trim().length > 0;
    } else if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        hasValue = value.length > 0;
      } else {
        hasValue = Object.keys(value).length > 0;
      }
    } else {
      hasValue = Boolean(value);
    }

    if (hasValue) {
      validation.score += weight;
    } else {
      validation.missingOptional.push(label);
    }
  });

  if (validation.score < 60) {
    validation.recommendations.push('Complete required information to improve property visibility');
  }
  
  if (validation.score < 80) {
    validation.recommendations.push('Add more details to attract more potential tenants');
  }
  
  if (validation.missingOptional.includes('Property Photos')) {
    validation.recommendations.push('Add high-quality photos to significantly increase inquiries');
  }
  
  if (validation.missingOptional.includes('House Rules')) {
    validation.recommendations.push('Set clear house rules to prevent misunderstandings');
  }

  if (validation.missingOptional.includes('Contract Policy')) {
    validation.recommendations.push('Add contract policy to build trust with potential tenants');
  }

  if (property.property_type === 'Rooms' && validation.missingOptional.includes('Roommate Information')) {
    validation.recommendations.push('Add roommate information to help tenants understand the living situation');
  }

  return validation;
};

/**
 * Validate property booking eligibility
 * @param {Object} property - Property object
 * @param {Object} user - User object attempting to book
 * @returns {Object} Booking eligibility result
 */
export const validateBookingEligibility = (property, user) => {
  const validation = {
    canBook: true,
    restrictions: [],
    requirements: []
  };

  if (!property || !user) {
    validation.canBook = false;
    validation.restrictions.push('Missing property or user information');
    return validation;
  }

  const availabilityCheck = validatePropertyAvailability(property);
  if (!availabilityCheck.isAvailable) {
    validation.canBook = false;
    validation.restrictions.push(...availabilityCheck.reasons);
  }

  if (property.user_id === user.id) {
    validation.canBook = false;
    validation.restrictions.push('Property owners cannot book their own properties');
  }

  if (user.role === 'propertyowner') {
    validation.requirements.push('Property owners should create tenant accounts for booking');
  }

  const requiredUserFields = ['email', 'phone'];
  const missingUserFields = requiredUserFields.filter(field => !user[field]);
  
  if (missingUserFields.length > 0) {
    validation.canBook = false;
    validation.restrictions.push(
      `Complete your profile: missing ${missingUserFields.join(', ')}`
    );
  }

  return validation;
};

/**
 * Get property type display information
 * @param {string} propertyType - Property type
 * @returns {Object} Display information for property type
 */
export const getPropertyTypeInfo = (propertyType) => {
  const typeInfo = {
    'Rooms': {
      singular: 'Room',
      plural: 'Rooms', 
      description: 'Single private room in shared accommodation',
      icon: '🛏️',
      averageSize: '10-15 sqm',
      targetTenants: 'Students, young professionals',
      commonFeatures: ['Shared kitchen', 'Shared bathroom', 'Individual room'],
      pricingFactors: ['Room size', 'Sharing arrangements', 'Facilities provided']
    },
    'Flats': {
      singular: 'Flat',
      plural: 'Flats',
      description: 'Complete apartment units with private facilities',
      icon: '🏠',
      averageSize: '30-80 sqm',
      targetTenants: 'Families, couples, professionals',
      commonFeatures: ['Private kitchen', 'Private bathroom', 'Living area'],
      pricingFactors: ['Number of bedrooms', 'Floor level', 'Amenities included']
    },
    'Hostels': {
      singular: 'Hostel',
      plural: 'Hostels',
      description: 'Budget-friendly shared accommodation',
      icon: '🏨',
      averageSize: '8-12 sqm per bed',
      targetTenants: 'Students, budget travelers, short-term stays',
      commonFeatures: ['Shared facilities', 'Common areas', 'Basic furnishing'],
      pricingFactors: ['Bed type', 'Sharing ratio', 'Location convenience']
    },
    'Villas': {
      singular: 'Villa',
      plural: 'Villas',
      description: 'Premium standalone houses with private grounds',
      icon: '🏡',
      averageSize: '150-500 sqm',
      targetTenants: 'Families, executives, long-term residents',
      commonFeatures: ['Private garden', 'Multiple bedrooms', 'Premium finishes'],
      pricingFactors: ['Plot size', 'Luxury features', 'Location exclusivity']
    }
  };

  return typeInfo[propertyType] || {
    singular: propertyType,
    plural: propertyType,
    description: 'Property type',
    icon: '🏢',
    averageSize: 'Varies',
    targetTenants: 'General',
    commonFeatures: [],
    pricingFactors: []
  };
};

/**
 * Validate property rules for appropriateness
 * @param {Array} rules - Array of property rules
 * @returns {Object} Rules validation result
 */
export const validatePropertyRules = (rules) => {
  const validation = {
    isValid: true,
    warnings: [],
    suggestions: []
  };

  if (!Array.isArray(rules) || rules.length === 0) {
    validation.suggestions.push('Consider adding house rules to set clear expectations');
    return validation;
  }

  const inappropriateKeywords = [
    'discriminat', 'race', 'religion', 'gender', 'sexual orientation',
    'disability', 'nationality', 'ethnicity'
  ];

  const recommendedRules = [
    'smoking policy', 'visitor policy', 'noise restrictions',
    'cleaning responsibilities', 'pet policy'
  ];

  rules.forEach((rule, index) => {
    if (!rule || rule.trim().length === 0) {
      validation.warnings.push(`Rule ${index + 1} is empty`);
      return;
    }

    const ruleLower = rule.toLowerCase();
    
    inappropriateKeywords.forEach(keyword => {
      if (ruleLower.includes(keyword)) {
        validation.isValid = false;
        validation.warnings.push(
          `Rule ${index + 1} may contain discriminatory language: "${rule}"`
        );
      }
    });

    if (rule.length > 200) {
      validation.warnings.push(
        `Rule ${index + 1} is very long. Consider making it more concise.`
      );
    }
  });

  const hasCommonRules = recommendedRules.some(commonRule =>
    rules.some(rule => rule.toLowerCase().includes(commonRule.split(' ')[0]))
  );

  if (!hasCommonRules) {
    validation.suggestions.push(
      'Consider adding common rules like smoking policy, visitor policy, or noise restrictions'
    );
  }

  return validation;
};

/**
 * Validate contract policy completeness
 * @param {string} contractPolicy - Contract policy text
 * @returns {Object} Contract policy validation result
 */
export const validateContractPolicy = (contractPolicy) => {
  const validation = {
    isComplete: true,
    missingElements: [],
    suggestions: []
  };

  if (!contractPolicy || contractPolicy.trim().length === 0) {
    validation.isComplete = false;
    validation.missingElements.push('Contract policy is required');
    return validation;
  }

  const essentialElements = [
    { keyword: ['lease', 'duration', 'term'], label: 'Lease duration' },
    { keyword: ['deposit', 'security'], label: 'Security deposit information' },
    { keyword: ['notice', 'cancellation', 'termination'], label: 'Notice period for cancellation' },
    { keyword: ['payment', 'rent', 'due'], label: 'Payment terms' },
    { keyword: ['maintenance', 'repair'], label: 'Maintenance responsibilities' }
  ];

  const policyLower = contractPolicy.toLowerCase();

  essentialElements.forEach(({ keyword, label }) => {
    const hasElement = keyword.some(k => policyLower.includes(k));
    if (!hasElement) {
      validation.missingElements.push(label);
    }
  });

  if (validation.missingElements.length > 0) {
    validation.isComplete = false;
    validation.suggestions.push(
      'Consider including: ' + validation.missingElements.join(', ')
    );
  }

  if (contractPolicy.length < 100) {
    validation.suggestions.push(
      'Contract policy seems brief. Consider providing more detailed terms.'
    );
  }

  return validation;
};

/**
 * Validate roommate information completeness
 * @param {Array} roommates - Array of roommate objects
 * @param {string} propertyType - Type of property
 * @returns {Object} Roommate validation result
 */
export const validateRoommateInfo = (roommates, propertyType) => {
  const validation = {
    isAppropriate: true,
    warnings: [],
    suggestions: []
  };

  if (propertyType !== 'Rooms') {
    if (roommates && roommates.length > 0) {
      validation.warnings.push(
        'Roommate information is typically only relevant for room rentals'
      );
    }
    return validation;
  }

  if (!Array.isArray(roommates) || roommates.length === 0) {
    validation.suggestions.push(
      'Consider adding roommate information to help potential tenants understand the living situation'
    );
    return validation;
  }

  roommates.forEach((roommate, index) => {
    if (!roommate.occupation || roommate.occupation.trim().length === 0) {
      validation.warnings.push(
        `Roommate ${index + 1} is missing occupation information`
      );
    }

    if (!roommate.field || roommate.field.trim().length === 0) {
      validation.warnings.push(
        `Roommate ${index + 1} is missing field/industry information`
      );
    }
  });

  if (roommates.length > 6) {
    validation.warnings.push(
      'Large number of roommates may indicate overcrowding'
    );
  }

  return validation;
};

/**
 * Comprehensive property validation
 * @param {Object} property - Complete property object
 * @returns {Object} Comprehensive validation result
 */
export const validatePropertyData = (property) => {
  const completeness = validatePropertyCompleteness(property);
  const availability = validatePropertyAvailability(property);
  const pricing = validatePropertyPricing(property);
  const rules = validatePropertyRules(property.rules);
  const contractPolicy = validateContractPolicy(property.contract_policy);
  const roommateInfo = validateRoommateInfo(property.roommates, property.property_type);

  return {
    overall: {
      isValid: availability.isAvailable && rules.isValid && contractPolicy.isComplete,
      score: completeness.score,
      maxScore: completeness.maxScore
    },
    completeness,
    availability,
    pricing,
    rules,
    contractPolicy,
    roommateInfo,
    recommendations: [
      ...completeness.recommendations,
      ...pricing.suggestions,
      ...rules.suggestions,
      ...contractPolicy.suggestions,
      ...roommateInfo.suggestions
    ].slice(0, 5)
  };
};