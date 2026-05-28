import React from 'react';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ProtectedRoute = ({ children, requiredRole }) => {
  // 1. Grab the user's profile from local storage
  const userString = localStorage.getItem('user');
  
  // 2. If they aren't logged in at all, kick them to the Auth page
  if (!userString) {
    return <Navigate to="/auth" />;
  }

  const user = JSON.parse(userString);

 // 3. Check for specific roles
  if (requiredRole) {
    // If the page requires an Admin, let BOTH 'Admin' and 'SuperAdmin' in
    if (requiredRole === 'Admin' && user.role !== 'Admin' && user.role !== 'SuperAdmin') {
      toast.error("Security Alert: You do not have permission to view this page.");
      return <Navigate to="/" />;
    }
    // If the page requires a regular user (Donor/NGO), strictly check for it
    else if (requiredRole !== 'Admin' && user.role !== requiredRole) {
      toast.error("Security Alert: You do not have permission to view this page.");
      return <Navigate to="/" />;
    }
  }

  // 4. If they pass the checks, let them see the page!
  return children;
};

export default ProtectedRoute;