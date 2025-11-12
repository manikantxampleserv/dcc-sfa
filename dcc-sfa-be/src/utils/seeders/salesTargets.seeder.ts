import prisma from '../../configs/prisma.client';

interface MockSalesTarget {
  group_name: string;
  category_name: string;
  target_quantity: number;
  target_amount?: number;
  start_date: Date;
  end_date: Date;
  is_active: string;
}

const mockSalesTargets: MockSalesTarget[] = [
  {
    group_name: 'North Region Sales Team',
    category_name: 'Food & Beverages',
    target_quantity: 1000,
    target_amount: 50000.0,
    start_date: new Date('2024-01-01'),
    end_date: new Date('2024-03-31'),
    is_active: 'Y',
  },
  {
    group_name: 'North Region Sales Team',
    category_name: 'Electronics',
    target_quantity: 500,
    target_amount: 75000.0,
    start_date: new Date('2024-01-01'),
    end_date: new Date('2024-03-31'),
    is_active: 'Y',
  },
  {
    group_name: 'South Region Sales Team',
    category_name: 'Food & Beverages',
    target_quantity: 1200,
    target_amount: 60000.0,
    start_date: new Date('2024-01-01'),
    end_date: new Date('2024-03-31'),
    is_active: 'Y',
  },
  {
    group_name: 'South Region Sales Team',
    category_name: 'Clothing & Apparel',
    target_quantity: 800,
    target_amount: 40000.0,
    start_date: new Date('2024-01-01'),
    end_date: new Date('2024-03-31'),
    is_active: 'Y',
  },
  {
    group_name: 'East Region Sales Team',
    category_name: 'Electronics',
    target_quantity: 600,
    target_amount: 90000.0,
    start_date: new Date('2024-01-01'),
    end_date: new Date('2024-03-31'),
    is_active: 'Y',
  },
  {
    group_name: 'East Region Sales Team',
    category_name: 'Home & Garden',
    target_quantity: 400,
    target_amount: 30000.0,
    start_date: new Date('2024-01-01'),
    end_date: new Date('2024-03-31'),
    is_active: 'Y',
  },
  {
    group_name: 'West Region Sales Team',
    category_name: 'Food & Beverages',
    target_quantity: 900,
    target_amount: 45000.0,
    start_date: new Date('2024-01-01'),
    end_date: new Date('2024-03-31'),
    is_active: 'Y',
  },
  {
    group_name: 'West Region Sales Team',
    category_name: 'Clothing & Apparel',
    target_quantity: 600,
    target_amount: 30000.0,
    start_date: new Date('2024-01-01'),
    end_date: new Date('2024-03-31'),
    is_active: 'Y',
  },
  {
    group_name: 'Premium Account Managers',
    category_name: 'Electronics',
    target_quantity: 200,
    target_amount: 100000.0,
    start_date: new Date('2024-01-01'),
    end_date: new Date('2024-03-31'),
    is_active: 'Y',
  },
  {
    group_name: 'Premium Account Managers',
    category_name: 'Home & Garden',
    target_quantity: 150,
    target_amount: 75000.0,
    start_date: new Date('2024-01-01'),
    end_date: new Date('2024-03-31'),
    is_active: 'Y',
  },
  {
    group_name: 'North Region Sales Team',
    category_name: 'Food & Beverages',
    target_quantity: 1100,
    target_amount: 55000.0,
    start_date: new Date('2024-04-01'),
    end_date: new Date('2024-06-30'),
    is_active: 'Y',
  },
  {
    group_name: 'North Region Sales Team',
    category_name: 'Electronics',
    target_quantity: 550,
    target_amount: 82500.0,
    start_date: new Date('2024-04-01'),
    end_date: new Date('2024-06-30'),
    is_active: 'Y',
  },
  {
    group_name: 'South Region Sales Team',
    category_name: 'Food & Beverages',
    target_quantity: 1300,
    target_amount: 65000.0,
    start_date: new Date('2024-04-01'),
    end_date: new Date('2024-06-30'),
    is_active: 'Y',
  },
  {
    group_name: 'South Region Sales Team',
    category_name: 'Clothing & Apparel',
    target_quantity: 900,
    target_amount: 45000.0,
    start_date: new Date('2024-04-01'),
    end_date: new Date('2024-06-30'),
    is_active: 'Y',
  },
  {
    group_name: 'Corporate Sales Division',
    category_name: 'Electronics',
    target_quantity: 300,
    target_amount: 150000.0,
    start_date: new Date('2024-04-01'),
    end_date: new Date('2024-06-30'),
    is_active: 'Y',
  },
  {
    group_name: 'Corporate Sales Division',
    category_name: 'Home & Garden',
    target_quantity: 200,
    target_amount: 100000.0,
    start_date: new Date('2024-04-01'),
    end_date: new Date('2024-06-30'),
    is_active: 'Y',
  },
  {
    group_name: 'Retail Sales Force',
    category_name: 'Food & Beverages',
    target_quantity: 1500,
    target_amount: 75000.0,
    start_date: new Date('2024-04-01'),
    end_date: new Date('2024-06-30'),
    is_active: 'Y',
  },
  {
    group_name: 'Retail Sales Force',
    category_name: 'Clothing & Apparel',
    target_quantity: 1000,
    target_amount: 50000.0,
    start_date: new Date('2024-04-01'),
    end_date: new Date('2024-06-30'),
    is_active: 'Y',
  },
  {
    group_name: 'Wholesale Distribution Team',
    category_name: 'Food & Beverages',
    target_quantity: 2000,
    target_amount: 100000.0,
    start_date: new Date('2024-04-01'),
    end_date: new Date('2024-06-30'),
    is_active: 'Y',
  },
  {
    group_name: 'Wholesale Distribution Team',
    category_name: 'Electronics',
    target_quantity: 800,
    target_amount: 120000.0,
    start_date: new Date('2024-04-01'),
    end_date: new Date('2024-06-30'),
    is_active: 'Y',
  },
  {
    group_name: 'North Region Sales Team',
    category_name: 'Food & Beverages',
    target_quantity: 1200,
    target_amount: 60000.0,
    start_date: new Date('2024-07-01'),
    end_date: new Date('2024-09-30'),
    is_active: 'Y',
  },
  {
    group_name: 'South Region Sales Team',
    category_name: 'Electronics',
    target_quantity: 700,
    target_amount: 105000.0,
    start_date: new Date('2024-07-01'),
    end_date: new Date('2024-09-30'),
    is_active: 'Y',
  },
  {
    group_name: 'East Region Sales Team',
    category_name: 'Food & Beverages',
    target_quantity: 1100,
    target_amount: 55000.0,
    start_date: new Date('2024-07-01'),
    end_date: new Date('2024-09-30'),
    is_active: 'Y',
  },
  {
    group_name: 'West Region Sales Team',
    category_name: 'Electronics',
    target_quantity: 500,
    target_amount: 75000.0,
    start_date: new Date('2024-07-01'),
    end_date: new Date('2024-09-30'),
    is_active: 'Y',
  },
  {
    group_name: 'Premium Account Managers',
    category_name: 'Home & Garden',
    target_quantity: 180,
    target_amount: 90000.0,
    start_date: new Date('2024-07-01'),
    end_date: new Date('2024-09-30'),
    is_active: 'Y',
  },
  {
    group_name: 'North Region Sales Team',
    category_name: 'Food & Beverages',
    target_quantity: 1300,
    target_amount: 65000.0,
    start_date: new Date('2024-10-01'),
    end_date: new Date('2024-12-31'),
    is_active: 'Y',
  },
  {
    group_name: 'South Region Sales Team',
    category_name: 'Clothing & Apparel',
    target_quantity: 1000,
    target_amount: 50000.0,
    start_date: new Date('2024-10-01'),
    end_date: new Date('2024-12-31'),
    is_active: 'Y',
  },
  {
    group_name: 'East Region Sales Team',
    category_name: 'Electronics',
    target_quantity: 650,
    target_amount: 97500.0,
    start_date: new Date('2024-10-01'),
    end_date: new Date('2024-12-31'),
    is_active: 'Y',
  },
  {
    group_name: 'West Region Sales Team',
    category_name: 'Home & Garden',
    target_quantity: 450,
    target_amount: 33750.0,
    start_date: new Date('2024-10-01'),
    end_date: new Date('2024-12-31'),
    is_active: 'Y',
  },
  {
    group_name: 'Corporate Sales Division',
    category_name: 'Electronics',
    target_quantity: 350,
    target_amount: 175000.0,
    start_date: new Date('2024-10-01'),
    end_date: new Date('2024-12-31'),
    is_active: 'Y',
  },
  {
    group_name: 'New Market Expansion',
    category_name: 'Food & Beverages',
    target_quantity: 500,
    target_amount: 25000.0,
    start_date: new Date('2023-01-01'),
    end_date: new Date('2023-12-31'),
    is_active: 'N',
  },
  {
    group_name: 'Seasonal Sales Team',
    category_name: 'Clothing & Apparel',
    target_quantity: 300,
    target_amount: 15000.0,
    start_date: new Date('2023-11-01'),
    end_date: new Date('2023-12-31'),
    is_active: 'N',
  },
];

