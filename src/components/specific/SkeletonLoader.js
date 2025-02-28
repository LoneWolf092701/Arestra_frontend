import React from 'react';
import { Box, Skeleton, Grid, Card, CardContent, Typography } from '@mui/material';

const SkeletonLoader = () => {
  return (
    <Box sx={{ my: 4, backgroundColor: '#e3f2fd', borderRadius: 2, boxShadow: 3, p: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', color: '#0d47a1' }}>
        Loading Property Details...
      </Typography>
      
      <Grid container spacing={2}>
        {[...Array(3)].map((_, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ border: '1px solid #ccc', cursor: 'pointer' }}>
              <CardContent>
                <Skeleton variant="text" width="60%" height={30} />
                <Skeleton variant="text" width="80%" height={20} />
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
};

export default SkeletonLoader;
