/**
 * @fileoverview API Type Definitions
 * @description TypeScript interfaces and types for API requests and responses
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

/**
 * Standard API response structure
 * @template T - The type of data returned in the response payload
 */
export interface ApiResponse<T = any> {
  /** Indicates whether the API request was executed successfully */
  success: boolean;
  /** Human-readable status message or confirmation text */
  message: string;
  /** Main response payload containing data of type T */
  data?: T;
  /** General error message describing the failure, if success is false */
  error?: string;
  /** Validation errors mapped by property name to its error details */
  errors?: Record<string, string[]>;
  /** Diagnostics, request metadata, and pagination data */
  meta?: {
    /** Time taken by the server to process the request, in milliseconds */
    requestDuration?: number;
    /** Server generation timestamp for the response (ISO 8601 string) */
    timestamp?: string;
    /** Current active page index in the paginated collection */
    current_page?: number;
    /** Total number of pages available in the database */
    total_pages?: number;
    /** Total count of records matching the criteria across all pages */
    total_count?: number;
    /** Indicates if there is a next page of records available */
    has_next?: boolean;
    /** Indicates if there is a previous page of records available */
    has_previous?: boolean;
    /** Alternative representation of total records count */
    total?: number;
    /** Alternative representation of current page index */
    page?: number;
    /** The maximum number of records requested per page */
    limit?: number;
    /** Alternative representation of total pages count */
    totalPages?: number;
  };
  /** Standard pagination metadata for the client app */
  pagination?: {
    /** The page index currently being viewed */
    current_page: number;
    /** The total count of data pages */
    total_pages: number;
    /** The total count of matching records across all pages */
    total_count: number;
    /** Flag showing if a succeeding page exists */
    has_next: boolean;
    /** Flag showing if a preceding page exists */
    has_previous: boolean;
  };
  /** Counters, averages, and statistics aggregated across system entities */
  stats?: {
    // Order statistics
    /** Total orders placed in the system */
    total_orders: number;
    /** Active orders currently undergoing processing */
    active_orders: number;
    /** Canceled or completed/closed orders marked as inactive */
    inactive_orders: number;
    /** Total count of orders submitted within the current calendar month */
    orders_this_month: number;
    /** Number of orders awaiting administrative or manager approval */
    pending_approval: number;
    /** Collective monetary value of all orders */
    total_value: number;
    /** Average monetary value calculated per order */
    average_order_value: number;
    // Company statistics
    /** Total number of companies registered in the system */
    total_companies?: number;
    /** Number of active companies */
    active_companies?: number;
    /** Number of inactive companies */
    inactive_companies?: number;
    /** Number of newly onboarded companies */
    new_companies?: number;
    // User statistics
    /** Total number of registered user accounts */
    total_users?: number;
    /** Number of users currently active and enabled */
    active_users?: number;
    /** Number of users currently suspended or disabled */
    inactive_users?: number;
    /** Number of users registered within the current window */
    new_users?: number;
    // Role statistics
    /** Total number of authorization roles defined in the system */
    total_roles?: number;
    /** Number of active authorization roles */
    active_roles?: number;
    /** Number of inactive authorization roles */
    inactive_roles?: number;
    /** Number of roles newly defined */
    new_roles?: number;
    // Role Permission statistics
    /** Total number of role-to-permission mappings */
    total_role_permissions?: number;
    /** Number of active role-to-permission mappings */
    active_role_permissions?: number;
    /** Number of inactive role-to-permission mappings */
    inactive_role_permissions?: number;
    /** Number of role-to-permission mappings created recently */
    new_role_permissions?: number;
    // Depot statistics
    /** Total number of warehouse depots configured */
    total_depots?: number;
    /** Number of active depots */
    active_depots?: number;
    /** Number of inactive depots */
    inactive_depots?: number;
    /** Number of depots created recently */
    new_depots?: number;
    // Zone statistics
    /** Total number of geographic zones configured */
    total_zones?: number;
    /** Number of active geographic zones */
    active_zones?: number;
    /** Number of inactive geographic zones */
    inactive_zones?: number;
    /** Number of zones created recently */
    new_zones?: number;
    // Route statistics
    /** Total routes available for sales/delivery agents */
    total_routes: number;
    /** Number of active routes */
    active_routes: number;
    /** Number of inactive routes */
    inactive_routes: number;
    /** Routes added or updated in the current month */
    routes_this_month: number;
    // Visit statistics
    /** Total visits performed by sales representatives */
    total_visits?: number;
    /** Count of active or planned visits */
    active_visits?: number;
    /** Count of inactive, canceled, or missed visits */
    inactive_visits?: number;
    /** Count of new visits scheduled recently */
    new_visits?: number;
    // Customer statistics
    /** Number of new customers registered in the current month */
    new_customers_this_month?: number;
    /** Total number of registered customers */
    total_customers?: number;
    /** Number of active customers in the field */
    active_customers?: number;
    /** Number of inactive or suspended customers */
    inactive_customers?: number;
    /** Number of distributor-class customers */
    distributors?: number;
    /** Number of retailer-class customers */
    retailers?: number;
    /** Number of wholesaler-class customers */
    wholesellers?: number;
    /** Collective credit limit assigned to customers */
    total_credit_limit?: string;
    /** Collective outstanding balance due from customers */
    total_outstanding_amount?: string;
    // Outlet group statistics
    /** Total number of outlet groups */
    total_groups: number;
    /** Number of active outlet groups */
    active_groups: number;
    /** Number of inactive outlet groups */
    inactive_groups: number;
    /** Number of outlet groups created recently */
    new_groups: number;
    /** Average discount percentage applied across all outlet groups */
    avg_discount: number;
    // Asset type statistics
    /** Total number of asset types */
    total_asset_types: number;
    /** Number of active asset types */
    active_asset_types: number;
    /** Number of inactive asset types */
    inactive_asset_types: number;
    /** Number of asset types registered recently */
    new_asset_types: number;
    // Asset brand statistics
    /** Total number of asset brands */
    total_asset_brands?: number;
    /** Number of active asset brands */
    active_asset_brands?: number;
    /** Number of inactive asset brands */
    inactive_asset_brands?: number;
    /** Number of asset brands registered recently */
    new_asset_brands?: number;
    // Asset sub type statistics
    /** Total number of asset sub-types */
    total_asset_sub_types?: number;
    /** Number of active asset sub-types */
    active_asset_sub_types?: number;
    /** Number of inactive asset sub-types */
    inactive_asset_sub_types?: number;
    /** Number of asset sub-types registered recently */
    new_asset_sub_types?: number;
    // Warehouse statistics
    /** Total warehouses tracked in the system */
    total_warehouses: number;
    /** Number of active warehouses */
    active_warehouses: number;
    /** Number of inactive warehouses */
    inactive_warehouses: number;
    /** Number of warehouses registered recently */
    new_warehouses: number;
    // Vehicle statistics
    /** Total vehicles registered in the fleet */
    total_vehicles: number;
    /** Number of active/operational vehicles */
    active_vehicles: number;
    /** Number of inactive or out-of-service vehicles */
    inactive_vehicles: number;
    /** Number of vehicles registered recently */
    new_vehicles: number;
    // Survey statistics
    /** Total surveys defined in the system */
    total_surveys: number;
    /** Number of published surveys available to users */
    published_surveys: number;
    /** Number of surveys in draft state */
    draft_surveys: number;
    /** Number of currently active/open surveys */
    active_surveys: number;
    /** Total survey responses collected from the field */
    total_responses: number;
    /** Total number of survey categories */
    total_categories: number;
    // Asset master statistics
    /** Total physical assets tracked in the asset master database */
    total_assets: number;
    /** Number of active assets in use */
    active_assets: number;
    /** Number of inactive or decommissioned assets */
    inactive_assets: number;
    /** Number of physical assets onboarded during the current month */
    assets_this_month: number;
    // Login history statistics
    /** Total login attempts recorded */
    total_logins: number;
    /** Number of successful logins */
    successful_logins: number;
    /** Number of failed login attempts */
    failed_logins: number;
    /** Count of login attempts registered today */
    today_logins: number;
    // API token statistics
    /** Total number of API tokens generated */
    total_tokens: number;
    /** Number of active/valid API tokens */
    active_tokens: number;
    /** Number of explicitly revoked tokens */
    revoked_tokens: number;
    /** Number of expired tokens */
    expired_tokens: number;
    // Currency statistics
    /** Total currencies supported in the system */
    total_currencies?: number;
    /** Number of active currencies */
    active_currencies?: number;
    /** Number of inactive currencies */
    inactive_currencies?: number;
    /** Number of base/default system currencies */
    base_currencies?: number;
    // Sales target group statistics
    /** Total sales target groups defined */
    total_sales_target_groups?: number;
    /** Active sales target groups */
    active_sales_target_groups?: number;
    /** Inactive sales target groups */
    inactive_sales_target_groups?: number;
    /** Sales target groups created in the current month */
    sales_target_groups_this_month?: number;
    // Sales target statistics
    /** Total individual sales targets assigned */
    total_sales_targets?: number;
    /** Number of active sales targets */
    active_sales_targets?: number;
    /** Number of inactive sales targets */
    inactive_sales_targets?: number;
    /** Sales targets established in the current month */
    sales_targets_this_month?: number;
    // Product statistics
    /** Total product SKUs registered in the catalog */
    total_products?: number;
    /** Number of active/saleable products */
    active_products?: number;
    /** Number of inactive or discontinued products */
    inactive_products?: number;
    /** Products introduced during the current month */
    new_products_this_month?: number;
    // Unit of measurement statistics
    /** Total units of measurement (UoMs) defined */
    total_units?: number;
    /** Active units of measurement */
    active_units?: number;
    /** Inactive units of measurement */
    inactive_units?: number;
    /** Units of measurement added in the current month */
    new_units_this_month?: number;
    // Brand statistics
    /** Total product brands registered */
    total_brands?: number;
    /** Active product brands */
    active_brands?: number;
    /** Inactive product brands */
    inactive_brands?: number;
    /** Product brands registered in the current month */
    new_brands_this_month?: number;
    // Product category statistics
    /** Total product categories defined */
    total_product_categories?: number;
    /** Active product categories */
    active_product_categories?: number;
    /** Inactive product categories */
    inactive_product_categories?: number;
    /** Product categories added in the current month */
    new_product_categories_this_month?: number;
    // Product sub category statistics
    /** Total product sub-categories defined */
    total_sub_categories?: number;
    /** Active product sub-categories */
    active_sub_categories?: number;
    /** Inactive product sub-categories */
    inactive_sub_categories?: number;
    /** Product sub-categories added in the current month */
    new_sub_categories_this_month?: number;
    // Return request statistics
    /** Total returns or claims requested */
    total_requests?: number;
    /** Returns pending review or authorization */
    pending_requests?: number;
    /** Returns approved for pickup/credit */
    approved_requests?: number;
    /** Returns currently undergoing transit or processing */
    processing_requests?: number;
    /** Completed returns */
    completed_requests?: number;
    /** Rejected return requests */
    rejected_requests?: number;
    /** Returns cancelled by the customer or salesperson */
    cancelled_requests?: number;
    /** Returns submitted during the current month */
    new_requests_this_month?: number;
    // Payment statistics
    /** Total payment records captured */
    total_payments?: number;
    /** Active/successful payment receipts */
    active_payments?: number;
    /** Voided or failed payment attempts */
    inactive_payments?: number;
    /** Cumulative payment amount collected */
    total_amount?: number;
    /** Number of payment transactions captured this month */
    payments_this_month?: number;
    /** Cumulative payment amount collected this month */
    amount_this_month?: number;
    /** Active collections currently pending realization */
    pending_collections?: number;
    /** Total overdue balance across customers */
    overdue_amount?: number;
    // Cooler installation statistics
    /** Total cooler cabinets installed in the field */
    total_coolers?: number;
    /** Active/operational cooler installations */
    active_coolers?: number;
    /** Inactive or retrieved cooler installations */
    inactive_coolers?: number;
    /** Coolers newly installed during the current month */
    new_coolers_this_month?: number;
    // Cooler inspection statistics
    /** Total cooler inspection visits performed */
    total_inspections?: number;
    /** Valid or active cooler inspection records */
    active_inspections?: number;
    /** Void or inactive inspection records */
    inactive_inspections?: number;
    /** Inspections conducted during the current month */
    new_inspections_this_month?: number;
    // Stock transfer request statistics
    /** Active/pending stock transfer requests */
    active_requests?: number;
    /** Inactive/closed/completed stock transfer requests */
    inactive_requests?: number;
    /** Stock transfer requests submitted in the current month */
    requests_this_month?: number;
    // Van inventory statistics
    /** Total records in the van inventory database */
    total_records: number;
    /** Active stock items in van inventory */
    active_records: number;
    /** Inactive/deleted items from van inventory */
    inactive_records: number;
    /** Collective volume or count of inventory loaded on vans */
    van_inventory: number;
    // Stock movement statistics
    /** Total stock movement transactions (transfers, load-ins, load-outs) */
    total_stock_movements: number;
    /** Active/successful stock movements */
    active_stock_movements: number;
    /** Inactive/failed/cancelled stock movements */
    inactive_stock_movements: number;
    /** Stock movements processed in the current month */
    stock_movements_this_month: number;
    /** Number of inbound stock movements */
    total_in_movements: number;
    /** Number of outbound stock movements */
    total_out_movements: number;
    /** Number of stock transfer movements between locations */
    total_transfer_movements: number;
    // Survey response statistics
    /** Survey response records compiled in the current month */
    records_this_month: number;
    // KPI target statistics
    /** Total key performance indicator (KPI) targets assigned */
    total_targets: number;
    /** Number of active KPI targets */
    active_targets: number;
    /** Number of inactive/completed KPI targets */
    inactive_targets: number;
    /** KPI targets registered in the current month */
    targets_this_month: number;
    // Promotion statistics
    /** Total promotions defined in the scheme */
    total_promotions: number;
    /** Active/running promotions */
    active_promotions: number;
    /** Inactive/ended promotions */
    inactive_promotions: number;
    /** Promotions launched in the current month */
    promotions_this_month: number;
    // Product flavour statistics
    /** Total product flavours registered */
    total_product_flavours: number;
    /** Active product flavours */
    active_product_flavours: number;
    /** Inactive product flavours */
    inactive_product_flavours: number;
    /** Product flavours added in the current month */
    new_product_flavours_this_month: number;
    // Product volume statistics
    /** Total product volume dimensions tracked */
    total_product_volumes: number;
    /** Active product volume specifications */
    active_product_volumes: number;
    /** Inactive product volume specifications */
    inactive_product_volumes: number;
    /** Product volume specifications added this month */
    new_product_volumes_this_month: number;
    // Product shelf life statistics
    /** Total product shelf life configurations */
    total_product_shelf_life: number;
    /** Active shelf life configurations */
    active_product_shelf_life: number;
    /** Inactive shelf life configurations */
    inactive_product_shelf_life: number;
    /** Shelf life configurations registered this month */
    new_product_shelf_life_this_month: number;
    // Product type statistics
    /** Total product type classifications */
    total_product_types: number;
    /** Active product types */
    active_product_types: number;
    /** Inactive product types */
    inactive_product_types: number;
    /** Product types added during the current month */
    new_product_types_this_month: number;
    // Product target group statistics
    /** Total target group associations for products */
    total_product_target_groups: number;
    /** Active product target groups */
    active_product_target_groups: number;
    /** Inactive product target groups */
    inactive_product_target_groups: number;
    /** Product target groups added during the current month */
    new_product_target_groups_this_month: number;
    // Product web order statistics
    /** Total web orders submitted for products */
    total_product_web_orders: number;
    /** Active product web orders undergoing processing */
    active_product_web_orders: number;
    /** Completed or canceled product web orders */
    inactive_product_web_orders: number;
    /** Product web orders placed during the current month */
    new_product_web_orders_this_month: number;
    // Route assignment statistics
    /** Total salespersons tracked */
    total_salespersons: number;
    /** Number of routes successfully assigned to salespersons */
    total_assigned_routes: number;
    /** Number of routes with no assigned salespersons */
    total_unassigned_routes: number;
    // Reconciliation statistics
    /** Total expected quantity for reconciliations */
    expected?: number;
    /** Total actual quantity for reconciliations */
    actual?: number;
    /** Total quantity posted to default outlet in reconciliations */
    default_outlet?: number;
    /** Total quantity adjusted via unload in reconciliations */
    unload_adjustment?: number;
    /** Number of pending reconciliations */
    pending?: number;
  };
}

