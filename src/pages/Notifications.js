import React, { useState } from 'react';
import { Box, Typography, IconButton, List, ListItem, ListItemText } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const initialNotifications = [
  { id: 1, message: "Your property has been approved." },
  { id: 2, message: "New booking request received." },
  { id: 3, message: "Payment has been successfully processed." },
  { id: 4, message: "A tenant has sent you a message." }
];

const Notifications = () => {
  const [notifications, setNotifications] = useState(initialNotifications);

  const handleDelete = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Notifications
      </Typography>
      {notifications.length === 0 ? (
        <Typography variant="body1" align="center">No new notifications.</Typography>
      ) : (
        <List>
          {notifications.map(notification => (
            <ListItem
              key={notification.id}
              secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(notification.id)}>
                  <CloseIcon />
                </IconButton>
              }
            >
              <ListItemText primary={notification.message} />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default Notifications;
