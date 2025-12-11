import { Box, MenuItem, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useCurrencies } from 'hooks/useCurrencies';
import {
  useCreateCreditNote,
  useCreditNote,
  useUpdateCreditNote,
} from 'hooks/useCreditNotes';
import { useOrders } from 'hooks/useOrders';
import { useProducts } from 'hooks/useProducts';
import { Package, Plus } from 'lucide-react';
import React, { useState } from 'react';
import { creditNoteValidationSchema } from 'schemas/creditNote.schema';
import type { CreditNote } from 'services/masters/CreditNotes';
import { DeleteButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import CustomerSelect from 'shared/CustomerSelect';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import ProductSelect from 'shared/ProductSelect';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import { formatForDateInput } from 'utils/dateUtils';

interface ManageCreditNoteProps {
  open: boolean;
  onClose: () => void;
  creditNote?: CreditNote | null;
}

interface CreditNoteItemFormData {
  product_id: number | '';
  quantity: string;
  unit_price: string;
  discount_amount: string;
  tax_amount: string;
  notes: string;
}

const ManageCreditNote: React.FC<ManageCreditNoteProps> = ({
  open,
  onClose,
  creditNote,
}) => {
  const isEdit = !!creditNote;
  const [creditNoteItems, setCreditNoteItems] = useState<
    CreditNoteItemFormData[]
  >([]);

  const { data: productsResponse } = useProducts({ limit: 1000 });
  const { data: ordersResponse } = useOrders({ limit: 1000 });
  const { data: currenciesResponse } = useCurrencies({ limit: 1000 });
  const { data: creditNoteResponse } = useCreditNote(creditNote?.id || 0);

  const products = productsResponse?.data || [];
  const orders = ordersResponse?.data || [];
  const currencies = currenciesResponse?.data || [];

  const createCreditNoteMutation = useCreateCreditNote();
  const updateCreditNoteMutation = useUpdateCreditNote();

  const handleCancel = () => {
    onClose();
    setCreditNoteItems([]);
    formik.resetForm();
  };

  React.useEffect(() => {
    if (creditNote && creditNoteResponse?.data) {
      const items =
        creditNoteResponse.data.creditNoteItems?.map(item => ({
          product_id: item.product_id,
          quantity: (item as any).quantity?.toString() || '1',
          unit_price: item.unit_price?.toString() || '0',
          discount_amount: (item.discount_amount || 0).toString(),
          tax_amount: (item.tax_amount || 0).toString(),
          notes: item.notes || '',
        })) || [];
      setCreditNoteItems(items);
      formik.setFieldValue('creditNoteItems', items);

      // Update form values with properly formatted dates
      formik.setFieldValue(
        'credit_note_date',
        formatForDateInput(creditNoteResponse.data.credit_note_date)
      );
      formik.setFieldValue(
        'due_date',
        formatForDateInput(creditNoteResponse.data.due_date)
      );
    } else {
      setCreditNoteItems([]);
      formik.setFieldValue('creditNoteItems', []);
    }
  }, [creditNote, creditNoteResponse]);

  const formik = useFormik({
    initialValues: {
      parent_id: creditNote?.parent_id?.toString() || '',
      customer_id: creditNote?.customer_id?.toString() || '',
      currency_id:
        creditNote?.currency_id?.toString() ||
        currenciesResponse?.data?.[0]?.id?.toString() ||
        '',
      credit_note_date: formatForDateInput(creditNote?.credit_note_date),
      due_date: formatForDateInput(creditNote?.due_date),
      status: creditNote?.status || 'draft',
      reason: creditNote?.reason || '',
      payment_method: creditNote?.payment_method || 'credit',
      subtotal: creditNote?.subtotal || 0,
      discount_amount: creditNote?.discount_amount || 0,
      tax_amount: creditNote?.tax_amount || 0,
      shipping_amount: creditNote?.shipping_amount || 0,
      total_amount: creditNote?.total_amount || 0,
      amount_applied: creditNote?.amount_applied || 0,
      balance_due: creditNote?.balance_due || 0,
      notes: creditNote?.notes || '',
      billing_address: creditNote?.billing_address || '',
      is_active: creditNote?.is_active || 'Y',
      creditNoteItems: [],
    },
    validationSchema: creditNoteValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const submitData = {
          ...values,
          credit_note_date:
            new Date(values.credit_note_date).toISOString() || undefined,
          parent_id: Number(values.parent_id),
          customer_id: Number(values.customer_id),
          currency_id: values.currency_id
            ? Number(values.currency_id)
            : undefined,
          due_date: new Date(values.due_date).toISOString() || undefined,
          notes: values.notes || undefined,
          billing_address: values.billing_address || undefined,
          creditNoteItems: creditNoteItems
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

        if (isEdit && creditNote) {
          await updateCreditNoteMutation.mutateAsync({
            id: creditNote.id,
            ...submitData,
          });
        } else {
          await createCreditNoteMutation.mutateAsync(submitData);
        }
        handleCancel();
      } catch (error) {
        console.log('Error submitting credit note:', error);
      }
    },
  });

  const addCreditNoteItem = () => {
    const newItem: CreditNoteItemFormData = {
      product_id: '',
      quantity: '1',
      unit_price: '0',
      discount_amount: '0',
      tax_amount: '0',
      notes: '',
    };
    const updatedItems = [...creditNoteItems, newItem];
    setCreditNoteItems(updatedItems);
    formik.setFieldValue('creditNoteItems', updatedItems);
  };

  const removeCreditNoteItem = (index: number) => {
    const updatedItems = creditNoteItems.filter((_, i) => i !== index);
    setCreditNoteItems(updatedItems);
    formik.setFieldValue('creditNoteItems', updatedItems);
  };

  const updateCreditNoteItem = (
    index: number,
    field: keyof CreditNoteItemFormData,
    value: string
  ) => {
    const updatedItems = [...creditNoteItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setCreditNoteItems(updatedItems);
    formik.setFieldValue('creditNoteItems', updatedItems);
  };

  const creditNoteItemsWithIndex = creditNoteItems.map((item, index) => ({
    ...item,
    _index: index,
  }));

  const creditNoteItemsColumns: TableColumn<
    CreditNoteItemFormData & { _index: number }
  >[] = [
    {
      id: 'product_id',
      label: 'Product',
      render: (_value, row) => (
        <ProductSelect
          value={row.product_id}
          onChange={(_event, product) =>
            updateCreditNoteItem(row._index, 'product_id', product ? product.id.toString() : '')
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
            updateCreditNoteItem(row._index, 'quantity', e.target.value)
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
            updateCreditNoteItem(row._index, 'unit_price', e.target.value)
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
            updateCreditNoteItem(row._index, 'discount_amount', e.target.value)
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
            updateCreditNoteItem(row._index, 'tax_amount', e.target.value)
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
          onClick={() => removeCreditNoteItem(row._index)}
          tooltip="Remove item"
          confirmDelete={true}
          size="medium"
          itemName="credit note item"
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

  const calculateCreditNoteTotals = () => {
    const subtotal = creditNoteItems.reduce(
      (sum, item) => sum + Number(item.quantity) * Number(item.unit_price),
      0
    );
    const discountAmount = creditNoteItems.reduce(
      (sum, item) => sum + Number(item.discount_amount),
      0
    );
    const taxAmount = creditNoteItems.reduce(
      (sum, item) => sum + Number(item.tax_amount),
      0
    );
    const shippingAmount = 0;
    const totalAmount = subtotal - discountAmount + taxAmount + shippingAmount;
    const amountApplied = 0;
    const balanceDue = totalAmount - amountApplied;

    return {
      subtotal,
      discount_amount: discountAmount,
      tax_amount: taxAmount,
      shipping_amount: shippingAmount,
      total_amount: totalAmount,
      amount_applied: amountApplied,
      balance_due: balanceDue,
    };
  };

  const totals = calculateCreditNoteTotals();

  return (
    <CustomDrawer
      open={open}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Credit Note' : 'Create Credit Note'}
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
                Credit Note Information
              </Typography>
            </Box>

            <Select
              name="parent_id"
              label="Related Order"
              formik={formik}
              required
            >
              {orders.map(order => (
                <MenuItem key={order.id} value={order.id?.toString() || ''}>
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
              name="credit_note_date"
              label="Credit Note Date"
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
              required
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <Select
              name="currency_id"
              label="Currency"
              formik={formik}
              required
            >
              {currencies.map(currency => (
                <MenuItem
                  key={currency.id}
                  value={currency.id?.toString() || ''}
                >
                  {currency.code} - {currency.name}
                </MenuItem>
              ))}
            </Select>

            <Select name="status" label="Status" formik={formik} required>
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>

            <Input
              name="reason"
              label="Reason"
              placeholder="Enter reason for credit note"
              formik={formik}
              required
            />

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
                placeholder="Enter credit note notes"
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
                Credit Note Items
              </Typography>
              <Button
                type="button"
                variant="outlined"
                startIcon={<Plus />}
                onClick={addCreditNoteItem}
                size="small"
              >
                Add Item
              </Button>
            </Box>

            {creditNoteItems.length > 0 && (
              <Table
                data={creditNoteItemsWithIndex}
                columns={creditNoteItemsColumns}
                getRowId={row => row._index.toString()}
                pagination={false}
                sortable={false}
                emptyMessage="No credit note items added yet."
              />
            )}

            {creditNoteItems.length === 0 && (
              <Box className="!text-center !py-8 !text-gray-500">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <Typography variant="body2">
                  No items added yet. Click "Add Item" to get started.
                </Typography>
              </Box>
            )}

            {creditNoteItems.length > 0 && (
              <Box className="!bg-gray-50 !rounded-lg !mt-4">
                <Typography
                  variant="h6"
                  className="!font-semibold !text-gray-900 !mb-2"
                >
                  Credit Note Summary
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
                  <Box className="!flex !justify-between">
                    <Typography variant="body2">Amount Applied:</Typography>
                    <Typography variant="body2">
                      {formatCurrency(
                        totals.amount_applied,
                        getCurrencyCode(formik.values.currency_id)
                      )}
                    </Typography>
                  </Box>
                  <Box className="!border-t !border-gray-300 !pt-2 !mt-2">
                    <Box className="!flex !justify-between">
                      <Typography variant="subtitle2" className="!font-bold">
                        Balance Due:
                      </Typography>
                      <Typography variant="subtitle2" className="!font-bold">
                        {formatCurrency(
                          totals.balance_due,
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
                createCreditNoteMutation.isPending ||
                updateCreditNoteMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createCreditNoteMutation.isPending ||
                updateCreditNoteMutation.isPending
              }
            >
              {createCreditNoteMutation.isPending ||
              updateCreditNoteMutation.isPending
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

export default ManageCreditNote;