/**
 * API error response structure
 */
export interface ApiError {
  /** Literal false indicating failure of the request */
  success: false;
  /** General description message of the encountered error */
  message: string;
  /** Detailed error message, code, or payload returned by the server */
  error: string;
  /** HTTP response status code */
  statusCode: number;
  /** Server timestamp showing when the error occurred (ISO 8601 string) */
  timestamp: string;
  /** API endpoint URI path where the error occurred */
  path: string;
}

/**
 * Extended Axios request config with custom properties
 */
export interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  /** If true, bypasses attaching the Bearer authorization token to request headers */
  skipAuth?: boolean;
  /** Keeps track of the consecutive retry attempts for the request */
  retryCount?: number;
  /** If true, prevents the global error interceptor from showing notifications */
  skipErrorHandling?: boolean;
  /** Diagnostics or diagnostic timing helper properties */
  metadata?: {
    /** Timestamp when the request was fired (epoch milliseconds) */
    startTime?: number;
    [key: string]: any;
  };
}

/**
 * Extended Axios response with custom properties
 * @template T - The type of data returned in the ApiResponse
 */
export interface CustomAxiosResponse<T = any> extends AxiosResponse<
  ApiResponse<T>
> {
  /** Request configuration that generated this response */
  config: CustomAxiosRequestConfig;
}

