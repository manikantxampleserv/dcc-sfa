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
import { Close } from '@mui/icons-material';
import { useFormik } from 'formik';
import { useCustomers, type Customer } from 'hooks/useCustomers';
import { useDepots, type Depot } from 'hooks/useDepots';
import {
  useCreateOutletGroup,
  useUpdateOutletGroup,
  type OutletGroup,
} from 'hooks/useOutletGroups';
import { useRoutes, type Route } from 'hooks/useRoutes';
import { useCustomerTypes, type CustomerType } from 'hooks/useCustomerType';
import { useZones, type Zone } from 'hooks/useZones';
import React, { useEffect, useMemo, useState } from 'react';
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

  const { data: customerTypesResponse } = useCustomerTypes(
    { page: 1, limit: 1000, is_active: 'Y' } as any,
    { enabled: drawerOpen }
  );
  const customerCategories = (customerTypesResponse?.data ||
    []) as CustomerType[];

  // Fetch all customers for selection
  const { data: customersResponse, isLoading: customersLoading } = useCustomers(
    {
      page: 1,
      limit: 1000, // Get all customers
      isActive: 'Y',
    }
  );

  const customers = customersResponse?.data || [];

  const routeDepotIdByRouteId = useMemo(() => {
    const map = new Map<number, number>();
    routes.forEach(r => {
      if (typeof r.id === 'number' && typeof (r as any).depot_id === 'number') {
        map.set(r.id, (r as any).depot_id);
      }
    });
    return map;
  }, [routes]);

  const filteredOutlets = useMemo(() => {
    // If no filters are selected, show all customers
    const hasAnyFilters =
      selectedZoneIds.length > 0 ||
      selectedRouteIds.length > 0 ||
      selectedDepotIds.length > 0 ||
      selectedCategoryIds.length > 0;

    if (!hasAnyFilters) {
      return customers;
    }

    return customers.filter(customer => {
      if (selectedZoneIds.length > 0) {
        if (
          !customer.zones_id ||
          !selectedZoneIds.includes(customer.zones_id)
        ) {
          return false;
        }
      }

      if (selectedRouteIds.length > 0) {
        if (
          !customer.route_id ||
          !selectedRouteIds.includes(customer.route_id)
        ) {
          return false;
        }
      }

      if (selectedDepotIds.length > 0) {
        const routeId = customer.route_id || 0;
        const depotId = routeDepotIdByRouteId.get(routeId);
        if (!depotId || !selectedDepotIds.includes(depotId)) {
          return false;
        }
      }

      if (selectedCategoryIds.length > 0) {
        if (
          !customer.customer_type_id ||
          !selectedCategoryIds.includes(customer.customer_type_id)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    customers,
    routeDepotIdByRouteId,
    selectedCategoryIds,
    selectedDepotIds,
    selectedRouteIds,
    selectedZoneIds,
  ]);

  // Get selected customer IDs from the group members
  const getSelectedCustomers = () => {
    if (!selectedOutletGroup?.members) return [];
    return customers.filter(customer =>
      selectedOutletGroup.members?.some(
        member => member.customer_id === customer.id
      )
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
      routes: selectedOutletGroup?.routes || [],
      depots: selectedOutletGroup?.depots || [],
      zones: selectedOutletGroup?.zones || [],
      customer_categories: selectedOutletGroup?.customer_categories || [],
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

  // Update customerGroups when selectedCustomers changes
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

  const outletOptions = useMemo(() => {
    const map = new Map<number, Customer>();
    filteredOutlets.forEach(c => map.set(c.id, c));
    (formik.values.selectedCustomers || []).forEach((c: Customer) =>
      map.set(c.id, c)
    );
    return Array.from(map.values());
  }, [filteredOutlets, formik.values.selectedCustomers]);

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
                    filterOptions={(options, params) => {
                      const searchLower = params.inputValue.toLowerCase();
                      return options.filter(option => {
                        if (!searchLower) return true;
                        return (
                          option.name?.toLowerCase().includes(searchLower) ||
                          option.code?.toLowerCase().includes(searchLower)
                        );
                      });
                    }}
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
                    filterOptions={(options, params) => {
                      const searchLower = params.inputValue.toLowerCase();
                      return options.filter(option => {
                        if (!searchLower) return true;
                        return option.name?.toLowerCase().includes(searchLower);
                      });
                    }}
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
                    filterOptions={(options, params) => {
                      const searchLower = params.inputValue.toLowerCase();
                      return options.filter(option => {
                        if (!searchLower) return true;
                        return (
                          option.name?.toLowerCase().includes(searchLower) ||
                          option.code?.toLowerCase().includes(searchLower)
                        );
                      });
                    }}
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
                      `${option.type_name || ''} ${option.type_code ? `(${option.type_code})` : ''}`
                    }
                    value={customerCategories.filter(ct =>
                      selectedCategoryIds.includes(ct.id)
                    )}
                    onChange={(_event, newValue) => {
                      setSelectedCategoryIds(newValue.map(ct => ct.id));
                    }}
                    size="small"
                    fullWidth
                    filterOptions={(options, params) => {
                      const searchLower = params.inputValue.toLowerCase();
                      return options.filter(option => {
                        if (!searchLower) return true;
                        return (
                          option.type_name
                            ?.toLowerCase()
                            .includes(searchLower) ||
                          option.type_code?.toLowerCase().includes(searchLower)
                        );
                      });
                    }}
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
                    options={outletOptions}
                    value={formik.values.selectedCustomers}
                    onChange={(_event, newValue) => {
                      formik.setFieldValue('selectedCustomers', newValue);
                    }}
                    getOptionLabel={option => `${option.name}`}
                    loading={customersLoading}
                    filterOptions={(options, params) => {
                      const searchLower = params.inputValue.toLowerCase();
                      return options.filter(option => {
                        if (!searchLower) return true;
                        return (
                          option.name?.toLowerCase().includes(searchLower) ||
                          option.code?.toLowerCase().includes(searchLower)
                        );
                      });
                    }}
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
                      selectedDepotIds.map(depotId => {
                        const depot = depots.find(d => d.id === depotId);
                        if (!depot) return null;
                        return (
                          <Box
                            key={depotId}
                            className="!flex !items-center !border-b !border-gray-200 !justify-between !py-1 !px-2 !bg-gray-50 !rounded !hover:bg-gray-100"
                          >
                            <Typography variant="body2">
                              {depot.name}
                              {depot.code ? ` (${depot.code})` : ''}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedDepotIds(
                                  selectedDepotIds.filter(id => id !== depotId)
                                );
                              }}
                            >
                              <Close fontSize="small" />
                            </IconButton>
                          </Box>
                        );
                      })}

                    {outletTab === 1 &&
                      selectedZoneIds.map(zoneId => {
                        const zone = zones.find(z => z.id === zoneId);
                        if (!zone) return null;
                        return (
                          <Box
                            key={zoneId}
                            className="!flex !items-center !border-b !border-gray-200 !justify-between !py-1 !px-2 !bg-gray-50 !rounded !hover:bg-gray-100"
                          >
                            <Typography variant="body2">{zone.name}</Typography>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedZoneIds(
                                  selectedZoneIds.filter(id => id !== zoneId)
                                );
                              }}
                            >
                              <Close fontSize="small" />
                            </IconButton>
                          </Box>
                        );
                      })}

                    {outletTab === 2 &&
                      selectedRouteIds.map(routeId => {
                        const route = routes.find(r => r.id === routeId);
                        if (!route) return null;
                        return (
                          <Box
                            key={routeId}
                            className="!flex !items-center !border-b !border-gray-200 !justify-between !py-1 !px-2 !bg-gray-50 !rounded !hover:bg-gray-100"
                          >
                            <Typography variant="body2">
                              {route.name || route.code || `Route ${route.id}`}{' '}
                              {route.code ? `(${route.code})` : ''}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedRouteIds(
                                  selectedRouteIds.filter(id => id !== routeId)
                                );
                              }}
                            >
                              <Close fontSize="small" />
                            </IconButton>
                          </Box>
                        );
                      })}

                    {outletTab === 3 &&
                      selectedCategoryIds.map(categoryId => {
                        const category = customerCategories.find(
                          c => c.id === categoryId
                        );
                        if (!category) return null;
                        return (
                          <Box
                            key={categoryId}
                            className="!flex !items-center !border-b !border-gray-200 !justify-between !py-1 !px-2 !bg-gray-50 !rounded !hover:bg-gray-100"
                          >
                            <Typography variant="body2">
                              {category.type_name}
                              {category.type_code
                                ? ` (${category.type_code})`
                                : ''}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedCategoryIds(
                                  selectedCategoryIds.filter(
                                    id => id !== categoryId
                                  )
                                );
                              }}
                            >
                              <Close fontSize="small" />
                            </IconButton>
                          </Box>
                        );
                      })}

                    {outletTab === 4 &&
                      (formik.values.selectedCustomers || []).map(
                        (customer: Customer) => (
                          <Box
                            key={customer.id}
                            className="!flex !items-center !border-b !border-gray-200 !justify-between !py-1 !px-2 !bg-gray-50 !rounded !hover:bg-gray-100"
                          >
                            <Typography variant="body2">
                              {customer.name}
                              {customer.code ? ` (${customer.code})` : ''}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => {
                                formik.setFieldValue(
                                  'selectedCustomers',
                                  formik.values.selectedCustomers.filter(
                                    (c: Customer) => c.id !== customer.id
                                  )
                                );
                              }}
                            >
                              <Close fontSize="small" />
                            </IconButton>
                          </Box>
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
