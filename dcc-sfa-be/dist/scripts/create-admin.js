"use strict";
/**
 * @fileoverview Create Admin User Script
 * @description Standalone script to create an admin user
 * @author DCC-SFA Team
 * @version 1.0.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ quiet: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const logger_1 = __importDefault(require("../configs/logger"));
const prisma_client_1 = __importDefault(require("../configs/prisma.client"));
async function createAdmin() {
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
            await prisma_client_1.default.$disconnect();
            return;
        }
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
            logger_1.default.error('Admin role not found. Please seed roles first using: npm run seed roles');
            await prisma_client_1.default.$disconnect();
            process.exit(1);
        }
        if (!firstCompany) {
            logger_1.default.error('No active companies found. Please seed companies first using: npm run seed companies');
            await prisma_client_1.default.$disconnect();
            process.exit(1);
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
        logger_1.default.success('Admin user created successfully!');
        logger_1.default.info(`   ID: ${adminUser.id}`);
        logger_1.default.info(`   Email: ${adminUser.email}`);
        logger_1.default.info(`   Name: ${adminUser.name}`);
        logger_1.default.info(`   Password: 123456`);
    }
    catch (error) {
        logger_1.default.error('Error creating admin user:', error);
        await prisma_client_1.default.$disconnect();
        process.exit(1);
    }
    finally {
        await prisma_client_1.default.$disconnect();
    }
}
createAdmin();
//# sourceMappingURL=create-admin.js.map