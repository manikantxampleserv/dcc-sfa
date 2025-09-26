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
 * Global Toast Service
 * @description Provides standardized toast notifications across the application
 */
class ToastService {
  /**
   * Show success toast
   * @param message - Success message to display
   * @param options - Additional toast options
   * @returns Toast ID
   */
  success(message: string, options?: any): Id {
    return toast.success(message, { ...defaultOptions, ...options });
  }

  /**
   * Show error toast
   * @param message - Error message to display
   * @param options - Additional toast options
   * @returns Toast ID
   */
  error(message: string, options?: any): Id {
    return toast.error(message, { ...defaultOptions, ...options });
  }

  /**
   * Show warning toast
   * @param message - Warning message to display
   * @param options - Additional toast options
   * @returns Toast ID
   */
  warning(message: string, options?: any): Id {
    return toast.warning(message, { ...defaultOptions, ...options });
  }

  /**
   * Show info toast
   * @param message - Info message to display
   * @param options - Additional toast options
   * @returns Toast ID
   */
  info(message: string, options?: any): Id {
    return toast.info(message, { ...defaultOptions, ...options });
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
  }

  /**
   * Dismiss all toasts
   */
  dismissAll(): void {
    toast.dismiss();
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
