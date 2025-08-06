import React, { createContext, useState, useContext, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import lightTheme from '../themes/lightTheme';
import darkTheme from '../themes/darkTheme';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Initialize theme state with user's previous preference or default to light
  const [currentTheme, setCurrentTheme] = useState(() => {
    const savedTheme = localStorage.getItem('userThemePreference');
    return savedTheme === 'dark' ? darkTheme : lightTheme;
  });

  // Create Material-UI theme based
  const createMuiTheme = (customTheme) => {
    return createTheme({
      palette: {
        mode: customTheme.name, // 'light' or 'dark' - tells MUI which base to use
        
        // Primary color scheme - used for main actions and branding
        primary: {
          main: customTheme.primary,
          light: customTheme.name === 'light' ? '#4A9EFF' : '#6BB6FF',
          dark: customTheme.name === 'light' ? '#1A365D' : '#2563EB',
          contrastText: customTheme.name === 'light' ? '#FFFFFF' : '#000000',
        },
        
        // Secondary color scheme - for accent elements and complementary actions
        secondary: {
          main: customTheme.secondary,
          light: customTheme.name === 'light' ? '#FF9E80' : '#FFAB91',
          dark: customTheme.name === 'light' ? '#D84315' : '#BF360C',
          contrastText: '#FFFFFF',
        },
        
        // Background colors - these control the overall app appearance
        background: {
          default: customTheme.background,     // Main app background
          paper: customTheme.paperBackground,  // Cards, modals, elevated surfaces
        },
        
        // Text colors - ensuring readability across all theme modes
        text: {
          primary: customTheme.textPrimary,     // Main text content
          secondary: customTheme.textSecondary, // Supporting text
          disabled: customTheme.textDisabled,   // Inactive elements
        },
        
        // Status colors - for alerts, notifications, and user feedback
        success: { main: customTheme.success },
        warning: { main: customTheme.warning },
        error: { main: customTheme.error },
        info: { main: customTheme.info },
        
        // Divider color - for separating content sections
        divider: customTheme.divider,
        
        // Action colors - for interactive states like hover and focus
        action: {
          hover: customTheme.hover,
          selected: customTheme.selected,
          focus: customTheme.focus,
          disabled: customTheme.textDisabled,
        },
      },
      
      // Typography settings - ensuring consistent text styling
      typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        allVariants: {
          color: customTheme.textPrimary,
        },
        h1: { color: customTheme.textPrimary },
        h2: { color: customTheme.textPrimary },
        h3: { color: customTheme.textPrimary },
        h4: { color: customTheme.textPrimary },
        h5: { color: customTheme.textPrimary },
        h6: { color: customTheme.textPrimary },
        body1: { color: customTheme.textPrimary },
        body2: { color: customTheme.textSecondary },
        subtitle1: { color: customTheme.textPrimary },
        subtitle2: { color: customTheme.textSecondary },
        caption: { color: customTheme.textSecondary },
      },
      
      // Component customizations - overriding default Material-UI styles
      components: {
        // Card component styling
        MuiCard: {
          styleOverrides: {
            root: {
              backgroundColor: customTheme.cardBackground,
              borderRadius: 12, // Rounded corners for modern look
              boxShadow: customTheme.shadows.light,
              border: `1px solid ${customTheme.border}`,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: customTheme.shadows.medium,
                transform: 'translateY(-2px)',
              },
            },
          },
        },
        
        // Paper component (used by many other components)
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundColor: customTheme.paperBackground,
              color: customTheme.textPrimary,
            },
          },
        },
        
        // Button component styling
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              textTransform: 'none', // Preserve original text casing
              fontWeight: 600,
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: customTheme.shadows.medium,
              },
            },
          },
        },
        
        // TextField (input) component styling
        MuiTextField: {
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-root': {
                backgroundColor: customTheme.inputBackground,
                '& fieldset': {
                  borderColor: customTheme.inputBorder,
                },
                '&:hover fieldset': {
                  borderColor: customTheme.primary,
                },
                '&.Mui-focused fieldset': {
                  borderColor: customTheme.inputFocus,
                },
              },
              '& .MuiInputLabel-root': {
                color: customTheme.textSecondary,
              },
              '& .MuiOutlinedInput-input': {
                color: customTheme.textPrimary,
              },
            },
          },
        },
        
        // AppBar (header) component styling
        MuiAppBar: {
          styleOverrides: {
            root: {
              backgroundColor: customTheme.headerBackground,
              color: customTheme.name === 'light' ? '#FFFFFF' : customTheme.textPrimary,
            },
          },
        },
        
        // Menu component styling
        MuiMenu: {
          styleOverrides: {
            paper: {
              backgroundColor: customTheme.paperBackground,
              border: `1px solid ${customTheme.border}`,
              boxShadow: customTheme.shadows.heavy,
            },
          },
        },
        
        // MenuItem styling
        MuiMenuItem: {
          styleOverrides: {
            root: {
              color: customTheme.textPrimary,
              '&:hover': {
                backgroundColor: customTheme.hover,
              },
              '&.Mui-selected': {
                backgroundColor: customTheme.selected,
              },
            },
          },
        },
        
        // Dialog component styling
        MuiDialog: {
          styleOverrides: {
            paper: {
              backgroundColor: customTheme.paperBackground,
              color: customTheme.textPrimary,
            },
          },
        },
        
        // Chip component styling
        MuiChip: {
          styleOverrides: {
            root: {
              backgroundColor: customTheme.surfaceBackground,
              color: customTheme.textPrimary,
              '&.MuiChip-outlined': {
                borderColor: customTheme.border,
              },
            },
          },
        },
      },
    });
  };

  // Create the Material-UI theme based on current custom theme
  const muiTheme = createMuiTheme(currentTheme);

  // Theme toggle function - switches between light and dark modes
  const toggleTheme = () => {
    const newTheme = currentTheme.name === 'light' ? darkTheme : lightTheme;
    setCurrentTheme(newTheme);
  };

  // Save theme preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('userThemePreference', currentTheme.name);
  }, [currentTheme]);

  // Context value providing both custom theme and toggle function
  const contextValue = {
    theme: currentTheme,        // Custom theme object for direct use
    muiTheme,                   // Material-UI theme for automatic component styling
    toggleTheme,                // Function to switch between themes
    isDark: currentTheme.name === 'dark',  // Boolean for conditional styling
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={muiTheme}>
        {/* CssBaseline applies global styles and ensures consistent baseline */}
        <CssBaseline />
        <div 
          style={{ 
            backgroundColor: currentTheme.background,
            color: currentTheme.textPrimary,
            minHeight: '100vh',
            transition: 'background-color 0.3s ease, color 0.3s ease',
          }}
        >
          {children}
        </div>
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

// Custom hook for easy theme access in components
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};