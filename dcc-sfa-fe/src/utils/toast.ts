/**
 * @fileoverview Global Toast Utility
 * @description Centralized toast notifications using react-toastify
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { toast, type Id } from 'react-toastify';

/**
 * Toast configuration options
 */
const defaultOptions = {
  position: 'top-right' as const,
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

/**
 * Toast message tracking for duplicate prevention
 */
const activeToasts = new Map<string, { id: Id; timestamp: number }>();
const DUPLICATE_CHECK_TIME = 5000; // 5 seconds

/**
 * Generate unique key for toast message
 * @param message - Toast message
 * @param type - Toast type
 * @returns Unique key
 */
function generateToastKey(message: string, type: string): string {
  return `${type}:${message.toLowerCase().trim()}`;
}

/**
 * Check if toast is a duplicate
 * @param message - Toast message
 * @param type - Toast type
 * @returns True if duplicate
 */
function isDuplicateToast(message: string, type: string): boolean {
  const key = generateToastKey(message, type);
  const existing = activeToasts.get(key);

  if (!existing) return false;

  const timeDiff = Date.now() - existing.timestamp;
  return timeDiff < DUPLICATE_CHECK_TIME;
}

/**
 * Track toast for duplicate prevention
 * @param message - Toast message
 * @param type - Toast type
 * @param toastId - Toast ID
 */
function trackToast(message: string, type: string, toastId: Id): void {
  const key = generateToastKey(message, type);
  activeToasts.set(key, { id: toastId, timestamp: Date.now() });
}

/**
 * Remove toast from tracking
 * @param message - Toast message
 * @param type - Toast type
 */
function removeToastTracking(message: string, type: string): void {
  const key = generateToastKey(message, type);
  activeToasts.delete(key);
}

/**
 * Clean up old toast tracking
 */
function cleanupOldToasts(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];

  activeToasts.forEach((toast, key) => {
    if (now - toast.timestamp > DUPLICATE_CHECK_TIME) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach(key => activeToasts.delete(key));
}

/**
 * Global Toast Service
 * @description Provides standardized toast notifications across the application
 */
class ToastService {
  /**
   * Show success toast
   * @param message - Success message to display
   * @param options - Additional toast options
   * @returns Toast ID or null if duplicate
   */
  success(message: string, options?: any): Id | null {
    if (isDuplicateToast(message, 'success')) {
      return null;
    }

    cleanupOldToasts();
    const toastId = toast.success(message, {
      ...defaultOptions,
      ...options,
      onClose: () => {
        removeToastTracking(message, 'success');
        options?.onClose?.();
      },
    });

    trackToast(message, 'success', toastId);
    return toastId;
  }

  /**
   * Show error toast
   * @param message - Error message to display
   * @param options - Additional toast options
   * @returns Toast ID or null if duplicate
   */
  error(message: string, options?: any): Id | null {
    if (isDuplicateToast(message, 'error')) {
      return null;
    }

    cleanupOldToasts();
    const toastId = toast.error(message, {
      ...defaultOptions,
      ...options,
      onClose: () => {
        removeToastTracking(message, 'error');
        options?.onClose?.();
      },
    });

    trackToast(message, 'error', toastId);
    return toastId;
  }

  /**
   * Show warning toast
   * @param message - Warning message to display
   * @param options - Additional toast options
   * @returns Toast ID or null if duplicate
   */
  warning(message: string, options?: any): Id | null {
    if (isDuplicateToast(message, 'warning')) {
      return null;
    }

    cleanupOldToasts();
    const toastId = toast.warning(message, {
      ...defaultOptions,
      ...options,
      onClose: () => {
        removeToastTracking(message, 'warning');
        options?.onClose?.();
      },
    });

    trackToast(message, 'warning', toastId);
    return toastId;
  }

  /**
   * Show info toast
   * @param message - Info message to display
   * @param options - Additional toast options
   * @returns Toast ID or null if duplicate
   */
  info(message: string, options?: any): Id | null {
    if (isDuplicateToast(message, 'info')) {
      return null;
    }

    cleanupOldToasts();
    const toastId = toast.info(message, {
      ...defaultOptions,
      ...options,
      onClose: () => {
        removeToastTracking(message, 'info');
        options?.onClose?.();
      },
    });

    trackToast(message, 'info', toastId);
    return toastId;
  }

  /**
   * Show loading toast
   * @param message - Loading message to display
   * @param options - Additional toast options
   * @returns Toast ID for updating later
   */
  loading(message: string = 'Loading...', options?: any): Id {
    return toast.loading(message, { ...defaultOptions, ...options });
  }

  /**
   * Update existing toast
   * @param toastId - ID of toast to update
   * @param message - New message
   * @param type - New toast type
   * @param options - Additional options
   */
  update(
    toastId: Id,
    message: string,
    type: 'success' | 'error' | 'warning' | 'info',
    options?: any
  ): void {
    toast.update(toastId, {
      render: message,
      type,
      isLoading: false,
      ...defaultOptions,
      ...options,
    });
  }

  /**
   * Dismiss specific toast
   * @param toastId - ID of toast to dismiss
   */
  dismiss(toastId?: Id): void {
    toast.dismiss(toastId);

    // Remove from tracking if specific toast ID provided
    if (toastId) {
      for (const [key, trackedToast] of activeToasts.entries()) {
        if (trackedToast.id === toastId) {
          activeToasts.delete(key);
          break;
        }
      }
    }
  }

  /**
   * Dismiss all toasts
   */
  dismissAll(): void {
    toast.dismiss();
    activeToasts.clear();
  }

  /**
   * Clear all network error toasts
   * @description Specifically clears toasts related to network/connection errors
   */
  clearNetworkErrorToasts(): void {
    const networkErrorIds: Id[] = [];
    const networkErrorKeys: string[] = [];

    activeToasts.forEach((toast, key) => {
      const message = key.toLowerCase();
      if (
        message.includes('network') ||
        message.includes('connection') ||
        message.includes('server') ||
        message.includes('unable to reach')
      ) {
        networkErrorIds.push(toast.id);
        networkErrorKeys.push(key);
      }
    });

    // Dismiss the toasts
    networkErrorIds.forEach(id => toast.dismiss(id));

    // Remove from tracking
    networkErrorKeys.forEach(key => activeToasts.delete(key));
  }

  /**
   * Promise-based toast for async operations
   * @param promise - Promise to track
   * @param messages - Messages for different states
   * @param options - Additional options
   * @returns Promise result
   */
  async promise<T>(
    promise: Promise<T>,
    messages: {
      pending: string;
      success: string;
      error: string;
    },
    options?: any
  ): Promise<T> {
    return toast.promise(promise, messages, { ...defaultOptions, ...options });
  }

  /**
   * Create/Update/Delete operation toast handler
   * @param operation - The async operation to perform
   * @param messages - Messages for different states
   * @param options - Additional options
   * @returns Promise result
   */
  async apiOperation<T>(
    operation: () => Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error?: string | ((error: any) => string);
    },
    options?: any
  ): Promise<T> {
    const toastId = this.loading(messages.loading, options);

    try {
      const result = await operation();

      const successMessage =
        typeof messages.success === 'function'
          ? messages.success(result)
          : messages.success;

      this.update(toastId, successMessage, 'success', options);
      return result;
    } catch (error: any) {
      const errorMessage = messages.error
        ? typeof messages.error === 'function'
          ? messages.error(error)
          : messages.error
        : error.message || 'Operation failed';

      this.update(toastId, errorMessage, 'error', options);
      throw error;
    }
  }
}

/**
 * Singleton instance of ToastService
 * @description Export a single instance for consistent toast management
 */
export const toastService = new ToastService();

/**
 * Default export for convenience
 */
export default toastService;
