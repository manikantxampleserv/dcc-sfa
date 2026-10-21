/**
 * @fileoverview Manage Promotional Material Drawer Component
 * @description Drawer form for creating and editing promotional materials
 * @version 1.0.0
 */

import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreatePromotionalMaterial,
  useUpdatePromotionalMaterial,
  type PromotionalMaterial,
} from 'hooks/usePromotionalMaterials';
import React, { useEffect } from 'react';
import { promotionalMaterialValidationSchema } from 'schemas/promotionalMaterials.schema';
import ActiveInactiveField from 'shared/ActiveInactiveField';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';

const UOM_OPTIONS = ['Pcs', 'Units', 'Boxes', 'Sets', 'Rolls', 'Packs', 'Bags'];

interface ManagePromotionalMaterialProps {
  selectedMaterial?: PromotionalMaterial | null;
  setSelectedMaterial: (material: PromotionalMaterial | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManagePromotionalMaterial: React.FC<ManagePromotionalMaterialProps> = ({
  selectedMaterial,
  setSelectedMaterial,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedMaterial;

  const createMaterialMutation = useCreatePromotionalMaterial();
  const updateMaterialMutation = useUpdatePromotionalMaterial();

  const formik = useFormik({
    initialValues: {
      code: selectedMaterial?.code || '',
      name: selectedMaterial?.name || '',
      uom: selectedMaterial?.uom || 'Pcs',
      default_unit_value: selectedMaterial?.default_unit_value ?? '',
      description: selectedMaterial?.description || '',
      is_active: selectedMaterial?.is_active || 'Y',
    },
    validationSchema: promotionalMaterialValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const payload = {
          code: values.code ? values.code.trim() : undefined,
          name: values.name.trim(),
          uom: values.uom.trim(),
          default_unit_value:
            values.default_unit_value === '' ||
            values.default_unit_value === null
              ? null
              : Number(values.default_unit_value),
          description: values.description ? values.description.trim() : null,
          is_active: values.is_active,
        };

        if (isEdit && selectedMaterial) {
          await updateMaterialMutation.mutateAsync({
            id: selectedMaterial.id,
            data: payload,
          });
        } else {
          await createMaterialMutation.mutateAsync(payload);
        }

        handleCancel();
      } catch (error) {
        console.error('Error submitting promotional material:', error);
      }
    },
  });

  const handleCancel = () => {
    setSelectedMaterial(null);
    formik.resetForm();
    setDrawerOpen(false);
  };

  useEffect(() => {
    if (!drawerOpen) {
      formik.resetForm();
    }
  }, [drawerOpen]);

  const isSubmitting =
    createMaterialMutation.isPending || updateMaterialMutation.isPending;

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={
        isEdit ? 'Edit Promotional Material' : 'Create Promotional Material'
      }
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Input
              name="name"
              label="Material Name"
              placeholder="e.g. Branded T-Shirt (Large)"
              formik={formik}
              required
            />
            <Input
              name="code"
              label="Item Code"
              placeholder={isEdit ? '' : 'Leave blank to auto-generate'}
              formik={formik}
              disabled={isEdit}
              helperText={
                isEdit
                  ? undefined
                  : 'Optional: leave blank to auto-generate (e.g. PM-0001)'
              }
            />

            <Select
              name="uom"
              label="Unit of Measurement (UOM)"
              formik={formik}
              required
            >
              {UOM_OPTIONS.map(unit => (
                <MenuItem key={unit} value={unit}>
                  {unit}
                </MenuItem>
              ))}
            </Select>

            <Input
              name="default_unit_value"
              label="Default Unit Value"
              placeholder="e.g. 15000"
              type="number"
              formik={formik}
            />

            <Box className="md:!col-span-2">
              <Input
                name="description"
                label="Description"
                placeholder="Enter details, campaign context, or marketing material specifications..."
                multiline
                rows={3}
                formik={formik}
              />
            </Box>

            <Box className="md:!col-span-2">
              <ActiveInactiveField name="is_active" formik={formik} />
            </Box>
          </Box>

          <Box className="!flex !justify-end !pt-4">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              className="!mr-3"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting
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

export default ManagePromotionalMaterial;