export async function seedSalesTargets(): Promise<void> {
  const salesTargetGroups = await prisma.sales_target_groups.findMany({
    select: { id: true, group_name: true },
  });

  const productCategories = await prisma.product_categories.findMany({
    select: { id: true, category_name: true },
  });

  for (const target of mockSalesTargets) {
    const group = salesTargetGroups.find(
      g => g.group_name === target.group_name
    );
    const category = productCategories.find(
      c => c.category_name === target.category_name
    );

    if (group && category) {
      const existingTarget = await prisma.sales_targets.findFirst({
        where: {
          sales_target_group_id: group.id,
          product_category_id: category.id,
          start_date: target.start_date,
          end_date: target.end_date,
        },
      });

      if (!existingTarget) {
        await prisma.sales_targets.create({
          data: {
            sales_target_group_id: group.id,
            product_category_id: category.id,
            target_quantity: target.target_quantity,
            target_amount: target.target_amount || null,
            start_date: target.start_date,
            end_date: target.end_date,
            is_active: target.is_active,
            createdate: new Date(),
            createdby: 1,
            log_inst: 1,
          },
        });
      }
    }
  }
}

export async function clearSalesTargets(): Promise<void> {
  await prisma.sales_bonus_rules.deleteMany({});
  await prisma.sales_targets.deleteMany({});
}

export { mockSalesTargets };
