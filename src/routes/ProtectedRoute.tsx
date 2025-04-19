import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import CanCheck from '../resources/can';

interface ProtectedRouteProps {
  permission: string;
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ permission, redirectPath = '/' }) => {
  if (!CanCheck(permission)) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
