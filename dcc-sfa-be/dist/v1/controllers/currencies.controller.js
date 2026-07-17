"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.currenciesController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const serializeCurrency = (currency) => ({
    id: currency.id,
    code: currency.code,
    name: currency.name,
    symbol: currency.symbol,
    exchange_rate_to_base: currency.exchange_rate_to_base,
    is_base: currency.is_base,
    is_active: currency.is_active,
    createdate: currency.createdate,
    createdby: currency.createdby,
    updatedate: currency.updatedate,
    updatedby: currency.updatedby,
    log_inst: currency.log_inst,
    credit_notes: currency.credit_notes?.map((cn) => ({
        id: cn.id,
        note_number: cn.note_number,
        amount: cn.amount,
    })) || [],
    invoices: currency.invoices?.map((inv) => ({
        id: inv.id,
        invoice_number: inv.invoice_number,
        amount: inv.amount,
    })) || [],
    payments: currency.payments?.map((p) => ({
        id: p.id,
        payment_number: p.payment_number,
        amount: p.amount,
    })) || [],
    orders: currency.orders_currencies?.map((o) => ({
        id: o.id,
        order_number: o.order_number,
        total_amount: o.total_amount,
    })) || [],
});
const handleBaseCurrency = async (isBase, currentCurrencyId, tx) => {
    const db = tx || prisma_client_1.default;
    if (isBase === 'Y') {
        await db.currencies.updateMany({
            where: {
                is_base: 'Y',
                ...(currentCurrencyId && { id: { not: currentCurrencyId } }),
            },
            data: {
                is_base: 'N',
                updatedate: new Date(),
            },
        });
    }
};
exports.currenciesController = {
    async createCurrencies(req, res) {
        try {
            const data = req.body;
            const userId = req.user?.id || 1;
            const isBase = data.is_base || 'N';
            const currency = await prisma_client_1.default.$transaction(async (tx) => {
                if (isBase === 'Y') {
                    await handleBaseCurrency('Y', undefined, tx);
                }
                return await tx.currencies.create({
                    data: {
                        code: data.code.toUpperCase(), // Ensure uppercase for consistency
                        name: data.name,
                        symbol: data.symbol,
                        exchange_rate_to_base: data.exchange_rate_to_base,
                        is_base: isBase,
                        is_active: data.is_active || 'Y',
                        createdate: new Date(),
                        createdby: userId,
                        log_inst: data.log_inst || 1,
                    },
                    include: {
                        credit_note_currencies: true,
                        invoices: true,
                        payments: true,
                        orders_currencies: true,
                    },
                });
            });
            res.status(201).json({
                message: 'Currency created successfully',
                data: serializeCurrency(currency),
            });
        }
        catch (error) {
            console.error('Create Currency Error:', error);
            // Handle specific database errors
            if (error.code === 'P2002') {
                // Unique constraint violation
                return res.status(400).json({
                    message: 'Currency with this code already exists',
                });
            }
            res.status(500).json({ message: error.message });
        }
    },
    async getAllCurrencies(req, res) {
        try {
            const { page, limit, search, status } = req.query;
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 10;
            const searchLower = search ? search.toLowerCase() : '';
            const statusLower = status ? status.toLowerCase() : '';
            const filters = {
                ...(search && {
                    OR: [
                        { code: { contains: searchLower } },
                        { name: { contains: searchLower } },
                        { symbol: { contains: searchLower } },
                    ],
                }),
                ...(status && {
                    is_active: statusLower === 'active' ? 'Y' : 'N',
                }),
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.currencies,
                filters,
                page: pageNum,
                limit: limitNum,
                orderBy: { createdate: 'desc' },
                include: {
                    credit_note_currencies: true,
                    invoices: true,
                    payments: true,
                    orders_currencies: true,
                },
            });
            const totalCurrencies = await prisma_client_1.default.currencies.count();
            const activeCurrencies = await prisma_client_1.default.currencies.count({
                where: { is_active: 'Y' },
            });
            const inactiveCurrencies = await prisma_client_1.default.currencies.count({
                where: { is_active: 'N' },
            });
            const baseCurrencies = await prisma_client_1.default.currencies.count({
                where: { is_base: 'Y' },
            });
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            const currenciesInMonth = await prisma_client_1.default.currencies.count({
                where: {
                    createdate: {
                        gte: startOfMonth,
                        lte: endOfMonth,
                    },
                },
            });
            res.success('Currencies retrieved successfully', data.map((currency) => serializeCurrency(currency)), 200, pagination, {
                total_currencies: totalCurrencies,
                active_currencies: activeCurrencies,
                inactive_currencies: inactiveCurrencies,
                base_currencies: baseCurrencies,
                currencies_in_month: currenciesInMonth,
            });
        }
        catch (error) {
            console.error('Get Currencies Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getCurrenciesById(req, res) {
        try {
            const { id } = req.params;
            const currency = await prisma_client_1.default.currencies.findUnique({
                where: { id: Number(id) },
                include: {
                    credit_note_currencies: true,
                    invoices: true,
                    payments: true,
                    orders_currencies: true,
                },
            });
            if (!currency)
                return res.status(404).json({ message: 'Currency not found' });
            res.json({
                message: 'Currency fetched successfully',
                data: serializeCurrency(currency),
            });
        }
        catch (error) {
            console.error('Get Currency Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updateCurrencies(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.id || 1;
            const existingCurrency = await prisma_client_1.default.currencies.findUnique({
                where: { id: Number(id) },
            });
            if (!existingCurrency)
                return res.status(404).json({ message: 'Currency not found' });
            const data = req.body;
            const isBase = data.is_base ?? existingCurrency.is_base;
            const currency = await prisma_client_1.default.$transaction(async (tx) => {
                if (isBase === 'Y' && existingCurrency.is_base !== 'Y') {
                    await handleBaseCurrency('Y', Number(id), tx);
                }
                return await tx.currencies.update({
                    where: { id: Number(id) },
                    data: {
                        code: data.code ?? existingCurrency.code,
                        name: data.name ?? existingCurrency.name,
                        symbol: data.symbol ?? existingCurrency.symbol,
                        exchange_rate_to_base: data.exchange_rate_to_base ??
                            existingCurrency.exchange_rate_to_base,
                        is_base: isBase,
                        is_active: data.is_active ?? existingCurrency.is_active,
                        updatedate: new Date(),
                        updatedby: userId,
                        log_inst: data.log_inst ?? existingCurrency.log_inst,
                    },
                    include: {
                        credit_note_currencies: true,
                        invoices: true,
                        payments: true,
                        orders_currencies: true,
                    },
                });
            });
            res.json({
                message: 'Currency updated successfully',
                data: serializeCurrency(currency),
            });
        }
        catch (error) {
            console.error('Update Currency Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteCurrencies(req, res) {
        try {
            const { id } = req.params;
            const existingCurrency = await prisma_client_1.default.currencies.findUnique({
                where: { id: Number(id) },
                include: {
                    companies_currencies: true,
                    credit_note_currencies: true,
                    invoices: true,
                    payments: true,
                    orders_currencies: true,
                },
            });
            if (!existingCurrency)
                return res.status(404).json({ message: 'Currency not found' });
            const hasCompanies = existingCurrency.companies_currencies.length > 0;
            const hasCreditNotes = existingCurrency.credit_note_currencies.length > 0;
            const hasInvoices = existingCurrency.invoices.length > 0;
            const hasPayments = existingCurrency.payments.length > 0;
            const hasOrders = existingCurrency.orders_currencies.length > 0;
            if (hasCompanies ||
                hasCreditNotes ||
                hasInvoices ||
                hasPayments ||
                hasOrders) {
                return res.status(400).json({
                    message: 'Cannot delete currency. It has associated records.',
                    details: {
                        hasCompanies,
                        hasCreditNotes,
                        hasInvoices,
                        hasPayments,
                        hasOrders,
                        companiesCount: existingCurrency.companies_currencies.length,
                        creditNotesCount: existingCurrency.credit_note_currencies.length,
                        invoicesCount: existingCurrency.invoices.length,
                        paymentsCount: existingCurrency.payments.length,
                        ordersCount: existingCurrency.orders_currencies.length,
                    },
                });
            }
            await prisma_client_1.default.currencies.delete({ where: { id: Number(id) } });
            res.json({ message: 'Currency deleted successfully' });
        }
        catch (error) {
            if (error.code === 'P2003') {
                return res.status(400).json({
                    message: 'Cannot delete currency. It has associated records.',
                });
            }
            res.status(500).json({ message: error.message });
        }
    },
};
//# sourceMappingURL=currencies.controller.js.map