import React, { useState, useContext } from 'react';
import { Menu, MenuItem, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import {ThemeContext} from '../../contexts/ThemeContext';

const HamburgerMenuDropdown = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const { toggleTheme } = useContext(ThemeContext);

  const menuOptions = [
    'Messages',
    'Notifications',
    'Properties',
    'Booking Request',
    'Transaction History',
    'Account',
    'Logout',
    'Switch Theme'
  ];

  const handleMenuItemClick = (option) => {
    if (option === 'Properties') {
      navigate('/myproperties');
    }
    if (option === 'Notifications') {
      navigate('/notifications');
    }

    if(option === 'Switch Theme'){
      toggleTheme();
      // menuOptions.pop(-1);
    }
    
    if(option === 'Logout'){
      localStorage.removeItem('token');
      navigate('/login');
    }
    handleMenuClose();
  };

  return (
    <>
      <IconButton
        edge="start"
        color="inherit"
        aria-label="menu"
        onClick={handleMenuOpen}
      >
        <MenuIcon sx={{color:"#fff"}} />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {menuOptions.map((option, index) => (
          <MenuItem key={index} onClick={() => handleMenuItemClick(option)}>
            {option}
          </MenuItem>
        ))}
        {/* <button onClick={toggleTheme}>Toggle Theme</button> */}
      </Menu>
    </>
  );
};

export default HamburgerMenuDropdown;
