import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateSalesBonusRule,
  useUpdateSalesBonusRule,
  type SalesBonusRule,
} from 'hooks/useSalesBonusRules';
import { useSalesTargets } from 'hooks/useSalesTargets';
import React from 'react';
import { salesBonusRuleValidationSchema } from 'schemas/salesBonusRule.schema';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';

interface ManageSalesBonusRuleProps {
  selectedRule?: SalesBonusRule | null;
  setSelectedRule: (rule: SalesBonusRule | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageSalesBonusRule: React.FC<ManageSalesBonusRuleProps> = ({
  selectedRule,
  setSelectedRule,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedRule;

  // Fetch sales targets
  const { data: targetsResponse } = useSalesTargets({
    page: 1,
    limit: 1000,
    is_active: 'Y', // Only show active targets
  });
  const targets = targetsResponse?.data || [];

  const createRuleMutation = useCreateSalesBonusRule();
  const updateRuleMutation = useUpdateSalesBonusRule();

  const handleCancel = () => {
    setSelectedRule(null);
    setDrawerOpen(false);
    formik.resetForm();
  };

  const formik = useFormik({
    initialValues: {
      sales_target_id: selectedRule?.sales_target_id || 0,
      achievement_min_percent: selectedRule?.achievement_min_percent || '',
      achievement_max_percent: selectedRule?.achievement_max_percent || '',
      bonus_amount: selectedRule?.bonus_amount || '',
      bonus_percent: selectedRule?.bonus_percent || '',
      is_active: selectedRule?.is_active || 'Y',
    },
    validationSchema: salesBonusRuleValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const submitData = {
          ...values,
          sales_target_id: Number(values.sales_target_id),
          achievement_min_percent: Number(values.achievement_min_percent),
          achievement_max_percent: Number(values.achievement_max_percent),
          bonus_amount: values.bonus_amount
            ? Number(values.bonus_amount)
            : undefined,
          bonus_percent: values.bonus_percent
            ? Number(values.bonus_percent)
            : undefined,
        };

        if (isEdit && selectedRule) {
          await updateRuleMutation.mutateAsync({
            id: selectedRule.id,
            data: submitData,
          });
        } else {
          await createRuleMutation.mutateAsync(submitData);
        }
        handleCancel();
      } catch (error) {
        console.error('Error submitting sales bonus rule:', error);
      }
    },
  });

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Sales Bonus Rule' : 'Create Sales Bonus Rule'}
      size="large"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Select
              name="sales_target_id"
              label="Sales Target"
              formik={formik}
              required
            >
              {targets.map((target: any) => (
                <MenuItem key={target.id} value={target.id}>
                  {target.sales_target_group?.group_name || 'Unknown Group'} -{' '}
                  {target.product_category?.category_name || 'Unknown Category'}{' '}
                  (Qty: {target.target_quantity})
                </MenuItem>
              ))}
            </Select>

            <Select name="is_active" label="Status" formik={formik} required>
              <MenuItem value="Y">Active</MenuItem>
              <MenuItem value="N">Inactive</MenuItem>
            </Select>

            <Input
              name="achievement_min_percent"
              label="Minimum Achievement %"
              type="number"
              placeholder="Enter minimum achievement percentage"
              formik={formik}
              required
              inputProps={{ min: 0, max: 100, step: 0.01 }}
            />

            <Input
              name="achievement_max_percent"
              label="Maximum Achievement %"
              type="number"
              placeholder="Enter maximum achievement percentage"
              formik={formik}
              required
              inputProps={{ min: 0, max: 100, step: 0.01 }}
            />

            <Input
              name="bonus_amount"
              label="Bonus Amount"
              type="number"
              placeholder="Enter bonus amount (optional)"
              formik={formik}
              inputProps={{ min: 0, step: 0.01 }}
            />

            <Input
              name="bonus_percent"
              label="Bonus Percentage"
              type="number"
              placeholder="Enter bonus percentage (optional)"
              formik={formik}
              inputProps={{ min: 0, max: 100, step: 0.01 }}
            />
          </Box>

          <Box className="!bg-blue-50 !p-4 !rounded-lg">
            <h4 className="!text-sm !font-medium !text-blue-900 !mb-2">
              Rule Information
            </h4>
            <ul className="!text-sm !text-blue-800 !space-y-1">
              <li>
                • Either bonus amount or bonus percentage must be provided
              </li>
              <li>
                • Minimum achievement percentage must be less than maximum
              </li>
              <li>• Achievement percentages should be between 0% and 100%</li>
              <li>• Bonus percentage should be between 0% and 100%</li>
            </ul>
          </Box>

          <Box className="!flex !justify-end">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              className="!mr-3"
              disabled={
                createRuleMutation.isPending || updateRuleMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createRuleMutation.isPending || updateRuleMutation.isPending
              }
            >
              {createRuleMutation.isPending || updateRuleMutation.isPending
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

export default ManageSalesBonusRule;
