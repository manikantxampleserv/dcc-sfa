import React from 'react';
import { usePermission } from 'hooks/usePermission';

interface PermissionWrapperProps {
  module: string;
  action?: 'read' | 'create' | 'update' | 'delete';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const PermissionWrapper: React.FC<PermissionWrapperProps> = ({
  module,
  action = 'read',
  children,
  fallback = null,
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
        return permissions.isRead;
    }
  })();

  if (permissions.isLoading) {
    return <div>Loading...</div>;
  }

  return hasPermission ? <>{children}</> : <>{fallback}</>;
};

export default PermissionWrapper;
