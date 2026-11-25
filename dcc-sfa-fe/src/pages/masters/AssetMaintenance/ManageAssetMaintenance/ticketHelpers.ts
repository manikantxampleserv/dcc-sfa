import type { AssetMaintenance, SparePartItem } from 'hooks/useAssetMaintenance';

export interface SpareRow {
  tempId: string;
  name: string;
  quantity: number;
  unit_cost: number;
}

/**
 * Converts API spare part items into editable local table rows.
 *
 * @param {SparePartItem[] | null | undefined} spares Saved spare parts from API.
 * @returns {SpareRow[]} Mapped spare rows.
 */
export const mapApiSparesToRows = (spares?: SparePartItem[] | null): SpareRow[] =>
  (spares || []).map((s, idx) => ({
    tempId: s.id ? `sp_${s.id}` : `sp_row_${idx}`,
    name: s.part_name || s.name || '',
    quantity: s.quantity || 1,
    unit_cost:
      s.unit_cost !== undefined
        ? Number(s.unit_cost)
        : s.cost
          ? Number(s.cost)
          : 0,
  }));

/**
 * Normalizes spare part rows into API payload shape.
 *
 * @param {SpareRow[]} rows Local spare part rows.
 * @returns {Array<{ name: string; quantity: number; unit_cost: number; cost: number }>} Normalized spares.
 */
export const formatSparesPayload = (rows: SpareRow[]) =>
  rows
    .filter(s => s.name?.trim())
    .map(s => {
      const qty = Math.max(1, Number(s.quantity) || 1);
      const unitCost = Math.max(0, Number(s.unit_cost) || 0);
      return {
        name: s.name.trim(),
        quantity: qty,
        unit_cost: unitCost,
        cost: qty * unitCost,
      };
    });

/**
 * Normalizes a maintenance ticket status for both workshop and on-site workflows.
 *
 * @param {AssetMaintenance | null | undefined} ticket Maintenance ticket.
 * @returns {string} Canonical stage key.
 */
export const normalizeTicketStatus = (
  ticket?: AssetMaintenance | null
): string => {
  const isWorkshop =
    (ticket?.repair_location || '').toLowerCase() === 'workshop';
  const rawStatus = (
    ticket?.status || (isWorkshop ? 'awaiting_return' : 'open')
  ).toLowerCase();

  if (isWorkshop && (rawStatus === 'open' || rawStatus === 'assigned')) {
    const master = ticket?.asset_maintenance_master;
    const isUnderRepairAtDepot =
      Boolean(ticket?.workshop_return) ||
      Boolean(
        master &&
          master.outlet_id === null &&
          master.depot_id !== null &&
          master.current_status?.toLowerCase() === 'under repair'
      );
    return isUnderRepairAtDepot ? 'at_workshop' : 'awaiting_return';
  }

  return rawStatus;
};

/**
 * Resolves the ordered workflow stages for a ticket based on source and repair location.
 *
 * @param {AssetMaintenance | null | undefined} ticket Maintenance ticket.
 * @returns {string[]} Ordered stage keys.
 */
export const getTicketStages = (ticket?: AssetMaintenance | null): string[] => {
  const isWorkshop =
    (ticket?.repair_location || '').toLowerCase() === 'workshop';
  const rawStatus = (ticket?.status || '').toLowerCase();
  const isComplaint =
    (ticket?.source_type || '').toLowerCase() === 'complaint' &&
    (rawStatus === 'reported' ||
      Boolean(
        ticket?.activities?.some(
          act => (act.status || '').toLowerCase() === 'reported'
        )
      ));

  if (isComplaint) {
    return [
      'reported',
      'assigned',
      ...(isWorkshop ? ['awaiting_return', 'at_workshop'] : []),
      'repaired',
      'closed',
    ];
  }

  return isWorkshop
    ? ['awaiting_return', 'at_workshop', 'repaired', 'closed']
    : ['open', 'assigned', 'repaired', 'closed'];
};

