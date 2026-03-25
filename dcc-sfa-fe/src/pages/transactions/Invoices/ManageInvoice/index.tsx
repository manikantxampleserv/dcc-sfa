import { Tag } from '@mui/icons-material';
import { Box, MenuItem, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useCurrencies } from 'hooks/useCurrencies';
import {
  useCreateInvoice,
  useInvoice,
  useUpdateInvoice,
} from 'hooks/useInvoices';
import { useOrders, useOrder } from 'hooks/useOrders';
import type { ProductBatch, ProductSerial } from 'hooks/useVanInventory';
import { Package, Plus } from 'lucide-react';
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { toast } from 'react-toastify';
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
import ManageInvoiceBatch from './ManageInvoiceBatch';
import ManageInvoiceSerial from './ManageInvoiceSerial';

interface ManageInvoiceProps {
  open: boolean;
  onClose: () => void;
  invoice?: Invoice | null;
}

export interface InvoiceItemFormData {
  product_id: number | '';
  product_name?: string;
  tracking_type?: string | null;
  quantity: string;
  unit_price: string;
  notes: string;
  product_batches?: ProductBatch[];
  product_serials?: ProductSerial[];
}

const ManageInvoice: React.FC<ManageInvoiceProps> = ({
  open,
  onClose,
  invoice,
}) => {
  const isEdit = !!invoice;
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItemFormData[]>([]);
  const [isBatchSelectorOpen, setIsBatchSelectorOpen] = useState(false);
  const [isSerialSelectorOpen, setIsSerialSelectorOpen] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);

  // Track the last loaded invoice ID to prevent unnecessary updates
  const lastLoadedInvoiceId = useRef<number | null>(null);

  const { data: ordersResponse } = useOrders({ limit: 1000 });
  const { data: currenciesResponse } = useCurrencies({ limit: 1000 });
  const { data: invoiceResponse } = useInvoice(invoice?.id || 0);

  const currencies = currenciesResponse?.data || [];
  const orders = ordersResponse?.data || [];

  const invoiceData = invoiceResponse?.data || invoice;

  const createInvoiceMutation = useCreateInvoice();
  const updateInvoiceMutation = useUpdateInvoice();

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

  const formik = useFormik({
    initialValues: {
      invoice_method: 'order',
      parent_id: invoiceData?.parent_id || '',
      customer_id: invoiceData?.customer_id || '',
      currency_id:
        invoiceData?.currency_id ||
        (currencies.length > 0 ? currencies[0].id.toString() : ''),
      invoice_date:
        invoiceData?.invoice_date?.split('T')[0] ||
        dayjs().format('DD/MM/YYYY'),
      due_date: invoiceData?.due_date ? invoiceData.due_date.split('T')[0] : '',
      status: invoiceData?.status || 'draft',
      payment_method: invoiceData?.payment_method || 'credit',
      subtotal: invoiceData?.subtotal || 0,
      total_amount: invoiceData?.total_amount || 0,
      balance_due: invoiceData?.balance_due || 0,
      notes: invoiceData?.notes || '',
      billing_address: invoiceData?.billing_address || '',
      is_active: invoiceData?.is_active || 'Y',
      invoice_items: [],
    },
    validationSchema: invoiceValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        if (invoiceItems?.length === 0) {
          toast.error('Please add at least one item to the invoice.');
          return;
        }

        // Validation for batches and serials
        for (let i = 0; i < invoiceItems.length; i += 1) {
          const item = invoiceItems[i];
          const quantity = Number(item.quantity);
          const trackingType = (item.tracking_type || '').toLowerCase();

          if (trackingType === 'batch' && quantity > 0) {
            const totalBatchQty = (item.product_batches || []).reduce(
              (sum, b) => sum + (Number(b.quantity) || 0),
              0
            );
            if (totalBatchQty !== quantity) {
              toast.error(
                `Item ${i + 1}: Batch quantity mismatch (${totalBatchQty}/${quantity}).`
              );
              return;
            }
          }

          if (trackingType === 'serial' && quantity > 0) {
            const selectedSerials = (item.product_serials || []).filter(
              (s: any) => s.selected !== false
            );
            if (selectedSerials.length !== quantity) {
              toast.error(
                `Item ${i + 1}: Serial count mismatch (${selectedSerials.length}/${quantity}).`
              );
              return;
            }
          }
        }

        const submitData = {
          ...values,
          invoice_date: dayjs(values.invoice_date, 'DD/MM/YYYY').toISOString(),
          parent_id: Number(values.parent_id),
          invoice_method: values.invoice_method,
          customer_id: Number(values.customer_id),
          currency_id: values.currency_id
            ? Number(values.currency_id)
            : undefined,
          due_date: values.due_date
            ? dayjs(values.due_date, 'DD/MM/YYYY').toISOString()
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
              tracking_type: item.tracking_type,
              product_batches: item.product_batches,
              product_serials: item.product_serials,
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

  const selectedOrderId = Number(formik.values.parent_id);
  const { data: selectedOrderResponse } = useOrder(
    formik.values.invoice_method === 'order' ? selectedOrderId : 0
  );

  const initialParentId = useRef<number | string | null>(
    invoice?.parent_id || null
  );

  const formikSyncRef = useRef<string>('');
  const invoiceItemsStr = useMemo(
    () => JSON.stringify(invoiceItems),
    [invoiceItems]
  );

  useEffect(() => {
    if (!open) return;

    const currentFormikStr = JSON.stringify(formik.values.invoice_items || []);

    if (
      invoiceItemsStr !== currentFormikStr &&
      formikSyncRef.current !== invoiceItemsStr
    ) {
      formik.setFieldValue('invoice_items', invoiceItems, false);
      formikSyncRef.current = invoiceItemsStr;
    }
  }, [open, invoiceItemsStr]);

  const handleCancel = () => {
    onClose();
    setInvoiceItems([]);
    formik.resetForm();
    (lastLoadedInvoiceId as React.MutableRefObject<number | null>).current =
      null;
    initialParentId.current = null;
    setSelectedRowIndex(null);
  };

  useEffect(() => {
    const currentInvoiceId = invoice?.id;

    if (currentInvoiceId !== lastLoadedInvoiceId.current) {
      if (invoice && invoiceResponse?.data) {
        const items =
          invoiceResponse.data.invoice_items?.map(item => ({
            product_id: item.product_id,
            product_name: item.product_name || '',
            tracking_type: item.tracking_type || null,
            quantity: item.quantity.toString(),
            unit_price: item.unit_price.toString(),
            notes: item.notes || '',
            product_batches: item.product_batches || [],
            product_serials: item.product_serials || [],
          })) || [];
        setInvoiceItems(items);
        (lastLoadedInvoiceId as React.MutableRefObject<number | null>).current =
          currentInvoiceId ?? null;
        initialParentId.current = invoice.parent_id;
      } else if (!invoice) {
        setInvoiceItems([]);
        (lastLoadedInvoiceId as React.MutableRefObject<number | null>).current =
          null;
        initialParentId.current = null;
      }
    }
  }, [invoice?.id, invoiceResponse?.data]);

  useEffect(() => {
    if (
      formik.values.invoice_method === 'order' &&
      selectedOrderResponse?.data &&
      (formik.values.parent_id !== initialParentId.current || !isEdit)
    ) {
      const order = selectedOrderResponse.data;

      if (order.customer?.id) {
        formik.setFieldValue('customer_id', order.customer.id);
      }

      if (order.currency_id) {
        formik.setFieldValue('currency_id', order.currency_id.toString());
      }

      if (order.order_date) {
        const orderDate = dayjs(order.order_date);
        formik.setFieldValue('invoice_date', orderDate.format('DD/MM/YYYY'));
      }

      if (order.order_items && order.order_items.length > 0) {
        const items = order.order_items.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name || '',
          tracking_type: item.tracking_type || null,
          quantity: item.quantity.toString(),
          unit_price: item.unit_price.toString(),
          notes: item.notes || '',
          product_batches: item.product_batches || [],
          product_serials: item.product_serials || [],
        }));
        setInvoiceItems(items);
      }
    }
  }, [
    selectedOrderResponse?.data,
    formik.values.invoice_method,
    formik.values.parent_id,
    isEdit,
  ]);

  const addInvoiceItem = () => {
    const newItem: InvoiceItemFormData = {
      product_id: '',
      product_name: '',
      tracking_type: null,
      quantity: '1',
      unit_price: '0',
      notes: '',
      product_batches: [],
      product_serials: [],
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

  const handleProductChange = useCallback(
    (rowIndex: number, _event: any, product: any) => {
      const updatedItems = [...invoiceItems];
      const trackingType = product?.tracking_type || null;
      const trackingLower = trackingType ? trackingType.toLowerCase() : null;
      const isBatchOrSerial =
        trackingLower === 'batch' || trackingLower === 'serial';

      updatedItems[rowIndex] = {
        ...updatedItems[rowIndex],
        product_id: product ? product.id : '',
        product_name: product ? product.name : '',
        tracking_type: trackingType,
        unit_price: product ? String(product.unit_price) : '0',
        quantity:
          product && isBatchOrSerial
            ? '0'
            : updatedItems[rowIndex].quantity || '1',
        product_batches: [],
        product_serials: [],
      };

      setInvoiceItems(updatedItems);
    },
    [invoiceItems]
  );

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
            handleProductChange(row._index, _event, product)
          }
          size="small"
          className="!min-w-60"
        />
      ),
    },
    {
      id: 'tracking_type',
      label: 'Tracking',
      render: (_value, row) => {
        const tracking = (row.tracking_type || '').toLowerCase();
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
                  setSelectedRowIndex(row._index);
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
        const tracking = (row.tracking_type || '').toLowerCase();
        const isNoneTracking = !tracking || tracking === 'none';
        return (
          <Input
            value={row.quantity}
            onChange={e =>
              updateInvoiceItem(row._index, 'quantity', e.target.value)
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
            <Select
              name="invoice_method"
              label="Invoice Method"
              formik={formik}
            >
              <MenuItem value="order">Based of Order</MenuItem>
              <MenuItem value="direct">Direct Invoice</MenuItem>
            </Select>

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

            <Table
              data={invoiceItemsWithIndex}
              columns={invoiceItemsColumns}
              getRowId={row => row._index.toString()}
              pagination={false}
              sortable={false}
              emptyMessage="No invoice items added yet."
            />

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
      <ManageInvoiceBatch
        isOpen={isBatchSelectorOpen}
        setIsOpen={setIsBatchSelectorOpen}
        selectedRowIndex={selectedRowIndex}
        setSelectedRowIndex={setSelectedRowIndex}
        invoiceItems={invoiceItems}
        setInvoiceItems={setInvoiceItems}
      />
      <ManageInvoiceSerial
        isOpen={isSerialSelectorOpen}
        setIsOpen={setIsSerialSelectorOpen}
        selectedRowIndex={selectedRowIndex}
        setSelectedRowIndex={setSelectedRowIndex}
        invoiceItems={invoiceItems}
        setInvoiceItems={setInvoiceItems}
      />
    </CustomDrawer>
  );
};

export default ManageInvoice;
