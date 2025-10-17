// export const MODULES = {
//   USER: 'user',
//   ORDER: 'order',
//   CUSTOMER: 'customer',
//   PRODUCT: 'product',
//   COMPANY: 'company',
//   DEPOT: 'depot',
//   ZONE: 'zone',
//   VEHICLE: 'vehicle',
//   ROUTE: 'route',
//   PAYMENT: 'payment',
//   REPORT: 'report',
//   ROLE: 'role',
//   PERMISSION: 'permission',
//   DASHBOARD: 'dashboard',
//   VISIT: 'visit',
//   TARGET: 'target',
//   PROMOTION: 'promotion',
//   DELIVERY: 'delivery',
//   INVENTORY: 'inventory',
//   ATTENDANCE: 'attendance',
// } as const;

// export const ACTIONS = {
//   CREATE: 'create',
//   READ: 'read',
//   UPDATE: 'update',
//   DELETE: 'delete',
//   LIST: 'list',
//   APPROVE: 'approve',
//   REJECT: 'reject',
//   EXPORT: 'export',
//   IMPORT: 'import',
//   ASSIGN: 'assign',
//   CANCEL: 'cancel',
//   VERIFY: 'verify',
//   TRACK: 'track',
//   MANAGE: 'manage',
// } as const;

// export const createPermission = (module: string, action: string): string => {
//   return `${module}.${action}`;
// };

// // Generate ALL permissions for ALL modules
// export const PERMISSIONS = {
//   // USER MODULE
//   USER_CREATE: createPermission(MODULES.USER, ACTIONS.CREATE),
//   USER_READ: createPermission(MODULES.USER, ACTIONS.READ),
//   USER_UPDATE: createPermission(MODULES.USER, ACTIONS.UPDATE),
//   USER_DELETE: createPermission(MODULES.USER, ACTIONS.DELETE),
//   USER_LIST: createPermission(MODULES.USER, ACTIONS.LIST),
//   USER_APPROVE: createPermission(MODULES.USER, ACTIONS.APPROVE),
//   USER_EXPORT: createPermission(MODULES.USER, ACTIONS.EXPORT),
//   USER_IMPORT: createPermission(MODULES.USER, ACTIONS.IMPORT),

//   // ORDER MODULE
//   ORDER_CREATE: createPermission(MODULES.ORDER, ACTIONS.CREATE),
//   ORDER_READ: createPermission(MODULES.ORDER, ACTIONS.READ),
//   ORDER_UPDATE: createPermission(MODULES.ORDER, ACTIONS.UPDATE),
//   ORDER_DELETE: createPermission(MODULES.ORDER, ACTIONS.DELETE),
//   ORDER_LIST: createPermission(MODULES.ORDER, ACTIONS.LIST),
//   ORDER_APPROVE: createPermission(MODULES.ORDER, ACTIONS.APPROVE),
//   ORDER_CANCEL: createPermission(MODULES.ORDER, ACTIONS.CANCEL),
//   ORDER_EXPORT: createPermission(MODULES.ORDER, ACTIONS.EXPORT),

//   // CUSTOMER MODULE
//   CUSTOMER_CREATE: createPermission(MODULES.CUSTOMER, ACTIONS.CREATE),
//   CUSTOMER_READ: createPermission(MODULES.CUSTOMER, ACTIONS.READ),
//   CUSTOMER_UPDATE: createPermission(MODULES.CUSTOMER, ACTIONS.UPDATE),
//   CUSTOMER_DELETE: createPermission(MODULES.CUSTOMER, ACTIONS.DELETE),
//   CUSTOMER_LIST: createPermission(MODULES.CUSTOMER, ACTIONS.LIST),
//   CUSTOMER_APPROVE: createPermission(MODULES.CUSTOMER, ACTIONS.APPROVE),
//   CUSTOMER_EXPORT: createPermission(MODULES.CUSTOMER, ACTIONS.EXPORT),
//   CUSTOMER_IMPORT: createPermission(MODULES.CUSTOMER, ACTIONS.IMPORT),

