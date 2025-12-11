import { Add } from '@mui/icons-material';
import { Box, MenuItem, Typography } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreatePriceList,
  useUpdatePriceList,
  type PriceList,
} from 'hooks/usePriceLists';
import { useProducts } from 'hooks/useProducts';
import React, { useState } from 'react';
import { priceListValidationSchema } from 'schemas/priceLists.schema';
import { DeleteButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import ProductSelect from 'shared/ProductSelect';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';

interface ManagePriceListProps {
  selectedPriceList?: PriceList | null;
  setSelectedPriceList: (priceList: PriceList | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

interface PriceListItemForm {
  product_id: number | '';
  unit_price: string;
  uom: string;
  discount_percent: string;
  effective_from: string;
  effective_to: string;
  is_active: string;
}

const ManagePriceList: React.FC<ManagePriceListProps> = ({
  selectedPriceList,
  setSelectedPriceList,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedPriceList;
  const [priceListItems, setPriceListItems] = useState<PriceListItemForm[]>([]);

  const createPriceListMutation = useCreatePriceList();
  const updatePriceListMutation = useUpdatePriceList();

  // Fetch products for dropdown
  const { data: productsResponse } = useProducts({ limit: 1000 });
  const products = productsResponse?.data || [];

  const handleCancel = () => {
    setSelectedPriceList(null);
    setDrawerOpen(false);
    setPriceListItems([]);
    formik.resetForm();
  };

  // Initialize price list items when editing
  React.useEffect(() => {
    if (selectedPriceList?.pricelist_item) {
      const items = selectedPriceList.pricelist_item.map(item => ({
        product_id: item.product_id,
        unit_price: item.unit_price,
        uom: item.uom || '',
        discount_percent: item.discount_percent || '',
        effective_from: item.effective_from
          ? item.effective_from.split('T')[0]
          : '',
        effective_to: item.effective_to ? item.effective_to.split('T')[0] : '',
        is_active: item.is_active,
      }));
      setPriceListItems(items);
    } else {
      setPriceListItems([]);
    }
  }, [selectedPriceList]);

  const formik = useFormik({
    initialValues: {
      name: selectedPriceList?.name || '',
      description: selectedPriceList?.description || '',
      currency_code: selectedPriceList?.currency_code || 'INR',
      valid_from: selectedPriceList?.valid_from
        ? selectedPriceList.valid_from.split('T')[0]
        : '',
      valid_to: selectedPriceList?.valid_to
        ? selectedPriceList.valid_to.split('T')[0]
        : '',
      is_active: selectedPriceList?.is_active || 'Y',
    },
    validationSchema: priceListValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const submitData = {
          ...values,
          currency_code: values.currency_code || 'INR',
          valid_from: values.valid_from || undefined,
          valid_to: values.valid_to || undefined,
          description: values.description || undefined,
          priceListItems: priceListItems
            .filter(item => item.product_id !== '')
            .map(item => ({
              product_id: Number(item.product_id),
              unit_price: item.unit_price,
              uom: item.uom || undefined,
              discount_percent: item.discount_percent || undefined,
              effective_from: item.effective_from || undefined,
              effective_to: item.effective_to || undefined,
              is_active: item.is_active,
            })),
        };

        if (isEdit && selectedPriceList) {
          await updatePriceListMutation.mutateAsync({
            id: selectedPriceList.id,
            data: submitData,
          });
        } else {
          await createPriceListMutation.mutateAsync(submitData);
        }
        handleCancel();
      } catch (error) {
        console.error('Error submitting price list:', error);
      }
    },
  });

  // Helper functions for managing price list items
  const addPriceListItem = () => {
    const newItem: PriceListItemForm = {
      product_id: '',
      unit_price: '',
      uom: '',
      discount_percent: '',
      effective_from: '',
      effective_to: '',
      is_active: 'Y',
    };
    setPriceListItems([...priceListItems, newItem]);
  };

  const removePriceListItem = (index: number) => {
    const updatedItems = priceListItems.filter((_, i) => i !== index);
    setPriceListItems(updatedItems);
  };

  const updatePriceListItem = (
    index: number,
    field: keyof PriceListItemForm,
    value: string | number
  ) => {
    const updatedItems = [...priceListItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setPriceListItems(updatedItems);
  };

  // Add index to each item for table operations
  const priceListItemsWithIndex = priceListItems.map((item, index) => ({
    ...item,
    _index: index,
  }));

  // Table columns configuration
  const priceListItemsColumns: TableColumn<
    PriceListItemForm & { _index: number }
  >[] = [
    {
      id: 'product_id',
      label: 'Product',
      render: (_value, row) => (
        <ProductSelect
          value={row.product_id}
          onChange={(_event, product) =>
            updatePriceListItem(row._index, 'product_id', product ? product.id : '')
          }
          size="small"
          className="!min-w-40"
        />
      ),
    },
    {
      id: 'unit_price',
      label: 'Unit Price',
      render: (_value, row) => (
        <Input
          value={row.unit_price}
          onChange={e =>
            updatePriceListItem(row._index, 'unit_price', e.target.value)
          }
          placeholder="0.00"
          type="number"
          size="small"
          className="!min-w-24"
        />
      ),
    },
    {
      id: 'uom',
      label: 'UOM',
      render: (_value, row) => (
        <Input
          value={row.uom}
          onChange={e => updatePriceListItem(row._index, 'uom', e.target.value)}
          placeholder="Unit"
          size="small"
          className="!min-w-20"
        />
      ),
    },
    {
      id: 'discount_percent',
      label: 'Discount %',
      render: (_value, row) => (
        <Input
          value={row.discount_percent}
          onChange={e =>
            updatePriceListItem(row._index, 'discount_percent', e.target.value)
          }
          placeholder="0"
          type="number"
          size="small"
          className="!min-w-20"
        />
      ),
    },
    {
      id: 'effective_from',
      label: 'Effective From',
      render: (_value, row) => (
        <Input
          value={row.effective_from}
          onChange={e =>
            updatePriceListItem(row._index, 'effective_from', e.target.value)
          }
          type="date"
          size="small"
          className="!min-w-32"
        />
      ),
    },
    {
      id: 'effective_to',
      label: 'Effective To',
      render: (_value, row) => (
        <Input
          value={row.effective_to}
          onChange={e =>
            updatePriceListItem(row._index, 'effective_to', e.target.value)
          }
          type="date"
          size="small"
          className="!min-w-32"
        />
      ),
    },
    {
      id: 'is_active',
      label: 'Status',
      render: (_value, row) => (
        <Select
          value={row.is_active}
          onChange={e =>
            updatePriceListItem(row._index, 'is_active', e.target.value)
          }
          size="small"
          className="!min-w-20"
        >
          <MenuItem value="Y">Active</MenuItem>
          <MenuItem value="N">Inactive</MenuItem>
        </Select>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_value, row) => (
        <DeleteButton
          onClick={() => removePriceListItem(row._index)}
          tooltip="Remove item"
          confirmDelete={true}
          itemName="price list item"
        />
      ),
    },
  ];

  const currencyOptions = [
    { value: 'INR', label: 'INR - Indian Rupee' },
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'JPY', label: 'JPY - Japanese Yen' },
    { value: 'AUD', label: 'AUD - Australian Dollar' },
    { value: 'CAD', label: 'CAD - Canadian Dollar' },
  ];

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Price List' : 'Create Price List'}
      size="larger"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Box className="md:!col-span-2">
              <Input
                name="name"
                label="Price List Name"
                placeholder="Enter price list name"
                formik={formik}
                required
              />
            </Box>

            <Box className="md:!col-span-2">
              <Input
                name="description"
                label="Description"
                placeholder="Enter description"
                formik={formik}
                multiline
                rows={3}
              />
            </Box>

            <Select
              name="currency_code"
              label="Currency"
              formik={formik}
              required
            >
              {currencyOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>

            <Select name="is_active" label="Status" formik={formik} required>
              <MenuItem value="Y">Active</MenuItem>
              <MenuItem value="N">Inactive</MenuItem>
            </Select>

            <Input
              name="valid_from"
              label="Valid From"
              type="date"
              formik={formik}
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <Input
              name="valid_to"
              label="Valid To"
              type="date"
              formik={formik}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>

          {/* Price List Items Section */}
          <Box className="!space-y-4">
            <Box className="!flex !justify-between !items-center">
              <Typography
                variant="h6"
                className="!font-semibold !text-gray-900"
              >
                Price List Items
              </Typography>
              <Button
                type="button"
                variant="outlined"
                startIcon={<Add />}
                onClick={addPriceListItem}
                size="small"
              >
                Add Item
              </Button>
            </Box>

            {priceListItems.length > 0 && (
              <Table
                data={priceListItemsWithIndex}
                columns={priceListItemsColumns}
                getRowId={row => row._index.toString()}
                pagination={false}
                sortable={false}
                emptyMessage="No price list items added yet."
              />
            )}

            {priceListItems.length === 0 && (
              <Box className="!text-center !py-8 !text-gray-500">
                <Typography variant="body2">
                  No price list items added yet. Click "Add Item" to get
                  started.
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
                createPriceListMutation.isPending ||
                updatePriceListMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createPriceListMutation.isPending ||
                updatePriceListMutation.isPending
              }
            >
              {createPriceListMutation.isPending ||
              updatePriceListMutation.isPending
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

export default ManagePriceList;
