"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZonesImportExportService = void 0;
const import_export_service_1 = require("../base/import-export.service");
const prisma_client_1 = __importDefault(require("../../../configs/prisma.client"));
class ZonesImportExportService extends import_export_service_1.ImportExportService {
    modelName = 'zones';
    displayName = 'Zones';
    uniqueFields = ['code'];
    searchFields = ['name', 'code', 'description'];
    masterTableConfigs = [
        {
            masterTable: 'depots',
            masterKey: 'id',
            masterDisplayFields: ['id', 'name', 'code'],
            sheetName: 'Ref - Depots',
            description: 'Use the ID from this sheet in the Depot ID column',
        },
        {
            masterTable: 'users',
            masterKey: 'id',
            masterDisplayFields: ['id', 'name', 'email', 'employee_id'],
            sheetName: 'Ref - Supervisors',
            description: 'Use the ID from this sheet in the Supervisor ID column',
        },
        {
            masterTable: 'zones',
            masterKey: 'id',
            masterDisplayFields: ['id', 'name', 'code'],
            sheetName: 'Ref - Zones',
            description: 'Use the ID from this sheet in the Parent ID column',
        },
    ];
    lastNumberCache = new Map();
    validationCache = new Map();
    async generateZoneCode(name, tx) {
        const prefix = name
            .slice(0, 3)
            .toUpperCase()
            .replace(/[^A-Z]/g, 'Z');
        const db = tx || prisma_client_1.default;
        if (!this.lastNumberCache.has(prefix)) {
            try {
                const lastZone = await db.zones.findFirst({
                    where: { code: { startsWith: prefix } },
                    orderBy: { id: 'desc' },
                    select: { code: true },
                });
                let lastNum = 0;
                if (lastZone && lastZone.code) {
                    const match = lastZone.code.match(/(\d+)$/);
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
            key: 'parent_id',
            header: 'Parent ID',
            width: 15,
            required: true,
            type: 'number',
            transform: value => parseInt(value),
            description: 'ID of the parent zone (required)',
        },
        {
            key: 'depot_id',
            header: 'Depot ID',
            width: 15,
            type: 'number',
            transform: value => (value ? parseInt(value) : null),
            description: 'ID of the associated depot (optional)',
        },
        {
            key: 'name',
            header: 'Name',
            width: 30,
            required: true,
            type: 'string',
            validation: value => {
                if (!value)
                    return 'Name is required';
                if (value.length > 255)
                    return 'Name must be less than 255 characters';
                if (value.length < 2)
                    return 'Name must be at least 2 characters';
                return true;
            },
            description: 'Name of the zone (required, 2-255 characters)',
        },
        {
            key: 'code',
            header: 'Code',
            width: 20,
            required: false,
            type: 'string',
            validation: value => {
                if (!value)
                    return true;
                if (value.length > 50)
                    return 'Code must be less than 50 characters';
                if (!/^[A-Z0-9_-]+$/i.test(value))
                    return 'Code can only contain letters, numbers, hyphens and underscores';
                return true;
            },
            transform: value => value ? value.toString().trim().toUpperCase() : null,
            description: 'Unique code for the zone (optional, will be auto-generated if not provided, max 50 chars, alphanumeric)',
        },
        {
            key: 'description',
            header: 'Description',
            width: 40,
            type: 'string',
            validation: value => !value ||
                value.length <= 500 ||
                'Description must be less than 500 characters',
            description: 'Description of the zone (optional, max 500 chars)',
        },
        {
            key: 'supervisor_id',
            header: 'Supervisor ID',
            width: 15,
            type: 'number',
            transform: value => (value ? parseInt(value) : null),
            description: 'ID of the supervisor user (optional)',
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
        const [depots, users, parentZones] = await Promise.all([
            prisma_client_1.default.depots.findFirst({ select: { id: true } }),
            prisma_client_1.default.users.findFirst({ select: { id: true } }),
            prisma_client_1.default.zones.findFirst({ select: { id: true } }),
        ]);
        return [
            {
                parent_id: parentZones?.id || 1,
                depot_id: depots?.id || 1,
                name: 'Zone North',
                code: 'ZN001',
                description: 'Northern region zone covering areas A, B, C',
                supervisor_id: users?.id || 1,
                is_active: 'Y',
            },
        ];
    }
    getColumnDescription(key) {
        const column = this.columns.find(col => col.key === key);
        return column?.description || '';
    }
    async transformDataForExport(data) {
        return data.map((zone) => ({
            parent_id: zone.parent_id,
            depot_id: zone.depot_id || '',
            name: zone.name,
            code: zone.code,
            description: zone.description || '',
            supervisor_id: zone.supervisor_id || '',
            is_active: zone.is_active,
            created_date: zone.createdate?.toISOString().split('T')[0] || '',
            created_by: zone.createdby,
            updated_date: zone.updatedate?.toISOString().split('T')[0] || '',
            updated_by: zone.updatedby || '',
        }));
    }
    async checkDuplicate(data, tx) {
        if (!data.code)
            return null;
        const model = tx ? tx.zones : prisma_client_1.default.zones;
        const existing = await model.findFirst({
            where: { code: data.code },
        });
        return existing ? `Zone with code ${data.code} already exists` : null;
    }
    async validateForeignKeys(data, tx) {
        const prismaClient = tx || prisma_client_1.default;
        const checkCache = async (type, id, validator) => {
            if (!id)
                return null;
            const cacheKey = `${type}_${id}`;
            if (this.validationCache.has(cacheKey)) {
                return this.validationCache.get(cacheKey);
            }
            const result = await validator();
            this.validationCache.set(cacheKey, result);
            return result;
        };
        if (data.parent_id) {
            const error = await checkCache('zone', data.parent_id, async () => {
                const parentZone = await prismaClient.zones.findUnique({
                    where: { id: data.parent_id },
                });
                if (!parentZone)
                    return `Parent Zone with ID ${data.parent_id} does not exist`;
                return null;
            });
            if (error)
                return error;
        }
        if (data.depot_id) {
            const error = await checkCache('depot', data.depot_id, async () => {
                const depot = await prismaClient.depots.findUnique({
                    where: { id: data.depot_id },
                });
                if (!depot)
                    return `Depot with ID ${data.depot_id} does not exist`;
                return null;
            });
            if (error)
                return error;
        }
        if (data.supervisor_id) {
            const error = await checkCache('user', data.supervisor_id, async () => {
                const supervisor = await prismaClient.users.findUnique({
                    where: { id: data.supervisor_id },
                });
                if (!supervisor)
                    return `Supervisor with ID ${data.supervisor_id} does not exist`;
                return null;
            });
            if (error)
                return error;
        }
        return null;
    }
    async prepareDataForImport(data, userId, tx) {
        let code = data.code;
        if (!code) {
            code = await this.generateZoneCode(data.name, tx);
        }
        return {
            ...data,
            code,
            createdby: userId,
            createdate: new Date(),
            log_inst: 1,
        };
    }
    async updateExisting(data, userId, tx) {
        const model = tx ? tx.zones : prisma_client_1.default.zones;
        const existing = await model.findFirst({
            where: { code: data.code },
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
exports.ZonesImportExportService = ZonesImportExportService;
//# sourceMappingURL=zones-import-export.service.js.map