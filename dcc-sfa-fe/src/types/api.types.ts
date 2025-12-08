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
  pagination?: {
    current_page: number;
    total_pages: number;
    total_count: number;
    has_next: boolean;
    has_previous: boolean;
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
    new_customers_this_month?: number;
    total_customers?: number;
    active_customers?: number;
    inactive_customers?: number;
    distributors?: number;
    retailers?: number;
    wholesellers?: number;
    total_credit_limit?: string;
    total_outstanding_amount?: string;
    // Outlet group statistics
    total_groups: number;
    active_groups: number;
    inactive_groups: number;
    new_groups: number;
    avg_discount: number;
    // Asset type statistics
    total_asset_types: number;
    active_asset_types: number;
    inactive_asset_types: number;
    new_asset_types: number;
    // Warehouse statistics
    total_warehouses: number;
    active_warehouses: number;
    inactive_warehouses: number;
    new_warehouses: number;
    // Vehicle statistics
    total_vehicles: number;
    active_vehicles: number;
    inactive_vehicles: number;
    new_vehicles: number;
    // Survey statistics
    total_surveys: number;
    published_surveys: number;
    draft_surveys: number;
    active_surveys: number;
    total_responses: number;
    total_categories: number;
    // Asset master statistics
    total_assets: number;
    active_assets: number;
    inactive_assets: number;
    assets_this_month: number;
    // Login history statistics
    total_logins: number;
    successful_logins: number;
    failed_logins: number;
    today_logins: number;
    // API token statistics
    total_tokens: number;
    active_tokens: number;
    revoked_tokens: number;
    expired_tokens: number;
    // Currency statistics
    total_currencies?: number;
    active_currencies?: number;
    inactive_currencies?: number;
    base_currencies?: number;
    // Sales target group statistics
    total_sales_target_groups?: number;
    active_sales_target_groups?: number;
    inactive_sales_target_groups?: number;
    sales_target_groups_this_month?: number;
    // Sales target statistics
    total_sales_targets?: number;
    active_sales_targets?: number;
    inactive_sales_targets?: number;
    sales_targets_this_month?: number;
    // Product statistics
    total_products?: number;
    active_products?: number;
    inactive_products?: number;
    new_products_this_month?: number;
    // Unit of measurement statistics
    total_units?: number;
    active_units?: number;
    inactive_units?: number;
    new_units_this_month?: number;
    // Brand statistics
    total_brands?: number;
    active_brands?: number;
    inactive_brands?: number;
    new_brands_this_month?: number;
    // Product category statistics
    total_product_categories?: number;
    active_product_categories?: number;
    inactive_product_categories?: number;
    new_product_categories_this_month?: number;
    // Product sub category statistics
    total_sub_categories?: number;
    active_sub_categories?: number;
    inactive_sub_categories?: number;
    new_sub_categories_this_month?: number;
    // Return request statistics
    total_requests?: number;
    pending_requests?: number;
    approved_requests?: number;
    processing_requests?: number;
    completed_requests?: number;
    rejected_requests?: number;
    cancelled_requests?: number;
    new_requests_this_month?: number;
    // Payment statistics
    total_payments?: number;
    active_payments?: number;
    inactive_payments?: number;
    total_amount?: number;
    payments_this_month?: number;
    amount_this_month?: number;
    pending_collections?: number;
    overdue_amount?: number;
    // Cooler installation statistics
    total_coolers?: number;
    active_coolers?: number;
    inactive_coolers?: number;
    new_coolers_this_month?: number;
    // Cooler inspection statistics
    total_inspections?: number;
    active_inspections?: number;
    inactive_inspections?: number;
    new_inspections_this_month?: number;
    // Stock transfer request statistics
    active_requests?: number;
    inactive_requests?: number;
    requests_this_month?: number;
    // Van inventory statistics
    total_records: number;
    active_records: number;
    inactive_records: number;
    van_inventory: number;
    // Stock movement statistics
    total_stock_movements: number;
    active_stock_movements: number;
    inactive_stock_movements: number;
    stock_movements_this_month: number;
    total_in_movements: number;
    total_out_movements: number;
    total_transfer_movements: number;
    // Survey response statistics
    records_this_month: number;
    // KPI target statistics
    total_targets: number;
    active_targets: number;
    inactive_targets: number;
    targets_this_month: number;
    // Promotion statistics
    total_promotions: number;
    active_promotions: number;
    inactive_promotions: number;
    promotions_this_month: number;
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
