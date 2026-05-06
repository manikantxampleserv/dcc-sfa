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
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const dotenv = __importStar(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables
dotenv.config({ path: path_1.default.resolve(__dirname, '../../../.env.development') });
async function deleteTodayRoutes() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    console.log(`Searching for routes created on or after: ${today.toISOString()}`);
    try {
        const routesToDelete = await prisma_client_1.default.routes.findMany({
            where: {
                createdate: {
                    gte: today,
                },
            },
            select: {
                id: true,
                name: true,
                code: true,
            },
        });
        console.log(`Found ${routesToDelete.length} routes to delete.`);
        if (routesToDelete.length > 0) {
            const ids = routesToDelete.map(r => r.id);
            console.log('Deleting related records...');
            // Delete from tables that have a foreign key to routes
            if (prisma_client_1.default.customer_group_routes) {
                await prisma_client_1.default.customer_group_routes.deleteMany({ where: { route_id: { in: ids } } });
            }
            if (prisma_client_1.default.route_salespersons) {
                await prisma_client_1.default.route_salespersons.deleteMany({ where: { route_id: { in: ids } } });
            }
            if (prisma_client_1.default.promotion_routes) {
                await prisma_client_1.default.promotion_routes.deleteMany({ where: { route_id: { in: ids } } });
            }
            if (prisma_client_1.default.pricelist_item_special_prices) {
                await prisma_client_1.default.pricelist_item_special_prices.deleteMany({ where: { route_id: { in: ids } } });
            }
            // Update customers that reference these routes
            await prisma_client_1.default.customers.updateMany({
                where: { route_id: { in: ids } },
                data: { route_id: null }
            });
            // Update visits that reference these routes
            await prisma_client_1.default.visits.updateMany({
                where: { route_id: { in: ids } },
                data: { route_id: null }
            });
            const deleteResult = await prisma_client_1.default.routes.deleteMany({
                where: {
                    id: {
                        in: ids,
                    },
                },
            });
            console.log(`Successfully deleted ${deleteResult.count} routes.`);
        }
        else {
            console.log('No routes found to delete.');
        }
    }
    catch (error) {
        console.error('Error deleting routes:', error);
    }
    finally {
        await prisma_client_1.default.$disconnect();
    }
}
deleteTodayRoutes();
//# sourceMappingURL=delete_today_routes.js.map