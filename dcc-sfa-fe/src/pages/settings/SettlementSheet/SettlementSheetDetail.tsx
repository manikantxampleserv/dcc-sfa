import { usePermission } from 'hooks/usePermission';
import {
  useReconciliationById,
  type ReconciliationItem,
} from 'hooks/useReconciliation';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Table, { type TableColumn } from 'shared/Table';

export default function SettlementSheetDetail() {
  const { id } = useParams<{ id: string }>();
  const { isRead } = usePermission('settlement-sheet');

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

  const groupedItems = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        const cat = item.categoryName || 'Uncategorized';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
      },
      {} as Record<string, ReconciliationItem[]>
    );
  }, [items]);

  const grandTotal = useMemo(() => {
    let totalSaleValue = 0;
    let totalDefaultOutletValue = 0;

    items.forEach(item => {
      const variance = Number(item.variance) || 0;
      if (item.resolutionAction === 'Default Outlet Posting' && variance < 0) {
        totalDefaultOutletValue += Math.abs(variance) * (item.basePrice || 0);
      }
    });

    return { totalSaleValue, totalDefaultOutletValue };
  }, [items]);

  const columns: TableColumn<ReconciliationItem>[] = [
    { id: 'skuCode', label: 'SKU Code', sortable: true },
    {
      id: 'skuName',
      label: 'SKU Name',
      sortable: true,
      render: val => <span className="font-medium text-left block">{val}</span>,
    },
    {
      id: 'batchNumber',
      label: 'Batch',
      sortable: true,
      render: val => <span className="block text-center">{val || '-'}</span>,
    },
    {
      id: 'loadQuantity',
      label: 'Load Qty',
      sortable: true,
      render: val => <span className="block text-center">{val || 0}</span>,
    },
    {
      id: 'saleQuantity',
      label: 'Sale Qty',
      sortable: true,
      render: val => <span className="block text-center">{val || 0}</span>,
    },
    {
      id: 'saleValue',
      label: 'Sale Value',
      render: (_, row) => (
        <span className="block text-center font-medium">
          {((row.saleQuantity || 0) * (row.basePrice || 0)).toLocaleString()}
        </span>
      ),
    },
    {
      id: 'expectedRop',
      label: 'Expected ROP',
      sortable: true,
      render: val => <span className="block text-center">{val}</span>,
    },
    {
      id: 'actualRop',
      label: 'Actual ROP',
      render: val => <span className="block text-center">{val || '-'}</span>,
    },
    {
      id: 'variance',
      label: 'Variance',
      render: val => {
        const numVal = Number(val);
        const color =
          numVal < 0
            ? 'text-red-600'
            : numVal > 0
              ? 'text-blue-600'
              : 'text-gray-900';
        return (
          <span className={`block text-center font-medium ${color}`}>
            {val !== null ? val : '-'}
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
      render: val => (
        <div className="text-center block">
          <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
            {val}
          </span>
        </div>
      ),
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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settlement Sheet</h1>
          <p className="text-sm text-gray-500">Daily Salesman Settlement</p>
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
                emptyMessage="No items found."
              />
            </div>
          ))}

          {/* Cash Settlement */}
          <div className="p-6 border-t border-gray-200 bg-blue-50/50 print:bg-transparent">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              CASH SETTLEMENT
            </h3>
            <div className="max-w-2xl space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">
                  Default Outlet Posting Value (Shortage):
                </span>
                <span className="font-semibold text-gray-900">
                  {grandTotal.totalDefaultOutletValue.toLocaleString()} TZS
                </span>
              </div>
              <div className="flex justify-between items-center py-3 bg-blue-100/50 px-4 rounded-lg print:bg-transparent print:border print:border-black">
                <span className="font-bold text-gray-900">
                  TOTAL CASH SALESMAN MUST DEPOSIT:
                </span>
                <span className="text-xl font-bold text-blue-700 print:text-black">
                  {grandTotal.totalDefaultOutletValue.toLocaleString()} TZS
                </span>
              </div>
              <p className="text-xs text-gray-500 italic mt-2">
                * Note: Total Sales Value omitted based on current backend
                constraints. Only shortages (Default Outlet Postings) are
                currently calculated in the deposit total.
              </p>
            </div>
          </div>

          {/* Signatures */}
          <div className="p-6 pt-12 border-t border-gray-200 mt-8">
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
