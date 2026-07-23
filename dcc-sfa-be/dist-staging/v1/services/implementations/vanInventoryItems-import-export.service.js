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
        const mockItems = [
            {
                code: 'FG001',
                qty: 70,
                batch: 'CK3-33679',
                mfg: '2026-07-16',
                exp: '2027-07-15',
            },
            {
                code: 'FG001',
                qty: 26,
                batch: 'CK3-33586',
                mfg: '2026-07-17',
                exp: '2027-07-16',
            },
            {
                code: 'FG001',
                qty: 14,
                batch: 'CK3-33521',
                mfg: '2026-07-01',
                exp: '2027-06-30',
            },
            {
                code: 'FG002',
                qty: 11,
                batch: 'CK3-33539',
                mfg: '2026-07-04',
                exp: '2027-07-03',
            },
            {
                code: 'FG003',
                qty: 13,
                batch: 'CK3-33537',
                mfg: '2026-07-04',
                exp: '2027-07-03',
            },
            {
                code: 'PH001',
                qty: 5,
                batch: 'CK3-33494',
                mfg: '2026-06-24',
                exp: '2026-12-22',
            },
            {
                code: 'KD001',
                qty: 4,
                batch: 'CK3-33486',
                mfg: '2026-06-23',
                exp: '2027-06-22',
            },
            {
                code: 'FG004',
                qty: 2,
                batch: 'CK3-33513',
                mfg: '2026-06-27',
                exp: '2027-06-26',
            },
            {
                code: 'FG004',
                qty: 2,
                batch: 'CK3-33553',
                mfg: '2026-07-10',
                exp: '2027-07-09',
            },
            {
                code: 'FG004',
                qty: 3,
                batch: 'CK3-33549',
                mfg: '2026-07-09',
                exp: '2027-07-08',
            },
            {
                code: 'FG008',
                qty: 2,
                batch: 'CK3-33444',
                mfg: '2026-06-11',
                exp: '2027-06-10',
            },
            {
                code: 'FG009',
                qty: 6,
                batch: 'CK3-33579',
                mfg: '2026-07-16',
                exp: '2027-07-15',
            },
            {
                code: 'FG010',
                qty: 2,
                batch: 'CK3-33338',
                mfg: '2026-05-30',
                exp: '2027-05-29',
            },
            {
                code: 'FG011',
                qty: 2,
                batch: 'CK3-32758',
                mfg: '2025-12-19',
                exp: '2026-12-18',
            },
            {
                code: 'FG007',
                qty: 80,
                batch: 'CK6-009',
                mfg: '2026-07-15',
                exp: '2027-07-14',
            },
            {
                code: 'FG013',
                qty: 70,
                batch: 'CK4-878',
                mfg: '2026-07-16',
                exp: '2027-07-15',
            },
            {
                code: 'FG014',
                qty: 30,
                batch: 'CK5-33572',
                mfg: '2026-07-14',
                exp: '2026-11-02',
            },
            {
                code: 'PT007',
                qty: 25,
                batch: 'CK6-33590',
                mfg: '2026-07-18',
                exp: '2026-11-06',
            },
            {
                code: 'PT006',
                qty: 8,
                batch: 'CK6-33576',
                mfg: '2026-07-16',
                exp: '2026-11-03',
            },
            {
                code: 'PT005',
                qty: 7,
                batch: 'CK5-33567',
                mfg: '2026-07-13',
                exp: '2026-11-01',
            },
            {
                code: 'PO015',
                qty: 12,
                batch: 'CK6-33561',
                mfg: '2026-07-11',
                exp: '2026-10-30',
            },
            {
                code: 'PO013',
                qty: 4,
                batch: 'CK5-33577',
                mfg: '2026-07-17',
                exp: '2026-11-05',
            },
            {
                code: 'PO012',
                qty: 3,
                batch: 'CK5-33565',
                mfg: '2026-07-12',
                exp: '2026-10-31',
            },
            {
                code: 'PO010',
                qty: 5,
                batch: 'CK6-33550',
                mfg: '2026-07-09',
                exp: '2026-10-28',
            },
            {
                code: 'PO009',
                qty: 4,
                batch: 'CK6-33583',
                mfg: '2026-07-17',
                exp: '2026-11-05',
            },
            {
                code: 'PO008',
                qty: 5,
                batch: 'CK5-33444',
                mfg: '2026-06-16',
                exp: '2026-10-05',
            },
            {
                code: 'PH009',
                qty: 10,
                batch: 'CK5-33497',
                mfg: '2026-06-25',
                exp: '2026-09-16',
            },
            {
                code: 'PH008',
                qty: 30,
                batch: 'CK5-33542',
                mfg: '2026-07-06',
                exp: '2026-09-27',
            },
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