import { Visibility } from '@mui/icons-material';
import { Avatar, Box, Typography } from '@mui/material';
import { useCurrency } from 'hooks/useCurrency';
import { type Invoice } from 'hooks/useInvoices';
import { usePermission } from 'hooks/usePermission';
import { Calendar, Receipt } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { ActionButton } from 'shared/ActionButton';
import Table, { type TableColumn } from 'shared/Table';
import { formatDateTime } from 'utils/dateUtils';
import InvoiceDetail from '../../../transactions/Invoices/InvoiceDetail';

interface CustomerInvoicesProps {
  invoices: Invoice[];
}

const CustomerInvoices: React.FC<CustomerInvoicesProps> = ({ invoices }) => {
  const { formatCurrency } = useCurrency();
  const { isRead } = usePermission('invoice');

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);

  const handleViewInvoice = useCallback((invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDetailDrawerOpen(true);
  }, []);

  const invoiceColumns: TableColumn<Invoice>[] = [
    {
      id: 'invoice_number',
      label: 'Invoice Info',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.invoice_number}
            className="!rounded !bg-primary-100 !text-primary-500"
          >
            <Receipt className="w-5 h-5" />
          </Avatar>
          <Box>
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight"
            >
              {row.invoice_number}
            </Typography>
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block !mt-0.5"
            >
              {row.invoice_items?.length || 0} items
              {row.parent_id && ` • Order #${row.parent_id}`}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'invoice_date',
      label: 'Date',
      render: (_value, row) => (
        <Box>
          <Box className="flex items-center text-sm text-gray-900">
            <Calendar className="w-4 h-4 text-gray-400 mr-1" />
            {row.invoice_date ? formatDateTime(row.invoice_date) : 'N/A'}
          </Box>
        </Box>
      ),
    },
    {
      id: 'total_amount',
      label: 'Amounts',
      render: (_value, row) => (
        <Box>
          <Typography variant="body2" className="!text-gray-900 !font-medium">
            Total:{' '}
            {formatCurrency(Number(row.subtotal) + Number(row.tax_amount) || 0)}
          </Typography>
          <Typography
            variant="caption"
            className="!text-gray-500 !text-xs !block !mt-0.5"
          >
            Tax: {formatCurrency(row.tax_amount || 0)}
          </Typography>
        </Box>
      ),
    },
    ...(isRead
      ? [
          {
            id: 'action',
            label: 'Actions',
            sortable: false,
            render: (_value: any, row: Invoice) => (
              <div className="!flex !gap-2 !items-center">
                <ActionButton
                  onClick={() => handleViewInvoice(row)}
                  tooltip="View invoice details"
                  icon={<Visibility className="!text-[20px]" />}
                  color="success"
                />
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      <Table
        data={invoices}
        columns={invoiceColumns}
        getRowId={invoice => invoice.id}
        initialOrderBy="invoice_number"
        isPermission={isRead}
        emptyMessage="No invoices found for this outlet"
        pagination={false}
      />
      {detailDrawerOpen && (
        <InvoiceDetail
          open={detailDrawerOpen}
          onClose={() => setDetailDrawerOpen(false)}
          invoice={selectedInvoice}
        />
      )}
    </>
  );
};

export default CustomerInvoices;
