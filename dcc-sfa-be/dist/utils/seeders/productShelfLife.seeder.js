"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockProductShelfLife = void 0;
exports.seedProductShelfLife = seedProductShelfLife;
exports.clearProductShelfLife = clearProductShelfLife;
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const mockProductShelfLife = [
    { name: '112 Days', code: 'SHELF-112D-001', is_active: 'Y' },
    { name: '180 Days', code: 'SHELF-180D-001', is_active: 'Y' },
    { name: '365 Days', code: 'SHELF-365D-001', is_active: 'Y' },
    { name: '84 Days', code: 'SHELF-84D-001', is_active: 'Y' },
    { name: '90 Days', code: 'SHELF-90D-001', is_active: 'Y' },
];
exports.mockProductShelfLife = mockProductShelfLife;
async function seedProductShelfLife() {
    try {
        for (const shelfLife of mockProductShelfLife) {
            const existingShelfLife = await prisma_client_1.default.product_shelf_life.findFirst({
                where: { name: shelfLife.name },
            });
            if (!existingShelfLife) {
                await prisma_client_1.default.product_shelf_life.create({
                    data: {
                        name: shelfLife.name,
                        code: shelfLife.code,
                        is_active: shelfLife.is_active,
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
async function clearProductShelfLife() {
    try {
        await prisma_client_1.default.product_shelf_life.deleteMany({});
    }
    catch (error) {
        if (error?.code === 'P2003' ||
            error?.message?.includes('Foreign key constraint')) {
            console.warn('⚠️  Could not clear all product shelf life records due to foreign key constraints. Some records may be in use by products.');
        }
        else {
            throw error;
        }
    }
}
//# sourceMappingURL=productShelfLife.seeder.js.map