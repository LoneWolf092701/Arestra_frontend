import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
  Tooltip,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Block as BlockIcon,
  CheckCircle as ActivateIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  AdminPanelSettings as AdminIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '../../contexts/ThemeContext';
import AppSnackbar from '../../components/common/AppSnackbar';
import { getUsers, updateUserStatus, getUserDetails } from '../../api/adminAPI';

const AdminUserManagement = () => {
  const { theme, isDark } = useTheme();
  
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    search: ''
  });
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetailsDialog, setUserDetailsDialog] = useState(false);
  const [statusDialog, setStatusDialog] = useState(false);
  const [statusAction, setStatusAction] = useState({ user: null, action: null });
  const [statusReason, setStatusReason] = useState('');
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  useEffect(() => {
    loadUsers();
  }, [page, rowsPerPage, filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers({
        page: page + 1,
        limit: rowsPerPage,
        role: filters.role,
        status: filters.status,
        search: filters.search,
        sort_by: 'created_at',
        sort_order: 'desc'
      });
      
      setUsers(response.users || []);
      setTotalUsers(response.pagination?.total || 0);
    } catch (error) {
      console.error('Error loading users:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load users',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const handleViewUser = async (userId) => {
    try {
      const userDetails = await getUserDetails(userId);
      setSelectedUser(userDetails);
      setUserDetailsDialog(true);
    } catch (error) {
      console.error('Error loading user details:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load user details',
        severity: 'error'
      });
    }
  };

  const handleStatusAction = (user, action) => {
    setStatusAction({ user, action });
    setStatusDialog(true);
    setStatusReason('');
  };

  const confirmStatusAction = async () => {
    try {
      await updateUserStatus(statusAction.user.id, statusAction.action, statusReason);
      
      setUsers(prev => 
        prev.map(user => 
          user.id === statusAction.user.id 
            ? { ...user, is_active: statusAction.action === 'activate' ? 1 : 0 }
            : user
        )
      );
      
      setStatusDialog(false);
      setStatusAction({ user: null, action: null });
      setStatusReason('');
      
      setSnackbar({
        open: true,
        message: `User ${statusAction.action}d successfully`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update user status',
        severity: 'error'
      });
    }
  };
  
  const handleVerifyEmail = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/verify-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      setSnackbar({
        open: true,
        message: 'User email verified successfully',
        severity: 'success'
      });
      loadUsers(); // Reload the users list
    } else {
      throw new Error('Failed to verify email');
    }
  } catch (error) {
    setSnackbar({
      open: true,
      message: 'Failed to verify user email',
      severity: 'error'
    });
  }
};

