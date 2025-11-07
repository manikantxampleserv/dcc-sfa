import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import {
  notificationsService,
  type NotificationFilters,
} from '../services/notifications';

/**
 * Hook to get notifications for the authenticated user
 * @param filters - Optional filters for notifications
 * @returns React Query result with notifications
 */
export const useNotifications = (filters?: NotificationFilters) => {
  return useQuery({
    queryKey: ['notifications', filters],
    queryFn: () => notificationsService.getNotifications(filters),
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
};

/**
 * Hook to get notification by ID
 * @param id - The ID of the notification
 * @returns React Query result with notification
 */
export const useNotification = (id: number) => {
  return useQuery({
    queryKey: ['notification', id],
    queryFn: () => notificationsService.getNotificationById(id),
    enabled: !!id,
  });
};

/**
 * Hook to get unread notification count
 * @returns React Query result with unread count
 */
export const useUnreadNotificationCount = () => {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationsService.getUnreadCount(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

/**
 * Hook to create a notification
 * @returns React Query mutation for creating notifications
 */
export const useCreateNotification = () => {
  return useApiMutation({
    mutationFn: (notification: {
      user_id: number;
      type: 'success' | 'warning' | 'info' | 'error';
      category: string;
      title: string;
      message: string;
      data?: any;
      priority?: 'low' | 'medium' | 'high';
      action_url?: string;
      expires_at?: string;
    }) => notificationsService.createNotification(notification),
    invalidateQueries: ['notifications'],
    loadingMessage: 'Creating notification...',
  });
};

/**
 * Hook to mark notification as read
 * @returns React Query mutation for marking notifications as read
 */
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => notificationsService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'unread-count'],
      });
    },
  });
};

/**
 * Hook to mark all notifications as read
 * @returns React Query mutation for marking all notifications as read
 */
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'unread-count'],
      });
    },
  });
};

/**
 * Hook to delete a notification
 * @returns React Query mutation for deleting notifications
 */
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => notificationsService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'unread-count'],
      });
    },
  });
};

/**
 * Hook to clear all notifications
 * @returns React Query mutation for clearing all notifications
 */
export const useClearAllNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsService.clearAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'unread-count'],
      });
    },
  });
};
