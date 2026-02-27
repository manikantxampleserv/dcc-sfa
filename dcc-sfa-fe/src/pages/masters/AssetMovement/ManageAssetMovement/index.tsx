import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from '@hello-pangea/dnd';
import { Box, MenuItem, Typography, Avatar } from '@mui/material';
import { useFormik } from 'formik';
import { useAssetMaster, type AssetMaster } from 'hooks/useAssetMaster';
import {
  useCreateAssetMovement,
  useUpdateAssetMovement,
  type AssetMovement,
} from 'hooks/useAssetMovement';
import { GripVertical, Package } from 'lucide-react';
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { assetMovementValidationSchema } from 'schemas/assetMovement.schema';
import ActiveInactiveField from 'shared/ActiveInactiveField';
import Button from 'shared/Button';
import CustomerSelect from 'shared/CustomerSelect';
import CustomDrawer from 'shared/Drawer';
import DepotSelect from 'shared/DepotSelect';
import Input from 'shared/Input';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import UserSelect from 'shared/UserSelect';
import { formatForDateInput } from 'utils/dateUtils';

interface ManageAssetMovementProps {
  selectedMovement?: AssetMovement | null;
  setSelectedMovement: (movement: AssetMovement | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageAssetMovement: React.FC<ManageAssetMovementProps> = ({
  selectedMovement,
  setSelectedMovement,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedMovement;
  const [selectedAssetIds, setSelectedAssetIds] = useState<number[]>([]);
  const [availableSearch, setAvailableSearch] = useState('');

  useEffect(() => {
    if (selectedMovement?.asset_ids) {
      setSelectedAssetIds(selectedMovement.asset_ids);
    } else {
      setSelectedAssetIds([]);
    }
  }, [selectedMovement]);

  const { data: assetsResponse } = useAssetMaster({
    page: 1,
    limit: 1000,
    status: 'active',
  });
  const assets: AssetMaster[] = assetsResponse?.data || [];

  const createAssetMovementMutation = useCreateAssetMovement();
  const updateAssetMovementMutation = useUpdateAssetMovement();

  const assetMap = useMemo(
    () => new Map(assets.map((asset: AssetMaster) => [asset.id, asset])),
    [assets]
  );

  const selectedAssets = useMemo(
    () =>
      selectedAssetIds
        .map(id => assetMap.get(id))
        .filter(Boolean) as AssetMaster[],
    [assetMap, selectedAssetIds]
  );

  const availableAssets = useMemo(() => {
    const selectedIds = new Set(selectedAssetIds);
    const searchLower = availableSearch.trim().toLowerCase();
    return assets.filter(asset => {
      if (selectedIds.has(asset.id)) return false;
      if (!searchLower) return true;
      const name = asset.name?.toLowerCase() || '';
      const serial = asset.serial_number?.toLowerCase() || '';
      const type = asset.asset_master_asset_types?.name?.toLowerCase() || '';
      return (
        name.includes(searchLower) ||
        serial.includes(searchLower) ||
        type.includes(searchLower)
      );
    });
  }, [availableSearch, assets, selectedAssetIds]);

  const handleCancel = () => {
    setSelectedMovement(null);
    setDrawerOpen(false);
    setSelectedAssetIds([]);
    setAvailableSearch('');
    formik.resetForm();
  };

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      const { destination, source, draggableId } = result;
      if (!destination) return;

      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      ) {
        return;
      }

      const assetId = parseInt(draggableId, 10);
      if (Number.isNaN(assetId)) return;

      if (
        source.droppableId === 'available-assets' &&
        destination.droppableId === 'selected-assets'
      ) {
        if (selectedAssetIds.includes(assetId)) return;
        const updated = Array.from(selectedAssetIds);
        updated.splice(destination.index, 0, assetId);
        setSelectedAssetIds(updated);
        return;
      }

      if (
        source.droppableId === 'selected-assets' &&
        destination.droppableId === 'available-assets'
      ) {
        setSelectedAssetIds(selectedAssetIds.filter(id => id !== assetId));
        return;
      }

      if (
        source.droppableId === 'selected-assets' &&
        destination.droppableId === 'selected-assets'
      ) {
        const updated = Array.from(selectedAssetIds);
        const [moved] = updated.splice(source.index, 1);
        updated.splice(destination.index, 0, moved);
        setSelectedAssetIds(updated);
      }
    },
    [selectedAssetIds, setSelectedAssetIds]
  );

  const handleDirectionChange = (fieldName: string, value: string) => {
    formik.setFieldValue(fieldName, value);

    if (fieldName === 'from_direction') {
      formik.setFieldValue('from_outlet', '');
      formik.setFieldValue('from_depot', '');
    } else if (fieldName === 'to_direction') {
      formik.setFieldValue('to_outlet', '');
      formik.setFieldValue('to_depot', '');
    }
  };

