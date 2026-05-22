import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

import prisma from './src/configs/prisma.client';

async function main() {
  console.log('=== CHECKING VAN INVENTORY ITEMS IN DATABASE ===');

  const totalItems = await prisma.van_inventory_items.count();
  console.log(`Total van_inventory_items records: ${totalItems}`);

  if (totalItems > 0) {
    const items = await prisma.van_inventory_items.findMany({
      take: 10,
      include: {
        van_inventory_items_inventory: true,
      },
    });
    console.log('Sample items (first 10):', JSON.stringify(items, null, 2));
  } else {
    console.log('No items found in van_inventory_items table!');
  }

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
