// PropertyValidationUtils.js - Comprehensive property validation utilities

/**
 * Validate property availability status
 * @param {Object} property - Property object
 * @returns {Object} Validation result with isAvailable and reasons
 */
export const validatePropertyAvailability = (property) => {
  const validation = {
    isAvailable: true,
    reasons: [],
    warnings: []
  };

  if (!property) {
    validation.isAvailable = false;
    validation.reasons.push('Property data is missing');
    return validation;
  }

  // Check if property is active
  if (property.is_active === false || property.is_active === 0) {
    validation.isAvailable = false;
    validation.reasons.push('Property is currently inactive');
  }

  // Check approval status
  if (property.approval_status !== 'approved') {
    validation.isAvailable = false;
    validation.reasons.push(`Property is ${property.approval_status || 'pending approval'}`);
  }

  // Check availability flag
  if (property.is_available === false || property.is_available === 0) {
    validation.isAvailable = false;
    validation.reasons.push('Property is marked as unavailable');
  }

  // Check availability dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (property.available_from) {
    const availableFrom = new Date(property.available_from);
    availableFrom.setHours(0, 0, 0, 0);
    
    if (availableFrom > today) {
      const daysUntilAvailable = Math.ceil((availableFrom - today) / (1000 * 60 * 60 * 24));
      validation.warnings.push(`Property will be available in ${daysUntilAvailable} days`);
    }
  }

  if (property.available_to) {
    const availableTo = new Date(property.available_to);
    availableTo.setHours(23, 59, 59, 999);
    
    if (availableTo < today) {
      validation.isAvailable = false;
      validation.reasons.push('Property availability period has expired');
    }
  }

  // Check if property has required fields
  const requiredFields = ['property_type', 'address', 'price'];
  const missingFields = requiredFields.filter(field => !property[field]);
  
  if (missingFields.length > 0) {
    validation.isAvailable = false;
    validation.reasons.push(`Missing required information: ${missingFields.join(', ')}`);
  }

  return validation;
};

/**
 * Validate property price against market standards
 * @param {number} price - Property price
 * @param {string} propertyType - Type of property
 * @param {string} location - Property location
 * @returns {Object} Price validation result
 */
