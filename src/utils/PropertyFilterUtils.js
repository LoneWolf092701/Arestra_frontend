// Utility functions for property filtering and data processing

/**
 * Apply advanced filters to property list
 * @param {Array} properties - Array of property objects
 * @param {Object} filters - Filter criteria object
 * @returns {Array} Filtered properties
 */
export const applyPropertyFilters = (properties, filters) => {
  if (!filters || !properties?.length) return properties;

  return properties.filter(property => {
    // Price filter
    if (filters.priceRange && property.price) {
      const price = property.price;
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
        return false;
      }
    }

    // Star rating filter
    if (filters.starRating > 0) {
      const rating = property.rating || 0;
      if (rating < filters.starRating) {
        return false;
      }
    }

    // Date availability filter
    if (filters.availabilityDate && property.available_from) {
      const availableDate = new Date(property.available_from);
      const filterDate = new Date(filters.availabilityDate);
      if (availableDate > filterDate) {
        return false;
      }
    }

    // Location filter
    if (filters.location && property.address) {
      const locationMatch = property.address.toLowerCase().includes(filters.location.toLowerCase());
      if (!locationMatch) {
        return false;
      }
    }

    // Property type filter
    if (filters.propertyType && filters.propertyType !== 'All') {
      if (property.property_type !== filters.propertyType) {
        return false;
      }
    }

    // Bedroom count filter
    if (filters.bedrooms && property.facilities) {
      const facilities = safeParse(property.facilities);
      if ((facilities?.Bedroom || 0) < filters.bedrooms) {
        return false;
      }
    }

    // Bathroom count filter
    if (filters.bathrooms && property.facilities) {
      const facilities = safeParse(property.facilities);
      if ((facilities?.Bathroom || 0) < filters.bathrooms) {
        return false;
      }
    }

    // Amenities filter
    if (filters.requiredAmenities && filters.requiredAmenities.length > 0) {
      const propertyAmenities = safeParse(property.amenities) || [];
      const hasAllRequiredAmenities = filters.requiredAmenities.every(required => 
        propertyAmenities.some(amenity => amenity.toLowerCase().includes(required.toLowerCase()))
      );
      if (!hasAllRequiredAmenities) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Search properties by text query
 * @param {Array} properties - Array of property objects
 * @param {string} searchQuery - Search text
 * @returns {Array} Filtered properties
 */
export const searchProperties = (properties, searchQuery) => {
  if (!searchQuery || !properties?.length) return properties;

  const query = searchQuery.toLowerCase().trim();
  
  return properties.filter(property => {
    // Search in property type
    if (property.property_type?.toLowerCase().includes(query)) return true;
    
    // Search in unit type
    if (property.unit_type?.toLowerCase().includes(query)) return true;
    
    // Search in address
    if (property.address?.toLowerCase().includes(query)) return true;
    
    // Search in amenities
    const amenities = safeParse(property.amenities) || [];
    if (amenities.some(amenity => amenity.toLowerCase().includes(query))) return true;
    
    // Search in other facility descriptions
    if (property.other_facility?.toLowerCase().includes(query)) return true;
    
    return false;
  });
};

/**
 * Sort properties by different criteria
 * @param {Array} properties - Array of property objects
 * @param {string} sortBy - Sort criteria
 * @param {string} sortOrder - 'asc' or 'desc'
 * @returns {Array} Sorted properties
 */
export const sortProperties = (properties, sortBy, sortOrder = 'asc') => {
  if (!properties?.length) return properties;

  const sorted = [...properties].sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case 'price':
        aValue = a.price || 0;
        bValue = b.price || 0;
        break;
      
      case 'date':
        aValue = new Date(a.available_from || 0);
        bValue = new Date(b.available_from || 0);
        break;
      
      case 'rating':
        aValue = a.rating || 0;
        bValue = b.rating || 0;
        break;
      
      case 'bedrooms':
        const aFacilities = safeParse(a.facilities) || {};
        const bFacilities = safeParse(b.facilities) || {};
        aValue = aFacilities.Bedroom || 0;
        bValue = bFacilities.Bedroom || 0;
        break;
      
      case 'name':
        aValue = a.property_type || '';
        bValue = b.property_type || '';
        break;
      
      default:
        return 0;
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return sorted;
};

/**
 * Get property statistics
 * @param {Array} properties - Array of property objects
 * @returns {Object} Statistics object
 */
export const getPropertyStats = (properties) => {
  if (!properties?.length) {
    return {
      total: 0,
      averagePrice: 0,
      priceRange: { min: 0, max: 0 },
      propertyTypes: {},
      averageRating: 0
    };
  }

  const prices = properties.map(p => p.price).filter(price => price && price > 0);
  const ratings = properties.map(p => p.rating).filter(rating => rating && rating > 0);
  
  const propertyTypes = properties.reduce((acc, property) => {
    const type = property.property_type || 'Unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  return {
    total: properties.length,
    averagePrice: prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0,
    priceRange: {
      min: prices.length > 0 ? Math.min(...prices) : 0,
      max: prices.length > 0 ? Math.max(...prices) : 0
    },
    propertyTypes,
    averageRating: ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 0
  };
};

/**
 * Get recommended properties based on user preferences
 * @param {Array} properties - Array of property objects
 * @param {Object} userPreferences - User preference object
 * @param {number} limit - Maximum number of recommendations
 * @returns {Array} Recommended properties
 */
export const getRecommendedProperties = (properties, userPreferences = {}, limit = 6) => {
  if (!properties?.length) return [];

  // Score properties based on user preferences
  const scoredProperties = properties.map(property => {
    let score = 0;

    // Price preference scoring
    if (userPreferences.maxPrice && property.price) {
      if (property.price <= userPreferences.maxPrice) {
        score += 10;
      }
    }

    // Location preference scoring
    if (userPreferences.preferredLocation && property.address) {
      if (property.address.toLowerCase().includes(userPreferences.preferredLocation.toLowerCase())) {
        score += 15;
      }
    }

    // Property type preference scoring
    if (userPreferences.propertyType && property.property_type === userPreferences.propertyType) {
      score += 20;
    }

    // Rating bonus
    if (property.rating) {
      score += property.rating * 2;
    }

    // Amenities preference scoring
    if (userPreferences.preferredAmenities?.length > 0) {
      const propertyAmenities = safeParse(property.amenities) || [];
      const matchingAmenities = userPreferences.preferredAmenities.filter(pref =>
        propertyAmenities.some(amenity => amenity.toLowerCase().includes(pref.toLowerCase()))
      );
      score += matchingAmenities.length * 5;
    }

    // Recently added bonus
    if (property.created_at) {
      const daysSinceAdded = (Date.now() - new Date(property.created_at)) / (1000 * 60 * 60 * 24);
      if (daysSinceAdded <= 7) {
        score += 5; // Recent properties get a small boost
      }
    }

    return { ...property, recommendationScore: score };
  });

  // Sort by score and return top results
  return scoredProperties
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, limit);
};

/**
 * Safely parse JSON strings
 * @param {string} str - JSON string to parse
 * @returns {any} Parsed object or default value
 */
export const safeParse = (str, defaultValue = []) => {
  if (!str) return defaultValue;
  try {
    return JSON.parse(str);
  } catch (error) {
    console.warn('Failed to parse JSON:', str);
    return defaultValue;
  }
};

/**
 * Format property data for display
 * @param {Object} property - Property object
 * @returns {Object} Formatted property object
 */
export const formatPropertyForDisplay = (property) => {
  if (!property) return null;

  return {
    ...property,
    amenities: safeParse(property.amenities, []),
    facilities: safeParse(property.facilities, {}),
    roommates: safeParse(property.roommates, []),
    rules: safeParse(property.rules, []),
    billsInclusive: safeParse(property.bills_inclusive, []),
    priceRange: safeParse(property.price_range, []),
    formattedPrice: property.price ? `LKR ${property.price.toLocaleString()}` : 'Price not available',
    formattedAvailability: formatDateRange(property.available_from, property.available_to),
    bedroomCount: safeParse(property.facilities, {})?.Bedroom || 0,
    bathroomCount: safeParse(property.facilities, {})?.Bathroom || 0,
    roommateCount: safeParse(property.roommates, []).length,
    amenityCount: safeParse(property.amenities, []).length
  };
};

/**
 * Format date range for display
 * @param {string} startDate - Start date string
 * @param {string} endDate - End date string
 * @returns {string} Formatted date range
 */
export const formatDateRange = (startDate, endDate) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const start = formatDate(startDate);
  const end = formatDate(endDate);

  if (start && end) {
    return `${start} - ${end}`;
  } else if (start) {
    return `From ${start}`;
  } else if (end) {
    return `Until ${end}`;
  }
  
  return 'Dates not specified';
};

/**
 * Generate filter options from property data
 * @param {Array} properties - Array of property objects
 * @returns {Object} Filter options
 */
export const generateFilterOptions = (properties) => {
  if (!properties?.length) return {};

  const propertyTypes = [...new Set(properties.map(p => p.property_type).filter(Boolean))];
  const locations = [...new Set(properties.map(p => {
    if (!p.address) return null;
    // Extract city from address (assuming format includes city)
    const parts = p.address.split(',');
    return parts[parts.length - 2]?.trim(); // Second to last part is usually city
  }).filter(Boolean))];

  const prices = properties.map(p => p.price).filter(price => price && price > 0);
  const priceRange = prices.length > 0 ? {
    min: Math.min(...prices),
    max: Math.max(...prices)
  } : { min: 0, max: 100000 };

  const allAmenities = properties.reduce((acc, property) => {
    const amenities = safeParse(property.amenities, []);
    amenities.forEach(amenity => {
      if (!acc.includes(amenity)) {
        acc.push(amenity);
      }
    });
    return acc;
  }, []);

  const bedroomCounts = properties.map(p => {
    const facilities = safeParse(p.facilities, {});
    return facilities.Bedroom || 0;
  }).filter(count => count > 0);

  const maxBedrooms = bedroomCounts.length > 0 ? Math.max(...bedroomCounts) : 5;

  return {
    propertyTypes,
    locations,
    priceRange,
    amenities: allAmenities,
    maxBedrooms,
    bedroomOptions: Array.from({ length: maxBedrooms }, (_, i) => i + 1)
  };
};

// Export default object with all functions
const PropertyFilterUtils = {
  applyPropertyFilters,
  searchProperties,
  sortProperties,
  getPropertyStats,
  getRecommendedProperties,
  safeParse,
  formatPropertyForDisplay,
  formatDateRange,
  generateFilterOptions
};

export default PropertyFilterUtils;