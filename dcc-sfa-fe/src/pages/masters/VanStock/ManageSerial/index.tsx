import { Close } from '@mui/icons-material';
import { Box, Dialog, Divider } from '@mui/material';
import type { FormikProps } from 'formik';
import type { ProductSerial } from 'hooks/useVanInventory';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { ActionButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import Input from 'shared/Input';
import Table, { type TableColumn } from 'shared/Table';
import type { VanInventoryFormValues } from '../ManageVanInventory';

interface ManageSerialProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedRowIndex: number | null;
  setSelectedRowIndex: (rowIndex: number | null) => void;
  formik: FormikProps<VanInventoryFormValues>;
  quantity: number | string | null;
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
  quantity = null,
}) => {
  const [productSerials, setProductSerials] = useState<ProductSerial[]>([]);

  useEffect(() => {
    if (!isOpen || selectedRowIndex === null) return;

    const inventoryItem = formik.values.van_inventory_items[selectedRowIndex];
    if (!inventoryItem) return;

    const rawSerials = (inventoryItem.product_serials || []) as ProductSerial[];
    const qty = Number(quantity);
    const desiredCount =
      Number.isFinite(qty) && qty > 0 ? qty : rawSerials.length;

    const normalizedSerials: ProductSerial[] = Array.from(
      { length: desiredCount },
      (_unused, index) => {
        const existing = rawSerials[index];
        return {
          ...INITIAL_SERIAL,
          ...(existing || {}),
          product_id: Number(inventoryItem.product_id || 0),
          quantity: 1,
          serial_number: existing?.serial_number || '',
        };
      }
    );

    setProductSerials(normalizedSerials);
  }, [isOpen, selectedRowIndex, formik.values.van_inventory_items, quantity]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setProductSerials([]);
    setSelectedRowIndex(null);
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

  const isFormValid = useMemo(() => {
    if (selectedRowIndex === null) return false;

    const expectedCount = Number(quantity);
    const hasExpectedCount =
      Number.isFinite(expectedCount) && expectedCount > 0;

    if (hasExpectedCount) {
      if (productSerials.length !== expectedCount) return false;
    } else {
      if (productSerials.length === 0) return false;
    }

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
  }, [selectedRowIndex, productSerials, quantity]);

  const handleSubmit = useCallback(() => {
    if (selectedRowIndex === null) return;

    const expectedCount = Number(quantity);
    if (Number.isFinite(expectedCount) && expectedCount > 0) {
      if (productSerials.length !== expectedCount) {
        toast.error(
          `Serial count (${productSerials.length}) must match item quantity (${expectedCount}).`
        );
        return;
      }
    }

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

    const updatedItems = [...formik.values.van_inventory_items];
    updatedItems[selectedRowIndex] = {
      ...updatedItems[selectedRowIndex],
      product_serials: productSerials.map(s => ({
        ...s,
        serial_number: (s.serial_number || '').trim(),
        quantity: 1,
      })),
    };
    formik.setFieldValue('van_inventory_items', updatedItems);
    handleClose();
  }, [selectedRowIndex, productSerials, formik, handleClose, quantity]);

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
          Serial Information ({quantity})
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

export default ManageSerial;
