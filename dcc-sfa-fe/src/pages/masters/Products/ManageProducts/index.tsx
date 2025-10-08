import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateProduct,
  useUpdateProduct,
  type Product,
} from 'hooks/useProducts';
import React from 'react';
import { productValidationSchema } from 'schemas/product.schema';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
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

  const formik = useFormik({
    initialValues: {
      name: selectedProduct?.name || '',
      description: selectedProduct?.description || '',
      category: selectedProduct?.category || '',
      brand: selectedProduct?.brand || '',
      unit_of_measure: selectedProduct?.unit_of_measure || '',
      base_price: selectedProduct?.base_price || '',
      tax_rate: selectedProduct?.tax_rate || '',
      is_active: selectedProduct?.is_active || 'Y',
    },
    validationSchema: productValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const productData = {
          name: values.name,
          description: values.description || undefined,
          category: values.category || undefined,
          brand: values.brand || undefined,
          unit_of_measure: values.unit_of_measure || undefined,
          base_price: values.base_price ? Number(values.base_price) : undefined,
          tax_rate: values.tax_rate ? Number(values.tax_rate) : undefined,
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

            <Input
              name="category"
              label="Category"
              placeholder="Enter product category"
              formik={formik}
            />

            <Input
              name="brand"
              label="Brand"
              placeholder="Enter product brand"
              formik={formik}
            />

            <Input
              name="unit_of_measure"
              label="Unit of Measure"
              placeholder="e.g., Piece, Kilogram, Liter"
              formik={formik}
            />

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

          <Box className="!flex !justify-end items-center">
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
