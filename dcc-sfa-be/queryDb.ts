import prisma from './src/configs/prisma.client';
async function run() {
  const stockMovements = await prisma.stock_movements.findMany({
    where: {
      movement_type: 'SALE',
      product_id: 42 // Returnable Glass Bottles
    },
    select: { id: true, quantity: true, base_quantity: true }
  });
  console.log(JSON.stringify(stockMovements, null, 2));
  await prisma.$disconnect();
}
run();
