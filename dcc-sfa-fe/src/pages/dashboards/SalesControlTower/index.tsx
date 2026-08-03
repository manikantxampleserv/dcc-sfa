import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import { Fullscreen, FullscreenExit, Refresh } from '@mui/icons-material';
import { IconButton, Tooltip as MuiTooltip } from '@mui/material';
import { useSalesControlTower } from '../../../hooks/useSalesControlTower';
import type { SalesRow } from './utils';
import { FMT, FMTn, pct, PAL } from './utils';
import type { AggMap, FilterState, AggResult } from './utils';
import EntityModal from './EntityModal';
import { DashboardSkeleton } from './DashboardSkeleton';
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);
const C = {
  red: '#e31837',
  redL: '#fdeaed',
  green: '#059669',
  greenL: '#ecfdf5',
  blue: '#1a56db',
  blueL: '#eff6ff',
  amber: '#d97706',
  amberL: '#fffbeb',
  purple: '#7c3aed',
  purpleL: '#f5f3ff',
  cyan: '#0891b2',
  cyanL: '#ecfeff',
  bg: '#f0f2f7',
  surface: '#ffffff',
  s2: '#f8f9fc',
  s3: '#eef1f7',
  border: '#e2e7f0',
  bord2: '#cdd5e4',
  text: '#0f172a',
  t2: '#374151',
  muted: '#6b7280',
  m2: '#9ca3af',
};
type DateMode = 'all' | '7d' | '15d' | 'today';
type CmpMode = 'apr' | 'spm';
type Role = 'MD' | 'HSM';
type KpiKey = 'UC' | 'PC' | 'TV' | 'growth' | 'target' | 'new';
type DrillDim =
  | 'Depot'
  | 'Coordinator'
  | 'Supervisor'
  | 'Route'
  | 'Salesman'
  | 'Brand'
  | 'Pack';
const DIMENSIONS: DrillDim[] = [
  'Depot',
  'Coordinator',
  'Supervisor',
  'Route',
  'Salesman',
  'Brand',
  'Pack',
];
const DIM_NEXT: Record<string, DrillDim | null> = {
  Depot: 'Coordinator',
  Coordinator: 'Supervisor',
  Supervisor: 'Route',
  Route: 'Salesman',
  Salesman: null,
  Brand: 'Pack',
  Pack: null,
};
const DIM_FIELD: Record<DrillDim, keyof SalesRow> = {
  Depot: 'Depot',
  Coordinator: 'Coordinator',
  Supervisor: 'Supervisor',
  Route: 'Route',
  Salesman: 'Salesman',
  Brand: 'Brand',
  Pack: 'Pack',
};
const FILTER_KEYS: Record<DrillDim, keyof FilterState> = {
  Depot: 'depot',
  Coordinator: 'coord',
  Supervisor: 'sup',
  Route: 'route',
  Salesman: 'sal',
  Brand: 'brand',
  Pack: 'pack',
};
const DEMO_TARGETS: Record<string, number> = { UC: 420000, TV: 3_500_000_000 };
function uniq(arr: string[]) {
  return [...new Set(arr.filter(Boolean))].sort();
}
function topN(map: AggMap, key: 'UC' | 'PC' | 'TV', n: number) {
  return Object.entries(map)
    .sort((a, b) => (b[1][key] || 0) - (a[1][key] || 0))
    .slice(0, n);
}
interface KpiCardProps {
  label: string;
  icon: string;
  value: string;
  growth?: number;
  color: string;
  bg: string;
  selected?: boolean;
  onClick?: () => void;
  demo?: boolean;
  sparkData?: number[];
}
const KpiCard: React.FC<KpiCardProps> = ({
  label,
  icon,
  value,
  growth,
  color,
  bg,
  selected,
  onClick,
  demo,
  sparkData = [],
}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }
    if (!sparkData.length) return;
    chartRef.current = new ChartJS(ref.current, {
      type: 'line',
      data: {
        labels: sparkData.map((_, i) => i),
        datasets: [
          {
            data: sparkData,
            borderColor: color,
            borderWidth: 1.5,
            fill: true,
            backgroundColor: color + '22',
            pointRadius: 0,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: { x: { display: false }, y: { display: false } },
        animation: false,
      },
    });
    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [sparkData, color]);
  const up = growth !== undefined && growth >= 0;
  return (
    <div
      onClick={onClick}
      style={{
        background: C.surface,
        border: `1px solid ${selected ? color : C.border}`,
        borderRadius: 10,
        padding: '14px 15px',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: selected
          ? `0 0 0 2px ${color}33`
          : '0 1px 3px rgba(0,0,0,.07)',
        transition: 'all .18s',
        flex: 1,
      }}
    >
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          background: color,
          opacity: selected ? 1 : 0,
          transition: 'opacity .2s',
        }}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 6,
        }}
      >
        <div
          style={{
            fontSize: 10,
            color: C.muted,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 0.55,
          }}
        >
          {label}
          {demo && (
            <span
              style={{
                fontSize: 8,
                color: C.amber,
                background: C.amberL,
                border: `1px solid ${C.amber}44`,
                padding: '1px 4px',
                borderRadius: 3,
                marginLeft: 4,
                fontWeight: 700,
              }}
            >
              DEMO
            </span>
          )}
        </div>
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 6,
            background: bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
          }}
        >
          {icon}
        </div>
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: -0.5,
          color,
          lineHeight: 1,
          marginBottom: 6,
        }}
      >
        {value}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 4,
        }}
      >
        {growth !== undefined && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: up ? C.green : C.red,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            {up ? '▲' : '▼'} {Math.abs(growth).toFixed(1)}%
            <span
              style={{
                fontSize: 10,
                fontWeight: 400,
                color: C.m2,
                marginLeft: 2,
              }}
            >
              vs prev
            </span>
          </span>
        )}
        <canvas ref={ref} width={68} height={24} style={{ flexShrink: 0 }} />
      </div>
    </div>
  );
};
const RankList: React.FC<{
  entries: [string, number][];
  max: number;
  onRowClick?: (v: string) => void;
}> = ({ entries, max, onRowClick }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 5,
      maxHeight: 240,
      overflowY: 'auto',
    }}
  >
    {entries.map(([name, val], i) => {
      const w = max ? (val / max) * 100 : 0;
      const medals = ['🥇', '🥈', '🥉'];
      return (
        <div
          key={name}
          onClick={() => onRowClick?.(name)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '7px 9px',
            borderRadius: 7,
            background: C.s3,
            border: `1px solid ${C.border}`,
            cursor: 'pointer',
            transition: 'all .18s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = C.red;
            (e.currentTarget as HTMLElement).style.background = C.redL;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = C.border;
            (e.currentTarget as HTMLElement).style.background = C.s3;
          }}
        >
          <span
            style={{
              fontSize: 10,
              color: C.m2,
              fontWeight: 700,
              width: 14,
              textAlign: 'center',
              flexShrink: 0,
            }}
          >
            {i < 3 ? medals[i] : i + 1}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {name}
            </div>
          </div>
          <div style={{ width: 58, flexShrink: 0 }}>
            <div style={{ height: 3, background: C.bord2, borderRadius: 2 }}>
              <div
                style={{
                  height: '100%',
                  borderRadius: 2,
                  background: C.red,
                  width: `${w}%`,
                  transition: 'width .5s',
                }}
              />
            </div>
          </div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              width: 52,
              textAlign: 'right',
              flexShrink: 0,
              color: C.text,
            }}
          >
            {FMT(val)}
          </span>
        </div>
      );
    })}
  </div>
);
interface TmNode {
  name: string;
  value: number;
  color: string;
}
const Treemap: React.FC<{
  nodes: TmNode[];
  onDrill?: (name: string) => void;
}> = ({ nodes, onDrill }) => {
  const total = nodes.reduce((s, n) => s + n.value, 0);
  if (!total)
    return (
      <div
        style={{
          height: 190,
          background: C.s3,
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: C.muted,
          fontSize: 12,
        }}
      >
        No data
      </div>
    );
  const sorted = [...nodes].sort((a, b) => b.value - a.value);
  const boxes: { node: TmNode; x: number; y: number; w: number; h: number }[] =
    [];
  let x = 0,
    y = 0,
    W = 100,
    H = 100;
  let remaining = total;
  let remaining_nodes = [...sorted];
  while (remaining_nodes.length > 0) {
    const n = remaining_nodes.shift()!;
    const frac = n.value / remaining;
    if (W >= H) {
      const w = frac * W;
      boxes.push({ node: n, x, y, w, h: H });
      x += w;
      W -= w;
    } else {
      const h = frac * H;
      boxes.push({ node: n, x, y, w: W, h });
      y += h;
      H -= h;
    }
    remaining -= n.value;
  }
  return (
    <div
      style={{
        position: 'relative',
        height: 190,
        borderRadius: 6,
        overflow: 'hidden',
        background: C.s3,
      }}
    >
      {boxes.map(({ node, x: bx, y: by, w: bw, h: bh }) => (
        <div
          key={node.name}
          onClick={() => onDrill?.(node.name)}
          title={`${node.name}: ${FMT(node.value)}`}
          style={{
            position: 'absolute',
            left: `${bx}%`,
            top: `${by}%`,
            width: `${bw}%`,
            height: `${bh}%`,
            background: node.color,
            border: '2px solid rgba(255,255,255,.4)',
            borderRadius: 4,
            cursor: 'pointer',
            overflow: 'hidden',
            padding: '5px 7px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            transition: 'opacity .15s',
          }}
          onMouseEnter={e =>
            ((e.currentTarget as HTMLElement).style.opacity = '.83')
          }
          onMouseLeave={e =>
            ((e.currentTarget as HTMLElement).style.opacity = '1')
          }
        >
          {bw > 8 && bh > 8 && (
            <>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#fff',
                  textShadow: '0 1px 3px rgba(0,0,0,.5)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {node.name}
              </div>
              <div
                style={{
                  fontSize: 9.5,
                  color: 'rgba(255,255,255,.85)',
                  textShadow: '0 1px 2px rgba(0,0,0,.4)',
                  marginTop: 1,
                }}
              >
                {FMT(node.value)} UC
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};
interface TableProps {
  cols: { key: string; label: string; numeric?: boolean }[];
  rows: Record<string, string | number>[];
  onRowClick?: (row: Record<string, string | number>) => void;
}
const DataTable: React.FC<TableProps> = ({ cols, rows, onRowClick }) => {
  const [sortCol, setSortCol] = useState(cols[2]?.key || cols[0].key);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const PAGE = 15;
  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return rows.filter(r =>
      cols.some(c =>
        String(r[c.key] ?? '')
          .toLowerCase()
          .includes(s)
      )
    );
  }, [rows, search, cols]);
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortCol],
        bv = b[sortCol];
      const dir = sortDir === 'desc' ? -1 : 1;
      if (typeof av === 'number' && typeof bv === 'number')
        return dir * (bv - av);
      return dir * String(bv ?? '').localeCompare(String(av ?? ''));
    });
  }, [filtered, sortCol, sortDir]);
  const pageRows = sorted.slice(page * PAGE, page * PAGE + PAGE);
  const totalPages = Math.ceil(sorted.length / PAGE);
  const handleSort = (key: string) => {
    if (sortCol === key) setSortDir(d => (d === 'desc' ? 'asc' : 'desc'));
    else {
      setSortCol(key);
      setSortDir('desc');
    }
    setPage(0);
  };
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        <input
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setPage(0);
          }}
          placeholder="Search…"
          style={{
            padding: '5px 10px',
            border: `1px solid ${C.bord2}`,
            borderRadius: 5,
            fontSize: 11.5,
            outline: 'none',
            width: 200,
            fontFamily: 'inherit',
            color: C.text,
            background: C.surface,
          }}
        />
      </div>
      <div
        style={{
          overflowX: 'auto',
          overflowY: 'auto',
          maxHeight: 370,
          borderRadius: 6,
          border: `1px solid ${C.border}`,
        }}
      >
        <table
          style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}
        >
          <thead>
            <tr>
              {cols.map(c => (
                <th
                  key={c.key}
                  onClick={() => handleSort(c.key)}
                  style={{
                    fontSize: 10,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    color: C.muted,
                    fontWeight: 700,
                    padding: '8px 10px',
                    borderBottom: `2px solid ${C.border}`,
                    textAlign: c.numeric ? 'right' : 'left',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    background: C.s2,
                    position: 'sticky',
                    top: 0,
                    zIndex: 5,
                    userSelect: 'none',
                  }}
                >
                  {c.label}
                  {sortCol === c.key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, i) => (
              <tr
                key={i}
                onClick={() => onRowClick?.(row)}
                style={{
                  cursor: onRowClick ? 'pointer' : 'default',
                  transition: 'background .1s',
                }}
                onMouseEnter={e =>
                  ((e.currentTarget as HTMLElement).style.background = C.redL)
                }
                onMouseLeave={e =>
                  ((e.currentTarget as HTMLElement).style.background = '')
                }
              >
                {cols.map(c => {
                  const val = row[c.key];
                  return (
                    <td
                      key={c.key}
                      style={{
                        padding: '8px 10px',
                        borderBottom: `1px solid ${C.border}`,
                        textAlign: c.numeric ? 'right' : 'left',
                        whiteSpace: 'nowrap',
                        fontWeight: c.numeric ? 600 : 400,
                        fontVariantNumeric: c.numeric
                          ? 'tabular-nums'
                          : undefined,
                      }}
                    >
                      {typeof val === 'number' ? FMTn(val) : val}
                    </td>
                  );
                })}
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr>
                <td
                  colSpan={cols.length}
                  style={{ textAlign: 'center', padding: 20, color: C.muted }}
                >
                  No data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 10,
        }}
      >
        <span style={{ fontSize: 11, color: C.muted }}>
          {sorted.length === 0
            ? 'No results'
            : `${page * PAGE + 1}–${Math.min((page + 1) * PAGE, sorted.length)} of ${sorted.length}`}
        </span>
        <div style={{ display: 'flex', gap: 5 }}>
          {['← Prev', 'Next →'].map((lbl, idx) => (
            <button
              key={lbl}
              disabled={idx === 0 ? page === 0 : page >= totalPages - 1}
              onClick={() => setPage(p => p + (idx === 0 ? -1 : 1))}
              style={{
                padding: '4px 10px',
                borderRadius: 5,
                border: `1px solid ${C.bord2}`,
                background: C.s3,
                color: C.muted,
                fontSize: 11.5,
                cursor: 'pointer',
                fontFamily: 'inherit',
                opacity: (idx === 0 ? page === 0 : page >= totalPages - 1)
                  ? 0.35
                  : 1,
              }}
            >
              {lbl}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
const SH: React.FC<{ label: string }> = ({ label }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      margin: '14px 0 9px',
    }}
  >
    <div style={{ flex: 1, height: 1, background: C.border }} />
    <div
      style={{
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: 0.9,
        color: C.muted,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </div>
    <div style={{ flex: 1, height: 1, background: C.border }} />
  </div>
);
const Card: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <div
    style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 10,
      padding: 15,
      boxShadow: '0 1px 3px rgba(0,0,0,.07)',
      transition: 'box-shadow .2s, border-color .2s',
      ...style,
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLElement).style.boxShadow =
        '0 4px 16px rgba(0,0,0,.09)';
      (e.currentTarget as HTMLElement).style.borderColor = C.bord2;
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLElement).style.boxShadow =
        '0 1px 3px rgba(0,0,0,.07)';
      (e.currentTarget as HTMLElement).style.borderColor = C.border;
    }}
  >
    {children}
  </div>
);
/**
 * Main dashboard component for the Sales Control.
 * Handles data fetching, filtering, and layout of all KPI cards and charts.
 */
