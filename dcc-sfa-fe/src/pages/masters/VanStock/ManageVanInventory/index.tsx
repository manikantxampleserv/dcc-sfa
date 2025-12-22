import { Box, MenuItem, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useDepots } from 'hooks/useDepots';
import { useProducts } from 'hooks/useProducts';
import { useUsers } from 'hooks/useUsers';
import {
  useCreateVanInventory,
  useProductBatches,
  useUpdateVanInventory,
  useVanInventoryById,
  type ProductBatch,
  type VanInventory,
} from 'hooks/useVanInventory';
import { useVehicles } from 'hooks/useVehicles';
import { Plus } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { vanInventoryValidationSchema } from 'schemas/vanInventory.schema';
import { DeleteButton } from 'shared/ActionButton';
import ActiveInactiveField from 'shared/ActiveInactiveField';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';

interface ManageVanInventoryProps {
  selectedVanInventory?: VanInventory | null;
  setSelectedVanInventory: (vanInventory: VanInventory | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

interface VanInventoryItemFormData {
  product_id: number | null;
  product_name?: string | null;
  quantity: number | null;
  notes?: string | null;
  batch_lot_id: number | null;
  batch_number?: string | null;
  lot_number?: string | null;
  remaining_quantity?: number | null;
  total_quantity?: number | null;
  product_batches?: ProductBatch[];
  id?: number | null;
}

interface BatchLotSelectorProps {
  rowIndex: number;
  row: VanInventoryItemFormData;
  onBatchChange: (
    rowIndex: number,
    batchLotId: number | null,
    remainingQuantity: number | null
  ) => void;
}

const BatchLotSelector: React.FC<BatchLotSelectorProps> = React.memo(
  ({ rowIndex, row, onBatchChange }) => {
    if (!row.product_id) {
      return (
        <Select
          value=""
          disabled
          size="small"
          fullWidth
          placeholder="Select product first"
        />
      );
    }

    const {
      data: productBatchesResponse,
      isFetching,
      error,
    } = useProductBatches(row.product_id, {});

    const productBatches: ProductBatch[] = useMemo(
      () => productBatchesResponse?.data?.batches || [],
      [productBatchesResponse]
    );

    const handleBatchChange = useCallback(
      (batchLotId: number | null) => {
        if (batchLotId === null) {
          onBatchChange(rowIndex, null, null);
          return;
        }

        const selectedBatch = productBatches.find(
          (pb: ProductBatch) => pb.batch_lot_id === batchLotId
        );

        if (selectedBatch) {
          onBatchChange(
            rowIndex,
            selectedBatch.batch_lot_id,
            selectedBatch.product_batch_quantity ?? null
          );
        }
      },
      [rowIndex, productBatches, onBatchChange]
    );

    if (isFetching) {
      return (
        <Select
          value=""
          disabled
          size="small"
          fullWidth
          placeholder="Loading batches..."
        />
      );
    }

    if (error || productBatches.length === 0) {
      return (
        <Select
          value=""
          disabled
          size="small"
          fullWidth
          placeholder="No batches available"
        />
      );
    }

    return (
      <Select
        name={`van_inventory_items[${rowIndex}].batch_lot_id`}
        value={row.batch_lot_id ?? ''}
        onChange={e => {
          const value = e.target.value;
          handleBatchChange(value === '' ? null : Number(value));
        }}
        size="small"
        fullWidth
        placeholder="Select batch"
      >
        {productBatches.map(batch => (
          <MenuItem key={batch.batch_lot_id} value={batch.batch_lot_id}>
            {batch.batch_number}
            {batch.lot_number && ` (${batch.lot_number})`}
          </MenuItem>
        ))}
      </Select>
    );
  }
);

BatchLotSelector.displayName = 'BatchLotSelector';

const ManageVanInventory: React.FC<ManageVanInventoryProps> = ({
  selectedVanInventory,
  setSelectedVanInventory,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedVanInventory;
  const hasLoadedItemsRef = useRef(false);

  const createVanInventoryMutation = useCreateVanInventory();
  const updateVanInventoryMutation = useUpdateVanInventory();
  const { data: vanInventoryResponse } = useVanInventoryById(
    selectedVanInventory?.id || 0
  );

  const { data: usersResponse } = useUsers({ limit: 1000 });
  const { data: productsResponse } = useProducts({ limit: 1000 });
  const { data: vehiclesResponse } = useVehicles({ limit: 1000 });
  const { data: depotsResponse } = useDepots({ limit: 1000 });

  const users = useMemo(() => usersResponse?.data || [], [usersResponse]);
  const products = useMemo(
    () => productsResponse?.data || [],
    [productsResponse]
  );
  const vehicles = useMemo(
    () => vehiclesResponse?.data || [],
    [vehiclesResponse]
  );
  const depots = useMemo(() => depotsResponse?.data || [], [depotsResponse]);

  const formik = useFormik({
    initialValues: {
      user_id: selectedVanInventory?.user_id || '',
      loading_type: selectedVanInventory?.loading_type || 'L',
      status: selectedVanInventory?.status || 'D',
      document_date: selectedVanInventory?.document_date || '',
      vehicle_id: selectedVanInventory?.vehicle_id || '',
      location_type: selectedVanInventory?.location_type || 'van',
      location_id: selectedVanInventory?.location_id || '',
      is_active: selectedVanInventory?.is_active || 'Y',
      van_inventory_items: [] as VanInventoryItemFormData[],
    },
    validationSchema: vanInventoryValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        // Validate quantities
        const invalidItems = values.van_inventory_items.filter(
          item =>
            item.batch_lot_id &&
            item.quantity != null &&
            item.remaining_quantity != null &&
            Number(item.quantity) > item.remaining_quantity
        );

        if (invalidItems.length > 0) {
          alert(
            'Some items have quantities exceeding available stock. Please adjust before submitting.'
          );
          return;
        }

        const incompleteItems = values.van_inventory_items.filter(
          item =>
            !item.product_id || item.quantity == null || !item.batch_lot_id
        );

        if (incompleteItems.length > 0) {
          alert(
            'Please complete all fields (Product, Batch, and Quantity) for all items before submitting.'
          );
          return;
        }

        const submitData = {
          ...(isEdit && selectedVanInventory
            ? { id: selectedVanInventory.id }
            : {}),
          user_id: Number(values.user_id),
          loading_type: values.loading_type,
          status: values.status,
          document_date:
            values.document_date || new Date().toISOString().split('T')[0],
          vehicle_id: values.vehicle_id ? Number(values.vehicle_id) : null,
          location_type: values.location_type,
          location_id: values.location_id ? Number(values.location_id) : null,
          is_active: values.is_active,
          van_inventory_items: values.van_inventory_items
            .filter(item => item.product_id && item.quantity != null)
            .map(item => ({
              product_id: Number(item.product_id),
              product_name: item.product_name || null,
              quantity: Number(item.quantity),
              notes: item.notes || null,
              batch_lot_id: item.batch_lot_id
                ? Number(item.batch_lot_id)
                : null,
              id: item.id || undefined,
            })),
        };

        if (isEdit && selectedVanInventory) {
          await updateVanInventoryMutation.mutateAsync({
            id: selectedVanInventory.id,
            ...submitData,
          });
        } else {
          await createVanInventoryMutation.mutateAsync(submitData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving van inventory:', error);
        alert('Failed to save van inventory. Please try again.');
      }
    },
  });

  const vanInventoryData = vanInventoryResponse?.data;
  const vanInventoryId = vanInventoryData?.id;

  const handleCancel = useCallback(() => {
    setSelectedVanInventory(null);
    setDrawerOpen(false);
    hasLoadedItemsRef.current = false;
    formik.resetForm();
  }, [setSelectedVanInventory, setDrawerOpen, formik]);

  useEffect(() => {
    if (
      isEdit &&
      vanInventoryData &&
      vanInventoryId &&
      !hasLoadedItemsRef.current
    ) {
      const items: VanInventoryItemFormData[] =
        vanInventoryData.items?.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name || null,
          quantity: item.quantity ?? null,
          notes: item.notes || null,
          batch_lot_id: item.batch_lot_id ?? null,
          batch_number: item.batch_number || null,
          lot_number: item.lot_number || null,
          remaining_quantity: item.product_remaining_quantity ?? null,
          total_quantity: item.batch_total_remaining_quantity ?? null,
          id: item.id,
        })) || [];

      formik.setFieldValue('van_inventory_items', items);
      hasLoadedItemsRef.current = true;
    } else if (!isEdit && !hasLoadedItemsRef.current) {
      formik.setFieldValue('van_inventory_items', []);
      hasLoadedItemsRef.current = true;
    }
  }, [isEdit, vanInventoryId, vanInventoryData]);

