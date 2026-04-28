import { Add, Close, MoreHoriz } from '@mui/icons-material';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  MenuItem,
  Tooltip,
} from '@mui/material';
import { useFormik } from 'formik';
import { useCustomerCategories } from 'hooks/useCustomerCategory';
import { useCustomers } from 'hooks/useCustomers';
import { useDepots } from 'hooks/useDepots';
import {
  useCreatePriceList,
  usePriceLists,
  useUpdatePriceList,
  type PriceList,
} from 'hooks/usePriceLists';
import { useProducts } from 'hooks/useProducts';
import { useRoutes } from 'hooks/useRoutes';
import React, { useEffect, useState } from 'react';
import { priceListValidationSchema } from 'schemas/priceLists.schema';
import { ActionButton, DeleteButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import YesNoField from 'shared/YesNoField';
import type { PriceListItem, SpecialPrice } from 'services/masters/PriceLists';

interface ManagePriceListProps {
  selectedPriceList?: PriceList | null;
  setSelectedPriceList: (priceList: PriceList | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

interface PriceListItemForm
  extends Omit<Partial<PriceListItem>, 'special_prices'> {
  product_id: number | undefined;
  unit_price: string;
  uom: string;
  discount_percent: string;
  tax_percent: string;
  sub_unit_price: string;
  is_active: string;
  special_prices?: SpecialPriceForm[];
}

interface SpecialPriceForm
  extends Omit<
    SpecialPrice,
    'route_id' | 'customer_id' | 'customer_category_id' | 'sale_price'
  > {
  id?: number;
  valid_from?: string;
  valid_to?: string;
  route_id?: number | '';
  customer_id?: number | '';
  customer_category_id?: number | '';
  sale_price: string;
  sale_sub_unit_price?: string;
  tax_percent?: string;
  discount_percent?: string;
  is_active?: string;
}

const ManagePriceList: React.FC<ManagePriceListProps> = ({
  selectedPriceList,
  setSelectedPriceList,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedPriceList;
  const [priceListItems, setPriceListItems] = useState<PriceListItemForm[]>([]);
  const [newPriceListItems, setNewPriceListItems] = useState<
    PriceListItemForm[]
  >([]);

  const [showSpecialForIndex, setShowSpecialForIndex] = useState<number | null>(
    null
  );

  const createPriceListMutation = useCreatePriceList();
  const updatePriceListMutation = useUpdatePriceList();

  const { data: depotsResponse } = useDepots({ limit: 1000, isActive: 'Y' });
  const { data: routesResponse } = useRoutes({ limit: 1000, status: 'active' });
  const { data: categoriesResponse } = useCustomerCategories({
    limit: 1000,
    is_active: 'Y',
  });
  const { data: customersResponse } = useCustomers({
    limit: 1000,
    isActive: 'Y',
  });
  const { data: productsResponse, isLoading: isLoadingProducts } = useProducts({
    limit: 1000,
  });

  const depots = depotsResponse?.data || [];
  const routes = routesResponse?.data || [];
  const categories = categoriesResponse?.data || [];
  const customers = customersResponse?.data || [];
  const products = productsResponse?.data || [];

  const { data: allPriceListsResponse, isLoading: isLoadingPriceList } =
    usePriceLists({
      limit: 1000,
      include_items: true,
    });
  const allPriceLists = allPriceListsResponse?.data || [];

  const handleCancel = () => {
    setSelectedPriceList(null);
    setDrawerOpen(false);
    setPriceListItems([]);
    setNewPriceListItems([]);
    setShowSpecialForIndex(null);
    formik.resetForm();
  };

  useEffect(() => {
    if (selectedPriceList?.pricelist_item) {
      const existingItems = selectedPriceList.pricelist_item.map(item => {
        const rawSpecial =
          (item as any).special_prices ||
          (item as any).pricelist_item_special_prices ||
          [];

        const specialPrices = rawSpecial.map((sp: any) => ({
          id: sp.id,
          valid_from: sp.valid_from ? String(sp.valid_from).split('T')[0] : '',
          valid_to: sp.valid_to ? String(sp.valid_to).split('T')[0] : '',
          route_id: sp.route_id || '',
          customer_id: sp.customer_id || '',
          customer_category_id: sp.customer_category_id || '',
          sale_price: String(sp.sale_price ?? '0'),
          sale_sub_unit_price: sp.sale_sub_unit_price
            ? String(sp.sale_sub_unit_price)
            : '',
          tax_percent: sp.tax_percent ? String(sp.tax_percent) : '',
          discount_percent: sp.discount_percent
            ? String(sp.discount_percent)
            : '',
          is_active: sp.is_active || 'Y',
        }));

        return {
          id: item.id,
          product_id: item.product_id,
          unit_price: item.unit_price,
          uom: item.uom || '',
          discount_percent: item.discount_percent || '',
          tax_percent: item.tax_percent || '18',
          sub_unit_price: item.sub_unit_price || '',
          is_active: item.is_active,
          special_prices: specialPrices,
        };
      });

      const existingProductIds = new Set(
        existingItems.map(item => item.product_id)
      );

      const newItems = products
        .filter(p => !existingProductIds.has(p.id))
        .map(p => ({
          product_id: p.id,
          unit_price: '',
          uom: p.uom_id || '',
          discount_percent: '',
          tax_percent: '18',
          sub_unit_price: '',
          is_active: 'Y' as string,
          special_prices: [],
        }));

      setPriceListItems(existingItems); // 👈 only existing
      setNewPriceListItems(newItems); // 👈 only new
    } else if (!isEdit) {
      if (drawerOpen && products.length > 0 && priceListItems.length === 0) {
        const initialItems = products.map(p => ({
          product_id: p.id,
          unit_price: '',
          uom: p.uom_id || '',
          discount_percent: '',
          tax_percent: '18',
          sub_unit_price: '',
          is_active: 'Y',
          special_prices: [],
        }));
        setPriceListItems(initialItems);
      }
    } else {
      setPriceListItems([]);
      setNewPriceListItems([]);
    }
  }, [selectedPriceList, drawerOpen, products, isEdit]);

  const formik = useFormik({
    initialValues: {
      name: selectedPriceList?.name || '',
      description: selectedPriceList?.description || '',
      is_default: selectedPriceList?.is_default || 'N',
      customer_id: selectedPriceList?.customer_id || '',
      route_id: selectedPriceList?.route_id || '',
      depot_id: selectedPriceList?.depot_id || '',
      base_pricelist_id: selectedPriceList?.base_pricelist_id || '',
      factor: selectedPriceList?.factor || '1.00',
      customer_category_id: selectedPriceList?.customer_category_id || '',
      is_active: selectedPriceList?.is_active || 'Y',
    },
    validationSchema: priceListValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const submitData = {
          ...values,
          depot_id: Number(values.depot_id),
          base_pricelist_id: values.base_pricelist_id
            ? Number(values.base_pricelist_id)
            : null,
          factor: Number(values.factor),
          description: values.description,
          pricelist_item: [...priceListItems, ...newPriceListItems]
            .filter(item => item.product_id !== undefined)
            .map(item => ({
              id: item.id,
              product_id: Number(item.product_id),
              unit_price: item.unit_price,
              uom: item.uom,
              discount_percent: item.discount_percent,
              tax_percent: item.tax_percent,
              sub_unit_price: item.sub_unit_price,
              is_active: item.is_active,
              special_prices: (item.special_prices || []).map(sp => ({
                id: sp.id,
                valid_from: sp.valid_from || undefined,
                valid_to: sp.valid_to || undefined,
                route_id: sp.route_id ? Number(sp.route_id) : null,
                customer_id: sp.customer_id ? Number(sp.customer_id) : null,
                customer_category_id: sp.customer_category_id
                  ? Number(sp.customer_category_id)
                  : null,
                sale_price: Number(sp.sale_price || 0),
                sale_sub_unit_price: sp.sale_sub_unit_price
                  ? Number(sp.sale_sub_unit_price)
                  : null,
                tax_percent: sp.tax_percent ? Number(sp.tax_percent) : null,
                discount_percent: sp.discount_percent
                  ? Number(sp.discount_percent)
                  : null,
                is_active: sp.is_active || 'Y',
              })),
            })),
        };

        if (isEdit && selectedPriceList) {
          await updatePriceListMutation.mutateAsync({
            id: selectedPriceList.id,
            data: submitData,
          });
        } else {
          await createPriceListMutation.mutateAsync(submitData);
        }
        handleCancel();
      } catch (error) {
        console.error('Error submitting price list:', error);
      }
    },
  });
  const updateNewPriceListItem = (
    index: number,
    field: keyof PriceListItemForm,
    value: string | number
  ) => {
    const updatedItems = [...newPriceListItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    if (field === 'unit_price' && value) {
      const price = parseFloat(value as string);
      if (!isNaN(price)) {
        updatedItems[index].sub_unit_price = (price / 24).toFixed(2);
      }
    }

    if (field === 'sub_unit_price' && value) {
      const subPrice = parseFloat(value as string);
      if (!isNaN(subPrice)) {
        updatedItems[index].unit_price = (subPrice * 24).toFixed(2);
      }
    }

    setNewPriceListItems(updatedItems);
  };

  useEffect(() => {
    const factor = Number(formik.values.factor || 0);
    const baseId = Number(formik.values.base_pricelist_id || 0);
    if (!baseId || !factor) return;
    const base = allPriceLists.find((pl: any) => pl.id === baseId);
    if (!base?.pricelist_item?.length) return;
    const updated = priceListItems.map(item => {
      if (!item.product_id) return item;
      const baseItem = base.pricelist_item.find(
        (bi: any) => bi.product_id === item.product_id
      );
      if (!baseItem) return item;
      const price = (parseFloat(baseItem.unit_price) * factor).toFixed(2);
      const subUnit = (parseFloat(price) / 24).toFixed(2);
      return {
        ...item,
        unit_price: price,
        sub_unit_price: subUnit,
      };
    });
    setPriceListItems(updated);
  }, [formik.values.factor, formik.values.base_pricelist_id, allPriceLists]);

  const updatePriceListItem = (
    index: number,
    field: keyof PriceListItemForm,
    value: string | number
  ) => {
    const updatedItems = [...priceListItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    if (field === 'product_id') {
      const factor = Number(formik.values.factor || 0);
      const baseId = Number(formik.values.base_pricelist_id || 0);
      if (baseId && factor) {
        const base = allPriceLists.find((pl: any) => pl.id === baseId);
        const baseItem = base?.pricelist_item?.find(
          (bi: any) => bi.product_id === value
        );
        if (baseItem) {
          const price = (parseFloat(baseItem.unit_price) * factor).toFixed(2);
          updatedItems[index].unit_price = price;
          updatedItems[index].sub_unit_price = (parseFloat(price) / 24).toFixed(
            2
          );
        }
      }
    }

    if (field === 'unit_price' && value) {
      const price = parseFloat(value as string);
      if (!isNaN(price)) {
        updatedItems[index].sub_unit_price = (price / 24).toFixed(2);
      }
    }

    if (field === 'sub_unit_price' && value) {
      const subPrice = parseFloat(value as string);
      if (!isNaN(subPrice)) {
        updatedItems[index].unit_price = (subPrice * 24).toFixed(2);
      }
    }

    setPriceListItems(updatedItems);
  };

  const priceListItemsWithIndex = priceListItems.map((item, index) => ({
    ...item,
    _index: index,
  }));

  const newPriceListItemsWithIndex = newPriceListItems.map((item, index) => ({
    ...item,
    _index: index,
  }));

  const priceListItemsColumns: TableColumn<
    PriceListItemForm & { _index: number }
  >[] = [
    {
      id: 'sku',
      label: 'SKU',
      render: (_value, row) => {
        const product = products.find(p => p.id === row.product_id);
        return <span>{product?.code || '-'}</span>;
      },
    },
    {
      id: 'product_id',
      label: 'Product',
      render: (_value, row) => {
        const product = products.find(p => p.id === row.product_id);
        const name = product?.name || '-';
        return (
          <Tooltip title={name} arrow placement="top">
            <div className="max-w-[240px] truncate cursor-help">{name}</div>
          </Tooltip>
        );
      },
    },
    {
      id: 'base_price',
      label: 'Base Price',
      render: (_value, row) => {
        const baseId = Number(formik.values.base_pricelist_id);
        const base = allPriceLists.find((pl: any) => pl.id === baseId);
        const baseItem = base?.pricelist_item?.find(
          (bi: any) => bi.product_id === row.product_id
        );
        return <span>{baseItem?.unit_price || '-'}</span>;
      },
    },
    {
      id: 'base_subunit',
      label: 'Base Subunit Price',
      render: (_value, row) => {
        const baseId = Number(formik.values.base_pricelist_id);
        const base = allPriceLists.find((pl: any) => pl.id === baseId);
        const baseItem = base?.pricelist_item?.find(
          (bi: any) => bi.product_id === row.product_id
        );
        return <span>{baseItem?.sub_unit_price || '-'}</span>;
      },
    },
    {
      id: 'unit_price',
      label: 'Price',
      render: (_value, row) => (
        <Input
          compact={true}
          value={row.unit_price}
          onChange={e =>
            updatePriceListItem(row._index, 'unit_price', e.target.value)
          }
          placeholder="0.00"
          type="number"
          size="small"
          className="!min-w-24"
        />
      ),
    },
    {
      id: 'sub_unit_price',
      label: 'Subunit Price',
      render: (_value, row) => (
        <Input
          compact={true}
          value={row.sub_unit_price}
          onChange={e =>
            updatePriceListItem(row._index, 'sub_unit_price', e.target.value)
          }
          placeholder="0.00"
          type="number"
          size="small"
          className="!min-w-24"
        />
      ),
    },
    {
      id: 'actions',
      label: 'Action',
      render: (_value, row) => (
        <div className="flex gap-2">
          <ActionButton
            onClick={() =>
              setShowSpecialForIndex(
                showSpecialForIndex === row._index ? null : row._index
              )
            }
            size="small"
            tooltip={
              showSpecialForIndex === row._index
                ? 'Hide Special Prices'
                : 'Special Prices'
            }
            color={showSpecialForIndex === row._index ? 'primary' : 'info'}
            icon={<MoreHoriz fontSize="small" />}
          />
        </div>
      ),
    },
  ];
  const newPriceListItemsColumns: TableColumn<
    PriceListItemForm & { _index: number }
  >[] = [
    {
      id: 'sku',
      label: 'SKU',
      render: (_value, row) => {
        const product = products.find(p => p.id === row.product_id);
        return <span>{product?.code || '-'}</span>;
      },
    },
    {
      id: 'product_id',
      label: 'Product',
      render: (_value, row) => {
        const product = products.find(p => p.id === row.product_id);
        const name = product?.name || '-';
        return (
          <Tooltip title={name} arrow placement="top">
            <div className="max-w-[240px] truncate cursor-help">{name}</div>
          </Tooltip>
        );
      },
    },
    {
      id: 'base_price',
      label: 'Base Price',
      render: (_value, row) => {
        const baseId = Number(formik.values.base_pricelist_id);
        const base = allPriceLists.find((pl: any) => pl.id === baseId);
        const baseItem = base?.pricelist_item?.find(
          (bi: any) => bi.product_id === row.product_id
        );
        return <span>{baseItem?.unit_price || '-'}</span>;
      },
    },
    {
      id: 'base_subunit',
      label: 'Base Subunit Price',
      render: (_value, row) => {
        const baseId = Number(formik.values.base_pricelist_id);
        const base = allPriceLists.find((pl: any) => pl.id === baseId);
        const baseItem = base?.pricelist_item?.find(
          (bi: any) => bi.product_id === row.product_id
        );
        return <span>{baseItem?.sub_unit_price || '-'}</span>;
      },
    },
    {
      id: 'unit_price',
      label: 'Price',
      render: (_value, row) => (
        <Input
          compact={true}
          value={row.unit_price}
          onChange={e =>
            updateNewPriceListItem(row._index, 'unit_price', e.target.value)
          }
          placeholder="0.00"
          type="number"
          size="small"
          className="!min-w-24"
        />
      ),
    },
    {
      id: 'sub_unit_price',
      label: 'Subunit Price',
      render: (_value, row) => (
        <Input
          compact={true}
          value={row.sub_unit_price}
          onChange={e =>
            updateNewPriceListItem(row._index, 'sub_unit_price', e.target.value)
          }
          placeholder="0.00"
          type="number"
          size="small"
          className="!min-w-24"
        />
      ),
    },
    {
      id: 'actions',
      label: 'Action',
      render: (_value, row) => (
        <div className="flex gap-2">
          <ActionButton
            onClick={() =>
              setShowSpecialForIndex(
                showSpecialForIndex === row._index ? null : row._index
              )
            }
            size="small"
            tooltip={
              showSpecialForIndex === row._index
                ? 'Hide Special Prices'
                : 'Special Prices'
            }
            color={showSpecialForIndex === row._index ? 'primary' : 'info'}
            icon={<MoreHoriz fontSize="small" />}
          />
        </div>
      ),
    },
  ];

  const addSpecialPrice = (index: number) => {
    const updated = [...priceListItems];
    const item = updated[index];
    const basePrice = item.unit_price || '0';
    const sp: SpecialPriceForm = {
      valid_from: '',
      valid_to: '',
      route_id: '',
      customer_id: '',
      customer_category_id: '',
      sale_price: basePrice,
      sale_sub_unit_price: item.sub_unit_price || '',
      tax_percent: item.tax_percent || '',
      discount_percent: '',
      is_active: 'Y',
    };
    item.special_prices = [...(item.special_prices || []), sp];
    setPriceListItems(updated);
  };

  const updateSpecialPrice = (
    itemIndex: number,
    spIndex: number,
    field: keyof SpecialPriceForm,
    value: string | number
  ) => {
    const updated = [...priceListItems];
    const item = updated[itemIndex];
    if (!item.special_prices) item.special_prices = [];
    const sps = [...item.special_prices];
    const sp = { ...sps[spIndex], [field]: value } as SpecialPriceForm;

    const originalPrice = parseFloat(item.unit_price || '0');

    if (field === 'sale_price') {
      const n = parseFloat(value as string);
      if (!isNaN(n)) {
        sp.sale_sub_unit_price = (n / 24).toFixed(2);
        if (originalPrice > 0) {
          const discount = ((originalPrice - n) / originalPrice) * 100;
          sp.discount_percent = discount.toFixed(2);
        }
      } else {
        sp.sale_sub_unit_price = '';
        sp.discount_percent = '';
      }
    }

    if (field === 'discount_percent') {
      const discount = parseFloat(value as string);
      if (!isNaN(discount) && originalPrice > 0) {
        const calculatedSalePrice =
          originalPrice - (originalPrice * discount) / 100;
        sp.sale_price = calculatedSalePrice.toFixed(2);
        sp.sale_sub_unit_price = (calculatedSalePrice / 24).toFixed(2);
      } else {
        sp.sale_price = originalPrice > 0 ? originalPrice.toFixed(2) : '';
        sp.sale_sub_unit_price =
          originalPrice > 0 ? (originalPrice / 24).toFixed(2) : '';
      }
    }

    sps[spIndex] = sp;
    item.special_prices = sps;
    setPriceListItems(updated);
  };

  const removeSpecialPrice = (itemIndex: number, spIndex: number) => {
    const updated = [...priceListItems];
    const item = updated[itemIndex];
    item.special_prices = (item.special_prices || []).filter(
      (_: any, i: number) => i !== spIndex
    );
    setPriceListItems(updated);
  };

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Price List' : 'Create Price List'}
      size="large"
    >
      <div className="p-4">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <Input
              name="name"
              label="Price List Name"
              placeholder="Enter price list name"
              formik={formik}
              required
            />
            <Select
              name="depot_id"
              label="Depot"
              formik={formik}
              required
              placeholder="Select Depot"
            >
              {depots.map(d => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name}
                </MenuItem>
              ))}
            </Select>

            <Select
              name="base_pricelist_id"
              label="Base Price List"
              formik={formik}
              placeholder="Select Base Price List"
            >
              {allPriceLists.map(
                (pl: { id: number | undefined; name: string }) => (
                  <MenuItem key={pl.id} value={pl.id}>
                    {pl.name}
                  </MenuItem>
                )
              )}
            </Select>

            <Input
              name="factor"
              label="Factor"
              type="number"
              placeholder="1.00"
              formik={formik}
            />
            <YesNoField
              name="is_default"
              label="Default Price List"
              formik={formik}
            />
            <div className="md:col-span-2">
              <Input
                name="description"
                label="Description"
                placeholder="Enter description"
                formik={formik}
                multiline
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h6 className="text-base font-semibold text-gray-900">
                {isEdit && 'Existing'} Price List Items
              </h6>
            </div>

            <Table
              compact={true}
              data={priceListItemsWithIndex}
              columns={priceListItemsColumns}
              getRowId={row => row._index.toString()}
              pagination={false}
              sortable={false}
              loading={isLoadingPriceList || isLoadingProducts}
              emptyMessage="No list items found."
            />

            {isEdit && (
              <>
                <div className="flex justify-between items-center">
                  <h6 className="text-base font-semibold text-gray-900">
                    New Price List Items
                  </h6>
                </div>

                <Table
                  compact={true}
                  data={newPriceListItemsWithIndex}
                  columns={newPriceListItemsColumns}
                  getRowId={row => row._index.toString()}
                  pagination={false}
                  sortable={false}
                  emptyMessage="No new list items found."
                />
              </>
            )}
            <Dialog
              open={showSpecialForIndex !== null}
              onClose={() => setShowSpecialForIndex(null)}
              maxWidth="xl"
              fullWidth
            >
              <DialogTitle className="flex justify-between items-center !py-2 !px-4 border-b border-gray-100">
                <div className="flex flex-col">
                  <span className="text-base font-bold text-gray-900 leading-tight">
                    Special Prices
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ActionButton
                    size="small"
                    onClick={() => setShowSpecialForIndex(null)}
                    icon={<Close fontSize="small" />}
                    tooltip="Close"
                  />
                </div>
              </DialogTitle>
              <DialogContent className="!p-0 ">
                {showSpecialForIndex !== null &&
                  priceListItems[showSpecialForIndex] && (
                    <div className="overflow-x-auto">
                      <Table
                        minHeight={400}
                        compact={true}
                        filterColunm={false}
                        actions={
                          <div className="flex justify-between items-center w-full">
                            <div className="flex flex-col">
                              {showSpecialForIndex !== null &&
                                priceListItems[showSpecialForIndex] && (
                                  <span className="font-bold text-sm">
                                    {
                                      products.find(
                                        p =>
                                          p.id ===
                                          priceListItems[showSpecialForIndex]
                                            .product_id
                                      )?.name
                                    }
                                  </span>
                                )}
                              <p className="text-xs text-gray-500">
                                Configure custom pricing based on routes,
                                categories, or specific customers.
                              </p>
                            </div>

                            <Button
                              type="button"
                              variant="outlined"
                              startIcon={<Add />}
                              size="small"
                              className="!py-1"
                              onClick={() =>
                                showSpecialForIndex !== null &&
                                addSpecialPrice(showSpecialForIndex)
                              }
                            >
                              Add Special Price
                            </Button>
                          </div>
                        }
                        data={(
                          priceListItems[showSpecialForIndex].special_prices ||
                          []
                        ).map((sp, idx) => ({ ...sp, _index: idx }))}
                        columns={[
                          {
                            id: 'valid_from',
                            label: 'From',
                            render: (_v, row: any) => (
                              <Input
                                compact={true}
                                type="date"
                                value={row.valid_from || ''}
                                onChange={e =>
                                  updateSpecialPrice(
                                    showSpecialForIndex,
                                    row._index,
                                    'valid_from',
                                    e.target.value
                                  )
                                }
                                size="small"
                                className="!min-w-28"
                              />
                            ),
                          },
                          {
                            id: 'valid_to',
                            label: 'To',
                            render: (_v, row: any) => (
                              <Input
                                compact={true}
                                type="date"
                                value={row.valid_to || ''}
                                onChange={e =>
                                  updateSpecialPrice(
                                    showSpecialForIndex,
                                    row._index,
                                    'valid_to',
                                    e.target.value
                                  )
                                }
                                size="small"
                                className="!min-w-28"
                              />
                            ),
                          },
                          {
                            id: 'route_id',
                            label: 'Route',
                            render: (_v, row: any) => (
                              <Select
                                compact={true}
                                value={row.route_id ?? ''}
                                onChange={(e: any) =>
                                  updateSpecialPrice(
                                    showSpecialForIndex,
                                    row._index,
                                    'route_id',
                                    e.target.value === ''
                                      ? null
                                      : e.target.value
                                  )
                                }
                                size="small"
                                className="!min-w-36"
                              >
                                <MenuItem value="">None</MenuItem>
                                {routes.map((r: any) => (
                                  <MenuItem
                                    key={r.id}
                                    value={r.id}
                                    className="text-xs"
                                  >
                                    {r.name}
                                  </MenuItem>
                                ))}
                              </Select>
                            ),
                          },
                          {
                            id: 'customer_category_id',
                            label: 'Category',
                            render: (_v, row: any) => (
                              <Select
                                compact={true}
                                value={row.customer_category_id ?? ''}
                                onChange={(e: any) =>
                                  updateSpecialPrice(
                                    showSpecialForIndex,
                                    row._index,
                                    'customer_category_id',
                                    e.target.value === ''
                                      ? null
                                      : e.target.value
                                  )
                                }
                                size="small"
                                className="!min-w-36"
                              >
                                <MenuItem value="">None</MenuItem>
                                {categories.map((c: any) => (
                                  <MenuItem
                                    key={c.id}
                                    value={c.id}
                                    className="text-xs"
                                  >
                                    {c.category_name}
                                  </MenuItem>
                                ))}
                              </Select>
                            ),
                          },
                          {
                            id: 'customer_id',
                            label: 'Customer',
                            render: (_v, row: any) => (
                              <Select
                                compact={true}
                                value={row.customer_id ?? ''}
                                onChange={(e: any) =>
                                  updateSpecialPrice(
                                    showSpecialForIndex,
                                    row._index,
                                    'customer_id',
                                    e.target.value === ''
                                      ? null
                                      : e.target.value
                                  )
                                }
                                size="small"
                                className="!min-w-40"
                              >
                                <MenuItem value="">None</MenuItem>
                                {customers.map((c: any) => (
                                  <MenuItem
                                    key={c.id}
                                    value={c.id}
                                    className="text-xs"
                                  >
                                    {c.name}
                                  </MenuItem>
                                ))}
                              </Select>
                            ),
                          },

                          {
                            id: 'original_price',
                            label: 'Orig. Price',
                            render: () => (
                              <span className="text-xs">
                                {priceListItems[showSpecialForIndex]
                                  .unit_price || '0.00'}
                              </span>
                            ),
                          },
                          {
                            id: 'original_subunit',
                            label: 'Orig. Subunit',
                            render: () => (
                              <span className="text-xs">
                                {priceListItems[showSpecialForIndex]
                                  .sub_unit_price || '0.00'}
                              </span>
                            ),
                          },
                          {
                            id: 'sale_price',
                            label: 'Sale Price',
                            render: (_v, row: any) => (
                              <Input
                                compact={true}
                                type="number"
                                value={row.sale_price}
                                onChange={e =>
                                  updateSpecialPrice(
                                    showSpecialForIndex,
                                    row._index,
                                    'sale_price',
                                    e.target.value
                                  )
                                }
                                size="small"
                                className="!min-w-24"
                              />
                            ),
                          },
                          {
                            id: 'sale_sub_unit_price',
                            label: 'Sale Subunit',
                            render: (_v, row: any) => (
                              <Input
                                compact={true}
                                type="number"
                                value={row.sale_sub_unit_price || ''}
                                onChange={e =>
                                  updateSpecialPrice(
                                    showSpecialForIndex,
                                    row._index,
                                    'sale_sub_unit_price',
                                    e.target.value
                                  )
                                }
                                size="small"
                                className="!min-w-24"
                              />
                            ),
                          },
                          {
                            id: 'tax_percent',
                            label: 'Tax%',
                            render: (_v, row: any) => (
                              <Input
                                type="number"
                                compact={true}
                                value={row.tax_percent || ''}
                                onChange={e =>
                                  updateSpecialPrice(
                                    showSpecialForIndex,
                                    row._index,
                                    'tax_percent',
                                    e.target.value
                                  )
                                }
                                size="small"
                                className="!min-w-16"
                              />
                            ),
                          },
                          {
                            id: 'discount_percent',
                            label: 'Disc%',
                            render: (_v, row: any) => (
                              <Input
                                compact={true}
                                type="number"
                                value={row.discount_percent || ''}
                                onChange={e =>
                                  updateSpecialPrice(
                                    showSpecialForIndex,
                                    row._index,
                                    'discount_percent',
                                    e.target.value
                                  )
                                }
                                size="small"
                                className="!min-w-16"
                              />
                            ),
                          },
                          {
                            id: 'actions',
                            label: 'Actions',
                            sortable: false,
                            render: (_v, row: any) => (
                              <DeleteButton
                                onClick={() =>
                                  removeSpecialPrice(
                                    showSpecialForIndex,
                                    row._index
                                  )
                                }
                                tooltip="Remove"
                                confirmDelete={true}
                                itemName="special price"
                                size="small"
                              />
                            ),
                          },
                        ]}
                        pagination={false}
                        sortable={false}
                        emptyMessage="No special prices added."
                      />
                    </div>
                  )}
                <div className="flex items-center justify-end p-2">
                  <Button
                    type="button"
                    variant="contained"
                    className="!h-8"
                    onClick={() => setShowSpecialForIndex(null)}
                    disabled={
                      createPriceListMutation.isPending ||
                      updatePriceListMutation.isPending
                    }
                  >
                    Save Special Prices
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              disabled={
                createPriceListMutation.isPending ||
                updatePriceListMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createPriceListMutation.isPending ||
                updatePriceListMutation.isPending
              }
            >
              {createPriceListMutation.isPending ||
              updatePriceListMutation.isPending
                ? isEdit
                  ? 'Updating...'
                  : 'Creating...'
                : isEdit
                  ? 'Update'
                  : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </CustomDrawer>
  );
};

export default ManagePriceList;
