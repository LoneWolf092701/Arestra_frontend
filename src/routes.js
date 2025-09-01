import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/common/Header';
import { isAuthenticated, getUserRole, getHomePathForRole } from './utils/auth';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleProtectedRoute from './components/common/RoleProtectedRoute';

import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';

import Home from './pages/Home';
import MyProperties from './pages/MyProperties';
import Notifications from './pages/Notifications';
import AddProperty from './pages/AddProperty';
import AddPropertyDetails from './pages/AddPropertyDetails';
import UpdateProperty from './pages/UpdateProperty';
import PropertyOwnerBookings from './pages/PropertyOwnerBookings';

import UserHome from './pages/UserPages/UserHome';
import UserAllProperties from './pages/UserPages/UserAllProperties';
import UserPropertyViewPage from './pages/UserPages/UserViewProperty';
import UserBookingPage from "./pages/UserPages/UserBookingPage";
import UserFavouriteProperties from './pages/UserPages/UserFavouriteProperties';
import UserNotifications from './pages/UserPages/UserNotifications';
import MyBookingsPage from './pages/UserPages/MyBookingsPage';
import PaymentPage from './pages/UserPages/PaymentPage';
import OwnerPropertyView from './pages/OwnerPropertyView';


import AdminHome from './pages/AdminPages/AdminHome';
import AdminNewListings from './pages/AdminPages/AdminNewListing';
import AdminAllProperties from './pages/AdminPages/AdminAllProperties';
import AdminPropertyView from './pages/AdminPages/AdminPropertyView';
import AdminUserManagement from './pages/AdminPages/AdminUserManagement';

import ProfilePage from './pages/ProfilePage';

import EmailVerification from './pages/EmailVerification';
import HelpSupport from './pages/HelpSupport';
import SettingsPage from './components/settings/SettingsPage';
import AboutUsPage from './pages/AboutUsPage';


const PrivateRoute = ({ element }) => {
  return isAuthenticated() ?
    element : <Navigate to="/login" replace />;
};

const PublicRoute = ({ element }) => {
  if (isAuthenticated()) {
    const userRole = getUserRole();
    return <Navigate to={getHomePathForRole(userRole)} replace />;
  }
  return element;
};

const SmartRedirect = () => {
  if (isAuthenticated()) {
    const userRole = getUserRole();
    return <Navigate to={getHomePathForRole(userRole)} replace />;
  }
  return <Navigate to="/user-home" replace />;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<SmartRedirect />} />
        
        <Route 
          path="/login" 
          element={<PublicRoute element={<Login />} />} 
        />
        <Route 
          path="/signup" 
          element={<PublicRoute element={<Signup />} />} 
        />
        <Route 
          path="/forgot-password" 
          element={<PublicRoute element={<ForgotPassword />} />} 
        />

        <Route path="/verify-email" element={<EmailVerification />} />
        
        <Route path="/help-support" element={<HelpSupport />} />

        <Route path="/about-us" element={<AboutUsPage />} />
        
        <Route 
  path="/settings" 
  element={<PrivateRoute element={<SettingsPage />} />} 
/>
        
        <Route path="/user-home" element={<UserHome />} />
        <Route path="/user-allproperties" element={<UserAllProperties />} />
        <Route path="/user-all-properties" element={<UserAllProperties />} />
        <Route path="/user-properties" element={<UserAllProperties />} />
        <Route path="/user-property-view/:id" element={<UserPropertyViewPage />} />
        <Route path="/property/:id" element={<UserPropertyViewPage />} />
        
        <Route 
          path="/user-booking/:id" 
          element={
            <RoleProtectedRoute 
              allowedRoles={['user']} 
              element={<UserBookingPage />} 
            />
          } 
        />
        <Route 
          path="/user-favorites" 
          element={
            <RoleProtectedRoute 
              allowedRoles={['user']} 
              element={<UserFavouriteProperties />} 
            />
          } 
        />
        <Route 
          path="/user-favourites" 
          element={
            <RoleProtectedRoute 
              allowedRoles={['user']} 
              element={<UserFavouriteProperties />} 
            />
          } 
        />
        <Route 
          path="/user-notifications" 
          element={
            <RoleProtectedRoute 
              allowedRoles={['user']} 
              element={<UserNotifications />} 
            />
          } 
        />
        <Route 
          path="/user-bookings" 
          element={
            <RoleProtectedRoute 
              allowedRoles={['user']} 
              element={<MyBookingsPage />} 
            />
          } 
        />

        <Route 
  path="/payment/:bookingId" 
  element={
    <RoleProtectedRoute 
      allowedRoles={['user']} 
      element={<PaymentPage />} 
    />
  } 
