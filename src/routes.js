import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import MyProperties from './pages/MyProperties';
import Notifications from './pages/Notifications';
import AddProperty from './pages/AddProperty';
import AddPropertyDetails from './pages/AddPropertyDetails';
import UpdateProperty from './pages/UpdateProperty';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Header from './components/common/Header';
import { isAuthenticated } from './utils/auth';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleProtectedRoute from './components/common/RoleProtectedRoute';

const PrivateRoute = ({ element }) => {
  return isAuthenticated() ? element : <Navigate to="/login" />;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup/>} />
        <Route path="/forgot-password" element={<ForgotPassword/>} />

        <Route
          path="/home"
          element={
            <PrivateRoute
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={['propertyowner']}>
                    <Home />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />
          }
        />

        <Route
          path="/myproperties"
          element={
            <PrivateRoute
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={['propertyowner']}>
                    <MyProperties />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />
          }
        />

        <Route
          path="/notifications"
          element={
            <PrivateRoute
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={['propertyowner']}>
                    <Notifications />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />
          }
        />

        <Route
          path="/addproperty"
          element={
            <PrivateRoute
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={['propertyowner']}>
                    <AddProperty />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />
          }
        />
        <Route
          path="/addproperty/details"
          element={
            <PrivateRoute
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={['propertyowner']}>
                    <AddPropertyDetails />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />
          }
        />
        <Route
          path="/updateproperty/:id"
          element={
            <PrivateRoute
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={['propertyowner']}>
                    <UpdateProperty />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />
          }
        />

        {/* Unauthorized page for users who try to access a restricted route */}
        <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
