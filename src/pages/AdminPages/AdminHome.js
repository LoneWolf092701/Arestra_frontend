import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Home as HomeIcon,
  BookOnline as BookingIcon,
  AttachMoney as MoneyIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Health as HealthIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
  Download as DownloadIcon,
  Announcement as AnnouncementIcon,
  ReportProblem as ReportIcon
} from '@mui/icons-material';
import { 
  getDashboardStats,
  getUserStatistics,
  getPropertyApprovalStats,
  getBookingRequestsAdmin,
  getSystemHealth,
  getFinancialReports,
  getActivityLogs,
  getReportedContent,
  getSystemConfig,
  updateSystemConfig,
  exportAdminData,
  createAnnouncement
} from '../../api/adminAPI';
import { useTheme } from '../../contexts/ThemeContext';
import AppSnackbar from '../../components/common/AppSnackbar';

const StatCard = ({ title, value, icon, color = 'primary', trend, subtitle, loading = false }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          {loading ? (
            <CircularProgress size={24} />
          ) : (
            <Typography variant="h4" component="div" sx={{ color: `${color}.main`, fontWeight: 'bold' }}>
              {value}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              {trend > 0 ? (
                <TrendingUpIcon color="success" fontSize="small" />
              ) : (
                <TrendingDownIcon color="error" fontSize="small" />
              )}
              <Typography variant="body2" sx={{ ml: 0.5, color: trend > 0 ? 'success.main' : 'error.main' }}>
                {Math.abs(trend)}%
              </Typography>
            </Box>
          )}
        </Box>
        <Box sx={{ color: `${color}.main` }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const SystemHealthIndicator = ({ status, label }) => {
  const getColor = (status) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircleIcon />;
      case 'warning': return <WarningIcon />;
      case 'error': return <ErrorIcon />;
      default: return <PendingIcon />;
    }
  };

  return (
    <Chip
      icon={getIcon(status)}
      label={label}
      color={getColor(status)}
      size="small"
      sx={{ mr: 1, mb: 1 }}
    />
  );
};

