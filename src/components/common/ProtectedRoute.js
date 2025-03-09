import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppSnackbar from './AppSnackbar';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const expiry = localStorage.getItem('tokenExpiry');
    // If a token exists and its expiry timestamp has passed...
    if (token && expiry && Date.now() > parseInt(expiry, 10)) {
      // Clear stored token data
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiry');
      setSnackbarOpen(true);
      // Redirect to login after a brief delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  }, [navigate]);

  return (
    <>
      {snackbarOpen && (
        <AppSnackbar
          open={snackbarOpen}
          message="Token expired. Please login again."
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
        />
      )}
      {children}
    </>
  );
};

export default ProtectedRoute;
