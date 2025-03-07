import React from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('authToken');
  const tokenExpiresAt = localStorage.getItem('tokenExpiresAt');

  // Check if token is still valid
  const isTokenValid = tokenExpiresAt 
    ? new Date().getTime() < parseInt(tokenExpiresAt) 
    : false;

  if (!isAuthenticated || !isTokenValid) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
