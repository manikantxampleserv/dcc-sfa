import { Box, MenuItem, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { Package, Plus } from 'lucide-react';
import React, { useState } from 'react';
import { DeleteButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import { useCustomers } from '../../../../hooks/useCustomers';
import {
  useCreateOrder,
  useOrder,
  useUpdateOrder,
} from '../../../../hooks/useOrders';
import { useProducts } from '../../../../hooks/useProducts';
import { useUsers } from '../../../../hooks/useUsers';
import { orderValidationSchema } from '../../../../schemas/order.schema';
import type { Order } from '../../../../services/masters/Orders';

interface ManageOrderProps {
  open: boolean;
  onClose: () => void;
  order?: Order | null;
}

interface OrderItemFormData {
  product_id: number | '';
  quantity: string;
  unit_price: string;
  discount_amount: string;
  tax_amount: string;
  notes: string;
}

const ManageOrder: React.FC<ManageOrderProps> = ({ open, onClose, order }) => {
  const isEdit = !!order;
  const [orderItems, setOrderItems] = useState<OrderItemFormData[]>([]);

  const { data: customersResponse } = useCustomers({ limit: 1000 });
  const { data: productsResponse } = useProducts({ limit: 1000 });
  const { data: usersResponse } = useUsers({ limit: 1000 });
  const { data: orderResponse } = useOrder(order?.id || 0);

  const customers = customersResponse?.data || [];
  const products = productsResponse?.data || [];
  const users = usersResponse?.data || [];
  const salespeople = users;

  const createOrderMutation = useCreateOrder();
  const updateOrderMutation = useUpdateOrder();

  const handleCancel = () => {
    onClose();
    setOrderItems([]);
    formik.resetForm();
  };

  React.useEffect(() => {
    if (order && orderResponse?.data) {
      const items =
        orderResponse.data.order_items?.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity.toString(),
          unit_price: item.unit_price.toString(),
          discount_amount: (item.discount_amount || 0).toString(),
          tax_amount: (item.tax_amount || 0).toString(),
          notes: item.notes || '',
        })) || [];
      setOrderItems(items);
      formik.setFieldValue('order_items', items);
    } else {
      setOrderItems([]);
      formik.setFieldValue('order_items', []);
    }
  }, [order, orderResponse]);

  const formik = useFormik({
    initialValues: {
      order_number: order?.order_number || '',
      parent_id: order?.parent_id || '',
      salesperson_id: order?.salesperson_id || '',
      currency_id: order?.currency_id || '8',
      order_date: order?.order_date ? order.order_date.split('T')[0] : '',
      delivery_date: order?.delivery_date
        ? order.delivery_date.split('T')[0]
        : '',
      status: order?.status || 'draft',
      priority: order?.priority || 'medium',
      order_type: order?.order_type || 'regular',
      payment_method: order?.payment_method || 'credit',
      payment_terms: order?.payment_terms || 'Net 30',
      subtotal: order?.subtotal || 0,
      discount_amount: order?.discount_amount || 0,
      tax_amount: order?.tax_amount || 0,
      shipping_amount: order?.shipping_amount || 0,
      total_amount: order?.total_amount || 0,
      notes: order?.notes || '',
      shipping_address: order?.shipping_address || '',
      approval_status: order?.approval_status || 'pending',
      approved_by: order?.approved_by || '',
      is_active: order?.is_active || 'Y',
      order_items: [],
    },
    validationSchema: orderValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const submitData = {
          ...values,
          parent_id: Number(values.parent_id),
          salesperson_id: Number(values.salesperson_id),
          currency_id: values.currency_id
            ? Number(values.currency_id)
            : undefined,
          delivery_date: values.delivery_date || undefined,
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
              discount_amount: Number(item.discount_amount) || 0,
              tax_amount: Number(item.tax_amount) || 0,
              notes: item.notes || undefined,
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

  const addOrderItem = () => {
    const newItem: OrderItemFormData = {
      product_id: '',
      quantity: '1',
      unit_price: '0',
      discount_amount: '0',
      tax_amount: '0',
      notes: '',
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
        <Select
          value={row.product_id}
          onChange={e =>
            updateOrderItem(row._index, 'product_id', e.target.value)
          }
          size="small"
          className="!min-w-60"
          displayEmpty
        >
          <MenuItem value="">Select Product</MenuItem>
          {products.map(product => (
            <MenuItem key={product.id} value={product.id}>
              {product.name}
            </MenuItem>
          ))}
        </Select>
      ),
    },
    {
      id: 'quantity',
      label: 'Quantity',
      render: (_value, row) => (
        <Input
          value={row.quantity}
          onChange={e =>
            updateOrderItem(row._index, 'quantity', e.target.value)
          }
          placeholder="1"
          type="number"
          size="small"
          className="!min-w-20"
        />
      ),
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
      id: 'discount_amount',
      label: 'Discount Amount',
      render: (_value, row) => (
        <Input
          value={row.discount_amount}
          onChange={e =>
            updateOrderItem(row._index, 'discount_amount', e.target.value)
          }
          placeholder="0.00"
          type="number"
          size="small"
          className="!min-w-20"
        />
      ),
    },
    {
      id: 'tax_amount',
      label: 'Tax Amount',
      render: (_value, row) => (
        <Input
          value={row.tax_amount}
          onChange={e =>
            updateOrderItem(row._index, 'tax_amount', e.target.value)
          }
          placeholder="0.00"
          type="number"
          size="small"
          className="!min-w-20"
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
    const currencyMap: Record<string, string> = {
      '1': 'INR',
      '2': 'USD',
      '3': 'EUR',
      '4': 'GBP',
      '5': 'JPY',
      '6': 'AUD',
      '7': 'CAD',
      '8': 'TZS',
    };
    return currencyMap[String(currencyId)] || 'INR';
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
    const discountAmount = orderItems.reduce(
      (sum, item) => sum + Number(item.discount_amount),
      0
    );
    const taxAmount = orderItems.reduce(
      (sum, item) => sum + Number(item.tax_amount),
      0
    );
    const shippingAmount = 0;
    const totalAmount = subtotal - discountAmount + taxAmount + shippingAmount;

    return {
      subtotal,
      discount_amount: discountAmount,
      tax_amount: taxAmount,
      shipping_amount: shippingAmount,
      total_amount: totalAmount,
    };
  };

  const totals = calculateOrderTotals();

  console.log(formik.values);

  return (
    <CustomDrawer
      open={open}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Order' : 'Create Order'}
      size="larger"
    >
      <Box className="!p-5">
        <form onSubmit={formik.handleSubmit} className="!space-y-5">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-5">
            <Box className="md:!col-span-2">
              <Typography
                variant="h6"
                className="!font-semibold !text-gray-900"
              >
                Order Information
              </Typography>
            </Box>

            <Select name="parent_id" label="Customer" formik={formik} required>
              {customers.map(customer => (
                <MenuItem key={customer.id} value={customer.id}>
                  {customer.name} ({customer.code})
                </MenuItem>
              ))}
            </Select>

            <Select
              name="salesperson_id"
              label="Salesperson"
              formik={formik}
              required
            >
              {salespeople.map(salesperson => (
                <MenuItem key={salesperson.id} value={salesperson.id}>
                  {salesperson.name}
                </MenuItem>
              ))}
            </Select>

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
              <MenuItem value="1">INR - Indian Rupee</MenuItem>
              <MenuItem value="2">USD - US Dollar</MenuItem>
              <MenuItem value="3">EUR - Euro</MenuItem>
              <MenuItem value="4">GBP - British Pound</MenuItem>
              <MenuItem value="5">JPY - Japanese Yen</MenuItem>
              <MenuItem value="6">AUD - Australian Dollar</MenuItem>
              <MenuItem value="7">CAD - Canadian Dollar</MenuItem>
              <MenuItem value="8">TZS - Tanzania Shilling</MenuItem>
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
                <Typography
                  variant="h6"
                  className="!font-semibold !text-gray-900 !mb-2"
                >
                  Order Summary
                </Typography>
                <Box className="!space-y-2">
                  <Box className="!flex !justify-between">
                    <Typography variant="body2">Subtotal:</Typography>
                    <Typography variant="body2">
                      {formatCurrency(
                        totals.subtotal,
                        getCurrencyCode(formik.values.currency_id)
                      )}
                    </Typography>
                  </Box>
                  <Box className="!flex !justify-between">
                    <Typography variant="body2">Discount:</Typography>
                    <Typography variant="body2">
                      -
                      {formatCurrency(
                        totals.discount_amount,
                        getCurrencyCode(formik.values.currency_id)
                      )}
                    </Typography>
                  </Box>
                  <Box className="!flex !justify-between">
                    <Typography variant="body2">Tax:</Typography>
                    <Typography variant="body2">
                      {formatCurrency(
                        totals.tax_amount,
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
                  </Box>
                  <Box className="!border-t !border-gray-300 !pt-2 !mt-2">
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
    </CustomDrawer>
  );
};

export default ManageOrder;
