import prisma from './src/configs/prisma.client';

async function main() {
  await prisma.van_inventory_items.update({
    where: { id: 2535 },
    data: { batch_lot_id: 1651 }
  });

  await prisma.van_inventory_items.update({
    where: { id: 2536 },
    data: { batch_lot_id: 1652 }
  });

  console.log('Successfully mapped new van inventory items to their batch lots!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
