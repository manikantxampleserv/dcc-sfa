"use strict";
/**
 * @fileoverview Pricelists Seeder
 * @description Creates sample pricelists for different customer segments and regions
 * @author DCC-SFA Team
 * @version 1.0.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedPricelists = void 0;
exports.clearPricelists = clearPricelists;
const logger_1 = __importDefault(require("../../configs/logger"));
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const mockPricelists = [
    {
        name: 'Standard Retail Pricelist',
        description: 'Standard pricing for retail customers',
        valid_from: new Date('2024-01-01'),
        valid_to: new Date('2024-12-31'),
        is_active: 'Y',
    },
    {
        name: 'Wholesale Pricelist',
        description: 'Volume-based pricing for wholesale customers',
        valid_from: new Date('2024-01-01'),
        valid_to: new Date('2024-12-31'),
        is_active: 'Y',
    },
    {
        name: 'Corporate Pricelist',
        description: 'Special pricing for corporate clients',
        valid_from: new Date('2024-01-01'),
        valid_to: new Date('2024-12-31'),
        is_active: 'Y',
    },
    {
        name: 'Healthcare Pricelist',
        description: 'Specialized pricing for healthcare facilities',
        valid_from: new Date('2024-01-01'),
        valid_to: new Date('2024-12-31'),
        is_active: 'Y',
    },
    {
        name: 'Restaurant Pricelist',
        description: 'Food service industry pricing',
        valid_from: new Date('2024-01-01'),
        valid_to: new Date('2024-12-31'),
        is_active: 'Y',
    },
    {
        name: 'Manufacturing Pricelist',
        description: 'Industrial and manufacturing pricing',
        valid_from: new Date('2024-01-01'),
        valid_to: new Date('2024-12-31'),
        is_active: 'Y',
    },
    {
        name: 'Automotive Pricelist',
        description: 'Automotive industry specific pricing',
        valid_from: new Date('2024-01-01'),
        valid_to: new Date('2024-12-31'),
        is_active: 'Y',
    },
    {
        name: 'Service Provider Pricelist',
        description: 'Pricing for service companies',
        valid_from: new Date('2024-01-01'),
        valid_to: new Date('2024-12-31'),
        is_active: 'Y',
    },
    {
        name: 'Government Pricelist',
        description: 'Special pricing for government agencies',
        valid_from: new Date('2024-01-01'),
        valid_to: new Date('2024-12-31'),
        is_active: 'Y',
    },
    {
        name: 'Educational Pricelist',
        description: 'Discounted pricing for educational institutions',
        valid_from: new Date('2024-01-01'),
        valid_to: new Date('2024-12-31'),
        is_active: 'Y',
    },
    {
        name: 'Non-Profit Pricelist',
        description: 'Special pricing for non-profit organizations',
        valid_from: new Date('2024-01-01'),
        valid_to: new Date('2024-12-31'),
        is_active: 'Y',
    },
    {
        name: 'International Pricelist',
        description: 'Export pricing for international customers',
        valid_from: new Date('2024-01-01'),
        valid_to: new Date('2024-12-31'),
        is_active: 'Y',
    },
    {
        name: 'Startup Pricelist',
        description: 'Introductory pricing for startups',
        valid_from: new Date('2024-01-01'),
        valid_to: new Date('2024-12-31'),
        is_active: 'Y',
    },
    {
        name: 'E-commerce Pricelist',
        description: 'Dynamic pricing for online retailers',
        valid_from: new Date('2024-01-01'),
        valid_to: new Date('2024-12-31'),
        is_active: 'Y',
    },
    {
        name: 'Franchise Pricelist',
        description: 'Standardized pricing for franchises',
        valid_from: new Date('2024-01-01'),
        valid_to: new Date('2024-12-31'),
        is_active: 'Y',
    },
];
const seedPricelists = async () => {
    try {
        logger_1.default.info('Starting Pricelists seeding...');
        // Get a default user for createdby
        const defaultUser = await prisma_client_1.default.users.findFirst({
            where: { is_active: 'Y' },
            select: { id: true },
        });
        if (!defaultUser) {
            logger_1.default.warn('No active users found. Skipping Pricelists seeding.');
            return;
        }
        let createdCount = 0;
        for (const pl of mockPricelists) {
            const existing = await prisma_client_1.default.pricelists.findFirst({
                where: { name: pl.name },
            });
            if (!existing) {
                await prisma_client_1.default.pricelists.create({
                    data: {
                        ...pl,
                        createdby: defaultUser.id,
                        log_inst: 1,
                    },
                });
                createdCount++;
            }
        }
        logger_1.default.info(`Successfully seeded ${createdCount} new Pricelists.`);
    }
    catch (error) {
        logger_1.default.error('Error seeding Pricelists:', error);
        throw error;
    }
};
exports.seedPricelists = seedPricelists;
/**
 * Clear Pricelists data
 */
async function clearPricelists() {
    try {
        await prisma_client_1.default.pricelists.deleteMany({});
    }
    catch (error) {
        throw error;
    }
}
//# sourceMappingURL=pricelists.seeder.js.map