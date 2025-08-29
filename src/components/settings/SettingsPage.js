import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tab,
  Tabs,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  FormGroup,
  Divider,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { createApiClient } from '../../api/apiConfig';
import { getUserRole } from '../../utils/auth';

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`settings-tabpanel-${index}`}
    aria-labelledby={`settings-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const userRole = getUserRole();

  const apiClient = createApiClient();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await apiClient.get('/settings');
      setSettings(response.data.settings);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await apiClient.put('/settings', { settings });
      setMessage({ type: 'success', text: 'Settings saved successfully' });
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  const getTabs = () => {
    const baseTabs = ['Account', 'Notifications', 'Privacy'];
    
    if (userRole === 'propertyowner') {
      baseTabs.push('Business', 'Property Management');
    } else if (userRole === 'admin') {
      baseTabs.push('Admin');
    } else if (userRole === 'user') {
      baseTabs.push('Preferences');
    }
    
    return baseTabs;
  };

  const tabs = getTabs();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Settings
      </Typography>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      <Paper elevation={1} sx={{ overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {tabs.map((tab, index) => (
            <Tab key={tab} label={tab} id={`settings-tab-${index}`} />
          ))}
        </Tabs>

        {/* Account Settings */}
        <TabPanel value={activeTab} index={0}>
          <Typography variant="h6" sx={{ mb: 2 }}>Account Information</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Username"
                fullWidth
                value={settings?.account?.username || ''}
                onChange={(e) => updateSetting('account', 'username', e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                fullWidth
                value={settings?.account?.email || ''}
                disabled
                margin="normal"
                helperText="Contact support to change email"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone"
                fullWidth
                value={settings?.account?.phone || ''}
                onChange={(e) => updateSetting('account', 'phone', e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nationality"
                fullWidth
                value={settings?.account?.nationality || ''}
                onChange={(e) => updateSetting('account', 'nationality', e.target.value)}
                margin="normal"
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Notifications Settings */}
        <TabPanel value={activeTab} index={1}>
          <Typography variant="h6" sx={{ mb: 2 }}>Notification Preferences</Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={settings?.notifications?.email_notifications || false}
                  onChange={(e) => updateSetting('notifications', 'email_notifications', e.target.checked)}
                />
              }
              label="Email Notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings?.notifications?.booking_updates || false}
                  onChange={(e) => updateSetting('notifications', 'booking_updates', e.target.checked)}
                />
              }
              label="Booking Updates"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings?.notifications?.property_updates || false}
                  onChange={(e) => updateSetting('notifications', 'property_updates', e.target.checked)}
                />
              }
              label="Property Updates"
            />
          </FormGroup>
        </TabPanel>

        {/* Privacy Settings */}
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h6" sx={{ mb: 2 }}>Privacy Settings</Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={settings?.privacy?.show_phone || false}
                  onChange={(e) => updateSetting('privacy', 'show_phone', e.target.checked)}
                />
              }
              label="Show Phone Number"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings?.privacy?.show_email || false}
                  onChange={(e) => updateSetting('privacy', 'show_email', e.target.checked)}
                />
              }
              label="Show Email Address"
            />
          </FormGroup>
        </TabPanel>

        {/* Property Owner Business Settings */}
        {userRole === 'propertyowner' && (
          <>
            <TabPanel value={activeTab} index={3}>
              <Typography variant="h6" sx={{ mb: 2 }}>Business Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Business Name"
                    fullWidth
                    value={settings?.business?.business_name || ''}
                    onChange={(e) => updateSetting('business', 'business_name', e.target.value)}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Contact Person"
                    fullWidth
                    value={settings?.business?.contact_person || ''}
                    onChange={(e) => updateSetting('business', 'contact_person', e.target.value)}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Business Address"
                    fullWidth
                    multiline
                    rows={3}
                    value={settings?.business?.business_address || ''}
                    onChange={(e) => updateSetting('business', 'business_address', e.target.value)}
                    margin="normal"
                  />
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={activeTab} index={4}>
              <Typography variant="h6" sx={{ mb: 2 }}>Property Management</Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings?.property_management?.auto_approve_bookings || false}
                      onChange={(e) => updateSetting('property_management', 'auto_approve_bookings', e.target.checked)}
                    />
                  }
                  label="Auto-approve Bookings"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings?.property_management?.whatsapp_notifications || false}
                      onChange={(e) => updateSetting('property_management', 'whatsapp_notifications', e.target.checked)}
                    />
                  }
                  label="WhatsApp Notifications"
                />
              </FormGroup>
              <TextField
                label="WhatsApp Number"
                fullWidth
                value={settings?.property_management?.whatsapp_number || ''}
                onChange={(e) => updateSetting('property_management', 'whatsapp_number', e.target.value)}
                margin="normal"
                helperText="Phone number for WhatsApp notifications"
              />
            </TabPanel>
          </>
        )}

        {/* User Preferences */}
        {userRole === 'user' && (
          <TabPanel value={activeTab} index={3}>
            <Typography variant="h6" sx={{ mb: 2 }}>User Preferences</Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings?.preferences?.property_alerts || false}
                    onChange={(e) => updateSetting('preferences', 'property_alerts', e.target.checked)}
                  />
                }
                label="Property Alerts"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings?.preferences?.price_range_alerts || false}
                    onChange={(e) => updateSetting('preferences', 'price_range_alerts', e.target.checked)}
                  />
                }
                label="Price Range Alerts"
              />
            </FormGroup>
          </TabPanel>
        )}

        {/* Admin Settings */}
        {userRole === 'admin' && (
          <TabPanel value={activeTab} index={3}>
            <Typography variant="h6" sx={{ mb: 2 }}>Admin Settings</Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings?.admin?.auto_approve_properties || false}
                    onChange={(e) => updateSetting('admin', 'auto_approve_properties', e.target.checked)}
                  />
                }
                label="Auto-approve Properties"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings?.admin?.system_maintenance_mode || false}
                    onChange={(e) => updateSetting('admin', 'system_maintenance_mode', e.target.checked)}
                  />
                }
                label="Maintenance Mode"
              />
            </FormGroup>
          </TabPanel>
        )}
      </Paper>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
          onClick={handleSave}
          disabled={saving}
          size="large"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </Box>
    </Container>
  );
};

export default SettingsPage;