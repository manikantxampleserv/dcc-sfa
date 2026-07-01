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
        const products = await prisma_client_1.default.products.findMany({
            take: 5,
            select: { id: true, name: true, tracking_type: true },
        });
        if (products.length === 0)
            return [];
        const sampleData = [];
        for (let pIndex = 0; pIndex < products.length; pIndex++) {
            const product = products[pIndex];
            const trackingType = product.tracking_type?.toUpperCase();
            for (let bIndex = 1; bIndex <= 10; bIndex++) {
                if (trackingType === 'BATCH') {
                    sampleData.push({
                        product_id: product.id,
                        quantity: 10,
                        batch_number: `B${String(pIndex + 1).padStart(2, '0')}-${String(bIndex).padStart(3, '0')}`,
                        manufacturing_date: '2025-01-01',
                        expiry_date: '2028-12-31',
                        serial_numbers: '',
                    });
                }
                else if (trackingType === 'SERIAL') {
                    sampleData.push({
                        product_id: product.id,
                        quantity: 2,
                        batch_number: '',
                        manufacturing_date: '',
                        expiry_date: '',
                        serial_numbers: `SN-${pIndex + 1}-${bIndex}A, SN-${pIndex + 1}-${bIndex}B`,
                    });
                }
                else {
                    sampleData.push({
                        product_id: product.id,
                        quantity: 15,
                        batch_number: '',
                        manufacturing_date: '',
                        expiry_date: '',
                        serial_numbers: '',
                    });
                }
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