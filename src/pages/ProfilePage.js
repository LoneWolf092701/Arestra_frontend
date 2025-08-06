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
import { getUserProfile, updateUserProfile, changePasswordProfile } from '../api';
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

  const userRole = localStorage.getItem('userRole');

  const [profile, setProfile] = useState({
    username: '',
    email: '',
    phone: '',
    first_name: '',
    last_name: '',
    gender: '',
    birthdate: '',
    nationality: '',
    business_name: '',
    contact_person: '',
    business_type: '',
    business_registration: '',
    business_address: '',
    department: '',
    admin_level: '',
    profile_image: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

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
      if (error.message.includes('Authentication') || error.message.includes('login')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const validateProfile = () => {
    const errors = {};
    
    if (!profile.phone || profile.phone.trim() === '') {
      errors.phone = 'Phone number is required';
    }

    if (userRole === 'user') {
      if (!profile.first_name || profile.first_name.trim() === '') {
        errors.first_name = 'First name is required';
      }
      if (!profile.last_name || profile.last_name.trim() === '') {
        errors.last_name = 'Last name is required';
      }
    }

    if (userRole === 'propertyowner') {
      if (!profile.business_name || profile.business_name.trim() === '') {
        errors.business_name = 'Business name is required';
      }
      if (!profile.contact_person || profile.contact_person.trim() === '') {
        errors.contact_person = 'Contact person is required';
      }
    }

    if (userRole === 'admin') {
      if (!profile.department || profile.department.trim() === '') {
        errors.department = 'Department is required';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateProfile()) {
      setSnackbarMessage('Please fill in all required fields');
      setSnackbarOpen(true);
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await updateUserProfile(token, profile);
      setIsEditing(false);
      setSnackbarMessage('Profile updated successfully');
      setSnackbarOpen(true);
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
    fetchUserProfile();
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setSnackbarMessage('Please fill in all password fields');
      setSnackbarOpen(true);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSnackbarMessage('New passwords do not match');
      setSnackbarOpen(true);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setSnackbarMessage('New password must be at least 6 characters long');
      setSnackbarOpen(true);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await changePasswordProfile(token, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setSnackbarMessage('Password changed successfully');
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
              />
            )}
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const getFieldsForRole = () => {
    const commonFields = [
      { key: 'username', label: 'Username', disabled: true },
      { key: 'email', label: 'Email Address', type: 'email', disabled: true },
      { key: 'phone', label: 'Phone Number', required: true }
    ];

    switch (userRole) {
      case 'user':
        return [
          ...commonFields,
          { key: 'first_name', label: 'First Name', required: true },
          { key: 'last_name', label: 'Last Name', required: true },
          { 
            key: 'gender', 
            label: 'Gender', 
            type: 'select',
            options: [
              { value: '', label: 'Select Gender' },
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'other', label: 'Other' }
            ]
          },
          { key: 'birthdate', label: 'Birth Date', type: 'date' },
          { key: 'nationality', label: 'Nationality' }
        ];

      case 'propertyowner':
        return [
          ...commonFields,
          { key: 'business_name', label: 'Business Name', required: true },
          { key: 'contact_person', label: 'Contact Person', required: true },
          { key: 'business_type', label: 'Business Type' },
          { key: 'business_registration', label: 'Registration Number' },
          { key: 'business_address', label: 'Business Address', multiline: true, rows: 3, fullWidth: true }
        ];

      case 'admin':
        return [
          ...commonFields,
          { key: 'first_name', label: 'First Name', required: true },
          { key: 'last_name', label: 'Last Name', required: true },
          { key: 'department', label: 'Department', required: true },
          { 
            key: 'admin_level', 
            label: 'Admin Level', 
            type: 'select',
            options: [
              { value: '', label: 'Select Level' },
              { value: 'super_admin', label: 'Super Admin' },
              { value: 'admin', label: 'Admin' },
              { value: 'moderator', label: 'Moderator' }
            ]
          }
        ];

      default:
        return commonFields;
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4 }}>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6">Loading profile...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchUserProfile}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                mx: 'auto',
                mb: 2,
                bgcolor: getRoleColor()
              }}
              src={profile.profile_image}
            >
              {getRoleIcon()}
            </Avatar>
            
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
              {userRole === 'user' ? 
                `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username :
                userRole === 'propertyowner' ? 
                profile.business_name || profile.username :
                `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username
              }
            </Typography>
            
            <Chip 
              label={getRoleLabel()} 
              color="primary" 
              sx={{ 
                fontWeight: 'bold',
                bgcolor: getRoleColor(),
                color: 'white'
              }} 
            />
          </Box>

          <Divider sx={{ mb: 4 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Profile Information
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<LockIcon />}
                onClick={() => setPasswordDialogOpen(true)}
              >
                Change Password
              </Button>
              
              {!isEditing ? (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              )}
            </Box>
          </Box>

          {renderFieldGroup('Account Information', getFieldsForRole())}
        </CardContent>
      </Card>

      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            label="Current Password"
            type="password"
            fullWidth
            margin="normal"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
          />
          <TextField
            label="New Password"
            type="password"
            fullWidth
            margin="normal"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
            helperText="Minimum 6 characters"
          />
          <TextField
            label="Confirm New Password"
            type="password"
            fullWidth
            margin="normal"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
          <Button onClick={handlePasswordChange} variant="contained">
            Change Password
          </Button>
        </DialogActions>
      </Dialog>

      <AppSnackbar 
        open={snackbarOpen}
        message={snackbarMessage}
        onClose={() => setSnackbarOpen(false)}
      />
    </Container>
  );
};

export default ProfilePage;