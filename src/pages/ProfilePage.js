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
  Chip,
  CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LockIcon from '@mui/icons-material/Lock';
import { useTheme } from '../contexts/ThemeContext';
import { getUserProfile, updateUserProfile, changePasswordProfile } from '../api/profileApi';
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
      const userData = await getUserProfile();
      const formattedBirthdate = userData.birthdate ? 
        new Date(userData.birthdate).toISOString().split('T')[0] : '';
      
      setProfile({
        username: userData.username || '',
        email: userData.email || '',
        phone: userData.phone || '',
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        gender: userData.gender || '',
        birthdate: formattedBirthdate,
        nationality: userData.nationality || '',
        business_name: userData.business_name || '',
        contact_person: userData.contact_person || '',
        business_type: userData.business_type || '',
        business_registration: userData.business_registration || '',
        business_address: userData.business_address || '',
        department: userData.department || '',
        admin_level: userData.admin_level || '',
        profile_image: userData.profile_image || ''
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const validateField = (name, value) => {
    const errors = {};
    
    switch (name) {
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = 'Please enter a valid email address';
        }
        break;
      case 'phone':
        if (value && !/^\+?[\d\s-()]{10,}$/.test(value)) {
          errors.phone = 'Please enter a valid phone number';
        }
        break;
      case 'birthdate':
        if (value) {
          const date = new Date(value);
          const today = new Date();
          const age = today.getFullYear() - date.getFullYear();
          if (age < 13 || age > 120) {
            errors.birthdate = 'Age must be between 13 and 120 years';
          }
        }
        break;
      case 'business_registration':
        if (userRole === 'propertyowner' && value && value.length < 5) {
          errors.business_registration = 'Business registration must be at least 5 characters';
        }
        break;
      default:
        break;
    }
    
    return errors;
  };

  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));

    const fieldError = validateField(field, value);
    setFieldErrors(prev => ({
      ...prev,
      ...fieldError,
      [field]: fieldError[field] || undefined
    }));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setError('');
    
    try {
      const allErrors = {};
      Object.keys(profile).forEach(field => {
        const fieldError = validateField(field, profile[field]);
        Object.assign(allErrors, fieldError);
      });

      if (Object.keys(allErrors).length > 0) {
        setFieldErrors(allErrors);
        throw new Error('Please fix the validation errors');
      }

      const profilePayload = { ...profile };
      
      if (profilePayload.birthdate && profilePayload.birthdate.trim() === '') {
        profilePayload.birthdate = null;
      }

      await updateUserProfile(profilePayload);
      
      setIsEditing(false);
      setSnackbarMessage('Profile updated successfully!');
      setSnackbarOpen(true);
      setFieldErrors({});
      
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setError('Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }

    try {
      await changePasswordProfile({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      });

      setPasswordDialogOpen(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setSnackbarMessage('Password changed successfully!');
      setSnackbarOpen(true);
      setError('');
    } catch (err) {
      console.error('Error changing password:', err);
      setError(err.message || 'Failed to change password');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFieldErrors({});
    setError('');
    fetchUserProfile();
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'user':
        return <PersonIcon />;
      case 'propertyowner':
        return <BusinessIcon />;
      case 'admin':
        return <AdminPanelSettingsIcon />;
      default:
        return <PersonIcon />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'user':
        return 'primary';
      case 'propertyowner':
        return 'success';
      case 'admin':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card sx={{ backgroundColor: theme.cardBackground, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: theme.primary,
                mr: 3,
                fontSize: '2rem'
              }}
              src={profile.profile_image}
            >
              {profile.first_name ? profile.first_name[0] : profile.username[0] || 'U'}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ color: theme.textPrimary, fontWeight: 600 }}>
                {profile.first_name || profile.last_name 
                  ? `${profile.first_name} ${profile.last_name}`.trim()
                  : profile.username}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Chip
                  icon={getRoleIcon(userRole)}
                  label={userRole?.charAt(0).toUpperCase() + userRole?.slice(1) || 'User'}
                  color={getRoleColor(userRole)}
                  size="small"
                />
              </Box>
            </Box>
            <Box>
              {!isEditing ? (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditing(true)}
                  sx={{ mr: 1 }}
                >
                  Edit Profile
                </Button>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveProfile}
                    disabled={saving}
                    sx={{ backgroundColor: theme.primary }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancelEdit}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
              <Button
                variant="outlined"
                startIcon={<LockIcon />}
                onClick={() => setPasswordDialogOpen(true)}
                sx={{ ml: 1 }}
              >
                Change Password
              </Button>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" sx={{ mb: 3, color: theme.textPrimary }}>
            Personal Information
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Username"
                value={profile.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                disabled={!isEditing}
                error={!!fieldErrors.username}
                helperText={fieldErrors.username}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={profile.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!isEditing}
                error={!!fieldErrors.email}
                helperText={fieldErrors.email}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={profile.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                disabled={!isEditing}
                error={!!fieldErrors.first_name}
                helperText={fieldErrors.first_name}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={profile.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                disabled={!isEditing}
                error={!!fieldErrors.last_name}
                helperText={fieldErrors.last_name}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={profile.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={!isEditing}
                error={!!fieldErrors.phone}
                helperText={fieldErrors.phone}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={!isEditing}>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={profile.gender}
                  label="Gender"
                  onChange={(e) => handleInputChange('gender', e.target.value)}
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
                fullWidth
                label="Birth Date"
                type="date"
                value={profile.birthdate}
                onChange={(e) => handleInputChange('birthdate', e.target.value)}
                disabled={!isEditing}
                error={!!fieldErrors.birthdate}
                helperText={fieldErrors.birthdate}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nationality"
                value={profile.nationality}
                onChange={(e) => handleInputChange('nationality', e.target.value)}
                disabled={!isEditing}
                error={!!fieldErrors.nationality}
                helperText={fieldErrors.nationality}
              />
            </Grid>
          </Grid>

          {userRole === 'propertyowner' && (
            <>
              <Divider sx={{ my: 4 }} />
              <Typography variant="h6" sx={{ mb: 3, color: theme.textPrimary }}>
                Business Information
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Business Name"
                    value={profile.business_name}
                    onChange={(e) => handleInputChange('business_name', e.target.value)}
                    disabled={!isEditing}
                    error={!!fieldErrors.business_name}
                    helperText={fieldErrors.business_name}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Contact Person"
                    value={profile.contact_person}
                    onChange={(e) => handleInputChange('contact_person', e.target.value)}
                    disabled={!isEditing}
                    error={!!fieldErrors.contact_person}
                    helperText={fieldErrors.contact_person}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!isEditing}>
                    <InputLabel>Business Type</InputLabel>
                    <Select
                      value={profile.business_type}
                      label="Business Type"
                      onChange={(e) => handleInputChange('business_type', e.target.value)}
                    >
                      <MenuItem value="">Select Business Type</MenuItem>
                      <MenuItem value="individual">Individual</MenuItem>
                      <MenuItem value="company">Company</MenuItem>
                      <MenuItem value="partnership">Partnership</MenuItem>
                      <MenuItem value="corporation">Corporation</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Business Registration"
                    value={profile.business_registration}
                    onChange={(e) => handleInputChange('business_registration', e.target.value)}
                    disabled={!isEditing}
                    error={!!fieldErrors.business_registration}
                    helperText={fieldErrors.business_registration}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Business Address"
                    value={profile.business_address}
                    onChange={(e) => handleInputChange('business_address', e.target.value)}
                    disabled={!isEditing}
                    multiline
                    rows={3}
                    error={!!fieldErrors.business_address}
                    helperText={fieldErrors.business_address}
                  />
                </Grid>
              </Grid>
            </>
          )}

          {userRole === 'admin' && (
            <>
              <Divider sx={{ my: 4 }} />
              <Typography variant="h6" sx={{ mb: 3, color: theme.textPrimary }}>
                Administrative Information
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Department"
                    value={profile.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    disabled={!isEditing}
                    error={!!fieldErrors.department}
                    helperText={fieldErrors.department}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!isEditing}>
                    <InputLabel>Admin Level</InputLabel>
                    <Select
                      value={profile.admin_level}
                      label="Admin Level"
                      onChange={(e) => handleInputChange('admin_level', e.target.value)}
                    >
                      <MenuItem value="">Select Admin Level</MenuItem>
                      <MenuItem value="junior">Junior Admin</MenuItem>
                      <MenuItem value="senior">Senior Admin</MenuItem>
                      <MenuItem value="super">Super Admin</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Current Password"
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
            margin="dense"
          />
          <TextField
            fullWidth
            label="New Password"
            type="password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
            margin="dense"
            helperText="Password must be at least 8 characters long"
          />
          <TextField
            fullWidth
            label="Confirm New Password"
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handlePasswordChange} 
            variant="contained"
            sx={{ backgroundColor: theme.primary }}
          >
            Change Password
          </Button>
        </DialogActions>
      </Dialog>

      <AppSnackbar
        open={snackbarOpen}
        message={snackbarMessage}
        severity="success"
        onClose={() => setSnackbarOpen(false)}
      />
    </Container>
  );
};

export default ProfilePage;