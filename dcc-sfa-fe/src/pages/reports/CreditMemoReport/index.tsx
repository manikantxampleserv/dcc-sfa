import { Visibility } from '@mui/icons-material';
import { Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import { usePermission } from 'hooks/usePermission';
import {
  useCreditMemoReport,
  useExportCreditMemoReport,
} from 'hooks/useReports';
import { useResolvedUom } from 'hooks/useUnitOfMeasurement';
import {
  Building2,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  Download,
  Package,
  Receipt,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CreditMemoReportItem } from 'services/reports/creditMemo';
import { ActionButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import DepotSelect from 'shared/DepotSelect';
import Input from 'shared/Input';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';

const CreditMemoReport: React.FC = () => {
  const navigate = useNavigate();
  const { isRead } = usePermission('report');
  const { uomCase } = useResolvedUom();
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [depotId, setDepotId] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const { data: reportData, isFetching } = useCreditMemoReport(
    {
      page,
      limit,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      depot_id: depotId,
      status: status === 'all' ? undefined : status,
      search: search || undefined,
    },
    {
      enabled: isRead,
    }
  );

  const { mutateAsync: exportReport, isPending: isExporting } =
    useExportCreditMemoReport();

  const summary = reportData?.summary || {
    total_credit_memos: 0,
    approved_memos: 0,
    pending_memos: 0,
    rejected_memos: 0,
    total_lines: 0,
    total_quantity: 0,
    total_value: 0,
  };

  const handleExportToExcel = useCallback(async () => {
    try {
      await exportReport({
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        depot_id: depotId,
        status: status === 'all' ? undefined : status,
        search: search || undefined,
      });
    } catch (error) {
      console.error('Error exporting credit memo report:', error);
    }
  }, [exportReport, startDate, endDate, depotId, status, search]);

  const getStatusChip = (memoStatus: string) => {
    switch (memoStatus) {
      case 'A':
        return (
          <Chip
            size="small"
            label="Approved"
            color="success"
            className="!font-medium"
          />
        );
      case 'P':
        return (
          <Chip
            size="small"
            label="Pending"
            color="warning"
            className="!font-medium"
          />
        );
      case 'R':
        return (
          <Chip
            size="small"
            label="Rejected"
            color="error"
            className="!font-medium"
          />
        );
      default:
        return (
          <Chip
            size="small"
            label={memoStatus || 'Unknown'}
            className="!font-medium"
          />
        );
    }
  };

  const columns: TableColumn<CreditMemoReportItem>[] = [
    {
      id: 'batch_ref',
      label: 'Batch Reference',
      render: (_value, row) => (
        <Box className="flex flex-col">
          <Typography
            variant="body2"
            className="!font-semibold !text-blue-600 hover:!underline cursor-pointer"
            onClick={() => navigate(`/reports/credit-memo/${row.id}`)}
          >
            {row.batch_ref}
          </Typography>
          <Typography variant="caption" className="!text-gray-400">
            {row.sap_docnums}
          </Typography>
        </Box>
      ),
    },

    {
      id: 'salesman',
      label: 'Salesman',
      render: (_value, row) => (
        <Box className="!flex !items-center !gap-2">
          <Avatar
            alt={row.salesman?.name || 'Salesman'}
            src={'mkx'}
            className="!rounded !bg-primary-100 !text-primary-600"
          />
          <Box className="flex flex-col">
            <Typography variant="body2" className="!font-medium !text-gray-900">
              {row.salesman?.name || 'N/A'}
            </Typography>
            <Typography variant="caption" className="!text-gray-500">
              {row.salesman_sap_code}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'depot',
      label: 'Depot',
      render: (_value, row) => (
        <Box className="!flex !items-center !gap-2">
          <Avatar
            alt={row.depot?.name || 'Depot'}
            className="!rounded !bg-blue-100 !text-blue-600 !text-sm"
          >
            <Building2 className="w-5 h-5" />
          </Avatar>
          <Box className="flex flex-col">
            <Typography variant="body2" className="!font-medium !text-gray-900">
              {row.depot?.name || row.depot_sap_code || 'N/A'}
            </Typography>
            {row.depot?.code && (
              <Typography variant="caption" className="!text-gray-500">
                {row.depot.code}
              </Typography>
            )}
          </Box>
        </Box>
      ),
    },
    {
      id: 'document_date',
      label: 'Doc Date',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-700">
          {row.document_date ? formatDate(row.document_date) : 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'total_lines',
      label: 'Items',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-700 !font-medium">
          {row.total_lines} {row.total_lines === 1 ? 'item' : 'items'}
        </Typography>
      ),
    },
    {
      id: 'total_quantity',
      label: 'Total Qty',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900 !font-semibold">
          {Number(row.total_quantity || 0).toLocaleString()} {uomCase}
        </Typography>
      ),
    },
    {
      id: 'total_value',
      label: 'Total Value (TZS)',
      render: (_value, row) => (
        <Typography variant="body2" className="!font-bold !text-gray-900">
          TZS{' '}
          {Number(row.total_value || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (_value, row) => getStatusChip(row.status),
    },
    {
      id: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_value, row) => (
        <div className="!flex !gap-2 !items-center">
          <ActionButton
            size="small"
            color="info"
            tooltip="View Details"
            icon={<Visibility fontSize="small" />}
            onClick={() => navigate(`/reports/credit-memo/${row.id}`)}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <Box className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <Box>
          <Typography variant="h5" className="!font-bold !text-gray-900">
            Credit Memo Report
          </Typography>
          <Typography variant="body2" className="!text-gray-500 !mt-0.5">
            Monitor, audit, and analyze SAP Credit Memos across salesmen and
            depots
          </Typography>
        </Box>

        <Box className="flex items-center gap-2">
          <PopConfirm
            title="Export Credit Memo Report"
            description="Are you sure you want to export this credit memo report to Excel?"
            onConfirm={handleExportToExcel}
            placement="top"
          >
            <Button
              variant="outlined"
              size="small"
              className="!border-gray-200 !text-gray-700 hover:!bg-gray-50 flex items-center gap-2"
              disabled={isExporting}
            >
              <Download size={16} />
              {isExporting ? 'Exporting...' : 'Export to Excel'}
            </Button>
          </PopConfirm>
        </Box>
      </Box>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
        <StatsCard
          title="Total Credit Memos"
          value={summary.total_credit_memos}
          icon={<Receipt size={20} />}
          color="blue"
          isLoading={isFetching}
        />
        <StatsCard
          title="Approved Memos"
          value={summary.approved_memos}
          icon={<CheckCircle2 size={20} />}
          color="green"
          isLoading={isFetching}
        />
        <StatsCard
          title="Pending Memos"
          value={summary.pending_memos}
          icon={<Clock size={20} />}
          color="amber"
          isLoading={isFetching}
        />
        <StatsCard
          title="Total Quantity"
          value={`${Number(summary.total_quantity || 0).toLocaleString()} ${uomCase}`}
          icon={<Package size={20} />}
          color="purple"
          isLoading={isFetching}
        />
        <StatsCard
          title="Total Value (TZS)"
          value={`TZS ${Number(summary.total_value || 0).toLocaleString(
            undefined,
            { maximumFractionDigits: 0 }
          )}`}
          icon={<CircleDollarSign size={20} />}
          color="emerald"
          isLoading={isFetching}
        />
      </div>

      {/* Filter and Content Area */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-lg mb-4">
        <div className="p-4 border-b border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <Input
              type="text"
              label="Search"
              placeholder="Batch, Doc #, Salesman..."
              value={search}
              setValue={val => {
                setSearch(val);
                setPage(1);
              }}
              size="small"
            />

            <Input
              type="date"
              label="From Date"
              value={startDate}
              setValue={val => {
                setStartDate(val);
                setPage(1);
              }}
              size="small"
            />

            <Input
              type="date"
              label="To Date"
              value={endDate}
              setValue={val => {
                setEndDate(val);
                setPage(1);
              }}
              size="small"
            />

            <DepotSelect
              label="Depot"
              value={depotId}
              onChange={val => {
                setDepotId(val);
                setPage(1);
              }}
              placeholder="All Depots"
              size="small"
            />

            <div>
              <Select
                label="Status"
                value={status}
                fullWidth
                onChange={e => {
                  setStatus(e.target.value as string);
                  setPage(1);
                }}
                disableClearable
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="P">Pending</MenuItem>
                <MenuItem value="A">Approved</MenuItem>
                <MenuItem value="R">Rejected</MenuItem>
              </Select>
            </div>
          </div>
        </div>

        <Box className="p-0">
          <Table
            columns={columns}
            data={reportData?.data || []}
            loading={isFetching}
            sortable={false}
            filterColunm={false}
            pagination={true}
            totalCount={
              reportData?.pagination?.total_count ??
              reportData?.pagination?.total ??
              0
            }
            page={page - 1}
            rowsPerPage={limit}
            onPageChange={newPage => setPage(newPage + 1)}
            emptyMessage="No credit memos found matching criteria"
          />
        </Box>
      </div>
    </>
  );
};

export default CreditMemoReport;
