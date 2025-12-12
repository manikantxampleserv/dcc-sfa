/**
 * @fileoverview Axios Configuration with Bearer Token Authentication
 * @description Enhanced axios instance with automatic token management and error handling
 * @author DCC-SFA Team
 * @version 2.0.0
 */

import type { AxiosResponse } from 'axios';
import axios, { AxiosError } from 'axios';
import { tokenService } from '../services/auth/tokenService';
import toastService from '../utils/toast';
import type {
  ApiError,
  CustomAxiosRequestConfig,
  CustomAxiosResponse,
  NetworkErrorTypeType,
  NotificationTypeType,
} from '../types/api.types';
import {
  ApiErrorClass,
  HttpStatusCode,
  NetworkErrorType,
  NotificationType,
} from '../types/api.types';

/**
 * Base URL for API requests
 * @description Can be overridden via environment variables
 */

const BASE_URL = import.meta.env?.VITE_API_BASE_URL;

/**
 * Request timeout in milliseconds
 */
const REQUEST_TIMEOUT = 300000;

let isSessionExpiredHandled = false;

/**
 * Enhanced Axios Instance Configuration
 * @description Creates axios instance with default settings optimized for DCC-SFA API
 */
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: false,
});

/**
 * Request Interceptor
 * @description Automatically adds Bearer token to requests and handles request configuration
 */
axiosInstance.interceptors.request.use(
  /**
   * Successful request interceptor
   * @param {CustomAxiosRequestConfig} config - Axios request configuration
   * @returns {CustomAxiosRequestConfig} Modified request configuration
   */
  (config: CustomAxiosRequestConfig): CustomAxiosRequestConfig => {
    try {
      config.metadata = {
        ...config.metadata,
        startTime: Date.now(),
      };

      if (config.skipAuth) {
        return config;
      }

      const token = tokenService.getToken();

      if (token) {
        config.headers.set('Authorization', `Bearer ${token}`);

        const user = tokenService.getUser();
        if (user) {
          config.headers.set('X-User-ID', user.id.toString());
          config.headers.set('X-User-Role', user.role);
          if (user.depot_id) {
            config.headers.set('X-Depot-ID', user.depot_id.toString());
          }
          if (user.zone_id) {
            config.headers.set('X-Zone-ID', user.zone_id.toString());
          }
        }
      }

      config.headers.set('X-Request-ID', generateRequestId());

      if (import.meta.env.VITE_APP_ENV === 'development') {
        console.log(
          `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`,
          {
            headers: config.headers,
            data: config.data,
            params: config.params,
          }
        );
      }

      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      return config;
    }
  },

  /**
   * Request error interceptor
   * @param {any} error - Request error
   * @returns {Promise<never>} Rejected promise with error
   */
  (error: any): Promise<never> => {
    console.error('Request setup failed:', error);
    return Promise.reject(
      new ApiErrorClass(
        'Request configuration failed',
        0,
        NetworkErrorType.CLIENT_ERROR,
        error
      )
    );
  }
);

/**
 * Response Interceptor
 * @description Handles responses, errors, and token refresh
 */
