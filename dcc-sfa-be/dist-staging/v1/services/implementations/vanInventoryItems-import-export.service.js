"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VanInventoryItemsImportExportService = void 0;
const import_export_service_1 = require("../base/import-export.service");
const prisma_client_1 = __importDefault(require("../../../configs/prisma.client"));
class VanInventoryItemsImportExportService extends import_export_service_1.ImportExportService {
    modelName = 'van_inventory_items';
    displayName = 'Van Inventory Items';
    uniqueFields = ['id'];
    searchFields = ['product_id'];
    masterTableConfigs = [
        {
            masterTable: 'products',
            masterKey: 'id',
            masterDisplayFields: ['id', 'name', 'code', 'tracking_type'],
            sheetName: 'Ref - Products',
            description: 'Use the ID from this sheet in the Product ID column',
        },
    ];
    columns = [
        {
            key: 'product_id',
            header: 'Product ID',
            width: 15,
            required: true,
            type: 'number',
            validation: value => {
                const numValue = Number(value);
                if (isNaN(numValue) || numValue <= 0)
                    return 'Product ID must be a positive number';
                return true;
            },
            description: 'ID of the product (required)',
        },
        {
            key: 'quantity',
            header: 'Quantity',
            width: 12,
            required: true,
            type: 'number',
            validation: value => {
                const numValue = Number(value);
                if (isNaN(numValue) || numValue <= 0)
                    return 'Quantity must be a positive number';
                return true;
            },
            description: 'Quantity of the product (required)',
        },
        {
            key: 'base_quantity',
            header: 'Base Quantity',
            width: 15,
            required: false,
            type: 'number',
            validation: value => {
                if (!value)
                    return true;
                const numValue = Number(value);
                if (isNaN(numValue) || numValue < 0)
                    return 'Base Quantity must be a positive number';
                return true;
            },
            description: 'Base Quantity (Pieces) of the product (optional)',
        },
        {
            key: 'batch_number',
            header: 'Batch Number',
            width: 20,
            type: 'string',
            description: 'Batch number (fill only for batch-tracked products)',
        },
        {
            key: 'manufacturing_date',
            header: 'MFG Date',
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
            transform: value => {
                if (!value)
                    return null;
                const date = new Date(value);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            },
            description: 'Manufacturing Date (YYYY-MM-DD format) (fill only for batch-tracked products)',
        },
        {
            key: 'expiry_date',
            header: 'EXP Date',
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
            transform: value => {
                if (!value)
                    return null;
                const date = new Date(value);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            },
            description: 'Expiry Date (YYYY-MM-DD format) (fill only for batch-tracked products)',
        },
        {
            key: 'serial_numbers',
            header: 'Serial Numbers',
            width: 30,
            type: 'string',
            description: 'Comma-separated serial numbers (fill only for serial-tracked products)',
        },
    ];
    async getSampleData() {
        const mockItems = [
            {
                code: 'FG001',
                qty: 10,
                base_qty: 2,
                batch: 'B2026-001',
                mfg: '2026-01-01',
                exp: '2027-01-01',
            },
            {
                code: 'FG001',
                qty: 5,
                base_qty: 3,
                batch: 'B2026-002',
                mfg: '2026-02-01',
                exp: '2027-02-01',
            },
            {
                code: 'KD003',
                qty: 20,
                base_qty: 8,
                batch: '',
                mfg: '',
                exp: '',
            }
        ];
        const sapCodes = mockItems.map(item => item.code);
        const products = await prisma_client_1.default.products.findMany({
            where: { sap_code: { in: sapCodes } },
            select: { id: true, sap_code: true },
        });
        const productMap = new Map(products.map(p => [p.sap_code, p.id]));
        const sampleData = [];
        for (const item of mockItems) {
            const productId = productMap.get(item.code);
            if (productId) {
                sampleData.push({
                    product_id: productId,
                    quantity: item.qty,
                    base_quantity: item.base_qty,
                    batch_number: item.batch,
                    manufacturing_date: item.mfg,
                    expiry_date: item.exp,
                    serial_numbers: '',
                });
            }
        }
        return sampleData;
    }
    getColumnDescription() {
        return 'Template for van inventory items';
    }
    async transformDataForExport(data) {
        return data;
    }
    async checkDuplicate(data, tx) {
        return null;
    }
    async validateForeignKeys(data, tx) {
        const product = await (tx || prisma_client_1.default).products.findUnique({
            where: { id: data.product_id },
        });
        if (!product)
            return `Product ID ${data.product_id} not found`;
        return null;
    }
    async prepareDataForImport(data, userId, tx) {
        return data;
    }
    async updateExisting(data, existingId, userId, tx) {
        return data;
    }
    async processImportRecord(data, userId, options, tx) {
        return data;
    }
}
exports.VanInventoryItemsImportExportService = VanInventoryItemsImportExportService;
//# sourceMappingURL=vanInventoryItems-import-export.service.js.map