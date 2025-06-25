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

// User Pages
import UserHome from './pages/UserPages/UserHome';
import UserAllProperties from './pages/UserPages/UserAllProperties';
import UserPropertyViewPage from './pages/UserPages/UserViewProperty';
import UserBookingPage from "./pages/UserPages/UserBookingPage";
import UserFavouriteProperties from './pages/UserPages/UserFavouriteProperties';

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
        {/* Public Routes - These don't require authentication */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup/>} />
        <Route path="/forgot-password" element={<ForgotPassword/>} />

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

        {/* Admin Routes - These implement our new admin management system
            The admin role allows oversight of the entire platform */}
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

        {/* This route handles the property review process
            Admins can see all pending property submissions here */}
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

        {/* This route shows all approved properties for admin management
            Admins can monitor what users see and remove inappropriate content */}
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

        {/* User Routes - These represent the end-user experience
            Users only see approved, high-quality property listings */}
        <Route
          path="/user-home"
          element={
            <PrivateRoute
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={['user']}>
                    <UserHome />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />
          }
          />

          <Route
          path="/user-allproperties"
          element={
            <PrivateRoute
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={['user']}>
                    <UserAllProperties />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }/>
          }
          />

          <Route
          path="/user-viewproperty/:id"
          element={
            <PrivateRoute
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['user']}>
                  <UserPropertyViewPage/>
                </RoleProtectedRoute>
              </ProtectedRoute>
            }/>
          }
          />

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
            }/>
          }/>

          <Route
          path="user-favourites"
          element={
            <PrivateRoute
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={["user"]}>
                  <UserFavouriteProperties/>
                </RoleProtectedRoute>
              </ProtectedRoute>
            }/>
          }/>

        {/* Error Handling Route - This provides user feedback for unauthorized access attempts */}
        <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;