axiosInstance.interceptors.response.use(
  /**
   * Successful response interceptor
   * @param {CustomAxiosResponse} response - Axios response object
   * @returns {CustomAxiosResponse} Processed response
   */
  (response: CustomAxiosResponse): CustomAxiosResponse => {
    try {
      const startTime = response.config.metadata?.startTime;
      const duration = startTime ? Date.now() - startTime : 0;

      if (import.meta.env.VITE_APP_ENV === 'development') {
        console.log(
          `✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`,
          {
            status: response.status,
            duration: `${duration}ms`,
            data: response.data,
          }
        );
      }

      if (response.data && typeof response.data === 'object') {
        response.data.meta = {
          ...response.data.meta,
          requestDuration: duration,
          timestamp: new Date().toISOString(),
        };
      }

      return response;
    } catch (error) {
      console.error('Response processing error:', error);
      return response;
    }
  },

  /**
   * Error response interceptor
   * @param {AxiosError} error - Axios error object
   * @returns {Promise<never>} Rejected promise with processed error
   */
  async (error: AxiosError): Promise<never> => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (originalRequest?.skipErrorHandling) {
      return Promise.reject(error);
    }

    try {
      const isNetworkError =
        !error.response &&
        (error.request ||
          error.code === 'ERR_NETWORK' ||
          error.code === 'ECONNREFUSED' ||
          error.code === 'ETIMEDOUT' ||
          error.code === 'ENOTFOUND' ||
          error.message?.includes('Network Error') ||
          error.message?.includes('network'));

      if (isNetworkError) {
        return handleNetworkError(error);
      }

      if (error.response) {
        const { status, data } = error.response;

        if (import.meta.env.VITE_APP_ENV === 'development') {
          console.error(
            `❌ API Error: ${originalRequest.method?.toUpperCase()} ${originalRequest.url}`,
            {
              status,
              data,
              message: error.message,
            }
          );
        }

        if (status === HttpStatusCode.UNAUTHORIZED) {
          return handleUnauthorizedError(originalRequest, error);
        }

        if (status === HttpStatusCode.FORBIDDEN) {
          return handleForbiddenError(error);
        }

        if (status >= 400 && status < 500) {
          return handleClientError(error);
        }
      } else if (error.request) {
        return handleNetworkError(error);
      } else {
        return handleRequestError(error);
      }

      return Promise.reject(createApiError(error));
    } catch (handlingError) {
      console.error('Error handling failed:', handlingError);
      return Promise.reject(error);
    }
  }
);

/**
 * Handles unauthorized (401) errors
 * @param {CustomAxiosRequestConfig} _ - Original request configuration
 * @param {AxiosError} error - Axios error object
 * @returns {Promise<never>} Rejected promise
 */
async function handleUnauthorizedError(
  _: CustomAxiosRequestConfig,
  error: AxiosError
): Promise<never> {
  if (isSessionExpiredHandled) {
    return Promise.reject(
      new ApiErrorClass(
        'Authentication required',
        HttpStatusCode.UNAUTHORIZED,
        NetworkErrorType.AUTHENTICATION_ERROR,
        error
      )
    );
  }

  isSessionExpiredHandled = true;
  tokenService.clearAuth();

  let countdown = 3;
  const toastId = toastService.warning(
    `Session expired. Redirecting to login in ${countdown}...`,
    { autoClose: false, closeOnClick: false }
  );

  const countdownInterval = setInterval(() => {
    countdown--;
    if (countdown > 0) {
      toastService.update(
        toastId,
        `Session expired. Redirecting to login in ${countdown}...`,
        'warning'
      );
    } else {
      clearInterval(countdownInterval);
      toastService.update(toastId, 'Redirecting to login...', 'warning');
    }
  }, 1000);

  if (typeof window !== 'undefined') {
    setTimeout(() => {
      clearInterval(countdownInterval);
      toastService.dismiss(toastId);
      window.location.href = '/login';
    }, 3000);
  }

  return Promise.reject(
    new ApiErrorClass(
      'Authentication required',
      HttpStatusCode.UNAUTHORIZED,
      NetworkErrorType.AUTHENTICATION_ERROR,
      error
    )
  );
}

/**
 * Handles forbidden (403) errors
 * @param {AxiosError} error - Axios error object
 * @returns {Promise<never>} Rejected promise
 */
function handleForbiddenError(error: AxiosError): Promise<never> {
  const data = error.response?.data as ApiError;
  const message = data?.message || 'Access denied. Insufficient permissions.';

  showNotification(message, NotificationType.ERROR);

  const apiError = new ApiErrorClass(
    message,
    HttpStatusCode.FORBIDDEN,
    NetworkErrorType.AUTHORIZATION_ERROR,
    error
  );

  (apiError as any).response = error.response;

  return Promise.reject(apiError);
}

/**
 * Handles client (4xx) errors
 * @param {AxiosError} error - Axios error object
 * @returns {Promise<never>} Rejected promise
 */
function handleClientError(error: AxiosError): Promise<never> {
  const status = error.response?.status || 400;
  const data = error.response?.data as ApiError;

  const message =
    data?.error || data?.message || error.message || 'Request failed';

  if (status === HttpStatusCode.UNPROCESSABLE_ENTITY) {
    return Promise.reject(
      new ApiErrorClass(
        message,
        status,
        NetworkErrorType.VALIDATION_ERROR,
        error
      )
    );
  }

  return Promise.reject(
    new ApiErrorClass(message, status, NetworkErrorType.CLIENT_ERROR, error)
  );
}

