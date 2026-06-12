import { Tag } from '@mui/icons-material';
import { Box, MenuItem, Typography } from '@mui/material';
import { useFormik } from 'formik';
import {
  useInventoryItemById,
  type SalespersonInventoryData,
} from 'hooks/useInventoryItems';
import { useCreateOrder, useOrder, useUpdateOrder } from 'hooks/useOrders';
import { useCurrency } from 'hooks/useCurrency';
import {
  usePriceListByCustomer,
  type CustomerPriceListResult,
} from 'hooks/usePriceLists';
import type { ProductBatch, ProductSerial } from 'hooks/useVanInventory';
import { Plus } from 'lucide-react';
import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { toast } from 'react-toastify';
import {
  orderValidationSchema,
  type OrderFormValues,
  type OrderItemFormData,
} from 'schemas/order.schema';
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

interface ManageOrderProps {
  open: boolean;
  onClose: () => void;
  order?: Order | null;
}

const ManageOrder: React.FC<ManageOrderProps> = ({ open, onClose, order }) => {
  const isEdit = !!order;
  const [orderItems, setOrderItems] = useState<OrderItemFormData[]>([]);
  const initializedRef = useRef<number | null>(null);
  const hydratedItemsRef = useRef<string>('');
  const formikSyncRef = useRef<string>('');
  const [isBatchSelectorOpen, setIsBatchSelectorOpen] = useState(false);
  const [isSerialSelectorOpen, setIsSerialSelectorOpen] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);

  const { formatCurrency, defaultCurrencyId } = useCurrency();
  const { data: orderResponse, isFetching } = useOrder(order?.id || 0);

  const createOrderMutation = useCreateOrder();
  const updateOrderMutation = useUpdateOrder();

  const formik = useFormik<OrderFormValues>({
    initialValues: {
      order_number: '',
      parent_id: 0,
      salesperson_id: 0,
      currency_id: defaultCurrencyId,
      order_date: new Date().toISOString().split('T')[0],
      delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      status: 'draft',
      priority: 'medium',
      order_type: 'regular',
      payment_method: 'credit',
      payment_terms: 'Net 30',
      subtotal: 0,
      shipping_amount: 0,
      total_amount: 0,
      notes: '',
      shipping_address: '',
      approval_status: 'P',
      is_active: 'Y',
      order_items: [] as OrderItemFormData[],
    },
    validationSchema: orderValidationSchema,
    onSubmit: async values => {
      try {
        if (orderItems?.length === 0) {
          toast.error(
            'Please add at least one item to the order before submitting.'
          );
          return;
        }

        for (let i = 0; i < orderItems.length; i += 1) {
          const item = orderItems[i];

          if (!item.product_id || item.product_id === 0) {
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
                `Item ${i + 1}: Please allocate batch quantities to match the ordered quantity.`
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
              []) as (ProductSerial & { selected?: boolean })[];
            const selectedSerials = allSerials.filter(
              s => s.selected !== false
            );

            if (selectedSerials.length === 0) {
              toast.error(
                `Item ${i + 1}: Please assign serial numbers to match the ordered quantity.`
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
                `Item ${i + 1}: Serial number is required for all rows.`
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
          order_date: new Date(values.order_date).toISOString(),
          parent_id: Number(values.parent_id),
          salesperson_id: Number(values.salesperson_id),
          currency_id: values.currency_id
            ? Number(values.currency_id)
            : undefined,
          delivery_date: new Date(values.delivery_date).toISOString(),
          notes: values.notes,
          shipping_address: values.shipping_address,
          pricelist_id: appliedPricelistId,
          order_items: orderItems
            .filter(
              item => typeof item.product_id === 'number' && item.product_id > 0
            )
            .map(item => {
              const unitPrice = Number(item.unit_price) || 0;
              const quantity = Number(item.quantity) || 0;
              const conversionRate = item.conversion_rate || 1;

              return {
                tracking_type: item.tracking_type || null,
                product_id: Number(item.product_id),
                product_name: item.product_name || undefined,
                unit: item.unit || undefined,
                quantity: quantity,
                unit_price: unitPrice,
                notes: item.notes,
                product_batches:
                  item.product_batches?.map(batch => ({
                    ...batch,
                    quantity: Number(batch.quantity) || 0,
                  })) || [],
                product_serials: item.product_serials,
                conversion_rate: conversionRate,
              };
            }),
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
        console.error('Error submitting order:', error);
      }
    },
  });

  const salespersonId = formik.values.salesperson_id
    ? Number(formik.values.salesperson_id)
    : 0;

  const { data: customerPriceLists } = usePriceListByCustomer(
    formik.values.parent_id || undefined,
    formik.values.order_date || undefined,
    { enabled: open }
  );

  useEffect(() => {
    if (orderItems.length > 0 && !formik.values.parent_id) {
      const updatedItems = orderItems.map(item => ({
        ...item,
        unit_price: '0',
        conversion_rate: 1,
      }));
      setOrderItems(updatedItems);
      formik.setFieldValue('order_items', updatedItems, false);
      formikSyncRef.current = JSON.stringify(updatedItems);
    } else if (
      orderItems.length > 0 &&
      formik.values.parent_id &&
      customerPriceLists
    ) {
      const updatedItems = orderItems.map(item => {
        if (!item.product_id) return item;

        const unit = item.unit || 'CASE';
        const conversionRate = getProductConversionRate(item.product_id);
        const resolvedPrice =
          resolvePrice(item.product_id, customerPriceLists, unit) ?? '0';

        return {
          ...item,
          unit_price: resolvedPrice,
          conversion_rate: conversionRate,
        };
      });
      setOrderItems(updatedItems);
      formik.setFieldValue('order_items', updatedItems, false);
      formikSyncRef.current = JSON.stringify(updatedItems);
    }
  }, [formik.values.parent_id, formik.values.order_date, customerPriceLists]);

  /**
   * Resolves the effective unit_price for a product from the SP pricelist result.
   * Only uses price list API pricing - no fallback to product base prices.
   * For CASE: uses unit_price from price list.
   * For PIECE: uses sub_unit_price from price list, falls back to calculated price.
   */
  const resolvePrice = (
    productId: number,
    priceLists: CustomerPriceListResult[] | undefined,
    unit: 'CASE' | 'PCS' = 'CASE'
  ): string | null => {
    if (
      !priceLists ||
      priceLists.length === 0 ||
      !formik.values.parent_id ||
      !productId
    )
      return null;

    const customerId = Number(formik.values.parent_id);
    let casePrice: number | null = null;

    for (const pl of priceLists) {
      const item = pl.pricelist_items?.find(i => i.product_id === productId);
      if (!item) continue;

      const specials = item.special_prices ?? [];

      const customerSp = specials.find(sp => sp.customer_id === customerId);
      if (customerSp) {
        casePrice = Number(customerSp.sale_price);
        break;
      }

      const otherSp = specials.find(
        sp => sp.route_id != null || sp.customer_category_id != null
      );
      if (otherSp) {
        casePrice = Number(otherSp.sale_price);
        break;
      }

      casePrice = Number(item.unit_price);
      break;
    }

    if (casePrice === null) return null;

    if (unit === 'PCS') {
      for (const pl of priceLists) {
        const item = pl.pricelist_items?.find(i => i.product_id === productId);
        if (item && item.sub_unit_price) {
          return String(item.sub_unit_price);
        }
      }

      const conversionRate = getProductConversionRate(productId);
      if (conversionRate <= 0) return String(casePrice);
      const piecePrice = casePrice / conversionRate;
      return String(Math.round(piecePrice * 100) / 100);
    }

    return String(casePrice);
  };

  useEffect(() => {
    if (order && open) {
      formik.setValues({
        order_number: order.order_number || '',
        parent_id: order.parent_id || 0,
        salesperson_id: order.salesperson_id || 0,
        currency_id: order.currency_id || defaultCurrencyId,
        order_date: order.order_date || new Date().toISOString().split('T')[0],
        delivery_date:
          order.delivery_date ||
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
        status: order.status || 'draft',
        priority: order.priority || 'medium',
        order_type: order.order_type || 'regular',
        payment_method: order.payment_method || 'credit',
        payment_terms: order.payment_terms || 'Net 30',
        subtotal: order.subtotal || 0,
        shipping_amount: order.shipping_amount || 0,
        total_amount: order.total_amount || 0,
        notes: order.notes || '',
        shipping_address: order.shipping_address || '',
        approval_status:
          order.approval_status?.slice(0, 1)?.toUpperCase() || 'P',
        is_active: order.is_active || 'Y',
        order_items: [],
      });
    }
  }, [order, open, defaultCurrencyId]);

  const { data: inventoryData } = useInventoryItemById(salespersonId, {
    enabled: !!salespersonId && open,
  });

  const inventoryByProductId = useMemo(() => {
    const map: Record<
      number,
      { batches: ProductBatch[]; serials: ProductSerial[] }
    > = {};

    if (!inventoryData?.data) return map;

    const responseData = inventoryData.data;
    const salespersonData = responseData as SalespersonInventoryData;

    (salespersonData.products || []).forEach(product => {
      const batches: ProductBatch[] = (product.batches || []).map(batch => ({
        batch_lot_id: batch.batch_lot_id,
        batch_number: batch.batch_number,
        total_quantity: batch.total_quantity,
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
    formikSyncRef.current = '';
    initializedRef.current = null;
    hydratedItemsRef.current = '';
  };

  const orderKey = useMemo(
    () =>
      open && order?.id ? `order-${order.id}` : open ? 'new-order' : 'closed',
    [open, order?.id]
  );

  useEffect(() => {
    if (!open) {
      if (initializedRef.current !== null) {
        initializedRef.current = null;
        hydratedItemsRef.current = '';
        formikSyncRef.current = '';
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
        orderResponse.data.order_items?.map(item => {
          // Use existing conversion_factor if available, otherwise fallback to 1
          const conversionRate = item.conversion_factor || 1;
          let displayQuantity = item.quantity;

          // For PIECE units, displayQuantity is the raw piece count stored in base_quantity
          if (item.unit === 'PCS') {
            displayQuantity = item.base_quantity || 0;
          }

          return {
            product_id: item.product_id,
            product_name: item.product_name || null,
            unit: (item.unit as any) || 'CASE',
            tracking_type: item.tracking_type || null,
            quantity: displayQuantity.toString(),
            base_quantity: item.base_quantity || 0,
            unit_price: item.unit_price.toString(),
            notes: item.notes || '',
            isLoaded: true, // Mark as loaded from existing order
            product_batches:
              item.product_batches?.map(batch => ({
                ...batch,
                quantity:
                  item.unit === 'PCS'
                    ? (batch.quantity || 0) * conversionRate
                    : batch.quantity || 0,
              })) || [],
            product_serials: item.product_serials || [],
            conversion_rate: conversionRate,
          };
        }) || [];

      const itemsStr = JSON.stringify(items);

      if (hydratedItemsRef.current !== itemsStr) {
        initializedRef.current = orderId;
        hydratedItemsRef.current = itemsStr;
        setOrderItems(items);
      }
    } else if (!hasOrderData && initializedRef.current !== null && !orderId) {
      initializedRef.current = null;
      hydratedItemsRef.current = '';
      formikSyncRef.current = '';
      setOrderItems([]);
    }
  }, [orderKey, orderResponse?.data?.id, open]);

  const orderItemsStr = useMemo(() => JSON.stringify(orderItems), [orderItems]);

  useEffect(() => {
    if (!open) return;

    const currentFormikStr = JSON.stringify(formik.values.order_items || []);

    if (
      orderItemsStr !== currentFormikStr &&
      formikSyncRef.current !== orderItemsStr
    ) {
      formik.setFieldValue('order_items', orderItems, false);
      formikSyncRef.current = orderItemsStr;
    }
  }, [open, orderItemsStr]);

  const addOrderItem = () => {
    if (!formik.values.salesperson_id) {
      toast.error('Please select a Sales Person');
      return;
    }

    const newItem: OrderItemFormData = {
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

    const updatedItems = [...orderItems, newItem];
    setOrderItems(updatedItems);
    formik.setFieldValue('order_items', updatedItems, false);
    formikSyncRef.current = JSON.stringify(updatedItems);
  };

  const removeOrderItem = (index: number) => {
    const updatedItems = orderItems.filter((_, i) => i !== index);
    setOrderItems(updatedItems);
    formik.setFieldValue('order_items', updatedItems, false);
    formikSyncRef.current = JSON.stringify(updatedItems);
  };

  const updateOrderItem = <K extends keyof OrderItemFormData>(
    index: number,
    field: K,
    value: OrderItemFormData[K]
  ) => {
    const updatedItems = [...orderItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setOrderItems(updatedItems);
    formik.setFieldValue('order_items', updatedItems, false);
    formikSyncRef.current = JSON.stringify(updatedItems);
  };

  /**
   * Get product conversion rate from inventory data
   */
  const getProductConversionRate = useCallback(
    (productId: number): number => {
      if (!inventoryData?.data) return 1;
      const responseData = inventoryData.data;
      const salespersonData = responseData as SalespersonInventoryData;
      const product = salespersonData.products?.find(
        p => p.product_id === productId
      );
      return product?.product_unit_of_measurement?.conversion_rate ?? 1;
    },
    [inventoryData]
  );

  /**
   * Update price when unit changes (CASE/PIECE)
   */
  const handleUnitChange = useCallback(
    (rowIndex: number, unit: 'CASE' | 'PCS') => {
      const item = orderItems[rowIndex];

      const isSerialTracked = item.tracking_type?.toLowerCase() === 'serial';
      if (isSerialTracked && unit === 'PCS') {
        return;
      }

      const conversionRate = getProductConversionRate(item.product_id);
      let resolvedPrice = resolvePrice(
        item.product_id,
        customerPriceLists,
        unit
      );

      if (!resolvedPrice) {
        resolvedPrice = '0';
      }

      const updatedItems = [...orderItems];
      const previousUnit = item.unit || 'CASE';

      const updatedBatches =
        item.product_batches?.map(batch => {
          let newQty = Number(batch.quantity) || 0;
          if (previousUnit === 'CASE' && unit === 'PCS') {
            newQty = newQty * conversionRate;
          } else if (previousUnit === 'PCS' && unit === 'CASE') {
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

      setOrderItems(updatedItems);
      formik.setFieldValue('order_items', updatedItems, false);
      formikSyncRef.current = JSON.stringify(updatedItems);
    },
    [orderItems, customerPriceLists, getProductConversionRate]
  );

  const handleProductChange = useCallback(
    (rowIndex: number, _event: any, product: any) => {
      const updatedItems = [...orderItems];
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
        ? (resolvePrice(product.product_id, customerPriceLists, unit) ?? '0')
        : '0';

      updatedItems[rowIndex] = {
        ...updatedItems[rowIndex],
        product_id: product ? product.product_id : 0,
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

      setOrderItems(updatedItems);
      formik.setFieldValue('order_items', updatedItems);
      formikSyncRef.current = JSON.stringify(updatedItems);
    },
    [
      orderItems,
      customerPriceLists,
      formik.values.parent_id,
      getProductConversionRate,
    ]
  );

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
      render: (
        _value: any,
        row: OrderItemFormData & { _index: number }
      ): React.ReactNode => (
        <SalesItemsSelect
          salespersonId={salespersonId}
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
        const currentValue = ['CASE', 'PCS'].includes(row.unit)
          ? row.unit
          : 'CASE';

        const isSerialTracked = row.tracking_type?.toLowerCase() === 'serial';

        return (
          <Box className="!min-w-28">
            <Select
              value={currentValue}
              onChange={(e: any) => {
                const unit = e.target.value as 'CASE' | 'PCS';
                handleUnitChange(row._index, unit);
              }}
              size="small"
              disableClearable
              label=""
              disabled={isSerialTracked}
            >
              <MenuItem value="CASE">CASE</MenuItem>
              {!isSerialTracked && <MenuItem value="PCS">PIECE</MenuItem>}
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
          <Box className="!flex !min-w-48 !items-center !justify-between">
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
      label: orderItems.some(item => item.unit === 'PCS')
        ? 'Quantity (pieces)'
        : 'Quantity (cases)',
      render: (_value, row) => {
        const tracking = (row.tracking_type || '').toString().toLowerCase();
        const isNoneTracking = !tracking || tracking === 'none';
        const unit = row.unit || 'CASE';
        const displayQuantity = Number(row.quantity) || 0;

        return (
          <Input
            value={displayQuantity.toString()}
            onChange={e => {
              updateOrderItem(row._index, 'quantity', e.target.value);
            }}
            placeholder={
              unit.toUpperCase() === 'PCS' ? 'Enter pieces' : 'Enter cases'
            }
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

  const totals = useMemo(() => {
    const subtotal = orderItems.reduce((sum, item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.unit_price) || 0;
      return sum + qty * price;
    }, 0);
    const shippingAmount = formik.values.shipping_amount || 0;
    const totalAmount = subtotal + shippingAmount;
    return {
      subtotal,
      shipping_amount: shippingAmount,
      total_amount: totalAmount,
    };
  }, [orderItems, formik.values.shipping_amount]);

  useEffect(() => {
    if (formik.values.subtotal !== totals.subtotal) {
      formik.setFieldValue('subtotal', totals.subtotal, false);
    }
    if (formik.values.total_amount !== totals.total_amount) {
      formik.setFieldValue('total_amount', totals.total_amount, false);
    }
  }, [
    totals,
    formik.setFieldValue,
    formik.values.subtotal,
    formik.values.total_amount,
  ]);

  return (
    <CustomDrawer
      open={open}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Order' : 'Create Order'}
      size="large"
    >
      <Box className="!p-5">
        <form onSubmit={formik.handleSubmit} className="!space-y-5">
          <Box className="!grid !grid-cols-1 !gap-5 md:!grid-cols-2">
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
            <Select name="status" label="Status" formik={formik} required>
              <MenuItem value="draft"> Draft </MenuItem>
              <MenuItem value="pending"> Pending </MenuItem>
              <MenuItem value="confirmed"> Confirmed </MenuItem>
              <MenuItem value="processing"> Processing </MenuItem>
              <MenuItem value="shipped"> Shipped </MenuItem>
              <MenuItem value="delivered"> Delivered </MenuItem>
              <MenuItem value="cancelled"> Cancelled </MenuItem>
            </Select>
            <Select name="priority" label="Priority" formik={formik} required>
              <MenuItem value="low"> Low </MenuItem>
              <MenuItem value="medium"> Medium </MenuItem>
              <MenuItem value="high"> High </MenuItem>
              <MenuItem value="urgent"> Urgent </MenuItem>
            </Select>
            <Select
              name="order_type"
              label="Order Type"
              formik={formik}
              required
            >
              <MenuItem value="regular"> Regular </MenuItem>
              <MenuItem value="urgent"> Urgent </MenuItem>
              <MenuItem value="promotional"> Promotional </MenuItem>
              <MenuItem value="sample"> Sample </MenuItem>
            </Select>
            <Select
              name="payment_method"
              label="Payment Method"
              formik={formik}
              required
            >
              <MenuItem value="cash"> Cash </MenuItem>
              <MenuItem value="credit"> Credit </MenuItem>
              <MenuItem value="cheque"> Cheque </MenuItem>
              <MenuItem value="bank_transfer"> Bank Transfer </MenuItem>
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
            <Box className="!flex !items-center !justify-between">
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

            <Table
              data={orderItemsWithIndex}
              columns={orderItemsColumns}
              getRowId={row => row._index.toString()}
              pagination={false}
              loading={
                isFetching ||
                createOrderMutation.isPending ||
                updateOrderMutation.isPending
              }
              sortable={false}
              emptyMessage='No items added yet. Click "Add Item" to get started.'
            />

            {orderItems.length > 0 && (
              <Box className="!mt-4 !rounded-lg !bg-gray-50">
                <Box className="!flex !justify-between">
                  <Typography variant="subtitle2" className="!font-bold">
                    Total:
                  </Typography>
                  <Typography variant="subtitle2" className="!font-bold">
                    {formatCurrency(totals.total_amount)}
                  </Typography>
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
export type { OrderItemFormData } from 'schemas/order.schema';
