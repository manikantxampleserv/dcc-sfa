import { Close } from '@mui/icons-material';
import { Box, Dialog, Divider } from '@mui/material';
import React from 'react';
import { toast } from 'react-toastify';
import type { ProductBatch, ProductSerial } from 'hooks/useVanInventory';
import { ActionButton, DeleteButton } from 'shared/ActionButton';
import Input from 'shared/Input';
import Button from 'shared/Button';
import Table, { type TableColumn } from 'shared/Table';
import type { OrderItemFormData } from './index';

interface ManageOrderSerialProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedRowIndex: number | null;
  setSelectedRowIndex: (rowIndex: number | null) => void;
  orderItems: OrderItemFormData[];
  setOrderItems: (items: OrderItemFormData[]) => void;
  quantity: number | string | null;
  inventoryByProductId?: Record<
    number,
    { batches: ProductBatch[]; serials: ProductSerial[] }
  >;
}

const INITIAL_SERIAL: ProductSerial = {
  serial_number: '',
  quantity: 1,
  product_id: 0,
};

const ManageOrderSerial: React.FC<ManageOrderSerialProps> = ({
  isOpen,
  setIsOpen,
  selectedRowIndex,
  setSelectedRowIndex,
  orderItems,
  setOrderItems,
  inventoryByProductId,
}) => {
  const [productSerials, setProductSerials] = React.useState<ProductSerial[]>(
    []
  );

  React.useEffect(() => {
    if (!isOpen || selectedRowIndex === null) return;

    const item = orderItems[selectedRowIndex];
    if (!item) return;

    let rawSerials = (item.product_serials || []) as ProductSerial[];

    if (
      rawSerials.length === 0 &&
      inventoryByProductId &&
      typeof item.product_id === 'number'
    ) {
      const inventoryEntry = inventoryByProductId[item.product_id];
      if (inventoryEntry && inventoryEntry.serials.length > 0) {
        rawSerials = inventoryEntry.serials;
      }
    }

    const normalizedSerials: ProductSerial[] =
      rawSerials.length > 0
        ? rawSerials.map(existing => ({
            ...INITIAL_SERIAL,
            ...(existing || {}),
            product_id: Number(item.product_id || 0),
            quantity: 1,
            serial_number: existing?.serial_number || '',
          }))
        : [
            {
              ...INITIAL_SERIAL,
              product_id: Number(item.product_id || 0),
            },
          ];

    setProductSerials(normalizedSerials);
  }, [isOpen, selectedRowIndex, orderItems, inventoryByProductId]);

  const handleClose = React.useCallback(() => {
    setIsOpen(false);
    setProductSerials([]);
    setSelectedRowIndex(null);
  }, [setIsOpen, setSelectedRowIndex]);

  const handleSerialChange = React.useCallback(
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

  const handleDeleteSerial = React.useCallback((rowIndex: number) => {
    setProductSerials(prev => prev.filter((_, index) => index !== rowIndex));
  }, []);

  const isFormValid = React.useMemo(() => {
    if (selectedRowIndex === null) return false;

    if (productSerials.length === 0) return false;

    const trimmedSerials = productSerials.map(s =>
      (s.serial_number || '').trim()
    );
    if (trimmedSerials.some(s => s.length === 0)) return false;

    const seen = new Set<string>();
    for (const s of trimmedSerials) {
      const key = s.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
    }

    return true;
  }, [selectedRowIndex, productSerials]);

  const handleSubmit = React.useCallback(() => {
    if (selectedRowIndex === null) return;

    const trimmedSerials = productSerials.map(s =>
      (s.serial_number || '').trim()
    );
    const missingIndex = trimmedSerials.findIndex(s => s.length === 0);
    if (missingIndex !== -1) {
      toast.error(`Serial number is required for row ${missingIndex + 1}.`);
      return;
    }

    const seen = new Set<string>();
    const duplicateIndex = trimmedSerials.findIndex(s => {
      const key = s.toLowerCase();
      if (seen.has(key)) return true;
      seen.add(key);
      return false;
    });
    if (duplicateIndex !== -1) {
      toast.error(
        `Duplicate serial number found: ${trimmedSerials[duplicateIndex]}`
      );
      return;
    }

    const newQuantity = productSerials.length;

    const updatedItems = [...orderItems];
    updatedItems[selectedRowIndex] = {
      ...updatedItems[selectedRowIndex],
      quantity: String(newQuantity),
      product_serials: productSerials.map(s => ({
        ...s,
        serial_number: (s.serial_number || '').trim(),
        quantity: 1,
      })),
    };
    setOrderItems(updatedItems);
    handleClose();
  }, [
    selectedRowIndex,
    productSerials,
    orderItems,
    setOrderItems,
    handleClose,
  ]);

  const columns: TableColumn<ProductSerial>[] = React.useMemo(
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
      {
        id: 'actions',
        label: 'Actions',
        render: (_value, row, rowIndex) => (
          <DeleteButton
            onClick={() => handleDeleteSerial(rowIndex)}
            tooltip={`Delete ${row.serial_number || 'serial'}`}
            itemName={row.serial_number || 'serial'}
            confirmDelete
          />
        ),
      },
    ],
    [handleSerialChange, handleDeleteSerial]
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
          Serial Information ({productSerials.length})
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
          data={productSerials}
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

export default ManageOrderSerial;
