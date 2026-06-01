"use strict";
/**
 * @fileoverview Main Seeder Index
 * @description Orchestrates all seeders with individual commands
 * @author DCC-SFA Team
 * @version 1.0.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedProductShelfLife = exports.clearProductShelfLife = exports.seedProductWebOrders = exports.clearProductWebOrders = exports.seedProductTargetGroups = exports.clearProductTargetGroups = exports.seedProductTypes = exports.clearProductTypes = exports.seedProductVolumes = exports.clearProductVolumes = exports.seedProductFlavours = exports.clearProductFlavours = exports.seedProductSubCategories = exports.clearProductSubCategories = exports.seedSalesBonusRules = exports.clearSalesBonusRules = exports.seedSalesTargets = exports.clearSalesTargets = exports.seedSalesTargetGroups = exports.clearSalesTargetGroups = exports.seedProducts = exports.clearProducts = exports.seedProductCategories = exports.clearProductCategories = exports.seedPermissions = exports.clearPermissions = exports.addSinglePermission = exports.addModulePermissions = exports.seedOrders = exports.clearOrders = exports.seedDepots = exports.clearDepots = exports.seedCustomerType = exports.clearCustomerType = exports.seedCustomers = exports.clearCustomers = exports.seedCurrencies = exports.clearCurrencies = exports.seedCompanies = exports.clearCompanies = exports.seedCoolerSubTypes = exports.clearCoolerSubTypes = exports.seedCoolerTypes = exports.clearCoolerTypes = exports.seedBatchLots = exports.clearBatchLots = exports.seedAssetTypes = exports.clearAssetTypes = exports.seedAssetMaster = exports.clearAssetMaster = void 0;
exports.seedZones = exports.clearZones = exports.seedWarehouses = exports.clearWarehouses = exports.seedVisits = exports.clearVisits = exports.seedVehicles = exports.clearVehicles = exports.seedUsers = exports.clearUsers = exports.seedRoutes = exports.clearRoutes = exports.seedRoles = exports.clearRoles = void 0;
exports.seedSection = seedSection;
exports.clearSection = clearSection;
exports.seedAll = seedAll;
exports.clearAll = clearAll;
exports.resetAll = resetAll;
exports.resetSection = resetSection;
exports.listSections = listSections;
exports.resetProductSeeders = resetProductSeeders;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ quiet: true });
const logger_1 = __importDefault(require("../../configs/logger"));
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const assetMaster_seeder_1 = require("./assetMaster.seeder");
const assetTypes_seeder_1 = require("./assetTypes.seeder");
const batchLots_seeder_1 = require("./batchLots.seeder");
const brands_seeder_1 = require("./brands.seeder");
const companies_seeder_1 = require("./companies.seeder");
const currencies_seeder_1 = require("./currencies.seeder");
const customers_seeder_1 = require("./customers.seeder");
const customerType_seeder_1 = require("./customerType.seeder");
const customerChannel_seeder_1 = require("./customerChannel.seeder");
const customerCategory_seeder_1 = require("./customerCategory.seeder");
const depots_seeder_1 = require("./depots.seeder");
const orders_seeder_1 = require("./orders.seeder");
const permissions_seeder_1 = require("./permissions.seeder");
const productCategories_seeder_1 = require("./productCategories.seeder");
const products_seeder_1 = require("./products.seeder");
const productSubCategories_seeder_1 = require("./productSubCategories.seeder");
const productFlavours_seeder_1 = require("./productFlavours.seeder");
const productVolumes_seeder_1 = require("./productVolumes.seeder");
const productTypes_seeder_1 = require("./productTypes.seeder");
const productTargetGroups_seeder_1 = require("./productTargetGroups.seeder");
const productWebOrders_seeder_1 = require("./productWebOrders.seeder");
const productShelfLife_seeder_1 = require("./productShelfLife.seeder");
const roles_seeder_1 = require("./roles.seeder");
const routes_seeder_1 = require("./routes.seeder");
const routeType_seeder_1 = require("./routeType.seeder");
const unitOfMeasurement_seeder_1 = require("./unitOfMeasurement.seeder");
const vehicles_seeder_1 = require("./vehicles.seeder");
const users_seeder_1 = require("./users.seeder");
const visits_seeder_1 = require("./visits.seeder");
const warehouses_seeder_1 = require("./warehouses.seeder");
const zones_seeder_1 = require("./zones.seeder");
const coolerTypes_seeder_1 = require("./coolerTypes.seeder");
const coolerSubTypes_seeder_1 = require("./coolerSubTypes.seeder");
const coolers_seeder_1 = require("./coolers.seeder");
const coolerInspections_seeder_1 = require("./coolerInspections.seeder");
const salesTargetGroups_seeder_1 = require("./salesTargetGroups.seeder");
const salesTargets_seeder_1 = require("./salesTargets.seeder");
const salesBonusRules_seeder_1 = require("./salesBonusRules.seeder");
const survey_templates_seeder_1 = require("./survey-templates.seeder");
const kpi_targets_seeder_1 = require("./kpi-targets.seeder");
const outlet_groups_seeder_1 = require("./outlet-groups.seeder");
const pricelists_seeder_1 = require("./pricelists.seeder");
const taxMaster_seeder_1 = require("./taxMaster.seeder");
// Seeder configuration
const seeders = {
    roles: { seed: roles_seeder_1.seedRoles, clear: roles_seeder_1.clearRoles, name: 'Roles' },
    permissions: {
        seed: permissions_seeder_1.seedPermissions,
        clear: permissions_seeder_1.clearPermissions,
        name: 'Permissions',
    },
    companies: { seed: companies_seeder_1.seedCompanies, clear: companies_seeder_1.clearCompanies, name: 'Companies' },
    depots: { seed: depots_seeder_1.seedDepots, clear: depots_seeder_1.clearDepots, name: 'Depots' },
    zones: { seed: zones_seeder_1.seedZones, clear: zones_seeder_1.clearZones, name: 'Zones' },
    'product-categories': {
        seed: productCategories_seeder_1.seedProductCategories,
        clear: productCategories_seeder_1.clearProductCategories,
        name: 'Product Categories',
    },
    'product-sub-categories': {
        seed: productSubCategories_seeder_1.seedProductSubCategories,
        clear: productSubCategories_seeder_1.clearProductSubCategories,
        name: 'Product Sub Categories',
    },
    'asset-types': {
        seed: assetTypes_seeder_1.seedAssetTypes,
        clear: assetTypes_seeder_1.clearAssetTypes,
        name: 'Asset Types',
    },
    'batch-lots': {
        seed: batchLots_seeder_1.seedBatchLots,
        clear: batchLots_seeder_1.clearBatchLots,
        name: 'Batch Lots',
    },
    warehouses: {
        seed: warehouses_seeder_1.seedWarehouses,
        clear: warehouses_seeder_1.clearWarehouses,
        name: 'Warehouses',
    },
    vehicles: { seed: vehicles_seeder_1.seedVehicles, clear: vehicles_seeder_1.clearVehicles, name: 'Vehicles' },
    currencies: {
        seed: currencies_seeder_1.seedCurrencies,
        clear: currencies_seeder_1.clearCurrencies,
        name: 'Currencies',
    },
    customers: { seed: customers_seeder_1.seedCustomers, clear: customers_seeder_1.clearCustomers, name: 'Customers' },
    'customer-type': {
        seed: customerType_seeder_1.seedCustomerType,
        clear: customerType_seeder_1.clearCustomerType,
        name: 'Customer Type (Outlet Type)',
    },
    'customer-channel': {
        seed: customerChannel_seeder_1.seedCustomerChannel,
        clear: customerChannel_seeder_1.clearCustomerChannel,
        name: 'Customer Channel (Outlet Channel)',
    },
    'customer-category': {
        seed: customerCategory_seeder_1.seedCustomerCategory,
        clear: customerCategory_seeder_1.clearCustomerCategory,
        name: 'Customer Category',
    },
    products: { seed: products_seeder_1.seedProducts, clear: products_seeder_1.clearProducts, name: 'Products' },
    orders: { seed: orders_seeder_1.seedOrders, clear: orders_seeder_1.clearOrders, name: 'Orders' },
    'route-type': {
        seed: routeType_seeder_1.seedRouteType,
        clear: routeType_seeder_1.clearRouteType,
        name: 'Route Type',
    },
    routes: { seed: routes_seeder_1.seedRoutes, clear: routes_seeder_1.clearRoutes, name: 'Routes' },
    visits: { seed: visits_seeder_1.seedVisits, clear: visits_seeder_1.clearVisits, name: 'Visits' },
    'asset-master': {
        seed: assetMaster_seeder_1.seedAssetMaster,
        clear: assetMaster_seeder_1.clearAssetMaster,
        name: 'Asset Master',
    },
    'unit-of-measurement': {
        seed: unitOfMeasurement_seeder_1.seedUnitOfMeasurement,
        clear: unitOfMeasurement_seeder_1.clearUnitOfMeasurement,
        name: 'Unit of Measurement',
    },
    brands: {
        seed: brands_seeder_1.seedBrands,
        clear: brands_seeder_1.clearBrands,
        name: 'Brands',
    },
    'product-types': {
        seed: productTypes_seeder_1.seedProductTypes,
        clear: productTypes_seeder_1.clearProductTypes,
        name: 'Product Types',
    },
    'product-target-groups': {
        seed: productTargetGroups_seeder_1.seedProductTargetGroups,
        clear: productTargetGroups_seeder_1.clearProductTargetGroups,
        name: 'Product Target Groups',
    },
    'product-web-orders': {
        seed: productWebOrders_seeder_1.seedProductWebOrders,
        clear: productWebOrders_seeder_1.clearProductWebOrders,
        name: 'Product Web Orders',
    },
    'product-volumes': {
        seed: productVolumes_seeder_1.seedProductVolumes,
        clear: productVolumes_seeder_1.clearProductVolumes,
        name: 'Product Volumes',
    },
    'product-flavours': {
        seed: productFlavours_seeder_1.seedProductFlavours,
        clear: productFlavours_seeder_1.clearProductFlavours,
        name: 'Product Flavours',
    },
    'product-shelf-life': {
        seed: productShelfLife_seeder_1.seedProductShelfLife,
        clear: productShelfLife_seeder_1.clearProductShelfLife,
        name: 'Product Shelf Life',
    },
    'sales-target-groups': {
        seed: salesTargetGroups_seeder_1.seedSalesTargetGroups,
        clear: salesTargetGroups_seeder_1.clearSalesTargetGroups,
        name: 'Sales Target Groups',
    },
    'sales-targets': {
        seed: salesTargets_seeder_1.seedSalesTargets,
        clear: salesTargets_seeder_1.clearSalesTargets,
        name: 'Sales Targets',
    },
    'sales-bonus-rules': {
        seed: salesBonusRules_seeder_1.seedSalesBonusRules,
        clear: salesBonusRules_seeder_1.clearSalesBonusRules,
        name: 'Sales Bonus Rules',
    },
    'survey-templates': {
        seed: survey_templates_seeder_1.seedSurveyTemplates,
        clear: survey_templates_seeder_1.clearSurveyTemplates,
        name: 'Survey Templates',
    },
    'kpi-targets': {
        seed: kpi_targets_seeder_1.seedKPITargets,
        clear: kpi_targets_seeder_1.clearKPITargets,
        name: 'KPI Targets',
    },
    'outlet-groups': {
        seed: outlet_groups_seeder_1.seedOutletGroups,
        clear: outlet_groups_seeder_1.clearOutletGroups,
        name: 'Outlet Groups',
    },
    pricelists: {
        seed: pricelists_seeder_1.seedPricelists,
        clear: pricelists_seeder_1.clearPricelists,
        name: 'Pricelists',
    },
    'tax-master': {
        seed: taxMaster_seeder_1.seedTaxMaster,
        clear: taxMaster_seeder_1.clearTaxMaster,
        name: 'Tax Master',
    },
    'cooler-types': {
        seed: coolerTypes_seeder_1.seedCoolerTypes,
        clear: coolerTypes_seeder_1.clearCoolerTypes,
        name: 'Cooler Types',
    },
    'cooler-sub-types': {
        seed: coolerSubTypes_seeder_1.seedCoolerSubTypes,
        clear: coolerSubTypes_seeder_1.clearCoolerSubTypes,
        name: 'Cooler Sub Types',
    },
    coolers: { seed: coolers_seeder_1.seedCoolers, clear: coolers_seeder_1.clearCoolers, name: 'Coolers' },
    'cooler-inspections': {
        seed: coolerInspections_seeder_1.seedCoolerInspections,
        clear: coolerInspections_seeder_1.clearCoolerInspections,
        name: 'Cooler Inspections',
    },
    users: { seed: users_seeder_1.seedUsers, clear: users_seeder_1.clearUsers, name: 'Users' },
};
/**
 * Seed individual section
 */
