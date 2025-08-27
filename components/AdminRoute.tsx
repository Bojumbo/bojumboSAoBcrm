import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute: React.FC = () => {
  const { currentUser } = useAuth();

  // currentUser is guaranteed to be present by the parent ProtectedRoute.
  // We check for its existence as a good practice.
  return currentUser && currentUser.role === 'admin' ? <Outlet /> : <Navigate to="/" replace />;
};

export default AdminRoute;