const SalesControlTower: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>({
    depot: '',
    coord: '',
    sup: '',
    route: '',
    sal: '',
    brand: '',
    pack: '',
    ch: '',
    dateMode: 'all',
  });
  const {
    data: apiData,
    isLoading: loading,
    error,
    refetch,
    isFetching,
  } = useSalesControlTower(filters);
  const RAW_MAY: any[] = apiData?.data?.mayAgg?.rows || [];
  const RAW_APR: any[] = apiData?.data?.aprAgg?.rows || [];
  const [isFullscreen, setIsFullscreen] = useState(false);
  useEffect(() => {
    if (isFullscreen) {
      document.body.classList.add('ai-fullscreen-active');
    } else {
      document.body.classList.remove('ai-fullscreen-active');
    }
    return () => {
      document.body.classList.remove('ai-fullscreen-active');
    };
  }, [isFullscreen]);
  const [role, setRole] = useState<Role>('MD');
  const [dateMode, setDateMode] = useState<DateMode>('all');
  useEffect(() => {
    const now = new Date();
    let startDate = '';
    let endDate = '';
    const getLocalISODate = (d: Date) => {
      const offset = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - offset).toISOString().split('T')[0];
    };
    if (dateMode === 'all') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      startDate = getLocalISODate(firstDay);
      endDate = getLocalISODate(lastDay);
    } else if (dateMode === '7d') {
      const start = new Date(now);
      start.setDate(now.getDate() - 7);
      startDate = getLocalISODate(start);
      endDate = getLocalISODate(now);
    } else if (dateMode === '15d') {
      const start = new Date(now);
      start.setDate(now.getDate() - 15);
      startDate = getLocalISODate(start);
      endDate = getLocalISODate(now);
    } else if (dateMode === 'today') {
      startDate = getLocalISODate(now);
      endDate = getLocalISODate(now);
    }
    setFilters(f => ({ ...f, startDate, endDate }));
  }, [dateMode]);
  const [cmpMode, setCmpMode] = useState<CmpMode>('apr');
  const [kpiSel, setKpiSel] = useState<KpiKey | null>(null);
  const [tmStack, setTmStack] = useState<string[]>([]);
  const [modalEntity, setModalEntity] = useState<{
    dim: string;
    name: string;
  } | null>(null);
  const [rkDim, setRkDim] = useState<DrillDim>('Depot');
  const [drillDim, setDrillDim] = useState<DrillDim>('Depot');
  const [drillStack, setDrillStack] = useState<
    { dim: DrillDim; val: string }[]
  >([]);
  const [trendMetric, setTrendMetric] = useState<'UC' | 'TV' | 'PC'>('UC');
  const [chMetric, setChMetric] = useState<'TV' | 'UC'>('TV');
  const [execActive, setExecActive] = useState<number | null>(null);
  const mayAgg = useMemo<AggResult>(() => {
    const fallback: AggResult = {
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
      rows: [],
    };
    return { ...fallback, ...(apiData?.data?.mayAgg || {}) };
  }, [apiData]);
  const filterData = apiData?.data?.filters || {};
  const depots = useMemo(
    () => (filterData.depots || []).map((f: any) => f.name).filter(Boolean),
    [filterData]
  );
  const coords = useMemo(
    () => (filterData.depots || []).map((f: any) => f.name).filter(Boolean),
    [filterData]
  ); 
  const sups = useMemo(
    () => (filterData.depots || []).map((f: any) => f.name).filter(Boolean),
    [filterData]
  ); 
  const routes = useMemo(
    () => (filterData.routes || []).map((f: any) => f.name).filter(Boolean),
    [filterData]
  );
  const salesmen = useMemo(
    () =>
      (filterData.salespersons || []).map((f: any) => f.name).filter(Boolean),
    [filterData]
  );
  const brands = useMemo(
    () => (filterData.brands || []).map((f: any) => f.name).filter(Boolean),
    [filterData]
  );
  const packs = useMemo(
    () => (filterData.packs || []).map((f: any) => f.name).filter(Boolean),
    [filterData]
  );
  const channels = useMemo(
    () => (filterData.channels || []).map((f: any) => f.name).filter(Boolean),
    [filterData]
  );
  const mayRows = RAW_MAY;
  const aprRows = RAW_APR;
  const aprAgg = useMemo<AggResult>(() => {
    const fallback: AggResult = {
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
      rows: [],
    };
    return { ...fallback, ...(apiData?.data?.aprAgg || {}) };
  }, [apiData]);
  const growth = pct(mayAgg.totalUC, aprAgg.totalUC);
  const targetPct = DEMO_TARGETS.UC
    ? (mayAgg.totalUC / DEMO_TARGETS.UC) * 100
    : 0;
  const sparkDates = useMemo(() => {
    const dates = uniq(Object.keys(mayAgg.byDate)).sort();
    return dates.map(d => mayAgg.byDate[d]?.UC || 0);
  }, [mayAgg]);
  const trendData = useMemo(() => {
    const dates = uniq(Object.keys(mayAgg.byDate)).sort().slice(-20);
    const curData = dates.map(d => mayAgg.byDate[d]?.[trendMetric] || 0);
    const aprDates = uniq(Object.keys(aprAgg.byDate)).sort().slice(-20);
    const cmpData = aprDates.map(d => aprAgg.byDate[d]?.[trendMetric] || 0);
    return { labels: dates.map(d => d.slice(5)), curData, cmpData };
  }, [mayAgg, aprAgg, trendMetric]);
  const rankMap: Record<DrillDim, keyof typeof mayAgg> = {
    Depot: 'byDepot',
    Coordinator: 'byCoord',
    Supervisor: 'bySup',
    Route: 'byRoute',
    Salesman: 'bySal',
    Brand: 'byBrand',
    Pack: 'byPack',
  };
  const rankEntries = useMemo(() => {
    const map = mayAgg[rankMap[rkDim]] as AggMap;
    return topN(map, 'UC', 10).map(([k, v]) => [k, v.UC] as [string, number]);
  }, [mayAgg, rkDim]);
  const rankMax = rankEntries[0]?.[1] ?? 1;
  const tmNodes = useMemo(() => {
    let map;
    let filtered;
    if (tmStack.length === 0) {
      map = mayAgg.byBrand;
      filtered = map;
    } else if (tmStack.length === 1) {
      map = mayAgg.byPack;
      filtered = Object.fromEntries(
        Object.entries(map).filter(([k]) =>
          mayRows.some(r => r.Pack === k && r.Brand === tmStack[0])
        )
      );
    } else {
      map = mayAgg.bySKU;
      filtered = Object.fromEntries(
        Object.entries(map).filter(([k]) =>
          mayRows.some(
            r => r.SKU === k && r.Pack === tmStack[1] && r.Brand === tmStack[0]
          )
        )
      );
    }
    return Object.entries(filtered)
      .sort((a, b) => (b[1] as any).UC - (a[1] as any).UC)
      .map(([name, v], i) => ({
        name,
        value: (v as any).UC,
        color: PAL[i % PAL.length],
      }));
  }, [mayAgg, tmStack, mayRows]);
  const chEntries = useMemo(
    () => topN(mayAgg.byCh, chMetric === 'TV' ? 'TV' : 'UC', 8),
    [mayAgg, chMetric]
  );
  const chTotal = chEntries.reduce(
    (s, [, v]) => s + (chMetric === 'TV' ? (v as any).TV : (v as any).UC),
    0
  );
  const packEntries = useMemo(() => topN(mayAgg.byPack, 'UC', 10), [mayAgg]);
  const packMax = packEntries[0]?.[1]?.UC ?? 1;
  const excCards = useMemo(() => {
    const zeroRoutes = Object.entries(mayAgg.byRoute).filter(
      ([, v]) => v.UC === 0
    ).length;
    const totalRoutes = Object.keys(mayAgg.byRoute).length;
    const topSal = topN(mayAgg.bySal, 'UC', 1)[0];
    const topBrand = topN(mayAgg.byBrand, 'TV', 1)[0];
    return [
      {
        color: 'red',
        icon: '🛑',
        label: 'Zero-Sale Routes',
        val: `${zeroRoutes}/${totalRoutes}`,
        sub: `${Math.round((zeroRoutes / Math.max(totalRoutes, 1)) * 100)}% inactive`,
        cls: 'dn' as const,
      },
      {
        color: 'green',
        icon: '🏆',
        label: 'Top Salesman',
        val: topSal?.[0] ?? '—',
        sub: `${FMT(topSal?.[1]?.UC ?? 0)} UC`,
        cls: 'up' as const,
      },
      {
        color: 'amber',
        icon: '⚠️',
        label: 'Avg Strike Rate',
        val: `${mayAgg.avgStrike.toFixed(1)}%`,
        sub: mayAgg.avgStrike < 70 ? 'Below threshold' : 'On target',
        cls: mayAgg.avgStrike < 70 ? ('dn' as const) : ('up' as const),
      },
      {
        color: 'blue',
        icon: '📦',
        label: 'Disc. Qty (UC–PC)',
        val: FMT(mayAgg.totalUC - mayAgg.totalPC),
        sub: 'Potential uplift',
        cls: 'info' as const,
      },
      {
        color: 'purple',
        icon: '💎',
        label: 'Top Brand by Revenue',
        val: topBrand?.[0] ?? '—',
        sub: `TZS ${FMT(topBrand?.[1]?.TV ?? 0)}`,
        cls: 'up' as const,
      },
    ];
  }, [mayAgg]);
  const timeCards = useMemo(() => {
    const dates = uniq(mayRows.map(r => r.Date)).sort();
    const dl = dates.map(d => ({
      date: d,
      UC: mayRows.filter(r => r.Date === d).reduce((s, r) => s + r.UC, 0),
    }));
    if (!dl.length) return [];
    const peak = dl.reduce((p, c) => (c.UC > p.UC ? c : p), dl[0]);
    const low = dl.reduce((p, c) => (c.UC < p.UC ? c : p), dl[0]);
    const dowMap: Record<string, number> = {};
    const wkMap: Record<string, number> = {};
    const isoWeek = (d: Date) => {
      const dt = new Date(d);
      dt.setHours(0, 0, 0, 0);
      dt.setDate(dt.getDate() + 4 - (dt.getDay() || 7));
      return Math.ceil(
        ((dt.getTime() - new Date(dt.getFullYear(), 0, 1).getTime()) /
          86400000 +
          1) /
          7
      );
    };
    dl.forEach(x => {
      const dw = new Date(x.date).toLocaleDateString('en-US', {
        weekday: 'long',
      });
      dowMap[dw] = (dowMap[dw] || 0) + x.UC;
      const w = String(isoWeek(new Date(x.date)));
      wkMap[w] = (wkMap[w] || 0) + x.UC;
    });
    const peakDow = Object.entries(dowMap).sort((a, b) => b[1] - a[1])[0] || [
      '—',
      0,
    ];
    const peakWk = Object.entries(wkMap).sort((a, b) => b[1] - a[1])[0] || [
      '—',
      0,
    ];
    const grw = dl.map((x, i) => (i === 0 ? 0 : pct(x.UC, dl[i - 1].UC)));
    const fgIdx = grw.reduce((mi, v, i) => (v > grw[mi] ? i : mi), 1);
    const fdIdx = grw.reduce((mi, v, i) => (v < grw[mi] ? i : mi), 1);
    const avgUC = dl.reduce((s, x) => s + x.UC, 0) / dl.length;
    return [
      {
        label: 'Peak Sales Day',
        val: peak.date,
        sub: `${FMT(peak.UC)} UC — highest in period`,
      },
      {
        label: 'Lowest Sales Day',
        val: low.date,
        sub: `${FMT(low.UC)} UC — review gaps`,
      },
      {
        label: 'Peak Day of Week',
        val: peakDow[0],
        sub: `${FMT(peakDow[1])} UC cumulative`,
      },
      {
        label: 'Peak Week (ISO)',
        val: `Week ${peakWk[0]}`,
        sub: `${FMT(peakWk[1])} UC`,
      },
      {
        label: 'Fastest Growing Day',
        val: dl[fgIdx]?.date || '—',
        sub: `+${Math.min(9999, grw[fgIdx] || 0).toFixed(0)}% vs prior day`,
      },
      {
        label: 'Fastest Declining Day',
        val: dl[fdIdx]?.date || '—',
        sub: `${(grw[fdIdx] || 0).toFixed(0)}% vs prior day`,
      },
      {
        label: 'Avg Daily UC',
        val: FMT(avgUC),
        sub: `${dl.length} active trading days`,
      },
      {
        label: 'Total Trading Days',
        val: String(dl.length),
        sub: 'Days with sales in period',
      },
    ];
  }, [mayRows]);
  const observations = useMemo(() => {
    const brands = Object.entries(mayAgg.byBrand).map(([name, v]) => ({
      name,
      ...v,
      gr: pct(v.UC, aprAgg.byBrand[name]?.UC || 0),
    }));
    const depots = Object.entries(mayAgg.byDepot)
      .map(([name, v]) => ({
        name,
        ...v,
        gr: pct(v.UC, aprAgg.byDepot[name]?.UC || 0),
      }))
      .sort((a, b) => b.UC - a.UC);
    const coords = Object.entries(mayAgg.byCoord)
      .map(([name, v]) => ({
        name,
        ...v,
        gr: pct(v.UC, aprAgg.byCoord[name]?.UC || 0),
      }))
      .sort((a, b) => b.gr - a.gr);
    const routes = Object.entries(mayAgg.byRoute)
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.UC - a.UC);
    const packs = Object.entries(mayAgg.byPack)
      .map(([name, v]) => ({
        name,
        ...v,
        gr: pct(v.UC, aprAgg.byPack[name]?.UC || 0),
      }))
      .sort((a, b) => b.UC - a.UC);
    const chs = Object.entries(mayAgg.byCh)
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.UC - a.UC);
    const topG = brands.reduce(
      (p, c) => (c.gr > p.gr ? c : p),
      brands[0] || { gr: 0, name: '—' }
    );
    const botG = brands.reduce(
      (p, c) => (c.gr < p.gr ? c : p),
      brands[0] || { gr: 0, name: '—' }
    );
    const topDGr = depots.reduce(
      (p, c) => (c.gr > p.gr ? c : p),
      depots[0] || { gr: 0, name: '—' }
    );
    const total = mayAgg.totalUC || 1;
    const grAll = growth;
    const uniqueMayOutlets = new Set(mayRows.map(r => r.OutletCode));
    const uniqueAprOutlets = new Set(aprRows.map(r => r.OutletCode));
    const numNewOutlets = [...uniqueMayOutlets].filter(
      c => !uniqueAprOutlets.has(c)
    ).length;
    const numLostOutlets = [...uniqueAprOutlets].filter(
      c => !uniqueMayOutlets.has(c)
    ).length;
    return [
      {
        icon: '🚀',
        dim: 'Brand' as DrillDim,
        val: topG.name,
        badge: `+${(topG.gr || 0).toFixed(1)}%`,
        text: `<strong>${topG.name || '—'}</strong> grew <strong>+${(topG.gr || 0).toFixed(1)}%</strong> MoM — highest brand growth this period.`,
      },
      {
        icon: '📉',
        dim: 'Brand' as DrillDim,
        val: botG.name,
        badge: `${(botG.gr || 0).toFixed(1)}%`,
        text: `<strong>${botG.name || '—'}</strong> declined <strong>${(botG.gr || 0).toFixed(1)}%</strong> MoM. Investigate stock & route coverage.`,
      },
      {
        icon: '🏆',
        dim: 'Depot' as DrillDim,
        val: depots[0]?.name,
        badge: `${FMT(depots[0]?.UC || 0)} UC`,
        text: `<strong>${depots[0]?.name || '—'}</strong> leads with <strong>${FMT(depots[0]?.UC || 0)} UC</strong> — ${(((depots[0]?.UC || 0) / total) * 100).toFixed(0)}% of total volume.`,
      },
      {
        icon: '📈',
        dim: 'Coordinator' as DrillDim,
        val: coords[0]?.name,
        badge: `+${(topDGr.gr || 0).toFixed(1)}%`,
        text: `<strong>${topDGr.name || '—'}</strong> recorded highest depot growth at <strong>+${(topDGr.gr || 0).toFixed(1)}%</strong> MoM.`,
      },
      {
        icon: '🛣️',
        dim: 'Route' as DrillDim,
        val: routes[0]?.name,
        badge: `${FMT(routes[0]?.UC || 0)} UC`,
        text: `<strong>${routes[0]?.name || '—'}</strong> is the best route at <strong>${FMT(routes[0]?.UC || 0)} UC</strong> this period.`,
      },
      {
        icon: '📦',
        dim: 'Pack' as DrillDim,
        val: packs[0]?.name,
        badge: `${(((packs[0]?.UC || 0) / total) * 100).toFixed(0)}% share`,
        text: `<strong>${packs[0]?.name || '—'}</strong> contributes <strong>${(((packs[0]?.UC || 0) / total) * 100).toFixed(0)}%</strong> of Unit Cases.`,
      },
      {
        icon: '🏪',
        dim: null,
        val: null,
        badge: `${FMTn(numNewOutlets)} new`,
        text: `<strong>${FMTn(numNewOutlets)}</strong> new outlets activated; ~<strong>${FMTn(numLostOutlets)}</strong> churned. Net: <strong>+${FMTn(numNewOutlets - numLostOutlets)}</strong>.`,
      },
      {
        icon: '📊',
        dim: 'Customer Channel' as DrillDim,
        val: chs[0]?.name,
        badge: `${(((chs[0]?.UC || 0) / total) * 100).toFixed(0)}% vol`,
        text: `Overall May volume <strong>${Math.abs(grAll).toFixed(1)}% ${grAll >= 0 ? 'above' : 'below'}</strong> comparison period. Top channel: <strong>${chs[0]?.name || '—'}</strong>.`,
      },
    ];
  }, [mayAgg, aprAgg, mayRows, aprRows, growth]);
  const insights = useMemo(() => {
    const brands = Object.entries(mayAgg.byBrand).map(([name, v]) => ({
      name,
      ...v,
      gr: pct(v.UC, aprAgg.byBrand[name]?.UC || 0),
    }));
    const depots = Object.entries(mayAgg.byDepot)
      .map(([name, v]) => ({
        name,
        ...v,
        gr: pct(v.UC, aprAgg.byDepot[name]?.UC || 0),
      }))
      .sort((a, b) => b.UC - a.UC);
    const routes = Object.entries(mayAgg.byRoute)
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.UC - a.UC);
    const packs = Object.entries(mayAgg.byPack)
      .map(([name, v]) => ({
        name,
        ...v,
        gr: pct(v.UC, aprAgg.byPack[name]?.UC || 0),
      }))
      .sort((a, b) => b.gr - a.gr);
    const topG = brands.reduce(
      (p, c) => (c.gr > p.gr ? c : p),
      brands[0] || { gr: 0, name: '—' }
    );
    const botG = brands.reduce(
      (p, c) => (c.gr < p.gr ? c : p),
      brands[0] || { gr: 0, name: '—' }
    );
    const total = mayAgg.totalUC || 1;
    const uniqueMayOutlets = new Set(mayRows.map(r => r.OutletCode));
    const uniqueAprOutlets = new Set(aprRows.map(r => r.OutletCode));
    const numNewOutlets = [...uniqueMayOutlets].filter(
      c => !uniqueAprOutlets.has(c)
    ).length;
    const numLostOutlets = [...uniqueAprOutlets].filter(
      c => !uniqueMayOutlets.has(c)
    ).length;
    return [
      {
        icon: '📉',
        cat: 'VOLUME ALERT',
        text: `<strong>${botG.name || '—'}</strong> declined <strong>${Math.abs(botG.gr || 0).toFixed(1)}%</strong> MoM. Investigate stock availability and route coverage immediately.`,
      },
      {
        icon: '🚀',
        cat: 'GROWTH STAR',
        text: `<strong>${topG.name || '—'}</strong> grew <strong>+${(topG.gr || 0).toFixed(1)}%</strong> MoM — verify supply sustainability.`,
      },
      {
        icon: '🏆',
        cat: 'TOP DEPOT',
        text: `<strong>${depots[0]?.name || '—'}</strong> contributed <strong>${(((depots[0]?.UC || 0) / total) * 100).toFixed(0)}%</strong> of total volume, ${(depots[0]?.gr || 0) >= 0 ? 'up' : 'down'} ${Math.abs(depots[0]?.gr || 0).toFixed(1)}% vs comparison.`,
      },
      {
        icon: '🛣️',
        cat: 'TOP ROUTE',
        text: `<strong>${routes[0]?.name || '—'}</strong> recorded highest Unit Cases at <strong>${FMT(routes[0]?.UC || 0)} UC</strong>. Replicate success across similar routes.`,
      },
      {
        icon: '📦',
        cat: 'PACK OPPORTUNITY',
        text: `<strong>${packs[0]?.name || '—'}</strong> is the fastest-growing pack at <strong>+${(packs[0]?.gr || 0).toFixed(1)}%</strong>. Consider scaling supply to meet momentum.`,
      },
      {
        icon: '🏪',
        cat: 'OUTLET COVERAGE',
        text: `<strong>${FMTn(numNewOutlets)}</strong> new outlets activated. Net coverage expansion of <strong>+${FMTn(numNewOutlets - numLostOutlets)}</strong> outlets this period.`,
      },
    ];
  }, [mayAgg, aprAgg, mayRows, aprRows]);
  const drillRows = useMemo(() => {
    let filtered = mayRows;
    for (const { dim, val } of drillStack) {
      filtered = filtered.filter(r => r[DIM_FIELD[dim]] === val);
    }
    const field = DIM_FIELD[drillDim];
    const map: AggMap = {};
    for (const r of filtered) {
      const key = String(r[field]);
      if (!map[key]) map[key] = { UC: 0, PC: 0, TV: 0, count: 0 };
      map[key].UC += r.UC;
      map[key].PC += r.PC;
      map[key].TV += r.TV;
      map[key].count += 1;
    }
    return Object.entries(map).map(([name, v]) => ({
      [drillDim]: name,
      UC: v.UC,
      PC: v.PC,
      TV: v.TV,
      Invoices: v.count,
      'Growth %': parseFloat(
        pct(v.UC, (aprAgg[rankMap[drillDim]] as AggMap)[name]?.UC ?? 0).toFixed(
          1
        )
      ),
    }));
  }, [mayRows, aprAgg, drillDim, drillStack]);
  const handleDrillClick = (row: Record<string, string | number>) => {
    const nextDim = DIM_NEXT[drillDim];
    if (!nextDim) return;
    setDrillStack(s => [...s, { dim: drillDim, val: String(row[drillDim]) }]);
    setDrillDim(nextDim);
    setModalEntity({ dim: drillDim, name: String(row[drillDim]) });
  };
  const setFilter = (k: keyof FilterState, v: string) =>
    setFilters(f => ({ ...f, [k]: v }));
  const clearFilters = () => {
    setFilters({
      depot: '',
      coord: '',
      sup: '',
      route: '',
      sal: '',
      brand: '',
      pack: '',
      ch: '',
      dateMode: 'all',
    });
    setDateMode('all');
    setExecActive(null);
  };
  const handleExecObs = (i: number, obs: (typeof observations)[0]) => {
    if (execActive === i) {
      setExecActive(null);
      clearFilters();
      return;
    }
    setExecActive(i);
    if (obs.dim && obs.val) {
      const fk = FILTER_KEYS[obs.dim];
      setFilters(f => ({ ...f, [fk]: obs.val }));
    }
  };
  const handleRankClick = (val: string) => {
    const fk = FILTER_KEYS[rkDim];
    setFilters(f => ({ ...f, [fk]: f[fk] === val ? '' : val }));
  };
  const routeRows = useMemo(() => {
    return Object.entries(mayAgg.byRoute).map(([route, v]) => {
      const row = mayRows.find(r => r.Route === route);
      const aprV = aprAgg.byRoute[route] || { UC: 0 };
      return {
        Route: route,
        Depot: row?.Depot ?? '',
        Coordinator: row?.Coordinator ?? '',
        Supervisor: row?.Supervisor ?? '',
        UC: v.UC,
        PC: v.PC,
        TV: v.TV,
        'Growth %': parseFloat(pct(v.UC, aprV.UC).toFixed(1)),
        'Strike Rate': parseFloat(
          (
            mayRows
              .filter(r => r.Route === route)
              .reduce((s, r) => s + r.StrikeRate, 0) /
            Math.max(mayRows.filter(r => r.Route === route).length, 1)
          ).toFixed(1)
        ),
      };
    });
  }, [mayAgg, aprAgg, mayRows]);
  if (loading) return <DashboardSkeleton isFullscreen={isFullscreen} />;
  if (error)
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: C.bg,
          gap: 12,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div style={{ fontSize: 32 }}>⚠️</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.red }}>
          Failed to load dashboard data
        </div>
        <div
          style={{
            fontSize: 12,
            color: C.muted,
            maxWidth: 420,
            textAlign: 'center',
          }}
        >
          {error?.message || String(error)}
        </div>
        <div style={{ fontSize: 11, color: C.m2 }}>
          Ensure the backend API is running and accessible.
        </div>
      </div>
    );
  return (
    <div
      className={
        isFullscreen
          ? 'h-screen w-screen fixed inset-0 z-[9999] overflow-y-auto'
          : ''
      }
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        color: C.text,
        background: C.bg,
        minHeight: '100vh',
      }}
    >
      {/* ── Inner Header ─────────────────────────────────── */}
      <div
        style={{
          background: C.surface,
          borderBottom: `2.5px solid ${C.red}`,
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 52,
          boxShadow: '0 1px 8px rgba(0,0,0,.06)',
          position: 'sticky',
          top: 0,
          zIndex: 200,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                background: C.red,
                borderRadius: 5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 14,
                fontWeight: 900,
              }}
            >
              ✦
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: -0.3 }}>
              Sales Control{' '}
              <span style={{ color: C.muted, fontWeight: 400 }}>
                / Executive Intelligence
              </span>
            </div>
          </div>
          {/* Tab pills */}
          {isFullscreen && (
            <div
              style={{
                display: 'flex',
                gap: 1,
                background: C.s3,
                borderRadius: 7,
                padding: 3,
              }}
            >
              {[
                'Sales Performance',
                'Asset Monitoring',
                'Market Execution',
              ].map((t, i) => (
                <button
                  key={t}
                  style={{
                    padding: '5px 14px',
                    borderRadius: 5,
                    fontSize: 12,
                    fontWeight: i === 0 ? 600 : 500,
                    cursor: i === 0 ? 'pointer' : 'not-allowed',
                    color: i === 0 ? C.red : C.muted,
                    border: 'none',
                    background: i === 0 ? C.surface : 'transparent',
                    boxShadow: i === 0 ? '0 1px 3px rgba(0,0,0,.07)' : 'none',
                    opacity: i > 0 ? 0.5 : 1,
                    fontFamily: 'inherit',
                  }}
                >
                  {t}
                  {i > 0 && (
                    <span
                      style={{
                        fontSize: 8,
                        background: C.s3,
                        color: C.m2,
                        padding: '1px 4px',
                        borderRadius: 3,
                        marginLeft: 3,
                      }}
                    >
                      SOON
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Role toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: C.s3,
              border: `1px solid ${C.border}`,
              borderRadius: 6,
              padding: '3px 8px',
            }}
          >
            <span
              style={{
                fontSize: 10,
                color: C.muted,
                fontWeight: 700,
                letterSpacing: 0.4,
              }}
            >
              ROLE:
            </span>
            {(['MD', 'HSM'] as Role[]).map(r => (
              <button
                key={r}
                onClick={() => setRole(r)}
                style={{
                  padding: '3px 10px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 11,
                  fontWeight: 700,
                  border: 'none',
                  fontFamily: 'inherit',
                  background:
                    role === r ? (r === 'MD' ? C.red : C.blue) : 'transparent',
                  color: role === r ? '#fff' : C.m2,
                }}
              >
                {r}
              </button>
            ))}
          </div>
          <div
            style={{
              fontSize: 11,
              color: C.muted,
              background: C.s3,
              border: `1px solid ${C.border}`,
              padding: '3px 9px',
              borderRadius: 20,
            }}
          >
            Period:{' '}
            <strong>
              {dateMode === 'all'
                ? new Date().toLocaleString('default', {
                    month: 'short',
                    year: 'numeric',
                  })
                : dateMode === '7d'
                  ? 'Last 7 Days'
                  : dateMode === '15d'
                    ? 'Last 15 Days'
                    : 'Today'}
            </strong>
          </div>
          <div
            style={{
              fontSize: 11,
              color: C.muted,
              background: C.s3,
              border: `1px solid ${C.border}`,
              padding: '3px 9px',
              borderRadius: 20,
            }}
          >
            {FMTn(mayRows.length)} records
          </div>
          <MuiTooltip title="Refresh Data" arrow placement="top">
            <IconButton
              onClick={() => refetch()}
              className="!text-gray-600 hover:!text-gray-900 hover:!bg-gray-100 !p-1 !rounded-md !outline-none"
              size="small"
              disabled={isFetching}
            >
              <Refresh
                className={`!w-5 !h-5 ${isFetching ? 'animate-spin' : ''}`}
              />
            </IconButton>
          </MuiTooltip>
          <MuiTooltip
            title={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
            arrow
            placement="top"
          >
            <IconButton
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="!text-gray-600 hover:!text-gray-900 hover:!bg-gray-100 !p-1 !rounded-md !outline-none"
              size="small"
            >
              {isFullscreen ? (
                <FullscreenExit className="!w-5 !h-5" />
              ) : (
                <Fullscreen className="!w-5 !h-5" />
              )}
            </IconButton>
          </MuiTooltip>
        </div>
      </div>
      {/* ── Filter Bar ───────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          padding: '7px 20px',
          background: C.surface,
          borderBottom: `1px solid ${C.border}`,
          flexWrap: 'wrap',
          position: 'sticky',
          top: 52,
          zIndex: 150,
        }}
      >
        <span
          style={{
            fontSize: 10,
            color: C.muted,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 0.6,
            flexShrink: 0,
          }}
        >
          Date
        </span>
        {(
          [
            [
              'all',
              `All ${new Date().toLocaleString('default', { month: 'short' })}`,
            ],
            ['7d', 'Last 7d'],
            ['15d', 'Last 15d'],
            ['today', 'Today'],
          ] as [DateMode, string][]
        ).map(([m, lbl]) => (
          <button
            key={m}
            onClick={() => setDateMode(m)}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              border: `1px solid ${dateMode === m ? C.red : C.bord2}`,
              background: dateMode === m ? C.red : C.surface,
              color: dateMode === m ? '#fff' : C.muted,
              fontSize: 11,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: 500,
              transition: 'all .15s',
            }}
          >
            {lbl}
          </button>
        ))}
        <div
          style={{
            width: 1,
            height: 16,
            background: C.border,
            flexShrink: 0,
            margin: '0 2px',
          }}
        />
        {(() => {
          let prev = 'Previous Period';
          let sply = 'Same Period';
          if (dateMode === 'all') {
            const pd = new Date();
            pd.setMonth(pd.getMonth() - 1);
            prev = pd.toLocaleString('default', {
              month: 'short',
              year: 'numeric',
            });
            sply = 'Same Period';
          } else if (dateMode === '7d') {
            prev = 'Prev 7 Days';
            sply = 'Same 7d';
          } else if (dateMode === '15d') {
            prev = 'Prev 15 Days';
            sply = 'Same 15d';
          } else if (dateMode === 'today') {
            prev = 'Yesterday';
            sply = 'Same Day';
          }
          return (
            <select
              value={cmpMode}
              onChange={e => setCmpMode(e.target.value as CmpMode)}
              style={{
                background: C.s3,
                border: `1px solid ${C.bord2}`,
                color: C.text,
                padding: '4px 22px 4px 7px',
                borderRadius: 6,
                fontSize: 11,
                fontFamily: 'inherit',
                cursor: 'pointer',
                outline: 'none',
                WebkitAppearance: 'none',
              }}
            >
              <option value="apr">vs {prev}</option>
              <option value="spm">vs {sply}</option>
            </select>
          );
        })()}
        <div
          style={{
            width: 1,
            height: 16,
            background: C.border,
            flexShrink: 0,
            margin: '0 2px',
          }}
        />
        {(
          [
            ['depot', depots, 'All Depots'],
            ['coord', coords, 'All Coordinators'],
            ['sup', sups, 'All Supervisors'],
            ['route', routes, 'All Routes'],
            ['sal', salesmen, 'All Salesmen'],
            ['brand', brands, 'All Brands'],
            ['pack', packs, 'All Packs'],
            ['ch', channels, 'All Channels'],
          ] as [keyof FilterState, string[], string][]
        ).map(([k, opts, placeholder]) => (
          <select
            key={k}
            value={filters[k]}
            onChange={e => setFilter(k, e.target.value)}
            style={{
              background: filters[k] ? C.redL : C.surface,
              border: `1px solid ${filters[k] ? C.red : C.bord2}`,
              color: C.text,
              padding: '4px 24px 4px 8px',
              borderRadius: 6,
              fontSize: 11.5,
              fontFamily: 'inherit',
              cursor: 'pointer',
              outline: 'none',
              WebkitAppearance: 'none',
              maxWidth: 130,
            }}
          >
            <option value="">{placeholder}</option>
            {opts.map(o => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        ))}
        <button
          onClick={clearFilters}
          style={{
            padding: '4px 10px',
            borderRadius: 6,
            border: `1px solid ${C.bord2}`,
            background: C.s3,
            color: C.muted,
            fontSize: 11,
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all .15s',
          }}
        >
          ✕ Clear
        </button>
      </div>
      {/* ── Dashboard Body ────────────────────────────────── */}
      <div style={{ padding: '14px 20px' }}>
        {/* Executive Summary Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #e31837 0%, #b0122a 100%)',
            borderRadius: 10,
            padding: '15px 18px',
            marginBottom: 12,
            boxShadow: '0 4px 20px rgba(227,24,55,.2)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 9,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              ⚡ Executive Summary
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,.6)' }}>
                Auto-generated · Click any observation to filter
              </span>
              {execActive !== null && (
                <button
                  onClick={() => {
                    setExecActive(null);
                    clearFilters();
                  }}
                  style={{
                    padding: '3px 10px',
                    borderRadius: 5,
                    border: '1px solid rgba(255,255,255,.35)',
                    background: 'rgba(255,255,255,.12)',
                    color: 'rgba(255,255,255,.85)',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  ✕ Clear Filter
                </button>
              )}
            </div>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2,1fr)',
              gap: 6,
            }}
          >
            {observations.map((obs, i) => (
              <div
                key={i}
                onClick={() => handleExecObs(i, obs)}
                style={{
                  background:
                    execActive === i
                      ? 'rgba(255,255,255,.28)'
                      : 'rgba(255,255,255,.11)',
                  borderRadius: 7,
                  padding: '8px 11px',
                  fontSize: 11.5,
                  color: 'rgba(255,255,255,.9)',
                  border: `1px solid ${execActive === i ? 'rgba(255,255,255,.6)' : 'rgba(255,255,255,.14)'}`,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 7,
                  boxShadow:
                    execActive === i ? '0 4px 12px rgba(0,0,0,.15)' : 'none',
                  transition: 'all .15s',
                  transform: execActive === i ? 'translateY(-1px)' : '',
                }}
              >
                <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>
                  {obs.icon}
                </span>
                <div
                  style={{ lineHeight: 1.45, flex: 1 }}
                  dangerouslySetInnerHTML={{ __html: obs.text }}
                />
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 10,
                    background:
                      execActive === i ? '#fff' : 'rgba(255,255,255,.25)',
                    color: execActive === i ? C.red : '#fff',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    alignSelf: 'center',
                    border: `1px solid ${execActive === i ? 'rgba(255,255,255,0)' : 'rgba(255,255,255,.3)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  {execActive === i ? (
                    <>
                      <span style={{ fontSize: 8, lineHeight: 1 }}>●</span>{' '}
                      Active
                    </>
                  ) : (
                    obs.badge
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* KPI Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6,1fr)',
            gap: 10,
            marginBottom: 12,
          }}
        >
          <KpiCard
            label="Unit Cases"
            icon="📦"
            value={FMT(mayAgg.totalUC)}
            growth={growth}
            color={C.red}
            bg={C.redL}
            selected={kpiSel === 'UC'}
            onClick={() => setKpiSel(s => (s === 'UC' ? null : 'UC'))}
            sparkData={sparkDates}
          />
          <KpiCard
            label="Physical Cases"
            icon="🏭"
            value={FMT(mayAgg.totalPC)}
            growth={pct(mayAgg.totalPC, aprAgg.totalPC)}
            color={C.blue}
            bg={C.blueL}
            selected={kpiSel === 'PC'}
            onClick={() => setKpiSel(s => (s === 'PC' ? null : 'PC'))}
            sparkData={sparkDates.map(v => v * 0.75)}
          />
          {role === 'MD' && (
            <KpiCard
              label="Sales Value"
              icon="💰"
              value={`TZS ${FMT(mayAgg.totalTV)}`}
              growth={pct(mayAgg.totalTV, aprAgg.totalTV)}
              color={C.green}
              bg={C.greenL}
              selected={kpiSel === 'TV'}
              onClick={() => setKpiSel(s => (s === 'TV' ? null : 'TV'))}
              sparkData={sparkDates.map(v => v * 6000)}
            />
          )}
          <KpiCard
            label="Growth % MoM"
            icon="📈"
            value={`${growth.toFixed(1)}%`}
            color={C.amber}
            bg={C.amberL}
            selected={kpiSel === 'growth'}
            onClick={() => setKpiSel(s => (s === 'growth' ? null : 'growth'))}
            sparkData={sparkDates.map(v => v * 0.03)}
          />
          <KpiCard
            label="Target Achievement"
            icon="🎯"
            value={`${targetPct.toFixed(1)}%`}
            demo
            color={C.purple}
            bg={C.purpleL}
            selected={kpiSel === 'target'}
            onClick={() => setKpiSel(s => (s === 'target' ? null : 'target'))}
            sparkData={sparkDates.map(v => v * 0.001)}
          />
          <KpiCard
            label="New Outlets"
            icon="🏪"
            value={FMTn(mayAgg.newOutlets)}
            color={C.cyan}
            bg={C.cyanL}
            selected={kpiSel === 'new'}
            onClick={() => setKpiSel(s => (s === 'new' ? null : 'new'))}
            sparkData={sparkDates.map(v => v * 0.02)}
          />
        </div>
        {/* Row 1: Trend | Ranking | Treemap */}
        <SH label="Performance Overview" />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1.1fr',
            gap: 10,
            marginBottom: 10,
          }}
        >
          {/* Trend Chart */}
          <Card>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Sales Trend</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                  Daily comparison — current vs comparison period
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {(['UC', 'TV', 'PC'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setTrendMetric(m)}
                    style={{
                      padding: '3px 9px',
                      borderRadius: 20,
                      border: `1px solid ${trendMetric === m ? C.red : C.bord2}`,
                      background: trendMetric === m ? C.redL : C.s3,
                      color: trendMetric === m ? C.red : C.muted,
                      fontSize: 11,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontWeight: trendMetric === m ? 600 : 500,
                    }}
                  >
                    {m === 'TV' ? 'Revenue' : m}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ position: 'relative', height: 200 }}>
              <Line
                data={{
                  labels: trendData.labels,
                  datasets: [
                    {
                      label:
                        dateMode === 'all'
                          ? new Date().toLocaleString('default', {
                              month: 'short',
                              year: 'numeric',
                            })
                          : dateMode === '7d'
                            ? 'Last 7 Days'
                            : dateMode === '15d'
                              ? 'Last 15 Days'
                              : 'Today',
                      data: trendData.curData,
                      borderColor: C.red,
                      backgroundColor: `${C.red}1a`,
                      fill: true,
                      tension: 0.4,
                      pointRadius: 0,
                      borderWidth: 2,
                    },
                    {
                      label: `Apr 2026`,
                      data: trendData.cmpData,
                      borderColor: C.bord2,
                      backgroundColor: 'transparent',
                      tension: 0.4,
                      pointRadius: 0,
                      borderWidth: 1.5,
                      borderDash: [4, 2],
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { font: { size: 11 }, boxWidth: 12 },
                    },
                    tooltip: { mode: 'index', intersect: false },
                  },
                  scales: {
                    x: {
                      grid: { display: false },
                      ticks: { font: { size: 10 }, maxTicksLimit: 10 },
                    },
                    y: {
                      grid: { color: `${C.border}` },
                      ticks: { font: { size: 10 } },
                    },
                  },
                }}
              />
            </div>
          </Card>
          {/* Top Performers */}
          <Card>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>
                  Top Performers
                </div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                  Click row to cross-filter
                </div>
              </div>
              <select
                value={rkDim}
                onChange={e => setRkDim(e.target.value as DrillDim)}
                style={{
                  background: C.s3,
                  border: `1px solid ${C.bord2}`,
                  color: C.text,
                  padding: '3px 20px 3px 7px',
                  borderRadius: 5,
                  fontSize: 11,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  outline: 'none',
                  WebkitAppearance: 'none',
                }}
              >
                {DIMENSIONS.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <RankList
              entries={rankEntries}
              max={rankMax}
              onRowClick={handleRankClick}
            />
          </Card>
          {/* Treemap */}
          <Card>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>
                  Brand Analysis
                </div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                  Treemap · Brand → Pack → SKU · Click to drill
                </div>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11.5,
                color: C.muted,
                marginBottom: 7,
                flexWrap: 'wrap',
              }}
            >
              <span
                onClick={() => setTmStack([])}
                style={{ color: C.red, cursor: 'pointer', fontWeight: 600 }}
              >
                All Brands
              </span>
              {tmStack.map((s, i) => (
                <React.Fragment key={i}>
                  <span style={{ color: C.bord2, fontSize: 15 }}>›</span>
                  <span
                    onClick={() => setTmStack(prev => prev.slice(0, i + 1))}
                    style={{
                      color: C.text,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {s}
                  </span>
                </React.Fragment>
              ))}
            </div>
            <Treemap
              nodes={tmNodes}
              onDrill={name => {
                if (tmStack.length < 2) {
                  setTmStack(prev => [...prev, name]);
                } else {
                  setModalEntity({ dim: 'SKU', name });
                }
              }}
            />
          </Card>
        </div>
        {/* Row 2: Channel | Pack | Exceptions */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr 1.15fr',
            gap: 10,
            marginBottom: 10,
          }}
        >
          {/* Channel Donut */}
          <Card>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>
                  Channel Contribution
                </div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                  Click segments to cross-filter
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {(['TV', 'UC'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setChMetric(m)}
                    style={{
                      padding: '3px 9px',
                      borderRadius: 20,
                      border: `1px solid ${chMetric === m ? C.red : C.bord2}`,
                      background: chMetric === m ? C.redL : C.s3,
                      color: chMetric === m ? C.red : C.muted,
                      fontSize: 11,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontWeight: chMetric === m ? 600 : 500,
                    }}
                  >
                    {m === 'TV' ? 'Revenue' : 'Volume'}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ flexShrink: 0 }}>
                <Doughnut
                  data={{
                    labels: chEntries.map(([k]) => k),
                    datasets: [
                      {
                        data: chEntries.map(([, v]) =>
                          chMetric === 'TV' ? v.TV : v.UC
                        ),
                        backgroundColor: chEntries.map(
                          (_, i) => PAL[i % PAL.length]
                        ),
                        borderWidth: 2,
                        borderColor: C.surface,
                      },
                    ],
                  }}
                  options={{
                    responsive: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          label: ctx =>
                            ` ${ctx.label}: ${FMT(ctx.parsed)} (${chTotal ? ((ctx.parsed / chTotal) * 100).toFixed(1) : 0}%)`,
                        },
                      },
                    },
                    cutout: '68%',
                  }}
                  width={148}
                  height={148}
                />
              </div>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  overflowY: 'auto',
                  maxHeight: 200,
                }}
              >
                {chEntries.map(([name, v], i) => {
                  const val = chMetric === 'TV' ? v.TV : v.UC;
                  const share = chTotal ? (val / chTotal) * 100 : 0;
                  return (
                    <div
                      key={name}
                      onClick={() =>
                        setFilter('ch', filters.ch === name ? '' : name)
                      }
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 7,
                        cursor: 'pointer',
                        padding: '3px 5px',
                        borderRadius: 5,
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          flexShrink: 0,
                          background: PAL[i % PAL.length],
                        }}
                      />
                      <span style={{ fontSize: 11, color: C.m2, flex: 1 }}>
                        {name}
                      </span>
                      <span
                        style={{
                          fontSize: 11.5,
                          fontWeight: 700,
                          color: C.text,
                        }}
                      >
                        {share.toFixed(1)}%
                      </span>
                      <span style={{ fontSize: 10, color: C.muted }}>
                        {FMT(val)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
          {/* Pack Performance */}
          <Card>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>
                Pack Performance
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                Click row to cross-filter
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {packEntries.map(([name, v], i) => {
                const w = packMax ? (v.UC / packMax) * 100 : 0;
                return (
                  <div
                    key={name}
                    onClick={() =>
                      setFilter('pack', filters.pack === name ? '' : name)
                    }
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                      cursor: 'pointer',
                      padding: '2px 4px',
                      borderRadius: 5,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        width: 94,
                        flexShrink: 0,
                        color: C.t2,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {name}
                    </span>
                    <div
                      style={{
                        flex: 1,
                        height: 13,
                        background: C.s3,
                        borderRadius: 3,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          borderRadius: 3,
                          background: PAL[i % PAL.length],
                          width: `${w}%`,
                          transition: 'width .5s',
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        width: 44,
                        textAlign: 'right',
                        flexShrink: 0,
                      }}
                    >
                      {FMT(v.UC)}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
          {/* Exception Panel */}
          <Card>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>
                Exception Panel
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                Live · Click to filter
              </div>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2,1fr)',
                gap: 6,
                maxHeight: 290,
                overflowY: 'auto',
              }}
            >
              {excCards.map((ex, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 10px',
                    borderRadius: 7,
                    border: `1px solid ${C.border}`,
                    background: C.s3,
                    cursor: 'pointer',
                    transition: 'all .18s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      '0 2px 8px rgba(0,0,0,.07)';
                    (e.currentTarget as HTMLElement).style.borderColor =
                      C.bord2;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = '';
                    (e.currentTarget as HTMLElement).style.borderColor =
                      C.border;
                  }}
                >
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{ex.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 9.5,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: 0.4,
                        color: C.muted,
                      }}
                    >
                      {ex.label}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: C.text,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginTop: 1,
                      }}
                    >
                      {ex.val}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color:
                          ex.cls === 'up'
                            ? C.green
                            : ex.cls === 'dn'
                              ? C.red
                              : C.blue,
                        marginTop: 1,
                      }}
                    >
                      {ex.sub}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        {/* Exception Intelligence */}
        <SH label="Exception Intelligence" />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5,1fr)',
            gap: 8,
            marginBottom: 10,
          }}
        >
          {excCards.map((ex, i) => {
            const bclr = (
              {
                red: C.red,
                green: C.green,
                amber: C.amber,
                blue: C.blue,
                purple: C.purple,
              } as any
            )[ex.color];
            return (
              <div
                key={i}
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderLeft: `3px solid ${bclr}`,
                  borderRadius: 8,
                  padding: 12,
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,.07)',
                  transition: 'all .18s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    '0 4px 16px rgba(0,0,0,.09)';
                  (e.currentTarget as HTMLElement).style.transform =
                    'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    '0 1px 3px rgba(0,0,0,.07)';
                  (e.currentTarget as HTMLElement).style.transform = '';
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 6 }}>{ex.icon}</div>
                <div
                  style={{
                    fontSize: 9.5,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 0.4,
                    color: C.muted,
                    marginBottom: 3,
                  }}
                >
                  {ex.label}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: C.text,
                    lineHeight: 1.25,
                    marginBottom: 2,
                  }}
                >
                  {ex.val}
                </div>
                <div
                  style={{
                    fontSize: 10.5,
                    fontWeight: 600,
                    color:
                      ex.cls === 'up'
                        ? C.green
                        : ex.cls === 'dn'
                          ? C.red
                          : C.blue,
                  }}
                >
                  {ex.sub}
                </div>
              </div>
            );
          })}
        </div>
        {/* Time Intelligence */}
        <SH label="Time Intelligence" />
        <Card style={{ marginBottom: 10 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4,1fr)',
              gap: 8,
            }}
          >
            {timeCards.map((tc, i) => (
              <div
                key={i}
                style={{
                  padding: '11px 13px',
                  borderRadius: 7,
                  border: `1px solid ${C.border}`,
                  background: C.s3,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 0.4,
                    color: C.muted,
                    marginBottom: 4,
                  }}
                >
                  {tc.label}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                  {tc.val}
                </div>
                <div style={{ fontSize: 10.5, color: C.muted, marginTop: 2 }}>
                  {tc.sub}
                </div>
              </div>
            ))}
          </div>
        </Card>
        {/* Executive Insights */}
        <SH label="Executive Insights" />
        <Card style={{ marginBottom: 10 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3,1fr)',
              gap: 8,
            }}
          >
            {insights.map((ins, i) => (
              <div
                key={i}
                style={{
                  padding: '12px 14px',
                  borderRadius: 7,
                  border: `1px solid ${C.border}`,
                  background: C.s3,
                  cursor: 'pointer',
                  transition: 'all .18s',
                  borderLeft: `3px solid ${PAL[i % PAL.length]}`,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    '0 2px 8px rgba(0,0,0,.07)';
                  (e.currentTarget as HTMLElement).style.background = C.surface;
                  (e.currentTarget as HTMLElement).style.transform =
                    'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '';
                  (e.currentTarget as HTMLElement).style.background = C.s3;
                  (e.currentTarget as HTMLElement).style.transform = '';
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginBottom: 4,
                  }}
                >
                  <span style={{ fontSize: 15 }}>{ins.icon}</span>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      color: C.muted,
                      textTransform: 'uppercase',
                    }}
                  >
                    {ins.cat}
                  </span>
                </div>
                <div
                  style={{ fontSize: 12, lineHeight: 1.55, color: C.t2 }}
                  dangerouslySetInnerHTML={{ __html: ins.text }}
                />
              </div>
            ))}
          </div>
        </Card>
        {/* Route Performance Table */}
        <SH label="Route Performance" />
        <Card style={{ marginBottom: 10 }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Route Ranking</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
              Sortable · Click header to sort · Click row to drill
            </div>
          </div>
          <DataTable
            cols={[
              { key: 'Route', label: 'Route' },
              { key: 'Depot', label: 'Depot' },
              { key: 'Coordinator', label: 'Coord.' },
              { key: 'Supervisor', label: 'Supervisor' },
              { key: 'UC', label: 'Unit Cases', numeric: true },
              { key: 'PC', label: 'Phy. Cases', numeric: true },
              { key: 'TV', label: 'Value (TZS)', numeric: true },
              { key: 'Growth %', label: 'Growth %', numeric: true },
              { key: 'Strike Rate', label: 'Strike Rate', numeric: true },
            ]}
            rows={routeRows}
          />
        </Card>
        {/* Interactive Drill-Down Explorer */}
        <SH label="Interactive Drill-Down Explorer" />
        <Card>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: 12,
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Data Explorer</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                Company → Depot → Coordinator → Supervisor → Route → Salesman
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                gap: 4,
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: 10, color: C.muted, fontWeight: 700 }}>
                GROUP:
              </span>
              {DIMENSIONS.map(dim => (
                <button
                  key={dim}
                  onClick={() => {
                    setDrillDim(dim);
                    setDrillStack([]);
                  }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 5,
                    border: `1px solid ${drillDim === dim ? C.red : C.bord2}`,
                    background: drillDim === dim ? C.red : C.s3,
                    color: drillDim === dim ? '#fff' : C.muted,
                    fontSize: 11.5,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontWeight: drillDim === dim ? 700 : 500,
                    transition: 'all .15s',
                  }}
                >
                  {dim}
                </button>
              ))}
            </div>
          </div>
          {/* Breadcrumb */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11.5,
              color: C.muted,
              marginBottom: 10,
              background: C.s2,
              padding: '7px 11px',
              borderRadius: 6,
              border: `1px solid ${C.border}`,
              flexWrap: 'wrap',
            }}
          >
            <span
              onClick={() => {
                setDrillStack([]);
                setDrillDim(DIMENSIONS[0]);
              }}
              style={{ color: C.red, cursor: 'pointer', fontWeight: 600 }}
            >
              🏢 Company
            </span>
            {drillStack.map((s, i) => (
              <React.Fragment key={i}>
                <span style={{ color: C.bord2, fontSize: 15 }}>›</span>
                <span
                  onClick={() => {
                    setDrillStack(prev => prev.slice(0, i + 1));
                    setDrillDim(
                      DIMENSIONS[DIMENSIONS.indexOf(s.dim) + 1] || s.dim
                    );
                  }}
                  style={{
                    cursor: 'pointer',
                    color: i === drillStack.length - 1 ? C.text : C.red,
                    fontWeight: 700,
                  }}
                >
                  {s.val}
                </span>
              </React.Fragment>
            ))}
          </div>
          <DataTable
            cols={[
              { key: drillDim, label: drillDim },
              { key: 'UC', label: 'Unit Cases', numeric: true },
              { key: 'PC', label: 'Phy. Cases', numeric: true },
              { key: 'TV', label: 'Value (TZS)', numeric: true },
              { key: 'Invoices', label: 'Invoices', numeric: true },
              { key: 'Growth %', label: 'Growth %', numeric: true },
            ]}
            rows={drillRows}
            onRowClick={DIM_NEXT[drillDim] ? handleDrillClick : undefined}
          />
        </Card>
      </div>
      <EntityModal
        entity={modalEntity}
        onClose={() => setModalEntity(null)}
        mayRows={mayRows}
        aprRows={aprRows}
      />
    </div>
  );
};
export default SalesControlTower;
