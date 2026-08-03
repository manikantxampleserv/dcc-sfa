import React from 'react';
import { Skeleton } from '@mui/material';

const C = {
  bg: '#f1f5f9',
  surface: '#ffffff',
  border: '#e2e7f0',
  red: '#e31837',
};

const Card: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <div
    style={{
      background: C.surface,
      borderRadius: 8,
      padding: '16px 20px',
      border: `1px solid ${C.border}`,
      boxShadow: '0 1px 3px rgba(0,0,0,.04)',
      ...style,
    }}
  >
    {children}
  </div>
);

export const DashboardSkeleton: React.FC<{ isFullscreen?: boolean }> = ({
  isFullscreen,
}) => {
  return (
    <div
      className={
        isFullscreen
          ? 'h-screen w-screen fixed inset-0 z-[9999] overflow-y-auto'
          : ''
      }
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
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
          <Skeleton variant="circular" width={24} height={24} />
          <Skeleton variant="text" width={200} height={24} />
          <div style={{ display: 'flex', gap: 6, marginLeft: 16 }}>
            <Skeleton
              variant="rounded"
              width={100}
              height={24}
              sx={{ borderRadius: 12 }}
            />
            <Skeleton
              variant="rounded"
              width={100}
              height={24}
              sx={{ borderRadius: 12 }}
            />
            <Skeleton
              variant="rounded"
              width={100}
              height={24}
              sx={{ borderRadius: 12 }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Skeleton
            variant="rounded"
            width={60}
            height={24}
            sx={{ borderRadius: 12 }}
          />
          <Skeleton
            variant="rounded"
            width={120}
            height={24}
            sx={{ borderRadius: 12 }}
          />
          <Skeleton
            variant="rounded"
            width={80}
            height={24}
            sx={{ borderRadius: 12 }}
          />
        </div>
      </div>

      {/* ── Filter Bar ───────────────────────────────────── */}
      <div
        style={{
          background: C.surface,
          borderBottom: `1px solid ${C.border}`,
          padding: '8px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <Skeleton variant="text" width={40} height={20} />
        <div style={{ display: 'flex', gap: 6 }}>
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton
              key={i}
              variant="rounded"
              width={60}
              height={26}
              sx={{ borderRadius: 6 }}
            />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton
              key={i}
              variant="rounded"
              width={100}
              height={30}
              sx={{ borderRadius: 6 }}
            />
          ))}
        </div>
      </div>

      {/* ── Dashboard Content ────────────────────────────── */}
      <div style={{ padding: 20, maxWidth: 1600, margin: '0 auto' }}>
        {/* Executive Summary Cards */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {[1, 2, 3, 4].map(i => (
            <Skeleton
              key={i}
              variant="rounded"
              height={60}
              sx={{ flex: 1, borderRadius: 2 }}
            />
          ))}
        </div>

        {/* Section Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 12,
          }}
        >
          <Skeleton variant="rounded" width="45%" height={1} />
          <Skeleton variant="text" width="10%" height={20} />
          <Skeleton variant="rounded" width="45%" height={1} />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '5fr 3fr 3.5fr',
            gap: 16,
            marginBottom: 16,
          }}
        >
          {/* Sales Trend */}
          <Card style={{ minHeight: 320 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 20,
              }}
            >
              <div>
                <Skeleton variant="text" width={120} height={24} />
                <Skeleton variant="text" width={180} height={16} />
              </div>
              <Skeleton
                variant="rounded"
                width={120}
                height={24}
                sx={{ borderRadius: 12 }}
              />
            </div>
            <Skeleton variant="rounded" height={220} />
          </Card>

          {/* Top Performers */}
          <Card style={{ minHeight: 320 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 20,
              }}
            >
              <div>
                <Skeleton variant="text" width={120} height={24} />
                <Skeleton variant="text" width={150} height={16} />
              </div>
              <Skeleton
                variant="rounded"
                width={80}
                height={24}
                sx={{ borderRadius: 4 }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Skeleton key={i} variant="rounded" height={30} />
              ))}
            </div>
          </Card>

          {/* Brand Analysis */}
          <Card style={{ minHeight: 320 }}>
            <div style={{ marginBottom: 20 }}>
              <Skeleton variant="text" width={120} height={24} />
              <Skeleton variant="text" width={220} height={16} />
              <Skeleton
                variant="text"
                width={100}
                height={18}
                sx={{ marginTop: 8 }}
              />
            </div>
            <Skeleton variant="rounded" height={200} />
          </Card>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3,1fr)',
            gap: 16,
          }}
        >
          <Card style={{ minHeight: 250 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 20,
              }}
            >
              <div>
                <Skeleton variant="text" width={140} height={24} />
                <Skeleton variant="text" width={150} height={16} />
              </div>
              <Skeleton
                variant="rounded"
                width={100}
                height={24}
                sx={{ borderRadius: 12 }}
              />
            </div>
            <Skeleton variant="rounded" height={160} />
          </Card>
          <Card style={{ minHeight: 250 }}>
            <div style={{ marginBottom: 20 }}>
              <Skeleton variant="text" width={140} height={24} />
              <Skeleton variant="text" width={150} height={16} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} variant="rounded" height={24} />
              ))}
            </div>
          </Card>
          <Card style={{ minHeight: 250 }}>
            <div style={{ marginBottom: 20 }}>
              <Skeleton variant="text" width={140} height={24} />
              <Skeleton variant="text" width={150} height={16} />
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
              }}
            >
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} variant="rounded" height={60} />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
