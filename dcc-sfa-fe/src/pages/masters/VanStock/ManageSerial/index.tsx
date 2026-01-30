import { Close } from '@mui/icons-material';
import { Box, Dialog, Divider } from '@mui/material';
import type { FormikProps } from 'formik';
import type { ProductBatch, ProductSerial } from 'hooks/useVanInventory';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { ActionButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import Input from 'shared/Input';
import Table, { type TableColumn } from 'shared/Table';
import type { VanInventoryFormValues } from '../ManageVanInventory';

interface ExtendedProductSerial extends ProductSerial {
  selected?: boolean;
}

interface ManageSerialProps {
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
  inventoryByProductId,
  isUnloadType = false,
}) => {
  const [productSerials, setProductSerials] = useState<ExtendedProductSerial[]>(
    []
  );

  // Load serials when dialog opens or row changes
  useEffect(() => {
    if (!isOpen || selectedRowIndex === null) {
      return;
    }

    const item = formik.values.van_inventory_items[selectedRowIndex];
    if (!item) {
      setProductSerials([]);
      return;
    }

    let rawSerials = (item.product_serials || []) as ExtendedProductSerial[];

    // For Unload type, initialize with available inventory serials if no serials exist
    if (
      rawSerials.length === 0 &&
      isUnloadType &&
      inventoryByProductId &&
      typeof item.product_id === 'number'
    ) {
      const inventoryEntry = inventoryByProductId[item.product_id];
      if (inventoryEntry && inventoryEntry.serials.length > 0) {
        rawSerials = inventoryEntry.serials.map(serial => ({
          ...serial,
          selected: false,
        }));
      }
    }

    if (isUnloadType) {
      // For unload, show all available serials with selection state
      console.log('ManageSerial - Loading unload serials:', rawSerials);
      setProductSerials(rawSerials);
    } else {
      // For load, prioritize existing serials count over quantity for edit mode
      const existingSerialsCount = rawSerials.length;
      const qty = Number(quantity);

      // If we have existing serials (edit mode), use their count
      // Otherwise, create new serials based on quantity
      const desiredCount =
        existingSerialsCount > 0
          ? existingSerialsCount
          : Number.isFinite(qty) && qty > 0
            ? qty
            : 0;

      const normalizedSerials: ExtendedProductSerial[] = Array.from(
        { length: desiredCount },
        (_unused, index) => {
          const existing = rawSerials[index];
          return {
            ...INITIAL_SERIAL,
            ...(existing || {}),
            product_id: Number(item.product_id || 0),
            quantity: 1,
            serial_number: existing?.serial_number || '',
          };
        }
      );

      console.log('ManageSerial - Loading load serials:', {
        desiredCount,
        existingSerialsCount,
        quantity: qty,
        normalizedSerials,
      });
      setProductSerials(normalizedSerials);
    }
  }, [isOpen, selectedRowIndex]); // FIXED: Removed dependencies that cause loops

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setProductSerials([]);
    setSelectedRowIndex(null);
  }, [setIsOpen, setSelectedRowIndex]);

  const handleSerialChange = useCallback(
    (
      field: keyof ProductSerial | 'selected',
      rowIndex: number,
      value: string | number | boolean
    ) => {
      setProductSerials(prev => {
        const updated = [...prev];
        if (field === 'selected' && isUnloadType) {
          updated[rowIndex].selected = Boolean(value);
        } else if (field !== 'selected') {
          updated[rowIndex] = {
            ...updated[rowIndex],
            [field]: field === 'quantity' ? Number(value) || 0 : value,
          };
        }
        return updated;
      });
    },
    [isUnloadType]
  );

  const isFormValid = useMemo(() => {
    if (selectedRowIndex === null) return false;

    if (isUnloadType) {
      const selectedSerials = productSerials.filter(s => s.selected);
      return selectedSerials.length > 0;
    }

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
  }, [selectedRowIndex, productSerials, quantity, isUnloadType]);

  const handleSubmit = useCallback(() => {
    if (selectedRowIndex === null) return;

    if (isUnloadType) {
      const selectedSerials = productSerials.filter(s => s.selected);

      if (selectedSerials.length === 0) {
        toast.error('Please select at least one serial number.');
        return;
      }

      console.log('ManageSerial - Saving unload serials:', {
        selectedRowIndex,
        selectedCount: selectedSerials.length,
        serials: selectedSerials,
      });

      const updatedItems = [...formik.values.van_inventory_items];
      updatedItems[selectedRowIndex] = {
        ...updatedItems[selectedRowIndex],
        quantity: selectedSerials.length,
        product_serials: selectedSerials.map(s => ({
          ...s,
          serial_number: (s.serial_number || '').trim(),
          quantity: 1,
          selected: true,
        })),
      };
      formik.setFieldValue('van_inventory_items', updatedItems);
      handleClose();
      return;
    }

    // Original load logic
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

    console.log('ManageSerial - Saving load serials:', {
      selectedRowIndex,
      serials: productSerials,
    });

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
  }, [
    selectedRowIndex,
    productSerials,
    formik,
    handleClose,
    quantity,
    isUnloadType,
  ]);

  const columns: TableColumn<ExtendedProductSerial>[] = useMemo(() => {
    const baseColumns: TableColumn<ExtendedProductSerial>[] = [];

    if (isUnloadType) {
      baseColumns.push({
        id: 'selected',
        label: 'Select',
        width: 80,
        render: (_value, row, rowIndex) => (
          <input
            type="checkbox"
            checked={row.selected || false}
            onChange={e =>
              handleSerialChange('selected', rowIndex, e.target.checked)
            }
            className="w-4 h-4"
          />
        ),
      });
    }

    baseColumns.push({
      id: 'serial_number',
      label: 'Serial Number',
      render: (_value, row, rowIndex) =>
        isUnloadType ? (
          <span className="text-gray-900">{row.serial_number}</span>
        ) : (
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
    });

    baseColumns.push({
      id: 'quantity',
      label: 'Quantity',
      render: (_value, row) => (
        <Input
          type="number"
          value={row.quantity}
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
    });

    return baseColumns;
  }, [handleSerialChange, isUnloadType]);

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
          {isUnloadType
            ? 'Select Serials to Unload'
            : `Serial Information (${quantity})`}
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
