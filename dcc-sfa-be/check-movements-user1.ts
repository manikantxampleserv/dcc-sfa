import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

import prisma from './src/configs/prisma.client';

async function main() {
  console.log('=== INSPECTING STOCK MOVEMENTS ===');

  // Total movements
  const total = await prisma.stock_movements.count();
  console.log(`Total stock movements in DB: ${total}`);

  // Movements by movement_type
  const types = await prisma.stock_movements.groupBy({
    by: ['movement_type'],
    _count: true,
  });
  console.log('Movements by type:', JSON.stringify(types, null, 2));

  // Movements with van_inventory_id
  const withVanInventory = await prisma.stock_movements.count({
    where: {
      van_inventory_id: { not: null },
    },
  });
  console.log(`Movements associated with a van_inventory: ${withVanInventory}`);

  // Sample movements
  const samples = await prisma.stock_movements.findMany({
    where: {
      van_inventory_id: { not: null },
    },
    take: 10,
    orderBy: { id: 'desc' },
  });

  console.log('Sample stock movements with van_inventory_id:');
  samples.forEach(sm => {
    console.log(
      `- ID: ${sm.id}, Type: ${sm.movement_type}, Van Inventory ID: ${sm.van_inventory_id}, Product ID: ${sm.product_id}, Qty: ${sm.quantity}, Created By: ${sm.createdby}`
    );
  });

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
