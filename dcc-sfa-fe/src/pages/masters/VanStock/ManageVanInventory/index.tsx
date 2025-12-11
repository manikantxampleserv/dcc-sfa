import { Box, MenuItem, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useProducts } from 'hooks/useProducts';
import { useUsers } from 'hooks/useUsers';
import { useVehicles } from 'hooks/useVehicles';
import { useDepots } from 'hooks/useDepots';
import {
  useCreateVanInventory,
  useUpdateVanInventory,
  useVanInventoryById,
  type VanInventory,
} from 'hooks/useVanInventory';
import { Package, Plus } from 'lucide-react';
import React, { useState } from 'react';
import { vanInventoryValidationSchema } from 'schemas/vanInventory.schema';
import { DeleteButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import ProductSelect from 'shared/ProductSelect';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';

interface ManageVanInventoryProps {
  selectedVanInventory?: VanInventory | null;
  setSelectedVanInventory: (vanInventory: VanInventory | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

interface VanInventoryItemFormData {
  product_id: number | '';
  product_name?: string | null;
  unit?: string | null;
  quantity: number | '';
  unit_price: number | '';
  discount_amount?: number | '';
  tax_amount?: number | '';
  total_amount?: number | '';
  notes?: string | null;
  id?: number | null;
}

const ManageVanInventory: React.FC<ManageVanInventoryProps> = ({
  selectedVanInventory,
  setSelectedVanInventory,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedVanInventory;
  const [inventoryItems, setInventoryItems] = useState<
    VanInventoryItemFormData[]
  >([]);

  const handleCancel = () => {
    setSelectedVanInventory(null);
    setDrawerOpen(false);
    setInventoryItems([]);
  };

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

  // Load items when editing
  React.useEffect(() => {
    if (isEdit && vanInventoryResponse?.data) {
      const items =
        vanInventoryResponse.data.items?.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name || null,
          unit: item.unit || null,
          quantity: item.quantity || 0,
          unit_price: item.unit_price ? Number(item.unit_price) : 0,
          discount_amount: item.discount_amount
            ? Number(item.discount_amount)
            : 0,
          tax_amount: item.tax_amount ? Number(item.tax_amount) : 0,
          total_amount: item.total_amount ? Number(item.total_amount) : 0,
          notes: item.notes || null,
          id: item.id,
        })) || [];
      setInventoryItems(items as VanInventoryItemFormData[]);
      formik.setFieldValue('van_inventory_items', items);
    } else {
      setInventoryItems([]);
      formik.setFieldValue('van_inventory_items', []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, vanInventoryResponse]);

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
          van_inventory_items: inventoryItems
            .filter(item => item.product_id !== '' && item.quantity !== '')
            .map(item => ({
              product_id: Number(item.product_id),
              product_name: item.product_name || null,
              unit: item.unit || null,
              quantity: Number(item.quantity),
              unit_price: item.unit_price ? Number(item.unit_price) : 0,
              discount_amount: item.discount_amount
                ? Number(item.discount_amount)
                : 0,
              tax_amount: item.tax_amount ? Number(item.tax_amount) : 0,
              total_amount: item.total_amount ? Number(item.total_amount) : 0,
              notes: item.notes || null,
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

  const addInventoryItem = () => {
    const newItem: VanInventoryItemFormData = {
      product_id: '',
      quantity: 0,
      unit_price: 0,
      discount_amount: 0,
      tax_amount: 0,
      total_amount: 0,
      id: null,
    };
    const updatedItems = [...inventoryItems, newItem];
    setInventoryItems(updatedItems);
    formik.setFieldValue('van_inventory_items', updatedItems);
  };

  const removeInventoryItem = (index: number) => {
    const updatedItems = inventoryItems.filter((_, i) => i !== index);
    setInventoryItems(updatedItems);
    formik.setFieldValue('van_inventory_items', updatedItems);
  };

  const updateInventoryItem = (
    index: number,
    field: keyof VanInventoryItemFormData,
    value: string | number
  ) => {
    const updatedItems = [...inventoryItems];
    const item = updatedItems[index];

    if (field === 'product_id') {
      const product = products.find(p => p.id === Number(value));
      updatedItems[index] = {
        ...item,
        product_id: Number(value),
        product_name: product?.name || null,
        unit: null, // Unit can be set manually if needed
      };
    } else if (
      field === 'quantity' ||
      field === 'unit_price' ||
      field === 'discount_amount' ||
      field === 'tax_amount'
    ) {
      const numValue = value === '' ? 0 : Number(value);
      updatedItems[index] = {
        ...item,
        [field]: numValue,
      };

      // Calculate total_amount
      const qty = field === 'quantity' ? numValue : Number(item.quantity) || 0;
      const price =
        field === 'unit_price' ? numValue : Number(item.unit_price) || 0;
      const discount =
        field === 'discount_amount'
          ? numValue
          : Number(item.discount_amount) || 0;
      const tax =
        field === 'tax_amount' ? numValue : Number(item.tax_amount) || 0;
      const total = qty * price - discount + tax;
      updatedItems[index].total_amount = total;
    } else {
      updatedItems[index] = { ...item, [field]: value };
    }

    setInventoryItems(updatedItems);
    formik.setFieldValue('van_inventory_items', updatedItems);
  };

  const itemsWithIndex = inventoryItems.map((item, index) => ({
    ...item,
    _index: index,
  }));

  const inventoryItemColumns: TableColumn<
    VanInventoryItemFormData & { _index: number }
  >[] = [
    {
      id: 'product_id',
      label: 'Product',
      width: 250,
      render: (_value, row) => (
        <ProductSelect
          value={row.product_id}
          onChange={(_event, product) =>
            updateInventoryItem(row._index, 'product_id', product ? product.id : '')
          }
          size="small"
          fullWidth
        />
      ),
    },
    {
      id: 'quantity',
      label: 'Qty',
      width: 100,
      render: (_value, row) => (
        <Input
          value={row.quantity || 0}
          onChange={e =>
            updateInventoryItem(row._index, 'quantity', e.target.value)
          }
          size="small"
          fullWidth
          type="number"
          placeholder="Qty"
          required
        />
      ),
    },
    {
      id: 'unit_price',
      label: 'Unit Price',
      width: 110,
      render: (_value, row) => (
        <Input
          value={row.unit_price || 0}
          onChange={e =>
            updateInventoryItem(row._index, 'unit_price', e.target.value)
          }
          size="small"
          fullWidth
          type="number"
          placeholder="Price"
        />
      ),
    },
    {
      id: 'discount_amount',
      label: 'Discount',
      width: 100,
      render: (_value, row) => (
        <Input
          value={row.discount_amount || 0}
          onChange={e =>
            updateInventoryItem(row._index, 'discount_amount', e.target.value)
          }
          size="small"
          fullWidth
          type="number"
          placeholder="Discount"
        />
      ),
    },
    {
      id: 'tax_amount',
      label: 'Tax',
      width: 90,
      render: (_value, row) => (
        <Input
          value={row.tax_amount || 0}
          onChange={e =>
            updateInventoryItem(row._index, 'tax_amount', e.target.value)
          }
          size="small"
          fullWidth
          type="number"
          placeholder="Tax"
        />
      ),
    },
    {
      id: 'total_amount',
      label: 'Total',
      width: 110,
      render: (_value, row) => (
        <Typography variant="body2" className="!font-medium !text-gray-900">
          {Number(row.total_amount || 0).toFixed(2)}
        </Typography>
      ),
    },
    {
      id: 'notes',
      label: 'Notes',
      width: 150,
      render: (_value, row) => (
        <Input
          value={row.notes || ''}
          onChange={e =>
            updateInventoryItem(row._index, 'notes', e.target.value)
          }
          size="small"
          fullWidth
          placeholder="Notes"
        />
      ),
    },
    {
      id: 'actions',
      label: '',
      sortable: false,
      width: 60,
      render: (_value, row) => (
        <DeleteButton
          onClick={() => removeInventoryItem(row._index)}
          tooltip="Remove item"
          confirmDelete={true}
          size="small"
          itemName="inventory item"
        />
      ),
    },
  ];

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Van Stock' : 'Load/Unload Stock to Van'}
      size="larger"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
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

            <Select name="vehicle_id" label="Vehicle" formik={formik}>
              <MenuItem value="">
                <em>No Vehicle</em>
              </MenuItem>
              {vehicles.map((vehicle: any) => (
                <MenuItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.vehicle_number} ({vehicle.type})
                </MenuItem>
              ))}
            </Select>

            <Select name="location_type" label="Location Type" formik={formik}>
              <MenuItem value="van">Van</MenuItem>
              <MenuItem value="warehouse">Warehouse</MenuItem>
              <MenuItem value="depot">Depot</MenuItem>
              <MenuItem value="store">Store</MenuItem>
            </Select>

            <Select name="location_id" label="Location/Depot" formik={formik}>
              <MenuItem value="">
                <em>No Location</em>
              </MenuItem>
              {depots.map((depot: any) => (
                <MenuItem key={depot.id} value={depot.id}>
                  {depot.name} ({depot.code})
                </MenuItem>
              ))}
            </Select>

            <Select
              name="is_active"
              label="Active Status"
              formik={formik}
              required
            >
              <MenuItem value="Y">Active</MenuItem>
              <MenuItem value="N">Inactive</MenuItem>
            </Select>
          </Box>

          <Box className="!space-y-3">
            <Box className="!flex !justify-between !items-center">
              <Typography
                variant="body1"
                className="!font-semibold !text-gray-900"
              >
                Inventory Items
              </Typography>
              <Button
                type="button"
                variant="outlined"
                startIcon={<Plus />}
                onClick={addInventoryItem}
                size="small"
              >
                Add Item
              </Button>
            </Box>

            {inventoryItems.length > 0 && (
              <Box className="!overflow-x-auto">
                <Table
                  data={itemsWithIndex}
                  columns={inventoryItemColumns}
                  getRowId={row => row._index.toString()}
                  pagination={false}
                  sortable={false}
                  emptyMessage="No items added yet."
                />
              </Box>
            )}

            {inventoryItems.length === 0 && (
              <Box className="!text-center !py-8 !text-gray-500">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <Typography variant="body2">
                  No items added yet. Click "Add Item" to get started.
                </Typography>
              </Box>
            )}
          </Box>

          <Box className="!flex !justify-end !gap-2">
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
