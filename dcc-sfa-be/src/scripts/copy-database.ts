/**
 * @fileoverview Database Copy Script
 * @description Copies all data from production database to development database
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import dotenv from 'dotenv';
dotenv.config({ quiet: true });

import { PrismaClient } from '@prisma/client';
import { PrismaMssql } from '@prisma/adapter-mssql';
import type { config as MssqlConfig } from 'mssql';

const SOURCE_DB_URL =
  'sqlserver://10.160.5.101:1433;initial catalog=DCC_SFA2_LIVE;user=sa;password=Click@321$;TrustServerCertificate=true;';
const TARGET_DB_URL = process.env.DATABASE_URL!;

const parseConnectionString = (connectionString: string): MssqlConfig => {
  const params = Object.fromEntries(
    connectionString
      .split(';')
      .map(p => p.trim())
      .filter(Boolean)
      .map(p => {
        const [key, ...valueParts] = p.split('=');
        return [key.trim().toLowerCase(), valueParts.join('=').trim()];
      })
      .filter(([k, v]) => k && v)
  );

  let server = params.server || params['data source'] || '';
  let port = params.port || '1433';

  if (
    connectionString.startsWith('sqlserver://') ||
    connectionString.startsWith('mssql://')
  ) {
    const url = new URL(connectionString.split(';')[0]);
    server = url.hostname;
    port = url.port || port;
  }

  if (!server || !(params.database || params['initial catalog'])) {
    throw new Error(
      'Invalid connection string: server and database are required'
    );
  }

  return {
    server,
    port: parseInt(port, 10),
    database: params.database || params['initial catalog'] || '',
    user: params['user id'] || params.user || '',
    password: params.password || params.pwd || '',
    options: {
      encrypt: params.encrypt?.toLowerCase() !== 'false',
      trustServerCertificate: true,
      enableArithAbort: true,
    },
    connectionTimeout: 30000,
    requestTimeout: 6000000,
    pool: {
      max: 5,
      min: 1,
      idleTimeoutMillis: 30000,
      acquireTimeoutMillis: 15000,
      createTimeoutMillis: 15000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 100,
    },
  };
};

const createPrismaClient = (connectionString: string): PrismaClient => {
  const connectionConfig = parseConnectionString(connectionString);
  const adapter = new PrismaMssql(connectionConfig);
  return new PrismaClient({
    adapter,
    log: ['error', 'warn'],
  });
};

// Tables in dependency order
const TABLES = [
  'permissions',
  'roles',
  'role_permissions',
  'companies',
  'currencies',
  'unit_of_measurement',
  'subunits',
  'regions',
  'districts',
  'cities',
  'depots',
  'zones',
  'warehouses',
  'vehicles',
  'brands',
  'asset_types',
  'asset_sub_types',
  'asset_brands',
  'asset_master',
  'asset_images',
  'asset_maintenance',
  'asset_warranty_claims',
  'product_categories',
  'product_sub_categories',
  'product_types',
  'product_target_groups',
  'product_web_orders',
  'product_volumes',
  'product_flavours',
  'product_shelf_life',
  'tax_master',
  'products',
  'batch_lots',
  'customer_types',
  'customer_channels',
  'customer_categories',
  'customer_groups',
  'customer_group_members',
  'customers',
  'customer_assets',
  'customer_assets_history',
  'customer_documents',
  'customer_complaints',
  'cooler_types',
  'cooler_sub_types',
  'coolers',
  'cooler_inspections',
  'route_types',
  'routes',
  'route_salespersons',
  'sales_target_groups',
  'sales_target_overrides',
  'sales_targets',
  'sales_bonus_rules',
  'survey_templates',
  'survey_responses',
  'kpi_targets',
  'outlet_groups',
  'pricelists',
  'pricelist_items',
  'route_pricelists',
  'depot_price_overrides',
  'users',
  'user_depots',
  'api_tokens',
  'attendance',
  'attendance_history',
  'visits',
  'visit_tasks',
  'orders',
  'order_items',
  'invoices',
  'invoice_items',
  'credit_notes',
  'credit_note_items',
  'payments',
  'return_requests',
  'return_workflow',
  'stock_movements',
  'stock_transfer_requests',
  'stock_transfer_lines',
  'van_inventory',
  'van_inventory_items',
  'serial_numbers',
  'inventory_stock',
  'asset_movements',
  'asset_movement_assets',
  'asset_movement_contracts',
  'promotions',
  'promotion_products',
  'promotion_parameters',
  'promotion_salesperson',
  'promotion_tracking',
  'price_history',
  'delivery_schedules',
  'notifications',
  'gps_logs',
  'login_history',
  'audit_logs',
  'approval_workflows',
  'workflow_steps',
  'competitor_activities',
  'sfa_d_requests',
  'sfa_d_request_approvals',
  'email_templates',
];

async function copyTable(
  sourcePrisma: PrismaClient,
  targetPrisma: PrismaClient,
  tableName: string
): Promise<{ copied: number; skipped: number; error?: string }> {
  try {
    console.log(`  Copying ${tableName}...`);

    // Get all data from source
    const sourceData: any = await (sourcePrisma as any)[tableName].findMany();

    if (sourceData.length === 0) {
      console.log(`    No data found in ${tableName}`);
      return { copied: 0, skipped: 0 };
    }

    let copied = 0;
    let skipped = 0;
    let identityInsertEnabled = false;

    // Enable IDENTITY_INSERT for this table to preserve IDs
    try {
      await targetPrisma.$executeRawUnsafe(
        `SET IDENTITY_INSERT ${tableName} ON`
      );
      identityInsertEnabled = true;
    } catch (e) {
      // Ignore if table doesn't have identity column
    }

    // Try bulk insert with IDs included
    try {
      const dataToInsert = sourceData.map((record: any) => ({
        ...record,
        createdate: record.createdate || new Date(),
        updatedate: record.updatedate || new Date(),
      }));

      await (targetPrisma as any)[tableName].createMany({
        data: dataToInsert,
        skipDuplicates: true,
      });
      copied = dataToInsert.length;
    } catch (error: any) {
      // If bulk insert fails, try individual inserts
      console.log(`    Bulk insert failed, trying individual inserts...`);
      for (const record of sourceData) {
        try {
          const dataToInsert = {
            ...record,
            createdate: record.createdate || new Date(),
            updatedate: record.updatedate || new Date(),
          };

          await (targetPrisma as any)[tableName].create({
            data: dataToInsert,
          });

          copied++;
        } catch (error: any) {
          // Skip if foreign key constraint fails or duplicate
          if (
            error.code === 'P2003' ||
            error.code === 'P2004' ||
            error.code === 'P2002'
          ) {
            skipped++;
            continue;
          }
          console.error(`      Failed to insert record: ${error.message}`);
        }
      }
    }

    // Disable IDENTITY_INSERT only if we successfully enabled it
    if (identityInsertEnabled) {
      try {
        await targetPrisma.$executeRawUnsafe(
          `SET IDENTITY_INSERT ${tableName} OFF`
        );
      } catch (e) {
        // Ignore error
      }
    }

    console.log(`    ${tableName}: ${copied} copied, ${skipped} skipped`);
    return { copied, skipped };
  } catch (error: any) {
    console.error(`    Error copying ${tableName}:`, error.message);
    return { copied: 0, skipped: 0, error: error.message };
  }
}

async function clearTable(
  targetPrisma: PrismaClient,
  tableName: string
): Promise<void> {
  try {
    console.log(`  Clearing ${tableName}...`);
    // Use raw SQL to delete all records including those with identity constraints
    await targetPrisma.$executeRawUnsafe(`DELETE FROM ${tableName}`);
    // Reset identity seed if table has one
    try {
      await targetPrisma.$executeRawUnsafe(
        `DBCC CHECKIDENT ('${tableName}', RESEED, 1)`
      );
    } catch (e) {
      // Ignore if table doesn't have identity
    }
    console.log(`    ${tableName} cleared`);
  } catch (error: any) {
    console.error(`    Error clearing ${tableName}:`, error.message);
  }
}

async function copyDatabase(): Promise<void> {
  console.log('Starting database copy...');
  console.log(`Source: DCC_SFA2_LIVE at 10.160.5.101:1433`);
  console.log(`Target: SFA_DEVELOPMENT at localhost:63159`);

  const sourcePrisma = createPrismaClient(SOURCE_DB_URL);
  const targetPrisma = createPrismaClient(TARGET_DB_URL);

  try {
    // Test connections
    console.log('Testing source connection...');
    await sourcePrisma.$connect();
    console.log('Source connection successful');

    console.log('Testing target connection...');
    await targetPrisma.$connect();
    console.log('Target connection successful');

    // Clear target database in reverse dependency order
    console.log('\n=== Clearing target database ===');
    const reversedTables = [...TABLES].reverse();
    for (const table of reversedTables) {
      await clearTable(targetPrisma, table);
    }

    // Copy data in dependency order
    console.log('\n=== Copying data ===');
    let totalCopied = 0;
    let totalSkipped = 0;
    let errors = 0;

    for (const table of TABLES) {
      const result = await copyTable(sourcePrisma, targetPrisma, table);
      totalCopied += result.copied;
      totalSkipped += result.skipped;
      if (result.error) errors++;
    }

    console.log('\n=== Summary ===');
    console.log(`Total tables processed: ${TABLES.length}`);
    console.log(`Total records copied: ${totalCopied}`);
    console.log(`Total records skipped: ${totalSkipped}`);
    console.log(`Errors: ${errors}`);
    console.log('\nDatabase copy completed!');
  } catch (error: any) {
    console.error('Fatal error during database copy:', error);
    throw error;
  } finally {
    await sourcePrisma.$disconnect();
    await targetPrisma.$disconnect();
  }
}

copyDatabase();
