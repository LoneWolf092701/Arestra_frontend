const lightTheme = {
  name: 'light',
  
  // Core colors - primary identity colors for the application
  primary: '#264653',      // Deep teal - professional and trustworthy
  secondary: '#F76C52',    // Coral red - energetic and warm
  approved: '#2A9D8F',      // Soft green - signifies approval and success
  accent: '#FFC857',       // Golden yellow - bright and inviting
  
  // Background colors - creating visual hierarchy
  background: '#FAFAFA',          // Very light gray - easy on the eyes
  paperBackground: '#FFFFFF',     // Pure white for cards and modals
  surfaceBackground: '#F5F5F5',   // Slightly darker for sections
  
  // Text colors - ensuring proper contrast and readability
  textPrimary: '#1A1A1A',        // Almost black - high contrast
  textSecondary: '#666666',      // Medium gray - for secondary info
  textDisabled: '#BDBDBD',       // Light gray - for disabled elements
  
  // Component-specific colors
  cardBackground: '#FFFFFF',
  headerBackground: '#264653',
  footerBackground: '#264653',
  sidebarBackground: '#F8F9FA',
  
  // Border and divider colors
  border: '#E0E0E0',
  divider: '#EEEEEE',
  
  // Status colors - for alerts, notifications, and feedback
  success: '#4CAF50',      // Green - for positive actions
  warning: '#FF9800',      // Orange - for caution
  error: '#F44336',        // Red - for errors and danger
  info: '#2196F3',         // Blue - for information
  
  // Interactive states - hover, focus, and selection
  hover: 'rgba(38, 70, 83, 0.04)',
  focus: 'rgba(38, 70, 83, 0.12)',
  selected: 'rgba(38, 70, 83, 0.08)',
  
  // Input and form colors
  inputBackground: '#FFFFFF',
  inputBorder: '#D1D5DB',
  inputFocus: '#264653',
  placeholder: '#9CA3AF',
  
  // Shadow definitions for depth
  shadows: {
    light: '0 1px 3px rgba(0, 0, 0, 0.12)',
    medium: '0 4px 6px rgba(0, 0, 0, 0.1)',
    heavy: '0 10px 25px rgba(0, 0, 0, 0.15)',
  }
};

export default lightTheme;