export const validatePropertyPrice = (price, propertyType, location = '') => {
  const validation = {
    isValid: true,
    warnings: [],
    suggestions: []
  };

  if (!price || isNaN(price) || price <= 0) {
    validation.isValid = false;
    validation.warnings.push('Price must be a positive number');
    return validation;
  }

  // Define minimum and maximum reasonable prices by property type (in LKR)
  const priceRanges = {
    'Room': { min: 3000, max: 50000, typical: [8000, 25000] },
    'Hostels': { min: 2000, max: 30000, typical: [5000, 15000] },
    'Flat': { min: 10000, max: 100000, typical: [20000, 60000] },
    'Apartment': { min: 15000, max: 150000, typical: [25000, 80000] },
    'House': { min: 25000, max: 300000, typical: [40000, 120000] },
    'Villa': { min: 50000, max: 500000, typical: [80000, 200000] }
  };

  const range = priceRanges[propertyType];
  
  if (range) {
    // Check if price is below minimum
    if (price < range.min) {
      validation.warnings.push(
        `Price (LKR ${price.toLocaleString()}) seems very low for a ${propertyType}. ` +
        `Minimum expected: LKR ${range.min.toLocaleString()}`
      );
    }
    
    // Check if price is above maximum
    if (price > range.max) {
      validation.warnings.push(
        `Price (LKR ${price.toLocaleString()}) seems very high for a ${propertyType}. ` +
        `Maximum typical: LKR ${range.max.toLocaleString()}`
      );
    }
    
    // Provide typical range suggestion
    if (price < range.typical[0] || price > range.typical[1]) {
      validation.suggestions.push(
        `Typical ${propertyType} prices range from LKR ${range.typical[0].toLocaleString()} ` +
        `to LKR ${range.typical[1].toLocaleString()}`
      );
    }
  }

  // Location-based price adjustments (basic implementation)
  const premiumAreas = ['colombo', 'dehiwala', 'mount lavinia', 'nugegoda', 'maharagama'];
  const isLocationPremium = premiumAreas.some(area => 
    location.toLowerCase().includes(area.toLowerCase())
  );

  if (isLocationPremium && range && price < range.typical[0] * 1.2) {
    validation.suggestions.push(
      `This appears to be in a premium area. Consider pricing 20-50% higher than typical range.`
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

  // Required fields (80% of score)
  const requiredFields = [
    { field: 'property_type', weight: 10, label: 'Property Type' },
    { field: 'unit_type', weight: 8, label: 'Unit Type' },
    { field: 'address', weight: 15, label: 'Address' },
    { field: 'price', weight: 15, label: 'Price' },
    { field: 'available_from', weight: 8, label: 'Available From Date' },
    { field: 'available_to', weight: 8, label: 'Available To Date' },
    { field: 'amenities', weight: 10, label: 'Amenities' },
    { field: 'facilities', weight: 6, label: 'Facilities' }
  ];

  // Optional fields (20% of score)
  const optionalFields = [
    { field: 'other_facility', weight: 3, label: 'Additional Facilities' },
    { field: 'rules', weight: 5, label: 'House Rules' },
    { field: 'contract_policy', weight: 4, label: 'Contract Policy' },
    { field: 'bills_inclusive', weight: 3, label: 'Bills Included' },
    { field: 'roommates', weight: 2, label: 'Roommate Information' },
    { field: 'images', weight: 3, label: 'Property Photos' }
  ];

  // Check required fields
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

  // Check optional fields
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

  // Generate recommendations based on completeness
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

  // Check if property is available for booking
  const availabilityCheck = validatePropertyAvailability(property);
  if (!availabilityCheck.isAvailable) {
    validation.canBook = false;
    validation.restrictions.push(...availabilityCheck.reasons);
  }

  // Check if user can book (not property owner)
  if (property.user_id === user.id) {
    validation.canBook = false;
    validation.restrictions.push('Property owners cannot book their own properties');
  }

  // Check user role
  if (user.role === 'propertyowner') {
    validation.requirements.push('Property owners should create tenant accounts for booking');
  }

  // Check if user profile is complete enough for booking
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
    'Room': {
      singular: 'Room',
      plural: 'Rooms', 
      description: 'Single private room in shared accommodation',
      icon: '🛏️',
      averageSize: '10-15 sqm',
      targetTenants: ['Students', 'Young professionals', 'Budget travelers']
    },
    'Hostels': {
      singular: 'Hostel',
      plural: 'Hostels',
      description: 'Budget-friendly shared accommodation',
      icon: '🏨',
      averageSize: '6-12 sqm per bed',
      targetTenants: ['Students', 'Backpackers', 'Budget travelers', 'Short-term visitors']
    },
    'Flat': {
      singular: 'Flat',
      plural: 'Flats',
      description: 'Self-contained residential unit in a building',
      icon: '🏠',
      averageSize: '40-80 sqm',
      targetTenants: ['Small families', 'Couples', 'Young professionals']
    },
    'Apartment': {
      singular: 'Apartment',
      plural: 'Apartments',
      description: 'Modern residential unit with amenities',
      icon: '🏢',
      averageSize: '50-120 sqm',
      targetTenants: ['Professionals', 'Small families', 'Expatriates']
    },
    'House': {
      singular: 'House',
      plural: 'Houses',
      description: 'Standalone residential building',
      icon: '🏡',
      averageSize: '100-200 sqm',
      targetTenants: ['Families', 'Groups', 'Long-term residents']
    },
    'Villa': {
      singular: 'Villa',
      plural: 'Villas',
      description: 'Luxury house with premium features',
      icon: '🏰',
      averageSize: '200-500 sqm',
      targetTenants: ['High-income families', 'Expatriates', 'Luxury seekers']
    }
  };

  return typeInfo[propertyType] || {
    singular: propertyType,
    plural: propertyType + 's',
    description: 'Property accommodation',
    icon: '🏠',
    averageSize: 'Varies',
    targetTenants: ['Various']
  };
};

/**
 * Generate property listing optimization suggestions
 * @param {Object} property - Property object
 * @returns {Array} Array of optimization suggestions
 */
export const generateOptimizationSuggestions = (property) => {
  const suggestions = [];
  
  if (!property) return suggestions;

  const completeness = validatePropertyCompleteness(property);
  const priceValidation = validatePropertyPrice(
    property.price, 
    property.property_type, 
    property.address
  );

  // Completeness suggestions
  if (completeness.score < 70) {
    suggestions.push({
      type: 'completeness',
      priority: 'high',
      title: 'Complete Missing Information',
      description: `Your listing is ${completeness.score}% complete. Add missing details to improve visibility.`,
      action: 'Complete required fields',
      impact: 'Increases visibility by up to 40%'
    });
  }

  // Photo suggestions
  if (!property.images || property.images.length === 0) {
    suggestions.push({
      type: 'photos',
      priority: 'high',
      title: 'Add Property Photos',
      description: 'Properties with photos receive 10x more inquiries than those without.',
      action: 'Upload high-quality photos',
      impact: 'Increases inquiries by up to 1000%'
    });
  }

  // Price suggestions
  if (priceValidation.warnings.length > 0) {
    suggestions.push({
      type: 'pricing',
      priority: 'medium',
      title: 'Review Pricing',
      description: priceValidation.warnings[0],
      action: 'Adjust price to market standards',
      impact: 'Improves booking likelihood'
    });
  }

  // Amenities suggestions
  if (!property.amenities || Object.keys(JSON.parse(property.amenities || '{}')).length < 3) {
    suggestions.push({
      type: 'amenities',
      priority: 'medium',
      title: 'Highlight More Amenities',
      description: 'List all available amenities to attract more tenants.',
      action: 'Add WiFi, parking, kitchen access, etc.',
      impact: 'Increases search visibility'
    });
  }

  // Description suggestions
  if (!property.description || property.description.length < 50) {
    suggestions.push({
      type: 'description',
      priority: 'low',
      title: 'Improve Property Description',
      description: 'A detailed description helps tenants understand your property better.',
      action: 'Write a compelling 100+ word description',
      impact: 'Improves tenant confidence'
    });
  }

  return suggestions.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
};

export default {
  validatePropertyAvailability,
  validatePropertyPrice,
  validatePropertyCompleteness,
  validateBookingEligibility,
  getPropertyTypeInfo,
  generateOptimizationSuggestions
};