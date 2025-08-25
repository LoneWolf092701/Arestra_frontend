import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Paper
} from '@mui/material';
import { CheckCircle, Error, Email } from '@mui/icons-material';
import { verifyEmail, resendEmailVerification } from '../api/authApi';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const emailParam = searchParams.get('email');
    
    if (emailParam) {
      setEmail(emailParam);
    }

    if (token) {
      handleVerification(token);
    } else {
      setVerificationStatus('no-token');
      setMessage('No verification token provided');
    }
  }, [searchParams]);

  const handleVerification = async (token) => {
    try {
      const result = await verifyEmail(token);
      if (result.success) {
        setVerificationStatus('success');
        setMessage('Your email has been verified successfully!');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setVerificationStatus('error');
        setMessage(result.message || 'Verification failed');
      }
    } catch (error) {
      setVerificationStatus('error');
      setMessage(error.message || 'An error occurred during verification');
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setMessage('Please provide your email address to resend verification');
      return;
    }

    setIsResending(true);
    try {
      const result = await resendEmailVerification(email);
      if (result.success) {
        setMessage('Verification email sent successfully. Please check your email.');
      } else {
        setMessage(result.message || 'Failed to resend verification email');
      }
    } catch (error) {
      setMessage(error.message || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'success':
        return <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />;
      case 'error':
      case 'no-token':
        return <Error sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />;
      case 'verifying':
      default:
        return <Email sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />;
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'success':
        return 'success';
      case 'error':
      case 'no-token':
        return 'error';
      default:
        return 'info';
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box textAlign="center">
          {getStatusIcon()}
          
          <Typography variant="h4" gutterBottom>
            Email Verification
          </Typography>

          {verificationStatus === 'verifying' && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
              <CircularProgress size={24} sx={{ mr: 2 }} />
              <Typography variant="body1">
                Verifying your email address...
              </Typography>
            </Box>
          )}

          {message && (
            <Alert severity={getStatusColor()} sx={{ mb: 3, textAlign: 'left' }}>
              {message}
            </Alert>
          )}

          {verificationStatus === 'success' && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" color="success.main" gutterBottom>
                Welcome to StayWise! Your account is now active.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You will be redirected to the login page in a few seconds...
              </Typography>
            </Box>
          )}

          {(verificationStatus === 'error' || verificationStatus === 'no-token') && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" gutterBottom>
                Don't worry, you can request a new verification email.
              </Typography>
              
              <Button
                variant="contained"
                onClick={handleResendVerification}
                disabled={isResending}
                sx={{ mt: 2, mr: 2 }}
                startIcon={isResending ? <CircularProgress size={20} /> : <Email />}
              >
                {isResending ? 'Sending...' : 'Resend Verification Email'}
              </Button>
            </Box>
          )}

          <Box sx={{ mt: 4 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/login')}
              sx={{ mr: 2 }}
            >
              Go to Login
            </Button>
            
            <Button
              variant="text"
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default EmailVerification;