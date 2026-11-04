import { Avatar, Chip, Modal, Skeleton } from '@mui/material';
import { type AssetMaintenance } from 'hooks/useAssetMaintenance';
import { type AssetMaster } from 'hooks/useAssetMaster';
import {
  useCooler360,
  type Cooler360Activity,
  type Cooler360Photo,
} from 'hooks/useCooler360';
import { useCurrency } from 'hooks/useCurrency';
import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  History as HistoryIcon,
  Image as ImageIcon,
  MapPin,
  Package,
  Shield,
  Truck,
  Wrench,
  X,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import AssetSelect from 'shared/AssetSelect';
import Barcode from 'shared/Barcode';
import Button from 'shared/Button';
import ManageAssetMaintenance from '../AssetMaintenance/ManageAssetMaintenance';

/**
 * Cooler 360 Unified Asset View Page Component.
 * Implements the exact layout and gridding of the Cooler 360 prototype
 * using minimal MUI, shared components (SearchInput, Button, Barcode),
 * and standard Tailwind styling aligned with DCC-SFA's design system.
 *
 * @returns {React.ReactElement} Cooler 360 dashboard view.
 */
const Cooler360Page: React.FC = () => {
  const { identifier: urlIdentifier } = useParams<{ identifier?: string }>();
  const [searchParams] = useSearchParams();
  const queryIdentifier =
    searchParams.get('identifier') || searchParams.get('id');
  const resolvedIdentifier = urlIdentifier || queryIdentifier || '';
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();

  /** Identifier search state */
  const [activeIdentifier, setActiveIdentifier] = useState<string>(
    resolvedIdentifier || ''
  );

  /** Lightbox photo preview modal state */
  const [previewPhoto, setPreviewPhoto] = useState<Cooler360Photo | null>(null);

  /** Sync activeIdentifier with URL parameter or query changes */
  useEffect(() => {
    const currentParam = urlIdentifier || queryIdentifier;
    if (currentParam && currentParam !== activeIdentifier) {
      setActiveIdentifier(currentParam);
    }
  }, [urlIdentifier, queryIdentifier]);

  /** Filter tab for history timeline: all | movement | verification | inspection | maintenance */
  const [historyFilter, setHistoryFilter] = useState<
    'all' | 'movement' | 'verification' | 'inspection' | 'maintenance'
  >('all');

  /** Expanded maintenance item ids in history */
  const [expandedHistories, setExpandedHistories] = useState<Set<number>>(
    new Set()
  );

  /** Maintenance drawer state for opening ticket directly from 360 */
  const [maintenanceDrawerOpen, setMaintenanceDrawerOpen] = useState(false);
  const [selectedTicketForDrawer, setSelectedTicketForDrawer] =
    useState<AssetMaintenance | null>(null);

  /** Fetch 360 unified data from backend API */
  const {
    data: coolerData,
    isLoading,
    isError,
    error,
    refetch,
  } = useCooler360(activeIdentifier);

  /** Handle selecting an asset from the dropdown to switch Cooler 360 */
  const handleAssetSelect = (
    _event: any,
    selectedAsset: AssetMaster | null
  ) => {
    if (selectedAsset) {
      const nextId = String(selectedAsset.id);
      setActiveIdentifier(nextId);
      navigate(`/transactions/cooler-360/${encodeURIComponent(nextId)}`);
    } else {
      setActiveIdentifier('');
      navigate('/transactions/cooler-360');
    }
  };

  /** Toggle activity spare breakdown */
  const toggleHistoryExpand = (id: number) => {
    setExpandedHistories(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /** Open drawer for the active ticket */
  const handleOpenTicketDrawer = () => {
    if (coolerData?.openTicket && coolerData?.asset) {
      setSelectedTicketForDrawer({
        id: coolerData.openTicket.id,
        asset_id: coolerData.asset.id,
        job_number: coolerData.openTicket.jobNumber,
        status: coolerData.openTicket.status,
        priority: coolerData.openTicket.priority,
        issue_reported: coolerData.openTicket.issueReported,
        repair_location: coolerData.openTicket.repairLocation,
        maintenance_date: coolerData.openTicket.reportedDate,
        technician_id: 0,
        is_active: 'Y',
        createdby: 1,
      } as any);
      setMaintenanceDrawerOpen(true);
    }
  };

  /** Filtered activities based on active tab */
  const filteredActivities = useMemo(() => {
    if (!coolerData?.activities) return [];
    if (historyFilter === 'all') return coolerData.activities;
    return coolerData.activities.filter(a => {
      const t = String(a.type || '').toLowerCase();
      return t === historyFilter;
    });
  }, [coolerData?.activities, historyFilter]);

  const asset = coolerData?.asset;
  const health = coolerData?.health;
  const placement = coolerData?.placement;
  const openTicket = coolerData?.openTicket;
  const counts = coolerData?.counts;
  const dataChecks = coolerData?.dataChecks;
  const photos = asset?.photos || coolerData?.photos || [];

  return (
    <div className="max-w-[1240px] mx-auto flex flex-col gap-4 p-1">
      {/** Top Bar: Header with Subtitle & Info + Shared AssetSelect */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">Cooler 360</h1>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              Live 360
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5 max-w-xl">
            Track cooler identity, health telemetry, outlet placement, active
            maintenance tickets, and complete lifecycle history.
          </p>
        </div>

        {/** Shared AssetSelect Dropdown to search, select and switch asset */}
        <div className="w-full sm:w-80">
          <AssetSelect
            name="coolerAssetSelect"
            placeholder="Search or select asset..."
            value={asset?.id}
            nameToSearch={asset?.name}
            onChange={handleAssetSelect}
            fullWidth={true}
            label={''}
          />
        </div>
      </header>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-4 bg-white border border-gray-200 rounded-lg p-5 text-center shadow-sm">
              <Skeleton
                variant="circular"
                width={72}
                height={72}
                className="!mx-auto !mb-3"
              />
              <Skeleton
                variant="text"
                width="65%"
                height={24}
                className="!mx-auto"
              />
              <Skeleton
                variant="text"
                width="40%"
                height={16}
                className="!mx-auto !mb-4"
              />
              <div className="grid grid-cols-2 gap-2">
                <Skeleton
                  variant="rectangular"
                  height={54}
                  className="!rounded-lg"
                />
                <Skeleton
                  variant="rectangular"
                  height={54}
                  className="!rounded-lg"
                />
              </div>
            </div>
            <div className="lg:col-span-8 bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
              <Skeleton
                variant="text"
                width={180}
                height={28}
                className="!mb-4"
              />
              <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i}>
                    <Skeleton variant="text" width={75} height={14} />
                    <Skeleton variant="text" width="80%" height={20} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Skeleton
            variant="rectangular"
            height={88}
            className="!rounded-lg !w-full"
          />
        </div>
      ) : isError || !coolerData ? (
        <div className="bg-rose-100 border border-rose-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-800 text-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-rose-600 flex-none" />
            <span>
              {(error as Error)?.message ||
                `Cooler / Asset not found${activeIdentifier ? ` for '${activeIdentifier}'` : ''}. Try searching another code, barcode, or ID.`}
            </span>
          </div>
          <Button size="small" variant="outlined" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <>
          {/** Row 1: Identity Card (1fr) + Asset Information Card (2fr) */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/** Cooler Identity Left Card (approx 1fr -> lg:col-span-4) */}
            <div className="lg:col-span-4 bg-white border border-gray-200 rounded-lg p-5 flex flex-col items-center text-center gap-2 shadow-sm">
              <Avatar
                className="!w-[72px] !h-[72px] !rounded-lg !bg-primary-600 !text-white !mb-1 !shadow-sm"
                aria-hidden="true"
              >
                <Package size={34} />
              </Avatar>
              <h2 className="text-base font-bold text-gray-900 leading-tight">
                {asset?.title || asset?.name || 'Asset Master'}
              </h2>
              <div className="font-mono text-xs text-gray-500">
                {asset?.code || asset?.barcode || 'N/A'}
              </div>
              <div className="flex gap-2 justify-center flex-wrap mt-1">
                <Chip
                  label={asset?.status || 'Deployed'}
                  size="small"
                  variant="outlined"
                  color="primary"
                  className="!text-xs !font-medium"
                />
                <Chip
                  label={asset?.isActive ? 'Active' : 'Inactive'}
                  size="small"
                  color={asset?.isActive ? 'success' : 'error'}
                  className="!text-xs !font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 w-full mt-2 text-left">
                <div className="bg-gray-100 border border-gray-100 rounded-lg p-2.5">
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block">
                    Asset type
                  </span>
                  <strong className="text-xs font-semibold text-gray-800 block mt-0.5">
                    {asset?.subType || 'Cooler'}
                  </strong>
                </div>
                <div className="bg-gray-100 border border-gray-100 rounded-lg p-2.5">
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block">
                    Brand
                  </span>
                  <strong className="text-xs font-semibold text-gray-800 block mt-0.5">
                    {asset?.brand || 'N/A'}
                  </strong>
                </div>
              </div>
            </div>

            {/** Asset Information Right Card (approx 2fr -> lg:col-span-8) */}
            <div className="lg:col-span-8 bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded bg-primary-100 text-primary-600 flex items-center justify-center flex-none">
                  <Package size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 leading-tight">
                    Asset information
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Technical specifications, serial numbers, and tracking
                    metadata
                  </p>
                </div>
              </div>

              {/** 3-Column Info Grid matching prototype */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block">
                    Serial number
                  </span>
                  <strong className="font-mono font-semibold text-gray-800 block mt-0.5">
                    {asset?.serialNumber || 'N/A'}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block">
                    Asset code
                  </span>
                  <strong className="font-mono font-semibold text-gray-800 block mt-0.5">
                    {asset?.code || 'N/A'}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block">
                    Barcode
                  </span>
                  <strong className="font-mono font-semibold text-gray-800 block mt-0.5">
                    {asset?.barcode || 'N/A'}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block">
                    NFC tag
                  </span>
                  <strong className="font-semibold text-gray-500 block mt-0.5">
                    {asset?.nfcTag || 'Not tagged'}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block">
                    Sub type
                  </span>
                  <strong className="font-semibold text-gray-800 block mt-0.5">
                    {asset?.subType || 'N/A'}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block">
                    Capacity
                  </span>
                  <strong className="font-semibold text-gray-800 tabular-nums block mt-0.5">
                    {asset?.capacity || 'N/A'}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block">
                    Energy rating
                  </span>
                  <strong className="font-semibold text-gray-800 block mt-0.5">
                    {asset?.energyRating || 'N/A'}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block">
                    Purchase date
                  </span>
                  <strong className="font-semibold text-gray-800 tabular-nums block mt-0.5">
                    {asset?.purchaseDate || 'N/A'}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block">
                    Warranty expiry
                  </span>
                  <strong className="font-semibold text-gray-800 tabular-nums block mt-0.5">
                    {asset?.warrantyExpiry || 'N/A'}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block">
                    Home depot
                  </span>
                  <strong className="font-semibold text-gray-800 block mt-0.5">
                    {asset?.homeDepot || 'N/A'}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block">
                    Last scanned
                  </span>
                  <strong className="font-semibold text-gray-800 tabular-nums block mt-0.5">
                    {asset?.lastScanned || 'Not scanned'}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block">
                    Last scan by
                  </span>
                  <strong className="font-semibold text-gray-800 block mt-0.5">
                    {asset?.lastScannedBy || 'Unassigned'}
                  </strong>
                </div>
                {asset?.cost && (
                  <div className="md:col-span-3 pt-1 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                      Asset Cost
                    </span>
                    <strong className="font-semibold text-primary-700 tabular-nums">
                      {formatCurrency(Number(asset.cost))}
                    </strong>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/** Row 2: Health Strip Ribbon (6 Columns horizontal unified strip) */}
          <section
            className="bg-white border border-gray-200 rounded-lg shadow-sm grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-gray-200"
            aria-label="Cooler health"
          >
            {/** Cell 1: Last verified */}
            <div className="p-4 flex flex-col gap-1 min-w-0">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                Last verified
              </span>
              <div
                className={`text-lg font-bold tabular-nums flex items-center gap-2 mt-0.5 ${
                  health?.lastVerified?.status === 'good'
                    ? 'text-emerald-700'
                    : 'text-amber-700'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full flex-none ${
                    health?.lastVerified?.status === 'good'
                      ? 'bg-emerald-500'
                      : 'bg-amber-500'
                  }`}
                ></span>
                <span>{health?.lastVerified?.value || 'Never'}</span>
              </div>
              <span className="text-xs text-gray-500 truncate">
                {health?.lastVerified?.sub || 'No scans recorded'}
              </span>
            </div>

            {/** Cell 2: Last inspection */}
            <div className="p-4 flex flex-col gap-1 min-w-0">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                Last inspection
              </span>
              <div
                className={`text-lg font-bold tabular-nums flex items-center gap-2 mt-0.5 ${
                  health?.lastInspection?.status === 'alert' ||
                  health?.lastInspection?.status === 'warn'
                    ? 'text-amber-700'
                    : health?.lastInspection?.status === 'good'
                      ? 'text-emerald-700'
                      : 'text-gray-800'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full flex-none ${
                    health?.lastInspection?.status === 'alert'
                      ? 'bg-rose-500'
                      : health?.lastInspection?.status === 'warn'
                        ? 'bg-amber-500'
                        : health?.lastInspection?.status === 'good'
                          ? 'bg-emerald-500'
                          : 'bg-gray-400'
                  }`}
                ></span>
                <span>{health?.lastInspection?.value || 'None'}</span>
              </div>
              <span className="text-xs text-gray-500 truncate">
                {health?.lastInspection?.sub || 'No inspection recorded'}
              </span>
            </div>

            {/** Cell 3: Open ticket */}
            <div className="p-4 flex flex-col gap-1 min-w-0">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                Open ticket
              </span>
              <div
                className={`text-lg font-bold tabular-nums flex items-center gap-2 mt-0.5 ${
                  health?.openTicket?.status === 'warn'
                    ? 'text-amber-700'
                    : 'text-emerald-700'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full flex-none ${
                    health?.openTicket?.status === 'warn'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                ></span>
                <span>{health?.openTicket?.value || 'None'}</span>
              </div>
              <span className="text-xs text-gray-500 truncate">
                {health?.openTicket?.sub || 'All clear'}
              </span>
            </div>

            {/** Cell 4: Repairs */}
            <div className="p-4 flex flex-col gap-1 min-w-0">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                Repairs
              </span>
              <div
                className={`text-lg font-bold tabular-nums flex items-center gap-2 mt-0.5 ${
                  health?.repairs?.status === 'warn'
                    ? 'text-rose-700'
                    : 'text-gray-900'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full flex-none ${
                    health?.repairs?.status === 'warn'
                      ? 'bg-rose-500'
                      : 'bg-emerald-500'
                  }`}
                ></span>
                <span>
                  {health?.repairs?.value ?? 0}{' '}
                  <small className="text-xs font-normal text-gray-500">
                    / 12 mo
                  </small>
                </span>
              </div>
              <span className="text-xs text-gray-500 truncate">
                {health?.repairs?.sub || '0 lifetime'}
              </span>
            </div>

            {/** Cell 5: Lifetime cost */}
            <div className="p-4 flex flex-col gap-1 min-w-0">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                Lifetime cost
              </span>
              <div className="text-lg font-bold text-gray-900 tabular-nums flex items-center gap-2 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-gray-400 flex-none"></span>
                <span>{health?.lifetimeCost?.value || '0'}</span>
              </div>
              <span className="text-xs text-gray-500 truncate">
                {health?.lifetimeCost?.sub || 'TZS, parts + labour'}
              </span>
            </div>

            {/** Cell 6: Days here */}
            <div className="p-4 flex flex-col gap-1 min-w-0">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                Days here
              </span>
              <div className="text-lg font-bold text-gray-900 tabular-nums flex items-center gap-2 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-gray-400 flex-none"></span>
                <span>{health?.daysHere?.value ?? 0}</span>
              </div>
              <span className="text-xs text-gray-500 truncate">
                {health?.daysHere?.sub || 'Not recorded'}
              </span>
            </div>
          </section>

          {/** Row 3: Current Placement (1fr) + Open Ticket (1fr) */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/** Current Placement Card */}
            <div className="bg-white rounded-lg p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded bg-primary-100 text-primary-600 flex items-center justify-center flex-none">
                  <MapPin size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 leading-tight">
                    Current placement
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Assigned retail outlet, distribution route, and location
                    details
                  </p>
                </div>
              </div>

              {/** Outlet Banner Block */}
              <div className="flex items-center gap-3 p-3 rounded bg-gray-100 mb-4">
                <Avatar className="!w-10 !h-10 !rounded !bg-primary-100 !text-primary-700 !font-bold !text-sm !flex-none">
                  {placement?.outletName?.charAt(0) || 'O'}
                </Avatar>
                <div>
                  <b className="text-sm font-semibold text-gray-900 block leading-tight">
                    {placement?.outletName || 'Not Assigned'}
                  </b>
                  <span className="font-mono text-xs text-gray-500 block">
                    {placement?.outletCode || 'N/A'}
                  </span>
                </div>
                <Chip
                  label={placement?.isDeployed ? 'At outlet' : 'In depot'}
                  size="small"
                  variant="outlined"
                  color="primary"
                  className="!ml-auto !text-xs !font-medium"
                />
              </div>

              {/** 2-Column Placement Details Grid */}
              <div className="grid grid-cols-2 gap-x-5 gap-y-3.5 text-xs">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block">
                    Channel
                  </span>
                  <strong className="text-xs font-semibold text-gray-800 block mt-0.5">
                    {placement?.channel || 'N/A'}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block">
                    Route
                  </span>
                  <strong className="text-xs font-semibold text-gray-800 block mt-0.5">
                    {placement?.route || 'N/A'}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block">
                    Zone
                  </span>
                  <strong className="text-xs font-semibold text-gray-800 block mt-0.5">
                    {placement?.zone || 'N/A'}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block">
                    Depot
                  </span>
                  <strong className="text-xs font-semibold text-gray-800 block mt-0.5">
                    {placement?.depot || 'N/A'}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block">
                    Sales rep
                  </span>
                  <strong className="text-xs font-semibold text-gray-800 block mt-0.5">
                    {placement?.salesRep || 'N/A'}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block">
                    Installed
                  </span>
                  <strong className="text-xs font-semibold text-gray-800 tabular-nums block mt-0.5">
                    {placement?.installedDate || 'N/A'}
                  </strong>
                </div>
              </div>
            </div>

            {/** Open Ticket Card */}
            <div className="bg-white border h-full border-gray-200 rounded-lg p-5 shadow-sm flex flex-col justify-between">
              <div className="h-full">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded bg-amber-100 text-amber-700 flex items-center justify-center flex-none">
                    <Wrench size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900 leading-tight">
                      Open ticket{' '}
                      <span className="font-mono font-normal text-xs text-gray-500">
                        {openTicket?.jobNumber || ''}
                      </span>
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Active repair complaint, technician assignment, and SLA
                      tracking
                    </p>
                  </div>
                  {openTicket && (
                    <Chip
                      label={openTicket.status.toUpperCase()}
                      size="small"
                      color="warning"
                      className="!ml-auto !text-xs !font-semibold"
                    />
                  )}
                </div>

                {openTicket ? (
                  <>
                    <div className="bg-amber-100 border border-amber-200 rounded-lg p-3 mb-4">
                      <span className="text-[10px] uppercase tracking-wider text-amber-900 font-bold block">
                        Issue reported · {openTicket.reportedDate}
                      </span>
                      <p className="text-xs font-medium text-gray-900 mt-0.5">
                        {openTicket.issueReported}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-x-5 gap-y-3.5 text-xs">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block">
                          Repair location
                        </span>
                        <strong className="text-xs font-semibold text-gray-800 block mt-0.5">
                          {openTicket.repairLocation}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block">
                          Priority
                        </span>
                        <strong className="text-xs font-bold text-rose-600 block mt-0.5">
                          {openTicket.priority.toUpperCase()}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block">
                          Technician
                        </span>
                        <strong className="text-xs font-semibold text-gray-800 block mt-0.5">
                          {openTicket.technicianName}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block">
                          Due date
                        </span>
                        <strong className="text-xs font-semibold text-gray-800 tabular-nums block mt-0.5">
                          {openTicket.dueDate}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block">
                          Spares so far
                        </span>
                        <strong className="text-xs font-semibold text-gray-800 block mt-0.5">
                          {openTicket.sparesCount > 0
                            ? `${openTicket.sparesCount} recorded`
                            : 'None recorded'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block">
                          Cost so far
                        </span>
                        <strong className="text-xs font-semibold text-primary-700 tabular-nums block mt-0.5">
                          {formatCurrency(openTicket.costSoFar)}
                        </strong>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-44 flex flex-col items-center justify-center text-center text-xs text-gray-400">
                    <Wrench size={24} className="mb-2 text-gray-300" />
                    <span>No active maintenance ticket for this cooler.</span>
                  </div>
                )}
              </div>

              {openTicket && (
                <div className="flex gap-2.5 mt-4 pt-3 border-t border-gray-100 flex-wrap">
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleOpenTicketDrawer}
                  >
                    Open ticket
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate('/transactions/inspections')}
                  >
                    View inspection
                  </Button>
                </div>
              )}
            </div>
          </section>

          {/** Row 4: History & Timeline with Category Filter Chips */}
          <section className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded bg-primary-100 text-primary-600 flex items-center justify-center flex-none">
                  <HistoryIcon size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 leading-tight">
                    History
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Complete chronological log of movements, verifications, and
                    repairs
                  </p>
                </div>
              </div>

              {/** Filter Chips Pills */}
              <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-label="Filter history"
              >
                {[
                  { key: 'all', label: 'All', count: counts?.all || 0 },
                  {
                    key: 'mov',
                    label: 'Movements',
                    count: counts?.mov || 0,
                  },
                  {
                    key: 'ver',
                    label: 'Verifications',
                    count: counts?.ver || 0,
                  },
                  {
                    key: 'ins',
                    label: 'Inspections',
                    count: counts?.ins || 0,
                  },
                  {
                    key: 'mnt',
                    label: 'Maintenance',
                    count: counts?.mnt || 0,
                  },
                ].map(tab => (
                  <Chip
                    key={tab.key}
                    label={`${tab.label} (${tab.count})`}
                    onClick={() => setHistoryFilter(tab.key as any)}
                    clickable
                    size="medium"
                    color={historyFilter === tab.key ? 'primary' : 'default'}
                    variant={historyFilter === tab.key ? 'filled' : 'outlined'}
                    className="!font-medium"
                  />
                ))}
              </div>
            </div>

            {/** Event List (3-Column Layout: Date 96px, Icon 36px, Body 1fr) */}
            <ul className="divide-y divide-gray-100">
              {filteredActivities.length === 0 ? (
                <li className="py-10 flex flex-col items-center justify-center text-xs text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200 my-2">
                  <HistoryIcon size={24} className="mb-2 text-gray-300" />
                  <span>No events found for this filter.</span>
                </li>
              ) : (
                filteredActivities.map((item: Cooler360Activity) => {
                  const isExpanded = expandedHistories.has(item.id);
                  return (
                    <li
                      key={item.id}
                      className="grid grid-cols-[96px_36px_minmax(0,1fr)] gap-3 py-3.5"
                    >
                      {/** Col 1: Date & Time */}
                      <div className="text-xs text-gray-500 pt-1 leading-tight">
                        <b className="block text-gray-900 font-semibold">
                          {item.date.split(',')[0] || item.date}
                        </b>
                        <span className="text-[11px] font-mono text-gray-400">
                          {item.date.split(',')[1]?.trim() || ''}
                        </span>
                      </div>

                      {/** Col 2: Icon Badge */}
                      <div>
                        {item.type === 'verification' && (
                          <div className="w-10 h-10 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <CheckCircle size={17} />
                          </div>
                        )}
                        {item.type === 'inspection' && (
                          <div className="w-10 h-10 rounded bg-amber-100 text-amber-600 flex items-center justify-center">
                            <AlertTriangle size={17} />
                          </div>
                        )}
                        {item.type === 'maintenance' && (
                          <div className="w-10 h-10 rounded bg-purple-100 text-purple-600 flex items-center justify-center">
                            <Wrench size={17} />
                          </div>
                        )}
                        {item.type === 'movement' && (
                          <div className="w-10 h-10 rounded bg-sky-100 text-sky-600 flex items-center justify-center">
                            <Truck size={17} />
                          </div>
                        )}
                      </div>

                      {/** Col 3: Event Body */}
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 flex flex-wrap items-center gap-2">
                          <span>{item.title}</span>
                          {item.badge && (
                            <Chip
                              label={item.badge.text}
                              size="small"
                              className={`!h-5 !text-[11px] !font-semibold ${
                                item.badge.tone === 'good'
                                  ? '!bg-emerald-100 !text-emerald-700 !border !border-emerald-200'
                                  : item.badge.tone === 'alert'
                                    ? '!bg-rose-100 !text-rose-700 !border !border-rose-200'
                                    : item.badge.tone === 'warn'
                                      ? '!bg-amber-100 !text-amber-800 !border !border-amber-200'
                                      : '!bg-gray-100 !text-gray-700'
                              }`}
                            />
                          )}
                        </h3>
                        {item.desc && (
                          <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                            {item.desc}
                          </p>
                        )}
                        {item.by && (
                          <div className="text-[11px] text-gray-400 mt-1 font-medium">
                            {item.by}
                          </div>
                        )}

                        {/** Expandable parts and lifecycle history */}
                        {item.spares && item.spares.length > 0 && (
                          <div>
                            <button
                              type="button"
                              onClick={() => toggleHistoryExpand(item.id)}
                              className="inline-flex items-center gap-1 text-xs text-primary-600 font-medium"
                            >
                              <span>Spares, cost and status history</span>
                              {isExpanded ? (
                                <ChevronUp size={13} />
                              ) : (
                                <ChevronDown size={13} />
                              )}
                            </button>

                            {isExpanded && (
                              <div className="mt-2 bg-gray-100 rounded border border-gray-200 space-y-2">
                                <table className="w-full text-left text-xs">
                                  <thead className="text-[10px] uppercase tracking-wider text-gray-400 border-b border-gray-200 font-semibold">
                                    <tr>
                                      <th className="p-2">Part</th>
                                      <th className="p-2 text-right w-16">
                                        Qty
                                      </th>
                                      <th className="p-2 text-right">Cost</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                    {item.spares.map((sp, sIdx) => (
                                      <tr key={sIdx}>
                                        <td className="p-2 text-gray-800">
                                          {sp.name}
                                        </td>
                                        <td className="p-2 text-right text-gray-600 tabular-nums">
                                          {sp.qty}
                                        </td>
                                        <td className="p-2 text-right font-semibold text-gray-900 tabular-nums">
                                          {formatCurrency(sp.cost)}
                                        </td>
                                      </tr>
                                    ))}
                                    <tr className="font-bold border-t border-gray-200">
                                      <td colSpan={2} className="py-1.5 px-2">
                                        Total
                                      </td>
                                      <td className="py-1.5 px-2 text-right text-primary-700 tabular-nums">
                                        {formatCurrency(item.totalCost || 0)}
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>

                                {item.subLifecycle && (
                                  <p className="text-[11px] text-gray-500 pt-1 border-t border-gray-100">
                                    {item.subLifecycle}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })
              )}
            </ul>
          </section>

          {/** Row 5: Photos (1.3fr) + Barcode (1fr) + Data Checks (1fr) */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/** Photos Card (approx 1.3fr -> lg:col-span-5) */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded bg-primary-100 text-primary-600 flex items-center justify-center flex-none">
                  <ImageIcon size={18} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-gray-900 leading-tight">
                    Photos {photos.length > 0 ? `(${photos.length})` : ''}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    Cooler condition &amp; inspection photos
                  </p>
                </div>
              </div>

              {photos.length > 0 ? (
                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  {photos.map((p, idx) => (
                    <div
                      key={p.id || idx}
                      onClick={() => setPreviewPhoto(p)}
                      className="group relative aspect-[4/3] rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:border-primary-500 transition-all bg-gray-100"
                    >
                      <img
                        src={p.url}
                        alt={p.caption || 'Asset photo'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e: any) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <ImageIcon size={18} />
                      </div>
                      {p.caption && (
                        <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white p-0.5 truncate text-center">
                          {p.caption}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-7 text-center text-xs text-gray-400 bg-gray-100 rounded border border-dashed border-gray-200">
                  <ImageIcon
                    size={22}
                    className="mx-auto mb-1.5 text-gray-300"
                  />
                  <span>No photos uploaded for this asset</span>
                </div>
              )}
            </div>

            {/** Barcode Label Card (approx 1fr -> lg:col-span-3) */}
            {asset?.barcode || asset?.code ? (
              <Barcode value={asset.barcode || asset.code} type="code128" />
            ) : (
              <div className="py-7 text-center text-xs text-gray-400 bg-gray-100 rounded-lg border border-gray-200">
                No barcode registered
              </div>
            )}

            {/** Data Checks Card (approx 1fr -> lg:col-span-4) */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center flex-none">
                  <Shield size={18} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-gray-900 leading-tight">
                    Data checks
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    Telemetry &amp; scan validation
                  </p>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs">
                {dataChecks && dataChecks.length > 0 ? (
                  dataChecks.map((chk, cIdx) => (
                    <li
                      key={cIdx}
                      className={`flex gap-2.5 items-start p-2.5 rounded border ${
                        chk.type === 'warn'
                          ? 'bg-amber-100 border-amber-200 text-amber-900'
                          : 'bg-emerald-100 border-emerald-200 text-emerald-900'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full mt-1.5 flex-none ${
                          chk.type === 'warn'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                      ></span>
                      <div>
                        <b className="block font-semibold">{chk.title}</b>
                        <span className="text-[11px] opacity-90 leading-tight block mt-0.5">
                          {chk.detail}
                        </span>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="py-4 text-center text-gray-400 text-xs">
                    No data check items available.
                  </li>
                )}
              </ul>
            </div>
          </section>
        </>
      )}

      {/** Photo Fullscreen Preview Modal */}
      <Modal
        open={Boolean(previewPhoto)}
        onClose={() => setPreviewPhoto(null)}
        className="flex items-center justify-center p-4 bg-black/90"
      >
        <div className="relative max-w-4xl w-full flex flex-col items-center justify-center outline-none">
          <button
            type="button"
            onClick={() => setPreviewPhoto(null)}
            className="absolute -top-10 right-0 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          {previewPhoto && (
            <>
              <img
                src={previewPhoto.url}
                alt={previewPhoto.caption || 'Asset photo preview'}
                className="max-h-[80vh] max-w-full rounded-lg object-contain shadow-2xl"
              />
              <div className="mt-3 text-center text-white">
                <p className="text-sm font-semibold">
                  {previewPhoto.caption || 'Asset photo'}
                </p>
                {previewPhoto.uploadedAt && (
                  <span className="text-xs text-gray-300 block mt-0.5">
                    Uploaded: {previewPhoto.uploadedAt}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </Modal>

      {/** Drawer for viewing/managing ticket opened from 360 */}
      <ManageAssetMaintenance
        selectedMaintenance={selectedTicketForDrawer}
        setSelectedMaintenance={setSelectedTicketForDrawer}
        drawerOpen={maintenanceDrawerOpen}
        setDrawerOpen={setMaintenanceDrawerOpen}
      />
    </div>
  );
};

export default Cooler360Page;
