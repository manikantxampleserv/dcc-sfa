import { Close } from '@mui/icons-material';
import { Box, Dialog, Divider, Checkbox } from '@mui/material';
import React from 'react';
import { toast } from 'react-toastify';
import type { ProductBatch, ProductSerial } from 'hooks/useVanInventory';
import { ActionButton } from 'shared/ActionButton';
import Button from 'shared/Button';
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
        ? rawSerials.map(existing => {
            const serial = existing as ProductSerial & { selected?: boolean };
            const isSelected = serial.selected === false ? false : true;
            return {
              ...INITIAL_SERIAL,
              ...(existing || {}),
              product_id: Number(item.product_id || 0),
              quantity: 1,
              serial_number: existing?.serial_number || '',
              selected: isSelected,
            };
          })
        : [
            {
              ...INITIAL_SERIAL,
              product_id: Number(item.product_id || 0),
              selected: true,
            },
          ];
    setProductSerials(normalizedSerials);
  }, [isOpen, selectedRowIndex, orderItems, inventoryByProductId]);

  const handleClose = React.useCallback(() => {
    setIsOpen(false);
    setProductSerials([]);
    setSelectedRowIndex(null);
  }, [setIsOpen, setSelectedRowIndex]);

  const handleToggleSelected = React.useCallback((rowIndex: number) => {
    setProductSerials(prev => {
      const updated = [...prev];
      const current = updated[rowIndex] as ProductSerial & {
        selected?: boolean;
      };
      (updated[rowIndex] as ProductSerial & { selected?: boolean }) = {
        ...current,
        selected: current.selected === false,
      };
      return updated;
    });
  }, []);

  const isFormValid = React.useMemo(() => {
    if (selectedRowIndex === null) return false;

    const selectedSerials = productSerials.filter(s => {
      const serial = s as ProductSerial & { selected?: boolean };
      return serial.selected !== false;
    });

    if (selectedSerials.length === 0) return false;

    const trimmedSerials = selectedSerials.map(s =>
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

    const selectedSerials = productSerials.filter(s => {
      const serial = s as ProductSerial & { selected?: boolean };
      return serial.selected !== false;
    });

    const trimmedSerials = selectedSerials.map(s =>
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

    const updatedItems = [...orderItems];
    updatedItems[selectedRowIndex] = {
      ...updatedItems[selectedRowIndex],
      quantity: String(selectedSerials.length),
      product_serials: productSerials.map(s => ({
        ...(s as ProductSerial & { selected?: boolean }),
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

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      slotProps={{
        paper: {
          className: '!min-w-[40%] !max-w-[40%]',
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
        <div className="max-h-[50vh] overflow-y-auto flex flex-col gap-2">
          {productSerials.map((row, rowIndex) => {
            const serial = row as ProductSerial & { selected?: boolean };
            return (
              <div
                key={`${row.serial_number}-${rowIndex}`}
                className="flex items-center justify-between border border-gray-200 rounded px-2 py-1"
              >
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={serial.selected !== false}
                    onChange={() => handleToggleSelected(rowIndex)}
                    size="small"
                  />
                  <span>{row.serial_number}</span>
                </div>
              </div>
            );
          })}
        </div>
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
