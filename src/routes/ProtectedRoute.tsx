import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import CanCheck from '../resources/can';
import { useSelector } from 'react-redux';
import { AppStore } from '../redux/store';

interface ProtectedRouteProps {
  permission: string;
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ permission, redirectPath = '/' }) => {
  const authUser = useSelector((store: AppStore) => store.auth.user);
  const location = useLocation();

  if (authUser?.must_change_password && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  if (!CanCheck(permission)) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
