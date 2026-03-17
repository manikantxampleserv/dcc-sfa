"use strict";
/**
 * @fileoverview Product Categories Seeder
 * @description Creates product categories for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockProductCategories = void 0;
exports.seedProductCategories = seedProductCategories;
exports.clearProductCategories = clearProductCategories;
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const mockProductCategories = [
    {
        category_name: 'JUICE',
        description: 'Juice products and beverages',
        is_active: 'Y',
    },
    {
        category_name: 'KDW',
        description: 'KDW category products',
        is_active: 'Y',
    },
    {
        category_name: 'OTHER',
        description: 'Other miscellaneous products',
        is_active: 'Y',
    },
    {
        category_name: 'PET',
        description: 'PET bottles and containers',
        is_active: 'Y',
    },
    {
        category_name: 'RGB',
        description: 'RGB category products',
        is_active: 'Y',
    },
];
exports.mockProductCategories = mockProductCategories;
/**
 * Seed Product Categories with mock data
 */
async function seedProductCategories() {
    try {
        for (const category of mockProductCategories) {
            const existingCategory = await prisma_client_1.default.product_categories.findFirst({
                where: { category_name: category.category_name },
            });
            if (!existingCategory) {
                await prisma_client_1.default.product_categories.create({
                    data: {
                        category_name: category.category_name,
                        description: category.description,
                        is_active: category.is_active,
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
 * Clear Product Categories data
 */
async function clearProductCategories() {
    try {
        await prisma_client_1.default.product_categories.deleteMany({});
    }
    catch (error) {
        if (error?.code === 'P2003' ||
            error?.message?.includes('Foreign key constraint')) {
            console.warn('⚠️  Could not clear all product categories due to foreign key constraints. Some records may be in use by products.');
        }
        else {
            throw error;
        }
    }
}
//# sourceMappingURL=productCategories.seeder.js.map