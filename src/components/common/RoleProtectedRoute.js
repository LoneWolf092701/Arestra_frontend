import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { CircularProgress, Box, Typography, Alert, Button } from '@mui/material';
import { 
  isAuthenticated, 
  getUserRole, 
  hasRole, 
  getHomePathForRole,
  getRoleDisplayName 
} from '../../utils/auth';

/**
 * RoleProtectedRoute Component
 * This component provides role-based access control for protected routes
 * It ensures users can only access pages appropriate for their role level
 */
const RoleProtectedRoute = ({ 
  children, 
  element, 
  allowedRoles = [], 
  requireAuth = true,
  showLoadingSpinner = true,
  showAccessDeniedMessage = true,
  fallbackPath = null,
  adminOverride = false
}) => {
  const [isValidating, setIsValidating] = useState(true);
  const [authStatus, setAuthStatus] = useState({
    isAuthenticated: false,
    userRole: null,
    hasAccess: false,
    error: null
  });
  const location = useLocation();

  // Use either children prop or element prop for flexibility
  const componentToRender = children || element;

  useEffect(() => {
    let isMounted = true;
    
    const validateRoleAccess = async () => {
      try {
        if (!requireAuth) {
          if (isMounted) {
            setAuthStatus({
              isAuthenticated: true,
              userRole: null,
              hasAccess: true,
              error: null
            });
            setIsValidating(false);
          }
          return;
        }

        const authenticated = isAuthenticated();
        const userRole = getUserRole();

        if (!authenticated) {
          if (isMounted) {
            setAuthStatus({
              isAuthenticated: false,
              userRole: null,
              hasAccess: false,
              error: 'Authentication required'
            });
            setIsValidating(false);
          }
          return;
        }

        if (!userRole) {
          if (isMounted) {
            setAuthStatus({
              isAuthenticated: true,
              userRole: null,
              hasAccess: false,
              error: 'User role not found'
            });
            setIsValidating(false);
          }
          return;
        }

        // Check if user has required role
        let hasAccess = false;
        
        if (allowedRoles.length === 0) {
          hasAccess = true;
        } else if (adminOverride && userRole === 'admin') {
          hasAccess = true;
        } else {
          hasAccess = hasRole(allowedRoles);
        }

        if (isMounted) {
          setAuthStatus({
            isAuthenticated: true,
            userRole,
            hasAccess,
            error: hasAccess ? null : 'Insufficient permissions'
          });
          setIsValidating(false);
        }
      } catch (error) {
        console.error('Role validation error:', error);
        if (isMounted) {
          setAuthStatus({
            isAuthenticated: false,
            userRole: null,
            hasAccess: false,
            error: 'Validation failed'
          });
          setIsValidating(false);
        }
      }
    };

    validateRoleAccess();

    return () => {
      isMounted = false;
    };
  }, [allowedRoles, requireAuth, adminOverride, location.pathname]);

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
          Checking permissions...
        </Typography>
      </Box>
    );
  }

  // Handle authentication failure
  if (!authStatus.isAuthenticated) {
    const redirectPath = fallbackPath || '/login';
    return (
      <Navigate 
        to={redirectPath} 
        state={{ 
          from: location.pathname,
          message: 'Please log in to access this page'
        }}
        replace 
      />
    );
  }

  // Handle insufficient permissions
  if (!authStatus.hasAccess) {
    // Determine redirect path based on user role
    const redirectPath = fallbackPath || getHomePathForRole(authStatus.userRole);
    
    if (showAccessDeniedMessage) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            padding: 3,
            textAlign: 'center'
          }}
        >
          <Alert 
            severity="warning" 
            sx={{ 
              maxWidth: 600, 
              mb: 3,
              '& .MuiAlert-message': {
                width: '100%'
              }
            }}
          >
            <Typography variant="h6" gutterBottom>
              Access Denied
            </Typography>
            <Typography variant="body1" paragraph>
              You don't have permission to access this page.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Your role: <strong>{getRoleDisplayName(authStatus.userRole)}</strong>
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Required role(s): <strong>
                  {allowedRoles.map(role => getRoleDisplayName(role)).join(', ')}
                </strong>
              </Typography>
            </Box>
          </Alert>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              variant="contained"
              onClick={() => window.location.href = redirectPath}
              sx={{ minWidth: 120 }}
            >
              Go to Home
            </Button>
            <Button
              variant="outlined"
              onClick={() => window.history.back()}
              sx={{ minWidth: 120 }}
            >
              Go Back
            </Button>
          </Box>
          
          {process.env.NODE_ENV === 'development' && (
            <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="caption" color="textSecondary">
                Debug Info: {authStatus.error || 'Role mismatch'}
              </Typography>
            </Box>
          )}
        </Box>
      );
    } else {
      return (
        <Navigate 
          to={redirectPath} 
          state={{ 
            from: location.pathname,
            message: 'Access denied. Insufficient permissions.'
          }}
          replace 
        />
      );
    }
  }

  // User has access - render the protected component
  return componentToRender;
};

/**
 * Higher-order component wrapper for role-based protection
 * This provides a more convenient way to wrap components with role protection
 */
export const withRoleProtection = (Component, allowedRoles, options = {}) => {
  return (props) => (
    <RoleProtectedRoute allowedRoles={allowedRoles} {...options}>
      <Component {...props} />
    </RoleProtectedRoute>
  );
};

/**
 * Hook for checking role access in components
 * This provides a way to conditionally render content based on role permissions
 */
export const useRoleAccess = (requiredRoles = []) => {
  const [roleAccess, setRoleAccess] = useState({
    hasAccess: false,
    userRole: null,
    isLoading: true
  });

  useEffect(() => {
    const checkAccess = () => {
      const userRole = getUserRole();
      const authenticated = isAuthenticated();
      
      if (!authenticated) {
        setRoleAccess({
          hasAccess: false,
          userRole: null,
          isLoading: false
        });
        return;
      }

      const access = requiredRoles.length === 0 || hasRole(requiredRoles);
      
      setRoleAccess({
        hasAccess: access,
        userRole,
        isLoading: false
      });
    };

    checkAccess();
  }, [requiredRoles]);

  return roleAccess;
};

export default RoleProtectedRoute;