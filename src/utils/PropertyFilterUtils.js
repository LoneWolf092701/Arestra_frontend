
/**
 * Safely parse JSON strings with fallback
 * @param {string|null|undefined} jsonString - JSON string to parse
 * @param {any} fallback - Fallback value if parsing fails
 * @returns {any} Parsed object or fallback
 */
export const safeParse = (jsonString, fallback = null) => {
  if (!jsonString) return fallback;
  
  // If already an object, return as-is
  if (typeof jsonString === 'object') return jsonString;
  
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('Invalid JSON string:', jsonString, error);
    return fallback;
  }
};

/**
 * Validate price range with proper bounds checking
 * @param {Array} priceRange - [min, max] price range
 * @returns {Array} Validated price range
 */
const validatePriceRange = (priceRange) => {
  if (!Array.isArray(priceRange) || priceRange.length !== 2) {
    return [0, Number.MAX_SAFE_INTEGER];
  }
  
  const [min, max] = priceRange;
  const validMin = Math.max(0, parseFloat(min) || 0);
  const validMax = Math.max(validMin, parseFloat(max) || Number.MAX_SAFE_INTEGER);
  
  return [validMin, validMax];
};

/**
 * Property filtering with comprehensive filter support
 * @param {Array} properties - Array of property objects
 * @param {Object} filters - Filter criteria object
 * @returns {Array} Filtered properties
 */
export const applyPropertyFilters = (properties, filters) => {
  if (!filters || !properties?.length) return properties;

  return properties.filter(property => {
    // Price range filter with validation
    if (filters.priceRange && property.price) {
      const [minPrice, maxPrice] = validatePriceRange(filters.priceRange);
      const price = parseFloat(property.price) || 0;
      
      if (price < minPrice || price > maxPrice) {
        return false;
      }
    }

    // Star rating filter - use minimum rating logic (not exact match)
    if (filters.starRating && filters.starRating > 0) {
      const rating = parseFloat(property.rating) || 0;
      // Property must have at least the specified rating
      if (rating < filters.starRating) {
        return false;
      }
    }

    // Date availability filter with proper date comparison
    if (filters.availabilityDate && property.available_from) {
      try {
        const availableDate = new Date(property.available_from);
        const filterDate = new Date(filters.availabilityDate);
        
        // Property must be available on or before the filter date
        if (availableDate > filterDate) {
          return false;
        }
      } catch (error) {
        console.warn('Invalid date format:', property.available_from, filters.availabilityDate);
        // Skip date filtering for invalid dates
      }
    }

    // Location filter with fuzzy matching
    if (filters.location && filters.location.trim()) {
      const locationQuery = filters.location.toLowerCase().trim();
      const address = (property.address || '').toLowerCase();

      // Location matching
      const locationMatch = address.includes(locationQuery) ||
                           // Check for partial matches with word boundaries
                           locationQuery.split(' ').some(word => 
                             word.length > 2 && address.includes(word)
                           );
      
      if (!locationMatch) {
        return false;
      }
    }

    // Property type filter with case-insensitive matching
    if (filters.propertyType && filters.propertyType !== 'All') {
      if (property.property_type?.toLowerCase() !== filters.propertyType.toLowerCase()) {
        return false;
      }
    }

    // Bedroom count filter - must have at least specified number
    if (filters.bedrooms && filters.bedrooms > 0) {
  const facilities = safeParse(property.facilities, {});
  
  // Try multiple possible keys for bedroom count
  const bedroomCount = parseInt(
    facilities.Bedrooms || 
    facilities.bedrooms || 
    facilities.Bedroom || 
    facilities.bedroom || 
    0
  );
  
  if (bedroomCount < filters.bedrooms) {
    return false;
  }
}

    // Bathroom count filter - must have at least specified number
    if (filters.bathrooms && filters.bathrooms > 0) {
  const facilities = safeParse(property.facilities, {});
  
  // Try multiple possible keys for bathroom count
  const bathroomCount = parseInt(
    facilities.Bathrooms || 
    facilities.bathrooms || 
    facilities.Bathroom || 
    facilities.bathroom || 
    0
  );
  
  if (bathroomCount < filters.bathrooms) {
    return false;
  }
}

    // Required amenities filter - property must have ALL specified amenities
    if (filters.requiredAmenities && Array.isArray(filters.requiredAmenities) && filters.requiredAmenities.length > 0) {
      const propertyAmenities = safeParse(property.amenities, []);
      
      // Convert to lowercase for case-insensitive matching
      const normalizedPropertyAmenities = propertyAmenities.map(amenity => 
        (amenity || '').toLowerCase()
      );
      
      const hasAllRequiredAmenities = filters.requiredAmenities.every(required => {
        const normalizedRequired = (required || '').toLowerCase();
        return normalizedPropertyAmenities.some(amenity => 
          amenity.includes(normalizedRequired) || normalizedRequired.includes(amenity)
        );
      });
      
      if (!hasAllRequiredAmenities) {
        return false;
      }
    }

    // Unit type filter
    if (filters.unitType && filters.unitType !== 'All') {
      if (property.unit_type?.toLowerCase() !== filters.unitType.toLowerCase()) {
        return false;
      }
    }

    // Availability status filter
    if (filters.isAvailable !== undefined) {
      const isAvailable = property.is_available !== false && property.is_active !== false;
      if (filters.isAvailable !== isAvailable) {
        return false;
      }
    }

    // Price per square meter filter (if area is available)
    if (filters.maxPricePerSqm && property.price && property.area) {
      const pricePerSqm = property.price / property.area;
      if (pricePerSqm > filters.maxPricePerSqm) {
        return false;
      }
    }

    // Recently added filter (properties added within specified days)
    if (filters.maxDaysOld && property.created_at) {
      try {
        const createdDate = new Date(property.created_at);
        const daysDiff = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysDiff > filters.maxDaysOld) {
          return false;
        }
      } catch (error) {
        console.warn('Invalid created_at date:', property.created_at);
      }
    }

    return true;
  });
};

