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
import React, { useRef } from 'react';
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
  unit?: string | null;
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
  updateInventoryItem: (
    index: number,
    field: keyof VanInventoryItemFormData,
    value: string | number | null
  ) => void;
}

const BatchLotSelector: React.FC<BatchLotSelectorProps> = ({
  rowIndex,
  row,
  updateInventoryItem,
}) => {
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

  const productBatches: ProductBatch[] =
    productBatchesResponse?.data?.batches || [];

  const handleBatchChange = (batchLotId: number | null) => {
    updateInventoryItem(rowIndex, 'batch_lot_id', batchLotId);

    if (!batchLotId) {
      updateInventoryItem(rowIndex, 'batch_number', null);
      updateInventoryItem(rowIndex, 'lot_number', null);
      updateInventoryItem(rowIndex, 'remaining_quantity', null);
      updateInventoryItem(rowIndex, 'total_quantity', null);
      updateInventoryItem(rowIndex, 'quantity', null);
      return;
    }

    const selectedBatch = productBatches.find(
      (pb: ProductBatch) => pb.batch_lot_id === batchLotId
    );

    if (selectedBatch) {
      updateInventoryItem(rowIndex, 'batch_number', selectedBatch.batch_number);
      updateInventoryItem(
        rowIndex,
        'lot_number',
        selectedBatch.lot_number || null
      );
      updateInventoryItem(
        rowIndex,
        'remaining_quantity',
        selectedBatch.batch_remaining_quantity
      );
      updateInventoryItem(
        rowIndex,
        'total_quantity',
        selectedBatch.batch_total_quantity
      );
      updateInventoryItem(rowIndex, 'quantity', null);
    }
  };

  if (isFetching || (!productBatchesResponse && row.product_id)) {
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
      onChange={e =>
        handleBatchChange(e.target.value === '' ? null : Number(e.target.value))
      }
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
};

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

  // Fetch related data
  const { data: usersResponse } = useUsers({ limit: 1000 });
  const { data: productsResponse } = useProducts({ limit: 1000 });
  const { data: vehiclesResponse } = useVehicles({ limit: 1000 });
  const { data: depotsResponse } = useDepots({ limit: 1000 });

  const users = usersResponse?.data || [];
  const products = productsResponse?.data || [];
  const vehicles = vehiclesResponse?.data || [];
  const depots = depotsResponse?.data || [];

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
          is_active: values.is_active,
          van_inventory_items: values.van_inventory_items
            .filter(item => item.product_id && item.quantity != null)
            .map(item => ({
              product_id: Number(item.product_id),
              product_name: item.product_name || null,
              unit: item.unit || null,
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
      }
    },
  });

  const vanInventoryData = vanInventoryResponse?.data;
  const vanInventoryId = vanInventoryData?.id;

  const handleCancel = () => {
    setSelectedVanInventory(null);
    setDrawerOpen(false);
    hasLoadedItemsRef.current = false;
    formik.resetForm();
  };

  // Load items only once when editing, without infinite loop
  React.useEffect(() => {
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
          unit: item.unit || null,
          quantity: item.quantity ?? null,
          notes: item.notes || null,
          batch_lot_id: item.batch_lot_id ?? null,
          batch_number: item.batch_number || null,
          lot_number: item.lot_number || null,
          remaining_quantity: item.remaining_quantity ?? null,
          total_quantity: item.total_quantity ?? null,
          id: item.id,
        })) || [];

      formik.setFieldValue('van_inventory_items', items);
      hasLoadedItemsRef.current = true;
    } else if (!isEdit && !hasLoadedItemsRef.current) {
      formik.setFieldValue('van_inventory_items', []);
      hasLoadedItemsRef.current = true;
    }
  }, [isEdit, vanInventoryId, vanInventoryData]);

  // Reset flag when drawer closes
  React.useEffect(() => {
    if (!drawerOpen) {
      hasLoadedItemsRef.current = false;
    }
  }, [drawerOpen]);

  const addInventoryItem = () => {
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
  };

  const removeInventoryItem = (index: number) => {
    const updatedItems = (formik.values.van_inventory_items || []).filter(
      (_: VanInventoryItemFormData, i: number) => i !== index
    );
    formik.setFieldValue('van_inventory_items', updatedItems);
  };

  const updateInventoryItem = (
    index: number,
    field: keyof VanInventoryItemFormData,
    value: string | number | null
  ) => {
    const updatedItems = [...(formik.values.van_inventory_items || [])];
    const item = updatedItems[index];

    if (!item) return;

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
    } else if (field === 'batch_lot_id') {
      updatedItems[index] = {
        ...item,
        batch_lot_id: value === '' || value === null ? null : Number(value),
      };
    } else if (field === 'quantity') {
      updatedItems[index] = {
        ...item,
        quantity: value === '' || value === null ? null : Number(value),
      };
    } else {
      updatedItems[index] = { ...item, [field]: value as any };
    }

    formik.setFieldValue('van_inventory_items', updatedItems);
  };

  const inventoryItemColumns: TableColumn<VanInventoryItemFormData>[] = [
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
          updateInventoryItem={updateInventoryItem}
        />
      ),
    },
    {
      id: 'available_quantity',
      label: 'Available Qty',
      width: 150,
      render: (_value, row) => (
        <Box className="!px-3 !py-2 !bg-green-50 !rounded !border !border-green-200">
          <Typography
            variant="body2"
            className="!font-semibold !text-green-700 !text-center"
          >
            {row.remaining_quantity != null
              ? row.remaining_quantity.toLocaleString()
              : '-'}
            {row.unit && ` ${row.unit}`}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'quantity',
      label: formik.values.loading_type === 'L' ? 'Load Qty' : 'Unload Qty',
      width: 150,
      render: (_value, row, rowIndex) => (
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
          />
        </Box>
      ),
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
  ];

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Van Stock' : 'Load/Unload Stock to Van'}
      fullWidth
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
            getRowId={item => item.id ?? `${item.product_id}-${Math.random()}`}
            pagination={false}
            emptyMessage="No items added. Click 'Add Item' to add inventory items"
          />

          <Box className="!flex !justify-end !gap-3">
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
