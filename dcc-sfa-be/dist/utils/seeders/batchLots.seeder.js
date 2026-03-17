"use strict";
/**
 * @fileoverview Batch Lots Seeder
 * @description Creates sample batch lots for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockBatchLots = void 0;
exports.seedBatchLots = seedBatchLots;
exports.clearBatchLots = clearBatchLots;
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const mockBatchLots = [
    {
        batch_number: 'BATCH001',
        lot_number: 'LOT001',
        manufacturing_date: new Date('2024-01-15'),
        expiry_date: new Date('2025-01-15'),
        quantity: 1000,
        remaining_quantity: 850,
        supplier_name: 'ABC Suppliers Ltd.',
        purchase_price: 50.0,
        quality_grade: 'A',
        storage_location: 'Warehouse A - Section 1',
        is_active: 'Y',
    },
    {
        batch_number: 'BATCH002',
        lot_number: 'LOT002',
        manufacturing_date: new Date('2024-03-20'),
        expiry_date: new Date('2025-03-20'),
        quantity: 500,
        remaining_quantity: 500,
        supplier_name: 'ABC Suppliers Ltd.',
        purchase_price: 52.5,
        quality_grade: 'A',
        storage_location: 'Warehouse A - Section 2',
        is_active: 'Y',
    },
    {
        batch_number: 'BATCH003',
        lot_number: 'LOT003',
        manufacturing_date: new Date('2024-02-10'),
        expiry_date: new Date('2024-12-31'),
        quantity: 200,
        remaining_quantity: 150,
        supplier_name: 'XYZ Distributors',
        purchase_price: 75.0,
        quality_grade: 'B',
        storage_location: 'Warehouse B - Section 1',
        is_active: 'Y',
    },
    {
        batch_number: 'BATCH004',
        lot_number: 'LOT004',
        manufacturing_date: new Date('2023-11-05'),
        expiry_date: new Date('2024-11-05'),
        quantity: 300,
        remaining_quantity: 50,
        supplier_name: 'XYZ Distributors',
        purchase_price: 70.0,
        quality_grade: 'C',
        storage_location: 'Warehouse B - Section 2',
        is_active: 'Y',
    },
    {
        batch_number: 'BATCH005',
        lot_number: 'LOT005',
        manufacturing_date: new Date('2024-06-01'),
        expiry_date: new Date('2026-06-01'),
        quantity: 1500,
        remaining_quantity: 1500,
        supplier_name: 'Global Traders Inc.',
        purchase_price: 45.0,
        quality_grade: 'A',
        storage_location: 'Warehouse C - Section 1',
        is_active: 'Y',
    },
];
exports.mockBatchLots = mockBatchLots;
/**
 * Seed Batch Lots with mock data
 */
async function seedBatchLots() {
    try {
        for (const batchLot of mockBatchLots) {
            const existingBatchLot = await prisma_client_1.default.batch_lots.findFirst({
                where: {
                    batch_number: batchLot.batch_number,
                },
            });
            if (!existingBatchLot) {
                await prisma_client_1.default.batch_lots.create({
                    data: {
                        ...batchLot,
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
 * Clear Batch Lots data
 */
async function clearBatchLots() {
    try {
        await prisma_client_1.default.batch_lots.deleteMany({});
    }
    catch (error) {
        throw error;
    }
}
//# sourceMappingURL=batchLots.seeder.js.map