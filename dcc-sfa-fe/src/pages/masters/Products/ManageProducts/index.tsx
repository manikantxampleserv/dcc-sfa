import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import { useBrands, type Brand } from 'hooks/useBrands';
import {
  useProductSubCategories,
  type ProductSubCategory,
} from 'hooks/useProductSubCategories';
import {
  useCreateProduct,
  useUpdateProduct,
  type Product,
} from 'hooks/useProducts';
import {
  useUnitOfMeasurement,
  type UnitOfMeasurement,
} from 'hooks/useUnitOfMeasurement';
import { useRouteTypes, type RouteType } from 'hooks/useRouteTypes';
import { useOutletGroups, type OutletGroup } from 'hooks/useOutletGroups';
import React from 'react';
import { productValidationSchema } from 'schemas/product.schema';
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
  const isEdit = !!selectedProduct;

  const handleCancel = () => {
    setSelectedProduct(null);
    setDrawerOpen(false);
  };

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  // Fetch dropdown data
  const { data: subCategoriesResponse } = useProductSubCategories({
    limit: 1000,
  });
  const { data: brandsResponse } = useBrands({ limit: 1000 });
  const { data: unitsResponse } = useUnitOfMeasurement({ limit: 1000 });
  const { data: routeTypesResponse } = useRouteTypes();
  const { data: outletGroupsResponse } = useOutletGroups({ limit: 1000 });

  const subCategories = subCategoriesResponse?.data || [];
  const brands = brandsResponse?.data || [];
  const units = unitsResponse?.data || [];
  const routeTypes = routeTypesResponse?.data || [];
  const outletGroups = outletGroupsResponse?.data || [];

  const formik = useFormik({
    initialValues: {
      name: selectedProduct?.name || '',
      description: selectedProduct?.description || '',
      category_id: selectedProduct?.category_id || '',
      sub_category_id: selectedProduct?.sub_category_id || '',
      brand_id: selectedProduct?.brand_id || '',
      unit_of_measurement: selectedProduct?.unit_of_measurement || '',
      base_price: selectedProduct?.base_price || '',
      tax_rate: selectedProduct?.tax_rate || '',
      route_type_id: selectedProduct?.route_type_id || '',
      outlet_group_id: selectedProduct?.outlet_group_id || '',
      tracking_type: selectedProduct?.tracking_type || 'None',
      is_active: selectedProduct?.is_active || 'Y',
    },
    validationSchema: productValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const productData = {
          name: values.name,
          description: values.description || undefined,
          category_id: Number(values.category_id),
          sub_category_id: Number(values.sub_category_id),
          brand_id: Number(values.brand_id),
          unit_of_measurement: Number(values.unit_of_measurement),
          base_price: values.base_price ? Number(values.base_price) : undefined,
          tax_rate: values.tax_rate ? Number(values.tax_rate) : undefined,
          route_type_id: values.route_type_id
            ? Number(values.route_type_id)
            : undefined,
          outlet_group_id: values.outlet_group_id
            ? Number(values.outlet_group_id)
            : undefined,
          tracking_type:
            values.tracking_type && values.tracking_type !== ''
              ? (values.tracking_type as 'None' | 'Batch' | 'Serial')
              : 'None',
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
      size="large"
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

            <Input
              name="tax_rate"
              label="Tax Rate (%)"
              type="number"
              placeholder="Enter tax rate percentage"
              formik={formik}
            />

            <Select name="route_type_id" label="Route Type" formik={formik}>
              <MenuItem value="">None</MenuItem>
              {routeTypes.map((routeType: RouteType) => (
                <MenuItem key={routeType.id} value={routeType.id}>
                  {routeType.name}
                </MenuItem>
              ))}
            </Select>

            <Select name="outlet_group_id" label="Outlet Group" formik={formik}>
              <MenuItem value="">None</MenuItem>
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

            <Select name="is_active" label="Status" formik={formik} required>
              <MenuItem value="Y">Active</MenuItem>
              <MenuItem value="N">Inactive</MenuItem>
            </Select>

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
                    ? 'Update Product'
                    : 'Create Product'}
            </Button>
          </Box>
        </form>
      </Box>
    </CustomDrawer>
  );
};

export default ManageProduct;
