import { Box, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';
import React, { useCallback, useMemo } from 'react';
import { useFormik } from 'formik';
import AssetSelect from 'shared/AssetSelect';
import UserSelect from 'shared/UserSelect';
import {
  useCreateAssetMaintenance,
  useUpdateAssetMaintenance,
  type AssetMaintenance,
} from 'hooks/useAssetMaintenance';
import { assetMaintenanceValidationSchema } from 'schemas/assetMaintenance.schema';
import { DeleteButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Table, { type TableColumn } from 'shared/Table';

import { formatForDateInput } from 'utils/dateUtils';
import ActiveInactiveField from 'shared/ActiveInactiveField';

interface ManageAssetMaintenanceProps {
  selectedMaintenance?: AssetMaintenance | null;
  setSelectedMaintenance: (maintenance: AssetMaintenance | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

interface SparePartItemFormData {
  tempId?: string;
  name: string;
  cost: string | number;
}

const ManageAssetMaintenance: React.FC<ManageAssetMaintenanceProps> = ({
  selectedMaintenance,
  setSelectedMaintenance,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedMaintenance;

  const createAssetMaintenanceMutation = useCreateAssetMaintenance();
  const updateAssetMaintenanceMutation = useUpdateAssetMaintenance();

  const initialValues = useMemo(
    () => ({
      asset_id: selectedMaintenance?.asset_id?.toString() || '',
      maintenance_date: formatForDateInput(
        selectedMaintenance?.maintenance_date
      ),
      issue_reported: selectedMaintenance?.issue_reported || '',
      action_taken: selectedMaintenance?.action_taken || '',
      technician_id: selectedMaintenance?.technician_id?.toString() || '',
      cost: selectedMaintenance?.cost?.toString() || '',
      remarks: selectedMaintenance?.remarks || '',
      is_active: selectedMaintenance?.is_active || 'Y',
      spares: (
        ((selectedMaintenance as any)?.spares as Array<{
          id?: number;
          name: string;
          cost: number | string;
        }>) || []
      ).map((s, idx) => ({
        tempId: s.id ? `spare_${s.id}` : `spare_row_${idx}`,
        name: s.name || '',
        cost: s.cost !== undefined && s.cost !== null ? s.cost.toString() : '',
      })),
    }),
    [selectedMaintenance]
  );

  const formik = useFormik({
    initialValues,
    validationSchema: assetMaintenanceValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const formattedSpares = (values.spares || [])
          .filter((s: SparePartItemFormData) => s.name?.trim())
          .map((s: SparePartItemFormData) => ({
            name: s.name.trim(),
            cost: s.cost !== '' && s.cost !== undefined ? Number(s.cost) : 0,
          }));

        const submitData = {
          asset_id: Number(values.asset_id),
          maintenance_date: values.maintenance_date,
          issue_reported: values.issue_reported,
          action_taken: values.action_taken,
          technician_id: Number(values.technician_id),
          cost: values.cost ? Number(values.cost) : undefined,
          remarks: values.remarks,
          is_active: values.is_active,
          spares: formattedSpares,
        };

        if (isEdit && selectedMaintenance) {
          await updateAssetMaintenanceMutation.mutateAsync({
            id: selectedMaintenance.id,
            data: submitData,
          });
        } else {
          await createAssetMaintenanceMutation.mutateAsync(submitData);
        }
        handleCancel();
      } catch (error) {
        console.error('Error submitting asset maintenance:', error);
      }
    },
  });

  const handleCancel = () => {
    setSelectedMaintenance(null);
    setDrawerOpen(false);
    formik.resetForm();
  };

  const addSpareItem = useCallback(() => {
    const newItem: SparePartItemFormData = {
      tempId: `spare_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: '',
      cost: '',
    };
    formik.setFieldValue('spares', [...(formik.values.spares || []), newItem]);
  }, [formik.values.spares, formik.setFieldValue]);

  const removeSpareItem = useCallback(
    (index: number) => {
      const updated = [...(formik.values.spares || [])];
      updated.splice(index, 1);
      formik.setFieldValue('spares', updated);
    },
    [formik.values.spares, formik.setFieldValue]
  );

  const updateSpareItem = useCallback(
    (index: number, field: 'name' | 'cost', value: any) => {
      const updated = [...(formik.values.spares || [])];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      formik.setFieldValue('spares', updated);
    },
    [formik.values.spares, formik.setFieldValue]
  );

  const totalSparesCost = useMemo(() => {
    return (formik.values.spares || []).reduce(
      (sum: number, item: SparePartItemFormData) => {
        const val = Number(item.cost);
        return sum + (isNaN(val) ? 0 : val);
      },
      0
    );
  }, [formik.values.spares]);

  const spareItemColumns: TableColumn<SparePartItemFormData>[] = useMemo(
    () => [
      {
        id: 'name',
        label: 'Spare Part Name',
        width: 380,
        render: (_value, row, rowIndex) => (
          <Input
            name={`spares[${rowIndex}].name`}
            value={row.name ?? ''}
            onChange={e => updateSpareItem(rowIndex, 'name', e.target.value)}
            size="small"
            fullWidth
            placeholder="Enter spare part name"
          />
        ),
      },
      {
        id: 'cost',
        label: 'Cost',
        width: 200,
        render: (_value, row, rowIndex) => (
          <Input
            name={`spares[${rowIndex}].cost`}
            type="number"
            value={row.cost ?? ''}
            onChange={e => updateSpareItem(rowIndex, 'cost', e.target.value)}
            size="small"
            fullWidth
            placeholder="Enter Cost"
          />
        ),
      },
      {
        id: 'action',
        label: 'Actions',
        width: 80,
        sortable: false,
        render: (_value, _row, rowIndex) => (
          <DeleteButton
            onClick={() => removeSpareItem(rowIndex)}
            tooltip="Remove item"
          />
        ),
      },
    ],
    [updateSpareItem, removeSpareItem]
  );

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Asset Maintenance' : 'Create Asset Maintenance'}
      size="medium"
    >
      {drawerOpen && (
        <Box className="!p-5">
          <form onSubmit={formik.handleSubmit} className="!space-y-4">
            <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
              <AssetSelect
                name="asset_id"
                label="Asset"
                formik={formik}
                required
                nameToSearch={
                  selectedMaintenance?.asset_maintenance_master?.name
                }
              />

              <UserSelect
                name="technician_id"
                label="Technician"
                formik={formik}
                required
                nameToSearch={
                  selectedMaintenance?.asset_maintenance_technician?.name
                }
              />

              <Input
                name="maintenance_date"
                label="Maintenance Date"
                type="date"
                formik={formik}
                required
                slotProps={{ inputLabel: { shrink: true } }}
              />

              <Input
                name="cost"
                label="Cost"
                type="number"
                placeholder="Enter maintenance cost"
                formik={formik}
              />
            </Box>

            <Input
              name="issue_reported"
              label="Issue Reported"
              placeholder="Describe the issue that was reported"
              formik={formik}
              multiline
              rows={3}
            />

            <Input
              name="action_taken"
              label="Action Taken"
              placeholder="Describe the action taken to resolve the issue"
              formik={formik}
              multiline
              rows={3}
            />

            <Box className="!space-y-2">
              <Table
                data={formik.values.spares || []}
                compact
                filterColunm={false}
                actions={
                  <Box className="!flex !justify-between !items-center !w-full">
                    <Typography variant="body1" className="!font-semibold">
                      Spare Parts
                    </Typography>
                    <Button
                      type="button"
                      variant="outlined"
                      size="small"
                      onClick={addSpareItem}
                      startIcon={<Add fontSize="small" />}
                    >
                      Add Item
                    </Button>
                  </Box>
                }
                columns={spareItemColumns}
                getRowId={item => item.tempId || 'unknown'}
                pagination={false}
                emptyMessage="No items added. Click 'Add Item' to add spare parts"
                footer={
                  (formik.values.spares || []).length > 0 ? (
                    <Box className="!flex !justify-between !items-center !px-4 !py-3 !border-t !border-gray-200">
                      <Typography
                        variant="body2"
                        className="!text-gray-700 !font-medium"
                      >
                        Total Spares Cost:{' '}
                        <span className="!font-bold !text-primary-600">
                          {totalSparesCost.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </Typography>
                      {!formik.values.cost && totalSparesCost > 0 && (
                        <Button
                          type="button"
                          variant="text"
                          size="small"
                          onClick={() =>
                            formik.setFieldValue(
                              'cost',
                              totalSparesCost.toString()
                            )
                          }
                          className="!text-xs !capitalize"
                        >
                          Use as Maintenance Cost
                        </Button>
                      )}
                    </Box>
                  ) : undefined
                }
              />
            </Box>

            <Input
              name="remarks"
              label="Remarks"
              placeholder="Enter additional remarks"
              formik={formik}
              multiline
              rows={3}
            />
            <ActiveInactiveField
              name="is_active"
              formik={formik}
              required
              className="col-span-2"
            />

            <Box className="!flex !justify-end">
              <Button
                type="button"
                variant="outlined"
                onClick={handleCancel}
                className="!mr-3"
                disabled={
                  createAssetMaintenanceMutation.isPending ||
                  updateAssetMaintenanceMutation.isPending
                }
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={
                  createAssetMaintenanceMutation.isPending ||
                  updateAssetMaintenanceMutation.isPending
                }
              >
                {createAssetMaintenanceMutation.isPending ||
                updateAssetMaintenanceMutation.isPending
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
      )}
    </CustomDrawer>
  );
};

export default ManageAssetMaintenance;
