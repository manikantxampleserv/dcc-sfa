"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepotsImportExportService = void 0;
const import_export_service_1 = require("../base/import-export.service");
const client_1 = require("@prisma/client");
const prisma_client_1 = __importDefault(require("../../../configs/prisma.client"));
class DepotsImportExportService extends import_export_service_1.ImportExportService {
    modelName = 'depots';
    displayName = 'Depots';
    uniqueFields = ['code'];
    searchFields = ['name', 'code', 'address', 'city', 'email'];
    masterTableConfigs = [
        {
            masterTable: 'companies',
            masterKey: 'id',
            masterDisplayFields: ['id', 'name', 'code'],
            sheetName: 'Ref - Companies',
            description: 'Use the ID from this sheet in the Company ID column',
        },
        {
            masterTable: 'users',
            masterKey: 'id',
            masterDisplayFields: ['id', 'name', 'email', 'employee_id'],
            sheetName: 'Ref - Users',
            description: 'Use the ID from this sheet for Manager ID, Supervisor ID, Coordinator ID columns',
        },
    ];
    validationCache = new Map();
    columns = [
        {
            key: 'parent_id',
            header: 'Company ID',
            width: 15,
            required: true,
            type: 'number',
            transform: value => parseInt(value),
            description: 'ID of the parent company (required)',
        },
        {
            key: 'name',
            header: 'Depot Name',
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
            description: 'Name of the depot (required)',
        },
        {
            key: 'code',
            header: 'Depot Code',
            width: 20,
            required: true,
            type: 'string',
            validation: value => {
                if (!value)
                    return 'Code is required';
                if (!/^[A-Z0-9_-]+$/i.test(value))
                    return 'Invalid code format';
                return true;
            },
            transform: value => value.toUpperCase().trim(),
            description: 'Unique depot code (required)',
        },
        {
            key: 'sap_code',
            header: 'SAP Code',
            width: 20,
            type: 'string',
            validation: value => {
                if (value && value.trim() !== '') {
                    if (value.length > 100)
                        return 'SAP Code must be less than 100 characters';
                }
                return true;
            },
            description: 'SAP code (optional, must be unique if provided)',
        },
        {
            key: 'address',
            header: 'Address',
            width: 40,
            type: 'string',
            description: 'Address (optional)',
        },
        {
            key: 'city',
            header: 'City',
            width: 25,
            type: 'string',
            description: 'City (optional)',
        },
        {
            key: 'state',
            header: 'State',
            width: 20,
            type: 'string',
            description: 'State (optional)',
        },
        {
            key: 'zipcode',
            header: 'Zip Code',
            width: 15,
            type: 'string',
            description: 'Zip code (optional)',
        },
        {
            key: 'phone_number',
            header: 'Phone Number',
            width: 20,
            type: 'string',
            description: 'Phone number (optional)',
        },
        {
            key: 'email',
            header: 'Email',
            width: 30,
            type: 'email',
            transform: value => (value ? value.toLowerCase().trim() : null),
            description: 'Email (optional)',
        },
        {
            key: 'manager_id',
            header: 'Manager ID',
            width: 15,
            type: 'number',
            transform: value => (value ? parseInt(value) : null),
            description: 'Manager User ID (optional)',
        },
        {
            key: 'supervisor_id',
            header: 'Supervisor ID',
            width: 15,
            type: 'number',
            transform: value => (value ? parseInt(value) : null),
            description: 'Supervisor User ID (optional)',
        },
        {
            key: 'coordinator_id',
            header: 'Coordinator ID',
            width: 15,
            type: 'number',
            transform: value => (value ? parseInt(value) : null),
            description: 'Coordinator User ID (optional)',
        },
        {
            key: 'latitude',
            header: 'Latitude',
            width: 15,
            type: 'number',
            transform: value => (value ? parseFloat(value) : null),
            description: 'Latitude (optional)',
        },
        {
            key: 'longitude',
            header: 'Longitude',
            width: 15,
            type: 'number',
            transform: value => (value ? parseFloat(value) : null),
            description: 'Longitude (optional)',
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
        const company = await prisma_client_1.default.companies.findFirst({ select: { id: true } });
        return [
            {
                name: 'Main Depot',
                code: 'DEP001',
                parent_id: company?.id || 1,
                is_active: 'Y',
            },
        ];
    }
    getColumnDescription(key) {
        const column = this.columns.find(col => col.key === key);
        return column?.description || '';
    }
    async transformDataForExport(data) {
        return data.map(depot => ({
            name: depot.name,
            code: depot.code,
            sap_code: depot.sap_code || '',
            parent_id: depot.parent_id,
            manager_id: depot.manager_id,
            supervisor_id: depot.supervisor_id,
            coordinator_id: depot.coordinator_id,
            address: depot.address,
            city: depot.city,
            state: depot.state,
            phone_number: depot.phone_number,
            email: depot.email,
            is_active: depot.is_active,
        }));
    }
    async checkDuplicate(data, tx) {
        const model = tx ? tx.depots : prisma_client_1.default.depots;
        const existing = await model.findFirst({ where: { code: data.code } });
        if (existing)
            return `Depot code "${data.code}" already exists`;
        if (data.sap_code && data.sap_code.trim() !== '') {
            const existingSapCode = await model.findFirst({
                where: { sap_code: data.sap_code.trim() },
            });
            if (existingSapCode) {
                return `Depot with SAP code ${data.sap_code} already exists`;
            }
        }
        return null;
    }
    async validateForeignKeys(data, tx) {
        const prismaClient = tx || prisma_client_1.default;
        const checkCache = async (type, id, validator) => {
            if (!id)
                return null;
            const cacheKey = `${type}_${id}`;
            if (this.validationCache.has(cacheKey))
                return this.validationCache.get(cacheKey);
            const result = await validator();
            this.validationCache.set(cacheKey, result);
            return result;
        };
        const errorCompany = await checkCache('company', data.parent_id, async () => {
            const company = await prismaClient.companies.findUnique({
                where: { id: data.parent_id },
            });
            return company ? null : `Company ID ${data.parent_id} not found`;
        });
        if (errorCompany)
            return errorCompany;
        if (data.manager_id) {
            const error = await checkCache('user', data.manager_id, async () => {
                const user = await prismaClient.users.findUnique({
                    where: { id: data.manager_id },
                });
                return user ? null : `Manager ID ${data.manager_id} not found`;
            });
            if (error)
                return error;
        }
        if (data.supervisor_id) {
            const error = await checkCache('user', data.supervisor_id, async () => {
                const user = await prismaClient.users.findUnique({
                    where: { id: data.supervisor_id },
                });
                return user ? null : `Supervisor ID ${data.supervisor_id} not found`;
            });
            if (error)
                return error;
        }
        if (data.coordinator_id) {
            const error = await checkCache('user', data.coordinator_id, async () => {
                const user = await prismaClient.users.findUnique({
                    where: { id: data.coordinator_id },
                });
                return user ? null : `Coordinator ID ${data.coordinator_id} not found`;
            });
            if (error)
                return error;
        }
        return null;
    }
    async prepareDataForImport(data, userId, tx) {
        const preparedData = {
            ...data,
            sap_code: data.sap_code && data.sap_code.trim() !== ''
                ? data.sap_code.trim()
                : null,
            createdby: userId,
            createdate: new Date(),
            log_inst: 1,
        };
        if (data.latitude !== null && data.latitude !== undefined) {
            preparedData.latitude = new client_1.Prisma.Decimal(data.latitude);
        }
        if (data.longitude !== null && data.longitude !== undefined) {
            preparedData.longitude = new client_1.Prisma.Decimal(data.longitude);
        }
        return preparedData;
    }
    async updateExisting(data, userId, tx) {
        const model = tx ? tx.depots : prisma_client_1.default.depots;
        const existing = await model.findFirst({ where: { code: data.code } });
        if (!existing)
            return null;
        const { sap_code, ...restData } = data;
        const updateData = {
            ...restData,
            ...(sap_code && sap_code.trim() !== '' && { sap_code: sap_code.trim() }),
            updatedby: userId,
            updatedate: new Date(),
        };
        if (updateData.sap_code && updateData.sap_code !== existing.sap_code) {
            const existingSapCode = await model.findFirst({
                where: { sap_code: updateData.sap_code, id: { not: existing.id } },
            });
            if (existingSapCode) {
                throw new Error(`Depot SAP code ${updateData.sap_code} already exists`);
            }
        }
        if (data.latitude !== null && data.latitude !== undefined) {
            updateData.latitude = new client_1.Prisma.Decimal(data.latitude);
        }
        if (data.longitude !== null && data.longitude !== undefined) {
            updateData.longitude = new client_1.Prisma.Decimal(data.longitude);
        }
        return await model.update({
            where: { id: existing.id },
            data: updateData,
        });
    }
}
exports.DepotsImportExportService = DepotsImportExportService;
//# sourceMappingURL=depots-import-export.service.js.map