import { Tag } from '@mui/icons-material';
import { Box, MenuItem, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useCurrencies } from 'hooks/useCurrencies';
import {
  useInventoryItemById,
  type SalespersonInventoryData,
} from 'hooks/useInventoryItems';
import {
  useCreateInvoice,
  useInvoice,
  useUpdateInvoice,
} from 'hooks/useInvoices';
import { useOrder, useOrders } from 'hooks/useOrders';
import {
  usePriceListByCustomer,
  type CustomerPriceListResult,
} from 'hooks/usePriceLists';
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
  unit: 'CASE' | 'PIECE';
  uom?: 'CASE' | 'PIECE';
  tracking_type?: string | null;
  quantity: string;
  base_quantity?: number;
  unit_price: string;
  notes: string;
  product_batches?: ProductBatch[];
  product_serials?: ProductSerial[];
  conversion_rate?: number;
  isLoaded?: boolean;
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
      invoiceItems: [],
    },
    validationSchema: invoiceValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        if (invoiceItems?.length === 0) {
          toast.error('Please add at least one item to the invoice.');
          return;
        }

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

        const appliedPricelistId =
          customerPriceLists && customerPriceLists.length > 0
            ? (customerPriceLists[0].pricelist_id ?? null)
            : null;

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
          pricelist_id: appliedPricelistId,
          invoiceItems: invoiceItems
            .filter(item => item.product_id !== '')
            .map(item => {
              const unitPrice = Number(item.unit_price) || 0;
              const quantity = Number(item.quantity) || 0;
              const conversionRate = item.conversion_rate || 1;

              return {
                tracking_type: item.tracking_type || null,
                product_id: Number(item.product_id),
                product_name: item.product_name || undefined,
                uom: item.unit || undefined,
                unit: item.unit || undefined,
                quantity: quantity,
                unit_price: unitPrice,
                notes: item.notes,
                product_batches: item.product_batches || [],
                product_serials: item.product_serials,
                conversion_factor: conversionRate,
              };
            }),
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

  const { data: salespersonInventoryData } = useInventoryItemById(
    salespersonId,
    { enabled: !!salespersonId && open }
  );

  /**
   * Get product conversion rate from inventory data
   */
  const getProductConversionRate = useCallback(
    (productId: number): number => {
      if (!salespersonInventoryData?.data) return 1;
      const responseData = salespersonInventoryData.data;
      const salespersonData = responseData as SalespersonInventoryData;
      const product = salespersonData.products?.find(
        p => p.product_id === productId
      );
      return product?.product_unit_of_measurement?.conversion_rate ?? 1;
    },
    [salespersonInventoryData]
  );

  /**
   * Resolves the effective unit_price for a product from the SP pricelist result.
   * Only uses price list API pricing - no fallback to product base prices.
   * For CASE: uses unit_price from price list.
   * For PIECE: uses sub_unit_price from price list, falls back to calculated price.
   */
  const resolvePrice = (
    productId: number,
    priceLists: CustomerPriceListResult[] | undefined,
    unit: 'CASE' | 'PIECE' = 'CASE',
    conversionRate: number = 24
  ): string | null => {
    if (!priceLists || priceLists.length === 0) return null;

    const customerId = Number(formik.values.customer_id);

    for (const pl of priceLists) {
      const item = pl.pricelist_items?.find(i => i.product_id === productId);
      if (!item) continue;

      const specials = item.special_prices ?? [];

      // 1. Customer-specific price
      const customerSp = specials.find(sp => sp.customer_id === customerId);
      if (customerSp) {
        if (unit === 'PIECE') {
          const piecePrice = Number(customerSp.sale_price) / conversionRate;
          return String(piecePrice.toFixed(2));
        }
        return String(customerSp.sale_price);
      }

      // 2. Route or category special price
      const otherSp = specials.find(
        sp => sp.route_id != null || sp.customer_category_id != null
      );
      if (otherSp) {
        if (unit === 'PIECE') {
          const piecePrice = Number(otherSp.sale_price) / conversionRate;
          return String(piecePrice.toFixed(2));
        }
        return String(otherSp.sale_price);
      }

      // 3. Base pricelist item price
      if (unit === 'PIECE') {
        // Use sub_unit_price if available, otherwise calculate
        const subUnitPrice = item.sub_unit_price;
        if (subUnitPrice) {
          return String(subUnitPrice);
        }
        // Fallback: calculate from unit_price
        const casePrice = Number(item.unit_price);
        if (!isNaN(casePrice)) {
          const piecePrice = casePrice / conversionRate;
          return String(piecePrice.toFixed(2));
        }
      }
      return String(item.unit_price);
    }

    return null;
  };

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

    const currentFormikStr = JSON.stringify(formik.values.invoiceItems || []);

    if (
      invoiceItemsStr !== currentFormikStr &&
      formikSyncRef.current !== invoiceItemsStr
    ) {
      formik.setFieldValue('invoiceItems', invoiceItems, false);
      formikSyncRef.current = invoiceItemsStr;
    }
  }, [open, invoiceItemsStr]);

  useEffect(() => {
    if (invoiceItems.length > 0 && !formik.values.customer_id) {
      const updatedItems = invoiceItems.map(item => ({
        ...item,
        unit_price: '0',
      }));
      setInvoiceItems(updatedItems);
      formik.setFieldValue('invoiceItems', updatedItems, false);
      formikSyncRef.current = JSON.stringify(updatedItems);
    } else if (
      invoiceItems.length > 0 &&
      formik.values.customer_id &&
      customerPriceLists
    ) {
      const updatedItems = invoiceItems.map(item => {
        if (!item.product_id) return item;
        const unit = item.unit || item.uom || 'CASE';
        const conversionRate = getProductConversionRate(
          item.product_id as number
        );
        const resolvedPrice =
          resolvePrice(
            item.product_id as number,
            customerPriceLists,
            unit,
            conversionRate
          ) ?? '0';

        return {
          ...item,
          unit_price: resolvedPrice,
          conversion_rate: conversionRate,
        };
      });
      setInvoiceItems(updatedItems);
      formik.setFieldValue('invoiceItems', updatedItems, false);
      formikSyncRef.current = JSON.stringify(updatedItems);
    }
  }, [
    formik.values.customer_id,
    formik.values.invoice_date,
    customerPriceLists,
    invoiceItems,
    getProductConversionRate,
  ]);

  const handleCancel = () => {
    onClose();
    setInvoiceItems([]);
    formik.resetForm();
    (lastLoadedInvoiceId as React.MutableRefObject<number | null>).current =
      null;
    initialParentId.current = null;
    setSelectedRowIndex(null);
    setIsBatchSelectorOpen(false);
    setIsSerialSelectorOpen(false);
  };

  useEffect(() => {
    const currentInvoiceId = invoice?.id;

    if (currentInvoiceId !== lastLoadedInvoiceId.current) {
      if (invoice && invoiceResponse?.data) {
        const items =
          invoiceResponse.data.invoice_items?.map(item => {
            const conversionRate = item.conversion_factor || 1;
            let displayQuantity = item.quantity;

            if (item.unit === 'PIECE') {
              displayQuantity = (item.base_quantity || 0) * conversionRate;
            }

            return {
              product_id: item.product_id,
              product_name: item.product_name || '',
              unit: item.unit || 'CASE',
              tracking_type: item.tracking_type || null,
              quantity: displayQuantity.toString(),
              base_quantity: item.base_quantity || 0,
              unit_price: item.unit_price.toString(),
              notes: item.notes || '',
              isLoaded: true,
              product_batches:
                item.product_batches?.map(batch => ({
                  ...batch,
                  quantity:
                    item.unit === 'PIECE'
                      ? (batch.quantity || 0) * conversionRate
                      : batch.quantity || 0,
                })) || [],
              product_serials: item.product_serials || [],
              conversion_rate: conversionRate,
            };
          }) || [];
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

      if (order.id !== Number(formik.values.parent_id)) {
        return;
      }

      if (order.customer?.id) {
        formik.setFieldValue('customer_id', order.customer.id);
      }

      if (order.salesperson_id) {
        formik.setFieldValue('salesperson_id', order.salesperson_id.toString());
      }

      const currencyId = order.currency_id || order.currency?.id;
      if (currencyId) {
        formik.setFieldValue('currency_id', currencyId.toString());
      }

      if (order.order_date) {
        const orderDate = dayjs(order.order_date);
        formik.setFieldValue('invoice_date', orderDate.format('YYYY-MM-DD'));
      }

      if (order.order_items && order.order_items.length > 0) {
        const items = order.order_items.map(item => {
          const conversionRate = item.conversion_factor || 1;
          let displayQuantity = item.quantity;

          if (item.unit === 'PIECE') {
            displayQuantity = (item.base_quantity || 0) * (item.conversion_factor || 1);
          }
          console.log(item.product_batches, 'mkx');

          return {
            product_id: item.product_id,
            product_name: item.product_name || '',
            unit: item.unit || 'CASE',
            tracking_type: item.tracking_type || null,
            quantity: displayQuantity.toString(),
            base_quantity: item.base_quantity || 0,
            unit_price: item.unit_price.toString(),
            notes: item.notes || '',
            product_batches:
              item.product_batches?.map(batch => ({
                ...batch,
                quantity: Number(batch.quantity) || 0,
              })) || [],
            product_serials: item.product_serials || [],
            conversion_rate: conversionRate,
            isLoaded: true,
          };
        });
        setInvoiceItems(items);
        formik.setFieldValue('invoiceItems', items, false);
        formikSyncRef.current = JSON.stringify(items);
      }
    }
  }, [
    selectedOrderResponse?.data,
    formik.values.invoice_method,
    formik.values.parent_id,
  ]);

  // Clear form when order selection changes but data hasn't loaded
  useEffect(() => {
    if (
      formik.values.invoice_method === 'order' &&
      formik.values.parent_id &&
      (!selectedOrderResponse?.data ||
        selectedOrderResponse.data.id !== Number(formik.values.parent_id))
    ) {
      formik.setFieldValue('customer_id', '');
      formik.setFieldValue('salesperson_id', '');
      setInvoiceItems([]);
      formik.setFieldValue('invoiceItems', [], false);
      formikSyncRef.current = '[]';
    }
  }, [
    formik.values.parent_id,
    formik.values.invoice_method,
    selectedOrderResponse?.data,
  ]);

  const addInvoiceItem = () => {
    if (!formik.values.salesperson_id) {
      toast.error('Please select a Salesperson');
      return;
    }

    const newItem: InvoiceItemFormData = {
      product_id: 0,
      product_name: '',
      unit: 'CASE',
      tracking_type: null,
      quantity: '1',
      unit_price: '0',
      notes: '',
      product_batches: [],
      product_serials: [],
      conversion_rate: getProductConversionRate(0), // Use actual product conversion rate
    };
    const updatedItems = [...invoiceItems, newItem];
    setInvoiceItems(updatedItems);
    formik.setFieldValue('invoiceItems', updatedItems, false);
    formikSyncRef.current = JSON.stringify(updatedItems);
  };

  const removeInvoiceItem = (index: number) => {
    const updatedItems = invoiceItems.filter((_, i) => i !== index);
    setInvoiceItems(updatedItems);
    formik.setFieldValue('invoiceItems', updatedItems, false);
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
    formik.setFieldValue('invoiceItems', updatedItems, false);
    formikSyncRef.current = JSON.stringify(updatedItems);
  };




  /**
   * Update price when unit changes (CASE/PIECE)
   */
  const handleUnitChange = useCallback(
    (rowIndex: number, unit: 'CASE' | 'PIECE') => {
      const item = invoiceItems[rowIndex];

      const isSerialTracked = item.tracking_type?.toLowerCase() === 'serial';
      if (isSerialTracked && unit === 'PIECE') {
        return;
      }

      const conversionRate = getProductConversionRate(
        item.product_id as number
      );
      let resolvedPrice = resolvePrice(
        item.product_id as number,
        customerPriceLists,
        unit,
        conversionRate
      );

      if (!resolvedPrice) {
        resolvedPrice = '0';
      }

      const updatedItems = [...invoiceItems];
      const previousUnit = item.unit || 'CASE';

      const updatedBatches =
        item.product_batches?.map(batch => {
          let newQty = Number(batch.quantity) || 0;
          if (previousUnit === 'CASE' && unit === 'PIECE') {
            newQty = newQty * conversionRate;
          } else if (previousUnit === 'PIECE' && unit === 'CASE') {
            newQty = newQty / conversionRate;
          }
          return { ...batch, quantity: newQty };
        }) || [];

      updatedItems[rowIndex] = {
        ...updatedItems[rowIndex],
        unit,
        unit_price: resolvedPrice,
        conversion_rate: conversionRate,
        product_batches: updatedBatches,
      };

      setInvoiceItems(updatedItems);
      formik.setFieldValue('invoiceItems', updatedItems, false);
      formikSyncRef.current = JSON.stringify(updatedItems);
    },
    [invoiceItems, customerPriceLists, getProductConversionRate]
  );

  const handleProductChange = useCallback(
    (rowIndex: number, _event: any, product: any) => {
      const updatedItems = [...invoiceItems];
      const trackingType = product?.tracking_type || null;
      const trackingLower = trackingType
        ? trackingType.toString().toLowerCase()
        : null;
      const isBatchOrSerial =
        trackingLower === 'batch' || trackingLower === 'serial';

      const currentItem = updatedItems[rowIndex];
      const isSerialTracked = trackingType?.toLowerCase() === 'serial';
      const unit = isSerialTracked ? 'CASE' : currentItem?.unit || 'CASE';
      const conversionRate = getProductConversionRate(product?.product_id || 0);

      const resolvedPrice = product
        ? (resolvePrice(
          product.product_id,
          customerPriceLists,
          unit,
          conversionRate
        ) ?? '0')
        : '0';

      updatedItems[rowIndex] = {
        ...updatedItems[rowIndex],
        product_id: product ? product.product_id : '',
        product_name: product ? product.name : '',
        tracking_type: trackingType,
        unit: unit,
        unit_price: resolvedPrice,
        conversion_rate: conversionRate,
        quantity:
          product && isBatchOrSerial
            ? '0'
            : updatedItems[rowIndex].quantity || '1',
        product_batches: [],
        product_serials: [],
      };

      setInvoiceItems(updatedItems);
      formik.setFieldValue('invoiceItems', updatedItems, false);
      formikSyncRef.current = JSON.stringify(updatedItems);
    },
    [
      invoiceItems,
      customerPriceLists,
      formik.values.customer_id,
      getProductConversionRate,
    ]
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
        id: 'uom',
        label: 'Case/PCs',
        render: (_value, row) => {
          const currentValue = ['CASE', 'PIECE'].includes(row.unit)
            ? row.unit
            : 'CASE';

          const isSerialTracked = row.tracking_type?.toLowerCase() === 'serial';

          return (
            <Box className="!min-w-28">
              <Select
                value={currentValue}
                onChange={(e: any) => {
                  const unit = e.target.value as 'CASE' | 'PIECE';
                  handleUnitChange(row._index, unit);
                }}
                size="small"
                disableClearable
                label=""
                disabled={isSerialTracked}
              >
                <MenuItem value="CASE">CASE</MenuItem>
                {!isSerialTracked && <MenuItem value="PIECE">PIECE</MenuItem>}
              </Select>
            </Box>
          );
        },
      },
      {
        id: 'tracking_type',
        label: 'Tracking',
        render: (_value, row) => {
          const tracking = (row.tracking_type || '').toString().toLowerCase();
          const canManage =
            tracking === 'batch' || tracking === 'serial' ? tracking : null;

          return (
            <Box className="!flex !min-w-52 !items-center !justify-between">
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
          const displayQuantity = Number(row.quantity) || 0;

          return (
            <Input
              value={displayQuantity.toString()}
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
        <form onSubmit={formik.handleSubmit} className="mb-10 !space-y-5">
          <Box className="!grid !grid-cols-1 !gap-5 md:!grid-cols-2">
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
                formik.setFieldValue('invoiceItems', []);
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
                    formik.setFieldValue('invoiceItems', []);
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
            <Box className="!flex !items-center !justify-between">
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

          <Box className="!mt-6 !flex !justify-end !gap-3">
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
