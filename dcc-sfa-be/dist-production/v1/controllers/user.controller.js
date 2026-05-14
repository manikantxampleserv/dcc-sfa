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
    sap_code: user.sap_code,
    parent_id: user.parent_id,
    zone_id: user.zone_id,
    phone_number: user.phone_number,
    address: user.address,
    employee_id: user.employee_id,
    joining_date: user.joining_date,
    reporting_to: Number(user.reporting_to),
    profile_image: user.profile_image,
    last_login: user.last_login,
    platform: user.platform || null,
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
    depots: user.users_depots_users
        ? user.users_depots_users.map((ud) => ({
            id: ud.user_depots_depot_id.id,
            name: ud.user_depots_depot_id.name,
            code: ud.user_depots_depot_id.code,
        }))
        : [],
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
    currency: user.companies?.companies_currencies
        ? {
            id: user.companies.companies_currencies.id,
            code: user.companies.companies_currencies.code,
            name: user.companies.companies_currencies.name,
            symbol: user.companies.companies_currencies.symbol,
        }
        : null,
    routes: user.route_salespersons
        ? user.route_salespersons.map((rs) => ({
            id: rs.route.id,
            name: rs.route.name,
            code: rs.route.code,
            description: rs.route.description,
            start_location: rs.route.start_location,
            end_location: rs.route.end_location,
            estimated_distance: rs.route.estimated_distance,
            estimated_time: rs.route.estimated_time,
            role: rs.role,
            assigned_at: rs.assigned_at,
        }))
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
            const { email, password, name, role_id, parent_id, depot_ids, zone_id, phone_number, address, sap_code, employee_id, joining_date, reporting_to, is_active, platform, } = req.body;
            let parsedDepotIds = [];
            if (typeof depot_ids === 'string') {
                if (depot_ids.startsWith('[')) {
                    try {
                        parsedDepotIds = JSON.parse(depot_ids);
                    }
                    catch {
                        parsedDepotIds = [];
                    }
                }
                else {
                    parsedDepotIds = depot_ids
                        .split(',')
                        .map((id) => parseInt(id.trim()))
                        .filter((id) => !isNaN(id));
                }
            }
            else if (Array.isArray(depot_ids)) {
                parsedDepotIds = depot_ids.map(Number).filter(id => !isNaN(id));
            }
            if (email) {
                const existingUser = await prisma_client_1.default.users.findFirst({ where: { email } });
                if (existingUser) {
                    res.error('Email already exists', 400);
                    return;
                }
            }
            if (employee_id) {
                const existingEmployee = await prisma_client_1.default.users.findFirst({
                    where: { employee_id },
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
                    profile_image_url = await (0, blackbaze_1.uploadFile)(file.buffer, fileName, file.mimetype);
                }
                catch (uploadError) {
                    console.error('File upload failed:', uploadError);
                    console.warn('Continuing without profile image');
                }
            }
            const newUser = await prisma_client_1.default.users.create({
                data: {
                    email,
                    password_hash: hashedPassword,
                    name,
                    role_id: Number(role_id),
                    parent_id,
                    zone_id,
                    phone_number,
                    sap_code,
                    platform: platform || null,
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
                    users: { select: { id: true, name: true, email: true } },
                },
            });
            if (parsedDepotIds.length > 0) {
                await prisma_client_1.default.user_depots.createMany({
                    data: parsedDepotIds.map((depotId) => ({
                        user_id: newUser.id,
                        depot_id: depotId,
                        createdby: req.user?.id ?? 0,
                        createdate: new Date(),
                    })),
                });
            }
            const userWithDepots = await prisma_client_1.default.users.findUnique({
                where: { id: newUser.id },
                include: {
                    user_role: true,
                    companies: true,
                    users_depots_users: {
                        include: {
                            user_depots_depot_id: true,
                        },
                    },
                    users: { select: { id: true, name: true, email: true } },
                },
            });
            res.success('User created successfully', serializeUser(userWithDepots), 201);
        }
        catch (error) {
            console.error('Error creating user:', error);
            res.error(error.message);
        }
    },
    // async getUsers(req: any, res: any): Promise<void> {
    //   try {
    //     const {
    //       page = '1',
    //       limit = '10',
    //       search = '',
    //       isActive,
    //       role_id,
    //       depot_id,
    //       zone_id,
    //     } = req.query;
    //     const page_num = parseInt(page as string, 10);
    //     const limit_num = parseInt(limit as string, 10);
    //     const searchLower = (search as string).toLowerCase();
    //     const filters: any = {
    //       is_active: isActive as string,
    //       ...(search && {
    //         OR: [
    //           {
    //             name: {
    //               contains: searchLower,
    //             },
    //           },
    //           {
    //             email: {
    //               contains: searchLower,
    //             },
    //           },
    //           {
    //             employee_id: {
    //               contains: searchLower,
    //             },
    //           },
    //         ],
    //       }),
    //       ...(role_id && { role_id: Number(role_id) }),
    //       ...(depot_id && { depot_id: Number(depot_id) }),
    //       ...(zone_id && { zone_id: Number(zone_id) }),
    //     };
    //     const { data, pagination } = await paginate({
    //       model: prisma.users,
    //       filters,
    //       page: page_num,
    //       limit: limit_num,
    //       orderBy: { createdate: 'desc' },
    //       include: {
    //         user_role: true,
    //         companies: true,
    //         user_depot: true,
    //         users: {
    //           select: {
    //             id: true,
    //             name: true,
    //             email: true,
    //           },
    //         },
    //       },
    //     });
    //     const totalUsers = await prisma.users.count();
    //     const activeUsers = await prisma.users.count({
    //       where: { is_active: 'Y' },
    //     });
    //     const inactiveUsers = await prisma.users.count({
    //       where: { is_active: 'N' },
    //     });
    //     const now = new Date();
    //     const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    //     const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    //     const newUsersThisMonth = await prisma.users.count({
    //       where: {
    //         createdate: {
    //           gte: startOfMonth,
    //           lt: endOfMonth,
    //         },
    //       },
    //     });
    //     res.success(
    //       'Users retrieved successfully',
    //       data.map((user: any) => serializeUser(user, true, true)),
    //       200,
    //       pagination,
    //       {
    //         total_users: totalUsers,
    //         active_users: activeUsers,
    //         inactive_users: inactiveUsers,
    //         new_users: newUsersThisMonth,
    //       }
    //     );
    //   } catch (error: any) {
    //     console.error('Error fetching users:', error);
    //     res.error(error.message);
    //   }
    // },
    async getUsers(req, res) {
        try {
            const { page = '1', limit = '10', search = '', isActive, role_id, depot_id, // Keep for filtering
            zone_id, reporting_to, } = req.query;
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
                ...(depot_id && {
                    users_depots_users: {
                        some: {
                            depot_id: Number(depot_id),
                            is_active: 'Y',
                        },
                    },
                }),
                ...(zone_id && { zone_id: Number(zone_id) }),
                ...(reporting_to && { reporting_to: Number(reporting_to) }),
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
                    users_depots_users: {
                        include: {
                            user_depots_depot_id: true,
                        },
                    },
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
    // async getUserById(req: any, res: any): Promise<void> {
    //   try {
    //     const errors = validationResult(req);
    //     if (!errors.isEmpty()) {
    //       res.validationError(errors.array(), 400);
    //       return;
    //     }
    //     const id = Number(req.params.id);
    //     const user = await prisma.users.findFirst({
    //       where: { id },
    //       include: {
    //         user_role: true,
    //         companies: true,
    //         user_depot: true,
    //         users: {
    //           select: {
    //             id: true,
    //             name: true,
    //             email: true,
    //           },
    //         },
    //       },
    //     });
    //     if (!user) {
    //       res.error('User not found', 404);
    //       return;
    //     }
    //     const recentAuditLogs = await prisma.audit_logs.findMany({
    //       where: {
    //         changed_by: id,
    //         is_active: 'Y',
    //       },
    //       orderBy: { changed_at: 'desc' },
    //       take: 10,
    //       select: {
    //         id: true,
    //         table_name: true,
    //         record_id: true,
    //         action: true,
    //         changed_at: true,
    //         ip_address: true,
    //         device_info: true,
    //       },
    //     });
    //     const serializedUser = serializeUser(user);
    //     const responseData = {
    //       ...serializedUser,
    //       recent_activities: {
    //         audit_logs: recentAuditLogs.map(log => ({
    //           id: log.id,
    //           table_name: log.table_name,
    //           record_id: log.record_id,
    //           action: log.action,
    //           changed_at: log.changed_at,
    //           ip_address: log.ip_address,
    //           device_info: log.device_info,
    //         })),
    //       },
    //     };
    //     res.success('User fetched successfully', responseData, 200);
    //   } catch (error: any) {
    //     console.error('Error fetching user:', error);
    //     res.error(error.message);
    //   }
    // },
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
                    users_depots_users: {
                        include: {
                            user_depots_depot_id: true,
                        },
                    },
                    users: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    other_users: {
                        where: { is_active: 'Y' },
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            employee_id: true,
                            profile_image: true,
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
            // Calculate subordinate count
            const subordinateCount = await prisma_client_1.default.users.count({
                where: { reporting_to: id, is_active: 'Y' },
            });
            // Calculate manager team count (colleagues)
            let managerTeamCount = 0;
            if (user.reporting_to) {
                managerTeamCount = await prisma_client_1.default.users.count({
                    where: { reporting_to: Number(user.reporting_to), is_active: 'Y' },
                });
            }
            // Fetch manager's team members
            let managerTeamMembers = [];
            if (user.reporting_to) {
                managerTeamMembers = await prisma_client_1.default.users.findMany({
                    where: { reporting_to: Number(user.reporting_to), is_active: 'Y' },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        employee_id: true,
                        profile_image: true,
                    },
                });
            }
            const serializedUser = serializeUser(user, true, true);
            const responseData = {
                ...serializedUser,
                subordinates: user.other_users || [],
                manager_team_members: managerTeamMembers,
                subordinate_count: subordinateCount,
                manager_team_count: managerTeamCount,
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
    // async updateUser(req: any, res: any): Promise<void> {
    //   try {
    //     const errors = validationResult(req);
    //     if (!errors.isEmpty()) {
    //       res.validationError(errors.array(), 400);
    //       return;
    //     }
    //     const targetUserId = Number(req.params.id);
    //     const currentUserId = req.user?.id;
    //     if (!currentUserId) {
    //       res.error('User not authenticated', 401);
    //       return;
    //     }
    //     const existingUser = await prisma.users.findFirst({
    //       where: { id: targetUserId },
    //     });
    //     if (!existingUser) {
    //       res.error('User not found', 404);
    //       return;
    //     }
    //     const { createdate, updatedate, password, id, is_active, ...userData } =
    //       req.body;
    //     if (userData.email && userData.email !== existingUser.email) {
    //       const existingEmail = await prisma.users.findFirst({
    //         where: {
    //           email: userData.email,
    //           id: { not: targetUserId },
    //         },
    //       });
    //       if (existingEmail) {
    //         res.error('Email already exists', 400);
    //         return;
    //       }
    //     }
    //     if (
    //       userData.employee_id &&
    //       userData.employee_id !== existingUser.employee_id
    //     ) {
    //       const existingEmployeeId = await prisma.users.findFirst({
    //         where: {
    //           employee_id: userData.employee_id,
    //           id: { not: targetUserId },
    //         },
    //       });
    //       if (existingEmployeeId) {
    //         res.error('Employee ID already exists', 400);
    //         return;
    //       }
    //     }
    //     let profile_image_url: string | undefined;
    //     const uploadedFile = (req as any).file;
    //     if (uploadedFile) {
    //       if (existingUser.profile_image) {
    //         try {
    //           const oldFileUrl = new URL(existingUser.profile_image);
    //           const pathParts = oldFileUrl.pathname.split('/');
    //           const fileName = pathParts.slice(3).join('/');
    //           await deleteFile(fileName);
    //         } catch (err) {
    //           console.error('Error deleting old profile image:', err);
    //         }
    //       }
    //       const fileExt = uploadedFile.originalname.split('.').pop();
    //       const fileName = `profiles/profile_${targetUserId}_${Date.now()}.${fileExt}`;
    //       try {
    //         profile_image_url = await uploadFile(
    //           uploadedFile.buffer,
    //           fileName,
    //           uploadedFile.mimetype
    //         );
    //       } catch (err) {
    //         console.error('Error uploading new profile image:', err);
    //         res.error('Failed to upload profile image', 500);
    //         return;
    //       }
    //     }
    //     const updateData: any = {
    //       ...userData,
    //       ...(profile_image_url && { profile_image: profile_image_url }),
    //       depot_id: Number(userData.depot_id),
    //       updatedby: currentUserId,
    //       updatedate: new Date(),
    //     };
    //     if (password) {
    //       updateData.password_hash = await bcrypt.hash(password, 10);
    //     }
    //     if (userData.joining_date) {
    //       updateData.joining_date = new Date(userData.joining_date);
    //     }
    //     if (
    //       userData.reporting_to !== undefined &&
    //       userData.reporting_to !== null
    //     ) {
    //       updateData.reporting_to = Number(userData.reporting_to);
    //     }
    //     if (is_active !== undefined && is_active !== null) {
    //       updateData.is_active = is_active;
    //     }
    //     if (updateData.role_id) {
    //       updateData.role_id = Number(updateData.role_id);
    //     }
    //     const updatedUser = await prisma.users.update({
    //       where: { id: targetUserId },
    //       data: updateData,
    //       include: {
    //         user_role: true,
    //         companies: true,
    //         user_depot: true,
    //         users: { select: { id: true, name: true, email: true } },
    //       },
    //     });
    //     const serializedUser = serializeUser(updatedUser, true, true);
    //     res.success('Profile updated successfully', serializedUser, 200);
    //   } catch (error: any) {
    //     console.error('Error updating user:', error);
    //     res.error(error.message);
    //   }
    // },
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
            const { createdate, updatedate, password, id, is_active, depot_ids, ...userData } = req.body;
            let parsedDepotIds = [];
            if (depot_ids !== undefined) {
                if (typeof depot_ids === 'string') {
                    if (depot_ids.startsWith('[')) {
                        try {
                            parsedDepotIds = JSON.parse(depot_ids);
                        }
                        catch {
                            parsedDepotIds = [];
                        }
                    }
                    else {
                        parsedDepotIds = depot_ids
                            .split(',')
                            .map((id) => parseInt(id.trim()))
                            .filter((id) => !isNaN(id));
                    }
                }
                else if (Array.isArray(depot_ids)) {
                    parsedDepotIds = depot_ids.map(Number).filter(id => !isNaN(id));
                }
            }
            if (userData.email && userData.email !== existingUser.email) {
                const existingEmail = await prisma_client_1.default.users.findFirst({
                    where: {
                        email: userData.email,
                        id: { not: targetUserId },
                    },
                });
                if (existingEmail) {
                    res.error('Email already exists', 400);
                    return;
                }
            }
            if (userData.employee_id &&
                userData.employee_id !== existingUser.employee_id) {
                const existingEmployeeId = await prisma_client_1.default.users.findFirst({
                    where: {
                        employee_id: userData.employee_id,
                        id: { not: targetUserId },
                    },
                });
                if (existingEmployeeId) {
                    res.error('Employee ID already exists', 400);
                    return;
                }
            }
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
            await prisma_client_1.default.users.update({
                where: { id: targetUserId },
                data: updateData,
                include: {
                    user_role: true,
                    companies: true,
                    users_depots_users: {
                        include: {
                            user_depots_depot_id: true,
                        },
                    },
                    users: { select: { id: true, name: true, email: true } },
                },
            });
            if (depot_ids !== undefined) {
                await prisma_client_1.default.user_depots.deleteMany({
                    where: { user_id: targetUserId },
                });
                if (parsedDepotIds.length > 0) {
                    await prisma_client_1.default.user_depots.createMany({
                        data: parsedDepotIds.map((depotId) => ({
                            user_id: targetUserId,
                            depot_id: Number(depotId),
                            createdby: currentUserId,
                            createdate: new Date(),
                        })),
                    });
                }
            }
            const finalUser = await prisma_client_1.default.users.findUnique({
                where: { id: targetUserId },
                include: {
                    user_role: true,
                    companies: true,
                    users_depots_users: {
                        include: {
                            user_depots_depot_id: true,
                        },
                    },
                    users: { select: { id: true, name: true, email: true } },
                },
            });
            const serializedUser = serializeUser(finalUser, true, true);
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
            const user = await prisma_client_1.default.users.findUnique({
                where: { id },
                include: {
                    _count: {
                        select: {
                            customer_users: true,
                            orders_salesperson_users: true,
                            orders_approved_by: true,
                            visits_salesperson: true,
                            cooler_inspections: true,
                            asset_movements_performed_by: true,
                            asset_maintenance_technician: true,
                            payments_payments_collected_byTousers: true,
                            return_requests_users: true,
                            delivery_schedules_users: true,
                        },
                    },
                },
            });
            if (!user) {
                res.error('User not found', 404);
                return;
            }
            const constraints = [];
            if (user._count.customer_users > 0) {
                constraints.push(`${user._count.customer_users} customer(s)`);
            }
            if (user._count.orders_salesperson_users > 0) {
                constraints.push(`${user._count.orders_salesperson_users} order(s) as salesperson`);
            }
            if (user._count.orders_approved_by > 0) {
                constraints.push(`${user._count.orders_approved_by} order(s) as approver`);
            }
            if (user._count.visits_salesperson > 0) {
                constraints.push(`${user._count.visits_salesperson} visit(s)`);
            }
            if (user._count.cooler_inspections > 0) {
                constraints.push(`${user._count.cooler_inspections} cooler inspection(s)`);
            }
            if (user._count.asset_movements_performed_by > 0) {
                constraints.push(`${user._count.asset_movements_performed_by} asset movement(s)`);
            }
            if (user._count.asset_maintenance_technician > 0) {
                constraints.push(`${user._count.asset_maintenance_technician} maintenance record(s)`);
            }
            if (user._count.payments_payments_collected_byTousers > 0) {
                constraints.push(`${user._count.payments_payments_collected_byTousers} payment(s)`);
            }
            if (user._count.return_requests_users > 0) {
                constraints.push(`${user._count.return_requests_users} return request(s)`);
            }
            if (user._count.delivery_schedules_users > 0) {
                constraints.push(`${user._count.delivery_schedules_users} delivery schedule(s)`);
            }
            if (constraints.length > 0) {
                const message = `Cannot delete user "${user.name}" because it is linked to: ${constraints.join(', ')}. Please remove or reassign these records first.`;
                res.error(message, 400);
                return;
            }
            await prisma_client_1.default.$transaction(async (tx) => {
                await tx.login_history.deleteMany({
                    where: { user_id: id },
                });
                await tx.api_tokens.deleteMany({
                    where: { user_id: id },
                });
                await tx.users.delete({ where: { id: Number(id) } });
            });
            res.success('User deleted successfully', null, 200);
        }
        catch (error) {
            console.error('Error deleting user:', error);
            if (error.code === 'P2003') {
                res.error('Cannot delete user because it is referenced by other records. Please remove or reassign these records first.', 400);
            }
            else if (error.code === 'P2025') {
                res.error('User not found', 404);
            }
            else {
                res.error(error.message || 'Failed to delete user');
            }
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
                    companies: {
                        include: {
                            companies_currencies: true,
                        },
                    },
                    users_depots_users: {
                        include: {
                            user_depots_depot_id: true,
                        },
                    },
                    users: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    route_salespersons: {
                        where: {
                            is_active: 'Y',
                        },
                        include: {
                            route: {
                                select: {
                                    id: true,
                                    name: true,
                                    code: true,
                                    description: true,
                                    start_location: true,
                                    end_location: true,
                                    estimated_distance: true,
                                    estimated_time: true,
                                },
                            },
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
            const { createdate, updatedate, id, role_id, is_active, employee_id, email, password, depot_ids, ...userData } = req.body;
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
            // Parse depot_ids if it's a string
            let parsedDepotIds = [];
            if (depot_ids !== undefined) {
                if (typeof depot_ids === 'string') {
                    if (depot_ids.startsWith('[')) {
                        try {
                            parsedDepotIds = JSON.parse(depot_ids);
                        }
                        catch {
                            parsedDepotIds = [];
                        }
                    }
                    else {
                        parsedDepotIds = depot_ids
                            .split(',')
                            .map((id) => parseInt(id.trim()))
                            .filter((id) => !isNaN(id));
                    }
                }
                else if (Array.isArray(depot_ids)) {
                    parsedDepotIds = depot_ids.map(Number).filter(id => !isNaN(id));
                }
            }
            const updatedUser = await prisma_client_1.default.users.update({
                where: { id: userId },
                data: updateData,
                include: {
                    user_role: true,
                    companies: true,
                    users_depots_users: {
                        include: {
                            user_depots_depot_id: true,
                        },
                    },
                    users: { select: { id: true, name: true, email: true } },
                },
            });
            if (depot_ids !== undefined) {
                await prisma_client_1.default.user_depots.deleteMany({
                    where: { user_id: userId },
                });
                if (parsedDepotIds.length > 0) {
                    await prisma_client_1.default.user_depots.createMany({
                        data: parsedDepotIds.map((depotId) => ({
                            user_id: userId,
                            depot_id: Number(depotId),
                            createdby: userId,
                            createdate: new Date(),
                        })),
                    });
                }
            }
            const finalUser = await prisma_client_1.default.users.findUnique({
                where: { id: userId },
                include: {
                    user_role: true,
                    companies: true,
                    users_depots_users: {
                        include: {
                            user_depots_depot_id: true,
                        },
                    },
                    users: { select: { id: true, name: true, email: true } },
                },
            });
            res.success('Profile updated successfully', serializeUser(finalUser, true, true), 200);
        }
        catch (error) {
            console.error('Error updating user profile:', error);
            res.error(error.message);
        }
    },
    async getUsersDropdown(req, res) {
        try {
            const { search = '', user_id, depot_id } = req.query;
            const searchLower = search.toLowerCase().trim();
            const userId = user_id ? Number(user_id) : null;
            const depotId = depot_id ? Number(depot_id) : null;
            const where = {
                is_active: 'Y',
            };
            if (depotId) {
                where.users_depots_users = {
                    some: {
                        depot_id: depotId,
                        is_active: 'Y',
                    },
                };
            }
            if (userId) {
                where.id = userId;
            }
            else if (searchLower) {
                where.OR = [
                    { name: { contains: searchLower } },
                    { email: { contains: searchLower } },
                    { employee_id: { contains: searchLower } },
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