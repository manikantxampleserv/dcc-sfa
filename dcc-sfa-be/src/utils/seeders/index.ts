/**
 * @fileoverview Main Seeder Index
 * @description Orchestrates all seeders with individual commands
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import logger from '../../configs/logger';
import prisma from '../../configs/prisma.client';

// Import all seeders
import { clearAssetMaster, seedAssetMaster } from './assetMaster.seeder';
import { clearAssetTypes, seedAssetTypes } from './assetTypes.seeder';
import { clearBrands, seedBrands } from './brands.seeder';
import { clearCompanies, seedCompanies } from './companies.seeder';
import { clearCurrencies, seedCurrencies } from './currencies.seeder';
import { clearCustomers, seedCustomers } from './customers.seeder';
import { clearDepots, seedDepots } from './depots.seeder';
import { clearOrders, seedOrders } from './orders.seeder';
import {
  addModulePermissions,
  addSinglePermission,
  clearPermissions,
  seedPermissions,
} from './permissions.seeder';
import {
  clearProductCategories,
  seedProductCategories,
} from './productCategories.seeder';
import { clearProducts, seedProducts } from './products.seeder';
import {
  clearProductSubCategories,
  seedProductSubCategories,
} from './productSubCategories.seeder';
import { clearRoles, seedRoles } from './roles.seeder';
import { clearRoutes, seedRoutes } from './routes.seeder';
import {
  clearUnitOfMeasurement,
  seedUnitOfMeasurement,
} from './unitOfMeasurement.seeder';
import { clearVehicles, seedVehicles } from './vehicles.seeder';
import { clearUsers, seedUsers } from './users.seeder';
import { clearVisits, seedVisits } from './visits.seeder';
import { clearWarehouses, seedWarehouses } from './warehouses.seeder';
import { clearZones, seedZones } from './zones.seeder';
import {
  clearSalesTargetGroups,
  seedSalesTargetGroups,
} from './salesTargetGroups.seeder';
import { clearSalesTargets, seedSalesTargets } from './salesTargets.seeder';
import {
  clearSalesBonusRules,
  seedSalesBonusRules,
} from './salesBonusRules.seeder';
import {
  clearSurveyTemplates,
  seedSurveyTemplates,
} from './survey-templates.seeder';
import { clearKPITargets, seedKPITargets } from './kpi-targets.seeder';
import { clearOutletGroups, seedOutletGroups } from './outlet-groups.seeder';
import { clearPricelists, seedPricelists } from './pricelists.seeder';

// Seeder configuration
const seeders = {
  roles: { seed: seedRoles, clear: clearRoles, name: 'Roles' },
  permissions: {
    seed: seedPermissions,
    clear: clearPermissions,
    name: 'Permissions',
  },
  companies: { seed: seedCompanies, clear: clearCompanies, name: 'Companies' },
  depots: { seed: seedDepots, clear: clearDepots, name: 'Depots' },
  zones: { seed: seedZones, clear: clearZones, name: 'Zones' },
  'product-categories': {
    seed: seedProductCategories,
    clear: clearProductCategories,
    name: 'Product Categories',
  },
  'product-sub-categories': {
    seed: seedProductSubCategories,
    clear: clearProductSubCategories,
    name: 'Product Sub Categories',
  },
  'asset-types': {
    seed: seedAssetTypes,
    clear: clearAssetTypes,
    name: 'Asset Types',
  },
  warehouses: {
    seed: seedWarehouses,
    clear: clearWarehouses,
    name: 'Warehouses',
  },
  vehicles: { seed: seedVehicles, clear: clearVehicles, name: 'Vehicles' },
  currencies: {
    seed: seedCurrencies,
    clear: clearCurrencies,
    name: 'Currencies',
  },
  customers: { seed: seedCustomers, clear: clearCustomers, name: 'Customers' },
  products: { seed: seedProducts, clear: clearProducts, name: 'Products' },
  orders: { seed: seedOrders, clear: clearOrders, name: 'Orders' },
  routes: { seed: seedRoutes, clear: clearRoutes, name: 'Routes' },
  visits: { seed: seedVisits, clear: clearVisits, name: 'Visits' },
  'asset-master': {
    seed: seedAssetMaster,
    clear: clearAssetMaster,
    name: 'Asset Master',
  },
  'unit-of-measurement': {
    seed: seedUnitOfMeasurement,
    clear: clearUnitOfMeasurement,
    name: 'Unit of Measurement',
  },
  brands: {
    seed: seedBrands,
    clear: clearBrands,
    name: 'Brands',
  },
  'sales-target-groups': {
    seed: seedSalesTargetGroups,
    clear: clearSalesTargetGroups,
    name: 'Sales Target Groups',
  },
  'sales-targets': {
    seed: seedSalesTargets,
    clear: clearSalesTargets,
    name: 'Sales Targets',
  },
  'sales-bonus-rules': {
    seed: seedSalesBonusRules,
    clear: clearSalesBonusRules,
    name: 'Sales Bonus Rules',
  },
  'survey-templates': {
    seed: seedSurveyTemplates,
    clear: clearSurveyTemplates,
    name: 'Survey Templates',
  },
  'kpi-targets': {
    seed: seedKPITargets,
    clear: clearKPITargets,
    name: 'KPI Targets',
  },
  'outlet-groups': {
    seed: seedOutletGroups,
    clear: clearOutletGroups,
    name: 'Outlet Groups',
  },
  pricelists: {
    seed: seedPricelists,
    clear: clearPricelists,
    name: 'Pricelists',
  },
  users: { seed: seedUsers, clear: clearUsers, name: 'Users' },
};

/**
 * Seed individual section
 */
