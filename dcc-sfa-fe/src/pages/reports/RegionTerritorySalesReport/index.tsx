import { Box, MenuItem } from '@mui/material';
import { useDepots } from 'hooks/useDepots';
import { usePermission } from 'hooks/usePermission';
import { useRegionTerritorySalesReport } from 'hooks/useReports';
import { useZones } from 'hooks/useZones';
import {
  DollarSign,
  Download,
  MapPin,
  ShoppingCart,
  TrendingUp,
  Users,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { exportRegionTerritorySalesReport } from 'services/reports/regionTerritorySales';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import Input from 'shared/Input';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';

const RegionTerritorySalesReport: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [depotId, setDepotId] = useState<number | undefined>(undefined);
  const [zoneId, setZoneId] = useState<number | undefined>(undefined);
  const { isRead } = usePermission('report');

  const { data: reportData, isLoading } = useRegionTerritorySalesReport(
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
    total_zones: 0,
    total_customers: 0,
    total_routes: 0,
    total_orders: 0,
    total_order_value: 0,
    total_invoices: 0,
    total_invoice_value: 0,
    total_collection: 0,
  };

  const handleExportToExcel = useCallback(async () => {
    try {
      await exportRegionTerritorySalesReport({
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        depot_id: depotId,
        zone_id: zoneId,
      });
    } catch (error) {
      console.error('Error exporting report to Excel:', error);
    }
  }, [startDate, endDate, depotId, zoneId]);

  const allRoutes =
    reportData?.data?.zones?.flatMap(zone => zone.routes || []) || [];

  const territoryColumns: TableColumn<any>[] = [
    {
      id: 'name',
      label: 'Territory',
      render: (_value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">{row.name}</span>
            <span className="text-xs text-gray-500">{row.code}</span>
          </div>
        </div>
      ),
    },
    {
      id: 'depot_name',
      label: 'Depot',
      render: value => <span className="text-sm">{value}</span>,
    },
    {
      id: 'customer_count',
      label: 'Customers',
      numeric: true,
      render: value => <span className="font-semibold text-sm">{value}</span>,
    },
    {
      id: 'route_count',
      label: 'Routes',
      numeric: true,
      render: value => <span className="font-semibold text-sm">{value}</span>,
    },
    {
      id: 'total_orders',
      label: 'Orders',
      numeric: true,
      render: value => <span className="font-semibold text-sm">{value}</span>,
    },
    {
      id: 'total_order_value',
      label: 'Order Value',
      numeric: true,
      render: value => `₹${Number(value).toLocaleString()}`,
    },
    {
      id: 'total_invoices',
      label: 'Invoices',
      numeric: true,
      render: value => <span className="font-semibold text-sm">{value}</span>,
    },
    {
      id: 'total_invoice_value',
      label: 'Invoice Value',
      numeric: true,
      render: value => `₹${Number(value).toLocaleString()}`,
    },
    {
      id: 'total_collection',
      label: 'Collection',
      numeric: true,
      render: value => (
        <span className="font-semibold text-green-600">
          ₹{Number(value).toLocaleString()}
        </span>
      ),
    },
  ];

  const routeColumns: TableColumn<any>[] = [
    {
      id: 'route_name',
      label: 'Route',
      render: (_value, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-sm">{row.route_name}</span>
          <span className="text-xs text-gray-500">{row.route_code}</span>
        </div>
      ),
    },
    {
      id: 'salesperson_name',
      label: 'Sales Person',
      render: value => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <span className="font-semibold text-sm">{value}</span>
        </div>
      ),
    },
    {
      id: 'customers',
      label: 'Customers',
      numeric: true,
      render: value => <span className="font-semibold text-sm">{value}</span>,
    },
    {
      id: 'orders',
      label: 'Orders',
      numeric: true,
      render: value => <span className="font-semibold text-sm">{value}</span>,
    },
    {
      id: 'order_value',
      label: 'Order Value',
      numeric: true,
      render: value => `₹${Number(value).toLocaleString()}`,
    },
    {
      id: 'invoices',
      label: 'Invoices',
      numeric: true,
      render: value => <span className="font-semibold text-sm">{value}</span>,
    },
    {
      id: 'invoice_value',
      label: 'Invoice Value',
      numeric: true,
      render: value => `₹${Number(value).toLocaleString()}`,
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <Box className="!mb-3 !flex !justify-between !items-center">
        <Box>
          <p className="!font-bold text-xl !text-gray-900">
            Region/Territory Sales Report
          </p>
          <p className="!text-gray-500 text-sm">
            Track sales performance across territories and routes
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
            label="Territory"
            value={zoneId?.toString() || 'all'}
            onChange={e =>
              setZoneId(
                e.target.value && e.target.value !== 'all'
                  ? parseInt(e.target.value)
                  : undefined
              )
            }
          >
            <MenuItem value="all">All Territories</MenuItem>
            {zones.map((zone: any) => (
              <MenuItem key={zone.id} value={zone.id.toString()}>
                {zone.name}
              </MenuItem>
            ))}
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Territories
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {summary.total_zones}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Customers
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {summary.total_customers}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {summary.total_orders}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Collection
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ₹{summary.total_collection.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Territory Performance Table */}
      <Table
        actions={
          <Box className="flex font-bold items-center gap-2">
            <MapPin className="w-5 h-5" />
            Territory Performance ({reportData?.data?.zones?.length || 0})
          </Box>
        }
        columns={territoryColumns}
        data={reportData?.data?.zones || []}
        loading={isLoading}
        pagination={false}
        isPermission={isRead}
      />

      {/* Route Performance Table */}
      <Table
        actions={
          <Box className="flex font-bold items-center gap-2">
            <TrendingUp className="w-5 h-5" /> Route Performance (
            {allRoutes.length})
          </Box>
        }
        columns={routeColumns}
        data={allRoutes}
        loading={isLoading}
        pagination={false}
        isPermission={isRead}
      />
    </div>
  );
};

export default RegionTerritorySalesReport;
