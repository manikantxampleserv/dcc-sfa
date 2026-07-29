import prisma from '../configs/prisma.client';
import * as fs from 'fs';
import * as path from 'path';

const models = [
  'asset_master', 'asset_types', 'batch_lots', 'brands', 'companies',
  'cooler_inspections', 'coolers', 'cooler_sub_types', 'cooler_types',
  'currencies', 'customer_category', 'customer_channel', 'customers',
  'customer_type', 'depots', 'email_templates', 'kpi_targets', 'orders',
  'outlet_groups', 'permissions', 'pricelists', 'product_categories',
  'product_flavours', 'products', 'product_shelf_life', 'product_sub_categories',
  'product_target_groups', 'product_types', 'product_volumes', 'product_web_orders',
  'roles', 'routes', 'route_type', 'sales_bonus_rules', 'sales_target_groups',
  'sales_targets', 'survey_templates', 'tax_master', 'unit_of_measurement',
  'users', 'vehicles', 'visits', 'warehouses', 'zones'
];

const largeTables = ['customers', 'coolers', 'asset_master', 'batch_lots', 'visits', 'stock_movements', 'invoices'];

async function main() {
  const dataDir = path.join(__dirname, '../utils/seeders/data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  for (const model of models) {
    try {
      if ((prisma as any)[model]) {
        console.log(`Extracting ${model}...`);
        
        // Take 10 for massive tables, otherwise take 1000 (which gets all master data)
        const takeCount = largeTables.includes(model) ? 10 : 1000;
        
        const data = await (prisma as any)[model].findMany({
          take: takeCount
        });
        
        fs.writeFileSync(
          path.join(dataDir, `${model}.json`), 
          JSON.stringify(data, null, 2)
        );
        console.log(`Successfully extracted ${data.length} records for ${model}`);
      } else {
        console.warn(`Model ${model} not found on Prisma Client.`);
      }
    } catch (e) {
      console.error(`Error extracting ${model}:`, e);
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
