import prisma from './src/configs/prisma.client';

async function main() {
  const movements = await prisma.stock_movements.findMany({
    select: { id: true, movement_type: true, van_inventory_id: true, quantity: true },
    take: 30,
    orderBy: { id: 'desc' },
  });
  console.log(JSON.stringify(movements, null, 2));
  await prisma.$disconnect();
}

main();
