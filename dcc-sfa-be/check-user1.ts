import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

import prisma from './src/configs/prisma.client';

async function main() {
  console.log('=== VERIFYING ALL VAN INVENTORY ENTRIES FOR USER 1 ===');
  const user1Inventories = await prisma.van_inventory.findMany({
    where: { user_id: 1 },
    include: {
      van_inventory_items_inventory: true,
    },
  });

  console.log(`Found ${user1Inventories.length} inventories for User 1.`);
  user1Inventories.forEach(v => {
    console.log(`- ID: ${v.id}, Loading Type: ${v.loading_type}, Status: ${v.status}, Active: ${v.is_active}, Created: ${v.createdate}, Items Count: ${v.van_inventory_items_inventory.length}`);
    v.van_inventory_items_inventory.forEach(item => {
      console.log(`  * Item ID: ${item.id}, Product: ${item.product_name} (ID: ${item.product_id}), Quantity: ${item.quantity}`);
    });
  });

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
