"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DistrictsImportExportService = void 0;
const prisma_client_1 = __importDefault(require("../../../configs/prisma.client"));
const import_export_service_1 = require("../base/import-export.service");
class DistrictsImportExportService extends import_export_service_1.ImportExportService {
    modelName = 'districts';
    displayName = 'Districts';
    uniqueFields = ['code'];
    searchFields = ['name', 'code', 'description'];
    masterTableConfigs = [
        {
            masterTable: 'regions',
            masterKey: 'id',
            masterDisplayFields: ['id', 'name', 'code'],
            sheetName: 'Ref - Regions',
            description: 'Use the ID from this sheet in the Region ID column',
        },
    ];
    columns = [
        {
            key: 'region_id',
            header: 'Region ID',
            width: 15,
            required: true,
            type: 'number',
            transform: value => parseInt(value),
            description: 'ID of the associated region (required, refer to Ref - Regions sheet)',
        },
        {
            key: 'name',
            header: 'District Name',
            width: 30,
            required: true,
            type: 'string',
            validation: value => {
                if (!value || value.trim() === '')
                    return 'District name is required';
                if (value.length > 255)
                    return 'District name must be less than 255 characters';
                return true;
            },
            transform: value => (value ? value.trim() : null),
            description: 'Name of the district (required, max 255 chars)',
        },
        {
            key: 'code',
            header: 'District Code',
            width: 20,
            required: true,
            type: 'string',
            validation: value => {
                if (!value || value.trim() === '')
                    return 'District code is required';
                if (value.length > 50)
                    return 'District code must be less than 50 characters';
                return true;
            },
            transform: value => (value ? value.trim().toUpperCase() : null),
            description: 'Unique code for the district (required, max 50 chars)',
        },
        {
            key: 'description',
            header: 'Description',
            width: 40,
            type: 'string',
            validation: value => !value || value.length <= 500 || 'Description must be less than 500 characters',
            description: 'Description of the district (optional, max 500 chars)',
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
        const region = await prisma_client_1.default.regions.findFirst({ select: { id: true } });
        return [
            { region_id: region?.id || 1, name: 'North District 1', code: 'DIST-N1', description: 'First northern district', is_active: 'Y' },
            { region_id: region?.id || 1, name: 'North District 2', code: 'DIST-N2', description: 'Second northern district', is_active: 'Y' },
        ];
    }
    getColumnDescription(key) {
        const column = this.columns.find(col => col.key === key);
        return column?.description || '';
    }
    async transformDataForExport(data) {
        return data.map(district => ({
            id: district.id,
            region_id: district.region_id,
            region_name: district.district_regions?.name || '',
            name: district.name,
            code: district.code,
            description: district.description || '',
            is_active: district.is_active,
            created_date: district.createdate ? new Date(district.createdate).toISOString().split('T')[0] : '',
        }));
    }
    async checkDuplicate(data, tx) {
        const prismaClient = tx || prisma_client_1.default;
        const existing = await prismaClient.districts.findFirst({
            where: { code: data.code },
        });
        return existing ? `District with code '${data.code}' already exists` : null;
    }
    async validateForeignKeys(data, tx) {
        const prismaClient = tx || prisma_client_1.default;
        if (data.region_id) {
            const region = await prismaClient.regions.findUnique({ where: { id: data.region_id } });
            if (!region)
                return `Region with ID ${data.region_id} does not exist`;
        }
        return null;
    }
    async prepareDataForImport(data, userId) {
        return {
            ...data,
            createdby: userId,
            createdate: new Date(),
            log_inst: 1,
        };
    }
    async updateExisting(data, userId, tx) {
        const prismaClient = tx || prisma_client_1.default;
        const existing = await prismaClient.districts.findFirst({
            where: { code: data.code },
        });
        if (!existing)
            return null;
        return await prismaClient.districts.update({
            where: { id: existing.id },
            data: {
                ...data,
                updatedby: userId,
                updatedate: new Date(),
            },
        });
    }
}
exports.DistrictsImportExportService = DistrictsImportExportService;
//# sourceMappingURL=districts-import-export.service.js.map