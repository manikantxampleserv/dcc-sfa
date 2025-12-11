import { Box, MenuItem, Skeleton, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useVanInventoryById } from 'hooks/useVanInventory';
import { useProducts } from 'hooks/useProducts';
import {
  useVanInventoryItems,
  useBulkUpdateVanInventoryItems,
  useDeleteVanInventoryItem,
} from 'hooks/useVanInventoryItems';
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

interface VanInventoryItemsManagementProps {
  open: boolean;
  onClose: () => void;
  vanInventoryId: number;
}

interface VanInventoryItemFormData {
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

const VanInventoryItemsManagement: React.FC<
  VanInventoryItemsManagementProps
> = ({ open, onClose, vanInventoryId }) => {
  const [vanInventoryItems, setVanInventoryItems] = useState<
    VanInventoryItemFormData[]
  >([]);
  const [editingItem, setEditingItem] =
    useState<VanInventoryItemFormData | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const { data: productsResponse, isLoading: productsLoading } = useProducts({
    limit: 1000,
  });
  const { data: vanInventoryResponse, isLoading: vanInventoryLoading } =
    useVanInventoryById(vanInventoryId);
  const { data: vanInventoryItemsResponse, isLoading: itemsLoading } =
    useVanInventoryItems(vanInventoryId, {
      enabled: open && !!vanInventoryId, // Only fetch when Items Management drawer is open
    });

  const products = productsResponse?.data || [];
  const vanInventory = vanInventoryResponse?.data;
  const existingItems = vanInventoryItemsResponse?.data;
  const isLoading = productsLoading || vanInventoryLoading || itemsLoading;

  const bulkUpdateItemsMutation = useBulkUpdateVanInventoryItems();
  const deleteItemMutation = useDeleteVanInventoryItem();

  // Use useMemo to create a stable reference for existingItems
  const existingItemsStable = React.useMemo(() => {
    return existingItems || [];
  }, [existingItems]);

  // Use a ref to track the previous items IDs to prevent infinite loops
  const prevItemsIdsRef = React.useRef<string>('');

  React.useEffect(() => {
    // Only update if we have data and the drawer is open
    if (!open) return;

    if (existingItemsStable && existingItemsStable.length > 0) {
      const items = existingItemsStable.map(item => {
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
            itemWithProducts.van_inventory_items_products?.name ||
            item.product_name ||
            '',
          unit:
            itemWithProducts.van_inventory_items_products
              ?.product_unit_of_measurement?.name ||
            itemWithProducts.van_inventory_items_products
              ?.product_unit_of_measurement?.symbol ||
            itemWithProducts.van_inventory_items_products?.unit_of_measurement?.toString() ||
            item.unit ||
            'pcs',
          quantity: item.quantity.toString(),
          unit_price: item.unit_price.toString(),
          discount_amount: (item.discount_amount || 0).toString(),
          tax_amount: (item.tax_amount || 0).toString(),
          total_amount:
            item.total_amount?.toString() || calculatedTotal.toString(),
          notes: item.notes || '',
          product_code:
            itemWithProducts.van_inventory_items_products?.code || '',
        };
      });

      // Create a stable string representation for comparison using IDs and key fields
      const itemsKey = JSON.stringify(
        items.map(i => ({
          id: i.id,
          product_id: i.product_id,
          quantity: i.quantity,
          unit_price: i.unit_price,
        }))
      );

      // Only update if items actually changed
      if (itemsKey !== prevItemsIdsRef.current) {
        prevItemsIdsRef.current = itemsKey;
        setVanInventoryItems(items);
      }
    } else if (existingItemsStable.length === 0) {
      // Only clear if we actually have items to clear and items changed
      const emptyKey = '[]';
      if (prevItemsIdsRef.current !== emptyKey) {
        prevItemsIdsRef.current = emptyKey;
        setVanInventoryItems([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingItemsStable, vanInventoryId, open]);

  React.useEffect(() => {
    if (open) {
      setIsEditing(false);
      setEditingItem(null);
      formik.resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, vanInventoryId]);

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

        const newItem: VanInventoryItemFormData = {
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
          const updatedItems = vanInventoryItems.map(item =>
            item.id === editingItem.id
              ? { ...newItem, id: editingItem.id }
              : item
          );
          setVanInventoryItems(updatedItems);
          setIsEditing(false);
          setEditingItem(null);
        } else {
          const newItemWithId = {
            ...newItem,
            id: Date.now(),
          };
          setVanInventoryItems([...vanInventoryItems, newItemWithId]);
        }

        formik.resetForm();
      } catch (error) {
        console.error('Error managing van inventory item:', error);
      }
    },
  });

  const handleEditItem = (item: VanInventoryItemFormData) => {
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
        setVanInventoryItems(
          vanInventoryItems.filter(item => item.id !== itemId)
        );
        return;
      }

      await deleteItemMutation.mutateAsync({
        vanInventoryId,
        itemId,
      });

      setVanInventoryItems(
        vanInventoryItems.filter(item => item.id !== itemId)
      );
    } catch (error) {
      console.error('Error deleting van inventory item:', error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingItem(null);
    formik.resetForm();
  };

  const handleSaveChanges = async () => {
    try {
      const itemsToSave = vanInventoryItems
        .filter(item => item.product_id !== '')
        .map(item => ({
          parent_id: vanInventoryId,
          product_id: Number(item.product_id),
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          discount_amount: Number(item.discount_amount) || 0,
          tax_amount: Number(item.tax_amount) || 0,
          notes: item.notes || undefined,
        }));

      await bulkUpdateItemsMutation.mutateAsync({
        vanInventoryId,
        vanInventoryItems: itemsToSave,
      });

      onClose();
    } catch (error) {
      console.error('Error saving van inventory items:', error);
    }
  };

  const calculateTotals = () => {
    const subtotal = vanInventoryItems.reduce(
      (sum, item) => sum + Number(item.quantity) * Number(item.unit_price),
      0
    );
    const totalDiscount = vanInventoryItems.reduce(
      (sum, item) => sum + Number(item.discount_amount),
      0
    );
    const totalTax = vanInventoryItems.reduce(
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

  const vanInventoryItemsColumns: TableColumn<VanInventoryItemFormData>[] = [
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
            title="Delete Van Inventory Item"
            description="Are you sure you want to delete this van inventory item? This action cannot be undone."
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
      title={`Van Inventory Items - #${vanInventory?.id || 'N/A'}`}
      size="larger"
    >
      <Box className="!p-4">
        <Box className="!space-y-4">
          {/* Van Inventory Summary */}
          <Box className="!bg-gray-100 !rounded-lg !p-3">
            <Typography
              variant="subtitle1"
              className="!font-semibold !mb-3 !text-sm"
            >
              Van Inventory Information
            </Typography>
            <Box className="!grid !grid-cols-2 !gap-3">
              <Box>
                <Typography
                  variant="caption"
                  className="!text-gray-600 !text-xs"
                >
                  Van Inventory ID
                </Typography>
                {isLoading ? (
                  <Skeleton variant="text" width="60%" height={20} />
                ) : (
                  <Typography variant="body2" className="!font-medium !text-sm">
                    #{vanInventory?.id || 'N/A'}
                  </Typography>
                )}
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  className="!text-gray-600 !text-xs"
                >
                  User
                </Typography>
                {isLoading ? (
                  <Skeleton variant="text" width="80%" height={20} />
                ) : (
                  <Typography variant="body2" className="!font-medium !text-sm">
                    {vanInventory?.user?.name || 'N/A'}
                  </Typography>
                )}
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  className="!text-gray-600 !text-xs"
                >
                  Document Date
                </Typography>
                {isLoading ? (
                  <Skeleton variant="text" width="50%" height={20} />
                ) : (
                  <Typography variant="body2" className="!font-medium !text-sm">
                    {vanInventory?.document_date
                      ? new Date(
                          vanInventory.document_date
                        ).toLocaleDateString()
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
                    {vanInventory?.status === 'D'
                      ? 'Draft'
                      : vanInventory?.status === 'A'
                        ? 'Confirmed'
                        : vanInventory?.status === 'C'
                          ? 'Canceled'
                          : 'N/A'}
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
              {isEditing ? 'Edit Van Inventory Item' : 'Add New Item'}
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

          {/* Van Inventory Items Table */}
          <Box>
            <Box className="!flex !justify-between !items-center !mb-3">
              <Typography
                variant="subtitle1"
                className="!font-semibold !text-sm"
              >
                Van Inventory Items ({vanInventoryItems.length})
              </Typography>
            </Box>

            {isLoading ? (
              <Box className="!space-y-2">
                <Skeleton variant="rectangular" height={40} />
                <Skeleton variant="rectangular" height={40} />
                <Skeleton variant="rectangular" height={40} />
              </Box>
            ) : vanInventoryItems.length > 0 ? (
              <Table
                data={vanInventoryItems}
                columns={vanInventoryItemsColumns}
                getRowId={row => row.id?.toString() || ''}
                pagination={false}
                sortable={false}
                emptyMessage="No van inventory items found."
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
          {vanInventoryItems.length > 0 && (
            <Box className="!bg-gray-50 !rounded-lg !p-3">
              <Typography
                variant="subtitle1"
                className="!font-semibold !mb-3 !text-sm"
              >
                Van Inventory Summary
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
                vanInventoryItems.length === 0 ||
                bulkUpdateItemsMutation.isPending
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

export default VanInventoryItemsManagement;
