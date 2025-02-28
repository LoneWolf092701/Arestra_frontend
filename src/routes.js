import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import MyProperties from './pages/MyProperties';
import Notifications from './pages/Notifications';
import AddProperty from './pages/AddProperty';
import AddPropertyDetails from './pages/AddPropertyDetails';
import UpdateProperty from './pages/UpdateProperty';
import Login from './pages/Login';
import Header from './components/common/Header';
import { isAuthenticated } from './utils/auth';

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
        
        <Route path="/home" element={<PrivateRoute element={<Home />} />} />
        <Route path="/myproperties" element={<PrivateRoute element={<MyProperties />} />} />
        <Route path="/notifications" element={<PrivateRoute element={<Notifications />} />} />
        <Route path="/addproperty" element={<PrivateRoute element={<AddProperty />} />} />
        <Route path="/addproperty/details" element={<PrivateRoute element={<AddPropertyDetails />} />} />
        <Route path="/updateproperty/:id" element={<PrivateRoute element={<UpdateProperty />} />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
