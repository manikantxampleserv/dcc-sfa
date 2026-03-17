"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsImportExportService = void 0;
const import_export_service_1 = require("../base/import-export.service");
const prisma_client_1 = __importDefault(require("../../../configs/prisma.client"));
class PaymentsImportExportService extends import_export_service_1.ImportExportService {
    modelName = 'payments';
    displayName = 'Payments';
    uniqueFields = ['payment_number'];
    searchFields = ['payment_number', 'reference_number', 'notes'];
    // Cache for foreign key validation
    customerIds = new Set();
    userIds = new Set();
    currencyIds = new Set();
    columns = [
        {
            key: 'customer_id',
            header: 'Customer ID',
            width: 15,
            required: true,
            type: 'number',
            validation: value => {
                const num = Number(value);
                return ((!isNaN(num) && num > 0) ||
                    'Customer ID must be a valid positive number');
            },
            description: 'ID of the customer making the payment',
        },
        {
            key: 'payment_date',
            header: 'Payment Date',
            width: 20,
            required: true,
            type: 'date',
            validation: value => {
                const date = new Date(value);
                return !isNaN(date.getTime()) || 'Payment date must be a valid date';
            },
            description: 'Date when the payment was made',
        },
        {
            key: 'collected_by',
            header: 'Collected By (User ID)',
            width: 20,
            required: true,
            type: 'number',
            validation: value => {
                const num = Number(value);
                return ((!isNaN(num) && num > 0) ||
                    'Collected by must be a valid positive number');
            },
            description: 'ID of the user who collected the payment',
        },
        {
            key: 'method',
            header: 'Payment Method',
            width: 20,
            required: true,
            type: 'string',
            validation: value => {
                const validMethods = [
                    'cash',
                    'credit',
                    'debit',
                    'check',
                    'bank_transfer',
                    'online',
                ];
                return (validMethods.includes(value) ||
                    `Payment method must be one of: ${validMethods.join(', ')}`);
            },
            description: 'Method of payment (cash, credit, debit, check, bank_transfer, online)',
        },
        {
            key: 'reference_number',
            header: 'Reference Number',
            width: 25,
            required: false,
            type: 'string',
            validation: value => !value ||
                value.length <= 100 ||
                'Reference number must not exceed 100 characters',
            description: 'Reference number for the payment (optional)',
        },
        {
            key: 'total_amount',
            header: 'Total Amount',
            width: 15,
            required: true,
            type: 'number',
            validation: value => {
                const num = Number(value);
                return ((!isNaN(num) && num > 0) ||
                    'Total amount must be a valid positive number');
            },
            description: 'Total amount of the payment',
        },
        {
            key: 'notes',
            header: 'Notes',
            width: 30,
            required: false,
            type: 'string',
            validation: value => !value || value.length <= 500 || 'Notes must not exceed 500 characters',
            description: 'Additional notes about the payment (optional)',
        },
        {
            key: 'currency_id',
            header: 'Currency ID',
            width: 15,
            required: false,
            type: 'number',
            validation: value => {
                if (!value)
                    return true; // Optional field
                const num = Number(value);
                return ((!isNaN(num) && num > 0) ||
                    'Currency ID must be a valid positive number');
            },
            description: 'ID of the currency used for the payment (optional)',
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
        try {
            // Get actual IDs from database
            const [customer, user, currency] = await Promise.all([
                prisma_client_1.default.customers.findFirst({ where: { is_active: 'Y' } }),
                prisma_client_1.default.users.findFirst({ where: { is_active: 'Y' } }),
                prisma_client_1.default.currencies.findFirst({ where: { is_active: 'Y' } }),
            ]);
            return [
                {
                    customer_id: customer?.id || 1,
                    payment_date: new Date().toISOString().split('T')[0],
                    collected_by: user?.id || 1,
                    method: 'cash',
                    reference_number: 'REF-001',
                    total_amount: 1000.0,
                    notes: 'Payment received for invoice #INV-001',
                    currency_id: currency?.id || 1,
                    is_active: 'Y',
                },
                {
                    customer_id: customer?.id || 1,
                    payment_date: new Date(Date.now() - 86400000)
                        .toISOString()
                        .split('T')[0], // Yesterday
                    collected_by: user?.id || 1,
                    method: 'bank_transfer',
                    reference_number: 'REF-002',
                    total_amount: 2500.5,
                    notes: 'Bank transfer payment',
                    currency_id: currency?.id || 1,
                    is_active: 'Y',
                },
            ];
        }
        catch (error) {
            // Fallback to default sample data
            return [
                {
                    customer_id: 1,
                    payment_date: new Date().toISOString().split('T')[0],
                    collected_by: 1,
                    method: 'cash',
                    reference_number: 'REF-001',
                    total_amount: 1000.0,
                    notes: 'Payment received for invoice #INV-001',
                    currency_id: 1,
                    is_active: 'Y',
                },
            ];
        }
    }
    async checkDuplicate(data, tx) {
        // For now, we'll keep the individual duplicate check
        // In the future, this could be optimized with batch checking
        const model = tx ? tx.payments : prisma_client_1.default.payments;
        const existing = await model.findFirst({
            where: {
                customer_id: data.customer_id,
                payment_date: new Date(data.payment_date),
                total_amount: data.total_amount,
                method: data.method,
                is_active: 'Y',
            },
        });
        if (existing) {
            return `Payment with same customer, date, amount, and method already exists`;
        }
        return null;
    }
    async validateForeignKeys(data, tx) {
        // Use cached data for validation instead of database queries
        if (!this.customerIds.has(data.customer_id)) {
            return `Customer with ID ${data.customer_id} does not exist`;
        }
        if (!this.userIds.has(data.collected_by)) {
            return `User with ID ${data.collected_by} does not exist`;
        }
        if (data.currency_id && !this.currencyIds.has(data.currency_id)) {
            return `Currency with ID ${data.currency_id} does not exist`;
        }
        return null;
    }
    async prepareDataForImport(data, userId) {
        const paymentNumber = this.generatePaymentNumber();
        return {
            payment_number: paymentNumber,
            customer_id: data.customer_id,
            payment_date: new Date(data.payment_date),
            collected_by: data.collected_by,
            method: data.method,
            reference_number: data.reference_number || null,
            total_amount: data.total_amount,
            notes: data.notes || null,
            currency_id: data.currency_id || null,
            is_active: data.is_active || 'Y',
            createdate: new Date(),
            createdby: userId,
            log_inst: 1,
        };
    }
    paymentCounter = 0;
    basePaymentCount = 0;
    async initializePaymentCounter() {
        if (this.basePaymentCount === 0) {
            this.basePaymentCount = await prisma_client_1.default.payments.count();
        }
    }
    async preloadForeignKeys() {
        // Pre-load all valid IDs in one query each
        const [customers, users, currencies] = await Promise.all([
            prisma_client_1.default.customers.findMany({
                select: { id: true },
                where: { is_active: 'Y' },
            }),
            prisma_client_1.default.users.findMany({
                select: { id: true },
                where: { is_active: 'Y' },
            }),
            prisma_client_1.default.currencies.findMany({
                select: { id: true },
                where: { is_active: 'Y' },
            }),
        ]);
        // Populate the sets
        this.customerIds = new Set(customers.map(c => c.id));
        this.userIds = new Set(users.map(u => u.id));
        this.currencyIds = new Set(currencies.map(c => c.id));
    }
    generatePaymentNumber() {
        this.paymentCounter++;
        const nextNumber = this.basePaymentCount + this.paymentCounter;
        return `PAY-${nextNumber.toString().padStart(6, '0')}`;
    }
    // Override the base import method to initialize caches
    async importData(data, userId, options = {}) {
        // Initialize caches before processing
        await Promise.all([
            this.initializePaymentCounter(),
            this.preloadForeignKeys(),
        ]);
        // Reset counter for this import batch
        this.paymentCounter = 0;
        // Call parent import method
        return super.importData(data, userId, options);
    }
    getColumnDescription(key) {
        const column = this.columns.find(col => col.key === key);
        return column?.description || '';
    }
    async transformDataForExport(data) {
        return data.map(payment => ({
            customer_id: payment.customer_id,
            payment_date: payment.payment_date?.toISOString().split('T')[0] || '',
            collected_by: payment.collected_by,
            method: payment.method,
            reference_number: payment.reference_number || '',
            total_amount: payment.total_amount,
            notes: payment.notes || '',
            currency_id: payment.currency_id || '',
            is_active: payment.is_active || 'Y',
            created_date: payment.createdate?.toISOString().split('T')[0] || '',
            created_by: payment.createdby || '',
            updated_date: payment.updatedate?.toISOString().split('T')[0] || '',
            updated_by: payment.updatedby || '',
        }));
    }
    async updateExisting(data, userId, tx) {
        const model = tx ? tx.payments : prisma_client_1.default.payments;
        const existing = await model.findFirst({
            where: { payment_number: data.payment_number },
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
exports.PaymentsImportExportService = PaymentsImportExportService;
//# sourceMappingURL=payments-import-export.service.js.map