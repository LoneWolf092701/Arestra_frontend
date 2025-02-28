import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Grid, IconButton, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { uploadImage } from '../../api/ImageUploadApi';

const ImageUpload = ({ onUpload }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);


  const onDrop = useCallback(
    (acceptedFiles) => {
      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    },
    []
  );

  const handleRemoveFile = (fileName) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    try {
      const uploadedUrls = await Promise.all(files.map((file) => uploadImage(file)));
      console.log('Uploaded Image URLs:', uploadedUrls);

      if (onUpload) {
        onUpload(uploadedUrls); 
      }

      setFiles([]);
    } catch (error) {
      console.error('Error uploading images:', error);
    }
    setUploading(false);
  };
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'image/*',
  });

  return (
    <Box>
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed #ccc',
          padding: 2,
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragActive ? '#f0f0f0' : 'transparent',
        }}
      >
        <input {...getInputProps()} />
        <Typography>
          {isDragActive
            ? 'Drop the images here...'
            : 'Drag and drop images here, or click to select images (Max 5MB)'}
        </Typography>
      </Box>

      {files.length > 0 && (
        <>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {files.map((file) => (
              <Grid item key={file.name} xs={12} sm={6} md={4}>
                <Box
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #ccc',
                    borderRadius: 1,
                    padding: 1,
                  }}
                >
                  <img
                    src={file.preview}
                    alt={file.name}
                    style={{ width: '100%', height: 'auto' }}
                  />
                  <IconButton
                    onClick={() => handleRemoveFile(file.name)}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 5,
                      right: 5,
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Grid>
            ))}
          </Grid>

          
        </>
      )}
        <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            sx={{ mt: 2 }}
            disabled={files.length === 0}
          >
            {uploading ? 'Uploading...' : 'Upload Images'}
        </Button>
    </Box>
  );
};

export default ImageUpload;
