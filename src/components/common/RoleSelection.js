import React, { useState } from 'react';
import { Box, Typography, RadioGroup, FormControlLabel, Radio, Button } from '@mui/material';

const RoleSelection = ({ selectedRole, setSelectedRole, onNext }) => {
  const [error, setError] = useState('');

  const handleNext = (e) => {
    e.preventDefault();
    if (!selectedRole) {
      setError('Please select a role.');
      return;
    }
    setError('');
    onNext();
  };

  return (
    <Box component="form" onSubmit={handleNext} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h6">Select Your Role</Typography>
      <RadioGroup value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
        <FormControlLabel value="propertyowner" control={<Radio />} label="Property Owner" />
        <FormControlLabel value="admin" control={<Radio />} label="Admin" />
        <FormControlLabel value="user" control={<Radio />} label="User" />
      </RadioGroup>
      {error && (
        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
      <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
        Next
      </Button>
    </Box>
  );
};

export default RoleSelection;
