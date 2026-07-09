import prisma from './src/configs/prisma.client';

async function main() {
  await prisma.van_inventory_items.update({
    where: { id: 2430 },
    data: { batch_lot_id: 1549 }
  });

  await prisma.van_inventory_items.update({
    where: { id: 2431 },
    data: { batch_lot_id: 1550 }
  });

  await prisma.van_inventory_items.update({
    where: { id: 2432 },
    data: { batch_lot_id: 1551 }
  });

  console.log('Successfully mapped van inventory items to their batch lots!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
