import { Tag, WarningAmberRounded } from '@mui/icons-material';
import { Box, MenuItem, Tooltip, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useDepots } from 'hooks/useDepots';
import { useProducts } from 'hooks/useProducts';
import {
  useCreateVanInventory,
  useUpdateVanInventory,
  useVanInventoryById,
  type ProductBatch,
  type VanInventory,
} from 'hooks/useVanInventory';
import { useVehicles } from 'hooks/useVehicles';
import { Plus } from 'lucide-react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { toast } from 'react-toastify';
import { vanInventoryValidationSchema } from 'schemas/vanInventory.schema';
import { DeleteButton } from 'shared/ActionButton';
import ActiveInactiveField from 'shared/ActiveInactiveField';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import UserSelect from 'shared/UserSelect';
import ManageBatch from '../ManageBatch';
import ManageSerial from '../ManageSerial';

interface ManageVanInventoryProps {
  selectedVanInventory?: VanInventory | null;
  setSelectedVanInventory: (vanInventory: VanInventory | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

interface VanInventoryItemFormData {
  product_id: number | null;
  product_name?: string | null;
  quantity: number | string | null;
  notes?: string | null;
  batch_lot_id: number | null;
  batch_number?: string | null;
  tracking_type?: string | null;
  lot_number?: string | null;
  remaining_quantity?: number | null;
  total_quantity?: number | null;
  product_batches?: ProductBatch[];
  product_serials?: any;
  id?: number | null;
  tempId?: string; // Added for stable row identification
}

export interface VanInventoryFormValues {
  user_id: string | number;
  loading_type: string;
  status: string;
  document_date: string;
  vehicle_id: string | number;
  location_type: string;
  location_id: string | number;
  is_active: string;
  van_inventory_items: VanInventoryItemFormData[];
}

// Generate stable temporary ID
let tempIdCounter = 0;
const generateTempId = () => `temp-${Date.now()}-${tempIdCounter++}`;

const ManageVanInventory: React.FC<ManageVanInventoryProps> = ({
  selectedVanInventory,
  setSelectedVanInventory,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedVanInventory;
  const hasLoadedItemsRef = useRef(false);
  const [isBatchSelectorOpen, setIsBatchSelectorOpen] = useState(false);
  const [isSerialSelectorOpen, setIsSerialSelectorOpen] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number | string | null>(null);

  const createVanInventoryMutation = useCreateVanInventory();
  const updateVanInventoryMutation = useUpdateVanInventory();
  const { data: vanInventoryResponse } = useVanInventoryById(
    selectedVanInventory?.id || 0
  );

  const { data: productsResponse } = useProducts({ limit: 1000 });
  const { data: vehiclesResponse } = useVehicles({ limit: 1000 });
  const { data: depotsResponse } = useDepots({ limit: 1000 });

  const products = useMemo(
    () => productsResponse?.data || [],
    [productsResponse]
  );
  const vehicles = useMemo(
    () => vehiclesResponse?.data || [],
    [vehiclesResponse]
  );
  const depots = useMemo(() => depotsResponse?.data || [], [depotsResponse]);

  const formik = useFormik<VanInventoryFormValues>({
    initialValues: {
      user_id: selectedVanInventory?.user_id || '',
      loading_type: selectedVanInventory?.loading_type || 'L',
      status: selectedVanInventory?.status || 'D',
      document_date: selectedVanInventory?.document_date || '',
      vehicle_id: selectedVanInventory?.vehicle_id || '',
      location_type: selectedVanInventory?.location_type || 'van',
      location_id: selectedVanInventory?.location_id || '',
      is_active: selectedVanInventory?.is_active || 'Y',
      van_inventory_items: [],
    },
    validationSchema: vanInventoryValidationSchema,
    validateOnMount: true,
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
          toast.error(
            'Some items have quantities exceeding available stock. Please adjust before submitting.'
          );
          return false;
        }

        const incompleteItems = values.van_inventory_items.filter(item => {
          if (!item.product_id || item.quantity == null) return true;

          const trackingType = (item.tracking_type || '').toLowerCase();
          const qty = Number(item.quantity);
          if (!Number.isFinite(qty) || qty <= 0) return true;

          if (trackingType === 'serial') {
            const serials = (item.product_serials || []) as any[];
            if (!Array.isArray(serials) || serials.length !== qty) return true;
            const trimmed = serials.map(s =>
              String((s?.serial_number ?? s) || '').trim()
            );
            if (trimmed.some(s => !s)) return true;
            const seen = new Set(trimmed.map(s => s.toLowerCase()));
            if (seen.size !== trimmed.length) return true;
            return false;
          }

          if (trackingType === 'batch') {
            const batches = (item.product_batches || []) as any[];
            const total = batches.reduce(
              (acc, b) => acc + (Number(b?.quantity) || 0),
              0
            );
            if (total !== qty) return true;

            if (values.loading_type === 'U') {
              const derivedBatchLotId =
                item.batch_lot_id ??
                (batches.length === 1 ? batches[0]?.batch_lot_id : null);
              if (!derivedBatchLotId) return true;
            }
            return false;
          }

          return !item.batch_lot_id;
        });

        if (incompleteItems.length > 0) {
          toast.error(
            'Please complete all fields (Product, Batch, and Quantity) for all items before submitting.'
          );
          return false;
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
            .map(item => {
              const trackingType = (item.tracking_type || '').toLowerCase();
              const qty = Number(item.quantity);
              const batches = (item.product_batches || []) as any[];

              const derivedBatchLotId =
                item.batch_lot_id ??
                (batches.length === 1 ? batches[0]?.batch_lot_id : null);

              return {
                product_id: Number(item.product_id),
                product_name: item.product_name || null,
                quantity: qty,
                notes: item.notes || null,
                tracking_type: item.tracking_type || null,
                batch_lot_id: derivedBatchLotId
                  ? Number(derivedBatchLotId)
                  : null,
                product_batches:
                  trackingType === 'batch'
                    ? batches.map(b => ({
                        ...b,
                        quantity:
                          b?.quantity == null ? null : Number(b.quantity),
                        batch_lot_id: b?.batch_lot_id
                          ? Number(b.batch_lot_id)
                          : undefined,
                      }))
                    : undefined,
                product_serials:
                  trackingType === 'serial'
                    ? ((item.product_serials || []) as any[]).map(s => {
                        const serial_number = String(
                          (s?.serial_number ?? s) || ''
                        ).trim();
                        return {
                          ...(typeof s === 'object' ? s : {}),
                          serial_number,
                          quantity: 1,
                          product_id: Number(item.product_id),
                        };
                      })
                    : undefined,
                id: item.id || undefined,
              };
            }),
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
        toast.error('Failed to save van inventory. Please try again.');
        return;
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
          tempId: item.id ? `edit-${item.id}` : generateTempId(), // Stable ID
        })) || [];

      formik.setFieldValue('van_inventory_items', items);
      hasLoadedItemsRef.current = true;
    } else if (!isEdit && !hasLoadedItemsRef.current) {
      formik.setFieldValue('van_inventory_items', []);
      hasLoadedItemsRef.current = true;
    }
  }, [isEdit, vanInventoryId, vanInventoryData]);

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
      product_serials: [],
      tempId: generateTempId(), // Stable ID for new items
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
          tracking_type: product?.tracking_type || null,
          lot_number: null,
          remaining_quantity: null,
          total_quantity: null,
          quantity: null,
          notes: '',
          product_batches: [],
          product_serials: [],
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

  const handleSelectBatch = useCallback(
    (rowIndex: number) => {
      const inventoryItem = formik.values.van_inventory_items[rowIndex];
      if (inventoryItem) {
        setSelectedRowIndex(rowIndex);
        setQuantity(inventoryItem.quantity);
        setIsBatchSelectorOpen(true);
      } else {
        setSelectedRowIndex(null);
        setQuantity(null);
        setIsBatchSelectorOpen(false);
      }
    },
    [formik.values.van_inventory_items]
  );

  const handleSelectSerial = useCallback(
    (rowIndex: number) => {
      const inventoryItem = formik.values.van_inventory_items[rowIndex];
      if (inventoryItem) {
        setSelectedRowIndex(rowIndex);
        setQuantity(inventoryItem.quantity);
        setIsSerialSelectorOpen(true);
      } else {
        setSelectedRowIndex(null);
        setQuantity(null);
        setIsSerialSelectorOpen(false);
      }
    },
    [formik.values.van_inventory_items]
  );

  const inventoryItemColumns: TableColumn<VanInventoryItemFormData>[] = useMemo(
    () => [
      {
        id: 'product_id',
        label: 'Product',
        width: 450,
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
                {product.code && ` [${product.code}]`}
              </MenuItem>
            ))}
          </Select>
        ),
      },
      {
        id: 'tracking_type',
        label: 'Tracking Type',
        width: 300,
        render: (value, row, rowIndex) => (
          <Box className="flex justify-between items-center">
            <Typography variant="body2" className="!text-gray-700 uppercase">
              {value ?? 'None'}
            </Typography>
            <Box className="flex justify-end items-center gap-2">
              {(value && value.toLowerCase() === 'batch') ||
              (value && value.toLowerCase() === 'serial') ? (
                <Button
                  startIcon={<Tag />}
                  variant="text"
                  onClick={() => {
                    if (
                      row.quantity === null ||
                      row.quantity === undefined ||
                      row.quantity === ''
                    ) {
                      toast.error(
                        'Please manage the quantity on Item with ' +
                          (value && value.toLowerCase() === 'batch'
                            ? 'batches'
                            : 'serial numbers')
                      );
                      return;
                    }
                    value && value.toLowerCase() === 'batch'
                      ? handleSelectBatch(rowIndex)
                      : handleSelectSerial(rowIndex);
                  }}
                >
                  Select{' '}
                  {value && value.toLowerCase() === 'batch'
                    ? 'Batch'
                    : value && value.toLowerCase() === 'serial'
                      ? 'Serial'
                      : 'None'}
                </Button>
              ) : null}

              {(() => {
                const trackingType = String(
                  row.tracking_type || value || ''
                ).toLowerCase();
                const qty = Number(row.quantity);
                if (!Number.isFinite(qty) || qty <= 0) return false;

                if (trackingType === 'serial') {
                  return (row.product_serials?.length || 0) !== qty;
                }

                if (trackingType === 'batch') {
                  const totalBatchQty = (row.product_batches || []).reduce(
                    (acc, batch) => acc + (Number(batch.quantity) || 0),
                    0
                  );
                  return totalBatchQty !== qty;
                }

                return false;
              })() && (
                <Tooltip
                  placement="top"
                  color="error"
                  title={
                    String(row.tracking_type || value || '').toLowerCase() ===
                    'serial'
                      ? `Mismatch: ${row.product_serials?.length || 0} serial number(s) assigned, but quantity is ${row.quantity}. Please select serials to match the quantity.`
                      : `Mismatch: ${
                          row.product_batches?.reduce(
                            (acc, batch) => acc + (Number(batch.quantity) || 0),
                            0
                          ) || 0
                        } units in batches, but quantity is ${row.quantity}. Please adjust batch quantities to match.`
                  }
                  arrow
                >
                  <WarningAmberRounded color="error" fontSize="small" />
                </Tooltip>
              )}
            </Box>
          </Box>
        ),
      },
      {
        id: 'quantity',
        label: `${formik.values.loading_type === 'L' ? 'Load' : 'Unload'} Quantity`,
        width: 250,
        render: (_value, row, rowIndex) => (
          <Input
            name={`van_inventory_items[${rowIndex}].quantity`}
            type="number"
            value={row.quantity ?? ''}
            onChange={e => {
              const value = e.target.value;
              updateInventoryItem(
                rowIndex,
                'quantity',
                value === '' ? null : value
              );
            }}
            size="small"
            fullWidth
            placeholder="Enter Quantity"
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
            onClick={() => removeInventoryItem(rowIndex)}
            tooltip="Remove item"
          />
        ),
      },
    ],
    [
      products,
      formik.values.loading_type,
      updateInventoryItem,
      removeInventoryItem,
      handleSelectBatch,
      handleSelectSerial,
    ]
  );

  const hasInvalidStock = useMemo(
    () =>
      (formik.values.van_inventory_items || []).some(
        item =>
          item.batch_lot_id &&
          item.quantity != null &&
          item.remaining_quantity != null &&
          Number(item.quantity) > item.remaining_quantity
      ),
    [formik.values.van_inventory_items]
  );

  const hasIncompleteItems = useMemo(
    () =>
      (formik.values.van_inventory_items || []).some(item => {
        if (!item.product_id || item.quantity == null) return true;

        const trackingType = (item.tracking_type || '').toLowerCase();
        const qty = Number(item.quantity);
        if (!Number.isFinite(qty) || qty <= 0) return true;

        if (trackingType === 'serial') {
          const serials = (item.product_serials || []) as any[];
          if (!Array.isArray(serials) || serials.length !== qty) return true;
          const trimmed = serials.map(s =>
            String((s?.serial_number ?? s) || '').trim()
          );
          if (trimmed.some(s => !s)) return true;
          const seen = new Set(trimmed.map(s => s.toLowerCase()));
          return seen.size !== trimmed.length;
        }

        if (trackingType === 'batch') {
          const batches = (item.product_batches || []) as any[];
          const total = batches.reduce(
            (acc, b) => acc + (Number(b?.quantity) || 0),
            0
          );
          if (total !== qty) return true;

          if (formik.values.loading_type === 'U') {
            const derivedBatchLotId =
              item.batch_lot_id ??
              (batches.length === 1 ? batches[0]?.batch_lot_id : null);
            if (!derivedBatchLotId) return true;
          }

          return false;
        }

        return !item.batch_lot_id;
      }),
    [formik.values.van_inventory_items, formik.values.loading_type]
  );

  const hasTrackingMismatch = useMemo(
    () =>
      (formik.values.van_inventory_items || []).some(item => {
        const trackingType = (item.tracking_type || '').toLowerCase();
        const qty = Number(item.quantity);
        if (!Number.isFinite(qty) || qty <= 0) return false;

        if (trackingType === 'serial') {
          return (item.product_serials?.length || 0) !== qty;
        }

        if (trackingType === 'batch') {
          const totalBatchQty = (item.product_batches || []).reduce(
            (acc, batch) => acc + (Number(batch.quantity) || 0),
            0
          );
          return totalBatchQty !== qty;
        }

        return false;
      }),
    [formik.values.van_inventory_items]
  );

  const isSubmitDisabled =
    createVanInventoryMutation.isPending ||
    updateVanInventoryMutation.isPending ||
    !formik.isValid ||
    hasInvalidStock ||
    hasIncompleteItems ||
    hasTrackingMismatch;

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
            <UserSelect
              name="user_id"
              label="Van Inventory User"
              formik={formik}
              required
            />

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
            getRowId={item => item.tempId || item.id?.toString() || 'unknown'}
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
              disabled={isSubmitDisabled}
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
      <ManageBatch
        isOpen={isBatchSelectorOpen}
        setIsOpen={setIsBatchSelectorOpen}
        selectedRowIndex={selectedRowIndex}
        setSelectedRowIndex={setSelectedRowIndex}
        formik={formik}
        quantity={quantity}
      />
      <ManageSerial
        isOpen={isSerialSelectorOpen}
        setIsOpen={setIsSerialSelectorOpen}
        selectedRowIndex={selectedRowIndex}
        setSelectedRowIndex={setSelectedRowIndex}
        formik={formik}
        quantity={quantity}
      />
    </CustomDrawer>
  );
};

export default ManageVanInventory;