  // Reset loaded items flag when drawer closes
  useEffect(() => {
    if (!drawerOpen) {
      hasLoadedItemsRef.current = false;
    }
  }, [drawerOpen]);

  const addInventoryItem = useCallback(() => {
    const newItem: VanInventoryItemFormData = {
      product_id: null,
      quantity: null,
      id: null,
      batch_lot_id: null,
      batch_number: null,
      lot_number: null,
      remaining_quantity: null,
      total_quantity: null,
      product_batches: [],
    };
    formik.setFieldValue('van_inventory_items', [
      ...(formik.values.van_inventory_items || []),
      newItem,
    ]);
  }, [formik]);

  const removeInventoryItem = useCallback(
    (index: number) => {
      const updatedItems = (formik.values.van_inventory_items || []).filter(
        (_: VanInventoryItemFormData, i: number) => i !== index
      );
      formik.setFieldValue('van_inventory_items', updatedItems);
    },
    [formik]
  );

  const updateInventoryItem = useCallback(
    (
      index: number,
      field: keyof VanInventoryItemFormData,
      value: string | number | null
    ) => {
      const currentItems = formik.values.van_inventory_items || [];
      const item = currentItems[index];

      if (!item) return;

      const updatedItems = [...currentItems];

      if (field === 'product_id') {
        const numericValue =
          value === '' || value === null ? null : Number(value);
        const product = products.find(p => p.id === numericValue);
        updatedItems[index] = {
          ...item,
          product_id: numericValue,
          product_name: product?.name || null,
          batch_lot_id: null,
          batch_number: null,
          lot_number: null,
          remaining_quantity: null,
          total_quantity: null,
          quantity: null,
          notes: '',
          product_batches: [],
        };
      } else if (field === 'quantity') {
        updatedItems[index] = {
          ...item,
          quantity: value === '' || value === null ? null : Number(value),
        };
      } else {
        updatedItems[index] = {
          ...item,
          [field]: value === '' || value === null ? null : value,
        };
      }

      formik.setFieldValue('van_inventory_items', updatedItems);
    },
    [formik, products]
  );

