import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Link, 
  Card, 
  CardContent, 
  Alert,
  CircularProgress 
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginApi } from '../api/loginApi';
import RoleSelection from '../components/common/RoleSelection';
import { useTheme } from '../contexts/ThemeContext';
import { loginUser, resendEmailVerification } from '../api/authApi';
import AppSnackbar from '../components/common/AppSnackbar';

const Login = () => {
  const [step, setStep] = useState(1); 
  const [selectedRole, setSelectedRole] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, isDark } = useTheme();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  
  const [verificationError, setVerificationError] = useState(null);
const [resendingVerification, setResendingVerification] = useState(false);

  // Get return URL from query parameters
  const queryParams = new URLSearchParams(location.search);
  const returnUrl = queryParams.get('returnUrl');

  useEffect(() => {
    // If user is already logged in, redirect them appropriately
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (token && userRole) {
      handleSuccessfulLogin(userRole);
    }
  }, [returnUrl]);

  const handleRoleNext = () => {
    setStep(2);
  };

  const handleSuccessfulLogin = (userRole) => {
    if (returnUrl) {
      // Decode the return URL and navigate back
      const decodedReturnUrl = decodeURIComponent(returnUrl);
      navigate(decodedReturnUrl);
    } else {
      // Default navigation based on role
      switch (userRole) {
        case 'user':
          navigate('/user-home');
          break;
        case 'propertyowner':
          navigate('/home');
          break;
        case 'admin':
          navigate('/admin/home');
          break;
        default:
          navigate('/user-home');
      }
    }
  };

  const handleLoginSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');
  setVerificationError(null);
  
  try {
    const data = await loginApi({ username, password });
    console.log('Login successful:', data);
    
    if (data.user.role !== selectedRole) {
      setError(
        `Role mismatch. You selected "${selectedRole}" but your account is "${data.user.role}".`
      );
      setSnackbar({
        open: true,
        message: 'Role mismatch. Please select the correct role for your account.',
        severity: 'error'
      });
      return;
    }
    
    // Save token and user role
    localStorage.setItem('token', data.token);
    localStorage.setItem('userRole', data.user.role);
    
    // Set expiry to 8 hours from now
    const expiryTime = Date.now() + 8 * 60 * 60 * 1000;
    localStorage.setItem('tokenExpiry', expiryTime);
    
    // Show success message
    setSnackbar({
      open: true,
      message: 'Login successful! Welcome back.',
      severity: 'success'
    });
    
    // Handle successful login with potential redirect
    setTimeout(() => {
      handleSuccessfulLogin(data.user.role);
    }, 1000);
    
  } catch (err) {
    console.error(err);
    
    // Handle rate limiting (429 error)
    if (err.response?.status === 429 || err.status === 429) {
      const errorData = err.response?.data || {};
      const message = `${errorData.message || 'Too many login attempts'}. Please wait ${errorData.retryAfter || '15 minutes'} before trying again.`;
      setError(message);
      setSnackbar({
        open: true,
        message: 'Too many login attempts. Please wait before trying again.',
        severity: 'warning'
      });
    }
    // Handle email verification error (403)
    else if (err.response?.status === 403 && err.response?.data?.requiresVerification) {
      setVerificationError({
        email: err.response.data.email,
        message: err.response.data.message
      });
      setSnackbar({
        open: true,
        message: 'Please verify your email address before logging in.',
        severity: 'warning'
      });
    }
    // Handle other errors  
    else {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed. Check your credentials.';
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: 'Login failed. Please check your credentials and try again.',
        severity: 'error'
      });
    }
  } finally {
    setIsLoading(false);
  }
};

