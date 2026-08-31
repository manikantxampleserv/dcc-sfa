import { Avatar, Box, Chip, Typography } from '@mui/material';
import { usePermission } from 'hooks/usePermission';
import { useCoolersReport, useExportCoolersReport } from 'hooks/useReports';
import {
  AlertTriangle,
  CheckCircle,
  Download,
  MapPin,
  Package,
  Wrench,
  Calendar,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import Input from 'shared/Input';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import UserSelect from 'shared/UserSelect';
import { formatDate } from 'utils/dateUtils';

const CoolersReport: React.FC = () => {
  const [barcode, setBarcode] = useState('');
  const [inspectorId, setInspectorId] = useState<number | undefined>(undefined);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { isRead } = usePermission('report');

  const { mutateAsync: exportReport, isPending: isExporting } =
    useExportCoolersReport();

  const { data: reportData, isFetching } = useCoolersReport(
    {
      page,
      limit,
      barcode: barcode || undefined,
      status: 'all',
      inspector_id: inspectorId,
    },
    {
      enabled: isRead,
    }
  );

  const summary = reportData?.stats || {
    total: 0,
    deployed: 0,
    working: 0,
    action_required: 0,
  };

  const pagination = reportData?.meta || {
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    has_next: false,
    has_previous: false,
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage + 1);
  };

  const handleExportToExcel = useCallback(async () => {
    try {
      await exportReport({
        barcode: barcode || undefined,
        status: 'all',
        inspector_id: inspectorId,
      });
    } catch (error) {
      console.error('Error exporting report to Excel:', error);
    }
  }, [exportReport, barcode, inspectorId]);

  const handleUserChange = useCallback((_event: any, user: any) => {
    setInspectorId(user?.id || undefined);
    setPage(1);
  }, []);

  const handleFilterChange = useCallback(() => {
    setPage(1);
  }, []);

  const columns: TableColumn<any>[] = [
    {
      id: 'asset_info',
      label: 'Cooler Info',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar className="!rounded !bg-blue-100 !text-blue-500">
            <Package className="w-5 h-5" />
          </Avatar>
          <Box>
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight !font-medium"
            >
              {row.name || row.code || 'Unknown'}
            </Typography>
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block !mt-0.5"
            >
              {row.barcode || row.serial_number || '—'} • {row.brand}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'cooler_type',
      label: 'Types',
      render: (_value, row) => (
        <Box className="flex flex-col gap-0.5">
          <Typography variant="body2" className="!text-gray-900 !leading-tight">
            {row.cooler_type || row.asset_type || '—'}
          </Typography>
          <Typography variant="caption" className="!text-gray-500 !text-xs">
            {row.cooler_sub_type || row.asset_sub_type || ''}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'customer',
      label: 'Customer / Location',
      render: (_value, row) => {
        const customer = row.customer;
        const isDepot = customer?.type === 'depot';
        return (
          <Box className="flex items-center gap-2">
            <Avatar
              alt={customer?.name || 'Location'}
              className="!rounded !bg-primary-100 !text-primary-600 !w-8 !h-8 shrink-0"
            >
              <MapPin className="w-4 h-4" />
            </Avatar>
            <Box className="flex flex-col">
              <Box className="flex items-center gap-1">
                <Typography
                  variant="body2"
                  className="!text-gray-900 !leading-tight"
                >
                  {customer?.name || row.current_location || 'Not deployed'}
                </Typography>
                {customer && (
                  <span
                    className={`text-[10px] px-1 rounded font-medium ${
                      isDepot
                        ? 'bg-purple-100 text-purple-600'
                        : 'bg-green-100 text-green-600'
                    }`}
                  >
                    {isDepot ? 'Depot' : 'Outlet'}
                  </span>
                )}
              </Box>
              {customer?.code && (
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !block !mt-0.5"
                >
                  {customer.code}
                </Typography>
              )}
            </Box>
          </Box>
        );
      },
    },
    {
      id: 'cooler_status',
      label: 'Cooler Status',
      render: (_value, row) => (
        <Chip
          label={row.cooler_status || 'Not Deployed'}
          size="small"
          color={
            row.cooler_status === 'working'
              ? 'success'
              : row.cooler_status === 'not_working'
                ? 'error'
                : 'default'
          }
          variant="outlined"
        />
      ),
    },
    {
      id: 'active_status',
      label: 'Active',
      render: (_value, row) => (
        <Chip
          label={row.is_active === 'Y' ? 'Active' : 'Inactive'}
          size="small"
          color={row.is_active === 'Y' ? 'success' : 'error'}
          variant="outlined"
        />
      ),
    },
    {
      id: 'inspection_details',
      label: 'Last Inspection',
      render: (_value, row) => (
        <Box className="flex flex-col gap-1">
          <Box className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-gray-400" />
            <span className="text-xs">
              {row.inspection_date ? (
                formatDate(row.inspection_date)
              ) : (
                <span className="text-gray-400 italic">Not inspected</span>
              )}
            </span>
          </Box>
          {row.install_date && (
            <span className="text-xs text-gray-400">
              Installed: {formatDate(row.install_date)}
            </span>
          )}
        </Box>
      ),
    },
    {
      id: 'inspector',
      label: 'Inspector',
      render: (_value, row) => {
        const inspector = row.inspector;
        if (!inspector) {
          return (
            <span className="text-xs italic text-gray-400">No inspector</span>
          );
        }
        return (
          <Box className="flex items-center gap-1">
            <Avatar
              alt={inspector.name}
              src={'mkx'}
              className="!rounded !bg-primary-100 !text-primary-600 !w-7 !h-7"
            />
            <Box className="flex flex-col">
              <Typography
                variant="body2"
                className="!text-gray-900 !leading-tight"
              >
                {inspector.name}
              </Typography>
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !block !mt-0.5"
              >
                {inspector.employee_id || inspector.email || ''}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <Box className="!flex !justify-between !items-start sm:!items-center">
        <Box>
          <p className="!font-bold text-xl !text-gray-900">Coolers Report</p>
          <p className="!text-gray-500 text-sm">
            Track and analyze Coolers across all locations
          </p>
        </Box>
        <PopConfirm
          title="Export Report to Excel"
          description="Are you sure you want to export the current report data to Excel?"
          onConfirm={handleExportToExcel}
          confirmText="Export"
          cancelText="Cancel"
          placement="bottom"
          disabled={isExporting}
        >
          <Button
            startIcon={<Download className="w-4 h-4" />}
            variant="outlined"
            loading={isExporting}
          >
            Export to Excel
          </Button>
        </PopConfirm>
      </Box>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Coolers"
          value={summary.total}
          icon={<Wrench className="w-6 h-6" />}
          color="blue"
          isLoading={isFetching}
        />
        <StatsCard
          title="Deployed"
          value={summary.deployed}
          icon={<MapPin className="w-6 h-6" />}
          color="green"
          isLoading={isFetching}
        />
        <StatsCard
          title="Working"
          value={summary.working}
          icon={<CheckCircle className="w-6 h-6" />}
          color="orange"
          isLoading={isFetching}
        />
        <StatsCard
          title="Action Required"
          value={summary.action_required}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="red"
          isLoading={isFetching}
        />
      </div>

      {/* Report Table */}
      <Table
        actions={
          <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-3 w-full">
            <Input
              label="Search Barcode/Code"
              className="!w-80"
              placeholder="Barcode or code..."
              value={barcode}
              setValue={value => {
                setBarcode(value);
                handleFilterChange();
              }}
            />

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-start md:justify-end">
              <Box className="!w-72">
                <UserSelect
                  label="Inspector"
                  placeholder="Filter by Inspector"
                  value={inspectorId}
                  onChange={handleUserChange}
                  fullWidth={true}
                  size="small"
                />
              </Box>
            </div>
          </div>
        }
        columns={columns}
        sortable={false}
        filterColunm={false}
        data={reportData?.data || []}
        loading={isFetching}
        totalCount={pagination.total_count || 0}
        page={pagination.current_page - 1 || 0}
        rowsPerPage={limit}
        onPageChange={handlePageChange}
        emptyMessage="No Coolers found"
      />
    </div>
  );
};

export default CoolersReport;
