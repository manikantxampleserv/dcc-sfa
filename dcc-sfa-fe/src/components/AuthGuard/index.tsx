/**
 * @fileoverview Authentication Guard Component
 * @description Wraps the app with authentication logic and loading states
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import React, { useMemo, useState } from 'react';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import AuthLoader from '../AuthLoader';
import NoConnection from '../../pages/NoConnection';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Internal component that handles the loading state
 */
const AuthGuardContent: React.FC<AuthGuardProps> = ({ children }) => {
  const { isLoading, error } = useAuth();
  const [isOffline, setIsOffline] = useState(() => !navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const shouldShowNoConnection = useMemo(() => {
    if (isOffline) return true;
    if (!error) return false;
    const apiError = error as any;
    const statusCode =
      apiError?.statusCode ||
      apiError?.response?.status ||
      apiError?.originalError?.response?.status;

    const isUnauthorized = statusCode === 401 || statusCode === 403;
    const isNetworkError =
      apiError?.errorType === 'NETWORK_ERROR' ||
      apiError?.errorType === 'TIMEOUT' ||
      apiError?.errorType === 'AUTHENTICATION_ERROR' ||
      apiError?.errorType === 'AUTHORIZATION_ERROR' ||
      (statusCode === 0 && !apiError?.response) ||
      (!apiError?.response &&
        (apiError?.code === 'ERR_NETWORK' ||
          apiError?.code === 'ECONNREFUSED' ||
          apiError?.code === 'ETIMEDOUT' ||
          apiError?.code === 'ENOTFOUND')) ||
      (apiError?.message &&
        (apiError.message.includes('Network') ||
          apiError.message.includes('network')));

    return isUnauthorized || isNetworkError;
  }, [error, isOffline]);

  if (isLoading) {
    return <AuthLoader message="Loading..." />;
  }

  if (shouldShowNoConnection) {
    return <NoConnection />;
  }

  return <>{children}</>;
};

/**
 * AuthGuard component that wraps the entire app
 * Provides authentication context and handles loading states
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  return (
    <AuthProvider>
      <AuthGuardContent>{children}</AuthGuardContent>
    </AuthProvider>
  );
};

export default AuthGuard;
