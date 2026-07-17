import prisma from './src/configs/prisma.client';

async function main() {
  const query = process.argv[2];
  if (!query) {
    console.error('Please provide a query string');
    process.exit(1);
  }

  try {
    const result = await prisma.$queryRawUnsafe(query);
    console.log(JSON.stringify(result, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
