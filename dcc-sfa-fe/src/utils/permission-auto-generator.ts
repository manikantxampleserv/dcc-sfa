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
  'executive-dashboard',
  'grading-dashboard',
  'user',
  'role',
  'depot',
  'zone',
  'region',
  'district',
  'city',
  'currency',
  'route',
  'route-type',
  'outlet',
  'outlet-group',
  'asset-type',
  'asset-brand',
  'asset-sub-types',
  'asset-master',
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
  'visit',
  'asset-movement',
  'maintenance',
  'installation',
  'inspection',
  'van-stock',
  'stock-movement',
  'inventory-items',
  'competitor',
  'customer-complaint',
  'outlet-category',
  'outlet-type',
  'outlet-channel',
  'product-flavour',
  'product-volume',
  'product-shelf-life',
  'product-type',
  'product-target-group',
  'product-web-order',
  'tax-master',
  'location',
  'route-effectiveness',
  'report',
  'approval',
  'exception',
  'login-history',
  'token',
  'setting',
  'templates',
] as const;

export type BackendModule = (typeof BACKEND_MODULES)[number];

/**
 * Manual overrides for menu items that don't follow naming conventions
 * Only add items here if automatic mapping fails
 */
const MANUAL_PERMISSION_OVERRIDES: Record<string, BackendModule> = {
  'executive-dashboard': 'executive-dashboard',
  'grading-dashboard': 'grading-dashboard',
  'user-master': 'user',
  'role-permission': 'role',
  'region-master': 'region',
  'district-master': 'district',
  'city-master': 'city',
  'outlet-master': 'outlet',
  'outlet-groups': 'outlet-group',
  'asset-types': 'asset-type',
  'asset-brands': 'asset-brand',
  'asset-sub-types': 'asset-sub-types',
  'asset-master': 'asset-master',
  'vehicle-master': 'vehicle',
  'product-categories': 'product-category',
  'product-sub-categories': 'product-sub-category',
  'unit-of-measurement': 'unit-of-measurement',
  'product-flavours': 'product-flavour',
  'product-volumes': 'product-volume',
  'product-shelf-life': 'product-shelf-life',
  'product-types': 'product-type',
  'product-target-groups': 'product-target-group',
  'product-web-orders': 'product-web-order',
  'tax-master': 'tax-master',
  'product-catalog': 'product',
  'price-lists': 'pricelist',
  'sales-target-groups': 'sales-target-group',
  'sales-targets': 'sales-target',
  'sales-bonus-rules': 'sales-bonus-rule',
  'kpi-targets': 'kpi-target',
  'survey-templates': 'survey',
  'customer-complaints': 'customer-complaint',
  'outlet-category': 'outlet-category',
  'outlet-type': 'outlet-type',
  'outlet-channel': 'outlet-channel',
  'order-entry': 'order',
  'delivery-scheduling': 'delivery',
  'delivery-schedule': 'delivery',
  'return-requests': 'return',
  'return-request': 'return',
  'payment-collection': 'payment',
  'invoice-management': 'invoice',
  'visit-logging': 'visit',
  'asset-movement': 'asset-movement',
  'asset-maintenance': 'maintenance',
  'cooler-installations': 'installation',
  'cooler-inspections': 'inspection',
  'van-stock': 'van-stock',
  'stock-movements': 'stock-movement',
  'competitor-activity': 'competitor',
  'rep-location': 'report',
  'rep-location-tracking': 'location',
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
  'activity-logs': 'report',
  'survey-responses': 'survey',
  'approval-setup': 'approval',
  'approval-requests': 'approval',
  'route-exceptions': 'exception',
  'login-history': 'login-history',
  'api-tokens': 'token',
  'system-settings': 'setting',
  'email-templates': 'templates',
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
