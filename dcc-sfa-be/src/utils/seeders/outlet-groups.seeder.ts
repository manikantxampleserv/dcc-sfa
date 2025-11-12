/**
 * @fileoverview Outlet Groups (Customer Groups) Seeder
 * @description Creates sample customer groups for organizing outlets by type, region, or business characteristics
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import logger from '../../configs/logger';
import prisma from '../../configs/prisma.client';

interface MockOutletGroup {
  name: string;
  code: string;
  description?: string;
  discount_percentage?: number;
  credit_terms?: number;
  payment_terms?: string;
  price_group?: string;
  is_active: string;
}

const mockOutletGroups: MockOutletGroup[] = [
  {
    name: 'Premium Retailers',
    code: 'GRP-PREM-RET',
    description:
      'High-value retail customers with premium service requirements',
    discount_percentage: 15.0,
    credit_terms: 30,
    payment_terms: 'Net 30',
    price_group: 'Premium',
    is_active: 'Y',
  },
  {
    name: 'Wholesale Distributors',
    code: 'GRP-WHOL-DIST',
    description: 'Large volume wholesale distributors',
    discount_percentage: 25.0,
    credit_terms: 45,
    payment_terms: 'Net 45',
    price_group: 'Wholesale',
    is_active: 'Y',
  },
  {
    name: 'Corporate Clients',
    code: 'GRP-CORP-CLI',
    description: 'Corporate customers with long-term contracts',
    discount_percentage: 20.0,
    credit_terms: 60,
    payment_terms: 'Net 60',
    price_group: 'Corporate',
    is_active: 'Y',
  },
  {
    name: 'Healthcare Facilities',
    code: 'GRP-HEALTH',
    description: 'Hospitals, clinics, and healthcare institutions',
    discount_percentage: 12.0,
    credit_terms: 30,
    payment_terms: 'Net 30',
    price_group: 'Healthcare',
    is_active: 'Y',
  },
  {
    name: 'Restaurant Chains',
    code: 'GRP-REST-CHN',
    description: 'Restaurant chains and food service providers',
    discount_percentage: 18.0,
    credit_terms: 30,
    payment_terms: 'Net 30',
    price_group: 'Restaurant',
    is_active: 'Y',
  },
  {
    name: 'Manufacturing Units',
    code: 'GRP-MFG-UNIT',
    description: 'Manufacturing companies and industrial clients',
    discount_percentage: 22.0,
    credit_terms: 45,
    payment_terms: 'Net 45',
    price_group: 'Manufacturing',
    is_active: 'Y',
  },
  {
    name: 'Automotive Dealers',
    code: 'GRP-AUTO-DLR',
    description: 'Automotive dealerships and service centers',
    discount_percentage: 16.0,
    credit_terms: 30,
    payment_terms: 'Net 30',
    price_group: 'Automotive',
    is_active: 'Y',
  },
  {
    name: 'Service Providers',
    code: 'GRP-SVC-PROV',
    description: 'Service companies and maintenance providers',
    discount_percentage: 14.0,
    credit_terms: 30,
    payment_terms: 'Net 30',
    price_group: 'Service',
    is_active: 'Y',
  },
  {
    name: 'Small Retailers',
    code: 'GRP-SML-RET',
    description: 'Small retail outlets and independent stores',
    discount_percentage: 8.0,
    credit_terms: 15,
    payment_terms: 'Net 15',
    price_group: 'Standard',
    is_active: 'Y',
  },
  {
    name: 'Government Agencies',
    code: 'GRP-GOV-AGY',
    description: 'Government departments and public sector organizations',
    discount_percentage: 10.0,
    credit_terms: 90,
    payment_terms: 'Net 90',
    price_group: 'Government',
    is_active: 'Y',
  },
  {
    name: 'Educational Institutions',
    code: 'GRP-EDU-INST',
    description: 'Schools, colleges, and educational organizations',
    discount_percentage: 12.0,
    credit_terms: 45,
    payment_terms: 'Net 45',
    price_group: 'Education',
    is_active: 'Y',
  },
  {
    name: 'Non-Profit Organizations',
    code: 'GRP-NPO-ORG',
    description: 'Non-profit organizations and charities',
    discount_percentage: 20.0,
    credit_terms: 30,
    payment_terms: 'Net 30',
    price_group: 'Non-Profit',
    is_active: 'Y',
  },
  {
    name: 'International Clients',
    code: 'GRP-INT-CLI',
    description: 'International customers and export clients',
    discount_percentage: 15.0,
    credit_terms: 30,
    payment_terms: 'LC at Sight',
    price_group: 'International',
    is_active: 'Y',
  },
  {
    name: 'Emergency Services',
    code: 'GRP-EMRG-SVC',
    description: 'Emergency services and critical infrastructure',
    discount_percentage: 5.0,
    credit_terms: 15,
    payment_terms: 'Net 15',
    price_group: 'Emergency',
    is_active: 'Y',
  },
  {
    name: 'Inactive Group',
    code: 'GRP-INACTIVE',
    description: 'Legacy customer group no longer in use',
    discount_percentage: 0.0,
    credit_terms: 30,
    payment_terms: 'Net 30',
    price_group: 'Legacy',
    is_active: 'N',
  },
];

/**
 * Seed Outlet Groups (Customer Groups) with mock data
 */
export async function seedOutletGroups(): Promise<void> {
  try {
    let groupsCreated = 0;
    let groupsSkipped = 0;

    for (const group of mockOutletGroups) {
      const existingGroup = await prisma.customer_groups.findFirst({
        where: { code: group.code },
      });

      if (!existingGroup) {
        await prisma.customer_groups.create({
          data: {
            name: group.name,
            code: group.code,
            description: group.description,
            discount_percentage: group.discount_percentage,
            credit_terms: group.credit_terms,
            payment_terms: group.payment_terms,
            price_group: group.price_group,
            is_active: group.is_active,
            createdate: new Date(),
            createdby: 1,
            log_inst: 1,
          },
        });

        groupsCreated++;
      } else {
        groupsSkipped++;
      }
    }

    logger.info(
      `Outlet Groups seeding completed: ${groupsCreated} created, ${groupsSkipped} skipped`
    );
  } catch (error) {
    logger.error('Error seeding outlet groups:', error);
    throw error;
  }
}

/**
 * Clear Outlet Groups (Customer Groups) data
 */
export async function clearOutletGroups(): Promise<void> {
  try {
    await prisma.customer_groups.deleteMany({});
  } catch (error) {
    throw error;
  }
}