//   // PRODUCT MODULE
//   PRODUCT_CREATE: createPermission(MODULES.PRODUCT, ACTIONS.CREATE),
//   PRODUCT_READ: createPermission(MODULES.PRODUCT, ACTIONS.READ),
//   PRODUCT_UPDATE: createPermission(MODULES.PRODUCT, ACTIONS.UPDATE),
//   PRODUCT_DELETE: createPermission(MODULES.PRODUCT, ACTIONS.DELETE),
//   PRODUCT_LIST: createPermission(MODULES.PRODUCT, ACTIONS.LIST),
//   PRODUCT_EXPORT: createPermission(MODULES.PRODUCT, ACTIONS.EXPORT),
//   PRODUCT_IMPORT: createPermission(MODULES.PRODUCT, ACTIONS.IMPORT),

//   // COMPANY MODULE
//   COMPANY_CREATE: createPermission(MODULES.COMPANY, ACTIONS.CREATE),
//   COMPANY_READ: createPermission(MODULES.COMPANY, ACTIONS.READ),
//   COMPANY_UPDATE: createPermission(MODULES.COMPANY, ACTIONS.UPDATE),
//   COMPANY_DELETE: createPermission(MODULES.COMPANY, ACTIONS.DELETE),
//   COMPANY_LIST: createPermission(MODULES.COMPANY, ACTIONS.LIST),
//   COMPANY_MANAGE: createPermission(MODULES.COMPANY, ACTIONS.MANAGE),

//   // DEPOT MODULE
//   DEPOT_CREATE: createPermission(MODULES.DEPOT, ACTIONS.CREATE),
//   DEPOT_READ: createPermission(MODULES.DEPOT, ACTIONS.READ),
//   DEPOT_UPDATE: createPermission(MODULES.DEPOT, ACTIONS.UPDATE),
//   DEPOT_DELETE: createPermission(MODULES.DEPOT, ACTIONS.DELETE),
//   DEPOT_LIST: createPermission(MODULES.DEPOT, ACTIONS.LIST),
//   DEPOT_ASSIGN: createPermission(MODULES.DEPOT, ACTIONS.ASSIGN),

//   // ZONE MODULE
//   ZONE_CREATE: createPermission(MODULES.ZONE, ACTIONS.CREATE),
//   ZONE_READ: createPermission(MODULES.ZONE, ACTIONS.READ),
//   ZONE_UPDATE: createPermission(MODULES.ZONE, ACTIONS.UPDATE),
//   ZONE_DELETE: createPermission(MODULES.ZONE, ACTIONS.DELETE),
//   ZONE_LIST: createPermission(MODULES.ZONE, ACTIONS.LIST),
//   ZONE_ASSIGN: createPermission(MODULES.ZONE, ACTIONS.ASSIGN),

//   // VEHICLE MODULE
//   VEHICLE_CREATE: createPermission(MODULES.VEHICLE, ACTIONS.CREATE),
//   VEHICLE_READ: createPermission(MODULES.VEHICLE, ACTIONS.READ),
//   VEHICLE_UPDATE: createPermission(MODULES.VEHICLE, ACTIONS.UPDATE),
//   VEHICLE_DELETE: createPermission(MODULES.VEHICLE, ACTIONS.DELETE),
//   VEHICLE_LIST: createPermission(MODULES.VEHICLE, ACTIONS.LIST),
//   VEHICLE_ASSIGN: createPermission(MODULES.VEHICLE, ACTIONS.ASSIGN),
//   VEHICLE_TRACK: createPermission(MODULES.VEHICLE, ACTIONS.TRACK),

//   // ROUTE MODULE
//   ROUTE_CREATE: createPermission(MODULES.ROUTE, ACTIONS.CREATE),
//   ROUTE_READ: createPermission(MODULES.ROUTE, ACTIONS.READ),
//   ROUTE_UPDATE: createPermission(MODULES.ROUTE, ACTIONS.UPDATE),
//   ROUTE_DELETE: createPermission(MODULES.ROUTE, ACTIONS.DELETE),
//   ROUTE_LIST: createPermission(MODULES.ROUTE, ACTIONS.LIST),
//   ROUTE_ASSIGN: createPermission(MODULES.ROUTE, ACTIONS.ASSIGN),

