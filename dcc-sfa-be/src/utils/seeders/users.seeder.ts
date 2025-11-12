/**
 * @fileoverview Users Seeder
 * @description Creates 11 sample users for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import bcrypt from 'bcrypt';
import logger from '../../configs/logger';
import prisma from '../../configs/prisma.client';

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
    email: 'manager1@ampleserv.com',
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
    email: 'sales1@ampleserv.com',
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
    email: 'warehouse1@ampleserv.com',
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
    email: 'finance1@ampleserv.com',
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
    email: 'support1@ampleserv.com',
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
    email: 'sales2@ampleserv.com',
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
    email: 'warehouse2@ampleserv.com',
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
    email: 'manager2@ampleserv.com',
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
    email: 'sales3@ampleserv.com',
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
    email: 'inactive@ampleserv.com',
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
 * Create admin user
 */
async function createAdminUser(): Promise<void> {
  try {
    logger.info('Creating admin user...');

    const existingAdmin = await prisma.users.findUnique({
      where: { email: 'admin@gmail.com' },
    });

    if (existingAdmin) {
      logger.info('Admin user already exists');
      logger.info(`   ID: ${existingAdmin.id}`);
      logger.info(`   Email: ${existingAdmin.email}`);
      logger.info(`   Name: ${existingAdmin.name}`);
      return;
    }

    // Get required dependencies
    const adminRole = await prisma.roles.findFirst({
      where: { name: 'Admin' },
    });

    const firstCompany = await prisma.companies.findFirst({
      where: { is_active: 'Y' },
    });

    const firstDepot = await prisma.depots.findFirst({
      where: { is_active: 'Y' },
    });

    const firstZone = await prisma.zones.findFirst({
      where: { is_active: 'Y' },
    });

    if (!adminRole) {
      logger.warn('Admin role not found. Skipping admin user creation.');
      return;
    }

    if (!firstCompany) {
      logger.warn('No active companies found. Skipping admin user creation.');
      return;
    }

    const passwordHash = await bcrypt.hash('123456', 10);

    const adminUser = await prisma.users.create({
      data: {
        email: 'admin@gmail.com',
        role_id: adminRole.id,
        password_hash: passwordHash,
        name: 'Admin',
        parent_id: firstCompany.id,
        depot_id: firstDepot?.id || null,
        zone_id: firstZone?.id || null,
        phone_number: '+91-9999999999',
        address: 'System Admin Address',
        employee_id: 'ADMIN001',
        joining_date: new Date('2024-01-01'),
        reporting_to: null,
        profile_image: null,
        last_login: null,
        is_active: 'Y',
        createdate: new Date(),
        createdby: 1,
        log_inst: 1,
      },
    });

    logger.info('Admin user created successfully!');
    logger.info(`   ID: ${adminUser.id}`);
    logger.info(`   Email: ${adminUser.email}`);
    logger.info(`   Name: ${adminUser.name}`);
    logger.info(`   Password: 123456`);
  } catch (error) {
    logger.error('Error creating admin user:', error);
    throw error;
  }
}

/**
 * Seed Users with mock data
 */
export async function seedUsers(): Promise<void> {
  try {
    logger.info('Seeding users...');

    // First create the admin user
    await createAdminUser();

    // Get required dependencies for mock users
    const roles = await prisma.roles.findMany({
      select: { id: true, name: true },
      where: { is_active: 'Y' },
    });

    const companies = await prisma.companies.findMany({
      select: { id: true, name: true },
      where: { is_active: 'Y' },
    });

    const depots = await prisma.depots.findMany({
      select: { id: true, name: true },
      where: { is_active: 'Y' },
    });

    const zones = await prisma.zones.findMany({
      select: { id: true, name: true },
      where: { is_active: 'Y' },
    });

    if (roles.length === 0) {
      logger.warn('No active roles found. Skipping mock users creation.');
      return;
    }

    if (companies.length === 0) {
      logger.warn('No active companies found. Skipping mock users creation.');
      return;
    }

    let usersCreated = 0;
    let usersSkipped = 0;

    // Then create other mock users
    for (const user of mockUsers) {
      const existingUser = await prisma.users.findFirst({
        where: { email: user.email },
      });

      if (!existingUser) {
        // Find the role by ID or use first available role
        const role = roles.find(r => r.id === user.role_id) || roles[0];

        // Use first company for parent_id
        const company = companies[0];

        // Use first depot and zone if available
        const depot = depots[0];
        const zone = zones[0];

        await prisma.users.create({
          data: {
            email: user.email,
            name: user.name,
            phone_number: user.phone_number,
            role_id: role.id,
            parent_id: company.id,
            depot_id: depot?.id || null,
            zone_id: zone?.id || null,
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

        usersCreated++;
      } else {
        usersSkipped++;
      }
    }

    logger.info(
      `Users seeding completed: ${usersCreated} created, ${usersSkipped} skipped`
    );
  } catch (error) {
    logger.error('Error seeding users:', error);
    throw error;
  }
}

/**
 * Clear Users data (but preserve admin user)
 */
export async function clearUsers(): Promise<void> {
  try {
    logger.info('Clearing users (preserving admin user)...');

    // Delete all users except admin
    await prisma.users.deleteMany({
      where: {
        email: {
          not: 'admin@gmail.com',
        },
      },
    });

    logger.info('Users cleared successfully (admin user preserved)!');
  } catch (error) {
    logger.error('Error clearing users:', error);
    throw error;
  }
}

export { mockUsers };
