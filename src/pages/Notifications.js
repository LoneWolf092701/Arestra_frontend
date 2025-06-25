import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, List, ListItem, ListItemText } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { getPropertyComplaints } from '../api/userInteractionApi';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const complaintsData = await getPropertyComplaints();
        // Map the fetched complaints to the same notification shape.
        const complaintNotifications = complaintsData.map(item => ({
          id: `c-${item.id}`, // prefix id to avoid collisions in case needed
          message: `Complaint on ${item.property_type} - ${item.unit_type}: ${item.complaint}`
        }));
        // Reset the notifications array with the new data
        setNotifications(complaintNotifications);
      } catch (error) {
        console.error('Error fetching complaints:', error);
      }
    };
    fetchComplaints();
  }, []);

  const handleDelete = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Notifications
      </Typography>
      {notifications.length === 0 ? (
        <Typography variant="body1" align="center">
          No new notifications.
        </Typography>
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
