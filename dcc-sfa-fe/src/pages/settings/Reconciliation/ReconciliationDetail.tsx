import { Chip, TextField } from '@mui/material';
import {
  useReconciliationById,
  useSaveReconciliation,
  type ReconciliationItem,
} from 'hooks/useReconciliation';
import { FileSpreadsheet, Save } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import Table, { type TableColumn } from 'shared/Table';

export default function ReconciliationDetail() {
  const { id } = useParams<{ id: string }>();

  const reconciliationId = id ? Number(id) : null;

  const [editedRecords, setEditedRecords] = useState<Record<number, string>>(
    {}
  );

  const {
    data: responseData,
    isFetching,
    refetch,
  } = useReconciliationById(reconciliationId);

  const items = responseData?.data || [];
  const meta = responseData?.meta as any;

  const saveMutation = useSaveReconciliation();

  const handleActualChange = (itemId: number, value: string) => {
    setEditedRecords(prev => ({ ...prev, [itemId]: value }));
  };

  const getLocalItemDetails = (row: ReconciliationItem) => {
    const localActualStr =
      editedRecords[row.id] !== undefined
        ? editedRecords[row.id]
        : row.actualRop;
    const isBlocked = row.status === 'Blocked - Force-Push Required';

    if (isBlocked) {
      return {
        actualRop: '',
        variance: null,
        status: 'Blocked - Force-Push Required',
        resolutionAction: 'Awaiting Force-Push',
      };
    }
    if (localActualStr === '') {
      return {
        actualRop: '',
        variance: null,
        status: 'Pending Verification',
        resolutionAction: 'Awaiting Verification',
      };
    }

    const actual = parseFloat(localActualStr);
    if (isNaN(actual)) {
      return {
        actualRop: localActualStr,
        variance: null,
        status: 'Pending Verification',
        resolutionAction: 'Awaiting Verification',
      };
    }

    const variance = row.expectedRop - actual;
    let status = 'Matched';
    let resolutionAction = 'CLEAN';
    if (Math.abs(variance) < 0.0001) {
      status = 'Matched';
      resolutionAction = 'CLEAN';
    } else if (variance > 0) {
      status = 'Short';
      resolutionAction = 'Post to Default Outlet';
    } else {
      status = 'Excess';
      resolutionAction = 'Adjust Unload Upward';
    }

    return { actualRop: localActualStr, variance, status, resolutionAction };
  };

  const autoFillMatchAll = () => {
    if (items.length === 0) return;

    const updates: Record<number, string> = { ...editedRecords };
    items.forEach(row => {
      const isBlocked = row.status === 'Blocked - Force-Push Required';
      const localActual =
        editedRecords[row.id] !== undefined
          ? editedRecords[row.id]
          : row.actualRop;
      if (!isBlocked && localActual === '') {
        updates[row.id] = row.expectedRop.toString();
      }
    });
    setEditedRecords(updates);
    toast.info('Filled empty quantities locally. Remember to click Save.');
  };

  const handleSave = async () => {
    const payloadItems = Object.entries(editedRecords).map(([id, val]) => ({
      id: Number(id),
      actual_qty: val === '' ? null : parseFloat(val),
    }));

    if (payloadItems.length === 0) {
      toast.warn('No modifications to save.');
      return;
    }

    const hasInvalid = payloadItems.some(
      item => item.actual_qty !== null && isNaN(item.actual_qty)
    );
    if (hasInvalid) {
      toast.error('Please enter valid numeric values for Actual ROP.');
      return;
    }

    try {
      await saveMutation.mutateAsync({ items: payloadItems });
      setEditedRecords({});
      toast.success('Daily ROP Reconciliation Data Saved Successfully.');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save reconciliation.');
    }
  };

  const columns: TableColumn<ReconciliationItem>[] = [
    {
      id: 'id',
      label: 'Item ID',
      sortable: true,
      render: (_val, row) => (
        <span className="font-medium text-gray-700">
          ROP-{row.id.toString().padStart(4, '0')}
        </span>
      ),
    },
    { id: 'stockKey', label: 'Stock Key', sortable: true },
    { id: 'skuCode', label: 'SKU Code', sortable: true },
    { id: 'skuName', label: 'SKU Name', sortable: true },
    { id: 'batchNumber', label: 'Batch', sortable: true },
    {
      id: 'expectedRop',
      label: 'Expected',
      sortable: true,
      render: val => (
        <span className="font-semibold text-gray-800">
          {Number(val)?.toFixed(2)}
        </span>
      ),
    },
    {
      id: 'actualRop',
      label: 'Actual ROP (Clerk)',
      render: (_, row) => {
        const details = getLocalItemDetails(row);
        const isBlocked = row.status === 'Blocked - Force-Push Required';
        return (
          <TextField
            type="number"
            size="small"
            placeholder={isBlocked ? 'BLOCKED' : '0.00'}
            value={details.actualRop}
            disabled={isBlocked}
            onChange={e => handleActualChange(row.id, e.target.value)}
            inputProps={{
              min: 0,
              step: '0.01',
              style: { textAlign: 'right', width: '80px' },
            }}
            className={isBlocked ? 'bg-red-50/20' : 'bg-yellow-50/30'}
          />
        );
      },
    },
    {
      id: 'variance',
      label: 'Variance',
      render: (_, row) => {
        const details = getLocalItemDetails(row);
        if (details.variance === null)
          return <span className="text-gray-400">-</span>;
        const v = details.variance;
        const color =
          Math.abs(v) < 0.0001
            ? 'text-green-600'
            : v > 0
              ? 'text-red-600'
              : 'text-blue-600';
        return (
          <span className={`font-bold ${color}`}>
            {v > 0 ? '+' : ''}
            {v.toFixed(2)}
          </span>
        );
      },
    },
    {
      id: 'resolutionAction',
      label: 'Resolution Action',
      render: (_, row) => {
        const details = getLocalItemDetails(row);
        let color = 'default';
        if (details.resolutionAction === 'CLEAN') color = 'success';
        else if (details.resolutionAction === 'Post to Default Outlet')
          color = 'error';
        else if (details.resolutionAction === 'Adjust Unload Upward')
          color = 'info';
        else if (details.resolutionAction === 'Awaiting Force-Push')
          color = 'warning';
        return (
          <Chip
            label={details.resolutionAction}
            color={color as any}
            size="small"
            variant="outlined"
            className="font-medium"
          />
        );
      },
    },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      render: (_, row) => {
        const details = getLocalItemDetails(row);
        let color: 'warning' | 'success' | 'error' | 'info' = 'warning';
        if (details.status === 'Matched') color = 'success';
        else if (details.status === 'Short') color = 'error';
        else if (details.status === 'Excess') color = 'info';
        else if (details.status === 'Blocked - Force-Push Required')
          color = 'error';
        return (
          <Chip
            label={details.status}
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
        <div className="flex items-center gap-3">
          <div>
            <h1 className="!font-bold text-xl !text-gray-900">
              {meta?.salesman?.name || 'Salesman'}
            </h1>
            <p className="text-sm text-gray-500">
              {meta?.depot?.code && (
                <>Depot: {meta?.depot?.code} &nbsp;|&nbsp;</>
              )}
              {meta?.reconciliation_date
                ? new Date(meta.reconciliation_date).toLocaleDateString(
                    'en-GB',
                    {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    }
                  )
                : '-'}{' '}
              &nbsp;|&nbsp; SAP Code: {meta?.salesman?.sap_code || '-'} &nbsp;
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <PopConfirm
            title="Auto-Fill Expected"
            description="Auto-fill all empty 'Actual' amounts with 'Expected' amounts?"
            onConfirm={autoFillMatchAll}
            confirmText="Yes, Fill"
          >
            <Button
              variant="outlined"
              startIcon={<FileSpreadsheet className="w-4 h-4" />}
            >
              Auto-Fill Expected
            </Button>
          </PopConfirm>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Save className="w-4 h-4" />}
            onClick={handleSave}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? 'Saving...' : 'Save & Reconcile'}
          </Button>
        </div>
      </div>

      {/* Items Table */}
      <Table
        data={items}
        getRowId={row => row.id}
        tableId="reconciliation-items-table"
        initialOrder="asc"
        stickyHeader
        columns={columns}
        loading={isFetching}
        totalCount={items.length}
        page={0}
        rowsPerPage={items.length || 10}
        onPageChange={() => {}}
        emptyMessage="No items found for this reconciliation."
      />
    </div>
  );
}