/**
 * Handles network errors
 * @param {AxiosError} error - Axios error object
 * @returns {Promise<never>} Rejected promise
 */
function handleNetworkError(error: AxiosError): Promise<never> {
  let errorType: NetworkErrorTypeType = NetworkErrorType.NETWORK_ERROR;
  let message =
    'Network error occurred. Please check your internet connection.';

  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    errorType = NetworkErrorType.TIMEOUT;
    message = 'Request timeout. Please try again.';
  } else if (error.code === 'ECONNREFUSED') {
    message = 'Connection refused. The server may be unavailable.';
  } else if (error.code === 'ENOTFOUND') {
    message = 'Server not found. Please check your connection.';
  } else if (error.code === 'ERR_NETWORK') {
    message = 'Network error. Unable to reach the server.';
  } else if (error.message?.includes('Network Error')) {
    message = 'Network error. Please check your internet connection.';
  }

  showNotification(message, NotificationType.ERROR);

  return Promise.reject(new ApiErrorClass(message, 0, errorType, error));
}

/**
 * Handles request setup errors
 * @param {AxiosError} error - Axios error object
 * @returns {Promise<never>} Rejected promise
 */
function handleRequestError(error: AxiosError): Promise<never> {
  return Promise.reject(
    new ApiErrorClass(
      'Request setup failed',
      0,
      NetworkErrorType.CLIENT_ERROR,
      error
    )
  );
}

/**
 * Creates standardized API error object
 * @param {AxiosError} error - Axios error object
 * @returns {ApiErrorClass} Standardized error
 */
function createApiError(error: AxiosError): ApiErrorClass {
  const status = error.response?.status || 0;
  const data = error.response?.data as ApiError;
  const message =
    data?.error || data?.message || error.message || 'Unknown error';

  let errorType: NetworkErrorTypeType = NetworkErrorType.SERVER_ERROR;

  if (status >= 400 && status < 500) {
    errorType = NetworkErrorType.CLIENT_ERROR;
  } else if (!error.response) {
    errorType = NetworkErrorType.NETWORK_ERROR;
  }

  return new ApiErrorClass(message, status, errorType, error);
}

/**
 * Generates unique request ID for tracking
 * @returns {string} Unique request identifier
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Shows notification to user (implement based on your notification system)
 * @param {string} message - Notification message
 * @param {NotificationTypeType} type - Notification type
 */
function showNotification(message: string, type: NotificationTypeType): void {
  switch (type) {
    case NotificationType.SUCCESS:
      toastService.success(message);
      break;
    case NotificationType.ERROR:
      toastService.error(message);
      break;
    case NotificationType.WARNING:
      toastService.warning(message);
      break;
    case NotificationType.INFO:
      toastService.info(message);
      break;
    default:
      toastService.info(message);
  }
}

/**
 * Utility function to create request with custom config
 * @param {CustomAxiosRequestConfig} config - Request configuration
 * @returns {Promise<AxiosResponse>} Axios response promise
 * @example
 * // Skip authentication for public endpoints
 * const response = await createRequest({
 *   url: '/public/data',
 *   skipAuth: true
 * });
 */
export const createRequest = (
  config: CustomAxiosRequestConfig
): Promise<AxiosResponse> => {
  return axiosInstance(config);
};

/**
 * Reset session expiration flag
 * @returns {void}
 * @example
 * // After successful login
 * resetSessionExpiredFlag();
 */
export const resetSessionExpiredFlag = (): void => {
  isSessionExpiredHandled = false;
};

/**
 * Default export - Enhanced Axios instance
 * @description Use this instance for all API calls to benefit from automatic token management
 * @example
 * import api from './configs/axios.config';
 *
 * // GET request
 * const users = await api.get('/users');
 *
 * // POST request
 * const newUser = await api.post('/users', userData);
 *
 * // Skip authentication
 * const publicData = await api.get('/public/data', { skipAuth: true });
 */
export default axiosInstance;
