import { Box, MenuItem, Skeleton, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useInvoice } from 'hooks/useInvoices';
import { useProducts } from 'hooks/useProducts';
import {
  useInvoiceItems,
  useBulkUpdateInvoiceItems,
  useDeleteInvoiceItem,
} from 'hooks/useInvoiceItems';
import { Package, Plus } from 'lucide-react';
import React, { useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import ProductSelect from 'shared/ProductSelect';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import * as Yup from 'yup';
import { toast } from 'react-toastify';

interface InvoiceItemsManagementProps {
  open: boolean;
  onClose: () => void;
  invoiceId: number;
}

interface InvoiceItemFormData {
  id?: number;
  product_id: number | '';
  product_name?: string;
  unit?: string;
  quantity: string;
  unit_price: string;
  discount_amount: string;
  tax_amount: string;
  total_amount?: string;
  notes: string;
  product_code?: string;
}
const validationSchema = Yup.object({
  product_id: Yup.number()
    .required('Product is required')
    .min(1, 'Please select a valid product'),
  quantity: Yup.number()
    .required('Quantity is required')
    .min(0.01, 'Quantity must be greater than 0')
    .max(999999, 'Quantity is too large'),
  unit_price: Yup.number()
    .required('Unit price is required')
    .min(0.01, 'Unit price must be greater than 0')
    .max(999999999, 'Unit price is too large'),
  discount_amount: Yup.number()
    .min(0, 'Discount cannot be negative')
    .max(999999999, 'Discount amount is too large'),
  tax_amount: Yup.number()
    .min(0, 'Tax cannot be negative')
    .max(999999999, 'Tax amount is too large'),
  notes: Yup.string().max(500, 'Notes cannot exceed 500 characters'),
});

const InvoiceItemsManagement: React.FC<InvoiceItemsManagementProps> = ({
  open,
  onClose,
  invoiceId,
}) => {
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItemFormData[]>([]);
  const [editingItem, setEditingItem] = useState<InvoiceItemFormData | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);

  const { data: productsResponse, isLoading: productsLoading } = useProducts({
    limit: 1000,
  });
  const { data: invoiceResponse, isLoading: invoiceLoading } =
    useInvoice(invoiceId);
  const { data: invoiceItemsResponse, isLoading: itemsLoading } =
    useInvoiceItems(invoiceId, {
      enabled: open && !!invoiceId, // Only fetch when Items Management drawer is open
    });

  const products = productsResponse?.data || [];
  const invoice = invoiceResponse?.data;
  const existingItems = invoiceItemsResponse?.data || [];
  const isLoading = productsLoading || invoiceLoading || itemsLoading;

  const bulkUpdateItemsMutation = useBulkUpdateInvoiceItems();
  const deleteItemMutation = useDeleteInvoiceItem();

  React.useEffect(() => {
    if (existingItems && existingItems.length > 0) {
      const items = existingItems.map(item => {
        const quantity = Number(item.quantity);
        const unitPrice = Number(item.unit_price);
        const discountAmount = Number(item.discount_amount || 0);
        const taxAmount = Number(item.tax_amount || 0);
        const calculatedTotal =
          quantity * unitPrice - discountAmount + taxAmount;

        const itemWithProducts = item as any;

        return {
          id: item.id,
          product_id: item.product_id,
          product_name:
            itemWithProducts.invoice_items_products?.name ||
            item.product_name ||
            '',
          unit:
            itemWithProducts.invoice_items_products?.product_unit_of_measurement
              ?.name ||
            itemWithProducts.invoice_items_products?.product_unit_of_measurement
              ?.symbol ||
            itemWithProducts.invoice_items_products?.unit_of_measurement?.toString() ||
            item.unit ||
            'pcs',
          quantity: item.quantity.toString(),
          unit_price: item.unit_price.toString(),
          discount_amount: (item.discount_amount || 0).toString(),
          tax_amount: (item.tax_amount || 0).toString(),
          total_amount:
            item.total_amount?.toString() || calculatedTotal.toString(),
          notes: item.notes || '',
          product_code: itemWithProducts.invoice_items_products?.code || '',
        };
      });
      setInvoiceItems(items);
    } else {
      setInvoiceItems([]);
    }
  }, [existingItems, invoiceId]);

  React.useEffect(() => {
    if (open) {
      setIsEditing(false);
      setEditingItem(null);
      formik.resetForm();
    }
  }, [open, invoiceId]);

  const formik = useFormik({
    initialValues: {
      product_id: '',
      quantity: '1',
      unit_price: '0',
      discount_amount: '0',
      tax_amount: '0',
      notes: '',
    },
    validationSchema,
    onSubmit: async values => {
      try {
        const selectedProduct = products.find(
          p => p.id === Number(values.product_id)
        );

        if (!selectedProduct) {
          toast.error('Selected product not found');
          return;
        }

        const newItem: InvoiceItemFormData = {
          ...values,
          product_name: selectedProduct.name,
          unit: selectedProduct.product_unit?.name?.toString() || 'pcs',
          product_code: selectedProduct.code,
          product_id: Number(values.product_id),
          total_amount: (
            Number(values.quantity) * Number(values.unit_price) -
            Number(values.discount_amount) +
            Number(values.tax_amount)
          ).toString(),
        };

        if (isEditing && editingItem) {
          const updatedItems = invoiceItems.map(item =>
            item.id === editingItem.id
              ? { ...newItem, id: editingItem.id }
              : item
          );
          setInvoiceItems(updatedItems);
          setIsEditing(false);
          setEditingItem(null);
        } else {
          const newItemWithId = {
            ...newItem,
            id: Date.now(),
          };
          setInvoiceItems([...invoiceItems, newItemWithId]);
        }

        formik.resetForm();
      } catch (error) {
        console.error('Error managing invoice item:', error);
      }
    },
  });

  const handleEditItem = (item: InvoiceItemFormData) => {
    setEditingItem(item);
    setIsEditing(true);
    formik.setValues({
      product_id: item.product_id.toString(),
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_amount: item.discount_amount,
      tax_amount: item.tax_amount,
      notes: item.notes,
    });
  };

  const handleDeleteItem = async (itemId: number) => {
    try {
      if (itemId > 1000000) {
        setInvoiceItems(invoiceItems.filter(item => item.id !== itemId));
        return;
      }

      await deleteItemMutation.mutateAsync({
        invoiceId,
        itemId,
      });

      setInvoiceItems(invoiceItems.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error deleting invoice item:', error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingItem(null);
    formik.resetForm();
  };

  const handleSaveChanges = async () => {
    try {
      const itemsToSave = invoiceItems
        .filter(item => item.product_id !== '')
        .map(item => ({
          parent_id: invoiceId,
          product_id: Number(item.product_id),
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          discount_amount: Number(item.discount_amount) || 0,
          tax_amount: Number(item.tax_amount) || 0,
          notes: item.notes || undefined,
        }));

      await bulkUpdateItemsMutation.mutateAsync({
        invoiceId,
        invoiceItems: itemsToSave,
      });

      onClose();
    } catch (error) {
      console.error('Error saving invoice items:', error);
    }
  };

  const calculateTotals = () => {
    const subtotal = invoiceItems.reduce(
      (sum, item) => sum + Number(item.quantity) * Number(item.unit_price),
      0
    );
    const totalDiscount = invoiceItems.reduce(
      (sum, item) => sum + Number(item.discount_amount),
      0
    );
    const totalTax = invoiceItems.reduce(
      (sum, item) => sum + Number(item.tax_amount),
      0
    );
    const totalAmount = subtotal - totalDiscount + totalTax;

    return {
      subtotal,
      totalDiscount,
      totalTax,
      totalAmount,
    };
  };

  const totals = calculateTotals();

  const invoiceItemsColumns: TableColumn<InvoiceItemFormData>[] = [
    {
      id: 'product_name',
      label: 'Product',
      render: (_value, row) => (
        <Box className="!flex !flex-col !gap-1">
          <Typography variant="caption" className="!font-medium !text-xs">
            {row.product_name}
          </Typography>
          {row.product_code && (
            <Typography variant="caption" className="!text-gray-500 !text-xs">
              {row.product_code}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'quantity',
      label: 'Quantity',
      render: (_value, row) => (
        <Box className="!flex !gap-1">
          <Typography variant="caption" className="!text-xs !font-medium">
            {row.quantity}
          </Typography>
          {row.unit && (
            <Typography variant="caption" className="!text-gray-500 !text-xs">
              {row.unit}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'unit_price',
      label: 'Unit Price',
      render: (_value, row) => (
        <Typography variant="caption" className="!text-xs">
          ${Number(row.unit_price).toFixed(2)}
        </Typography>
      ),
    },
    {
      id: 'discount_amount',
      label: 'Discount',
      render: (_value, row) => (
        <Typography variant="caption" className="!text-red-600 !text-xs">
          -${Number(row.discount_amount).toFixed(2)}
        </Typography>
      ),
    },
    {
      id: 'tax_amount',
      label: 'Tax',
      render: (_value, row) => (
        <Typography variant="caption" className="!text-green-600 !text-xs">
          +${Number(row.tax_amount).toFixed(2)}
        </Typography>
      ),
    },
    {
      id: 'total_amount',
      label: 'Total',
      render: (_value, row) => (
        <Typography variant="caption" className="!font-medium !text-xs">
          ${Number(row.total_amount || 0).toFixed(2)}
        </Typography>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_value, row) => (
        <Box className="!flex !gap-1">
          <EditButton
            onClick={() => handleEditItem(row)}
            tooltip="Edit item"
            size="small"
          />
          <PopConfirm
            title="Delete Invoice Item"
            description="Are you sure you want to delete this invoice item? This action cannot be undone."
            onConfirm={() => handleDeleteItem(row.id!)}
          >
            <DeleteButton tooltip="Delete item" size="small" />
          </PopConfirm>
        </Box>
      ),
    },
  ];

  return (
    <CustomDrawer
      open={open}
      setOpen={onClose}
      title={`Invoice Items - ${invoice?.invoice_number || 'N/A'}`}
      size="larger"
    >
      <Box className="!p-4">
        <Box className="!space-y-4">
          {/* Invoice Summary */}
          <Box className="!bg-gray-100 !rounded-lg !p-3">
            <Typography
              variant="subtitle1"
              className="!font-semibold !mb-3 !text-sm"
            >
              Invoice Information
            </Typography>
            <Box className="!grid !grid-cols-2 !gap-3">
              <Box>
                <Typography
                  variant="caption"
                  className="!text-gray-600 !text-xs"
                >
                  Invoice Number
                </Typography>
                {isLoading ? (
                  <Skeleton variant="text" width="60%" height={20} />
                ) : (
                  <Typography variant="body2" className="!font-medium !text-sm">
                    {invoice?.invoice_number || 'N/A'}
                  </Typography>
                )}
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  className="!text-gray-600 !text-xs"
                >
                  Customer
                </Typography>
                {isLoading ? (
                  <Skeleton variant="text" width="80%" height={20} />
                ) : (
                  <Typography variant="body2" className="!font-medium !text-sm">
                    {invoice?.customer?.name || 'N/A'}
                  </Typography>
                )}
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  className="!text-gray-600 !text-xs"
                >
                  Invoice Date
                </Typography>
                {isLoading ? (
                  <Skeleton variant="text" width="50%" height={20} />
                ) : (
                  <Typography variant="body2" className="!font-medium !text-sm">
                    {invoice?.invoice_date
                      ? new Date(invoice.invoice_date).toLocaleDateString()
                      : 'N/A'}
                  </Typography>
                )}
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  className="!text-gray-600 !text-xs"
                >
                  Status
                </Typography>
                {isLoading ? (
                  <Skeleton variant="text" width="40%" height={20} />
                ) : (
                  <Typography
                    variant="body2"
                    className="!font-medium capitalize !text-sm"
                  >
                    {invoice?.status || 'N/A'}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          {/* Add/Edit Item Form */}
          <Box className="!bg-white !border !border-gray-200 !rounded-lg !p-3">
            <Typography
              variant="subtitle1"
              className="!font-semibold !mb-3 !text-sm"
            >
              {isEditing ? 'Edit Invoice Item' : 'Add New Item'}
            </Typography>

            <form onSubmit={formik.handleSubmit} className="!space-y-4">
              <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
                <ProductSelect
                  name="product_id"
                  label="Product"
                  formik={formik}
                  required
                  disabled={isEditing}
                />

                <Input
                  name="quantity"
                  label="Quantity"
                  type="number"
                  formik={formik}
                  required
                  placeholder="1"
                />

                <Input
                  name="unit_price"
                  label="Unit Price"
                  type="number"
                  formik={formik}
                  required
                  placeholder="0.00"
                />

                <Input
                  name="discount_amount"
                  label="Discount Amount"
                  type="number"
                  formik={formik}
                  placeholder="0.00"
                />

                <Input
                  name="tax_amount"
                  label="Tax Amount"
                  type="number"
                  formik={formik}
                  placeholder="0.00"
                />

                <Box className="md:!col-span-2">
                  <Input
                    name="notes"
                    label="Notes"
                    formik={formik}
                    placeholder="Additional notes..."
                    multiline
                    rows={2}
                  />
                </Box>
              </Box>

              <Box className="!flex !justify-end !gap-2">
                {isEditing && (
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                )}
                <Button type="submit" variant="contained" startIcon={<Plus />}>
                  {isEditing ? 'Update Item' : 'Add Item'}
                </Button>
              </Box>
            </form>
          </Box>

          {/* Invoice Items Table */}
          <Box>
            <Box className="!flex !justify-between !items-center !mb-3">
              <Typography
                variant="subtitle1"
                className="!font-semibold !text-sm"
              >
                Invoice Items ({invoiceItems.length})
              </Typography>
            </Box>

            {isLoading ? (
              <Box className="!space-y-2">
                <Skeleton variant="rectangular" height={40} />
                <Skeleton variant="rectangular" height={40} />
                <Skeleton variant="rectangular" height={40} />
              </Box>
            ) : invoiceItems.length > 0 ? (
              <Table
                data={invoiceItems}
                columns={invoiceItemsColumns}
                getRowId={row => row.id?.toString() || ''}
                pagination={false}
                sortable={false}
                emptyMessage="No invoice items found."
              />
            ) : (
              <Box className="!text-center !py-6 !text-gray-500">
                <Package className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <Typography variant="caption" className="!text-xs">
                  No items added yet. Add items using the form above.
                </Typography>
              </Box>
            )}
          </Box>

          {/* Totals Summary */}
          {invoiceItems.length > 0 && (
            <Box className="!bg-gray-50 !rounded-lg !p-3">
              <Typography
                variant="subtitle1"
                className="!font-semibold !mb-3 !text-sm"
              >
                Invoice Summary
              </Typography>
              <Box className="!space-y-2">
                <Box className="!flex !justify-between">
                  <Typography variant="caption" className="!text-xs">
                    Subtotal:
                  </Typography>
                  <Typography variant="caption" className="!text-xs">
                    ${totals.subtotal.toFixed(2)}
                  </Typography>
                </Box>
                <Box className="!flex !justify-between">
                  <Typography variant="caption" className="!text-xs">
                    Total Discount:
                  </Typography>
                  <Typography
                    variant="caption"
                    className="!text-red-600 !text-xs"
                  >
                    -${totals.totalDiscount.toFixed(2)}
                  </Typography>
                </Box>
                <Box className="!flex !justify-between">
                  <Typography variant="caption" className="!text-xs">
                    Total Tax:
                  </Typography>
                  <Typography
                    variant="caption"
                    className="!text-green-600 !text-xs"
                  >
                    +${totals.totalTax.toFixed(2)}
                  </Typography>
                </Box>
                <Box className="!border-t !border-gray-300 !pt-2 !mt-2">
                  <Box className="!flex !justify-between">
                    <Typography
                      variant="caption"
                      className="!font-bold !text-xs"
                    >
                      Total Amount:
                    </Typography>
                    <Typography
                      variant="caption"
                      className="!font-bold !text-xs"
                    >
                      ${totals.totalAmount.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}

          {/* Action Buttons */}
          <Box className="!flex !justify-end !gap-2">
            <Button type="button" variant="outlined" onClick={onClose}>
              Close
            </Button>
            <Button
              type="button"
              variant="contained"
              onClick={handleSaveChanges}
              disabled={
                invoiceItems.length === 0 || bulkUpdateItemsMutation.isPending
              }
            >
              {bulkUpdateItemsMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Box>
      </Box>
    </CustomDrawer>
  );
};

export default InvoiceItemsManagement;
