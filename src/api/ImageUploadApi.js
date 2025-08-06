import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

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

/**
 * Validate image file before upload
 * This function performs client-side validation to prevent unnecessary API calls
 * @param {File} file - Image file to validate
 * @returns {Object} Validation result with isValid boolean and errors array
 */
export const validateImageFile = (file) => {
  const errors = [];
  
  if (!file) {
    errors.push('No file provided');
    return { isValid: false, errors };
  }

  if (!file.type.startsWith('image/')) {
    errors.push('File must be an image');
  }

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    errors.push('Only JPEG, PNG, and WebP images are allowed');
  }

  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    errors.push('Image size must be less than 10MB');
  }

  const minSize = 1024;
  if (file.size < minSize) {
    errors.push('Image file appears to be corrupted or too small');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Upload single image to Azure Storage
 * This function handles individual image uploads with progress tracking
 * @param {File} imageFile - Image file to upload
 * @param {Object} options - Upload options including progress callbacks
 * @returns {Promise<Object>} Upload result with image URL and metadata
 */
export const uploadSingleImage = async (imageFile, options = {}) => {
  try {
    const validation = validateImageFile(imageFile);
    
    if (!validation.isValid) {
      throw new Error(`Invalid image file: ${validation.errors.join(', ')}`);
    }

    const formData = new FormData();
    formData.append('profileImage', imageFile);

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (options.onUploadProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          options.onUploadProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            progress: percentCompleted,
            fileName: imageFile.name
          });
        }
      }
    };

    const response = await apiClient.post('/upload/single', formData, config);
    
    if (!response.data || !response.data.uploadedFile) {
      throw new Error('Invalid response from server');
    }

    return response.data.uploadedFile;

  } catch (error) {
    console.error('Single image upload error:', error);
    
    if (error.response?.status === 400) {
      throw new Error(error.response.data?.message || 'Invalid image file. Please check file type and size.');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    } else if (error.response?.status === 413) {
      throw new Error('File too large. Maximum size is 10MB.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }
    
    throw new Error(error.message || 'Upload failed. Please try again.');
  }
};

/**
 * Upload multiple images to Azure Storage
 * This function handles batch uploads with individual progress tracking
 * @param {File[]} files - Array of image files to upload
 * @param {Object} options - Upload options including progress callbacks
 * @returns {Promise<Object[]>} Array of upload results
 */
export const uploadMultipleImages = async (files, options = {}) => {
  try {
    if (!files || !Array.isArray(files) || files.length === 0) {
      throw new Error('No files provided for upload');
    }

    if (files.length > 10) {
      throw new Error('Maximum 10 files allowed per upload');
    }

    const validationResults = files.map(validateImageFile);
    const invalidFiles = validationResults.filter(result => !result.isValid);
    
    if (invalidFiles.length > 0) {
      const errorMessages = invalidFiles.map(result => result.errors.join(', '));
      throw new Error(`Invalid files: ${errorMessages.join('; ')}`);
    }

    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('propertyImages', file);
    });

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (options.onUploadProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          options.onUploadProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            progress: percentCompleted
          });
        }
      }
    };

    const response = await apiClient.post('/upload/multiple', formData, config);
    
    if (!response.data || !response.data.uploadedFiles) {
      throw new Error('Invalid response from server');
    }

    return response.data.uploadedFiles.propertyImages || [];

  } catch (error) {
    console.error('Multiple images upload error:', error);
    
    if (error.response?.status === 400) {
      throw new Error(error.response.data?.message || 'Invalid files. Please check file types and sizes.');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    } else if (error.response?.status === 413) {
      throw new Error('Files too large. Maximum size is 10MB per file.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }
    
    throw new Error(error.message || 'Upload failed. Please try again.');
  }
};

/**
 * Upload mixed file types (profile image, property images, documents)
 * This function handles complex uploads with different file types in one request
 * @param {Object} fileGroups - Object containing different file categories
 * @param {File} fileGroups.profileImage - Single profile image
 * @param {File[]} fileGroups.propertyImages - Array of property images
 * @param {File[]} fileGroups.documents - Array of document files
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload results organized by file type
 */
export const uploadMixedFiles = async (fileGroups, options = {}) => {
  try {
    if (!fileGroups || typeof fileGroups !== 'object') {
      throw new Error('File groups object is required');
    }

    const { profileImage, propertyImages = [], documents = [] } = fileGroups;
    
    let totalFiles = 0;
    if (profileImage) totalFiles += 1;
    if (propertyImages.length) totalFiles += propertyImages.length;
    if (documents.length) totalFiles += documents.length;
    
    if (totalFiles === 0) {
      throw new Error('No files provided for upload');
    }

    if (totalFiles > 15) {
      throw new Error('Maximum 15 files allowed per upload');
    }

    const formData = new FormData();
    
    if (profileImage) {
      const validation = validateImageFile(profileImage);
      if (!validation.isValid) {
        throw new Error(`Invalid profile image: ${validation.errors.join(', ')}`);
      }
      formData.append('profileImage', profileImage);
    }
    
    if (propertyImages.length > 0) {
      if (propertyImages.length > 10) {
        throw new Error('Maximum 10 property images allowed');
      }
      
      propertyImages.forEach((file, index) => {
        const validation = validateImageFile(file);
        if (!validation.isValid) {
          throw new Error(`Invalid property image ${index + 1}: ${validation.errors.join(', ')}`);
        }
        formData.append('propertyImages', file);
      });
    }
    
    if (documents.length > 0) {
      if (documents.length > 5) {
        throw new Error('Maximum 5 documents allowed');
      }
      
      const allowedDocTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      
      documents.forEach((file, index) => {
        if (!allowedDocTypes.includes(file.type)) {
          throw new Error(`Document ${index + 1} must be PDF, Word document, or text file`);
        }
        
        const maxDocSize = 5 * 1024 * 1024;
        if (file.size > maxDocSize) {
          throw new Error(`Document ${index + 1} exceeds 5MB size limit`);
        }
        
        formData.append('documents', file);
      });
    }

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (options.onUploadProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          options.onUploadProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            progress: percentCompleted,
            totalFiles
          });
        }
      }
    };

    const response = await apiClient.post('/upload/mixed', formData, config);
    
    if (!response.data || !response.data.uploadedFiles) {
      throw new Error('Invalid response from server');
    }

    return response.data.uploadedFiles;

  } catch (error) {
    console.error('Mixed files upload error:', error);
    
    if (error.response?.status === 400) {
      throw new Error(error.response.data?.message || 'Invalid files. Please check file types and sizes.');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    } else if (error.response?.status === 413) {
      throw new Error('Files too large. Check individual file size limits.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }
    
    throw new Error(error.message || 'Upload failed. Please try again.');
  }
};

/**
 * Delete uploaded file from Azure Storage
 * This function removes files from cloud storage when they are no longer needed
 * @param {string} fileUrl - URL of the file to delete
 * @param {string} fileType - Type of file (profile, property, document)
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteUploadedFile = async (fileUrl, fileType = 'property') => {
  try {
    if (!fileUrl) {
      throw new Error('File URL is required');
    }

    if (!['profile', 'property', 'document'].includes(fileType)) {
      throw new Error('Invalid file type specified');
    }

    const response = await apiClient.delete('/upload/file', {
      data: {
        fileUrl,
        fileType
      }
    });
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }

    return response.data;

  } catch (error) {
    console.error('File deletion error:', error);
    
    if (error.response?.status === 400) {
      throw new Error(error.response.data?.message || 'Invalid file deletion request');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    } else if (error.response?.status === 404) {
      throw new Error('File not found or already deleted');
    } else if (error.response?.status === 403) {
      throw new Error('You do not have permission to delete this file');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }
    
    throw new Error(error.message || 'Failed to delete file');
  }
};

/**
 * Get upload progress for ongoing uploads
 * This function can be used to track multiple concurrent uploads
 * @param {string} uploadId - Unique identifier for the upload session
 * @returns {Promise<Object>} Upload progress information
 */
export const getUploadProgress = async (uploadId) => {
  try {
    if (!uploadId) {
      throw new Error('Upload ID is required');
    }

    const response = await apiClient.get(`/upload/progress/${uploadId}`);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }

    return response.data;

  } catch (error) {
    console.error('Error fetching upload progress:', error);
    
    if (error.response?.status === 404) {
      throw new Error('Upload session not found');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    
    return null;
  }
};

/**
 * Cancel ongoing upload
 * This function attempts to cancel uploads that are in progress
 * @param {string} uploadId - Unique identifier for the upload session
 * @returns {Promise<Object>} Cancellation confirmation
 */
export const cancelUpload = async (uploadId) => {
  try {
    if (!uploadId) {
      throw new Error('Upload ID is required');
    }

    const response = await apiClient.post(`/upload/cancel/${uploadId}`);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }

    return response.data;

  } catch (error) {
    console.error('Error canceling upload:', error);
    
    if (error.response?.status === 404) {
      throw new Error('Upload session not found or already completed');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    
    throw new Error(error.message || 'Failed to cancel upload');
  }
};

/**
 * Upload image (alias for uploadSingleImage for backward compatibility)
 * This function provides the expected interface for ImageUpload component
 * @param {File} imageFile - Image file to upload
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result with image URL
 */
export const uploadImage = async (imageFile, options = {}) => {
  return uploadSingleImage(imageFile, options);
};

/**
 * Resize image before upload (client-side processing)
 * This function can reduce file sizes and standardize dimensions
 * @param {File} imageFile - Original image file
 * @param {Object} options - Resize options
 * @param {number} options.maxWidth - Maximum width in pixels
 * @param {number} options.maxHeight - Maximum height in pixels
 * @param {number} options.quality - JPEG quality (0.1 to 1.0)
 * @returns {Promise<File>} Resized image file
 */
export const resizeImage = async (imageFile, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const { maxWidth = 1920, maxHeight = 1080, quality = 0.9 } = options;
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        try {
          let { width, height } = img;
          
          if (width > maxWidth || height > maxHeight) {
            const aspectRatio = width / height;
            
            if (width > height) {
              width = maxWidth;
              height = width / aspectRatio;
            } else {
              height = maxHeight;
              width = height * aspectRatio;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const resizedFile = new File([blob], imageFile.name, {
                  type: imageFile.type,
                  lastModified: Date.now()
                });
                resolve(resizedFile);
              } else {
                reject(new Error('Failed to resize image'));
              }
            },
            imageFile.type,
            quality
          );
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image for resizing'));
      };
      
      img.src = URL.createObjectURL(imageFile);
    } catch (error) {
      reject(error);
    }
  });
};