import React from 'react';
import { Box, Skeleton, Grid, Card, CardContent, Typography } from '@mui/material';

const SkeletonLoader = ({ variant = 'property', count = 3 }) => {
  if (variant === 'property') {
    return (
      <Box sx={{ my: 4, backgroundColor: '#e3f2fd', borderRadius: 2, boxShadow: 3, p: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', color: '#0d47a1' }}>
          Loading Property Details...
        </Typography>
        
        <Grid container spacing={2}>
          {[...Array(count)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ border: '1px solid #ccc', cursor: 'pointer' }}>
                <Skeleton variant="rectangular" width="100%" height={200} />
                <CardContent>
                  <Skeleton variant="text" width="60%" height={30} />
                  <Skeleton variant="text" width="80%" height={20} />
                  <Skeleton variant="text" width="40%" height={20} />
                  <Box sx={{ mt: 2 }}>
                    <Skeleton variant="text" width="100%" height={16} />
                    <Skeleton variant="text" width="70%" height={16} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            <Skeleton variant="text" width="40%" height={30} />
          </Typography>
          <Grid container spacing={2}>
            {[...Array(5)].map((_, index) => (
              <Grid item xs={6} sm={4} md={3} key={index}>
                <Skeleton variant="rectangular" width="100%" height={40} />
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            <Skeleton variant="text" width="40%" height={30} />
          </Typography>
          <Grid container spacing={2}>
            {[...Array(5)].map((_, index) => (
              <Grid item xs={6} sm={4} md={3} key={index}>
                <Skeleton variant="rectangular" width="100%" height={40} />
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            <Skeleton variant="text" width="40%" height={30} />
          </Typography>
          <Grid container spacing={2}>
            {[...Array(5)].map((_, index) => (
              <Grid item xs={6} sm={4} md={3} key={index}>
                <Skeleton variant="rectangular" width="100%" height={40} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    );
  }

  if (variant === 'list') {
    return (
      <Box sx={{ width: '100%' }}>
        {[...Array(count)].map((_, index) => (
          <Card key={index} sx={{ mb: 2, p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Skeleton variant="circular" width={60} height={60} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="70%" height={24} />
                <Skeleton variant="text" width="50%" height={20} />
                <Skeleton variant="text" width="40%" height={20} />
              </Box>
              <Skeleton variant="rectangular" width={80} height={32} />
            </Box>
          </Card>
        ))}
      </Box>
    );
  }

  if (variant === 'profile') {
    return (
      <Card sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Skeleton variant="circular" width={100} height={100} sx={{ mr: 3 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={32} />
            <Skeleton variant="text" width="40%" height={24} />
            <Skeleton variant="text" width="50%" height={20} />
          </Box>
        </Box>
        
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Skeleton variant="text" width="30%" height={20} />
              <Skeleton variant="rectangular" width="100%" height={40} sx={{ mt: 1 }} />
            </Grid>
          ))}
        </Grid>
      </Card>
    );
  }

  if (variant === 'table') {
    return (
      <Box sx={{ width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Skeleton variant="text" width="200px" height={32} />
          <Skeleton variant="rectangular" width="100px" height={32} />
        </Box>
        
        <Card>
          <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
            <Grid container spacing={2}>
              {[...Array(4)].map((_, index) => (
                <Grid item xs={3} key={index}>
                  <Skeleton variant="text" width="80%" height={20} />
                </Grid>
              ))}
            </Grid>
          </Box>
          
          {[...Array(count)].map((_, index) => (
            <Box key={index} sx={{ p: 2, borderBottom: '1px solid #eee' }}>
              <Grid container spacing={2}>
                {[...Array(4)].map((_, colIndex) => (
                  <Grid item xs={3} key={colIndex}>
                    <Skeleton variant="text" width="90%" height={20} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </Card>
      </Box>
    );
  }

  if (variant === 'dashboard') {
    return (
      <Box>
        <Skeleton variant="text" width="300px" height={40} sx={{ mb: 3 }} />
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[...Array(4)].map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ p: 2, textAlign: 'center' }}>
                <Skeleton variant="text" width="60%" height={20} sx={{ mx: 'auto', mb: 1 }} />
                <Skeleton variant="text" width="40%" height={32} sx={{ mx: 'auto' }} />
              </Card>
            </Grid>
          ))}
        </Grid>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 3 }}>
              <Skeleton variant="text" width="200px" height={24} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" width="100%" height={300} />
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3 }}>
              <Skeleton variant="text" width="150px" height={24} sx={{ mb: 2 }} />
              {[...Array(5)].map((_, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="70%" height={16} />
                    <Skeleton variant="text" width="50%" height={14} />
                  </Box>
                </Box>
              ))}
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  // Default simple skeleton
  return (
    <Box>
      {[...Array(count)].map((_, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          <Skeleton variant="text" width="100%" height={20} />
          <Skeleton variant="text" width="80%" height={20} />
          <Skeleton variant="text" width="60%" height={20} />
        </Box>
      ))}
    </Box>
  );
};

export default SkeletonLoader;