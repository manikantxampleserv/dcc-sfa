/**
 * @fileoverview Roles Seeder
 * @description Creates 11 sample roles for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface MockRole {
  name: string;
  description?: string;
  is_active: string;
}

// Mock Roles Data (11 roles)
const mockRoles: MockRole[] = [
  {
    name: 'Super Admin',
    description: 'Full system access with all permissions',
    is_active: 'Y',
  },
  {
    name: 'Admin',
    description: 'Administrative access with most permissions',
    is_active: 'Y',
  },
  {
    name: 'Manager',
    description: 'Management role with oversight permissions',
    is_active: 'Y',
  },
  {
    name: 'Sales Manager',
    description: 'Sales team management and reporting',
    is_active: 'Y',
  },
  {
    name: 'Sales Representative',
    description: 'Field sales and customer interaction',
    is_active: 'Y',
  },
  {
    name: 'Warehouse Manager',
    description: 'Inventory and warehouse operations',
    is_active: 'Y',
  },
  {
    name: 'Warehouse Staff',
    description: 'Basic warehouse operations and inventory',
    is_active: 'Y',
  },
  {
    name: 'Finance Manager',
    description: 'Financial reporting and budget management',
    is_active: 'Y',
  },
  {
    name: 'Finance Staff',
    description: 'Basic financial operations and data entry',
    is_active: 'Y',
  },
  {
    name: 'Customer Service',
    description: 'Customer support and issue resolution',
    is_active: 'Y',
  },
  {
    name: 'Guest User',
    description: 'Limited access for temporary users',
    is_active: 'N',
  },
];

/**
 * Seed Roles with mock data
 */
export async function seedRoles(): Promise<void> {
  try {
    for (const role of mockRoles) {
      const existingRole = await prisma.roles.findFirst({
        where: { name: role.name },
      });

      if (!existingRole) {
        await prisma.roles.create({
          data: {
            name: role.name,
            description: role.description,
            is_active: role.is_active,
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

/**
 * Clear Roles data
 */
export async function clearRoles(): Promise<void> {
  try {
    await prisma.roles.deleteMany({});
  } catch (error) {
    throw error;
  }
}

export { mockRoles };
