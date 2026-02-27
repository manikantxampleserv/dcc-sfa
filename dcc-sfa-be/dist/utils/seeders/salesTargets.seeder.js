"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockSalesTargets = void 0;
exports.seedSalesTargets = seedSalesTargets;
exports.clearSalesTargets = clearSalesTargets;
const logger_1 = __importDefault(require("../../configs/logger"));
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const mockSalesTargets = [
    {
        target_quantity: 1000,
        target_amount: 50000.0,
        is_active: 'Y',
    },
    {
        target_quantity: 500,
        target_amount: 75000.0,
        is_active: 'Y',
    },
    {
        target_quantity: 1200,
        target_amount: 60000.0,
        is_active: 'Y',
    },
    {
        target_quantity: 800,
        target_amount: 40000.0,
        is_active: 'Y',
    },
    {
        target_quantity: 600,
        target_amount: 90000.0,
        is_active: 'Y',
    },
    {
        target_quantity: 400,
        target_amount: 30000.0,
        is_active: 'Y',
    },
    {
        target_quantity: 900,
        target_amount: 45000.0,
        is_active: 'Y',
    },
    {
        target_quantity: 600,
        target_amount: 30000.0,
        is_active: 'Y',
    },
    {
        target_quantity: 200,
        target_amount: 100000.0,
        is_active: 'Y',
    },
    {
        target_quantity: 150,
        target_amount: 75000.0,
        is_active: 'Y',
    },
    {
        target_quantity: 1100,
        target_amount: 55000.0,
        is_active: 'Y',
    },
    {
        target_quantity: 550,
        target_amount: 82500.0,
        is_active: 'Y',
    },
    {
        target_quantity: 1300,
        target_amount: 65000.0,
        is_active: 'Y',
    },
    {
        target_quantity: 900,
        target_amount: 45000.0,
        is_active: 'Y',
    },
    {
        target_quantity: 300,
        target_amount: 150000.0,
        is_active: 'Y',
    },
    {
        target_quantity: 200,
        target_amount: 100000.0,
        is_active: 'Y',
    },
    {
        target_quantity: 1500,
        target_amount: 75000.0,
        is_active: 'Y',
    },
    {
        target_quantity: 1000,
        target_amount: 50000.0,
        is_active: 'Y',
    },
    {
        target_quantity: 2000,
        target_amount: 100000.0,
        is_active: 'Y',
    },
    {
        target_quantity: 800,
        target_amount: 120000.0,
        is_active: 'Y',
    },
    {
        target_quantity: 1200,
        target_amount: 60000.0,
        is_active: 'Y',
    },
    {
        target_quantity: 700,
        target_amount: 105000.0,
        is_active: 'Y',
    },
    {
        target_quantity: 1100,
        target_amount: 55000.0,
        is_active: 'Y',
    },
    {
        target_quantity: 500,
        target_amount: 75000.0,
        is_active: 'Y',
    },
    {
        target_quantity: 180,
        target_amount: 90000.0,
        is_active: 'Y',
    },
    {
        target_quantity: 1300,
        target_amount: 65000.0,
        is_active: 'Y',
    },
    {
        target_quantity: 1000,
        target_amount: 50000.0,
        is_active: 'Y',
    },
    {
        target_quantity: 650,
        target_amount: 97500.0,
        is_active: 'Y',
    },
    {
        target_quantity: 450,
        target_amount: 33750.0,
        is_active: 'Y',
    },
    {
        target_quantity: 350,
        target_amount: 175000.0,
        is_active: 'Y',
    },
    {
        target_quantity: 500,
        target_amount: 25000.0,
        is_active: 'N',
    },
    {
        target_quantity: 300,
        target_amount: 15000.0,
        is_active: 'N',
    },
];
exports.mockSalesTargets = mockSalesTargets;
async function seedSalesTargets() {
    try {
        const salesTargetGroups = await prisma_client_1.default.sales_target_groups.findMany({
            select: { id: true, group_name: true },
            where: { is_active: 'Y' },
        });
        const productCategories = await prisma_client_1.default.product_categories.findMany({
            select: { id: true, category_name: true },
        });
        if (salesTargetGroups.length === 0) {
            logger_1.default.warn('No active sales target groups found. Skipping sales targets seeding.');
            return;
        }
        if (productCategories.length === 0) {
            logger_1.default.warn('No product categories found. Skipping sales targets seeding.');
            return;
        }
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
        let targetsCreated = 0;
        let targetsSkipped = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endDate = new Date(today);
        endDate.setMonth(today.getMonth() + 3);
        for (let i = 0; i < mockSalesTargets.length; i++) {
            const target = mockSalesTargets[i];
            const group = salesTargetGroups[i % salesTargetGroups.length];
            const category = productCategories[i % productCategories.length];
            const salesperson = salespersons.length > 0
                ? salespersons[i % salespersons.length]
                : defaultSalesperson;
            const existingTarget = await prisma_client_1.default.sales_targets.findFirst({
                where: {
                    sales_target_group_id: group.id,
                    product_category_id: category.id,
                    start_date: today,
                    end_date: endDate,
                },
            });
            if (!existingTarget) {
                await prisma_client_1.default.sales_targets.create({
                    data: {
                        sales_target_group_id: group.id,
                        product_category_id: category.id,
                        target_quantity: target.target_quantity,
                        target_amount: target.target_amount || null,
                        start_date: today,
                        end_date: endDate,
                        is_active: target.is_active,
                        createdate: new Date(),
                        createdby: salesperson?.id || 1,
                        log_inst: 1,
                    },
                });
                targetsCreated++;
            }
            else {
                targetsSkipped++;
            }
        }
        logger_1.default.info(`Sales targets seeding completed: ${targetsCreated} created, ${targetsSkipped} skipped`);
    }
    catch (error) {
        logger_1.default.error('Error seeding sales targets:', error);
        throw error;
    }
}
async function clearSalesTargets() {
    await prisma_client_1.default.sales_bonus_rules.deleteMany({});
    await prisma_client_1.default.sales_targets.deleteMany({});
}
//# sourceMappingURL=salesTargets.seeder.js.map