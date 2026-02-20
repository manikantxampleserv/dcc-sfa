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
        const query = {
            where: options.filters,
            orderBy: options.orderBy || { id: 'desc' },
            include: {
                invoices_customers: true,
                orders: true,
                currencies: true,
                invoice_items: {
                    include: {
                        invoice_items_products: true,
                    },
                },
            },
        };
        if (options.limit)
            query.take = options.limit;
        const data = await this.getModel().findMany(query);
        const workbook = new (await Promise.resolve().then(() => __importStar(require('exceljs')))).Workbook();
        const worksheet = workbook.addWorksheet(this.displayName);
        const exportColumns = [
            ...this.columns,
            { header: 'Customer Name', key: 'customer_name', width: 25 },
            { header: 'Order Number', key: 'order_number', width: 20 },
            { header: 'Currency Name', key: 'currency_name', width: 15 },
            { header: 'Item Count', key: 'item_count', width: 12 },
            { header: 'Created Date', key: 'created_date', width: 15 },
            { header: 'Created By', key: 'created_by', width: 15 },
            { header: 'Updated Date', key: 'updated_date', width: 15 },
            { header: 'Updated By', key: 'updated_by', width: 15 },
        ];
        worksheet.columns = exportColumns.map(col => ({
            header: col.header,
            key: col.key,
            width: col.width || 20,
        }));
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' },
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.height = 25;
        const exportData = await this.transformDataForExport(data);
        exportData.forEach((row, index) => {
            const excelRow = worksheet.addRow({
                ...row,
                customer_name: data[index]?.invoices_customers?.name || '',
                order_number: data[index]?.orders?.order_number || '',
                currency_name: data[index]?.currencies?.name || '',
                item_count: data[index]?.invoice_items?.length || 0,
            });
            if (index % 2 === 0) {
                excelRow.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFF2F2F2' },
                };
            }
            excelRow.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
            });
        });
        if (data.length > 0) {
            worksheet.autoFilter = {
                from: 'A1',
                to: `${String.fromCharCode(64 + exportColumns.length)}${data.length + 1}`,
            };
        }
        const summaryRow = worksheet.addRow([]);
        summaryRow.getCell(1).value = `Total Invoices: ${data.length}`;
        summaryRow.getCell(1).font = { bold: true };
        worksheet.views = [{ state: 'frozen', ySplit: 1 }];
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
}
exports.InvoicesImportExportService = InvoicesImportExportService;
//# sourceMappingURL=invoices-import-export.service.js.map