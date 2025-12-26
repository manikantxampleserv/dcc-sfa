"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockMovementsImportExportService = void 0;
const import_export_service_1 = require("../base/import-export.service");
const prisma_client_1 = __importDefault(require("../../../configs/prisma.client"));
class StockMovementsImportExportService extends import_export_service_1.ImportExportService {
    modelName = 'stock_movements';
    displayName = 'Stock Movements';
    uniqueFields = ['id'];
    searchFields = ['movement_type', 'reference_type', 'remarks'];
    columns = [
        {
            key: 'product_id',
            header: 'Product ID',
            width: 15,
            required: true,
            type: 'number',
            validation: value => {
                const num = parseInt(value);
                if (isNaN(num) || num <= 0)
                    return 'Product ID must be a positive number';
                return true;
            },
            description: 'Product ID (required, must be valid product)',
        },
        {
            key: 'batch_id',
            header: 'Batch ID',
            width: 15,
            type: 'number',
            validation: value => {
                if (!value)
                    return true;
                const num = parseInt(value);
                if (isNaN(num) || num <= 0)
                    return 'Batch ID must be a positive number';
                return true;
            },
            description: 'Batch ID (optional, leave empty if no batch tracking)',
        },
        {
            key: 'serial_id',
            header: 'Serial ID',
            width: 15,
            type: 'number',
            validation: value => {
                if (!value)
                    return true;
                const num = parseInt(value);
                if (isNaN(num) || num <= 0)
                    return 'Serial ID must be a positive number';
                return true;
            },
            description: 'Serial ID (optional, leave empty if no serial tracking)',
        },
        {
            key: 'movement_type',
            header: 'Movement Type',
            width: 20,
            required: true,
            type: 'string',
            validation: value => {
                if (!value || value.length < 2)
                    return 'Movement type must be at least 2 characters';
                if (value.length > 50)
                    return 'Movement type must be less than 50 characters';
                return true;
            },
            description: 'Movement type (e.g., IN, OUT, TRANSFER)',
        },
        {
            key: 'reference_type',
            header: 'Reference Type',
            width: 20,
            type: 'string',
            validation: value => {
                if (!value)
                    return true;
                if (value.length > 50)
                    return 'Reference type must be less than 50 characters';
                return true;
            },
            description: 'Reference type (e.g., ORDER, TRANSFER, ADJUSTMENT)',
        },
        {
            key: 'reference_id',
            header: 'Reference ID',
            width: 15,
            type: 'number',
            validation: value => {
                if (!value)
                    return true;
                const num = parseInt(value);
                if (isNaN(num) || num <= 0)
                    return 'Reference ID must be a positive number';
                return true;
            },
            description: 'Reference ID (optional, must be valid reference)',
        },
        {
            key: 'from_location_id',
            header: 'From Location ID',
            width: 15,
            type: 'number',
            validation: value => {
                if (!value)
                    return true;
                const num = parseInt(value);
                if (isNaN(num) || num <= 0)
                    return 'From location ID must be a positive number';
                return true;
            },
            description: 'From location ID (optional, must be valid location)',
        },
        {
            key: 'to_location_id',
            header: 'To Location ID',
            width: 15,
            type: 'number',
            validation: value => {
                if (!value)
                    return true;
                const num = parseInt(value);
                if (isNaN(num) || num <= 0)
                    return 'To location ID must be a positive number';
                return true;
            },
            description: 'To location ID (optional, must be valid location)',
        },
        {
            key: 'quantity',
            header: 'Quantity',
            width: 15,
            required: true,
            type: 'number',
            validation: value => {
                const num = parseInt(value);
                if (isNaN(num) || num <= 0)
                    return 'Quantity must be a positive number';
                return true;
            },
            description: 'Movement quantity (required, must be positive)',
        },
        {
            key: 'movement_date',
            header: 'Movement Date',
            width: 15,
            type: 'date',
            validation: value => {
                if (!value)
                    return true;
                const date = new Date(value);
                if (isNaN(date.getTime()))
                    return 'Invalid date format';
                return true;
            },
            description: 'Movement date (optional, YYYY-MM-DD format)',
        },
        {
            key: 'remarks',
            header: 'Remarks',
            width: 30,
            type: 'string',
            validation: value => {
                if (!value)
                    return true;
                if (value.length > 1000)
                    return 'Remarks must be less than 1000 characters';
                return true;
            },
            description: 'Movement remarks (optional, max 1000 characters)',
        },
        {
            key: 'van_inventory_id',
            header: 'Van Inventory ID',
            width: 18,
            type: 'number',
            validation: value => {
                if (!value)
                    return true;
                const num = parseInt(value);
                if (isNaN(num) || num <= 0)
                    return 'Van inventory ID must be a positive number';
                return true;
            },
            description: 'Van inventory ID (optional, must be valid van inventory)',
        },
        {
            key: 'is_active',
            header: 'Is Active',
            width: 12,
            type: 'string',
            defaultValue: 'Y',
            validation: value => {
                const upperValue = value ? value.toString().toUpperCase() : 'Y';
                return ['Y', 'N'].includes(upperValue) || 'Must be Y or N';
            },
            transform: value => (value ? value.toString().toUpperCase() : 'Y'),
            description: 'Active status - Y for Yes, N for No (defaults to Y)',
        },
    ];
    async getSampleData() {
        const products = await prisma_client_1.default.products.findMany({
            take: 3,
            select: { id: true, name: true, code: true },
            orderBy: { id: 'asc' },
        });
        const warehouses = await prisma_client_1.default.warehouses.findMany({
            take: 3,
            select: { id: true, name: true },
            orderBy: { id: 'asc' },
        });
        const productIds = products.map(p => p.id);
        const warehouseIds = warehouses.map(w => w.id);
        const productId1 = productIds[0] ?? 1;
        const productId2 = productIds[1] ?? 1;
        const productId3 = productIds[2] ?? 1;
        const warehouseId1 = warehouseIds[0] ?? 1;
        const warehouseId2 = warehouseIds[1] ?? 1;
        return [
            {
                product_id: productId1,
                batch_id: null,
                serial_id: null,
                movement_type: 'IN',
                reference_type: 'PURCHASE',
                reference_id: 1,
                from_location_id: null,
                to_location_id: warehouseId1,
                quantity: 100,
                movement_date: '2024-01-20',
                remarks: 'Initial stock receipt',
                van_inventory_id: null,
                is_active: 'Y',
            },
            {
                product_id: productId2,
                batch_id: null,
                serial_id: null,
                movement_type: 'OUT',
                reference_type: 'SALE',
                reference_id: 2,
                from_location_id: warehouseId1,
                to_location_id: null,
                quantity: 50,
                movement_date: '2024-01-21',
                remarks: 'Stock sold to customer',
                van_inventory_id: 1,
                is_active: 'Y',
            },
            {
                product_id: productId3,
                batch_id: null,
                serial_id: null,
                movement_type: 'TRANSFER',
                reference_type: 'TRANSFER',
                reference_id: 3,
                from_location_id: warehouseId1,
                to_location_id: warehouseId2,
                quantity: 25,
                movement_date: '2024-01-22',
                remarks: 'Inter-warehouse transfer',
                van_inventory_id: null,
                is_active: 'Y',
            },
        ];
    }
    getColumnDescription(key) {
        const column = this.columns.find(col => col.key === key);
        return column?.description || '';
    }
    async transformDataForExport(data) {
        return data.map(movement => ({
            product_id: movement.product_id,
            batch_id: movement.batch_id ?? '',
            serial_id: movement.serial_id ?? '',
            movement_type: movement.movement_type,
            reference_type: movement.reference_type ?? '',
            reference_id: movement.reference_id ?? '',
            from_location_id: movement.from_location_id ?? '',
            to_location_id: movement.to_location_id ?? '',
            quantity: movement.quantity,
            movement_date: movement.movement_date instanceof Date
                ? movement.movement_date.toISOString().split('T')[0]
                : (typeof movement.movement_date === 'string' ? movement.movement_date : ''),
            remarks: movement.remarks ?? '',
            van_inventory_id: movement.van_inventory_id ?? '',
            is_active: movement.is_active ?? 'Y',
            created_date: movement.createdate instanceof Date
                ? movement.createdate.toISOString().split('T')[0]
                : (typeof movement.createdate === 'string' ? movement.createdate : ''),
            created_by: movement.createdby ?? '',
            updated_date: movement.updatedate instanceof Date
                ? movement.updatedate.toISOString().split('T')[0]
                : (typeof movement.updatedate === 'string' ? movement.updatedate : ''),
            updated_by: movement.updatedby ?? '',
        }));
    }
}
exports.StockMovementsImportExportService = StockMovementsImportExportService;
//# sourceMappingURL=stockMovements-import-export.service.js.map