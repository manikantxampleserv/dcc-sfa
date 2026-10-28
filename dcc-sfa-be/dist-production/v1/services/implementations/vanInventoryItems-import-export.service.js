"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VanInventoryItemsImportExportService = void 0;
const import_export_service_1 = require("../base/import-export.service");
const prisma_client_1 = __importDefault(require("../../../configs/prisma.client"));
const vanInventory_import_export_service_1 = require("./vanInventory-import-export.service");
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
                product_id: 1,
                quantity: 70,
                base_quantity: 0,
                batch_number: 'CK3-33609',
                manufacturing_date: '',
                expiry_date: '2027-07-23',
                serial_numbers: '',
            },
            {
                product_id: 2,
                quantity: 25,
                base_quantity: 0,
                batch_number: 'CK3-33616',
                manufacturing_date: '',
                expiry_date: '2027-07-25',
                serial_numbers: '',
            },
            {
                product_id: 6,
                quantity: 17,
                base_quantity: 0,
                batch_number: 'CK3-33606',
                manufacturing_date: '',
                expiry_date: '2027-07-22',
                serial_numbers: '',
            },
            {
                product_id: 3,
                quantity: 11,
                base_quantity: 0,
                batch_number: 'CK3-33612',
                manufacturing_date: '',
                expiry_date: '2027-07-24',
                serial_numbers: '',
            },
            {
                product_id: 7,
                quantity: 5,
                base_quantity: 0,
                batch_number: 'CK3-33603',
                manufacturing_date: '',
                expiry_date: '2027-01-19',
                serial_numbers: '',
            },
            {
                product_id: 9,
                quantity: 3,
                base_quantity: 0,
                batch_number: 'CK3-33619',
                manufacturing_date: '',
                expiry_date: '2027-07-26',
                serial_numbers: '',
            },
            {
                product_id: 10,
                quantity: 3,
                base_quantity: 0,
                batch_number: 'CK3-33553',
                manufacturing_date: '',
                expiry_date: '2027-07-09',
                serial_numbers: '',
            },
            {
                product_id: 11,
                quantity: 3,
                base_quantity: 0,
                batch_number: 'CK3-33618',
                manufacturing_date: '',
                expiry_date: '2027-07-27',
                serial_numbers: '',
            },
            {
                product_id: 12,
                quantity: 2,
                base_quantity: 0,
                batch_number: 'CK3-33444',
                manufacturing_date: '',
                expiry_date: '2027-06-10',
                serial_numbers: '',
            },
            {
                product_id: 5,
                quantity: 6,
                base_quantity: 0,
                batch_number: 'CK3-33579',
                manufacturing_date: '',
                expiry_date: '2027-07-15',
                serial_numbers: '',
            },
            {
                product_id: 41,
                quantity: 2,
                base_quantity: 0,
                batch_number: 'CK3-33338',
                manufacturing_date: '',
                expiry_date: '2027-05-29',
                serial_numbers: '',
            },
            {
                product_id: 15,
                quantity: 2,
                base_quantity: 0,
                batch_number: 'CK3-32758',
                manufacturing_date: '',
                expiry_date: '2026-12-18',
                serial_numbers: '',
            },
            {
                product_id: 42,
                quantity: 149,
                base_quantity: 0,
                batch_number: '',
                manufacturing_date: '',
                expiry_date: '',
                serial_numbers: '',
            },
            {
                product_id: 43,
                quantity: 149,
                base_quantity: 0,
                batch_number: '',
                manufacturing_date: '',
                expiry_date: '',
                serial_numbers: '',
            },
            {
                product_id: 35,
                quantity: 80,
                base_quantity: 0,
                batch_number: 'CK6-011',
                manufacturing_date: '',
                expiry_date: '2027-07-25',
                serial_numbers: '',
            },
            {
                product_id: 36,
                quantity: 70,
                base_quantity: 0,
                batch_number: 'CK4-889',
                manufacturing_date: '',
                expiry_date: '2027-07-26',
                serial_numbers: '',
            },
            {
                product_id: 16,
                quantity: 40,
                base_quantity: 0,
                batch_number: 'CK5-33615',
                manufacturing_date: '',
                expiry_date: '2026-11-14',
                serial_numbers: '',
            },
            {
                product_id: 18,
                quantity: 30,
                base_quantity: 0,
                batch_number: 'CK6-33624',
                manufacturing_date: '',
                expiry_date: '2026-11-16',
                serial_numbers: '',
            },
            {
                product_id: 17,
                quantity: 10,
                base_quantity: 0,
                batch_number: 'CK6-33578',
                manufacturing_date: '',
                expiry_date: '2026-11-03',
                serial_numbers: '',
            },
            {
                product_id: 19,
                quantity: 10,
                base_quantity: 0,
                batch_number: 'CK5-33626',
                manufacturing_date: '',
                expiry_date: '2026-11-16',
                serial_numbers: '',
            },
            {
                product_id: 22,
                quantity: 5,
                base_quantity: 0,
                batch_number: 'CK5-33581',
                manufacturing_date: '',
                expiry_date: '2026-11-05',
                serial_numbers: '',
            },
            {
                product_id: 23,
                quantity: 4,
                base_quantity: 0,
                batch_number: 'CK5-33566',
                manufacturing_date: '',
                expiry_date: '2026-10-31',
                serial_numbers: '',
            },
            {
                product_id: 24,
                quantity: 5,
                base_quantity: 0,
                batch_number: 'CK5-33613',
                manufacturing_date: '',
                expiry_date: '2026-11-13',
                serial_numbers: '',
            },
            {
                product_id: 21,
                quantity: 4,
                base_quantity: 0,
                batch_number: 'CK6-33584',
                manufacturing_date: '',
                expiry_date: '2026-11-05',
                serial_numbers: '',
            },
            {
                product_id: 44,
                quantity: 5,
                base_quantity: 0,
                batch_number: 'CK5-33444',
                manufacturing_date: '',
                expiry_date: '2026-10-05',
                serial_numbers: '',
            },
            {
                product_id: 30,
                quantity: 10,
                base_quantity: 0,
                batch_number: 'CK5-33555',
                manufacturing_date: '',
                expiry_date: '2026-10-01',
                serial_numbers: '',
            },
            {
                product_id: 25,
                quantity: 30,
                base_quantity: 0,
                batch_number: 'CK5-33599',
                manufacturing_date: '',
                expiry_date: '2026-10-14',
                serial_numbers: '',
            },
            {
                product_id: 31,
                quantity: 10,
                base_quantity: 0,
                batch_number: 'CK5-33589',
                manufacturing_date: '',
                expiry_date: '2026-10-09',
                serial_numbers: '',
            },
        ];
        const productIds = mockItems.map(item => item.product_id);
        const validProducts = await prisma_client_1.default.products.findMany({
            where: { id: { in: productIds } },
            select: { id: true },
        });
        const validProductIds = new Set(validProducts.map(p => p.id));
        const sampleData = mockItems.filter(item => validProductIds.has(item.product_id));
        return sampleData.length > 0 ? sampleData : mockItems;
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
    async exportToExcel(options = {}) {
        const rawFilters = options.filters || {};
        const where = {};
        if (rawFilters.id)
            where.id = Number(rawFilters.id);
        if (rawFilters.product_id)
            where.product_id = Number(rawFilters.product_id);
        if (rawFilters.parent_id)
            where.parent_id = Number(rawFilters.parent_id);
        const parentWhere = {};
        if (rawFilters.loading_type && rawFilters.loading_type !== 'all') {
            const lt = String(rawFilters.loading_type).toUpperCase();
            if (lt === 'LOAD' || lt === 'L')
                parentWhere.loading_type = 'L';
            else if (lt === 'UNLOAD' || lt === 'U')
                parentWhere.loading_type = 'U';
            else
                parentWhere.loading_type = rawFilters.loading_type;
        }
        if (rawFilters.user_id && rawFilters.user_id !== 'all') {
            parentWhere.user_id = Number(rawFilters.user_id);
        }
        if (rawFilters.location_id && rawFilters.location_id !== 'all') {
            parentWhere.location_id = Number(rawFilters.location_id);
        }
        if (rawFilters.approval_status && rawFilters.approval_status !== 'all') {
            parentWhere.approval_status = String(rawFilters.approval_status).toUpperCase();
        }
        const startDate = rawFilters.start_date;
        const endDate = rawFilters.end_date;
        if (startDate || endDate) {
            const dateFilter = {};
            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                dateFilter.gte = start;
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                dateFilter.lte = end;
            }
            parentWhere.OR = [
                { document_date: dateFilter },
                { createdate: dateFilter },
            ];
        }
        if (Object.keys(parentWhere).length > 0) {
            where.van_inventory_items_inventory = parentWhere;
        }
        if (rawFilters.search) {
            const searchStr = String(rawFilters.search).trim();
            where.OR = [
                { van_inventory_items_products: { name: { contains: searchStr } } },
                { van_inventory_items_batch_lot: { batch_number: { contains: searchStr } } },
                { van_inventory_serial: { serial_number: { contains: searchStr } } },
                {
                    van_inventory_items_inventory: {
                        OR: [
                            { van_inventory_users: { name: { contains: searchStr } } },
                            { vehicle: { vehicle_number: { contains: searchStr } } },
                        ],
                    },
                },
            ];
        }
        else if (rawFilters.OR) {
            where.OR = rawFilters.OR;
        }
        const query = {
            where,
            orderBy: options.orderBy || { id: 'desc' },
            include: {
                van_inventory_items_inventory: {
                    include: {
                        van_inventory_users: {
                            select: { id: true, name: true, email: true },
                        },
                    },
                },
                van_inventory_items_products: {
                    select: { id: true, name: true, code: true, tracking_type: true },
                },
                van_inventory_items_batch_lot: {
                    select: { id: true, batch_number: true },
                },
                van_inventory_serial: {
                    select: { id: true, serial_number: true },
                },
            },
        };
        if (options.limit)
            query.take = options.limit;
        const items = await this.getModel().findMany(query);
        const rows = [];
        for (const item of items) {
            const parent = item.van_inventory_items_inventory;
            const dateObj = parent?.document_date || parent?.createdate;
            let formattedDate = '';
            if (dateObj) {
                const d = new Date(dateObj);
                if (!isNaN(d.getTime())) {
                    const day = String(d.getDate()).padStart(2, '0');
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const year = d.getFullYear();
                    formattedDate = `${day}-${month}-${year}`;
                }
            }
            const rawType = (parent?.loading_type || 'L').toString().toUpperCase();
            const typeStr = rawType === 'U' || rawType === 'UNLOAD' ? 'Unload' : 'Load';
            const userName = parent?.van_inventory_users?.name || '';
            const vanInventoryNo = parent?.id || item.parent_id;
            const productName = item.van_inventory_items_products?.name ||
                item.product_name ||
                '';
            let trackingType = item.van_inventory_items_products?.tracking_type;
            if (trackingType && trackingType.trim()) {
                const t = trackingType.trim().toLowerCase();
                trackingType = t.charAt(0).toUpperCase() + t.slice(1);
            }
            else if (item.van_inventory_items_batch_lot || item.batch_lot_id) {
                trackingType = 'Batch';
            }
            else if (item.van_inventory_serial || item.serial_id) {
                trackingType = 'Serial';
            }
            else {
                trackingType = 'None';
            }
            const batchSerial = item.van_inventory_items_batch_lot?.batch_number ||
                item.van_inventory_serial?.serial_number ||
                item.sap_item_code ||
                '';
            rows.push({
                date: formattedDate,
                type: typeStr,
                vanInventoryNo,
                userName,
                product: productName,
                trackingType,
                quantity: Number(item.quantity) || 0,
                batchSerials: batchSerial,
            });
        }
        return await (0, vanInventory_import_export_service_1.generateVanInventoryExcelWorkbook)(rows);
    }
}
exports.VanInventoryItemsImportExportService = VanInventoryItemsImportExportService;
//# sourceMappingURL=vanInventoryItems-import-export.service.js.map