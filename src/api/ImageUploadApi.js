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

export const uploadSingleImage = async (imageFile, options = {}) => {
  try {
    if (!imageFile) {
      throw new Error('No image file provided');
    }

    const validation = validateImageFile(imageFile);
    if (!validation.isValid) {
      throw new Error(`Invalid image file: ${validation.errors.join(', ')}`);
    }

    const formData = new FormData();
    formData.append('profileImage', imageFile);

    if (options.resize_width) {
      formData.append('resize_width', options.resize_width.toString());
    }

    if (options.resize_height) {
      formData.append('resize_height', options.resize_height.toString());
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
            progress: percentCompleted
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
      throw new Error(error.response.data?.message || 'Invalid file. Please check file type and size.');
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

export const uploadMixedFiles = async (files, options = {}) => {
  try {
    if (!files || typeof files !== 'object') {
      throw new Error('No files provided for upload');
    }

    const formData = new FormData();
    let totalFiles = 0;

    Object.keys(files).forEach(fieldName => {
      const fileList = Array.isArray(files[fieldName]) ? files[fieldName] : [files[fieldName]];
      
      fileList.forEach(file => {
        if (file) {
          if (fieldName === 'profileImage' || fieldName === 'propertyImages') {
            const validation = validateImageFile(file);
            if (!validation.isValid) {
              throw new Error(`Invalid ${fieldName}: ${validation.errors.join(', ')}`);
            }
          }
          
          formData.append(fieldName, file);
          totalFiles++;
        }
      });
    });

    if (totalFiles === 0) {
      throw new Error('No valid files provided for upload');
    }

    if (totalFiles > 15) {
      throw new Error('Maximum 15 files allowed per mixed upload');
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
            progress: percentCompleted
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
      throw new Error('Files too large. Maximum size is 10MB per file.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }
    
    throw new Error(error.message || 'Upload failed. Please try again.');
  }
};

export const deleteUploadedFile = async (fileUrl, options = {}) => {
  try {
    if (!fileUrl) {
      throw new Error('File URL is required for deletion');
    }

    const payload = {
      file_url: fileUrl,
      file_type: options.fileType || 'image'
    };

    const response = await apiClient.delete('/upload/file', { data: payload });
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }

    return response.data;

  } catch (error) {
    console.error('File deletion error:', error);
    
    if (error.response?.status === 400) {
      throw new Error(error.response.data?.message || 'Invalid file URL provided.');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    } else if (error.response?.status === 404) {
      throw new Error('File not found or already deleted.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }
    
    throw new Error(error.message || 'File deletion failed. Please try again.');
  }
};

export const getUploadProgress = async (uploadId) => {
  try {
    if (!uploadId) {
      throw new Error('Upload ID is required');
    }

    const response = await apiClient.get(`/upload/progress/${uploadId}`);
    
    if (!response.data) {
      return {
        upload_id: uploadId,
        status: 'unknown',
        progress: 0,
        total_files: 0,
        completed_files: 0
      };
    }

    return response.data;

  } catch (error) {
    console.error('Error fetching upload progress:', error);
    
    return {
      upload_id: uploadId,
      status: 'error',
      progress: 0,
      total_files: 0,
      completed_files: 0,
      error: error.message
    };
  }
};

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
    console.error('Upload cancellation error:', error);
    
    if (error.response?.status === 400) {
      throw new Error(error.response.data?.message || 'Invalid upload ID provided.');
    } else if (error.response?.status === 404) {
      throw new Error('Upload not found or already completed.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }
    
    throw new Error(error.message || 'Upload cancellation failed. Please try again.');
  }
};

export const createImagePreview = async (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      resolve({
        file: file,
        name: file.name,
        size: file.size,
        type: file.type,
        preview: e.target.result,
        lastModified: file.lastModified
      });
    };

    reader.onerror = () => {
      reject(new Error('Failed to create image preview'));
    };

    reader.readAsDataURL(file);
  });
};

export const uploadWithRetry = async (uploadFunction, maxRetries = 3, retryDelay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await uploadFunction();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        break;
      }

      if (error.response?.status === 401 || error.response?.status === 403) {
        break;
      }

      console.warn(`Upload attempt ${attempt} failed, retrying in ${retryDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
    }
  }
  
  throw lastError;
};

export const uploadImage = async (imageFile, options = {}) => {
  return uploadSingleImage(imageFile, options);
};

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
        } catch (canvasError) {
          reject(new Error('Error processing image: ' + canvasError.message));
        }
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image for resizing'));
      };
      
      img.src = URL.createObjectURL(imageFile);
    } catch (error) {
      reject(new Error('Error setting up image resize: ' + error.message));
    }
  });
};