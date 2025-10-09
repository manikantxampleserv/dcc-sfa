import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import { useUsers } from 'hooks/useUsers';
import {
  useCreateKpiTarget,
  useUpdateKpiTarget,
  type KpiTarget,
} from 'hooks/useKpiTargets';
import React from 'react';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';
import { kpiTargetValidationSchema } from 'schemas/kpiTargets.schema';

interface ManageKpiTargetProps {
  selectedKpiTarget?: KpiTarget | null;
  setSelectedKpiTarget: (kpiTarget: KpiTarget | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageKpiTarget: React.FC<ManageKpiTargetProps> = ({
  selectedKpiTarget,
  setSelectedKpiTarget,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedKpiTarget;

  const { data: usersResponse } = useUsers({
    page: 1,
    limit: 1000,
    isActive: 'Y',
  });
  const users = usersResponse?.data || [];

  const createKpiTargetMutation = useCreateKpiTarget();
  const updateKpiTargetMutation = useUpdateKpiTarget();

  const handleCancel = () => {
    setSelectedKpiTarget(null);
    setDrawerOpen(false);
    formik.resetForm();
  };

  const formik = useFormik({
    initialValues: {
      employee_id: selectedKpiTarget?.employee_id || 0,
      kpi_name: selectedKpiTarget?.kpi_name || '',
      target_value: selectedKpiTarget?.target_value || '',
      measure_unit: selectedKpiTarget?.measure_unit || '',
      period_start: selectedKpiTarget?.period_start
        ? selectedKpiTarget.period_start.split('T')[0]
        : '',
      period_end: selectedKpiTarget?.period_end
        ? selectedKpiTarget.period_end.split('T')[0]
        : '',
      is_active: selectedKpiTarget?.is_active || 'Y',
    },
    validationSchema: kpiTargetValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const submitData = {
          ...values,
          employee_id: Number(values.employee_id),
          target_value: values.target_value.toString(),
          measure_unit: values.measure_unit || undefined,
        };

        if (isEdit && selectedKpiTarget) {
          await updateKpiTargetMutation.mutateAsync({
            id: selectedKpiTarget.id,
            data: submitData,
          });
        } else {
          await createKpiTargetMutation.mutateAsync(submitData);
        }
        handleCancel();
      } catch (error) {
        console.error('Error submitting KPI target:', error);
      }
    },
  });

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit KPI Target' : 'Create KPI Target'}
      size="large"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Select
              name="employee_id"
              label="Employee"
              formik={formik}
              required
            >
              <MenuItem value={0}>Select Employee</MenuItem>
              {users.map(user => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </MenuItem>
              ))}
            </Select>

            <Input
              name="kpi_name"
              label="KPI Name"
              placeholder="Enter KPI name"
              formik={formik}
              required
            />

            <Input
              name="target_value"
              label="Target Value"
              type="number"
              placeholder="Enter target value"
              formik={formik}
              required
            />

            <Input
              name="measure_unit"
              label="Measure Unit"
              placeholder="e.g., USD, %, visits"
              formik={formik}
            />

            <Input
              name="period_start"
              label="Period Start"
              type="date"
              formik={formik}
              required
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <Input
              name="period_end"
              label="Period End"
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
                createKpiTargetMutation.isPending ||
                updateKpiTargetMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createKpiTargetMutation.isPending ||
                updateKpiTargetMutation.isPending
              }
            >
              {createKpiTargetMutation.isPending ||
              updateKpiTargetMutation.isPending
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

export default ManageKpiTarget;
