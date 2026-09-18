import { Chip, MenuItem, Skeleton } from '@mui/material';
import {
  CancelOutlined,
  CheckCircleOutlined,
  KitchenOutlined,
  ScheduleOutlined,
  StorefrontOutlined,
  WarehouseOutlined,
  WarningAmberOutlined,
} from '@mui/icons-material';
import { Maximize, Minimize } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import Select from 'shared/Select';
import './index.css';
import {
  fetchCoolerTrackingDashboard,
  type CoolerTrackingDashboardData,
} from 'services/reports/coolerTrackingDashboard';

/**
 * @interface DonutSegment
 * Segment definition for SVG Donut chart
 */
interface DonutSegment {
  value: number;
  color: string;
}

/**
 * @interface BarItem
 * Item definition for progress bar rows
 */
interface BarItem {
  label: string;
  stat: string;
  pct: number;
  count?: number;
}

/**
 * @interface OutletRecord
 * Record shape for outlet coolers
 */
interface OutletRecord {
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

/**
 * @interface MasterRecord
 * Record shape for master outlet list
 */
interface MasterRecord {
  code: string;
  name?: string;
  depot: string;
  zone: string;
  route: string;
  category: string;
  custType: string;
  channel: string | null;
}

/**
 * @interface DepotRecord
 * Record shape for depot stock
 */
interface DepotRecord {
  zone: string;
  barcode: string;
  serial: string;
  brand: string;
  subtype: string;
  verifiedDate: string | null;
  verifyBucket: string;
}

/** Empty dashboard shape placeholder for initial render state */
const EMPTY_DASHBOARD: CoolerTrackingDashboardData = {
  outletMeta: {
    reportDate: '—',
    total: 0,
    zones: [],
    routes: [],
    supervisors: [],
    depots: [],
    categories: [],
    custTypes: [],
    channels: [],
    brands: [],
    staleCount: 0,
    installTrend: [],
    scanTrend: [],
    supervisorZones: {},
    zoneRoutes: {},
  },
  outletRecords: [],
  denomMeta: {},
  masterMeta: { depots: [], zones: [], zoneRoutes: {} },
  masterRecords: [],
  depotMeta: { total: 0, zones: [], brands: [] },
  depotRecords: [],
};

const bucketOrder = [
  '0-30 days',
  '31-60 days',
  '61-90 days',
  '90-180 days',
  'Over 180 days',
  'Never scanned',
];
const bucketColors: Record<string, string> = {
  '0-30 days': '#12B76A',
  '31-60 days': '#F79009',
  '61-90 days': '#FDA29B',
  '90-180 days': '#F04438',
  'Over 180 days': '#B42318',
  'Never scanned': '#98A2B3',
};

/**
 * @function getBucketChipColor
 * Get MUI Chip color corresponding to scan ageing bucket
 */
function getBucketChipColor(
  bucket: string
):
  | 'default'
  | 'primary'
  | 'secondary'
  | 'error'
  | 'info'
  | 'success'
  | 'warning' {
  switch (bucket) {
    case '0-30 days':
      return 'success';
    case '31-60 days':
    case '61-90 days':
      return 'warning';
    case '90-180 days':
    case 'Over 180 days':
      return 'error';
    case 'Never scanned':
    default:
      return 'default';
  }
}

/**
 * @function getVerifyBucketChipColor
 * Get MUI Chip color corresponding to verification ageing bucket
 */
function getVerifyBucketChipColor(
  bucket: string
):
  | 'default'
  | 'primary'
  | 'secondary'
  | 'error'
  | 'info'
  | 'success'
  | 'warning' {
  switch (bucket) {
    case '0-7 days':
      return 'success';
    case '8-15 days':
    case '15-30 days':
      return 'warning';
    case 'Over 30 days':
      return 'error';
    case 'Not physically verified':
    default:
      return 'default';
  }
}

const verifyOrder = [
  'Not physically verified',
  '0-7 days',
  '8-15 days',
  '15-30 days',
  'Over 30 days',
];
const verifyColors: Record<string, string> = {
  'Not physically verified': '#98A2B3',
  '0-7 days': '#12B76A',
  '8-15 days': '#F79009',
  '15-30 days': '#FDA29B',
  'Over 30 days': '#F04438',
};

const brandColors = [
  '#3B7CFF',
  '#7A5CFA',
  '#EE46BC',
  '#F79009',
  '#12B76A',
  '#F04438',
];

/**
 * @function fmtNum
 * Format a number with locale commas
 */
function fmtNum(n: number): string {
  return n.toLocaleString();
}

/**
 * @function fmtPct
 * Format a percentage rounded to one decimal place
 */
function fmtPct(n: number): string {
  return Math.round(n * 10) / 10 + '%';
}

/**
 * @function fmtSigned
 * Format a signed number
 */
function fmtSigned(n: number): string {
  return (n > 0 ? '+' : '') + n.toLocaleString();
}

/**
 * @function xmlEscape
 * Escape XML special characters
 */
function xmlEscape(v: unknown): string {
  return String(v === undefined || v === null ? '' : v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * @function exportExcel
 * Export tabular dataset as XML-based Excel workbook
 */
function exportExcel(
  headers: string[],
  rowArrays: (string | number | null | undefined)[][],
  filename: string
) {
  let xml =
    '<?xml version="1.0"?>\n<?mso-application progid="Excel.Sheet"?>\n<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n<Styles><Style ss:ID="hdr"><Font ss:Bold="1"/></Style></Styles>\n<Worksheet ss:Name="Export"><Table>\n';
  xml +=
    '<Row>' +
    headers
      .map(
        h =>
          '<Cell ss:StyleID="hdr"><Data ss:Type="String">' +
          xmlEscape(h) +
          '</Data></Cell>'
      )
      .join('') +
    '</Row>\n';
  rowArrays.forEach(row => {
    xml +=
      '<Row>' +
      row
        .map(v => {
          const isNum = typeof v === 'number';
          return (
            '<Cell><Data ss:Type="' +
            (isNum ? 'Number' : 'String') +
            '">' +
            xmlEscape(v) +
            '</Data></Cell>'
          );
        })
        .join('') +
      '</Row>\n';
  });
  xml += '</Table></Worksheet></Workbook>';
  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename + '.xls';
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * @component SvgDonut
 * Native SVG Donut Chart with center text summary
 */
const SvgDonut: React.FC<{
  segments: DonutSegment[];
  centerValue: string;
  centerLabel: string;
}> = ({ segments, centerValue, centerLabel }) => {
  const total = segments.reduce((sum, seg) => sum + seg.value, 0);
  const r = 40;
  const sw = 14;
  const c = 2 * Math.PI * r;

  let offset = 0;
  const renderedCircles = segments
    .filter(seg => seg.value > 0)
    .map((seg, idx) => {
      const frac = total > 0 ? seg.value / total : 0;
      const len = frac * c;
      const dash = len.toFixed(2) + ' ' + (c - len).toFixed(2);
      const dashoffset = (-offset).toFixed(2);
      offset += len;
      return (
        <circle
          key={idx}
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={seg.color}
          strokeWidth={sw}
          strokeDasharray={dash}
          strokeDashoffset={dashoffset}
          transform="rotate(-90 50 50)"
        />
      );
    });

  return (
    <div className="flex items-center gap-5">
      <div className="relative h-[190px] w-[190px] shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {total === 0 ? (
            <circle
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke="#F0F1F6"
              strokeWidth={sw}
            />
          ) : (
            renderedCircles
          )}
        </svg>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <span className="text-xl font-extrabold block text-r-text">
            {centerValue}
          </span>
          <span className="text-[10.5px] text-r-muted font-semibold">
            {centerLabel}
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * @component SvgAreaChart
 * Native SVG Area Trend Chart
 */
const SvgAreaChart: React.FC<{
  labels: string[];
  values: number[];
  color: string;
  fillColor: string;
}> = ({ labels, values, color, fillColor }) => {
  const w = 600;
  const h = 220;
  const padL = 6;
  const padR = 6;
  const padT = 10;
  const padB = 22;

  const max = Math.max(1, ...values);
  const n = labels.length || 1;
  const stepX = (w - padL - padR) / Math.max(1, n - 1);

  const points = values.map((v, i) => {
    const x = padL + i * stepX;
    const y = padT + (h - padT - padB) * (1 - v / max);
    return [x, y];
  });

  const linePath = points
    .map(
      (p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)
    )
    .join(' ');
  const lastX = points.length ? points[points.length - 1][0].toFixed(1) : padL;
  const firstX = points.length ? points[0][0].toFixed(1) : padL;
  const areaPath = points.length
    ? linePath +
      ' L' +
      lastX +
      ' ' +
      (h - padB) +
      ' L' +
      firstX +
      ' ' +
      (h - padB) +
      ' Z'
    : '';

  const gridLines = [0, 1, 2, 3].map(i => {
    const y = padT + ((h - padT - padB) * i) / 3;
    return (
      <line
        key={i}
        x1={padL}
        y1={y.toFixed(1)}
        x2={w - padR}
        y2={y.toFixed(1)}
        stroke="#F0F1F6"
        strokeWidth="1"
      />
    );
  });

  const showEvery = Math.max(1, Math.ceil(n / 8));
  const xLabels = labels.map((l, i) => {
    if (i % showEvery !== 0 && i !== n - 1) return null;
    const x = padL + i * stepX;
    return (
      <text
        key={i}
        x={x.toFixed(1)}
        y={h - 6}
        fontSize="9"
        fill="#98A2B3"
        textAnchor="middle"
      >
        {l}
      </text>
    );
  });

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      style={{ width: '100%', height: '100%' }}
    >
      {gridLines}
      {areaPath && <path d={areaPath} fill={fillColor} />}
      {linePath && (
        <path d={linePath} fill="none" stroke={color} strokeWidth="2" />
      )}
      {xLabels}
    </svg>
  );
};

/**
 * @component BarList
 * Reusable list of horizontal progress bars
 */
const BarList: React.FC<{
  items: BarItem[];
  colorFn?: (item: BarItem, index: number) => string;
}> = ({ items, colorFn }) => {
  if (!items.length) {
    return (
      <p className="text-r-muted text-[13px]">No data in current filter.</p>
    );
  }

  return (
    <div className="flex flex-col gap-3.5">
      {items.map((it, idx) => {
        const bg = colorFn ? colorFn(it, idx) : '#3B7CFF';
        return (
          <div key={idx}>
            <div className="flex justify-between text-[13px] mb-1.5 gap-2.5">
              <span className="font-bold text-r-text">{it.label}</span>
              <span className="text-r-muted font-semibold whitespace-nowrap">
                {it.stat}
              </span>
            </div>
            <div className="h-2 rounded-full bg-r-line overflow-hidden">
              <div
                className="h-full rounded-full transition-[width] duration-400 ease-out"
                style={{ width: `${it.pct}%`, background: bg }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * @component AssetReportSkeleton
 * High-fidelity skeleton loading screen matching the Cooler Tracking Dashboard layout
 */
const AssetReportSkeleton: React.FC = () => {
  return (
    <div className="w-full min-h-full font-sans text-r-text">
      <div className="max-w-[1500px] mx-auto px-5 pt-6 pb-16">
        <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
          <div>
            <Skeleton
              variant="text"
              width={260}
              height={32}
              sx={{ borderRadius: '6px' }}
            />
            <Skeleton
              variant="text"
              width={180}
              height={20}
              sx={{ mt: 0.5, borderRadius: '4px' }}
            />
          </div>
          <div className="flex gap-2.5 items-center flex-wrap">
            <Skeleton
              variant="rounded"
              width={92}
              height={28}
              sx={{ borderRadius: '4px' }}
            />
            <Skeleton
              variant="rounded"
              width={140}
              height={28}
              sx={{ borderRadius: '4px' }}
            />
            <Skeleton
              variant="rounded"
              width={190}
              height={28}
              sx={{ borderRadius: '4px' }}
            />
            <Skeleton
              variant="rounded"
              width={28}
              height={28}
              sx={{ borderRadius: '4px' }}
            />
          </div>
        </div>

        <div className="flex gap-1.5 bg-[#F1F2F7] rounded-[5px] p-1 mb-4 w-fit">
          <Skeleton
            variant="rounded"
            width={175}
            height={29}
            sx={{ borderRadius: '5px' }}
          />
          <Skeleton
            variant="rounded"
            width={110}
            height={29}
            sx={{ borderRadius: '5px' }}
          />
          <Skeleton
            variant="rounded"
            width={160}
            height={29}
            sx={{ borderRadius: '5px' }}
          />
        </div>

        <div className="bg-r-card border border-r-border rounded-r shadow-r p-4 px-5 mb-4 flex gap-3.5 flex-wrap items-end">
          <div className="flex flex-col gap-1.5 min-w-[150px] flex-1 sm:flex-initial">
            <Skeleton variant="text" width={45} height={14} />
            <Skeleton
              variant="rounded"
              width="100%"
              height={32}
              sx={{ borderRadius: '4px' }}
            />
          </div>
          <div className="flex flex-col gap-1.5 min-w-[250px] flex-1 sm:flex-initial">
            <Skeleton variant="text" width={105} height={14} />
            <Skeleton
              variant="rounded"
              width="100%"
              height={32}
              sx={{ borderRadius: '4px' }}
            />
          </div>
          <div className="flex flex-col gap-1.5 min-w-[150px] flex-1 sm:flex-initial">
            <Skeleton variant="text" width={40} height={14} />
            <Skeleton
              variant="rounded"
              width="100%"
              height={32}
              sx={{ borderRadius: '4px' }}
            />
          </div>
          <div className="flex flex-col gap-1.5 min-w-[150px] flex-1 sm:flex-initial">
            <Skeleton variant="text" width={45} height={14} />
            <Skeleton
              variant="rounded"
              width="100%"
              height={32}
              sx={{ borderRadius: '4px' }}
            />
          </div>
          <div className="flex flex-col gap-1.5 min-w-[150px] flex-1 sm:flex-initial">
            <Skeleton variant="text" width={60} height={14} />
            <Skeleton
              variant="rounded"
              width="100%"
              height={32}
              sx={{ borderRadius: '4px' }}
            />
          </div>
          <div className="flex flex-col gap-1.5 min-w-[150px] flex-1 sm:flex-initial">
            <Skeleton variant="text" width={85} height={14} />
            <Skeleton
              variant="rounded"
              width="100%"
              height={32}
              sx={{ borderRadius: '4px' }}
            />
          </div>
          <div className="flex flex-col gap-1.5 min-w-[150px] flex-1 sm:flex-initial">
            <Skeleton variant="text" width={55} height={14} />
            <Skeleton
              variant="rounded"
              width="100%"
              height={32}
              sx={{ borderRadius: '4px' }}
            />
          </div>
          <Skeleton
            variant="rounded"
            width={95}
            height={28}
            sx={{ borderRadius: '4px' }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
          {[1, 2, 3, 4, 5].map(k => (
            <div
              key={k}
              className="bg-r-card border border-r-border rounded-r shadow-r p-5"
            >
              <div className="flex items-start justify-between mb-3.5">
                <Skeleton variant="text" width="60%" height={18} />
                <Skeleton
                  variant="rounded"
                  width={36}
                  height={36}
                  sx={{ borderRadius: '10px' }}
                />
              </div>
              <Skeleton
                variant="text"
                width="45%"
                height={38}
                sx={{ my: 0.5 }}
              />
              <Skeleton variant="text" width="75%" height={16} sx={{ mb: 2 }} />
              <Skeleton
                variant="rounded"
                width="100%"
                height={6}
                sx={{ borderRadius: '9999px' }}
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4 mb-4">
          <div className="bg-r-card border border-r-border rounded-r shadow-r p-5">
            <div className="flex justify-between items-center mb-1">
              <Skeleton variant="text" width={170} height={22} />
              <Skeleton
                variant="rounded"
                width={110}
                height={26}
                sx={{ borderRadius: '4px' }}
              />
            </div>
            <Skeleton variant="text" width={220} height={16} sx={{ mb: 3 }} />
            <div className="relative h-[230px] w-full flex items-end gap-3 pt-6 pb-2 px-3">
              {[40, 65, 55, 80, 70, 90, 85, 95, 60, 75, 88, 92].map(
                (heightPct, idx) => (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center gap-2 h-full justify-end"
                  >
                    <Skeleton
                      variant="rounded"
                      width="100%"
                      height={`${heightPct}%`}
                      sx={{ borderRadius: '4px', opacity: 0.55 }}
                    />
                    <Skeleton variant="text" width="80%" height={12} />
                  </div>
                )
              )}
            </div>
          </div>

          <div className="bg-r-card border border-r-border rounded-r shadow-r p-5">
            <Skeleton variant="text" width={180} height={22} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width={240} height={16} sx={{ mb: 3 }} />
            <div className="flex items-center gap-6 mt-4">
              <div className="w-[180px] h-[180px] shrink-0 flex items-center justify-center">
                <Skeleton variant="circular" width={170} height={170} />
              </div>
              <div className="flex flex-col gap-3 flex-1">
                {[1, 2, 3, 4, 5, 6].map(b => (
                  <div key={b} className="flex items-center gap-2.5">
                    <Skeleton
                      variant="rounded"
                      width={12}
                      height={12}
                      sx={{ borderRadius: '3px' }}
                    />
                    <Skeleton variant="text" width="70%" height={16} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {[1, 2].map(c => (
            <div
              key={c}
              className="bg-r-card border border-r-border rounded-r shadow-r p-5"
            >
              <Skeleton
                variant="text"
                width={180}
                height={22}
                sx={{ mb: 0.5 }}
              />
              <Skeleton variant="text" width={230} height={16} sx={{ mb: 3 }} />
              <div className="flex flex-col gap-3.5">
                {[1, 2, 3, 4, 5].map(item => (
                  <div key={item}>
                    <div className="flex justify-between mb-1.5">
                      <Skeleton variant="text" width="30%" height={18} />
                      <Skeleton variant="text" width="20%" height={18} />
                    </div>
                    <Skeleton
                      variant="rounded"
                      width="100%"
                      height={8}
                      sx={{ borderRadius: '9999px' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {[1, 2, 3].map(c => (
            <div
              key={c}
              className="bg-r-card border border-r-border rounded-r shadow-r p-5"
            >
              <Skeleton
                variant="text"
                width={190}
                height={22}
                sx={{ mb: 0.5 }}
              />
              <Skeleton variant="text" width={140} height={16} sx={{ mb: 3 }} />
              <div className="flex flex-col gap-3.5">
                {[1, 2, 3, 4].map(item => (
                  <div key={item}>
                    <div className="flex justify-between mb-1.5">
                      <Skeleton variant="text" width="40%" height={18} />
                      <Skeleton variant="text" width="25%" height={18} />
                    </div>
                    <Skeleton
                      variant="rounded"
                      width="100%"
                      height={8}
                      sx={{ borderRadius: '9999px' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-r-card border border-r-border rounded-r shadow-r p-5 mb-4">
          <div className="flex justify-between items-center gap-3 mb-4 flex-wrap">
            <div>
              <Skeleton variant="text" width={140} height={22} />
              <Skeleton
                variant="text"
                width={90}
                height={16}
                sx={{ mt: 0.5 }}
              />
            </div>
            <div className="flex gap-2.5 items-center flex-wrap">
              <div className="flex gap-1.5 bg-[#F1F2F7] rounded-[5px] p-1">
                {[1, 2, 3, 4, 5].map(t => (
                  <Skeleton
                    key={t}
                    variant="rounded"
                    width={80}
                    height={26}
                    sx={{ borderRadius: '5px' }}
                  />
                ))}
              </div>
              <Skeleton
                variant="rounded"
                width={200}
                height={34}
                sx={{ borderRadius: '5px' }}
              />
              <Skeleton
                variant="rounded"
                width={96}
                height={34}
                sx={{ borderRadius: '5px' }}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {[
                    'Supervisor',
                    'Zone',
                    'Route',
                    'Outlet',
                    'Category',
                    'Type',
                    'Channel',
                    'Status',
                    'Last scanned',
                    'Days since scan',
                    'Install age',
                    'Bucket',
                  ].map((_, idx) => (
                    <th
                      key={idx}
                      className="text-left p-2.5 px-3 border-b border-r-border"
                    >
                      <Skeleton
                        variant="text"
                        width={55 + (idx % 4) * 15}
                        height={14}
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(row => (
                  <tr key={row}>
                    <td className="p-[11px_12px] border-b border-r-line">
                      <Skeleton variant="text" width={80} height={18} />
                    </td>
                    <td className="p-[11px_12px] border-b border-r-line">
                      <Skeleton variant="text" width={60} height={18} />
                    </td>
                    <td className="p-[11px_12px] border-b border-r-line">
                      <Skeleton variant="text" width={75} height={18} />
                    </td>
                    <td className="p-[11px_12px] border-b border-r-line">
                      <Skeleton variant="text" width={130} height={18} />
                    </td>
                    <td className="p-[11px_12px] border-b border-r-line">
                      <Skeleton variant="text" width={65} height={18} />
                    </td>
                    <td className="p-[11px_12px] border-b border-r-line">
                      <Skeleton variant="text" width={70} height={18} />
                    </td>
                    <td className="p-[11px_12px] border-b border-r-line">
                      <Skeleton variant="text" width={55} height={18} />
                    </td>
                    <td className="p-[11px_12px] border-b border-r-line">
                      <Skeleton variant="rounded" width={68} height={24} />
                    </td>
                    <td className="p-[11px_12px] border-b border-r-line">
                      <Skeleton variant="text" width={85} height={18} />
                    </td>
                    <td className="p-[11px_12px] border-b border-r-line">
                      <Skeleton variant="text" width={35} height={18} />
                    </td>
                    <td className="p-[11px_12px] border-b border-r-line">
                      <Skeleton variant="text" width={35} height={18} />
                    </td>
                    <td className="p-[11px_12px] border-b border-r-line">
                      <Skeleton variant="rounded" width={85} height={24} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-4">
            <Skeleton variant="text" width={120} height={18} />
            <div className="flex gap-2">
              <Skeleton
                variant="rounded"
                width={75}
                height={30}
                sx={{ borderRadius: '4px' }}
              />
              <Skeleton
                variant="rounded"
                width={60}
                height={30}
                sx={{ borderRadius: '4px' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * @component AssetReport
 * Comprehensive Cooler Tracking & Asset Management Dashboard
 */
const AssetReport: React.FC = () => {
  const [dashboardData, setDashboardData] =
    useState<CoolerTrackingDashboardData>(EMPTY_DASHBOARD);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    fetchCoolerTrackingDashboard()
      .then(data => {
        if (!cancelled) {
          setDashboardData(data);
          setIsLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setLoadError(err?.message ?? 'Failed to load dashboard data');
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /** Shorthand aliases for dashboard dataset slices */
  const OM = dashboardData.outletMeta;
  const ORECORDS = dashboardData.outletRecords as OutletRecord[];
  const MM = dashboardData.masterMeta;
  const MASTER = dashboardData.masterRecords as MasterRecord[];
  const DM = dashboardData.depotMeta;
  const DRECORDS = dashboardData.depotRecords as DepotRecord[];

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeView, setActiveView] = useState<'outlet' | 'coverage' | 'depot'>(
    'outlet'
  );

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

  /**
   * Outlet View Filter States
   */
  const [fDepot, setFDepot] = useState('');
  const [fSupervisor, setFSupervisor] = useState('');
  const [fZone, setFZone] = useState('');
  const [fRoute, setFRoute] = useState('');
  const [fCategory, setFCategory] = useState('');
  const [fCustType, setFCustType] = useState('');
  const [fChannel, setFChannel] = useState('');
  const [installWindowDays, setInstallWindowDays] = useState(30);

  /**
   * Table States
   */
  const [outletActiveTab, setOutletActiveTab] = useState<
    'danger' | 'lost' | 'never' | 'flagged' | 'all'
  >('danger');
  const [outletSearch, setOutletSearch] = useState('');
  const [outletSortKey, setOutletSortKey] =
    useState<keyof OutletRecord>('days');
  const [outletSortDir, setOutletSortDir] = useState<'asc' | 'desc'>('desc');
  const [outletPage, setOutletPage] = useState(1);
  const pageSize = 25;

  /**
   * Coverage View Filter States
   */
  const [cfDepot, setCfDepot] = useState('');
  const [cfZone, setCfZone] = useState('');
  const [cfRoute, setCfRoute] = useState('');

  /**
   * Depot View Filter and Reconciliation States
   */
  const [depotZoneFilter, setDepotZoneFilter] = useState('');
  const [physicalCounts, setPhysicalCounts] = useState<Record<string, string>>(
    {}
  );
  const [depotSearch, setDepotSearch] = useState('');
  const [depotSortKey, setDepotSortKey] = useState<keyof DepotRecord>('zone');
  const [depotSortDir, setDepotSortDir] = useState<'asc' | 'desc'>('asc');
  const [depotPage, setDepotPage] = useState(1);

  /**
   * Outlet Cascading Options
   */
  const availableZones = useMemo(() => {
    return fSupervisor ? OM.supervisorZones[fSupervisor] || [] : OM.zones;
  }, [fSupervisor, OM]);

  const availableRoutes = useMemo(() => {
    return fZone ? OM.zoneRoutes[fZone] || [] : OM.routes;
  }, [fZone, OM]);

  /**
   * Filtered Outlet Records
   */
  const filteredOutletRecords = useMemo(() => {
    return ORECORDS.filter(r => {
      if (fDepot && r.depot !== fDepot) return false;
      if (fSupervisor && r.supervisor !== fSupervisor) return false;
      if (fZone && r.zone !== fZone) return false;
      if (fRoute && r.route !== fRoute) return false;
      if (fCategory && r.category !== fCategory) return false;
      if (fCustType && r.custType !== fCustType) return false;
      if (fChannel && r.channel !== fChannel) return false;
      return true;
    });
  }, [
    ORECORDS,
    fDepot,
    fSupervisor,
    fZone,
    fRoute,
    fCategory,
    fCustType,
    fChannel,
  ]);

  /**
   * Computed Outlet Metrics
   */
  const totalOutletCount = filteredOutletRecords.length;
  const freshCount = filteredOutletRecords.filter(
    r => r.days !== null && r.days <= 30
  ).length;
  const dangerCount = filteredOutletRecords.filter(r => r.danger).length;
  const lostCount = filteredOutletRecords.filter(r => r.lost).length;
  const neverCount = filteredOutletRecords.filter(r => r.days === null).length;
  const neverOverdueCount = filteredOutletRecords.filter(
    r => r.days === null && r.installDelayBucket === 'Over 90 days'
  ).length;
  const flaggedRecords = useMemo(
    () => filteredOutletRecords.filter(r => r.stale),
    [filteredOutletRecords]
  );

  const freshPct = totalOutletCount ? (freshCount / totalOutletCount) * 100 : 0;
  const dangerPct = totalOutletCount
    ? (dangerCount / totalOutletCount) * 100
    : 0;
  const lostPct = totalOutletCount ? (lostCount / totalOutletCount) * 100 : 0;
  const neverPct = totalOutletCount ? (neverCount / totalOutletCount) * 100 : 0;

  /**
   * Installation Trend Data
   */
  const trendData = useMemo(() => {
    const instMap: Record<string, number> = {};
    OM.installTrend.slice(-installWindowDays).forEach(t => {
      instMap[t.date] = 0;
    });
    filteredOutletRecords.forEach(r => {
      if (r.installDate && r.installDate in instMap) {
        instMap[r.installDate] += 1;
      }
    });
    const labels = Object.keys(instMap);
    const values = labels.map(l => instMap[l]);
    const displayLabels = labels.map(l => {
      const d = new Date(l + 'T00:00:00');
      return d.getMonth() + 1 + '/' + d.getDate();
    });
    return { displayLabels, values };
  }, [filteredOutletRecords, installWindowDays, OM]);

  /**
   * Ageing Donut Segments
   */
  const ageingSegments: DonutSegment[] = useMemo(() => {
    return bucketOrder.map(b => ({
      value: filteredOutletRecords.filter(r => r.bucket === b).length,
      color: bucketColors[b],
    }));
  }, [filteredOutletRecords]);

  /**
   * Compliance by Zone
   */
  const zoneComplianceItems: BarItem[] = useMemo(() => {
    return OM.zones
      .map(z => {
        const zr = filteredOutletRecords.filter(r => r.zone === z);
        const c = zr.filter(r => r.days !== null && r.days <= 30).length;
        const pct = zr.length ? (c / zr.length) * 100 : 0;
        return {
          label: z,
          stat: fmtPct(pct) + ' · ' + fmtNum(zr.length),
          pct,
          count: zr.length,
        };
      })
      .filter(z => (z.count || 0) > 0);
  }, [filteredOutletRecords, OM]);

  /**
   * Best and Worst Routes by Compliance
   */
  const routeComplianceItems: BarItem[] = useMemo(() => {
    const routeStats = OM.routes
      .map(rt => {
        const rr = filteredOutletRecords.filter(r => r.route === rt);
        if (!rr.length) return null;
        const c = rr.filter(r => r.days !== null && r.days <= 30).length;
        return { label: rt, pct: (c / rr.length) * 100, count: rr.length };
      })
      .filter(Boolean) as { label: string; pct: number; count: number }[];

    routeStats.sort((a, b) => b.pct - a.pct);
    const top5 = routeStats.slice(0, 5);
    const bottom5 = routeStats.slice(-5).reverse();

    return [
      ...top5.map(r => ({
        label: r.label + ' (best)',
        stat: fmtPct(r.pct) + ' · ' + fmtNum(r.count),
        pct: r.pct,
      })),
      ...bottom5.map(r => ({
        label: r.label + ' (worst)',
        stat: fmtPct(r.pct) + ' · ' + fmtNum(r.count),
        pct: r.pct,
      })),
    ];
  }, [filteredOutletRecords, OM]);

  /**
   * Danger/Lost Share Helper
   */
  const getDangerShare = (
    dim: 'category' | 'custType' | 'channel',
    values: string[]
  ): BarItem[] => {
    return values
      .map(v => {
        const vv = filteredOutletRecords.filter(r => r[dim] === v);
        if (!vv.length) return null;
        const d = vv.filter(r => r.danger).length;
        const pct = (d / vv.length) * 100;
        return {
          label: v,
          stat: fmtPct(pct) + ' · ' + fmtNum(d) + '/' + fmtNum(vv.length),
          pct,
        };
      })
      .filter(Boolean)
      .sort((a, b) => (b ? b.pct : 0) - (a ? a.pct : 0)) as BarItem[];
  };

  /**
   * Tab-Filtered and Searched Outlet Records
   */
  const tableRows = useMemo(() => {
    let rows = filteredOutletRecords;
    if (outletActiveTab === 'danger')
      rows = filteredOutletRecords.filter(r => r.danger);
    else if (outletActiveTab === 'lost')
      rows = filteredOutletRecords.filter(r => r.lost);
    else if (outletActiveTab === 'never')
      rows = filteredOutletRecords.filter(r => r.days === null);
    else if (outletActiveTab === 'flagged') rows = flaggedRecords;

    const q = outletSearch.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        r =>
          (r.outlet || '').toLowerCase().includes(q) ||
          (r.code || '').toLowerCase().includes(q) ||
          (r.route || '').toLowerCase().includes(q)
      );
    }

    return rows.slice().sort((a, b) => {
      if (outletSortKey === 'days' || outletSortKey === 'daysSinceInstall') {
        const numA = (a[outletSortKey] as number | null) ?? -1;
        const numB = (b[outletSortKey] as number | null) ?? -1;
        return outletSortDir === 'asc' ? numA - numB : numB - numA;
      }
      const strA = (a[outletSortKey] ?? '').toString().toLowerCase();
      const strB = (b[outletSortKey] ?? '').toString().toLowerCase();
      if (strA < strB) return outletSortDir === 'asc' ? -1 : 1;
      if (strA > strB) return outletSortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [
    filteredOutletRecords,
    outletActiveTab,
    flaggedRecords,
    outletSearch,
    outletSortKey,
    outletSortDir,
  ]);

  const totalOutletPages = Math.max(1, Math.ceil(tableRows.length / pageSize));
  const currentPageRows = useMemo(() => {
    const start = (outletPage - 1) * pageSize;
    return tableRows.slice(start, start + pageSize);
  }, [tableRows, outletPage]);

  /**
   * Reset Outlet Filters
   */
  const handleResetOutletFilters = () => {
    setFDepot('');
    setFSupervisor('');
    setFZone('');
    setFRoute('');
    setFCategory('');
    setFCustType('');
    setFChannel('');
    setOutletSearch('');
    setOutletPage(1);
  };

  /**
   * Export Outlet Table to Excel
   */
  const handleExportOutletTable = () => {
    const headers = [
      'Supervisor',
      'Zone',
      'Route',
      'Outlet',
      'Category',
      'Type',
      'Channel',
      'Status',
      'Last Scanned',
      'Days Since Scan',
      'Install Age (d)',
      'Bucket',
    ];
    const dataRows = tableRows.map(r => [
      r.supervisor,
      r.zone,
      r.route,
      r.outlet,
      r.category,
      r.custType,
      r.channel,
      r.status,
      r.lastScan || 'Never',
      r.days === null ? '' : r.days,
      r.daysSinceInstall === null ? '' : r.daysSinceInstall,
      r.bucket,
    ]);
    exportExcel(headers, dataRows, 'outlet_action_list');
  };

  /**
   * Coverage View Computations
   */
  const availableCovRoutes = useMemo(() => {
    return cfZone
      ? MM.zoneRoutes[cfZone] || []
      : Object.values(MM.zoneRoutes).flat();
  }, [cfZone, MM]);

  const filteredMaster = useMemo(() => {
    return MASTER.filter(r => {
      if (cfDepot && r.depot !== cfDepot) return false;
      if (cfZone && r.zone !== cfZone) return false;
      if (cfRoute && r.route !== cfRoute) return false;
      return true;
    });
  }, [MASTER, cfDepot, cfZone, cfRoute]);

  const filteredOutletForCoverage = useMemo(() => {
    return ORECORDS.filter(r => {
      if (cfDepot && r.depot.toUpperCase() !== cfDepot.toUpperCase())
        return false;
      if (cfZone && r.zone !== cfZone) return false;
      if (cfRoute && r.route !== cfRoute) return false;
      return true;
    });
  }, [ORECORDS, cfDepot, cfZone, cfRoute]);

  const covTotalOutlets = filteredMaster.length;
  const covUniqueWithCooler = new Set(
    filteredOutletForCoverage.map(r => r.code)
  ).size;
  const covCoolersIssued = filteredOutletForCoverage.length;
  const covPct = covTotalOutlets
    ? (covUniqueWithCooler / covTotalOutlets) * 100
    : 0;

  const getCoverageBars = (
    dim: 'category' | 'custType' | 'channel'
  ): BarItem[] => {
    const withCoolerByDim: Record<string, Set<string>> = {};
    filteredOutletForCoverage.forEach(r => {
      const key = r[dim] ?? 'Unknown';
      if (!withCoolerByDim[key]) withCoolerByDim[key] = new Set();
      withCoolerByDim[key].add(r.code);
    });

    const denomByDim: Record<string, number> = {};
    filteredMaster.forEach(r => {
      const key = r[dim] ?? 'Unknown';
      denomByDim[key] = (denomByDim[key] || 0) + 1;
    });

    return Object.keys(denomByDim)
      .map(k => {
        const withCooler = withCoolerByDim[k] ? withCoolerByDim[k].size : 0;
        const denom = denomByDim[k];
        const pct = denom ? (withCooler / denom) * 100 : 0;
        return {
          label: k,
          stat: fmtPct(pct) + ' · ' + fmtNum(withCooler) + '/' + fmtNum(denom),
          pct,
        };
      })
      .sort((a, b) => b.pct - a.pct);
  };

  /**
   * Depot View Computations
   */
  const filteredDepotRecords = useMemo(() => {
    return depotZoneFilter
      ? DRECORDS.filter(r => r.zone === depotZoneFilter)
      : DRECORDS;
  }, [DRECORDS, depotZoneFilter]);

  const scopedDepotZones = depotZoneFilter ? [depotZoneFilter] : DM.zones;

  const depotReconStats = useMemo(() => {
    let totalPhysical = 0;
    let anyEntered = false;
    let totalVariance = 0;

    scopedDepotZones.forEach(z => {
      const phys = physicalCounts[z];
      const sysCount = DRECORDS.filter(r => r.zone === z).length;
      if (phys !== undefined && phys !== '') {
        totalPhysical += Number(phys);
        anyEntered = true;
        totalVariance += sysCount - Number(phys);
      }
    });

    return { totalPhysical, anyEntered, totalVariance };
  }, [scopedDepotZones, physicalCounts, DRECORDS]);

  const depotVerifySegments: DonutSegment[] = useMemo(() => {
    return verifyOrder.map(v => ({
      value: filteredDepotRecords.filter(r => r.verifyBucket === v).length,
      color: verifyColors[v],
    }));
  }, [filteredDepotRecords]);

  const depotBrandSegments: DonutSegment[] = useMemo(() => {
    return DM.brands.map((b, i) => ({
      value: filteredDepotRecords.filter(r => r.brand === b).length,
      color: brandColors[i % brandColors.length],
    }));
  }, [filteredDepotRecords, DM]);

  const depotTableRows = useMemo(() => {
    let rows = filteredDepotRecords;
    const q = depotSearch.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        r =>
          (r.barcode || '').toLowerCase().includes(q) ||
          (r.serial || '').toLowerCase().includes(q) ||
          (r.brand || '').toLowerCase().includes(q) ||
          (r.subtype || '').toLowerCase().includes(q)
      );
    }

    return rows.slice().sort((a, b) => {
      const av = (a[depotSortKey] || '').toString().toLowerCase();
      const bv = (b[depotSortKey] || '').toString().toLowerCase();
      if (av < bv) return depotSortDir === 'asc' ? -1 : 1;
      if (av > bv) return depotSortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredDepotRecords, depotSearch, depotSortKey, depotSortDir]);

  const totalDepotPages = Math.max(
    1,
    Math.ceil(depotTableRows.length / pageSize)
  );
  const currentDepotPageRows = useMemo(() => {
    const start = (depotPage - 1) * pageSize;
    return depotTableRows.slice(start, start + pageSize);
  }, [depotTableRows, depotPage]);

  /**
   * Export Depot Table to Excel
   */
  const handleExportDepotTable = () => {
    const headers = [
      'Depot',
      'Serial',
      'Brand',
      'Model',
      'Verification status',
    ];
    const dataRows = depotTableRows.map(r => [
      r.zone,
      r.serial,
      r.brand,
      r.subtype,
      r.verifyBucket,
    ]);
    exportExcel(headers, dataRows, 'depot_stock');
  };

  if (isLoading) {
    return <AssetReportSkeleton />;
  }

  if (loadError) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center font-sans p-8">
        <div className="bg-[#FEF3F2] border border-[#F04438] rounded-xl p-6 max-w-lg w-full text-center">
          <p className="text-[16px] font-bold text-[#B42318] mb-1">
            Failed to load dashboard
          </p>
          <p className="text-[13px] text-[#912018]">{loadError}</p>
          <button
            onClick={() => {
              setIsLoading(true);
              setLoadError(null);
              fetchCoolerTrackingDashboard()
                .then(d => {
                  setDashboardData(d);
                  setIsLoading(false);
                })
                .catch(e => {
                  setLoadError(e?.message ?? 'Error');
                  setIsLoading(false);
                });
            }}
            className="mt-4 px-4 py-2 rounded-lg bg-[#F04438] text-white text-[13px] font-semibold hover:bg-[#D92D20] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full min-h-full font-sans text-r-text ${isFullscreen ? 'h-screen w-screen fixed inset-0 z-[9999] overflow-y-auto' : ''}`}
    >
      <div className="max-w-[1500px] mx-auto px-5 pt-6 pb-16">
        <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
          <div>
            <h1 className="text-[22px] font-bold m-0 mb-1 text-r-text">
              Cooler Tracking Dashboard
            </h1>
            <p className="text-[13px] text-r-muted m-0" id="scopeSub">
              {activeView === 'outlet' && 'Outlet scanning compliance'}
              {activeView === 'coverage' &&
                'Cooler coverage vs. total outlet universe'}
              {activeView === 'depot' &&
                'Depot-held stock & physical verification'}
            </p>
          </div>
          <div className="flex gap-2.5 items-center flex-wrap">
            <span className="text-xs font-semibold py-1 px-3 rounded-r-sm bg-r-card border border-[#CFF3E1] text-r-green flex items-center gap-1.5">
              <span className="w-[7px] h-[7px] rounded-full bg-r-green inline-block animate-r-pulse" />
              Live data
            </span>
            <span className="text-xs font-semibold py-1 px-3 rounded-r-sm bg-r-card border border-r-border text-r-muted">
              Report date: {OM.reportDate}
            </span>
            <span className="text-xs font-semibold py-1 px-3 rounded-r-sm bg-r-card border border-r-border text-r-muted">
              {OM.total.toLocaleString()} outlet coolers in scope
            </span>
            <button
              className={`inline-flex items-center justify-center w-7 h-7 p-0 rounded-r-sm border transition-all duration-200 cursor-pointer shadow-xs active:scale-95 ${
                isFullscreen
                  ? 'bg-r-blue-bg text-r-blue border-[#BFDBFE]'
                  : 'bg-r-card text-[#475467] border-r-border hover:bg-[#F8FAFC] hover:text-[#0F172A] hover:border-[#CBD5E1]'
              }`}
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
            >
              {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </button>
          </div>
        </div>

        <div
          className="flex gap-1.5 bg-[#F1F2F7] rounded-[5px] p-1 mb-4 w-fit"
          id="viewTabs"
        >
          <button
            className={`border-none text-[12.5px] font-semibold px-2.5 py-1.5 rounded-[5px] cursor-pointer whitespace-nowrap transition-all duration-200 ${
              activeView === 'outlet'
                ? 'bg-r-card text-r-text shadow-xs'
                : 'bg-transparent text-r-muted hover:text-r-text'
            }`}
            onClick={() => setActiveView('outlet')}
          >
            Outlet scanning compliance
          </button>
          <button
            className={`border-none text-[12.5px] font-semibold px-2.5 py-1.5 rounded-[5px] cursor-pointer whitespace-nowrap transition-all duration-200 ${
              activeView === 'coverage'
                ? 'bg-r-card text-r-text shadow-xs'
                : 'bg-transparent text-r-muted hover:text-r-text'
            }`}
            onClick={() => setActiveView('coverage')}
          >
            Cooler coverage
          </button>
          <button
            className={`border-none text-[12.5px] font-semibold px-2.5 py-1.5 rounded-[5px] cursor-pointer whitespace-nowrap transition-all duration-200 ${
              activeView === 'depot'
                ? 'bg-r-card text-r-text shadow-xs'
                : 'bg-transparent text-r-muted hover:text-r-text'
            }`}
            onClick={() => setActiveView('depot')}
          >
            Depot stock &amp; verification
          </button>
        </div>

        {activeView === 'outlet' && (
          <div id="outletView">
            {flaggedRecords.length > 0 && (
              <div
                className="flex gap-3 items-start bg-r-orange-bg border border-r-orange-border rounded-r p-[14px_18px] mb-4"
                id="dqBanner"
              >
                <WarningAmberOutlined
                  className="shrink-0 mt-0.5 text-r-orange-text"
                  sx={{ fontSize: 20 }}
                />
                <div>
                  <p className="text-[13px] font-bold text-r-orange-text m-0 mb-0.5">
                    Legacy last-scanned timestamps detected
                  </p>
                  <p
                    className="text-[11px] text-r-orange-text m-0 leading-relaxed"
                    id="dqText"
                  >
                    <b>{fmtNum(flaggedRecords.length)}</b> coolers in the
                    current filter show a last-scanned timestamp before 2020,
                    which looks like placeholder/legacy data rather than a
                    genuine scan gap. These inflate the danger/lost numbers
                    above until cleaned at source.{' '}
                    <a
                      className="text-r-orange-text font-bold underline cursor-pointer"
                      onClick={() => {
                        setOutletActiveTab('flagged');
                        setOutletPage(1);
                      }}
                    >
                      View flagged coolers &rarr;
                    </a>
                  </p>
                </div>
              </div>
            )}

            <div className="bg-r-card border border-r-border rounded-r shadow-r p-4 px-5 mb-4 flex gap-3.5 flex-wrap items-end">
              <div className="flex flex-col gap-1.5 min-w-[150px]">
                <label className="text-[11px] font-bold text-r-faint uppercase tracking-wider">
                  Depot
                </label>
                <Select
                  compact
                  disableClearable
                  value={fDepot}
                  onChange={e => {
                    setFDepot((e.target.value as string) || '');
                    setOutletPage(1);
                  }}
                >
                  <MenuItem value="">All depots</MenuItem>
                  {OM.depots.map(d => (
                    <MenuItem value={d} key={d}>
                      {d}
                    </MenuItem>
                  ))}
                </Select>
              </div>
              <div className="flex flex-col gap-1.5 min-w-[250px]">
                <label className="text-[11px] font-bold text-r-faint uppercase tracking-wider">
                  Zone supervisor
                </label>
                <Select
                  compact
                  disableClearable
                  value={fSupervisor}
                  onChange={e => {
                    setFSupervisor((e.target.value as string) || '');
                    setFZone('');
                    setFRoute('');
                    setOutletPage(1);
                  }}
                >
                  <MenuItem value="">All supervisors</MenuItem>
                  {OM.supervisors.map(s => (
                    <MenuItem value={s} key={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
              </div>
              <div className="flex flex-col gap-1.5 min-w-[150px]">
                <label className="text-[11px] font-bold text-r-faint uppercase tracking-wider">
                  Zone
                </label>
                <Select
                  compact
                  disableClearable
                  value={fZone}
                  onChange={e => {
                    setFZone((e.target.value as string) || '');
                    setFRoute('');
                    setOutletPage(1);
                  }}
                >
                  <MenuItem value="">All zones</MenuItem>
                  {availableZones.map(z => (
                    <MenuItem value={z} key={z}>
                      {z}
                    </MenuItem>
                  ))}
                </Select>
              </div>
              <div className="flex flex-col gap-1.5 min-w-[150px]">
                <label className="text-[11px] font-bold text-r-faint uppercase tracking-wider">
                  Route
                </label>
                <Select
                  compact
                  disableClearable
                  value={fRoute}
                  onChange={e => {
                    setFRoute((e.target.value as string) || '');
                    setOutletPage(1);
                  }}
                >
                  <MenuItem value="">All routes</MenuItem>
                  {availableRoutes.map(r => (
                    <MenuItem value={r} key={r}>
                      {r}
                    </MenuItem>
                  ))}
                </Select>
              </div>
              <div className="flex flex-col gap-1.5 min-w-[150px]">
                <label className="text-[11px] font-bold text-r-faint uppercase tracking-wider">
                  Category
                </label>
                <Select
                  compact
                  disableClearable
                  value={fCategory}
                  onChange={e => {
                    setFCategory((e.target.value as string) || '');
                    setOutletPage(1);
                  }}
                >
                  <MenuItem value="">All categories</MenuItem>
                  {OM.categories.map(c => (
                    <MenuItem value={c} key={c}>
                      {c}
                    </MenuItem>
                  ))}
                </Select>
              </div>
              <div className="flex flex-col gap-1.5 min-w-[150px]">
                <label className="text-[11px] font-bold text-r-faint uppercase tracking-wider">
                  Customer type
                </label>
                <Select
                  compact
                  disableClearable
                  value={fCustType}
                  onChange={e => {
                    setFCustType((e.target.value as string) || '');
                    setOutletPage(1);
                  }}
                >
                  <MenuItem value="">All types</MenuItem>
                  {OM.custTypes.map(ct => (
                    <MenuItem value={ct} key={ct}>
                      {ct}
                    </MenuItem>
                  ))}
                </Select>
              </div>
              <div className="flex flex-col gap-1.5 min-w-[150px]">
                <label className="text-[11px] font-bold text-r-faint uppercase tracking-wider">
                  Channel
                </label>
                <Select
                  compact
                  disableClearable
                  value={fChannel}
                  onChange={e => {
                    setFChannel((e.target.value as string) || '');
                    setOutletPage(1);
                  }}
                >
                  <MenuItem value="">All channels</MenuItem>
                  {OM.channels.map(ch => (
                    <MenuItem value={ch} key={ch}>
                      {ch}
                    </MenuItem>
                  ))}
                </Select>
              </div>
              <button
                className="border border-r-border bg-[#FBFBFD] hover:bg-r-line rounded-r-sm px-4 text-xs font-semibold text-r-muted cursor-pointer h-7 inline-flex items-center justify-center transition-colors"
                onClick={handleResetOutletFilters}
              >
                Reset filters
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
              <div className="bg-r-card border border-r-border rounded-r shadow-r p-5">
                <div className="flex items-start justify-between mb-3.5">
                  <p className="text-[13px] text-r-muted font-semibold m-0">
                    Total outlet coolers
                  </p>
                  <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 bg-r-blue-bg text-r-blue">
                    <KitchenOutlined sx={{ fontSize: 20 }} />
                  </div>
                </div>
                <p className="text-[26px] font-extrabold m-0 mb-1.5 tracking-tight text-r-text">
                  {fmtNum(totalOutletCount)}
                </p>
                <p className="text-[12.5px] font-semibold m-0 mb-3 text-r-muted">
                  {OM.zones.length} zones · {OM.routes.length} routes ·{' '}
                  {OM.supervisors.length} supervisors
                </p>
                <div className="h-1.5 rounded-full bg-r-line overflow-hidden">
                  <div className="h-full rounded-full bg-r-blue w-full" />
                </div>
              </div>

              <div className="bg-r-card border border-r-border rounded-r shadow-r p-5">
                <div className="flex items-start justify-between mb-3.5">
                  <p className="text-[13px] text-r-muted font-semibold m-0">
                    Recently scanned (0-30d)
                  </p>
                  <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 bg-r-green-bg text-r-green">
                    <CheckCircleOutlined sx={{ fontSize: 20 }} />
                  </div>
                </div>
                <p className="text-[26px] font-extrabold m-0 mb-1.5 tracking-tight text-r-text">
                  {fmtNum(freshCount)}
                </p>
                <p className="text-[12.5px] font-semibold m-0 mb-3 text-r-green">
                  {fmtPct(freshPct)} of filtered fleet
                </p>
                <div className="h-1.5 rounded-full bg-r-line overflow-hidden">
                  <div
                    className="h-full rounded-full bg-r-green transition-[width] duration-400 ease-out"
                    style={{ width: `${freshPct}%` }}
                  />
                </div>
              </div>

              <div className="bg-r-card border border-r-border rounded-r shadow-r p-5">
                <div className="flex items-start justify-between mb-3.5">
                  <p className="text-[13px] text-r-muted font-semibold m-0">
                    In danger of missing (90+d)
                  </p>
                  <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 bg-r-red-bg text-r-red">
                    <WarningAmberOutlined sx={{ fontSize: 20 }} />
                  </div>
                </div>
                <p className="text-[26px] font-extrabold m-0 mb-1.5 tracking-tight text-r-text">
                  {fmtNum(dangerCount)}
                </p>
                <p className="text-[12.5px] font-semibold m-0 mb-3 text-r-red">
                  {fmtPct(dangerPct)} of filtered fleet · previously scanned,
                  now overdue
                </p>
                <div className="h-1.5 rounded-full bg-r-line overflow-hidden">
                  <div
                    className="h-full rounded-full bg-r-red transition-[width] duration-400 ease-out"
                    style={{ width: `${dangerPct}%` }}
                  />
                </div>
              </div>

              <div className="bg-r-card border border-r-border rounded-r shadow-r p-5">
                <div className="flex items-start justify-between mb-3.5">
                  <p className="text-[13px] text-r-muted font-semibold m-0">
                    Potentially lost (180+d)
                  </p>
                  <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 bg-r-maroon-bg text-r-maroon">
                    <CancelOutlined sx={{ fontSize: 20 }} />
                  </div>
                </div>
                <p className="text-[26px] font-extrabold m-0 mb-1.5 tracking-tight text-r-text">
                  {fmtNum(lostCount)}
                </p>
                <p className="text-[12.5px] font-semibold m-0 mb-3 text-r-maroon">
                  {fmtPct(lostPct)} of filtered fleet · previously scanned, now
                  180+d stale
                </p>
                <div className="h-1.5 rounded-full bg-r-line overflow-hidden">
                  <div
                    className="h-full rounded-full bg-r-maroon transition-[width] duration-400 ease-out"
                    style={{ width: `${lostPct}%` }}
                  />
                </div>
              </div>

              <div className="bg-r-card border border-r-border rounded-r shadow-r p-5">
                <div className="flex items-start justify-between mb-3.5">
                  <p className="text-[13px] text-r-muted font-semibold m-0">
                    Never scanned (new placements)
                  </p>
                  <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 bg-r-purple-bg text-r-purple">
                    <ScheduleOutlined sx={{ fontSize: 20 }} />
                  </div>
                </div>
                <p className="text-[26px] font-extrabold m-0 mb-1.5 tracking-tight text-r-text">
                  {fmtNum(neverCount)}
                </p>
                <p className="text-[12.5px] font-semibold m-0 mb-3 text-r-purple">
                  {neverCount
                    ? neverOverdueCount
                      ? fmtNum(neverOverdueCount) +
                        ' installed 90+ days ago, still no first scan'
                      : 'all installed within the last 90 days — normal onboarding lag'
                    : 'none in current filter'}
                </p>
                <div className="h-1.5 rounded-full bg-r-line overflow-hidden">
                  <div
                    className="h-full rounded-full bg-r-purple transition-[width] duration-400 ease-out"
                    style={{ width: `${neverPct}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4 mb-4">
              <div className="bg-r-card border border-r-border rounded-r shadow-r p-5">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-[15px] font-bold m-0 text-r-text">
                    Coolers placed — trend
                  </h3>
                  <div className="min-w-0">
                    <Select
                      compact
                      disableClearable
                      value={installWindowDays}
                      onChange={e =>
                        setInstallWindowDays(
                          parseInt(e.target.value as string, 10)
                        )
                      }
                      className="!p-0"
                    >
                      <MenuItem value={30}>Last 30 days</MenuItem>
                      <MenuItem value={60}>Last 60 days</MenuItem>
                      <MenuItem value={90}>Last 90 days</MenuItem>
                    </Select>
                  </div>
                </div>
                <p className="text-xs text-r-muted m-0 mb-3.5">
                  Coolers placed by installation date, last {installWindowDays}{' '}
                  days
                </p>
                <div className="relative h-[230px]">
                  <SvgAreaChart
                    labels={trendData.displayLabels}
                    values={trendData.values}
                    color="#3B7CFF"
                    fillColor="rgba(59,124,255,0.14)"
                  />
                </div>
              </div>

              <div className="bg-r-card border border-r-border rounded-r shadow-r p-5">
                <h3 className="text-[15px] font-bold m-0 mb-1 text-r-text">
                  Coolers by ageing bucket
                </h3>
                <p className="text-xs text-r-muted m-0 mb-3.5">
                  All filtered coolers: 5 scan-ageing buckets + never-scanned
                </p>
                <div className="flex items-center gap-6 mt-4">
                  <div className="w-[180px] shrink-0">
                    <SvgDonut
                      segments={ageingSegments}
                      centerValue={fmtNum(totalOutletCount)}
                      centerLabel="coolers"
                    />
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {bucketOrder.map((b, i) => (
                      <div
                        className="flex items-center gap-1.5 text-[11.5px] text-r-muted font-semibold"
                        key={b}
                      >
                        <span
                          className="w-[9px] h-[9px] rounded-[3px] shrink-0"
                          style={{ background: bucketColors[b] }}
                        />
                        {b} · {fmtNum(ageingSegments[i].value)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-r-card border border-r-border rounded-r shadow-r p-5">
                <h3 className="text-[15px] font-bold m-0 mb-1 text-r-text">
                  Compliance by zone
                </h3>
                <p className="text-xs text-r-muted m-0 mb-3.5">
                  Share of coolers scanned within the last 30 days
                </p>
                <BarList
                  items={zoneComplianceItems}
                  colorFn={() => '#3B7CFF'}
                />
              </div>
              <div className="bg-r-card border border-r-border rounded-r shadow-r p-5">
                <h3 className="text-[15px] font-bold m-0 mb-1 text-r-text">
                  Top &amp; bottom routes by compliance
                </h3>
                <p className="text-xs text-r-muted m-0 mb-3.5">
                  5 best and 5 worst routes (share scanned within 30 days)
                </p>
                <BarList
                  items={routeComplianceItems}
                  colorFn={it =>
                    it.label.includes('(best)') ? '#12B76A' : '#F04438'
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-r-card border border-r-border rounded-r shadow-r p-5">
                <h3 className="text-[15px] font-bold m-0 mb-1 text-r-text">
                  Danger/lost share by category
                </h3>
                <p className="text-xs text-r-muted m-0 mb-3.5">
                  Coolers 90+ days overdue
                </p>
                <BarList
                  items={getDangerShare('category', OM.categories)}
                  colorFn={() => '#F79009'}
                />
              </div>
              <div className="bg-r-card border border-r-border rounded-r shadow-r p-5">
                <h3 className="text-[15px] font-bold m-0 mb-1 text-r-text">
                  Danger/lost share by customer type
                </h3>
                <p className="text-xs text-r-muted m-0 mb-3.5">
                  Coolers 90+ days overdue
                </p>
                <BarList
                  items={getDangerShare('custType', OM.custTypes)}
                  colorFn={() => '#F79009'}
                />
              </div>
              <div className="bg-r-card border border-r-border rounded-r shadow-r p-5">
                <h3 className="text-[15px] font-bold m-0 mb-1 text-r-text">
                  Danger/lost share by channel
                </h3>
                <p className="text-xs text-r-muted m-0 mb-3.5">
                  Coolers 90+ days overdue
                </p>
                <BarList
                  items={getDangerShare('channel', OM.channels)}
                  colorFn={() => '#F79009'}
                />
              </div>
            </div>

            <div className="bg-r-card border border-r-border rounded-r shadow-r p-5 mb-4">
              <div className="flex justify-between items-center gap-3 mb-3.5 flex-wrap">
                <div>
                  <h3 className="text-[15px] font-bold m-0 text-r-text">
                    Cooler detail list
                  </h3>
                  <p className="m-0 mt-0.5 text-xs text-r-muted">
                    {fmtNum(tableRows.length)} coolers
                  </p>
                </div>
                <div className="flex gap-2.5 items-center flex-wrap">
                  <div className="flex gap-1.5 bg-[#F1F2F7] rounded-[5px] p-1">
                    <button
                      className={`border-none text-[12.5px] font-semibold px-2.5 py-1.5 rounded-[5px] cursor-pointer whitespace-nowrap transition-all duration-200 ${outletActiveTab === 'danger' ? 'bg-r-card text-r-text shadow-xs' : 'bg-transparent text-r-muted hover:text-r-text'}`}
                      onClick={() => {
                        setOutletActiveTab('danger');
                        setOutletPage(1);
                      }}
                    >
                      In danger (90+d)
                    </button>
                    <button
                      className={`border-none text-[12.5px] font-semibold px-2.5 py-1.5 rounded-[5px] cursor-pointer whitespace-nowrap transition-all duration-200 ${outletActiveTab === 'lost' ? 'bg-r-card text-r-text shadow-xs' : 'bg-transparent text-r-muted hover:text-r-text'}`}
                      onClick={() => {
                        setOutletActiveTab('lost');
                        setOutletPage(1);
                      }}
                    >
                      Potentially lost (180+d)
                    </button>
                    <button
                      className={`border-none text-[12.5px] font-semibold px-2.5 py-1.5 rounded-[5px] cursor-pointer whitespace-nowrap transition-all duration-200 ${outletActiveTab === 'never' ? 'bg-r-card text-r-text shadow-xs' : 'bg-transparent text-r-muted hover:text-r-text'}`}
                      onClick={() => {
                        setOutletActiveTab('never');
                        setOutletPage(1);
                      }}
                    >
                      Never scanned
                    </button>
                    <button
                      className={`border-none text-[12.5px] font-semibold px-2.5 py-1.5 rounded-[5px] cursor-pointer whitespace-nowrap transition-all duration-200 ${outletActiveTab === 'flagged' ? 'bg-r-card text-r-text shadow-xs' : 'bg-transparent text-r-muted hover:text-r-text'}`}
                      onClick={() => {
                        setOutletActiveTab('flagged');
                        setOutletPage(1);
                      }}
                    >
                      Flagged dates
                    </button>
                    <button
                      className={`border-none text-[12.5px] font-semibold px-2.5 py-1.5 rounded-[5px] cursor-pointer whitespace-nowrap transition-all duration-200 ${outletActiveTab === 'all' ? 'bg-r-card text-r-text shadow-xs' : 'bg-transparent text-r-muted hover:text-r-text'}`}
                      onClick={() => {
                        setOutletActiveTab('all');
                        setOutletPage(1);
                      }}
                    >
                      All coolers
                    </button>
                  </div>
                  <input
                    type="text"
                    value={outletSearch}
                    onChange={e => {
                      setOutletSearch(e.target.value);
                      setOutletPage(1);
                    }}
                    placeholder="Search outlet, code, route..."
                    className="border border-r-border rounded-[5px] px-3 py-2 text-[13px] bg-[#FBFBFD] focus:border-r-blue outline-none w-[200px]"
                  />
                  <button
                    className="border border-r-border bg-[#FBFBFD] hover:bg-r-line rounded-[5px] px-3.5 py-2 text-[12.5px] font-bold text-r-text cursor-pointer transition-colors"
                    onClick={handleExportOutletTable}
                  >
                    Export Excel
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr>
                      <th
                        className="text-left text-[11px] font-bold uppercase tracking-wider text-r-faint p-2.5 px-3 border-b border-r-border cursor-pointer whitespace-nowrap select-none hover:text-r-text"
                        onClick={() => {
                          setOutletSortKey('supervisor');
                          setOutletSortDir(
                            outletSortKey === 'supervisor' &&
                              outletSortDir === 'asc'
                              ? 'desc'
                              : 'asc'
                          );
                          setOutletPage(1);
                        }}
                      >
                        Supervisor
                      </th>
                      <th
                        className="text-left text-[11px] font-bold uppercase tracking-wider text-r-faint p-2.5 px-3 border-b border-r-border cursor-pointer whitespace-nowrap select-none hover:text-r-text"
                        onClick={() => {
                          setOutletSortKey('zone');
                          setOutletSortDir(
                            outletSortKey === 'zone' && outletSortDir === 'asc'
                              ? 'desc'
                              : 'asc'
                          );
                          setOutletPage(1);
                        }}
                      >
                        Zone
                      </th>
                      <th
                        className="text-left text-[11px] font-bold uppercase tracking-wider text-r-faint p-2.5 px-3 border-b border-r-border cursor-pointer whitespace-nowrap select-none hover:text-r-text"
                        onClick={() => {
                          setOutletSortKey('route');
                          setOutletSortDir(
                            outletSortKey === 'route' && outletSortDir === 'asc'
                              ? 'desc'
                              : 'asc'
                          );
                          setOutletPage(1);
                        }}
                      >
                        Route
                      </th>
                      <th
                        className="text-left text-[11px] font-bold uppercase tracking-wider text-r-faint p-2.5 px-3 border-b border-r-border cursor-pointer whitespace-nowrap select-none hover:text-r-text"
                        onClick={() => {
                          setOutletSortKey('outlet');
                          setOutletSortDir(
                            outletSortKey === 'outlet' &&
                              outletSortDir === 'asc'
                              ? 'desc'
                              : 'asc'
                          );
                          setOutletPage(1);
                        }}
                      >
                        Outlet
                      </th>
                      <th
                        className="text-left text-[11px] font-bold uppercase tracking-wider text-r-faint p-2.5 px-3 border-b border-r-border cursor-pointer whitespace-nowrap select-none hover:text-r-text"
                        onClick={() => {
                          setOutletSortKey('category');
                          setOutletSortDir(
                            outletSortKey === 'category' &&
                              outletSortDir === 'asc'
                              ? 'desc'
                              : 'asc'
                          );
                          setOutletPage(1);
                        }}
                      >
                        Category
                      </th>
                      <th
                        className="text-left text-[11px] font-bold uppercase tracking-wider text-r-faint p-2.5 px-3 border-b border-r-border cursor-pointer whitespace-nowrap select-none hover:text-r-text"
                        onClick={() => {
                          setOutletSortKey('custType');
                          setOutletSortDir(
                            outletSortKey === 'custType' &&
                              outletSortDir === 'asc'
                              ? 'desc'
                              : 'asc'
                          );
                          setOutletPage(1);
                        }}
                      >
                        Type
                      </th>
                      <th
                        className="text-left text-[11px] font-bold uppercase tracking-wider text-r-faint p-2.5 px-3 border-b border-r-border cursor-pointer whitespace-nowrap select-none hover:text-r-text"
                        onClick={() => {
                          setOutletSortKey('channel');
                          setOutletSortDir(
                            outletSortKey === 'channel' &&
                              outletSortDir === 'asc'
                              ? 'desc'
                              : 'asc'
                          );
                          setOutletPage(1);
                        }}
                      >
                        Channel
                      </th>
                      <th
                        className="text-left text-[11px] font-bold uppercase tracking-wider text-r-faint p-2.5 px-3 border-b border-r-border cursor-pointer whitespace-nowrap select-none hover:text-r-text"
                        onClick={() => {
                          setOutletSortKey('status');
                          setOutletSortDir(
                            outletSortKey === 'status' &&
                              outletSortDir === 'asc'
                              ? 'desc'
                              : 'asc'
                          );
                          setOutletPage(1);
                        }}
                      >
                        Status
                      </th>
                      <th
                        className="text-left text-[11px] font-bold uppercase tracking-wider text-r-faint p-2.5 px-3 border-b border-r-border cursor-pointer whitespace-nowrap select-none hover:text-r-text"
                        onClick={() => {
                          setOutletSortKey('lastScan');
                          setOutletSortDir(
                            outletSortKey === 'lastScan' &&
                              outletSortDir === 'asc'
                              ? 'desc'
                              : 'asc'
                          );
                          setOutletPage(1);
                        }}
                      >
                        Last scanned
                      </th>
                      <th
                        className="text-left text-[11px] font-bold uppercase tracking-wider text-r-faint p-2.5 px-3 border-b border-r-border cursor-pointer whitespace-nowrap select-none hover:text-r-text"
                        onClick={() => {
                          setOutletSortKey('days');
                          setOutletSortDir(
                            outletSortKey === 'days' && outletSortDir === 'asc'
                              ? 'desc'
                              : 'asc'
                          );
                          setOutletPage(1);
                        }}
                      >
                        Days since scan
                      </th>
                      <th
                        className="text-left text-[11px] font-bold uppercase tracking-wider text-r-faint p-2.5 px-3 border-b border-r-border cursor-pointer whitespace-nowrap select-none hover:text-r-text"
                        onClick={() => {
                          setOutletSortKey('daysSinceInstall');
                          setOutletSortDir(
                            outletSortKey === 'daysSinceInstall' &&
                              outletSortDir === 'asc'
                              ? 'desc'
                              : 'asc'
                          );
                          setOutletPage(1);
                        }}
                      >
                        Install age
                      </th>
                      <th
                        className="text-left text-[11px] font-bold uppercase tracking-wider text-r-faint p-2.5 px-3 border-b border-r-border cursor-pointer whitespace-nowrap select-none hover:text-r-text"
                        onClick={() => {
                          setOutletSortKey('bucket');
                          setOutletSortDir(
                            outletSortKey === 'bucket' &&
                              outletSortDir === 'asc'
                              ? 'desc'
                              : 'asc'
                          );
                          setOutletPage(1);
                        }}
                      >
                        Bucket
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPageRows.length ? (
                      currentPageRows.map((r, idx) => {
                        return (
                          <tr
                            key={idx}
                            className="hover:bg-[#FAFBFD] transition-colors"
                          >
                            <td className="p-[11px_12px] border-b border-r-line text-r-text whitespace-nowrap">
                              {r.supervisor}
                            </td>
                            <td className="p-[11px_12px] border-b border-r-line text-r-text whitespace-nowrap">
                              {r.zone}
                            </td>
                            <td className="p-[11px_12px] border-b border-r-line text-r-text whitespace-nowrap">
                              {r.route}
                            </td>
                            <td className="p-[11px_12px] border-b border-r-line text-r-text whitespace-nowrap">
                              {r.outlet}
                            </td>
                            <td className="p-[11px_12px] border-b border-r-line text-r-text whitespace-nowrap">
                              {r.category}
                            </td>
                            <td className="p-[11px_12px] border-b border-r-line text-r-text whitespace-nowrap">
                              {r.custType}
                            </td>
                            <td className="p-[11px_12px] border-b border-r-line text-r-text whitespace-nowrap">
                              {r.channel}
                            </td>
                            <td className="p-[11px_12px] border-b border-r-line text-r-text whitespace-nowrap">
                              <Chip
                                label={r.status}
                                size="small"
                                color={
                                  r.status === 'Working' ? 'success' : 'error'
                                }
                              />
                            </td>
                            <td className="p-[11px_12px] border-b border-r-line text-r-text whitespace-nowrap">
                              {r.lastScan || 'Never'}
                            </td>
                            <td className="p-[11px_12px] border-b border-r-line text-r-text whitespace-nowrap">
                              {r.days === null ? '—' : r.days}
                            </td>
                            <td className="p-[11px_12px] border-b border-r-line text-r-text whitespace-nowrap">
                              {r.daysSinceInstall === null
                                ? '—'
                                : `${r.daysSinceInstall}d`}
                            </td>
                            <td className="p-[11px_12px] border-b border-r-line text-r-text whitespace-nowrap">
                              <Chip
                                label={r.bucket}
                                size="small"
                                color={getBucketChipColor(r.bucket)}
                              />
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={12}
                          className="text-center text-r-muted py-8"
                        >
                          No coolers match the current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center mt-3.5 text-[12.5px] text-r-muted">
                <span>
                  Page {outletPage} of {totalOutletPages}
                </span>
                <div className="flex gap-1.5">
                  <button
                    className="border border-r-border bg-[#FBFBFD] hover:not-disabled:bg-r-line disabled:opacity-40 disabled:cursor-default rounded px-3 py-1.5 text-[12.5px] font-semibold text-r-text cursor-pointer transition-colors"
                    disabled={outletPage <= 1}
                    onClick={() => setOutletPage(p => Math.max(1, p - 1))}
                  >
                    Previous
                  </button>
                  <button
                    className="border border-r-border bg-[#FBFBFD] hover:not-disabled:bg-r-line disabled:opacity-40 disabled:cursor-default rounded px-3 py-1.5 text-[12.5px] font-semibold text-r-text cursor-pointer transition-colors"
                    disabled={outletPage >= totalOutletPages}
                    onClick={() =>
                      setOutletPage(p => Math.min(totalOutletPages, p + 1))
                    }
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'coverage' && (
          <div id="coverageView">
            <div className="bg-r-card border border-r-border rounded-r shadow-r p-4 px-5 mb-4 flex gap-3.5 flex-wrap items-end">
              <div className="flex flex-col gap-1.5 min-w-[150px]">
                <label className="text-[11px] font-bold text-r-faint uppercase tracking-wider">
                  Depot
                </label>
                <Select
                  compact
                  disableClearable
                  value={cfDepot}
                  onChange={e => setCfDepot((e.target.value as string) || '')}
                >
                  <MenuItem value="">All depots</MenuItem>
                  {MM.depots.map(d => (
                    <MenuItem value={d} key={d}>
                      {d}
                    </MenuItem>
                  ))}
                </Select>
              </div>
              <div className="flex flex-col gap-1.5 min-w-[150px]">
                <label className="text-[11px] font-bold text-r-faint uppercase tracking-wider">
                  Zone
                </label>
                <Select
                  compact
                  disableClearable
                  value={cfZone}
                  onChange={e => {
                    setCfZone((e.target.value as string) || '');
                    setCfRoute('');
                  }}
                >
                  <MenuItem value="">All zones</MenuItem>
                  {MM.zones.map(z => (
                    <MenuItem value={z} key={z}>
                      {z}
                    </MenuItem>
                  ))}
                </Select>
              </div>
              <div className="flex flex-col gap-1.5 min-w-[150px]">
                <label className="text-[11px] font-bold text-r-faint uppercase tracking-wider">
                  Route
                </label>
                <Select
                  compact
                  disableClearable
                  value={cfRoute}
                  onChange={e => setCfRoute((e.target.value as string) || '')}
                >
                  <MenuItem value="">All routes</MenuItem>
                  {availableCovRoutes.map(r => (
                    <MenuItem value={r} key={r}>
                      {r}
                    </MenuItem>
                  ))}
                </Select>
              </div>
              <button
                className="border border-r-border bg-[#FBFBFD] hover:bg-r-line rounded-r-sm px-4 text-xs font-semibold text-r-muted cursor-pointer h-7 inline-flex items-center justify-center transition-colors"
                onClick={() => {
                  setCfDepot('');
                  setCfZone('');
                  setCfRoute('');
                }}
              >
                Reset filters
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-r-card border border-r-border rounded-r shadow-r p-5">
                <div className="flex items-start justify-between mb-3.5">
                  <p className="text-[13px] text-r-muted font-semibold m-0">
                    Total outlets (all, master list)
                  </p>
                  <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 bg-r-blue-bg text-r-blue">
                    <StorefrontOutlined sx={{ fontSize: 20 }} />
                  </div>
                </div>
                <p className="text-[26px] font-extrabold m-0 mb-1.5 tracking-tight text-r-text">
                  {fmtNum(covTotalOutlets)}
                </p>
                <p className="text-[12.5px] font-semibold m-0 mb-3 text-r-muted">
                  From Outlet Master, active outlets
                </p>
                <div className="h-1.5 rounded-full bg-r-line overflow-hidden">
                  <div className="h-full rounded-full bg-r-blue w-full" />
                </div>
              </div>

              <div className="bg-r-card border border-r-border rounded-r shadow-r p-5">
                <div className="flex items-start justify-between mb-3.5">
                  <p className="text-[13px] text-r-muted font-semibold m-0">
                    Outlets with a cooler
                  </p>
                  <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 bg-r-green-bg text-r-green">
                    <CheckCircleOutlined sx={{ fontSize: 20 }} />
                  </div>
                </div>
                <p className="text-[26px] font-extrabold m-0 mb-1.5 tracking-tight text-r-text">
                  {fmtNum(covUniqueWithCooler)}
                </p>
                <p className="text-[12.5px] font-semibold m-0 mb-3 text-r-green">
                  {fmtPct(covPct)} of outlets in current filter
                </p>
                <div className="h-1.5 rounded-full bg-r-line overflow-hidden">
                  <div
                    className="h-full rounded-full bg-r-green transition-[width] duration-400 ease-out"
                    style={{ width: `${covPct}%` }}
                  />
                </div>
              </div>

              <div className="bg-r-card border border-r-border rounded-r shadow-r p-5">
                <div className="flex items-start justify-between mb-3.5">
                  <p className="text-[13px] text-r-muted font-semibold m-0">
                    Coolers issued
                  </p>
                  <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 bg-r-purple-bg text-r-purple">
                    <KitchenOutlined sx={{ fontSize: 20 }} />
                  </div>
                </div>
                <p className="text-[26px] font-extrabold m-0 mb-1.5 tracking-tight text-r-text">
                  {fmtNum(covCoolersIssued)}
                </p>
                <p className="text-[12.5px] font-semibold m-0 mb-3 text-r-muted">
                  {fmtNum(covCoolersIssued - covUniqueWithCooler)} outlets hold
                  2+ units
                </p>
                <div className="h-1.5 rounded-full bg-r-line overflow-hidden">
                  <div className="h-full rounded-full bg-r-purple w-full" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-r-card border border-r-border rounded-r shadow-r p-5">
                <h3 className="text-[15px] font-bold m-0 mb-1 text-r-text">
                  Coverage by category
                </h3>
                <p className="text-xs text-r-muted m-0 mb-3.5">
                  Outlets with a cooler &divide; total outlets in category
                </p>
                <BarList
                  items={getCoverageBars('category')}
                  colorFn={() => '#3B7CFF'}
                />
              </div>
              <div className="bg-r-card border border-r-border rounded-r shadow-r p-5">
                <h3 className="text-[15px] font-bold m-0 mb-1 text-r-text">
                  Coverage by customer type
                </h3>
                <p className="text-xs text-r-muted m-0 mb-3.5">
                  Outlets with a cooler &divide; total outlets of that type
                </p>
                <BarList
                  items={getCoverageBars('custType')}
                  colorFn={() => '#7A5CFA'}
                />
              </div>
              <div className="bg-r-card border border-r-border rounded-r shadow-r p-5">
                <h3 className="text-[15px] font-bold m-0 mb-1 text-r-text">
                  Coverage by channel
                </h3>
                <p className="text-xs text-r-muted m-0 mb-3.5">
                  Outlets with a cooler &divide; total outlets on that channel
                </p>
                <BarList
                  items={getCoverageBars('channel')}
                  colorFn={() => '#EE46BC'}
                />
              </div>
            </div>
            <p className="text-xs text-r-muted px-1">
              Note: an outlet with more than one cooler is still counted once
              here (outlet-level coverage). Coolers-issued counts above are
              cooler-level (some outlets hold 2+ units).
            </p>
          </div>
        )}

        {activeView === 'depot' && (
          <div id="depotView">
            <div className="bg-r-card border border-r-border rounded-r shadow-r p-4 px-5 mb-4 flex gap-3.5 flex-wrap items-end">
              <div className="flex flex-col gap-1.5 min-w-[150px]">
                <label className="text-[11px] font-bold text-r-faint uppercase tracking-wider">
                  Depot
                </label>
                <Select
                  compact
                  disableClearable
                  value={depotZoneFilter}
                  onChange={e => {
                    setDepotZoneFilter((e.target.value as string) || '');
                    setDepotPage(1);
                  }}
                >
                  <MenuItem value="">All depots</MenuItem>
                  {DM.zones.map(z => (
                    <MenuItem value={z} key={z}>
                      {z}
                    </MenuItem>
                  ))}
                </Select>
              </div>
              <button
                className="border border-r-border bg-[#FBFBFD] hover:bg-r-line rounded-r-sm px-4 text-xs font-semibold text-r-muted cursor-pointer h-7 inline-flex items-center justify-center transition-colors"
                onClick={() => {
                  setDepotZoneFilter('');
                  setDepotPage(1);
                }}
              >
                Reset filter
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-r-card border border-r-border rounded-r shadow-r p-5">
                <div className="flex items-start justify-between mb-3.5">
                  <p className="text-[13px] text-r-muted font-semibold m-0">
                    Total depot stock (system)
                  </p>
                  <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 bg-r-blue-bg text-r-blue">
                    <WarehouseOutlined sx={{ fontSize: 20 }} />
                  </div>
                </div>
                <p className="text-[26px] font-extrabold m-0 mb-1.5 tracking-tight text-r-text">
                  {fmtNum(filteredDepotRecords.length)}
                </p>
                <p className="text-[12.5px] font-semibold m-0 mb-3 text-r-muted">
                  {depotZoneFilter
                    ? depotZoneFilter
                    : `${DM.zones.length} depots · ${DM.brands.length} brands`}
                </p>
                <div className="h-1.5 rounded-full bg-r-line overflow-hidden">
                  <div className="h-full rounded-full bg-r-blue w-full" />
                </div>
              </div>

              <div className="bg-r-card border border-r-border rounded-r shadow-r p-5">
                <div className="flex items-start justify-between mb-3.5">
                  <p className="text-[13px] text-r-muted font-semibold m-0">
                    Physical count entered
                  </p>
                  <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 bg-r-green-bg text-r-green">
                    <CheckCircleOutlined sx={{ fontSize: 20 }} />
                  </div>
                </div>
                <p className="text-[26px] font-extrabold m-0 mb-1.5 tracking-tight text-r-text">
                  {depotReconStats.anyEntered
                    ? fmtNum(depotReconStats.totalPhysical)
                    : '—'}
                </p>
                <p className="text-[12.5px] font-semibold m-0 mb-3 text-r-muted">
                  {depotReconStats.anyEntered
                    ? fmtPct(
                        (depotReconStats.totalPhysical /
                          (filteredDepotRecords.length || 1)) *
                          100
                      ) + ' of system stock counted so far'
                    : 'Enter counts in the table below'}
                </p>
                <div className="h-1.5 rounded-full bg-r-line overflow-hidden">
                  <div
                    className="h-full rounded-full bg-r-green transition-[width] duration-400 ease-out"
                    style={{
                      width: depotReconStats.anyEntered
                        ? `${Math.min(100, (depotReconStats.totalPhysical / (filteredDepotRecords.length || 1)) * 100)}%`
                        : '0%',
                    }}
                  />
                </div>
              </div>

              <div className="bg-r-card border border-r-border rounded-r shadow-r p-5">
                <div className="flex items-start justify-between mb-3.5">
                  <p className="text-[13px] text-r-muted font-semibold m-0">
                    Net variance
                  </p>
                  <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 bg-r-red-bg text-r-red">
                    <WarningAmberOutlined sx={{ fontSize: 20 }} />
                  </div>
                </div>
                <p className="text-[26px] font-extrabold m-0 mb-1.5 tracking-tight text-r-text">
                  {depotReconStats.anyEntered
                    ? fmtSigned(depotReconStats.totalVariance)
                    : '—'}
                </p>
                <p className="text-[12.5px] font-semibold m-0 mb-3 text-r-muted">
                  {depotReconStats.anyEntered
                    ? depotReconStats.totalVariance === 0
                      ? 'All counted depots reconcile'
                      : depotReconStats.totalVariance > 0
                        ? 'System ahead of physical — investigate shortage'
                        : 'Physical ahead of system — investigate surplus'
                    : 'System minus physical, all depots'}
                </p>
                <div className="h-1.5 rounded-full bg-r-line overflow-hidden">
                  <div
                    className="h-full rounded-full bg-r-red transition-[width] duration-400 ease-out"
                    style={{
                      width: depotReconStats.anyEntered
                        ? `${Math.min(100, (Math.abs(depotReconStats.totalVariance) / Math.max(1, filteredDepotRecords.length)) * 400)}%`
                        : '0%',
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-r-card border border-r-border rounded-r shadow-r p-5 mb-4">
              <div className="flex justify-between items-center gap-3 mb-3.5 flex-wrap">
                <div>
                  <h3 className="text-[15px] font-bold m-0 text-r-text">
                    Stock reconciliation by depot
                  </h3>
                  <p className="m-0 mt-0.5 text-xs text-r-muted">
                    System count vs a physical count you enter here (session
                    only — see developer notes)
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr>
                      <th className="text-left text-[11px] font-bold uppercase tracking-wider text-r-faint p-2.5 px-3 border-b border-r-border cursor-pointer whitespace-nowrap select-none hover:text-r-text">
                        Depot
                      </th>
                      <th className="text-left text-[11px] font-bold uppercase tracking-wider text-r-faint p-2.5 px-3 border-b border-r-border cursor-pointer whitespace-nowrap select-none hover:text-r-text">
                        System count
                      </th>
                      <th className="text-left text-[11px] font-bold uppercase tracking-wider text-r-faint p-2.5 px-3 border-b border-r-border cursor-pointer whitespace-nowrap select-none hover:text-r-text">
                        Physical count
                      </th>
                      <th className="text-left text-[11px] font-bold uppercase tracking-wider text-r-faint p-2.5 px-3 border-b border-r-border cursor-pointer whitespace-nowrap select-none hover:text-r-text">
                        Variance
                      </th>
                      <th className="text-left text-[11px] font-bold uppercase tracking-wider text-r-faint p-2.5 px-3 border-b border-r-border cursor-pointer whitespace-nowrap select-none hover:text-r-text">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {scopedDepotZones.map(z => {
                      const sysCount = DRECORDS.filter(
                        r => r.zone === z
                      ).length;
                      const phys = physicalCounts[z];
                      const hasVal = phys !== undefined && phys !== '';
                      const variance = hasVal ? sysCount - Number(phys) : null;

                      let statusBadge = (
                        <Chip
                          label="Not counted"
                          size="small"
                          sx={{
                            backgroundColor: '#F1F2F7',
                            color: '#475467',
                            fontWeight: 'bold',
                            fontSize: '11.5px',
                            height: '22px',
                            '& .MuiChip-label': { px: 1.25, py: 0.25 },
                          }}
                        />
                      );
                      if (variance === 0) {
                        statusBadge = (
                          <Chip
                            label="Match"
                            size="small"
                            color="success"
                            sx={{
                              fontWeight: 'bold',
                              fontSize: '11.5px',
                              height: '22px',
                              '& .MuiChip-label': { px: 1.25, py: 0.25 },
                            }}
                          />
                        );
                      } else if (variance !== null && variance > 0) {
                        statusBadge = (
                          <Chip
                            label={`Shortage of ${variance}`}
                            size="small"
                            color="error"
                            sx={{
                              fontWeight: 'bold',
                              fontSize: '11.5px',
                              height: '22px',
                              '& .MuiChip-label': { px: 1.25, py: 0.25 },
                            }}
                          />
                        );
                      } else if (variance !== null && variance < 0) {
                        statusBadge = (
                          <Chip
                            label={`Surplus of ${Math.abs(variance)}`}
                            size="small"
                            color="warning"
                            sx={{
                              fontWeight: 'bold',
                              fontSize: '11.5px',
                              height: '22px',
                              '& .MuiChip-label': { px: 1.25, py: 0.25 },
                            }}
                          />
                        );
                      }

                      return (
                        <tr
                          key={z}
                          className="hover:bg-[#FAFBFD] transition-colors"
                        >
                          <td className="p-[11px_12px] border-b border-r-line text-r-text whitespace-nowrap">
                            <b>{z}</b>
                          </td>
                          <td className="p-[11px_12px] border-b border-r-line text-r-text whitespace-nowrap">
                            {fmtNum(sysCount)}
                          </td>
                          <td className="p-[11px_12px] border-b border-r-line text-r-text whitespace-nowrap">
                            <input
                              type="number"
                              min="0"
                              className="w-[100px] border border-r-border rounded px-2.5 py-1.5 text-[13px] outline-none focus:border-r-blue"
                              value={phys !== undefined ? phys : ''}
                              placeholder="Enter count"
                              onChange={e => {
                                const val = e.target.value;
                                setPhysicalCounts(prev => ({
                                  ...prev,
                                  [z]: val,
                                }));
                              }}
                            />
                          </td>
                          <td className="p-[11px_12px] border-b border-r-line text-r-text whitespace-nowrap">
                            {variance === null ? '—' : fmtSigned(variance)}
                          </td>
                          <td className="p-[11px_12px] border-b border-r-line text-r-text whitespace-nowrap">
                            {statusBadge}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-r-card border border-r-border rounded-r shadow-r p-5">
                <h3 className="text-[15px] font-bold m-0 mb-1 text-r-text">
                  Physical verification status
                </h3>
                <p className="text-xs text-r-muted m-0 mb-3.5">
                  Physical verification status based on asset scanning and
                  verification records
                </p>
                <div className="flex items-center gap-6 sm:gap-8 flex-wrap sm:flex-nowrap">
                  <SvgDonut
                    segments={depotVerifySegments}
                    centerValue={fmtNum(filteredDepotRecords.length)}
                    centerLabel="items"
                  />
                  <div className="flex flex-col items-start gap-2.5">
                    {verifyOrder.map((v, i) => (
                      <div
                        className="flex items-center gap-2 text-[12px] text-r-muted font-medium whitespace-nowrap"
                        key={v}
                      >
                        <span
                          className="w-[9px] h-[9px] rounded-[3px] shrink-0"
                          style={{ background: verifyColors[v] }}
                        />
                        {v} &middot; {fmtNum(depotVerifySegments[i].value)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-r-card border border-r-border rounded-r shadow-r p-5">
                <h3 className="text-[15px] font-bold m-0 mb-1 text-r-text">
                  Depot stock by brand
                </h3>
                <p className="text-xs text-r-muted m-0 mb-3.5">
                  System count, all depots
                </p>
                <div className="flex items-center gap-6 sm:gap-8 flex-wrap sm:flex-nowrap">
                  <SvgDonut
                    segments={depotBrandSegments}
                    centerValue={fmtNum(filteredDepotRecords.length)}
                    centerLabel="coolers"
                  />
                  <div className="flex flex-col items-start gap-2.5">
                    {DM.brands.map((b, i) => (
                      <div
                        className="flex items-center gap-2 text-[12px] text-r-muted font-medium whitespace-nowrap"
                        key={b}
                      >
                        <span
                          className="w-[9px] h-[9px] rounded-[3px] shrink-0"
                          style={{
                            background: brandColors[i % brandColors.length],
                          }}
                        />
                        {b} &middot; {fmtNum(depotBrandSegments[i].value)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-r-card border border-r-border rounded-r shadow-r p-5 mb-4">
              <div className="flex justify-between items-center gap-3 mb-3.5 flex-wrap">
                <div>
                  <h3 className="text-[15px] font-bold m-0 text-r-text">
                    Depot stock detail
                  </h3>
                  <p className="m-0 mt-0.5 text-xs text-r-muted">
                    {fmtNum(depotTableRows.length)} items
                  </p>
                </div>
                <div className="flex gap-2.5 items-center flex-wrap">
                  <input
                    type="text"
                    value={depotSearch}
                    onChange={e => {
                      setDepotSearch(e.target.value);
                      setDepotPage(1);
                    }}
                    placeholder="Search barcode, serial, brand, model..."
                    className="border border-r-border rounded px-3 py-2 text-[13px] bg-[#FBFBFD] focus:border-r-blue outline-none w-[300px]"
                  />
                  <button
                    className="border border-r-border bg-[#FBFBFD] hover:bg-r-line rounded px-3.5 py-2 text-[12.5px] font-bold text-r-text cursor-pointer transition-colors"
                    onClick={handleExportDepotTable}
                  >
                    Export Excel
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr>
                      <th
                        className="text-left text-[11px] font-bold uppercase tracking-wider text-r-faint p-2.5 px-3 border-b border-r-border cursor-pointer whitespace-nowrap select-none hover:text-r-text"
                        onClick={() => {
                          setDepotSortKey('zone');
                          setDepotSortDir(
                            depotSortKey === 'zone' && depotSortDir === 'asc'
                              ? 'desc'
                              : 'asc'
                          );
                          setDepotPage(1);
                        }}
                      >
                        Depot
                      </th>
                      <th
                        className="text-left text-[11px] font-bold uppercase tracking-wider text-r-faint p-2.5 px-3 border-b border-r-border cursor-pointer whitespace-nowrap select-none hover:text-r-text"
                        onClick={() => {
                          setDepotSortKey('serial');
                          setDepotSortDir(
                            depotSortKey === 'serial' && depotSortDir === 'asc'
                              ? 'desc'
                              : 'asc'
                          );
                          setDepotPage(1);
                        }}
                      >
                        Serial
                      </th>
                      <th
                        className="text-left text-[11px] font-bold uppercase tracking-wider text-r-faint p-2.5 px-3 border-b border-r-border cursor-pointer whitespace-nowrap select-none hover:text-r-text"
                        onClick={() => {
                          setDepotSortKey('brand');
                          setDepotSortDir(
                            depotSortKey === 'brand' && depotSortDir === 'asc'
                              ? 'desc'
                              : 'asc'
                          );
                          setDepotPage(1);
                        }}
                      >
                        Brand
                      </th>
                      <th
                        className="text-left text-[11px] font-bold uppercase tracking-wider text-r-faint p-2.5 px-3 border-b border-r-border cursor-pointer whitespace-nowrap select-none hover:text-r-text"
                        onClick={() => {
                          setDepotSortKey('subtype');
                          setDepotSortDir(
                            depotSortKey === 'subtype' && depotSortDir === 'asc'
                              ? 'desc'
                              : 'asc'
                          );
                          setDepotPage(1);
                        }}
                      >
                        Model
                      </th>
                      <th
                        className="text-left text-[11px] font-bold uppercase tracking-wider text-r-faint p-2.5 px-3 border-b border-r-border cursor-pointer whitespace-nowrap select-none hover:text-r-text"
                        onClick={() => {
                          setDepotSortKey('verifyBucket');
                          setDepotSortDir(
                            depotSortKey === 'verifyBucket' &&
                              depotSortDir === 'asc'
                              ? 'desc'
                              : 'asc'
                          );
                          setDepotPage(1);
                        }}
                      >
                        Verification status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentDepotPageRows.length ? (
                      currentDepotPageRows.map((r, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-[#FAFBFD] transition-colors"
                        >
                          <td className="p-[11px_12px] border-b border-r-line text-r-text whitespace-nowrap">
                            {r.zone}
                          </td>
                          <td className="p-[11px_12px] border-b border-r-line text-r-text whitespace-nowrap">
                            {r.serial}
                          </td>
                          <td className="p-[11px_12px] border-b border-r-line text-r-text whitespace-nowrap">
                            {r.brand}
                          </td>
                          <td className="p-[11px_12px] border-b border-r-line text-r-text whitespace-nowrap">
                            {r.subtype}
                          </td>
                          <td className="p-[11px_12px] border-b border-r-line text-r-text whitespace-nowrap">
                            <Chip
                              label={r.verifyBucket}
                              size="small"
                              color={getVerifyBucketChipColor(r.verifyBucket)}
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center text-r-muted py-8"
                        >
                          No depot stock matches the current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center mt-3.5 text-[12.5px] text-r-muted">
                <span>
                  Page {depotPage} of {totalDepotPages}
                </span>
                <div className="flex gap-1.5">
                  <button
                    className="border border-r-border bg-[#FBFBFD] hover:not-disabled:bg-r-line disabled:opacity-40 disabled:cursor-default rounded-lg px-3 py-1.5 text-[12.5px] font-semibold text-r-text cursor-pointer transition-colors"
                    disabled={depotPage <= 1}
                    onClick={() => setDepotPage(p => Math.max(1, p - 1))}
                  >
                    Previous
                  </button>
                  <button
                    className="border border-r-border bg-[#FBFBFD] hover:not-disabled:bg-r-line disabled:opacity-40 disabled:cursor-default rounded-lg px-3 py-1.5 text-[12.5px] font-semibold text-r-text cursor-pointer transition-colors"
                    disabled={depotPage >= totalDepotPages}
                    onClick={() =>
                      setDepotPage(p => Math.min(totalDepotPages, p + 1))
                    }
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetReport;