/>
        
        <Route 
          path="/home" 
          element={
            <RoleProtectedRoute 
              allowedRoles={['propertyowner']} 
              element={<Home />} 
            />
          } 
        /> 
        <Route 
          path="/my-properties" 
          element={
            <RoleProtectedRoute 
              allowedRoles={['propertyowner']} 
              element={<MyProperties />} 
            />
          } 
        />
        <Route 
          path="/myproperties" 
          element={
            <RoleProtectedRoute 
              allowedRoles={['propertyowner']} 
              element={<MyProperties />} 
            />
          } 
        />
        <Route 
  path="/owner-property/:id" 
  element={
    <ProtectedRoute>
      <RoleProtectedRoute allowedRoles={['propertyowner']}>
        <OwnerPropertyView />
      </RoleProtectedRoute>
    </ProtectedRoute>
  } 
/>
        <Route 
          path="/view-property/:id" 
          element={
            <RoleProtectedRoute 
              allowedRoles={['propertyowner']} 
              element={<UserPropertyViewPage />} 
            />
          } 
        />
        <Route 
          path="/notifications" 
          element={
            <RoleProtectedRoute 
              allowedRoles={['propertyowner', 'admin']} 
              element={<Notifications />} 
            />
          } 
        />
        <Route 
          path="/add-property" 
          element={
            <RoleProtectedRoute 
              allowedRoles={['propertyowner']} 
              element={<AddProperty />} 
            />
          } 
        />
        <Route 
          path="/addproperty" 
          element={
            <RoleProtectedRoute 
              allowedRoles={['propertyowner']} 
              element={<AddProperty />} 
            />
          } 
        />
        <Route 
          path="/add-property-details" 
          element={
            <RoleProtectedRoute 
              allowedRoles={['propertyowner']} 
              element={<AddPropertyDetails />} 
            />
          } 
        />
        <Route 
          path="/add-property-details/:id" 
          element={
            <RoleProtectedRoute 
              allowedRoles={['propertyowner']} 
              element={<AddPropertyDetails />} 
            />
          } 
        />
        <Route 
          path="/update-property/:id" 
          element={
            <RoleProtectedRoute 
              allowedRoles={['propertyowner']} 
              element={<UpdateProperty />} 
            />
          } 
        />
        <Route 
          path="/updateproperty/:id" 
          element={
            <RoleProtectedRoute 
              allowedRoles={['propertyowner']} 
              element={<UpdateProperty />} 
            />
          } 
        />
        <Route 
          path="/property-owner-bookings" 
          element={
            <RoleProtectedRoute 
              allowedRoles={['propertyowner']} 
              element={<PropertyOwnerBookings />} 
            />
          } 
        />
        <Route 
          path="/bookings" 
          element={
            <RoleProtectedRoute 
              allowedRoles={['propertyowner']} 
              element={<PropertyOwnerBookings />} 
            />
          } 
        />
        <Route 
          path="/profile" 
          element={<PrivateRoute element={<ProfilePage />} />} 
        />
        
        <Route 
          path="/admin/home" 
          element={
            <RoleProtectedRoute 
              allowedRoles={['admin']} 
              element={<AdminHome />} 
            />
          } 
        />
        <Route 
          path="/admin/new-listings" 
          element={
            <RoleProtectedRoute 
              allowedRoles={['admin']} 
              element={<AdminNewListings />} 
            />
          } 
        />
        <Route 
          path="/admin/all-properties" 
          element={
            <RoleProtectedRoute 
              allowedRoles={['admin']} 
              element={<AdminAllProperties />} 
            />
          } 
        />
        <Route 
          path="/admin/property/:id" 
          element={
            <RoleProtectedRoute 
              allowedRoles={['admin']} 
              element={<AdminPropertyView />} 
            />
          } 
        />
        
        <Route 
          path="/admin/user-management" 
          element={
            <RoleProtectedRoute 
              allowedRoles={['admin']} 
              element={<AdminUserManagement />} 
            />
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <RoleProtectedRoute 
              allowedRoles={['admin']} 
              element={<AdminUserManagement />} 
            />
          } 
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;