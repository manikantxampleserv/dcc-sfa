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
  role_name: string;
  parent_id?: number;
  depot_id?: number;
  zone_id?: number;
  address?: string;
  employee_id?: string;
  joining_date?: Date;
  reporting_to?: number;
  is_active: string;
}

const mockUsers: MockUser[] = [
  {
    email: 'salesperson@dcc.com',
    name: 'Sales Person',
    phone_number: '+255-700-000001',
    role_name: 'Sales Person',
    address: 'Sales Department',
    employee_id: 'EMP-SP-001',
    joining_date: new Date('2024-01-01'),
    is_active: 'Y',
  },
  {
    email: 'merchandiser@dcc.com',
    name: 'Merchandiser',
    phone_number: '+255-700-000002',
    role_name: 'Merchandiser',
    address: 'Merchandising Department',
    employee_id: 'EMP-MER-001',
    joining_date: new Date('2024-01-01'),
    is_active: 'Y',
  },
  {
    email: 'technician@dcc.com',
    name: 'Technician',
    phone_number: '+255-700-000003',
    role_name: 'Technician',
    address: 'Technical Department',
    employee_id: 'EMP-TEC-001',
    joining_date: new Date('2024-01-01'),
    is_active: 'Y',
  },
  {
    email: 'subadmin@dcc.com',
    name: 'Sub Admin',
    phone_number: '+255-700-000004',
    role_name: 'Sub Admin',
    address: 'Administration Department',
    employee_id: 'EMP-SADM-001',
    joining_date: new Date('2024-01-01'),
    is_active: 'Y',
  },
];

/**
 * Create admin user
 */
async function createAdminUser(): Promise<void> {
  try {
    logger.info('Creating admin user...');

    const existingAdmin = await prisma.users.findUnique({
      where: { email: 'admin@dcc.com' },
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
        email: 'admin@dcc.com',
        role_id: adminRole.id,
        password_hash: passwordHash,
        name: 'Admin',
        parent_id: firstCompany.id,
        depot_id: firstDepot?.id || null,
        zone_id: firstZone?.id || null,
        phone_number: '+255-700-000000',
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

    const roleMap = new Map(roles.map(role => [role.name, role.id]));

    let usersCreated = 0;
    let usersSkipped = 0;

    const defaultPasswordHash = await bcrypt.hash('123456', 10);

    for (const user of mockUsers) {
      const existingUser = await prisma.users.findFirst({
        where: { email: user.email },
      });

      if (!existingUser) {
        const roleId = roleMap.get(user.role_name);

        if (!roleId) {
          logger.warn(
            `Role not found: ${user.role_name} for user ${user.email}. Skipping.`
          );
          usersSkipped++;
          continue;
        }

        const company = companies[0];
        const depot = depots[0];
        const zone = zones[0];

        await prisma.users.create({
          data: {
            email: user.email,
            name: user.name,
            phone_number: user.phone_number,
            role_id: roleId,
            parent_id: company.id,
            depot_id: depot?.id || null,
            zone_id: zone?.id || null,
            address: user.address,
            employee_id: user.employee_id,
            joining_date: user.joining_date,
            reporting_to: user.reporting_to,
            is_active: user.is_active,
            password_hash: defaultPasswordHash,
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

    await prisma.users.deleteMany({
      where: {
        email: {
          not: 'admin@dcc.com',
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
