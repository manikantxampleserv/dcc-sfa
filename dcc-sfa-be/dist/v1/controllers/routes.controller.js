"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routesController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const generateRoutesCode = async (name) => {
    const prefix = name.slice(0, 3).toUpperCase();
    const lastRoutes = await prisma_client_1.default.routes.findFirst({
        orderBy: { id: 'desc' },
        select: { code: true },
    });
    let newNumber = 1;
    if (lastRoutes && lastRoutes.code) {
        const match = lastRoutes.code.match(/(\d+)$/);
        if (match) {
            newNumber = parseInt(match[1], 10) + 1;
        }
    }
    const code = `${prefix}${newNumber.toString().padStart(3, '0')}`;
    return code;
};
const serializeRoute = (route) => ({
    id: route.id,
    parent_id: route.parent_id,
    depot_id: route.depot_id,
    name: route.name,
    code: route.code,
    description: route.description,
    salesperson_id: route.salesperson_id,
    route_type_id: route.route_type_id,
    route_type: route.route_type,
    outlet_group: route.outlet_group,
    start_location: route.start_location,
    end_location: route.end_location,
    starting_latitude: route.starting_latitude?.toString() || null,
    starting_longitude: route.starting_longitude?.toString() || null,
    ending_latitude: route.ending_latitude?.toString() || null,
    ending_longitude: route.ending_longitude?.toString() || null,
    estimated_distance: route.estimated_distance?.toString() || null,
    estimated_time: route.estimated_time,
    is_active: route.is_active,
    createdate: route.createdate,
    createdby: route.createdby,
    updatedate: route.updatedate,
    updatedby: route.updatedby,
    log_inst: route.log_inst,
    customer_routes: route.customer_routes?.map((c) => ({
        id: c.id,
        name: c.name,
        code: c.code,
        type: c.type,
        contact_person: c.contact_person,
        phone_number: c.phone_number,
        email: c.email,
        address: c.address,
        city: c.city,
        state: c.state,
        zipcode: c.zipcode,
        is_active: c.is_active,
    })) || [],
    route_depots: route.route_depots
        ? {
            id: route.route_depots.id ?? 0,
            name: route.route_depots.name ?? '',
            code: route.route_depots.code ?? '',
        }
        : null,
    route_zones: route.route_zones
        ? {
            id: route.route_zones.id ?? 0,
            name: route.route_zones.name ?? '',
            code: route.route_zones.code ?? '',
        }
        : null,
    salespersons: route.salespersons?.map((sp) => ({
        id: sp.id,
        role: sp.role,
        is_active: sp.is_active,
        user: {
            id: sp.user?.id ?? 0,
            name: sp.user?.name ?? '',
            email: sp.user?.email ?? '',
        },
    })) || [],
    routes_route_type: route.routes_route_type
        ? {
            id: route.routes_route_type.id,
            name: route.routes_route_type.name,
        }
        : null,
    visit_routes: route.visit_routes?.map((v) => ({
        id: v.id,
        customer_id: v.customer_id,
        sales_person_id: v.sales_person_id,
        visit_date: v.visit_date,
        visit_time: v.visit_time,
        purpose: v.purpose,
        status: v.status,
        start_time: v.start_time,
        end_time: v.end_time,
        duration: v.duration,
        check_in_time: v.check_in_time,
        check_out_time: v.check_out_time,
        orders_created: v.orders_created,
        amount_collected: v.amount_collected?.toString() || null,
        visit_notes: v.visit_notes,
        customer_feedback: v.customer_feedback,
        next_visit_date: v.next_visit_date,
        is_active: v.is_active,
        createdate: v.createdate,
        visit_customers: v.visit_customers
            ? {
                id: v.visit_customers.id,
                name: v.visit_customers.name,
                code: v.visit_customers.code,
            }
            : null,
        visits_salesperson: v.visits_salesperson
            ? {
                id: v.visits_salesperson.id,
                name: v.visits_salesperson.name,
                email: v.visits_salesperson.email,
            }
            : null,
    })) || [],
});
exports.routesController = {
    async getRouteAssignments(req, res) {
        try {
            const { page = '1', limit = '10', search = '', depot_id, zone_id, } = req.query;
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 10;
            const searchLower = search.toLowerCase();
            const userFilters = {
                is_active: 'Y',
                ...(search && {
                    OR: [
                        { name: { contains: searchLower } },
                        { email: { contains: searchLower } },
                        { employee_id: { contains: searchLower } },
                    ],
                }),
                user_role: {
                    name: { contains: 'Sales' },
                },
                ...(depot_id && { depot_id: parseInt(depot_id, 10) }),
                ...(zone_id && { zone_id: parseInt(zone_id, 10) }),
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.users,
                filters: userFilters,
                page: pageNum,
                limit: limitNum,
                orderBy: { createdate: 'desc' },
                include: {
                    route_salespersons: {
                        where: { is_active: 'Y' },
                        include: {
                            route: {
                                select: { id: true, name: true, code: true },
                            },
                        },
                    },
                },
            });
            const response = data.map((u) => ({
                id: u.id,
                name: u.name,
                email: u.email,
                profile_image: u.profile_image,
                depot_id: u.depot_id,
                zone_id: u.zone_id,
                assigned_routes: u.route_salespersons?.map((rs) => ({
                    id: rs.route?.id,
                    name: rs.route?.name,
                    code: rs.route?.code,
                })) || [],
                assigned_routes_count: u.route_salespersons?.length || 0,
            }));
            const totalSalespersons = await prisma_client_1.default.users.count({
                where: userFilters,
            });
            const totalRoutes = await prisma_client_1.default.routes.count({
                where: { is_active: 'Y' },
            });
            const assignedRoutesDistinct = await prisma_client_1.default.route_salespersons.findMany({
                where: { is_active: 'Y' },
                distinct: ['route_id'],
                select: { route_id: true },
            });
            const totalAssignedRoutes = assignedRoutesDistinct.length;
            const totalUnassignedRoutes = Math.max(totalRoutes - assignedRoutesDistinct.length, 0);
            res.success('Route assignments retrieved successfully', response, 200, pagination, {
                total_salespersons: totalSalespersons,
                total_assigned_routes: totalAssignedRoutes,
                total_routes: totalRoutes,
                total_unassigned_routes: totalUnassignedRoutes,
            });
        }
        catch (error) {
            console.error('Get Route Assignments Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getRouteAssignmentsByUser(req, res) {
        try {
            const { userId } = req.params;
            const id = parseInt(userId, 10);
            if (isNaN(id)) {
                return res.status(400).json({ message: 'Invalid user id' });
            }
            const user = await prisma_client_1.default.users.findUnique({
                where: { id },
                include: {
                    route_salespersons: {
                        where: { is_active: 'Y' },
                        include: {
                            route: {
                                select: { id: true, name: true, code: true },
                            },
                        },
                    },
                },
            });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            const response = {
                id: user.id,
                name: user.name,
                email: user.email,
                profile_image: user.profile_image,
                assigned_routes: user.route_salespersons?.map((rs) => ({
                    id: rs.route?.id,
                    name: rs.route?.name,
                    code: rs.route?.code,
                })) || [],
            };
            res.json({
                message: 'User route assignments fetched successfully',
                data: response,
            });
        }
        catch (error) {
            console.error('Get User Route Assignments Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async setRouteAssignmentsForUser(req, res) {
        try {
            const { userId } = req.params;
            const id = parseInt(userId, 10);
            if (isNaN(id)) {
                return res.status(400).json({ message: 'Invalid user id' });
            }
            const { route_ids } = req.body;
            if (!Array.isArray(route_ids)) {
                return res
                    .status(400)
                    .json({ message: 'route_ids must be an array of numbers' });
            }
            const existingUser = await prisma_client_1.default.users.findUnique({ where: { id } });
            if (!existingUser) {
                return res.status(404).json({ message: 'User not found' });
            }
            await prisma_client_1.default.route_salespersons.deleteMany({
                where: { user_id: id },
            });
            if (route_ids.length > 0) {
                const createData = route_ids.map(rid => ({
                    route_id: Number(rid),
                    user_id: id,
                    role: 'PRIMARY',
                    is_active: 'Y',
                    assigned_at: new Date(),
                }));
                await prisma_client_1.default.route_salespersons.createMany({
                    data: createData,
                });
            }
            const updated = await prisma_client_1.default.users.findUnique({
                where: { id },
                include: {
                    route_salespersons: {
                        where: { is_active: 'Y' },
                        include: {
                            route: { select: { id: true, name: true, code: true } },
                        },
                    },
                },
            });
            res.json({
                message: 'Route assignments updated successfully',
                data: {
                    id: updated?.id,
                    name: updated?.name,
                    email: updated?.email,
                    assigned_routes: updated?.route_salespersons?.map((rs) => ({
                        id: rs.route?.id,
                        name: rs.route?.name,
                        code: rs.route?.code,
                    })) || [],
                },
            });
        }
        catch (error) {
            console.error('Set Route Assignments Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async createRoutes(req, res) {
        try {
            const data = req.body;
            if (!data.name) {
                return res.status(400).json({ message: 'Route name is required' });
            }
            if (!data.depot_id) {
                return res.status(400).json({ message: 'Depot ID is required' });
            }
            if (!data.parent_id) {
                return res
                    .status(400)
                    .json({ message: 'Parent ID (Zone) is required' });
            }
            if (!data.route_type_id) {
                return res.status(400).json({ message: 'Route type ID is required' });
            }
            const newCode = await generateRoutesCode(data.name);
            const createData = {
                name: data.name,
                code: newCode,
                description: data.description,
                route_type: data.route_type,
                outlet_group: data.outlet_group,
                start_location: data.start_location,
                end_location: data.end_location,
                starting_latitude: data.starting_latitude,
                starting_longitude: data.starting_longitude,
                ending_latitude: data.ending_latitude,
                ending_longitude: data.ending_longitude,
                estimated_distance: data.estimated_distance,
                estimated_time: data.estimated_time,
                is_active: data.is_active || 'Y',
                createdate: new Date(),
                createdby: req.user?.id || 1,
                log_inst: data.log_inst || 1,
                route_depots: {
                    connect: { id: data.depot_id },
                },
                route_zones: {
                    connect: { id: data.parent_id },
                },
                routes_route_type: {
                    connect: { id: data.route_type_id },
                },
            };
            if (data.salespersons) {
                createData.salespersons = {
                    create: data.salespersons.map((sp) => ({
                        user_id: sp.user_id,
                        role: sp.role || 'PRIMARY',
                    })),
                };
            }
            const route = await prisma_client_1.default.routes.create({
                data: createData,
                include: {
                    customer_routes: true,
                    route_depots: true,
                    route_zones: true,
                    salespersons: {
                        include: {
                            user: true,
                        },
                    },
                    routes_route_type: true,
                    visit_routes: true,
                },
            });
            res.status(201).json({
                message: 'Route created successfully',
                data: serializeRoute(route),
            });
        }
        catch (error) {
            console.error('Create Route Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getRoutes(req, res) {
        try {
            const { page, limit, search, salesperson_id, depot_id, parent_id, status, } = req.query;
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 10;
            const searchLower = search ? search.toLowerCase() : '';
            const statusLower = status ? status.toLowerCase() : '';
            const filters = {
                ...(search && {
                    OR: [
                        { name: { contains: searchLower } },
                        { code: { contains: searchLower } },
                        { description: { contains: searchLower } },
                    ],
                }),
                ...(salesperson_id && {
                    salesperson_id: parseInt(salesperson_id, 10),
                }),
                ...(depot_id && { depot_id: parseInt(depot_id, 10) }),
                ...(parent_id && { parent_id: parseInt(parent_id, 10) }),
                ...(status && {
                    is_active: statusLower === 'active' ? 'Y' : 'N',
                }),
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.routes,
                filters,
                page: pageNum,
                limit: limitNum,
                orderBy: { createdate: 'desc' },
                include: {
                    customer_routes: true,
                    route_depots: true,
                    route_zones: true,
                    salespersons: {
                        include: {
                            user: true,
                        },
                    },
                    routes_route_type: true,
                    visit_routes: true,
                },
            });
            const totalRoutes = await prisma_client_1.default.routes.count();
            const activeRoutes = await prisma_client_1.default.routes.count({
                where: { is_active: 'Y' },
            });
            const inactiveRoutes = await prisma_client_1.default.routes.count({
                where: { is_active: 'N' },
            });
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            const routesThisMonth = await prisma_client_1.default.routes.count({
                where: {
                    createdate: {
                        gte: startOfMonth,
                        lte: endOfMonth,
                    },
                },
            });
            res.success('Routes retrieved successfully', data.map((route) => serializeRoute(route)), 200, pagination, {
                total_routes: totalRoutes,
                active_routes: activeRoutes,
                inactive_routes: inactiveRoutes,
                routes_this_month: routesThisMonth,
            });
        }
        catch (error) {
            console.error('Get Routes Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getRoutesById(req, res) {
        try {
            const { id } = req.params;
            const route = await prisma_client_1.default.routes.findUnique({
                where: { id: Number(id) },
                include: {
                    customer_routes: true,
                    route_depots: true,
                    route_zones: true,
                    salespersons: {
                        include: {
                            user: true,
                        },
                    },
                    routes_route_type: true,
                    visit_routes: {
                        include: {
                            visit_customers: true,
                            visits_salesperson: true,
                        },
                        orderBy: {
                            visit_date: 'desc',
                        },
                    },
                },
            });
            if (!route) {
                return res.status(404).json({ message: 'Route not found' });
            }
            // Fetch all customers assigned to this route
            const allRouteCustomers = await prisma_client_1.default.customers.findMany({
                where: {
                    route_id: Number(id),
                    is_active: 'Y',
                },
                include: {
                    customer_depot: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                    customer_zones: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                    customer_type_customer: {
                        select: {
                            id: true,
                            type_name: true,
                        },
                    },
                    customer_channel_customer: {
                        select: {
                            id: true,
                            channel_name: true,
                        },
                    },
                    customer_category_customer: {
                        select: {
                            id: true,
                            category_name: true,
                        },
                    },
                },
                orderBy: {
                    name: 'asc',
                },
            });
            res.json({
                message: 'Route fetched successfully',
                data: {
                    ...serializeRoute(route),
                    all_customers: allRouteCustomers,
                },
            });
        }
        catch (error) {
            console.error('Get Route Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updateRoutes(req, res) {
        try {
            const { id } = req.params;
            const existingRoute = await prisma_client_1.default.routes.findUnique({
                where: { id: Number(id) },
            });
            if (!existingRoute) {
                return res.status(404).json({ message: 'Route not found' });
            }
            const data = req.body;
            const updateData = {
                name: data.name,
                description: data.description,
                route_type: data.route_type,
                outlet_group: data.outlet_group,
                start_location: data.start_location,
                end_location: data.end_location,
                starting_latitude: data.starting_latitude,
                starting_longitude: data.starting_longitude,
                ending_latitude: data.ending_latitude,
                ending_longitude: data.ending_longitude,
                estimated_distance: data.estimated_distance,
                estimated_time: data.estimated_time,
                is_active: data.is_active,
                updatedate: new Date(),
                updatedby: req.user?.id || 1,
            };
            if (data.depot_id !== undefined) {
                updateData.route_depots = {
                    connect: { id: data.depot_id },
                };
            }
            if (data.parent_id !== undefined) {
                updateData.route_zones = {
                    connect: { id: data.parent_id },
                };
            }
            if (data.route_type_id !== undefined) {
                updateData.routes_route_type = {
                    connect: { id: data.route_type_id },
                };
            }
            const salespersonsData = data.salespersons || data.salesperson_id;
            if (salespersonsData !== undefined) {
                await prisma_client_1.default.routes.update({
                    where: { id: Number(id) },
                    data: {
                        salespersons: {
                            deleteMany: {},
                        },
                    },
                });
                if (salespersonsData.length > 0) {
                    const salespersonsToCreate = salespersonsData.map((sp) => {
                        if (typeof sp === 'number' || typeof sp === 'string') {
                            return {
                                user_id: parseInt(sp.toString()),
                                role: 'PRIMARY',
                            };
                        }
                        else {
                            return {
                                user_id: sp.user_id,
                                role: sp.role || 'PRIMARY',
                            };
                        }
                    });
                    updateData.salespersons = {
                        create: salespersonsToCreate,
                    };
                }
            }
            const route = await prisma_client_1.default.routes.update({
                where: { id: Number(id) },
                data: updateData,
                include: {
                    customer_routes: true,
                    route_depots: true,
                    route_zones: true,
                    salespersons: {
                        include: {
                            user: true,
                        },
                    },
                    routes_route_type: true,
                    visit_routes: true,
                },
            });
            res.json({
                message: 'Route updated successfully',
                data: serializeRoute(route),
            });
        }
        catch (error) {
            console.error('Update Route Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteRoutes(req, res) {
        try {
            const { id } = req.params;
            const { force } = req.query;
            const existingRoute = await prisma_client_1.default.routes.findUnique({
                where: { id: Number(id) },
                include: {
                    route_depots: true,
                    route_zones: true,
                    salespersons: {
                        include: {
                            user: true,
                        },
                    },
                    routes_route_type: true,
                    customer_routes: true,
                    visit_routes: true,
                },
            });
            if (!existingRoute) {
                return res.status(404).json({ message: 'Route not found' });
            }
            const hasCustomers = existingRoute.customer_routes &&
                Array.isArray(existingRoute.customer_routes) &&
                existingRoute.customer_routes.length > 0;
            const hasVisits = existingRoute.visit_routes.length > 0;
            if (force === 'true') {
                if (hasCustomers) {
                    await prisma_client_1.default.customers.updateMany({
                        where: { route_id: Number(id) },
                        data: { route_id: null },
                    });
                }
                if (hasVisits) {
                    await prisma_client_1.default.visits.deleteMany({
                        where: { route_id: Number(id) },
                    });
                }
                await prisma_client_1.default.routes.delete({ where: { id: Number(id) } });
                res.json({
                    message: 'Route and all associated records deleted successfully',
                    deletedRecords: {
                        customers: hasCustomers ? existingRoute.customer_routes.length : 0,
                        visits: hasVisits ? existingRoute.visit_routes.length : 0,
                    },
                });
                return;
            }
            if (hasCustomers || hasVisits) {
                return res.status(400).json({
                    message: 'Cannot delete route. It has associated records.',
                    details: {
                        hasCustomers,
                        hasVisits,
                        customersCount: existingRoute.customer_routes.length,
                        visitsCount: existingRoute.visit_routes.length,
                    },
                });
            }
            await prisma_client_1.default.routes.delete({ where: { id: Number(id) } });
            res.json({ message: 'Route deleted successfully' });
        }
        catch (error) {
            console.error('Delete Route Error:', error);
            if (error.code === 'P2003') {
                return res.status(400).json({
                    message: 'Cannot delete route. It has associated records.',
                });
            }
            res.status(500).json({ message: error.message });
        }
    },
};
//# sourceMappingURL=routes.controller.js.map