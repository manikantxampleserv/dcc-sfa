import prisma from '../../configs/prisma.client';

interface MockProductShelfLife {
  name: string;
  code: string;
  is_active: string;
}

const mockProductShelfLife: MockProductShelfLife[] = [
  { name: '112 Days', code: 'SHELF-112D-001', is_active: 'Y' },
  { name: '180 Days', code: 'SHELF-180D-001', is_active: 'Y' },
  { name: '365 Days', code: 'SHELF-365D-001', is_active: 'Y' },
  { name: '84 Days', code: 'SHELF-84D-001', is_active: 'Y' },
  { name: '90 Days', code: 'SHELF-90D-001', is_active: 'Y' },
];

export async function seedProductShelfLife(): Promise<void> {
  try {
    for (const shelfLife of mockProductShelfLife) {
      const existingShelfLife = await prisma.product_shelf_life.findFirst({
        where: { name: shelfLife.name },
      });

      if (!existingShelfLife) {
        await prisma.product_shelf_life.create({
          data: {
            name: shelfLife.name,
            code: shelfLife.code,
            is_active: shelfLife.is_active,
            createdate: new Date(),
            createdby: 1,
            log_inst: 1,
          },
        });
      }
    }
  } catch (error) {
    throw error;
  }
}

export async function clearProductShelfLife(): Promise<void> {
  try {
    await prisma.product_shelf_life.deleteMany({});
  } catch (error) {
    throw error;
  }
}

export { mockProductShelfLife };