async function seedSection(section) {
    const seeder = seeders[section];
    if (!seeder) {
        logger_1.default.error(`Unknown section: ${section}`);
        logger_1.default.info('Available sections:', Object.keys(seeders).join(', '));
        return;
    }
    try {
        logger_1.default.info(`Seeding ${seeder.name}...`);
        await seeder.seed();
        logger_1.default.success(`${seeder.name} seeding completed!`);
    }
    catch (error) {
        logger_1.default.error(`Error seeding ${seeder.name}:`, error);
        throw error;
    }
}
/**
 * Clear individual section
 */
async function clearSection(section) {
    const seeder = seeders[section];
    if (!seeder) {
        logger_1.default.error(`Unknown section: ${section}`);
        logger_1.default.info('Available sections:', Object.keys(seeders).join(', '));
        return;
    }
    try {
        logger_1.default.info(`Clearing ${seeder.name}...`);
        await seeder.clear();
        logger_1.default.success(`${seeder.name} cleared successfully!`);
    }
    catch (error) {
        logger_1.default.error(`Error clearing ${seeder.name}:`, error);
        throw error;
    }
}
/**
 * Seed all sections
 */
async function seedAll() {
    try {
        logger_1.default.info('Starting comprehensive seeding...');
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
        await seedSection('product-types');
        await seedSection('product-target-groups');
        await seedSection('product-web-orders');
        await seedSection('product-volumes');
        await seedSection('product-flavours');
        await seedSection('product-shelf-life');
        await seedSection('tax-master');
        await seedSection('products');
        await seedSection('batch-lots');
        // 5. Asset management
        await seedSection('asset-types');
        await seedSection('warehouses');
        await seedSection('vehicles');
        await seedSection('asset-master');
        // 6. Customer management (depends on zones)
        await seedSection('customer-type');
        await seedSection('customer-channel');
        await seedSection('customer-category');
        await seedSection('customers');
        // 6.5. Cooler management (depends on customers, cooler-types, cooler-sub-types)
        await seedSection('cooler-types');
        await seedSection('cooler-sub-types');
        await seedSection('coolers');
        await seedSection('cooler-inspections');
        // 7. Operations (depends on customers, products)
        await seedSection('route-type');
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
        logger_1.default.success('All seeding completed successfully!');
    }
    catch (error) {
        logger_1.default.error('Seeding failed:', error);
        throw error;
    }
    finally {
        await prisma_client_1.default.$disconnect();
    }
}
/**
 * Clear all sections
 */
