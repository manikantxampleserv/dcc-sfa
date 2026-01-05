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
import { formatDate } from 'utils/dateUtils';

interface ManageBatchProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedRowIndex: number | null;
  setSelectedRowIndex: (rowIndex: number | null) => void;
  formik: FormikProps<VanInventoryFormValues>;
  quantity: number | string | null;
  inventoryByProductId?: Record<
    number,
    {
      batches: ProductBatch[];
      serials: {
        id?: number;
        product_id: number;
        serial_number: string;
        quantity: number;
        selected?: boolean;
      }[];
    }
  >;
  isUnloadType?: boolean;
}

const INITIAL_BATCH: ProductBatch = {
  remaining_quantity: 0,
  batch_number: '',
  lot_number: '',
  manufacturing_date: '',
  expiry_date: '',
  quantity: null,
};

const ManageBatch: React.FC<ManageBatchProps> = ({
  isOpen,
  setIsOpen,
  selectedRowIndex,
  setSelectedRowIndex,
  formik,
  quantity = null,
  inventoryByProductId,
  isUnloadType = false,
}) => {
  const [productBatches, setProductBatches] = useState<ProductBatch[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (selectedRowIndex === null) {
      return;
    }

    const item = formik.values.van_inventory_items[selectedRowIndex];
    if (!item) {
      setProductBatches([]);
      return;
    }

    const existing = (item.product_batches as ProductBatch[] | undefined) || [];

    if (existing.length > 0) {
      setProductBatches(existing);
      return;
    }

    // For Unload type, initialize with available inventory batches
    if (
      isUnloadType &&
      item.product_id &&
      inventoryByProductId &&
      inventoryByProductId[item.product_id] &&
      inventoryByProductId[item.product_id].batches.length > 0
    ) {
      const initialBatches = inventoryByProductId[item.product_id].batches.map(
        batch => ({
          ...batch,
          quantity: 0,
        })
      );
      setProductBatches(initialBatches);
      return;
    }

    setProductBatches([]);
  }, [
    selectedRowIndex,
    formik.values.van_inventory_items,
    inventoryByProductId,
    isUnloadType,
  ]);

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

          // For Unload type, also check against available inventory
          const batchMax =
            isUnloadType && updated[rowIndex].batch_remaining_quantity
              ? Number(updated[rowIndex].batch_remaining_quantity)
              : Number.POSITIVE_INFINITY;

          const nextQty = Math.min(
            Math.max(0, normalized),
            maxAllowed,
            batchMax
          );
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
    [quantity, isUnloadType]
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

    const mappedBatches = productBatches.map(b => ({
      ...b,
      batch_number: (b.batch_number || '').trim(),
      lot_number: (b.lot_number || '').trim(),
      quantity: Number(b.quantity) || 0,
      manufacturing_date: (b.manufacturing_date || '').trim(),
      expiry_date: (b.expiry_date || '').trim(),
    }));

    console.log('ManageBatch - Saving batch data:', {
      selectedRowIndex,
      isUnloadType,
      productBatches,
      mappedBatches,
    });

    const updatedItems = [...formik.values.van_inventory_items];
    updatedItems[selectedRowIndex] = {
      ...updatedItems[selectedRowIndex],
      quantity: isUnloadType
        ? totalQty
        : updatedItems[selectedRowIndex].quantity,
      product_batches: mappedBatches,
    };

    console.log('ManageBatch - Before formik.setFieldValue:');
    console.log('- selectedRowIndex:', selectedRowIndex);
    console.log('- mappedBatches:', mappedBatches);
    console.log('- Updated item:', updatedItems[selectedRowIndex]);
    console.log('- Current formik items:', formik.values.van_inventory_items);

    formik.setFieldValue('van_inventory_items', updatedItems);

    setTimeout(() => {
      console.log('ManageBatch - After formik.setFieldValue:');
      console.log(
        '- Formik items count:',
        formik.values.van_inventory_items.length
      );
      console.log(
        '- Specific item product_batches:',
        formik.values.van_inventory_items[selectedRowIndex]?.product_batches
      );
      console.log(
        '- Full item:',
        formik.values.van_inventory_items[selectedRowIndex]
      );
    }, 100);

    handleClose();
  }, [
    selectedRowIndex,
    productBatches,
    formik,
    handleClose,
    quantity,
    isUnloadType,
  ]);

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
        render: (_value, row, rowIndex) =>
          isUnloadType ? (
            <span className="text-gray-900">{row.batch_number}</span>
          ) : (
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
        render: (_value, row, rowIndex) =>
          isUnloadType ? (
            <span className="text-gray-900">
              {formatDate(row.manufacturing_date)}
            </span>
          ) : (
            <Input
              type="date"
              value={row.manufacturing_date}
              onChange={e =>
                handleBatchChange(
                  'manufacturing_date',
                  rowIndex,
                  e.target.value
                )
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
        render: (_value, row, rowIndex) =>
          isUnloadType ? (
            <span className="text-gray-900">{formatDate(row.expiry_date)}</span>
          ) : (
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
        id: 'available_quantity',
        label: 'Available',
        render: (_value, row) =>
          isUnloadType ? (
            <span className="text-gray-600">
              {row.batch_remaining_quantity || 0}
            </span>
          ) : null,
      },
      {
        id: 'quantity',
        label: isUnloadType ? 'Unload Quantity' : 'Quantity',
        render: (_value, row, rowIndex) => (
          <Input
            type="number"
            value={row.quantity}
            onChange={e =>
              handleBatchChange('quantity', rowIndex, e.target.value)
            }
            size="small"
            className="!w-32"
            placeholder={
              isUnloadType ? 'Enter unload quantity' : 'Enter quantity'
            }
            fullWidth
            inputProps={{
              min: 0,
              max: isUnloadType
                ? row.batch_remaining_quantity || undefined
                : undefined,
            }}
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
    [handleBatchChange, handleDelete, isUnloadType]
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
          {!isUnloadType && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<Plus size={16} />}
              onClick={handleAddBatch}
            >
              Add Batch
            </Button>
          )}
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
