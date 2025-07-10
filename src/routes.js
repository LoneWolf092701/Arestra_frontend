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
import PropertyOwnerBookings from './pages/PropertyOwnerBookings';

// User Pages - Now public
import UserHome from './pages/UserPages/UserHome';
import UserAllProperties from './pages/UserPages/UserAllProperties';
import UserPropertyViewPage from './pages/UserPages/UserViewProperty';
import UserBookingPage from "./pages/UserPages/UserBookingPage";
import UserFavouriteProperties from './pages/UserPages/UserFavouriteProperties';
import UserNotifications from './pages/UserPages/UserNotifications';

import ProfilePage from './pages/ProfilePage';

// Admin Pages
import AdminHome from './pages/AdminPages/AdminHome';
import AdminNewListings from './pages/AdminPages/AdminNewListing';
import AdminAllProperties from './pages/AdminPages/AdminAllProperties';

// This component wraps routes that require authentication
const PrivateRoute = ({ element }) => {
  return isAuthenticated() ? element : <Navigate to="/login" />;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        {/* Public Routes - Redirect root to user home */}
        <Route path="/" element={<Navigate to="/user-home" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup/>} />
        <Route path="/forgot-password" element={<ForgotPassword/>} />

        {/* Public User Pages - No authentication required */}
        <Route path="/user-home" element={<UserHome />} />
        <Route path="/user-allproperties" element={<UserAllProperties />} />
        <Route path="/user-viewproperty/:id" element={<UserPropertyViewPage />} />

        {/* Property View Routes for Authenticated Users */}
        <Route
          path="/propertyowner-viewproperty/:id"
          element={
            <PrivateRoute
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={['propertyowner']}>
                    <UserPropertyViewPage />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />
          }
        />

        <Route
          path="/admin-viewproperty/:id"
          element={
            <PrivateRoute
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <UserPropertyViewPage />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />
          }
        />

        {/* Booking requires authentication */}
        <Route
          path="/user-bookproperty/:id"
          element={
            <PrivateRoute
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={["user"]}>
                    <UserBookingPage/>
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />
          }
        />

        {/* User features that require authentication */}
        <Route
          path="/user-favourites"
          element={
            <PrivateRoute
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={["user"]}>
                    <UserFavouriteProperties/>
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />
          }
        />

        {/* User notifications route */}
        <Route
          path="/user-notifications"
          element={
            <PrivateRoute
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={["user"]}>
                    <UserNotifications/>
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />
          }
        />

        {/* User bookings route */}
        <Route
          path="/user-bookings"
          element={
            <PrivateRoute
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={["user"]}>
                    <div>User Bookings Page - Coming Soon</div>
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />
          }
        />

        {/* Messages route */}
        <Route
          path="/messages"
          element={
            <PrivateRoute
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={['user', 'propertyowner', 'admin']}>
                    <div>Messages Page - Coming Soon</div>
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />
          }
        />

        {/* Transactions route */}
        <Route
          path="/transactions"
          element={
            <PrivateRoute
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={['user', 'propertyowner', 'admin']}>
                    <div>Transactions Page - Coming Soon</div>
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />
          }
        />

        {/* Property Owner Routes - Protected by role-based access control */}
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

        {/* Property Owner Bookings Route */}
        <Route
          path="/bookings"
          element={
            <PrivateRoute
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={['propertyowner']}>
                    <PropertyOwnerBookings />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/home"
          element={
            <PrivateRoute
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <AdminHome />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />
          }
        />

        <Route
          path="/admin/new-listings"
          element={
            <PrivateRoute
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <AdminNewListings />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />
          }
        />

        <Route
          path="/admin/all-properties"
          element={
            <PrivateRoute
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <AdminAllProperties />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />
          }
        />

        {/* Profile Route - Available to all authenticated users */}
        <Route
          path="/profile"
          element={
            <PrivateRoute
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={['user', 'propertyowner', 'admin']}>
                    <ProfilePage />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />
          }
        />

        {/* Error Handling Route */}
        <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;