  const handleBatchChange = useCallback(
    (
      rowIndex: number,
      batchLotId: number | null,
      remainingQuantity: number | null
    ) => {
      const currentItems = formik.values.van_inventory_items || [];
      const item = currentItems[rowIndex];

      if (!item) return;

      const updatedItems = [...currentItems];
      updatedItems[rowIndex] = {
        ...item,
        batch_lot_id: batchLotId,
        remaining_quantity: remainingQuantity,
      };

      formik.setFieldValue('van_inventory_items', updatedItems);
    },
    [formik]
  );

  const inventoryItemColumns: TableColumn<VanInventoryItemFormData>[] = useMemo(
    () => [
      {
        id: 'product_id',
        label: 'Product',
        width: 300,
        render: (_value, row, rowIndex) => (
          <Select
            name={`van_inventory_items[${rowIndex}].product_id`}
            value={row.product_id ?? ''}
            onChange={e => {
              const value = e.target.value;
              updateInventoryItem(
                rowIndex,
                'product_id',
                value === '' || value === null ? null : Number(value)
              );
            }}
            fullWidth
            size="small"
            placeholder="Select product"
            disableClearable={false}
          >
            {products.map(product => (
              <MenuItem key={product.id} value={product.id}>
                {product.name}
                {product.code && ` (${product.code})`}
              </MenuItem>
            ))}
          </Select>
        ),
      },
      {
        id: 'batch_lot_id',
        label: 'Batch / Lot',
        width: 300,
        render: (_value, row, rowIndex) => (
          <BatchLotSelector
            rowIndex={rowIndex}
            row={row}
            onBatchChange={handleBatchChange}
          />
        ),
      },
      {
        id: 'available_quantity',
        label: 'Available Qty',
        width: 150,
        render: (_value, row) => {
          const hasQuantity = row.remaining_quantity != null;
          return (
            <Box className={`!px-3 !py-2 !rounded !border !border-gray-300`}>
              <Typography
                variant="body2"
                className={`!font-semibold !text-center`}
              >
                {hasQuantity ? row.remaining_quantity?.toLocaleString() : '-'}
              </Typography>
            </Box>
          );
        },
      },
      {
        id: 'quantity',
        label: formik.values.loading_type === 'L' ? 'Load Qty' : 'Unload Qty',
        width: 150,
        render: (_value, row, rowIndex) => {
          const hasExceeded =
            row.quantity != null &&
            row.remaining_quantity != null &&
            Number(row.quantity) > row.remaining_quantity;

          return (
            <Box className="!flex !flex-col !gap-1">
              <Input
                name={`van_inventory_items[${rowIndex}].quantity`}
                type="number"
                value={row.quantity ?? ''}
                onChange={e =>
                  updateInventoryItem(
                    rowIndex,
                    'quantity',
                    e.target.value === '' ? null : Number(e.target.value)
                  )
                }
                size="small"
                fullWidth
                placeholder="Enter qty"
                inputProps={{ min: 0, step: 1 }}
                error={hasExceeded}
              />
              {hasExceeded && (
                <Typography
                  variant="caption"
                  className="!text-red-600 !font-medium"
                >
                  ⚠️ Exceeds available qty!
                </Typography>
              )}
            </Box>
          );
        },
      },
      {
        id: 'action' as any,
        label: 'Actions',
        width: 80,
        sortable: false,
        render: (_value, _row, rowIndex) => (
          <DeleteButton
            onClick={() => removeInventoryItem(rowIndex)}
            tooltip="Remove item"
            size="small"
          />
        ),
      },
    ],
    [
      products,
      formik.values.loading_type,
      updateInventoryItem,
      handleBatchChange,
      removeInventoryItem,
    ]
  );

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Van Stock' : 'Load/Unload Stock to Van'}
      size="large"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-3">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Select
              name="user_id"
              label="Van Inventory User"
              formik={formik}
              required
            >
              {users.map(user => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </MenuItem>
              ))}
            </Select>

            <Select name="loading_type" label="Type" formik={formik} required>
              <MenuItem value="L">Load</MenuItem>
              <MenuItem value="U">Unload</MenuItem>
            </Select>

            <Select name="status" label="Status" formik={formik} required>
              <MenuItem value="D">Draft</MenuItem>
              <MenuItem value="A">Confirmed</MenuItem>
              <MenuItem value="C">Canceled</MenuItem>
            </Select>

            <Input
              name="document_date"
              label="Document Date"
              type="date"
              formik={formik}
              required
            />

            <Select
              name="vehicle_id"
              label="Vehicle"
              formik={formik}
              placeholder="Select Vehicle"
            >
              {vehicles.map((vehicle: any) => (
                <MenuItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.vehicle_number} ({vehicle.type})
                </MenuItem>
              ))}
            </Select>

            <Select
              name="location_id"
              label="Location/Depot"
              formik={formik}
              placeholder="Select Location/Depot"
            >
              {depots.map((depot: any) => (
                <MenuItem key={depot.id} value={depot.id}>
                  {depot.name} ({depot.code})
                </MenuItem>
              ))}
            </Select>
          </Box>

          <ActiveInactiveField
            name="is_active"
            label="Active Status"
            formik={formik}
            required
          />

          <Table
            data={formik.values.van_inventory_items}
            compact
            actions={
              <Box className="!flex !justify-between !items-center">
                <Typography variant="body1" className="!font-semibold">
                  Inventory Items
                </Typography>
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  onClick={addInventoryItem}
                  startIcon={<Plus size={16} />}
                >
                  Add Item
                </Button>
              </Box>
            }
            columns={inventoryItemColumns}
            getRowId={item =>
              item.id?.toString() ?? `temp-${item.product_id}-${Math.random()}`
            }
            pagination={false}
            emptyMessage="No items added. Click 'Add Item' to add inventory items"
          />

          <Box className="!flex !justify-end !gap-3 !mt-6">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              disabled={
                createVanInventoryMutation.isPending ||
                updateVanInventoryMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createVanInventoryMutation.isPending ||
                updateVanInventoryMutation.isPending
              }
            >
              {createVanInventoryMutation.isPending ||
              updateVanInventoryMutation.isPending
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

export default ManageVanInventory;
