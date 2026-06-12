import { Block, CheckCircle, HelpOutline, Schedule } from '@mui/icons-material';
import { Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import { useAssetTypes } from 'hooks/useAssetTypes';
import { usePermission } from 'hooks/usePermission';
import { useAssetMovementStatusReport } from 'hooks/useReports';
import {
  ArrowRight,
  Calendar,
  Clock,
  Download,
  MapPin,
  Move,
  Package,
  Settings,
  Tag,
  Wrench,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { exportAssetMovementStatusReport } from 'services/reports/assetMovementStatus';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import Input from 'shared/Input';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import toast from 'utils/toast';

const AssetMovementStatusReport: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [assetTypeId, setAssetTypeId] = useState<number | undefined>(undefined);
  const [assetStatus, setAssetStatus] = useState('all');
  const [isExporting, setIsExporting] = useState(false);
  const { isRead } = usePermission('report');

  const { data: reportData, isFetching } = useAssetMovementStatusReport(
    {
      start_date: startDate,
      end_date: endDate,
      asset_type_id: assetTypeId,
      asset_status: assetStatus === 'all' ? undefined : assetStatus,
    },
    {
      enabled: isRead,
    }
  );

  const { data: assetTypesData } = useAssetTypes({
    limit: 1000,
    isActive: 'Y',
  });

  const assetTypes = assetTypesData?.data || [];

  const summary = reportData?.summary || {
    total_assets: 0,
    total_movements: 0,
    total_customer_assets: 0,
    total_warranty_claims: 0,
    assets_by_status: {},
    customer_assets_by_status: {},
    claims_by_status: {},
  };

  const movements = reportData?.data?.movements || [];
  const pendingMovements = movements.filter(
    (m: any) =>
      m.approval_status === 'P' ||
      String(m.approval_status || '').toLowerCase() === 'pending'
  ).length;

  const assets = reportData?.data?.assets || [];
  const inMaintenanceAssets = assets.filter(
    (a: any) =>
      String(a.current_status || '').toLowerCase() === 'under maintenance' ||
      String(a.current_status || '').toLowerCase() === 'maintenance'
  ).length;

  const handleExportToExcel = useCallback(async () => {
    try {
      setIsExporting(true);
      await toast.promise(
        exportAssetMovementStatusReport({
          start_date: startDate,
          end_date: endDate,
          asset_type_id: assetTypeId,
          asset_status: assetStatus === 'all' ? undefined : assetStatus,
        }),
        {
          pending: 'Exporting report to Excel...',
          success: 'Report exported successfully!',
          error: 'Failed to export report.',
        }
      );
    } catch (error) {
      console.error('Error exporting report to Excel:', error);
    } finally {
      setIsExporting(false);
    }
  }, [startDate, endDate, assetTypeId, assetStatus]);

  const getStatusColor = (
    status: string
  ): 'primary' | 'success' | 'secondary' | 'error' | 'warning' | 'default' => {
    const colors: Record<
      string,
      'primary' | 'success' | 'secondary' | 'error' | 'warning' | 'default'
    > = {
      Available: 'success',
      Installed: 'primary',
      'Under Maintenance': 'warning',
      Retired: 'secondary',
      Lost: 'error',
      Damaged: 'error',
    };
    return colors[status] || 'default';
  };

  const assetColumns: TableColumn<any>[] = [
    {
      id: 'name',
      label: 'Asset Info',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.name || row.serial_number}
            className="!rounded !bg-primary-100 !text-primary-500"
          >
            <Package className="w-5 h-5" />
          </Avatar>
          <Box>
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight"
            >
              {row.name || 'N/A'}
            </Typography>
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block !mt-0.5"
            >
              {row.serial_number}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'asset_type',
      label: 'Type / Sub Type',
      render: (_value, row) => (
        <Box className="flex items-center gap-2">
          <Avatar
            alt={row.asset_type}
            className="!rounded !bg-primary-100 !text-primary-500"
          >
            <Settings className="w-5 h-5" />
          </Avatar>
          <Box>
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight"
            >
              {row.asset_type || (
                <span className="italic text-gray-400">Not specified</span>
              )}
            </Typography>
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block !mt-0.5"
            >
              {row.sub_type}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'brand',
      label: 'Brand',
      render: value => (
        <Box className="flex items-center gap-1">
          <Tag className="w-3 h-3 text-gray-400" />
          <span className="text-xs">
            {value || <span className="italic text-gray-400">No brand</span>}
          </span>
        </Box>
      ),
    },
    {
      id: 'current_location',
      label: 'Location',
      render: value => (
        <Box className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-gray-400" />
          <span className="text-xs">
            {value || <span className="italic text-gray-400">No location</span>}
          </span>
        </Box>
      ),
    },
    {
      id: 'current_status',
      label: 'Status',
      render: value => (
        <Chip
          label={value || 'Available'}
          color={getStatusColor(value || 'Available')}
          size="small"
        />
      ),
    },
    {
      id: 'is_active',
      label: 'Active Status',
      render: value => (
        <Chip
          icon={value === 'Y' ? <CheckCircle /> : <Block />}
          label={value === 'Y' ? 'Active' : 'Inactive'}
          size="small"
          variant="outlined"
          color={value === 'Y' ? 'success' : 'error'}
        />
      ),
    },
  ];

  const getMovementTypeColor = (
    type: string
  ): 'primary' | 'success' | 'secondary' | 'error' | 'warning' | 'default' => {
    const typeLower = type.toLowerCase();
    const colors: Record<
      string,
      'primary' | 'success' | 'secondary' | 'error' | 'warning' | 'default'
    > = {
      transfer: 'primary',
      maintenance: 'warning',
      repair: 'error',
      disposal: 'secondary',
      return: 'success',
      other: 'default',
    };
    return colors[typeLower as keyof typeof colors] || 'default';
  };

  const movementsColumns: TableColumn<any>[] = [
    {
      id: 'id',
      label: 'Asset Info',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar className="!rounded !bg-primary-100 !text-primary-500">
            <Package className="w-5 h-5" />
          </Avatar>
          <Box>
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight"
            >
              Asset Movement #{row.id}
            </Typography>
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block !mt-0.5"
            >
              {row.asset_count || 0} asset(s) moved
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'from_location',
      label: 'Movement Details',
      render: (_value, row) => (
        <Box className="flex items-center gap-2">
          <Box className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-gray-400" />
            <span className="text-xs">{row.from_location}</span>
          </Box>
          <ArrowRight className="w-3 h-3 text-gray-400" />
          <Box className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-gray-400" />
            <span className="text-xs">{row.to_location}</span>
          </Box>
        </Box>
      ),
    },
    {
      id: 'movement_type',
      label: 'Type',
      render: value => (
        <Chip
          label={value || 'Other'}
          variant="outlined"
          color={getMovementTypeColor(value || 'other')}
          size="small"
          className="!capitalize"
        />
      ),
    },
    {
      id: 'performed_by',
      label: 'Performed By',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar className="!rounded !bg-primary-100 !text-primary-500">
            {row.performed_by?.charAt(0) || 'U'}
          </Avatar>
          <Box>
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight"
            >
              {row.performed_by || 'Unknown User'}
            </Typography>
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block !mt-0.5"
            >
              {row.performed_by_email || (
                <span className="italic text-gray-400 text-xs">No Email</span>
              )}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'movement_date',
      label: 'Date',
      render: value => (
        <Box className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-gray-400" />
          <span className="text-xs">{formatDate(value)}</span>
        </Box>
      ),
    },
    {
      id: 'approval_status',
      label: 'Approval Status',
      render: value => {
        const status = value || 'unknown';
        const statusLower = status.toLowerCase();

        const icon =
          statusLower === 'a' ? (
            <CheckCircle />
          ) : statusLower === 'p' ? (
            <Schedule />
          ) : statusLower === 'r' ? (
            <Block />
          ) : (
            <HelpOutline />
          );

        const color =
          statusLower === 'a'
            ? 'success'
            : statusLower === 'p'
              ? 'warning'
              : statusLower === 'r'
                ? 'error'
                : 'default';

        const label =
          statusLower === 'p'
            ? 'Pending'
            : statusLower === 'a'
              ? 'Approved'
              : statusLower === 'r'
                ? 'Rejected'
                : status;

        return (
          <Chip
            icon={icon}
            label={label}
            variant="outlined"
            color={color}
            size="small"
            className="!capitalize"
          />
        );
      },
    },
    {
      id: 'is_active',
      label: 'Status',
      render: value => (
        <Chip
          icon={value === 'Y' ? <CheckCircle /> : <Block />}
          label={value === 'Y' ? 'Active' : 'Inactive'}
          size="small"
          variant="outlined"
          color={value === 'Y' ? 'success' : 'error'}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <Box className="!flex !justify-between !items-center">
        <Box>
          <p className="!font-bold text-xl !text-gray-900">
            Asset Movement/Status Report
          </p>
          <p className="!text-gray-500 text-sm">
            Track asset movements, status, and warranty claims
          </p>
        </Box>
        {isRead && (
          <PopConfirm
            title="Export Report to Excel"
            description="Are you sure you want to export the current report data to Excel?"
            onConfirm={handleExportToExcel}
            confirmText="Export"
            cancelText="Cancel"
            placement="bottom"
          >
            <Button
              startIcon={<Download className="w-4 h-4" />}
              variant="outlined"
              loading={isExporting}
              loadingText="Exporting..."
              disabled={isExporting}
            >
              Export to Excel
            </Button>
          </PopConfirm>
        )}
      </Box>

      {isRead && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              type="date"
              label="Start Date"
              value={startDate}
              setValue={setStartDate}
            />
            <Input
              type="date"
              label="End Date"
              value={endDate}
              setValue={setEndDate}
            />
            <Select
              label="Asset Type"
              value={assetTypeId?.toString() || 'all'}
              onChange={e =>
                setAssetTypeId(
                  e.target.value && e.target.value !== 'all'
                    ? parseInt(e.target.value)
                    : undefined
                )
              }
              disableClearable
            >
              <MenuItem value="all">All Asset Types</MenuItem>
              {assetTypes.map((type: any) => (
                <MenuItem key={type.id} value={type.id.toString()}>
                  {type.name}
                </MenuItem>
              ))}
            </Select>
            <Select
              label="Status"
              value={assetStatus}
              onChange={e => setAssetStatus(e.target.value)}
              disableClearable
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="working">Working</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
              <MenuItem value="retired">Retired</MenuItem>
              <MenuItem value="available">Available</MenuItem>
            </Select>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        <StatsCard
          title="Total Assets"
          value={summary.total_assets}
          icon={<Package className="w-6 h-6" />}
          color="blue"
        />

        <StatsCard
          title="Movements"
          value={summary.total_movements}
          icon={<Move className="w-6 h-6" />}
          color="purple"
        />

        <StatsCard
          title="Pending Approvals"
          value={pendingMovements}
          icon={<Clock className="w-6 h-6" />}
          color="orange"
        />

        <StatsCard
          title="In Maintenance"
          value={inMaintenanceAssets}
          icon={<Wrench className="w-6 h-6" />}
          color="red"
        />
      </div>

      {/* Asset Master Table */}
      <Table
        actions={
          <Box className="flex font-bold items-center gap-2">
            <Package className="w-5 h-5" /> Asset Master (
            {reportData?.data?.assets?.length || 0})
          </Box>
        }
        columns={assetColumns}
        data={reportData?.data?.assets || []}
        loading={isFetching}
        pagination={false}
        isPermission={isRead}
        filterColunm={false}
      />

      {/* Asset Movements Table */}
      <Table
        actions={
          <Box className="flex font-bold items-center gap-2">
            <Move className="w-5 h-5" /> Asset Movements (
            {reportData?.data?.movements?.length || 0})
          </Box>
        }
        columns={movementsColumns}
        data={reportData?.data?.movements || []}
        loading={isFetching}
        pagination={false}
        filterColunm={false}
        isPermission={isRead}
      />
    </div>
  );
};

export default AssetMovementStatusReport;