const handleResendVerification = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/resend-verification`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      setSnackbar({
        open: true,
        message: 'Verification email sent successfully',
        severity: 'success'
      });
    } else {
      throw new Error('Failed to send verification email');
    }
  } catch (error) {
    setSnackbar({
      open: true,
      message: 'Failed to send verification email',
      severity: 'error'
    });
  }
};

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <AdminIcon fontSize="small" />;
      case 'propertyowner':
        return <BusinessIcon fontSize="small" />;
      default:
        return <PersonIcon fontSize="small" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'propertyowner':
        return 'warning';
      default:
        return 'primary';
    }
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'success' : 'error';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading && users.length === 0) {
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
          User Management
        </Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Search users..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={filters.role}
                  label="Role"
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                >
                  <MenuItem value="all">All Roles</MenuItem>
                  <MenuItem value="user">Users</MenuItem>
                  <MenuItem value="propertyowner">Property Owners</MenuItem>
                  <MenuItem value="admin">Admins</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="contained"
                onClick={loadUsers}
                disabled={loading}
                sx={{ height: 56 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Search'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Email Verified</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {user.first_name && user.last_name 
                            ? `${user.first_name} ${user.last_name}` 
                            : user.username}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ID: {user.id}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {user.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getRoleIcon(user.role)}
                        label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        size="small"
                        color={getRoleColor(user.role)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.is_active ? 'Active' : 'Inactive'}
                        size="small"
                        color={getStatusColor(user.is_active)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
  <Chip
    size="small"
    label={user.email_verified ? 'Verified' : 'Unverified'}
    color={user.email_verified ? 'success' : 'warning'}
    variant={user.email_verified ? 'filled' : 'outlined'}
    icon={user.email_verified ? <CheckCircleIcon /> : <CloseIcon />}
  />
</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(user.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewUser(user.id)}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        {user.is_active ? (
                          <Tooltip title="Deactivate User">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleStatusAction(user, 'deactivate')}
                            >
                              <BlockIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Activate User">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleStatusAction(user, 'activate')}
                            >
                              <ActivateIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {!user.email_verified && (
  <>
    <Tooltip title="Verify Email">
      <IconButton
        size="small"
        onClick={() => handleVerifyEmail(user.id)}
        sx={{ color: theme.success }}
      >
        <CheckCircleIcon />
      </IconButton>
    </Tooltip>
    <Tooltip title="Resend Verification">
      <IconButton
        size="small"
        onClick={() => handleResendVerification(user.id)}
        sx={{ color: theme.info }}
      >
        <EmailIcon />
      </IconButton>
    </Tooltip>
  </>
)}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No users found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            component="div"
            count={totalUsers}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </CardContent>
      </Card>

      <Dialog
        open={userDetailsDialog}
        onClose={() => setUserDetailsDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Grid container spacing={3} sx={{ pt: 2 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom sx={{ color: theme.primary, fontWeight: 'bold' }}>
                  Basic Information
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>User ID:</strong> {selectedUser.user?.id}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Username:</strong> {selectedUser.user?.username}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Email:</strong> {selectedUser.user?.email}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Role:</strong> {selectedUser.user?.role}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Status:</strong> {selectedUser.user?.is_active ? 'Active' : 'Inactive'}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Email Verified:</strong> {selectedUser.user?.email_verified ? 'Yes' : 'No'}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Created:</strong> {formatDate(selectedUser.user?.created_at)}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Updated:</strong> {formatDate(selectedUser.user?.updated_at)}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Last Login:</strong> {selectedUser.user?.last_login ? formatDate(selectedUser.user.last_login) : 'Never'}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom sx={{ color: theme.primary, fontWeight: 'bold' }}>
                  Personal Information
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>First Name:</strong> {selectedUser.user?.first_name || 'N/A'}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Last Name:</strong> {selectedUser.user?.last_name || 'N/A'}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Phone:</strong> {selectedUser.user?.phone || 'N/A'}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Gender:</strong> {selectedUser.user?.gender || 'N/A'}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Birth Date:</strong> {selectedUser.user?.birthdate || 'N/A'}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Nationality:</strong> {selectedUser.user?.nationality || 'N/A'}
                </Typography>
              </Grid>

              {selectedUser.user?.role === 'propertyowner' && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: theme.primary, fontWeight: 'bold', mt: 2 }}>
                    Business Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" gutterBottom>
                        <strong>Business Name:</strong> {selectedUser.user?.business_name || 'N/A'}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Contact Person:</strong> {selectedUser.user?.contact_person || 'N/A'}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Business Type:</strong> {selectedUser.user?.business_type || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" gutterBottom>
                        <strong>Business Registration:</strong> {selectedUser.user?.business_registration || 'N/A'}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Business Address:</strong> {selectedUser.user?.business_address || 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              )}

              {selectedUser.user?.role === 'admin' && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: theme.primary, fontWeight: 'bold', mt: 2 }}>
                    Administrative Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" gutterBottom>
                        <strong>Department:</strong> {selectedUser.user?.department || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" gutterBottom>
                        <strong>Admin Level:</strong> {selectedUser.user?.admin_level || 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              )}

              {selectedUser.properties && selectedUser.properties.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: theme.primary, fontWeight: 'bold', mt: 2 }}>
                    Properties ({selectedUser.properties.length})
                  </Typography>
                  <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                    {selectedUser.properties.map((property, index) => (
                      <Card key={property.id} sx={{ mb: 1, p: 1 }}>
                        <Typography variant="body2">
                          <strong>#{property.id}</strong> - {property.property_type} - {property.unit_type}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {property.address} - LKR {property.price} - {property.approval_status}
                        </Typography>
                      </Card>
                    ))}
                  </Box>
                </Grid>
              )}

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom sx={{ color: theme.primary, fontWeight: 'bold', mt: 2 }}>
                  System Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Properties:</strong> {selectedUser.properties?.length || 0}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Account Status:</strong> {selectedUser.user?.is_active ? 'Active' : 'Inactive'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Verification Status:</strong> {selectedUser.user?.email_verified ? 'Verified' : 'Unverified'}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={statusDialog}
        onClose={() => setStatusDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {statusAction.action === 'activate' ? 'Activate User' : 'Deactivate User'}
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to {statusAction.action} user "{statusAction.user?.username}"?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Reason (Optional)"
            value={statusReason}
            onChange={(e) => setStatusReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog(false)}>Cancel</Button>
          <Button 
            onClick={confirmStatusAction}
            color={statusAction.action === 'activate' ? 'success' : 'error'}
            variant="contained"
          >
            {statusAction.action === 'activate' ? 'Activate' : 'Deactivate'}
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

export default AdminUserManagement;