//   // PAYMENT MODULE
//   PAYMENT_CREATE: createPermission(MODULES.PAYMENT, ACTIONS.CREATE),
//   PAYMENT_READ: createPermission(MODULES.PAYMENT, ACTIONS.READ),
//   PAYMENT_UPDATE: createPermission(MODULES.PAYMENT, ACTIONS.UPDATE),
//   PAYMENT_DELETE: createPermission(MODULES.PAYMENT, ACTIONS.DELETE),
//   PAYMENT_LIST: createPermission(MODULES.PAYMENT, ACTIONS.LIST),
//   PAYMENT_APPROVE: createPermission(MODULES.PAYMENT, ACTIONS.APPROVE),
//   PAYMENT_VERIFY: createPermission(MODULES.PAYMENT, ACTIONS.VERIFY),
//   PAYMENT_EXPORT: createPermission(MODULES.PAYMENT, ACTIONS.EXPORT),

//   // REPORT MODULE
//   REPORT_READ: createPermission(MODULES.REPORT, ACTIONS.READ),
//   REPORT_LIST: createPermission(MODULES.REPORT, ACTIONS.LIST),
//   REPORT_EXPORT: createPermission(MODULES.REPORT, ACTIONS.EXPORT),
//   REPORT_CREATE: createPermission(MODULES.REPORT, ACTIONS.CREATE),
//   REPORT_DELETE: createPermission(MODULES.REPORT, ACTIONS.DELETE),

//   // ROLE MODULE
//   ROLE_CREATE: createPermission(MODULES.ROLE, ACTIONS.CREATE),
//   ROLE_READ: createPermission(MODULES.ROLE, ACTIONS.READ),
//   ROLE_UPDATE: createPermission(MODULES.ROLE, ACTIONS.UPDATE),
//   ROLE_DELETE: createPermission(MODULES.ROLE, ACTIONS.DELETE),
//   ROLE_LIST: createPermission(MODULES.ROLE, ACTIONS.LIST),
//   ROLE_ASSIGN: createPermission(MODULES.ROLE, ACTIONS.ASSIGN),

//   // PERMISSION MODULE
//   PERMISSION_CREATE: createPermission(MODULES.PERMISSION, ACTIONS.CREATE),
//   PERMISSION_READ: createPermission(MODULES.PERMISSION, ACTIONS.READ),
//   PERMISSION_UPDATE: createPermission(MODULES.PERMISSION, ACTIONS.UPDATE),
//   PERMISSION_DELETE: createPermission(MODULES.PERMISSION, ACTIONS.DELETE),
//   PERMISSION_LIST: createPermission(MODULES.PERMISSION, ACTIONS.LIST),
//   PERMISSION_ASSIGN: createPermission(MODULES.PERMISSION, ACTIONS.ASSIGN),

//   // DASHBOARD MODULE
//   DASHBOARD_READ: createPermission(MODULES.DASHBOARD, ACTIONS.READ),
//   DASHBOARD_EXPORT: createPermission(MODULES.DASHBOARD, ACTIONS.EXPORT),

//   // VISIT MODULE
//   VISIT_CREATE: createPermission(MODULES.VISIT, ACTIONS.CREATE),
//   VISIT_READ: createPermission(MODULES.VISIT, ACTIONS.READ),
//   VISIT_UPDATE: createPermission(MODULES.VISIT, ACTIONS.UPDATE),
//   VISIT_DELETE: createPermission(MODULES.VISIT, ACTIONS.DELETE),
//   VISIT_LIST: createPermission(MODULES.VISIT, ACTIONS.LIST),
//   VISIT_VERIFY: createPermission(MODULES.VISIT, ACTIONS.VERIFY),

//   // TARGET MODULE
//   TARGET_CREATE: createPermission(MODULES.TARGET, ACTIONS.CREATE),
//   TARGET_READ: createPermission(MODULES.TARGET, ACTIONS.READ),
//   TARGET_UPDATE: createPermission(MODULES.TARGET, ACTIONS.UPDATE),
//   TARGET_DELETE: createPermission(MODULES.TARGET, ACTIONS.DELETE),
//   TARGET_LIST: createPermission(MODULES.TARGET, ACTIONS.LIST),
//   TARGET_ASSIGN: createPermission(MODULES.TARGET, ACTIONS.ASSIGN),
//   TARGET_APPROVE: createPermission(MODULES.TARGET, ACTIONS.APPROVE),

