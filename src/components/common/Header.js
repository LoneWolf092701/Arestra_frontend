import React, { useContext } from 'react';
import { AppBar, Toolbar, Avatar, Box } from '@mui/material';
import HamburgerMenuDropdown from './HamburgerMenuDropdown';
import logo from '../../assets/images/Logo.png';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeContext } from '../../contexts/ThemeContext';

const Header = () => {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const isLoginPage = location.pathname === '/login';

  return (
    <AppBar
      position="static"
      color="default"
      elevation={0}
      sx={{ borderBottom: '1px solid #ccc', background: theme.primary }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box
          component="img"
          src={logo}
          alt="Logo"
          sx={{
            width: '250px',
            height: '68px',
            objectFit: 'contain',
            cursor: 'pointer',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.05)'
            }
          }}
          onClick={() => navigate('/home')}
        />
        {!isLoginPage && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <HamburgerMenuDropdown />
            <Avatar
              alt="User Avatar"
              src="https://via.placeholder.com/40"
              sx={{ ml: 2 }}
            />
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
