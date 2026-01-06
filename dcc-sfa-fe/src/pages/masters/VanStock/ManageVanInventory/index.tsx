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
import {
  useInventoryItemById,
  type SalespersonInventoryData,
} from 'hooks/useInventoryItems';
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

interface ExtendedProductSerial {
  id?: number;
  product_id: number;
  serial_number: string;
  quantity: number;
  selected?: boolean;
}

interface InventoryByProductId {
  batches: ProductBatch[];
  serials: ExtendedProductSerial[];
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
  product_serials?: ExtendedProductSerial[];
  id?: number | null;
  tempId?: string;
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

  const formik = useFormik<VanInventoryFormValues>({
    initialValues: {
      user_id: selectedVanInventory?.user_id || '',
      loading_type: selectedVanInventory?.loading_type || 'L',
      status: selectedVanInventory?.status || 'A',
      document_date:
        selectedVanInventory?.document_date ||
        new Date().toISOString().split('T')[0],
      vehicle_id: selectedVanInventory?.vehicle_id || '',
      location_type: selectedVanInventory?.location_type || 'van',
      location_id: selectedVanInventory?.location_id || '',
      is_active: selectedVanInventory?.is_active || 'Y',
      van_inventory_items: [],
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
          toast.error(
            'Some items have quantities exceeding available stock. Please adjust before submitting.'
          );
          return false;
        }

        const incompleteItems = values.van_inventory_items.filter(
          item => !item.product_id || item.quantity == null
        );

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
              const processedBatches =
                item.tracking_type?.toLowerCase() === 'batch' &&
                item.product_batches &&
                Array.isArray(item.product_batches) &&
                item.product_batches.length > 0
                  ? item.product_batches.filter(
                      batch => batch?.quantity && batch?.quantity > 0
                    )
                  : null;
              return {
                product_id: Number(item.product_id),
                product_name: item.product_name || null,
                product_serials:
                  item.tracking_type?.toLowerCase() === 'serial' &&
                  item.product_serials &&
                  Array.isArray(item.product_serials) &&
                  item.product_serials.length > 0
                    ? item.product_serials
                    : null,
                product_batches: processedBatches,
                quantity: Number(item.quantity),
                notes: item.notes || null,
                tracking_type: item.tracking_type || null,
                batch_lot_id: item.batch_lot_id
                  ? Number(item.batch_lot_id)
                  : null,
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

  const userIdForInventory = formik.values.user_id
    ? Number(formik.values.user_id)
    : 0;
  const isUnloadType = formik.values.loading_type === 'U';

  const {
    data: userInventoryData,
    isLoading: isLoadingInventory,
    refetch: refetchInventory,
  } = useInventoryItemById(userIdForInventory, {
    enabled: !!userIdForInventory && drawerOpen && isUnloadType,
  });

  const products = useMemo(
    () => productsResponse?.data || [],
    [productsResponse]
  );
  const vehicles = useMemo(
    () => vehiclesResponse?.data || [],
    [vehiclesResponse]
  );
  const depots = useMemo(() => depotsResponse?.data || [], [depotsResponse]);

  const availableProducts = useMemo(() => {
    if (!isUnloadType) {
      return products;
    }

    if (!userInventoryData?.data) {
      return [];
    }

    const responseData = userInventoryData.data;

    const salespersonData = responseData as SalespersonInventoryData;
    return (salespersonData.products || []).map(product => ({
      id: product.product_id,
      name: product.product_name,
      code: product.product_code,
      tracking_type: product.tracking_type,
      unit_price: 0,
    }));
  }, [isUnloadType, userInventoryData, products]);

  const inventoryByProductId = useMemo(() => {
    const map: Record<number, InventoryByProductId> = {};

    if (!isUnloadType || !userInventoryData?.data) {
      return map;
    }

    const responseData = userInventoryData.data;

    const salespersonData = responseData as SalespersonInventoryData;
    (salespersonData.products || []).forEach(product => {
      const batches: ProductBatch[] = (product.batches || []).map(batch => ({
        batch_lot_id: batch.batch_lot_id,
        batch_number: batch.batch_number,
        lot_number: batch.lot_number,
        manufacturing_date: batch.manufacturing_date,
        expiry_date: batch.expiry_date,
        batch_total_quantity: batch.total_quantity,
        batch_remaining_quantity: batch.remaining_quantity,
        remaining_quantity: batch.remaining_quantity,
        supplier_name: batch.supplier_name,
        quality_grade: batch.quality_grade,
        days_until_expiry: batch.days_until_expiry,
        is_expired: batch.is_expired,
        is_expiring_soon: batch.is_expiring_soon,
        quantity: null,
      }));

      const serials: ExtendedProductSerial[] = (product.serials || []).map(
        serial => ({
          id: serial.serial_id,
          product_id: product.product_id,
          serial_number: serial.serial_number,
          quantity: 1,
          selected: false,
        })
      );

      map[product.product_id] = { batches, serials };
    });

    return map;
  }, [isUnloadType, userInventoryData]);

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
      const groupedItems = new Map<number, any>();

      vanInventoryData.items?.forEach(item => {
        const existing = groupedItems.get(item.product_id);
        if (existing) {
          existing.quantity = (existing.quantity || 0) + (item.quantity ?? 0);
          existing.remaining_quantity =
            (existing.remaining_quantity || 0) +
            (item.product_remaining_quantity ?? 0);
          existing.total_quantity =
            (existing.total_quantity || 0) +
            (item.batch_total_remaining_quantity ?? 0);
          if (!existing.product_batches) existing.product_batches = [];
          existing.product_batches.push({
            id: item.id,
            batch_lot_id: item.batch_lot_id,
            batch_number: item.batch_number,
            lot_number: item.lot_number,
            quantity: item.quantity,
            remaining_quantity: item.product_remaining_quantity,
            total_quantity: item.batch_total_remaining_quantity,
            expiry_date: item.expiry_date,
          });
        } else {
          groupedItems.set(item.product_id, {
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
            tempId: item.id ? `edit-${item.id}` : generateTempId(),
            product_batches: [
              {
                id: item.id,
                batch_lot_id: item.batch_lot_id,
                batch_number: item.batch_number,
                lot_number: item.lot_number,
                quantity: item.quantity,
                remaining_quantity: item.product_remaining_quantity,
                total_quantity: item.batch_total_remaining_quantity,
                expiry_date: item.expiry_date,
              },
            ],
          });
        }
      });

      const items: VanInventoryItemFormData[] = Array.from(
        groupedItems.values()
      );
      formik.setFieldValue('van_inventory_items', items);
      hasLoadedItemsRef.current = true;
    } else if (!isEdit && !hasLoadedItemsRef.current) {
      formik.setFieldValue('van_inventory_items', []);
      hasLoadedItemsRef.current = true;
    }
  }, [isEdit, vanInventoryId, vanInventoryData, formik]);

