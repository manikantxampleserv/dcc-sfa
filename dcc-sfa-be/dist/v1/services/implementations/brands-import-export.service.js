"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandsImportExportService = void 0;
const import_export_service_1 = require("../base/import-export.service");
const prisma_client_1 = __importDefault(require("../../../configs/prisma.client"));
class BrandsImportExportService extends import_export_service_1.ImportExportService {
    modelName = 'brands';
    displayName = 'Brands';
    uniqueFields = ['name'];
    searchFields = ['name', 'code', 'description'];
    lastNumberCache = new Map();
    async generateBrandCode(name, tx) {
        const prefix = name.slice(0, 3).toUpperCase();
        const db = tx || prisma_client_1.default;
        if (!this.lastNumberCache.has(prefix)) {
            try {
                const lastBrand = await db.brands.findFirst({
                    where: { code: { startsWith: prefix } },
                    orderBy: { id: 'desc' },
                    select: { code: true },
                });
                let lastNum = 0;
                if (lastBrand && lastBrand.code) {
                    const match = lastBrand.code.match(/(\d+)$/);
                    if (match) {
                        lastNum = parseInt(match[1], 10);
                    }
                }
                this.lastNumberCache.set(prefix, lastNum);
            }
            catch (error) {
                return `${prefix}${Date.now().toString().slice(-3)}`;
            }
        }
        const nextNum = (this.lastNumberCache.get(prefix) || 0) + 1;
        this.lastNumberCache.set(prefix, nextNum);
        return `${prefix}${nextNum.toString().padStart(3, '0')}`;
    }
    columns = [
        {
            key: 'name',
            header: 'Brand Name',
            width: 25,
            required: true,
            type: 'string',
            validation: value => {
                if (!value)
                    return 'Brand name is required';
                if (value.length < 2)
                    return 'Brand name must be at least 2 characters';
                if (value.length > 100)
                    return 'Brand name too long';
                return true;
            },
            transform: value => value.toString().trim(),
            description: 'Name of the brand (required)',
        },
        {
            key: 'code',
            header: 'Brand Code',
            width: 15,
            type: 'string',
            transform: value => value ? value.toString().trim().toUpperCase() : null,
            description: 'Brand code (optional, auto-generated if empty)',
        },
        {
            key: 'description',
            header: 'Description',
            width: 30,
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
            { name: 'Coca-Cola', code: 'COC001', description: 'Soft drink brand', is_active: 'Y' },
        ];
    }
    getColumnDescription(key) {
        const column = this.columns.find(col => col.key === key);
        return column?.description || '';
    }
    async transformDataForExport(data) {
        return data.map(brand => ({
            name: brand.name,
            code: brand.code,
            description: brand.description || '',
            is_active: brand.is_active || 'Y',
            createdate: brand.createdate?.toISOString().split('T')[0] || '',
            createdby: brand.createdby || '',
            updatedate: brand.updatedate?.toISOString().split('T')[0] || '',
            updatedby: brand.updatedby || '',
        }));
    }
    async checkDuplicate(data, tx) {
        const model = tx ? tx.brands : prisma_client_1.default.brands;
        const existing = await model.findFirst({ where: { name: data.name } });
        return existing ? `Brand "${data.name}" already exists` : null;
    }
    async validateForeignKeys(data, tx) {
        return null;
    }
    async prepareDataForImport(data, userId, tx) {
        const code = data.code || await this.generateBrandCode(data.name, tx);
        return {
            name: data.name,
            code,
            description: data.description || null,
            is_active: data.is_active || 'Y',
            createdate: new Date(),
            createdby: userId,
            log_inst: 1,
        };
    }
    async updateExisting(data, userId, tx) {
        const model = tx ? tx.brands : prisma_client_1.default.brands;
        const existing = await model.findFirst({ where: { name: data.name } });
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
exports.BrandsImportExportService = BrandsImportExportService;
//# sourceMappingURL=brands-import-export.service.js.map