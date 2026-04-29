import React from 'react';
import { useLocation } from 'react-router-dom';
import { usePermission } from 'hooks/usePermission';
import { useCurrentUser } from 'hooks/useUsers';
import { useAuth } from 'context/AuthContext';
import { tokenService } from 'services/auth/tokenService';
import AuthLoader from 'components/AuthLoader';
import NoPermission from 'shared/NoPermission';

interface PermissionGuardProps {
  module: string;
  action?: 'read' | 'create' | 'update' | 'delete';
  children: React.ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  module,
  action = 'read',
  children,
}) => {
  const location = useLocation();
  const { isAuthenticated: authContextAuthenticated, isLoggingOut } = useAuth();
  const token = tokenService.getToken();
  const user = tokenService.getUser();
  const isExpired = tokenService.isTokenExpired();
  const currentPath = location.pathname;
  const isAuthPage =
    currentPath.includes('/login') ||
    currentPath.includes('/auth') ||
    currentPath === '/';

  if (
    !token ||
    !user ||
    isExpired ||
    !authContextAuthenticated ||
    isLoggingOut ||
    isAuthPage
  ) {
    return <AuthLoader message="Signing out..." />;
  }

  const permissions = usePermission(module as any);
  const currentUserQuery = useCurrentUser();

  const hasPermission = (() => {
    switch (action) {
      case 'create':
        return permissions.isCreate;
      case 'update':
        return permissions.isUpdate;
      case 'delete':
        return permissions.isDelete;
      case 'read':
      default:
        return (
          permissions.isRead ||
          permissions.isCreate ||
          permissions.isUpdate ||
          permissions.isDelete
        );
    }
  })();

  if (permissions.isLoading || currentUserQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading permissions...</div>
      </div>
    );
  }

  if (!currentUserQuery.data || !tokenService.isAuthenticated()) {
    return <AuthLoader message="Signing out..." />;
  }

  if (!hasPermission) {
    return <NoPermission />;
  }

  return <>{children}</>;
};

export default PermissionGuard;