//   // PROMOTION MODULE
//   PROMOTION_CREATE: createPermission(MODULES.PROMOTION, ACTIONS.CREATE),
//   PROMOTION_READ: createPermission(MODULES.PROMOTION, ACTIONS.READ),
//   PROMOTION_UPDATE: createPermission(MODULES.PROMOTION, ACTIONS.UPDATE),
//   PROMOTION_DELETE: createPermission(MODULES.PROMOTION, ACTIONS.DELETE),
//   PROMOTION_LIST: createPermission(MODULES.PROMOTION, ACTIONS.LIST),
//   PROMOTION_APPROVE: createPermission(MODULES.PROMOTION, ACTIONS.APPROVE),

//   // DELIVERY MODULE
//   DELIVERY_CREATE: createPermission(MODULES.DELIVERY, ACTIONS.CREATE),
//   DELIVERY_READ: createPermission(MODULES.DELIVERY, ACTIONS.READ),
//   DELIVERY_UPDATE: createPermission(MODULES.DELIVERY, ACTIONS.UPDATE),
//   DELIVERY_DELETE: createPermission(MODULES.DELIVERY, ACTIONS.DELETE),
//   DELIVERY_LIST: createPermission(MODULES.DELIVERY, ACTIONS.LIST),
//   DELIVERY_ASSIGN: createPermission(MODULES.DELIVERY, ACTIONS.ASSIGN),
//   DELIVERY_VERIFY: createPermission(MODULES.DELIVERY, ACTIONS.VERIFY),
//   DELIVERY_TRACK: createPermission(MODULES.DELIVERY, ACTIONS.TRACK),

//   // INVENTORY MODULE
//   INVENTORY_CREATE: createPermission(MODULES.INVENTORY, ACTIONS.CREATE),
//   INVENTORY_READ: createPermission(MODULES.INVENTORY, ACTIONS.READ),
//   INVENTORY_UPDATE: createPermission(MODULES.INVENTORY, ACTIONS.UPDATE),
//   INVENTORY_DELETE: createPermission(MODULES.INVENTORY, ACTIONS.DELETE),
//   INVENTORY_LIST: createPermission(MODULES.INVENTORY, ACTIONS.LIST),
//   INVENTORY_EXPORT: createPermission(MODULES.INVENTORY, ACTIONS.EXPORT),
//   INVENTORY_IMPORT: createPermission(MODULES.INVENTORY, ACTIONS.IMPORT),

//   // ATTENDANCE MODULE
//   ATTENDANCE_CREATE: createPermission(MODULES.ATTENDANCE, ACTIONS.CREATE),
//   ATTENDANCE_READ: createPermission(MODULES.ATTENDANCE, ACTIONS.READ),
//   ATTENDANCE_UPDATE: createPermission(MODULES.ATTENDANCE, ACTIONS.UPDATE),
//   ATTENDANCE_DELETE: createPermission(MODULES.ATTENDANCE, ACTIONS.DELETE),
//   ATTENDANCE_LIST: createPermission(MODULES.ATTENDANCE, ACTIONS.LIST),
//   ATTENDANCE_APPROVE: createPermission(MODULES.ATTENDANCE, ACTIONS.APPROVE),
//   ATTENDANCE_EXPORT: createPermission(MODULES.ATTENDANCE, ACTIONS.EXPORT),
// } as const;

export const MODULES = {
  USER: 'user',
  ORDER: 'order',
  CUSTOMER: 'customer',
  PRODUCT: 'product',
  COMPANY: 'company',
  DEPOT: 'depot',
  ZONE: 'zone',
  VEHICLE: 'vehicle',
  ROUTE: 'route',
  PAYMENT: 'payment',
  REPORT: 'report',
  ROLE: 'role',
  PERMISSION: 'permission',
  DASHBOARD: 'dashboard',
  VISIT: 'visit',
  TARGET: 'target',
  PROMOTION: 'promotion',
  DELIVERY: 'delivery',
  INVENTORY: 'inventory',
  ATTENDANCE: 'attendance',
} as const;

export const ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  APPROVE: 'approve',
  EXPORT: 'export',
  IMPORT: 'import',
  ASSIGN: 'assign',
  CANCEL: 'cancel',
  VERIFY: 'verify',
  TRACK: 'track',
  MANAGE: 'manage',
} as const;

