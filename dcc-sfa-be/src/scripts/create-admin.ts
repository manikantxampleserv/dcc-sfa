/**
 * @fileoverview Create Admin User Script
 * @description Standalone script to create an admin user
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import dotenv from 'dotenv';
dotenv.config({ quiet: true });

import bcrypt from 'bcrypt';
import logger from '../configs/logger';
import prisma from '../configs/prisma.client';

async function createAdmin(): Promise<void> {
  try {
    logger.info('Creating admin user...');

    const existingAdmin = await prisma.users.findFirst({
      where: { email: 'admin@dcc.com' },
    });

    if (existingAdmin) {
      logger.info('Admin user already exists');
      logger.info(`   ID: ${existingAdmin.id}`);
      logger.info(`   Email: ${existingAdmin.email}`);
      logger.info(`   Name: ${existingAdmin.name}`);
      await prisma.$disconnect();
      return;
    }

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
      logger.error(
        'Admin role not found. Please seed roles first using: npm run seed roles'
      );
      await prisma.$disconnect();
      process.exit(1);
    }

    if (!firstCompany) {
      logger.error(
        'No active companies found. Please seed companies first using: npm run seed companies'
      );
      await prisma.$disconnect();
      process.exit(1);
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

    logger.success('Admin user created successfully!');
    logger.info(`   ID: ${adminUser.id}`);
    logger.info(`   Email: ${adminUser.email}`);
    logger.info(`   Name: ${adminUser.name}`);
    logger.info(`   Password: 123456`);
  } catch (error) {
    logger.error('Error creating admin user:', error);
    await prisma.$disconnect();
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