async function clearAll() {
    try {
        logger_1.default.info('Starting comprehensive clearing...');
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
        await clearSection('customer-category');
        await clearSection('customer-channel');
        await clearSection('customer-type');
        await clearSection('routes');
        // 5. Asset management
        await clearSection('asset-master');
        await clearSection('vehicles');
        await clearSection('warehouses');
        await clearSection('asset-types');
        // 4. Product hierarchy
        await clearSection('batch-lots');
        await clearSection('products');
        await clearSection('product-shelf-life');
        await clearSection('product-flavours');
        await clearSection('product-volumes');
        await clearSection('product-web-orders');
        await clearSection('product-target-groups');
        await clearSection('product-types');
        await clearSection('product-sub-categories');
        await clearSection('product-categories');
        await clearSection('brands');
        // 2. Company and location hierarchy
        await clearSection('zones');
        await clearSection('depots');
        // Skip companies due to admin user constraint (users.parent_id references companies)
        logger_1.default.info('Skipping companies clearing due to admin user foreign key constraint');
        // 1. Core system data (clear last - no dependencies)
        await clearSection('unit-of-measurement');
        await clearSection('currencies');
        // Skip permissions and roles as they may be referenced by admin user
        logger_1.default.success('All clearing completed successfully!');
    }
    catch (error) {
        logger_1.default.error('Clearing failed:', error);
        throw error;
    }
    finally {
        await prisma_client_1.default.$disconnect();
    }
}
/**
 * Reset all sections (clear and re-seed)
 */