/**
 * Authentication request payload
 */
export interface LoginRequest {
  /** Username or email address of the user */
  username: string;
  /** Secret password string of the user */
  password: string;
  /** If true, standard session persistence is requested (remember me) */
  remember_me?: boolean;
}

/**
 * Authentication response payload
 */
export interface LoginResponse {
  /** JWT bearer access token issued upon successful authentication */
  token: string;
  /** Authenticated user details and assigned scope */
  user: {
    /** Unique ID of the authenticated user */
    id: number;
    /** Username of the authenticated user */
    username: string;
    /** Registered email address of the user */
    email: string;
    /** Security or administrative role identifier assigned to the user */
    role: string;
    /** ID of the supervising user or parent nodes */
    parent_id: number;
    /** Optional assigned depot ID, null if unassigned */
    depot_id?: number | null;
    /** Optional assigned geographical zone ID, null if unassigned */
    zone_id?: number | null;
  };
  /** Lifespan of the generated JWT token in seconds */
  expires_in?: number;
}

/**
 * Token refresh request payload
 */
export interface RefreshTokenRequest {
  /** Refresh token string used to request a new JWT access token */
  refresh_token: string;
}

/**
 * Token refresh response payload
 */
export interface RefreshTokenResponse {
  /** The newly issued JWT access token */
  token: string;
  /** Lifespan of the newly issued token in seconds */
  expires_in: number;
}