/**
 * Property search with multiple field matching and relevance scoring
 * @param {Array} properties - Array of property objects
 * @param {string} searchQuery - Search text
 * @returns {Array} Filtered and scored properties
 */
export const searchProperties = (properties, searchQuery) => {
  if (!searchQuery || !properties?.length) return properties;

  const query = searchQuery.toLowerCase().trim();
  
  // If query is too short, return all properties
  if (query.length < 2) return properties;

  const searchTerms = query.split(/\s+/).filter(term => term.length > 1);

  const searchResults = properties.map(property => {
    let relevanceScore = 0;
    let matchFound = false;

    // Helper function to check if text matches any search term
    const textMatches = (text, scoreMultiplier = 1) => {
      if (!text) return false;
      const normalizedText = text.toLowerCase();
      
      return searchTerms.some(term => {
        if (normalizedText.includes(term)) {
          // Exact word match gets higher score
          if (normalizedText.split(/\s+/).includes(term)) {
            relevanceScore += 10 * scoreMultiplier;
          } else {
            relevanceScore += 5 * scoreMultiplier;
          }
          return true;
        }
        return false;
      });
    };

    // Search in property type (highest priority)
    if (textMatches(property.property_type, 3)) {
      matchFound = true;
    }

    // Search in unit type (high priority)
    if (textMatches(property.unit_type, 2.5)) {
      matchFound = true;
    }

    // Search in address (high priority)
    if (textMatches(property.address, 2)) {
      matchFound = true;
    }

    // Search in title/description if available
    if (textMatches(property.title, 2)) {
      matchFound = true;
    }

    if (textMatches(property.description, 1.5)) {
      matchFound = true;
    }

    // Search in amenities
    const amenities = safeParse(property.amenities, []);
    if (Array.isArray(amenities)) {
      amenities.forEach(amenity => {
        if (textMatches(amenity, 1)) {
          matchFound = true;
        }
      });
    }

    // Search in facilities
    const facilities = safeParse(property.facilities, {});
    Object.keys(facilities).forEach(facilityType => {
      if (textMatches(facilityType, 1)) {
        matchFound = true;
      }
    });

    // Search in other facility descriptions
    if (textMatches(property.other_facility, 1)) {
      matchFound = true;
    }

    // Price range matching (if user searches for "under 50000" etc.)
    if (property.price && searchTerms.some(term => {
      const num = parseFloat(term.replace(/[^\d.]/g, ''));
      return !isNaN(num) && Math.abs(property.price - num) < property.price * 0.1;
    })) {
      relevanceScore += 5;
      matchFound = true;
    }

    return matchFound ? { ...property, relevanceScore } : null;
  }).filter(Boolean);

  // Sort by relevance score (highest first)
  return searchResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
};

