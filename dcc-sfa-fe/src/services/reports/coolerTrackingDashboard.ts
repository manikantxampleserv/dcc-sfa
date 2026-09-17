/**
 * Cooler Tracking Dashboard Service
 *
 * Fetches the full aggregated dataset for the AssetReport dashboard.
 * The response shape mirrors the legacy mockData.json so the component
 * can swap the import for this service with zero logic changes.
 */

import axiosInstance from 'configs/axio.config';

/** Segment of an install/scan trend timeline */
export interface TrendPoint {
  date: string;
  count: number;
}

/** Metadata for the outlet scanning compliance view */
export interface OutletMeta {
  reportDate: string;
  total: number;
  zones: string[];
  routes: string[];
  supervisors: string[];
  depots: string[];
  categories: string[];
  custTypes: string[];
  channels: string[];
  brands: string[];
  staleCount: number;
  installTrend: TrendPoint[];
  scanTrend: TrendPoint[];
  supervisorZones: Record<string, string[]>;
  zoneRoutes: Record<string, string[]>;
}

/** A single outlet-cooler record */
export interface OutletRecord {
  zone: string;
  route: string;
  supervisor: string;
  depot: string;
  category: string;
  custType: string;
  channel: string | null;
  code: string;
  outlet: string;
  barcode: string;
  serial: string;
  brand: string;
  subtype: string;
  status: string;
  lastScan: string | null;
  lastScanDate: string | null;
  days: number | null;
  bucket: string;
  danger: boolean;
  lost: boolean;
  stale: boolean;
  installDate: string | null;
  daysSinceInstall: number | null;
  installDelayBucket: string | null;
}

/** Metadata for the outlet master (coverage view) */
export interface MasterMeta {
  depots: string[];
  zones: string[];
  zoneRoutes: Record<string, string[]>;
}

/** A single outlet master record */
export interface MasterRecord {
  code: string;
  name?: string;
  depot: string;
  zone: string;
  route: string;
  category: string;
  custType: string;
  channel: string | null;
}

/** Metadata for the depot stock view */
export interface DepotMeta {
  total: number;
  zones: string[];
  brands: string[];
}

/** A single depot stock record */
export interface DepotRecord {
  zone: string;
  barcode: string;
  serial: string;
  brand: string;
  subtype: string;
  verifiedDate: string | null;
  verifyBucket: string;
}

/** Full dashboard payload — mirrors mockData.json shape */
export interface CoolerTrackingDashboardData {
  outletMeta: OutletMeta;
  outletRecords: OutletRecord[];
  denomMeta: unknown;
  masterMeta: MasterMeta;
  masterRecords: MasterRecord[];
  depotMeta: DepotMeta;
  depotRecords: DepotRecord[];
}

/** In-flight promise to deduplicate simultaneous requests */
let inFlightDashboardPromise: Promise<CoolerTrackingDashboardData> | null =
  null;

/**
 * @function fetchCoolerTrackingDashboard
 * Fetches all data required by the Cooler Tracking Dashboard in a single call.
 * Deduplicates simultaneous in-flight requests so multiple mounts (such as React StrictMode)
 * do not trigger duplicate network calls.
 *
 * @param force - If true, bypasses the in-flight deduplication and issues a new request.
 * @returns Promise resolving to the dashboard dataset.
 */
export const fetchCoolerTrackingDashboard = (
  force = false
): Promise<CoolerTrackingDashboardData> => {
  if (!force && inFlightDashboardPromise) {
    return inFlightDashboardPromise;
  }

  inFlightDashboardPromise = axiosInstance
    .get('/reports/cooler-tracking-dashboard')
    .then(response => response.data.data as CoolerTrackingDashboardData)
    .finally(() => {
      inFlightDashboardPromise = null;
    });

  return inFlightDashboardPromise;
};
