/**
 * Synchronizes approved Asset Movements with open workshop Asset Maintenance tickets
 * and Cooler 360 activity logs without requiring direct database schema changes.
 *
 * @param {any} dbClient - Prisma client or active transaction client.
 * @param {object} assetMovement - Approved movement record including assets.
 * @param {number} userId - Acting user ID.
 */
export declare function syncApprovedMovementWithMaintenance(dbClient: any, assetMovement: {
    id: number;
    movement_type?: string | null;
    from_direction?: string | null;
    from_customer_id?: number | null;
    from_depot_id?: number | null;
    to_direction?: string | null;
    to_depot_id?: number | null;
    to_customer_id?: number | null;
    asset_movement_assets?: Array<{
        asset_id: number;
    }>;
}, userId: number): Promise<void>;
//# sourceMappingURL=maintenanceMovementSync.util.d.ts.map