  const formik = useFormik({
    initialValues: {
      asset_ids: selectedMovement?.asset_ids,
      from_direction: selectedMovement?.from_direction || '',
      from_outlet: selectedMovement?.from_customer_id?.toString() || '',
      from_depot: selectedMovement?.from_depot_id?.toString() || '',
      to_direction: selectedMovement?.to_direction || '',
      to_outlet: selectedMovement?.to_customer_id?.toString() || '',
      to_depot: selectedMovement?.to_depot_id?.toString() || '',
      movement_type: selectedMovement?.movement_type || '',
      movement_date: formatForDateInput(selectedMovement?.movement_date),
      performed_by: selectedMovement?.performed_by?.toString() || '',
      notes: selectedMovement?.notes || '',
      is_active: selectedMovement?.is_active || 'Y',
      priority: 'medium',
    },
    validationSchema: assetMovementValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        if (selectedAssetIds.length === 0) {
          alert('Please select at least one asset for the movement');
          return;
        }

        const submitData = {
          asset_ids: selectedAssetIds,
          from_direction: values.from_direction,
          from_customer_id:
            values.from_direction === 'outlet'
              ? Number(values.from_outlet)
              : null,
          from_depot_id:
            values.from_direction === 'depot'
              ? Number(values.from_depot)
              : null,
          to_direction: values.to_direction,
          to_customer_id:
            values.to_direction === 'outlet' ? Number(values.to_outlet) : null,
          to_depot_id:
            values.to_direction === 'depot' ? Number(values.to_depot) : null,
          movement_type: values.movement_type,
          movement_date: values.movement_date,
          performed_by: Number(values.performed_by),
          notes: values.notes,
          priority: values.priority,
          is_active: values.is_active,
        };

        if (isEdit && selectedMovement) {
          await updateAssetMovementMutation.mutateAsync({
            id: selectedMovement.id,
            data: submitData,
          });
        } else {
          await createAssetMovementMutation.mutateAsync(submitData);
        }
        handleCancel();
      } catch (error) {
        console.error('Error submitting asset movement:', error);
      }
    },
  });

  // Update formik asset_ids when selectedAssetIds changes
  useEffect(() => {
    formik.setFieldValue('asset_ids', selectedAssetIds);
  }, [selectedAssetIds, formik.setFieldValue]);

  const movementTypeOptions = [
    { value: 'installation', label: 'Installation' },
    { value: 'transfer', label: 'Transfer' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'repair', label: 'Repair' },
    { value: 'disposal', label: 'Disposal' },
    { value: 'return', label: 'Return' },
  ];

  const AssetCard = ({ asset }: { asset: AssetMaster; showIndex?: number }) => (
    <div className="!flex !items-center !gap-3 !p-2 !pr-3 !bg-white !border !border-gray-200 !rounded-lg !mb-2 hover:!border-blue-300 hover:!shadow-md">
      <GripVertical className="!w-5 !h-5 !text-gray-400 !cursor-grab !flex-shrink-0" />
      <Avatar className="!w-9 !h-9 !bg-blue-100 !text-blue-600">
        <Package className="w-4 h-4" />
      </Avatar>
      <Box className="!flex-1 !min-w-0">
        <Typography variant="body2" className="!font-medium !text-gray-900">
          {asset.name || `Asset ${asset.id}`}
        </Typography>
        <Typography
          variant="caption"
          className="!text-gray-500 !text-xs !block !mt-0.5"
        >
          {asset.serial_number || 'No Serial'} •{' '}
          {asset.asset_master_asset_types?.name || 'Unknown Type'}
        </Typography>
      </Box>
    </div>
  );

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Asset Movement' : 'Create Asset Movement'}
      size="large"
    >
      <Box className="!p-4">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Select name="movement_type" label="Movement Type" formik={formik}>
              {movementTypeOptions.map(
                (option: { value: string; label: string }) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                )
              )}
            </Select>

            <Select name="priority" label="Priority" formik={formik}>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
            </Select>
            <Select
              name="from_direction"
              label="From Direction"
              formik={formik}
              required
              onChange={e =>
                handleDirectionChange('from_direction', e.target.value)
              }
            >
              <MenuItem value="outlet">Outlet</MenuItem>
              <MenuItem value="depot">Depot</MenuItem>
            </Select>
            <Select
              name="to_direction"
              label="To Direction"
              formik={formik}
              required
              onChange={e =>
                handleDirectionChange('to_direction', e.target.value)
              }
            >
              <MenuItem value="outlet">Outlet</MenuItem>
              <MenuItem value="depot">Depot</MenuItem>
            </Select>

            {formik.values.from_direction === 'outlet' && (
              <CustomerSelect
                name="from_outlet"
                label="From Outlet"
                formik={formik}
                required
              />
            )}

            {formik.values.from_direction === 'depot' && (
              <DepotSelect
                name="from_depot"
                label="From Depot"
                formik={formik}
                required
              />
            )}

            {formik.values.to_direction === 'outlet' && (
              <CustomerSelect
                name="to_outlet"
                label="To Outlet"
                formik={formik}
                required
              />
            )}

            {formik.values.to_direction === 'depot' && (
              <DepotSelect
                name="to_depot"
                label="To Depot"
                formik={formik}
                required
              />
            )}

            <Input
              name="movement_date"
              label="Movement Date"
              type="date"
              formik={formik}
              required
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <UserSelect
              name="performed_by"
              label="Performed By"
              formik={formik}
              required
            />
            <Box className="col-span-2">
              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="!grid !grid-cols-2 !gap-4 !h-[400px]">
                  <Box className="!border !border-gray-200 !rounded-t-lg !flex !flex-col !overflow-hidden">
                    <Box className="!p-2 !border-b !border-gray-200 !bg-gray-50">
                      <Typography
                        variant="subtitle1"
                        className="!font-semibold !text-blue-600"
                      >
                        Available Assets ({availableAssets.length})
                      </Typography>
                      <p className="!text-gray-500 !text-xs !block !mt-1">
                        Drag assets from the left panel to select
                      </p>
                      <Box className="!mt-2">
                        <SearchInput
                          placeholder="Search Assets..."
                          value={availableSearch}
                          onChange={setAvailableSearch}
                          className="!w-full"
                        />
                      </Box>
                    </Box>
                    <Box className="!flex-1 !overflow-hidden">
                      <Droppable droppableId="available-assets">
                        {(provided, snapshot) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className={`!h-full !p-2 !overflow-y-auto ${
                              snapshot.isDraggingOver ? '!bg-blue-50' : ''
                            }`}
                            style={{
                              transition: 'background-color 0.2s ease',
                            }}
                          >
                            {availableAssets.length > 0 ? (
                              availableAssets.map(
                                (asset: AssetMaster, index: number) => (
                                  <Draggable
                                    key={asset.id}
                                    draggableId={asset.id.toString()}
                                    index={index}
                                  >
                                    {providedDrag => (
                                      <div
                                        ref={providedDrag.innerRef}
                                        {...providedDrag.draggableProps}
                                        {...providedDrag.dragHandleProps}
                                        style={{
                                          ...providedDrag.draggableProps.style,
                                        }}
                                      >
                                        <AssetCard asset={asset} />
                                      </div>
                                    )}
                                  </Draggable>
                                )
                              )
                            ) : (
                              <Box className="!p-8 !text-center !h-full !flex !flex-col !justify-center !items-center">
                                <Package className="!w-12 !h-12 !text-gray-300 !mb-2" />
                                <Typography
                                  variant="body2"
                                  className="!text-gray-500"
                                >
                                  {availableSearch
                                    ? 'No assets found'
                                    : 'All assets are selected'}
                                </Typography>
                              </Box>
                            )}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </Box>
                  </Box>

                  <Box className="!border !border-gray-200 !rounded-t-lg !flex !flex-col !overflow-hidden">
                    <Box className="!p-2 !border-b !border-gray-200 !bg-gray-50">
                      <Typography
                        variant="subtitle1"
                        className="!font-semibold !text-green-600"
                      >
                        Selected Assets ({selectedAssets.length})
                      </Typography>
                      <p className="!text-gray-500 !text-xs !block !mt-1">
                        Drag assets from the right panel to reorder
                      </p>
                    </Box>
                    <Box className="!flex-1 !overflow-hidden">
                      <Droppable droppableId="selected-assets">
                        {(provided, snapshot) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className={`!h-full !p-2 !overflow-y-auto ${
                              snapshot.isDraggingOver ? '!bg-green-50' : ''
                            }`}
                            style={{
                              transition: 'background-color 0.2s ease',
                            }}
                          >
                            {selectedAssets.length > 0 ? (
                              selectedAssets.map(
                                (asset: AssetMaster, index: number) => (
                                  <Draggable
                                    key={`${asset.id}-${index}`}
                                    draggableId={asset.id.toString()}
                                    index={index}
                                  >
                                    {providedDrag => (
                                      <div
                                        ref={providedDrag.innerRef}
                                        {...providedDrag.draggableProps}
                                        {...providedDrag.dragHandleProps}
                                        style={{
                                          ...providedDrag.draggableProps.style,
                                        }}
                                      >
                                        <AssetCard asset={asset} />
                                      </div>
                                    )}
                                  </Draggable>
                                )
                              )
                            ) : (
                              <Box className="!p-8 !text-center !h-full !flex !flex-col !justify-center !items-center">
                                <Package className="!w-12 !h-12 !text-gray-300 !mb-2" />
                                <Typography
                                  variant="body2"
                                  className="!text-gray-500"
                                >
                                  No assets selected
                                </Typography>
                              </Box>
                            )}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </Box>
                  </Box>
                </div>
              </DragDropContext>
            </Box>

            <ActiveInactiveField
              name="is_active"
              formik={formik}
              required
              className="col-span-2"
            />
          </Box>

          <Input
            name="notes"
            label="Notes"
            placeholder="Enter additional notes about the movement"
            formik={formik}
            multiline
            rows={3}
          />

          <Box className="!flex !justify-end">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              className="!mr-3"
              disabled={
                createAssetMovementMutation.isPending ||
                updateAssetMovementMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createAssetMovementMutation.isPending ||
                updateAssetMovementMutation.isPending
              }
            >
              {createAssetMovementMutation.isPending ||
              updateAssetMovementMutation.isPending
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

export default ManageAssetMovement;
