"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockProductVolumes = void 0;
exports.seedProductVolumes = seedProductVolumes;
exports.clearProductVolumes = clearProductVolumes;
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const mockProductVolumes = [
    { name: '350ML', code: 'VOL-350ML-001', is_active: 'Y' },
    { name: '300ML', code: 'VOL-300ML-001', is_active: 'Y' },
    { name: '250ML', code: 'VOL-250ML-001', is_active: 'Y' },
    { name: '0.5LTR', code: 'VOL-05L-001', is_active: 'Y' },
    { name: '1.5LTR', code: 'VOL-15L-001', is_active: 'Y' },
    { name: '6 Ltr', code: 'VOL-6L-001', is_active: 'Y' },
    { name: '12 Ltr', code: 'VOL-12L-001', is_active: 'Y' },
    { name: '18.9 Ltr', code: 'VOL-189L-001', is_active: 'Y' },
    { name: '1.0LTR', code: 'VOL-1L-001', is_active: 'Y' },
    { name: '500ML', code: 'VOL-500ML-001', is_active: 'Y' },
    { name: '1250ML', code: 'VOL-1250ML-001', is_active: 'Y' },
];
exports.mockProductVolumes = mockProductVolumes;
async function seedProductVolumes() {
    try {
        for (const volume of mockProductVolumes) {
            const existingVolume = await prisma_client_1.default.product_volumes.findFirst({
                where: { name: volume.name },
            });
            if (!existingVolume) {
                await prisma_client_1.default.product_volumes.create({
                    data: {
                        name: volume.name,
                        code: volume.code,
                        is_active: volume.is_active,
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
async function clearProductVolumes() {
    try {
        await prisma_client_1.default.product_volumes.deleteMany({});
    }
    catch (error) {
        if (error?.code === 'P2003' ||
            error?.message?.includes('Foreign key constraint')) {
            console.warn('⚠️  Could not clear all product volumes due to foreign key constraints. Some records may be in use by products.');
        }
        else {
            throw error;
        }
    }
}
//# sourceMappingURL=productVolumes.seeder.js.map