/**
 * @fileoverview Create Permanent User with Non-Expiring Token
 * @description Standalone script to create an Admin user with full system permissions and a permanent, non-expiring JWT token for Excel live integration.
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import dotenv from 'dotenv';
dotenv.config({ quiet: true });

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import logger from '../configs/logger';
import prisma from '../configs/prisma.client';
import { jwtConfig } from '../configs/jwt.config';

/**
 * Creates a dedicated user with Admin role and generates a permanent, non-expiring token.
 *
 * @returns {Promise<void>}
 */
async function createPermanentUser(): Promise<void> {
  try {
    logger.info('Starting creation of permanent user with full access...');

    const email = 'excel.sync@dcc.com';
    const name = 'Excel Sync Admin';
    const password = 'excel@123';

    const adminRole = await prisma.roles.findFirst({
      where: { name: 'Admin' },
    });

    if (!adminRole) {
      logger.error('Admin role not found. Please ensure roles are seeded.');
      await prisma.$disconnect();
      process.exit(1);
    }

    const firstCompany = await prisma.companies.findFirst({
      where: { is_active: 'Y' },
    });

    if (!firstCompany) {
      logger.error('No active company found. Please ensure companies exist.');
      await prisma.$disconnect();
      process.exit(1);
    }

    const firstDepot = await prisma.depots.findFirst({
      where: { is_active: 'Y' },
    });

    const firstZone = await prisma.zones.findFirst({
      where: { is_active: 'Y' },
    });

    let user = await prisma.users.findFirst({
      where: { email },
    });

    if (!user) {
      const passwordHash = await bcrypt.hash(password, 10);

      user = await prisma.users.create({
        data: {
          email,
          name,
          role_id: adminRole.id,
          password_hash: passwordHash,
          parent_id: firstCompany.id,
          depot_id: firstDepot?.id || null,
          zone_id: firstZone?.id || null,
          phone_number: '+255-700-999999',
          address: 'System Integration Service User',
          employee_id: 'EXCEL_SYNC_01',
          joining_date: new Date(),
          reporting_to: null,
          profile_image: null,
          last_login: null,
          is_active: 'Y',
          createdate: new Date(),
          createdby: 1,
          log_inst: 1,
        },
      });

      logger.success(`User created: ${user.name} (${user.email})`);
    } else {
      logger.info(`Existing user found: ${user.name} (${user.email})`);
      if (user.role_id !== adminRole.id) {
        user = await prisma.users.update({
          where: { id: user.id },
          data: { role_id: adminRole.id, is_active: 'Y' },
        });
        logger.info('Updated user role to Admin for full system permissions.');
      }
    }

    const payload = {
      id: user.id,
      email: user.email,
      employee_id: user.employee_id,
      role: adminRole.name,
      parent_id: user.parent_id,
      depot_id: user.depot_id,
      zone_id: user.zone_id,
    };

    /**
     * Generates a token with a 100-year expiration period.
     */
    const permanentToken = jwt.sign(payload, jwtConfig.secret, {
      expiresIn: '100y',
    });

    const farFutureDate = new Date('2099-12-31T23:59:59.000Z');

    /**
     * Deactivates previous tokens for this service user.
     */
    await prisma.api_tokens.updateMany({
      where: {
        user_id: user.id,
        token_type: 'Permanent',
      },
      data: {
        is_active: 'N',
        is_revoked: true,
      },
    });

    /**
     * Stores the new permanent token in the database.
     */
    await prisma.api_tokens.create({
      data: {
        user_id: user.id,
        token: permanentToken,
        token_type: 'Permanent',
        issued_at: new Date(),
        expires_at: farFutureDate,
        device_id: 'Excel Live Sync Service',
        ip_address: '127.0.0.1',
        is_active: 'Y',
        created_by: user.id,
        created_date: new Date(),
      },
    });

    logger.success('Permanent Token generated successfully!');
    console.log('\n======================================================');
    console.log('USER DETAILS:');
    console.log(`Email:    ${user.email}`);
    console.log(`Password: ${password}`);
    console.log(`Role:     ${adminRole.name} (Full System Access)`);
    console.log('------------------------------------------------------');
    console.log('PERMANENT TOKEN (Never Expires):');
    console.log(permanentToken);
    console.log('------------------------------------------------------');
    console.log('EXCEL POWER QUERY LIVE API URL:');
    console.log(
      `http://localhost:4000/api/v1/excel/sales-data?token=${permanentToken}`
    );
    console.log('======================================================\n');
  } catch (error) {
    logger.error('Error creating permanent user:', error);
    await prisma.$disconnect();
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createPermanentUser();
