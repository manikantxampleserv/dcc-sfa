"use strict";
/**
 * @fileoverview Customer Category Seeder
 * @description Creates customer categories for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockCustomerCategories = void 0;
exports.seedCustomerCategory = seedCustomerCategory;
exports.clearCustomerCategory = clearCustomerCategory;
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const mockCustomerCategories = [
    {
        category_name: 'Bronze',
        category_code: 'CC-BRONZE',
        is_active: 'Y',
    },
    {
        category_name: 'Silver',
        category_code: 'CC-SILVER',
        is_active: 'Y',
    },
    {
        category_name: 'Gold',
        category_code: 'CC-GOLD',
        is_active: 'Y',
    },
    {
        category_name: 'Diamond',
        category_code: 'CC-DIAMOND',
        is_active: 'Y',
    },
    {
        category_name: 'Platinum',
        category_code: 'CC-PLATINUM',
        is_active: 'Y',
    },
];
exports.mockCustomerCategories = mockCustomerCategories;
async function seedCustomerCategory() {
    try {
        for (const category of mockCustomerCategories) {
            const existingCategory = await prisma_client_1.default.customer_category.findFirst({
                where: { category_name: category.category_name },
            });
            if (!existingCategory) {
                await prisma_client_1.default.customer_category.create({
                    data: {
                        category_name: category.category_name,
                        category_code: category.category_code,
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
async function clearCustomerCategory() {
    try {
        await prisma_client_1.default.customer_category.deleteMany({});
    }
    catch (error) {
        if (error?.code === 'P2003' ||
            error?.message?.includes('Foreign key constraint')) {
            console.warn('⚠️  Could not clear all customer categories due to foreign key constraints. Some records may be in use by customers.');
        }
        else {
            throw error;
        }
    }
}
//# sourceMappingURL=customerCategory.seeder.js.map