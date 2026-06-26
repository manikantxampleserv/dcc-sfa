import prisma from '../configs/prisma.client';

async function main() {
  const r = await prisma.reconciliation.findMany({});
  console.log(JSON.stringify(r, null, 2));
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
