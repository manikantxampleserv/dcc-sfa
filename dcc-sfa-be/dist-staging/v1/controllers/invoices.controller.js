"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoicesController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const serializeInvoice = (invoice) => ({
    id: invoice.id,
    invoice_number: invoice.invoice_number,
    parent_id: invoice.parent_id,
    customer_id: invoice.customer_id,
    currency_id: invoice.currency_id,
    invoice_date: invoice.invoice_date?.toISOString() || '',
    due_date: invoice.due_date?.toISOString(),
    status: invoice.status,
    payment_method: invoice.payment_method,
    subtotal: Number(invoice.subtotal),
    discount_amount: Number(invoice.discount_amount),
    tax_amount: Number(invoice.tax_amount),
    shipping_amount: Number(invoice.shipping_amount),
    total_amount: Number(invoice.total_amount),
    amount_paid: Number(invoice.amount_paid),
    balance_due: Number(invoice.balance_due),
    notes: invoice.notes,
    billing_address: invoice.billing_address,
    is_active: invoice.is_active,
    createdate: invoice.createdate?.toISOString(),
    createdby: invoice.createdby,
    updatedate: invoice.updatedate?.toISOString(),
    updatedby: invoice.updatedby,
    log_inst: invoice.log_inst,
    customer: invoice.invoices_customers
        ? {
            id: invoice.invoices_customers.id,
            name: invoice.invoices_customers.name,
            code: invoice.invoices_customers.code,
            type: invoice.invoices_customers.customer_type_customer?.type_name || null,
        }
        : undefined,
    currency: invoice.currencies
        ? {
            id: invoice.currencies.id,
            name: invoice.currencies.name,
            code: invoice.currencies.code,
        }
        : undefined,
    order: invoice.orders
        ? {
            id: invoice.orders.id,
            order_number: invoice.orders.order_number,
        }
        : undefined,
    invoice_items: invoice.invoice_items?.map((item) => ({
        id: item.id,
        product_id: item.product_id,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        discount_amount: Number(item.discount_amount),
        tax_amount: Number(item.tax_amount),
        notes: item.notes,
        product: item.invoice_items_products
            ? {
                id: item.invoice_items_products.id,
                name: item.invoice_items_products.name,
                code: item.invoice_items_products.code,
            }
            : undefined,
    })),
});
exports.invoicesController = {
    async createInvoice(req, res) {
        try {
            const data = req.body;
            if (!data.customer_id) {
                return res.status(400).json({ message: 'Customer is required' });
            }
            if (!data.invoice_date) {
                return res.status(400).json({ message: 'Invoice date is required' });
            }
            if (!data.status) {
                return res.status(400).json({ message: 'Status is required' });
            }
            if (!data.payment_method) {
                return res.status(400).json({ message: 'Payment method is required' });
            }
            if (!data.invoiceItems ||
                !Array.isArray(data.invoiceItems) ||
                data.invoiceItems.length === 0) {
                return res.status(400).json({
                    message: 'At leat one invoice item is required to create an invoice',
                });
            }
            const invalidItems = data.invoiceItems.filter((item) => !item.product_id || !item.quantity || !item.unit_price);
            if (invalidItems.length > 0) {
                return res.status(400).json({
                    message: 'All invoice items must have product_id, quantity, and unit_price',
                });
            }
            const invoiceNumber = data.invoice_number || `INV-${Date.now()}`;
            const invoice = await prisma_client_1.default.$transaction(async (tx) => {
                const newInvoice = await tx.invoices.create({
                    data: {
                        invoice_number: invoiceNumber,
                        parent_id: data.parent_id ? Number(data.parent_id) : 0,
                        customer_id: Number(data.customer_id),
                        currency_id: data.currency_id ? Number(data.currency_id) : null,
                        invoice_date: new Date(data.invoice_date),
                        due_date: data.due_date ? new Date(data.due_date) : null,
                        status: data.status,
                        payment_method: data.payment_method,
                        subtotal: Number(data.subtotal) || 0,
                        discount_amount: Number(data.discount_amount) || 0,
                        tax_amount: Number(data.tax_amount) || 0,
                        shipping_amount: Number(data.shipping_amount) || 0,
                        total_amount: Number(data.total_amount) || 0,
                        amount_paid: Number(data.amount_paid) || 0,
                        balance_due: Number(data.balance_due) || 0,
                        notes: data.notes || null,
                        billing_address: data.billing_address || null,
                        is_active: data.is_active || 'Y',
                        createdby: data.createdby ? Number(data.createdby) : 1,
                        log_inst: data.log_inst || 1,
                        createdate: new Date(),
                    },
                    include: {
                        invoices_customers: {
                            select: {
                                customer_type_customer: true,
                                name: true,
                                code: true,
                                email: true,
                            },
                        },
                        currencies: true,
                        orders: true,
                    },
                });
                if (data.invoiceItems && data.invoiceItems.length > 0) {
                    const productIds = data.invoiceItems.map((item) => Number(item.product_id));
                    const products = await tx.products.findMany({
                        where: { id: { in: productIds } },
                        include: {
                            product_unit_of_measurement: true,
                        },
                    });
                    const productMap = new Map(products.map(p => [p.id, p]));
                    await tx.invoice_items.createMany({
                        data: data.invoiceItems.map((item) => {
                            const product = productMap.get(Number(item.product_id));
                            return {
                                parent_id: newInvoice.id,
                                product_id: Number(item.product_id),
                                product_name: product?.name || '',
                                unit: product?.product_unit_of_measurement?.name ||
                                    product?.product_unit_of_measurement?.symbol ||
                                    'pcs',
                                quantity: Number(item.quantity),
                                unit_price: Number(item.unit_price),
                                discount_amount: Number(item.discount_amount) || 0,
                                tax_amount: Number(item.tax_amount) || 0,
                                total_amount: Number(item.quantity) * Number(item.unit_price) -
                                    (Number(item.discount_amount) || 0) +
                                    (Number(item.tax_amount) || 0),
                                notes: item.notes || null,
                            };
                        }),
                    });
                }
                return newInvoice;
            });
            const completeInvoice = await prisma_client_1.default.invoices.findUnique({
                where: { id: invoice.id },
                include: {
                    invoices_customers: {
                        select: {
                            customer_type_customer: true,
                            name: true,
                            code: true,
                            email: true,
                        },
                    },
                    currencies: true,
                    orders: true,
                    invoice_items: {
                        include: {
                            invoice_items_products: true,
                        },
                    },
                },
            });
            res.status(201).json({
                message: 'Invoice created successfully',
                data: serializeInvoice(completeInvoice),
            });
        }
        catch (error) {
            console.error('Create Invoice Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getInvoices(req, res) {
        try {
            const { page = '1', limit = '10', search = '', customer_id, status, payment_method, invoice_date_from, invoice_date_to, currency_id, is_active = 'Y', } = req.query;
            const page_num = parseInt(page, 10);
            const limit_num = parseInt(limit, 10);
            const searchLower = search.toLowerCase();
            const filters = {
                is_active: is_active,
                ...(search && {
                    OR: [
                        { invoice_number: { contains: searchLower } },
                        { notes: { contains: searchLower } },
                        { billing_address: { contains: searchLower } },
                        { invoices_customers: { name: { contains: searchLower } } },
                        { invoices_customers: { code: { contains: searchLower } } },
                    ],
                }),
                ...(customer_id && { customer_id: Number(customer_id) }),
                ...(status && { status: status }),
                ...(payment_method && { payment_method: payment_method }),
                ...(currency_id && { currency_id: Number(currency_id) }),
                ...(invoice_date_from || invoice_date_to
                    ? {
                        invoice_date: {
                            ...(invoice_date_from && {
                                gte: new Date(invoice_date_from),
                            }),
                            ...(invoice_date_to && {
                                lte: new Date(invoice_date_to),
                            }),
                        },
                    }
                    : {}),
            };
            const totalInvoices = await prisma_client_1.default.invoices.count({ where: filters });
            const totalAmount = await prisma_client_1.default.invoices.aggregate({
                where: filters,
                _sum: { total_amount: true },
            });
            const amountPaid = await prisma_client_1.default.invoices.aggregate({
                where: filters,
                _sum: { amount_paid: true },
            });
            const balanceDue = await prisma_client_1.default.invoices.aggregate({
                where: filters,
                _sum: { balance_due: true },
            });
            const stats = {
                total_invoices: totalInvoices,
                total_amount: Number(totalAmount._sum.total_amount || 0),
                amount_paid: Number(amountPaid._sum.amount_paid || 0),
                balance_due: Number(balanceDue._sum.balance_due || 0),
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.invoices,
                filters,
                page: page_num,
                limit: limit_num,
                orderBy: { createdate: 'desc' },
                include: {
                    invoices_customers: {
                        select: {
                            customer_type_customer: true,
                            name: true,
                            code: true,
                            email: true,
                        },
                    },
                    currencies: true,
                    orders: true,
                    invoice_items: {
                        include: {
                            invoice_items_products: true,
                        },
                    },
                },
            });
            res.json({
                success: true,
                message: 'Invoices retrieved successfully',
                data: data.map((d) => serializeInvoice(d)),
                pagination: {
                    requestDuration: Date.now(),
                    timestamp: new Date().toISOString(),
                    ...pagination,
                },
                stats,
            });
        }
        catch (error) {
            console.error('Get Invoices Error:', error);
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },
    async getInvoiceById(req, res) {
        try {
            const { id } = req.params;
            const invoice = await prisma_client_1.default.invoices.findUnique({
                where: { id: Number(id) },
                include: {
                    invoices_customers: {
                        select: {
                            customer_type_customer: true,
                            name: true,
                            code: true,
                            email: true,
                        },
                    },
                    currencies: true,
                    orders: true,
                    invoice_items: {
                        include: {
                            invoice_items_products: true,
                        },
                    },
                },
            });
            if (!invoice) {
                return res.status(404).json({ message: 'Invoice not found' });
            }
            res.json({
                message: 'Invoice fetched successfully',
                data: serializeInvoice(invoice),
            });
        }
        catch (error) {
            console.error('Get Invoice Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updateInvoice(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;
            const existingInvoice = await prisma_client_1.default.invoices.findUnique({
                where: { id: Number(id) },
            });
            if (!existingInvoice) {
                return res.status(404).json({ message: 'Invoice not found' });
            }
            const completeInvoice = await prisma_client_1.default.invoices.findUnique({
                where: { id: Number(id) },
                include: {
                    invoices_customers: {
                        select: {
                            customer_type_customer: true,
                            name: true,
                            code: true,
                            email: true,
                        },
                    },
                    currencies: true,
                    orders: true,
                    invoice_items: {
                        include: {
                            invoice_items_products: true,
                        },
                    },
                },
            });
            res.json({
                message: 'Invoice updated successfully',
                data: serializeInvoice(completeInvoice),
            });
        }
        catch (error) {
            console.error('Update Invoice Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteInvoice(req, res) {
        try {
            const { id } = req.params;
            const existingInvoice = await prisma_client_1.default.invoices.findUnique({
                where: { id: Number(id) },
            });
            if (!existingInvoice) {
                return res.status(404).json({ message: 'Invoice not found' });
            }
            await prisma_client_1.default.$transaction(async (tx) => {
                await tx.invoice_items.deleteMany({
                    where: { parent_id: Number(id) },
                });
                await tx.invoices.delete({ where: { id: Number(id) } });
            });
            res.json({ message: 'Invoice deleted successfully' });
        }
        catch (error) {
            console.error('Delete Invoice Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async createInvoicePaymentLine(req, res) {
        try {
            const { invoiceId } = req.params;
            const data = req.body;
            if (!data.payment_id) {
                return res.status(400).json({ message: 'Payment ID is required' });
            }
            if (!data.amount_applied) {
                return res.status(400).json({ message: 'Amount applied is required' });
            }
            const invoice = await prisma_client_1.default.invoices.findUnique({
                where: { id: Number(invoiceId) },
            });
            if (!invoice) {
                return res.status(404).json({ message: 'Invoice not found' });
            }
            const payment = await prisma_client_1.default.payments.findUnique({
                where: { id: Number(data.payment_id) },
            });
            if (!payment) {
                return res.status(404).json({ message: 'Payment not found' });
            }
            const paymentLine = await prisma_client_1.default.payment_lines.create({
                data: {
                    parent_id: Number(data.payment_id),
                    invoice_id: Number(invoiceId),
                    invoice_number: invoice.invoice_number,
                    invoice_date: invoice.invoice_date,
                    amount_applied: Number(data.amount_applied),
                    notes: data.notes || null,
                },
                include: {
                    invoices: true,
                    payments: {
                        include: {
                            payments_customers: true,
                            users_payments_collected_byTousers: true,
                            currencies: true,
                        },
                    },
                },
            });
            res.status(201).json({
                message: 'Payment line created successfully',
                data: paymentLine,
            });
        }
        catch (error) {
            console.error('Create Invoice Payment Line Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getInvoicePaymentLines(req, res) {
        try {
            const { invoiceId } = req.params;
            const paymentLines = await prisma_client_1.default.payment_lines.findMany({
                where: { invoice_id: Number(invoiceId) },
                include: {
                    invoices: true,
                    payments: {
                        include: {
                            payments_customers: true,
                            users_payments_collected_byTousers: true,
                            currencies: true,
                        },
                    },
                },
                orderBy: { id: 'desc' },
            });
            res.json({
                success: true,
                message: 'Payment lines retrieved successfully',
                data: paymentLines,
            });
        }
        catch (error) {
            console.error('Get Invoice Payment Lines Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updateInvoicePaymentLine(req, res) {
        try {
            const { invoiceId, lineId } = req.params;
            const data = req.body;
            const existingLine = await prisma_client_1.default.payment_lines.findFirst({
                where: {
                    id: Number(lineId),
                    invoice_id: Number(invoiceId),
                },
            });
            if (!existingLine) {
                return res.status(404).json({ message: 'Payment line not found' });
            }
            const paymentLine = await prisma_client_1.default.payment_lines.update({
                where: { id: Number(lineId) },
                data: {
                    amount_applied: data.amount_applied
                        ? Number(data.amount_applied)
                        : undefined,
                    notes: data.notes !== undefined ? data.notes : undefined,
                },
                include: {
                    invoices: true,
                    payments: {
                        include: {
                            payments_customers: true,
                            users_payments_collected_byTousers: true,
                            currencies: true,
                        },
                    },
                },
            });
            res.json({
                message: 'Payment line updated successfully',
                data: paymentLine,
            });
        }
        catch (error) {
            console.error('Update Invoice Payment Line Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteInvoicePaymentLine(req, res) {
        try {
            const { invoiceId, lineId } = req.params;
            const existingLine = await prisma_client_1.default.payment_lines.findFirst({
                where: {
                    id: Number(lineId),
                    invoice_id: Number(invoiceId),
                },
            });
            if (!existingLine) {
                return res.status(404).json({ message: 'Payment line not found' });
            }
            await prisma_client_1.default.payment_lines.delete({
                where: { id: Number(lineId) },
            });
            res.json({ message: 'Payment line deleted successfully' });
        }
        catch (error) {
            console.error('Delete Invoice Payment Line Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async bulkUpdateInvoicePaymentLines(req, res) {
        try {
            const { invoiceId } = req.params;
            const { paymentLines } = req.body;
            if (!Array.isArray(paymentLines)) {
                return res
                    .status(400)
                    .json({ message: 'Payment lines must be an array' });
            }
            const invoice = await prisma_client_1.default.invoices.findUnique({
                where: { id: Number(invoiceId) },
            });
            if (!invoice) {
                return res.status(404).json({ message: 'Invoice not found' });
            }
            const result = await prisma_client_1.default.$transaction(async (tx) => {
                await tx.payment_lines.deleteMany({
                    where: { invoice_id: Number(invoiceId) },
                });
                const newPaymentLines = [];
                for (const line of paymentLines) {
                    if (line.payment_id && line.amount_applied) {
                        const paymentLine = await tx.payment_lines.create({
                            data: {
                                parent_id: Number(line.payment_id),
                                invoice_id: Number(invoiceId),
                                invoice_number: invoice.invoice_number,
                                invoice_date: invoice.invoice_date,
                                amount_applied: Number(line.amount_applied),
                                notes: line.notes || null,
                            },
                        });
                        newPaymentLines.push(paymentLine);
                    }
                }
                return newPaymentLines;
            });
            res.json({
                message: 'Payment lines updated successfully',
                data: result,
            });
        }
        catch (error) {
            console.error('Bulk Update Invoice Payment Lines Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async createInvoiceItem(req, res) {
        try {
            const { invoiceId } = req.params;
            const data = req.body;
            if (!data.product_id) {
                return res.status(400).json({ message: 'Product ID is required' });
            }
            if (!data.quantity) {
                return res.status(400).json({ message: 'Quantity is required' });
            }
            if (!data.unit_price) {
                return res.status(400).json({ message: 'Unit price is required' });
            }
            const invoice = await prisma_client_1.default.invoices.findUnique({
                where: { id: Number(invoiceId) },
            });
            if (!invoice) {
                return res.status(404).json({ message: 'Invoice not found' });
            }
            const product = await prisma_client_1.default.products.findUnique({
                where: { id: Number(data.product_id) },
                include: {
                    product_unit_of_measurement: true,
                },
            });
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            const invoiceItem = await prisma_client_1.default.invoice_items.create({
                data: {
                    parent_id: Number(invoiceId),
                    product_id: Number(data.product_id),
                    product_name: product.name,
                    unit: product.product_unit_of_measurement?.name ||
                        product.product_unit_of_measurement?.symbol ||
                        'pcs',
                    quantity: Number(data.quantity),
                    unit_price: Number(data.unit_price),
                    discount_amount: Number(data.discount_amount) || 0,
                    tax_amount: Number(data.tax_amount) || 0,
                    total_amount: Number(data.quantity) * Number(data.unit_price) -
                        (Number(data.discount_amount) || 0) +
                        (Number(data.tax_amount) || 0),
                    notes: data.notes || null,
                },
                include: {
                    invoice_items_products: true,
                },
            });
            res.status(201).json({
                message: 'Invoice item created successfully',
                data: invoiceItem,
            });
        }
        catch (error) {
            console.error('Create Invoice Item Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getInvoiceItems(req, res) {
        try {
            const { invoiceId } = req.params;
            const invoiceItems = await prisma_client_1.default.invoice_items.findMany({
                where: { parent_id: Number(invoiceId) },
                include: {
                    invoice_items_products: {
                        include: {
                            product_unit_of_measurement: true,
                        },
                    },
                },
                orderBy: { id: 'asc' },
            });
            res.json({
                success: true,
                message: 'Invoice items retrieved successfully',
                data: invoiceItems,
            });
        }
        catch (error) {
            console.error('Get Invoice Items Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updateInvoiceItem(req, res) {
        try {
            const { invoiceId, itemId } = req.params;
            const data = req.body;
            const existingItem = await prisma_client_1.default.invoice_items.findFirst({
                where: {
                    id: Number(itemId),
                    parent_id: Number(invoiceId),
                },
            });
            if (!existingItem) {
                return res.status(404).json({ message: 'Invoice item not found' });
            }
            const invoiceItem = await prisma_client_1.default.invoice_items.update({
                where: { id: Number(itemId) },
                data: {
                    quantity: data.quantity ? Number(data.quantity) : undefined,
                    unit_price: data.unit_price ? Number(data.unit_price) : undefined,
                    discount_amount: data.discount_amount !== undefined
                        ? Number(data.discount_amount)
                        : undefined,
                    tax_amount: data.tax_amount !== undefined ? Number(data.tax_amount) : undefined,
                    total_amount: data.quantity && data.unit_price
                        ? Number(data.quantity) * Number(data.unit_price) -
                            (Number(data.discount_amount) || 0) +
                            (Number(data.tax_amount) || 0)
                        : undefined,
                    notes: data.notes !== undefined ? data.notes : undefined,
                },
                include: {
                    invoice_items_products: true,
                },
            });
            res.json({
                message: 'Invoice item updated successfully',
                data: invoiceItem,
            });
        }
        catch (error) {
            console.error('Update Invoice Item Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteInvoiceItem(req, res) {
        try {
            const { invoiceId, itemId } = req.params;
            const existingItem = await prisma_client_1.default.invoice_items.findFirst({
                where: {
                    id: Number(itemId),
                    parent_id: Number(invoiceId),
                },
            });
            if (!existingItem) {
                return res.status(404).json({ message: 'Invoice item not found' });
            }
            await prisma_client_1.default.invoice_items.delete({
                where: { id: Number(itemId) },
            });
            res.json({ message: 'Invoice item deleted successfully' });
        }
        catch (error) {
            console.error('Delete Invoice Item Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async bulkUpdateInvoiceItems(req, res) {
        try {
            const { invoiceId } = req.params;
            const { invoiceItems } = req.body;
            if (!Array.isArray(invoiceItems)) {
                return res
                    .status(400)
                    .json({ message: 'Invoice items must be an array' });
            }
            const invoice = await prisma_client_1.default.invoices.findUnique({
                where: { id: Number(invoiceId) },
            });
            if (!invoice) {
                return res.status(404).json({ message: 'Invoice not found' });
            }
            const result = await prisma_client_1.default.$transaction(async (tx) => {
                await tx.invoice_items.deleteMany({
                    where: { parent_id: Number(invoiceId) },
                });
                const newInvoiceItems = [];
                for (const item of invoiceItems) {
                    if (item.product_id && item.quantity && item.unit_price) {
                        const product = await tx.products.findUnique({
                            where: { id: Number(item.product_id) },
                            include: {
                                product_unit_of_measurement: true,
                            },
                        });
                        if (product) {
                            const invoiceItem = await tx.invoice_items.create({
                                data: {
                                    parent_id: Number(invoiceId),
                                    product_id: Number(item.product_id),
                                    product_name: product.name,
                                    unit: product.product_unit_of_measurement?.name ||
                                        product.product_unit_of_measurement?.symbol ||
                                        'pcs',
                                    quantity: Number(item.quantity),
                                    unit_price: Number(item.unit_price),
                                    discount_amount: Number(item.discount_amount) || 0,
                                    tax_amount: Number(item.tax_amount) || 0,
                                    total_amount: Number(item.quantity) * Number(item.unit_price) -
                                        (Number(item.discount_amount) || 0) +
                                        (Number(item.tax_amount) || 0),
                                    notes: item.notes || null,
                                },
                            });
                            newInvoiceItems.push(invoiceItem);
                        }
                    }
                }
                return newInvoiceItems;
            });
            res.json({
                message: 'Invoice items updated successfully',
                data: result,
            });
        }
        catch (error) {
            console.error('Bulk Update Invoice Items Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
};
//# sourceMappingURL=invoices.controller.js.map