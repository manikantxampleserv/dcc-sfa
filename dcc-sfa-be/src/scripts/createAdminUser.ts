import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import logger from '../configs/logger';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    logger.info('Creating admin');

    const existingUser = await prisma.users.findUnique({
      where: { email: 'admin@gmail.com' },
    });

    if (existingUser) {
      logger.info('Admin user already exists');
      logger.info(`   ID: ${existingUser.id}`);
      logger.info(`   Email: ${existingUser.email}`);
      logger.info(`   Name: ${existingUser.name}`);
      return existingUser;
    }

    const passwordHash = await bcrypt.hash('123456', 10);

    await prisma.$executeRaw`SET IDENTITY_INSERT users ON`;

    try {
      await prisma.$executeRaw`
        INSERT INTO users (
          id, email, role_id, password_hash, name, parent_id, depot_id, zone_id,
          phone_number, address, employee_id, joining_date, reporting_to,
          profile_image, last_login, is_active, createdate, createdby, log_inst
        ) VALUES (
          1, ${`admin@gmail.com`}, 1, ${passwordHash}, ${`System Administrator`},
          1, 1, 1, ${`+91-9999999999`}, ${`System Admin Address`}, ${`ADMIN001`},
          ${`2024-01-01`}, NULL, NULL, NULL, ${`Y`}, GETDATE(), 1, 1
        )
      `;
    } finally {
      await prisma.$executeRaw`SET IDENTITY_INSERT users OFF`;
    }

    const adminUser = await prisma.users.findUnique({
      where: { id: 1 },
    });

    logger.success('Admin user created successfully!');
    logger.info(`   ID: ${adminUser?.id}`);
    logger.info(`   Email: ${adminUser?.email}`);
    logger.info(`   Name: ${adminUser?.name}`);
    logger.info(`   Password: 123456`);
    logger.info('');
    logger.success('Login Credentials:');
    logger.info('   Email: admin@gmail.com');
    logger.info('   Password: 123456');

    return adminUser;
  } catch (error) {
    logger.error('Error creating admin user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  createAdminUser()
    .then(() => {
      logger.success('Admin user creation completed!');
      process.exit(0);
    })
    .catch(error => {
      logger.error('Admin user creation failed:', error);
      process.exit(1);
    });
}

export { createAdminUser };
