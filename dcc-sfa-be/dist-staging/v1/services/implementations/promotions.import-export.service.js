"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromotionsImportExportService = void 0;
const import_export_service_1 = require("../base/import-export.service");
const prisma_client_1 = __importDefault(require("../../../configs/prisma.client"));
class PromotionsImportExportService extends import_export_service_1.ImportExportService {
    modelName = 'promotions';
    displayName = 'Promotions';
    uniqueFields = ['code'];
    searchFields = ['name', 'code', 'type', 'description'];
    masterTableConfigs = [
        {
            masterTable: 'customers',
            masterKey: 'id',
            masterDisplayFields: ['id', 'name', 'code', 'email', 'phone_number'],
            sheetName: 'Ref - Customers',
            description: 'Use the ID from this sheet for customer references',
        },
        {
            masterTable: 'products',
            masterKey: 'id',
            masterDisplayFields: ['id', 'name', 'code', 'description'],
            sheetName: 'Ref - Products',
            description: 'Use the ID from this sheet for product references',
        },
        {
            masterTable: 'depots',
            masterKey: 'id',
            masterDisplayFields: ['id', 'name', 'code'],
            sheetName: 'Ref - Depots',
            description: 'Use the ID from this sheet for depot references',
        },
        {
            masterTable: 'customer_types',
            masterKey: 'id',
            masterDisplayFields: ['id', 'type_name', 'type_code'],
            sheetName: 'Ref - Customer Types',
            description: 'Use the ID from this sheet for customer type references',
        },
    ];
    lastNumberCache = new Map();
    validationCache = new Map();
    async generatePromotionCode(name, tx) {
        const prefix = name
            .slice(0, 3)
            .toUpperCase()
            .replace(/[^A-Z]/g, 'X');
        const db = tx || prisma_client_1.default;
        if (!this.lastNumberCache.has(prefix)) {
            try {
                const lastPromotion = await db.promotions.findFirst({
                    where: { code: { startsWith: prefix } },
                    orderBy: { id: 'desc' },
                    select: { code: true },
                });
                let lastNum = 0;
                if (lastPromotion && lastPromotion.code) {
                    const match = lastPromotion.code.match(/(\d+)$/);
                    if (match) {
                        lastNum = parseInt(match[1], 10);
                    }
                }
                this.lastNumberCache.set(prefix, lastNum);
            }
            catch (error) {
                return `${prefix}${Date.now().toString().slice(-4)}`;
            }
        }
        const nextNum = (this.lastNumberCache.get(prefix) || 0) + 1;
        this.lastNumberCache.set(prefix, nextNum);
        return `${prefix}${nextNum.toString().padStart(4, '0')}`;
    }
    columns = [
        {
            key: 'name',
            header: 'Promotion Name',
            width: 30,
            required: true,
            type: 'string',
            validation: value => {
                if (!value || value.length < 2)
                    return 'Promotion name must be at least 2 characters';
                if (value.length > 255)
                    return 'Promotion name must be less than 255 characters';
                return true;
            },
            description: 'Name of the promotion (required, 2-255 characters)',
        },
        {
            key: 'type',
            header: 'Promotion Type',
            width: 20,
            required: true,
            type: 'string',
            validation: value => {
                if (!value)
                    return 'Promotion type is required';
                const validTypes = [
                    'discount', 'bogo', 'bundle', 'cashback', 'seasonal',
                    'clearance', 'loyalty', 'referral', 'volume', 'flash_sale',
                ];
                return (validTypes.includes(value.toLowerCase()) ||
                    `Promotion type should be one of: ${validTypes.join(', ')}`);
            },
            transform: value => (value ? value.toLowerCase() : null),
            description: 'Type of promotion (required)',
        },
        {
            key: 'description',
            header: 'Description',
            width: 50,
            type: 'string',
            validation: value => !value || value.length <= 2000 || 'Description too long',
            description: 'Detailed description (optional)',
        },
        {
            key: 'start_date',
            header: 'Start Date',
            width: 15,
            required: true,
            type: 'date',
            validation: value => {
                if (!value)
                    return 'Start date is required';
                if (isNaN(Date.parse(value)))
                    return 'Invalid date format';
                return true;
            },
            transform: value => new Date(value),
            description: 'Promotion start date (required)',
        },
        {
            key: 'end_date',
            header: 'End Date',
            width: 15,
            required: true,
            type: 'date',
            validation: value => {
                if (!value)
                    return 'End date is required';
                if (isNaN(Date.parse(value)))
                    return 'Invalid date format';
                return true;
            },
            transform: value => new Date(value),
            description: 'Promotion end date (required)',
        },
        {
            key: 'depot_id',
            header: 'Depot ID',
            width: 15,
            type: 'number',
            transform: value => (value ? parseInt(value) : null),
            description: 'ID of the depot (optional)',
        },
        {
            key: 'zone_id',
            header: 'Zone ID',
            width: 15,
            type: 'number',
            transform: value => (value ? parseInt(value) : null),
            description: 'ID of the zone (optional)',
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
            description: 'Active status (Y/N)',
        },
    ];
    async getSampleData() {
        const depot = await prisma_client_1.default.depots.findFirst({ select: { id: true } });
        return [
            {
                name: 'New Year Sale 2024',
                type: 'seasonal',
                description: 'Special discount for New Year celebration',
                start_date: '2024-01-01',
                end_date: '2024-01-31',
                depot_id: depot?.id || 1,
                is_active: 'Y',
            },
        ];
    }
    getColumnDescription(key) {
        const column = this.columns.find(col => col.key === key);
        return column?.description || '';
    }
    async transformDataForExport(data) {
        return data.map(promo => ({
            name: promo.name,
            code: promo.code,
            type: promo.type,
            description: promo.description || '',
            start_date: promo.start_date?.toISOString().split('T')[0] || '',
            end_date: promo.end_date?.toISOString().split('T')[0] || '',
            depot_id: promo.depot_id || '',
            zone_id: promo.zone_id || '',
            is_active: promo.is_active || 'Y',
            created_date: promo.createdate?.toISOString().split('T')[0] || '',
            created_by: promo.createdby || '',
            updated_date: promo.updatedate?.toISOString().split('T')[0] || '',
            updated_by: promo.updatedby || '',
        }));
    }
    async checkDuplicate(data, tx) {
        const model = tx ? tx.promotions : prisma_client_1.default.promotions;
        if (!data.name || !data.start_date || !data.end_date)
            return null;
        const startDate = new Date(data.start_date);
        const endDate = new Date(data.end_date);
        // Optimized overlapping check
        const existingPromo = await model.findFirst({
            where: {
                name: { equals: data.name },
                OR: [
                    { start_date: { lte: endDate }, end_date: { gte: startDate } }
                ]
            },
            select: { id: true }
        });
        if (existingPromo) {
            return `Promotion "${data.name}" already exists with overlapping dates`;
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
        if (data.depot_id) {
            const error = await checkCache('depot', data.depot_id, async () => {
                const depot = await prismaClient.depots.findUnique({ where: { id: data.depot_id } });
                return depot ? null : `Depot ID ${data.depot_id} not found`;
            });
            if (error)
                return error;
        }
        if (data.zone_id) {
            const error = await checkCache('zone', data.zone_id, async () => {
                const zone = await prismaClient.zones.findUnique({ where: { id: data.zone_id } });
                return zone ? null : `Zone ID ${data.zone_id} not found`;
            });
            if (error)
                return error;
        }
        if (data.start_date && data.end_date && new Date(data.end_date) < new Date(data.start_date)) {
            return 'End date cannot be before start date';
        }
        return null;
    }
    async prepareDataForImport(data, userId, tx) {
        const code = data.code || await this.generatePromotionCode(data.name, tx);
        return {
            ...data,
            code,
            createdby: userId,
            createdate: new Date(),
            log_inst: 1,
        };
    }
    async updateExisting(data, userId, tx) {
        const model = tx ? tx.promotions : prisma_client_1.default.promotions;
        const existing = await model.findFirst({
            where: { name: { equals: data.name } },
            orderBy: { id: 'desc' }
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
exports.PromotionsImportExportService = PromotionsImportExportService;
//# sourceMappingURL=promotions.import-export.service.js.map