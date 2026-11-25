import { logAssetActivity } from './assetActivity.util';

/**
 * Synchronizes approved Asset Movements with open workshop Asset Maintenance tickets
 * and Cooler 360 activity logs without requiring direct database schema changes.
 *
 * @param {any} dbClient - Prisma client or active transaction client.
 * @param {object} assetMovement - Approved movement record including assets.
 * @param {number} userId - Acting user ID.
 */
export async function syncApprovedMovementWithMaintenance(
  dbClient: any,
  assetMovement: {
    id: number;
    movement_type?: string | null;
    from_direction?: string | null;
    from_customer_id?: number | null;
    from_depot_id?: number | null;
    to_direction?: string | null;
    to_depot_id?: number | null;
    to_customer_id?: number | null;
    asset_movement_assets?: Array<{ asset_id: number }>;
  },
  userId: number
): Promise<void> {
  const assetIds =
    assetMovement.asset_movement_assets?.map(aa => aa.asset_id) || [];
  if (assetIds.length === 0) return;

  const movementCode = `MV-${String(assetMovement.id).padStart(5, '0')}`;
  const movementTypeLower = (assetMovement.movement_type || '').toLowerCase();

  const [toDepot, toCustomer, fromCustomer, fromDepot] = await Promise.all([
    assetMovement.to_depot_id
      ? dbClient.depots.findUnique({
          where: { id: assetMovement.to_depot_id },
          select: { id: true, name: true },
        })
      : Promise.resolve(null),
    assetMovement.to_customer_id
      ? dbClient.customers.findUnique({
          where: { id: assetMovement.to_customer_id },
          select: { id: true, name: true },
        })
      : Promise.resolve(null),
    assetMovement.from_customer_id
      ? dbClient.customers.findUnique({
          where: { id: assetMovement.from_customer_id },
          select: { id: true, name: true },
        })
      : Promise.resolve(null),
    assetMovement.from_depot_id
      ? dbClient.depots.findUnique({
          where: { id: assetMovement.from_depot_id },
          select: { id: true, name: true },
        })
      : Promise.resolve(null),
  ]);

  if (movementTypeLower === 'return') {
    for (const assetId of assetIds) {
      const pendingWorkshopTicket = await dbClient.asset_maintenance.findFirst({
        where: {
          asset_id: assetId,
          repair_location: 'workshop',
          is_active: 'Y',
          status: { in: ['awaiting_return', 'open', 'assigned'] },
        },
        orderBy: { createdate: 'desc' },
      });

      if (pendingWorkshopTicket) {
        const jobNumber =
          pendingWorkshopTicket.job_number ||
          `MT-${String(pendingWorkshopTicket.id).padStart(5, '0')}`;
        const depotName = toDepot?.name || 'Depot';

        await dbClient.asset_maintenance.update({
          where: { id: pendingWorkshopTicket.id },
          data: {
            status: 'at_workshop',
            updatedby: userId,
            updatedate: new Date(),
          },
        });

        await dbClient.asset_master.update({
          where: { id: assetId },
          data: {
            depot_id: assetMovement.to_depot_id || null,
            outlet_id: null,
            current_location: depotName,
            current_status: 'Under repair',
            updatedate: new Date(),
            updatedby: userId,
          },
        });

        await logAssetActivity({
          assetId,
          eventType: 'maintenance',
          title: `Returned to ${depotName} by ${movementCode}`,
          description: 'Asset status: Under repair',
          status: 'at_workshop',
          locationName: depotName,
          customerId: assetMovement.from_customer_id || null,
          depotId: assetMovement.to_depot_id || null,
          performedBy: userId,
          sourceTable: 'asset_maintenance',
          sourceId: pendingWorkshopTicket.id,
          meta: {
            return_movement_id: assetMovement.id,
            return_movement_code: movementCode,
            depot_id: assetMovement.to_depot_id || null,
            depot_name: depotName,
            from_customer_id: assetMovement.from_customer_id || null,
            from_customer_name: fromCustomer?.name || null,
          },
        });

        await logAssetActivity({
          assetId,
          eventType: 'movement',
          title: `Return ${movementCode} to ${depotName}`,
          description: `Returned for workshop job ${jobNumber}`,
          status: 'Under repair',
          locationName: depotName,
          customerId: assetMovement.from_customer_id || null,
          depotId: assetMovement.to_depot_id || null,
          performedBy: userId,
          sourceTable: 'asset_movements',
          sourceId: assetMovement.id,
        });
        continue;
      }

      const standbyActivities = await dbClient.asset_activities.findMany({
        where: {
          source_table: 'asset_maintenance',
          meta_json: { contains: `"standby_asset_id":${assetId}` },
          is_active: 'Y',
        },
        orderBy: { event_date: 'desc' },
        take: 1,
      });

      const linkedStandbyAct = standbyActivities?.[0];
      if (linkedStandbyAct?.source_id) {
        const linkedTicket = await dbClient.asset_maintenance.findUnique({
          where: { id: linkedStandbyAct.source_id },
          select: { id: true, asset_id: true, job_number: true, status: true },
        });

        if (linkedTicket) {
          const depotName = toDepot?.name || 'Depot';
          const fromLabel = fromCustomer?.name || 'Outlet';

          await logAssetActivity({
            assetId: linkedTicket.asset_id,
            eventType: 'maintenance',
            title: `Standby cooler returned to ${depotName} (${movementCode})`,
            description: `Returned from ${fromLabel}`,
            status: linkedTicket.status || 'closed',
            locationName: depotName,
            customerId: assetMovement.from_customer_id || null,
            depotId: assetMovement.to_depot_id || null,
            performedBy: userId,
            sourceTable: 'asset_maintenance',
            sourceId: linkedTicket.id,
            meta: {
              standby_returned: true,
              standby_returned_movement_id: assetMovement.id,
              standby_returned_movement_code: movementCode,
            },
          });

          await logAssetActivity({
            assetId,
            eventType: 'movement',
            title: `Standby return ${movementCode} to ${depotName}`,
            description: `Returned from ${fromLabel} (job ${linkedTicket.job_number || linkedTicket.id})`,
            status: 'Available',
            locationName: depotName,
            customerId: assetMovement.from_customer_id || null,
            depotId: assetMovement.to_depot_id || null,
            performedBy: userId,
            sourceTable: 'asset_movements',
            sourceId: assetMovement.id,
          });
        }
      }
    }
    return;
  }

  if (movementTypeLower === 'installation' && assetMovement.to_customer_id) {
    const destName = toCustomer?.name || 'Outlet';
    const srcName = fromDepot?.name || 'Depot';

    await dbClient.asset_master.updateMany({
      where: { id: { in: assetIds } },
      data: {
        current_location: destName,
        updatedate: new Date(),
        updatedby: userId,
      },
    });

    for (const assetId of assetIds) {
      await logAssetActivity({
        assetId,
        eventType: 'movement',
        title: `Installation ${movementCode}`,
        description: `${srcName} -> ${destName}`,
        status: 'Installed',
        locationName: destName,
        customerId: assetMovement.to_customer_id || null,
        depotId: assetMovement.from_depot_id || null,
        performedBy: userId,
        sourceTable: 'asset_movements',
        sourceId: assetMovement.id,
      });
    }
  }
}
