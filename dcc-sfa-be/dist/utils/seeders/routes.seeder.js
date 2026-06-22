"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockRoutes = void 0;
exports.seedRoutes = seedRoutes;
exports.clearRoutes = clearRoutes;
const logger_1 = __importDefault(require("../../configs/logger"));
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const mockRoutes = [
    {
        code: 'TRK15A',
        name: 'Route TRK15A',
        description: 'Delivery route TRK15A',
        is_active: 'Y',
    },
    {
        code: 'TRK15B',
        name: 'Route TRK15B',
        description: 'Delivery route TRK15B',
        is_active: 'Y',
    },
    {
        code: 'TRK16A',
        name: 'Route TRK16A',
        description: 'Delivery route TRK16A',
        is_active: 'Y',
    },
    {
        code: 'TRK16B',
        name: 'Route TRK16B',
        description: 'Delivery route TRK16B',
        is_active: 'Y',
    },
    {
        code: 'TRK16C',
        name: 'Route TRK16C',
        description: 'Delivery route TRK16C',
        is_active: 'Y',
    },
    {
        code: 'TRK16D',
        name: 'Route TRK16D',
        description: 'Delivery route TRK16D',
        is_active: 'Y',
    },
    {
        code: 'TRK16E',
        name: 'Route TRK16E',
        description: 'Delivery route TRK16E',
        is_active: 'Y',
    },
    {
        code: 'TRK16F',
        name: 'Route TRK16F',
        description: 'Delivery route TRK16F',
        is_active: 'Y',
    },
    {
        code: 'TRK16G',
        name: 'Route TRK16G',
        description: 'Delivery route TRK16G',
        is_active: 'Y',
    },
];
exports.mockRoutes = mockRoutes;
async function seedRoutes() {
    try {
        const zones = await prisma_client_1.default.zones.findMany({
            select: { id: true, name: true },
            where: { is_active: 'Y' },
        });
        const depots = await prisma_client_1.default.depots.findMany({
            select: { id: true, name: true },
            where: { is_active: 'Y' },
        });
        if (zones.length === 0) {
            logger_1.default.warn('No active zones found. Skipping routes seeding.');
            return;
        }
        if (depots.length === 0) {
            logger_1.default.warn('No active depots found. Skipping routes seeding.');
            return;
        }
        const salesPersonRole = await prisma_client_1.default.roles.findFirst({
            where: { name: 'Sales Person' },
        });
        const salespersons = await prisma_client_1.default.users.findMany({
            select: { id: true, name: true },
            where: {
                role_id: salesPersonRole?.id,
                is_active: 'Y',
            },
        });
        if (salespersons.length === 0) {
            const adminUser = await prisma_client_1.default.users.findFirst({
                where: { email: 'admin@dcc.com' },
                select: { id: true, name: true },
            });
            if (adminUser) {
                salespersons.push(adminUser);
            }
        }
        let defaultRouteType = await prisma_client_1.default.route_type.findFirst({
            where: { name: 'Standard' },
        });
        if (!defaultRouteType) {
            defaultRouteType = await prisma_client_1.default.route_type.create({
                data: {
                    name: 'Standard',
                    is_active: 'Y',
                    createdate: new Date(),
                    createdby: 1,
                    log_inst: 1,
                },
            });
        }
        const defaultDepot = depots[0];
        const defaultSalesperson = salespersons.length > 0 ? salespersons[0] : null;
        let routesCreated = 0;
        let routesSkipped = 0;
        for (let i = 0; i < mockRoutes.length; i++) {
            const route = mockRoutes[i];
            const existingRoute = await prisma_client_1.default.routes.findFirst({
                where: { code: route.code },
            });
            if (!existingRoute) {
                const zone = zones[i % zones.length];
                const salesperson = salespersons.length > 0
                    ? salespersons[i % salespersons.length]
                    : defaultSalesperson;
                const routeData = {
                    name: route.name || route.code,
                    code: route.code,
                    parent_id: zone.id,
                    depot_id: defaultDepot.id,
                    route_type_id: defaultRouteType.id,
                    is_active: route.is_active,
                    createdate: new Date(),
                    createdby: salesperson?.id || 1,
                    log_inst: 1,
                };
                if (route.description) {
                    routeData.description = `${route.description} in ${zone.name} zone`;
                }
                if (salesperson) {
                    routeData.salesperson_id = salesperson.id;
                }
                await prisma_client_1.default.routes.create({
                    data: routeData,
                });
                routesCreated++;
            }
            else {
                routesSkipped++;
            }
        }
        logger_1.default.info(`Routes seeding completed: ${routesCreated} created, ${routesSkipped} skipped`);
    }
    catch (error) {
        logger_1.default.error('Error seeding routes:', error);
        throw error;
    }
}
async function clearRoutes() {
    try {
        await prisma_client_1.default.routes.deleteMany({});
    }
    catch (error) {
        throw error;
    }
}
//# sourceMappingURL=routes.seeder.js.map