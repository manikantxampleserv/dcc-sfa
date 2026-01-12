import { Box, MenuItem } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useFormik } from 'formik';
import { useBrands, type Brand } from 'hooks/useBrands';
import { useOutletGroups, type OutletGroup } from 'hooks/useOutletGroups';
import {
  useProductSubCategories,
  type ProductSubCategory,
} from 'hooks/useProductSubCategories';
import {
  useCreateProduct,
  useUpdateProduct,
  type Product,
} from 'hooks/useProducts';
import { useRouteTypes, type RouteType } from 'hooks/useRouteTypes';
import { useTaxMasters, type TaxMaster } from 'hooks/useTaxMaster';
import {
  useUnitOfMeasurement,
  type UnitOfMeasurement,
} from 'hooks/useUnitOfMeasurement';
import React, { useRef, useState } from 'react';
import { productValidationSchema } from 'schemas/product.schema';
import {
  fetchProductFlavoursDropdown,
  type ProductFlavourDropdown,
} from 'services/masters/ProductFlavours';
import {
  fetchProductShelfLifeDropdown,
  type ProductShelfLifeDropdown,
} from 'services/masters/ProductShelfLife';
import {
  fetchProductTargetGroupsDropdown,
  type ProductTargetGroupDropdown,
} from 'services/masters/ProductTargetGroups';
import {
  fetchProductTypesDropdown,
  type ProductTypeDropdown,
} from 'services/masters/ProductTypes';
import {
  fetchProductVolumesDropdown,
  type ProductVolumeDropdown,
} from 'services/masters/ProductVolumes';
import {
  fetchProductWebOrdersDropdown,
  type ProductWebOrderDropdown,
} from 'services/masters/ProductWebOrders';
import ActiveInactiveField from 'shared/ActiveInactiveField';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import ProductCategorySelect from 'shared/ProductCategorySelect';
import Select from 'shared/Select';

