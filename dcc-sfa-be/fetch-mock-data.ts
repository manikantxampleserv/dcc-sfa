import 'dotenv/config';
import prisma from './src/configs/prisma.client';
async function main() {
  const salesman = await prisma.users.findFirst({
    where: { sap_code: { not: null, notIn: [''] } },
  });
  const depot = await prisma.depots.findFirst({
    where: { sap_code: { not: null, notIn: [''] } },
  });
  const vehicle = await prisma.vehicles.findFirst({
    where: { sap_code: { not: null, notIn: [''] } },
  });
  const batchProduct = await prisma.products.findFirst({
    where: { tracking_type: 'BATCH', sap_code: { not: null, notIn: [''] } },
  });
  const products = await prisma.products.findMany({
    select: { tracking_type: true },
    distinct: ['tracking_type'],
  });
  const noneProduct = await prisma.products.findFirst({
    where: { 
      OR: [
        { tracking_type: 'NONE' },
        { tracking_type: null }
      ],
      sap_code: { not: null, notIn: [''] } 
    }
  });
  console.log('--- DATA ---');
  console.log('Salesman:', salesman?.sap_code);
  console.log('Depot:', depot?.sap_code);
  console.log('Vehicle:', vehicle?.sap_code);
  console.log('Batch Product:', batchProduct?.sap_code);
  console.log('None Product:', noneProduct?.sap_code);
  console.log(
    'Tracking types:',
    products.map((p: any) => p.tracking_type).join(', ')
  );
  console.log('------------');
}
main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
