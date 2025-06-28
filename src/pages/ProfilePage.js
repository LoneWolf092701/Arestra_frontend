import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Avatar,
  Alert,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LockIcon from '@mui/icons-material/Lock';
import { useTheme } from '../contexts/ThemeContext';
import { getUserProfile, updateUserProfile, changePassword } from '../api/profileApi';
import AppSnackbar from '../components/common/AppSnackbar';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { theme, isDark } = useTheme();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  // Get user role to determine which fields to show
  const userRole = localStorage.getItem('userRole');

  // Profile state - this will hold different fields based on user role
  const [profile, setProfile] = useState({
    // Common fields for all users
    username: '',
    email: '',
    phone: '',
    
    // Fields for regular users
    firstName: '',
    lastName: '',
    gender: '',
    birthdate: '',
    nationality: '',
    
    // Fields for property owners
    businessName: '',
    contactPerson: '',
    businessAddress: '',
    
    // Additional fields for property owners
    businessType: '',
    businessRegistration: '',
    
    // Admin-specific fields
    department: '',
    adminLevel: ''
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Error states for form validation
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const userData = await getUserProfile(token);
      setProfile(userData);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Common validations
    if (!profile.email) errors.email = 'Email is required';
    if (!profile.username) errors.username = 'Username is required';
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (profile.email && !emailRegex.test(profile.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Role-specific validations
    if (userRole === 'user') {
      if (!profile.firstName) errors.firstName = 'First name is required';
      if (!profile.lastName) errors.lastName = 'Last name is required';
    } else if (userRole === 'propertyowner') {
      if (!profile.businessName) errors.businessName = 'Business name is required';
      if (!profile.contactPerson) errors.contactPerson = 'Contact person is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setSnackbarMessage('Please correct the errors in the form');
      setSnackbarOpen(true);
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await updateUserProfile(profile, token);
      setSnackbarMessage('Profile updated successfully!');
      setSnackbarOpen(true);
      setIsEditing(false);
      setFieldErrors({});
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbarMessage('Failed to update profile. Please try again.');
      setSnackbarOpen(true);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFieldErrors({});
    // Refetch original data to reset any changes
    fetchUserProfile();
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSnackbarMessage('New passwords do not match');
      setSnackbarOpen(true);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setSnackbarMessage('Password must be at least 6 characters long');
      setSnackbarOpen(true);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await changePassword(passwordData, token);
      setSnackbarMessage('Password changed successfully!');
      setSnackbarOpen(true);
      setPasswordDialogOpen(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      setSnackbarMessage('Failed to change password. Please check your current password.');
      setSnackbarOpen(true);
    }
  };

  const getRoleIcon = () => {
    switch (userRole) {
      case 'admin':
        return <AdminPanelSettingsIcon sx={{ fontSize: 60, color: theme.secondary }} />;
      case 'propertyowner':
        return <BusinessIcon sx={{ fontSize: 60, color: theme.primary }} />;
      default:
        return <PersonIcon sx={{ fontSize: 60, color: theme.accent }} />;
    }
  };

  const getRoleLabel = () => {
    switch (userRole) {
      case 'admin':
        return 'Administrator';
      case 'propertyowner':
        return 'Property Owner';
      default:
        return 'Tenant';
    }
  };

  const getRoleColor = () => {
    switch (userRole) {
      case 'admin':
        return theme.secondary;
      case 'propertyowner':
        return theme.primary;
      default:
        return theme.accent;
    }
  };

  const renderFieldGroup = (title, fields) => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ color: theme.textPrimary, mb: 2, fontWeight: 600 }}>
        {title}
      </Typography>
      <Grid container spacing={3}>
        {fields.map((field) => (
          <Grid item xs={12} sm={field.fullWidth ? 12 : 6} key={field.key}>
            {field.type === 'select' ? (
              <FormControl fullWidth disabled={!isEditing}>
                <InputLabel>{field.label}</InputLabel>
                <Select
                  value={profile[field.key] || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, [field.key]: e.target.value }))}
                  label={field.label}
                  error={!!fieldErrors[field.key]}
                >
                  {field.options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <TextField
                label={field.label}
                type={field.type || 'text'}
                fullWidth
                variant="outlined"
                value={profile[field.key] || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, [field.key]: e.target.value }))}
                disabled={!isEditing}
                error={!!fieldErrors[field.key]}
                helperText={fieldErrors[field.key]}
                required={field.required}
                multiline={field.multiline}
                rows={field.rows}
                InputLabelProps={field.type === 'date' ? { shrink: true } : undefined}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: isEditing ? theme.inputBackground : theme.surfaceBackground,
                  },
                }}
              />
            )}
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const getFieldsForRole = () => {
    const commonFields = [
      { key: 'username', label: 'Username', required: true },
      { key: 'email', label: 'Email Address', type: 'email', required: true },
      { key: 'phone', label: 'Phone Number' }
    ];

    if (userRole === 'user') {
      return [
        { key: 'firstName', label: 'First Name', required: true },
        { key: 'lastName', label: 'Last Name', required: true },
        { key: 'gender', label: 'Gender', type: 'select', options: [
          { value: 'Male', label: 'Male' },
          { value: 'Female', label: 'Female' },
          { value: 'Other', label: 'Other' }
        ]},
        { key: 'birthdate', label: 'Date of Birth', type: 'date' },
        { key: 'nationality', label: 'Nationality' },
        ...commonFields
      ];
    } else if (userRole === 'propertyowner') {
      return [
        { key: 'businessName', label: 'Business/Property Name', required: true },
        { key: 'contactPerson', label: 'Contact Person Name', required: true },
        { key: 'businessType', label: 'Business Type', type: 'select', options: [
          { value: 'Individual', label: 'Individual Property Owner' },
          { value: 'Company', label: 'Property Management Company' },
          { value: 'Agency', label: 'Real Estate Agency' }
        ]},
        { key: 'businessRegistration', label: 'Business Registration Number' },
        { key: 'businessAddress', label: 'Business Address', fullWidth: true, multiline: true, rows: 3 },
        ...commonFields
      ];
    } else if (userRole === 'admin') {
      return [
        { key: 'firstName', label: 'First Name', required: true },
        { key: 'lastName', label: 'Last Name', required: true },
        { key: 'department', label: 'Department' },
        { key: 'adminLevel', label: 'Admin Level', type: 'select', options: [
          { value: 'Junior', label: 'Junior Administrator' },
          { value: 'Senior', label: 'Senior Administrator' },
          { value: 'Manager', label: 'Manager' }
        ]},
        ...commonFields
      ];
    }

    return commonFields;
  };

  if (loading) {
    return (
      <Box sx={{ 
        background: isDark 
          ? `linear-gradient(135deg, ${theme.background} 0%, ${theme.surfaceBackground} 50%, ${theme.background} 100%)`
          : `linear-gradient(135deg, ${theme.background} 0%, ${theme.primary}05 50%, ${theme.background} 100%)`,
        minHeight: '100vh',
        py: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Typography variant="h4" sx={{ color: theme.textPrimary }}>
          Loading Profile...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      background: isDark 
        ? `linear-gradient(135deg, ${theme.background} 0%, ${theme.surfaceBackground} 50%, ${theme.background} 100%)`
        : `linear-gradient(135deg, ${theme.background} 0%, ${theme.primary}05 50%, ${theme.background} 100%)`,
      minHeight: '100vh',
      py: 4
    }}>
      <Container maxWidth="md">
        {/* Breadcrumb */}
        <Typography variant="body2" sx={{ color: theme.textSecondary, mb: 2 }}>
          Home / {isEditing ? 'Edit Account Details' : 'Account Details'}
        </Typography>

        {/* Greeting */}
        <Typography variant="h4" sx={{ color: theme.textPrimary, mb: 4, fontWeight: 600 }}>
          Hi {profile.firstName || profile.contactPerson || profile.username}!
        </Typography>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {/* Profile Card */}
        <Card 
          sx={{ 
            backgroundColor: theme.cardBackground,
            border: `1px solid ${theme.border}`,
            boxShadow: theme.shadows.medium,
            borderRadius: 3
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Header Section */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 4 
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    backgroundColor: theme.surfaceBackground,
                    border: `3px solid ${getRoleColor()}`
                  }}
                >
                  {getRoleIcon()}
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ color: theme.textPrimary, fontWeight: 600 }}>
                    Account Details
                  </Typography>
                  <Chip 
                    label={getRoleLabel()}
                    sx={{
                      backgroundColor: `${getRoleColor()}20`,
                      color: getRoleColor(),
                      fontWeight: 600,
                      mt: 1
                    }}
                  />
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                {isEditing ? (
                  <>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      sx={{
                        borderColor: theme.textSecondary,
                        color: theme.textSecondary,
                        '&:hover': {
                          backgroundColor: `${theme.textSecondary}10`,
                        }
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                      disabled={saving}
                      sx={{
                        backgroundColor: theme.success,
                        color: '#FFFFFF',
                        '&:hover': {
                          backgroundColor: theme.success,
                          filter: 'brightness(0.9)'
                        }
                      }}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      startIcon={<EditIcon />}
                      onClick={() => setIsEditing(true)}
                      sx={{
                        backgroundColor: theme.primary,
                        color: isDark ? theme.textPrimary : '#FFFFFF',
                        '&:hover': {
                          backgroundColor: theme.secondary,
                        }
                      }}
                    >
                      Edit Profile
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<LockIcon />}
                      onClick={() => setPasswordDialogOpen(true)}
                      sx={{
                        borderColor: theme.primary,
                        color: theme.primary,
                        '&:hover': {
                          backgroundColor: `${theme.primary}10`,
                        }
                      }}
                    >
                      Change Password
                    </Button>
                  </>
                )}
              </Box>
            </Box>

            <Divider sx={{ mb: 4, borderColor: theme.border }} />

            {/* Profile Fields */}
            {renderFieldGroup("Profile Information", getFieldsForRole())}
          </CardContent>
        </Card>

        {/* Password Change Dialog */}
        <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ color: theme.textPrimary }}>Change Password</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
              <TextField
                label="Current Password"
                type="password"
                fullWidth
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
              />
              <TextField
                label="New Password"
                type="password"
                fullWidth
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                helperText="Password must be at least 6 characters long"
              />
              <TextField
                label="Confirm New Password"
                type="password"
                fullWidth
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPasswordDialogOpen(false)} sx={{ color: theme.textSecondary }}>
              Cancel
            </Button>
            <Button onClick={handlePasswordChange} variant="contained" sx={{ backgroundColor: theme.primary }}>
              Change Password
            </Button>
          </DialogActions>
        </Dialog>

        <AppSnackbar
          open={snackbarOpen}
          message={snackbarMessage}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
        />
      </Container>
    </Box>
  );
};

export default ProfilePage;