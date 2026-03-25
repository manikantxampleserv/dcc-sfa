import { Close } from '@mui/icons-material';
import { Box, Dialog, Divider, Checkbox } from '@mui/material';
import React from 'react';
import { toast } from 'react-toastify';
import type { ProductSerial } from 'hooks/useVanInventory';
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
}

const ManageInvoiceSerial: React.FC<ManageInvoiceSerialProps> = ({
  isOpen,
  setIsOpen,
  selectedRowIndex,
  setSelectedRowIndex,
  invoiceItems,
  setInvoiceItems,
}) => {
  const [productSerials, setProductSerials] = React.useState<ProductSerial[]>([]);

  React.useEffect(() => {
    if (!isOpen || selectedRowIndex === null) return;
    const item = invoiceItems[selectedRowIndex];
    if (!item) return;

    const existing = (item.product_serials || []) as ProductSerial[];
    setProductSerials(existing.map(s => ({ ...s, selected: (s as any).selected !== false })));
  }, [isOpen, selectedRowIndex, invoiceItems]);

  const handleClose = React.useCallback(() => {
    setIsOpen(false);
    setProductSerials([]);
    setSelectedRowIndex(null);
  }, [setIsOpen, setSelectedRowIndex]);

  const handleToggleSelected = React.useCallback((rowIndex: number) => {
    setProductSerials(prev => {
      const updated = [...prev];
      const current = updated[rowIndex] as ProductSerial & { selected?: boolean };
      updated[rowIndex] = {
        ...current,
        selected: current.selected === false,
      };
      return updated;
    });
  }, []);

  const handleSubmit = React.useCallback(() => {
    if (selectedRowIndex === null) return;

    const selectedSerials = productSerials.filter(s => (s as any).selected !== false);

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
  }, [selectedRowIndex, productSerials, invoiceItems, setInvoiceItems, handleClose]);

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
        >
          Update
        </Button>
      </Box>
    </Dialog>
  );
};

export default ManageInvoiceSerial;
