import prisma from '../../configs/prisma.client';

interface MockProductVolume {
  name: string;
  code: string;
  is_active: string;
}

const mockProductVolumes: MockProductVolume[] = [
  { name: '350ML', code: 'VOL-350ML-001', is_active: 'Y' },
  { name: '300ML', code: 'VOL-300ML-001', is_active: 'Y' },
  { name: '250ML', code: 'VOL-250ML-001', is_active: 'Y' },
  { name: '0.5LTR', code: 'VOL-05L-001', is_active: 'Y' },
  { name: '1.5LTR', code: 'VOL-15L-001', is_active: 'Y' },
  { name: '6 Ltr', code: 'VOL-6L-001', is_active: 'Y' },
  { name: '12 Ltr', code: 'VOL-12L-001', is_active: 'Y' },
  { name: '18.9 Ltr', code: 'VOL-189L-001', is_active: 'Y' },
  { name: '1.0LTR', code: 'VOL-1L-001', is_active: 'Y' },
  { name: '500ML', code: 'VOL-500ML-001', is_active: 'Y' },
  { name: '1250ML', code: 'VOL-1250ML-001', is_active: 'Y' },
];

export async function seedProductVolumes(): Promise<void> {
  try {
    for (const volume of mockProductVolumes) {
      const existingVolume = await prisma.product_volumes.findFirst({
        where: { name: volume.name },
      });

      if (!existingVolume) {
        await prisma.product_volumes.create({
          data: {
            name: volume.name,
            code: volume.code,
            is_active: volume.is_active,
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

export async function clearProductVolumes(): Promise<void> {
  try {
    await prisma.product_volumes.deleteMany({});
  } catch (error: any) {
    if (
      error?.code === 'P2003' ||
      error?.message?.includes('Foreign key constraint')
    ) {
      console.warn(
        '⚠️  Could not clear all product volumes due to foreign key constraints. Some records may be in use by products.'
      );
    } else {
      throw error;
    }
  }
}

export { mockProductVolumes };
