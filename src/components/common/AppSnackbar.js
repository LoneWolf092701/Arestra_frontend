import React from 'react';
import { 
  Snackbar, 
  Alert, 
  AlertTitle,
  IconButton,
  Slide 
} from '@mui/material';
import { 
  Close as CloseIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';

// Slide transition component for smooth animations
function SlideTransition(props) {
  return <Slide {...props} direction="up" />;
}

const AppSnackbar = ({ 
  open, 
  message, 
  severity = 'success', 
  autoHideDuration = 6000, 
  onClose,
  title,
  action,
  anchorOrigin = { vertical: 'bottom', horizontal: 'left' },
  variant = 'filled'
}) => {
  
  // Handle close action
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    onClose();
  };

  // Get appropriate icon for severity
  const getIcon = () => {
    switch (severity) {
      case 'success':
        return <SuccessIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'info':
        return <InfoIcon />;
      default:
        return <SuccessIcon />;
    }
  };

  // Custom action with close button
  const snackbarAction = (
    <>
      {action}
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
        sx={{ ml: 1 }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </>
  );

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      anchorOrigin={anchorOrigin}
      TransitionComponent={SlideTransition}
      sx={{
        // Custom positioning and z-index to ensure visibility
        '& .MuiSnackbarContent-root': {
          minWidth: '300px',
        },
      }}
    >
      <Alert
        onClose={handleClose}
        severity={severity}
        variant={variant}
        icon={getIcon()}
        action={snackbarAction}
        sx={{
          width: '100%',
          alignItems: 'center',
          // Custom styling for better visual appeal
          '& .MuiAlert-icon': {
            fontSize: '1.5rem',
          },
          '& .MuiAlert-message': {
            fontSize: '0.95rem',
            fontWeight: 500,
          },
          // Severity-specific enhancements
          ...(severity === 'success' && {
            backgroundColor: '#2e7d32',
            color: '#ffffff',
            '& .MuiAlert-icon': {
              color: '#ffffff',
            },
          }),
          ...(severity === 'error' && {
            backgroundColor: '#d32f2f',
            color: '#ffffff',
            '& .MuiAlert-icon': {
              color: '#ffffff',
            },
          }),
          ...(severity === 'warning' && {
            backgroundColor: '#ed6c02',
            color: '#ffffff',
            '& .MuiAlert-icon': {
              color: '#ffffff',
            },
          }),
          ...(severity === 'info' && {
            backgroundColor: '#0288d1',
            color: '#ffffff',
            '& .MuiAlert-icon': {
              color: '#ffffff',
            },
          }),
        }}
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </Alert>
    </Snackbar>
  );
};

// Preset configurations for common use cases
export const useSnackbar = () => {
  const [snackbarState, setSnackbarState] = React.useState({
    open: false,
    message: '',
    severity: 'success',
    title: null,
  });

  const showSnackbar = React.useCallback((message, severity = 'success', title = null) => {
    setSnackbarState({
      open: true,
      message,
      severity,
      title,
    });
  }, []);

  const hideSnackbar = React.useCallback(() => {
    setSnackbarState(prev => ({ ...prev, open: false }));
  }, []);

  // Preset methods for common scenarios
  const showSuccess = React.useCallback((message, title = null) => {
    showSnackbar(message, 'success', title);
  }, [showSnackbar]);

  const showError = React.useCallback((message, title = 'Error') => {
    showSnackbar(message, 'error', title);
  }, [showSnackbar]);

  const showWarning = React.useCallback((message, title = 'Warning') => {
    showSnackbar(message, 'warning', title);
  }, [showSnackbar]);

  const showInfo = React.useCallback((message, title = null) => {
    showSnackbar(message, 'info', title);
  }, [showSnackbar]);

  // Preset messages for common actions
  const showFavoriteAdded = React.useCallback(() => {
    showSuccess('❤️ Added to favorites!', 'Favorite Added');
  }, [showSuccess]);

  const showFavoriteRemoved = React.useCallback(() => {
    showSuccess('💔 Removed from favorites', 'Favorite Removed');
  }, [showSuccess]);

  const showRatingSubmitted = React.useCallback((isUpdate = false) => {
    showSuccess(
      isUpdate ? '⭐ Rating updated successfully!' : '⭐ Rating submitted successfully!',
      'Rating ' + (isUpdate ? 'Updated' : 'Submitted')
    );
  }, [showSuccess]);

  const showBookingSuccess = React.useCallback(() => {
    showSuccess('🏠 Booking request submitted successfully!', 'Booking Submitted');
  }, [showSuccess]);

  const showComplaintSent = React.useCallback(() => {
    showSuccess('📨 Your complaint has been sent successfully', 'Complaint Sent');
  }, [showSuccess]);

  return {
    snackbarState,
    showSnackbar,
    hideSnackbar,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    // Preset methods
    showFavoriteAdded,
    showFavoriteRemoved,
    showRatingSubmitted,
    showBookingSuccess,
    showComplaintSent,
    // Component props for easy integration
    snackbarProps: {
      open: snackbarState.open,
      message: snackbarState.message,
      severity: snackbarState.severity,
      title: snackbarState.title,
      onClose: hideSnackbar,
    },
  };
};

// Export both the component and the hook
export default AppSnackbar;