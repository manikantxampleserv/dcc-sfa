import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermission } from 'hooks/usePermission';

interface PermissionGuardProps {
  module: string;
  action?: 'read' | 'create' | 'update' | 'delete';
  children: React.ReactNode;
  redirectTo?: string;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  module,
  action = 'read',
  children,
  redirectTo = '/unauthorized',
}) => {
  const permissions = usePermission(module as any);

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

  if (permissions.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading permissions...</div>
      </div>
    );
  }

  return hasPermission ? <>{children}</> : <Navigate to={redirectTo} replace />;
};

export default PermissionGuard;
