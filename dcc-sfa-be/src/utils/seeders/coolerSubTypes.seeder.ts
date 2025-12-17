import prisma from '../../configs/prisma.client';

interface MockCoolerSubType {
  name: string;
  code: string;
  cooler_type_name: string;
  is_active: string;
}

const mockCoolerSubTypes: MockCoolerSubType[] = [
  {
    name: 'COOLER',
    code: 'CST-COOL',
    cooler_type_name: 'COOLER',
    is_active: 'Y',
  },
  {
    name: 'FV-280',
    code: 'CST-FV280',
    cooler_type_name: 'COOLER',
    is_active: 'Y',
  },
  {
    name: 'CVC-160',
    code: 'CST-CVC160',
    cooler_type_name: 'COOLER',
    is_active: 'Y',
  },
  {
    name: 'CCC-0309',
    code: 'CST-CCC0309',
    cooler_type_name: 'COOLER',
    is_active: 'Y',
  },
  {
    name: 'CCC-300',
    code: 'CST-CCC300',
    cooler_type_name: 'COOLER',
    is_active: 'Y',
  },
  {
    name: 'CDM-650',
    code: 'CST-CDM650',
    cooler_type_name: 'COOLER',
    is_active: 'Y',
  },
  {
    name: 'CDM-1000',
    code: 'CST-CDM1000',
    cooler_type_name: 'COOLER',
    is_active: 'Y',
  },
  {
    name: 'CVC-0409',
    code: 'CST-CVC0409',
    cooler_type_name: 'COOLER',
    is_active: 'Y',
  },
  {
    name: 'CPE0255',
    code: 'CST-CPE0255',
    cooler_type_name: 'COOLER',
    is_active: 'Y',
  },
  {
    name: 'CPE0405',
    code: 'CST-CPE0405',
    cooler_type_name: 'COOLER',
    is_active: 'Y',
  },
  {
    name: 'CPE0403S',
    code: 'CST-CPE0403S',
    cooler_type_name: 'COOLER',
    is_active: 'Y',
  },
  {
    name: 'CPE0253S',
    code: 'CST-CPE0253S',
    cooler_type_name: 'COOLER',
    is_active: 'Y',
  },
  {
    name: 'CCC-400',
    code: 'CST-CCC400',
    cooler_type_name: 'COOLER',
    is_active: 'Y',
  },
  {
    name: 'CPE-0250',
    code: 'CST-CPE0250',
    cooler_type_name: 'COOLER',
    is_active: 'Y',
  },
  {
    name: 'CPE-0253',
    code: 'CST-CPE0253',
    cooler_type_name: 'COOLER',
    is_active: 'Y',
  },
  {
    name: 'CVC-400',
    code: 'CST-CVC400',
    cooler_type_name: 'COOLER',
    is_active: 'Y',
  },
  {
    name: 'Water Dispenser',
    code: 'CST-WD',
    cooler_type_name: 'WATER DISPENSER',
    is_active: 'Y',
  },
  {
    name: 'CVC-250',
    code: 'CST-CVC250',
    cooler_type_name: 'COOLER',
    is_active: 'Y',
  },
  {
    name: 'FV-400',
    code: 'CST-FV400',
    cooler_type_name: 'COOLER',
    is_active: 'Y',
  },
  {
    name: 'FV-100',
    code: 'CST-FV100',
    cooler_type_name: 'COOLER',
    is_active: 'Y',
  },
  {
    name: 'CPE-0400',
    code: 'CST-CPE0400',
    cooler_type_name: 'COOLER',
    is_active: 'Y',
  },
  {
    name: 'CCC-0409',
    code: 'CST-CCC0409',
    cooler_type_name: 'COOLER',
    is_active: 'Y',
  },
  {
    name: 'SVC-150',
    code: 'CST-SVC150',
    cooler_type_name: 'COOLER',
    is_active: 'Y',
  },
  {
    name: 'CPE0300',
    code: 'CST-CPE0300',
    cooler_type_name: 'COOLER',
    is_active: 'Y',
  },
  {
    name: 'CPE1005',
    code: 'CST-CPE1005',
    cooler_type_name: 'COOLER',
    is_active: 'Y',
  },
  {
    name: 'PIGMY',
    code: 'CST-PIGMY',
    cooler_type_name: 'COOLER',
    is_active: 'Y',
  },
  {
    name: 'SANYO',
    code: 'CST-SANYO',
    cooler_type_name: 'COOLER',
    is_active: 'Y',
  },
];

export async function seedCoolerSubTypes(): Promise<void> {
  try {
    for (const coolerSubType of mockCoolerSubTypes) {
      const coolerType = await prisma.cooler_types.findFirst({
        where: { name: coolerSubType.cooler_type_name },
      });

      if (!coolerType) {
        console.warn(
          `Cooler type "${coolerSubType.cooler_type_name}" not found. Skipping cooler sub type "${coolerSubType.name}"`
        );
        continue;
      }

      const existingCoolerSubType = await prisma.cooler_sub_types.findFirst({
        where: { name: coolerSubType.name },
      });

      if (!existingCoolerSubType) {
        await prisma.cooler_sub_types.create({
          data: {
            name: coolerSubType.name,
            code: coolerSubType.code,
            cooler_type_id: coolerType.id,
            is_active: coolerSubType.is_active,
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

export async function clearCoolerSubTypes(): Promise<void> {
  try {
    await prisma.cooler_sub_types.deleteMany({});
  } catch (error) {
    throw error;
  }
}

export { mockCoolerSubTypes };
