import prisma from '../src/configs/prisma.client';
async function run() {
  const user = await prisma.users.findFirst({ where: { sap_code: { not: null, notIn: [''] } } });
  console.log('User SAP:', user?.sap_code);
  await prisma.$disconnect();
}
run().catch(console.error);
