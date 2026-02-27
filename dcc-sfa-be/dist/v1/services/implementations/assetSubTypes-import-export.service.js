"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetSubTypesImportExportService = void 0;
const import_export_service_1 = require("../base/import-export.service");
const prisma_client_1 = __importDefault(require("../../../configs/prisma.client"));
class AssetSubTypesImportExportService extends import_export_service_1.ImportExportService {
    modelName = 'asset_sub_types';
    displayName = 'Asset Sub Types';
    uniqueFields = ['name', 'asset_type_id'];
    searchFields = ['name', 'description', 'code'];
    columns = [
        {
            key: 'name',
            header: 'Asset Sub Type Name',
            width: 30,
            required: true,
            type: 'string',
            validation: value => {
                if (!value || value.length < 2)
                    return 'Name must be at least 2 characters';
                if (value.length > 100)
                    return 'Name must be less than 100 characters';
                return true;
            },
            description: 'Name of the asset sub type (required, 2-100 characters)',
        },
        {
            key: 'asset_type_id',
            header: 'Asset Type ID',
            width: 15,
            required: true,
            type: 'number',
            validation: value => {
                if (!value)
                    return 'Asset Type ID is required';
                const num = Number(value);
                if (isNaN(num) || num <= 0)
                    return 'Asset Type ID must be a positive number';
                return true;
            },
            transform: value => (value ? Number(value) : null),
            description: 'Foreign key reference to asset_types.id (required)',
        },
        {
            key: 'description',
            header: 'Description',
            width: 40,
            type: 'string',
            validation: value => !value ||
                value.length <= 255 ||
                'Description must be less than 255 characters',
            description: 'Description of the asset sub type (optional, max 255 chars)',
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
        // Sample assumes asset type IDs exist in the database
        return [
            {
                name: 'Single Door',
                asset_type_id: 1,
                description: 'Single door cooler subtype',
                is_active: 'Y',
            },
            {
                name: 'Double Door',
                asset_type_id: 1,
                description: 'Double door cooler subtype',
                is_active: 'Y',
            },
            {
                name: 'Counter Top',
                asset_type_id: 2,
                description: 'Counter top display subtype',
                is_active: 'Y',
            },
        ];
    }
    getColumnDescription(key) {
        const column = this.columns.find(col => col.key === key);
        return column?.description || '';
    }
    async transformDataForExport(data) {
        return data.map(subType => ({
            name: subType.name,
            asset_type_id: subType.asset_type_id,
            description: subType.description || '',
            is_active: subType.is_active || 'Y',
        }));
    }
    async checkDuplicate(data, tx) {
        const model = tx ? tx.asset_sub_types : prisma_client_1.default.asset_sub_types;
        const existing = await model.findFirst({
            where: { name: data.name, asset_type_id: data.asset_type_id },
        });
        if (existing) {
            return `Asset sub type "${data.name}" already exists for asset type ID ${data.asset_type_id}`;
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
        return null;
    }
    async generateCode(name, tx) {
        const words = name.toUpperCase().split(/\s+/);
        const firstWord = words[0];
        let abbreviation = firstWord.substring(0, 4);
        if (firstWord.length <= 4) {
            abbreviation = firstWord;
        }
        const baseCode = `AST-${abbreviation}`;
        const model = tx ? tx.asset_sub_types : prisma_client_1.default.asset_sub_types;
        const existingCodes = await model.findMany({
            where: {
                code: {
                    startsWith: baseCode,
                },
            },
            select: {
                code: true,
            },
            orderBy: {
                code: 'desc',
            },
            take: 1,
        });
        let nextNumber = 1;
        if (existingCodes.length > 0) {
            const lastCode = existingCodes[0].code;
            const match = lastCode.match(new RegExp(`${baseCode.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}-(\\d+)$`));
            if (match) {
                nextNumber = parseInt(match[1]) + 1;
            }
        }
        return `${baseCode}-${nextNumber.toString().padStart(2, '0')}`;
    }
    async prepareDataForImport(data, userId) {
        const code = await this.generateCode(data.name);
        return {
            ...data,
            code,
            createdby: userId,
            createdate: new Date(),
            log_inst: 1,
        };
    }
    async updateExisting(data, userId, tx) {
        const model = tx ? tx.asset_sub_types : prisma_client_1.default.asset_sub_types;
        const existing = await model.findFirst({
            where: { name: data.name, asset_type_id: data.asset_type_id },
        });
        if (!existing)
            return null;
        return await model.update({
            where: { id: existing.id },
            data: {
                ...data,
                updatedby: userId,
                updatedate: new Date(),
            },
        });
    }
}
exports.AssetSubTypesImportExportService = AssetSubTypesImportExportService;
//# sourceMappingURL=assetSubTypes-import-export.service.js.map