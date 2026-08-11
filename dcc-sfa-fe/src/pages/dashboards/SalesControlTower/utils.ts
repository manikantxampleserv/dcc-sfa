export interface SalesRow {
  Date: string; 
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
  UC: number; 
  PC: number; 
  TV: number; 
  IsNew: boolean; 
  StrikeRate: number; 
}
export interface AggBucket {
  UC: number;
  PC: number;
  TV: number;
  count: number;
  Depot?: string;
  Coordinator?: string;
  Supervisor?: string;
}
export type AggMap = Record<string, AggBucket>;
export interface AggResult {
  byDepot: AggMap;
  byCoord: AggMap;
  bySup: AggMap;
  byRoute: AggMap;
  bySal: AggMap;
  byBrand: AggMap;
  byPack: AggMap;
  byCh: AggMap;
  bySKU: AggMap;
  byDate: AggMap;
  totalUC: number;
  totalPC: number;
  totalTV: number;
  newOutlets: number;
  avgStrike: number;
  rows: SalesRow[];
}
function blank(): AggBucket {
  return { UC: 0, PC: 0, TV: 0, count: 0 };
}
function acc(map: AggMap, key: string, row: SalesRow) {
  if (!map[key]) map[key] = blank();
  map[key].UC += row.UC;
  map[key].PC += row.PC;
  map[key].TV += row.TV;
  map[key].count += 1;
}
export function aggregate(rows: SalesRow[]): AggResult {
  const r: AggResult = {
    byDepot: {},
    byCoord: {},
    bySup: {},
    byRoute: {},
    bySal: {},
    byBrand: {},
    byPack: {},
    byCh: {},
    bySKU: {},
    byDate: {},
    totalUC: 0,
    totalPC: 0,
    totalTV: 0,
    newOutlets: 0,
    avgStrike: 0,
    rows,
  };
  let strikeSum = 0;
  for (const row of rows) {
    acc(r.byDepot, row.Depot, row);
    acc(r.byCoord, row.Coordinator, row);
    acc(r.bySup, row.Supervisor, row);
    acc(r.byRoute, row.Route, row);
    acc(r.bySal, row.Salesman, row);
    acc(r.byBrand, row.Brand, row);
    acc(r.byPack, row.Pack, row);
    acc(r.byCh, row.CustomerChannel, row);
    acc(r.bySKU, row.SKU, row);
    acc(r.byDate, row.Date, row);
    r.totalUC += row.UC;
    r.totalPC += row.PC;
    r.totalTV += row.TV;
    if (row.IsNew) r.newOutlets++;
    strikeSum += row.StrikeRate;
  }
  r.avgStrike = rows.length ? strikeSum / rows.length : 0;
  return r;
}
export type FilterState = {
  depot: string;
  coord: string;
  sup: string;
  route: string;
  sal: string;
  brand: string;
  pack: string;
  ch: string;
  dateMode: 'all' | '7d' | '15d' | 'today';
  startDate?: string;
  endDate?: string;
  cmpMode?: 'apr' | 'spm';
};
export function filterRows(rows: SalesRow[], f: FilterState): SalesRow[] {
  const maxDate = rows.reduce(
    (max, r) => (r.Date > max ? r.Date : max),
    '1970-01-01'
  );
  const now = maxDate ? new Date(maxDate) : new Date();
  return rows.filter(row => {
    if (f.depot && row.Depot !== f.depot) return false;
    if (f.coord && row.Coordinator !== f.coord) return false;
    if (f.sup && row.Supervisor !== f.sup) return false;
    if (f.route && row.Route !== f.route) return false;
    if (f.sal && row.Salesman !== f.sal) return false;
    if (f.brand && row.Brand !== f.brand) return false;
    if (f.pack && row.Pack !== f.pack) return false;
    if (f.ch && row.CustomerChannel !== f.ch) return false;
    if (f.dateMode !== 'all') {
      const d = new Date(row.Date);
      const diff = (now.getTime() - d.getTime()) / 86400000;
      if (f.dateMode === '7d' && diff > 7) return false;
      if (f.dateMode === '15d' && diff > 15) return false;
      if (f.dateMode === 'today' && diff > 1) return false;
    }
    return true;
  });
}
export const FMT = (n: number, d = 1): string => {
  if (!isFinite(n)) return '—';
  const a = Math.abs(n);
  if (a >= 1e9) return (n / 1e9).toFixed(d) + 'B';
  if (a >= 1e6) return (n / 1e6).toFixed(d) + 'M';
  if (a >= 1e3) return (n / 1e3).toFixed(d) + 'K';
  return n.toFixed(d);
};
export const FMTn = (n: number) =>
  new Intl.NumberFormat().format(Math.round(n));
export const pct = (a: number, b: number) =>
  b ? (((a || 0) - (b || 0)) / Math.abs(b)) * 100 : 0;
export const PAL = [
  '#e31837',
  '#1a56db',
  '#059669',
  '#d97706',
  '#7c3aed',
  '#0891b2',
  '#db2777',
  '#ea580c',
  '#16a34a',
  '#dc2626',
  '#2563eb',
  '#9333ea',
];
