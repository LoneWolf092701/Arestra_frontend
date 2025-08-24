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
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Home as HomeIcon,
  BookOnline as BookingIcon,
  AttachMoney as MoneyIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { getDashboardStats } from '../../api/adminAPI';
import { useTheme } from '../../contexts/ThemeContext';
import AppSnackbar from '../../components/common/AppSnackbar';
import { useNavigate } from 'react-router-dom';

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

const AdminHome = () => {
  const navigate = useNavigate();
  const { theme, isDark } = useTheme();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [statsResponse, dashboardResponse] = await Promise.allSettled([
        getDashboardStats(),
        fetch('/api/admin/dashboard', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Cache-Control': 'no-cache'
          }
        }).then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
      ]);

      if (statsResponse.status === 'fulfilled') {
        setDashboardData(prev => ({ ...prev, stats: statsResponse.value }));
      }

      if (dashboardResponse.status === 'fulfilled') {
        setDashboardData(prev => ({ 
          ...prev, 
          ...dashboardResponse.value,
          stats: prev?.stats || dashboardResponse.value.stats
        }));
      } else {
        console.error('Dashboard response error:', dashboardResponse.reason);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
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
    await loadDashboardData();
    setRefreshing(false);
    setSnackbar({
      open: true,
      message: 'Dashboard data refreshed successfully',
      severity: 'success'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
      case 'confirmed':
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
      case 'cancelled':
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
      case 'confirmed':
      case 'active':
        return <CheckCircleIcon fontSize="small" />;
      case 'pending':
        return <PendingIcon fontSize="small" />;
      case 'rejected':
      case 'cancelled':
      case 'inactive':
        return <ErrorIcon fontSize="small" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  const stats = dashboardData?.stats || {};

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Admin Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          Refresh Data
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats.users?.total || 0}
            icon={<PeopleIcon fontSize="large" />}
            color="primary"
            subtitle={`${stats.users?.new_this_month || 0} new this month`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Properties"
            value={stats.properties?.total || 0}
            icon={<HomeIcon fontSize="large" />}
            color="secondary"
            subtitle={`${stats.properties?.pending || 0} pending approval`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Bookings"
            value={stats.bookings?.total || 0}
            icon={<BookingIcon fontSize="large" />}
            color="info"
            subtitle={`${stats.bookings?.pending || 0} pending`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Monthly Revenue"
            value={formatCurrency(stats.revenue?.this_month || 0)}
            icon={<MoneyIcon fontSize="large" />}
            color="success"
            subtitle={`Total: ${formatCurrency(stats.revenue?.total || 0)}`}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Recent Booking Requests
                </Typography>
                <Button 
                  size="small" 
                  onClick={() => navigate('/admin/home')}
                  endIcon={<ViewIcon />}
                >
                  View All
                </Button>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Guest Name</TableCell>
                      <TableCell>Property</TableCell>
                      <TableCell>Check-in</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(dashboardData?.recent_bookings || []).slice(0, 5).map((booking) => (
                      <TableRow key={booking.id} hover>
                        <TableCell>{booking.id}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {booking.first_name} {booking.last_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {booking.tenant_email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {booking.property_type} - {booking.unit_type}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {booking.property_address}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(booking.check_in_date).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(booking.status)}
                            label={booking.status}
                            size="small"
                            color={getStatusColor(booking.status)}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {formatCurrency(booking.advance_amount)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            of {formatCurrency(booking.total_price)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {formatDate(booking.created_at)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!dashboardData?.recent_bookings || dashboardData.recent_bookings.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Typography color="text.secondary">
                            No recent bookings found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                 <Button
                  variant="outlined"
                  startIcon={<PeopleIcon />}
                  fullWidth
                  onClick={() => navigate('/admin/user-management')}
                >
                  Manage Users
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<HomeIcon />}
                  fullWidth
                  onClick={() => navigate('/admin/all-properties')}
                >
                  View All Properties
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PendingIcon />}
                  fullWidth
                  onClick={() => navigate('/admin/new-listings')}
                >
                  Pending Approvals ({stats.properties?.pending || 0})
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<BookingIcon />}
                  fullWidth
                  onClick={() => navigate('/admin/home')}
                >
                  Booking Management
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Pending Property Approvals
                </Typography>
                <Button 
                  size="small" 
                  onClick={() => navigate('/admin/new-listings')}
                  endIcon={<ViewIcon />}
                >
                  View All
                </Button>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Property</TableCell>
                      <TableCell>Owner</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Submitted</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(dashboardData?.recent_properties || []).slice(0, 5).map((property) => (
                      <TableRow key={property.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {property.address}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {property.owner_username}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {property.property_type}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {formatDate(property.created_at)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title="View Property">
                            <IconButton 
                              size="small"
                              onClick={() => navigate(`/admin/property/${property.id}`)}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!dashboardData?.recent_properties || dashboardData.recent_properties.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography color="text.secondary">
                            No pending approvals
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Recent User Registrations
                </Typography>
                <Button 
                  size="small" 
                  onClick={() => navigate('/admin/home')}
                  endIcon={<ViewIcon />}
                >
                  View All
                </Button>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Joined</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(dashboardData?.recent_users || []).slice(0, 5).map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {user.first_name && user.last_name 
                              ? `${user.first_name} ${user.last_name}` 
                              : user.username}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.role}
                            size="small"
                            color={user.role === 'admin' ? 'error' : user.role === 'propertyowner' ? 'warning' : 'primary'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(user.is_active ? 'active' : 'inactive')}
                            label={user.is_active ? 'Active' : 'Inactive'}
                            size="small"
                            color={getStatusColor(user.is_active ? 'active' : 'inactive')}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {formatDate(user.created_at)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!dashboardData?.recent_users || dashboardData.recent_users.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography color="text.secondary">
                            No recent users
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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