import prisma from './src/configs/prisma.client';
async function main() {
  const v = await prisma.van_inventory.findFirst({ orderBy: { id: 'desc' } });
  if (v) {
    const items = await prisma.van_inventory_items.findMany({ where: { parent_id: v.id } });
    const m = await prisma.stock_movements.findMany({ orderBy: { id: 'desc' }, take: 10 });
    console.log('Last Van:', v.id);
    console.log('Items:', JSON.stringify(items, null, 2));
    console.log('Movements:', JSON.stringify(m, null, 2));
  }
}
main().finally(() => prisma.$disconnect());
