import { Box } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateTaxMaster,
  useTaxMasterById,
  useUpdateTaxMaster,
  type TaxMaster,
} from 'hooks/useTaxMaster';
import React from 'react';
import ActiveInactiveField from 'shared/ActiveInactiveField';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import * as Yup from 'yup';

interface ManageTaxMasterProps {
  selectedTaxMaster?: TaxMaster | null;
  setSelectedTaxMaster: (taxMaster: TaxMaster | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const taxMasterValidationSchema = Yup.object({
  name: Yup.string()
    .required('Tax name is required')
    .min(2, 'Tax name must be at least 2 characters')
    .max(255, 'Tax name must be less than 255 characters'),
  code: Yup.string()
    .required('Tax code is required')
    .min(2, 'Tax code must be at least 2 characters')
    .max(100, 'Tax code must be less than 100 characters'),
  tax_rate: Yup.number()
    .required('Tax rate is required')
    .min(0, 'Tax rate must be at least 0')
    .max(100, 'Tax rate must be at most 100'),
  description: Yup.string().max(
    500,
    'Description must be less than 500 characters'
  ),
  is_active: Yup.string().oneOf(['Y', 'N']).required('Status is required'),
});

const ManageTaxMaster: React.FC<ManageTaxMasterProps> = ({
  selectedTaxMaster,
  setSelectedTaxMaster,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedTaxMaster;

  const handleCancel = () => {
    setSelectedTaxMaster(null);
    setDrawerOpen(false);
    formik.resetForm();
  };

  const createTaxMasterMutation = useCreateTaxMaster();
  const updateTaxMasterMutation = useUpdateTaxMaster();

  const { data: taxMasterDetailResponse } = useTaxMasterById(
    selectedTaxMaster?.id || 0,
    { enabled: isEdit && !!selectedTaxMaster?.id }
  );

  const formik = useFormik({
    initialValues: {
      name: selectedTaxMaster?.name || '',
      code: selectedTaxMaster?.code || '',
      tax_rate: selectedTaxMaster?.tax_rate || 0,
      description: selectedTaxMaster?.description || '',
      is_active: selectedTaxMaster?.is_active || 'Y',
    },
    validationSchema: taxMasterValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const taxMasterData = {
          name: values.name,
          code: values.code,
          tax_rate: Number(values.tax_rate),
          description: values.description,
          is_active: values.is_active,
        };

        if (isEdit && selectedTaxMaster) {
          await updateTaxMasterMutation.mutateAsync({
            id: selectedTaxMaster.id,
            data: taxMasterData,
          });
        } else {
          await createTaxMasterMutation.mutateAsync(taxMasterData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving tax master:', error);
      }
    },
  });

  React.useEffect(() => {
    if (taxMasterDetailResponse && isEdit) {
      formik.setValues({
        name: taxMasterDetailResponse.name || '',
        code: taxMasterDetailResponse.code || '',
        tax_rate: taxMasterDetailResponse.tax_rate || 0,
        description: taxMasterDetailResponse.description || '',
        is_active: taxMasterDetailResponse.is_active || 'Y',
      });
    }
  }, [taxMasterDetailResponse, isEdit]);

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Tax Master' : 'Create Tax Master'}
      size="medium"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-4">
          <Input
            name="name"
            label="Tax Name"
            placeholder="Enter tax name"
            formik={formik}
            required
          />

          <Input
            name="code"
            label="Tax Code"
            placeholder="Enter tax code"
            formik={formik}
            required
            disabled={isEdit}
          />

          <Input
            name="tax_rate"
            label="Tax Rate (%)"
            type="number"
            placeholder="Enter tax rate (0-100)"
            formik={formik}
            required
            inputProps={{ min: 0, max: 100, step: 0.01 }}
          />

          <Input
            name="description"
            label="Description"
            placeholder="Enter description (optional)"
            formik={formik}
            multiline
            rows={3}
          />

          <ActiveInactiveField
            name="is_active"
            label="Status"
            formik={formik}
            required
          />

          <Box className="!flex !justify-end items-center gap-2 !mt-6 !pt-4">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              disabled={
                createTaxMasterMutation.isPending ||
                updateTaxMasterMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createTaxMasterMutation.isPending ||
                updateTaxMasterMutation.isPending
              }
            >
              {createTaxMasterMutation.isPending ||
              updateTaxMasterMutation.isPending
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

export default ManageTaxMaster;