/**
 * HTTP status codes enum
 */
export const HttpStatusCode = {
  /** Request succeeded (200) */
  OK: 200,
  /** Resource successfully created (201) */
  CREATED: 201,
  /** Request succeeded with no content returned (204) */
  NO_CONTENT: 204,
  /** Request is malformed or contains invalid data (400) */
  BAD_REQUEST: 400,
  /** Authentication is required or credentials are invalid (401) */
  UNAUTHORIZED: 401,
  /** Authenticated user lacks permission for the resource (403) */
  FORBIDDEN: 403,
  /** Requested resource could not be found (404) */
  NOT_FOUND: 404,
  /** Request conflicts with existing resource state (409) */
  CONFLICT: 409,
  /** Request body validation failed (422) */
  UNPROCESSABLE_ENTITY: 422,
  /** Server encountered an unexpected error (500) */
  INTERNAL_SERVER_ERROR: 500,
  /** Server is temporarily overloaded or down for maintenance (503) */
  SERVICE_UNAVAILABLE: 503,
} as const;

export type HttpStatusCodeType =
  (typeof HttpStatusCode)[keyof typeof HttpStatusCode];

/**
 * API endpoint paths
 */
export const ApiEndpoints = {
  // Authentication
  /** Login endpoint path */
  LOGIN: '/auth/login',
  /** Logout endpoint path */
  LOGOUT: '/auth/logout',
  /** Token refresh endpoint path */
  REFRESH: '/auth/refresh',
  /** Current user profile endpoint path */
  PROFILE: '/auth/profile',

  // Users
  /** Users collection endpoint path */
  USERS: '/users',
  /** User details endpoint path with dynamic parameter `:id` */
  USER_BY_ID: '/users/:id',

  // Masters
  /** Companies master list endpoint path */
  COMPANIES: '/masters/companies',
  /** Depots master list endpoint path */
  DEPOTS: '/masters/depots',
  /** Zones master list endpoint path */
  ZONES: '/masters/zones',
  /** Routes master list endpoint path */
  ROUTES: '/masters/routes',
  /** Outlets master list endpoint path */
  OUTLETS: '/masters/outlets',

  // Transactions
  /** Orders transactional collection endpoint path */
  ORDERS: '/transactions/orders',
  /** Deliveries transactional collection endpoint path */
  DELIVERIES: '/transactions/deliveries',
  /** Payments transactional collection endpoint path */
  PAYMENTS: '/transactions/payments',
} as const;