export async function seedSection(section: string): Promise<void> {
  const seeder = seeders[section as keyof typeof seeders];

  if (!seeder) {
    logger.error(`Unknown section: ${section}`);
    logger.info('Available sections:', Object.keys(seeders).join(', '));
    return;
  }

  try {
    logger.info(`Seeding ${seeder.name}...`);
    await seeder.seed();
    logger.success(`${seeder.name} seeding completed!`);
  } catch (error) {
    logger.error(`Error seeding ${seeder.name}:`, error);
    throw error;
  }
}

/**
 * Clear individual section
 */
export async function clearSection(section: string): Promise<void> {
  const seeder = seeders[section as keyof typeof seeders];

  if (!seeder) {
    logger.error(`Unknown section: ${section}`);
    logger.info('Available sections:', Object.keys(seeders).join(', '));
    return;
  }

  try {
    logger.info(`Clearing ${seeder.name}...`);
    await seeder.clear();
    logger.success(`${seeder.name} cleared successfully!`);
  } catch (error) {
    logger.error(`Error clearing ${seeder.name}:`, error);
    throw error;
  }
}

/**
 * Seed all sections
 */
export async function seedAll(): Promise<void> {
  try {
    logger.info('Starting comprehensive seeding...');

    // Seed in correct dependency order
    // 1. Core system data (no dependencies)
    await seedSection('permissions');
    await seedSection('roles');
    await seedSection('currencies');
    await seedSection('unit-of-measurement');

    // 2. Company and location hierarchy
    await seedSection('companies');
    await seedSection('depots');
    await seedSection('zones');

    // 3. Users (depends on roles, companies, depots, zones)
    await seedSection('users');

    // 4. Product hierarchy
    await seedSection('brands');
    await seedSection('product-categories');
    await seedSection('product-sub-categories');
    await seedSection('products');

    // 5. Asset management
    await seedSection('asset-types');
    await seedSection('warehouses');
    await seedSection('vehicles');
    await seedSection('asset-master');

    // 6. Customer management (depends on zones)
    await seedSection('customers');

    // 7. Operations (depends on customers, products)
    await seedSection('routes');
    await seedSection('orders');
    await seedSection('visits');

    // 8. Sales management
    await seedSection('sales-target-groups');
    await seedSection('sales-targets');
    await seedSection('sales-bonus-rules');
    await seedSection('survey-templates');
    await seedSection('kpi-targets');
    await seedSection('outlet-groups');
    await seedSection('pricelists');

    logger.success('All seeding completed successfully!');
  } catch (error) {
    logger.error('Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Clear all sections
 */
export async function clearAll(): Promise<void> {
  try {
    logger.info('Starting comprehensive clearing...');

    // Clear in reverse dependency order (exact reverse of seeding)
    // 7. Operations (clear first - depends on users, customers, products)
    await clearSection('visits');
    await clearSection('orders');

    // 8. Sales management
    await clearSection('pricelists');
    await clearSection('outlet-groups');
    await clearSection('kpi-targets');
    await clearSection('survey-templates');
    await clearSection('sales-bonus-rules');
    await clearSection('sales-targets');
    await clearSection('sales-target-groups');

    // 6. Customer management (clear before routes due to foreign key)
    await clearSection('customers');
    await clearSection('routes');

    // 5. Asset management
    await clearSection('asset-master');
    await clearSection('vehicles');
    await clearSection('warehouses');
    await clearSection('asset-types');

    // 4. Product hierarchy
    await clearSection('products');
    await clearSection('product-sub-categories');
    await clearSection('product-categories');
    await clearSection('brands');

    // 2. Company and location hierarchy
    await clearSection('zones');
    await clearSection('depots');

    // Skip companies due to admin user constraint (users.parent_id references companies)
    logger.info(
      'Skipping companies clearing due to admin user foreign key constraint'
    );

    // 1. Core system data (clear last - no dependencies)
    await clearSection('unit-of-measurement');
    await clearSection('currencies');
    // Skip permissions and roles as they may be referenced by admin user

    logger.success('All clearing completed successfully!');
  } catch (error) {
    logger.error('Clearing failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Reset all sections (clear and re-seed)
 */
export async function resetAll(): Promise<void> {
  try {
    logger.info('Starting comprehensive reset...');
    await clearAll();
    await seedAll();
    logger.success('All reset completed successfully!');
  } catch (error) {
    logger.error('Reset failed:', error);
    throw error;
  }
}

/**
 * Reset individual section
 */
export async function resetSection(section: string): Promise<void> {
  try {
    logger.info(`Resetting ${section}...`);
    await clearSection(section);
    await seedSection(section);
    logger.success(`${section} reset completed successfully!`);
  } catch (error) {
    logger.error(`Reset failed for ${section}:`, error);
    throw error;
  }
}

/**
 * List all available sections
 */
export function listSections(): void {
  logger.info('Available sections:');
  Object.entries(seeders).forEach(([key, seeder]) => {
    logger.info(`  - ${key}: ${seeder.name}`);
  });
}

// Export individual seeders for direct access
export { clearAssetMaster, seedAssetMaster } from './assetMaster.seeder';
export { clearAssetTypes, seedAssetTypes } from './assetTypes.seeder';
export { clearCompanies, seedCompanies } from './companies.seeder';
export { clearCurrencies, seedCurrencies } from './currencies.seeder';
export { clearCustomers, seedCustomers } from './customers.seeder';
export { clearDepots, seedDepots } from './depots.seeder';
export { clearOrders, seedOrders } from './orders.seeder';
export {
  addModulePermissions,
  addSinglePermission,
  clearPermissions,
  seedPermissions,
} from './permissions.seeder';
export {
  clearProductCategories,
  seedProductCategories,
} from './productCategories.seeder';
export { clearProducts, seedProducts } from './products.seeder';
export {
  clearSalesTargetGroups,
  seedSalesTargetGroups,
} from './salesTargetGroups.seeder';
export { clearSalesTargets, seedSalesTargets } from './salesTargets.seeder';
export {
  clearSalesBonusRules,
  seedSalesBonusRules,
} from './salesBonusRules.seeder';
export {
  clearProductSubCategories,
  seedProductSubCategories,
} from './productSubCategories.seeder';
export { clearRoles, seedRoles } from './roles.seeder';
export { clearRoutes, seedRoutes } from './routes.seeder';
export { clearUsers, seedUsers } from './users.seeder';
export { clearVehicles, seedVehicles } from './vehicles.seeder';
export { clearVisits, seedVisits } from './visits.seeder';
export { clearWarehouses, seedWarehouses } from './warehouses.seeder';
export { clearZones, seedZones } from './zones.seeder';

// CLI Script functionality
async function main() {
  const command = process.argv[2];
  const arg1 = process.argv[3];
  const arg2 = process.argv[4];

  try {
    switch (command) {
      case 'seed':
        if (arg1) {
          logger.info(`Seeding ${arg1}...`);
          await seedSection(arg1);
        } else {
          logger.info('Seeding all sections...');
          await seedAll();
        }
        break;

      case 'clear':
        if (arg1) {
          logger.info(`Clearing ${arg1}...`);
          await clearSection(arg1);
        } else {
          logger.info('Clearing all sections...');
          await clearAll();
        }
        break;

      case 'reset':
        if (arg1) {
          logger.info(`Resetting ${arg1}...`);
          await resetSection(arg1);
        } else {
          logger.info('Resetting all sections...');
          await resetAll();
        }
        break;

      case 'add-permission':
        if (!arg1) {
          logger.error(
            'Usage: ts-node src/utils/seeders/index.ts add-permission <module> [action]'
          );
          logger.info('Examples:');
          logger.info(
            '  ts-node src/utils/seeders/index.ts add-permission user        # Add all CRUD permissions for user module'
          );
          logger.info(
            '  ts-node src/utils/seeders/index.ts add-permission user read    # Add only user_read permission'
          );
          await prisma.$disconnect();
          process.exit(1);
        }

        if (arg2) {
          logger.info(`Adding permission: ${arg1}_${arg2}...`);
          const result = await addSinglePermission(arg1, arg2);
          if (result.success) {
            logger.success(result.message);
            logger.info(`Permission ID: ${result.permission?.id}`);
          } else {
            logger.error(result.message);
            await prisma.$disconnect();
            process.exit(1);
          }
        } else {
          logger.info(`Adding all CRUD permissions for module: ${arg1}...`);
          const result = await addModulePermissions(arg1);
          if (result.success) {
            logger.success(result.message);
            logger.info(`Added: ${result.added} permission(s)`);
            if (result.skipped > 0) {
              logger.info(
                `Skipped: ${result.skipped} permission(s) (already exist)`
              );
            }
            if (result.permissions && result.permissions.length > 0) {
              logger.info('Created permissions:');
              result.permissions.forEach(p => {
                logger.info(`  - ${p.name} (ID: ${p.id})`);
              });
            }
          } else {
            logger.error(result.message);
            await prisma.$disconnect();
            process.exit(1);
          }
        }
        await prisma.$disconnect();
        break;

      case 'list':
        listSections();
        break;

      default:
        logger.info(`
Mock Data Seeder CLI

Usage: ts-node src/utils/seeders/index.ts [command] [section]

Commands:
  seed [section]                    - Seed specific section or all sections
  clear [section]                   - Clear specific section or all sections
  reset [section]                   - Reset (clear + seed) specific section or all sections
  add-permission <module> [action]  - Add all CRUD permissions for a module, or a single permission
  list                              - List all available sections

Sections:
  roles                    - User roles (11 records)
  permissions              - System permissions (11 records)
  companies                - Company data (11 records)
  depots                   - Depot locations (11 records)
  zones                    - Sales zones (11 records)
  users                    - Users including admin (12 records)
  currencies               - Currency data (11 records)
  asset-types              - Asset types (11 records)
  warehouses               - Warehouse data (11 records)
  vehicles                 - Vehicle fleet (11 records)
  customers                - Customer data (11 records)
  product-categories       - Product categories (11 records)
  product-sub-categories   - Product sub categories (11 records)
  unit-of-measurement      - Unit of measurement data (11 records)
  brands                   - Brand data (11 records)
  products                 - Product catalog (11 records)
  orders                   - Order records (11 records) 
  routes                   - Delivery routes (11 records)
  visits                   - Customer visits (11 records)
  asset-master             - Asset inventory (11 records)
  sales-target-groups      - Sales target groups (11 records)
  sales-targets            - Sales targets (11 records)
  sales-bonus-rules        - Sales bonus rules (11 records)
  survey-templates          - Survey templates (11 records)
  kpi-targets             - KPI targets (16 records)
  outlet-groups            - Outlet groups (15 records)
  pricelists               - Pricelists (15 records)

Examples:
  ts-node src/utils/seeders/index.ts seed                           # Seed all sections
  ts-node src/utils/seeders/index.ts seed roles                     # Seed only roles
  ts-node src/utils/seeders/index.ts clear product-categories       # Clear only product categories
  ts-node src/utils/seeders/index.ts reset currencies               # Reset only currencies
  ts-node src/utils/seeders/index.ts add-permission user            # Add all CRUD permissions for user module
  ts-node src/utils/seeders/index.ts add-permission user read       # Add only user_read permission
  ts-node src/utils/seeders/index.ts add-permission company create # Add only company_create permission
  ts-node src/utils/seeders/index.ts list                           # List all sections
        `);
        process.exit(1);
    }
  } catch (error) {
    logger.error('Script failed:', error);
    process.exit(1);
  }
}

// Run CLI if this file is executed directly
if (require.main === module) {
  main();
}
