import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateSalesTarget,
  useUpdateSalesTarget,
  type SalesTarget,
} from 'hooks/useSalesTargets';
import { useSalesTargetGroups } from 'hooks/useSalesTargetGroups';
import { useProductCategories } from 'hooks/useProductCategories';
import React from 'react';
import { salesTargetValidationSchema } from 'schemas/salesTarget.schema';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';

interface ManageSalesTargetProps {
  selectedTarget?: SalesTarget | null;
  setSelectedTarget: (target: SalesTarget | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageSalesTarget: React.FC<ManageSalesTargetProps> = ({
  selectedTarget,
  setSelectedTarget,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedTarget;

  // Fetch sales target groups
  const { data: groupsResponse } = useSalesTargetGroups({
    page: 1,
    limit: 1000,
  });
  const groups = groupsResponse?.data || [];

  // Fetch product categories
  const { data: categoriesResponse } = useProductCategories({
    page: 1,
    limit: 1000,
  });
  const categories = categoriesResponse?.data || [];

  const createTargetMutation = useCreateSalesTarget();
  const updateTargetMutation = useUpdateSalesTarget();

  const handleCancel = () => {
    setSelectedTarget(null);
    setDrawerOpen(false);
    formik.resetForm();
  };

  const formik = useFormik({
    initialValues: {
      sales_target_group_id: selectedTarget?.sales_target_group_id || 0,
      product_category_id: selectedTarget?.product_category_id || 0,
      target_quantity: selectedTarget?.target_quantity || '',
      target_amount: selectedTarget?.target_amount || '',
      start_date: selectedTarget?.start_date
        ? selectedTarget.start_date.split('T')[0]
        : '',
      end_date: selectedTarget?.end_date
        ? selectedTarget.end_date.split('T')[0]
        : '',
      is_active: selectedTarget?.is_active || 'Y',
    },
    validationSchema: salesTargetValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const submitData = {
          ...values,
          sales_target_group_id: Number(values.sales_target_group_id),
          product_category_id: Number(values.product_category_id),
          target_quantity: Number(values.target_quantity),
          target_amount: values.target_amount
            ? Number(values.target_amount)
            : undefined,
        };

        if (isEdit && selectedTarget) {
          await updateTargetMutation.mutateAsync({
            id: selectedTarget.id,
            data: submitData,
          });
        } else {
          await createTargetMutation.mutateAsync(submitData);
        }
        handleCancel();
      } catch (error) {
        console.error('Error submitting sales target:', error);
      }
    },
  });

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Sales Target' : 'Create Sales Target'}
      size="large"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Select
              name="sales_target_group_id"
              label="Sales Target Group"
              formik={formik}
              required
            >
              {groups.map((group: any) => (
                <MenuItem key={group.id} value={group.id}>
                  {group.group_name}
                </MenuItem>
              ))}
            </Select>

            <Select
              name="product_category_id"
              label="Product Category"
              formik={formik}
              required
            >
              {categories.map((category: any) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.category_name}
                </MenuItem>
              ))}
            </Select>

            <Input
              name="target_quantity"
              label="Target Quantity"
              type="number"
              placeholder="Enter target quantity"
              formik={formik}
              required
            />

            <Input
              name="target_amount"
              label="Target Amount"
              type="number"
              placeholder="Enter target amount (optional)"
              formik={formik}
            />

            <Input
              name="start_date"
              label="Start Date"
              type="date"
              formik={formik}
              required
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <Input
              name="end_date"
              label="End Date"
              type="date"
              formik={formik}
              required
              slotProps={{ inputLabel: { shrink: true } }}
            />

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
                createTargetMutation.isPending || updateTargetMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createTargetMutation.isPending || updateTargetMutation.isPending
              }
            >
              {createTargetMutation.isPending || updateTargetMutation.isPending
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

export default ManageSalesTarget;
