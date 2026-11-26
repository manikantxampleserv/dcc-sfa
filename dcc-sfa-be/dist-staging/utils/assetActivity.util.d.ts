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
 * @param {any} [dbClient=prisma] - Optional database client or transaction client.
 * @returns {Promise<any>} The created asset activity record.
 */
export declare function logAssetActivity(payload: LogAssetActivityPayload, dbClient?: any): Promise<any>;
//# sourceMappingURL=assetActivity.util.d.ts.map