async function resetAll() {
    try {
        logger_1.default.info('Starting comprehensive reset...');
        await clearAll();
        await seedAll();
        logger_1.default.success('All reset completed successfully!');
    }
    catch (error) {
        logger_1.default.error('Reset failed:', error);
        throw error;
    }
}
/**
 * Reset individual section
 */
async function resetSection(section) {
    try {
        logger_1.default.info(`Resetting ${section}...`);
        await clearSection(section);
        await seedSection(section);
        logger_1.default.success(`${section} reset completed successfully!`);
    }
    catch (error) {
        logger_1.default.error(`Reset failed for ${section}:`, error);
        throw error;
    }
}
/**
 * List all available sections
 */
function listSections() {
    logger_1.default.info('Available sections:');
    Object.entries(seeders).forEach(([key, seeder]) => {
        logger_1.default.info(`  - ${key}: ${seeder.name}`);
    });
}
/**
 * Reset all product-related seeders
 */
async function resetProductSeeders() {
    try {
        logger_1.default.info('Starting product seeders reset...');
        logger_1.default.info('Clearing all dependent data (orders, invoices, etc.)...');
        try {
            await prisma_client_1.default.$executeRawUnsafe('DELETE FROM order_items');
            await prisma_client_1.default.$executeRawUnsafe('DELETE FROM invoice_items');
            await prisma_client_1.default.$executeRawUnsafe('DELETE FROM credit_note_items');
            await prisma_client_1.default.$executeRawUnsafe('DELETE FROM batch_lots');
            await prisma_client_1.default.$executeRawUnsafe('DELETE FROM inventory_stock');
            await prisma_client_1.default.$executeRawUnsafe('DELETE FROM price_history');
            await prisma_client_1.default.$executeRawUnsafe('DELETE FROM pricelist_items');
            await prisma_client_1.default.$executeRawUnsafe('DELETE FROM product_facing');
            await prisma_client_1.default.$executeRawUnsafe('DELETE FROM product_warranty_policy');
            await prisma_client_1.default.$executeRawUnsafe('DELETE FROM promotion_products');
            await prisma_client_1.default.$executeRawUnsafe('DELETE FROM return_requests');
            await prisma_client_1.default.$executeRawUnsafe('DELETE FROM serial_numbers');
            await prisma_client_1.default.$executeRawUnsafe('DELETE FROM stock_movements');
            await prisma_client_1.default.$executeRawUnsafe('DELETE FROM stock_transfer_lines');
            await prisma_client_1.default.$executeRawUnsafe('DELETE FROM van_inventory_items');
            await prisma_client_1.default.$executeRawUnsafe('DELETE FROM warranty_claims');
            await prisma_client_1.default.$executeRawUnsafe('DELETE FROM promotion_condition_products');
            await prisma_client_1.default.$executeRawUnsafe('DELETE FROM promotion_benefit');
            await prisma_client_1.default.$executeRawUnsafe('DELETE FROM depot_price_overrides');
            await prisma_client_1.default.$executeRawUnsafe('DELETE FROM orders');
            await prisma_client_1.default.$executeRawUnsafe('DELETE FROM invoices');
            await prisma_client_1.default.$executeRawUnsafe('DELETE FROM credit_notes');
            logger_1.default.info('Dependent data cleared successfully!');
        }
        catch (error) {
            logger_1.default.warn('Some dependent tables could not be cleared:', error?.message);
        }
        logger_1.default.info('Clearing product-related data...');
        await clearSection('products');
        await clearSection('product-shelf-life');
        await clearSection('product-flavours');
        await clearSection('product-volumes');
        await clearSection('product-web-orders');
        await clearSection('product-target-groups');
        await clearSection('product-types');
        await clearSection('product-sub-categories');
        await clearSection('product-categories');
        await clearSection('brands');
        logger_1.default.info('Seeding product-related data...');
        await seedSection('brands');
        await seedSection('product-categories');
        await seedSection('product-sub-categories');
        await seedSection('product-types');
        await seedSection('product-target-groups');
        await seedSection('product-web-orders');
        await seedSection('product-volumes');
        await seedSection('product-flavours');
        await seedSection('product-shelf-life');
        await seedSection('products');
        logger_1.default.success('Product seeders reset completed successfully!');
    }
    catch (error) {
        logger_1.default.error('Product seeders reset failed:', error);
        throw error;
    }
}
var assetMaster_seeder_2 = require("./assetMaster.seeder");
Object.defineProperty(exports, "clearAssetMaster", { enumerable: true, get: function () { return assetMaster_seeder_2.clearAssetMaster; } });
Object.defineProperty(exports, "seedAssetMaster", { enumerable: true, get: function () { return assetMaster_seeder_2.seedAssetMaster; } });
var assetTypes_seeder_2 = require("./assetTypes.seeder");
Object.defineProperty(exports, "clearAssetTypes", { enumerable: true, get: function () { return assetTypes_seeder_2.clearAssetTypes; } });
Object.defineProperty(exports, "seedAssetTypes", { enumerable: true, get: function () { return assetTypes_seeder_2.seedAssetTypes; } });
var batchLots_seeder_2 = require("./batchLots.seeder");
Object.defineProperty(exports, "clearBatchLots", { enumerable: true, get: function () { return batchLots_seeder_2.clearBatchLots; } });
Object.defineProperty(exports, "seedBatchLots", { enumerable: true, get: function () { return batchLots_seeder_2.seedBatchLots; } });
var coolerTypes_seeder_2 = require("./coolerTypes.seeder");
Object.defineProperty(exports, "clearCoolerTypes", { enumerable: true, get: function () { return coolerTypes_seeder_2.clearCoolerTypes; } });
Object.defineProperty(exports, "seedCoolerTypes", { enumerable: true, get: function () { return coolerTypes_seeder_2.seedCoolerTypes; } });
var coolerSubTypes_seeder_2 = require("./coolerSubTypes.seeder");
Object.defineProperty(exports, "clearCoolerSubTypes", { enumerable: true, get: function () { return coolerSubTypes_seeder_2.clearCoolerSubTypes; } });
Object.defineProperty(exports, "seedCoolerSubTypes", { enumerable: true, get: function () { return coolerSubTypes_seeder_2.seedCoolerSubTypes; } });
var companies_seeder_2 = require("./companies.seeder");
Object.defineProperty(exports, "clearCompanies", { enumerable: true, get: function () { return companies_seeder_2.clearCompanies; } });
Object.defineProperty(exports, "seedCompanies", { enumerable: true, get: function () { return companies_seeder_2.seedCompanies; } });
var currencies_seeder_2 = require("./currencies.seeder");
Object.defineProperty(exports, "clearCurrencies", { enumerable: true, get: function () { return currencies_seeder_2.clearCurrencies; } });
Object.defineProperty(exports, "seedCurrencies", { enumerable: true, get: function () { return currencies_seeder_2.seedCurrencies; } });
var customers_seeder_2 = require("./customers.seeder");
Object.defineProperty(exports, "clearCustomers", { enumerable: true, get: function () { return customers_seeder_2.clearCustomers; } });
Object.defineProperty(exports, "seedCustomers", { enumerable: true, get: function () { return customers_seeder_2.seedCustomers; } });
var customerType_seeder_2 = require("./customerType.seeder");
Object.defineProperty(exports, "clearCustomerType", { enumerable: true, get: function () { return customerType_seeder_2.clearCustomerType; } });
Object.defineProperty(exports, "seedCustomerType", { enumerable: true, get: function () { return customerType_seeder_2.seedCustomerType; } });
var depots_seeder_2 = require("./depots.seeder");
Object.defineProperty(exports, "clearDepots", { enumerable: true, get: function () { return depots_seeder_2.clearDepots; } });
Object.defineProperty(exports, "seedDepots", { enumerable: true, get: function () { return depots_seeder_2.seedDepots; } });
var orders_seeder_2 = require("./orders.seeder");
Object.defineProperty(exports, "clearOrders", { enumerable: true, get: function () { return orders_seeder_2.clearOrders; } });
Object.defineProperty(exports, "seedOrders", { enumerable: true, get: function () { return orders_seeder_2.seedOrders; } });
var permissions_seeder_2 = require("./permissions.seeder");
Object.defineProperty(exports, "addModulePermissions", { enumerable: true, get: function () { return permissions_seeder_2.addModulePermissions; } });
Object.defineProperty(exports, "addSinglePermission", { enumerable: true, get: function () { return permissions_seeder_2.addSinglePermission; } });
Object.defineProperty(exports, "clearPermissions", { enumerable: true, get: function () { return permissions_seeder_2.clearPermissions; } });
Object.defineProperty(exports, "seedPermissions", { enumerable: true, get: function () { return permissions_seeder_2.seedPermissions; } });
var productCategories_seeder_2 = require("./productCategories.seeder");
Object.defineProperty(exports, "clearProductCategories", { enumerable: true, get: function () { return productCategories_seeder_2.clearProductCategories; } });
Object.defineProperty(exports, "seedProductCategories", { enumerable: true, get: function () { return productCategories_seeder_2.seedProductCategories; } });
var products_seeder_2 = require("./products.seeder");
Object.defineProperty(exports, "clearProducts", { enumerable: true, get: function () { return products_seeder_2.clearProducts; } });
Object.defineProperty(exports, "seedProducts", { enumerable: true, get: function () { return products_seeder_2.seedProducts; } });
var salesTargetGroups_seeder_2 = require("./salesTargetGroups.seeder");
Object.defineProperty(exports, "clearSalesTargetGroups", { enumerable: true, get: function () { return salesTargetGroups_seeder_2.clearSalesTargetGroups; } });
Object.defineProperty(exports, "seedSalesTargetGroups", { enumerable: true, get: function () { return salesTargetGroups_seeder_2.seedSalesTargetGroups; } });
var salesTargets_seeder_2 = require("./salesTargets.seeder");
Object.defineProperty(exports, "clearSalesTargets", { enumerable: true, get: function () { return salesTargets_seeder_2.clearSalesTargets; } });
Object.defineProperty(exports, "seedSalesTargets", { enumerable: true, get: function () { return salesTargets_seeder_2.seedSalesTargets; } });
var salesBonusRules_seeder_2 = require("./salesBonusRules.seeder");
Object.defineProperty(exports, "clearSalesBonusRules", { enumerable: true, get: function () { return salesBonusRules_seeder_2.clearSalesBonusRules; } });
Object.defineProperty(exports, "seedSalesBonusRules", { enumerable: true, get: function () { return salesBonusRules_seeder_2.seedSalesBonusRules; } });
var productSubCategories_seeder_2 = require("./productSubCategories.seeder");
Object.defineProperty(exports, "clearProductSubCategories", { enumerable: true, get: function () { return productSubCategories_seeder_2.clearProductSubCategories; } });
Object.defineProperty(exports, "seedProductSubCategories", { enumerable: true, get: function () { return productSubCategories_seeder_2.seedProductSubCategories; } });
var productFlavours_seeder_2 = require("./productFlavours.seeder");
Object.defineProperty(exports, "clearProductFlavours", { enumerable: true, get: function () { return productFlavours_seeder_2.clearProductFlavours; } });
Object.defineProperty(exports, "seedProductFlavours", { enumerable: true, get: function () { return productFlavours_seeder_2.seedProductFlavours; } });
var productVolumes_seeder_2 = require("./productVolumes.seeder");
Object.defineProperty(exports, "clearProductVolumes", { enumerable: true, get: function () { return productVolumes_seeder_2.clearProductVolumes; } });
Object.defineProperty(exports, "seedProductVolumes", { enumerable: true, get: function () { return productVolumes_seeder_2.seedProductVolumes; } });
var productTypes_seeder_2 = require("./productTypes.seeder");
Object.defineProperty(exports, "clearProductTypes", { enumerable: true, get: function () { return productTypes_seeder_2.clearProductTypes; } });
Object.defineProperty(exports, "seedProductTypes", { enumerable: true, get: function () { return productTypes_seeder_2.seedProductTypes; } });
var productTargetGroups_seeder_2 = require("./productTargetGroups.seeder");
Object.defineProperty(exports, "clearProductTargetGroups", { enumerable: true, get: function () { return productTargetGroups_seeder_2.clearProductTargetGroups; } });
Object.defineProperty(exports, "seedProductTargetGroups", { enumerable: true, get: function () { return productTargetGroups_seeder_2.seedProductTargetGroups; } });
var productWebOrders_seeder_2 = require("./productWebOrders.seeder");
Object.defineProperty(exports, "clearProductWebOrders", { enumerable: true, get: function () { return productWebOrders_seeder_2.clearProductWebOrders; } });
Object.defineProperty(exports, "seedProductWebOrders", { enumerable: true, get: function () { return productWebOrders_seeder_2.seedProductWebOrders; } });
var productShelfLife_seeder_2 = require("./productShelfLife.seeder");
Object.defineProperty(exports, "clearProductShelfLife", { enumerable: true, get: function () { return productShelfLife_seeder_2.clearProductShelfLife; } });
Object.defineProperty(exports, "seedProductShelfLife", { enumerable: true, get: function () { return productShelfLife_seeder_2.seedProductShelfLife; } });
var roles_seeder_2 = require("./roles.seeder");
Object.defineProperty(exports, "clearRoles", { enumerable: true, get: function () { return roles_seeder_2.clearRoles; } });
Object.defineProperty(exports, "seedRoles", { enumerable: true, get: function () { return roles_seeder_2.seedRoles; } });
var routes_seeder_2 = require("./routes.seeder");
Object.defineProperty(exports, "clearRoutes", { enumerable: true, get: function () { return routes_seeder_2.clearRoutes; } });
Object.defineProperty(exports, "seedRoutes", { enumerable: true, get: function () { return routes_seeder_2.seedRoutes; } });
var users_seeder_2 = require("./users.seeder");
Object.defineProperty(exports, "clearUsers", { enumerable: true, get: function () { return users_seeder_2.clearUsers; } });
Object.defineProperty(exports, "seedUsers", { enumerable: true, get: function () { return users_seeder_2.seedUsers; } });
var vehicles_seeder_2 = require("./vehicles.seeder");
Object.defineProperty(exports, "clearVehicles", { enumerable: true, get: function () { return vehicles_seeder_2.clearVehicles; } });
Object.defineProperty(exports, "seedVehicles", { enumerable: true, get: function () { return vehicles_seeder_2.seedVehicles; } });
var visits_seeder_2 = require("./visits.seeder");
Object.defineProperty(exports, "clearVisits", { enumerable: true, get: function () { return visits_seeder_2.clearVisits; } });
Object.defineProperty(exports, "seedVisits", { enumerable: true, get: function () { return visits_seeder_2.seedVisits; } });
var warehouses_seeder_2 = require("./warehouses.seeder");
Object.defineProperty(exports, "clearWarehouses", { enumerable: true, get: function () { return warehouses_seeder_2.clearWarehouses; } });
Object.defineProperty(exports, "seedWarehouses", { enumerable: true, get: function () { return warehouses_seeder_2.seedWarehouses; } });
var zones_seeder_2 = require("./zones.seeder");
Object.defineProperty(exports, "clearZones", { enumerable: true, get: function () { return zones_seeder_2.clearZones; } });
Object.defineProperty(exports, "seedZones", { enumerable: true, get: function () { return zones_seeder_2.seedZones; } });
async function main() {
    const command = process.argv[2];
    const arg1 = process.argv[3];
    const arg2 = process.argv[4];
    try {
        switch (command) {
            case 'seed':
                if (arg1) {
                    logger_1.default.info(`Seeding ${arg1}...`);
                    await seedSection(arg1);
                }
                else {
                    logger_1.default.info('Seeding all sections...');
                    await seedAll();
                }
                break;
            case 'clear':
                if (arg1) {
                    logger_1.default.info(`Clearing ${arg1}...`);
                    await clearSection(arg1);
                }
                else {
                    logger_1.default.info('Clearing all sections...');
                    await clearAll();
                }
                break;
            case 'reset':
                if (arg1) {
                    logger_1.default.info(`Resetting ${arg1}...`);
                    await resetSection(arg1);
                }
                else {
                    logger_1.default.info('Resetting all sections...');
                    await resetAll();
                }
                break;
            case 'add-permission':
                if (!arg1) {
                    logger_1.default.error('Usage: ts-node src/utils/seeders/index.ts add-permission <module> [action]');
                    logger_1.default.info('Examples:');
                    logger_1.default.info('  ts-node src/utils/seeders/index.ts add-permission user        # Add all CRUD permissions for user module');
                    logger_1.default.info('  ts-node src/utils/seeders/index.ts add-permission user read    # Add only user_read permission');
                    await prisma_client_1.default.$disconnect();
                    process.exit(1);
                }
                if (arg2) {
                    logger_1.default.info(`Adding permission: ${arg1}_${arg2}...`);
                    const result = await (0, permissions_seeder_1.addSinglePermission)(arg1, arg2);
                    if (result.success) {
                        logger_1.default.success(result.message);
                        logger_1.default.info(`Permission ID: ${result.permission?.id}`);
                    }
                    else {
                        logger_1.default.error(result.message);
                        await prisma_client_1.default.$disconnect();
                        process.exit(1);
                    }
                }
                else {
                    logger_1.default.info(`Adding all CRUD permissions for module: ${arg1}...`);
                    const result = await (0, permissions_seeder_1.addModulePermissions)(arg1);
                    if (result.success) {
                        logger_1.default.success(result.message);
                        logger_1.default.info(`Added: ${result.added} permission(s)`);
                        if (result.skipped > 0) {
                            logger_1.default.info(`Skipped: ${result.skipped} permission(s) (already exist)`);
                        }
                        if (result.permissions && result.permissions.length > 0) {
                            logger_1.default.info('Created permissions:');
                            result.permissions.forEach(p => {
                                logger_1.default.info(`  - ${p.name} (ID: ${p.id})`);
                            });
                        }
                    }
                    else {
                        logger_1.default.error(result.message);
                        await prisma_client_1.default.$disconnect();
                        process.exit(1);
                    }
                }
                await prisma_client_1.default.$disconnect();
                break;
            case 'list':
                listSections();
                break;
            case 'reset-products':
                logger_1.default.info('Resetting all product-related seeders...');
                await resetProductSeeders();
                await prisma_client_1.default.$disconnect();
                break;
            default:
                logger_1.default.info(`
Mock Data Seeder CLI

Usage: ts-node src/utils/seeders/index.ts [command] [section]

Commands:
  seed [section]                    - Seed specific section or all sections
  clear [section]                   - Clear specific section or all sections
  reset [section]                   - Reset (clear + seed) specific section or all sections
  reset-products                    - Reset all product-related seeders (brands, categories, sub-categories, types, target-groups, web-orders, volumes, flavours, shelf-life, products)
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
    }
    catch (error) {
        logger_1.default.error('Script failed:', error);
        process.exit(1);
    }
}
if (require.main === module) {
    main();
}
//# sourceMappingURL=index.js.map