/**
 * Request retry configuration
 */
export interface RetryConfig {
  /** Maximum number of retry attempts before giving up */
  maxRetries: number;
  /** Delay time between retries in milliseconds */
  retryDelay: number;
  /** Optional callback to verify whether an error qualifies for a retry */
  retryCondition?: (error: any) => boolean;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  /** Target page index to fetch */
  page?: number;
  /** Maximum number of records to retrieve per page */
  limit?: number;
  /** Database column name to sort results by */
  sort?: string;
  /** Sort order direction: ascending or descending */
  order?: 'asc' | 'desc';
}

/**
 * Filter parameters for list endpoints
 */
export interface FilterParams {
  /** Global text search string */
  search?: string;
  /** Entity status to filter by (e.g. active, inactive) */
  status?: string;
  /** Start date filter boundary (ISO 8601 string) */
  date_from?: string;
  /** End date filter boundary (ISO 8601 string) */
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
  /** Maximum allowed size for uploaded files in bytes */
  maxSize: number;
  /** Array of permitted file mime types */
  allowedTypes: string[];
  /** Destination directory path on the server for file storage */
  uploadPath: string;
}

/**
 * Notification types for error handling
 */
export const NotificationType = {
  /** Success status notification */
  SUCCESS: 'success',
  /** Error status notification */
  ERROR: 'error',
  /** Warning status notification */
  WARNING: 'warning',
  /** General info status notification */
  INFO: 'info',
} as const;

