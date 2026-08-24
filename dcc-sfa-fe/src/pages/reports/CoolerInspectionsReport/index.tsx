import { Close } from '@mui/icons-material';
import { Avatar, Box, Chip, Typography } from '@mui/material';
import { usePermission } from 'hooks/usePermission';
import {
  useCoolerInspectionsReport,
  useExportCoolerInspectionsReport,
} from 'hooks/useReports';
import {
  Calendar,
  Check,
  CheckCircle,
  Download,
  Droplets,
  Thermometer,
  Wrench,
  XCircle,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import Input from 'shared/Input';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import UserSelect from 'shared/UserSelect';
import { formatDate } from 'utils/dateUtils';

const CoolerInspectionsReport: React.FC = () => {
  const [barcode, setBarcode] = useState('');
  const [inspectorId, setInspectorId] = useState<number | undefined>(undefined);
  const [inspectionDate, setInspectionDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { isRead } = usePermission('report');

  const { mutateAsync: exportReport, isPending: isExporting } =
    useExportCoolerInspectionsReport();

  const { data: reportData, isFetching } = useCoolerInspectionsReport(
    {
      page,
      limit,
      barcode: barcode || undefined,
      status: 'all',
      inspector_id: inspectorId,
      inspection_date: inspectionDate || undefined,
    },
    {
      enabled: isRead,
    }
  );

  const summary = reportData?.stats || {
    total_inspections: 0,
    working_coolers: 0,
    not_working_coolers: 0,
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
        inspection_date: inspectionDate || undefined,
      });
    } catch (error) {
      console.error('Error exporting report to Excel:', error);
    }
  }, [exportReport, barcode, inspectorId, inspectionDate]);

  const handleUserChange = useCallback((_event: any, user: any) => {
    setInspectorId(user?.id || undefined);
    setPage(1);
  }, []);

  const handleFilterChange = useCallback(() => {
    setPage(1);
  }, []);

  const getWorkingStatusColor = (isWorking: string) => {
    switch (isWorking) {
      case 'Y':
        return 'success';
      case 'N':
        return 'error';
      default:
        return 'default';
    }
  };

  const getActionRequiredColor = (actionRequired: string) => {
    switch (actionRequired) {
      case 'Y':
        return 'success';
      case 'N':
        return 'error';
      default:
        return 'default';
    }
  };

  const columns: TableColumn<any>[] = [
    {
      id: 'cooler_info',
      label: 'Cooler Info',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.coolers?.code}
            className="!rounded !bg-blue-100 !text-blue-500"
          >
            <Droplets className="w-5 h-5" />
          </Avatar>
          <Box>
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight !font-medium"
            >
              {row.coolers?.code || 'Unknown Cooler'}
            </Typography>
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block !mt-0.5"
            >
              {row.coolers?.cooler_asset_master?.barcode || 'No Barcode'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'customer',
      label: 'Customer',
      render: (_value, row) => {
        const customer = row.coolers?.coolers_customers;
        return (
          <Box className="flex items-center gap-1">
            <Avatar
              alt={customer?.name || 'Customer'}
              src={'mkx'}
              className="!rounded !bg-primary-100 !text-primary-600"
            />
            <Box className="flex flex-col">
              <Typography
                variant="body1"
                className="!text-gray-900 !leading-tight"
              >
                {customer?.name || 'Unknown Customer'}
              </Typography>
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !block !mt-0.5"
              >
                {customer?.code ?? ''}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      id: 'inspection_details',
      label: 'Inspection Details',
      render: (_value, row) => (
        <Box className="flex flex-col gap-1">
          <Box className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-gray-400" />
            <span className="text-xs">
              {row.inspection_date
                ? formatDate(row.inspection_date)
                : 'Not inspected'}
            </span>
          </Box>
          {row.temperature !== null && row.temperature !== undefined && (
            <Box className="flex items-center gap-1">
              <Thermometer className="w-3 h-3 text-gray-400" />
              <span className="text-xs">{row.temperature}°C</span>
            </Box>
          )}
        </Box>
      ),
    },
    {
      id: 'working_status',
      label: 'Working Status',
      render: (_value, row) => (
        <Chip
          icon={row.is_working === 'Y' ? <Check /> : <Close />}
          label={row.is_working === 'Y' ? 'Working' : 'Not Working'}
          size="small"
          variant="outlined"
          color={getWorkingStatusColor(row.is_working)}
        />
      ),
    },
    {
      id: 'action_required',
      label: 'Action Required',
      render: (_value, row) => (
        <Chip
          label={row.action_required === 'Y' ? 'Yes' : 'No'}
          size="small"
          icon={row.action_required === 'Y' ? <Check /> : <Close />}
          variant="outlined"
          color={getActionRequiredColor(row.action_required)}
        />
      ),
    },
    {
      id: 'inspector',
      label: 'Inspector',
      render: (_value, row) => (
        <Box className="flex items-center gap-1">
          <Avatar
            alt={row.users?.name || 'Inspector'}
            src={'mkx'}
            className="!rounded !bg-primary-100 !text-primary-600"
          />
          <Box className="flex flex-col">
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight"
            >
              {row.users?.name || 'No inspector'}
            </Typography>
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block !mt-0.5"
            >
              {row.users?.employee_id || 'No email'}
            </Typography>
          </Box>
        </Box>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <Box className="!flex !justify-between !items-start sm:!items-center">
        <Box>
          <p className="!font-bold text-xl !text-gray-900">
            Cooler Inspections Report
          </p>
          <p className="!text-gray-500 text-sm">
            Track and analyze cooler inspections across all locations
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
          title="Total Inspections"
          value={summary.total_inspections}
          icon={<Wrench className="w-6 h-6" />}
          color="blue"
        />
        <StatsCard
          title="Working Coolers"
          value={summary.working_coolers}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
        />
        <StatsCard
          title="Not Working Coolers"
          value={summary.not_working_coolers}
          icon={<XCircle className="w-6 h-6" />}
          color="red"
        />
        <StatsCard
          title="Action Required"
          value={summary.action_required}
          icon={<Check className="w-6 h-6" />}
          color="orange"
        />
      </div>

      {/* Report Table */}
      <Table
        actions={
          <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-3 w-full">
            <Input
              label="Search Barcode/Code"
              className="!w-80"
              placeholder="Cooler code..."
              value={barcode}
              setValue={value => {
                setBarcode(value);
                handleFilterChange();
              }}
            />

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-start md:justify-end">
              <div className="w-full lg:w-64">
                <Input
                  type="date"
                  label="Inspection Date"
                  value={inspectionDate}
                  setValue={value => {
                    setInspectionDate(value);
                    handleFilterChange();
                  }}
                />
              </div>

              <Box className="!w-72">
                <UserSelect
                  label="Inspector"
                  placeholder="Select Inspector"
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
        emptyMessage="No cooler inspections found"
      />
    </div>
  );
};

export default CoolerInspectionsReport;
