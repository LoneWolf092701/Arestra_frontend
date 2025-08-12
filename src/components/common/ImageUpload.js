import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Grid, IconButton, Button, CircularProgress, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { uploadImage } from '../../api/ImageUploadApi';

const ImageUpload = ({ onUpload, maxFiles = 10, maxFileSize = 5 * 1024 * 1024 }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState({});

  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      setError('');
      
      if (rejectedFiles.length > 0) {
        const reasons = rejectedFiles.map(file => {
          const errors = file.errors.map(error => error.message).join(', ');
          return `${file.file.name}: ${errors}`;
        }).join('\n');
        setError(`Some files were rejected:\n${reasons}`);
      }

      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
          id: Date.now() + Math.random()
        })
      );

      setFiles((prevFiles) => {
        const combined = [...prevFiles, ...newFiles];
        if (combined.length > maxFiles) {
          setError(`Maximum ${maxFiles} files allowed. Some files were not added.`);
          return combined.slice(0, maxFiles);
        }
        return combined;
      });
    },
    [maxFiles]
  );

  const handleRemoveFile = (fileId) => {
    setFiles((prevFiles) => {
      const updatedFiles = prevFiles.filter((file) => file.id !== fileId);
      
      const removedFile = prevFiles.find(file => file.id === fileId);
      if (removedFile && removedFile.preview) {
        URL.revokeObjectURL(removedFile.preview);
      }
      
      return updatedFiles;
    });
    
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select at least one file to upload');
      return;
    }
    
    setUploading(true);
    setError('');
    
    try {
      const uploadPromises = files.map(async (file) => {
        try {
          setUploadProgress(prev => ({
            ...prev,
            [file.id]: { status: 'uploading', progress: 0 }
          }));

          const result = await uploadImage(file, {
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(prev => ({
                ...prev,
                [file.id]: { status: 'uploading', progress: percentCompleted }
              }));
            }
          });

          setUploadProgress(prev => ({
            ...prev,
            [file.id]: { status: 'completed', progress: 100, url: result.url }
          }));

          return result;
        } catch (error) {
          setUploadProgress(prev => ({
            ...prev,
            [file.id]: { status: 'error', progress: 0, error: error.message }
          }));
          throw error;
        }

      });

      const results = await Promise.allSettled(uploadPromises);
      
      const successful = results
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);
      
      const failed = results
        .filter(result => result.status === 'rejected')
        .map(result => result.reason.message);

      if (successful.length > 0) {
        if (onUpload) {
          onUpload(successful);
        }
        
        setFiles(prev => prev.filter(file => {
          const progress = uploadProgress[file.id];
          return progress?.status !== 'completed';
        }));
      }

      if (failed.length > 0) {
        setError(`Upload failed for ${failed.length} file(s): ${failed.join(', ')}`);
      }

    } catch (error) {
      console.error('Upload error:', error);
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleClearAll = () => {
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    
    setFiles([]);
    setUploadProgress({});
    setError('');
  };

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize: maxFileSize,
    maxFiles: maxFiles,
    multiple: true
  });

  const getBorderColor = () => {
    if (isDragAccept) return 'success.main';
    if (isDragReject) return 'error.main';
    if (isDragActive) return 'primary.main';
    return 'grey.300';
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: getBorderColor(),
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'border-color 0.2s ease',
          backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'action.hover'
          }
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        
        <Typography variant="h6" gutterBottom>
          {isDragActive ? 'Drop files here' : 'Drag & drop images here'}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          or click to browse files
        </Typography>
        
        <Typography variant="caption" color="text.secondary">
          Maximum {maxFiles} files, up to {Math.round(maxFileSize / (1024 * 1024))}MB each
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {files.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Selected Files ({files.length}/{maxFiles})
            </Typography>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleClearAll}
              disabled={uploading}
              size="small"
            >
              Clear All
            </Button>
          </Box>

          <Grid container spacing={2}>
            {files.map((file) => {
              const progress = uploadProgress[file.id];
              
              return (
                <Grid item xs={6} sm={4} md={3} key={file.id}>
                  <Box
                    sx={{
                      position: 'relative',
                      border: '1px solid',
                      borderColor: 'grey.300',
                      borderRadius: 1,
                      overflow: 'hidden'
                    }}
                  >
                    <Box
                      component="img"
                      src={file.preview}
                      alt={file.name}
                      sx={{
                        width: '100%',
                        height: 120,
                        objectFit: 'cover',
                        display: 'block'
                      }}
                    />

                    {progress && progress.status === 'uploading' && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: 'rgba(0, 0, 0, 0.7)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white'
                        }}
                      >
                        <CircularProgress 
                          variant="determinate" 
                          value={progress.progress} 
                          size={40}
                          sx={{ color: 'white', mb: 1 }}
                        />
                        <Typography variant="caption">
                          {progress.progress}%
                        </Typography>
                      </Box>
                    )}

                    {progress && progress.status === 'completed' && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          backgroundColor: 'success.main',
                          borderRadius: '50%',
                          width: 24,
                          height: 24,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Typography variant="caption" sx={{ color: 'white' }}>✓</Typography>
                      </Box>
                    )}

                    {progress && progress.status === 'error' && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: 'rgba(255, 0, 0, 0.8)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white'
                        }}
                      >
                        <Typography variant="caption" align="center">
                          Upload Failed
                        </Typography>
                      </Box>
                    )}

                    <IconButton
                      onClick={() => handleRemoveFile(file.id)}
                      disabled={uploading}
                      sx={{
                        position: 'absolute',
                        top: 4,
                        left: 4,
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        color: 'white',
                        width: 28,
                        height: 28,
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.8)'
                        }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>

                    <Box sx={{ p: 1, backgroundColor: 'background.paper' }}>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontSize: '0.75rem'
                        }}
                        title={file.name}
                      >
                        {file.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {Math.round(file.size / 1024)} KB
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              );
            })}
          </Grid>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={uploading || files.length === 0}
              startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
              size="large"
            >
              {uploading ? 'Uploading...' : `Upload ${files.length} File${files.length !== 1 ? 's' : ''}`}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ImageUpload;