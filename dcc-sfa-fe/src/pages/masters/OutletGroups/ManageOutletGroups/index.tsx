import { Close } from '@mui/icons-material';
import {
  Autocomplete,
  Avatar,
  Box,
  IconButton,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import { useCustomers, type Customer } from 'hooks/useCustomers';
import {
  useCustomerCategories,
  type CustomerCategory,
} from 'hooks/useCustomerCategory';
import { useDepots, type Depot } from 'hooks/useDepots';
import {
  useCreateOutletGroup,
  useUpdateOutletGroup,
  type OutletGroup,
} from 'hooks/useOutletGroups';
import { useRoutes, type Route } from 'hooks/useRoutes';
import { useZones, type Zone } from 'hooks/useZones';
import React, { useEffect, useState } from 'react';
import { outletGroupValidationSchema } from 'schemas/outletGroup.schema';
import ActiveInactiveField from 'shared/ActiveInactiveField';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';

interface ManageOutletGroupProps {
  selectedOutletGroup?: OutletGroup | null;
  setSelectedOutletGroup: (outletGroup: OutletGroup | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageOutletGroup: React.FC<ManageOutletGroupProps> = ({
  selectedOutletGroup,
  setSelectedOutletGroup,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedOutletGroup;
  const [outletTab, setOutletTab] = useState(0);
  const [selectedDepotIds, setSelectedDepotIds] = useState<number[]>([]);
  const [selectedZoneIds, setSelectedZoneIds] = useState<number[]>([]);
  const [selectedRouteIds, setSelectedRouteIds] = useState<number[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);

  const handleCancel = () => {
    setSelectedOutletGroup(null);
    setDrawerOpen(false);
    formik.resetForm();
    setOutletTab(0);
    setSelectedDepotIds([]);
    setSelectedZoneIds([]);
    setSelectedRouteIds([]);
    setSelectedCategoryIds([]);
  };

  const createOutletGroupMutation = useCreateOutletGroup();
  const updateOutletGroupMutation = useUpdateOutletGroup();

  const { data: depotsResponse } = useDepots(
    { page: 1, limit: 1000, isActive: 'Y' },
    { enabled: drawerOpen }
  );
  const depots = (depotsResponse?.data || []) as Depot[];

  const { data: zonesResponse } = useZones(
    { page: 1, limit: 1000, isActive: 'Y' },
    { enabled: drawerOpen }
  );
  const zones = (zonesResponse?.data || []) as Zone[];

  const { data: routesResponse } = useRoutes(
    { page: 1, limit: 1000, status: 'active' },
    { enabled: drawerOpen }
  );
  const routes = (routesResponse?.data || []) as Route[];

  const { data: customerCategoriesResponse } = useCustomerCategories(
    { page: 1, limit: 1000, is_active: 'Y' } as any,
    { enabled: drawerOpen }
  );
  const customerCategories = (customerCategoriesResponse?.data ||
    []) as CustomerCategory[];

  const { data: customersResponse } = useCustomers({
    page: 1,
    limit: 1000,
    isActive: 'Y',
  });

  const customers = customersResponse?.data || [];

  const createFilterOptions =
    (searchFields: string[]) => (options: any[], params: any) => {
      const searchLower = params.inputValue.toLowerCase();
      if (!searchLower) return options;
      return options.filter(option =>
        searchFields.some(field =>
          option[field]?.toLowerCase().includes(searchLower)
        )
      );
    };

  const renderSelectedItems = (
    items: number[],
    data: any[],
    getId: (item: any) => number,
    getLabel: (item: any) => string,
    onRemove: (id: number) => void
  ) =>
    items.map(id => {
      const item = data.find(d => getId(d) === id);
      if (!item) return null;
      return (
        <Box
          key={id}
          className="!flex !items-center !border-b !border-gray-200 !justify-between !py-1 !px-2 !bg-gray-50 !rounded !hover:bg-gray-100"
        >
          <Typography variant="body2">{getLabel(item)}</Typography>
          <IconButton size="small" onClick={() => onRemove(id)}>
            <Close fontSize="small" />
          </IconButton>
        </Box>
      );
    });

  const getSelectedCustomers = () => {
    if (!selectedOutletGroup?.members) return [];
    return customers.filter(customer =>
      selectedOutletGroup.members?.some(
        member => member.customer_id === customer.id
      )
    );
  };

  const getSelectedRouteIds = () => {
    if (!selectedOutletGroup?.routes) return [];
    return selectedOutletGroup.routes.map((route: any) => route.id);
  };

  const getSelectedDepotIds = () => {
    if (!selectedOutletGroup?.depots) return [];
    return selectedOutletGroup.depots.map((depot: any) => depot.id);
  };

  const getSelectedZoneIds = () => {
    if (!selectedOutletGroup?.zones) return [];
    return selectedOutletGroup.zones.map((zone: any) => zone.id);
  };

  const getSelectedCategoryIds = () => {
    if (!selectedOutletGroup?.customer_categories) return [];
    return selectedOutletGroup.customer_categories.map(
      (category: any) => category.id
    );
  };

  const formik = useFormik({
    initialValues: {
      name: selectedOutletGroup?.name || '',
      description: selectedOutletGroup?.description || '',
      discount_percentage: selectedOutletGroup?.discount_percentage || '',
      credit_terms: selectedOutletGroup?.credit_terms || '',
      payment_terms: selectedOutletGroup?.payment_terms || '',
      price_group: selectedOutletGroup?.price_group || '',
      is_active: selectedOutletGroup?.is_active || 'Y',
      selectedCustomers: getSelectedCustomers(),
      routes: getSelectedRouteIds(),
      depots: getSelectedDepotIds(),
      zones: getSelectedZoneIds(),
      customer_categories: getSelectedCategoryIds(),
      customerGroups:
        selectedOutletGroup?.members?.map(member => ({
          customer_id: member.customer_id,
          is_active: 'Y',
        })) || [],
    },
    validationSchema: outletGroupValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const outletGroupData = {
          name: values.name,
          description: values.description,
          discount_percentage: values.discount_percentage
            ? Number(values.discount_percentage)
            : undefined,
          credit_terms: values.credit_terms
            ? Number(values.credit_terms)
            : undefined,
          payment_terms: values.payment_terms,
          price_group: values.price_group,
          is_active: values.is_active,
          customerGroups: values.customerGroups,
          routes: values.routes,
          depots: values.depots,
          zones: values.zones,
          customer_categories: values.customer_categories,
        };

        if (isEdit && selectedOutletGroup) {
          await updateOutletGroupMutation.mutateAsync({
            id: selectedOutletGroup.id,
            ...outletGroupData,
          });
        } else {
          await createOutletGroupMutation.mutateAsync(outletGroupData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving outlet group:', error);
      }
    },
  });

  useEffect(() => {
    if (formik.values.selectedCustomers) {
      formik.setFieldValue(
        'customerGroups',
        formik.values.selectedCustomers.map((customer: Customer) => ({
          customer_id: customer.id,
          is_active: 'Y',
        }))
      );
    }
  }, [formik.values.selectedCustomers]);

  useEffect(() => {
    formik.setFieldValue('routes', selectedRouteIds);
  }, [selectedRouteIds]);

  useEffect(() => {
    formik.setFieldValue('depots', selectedDepotIds);
  }, [selectedDepotIds]);

  useEffect(() => {
    formik.setFieldValue('zones', selectedZoneIds);
  }, [selectedZoneIds]);

  useEffect(() => {
    formik.setFieldValue('customer_categories', selectedCategoryIds);
  }, [selectedCategoryIds]);

  useEffect(() => {
    if (selectedOutletGroup) {
      setSelectedRouteIds(getSelectedRouteIds());
      setSelectedDepotIds(getSelectedDepotIds());
      setSelectedZoneIds(getSelectedZoneIds());
      setSelectedCategoryIds(getSelectedCategoryIds());
    }
  }, [selectedOutletGroup]);

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Outlet Group' : 'Create Outlet Group'}
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Input
              name="name"
              label="Group Name"
              placeholder="Enter outlet group name"
              formik={formik}
              required
            />

            <Input
              name="discount_percentage"
              label="Discount Percentage (%)"
              type="number"
              placeholder="Enter discount percentage"
              formik={formik}
            />

            <Input
              name="credit_terms"
              label="Credit Terms (Days)"
              type="number"
              placeholder="Enter credit terms in days"
              formik={formik}
            />

            <Input
              name="payment_terms"
              label="Payment Terms"
              placeholder="Enter payment terms"
              formik={formik}
            />

            <Input
              name="price_group"
              label="Price Group"
              placeholder="Enter price group"
              formik={formik}
            />

            <Box className="md:!col-span-2">
              <ActiveInactiveField name="is_active" formik={formik} required />
            </Box>

            <Box className="md:!col-span-2">
              <Input
                name="description"
                label="Description"
                placeholder="Enter group description"
                formik={formik}
                multiline
                rows={3}
              />
            </Box>

            <Box className="md:!col-span-2">
              <Typography
                variant="body2"
                className="!mb-2 !font-medium !text-gray-700"
              >
                Outlets <span>*</span>
              </Typography>
              <Box className="!mb-3 !border !border-gray-400/50 !rounded">
                <Tabs
                  value={outletTab}
                  onChange={(_event, newValue) => setOutletTab(newValue)}
                  variant="scrollable"
                  scrollButtons="auto"
                  className="!min-h-9.5"
                >
                  <Tab
                    label={`Depots${selectedDepotIds.length ? ` (${selectedDepotIds.length})` : ''}`}
                    className="!min-h-9.5"
                  />
                  <Tab
                    label={`Zones${selectedZoneIds.length ? ` (${selectedZoneIds.length})` : ''}`}
                    className="!min-h-9.5"
                  />
                  <Tab
                    label={`Routes${selectedRouteIds.length ? ` (${selectedRouteIds.length})` : ''}`}
                    className="!min-h-9.5"
                  />
                  <Tab
                    label={`Category${selectedCategoryIds.length ? ` (${selectedCategoryIds.length})` : ''}`}
                    className="!min-h-9.5"
                  />
                  <Tab
                    label={`Outlets${formik.values.selectedCustomers?.length ? ` (${formik.values.selectedCustomers.length})` : ''}`}
                    className="!min-h-9.5"
                  />
                </Tabs>
              </Box>

              <Box className="!mb-3">
                {outletTab === 0 && (
                  <Autocomplete
                    multiple
                    options={depots}
                    getOptionLabel={option =>
                      `${option.name} ${option.code ? `(${option.code})` : ''}`
                    }
                    value={depots.filter(d => selectedDepotIds.includes(d.id))}
                    onChange={(_event, newValue) => {
                      setSelectedDepotIds(newValue.map(d => d.id));
                    }}
                    size="small"
                    fullWidth
                    filterOptions={createFilterOptions(['name', 'code'])}
                    renderInput={params => (
                      <TextField
                        {...params}
                        placeholder="Search and select Depots..."
                        size="small"
                      />
                    )}
                    renderTags={() => null}
                  />
                )}

                {outletTab === 1 && (
                  <Autocomplete
                    multiple
                    options={zones}
                    getOptionLabel={option => option.name || ''}
                    value={zones.filter(z => selectedZoneIds.includes(z.id))}
                    onChange={(_event, newValue) => {
                      setSelectedZoneIds(newValue.map(z => z.id));
                    }}
                    size="small"
                    fullWidth
                    filterOptions={createFilterOptions(['name'])}
                    renderInput={params => (
                      <TextField
                        {...params}
                        placeholder="Search and select Zones..."
                        size="small"
                      />
                    )}
                    renderTags={() => null}
                  />
                )}

                {outletTab === 2 && (
                  <Autocomplete
                    multiple
                    options={routes}
                    getOptionLabel={option =>
                      `${option.name || option.code || `Route ${option.id}`} ${option.code ? `(${option.code})` : ''}`
                    }
                    value={routes.filter(r => selectedRouteIds.includes(r.id))}
                    onChange={(_event, newValue) => {
                      setSelectedRouteIds(newValue.map(r => r.id));
                    }}
                    size="small"
                    fullWidth
                    filterOptions={createFilterOptions(['name', 'code'])}
                    renderInput={params => (
                      <TextField
                        {...params}
                        placeholder="Search and select Routes..."
                        size="small"
                      />
                    )}
                    renderTags={() => null}
                  />
                )}

                {outletTab === 3 && (
                  <Autocomplete
                    multiple
                    options={customerCategories}
                    getOptionLabel={option =>
                      `${option.category_name || ''} ${option.category_code ? `(${option.category_code})` : ''}`
                    }
                    value={customerCategories.filter(ct =>
                      selectedCategoryIds.includes(ct.id)
                    )}
                    onChange={(_event, newValue) => {
                      setSelectedCategoryIds(newValue.map(ct => ct.id));
                    }}
                    size="small"
                    fullWidth
                    filterOptions={createFilterOptions([
                      'category_name',
                      'category_code',
                    ])}
                    renderInput={params => (
                      <TextField
                        {...params}
                        placeholder="Search and select Category..."
                        size="small"
                      />
                    )}
                    renderTags={() => null}
                  />
                )}

                {outletTab === 4 && (
                  <Autocomplete
                    multiple
                    size="small"
                    id="customers-autocomplete"
                    options={customers}
                    value={formik.values.selectedCustomers}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('selectedCustomers', newValue);
                    }}
                    getOptionLabel={option => `${option.name} (${option.code})`}
                    filterOptions={createFilterOptions(['name', 'code'])}
                    renderInput={params => (
                      <TextField
                        {...params}
                        placeholder="Search and select Outlets..."
                        size="small"
                        error={
                          formik.touched.customerGroups &&
                          Boolean(formik.errors.customerGroups)
                        }
                        helperText={
                          formik.touched.customerGroups &&
                          typeof formik.errors.customerGroups === 'string'
                            ? formik.errors.customerGroups
                            : ''
                        }
                      />
                    )}
                    renderTags={() => null}
                    renderOption={(props, option) => (
                      <Box component="li" {...props}>
                        <Avatar
                          src={'MKX'}
                          alt={option.name}
                          className="!mr-2 !rounded !bg-primary-200 !text-primary-600"
                        >
                          {option.name.slice(0, 2).toUpperCase()}
                        </Avatar>
                        <Box className="!flex !flex-col">
                          <Typography variant="body2" className="!font-medium">
                            {option.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            className="!text-gray-500"
                          >
                            {option.code}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                  />
                )}
              </Box>

              {(outletTab === 0 && selectedDepotIds.length > 0) ||
              (outletTab === 1 && selectedZoneIds.length > 0) ||
              (outletTab === 2 && selectedRouteIds.length > 0) ||
              (outletTab === 3 && selectedCategoryIds.length > 0) ||
              (outletTab === 4 &&
                (formik.values.selectedCustomers?.length || 0) > 0) ? (
                <Box className="!mt-3 !border !border-gray-200 !rounded">
                  <Box className="!max-h-52 !overflow-y-auto">
                    {outletTab === 0 &&
                      renderSelectedItems(
                        selectedDepotIds,
                        depots,
                        d => d.id,
                        d => `${d.name}${d.code ? ` (${d.code})` : ''}`,
                        id =>
                          setSelectedDepotIds(
                            selectedDepotIds.filter(dId => dId !== id)
                          )
                      )}

                    {outletTab === 1 &&
                      renderSelectedItems(
                        selectedZoneIds,
                        zones,
                        z => z.id,
                        z => z.name,
                        id =>
                          setSelectedZoneIds(
                            selectedZoneIds.filter(zId => zId !== id)
                          )
                      )}

                    {outletTab === 2 &&
                      renderSelectedItems(
                        selectedRouteIds,
                        routes,
                        r => r.id,
                        r =>
                          `${r.name || r.code || `Route ${r.id}`}${r.code ? ` (${r.code})` : ''}`,
                        id =>
                          setSelectedRouteIds(
                            selectedRouteIds.filter(rId => rId !== id)
                          )
                      )}

                    {outletTab === 3 &&
                      renderSelectedItems(
                        selectedCategoryIds,
                        customerCategories,
                        c => c.id,
                        c =>
                          `${c.category_name}${c.category_code ? ` (${c.category_code})` : ''}`,
                        id =>
                          setSelectedCategoryIds(
                            selectedCategoryIds.filter(cId => cId !== id)
                          )
                      )}

                    {outletTab === 4 &&
                      renderSelectedItems(
                        (formik.values.selectedCustomers || []).map(
                          (c: Customer) => c.id
                        ),
                        formik.values.selectedCustomers || [],
                        c => c.id,
                        c => `${c.name}${c.code ? ` (${c.code})` : ''}`,
                        id =>
                          formik.setFieldValue(
                            'selectedCustomers',
                            formik.values.selectedCustomers.filter(
                              (c: Customer) => c.id !== id
                            )
                          )
                      )}
                  </Box>
                </Box>
              ) : null}
            </Box>
          </Box>

          <Box className="!flex !justify-end !gap-3 !items-center">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              disabled={
                createOutletGroupMutation.isPending ||
                updateOutletGroupMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              loading={
                createOutletGroupMutation.isPending ||
                updateOutletGroupMutation.isPending
              }
            >
              {createOutletGroupMutation.isPending
                ? 'Creating...'
                : updateOutletGroupMutation.isPending
                  ? 'Updating...'
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

export default ManageOutletGroup;
