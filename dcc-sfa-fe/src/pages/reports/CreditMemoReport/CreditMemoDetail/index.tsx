import { PersonOutlineRounded } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Chip,
  Divider,
  Paper,
  Skeleton,
  Typography,
} from '@mui/material';
import { useCreditMemoReportById } from 'hooks/useReports';
import { useResolvedUom } from 'hooks/useUnitOfMeasurement';
import { Building, CircleDollarSign, Package, Receipt } from 'lucide-react';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { CreditMemoLineItem } from 'services/reports/creditMemo';
import Button from 'shared/Button';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate, formatDateTime } from 'utils/dateUtils';

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

const CreditMemoDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { uomCase, uomPcs } = useResolvedUom();

  const {
    data: memoData,
    isLoading,
    error,
  } = useCreditMemoReportById(Number(id));

  const getStatusChip = (status?: string | null) => {
    switch (status) {
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
            label={status || 'Unknown'}
            className="!font-medium"
          />
        );
    }
  };

  const lineColumns: TableColumn<CreditMemoLineItem>[] = [
    {
      id: 'product',
      label: 'Product Details',
      render: (_value, row) => (
        <Box className="!flex !items-center !gap-2">
          <Avatar
            alt={row.product_name || 'Product'}
            className="!rounded !bg-primary-100 !text-primary-600"
          >
            <Package className="w-5 h-5" />
          </Avatar>
          <Box className="flex flex-col">
            <Typography
              variant="body2"
              className="!font-semibold !text-gray-900"
            >
              {row.product_name || 'N/A'}
            </Typography>
            <Typography variant="caption" className="!text-gray-500">
              SAP Code: {row.product_sap_code}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'sap_docnum',
      label: 'SAP Doc / Line',
      render: (_value, row) => (
        <Box className="flex flex-col">
          <Typography variant="body2" className="!text-gray-800 ">
            {row.sap_docnum || 'N/A'}
          </Typography>
          <Typography variant="caption" className="!text-gray-500">
            Line ID: {row.sap_lineid}{' '}
            {row.sap_docentry ? `• Entry: ${row.sap_docentry}` : ''}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'batch_number',
      label: 'Batch No',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-700 ">
          {row.batch_number || 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'quantity',
      label: 'Quantity',
      render: (_value, row) => {
        const conv =
          Number(row.conversion_rate || row.unit_case_conversion_rate) || 1;
        const normalizeQty = (c: number, p: number) => {
          if (conv <= 1) return { c: c || 0, p: p || 0 };
          const total = (c || 0) * conv + (p || 0);
          const sign = total < 0 ? -1 : 1;
          const abs = Math.abs(total);
          return { c: Math.floor(abs / conv) * sign, p: (abs % conv) * sign };
        };

        const qty = normalizeQty(
          Number(row.quantity || 0),
          Number(row.base_quantity || 0)
        );

        const isRGB =
          row.sub_category_name?.toUpperCase().includes('RGB') ||
          row.sub_category_name?.toUpperCase().includes('RETURNABLE GLASS') ||
          row.category_name?.toUpperCase().includes('RGB') ||
          row.product_name?.toUpperCase().includes('RGB') ||
          qty.p > 0;

        return (
          <Typography variant="body2" className="!font-bold !text-gray-900">
            {formatQuantityDisplay(qty.c, qty.p, isRGB, uomCase, uomPcs)}
          </Typography>
        );
      },
    },
    {
      id: 'purchase_price',
      label: 'Purchase Price',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-700">
          TZS{' '}
          {Number(row.purchase_price || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Typography>
      ),
    },
    {
      id: 'total_amount',
      label: 'Total Amount',
      render: (_value, row) => (
        <Typography variant="body2" className="!font-bold !text-gray-900">
          TZS{' '}
          {Number(row.total_amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Typography>
      ),
    },
  ];

  if (isLoading) {
    return (
      <Box className="space-y-4">
        <Skeleton variant="text" width={300} height={40} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton variant="rectangular" height={100} className="rounded-lg" />
          <Skeleton variant="rectangular" height={100} className="rounded-lg" />
          <Skeleton variant="rectangular" height={100} className="rounded-lg" />
        </div>
        <Skeleton variant="rectangular" height={350} className="rounded-lg" />
      </Box>
    );
  }

  if (error || !memoData) {
    return (
      <Box className="p-6 text-center">
        <Typography variant="h6" className="!text-red-600 !font-semibold">
          Credit memo details not found or failed to load.
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate('/reports/credit-memo')}
          className="!mt-4"
        >
          Back to Reports
        </Button>
      </Box>
    );
  }

  const lines = memoData.lines || [];

  return (
    <Box className="space-y-4">
      {/* Top Header */}
      <Box className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <Box className="flex items-center gap-3">
          <Box>
            <Box className="flex items-center gap-2">
              <p className="!font-bold text-xl !text-gray-900">
                {memoData.batch_ref}
              </p>
              {getStatusChip(memoData.status)}
            </Box>
            <Typography variant="caption" className="!text-gray-500">
              Credit Memo #{memoData.id} • Created on{' '}
              {memoData.createdate
                ? formatDateTime(memoData.createdate)
                : 'N/A'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Total Line Items"
          value={memoData.total_lines || lines.length}
          icon={<Receipt size={20} />}
          color="blue"
        />
        <StatsCard
          title="Total Quantity"
          value={`${Number(memoData.total_quantity || 0).toLocaleString()} ${uomCase}`}
          icon={<Package size={20} />}
          color="purple"
        />
        <StatsCard
          title="Total Memo Amount (TZS)"
          value={`TZS ${Number(memoData.total_value || 0).toLocaleString(
            undefined,
            { minimumFractionDigits: 2, maximumFractionDigits: 2 }
          )}`}
          icon={<CircleDollarSign size={20} />}
          color="emerald"
        />
      </div>

      {/* Info Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Salesman & Depot Card */}
        <Paper
          elevation={0}
          className="!bg-white !rounded-lg !border !border-gray-100 !shadow-sm"
        >
          <Typography
            variant="subtitle1"
            className="!font-bold !text-gray-900 !flex !items-center !gap-2 p-3"
          >
            <Avatar
              src=""
              className="!w-8 !h-8 !bg-blue-200 !rounded !text-blue-500"
            >
              <PersonOutlineRounded />
            </Avatar>
            Personnel & Location
          </Typography>
          <Divider />
          <div className="grid grid-cols-2 gap-3 p-3 text-sm">
            <div>
              <Typography variant="caption" className="!text-gray-500 !block">
                Salesman Name
              </Typography>
              <Typography
                variant="body2"
                className="!font-medium !text-gray-900"
              >
                {memoData.salesman?.name || 'N/A'}
              </Typography>
            </div>
            <div>
              <Typography variant="caption" className="!text-gray-500 !block">
                Salesman SAP Code
              </Typography>
              <Typography
                variant="body2"
                className="!font-medium !text-gray-900"
              >
                {memoData.salesman_sap_code}
              </Typography>
            </div>
            <div>
              <Typography variant="caption" className="!text-gray-500 !block">
                Employee ID
              </Typography>
              <Typography
                variant="body2"
                className="!font-medium !text-gray-900"
              >
                {memoData.salesman?.employee_id || 'N/A'}
              </Typography>
            </div>
            <div>
              <Typography variant="caption" className="!text-gray-500 !block">
                Depot Name / Code
              </Typography>
              <Typography
                variant="body2"
                className="!font-medium !text-gray-900"
              >
                {memoData.depot?.name || memoData.depot_sap_code || 'N/A'}
                {memoData.depot?.code ? ` (${memoData.depot.code})` : ''}
              </Typography>
            </div>
          </div>
        </Paper>

        {/* Document & System Details Card */}
        <Paper
          elevation={0}
          className="!bg-white !rounded-lg !border !border-gray-100 !shadow-sm"
        >
          <Typography
            variant="subtitle1"
            className="!font-bold !text-gray-900 !flex !items-center !gap-2 p-3"
          >
            <Avatar
              src=""
              className="!w-8 !h-8 !bg-purple-200 !rounded !text-purple-500"
            >
              <Building size={18} />
            </Avatar>
            Document Metadata
          </Typography>
          <Divider />
          <div className="grid grid-cols-2 gap-3 p-3 text-sm">
            <div>
              <Typography variant="caption" className="!text-gray-500 !block">
                Document Date
              </Typography>
              <Typography
                variant="body2"
                className="!font-medium !text-gray-900"
              >
                {memoData.document_date
                  ? formatDate(memoData.document_date)
                  : 'N/A'}
              </Typography>
            </div>
            <div>
              <Typography variant="caption" className="!text-gray-500 !block">
                SAP Doc Numbers
              </Typography>
              <Typography
                variant="body2"
                className=" !font-medium !text-gray-900"
              >
                {memoData.sap_docnums || 'N/A'}
              </Typography>
            </div>
            <div>
              <Typography variant="caption" className="!text-gray-500 !block">
                Reconciliation ID
              </Typography>
              <Typography
                variant="body2"
                className="!font-medium !text-gray-900"
              >
                {memoData.reconciliation_id
                  ? `#${memoData.reconciliation_id}`
                  : 'None'}
              </Typography>
            </div>
            <div>
              <Typography variant="caption" className="!text-gray-500 !block">
                Active Status
              </Typography>
              <Typography
                variant="body2"
                className="!font-medium !text-gray-900"
              >
                {memoData.is_active === 'Y' ? 'Active' : 'Inactive'}
              </Typography>
            </div>
          </div>
        </Paper>
      </div>

      {/* Itemized Lines Table */}
      <Paper
        elevation={0}
        className="!bg-white !rounded-lg !border !border-gray-100 !shadow-sm !overflow-hidden"
      >
        <Box className="!p-3 !border-b !border-gray-100 flex justify-between items-center">
          <Box>
            <Typography variant="body1" className="!font-bold !text-gray-900">
              Line Items Detail ({lines.length})
            </Typography>
            <Typography variant="body2" className="!text-gray-500">
              All credit memo line entries and batch allotments
            </Typography>
          </Box>
        </Box>

        <Box className="p-0">
          <Table
            columns={lineColumns}
            data={lines}
            sortable={false}
            filterColunm={false}
            pagination={false}
            emptyMessage="No line items found for this credit memo"
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default CreditMemoDetail;
