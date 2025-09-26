import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBars,
  FaBell,
  FaCog,
  FaSearch,
  FaSignOutAlt,
  FaTimes,
  FaUser,
} from 'react-icons/fa';
import authService from 'services/auth/authService';
import { useLogout } from 'hooks/useAuth';

interface HeaderProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentUser = authService.getCurrentUser();

  const logoutMutation = useLogout({
    onSuccess: () => {
      navigate('/login', { replace: true });
    },
    onError: error => {
      console.error('Logout failed:', error);
      navigate('/login', { replace: true });
    },
  });

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

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getUserInitials = () => {
    if (!currentUser?.username) return 'U';
    return currentUser.username
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16.5">
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
            <FaSearch size={20} />
          </button>

          <button className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100">
            <FaBell size={20} />
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleUserMenu}
              className="flex items-center gap-2 p-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {getUserInitials()}
              </div>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <div className="text-sm font-medium text-gray-900">
                    {currentUser?.username || 'User'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {currentUser?.email || 'user@example.com'}
                  </div>
                  <div className="text-xs text-gray-400">
                    {currentUser?.role || 'User'}
                  </div>
                </div>
                <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <FaUser size={14} />
                  Profile
                </button>
                <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <FaCog size={14} />
                  Settings
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <FaSignOutAlt size={14} />
                  Logout
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
