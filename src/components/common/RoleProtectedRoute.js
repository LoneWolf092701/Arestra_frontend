import React from 'react';
import { Navigate } from 'react-router-dom';

const RoleProtectedRoute = ({ allowedRoles, children }) => {
  const userRole = localStorage.getItem('userRole');
  
  // If user's role is not among the allowed roles, redirect to an unauthorized page or default page
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
};

export default RoleProtectedRoute;
