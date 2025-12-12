/**
 * @fileoverview Automatic Permission System Generator
 * @description Automatically generates permission mappings from menu items and backend modules
 * @author DCC-SFA Team
 * @version 2.0.0
 */

import menuItems, { type MenuItem } from '../mock/sidebar';

/**
 * Backend modules from permissions seeder - keep this in sync with backend
 * This is the ONLY place you need to update when adding new modules
 */
export const BACKEND_MODULES = [
  'dashboard',
  'company',
  'user',
  'role',
  'depot',
  'zone',
  'currency',
  'route',
  'route-type',
  'outlet',
  'outlet-group',
  'asset-type',
  'asset-master',
  'warehouse',
  'vehicle',
  'brand',
  'product-category',
  'product-sub-category',
  'unit-of-measurement',
  'product',
  'pricelist',
  'sales-target-group',
  'sales-target',
  'sales-bonus-rule',
  'kpi-target',
  'survey',
  'promotions',
  'order',
  'delivery',
  'return',
  'payment',
  'invoice',
  'credit-note',
  'visit',
  'asset-movement',
  'maintenance',
  'installation',
  'inspection',
  'van-stock',
  'stock-movement',
  'stock-transfer',
  'competitor',
  'customer-complaint',
  'customer-category',
  'customer-type',
  'customer-channel',
  'location',
  'route-effectiveness',
  'erp-sync',
  'report',
  'approval',
  'exception',
  'alert',
  'profile',
  'login-history',
  'token',
  'setting',
] as const;

export type BackendModule = (typeof BACKEND_MODULES)[number];

/**
 * Manual overrides for menu items that don't follow naming conventions
 * Only add items here if automatic mapping fails
 */
const MANUAL_PERMISSION_OVERRIDES: Record<string, BackendModule> = {
  'executive-dashboard': 'dashboard',
  'company-master': 'company',
  'user-master': 'user',
  'role-permission': 'role',
  'outlet-master': 'outlet',
  'outlet-groups': 'outlet-group',
  'asset-types': 'asset-type',
  'asset-master': 'asset-master',
  'warehouse-master': 'warehouse',
  'vehicle-master': 'vehicle',
  'product-categories': 'product-category',
  'product-sub-categories': 'product-sub-category',
  'unit-of-measurement': 'unit-of-measurement',
  'product-catalog': 'product',
  pricelists: 'pricelist',
  'price-lists': 'pricelist',
  'sales-target-groups': 'sales-target-group',
  'sales-targets': 'sales-target',
  'sales-bonus-rules': 'sales-bonus-rule',
  'kpi-targets': 'kpi-target',
  'survey-templates': 'survey',
  'customer-complaints': 'customer-complaint',
  'customer-category': 'customer-category',
  'customer-type': 'customer-type',
  'outlet-channel': 'customer-channel',
  'order-entry': 'order',
  'delivery-scheduling': 'delivery',
  'return-requests': 'return',
  'payment-collection': 'payment',
  'invoice-management': 'invoice',
  'credit-notes': 'credit-note',
  'visit-logging': 'visit',
  'asset-movement': 'asset-movement',
  'asset-maintenance': 'maintenance',
  'cooler-installations': 'installation',
  'cooler-inspections': 'inspection',
  'van-stock': 'van-stock',
  'stock-movements': 'stock-movement',
  'stock-transfer-requests': 'stock-transfer',
  'competitor-activity': 'competitor',
  'rep-location': 'report',
  'route-effectiveness': 'route-effectiveness',
  'orders-invoices-returns': 'report',
  'sales-vs-target': 'report',
  'asset-movement-status': 'report',
  'visit-frequency': 'report',
  'promo-effectiveness': 'report',
  'region-territory': 'report',
  'rep-productivity': 'report',
  'competitor-analysis': 'report',
  'outstanding-collection': 'report',
  'attendance-history': 'report',
  'sales-reports': 'report',
  'inventory-reports': 'report',
  'financial-reports': 'report',
  'performance-reports': 'report',
  'erp-sync-logs': 'erp-sync',
  'activity-logs': 'report',
  'survey-responses': 'survey',
  'approval-setup': 'approval',
  'approval-requests': 'approval',
  'route-exceptions': 'exception',
  'alerts-reminders': 'alert',
  profile: 'profile',
  'login-history': 'login-history',
  'api-tokens': 'token',
  'system-settings': 'setting',
};

/**
 * Automatically extracts all menu item IDs from the menu structure
 */
function extractAllMenuItemIds(items: MenuItem[]): string[] {
  const ids: string[] = [];

  function traverse(menuItems: MenuItem[]) {
    menuItems.forEach(item => {
      if (item.href) {
        ids.push(item.id);
      }
      if (item.children) {
        traverse(item.children);
      }
    });
  }

  traverse(items);
  return ids;
}

/**
 * Automatically maps menu item ID to backend module
 */
function autoMapMenuItemToModule(menuId: string): BackendModule | null {
  if (MANUAL_PERMISSION_OVERRIDES[menuId]) {
    return MANUAL_PERMISSION_OVERRIDES[menuId];
  }

  const normalizedMenuId = menuId.toLowerCase().replace(/-/g, '-');

  if (BACKEND_MODULES.includes(normalizedMenuId as BackendModule)) {
    return normalizedMenuId as BackendModule;
  }

  const singularForm = normalizedMenuId.endsWith('s')
    ? normalizedMenuId.slice(0, -1)
    : normalizedMenuId;
  if (BACKEND_MODULES.includes(singularForm as BackendModule)) {
    return singularForm as BackendModule;
  }

  const matchingModule = BACKEND_MODULES.find(
    module =>
      module.includes(normalizedMenuId) || normalizedMenuId.includes(module)
  );

  if (matchingModule) {
    return matchingModule;
  }

  console.warn(`⚠️  No permission mapping found for menu item: ${menuId}`);
  return null;
}

/**
 * Automatically generates permission mappings from menu items
 */
export function generatePermissionMappings(): Record<string, BackendModule> {
  const allMenuIds = extractAllMenuItemIds(menuItems);
  const mappings: Record<string, BackendModule> = {};

  allMenuIds.forEach(menuId => {
    const module = autoMapMenuItemToModule(menuId);
    if (module) {
      mappings[menuId] = module;
    }
  });

  return mappings;
}

/**
 * Gets unique modules that are actually used in menu items
 */
export function getUsedModules(): BackendModule[] {
  const mappings = generatePermissionMappings();
  return [...new Set(Object.values(mappings))];
}

/**
 * Debug function to show all mappings
 */
export function debugPermissionMappings() {
  const mappings = generatePermissionMappings();
  const allMenuIds = extractAllMenuItemIds(menuItems);

  console.log('🔍 Permission Mapping Debug:');
  console.log('='.repeat(50));

  allMenuIds.forEach(menuId => {
    const module = mappings[menuId];
    const status = module ? '✅' : '❌';
    console.log(`${status} ${menuId} -> ${module || 'NO MAPPING'}`);
  });

  console.log('\n📊 Summary:');
  console.log(`Total menu items: ${allMenuIds.length}`);
  console.log(`Mapped items: ${Object.keys(mappings).length}`);
  console.log(
    `Unmapped items: ${allMenuIds.length - Object.keys(mappings).length}`
  );
  console.log(`Used modules: ${getUsedModules().length}`);

  return mappings;
}

export const AUTO_PERMISSION_MAPPINGS = generatePermissionMappings();
