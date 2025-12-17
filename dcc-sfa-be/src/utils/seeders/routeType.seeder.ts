import prisma from '../../configs/prisma.client';

interface MockRouteType {
  name: string;
  is_active: string;
}

const mockRouteTypes: MockRouteType[] = [
  {
    name: 'PRIMARY',
    is_active: 'Y',
  },
  {
    name: 'SECONDARY',
    is_active: 'Y',
  },
  {
    name: 'TERTIARY',
    is_active: 'Y',
  },
  {
    name: 'URBAN',
    is_active: 'Y',
  },
  {
    name: 'RURAL',
    is_active: 'Y',
  },
  {
    name: 'EXPRESS',
    is_active: 'Y',
  },
  {
    name: 'LOCAL',
    is_active: 'Y',
  },
  {
    name: 'REGIONAL',
    is_active: 'Y',
  },
  {
    name: 'DISTRIBUTION',
    is_active: 'Y',
  },
  {
    name: 'COLLECTION',
    is_active: 'Y',
  },
];

export async function seedRouteType(): Promise<void> {
  try {
    for (const routeType of mockRouteTypes) {
      const existingRouteType = await prisma.route_type.findFirst({
        where: { name: routeType.name },
      });

      if (!existingRouteType) {
        await prisma.route_type.create({
          data: {
            name: routeType.name,
            is_active: routeType.is_active,
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

export async function clearRouteType(): Promise<void> {
  try {
    await prisma.route_type.deleteMany({});
  } catch (error: any) {
    if (
      error?.code === 'P2003' ||
      error?.message?.includes('Foreign key constraint')
    ) {
      console.warn(
        '⚠️  Could not clear all route types due to foreign key constraints. Some records may be in use by routes or products.'
      );
    } else {
      throw error;
    }
  }
}

export { mockRouteTypes };
