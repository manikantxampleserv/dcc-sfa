"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsController = void 0;
const blackbaze_1 = require("../../utils/blackbaze");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const serializeSettings = (settings, includeCreatedAt = false, includeUpdatedAt = false) => ({
    id: settings.id,
    name: settings.name,
    code: settings.code,
    address: settings.address,
    city: settings.city,
    state: settings.state,
    country: settings.country,
    zipcode: settings.zipcode,
    phone_number: settings.phone_number,
    email: settings.email,
    website: settings.website,
    logo: settings.logo,
    is_active: settings.is_active,
    created_by: settings.created_by,
    updated_by: settings.updated_by,
    log_inst: settings.log_inst,
    smtp_host: settings.smtp_host,
    smtp_port: settings.smtp_port,
    smtp_username: settings.smtp_username,
    smtp_password: settings.smtp_password,
    currency_id: settings.currency_id,
    ...(includeCreatedAt && { created_date: settings.created_date }),
    ...(includeUpdatedAt && { updated_date: settings.updated_date }),
    currency: settings.companies_currencies
        ? {
            id: settings.companies_currencies.id,
            code: settings.companies_currencies.code,
            name: settings.companies_currencies.name,
            symbol: settings.companies_currencies.symbol,
            exchange_rate_to_base: settings.companies_currencies
                .exchange_rate_to_base
                ? Number(settings.companies_currencies.exchange_rate_to_base)
                : null,
            is_base: settings.companies_currencies.is_base,
        }
        : null,
    users: settings.users
        ? settings.users.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
        }))
        : [],
    depot_companies: settings.depot_companies
        ? settings.depot_companies.map((d) => ({
            id: d.id,
            parent_id: d.parent_id,
            name: d.name,
        }))
        : [],
});
exports.settingsController = {
    async getAllSettings(req, res) {
        try {
            const firstCompany = await prisma_client_1.default.companies.findFirst({
                orderBy: { id: 'asc' },
                include: {
                    depot_companies: true,
                    users: true,
                    companies_currencies: true,
                },
            });
            if (!firstCompany) {
                res.error('No company settings found', 404);
                return;
            }
            const totalCompanies = await prisma_client_1.default.companies.count();
            const activeCompanies = await prisma_client_1.default.companies.count({
                where: { is_active: 'Y' },
            });
            const inactiveCompanies = await prisma_client_1.default.companies.count({
                where: { is_active: 'N' },
            });
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const newCompaniesThisMonth = await prisma_client_1.default.companies.count({
                where: {
                    created_date: {
                        gte: startOfMonth,
                        lt: endOfMonth,
                    },
                },
            });
            res.success('Company settings retrieved successfully', serializeSettings(firstCompany, true, true), 200, null, {
                total_companies: totalCompanies,
                active_companies: activeCompanies,
                inactive_companies: inactiveCompanies,
                new_companies: newCompaniesThisMonth,
            });
        }
        catch (error) {
            console.error('Error fetching company settings:', error);
            res.error(error.message, 500);
        }
    },
    async updateSettings(req, res) {
        let newLogoUrl = null;
        try {
            const { id } = req.params;
            const existingCompany = await prisma_client_1.default.companies.findUnique({
                where: { id: Number(id) },
            });
            if (!existingCompany) {
                res.error('Company settings not found', 404);
                return;
            }
            const { name, address, city, state, country, zipcode, phone_number, email, website, is_active, log_inst, smtp_host, smtp_port, smtp_username, smtp_password, currency_id, } = req.body;
            const data = {
                ...(name && { name }),
                ...(address !== undefined && { address }),
                ...(city !== undefined && { city }),
                ...(state !== undefined && { state }),
                ...(country !== undefined && { country }),
                ...(zipcode !== undefined && { zipcode }),
                ...(phone_number !== undefined && { phone_number }),
                ...(email !== undefined && { email }),
                ...(website !== undefined && { website }),
                ...(is_active && { is_active }),
                ...(log_inst !== undefined && {
                    log_inst: log_inst ? Number(log_inst) : null,
                }),
                ...(smtp_host !== undefined && { smtp_host }),
                ...(smtp_port !== undefined && {
                    smtp_port: smtp_port ? Number(smtp_port) : null,
                }),
                ...(smtp_username !== undefined && { smtp_username }),
                ...(smtp_password !== undefined && { smtp_password }),
                ...(currency_id !== undefined && {
                    currency_id: currency_id ? Number(currency_id) : null,
                }),
                updated_date: new Date(),
                updated_by: req.user?.id,
            };
            if (req.file) {
                const fileName = `logos/${Date.now()}-${req.file.originalname}`;
                newLogoUrl = await (0, blackbaze_1.uploadFile)(req.file.buffer, fileName, req.file.mimetype);
                data.logo = newLogoUrl;
            }
            const company = await prisma_client_1.default.companies.update({
                where: { id: Number(id) },
                data,
                include: { depot_companies: true, users: true },
            });
            if (req.file && existingCompany.logo) {
                try {
                    await (0, blackbaze_1.deleteFile)(existingCompany.logo);
                }
                catch (deleteError) {
                    console.error('Error deleting old logo:', deleteError);
                }
            }
            res.success('Company settings updated successfully', serializeSettings(company, true, true), 200);
        }
        catch (error) {
            if (newLogoUrl) {
                try {
                    await (0, blackbaze_1.deleteFile)(newLogoUrl);
                }
                catch (deleteError) {
                    console.error('Error deleting uploaded file:', deleteError);
                }
            }
            res.error(error.message, 500);
        }
    },
};
//# sourceMappingURL=settings.controller.js.map