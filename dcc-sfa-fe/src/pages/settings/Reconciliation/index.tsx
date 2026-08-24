import { Visibility } from '@mui/icons-material';
import { Chip } from '@mui/material';
import { usePermission } from 'hooks/usePermission';
import {
  useReconciliations,
  type ReconciliationRecord,
} from 'hooks/useReconciliation';
import { AlertCircle, BarChart, ClipboardList, DollarSign } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActionButton } from 'shared/ActionButton';
import DepotSelect from 'shared/DepotSelect';
import Input from 'shared/Input';
import SearchInput from 'shared/SearchInput';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate, formatDateTime } from 'utils/dateUtils';

export default function Reconciliation() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(
    sessionStorage.getItem('reconciliation_date_filter') ||
      new Date().toISOString().split('T')[0]
  );
  const [depotFilter, setDepotFilter] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { isRead } = usePermission('reconciliation');

  const { data: responseData, isFetching } = useReconciliations(
    {
      page,
      limit,
      search: searchQuery || undefined,
      depot_id: depotFilter,
      date: selectedDate || undefined,
      status: 'all',
    },
    {
      enabled: isRead,
      refetchOnMount: 'always',
    }
  );

  const records = responseData?.data || [];
  const totalCount = responseData?.meta?.total_count || 0;

  const stats: {
    expected: number;
    actual: number;
    default_outlet: number;
    unload_adjustment: number;
    pending: number;
  } = (responseData?.stats as any) || {
    expected: 0,
    actual: 0,
    default_outlet: 0,
    unload_adjustment: 0,
    pending: 0,
  };

  const columns: TableColumn<ReconciliationRecord>[] = [
    {
      id: 'id',
      label: 'ROP ID',
      sortable: true,
      render: (_val, row) => (
        <span className="font-medium text-gray-700">
          REC-{row.id.toString().padStart(4, '0')}
        </span>
      ),
    },
    { id: 'salesmanSapCode', label: 'SAP Code', sortable: true },
    { id: 'salesmanName', label: 'Rep Name', sortable: true },
    { id: 'depot', label: 'Depot/Route', sortable: true },
    {
      id: 'load_date',
      label: 'Load Date',
      sortable: true,
      render: val => (val ? formatDate(val) : '-'),
    },
    {
      id: 'totalItems',
      label: 'Total SKUs',
      render: val => (
        <span className="font-semibold text-gray-700">{val as number}</span>
      ),
    },
    {
      id: 'pendingItems',
      label: 'Pending',
      render: val => (
        <span
          className={`font-semibold ${(val as number) > 0 ? 'text-orange-600' : 'text-gray-400'}`}
        >
          {val as number}
        </span>
      ),
    },
    {
      id: 'matchedItems',
      label: 'Matched',
      render: val => (
        <span
          className={`font-semibold ${(val as number) > 0 ? 'text-green-600' : 'text-gray-400'}`}
        >
          {val as number}
        </span>
      ),
    },
    {
      id: 'createdate',
      label: 'Created Date',
      sortable: true,
      render: val => (val ? formatDateTime(val) : '-'),
    },
    {
      id: 'overallStatus',
      label: 'Status',
      sortable: true,
      render: val => {
        const s = val as string;
        const color = s === 'A' ? 'success' : s === 'P' ? 'warning' : 'error';
        return (
          <Chip
            label={s === 'A' ? 'Approved' : s === 'P' ? 'Pending' : 'Rejected'}
            color={color}
            size="small"
            variant="filled"
            className="!font-medium"
          />
        );
      },
    },

    {
      id: 'id',
      label: 'Actions',
      render: (_val, row) => (
        <ActionButton
          size="small"
          color="info"
          icon={<Visibility />}
          tooltip="View Items"
          onClick={() => navigate(`/settings/reconciliation/${row.id}`)}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-row justify-between items-center">
        <div>
          <h1 className="!font-bold text-xl !text-gray-900">
            ROP Verification & Reconciliation
          </h1>
          <p className="text-sm text-gray-500">
            DCC SFA Clerk Portal — Click a row to view loaded products for that
            salesman.
          </p>
        </div>
      </div>

      {/* Stats Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Expected ROP"
          value={stats.expected.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
          icon={<ClipboardList className="w-6 h-6" />}
          color="blue"
          isLoading={isFetching}
        />
        <StatsCard
          title="Total Actual ROP"
          value={stats.actual.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
          icon={<DollarSign className="w-6 h-6" />}
          color="green"
          isLoading={isFetching}
        />
        <StatsCard
          title="Total Default Outlet Posting"
          value={stats.default_outlet.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
          icon={<BarChart className="w-6 h-6" />}
          color="red"
          isLoading={isFetching}
        />
        <StatsCard
          title="Total Unload Adjustment"
          value={stats.unload_adjustment.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
          icon={<AlertCircle className="w-6 h-6" />}
          color="orange"
          isLoading={isFetching}
        />
      </div>

      {/* Main Table */}
      <Table
        data={records}
        getRowId={row => row.id}
        tableId="reconciliation-list-table"
        initialOrder="asc"
        columns={columns}
        loading={isFetching}
        totalCount={totalCount}
        page={page - 1}
        rowsPerPage={limit}
        onPageChange={newPage => setPage(newPage + 1)}
        isPermission={isRead}
        emptyMessage="No reconciliation records found."
        actions={
          isRead ? (
            <div className="flex justify-between flex-1 items-center flex-wrap gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <SearchInput
                  placeholder="Search by rep name..."
                  value={searchQuery}
                  onChange={val => {
                    setSearchQuery(val);
                    setPage(1);
                  }}
                  debounceMs={300}
                  showClear={true}
                  className="!w-64"
                />
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={e => {
                    setSelectedDate(e.target.value);
                    sessionStorage.setItem(
                      'reconciliation_date_filter',
                      e.target.value
                    );
                    setPage(1);
                  }}
                  className="!w-44"
                />

                <div className="w-64">
                  <DepotSelect
                    value={depotFilter ? ({ id: depotFilter } as any) : null}
                    onChange={(_, value) => {
                      setDepotFilter(value ? value.id : undefined);
                      setPage(1);
                    }}
                    placeholder="Filter by Depot"
                  />
                </div>
              </div>
            </div>
          ) : (
            false
          )
        }
      />
    </div>
  );
}
