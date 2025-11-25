import { Box, Chip, MenuItem } from '@mui/material';
import { useAssetTypes } from 'hooks/useAssetTypes';
import { useCustomers } from 'hooks/useCustomers';
import { usePermission } from 'hooks/usePermission';
import { useAssetMovementStatusReport } from 'hooks/useReports';
import { Download, FileText, Move, Package, Users } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { exportAssetMovementStatusReport } from 'services/reports/assetMovementStatus';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import Input from 'shared/Input';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';

const AssetMovementStatusReport: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [assetTypeId, setAssetTypeId] = useState<number | undefined>(undefined);
  const [assetStatus, setAssetStatus] = useState('all');
  const [customerId, setCustomerId] = useState<number | undefined>(undefined);
  const { isRead } = usePermission('report');

  const { data: reportData, isLoading } = useAssetMovementStatusReport(
    {
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      asset_type_id: assetTypeId,
      asset_status: assetStatus === 'all' ? undefined : assetStatus,
      customer_id: customerId,
    },
    {
      enabled: isRead,
    }
  );

  const { data: assetTypesData } = useAssetTypes();
  const { data: customersData } = useCustomers();

  const assetTypes = assetTypesData?.data || [];
  const customers = customersData?.data || [];

  const summary = reportData?.summary || {
    total_assets: 0,
    total_movements: 0,
    total_customer_assets: 0,
    total_warranty_claims: 0,
    assets_by_status: {},
    customer_assets_by_status: {},
    claims_by_status: {},
  };

  // Handle export to Excel
  const handleExportToExcel = useCallback(async () => {
    try {
      await exportAssetMovementStatusReport({
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        asset_type_id: assetTypeId,
        asset_status: assetStatus === 'all' ? undefined : assetStatus,
        customer_id: customerId,
      });
    } catch (error) {
      console.error('Error exporting report to Excel:', error);
    }
  }, [startDate, endDate, assetTypeId, assetStatus, customerId]);

  // Asset Master columns
  const assetColumns: TableColumn<any>[] = [
    {
      id: 'serial_number',
      label: 'Serial Number',
      render: value => <span className="font-semibold text-sm">{value}</span>,
    },
    {
      id: 'asset_type',
      label: 'Asset Type',
      render: value => <span className="text-sm">{value}</span>,
    },
    {
      id: 'category',
      label: 'Category',
      render: value => <span className="text-sm">{value}</span>,
    },
    {
      id: 'brand',
      label: 'Brand',
      render: value => <span className="text-sm">{value}</span>,
    },
    {
      id: 'current_location',
      label: 'Location',
      render: value => <span className="text-sm">{value}</span>,
    },
    {
      id: 'current_status',
      label: 'Status',
      render: value => {
        const statusLower = String(value || '').toLowerCase();
        let chipColor: 'success' | 'warning' | 'error' | 'info' | 'default' =
          'default';

        if (statusLower === 'active' || statusLower === 'working') {
          chipColor = 'success';
        } else if (statusLower === 'maintenance' || statusLower === 'pending') {
          chipColor = 'warning';
        } else if (
          statusLower === 'retired' ||
          statusLower === 'decommissioned'
        ) {
          chipColor = 'error';
        } else if (statusLower === 'available' || statusLower === 'in_stock') {
          chipColor = 'info';
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
    {
      id: 'assigned_to',
      label: 'Assigned To',
      render: value => <span className="text-sm">{value}</span>,
    },
  ];

  // Asset Movements columns
  const movementsColumns: TableColumn<any>[] = [
    {
      id: 'asset_serial',
      label: 'Asset Serial',
      render: value => <span className="font-semibold text-sm">{value}</span>,
    },
    {
      id: 'asset_type',
      label: 'Asset Type',
      render: value => <span className="text-sm">{value}</span>,
    },
    {
      id: 'from_location',
      label: 'From',
      render: value => <span className="text-sm">{value}</span>,
    },
    {
      id: 'to_location',
      label: 'To',
      render: value => <span className="text-sm">{value}</span>,
    },
    {
      id: 'movement_type',
      label: 'Type',
      render: value => <span className="text-sm">{value}</span>,
    },
    {
      id: 'movement_date',
      label: 'Movement Date',
      render: value => formatDate(value) || 'N/A',
    },
    {
      id: 'performed_by',
      label: 'Performed By',
      render: (_value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">
              {row.performed_by || 'N/A'}
            </span>
            <span className="text-xs text-gray-500">
              {row.performed_by_email || 'N/A'}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'notes',
      label: 'Notes',
      render: value => (
        <span className="text-sm max-w-xs truncate" title={value}>
          {value}
        </span>
      ),
    },
  ];

  // Customer Assets columns
  const customerAssetsColumns: TableColumn<any>[] = [
    {
      id: 'customer_name',
      label: 'Customer',
      render: (_value, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-sm">{row.customer_name}</span>
          <span className="text-xs text-gray-500">{row.customer_code}</span>
        </div>
      ),
    },
    {
      id: 'asset_type',
      label: 'Asset Type',
      render: value => <span className="text-sm">{value}</span>,
    },
    {
      id: 'serial_number',
      label: 'Serial Number',
      render: value => <span className="text-sm">{value}</span>,
    },
    {
      id: 'capacity',
      label: 'Capacity',
      numeric: true,
      render: value => <span className="text-sm">{value}</span>,
    },
    {
      id: 'install_date',
      label: 'Install Date',
      render: value => formatDate(value) || 'N/A',
    },
    {
      id: 'status',
      label: 'Status',
      render: value => {
        const statusLower = String(value || '').toLowerCase();
        let chipColor: 'success' | 'warning' | 'error' | 'info' | 'default' =
          'default';

        if (statusLower === 'working' || statusLower === 'active') {
          chipColor = 'success';
        } else if (statusLower === 'maintenance' || statusLower === 'down') {
          chipColor = 'warning';
        } else if (statusLower === 'broken' || statusLower === 'damaged') {
          chipColor = 'error';
        }

        return (
          <Chip
            label={value}
            size="small"
            className="!capitalize"
            color={chipColor}
          />
        );
      },
    },
    {
      id: 'technician_name',
      label: 'Technician',
      render: value => <span className="text-sm">{value}</span>,
    },
  ];

  // Warranty Claims columns
  const warrantyClaimsColumns: TableColumn<any>[] = [
    {
      id: 'asset_serial',
      label: 'Asset Serial',
      render: value => <span className="font-semibold text-sm">{value}</span>,
    },
    {
      id: 'asset_type',
      label: 'Asset Type',
      render: value => <span className="text-sm">{value}</span>,
    },
    {
      id: 'claim_date',
      label: 'Claim Date',
      render: value => formatDate(value) || 'N/A',
    },
    {
      id: 'issue_description',
      label: 'Issue',
      render: value => (
        <span className="text-sm max-w-xs truncate" title={value}>
          {value}
        </span>
      ),
    },
    {
      id: 'claim_status',
      label: 'Status',
      render: value => {
        const statusLower = String(value || '').toLowerCase();
        let chipColor: 'success' | 'warning' | 'error' | 'info' | 'default' =
          'default';

        if (statusLower === 'resolved' || statusLower === 'completed') {
          chipColor = 'success';
        } else if (statusLower === 'pending' || statusLower === 'in_progress') {
          chipColor = 'warning';
        } else if (statusLower === 'rejected' || statusLower === 'denied') {
          chipColor = 'error';
        } else if (statusLower === 'under_review') {
          chipColor = 'info';
        }

        return (
          <Chip
            label={value}
            size="small"
            className="!capitalize"
            color={chipColor}
          />
        );
      },
    },
    {
      id: 'resolved_date',
      label: 'Resolved Date',
      render: value => formatDate(value) || 'N/A',
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <Box className="!mb-3 !flex !justify-between !items-center">
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
            >
              Export to Excel
            </Button>
          </PopConfirm>
        )}
      </Box>

      {isRead && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="working">Working</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
              <MenuItem value="retired">Retired</MenuItem>
              <MenuItem value="available">Available</MenuItem>
            </Select>
            <Select
              label="Customer"
              value={customerId?.toString() || 'all'}
              onChange={e =>
                setCustomerId(
                  e.target.value && e.target.value !== 'all'
                    ? parseInt(e.target.value)
                    : undefined
                )
              }
            >
              <MenuItem value="all">All Customers</MenuItem>
              {customers.map((customer: any) => (
                <MenuItem key={customer.id} value={customer.id.toString()}>
                  {customer.name} ({customer.code})
                </MenuItem>
              ))}
            </Select>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Assets</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {summary.total_assets}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Movements</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {summary.total_movements}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Move className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Customer Assets
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {summary.total_customer_assets}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Warranty Claims
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {summary.total_warranty_claims}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
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
        loading={isLoading}
        pagination={false}
        isPermission={isRead}
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
        loading={isLoading}
        pagination={false}
        isPermission={isRead}
      />

      {/* Customer Assets Table */}
      <Table
        actions={
          <Box className="flex font-bold items-center gap-2">
            <Users className="w-5 h-5" /> Customer Assets (
            {reportData?.data?.customer_assets?.length || 0})
          </Box>
        }
        columns={customerAssetsColumns}
        data={reportData?.data?.customer_assets || []}
        loading={isLoading}
        pagination={false}
        isPermission={isRead}
      />

      {/* Warranty Claims Table */}
      <Table
        actions={
          <Box className="flex font-bold items-center gap-2">
            <FileText className="w-5 h-5" /> Warranty Claims (
            {reportData?.data?.warranty_claims?.length || 0})
          </Box>
        }
        columns={warrantyClaimsColumns}
        data={reportData?.data?.warranty_claims || []}
        loading={isLoading}
        pagination={false}
        isPermission={isRead}
      />
    </div>
  );
};

export default AssetMovementStatusReport;
