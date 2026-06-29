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
exports.AssetMovementsImportExportService = void 0;
const import_export_service_1 = require("../base/import-export.service");
const prisma_client_1 = __importDefault(require("../../../configs/prisma.client"));
class AssetMovementsImportExportService extends import_export_service_1.ImportExportService {
    modelName = 'asset_movements';
    displayName = 'Asset Movements';
    uniqueFields = ['asset_id', 'movement_date', 'performed_by'];
    searchFields = [
        'from_direction',
        'to_direction',
        'movement_type',
        'notes',
    ];
    masterTableConfigs = [
        {
            masterTable: 'asset_master',
            masterKey: 'id',
            masterDisplayFields: ['id', 'name', 'serial_number', 'asset_code'],
            sheetName: 'Ref - Assets',
            description: 'Use the ID from this sheet in the Asset ID column',
        },
        {
            masterTable: 'users',
            masterKey: 'id',
            masterDisplayFields: ['id', 'name', 'email', 'employee_id'],
            sheetName: 'Ref - Users',
            description: 'Use the ID from this sheet in the Performed By ID column',
        },
        {
            masterTable: 'depots',
            masterKey: 'id',
            masterDisplayFields: ['id', 'name', 'code'],
            sheetName: 'Ref - Depots',
            description: 'Use the ID from this sheet for depot locations',
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
            key: 'asset_id',
            header: 'Asset ID',
            width: 15,
            required: true,
            type: 'number',
            validation: value => {
                if (!value)
                    return 'Asset ID is required';
                const id = parseInt(value);
                if (isNaN(id) || id <= 0)
                    return 'Asset ID must be a positive number';
                return true;
            },
            transform: value => parseInt(value),
            description: 'ID of the asset being moved (required)',
        },
        {
            key: 'from_direction',
            header: 'From Direction',
            width: 15,
            type: 'string',
            validation: value => {
                if (!value)
                    return true;
                const valid = ['depot', 'outlet'];
                return valid.includes(value.toLowerCase()) || 'Must be depot or outlet';
            },
            transform: value => (value ? value.toLowerCase() : null),
            description: 'Source type: depot or outlet',
        },
        {
            key: 'from_depot_id',
            header: 'From Depot ID',
            width: 15,
            type: 'number',
            validation: value => {
                if (!value)
                    return true;
                return !isNaN(parseInt(value)) || 'Must be a valid number';
            },
            transform: value => (value ? parseInt(value) : null),
            description: 'ID if source is a depot',
        },
        {
            key: 'from_customer_id',
            header: 'From Customer ID',
            width: 15,
            type: 'number',
            validation: value => {
                if (!value)
                    return true;
                return !isNaN(parseInt(value)) || 'Must be a valid number';
            },
            transform: value => (value ? parseInt(value) : null),
            description: 'ID if source is an outlet',
        },
        {
            key: 'to_direction',
            header: 'To Direction',
            width: 15,
            type: 'string',
            validation: value => {
                if (!value)
                    return true;
                const valid = ['depot', 'outlet'];
                return valid.includes(value.toLowerCase()) || 'Must be depot or outlet';
            },
            transform: value => (value ? value.toLowerCase() : null),
            description: 'Destination type: depot or outlet',
        },
        {
            key: 'to_depot_id',
            header: 'To Depot ID',
            width: 15,
            type: 'number',
            validation: value => {
                if (!value)
                    return true;
                return !isNaN(parseInt(value)) || 'Must be a valid number';
            },
            transform: value => (value ? parseInt(value) : null),
            description: 'ID if destination is a depot',
        },
        {
            key: 'to_customer_id',
            header: 'To Customer ID',
            width: 15,
            type: 'number',
            validation: value => {
                if (!value)
                    return true;
                return !isNaN(parseInt(value)) || 'Must be a valid number';
            },
            transform: value => (value ? parseInt(value) : null),
            description: 'ID if destination is an outlet',
        },
        {
            key: 'movement_type',
            header: 'Movement Type',
            width: 20,
            type: 'string',
            defaultValue: 'transfer',
            validation: value => {
                if (!value)
                    return true;
                const validTypes = [
                    'transfer',
                    'maintenance',
                    'repair',
                    'disposal',
                    'return',
                    'other',
                ];
                return (validTypes.includes(value.toLowerCase()) ||
                    `Movement type must be one of: ${validTypes.join(', ')}`);
            },
            transform: value => (value ? value.toLowerCase() : 'transfer'),
            description: 'Movement type: transfer, maintenance, repair, disposal, return, other (defaults to transfer)',
        },
        {
            key: 'movement_date',
            header: 'Movement Date',
            width: 20,
            type: 'date',
            validation: value => {
                if (!value)
                    return 'Movement date is required';
                if (isNaN(Date.parse(value)))
                    return 'Invalid date format (use YYYY-MM-DD)';
                return true;
            },
            transform: value => new Date(value),
            description: 'Date of movement (required, YYYY-MM-DD format)',
        },
        {
            key: 'performed_by',
            header: 'Performed By ID',
            width: 15,
            required: true,
            type: 'number',
            validation: value => {
                if (!value)
                    return 'Performed by ID is required';
                const id = parseInt(value);
                if (isNaN(id) || id <= 0)
                    return 'Performed by ID must be a positive number';
                return true;
            },
            transform: value => parseInt(value),
            description: 'ID of the user who performed the movement (required)',
        },
        {
            key: 'notes',
            header: 'Notes',
            width: 40,
            type: 'string',
            validation: value => !value ||
                value.length <= 1000 ||
                'Notes must be less than 1000 characters',
            description: 'Additional notes about the movement (optional, max 1000 chars)',
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
        const assets = await prisma_client_1.default.asset_master.findMany({
            take: 3,
            select: { id: true, serial_number: true },
            orderBy: { id: 'asc' },
        });
        const users = await prisma_client_1.default.users.findMany({
            take: 2,
            select: { id: true, name: true },
            orderBy: { id: 'asc' },
        });
        const depots = await prisma_client_1.default.depots.findMany({
            take: 2,
            select: { id: true },
            orderBy: { id: 'asc' },
        });
        const customers = await prisma_client_1.default.customers.findMany({
            take: 1,
            select: { id: true },
            orderBy: { id: 'asc' },
        });
        const assetIds = assets.map(a => a.id);
        const userIds = users.map(u => u.id);
        const assetId1 = assetIds[0] || 999;
        const assetId2 = assetIds[1] || 999;
        const assetId3 = assetIds[2] || 999;
        const userId1 = userIds[0] || 999;
        const userId2 = userIds[1] || 999;
        const depotId1 = depots[0]?.id || 999;
        const depotId2 = depots[1]?.id || 999;
        const customerId1 = customers[0]?.id || 999;
        return [
            {
                asset_id: assetId1,
                from_direction: 'depot',
                from_depot_id: depotId1,
                to_direction: 'outlet',
                to_customer_id: customerId1,
                movement_type: 'transfer',
                movement_date: '2024-01-15',
                performed_by: userId1,
                notes: 'Regular transfer to retail location',
                is_active: 'Y',
            },
            {
                asset_id: assetId2,
                from_direction: 'outlet',
                from_customer_id: customerId1,
                to_direction: 'depot',
                to_depot_id: depotId2,
                movement_type: 'maintenance',
                movement_date: '2024-01-16',
                performed_by: userId2,
                notes: 'Scheduled maintenance check',
                is_active: 'Y',
            },
            {
                asset_id: assetId3,
                from_direction: 'depot',
                from_depot_id: depotId2,
                to_direction: 'outlet',
                to_customer_id: customerId1,
                movement_type: 'return',
                movement_date: '2024-01-17',
                performed_by: userId1,
                notes: 'Returned after maintenance completion',
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
            asset_id: movement.asset_movement_assets?.[0]?.asset_id || '',
            asset_name: movement.asset_movement_assets?.[0]?.asset_movement_assets_asset
                ?.name || '',
            asset_serial: movement.asset_movement_assets?.[0]?.asset_movement_assets_asset
                ?.serial_number || '',
            from_direction: movement.from_direction || '',
            from_depot_id: movement.from_depot_id || '',
            from_customer_id: movement.from_customer_id || '',
            to_direction: movement.to_direction || '',
            to_depot_id: movement.to_depot_id || '',
            to_customer_id: movement.to_customer_id || '',
            movement_type: movement.movement_type || '',
            movement_date: movement.movement_date
                ? new Date(movement.movement_date).toISOString().split('T')[0]
                : '',
            performed_by: movement.performed_by || '',
            performed_by_name: movement.asset_movements_performed_by?.name || '',
            performed_by_email: movement.asset_movements_performed_by?.email || '',
            notes: movement.notes || '',
            is_active: movement.is_active || 'Y',
            created_date: movement.createdate
                ? new Date(movement.createdate).toISOString().split('T')[0]
                : '',
            created_by: movement.createdby || '',
            updated_date: movement.updatedate
                ? new Date(movement.updatedate).toISOString().split('T')[0]
                : '',
            updated_by: movement.updatedby || '',
        }));
    }
    async checkDuplicate(data, tx) {
        const model = tx ? tx.asset_movements : prisma_client_1.default.asset_movements;
        // Check for duplicate movement (same asset, date, and performer)
        if (data.asset_id && data.movement_date && data.performed_by) {
            const movementDate = new Date(data.movement_date);
            const startOfDay = new Date(movementDate.setHours(0, 0, 0, 0));
            const endOfDay = new Date(movementDate.setHours(23, 59, 59, 999));
            const existingMovement = await model.findFirst({
                where: {
                    asset_movement_assets: {
                        some: {
                            asset_id: data.asset_id,
                        },
                    },
                    performed_by: data.performed_by,
                    movement_date: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                },
            });
            if (existingMovement) {
                return `Movement already exists for Asset ID ${data.asset_id} by User ID ${data.performed_by} on ${data.movement_date}`;
            }
        }
        return null;
    }
    async validateForeignKeys(data, tx) {
        const prismaClient = tx || prisma_client_1.default;
        // Validate asset exists
        if (data.asset_id) {
            try {
                const asset = await prismaClient.asset_master.findUnique({
                    where: { id: data.asset_id },
                });
                if (!asset) {
                    return `Asset with ID ${data.asset_id} does not exist`;
                }
            }
            catch (error) {
                return `Invalid Asset ID ${data.asset_id}`;
            }
        }
        // Validate user exists
        if (data.performed_by) {
            try {
                const user = await prismaClient.users.findUnique({
                    where: { id: data.performed_by },
                });
                if (!user) {
                    return `User with ID ${data.performed_by} does not exist`;
                }
            }
            catch (error) {
                return `Invalid User ID ${data.performed_by}`;
            }
        }
        if (data.from_depot_id) {
            const depot = await prismaClient.depots.findUnique({
                where: { id: data.from_depot_id },
            });
            if (!depot)
                return `From Depot ID ${data.from_depot_id} does not exist`;
        }
        if (data.to_depot_id) {
            const depot = await prismaClient.depots.findUnique({
                where: { id: data.to_depot_id },
            });
            if (!depot)
                return `To Depot ID ${data.to_depot_id} does not exist`;
        }
        if (data.from_customer_id) {
            const customer = await prismaClient.customers.findUnique({
                where: { id: data.from_customer_id },
            });
            if (!customer)
                return `From Customer ID ${data.from_customer_id} does not exist`;
        }
        if (data.to_customer_id) {
            const customer = await prismaClient.customers.findUnique({
                where: { id: data.to_customer_id },
            });
            if (!customer)
                return `To Customer ID ${data.to_customer_id} does not exist`;
        }
        return null;
    }
    async prepareDataForImport(data, userId) {
        return {
            asset_movement_assets: {
                create: {
                    asset_id: data.asset_id,
                    createdby: userId,
                    createdate: new Date(),
                    is_active: data.is_active || 'Y',
                },
            },
            from_direction: data.from_direction || null,
            from_depot_id: data.from_depot_id || null,
            from_customer_id: data.from_customer_id || null,
            to_direction: data.to_direction || null,
            to_depot_id: data.to_depot_id || null,
            to_customer_id: data.to_customer_id || null,
            movement_type: data.movement_type || 'transfer',
            movement_date: data.movement_date,
            performed_by: data.performed_by,
            notes: data.notes || null,
            status: 'A',
            approval_status: 'A',
            approved_by: userId,
            approved_at: new Date(),
            is_active: data.is_active || 'Y',
            createdby: userId,
            createdate: new Date(),
            log_inst: 1,
        };
    }
    async updateExisting(data, userId, tx) {
        const model = tx ? tx.asset_movements : prisma_client_1.default.asset_movements;
        const movementDate = new Date(data.movement_date);
        const startOfDay = new Date(movementDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(movementDate.setHours(23, 59, 59, 999));
        const existing = await model.findFirst({
            where: {
                asset_movement_assets: {
                    some: {
                        asset_id: data.asset_id,
                    },
                },
                performed_by: data.performed_by,
                movement_date: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
        });
        if (!existing)
            return null;
        const updateData = {
            from_direction: data.from_direction !== undefined
                ? data.from_direction
                : existing.from_direction,
            from_depot_id: data.from_depot_id !== undefined
                ? data.from_depot_id
                : existing.from_depot_id,
            from_customer_id: data.from_customer_id !== undefined
                ? data.from_customer_id
                : existing.from_customer_id,
            to_direction: data.to_direction !== undefined
                ? data.to_direction
                : existing.to_direction,
            to_depot_id: data.to_depot_id !== undefined
                ? data.to_depot_id
                : existing.to_depot_id,
            to_customer_id: data.to_customer_id !== undefined
                ? data.to_customer_id
                : existing.to_customer_id,
            movement_type: data.movement_type || existing.movement_type,
            movement_date: data.movement_date || existing.movement_date,
            performed_by: data.performed_by,
            notes: data.notes !== undefined ? data.notes : existing.notes,
            is_active: data.is_active || existing.is_active,
            updatedby: userId,
            updatedate: new Date(),
        };
        return await model.update({
            where: { id: existing.id },
            data: updateData,
        });
    }
    async exportToExcel(options = {}) {
        const query = {
            where: options.filters,
            orderBy: options.orderBy || { movement_date: 'desc' },
            include: {
                asset_movement_assets: {
                    include: {
                        asset_movement_assets_asset: {
                            select: {
                                name: true,
                                serial_number: true,
                            },
                        },
                    },
                },
                asset_movements_performed_by: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        };
        if (options.limit)
            query.take = options.limit;
        const data = await this.getModel().findMany(query);
        const ExcelJS = await Promise.resolve().then(() => __importStar(require('exceljs')));
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(this.displayName);
        const exportColumns = [
            { header: 'Movement ID', key: 'id', width: 12 },
            ...this.columns,
            { header: 'Asset Name', key: 'asset_name', width: 25 },
            { header: 'Asset Serial', key: 'asset_serial', width: 20 },
            { header: 'Performed By Name', key: 'performed_by_name', width: 25 },
            { header: 'Performed By Email', key: 'performed_by_email', width: 30 },
            { header: 'Created Date', key: 'created_date', width: 20 },
            { header: 'Created By', key: 'created_by', width: 15 },
            { header: 'Updated Date', key: 'updated_date', width: 20 },
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
        let totalMovements = 0;
        let activeMovements = 0;
        let inactiveMovements = 0;
        const movementTypeCount = {};
        const assetMovementCount = {};
        exportData.forEach((row, index) => {
            const movement = data[index];
            row.id = movement.id;
            row.asset_name =
                movement.asset_movement_assets?.[0]?.asset_movement_assets_asset
                    ?.name || '';
            row.asset_serial =
                movement.asset_movement_assets?.[0]?.asset_movement_assets_asset
                    ?.serial_number || '';
            row.performed_by_name = movement.asset_movements_performed_by?.name || '';
            row.performed_by_email =
                movement.asset_movements_performed_by?.email || '';
            totalMovements++;
            if (movement.is_active === 'Y')
                activeMovements++;
            if (movement.is_active === 'N')
                inactiveMovements++;
            if (movement.movement_type) {
                movementTypeCount[movement.movement_type] =
                    (movementTypeCount[movement.movement_type] || 0) + 1;
            }
            const assetName = movement.asset_movement_assets?.[0]?.asset_movement_assets_asset
                ?.name || 'Unknown';
            assetMovementCount[assetName] = (assetMovementCount[assetName] || 0) + 1;
            const excelRow = worksheet.addRow(row);
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
            const typeCell = excelRow.getCell('movement_type');
            switch (movement.movement_type?.toLowerCase()) {
                case 'transfer':
                    typeCell.font = { color: { argb: 'FF0000FF' }, bold: true };
                    break;
                case 'maintenance':
                    typeCell.font = { color: { argb: 'FFFF8C00' }, bold: true };
                    break;
                case 'repair':
                    typeCell.font = { color: { argb: 'FFFF0000' }, bold: true };
                    break;
                case 'disposal':
                    typeCell.font = { color: { argb: 'FF808080' }, bold: true };
                    break;
                case 'return':
                    typeCell.font = { color: { argb: 'FF008000' }, bold: true };
                    break;
            }
        });
        if (data.length > 0) {
            worksheet.autoFilter = {
                from: 'A1',
                to: `${String.fromCharCode(64 + exportColumns.length)}${data.length + 1}`,
            };
        }
        worksheet.views = [{ state: 'frozen', ySplit: 1 }];
        const summarySheet = workbook.addWorksheet('Summary');
        summarySheet.columns = [
            { header: 'Metric', key: 'metric', width: 35 },
            { header: 'Value', key: 'value', width: 20 },
        ];
        const summaryHeaderRow = summarySheet.getRow(1);
        summaryHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        summaryHeaderRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' },
        };
        summarySheet.addRow({ metric: 'Total Movements', value: totalMovements });
        summarySheet.addRow({ metric: 'Active Movements', value: activeMovements });
        summarySheet.addRow({
            metric: 'Inactive Movements',
            value: inactiveMovements,
        });
        summarySheet.addRow({ metric: '', value: '' });
        summarySheet.addRow({ metric: 'Movement Type Breakdown', value: '' });
        Object.keys(movementTypeCount).forEach(type => {
            summarySheet.addRow({
                metric: `  ${type.charAt(0).toUpperCase() + type.slice(1)}`,
                value: movementTypeCount[type],
            });
        });
        summarySheet.addRow({ metric: '', value: '' });
        summarySheet.addRow({ metric: 'Movements by Asset', value: '' });
        Object.keys(assetMovementCount)
            .sort((a, b) => assetMovementCount[b] - assetMovementCount[a])
            .slice(0, 10)
            .forEach(asset => {
            summarySheet.addRow({
                metric: `  ${asset}`,
                value: assetMovementCount[asset],
            });
        });
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
}
exports.AssetMovementsImportExportService = AssetMovementsImportExportService;
//# sourceMappingURL=assetMovements-import-export.service.js.map