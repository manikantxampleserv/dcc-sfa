"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoolerTypesImportExportService = void 0;
const import_export_service_1 = require("../base/import-export.service");
const prisma_client_1 = __importDefault(require("../../../configs/prisma.client"));
class CoolerTypesImportExportService extends import_export_service_1.ImportExportService {
    modelName = 'cooler_types';
    displayName = 'Cooler Types';
    uniqueFields = ['name', 'code'];
    searchFields = ['name', 'code', 'description'];
    columns = [
        {
            key: 'name',
            header: 'Cooler Type Name',
            width: 30,
            required: true,
            type: 'string',
            validation: value => {
                if (!value || value.length < 2)
                    return 'Name must be at least 2 characters';
                if (value.length > 255)
                    return 'Name must be less than 255 characters';
                return true;
            },
            description: 'Name of the cooler type (required, 2-255 characters)',
        },
        {
            key: 'code',
            header: 'Code',
            width: 20,
            type: 'string',
            validation: value => !value ||
                value.length <= 100 ||
                'Code must be less than 100 characters',
            description: 'Unique code for the cooler type (optional, max 100 chars)',
        },
        {
            key: 'description',
            header: 'Description',
            width: 40,
            type: 'string',
            validation: value => {
                if (!value)
                    return true;
                return typeof value === 'string'
                    ? true
                    : 'Description must be a valid string';
            },
            description: 'Description of the cooler type (optional)',
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
                name: 'COOLER',
                code: 'CT-COOL',
                description: 'Standard cooler type',
                is_active: 'Y',
            },
            {
                name: 'WATER DISPENSER',
                code: 'CT-WD',
                description: 'Water dispenser type',
                is_active: 'Y',
            },
        ];
    }
    getColumnDescription(key) {
        const column = this.columns.find(col => col.key === key);
        return column?.description || '';
    }
    async transformDataForExport(data) {
        return data.map(coolerType => ({
            name: coolerType.name,
            code: coolerType.code || '',
            description: coolerType.description || '',
            is_active: coolerType.is_active || 'Y',
            created_date: coolerType.createdate?.toISOString().split('T')[0] || '',
            created_by: coolerType.createdby || '',
            updated_date: coolerType.updatedate?.toISOString().split('T')[0] || '',
            updated_by: coolerType.updatedby || '',
        }));
    }
    async checkDuplicate(data, tx) {
        const model = tx ? tx.cooler_types : prisma_client_1.default.cooler_types;
        const existingName = await model.findFirst({
            where: { name: data.name },
        });
        if (existingName) {
            return `Cooler type with name ${data.name} already exists`;
        }
        if (data.code) {
            const existingCode = await model.findFirst({
                where: { code: data.code },
            });
            if (existingCode) {
                return `Cooler type with code ${data.code} already exists`;
            }
        }
        return null;
    }
    async validateForeignKeys(data, tx) {
        return null;
    }
    async prepareDataForImport(data, userId) {
        const generateCode = (name) => {
            const words = name.toUpperCase().split(/\s+/);
            const firstWord = words[0];
            let abbreviation = firstWord.substring(0, 4);
            if (firstWord.length <= 4) {
                abbreviation = firstWord;
            }
            return `CT-${abbreviation}`;
        };
        return {
            ...data,
            code: data.code || generateCode(data.name),
            createdby: userId,
            createdate: new Date(),
            log_inst: 1,
        };
    }
    async updateExisting(data, userId, tx) {
        const model = tx ? tx.cooler_types : prisma_client_1.default.cooler_types;
        const existing = await model.findFirst({
            where: { name: data.name },
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
exports.CoolerTypesImportExportService = CoolerTypesImportExportService;
//# sourceMappingURL=coolerTypes-import-export.service.js.map