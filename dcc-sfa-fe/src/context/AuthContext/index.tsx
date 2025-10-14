/**
 * @fileoverview Authentication Context for User Management
 * @description Provides authentication state and user profile data throughout the app
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useCurrentUser, type User } from '../../hooks/useUsers';
import { useLogout } from '../../hooks/useAuth';
import { tokenService } from '../../services/auth/tokenService';
import { resetSessionExpiredFlag } from '../../configs/axio.config';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  refetchUser: () => void;
  logout: () => void;
  isLoggingOut: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    tokenService.isAuthenticated()
  );

  const {
    data: user,
    isLoading,
    error,
    refetch: refetchUser,
    isSuccess,
    isError,
  } = useCurrentUser();

  const logoutMutation = useLogout({
    onSuccess: () => {
      setIsAuthenticated(false);
      window.location.href = '/login';
    },
    onError: error => {
      console.error('Logout error:', error);
      setIsAuthenticated(false);
      window.location.href = '/login';
    },
  });

  useEffect(() => {
    const checkAuth = () => {
      const authStatus = tokenService.isAuthenticated();
      setIsAuthenticated(authStatus);
    };

    checkAuth();

    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('auth-change', handleAuthChange);

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  useEffect(() => {
    if (isSuccess && user) {
      setIsAuthenticated(true);
      resetSessionExpiredFlag(); // Reset flag on successful authentication
    } else if (isError && !tokenService.isAuthenticated()) {
      setIsAuthenticated(false);
    }
  }, [isSuccess, isError, user]);

  const logout = () => {
    logoutMutation.mutate();
  };

  const contextValue: AuthContextType = {
    user: user || null,
    isLoading,
    isAuthenticated,
    error: error as Error | null,
    refetchUser,
    logout,
    isLoggingOut: logoutMutation.isPending,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

/**
 * Hook to use authentication context
 * @returns Authentication context value
 * @throws Error if used outside AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

// Export AuthContext as named export for consistency
export { AuthContext };
