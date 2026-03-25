import { Close } from '@mui/icons-material';
import { Box, Dialog, Divider, Typography } from '@mui/material';
import type { ProductBatch } from 'hooks/useVanInventory';
import React from 'react';
import { toast } from 'react-toastify';
import { ActionButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import Input from 'shared/Input';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from '../../../../utils/dateUtils';
import type { InvoiceItemFormData } from './index';

interface ManageInvoiceBatchProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedRowIndex: number | null;
  setSelectedRowIndex: (rowIndex: number | null) => void;
  invoiceItems: InvoiceItemFormData[];
  setInvoiceItems: (items: InvoiceItemFormData[]) => void;
}

const ManageInvoiceBatch: React.FC<ManageInvoiceBatchProps> = ({
  isOpen,
  setIsOpen,
  selectedRowIndex,
  setSelectedRowIndex,
  invoiceItems,
  setInvoiceItems,
}) => {
  const [productBatches, setProductBatches] = React.useState<ProductBatch[]>([]);

  React.useEffect(() => {
    if (selectedRowIndex === null || !isOpen) {
      return;
    }

    const item = invoiceItems[selectedRowIndex];
    if (!item) {
      setProductBatches([]);
      return;
    }

    const existing = (item.product_batches as ProductBatch[] | undefined) || [];
    setProductBatches(existing);
  }, [selectedRowIndex, invoiceItems, isOpen]);

  const handleClose = React.useCallback(() => {
    setIsOpen(false);
    setProductBatches([]);
    setSelectedRowIndex(null);
  }, [setIsOpen, setSelectedRowIndex]);

  const handleBatchChange = React.useCallback(
    (field: keyof ProductBatch, rowIndex: number, value: string | number) => {
      setProductBatches(prev => {
        const updated = [...prev];
        if (field === 'quantity') {
          const raw = Number(value);
          const normalized = Number.isFinite(raw) && raw >= 0 ? raw : 0;
          updated[rowIndex] = {
            ...updated[rowIndex],
            quantity: normalized,
          };
          return updated;
        }
        updated[rowIndex] = {
          ...updated[rowIndex],
          [field]: value,
        };
        return updated;
      });
    },
    []
  );

  const handleSubmit = React.useCallback(() => {
    if (selectedRowIndex === null) return;

    const activeBatches = productBatches.filter(b => {
      const qty = Number(b.quantity);
      return Number.isFinite(qty) && qty > 0;
    });

    const totalQty = activeBatches.reduce(
      (sum, b) => sum + (Number(b.quantity) || 0),
      0
    );

    if (activeBatches.length === 0 || totalQty <= 0) {
      toast.error('Total batch quantity must be greater than 0.');
      return;
    }

    const updatedItems = [...invoiceItems];
    updatedItems[selectedRowIndex] = {
      ...updatedItems[selectedRowIndex],
      quantity: String(totalQty),
      product_batches: productBatches.map(b => ({
        ...b,
        batch_number: (b.batch_number || '').trim(),
        lot_number: (b.lot_number || '').trim(),
        quantity: Number(b.quantity) || 0,
        manufacturing_date: (b.manufacturing_date || '').trim(),
        expiry_date: (b.expiry_date || '').trim(),
      })),
    };
    setInvoiceItems(updatedItems);
    handleClose();
  }, [selectedRowIndex, productBatches, invoiceItems, setInvoiceItems, handleClose]);

  const totalBatchQuantity = React.useMemo(
    () => productBatches.reduce((sum, b) => sum + (Number(b.quantity) || 0), 0),
    [productBatches]
  );

  const columns: TableColumn<ProductBatch>[] = React.useMemo(
    () => [
      {
        id: 'batch_number',
        label: 'Batch Number',
        render: (_value, row) => (
          <Typography variant="body2" className="!text-gray-900">
            {row.batch_number}
          </Typography>
        ),
      },
      {
        id: 'manufacturing_date',
        label: 'MFG Date',
        render: (_value, row) => (
          <Typography variant="body2" className="!text-gray-900">
            {formatDate(row.manufacturing_date)}
          </Typography>
        ),
      },
      {
        id: 'expiry_date',
        label: 'EXP Date',
        render: (_value, row) => (
          <Typography variant="body2" className="!text-gray-900">
            {formatDate(row.expiry_date)}
          </Typography>
        ),
      },
      {
        id: 'quantity',
        label: 'Quantity',
        render: (_value, row, rowIndex) => (
          <Input
            type="number"
            value={row.quantity || 0}
            onChange={e => handleBatchChange('quantity', rowIndex, e.target.value)}
            size="small"
            className="!w-40"
            placeholder="Enter quantity"
            fullWidth
          />
        ),
      },
    ],
    [handleBatchChange]
  );

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      slotProps={{
        paper: {
          className: '!min-w-[60%] !max-w-[60%]',
        },
      }}
    >
      <div className="flex justify-between items-center !p-2">
        <p className="!font-semibold text-lg !text-gray-900">
          Batch Information ({totalBatchQuantity})
        </p>
        <ActionButton
          icon={<Close />}
          onClick={handleClose}
          size="small"
          aria-label="Close dialog"
        />
      </div>
      <Divider />
      <Box className="!p-2 min-h-[40vh]">
        <Table
          stickyHeader
          maxHeight="50vh"
          columns={columns}
          data={productBatches}
          compact
          pagination={false}
          sortable={false}
          emptyMessage="No batches assigned to this item"
        />
      </Box>
      <Box className="!p-2 !flex !justify-end !border-t gap-2 !border-gray-300">
        <Button variant="outlined" color="info" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
        >
          Update
        </Button>
      </Box>
    </Dialog>
  );
};

export default ManageInvoiceBatch;
