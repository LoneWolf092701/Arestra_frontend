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
import { registerApi } from '../api/loginApi';
import { ThemeContext } from '../contexts/ThemeContext';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';

// Custom TabPanel component to handle tab content
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

// Properties for tab accessibility
const a11yProps = (index) => {
  return {
    id: `signup-tab-${index}`,
    'aria-controls': `signup-tabpanel-${index}`,
  };
};

const Signup = () => {
  const [activeTab, setActiveTab] = useState(0); // 0 for tenant, 1 for property owner
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);

  // Form states for tenant signup
  const [tenantForm, setTenantForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: ''
  });

  // Form states for property owner signup
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

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError(''); // Clear errors when switching tabs
    setSuccess('');
  };

  // Update tenant form fields
  const handleTenantChange = (field) => (event) => {
    setTenantForm(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setError(''); // Clear error when user starts typing
  };

  // Update property owner form fields
  const handleOwnerChange = (field) => (event) => {
    setOwnerForm(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setError(''); // Clear error when user starts typing
  };

  // Validate form based on current tab
  const validateForm = () => {
    const currentForm = activeTab === 0 ? tenantForm : ownerForm;
    
    // Check required fields
    const requiredFields = activeTab === 0 
      ? ['username', 'email', 'password', 'confirmPassword', 'firstName', 'lastName']
      : ['username', 'email', 'password', 'confirmPassword', 'businessName', 'contactPerson'];
    
    for (let field of requiredFields) {
      if (!currentForm[field].trim()) {
        setError(`Please fill in all required fields`);
        return false;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(currentForm.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Password validation
    if (currentForm.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    // Confirm password
    if (currentForm.password !== currentForm.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const currentForm = activeTab === 0 ? tenantForm : ownerForm;
      const role = activeTab === 0 ? 'user' : 'propertyowner';
      
      // Prepare data for API
      const signupData = {
        username: currentForm.username,
        email: currentForm.email,
        password: currentForm.password,
        role: role,
        // Additional data can be sent here if your API supports it
        ...(activeTab === 0 ? {
          firstName: currentForm.firstName,
          lastName: currentForm.lastName,
          phone: currentForm.phone
        } : {
          businessName: currentForm.businessName,
          contactPerson: currentForm.contactPerson,
          phone: currentForm.phone,
          address: currentForm.address
        })
      };

      const response = await registerApi(signupData);
      console.log('Signup successful:', response);
      
      setSuccess('Account created successfully! Redirecting to login...');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6, mb: 4 }}>
      <Card elevation={3} sx={{ backgroundColor: theme.cardBackground }}>
        <CardContent>
          <Typography variant="h4" align="center" gutterBottom sx={{ color: theme.primary, fontWeight: 'bold' }}>
            Create Your Account
          </Typography>
          
          <Typography variant="body1" align="center" sx={{ mb: 3, color: theme.text }}>
            Join StayWise.lk and start your journey today
          </Typography>

          {/* Tab Navigation */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              aria-label="signup tabs"
              centered
              sx={{
                '& .MuiTab-root': {
                  color: theme.text,
                  fontWeight: 'bold'
                },
                '& .Mui-selected': {
                  color: theme.primary + ' !important'
                }
              }}
            >
              <Tab 
                icon={<PersonIcon />} 
                label="I'm looking for a place" 
                {...a11yProps(0)} 
                sx={{ textTransform: 'none', fontSize: '1rem' }}
              />
              <Tab 
                icon={<HomeIcon />} 
                label="I have properties to rent" 
                {...a11yProps(1)} 
                sx={{ textTransform: 'none', fontSize: '1rem' }}
              />
            </Tabs>
          </Box>

          {/* Success Message */}
          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {success}
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {/* Tenant Signup Form */}
          <TabPanel value={activeTab} index={0}>
            <Typography variant="h6" gutterBottom sx={{ color: theme.primary }}>
              Sign up as a Tenant
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: theme.text }}>
              Find your perfect home with ease
            </Typography>
            
            <Box component="form" onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
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
                label="Username"
                variant="outlined"
                fullWidth
                required
                margin="normal"
                value={tenantForm.username}
                onChange={handleTenantChange('username')}
                helperText="This will be used to log in to your account"
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
              
              <TextField
                label="Phone Number"
                variant="outlined"
                fullWidth
                margin="normal"
                value={tenantForm.phone}
                onChange={handleTenantChange('phone')}
                helperText="Optional - for property owner contact"
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

          {/* Property Owner Signup Form */}
          <TabPanel value={activeTab} index={1}>
            <Typography variant="h6" gutterBottom sx={{ color: theme.primary }}>
              Sign up as a Property Owner
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: theme.text }}>
              List your properties and connect with tenants
            </Typography>
            
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                label="Business/Property Name"
                variant="outlined"
                fullWidth
                required
                margin="normal"
                value={ownerForm.businessName}
                onChange={handleOwnerChange('businessName')}
                helperText="Name of your business or main property"
              />
              
              <TextField
                label="Contact Person Name"
                variant="outlined"
                fullWidth
                required
                margin="normal"
                value={ownerForm.contactPerson}
                onChange={handleOwnerChange('contactPerson')}
              />
              
              <TextField
                label="Username"
                variant="outlined"
                fullWidth
                required
                margin="normal"
                value={ownerForm.username}
                onChange={handleOwnerChange('username')}
                helperText="This will be used to log in to your account"
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
                label="Phone Number"
                variant="outlined"
                fullWidth
                margin="normal"
                value={ownerForm.phone}
                onChange={handleOwnerChange('phone')}
                helperText="For tenant inquiries and WhatsApp contact"
              />
              
              <TextField
                label="Business Address"
                variant="outlined"
                fullWidth
                margin="normal"
                multiline
                rows={2}
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

          {/* Login Link */}
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