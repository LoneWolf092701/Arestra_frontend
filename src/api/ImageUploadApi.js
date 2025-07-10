import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/properties';

/**
 * Upload a single image file
 * @param {File} file - Image file to upload
 * @returns {Promise<string>} URL of uploaded image
 */
export const uploadImage = async (file) => {
  try {
    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 5MB.');
    }

    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required. Please log in.');
    }

    const formData = new FormData();
    formData.append('image', file);

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      },
      onUploadProgress: (progressEvent) => {
        // You can use this for progress indication
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Upload progress: ${percentCompleted}%`);
      }
    };

    const response = await axios.post(`${API_BASE_URL}/upload`, formData, config);
    
    if (!response.data || !response.data.cloudUrl) {
      throw new Error('Invalid response from server');
    }

    return response.data.cloudUrl;
  } catch (error) {
    console.error('Image upload error:', error);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('tokenExpiry');
      throw new Error('Authentication expired. Please log in again.');
    } else if (error.response?.status === 413) {
      throw new Error('File too large. Please choose a smaller image.');
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data?.error || 'Invalid file upload request.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else if (error.message) {
      throw error;
    } else {
      throw new Error('Failed to upload image. Please try again.');
    }
  }
};

/**
 * Upload multiple images
 * @param {File[]} files - Array of image files to upload
 * @returns {Promise<string[]>} Array of uploaded image URLs
 */
export const uploadMultipleImages = async (files) => {
  try {
    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    // Validate each file first
    for (const file of files) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Invalid file type for ${file.name}. Only JPEG, PNG, GIF, and WebP images are allowed.`);
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error(`File ${file.name} is too large. Maximum size is 5MB.`);
      }
    }

    // Upload files one by one (you could also implement parallel uploads)
    const uploadPromises = files.map(file => uploadImage(file));
    const uploadedUrls = await Promise.all(uploadPromises);

    return uploadedUrls;
  } catch (error) {
    console.error('Multiple images upload error:', error);
    throw error;
  }
};

/**
 * Upload image with preview generation
 * @param {File} file - Image file to upload
 * @returns {Promise<Object>} Object containing URL and preview data
 */
export const uploadImageWithPreview = async (file) => {
  try {
    // Generate preview
    const previewUrl = URL.createObjectURL(file);
    
    // Upload the image
    const cloudUrl = await uploadImage(file);
    
    return {
      cloudUrl,
      previewUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    };
  } catch (error) {
    console.error('Image upload with preview error:', error);
    throw error;
  }
};

/**
 * Validate image file before upload
 * @param {File} file - Image file to validate
 * @returns {Object} Validation result
 */
export const validateImageFile = (file) => {
  const errors = [];
  
  if (!file) {
    errors.push('No file provided');
    return { isValid: false, errors };
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    errors.push('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
  }

  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    errors.push('File size too large. Maximum size is 5MB.');
  }

  // Check minimum dimensions (optional)
  const checkDimensions = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const minWidth = 200;
        const minHeight = 200;
        
        if (img.width < minWidth || img.height < minHeight) {
          errors.push(`Image dimensions too small. Minimum size is ${minWidth}x${minHeight} pixels.`);
        }
        
        resolve();
      };
      img.onerror = () => {
        errors.push('Unable to read image file.');
        resolve();
      };
      img.src = URL.createObjectURL(file);
    });
  };

  return {
    isValid: errors.length === 0,
    errors,
    checkDimensions: () => checkDimensions(file)
  };
};

/**
 * Generate thumbnail from image file
 * @param {File} file - Image file
 * @param {number} maxWidth - Maximum width for thumbnail
 * @param {number} maxHeight - Maximum height for thumbnail
 * @returns {Promise<string>} Base64 encoded thumbnail
 */
export const generateThumbnail = (file, maxWidth = 200, maxHeight = 200) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw image on canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to base64
      const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
      resolve(thumbnail);
    };

    img.onerror = () => {
      reject(new Error('Failed to generate thumbnail'));
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * Compress image before upload
 * @param {File} file - Image file to compress
 * @param {number} quality - Compression quality (0-1)
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 * @returns {Promise<File>} Compressed image file
 */
export const compressImage = (file, quality = 0.8, maxWidth = 1920, maxHeight = 1080) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw image on canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(compressedFile);
        } else {
          reject(new Error('Failed to compress image'));
        }
      }, 'image/jpeg', quality);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * Delete uploaded image (if deletion endpoint exists)
 * @param {string} imageUrl - URL of image to delete
 * @returns {Promise<Object>} Deletion response
 */
export const deleteImage = async (imageUrl) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required. Please log in.');
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    const response = await axios.delete(`${API_BASE_URL}/delete-image`, {
      ...config,
      data: { imageUrl }
    });

    return response.data;
  } catch (error) {
    console.error('Image deletion error:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Authentication expired. Please log in again.');
    } else if (error.response?.status === 404) {
      throw new Error('Image not found.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error('Failed to delete image.');
    }
  }
};

/**
 * Get image upload progress
 * @param {Function} onProgress - Progress callback function
 * @returns {Function} Progress handler
 */
export const createProgressHandler = (onProgress) => {
  return (progressEvent) => {
    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    if (onProgress) {
      onProgress(percentCompleted);
    }
  };
};

export default {
  uploadImage,
  uploadMultipleImages,
  uploadImageWithPreview,
  validateImageFile,
  generateThumbnail,
  compressImage,
  deleteImage,
  createProgressHandler
};