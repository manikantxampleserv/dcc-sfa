import prisma from './src/configs/prisma.client';
async function run() { 
  const p = await prisma.products.findUnique({ 
    where: { id: 152 }, 
    select: { id: true, code: true, product_unit_of_measurement: true } 
  }); 
  console.log(JSON.stringify(p, null, 2)); 
  await prisma.$disconnect(); 
} 
run();
