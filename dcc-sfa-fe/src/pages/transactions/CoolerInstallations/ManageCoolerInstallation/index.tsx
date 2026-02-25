import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateCoolerInstallation,
  useUpdateCoolerInstallation,
  type CoolerInstallation,
} from 'hooks/useCoolerInstallations';
import { useAssetMaster } from 'hooks/useAssetMaster';
import { useCoolerTypesDropdown } from 'hooks/useCoolerTypes';
import { useCoolerSubTypesDropdown } from 'hooks/useCoolerSubTypes';
import type { AssetMaster } from 'services/masters/AssetMaster';
import React from 'react';
import { coolerInstallationValidationSchema } from 'schemas/coolerInstallation.schema';
import Button from 'shared/Button';
import CustomerSelect from 'shared/CustomerSelect';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';
import UserSelect from 'shared/UserSelect';
import { formatForDateInput } from 'utils/dateUtils';
import ActiveInactiveField from 'shared/ActiveInactiveField';

interface ManageCoolerInstallationProps {
  selectedInstallation?: CoolerInstallation | null;
  setSelectedInstallation: (installation: CoolerInstallation | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageCoolerInstallation: React.FC<ManageCoolerInstallationProps> = ({
  selectedInstallation,
  setSelectedInstallation,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedInstallation;

  const handleCancel = () => {
    setSelectedInstallation(null);
    setDrawerOpen(false);
    formik.resetForm();
  };

  const createCoolerInstallationMutation = useCreateCoolerInstallation();
  const updateCoolerInstallationMutation = useUpdateCoolerInstallation();

  const formik = useFormik({
    initialValues: {
      customer_id: selectedInstallation?.customer_id || '',
      asset_master_id: selectedInstallation?.asset_master_id || '',
      code: selectedInstallation?.code || '',
      brand: selectedInstallation?.brand || '',
      model: selectedInstallation?.model || '',
      serial_number: selectedInstallation?.serial_number || '',
      capacity: selectedInstallation?.capacity || '',
      install_date: selectedInstallation?.install_date
        ? formatForDateInput(selectedInstallation.install_date)
        : '',
      last_service_date: selectedInstallation?.last_service_date
        ? formatForDateInput(selectedInstallation.last_service_date)
        : '',
      next_service_due: selectedInstallation?.next_service_due
        ? formatForDateInput(selectedInstallation.next_service_due)
        : '',
      cooler_type_id: selectedInstallation?.cooler_type_id || '',
      cooler_sub_type_id: selectedInstallation?.cooler_sub_type_id || '',
      status: selectedInstallation?.status || 'working',
      temperature: selectedInstallation?.temperature || '',
      energy_rating: selectedInstallation?.energy_rating || '',
      warranty_expiry: selectedInstallation?.warranty_expiry
        ? formatForDateInput(selectedInstallation.warranty_expiry)
        : '',
      maintenance_contract: selectedInstallation?.maintenance_contract || '',
      technician_id: selectedInstallation?.technician_id || '',
      last_scanned_date: selectedInstallation?.last_scanned_date
        ? formatForDateInput(selectedInstallation.last_scanned_date)
        : '',
      is_active: selectedInstallation?.is_active || 'Y',
    },
    validationSchema: coolerInstallationValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      if (!values.cooler_type_id) {
        formik.setFieldValue('cooler_sub_type_id', '');
      }
      try {
        const installationData = {
          customer_id: Number(values.customer_id),
          asset_master_id: values.asset_master_id
            ? Number(values.asset_master_id)
            : undefined,
          code: values.code || undefined,
          brand: values.brand,
          model: values.model,
          serial_number: values.serial_number,
          capacity: values.capacity ? Number(values.capacity) : undefined,
          install_date: values.install_date,
          last_service_date: values.last_service_date,
          next_service_due: values.next_service_due,
          cooler_type_id: values.cooler_type_id
            ? Number(values.cooler_type_id)
            : undefined,
          cooler_sub_type_id: values.cooler_sub_type_id
            ? Number(values.cooler_sub_type_id)
            : undefined,
          status: values.status,
          temperature: values.temperature
            ? Number(values.temperature)
            : undefined,
          energy_rating: values.energy_rating,
          warranty_expiry: values.warranty_expiry,
          maintenance_contract: values.maintenance_contract,
          technician_id: values.technician_id
            ? Number(values.technician_id)
            : undefined,
          last_scanned_date: values.last_scanned_date,
          is_active: values.is_active,
        };

        if (isEdit && selectedInstallation) {
          await updateCoolerInstallationMutation.mutateAsync({
            id: selectedInstallation.id,
            ...installationData,
          });
        } else {
          await createCoolerInstallationMutation.mutateAsync(installationData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving cooler installation:', error);
      }
    },
  });

  const { data: coolerTypesDropdown } = useCoolerTypesDropdown();
  const coolerTypeId = formik.values.cooler_type_id
    ? Number(formik.values.cooler_type_id)
    : undefined;
  const { data: coolerSubTypesDropdown } =
    useCoolerSubTypesDropdown(coolerTypeId);

  const { data: assetMasterData } = useAssetMaster({
    page: 1,
    limit: 1000,
    status: 'active',
  });

  const coolerTypes = coolerTypesDropdown?.data || [];
  const coolerSubTypes = coolerSubTypesDropdown?.data || [];
  const assets = assetMasterData?.data || [];
  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Cooler Installation' : 'Create Cooler Installation'}
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Select
              name="asset_master_id"
              label="Cooler"
              formik={formik}
              required
            >
              {assets.map((asset: AssetMaster) => (
                <MenuItem key={asset.id} value={asset.id}>
                  {asset.serial_number} - {asset.current_status}
                </MenuItem>
              ))}
            </Select>

            <Input
              name="code"
              label="Cooler Code"
              placeholder="Enter cooler code"
              formik={formik}
              helperText="Leave empty to auto-generate cooler code"
            />

            <CustomerSelect
              name="customer_id"
              label="Outlet"
              formik={formik}
              required
            />

            <Input
              name="brand"
              label="Brand"
              placeholder="Enter cooler brand"
              formik={formik}
            />

            <Input
              name="model"
              label="Model"
              placeholder="Enter cooler model"
              formik={formik}
            />

            <Input
              name="serial_number"
              label="Serial Number"
              placeholder="Enter serial number"
              formik={formik}
            />

            <Input
              name="capacity"
              label="Capacity (Liters)"
              placeholder="Enter capacity"
              formik={formik}
              type="number"
            />

            <Input
              name="install_date"
              label="Installation Date"
              formik={formik}
              type="date"
            />

            <Select
              name="cooler_type_id"
              label="Cooler Type"
              formik={formik}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                formik.setFieldValue('cooler_type_id', e.target.value);
                formik.setFieldValue('cooler_sub_type_id', '');
              }}
            >
              {coolerTypes.map(ct => (
                <MenuItem key={ct.id} value={ct.id}>
                  {ct.name}
                </MenuItem>
              ))}
            </Select>

            <Select
              name="cooler_sub_type_id"
              label="Cooler Sub Type"
              formik={formik}
              disabled={!formik.values.cooler_type_id}
            >
              {coolerSubTypes.map(cst => (
                <MenuItem key={cst.id} value={cst.id}>
                  {cst.name}
                </MenuItem>
              ))}
            </Select>

            <Select name="status" label="Status" formik={formik}>
              <MenuItem value="working">Working</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
              <MenuItem value="broken">Broken</MenuItem>
              <MenuItem value="offline">Offline</MenuItem>
            </Select>

            <Input
              name="temperature"
              label="Temperature (°C)"
              placeholder="Enter current temperature"
              formik={formik}
              type="number"
            />

            <Input
              name="energy_rating"
              label="Energy Rating"
              placeholder="e.g., A++, A+, A"
              formik={formik}
            />

            <Input
              name="last_service_date"
              label="Last Service Date"
              formik={formik}
              type="date"
            />

            <Input
              name="next_service_due"
              label="Next Service Due"
              formik={formik}
              type="date"
            />

            <Input
              name="warranty_expiry"
              label="Warranty Expiry"
              formik={formik}
              type="date"
            />

            <UserSelect
              name="technician_id"
              label="Technician"
              formik={formik}
              placeholder="Search technician..."
            />

            <Input
              name="last_scanned_date"
              label="Last Scanned Date"
              formik={formik}
              type="date"
            />

            <Box className="md:!col-span-2">
              <Input
                name="maintenance_contract"
                label="Maintenance Contract"
                placeholder="Enter maintenance contract details"
                formik={formik}
                multiline
                rows={3}
              />
            </Box>

            <ActiveInactiveField
              name="is_active"
              label="Status"
              formik={formik}
              required
            />
          </Box>

          <Box className="!flex !justify-end">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              className="!mr-3"
              disabled={
                createCoolerInstallationMutation.isPending ||
                updateCoolerInstallationMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createCoolerInstallationMutation.isPending ||
                updateCoolerInstallationMutation.isPending
              }
            >
              {createCoolerInstallationMutation.isPending ||
              updateCoolerInstallationMutation.isPending
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

export default ManageCoolerInstallation;
