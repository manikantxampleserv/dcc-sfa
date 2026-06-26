import prisma from '../configs/prisma.client';

async function main() {
  const items = await prisma.reconciliation_items.deleteMany({});
  console.log('Deleted reconciliation_items:', items.count);

  const recs = await prisma.reconciliation.deleteMany({});
  console.log('Deleted reconciliations:', recs.count);

  console.log('Done!');
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