const AdminHome = () => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [propertyStats, setPropertyStats] = useState(null);
  const [bookingStats, setBookingStats] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [financialReports, setFinancialReports] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [reportedContent, setReportedContent] = useState([]);
  const [systemConfig, setSystemConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
  const [configDialog, setConfigDialog] = useState(false);
  const [announcementDialog, setAnnouncementDialog] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', priority: 'normal' });
  
  const { isDark } = useTheme();

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      const [
        statsResponse,
        userStatsResponse,
        propertyStatsResponse,
        bookingStatsResponse,
        healthResponse,
        financialResponse,
        logsResponse,
        reportsResponse,
        configResponse
      ] = await Promise.allSettled([
        getDashboardStats(),
        getUserStatistics({ period: 'monthly' }),
        getPropertyApprovalStats({ period: 'monthly' }),
        getBookingRequestsAdmin({ limit: 10, sort_by: 'created_at', sort_order: 'desc' }),
        getSystemHealth(),
        getFinancialReports({ period: 'monthly' }),
        getActivityLogs({ limit: 10 }),
        getReportedContent({ limit: 10, status: 'pending' }),
        getSystemConfig()
      ]);

      if (statsResponse.status === 'fulfilled') {
        setDashboardStats(statsResponse.value);
      }
      
      if (userStatsResponse.status === 'fulfilled') {
        setUserStats(userStatsResponse.value);
      }
      
      if (propertyStatsResponse.status === 'fulfilled') {
        setPropertyStats(propertyStatsResponse.value);
      }
      
      if (bookingStatsResponse.status === 'fulfilled') {
        setBookingStats(bookingStatsResponse.value.bookings || []);
      }
      
      if (healthResponse.status === 'fulfilled') {
        setSystemHealth(healthResponse.value);
      }
      
      if (financialResponse.status === 'fulfilled') {
        setFinancialReports(financialResponse.value);
      }
      
      if (logsResponse.status === 'fulfilled') {
        setActivityLogs(logsResponse.value.logs || []);
      }
      
      if (reportsResponse.status === 'fulfilled') {
        setReportedContent(reportsResponse.value.reports || []);
      }
      
      if (configResponse.status === 'fulfilled') {
        setSystemConfig(configResponse.value);
      }
      
    } catch (error) {
      console.error('Error loading admin data:', error);
      setSnackbar({
        open: true,
        message: 'Error loading admin dashboard data',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
    setSnackbar({
      open: true,
      message: 'Dashboard data refreshed successfully',
      severity: 'success'
    });
  };

  const handleConfigUpdate = async (newConfig) => {
    try {
      await updateSystemConfig(newConfig);
      setSystemConfig(newConfig);
      setConfigDialog(false);
      setSnackbar({
        open: true,
        message: 'System configuration updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating config:', error);
      setSnackbar({
        open: true,
        message: 'Error updating system configuration',
        severity: 'error'
      });
    }
  };

  const handleCreateAnnouncement = async () => {
    try {
      await createAnnouncement(newAnnouncement);
      setAnnouncementDialog(false);
      setNewAnnouncement({ title: '', content: '', priority: 'normal' });
      setSnackbar({
        open: true,
        message: 'Announcement created successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error creating announcement:', error);
      setSnackbar({
        open: true,
        message: 'Error creating announcement',
        severity: 'error'
      });
    }
  };

  const handleExportData = async (dataType, format = 'csv') => {
    try {
      const blob = await exportAdminData({ data_type: dataType, format });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${dataType}_export.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setSnackbar({
        open: true,
        message: `${dataType} data exported successfully`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      setSnackbar({
        open: true,
        message: 'Error exporting data',
        severity: 'error'
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Admin Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<AnnouncementIcon />}
            onClick={() => setAnnouncementDialog(true)}
          >
            Create Announcement
          </Button>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setConfigDialog(true)}
          >
            System Config
          </Button>
          <Button
            variant="contained"
            startIcon={refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {systemHealth && systemHealth.status !== 'healthy' && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          System health warning detected. Some services may be experiencing issues.
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={dashboardStats?.users?.total || 0}
            icon={<PeopleIcon fontSize="large" />}
            color="primary"
            trend={userStats?.growth_rate}
            subtitle={`${dashboardStats?.users?.new_this_month || 0} new this month`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Properties"
            value={dashboardStats?.properties?.total || 0}
            icon={<HomeIcon fontSize="large" />}
            color="secondary"
            trend={propertyStats?.growth_rate}
            subtitle={`${dashboardStats?.properties?.pending || 0} pending approval`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Bookings"
            value={dashboardStats?.bookings?.total || 0}
            icon={<BookingIcon fontSize="large" />}
            color="info"
            subtitle={`${dashboardStats?.bookings?.pending || 0} pending`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Revenue (This Month)"
            value={formatCurrency(dashboardStats?.revenue?.this_month)}
            icon={<MoneyIcon fontSize="large" />}
            color="success"
            subtitle={`Total: ${formatCurrency(dashboardStats?.revenue?.total)}`}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Booking Requests
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Guest</TableCell>
                      <TableCell>Property</TableCell>
                      <TableCell>Dates</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Created</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bookingStats.slice(0, 5).map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>#{booking.id}</TableCell>
                        <TableCell>{booking.first_name} {booking.last_name}</TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {booking.property_type} - {booking.property_address}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(booking.check_in_date).toLocaleDateString()} - 
                            {new Date(booking.check_out_date).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={booking.status}
                            color={
                              booking.status === 'confirmed' ? 'success' :
                              booking.status === 'pending' ? 'warning' :
                              booking.status === 'rejected' ? 'error' : 'default'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatCurrency(booking.total_price)}</TableCell>
                        <TableCell>{new Date(booking.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Health
              </Typography>
              {systemHealth ? (
                <Box>
                  <SystemHealthIndicator 
                    status={systemHealth.database?.status} 
                    label="Database" 
                  />
                  <SystemHealthIndicator 
                    status={systemHealth.server?.status} 
                    label="Server" 
                  />
                  <SystemHealthIndicator 
                    status={systemHealth.storage?.status} 
                    label="Storage" 
                  />
                  <SystemHealthIndicator 
                    status={systemHealth.memory?.status} 
                    label="Memory" 
                  />
                  {systemHealth.server?.uptime && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Uptime: {Math.round(systemHealth.server.uptime / 3600)} hours
                    </Typography>
                  )}
                </Box>
              ) : (
                <Typography>Health data unavailable</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Statistics
              </Typography>
              {userStats && (
                <Box>
                  <Typography variant="body2">
                    <strong>Total Users:</strong> {userStats.total_users}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Active Users:</strong> {userStats.active_users}
                  </Typography>
                  <Typography variant="body2">
                    <strong>New Registrations:</strong> {userStats.new_registrations}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Retention Rate:</strong> {userStats.user_retention_rate}%
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Role Distribution:
                  </Typography>
                  {userStats.role_distribution && Object.entries(userStats.role_distribution).map(([role, count]) => (
                    <Box key={role} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {role}:
                      </Typography>
                      <Typography variant="body2">{count}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Property Approval Statistics
              </Typography>
              {propertyStats && (
                <Box>
                  <Typography variant="body2">
                    <strong>Total Submitted:</strong> {propertyStats.total_submitted}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Approved:</strong> {propertyStats.total_approved}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Rejected:</strong> {propertyStats.total_rejected}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Pending:</strong> {propertyStats.pending_approval}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Approval Rate:</strong> {propertyStats.approval_rate}%
                  </Typography>
                  <Typography variant="body2">
                    <strong>Avg Approval Time:</strong> {propertyStats.average_approval_time} hours
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Recent Activity Logs
                </Typography>
                <Button
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleExportData('activity_logs')}
                >
                  Export
                </Button>
              </Box>
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {activityLogs.map((log, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                    <Typography variant="body2">
                      <strong>{log.user_name || 'System'}</strong> {log.action}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(log.created_at)}
                    </Typography>
                    {log.details && (
                      <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                        {log.details}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Reported Content
              </Typography>
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {reportedContent.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No pending reports
                  </Typography>
                ) : (
                  reportedContent.map((report, index) => (
                    <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                      <Typography variant="body2">
                        <strong>{report.report_type}</strong> - {report.content_type}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {report.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Reported: {formatDate(report.created_at)}
                      </Typography>
                    </Box>
                  ))
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {financialReports && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Financial Overview
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleExportData('financial_reports')}
                  >
                    Export Report
                  </Button>
                </Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Total Revenue
                    </Typography>
                    <Typography variant="h5" color="success.main">
                      {formatCurrency(financialReports.total_revenue)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Service Fees
                    </Typography>
                    <Typography variant="h5">
                      {formatCurrency(financialReports.service_fees_collected)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Owner Earnings
                    </Typography>
                    <Typography variant="h5">
                      {formatCurrency(financialReports.property_owner_earnings)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Top Properties
                    </Typography>
                    <Typography variant="body2">
                      {financialReports.top_earning_properties?.length || 0} high performers
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Dialog open={configDialog} onClose={() => setConfigDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>System Configuration</DialogTitle>
        <DialogContent>
          {systemConfig && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={systemConfig.maintenance_mode}
                        onChange={(e) => setSystemConfig(prev => ({ ...prev, maintenance_mode: e.target.checked }))}
                      />
                    }
                    label="Maintenance Mode"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={systemConfig.registration_enabled}
                        onChange={(e) => setSystemConfig(prev => ({ ...prev, registration_enabled: e.target.checked }))}
                      />
                    }
                    label="User Registration Enabled"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Max Properties Per Owner"
                    value={systemConfig.max_properties_per_owner}
                    onChange={(e) => setSystemConfig(prev => ({ ...prev, max_properties_per_owner: parseInt(e.target.value) }))}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Booking Advance Days"
                    value={systemConfig.booking_advance_days}
                    onChange={(e) => setSystemConfig(prev => ({ ...prev, booking_advance_days: parseInt(e.target.value) }))}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Service Fee Percentage"
                    value={systemConfig.service_fee_percentage}
                    onChange={(e) => setSystemConfig(prev => ({ ...prev, service_fee_percentage: parseFloat(e.target.value) }))}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={systemConfig.system_notifications}
                        onChange={(e) => setSystemConfig(prev => ({ ...prev, system_notifications: e.target.checked }))}
                      />
                    }
                    label="System Notifications"
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigDialog(false)}>Cancel</Button>
          <Button onClick={() => handleConfigUpdate(systemConfig)} variant="contained">
            Save Configuration
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={announcementDialog} onClose={() => setAnnouncementDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Announcement</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={newAnnouncement.title}
              onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Content"
              value={newAnnouncement.content}
              onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
              sx={{ mb: 3 }}
            />
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={newAnnouncement.priority}
                label="Priority"
                onChange={(e) => setNewAnnouncement(prev => ({ ...prev, priority: e.target.value }))}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnnouncementDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateAnnouncement} 
            variant="contained"
            disabled={!newAnnouncement.title || !newAnnouncement.content}
          >
            Create Announcement
          </Button>
        </DialogActions>
      </Dialog>

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Container>
  );
};

export default AdminHome;