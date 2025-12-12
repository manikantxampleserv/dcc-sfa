import { Box, Chip, MenuItem } from '@mui/material';
import { useDepots } from 'hooks/useDepots';
import { usePermission } from 'hooks/usePermission';
import { usePromoEffectivenessReport } from 'hooks/useReports';
import { useZones } from 'hooks/useZones';
import {
  CheckCircle,
  Clock,
  Download,
  Package,
  Settings,
  Tag,
  XCircle,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { exportPromoEffectivenessReport } from 'services/reports/promoEffectiveness';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import Input from 'shared/Input';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';

const PromoEffectivenessReport: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [depotId, setDepotId] = useState<number | undefined>(undefined);
  const [zoneId, setZoneId] = useState<number | undefined>(undefined);
  const { isRead } = usePermission('report');

  const { data: reportData, isLoading } = usePromoEffectivenessReport(
    {
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      depot_id: depotId,
      zone_id: zoneId,
    },
    {
      enabled: isRead,
    }
  );

  const { data: depotsData } = useDepots();
  const { data: zonesData } = useZones();

  const depots = depotsData?.data || [];
  const zones = zonesData?.data || [];

  const summary = reportData?.summary || {
    total_promotions: 0,
    active_promotions: 0,
    upcoming_promotions: 0,
    expired_promotions: 0,
    total_products: 0,
    total_parameters: 0,
    unique_customer_types: 0,
    unique_depots: 0,
    unique_zones: 0,
  };

  // Handle export to Excel
  const handleExportToExcel = useCallback(async () => {
    try {
      await exportPromoEffectivenessReport({
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        depot_id: depotId,
        zone_id: zoneId,
      });
    } catch (error) {
      console.error('Error exporting report to Excel:', error);
    }
  }, [startDate, endDate, depotId, zoneId]);

  // Promotions columns
  const promotionsColumns: TableColumn<any>[] = [
    {
      id: 'name',
      label: 'Promotion',
      render: (_value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Tag className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">{row.name}</span>
            <span className="text-xs text-gray-500">{row.code}</span>
          </div>
        </div>
      ),
    },
    {
      id: 'type',
      label: 'Type',
      render: value => <span className="text-sm">{value}</span>,
    },
    {
      id: 'start_date',
      label: 'Start Date',
      render: value => formatDate(value) || 'N/A',
    },
    {
      id: 'end_date',
      label: 'End Date',
      render: value => formatDate(value) || 'N/A',
    },
    {
      id: 'depot_name',
      label: 'Depot',
      render: value => <span className="text-sm">{value}</span>,
    },
    {
      id: 'zone_name',
      label: 'Zone',
      render: value => <span className="text-sm">{value}</span>,
    },
    {
      id: 'total_products',
      label: 'Products',
      numeric: true,
      render: value => <span className="font-semibold text-sm">{value}</span>,
    },
    {
      id: 'total_parameters',
      label: 'Parameters',
      numeric: true,
      render: value => <span className="font-semibold text-sm">{value}</span>,
    },
    {
      id: 'status',
      label: 'Status',
      render: value => {
        const statusLower = String(value || '').toLowerCase();
        let chipColor: 'success' | 'warning' | 'error' | 'info' | 'default' =
          'default';

        if (statusLower === 'active' || statusLower === 'running') {
          chipColor = 'success';
        } else if (statusLower === 'upcoming') {
          chipColor = 'info';
        } else if (statusLower === 'expired') {
          chipColor = 'error';
        }

        return (
          <Chip
            label={value}
            size="small"
            className="!capitalize"
            color={chipColor}
            variant="outlined"
          />
        );
      },
    },
  ];

  // Promotion Products columns
  const productsColumns: TableColumn<any>[] = [
    {
      id: 'promotion_name',
      label: 'Promotion',
      render: (_value, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-sm">{row.promotion_name}</span>
          <span className="text-xs text-gray-500">{row.promotion_code}</span>
        </div>
      ),
    },
    {
      id: 'product_name',
      label: 'Product',
      render: (_value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">{row.product_name}</span>
            <span className="text-xs text-gray-500">{row.product_code}</span>
          </div>
        </div>
      ),
    },
  ];

  // Promotion Parameters columns
  const parametersColumns: TableColumn<any>[] = [
    {
      id: 'promotion_name',
      label: 'Promotion',
      render: (_value, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-sm">{row.promotion_name}</span>
          <span className="text-xs text-gray-500">{row.promotion_code}</span>
        </div>
      ),
    },
    {
      id: 'param_name',
      label: 'Parameter Name',
      render: value => <span className="text-sm">{value}</span>,
    },
    {
      id: 'param_type',
      label: 'Type',
      render: value => <span className="text-sm">{value}</span>,
    },
    {
      id: 'param_value',
      label: 'Value',
      render: value => (
        <span className="text-sm max-w-xs truncate" title={value}>
          {value}
        </span>
      ),
    },
    {
      id: 'param_category',
      label: 'Category',
      render: value => <span className="text-sm">{value}</span>,
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <Box className="!mb-3 !flex !justify-between !items-center">
        <Box>
          <p className="!font-bold text-xl !text-gray-900">
            Promo Effectiveness Report
          </p>
          <p className="!text-gray-500 text-sm">
            Track promotion performance and effectiveness
          </p>
        </Box>
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
          >
            Export to Excel
          </Button>
        </PopConfirm>
      </Box>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            label="Depot"
            value={depotId?.toString() || 'all'}
            onChange={e =>
              setDepotId(
                e.target.value && e.target.value !== 'all'
                  ? parseInt(e.target.value)
                  : undefined
              )
            }
          >
            <MenuItem value="all">All Depots</MenuItem>
            {depots.map((depot: any) => (
              <MenuItem key={depot.id} value={depot.id.toString()}>
                {depot.name}
              </MenuItem>
            ))}
          </Select>
          <Select
            label="Zone"
            value={zoneId?.toString() || 'all'}
            onChange={e =>
              setZoneId(
                e.target.value && e.target.value !== 'all'
                  ? parseInt(e.target.value)
                  : undefined
              )
            }
          >
            <MenuItem value="all">All Zones</MenuItem>
            {zones.map((zone: any) => (
              <MenuItem key={zone.id} value={zone.id.toString()}>
                {zone.name}
              </MenuItem>
            ))}
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Promotions
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {summary.total_promotions}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Tag className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {summary.active_promotions}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {summary.upcoming_promotions}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expired</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {summary.expired_promotions}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Promotions Table */}

      <Table
        actions={
          <Box className="flex font-bold items-center gap-2">
            <Tag className="w-5 h-5" />
            Promotions ({reportData?.data?.promotions?.length || 0})
          </Box>
        }
        columns={promotionsColumns}
        data={reportData?.data?.promotions || []}
        loading={isLoading}
        pagination={false}
      />

      {/* Promotion Products Table */}
      <Table
        actions={
          <Box className="flex font-bold items-center gap-2">
            <Package className="w-5 h-5" /> Promotion Products (
            {reportData?.data?.products?.length || 0})
          </Box>
        }
        columns={productsColumns}
        data={reportData?.data?.products || []}
        loading={isLoading}
        pagination={false}
      />

      {/* Promotion Parameters Table */}
      <Table
        actions={
          <Box className="flex font-bold items-center gap-2">
            <Settings className="w-5 h-5" /> Promotion Parameters (
            {reportData?.data?.parameters?.length || 0})
          </Box>
        }
        columns={parametersColumns}
        data={reportData?.data?.parameters || []}
        loading={isLoading}
        pagination={false}
      />
    </div>
  );
};

export default PromoEffectivenessReport;
