"use strict";
/**
 * @fileoverview Zones Seeder
 * @description Creates 11 sample zones for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockZones = void 0;
exports.seedZones = seedZones;
exports.clearZones = clearZones;
const logger_1 = __importDefault(require("../../configs/logger"));
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
// Mock Zones Data (11 zones)
const mockZones = [
    {
        name: 'North Zone A',
        code: 'NZ-A-001',
        description: 'Northern region zone A for sales coverage',
        parent_id: 1,
        depot_id: undefined,
        supervisor_id: undefined,
        is_active: 'Y',
    },
    {
        name: 'North Zone B',
        code: 'NZ-B-002',
        description: 'Northern region zone B for sales coverage',
        parent_id: 1,
        depot_id: undefined,
        supervisor_id: undefined,
        is_active: 'Y',
    },
    {
        name: 'South Zone A',
        code: 'SZ-A-003',
        description: 'Southern region zone A for sales coverage',
        parent_id: 2,
        depot_id: undefined,
        supervisor_id: undefined,
        is_active: 'Y',
    },
    {
        name: 'South Zone B',
        code: 'SZ-B-004',
        description: 'Southern region zone B for sales coverage',
        parent_id: 2,
        depot_id: undefined,
        supervisor_id: undefined,
        is_active: 'Y',
    },
    {
        name: 'West Zone A',
        code: 'WZ-A-005',
        description: 'Western region zone A for sales coverage',
        parent_id: 3,
        depot_id: undefined,
        supervisor_id: undefined,
        is_active: 'Y',
    },
    {
        name: 'West Zone B',
        code: 'WZ-B-006',
        description: 'Western region zone B for sales coverage',
        parent_id: 3,
        depot_id: undefined,
        supervisor_id: undefined,
        is_active: 'Y',
    },
    {
        name: 'Central Zone A',
        code: 'CZ-A-007',
        description: 'Central region zone A for sales coverage',
        parent_id: 4,
        depot_id: undefined,
        supervisor_id: undefined,
        is_active: 'Y',
    },
    {
        name: 'Central Zone B',
        code: 'CZ-B-008',
        description: 'Central region zone B for sales coverage',
        parent_id: 4,
        depot_id: undefined,
        supervisor_id: undefined,
        is_active: 'Y',
    },
    {
        name: 'East Zone A',
        code: 'EZ-A-009',
        description: 'Eastern region zone A for sales coverage',
        parent_id: 5,
        depot_id: undefined,
        supervisor_id: undefined,
        is_active: 'Y',
    },
    {
        name: 'East Zone B',
        code: 'EZ-B-010',
        description: 'Eastern region zone B for sales coverage',
        parent_id: 5,
        depot_id: undefined,
        supervisor_id: undefined,
        is_active: 'Y',
    },
    {
        name: 'Inactive Zone',
        code: 'IZ-011',
        description: 'Decommissioned zone for historical data',
        parent_id: 6,
        depot_id: undefined,
        supervisor_id: undefined,
        is_active: 'N',
    },
];
exports.mockZones = mockZones;
/**
 * Seed Zones with mock data
 */
async function seedZones() {
    try {
        // Get available companies for parent_id
        const companies = await prisma_client_1.default.companies.findMany({
            select: { id: true, name: true },
            where: { is_active: 'Y' },
        });
        if (companies.length === 0) {
            logger_1.default.warn('No active companies found. Skipping zones seeding.');
            return;
        }
        // Use the first company for all zones
        const company = companies[0];
        let zonesCreated = 0;
        let zonesSkipped = 0;
        for (const zone of mockZones) {
            const existingZone = await prisma_client_1.default.zones.findFirst({
                where: { name: zone.name },
            });
            if (!existingZone) {
                await prisma_client_1.default.zones.create({
                    data: {
                        name: zone.name,
                        code: zone.code,
                        description: zone.description,
                        parent_id: company.id, // Use actual company ID instead of hardcoded
                        depot_id: zone.depot_id,
                        supervisor_id: zone.supervisor_id,
                        is_active: zone.is_active,
                        createdate: new Date(),
                        createdby: 1,
                        log_inst: 1,
                    },
                });
                zonesCreated++;
            }
            else {
                zonesSkipped++;
            }
        }
        logger_1.default.info(`Zones seeding completed: ${zonesCreated} created, ${zonesSkipped} skipped`);
    }
    catch (error) {
        logger_1.default.error('Error seeding zones:', error);
        throw error;
    }
}
/**
 * Clear Zones data
 */
async function clearZones() {
    try {
        await prisma_client_1.default.zones.deleteMany({});
    }
    catch (error) {
        throw error;
    }
}
//# sourceMappingURL=zones.seeder.js.map