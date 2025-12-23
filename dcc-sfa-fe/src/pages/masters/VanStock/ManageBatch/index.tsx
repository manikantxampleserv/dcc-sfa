import { Close } from '@mui/icons-material';
import { Box, Dialog, Divider, Typography } from '@mui/material';
import type { FormikProps } from 'formik';
import { Plus } from 'lucide-react';
import React from 'react';
import { ActionButton, DeleteButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import Input from 'shared/Input';
import SearchInput from 'shared/SearchInput';
import Table, { type TableColumn } from 'shared/Table';
import type { SelectedItem } from '../ManageVanInventory';

interface ManageBatchProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedItem: SelectedItem | null;
  setSelectedItem: (item: SelectedItem | null) => void;
  formik: FormikProps<any>;
}
interface ProductBatch {
  batch_number: string;
  lot_number: string;
  manufacturing_date: string;
  expiry_date: string;
  quantity: number;
}

const ManageBatch: React.FC<ManageBatchProps> = ({
  isOpen,
  setIsOpen,
  selectedItem,
  setSelectedItem,
  formik,
}) => {
  const [productBatches, setProductBatches] = React.useState<ProductBatch[]>(
    []
  );
  const handleClose = () => {
    setIsOpen(false);
  };
  const handleDelete = (rowIndex: number) => {
    const updatedProductBatches = productBatches.filter(
      (_, index) => index !== rowIndex
    );
    setProductBatches(updatedProductBatches);
  };

  const handleBatchChange = (
    field: string,
    rowIndex: number,
    value: string
  ) => {
    const updatedProductBatches = [...productBatches];
    updatedProductBatches[rowIndex] = {
      ...updatedProductBatches[rowIndex],
      [field]: value,
    };
    setProductBatches(updatedProductBatches);
  };
  const handleAddBatch = () => {
    const newBatch: ProductBatch = {
      batch_number: '',
      lot_number: '',
      manufacturing_date: '',
      expiry_date: '',
      quantity: 1,
    };
    setProductBatches([...productBatches, newBatch]);
  };

  console.log(productBatches);
  const columns: TableColumn<ProductBatch>[] = [
    {
      id: 'batch_number',
      label: 'Batch Number',
      render: (value, row, rowIndex) => (
        <Input
          value={row.batch_number}
          onChange={e =>
            handleBatchChange('batch_number', rowIndex, e.target.value)
          }
          size="small"
          placeholder="Enter batch number"
          fullWidth
        />
      ),
    },

    {
      id: 'manufacturing_date',
      label: 'MFG Date',
      render: (value, row, rowIndex) => (
        <Typography variant="body2" className="!text-gray-700">
          <Input
            type="date"
            value={row.manufacturing_date}
            className="!w-42"
            onChange={e =>
              handleBatchChange('manufacturing_date', rowIndex, e.target.value)
            }
            size="small"
            placeholder="Enter manufacturing date"
          />
        </Typography>
      ),
    },
    {
      id: 'expiry_date',
      label: 'EXP Date',
      render: (value, row, rowIndex) => (
        <Typography variant="body2" className="!text-gray-700">
          <Input
            type="date"
            value={row.expiry_date}
            onChange={e =>
              handleBatchChange('expiry_date', rowIndex, e.target.value)
            }
            size="small"
            placeholder="Enter expiry date"
            className="!w-42"
          />
        </Typography>
      ),
    },
    {
      id: 'quantity',
      label: 'Quantity',
      render: (value, row, rowIndex) => (
        <Input
          type="number"
          value={row.quantity}
          onChange={e =>
            handleBatchChange('quantity', rowIndex, e.target.value)
          }
          size="small"
          placeholder="Enter quantity"
          fullWidth
        />
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      render: (value, row, rowIndex) => (
        <DeleteButton
          onClick={() => handleDelete(rowIndex)}
          tooltip={`Delete ${row?.batch_number ?? ''}`}
          itemName={row?.batch_number ?? ''}
          confirmDelete={true}
          size="small"
        />
      ),
    },
  ];
  const data: ProductBatch[] = [
    {
      quantity: 100,
      batch_number: '123456',
      lot_number: '123456',
      manufacturing_date: '2021-01-01',
      expiry_date: '2021-01-01',
    },
  ];
  return (
    <>
      <Dialog
        open={isOpen}
        onClose={handleClose}
        slotProps={{
          paper: {
            className: '!min-w-[60%] !max-w-[60%] !h-[60%]',
          },
        }}
      >
        <div className="flex justify-between items-center !p-2">
          <p className="!font-semibold text-lg !text-gray-900">Manage Batch</p>
          <ActionButton icon={<Close />} onClick={handleClose} size="small" />
        </div>
        <Divider />
        <Box className="!p-2">
          <div className="flex justify-between items-center pb-2">
            <SearchInput placeholder="Search Batch" />
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<Plus size={16} />}
              onClick={handleAddBatch}
            >
              Add Batch
            </Button>
          </div>
          <Table
            columns={columns}
            data={productBatches}
            compact
            pagination={false}
            sortable={false}
          />
        </Box>
      </Dialog>
    </>
  );
};

export default ManageBatch;