/**
 * Property sorting with multiple criteria
 * @param {Array} properties - Array of property objects
 * @param {string} sortBy - Sort criteria
 * @param {string} sortOrder - 'asc' or 'desc'
 * @returns {Array} Sorted properties
 */
export const sortProperties = (properties, sortBy, sortOrder = 'asc') => {
  if (!properties?.length) return properties;

  const sorted = [...properties].sort((a, b) => {
    let aValue, bValue;

    switch (sortBy.toLowerCase()) {
      case 'price':
        aValue = parseFloat(a.price) || 0;
        bValue = parseFloat(b.price) || 0;
        break;
      
      case 'date':
      case 'availability':
        aValue = new Date(a.available_from || '1970-01-01');
        bValue = new Date(b.available_from || '1970-01-01');
        break;
      
      case 'rating':
        aValue = parseFloat(a.rating) || 0;
        bValue = parseFloat(b.rating) || 0;
        break;
      
      case 'bedrooms':
        const aFacilities = safeParse(a.facilities, {});
        const bFacilities = safeParse(b.facilities, {});
        aValue = parseInt(aFacilities.Bedroom || aFacilities.bedroom || 0);
        bValue = parseInt(bFacilities.Bedroom || bFacilities.bedroom || 0);
        break;
      
      case 'name':
      case 'type':
        aValue = (a.property_type || '').toLowerCase();
        bValue = (b.property_type || '').toLowerCase();
        break;
      
      case 'location':
        aValue = (a.address || '').toLowerCase();
        bValue = (b.address || '').toLowerCase();
        break;
      
      case 'created':
      case 'newest':
        aValue = new Date(a.created_at || '1970-01-01');
        bValue = new Date(b.created_at || '1970-01-01');
        break;
      
      case 'popularity':
        // Sort by combination of rating and number of favorites/views
        aValue = (parseFloat(a.rating) || 0) * (parseInt(a.total_ratings) || 1);
        bValue = (parseFloat(b.rating) || 0) * (parseInt(b.total_ratings) || 1);
        break;
      
      case 'relevance':
        // Use relevance score if available (from search)
        aValue = a.relevanceScore || 0;
        bValue = b.relevanceScore || 0;
        break;
      
      default:
        return 0;
    }

    // Handle different data types appropriately
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    // Numeric and date comparisons
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return sorted;
};

/**
 * Get comprehensive property statistics
 * @param {Array} properties - Array of property objects
 * @returns {Object} Detailed statistics object
 */
export const getPropertyStats = (properties) => {
  if (!properties?.length) {
    return {
      total: 0,
      averagePrice: 0,
      priceRange: { min: 0, max: 0 },
      propertyTypes: {},
      averageRating: 0,
      totalRatings: 0,
      availableCount: 0,
      avgBedrooms: 0,
      avgBathrooms: 0,
      priceDistribution: {},
      ratingDistribution: {}
    };
  }

  const prices = properties.map(p => parseFloat(p.price)).filter(price => price && price > 0);
  const ratings = properties.map(p => parseFloat(p.rating)).filter(rating => rating && rating > 0);
  
  // Property type distribution
  const propertyTypes = properties.reduce((acc, property) => {
    const type = property.property_type || 'Unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  // Calculate available properties
  const availableCount = properties.filter(p => 
    p.is_available !== false && p.is_active !== false
  ).length;

  // Calculate average bedrooms and bathrooms
  const facilitiesData = properties.map(p => safeParse(p.facilities, {}));
  const bedrooms = facilitiesData.map(f => parseInt(f.Bedroom || f.bedroom || 0)).filter(b => b > 0);
  const bathrooms = facilitiesData.map(f => parseInt(f.Bathroom || f.bathroom || 0)).filter(b => b > 0);

  // Price distribution (ranges)
  const priceDistribution = {
    'Under 25K': prices.filter(p => p < 25000).length,
    '25K - 50K': prices.filter(p => p >= 25000 && p < 50000).length,
    '50K - 100K': prices.filter(p => p >= 50000 && p < 100000).length,
    'Over 100K': prices.filter(p => p >= 100000).length
  };

  // Rating distribution
  const ratingDistribution = {
    '5 Stars': ratings.filter(r => r >= 4.5).length,
    '4+ Stars': ratings.filter(r => r >= 4 && r < 4.5).length,
    '3+ Stars': ratings.filter(r => r >= 3 && r < 4).length,
    'Below 3': ratings.filter(r => r < 3).length
  };

  return {
    total: properties.length,
    averagePrice: prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0,
    priceRange: {
      min: prices.length > 0 ? Math.min(...prices) : 0,
      max: prices.length > 0 ? Math.max(...prices) : 0
    },
    propertyTypes,
    averageRating: ratings.length > 0 ? 
      parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)) : 0,
    totalRatings: ratings.length,
    availableCount,
    avgBedrooms: bedrooms.length > 0 ? 
      parseFloat((bedrooms.reduce((a, b) => a + b, 0) / bedrooms.length).toFixed(1)) : 0,
    avgBathrooms: bathrooms.length > 0 ? 
      parseFloat((bathrooms.reduce((a, b) => a + b, 0) / bathrooms.length).toFixed(1)) : 0,
    priceDistribution,
    ratingDistribution
  };
};

/**
 * Get recommended properties based on user preferences with intelligent scoring
 * @param {Array} properties - Array of property objects
 * @param {Object} userPreferences - User preference object
 * @param {number} limit - Maximum number of recommendations
 * @returns {Array} Recommended properties with scores
 */
export const getRecommendedProperties = (properties, userPreferences = {}, limit = 6) => {
  if (!properties?.length) return [];

  // Score properties based on user preferences
  const scoredProperties = properties.map(property => {
    let score = 0;

    // Price preference scoring (higher score for properties within budget)
    if (userPreferences.maxPrice && property.price) {
      const price = parseFloat(property.price);
      if (price <= userPreferences.maxPrice) {
        // Closer to budget gets higher score
        const priceScore = 15 * (1 - (price / userPreferences.maxPrice));
        score += Math.max(5, priceScore);
      }
    }

    // Location preference scoring
    if (userPreferences.preferredLocation && property.address) {
      const locationMatch = property.address.toLowerCase()
        .includes(userPreferences.preferredLocation.toLowerCase());
      if (locationMatch) {
        score += 20;
      }
    }

    // Property type preference scoring
    if (userPreferences.propertyType && property.property_type === userPreferences.propertyType) {
      score += 25;
    }

    // Rating bonus (higher rated properties get bonus)
    if (property.rating) {
      score += parseFloat(property.rating) * 3;
    }

    // Bedroom preference scoring
    if (userPreferences.bedrooms) {
      const facilities = safeParse(property.facilities, {});
      const propertyBedrooms = parseInt(facilities.Bedroom || facilities.bedroom || 0);
      if (propertyBedrooms === userPreferences.bedrooms) {
        score += 15;
      } else if (Math.abs(propertyBedrooms - userPreferences.bedrooms) === 1) {
        score += 8; // Close match gets partial score
      }
    }

    // Amenities preference scoring
    if (userPreferences.preferredAmenities?.length > 0) {
      const propertyAmenities = safeParse(property.amenities, []);
      const matchingAmenities = userPreferences.preferredAmenities.filter(pref =>
        propertyAmenities.some(amenity => 
          amenity.toLowerCase().includes(pref.toLowerCase())
        )
      );
      score += matchingAmenities.length * 6;
    }

    // Recency bonus (recently added properties get small boost)
    if (property.created_at) {
      const daysSinceAdded = (Date.now() - new Date(property.created_at)) / (1000 * 60 * 60 * 24);
      if (daysSinceAdded <= 7) {
        score += 8;
      } else if (daysSinceAdded <= 30) {
        score += 4;
      }
    }

    // Availability bonus
    if (property.is_available !== false && property.is_active !== false) {
      score += 5;
    }

    // High rating count bonus (popular properties)
    if (property.total_ratings && parseInt(property.total_ratings) > 5) {
      score += Math.min(10, parseInt(property.total_ratings));
    }

    return { ...property, recommendationScore: score };
  });

  // Sort by score and return top results
  return scoredProperties
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, limit);
};

/**
 * Get unique values for filter options
 * @param {Array} properties - Array of property objects
 * @param {string} field - Field to extract unique values from
 * @returns {Array} Array of unique values
 */
export const getUniqueFilterValues = (properties, field) => {
  if (!properties?.length) return [];

  const values = new Set();
  
  properties.forEach(property => {
    const value = property[field];
    if (value && value !== 'Unknown' && value !== '') {
      values.add(value);
    }
  });

  return Array.from(values).sort();
};

/**
 * Validate filter object and set defaults
 * @param {Object} filters - Raw filter object
 * @returns {Object} Validated filter object
 */
export const validateFilters = (filters) => {
  if (!filters || typeof filters !== 'object') {
    return {};
  }

  const validated = {};

  // Validate price range
  if (filters.priceRange) {
    validated.priceRange = validatePriceRange(filters.priceRange);
  }

  // Validate rating (must be between 0-5)
  if (filters.starRating !== undefined) {
    const rating = parseFloat(filters.starRating);
    validated.starRating = Math.max(0, Math.min(5, rating || 0));
  }

  // Validate counts (must be positive integers)
  ['bedrooms', 'bathrooms'].forEach(field => {
    if (filters[field] !== undefined) {
      const count = parseInt(filters[field]);
      validated[field] = Math.max(0, count || 0);
    }
  });

  // Validate strings (trim and sanitize)
  ['location', 'propertyType', 'unitType'].forEach(field => {
    if (filters[field] && typeof filters[field] === 'string') {
      const trimmed = filters[field].trim();
      if (trimmed) {
        validated[field] = trimmed;
      }
    }
  });

  // Validate arrays
  if (Array.isArray(filters.requiredAmenities)) {
    validated.requiredAmenities = filters.requiredAmenities
      .filter(amenity => amenity && typeof amenity === 'string')
      .map(amenity => amenity.trim());
  }

  // Validate dates
  if (filters.availabilityDate) {
    try {
      const date = new Date(filters.availabilityDate);
      if (!isNaN(date.getTime())) {
        validated.availabilityDate = filters.availabilityDate;
      }
    } catch (error) {
      console.warn('Invalid availability date:', filters.availabilityDate);
    }
  }

  // Validate boolean values
  if (filters.isAvailable !== undefined) {
    validated.isAvailable = Boolean(filters.isAvailable);
  }

  return validated;
};