import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Slide from '@mui/material/Slide';

function SlideTransition(props) {
  return <Slide {...props} direction="up" />;
}

const AppSnackbar = ({ open, message, autoHideDuration = 3000, onClose }) => {
  return (
    <Snackbar
      open={open}
      onClose={onClose}
      message={message}
      autoHideDuration={autoHideDuration}
      TransitionComponent={SlideTransition}
    />
  );
};

export default AppSnackbar;
