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
  API_TOKEN: 'tokens',
} as const;

export const ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
} as const;

export const createPermission = (module: string, action: string): string => {
  return `${module}.${action}`;
};

export const PERMISSIONS = {
  USER_CREATE: createPermission(MODULES.USER, ACTIONS.CREATE),
  USER_READ: createPermission(MODULES.USER, ACTIONS.READ),
  USER_UPDATE: createPermission(MODULES.USER, ACTIONS.UPDATE),
  USER_DELETE: createPermission(MODULES.USER, ACTIONS.DELETE),
  USER_LIST: createPermission(MODULES.USER, ACTIONS.LIST),

  ORDER_CREATE: createPermission(MODULES.ORDER, ACTIONS.CREATE),
  ORDER_READ: createPermission(MODULES.ORDER, ACTIONS.READ),
  ORDER_UPDATE: createPermission(MODULES.ORDER, ACTIONS.UPDATE),
  ORDER_DELETE: createPermission(MODULES.ORDER, ACTIONS.DELETE),
  ORDER_LIST: createPermission(MODULES.ORDER, ACTIONS.LIST),

  API_TOKEN_CREATE: createPermission(MODULES.API_TOKEN, ACTIONS.CREATE),
  API_TOKEN_READ: createPermission(MODULES.API_TOKEN, ACTIONS.READ),
  API_TOKEN_UPDATE: createPermission(MODULES.API_TOKEN, ACTIONS.UPDATE),
  API_TOKEN_DELETE: createPermission(MODULES.API_TOKEN, ACTIONS.DELETE),
  API_TOKEN_LIST: createPermission(MODULES.API_TOKEN, ACTIONS.LIST),
} as const;
