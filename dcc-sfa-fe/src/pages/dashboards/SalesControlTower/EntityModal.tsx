import { Close } from '@mui/icons-material';
import { Dialog, IconButton } from '@mui/material';
import { useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import type { SalesRow } from './mockData';

// Helper to format numbers like 1,000
const FMT = (n: number) => Math.round(n).toLocaleString();
const pct = (a: number, b: number) => (b === 0 ? 0 : ((a - b) / b) * 100);

const C = {
  red: '#e31837',
  redL: 'rgba(227,24,55,0.08)',
  green: '#10b981',
  muted: '#6b7280',
  text: '#111827',
  border: '#e5e7eb',
  bg: '#f9fafb',
};

interface EntityModalProps {
  entity: { dim: string; name: string } | null;
  onClose: () => void;
  mayRows: SalesRow[];
  aprRows: SalesRow[];
}

export default function EntityModal({
  entity,
  onClose,
  mayRows,
  aprRows,
}: EntityModalProps) {
  const [tab, setTab] = useState<
    'Trend' | 'Products' | 'Customers' | 'Routes' | 'Invoices'
  >('Trend');

  // Aggregate metrics for this entity
  const mayData = useMemo(
    () =>
      entity ? mayRows.filter(r => (r as any)[entity.dim] === entity.name) : [],
    [mayRows, entity]
  );
  const aprData = useMemo(
    () =>
      entity ? aprRows.filter(r => (r as any)[entity.dim] === entity.name) : [],
    [aprRows, entity]
  );

  const totalMayUC = mayData.reduce((s, r) => s + r.UC, 0);
  const totalAprUC = aprData.reduce((s, r) => s + r.UC, 0);

  const totalMayPC = mayData.reduce((s, r) => s + r.PC, 0);

  const totalMayTV = mayData.reduce((s, r) => s + r.TV, 0);
  const totalAprTV = aprData.reduce((s, r) => s + r.TV, 0);

  const growthUC = pct(totalMayUC, totalAprUC);
  const growthTV = pct(totalMayTV, totalAprTV);

  // Total dashboard volume context (for "% of total volume" metric)
  const dashboardTotalUC = mayRows.reduce((s, r) => s + r.UC, 0);
  const pctOfTotal = dashboardTotalUC
    ? (totalMayUC / dashboardTotalUC) * 100
    : 0;

  const discQty = totalMayUC - totalMayPC;

  // Trend Chart data
  const trendData = useMemo(() => {
    const map: Record<string, number> = {};
    mayData.forEach(r => {
      const d = r.Date; // e.g. 2026-05-01
      if (!map[d]) map[d] = 0;
      map[d] += r.UC;
    });
    const sortedDates = Object.keys(map).sort();

    return {
      labels: sortedDates.map(d => d.slice(5).replace('-', '/')), // "05/01" format
      datasets: [
        {
          label: 'Daily UC',
          data: sortedDates.map(d => map[d]),
          backgroundColor: '#f87171', // a bit lighter red matching the screenshot
          borderRadius: 4,
          barPercentage: 0.8,
          maxBarThickness: 40,
        },
      ],
    };
  }, [mayData]);

  if (!entity) return null;

  return (
    <Dialog
      open={!!entity}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      style={{ zIndex: 10000 }}
      PaperProps={{
        style: {
          borderRadius: 12,
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        },
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          padding: 10,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: C.text }}>
          {entity.dim}: {entity.name}
        </h2>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 6,
              border: `1px solid ${C.border}`,
              background: C.bg,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              color: C.text,
            }}
          >
            📊 Export
          </button>
          <IconButton
            onClick={onClose}
            size="small"
            style={{ border: `1px solid ${C.border}` }}
          >
            <Close fontSize="small" />
          </IconButton>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          padding: 10,
        }}
      >
        {/* Unit Cases */}
        <div style={{ background: C.bg, borderRadius: 8, padding: 16 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: C.muted,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Unit Cases
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, margin: '4px 0' }}>
            {(totalMayUC / 1000).toFixed(1)}K
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <span style={{ color: growthUC >= 0 ? C.green : C.red }}>
              {growthUC >= 0 ? '▲' : '▼'} {Math.abs(growthUC).toFixed(1)}% vs
              Apr
            </span>
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
            {pctOfTotal.toFixed(1)}% of total volume
          </div>
        </div>

        {/* Physical Cases */}
        <div style={{ background: C.bg, borderRadius: 8, padding: 16 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: C.muted,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Physical Cases
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, margin: '4px 0' }}>
            {(totalMayPC / 1000).toFixed(1)}K
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 22 }}>
            Disc. Qty: {FMT(discQty)}
          </div>
        </div>

        {/* Sales Value */}
        <div style={{ background: C.bg, borderRadius: 8, padding: 16 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: C.muted,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Sales Value (MD)
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, margin: '4px 0' }}>
            TZS {(totalMayTV / 1000000).toFixed(1)}M
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <span style={{ color: growthTV >= 0 ? C.green : C.red }}>
              {growthTV >= 0 ? '▲' : '▼'} {Math.abs(growthTV).toFixed(1)}% vs
              Apr
            </span>
          </div>
        </div>
      </div>

      <div
        style={{
          borderBottom: `1px solid ${C.border}`,
          margin: 10,
        }}
      >
        <div style={{ display: 'flex', gap: 24 }}>
          {(
            [
              { key: 'Trend', label: 'Trend' },
              { key: 'Products', label: 'Top Products', matchDim: 'Brand' },
              {
                key: 'Customers',
                label: 'Top Customers',
                matchDim: 'OutletCode',
              },
              { key: 'Routes', label: 'Top Routes', matchDim: 'Route' },
              { key: 'Invoices', label: 'Invoices' },
            ] as const
          )
            .filter(t => (t as any).matchDim !== entity.dim)
            .map(({ key: k, label }) => (
              <div
                key={k}
                onClick={() => setTab(k)}
                style={{
                  paddingBottom: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  color: tab === k ? C.red : C.muted,
                  borderBottom:
                    tab === k ? `2px solid ${C.red}` : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {label}
              </div>
            ))}
        </div>
      </div>

      <div className="p-4">
        {tab === 'Trend' && (
          <div style={{ height: 280 }}>
            <Bar
              data={trendData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: ctx => ` ${FMT(ctx.parsed.y || 0)} UC`,
                    },
                  },
                },
                scales: {
                  x: { grid: { display: false } },
                  y: { border: { display: false } },
                },
              }}
            />
          </div>
        )}
        {tab !== 'Trend' && (
          <div
            style={{
              height: 280,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: C.muted,
              fontSize: 14,
            }}
          >
            Detailed {tab.toLowerCase()} data for this SKU is populated
            dynamically when connected to a backend endpoint.
          </div>
        )}
      </div>
    </Dialog>
  );
}
