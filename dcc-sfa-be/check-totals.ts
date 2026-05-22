import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

import prisma from './src/configs/prisma.client';

async function main() {
  console.log('=== INVESTIGATING LOAD VS UNLOAD QUANTITIES FOR USER 1 ===');

  // Get all User 1's van inventories
  const vanInventories = await prisma.van_inventory.findMany({
    where: { user_id: 1 },
    include: {
      van_inventory_items_inventory: true,
      van_inventory_stock_movements: true,
    },
  });

  console.log(`\nTotal van inventories: ${vanInventories.length}`);

  let totalQtyLoadedFromItems = 0;
  let totalQtyUnloadedFromItems = 0;
  let loadCount = 0;
  let unloadCount = 0;

  let totalQtyLoadedFromMovements = 0;
  let totalQtyUnloadedFromMovements = 0;

  for (const inv of vanInventories) {
    const itemsSum = inv.van_inventory_items_inventory.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    const movementsSum = inv.van_inventory_stock_movements.reduce((sum, sm) => sum + (Number(sm.quantity) || 0), 0);

    if (inv.loading_type === 'L') {
      loadCount++;
      totalQtyLoadedFromItems += itemsSum;
      totalQtyLoadedFromMovements += movementsSum;
    } else if (inv.loading_type === 'U') {
      unloadCount++;
      totalQtyUnloadedFromItems += itemsSum;
      totalQtyUnloadedFromMovements += movementsSum;
    }
  }

  console.log(`\nFrom items sum:`);
  console.log(`- Loads (${loadCount}): ${totalQtyLoadedFromItems}`);
  console.log(`- Unloads (${unloadCount}): ${totalQtyUnloadedFromItems}`);

  console.log(`\nFrom movements sum:`);
  console.log(`- Loads (${loadCount}): ${totalQtyLoadedFromMovements}`);
  console.log(`- Unloads (${unloadCount}): ${totalQtyUnloadedFromMovements}`);

  // Group by movement_type for User 1's inventories
  const movementsSummary = await prisma.stock_movements.groupBy({
    by: ['movement_type'],
    where: {
      van_inventory_id: { in: vanInventories.map(v => v.id) },
    },
    _sum: {
      quantity: true,
    },
    _count: true,
  });

  console.log('\nStock movements grouped by movement_type for User 1\'s inventories:');
  console.log(JSON.stringify(movementsSummary, null, 2));

  // Let's print a sample of loading vs unloading van inventories having large quantities
  console.log('\nTop 5 Load inventories by movements quantity:');
  const topLoads = vanInventories
    .filter(v => v.loading_type === 'L')
    .map(v => ({
      id: v.id,
      movementsSum: v.van_inventory_stock_movements.reduce((sum, sm) => sum + sm.quantity, 0),
      itemsSum: v.van_inventory_items_inventory.reduce((sum, item) => sum + item.quantity, 0),
      status: v.status,
    }))
    .sort((a, b) => b.movementsSum - a.movementsSum)
    .slice(0, 5);
  console.log(topLoads);

  console.log('\nTop 5 Unload inventories by movements quantity:');
  const topUnloads = vanInventories
    .filter(v => v.loading_type === 'U')
    .map(v => ({
      id: v.id,
      movementsSum: v.van_inventory_stock_movements.reduce((sum, sm) => sum + sm.quantity, 0),
      itemsSum: v.van_inventory_items_inventory.reduce((sum, item) => sum + item.quantity, 0),
      status: v.status,
    }))
    .sort((a, b) => b.movementsSum - a.movementsSum)
    .slice(0, 5);
  console.log(topUnloads);

  await prisma.$disconnect();
}

main().catch(console.error);
