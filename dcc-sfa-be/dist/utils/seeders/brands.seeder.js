"use strict";
/**
 * @fileoverview Brands Seeder
 * @description Creates brands for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockBrands = void 0;
exports.seedBrands = seedBrands;
exports.clearBrands = clearBrands;
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const mockBrands = [
    {
        name: 'COKE',
        code: 'COKE',
        description: 'Coca-Cola brand products',
        is_active: 'Y',
    },
    {
        name: 'FANTA',
        code: 'FANTA',
        description: 'Fanta brand products',
        is_active: 'Y',
    },
    {
        name: 'SPRITE',
        code: 'SPRITE',
        description: 'Sprite brand products',
        is_active: 'Y',
    },
    {
        name: 'STONEY',
        code: 'STONEY',
        description: 'Stoney brand products',
        is_active: 'Y',
    },
    {
        name: 'SPARLETTA',
        code: 'SPARLETTA',
        description: 'Sparletta brand products',
        is_active: 'Y',
    },
    {
        name: 'KREST',
        code: 'KREST',
        description: 'Krest brand products',
        is_active: 'Y',
    },
    {
        name: 'NOVIDA',
        code: 'NOVIDA',
        description: 'Novida brand products',
        is_active: 'Y',
    },
    {
        name: 'KILIMANJARO',
        code: 'KILIMANJARO',
        description: 'Kilimanjaro brand products',
        is_active: 'Y',
    },
];
exports.mockBrands = mockBrands;
/**
 * Seed Brands with mock data
 */
async function seedBrands() {
    try {
        for (const brand of mockBrands) {
            const existingBrand = await prisma_client_1.default.brands.findFirst({
                where: { name: brand.name },
            });
            if (!existingBrand) {
                await prisma_client_1.default.brands.create({
                    data: {
                        name: brand.name,
                        code: brand.code,
                        description: brand.description,
                        logo: brand.logo,
                        is_active: brand.is_active,
                        createdate: new Date(),
                        createdby: 1,
                        log_inst: 1,
                    },
                });
            }
        }
    }
    catch (error) {
        throw error;
    }
}
/**
 * Clear Brands data
 */
async function clearBrands() {
    try {
        await prisma_client_1.default.brands.deleteMany({});
    }
    catch (error) {
        if (error?.code === 'P2003' ||
            error?.message?.includes('Foreign key constraint')) {
            console.warn('⚠️  Could not clear all brands due to foreign key constraints. Some records may be in use by products.');
        }
        else {
            throw error;
        }
    }
}
//# sourceMappingURL=brands.seeder.js.map