  useEffect(() => {
    if (!drawerOpen) {
      hasLoadedItemsRef.current = false;
    }
  }, [drawerOpen]);

  useEffect(() => {
    if (isUnloadType && userIdForInventory > 0 && drawerOpen) {
      refetchInventory();
    }
  }, [isUnloadType, userIdForInventory, drawerOpen, refetchInventory]);

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
      tempId: generateTempId(),
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
        const product = availableProducts.find(p => p.id === numericValue);

        let initialBatches: ProductBatch[] = [];
        let initialSerials: ExtendedProductSerial[] = [];

        if (
          isUnloadType &&
          numericValue &&
          inventoryByProductId[numericValue]
        ) {
          const inventory = inventoryByProductId[numericValue];
          initialBatches = inventory.batches.map(batch => ({
            ...batch,
            quantity: 0,
          }));
          initialSerials = inventory.serials.map(serial => ({
            ...serial,
            selected: false,
          })) as ExtendedProductSerial[];
        }

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
          quantity:
            isUnloadType &&
            (product?.tracking_type === 'batch' ||
              product?.tracking_type === 'serial')
              ? null
              : null,
          notes: '',
          product_batches: initialBatches,
          product_serials: initialSerials,
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
    [formik, availableProducts, isUnloadType, inventoryByProductId]
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
            placeholder={
              isUnloadType
                ? isLoadingInventory
                  ? 'Loading inventory...'
                  : availableProducts.length === 0
                    ? 'No products in van inventory'
                    : 'Select product from van inventory'
                : 'Select product'
            }
            disableClearable={false}
          >
            {availableProducts.map(product => (
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
                    if (!row.product_id) {
                      toast.error('Please select a product first');
                      return;
                    }
                    if (value && value.toLowerCase() === 'batch') {
                      handleSelectBatch(rowIndex);
                    } else {
                      handleSelectSerial(rowIndex);
                    }
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

              {((row.tracking_type === 'serial' &&
                row.product_serials?.length !== row.quantity) ||
                (row.tracking_type === 'batch' &&
                  row.product_batches?.reduce(
                    (acc, batch) => acc + (batch.quantity ?? 0),
                    0
                  ) !== row.quantity)) && (
                <Tooltip
                  placement="top"
                  color="error"
                  title={
                    row.tracking_type === 'serial'
                      ? `Mismatch: ${row.product_serials?.length || 0} serial number(s) assigned, but quantity is ${row.quantity}. Please select serials to match the quantity.`
                      : `Mismatch: ${row.product_batches?.reduce((acc, batch) => acc + (batch.quantity ?? 0), 0) || 0} units in batches, but quantity is ${row.quantity}. Please adjust batch quantities to match.`
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
        render: (_value, row, rowIndex) => {
          const isTrackingDisabled =
            (row.tracking_type === 'batch' || row.tracking_type === 'serial') &&
            isUnloadType;

          return (
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
              disabled={isTrackingDisabled}
            />
          );
        },
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
      availableProducts,
      formik.values.loading_type,
      updateInventoryItem,
      removeInventoryItem,
      handleSelectBatch,
      handleSelectSerial,
      isUnloadType,
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
              {vehicles.map(vehicle => (
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
              {depots.map(depot => (
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
                  Inventory Items{' '}
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
            emptyMessage={
              isUnloadType
                ? "No items added. For Unload type, only products in user's van inventory are available."
                : "No items added. Click 'Add Item' to add inventory items"
            }
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
      <ManageBatch
        isOpen={isBatchSelectorOpen}
        setIsOpen={isOpen => {
          setIsBatchSelectorOpen(isOpen);
          if (!isOpen && selectedRowIndex !== null) {
            setTimeout(() => {
              const item = formik.values.van_inventory_items[selectedRowIndex];
              console.log('After batch dialog closed, item data:', item);
            }, 100);
          }
        }}
        selectedRowIndex={selectedRowIndex}
        setSelectedRowIndex={setSelectedRowIndex}
        formik={formik}
        quantity={quantity}
        inventoryByProductId={isUnloadType ? inventoryByProductId : undefined}
        isUnloadType={isUnloadType}
      />
      <ManageSerial
        isOpen={isSerialSelectorOpen}
        setIsOpen={setIsSerialSelectorOpen}
        selectedRowIndex={selectedRowIndex}
        setSelectedRowIndex={setSelectedRowIndex}
        formik={formik}
        quantity={quantity}
        inventoryByProductId={isUnloadType ? inventoryByProductId : undefined}
        isUnloadType={isUnloadType}
      />
    </CustomDrawer>
  );
};

export default ManageVanInventory;
