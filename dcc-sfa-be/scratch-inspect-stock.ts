import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

import prisma from './src/configs/prisma.client';

async function main() {
  console.log('=== INSPECTING INVENTORY STOCK MODEL ===');

  const stockCount = await prisma.inventory_stock.count();
  console.log(`Total inventory stock records: ${stockCount}`);

  const sampleStocks = await prisma.inventory_stock.findMany({
    take: 10,
    include: {
      inventory_stock_products: {
        select: { id: true, name: true, code: true }
      },
      inventory_stock_depots: {
        select: { id: true, name: true, code: true }
      }
    }
  });

  console.log('\nSample stock records (first 10):');
  console.log(JSON.stringify(sampleStocks, null, 2));

  // Find all distinct location types
  const locationTypes = await prisma.inventory_stock.groupBy({
    by: ['location_type'],
    _count: true
  });
  console.log('\nDistinct Location Types:');
  console.log(locationTypes);

  // Check stocks for salesperson 1's location
  // Let's find salesperson 1's van inventories to see what location_id they use
  const user1Vans = await prisma.van_inventory.findMany({
    where: { user_id: 1, is_active: 'Y' },
    select: { location_id: true, location_type: true, id: true },
    distinct: ['location_id']
  });

  console.log('\nUser 1 Van Locations:');
  console.log(user1Vans);

  for (const van of user1Vans) {
    if (van.location_id) {
      const stocksForLocation = await prisma.inventory_stock.findMany({
        where: { location_id: van.location_id },
        include: {
          inventory_stock_products: {
            select: { id: true, name: true }
          }
        }
      });
      console.log(`\nStocks for Location ID ${van.location_id} (${van.location_type || 'unknown'}):`);
      console.log(stocksForLocation.map(s => ({
        product_id: s.product_id,
        product_name: s.inventory_stock_products?.name,
        current_stock: s.current_stock,
        available_stock: s.available_stock,
        reserved_stock: s.reserved_stock
      })));
    }
  }

  await prisma.$disconnect();
}

main().catch(console.error);
