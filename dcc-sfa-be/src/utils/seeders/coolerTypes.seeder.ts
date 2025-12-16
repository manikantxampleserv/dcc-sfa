import prisma from '../../configs/prisma.client';

interface MockCoolerType {
  name: string;
  code: string;
  is_active: string;
}

const mockCoolerTypes: MockCoolerType[] = [
  {
    name: 'COOLER',
    code: 'CT-COOL',
    is_active: 'Y',
  },
  {
    name: 'WATER DISPENSER',
    code: 'CT-WD',
    is_active: 'Y',
  },
];

export async function seedCoolerTypes(): Promise<void> {
  try {
    for (const coolerType of mockCoolerTypes) {
      const existingCoolerType = await prisma.cooler_types.findFirst({
        where: { name: coolerType.name },
      });

      if (!existingCoolerType) {
        await prisma.cooler_types.create({
          data: {
            name: coolerType.name,
            code: coolerType.code,
            is_active: coolerType.is_active,
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

export async function clearCoolerTypes(): Promise<void> {
  try {
    await prisma.cooler_types.deleteMany({});
  } catch (error) {
    throw error;
  }
}

export { mockCoolerTypes };
