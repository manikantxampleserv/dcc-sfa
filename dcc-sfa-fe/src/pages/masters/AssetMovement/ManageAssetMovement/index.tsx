import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from '@hello-pangea/dnd';
import { Box, MenuItem, Typography, Avatar, Skeleton } from '@mui/material';
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
import { useAuth } from 'context/AuthContext';

interface ManageAssetMovementProps {
  selectedMovement?: AssetMovement | null;
  setSelectedMovement: (movement: AssetMovement | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const EMPTY_ASSETS: AssetMaster[] = [];
const EMPTY_IDS: number[] = [];

const ManageAssetMovement: React.FC<ManageAssetMovementProps> = ({
  selectedMovement,
  setSelectedMovement,
  drawerOpen,
  setDrawerOpen,
}) => {
  const { user } = useAuth();
  const isEdit = !!selectedMovement;
  const [selectedAssetIds, setSelectedAssetIds] = useState<number[]>([]);
  const [availableSearch, setAvailableSearch] = useState('');
  const [page, setPage] = useState(1);
  const [displayedAssets, setDisplayedAssets] = useState<AssetMaster[]>([]);

  const createAssetMovementMutation = useCreateAssetMovement();
  const updateAssetMovementMutation = useUpdateAssetMovement();

  const handleCancel = () => {
    setSelectedMovement(null);
    setDrawerOpen(false);
    setSelectedAssetIds([]);
    setAvailableSearch('');
    formik.resetForm();
  };

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
      performed_by:
        selectedMovement?.performed_by?.toString() ||
        user?.id?.toString() ||
        '',
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

  useEffect(() => {
    if (selectedMovement?.asset_ids) {
      setSelectedAssetIds(selectedMovement.asset_ids);
    } else if (selectedAssetIds.length > 0) {
      setSelectedAssetIds(EMPTY_IDS);
    }
  }, [selectedMovement]);

  useEffect(() => {
    setPage(1);
    if (displayedAssets.length > 0) {
      setDisplayedAssets(EMPTY_ASSETS);
    }
  }, [
    availableSearch,
    formik.values.from_direction,
    formik.values.from_depot,
    formik.values.from_outlet,
  ]);

  const [knownAssetsMap, setKnownAssetsMap] = useState<
    Map<number, AssetMaster>
  >(new Map());

  const isSourceSelected = !!(
    (formik.values.from_direction === 'depot' && formik.values.from_depot) ||
    (formik.values.from_direction === 'outlet' && formik.values.from_outlet)
  );

  const { data: assetsResponse, isFetching } = useAssetMaster(
    {
      page,
      limit: 100,
      status: 'active',
      search: availableSearch,
      depot_id:
        formik.values.from_direction === 'depot' && formik.values.from_depot
          ? Number(formik.values.from_depot)
          : undefined,
      outlet_id:
        formik.values.from_direction === 'outlet' && formik.values.from_outlet
          ? Number(formik.values.from_outlet)
          : undefined,
    },
    {
      enabled: isSourceSelected,
    }
  );

  const assets: AssetMaster[] = useMemo(() => {
    return assetsResponse?.data || EMPTY_ASSETS;
  }, [assetsResponse?.data]);

  useEffect(() => {
    if (assets.length > 0) {
      if (page === 1) {
        setDisplayedAssets(assets);
      } else {
        setDisplayedAssets(prev => {
          const newAssets = assets.filter(a => !prev.some(p => p.id === a.id));
          return [...prev, ...newAssets];
        });
      }
    } else if (page === 1 && displayedAssets.length > 0) {
      setDisplayedAssets(EMPTY_ASSETS);
    }
  }, [assets, page]);

  useEffect(() => {
    setKnownAssetsMap(prev => {
      const newMap = new Map(prev);
      displayedAssets.forEach(asset => newMap.set(asset.id, asset));

      if (selectedMovement?.asset_movement_assets) {
        selectedMovement.asset_movement_assets.forEach((item: any) => {
          if (item.asset) {
            newMap.set(item.asset.id, item.asset);
          } else if (item.asset_master) {
            newMap.set(item.asset_master.id, item.asset_master);
          }
        });
      }
      return newMap;
    });
  }, [displayedAssets, selectedMovement]);

  const selectedAssets = useMemo(
    () =>
      selectedAssetIds
        .map(
          id =>
            knownAssetsMap.get(id) ||
            ({ id, name: `Loading Asset ${id}...` } as any)
        )
        .filter(Boolean) as AssetMaster[],
    [knownAssetsMap, selectedAssetIds]
  );

  const availableAssets = useMemo(() => {
    const selectedIds = new Set(selectedAssetIds);
    return displayedAssets.filter(asset => !selectedIds.has(asset.id));
  }, [displayedAssets, selectedAssetIds]);

  const emptyStateMessage = useMemo(() => {
    if (!isSourceSelected) {
      return 'Please select From Direction and Source first';
    }
    if (availableSearch) {
      return 'No assets match your search';
    }
    if (displayedAssets.length === 0) {
      return 'No assets available in this source';
    }
    return 'All assets are selected';
  }, [isSourceSelected, availableSearch, displayedAssets.length]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    if (
      target.scrollHeight - target.scrollTop <= target.clientHeight + 50 &&
      !isFetching &&
      assetsResponse?.meta?.page &&
      assetsResponse?.meta?.totalPages &&
      assetsResponse.meta.page < assetsResponse.meta.totalPages
    ) {
      setPage(p => p + 1);
    }
  };

  useEffect(() => {
    formik.setFieldValue('asset_ids', selectedAssetIds);
  }, [selectedAssetIds, formik.setFieldValue]);

  const movementTypeOptions = [
    { value: 'installation', label: 'Installation' },
    { value: 'transfer', label: 'Transfer' },
    { value: 'return', label: 'Return' },
  ];

  const AssetCardSkeleton = () => (
    <Box className="!flex !items-center !gap-3 !p-2 !pr-3 !bg-white !border !border-gray-200 !rounded-lg !mb-2">
      <GripVertical className="!w-5 !h-5 !text-gray-400 !cursor-grab !flex-shrink-0" />
      <Skeleton
        variant="circular"
        width={36}
        height={36}
        className="!flex-shrink-0"
      />
      <Box className="!flex-1">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" />
      </Box>
    </Box>
  );

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
                onChange={(_, selectedDepot) => {
                  formik.setFieldValue(
                    'from_depot',
                    selectedDepot ? selectedDepot.id : ''
                  );
                  formik.setFieldValue('to_outlet', '');
                }}
              />
            )}

            {formik.values.to_direction === 'outlet' && (
              <CustomerSelect
                name="to_outlet"
                label="To Outlet"
                formik={formik}
                required
                depotId={
                  formik.values.from_direction === 'depot' &&
                  formik.values.from_depot
                    ? Number(formik.values.from_depot)
                    : undefined
                }
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
              disabled={true}
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
                        Available Assets (
                        {assetsResponse?.meta?.total || availableAssets.length})
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
                            onScroll={handleScroll}
                            className={`!h-full !p-2 !overflow-y-auto ${
                              snapshot.isDraggingOver ? '!bg-blue-50' : ''
                            }`}
                            style={{
                              transition: 'background-color 0.2s ease',
                            }}
                          >
                            {isFetching && page === 1 ? (
                              Array.from({ length: 5 }).map((_, i) => (
                                <AssetCardSkeleton key={i} />
                              ))
                            ) : availableAssets.length > 0 ? (
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
                                  {emptyStateMessage}
                                </Typography>
                              </Box>
                            )}
                            {isFetching && page > 1 && (
                              <Box className="!py-2">
                                <AssetCardSkeleton />
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
