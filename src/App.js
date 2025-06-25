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
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: '100vh',
            // Smooth color changes when switching themes
            transition: 'background-color 0.3s ease',
          }}
        >
          {/* Main content area that grows to fill available space */}
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