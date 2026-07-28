"use strict";
/**
 * @fileoverview Warehouses Seeder
 * @description Creates 11 sample warehouses for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockWarehouses = void 0;
exports.seedWarehouses = seedWarehouses;
exports.clearWarehouses = clearWarehouses;
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
// Mock Warehouses Data (11 warehouses)
const mockWarehouses = [
    {
        name: 'Main Warehouse - North',
        type: 'General',
        location: 'New York, NY',
        is_active: 'Y',
    },
    {
        name: 'Secondary Warehouse - South',
        type: 'General',
        location: 'Atlanta, GA',
        is_active: 'Y',
    },
    {
        name: 'Cold Storage Facility',
        type: 'Cold Storage',
        location: 'Chicago, IL',
        is_active: 'Y',
    },
    {
        name: 'Cross-Dock Warehouse',
        type: 'Cross-Dock',
        location: 'Los Angeles, CA',
        is_active: 'Y',
    },
    {
        name: 'Bulk Storage Warehouse',
        type: 'Bulk Storage',
        location: 'Houston, TX',
        is_active: 'Y',
    },
    {
        name: 'Express Distribution Center',
        type: 'Express',
        location: 'Miami, FL',
        is_active: 'Y',
    },
    {
        name: 'Regional Sorting Hub',
        type: 'Sorting',
        location: 'Denver, CO',
        is_active: 'Y',
    },
    {
        name: 'Hazmat Storage Facility',
        type: 'Hazmat',
        location: 'Phoenix, AZ',
        is_active: 'Y',
    },
    {
        name: 'Automated Warehouse',
        type: 'Automated',
        location: 'Seattle, WA',
        is_active: 'Y',
    },
    {
        name: 'Seasonal Storage',
        type: 'Seasonal',
        location: 'Minneapolis, MN',
        is_active: 'Y',
    },
    {
        name: 'Decommissioned Warehouse',
        type: 'Closed',
        location: 'Cleveland, OH',
        is_active: 'N',
    },
];
exports.mockWarehouses = mockWarehouses;
/**
 * Seed Warehouses with mock data
 */
async function seedWarehouses() {
    try {
        for (const warehouse of mockWarehouses) {
            const existingWarehouse = await prisma_client_1.default.warehouses.findFirst({
                where: { name: warehouse.name },
            });
            if (!existingWarehouse) {
                await prisma_client_1.default.warehouses.create({
                    data: {
                        name: warehouse.name,
                        type: warehouse.type,
                        location: warehouse.location,
                        is_active: warehouse.is_active,
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
 * Clear Warehouses data
 */
async function clearWarehouses() {
    try {
        await prisma_client_1.default.warehouses.deleteMany({});
    }
    catch (error) {
        throw error;
    }
}
//# sourceMappingURL=warehouses.seeder.js.map