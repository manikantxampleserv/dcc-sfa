import prisma from '../../configs/prisma.client';

interface MockProductTargetGroup {
  name: string;
  code: string;
  is_active: string;
}

const mockProductTargetGroups: MockProductTargetGroup[] = [
  { name: 'BULK WATER 18.9L', code: 'TG-BW-189', is_active: 'Y' },
  { name: 'BULK WATER 12 L', code: 'TG-BW-12', is_active: 'Y' },
  { name: 'BULK WATER 6 LTR', code: 'TG-BW-6', is_active: 'Y' },
  { name: 'JUICE 1 Ltr', code: 'TG-JUICE-1L', is_active: 'Y' },
  { name: 'JUICE 1250ML', code: 'TG-JUICE-1250', is_active: 'Y' },
  { name: 'JUICE 400ML', code: 'TG-JUICE-400', is_active: 'Y' },
  { name: 'KDW 1.0L', code: 'TG-KDW-1L', is_active: 'Y' },
  { name: 'KDW 1.5L', code: 'TG-KDW-15L', is_active: 'Y' },
  { name: 'KDW 500ML', code: 'TG-KDW-500', is_active: 'Y' },
  { name: 'PET 1.25L', code: 'TG-PET-125', is_active: 'Y' },
  { name: 'PET 300ML', code: 'TG-PET-300', is_active: 'Y' },
  { name: 'PET 500ML', code: 'TG-PET-500', is_active: 'Y' },
  { name: 'RGB', code: 'TG-RGB', is_active: 'Y' },
];

export async function seedProductTargetGroups(): Promise<void> {
  try {
    for (const targetGroup of mockProductTargetGroups) {
      const existingTargetGroup = await prisma.product_target_group.findFirst({
        where: { name: targetGroup.name },
      });

      if (!existingTargetGroup) {
        await prisma.product_target_group.create({
          data: {
            name: targetGroup.name,
            code: targetGroup.code,
            is_active: targetGroup.is_active,
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

export async function clearProductTargetGroups(): Promise<void> {
  try {
    await prisma.product_target_group.deleteMany({});
  } catch (error: any) {
    if (
      error?.code === 'P2003' ||
      error?.message?.includes('Foreign key constraint')
    ) {
      console.warn(
        '⚠️  Could not clear all product target groups due to foreign key constraints. Some records may be in use by products.'
      );
    } else {
      throw error;
    }
  }
}

export { mockProductTargetGroups };
