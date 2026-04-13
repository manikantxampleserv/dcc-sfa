import { Add, CheckCircle, Info } from '@mui/icons-material';
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
} from '@mui/material';
import { useFormik } from 'formik';
import { useCustomerCategories } from 'hooks/useCustomerCategory';
import { useCustomers } from 'hooks/useCustomers';
import { useDepots } from 'hooks/useDepots';
import {
  useCreatePriceList,
  useUpdatePriceList,
  type PriceList,
} from 'hooks/usePriceLists';
import { useRoutes } from 'hooks/useRoutes';
import React, { useEffect, useState } from 'react';
import { priceListValidationSchema } from 'schemas/priceLists.schema';
import { DeleteButton } from 'shared/ActionButton';
import ActiveInactiveField from 'shared/ActiveInactiveField';
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
  tax_percent: string;
  sub_unit_price: string;
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
  const [assignmentType, setAssignmentType] = useState<string>('default');

  const createPriceListMutation = useCreatePriceList();
  const updatePriceListMutation = useUpdatePriceList();

  const { data: depotsResponse } = useDepots({ limit: 1000, isActive: 'Y' });
  const { data: routesResponse } = useRoutes({ limit: 1000, status: 'active' });
  const { data: categoriesResponse } = useCustomerCategories({
    limit: 1000,
    is_active: 'Y',
  });
  const { data: customersResponse } = useCustomers({
    limit: 1000,
    isActive: 'Y',
  });

  const depots = depotsResponse?.data || [];
  const routes = routesResponse?.data || [];
  const categories = categoriesResponse?.data || [];
  const customers = customersResponse?.data || [];

  const handleCancel = () => {
    setSelectedPriceList(null);
    setDrawerOpen(false);
    setPriceListItems([]);
    setAssignmentType('default');
    formik.resetForm();
  };

  useEffect(() => {
    if (selectedPriceList?.pricelist_item) {
      const items = selectedPriceList.pricelist_item.map(item => ({
        product_id: item.product_id,
        unit_price: item.unit_price,
        uom: item.uom || '',
        discount_percent: item.discount_percent || '',
        tax_percent: (item as any).tax_percent || '18',
        sub_unit_price: (item as any).sub_unit_price || '',
        is_active: item.is_active,
      }));
      setPriceListItems(items);
    } else {
      setPriceListItems([]);
    }

    if (selectedPriceList) {
      if (selectedPriceList.is_default === 'Y') setAssignmentType('default');
      else if (selectedPriceList.customer_id) setAssignmentType('customer');
      else if (selectedPriceList.route_id) setAssignmentType('route');
      else if (selectedPriceList.depot_id) setAssignmentType('depot');
      else if (selectedPriceList.customer_category_id)
        setAssignmentType('category');
      else setAssignmentType('default');
    } else {
      setAssignmentType('default');
    }
  }, [selectedPriceList]);

  const formik = useFormik({
    initialValues: {
      name: selectedPriceList?.name || '',
      description: selectedPriceList?.description || '',
      is_default: selectedPriceList?.is_default || 'N',
      customer_id: selectedPriceList?.customer_id || '',
      route_id: selectedPriceList?.route_id || '',
      depot_id: selectedPriceList?.depot_id || '',
      customer_category_id: selectedPriceList?.customer_category_id || '',
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
          is_default: assignmentType === 'default' ? 'Y' : 'N',
          customer_id:
            assignmentType === 'customer' ? Number(values.customer_id) : null,
          route_id: assignmentType === 'route' ? Number(values.route_id) : null,
          depot_id: assignmentType === 'depot' ? Number(values.depot_id) : null,
          customer_category_id:
            assignmentType === 'category'
              ? Number(values.customer_category_id)
              : null,
          valid_from: values.valid_from,
          valid_to: values.valid_to,
          description: values.description,
          pricelist_item: priceListItems
            .filter(item => item.product_id !== '')
            .map(item => ({
              product_id: Number(item.product_id),
              unit_price: item.unit_price,
              uom: item.uom,
              discount_percent: item.discount_percent,
              tax_percent: item.tax_percent,
              sub_unit_price: item.sub_unit_price,
              effective_from: values.valid_from,
              effective_to: values.valid_to,
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

  const addPriceListItem = () => {
    const newItem: PriceListItemForm = {
      product_id: '',
      unit_price: '',
      uom: '',
      discount_percent: '',
      tax_percent: '18',
      sub_unit_price: '',
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

    if (field === 'unit_price' && value) {
      const price = parseFloat(value as string);
      if (!isNaN(price)) {
        updatedItems[index].sub_unit_price = (price / 24).toFixed(2);
      }
    }

    setPriceListItems(updatedItems);
  };

  const priceListItemsWithIndex = priceListItems.map((item, index) => ({
    ...item,
    _index: index,
  }));

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
            updatePriceListItem(
              row._index,
              'product_id',
              product ? product.id : ''
            )
          }
          size="small"
          className="!min-w-64"
        />
      ),
    },
    {
      id: 'unit_price',
      label: 'Base Price',
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
      id: 'discount_percent',
      label: 'Disc %',
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
      id: 'tax_percent',
      label: 'Tax %',
      render: (_value, row) => (
        <Input
          value={row.tax_percent}
          onChange={e =>
            updatePriceListItem(row._index, 'tax_percent', e.target.value)
          }
          placeholder="18"
          type="number"
          size="small"
          className="!min-w-20"
        />
      ),
    },
    {
      id: 'sub_unit_price',
      label: 'Unit Price',
      render: (_value, row) => (
        <Input
          value={row.sub_unit_price}
          onChange={e =>
            updatePriceListItem(row._index, 'sub_unit_price', e.target.value)
          }
          placeholder="0.00"
          type="number"
          size="small"
          className="!min-w-24"
        />
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

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Price List' : 'Create Price List'}
      size="extra-large"
    >
      <div className="p-4">
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                name="name"
                label="Price List Name"
                placeholder="Enter price list name"
                formik={formik}
                required
              />
            </div>

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
            <ActiveInactiveField
              name="is_active"
              formik={formik}
              className="grid col-span-2"
            />
            <div className="md:col-span-2">
              <Input
                name="description"
                label="Description"
                placeholder="Enter description"
                formik={formik}
                multiline
                rows={3}
              />
            </div>

            <div className="md:col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="text-sm font-semibold mb-2 flex items-center gap-2 text-blue-800">
                <Info className="w-4 h-4" /> Configuration & Assignments
              </p>
               <div className="flex flex-col gap-4">
                <FormControl component="fieldset" fullWidth>
                  <FormLabel
                    component="legend"
                    className="!text-[10px] !pl-1 !mb-1 !font-bold !uppercase !tracking-wider !text-gray-500"
                  >
                    Assign To
                  </FormLabel>
                  <RadioGroup
                    row
                    value={assignmentType}
                    onChange={e => setAssignmentType(e.target.value)}
                  >
                    <FormControlLabel
                      value="default"
                      control={<Radio size="small" />}
                      className='!ml-px'
                      label={<span className='text-sm'>Default</span>}
                    />
                    <FormControlLabel
                      value="depot"
                      control={<Radio size="small" />}
                      label={<span className='text-sm'>Depot</span>}
                    />
                    <FormControlLabel
                      value="route"
                      control={<Radio size="small" />}
                      label={<span className='text-sm'>Route</span>}
                    />
                    <FormControlLabel
                      value="customer"
                      control={<Radio size="small" />}
                      label={<span className='text-sm'>Customer</span>}
                    />
                    <FormControlLabel
                      value="category"
                      control={<Radio size="small" />}
                      label={<span className='text-sm'>Category</span>}
                    />
                  </RadioGroup>

                  <div className="mt-2 flex items-center gap-2">
                    {assignmentType === 'depot' && (
                      <Select
                        name="depot_id"
                        label="Select Depot"
                        formik={formik}
                        size="small"
                        className="!min-w-72"
                        required
                      >
                        {depots.map(d => (
                          <MenuItem key={d.id} value={d.id}>
                            {d.name}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                    {assignmentType === 'route' && (
                      <Select
                        name="route_id"
                        label="Select Route"
                        formik={formik}
                        size="small"
                        className="!min-w-72"
                        required
                      >
                        {routes.map(r => (
                          <MenuItem key={r.id} value={r.id}>
                            {r.name}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                    {assignmentType === 'customer' && (
                      <Select
                        name="customer_id"
                        label="Select Customer"
                        formik={formik}
                        size="small"
                        className="!min-w-72"
                        required
                      >
                        {customers.map(c => (
                          <MenuItem key={c.id} value={c.id}>
                            {c.name}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                    {assignmentType === 'category' && (
                      <Select
                        name="customer_category_id"
                        label="Select Category"
                        formik={formik}
                        size="small"
                        className="!min-w-72"
                        required
                      >
                        {categories.map(c => (
                          <MenuItem key={c.id} value={c.id}>
                            {c.category_name}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                    {assignmentType === 'default' && (
                      <div className="bg-white border border-blue-100 rounded p-2 flex items-center gap-2 text-xs text-blue-700">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>
                          This will be set as the{' '}
                          <strong>Default Price List</strong> (available
                          globally when no other specific assignments match).
                        </span>
                      </div>
                    )}
                  </div>
                </FormControl>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <h6 className="text-base font-semibold text-gray-900">
                Price List Items
              </h6>
              <Button
                type="button"
                variant="outlined"
                startIcon={<Add />}
                onClick={addPriceListItem}
                size="small"
              >
                Add Item
              </Button>
            </div>

            {priceListItems.length > 0 ? (
              <Table
                compact
                data={priceListItemsWithIndex}
                columns={priceListItemsColumns}
                getRowId={row => row._index.toString()}
                pagination={false}
                sortable={false}
                emptyMessage="No price list items added yet."
              />
            ) : (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-100 rounded-lg bg-gray-50/50">
                <p className="text-sm">
                  No price list items added yet. Click "Add Item" to get
                  started.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-6 border-t border-gray-100">
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
          </div>
        </form>
      </div>
    </CustomDrawer>
  );
};

export default ManagePriceList;
