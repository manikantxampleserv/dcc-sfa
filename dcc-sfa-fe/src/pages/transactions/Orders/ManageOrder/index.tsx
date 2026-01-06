import { Tag } from '@mui/icons-material';
import { Box, MenuItem, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useCurrencies } from 'hooks/useCurrencies';
import {
  useInventoryItemById,
  type SalespersonInventoryData,
} from 'hooks/useInventoryItems';
import { useCreateOrder, useOrder, useUpdateOrder } from 'hooks/useOrders';
import type { ProductBatch, ProductSerial } from 'hooks/useVanInventory';
import { Package, Plus } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { orderValidationSchema } from 'schemas/order.schema';
import type { Order } from 'services/masters/Orders';
import { DeleteButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import CustomerSelect from 'shared/CustomerSelect';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import SalesItemsSelect from 'shared/SalesItemsSelect';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import UserSelect from 'shared/UserSelect';
import ManageOrderBatch from './ManageOrderBatch';
import ManageOrderSerial from './ManageOrderSerial';
import { useSettings } from 'hooks/useSettings';

interface ManageOrderProps {
  open: boolean;
  onClose: () => void;
  order?: Order | null;
}

export interface OrderItemFormData {
  product_id: number | '';
  tracking_type?: string | null;
  quantity: string;
  unit_price: string;
  notes: string;
  product_batches?: ProductBatch[];
  product_serials?: ProductSerial[];
}
const ManageOrder: React.FC<ManageOrderProps> = ({ open, onClose, order }) => {
  const isEdit = !!order;
  const [orderItems, setOrderItems] = useState<OrderItemFormData[]>([]);
  const initializedRef = useRef<number | null>(null);
  const syncedRef = useRef<string>('');
  const [isBatchSelectorOpen, setIsBatchSelectorOpen] = useState(false);
  const [isSerialSelectorOpen, setIsSerialSelectorOpen] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const { data: settingsResponse } = useSettings();

  const settings = settingsResponse?.data;
  const defaultCurrencyId = settings?.currency_id || '';

  const { data: currenciesResponse } = useCurrencies({ limit: 1000 });
  const { data: orderResponse } = useOrder(order?.id || 0);

  const currencies = currenciesResponse?.data || [];

  const createOrderMutation = useCreateOrder();
  const updateOrderMutation = useUpdateOrder();

  const formik = useFormik({
    initialValues: {
      order_number: order?.order_number || '',
      parent_id: order?.parent_id || '',
      salesperson_id: order?.salesperson_id || '',
      currency_id: order?.currency_id || defaultCurrencyId,
      order_date: order?.order_date
        ? order.order_date
        : new Date().toISOString().split('T')[0],
      delivery_date: order?.delivery_date
        ? order.delivery_date
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
      status: order?.status || 'draft',
      priority: order?.priority || 'medium',
      order_type: order?.order_type || 'regular',
      payment_method: order?.payment_method || 'credit',
      payment_terms: order?.payment_terms || 'Net 30',
      subtotal: order?.subtotal || 0,
      shipping_amount: order?.shipping_amount || 0,
      total_amount: order?.total_amount || 0,
      notes: order?.notes || '',
      shipping_address: order?.shipping_address || '',
      approval_status: order?.approval_status || 'P',
      approved_by: order?.approved_by || '',
      is_active: order?.is_active || 'Y',
      order_items: [],
    },
    validationSchema: orderValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        for (let i = 0; i < orderItems.length; i += 1) {
          const item = orderItems[i];
          if (!item.product_id || !item.quantity) continue;
          const quantity = Number(item.quantity) || 0;
          const trackingType = (item.tracking_type || '').toLowerCase();
          if (trackingType === 'batch' && quantity > 0) {
            const rawBatches = item.product_batches || [];
            const nonZeroBatches = rawBatches.filter(b => {
              const qty = Number(b.quantity);
              return Number.isFinite(qty) && qty > 0;
            });
            const totalBatchQty = nonZeroBatches.reduce(
              (sum, b) => sum + (Number(b.quantity) || 0),
              0
            );
            if (nonZeroBatches.length === 0 || totalBatchQty === 0) {
              toast.error(
                `Please allocate batch quantities for item ${i + 1} to match the ordered quantity.`
              );
              return;
            }
            if (totalBatchQty !== quantity) {
              toast.error(
                `Batch quantity mismatch for item ${i + 1}. Total batch quantity (${totalBatchQty}) must match item quantity (${quantity}).`
              );
              return;
            }
          }
          if (trackingType === 'serial' && quantity > 0) {
            const allSerials = (item.product_serials ||
              []) as (ProductSerial & { selected?: boolean })[];
            const selectedSerials = allSerials.filter(
              s => s.selected !== false
            );
            if (selectedSerials.length === 0) {
              toast.error(
                `Please assign serial numbers for item ${i + 1} to match the ordered quantity.`
              );
              return;
            }
            if (selectedSerials.length !== quantity) {
              toast.error(
                `Serial count mismatch for item ${i + 1}. You have ${selectedSerials.length} selected serial(s) but quantity is ${quantity}.`
              );
              return;
            }
            const trimmedSerials = selectedSerials.map(s =>
              (s.serial_number || '').trim().toLowerCase()
            );
            if (trimmedSerials.some(s => !s)) {
              toast.error(
                `Serial number is required for all rows in item ${i + 1}.`
              );
              return;
            }
            const seen = new Set<string>();
            for (const s of trimmedSerials) {
              if (seen.has(s)) {
                toast.error(
                  `Duplicate serial number "${s}" found in item ${i + 1}.`
                );
                return;
              }
              seen.add(s);
            }
          }
        }

        const submitData = {
          ...values,
          order_date: new Date(values.order_date).toISOString() || undefined,
          parent_id: Number(values.parent_id),
          salesperson_id: Number(values.salesperson_id),
          currency_id: values.currency_id
            ? Number(values.currency_id)
            : undefined,
          delivery_date:
            new Date(values.delivery_date).toISOString() || undefined,
          notes: values.notes || undefined,
          shipping_address: values.shipping_address || undefined,
          approved_by: values.approved_by
            ? Number(values.approved_by)
            : undefined,
          order_items: orderItems
            .filter(item => item.product_id !== '')
            .map(item => ({
              product_id: Number(item.product_id),
              quantity: Number(item.quantity),
              unit_price: Number(item.unit_price),
              notes: item.notes || undefined,
              product_batches: item.product_batches || undefined,
              product_serials: item.product_serials || undefined,
            })),
        };

        if (isEdit && order) {
          await updateOrderMutation.mutateAsync({
            id: order.id,
            ...submitData,
          });
        } else {
          await createOrderMutation.mutateAsync(submitData);
        }
        handleCancel();
      } catch (error) {
        console.log('Error submitting order:', error);
      }
    },
  });

  const salespersonId = formik.values.salesperson_id
    ? Number(formik.values.salesperson_id)
    : 0;

  const { data: inventoryData } = useInventoryItemById(salespersonId, {
    enabled: !!salespersonId && open,
  });

  const inventoryByProductId = React.useMemo(() => {
    const map: Record<
      number,
      { batches: ProductBatch[]; serials: ProductSerial[] }
    > = {};

    if (!inventoryData?.data) {
      return map;
    }

    const responseData = inventoryData.data;

    const salespersonData = responseData as SalespersonInventoryData;
    (salespersonData.products || []).forEach(product => {
      const batches: ProductBatch[] = (product.batches || []).map(batch => ({
        batch_lot_id: batch.batch_lot_id,
        batch_number: batch.batch_number,
        lot_number: batch.lot_number,
        remaining_quantity: batch.remaining_quantity || 0,
        manufacturing_date: batch.manufacturing_date,
        expiry_date: batch.expiry_date,
        batch_total_quantity: batch.total_quantity,
        batch_remaining_quantity: batch.remaining_quantity,
        supplier_name: batch.supplier_name,
        quality_grade: batch.quality_grade,
        days_until_expiry: batch.days_until_expiry,
        is_expired: batch.is_expired,
        is_expiring_soon: batch.is_expiring_soon,
        quantity: null,
      }));

      const serials: ProductSerial[] = (product.serials || []).map(serial => ({
        id: serial.serial_id,
        product_id: product.product_id,
        serial_number: serial.serial_number,
        quantity: 1,
      }));

      map[product.product_id] = { batches, serials };
    });

    return map;
  }, [inventoryData]);

  const handleCancel = () => {
    onClose();
    setOrderItems([]);
    formik.resetForm();
  };

  const orderKey = React.useMemo(
    () =>
      open && order?.id ? `order-${order.id}` : open ? 'new-order' : 'closed',
    [open, order?.id]
  );

  useEffect(() => {
    if (!open) {
      if (initializedRef.current !== null) {
        initializedRef.current = null;
        syncedRef.current = '';
      }
      return;
    }

    const orderId = order?.id;
    const responseId = orderResponse?.data?.id;
    const hasOrderData = orderId && responseId && orderResponse?.data;

    if (
      hasOrderData &&
      initializedRef.current !== orderId &&
      orderResponse.data
    ) {
      const items =
        orderResponse.data.order_items?.map(item => ({
          product_id: item.product_id,
          tracking_type: null,
          quantity: item.quantity.toString(),
          unit_price: item.unit_price.toString(),
          notes: item.notes || '',
          product_batches: [],
          product_serials: [],
        })) || [];

      const itemsStr = JSON.stringify(items);

      if (syncedRef.current !== itemsStr) {
        initializedRef.current = orderId;
        syncedRef.current = itemsStr;
        setOrderItems(items);
      }
    } else if (!hasOrderData && initializedRef.current !== null && !orderId) {
      initializedRef.current = null;
      syncedRef.current = '';
      setOrderItems([]);
    }
  }, [orderKey, orderResponse?.data?.id, open, order?.id, orderResponse?.data]);

  const orderItemsStr = React.useMemo(
    () => JSON.stringify(orderItems),
    [orderItems]
  );

  useEffect(() => {
    if (!open) return;

    const currentFormikItems = formik.values.order_items || [];
    const formikItemsStr = JSON.stringify(currentFormikItems);

    if (orderItemsStr !== formikItemsStr) {
      const lastSynced = syncedRef.current;
      if (lastSynced !== orderItemsStr) {
        formik.setFieldValue('order_items', orderItems, false);
        syncedRef.current = orderItemsStr;
      }
    }
  }, [open, orderItemsStr, formik, orderItems]);

  const addOrderItem = () => {
    if (!formik.values.salesperson_id) {
      toast.error('Please select a Sales Person');
      return;
    }
    const newItem: OrderItemFormData = {
      product_id: '',
      tracking_type: null,
      quantity: '1',
      unit_price: '0',
      notes: '',
      product_batches: [],
      product_serials: [],
    };
    const updatedItems = [...orderItems, newItem];
    setOrderItems(updatedItems);
    formik.setFieldValue('order_items', updatedItems);
  };

  const removeOrderItem = (index: number) => {
    const updatedItems = orderItems.filter((_, i) => i !== index);
    setOrderItems(updatedItems);
    formik.setFieldValue('order_items', updatedItems);
  };

  const updateOrderItem = (
    index: number,
    field: keyof OrderItemFormData,
    value: string
  ) => {
    const updatedItems = [...orderItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setOrderItems(updatedItems);
    formik.setFieldValue('order_items', updatedItems);
  };

  const orderItemsWithIndex = orderItems.map((item, index) => ({
    ...item,
    _index: index,
  }));

  const orderItemsColumns: TableColumn<
    OrderItemFormData & { _index: number }
  >[] = [
    {
      id: 'product_id',
      label: 'Product',
      render: (_value, row) => (
        <SalesItemsSelect
          salespersonId={
            formik.values.salesperson_id
              ? Number(formik.values.salesperson_id)
              : 0
          }
          value={row.product_id}
          onChange={(_event, product) => {
            const updatedItems = [...orderItems];
            const trackingType = product?.tracking_type || null;
            const trackingLower = trackingType
              ? trackingType.toString().toLowerCase()
              : null;
            const isBatchOrSerial =
              trackingLower === 'batch' || trackingLower === 'serial';
            updatedItems[row._index] = {
              ...updatedItems[row._index],
              product_id: product ? product.product_id : '',
              tracking_type: trackingType,
              unit_price: product ? String(product.unit_price) : '0',
              quantity:
                product && isBatchOrSerial
                  ? '0'
                  : updatedItems[row._index].quantity || '1',
              product_batches: [],
              product_serials: [],
            };
            setOrderItems(updatedItems);
            formik.setFieldValue('order_items', updatedItems);
          }}
          size="small"
          placeholder="Search for a product"
          label=""
          disabled={!formik.values.salesperson_id}
          className="!min-w-72"
        />
      ),
    },
    {
      id: 'tracking_type',
      label: 'Tracking',
      render: (_value, row) => {
        const tracking = (row.tracking_type || '').toString().toLowerCase();
        const canManage =
          tracking === 'batch' || tracking === 'serial' ? tracking : null;
        return (
          <Box className="!flex !justify-between !items-center !min-w-52">
            <Typography
              variant="body2"
              className="!text-gray-700 !uppercase !text-xs"
            >
              {tracking || 'none'}
            </Typography>
            {canManage && (
              <Button
                type="button"
                startIcon={<Tag />}
                variant="text"
                size="small"
                onClick={() => {
                  const index = row._index;
                  const item = orderItems[index];
                  if (!item || !item.product_id) {
                    toast.error('Please select a product first');
                    return;
                  }
                  setSelectedRowIndex(index);
                  if (canManage === 'batch') {
                    setIsBatchSelectorOpen(true);
                  } else {
                    setIsSerialSelectorOpen(true);
                  }
                }}
              >
                {canManage === 'batch' ? 'Select Batches' : 'Select Serials'}
              </Button>
            )}
          </Box>
        );
      },
    },
    {
      id: 'quantity',
      label: 'Quantity',
      render: (_value, row) => {
        const tracking = (row.tracking_type || '').toString().toLowerCase();
        const isNoneTracking = !tracking || tracking === 'none';
        return (
          <Input
            value={row.quantity}
            onChange={e =>
              updateOrderItem(row._index, 'quantity', e.target.value)
            }
            placeholder="1"
            type="number"
            size="small"
            className="!min-w-20"
            disabled={!isNoneTracking}
          />
        );
      },
    },
    {
      id: 'unit_price',
      label: 'Unit Price',
      render: (_value, row) => (
        <Input
          value={row.unit_price}
          onChange={e =>
            updateOrderItem(row._index, 'unit_price', e.target.value)
          }
          placeholder="0.00"
          type="number"
          size="small"
          className="!min-w-32"
        />
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_value, row) => (
        <DeleteButton
          onClick={() => removeOrderItem(row._index)}
          tooltip="Remove item"
          confirmDelete={true}
          size="medium"
          itemName="order item"
        />
      ),
    },
  ];

  const getCurrencyCode = (currencyId: string | number) => {
    const currencies = currenciesResponse?.data || [];
    const currency = currencies.find(c => c.id === Number(currencyId));
    return currency?.code || 'USD';
  };

  const formatCurrency = (
    amount: number | null | undefined,
    currencyCode: string
  ) => {
    if (amount === null || amount === undefined) return `${currencyCode} 0.00`;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  };

  const calculateOrderTotals = () => {
    const subtotal = orderItems.reduce(
      (sum, item) => sum + Number(item.quantity) * Number(item.unit_price),
      0
    );
    const shippingAmount = 0;
    const totalAmount = subtotal + shippingAmount;

    return {
      subtotal,
      shipping_amount: shippingAmount,
      total_amount: totalAmount,
    };
  };

  const totals = calculateOrderTotals();

  return (
    <CustomDrawer
      open={open}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Order' : 'Create Order'}
      size="large"
    >
      <Box className="!p-5">
        <form onSubmit={formik.handleSubmit} className="!space-y-5">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-5">
            <CustomerSelect
              name="parent_id"
              label="Customer"
              formik={formik}
              required
            />
            <UserSelect formik={formik} required />
            <Input
              name="order_date"
              label="Order Date"
              type="date"
              formik={formik}
              required
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <Input
              name="delivery_date"
              label="Delivery Date"
              type="date"
              formik={formik}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <Select
              name="currency_id"
              label="Currency"
              formik={formik}
              required
            >
              {currencies.map(currency => (
                <MenuItem key={currency.id} value={currency.id}>
                  {currency.code} - {currency.name}
                  {currency.id === defaultCurrencyId && (
                    <Typography
                      component="span"
                      className="!ml-2 !text-xs !text-blue-600"
                    >
                      (Default)
                    </Typography>
                  )}
                </MenuItem>
              ))}
            </Select>
            <Select name="status" label="Status" formik={formik} required>
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="confirmed">Confirmed</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="shipped">Shipped</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
            <Select name="priority" label="Priority" formik={formik} required>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
            </Select>
            <Select
              name="order_type"
              label="Order Type"
              formik={formik}
              required
            >
              <MenuItem value="regular">Regular</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
              <MenuItem value="promotional">Promotional</MenuItem>
              <MenuItem value="sample">Sample</MenuItem>
            </Select>
            <Select
              name="payment_method"
              label="Payment Method"
              formik={formik}
              required
            >
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="credit">Credit</MenuItem>
              <MenuItem value="cheque">Cheque</MenuItem>
              <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
            </Select>
            <Input
              name="payment_terms"
              label="Payment Terms"
              placeholder="e.g., Net 30, COD"
              formik={formik}
            />
            <Box className="md:!col-span-2">
              <Input
                name="shipping_address"
                label="Shipping Address"
                placeholder="Enter shipping address"
                formik={formik}
                multiline
                rows={3}
              />
            </Box>
            <Box className="md:!col-span-2">
              <Input
                name="notes"
                label="Notes"
                placeholder="Enter order notes"
                formik={formik}
                multiline
                rows={3}
              />
            </Box>
          </Box>

          <Box className="!space-y-4">
            <Box className="!flex !justify-between !items-center">
              <Typography
                variant="h6"
                className="!font-semibold !text-gray-900"
              >
                Order Items
              </Typography>
              <Button
                type="button"
                variant="outlined"
                startIcon={<Plus />}
                onClick={addOrderItem}
                size="small"
              >
                Add Item
              </Button>
            </Box>

            {orderItems.length > 0 && (
              <Table
                data={orderItemsWithIndex}
                columns={orderItemsColumns}
                getRowId={row => row._index.toString()}
                pagination={false}
                sortable={false}
                emptyMessage="No order items added yet."
              />
            )}

            {orderItems.length === 0 && (
              <Box className="!text-center !py-8 !text-gray-500">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <Typography variant="body2">
                  No items added yet. Click "Add Item" to get started.
                </Typography>
              </Box>
            )}

            {orderItems.length > 0 && (
              <Box className="!bg-gray-50 !rounded-lg !mt-4">
                {/* <Typography
                  variant="h6"
                  className="!font-semibold !text-gray-900 !mb-2"
                >
                  Order Summary
                </Typography> */}
                <Box className="!space-y-2">
                  {/* <Box className="!flex !justify-between">
                    <Typography variant="body2">Subtotal:</Typography>
                    <Typography variant="body2">
                      {formatCurrency(
                        totals.subtotal,
                        getCurrencyCode(formik.values.currency_id)
                      )}
                    </Typography>
                  </Box>
                  <Box className="!flex !justify-between">
                    <Typography variant="body2">Shipping:</Typography>
                    <Typography variant="body2">
                      {formatCurrency(
                        totals.shipping_amount,
                        getCurrencyCode(formik.values.currency_id)
                      )}
                    </Typography>
                  </Box> */}
                  <Box className="!pt-2 !mt-2">
                    <Box className="!flex !justify-between">
                      <Typography variant="subtitle2" className="!font-bold">
                        Total:
                      </Typography>
                      <Typography variant="subtitle2" className="!font-bold">
                        {formatCurrency(
                          totals.total_amount,
                          getCurrencyCode(formik.values.currency_id)
                        )}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>

          <Box className="!flex !justify-end !gap-2">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              disabled={
                createOrderMutation.isPending || updateOrderMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createOrderMutation.isPending || updateOrderMutation.isPending
              }
            >
              {createOrderMutation.isPending || updateOrderMutation.isPending
                ? isEdit
                  ? 'Updating...'
                  : 'Creating...'
                : isEdit
                  ? 'Update'
                  : 'Create'}
            </Button>
          </Box>
        </form>
      </Box>
      <ManageOrderBatch
        isOpen={isBatchSelectorOpen}
        setIsOpen={setIsBatchSelectorOpen}
        selectedRowIndex={selectedRowIndex}
        setSelectedRowIndex={setSelectedRowIndex}
        orderItems={orderItems}
        setOrderItems={setOrderItems}
        inventoryByProductId={inventoryByProductId}
      />
      <ManageOrderSerial
        isOpen={isSerialSelectorOpen}
        setIsOpen={setIsSerialSelectorOpen}
        selectedRowIndex={selectedRowIndex}
        setSelectedRowIndex={setSelectedRowIndex}
        orderItems={orderItems}
        setOrderItems={setOrderItems}
        quantity={
          selectedRowIndex !== null && orderItems[selectedRowIndex]
            ? orderItems[selectedRowIndex].quantity
            : null
        }
        inventoryByProductId={inventoryByProductId}
      />
    </CustomDrawer>
  );
};

export default ManageOrder;
