import { Download } from '@mui/icons-material';
import { Box, Chip } from '@mui/material';
import { useCurrencyCode } from 'hooks/useCurrency';
import { usePermission } from 'hooks/usePermission';
import {
  useExportReconciliation,
  useExportReconciliationPdf,
  useReconciliationById,
  type ReconciliationItem,
} from 'hooks/useReconciliation';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import Table, { type TableColumn } from 'shared/Table';

export default function SettlementSheetDetail() {
  const { id } = useParams<{ id: string }>();
  const { isRead } = usePermission('settlement-sheet');
  const exportMutation = useExportReconciliation();
  const exportPdfMutation = useExportReconciliationPdf();
  const currencyCode = useCurrencyCode();

  const { data: responseData, isFetching } = useReconciliationById(Number(id), {
    enabled: isRead && !!id,
  });

  const items = responseData?.data || [];

  const headerInfo =
    items.length > 0
      ? {
          salesmanName: items[0].salesmanName,
          sapCode: items[0].salesmanSapCode,
          depot: items[0].depot,
          date: items[0].createdate
            ? new Date(items[0].createdate).toLocaleDateString('en-GB')
            : '-',
        }
      : null;

  const aggregatedItems = useMemo(() => {
    const skuMap = new Map<string, ReconciliationItem>();
    items.forEach(item => {
      const key = `${item.categoryName}_${item.skuCode}`;
      if (skuMap.has(key)) {
        const existing = skuMap.get(key)!;
        existing.loadQuantity =
          (Number(existing.loadQuantity) || 0) +
          (Number(item.loadQuantity) || 0);
        existing.loadBaseQty =
          (Number(existing.loadBaseQty) || 0) + (Number(item.loadBaseQty) || 0);

        existing.saleQuantity =
          (Number(existing.saleQuantity) || 0) +
          (Number(item.saleQuantity) || 0);
        existing.saleBaseQty =
          (Number(existing.saleBaseQty) || 0) + (Number(item.saleBaseQty) || 0);

        existing.expectedRop =
          (Number(existing.expectedRop) || 0) + (Number(item.expectedRop) || 0);
        existing.expectedBaseQty =
          (Number(existing.expectedBaseQty) || 0) +
          (Number(item.expectedBaseQty) || 0);

        const hasActualExisting =
          existing.actualRop !== '' || existing.actualBaseQty !== '';
        const hasActualItem =
          item.actualRop !== '' || item.actualBaseQty !== '';

        if (hasActualExisting || hasActualItem) {
          const actualExisting = Number(existing.actualRop) || 0;
          const actualItem = Number(item.actualRop) || 0;
          const actualBaseExisting = Number(existing.actualBaseQty) || 0;
          const actualBaseItem = Number(item.actualBaseQty) || 0;

          existing.actualRop = String(actualExisting + actualItem);
          existing.actualBaseQty = String(actualBaseExisting + actualBaseItem);
        }

        existing.variance =
          (Number(existing.variance) || 0) + (Number(item.variance) || 0);
        existing.varianceBaseQty =
          (Number(existing.varianceBaseQty) || 0) +
          (Number(item.varianceBaseQty) || 0);

        if (
          !existing.resolutionAction ||
          existing.resolutionAction === 'CLEAN' ||
          existing.resolutionAction === '-'
        ) {
          existing.resolutionAction =
            item.resolutionAction || existing.resolutionAction;
        }
      } else {
        skuMap.set(key, { ...item });
      }
    });
    return Array.from(skuMap.values());
  }, [items]);

  const groupedItems = useMemo(() => {
    return aggregatedItems.reduce(
      (acc, item) => {
        const cat = item.categoryName || 'Uncategorized';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
      },
      {} as Record<string, ReconciliationItem[]>
    );
  }, [aggregatedItems]);

  const grandTotal = useMemo(() => {
    let totalSaleValue = 0;
    let totalDefaultOutletValue = 0;

    aggregatedItems.forEach(item => {
      const conv = item.conversionRate || 1;
      const price = item.basePrice || 0;
      const basePricePerPc = price / conv;

      const saleVal =
        (item.saleQuantity || 0) * price +
        (item.saleBaseQty || 0) * basePricePerPc;
      totalSaleValue += saleVal;

      const variance = Number(item.variance) || 0;
      const varianceBase = Number(item.varianceBaseQty) || 0;
      const action = item.resolutionAction || '';

      if (
        action.includes('Default Outlet') &&
        (variance < 0 || varianceBase < 0)
      ) {
        totalDefaultOutletValue +=
          Math.abs(variance) * price + Math.abs(varianceBase) * basePricePerPc;
      }
    });
    return { totalSaleValue, totalDefaultOutletValue };
  }, [aggregatedItems]);

  const columns: TableColumn<ReconciliationItem>[] = [
    { id: 'skuCode', label: 'SKU Code', sortable: false },
    {
      id: 'skuName',
      label: 'SKU Name',
      sortable: true,
      className: '!px-1',
      render: val => <span className="font-medium text-left block">{val}</span>,
    },
    {
      id: 'loadQuantity',
      label: 'Load Qty',
      sortable: true,
      render: (_, row) => (
        <span className="block text-center">
          {row.loadQuantity || 0} Cases {row.loadBaseQty || 0} PCs
        </span>
      ),
    },
    {
      id: 'saleQuantity',
      label: 'Sale Qty',
      sortable: true,
      render: (_, row) => (
        <span className="block text-center">
          {row.saleQuantity || 0} Cases {row.saleBaseQty || 0} PCs
        </span>
      ),
    },
    {
      id: 'saleValue',
      label: 'Sale Value',
      render: (_, row) => (
        <span className="block text-center font-medium">
          {(
            (row.saleQuantity || 0) * (row.basePrice || 0) +
            (row.saleBaseQty || 0) *
              ((row.basePrice || 0) / (row.conversionRate || 1))
          ).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      ),
    },
    {
      id: 'expectedRop',
      label: 'Expected ROP',
      sortable: true,
      render: (_, row) => (
        <span className="block text-center">
          {row.expectedRop} Cases {row.expectedBaseQty} PCs
        </span>
      ),
    },
    {
      id: 'actualRop',
      label: 'Actual ROP',
      render: (_, row) => {
        const hasActualCases =
          row.actualRop !== '' &&
          row.actualRop !== null &&
          row.actualRop !== undefined;
        const hasActualPCs =
          row.actualBaseQty !== '' &&
          row.actualBaseQty !== null &&
          row.actualBaseQty !== undefined;

        return (
          <span className="block text-center">
            {hasActualCases || hasActualPCs
              ? `${row.actualRop || 0} Cases ${row.actualBaseQty || 0} PCs`
              : '-'}
          </span>
        );
      },
    },
    {
      id: 'variance',
      label: 'Variance',
      sortable: false,
      render: (_, row) => {
        const val = row.variance;
        const baseVal = row.varianceBaseQty;
        if (val === null || val === undefined)
          return (
            <span className="block text-center font-medium text-gray-900">
              -
            </span>
          );

        const isShort = Number(val) < 0 || Number(baseVal) < 0;
        const isExcess = Number(val) > 0 || Number(baseVal) > 0;
        const color = isShort
          ? 'text-red-600'
          : isExcess
            ? 'text-blue-600'
            : 'text-gray-900';

        const sign = isShort ? '-' : isExcess ? '+' : '';
        const cases = Math.abs(Number(val));
        const pcs = Math.abs(Number(baseVal));

        if (cases === 0 && pcs === 0) {
          return (
            <span className="block text-center font-medium text-gray-900">
              0 Cases 0 PCs
            </span>
          );
        }

        return (
          <span className={`block text-center font-medium ${color}`}>
            {sign}
            {cases} Cases {pcs} PCs
          </span>
        );
      },
    },
    {
      id: 'basePrice',
      label: 'Unit Price (TZS)',
      render: val => (
        <span className="block text-center">{(val || 0).toLocaleString()}</span>
      ),
    },
    {
      id: 'resolutionAction',
      label: 'Action',
      render: val => {
        let color:
          | 'default'
          | 'primary'
          | 'secondary'
          | 'error'
          | 'info'
          | 'success'
          | 'warning' = 'default';
        if (val === 'CLEAN') color = 'success';
        else if (val?.includes('Default Outlet')) color = 'error';
        else if (val?.includes('Adjustment')) color = 'warning';
        return (
          <div className="text-center block">
            <Chip
              label={val || '-'}
              color={color}
              size="small"
              variant="outlined"
            />
          </div>
        );
      },
    },
  ];

  if (!isRead) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
        <p className="mt-2 text-gray-500">
          You do not have permission to view settlement sheets.
        </p>
      </div>
    );
  }

  const handleExport = async () => {
    try {
      await exportMutation.mutateAsync({
        id: Number(id),
        salesmanName: headerInfo?.salesmanName,
        currency: currencyCode,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleExportPdf = async () => {
    try {
      await exportPdfMutation.mutateAsync({
        id: Number(id),
        salesmanName: headerInfo?.salesmanName,
        currency: currencyCode,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <Box className="!flex !justify-between !items-center">
          <Box>
            <p className="!font-bold text-xl !text-gray-900">
              Settlement Sheet
            </p>
            <p className="!text-gray-500 text-sm">
              Review daily sales data, inventory discrepancies, and cash
              settlement details.
            </p>
          </Box>
        </Box>

        <div className="flex gap-2 print:hidden">
          <PopConfirm
            title="Export Settlement Sheet PDF"
            description="Are you sure you want to export this settlement sheet to PDF?"
            onConfirm={handleExportPdf}
            confirmText="Export PDF"
            cancelText="Cancel"
            placement="top"
          >
            <Button
              variant="outlined"
              className="!capitalize"
              startIcon={<Download />}
              disabled={
                exportPdfMutation.isPending || isFetching || items.length === 0
              }
            >
              {exportPdfMutation.isPending ? 'Exporting...' : 'Export to PDF'}
            </Button>
          </PopConfirm>

          <PopConfirm
            title="Export Settlement Sheet Excel"
            description="Are you sure you want to export this settlement sheet to Excel?"
            onConfirm={handleExport}
            confirmText="Export Excel"
            cancelText="Cancel"
            placement="top"
          >
            <Button
              variant="outlined"
              className="!capitalize"
              startIcon={<Download />}
              disabled={
                exportMutation.isPending || isFetching || items.length === 0
              }
            >
              {exportMutation.isPending ? 'Exporting...' : 'Export to Excel'}
            </Button>
          </PopConfirm>
        </div>
      </div>

      {isFetching ? (
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-gray-200 rounded-lg"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden print:shadow-none print:border-none">
          <div className="p-6 border-b border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 print:bg-transparent">
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">
                Salesman Name
              </p>
              <p className="font-medium text-gray-900">
                {headerInfo?.salesmanName || '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">
                SAP Code
              </p>
              <p className="font-medium text-gray-900">
                {headerInfo?.sapCode || '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">
                Depot
              </p>
              <p className="font-medium text-gray-900">
                {headerInfo?.depot || '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">
                Date
              </p>
              <p className="font-medium text-gray-900">
                {headerInfo?.date || '-'}
              </p>
            </div>
          </div>

          {/* Categories */}
          {Object.entries(groupedItems).map(([category, catItems]) => (
            <div key={category} className="overflow-x-auto">
              <Table
                data={catItems}
                actions={<div className="font-bold">{category}</div>}
                getRowId={row => row.id}
                tableId={`settlement-items-${category}`}
                columns={columns}
                filterColunm={false}
                loading={isFetching}
                isPermission={isRead}
                pagination={false}
                compact
                emptyMessage="No items found."
              />
            </div>
          ))}

          {/* Cash Settlement */}
          <div className="p-6 border-t border-gray-200 bg-blue-50/50 print:bg-transparent">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              CASH SETTLEMENT
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">
                  Total Sales Value (Mobile-recorded sales to outlets):
                </span>
                <span className="font-semibold text-gray-900">
                  {grandTotal.totalSaleValue.toLocaleString()} TZS
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">
                  Default Outlet Posting Value (Shortage — Salesman
                  accountable):
                </span>
                <span className="font-semibold text-red-600">
                  {grandTotal.totalDefaultOutletValue.toLocaleString()} TZS
                </span>
              </div>
              <div className="flex justify-between items-center rounded-lg print:bg-transparent print:border print:border-black">
                <span className="font-bold text-gray-900">
                  TOTAL CASH SALESMAN MUST DEPOSIT:
                </span>
                <span className="text-xl font-bold text-blue-700 print:text-black">
                  {(
                    grandTotal.totalSaleValue +
                    grandTotal.totalDefaultOutletValue
                  ).toLocaleString()}{' '}
                  TZS
                </span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="p-6 border-t border-gray-200">
            <h3 className="text-md font-bold text-gray-900 mb-8 uppercase tracking-wider">
              Signatures
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-8">
              <div className="space-y-4">
                <div className="flex items-end border-b border-gray-300 pb-2">
                  <span className="text-sm font-medium w-32 text-gray-600">
                    Salesman:
                  </span>
                  <span className="flex-1"></span>
                </div>
                <div className="flex items-end border-b border-gray-300 pb-2">
                  <span className="text-sm font-medium w-32 text-gray-600">
                    Date:
                  </span>
                  <span className="flex-1"></span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-end border-b border-gray-300 pb-2">
                  <span className="text-sm font-medium w-32 text-gray-600">
                    Depot In-Charge:
                  </span>
                  <span className="flex-1"></span>
                </div>
                <div className="flex items-end border-b border-gray-300 pb-2">
                  <span className="text-sm font-medium w-32 text-gray-600">
                    Cash Received:
                  </span>
                  <span className="flex-1 text-center text-gray-400 text-xs">
                    TZS
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
