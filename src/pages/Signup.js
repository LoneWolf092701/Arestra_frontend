import React, { useState, useContext } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Tabs, 
  Tab, 
  Card, 
  CardContent,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../api';
import { ThemeContext } from '../contexts/ThemeContext';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`signup-tabpanel-${index}`}
      aria-labelledby={`signup-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const a11yProps = (index) => {
  return {
    id: `signup-tab-${index}`,
    'aria-controls': `signup-tabpanel-${index}`,
  };
};

const Signup = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);

  const [tenantForm, setTenantForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: ''
  });

  const [ownerForm, setOwnerForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    contactPerson: '',
    phone: '',
    address: ''
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError('');
    setSuccess('');
  };

  const handleTenantChange = (field) => (event) => {
    setTenantForm(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setError('');
  };

  const handleOwnerChange = (field) => (event) => {
    setOwnerForm(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setError('');
  };

  const validateForm = () => {
    const currentForm = activeTab === 0 ? tenantForm : ownerForm;
    
    const requiredFields = activeTab === 0 
      ? ['username', 'email', 'password', 'confirmPassword', 'firstName', 'lastName']
      : ['username', 'email', 'password', 'confirmPassword', 'businessName', 'contactPerson'];
    
    for (const field of requiredFields) {
      if (!currentForm[field] || currentForm[field].trim() === '') {
        setError(`Please fill in all required fields`);
        return false;
      }
    }

    if (currentForm.password !== currentForm.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (currentForm.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(currentForm.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const currentForm = activeTab === 0 ? tenantForm : ownerForm;
      const userRole = activeTab === 0 ? 'user' : 'propertyowner';
      
      const userData = {
        username: currentForm.username,
        email: currentForm.email,
        password: currentForm.password,
        role: userRole,
        profile: activeTab === 0 ? {
          first_name: currentForm.firstName,
          last_name: currentForm.lastName,
          phone: currentForm.phone
        } : {
          business_name: currentForm.businessName,
          contact_person: currentForm.contactPerson,
          phone: currentForm.phone,
          business_address: currentForm.address
        }
      };

      const response = await registerUser(userData);
      
      if (response.success) {
        setSuccess('Account created successfully! Please check your email for verification.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(response.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'An error occurred during registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Card sx={{ 
        boxShadow: 4, 
        borderRadius: 3,
        background: theme.cardBackground || '#ffffff'
      }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ textAlign: 'center', py: 3, px: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: theme.primary }}>
              Create Your Account
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Join StayWise and start your journey
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mx: 3, mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mx: 3, mb: 2 }}>
              {success}
            </Alert>
          )}

          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
              }
            }}
          >
            <Tab 
              icon={<PersonIcon />} 
              label="I'm looking for a place" 
              {...a11yProps(0)}
              sx={{ flex: 1 }}
            />
            <Tab 
              icon={<HomeIcon />} 
              label="I want to list my property" 
              {...a11yProps(1)}
              sx={{ flex: 1 }}
            />
          </Tabs>

          <TabPanel value={activeTab} index={0}>
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                label="Username"
                variant="outlined"
                fullWidth
                required
                margin="normal"
                value={tenantForm.username}
                onChange={handleTenantChange('username')}
              />
              
              <TextField
                label="Email Address"
                variant="outlined"
                type="email"
                fullWidth
                required
                margin="normal"
                value={tenantForm.email}
                onChange={handleTenantChange('email')}
              />
              
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <TextField
                  label="First Name"
                  variant="outlined"
                  fullWidth
                  required
                  value={tenantForm.firstName}
                  onChange={handleTenantChange('firstName')}
                />
                
                <TextField
                  label="Last Name"
                  variant="outlined"
                  fullWidth
                  required
                  value={tenantForm.lastName}
                  onChange={handleTenantChange('lastName')}
                />
              </Box>
              
              <TextField
                label="Phone Number"
                variant="outlined"
                fullWidth
                margin="normal"
                value={tenantForm.phone}
                onChange={handleTenantChange('phone')}
                helperText="Optional - helps property owners contact you"
              />
              
              <TextField
                label="Password"
                variant="outlined"
                type="password"
                fullWidth
                required
                margin="normal"
                value={tenantForm.password}
                onChange={handleTenantChange('password')}
                helperText="Minimum 6 characters"
              />
              
              <TextField
                label="Confirm Password"
                variant="outlined"
                type="password"
                fullWidth
                required
                margin="normal"
                value={tenantForm.confirmPassword}
                onChange={handleTenantChange('confirmPassword')}
              />
              
              <Button 
                type="submit" 
                variant="contained" 
                fullWidth
                disabled={isLoading}
                sx={{ 
                  mt: 3, 
                  mb: 2, 
                  backgroundColor: theme.primary,
                  '&:hover': {
                    backgroundColor: theme.secondary
                  },
                  height: 48
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Create Tenant Account'
                )}
              </Button>
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                label="Username"
                variant="outlined"
                fullWidth
                required
                margin="normal"
                value={ownerForm.username}
                onChange={handleOwnerChange('username')}
              />
              
              <TextField
                label="Email Address"
                variant="outlined"
                type="email"
                fullWidth
                required
                margin="normal"
                value={ownerForm.email}
                onChange={handleOwnerChange('email')}
              />
              
              <TextField
                label="Business Name"
                variant="outlined"
                fullWidth
                required
                margin="normal"
                value={ownerForm.businessName}
                onChange={handleOwnerChange('businessName')}
                helperText="Name of your property business or company"
              />
              
              <TextField
                label="Contact Person"
                variant="outlined"
                fullWidth
                required
                margin="normal"
                value={ownerForm.contactPerson}
                onChange={handleOwnerChange('contactPerson')}
                helperText="Primary contact person name"
              />
              
              <TextField
                label="Phone Number"
                variant="outlined"
                fullWidth
                required
                margin="normal"
                value={ownerForm.phone}
                onChange={handleOwnerChange('phone')}
                helperText="Business contact number"
              />
              
              <TextField
                label="Business Address"
                variant="outlined"
                fullWidth
                margin="normal"
                value={ownerForm.address}
                onChange={handleOwnerChange('address')}
                helperText="Optional - your main business address"
              />
              
              <TextField
                label="Password"
                variant="outlined"
                type="password"
                fullWidth
                required
                margin="normal"
                value={ownerForm.password}
                onChange={handleOwnerChange('password')}
                helperText="Minimum 6 characters"
              />
              
              <TextField
                label="Confirm Password"
                variant="outlined"
                type="password"
                fullWidth
                required
                margin="normal"
                value={ownerForm.confirmPassword}
                onChange={handleOwnerChange('confirmPassword')}
              />
              
              <Button 
                type="submit" 
                variant="contained" 
                fullWidth
                disabled={isLoading}
                sx={{ 
                  mt: 3, 
                  mb: 2, 
                  backgroundColor: theme.primary,
                  '&:hover': {
                    backgroundColor: theme.secondary
                  },
                  height: 48
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Create Property Owner Account'
                )}
              </Button>
            </Box>
          </TabPanel>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" sx={{ color: theme.text }}>
              Already have an account?{' '}
              <Button
                variant="text"
                onClick={() => navigate('/login')}
                sx={{ 
                  textTransform: 'none',
                  color: theme.primary,
                  fontWeight: 'bold'
                }}
              >
                Log In
              </Button>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Signup;