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
    identification_number: '',
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
      const responseData = await getUserProfile();
      
      // Extract user and profile data from nested response
      const userData = responseData.user || responseData;
      const profileData = responseData.profile || responseData;
      
      // Format birthdate properly
      const formattedBirthdate = profileData.birthdate ? 
        new Date(profileData.birthdate).toISOString().split('T')[0] : '';
      
      setProfile({
        username: userData.username || '',
        email: userData.email || '',
        phone: profileData.phone || '',
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        gender: profileData.gender || '',
        birthdate: formattedBirthdate,
        nationality: profileData.nationality || '',
        identification_number: profileData.identification_number || '',
        business_name: profileData.business_name || '',
        contact_person: profileData.contact_person || '',
        business_type: profileData.business_type || '',
        business_registration: profileData.business_registration || '',
        business_address: profileData.business_address || '',
        department: profileData.department || '',
        admin_level: profileData.admin_level || '',
        profile_image: profileData.profile_image || ''
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
        if (value && !/^\+?[1-9]\d{1,14}$/.test(value.replace(/\s/g, ''))) {
          errors.phone = 'Please enter a valid phone number';
        }
        break;
      case 'username':
        if (value && value.length < 3) {
          errors.username = 'Username must be at least 3 characters long';
        }
        break;
      case 'first_name':
        if (value && value.length < 2) {
          errors.first_name = 'First name must be at least 2 characters long';
        }
        break;
      case 'last_name':
        if (value && value.length < 2) {
          errors.last_name = 'Last name must be at least 2 characters long';
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

  const handleSave = async () => {
    const errors = {};
    
    Object.keys(profile).forEach(field => {
      const fieldError = validateField(field, profile[field]);
      if (fieldError[field]) {
        errors[field] = fieldError[field];
      }
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSaving(true);
    try {
      await updateUserProfile(profile);
      setIsEditing(false);
      setSnackbarMessage('Profile updated successfully!');
      setSnackbarOpen(true);
      setFieldErrors({});
    } catch (err) {
      setError(err.message || 'Failed to update profile');
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
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    try {
      await changePasswordProfile(passwordData);
      setPasswordDialogOpen(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setSnackbarMessage('Password changed successfully!');
      setSnackbarOpen(true);
    } catch (err) {
      setError(err.message || 'Failed to change password');
    }
  };

  const getRoleIcon = () => {
    switch (userRole) {
      case 'admin':
        return <AdminPanelSettingsIcon />;
      case 'propertyowner':
        return <BusinessIcon />;
      default:
        return <PersonIcon />;
    }
  };

  const getRoleColor = () => {
    switch (userRole) {
      case 'admin':
        return 'error';
      case 'propertyowner':
        return 'warning';
      default:
        return 'primary';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading profile...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mr: 3,
                bgcolor: theme.primary,
                fontSize: '2rem'
              }}
              src={profile.profile_image || undefined}
            >
              {profile.first_name ? profile.first_name.charAt(0).toUpperCase() : 
               profile.username ? profile.username.charAt(0).toUpperCase() : 'U'}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {profile.first_name && profile.last_name 
                  ? `${profile.first_name} ${profile.last_name}`
                  : profile.username || 'User'
                }
              </Typography>
              <Chip
                icon={getRoleIcon()}
                label={userRole?.charAt(0).toUpperCase() + userRole?.slice(1) || 'User'}
                color={getRoleColor()}
                variant="outlined"
                sx={{ mb: 1 }}
              />
            </Box>
            <Box>
              {!isEditing ? (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditing(true)}
                  sx={{ mr: 1 }}
                >
                  Edit Profile
                </Button>
              ) : (
                <Box>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={saving}
                    sx={{ mr: 1 }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
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

          <Divider sx={{ mb: 3 }} />

          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
            Personal Information
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Username"
                value={profile.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                disabled={true}
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
                disabled={true}
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
                disabled={true}
                error={!!fieldErrors.birthdate}
                helperText={fieldErrors.birthdate}
                InputLabelProps={{
                  shrink: true,
                }}
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

            <Grid item xs={12} sm={6}>
  <TextField
    fullWidth
    label="NIC or Passport Number"
    value={profile.identification_number}
    onChange={(e) => handleInputChange('identification_number', e.target.value)}
    disabled={true}
    error={!!fieldErrors.identification_number}
    helperText={fieldErrors.identification_number || "National Identity Card or Passport Number"}
  />
</Grid>

            {userRole === 'admin' && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                    Admin Information
                  </Typography>
                </Grid>

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
                      <MenuItem value="">Select Level</MenuItem>
                      <MenuItem value="junior">Junior</MenuItem>
                      <MenuItem value="senior">Senior</MenuItem>
                      <MenuItem value="manager">Manager</MenuItem>
                      <MenuItem value="director">Director</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}

            {userRole === 'propertyowner' && (profile.business_name || profile.contact_person || profile.business_type || profile.business_registration || profile.business_address) && (
  <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                    Business Information
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Business Name"
                    value={profile.business_name}
                    onChange={(e) => handleInputChange('business_name', e.target.value)}
                    disabled={true}
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
                  <TextField
                    fullWidth
                    label="Business Type"
                    value={profile.business_type}
                    onChange={(e) => handleInputChange('business_type', e.target.value)}
                    disabled={!isEditing}
                    error={!!fieldErrors.business_type}
                    helperText={fieldErrors.business_type}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Business Registration"
                    value={profile.business_registration}
                    onChange={(e) => handleInputChange('business_registration', e.target.value)}
                    disabled={true}
                    error={!!fieldErrors.business_registration}
                    helperText={fieldErrors.business_registration}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Business Address"
                    multiline
                    rows={3}
                    value={profile.business_address}
                    onChange={(e) => handleInputChange('business_address', e.target.value)}
                    disabled={!isEditing}
                    error={!!fieldErrors.business_address}
                    helperText={fieldErrors.business_address}
                  />
                </Grid>
              </>
            )}

            {userRole === 'admin' && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                    Admin Information
                  </Typography>
                </Grid>

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
                  <TextField
                    fullWidth
                    label="Admin Level"
                    value={profile.admin_level}
                    onChange={(e) => handleInputChange('admin_level', e.target.value)}
                    disabled={!isEditing}
                    error={!!fieldErrors.admin_level}
                    helperText={fieldErrors.admin_level}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </CardContent>
      </Card>

      <Dialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Current Password"
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
            margin="normal"
          />
          <TextField
            fullWidth
            label="New Password"
            type="password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Confirm New Password"
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            margin="normal"
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