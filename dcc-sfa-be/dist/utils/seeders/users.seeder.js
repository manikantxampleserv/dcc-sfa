"use strict";
/**
 * @fileoverview Users Seeder
 * @description Creates 5 sample users (1 admin + 4 mock users) for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockUsers = void 0;
exports.seedUsers = seedUsers;
exports.clearUsers = clearUsers;
const bcrypt_1 = __importDefault(require("bcrypt"));
const logger_1 = __importDefault(require("../../configs/logger"));
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const mockUsers = [
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
exports.mockUsers = mockUsers;
/**
 * Create admin user
 */
async function createAdminUser() {
    try {
        logger_1.default.info('Creating admin user...');
        const existingAdmin = await prisma_client_1.default.users.findFirst({
            where: { email: 'admin@dcc.com' },
        });
        if (existingAdmin) {
            logger_1.default.info('Admin user already exists');
            logger_1.default.info(`   ID: ${existingAdmin.id}`);
            logger_1.default.info(`   Email: ${existingAdmin.email}`);
            logger_1.default.info(`   Name: ${existingAdmin.name}`);
            return;
        }
        // Get required dependencies
        const adminRole = await prisma_client_1.default.roles.findFirst({
            where: { name: 'Admin' },
        });
        const firstCompany = await prisma_client_1.default.companies.findFirst({
            where: { is_active: 'Y' },
        });
        const firstDepot = await prisma_client_1.default.depots.findFirst({
            where: { is_active: 'Y' },
        });
        const firstZone = await prisma_client_1.default.zones.findFirst({
            where: { is_active: 'Y' },
        });
        if (!adminRole) {
            logger_1.default.warn('Admin role not found. Skipping admin user creation.');
            return;
        }
        if (!firstCompany) {
            logger_1.default.warn('No active companies found. Skipping admin user creation.');
            return;
        }
        const passwordHash = await bcrypt_1.default.hash('123456', 10);
        const adminUser = await prisma_client_1.default.users.create({
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
        logger_1.default.info('Admin user created successfully!');
        logger_1.default.info(`   ID: ${adminUser.id}`);
        logger_1.default.info(`   Email: ${adminUser.email}`);
        logger_1.default.info(`   Name: ${adminUser.name}`);
        logger_1.default.info(`   Password: 123456`);
    }
    catch (error) {
        logger_1.default.error('Error creating admin user:', error);
        throw error;
    }
}
/**
 * Seed Users with mock data
 */
async function seedUsers() {
    try {
        logger_1.default.info('Seeding users...');
        // First create the admin user
        await createAdminUser();
        // Get required dependencies for mock users
        const roles = await prisma_client_1.default.roles.findMany({
            select: { id: true, name: true },
            where: { is_active: 'Y' },
        });
        const companies = await prisma_client_1.default.companies.findMany({
            select: { id: true, name: true },
            where: { is_active: 'Y' },
        });
        const depots = await prisma_client_1.default.depots.findMany({
            select: { id: true, name: true },
            where: { is_active: 'Y' },
        });
        const zones = await prisma_client_1.default.zones.findMany({
            select: { id: true, name: true },
            where: { is_active: 'Y' },
        });
        if (roles.length === 0) {
            logger_1.default.warn('No active roles found. Skipping mock users creation.');
            return;
        }
        if (companies.length === 0) {
            logger_1.default.warn('No active companies found. Skipping mock users creation.');
            return;
        }
        const roleMap = new Map(roles.map(role => [role.name, role.id]));
        let usersCreated = 0;
        let usersSkipped = 0;
        const defaultPasswordHash = await bcrypt_1.default.hash('123456', 10);
        for (const user of mockUsers) {
            const existingUser = await prisma_client_1.default.users.findFirst({
                where: { email: user.email },
            });
            if (!existingUser) {
                const roleId = roleMap.get(user.role_name);
                if (!roleId) {
                    logger_1.default.warn(`Role not found: ${user.role_name} for user ${user.email}. Skipping.`);
                    usersSkipped++;
                    continue;
                }
                const company = companies[0];
                const depot = depots[0];
                const zone = zones[0];
                await prisma_client_1.default.users.create({
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
            }
            else {
                usersSkipped++;
            }
        }
        logger_1.default.info(`Users seeding completed: ${usersCreated} created, ${usersSkipped} skipped`);
    }
    catch (error) {
        logger_1.default.error('Error seeding users:', error);
        throw error;
    }
}
/**
 * Clear Users data (but preserve admin user)
 */
async function clearUsers() {
    try {
        logger_1.default.info('Clearing users (preserving admin user)...');
        await prisma_client_1.default.users.deleteMany({
            where: {
                email: {
                    not: 'admin@dcc.com',
                },
            },
        });
        logger_1.default.info('Users cleared successfully (admin user preserved)!');
    }
    catch (error) {
        logger_1.default.error('Error clearing users:', error);
        throw error;
    }
}
//# sourceMappingURL=users.seeder.js.map