const handleResendVerification = async () => {
  if (!verificationError?.email) return;

  setResendingVerification(true);
  setError('');
  
  try {
    await resendEmailVerification(verificationError.email);
    setError('');
    setVerificationError(null);
    setSnackbar({
      open: true,
      message: 'Verification email sent! Please check your email and verify before logging in.',
      severity: 'success'
    });
  } catch (error) {
    setError('Failed to resend verification email. Please try again.');
  } finally {
    setResendingVerification(false);
  }
};

  return (
    <>
    <Box
      sx={{
        minHeight: '100vh',
        // Creating a sophisticated background that adapts to the current theme
        background: isDark 
          ? `linear-gradient(135deg, ${theme.background} 0%, ${theme.surfaceBackground} 100%)`
          : `linear-gradient(135deg, ${theme.background} 0%, ${theme.primary}10 50%, ${theme.background} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        // Smooth transitions make theme changes feel professional
        transition: 'background 0.5s ease',
      }}
    >
      <Container maxWidth="sm">
        <Card
          elevation={0}
          sx={{
            // Using theme properties for consistent styling across components
            backgroundColor: theme.cardBackground,
            // Professional shadow that adapts to the theme
            boxShadow: isDark ? theme.shadows.heavy : theme.shadows.medium,
            borderRadius: 3,
            border: `1px solid ${theme.border}`,
            // Subtle animations enhance the user experience
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: theme.shadows.heavy,
            },
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Page Header with Theme-Aware Typography */}
            <Typography 
              variant="h4" 
              align="center" 
              gutterBottom
              sx={{
                color: theme.textPrimary,
                fontWeight: 600,
                mb: 1,
                // Subtle text shadow for better readability
                textShadow: isDark ? 'none' : '0 1px 2px rgba(0,0,0,0.1)',
              }}
            >
              Welcome Back
            </Typography>
            
            <Typography 
              variant="body1" 
              align="center" 
              sx={{ 
                color: theme.textSecondary, 
                mb: 4,
                fontSize: '1.1rem',
              }}
            >
              Sign in to access your StayWise.lk account
            </Typography>

            {/* Return URL Notice */}
            {returnUrl && (
              <Alert 
                severity="info" 
                sx={{ 
                  mb: 3,
                  backgroundColor: isDark ? `${theme.info}20` : `${theme.info}10`,
                  color: theme.info,
                  borderColor: theme.info,
                  '& .MuiAlert-icon': {
                    color: theme.info,
                  },
                }}
              >
                You'll be redirected back to the property page after login.
              </Alert>
            )}

            {/* Error Display with Theme-Appropriate Styling */}
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  // Ensuring error messages are visible in both themes
                  backgroundColor: isDark ? `${theme.error}20` : `${theme.error}10`,
                  color: theme.error,
                  borderColor: theme.error,
                  '& .MuiAlert-icon': {
                    color: theme.error,
                  },
                }}
              >
                {error}
              </Alert>
            )}

            {/* Step 1: Role Selection */}
            {step === 1 && (
              <RoleSelection
                selectedRole={selectedRole}
                setSelectedRole={setSelectedRole}
                onNext={handleRoleNext}
              />
            )}

            {/* Step 2: Login Form */}
            {step === 2 && (
              <Box
                component="form"
                onSubmit={handleLoginSubmit}
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 3,
                  alignItems: 'center' 
                }}
              >
                {/* Username Input with Theming */}
                <TextField
                  label="Username"
                  variant="outlined"
                  fullWidth
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  sx={{
                    // Custom styling for better theme integration
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: theme.inputBackground,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: isDark ? theme.surfaceBackground : theme.inputBackground,
                      },
                      '&.Mui-focused': {
                        backgroundColor: theme.inputBackground,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.primary,
                          borderWidth: 2,
                        },
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: theme.textSecondary,
                      '&.Mui-focused': {
                        color: theme.primary,
                      },
                    },
                  }}
                />

                {/* Password Input with Theme Consistency */}
                <TextField
                  label="Password"
                  variant="outlined"
                  type="password"
                  fullWidth
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: theme.inputBackground,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: isDark ? theme.surfaceBackground : theme.inputBackground,
                      },
                      '&.Mui-focused': {
                        backgroundColor: theme.inputBackground,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.primary,
                          borderWidth: 2,
                        },
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: theme.textSecondary,
                      '&.Mui-focused': {
                        color: theme.primary,
                      },
                    },
                  }}
                />
                
                {verificationError && (
  <Alert 
    severity="warning" 
    sx={{ mt: 2 }}
    action={
      <Button 
        color="inherit" 
        size="small" 
        onClick={handleResendVerification}
        disabled={resendingVerification}
        sx={{ color: 'inherit' }}
      >
        {resendingVerification ? (
          <CircularProgress size={16} color="inherit" />
        ) : (
          'Resend Email'
        )}
      </Button>
    }
  >
    {verificationError.message}
  </Alert>
)}

                {/* Login Button with Loading State and Theme Integration */}
                <Button 
                  type="submit" 
                  variant="contained" 
                  fullWidth
                  disabled={isLoading}
                  sx={{ 
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    backgroundColor: theme.primary,
                    color: isDark ? theme.textPrimary : '#FFFFFF',
                    '&:hover': {
                      backgroundColor: isDark ? theme.secondary : theme.primary,
                      transform: 'translateY(-1px)',
                      boxShadow: theme.shadows.medium,
                    },
                    '&:disabled': {
                      backgroundColor: theme.textDisabled,
                      color: theme.textSecondary,
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isLoading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CircularProgress size={20} color="inherit" />
                      Signing In...
                    </Box>
                  ) : (
                    'Sign In'
                  )}
                </Button>

                {/* Navigation Links with Theme-Aware Styling */}
                <Link
                  component="button"
                  variant="body2"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/forgot-password');
                  }}
                  sx={{ 
                    color: theme.primary,
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                      color: theme.secondary,
                    },
                    transition: 'color 0.2s ease',
                  }}
                >
                  Forgot your password?
                </Link>

                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: theme.textSecondary,
                    textAlign: 'center',
                  }}
                >
                  Don't have an account?{' '}
                  <Link 
                    component="button" 
                    variant="body2" 
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/signup');
                    }}
                    sx={{
                      color: theme.primary,
                      fontWeight: 600,
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                        color: theme.secondary,
                      },
                      transition: 'color 0.2s ease',
                    }}
                  >
                    Sign up here
                  </Link>
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Back Navigation for Step 2 */}
        {step === 2 && (
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button
              variant="text"
              onClick={() => setStep(1)}
              sx={{
                color: theme.textSecondary,
                '&:hover': {
                  color: theme.primary,
                  backgroundColor: 'transparent',
                },
              }}
            >
              ← Back to role selection
            </Button>
          </Box>
        )}

        {/* Guest Access Notice */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" sx={{ color: theme.textSecondary, mb: 2 }}>
            Just browsing? 
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate('/user-home')}
            sx={{
              borderColor: theme.textSecondary,
              color: theme.textSecondary,
              '&:hover': {
                borderColor: theme.primary,
                color: theme.primary,
                backgroundColor: `${theme.primary}05`,
              },
            }}
          >
            Continue as Guest
          </Button>
        </Box>
      </Container>
    </Box>
    <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      />
      </>
  );
};

export default Login;