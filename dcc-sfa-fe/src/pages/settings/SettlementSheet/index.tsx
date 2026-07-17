import { Visibility } from '@mui/icons-material';
import { MenuItem } from '@mui/material';
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
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { formatDateTime } from 'utils/dateUtils';

export default function SettlementSheet() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [depotFilter, setDepotFilter] = useState<number | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { isRead } = usePermission('settlement-sheet');

  const { data: responseData, isFetching } = useReconciliations(
    {
      page,
      limit,
      search: searchQuery || undefined,
      depot_id: depotFilter,
      date: selectedDate || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      rec_status: 'A',
      latest_only: false,
    },
    {
      enabled: isRead,
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
      id: 'reconciliation_date',
      label: 'Load Date',
      sortable: true,
      render: val =>
        val
          ? new Date(val as string).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : '-',
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
      id: 'id',
      label: 'Actions',
      render: (_val, row) => (
        <ActionButton
          color="info"
          icon={<Visibility />}
          tooltip="View Settlement Sheet"
          onClick={() => navigate(`/settings/settlement-sheet/${row.id}`)}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Settlement Sheets
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            View daily settlement sheets by salesman and depot.
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
                    setPage(1);
                  }}
                  className="!w-44"
                />

                <div className="w-52">
                  <DepotSelect
                    value={depotFilter ? ({ id: depotFilter } as any) : null}
                    onChange={(_, value) => {
                      setDepotFilter(value ? value.id : undefined);
                      setPage(1);
                    }}
                    placeholder="Filter by Depot"
                  />
                </div>

                <Select
                  value={statusFilter}
                  onChange={e => {
                    setStatusFilter(e.target.value as string);
                    setPage(1);
                  }}
                  className="!w-72"
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="Pending">Pending Verification</MenuItem>
                  <MenuItem value="Matched">Matched (CLEAN)</MenuItem>
                  <MenuItem value="Short">Shortage (Outlet Posting)</MenuItem>
                  <MenuItem value="Excess">Excess (Unload Adjustment)</MenuItem>
                  <MenuItem value="Blocked">Blocked (Force-Push Req)</MenuItem>
                </Select>
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
