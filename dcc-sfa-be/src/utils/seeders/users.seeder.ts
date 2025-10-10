/**
 * @fileoverview Users Seeder
 * @description Creates 11 sample users for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface MockUser {
  email: string;
  name: string;
  phone_number?: string;
  role_id: number;
  parent_id?: number;
  depot_id?: number;
  zone_id?: number;
  address?: string;
  employee_id?: string;
  joining_date?: Date;
  reporting_to?: number;
  is_active: string;
}

// Mock Users Data (11 users)
const mockUsers: MockUser[] = [
  {
    email: 'admin@company.com',
    name: 'System Administrator',
    phone_number: '+1-555-0100',
    role_id: 1,
    parent_id: 1,
    depot_id: undefined,
    zone_id: undefined,
    address: '123 Admin Street',
    employee_id: 'EMP-001',
    joining_date: new Date('2024-01-01'),
    reporting_to: undefined,
    is_active: 'Y',
  },
  {
    email: 'manager1@company.com',
    name: 'John Manager',
    phone_number: '+1-555-0101',
    role_id: 3,
    parent_id: 1,
    depot_id: undefined,
    zone_id: undefined,
    address: '456 Manager Ave',
    employee_id: 'EMP-002',
    joining_date: new Date('2024-01-02'),
    reporting_to: undefined,
    is_active: 'Y',
  },
  {
    email: 'sales1@company.com',
    name: 'Jane Sales',
    phone_number: '+1-555-0102',
    role_id: 5,
    parent_id: 1,
    depot_id: undefined,
    zone_id: undefined,
    address: '789 Sales Blvd',
    employee_id: 'EMP-003',
    joining_date: new Date('2024-01-03'),
    reporting_to: undefined,
    is_active: 'Y',
  },
  {
    email: 'warehouse1@company.com',
    name: 'Mike Warehouse',
    phone_number: '+1-555-0103',
    role_id: 6,
    parent_id: 1,
    depot_id: undefined,
    zone_id: undefined,
    address: '321 Warehouse St',
    employee_id: 'EMP-004',
    joining_date: new Date('2024-01-04'),
    reporting_to: undefined,
    is_active: 'Y',
  },
  {
    email: 'finance1@company.com',
    name: 'Sarah Finance',
    phone_number: '+1-555-0104',
    role_id: 8,
    parent_id: 1,
    depot_id: undefined,
    zone_id: undefined,
    address: '654 Finance Rd',
    employee_id: 'EMP-005',
    joining_date: new Date('2024-01-05'),
    reporting_to: undefined,
    is_active: 'Y',
  },
  {
    email: 'support1@company.com',
    name: 'David Support',
    phone_number: '+1-555-0105',
    role_id: 10,
    parent_id: 1,
    depot_id: undefined,
    zone_id: undefined,
    address: '987 Support Lane',
    employee_id: 'EMP-006',
    joining_date: new Date('2024-01-06'),
    reporting_to: undefined,
    is_active: 'Y',
  },
  {
    email: 'sales2@company.com',
    name: 'Lisa Sales',
    phone_number: '+1-555-0106',
    role_id: 5,
    parent_id: 1,
    depot_id: undefined,
    zone_id: undefined,
    address: '147 Sales Drive',
    employee_id: 'EMP-007',
    joining_date: new Date('2024-01-07'),
    reporting_to: undefined,
    is_active: 'Y',
  },
  {
    email: 'warehouse2@company.com',
    name: 'Tom Warehouse',
    phone_number: '+1-555-0107',
    role_id: 7,
    parent_id: 1,
    depot_id: undefined,
    zone_id: undefined,
    address: '258 Warehouse Ave',
    employee_id: 'EMP-008',
    joining_date: new Date('2024-01-08'),
    reporting_to: undefined,
    is_active: 'Y',
  },
  {
    email: 'manager2@company.com',
    name: 'Alex Manager',
    phone_number: '+1-555-0108',
    role_id: 3,
    parent_id: 1,
    depot_id: undefined,
    zone_id: undefined,
    address: '369 Manager St',
    employee_id: 'EMP-009',
    joining_date: new Date('2024-01-09'),
    reporting_to: undefined,
    is_active: 'Y',
  },
  {
    email: 'sales3@company.com',
    name: 'Emma Sales',
    phone_number: '+1-555-0109',
    role_id: 5,
    parent_id: 1,
    depot_id: undefined,
    zone_id: undefined,
    address: '741 Sales Blvd',
    employee_id: 'EMP-010',
    joining_date: new Date('2024-01-10'),
    reporting_to: undefined,
    is_active: 'Y',
  },
  {
    email: 'inactive@company.com',
    name: 'Inactive User',
    phone_number: '+1-555-0110',
    role_id: 11,
    parent_id: 1,
    depot_id: undefined,
    zone_id: undefined,
    address: '852 Inactive St',
    employee_id: 'EMP-011',
    joining_date: new Date('2024-01-11'),
    reporting_to: undefined,
    is_active: 'N',
  },
];

/**
 * Seed Users with mock data
 */
export async function seedUsers(): Promise<void> {
  try {
    for (const user of mockUsers) {
      const existingUser = await prisma.users.findFirst({
        where: { email: user.email },
      });

      if (!existingUser) {
        await prisma.users.create({
          data: {
            email: user.email,
            name: user.name,
            phone_number: user.phone_number,
            role_id: user.role_id,
            parent_id: user.parent_id,
            depot_id: user.depot_id,
            zone_id: user.zone_id,
            address: user.address,
            employee_id: user.employee_id,
            joining_date: user.joining_date,
            reporting_to: user.reporting_to,
            is_active: user.is_active,
            password_hash: 'hashed_password_placeholder', // Required field
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
 * Clear Users data
 */
export async function clearUsers(): Promise<void> {
  try {
    await prisma.users.deleteMany({});
  } catch (error) {
    throw error;
  }
}

export { mockUsers };
