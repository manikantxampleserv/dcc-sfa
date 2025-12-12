import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateProductSubCategory,
  useUpdateProductSubCategory,
  type ProductSubCategory,
} from 'hooks/useProductSubCategories';
import React from 'react';
import { productSubCategoryValidationSchema } from 'schemas/productSubCategory.schema';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import ProductCategorySelect from 'shared/ProductCategorySelect';
import Select from 'shared/Select';

interface ManageProductSubCategoryProps {
  selectedProductSubCategory?: ProductSubCategory | null;
  setSelectedProductSubCategory: (
    productSubCategory: ProductSubCategory | null
  ) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageProductSubCategory: React.FC<ManageProductSubCategoryProps> = ({
  selectedProductSubCategory,
  setSelectedProductSubCategory,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedProductSubCategory;

  const handleCancel = () => {
    setSelectedProductSubCategory(null);
    setDrawerOpen(false);
  };

  const createProductSubCategoryMutation = useCreateProductSubCategory();
  const updateProductSubCategoryMutation = useUpdateProductSubCategory();



  const formik = useFormik({
    initialValues: {
      sub_category_name: selectedProductSubCategory?.sub_category_name || '',
      product_category_id: selectedProductSubCategory?.product_category_id || 0,
      description: selectedProductSubCategory?.description || '',
      is_active: selectedProductSubCategory?.is_active || 'Y',
    },
    validationSchema: productSubCategoryValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const productSubCategoryData = {
          sub_category_name: values.sub_category_name,
          product_category_id: values.product_category_id,
          description: values.description || undefined,
          is_active: values.is_active,
        };

        if (isEdit && selectedProductSubCategory) {
          await updateProductSubCategoryMutation.mutateAsync({
            id: selectedProductSubCategory.id,
            data: productSubCategoryData,
          });
        } else {
          await createProductSubCategoryMutation.mutateAsync(
            productSubCategoryData
          );
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving product sub category:', error);
      }
    },
  });

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={
        isEdit ? 'Edit Product Sub Category' : 'Create Product Sub Category'
      }
      size="medium"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Box className="md:!col-span-2">
              <Input
                name="sub_category_name"
                label="Sub Category Name"
                placeholder="Enter sub category name"
                formik={formik}
                required
              />
            </Box>

            <Box className="md:!col-span-2">
              <ProductCategorySelect
                name="product_category_id"
                label="Product Category"
                formik={formik}
                required
                fullWidth
              />
            </Box>

            <Box className="md:!col-span-2">
              <Input
                name="description"
                label="Description"
                placeholder="Enter description"
                formik={formik}
                multiline
                rows={3}
              />
            </Box>

            <Select name="is_active" label="Status" formik={formik} required>
              <MenuItem value="Y">Active</MenuItem>
              <MenuItem value="N">Inactive</MenuItem>
            </Select>
          </Box>

          <Box className="!flex !justify-end">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              className="!mr-3"
              disabled={
                createProductSubCategoryMutation.isPending ||
                updateProductSubCategoryMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createProductSubCategoryMutation.isPending ||
                updateProductSubCategoryMutation.isPending
              }
            >
              {createProductSubCategoryMutation.isPending ||
              updateProductSubCategoryMutation.isPending
                ? isEdit
                  ? 'Updating...'
                  : 'Creating...'
                : isEdit
                  ? 'Update'
                  : 'Create'}{' '}
            </Button>
          </Box>
        </form>
      </Box>
    </CustomDrawer>
  );
};

export default ManageProductSubCategory;
