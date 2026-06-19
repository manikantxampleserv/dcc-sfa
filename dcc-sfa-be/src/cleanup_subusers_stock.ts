import prisma from './configs/prisma.client';

async function main() {
  console.log('=== Cleaning up redundant inventory_stock records for users 29 and 33 ===');
  const deleteResult = await prisma.inventory_stock.deleteMany({
    where: {
      salesperson_id: {
        in: [29, 33],
      },
    },
  });
  console.log(`Deleted ${deleteResult.count} inventory_stock records.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
