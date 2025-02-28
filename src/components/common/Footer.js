import React, { useContext } from 'react';
import { Box, Typography } from '@mui/material';
import logo from '../../assets/images/Logo.png';
import { ThemeContext } from '../../contexts/ThemeContext';

const Footer = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <Box
      component="footer"
      sx={{
        width: '100%',
        padding: '1rem',
        borderTop: '1px solid #EFF0F2',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: theme.primary,
        mt: 4,
      }}
    >
      <Box
        component="img"
        src={logo}
        alt="Logo"
        sx={{
          width: '250px',
          height: '68px',
          objectFit: 'contain',
          mb: 1,
        }}
      />
      <Typography variant="body2" sx={{ textAlign: 'center', color: '#EFF0F2' }}>
        &copy; 2025 StayWise.lk
      </Typography>
    </Box>
  );
};

export default Footer;
