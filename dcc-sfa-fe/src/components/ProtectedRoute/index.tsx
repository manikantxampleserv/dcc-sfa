/**
 * ## ProtectedRoute Component
 *
 * Route wrapper that ensures user authentication before accessing protected pages.
 * Redirects unauthenticated users to login page with return path.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { tokenService } from 'services/auth/tokenService';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute component that checks authentication
 * @param children - Child components to render if authenticated
 * @returns JSX.Element - Children or redirect to login
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = tokenService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
