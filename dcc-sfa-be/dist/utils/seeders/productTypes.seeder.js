"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockProductTypes = void 0;
exports.seedProductTypes = seedProductTypes;
exports.clearProductTypes = clearProductTypes;
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const mockProductTypes = [
    { name: 'Commercial Product', code: 'PROD-COMM', is_active: 'Y' },
    { name: 'Deposit Product', code: 'PROD-DEP', is_active: 'Y' },
    { name: 'Promotional Product', code: 'PROD-PROMO', is_active: 'Y' },
    { name: 'Rival Product', code: 'PROD-RIVAL', is_active: 'Y' },
    { name: 'Service Product', code: 'PROD-SERV', is_active: 'Y' },
];
exports.mockProductTypes = mockProductTypes;
async function seedProductTypes() {
    try {
        for (const productType of mockProductTypes) {
            const existingProductType = await prisma_client_1.default.product_type.findFirst({
                where: { name: productType.name },
            });
            if (!existingProductType) {
                await prisma_client_1.default.product_type.create({
                    data: {
                        name: productType.name,
                        code: productType.code,
                        is_active: productType.is_active,
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
async function clearProductTypes() {
    try {
        await prisma_client_1.default.product_type.deleteMany({});
    }
    catch (error) {
        if (error?.code === 'P2003' ||
            error?.message?.includes('Foreign key constraint')) {
            console.warn('⚠️  Could not clear all product types due to foreign key constraints. Some records may be in use by products.');
        }
        else {
            throw error;
        }
    }
}
//# sourceMappingURL=productTypes.seeder.js.map