import { Avatar, Skeleton } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import {
  FaBars,
  FaBell,
  FaCog,
  FaSignOutAlt,
  FaTimes,
  FaUser,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, toggleSidebar }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const {
    user: currentUser,
    isLoading: userLoading,
    logout,
    isLoggingOut,
  } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleUserMenu = () => setUserMenuOpen(!userMenuOpen);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setUserMenuOpen(false);
  };

  const handleSettingsClick = () => {
    navigate('/settings/system');
    setUserMenuOpen(false);
  };

  const getUserInitials = () => {
    if (!currentUser?.name) return 'U';
    return currentUser.name
      .split(' ')
      .map((name: string) => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserDisplayName = () => {
    return currentUser?.name || 'User';
  };

  const getUserRole = () => {
    return currentUser?.role?.name || 'User';
  };

  return (
    <header className="bg-white border-b border-gray-200 h-[67px]">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 sm:hidden"
          >
            {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100">
            <FaBell size={20} />
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleUserMenu}
              className="flex items-center gap-2 p-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              {userLoading ? (
                <Skeleton
                  variant="circular"
                  width={40}
                  height={40}
                  sx={{ bgcolor: 'grey.200' }}
                />
              ) : (
                <Avatar
                  alt={getUserDisplayName()}
                  src={currentUser?.profile_image || undefined}
                  className="!w-10 !rounded !h-10 !bg-primary-500 !text-sm !font-medium !transition-colors"
                >
                  {getUserInitials()}
                </Avatar>
              )}
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    {userLoading ? (
                      <Skeleton
                        variant="circular"
                        width={40}
                        height={40}
                        sx={{ bgcolor: 'grey.200' }}
                      />
                    ) : (
                      <Avatar
                        alt={getUserDisplayName()}
                        src={currentUser?.profile_image || undefined}
                        className="!w-10 !rounded !h-10 !bg-primary-500 !text-base !font-medium"
                      >
                        {getUserInitials()}
                      </Avatar>
                    )}
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {userLoading ? (
                          <Skeleton width={120} height={16} />
                        ) : (
                          getUserDisplayName()
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {userLoading ? (
                          <Skeleton width={80} height={12} />
                        ) : (
                          getUserRole()
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {userLoading ? (
                      <Skeleton width={150} height={12} />
                    ) : (
                      currentUser?.email || 'user@example.com'
                    )}
                  </div>
                </div>
                <button
                  onClick={handleProfileClick}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <FaUser size={14} />
                  My Profile
                </button>
                <button
                  onClick={handleSettingsClick}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <FaCog size={14} />
                  Settings
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaSignOutAlt size={14} />
                  {isLoggingOut ? 'Signing out...' : 'Logout'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
