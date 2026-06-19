import prisma from './configs/prisma.client';

async function main() {
  console.log('=== Checking All Depots ===');
  const depots = await prisma.depots.findMany();
  console.log(depots.map(d => ({ id: d.id, name: d.name })));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
