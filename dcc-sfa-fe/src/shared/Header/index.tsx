import {
  Avatar,
  Skeleton,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Box,
} from '@mui/material';
import { AccountCircle, Settings, Logout } from '@mui/icons-material';
import React, { useEffect, useRef, useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Notifications from '../Notifications';

interface HeaderProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, toggleSidebar }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const open = Boolean(anchorEl);

  const {
    user: currentUser,
    isLoading: userLoading,
    logout,
    isLoggingOut,
  } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        anchorEl &&
        !anchorEl.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, anchorEl]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    try {
      logout();
      handleClose();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
    handleClose();
  };

  const handleSettingsClick = () => {
    navigate('/settings/system');
    handleClose();
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

  const getUserDisplayName = () => currentUser?.name ?? 'User';

  const getUserRole = () => currentUser?.role?.name ?? 'User';

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
          <Notifications
            onNotificationClick={notification => {
              console.log('Notification clicked:', notification);
              // Handle notification click - navigate to actionUrl if available
            }}
            onMarkAllAsRead={() => {
              console.log('Mark all as read');
              // Handle mark all as read
            }}
            onClearAll={() => {
              console.log('Clear all notifications');
              // Handle clear all
            }}
          />

          <div className="relative" ref={menuRef}>
            <IconButton
              onClick={handleClick}
              className="!p-2 !rounded-md !text-gray-700 hover:!bg-gray-100"
              aria-label="user menu"
              aria-controls={open ? 'user-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
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
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: 'primary.main',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                >
                  {getUserInitials()}
                </Avatar>
              )}
            </IconButton>

            <Menu
              id="user-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              PaperProps={{
                className: '!mt-4 !min-w-[240px] relative',
                sx: {
                  boxShadow:
                    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  overflow: 'visible',
                },
              }}
              MenuListProps={{
                className: '!p-0 !relative',
              }}
            >
              {/* Arrow indicator */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: 16,
                  width: 0,
                  height: 0,
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderBottom: '8px solid white',
                  zIndex: 1,
                  pointerEvents: 'none',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: -9,
                  right: 16,
                  width: 0,
                  height: 0,
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderBottom: '8px solid #e5e7eb',
                  zIndex: 0,
                  pointerEvents: 'none',
                }}
              />
              <Box className="!px-4 !py-3 !border-b !border-gray-200 !bg-gray-50">
                <Box className="!flex !items-center !gap-3 !mb-2">
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
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: 'primary.main',
                        fontSize: '1rem',
                        fontWeight: 500,
                      }}
                    >
                      {getUserInitials()}
                    </Avatar>
                  )}
                  <Box className="!flex-1">
                    <Typography
                      variant="body2"
                      className="!text-sm !font-medium !text-gray-900"
                      sx={{ fontWeight: 500 }}
                    >
                      {userLoading ? (
                        <Skeleton width={120} height={16} />
                      ) : (
                        getUserDisplayName()
                      )}
                    </Typography>
                    <Typography
                      variant="caption"
                      className="!text-xs !text-gray-500"
                    >
                      {userLoading ? (
                        <Skeleton width={80} height={12} />
                      ) : (
                        getUserRole()
                      )}
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  variant="caption"
                  className="!text-xs !text-gray-500"
                >
                  {userLoading ? (
                    <Skeleton width={150} height={12} />
                  ) : (
                    currentUser?.email || 'user@example.com'
                  )}
                </Typography>
              </Box>

              <MenuItem onClick={handleProfileClick} className="!px-4 !py-2">
                <ListItemIcon className="!min-w-0 !mr-3">
                  <AccountCircle fontSize="small" className="!text-gray-500" />
                </ListItemIcon>
                <ListItemText
                  primary="My Profile"
                  primaryTypographyProps={{
                    className: '!text-sm !text-gray-700',
                  }}
                />
              </MenuItem>

              <MenuItem onClick={handleSettingsClick} className="!px-4 !py-2">
                <ListItemIcon className="!min-w-0 !mr-3">
                  <Settings fontSize="small" className="!text-gray-500" />
                </ListItemIcon>
                <ListItemText
                  primary="Settings"
                  primaryTypographyProps={{
                    className: '!text-sm !text-gray-700',
                  }}
                />
              </MenuItem>

              <Divider className="!my-1" />

              <MenuItem
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="!px-4 !py-2"
                sx={{
                  '&.Mui-disabled': {
                    opacity: 0.5,
                  },
                }}
              >
                <ListItemIcon className="!min-w-0 !mr-3">
                  <Logout fontSize="small" className="!text-red-600" />
                </ListItemIcon>
                <ListItemText
                  primary={isLoggingOut ? 'Signing out...' : 'Logout'}
                  primaryTypographyProps={{
                    className: '!text-sm !text-red-600',
                  }}
                />
              </MenuItem>
            </Menu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
