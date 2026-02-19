"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockSalesTargetGroups = void 0;
exports.seedSalesTargetGroups = seedSalesTargetGroups;
exports.clearSalesTargetGroups = clearSalesTargetGroups;
const logger_1 = __importDefault(require("../../configs/logger"));
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const mockSalesTargetGroups = [
    {
        group_name: 'North Region Sales Team',
        description: 'Sales team covering northern territories and major cities',
        is_active: 'Y',
    },
    {
        group_name: 'South Region Sales Team',
        description: 'Sales team covering southern territories and coastal areas',
        is_active: 'Y',
    },
    {
        group_name: 'East Region Sales Team',
        description: 'Sales team covering eastern territories and industrial zones',
        is_active: 'Y',
    },
    {
        group_name: 'West Region Sales Team',
        description: 'Sales team covering western territories and rural areas',
        is_active: 'Y',
    },
    {
        group_name: 'Premium Account Managers',
        description: 'Dedicated team for premium customer accounts and key clients',
        is_active: 'Y',
    },
    {
        group_name: 'Corporate Sales Division',
        description: 'Specialized team for corporate and enterprise clients',
        is_active: 'Y',
    },
    {
        group_name: 'Retail Sales Force',
        description: 'Team focused on retail outlets and small businesses',
        is_active: 'Y',
    },
    {
        group_name: 'Wholesale Distribution Team',
        description: 'Team handling wholesale and distribution channels',
        is_active: 'Y',
    },
    {
        group_name: 'New Market Expansion',
        description: 'Team focused on expanding into new markets and territories',
        is_active: 'N',
    },
    {
        group_name: 'Seasonal Sales Team',
        description: 'Temporary team for seasonal sales campaigns and promotions',
        is_active: 'Y',
    },
];
exports.mockSalesTargetGroups = mockSalesTargetGroups;
async function seedSalesTargetGroups() {
    try {
        const salesPersonRole = await prisma_client_1.default.roles.findFirst({
            where: { name: 'Sales Person' },
        });
        const salespersons = await prisma_client_1.default.users.findMany({
            select: { id: true, name: true },
            where: {
                role_id: salesPersonRole?.id,
                is_active: 'Y',
            },
        });
        if (salespersons.length === 0) {
            const adminUser = await prisma_client_1.default.users.findFirst({
                where: { email: 'admin@dcc.com' },
                select: { id: true, name: true },
            });
            if (adminUser) {
                salespersons.push(adminUser);
            }
        }
        const defaultSalesperson = salespersons.length > 0 ? salespersons[0] : null;
        let groupsCreated = 0;
        let groupsSkipped = 0;
        for (let i = 0; i < mockSalesTargetGroups.length; i++) {
            const group = mockSalesTargetGroups[i];
            const salesperson = salespersons.length > 0
                ? salespersons[i % salespersons.length]
                : defaultSalesperson;
            const existingGroup = await prisma_client_1.default.sales_target_groups.findFirst({
                where: { group_name: group.group_name },
            });
            if (!existingGroup) {
                await prisma_client_1.default.sales_target_groups.create({
                    data: {
                        group_name: group.group_name,
                        description: group.description || null,
                        is_active: group.is_active,
                        createdate: new Date(),
                        createdby: salesperson?.id || 1,
                        log_inst: 1,
                    },
                });
                groupsCreated++;
            }
            else {
                groupsSkipped++;
            }
        }
        logger_1.default.info(`Sales target groups seeding completed: ${groupsCreated} created, ${groupsSkipped} skipped`);
    }
    catch (error) {
        logger_1.default.error('Error seeding sales target groups:', error);
        throw error;
    }
}
async function clearSalesTargetGroups() {
    try {
        await prisma_client_1.default.sales_bonus_rules.deleteMany({});
        await prisma_client_1.default.sales_targets.deleteMany({});
        await prisma_client_1.default.sales_target_group_members.deleteMany({});
        await prisma_client_1.default.sales_target_groups.deleteMany({});
    }
    catch (error) {
        throw error;
    }
}
//# sourceMappingURL=salesTargetGroups.seeder.js.map