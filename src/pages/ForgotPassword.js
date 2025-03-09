import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Step 1: Verify email
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email.');
      return;
    }
    setError('');
    // Simulate sending a verification code via email
    setStep(2);
  };

  // Step 2: Enter verification code
  const handleCodeSubmit = (e) => {
    e.preventDefault();
    // Simulate verification
    if (verificationCode !== '123456') {
      setError('Invalid verification code.');
      return;
    }
    setError('');
    setStep(3);
  };

  // Step 3: Set new password
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    // Simulate updating the password via an API call.
    navigate('/login');
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Forgot Password
      </Typography>
      {step === 1 && (
        <Box component="form" onSubmit={handleEmailSubmit} sx={{ mt: 2 }}>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            required
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 3 }}>
            Next
          </Button>
        </Box>
      )}
      {step === 2 && (
        <Box component="form" onSubmit={handleCodeSubmit} sx={{ mt: 2 }}>
          <TextField
            label="Verification Code"
            variant="outlined"
            fullWidth
            required
            margin="normal"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
          />
          {error && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 3 }}>
            Next
          </Button>
        </Box>
      )}
      {step === 3 && (
        <Box component="form" onSubmit={handlePasswordSubmit} sx={{ mt: 2 }}>
          <TextField
            label="New Password"
            variant="outlined"
            type="password"
            fullWidth
            required
            margin="normal"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <TextField
            label="Confirm Password"
            variant="outlined"
            type="password"
            fullWidth
            required
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {error && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 3 }}>
            Confirm
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default ForgotPassword;
