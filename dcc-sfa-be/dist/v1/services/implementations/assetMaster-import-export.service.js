"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetMasterImportExportService = void 0;
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
    columns = [
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
            description: 'Asset code (optional, max 255 chars, auto-generated if empty)',
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
                if (!/^[A-Za-z0-9\-_]+$/.test(value))
                    return 'Serial number can only contain letters, numbers, hyphens, and underscores';
                return true;
            },
            transform: value => value.toUpperCase().trim(),
            description: 'Unique serial number (required, max 100 chars, alphanumeric)',
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
        return [
            {
                name: 'Small Display Cooler',
                code: 'COOLER-SM-001',
                asset_type_id: 1,
                asset_type_name: 'Cooler',
                asset_sub_type_id: 1,
                asset_sub_type_name: 'Small Cooler',
                serial_number: 'COOLER-001-2024',
                purchase_date: '2024-01-15',
                warranty_expiry: '2026-01-15',
                current_location: 'Main Warehouse - Section A',
                current_status: 'Available',
                assigned_to: 'Warehouse Team',
                is_active: 'Y',
            },
            {
                name: 'Large Storage Fridge',
                code: 'FRIDGE-LG-002',
                asset_type_id: 2,
                asset_type_name: 'Fridge',
                asset_sub_type_id: 3,
                asset_sub_type_name: 'Large Fridge',
                serial_number: 'FRIDGE-002-2024',
                purchase_date: '2024-02-20',
                warranty_expiry: '2027-02-20',
                current_location: 'Store #001 - Downtown',
                current_status: 'In Use',
                assigned_to: 'Store Manager',
                is_active: 'Y',
            },
            {
                name: 'Medium Display Cooler',
                code: 'COOLER-MD-003',
                asset_type_id: 1,
                asset_type_name: 'Cooler',
                asset_sub_type_id: 2,
                asset_sub_type_name: 'Medium Cooler',
                serial_number: 'COOLER-003-2023',
                purchase_date: '2023-12-10',
                warranty_expiry: '2025-12-10',
                current_location: 'Maintenance Workshop',
                current_status: 'Under Maintenance',
                assigned_to: 'Maintenance Team',
                is_active: 'Y',
            },
        ];
    }
    getColumnDescription(key) {
        const column = this.columns.find(col => col.key === key);
        return column?.description || '';
    }
    async exportToExcel(options = {}) {
        const exportOptions = {
            ...options,
            include: {
                asset_master_asset_types: true,
                asset_master_asset_sub_types: true,
            },
        };
        return super.exportToExcel(exportOptions);
    }
    async transformDataForExport(data) {
        return data.map(asset => ({
            name: asset.name || '',
            code: asset.code || '',
            asset_type_id: asset.asset_type_id,
            asset_type_name: asset.asset_master_asset_types?.name || '',
            asset_sub_type_id: asset.asset_sub_type_id || '',
            asset_sub_type_name: asset.asset_master_asset_sub_types?.name || '',
            serial_number: asset.serial_number,
            purchase_date: asset.purchase_date
                ? asset.purchase_date.toISOString().split('T')[0]
                : '',
            warranty_expiry: asset.warranty_expiry
                ? asset.warranty_expiry.toISOString().split('T')[0]
                : '',
            current_location: asset.current_location || '',
            current_status: asset.current_status || '',
            assigned_to: asset.assigned_to || '',
            is_active: asset.is_active || 'Y',
            created_date: asset.createdate?.toISOString().split('T')[0] || '',
            created_by: asset.createdby || '',
            updated_date: asset.updatedate?.toISOString().split('T')[0] || '',
            updated_by: asset.updatedby || '',
        }));
    }
    async checkDuplicate(data, tx) {
        const model = tx ? tx.asset_master : prisma_client_1.default.asset_master;
        const existingSerial = await model.findFirst({
            where: { serial_number: data.serial_number },
        });
        if (existingSerial) {
            return `Asset with serial number ${data.serial_number} already exists`;
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
        return null;
    }
    async generateAssetCode(name) {
        const prefix = name.slice(0, 3).toUpperCase();
        const lastAssetCode = await prisma_client_1.default.asset_master.findFirst({
            orderBy: { id: 'desc' },
            select: { code: true },
        });
        let newNumber = 1;
        if (lastAssetCode && lastAssetCode.code) {
            const match = lastAssetCode.code.match(/(\d+)$/);
            if (match) {
                newNumber = parseInt(match[1], 10) + 1;
            }
        }
        return `${prefix}-${newNumber.toString().padStart(3, '0')}`;
    }
    async prepareDataForImport(data, userId) {
        // Debug logging to identify the issue
        console.log('DEBUG: prepareDataForImport received data:', data);
        console.log('DEBUG: data.code value:', data.code);
        console.log('DEBUG: typeof data.code:', typeof data.code);
        let assetCode = null;
        if (data.code && typeof data.code === 'string' && data.code.trim() !== '') {
            assetCode = data.code.trim();
        }
        else {
            assetCode = await this.generateAssetCode(data.name);
        }
        const baseData = {
            name: data.name,
            code: assetCode,
            serial_number: data.serial_number,
            purchase_date: data.purchase_date || null,
            warranty_expiry: data.warranty_expiry || null,
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
        const finalData = {
            ...baseData,
            ...relationshipData,
        };
        console.log('DEBUG: finalData being returned:', finalData);
        console.log('DEBUG: finalData.code value:', finalData.code);
        console.log('DEBUG: typeof finalData.code:', typeof finalData.code);
        return finalData;
    }
    async updateExisting(data, userId, tx) {
        const model = tx ? tx.asset_master : prisma_client_1.default.asset_master;
        const existing = await model.findFirst({
            where: { serial_number: data.serial_number },
        });
        if (!existing)
            return null;
        const updateData = {
            ...data,
            updatedby: userId,
            updatedate: new Date(),
        };
        return await model.update({
            where: { id: existing.id },
            data: updateData,
        });
    }
}
exports.AssetMasterImportExportService = AssetMasterImportExportService;
//# sourceMappingURL=assetMaster-import-export.service.js.map