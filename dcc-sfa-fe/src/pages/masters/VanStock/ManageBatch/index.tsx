import { Close } from '@mui/icons-material';
import { Box, Dialog, Divider } from '@mui/material';
import type { FormikProps } from 'formik';
import { Plus } from 'lucide-react';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { ActionButton, DeleteButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import Input from 'shared/Input';
import SearchInput from 'shared/SearchInput';
import Table, { type TableColumn } from 'shared/Table';
import type { VanInventoryFormValues } from '../ManageVanInventory';
import type { ProductBatch } from 'hooks/useVanInventory';

interface ManageBatchProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedRowIndex: number | null;
  setSelectedRowIndex: (rowIndex: number | null) => void;
  formik: FormikProps<VanInventoryFormValues>;
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
        updated[rowIndex] = {
          ...updated[rowIndex],
          [field]: field === 'quantity' ? Number(value) || 0 : value,
        };
        return updated;
      });
    },
    []
  );

  const handleAddBatch = useCallback(() => {
    setProductBatches(prev => [...prev, { ...INITIAL_BATCH }]);
  }, []);

  const handleSubmit = useCallback(() => {
    if (selectedRowIndex === null) return;

    const updatedItems = [...formik.values.van_inventory_items];
    updatedItems[selectedRowIndex] = {
      ...updatedItems[selectedRowIndex],
      product_batches: productBatches,
    };
    formik.setFieldValue('van_inventory_items', updatedItems);
    handleClose();
  }, [selectedRowIndex, productBatches, formik, handleClose]);

  const filteredBatches = useMemo(() => {
    if (!searchQuery.trim()) return productBatches;
    const query = searchQuery.toLowerCase();
    return productBatches?.filter(
      batch =>
        batch.batch_number?.toLowerCase().includes(query) ||
        batch.lot_number?.toLowerCase().includes(query)
    );
  }, [productBatches, searchQuery]);

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
          Batch Information
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
          disabled={selectedRowIndex === null}
        >
          Update
        </Button>
      </Box>
    </Dialog>
  );
};

export default ManageBatch;
