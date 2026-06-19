import prisma from './configs/prisma.client';

async function main() {
  console.log('=== Resetting Stock for User 51 ===');
  const updateResult = await prisma.inventory_stock.updateMany({
    where: {
      salesperson_id: 51,
      product_id: 152 // Coke RGB 350ml
    },
    data: {
      current_stock: 10,
      available_stock: 10,
      base_quantity: 0
    }
  });
  console.log(`Reset ${updateResult.count} records for User 51.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
