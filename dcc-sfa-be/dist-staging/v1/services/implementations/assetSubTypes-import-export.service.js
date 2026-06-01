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
    masterTableConfigs = [
        {
            masterTable: 'asset_types',
            masterKey: 'id',
            masterDisplayFields: ['id', 'name', 'description'],
            sheetName: 'Ref - Asset Types',
            description: 'Use the ID from this sheet in the Asset Type ID column',
        },
    ];
    codeCounters = new Map();
    validationCache = new Map();
    columns = [
        {
            key: 'name',
            header: 'Asset Sub Type Name',
            width: 30,
            required: true,
            type: 'string',
            validation: value => {
                if (!value || value.length < 2)
                    return 'Name too short';
                if (value.length > 100)
                    return 'Name too long';
                return true;
            },
            description: 'Name of the asset sub type (required)',
        },
        {
            key: 'asset_type_id',
            header: 'Asset Type ID',
            width: 15,
            required: true,
            type: 'number',
            transform: value => (value ? Number(value) : null),
            description: 'Foreign key reference to asset_types.id (required)',
        },
        {
            key: 'description',
            header: 'Description',
            width: 40,
            type: 'string',
            description: 'Description (optional)',
        },
        {
            key: 'is_active',
            header: 'Is Active',
            width: 12,
            type: 'string',
            defaultValue: 'Y',
            transform: value => (value ? value.toString().toUpperCase() : 'Y'),
            description: 'Active status (Y/N)',
        },
    ];
    async getSampleData() {
        const type = await prisma_client_1.default.asset_types.findFirst({ select: { id: true } });
        return [
            { name: 'Single Door', asset_type_id: type?.id || 1, description: 'Single door cooler', is_active: 'Y' },
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
        return existing ? `Asset sub type "${data.name}" already exists for this type` : null;
    }
    async validateForeignKeys(data, tx) {
        const prismaClient = tx || prisma_client_1.default;
        const cacheKey = `assetType_${data.asset_type_id}`;
        if (this.validationCache.has(cacheKey)) {
            return this.validationCache.get(cacheKey);
        }
        const assetType = await prismaClient.asset_types.findUnique({
            where: { id: data.asset_type_id },
        });
        const result = assetType ? null : `Asset type ID ${data.asset_type_id} does not exist`;
        this.validationCache.set(cacheKey, result);
        return result;
    }
    async generateCode(name) {
        const words = name.toUpperCase().split(/\s+/);
        const firstWord = words[0];
        const abbreviation = firstWord.substring(0, 4);
        const baseCode = `AST-${abbreviation}`;
        const currentCount = this.codeCounters.get(baseCode) || 0;
        const nextCount = currentCount + 1;
        this.codeCounters.set(baseCode, nextCount);
        return `${baseCode}-${nextCount.toString().padStart(2, '0')}`;
    }
    async initializeCodeCounters(tx) {
        try {
            const model = tx ? tx.asset_sub_types : prisma_client_1.default.asset_sub_types;
            const existingCodes = await model.findMany({
                select: { code: true },
                where: { code: { startsWith: 'AST-' } },
            });
            for (const item of existingCodes) {
                const match = item.code?.match(/^AST-([A-Z]+)-(\d+)$/);
                if (match) {
                    const baseCode = `AST-${match[1]}`;
                    const number = parseInt(match[2]);
                    const currentMax = this.codeCounters.get(baseCode) || 0;
                    if (number > currentMax)
                        this.codeCounters.set(baseCode, number);
                }
            }
        }
        catch (error) {
            console.error('Error initializing code counters:', error);
        }
    }
    async prepareDataForImport(data, userId, tx) {
        const code = await this.generateCode(data.name);
        return {
            ...data,
            code,
            createdby: userId,
            createdate: new Date(),
            log_inst: 1,
        };
    }
    async importData(data, userId, options = {}) {
        await this.initializeCodeCounters();
        return super.importData(data, userId, options);
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