import logger from '../../configs/logger';
import prisma from '../../configs/prisma.client';

interface MockSalesTargetGroup {
  group_name: string;
  description?: string;
  is_active: string;
}

const mockSalesTargetGroups: MockSalesTargetGroup[] = [
  {
    group_name: 'North Region Sales Team',
    description: 'Sales team covering northern territories and major cities',
    is_active: 'Y',
  },
  {
    group_name: 'South Region Sales Team',
    description: 'Sales team covering southern territories and coastal areas',
    is_active: 'Y',
  },
  {
    group_name: 'East Region Sales Team',
    description: 'Sales team covering eastern territories and industrial zones',
    is_active: 'Y',
  },
  {
    group_name: 'West Region Sales Team',
    description: 'Sales team covering western territories and rural areas',
    is_active: 'Y',
  },
  {
    group_name: 'Premium Account Managers',
    description: 'Dedicated team for premium customer accounts and key clients',
    is_active: 'Y',
  },
  {
    group_name: 'Corporate Sales Division',
    description: 'Specialized team for corporate and enterprise clients',
    is_active: 'Y',
  },
  {
    group_name: 'Retail Sales Force',
    description: 'Team focused on retail outlets and small businesses',
    is_active: 'Y',
  },
  {
    group_name: 'Wholesale Distribution Team',
    description: 'Team handling wholesale and distribution channels',
    is_active: 'Y',
  },
  {
    group_name: 'New Market Expansion',
    description: 'Team focused on expanding into new markets and territories',
    is_active: 'N',
  },
  {
    group_name: 'Seasonal Sales Team',
    description: 'Temporary team for seasonal sales campaigns and promotions',
    is_active: 'Y',
  },
];

export async function seedSalesTargetGroups(): Promise<void> {
  try {
    const salesPersonRole = await prisma.roles.findFirst({
      where: { name: 'Sales Person' },
    });

    const salespersons = await prisma.users.findMany({
      select: { id: true, name: true },
      where: {
        role_id: salesPersonRole?.id,
        is_active: 'Y',
      },
    });

    if (salespersons.length === 0) {
      const adminUser = await prisma.users.findFirst({
        where: { email: 'admin@dcc.com' },
        select: { id: true, name: true },
      });
      if (adminUser) {
        salespersons.push(adminUser);
      }
    }

    const defaultSalesperson = salespersons.length > 0 ? salespersons[0] : null;

    let groupsCreated = 0;
    let groupsSkipped = 0;

    for (let i = 0; i < mockSalesTargetGroups.length; i++) {
      const group = mockSalesTargetGroups[i];
      const salesperson =
        salespersons.length > 0
          ? salespersons[i % salespersons.length]
          : defaultSalesperson;

      const existingGroup = await prisma.sales_target_groups.findFirst({
        where: { group_name: group.group_name },
      });

      if (!existingGroup) {
        await prisma.sales_target_groups.create({
          data: {
            group_name: group.group_name,
            description: group.description || null,
            is_active: group.is_active,
            createdate: new Date(),
            createdby: salesperson?.id || 1,
            log_inst: 1,
          },
        });

        groupsCreated++;
      } else {
        groupsSkipped++;
      }
    }

    logger.info(
      `Sales target groups seeding completed: ${groupsCreated} created, ${groupsSkipped} skipped`
    );
  } catch (error) {
    logger.error('Error seeding sales target groups:', error);
    throw error;
  }
}

export async function clearSalesTargetGroups(): Promise<void> {
  try {
    await prisma.sales_bonus_rules.deleteMany({});
    await prisma.sales_targets.deleteMany({});
    await prisma.sales_target_group_members.deleteMany({});
    await prisma.sales_target_groups.deleteMany({});
  } catch (error) {
    throw error;
  }
}

export { mockSalesTargetGroups };
