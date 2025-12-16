import React from 'react';
import { usePermission } from 'hooks/usePermission';
import NoConnection from 'pages/NoConnection';

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

  if (permissions.isNetworkError || !hasPermission) {
    return <NoConnection />;
  }

  return <>{children}</>;
};

export default PermissionGuard;
