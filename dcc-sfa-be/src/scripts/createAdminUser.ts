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

    const adminUser = await prisma.users.create({
      data: {
        email: 'admin@gmail.com',
        role_id: 1,
        password_hash: passwordHash,
        name: 'System Administrator',
        parent_id: 1,
        depot_id: 1,
        zone_id: 1,
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
