"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VanInventoryImportExportService = void 0;
exports.setupVanInventoryWorksheet = setupVanInventoryWorksheet;
exports.writeVanInventoryBatchToWorksheet = writeVanInventoryBatchToWorksheet;
exports.generateVanInventoryExcelWorkbook = generateVanInventoryExcelWorkbook;
const prisma_client_1 = __importDefault(require("../../../configs/prisma.client"));
const inventory_utils_1 = require("../../utils/inventory.utils");
const import_export_service_1 = require("../base/import-export.service");
const ExcelJS = __importStar(require("exceljs"));
class VanInventoryImportExportService extends import_export_service_1.ImportExportService {
    modelName = 'van_inventory';
    displayName = 'Van Inventory';
    uniqueFields = ['id'];
    searchFields = ['user_id', 'status', 'loading_type'];
    masterTableConfigs = [
        {
            masterTable: 'users',
            masterKey: 'id',
            masterDisplayFields: ['id', 'name', 'email', 'employee_id'],
            sheetName: 'Ref - Users',
            description: 'Use the ID from this sheet in the User ID column',
        },
        {
            masterTable: 'vehicles',
            masterKey: 'id',
            masterDisplayFields: ['id', 'vehicle_number', 'make', 'model', 'type'],
            sheetName: 'Ref - Vehicles',
            description: 'Use the ID from this sheet for vehicle references',
        },
        {
            masterTable: 'depots',
            masterKey: 'id',
            masterDisplayFields: ['id', 'name', 'code'],
            sheetName: 'Ref - Depots',
            description: 'Use the ID from this sheet for depot references',
        },
        {
            masterTable: 'products',
            masterKey: 'id',
            masterDisplayFields: ['id', 'name', 'code', 'tracking_type'],
            sheetName: 'Ref - Products',
            description: 'Use the ID from this sheet in the Product ID column',
        },
        {
            masterTable: 'batch_lots',
            masterKey: 'id',
            masterDisplayFields: ['id', 'batch_number', 'expiry_date', 'quantity'],
            sheetName: 'Ref - Batches',
            description: 'Use the batch_number from this sheet in the Batch Number column',
        },
        {
            masterTable: 'serial_numbers',
            masterKey: 'id',
            masterDisplayFields: ['id', 'serial_number', 'status'],
            sheetName: 'Ref - Serials',
            description: 'Use the serial_number from this sheet in the Serial Numbers column',
        },
    ];
    columns = [
        {
            key: 'user_id',
            header: 'User ID',
            width: 15,
            required: true,
            type: 'number',
            validation: value => {
                const numValue = Number(value);
                if (isNaN(numValue) || numValue <= 0)
                    return 'User ID must be a positive number';
                return true;
            },
            description: 'ID of the user/salesperson (required, positive integer)',
        },
        {
            key: 'loading_type',
            header: 'Loading Type',
            width: 15,
            type: 'string',
            defaultValue: 'L',
            validation: value => {
                const upperValue = value ? value.toString().toUpperCase() : 'L';
                return (['L', 'U'].includes(upperValue) || 'Must be L (Load) or U (Unload)');
            },
            transform: value => (value ? value.toString().toUpperCase() : 'L'),
            description: 'Loading type - L = Load, U = Unload (defaults to L)',
        },
        {
            key: 'document_date',
            header: 'Document Date',
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
            description: 'Document date (optional, YYYY-MM-DD format)',
        },
        {
            key: 'vehicle_id',
            header: 'Vehicle ID',
            width: 15,
            type: 'number',
            validation: value => {
                if (!value)
                    return true;
                const numValue = Number(value);
                if (isNaN(numValue) || numValue <= 0)
                    return 'Vehicle ID must be a positive number';
                return true;
            },
            description: 'ID of the vehicle (optional, positive integer)',
        },
        {
            key: 'location_id',
            header: 'Location ID',
            width: 15,
            type: 'number',
            validation: value => {
                if (!value)
                    return true;
                const numValue = Number(value);
                if (isNaN(numValue) || numValue <= 0)
                    return 'Location ID must be a positive number';
                return true;
            },
            description: 'ID of the location/depot (optional, positive integer)',
        },
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
            description: 'Batch number for batch-tracked products (optional)',
        },
        {
            key: 'manufacturing_date',
            header: 'MFG Date',
            width: 15,
            type: 'date',
            description: 'Manufacturing date (YYYY-MM-DD)',
        },
        {
            key: 'expiry_date',
            header: 'EXP Date',
            width: 15,
            type: 'date',
            description: 'Expiry date (YYYY-MM-DD)',
        },
        {
            key: 'serial_numbers',
            header: 'Serial Numbers',
            width: 30,
            type: 'string',
            description: 'Comma-separated serial numbers for serial-tracked products (optional)',
        },
    ];
    async getSampleData() {
        const users = await prisma_client_1.default.users.findMany({
            take: 3,
            select: { id: true, name: true },
            orderBy: { id: 'asc' },
        });
        const products = await prisma_client_1.default.products.findMany({
            take: 9,
            select: { id: true, name: true },
            orderBy: { id: 'asc' },
        });
        const vehicles = await prisma_client_1.default.vehicles.findMany({
            take: 3,
            select: { id: true, vehicle_number: true },
            orderBy: { id: 'asc' },
        });
        const depots = await prisma_client_1.default.depots.findMany({
            take: 3,
            select: { id: true, name: true },
            orderBy: { id: 'asc' },
        });
        const productIds = products.map(p => p.id);
        const vehicleIds = vehicles.map(v => v.id);
        const depotIds = depots.map(d => d.id);
        const salesmanUser = await prisma_client_1.default.users.findFirst({
            where: {
                user_role: {
                    OR: [
                        { name: { contains: 'Salesman' } },
                        { name: { contains: 'Salesperson' } },
                        { role_key: { contains: 'salesman' } },
                        { role_key: { contains: 'salesperson' } },
                    ],
                },
            },
            select: { id: true, name: true },
        });
        const userId1 = salesmanUser?.id || users[0]?.id || 1;
        const product1 = await prisma_client_1.default.products.findFirst({
            where: { sap_code: 'FG001' },
        });
        const product2 = await prisma_client_1.default.products.findFirst({
            where: { sap_code: 'KD003' },
        });
        const moshiDepot = await prisma_client_1.default.depots.findFirst({
            where: { sap_code: 'MOS' },
        });
        const p1 = product1?.id || productIds[0] || 1;
        const p2 = product2?.id || productIds[1] || p1;
        const vehicleId1 = vehicleIds[0] || 1;
        const depotId1 = moshiDepot?.id || depotIds[0] || 1;
        return [
            {
                user_id: userId1,
                loading_type: 'L',
                document_date: '2026-07-23',
                vehicle_id: vehicleId1,
                location_id: depotId1,
                product_id: p1,
                quantity: 10,
                base_quantity: 2,
                batch_number: 'B2026-001',
            },
            {
                user_id: userId1,
                loading_type: 'L',
                document_date: '2026-07-23',
                vehicle_id: vehicleId1,
                location_id: depotId1,
                product_id: p1,
                quantity: 5,
                base_quantity: 3,
                batch_number: 'B2026-002',
            },
            {
                user_id: userId1,
                loading_type: 'L',
                document_date: '2026-07-23',
                vehicle_id: vehicleId1,
                location_id: depotId1,
                product_id: p2,
                quantity: 20,
                base_quantity: 8,
            },
        ];
    }
    getColumnDescription(key) {
        const column = this.columns.find(col => col.key === key);
        return column?.description || '';
    }
    async transformDataForExport(data) {
        const exportedRows = [];
        for (const vanInventory of data) {
            const items = vanInventory.van_inventory_items_inventory || [];
            const headerData = {
                user_id: vanInventory.user_id,
                status: vanInventory.status || 'A',
                loading_type: vanInventory.loading_type || 'L',
                document_date: vanInventory.document_date?.toISOString().split('T')[0] || '',
                vehicle_id: vanInventory.vehicle_id || '',
                location_type: vanInventory.location_type || 'van',
                is_active: vanInventory.is_active || 'Y',
                created_date: vanInventory.createdate?.toISOString().split('T')[0] || '',
                created_by: vanInventory.createdby || '',
                updated_date: vanInventory.updatedate?.toISOString().split('T')[0] || '',
                updated_by: vanInventory.updatedby || '',
            };
            if (items.length === 0) {
                exportedRows.push(headerData);
            }
            else {
                for (const item of items) {
                    exportedRows.push({
                        ...headerData,
                        product_id: item.product_id,
                        quantity: item.quantity || 0,
                        unit_price: item.unit_price || 0,
                        batch_number: item.van_inventory_items_batch_lot?.batch_number ||
                            item.batch_lots?.batch_number ||
                            '',
                        serial_numbers: item.van_inventory_serial?.serial_number ||
                            item.serial_numbers?.serial_number ||
                            '',
                        is_cancelled: 'Y',
                    });
                }
            }
        }
        return exportedRows;
    }
    async checkDuplicate(data, tx) {
        return null;
    }
    async validateForeignKeys(data, tx) {
        const userModel = tx ? tx.users : prisma_client_1.default.users;
        const vehicleModel = tx ? tx.vehicles : prisma_client_1.default.vehicles;
        const productModel = tx ? tx.products : prisma_client_1.default.products;
        const batchModel = tx ? tx.batch_lots : prisma_client_1.default.batch_lots;
        const serialModel = tx ? tx.serial_numbers : prisma_client_1.default.serial_numbers;
        const user = await userModel.findUnique({
            where: { id: data.user_id },
        });
        if (!user) {
            return `User with ID ${data.user_id} does not exist`;
        }
        if (data.vehicle_id) {
            const vehicle = await vehicleModel.findUnique({
                where: { id: data.vehicle_id },
            });
            if (!vehicle) {
                return `Vehicle with ID ${data.vehicle_id} does not exist`;
            }
        }
        if (data.items) {
            let items;
            try {
                items =
                    typeof data.items === 'string' ? JSON.parse(data.items) : data.items;
            }
            catch {
                return 'Invalid JSON format for items';
            }
            if (!Array.isArray(items)) {
                return 'Items must be a JSON array';
            }
            for (const item of items) {
                if (item.product_id) {
                    const product = await productModel.findUnique({
                        where: { id: item.product_id },
                    });
                    if (!product) {
                        return `Product with ID ${item.product_id} does not exist in items`;
                    }
                }
                if (data.loading_type === 'U') {
                    if (item.batches && Array.isArray(item.batches)) {
                        for (const batch of item.batches) {
                            if (batch.batch_number) {
                                const batchRecord = await batchModel.findFirst({
                                    where: {
                                        batch_number: batch.batch_number,
                                        createdby: data.user_id,
                                    },
                                });
                                if (!batchRecord) {
                                    return `Batch with number ${batch.batch_number} does not exist for this user in items`;
                                }
                            }
                        }
                    }
                    if (item.serials && Array.isArray(item.serials)) {
                        for (const serial of item.serials) {
                            if (serial.serial_number) {
                                const serialRecord = await serialModel.findUnique({
                                    where: { serial_number: serial.serial_number },
                                });
                                if (!serialRecord) {
                                    return `Serial number ${serial.serial_number} does not exist in items`;
                                }
                            }
                        }
                    }
                }
            }
        }
        return null;
    }
    async prepareDataForImport(data, userId) {
        let items = [];
        if (data.items) {
            try {
                items =
                    typeof data.items === 'string' ? JSON.parse(data.items) : data.items;
            }
            catch {
                items = [];
            }
        }
        return {
            user_id: parseInt(data.user_id),
            status: (data.status || 'A').toUpperCase(),
            loading_type: (data.loading_type || 'L').toUpperCase(),
            document_date: data.document_date ? new Date(data.document_date) : null,
            vehicle_id: data.vehicle_id ? parseInt(data.vehicle_id) : null,
            location_type: data.location_type || 'van',
            location_id: data.location_id ? parseInt(data.location_id) : null,
            is_active: (data.is_active || 'Y').toUpperCase(),
            createdby: userId,
            createdate: new Date(),
            log_inst: 1,
            approval_status: 'A',
            items: items,
        };
    }
    async updateExisting(_data, _userId, _tx) {
        return null;
    }
    async importData(data, userId, options = {}) {
        let success = 0;
        let failed = 0;
        const errors = [];
        const importedData = [];
        const detailedErrors = [];
        const groupedData = new Map();
        for (const [index, row] of data.entries()) {
            const rowNum = index + 2;
            const dateStr = row.document_date
                ? new Date(row.document_date).toISOString().split('T')[0]
                : 'no_date';
            const groupKey = `${row.user_id}-${row.loading_type || 'L'}-${dateStr}-${row.vehicle_id || 'no_vehicle'}`;
            if (!groupedData.has(groupKey)) {
                groupedData.set(groupKey, { header: { ...row }, items: [], rows: [] });
            }
            const group = groupedData.get(groupKey);
            group.rows.push(rowNum);
            if (row.product_id) {
                const productId = parseInt(row.product_id);
                const quantity = parseInt(row.quantity) || 0;
                let existingItem = group.items.find(i => i.product_id === productId);
                if (!existingItem) {
                    existingItem = {
                        product_id: productId,
                        quantity: 0,
                        unit_price: parseFloat(row.unit_price) || 0,
                        batches: [],
                        serials: [],
                    };
                    group.items.push(existingItem);
                }
                existingItem.quantity += quantity;
                if (row.batch_number) {
                    existingItem.batches.push({
                        batch_number: row.batch_number,
                        quantity: quantity,
                    });
                }
                if (row.serial_numbers) {
                    const serialsList = row.serial_numbers
                        .toString()
                        .split(',')
                        .map((s) => s.trim())
                        .filter((s) => s);
                    for (const s of serialsList) {
                        existingItem.serials.push({ serial_number: s });
                    }
                }
            }
        }
        for (const [groupKey, group] of groupedData.entries()) {
            const rowNumStr = group.rows.join(', ');
            const rowErrors = { row: group.rows[0], errors: [] };
            try {
                await prisma_client_1.default.$transaction(async (tx) => {
                    const row = group.header;
                    const duplicateCheck = await this.checkDuplicate(row, tx);
                    if (duplicateCheck &&
                        !options.skipDuplicates &&
                        !options.updateExisting) {
                        throw new Error(`duplicate_check_failed:${duplicateCheck}`);
                    }
                    row.items = group.items;
                    const fkValidation = await this.validateForeignKeys(row, tx);
                    if (fkValidation) {
                        throw new Error(`fk_validation_failed:${fkValidation}`);
                    }
                    const preparedData = await this.prepareDataForImport(row, userId);
                    const items = preparedData.items || [];
                    delete preparedData.items;
                    const created = await tx.van_inventory.create({
                        data: preparedData,
                        include: {
                            van_inventory_users: true,
                            vehicle: true,
                        },
                    });
                    if (items && items.length > 0) {
                        await (0, inventory_utils_1.processVanInventoryItems)(tx, created, items, userId, preparedData.loading_type, preparedData);
                    }
                    const completeRecord = await tx.van_inventory.findUnique({
                        where: { id: created.id },
                        include: {
                            van_inventory_users: true,
                            vehicle: true,
                            van_inventory_items_inventory: {
                                include: {
                                    van_inventory_items_products: true,
                                },
                            },
                        },
                    });
                    importedData.push(completeRecord);
                }, { timeout: 300000 });
                success += group.rows.length;
            }
            catch (error) {
                failed += group.rows.length;
                let errorMessage = error.message;
                let errorType = 'system';
                if (errorMessage.startsWith('duplicate_check_failed:')) {
                    errorMessage = errorMessage.split(':')[1];
                    errorType = 'duplicate';
                }
                else if (errorMessage.startsWith('fk_validation_failed:')) {
                    errorMessage = errorMessage.split(':')[1];
                    errorType = 'foreign_key';
                }
                rowErrors.errors.push({
                    type: errorType,
                    message: errorMessage,
                    action: 'rejected',
                });
                detailedErrors.push(rowErrors);
                errors.push(`Rows [${rowNumStr}]: ${errorMessage}`);
            }
        }
        return {
            success,
            failed,
            errors,
            data: importedData,
            detailedErrors: detailedErrors.length > 0 ? detailedErrors : undefined,
        };
    }
    buildExportQuery(options = {}) {
        const rawFilters = options.filters || {};
        const where = {};
        if (rawFilters.id)
            where.id = Number(rawFilters.id);
        if (rawFilters.user_id && rawFilters.user_id !== 'all') {
            where.user_id = Number(rawFilters.user_id);
        }
        if (rawFilters.location_id && rawFilters.location_id !== 'all') {
            where.location_id = Number(rawFilters.location_id);
        }
        if (rawFilters.vehicle_id)
            where.vehicle_id = Number(rawFilters.vehicle_id);
        if (rawFilters.status && rawFilters.status !== 'all')
            where.status = rawFilters.status;
        if (rawFilters.is_active)
            where.is_active = rawFilters.is_active;
        if (rawFilters.loading_type && rawFilters.loading_type !== 'all') {
            const lt = String(rawFilters.loading_type).toUpperCase();
            if (lt === 'LOAD' || lt === 'L') {
                where.loading_type = 'L';
            }
            else if (lt === 'UNLOAD' || lt === 'U') {
                where.loading_type = 'U';
            }
            else {
                where.loading_type = rawFilters.loading_type;
            }
        }
        if (rawFilters.approval_status && rawFilters.approval_status !== 'all') {
            const statusUpper = String(rawFilters.approval_status).toUpperCase();
            if (statusUpper.includes(',')) {
                where.approval_status = { in: statusUpper.split(',').map(s => s.trim()) };
            }
            else {
                where.approval_status = statusUpper;
            }
        }
        if (rawFilters.search) {
            const searchStr = String(rawFilters.search).trim();
            where.OR = [
                { van_inventory_users: { name: { contains: searchStr } } },
                { vehicle: { vehicle_number: { contains: searchStr } } },
                {
                    van_inventory_items_inventory: {
                        some: {
                            OR: [
                                { van_inventory_items_products: { name: { contains: searchStr } } },
                                { van_inventory_items_batch_lot: { batch_number: { contains: searchStr } } },
                                { van_inventory_serial: { serial_number: { contains: searchStr } } },
                            ],
                        },
                    },
                },
            ];
        }
        else if (rawFilters.OR) {
            where.OR = rawFilters.OR;
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
            if (Array.isArray(where.OR) && where.OR.length > 0) {
                where.AND = [
                    {
                        OR: [
                            { document_date: dateFilter },
                            { createdate: dateFilter },
                        ],
                    },
                ];
            }
            else {
                where.OR = [
                    { document_date: dateFilter },
                    { createdate: dateFilter },
                ];
            }
        }
        else if (rawFilters.document_date) {
            where.document_date = rawFilters.document_date;
        }
        return {
            where,
            orderBy: options.orderBy || { id: 'desc' },
            include: {
                van_inventory_users: {
                    select: { id: true, name: true, email: true },
                },
                vehicle: {
                    select: { id: true, vehicle_number: true, type: true },
                },
                van_inventory_items_inventory: {
                    include: {
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
                },
            },
        };
    }
    async exportToExcelStream(res, options = {}) {
        const query = this.buildExportQuery(options);
        const WorkbookWriter = ExcelJS.stream?.xlsx?.WorkbookWriter ||
            ExcelJS.default?.stream?.xlsx?.WorkbookWriter;
        const workbook = new WorkbookWriter({
            stream: res,
            useStyles: true,
        });
        const worksheet = workbook.addWorksheet('Van Inventory', {
            views: [{ showGridLines: true }],
        });
        setupVanInventoryWorksheet(worksheet);
        const BATCH_SIZE = 1000;
        let lastId = null;
        let hasMore = true;
        const maxLimit = options.limit ? Number(options.limit) : Infinity;
        let totalProcessed = 0;
        while (hasMore) {
            const currentTake = Math.min(BATCH_SIZE, maxLimit - totalProcessed);
            if (currentTake <= 0)
                break;
            const batchQuery = {
                ...query,
                take: currentTake,
                orderBy: { id: 'desc' },
            };
            if (lastId !== null) {
                batchQuery.cursor = { id: lastId };
                batchQuery.skip = 1;
            }
            const batchData = await this.getModel().findMany(batchQuery);
            if (!batchData || batchData.length === 0) {
                break;
            }
            writeVanInventoryBatchToWorksheet(worksheet, batchData);
            totalProcessed += batchData.length;
            lastId = batchData[batchData.length - 1].id;
            if (batchData.length < currentTake) {
                hasMore = false;
            }
        }
        worksheet.commit();
        await workbook.commit();
    }
    async exportToExcel(options = {}) {
        const query = this.buildExportQuery(options);
        const WorkbookConstructor = ExcelJS.Workbook ||
            ExcelJS.default?.Workbook ||
            ExcelJS.default;
        const workbook = new WorkbookConstructor();
        const worksheet = workbook.addWorksheet('Van Inventory', {
            views: [{ showGridLines: true }],
        });
        setupVanInventoryWorksheet(worksheet);
        const BATCH_SIZE = 1000;
        let lastId = null;
        let hasMore = true;
        const maxLimit = options.limit ? Number(options.limit) : Infinity;
        let totalProcessed = 0;
        while (hasMore) {
            const currentTake = Math.min(BATCH_SIZE, maxLimit - totalProcessed);
            if (currentTake <= 0)
                break;
            const batchQuery = {
                ...query,
                take: currentTake,
                orderBy: { id: 'desc' },
            };
            if (lastId !== null) {
                batchQuery.cursor = { id: lastId };
                batchQuery.skip = 1;
            }
            const batchData = await this.getModel().findMany(batchQuery);
            if (!batchData || batchData.length === 0) {
                break;
            }
            writeVanInventoryBatchToWorksheet(worksheet, batchData);
            totalProcessed += batchData.length;
            lastId = batchData[batchData.length - 1].id;
            if (batchData.length < currentTake) {
                hasMore = false;
            }
        }
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
}
exports.VanInventoryImportExportService = VanInventoryImportExportService;
function setupVanInventoryWorksheet(worksheet) {
    const defaultStyle = {
        font: { name: 'Calibri', size: 11 },
        alignment: { vertical: 'middle', horizontal: 'left' },
    };
    const numberStyle = {
        font: { name: 'Calibri', size: 11 },
        alignment: { vertical: 'middle', horizontal: 'right' },
        numFmt: '0',
    };
    const quantityStyle = {
        font: { name: 'Calibri', size: 11 },
        alignment: { vertical: 'middle', horizontal: 'right' },
        numFmt: '#,##0;(#,##0);0',
    };
    worksheet.columns = [
        { header: 'Date', key: 'date', width: 14, style: defaultStyle },
        { header: 'Type', key: 'type', width: 10, style: defaultStyle },
        { header: 'Van Inventory No', key: 'van_inventory_no', width: 18, style: numberStyle },
        { header: 'User Name', key: 'user_name', width: 28, style: defaultStyle },
        { header: 'Product', key: 'product', width: 28, style: defaultStyle },
        { header: 'Tracking Type', key: 'tracking_type', width: 16, style: defaultStyle },
        { header: 'Quantity', key: 'quantity', width: 12, style: quantityStyle },
        { header: 'Batch / Serials', key: 'batch_serials', width: 18, style: defaultStyle },
    ];
    const headerRow = worksheet.getRow(1);
    headerRow.height = 20;
    headerRow.eachCell((cell, colNumber) => {
        cell.font = { name: 'Calibri', size: 11, bold: true };
        if (colNumber === 3 || colNumber === 7) {
            cell.alignment = { vertical: 'middle', horizontal: 'right' };
        }
        else {
            cell.alignment = { vertical: 'middle', horizontal: 'left' };
        }
    });
    if (typeof headerRow.commit === 'function') {
        headerRow.commit();
    }
}
function writeVanInventoryBatchToWorksheet(worksheet, data) {
    for (const vanInventory of data) {
        const dateObj = vanInventory.document_date || vanInventory.createdate;
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
        const rawType = (vanInventory.loading_type || 'L').toString().toUpperCase();
        const typeStr = rawType === 'U' || rawType === 'UNLOAD' ? 'Unload' : 'Load';
        const isUnload = rawType === 'U' || rawType === 'UNLOAD';
        const userName = vanInventory.van_inventory_users?.name || '';
        const vanInventoryNo = vanInventory.id;
        const items = vanInventory.van_inventory_items_inventory || [];
        if (items.length === 0) {
            const row = worksheet.addRow({
                date: formattedDate,
                type: typeStr,
                van_inventory_no: vanInventoryNo,
                user_name: userName,
                product: '',
                tracking_type: '',
                quantity: '',
                batch_serials: '',
            });
            row.height = 19;
            if (typeof row.commit === 'function') {
                row.commit();
            }
        }
        else {
            for (const item of items) {
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
                const rawQty = Number(item.quantity) || 0;
                const qtyVal = isUnload ? -Math.abs(rawQty) : Math.abs(rawQty);
                const row = worksheet.addRow({
                    date: formattedDate,
                    type: typeStr,
                    van_inventory_no: vanInventoryNo,
                    user_name: userName,
                    product: productName,
                    tracking_type: trackingType,
                    quantity: qtyVal,
                    batch_serials: batchSerial,
                });
                row.height = 19;
                if (typeof row.commit === 'function') {
                    row.commit();
                }
            }
        }
    }
}
async function generateVanInventoryExcelWorkbook(rows) {
    const WorkbookConstructor = ExcelJS.Workbook ||
        ExcelJS.default?.Workbook ||
        ExcelJS.default;
    const workbook = new WorkbookConstructor();
    const worksheet = workbook.addWorksheet('Van Inventory', {
        views: [{ showGridLines: true }],
    });
    setupVanInventoryWorksheet(worksheet);
    for (const rowData of rows) {
        const isUnload = String(rowData.type).toLowerCase() === 'unload';
        let qtyVal = rowData.quantity;
        if (typeof rowData.quantity === 'number') {
            qtyVal = isUnload ? -Math.abs(rowData.quantity) : Math.abs(rowData.quantity);
        }
        else if (typeof rowData.quantity === 'string' && rowData.quantity.trim() !== '') {
            const parsed = Number(rowData.quantity.replace(/[()]/g, ''));
            if (!isNaN(parsed)) {
                qtyVal = isUnload ? -Math.abs(parsed) : Math.abs(parsed);
            }
        }
        const row = worksheet.addRow({
            date: rowData.date,
            type: rowData.type,
            van_inventory_no: rowData.vanInventoryNo,
            user_name: rowData.userName,
            product: rowData.product,
            tracking_type: rowData.trackingType,
            quantity: qtyVal,
            batch_serials: rowData.batchSerials,
        });
        row.height = 19;
    }
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
}
//# sourceMappingURL=vanInventory-import-export.service.js.map