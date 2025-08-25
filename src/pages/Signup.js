import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../api/authApi';
import { useTheme } from '../contexts/ThemeContext';
import AppSnackbar from '../components/common/AppSnackbar';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const Signup = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [tenantForm, setTenantForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    gender: '',
    birthdate: '',
    nationality: ''
  });

  const [ownerForm, setOwnerForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    gender: '',
    birthdate: '',
    nationality: '',
    businessName: '',
    contactPerson: '',
    businessType: '',
    businessRegistration: '',
    businessAddress: ''
  });

  const [adminForm, setAdminForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    gender: '',
    birthdate: '',
    nationality: '',
    department: '',
    adminLevel: ''
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError('');
  };

  const handleTenantChange = (field) => (event) => {
    setTenantForm(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleOwnerChange = (field) => (event) => {
    setOwnerForm(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleAdminChange = (field) => (event) => {
    setAdminForm(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const validateForm = () => {
    const currentForm = activeTab === 0 ? tenantForm : activeTab === 1 ? ownerForm : adminForm;

    if (!currentForm.username || !currentForm.email || !currentForm.password || !currentForm.confirmPassword) {
      setError('Please fill in all required fields');
      return false;
    }

    if (currentForm.username.length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }

    if (currentForm.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (currentForm.password !== currentForm.confirmPassword) {
      setError('Passwords do not match');
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
    let currentForm, userRole, profileData;
    
    if (activeTab === 0) {
      currentForm = tenantForm;
      userRole = 'user';
      profileData = {
        first_name: currentForm.firstName,
        last_name: currentForm.lastName,
        phone: currentForm.phone,
        gender: currentForm.gender,
        birthdate: currentForm.birthdate,
        nationality: currentForm.nationality
      };
    } else if (activeTab === 1) {
      currentForm = ownerForm;
      userRole = 'propertyowner';
      profileData = {
        first_name: currentForm.firstName,
        last_name: currentForm.lastName,
        phone: currentForm.phone,
        gender: currentForm.gender,
        birthdate: currentForm.birthdate,
        nationality: currentForm.nationality,
        business_name: currentForm.businessName,
        contact_person: currentForm.contactPerson,
        business_type: currentForm.businessType,
        business_registration: currentForm.businessRegistration,
        business_address: currentForm.businessAddress
      };
    } else {
      currentForm = adminForm;
      userRole = 'admin';
      profileData = {
        first_name: currentForm.firstName,
        last_name: currentForm.lastName,
        phone: currentForm.phone,
        gender: currentForm.gender,
        birthdate: currentForm.birthdate,
        nationality: currentForm.nationality,
        department: currentForm.department,
        admin_level: currentForm.adminLevel
      };
    }
    
    const userData = {
      username: currentForm.username,
      email: currentForm.email,
      password: currentForm.password,
      role: userRole,
      profile: profileData
    };

    const response = await registerUser(userData);
    
    if (response.success || response.message.includes('successfully')) {
      setSnackbar({
        open: true,
        message: response.requiresEmailVerification 
          ? 'Account created successfully! Please check your email and click the verification link to activate your account.'
          : 'Account created successfully! Please check your email for verification.',
        severity: 'success'
      });
      
      // If email verification is required, navigate to a verification pending page or stay on current page
      if (response.requiresEmailVerification) {
        setTimeout(() => {
          navigate(`/verify-email?email=${encodeURIComponent(currentForm.email)}`);
        }, 2000);
      } else {
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
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
    <Container 
      maxWidth="sm" 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        py: 4
      }}
    >
      <Box 
        sx={{ 
          width: '100%',
          backgroundColor: theme.cardBackground,
          borderRadius: 4,
          boxShadow: theme.boxShadow,
          border: `1px solid ${theme.borderColor}`,
          overflow: 'hidden'
        }}
      >
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.textPrimary, mb: 1 }}>
            Join StayWise.lk
          </Typography>
          <Typography variant="body1" sx={{ color: theme.textSecondary, mb: 3 }}>
            Create your account to get started
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ m: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                color: theme.textSecondary,
                '&.Mui-selected': {
                  color: theme.primary,
                }
              }
            }}
          >
            <Tab 
              label="User/Tenant" 
              {...a11yProps(0)}
              sx={{ flex: 1 }}
            />
            <Tab 
              label="Property Owner" 
              {...a11yProps(1)}
              sx={{ flex: 1 }}
            />
            <Tab 
              label="Admin" 
              {...a11yProps(2)}
              sx={{ flex: 1 }}
            />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Account Information
            </Typography>
            
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

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Personal Information
            </Typography>

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name"
                  variant="outlined"
                  fullWidth
                  required
                  value={tenantForm.firstName}
                  onChange={handleTenantChange('firstName')}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Name"
                  variant="outlined"
                  fullWidth
                  required
                  value={tenantForm.lastName}
                  onChange={handleTenantChange('lastName')}
                />
              </Grid>
            </Grid>

            <TextField
              label="Phone Number"
              variant="outlined"
              fullWidth
              margin="normal"
              value={tenantForm.phone}
              onChange={handleTenantChange('phone')}
              helperText="Optional - Contact number"
            />

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={tenantForm.gender}
                    label="Gender"
                    onChange={handleTenantChange('gender')}
                  >
                    <MenuItem value="">Select Gender</MenuItem>
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                    <MenuItem value="prefer_not_to_say">Prefer not to say</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Birth Date"
                  type="date"
                  fullWidth
                  value={tenantForm.birthdate}
                  onChange={handleTenantChange('birthdate')}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            </Grid>

            <TextField
              label="Nationality"
              variant="outlined"
              fullWidth
              margin="normal"
              value={tenantForm.nationality}
              onChange={handleTenantChange('nationality')}
              helperText="Optional - e.g., Sri Lankan"
            />

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Account Security
            </Typography>
            
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
                'Create User Account'
              )}
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Account Information
            </Typography>
            
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

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Personal Information
            </Typography>

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name"
                  variant="outlined"
                  fullWidth
                  required
                  value={ownerForm.firstName}
                  onChange={handleOwnerChange('firstName')}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Name"
                  variant="outlined"
                  fullWidth
                  required
                  value={ownerForm.lastName}
                  onChange={handleOwnerChange('lastName')}
                />
              </Grid>
            </Grid>

            <TextField
              label="Phone Number"
              variant="outlined"
              fullWidth
              margin="normal"
              value={ownerForm.phone}
              onChange={handleOwnerChange('phone')}
              helperText="Optional - Business contact number"
            />

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={ownerForm.gender}
                    label="Gender"
                    onChange={handleOwnerChange('gender')}
                  >
                    <MenuItem value="">Select Gender</MenuItem>
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                    <MenuItem value="prefer_not_to_say">Prefer not to say</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Birth Date"
                  type="date"
                  fullWidth
                  value={ownerForm.birthdate}
                  onChange={handleOwnerChange('birthdate')}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            </Grid>

            <TextField
              label="Nationality"
              variant="outlined"
              fullWidth
              margin="normal"
              value={ownerForm.nationality}
              onChange={handleOwnerChange('nationality')}
              helperText="Optional - e.g., Sri Lankan"
            />

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Business Information
            </Typography>
            
            <TextField
              label="Business Name"
              variant="outlined"
              fullWidth
              required
              margin="normal"
              value={ownerForm.businessName}
              onChange={handleOwnerChange('businessName')}
              helperText="Name of your property business"
            />
            
            <TextField
              label="Contact Person"
              variant="outlined"
              fullWidth
              margin="normal"
              value={ownerForm.contactPerson}
              onChange={handleOwnerChange('contactPerson')}
              helperText="Primary contact person for business"
            />
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Business Type</InputLabel>
                  <Select
                    value={ownerForm.businessType}
                    label="Business Type"
                    onChange={handleOwnerChange('businessType')}
                  >
                    <MenuItem value="">Select Type</MenuItem>
                    <MenuItem value="individual">Individual</MenuItem>
                    <MenuItem value="company">Company</MenuItem>
                    <MenuItem value="partnership">Partnership</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Business Registration"
                  variant="outlined"
                  fullWidth
                  value={ownerForm.businessRegistration}
                  onChange={handleOwnerChange('businessRegistration')}
                  helperText="Registration number"
                />
              </Grid>
            </Grid>
            
            <TextField
              label="Business Address"
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              margin="normal"
              value={ownerForm.businessAddress}
              onChange={handleOwnerChange('businessAddress')}
              helperText="Complete business address"
            />

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Account Security
            </Typography>
            
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

        <TabPanel value={activeTab} index={2}>
          <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Account Information
            </Typography>
            
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              required
              margin="normal"
              value={adminForm.username}
              onChange={handleAdminChange('username')}
            />
            
            <TextField
              label="Email Address"
              variant="outlined"
              type="email"
              fullWidth
              required
              margin="normal"
              value={adminForm.email}
              onChange={handleAdminChange('email')}
            />

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Personal Information
            </Typography>

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name"
                  variant="outlined"
                  fullWidth
                  required
                  value={adminForm.firstName}
                  onChange={handleAdminChange('firstName')}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Name"
                  variant="outlined"
                  fullWidth
                  required
                  value={adminForm.lastName}
                  onChange={handleAdminChange('lastName')}
                />
              </Grid>
            </Grid>

            <TextField
              label="Phone Number"
              variant="outlined"
              fullWidth
              margin="normal"
              value={adminForm.phone}
              onChange={handleAdminChange('phone')}
              helperText="Official contact number"
            />

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={adminForm.gender}
                    label="Gender"
                    onChange={handleAdminChange('gender')}
                  >
                    <MenuItem value="">Select Gender</MenuItem>
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                    <MenuItem value="prefer_not_to_say">Prefer not to say</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Birth Date"
                  type="date"
                  fullWidth
                  value={adminForm.birthdate}
                  onChange={handleAdminChange('birthdate')}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            </Grid>

            <TextField
              label="Nationality"
              variant="outlined"
              fullWidth
              margin="normal"
              value={adminForm.nationality}
              onChange={handleAdminChange('nationality')}
              helperText="Optional - e.g., Sri Lankan"
            />

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Admin Information
            </Typography>
            
            <TextField
              label="Department"
              variant="outlined"
              fullWidth
              required
              margin="normal"
              value={adminForm.department}
              onChange={handleAdminChange('department')}
              helperText="e.g., IT, HR, Operations"
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Admin Level</InputLabel>
              <Select
                value={adminForm.adminLevel}
                label="Admin Level"
                onChange={handleAdminChange('adminLevel')}
              >
                <MenuItem value="">Select Level</MenuItem>
                <MenuItem value="junior">Junior</MenuItem>
                <MenuItem value="senior">Senior</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="director">Director</MenuItem>
              </Select>
            </FormControl>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Account Security
            </Typography>
            
            <TextField
              label="Password"
              variant="outlined"
              type="password"
              fullWidth
              required
              margin="normal"
              value={adminForm.password}
              onChange={handleAdminChange('password')}
              helperText="Minimum 6 characters"
            />
            
            <TextField
              label="Confirm Password"
              variant="outlined"
              type="password"
              fullWidth
              required
              margin="normal"
              value={adminForm.confirmPassword}
              onChange={handleAdminChange('confirmPassword')}
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
                'Create Admin Account'
              )}
            </Button>
          </Box>
        </TabPanel>

        <Box sx={{ textAlign: 'center', mt: 2, pb: 4 }}>
          <Typography variant="body2" sx={{ color: theme.text }}>
            Already have an account?{' '}
            <Button 
              variant="text" 
              onClick={() => navigate('/login')}
              sx={{ 
                color: theme.primary,
                textTransform: 'none',
                p: 0,
                minWidth: 'auto',
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: theme.secondary
                }
              }}
            >
              Sign in here
            </Button>
          </Typography>
        </Box>
      </Box>

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      />
    </Container>
  );
};

export default Signup;