export const ROLE_LEVELS = {
  SUPER_ADMIN: 5,
  ADMIN: 4,
  MANAGER: 3,
  SUPERVISOR: 2,
  USER: 1,
} as const;

export const ACTION_LEVEL_REQUIREMENTS = {
  'user.create': ROLE_LEVELS.MANAGER,
  'user.update': ROLE_LEVELS.SUPERVISOR,
  'user.delete': ROLE_LEVELS.ADMIN,
  'user.approve': ROLE_LEVELS.MANAGER,
  'user.import': ROLE_LEVELS.ADMIN,

  'order.create': ROLE_LEVELS.USER,
  'order.update': ROLE_LEVELS.USER,
  'order.delete': ROLE_LEVELS.MANAGER,
  'order.approve': ROLE_LEVELS.SUPERVISOR,
  'order.cancel': ROLE_LEVELS.SUPERVISOR,

  'customer.create': ROLE_LEVELS.USER,
  'customer.update': ROLE_LEVELS.USER,
  'customer.delete': ROLE_LEVELS.MANAGER,
  'customer.approve': ROLE_LEVELS.SUPERVISOR,
  'customer.import': ROLE_LEVELS.ADMIN,

  'product.create': ROLE_LEVELS.MANAGER,
  'product.update': ROLE_LEVELS.SUPERVISOR,
  'product.delete': ROLE_LEVELS.ADMIN,
  'product.import': ROLE_LEVELS.ADMIN,

  'payment.approve': ROLE_LEVELS.MANAGER,
  'payment.verify': ROLE_LEVELS.SUPERVISOR,
  'payment.delete': ROLE_LEVELS.ADMIN,

  'role.create': ROLE_LEVELS.ADMIN,
  'role.update': ROLE_LEVELS.ADMIN,
  'role.delete': ROLE_LEVELS.SUPER_ADMIN,
  'role.assign': ROLE_LEVELS.ADMIN,
  'permission.assign': ROLE_LEVELS.SUPER_ADMIN,

  'report.create': ROLE_LEVELS.MANAGER,
  'report.delete': ROLE_LEVELS.ADMIN,
  'report.export': ROLE_LEVELS.SUPERVISOR,

  'target.create': ROLE_LEVELS.MANAGER,
  'target.assign': ROLE_LEVELS.SUPERVISOR,
  'target.approve': ROLE_LEVELS.MANAGER,
  'target.delete': ROLE_LEVELS.ADMIN,

  'company.manage': ROLE_LEVELS.SUPER_ADMIN,
  'depot.create': ROLE_LEVELS.ADMIN,
  'depot.delete': ROLE_LEVELS.SUPER_ADMIN,
  'zone.create': ROLE_LEVELS.ADMIN,
  'zone.delete': ROLE_LEVELS.SUPER_ADMIN,
};

export const DEFAULT_ROLES = [
  {
    name: 'Super Admin',
    description: 'Full system access with all permissions',
    level: ROLE_LEVELS.SUPER_ADMIN,
  },
  {
    name: 'Admin',
    description: 'Administrative access',
    level: ROLE_LEVELS.ADMIN,
  },
  {
    name: 'Regional Manager',
    description: 'Regional management access',
    level: ROLE_LEVELS.ADMIN,
  },
  {
    name: 'Sales Manager',
    description: 'Sales team management',
    level: ROLE_LEVELS.MANAGER,
  },
  {
    name: 'Area Supervisor',
    description: 'Area supervision and coordination',
    level: ROLE_LEVELS.SUPERVISOR,
  },
  {
    name: 'Field Supervisor',
    description: 'Field team supervision',
    level: ROLE_LEVELS.SUPERVISOR,
  },
  {
    name: 'Salesperson',
    description: 'Field sales executive',
    level: ROLE_LEVELS.USER,
  },
  {
    name: 'Delivery Person',
    description: 'Delivery operations',
    level: ROLE_LEVELS.USER,
  },
  {
    name: 'Merchandiser',
    description: 'Product merchandising',
    level: ROLE_LEVELS.USER,
  },
];

export const createPermission = (module: string, action: string): string => {
  return `${module}.${action}`;
};
