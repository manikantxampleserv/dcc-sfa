import axiosInstance from 'configs/axio.config';

export interface Cooler360Photo {
  id: number;
  url: string;
  caption?: string;
  uploadedAt?: string | null;
}

export interface Cooler360Asset {
  id: number;
  name: string;
  title: string;
  code: string;
  serialNumber: string;
  barcode: string;
  nfcTag: string;
  subType: string;
  capacity: string;
  energyRating: string;
  purchaseDate: string;
  warrantyExpiry: string;
  homeDepot: string;
  lastScanned: string;
  lastScannedBy: string;
  brand: string;
  status: string;
  isActive: boolean;
  cost?: number | null;
  photos?: Cooler360Photo[];
}

export interface Cooler360HealthMetric {
  value: string | number;
  sub: string;
  status: 'good' | 'warn' | 'alert' | 'neu';
  ticketId?: number;
}

export interface Cooler360Health {
  lastVerified: Cooler360HealthMetric;
  lastInspection: Cooler360HealthMetric;
  openTicket: Cooler360HealthMetric;
  repairs: Cooler360HealthMetric;
  lifetimeCost: Cooler360HealthMetric;
  daysHere: Cooler360HealthMetric;
}

export interface Cooler360Placement {
  outletName: string;
  outletCode: string;
  channel: string;
  route: string;
  zone: string;
  depot: string;
  salesRep: string;
  installedDate: string;
  isDeployed: boolean;
}

export interface Cooler360OpenTicket {
  id: number;
  jobNumber: string;
  issueReported: string;
  reportedDate: string;
  status: string;
  repairLocation: string;
  priority: string;
  technicianName: string;
  dueDate: string;
  sparesCount: number;
  costSoFar: number;
}

export interface Cooler360Activity {
  id: number;
  type: 'mov' | 'ver' | 'ins' | 'mnt';
  date: string;
  title: string;
  badge?: {
    text: string;
    tone: 'good' | 'warn' | 'alert' | 'neu';
  };
  desc?: string;
  by?: string;
  spares?: Array<{
    name: string;
    qty: number;
    cost: number;
  }>;
  totalCost?: number;
  subLifecycle?: string;
}

export interface Cooler360DataCheck {
  type: 'warn' | 'ok' | 'alert';
  title: string;
  detail: string;
}

export interface Cooler360Payload {
  asset: Cooler360Asset;
  photos?: Cooler360Photo[];
  health: Cooler360Health;
  placement: Cooler360Placement;
  openTicket: Cooler360OpenTicket | null;
  counts: {
    all: number;
    mov: number;
    ver: number;
    ins: number;
    mnt: number;
  };
  activities: Cooler360Activity[];
  dataChecks: Cooler360DataCheck[];
}

/**
 * Fetches unified Cooler 360 view payload by identifier (barcode, serial number, code, id).
 *
 * @param {string} identifier Asset identifier.
 * @returns {Promise<Cooler360Payload>} Complete Cooler 360 data.
 */
export const fetchCooler360Data = async (
  identifier?: string
): Promise<Cooler360Payload> => {
  try {
    const url = identifier && identifier.trim().length > 0
      ? `/cooler-360/${encodeURIComponent(identifier.trim())}`
      : '/cooler-360';
    const response = await axiosInstance.get(url);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching Cooler 360 data:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch Cooler 360 details'
    );
  }
};

