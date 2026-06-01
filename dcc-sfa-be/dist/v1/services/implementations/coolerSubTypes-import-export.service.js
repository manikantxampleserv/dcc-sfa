"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoolerSubTypesImportExportService = void 0;
const import_export_service_1 = require("../base/import-export.service");
const prisma_client_1 = __importDefault(require("../../../configs/prisma.client"));
class CoolerSubTypesImportExportService extends import_export_service_1.ImportExportService {
    modelName = 'cooler_sub_types';
    displayName = 'Cooler Sub Types';
    uniqueFields = ['name', 'code'];
    searchFields = ['name', 'code', 'description'];
    columns = [
        {
            key: 'name',
            header: 'Cooler Sub Type Name',
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
            description: 'Name of the cooler sub type (required, 2-255 characters)',
        },
        {
            key: 'code',
            header: 'Code',
            width: 20,
            type: 'string',
            validation: value => !value ||
                value.length <= 100 ||
                'Code must be less than 100 characters',
            description: 'Unique code for the cooler sub type (optional, max 100 chars)',
        },
        {
            key: 'cooler_type_name',
            header: 'Cooler Type Name',
            width: 25,
            required: true,
            type: 'string',
            validation: value => {
                if (!value)
                    return 'Cooler type name is required';
                return true;
            },
            description: 'Name of the parent cooler type (required)',
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
            description: 'Description of the cooler sub type (optional)',
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
                name: 'FV-280',
                code: 'CST-FV280',
                cooler_type_name: 'COOLER',
                description: 'FV-280 model',
                is_active: 'Y',
            },
            {
                name: 'CVC-160',
                code: 'CST-CVC160',
                cooler_type_name: 'COOLER',
                description: 'CVC-160 model',
                is_active: 'Y',
            },
        ];
    }
    getColumnDescription(key) {
        const column = this.columns.find(col => col.key === key);
        return column?.description || '';
    }
    async transformDataForExport(data) {
        return data.map(coolerSubType => ({
            name: coolerSubType.name,
            code: coolerSubType.code || '',
            cooler_type_name: coolerSubType.cooler_sub_types_cooler_types?.name || '',
            description: coolerSubType.description || '',
            is_active: coolerSubType.is_active || 'Y',
            created_date: coolerSubType.createdate?.toISOString().split('T')[0] || '',
            created_by: coolerSubType.createdby || '',
            updated_date: coolerSubType.updatedate?.toISOString().split('T')[0] || '',
            updated_by: coolerSubType.updatedby || '',
        }));
    }
    async checkDuplicate(data, tx) {
        const model = tx ? tx.cooler_sub_types : prisma_client_1.default.cooler_sub_types;
        const existingName = await model.findFirst({
            where: { name: data.name },
        });
        if (existingName) {
            return `Cooler sub type with name ${data.name} already exists`;
        }
        if (data.code) {
            const existingCode = await model.findFirst({
                where: { code: data.code },
            });
            if (existingCode) {
                return `Cooler sub type with code ${data.code} already exists`;
            }
        }
        return null;
    }
    async validateForeignKeys(data, tx) {
        if (!data.cooler_type_name) {
            return 'Cooler type name is required';
        }
        const coolerType = await prisma_client_1.default.cooler_types.findFirst({
            where: { name: data.cooler_type_name },
        });
        if (!coolerType) {
            return `Cooler type "${data.cooler_type_name}" not found`;
        }
        data.cooler_type_id = coolerType.id;
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
            return `CST-${abbreviation}`;
        };
        const { cooler_type_name, ...restData } = data;
        return {
            ...restData,
            code: data.code || generateCode(data.name),
            cooler_type_id: data.cooler_type_id,
            createdby: userId,
            createdate: new Date(),
            log_inst: 1,
        };
    }
    async updateExisting(data, userId, tx) {
        const model = tx ? tx.cooler_sub_types : prisma_client_1.default.cooler_sub_types;
        const existing = await model.findFirst({
            where: { name: data.name },
        });
        if (!existing)
            return null;
        const { cooler_type_name, ...restData } = data;
        return await model.update({
            where: { id: existing.id },
            data: {
                ...restData,
                updatedby: userId,
                updatedate: new Date(),
            },
        });
    }
}
exports.CoolerSubTypesImportExportService = CoolerSubTypesImportExportService;
//# sourceMappingURL=coolerSubTypes-import-export.service.js.map