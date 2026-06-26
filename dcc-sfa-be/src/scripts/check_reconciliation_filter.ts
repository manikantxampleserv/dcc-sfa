import prisma from '../configs/prisma.client';

async function main() {
  const q1 = await prisma.reconciliation.findMany({
    where: { is_active: 'Y' }
  });
  console.log("No date filter count:", q1.length);
  
  const d = new Date('2026-06-26');
  console.log("Date object:", d);
  const q2 = await prisma.reconciliation.findMany({
    where: { is_active: 'Y', reconciliation_date: d }
  });
  console.log("With date filter count:", q2.length);

  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
