"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockRouteTypes = void 0;
exports.seedRouteType = seedRouteType;
exports.clearRouteType = clearRouteType;
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const mockRouteTypes = [
    {
        name: 'PRIMARY',
        is_active: 'Y',
    },
    {
        name: 'SECONDARY',
        is_active: 'Y',
    },
    {
        name: 'TERTIARY',
        is_active: 'Y',
    },
    {
        name: 'URBAN',
        is_active: 'Y',
    },
    {
        name: 'RURAL',
        is_active: 'Y',
    },
    {
        name: 'EXPRESS',
        is_active: 'Y',
    },
    {
        name: 'LOCAL',
        is_active: 'Y',
    },
    {
        name: 'REGIONAL',
        is_active: 'Y',
    },
    {
        name: 'DISTRIBUTION',
        is_active: 'Y',
    },
    {
        name: 'COLLECTION',
        is_active: 'Y',
    },
];
exports.mockRouteTypes = mockRouteTypes;
async function seedRouteType() {
    try {
        for (const routeType of mockRouteTypes) {
            const existingRouteType = await prisma_client_1.default.route_type.findFirst({
                where: { name: routeType.name },
            });
            if (!existingRouteType) {
                await prisma_client_1.default.route_type.create({
                    data: {
                        name: routeType.name,
                        is_active: routeType.is_active,
                        createdate: new Date(),
                        createdby: 1,
                        log_inst: 1,
                    },
                });
            }
        }
    }
    catch (error) {
        throw error;
    }
}
async function clearRouteType() {
    try {
        await prisma_client_1.default.route_type.deleteMany({});
    }
    catch (error) {
        if (error?.code === 'P2003' ||
            error?.message?.includes('Foreign key constraint')) {
            console.warn('⚠️  Could not clear all route types due to foreign key constraints. Some records may be in use by routes or products.');
        }
        else {
            throw error;
        }
    }
}
//# sourceMappingURL=routeType.seeder.js.map