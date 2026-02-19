"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockProductFlavours = void 0;
exports.seedProductFlavours = seedProductFlavours;
exports.clearProductFlavours = clearProductFlavours;
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const mockProductFlavours = [
    { name: 'COKE', code: 'FLAV-COKE', is_active: 'Y' },
    { name: 'FANTA ORANGE', code: 'FLAV-FAN-ORA', is_active: 'Y' },
    { name: 'FANTA PASSION', code: 'FLAV-FAN-PAS', is_active: 'Y' },
    { name: 'FANTA PINE APPLE', code: 'FLAV-FAN-PIN', is_active: 'Y' },
    { name: 'FANTA FRUIT BLAS', code: 'FLAV-FAN-FRU', is_active: 'Y' },
    { name: 'SPRITE', code: 'FLAV-SPR', is_active: 'Y' },
    { name: 'STONEY TANGAWIZI', code: 'FLAV-STO-TAN', is_active: 'Y' },
    { name: 'SPARLETTA PINE A', code: 'FLAV-SPA-PIN', is_active: 'Y' },
    { name: 'BITTER LEMON', code: 'FLAV-BIT-LEM', is_active: 'Y' },
    { name: 'CLUB SODA', code: 'FLAV-CLU-SOD', is_active: 'Y' },
    { name: 'TONIC WATER', code: 'FLAV-TON-WAT', is_active: 'Y' },
    { name: 'GINGER ALE', code: 'FLAV-GIN-ALE', is_active: 'Y' },
    { name: 'COKE ZERO', code: 'FLAV-COK-ZER', is_active: 'Y' },
    { name: 'NOVIDA', code: 'FLAV-NOV', is_active: 'Y' },
    { name: 'RED APPLE', code: 'FLAV-RED-APP', is_active: 'Y' },
    { name: 'KDW500', code: 'FLAV-KDW-500', is_active: 'Y' },
    { name: 'KDW1500', code: 'FLAV-KDW-1500', is_active: 'Y' },
    { name: 'KDW 6 Ltr', code: 'FLAV-KDW-6L', is_active: 'Y' },
    { name: 'KDW 12 Ltr', code: 'FLAV-KDW-12L', is_active: 'Y' },
    { name: 'KDW 18.9 Ltr', code: 'FLAV-KDW-189L', is_active: 'Y' },
    { name: 'KDW1000', code: 'FLAV-KDW-1000', is_active: 'Y' },
    { name: 'SPRITE ZERO', code: 'FLAV-SPR-ZER', is_active: 'Y' },
    { name: 'FANTA ZERO', code: 'FLAV-FAN-ZER', is_active: 'Y' },
    { name: 'RETURNABLE', code: 'FLAV-RET', is_active: 'Y' },
];
exports.mockProductFlavours = mockProductFlavours;
async function seedProductFlavours() {
    try {
        for (const flavour of mockProductFlavours) {
            const existingFlavour = await prisma_client_1.default.product_flavours.findFirst({
                where: { name: flavour.name },
            });
            if (!existingFlavour) {
                await prisma_client_1.default.product_flavours.create({
                    data: {
                        name: flavour.name,
                        code: flavour.code,
                        is_active: flavour.is_active,
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
async function clearProductFlavours() {
    try {
        await prisma_client_1.default.product_flavours.deleteMany({});
    }
    catch (error) {
        if (error?.code === 'P2003' ||
            error?.message?.includes('Foreign key constraint')) {
            console.warn('⚠️  Could not clear all product flavours due to foreign key constraints. Some records may be in use by products.');
        }
        else {
            throw error;
        }
    }
}
//# sourceMappingURL=productFlavours.seeder.js.map