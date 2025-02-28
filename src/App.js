import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import AppRoutes from './routes';
import Footer from './components/common/Footer';
import { Box } from '@mui/material';
import { PropertyProvider } from './contexts/PropertyContext';

function App() {
  return (
    <ThemeProvider>
      <PropertyProvider>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Box sx={{ flexGrow: 1 }}>
            <AppRoutes />
          </Box>
          <Footer />
        </Box>
      </PropertyProvider>
    </ThemeProvider>
  );
}

export default App;
