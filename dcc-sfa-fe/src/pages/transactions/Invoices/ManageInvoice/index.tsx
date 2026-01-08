import { Box, MenuItem, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useCurrencies } from 'hooks/useCurrencies';
import {
  useCreateInvoice,
  useInvoice,
  useUpdateInvoice,
} from 'hooks/useInvoices';
import { useOrders } from 'hooks/useOrders';
import { Package, Plus } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { invoiceValidationSchema } from 'schemas/invoice.schema';
import type { Invoice } from 'services/masters/Invoices';
import { DeleteButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import CustomerSelect from 'shared/CustomerSelect';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import ProductSelect from 'shared/ProductSelect';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';

interface ManageInvoiceProps {
  open: boolean;
  onClose: () => void;
  invoice?: Invoice | null;
}

interface InvoiceItemFormData {
  product_id: number | '';
  quantity: string;
  unit_price: string;
  notes: string;
}

const ManageInvoice: React.FC<ManageInvoiceProps> = ({
  open,
  onClose,
  invoice,
}) => {
  const isEdit = !!invoice;
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItemFormData[]>([]);

  // Track the last loaded invoice ID to prevent unnecessary updates
  const lastLoadedInvoiceId = useRef<number | null>(null);

  const { data: ordersResponse } = useOrders({ limit: 1000 });
  const { data: currenciesResponse } = useCurrencies({ limit: 1000 });
  const { data: invoiceResponse } = useInvoice(invoice?.id || 0);

  const orders = ordersResponse?.data || [];
  const currencies = currenciesResponse?.data || [];

  const createInvoiceMutation = useCreateInvoice();
  const updateInvoiceMutation = useUpdateInvoice();

  const handleCancel = () => {
    onClose();
    setInvoiceItems([]);
    formik.resetForm();
    (lastLoadedInvoiceId as React.MutableRefObject<number | null>).current =
      null;
  };

  // FIX: Simplified useEffect with proper tracking
  useEffect(() => {
    const currentInvoiceId = invoice?.id;

    // Only update if the invoice ID has actually changed
    if (currentInvoiceId !== lastLoadedInvoiceId.current) {
      if (invoice && invoiceResponse?.data) {
        const items =
          invoiceResponse.data.invoice_items?.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity.toString(),
            unit_price: item.unit_price.toString(),
            notes: item.notes || '',
          })) || [];
        setInvoiceItems(items);
        (lastLoadedInvoiceId as React.MutableRefObject<number | null>).current =
          currentInvoiceId ?? null;
      } else if (!invoice) {
        setInvoiceItems([]);
        (lastLoadedInvoiceId as React.MutableRefObject<number | null>).current =
          null;
      }
    }
  }, [invoice?.id, invoiceResponse?.data]); // Keep original dependencies but use ref for tracking

  const formik = useFormik({
    initialValues: {
      invoice_number: invoice?.invoice_number || '',
      parent_id: invoice?.parent_id || '',
      customer_id: invoice?.customer_id || '',
      currency_id:
        invoice?.currency_id ||
        (currencies.length > 0 ? currencies[0].id.toString() : ''),
      invoice_date: invoice?.invoice_date
        ? invoice.invoice_date.split('T')[0]
        : '',
      due_date: invoice?.due_date ? invoice.due_date.split('T')[0] : '',
      status: invoice?.status || 'draft',
      payment_method: invoice?.payment_method || 'credit',
      subtotal: invoice?.subtotal || 0,
      total_amount: invoice?.total_amount || 0,
      balance_due: invoice?.balance_due || 0,
      notes: invoice?.notes || '',
      billing_address: invoice?.billing_address || '',
      is_active: invoice?.is_active || 'Y',
      invoice_items: [],
    },
    validationSchema: invoiceValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const submitData = {
          ...values,
          invoice_date: new Date(values.invoice_date).toISOString(),
          parent_id: Number(values.parent_id),
          customer_id: Number(values.customer_id),
          currency_id: values.currency_id
            ? Number(values.currency_id)
            : undefined,
          due_date: values.due_date
            ? new Date(values.due_date).toISOString()
            : undefined,
          notes: values.notes,
          billing_address: values.billing_address,
          subtotal: totals.subtotal,
          total_amount: totals.total_amount,
          balance_due: totals.balance_due,
          invoiceItems: invoiceItems
            .filter(item => item.product_id !== '')
            .map(item => ({
              product_id: Number(item.product_id),
              quantity: Number(item.quantity),
              unit_price: Number(item.unit_price),
              notes: item.notes,
            })),
        };

        if (isEdit && invoice) {
          await updateInvoiceMutation.mutateAsync({
            id: invoice.id,
            ...submitData,
          });
        } else {
          await createInvoiceMutation.mutateAsync(submitData);
        }
        handleCancel();
      } catch (error) {
        console.log('Error submitting invoice:', error);
      }
    },
  });

  const addInvoiceItem = () => {
    const newItem: InvoiceItemFormData = {
      product_id: '',
      quantity: '1',
      unit_price: '0',
      notes: '',
    };
    const updatedItems = [...invoiceItems, newItem];
    setInvoiceItems(updatedItems);
  };

  const removeInvoiceItem = (index: number) => {
    const updatedItems = invoiceItems.filter((_, i) => i !== index);
    setInvoiceItems(updatedItems);
  };

  const updateInvoiceItem = (
    index: number,
    field: keyof InvoiceItemFormData,
    value: string
  ) => {
    if (invoiceItems[index] && invoiceItems[index][field] === value) {
      return;
    }

    const updatedItems = [...invoiceItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setInvoiceItems(updatedItems);
  };

  const invoiceItemsWithIndex = React.useMemo(
    () =>
      invoiceItems.map((item, index) => ({
        ...item,
        _index: index,
      })),
    [invoiceItems]
  );

  const invoiceItemsColumns: TableColumn<
    InvoiceItemFormData & { _index: number }
  >[] = [
    {
      id: 'product_id',
      label: 'Product',
      render: (_value, row) => (
        <ProductSelect
          value={row.product_id}
          onChange={(_event, product) =>
            updateInvoiceItem(
              row._index,
              'product_id',
              product ? String(product.id) : ''
            )
          }
          size="small"
          className="!min-w-60"
        />
      ),
    },
    {
      id: 'quantity',
      label: 'Quantity',
      render: (_value, row) => (
        <Input
          value={row.quantity}
          onChange={e =>
            updateInvoiceItem(row._index, 'quantity', e.target.value)
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
            updateInvoiceItem(row._index, 'unit_price', e.target.value)
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
          onClick={() => removeInvoiceItem(row._index)}
          tooltip="Remove item"
          confirmDelete={true}
          size="medium"
          itemName="invoice item"
        />
      ),
    },
  ];

  const getCurrencyCode = (currencyId: string | number) => {
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

  const totals = React.useMemo(() => {
    const subtotal = invoiceItems.reduce(
      (sum, item) => sum + Number(item.quantity) * Number(item.unit_price),
      0
    );

    const totalAmount = subtotal;
    const balanceDue = totalAmount;

    return {
      subtotal,
      total_amount: totalAmount,
      balance_due: balanceDue,
    };
  }, [invoiceItems]);

  return (
    <CustomDrawer
      open={open}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Invoice' : 'Create Invoice'}
      size="large"
    >
      <Box className="!p-5">
        <form onSubmit={formik.handleSubmit} className="!space-y-5 mb-10">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-5">
            <Box className="md:!col-span-2">
              <Typography
                variant="h6"
                className="!font-semibold !text-gray-900"
              >
                Invoice Information
              </Typography>
            </Box>

            <Select name="parent_id" label="Order" formik={formik} required>
              {orders.map(order => (
                <MenuItem key={order.id} value={order.id}>
                  {order.order_number} - {order.customer?.name}
                </MenuItem>
              ))}
            </Select>

            <CustomerSelect
              name="customer_id"
              label="Customer"
              formik={formik}
              required
            />

            <Input
              name="invoice_date"
              label="Invoice Date"
              type="date"
              formik={formik}
              required
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <Input
              name="due_date"
              label="Due Date"
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
                </MenuItem>
              ))}
            </Select>

            <Select name="status" label="Status" formik={formik} required>
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="sent">Sent</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="overdue">Overdue</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>

            <Select
              name="payment_method"
              label="Payment Method"
              formik={formik}
              required
            >
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="credit">Credit</MenuItem>
              <MenuItem value="debit">Debit</MenuItem>
              <MenuItem value="check">Check</MenuItem>
              <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
              <MenuItem value="online">Online Payment</MenuItem>
            </Select>

            <Box className="md:!col-span-2">
              <Input
                name="billing_address"
                label="Billing Address"
                placeholder="Enter billing address"
                formik={formik}
                multiline
                rows={3}
              />
            </Box>

            <Box className="md:!col-span-2">
              <Input
                name="notes"
                label="Notes"
                placeholder="Enter invoice notes"
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
                Invoice Items
              </Typography>
              <Button
                type="button"
                variant="outlined"
                startIcon={<Plus />}
                onClick={addInvoiceItem}
                size="small"
              >
                Add Item
              </Button>
            </Box>

            {invoiceItems.length > 0 && (
              <Table
                data={invoiceItemsWithIndex}
                columns={invoiceItemsColumns}
                getRowId={row => row._index.toString()}
                pagination={false}
                sortable={false}
                emptyMessage="No invoice items added yet."
              />
            )}

            {invoiceItems.length === 0 && (
              <Box className="!text-center !py-8 !text-gray-500">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <Typography variant="body2">
                  No items added yet. Click "Add Item" to get started.
                </Typography>
              </Box>
            )}

            {invoiceItems.length > 0 && (
              <Box className="!bg-gray-50 !rounded-lg !mt-4">
                <Typography
                  variant="h6"
                  className="!font-semibold !text-gray-900 !mb-2"
                >
                  Invoice Summary
                </Typography>
                <Box className="!space-y-2">
                  <Box className="!flex !justify-between">
                    <Typography variant="subtitle2" className="!font-bold">
                      Total Amount:
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
            )}
          </Box>

          <Box className="!flex !justify-end !gap-2">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              disabled={
                createInvoiceMutation.isPending ||
                updateInvoiceMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createInvoiceMutation.isPending ||
                updateInvoiceMutation.isPending
              }
            >
              {createInvoiceMutation.isPending ||
              updateInvoiceMutation.isPending
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

export default ManageInvoice;
