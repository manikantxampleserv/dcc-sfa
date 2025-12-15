import prisma from '../../configs/prisma.client';

interface MockProductType {
  name: string;
  code: string;
  is_active: string;
}

const mockProductTypes: MockProductType[] = [
  { name: 'Commercial Product', code: 'PROD-COMM', is_active: 'Y' },
  { name: 'Deposit Product', code: 'PROD-DEP', is_active: 'Y' },
  { name: 'Promotional Product', code: 'PROD-PROMO', is_active: 'Y' },
  { name: 'Rival Product', code: 'PROD-RIVAL', is_active: 'Y' },
  { name: 'Service Product', code: 'PROD-SERV', is_active: 'Y' },
];

export async function seedProductTypes(): Promise<void> {
  try {
    for (const productType of mockProductTypes) {
      const existingProductType = await prisma.product_type.findFirst({
        where: { name: productType.name },
      });

      if (!existingProductType) {
        await prisma.product_type.create({
          data: {
            name: productType.name,
            code: productType.code,
            is_active: productType.is_active,
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

export async function clearProductTypes(): Promise<void> {
  try {
    await prisma.product_type.deleteMany({});
  } catch (error) {
    throw error;
  }
}

export { mockProductTypes };
