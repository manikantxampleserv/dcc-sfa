"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockProductWebOrders = void 0;
exports.seedProductWebOrders = seedProductWebOrders;
exports.clearProductWebOrders = clearProductWebOrders;
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const mockProductWebOrders = [
    { name: 'RGB', code: 'WO-RGB', is_active: 'Y' },
    { name: 'PET', code: 'WO-PET', is_active: 'Y' },
    { name: 'KDW', code: 'WO-KDW', is_active: 'Y' },
    { name: 'JUICE', code: 'WO-JUICE', is_active: 'Y' },
];
exports.mockProductWebOrders = mockProductWebOrders;
async function seedProductWebOrders() {
    try {
        for (const webOrder of mockProductWebOrders) {
            const existingWebOrder = await prisma_client_1.default.product_web_order.findFirst({
                where: { name: webOrder.name },
            });
            if (!existingWebOrder) {
                await prisma_client_1.default.product_web_order.create({
                    data: {
                        name: webOrder.name,
                        code: webOrder.code,
                        is_active: webOrder.is_active,
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
async function clearProductWebOrders() {
    try {
        await prisma_client_1.default.product_web_order.deleteMany({});
    }
    catch (error) {
        if (error?.code === 'P2003' ||
            error?.message?.includes('Foreign key constraint')) {
            console.warn('⚠️  Could not clear all product web orders due to foreign key constraints. Some records may be in use by products.');
        }
        else {
            throw error;
        }
    }
}
//# sourceMappingURL=productWebOrders.seeder.js.map