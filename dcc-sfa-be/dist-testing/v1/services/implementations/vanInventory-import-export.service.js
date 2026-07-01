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
const import_export_service_1 = require("../base/import-export.service");
const prisma_client_1 = __importDefault(require("../../../configs/prisma.client"));
const inventory_utils_1 = require("../../utils/inventory.utils");
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
        const userIds = users.map(u => u.id);
        const productIds = products.map(p => p.id);
        const vehicleIds = vehicles.map(v => v.id);
        const depotIds = depots.map(d => d.id);
        const userId1 = userIds[0] || 1;
        const userId2 = userIds[1] || 1;
        const userId3 = userIds[2] || 1;
        const p1 = productIds[0] || 1;
        const p2 = productIds[1] || p1;
        const p3 = productIds[2] || p1;
        const p4 = productIds[3] || p1;
        const p5 = productIds[4] || p2;
        const p6 = productIds[5] || p3;
        const p7 = productIds[6] || p1;
        const p8 = productIds[7] || p2;
        const p9 = productIds[8] || p3;
        const vehicleId1 = vehicleIds[0] || 1;
        const vehicleId2 = vehicleIds[1] || 1;
        const vehicleId3 = vehicleIds[2] || 1;
        const depotId1 = depotIds[0] || 1;
        const depotId2 = depotIds[1] || depotId1;
        const depotId3 = depotIds[2] || depotId1;
        return [
            {
                user_id: userId1,
                loading_type: 'L',
                document_date: '2024-01-20',
                vehicle_id: vehicleId1,
                location_id: depotId1,
                product_id: p1,
                quantity: 50,
                batch_number: 'B001',
            },
            {
                user_id: userId1,
                loading_type: 'L',
                document_date: '2024-01-20',
                vehicle_id: vehicleId1,
                location_id: depotId1,
                product_id: p1,
                quantity: 30,
                batch_number: 'B002',
            },
            {
                user_id: userId1,
                loading_type: 'L',
                document_date: '2024-01-20',
                vehicle_id: vehicleId1,
                location_id: depotId1,
                product_id: p2,
                quantity: 2,
                batch_number: 'B003',
                serial_numbers: 'SN001, SN002',
            },
            {
                user_id: userId1,
                loading_type: 'L',
                document_date: '2024-01-20',
                vehicle_id: vehicleId1,
                location_id: depotId1,
                product_id: p2,
                quantity: 1,
                batch_number: 'B003',
                serial_numbers: 'SN003',
            },
            {
                user_id: userId1,
                loading_type: 'L',
                document_date: '2024-01-20',
                vehicle_id: vehicleId1,
                location_id: depotId1,
                product_id: p3,
                quantity: 100,
                batch_number: 'B004',
            },
            {
                user_id: userId2,
                loading_type: 'L',
                document_date: '2024-01-21',
                vehicle_id: vehicleId2,
                location_id: depotId2,
                product_id: p4,
                quantity: 20,
                batch_number: 'B005',
            },
            {
                user_id: userId2,
                loading_type: 'L',
                document_date: '2024-01-21',
                vehicle_id: vehicleId2,
                location_id: depotId2,
                product_id: p5,
                quantity: 1,
                batch_number: 'B006',
                serial_numbers: 'SN004',
            },
            {
                user_id: userId2,
                loading_type: 'L',
                document_date: '2024-01-21',
                vehicle_id: vehicleId2,
                location_id: depotId2,
                product_id: p6,
                quantity: 50,
                batch_number: 'B007',
            },
            {
                user_id: userId3,
                loading_type: 'L',
                document_date: '2024-01-22',
                vehicle_id: vehicleId3,
                location_id: depotId3,
                product_id: p7,
                quantity: 200,
                batch_number: 'B008',
            },
            {
                user_id: userId3,
                loading_type: 'L',
                document_date: '2024-01-22',
                vehicle_id: vehicleId3,
                location_id: depotId3,
                product_id: p8,
                quantity: 500,
                batch_number: 'B009',
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
                        batch_number: item.batch_lots?.batch_number || '',
                        serial_numbers: item.serial_numbers?.serial_number || '',
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
        const locationModel = tx ? tx.depots : prisma_client_1.default.depots;
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
    async exportToExcel(options = {}) {
        const query = {
            where: options.filters,
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
                            select: { id: true, name: true, code: true },
                        },
                        batch_lots: {
                            select: { batch_number: true },
                        },
                        serial_numbers: {
                            select: { serial_number: true },
                        },
                    },
                },
            },
        };
        if (options.limit)
            query.take = options.limit;
        const data = await this.getModel().findMany(query);
        const workbook = new (await Promise.resolve().then(() => __importStar(require('exceljs')))).Workbook();
        const worksheet = workbook.addWorksheet(this.displayName);
        const exportColumns = [
            ...this.columns,
            { header: 'ID', key: 'id', width: 12 },
            { header: 'User Name', key: 'user_name', width: 20 },
            { header: 'Vehicle Number', key: 'vehicle_number', width: 20 },
            { header: 'Location Name', key: 'location_name', width: 20 },
            { header: 'Items Count', key: 'items_count', width: 15 },
            { header: 'Created Date', key: 'created_date', width: 15 },
            { header: 'Created By', key: 'created_by', width: 15 },
            { header: 'Updated Date', key: 'updated_date', width: 15 },
            { header: 'Updated By', key: 'updated_by', width: 15 },
        ];
        worksheet.columns = exportColumns.map(col => ({
            header: col.header,
            key: col.key,
            width: col.width || 20,
        }));
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' },
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.height = 25;
        const exportData = await this.transformDataForExport(data);
        exportData.forEach((row, index) => {
            const excelRow = worksheet.addRow({
                ...row,
                user_name: data[index]?.van_inventory_users?.name || '',
                vehicle_number: data[index]?.vehicle?.vehicle_number || '',
                items_count: data[index]?.van_inventory_items_inventory?.length || 0,
            });
            if (index % 2 === 0) {
                excelRow.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFF2F2F2' },
                };
            }
            excelRow.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
            });
        });
        if (data.length > 0) {
            worksheet.autoFilter = {
                from: 'A1',
                to: `${String.fromCharCode(64 + exportColumns.length)}${data.length + 1}`,
            };
        }
        const summaryRow = worksheet.addRow([]);
        summaryRow.getCell(1).value = `Total Van Inventory Records: ${data.length}`;
        summaryRow.getCell(1).font = { bold: true };
        worksheet.views = [{ state: 'frozen', ySplit: 1 }];
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
}
exports.VanInventoryImportExportService = VanInventoryImportExportService;
//# sourceMappingURL=vanInventory-import-export.service.js.map