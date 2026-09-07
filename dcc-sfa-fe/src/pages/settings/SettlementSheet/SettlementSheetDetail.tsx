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
import { useResolvedUom } from 'hooks/useUnitOfMeasurement';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
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

export default function SettlementSheetDetail() {
  const { id } = useParams<{ id: string }>();
  const { isRead } = usePermission('settlement-sheet');
  const exportMutation = useExportReconciliation();
  const exportPdfMutation = useExportReconciliationPdf();
  const currencyCode = useCurrencyCode();
  const { uomCase, uomPcs } = useResolvedUom();

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
      const groupName =
        item.subCategoryName?.trim() ||
        item.categoryName?.trim() ||
        'Uncategorized';
      const key = `${groupName}_${item.skuCode}`;
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
        existing.taxAmount =
          (Number(existing.taxAmount) || 0) + (Number(item.taxAmount) || 0);
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
    const aggregatedArray = Array.from(skuMap.values()).map(item => {
      const conv = Number(item.conversionRate) || 1;
      const hasActualCases =
        item.actualRop !== '' &&
        item.actualRop !== null &&
        item.actualRop !== undefined;
      const hasActualPCs =
        item.actualBaseQty !== '' &&
        item.actualBaseQty !== null &&
        item.actualBaseQty !== undefined;

      const actualVal = hasActualCases ? Number(item.actualRop) : 0;
      const actualBaseVal = hasActualPCs ? Number(item.actualBaseQty) : 0;

      const expectedVal = Number(item.expectedRop) || 0;
      const expectedBaseVal = Number(item.expectedBaseQty) || 0;

      const expectedTotalPieces = expectedVal * conv + expectedBaseVal;
      const actualTotalPieces = actualVal * conv + actualBaseVal;
      const variancePieces = actualTotalPieces - expectedTotalPieces;

      let varianceVal = 0;
      let varianceBaseVal = 0;

      if (variancePieces !== 0) {
        const absV = Math.abs(variancePieces);
        varianceVal = Math.floor(absV / conv) * Math.sign(variancePieces);
        varianceBaseVal = (absV % conv) * Math.sign(variancePieces);
      }

      let resAction = item.resolutionAction;
      if (
        resAction === 'Blocked - Force-Push Required' ||
        resAction === 'Awaiting Force-Push'
      ) {
        resAction = 'Blocked';
      } else if (variancePieces === 0) {
        resAction = 'CLEAN';
      } else {
        resAction = 'Posted to D/O';
      }

      return {
        ...item,
        actualRop: String(actualVal),
        actualBaseQty: String(actualBaseVal),
        variance: varianceVal,
        varianceBaseQty: varianceBaseVal,
        resolutionAction: resAction,
      };
    });
    aggregatedArray.sort((a, b) => {
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
    return aggregatedArray;
  }, [items]);

  const grandTotal = useMemo(() => {
    let totalSaleValue = 0;
    let totalTaxAmount = 0;
    let totalDefaultOutletValue = 0;
    let totalDefaultOutletTax = 0;
    aggregatedItems.forEach(item => {
      const conv = item.conversionRate || 1;
      const price = item.basePrice || 0;
      const basePricePerPc = price / conv;
      const saleVal =
        (item.saleQuantity || 0) * price +
        (item.saleBaseQty || 0) * basePricePerPc;
      totalSaleValue += saleVal;
      const itemTax = Number(item.taxAmount) || 0;
      totalTaxAmount += itemTax;
      const taxRate = saleVal > 0 ? itemTax / saleVal : 0.18;
      const variance = Number(item.variance) || 0;
      const varianceBase = Number(item.varianceBaseQty) || 0;
      const action = item.resolutionAction || '';
      if (action.includes('Default Outlet') || action.includes('D/O')) {
        const isExcess = variance > 0 || varianceBase > 0;
        const sign = isExcess ? -1 : 1;
        const outletValue =
          (Math.abs(variance) * price +
            Math.abs(varianceBase) * basePricePerPc) *
          sign;
        totalDefaultOutletValue += outletValue;
        totalDefaultOutletTax += outletValue * taxRate;
      }
    });
    return {
      totalSaleValue,
      totalTaxAmount,
      totalDefaultOutletValue,
      totalDefaultOutletTax,
    };
  }, [aggregatedItems]);

  const subCategoryTotals = useMemo(() => {
    const groups: Record<
      string,
      {
        subCategory: string;
        loadQty: number;
        saleQty: number;
        expectedRop: number;
        actualRop: number;
        variance: number;
        saleValue: number;
        taxAmount: number;
      }
    > = {};

    aggregatedItems.forEach(item => {
      const subCat =
        item.subCategoryName?.trim() ||
        item.categoryName?.trim() ||
        'Uncategorized';

      if (!groups[subCat]) {
        groups[subCat] = {
          subCategory: subCat,
          loadQty: 0,
          saleQty: 0,
          expectedRop: 0,
          actualRop: 0,
          variance: 0,
          saleValue: 0,
          taxAmount: 0,
        };
      }

      const conv = Number(item.conversionRate) || 1;
      const price = Number(item.basePrice) || 0;
      const basePricePerPc = price / conv;

      const hasActualCases =
        item.actualRop !== '' &&
        item.actualRop !== null &&
        item.actualRop !== undefined;
      const hasActualPCs =
        item.actualBaseQty !== '' &&
        item.actualBaseQty !== null &&
        item.actualBaseQty !== undefined;

      const actualVal = hasActualCases ? Number(item.actualRop) : 0;
      const actualBaseVal = hasActualPCs ? Number(item.actualBaseQty) : 0;

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

      const saleQty = Number(item.saleQuantity) || 0;
      const saleBaseQty = Number(item.saleBaseQty) || 0;
      const saleVal = saleQty * price + saleBaseQty * basePricePerPc;

      const g = groups[subCat];
      g.loadQty +=
        (Number(item.loadQuantity) || 0) +
        (Number(item.loadBaseQty) || 0) / conv;
      g.saleQty += saleQty + saleBaseQty / conv;
      g.expectedRop += expectedVal + expectedBaseVal / conv;
      g.actualRop += actualVal + actualBaseVal / conv;
      g.variance += varianceVal + varianceBaseVal / conv;
      g.saleValue += saleVal;
      g.taxAmount += Number(item.taxAmount) || 0;
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
  }, [aggregatedItems]);

  const subCategoryGrandTotal = useMemo(() => {
    return subCategoryTotals.reduce(
      (acc, curr) => ({
        loadQty: acc.loadQty + curr.loadQty,
        saleQty: acc.saleQty + curr.saleQty,
        expectedRop: acc.expectedRop + curr.expectedRop,
        actualRop: acc.actualRop + curr.actualRop,
        variance: acc.variance + curr.variance,
        saleValue: acc.saleValue + curr.saleValue,
        taxAmount: acc.taxAmount + curr.taxAmount,
      }),
      {
        loadQty: 0,
        saleQty: 0,
        expectedRop: 0,
        actualRop: 0,
        variance: 0,
        saleValue: 0,
        taxAmount: 0,
      }
    );
  }, [subCategoryTotals]);

  const columns: TableColumn<ReconciliationItem>[] = [
    {
      id: 'skuCode',
      label: 'SKU Code',
      sortable: false,
      className: '!p-0.5',
      render: val => <span className="">{val}</span>,
    },
    {
      id: 'skuName',
      label: 'SKU Name',
      sortable: true,
      render: val => (
        <span className="font-medium  text-left block">{val}</span>
      ),
    },
    {
      id: 'loadQuantity',
      label: 'Load Qty',
      sortable: true,
      render: (_, row) => {
        const conv = Number(row.conversionRate) || 1;
        const normalizeQty = (c: number, p: number) => {
          if (conv <= 1) return { c: c || 0, p: p || 0 };
          const total = (c || 0) * conv + (p || 0);
          const sign = total < 0 ? -1 : 1;
          const abs = Math.abs(total);
          return { c: Math.floor(abs / conv) * sign, p: (abs % conv) * sign };
        };

        const load = normalizeQty(
          Number(row.loadQuantity),
          Number(row.loadBaseQty)
        );
        const isRGB =
          row.subCategoryName?.toUpperCase().includes('RGB') ||
          row.subCategoryName?.toUpperCase().includes('RETURNABLE GLASS');
        return (
          <span className="block text-center">
            {formatQuantityDisplay(load.c, load.p, isRGB, uomCase, uomPcs)}
          </span>
        );
      },
    },
    {
      id: 'saleQuantity',
      label: 'Sale Qty',
      sortable: true,
      render: (_, row) => {
        const conv = Number(row.conversionRate) || 1;
        const normalizeQty = (c: number, p: number) => {
          if (conv <= 1) return { c: c || 0, p: p || 0 };
          const total = (c || 0) * conv + (p || 0);
          const sign = total < 0 ? -1 : 1;
          const abs = Math.abs(total);
          return { c: Math.floor(abs / conv) * sign, p: (abs % conv) * sign };
        };

        const sale = normalizeQty(
          Number(row.saleQuantity),
          Number(row.saleBaseQty)
        );
        const isRGB =
          row.subCategoryName?.toUpperCase().includes('RGB') ||
          row.subCategoryName?.toUpperCase().includes('RETURNABLE GLASS');
        return (
          <span className="block text-center">
            {formatQuantityDisplay(sale.c, sale.p, isRGB, uomCase, uomPcs)}
          </span>
        );
      },
    },
    {
      id: 'expectedRop',
      label: 'Expected ROP',
      sortable: true,
      render: (_, row) => {
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
        const isRGB =
          row.subCategoryName?.toUpperCase().includes('RGB') ||
          row.subCategoryName?.toUpperCase().includes('RETURNABLE GLASS');
        return (
          <span className="block text-center">
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

        const conv = Number(row.conversionRate) || 1;
        const normalizeQty = (c: number, p: number) => {
          if (conv <= 1) return { c: c || 0, p: p || 0 };
          const total = (c || 0) * conv + (p || 0);
          const sign = total < 0 ? -1 : 1;
          const abs = Math.abs(total);
          return { c: Math.floor(abs / conv) * sign, p: (abs % conv) * sign };
        };
        const actual = normalizeQty(
          Number(row.actualRop),
          Number(row.actualBaseQty)
        );

        const isRGB =
          row.subCategoryName?.toUpperCase().includes('RGB') ||
          row.subCategoryName?.toUpperCase().includes('RETURNABLE GLASS');

        return (
          <span className="block text-center">
            {hasActualCases || hasActualPCs
              ? formatQuantityDisplay(
                  actual.c,
                  actual.p,
                  isRGB,
                  uomCase,
                  uomPcs
                )
              : `0 ${uomCase}`}
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

        const isRGB =
          row.subCategoryName?.toUpperCase().includes('RGB') ||
          row.subCategoryName?.toUpperCase().includes('RETURNABLE GLASS');

        if (val === null || val === undefined)
          return (
            <span className="block text-center font-medium text-gray-900">
              0 {uomCase}
            </span>
          );

        const conv = Number(row.conversionRate) || 1;
        const normalizeQty = (c: number, p: number) => {
          if (conv <= 1) return { c: c || 0, p: p || 0 };
          const total = (c || 0) * conv + (p || 0);
          const sign = total < 0 ? -1 : 1;
          const abs = Math.abs(total);
          return { c: Math.floor(abs / conv) * sign, p: (abs % conv) * sign };
        };

        const variance = normalizeQty(Number(val), Number(baseVal));

        const isShort = variance.c < 0 || variance.p < 0;
        const isExcess = variance.c > 0 || variance.p > 0;
        const color = isShort
          ? 'text-red-600'
          : isExcess
            ? 'text-blue-600'
            : 'text-gray-900';

        return (
          <span className={`block text-center font-medium ${color}`}>
            {formatVarianceDisplay(
              variance.c,
              variance.p,
              isRGB,
              uomCase,
              uomPcs
            )}
          </span>
        );
      },
    },
    {
      id: 'basePrice',
      label: 'Unit Price (TZS)',
      render: val => (
        <span className="block  text-center">
          {(val || 0).toLocaleString()}
        </span>
      ),
    },
    {
      id: 'saleValue',
      label: 'Sale Value',
      render: (_, row) => (
        <span className="block  text-center font-medium">
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
      id: 'taxAmount',
      label: 'Tax Amount',
      render: val => (
        <span className="block  text-center">
          {(val || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      ),
    },
    {
      id: 'resolutionAction',
      label: 'Action',
      render: (val, row) => {
        let displayVal = val;
        const v = Number(row.variance) || 0;
        const vb = Number(row.varianceBaseQty) || 0;
        const hasVariance = v !== 0 || vb !== 0;

        if (
          displayVal === 'Blocked - Force-Push Required' ||
          displayVal === 'Awaiting Force-Push'
        ) {
          displayVal = 'Blocked';
        } else if (!hasVariance) {
          displayVal = 'CLEAN';
        } else {
          displayVal = 'Posted to D/O';
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
        else if (
          displayVal?.includes('Default Outlet') ||
          displayVal?.includes('D/O')
        ) {
          const isExcess = v > 0 || vb > 0;
          color = isExcess ? 'info' : 'warning';
        } else if (displayVal?.includes('Adjust')) color = 'info';
        return (
          <div className="text-center  block">
            <Chip
              label={displayVal || '-'}
              color={color}
              size="small"
              className="font-medium"
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
        uomCase,
        uomPcs,
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
          <Table
            data={aggregatedItems}
            groupBy={row =>
              row.subCategoryName?.trim() ||
              row.categoryName?.trim() ||
              'Uncategorized'
            }
            renderGroupHeader={group => (
              <span className="text-sm font-semibold uppercase text-gray-800">
                {group}
              </span>
            )}
            getRowId={row => row.id}
            tableId="settlement-items-table"
            columns={columns}
            sortable={false}
            filterColunm={false}
            loading={isFetching}
            isPermission={isRead}
            pagination={false}
            compact
            emptyMessage="No items found."
          />
          {subCategoryTotals.length > 0 && (
            <div className="border-t border-gray-200">
              <div className="bg-gray-200 text-gray-800 px-4 py-2 font-semibold text-sm tracking-wider uppercase">
                Subtotals by Sub-Category
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-blue-50 text-gray-700 font-semibold border-b border-gray-200">
                      <th className="py-2.5 px-4">Sub-Category</th>
                      <th className="py-2.5 px-4 text-center">
                        Total Load Qty
                      </th>
                      <th className="py-2.5 px-4 text-center">
                        Total Sales Qty
                      </th>
                      <th className="py-2.5 px-4 text-center">Expected ROP</th>
                      <th className="py-2.5 px-4 text-center">Actual ROP</th>
                      <th className="py-2.5 px-4 text-center">Variance</th>
                      <th className="py-2.5 px-4 text-right">Sale Value</th>
                      <th className="py-2.5 px-4 text-right">Tax Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-sm divide-gray-100">
                    {subCategoryTotals.map(row => (
                      <tr key={row.subCategory} className="hover:bg-gray-50">
                        <td className="p-1.5 font-medium text-gray-900">
                          {row.subCategory}
                        </td>
                        <td className="p-1.5 text-center">
                          {row.loadQty.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="p-1.5 text-center">
                          {row.saleQty.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="p-1.5 text-center">
                          {row.expectedRop.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="p-1.5 text-center">
                          {row.actualRop.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td
                          className={`p-1.5 text-center font-medium ${
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
                        <td className="p-1.5 text-right">
                          {row.saleValue.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="p-1.5 text-right">
                          {row.taxAmount.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-amber-100/90 font-semibold border-t border-amber-300 text-gray-900">
                      <td className="p-1.5 uppercase tracking-wider">
                        Grand Total
                      </td>
                      <td className="p-1.5 text-center">
                        {subCategoryGrandTotal.loadQty.toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </td>
                      <td className="p-1.5 text-center">
                        {subCategoryGrandTotal.saleQty.toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </td>
                      <td className="p-1.5 text-center">
                        {subCategoryGrandTotal.expectedRop.toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </td>
                      <td className="p-1.5 text-center">
                        {subCategoryGrandTotal.actualRop.toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </td>
                      <td
                        className={`p-1.5 text-center ${
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
                      <td className="p-1.5 text-right">
                        {subCategoryGrandTotal.saleValue.toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </td>
                      <td className="p-1.5 text-right">
                        {subCategoryGrandTotal.taxAmount.toLocaleString(
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
          {/* Cash Settlement */}
          <div className="p-3 border-t border-gray-200 bg-blue-50/50 print:bg-transparent">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              CASH SETTLEMENT
            </h3>
            <div className="space-y-1 text-sm">
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
                  Total Tax Amount (From recorded sales):
                </span>
                <span className="font-semibold text-gray-900">
                  {grandTotal.totalTaxAmount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  TZS
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">
                  Default Outlet Posting Value (Net Shortage/Excess):
                </span>
                <span
                  className={`font-semibold ${grandTotal.totalDefaultOutletValue < 0 ? 'text-blue-600' : 'text-red-600'}`}
                >
                  {grandTotal.totalDefaultOutletValue.toLocaleString()} TZS
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">
                  Default Outlet Posting Tax Amount (Net Shortage/Excess):
                </span>
                <span
                  className={`font-semibold ${grandTotal.totalDefaultOutletTax < 0 ? 'text-blue-600' : 'text-red-600'}`}
                >
                  {grandTotal.totalDefaultOutletTax.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  TZS
                </span>
              </div>
              <div className="flex justify-between items-center rounded-lg print:bg-transparent print:border print:border-black">
                <span className="font-bold text-gray-900">
                  TOTAL CASH SALESMAN MUST DEPOSIT:
                </span>
                <span className="text-xl font-bold text-blue-700 print:text-black">
                  {(
                    grandTotal.totalSaleValue +
                    grandTotal.totalTaxAmount +
                    grandTotal.totalDefaultOutletValue +
                    grandTotal.totalDefaultOutletTax
                  ).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  TZS
                </span>
              </div>
            </div>
          </div>
          {/* Signatures */}
          {/* <div className="p-3 border-t border-gray-200">
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
          </div> */}
        </div>
      )}
    </div>
  );
}
