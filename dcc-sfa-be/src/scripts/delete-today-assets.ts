import prisma from '../configs/prisma.client';

async function main() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  console.log(
    `Searching for assets created between ${today.toISOString()} and ${tomorrow.toISOString()}`
  );

  const assetsToDelete = await prisma.asset_master.findMany({
    where: {
      createdate: {
        gte: today,
        lt: tomorrow,
      },
    },
    select: {
      id: true,
      name: true,
      serial_number: true,
    },
  });

  console.log(`Found ${assetsToDelete.length} assets to delete.`);

  if (assetsToDelete.length > 0) {
    const deleteResult = await prisma.asset_master.deleteMany({
      where: {
        createdate: {
          gte: today,
          lt: tomorrow,
        },
      },
    });
    console.log(`Successfully deleted ${deleteResult.count} assets.`);
  } else {
    console.log('No assets found to delete.');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
