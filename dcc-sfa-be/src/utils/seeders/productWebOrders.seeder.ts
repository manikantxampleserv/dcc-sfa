import prisma from '../../configs/prisma.client';

interface MockProductWebOrder {
  name: string;
  code: string;
  is_active: string;
}

const mockProductWebOrders: MockProductWebOrder[] = [
  { name: 'RGB', code: 'WO-RGB', is_active: 'Y' },
  { name: 'PET', code: 'WO-PET', is_active: 'Y' },
  { name: 'KDW', code: 'WO-KDW', is_active: 'Y' },
  { name: 'JUICE', code: 'WO-JUICE', is_active: 'Y' },
];

export async function seedProductWebOrders(): Promise<void> {
  try {
    for (const webOrder of mockProductWebOrders) {
      const existingWebOrder = await prisma.product_web_order.findFirst({
        where: { name: webOrder.name },
      });

      if (!existingWebOrder) {
        await prisma.product_web_order.create({
          data: {
            name: webOrder.name,
            code: webOrder.code,
            is_active: webOrder.is_active,
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

export async function clearProductWebOrders(): Promise<void> {
  try {
    await prisma.product_web_order.deleteMany({});
  } catch (error) {
    throw error;
  }
}

export { mockProductWebOrders };