export type NotificationTypeType =
  (typeof NotificationType)[keyof typeof NotificationType];

/**
 * Network error types
 */
export const NetworkErrorType = {
  /** Request execution exceeded the timeout limit */
  TIMEOUT: 'TIMEOUT',
  /** Physical network disconnect or DNS failure */
  NETWORK_ERROR: 'NETWORK_ERROR',
  /** Server returned a 5xx response */
  SERVER_ERROR: 'SERVER_ERROR',
  /** Client request malformed or returned a 4xx response */
  CLIENT_ERROR: 'CLIENT_ERROR',
  /** Request lacked valid authentication credentials (401) */
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  /** User lacks permissions for requested resource (403) */
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  /** Request failed schema or business rule validation (422) */
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;

export type NetworkErrorTypeType =
  (typeof NetworkErrorType)[keyof typeof NetworkErrorType];

/**
 * Custom error class for API errors
 */
export class ApiErrorClass extends Error {
  /** HTTP response status code */
  public statusCode: number;
  /** Classified category of the network or API error */
  public errorType: NetworkErrorTypeType;
  /** The original caught exception or Axios error object */
  public originalError?: any;
  /** Raw server response associated with the original error */
  public response?: any;

  /**
   * Constructs a new ApiErrorClass instance
   * @param message - User-friendly error message description
   * @param statusCode - HTTP status code
   * @param errorType - Classified category of the error
   * @param originalError - The underlying error object from the HTTP client library
   */
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
    this.response = originalError?.response;
  }
}
