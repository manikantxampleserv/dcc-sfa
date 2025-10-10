/**
 * @fileoverview Main Seeder Index
 * @description Orchestrates all seeders with individual commands
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { PrismaClient } from '@prisma/client';
import logger from '../../configs/logger';

// Import all seeders
import { clearAssetMaster, seedAssetMaster } from './assetMaster.seeder';
import { clearAssetTypes, seedAssetTypes } from './assetTypes.seeder';
import { clearBrands, seedBrands } from './brands.seeder';
import { clearCompanies, seedCompanies } from './companies.seeder';
import { clearCurrencies, seedCurrencies } from './currencies.seeder';
import { clearCustomers, seedCustomers } from './customers.seeder';
import { clearDepots, seedDepots } from './depots.seeder';
import { clearOrders, seedOrders } from './orders.seeder';
import { clearPermissions, seedPermissions } from './permissions.seeder';
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
import { clearVisits, seedVisits } from './visits.seeder';
import { clearWarehouses, seedWarehouses } from './warehouses.seeder';
import { clearZones, seedZones } from './zones.seeder';

const prisma = new PrismaClient();

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
    await seedSection('roles');
    await seedSection('permissions');
    await seedSection('currencies');
    await seedSection('unit-of-measurement');

    // 2. Company and location hierarchy
    await seedSection('companies');
    await seedSection('depots');
    await seedSection('zones');

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
export { clearPermissions, seedPermissions } from './permissions.seeder';
export {
  clearProductCategories,
  seedProductCategories,
} from './productCategories.seeder';
export { clearProducts, seedProducts } from './products.seeder';
export {
  clearProductSubCategories,
  seedProductSubCategories,
} from './productSubCategories.seeder';
export { clearRoles, seedRoles } from './roles.seeder';
export { clearRoutes, seedRoutes } from './routes.seeder';
export { clearVehicles, seedVehicles } from './vehicles.seeder';
export { clearVisits, seedVisits } from './visits.seeder';
export { clearWarehouses, seedWarehouses } from './warehouses.seeder';
export { clearZones, seedZones } from './zones.seeder';

// CLI Script functionality
async function main() {
  const command = process.argv[2];
  const section = process.argv[3];

  try {
    switch (command) {
      case 'seed':
        if (section) {
          logger.info(`Seeding ${section}...`);
          await seedSection(section);
        } else {
          logger.info('Seeding all sections...');
          await seedAll();
        }
        break;

      case 'clear':
        if (section) {
          logger.info(`Clearing ${section}...`);
          await clearSection(section);
        } else {
          logger.info('Clearing all sections...');
          await clearAll();
        }
        break;

      case 'reset':
        if (section) {
          logger.info(`Resetting ${section}...`);
          await resetSection(section);
        } else {
          logger.info('Resetting all sections...');
          await resetAll();
        }
        break;

      case 'list':
        listSections();
        break;

      default:
        logger.info(`
Mock Data Seeder CLI

Usage: ts-node src/utils/seeders/index.ts [command] [section]

Commands:
  seed [section]    - Seed specific section or all sections
  clear [section]   - Clear specific section or all sections
  reset [section]   - Reset (clear + seed) specific section or all sections
  list              - List all available sections

Sections:
  roles                    - User roles (11 records)
  permissions              - System permissions (11 records)
  companies                - Company data (11 records)
  depots                   - Depot locations (11 records)
  zones                    - Sales zones (11 records)
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

Examples:
  ts-node src/utils/seeders/index.ts seed                           # Seed all sections
  ts-node src/utils/seeders/index.ts seed roles                     # Seed only roles
  ts-node src/utils/seeders/index.ts clear product-categories       # Clear only product categories
  ts-node src/utils/seeders/index.ts reset currencies               # Reset only currencies
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
