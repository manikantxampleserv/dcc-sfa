import {
  CheckCircle,
  Circle,
  Error as ErrorIcon,
  Info,
  Notifications as NotificationsIcon,
  Warning,
} from '@mui/icons-material';
import {
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Skeleton,
  Typography,
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useClearAllNotifications,
} from '../../hooks/useNotifications';
import type { Notification } from '../../services/notifications';

interface NotificationsProps {
  onNotificationClick?: (notification: Notification) => void;
}

const Notifications: React.FC<NotificationsProps> = ({
  onNotificationClick,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const open = Boolean(anchorEl);

  const {
    data: notificationsData,
    isLoading,
    refetch,
  } = useNotifications({ limit: 20 });
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const clearAllMutation = useClearAllNotifications();

  const notifications: Notification[] = notificationsData?.data || [];
  const unreadCount: number = notificationsData?.unread_count || 0;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsReadMutation.mutateAsync(notification.id);
    }

    if (notification.action_url) {
      navigate(notification.action_url);
    }

    onNotificationClick?.(notification);
    handleClose();
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      refetch();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllMutation.mutateAsync();
      handleClose();
      refetch();
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="!text-green-500" />;
      case 'warning':
        return <Warning className="!text-yellow-500" />;
      case 'error':
        return <ErrorIcon className="!text-red-500" />;
      case 'info':
      default:
        return <Info className="!text-blue-500" />;
    }
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return 'Just now';
    const now = new Date();
    const notificationDate = new Date(timestamp);
    const diff = now.getTime() - notificationDate.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return notificationDate.toLocaleDateString();
  };

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

  return (
    <div className="relative" ref={menuRef}>
      <Badge badgeContent={unreadCount} color="error" max={99}>
        <IconButton
          onClick={handleClick}
          className="!p-1.5 !rounded-md !bg-gray-100 !text-gray-600 hover:!text-gray-900 hover:!bg-gray-100"
          aria-label="notifications"
          aria-controls={open ? 'notifications-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <NotificationsIcon className="!text-gray-600" />
        </IconButton>
      </Badge>

      <Menu
        id="notifications-menu"
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
        slotProps={{
          paper: {
            className:
              '!mt-2 !ml-1 !min-w-[400px] !max-w-[400px] !max-h-[600px] relative',
            sx: {
              boxShadow:
                '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              overflow: 'visible',
              '&::before': {
                content: '""',
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
              },
              '&::after': {
                content: '""',
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
              },
            },
          },
          list: {
            className: '!p-0 !relative',
          },
        }}
      >
        <Box className="!px-4 !py-3 !border-b !border-gray-200 !flex !items-center !justify-between !bg-gray-50">
          <Typography
            variant="h6"
            className="!text-base !font-semibold !text-gray-900"
          >
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={handleMarkAllAsRead}
              className="!text-xs !text-blue-600 hover:!text-blue-700 !normal-case"
            >
              Mark all as read
            </Button>
          )}
        </Box>

        <Box className="!max-h-[450px] !overflow-y-auto">
          {isLoading ? (
            <Box className="!p-4 !space-y-3">
              {[1, 2, 3].map(item => (
                <Box key={item} className="!flex !gap-3">
                  <Skeleton variant="circular" width={40} height={40} />
                  <Box className="!flex-1">
                    <Skeleton width="60%" height={20} />
                    <Skeleton width="100%" height={16} className="!mt-2" />
                    <Skeleton width="40%" height={12} className="!mt-1" />
                  </Box>
                </Box>
              ))}
            </Box>
          ) : notifications.length === 0 ? (
            <Box className="!p-8 !text-center">
              <NotificationsIcon className="!text-gray-400 !mb-2" />
              <Typography variant="body2" className="!text-gray-500">
                No notifications
              </Typography>
            </Box>
          ) : (
            notifications.map((notification: Notification) => (
              <MenuItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`!px-4 !py-3 !border-b !border-gray-100 hover:!bg-gray-50 ${
                  !notification.is_read ? '!bg-blue-50' : ''
                }`}
              >
                <ListItemIcon className="!min-w-0 !mr-3">
                  {getNotificationIcon(notification.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box className="!flex !items-start !justify-between !gap-2">
                      <Typography
                        variant="body2"
                        className={`!font-medium !text-sm ${
                          !notification.is_read
                            ? '!text-gray-900'
                            : '!text-gray-700'
                        }`}
                      >
                        {notification.title}
                      </Typography>
                      {!notification.is_read && (
                        <Circle className="!text-blue-500 !text-xs" />
                      )}
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        className="!text-xs !text-gray-500 !mt-1 !block"
                      >
                        {notification.message}
                      </Typography>
                      <Typography
                        component="span"
                        variant="caption"
                        className="!text-xs !text-gray-400 !mt-1 !block"
                      >
                        {formatTimestamp(notification.createdate)}
                      </Typography>
                    </>
                  }
                />
              </MenuItem>
            ))
          )}
        </Box>

        {notifications.length > 0 &&
          !isLoading && [
            <Divider key="divider" />,
            <Box key="clear-all" className="!px-4 !py-2 !flex !justify-center">
              <Button
                size="small"
                onClick={handleClearAll}
                className="!text-xs !text-gray-600 hover:!text-gray-900 !normal-case"
              >
                Clear all notifications
              </Button>
            </Box>,
          ]}
      </Menu>
    </div>
  );
};

export default Notifications;
