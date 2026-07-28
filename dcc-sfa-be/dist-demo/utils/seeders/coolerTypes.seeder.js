"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockCoolerTypes = void 0;
exports.seedCoolerTypes = seedCoolerTypes;
exports.clearCoolerTypes = clearCoolerTypes;
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const mockCoolerTypes = [
    {
        name: 'COOLER',
        code: 'CT-COOL',
        is_active: 'Y',
    },
    {
        name: 'WATER DISPENSER',
        code: 'CT-WD',
        is_active: 'Y',
    },
];
exports.mockCoolerTypes = mockCoolerTypes;
async function seedCoolerTypes() {
    try {
        for (const coolerType of mockCoolerTypes) {
            const existingCoolerType = await prisma_client_1.default.cooler_types.findFirst({
                where: { name: coolerType.name },
            });
            if (!existingCoolerType) {
                await prisma_client_1.default.cooler_types.create({
                    data: {
                        name: coolerType.name,
                        code: coolerType.code,
                        is_active: coolerType.is_active,
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
async function clearCoolerTypes() {
    try {
        await prisma_client_1.default.cooler_types.deleteMany({});
    }
    catch (error) {
        throw error;
    }
}
//# sourceMappingURL=coolerTypes.seeder.js.map