/**
 * Formats an internal stage key into readable label text.
 *
 * @param {string} stage Stage identifier.
 * @returns {string} Formatted stage label.
 */
export const formatStageLabel = (stage: string): string => {
  const spaced = stage.replace(/_/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

/**
 * Maps a stage identifier to a standard MUI Chip color.
 *
 * @param {string} stage Normalized stage key.
 * @returns {'success' | 'primary' | 'secondary' | 'info' | 'warning' | 'error'} MUI color.
 */
export const getStageChipColor = (
  stage: string
): 'success' | 'primary' | 'secondary' | 'info' | 'warning' | 'error' => {
  switch (stage) {
    case 'closed':
      return 'success';
    case 'repaired':
      return 'primary';
    case 'at_workshop':
      return 'secondary';
    case 'assigned':
      return 'info';
    case 'reported':
      return 'error';
    default:
      return 'warning';
  }
};

/**
 * Resolves original outlet, workshop depot, and depot custody status for a ticket.
 *
 * @param {AssetMaintenance | null | undefined} ticket Maintenance ticket.
 * @param {string} currentStatus Normalized status key.
 * @returns Location metadata used across list table and detail drawer.
 */
export const resolveTicketLocations = (
  ticket?: AssetMaintenance | null,
  currentStatus?: string
) => {
  const isWorkshop =
    (ticket?.repair_location || '').toLowerCase() === 'workshop';
  const workshopReturnInfo = ticket?.workshop_return || null;
  const master = ticket?.asset_maintenance_master;

  const activeCoolerCustomer = master?.cooler_asset_master?.find(
    c => c.status !== 'Removed' && c.coolers_customers
  )?.coolers_customers;

  const linkedOutlet =
    ticket?.customer ||
    master?.asset_master_outlet ||
    activeCoolerCustomer ||
    master?.customer_assets?.[0]?.customer_customer_assets ||
    null;

  const originalOutlet =
    linkedOutlet ||
    (workshopReturnInfo?.from_customer_id ||
    workshopReturnInfo?.from_customer_name
      ? {
          id: workshopReturnInfo.from_customer_id || 0,
          name: workshopReturnInfo.from_customer_name || 'Outlet',
          code: null,
          depot_id: workshopReturnInfo.depot_id || null,
          customer_depot: workshopReturnInfo.depot_name
            ? {
                id: workshopReturnInfo.depot_id || 0,
                name: workshopReturnInfo.depot_name,
              }
            : null,
        }
      : null);

  const workshopDepot =
    master?.asset_master_depot ||
    originalOutlet?.customer_depot ||
    (workshopReturnInfo?.depot_name
      ? {
          id: workshopReturnInfo.depot_id || 0,
          name: workshopReturnInfo.depot_name,
        }
      : null);

  const effectiveStatus = currentStatus || normalizeTicketStatus(ticket);
  const isAtDepot =
    isWorkshop &&
    effectiveStatus !== 'awaiting_return' &&
    !master?.outlet_id &&
    Boolean(workshopDepot?.name || master?.current_location);

  return {
    isWorkshop,
    workshopReturnInfo,
    originalOutlet,
    workshopDepot,
    isAtDepot,
  };
};

/**
 * Formats display title for a cooler / asset master record.
 *
 * @param {AssetMaintenance['asset_maintenance_master']} master Linked asset master.
 * @returns {string} Cooler display title.
 */
export const formatCoolerTitle = (
  master?: AssetMaintenance['asset_maintenance_master']
): string => {
  const brand = master?.asset_master_brands?.name || master?.brand || undefined;
  const serial = master?.serial_number || undefined;
  const subType =
    master?.asset_master_asset_sub_types?.name ||
    master?.asset_master_asset_types?.name ||
    undefined;
  const parts = [brand, serial, subType].filter(Boolean);
  return parts.length > 0
    ? parts.join(' - ')
    : master?.name || master?.asset_code || master?.serial_number || 'Cooler';
};
