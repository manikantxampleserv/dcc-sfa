import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateProductCategory,
  useUpdateProductCategory,
  type ProductCategory,
} from 'hooks/useProductCategories';
import React from 'react';
import { productCategoryValidationSchema } from 'schemas/productCategory.schema';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';

interface ManageProductCategoryProps {
  selectedProductCategory?: ProductCategory | null;
  setSelectedProductCategory: (productCategory: ProductCategory | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageProductCategory: React.FC<ManageProductCategoryProps> = ({
  selectedProductCategory,
  setSelectedProductCategory,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedProductCategory;

  const handleCancel = () => {
    setSelectedProductCategory(null);
    setDrawerOpen(false);
  };

  const createProductCategoryMutation = useCreateProductCategory();
  const updateProductCategoryMutation = useUpdateProductCategory();

  const formik = useFormik({
    initialValues: {
      category_name: selectedProductCategory?.category_name || '',
      description: selectedProductCategory?.description || '',
      is_active: selectedProductCategory?.is_active || 'Y',
    },
    validationSchema: productCategoryValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const productCategoryData = {
          category_name: values.category_name,
          description: values.description || undefined,
          is_active: values.is_active,
        };

        if (isEdit && selectedProductCategory) {
          await updateProductCategoryMutation.mutateAsync({
            id: selectedProductCategory.id,
            data: productCategoryData,
          });
        } else {
          await createProductCategoryMutation.mutateAsync(productCategoryData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving product category:', error);
      }
    },
  });

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Product Category' : 'Create Product Category'}
      size="medium"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Box className="md:!col-span-2">
              <Input
                name="category_name"
                label="Category Name"
                placeholder="Enter category name"
                formik={formik}
                required
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
                createProductCategoryMutation.isPending ||
                updateProductCategoryMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createProductCategoryMutation.isPending ||
                updateProductCategoryMutation.isPending
              }
            >
              {createProductCategoryMutation.isPending ||
              updateProductCategoryMutation.isPending
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

export default ManageProductCategory;
