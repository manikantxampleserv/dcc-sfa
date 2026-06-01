import { Close } from '@mui/icons-material';
import { Box, Dialog, Divider, Checkbox } from '@mui/material';
import type {
  ProductBatch,
  ProductSerial,
} from 'services/masters/VanInventory';

// Extend ProductSerial to include selected property
type ProductSerialWithSelected = ProductSerial & {
  selected?: boolean;
};

const INITIAL_SERIAL: ProductSerial = {
  serial_number: '',
  quantity: 1,
  product_id: 0,
};

import React from 'react';
import { toast } from 'react-toastify';
import { ActionButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import type { InvoiceItemFormData } from './index';

interface ManageInvoiceSerialProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedRowIndex: number | null;
  setSelectedRowIndex: (rowIndex: number | null) => void;
  invoiceItems: InvoiceItemFormData[];
  setInvoiceItems: (items: InvoiceItemFormData[]) => void;
  inventoryByProductId?: Record<
    number,
    { batches: ProductBatch[]; serials: ProductSerial[] }
  >;
}

const ManageInvoiceSerial: React.FC<ManageInvoiceSerialProps> = ({
  isOpen,
  setIsOpen,
  selectedRowIndex,
  setSelectedRowIndex,
  invoiceItems,
  setInvoiceItems,
  inventoryByProductId,
}) => {
  const [productSerials, setProductSerials] = React.useState<
    ProductSerialWithSelected[]
  >([]);

  React.useEffect(() => {
    if (!isOpen || selectedRowIndex === null) return;
    const item = invoiceItems[selectedRowIndex];
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
    const normalizedSerials: ProductSerialWithSelected[] =
      rawSerials.length > 0
        ? rawSerials.map(existing => {
            const serial = existing as ProductSerialWithSelected;
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
  }, [isOpen, selectedRowIndex, invoiceItems, inventoryByProductId]);

  const handleClose = React.useCallback(() => {
    setIsOpen(false);
    setProductSerials([]);
    setSelectedRowIndex(null);
  }, [setIsOpen, setSelectedRowIndex]);

  const handleToggleSelected = React.useCallback((rowIndex: number) => {
    setProductSerials(prev => {
      const updated = [...prev];
      const current = updated[rowIndex] as ProductSerialWithSelected;
      updated[rowIndex] = {
        ...current,
        selected: current.selected === false,
      };
      return updated;
    });
  }, []);

  const isFormValid = React.useMemo(() => {
    if (selectedRowIndex === null) return false;

    const selectedSerials = productSerials.filter(s => {
      const serial = s as ProductSerialWithSelected;
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
      const serial = s as ProductSerialWithSelected;
      return serial.selected !== false;
    });

    if (selectedSerials.length === 0) {
      toast.error('At least one serial number must be selected.');
      return;
    }

    const updatedItems = [...invoiceItems];
    updatedItems[selectedRowIndex] = {
      ...updatedItems[selectedRowIndex],
      quantity: String(selectedSerials.length),
      product_serials: productSerials.map(s => ({
        ...s,
        serial_number: (s.serial_number || '').trim(),
        quantity: 1,
      })),
    };
    setInvoiceItems(updatedItems);
    handleClose();
  }, [
    selectedRowIndex,
    productSerials,
    invoiceItems,
    setInvoiceItems,
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
            const serial = row as ProductSerialWithSelected;
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
          {productSerials.length === 0 && (
            <Box className="!text-center !py-8 !text-gray-500">
              No serial numbers assigned to this item
            </Box>
          )}
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

export default ManageInvoiceSerial;
