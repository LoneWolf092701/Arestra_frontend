const darkTheme = {
  name: 'dark',
  
  // Core colors - maintaining brand identity while adapting for dark mode
  primary: '#4A9EFF',      // Lighter blue - better visibility on dark backgrounds
  secondary: '#FF8A65',    // Warm orange - maintains energy while being easier on eyes
  approved: '#66BB6A',      // Soft green - signifies approval and success in dark mode
  accent: '#FFD54F',       // Softer yellow - reduces eye strain in dark environments
  
  // Background colors - creating comfortable dark hierarchy
  background: '#0F0F0F',          // Very dark gray - reduces eye strain
  paperBackground: '#1E1E1E',     // Dark gray for cards and elevated surfaces
  surfaceBackground: '#2A2A2A',   // Medium dark gray for section backgrounds
  
  // Text colors - optimized for dark backgrounds with proper contrast
  textPrimary: '#FFFFFF',         // Pure white - maximum contrast
  textSecondary: '#B3B3B3',       // Light gray - readable secondary text
  textDisabled: '#666666',        // Medium gray - for disabled states
  
  // Component-specific colors - adapted for dark environment
  cardBackground: '#1E1E1E',
  headerBackground: '#1A1A1A',
  footerBackground: '#1A1A1A',
  sidebarBackground: '#1C1C1C',
  
  // Border and divider colors - subtle separation in dark mode
  border: '#404040',
  divider: '#333333',
  
  // Status colors - adjusted for dark backgrounds while maintaining recognition
  success: '#66BB6A',      // Slightly lighter green for better visibility
  warning: '#FFA726',      // Warmer orange that works well on dark
  error: '#EF5350',        // Softer red that's less harsh on dark backgrounds
  info: '#42A5F5',         // Bright blue that stands out on dark
  
  // Interactive states - optimized for dark mode interactions
  hover: 'rgba(255, 255, 255, 0.08)',
  focus: 'rgba(255, 255, 255, 0.16)',
  selected: 'rgba(255, 255, 255, 0.12)',
  
  // Input and form colors - ensuring usability in dark mode
  inputBackground: '#2A2A2A',
  inputBorder: '#4A4A4A',
  inputFocus: '#4A9EFF',
  placeholder: '#888888',
  
  // Shadow definitions - adjusted for dark backgrounds
  shadows: {
    light: '0 1px 3px rgba(0, 0, 0, 0.3)',
    medium: '0 4px 6px rgba(0, 0, 0, 0.4)',
    heavy: '0 10px 25px rgba(0, 0, 0, 0.5)',
  }
};

export default darkTheme;