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

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'error';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

interface NotificationsProps {
  notifications?: Notification[];
  isLoading?: boolean;
  onNotificationClick?: (notification: Notification) => void;
  onMarkAllAsRead?: () => void;
  onClearAll?: () => void;
}

const Notifications: React.FC<NotificationsProps> = ({
  notifications = [],
  isLoading = false,
  onNotificationClick,
  onMarkAllAsRead,
  onClearAll,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const open = Boolean(anchorEl);

  // Mock notifications data - replace with actual API call
  const mockNotifications: Notification[] = notifications.length
    ? notifications
    : [
        {
          id: '1',
          title: 'New Order Received',
          message: 'You have received a new order #12345',
          type: 'success',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          read: false,
        },
        {
          id: '2',
          title: 'Payment Pending',
          message: 'Payment for order #12340 is pending',
          type: 'warning',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          read: false,
        },
        {
          id: '3',
          title: 'Inventory Alert',
          message: 'Low stock alert for Product XYZ',
          type: 'info',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          read: true,
        },
        {
          id: '4',
          title: 'System Update',
          message: 'Scheduled maintenance tonight at 2 AM',
          type: 'info',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          read: true,
        },
      ];

  const unreadCount = mockNotifications.filter(n => !n.read).length;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification: Notification) => {
    onNotificationClick?.(notification);
    handleClose();
  };

  const handleMarkAllAsRead = () => {
    onMarkAllAsRead?.();
  };

  const handleClearAll = () => {
    onClearAll?.();
    handleClose();
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

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
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
      <IconButton
        onClick={handleClick}
        className="!p-2 !rounded-md !text-gray-600 hover:!text-gray-900 hover:!bg-gray-100"
        aria-label="notifications"
        aria-controls={open ? 'notifications-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <NotificationsIcon className="!text-gray-600" />
        </Badge>
      </IconButton>

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
        PaperProps={{
          className:
            '!mt-4 !min-w-[400px] !max-w-[400px] !max-h-[600px] relative',
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
            right: 20,
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
            right: 20,
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderBottom: '8px solid #e5e7eb',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
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
          ) : mockNotifications.length === 0 ? (
            <Box className="!p-8 !text-center">
              <NotificationsIcon className="!text-gray-400 !mb-2" />
              <Typography variant="body2" className="!text-gray-500">
                No notifications
              </Typography>
            </Box>
          ) : (
            <>
              {mockNotifications.map(notification => (
                <MenuItem
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`!px-4 !py-3 !border-b !border-gray-100 hover:!bg-gray-50 ${
                    !notification.read ? '!bg-blue-50' : ''
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
                            !notification.read
                              ? '!text-gray-900'
                              : '!text-gray-700'
                          }`}
                        >
                          {notification.title}
                        </Typography>
                        {!notification.read && (
                          <Circle className="!text-blue-500 !text-xs" />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography
                          variant="body2"
                          className="!text-xs !text-gray-500 !mt-1"
                        >
                          {notification.message}
                        </Typography>
                        <Typography
                          variant="caption"
                          className="!text-xs !text-gray-400 !mt-1 !block"
                        >
                          {formatTimestamp(notification.timestamp)}
                        </Typography>
                      </>
                    }
                  />
                </MenuItem>
              ))}
            </>
          )}
        </Box>

        {mockNotifications.length > 0 && !isLoading && (
          <>
            <Divider />
            <Box className="!px-4 !py-2 !flex !justify-center">
              <Button
                size="small"
                onClick={handleClearAll}
                className="!text-xs !text-gray-600 hover:!text-gray-900 !normal-case"
              >
                Clear all notifications
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </div>
  );
};

export default Notifications;
