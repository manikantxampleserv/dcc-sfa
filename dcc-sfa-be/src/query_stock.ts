import prisma from './configs/prisma.client';

async function main() {
  console.log('=== Checking Inventory Stock for Product 218 ===');
  const stocks = await prisma.inventory_stock.findMany({
    where: { product_id: 218 },
    include: {
      inventory_stock_products: { select: { name: true } },
      inventory_stock_batch: { select: { batch_number: true } },
      inventory_stock_users: { select: { name: true, id: true } },
    },
  });

  console.table(
    stocks.map(s => ({
      id: s.id,
      user_id: s.salesperson_id,
      user_name: s.inventory_stock_users?.name,
      product: s.inventory_stock_products?.name,
      batch: s.inventory_stock_batch?.batch_number,
      current: s.current_stock,
      available: s.available_stock,
      base_quantity: s.base_quantity,
    }))
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
