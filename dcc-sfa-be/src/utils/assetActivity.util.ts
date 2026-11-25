import prisma from '../configs/prisma.client';

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
export async function logAssetActivity(payload: LogAssetActivityPayload) {
  try {
    let userName = payload.performedByName;
    if (!userName && payload.performedBy) {
      const u = await prisma.users.findUnique({
        where: { id: payload.performedBy },
        select: { name: true, user_role: { select: { name: true } } },
      });
      if (u) {
        userName = u.user_role?.name
          ? `${u.name} · ${u.user_role.name}`
          : u.name;
      }
    }

    const activity = await prisma.asset_activities.create({
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
        cost:
          payload.cost !== undefined && payload.cost !== null
            ? payload.cost
            : null,
        temperature:
          payload.temperature !== undefined && payload.temperature !== null
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
  } catch (error: any) {
    console.error('Error logging asset activity:', error?.message || error);
    return null;
  }
}
