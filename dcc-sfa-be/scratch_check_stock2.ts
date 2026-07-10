import prisma from './src/configs/prisma.client';
async function main() {
  const stocks = await prisma.inventory_stock.findMany({ where: { location_id: 17, product_id: 152 } });
  console.log(JSON.stringify(stocks, null, 2));
}
main().finally(() => prisma.$disconnect());
