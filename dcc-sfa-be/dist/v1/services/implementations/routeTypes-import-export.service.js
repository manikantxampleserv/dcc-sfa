"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteTypesImportExportService = void 0;
const import_export_service_1 = require("../base/import-export.service");
const prisma_client_1 = __importDefault(require("../../../configs/prisma.client"));
class RouteTypesImportExportService extends import_export_service_1.ImportExportService {
    modelName = 'route_type';
    displayName = 'Route Types';
    uniqueFields = ['name'];
    searchFields = ['name'];
    columns = [
        {
            key: 'name',
            header: 'Name',
            width: 30,
            required: true,
            type: 'string',
            validation: value => {
                if (!value || value.length < 1)
                    return 'Name is required';
                if (value.length > 100)
                    return 'Name must be less than 100 characters';
                return true;
            },
            transform: value => value.trim(),
            description: 'Route type name (required, max 100 chars)',
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
                name: 'Primary Route',
                is_active: 'Y',
            },
            {
                name: 'Secondary Route',
                is_active: 'Y',
            },
            {
                name: 'Express Route',
                is_active: 'Y',
            },
            {
                name: 'Local Route',
                is_active: 'Y',
            },
        ];
    }
    getColumnDescription(key) {
        const column = this.columns.find(col => col.key === key);
        return column?.description || '';
    }
    async transformDataForExport(data) {
        return data.map(routeType => ({
            name: routeType.name || '',
            is_active: routeType.is_active || 'Y',
            created_date: routeType.createdate?.toISOString().split('T')[0] || '',
            created_by: routeType.createdby || '',
            updated_date: routeType.updatedate?.toISOString().split('T')[0] || '',
            updated_by: routeType.updatedby || '',
        }));
    }
    async checkDuplicate(data, tx) {
        const model = tx ? tx.route_type : prisma_client_1.default.route_type;
        const existing = await model.findFirst({
            where: { name: data.name },
        });
        if (existing) {
            return `Route type with name ${data.name} already exists`;
        }
        return null;
    }
    async transformDataForImport(data, userId) {
        return {
            name: data.name,
            is_active: data.is_active || 'Y',
            createdate: new Date(),
            createdby: userId,
            log_inst: 1,
        };
    }
    async validateForeignKeys(data, tx) {
        // No foreign keys to validate for route types
        return null;
    }
    async prepareDataForImport(data, userId) {
        return this.transformDataForImport(data, userId);
    }
    async updateExisting(data, userId, tx) {
        const model = tx ? tx.route_type : prisma_client_1.default.route_type;
        const existing = await model.findFirst({
            where: { name: data.name },
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
exports.RouteTypesImportExportService = RouteTypesImportExportService;
//# sourceMappingURL=routeTypes-import-export.service.js.map