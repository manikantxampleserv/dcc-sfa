"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockProductTargetGroups = void 0;
exports.seedProductTargetGroups = seedProductTargetGroups;
exports.clearProductTargetGroups = clearProductTargetGroups;
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const mockProductTargetGroups = [
    { name: 'BULK WATER 18.9L', code: 'TG-BW-189', is_active: 'Y' },
    { name: 'BULK WATER 12 L', code: 'TG-BW-12', is_active: 'Y' },
    { name: 'BULK WATER 6 LTR', code: 'TG-BW-6', is_active: 'Y' },
    { name: 'JUICE 1 Ltr', code: 'TG-JUICE-1L', is_active: 'Y' },
    { name: 'JUICE 1250ML', code: 'TG-JUICE-1250', is_active: 'Y' },
    { name: 'JUICE 400ML', code: 'TG-JUICE-400', is_active: 'Y' },
    { name: 'KDW 1.0L', code: 'TG-KDW-1L', is_active: 'Y' },
    { name: 'KDW 1.5L', code: 'TG-KDW-15L', is_active: 'Y' },
    { name: 'KDW 500ML', code: 'TG-KDW-500', is_active: 'Y' },
    { name: 'PET 1.25L', code: 'TG-PET-125', is_active: 'Y' },
    { name: 'PET 300ML', code: 'TG-PET-300', is_active: 'Y' },
    { name: 'PET 500ML', code: 'TG-PET-500', is_active: 'Y' },
    { name: 'RGB', code: 'TG-RGB', is_active: 'Y' },
];
exports.mockProductTargetGroups = mockProductTargetGroups;
async function seedProductTargetGroups() {
    try {
        for (const targetGroup of mockProductTargetGroups) {
            const existingTargetGroup = await prisma_client_1.default.product_target_group.findFirst({
                where: { name: targetGroup.name },
            });
            if (!existingTargetGroup) {
                await prisma_client_1.default.product_target_group.create({
                    data: {
                        name: targetGroup.name,
                        code: targetGroup.code,
                        is_active: targetGroup.is_active,
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
async function clearProductTargetGroups() {
    try {
        await prisma_client_1.default.product_target_group.deleteMany({});
    }
    catch (error) {
        if (error?.code === 'P2003' ||
            error?.message?.includes('Foreign key constraint')) {
            console.warn('⚠️  Could not clear all product target groups due to foreign key constraints. Some records may be in use by products.');
        }
        else {
            throw error;
        }
    }
}
//# sourceMappingURL=productTargetGroups.seeder.js.map