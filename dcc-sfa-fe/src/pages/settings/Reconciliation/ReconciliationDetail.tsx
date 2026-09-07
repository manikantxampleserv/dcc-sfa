import { Chip, Skeleton } from '@mui/material';
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
import { useResolvedUom } from 'hooks/useUnitOfMeasurement';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import Input from 'shared/Input';
import Table, { type TableColumn } from 'shared/Table';

/**
 * Formats quantity display omitting 0 case or piece values.
 *
 * @param cases Number of cases
 * @param pieces Number of pieces
 * @param isRGB Whether the item is returnable glass
 * @param uomCase Unit of measurement for cases
 * @param uomPcs Unit of measurement for pieces
 * @returns Formatted quantity string
 */
function formatQuantityDisplay(
  cases: number,
  pieces: number,
  isRGB: boolean | undefined,
  uomCase: string,
  uomPcs: string
): string {
  const c = Math.abs(cases);
  const p = Math.abs(pieces);

  if (!isRGB) {
    return `${c} ${uomCase}`;
  }

  if (c === 0 && p === 0) {
    return `0 ${uomCase}`;
  }

  if (c === 0) {
    return `${p} ${uomPcs}`;
  }

  if (p === 0) {
    return `${c} ${uomCase}`;
  }

  return `${c} ${uomCase} ${p} ${uomPcs}`;
}

/**
 * Formats variance quantity display with sign omitting 0 case or piece values.
 *
 * @param cases Number of cases
 * @param pieces Number of pieces
 * @param isRGB Whether the item is returnable glass
 * @param uomCase Unit of measurement for cases
 * @param uomPcs Unit of measurement for pieces
 * @returns Formatted variance string
 */
function formatVarianceDisplay(
  cases: number,
  pieces: number,
  isRGB: boolean | undefined,
  uomCase: string,
  uomPcs: string
): string {
  const c = Math.abs(cases);
  const p = Math.abs(pieces);
  const isZero = c === 0 && (!isRGB || p === 0);

  if (isZero) {
    return `0 ${uomCase}`;
  }

  const sign = cases < 0 || pieces < 0 ? '-' : '+';

  if (!isRGB || p === 0) {
    return `${sign}${c} ${uomCase}`;
  }

  if (c === 0) {
    return `${sign}${p} ${uomPcs}`;
  }

  return `${sign}${c} ${uomCase} ${p} ${uomPcs}`;
}

