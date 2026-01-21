import { Close } from '@mui/icons-material';
import { Box, Dialog, Divider, Typography } from '@mui/material';
import type { ProductBatch, ProductSerial } from 'hooks/useVanInventory';
import React from 'react';
import { toast } from 'react-toastify';
import { ActionButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import Input from 'shared/Input';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from '../../../../utils/dateUtils';
import type { OrderItemFormData } from './index';

interface ManageOrderBatchProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedRowIndex: number | null;
  setSelectedRowIndex: (rowIndex: number | null) => void;
  orderItems: OrderItemFormData[];
  setOrderItems: (items: OrderItemFormData[]) => void;
  inventoryByProductId?: Record<
    number,
    { batches: ProductBatch[]; serials: ProductSerial[] }
  >;
}

const ManageOrderBatch: React.FC<ManageOrderBatchProps> = ({
  isOpen,
  setIsOpen,
  selectedRowIndex,
  setSelectedRowIndex,
  orderItems,
  setOrderItems,
  inventoryByProductId,
}) => {
  const [productBatches, setProductBatches] = React.useState<ProductBatch[]>(
    []
  );
  React.useEffect(() => {
    if (selectedRowIndex === null) {
      return;
    }

    const item = orderItems[selectedRowIndex];

    if (!item) {
      setProductBatches([]);
      return;
    }

    const existing = (item.product_batches as ProductBatch[] | undefined) || [];

    if (existing.length > 0) {
      setProductBatches(existing);
      return;
    }

    const productId =
      typeof item.product_id === 'number' ? item.product_id : null;

    if (
      productId &&
      inventoryByProductId &&
      inventoryByProductId[productId] &&
      inventoryByProductId[productId].batches.length > 0
    ) {
      const initialBatches = inventoryByProductId[productId].batches.map(
        batch => ({
          ...batch,
          quantity: batch.batch_remaining_quantity || batch.quantity || 0,
        })
      );
      setProductBatches(initialBatches);
      return;
    }

    setProductBatches([]);
  }, [selectedRowIndex, orderItems, inventoryByProductId]);

  const handleClose = React.useCallback(() => {
    setIsOpen(false);
    setProductBatches([]);
    setSelectedRowIndex(null);
  }, [setIsOpen, setSelectedRowIndex]);

  const handleDelete = React.useCallback((rowIndex: number) => {
    setProductBatches(prev => prev.filter((_, index) => index !== rowIndex));
  }, []);

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

    const missingIndex = activeBatches.findIndex(b => {
      const batchNumber = (b.batch_number || '').trim();
      const mfg = (b.manufacturing_date || '').trim();
      const exp = (b.expiry_date || '').trim();
      const qty = Number(b.quantity);
      return !batchNumber || !mfg || !exp || !Number.isFinite(qty) || qty <= 0;
    });

    if (missingIndex !== -1) {
      toast.error(
        `Please fill Batch Number, MFG Date, EXP Date and Quantity (> 0) for row ${missingIndex + 1}.`
      );
      return;
    }

    const seen = new Set<string>();
    const duplicateIndex = activeBatches.findIndex(b => {
      const key = `${(b.batch_number || '')
        .trim()
        .toLowerCase()}|${(b.lot_number || '').trim().toLowerCase()}`;
      if (seen.has(key)) return true;
      seen.add(key);
      return false;
    });

    if (duplicateIndex !== -1) {
      toast.error(`Duplicate batch entry found at row ${duplicateIndex + 1}.`);
      return;
    }

    const updatedItems = [...orderItems];
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
    setOrderItems(updatedItems);
    handleClose();
  }, [
    selectedRowIndex,
    productBatches,
    orderItems,
    setOrderItems,
    handleClose,
  ]);

  const isFormValid = React.useMemo(() => {
    if (selectedRowIndex === null) return false;

    const activeBatches = productBatches.filter(b => {
      const qty = Number(b.quantity);
      return Number.isFinite(qty) && qty > 0;
    });

    const totalQty = activeBatches.reduce(
      (sum, b) => sum + (Number(b.quantity) || 0),
      0
    );

    if (activeBatches.length === 0) return false;
    if (totalQty <= 0) return false;

    const hasMissing = activeBatches.some(b => {
      const batchNumber = (b.batch_number || '').trim();
      const mfg = (b.manufacturing_date || '').trim();
      const exp = (b.expiry_date || '').trim();
      const qty = Number(b.quantity);
      return !batchNumber || !mfg || !exp || !Number.isFinite(qty) || qty <= 0;
    });
    if (hasMissing) return false;

    const seen = new Set<string>();
    for (const b of activeBatches) {
      const key = `${(b.batch_number || '')
        .trim()
        .toLowerCase()}|${(b.lot_number || '').trim().toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
    }

    return true;
  }, [selectedRowIndex, productBatches]);

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
        id: 'total_quantity',
        label: 'Total Quantity',
        render: (_value, row) => (
          <Typography variant="body2" className="!text-gray-600">
            {row.batch_remaining_quantity}
          </Typography>
        ),
      },
      {
        id: 'quantity',
        label: 'Quantity',
        render: (_value, row, rowIndex) => (
          <Input
            type="number"
            value={row.quantity}
            onChange={e => {
              const raw = Number(e.target.value);
              const max = Number(
                row.batch_remaining_quantity ?? row.quantity ?? 0
              );
              if (!Number.isFinite(raw)) {
                handleBatchChange('quantity', rowIndex, 0);
                return;
              }
              const nonNegative = raw >= 0 ? raw : 0;
              const limited =
                Number.isFinite(max) && max > 0
                  ? Math.min(nonNegative, max)
                  : nonNegative;

              handleBatchChange('quantity', rowIndex, limited);
            }}
            size="small"
            className="!w-40"
            placeholder="Enter quantity"
            fullWidth
          />
        ),
      },
    ],
    [handleBatchChange, handleDelete]
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
          emptyMessage="No batches in this product"
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
          disabled={!isFormValid}
        >
          Update
        </Button>
      </Box>
    </Dialog>
  );
};

export default ManageOrderBatch;
