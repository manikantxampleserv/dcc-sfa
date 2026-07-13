const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const p = await prisma.products.findFirst({
    where: { name: { contains: 'Novida' } },
    include: { product_unit_of_measurement: true }
  });
  console.log('Product:', p?.name, 'Conversion Rate:', p?.product_unit_of_measurement?.conversion_rate);
}

main().finally(() => prisma.$disconnect());
