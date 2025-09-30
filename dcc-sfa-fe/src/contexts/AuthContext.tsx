/**
 * @fileoverview Authentication Context for User Management
 * @description Provides authentication state and user profile data throughout the app
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useCurrentUser, type User } from '../hooks/useUsers';
import authService from '../services/auth/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  refetchUser: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    authService.isAuthenticated()
  );

  const {
    data: user,
    isLoading,
    error,
    refetch: refetchUser,
    isSuccess,
    isError,
  } = useCurrentUser();

  useEffect(() => {
    // Update authentication status based on token
    const checkAuth = () => {
      const authStatus = authService.isAuthenticated();
      setIsAuthenticated(authStatus);
    };

    checkAuth();

    // Listen for auth changes
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('auth-change', handleAuthChange);

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  useEffect(() => {
    // Update authentication status based on user data fetch
    if (isSuccess && user) {
      setIsAuthenticated(true);
    } else if (isError && !authService.isAuthenticated()) {
      setIsAuthenticated(false);
    }
  }, [isSuccess, isError, user]);

  const logout = async () => {
    try {
      // Use authService logout which calls API and clears tokens
      await authService.logout();

      // Reset authentication state
      setIsAuthenticated(false);

      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear local state and redirect
      setIsAuthenticated(false);
      window.location.href = '/login';
    }
  };

  const contextValue: AuthContextType = {
    user: user || null,
    isLoading,
    isAuthenticated,
    error: error as Error | null,
    refetchUser,
    logout,
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

/**
 * Hook to get current authenticated user
 * @returns Current user or null
 */
export const useAuthUser = (): User | null => {
  const { user } = useAuth();
  return user;
};

/**
 * Hook to check if user is authenticated
 * @returns Boolean indicating authentication status
 */
export const useIsAuthenticated = (): boolean => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
};

export default AuthContext;
