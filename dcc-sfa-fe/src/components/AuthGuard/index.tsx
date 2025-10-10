/**
 * @fileoverview Authentication Guard Component
 * @description Wraps the app with authentication logic and loading states
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import React from 'react';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import AuthLoader from '../AuthLoader';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Internal component that handles the loading state
 */
const AuthGuardContent: React.FC<AuthGuardProps> = ({ children }) => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <AuthLoader message="Loading..." />;
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
