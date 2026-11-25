"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAssetActivity = logAssetActivity;
const prisma_client_1 = __importDefault(require("../configs/prisma.client"));
/**
 * Logs an activity entry in the asset_activities table to power the Cooler 360 timeline.
 *
 * @param {LogAssetActivityPayload} payload - The activity payload to log.
 * @returns {Promise<any>} The created asset activity record.
 */
async function logAssetActivity(payload) {
    try {
        let userName = payload.performedByName;
        if (!userName && payload.performedBy) {
            const u = await prisma_client_1.default.users.findUnique({
                where: { id: payload.performedBy },
                select: { name: true, user_role: { select: { name: true } } },
            });
            if (u) {
                userName = u.user_role?.name
                    ? `${u.name} · ${u.user_role.name}`
                    : u.name;
            }
        }
        const activity = await prisma_client_1.default.asset_activities.create({
            data: {
                asset_id: payload.assetId,
                cooler_id: payload.coolerId || null,
                event_type: payload.eventType,
                event_date: new Date(),
                title: payload.title,
                description: payload.description || null,
                status: payload.status || null,
                location_name: payload.locationName || null,
                customer_id: payload.customerId || null,
                depot_id: payload.depotId || null,
                performed_by: payload.performedBy || 1,
                performed_by_name: userName || null,
                cost: payload.cost !== undefined && payload.cost !== null
                    ? payload.cost
                    : null,
                temperature: payload.temperature !== undefined && payload.temperature !== null
                    ? payload.temperature
                    : null,
                source_table: payload.sourceTable || null,
                source_id: payload.sourceId || null,
                meta_json: payload.meta ? JSON.stringify(payload.meta) : null,
                is_active: 'Y',
                createdate: new Date(),
                createdby: payload.performedBy || 1,
            },
        });
        return activity;
    }
    catch (error) {
        console.error('Error logging asset activity:', error?.message || error);
        return null;
    }
}
//# sourceMappingURL=assetActivity.util.js.map