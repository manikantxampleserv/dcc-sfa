import prisma from './src/configs/prisma.client';

async function main() {
  const batches = await prisma.batch_lots.findMany({
    where: {
      batch_number: { in: ['CK-001', 'CK-002'] },
      productsId: 152
    }
  });

  console.log(JSON.stringify(batches, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
