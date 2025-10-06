/**
 * @fileoverview API Type Definitions
 * @description TypeScript interfaces and types for API requests and responses
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

/**
 * Standard API response structure
 * @template T - The type of data returned in the response
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  meta?: {
    requestDuration?: number;
    timestamp?: string;
    current_page?: number;
    total_pages?: number;
    total_count?: number;
    has_next?: boolean;
    has_previous?: boolean;
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  stats?: {
    // Company statistics
    total_companies?: number;
    active_companies?: number;
    inactive_companies?: number;
    new_companies?: number;
    // User statistics
    total_users?: number;
    active_users?: number;
    inactive_users?: number;
    new_users?: number;
    // Role statistics
    total_roles?: number;
    active_roles?: number;
    inactive_roles?: number;
    new_roles?: number;
    // Role Permission statistics
    total_role_permissions?: number;
    active_role_permissions?: number;
    inactive_role_permissions?: number;
    new_role_permissions?: number;
    // Depot statistics
    total_depots?: number;
    active_depots?: number;
    inactive_depots?: number;
    new_depots?: number;
    // Zone statistics
    total_zones?: number;
    active_zones?: number;
    inactive_zones?: number;
    new_zones?: number;
    // Route statistics
    total_routes: number;
    active_routes: number;
    inactive_routes: number;
    routes_this_month: number;
    // Visit statistics
    total_visits?: number;
    active_visits?: number;
    inactive_visits?: number;
    new_visits?: number;
    // Customer statistics
    totalCustomers?: number;
    active_customers?: number;
    inactive_customers?: number;
  };
}

/**
 * API error response structure
 */
export interface ApiError {
  success: false;
  message: string;
  error: string;
  statusCode: number;
  timestamp: string;
  path: string;
}

/**
 * Extended Axios request config with custom properties
 */
export interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  skipAuth?: boolean;
  retryCount?: number;
  skipErrorHandling?: boolean;
  metadata?: {
    startTime?: number;
    [key: string]: any;
  };
}

/**
 * Extended Axios response with custom properties
 */
export interface CustomAxiosResponse<T = any>
  extends AxiosResponse<ApiResponse<T>> {
  config: CustomAxiosRequestConfig;
}

/**
 * Authentication request payload
 */
export interface LoginRequest {
  username: string;
  password: string;
  remember_me?: boolean;
}

/**
 * Authentication response payload
 */
export interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
    parent_id: number;
    depot_id?: number | null;
    zone_id?: number | null;
  };
  expires_in?: number;
}

/**
 * Token refresh request payload
 */
export interface RefreshTokenRequest {
  refresh_token: string;
}

/**
 * Token refresh response payload
 */
export interface RefreshTokenResponse {
  token: string;
  expires_in: number;
}

/**
 * HTTP status codes enum
 */
export const HttpStatusCode = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export type HttpStatusCodeType =
  (typeof HttpStatusCode)[keyof typeof HttpStatusCode];

/**
 * API endpoint paths
 */
export const ApiEndpoints = {
  // Authentication
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  PROFILE: '/auth/profile',

  // Users
  USERS: '/users',
  USER_BY_ID: '/users/:id',

  // Masters
  COMPANIES: '/masters/companies',
  DEPOTS: '/masters/depots',
  ZONES: '/masters/zones',
  ROUTES: '/masters/routes',
  OUTLETS: '/masters/outlets',

  // Transactions
  ORDERS: '/transactions/orders',
  DELIVERIES: '/transactions/deliveries',
  PAYMENTS: '/transactions/payments',
} as const;

/**
 * Request retry configuration
 */
export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryCondition?: (error: any) => boolean;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Filter parameters for list endpoints
 */
export interface FilterParams {
  search?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  [key: string]: any;
}

/**
 * Combined query parameters for list endpoints
 */
export interface QueryParams extends PaginationParams, FilterParams {}

/**
 * File upload configuration
 */
export interface FileUploadConfig {
  maxSize: number; // in bytes
  allowedTypes: string[];
  uploadPath: string;
}

/**
 * Notification types for error handling
 */
export const NotificationType = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

export type NotificationTypeType =
  (typeof NotificationType)[keyof typeof NotificationType];

/**
 * Network error types
 */
export const NetworkErrorType = {
  TIMEOUT: 'TIMEOUT',
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  CLIENT_ERROR: 'CLIENT_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;

export type NetworkErrorTypeType =
  (typeof NetworkErrorType)[keyof typeof NetworkErrorType];

/**
 * Custom error class for API errors
 */
export class ApiErrorClass extends Error {
  public statusCode: number;
  public errorType: NetworkErrorTypeType;
  public originalError?: any;

  constructor(
    message: string,
    statusCode: number,
    errorType: NetworkErrorTypeType,
    originalError?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.originalError = originalError;
  }
}
