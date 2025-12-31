import { Close } from '@mui/icons-material';
import { Box, Dialog, Divider } from '@mui/material';
import type { ProductBatch, ProductSerial } from 'hooks/useVanInventory';
import React from 'react';
import { toast } from 'react-toastify';
import { ActionButton, DeleteButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import Input from 'shared/Input';
import Table, { type TableColumn } from 'shared/Table';
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
          quantity:
            batch.quantity !== null && batch.quantity !== undefined
              ? batch.quantity
              : 0,
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

    const totalQty = productBatches.reduce(
      (sum, b) => sum + (Number(b.quantity) || 0),
      0
    );

    if (totalQty <= 0) {
      toast.error('Total batch quantity must be greater than 0.');
      return;
    }

    const missingIndex = productBatches.findIndex(b => {
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
    const duplicateIndex = productBatches.findIndex(b => {
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

    const totalQty = productBatches.reduce(
      (sum, b) => sum + (Number(b.quantity) || 0),
      0
    );

    if (productBatches.length === 0) return false;
    if (totalQty <= 0) return false;

    const hasMissing = productBatches.some(b => {
      const batchNumber = (b.batch_number || '').trim();
      const mfg = (b.manufacturing_date || '').trim();
      const exp = (b.expiry_date || '').trim();
      const qty = Number(b.quantity);
      return !batchNumber || !mfg || !exp || !Number.isFinite(qty) || qty <= 0;
    });
    if (hasMissing) return false;

    const seen = new Set<string>();
    for (const b of productBatches) {
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
        render: (_value, row, rowIndex) => (
          <Input
            value={row.batch_number}
            onChange={e =>
              handleBatchChange('batch_number', rowIndex, e.target.value)
            }
            size="small"
            className="!w-52"
            placeholder="Enter batch number"
            fullWidth
          />
        ),
      },
      {
        id: 'manufacturing_date',
        label: 'MFG Date',
        render: (_value, row, rowIndex) => (
          <Input
            type="date"
            value={row.manufacturing_date}
            onChange={e =>
              handleBatchChange('manufacturing_date', rowIndex, e.target.value)
            }
            className="!w-52"
            size="small"
            placeholder="Enter manufacturing date"
          />
        ),
      },
      {
        id: 'expiry_date',
        label: 'EXP Date',
        render: (_value, row, rowIndex) => (
          <Input
            type="date"
            value={row.expiry_date}
            onChange={e =>
              handleBatchChange('expiry_date', rowIndex, e.target.value)
            }
            className="!w-52"
            size="small"
            placeholder="Enter expiry date"
          />
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
              if (Number(e.target.value) >= 0) {
                handleBatchChange('quantity', rowIndex, Number(e.target.value));
              } else {
                handleBatchChange('quantity', rowIndex, 0);
              }
            }}
            size="small"
            className="!w-32"
            placeholder="Enter quantity"
            fullWidth
          />
        ),
      },
      {
        id: 'actions',
        label: 'Actions',
        render: (_value, row, rowIndex) => (
          <DeleteButton
            onClick={() => handleDelete(rowIndex)}
            tooltip={`Delete ${row.batch_number || 'batch'}`}
            itemName={row.batch_number || 'batch'}
            confirmDelete
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
