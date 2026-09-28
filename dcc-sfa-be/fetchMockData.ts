import prisma from './src/configs/prisma.client';

async function run() {
  const user = await prisma.users.findFirst({
    where: { sap_code: 'MOS100855' },
  });
  if (!user) {
    console.log('User not found');
    return;
  }

  const inv = await prisma.van_inventory.findFirst({
    where: { user_id: user.id },
    orderBy: { id: 'desc' },
  });

  if (!inv) {
    console.log('Inventory not found');
    return;
  }

  const items = await prisma.van_inventory_items.findMany({
    where: { parent_id: inv.id },
    include: {
      van_inventory_items_products: true,
      van_inventory_items_batch_lot: true,
    },
  });

  console.log(JSON.stringify(items, null, 2));
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
