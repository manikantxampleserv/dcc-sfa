import prisma from './src/configs/prisma.client';

async function main() {
  const vanInventories = await prisma.van_inventory.findMany({
    where: {
      user_id: 54,
      status: 'A',
      is_active: 'Y'
    },
    include: {
      van_inventory_items_inventory: {
        where: {
          product_id: 152
        },
        include: {
          van_inventory_items_batch_lot: true
        }
      }
    }
  });

  console.log(JSON.stringify(vanInventories, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
