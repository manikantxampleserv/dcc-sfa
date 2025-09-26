/**
 * ## LogoutButton Component
 *
 * Button component that handles user logout with confirmation.
 * Integrates with auth service and provides visual feedback.
 */

import { Logout } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import authService from 'services/auth/authService';

interface LogoutButtonProps {
  variant?: 'icon' | 'text';
  className?: string;
}

/**
 * LogoutButton component that handles user logout
 * @param variant - Display variant (icon or text)
 * @param className - Additional CSS classes
 * @returns JSX.Element - Rendered logout button
 */
const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  variant = 'icon',
  className = '' 
}) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout even if server call fails
      authService.getCurrentUser() && authService.logout();
      navigate('/login', { replace: true });
    }
  };

  if (variant === 'icon') {
    return (
      <Tooltip title="Logout">
        <IconButton
          onClick={handleLogout}
          className={`!text-gray-600 hover:!text-red-600 ${className}`}
        >
          <Logout />
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <button
      onClick={handleLogout}
      className={`flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-gray-100 rounded-md transition-colors ${className}`}
    >
      <Logout className="!text-base" />
      Logout
    </button>
  );
};

export default LogoutButton;
