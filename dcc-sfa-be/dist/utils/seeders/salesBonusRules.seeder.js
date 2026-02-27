"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockSalesBonusRules = void 0;
exports.seedSalesBonusRules = seedSalesBonusRules;
exports.clearSalesBonusRules = clearSalesBonusRules;
const logger_1 = __importDefault(require("../../configs/logger"));
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const mockSalesBonusRules = [
    {
        achievement_min_percent: 80.0,
        achievement_max_percent: 99.9,
        bonus_amount: 500.0,
        bonus_percent: undefined,
        is_active: 'Y',
    },
    {
        achievement_min_percent: 100.0,
        achievement_max_percent: 120.0,
        bonus_amount: 1000.0,
        bonus_percent: 5.0,
        is_active: 'Y',
    },
    {
        achievement_min_percent: 90.0,
        achievement_max_percent: 110.0,
        bonus_amount: undefined,
        bonus_percent: 3.0,
        is_active: 'Y',
    },
    {
        achievement_min_percent: 110.1,
        achievement_max_percent: 150.0,
        bonus_amount: 1500.0,
        bonus_percent: 7.5,
        is_active: 'Y',
    },
    {
        achievement_min_percent: 85.0,
        achievement_max_percent: 99.9,
        bonus_amount: 600.0,
        bonus_percent: undefined,
        is_active: 'Y',
    },
    {
        achievement_min_percent: 100.0,
        achievement_max_percent: 130.0,
        bonus_amount: 1200.0,
        bonus_percent: 6.0,
        is_active: 'Y',
    },
    {
        achievement_min_percent: 80.0,
        achievement_max_percent: 100.0,
        bonus_amount: undefined,
        bonus_percent: 2.5,
        is_active: 'Y',
    },
    {
        achievement_min_percent: 100.1,
        achievement_max_percent: 140.0,
        bonus_amount: 800.0,
        bonus_percent: 4.0,
        is_active: 'Y',
    },
    {
        achievement_min_percent: 90.0,
        achievement_max_percent: 110.0,
        bonus_amount: 750.0,
        bonus_percent: undefined,
        is_active: 'Y',
    },
    {
        achievement_min_percent: 110.1,
        achievement_max_percent: 160.0,
        bonus_amount: 1800.0,
        bonus_percent: 8.0,
        is_active: 'Y',
    },
    {
        achievement_min_percent: 80.0,
        achievement_max_percent: 100.0,
        bonus_amount: undefined,
        bonus_percent: 2.0,
        is_active: 'Y',
    },
    {
        achievement_min_percent: 100.1,
        achievement_max_percent: 130.0,
        bonus_amount: 400.0,
        bonus_percent: 3.5,
        is_active: 'Y',
    },
    {
        achievement_min_percent: 85.0,
        achievement_max_percent: 99.9,
        bonus_amount: 450.0,
        bonus_percent: undefined,
        is_active: 'Y',
    },
    {
        achievement_min_percent: 100.0,
        achievement_max_percent: 125.0,
        bonus_amount: 900.0,
        bonus_percent: 4.5,
        is_active: 'Y',
    },
    {
        achievement_min_percent: 80.0,
        achievement_max_percent: 100.0,
        bonus_amount: undefined,
        bonus_percent: 2.0,
        is_active: 'Y',
    },
    {
        achievement_min_percent: 100.1,
        achievement_max_percent: 135.0,
        bonus_amount: 600.0,
        bonus_percent: 3.0,
        is_active: 'Y',
    },
    {
        achievement_min_percent: 95.0,
        achievement_max_percent: 110.0,
        bonus_amount: 2000.0,
        bonus_percent: undefined,
        is_active: 'Y',
    },
    {
        achievement_min_percent: 110.1,
        achievement_max_percent: 200.0,
        bonus_amount: 5000.0,
        bonus_percent: 10.0,
        is_active: 'Y',
    },
    {
        achievement_min_percent: 90.0,
        achievement_max_percent: 110.0,
        bonus_amount: undefined,
        bonus_percent: 4.0,
        is_active: 'Y',
    },
    {
        achievement_min_percent: 110.1,
        achievement_max_percent: 150.0,
        bonus_amount: 1500.0,
        bonus_percent: 6.0,
        is_active: 'Y',
    },
    {
        achievement_min_percent: 100.0,
        achievement_max_percent: 120.0,
        bonus_amount: 3000.0,
        bonus_percent: undefined,
        is_active: 'Y',
    },
    {
        achievement_min_percent: 120.1,
        achievement_max_percent: 200.0,
        bonus_amount: 8000.0,
        bonus_percent: 12.0,
        is_active: 'Y',
    },
    {
        achievement_min_percent: 95.0,
        achievement_max_percent: 115.0,
        bonus_amount: undefined,
        bonus_percent: 5.0,
        is_active: 'Y',
    },
    {
        achievement_min_percent: 115.1,
        achievement_max_percent: 180.0,
        bonus_amount: 2000.0,
        bonus_percent: 7.5,
        is_active: 'Y',
    },
    {
        achievement_min_percent: 80.0,
        achievement_max_percent: 100.0,
        bonus_amount: 300.0,
        bonus_percent: undefined,
        is_active: 'Y',
    },
    {
        achievement_min_percent: 100.1,
        achievement_max_percent: 130.0,
        bonus_amount: 600.0,
        bonus_percent: 3.0,
        is_active: 'Y',
    },
    {
        achievement_min_percent: 85.0,
        achievement_max_percent: 105.0,
        bonus_amount: undefined,
        bonus_percent: 2.5,
        is_active: 'Y',
    },
    {
        achievement_min_percent: 105.1,
        achievement_max_percent: 140.0,
        bonus_amount: 500.0,
        bonus_percent: 3.5,
        is_active: 'Y',
    },
    {
        achievement_min_percent: 90.0,
        achievement_max_percent: 110.0,
        bonus_amount: 1000.0,
        bonus_percent: undefined,
        is_active: 'Y',
    },
    {
        achievement_min_percent: 110.1,
        achievement_max_percent: 150.0,
        bonus_amount: 2500.0,
        bonus_percent: 6.0,
        is_active: 'Y',
    },
    {
        achievement_min_percent: 95.0,
        achievement_max_percent: 115.0,
        bonus_amount: undefined,
        bonus_percent: 4.0,
        is_active: 'Y',
    },
    {
        achievement_min_percent: 115.1,
        achievement_max_percent: 170.0,
        bonus_amount: 3000.0,
        bonus_percent: 8.0,
        is_active: 'Y',
    },
    {
        achievement_min_percent: 70.0,
        achievement_max_percent: 90.0,
        bonus_amount: 200.0,
        bonus_percent: undefined,
        is_active: 'N',
    },
    {
        achievement_min_percent: 80.0,
        achievement_max_percent: 100.0,
        bonus_amount: undefined,
        bonus_percent: 1.5,
        is_active: 'N',
    },
];
exports.mockSalesBonusRules = mockSalesBonusRules;
async function seedSalesBonusRules() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endDate = new Date(today);
        endDate.setMonth(today.getMonth() + 3);
        const salesTargets = await prisma_client_1.default.sales_targets.findMany({
            select: {
                id: true,
                start_date: true,
                end_date: true,
            },
            where: {
                start_date: today,
                end_date: endDate,
            },
        });
        if (salesTargets.length === 0) {
            logger_1.default.warn('No sales targets found with matching date range. Please run sales targets seeder first.');
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
        let rulesCreated = 0;
        let rulesSkipped = 0;
        for (let i = 0; i < mockSalesBonusRules.length; i++) {
            const rule = mockSalesBonusRules[i];
            const salesperson = salespersons.length > 0
                ? salespersons[i % salespersons.length]
                : defaultSalesperson;
            const target = salesTargets[i % salesTargets.length];
            const existingRule = await prisma_client_1.default.sales_bonus_rules.findFirst({
                where: {
                    sales_target_id: target.id,
                    achievement_min_percent: rule.achievement_min_percent,
                    achievement_max_percent: rule.achievement_max_percent,
                },
            });
            if (!existingRule) {
                await prisma_client_1.default.sales_bonus_rules.create({
                    data: {
                        sales_target_id: target.id,
                        achievement_min_percent: rule.achievement_min_percent,
                        achievement_max_percent: rule.achievement_max_percent,
                        bonus_amount: rule.bonus_amount || null,
                        bonus_percent: rule.bonus_percent || null,
                        is_active: rule.is_active,
                        createdate: new Date(),
                        createdby: salesperson?.id || 1,
                        log_inst: 1,
                    },
                });
                rulesCreated++;
            }
            else {
                rulesSkipped++;
            }
        }
        logger_1.default.info(`Sales bonus rules seeding completed: ${rulesCreated} created, ${rulesSkipped} skipped`);
    }
    catch (error) {
        logger_1.default.error('Error seeding sales bonus rules:', error);
        throw error;
    }
}
async function clearSalesBonusRules() {
    try {
        await prisma_client_1.default.sales_bonus_rules.deleteMany({});
    }
    catch (error) {
        throw error;
    }
}
//# sourceMappingURL=salesBonusRules.seeder.js.map