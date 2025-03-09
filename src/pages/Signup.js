import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { registerApi } from '../api/loginApi';
import RoleSelection from '../components/common/RoleSelection';

const Signup = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRoleNext = () => {
    setStep(2);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const data = await registerApi({ username, password, role: selectedRole });
      console.log('Signup successful:', data);
      navigate('/login');
    } catch (err) {
      console.error(err);
      setError('Signup failed. Please try again.');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Signup
      </Typography>
      {step === 1 && (
        <RoleSelection
          selectedRole={selectedRole}
          setSelectedRole={setSelectedRole}
          onNext={handleRoleNext}
        />
      )}
      {step === 2 && (
        <Box
          component="form"
          onSubmit={handleSignup}
          sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            required
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            fullWidth
            required
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 3 }}>
            Signup
          </Button>
          <Typography variant='body2' sx={{ mt: 2 }}>Already have an account? <a href="/login">Login</a></Typography>
        </Box>
      )}
    </Container>
  );
};

export default Signup;
