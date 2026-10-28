"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicesImportExportService = void 0;
const import_export_service_1 = require("../base/import-export.service");
const prisma_client_1 = __importDefault(require("../../../configs/prisma.client"));
const ExcelJS = __importStar(require("exceljs"));
class InvoicesImportExportService extends import_export_service_1.ImportExportService {
    modelName = 'invoices';
    displayName = 'Invoices';
    uniqueFields = ['invoice_number'];
    searchFields = [
        'invoice_number',
        'status',
        'notes',
        'billing_address',
    ];
    masterTableConfigs = [
        {
            masterTable: 'customers',
            masterKey: 'id',
            masterDisplayFields: ['id', 'name', 'code', 'email', 'phone_number'],
            sheetName: 'Ref - Customers',
            description: 'Use the ID from this sheet in the Customer ID column',
        },
        {
            masterTable: 'orders',
            masterKey: 'id',
            masterDisplayFields: ['id', 'order_number', 'customer_id', 'order_date'],
            sheetName: 'Ref - Orders',
            description: 'Use the ID from this sheet in the Order ID column',
        },
        {
            masterTable: 'currencies',
            masterKey: 'id',
            masterDisplayFields: ['id', 'code', 'name', 'symbol'],
            sheetName: 'Ref - Currencies',
            description: 'Use the ID from this sheet in the Currency ID column',
        },
    ];
    customerIds = new Set();
    orderIds = new Set();
    currencyIds = new Set();
    columns = [
        {
            key: 'invoice_number',
            header: 'Invoice Number',
            width: 20,
            required: true,
            type: 'string',
            validation: value => {
                if (!value || value.length < 3)
                    return 'Invoice number must be at least 3 characters';
                if (value.length > 50)
                    return 'Invoice number must be less than 50 characters';
                return true;
            },
            description: 'Unique invoice number (required, 3-50 characters)',
        },
        {
            key: 'parent_id',
            header: 'Order ID',
            width: 15,
            required: true,
            type: 'number',
            validation: value => {
                const num = Number(value);
                return ((!isNaN(num) && num > 0) || 'Order ID must be a valid positive number');
            },
            description: 'ID of the related order',
        },
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
            description: 'ID of the customer',
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
            description: 'ID of the currency (optional)',
        },
        {
            key: 'invoice_date',
            header: 'Invoice Date',
            width: 20,
            required: true,
            type: 'date',
            validation: value => {
                const date = new Date(value);
                return !isNaN(date.getTime()) || 'Invoice date must be a valid date';
            },
            description: 'Date when the invoice was created',
        },
        {
            key: 'due_date',
            header: 'Due Date',
            width: 20,
            required: false,
            type: 'date',
            validation: value => {
                if (!value)
                    return true; // Optional field
                const date = new Date(value);
                return !isNaN(date.getTime()) || 'Due date must be a valid date';
            },
            description: 'Date when the invoice is due for payment',
        },
        {
            key: 'status',
            header: 'Status',
            width: 15,
            required: true,
            type: 'string',
            defaultValue: 'draft',
            validation: value => {
                const validStatuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
                return validStatuses.includes(value) || 'Invalid status';
            },
            description: 'Invoice status (draft, sent, paid, overdue, cancelled)',
        },
        {
            key: 'payment_method',
            header: 'Payment Method',
            width: 20,
            required: true,
            type: 'string',
            defaultValue: 'credit',
            validation: value => {
                const validMethods = [
                    'cash',
                    'credit',
                    'debit',
                    'check',
                    'bank_transfer',
                    'online',
                ];
                return validMethods.includes(value) || 'Invalid payment method';
            },
            description: 'Payment method (cash, credit, debit, check, bank_transfer, online)',
        },
        {
            key: 'subtotal',
            header: 'Subtotal',
            width: 15,
            required: true,
            type: 'number',
            defaultValue: 0,
            validation: value => {
                const num = Number(value);
                return ((!isNaN(num) && num >= 0) || 'Subtotal must be a non-negative number');
            },
            description: 'Invoice subtotal amount',
        },
        {
            key: 'discount_amount',
            header: 'Discount Amount',
            width: 15,
            required: false,
            type: 'number',
            defaultValue: 0,
            validation: value => {
                const num = Number(value);
                return ((!isNaN(num) && num >= 0) ||
                    'Discount amount must be a non-negative number');
            },
            description: 'Total discount amount applied',
        },
        {
            key: 'tax_amount',
            header: 'Tax Amount',
            width: 15,
            required: false,
            type: 'number',
            defaultValue: 0,
            validation: value => {
                const num = Number(value);
                return ((!isNaN(num) && num >= 0) ||
                    'Tax amount must be a non-negative number');
            },
            description: 'Total tax amount',
        },
        {
            key: 'shipping_amount',
            header: 'Shipping Amount',
            width: 15,
            required: false,
            type: 'number',
            defaultValue: 0,
            validation: value => {
                const num = Number(value);
                return ((!isNaN(num) && num >= 0) ||
                    'Shipping amount must be a non-negative number');
            },
            description: 'Shipping charges',
        },
        {
            key: 'total_amount',
            header: 'Total Amount',
            width: 15,
            required: true,
            type: 'number',
            defaultValue: 0,
            validation: value => {
                const num = Number(value);
                return ((!isNaN(num) && num >= 0) ||
                    'Total amount must be a non-negative number');
            },
            description: 'Total invoice amount',
        },
        {
            key: 'amount_paid',
            header: 'Amount Paid',
            width: 15,
            required: false,
            type: 'number',
            defaultValue: 0,
            validation: value => {
                const num = Number(value);
                return ((!isNaN(num) && num >= 0) ||
                    'Amount paid must be a non-negative number');
            },
            description: 'Amount already paid',
        },
        {
            key: 'balance_due',
            header: 'Balance Due',
            width: 15,
            required: false,
            type: 'number',
            defaultValue: 0,
            validation: value => {
                const num = Number(value);
                return ((!isNaN(num) && num >= 0) ||
                    'Balance due must be a non-negative number');
            },
            description: 'Outstanding balance',
        },
        {
            key: 'notes',
            header: 'Notes',
            width: 30,
            required: false,
            type: 'string',
            validation: value => !value || value.length <= 500 || 'Notes must not exceed 500 characters',
            description: 'Additional notes about the invoice',
        },
        {
            key: 'billing_address',
            header: 'Billing Address',
            width: 40,
            required: false,
            type: 'string',
            validation: value => !value ||
                value.length <= 500 ||
                'Billing address must not exceed 500 characters',
            description: 'Customer billing address',
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
            description: 'Active status - Y for Yes, N for No',
        },
    ];
    async getSampleData() {
        try {
            const [customer, order, currency] = await Promise.all([
                prisma_client_1.default.customers.findFirst({ where: { is_active: 'Y' } }),
                prisma_client_1.default.orders.findFirst({ where: { is_active: 'Y' } }),
                prisma_client_1.default.currencies.findFirst({ where: { is_active: 'Y' } }),
            ]);
            return [
                {
                    invoice_number: 'INV-2024-001',
                    parent_id: order?.id || 1,
                    customer_id: customer?.id || 1,
                    currency_id: currency?.id || 1,
                    invoice_date: new Date().toISOString().split('T')[0],
                    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                        .toISOString()
                        .split('T')[0], // 30 days from now
                    status: 'sent',
                    payment_method: 'credit',
                    subtotal: 1000.0,
                    discount_amount: 50.0,
                    tax_amount: 95.0,
                    shipping_amount: 25.0,
                    total_amount: 1070.0,
                    amount_paid: 0.0,
                    balance_due: 1070.0,
                    notes: 'Invoice for order #ORD-2024-001',
                    billing_address: '123 Main Street, New York, NY 10001',
                    is_active: 'Y',
                },
                {
                    invoice_number: 'INV-2024-002',
                    parent_id: order?.id || 1,
                    customer_id: customer?.id || 1,
                    currency_id: currency?.id || 1,
                    invoice_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                        .toISOString()
                        .split('T')[0], // 7 days ago
                    due_date: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000)
                        .toISOString()
                        .split('T')[0], // 23 days from now
                    status: 'paid',
                    payment_method: 'bank_transfer',
                    subtotal: 2500.0,
                    discount_amount: 125.0,
                    tax_amount: 237.5,
                    shipping_amount: 50.0,
                    total_amount: 2662.5,
                    amount_paid: 2662.5,
                    balance_due: 0.0,
                    notes: 'Payment received via bank transfer',
                    billing_address: '456 Business Ave, New York, NY 10002',
                    is_active: 'Y',
                },
            ];
        }
        catch (error) {
            return [
                {
                    invoice_number: 'INV-2024-001',
                    parent_id: 1,
                    customer_id: 1,
                    currency_id: 1,
                    invoice_date: new Date().toISOString().split('T')[0],
                    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                        .toISOString()
                        .split('T')[0],
                    status: 'sent',
                    payment_method: 'credit',
                    subtotal: 1000.0,
                    discount_amount: 50.0,
                    tax_amount: 95.0,
                    shipping_amount: 25.0,
                    total_amount: 1070.0,
                    amount_paid: 0.0,
                    balance_due: 1070.0,
                    notes: 'Sample invoice',
                    billing_address: '123 Main Street, New York, NY 10001',
                    is_active: 'Y',
                },
            ];
        }
    }
    async checkDuplicate(data, tx) {
        const model = tx ? tx.invoices : prisma_client_1.default.invoices;
        const existingInvoice = await model.findFirst({
            where: { invoice_number: data.invoice_number },
        });
        if (existingInvoice) {
            return `Invoice with number ${data.invoice_number} already exists`;
        }
        return null;
    }
    async validateForeignKeys(data, tx) {
        if (!this.customerIds.has(data.customer_id)) {
            return `Customer with ID ${data.customer_id} does not exist`;
        }
        if (!this.orderIds.has(data.parent_id)) {
            return `Order with ID ${data.parent_id} does not exist`;
        }
        if (data.currency_id && !this.currencyIds.has(data.currency_id)) {
            return `Currency with ID ${data.currency_id} does not exist`;
        }
        return null;
    }
    async prepareDataForImport(data, userId) {
        return {
            invoice_number: data.invoice_number,
            parent_id: Number(data.parent_id),
            customer_id: Number(data.customer_id),
            currency_id: data.currency_id ? Number(data.currency_id) : null,
            invoice_date: new Date(data.invoice_date),
            due_date: data.due_date ? new Date(data.due_date) : null,
            status: data.status,
            payment_method: data.payment_method,
            subtotal: Number(data.subtotal),
            discount_amount: Number(data.discount_amount) || 0,
            tax_amount: Number(data.tax_amount) || 0,
            shipping_amount: Number(data.shipping_amount) || 0,
            total_amount: Number(data.total_amount),
            amount_paid: Number(data.amount_paid) || 0,
            balance_due: Number(data.balance_due) || 0,
            notes: data.notes || null,
            billing_address: data.billing_address || null,
            is_active: data.is_active || 'Y',
            createdate: new Date(),
            createdby: userId,
            log_inst: 1,
        };
    }
    async preloadForeignKeys() {
        const [customers, orders, currencies] = await Promise.all([
            prisma_client_1.default.customers.findMany({
                select: { id: true },
                where: { is_active: 'Y' },
            }),
            prisma_client_1.default.orders.findMany({
                select: { id: true },
                where: { is_active: 'Y' },
            }),
            prisma_client_1.default.currencies.findMany({
                select: { id: true },
                where: { is_active: 'Y' },
            }),
        ]);
        this.customerIds = new Set(customers.map(c => c.id));
        this.orderIds = new Set(orders.map(o => o.id));
        this.currencyIds = new Set(currencies.map(c => c.id));
    }
    async importData(data, userId, options = {}) {
        await this.preloadForeignKeys();
        return super.importData(data, userId, options);
    }
    getColumnDescription(key) {
        const column = this.columns.find(col => col.key === key);
        return column?.description || '';
    }
    async transformDataForExport(data) {
        return data.map(invoice => ({
            invoice_number: invoice.invoice_number,
            parent_id: invoice.parent_id,
            customer_id: invoice.customer_id,
            currency_id: invoice.currency_id || '',
            invoice_date: invoice.invoice_date?.toISOString().split('T')[0] || '',
            due_date: invoice.due_date?.toISOString().split('T')[0] || '',
            status: invoice.status || 'draft',
            payment_method: invoice.payment_method || 'credit',
            subtotal: Number(invoice.subtotal) || 0,
            discount_amount: Number(invoice.discount_amount) || 0,
            tax_amount: Number(invoice.tax_amount) || 0,
            shipping_amount: Number(invoice.shipping_amount) || 0,
            total_amount: Number(invoice.total_amount) || 0,
            amount_paid: Number(invoice.amount_paid) || 0,
            balance_due: Number(invoice.balance_due) || 0,
            notes: invoice.notes || '',
            billing_address: invoice.billing_address || '',
            is_active: invoice.is_active || 'Y',
            created_date: invoice.createdate?.toISOString().split('T')[0] || '',
            created_by: invoice.createdby || '',
            updated_date: invoice.updatedate?.toISOString().split('T')[0] || '',
            updated_by: invoice.updatedby || '',
        }));
    }
    async updateExisting(data, userId, tx) {
        const model = tx ? tx.invoices : prisma_client_1.default.invoices;
        const existing = await model.findFirst({
            where: { invoice_number: data.invoice_number },
        });
        if (!existing)
            return null;
        return await model.update({
            where: { id: existing.id },
            data: {
                ...data,
                invoice_date: new Date(data.invoice_date),
                due_date: data.due_date ? new Date(data.due_date) : null,
                subtotal: Number(data.subtotal),
                discount_amount: Number(data.discount_amount) || 0,
                tax_amount: Number(data.tax_amount) || 0,
                shipping_amount: Number(data.shipping_amount) || 0,
                total_amount: Number(data.total_amount),
                amount_paid: Number(data.amount_paid) || 0,
                balance_due: Number(data.balance_due) || 0,
                parent_id: Number(data.parent_id),
                customer_id: Number(data.customer_id),
                currency_id: data.currency_id ? Number(data.currency_id) : null,
                updatedby: userId,
                updatedate: new Date(),
            },
        });
    }
    async exportToExcel(options = {}) {
        const rawFilters = options.filters || {};
        const where = {};
        if (rawFilters.is_active) {
            where.is_active = rawFilters.is_active;
        }
        if (rawFilters.salesperson_id) {
            where.salesperson_id = Number(rawFilters.salesperson_id);
        }
        if (rawFilters.customer_id) {
            where.customer_id = Number(rawFilters.customer_id);
        }
        if (rawFilters.status && rawFilters.status !== 'all') {
            where.status = rawFilters.status;
        }
        // Date range filtering
        if (rawFilters.start_date || rawFilters.end_date) {
            where.invoice_date = {};
            if (rawFilters.start_date) {
                where.invoice_date.gte = new Date(rawFilters.start_date);
            }
            if (rawFilters.end_date) {
                const end = new Date(rawFilters.end_date);
                end.setHours(23, 59, 59, 999);
                where.invoice_date.lte = end;
            }
        }
        else if (rawFilters.time_filter && rawFilters.time_filter !== 'all') {
            const now = new Date();
            if (rawFilters.time_filter === 'today') {
                const start = new Date(now);
                start.setHours(0, 0, 0, 0);
                const end = new Date(now);
                end.setHours(23, 59, 59, 999);
                where.invoice_date = { gte: start, lte: end };
            }
            else if (rawFilters.time_filter === 'week') {
                const start = new Date(now);
                start.setDate(now.getDate() - 7);
                where.invoice_date = { gte: start };
            }
            else if (rawFilters.time_filter === 'month') {
                const start = new Date(now);
                start.setDate(now.getDate() - 30);
                where.invoice_date = { gte: start };
            }
        }
        if (rawFilters.search) {
            const s = String(rawFilters.search).trim();
            where.OR = [
                { invoice_number: { contains: s } },
                { status: { contains: s } },
                { invoices_customers: { name: { contains: s } } },
                { invoices_customers: { code: { contains: s } } },
                { invoices_salesperson: { name: { contains: s } } },
            ];
        }
        else if (rawFilters.OR) {
            where.OR = rawFilters.OR;
        }
        const query = {
            where,
            orderBy: options.orderBy || { invoice_date: 'desc' },
            include: {
                invoices_customers: {
                    select: {
                        code: true,
                        name: true,
                        latitude: true,
                        longitude: true,
                        customer_category_customer: { select: { category_name: true } },
                        customer_channel_customer: { select: { channel_name: true } },
                        customer_type_customer: { select: { type_name: true } },
                        customer_zones: { select: { name: true } },
                        customer_depot: {
                            select: {
                                name: true,
                                depots_coodrinator: { select: { name: true } },
                                depots_supervisior: { select: { name: true } },
                                user_depots_depot_id: {
                                    select: {
                                        users_depots_users: {
                                            select: {
                                                name: true,
                                                user_role: { select: { name: true } },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        customer_routes: {
                            select: {
                                code: true,
                                name: true,
                                salespersons: {
                                    select: {
                                        user: {
                                            select: {
                                                name: true,
                                                sap_code: true,
                                            },
                                        },
                                    },
                                },
                                route_depots: {
                                    select: {
                                        name: true,
                                        depots_coodrinator: { select: { name: true } },
                                        depots_supervisior: { select: { name: true } },
                                        user_depots_depot_id: {
                                            select: {
                                                users_depots_users: {
                                                    select: {
                                                        name: true,
                                                        user_role: { select: { name: true } },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                invoices_salesperson: {
                    select: {
                        name: true,
                        sap_code: true,
                        route_salespersons: {
                            select: {
                                route: {
                                    select: {
                                        name: true,
                                        code: true,
                                        route_depots: {
                                            select: {
                                                name: true,
                                                depots_coodrinator: { select: { name: true } },
                                                depots_supervisior: { select: { name: true } },
                                                user_depots_depot_id: {
                                                    select: {
                                                        users_depots_users: {
                                                            select: {
                                                                name: true,
                                                                user_role: { select: { name: true } },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        user_depot: {
                            select: {
                                name: true,
                                depots_coodrinator: { select: { name: true } },
                                depots_supervisior: { select: { name: true } },
                                user_depots_depot_id: {
                                    select: {
                                        users_depots_users: {
                                            select: {
                                                name: true,
                                                user_role: { select: { name: true } },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                invoice_items: {
                    select: {
                        id: true,
                        quantity: true,
                        base_quantity: true,
                        conversion_factor: true,
                        total_amount: true,
                        unit_price: true,
                        product_name: true,
                        notes: true,
                        invoice_items_products: {
                            select: {
                                name: true,
                                sap_code: true,
                                code: true,
                                unit_case_conversion_rate: true,
                                product_brands: { select: { name: true } },
                                product_sub_categories_products: {
                                    select: { sub_category_name: true },
                                },
                                product_categories_products: {
                                    select: { category_name: true },
                                },
                                product_flavours_products: { select: { name: true } },
                                product_volumes_products: { select: { name: true } },
                            },
                        },
                    },
                },
            },
        };
        if (options.limit)
            query.take = options.limit;
        const data = await this.getModel().findMany(query);
        const WorkbookConstructor = ExcelJS.Workbook ||
            ExcelJS.default?.Workbook ||
            ExcelJS.default;
        const workbook = new WorkbookConstructor();
        const worksheet = workbook.addWorksheet('Sales Data');
        worksheet.columns = [
            { header: 'EvDate', key: 'EvDate', width: 14 },
            { header: 'Depot', key: 'Depot', width: 22 },
            { header: 'Coordinator', key: 'Coordinator', width: 22 },
            { header: 'Supervisor', key: 'Supervisor', width: 22 },
            { header: 'SellerCode', key: 'SellerCode', width: 14 },
            { header: 'Salesman', key: 'Salesman', width: 24 },
            { header: 'Outlet Number', key: 'OutletNumber', width: 16 },
            { header: 'Outlet Name', key: 'OutletName', width: 28 },
            { header: 'Zone', key: 'Zone', width: 16 },
            { header: 'Route', key: 'Route', width: 18 },
            { header: 'Customer Channel', key: 'CustomerChannel', width: 18 },
            { header: 'Customer Type', key: 'CustomerType', width: 18 },
            { header: 'IDInv', key: 'IDInv', width: 26 },
            { header: 'Batch', key: 'Batch', width: 10 },
            { header: 'Category', key: 'Category', width: 30 },
            { header: 'Flavour', key: 'Flavour', width: 16 },
            { header: 'Volume', key: 'Volume', width: 12 },
            { header: 'Brand', key: 'Brand', width: 24 },
            { header: 'SKU Code', key: 'SKUCode', width: 14 },
            { header: 'SKU', key: 'SKU', width: 32 },
            { header: 'Pack', key: 'Pack', width: 24 },
            { header: 'PhyCas', key: 'PhyCas', width: 12 },
            { header: 'UnitCas', key: 'UnitCas', width: 12 },
            { header: 'Turnover', key: 'Turnover', width: 16 },
        ];
        const headerRow = worksheet.getRow(1);
        headerRow.height = 20;
        headerRow.eachCell((cell, colNumber) => {
            cell.font = { name: 'Calibri', size: 11, bold: true };
            if (colNumber >= 22 && colNumber <= 24) {
                cell.alignment = { vertical: 'middle', horizontal: 'right' };
            }
            else {
                cell.alignment = { vertical: 'middle', horizontal: 'left' };
            }
        });
        for (const inv of data) {
            const invDate = inv.invoice_date ? new Date(inv.invoice_date) : '';
            const route = inv.invoices_customers?.customer_routes?.code ||
                inv.invoices_customers?.customer_routes?.name ||
                inv.invoices_salesperson?.route_salespersons?.[0]?.route?.code ||
                inv.invoices_salesperson?.route_salespersons?.[0]?.route?.name ||
                '';
            const routeSalesman = inv.invoices_customers?.customer_routes?.salespersons?.[0]?.user;
            const salesman = inv.invoices_salesperson?.name || routeSalesman?.name || '';
            const sellerCode = inv.invoices_salesperson?.sap_code || routeSalesman?.sap_code || '';
            const depotData = inv.invoices_customers?.customer_depot ||
                inv.invoices_customers?.customer_routes?.route_depots ||
                inv.invoices_salesperson?.user_depot ||
                inv.invoices_salesperson?.route_salespersons?.[0]?.route?.route_depots;
            const depot = depotData?.name || '';
            let coordinator = depotData?.depots_coodrinator?.name || '';
            let supervisor = depotData?.depots_supervisior?.name || '';
            if (depotData?.user_depots_depot_id) {
                const assignedUsers = depotData.user_depots_depot_id
                    .map((ud) => ud.users_depots_users)
                    .filter(Boolean);
                const coordUser = assignedUsers.find((u) => u.user_role?.name === 'Sales coordinator');
                if (coordUser)
                    coordinator = coordUser.name;
                const superUser = assignedUsers.find((u) => u.user_role?.name === 'Area Sales Supervisor');
                if (superUser)
                    supervisor = superUser.name;
            }
            const outletCode = inv.invoices_customers?.code || '';
            const outletName = inv.invoices_customers?.name || '';
            const zoneName = inv.invoices_customers?.customer_zones?.name || '';
            const channel = inv.invoices_customers?.customer_category_customer?.category_name ||
                inv.invoices_customers?.customer_channel_customer?.channel_name ||
                '';
            const typeName = inv.invoices_customers?.customer_type_customer?.type_name || '';
            const invoiceNum = inv.invoice_number || (inv.id ? String(inv.id) : '');
            const items = inv.invoice_items && inv.invoice_items.length > 0
                ? inv.invoice_items
                : [null];
            for (const item of items) {
                const product = item?.invoice_items_products;
                const qty = Number(item?.quantity) || 0;
                const baseQty = Number(item?.base_quantity) || 0;
                const conv = Number(item?.conversion_factor) || 1;
                const phyCase = item ? qty + (conv > 0 ? baseQty / conv : 0) : 0;
                const unitCase = item
                    ? phyCase * Number(product?.unit_case_conversion_rate || 1)
                    : 0;
                const turnover = item
                    ? item.total_amount !== null && item.total_amount !== undefined
                        ? Number(item.total_amount)
                        : phyCase * Number(item.unit_price || 0)
                    : 0;
                const row = worksheet.addRow({
                    EvDate: invDate,
                    Depot: depot,
                    Coordinator: coordinator,
                    Supervisor: supervisor,
                    SellerCode: sellerCode,
                    Salesman: salesman,
                    OutletNumber: outletCode,
                    OutletName: outletName,
                    Zone: zoneName,
                    Route: route,
                    CustomerChannel: channel,
                    CustomerType: typeName,
                    IDInv: invoiceNum,
                    Batch: item?.notes || '',
                    Category: product?.product_categories_products?.category_name || '',
                    Flavour: product?.product_flavours_products?.name || '',
                    Volume: product?.product_volumes_products?.name || '',
                    Brand: product?.product_brands?.name || '',
                    SKUCode: product?.sap_code || product?.code || '',
                    SKU: product?.name || item?.product_name || '',
                    Pack: product?.product_sub_categories_products?.sub_category_name || '',
                    PhyCas: phyCase,
                    UnitCas: unitCase,
                    Turnover: turnover,
                });
                row.height = 19;
                row.eachCell((cell, colNumber) => {
                    cell.font = { name: 'Calibri', size: 11 };
                    if (colNumber === 1) {
                        if (cell.value instanceof Date) {
                            cell.numFmt = 'DD/MM/YYYY';
                        }
                        cell.alignment = { vertical: 'middle', horizontal: 'left' };
                    }
                    else if (colNumber === 22 || colNumber === 23) {
                        cell.numFmt = '0.00';
                        cell.alignment = { vertical: 'middle', horizontal: 'right' };
                    }
                    else if (colNumber === 24) {
                        cell.numFmt = '#,##0.00';
                        cell.alignment = { vertical: 'middle', horizontal: 'right' };
                    }
                    else {
                        cell.alignment = { vertical: 'middle', horizontal: 'left' };
                    }
                });
            }
        }
        const lastRowNumber = worksheet.rowCount;
        if (lastRowNumber > 1) {
            worksheet.autoFilter = { from: 'A1', to: `X${lastRowNumber}` };
        }
        worksheet.views = [{ state: 'frozen', ySplit: 1, showGridLines: true }];
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
}
exports.InvoicesImportExportService = InvoicesImportExportService;
//# sourceMappingURL=invoices-import-export.service.js.map