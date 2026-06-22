import { Chip, MenuItem, TextField } from '@mui/material';
import {
  AlertCircle,
  BarChart,
  ClipboardList,
  DollarSign,
  Download,
  FileSpreadsheet,
  Save,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Button from 'shared/Button';
import Input from 'shared/Input';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';

// Mock data representing the system's expected ROP at the SKU level
const mockSystemData = [
  {
    id: 'ROP-101',
    stockKey: 'STK-001',
    salesmanSapCode: 'SAP-8921',
    salesmanName: 'John Doe',
    depot: 'North-East-01',
    skuCode: 'BEV-001',
    skuName: 'Premium Cola 500ml',
    batchNumber: 'B-2606A',
    expectedRop: 1200.0,
    status: 'Pending',
    verifiedBy: '',
    verifiedOn: '',
  },
  {
    id: 'ROP-102',
    stockKey: 'STK-002',
    salesmanSapCode: 'SAP-8921',
    salesmanName: 'John Doe',
    depot: 'North-East-01',
    skuCode: 'BEV-002',
    skuName: 'Orange Soda 500ml',
    batchNumber: 'B-2606A',
    expectedRop: 660.0,
    status: 'Pending',
    verifiedBy: '',
    verifiedOn: '',
  },
  {
    id: 'ROP-103',
    stockKey: 'STK-003',
    salesmanSapCode: 'SAP-8921',
    salesmanName: 'John Doe',
    depot: 'North-East-01',
    skuCode: 'SNC-001',
    skuName: 'Potato Chips Salted',
    batchNumber: 'B-2606B',
    expectedRop: 1500.0,
    status: 'Pending',
    verifiedBy: '',
    verifiedOn: '',
  },
  {
    id: 'ROP-104',
    stockKey: 'STK-004',
    salesmanSapCode: 'SAP-8921',
    salesmanName: 'John Doe',
    depot: 'North-East-01',
    skuCode: 'SNC-002',
    skuName: 'Spicy Nachos',
    batchNumber: 'B-2606B',
    expectedRop: 810.0,
    status: 'Pending',
    verifiedBy: '',
    verifiedOn: '',
  },
  {
    id: 'ROP-105',
    stockKey: 'STK-005',
    salesmanSapCode: 'SAP-8921',
    salesmanName: 'John Doe',
    depot: 'North-East-01',
    skuCode: 'WAT-001',
    skuName: 'Mineral Water 1L',
    batchNumber: 'B-2606C',
    expectedRop: 1440.0,
    status: 'Pending',
    verifiedBy: '',
    verifiedOn: '',
  },
];

export default function Reconciliation() {
  const [records, setRecords] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('2026-06-22');
  const [repFilter, setRepFilter] = useState('all');
  const [routeFilter, setRouteFilter] = useState('all');
  const [isSaving, setIsSaving] = useState(false);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  useEffect(() => {
    const initializedData = mockSystemData.map(item => ({
      ...item,
      actualRop: '',
      variance: null,
      resolutionAction: '',
      defaultOutletPostingQty: '',
      unloadAdjustmentQty: '',
    }));
    setRecords(initializedData);
  }, []);

  const handleActualChange = (id: string, value: string) => {
    setRecords(prevRecords =>
      prevRecords.map(record => {
        if (record.id === id) {
          const numericValue = parseFloat(value);
          const variance =
            value === '' || isNaN(numericValue)
              ? null
              : numericValue - record.expectedRop;

          let newStatus = 'Pending';
          if (variance === 0) newStatus = 'Matched';
          else if (variance !== null && variance < 0) newStatus = 'Short';
          else if (variance !== null && variance > 0) newStatus = 'Excess';

          return {
            ...record,
            actualRop: value,
            variance: variance,
            status: newStatus,
          };
        }
        return record;
      })
    );
  };

  const handleFieldChange = (id: string, field: string, value: string) => {
    setRecords(prevRecords =>
      prevRecords.map(record =>
        record.id === id ? { ...record, [field]: value } : record
      )
    );
  };

  const autoFillMatchAll = () => {
    if (
      window.confirm(
        "Are you sure you want to auto-fill all empty 'Actual' amounts with the 'Expected' amounts?"
      )
    ) {
      setRecords(prevRecords =>
        prevRecords.map(record => ({
          ...record,
          actualRop:
            record.actualRop === ''
              ? record.expectedRop.toString()
              : record.actualRop,
          variance: record.actualRop === '' ? 0 : record.variance,
          status: record.actualRop === '' ? 'Matched' : record.status,
        }))
      );
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('Daily ROP Reconciliation Data Saved Successfully.');
    }, 1000);
  };

  const filteredRecords = useMemo(() => {
    return records.filter(
      record =>
        (record.skuName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.skuCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.id.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (repFilter === 'all' || record.salesmanName === repFilter) &&
        (routeFilter === 'all' || record.depot === routeFilter)
    );
  }, [records, searchQuery, repFilter, routeFilter]);

  const paginatedRecords = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return filteredRecords.slice(startIndex, startIndex + limit);
  }, [filteredRecords, page, limit]);

  const totals = useMemo(() => {
    return filteredRecords.reduce(
      (acc, record) => {
        acc.expected += record.expectedRop || 0;
        acc.actual += parseFloat(record.actualRop) || 0;
        if (record.status === 'Pending') acc.pending++;
        return acc;
      },
      { expected: 0, actual: 0, pending: 0 }
    );
  }, [filteredRecords]);

  const totalVariance = totals.actual - totals.expected;

  const columns: TableColumn<any>[] = [
    {
      id: 'id',
      label: 'ROP ID',
      sortable: true,
      render: id => <span className="font-medium text-gray-700">{id}</span>,
    },
    { id: 'stockKey', label: 'Stock Key', sortable: true },
    { id: 'salesmanSapCode', label: 'Rep SAP', sortable: true },
    { id: 'salesmanName', label: 'Rep Name', sortable: true },
    { id: 'depot', label: 'Depot/Route', sortable: true },
    { id: 'skuCode', label: 'SKU Code', sortable: true },
    { id: 'skuName', label: 'SKU Name', sortable: true },
    {
      id: 'expectedRop',
      label: 'Expected',
      sortable: true,
      render: val => (
        <span className="font-semibold text-gray-800">{val?.toFixed(2)}</span>
      ),
    },
    {
      id: 'actualRop',
      label: 'Actual',
      render: (_, row) => (
        <TextField
          type="number"
          size="small"
          placeholder="0.00"
          value={row.actualRop}
          onChange={e => handleActualChange(row.id, e.target.value)}
          inputProps={{
            min: 0,
            step: '0.01',
            style: { textAlign: 'right', width: '80px' },
          }}
          className="bg-yellow-50/30"
        />
      ),
    },
    {
      id: 'variance',
      label: 'Variance',
      render: (_, row) => {
        if (row.variance === null)
          return <span className="text-gray-400">-</span>;
        const color =
          row.variance === 0
            ? 'text-green-600'
            : row.variance < 0
              ? 'text-red-600'
              : 'text-blue-600';
        const sign = row.variance > 0 ? '+' : '';
        return (
          <span className={`font-bold ${color}`}>
            {sign}
            {row.variance.toFixed(2)}
          </span>
        );
      },
    },
    {
      id: 'resolutionAction',
      label: 'Resolution Action',
      render: (_, row) => (
        <Select
          size="small"
          value={row.resolutionAction}
          onChange={e =>
            handleFieldChange(
              row.id,
              'resolutionAction',
              e.target.value as string
            )
          }
          disabled={row.variance === 0 || row.variance === null}
          className="!w-32 bg-white"
        >
          <MenuItem value="">
            <em>Select...</em>
          </MenuItem>
          <MenuItem value="Deduct from Salary">Deduct from Salary</MenuItem>
          <MenuItem value="Write Off">Write Off</MenuItem>
          <MenuItem value="Hold Pending">Hold Pending</MenuItem>
          <MenuItem value="Credit Rep">Credit Rep</MenuItem>
        </Select>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      render: status => {
        let color: 'warning' | 'success' | 'error' | 'info' = 'warning';
        if (status === 'Matched') color = 'success';
        else if (status === 'Short') color = 'error';
        else if (status === 'Excess') color = 'info';

        return (
          <Chip
            label={status}
            color={color}
            size="small"
            variant="filled"
            className="!capitalize font-medium"
          />
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-row justify-between items-center">
        <div>
          <h1 className="!font-bold text-xl !text-gray-900">Reconciliation</h1>
          <p className="text-sm text-gray-500">
            DCC SFA Clerk Portal - Reconcile system expected amounts with actual
            clerk inputs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outlined"
            startIcon={<FileSpreadsheet className="w-4 h-4" />}
            onClick={autoFillMatchAll}
          >
            Auto-Fill Expected
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Save className="w-4 h-4" />}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save & Reconcile'}
          </Button>
        </div>
      </div>

      {/* Stats Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Expected"
          value={`$${totals.expected.toFixed(2)}`}
          icon={<ClipboardList className="w-6 h-6" />}
          color="blue"
        />
        <StatsCard
          title="Total Actual"
          value={`$${totals.actual.toFixed(2)}`}
          icon={<DollarSign className="w-6 h-6" />}
          color="green"
        />
        <StatsCard
          title="Net Variance"
          value={`${totalVariance > 0 ? '+' : ''}$${totalVariance.toFixed(2)}`}
          icon={<BarChart className="w-6 h-6" />}
          color={
            totalVariance === 0 ? 'green' : totalVariance < 0 ? 'red' : 'yellow'
          }
        />
        <StatsCard
          title="Pending SKUs"
          value={totals.pending}
          icon={<AlertCircle className="w-6 h-6" />}
          color="red"
        />
      </div>

      {/* Main Table */}
      <Table
        data={paginatedRecords}
        getRowId={row => row.id}
        tableId="rop-reconciliation-table"
        initialOrder="asc"
        stickyHeader
        columns={columns}
        loading={false}
        totalCount={filteredRecords.length}
        page={page - 1}
        rowsPerPage={limit}
        onPageChange={newPage => setPage(newPage + 1)}
        emptyMessage="No reconciliation records found."
        actions={
          <div className="flex justify-between flex-1 items-center flex-wrap gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <SearchInput
                placeholder="Search SKU or ID..."
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
                onChange={e => setSelectedDate(e.target.value)}
                className="!w-44"
              />

              <Select
                value={repFilter}
                onChange={e => setRepFilter(e.target.value as string)}
                className="!w-52"
              >
                <MenuItem value="all">All Reps</MenuItem>
                <MenuItem value="John Doe">John Doe</MenuItem>
                <MenuItem value="Jane Smith">Jane Smith</MenuItem>
              </Select>

              <Select
                value={routeFilter}
                onChange={e => setRouteFilter(e.target.value as string)}
                className="!w-52"
              >
                <MenuItem value="all">All Routes</MenuItem>
                <MenuItem value="North-East-01">North-East-01</MenuItem>
                <MenuItem value="South-West-02">South-West-02</MenuItem>
              </Select>
            </div>
            <div>
              <Button
                variant="outlined"
                startIcon={<Download className="w-4 h-4" />}
                className="bg-white"
              >
                Export
              </Button>
            </div>
          </div>
        }
      />
    </div>
  );
}
