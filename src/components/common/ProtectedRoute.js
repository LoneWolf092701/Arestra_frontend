import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { CircularProgress, Box, Typography } from '@mui/material';
import { isAuthenticated, getUserRole, getTimeUntilExpiry } from '../../utils/auth';
import { validateToken } from '../../api/authApi';

/**
 * ProtectedRoute Component
 * This component ensures that only authenticated users can access protected pages
 * It also handles token validation and provides loading states during authentication checks
 */
const ProtectedRoute = ({ 
  children, 
  element, 
  requireAuth = true, 
  showLoadingSpinner = true,
  fallbackPath = '/login'
}) => {
  const [isValidating, setIsValidating] = useState(true);
  const [authValid, setAuthValid] = useState(false);
  const [tokenExpiring, setTokenExpiring] = useState(false);
  const location = useLocation();

  // Use either children prop or element prop for flexibility
  const componentToRender = children || element;

  useEffect(() => {
    let isMounted = true;
    
    const validateAuthentication = async () => {
      try {
        if (!requireAuth) {
          setAuthValid(true);
          setIsValidating(false);
          return;
        }

        const localAuthCheck = isAuthenticated();
        
        if (!localAuthCheck) {
          setAuthValid(false);
          setIsValidating(false);
          return;
        }

        // Check if token is expiring soon
        const minutesUntilExpiry = getTimeUntilExpiry();
        if (minutesUntilExpiry !== -1 && minutesUntilExpiry <= 5) {
          setTokenExpiring(true);
        }

        // Validate token with server for critical routes
        const criticalRoutes = ['/admin', '/my-properties', '/profile'];
        const isCriticalRoute = criticalRoutes.some(route => 
          location.pathname.startsWith(route)
        );

        if (isCriticalRoute) {
          try {
            await validateToken();
            if (isMounted) {
              setAuthValid(true);
            }
          } catch (error) {
            console.error('Token validation failed:', error);
            if (isMounted) {
              setAuthValid(false);
            }
          }
        } else {
          setAuthValid(true);
        }
      } catch (error) {
        console.error('Authentication validation error:', error);
        if (isMounted) {
          setAuthValid(false);
        }
      } finally {
        if (isMounted) {
          setIsValidating(false);
        }
      }
    };

    validateAuthentication();

    return () => {
      isMounted = false;
    };
  }, [requireAuth, location.pathname]);

  // Show loading spinner during validation if enabled
  if (isValidating && showLoadingSpinner) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
        gap={2}
      >
        <CircularProgress size={40} />
        <Typography variant="body2" color="textSecondary">
          Verifying authentication...
        </Typography>
      </Box>
    );
  }

  // Redirect if not authenticated and auth is required
  if (requireAuth && !authValid) {
    return (
      <Navigate 
        to={fallbackPath} 
        state={{ from: location.pathname }}
        replace 
      />
    );
  }

  // Show token expiring warning if applicable
  if (tokenExpiring && authValid) {
    return (
      <Box sx={{ position: 'relative' }}>
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: 'warning.main',
            color: 'warning.contrastText',
            padding: 1,
            textAlign: 'center',
            zIndex: 9999,
            fontSize: '0.875rem'
          }}
        >
          Your session will expire soon. Please save your work and refresh the page to extend your session.
        </Box>
        <Box sx={{ marginTop: '48px' }}>
          {componentToRender}
        </Box>
      </Box>
    );
  }

  // Render the protected component
  return componentToRender;
};

export default ProtectedRoute;