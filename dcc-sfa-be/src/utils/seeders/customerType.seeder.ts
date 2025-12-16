/**
 * @fileoverview Customer Type (Outlet Type) Seeder
 * @description Creates customer types for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import prisma from '../../configs/prisma.client';

interface MockCustomerType {
  type_name: string;
  type_code: string;
  is_active: string;
}

const mockCustomerTypes: MockCustomerType[] = [
  {
    type_name: 'GROCERY',
    type_code: 'CT-GROCERY',
    is_active: 'Y',
  },
  {
    type_name: 'LODGE',
    type_code: 'CT-LODGE',
    is_active: 'Y',
  },
  {
    type_name: 'SHOP',
    type_code: 'CT-SHOP',
    is_active: 'Y',
  },
  {
    type_name: 'KIOSK',
    type_code: 'CT-KIOSK',
    is_active: 'Y',
  },
  {
    type_name: 'PUB',
    type_code: 'CT-PUB',
    is_active: 'Y',
  },
  {
    type_name: 'BAR',
    type_code: 'CT-BAR',
    is_active: 'Y',
  },
  {
    type_name: 'SUPERMARKET',
    type_code: 'CT-SUPERMARKET',
    is_active: 'Y',
  },
  {
    type_name: 'SCHOOL',
    type_code: 'CT-SCHOOL',
    is_active: 'Y',
  },
  {
    type_name: 'AT WORK',
    type_code: 'CT-AT-WORK',
    is_active: 'Y',
  },
  {
    type_name: 'HOSTEL',
    type_code: 'CT-HOSTEL',
    is_active: 'Y',
  },
  {
    type_name: 'HOTEL',
    type_code: 'CT-HOTEL',
    is_active: 'Y',
  },
  {
    type_name: 'RESTAURANT',
    type_code: 'CT-RESTAURANT',
    is_active: 'Y',
  },
  {
    type_name: 'CAFE',
    type_code: 'CT-CAFE',
    is_active: 'Y',
  },
  {
    type_name: 'CLUB',
    type_code: 'CT-CLUB',
    is_active: 'Y',
  },
  {
    type_name: 'STORE',
    type_code: 'CT-STORE',
    is_active: 'Y',
  },
  {
    type_name: 'CANTEEN',
    type_code: 'CT-CANTEEN',
    is_active: 'Y',
  },
  {
    type_name: 'GUEST HOUSE',
    type_code: 'CT-GUEST-HOUSE',
    is_active: 'Y',
  },
  {
    type_name: 'BAR & GUEST HOUSE',
    type_code: 'CT-BAR-GUEST-HOUSE',
    is_active: 'Y',
  },
  {
    type_name: 'OFFICE',
    type_code: 'CT-OFFICE',
    is_active: 'Y',
  },
  {
    type_name: 'AGENT',
    type_code: 'CT-AGENT',
    is_active: 'Y',
  },
  {
    type_name: 'SALOON',
    type_code: 'CT-SALOON',
    is_active: 'Y',
  },
  {
    type_name: 'HALL',
    type_code: 'CT-HALL',
    is_active: 'Y',
  },
  {
    type_name: 'PHARMACY',
    type_code: 'CT-PHARMACY',
    is_active: 'Y',
  },
  {
    type_name: 'LOUNGE',
    type_code: 'CT-LOUNGE',
    is_active: 'Y',
  },
  {
    type_name: 'BAR & RESTAURANT',
    type_code: 'CT-BAR-RESTAURANT',
    is_active: 'Y',
  },
];

export async function seedCustomerType(): Promise<void> {
  try {
    for (const customerType of mockCustomerTypes) {
      const existingType = await prisma.customer_type.findFirst({
        where: { type_name: customerType.type_name },
      });

      if (!existingType) {
        await prisma.customer_type.create({
          data: {
            type_name: customerType.type_name,
            type_code: customerType.type_code,
            is_active: customerType.is_active,
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

export async function clearCustomerType(): Promise<void> {
  try {
    await prisma.customer_type.deleteMany({});
  } catch (error: any) {
    if (
      error?.code === 'P2003' ||
      error?.message?.includes('Foreign key constraint')
    ) {
      console.warn(
        '⚠️  Could not clear all customer types due to foreign key constraints. Some records may be in use by customers.'
      );
    } else {
      throw error;
    }
  }
}

export { mockCustomerTypes };
