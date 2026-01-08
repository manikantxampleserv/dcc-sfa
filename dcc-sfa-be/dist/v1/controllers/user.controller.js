"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const express_validator_1 = require("express-validator");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const blackbaze_1 = require("../../utils/blackbaze");
const paginate_1 = require("../../utils/paginate");
const serializeUser = (user, includeCreatedAt = false, includeUpdatedAt = false) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role_id: Number(user.role_id),
    parent_id: user.parent_id,
    depot_id: user.depot_id,
    zone_id: user.zone_id,
    phone_number: user.phone_number,
    address: user.address,
    employee_id: user.employee_id,
    joining_date: user.joining_date,
    reporting_to: Number(user.reporting_to),
    profile_image: user.profile_image,
    last_login: user.last_login,
    is_active: user.is_active,
    ...(includeCreatedAt && { created_at: user.createdate }),
    ...(includeUpdatedAt && { updated_at: user.updatedate }),
    role: user.user_role
        ? {
            id: user.user_role.id,
            name: user.user_role.name,
            description: user.user_role.description,
        }
        : null,
    company: user.companies
        ? {
            id: user.companies.id,
            name: user.companies.name,
            code: user.companies.code,
        }
        : null,
    user_depot: user.user_depot
        ? {
            id: user.user_depot.id,
            name: user.user_depot.name,
            code: user.user_depot.code,
        }
        : null,
    reporting_manager: user.users
        ? {
            id: user.users.id,
            name: user.users.name,
            email: user.users.email,
        }
        : null,
    permissions: user.user_role?.roles_permission
        ? user.user_role.roles_permission
            .filter((rp) => rp.is_active === 'Y' && rp.permission?.is_active === 'Y')
            .map((rp) => rp.permission.name)
        : [],
});
exports.userController = {
    async createUser(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.validationError(errors.array(), 400);
                return;
            }
            const { email, password, name, role_id, parent_id, depot_id, zone_id, phone_number, address, employee_id, joining_date, reporting_to, is_active, } = req.body;
            const existingUser = await prisma_client_1.default.users.findFirst({
                where: { email, is_active: 'Y' },
            });
            if (existingUser) {
                res.error('Email already exists', 400);
                return;
            }
            if (employee_id) {
                const existingEmployee = await prisma_client_1.default.users.findFirst({
                    where: { employee_id, is_active: 'Y' },
                });
                if (existingEmployee) {
                    res.error('Employee ID already exists', 400);
                    return;
                }
            }
            const hashedPassword = await bcrypt_1.default.hash(password, 10);
            let profile_image_url = null;
            const file = req.file;
            if (file) {
                try {
                    const userFolder = req.user?.id ?? 'guest';
                    const fileExt = file.originalname.split('.').pop();
                    const fileName = `profiles/profile_${userFolder}_${Date.now()}.${fileExt}`;
                    console.log(' Uploading file:', {
                        originalName: file.originalname,
                        fileName,
                        mimetype: file.mimetype,
                        size: file.size,
                    });
                    profile_image_url = await (0, blackbaze_1.uploadFile)(file.buffer, fileName, file.mimetype);
                    console.log('File uploaded successfully:', profile_image_url);
                }
                catch (uploadError) {
                    console.error(' File upload failed:', uploadError);
                    console.warn(' Continuing without profile image');
                }
            }
            const newUser = await prisma_client_1.default.users.create({
                data: {
                    email,
                    password_hash: hashedPassword,
                    name,
                    role_id: Number(role_id),
                    parent_id,
                    depot_id,
                    zone_id,
                    phone_number,
                    address,
                    employee_id,
                    joining_date: joining_date ? new Date(joining_date) : null,
                    reporting_to: Number(reporting_to),
                    profile_image: profile_image_url,
                    is_active: is_active ?? 'Y',
                    createdby: req.user?.id ?? 0,
                    createdate: new Date(),
                    log_inst: 1,
                },
                include: {
                    user_role: true,
                    companies: true,
                    user_depot: true,
                    users: { select: { id: true, name: true, email: true } },
                },
            });
            res.success('User created successfully', serializeUser(newUser), 201);
        }
        catch (error) {
            console.error('Error creating user:', error);
            res.error(error.message);
        }
    },
    async getUsers(req, res) {
        try {
            const { page = '1', limit = '10', search = '', isActive, role_id, depot_id, zone_id, } = req.query;
            const page_num = parseInt(page, 10);
            const limit_num = parseInt(limit, 10);
            const searchLower = search.toLowerCase();
            const filters = {
                is_active: isActive,
                ...(search && {
                    OR: [
                        {
                            name: {
                                contains: searchLower,
                            },
                        },
                        {
                            email: {
                                contains: searchLower,
                            },
                        },
                        {
                            employee_id: {
                                contains: searchLower,
                            },
                        },
                    ],
                }),
                ...(role_id && { role_id: Number(role_id) }),
                ...(depot_id && { depot_id: Number(depot_id) }),
                ...(zone_id && { zone_id: Number(zone_id) }),
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.users,
                filters,
                page: page_num,
                limit: limit_num,
                orderBy: { createdate: 'desc' },
                include: {
                    user_role: true,
                    companies: true,
                    user_depot: true,
                    users: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });
            const totalUsers = await prisma_client_1.default.users.count();
            const activeUsers = await prisma_client_1.default.users.count({
                where: { is_active: 'Y' },
            });
            const inactiveUsers = await prisma_client_1.default.users.count({
                where: { is_active: 'N' },
            });
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const newUsersThisMonth = await prisma_client_1.default.users.count({
                where: {
                    createdate: {
                        gte: startOfMonth,
                        lt: endOfMonth,
                    },
                },
            });
            res.success('Users retrieved successfully', data.map((user) => serializeUser(user, true, true)), 200, pagination, {
                total_users: totalUsers,
                active_users: activeUsers,
                inactive_users: inactiveUsers,
                new_users: newUsersThisMonth,
            });
        }
        catch (error) {
            console.error('Error fetching users:', error);
            res.error(error.message);
        }
    },
    async getUserById(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.validationError(errors.array(), 400);
                return;
            }
            const id = Number(req.params.id);
            const user = await prisma_client_1.default.users.findFirst({
                where: { id },
                include: {
                    user_role: true,
                    companies: true,
                    user_depot: true,
                    users: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });
            if (!user) {
                res.error('User not found', 404);
                return;
            }
            const recentAuditLogs = await prisma_client_1.default.audit_logs.findMany({
                where: {
                    changed_by: id,
                    is_active: 'Y',
                },
                orderBy: { changed_at: 'desc' },
                take: 10,
                select: {
                    id: true,
                    table_name: true,
                    record_id: true,
                    action: true,
                    changed_at: true,
                    ip_address: true,
                    device_info: true,
                },
            });
            const serializedUser = serializeUser(user);
            const responseData = {
                ...serializedUser,
                recent_activities: {
                    audit_logs: recentAuditLogs.map(log => ({
                        id: log.id,
                        table_name: log.table_name,
                        record_id: log.record_id,
                        action: log.action,
                        changed_at: log.changed_at,
                        ip_address: log.ip_address,
                        device_info: log.device_info,
                    })),
                },
            };
            res.success('User fetched successfully', responseData, 200);
        }
        catch (error) {
            console.error('Error fetching user:', error);
            res.error(error.message);
        }
    },
    async updateUser(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.validationError(errors.array(), 400);
                return;
            }
            const targetUserId = Number(req.params.id);
            const currentUserId = req.user?.id;
            if (!currentUserId) {
                res.error('User not authenticated', 401);
                return;
            }
            const existingUser = await prisma_client_1.default.users.findFirst({
                where: { id: targetUserId },
            });
            if (!existingUser) {
                res.error('User not found', 404);
                return;
            }
            const { createdate, updatedate, password, id, is_active, ...userData } = req.body;
            // const restrictedFields = ['role_id', 'employee_id', 'email'];
            // restrictedFields.forEach(field => {
            //   if (field in userData) delete userData[field];
            // });
            let profile_image_url;
            const uploadedFile = req.file;
            if (uploadedFile) {
                if (existingUser.profile_image) {
                    try {
                        const oldFileUrl = new URL(existingUser.profile_image);
                        const pathParts = oldFileUrl.pathname.split('/');
                        const fileName = pathParts.slice(3).join('/');
                        await (0, blackbaze_1.deleteFile)(fileName);
                    }
                    catch (err) {
                        console.error('Error deleting old profile image:', err);
                    }
                }
                const fileExt = uploadedFile.originalname.split('.').pop();
                const fileName = `profiles/profile_${targetUserId}_${Date.now()}.${fileExt}`;
                try {
                    profile_image_url = await (0, blackbaze_1.uploadFile)(uploadedFile.buffer, fileName, uploadedFile.mimetype);
                }
                catch (err) {
                    console.error('Error uploading new profile image:', err);
                    res.error('Failed to upload profile image', 500);
                    return;
                }
            }
            const updateData = {
                ...userData,
                ...(profile_image_url && { profile_image: profile_image_url }),
                updatedby: currentUserId,
                updatedate: new Date(),
            };
            if (password) {
                updateData.password_hash = await bcrypt_1.default.hash(password, 10);
            }
            if (userData.joining_date) {
                updateData.joining_date = new Date(userData.joining_date);
            }
            if (userData.reporting_to !== undefined &&
                userData.reporting_to !== null) {
                updateData.reporting_to = Number(userData.reporting_to);
            }
            if (is_active !== undefined && is_active !== null) {
                updateData.is_active = is_active;
            }
            if (updateData.role_id) {
                updateData.role_id = Number(updateData.role_id);
            }
            const updatedUser = await prisma_client_1.default.users.update({
                where: { id: targetUserId },
                data: updateData,
                include: {
                    user_role: true,
                    companies: true,
                    user_depot: true,
                    users: { select: { id: true, name: true, email: true } },
                },
            });
            const serializedUser = serializeUser(updatedUser, true, true);
            res.success('Profile updated successfully', serializedUser, 200);
        }
        catch (error) {
            console.error('Error updating user:', error);
            res.error(error.message);
        }
    },
    async deleteUser(req, res) {
        try {
            const id = Number(req.params.id);
            await prisma_client_1.default.$transaction(async (tx) => {
                await tx.login_history.deleteMany({
                    where: { user_id: id },
                });
                await tx.api_tokens.deleteMany({
                    where: { user_id: id },
                });
                await tx.cooler_inspections.deleteMany({
                    where: { inspected_by: id },
                });
                await tx.users.delete({ where: { id: Number(id) } });
            });
            res.success('User deleted successfully', null, 200);
        }
        catch (error) {
            console.error('Error deleting user:', error);
            res.error(error.message);
        }
    },
    async getUserProfile(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.error('User not authenticated', 401);
                return;
            }
            const user = await prisma_client_1.default.users.findFirst({
                where: {
                    id: userId,
                    is_active: 'Y',
                },
                include: {
                    user_role: {
                        include: {
                            roles_permission: {
                                include: {
                                    permission: true,
                                },
                            },
                        },
                    },
                    companies: true,
                    user_depot: true,
                    users: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });
            if (!user) {
                res.error('User not found', 404);
                return;
            }
            res.success('User profile fetched successfully', serializeUser(user), 200);
        }
        catch (error) {
            console.error('Error fetching user profile:', error);
            res.error(error.message);
        }
    },
    async updateUserProfile(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.validationError(errors.array(), 400);
                return;
            }
            const userId = req.user?.id;
            if (!userId) {
                res.error('User not authenticated', 401);
                return;
            }
            const existingUser = await prisma_client_1.default.users.findFirst({
                where: { id: userId, is_active: 'Y' },
            });
            if (!existingUser) {
                res.error('User not found', 404);
                return;
            }
            const { createdate, updatedate, id, role_id, is_active, employee_id, email, password, ...userData } = req.body;
            console.log('Req.body', req.body);
            let profile_image_url;
            const uploadedFile = req.file;
            if (uploadedFile) {
                if (existingUser.profile_image) {
                    try {
                        const oldFileUrl = new URL(existingUser.profile_image);
                        const fileName = oldFileUrl.pathname.split('/').slice(3).join('/');
                        await (0, blackbaze_1.deleteFile)(fileName);
                    }
                    catch (err) {
                        console.error('Error deleting old profile image:', err);
                    }
                }
                const fileExt = uploadedFile.originalname.split('.').pop();
                const fileName = `profiles/profile_${userId}_${Date.now()}.${fileExt}`;
                try {
                    profile_image_url = await (0, blackbaze_1.uploadFile)(uploadedFile.buffer, fileName, uploadedFile.mimetype);
                }
                catch (err) {
                    console.error('Error uploading new profile image:', err);
                    res.error('Failed to upload profile image', 500);
                    return;
                }
            }
            const updateData = {
                ...userData,
                ...(profile_image_url && { profile_image: profile_image_url }),
                updatedby: userId,
                updatedate: new Date(),
            };
            if (password) {
                updateData.password_hash = await bcrypt_1.default.hash(password, 10);
            }
            if (userData.joining_date) {
                updateData.joining_date = new Date(userData.joining_date);
            }
            if (userData.reporting_to !== undefined &&
                userData.reporting_to !== null) {
                updateData.reporting_to = Number(userData.reporting_to);
            }
            const updatedUser = await prisma_client_1.default.users.update({
                where: { id: userId },
                data: updateData,
                include: {
                    user_role: true,
                    companies: true,
                    user_depot: true,
                    users: { select: { id: true, name: true, email: true } },
                },
            });
            res.success('Profile updated successfully', serializeUser(updatedUser, true, true), 200);
        }
        catch (error) {
            console.error('Error updating user profile:', error);
            res.error(error.message);
        }
    },
    async getUsersDropdown(req, res) {
        try {
            const { search = '', user_id } = req.query;
            const searchLower = search.toLowerCase().trim();
            const userId = user_id ? Number(user_id) : null;
            const where = {
                is_active: 'Y',
            };
            if (userId) {
                where.id = userId;
            }
            else if (searchLower) {
                where.OR = [
                    {
                        name: {
                            contains: searchLower,
                        },
                    },
                    {
                        email: {
                            contains: searchLower,
                        },
                    },
                    {
                        employee_id: {
                            contains: searchLower,
                        },
                    },
                ];
            }
            const users = await prisma_client_1.default.users.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
                orderBy: {
                    name: 'asc',
                },
                take: 50,
            });
            res.success('Users dropdown fetched successfully', users, 200);
        }
        catch (error) {
            console.error('Error fetching users dropdown:', error);
            res.error(error.message);
        }
    },
};
//# sourceMappingURL=user.controller.js.map