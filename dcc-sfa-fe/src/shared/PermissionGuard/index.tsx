import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermission } from 'hooks/usePermission';
import { WifiOff } from 'lucide-react';
import Button from 'shared/Button';

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

  if (permissions.isNetworkError) {
    return (
      <div className="flex items-center justify-center min-h-full bg-gray-50">
        <div className="text-center px-4">
          <div className="flex justify-center mb-4">
            <WifiOff className="w-24 h-24 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Network Error
          </h1>
          <p className="text-gray-500 mb-8 max-w-xl mx-auto">
            Unable to connect to the server. Please check your internet
            connection and try again.
          </p>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
            className="!capitalize"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return hasPermission ? <>{children}</> : <Navigate to={redirectTo} replace />;
};

export default PermissionGuard;
