import { Chip, Skeleton, TextField } from '@mui/material';
import {
  useReconciliationById,
  useSaveReconciliation,
  type ReconciliationItem,
} from 'hooks/useReconciliation';
import { FileSpreadsheet, Save } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { usePermission } from 'hooks/usePermission';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import Table, { type TableColumn } from 'shared/Table';

export default function ReconciliationDetail() {
  const { id } = useParams<{ id: string }>();
  const reconciliationId = id ? Number(id) : null;
  const { isRead, isUpdate } = usePermission('reconciliation');

  const [editedRecords, setEditedRecords] = useState<Record<number, string>>(
    {}
  );
  const [editedBaseRecords, setEditedBaseRecords] = useState<
    Record<number, string>
  >({});

  const {
    data: responseData,
    isFetching,
    refetch,
  } = useReconciliationById(reconciliationId, {
    enabled: isRead && reconciliationId !== null && reconciliationId > 0,
  });

  const items = responseData?.data || [];
  const meta = responseData?.meta as any;
  const isApproved = meta?.status === 'A';

  const saveMutation = useSaveReconciliation();

  const handleActualChange = useCallback((itemId: number, value: string) => {
    setEditedRecords(prev => ({ ...prev, [itemId]: value }));
  }, []);

  const handleActualBaseChange = useCallback(
    (itemId: number, value: string) => {
      setEditedBaseRecords(prev => ({ ...prev, [itemId]: value }));
    },
    []
  );

  const getLocalItemDetails = useCallback(
    (row: ReconciliationItem) => {
      const localActualStr =
        editedRecords[row.id] !== undefined
          ? editedRecords[row.id]
          : row.actualRop;
      const localActualBaseStr =
        editedBaseRecords[row.id] !== undefined
          ? editedBaseRecords[row.id]
          : row.actualBaseQty;

      const isBlocked = row.status === 'Blocked - Force-Push Required';
      if (isBlocked) {
        return {
          actualRop: '',
          actualBaseQty: '',
          varianceDisplay: '-',
          status: 'Blocked - Force-Push Required',
          resolutionAction: 'Awaiting Force-Push',
        };
      }

      const isPending = localActualStr === '' || localActualStr == null;

      if (isPending) {
        return {
          actualRop: '',
          actualBaseQty: '',
          varianceDisplay: '-',
          status: 'Pending Verification',
          resolutionAction: 'Awaiting Verification',
        };
      }

      const actual = parseFloat(localActualStr as string) || 0;
      const actualBase = parseFloat(localActualBaseStr as string) || 0;
      const conv = row.conversionRate || 1;

      const expectedTotalPieces = row.expectedRop * conv + row.expectedBaseQty;
      const actualTotalPieces = actual * conv + actualBase;

      const variancePieces = actualTotalPieces - expectedTotalPieces;

      let status = 'Matched';
      let resolutionAction = 'CLEAN';
      if (variancePieces < 0) {
        status = 'Short';
        resolutionAction = 'Post to Default Outlet';
      } else if (variancePieces > 0) {
        status = 'Excess';
        resolutionAction = 'Adjust Unload Upward';
      }

      const absV = Math.abs(variancePieces);
      const vCases = Math.floor(absV / conv);
      const vPcs = absV % conv;
      const sign = variancePieces > 0 ? '+' : variancePieces < 0 ? '-' : '';

      const isRGB =
        row.subCategoryName?.toUpperCase().includes('RGB') ||
        row.subCategoryName?.toUpperCase().includes('RETURNABLE GLASS');

      return {
        actualRop: localActualStr ?? '',
        actualBaseQty: localActualBaseStr ?? '',
        varianceDisplay: isRGB
          ? `${sign}${vCases} Cases ${vPcs} PCs`
          : `${sign}${vCases} Cases`,
        status,
        resolutionAction,
      };
    },
    [editedRecords, editedBaseRecords]
  );

  const autoFillMatchAll = useCallback(() => {
    if (items.length === 0) return;

    const updates: Record<number, string> = { ...editedRecords };
    const baseUpdates: Record<number, string> = { ...editedBaseRecords };

    items.forEach(row => {
      const isBlocked = row.status === 'Blocked - Force-Push Required';
      const localActual =
        editedRecords[row.id] !== undefined
          ? editedRecords[row.id]
          : row.actualRop;

      const isPending = localActual === '' || localActual == null;

      if (!isBlocked && isPending) {
        const conv = Number(row.conversionRate) || 1;
        const normalizeQty = (c: number, p: number) => {
          if (conv <= 1) return { c: c || 0, p: p || 0 };
          const total = (c || 0) * conv + (p || 0);
          const sign = total < 0 ? -1 : 1;
          const abs = Math.abs(total);
          return { c: Math.floor(abs / conv) * sign, p: (abs % conv) * sign };
        };
        const expected = normalizeQty(Number(row.expectedRop), Number(row.expectedBaseQty));

        updates[row.id] = expected.c.toString();
        baseUpdates[row.id] = expected.p.toString();
      }
    });

    setEditedRecords(updates);
    setEditedBaseRecords(baseUpdates);
    toast.info('Filled empty quantities locally. Remember to click Save.');
  }, [items, editedRecords, editedBaseRecords]);

  const handleSave = useCallback(async () => {
    const allEditedIds = new Set([
      ...Object.keys(editedRecords),
      ...Object.keys(editedBaseRecords),
    ]);

    const payloadItems = Array.from(allEditedIds).map(idStr => {
      const id = Number(idStr);
      const cVal = editedRecords[id];
      const bVal = editedBaseRecords[id];
      return {
        id,
        actual_qty: cVal === '' || cVal === undefined ? null : parseFloat(cVal),
        actual_base_qty:
          bVal === '' || bVal === undefined ? null : parseFloat(bVal),
      };
    });

    if (payloadItems.length === 0) {
      toast.warn('No modifications to save.');
      return;
    }

    const hasInvalid = payloadItems.some(
      item =>
        (item.actual_qty !== null && isNaN(item.actual_qty)) ||
        (item.actual_base_qty !== null && isNaN(item.actual_base_qty))
    );

    if (hasInvalid) {
      toast.error('Please enter valid numeric values for Actual ROP.');
      return;
    }

    try {
      await saveMutation.mutateAsync({ items: payloadItems });
      setEditedRecords({});
      setEditedBaseRecords({});
      refetch();
    } catch (error: any) {
      console.error('Failed to save reconciliation:', error);
    }
  }, [editedRecords, editedBaseRecords, saveMutation, refetch]);

  // Pre-calculate details for all items to avoid doing it multiple times per cell render
  const itemsWithDetails = useMemo(() => {
    return items.map(item => ({
      ...item,
      details: getLocalItemDetails(item),
    }));
  }, [items, getLocalItemDetails]);

  const columns = useMemo<
    TableColumn<
      ReconciliationItem & { details: ReturnType<typeof getLocalItemDetails> }
    >[]
  >(
    () => [
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
        render: (_, row) => {
          const isRGB =
            row.subCategoryName?.toUpperCase().includes('RGB') ||
            row.subCategoryName?.toUpperCase().includes('RETURNABLE GLASS');
            
          const conv = Number(row.conversionRate) || 1;
          const normalizeQty = (c: number, p: number) => {
            if (conv <= 1) return { c: c || 0, p: p || 0 };
            const total = (c || 0) * conv + (p || 0);
            const sign = total < 0 ? -1 : 1;
            const abs = Math.abs(total);
            return { c: Math.floor(abs / conv) * sign, p: (abs % conv) * sign };
          };
          const expected = normalizeQty(Number(row.expectedRop), Number(row.expectedBaseQty));

          return (
            <span className="font-semibold text-gray-800">
              {expected.c} Cases {isRGB && `${expected.p} PCs`}
            </span>
          );
        },
      },
      {
        id: 'actualRop',
        label: 'Actual ROP (Clerk)',
        render: (_, row) => {
          const { details } = row;
          const isBlocked = row.status === 'Blocked - Force-Push Required';
          const isRGB =
            row.subCategoryName?.toUpperCase().includes('RGB') ||
            row.subCategoryName?.toUpperCase().includes('RETURNABLE GLASS');
          return (
            <div className="flex gap-2 items-center">
              <TextField
                type="number"
                size="small"
                placeholder={isBlocked ? 'BLOCKED' : 'Cases'}
                value={details.actualRop}
                disabled={isBlocked || !isUpdate || isApproved}
                onChange={e => handleActualChange(row.id, e.target.value)}
                inputProps={{
                  min: 0,
                  style: { textAlign: 'right', width: '60px' },
                }}
                className={isBlocked ? 'bg-red-50/20' : 'bg-yellow-50/30'}
              />
              <span className="text-xs text-gray-500">Cases</span>
              {isRGB && (
                <>
                  <TextField
                    type="number"
                    size="small"
                    placeholder={isBlocked ? 'BLOCKED' : 'PCs'}
                    value={details.actualBaseQty}
                    disabled={isBlocked || !isUpdate || isApproved}
                    onChange={e =>
                      handleActualBaseChange(row.id, e.target.value)
                    }
                    inputProps={{
                      min: 0,
                      style: { textAlign: 'right', width: '60px' },
                    }}
                    className={isBlocked ? 'bg-red-50/20' : 'bg-yellow-50/30'}
                  />
                  <span className="text-xs text-gray-500">PCs</span>
                </>
              )}
            </div>
          );
        },
      },
      {
        id: 'variance',
        label: 'Variance',
        render: (_, row) => {
          const { details } = row;
          if (details.varianceDisplay === '-')
            return <span className="text-gray-400">-</span>;

          const color =
            details.status === 'Matched'
              ? 'text-green-600'
              : details.status === 'Short'
                ? 'text-red-600'
                : 'text-blue-600';
          return (
            <span className={`font-bold ${color}`}>
              {details.varianceDisplay}
            </span>
          );
        },
      },
      {
        id: 'resolutionAction',
        label: 'Resolution Action',
        render: (_, row) => {
          const { details } = row;
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
          const { details } = row;
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
    ],
    [handleActualChange, handleActualBaseChange, isUpdate, isApproved]
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-row justify-between items-center">
        <div className="flex items-center gap-3">
          <div>
            {isFetching ? (
              <>
                <Skeleton width={200} height={32} />
                <Skeleton width={300} height={20} />
              </>
            ) : (
              <>
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
                  &nbsp;|&nbsp; SAP Code: {meta?.salesman?.sap_code || '-'}{' '}
                  &nbsp;
                </p>
              </>
            )}
          </div>
        </div>
        {isFetching ? null : isApproved ? (
          <div className="flex items-center">
            <Chip
              label="Approved"
              color="success"
              variant="filled"
              className="!font-bold px-2 py-5 text-sm uppercase tracking-wide"
            />
          </div>
        ) : isUpdate ? (
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
        ) : null}
      </div>

      {/* Items Table */}
      <Table
        data={itemsWithDetails}
        getRowId={row => row.id}
        tableId="reconciliation-items-table"
        initialOrder="asc"
        stickyHeader
        columns={columns as any}
        loading={isFetching}
        totalCount={itemsWithDetails.length}
        page={0}
        rowsPerPage={itemsWithDetails.length || 10}
        onPageChange={() => {}}
        isPermission={isRead}
        emptyMessage="No items found for this reconciliation."
      />
    </div>
  );
}
