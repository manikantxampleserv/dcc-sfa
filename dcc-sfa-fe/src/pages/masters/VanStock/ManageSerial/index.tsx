import { Close } from '@mui/icons-material';
import { Box, Dialog, Divider } from '@mui/material';
import type { FormikProps } from 'formik';
import { Plus } from 'lucide-react';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { ActionButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import Input from 'shared/Input';
import SearchInput from 'shared/SearchInput';
import Table, { type TableColumn } from 'shared/Table';
import type { VanInventoryFormValues } from '../ManageVanInventory';
import type { ProductSerial } from 'hooks/useVanInventory';

interface ManageSerialProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedRowIndex: number | null;
  setSelectedRowIndex: (rowIndex: number | null) => void;
  formik: FormikProps<VanInventoryFormValues>;
}

const INITIAL_SERIAL: ProductSerial = {
  serial_number: '',
  quantity: 1,
  product_id: 0,
};

const ManageSerial: React.FC<ManageSerialProps> = ({
  isOpen,
  setIsOpen,
  selectedRowIndex,
  setSelectedRowIndex,
  formik,
}) => {
  const [productSerials, setProductSerials] = useState<ProductSerial[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (
      selectedRowIndex !== null &&
      formik.values.van_inventory_items[selectedRowIndex]
    ) {
      setProductSerials(
        formik.values.van_inventory_items[selectedRowIndex]
          .product_serials as ProductSerial[]
      );
    }
  }, [selectedRowIndex, formik.values.van_inventory_items]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setProductSerials([]);
    setSelectedRowIndex(null);
    setSearchQuery('');
  }, [setIsOpen, setSelectedRowIndex]);

  const handleSerialChange = useCallback(
    (field: keyof ProductSerial, rowIndex: number, value: string | number) => {
      setProductSerials(prev => {
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

  const handleAddSerial = useCallback(() => {
    setProductSerials(prev => [...prev, { ...INITIAL_SERIAL }]);
  }, []);

  const handleSubmit = useCallback(() => {
    if (selectedRowIndex === null) return;

    const updatedItems = [...formik.values.van_inventory_items];
    updatedItems[selectedRowIndex] = {
      ...updatedItems[selectedRowIndex],
      product_serials: productSerials,
    };
    formik.setFieldValue('van_inventory_items', updatedItems);
    handleClose();
  }, [selectedRowIndex, productSerials, formik, handleClose]);

  const filteredSerials = useMemo(() => {
    if (!searchQuery.trim()) return productSerials;
    const query = searchQuery.toLowerCase();
    return productSerials?.filter(serial =>
      serial.serial_number?.toLowerCase().includes(query)
    );
  }, [productSerials, searchQuery]);

  const columns: TableColumn<ProductSerial>[] = useMemo(
    () => [
      {
        id: 'serial_number',
        label: 'Serial Number',
        render: (_value, row, rowIndex) => (
          <Input
            value={row.serial_number}
            onChange={e =>
              handleSerialChange('serial_number', rowIndex, e.target.value)
            }
            size="small"
            placeholder="Enter serial number"
            fullWidth
          />
        ),
      },
      {
        id: 'quantity',
        label: 'Quantity',
        render: (_value, _row, _rowIndex) => (
          <Input
            type="number"
            value={_row.quantity}
            disabled
            size="small"
            placeholder="1"
            fullWidth
            slotProps={{
              input: {
                inputProps: { min: 1, max: 1 },
              },
            }}
          />
        ),
      },
    ],
    [handleSerialChange]
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
          Serial Information
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
            placeholder="Search Serial"
            value={searchQuery}
            onChange={e => setSearchQuery(e)}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<Plus size={16} />}
            onClick={handleAddSerial}
          >
            Add Serial
          </Button>
        </div>
        <Table
          stickyHeader
          maxHeight="50vh"
          columns={columns}
          data={filteredSerials}
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

export default ManageSerial;
