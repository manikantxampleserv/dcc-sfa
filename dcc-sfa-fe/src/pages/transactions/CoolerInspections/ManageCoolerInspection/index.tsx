import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateCoolerInspection,
  useUpdateCoolerInspection,
  type CoolerInspection,
} from 'hooks/useCoolerInspections';
import { useCoolerInstallations } from 'hooks/useCoolerInstallations';
import { useUsers } from 'hooks/useUsers';
import { useVisits } from 'hooks/useVisits';
import React from 'react';
import { coolerInspectionValidationSchema } from 'schemas/coolerInspection.schema';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';
import { formatForDateInput } from 'utils/dateUtils';

interface ManageCoolerInspectionProps {
  selectedInspection?: CoolerInspection | null;
  setSelectedInspection: (inspection: CoolerInspection | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageCoolerInspection: React.FC<ManageCoolerInspectionProps> = ({
  selectedInspection,
  setSelectedInspection,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedInspection;

  const handleCancel = () => {
    setSelectedInspection(null);
    setDrawerOpen(false);
  };

  const createCoolerInspectionMutation = useCreateCoolerInspection();
  const updateCoolerInspectionMutation = useUpdateCoolerInspection();

  // Fetch data for dropdowns
  const { data: coolersResponse } = useCoolerInstallations({ limit: 1000 });
  const { data: usersResponse } = useUsers({ limit: 1000 });
  const { data: visitsResponse } = useVisits({ limit: 1000 });

  const coolers = coolersResponse?.data || [];
  const users = usersResponse?.data || [];
  const visits = visitsResponse?.data || [];

  const formik = useFormik({
    initialValues: {
      cooler_id: selectedInspection?.cooler_id || '',
      inspected_by: selectedInspection?.inspected_by || '',
      inspection_date: selectedInspection?.inspection_date
        ? formatForDateInput(selectedInspection.inspection_date)
        : '',
      temperature: selectedInspection?.temperature || '',
      is_working: selectedInspection?.is_working || 'Y',
      issues: selectedInspection?.issues || '',
      images: selectedInspection?.images || '',
      latitude: selectedInspection?.latitude || '',
      longitude: selectedInspection?.longitude || '',
      action_required: selectedInspection?.action_required || 'N',
      action_taken: selectedInspection?.action_taken || '',
      next_inspection_due: selectedInspection?.next_inspection_due
        ? formatForDateInput(selectedInspection.next_inspection_due)
        : '',
      visit_id: selectedInspection?.visit_id || '',
      is_active: selectedInspection?.is_active || 'Y',
    },
    validationSchema: coolerInspectionValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const inspectionData = {
          cooler_id: Number(values.cooler_id),
          inspected_by: Number(values.inspected_by),
          inspection_date: values.inspection_date || undefined,
          temperature: values.temperature
            ? Number(values.temperature)
            : undefined,
          is_working: values.is_working,
          issues: values.issues || undefined,
          images: values.images || undefined,
          latitude: values.latitude ? Number(values.latitude) : undefined,
          longitude: values.longitude ? Number(values.longitude) : undefined,
          action_required: values.action_required,
          action_taken: values.action_taken || undefined,
          next_inspection_due: values.next_inspection_due || undefined,
          visit_id: values.visit_id ? Number(values.visit_id) : undefined,
          is_active: values.is_active,
        };

        if (isEdit && selectedInspection) {
          await updateCoolerInspectionMutation.mutateAsync({
            id: selectedInspection.id,
            ...inspectionData,
          });
        } else {
          await createCoolerInspectionMutation.mutateAsync(inspectionData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving cooler inspection:', error);
      }
    },
  });

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Cooler Inspection' : 'Create Cooler Inspection'}
      size="large"
    >
      <Box className="!p-4">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            {/* Cooler Selection */}
            <Select name="cooler_id" label="Cooler" formik={formik} fullWidth>
              <MenuItem value="">
                <em>Select Cooler</em>
              </MenuItem>
              {coolers.map(cooler => (
                <MenuItem key={cooler.id} value={cooler.id}>
                  {cooler.code} - {cooler.brand} {cooler.model} (
                  {cooler.customer?.name})
                </MenuItem>
              ))}
            </Select>

            {/* Inspector Selection */}
            <Select
              name="inspected_by"
              label="Inspector"
              formik={formik}
              fullWidth
            >
              <MenuItem value="">
                <em>Select Inspector</em>
              </MenuItem>
              {users.map(user => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </MenuItem>
              ))}
            </Select>

            {/* Inspection Date */}
            <Input
              name="inspection_date"
              label="Inspection Date"
              formik={formik}
              type="date"
              required
            />

            {/* Temperature */}
            <Input
              name="temperature"
              label="Temperature (°C)"
              placeholder="Enter temperature"
              formik={formik}
              type="number"
            />

            {/* Working Status */}
            <Select
              name="is_working"
              label="Working Status"
              formik={formik}
              required
            >
              <MenuItem value="Y">Working</MenuItem>
              <MenuItem value="N">Not Working</MenuItem>
            </Select>

            {/* Action Required */}
            <Select
              name="action_required"
              label="Action Required"
              formik={formik}
              required
            >
              <MenuItem value="Y">Yes</MenuItem>
              <MenuItem value="N">No</MenuItem>
            </Select>

            {/* Latitude */}
            <Input
              name="latitude"
              label="Latitude"
              placeholder="Enter latitude"
              formik={formik}
              type="number"
            />

            {/* Longitude */}
            <Input
              name="longitude"
              label="Longitude"
              placeholder="Enter longitude"
              formik={formik}
              type="number"
            />

            {/* Next Inspection Due */}
            <Input
              name="next_inspection_due"
              label="Next Inspection Due"
              formik={formik}
              type="date"
            />

            {/* Visit Selection */}
            <Select name="visit_id" label="Visit" formik={formik}>
              <MenuItem value="">
                <em>No visit associated</em>
              </MenuItem>
              {visits.map(visit => (
                <MenuItem key={visit.id} value={visit.id}>
                  Visit #{visit.id} - {visit.customer?.name} (
                  {visit.visit_date
                    ? formatForDateInput(visit.visit_date)
                    : 'No date'}
                  )
                </MenuItem>
              ))}
            </Select>

            {/* Issues */}
            <Box className="md:!col-span-2">
              <Input
                name="issues"
                label="Issues Found"
                placeholder="Describe any issues found during inspection..."
                formik={formik}
                multiline
                rows={3}
              />
            </Box>

            {/* Action Taken */}
            <Box className="md:!col-span-2">
              <Input
                name="action_taken"
                label="Action Taken"
                placeholder="Describe any actions taken to resolve issues..."
                formik={formik}
                multiline
                rows={3}
              />
            </Box>

            {/* Images */}
            <Box className="md:!col-span-2">
              <Input
                name="images"
                label="Images"
                placeholder="Image URLs or file paths (comma-separated)..."
                formik={formik}
                multiline
                rows={2}
              />
            </Box>

            {/* Active Status */}
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
                createCoolerInspectionMutation.isPending ||
                updateCoolerInspectionMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createCoolerInspectionMutation.isPending ||
                updateCoolerInspectionMutation.isPending
              }
            >
              {createCoolerInspectionMutation.isPending ||
              updateCoolerInspectionMutation.isPending
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

export default ManageCoolerInspection;
