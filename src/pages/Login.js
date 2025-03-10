import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { loginApi } from '../api/loginApi';
import RoleSelection from '../components/common/RoleSelection';

const Login = () => {
  const [step, setStep] = useState(1); 
  const [selectedRole, setSelectedRole] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRoleNext = () => {
    setStep(2);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await loginApi({ username, password });
      console.log('Login successful:', data);
      if (data.user.role !== selectedRole) {
        setError(
          `Role mismatch. You selected "${selectedRole}" but your account is "${data.user.role}".`
        );
        return;
      }
      // Save token and user role
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.user.role);
      navigate(data.user.role === "user" ? '/user/home' : data.user.role === "admin" ? '/admin/home' : '/home');
    } catch (err) {
      console.error(err);
      setError('Login failed. Check your credentials.');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Login
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
          onSubmit={handleLoginSubmit}
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
            Login
          </Button>
          <Link
            component="button"
            variant="body2"
            onClick={(e) => {
              e.preventDefault();
              navigate('/forgot-password')}}
            sx={{ mt: 2 }}
          >
            Forgot Password?
          </Link>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Don't have an account?{' '}
            <Link component="button" variant="body2" onClick={(e) => {
              e.preventDefault();
              navigate('/signup')}}>
              Signup
            </Link>
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Login;
