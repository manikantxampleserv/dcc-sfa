"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyController = void 0;
const blackbaze_1 = require("../../utils/blackbaze");
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
// const serializeCompany = (
//   company: any,
//   includeCreatedAt = false,
//   includeUpdatedAt = false,
//   includeSensitiveData = false
// ) => {
//   const baseData = {
//     id: company.id,
//     name: company.name,
//     code: company.code,
//     address: company.address,
//     city: company.city,
//     state: company.state,
//     country: company.country,
//     zipcode: company.zipcode,
//     phone_number: company.phone_number,
//     email: company.email,
//     website: company.website,
//     logo: company.logo,
//     is_active: company.is_active,
//     created_by: company.created_by,
//     updated_by: company.updated_by,
//     log_inst: company.log_inst,
//     smtp_host: company.smtp_host,
//     smtp_port: company.smtp_port,
//     smtp_username: company.smtp_username,
//     smtp_password: company.smtp_password,
//     ...(includeCreatedAt && { created_date: company.created_date }),
//     ...(includeUpdatedAt && { updated_date: company.updated_date }),
//     ...company(
//       includeSensitiveData && {
//         smtp_host: company.smtp_host,
//         smtp_port: company.smtp_port,
//         smttp_username: company.smtp_username,
//         smtp_mail_from_address: company.smtp_mail_from_address,
//         smtp_mail_from_name: company.smtp_mail_from_name,
//       }
//     ),
//     users: company.users
//       ? company.users.map((u: any) => ({
//           id: u.id,
//           name: u.name,
//           email: u.email,
//         }))
//       : [],
//     depot_companies: company.depot_companies
//       ? company.depot_companies.map((d: any) => ({
//           id: d.id,
//           parent_id: d.parent_id,
//           name: d.name,
//         }))
//       : [],
//   };
// };
const serializeCompany = (company, includeCreatedAt = false, includeUpdatedAt = false, includeSensitiveData = false, includeSmtpPassword = false) => {
    const baseData = {
        id: company.id,
        name: company.name,
        code: company.code,
        address: company.address,
        city: company.city,
        state: company.state,
        country: company.country,
        zipcode: company.zipcode,
        phone_number: company.phone_number,
        email: company.email,
        website: company.website,
        logo: company.logo,
        is_active: company.is_active,
        created_by: company.created_by,
        updated_by: company.updated_by,
        log_inst: company.log_inst,
        ...(includeSensitiveData && {
            smtp_host: company.smtp_host,
            smtp_port: company.smtp_port,
            smtp_username: company.smtp_username,
            smtp_mail_from_address: company.smtp_mail_from_address ||
                process.env.MAIL_FROM_ADDRESS ||
                company.smtp_username ||
                null,
            smtp_mail_from_name: company.smtp_mail_from_name ||
                process.env.MAIL_FROM_NAME ||
                'DCC SFA System',
            smtp_password_set: !!company.smtp_password,
            ...(includeSmtpPassword && { smtp_password: company.smtp_password }),
        }),
        ...(includeCreatedAt && { created_date: company.created_date }),
        ...(includeUpdatedAt && { updated_date: company.updated_date }),
        users: company.users
            ? company.users.map((u) => ({
                id: u.id,
                name: u.name,
                email: u.email,
            }))
            : [],
        depot_companies: company.depot_companies
            ? company.depot_companies.map((d) => ({
                id: d.id,
                parent_id: d.parent_id,
                name: d.name,
            }))
            : [],
    };
    return baseData;
};
exports.companyController = {
    async createCompany(req, res) {
        try {
            const { name, address, city, state, country, zipcode, phone_number, email, website, created_by, is_active, log_inst, smtp_host, smtp_port, smtp_username, smtp_password, smtp_mail_from_address, smtp_mail_from_name, currency_id, } = req.body;
            if (!name) {
                res.error('Company name is required', 400);
                return;
            }
            const prefix = name.slice(0, 3).toUpperCase();
            const lastCompany = await prisma_client_1.default.companies.findFirst({
                orderBy: { id: 'desc' },
                select: { code: true },
            });
            let newSequence = 1;
            if (lastCompany && lastCompany.code) {
                const match = lastCompany.code.match(/(\d+)$/);
                if (match) {
                    newSequence = parseInt(match[1], 10) + 1;
                }
            }
            const code = `${prefix}${newSequence.toString().padStart(3, '0')}`;
            let logoUrl = null;
            if (req.file) {
                const fileName = `logos/${Date.now()}-${req.file.originalname}`;
                logoUrl = await (0, blackbaze_1.uploadFile)(req.file.buffer, fileName, req.file.mimetype);
            }
            const company = await prisma_client_1.default.companies.create({
                data: {
                    name,
                    code,
                    address,
                    city,
                    state,
                    country,
                    zipcode,
                    phone_number,
                    email,
                    website,
                    is_active,
                    logo: logoUrl,
                    created_by: req.user?.id,
                    created_date: new Date(),
                    ...(log_inst && { log_inst: Number(log_inst) }),
                    ...(smtp_host && { smtp_host }),
                    ...(smtp_port && { smtp_port: Number(smtp_port) }),
                    ...(smtp_username && { smtp_username }),
                    ...(smtp_password && { smtp_password }),
                },
                include: { users: true, depot_companies: true },
            });
            res.success('Company created successfully', serializeCompany(company, true, false, false), 201);
        }
        catch (error) {
            res.error(error.message, 500);
        }
    },
    async getCompanies(req, res) {
        try {
            const { page, limit, search = '' } = req.query;
            const page_num = page ? parseInt(page, 10) : 1;
            const limit_num = limit ? parseInt(limit, 10) : 10;
            if (isNaN(page_num) || isNaN(limit_num)) {
                res.error('Invalid page or limit parameter', 400);
                return;
            }
            const searchLower = search.toLowerCase();
            const filters = {
                ...(search && {
                    OR: [
                        { name: { contains: searchLower } },
                        { code: { contains: searchLower } },
                        { email: { contains: searchLower } },
                        { city: { contains: searchLower } },
                        { state: { contains: searchLower } },
                        { country: { contains: searchLower } },
                    ],
                }),
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.companies,
                filters,
                page: page_num,
                limit: limit_num,
                orderBy: { created_date: 'desc' },
                include: { depot_companies: true },
            });
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
            res.success('Companies retrieved successfully', data.map((c) => serializeCompany(c, true, true, true, true)), 200, pagination, {
                total_companies: totalCompanies,
                active_companies: activeCompanies,
                inactive_companies: inactiveCompanies,
                new_companies: newCompaniesThisMonth,
            });
        }
        catch (error) {
            console.error('Error fetching companies:', error);
            res.error(error.message, 500);
        }
    },
    async getCompanyById(req, res) {
        try {
            const { id } = req.params;
            const company = await prisma_client_1.default.companies.findUnique({
                where: { id: Number(id) },
                include: { depot_companies: true, users: true },
            });
            if (!company) {
                res.error('Company not found', 404);
                return;
            }
            res.success('Company fetched successfully', serializeCompany(company, true, true, false), 200);
        }
        catch (error) {
            console.error('Error fetching company:', error);
            res.error(error.message, 500);
        }
    },
    async updateCompany(req, res) {
        let newLogoUrl = null;
        try {
            const { id } = req.params;
            const existingCompany = await prisma_client_1.default.companies.findUnique({
                where: { id: Number(id) },
            });
            if (!existingCompany) {
                res.error('Company not found', 404);
                return;
            }
            const { name, address, city, state, country, zipcode, phone_number, email, website, is_active, log_inst, smtp_host, smtp_port, smtp_username, smtp_password, smtp_mail_from_address, smtp_mail_from_name, currency_id, } = req.body;
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
                ...(smtp_password && { smtp_password }),
                ...(smtp_mail_from_address !== undefined && { smtp_mail_from_address }),
                ...(smtp_mail_from_name !== undefined && { smtp_mail_from_name }),
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
            res.success('Company updated successfully', serializeCompany(company, true, true), 200);
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
    async deleteCompany(req, res) {
        try {
            const { id } = req.params;
            const company = await prisma_client_1.default.companies.findUnique({
                where: { id: Number(id) },
            });
            if (!company) {
                res.error('Company not found', 404);
                return;
            }
            await prisma_client_1.default.companies.delete({ where: { id: Number(id) } });
            if (company.logo) {
                try {
                    await (0, blackbaze_1.deleteFile)(company.logo);
                }
                catch (deleteError) {
                    console.error('Error deleting logo:', deleteError);
                }
            }
            res.success('Company deleted successfully', null, 200);
        }
        catch (error) {
            res.error(error.message, 500);
        }
    },
};
//# sourceMappingURL=company.controller.js.map