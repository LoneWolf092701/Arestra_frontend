import React from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  IconButton, 
  useTheme,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { 
  NavigateBefore, 
  NavigateNext, 
  FirstPage, 
  LastPage 
} from '@mui/icons-material';

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPage = true,
  showInfo = true,
  showFirstLast = true,
  disabled = false,
  itemsPerPageOptions = [10, 12, 20, 50],
  size = 'medium'
}) => {
  const theme = useTheme();

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && !disabled) {
      onPageChange(newPage);
    }
  };

  const handleItemsPerPageChange = (event) => {
    if (onItemsPerPageChange && !disabled) {
      onItemsPerPageChange(parseInt(event.target.value));
    }
  };

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const startItem = totalItems > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1 && !showInfo) {
    return null;
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', sm: 'row' },
      justifyContent: 'space-between', 
      alignItems: { xs: 'stretch', sm: 'center' },
      gap: 2,
      mt: 3,
      p: 2,
      bgcolor: theme.palette.background.paper,
      borderRadius: 1,
      border: `1px solid ${theme.palette.divider}`
    }}>
      {showInfo && (
        <Typography variant="body2" color="text.secondary">
          Showing {startItem}-{endItem} of {totalItems} items
        </Typography>
      )}

      <Stack direction="row" spacing={2} alignItems="center">
        {showItemsPerPage && itemsPerPageOptions.length > 1 && (
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>Per page</InputLabel>
            <Select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              disabled={disabled}
              label="Per page"
            >
              {itemsPerPageOptions.map(option => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <Stack direction="row" spacing={1} alignItems="center">
          {showFirstLast && (
            <IconButton
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1 || disabled}
              size={size}
              aria-label="First page"
            >
              <FirstPage />
            </IconButton>
          )}

          <IconButton
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || disabled}
            size={size}
            aria-label="Previous page"
          >
            <NavigateBefore />
          </IconButton>

          {totalPages > 0 && getVisiblePages().map((page, index) => (
            page === '...' ? (
              <Typography key={index} variant="body2" sx={{ px: 1 }}>
                ...
              </Typography>
            ) : (
              <Button
                key={page}
                variant={currentPage === page ? 'contained' : 'outlined'}
                onClick={() => handlePageChange(page)}
                disabled={disabled}
                size={size}
                sx={{
                  minWidth: 40,
                  height: 40,
                  ...(currentPage === page && {
                    bgcolor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    '&:hover': {
                      bgcolor: theme.palette.primary.dark,
                    }
                  })
                }}
              >
                {page}
              </Button>
            )
          ))}

          <IconButton
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || disabled}
            size={size}
            aria-label="Next page"
          >
            <NavigateNext />
          </IconButton>

          {showFirstLast && (
            <IconButton
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages || disabled}
              size={size}
              aria-label="Last page"
            >
              <LastPage />
            </IconButton>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

export default Pagination;