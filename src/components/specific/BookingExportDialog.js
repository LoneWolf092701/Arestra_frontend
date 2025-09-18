import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  TextField,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  RadioGroup,
  Radio
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
  FileDownload as FileDownloadIcon,
  TableChart as TableChartIcon,
  PictureAsPdf as PdfIcon,
  Assessment as ReportIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { useTheme } from '../../contexts/ThemeContext';
import { exportBookingData, exportBookingPayments, generateBookingReport, getBookingExportStats } from '../../api/adminAPI';

const BookingExportDialog = ({ open, onClose, currentFilters = {} }) => {
  const { theme, isDark } = useTheme();
  
  const [exportType, setExportType] = useState('bookings');
  const [format, setFormat] = useState('csv');
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [status, setStatus] = useState('all');
  const [paymentMethod, setPaymentMethod] = useState('all');
  const [reportType, setReportType] = useState('summary');
  
  // Data inclusion options
  const [includeGuestDetails, setIncludeGuestDetails] = useState(true);
  const [includePropertyDetails, setIncludePropertyDetails] = useState(true);
  const [includePaymentDetails, setIncludePaymentDetails] = useState(true);
  const [includeOwnerDetails, setIncludeOwnerDetails] = useState(false);
  const [includeCharts, setIncludeCharts] = useState(true);
  
  const [exporting, setExporting] = useState(false);
  const [exportStats, setExportStats] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load export statistics when dialog opens
  useEffect(() => {
    if (open) {
      loadExportStats();
    }
  }, [open, status, dateFrom, dateTo]);

  // Apply current filters
  useEffect(() => {
    if (currentFilters.status && currentFilters.status !== 'all') {
      setStatus(currentFilters.status);
    }
  }, [currentFilters]);

  const loadExportStats = async () => {
    try {
      const stats = await getBookingExportStats({
        status: status,
        date_from: dateFrom ? dayjs(dateFrom).format('YYYY-MM-DD') : undefined,
        date_to: dateTo ? dayjs(dateTo).format('YYYY-MM-DD') : undefined
      });
      setExportStats(stats);
    } catch (error) {
      console.error('Error loading export stats:', error);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setError('');
    setSuccess('');

    try {
      let result;
      
      const options = {
        format,
        date_from: dateFrom ? dayjs(dateFrom).format('YYYY-MM-DD') : undefined,
        date_to: dateTo ? dayjs(dateTo).format('YYYY-MM-DD') : undefined
      };

      switch (exportType) {
        case 'bookings':
          result = await exportBookingData({
            ...options,
            status,
            include_guest_details: includeGuestDetails,
            include_property_details: includePropertyDetails,
            include_payment_details: includePaymentDetails,
            include_owner_details: includeOwnerDetails
          });
          break;
          
        case 'payments':
          result = await exportBookingPayments({
            ...options,
            payment_method: paymentMethod
          });
          break;
          
        case 'report':
          result = await generateBookingReport({
            ...options,
            report_type: reportType,
            format: format === 'csv' ? 'pdf' : format, // Reports default to PDF
            include_charts: includeCharts
          });
          break;
          
        default:
          throw new Error('Invalid export type');
      }

      setSuccess(result.message);
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Export error:', error);
      
      // Check if it's a backend endpoint not found error
      if (error.message?.includes('Request failed with status code 404')) {
        setError('Export functionality is not available yet. The backend endpoints need to be implemented.');
      } else if (error.message?.includes('Request failed with status code 500')) {
        setError('Server error occurred during export. Please check the backend implementation.');
      } else {
        setError(error.message || 'Export failed. Please try again.');
      }
    } finally {
      setExporting(false);
    }
  };

  const getExportDescription = () => {
    switch (exportType) {
      case 'bookings':
        return 'Export detailed booking request data including guest information, property details, and booking status.';
      case 'payments':
        return 'Export payment transaction data including payment methods, amounts, and transaction status.';
      case 'report':
        return 'Generate a comprehensive analytics report with charts and statistics.';
      default:
        return '';
    }
  };

  const getFormatOptions = () => {
    if (exportType === 'report') {
      return [
        { value: 'pdf', label: 'PDF Report', icon: <PdfIcon /> },
        { value: 'xlsx', label: 'Excel Report', icon: <TableChartIcon /> }
      ];
    }
    return [
      { value: 'csv', label: 'CSV File', icon: <TableChartIcon /> },
      { value: 'xlsx', label: 'Excel File', icon: <TableChartIcon /> }
    ];
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: isDark ? theme.cardBackground : '#ffffff',
            color: isDark ? theme.textPrimary : 'inherit'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: `1px solid ${isDark ? theme.border : 'rgba(0, 0, 0, 0.12)'}`,
          backgroundColor: isDark ? theme.cardBackground : '#ffffff'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FileDownloadIcon sx={{ color: theme.primary }} />
            <Typography variant="h6" sx={{ color: isDark ? theme.textPrimary : 'inherit' }}>
              Export Booking Data
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ 
          p: 3,
          backgroundColor: isDark ? theme.cardBackground : '#ffffff'
        }}>
          {/* Export Type Selection */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ 
              mb: 2, 
              fontWeight: 'bold',
              color: isDark ? theme.textPrimary : 'inherit'
            }}>
              Export Type
            </Typography>
            <RadioGroup
              value={exportType}
              onChange={(e) => setExportType(e.target.value)}
            >
              <FormControlLabel
                value="bookings"
                control={<Radio sx={{ color: theme.primary }} />}
                label={
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      Booking Requests
                    </Typography>
                    <Typography variant="caption" sx={{ color: isDark ? theme.textSecondary : 'text.secondary' }}>
                      Complete booking data with guest and property information
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="payments"
                control={<Radio sx={{ color: theme.primary }} />}
                label={
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      Payment Transactions
                    </Typography>
                    <Typography variant="caption" sx={{ color: isDark ? theme.textSecondary : 'text.secondary' }}>
                      Payment data including methods and transaction details
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="report"
                control={<Radio sx={{ color: theme.primary }} />}
                label={
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      Analytics Report
                    </Typography>
                    <Typography variant="caption" sx={{ color: isDark ? theme.textSecondary : 'text.secondary' }}>
                      Comprehensive report with charts and statistics
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </Box>

          <Divider sx={{ my: 3, borderColor: isDark ? theme.divider : 'rgba(0, 0, 0, 0.12)' }} />

          {/* Format Selection */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Export Format</InputLabel>
                <Select
                  value={format}
                  label="Export Format"
                  onChange={(e) => setFormat(e.target.value)}
                >
                  {getFormatOptions().map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {option.icon}
                        {option.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Status Filter */}
            {exportType === 'bookings' && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status Filter</InputLabel>
                  <Select
                    value={status}
                    label="Status Filter"
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="payment_submitted">Payment Submitted</MenuItem>
                    <MenuItem value="confirmed">Confirmed</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Payment Method Filter */}
            {exportType === 'payments' && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={paymentMethod}
                    label="Payment Method"
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <MenuItem value="all">All Methods</MenuItem>
                    <MenuItem value="stripe">Card Payment</MenuItem>
                    <MenuItem value="stripe_dummy">Card Payment (Processed)</MenuItem>
                    <MenuItem value="receipt_upload">Bank Transfer</MenuItem>
                    <MenuItem value="cash">Cash</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Report Type */}
            {exportType === 'report' && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Report Type</InputLabel>
                  <Select
                    value={reportType}
                    label="Report Type"
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    <MenuItem value="summary">Summary Report</MenuItem>
                    <MenuItem value="detailed">Detailed Analytics</MenuItem>
                    <MenuItem value="financial">Financial Report</MenuItem>
                    <MenuItem value="performance">Performance Metrics</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>

          {/* Date Range */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ 
              mb: 2, 
              fontWeight: 'bold',
              color: isDark ? theme.textPrimary : 'inherit'
            }}>
              Date Range (Optional)
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="From Date"
                  value={dateFrom}
                  onChange={setDateFrom}
                  maxDate={dayjs()}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth 
                      sx={{
                        '& .MuiInputBase-root': {
                          backgroundColor: isDark ? theme.inputBackground : '#ffffff',
                        }
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="To Date"
                  value={dateTo}
                  onChange={setDateTo}
                  minDate={dateFrom}
                  maxDate={dayjs()}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth 
                      sx={{
                        '& .MuiInputBase-root': {
                          backgroundColor: isDark ? theme.inputBackground : '#ffffff',
                        }
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Data Inclusion Options */}
          {exportType === 'bookings' && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" sx={{ 
                mb: 2, 
                fontWeight: 'bold',
                color: isDark ? theme.textPrimary : 'inherit'
              }}>
                Include Data
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={includeGuestDetails}
                        onChange={(e) => setIncludeGuestDetails(e.target.checked)}
                        sx={{ color: theme.primary }}
                      />
                    }
                    label="Guest Details"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={includePropertyDetails}
                        onChange={(e) => setIncludePropertyDetails(e.target.checked)}
                        sx={{ color: theme.primary }}
                      />
                    }
                    label="Property Details"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={includePaymentDetails}
                        onChange={(e) => setIncludePaymentDetails(e.target.checked)}
                        sx={{ color: theme.primary }}
                      />
                    }
                    label="Payment Details"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={includeOwnerDetails}
                        onChange={(e) => setIncludeOwnerDetails(e.target.checked)}
                        sx={{ color: theme.primary }}
                      />
                    }
                    label="Owner Information"
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Report Options */}
          {exportType === 'report' && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" sx={{ 
                mb: 2, 
                fontWeight: 'bold',
                color: isDark ? theme.textPrimary : 'inherit'
              }}>
                Report Options
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeCharts}
                    onChange={(e) => setIncludeCharts(e.target.checked)}
                    sx={{ color: theme.primary }}
                  />
                }
                label="Include Charts and Graphs"
              />
            </Box>
          )}

          {/* Export Statistics */}
          {exportStats && (
            <Card sx={{ 
              mt: 3, 
              backgroundColor: isDark ? theme.surfaceBackground : '#f8f9fa',
              border: isDark ? `1px solid ${theme.border}` : 'none'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <InfoIcon sx={{ color: theme.primary }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    Export Preview
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: isDark ? theme.textSecondary : 'text.secondary' }}>
                      Total Records:
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.primary }}>
                      {exportStats.total_records?.toLocaleString() || 0}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: isDark ? theme.textSecondary : 'text.secondary' }}>
                      Total Revenue:
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.secondary }}>
                      LKR {exportStats.total_revenue?.toLocaleString() || 0}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Status Messages */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert 
              severity="success" 
              sx={{ mt: 2 }}
              icon={<CheckCircleIcon />}
            >
              {success}
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ 
          p: 3,
          backgroundColor: isDark ? theme.cardBackground : '#ffffff',
          borderTop: `1px solid ${isDark ? theme.border : 'rgba(0, 0, 0, 0.12)'}`
        }}>
          <Button 
            onClick={onClose} 
            disabled={exporting}
            sx={{ color: theme.primary }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleExport}
            disabled={exporting || (exportStats?.total_records === 0)}
            sx={{ 
              backgroundColor: theme.primary,
              '&:hover': { backgroundColor: theme.primaryDark }
            }}
          >
            {exporting ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                Exporting...
              </>
            ) : (
              <>
                <FileDownloadIcon sx={{ mr: 1 }} />
                Export Data
              </>
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default BookingExportDialog;