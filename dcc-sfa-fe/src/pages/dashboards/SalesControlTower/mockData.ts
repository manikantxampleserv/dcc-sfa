// ════════════════════════════════════════════════════════════
// SALES CONTROL TOWER — Mock Data (sourced from SalesControlTower_Dataset.xlsx)
// Sheets: Sales_May_2026, Sales_Apr_2026, Outlet_Master
// ════════════════════════════════════════════════════════════

export interface SalesRow {
  Date: string; // YYYY-MM-DD
  Depot: string;
  Coordinator: string;
  Supervisor: string;
  Route: string;
  Salesman: string;
  OutletCode: string;
  OutletName: string;
  CustomerChannel: string;
  Brand: string;
  Pack: string;
  SKU: string;
  UC: number; // Unit Cases
  PC: number; // Physical Cases
  TV: number; // Transaction Value (TZS)
  IsNew: boolean; // new outlet this month?
  StrikeRate: number; // 0-100 demo
}

export interface OutletRow {
  OutletCode: string;
  OutletName: string;
  CustomerChannel: string;
  Latitude: number;
  Longitude: number;
  OpenDate: string;
  Depot: string;
}

// ─── Dimensions ────────────────────────────────────────────
const DEPOTS = ['Dar es Salaam', 'Arusha', 'Mwanza', 'Dodoma', 'Mbeya'];
const COORDS: Record<string, string[]> = {
  'Dar es Salaam': ['Coord A1', 'Coord A2'],
  Arusha: ['Coord B1'],
  Mwanza: ['Coord C1'],
  Dodoma: ['Coord D1'],
  Mbeya: ['Coord E1'],
};
const SUPS: Record<string, string[]> = {
  'Coord A1': ['Sup A1-1', 'Sup A1-2'],
  'Coord A2': ['Sup A2-1'],
  'Coord B1': ['Sup B1-1'],
  'Coord C1': ['Sup C1-1'],
  'Coord D1': ['Sup D1-1'],
  'Coord E1': ['Sup E1-1'],
};
const ROUTES: Record<string, string[]> = {
  'Sup A1-1': ['Route DAR-01', 'Route DAR-02'],
  'Sup A1-2': ['Route DAR-03'],
  'Sup A2-1': ['Route DAR-04'],
  'Sup B1-1': ['Route ARU-01', 'Route ARU-02'],
  'Sup C1-1': ['Route MWZ-01'],
  'Sup D1-1': ['Route DOD-01'],
  'Sup E1-1': ['Route MBY-01'],
};
const SALESMEN: Record<string, string[]> = {
  'Route DAR-01': ['Salim Juma', 'Ali Hassan'],
  'Route DAR-02': ['John Mwangi'],
  'Route DAR-03': ['Grace Msisya'],
  'Route DAR-04': ["Peter Ndong'a"],
  'Route ARU-01': ['Fred Koske', 'Daniel Mwita'],
  'Route ARU-02': ['Pendo Moshi'],
  'Route MWZ-01': ['Baraka Nyabiosi'],
  'Route DOD-01': ['Charles Mwakalinga'],
  'Route MBY-01': ['Moses Luhanga'],
};
const CHANNELS = ['Wholesale', 'Retail', 'Hotel', 'Kiosk', 'Supermarket'];
const BRANDS = ['Kilimanjaro', 'Safari', 'Ndovu', 'Serengeti', 'Azam'];
const PACKS: Record<string, string[]> = {
  Kilimanjaro: ['500ml Bottle', '1L Bottle', '24x330ml Crate'],
  Safari: ['330ml Can', '500ml Pet', '12x500ml Pack'],
  Ndovu: ['650ml Bottle', '6x1L Pack'],
  Serengeti: ['300ml Bottle', '330ml Can'],
  Azam: ['2L PET', '500ml PET'],
};
const SKUS: Record<string, string[]> = {
  '500ml Bottle': ['KIL-500-BTL'],
  '1L Bottle': ['KIL-1L-BTL'],
  '24x330ml Crate': ['KIL-330-CRT'],
  '330ml Can': ['SAF-330-CAN'],
  '500ml Pet': ['SAF-500-PET'],
  '12x500ml Pack': ['SAF-500-PK12'],
  '650ml Bottle': ['NDV-650-BTL'],
  '6x1L Pack': ['NDV-1L-PK6'],
  '300ml Bottle': ['SER-300-BTL'],
  '2L PET': ['AZM-2L-PET'],
  '500ml PET': ['AZM-500-PET'],
};

function rnd(min: number, max: number) {
  return min + Math.random() * (max - min);
}
function rndInt(min: number, max: number) {
  return Math.floor(rnd(min, max));
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function genDate(year: number, month: number): string {
  const d = rndInt(1, 31);
  const maxD = new Date(year, month, 0).getDate();
  const day = Math.min(d, maxD);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function generateRows(year: number, month: number, count: number): SalesRow[] {
  const rows: SalesRow[] = [];
  for (let i = 0; i < count; i++) {
    const depot = pick(DEPOTS);
    const coord = pick(COORDS[depot]);
    const sup = pick(SUPS[coord]);
    const route = pick(ROUTES[sup]);
    const sal = pick(SALESMEN[route]);
    const brand = pick(BRANDS);
    const pack = pick(PACKS[brand]);
    const sku = SKUS[pack][0];
    const ch = pick(CHANNELS);
    const uc = rndInt(10, 300);
    const pc = Math.floor(uc * rnd(0.55, 0.9));
    const tv = uc * rnd(4500, 9500);
    rows.push({
      Date: genDate(year, month),
      Depot: depot,
      Coordinator: coord,
      Supervisor: sup,
      Route: route,
      Salesman: sal,
      OutletCode: `OUT-${String(i + 1001).padStart(4, '0')}`,
      OutletName: `Outlet ${i + 1}`,
      CustomerChannel: ch,
      Brand: brand,
      Pack: pack,
      SKU: sku,
      UC: uc,
      PC: pc,
      TV: Math.round(tv),
      IsNew: i % 17 === 0,
      StrikeRate: rndInt(55, 100),
    });
  }
  return rows;
}

const _orig = Math.random;
Math.random = (() => {
  let x = 42.137;
  return () => {
    x = Math.sin(x) * 10000;
    return x - Math.floor(x);
  };
})();

export const RAW_MAY: SalesRow[] = generateRows(2026, 5, 1800);
export const RAW_APR: SalesRow[] = generateRows(2026, 4, 1680);

Math.random = _orig; // restore

export const RAW_OUTLETS: OutletRow[] = RAW_MAY.map((r, i) => ({
  OutletCode: r.OutletCode,
  OutletName: r.OutletName,
  CustomerChannel: r.CustomerChannel,
  Latitude: -3.37 + ((i * 0.003) % 2),
  Longitude: 36.68 + ((i * 0.004) % 3),
  OpenDate: r.Date,
  Depot: r.Depot,
}));
