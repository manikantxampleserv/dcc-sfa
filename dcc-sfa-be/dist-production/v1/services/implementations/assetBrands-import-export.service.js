"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetBrandsImportExportService = void 0;
const import_export_service_1 = require("../base/import-export.service");
const prisma_client_1 = __importDefault(require("../../../configs/prisma.client"));
class AssetBrandsImportExportService extends import_export_service_1.ImportExportService {
    modelName = 'asset_brands';
    displayName = 'Asset Brands';
    uniqueFields = ['code', 'name'];
    searchFields = ['name', 'code', 'description'];
    codeCounters = new Map();
    columns = [
        {
            key: 'name',
            header: 'Asset Brand Name',
            width: 30,
            required: true,
            type: 'string',
            validation: value => {
                if (!value || value.length < 2)
                    return 'Name too short';
                if (value.length > 255)
                    return 'Name too long';
                return true;
            },
            description: 'Name of the asset brand (required)',
        },
        {
            key: 'code',
            header: 'Code',
            width: 20,
            required: false,
            type: 'string',
            description: 'Unique code for the asset brand (optional)',
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
        return [
            { name: 'Samsung', code: 'AB-SAMS-01', description: 'Samsung Electronics', is_active: 'Y' },
        ];
    }
    getColumnDescription(key) {
        const column = this.columns.find(col => col.key === key);
        return column?.description || '';
    }
    async transformDataForExport(data) {
        return data.map(assetBrand => ({
            name: assetBrand.name,
            code: assetBrand.code,
            description: assetBrand.description || '',
            is_active: assetBrand.is_active || 'Y',
            created_date: assetBrand.createdate?.toISOString().split('T')[0] || '',
            created_by: assetBrand.createdby || '',
            updated_date: assetBrand.updatedate?.toISOString().split('T')[0] || '',
            updated_by: assetBrand.updatedby || '',
        }));
    }
    async checkDuplicate(data, tx) {
        const model = tx ? tx.asset_brands : prisma_client_1.default.asset_brands;
        if (data.code) {
            const existingCode = await model.findUnique({ where: { code: data.code } });
            if (existingCode)
                return `Asset brand with code ${data.code} already exists`;
        }
        const existingName = await model.findFirst({ where: { name: data.name } });
        if (existingName)
            return `Asset brand with name ${data.name} already exists`;
        return null;
    }
    async validateForeignKeys(_data, _tx) {
        return null;
    }
    async generateCode(name) {
        const firstWord = name.toUpperCase().split(/\s+/)[0];
        const abbreviation = firstWord.substring(0, 4);
        const baseCode = `AB-${abbreviation}`;
        const currentCount = this.codeCounters.get(baseCode) || 0;
        const nextCount = currentCount + 1;
        this.codeCounters.set(baseCode, nextCount);
        return `${baseCode}-${nextCount.toString().padStart(2, '0')}`;
    }
    async initializeCodeCounters(tx) {
        try {
            const model = tx ? tx.asset_brands : prisma_client_1.default.asset_brands;
            const existingCodes = await model.findMany({
                select: { code: true },
                where: { code: { startsWith: 'AB-' } },
            });
            for (const item of existingCodes) {
                const match = item.code?.match(/^AB-([A-Z]+)-(\d+)$/);
                if (match) {
                    const baseCode = `AB-${match[1]}`;
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
        const finalCode = data.code || await this.generateCode(data.name);
        return {
            ...data,
            code: finalCode,
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
        const model = tx ? tx.asset_brands : prisma_client_1.default.asset_brands;
        const existing = await model.findFirst({
            where: { OR: [{ code: data.code }, { name: data.name }] },
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
exports.AssetBrandsImportExportService = AssetBrandsImportExportService;
//# sourceMappingURL=assetBrands-import-export.service.js.map