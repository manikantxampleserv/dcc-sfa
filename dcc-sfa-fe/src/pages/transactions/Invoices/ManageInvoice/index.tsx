import { Tag } from '@mui/icons-material';
import { Box, MenuItem, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useCurrencies } from 'hooks/useCurrencies';
import { useInventoryItemById } from 'hooks/useInventoryItems';
import { useCreateInvoice, useInvoice, useUpdateInvoice } from 'hooks/useInvoices';
import { useOrder, useOrders } from 'hooks/useOrders';
import { usePriceListByCustomer, type CustomerPriceListResult } from 'hooks/usePriceLists';
import { Plus } from 'lucide-react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { toast } from 'react-toastify';
import { invoiceValidationSchema } from 'schemas/invoice.schema';
import type { Invoice } from 'services/masters/Invoices';
import type {
  ProductBatch,
  ProductSerial,
} from 'services/masters/VanInventory';
import type { SerialInfo } from 'services/masters/VanInventoryItems';
import { DeleteButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import CustomerSelect from 'shared/CustomerSelect';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import SalesItemsSelect from 'shared/SalesItemsSelect';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import UserSelect from 'shared/UserSelect';
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

  const lastLoadedInvoiceId = useRef<number | null>(null);

  const { data: ordersResponse } = useOrders({ limit: 1000 });
  const { data: currenciesResponse } = useCurrencies({ limit: 1000 });
  const { data: invoiceResponse, isFetching } = useInvoice(invoice?.id || 0);

  const currencies = currenciesResponse?.data || [];
  const orders = ordersResponse?.data || [];

  const invoiceData = invoice?.id ? invoiceResponse?.data || invoice : null;

  const createInvoiceMutation = useCreateInvoice();
  const updateInvoiceMutation = useUpdateInvoice();

  const formik = useFormik({
    initialValues: {
      invoice_method: invoiceData?.invoice_method || 'order',
      parent_id: invoiceData?.parent_id || '',
      salesperson_id: invoiceData?.salesperson_id?.toString() || '',
      customer_id: invoiceData?.customer_id || '',
      currency_id:
        invoiceData?.currency_id ||
        (currencies.length > 0 ? currencies[0].id.toString() : ''),
      invoice_date: invoiceData?.invoice_date
        ? dayjs(invoiceData.invoice_date).format('YYYY-MM-DD')
        : dayjs().format('YYYY-MM-DD'),
      due_date: invoiceData?.due_date
        ? dayjs(invoiceData.due_date).format('YYYY-MM-DD')
        : '',
      status: invoiceData?.status || 'paid',
      payment_method: invoiceData?.payment_method || 'cash',
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

          if (!item.product_id) {
            toast.error(`Item ${i + 1}: Please select a product`);
            return;
          }

          if (!item.quantity || Number(item.quantity) <= 0) {
            toast.error(`Item ${i + 1}: Please enter a valid quantity`);
            return;
          }

          const quantity = Number(item.quantity);
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
                `Item ${i + 1}: Please allocate batch quantities to match the invoice quantity.`
              );
              return;
            }
            if (totalBatchQty !== quantity) {
              toast.error(
                `Item ${i + 1}: Batch quantity mismatch (${totalBatchQty}/${quantity}).`
              );
              return;
            }
          }

          if (trackingType === 'serial' && quantity > 0) {
            const allSerials = (item.product_serials ||
              []) as (ProductSerial & {
              selected?: boolean;
            })[];
            const selectedSerials = allSerials.filter(
              s => s.selected !== false
            );

            if (selectedSerials.length === 0) {
              toast.error(
                `Item ${i + 1}: Please assign serial numbers to match the invoice quantity.`
              );
              return;
            }
            if (selectedSerials.length !== quantity) {
              toast.error(
                `Item ${i + 1}: Serial count mismatch (${selectedSerials.length}/${quantity}).`
              );
              return;
            }

            const trimmedSerials = selectedSerials.map(s =>
              (s.serial_number || '').trim().toLowerCase()
            );
            if (trimmedSerials.some(s => !s)) {
              toast.error(
                `Item ${i + 1}: Serial number is required for all selected rows.`
              );
              return;
            }

            const seen = new Set<string>();
            for (const s of trimmedSerials) {
              if (seen.has(s)) {
                toast.error(`Item ${i + 1}: Duplicate serial number "${s}".`);
                return;
              }
              seen.add(s);
            }
          }
        }
        const submitData = {
          ...values,
          invoice_date: new Date(values.invoice_date).toISOString(),
          parent_id: values.parent_id ? Number(values.parent_id) : null,
          invoice_method: values.invoice_method,
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
          amount_paid: values.status === 'paid' ? totals.total_amount : 0,
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
      } catch (error: any) {
        console.error('Error submitting invoice:', error);
        toast.error(error.message || 'Failed to save invoice');
      }
    },
  });

  const totals = React.useMemo(() => {
    const subtotal = invoiceItems.reduce(
      (sum, item) => sum + Number(item.quantity) * Number(item.unit_price),
      0
    );

    const totalAmount = subtotal;
    // If status is paid, balance due should be 0, otherwise it's the total amount
    const balanceDue = formik.values.status === 'paid' ? 0 : totalAmount;

    return {
      subtotal,
      total_amount: totalAmount,
      balance_due: balanceDue,
    };
  }, [invoiceItems, formik.values.status]);

  const salespersonId = formik.values.salesperson_id
    ? Number(formik.values.salesperson_id)
    : 0;

  const { data: customerPriceLists } = usePriceListByCustomer(
    formik.values.customer_id || undefined,
    formik.values.invoice_date || undefined,
    { enabled: open }
  );

  /**
   * Resolves the effective unit_price for a product from the SP pricelist result.
   * Priority: customer special → route/category special → base pricelist price.
   */
  const resolvePrice = (
    productId: number,
    priceLists: CustomerPriceListResult[] | undefined
  ): string | null => {
    if (!priceLists || priceLists.length === 0) return null;

    const customerId = Number(formik.values.customer_id);

    for (const pl of priceLists) {
      const item = pl.pricelist_items?.find(i => i.product_id === productId);
      if (!item) continue;

      const specials = item.special_prices ?? [];

      // 1. Customer-specific price
      const customerSp = specials.find(sp => sp.customer_id === customerId);
      if (customerSp) return String(customerSp.sale_price);

      // 2. Route or category special price
      const otherSp = specials.find(
        sp => sp.route_id != null || sp.customer_category_id != null
      );
      if (otherSp) return String(otherSp.sale_price);

      // 3. Base pricelist item price
      return String(item.unit_price);
    }

    return null;
  };

  const { data: salespersonInventoryData } = useInventoryItemById(
    salespersonId,
    { enabled: !!salespersonId && open }
  );

  const inventoryByProductId = useMemo(() => {
    const map: Record<
      number,
      { batches: ProductBatch[]; serials: ProductSerial[] }
    > = {};

    if (!salespersonInventoryData?.data?.products) return map;

    salespersonInventoryData.data.products.forEach(product => {
      const batches: ProductBatch[] = (product.batches || []).map(
        (batch: any) => ({
          ...batch,
          batch_remaining_quantity: batch.remaining_quantity,
          quantity: null,
        })
      );

      const convertedSerials: ProductSerial[] = (product.serials || []).map(
        (serial: SerialInfo) => ({
          id: serial.serial_id,
          product_id: product.product_id,
          serial_number: serial.serial_number,
          quantity: 1,
          is_active: 'Y',
        })
      );
      map[product.product_id] = {
        batches,
        serials: convertedSerials,
      };
    });

    return map;
  }, [salespersonInventoryData]);

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
      formik.values.parent_id
    ) {
      const order = selectedOrderResponse.data;

      if (order.customer?.id) {
        formik.setFieldValue('customer_id', order.customer.id);
      }

      if (order.salesperson_id) {
        formik.setFieldValue('salesperson_id', order.salesperson_id.toString());
      }

      if (order.currency_id) {
        formik.setFieldValue('currency_id', order.currency_id.toString());
      }

      if (order.order_date) {
        const orderDate = dayjs(order.order_date);
        formik.setFieldValue('invoice_date', orderDate.format('YYYY-MM-DD'));
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
        formik.setFieldValue('invoice_items', items, false);
        formikSyncRef.current = JSON.stringify(items);
      }
    }
  }, [
    selectedOrderResponse?.data,
    formik.values.invoice_method,
    formik.values.parent_id,
  ]);

  const addInvoiceItem = () => {
    if (!formik.values.salesperson_id) {
      toast.error('Please select a Salesperson');
      return;
    }

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
    formik.setFieldValue('invoice_items', updatedItems, false);
    formikSyncRef.current = JSON.stringify(updatedItems);
  };

  const removeInvoiceItem = (index: number) => {
    const updatedItems = invoiceItems.filter((_, i) => i !== index);
    setInvoiceItems(updatedItems);
    formik.setFieldValue('invoice_items', updatedItems, false);
    formikSyncRef.current = JSON.stringify(updatedItems);
  };

  const updateInvoiceItem = (
    index: number,
    field: keyof InvoiceItemFormData,
    value: any
  ) => {
    const updatedItems = [...invoiceItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setInvoiceItems(updatedItems);
    formik.setFieldValue('invoice_items', updatedItems, false);
    formikSyncRef.current = JSON.stringify(updatedItems);
  };

  const handleProductChange = useCallback(
    (rowIndex: number, _event: any, product: any) => {
      const updatedItems = [...invoiceItems];
      const trackingType = product?.tracking_type || null;
      const trackingLower = trackingType ? trackingType.toLowerCase() : null;
      const isBatchOrSerial =
        trackingLower === 'batch' || trackingLower === 'serial';

      const resolvedPrice = product
        ? resolvePrice(product.product_id, customerPriceLists) ??
          String(product.unit_price)
        : '0';

      updatedItems[rowIndex] = {
        ...updatedItems[rowIndex],
        product_id: product ? product.product_id : '',
        product_name: product ? product.name : '',
        tracking_type: trackingType,
        unit_price: resolvedPrice,
        quantity:
          product && isBatchOrSerial
            ? '0'
            : updatedItems[rowIndex].quantity || '1',
        product_batches: [],
        product_serials: [],
      };

      setInvoiceItems(updatedItems);
      formik.setFieldValue('invoice_items', updatedItems, false);
      formikSyncRef.current = JSON.stringify(updatedItems);
    },
    [invoiceItems, customerPriceLists, formik.values.customer_id]
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
        <SalesItemsSelect
          salespersonId={Number(formik.values.salesperson_id)}
          value={row.product_id}
          onChange={(_event, product) =>
            handleProductChange(row._index, _event, product)
          }
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
              className={`!text-gray-700 !uppercase !text-xs`}
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
                  const item = invoiceItems[index];
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
              disableClearable
              onChange={e => {
                const newMethod = e.target.value;
                formik.setFieldValue('invoice_method', newMethod);
                formik.setFieldValue('parent_id', '');
                formik.setFieldValue('customer_id', '');
                formik.setFieldValue('salesperson_id', '');
                formik.setFieldValue('invoice_items', []);
                setInvoiceItems([]);
                formikSyncRef.current = '';
              }}
            >
              <MenuItem value="order">Based of Order</MenuItem>
              <MenuItem value="direct">Direct Invoice</MenuItem>
            </Select>

            {formik.values.invoice_method === 'order' && (
              <Select
                name="parent_id"
                label="Order"
                formik={formik}
                onChange={e => {
                  const selectedOrderId = e.target.value;
                  if (!selectedOrderId) {
                    formik.setFieldValue('customer_id', '');
                    formik.setFieldValue('salesperson_id', '');
                    formik.setFieldValue('invoice_items', []);
                    setInvoiceItems([]);
                    formikSyncRef.current = '';
                  }
                }}
              >
                {orders.map(order => (
                  <MenuItem key={order.id} value={order.id}>
                    {order.order_number} - {order.customer?.name}
                  </MenuItem>
                ))}
              </Select>
            )}
            <CustomerSelect
              name="customer_id"
              label="Customer"
              formik={formik}
              required
              disabled={
                formik.values.invoice_method === 'order' &&
                !!formik.values.parent_id
              }
            />

            <UserSelect
              name="salesperson_id"
              label="Salesperson"
              formik={formik}
              required
              disabled={
                formik.values.invoice_method === 'order' &&
                !!formik.values.parent_id
              }
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

            {/* <Select
              name="currency_id"
              label="Currency"
              formik={formik}
              required
            >
              {currencies.map(currency => (
                <MenuItem key={currency.id} value={currency.id}>
                  {currency.code}
                </MenuItem>
              ))}
            </Select> */}

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
              <MenuItem value="cheque">Cheque</MenuItem>
              <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
            </Select>
          </Box>

          <Input
            name="notes"
            label="Notes"
            multiline
            rows={3}
            formik={formik}
          />

          <Input
            name="billing_address"
            label="Billing Address"
            multiline
            rows={2}
            formik={formik}
          />

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
              loading={
                isFetching ||
                createInvoiceMutation.isPending ||
                updateInvoiceMutation.isPending
              }
              sortable={false}
              emptyMessage='No items added yet. Click "Add Item" to get started.'
            />
          </Box>

          <Box className="!flex !justify-end !gap-3 !mt-6">
            <Button variant="outlined" color="info" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" type="submit">
              {isEdit ? 'Update' : 'Create'} Invoice
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
        inventoryByProductId={inventoryByProductId}
      />
      <ManageInvoiceSerial
        isOpen={isSerialSelectorOpen}
        setIsOpen={setIsSerialSelectorOpen}
        selectedRowIndex={selectedRowIndex}
        setSelectedRowIndex={setSelectedRowIndex}
        invoiceItems={invoiceItems}
        setInvoiceItems={setInvoiceItems}
        inventoryByProductId={inventoryByProductId}
      />
    </CustomDrawer>
  );
};

export default ManageInvoice;
