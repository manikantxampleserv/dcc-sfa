import prisma from '../configs/prisma.client';

async function main() {
  const assetMovementReturnReasons = [
    "Repairs",
    "Outlet Closed",
    "Cooler Abuse",
    "Less Volume",
    "Exchange"
  ];

  try {
    const upserted = await prisma.system_enums.upsert({
      where: {
        key: 'asset_movement_return_reason'
      },
      update: {
        name: 'Asset Movement Return Reasons',
        values: JSON.stringify(assetMovementReturnReasons),
        updatedate: new Date(),
        updatedby: 1
      },
      create: {
        key: 'asset_movement_return_reason',
        name: 'Asset Movement Return Reasons',
        values: JSON.stringify(assetMovementReturnReasons),
        createdate: new Date(),
        createdby: 1
      }
    });

    console.log('Successfully seeded system_enums for:', upserted.key);
  } catch (error) {
    console.error('Error seeding system_enums:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
