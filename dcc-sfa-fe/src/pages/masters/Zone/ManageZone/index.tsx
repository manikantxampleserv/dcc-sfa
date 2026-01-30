import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateZone,
  useSupervisors,
  useUpdateZone,
  type Zone,
} from 'hooks/useZones';
import React from 'react';
import { zoneValidationSchema } from 'schemas/zone.schema';
import type { Depot } from 'services/masters/Depots';
import ActiveInactiveField from 'shared/ActiveInactiveField';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';

interface ManageZoneProps {
  selectedZone?: Zone | null;
  setSelectedZone: (zone: Zone | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
  depots: Depot[];
}

const ManageZone: React.FC<ManageZoneProps> = ({
  selectedZone,
  setSelectedZone,
  drawerOpen,
  setDrawerOpen,
  depots,
}) => {
  const isEdit = !!selectedZone;

  // Fetch only Area Sales Supervisors
  const { data: supervisorsData, isLoading: supervisorsLoading } =
    useSupervisors();
  const supervisors = supervisorsData?.data || [];

  const handleCancel = () => {
    setSelectedZone(null);
    setDrawerOpen(false);
    formik.resetForm();
  };

  const createZoneMutation = useCreateZone();
  const updateZoneMutation = useUpdateZone();

  const formik = useFormik({
    initialValues: {
      parent_id: selectedZone?.parent_id?.toString() || '',
      name: selectedZone?.name || '',
      description: selectedZone?.description || '',
      supervisor_id: selectedZone?.supervisor_id?.toString() || '',
      is_active: selectedZone?.is_active || 'Y',
    },
    validationSchema: zoneValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const zoneData = {
          parent_id: Number(values.parent_id),
          name: values.name,
          description: values.description,
          supervisor_id: values.supervisor_id
            ? Number(values.supervisor_id)
            : undefined,
          is_active: values.is_active,
        };

        if (isEdit && selectedZone) {
          await updateZoneMutation.mutateAsync({
            id: selectedZone.id,
            ...zoneData,
          });
        } else {
          await createZoneMutation.mutateAsync(zoneData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving zone:', error);
      }
    },
  });

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Zone' : 'Create Zone'}
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Select name="parent_id" label="Depot" formik={formik} required>
              {depots.map(depot => (
                <MenuItem key={depot.id} value={depot.id.toString()}>
                  {depot.name} ({depot.code})
                </MenuItem>
              ))}
            </Select>

            <Input
              name="name"
              label="Zone Name"
              placeholder="Enter zone name"
              formik={formik}
              required
            />

            <Select
              name="supervisor_id"
              label="Zone Supervisor"
              formik={formik}
              disabled={supervisorsLoading}
            >
              {supervisors.map(supervisor => (
                <MenuItem key={supervisor.id} value={supervisor.id.toString()}>
                  {supervisor.name}{' '}
                  {supervisor.employee_id && `(${supervisor.employee_id})`}
                </MenuItem>
              ))}
            </Select>

            <ActiveInactiveField
              name="is_active"
              formik={formik}
              required
              className="col-span-2"
            />

            <Box className="md:!col-span-2">
              <Input
                name="description"
                label="Description"
                placeholder="Enter zone description"
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
                createZoneMutation.isPending || updateZoneMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              loading={
                createZoneMutation.isPending || updateZoneMutation.isPending
              }
            >
              {createZoneMutation.isPending
                ? 'Creating...'
                : updateZoneMutation.isPending
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

export default ManageZone;
