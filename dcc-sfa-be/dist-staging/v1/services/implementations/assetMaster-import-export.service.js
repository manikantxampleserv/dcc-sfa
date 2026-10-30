"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetMasterImportExportService = void 0;
const exceljs_1 = __importDefault(require("exceljs"));
const import_export_service_1 = require("../base/import-export.service");
const prisma_client_1 = __importDefault(require("../../../configs/prisma.client"));
class AssetMasterImportExportService extends import_export_service_1.ImportExportService {
    modelName = 'asset_master';
    displayName = 'Asset Master';
    uniqueFields = ['serial_number'];
    searchFields = [
        'serial_number',
        'current_location',
        'current_status',
        'assigned_to',
    ];
    masterTableConfigs = [
        {
            masterTable: 'asset_types',
            masterKey: 'id',
            masterDisplayFields: ['id', 'name', 'description'],
            sheetName: 'Ref - Asset Types',
            description: 'Use the ID from this sheet in the Asset Type ID column',
        },
        {
            masterTable: 'asset_sub_types',
            masterKey: 'id',
            masterDisplayFields: ['id', 'name', 'code', 'asset_type_id'],
            sheetName: 'Ref - Asset Sub Types',
            description: 'Use the ID from this sheet in the Asset Sub Type ID column',
        },
        {
            masterTable: 'asset_brands',
            masterKey: 'id',
            masterDisplayFields: ['id', 'name'],
            sheetName: 'Ref - Asset Brands',
            description: 'Use the ID from this sheet in the Brand ID column',
        },
        {
            masterTable: 'users',
            masterKey: 'id',
            masterDisplayFields: ['id', 'name', 'email', 'employee_id'],
            sheetName: 'Ref - Users',
            description: 'Use the ID from this sheet in the Assigned To column',
        },
        {
            masterTable: 'depots',
            masterKey: 'id',
            masterDisplayFields: ['id', 'name', 'code'],
            sheetName: 'Ref - Depots',
            description: 'Use the ID from this sheet in the Depot ID column',
        },
        {
            masterTable: 'customers',
            masterKey: 'id',
            masterDisplayFields: ['id', 'name', 'code'],
            sheetName: 'Ref - Customers',
            description: 'Use the ID from this sheet for customer locations',
        },
    ];
    columns = [
        {
            key: 'serial_number',
            header: 'Serial Number',
            width: 25,
            required: true,
            type: 'string',
            validation: value => {
                if (!value || value.length < 1)
                    return 'Serial number is required';
                if (value.length > 100)
                    return 'Serial number must be less than 100 characters';
                return true;
            },
            transform: value => value.toString().toUpperCase().trim(),
            description: 'Unique serial number (required, max 100 chars)',
        },
        {
            key: 'barcode',
            header: 'Barcode',
            width: 20,
            required: false,
            type: 'string',
            validation: value => {
                if (value && value.length > 255)
                    return 'Barcode must be less than 255 characters';
                return true;
            },
            transform: value => value?.toString().trim() || null,
            description: 'Asset barcode (optional)',
        },
        {
            key: 'nfc_tag',
            header: 'NFC Tag',
            width: 20,
            required: false,
            type: 'string',
            validation: value => {
                if (value && value.length > 255)
                    return 'NFC Tag must be less than 255 characters';
                return true;
            },
            transform: value => value?.toString().trim() || null,
            description: 'Asset NFC Tag (optional)',
        },
        {
            key: 'depot_id',
            header: 'Depot ID',
            width: 15,
            required: false,
            type: 'number',
            transform: value => (value ? parseInt(value) : null),
            description: 'ID of the depot (optional)',
        },
        {
            key: 'depot_name',
            header: 'Depot Name',
            width: 25,
            required: false,
            type: 'string',
            description: 'Name of the depot (export only)',
        },
        {
            key: 'outlet_id',
            header: 'Outlet ID',
            width: 15,
            required: false,
            type: 'number',
            transform: value => (value ? parseInt(value) : null),
            description: 'ID of the outlet/customer (optional)',
        },
        {
            key: 'outlet_name',
            header: 'Outlet Name',
            width: 25,
            required: false,
            type: 'string',
            description: 'Name of the outlet/customer (export only)',
        },
        {
            key: 'name',
            header: 'Asset Name',
            width: 30,
            required: true,
            type: 'string',
            validation: value => {
                if (!value || value.length < 1)
                    return 'Asset name is required';
                if (value.length > 255)
                    return 'Asset name must be less than 255 characters';
                return true;
            },
            transform: value => value?.trim() || '',
            description: 'Name of the asset (required, max 255 chars)',
        },
        {
            key: 'code',
            header: 'Asset Code',
            width: 20,
            required: false,
            type: 'string',
            validation: value => {
                if (value && typeof value === 'string' && value.trim() === '') {
                    return 'Asset code cannot be empty string';
                }
                if (value && value.length > 255)
                    return 'Asset code must be less than 255 characters';
                return true;
            },
            transform: value => (value && value.trim() !== '' ? value.trim() : null),
            description: 'Asset code (optional, defaults to Serial Number if empty)',
        },
        {
            key: 'asset_type_id',
            header: 'Asset Type ID',
            width: 15,
            required: true,
            type: 'number',
            transform: value => parseInt(value),
            description: 'ID of asset type (required)',
        },
        {
            key: 'asset_type_name',
            header: 'Asset Type Name',
            width: 20,
            required: false,
            type: 'string',
            description: 'Name of asset type (export only)',
        },
        {
            key: 'asset_sub_type_id',
            header: 'Asset Sub Type ID',
            width: 15,
            required: false,
            type: 'number',
            transform: value => (value ? parseInt(value) : null),
            description: 'ID of asset sub type (optional)',
        },
        {
            key: 'asset_sub_type_name',
            header: 'Asset Sub Type Name',
            width: 20,
            required: false,
            type: 'string',
            description: 'Name of asset sub type (export only)',
        },
        {
            key: 'asset_brand_id',
            header: 'Brand ID',
            width: 15,
            required: false,
            type: 'number',
            transform: value => (value ? parseInt(value) : null),
            description: 'ID of asset brand (optional)',
        },
        {
            key: 'asset_brand_name',
            header: 'Brand Name',
            width: 20,
            required: false,
            type: 'string',
            description: 'Name of asset brand (export only)',
        },
        {
            key: 'purchase_date',
            header: 'Purchase Date',
            width: 15,
            type: 'date',
            transform: value => (value ? new Date(value) : null),
            description: 'Date of purchase (optional, format: YYYY-MM-DD)',
        },
        {
            key: 'warranty_expiry',
            header: 'Warranty Expiry',
            width: 15,
            type: 'date',
            transform: value => (value ? new Date(value) : null),
            description: 'Warranty expiry date (optional, format: YYYY-MM-DD)',
        },
        {
            key: 'installation_date',
            header: 'Installation Date',
            width: 18,
            required: false,
            type: 'date',
            transform: value => (value ? new Date(value) : null),
            description: 'Date of installation (optional, format: YYYY-MM-DD)',
        },
        {
            key: 'last_scanned_date',
            header: 'Last Scanned Date',
            width: 20,
            required: false,
            type: 'date',
            transform: value => (value ? new Date(value) : null),
            description: 'Last scanned date (optional, format: YYYY-MM-DD)',
        },
        {
            key: 'last_scanned_by',
            header: 'Last Scanned By',
            width: 25,
            required: false,
            type: 'string',
            description: 'Name of user who last scanned/inspected (export only)',
        },
        {
            key: 'current_location',
            header: 'Current Location',
            width: 30,
            type: 'string',
            validation: value => !value ||
                value.length <= 255 ||
                'Current location must be less than 255 characters',
            description: 'Current location of the asset (optional, max 255 chars)',
        },
        {
            key: 'current_status',
            header: 'Current Status',
            width: 20,
            type: 'string',
            validation: value => {
                if (!value)
                    return true;
                const validStatuses = [
                    'Available',
                    'In Use',
                    'Under Maintenance',
                    'Retired',
                    'Lost',
                    'Damaged',
                ];
                return (validStatuses.includes(value) ||
                    `Status must be one of: ${validStatuses.join(', ')}`);
            },
            description: 'Current status: Available, In Use, Under Maintenance, Retired, Lost, Damaged',
        },
        {
            key: 'assigned_to',
            header: 'Assigned To',
            width: 25,
            type: 'string',
            validation: value => !value ||
                value.length <= 100 ||
                'Assigned to must be less than 100 characters',
            description: 'Person or department assigned to (optional, max 100 chars)',
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
        const assetType = await prisma_client_1.default.asset_types.findFirst({
            where: { is_active: 'Y' },
        });
        const assetSubType = await prisma_client_1.default.asset_sub_types.findFirst({
            where: { is_active: 'Y' },
        });
        const assetBrand = await prisma_client_1.default.asset_brands.findFirst({
            where: { is_active: 'Y' },
        });
        return [
            {
                name: 'Small Display Cooler',
                code: 'COOLER-SM-001',
                asset_type_id: assetType?.id || 1,
                asset_type_name: assetType?.name || 'Cooler',
                asset_sub_type_id: assetSubType?.id || 1,
                asset_sub_type_name: assetSubType?.name || 'Small Cooler',
                asset_brand_id: assetBrand?.id || 1,
                asset_brand_name: assetBrand?.name || 'Samsung',
                serial_number: 'COOLER-001-2024',
                barcode: 'BC123456789',
                nfc_tag: 'NFC123456789',
                depot_id: 1,
                depot_name: 'Main Depot',
                outlet_id: null,
                outlet_name: '',
                purchase_date: '2024-01-15',
                warranty_expiry: '2026-01-15',
                installation_date: '2024-01-20',
                last_scanned_date: '2024-02-01',
                last_scanned_by: 'John Doe',
                current_location: 'Main Warehouse - Section A',
                current_status: 'Available',
                assigned_to: 'Warehouse Team',
                is_active: 'Y',
            },
        ];
    }
    getColumnDescription(key) {
        const column = this.columns.find(col => col.key === key);
        return column?.description || '';
    }
    /**
     * Builds the export query with necessary relational includes and filters
     * @param options Export query options
     * @returns Prisma query configuration object
     */
    buildExportQuery(options = {}) {
        const where = options.filters || options.where || {};
        return {
            where,
            orderBy: options.orderBy || { id: 'desc' },
            include: {
                asset_master_asset_types: true,
                asset_master_asset_sub_types: true,
                asset_master_brands: true,
                asset_master_depot: true,
                asset_master_outlet: true,
                asset_master_last_read: {
                    select: {
                        id: true,
                        name: true,
                        employee_id: true,
                    },
                },
                cooler_asset_master: {
                    select: {
                        id: true,
                        last_scanned_date: true,
                        cooler_inspections: {
                            where: { is_active: 'Y' },
                            orderBy: {
                                inspection_date: 'desc',
                            },
                            take: 1,
                            select: {
                                inspection_date: true,
                                users: {
                                    select: {
                                        id: true,
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        };
    }
    /**
     * Helper to convert 1-based column number to Excel column letter
     * @param colNumber 1-based column number
     * @returns Excel column letter (e.g. A, B, ..., Z, AA, AB)
     */
    getColumnLetter(colNumber) {
        let letter = '';
        while (colNumber > 0) {
            const mod = (colNumber - 1) % 26;
            letter = String.fromCharCode(65 + mod) + letter;
            colNumber = Math.floor((colNumber - mod) / 26);
        }
        return letter;
    }
    /**
     * Streams the exported asset master data in batches to prevent MSSQL parameter limit issues
     * @param res HTTP response stream
     * @param options Export options including filters, limit, and sorting
     */
    async exportToExcelStream(res, options = {}) {
        const WorkbookWriter = exceljs_1.default.stream?.xlsx?.WorkbookWriter ||
            exceljs_1.default.default?.stream?.xlsx?.WorkbookWriter;
        const workbook = new WorkbookWriter({
            stream: res,
            useStyles: true,
        });
        const worksheet = workbook.addWorksheet(this.displayName, {
            views: [{ state: 'frozen', ySplit: 1, showGridLines: true }],
        });
        worksheet.columns = this.columns.map(col => ({
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
        if (typeof headerRow.commit === 'function') {
            headerRow.commit();
        }
        const BATCH_SIZE = 500;
        let offset = 0;
        let hasMore = true;
        const maxLimit = options.limit ? Number(options.limit) : Infinity;
        let totalProcessed = 0;
        const query = this.buildExportQuery(options);
        while (hasMore) {
            const currentTake = Math.min(BATCH_SIZE, maxLimit - totalProcessed);
            if (currentTake <= 0)
                break;
            const batchQuery = {
                ...query,
                take: currentTake,
                skip: offset,
            };
            const batchData = await this.getModel().findMany(batchQuery);
            if (!batchData || batchData.length === 0) {
                break;
            }
            const transformedRows = await this.transformDataForExport(batchData);
            transformedRows.forEach((row, index) => {
                const excelRow = worksheet.addRow(row);
                const globalIndex = totalProcessed + index;
                if (globalIndex % 2 === 0) {
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
                if (typeof excelRow.commit === 'function') {
                    excelRow.commit();
                }
            });
            totalProcessed += batchData.length;
            offset += batchData.length;
            if (batchData.length < currentTake) {
                hasMore = false;
            }
        }
        const summaryRow = worksheet.addRow([]);
        summaryRow.getCell(1).value = `Total Records: ${totalProcessed}`;
        summaryRow.getCell(1).font = { bold: true };
        if (typeof summaryRow.commit === 'function') {
            summaryRow.commit();
        }
        worksheet.commit();
        await workbook.commit();
    }
    /**
     * Generates an Excel buffer of asset master data in batches to prevent MSSQL parameter limit issues
     * @param options Export options including filters, limit, and sorting
     * @returns Excel file buffer
     */
    async exportToExcel(options = {}) {
        const WorkbookConstructor = exceljs_1.default.Workbook ||
            exceljs_1.default.default?.Workbook ||
            exceljs_1.default.default;
        const workbook = new WorkbookConstructor();
        const worksheet = workbook.addWorksheet(this.displayName, {
            views: [{ state: 'frozen', ySplit: 1, showGridLines: true }],
        });
        worksheet.columns = this.columns.map(col => ({
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
        const BATCH_SIZE = 500;
        let offset = 0;
        let hasMore = true;
        const maxLimit = options.limit ? Number(options.limit) : Infinity;
        let totalProcessed = 0;
        const query = this.buildExportQuery(options);
        while (hasMore) {
            const currentTake = Math.min(BATCH_SIZE, maxLimit - totalProcessed);
            if (currentTake <= 0)
                break;
            const batchQuery = {
                ...query,
                take: currentTake,
                skip: offset,
            };
            const batchData = await this.getModel().findMany(batchQuery);
            if (!batchData || batchData.length === 0) {
                break;
            }
            const transformedRows = await this.transformDataForExport(batchData);
            transformedRows.forEach((row, index) => {
                const excelRow = worksheet.addRow(row);
                const globalIndex = totalProcessed + index;
                if (globalIndex % 2 === 0) {
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
            totalProcessed += batchData.length;
            offset += batchData.length;
            if (batchData.length < currentTake) {
                hasMore = false;
            }
        }
        if (totalProcessed > 0) {
            worksheet.autoFilter = {
                from: 'A1',
                to: `${this.getColumnLetter(this.columns.length)}${totalProcessed + 1}`,
            };
        }
        const summaryRow = worksheet.addRow([]);
        summaryRow.getCell(1).value = `Total Records: ${totalProcessed}`;
        summaryRow.getCell(1).font = { bold: true };
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
    async transformDataForExport(data) {
        return data.map(asset => {
            const latestInspection = asset.cooler_asset_master?.[0]?.cooler_inspections?.[0];
            const scanDate = asset.last_scanned_date ||
                latestInspection?.inspection_date ||
                asset.cooler_asset_master?.[0]?.last_scanned_date ||
                null;
            const scannedByUser = asset.asset_master_last_read?.name ||
                latestInspection?.users?.name ||
                '';
            return {
                serial_number: asset.serial_number,
                barcode: asset.barcode || '',
                nfc_tag: asset.nfc_tag || '',
                depot_id: asset.depot_id || '',
                depot_name: asset.asset_master_depot?.name || '',
                outlet_id: asset.outlet_id || '',
                outlet_name: asset.asset_master_outlet?.name || '',
                name: asset.name || '',
                code: asset.code || '',
                asset_type_id: asset.asset_type_id,
                asset_type_name: asset.asset_master_asset_types?.name || '',
                asset_sub_type_id: asset.asset_sub_type_id || '',
                asset_sub_type_name: asset.asset_master_asset_sub_types?.name || '',
                asset_brand_id: asset.asset_brand_id || '',
                asset_brand_name: asset.asset_master_brands?.name || '',
                purchase_date: asset.purchase_date
                    ? (asset.purchase_date instanceof Date
                        ? asset.purchase_date.toISOString().split('T')[0]
                        : String(asset.purchase_date).split('T')[0])
                    : '',
                warranty_expiry: asset.warranty_expiry
                    ? (asset.warranty_expiry instanceof Date
                        ? asset.warranty_expiry.toISOString().split('T')[0]
                        : String(asset.warranty_expiry).split('T')[0])
                    : '',
                installation_date: asset.installation_date
                    ? (asset.installation_date instanceof Date
                        ? asset.installation_date.toISOString().split('T')[0]
                        : String(asset.installation_date).split('T')[0])
                    : '',
                last_scanned_date: scanDate
                    ? (scanDate instanceof Date
                        ? scanDate.toISOString().split('T')[0]
                        : String(scanDate).split('T')[0])
                    : '',
                last_scanned_by: scannedByUser,
                current_location: asset.current_location || '',
                current_status: asset.current_status || '',
                assigned_to: asset.assigned_to || '',
                is_active: asset.is_active || 'Y',
                created_date: asset.createdate
                    ? (asset.createdate instanceof Date
                        ? asset.createdate.toISOString().split('T')[0]
                        : String(asset.createdate).split('T')[0])
                    : '',
                created_by: asset.createdby || '',
                updated_date: asset.updatedate
                    ? (asset.updatedate instanceof Date
                        ? asset.updatedate.toISOString().split('T')[0]
                        : String(asset.updatedate).split('T')[0])
                    : '',
                updated_by: asset.updatedby || '',
            };
        });
    }
    async checkDuplicate(data, tx) {
        const model = tx ? tx.asset_master : prisma_client_1.default.asset_master;
        const existing = await model.findFirst({
            where: { serial_number: data.serial_number },
        });
        if (existing) {
            return `Asset with serial number ${data.serial_number} already exists (${existing.name})`;
        }
        return null;
    }
    async validateForeignKeys(data, tx) {
        const prismaClient = tx || prisma_client_1.default;
        const assetType = await prismaClient.asset_types.findUnique({
            where: { id: data.asset_type_id },
        });
        if (!assetType) {
            return `Asset type with ID ${data.asset_type_id} does not exist`;
        }
        if (data.asset_sub_type_id) {
            const assetSubType = await prismaClient.asset_sub_types.findUnique({
                where: { id: data.asset_sub_type_id },
            });
            if (!assetSubType) {
                return `Asset sub type with ID ${data.asset_sub_type_id} does not exist`;
            }
            if (assetSubType.asset_type_id !== data.asset_type_id) {
                return `Asset sub type with ID ${data.asset_sub_type_id} does not belong to asset type ${data.asset_type_id}`;
            }
        }
        if (data.asset_brand_id) {
            const brand = await prismaClient.asset_brands.findUnique({
                where: { id: data.asset_brand_id },
            });
            if (!brand) {
                return `Brand with ID ${data.asset_brand_id} does not exist`;
            }
        }
        if (data.depot_id) {
            const depot = await prismaClient.depots.findUnique({
                where: { id: data.depot_id },
            });
            if (!depot) {
                return `Depot with ID ${data.depot_id} does not exist`;
            }
        }
        if (data.outlet_id) {
            const outlet = await prismaClient.customers.findUnique({
                where: { id: data.outlet_id },
            });
            if (!outlet) {
                return `Outlet with ID ${data.outlet_id} does not exist`;
            }
        }
        return null;
    }
    async prepareDataForImport(data, userId, tx) {
        let assetCode = null;
        if (data.code && typeof data.code === 'string' && data.code.trim() !== '') {
            assetCode = data.code.trim();
        }
        else {
            assetCode = data.serial_number;
        }
        const baseData = {
            name: data.name,
            code: assetCode,
            serial_number: data.serial_number,
            barcode: data.barcode || null,
            nfc_tag: data.nfc_tag || null,
            purchase_date: data.purchase_date || null,
            warranty_expiry: data.warranty_expiry || null,
            installation_date: data.installation_date || null,
            last_scanned_date: data.last_scanned_date || null,
            current_location: data.current_location || null,
            current_status: data.current_status || 'Available',
            assigned_to: data.assigned_to || null,
            is_active: data.is_active || 'Y',
            createdate: new Date(),
            createdby: userId,
            log_inst: 1,
        };
        const relationshipData = {
            asset_master_asset_types: {
                connect: { id: data.asset_type_id },
            },
        };
        if (data.asset_sub_type_id) {
            relationshipData.asset_master_asset_sub_types = {
                connect: { id: data.asset_sub_type_id },
            };
        }
        if (data.asset_brand_id) {
            relationshipData.asset_master_brands = {
                connect: { id: data.asset_brand_id },
            };
        }
        if (data.depot_id) {
            relationshipData.asset_master_depot = {
                connect: { id: data.depot_id },
            };
        }
        if (data.outlet_id) {
            relationshipData.asset_master_outlet = {
                connect: { id: data.outlet_id },
            };
        }
        const finalData = {
            ...baseData,
            ...relationshipData,
        };
        return finalData;
    }
    async updateExisting(data, userId, tx) {
        const model = tx ? tx.asset_master : prisma_client_1.default.asset_master;
        const existing = await model.findFirst({
            where: { serial_number: data.serial_number },
            select: { id: true, name: true, serial_number: true },
        });
        if (!existing)
            return null;
        const updateData = {
            name: data.name,
            code: data.code || undefined,
            barcode: data.barcode !== undefined ? data.barcode : undefined,
            nfc_tag: data.nfc_tag !== undefined ? data.nfc_tag : undefined,
            purchase_date: data.purchase_date !== undefined ? data.purchase_date : undefined,
            warranty_expiry: data.warranty_expiry !== undefined ? data.warranty_expiry : undefined,
            installation_date: data.installation_date !== undefined
                ? data.installation_date
                : undefined,
            last_scanned_date: data.last_scanned_date !== undefined
                ? data.last_scanned_date
                : undefined,
            current_location: data.current_location !== undefined ? data.current_location : undefined,
            current_status: data.current_status || undefined,
            assigned_to: data.assigned_to || undefined,
            is_active: data.is_active || undefined,
            updatedby: userId,
            updatedate: new Date(),
        };
        if (data.asset_type_id) {
            updateData.asset_master_asset_types = {
                connect: { id: data.asset_type_id },
            };
        }
        if (data.asset_sub_type_id) {
            updateData.asset_master_asset_sub_types = {
                connect: { id: data.asset_sub_type_id },
            };
        }
        if (data.asset_brand_id) {
            updateData.asset_master_brands = {
                connect: { id: data.asset_brand_id },
            };
        }
        if (data.depot_id) {
            updateData.asset_master_depot = {
                connect: { id: data.depot_id },
            };
        }
        if (data.outlet_id) {
            updateData.asset_master_outlet = {
                connect: { id: data.outlet_id },
            };
        }
        return await model.update({
            where: { id: existing.id },
            data: updateData,
        });
    }
}
exports.AssetMasterImportExportService = AssetMasterImportExportService;
//# sourceMappingURL=assetMaster-import-export.service.js.map