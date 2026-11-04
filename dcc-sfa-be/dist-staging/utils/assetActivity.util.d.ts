/**
 * @interface LogAssetActivityPayload
 * Defines parameters for logging an asset or cooler event for the Cooler 360 timeline.
 */
export interface LogAssetActivityPayload {
    assetId: number;
    coolerId?: number | null;
    eventType: 'movement' | 'verification' | 'inspection' | 'maintenance';
    title: string;
    description?: string | null;
    status?: string | null;
    locationName?: string | null;
    customerId?: number | null;
    depotId?: number | null;
    performedBy: number;
    performedByName?: string | null;
    cost?: number | null;
    temperature?: number | null;
    sourceTable?: string | null;
    sourceId?: number | null;
    meta?: any;
}
/**
 * Logs an activity entry in the asset_activities table to power the Cooler 360 timeline.
 *
 * @param {LogAssetActivityPayload} payload - The activity payload to log.
 * @returns {Promise<any>} The created asset activity record.
 */
export declare function logAssetActivity(payload: LogAssetActivityPayload): Promise<{
    id: number;
    is_active: string;
    createdate: Date | null;
    createdby: number;
    depot_id: number | null;
    status: string | null;
    asset_id: number;
    cost: import("@prisma/client-runtime-utils").Decimal | null;
    source_id: number | null;
    cooler_id: number | null;
    event_type: string;
    event_date: Date;
    title: string;
    description: string | null;
    location_name: string | null;
    customer_id: number | null;
    performed_by: number;
    performed_by_name: string | null;
    temperature: import("@prisma/client-runtime-utils").Decimal | null;
    source_table: string | null;
    meta_json: string | null;
} | null>;
//# sourceMappingURL=assetActivity.util.d.ts.map