interface ManageProductProps {
  selectedProduct?: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageProduct: React.FC<ManageProductProps> = ({
  selectedProduct,
  setSelectedProduct,
  drawerOpen,
  setDrawerOpen,
}) => {
  const [selectedBatchLots, setSelectedBatchLots] = useState<
    Array<{
      batch_lot_id: number;
      batch_number: string;
      lot_number?: string | null;
      remaining_quantity: number;
      expiry_date: string;
      quantity: number;
    }>
  >([]);
  const hasLoadedBatchLotsRef = useRef(false);
  const isEdit = !!selectedProduct;

  const handleCancel = () => {
    setSelectedProduct(null);
    setDrawerOpen(false);
    setSelectedBatchLots([]);
    formik.resetForm();
    hasLoadedBatchLotsRef.current = false;
  };

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  const { data: subCategoriesResponse } = useProductSubCategories({
    limit: 1000,
    status: 'active',
  });

  const { data: brandsResponse } = useBrands({ limit: 1000, status: 'active' });

  const { data: unitsResponse } = useUnitOfMeasurement({
    limit: 1000,
    status: 'active',
  });

  const { data: routeTypesResponse } = useRouteTypes({
    limit: 1000,
    status: 'active',
  });

  const { data: outletGroupsResponse } = useOutletGroups({
    limit: 1000,
    isActive: 'active',
  });

  const { data: taxMastersResponse } = useTaxMasters({
    limit: 1000,
    isActive: 'Y',
  });

  const subCategories = subCategoriesResponse?.data || [];
  const brands = brandsResponse?.data || [];
  const units = unitsResponse?.data || [];
  const routeTypes = routeTypesResponse?.data || [];
  const outletGroups = outletGroupsResponse?.data || [];
  const taxMasters = taxMastersResponse?.data || [];

  const { data: productTypesResponse } = useQuery({
    queryKey: ['product-types-dropdown'],
    queryFn: () => fetchProductTypesDropdown(),
  });

  const { data: productTargetGroupsResponse } = useQuery({
    queryKey: ['product-target-groups-dropdown'],
    queryFn: () => fetchProductTargetGroupsDropdown(),
  });

  const { data: productWebOrdersResponse } = useQuery({
    queryKey: ['product-web-orders-dropdown'],
    queryFn: () => fetchProductWebOrdersDropdown(),
  });

  const { data: productVolumesResponse } = useQuery({
    queryKey: ['product-volumes-dropdown'],
    queryFn: () => fetchProductVolumesDropdown(),
  });

  const { data: productFlavoursResponse } = useQuery({
    queryKey: ['product-flavours-dropdown'],
    queryFn: () => fetchProductFlavoursDropdown(),
  });

  const { data: productShelfLifeResponse } = useQuery({
    queryKey: ['product-shelf-life-dropdown'],
    queryFn: () => fetchProductShelfLifeDropdown(),
  });

  const productTypes = productTypesResponse?.data || [];
  const productTargetGroups = productTargetGroupsResponse?.data || [];
  const productWebOrders = productWebOrdersResponse?.data || [];
  const productVolumes = productVolumesResponse?.data || [];
  const productFlavours = productFlavoursResponse?.data || [];
  const productShelfLife = productShelfLifeResponse?.data || [];

  const formik = useFormik({
    initialValues: {
      name: selectedProduct?.name || '',
      description: selectedProduct?.description || '',
      category_id: selectedProduct?.category_id || '',
      sub_category_id: selectedProduct?.sub_category_id || '',
      brand_id: selectedProduct?.brand_id || '',
      unit_of_measurement: selectedProduct?.unit_of_measurement || '',
      base_price: selectedProduct?.base_price
        ? Number(selectedProduct.base_price)
        : '',
      tax_id: selectedProduct?.tax_id || '',
      route_type_id: selectedProduct?.route_type_id || '',
      outlet_group_id: selectedProduct?.outlet_group_id || '',
      tracking_type: selectedProduct?.tracking_type || 'None',
      product_type_id: selectedProduct?.product_type_id || '',
      product_target_group_id: selectedProduct?.product_target_group_id || '',
      product_web_order_id: selectedProduct?.product_web_order_id || '',
      volume_id: selectedProduct?.volume_id || '',
      flavour_id: selectedProduct?.flavour_id || '',
      shelf_life_id: selectedProduct?.shelf_life_id || '',
      weight_in_grams: selectedProduct?.weight_in_grams
        ? Number(selectedProduct.weight_in_grams)
        : '',
      volume_in_liters: selectedProduct?.volume_in_liters
        ? Number(selectedProduct.volume_in_liters)
        : '',
      is_active: selectedProduct?.is_active || 'Y',
    },
    validationSchema: productValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const productData = {
          name: values.name,
          description: values.description,
          category_id: Number(values.category_id),
          sub_category_id: Number(values.sub_category_id),
          brand_id: Number(values.brand_id),
          unit_of_measurement: Number(values.unit_of_measurement),
          base_price: values.base_price ? Number(values.base_price) : undefined,
          tax_id: values.tax_id ? Number(values.tax_id) : undefined,
          route_type_id: values.route_type_id
            ? Number(values.route_type_id)
            : undefined,
          outlet_group_id: values.outlet_group_id
            ? Number(values.outlet_group_id)
            : undefined,
          tracking_type:
            values.tracking_type &&
            values.tracking_type !== '' &&
            values.tracking_type !== 'None'
              ? (values.tracking_type as 'Batch' | 'Serial')
              : null,
          batch_lots: selectedBatchLots
            .filter(bl => bl.batch_lot_id > 0)
            .map(bl => ({
              batch_lot_id: bl.batch_lot_id,
              quantity: bl.quantity || 0,
            })),
          product_type_id: values.product_type_id
            ? Number(values.product_type_id)
            : undefined,
          product_target_group_id: values.product_target_group_id
            ? Number(values.product_target_group_id)
            : undefined,
          product_web_order_id: values.product_web_order_id
            ? Number(values.product_web_order_id)
            : undefined,
          volume_id: values.volume_id ? Number(values.volume_id) : undefined,
          flavour_id: values.flavour_id ? Number(values.flavour_id) : undefined,
          shelf_life_id: values.shelf_life_id
            ? Number(values.shelf_life_id)
            : undefined,
          weight_in_grams: values.weight_in_grams
            ? Number(values.weight_in_grams)
            : undefined,
          volume_in_liters: values.volume_in_liters
            ? Number(values.volume_in_liters)
            : undefined,
          is_active: values.is_active,
        };

        if (isEdit && selectedProduct) {
          await updateProductMutation.mutateAsync({
            id: selectedProduct.id,
            ...productData,
          });
        } else {
          await createProductMutation.mutateAsync(productData);
        }
        handleCancel();
      } catch (error) {
        console.error('Error saving product:', error);
      }
    },
  });

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Product' : 'Create Product'}
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Input
              name="name"
              label="Product Name"
              placeholder="Enter product name"
              formik={formik}
              required
            />

            <ProductCategorySelect
              name="category_id"
              label="Category"
              formik={formik}
              required
            />

            <Select
              name="sub_category_id"
              label="Sub-Category"
              formik={formik}
              required
            >
              {subCategories.map((subCategory: ProductSubCategory) => (
                <MenuItem key={subCategory.id} value={subCategory.id}>
                  {subCategory.sub_category_name}
                </MenuItem>
              ))}
            </Select>

            <Select name="brand_id" label="Brand" formik={formik} required>
              {brands.map((brand: Brand) => (
                <MenuItem key={brand.id} value={brand.id}>
                  {brand.name}
                </MenuItem>
              ))}
            </Select>

            <Select
              name="unit_of_measurement"
              label="Unit of Measurement"
              formik={formik}
              required
            >
              {units.map((unit: UnitOfMeasurement) => (
                <MenuItem key={unit.id} value={unit.id}>
                  {unit.name} {unit.symbol && `(${unit.symbol})`}
                </MenuItem>
              ))}
            </Select>

            <Input
              name="base_price"
              label="Base Price"
              type="number"
              placeholder="Enter base price"
              formik={formik}
            />

            <Select name="tax_id" label="Tax Rate" formik={formik}>
              {taxMasters.map((tax: TaxMaster) => (
                <MenuItem key={tax.id} value={tax.id}>
                  {tax.name} ({tax.code}) -{' '}
                  {tax.tax_rate ? `${tax.tax_rate}%` : '0%'}
                </MenuItem>
              ))}
            </Select>

            <Select name="route_type_id" label="Route Type" formik={formik}>
              {routeTypes.map((routeType: RouteType) => (
                <MenuItem key={routeType.id} value={routeType.id}>
                  {routeType.name}
                </MenuItem>
              ))}
            </Select>

            <Select name="outlet_group_id" label="Outlet Group" formik={formik}>
              {outletGroups.map((outletGroup: OutletGroup) => (
                <MenuItem key={outletGroup.id} value={outletGroup.id}>
                  {outletGroup.name}
                </MenuItem>
              ))}
            </Select>

            <Select name="tracking_type" label="Batch/Serial" formik={formik}>
              <MenuItem value="None">None</MenuItem>
              <MenuItem value="Batch">Batch</MenuItem>
              <MenuItem value="Serial">Serial</MenuItem>
            </Select>

            <Select name="product_type_id" label="Product Type" formik={formik}>
              {productTypes.map((productType: ProductTypeDropdown) => (
                <MenuItem key={productType.id} value={productType.id}>
                  {productType.name}
                </MenuItem>
              ))}
            </Select>

            <Select
              name="product_target_group_id"
              label="Product Target Group"
              formik={formik}
            >
              {productTargetGroups.map(
                (targetGroup: ProductTargetGroupDropdown) => (
                  <MenuItem key={targetGroup.id} value={targetGroup.id}>
                    {targetGroup.name}
                  </MenuItem>
                )
              )}
            </Select>

            <Select
              name="product_web_order_id"
              label="Web Order"
              formik={formik}
            >
              {productWebOrders.map((webOrder: ProductWebOrderDropdown) => (
                <MenuItem key={webOrder.id} value={webOrder.id}>
                  {webOrder.name}
                </MenuItem>
              ))}
            </Select>

            <Select name="volume_id" label="Volume" formik={formik}>
              {productVolumes.map((volume: ProductVolumeDropdown) => (
                <MenuItem key={volume.id} value={volume.id}>
                  {volume.name}
                </MenuItem>
              ))}
            </Select>

            <Select name="flavour_id" label="Flavour" formik={formik}>
              {productFlavours.map((flavour: ProductFlavourDropdown) => (
                <MenuItem key={flavour.id} value={flavour.id}>
                  {flavour.name}
                </MenuItem>
              ))}
            </Select>

            <Select name="shelf_life_id" label="Shelf Life" formik={formik}>
              {productShelfLife.map((shelfLife: ProductShelfLifeDropdown) => (
                <MenuItem key={shelfLife.id} value={shelfLife.id}>
                  {shelfLife.name}
                </MenuItem>
              ))}
            </Select>

            <Input
              name="weight_in_grams"
              label="Weight (grams)"
              type="number"
              placeholder="Enter weight in grams"
              formik={formik}
            />

            <Input
              name="volume_in_liters"
              label="Volume (liters)"
              type="number"
              placeholder="Enter volume in liters"
              formik={formik}
            />

            <ActiveInactiveField
              name="is_active"
              label="Status"
              formik={formik}
            />

            <Box className="md:!col-span-2">
              <Input
                name="description"
                label="Description"
                placeholder="Enter product description"
                formik={formik}
                multiline
                rows={3}
              />
            </Box>
          </Box>

          <Box className="!flex !justify-end items-center gap-2">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              disabled={
                createProductMutation.isPending ||
                updateProductMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              loading={
                createProductMutation.isPending ||
                updateProductMutation.isPending
              }
            >
              {createProductMutation.isPending
                ? 'Creating...'
                : updateProductMutation.isPending
                  ? 'Updating...'
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

export default ManageProduct;
