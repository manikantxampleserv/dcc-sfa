/**
 * @fileoverview KPI Targets Seeder
 * @description Creates sample KPI targets for employees across different roles
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import logger from '../../configs/logger';
import prisma from '../../configs/prisma.client';

interface MockKPITarget {
  employee_id: number;
  kpi_name: string;
  target_value: number;
  measure_unit?: string;
  period_start: Date;
  period_end: Date;
  is_active: string;
}

const mockKPITargets: MockKPITarget[] = [
  // Sales KPIs
  {
    employee_id: 1, // Admin user
    kpi_name: 'Monthly Sales Target',
    target_value: 100000,
    measure_unit: 'INR',
    period_start: new Date('2024-01-01'),
    period_end: new Date('2024-12-31'),
    is_active: 'Y',
  },
  {
    employee_id: 1,
    kpi_name: 'Customer Acquisition',
    target_value: 50,
    measure_unit: 'Customers',
    period_start: new Date('2024-01-01'),
    period_end: new Date('2024-12-31'),
    is_active: 'Y',
  },
  {
    employee_id: 1,
    kpi_name: 'Customer Retention Rate',
    target_value: 85,
    measure_unit: 'Percentage',
    period_start: new Date('2024-01-01'),
    period_end: new Date('2024-12-31'),
    is_active: 'Y',
  },
  {
    employee_id: 1,
    kpi_name: 'Average Order Value',
    target_value: 5000,
    measure_unit: 'INR',
    period_start: new Date('2024-01-01'),
    period_end: new Date('2024-12-31'),
    is_active: 'Y',
  },
  {
    employee_id: 1,
    kpi_name: 'Sales Conversion Rate',
    target_value: 25,
    measure_unit: 'Percentage',
    period_start: new Date('2024-01-01'),
    period_end: new Date('2024-12-31'),
    is_active: 'Y',
  },
  // Operational KPIs
  {
    employee_id: 1,
    kpi_name: 'Delivery Time',
    target_value: 24,
    measure_unit: 'Hours',
    period_start: new Date('2024-01-01'),
    period_end: new Date('2024-12-31'),
    is_active: 'Y',
  },
  {
    employee_id: 1,
    kpi_name: 'Order Accuracy Rate',
    target_value: 98,
    measure_unit: 'Percentage',
    period_start: new Date('2024-01-01'),
    period_end: new Date('2024-12-31'),
    is_active: 'Y',
  },
  {
    employee_id: 1,
    kpi_name: 'Customer Complaints',
    target_value: 5,
    measure_unit: 'Count',
    period_start: new Date('2024-01-01'),
    period_end: new Date('2024-12-31'),
    is_active: 'Y',
  },
  // Financial KPIs
  {
    employee_id: 1,
    kpi_name: 'Revenue Growth',
    target_value: 15,
    measure_unit: 'Percentage',
    period_start: new Date('2024-01-01'),
    period_end: new Date('2024-12-31'),
    is_active: 'Y',
  },
  {
    employee_id: 1,
    kpi_name: 'Profit Margin',
    target_value: 20,
    measure_unit: 'Percentage',
    period_start: new Date('2024-01-01'),
    period_end: new Date('2024-12-31'),
    is_active: 'Y',
  },
  // Customer Service KPIs
  {
    employee_id: 1,
    kpi_name: 'Customer Satisfaction Score',
    target_value: 4.5,
    measure_unit: 'Rating (1-5)',
    period_start: new Date('2024-01-01'),
    period_end: new Date('2024-12-31'),
    is_active: 'Y',
  },
  {
    employee_id: 1,
    kpi_name: 'Response Time',
    target_value: 2,
    measure_unit: 'Hours',
    period_start: new Date('2024-01-01'),
    period_end: new Date('2024-12-31'),
    is_active: 'Y',
  },
  // Marketing KPIs
  {
    employee_id: 1,
    kpi_name: 'Lead Generation',
    target_value: 100,
    measure_unit: 'Leads',
    period_start: new Date('2024-01-01'),
    period_end: new Date('2024-12-31'),
    is_active: 'Y',
  },
  {
    employee_id: 1,
    kpi_name: 'Brand Awareness',
    target_value: 70,
    measure_unit: 'Percentage',
    period_start: new Date('2024-01-01'),
    period_end: new Date('2024-12-31'),
    is_active: 'Y',
  },
  // Quality KPIs
  {
    employee_id: 1,
    kpi_name: 'Product Quality Score',
    target_value: 95,
    measure_unit: 'Percentage',
    period_start: new Date('2024-01-01'),
    period_end: new Date('2024-12-31'),
    is_active: 'Y',
  },
  {
    employee_id: 1,
    kpi_name: 'Defect Rate',
    target_value: 2,
    measure_unit: 'Percentage',
    period_start: new Date('2024-01-01'),
    period_end: new Date('2024-12-31'),
    is_active: 'Y',
  },
  // Inactive KPI
  {
    employee_id: 1,
    kpi_name: 'Legacy KPI Target',
    target_value: 1000,
    measure_unit: 'Units',
    period_start: new Date('2023-01-01'),
    period_end: new Date('2023-12-31'),
    is_active: 'N',
  },
];

/**
 * Seed KPI Targets with mock data
 */
export async function seedKPITargets(): Promise<void> {
  try {
    // Get available users for employee_id
    const users = await prisma.users.findMany({
      select: { id: true, name: true },
      where: { is_active: 'Y' },
    });

    if (users.length === 0) {
      logger.warn('No active users found. Skipping KPI targets seeding.');
      return;
    }

    let targetsCreated = 0;
    let targetsSkipped = 0;

    for (const target of mockKPITargets) {
      // Check if user exists, if not use first available user
      const user = users.find(u => u.id === target.employee_id) || users[0];

      const existingTarget = await prisma.employee_kpi_targets.findFirst({
        where: {
          employee_id: user.id,
          kpi_name: target.kpi_name,
          period_start: target.period_start,
        },
      });

      if (!existingTarget) {
        await prisma.employee_kpi_targets.create({
          data: {
            employee_id: user.id,
            kpi_name: target.kpi_name,
            target_value: target.target_value,
            measure_unit: target.measure_unit,
            period_start: target.period_start,
            period_end: target.period_end,
            is_active: target.is_active,
            createdate: new Date(),
            createdby: 1,
            log_inst: 1,
          },
        });

        targetsCreated++;
      } else {
        targetsSkipped++;
      }
    }

    logger.info(
      `KPI Targets seeding completed: ${targetsCreated} created, ${targetsSkipped} skipped`
    );
  } catch (error) {
    logger.error('Error seeding KPI targets:', error);
    throw error;
  }
}

/**
 * Clear KPI Targets data
 */
export async function clearKPITargets(): Promise<void> {
  try {
    await prisma.employee_kpi_targets.deleteMany({});
  } catch (error) {
    throw error;
  }
}
