import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Permission } from '../types/api';

type Props = {
  children: ReactNode;
  permission?: Permission;
};

export function RequireAuth({ children, permission }: Props) {
  const { session, loading, hasPermission } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (permission && !hasPermission(permission)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