export default function ReconciliationDetail() {
  const { id } = useParams<{ id: string }>();
  const reconciliationId = id ? Number(id) : null;
  const { isRead, isUpdate } = usePermission('reconciliation');
  const { uomCase, uomPcs } = useResolvedUom();

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

      /** Check if this item has been touched locally */
      const hasEdited =
        editedRecords[row.id] !== undefined ||
        editedBaseRecords[row.id] !== undefined;

      /** Only treat as pending if the value has never been set and not yet edited */
      const isPending =
        !isApproved &&
        !hasEdited &&
        (row.actualRop === null || row.actualRop === '');

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

      const variancePieces = Math.round(
        actualTotalPieces - expectedTotalPieces
      );

      let status = 'Matched';
      let resolutionAction = 'CLEAN';
      if (variancePieces < 0) {
        status = 'Short';
        resolutionAction = 'Post to Default Outlet';
      } else if (variancePieces > 0) {
        status = 'Excess';
        resolutionAction = 'Post to Default Outlet';
      }

      const absV = Math.abs(variancePieces);
      const vCases = Math.floor(absV / conv);
      const vPcs = absV % conv;
      const signMultiplier = variancePieces < 0 ? -1 : 1;

      const isRGB =
        row.subCategoryName?.toUpperCase().includes('RGB') ||
        row.subCategoryName?.toUpperCase().includes('RETURNABLE GLASS');

      const varianceDisplay =
        variancePieces === 0
          ? `0 ${uomCase}`
          : formatVarianceDisplay(
              vCases * signMultiplier,
              vPcs * signMultiplier,
              isRGB,
              uomCase,
              uomPcs
            );

      return {
        actualRop: localActualStr ?? '',
        actualBaseQty: localActualBaseStr ?? '',
        varianceDisplay,
        status,
        resolutionAction,
      };
    },
    [editedRecords, editedBaseRecords, uomCase, uomPcs, isApproved]
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
      const localActualBase =
        editedBaseRecords[row.id] !== undefined
          ? editedBaseRecords[row.id]
          : row.actualBaseQty;

      const isPending =
        localActual === '' ||
        localActual == null ||
        localActualBase === '' ||
        localActualBase == null;

      if (!isBlocked && isPending) {
        const conv = Number(row.conversionRate) || 1;
        const normalizeQty = (c: number, p: number) => {
          if (conv <= 1) return { c: c || 0, p: p || 0 };
          const total = (c || 0) * conv + (p || 0);
          const sign = total < 0 ? -1 : 1;
          const abs = Math.abs(total);
          return { c: Math.floor(abs / conv) * sign, p: (abs % conv) * sign };
        };
        const expected = normalizeQty(
          Number(row.expectedRop),
          Number(row.expectedBaseQty)
        );

        updates[row.id] = expected.c.toString();
        baseUpdates[row.id] = expected.p.toString();
      }
    });

    setEditedRecords(updates);
    setEditedBaseRecords(baseUpdates);
    toast.info('Filled empty quantities locally. Remember to click Save.');
  }, [items, editedRecords, editedBaseRecords]);

  const handleSave = useCallback(async () => {
    const payloadItems = items.map(row => {
      const cVal = editedRecords[row.id];
      const bVal = editedBaseRecords[row.id];

      const actualRop = cVal !== undefined ? cVal : row.actualRop;
      const actualBaseQty = bVal !== undefined ? bVal : row.actualBaseQty;

      return {
        id: row.id,
        actual_qty:
          actualRop === null || actualRop === ''
            ? 0
            : parseFloat(String(actualRop)) || 0,
        actual_base_qty:
          actualBaseQty === null || actualBaseQty === ''
            ? 0
            : parseFloat(String(actualBaseQty)) || 0,
      };
    });

    if (payloadItems.length === 0) {
      toast.warn('No items to save.');
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

  const itemsWithDetails = useMemo(() => {
    const list = items.map(item => ({
      ...item,
      details: getLocalItemDetails(item),
    }));
    return list.sort((a, b) => {
      const catA =
        a.subCategoryName?.trim() || a.categoryName?.trim() || 'Uncategorized';
      const catB =
        b.subCategoryName?.trim() || b.categoryName?.trim() || 'Uncategorized';

      const isRgbA =
        catA.toUpperCase().includes('RGB') ||
        catA.toUpperCase().includes('RETURNABLE GLASS');
      const isRgbB =
        catB.toUpperCase().includes('RGB') ||
        catB.toUpperCase().includes('RETURNABLE GLASS');

      if (isRgbA && !isRgbB) return -1;
      if (!isRgbA && isRgbB) return 1;

      const comp = catA.localeCompare(catB);
      if (comp !== 0) return comp;

      const skuA = String(a.skuCode || '');
      const skuB = String(b.skuCode || '');
      return skuA.localeCompare(skuB, undefined, {
        numeric: true,
        sensitivity: 'base',
      });
    });
  }, [items, getLocalItemDetails]);

  const subCategoryTotals = useMemo(() => {
    const groups: Record<
      string,
      {
        subCategory: string;
        expectedRop: number;
        actualRop: number;
        variance: number;
      }
    > = {};

    itemsWithDetails.forEach(item => {
      const subCat =
        item.subCategoryName?.trim() ||
        item.categoryName?.trim() ||
        'Uncategorized';

      if (!groups[subCat]) {
        groups[subCat] = {
          subCategory: subCat,
          expectedRop: 0,
          actualRop: 0,
          variance: 0,
        };
      }

      const conv = Number(item.conversionRate) || 1;

      const hasActualCases =
        item.details.actualRop !== '' &&
        item.details.actualRop !== null &&
        item.details.actualRop !== undefined;
      const hasActualPCs =
        item.details.actualBaseQty !== '' &&
        item.details.actualBaseQty !== null &&
        item.details.actualBaseQty !== undefined;

      const actualVal = hasActualCases ? Number(item.details.actualRop) : 0;
      const actualBaseVal = hasActualPCs
        ? Number(item.details.actualBaseQty)
        : 0;

      const expectedVal = Number(item.expectedRop) || 0;
      const expectedBaseVal = Number(item.expectedBaseQty) || 0;

      let varianceVal = 0;
      let varianceBaseVal = 0;

      if (hasActualCases || hasActualPCs) {
        const expectedTotalPieces = expectedVal * conv + expectedBaseVal;
        const actualTotalPieces = actualVal * conv + actualBaseVal;
        const variancePieces = actualTotalPieces - expectedTotalPieces;

        if (variancePieces !== 0) {
          const absV = Math.abs(variancePieces);
          varianceVal = Math.floor(absV / conv) * Math.sign(variancePieces);
          varianceBaseVal = (absV % conv) * Math.sign(variancePieces);
        }
      }

      const g = groups[subCat];
      g.expectedRop += expectedVal + expectedBaseVal / conv;
      g.actualRop += actualVal + actualBaseVal / conv;
      g.variance += varianceVal + varianceBaseVal / conv;
    });

    const list = Object.values(groups);
    return list.sort((a, b) => {
      const isRgbA =
        a.subCategory.toUpperCase().includes('RGB') ||
        a.subCategory.toUpperCase().includes('RETURNABLE GLASS');
      const isRgbB =
        b.subCategory.toUpperCase().includes('RGB') ||
        b.subCategory.toUpperCase().includes('RETURNABLE GLASS');

      if (isRgbA && !isRgbB) return -1;
      if (!isRgbA && isRgbB) return 1;

      return a.subCategory.localeCompare(b.subCategory);
    });
  }, [itemsWithDetails]);

  const subCategoryGrandTotal = useMemo(() => {
    return subCategoryTotals.reduce(
      (acc, curr) => ({
        expectedRop: acc.expectedRop + curr.expectedRop,
        actualRop: acc.actualRop + curr.actualRop,
        variance: acc.variance + curr.variance,
      }),
      {
        expectedRop: 0,
        actualRop: 0,
        variance: 0,
      }
    );
  }, [subCategoryTotals]);

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
          const expected = normalizeQty(
            Number(row.expectedRop),
            Number(row.expectedBaseQty)
          );

          return (
            <span className="font-semibold text-gray-800">
              {formatQuantityDisplay(
                expected.c,
                expected.p,
                isRGB,
                uomCase,
                uomPcs
              )}
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
              <Input
                compact
                type="number"
                size="small"
                fullWidth={false}
                placeholder={isBlocked ? 'BLOCKED' : uomCase}
                value={details.actualRop}
                disabled={isBlocked || !isUpdate || isApproved}
                onChange={e => handleActualChange(row.id, e.target.value)}
                slotProps={{
                  htmlInput: {
                    min: 0,
                    style: { textAlign: 'right', width: '60px' },
                  },
                }}
                className={isBlocked ? 'bg-red-50/20' : 'bg-yellow-50/30'}
              />
              <span className="text-xs text-gray-500">{uomCase}</span>
              {isRGB && (
                <>
                  <Input
                    compact
                    type="number"
                    size="small"
                    fullWidth={false}
                    placeholder={isBlocked ? 'BLOCKED' : uomPcs}
                    value={details.actualBaseQty}
                    disabled={isBlocked || !isUpdate || isApproved}
                    onChange={e =>
                      handleActualBaseChange(row.id, e.target.value)
                    }
                    slotProps={{
                      htmlInput: {
                        min: 0,
                        style: { textAlign: 'right', width: '60px' },
                      },
                    }}
                    className={isBlocked ? 'bg-red-50/20' : 'bg-yellow-50/30'}
                  />
                  <span className="text-xs text-gray-500">{uomPcs}</span>
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
        label: 'Action',
        render: (_, row) => {
          const { details } = row;
          let displayVal = details.resolutionAction;
          if (
            displayVal === 'Blocked - Force-Push Required' ||
            displayVal === 'Awaiting Force-Push'
          ) {
            displayVal = 'Blocked';
          } else if (displayVal === 'Post to Default Outlet') {
            displayVal = 'Posted to D/O';
          } else if (displayVal === 'Awaiting Verification') {
            displayVal = 'Pending';
          }

          let color:
            | 'default'
            | 'primary'
            | 'secondary'
            | 'error'
            | 'info'
            | 'success'
            | 'warning' = 'default';
          if (displayVal === 'CLEAN') color = 'success';
          else if (displayVal === 'Blocked') color = 'error';
          else if (displayVal === 'Posted to D/O')
            color = details.status === 'Excess' ? 'info' : 'warning';
          else if (displayVal === 'Adjust Unload Upward') color = 'info';
          else if (displayVal === 'Pending') color = 'warning';

          return (
            <Chip
              label={displayVal || '-'}
              color={color}
              size="small"
              variant="outlined"
              className="font-medium"
            />
          );
        },
      },
      // {
      //   id: 'status',
      //   label: 'Status',
      //   sortable: true,
      //   render: (_, row) => {
      //     const { details } = row;
      //     let color: 'warning' | 'success' | 'error' | 'info' = 'warning';
      //     if (details.status === 'Matched') color = 'success';
      //     else if (details.status === 'Short') color = 'error';
      //     else if (details.status === 'Excess') color = 'info';
      //     else if (details.status === 'Blocked - Force-Push Required')
      //       color = 'error';
      //     return (
      //       <Chip
      //         label={details.status}
      //         color={color}
      //         size="small"
      //         variant="filled"
      //         className="!capitalize font-medium"
      //       />
      //     );
      //   },
      // },
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
      <div>
        <Table
          data={itemsWithDetails}
          groupBy={row =>
            row.subCategoryName?.trim() ||
            row.categoryName?.trim() ||
            'Uncategorized'
          }
          renderGroupHeader={group => (
            <span className="text-sm font-bold uppercase text-gray-800">
              {group}
            </span>
          )}
          getRowId={row => row.id}
          tableId="reconciliation-items-table"
          stickyHeader
          compact
          sortable={false}
          filterColunm={false}
          columns={columns as any}
          loading={isFetching}
          pagination={false}
          isPermission={isRead}
          emptyMessage="No items found for this reconciliation."
        />

        {subCategoryTotals.length > 0 && (
          <div className="bg-white rounded-b-md shadow border border-gray-200 overflow-hidden">
            <div className="bg-gray-200 text-gray-800 px-4 py-2 font-bold text-sm tracking-wider uppercase">
              Subtotals by Sub-Category
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-blue-50 text-gray-700 font-semibold border-b border-gray-200">
                    <th className="py-2.5 px-4">Sub-Category</th>
                    <th className="py-2.5 px-4 text-center">Expected ROP</th>
                    <th className="py-2.5 px-4 text-center">Actual ROP</th>
                    <th className="py-2.5 px-4 text-center">Variance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {subCategoryTotals.map(row => (
                    <tr key={row.subCategory} className="hover:bg-gray-50">
                      <td className="p-2 font-medium text-gray-900">
                        {row.subCategory}
                      </td>
                      <td className="p-2 text-center">
                        {row.expectedRop.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="p-2 text-center">
                        {row.actualRop.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td
                        className={`p-2 text-center font-medium ${
                          row.variance < 0
                            ? 'text-red-600'
                            : row.variance > 0
                              ? 'text-blue-600'
                              : 'text-gray-900'
                        }`}
                      >
                        {row.variance.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-amber-100/90 font-bold border-t border-amber-300 text-gray-900">
                    <td className="p-2 uppercase tracking-wider">
                      Grand Total
                    </td>
                    <td className="p-2 text-center">
                      {subCategoryGrandTotal.expectedRop.toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </td>
                    <td className="p-2 text-center">
                      {subCategoryGrandTotal.actualRop.toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </td>
                    <td
                      className={`p-2 text-center ${
                        subCategoryGrandTotal.variance < 0
                          ? 'text-red-600'
                          : subCategoryGrandTotal.variance > 0
                            ? 'text-blue-600'
                            : 'text-gray-900'
                      }`}
                    >
                      {subCategoryGrandTotal.variance.toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
