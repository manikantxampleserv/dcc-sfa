"use strict";
/**
 * @fileoverview Unit of Measurement Seeder
 * @description Creates 11 sample units of measurement for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockUnitOfMeasurements = void 0;
exports.seedUnitOfMeasurement = seedUnitOfMeasurement;
exports.clearUnitOfMeasurement = clearUnitOfMeasurement;
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
// Mock Unit of Measurement Data (11 units)
const mockUnitOfMeasurements = [
    {
        name: 'Case',
        description: 'Case of products',
        category: 'Container',
        symbol: 'case',
        is_active: 'Y',
    },
    {
        name: 'Bottle',
        description: 'Container for liquids',
        category: 'Container',
        symbol: 'bottle',
        is_active: 'Y',
    },
    {
        name: 'Liter',
        description: 'Unit of volume measurement',
        category: 'Volume',
        symbol: 'L',
        is_active: 'Y',
    },
];
exports.mockUnitOfMeasurements = mockUnitOfMeasurements;
/**
 * Seed Unit of Measurement with mock data
 */
async function seedUnitOfMeasurement() {
    try {
        for (const unit of mockUnitOfMeasurements) {
            const existingUnit = await prisma_client_1.default.unit_of_measurement.findFirst({
                where: { name: unit.name },
            });
            if (!existingUnit) {
                await prisma_client_1.default.unit_of_measurement.create({
                    data: {
                        name: unit.name,
                        description: unit.description,
                        category: unit.category,
                        symbol: unit.symbol,
                        is_active: unit.is_active,
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
 * Clear Unit of Measurement data
 */
async function clearUnitOfMeasurement() {
    try {
        await prisma_client_1.default.unit_of_measurement.deleteMany({});
    }
    catch (error) {
        throw error;
    }
}
//# sourceMappingURL=unitOfMeasurement.seeder.js.map