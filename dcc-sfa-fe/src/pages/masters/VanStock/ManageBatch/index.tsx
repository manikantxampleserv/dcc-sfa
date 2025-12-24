import { Close } from '@mui/icons-material';
import { Box, Dialog, Divider } from '@mui/material';
import type { FormikProps } from 'formik';
import type { ProductBatch } from 'hooks/useVanInventory';
import { Plus } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { ActionButton, DeleteButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import Input from 'shared/Input';
import SearchInput from 'shared/SearchInput';
import Table, { type TableColumn } from 'shared/Table';
import type { VanInventoryFormValues } from '../ManageVanInventory';

interface ManageBatchProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedRowIndex: number | null;
  setSelectedRowIndex: (rowIndex: number | null) => void;
  formik: FormikProps<VanInventoryFormValues>;
  quantity: number | string | null;
}

const INITIAL_BATCH: ProductBatch = {
  batch_number: '',
  lot_number: '',
  manufacturing_date: '',
  expiry_date: '',
  quantity: 1,
};

const ManageBatch: React.FC<ManageBatchProps> = ({
  isOpen,
  setIsOpen,
  selectedRowIndex,
  setSelectedRowIndex,
  formik,
  quantity = null,
}) => {
  const [productBatches, setProductBatches] = useState<ProductBatch[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (
      selectedRowIndex !== null &&
      formik.values.van_inventory_items[selectedRowIndex]
    ) {
      setProductBatches(
        formik.values.van_inventory_items[selectedRowIndex]
          .product_batches as ProductBatch[]
      );
    }
  }, [selectedRowIndex, formik.values.van_inventory_items]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setProductBatches([]);
    setSelectedRowIndex(null);
    setSearchQuery('');
  }, [setIsOpen, setSelectedRowIndex]);

  const handleDelete = useCallback((rowIndex: number) => {
    setProductBatches(prev => prev.filter((_, index) => index !== rowIndex));
  }, []);

  const handleBatchChange = useCallback(
    (field: keyof ProductBatch, rowIndex: number, value: string | number) => {
      setProductBatches(prev => {
        const updated = [...prev];

        if (field === 'quantity') {
          const mainItemQuantity = Number(quantity);
          const hasExpectedQty =
            Number.isFinite(mainItemQuantity) && mainItemQuantity > 0;
          const otherQty = updated.reduce((sum, batch, index) => {
            if (index === rowIndex) return sum;
            return sum + (Number(batch.quantity) || 0);
          }, 0);
          const maxAllowed = hasExpectedQty
            ? Math.max(0, mainItemQuantity - otherQty)
            : Number.POSITIVE_INFINITY;
          const raw = Number(value);
          const normalized = Number.isFinite(raw) ? raw : 0;
          const nextQty = Math.min(Math.max(0, normalized), maxAllowed);
          updated[rowIndex] = {
            ...updated[rowIndex],
            quantity: nextQty,
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
    [quantity]
  );

  const handleAddBatch = useCallback(() => {
    setProductBatches(prev => [...prev, { ...INITIAL_BATCH }]);
  }, []);

  const handleSubmit = useCallback(() => {
    if (selectedRowIndex === null) return;

    const mainItemQuantity = Number(quantity);
    const expectedQty =
      Number.isFinite(mainItemQuantity) && mainItemQuantity > 0;
    const totalQty = productBatches.reduce(
      (sum, b) => sum + (Number(b.quantity) || 0),
      0
    );

    if (expectedQty && totalQty > mainItemQuantity) {
      toast.error(
        `Total batch quantity (${totalQty}) cannot exceed item quantity (${mainItemQuantity})`
      );
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
      const key = `${(b.batch_number || '').trim().toLowerCase()}|${(b.lot_number || '').trim().toLowerCase()}`;
      if (seen.has(key)) return true;
      seen.add(key);
      return false;
    });

    if (duplicateIndex !== -1) {
      toast.error(`Duplicate batch entry found at row ${duplicateIndex + 1}.`);
      return;
    }

    const updatedItems = [...formik.values.van_inventory_items];
    updatedItems[selectedRowIndex] = {
      ...updatedItems[selectedRowIndex],
      product_batches: productBatches.map(b => ({
        ...b,
        batch_number: (b.batch_number || '').trim(),
        lot_number: (b.lot_number || '').trim(),
        quantity: Number(b.quantity) || 0,
        manufacturing_date: (b.manufacturing_date || '').trim(),
        expiry_date: (b.expiry_date || '').trim(),
      })),
    };
    formik.setFieldValue('van_inventory_items', updatedItems);
    handleClose();
  }, [selectedRowIndex, productBatches, formik, handleClose, quantity]);

  const filteredBatches = useMemo(() => {
    if (!searchQuery.trim()) return productBatches;
    const query = searchQuery.toLowerCase();
    return productBatches?.filter(
      batch =>
        batch.batch_number?.toLowerCase().includes(query) ||
        batch.lot_number?.toLowerCase().includes(query)
    );
  }, [productBatches, searchQuery]);

  const isFormValid = useMemo(() => {
    if (selectedRowIndex === null) return false;

    const mainItemQuantity = Number(quantity);
    const hasExpectedQty =
      Number.isFinite(mainItemQuantity) && mainItemQuantity > 0;

    const totalQty = productBatches.reduce(
      (sum, b) => sum + (Number(b.quantity) || 0),
      0
    );

    if (hasExpectedQty) {
      if (totalQty !== mainItemQuantity) return false;
    } else {
      if (productBatches.length === 0) return false;
    }

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
      const key = `${(b.batch_number || '').trim().toLowerCase()}|${(b.lot_number || '').trim().toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
    }

    return true;
  }, [selectedRowIndex, productBatches, quantity]);

  const columns: TableColumn<ProductBatch>[] = useMemo(
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
            onChange={e =>
              handleBatchChange('quantity', rowIndex, e.target.value)
            }
            size="small"
            className="!w-32"
            placeholder="Enter quantity"
            fullWidth
            inputProps={{ min: 0 }}
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
          Batch Information ({quantity})
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
        <div className="flex justify-between items-center pb-2">
          <SearchInput
            placeholder="Search Batch"
            value={searchQuery}
            onChange={e => setSearchQuery(e)}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<Plus size={16} />}
            onClick={handleAddBatch}
          >
            Add Batch
          </Button>
        </div>
        <Table
          stickyHeader
          maxHeight="50vh"
          columns={columns}
          data={filteredBatches}
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

export default ManageBatch;
