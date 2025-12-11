import {
  Alert,
  Box,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import { useCustomers } from 'hooks/useCustomers';
import { useDepots } from 'hooks/useDepots';
import { useProductCategories } from 'hooks/useProductCategories';
import { useProducts } from 'hooks/useProducts';
import { useRolesDropdown } from 'hooks/useRoles';
import { useUnitOfMeasurement } from 'hooks/useUnitOfMeasurement';
import {
  useCreateUpdatedPromotion,
  useUpdateUpdatedPromotion,
  useUpdatedPromotion,
  type UpdatedPromotion,
} from 'hooks/useUpdatedPromotions';
import { useZones } from 'hooks/useZones';
import React, { useEffect, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import ProductCategorySelect from 'shared/ProductCategorySelect';
import ProductSelect from 'shared/ProductSelect';
import Select from 'shared/Select';
import Table from 'shared/Table';
import * as Yup from 'yup';

interface ManageUpdatedPromotionProps {
  selectedPromotion?: UpdatedPromotion | null;
  setSelectedPromotion: (promotion: UpdatedPromotion | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

interface ProductCondition {
  _index: number;
  id?: number;
  product_id?: number;
  product_group?: string;
  min_quantity?: number;
}

interface OutletRow {
  _index: number;
  id?: number;
  outlet_condition: string;
  dist: string;
  outlet_value: string;
  start: string;
  finish: string;
  slip_limit?: string;
  disc_limit?: string;
  area?: string;
  group?: string;
  distributor_id?: string;
  role?: string;
  date_limit?: boolean;
  dc_par?: boolean;
}

interface GiftRow {
  _index: number;
  id?: number;
  level_id?: number;
  type: string;
  application: string;
  gift: string;
  product_id?: number;
  benefit_value?: number;
  gift_limit?: number;
}

interface LocationForm {
  area: string;
  group: string;
  distributor_id: string;
  role: string;
  slip_limit: boolean;
  disc_limit: boolean;
  date_limit: boolean;
  dc_par: boolean;
}

const QUANTITY_TYPES = ['Quantity', 'Price', 'Weight'];
const GIFT_TYPES = ['Free Product', 'Percent', 'Amount'];
const PAY_TYPES = ['Cash', 'Credit', 'Both'];
const SCOPE_TYPES = ['(B) Distributor Channel', '(C) Customer Channel'];
const SLIP_TYPES = ['All', 'Invoice', 'Waybill', 'Order'];
const PROM_CONFLICT_TYPES = ['Normal', 'Exclusive', 'Priority'];
const REG_DISC_CONF_TYPES = ['Normal', 'Override', 'Combine'];

const updatedPromotionValidationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  start_date: Yup.string().required('Start date is required'),
  finish_date: Yup.string()
    .required('Finish date is required')
    .test(
      'is-after-start',
      'Finish date must be after start date',
      function (value) {
        const { start_date } = this.parent;
        if (!value || !start_date) return true;
        return new Date(value) >= new Date(start_date);
      }
    ),
  description: Yup.string(),
  is_active: Yup.string().oneOf(['Y', 'N']).required(),
});

const ManageUpdatedPromotion: React.FC<ManageUpdatedPromotionProps> = ({
  selectedPromotion,
  setSelectedPromotion,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedPromotion;

  const { data: promotionDetailResponse, isLoading: isLoadingPromotion } =
    useUpdatedPromotion(selectedPromotion?.id || null);

  const { data: productsResponse } = useProducts({ limit: 1000 });
  const products = productsResponse?.data || [];

  const { data: depotsResponse } = useDepots({ limit: 1000 });
  const depots = depotsResponse?.data || [];

  const { data: zonesResponse } = useZones({ limit: 1000 });
  const zones = zonesResponse?.data || [];

  const { data: customersResponse } = useCustomers({ limit: 1000 });
  const customers = customersResponse?.data || [];

  const { data: productCategoriesResponse } = useProductCategories({
    limit: 1000,
  });
  const productCategories = productCategoriesResponse?.data || [];

  const { data: rolesResponse } = useRolesDropdown();
  const roles = rolesResponse?.data || [];

  const { data: unitsResponse } = useUnitOfMeasurement({ limit: 1000 });
  const units = unitsResponse?.data || [];

  const createPromotionMutation = useCreateUpdatedPromotion();
  const updatePromotionMutation = useUpdateUpdatedPromotion();

  const [productConditions, setProductConditions] = useState<
    ProductCondition[]
  >([]);
  const [outletRows, setOutletRows] = useState<OutletRow[]>([]);
  const [giftRows, setGiftRows] = useState<GiftRow[]>([]);
  const [locationTab, setLocationTab] = useState(0);
  const [selectedOutletIndex, setSelectedOutletIndex] = useState<number | null>(
    null
  );
  const [locationForm, setLocationForm] = useState<LocationForm>({
    area: '',
    group: '',
    distributor_id: '',
    role: '',
    slip_limit: false,
    disc_limit: false,
    date_limit: false,
    dc_par: false,
  });
  const [selectedProductConditionIndex, setSelectedProductConditionIndex] =
    useState<number | null>(null);
  const [giftProductTab, setGiftProductTab] = useState(0);
  const [giftCode, setGiftCode] = useState('');
  const [giftName, setGiftName] = useState('');
  const [giftProductNotInCondition, setGiftProductNotInCondition] =
    useState(false);
  const [discAmount, setDiscAmount] = useState('');
  const [maximum, setMaximum] = useState('0.00');
  const [selectedGiftType, setSelectedGiftType] = useState<string>('Amount');
  const [productConditionForm, setProductConditionForm] = useState({
    group: '',
    dyn_group: '',
    product: '',
    quant_group: '',
    dyn_prod_groups: '',
    at_least: '',
    unit: 'unit',
  });
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (!promotionDetailResponse?.data || !isEdit) {
      setProductConditions([]);
      setOutletRows([]);
      setGiftRows([]);
    }
  }, [promotionDetailResponse, isEdit]);

  const handleCancel = () => {
    setSelectedPromotion(null);
    setDrawerOpen(false);
    setProductConditions([]);
    setOutletRows([]);
    setGiftRows([]);
    setSelectedOutletIndex(null);
    setSelectedProductConditionIndex(null);
    setLocationForm({
      area: '',
      group: '',
      distributor_id: '',
      role: '',
      slip_limit: false,
      disc_limit: false,
      date_limit: false,
      dc_par: false,
    });
    setProductConditionForm({
      group: '',
      dyn_group: '',
      product: '',
      quant_group: '',
      dyn_prod_groups: '',
      at_least: '',
      unit: 'unit',
    });
  };

  const formik = useFormik({
    initialValues: {
      disabled: false,
      name: selectedPromotion?.name || '',
      short_name: selectedPromotion?.name || '',
      code: selectedPromotion?.code || '',
      pay_type: '',
      scope: '',
      slip_type: 'All',
      mandatory: false,
      prom_conflict: 'Normal',
      degree: '1',
      nr: '1',
      reg_disc_conf: 'Normal',
      conflict_with_constant_disc: false,
      start_date: selectedPromotion?.start_date
        ? new Date(selectedPromotion.start_date).toISOString().split('T')[0]
        : '',
      finish_date: selectedPromotion?.end_date
        ? new Date(selectedPromotion.end_date).toISOString().split('T')[0]
        : '',
      platform: ['Mobile'],
      group: '',
      dist_comp_participation_min: '0',
      dist_comp_participation_max: '100',
      quantity_type: 'Quantity',
      description: selectedPromotion?.description || '',
      is_active: selectedPromotion?.is_active || 'Y',
    },
    validationSchema: updatedPromotionValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const locationAreas = outletRows
          .filter(r => r.distributor_id)
          .map(r => Number(r.distributor_id))
          .filter((id, index, self) => self.indexOf(id) === index);
        const outletGroups = outletRows
          .filter(r => r.group)
          .map(r => Number(r.group))
          .filter((id, index, self) => self.indexOf(id) === index);

        const productConditionsData = productConditions
          .filter(c => c.product_id || c.product_group)
          .map(c => {
            const product = c.product_id
              ? products.find(p => p.id === c.product_id)
              : null;
            const defaultCategoryId =
              productCategories.length > 0 ? productCategories[0].id : 1;
            return {
              product_id: c.product_id || 1,
              category_id: product?.category_id || defaultCategoryId,
              product_group: c.product_group || undefined,
              min_quantity: c.min_quantity || 0,
              min_value: c.min_quantity || 0,
            };
          });

        const giftBenefits = giftRows
          .filter(g => g.product_id)
          .map(g => ({
            benefit_type:
              g.type === 'Free Product' ? 'FREE_PRODUCT' : 'PERCENT',
            product_id: g.product_id,
            benefit_value: g.benefit_value || 0,
            condition_type: g.application || null,
            gift_limit: g.gift_limit || 0,
          }));

        const promotionData = {
          name: values.name,
          description: values.description || undefined,
          start_date: values.start_date,
          end_date: values.finish_date,
          platforms: ['Mobile'],
          quantity_type: values.quantity_type || 'QUANTITY',
          product_conditions:
            productConditionsData.length > 0
              ? productConditionsData
              : undefined,
          location_areas: locationAreas.length > 0 ? locationAreas : undefined,
          outlet1_groups: outletGroups.length > 0 ? outletGroups : undefined,
          levels:
            giftBenefits.length > 0
              ? [
                  {
                    level_number: 1,
                    threshold_value: 0,
                    discount_type: 'PERCENTAGE',
                    discount_value: 0,
                    benefits: giftBenefits,
                  },
                ]
              : undefined,
        };

        if (isEdit && selectedPromotion) {
          const updateLocationAreas = outletRows
            .filter(r => r.distributor_id)
            .map(r => Number(r.distributor_id))
            .filter((id, index, self) => self.indexOf(id) === index);
          const updateOutletGroups = outletRows
            .filter(r => r.group)
            .map(r => Number(r.group))
            .filter((id, index, self) => self.indexOf(id) === index);

          await updatePromotionMutation.mutateAsync({
            id: selectedPromotion.id,
            data: {
              name: values.name,
              start_date: values.start_date,
              end_date: values.finish_date,
              description: values.description || undefined,
              is_active: values.is_active,
              platforms: ['Mobile'],
              location_areas:
                updateLocationAreas.length > 0
                  ? updateLocationAreas
                  : undefined,
              outlet1_groups:
                updateOutletGroups.length > 0 ? updateOutletGroups : undefined,
            },
          });
        } else {
          const fixedPromotionData = {
            ...promotionData,
            levels: promotionData.levels
              ? promotionData.levels.map(level => ({
                  ...level,
                  benefits: level.benefits?.map(benefit => ({
                    ...benefit,
                    condition_type: benefit.condition_type ?? undefined,
                  })),
                }))
              : undefined,
          };
          await createPromotionMutation.mutateAsync(fixedPromotionData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving updated promotion:', error);
      }
    },
  });

  const addProductCondition = () => {
    if (!productConditionForm.group && !productConditionForm.product) {
      setValidationErrors({
        ...validationErrors,
        productCondition_new: 'Product or Group must be selected',
      });
      return;
    }
    if (
      !productConditionForm.at_least ||
      parseFloat(productConditionForm.at_least) <= 0
    ) {
      setValidationErrors({
        ...validationErrors,
        productCondition_quantity_new: 'At least value must be greater than 0',
      });
      return;
    }
    const newCondition: ProductCondition = {
      _index: productConditions.length,
      product_group: productConditionForm.group,
      product_id: productConditionForm.product
        ? parseInt(productConditionForm.product)
        : undefined,
      min_quantity: parseFloat(productConditionForm.at_least) || 0,
    };
    setProductConditions([...productConditions, newCondition]);
    setProductConditionForm({
      group: '',
      dyn_group: '',
      product: '',
      quant_group: '',
      dyn_prod_groups: '',
      at_least: '',
      unit: 'unit',
    });
    setValidationErrors({});
  };

  const removeProductCondition = (index: number) => {
    setProductConditions(productConditions.filter((_, i) => i !== index));
  };

  const updateProductCondition = (
    index: number,
    field: keyof ProductCondition,
    value: any
  ) => {
    const updated = [...productConditions];
    updated[index] = { ...updated[index], [field]: value };
    setProductConditions(updated);
  };

  const addOutletRow = () => {
    const newRow: OutletRow = {
      _index: outletRows.length,
      outlet_condition: 'Distributor',
      dist: locationForm.distributor_id
        ? depots.find(d => d.id.toString() === locationForm.distributor_id)
            ?.code || ''
        : '',
      outlet_value: '',
      start: formik.values.start_date,
      finish: formik.values.finish_date,
      area: locationForm.area,
      group: locationForm.group,
      distributor_id: locationForm.distributor_id,
      role: locationForm.role,
      slip_limit: locationForm.slip_limit ? '1' : '',
      disc_limit: locationForm.disc_limit ? '1' : '',
      date_limit: locationForm.date_limit,
      dc_par: locationForm.dc_par,
    };
    setOutletRows([...outletRows, newRow]);
    setLocationForm({
      area: '',
      group: '',
      distributor_id: '',
      role: '',
      slip_limit: false,
      disc_limit: false,
      date_limit: false,
      dc_par: false,
    });
  };

  const removeOutletRow = (index: number) => {
    setOutletRows(outletRows.filter((_, i) => i !== index));
  };

  const updateOutletRow = (
    index: number,
    field: keyof OutletRow,
    value: string
  ) => {
    const updated = [...outletRows];
    updated[index] = { ...updated[index], [field]: value };
    setOutletRows(updated);
  };

  const removeGiftRow = (index: number) => {
    setGiftRows(giftRows.filter((_, i) => i !== index));
  };

  const updateGiftRow = (
    index: number,
    field: keyof GiftRow,
    value: string | number
  ) => {
    const updated = [...giftRows];
    updated[index] = { ...updated[index], [field]: value };
    setGiftRows(updated);
  };

  if (isLoadingPromotion && isEdit) {
    return (
      <CustomDrawer
        open={drawerOpen}
        setOpen={handleCancel}
        title={isEdit ? 'Edit Updated Promotion' : 'Create Updated Promotion'}
        fullWidth={true}
      >
        <Box className="!p-6">
          <Typography>Loading...</Typography>
        </Box>
      </CustomDrawer>
    );
  }

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Updated Promotion' : 'Create Updated Promotion'}
      fullWidth={true}
    >
      <Box className="!p-4 !overflow-auto !max-h-[calc(100vh-100px)]">
        {Object.keys(validationErrors).length > 0 && (
          <Alert severity="error" className="!mb-4">
            <Typography variant="subtitle2" className="!font-semibold !mb-1">
              Please fix the following errors:
            </Typography>
            <ul className="!list-disc !list-inside !space-y-1">
              {Object.values(validationErrors).map((error, idx) => (
                <li key={idx} className="!text-sm">
                  {error}
                </li>
              ))}
            </ul>
          </Alert>
        )}
        <form
          onSubmit={formik.handleSubmit}
          className="!space-y-3 !grid !grid-cols-2 !gap-3"
        >
          <Paper className="!p-3 !rounded-lg !shadow-sm !border !bg-white !border-gray-200">
            <Typography
              variant="h6"
              className="!font-semibold !text-gray-900 !mb-2 !text-base"
            >
              Header Information
            </Typography>
            <Box className="!space-y-2 !grid !grid-cols-2 !gap-2">
              <Input
                name="name"
                label="Name"
                formik={formik}
                required
                fullWidth
              />
              <Input
                name="short_name"
                label="Short Name"
                formik={formik}
                fullWidth
              />
              <Input
                name="code"
                label="Code"
                formik={formik}
                required
                fullWidth
              />
              <Select
                name="pay_type"
                label="Pay Type"
                formik={formik}
                fullWidth
              >
                {PAY_TYPES.map(type => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
              <Select name="scope" label="Scope" formik={formik} fullWidth>
                {SCOPE_TYPES.map(type => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
              <Select
                name="slip_type"
                label="Slip Type"
                formik={formik}
                fullWidth
              >
                {SLIP_TYPES.map(type => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>

              <Select
                name="prom_conflict"
                label="Prom. Conflict"
                formik={formik}
                fullWidth
              >
                {PROM_CONFLICT_TYPES.map(type => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
              <Input
                name="degree"
                label="Degree"
                type="number"
                formik={formik}
                fullWidth
              />
              <Input
                name="nr"
                label="Nr"
                type="number"
                formik={formik}
                fullWidth
              />
              <Select
                name="reg_disc_conf"
                label="Reg.Disc. Conf."
                formik={formik}
                fullWidth
              >
                {REG_DISC_CONF_TYPES.map(type => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formik.values.conflict_with_constant_disc}
                    onChange={e =>
                      formik.setFieldValue(
                        'conflict_with_constant_disc',
                        e.target.checked
                      )
                    }
                  />
                }
                className="!col-span-2"
                label="Conflict with Constant disc."
              />
              <Input
                name="start_date"
                label="Start"
                type="date"
                formik={formik}
                required
                fullWidth
              />
              <Input
                name="finish_date"
                label="Finish"
                type="date"
                formik={formik}
                required
                fullWidth
              />
              <Input name="group" label="Group" formik={formik} fullWidth />
              <Box className="!flex !gap-2">
                <Input
                  name="dist_comp_participation_min"
                  label="Dist./Comp. Participation"
                  type="number"
                  formik={formik}
                  fullWidth
                />
                <Input
                  name="dist_comp_participation_max"
                  label=""
                  type="number"
                  formik={formik}
                  fullWidth
                />
              </Box>
              <Box className="!col-span-2 !flex !gap-2">
                <Button
                  type="submit"
                  variant="contained"
                  size="small"
                  disabled={
                    createPromotionMutation.isPending ||
                    updatePromotionMutation.isPending
                  }
                >
                  Save
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          </Paper>

          <Paper className="!p-3 !rounded-lg !shadow-sm !border !bg-white !border-gray-200">
            <Typography
              variant="h6"
              className="!font-semibold !text-gray-900 !mb-2 !text-base"
            >
              Suitable Outlets
            </Typography>
            <Box className="!mb-3">
              <Tabs
                value={locationTab}
                onChange={(_, newValue) => setLocationTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="Depots" />
                <Tab label="Zones" />
                <Tab label="Routes" />
                <Tab label="Outlet" />
              </Tabs>
            </Box>
            <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-2 !mb-2">
              <Select
                value={locationForm.area}
                onChange={e =>
                  setLocationForm({ ...locationForm, area: e.target.value })
                }
                label="Area"
                fullWidth
              >
                <MenuItem value="">Select Area</MenuItem>
                {zones.map((zone: any) => (
                  <MenuItem key={zone.id} value={zone.id.toString()}>
                    {zone.name}
                  </MenuItem>
                ))}
              </Select>
              <ProductCategorySelect
                value={locationForm.group}
                onChange={(_event, category) =>
                  setLocationForm({ ...locationForm, group: category ? category.id.toString() : '' })
                }
                label="Group"
                fullWidth
              />
              <Select
                value={locationForm.distributor_id}
                onChange={e =>
                  setLocationForm({
                    ...locationForm,
                    distributor_id: e.target.value,
                  })
                }
                label="Distributor"
                fullWidth
              >
                <MenuItem value="">Select Distributor</MenuItem>
                {depots.map((depot: any) => (
                  <MenuItem key={depot.id} value={depot.id.toString()}>
                    {depot.name} ({depot.code})
                  </MenuItem>
                ))}
              </Select>
              <Select
                value={locationForm.role}
                onChange={e =>
                  setLocationForm({ ...locationForm, role: e.target.value })
                }
                label="Role"
                fullWidth
              >
                <MenuItem value="">Select Role</MenuItem>
                {roles.map((role: any) => (
                  <MenuItem key={role.id} value={role.id.toString()}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </Box>
            <Box className="!flex !gap-2 !mb-2">
              <Button
                type="button"
                variant="outlined"
                size="small"
                onClick={addOutletRow}
              >
                New
              </Button>
              <Button
                type="button"
                variant="outlined"
                size="small"
                onClick={() => {
                  if (selectedOutletIndex !== null) {
                    const updated = [...outletRows];
                    updated[selectedOutletIndex] = {
                      ...updated[selectedOutletIndex],
                      area: locationForm.area,
                      group: locationForm.group,
                      distributor_id: locationForm.distributor_id,
                      role: locationForm.role,
                      dist: locationForm.distributor_id
                        ? depots.find(
                            d => d.id.toString() === locationForm.distributor_id
                          )?.code || ''
                        : '',
                      slip_limit: locationForm.slip_limit ? '1' : '',
                      disc_limit: locationForm.disc_limit ? '1' : '',
                      date_limit: locationForm.date_limit,
                      dc_par: locationForm.dc_par,
                    };
                    setOutletRows(updated);
                    setSelectedOutletIndex(null);
                    setLocationForm({
                      area: '',
                      group: '',
                      distributor_id: '',
                      role: '',
                      slip_limit: false,
                      disc_limit: false,
                      date_limit: false,
                      dc_par: false,
                    });
                  }
                }}
                disabled={selectedOutletIndex === null}
              >
                Update
              </Button>
              <Button
                type="button"
                variant="outlined"
                size="small"
                onClick={() => {
                  if (selectedOutletIndex !== null) {
                    removeOutletRow(selectedOutletIndex);
                    setSelectedOutletIndex(null);
                    setLocationForm({
                      area: '',
                      group: '',
                      distributor_id: '',
                      role: '',
                      slip_limit: false,
                      disc_limit: false,
                      date_limit: false,
                      dc_par: false,
                    });
                  }
                }}
                disabled={selectedOutletIndex === null}
              >
                Del
              </Button>
            </Box>
            <Box className="!flex !gap-2 !mb-2 !flex-wrap">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={locationForm.slip_limit}
                    size="small"
                    onChange={e =>
                      setLocationForm({
                        ...locationForm,
                        slip_limit: e.target.checked,
                      })
                    }
                  />
                }
                label="Slip Lim."
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={locationForm.disc_limit}
                    onChange={e =>
                      setLocationForm({
                        ...locationForm,
                        disc_limit: e.target.checked,
                      })
                    }
                  />
                }
                label="Disc. Lim."
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={locationForm.date_limit}
                    onChange={e =>
                      setLocationForm({
                        ...locationForm,
                        date_limit: e.target.checked,
                      })
                    }
                  />
                }
                label="Date"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={locationForm.dc_par}
                    onChange={e =>
                      setLocationForm({
                        ...locationForm,
                        dc_par: e.target.checked,
                      })
                    }
                  />
                }
                label="D/C Par."
              />
            </Box>
            {outletRows.length > 0 && (
              <Box className="!mt-3">
                <Table
                  data={outletRows.map((row, idx) => ({
                    id: row._index,
                    condition: row.outlet_condition || 'Distributor',
                    dist: row.dist || '-',
                    outlet_value: row.outlet_value || '-',
                    location:
                      row.area &&
                      zones.find((z: any) => z.id.toString() === row.area)
                        ? zones.find((z: any) => z.id.toString() === row.area)
                            ?.name
                        : '-',
                    distributor:
                      row.distributor_id &&
                      depots.find(
                        (d: any) => d.id.toString() === row.distributor_id
                      )
                        ? depots.find(
                            (d: any) => d.id.toString() === row.distributor_id
                          )?.name
                        : '-',
                    seller:
                      row.role &&
                      roles.find((r: any) => r.id.toString() === row.role)
                        ? roles.find((r: any) => r.id.toString() === row.role)
                            ?.name
                        : '-',
                    start: row.start || '-',
                    finish: row.finish || '-',
                    slip_limit: row.slip_limit || '-',
                    disc_limit: row.disc_limit || '-',
                    _index: idx,
                    _row: row,
                  }))}
                  columns={[
                    {
                      id: 'condition',
                      label: 'Outlet Condition',
                      render: (_value, row) => {
                        const outletRow = outletRows[row._index];
                        return (
                          <Select
                            value={outletRow.outlet_condition}
                            onChange={e =>
                              updateOutletRow(
                                row._index,
                                'outlet_condition',
                                e.target.value
                              )
                            }
                            size="small"
                            fullWidth={false}
                          >
                            <MenuItem value="Distributor">
                              ►Distributor
                            </MenuItem>
                            <MenuItem value="Customer Category">
                              Customer Category
                            </MenuItem>
                            <MenuItem value="Customer">Customer</MenuItem>
                          </Select>
                        );
                      },
                    },
                    {
                      id: 'dist',
                      label: 'Dist.',
                      render: (_value, row) => {
                        const outletRow = outletRows[row._index];
                        return (
                          <Input
                            value={outletRow.dist}
                            onChange={e =>
                              updateOutletRow(
                                row._index,
                                'dist',
                                e.target.value
                              )
                            }
                            placeholder="Dist"
                            size="small"
                            className="!w-20"
                            fullWidth={false}
                          />
                        );
                      },
                    },
                    {
                      id: 'outlet_value',
                      label: 'Outlet Value',
                      render: (_value, row) => {
                        const outletRow = outletRows[row._index];
                        return (
                          <Select
                            value={outletRow.outlet_value}
                            onChange={e =>
                              updateOutletRow(
                                row._index,
                                'outlet_value',
                                e.target.value
                              )
                            }
                            size="small"
                            className="!w-40"
                            fullWidth={false}
                          >
                            <MenuItem value="">Select...</MenuItem>
                            {customers.map((customer: any) => (
                              <MenuItem
                                key={customer.id}
                                value={customer.id.toString()}
                              >
                                {customer.name} ({customer.code})
                              </MenuItem>
                            ))}
                          </Select>
                        );
                      },
                    },
                    {
                      id: 'location',
                      label: 'Location',
                    },
                    {
                      id: 'distributor',
                      label: 'Distributor',
                    },
                    {
                      id: 'seller',
                      label: 'Seller',
                    },
                    {
                      id: 'start',
                      label: 'Start',
                      render: (_value, row) => {
                        const outletRow = outletRows[row._index];
                        return (
                          <Input
                            type="date"
                            value={outletRow.start}
                            className="!w-40"
                            onChange={e =>
                              updateOutletRow(
                                row._index,
                                'start',
                                e.target.value
                              )
                            }
                            size="small"
                            fullWidth={false}
                          />
                        );
                      },
                    },
                    {
                      id: 'finish',
                      label: 'Finish',
                      render: (_value, row) => {
                        const outletRow = outletRows[row._index];
                        return (
                          <Input
                            type="date"
                            value={outletRow.finish}
                            className="!w-40"
                            onChange={e =>
                              updateOutletRow(
                                row._index,
                                'finish',
                                e.target.value
                              )
                            }
                            size="small"
                            fullWidth={false}
                          />
                        );
                      },
                    },
                    {
                      id: 'slip_limit',
                      label: 'Slip Lim.',
                      render: (_value, row) => {
                        const outletRow = outletRows[row._index];
                        return (
                          <Input
                            value={outletRow.slip_limit || ''}
                            onChange={e =>
                              updateOutletRow(
                                row._index,
                                'slip_limit',
                                e.target.value
                              )
                            }
                            placeholder="Slip Lim"
                            size="small"
                            className="!w-24"
                            fullWidth={false}
                          />
                        );
                      },
                    },
                    {
                      id: 'disc_limit',
                      label: 'Disc. Lim.',
                      render: (_value, row) => {
                        const outletRow = outletRows[row._index];
                        return (
                          <Input
                            value={outletRow.disc_limit || ''}
                            onChange={e =>
                              updateOutletRow(
                                row._index,
                                'disc_limit',
                                e.target.value
                              )
                            }
                            placeholder="Disc Lim"
                            size="small"
                            className="!w-24"
                            fullWidth={false}
                          />
                        );
                      },
                    },
                    {
                      id: 'actions',
                      label: 'Actions',
                      render: (_value, row) => (
                        <Box className="!flex !gap-2">
                          <EditButton
                            onClick={() => {
                              setSelectedOutletIndex(row._index);
                              const outletRow = outletRows[row._index];
                              setLocationForm({
                                area: outletRow.area || '',
                                group: outletRow.group || '',
                                distributor_id: outletRow.distributor_id || '',
                                role: outletRow.role || '',
                                slip_limit: outletRow.slip_limit === '1',
                                disc_limit: outletRow.disc_limit === '1',
                                date_limit: outletRow.date_limit || false,
                                dc_par: outletRow.dc_par || false,
                              });
                            }}
                            tooltip="Edit outlet"
                            size="small"
                          />
                          <DeleteButton
                            onClick={() => removeOutletRow(row._index)}
                            tooltip="Delete outlet"
                            size="small"
                          />
                        </Box>
                      ),
                    },
                  ]}
                  pagination={false}
                  sortable={false}
                  compact={true}
                />
              </Box>
            )}
          </Paper>

          <Paper className="!p-3 !rounded-lg !shadow-sm !border !bg-white !border-gray-200">
            <Typography
              variant="h6"
              className="!font-semibold !text-gray-900 !mb-2 !text-base"
            >
              Promotion Product Condition
            </Typography>
            <Box className="!mb-2">
              <Typography className="!mb-1 !text-xs !font-medium">
                Quantity Type
              </Typography>
              <RadioGroup
                value={formik.values.quantity_type}
                onChange={e =>
                  formik.setFieldValue('quantity_type', e.target.value)
                }
                row
              >
                {QUANTITY_TYPES.map(type => (
                  <FormControlLabel
                    key={type}
                    value={type}
                    control={<Radio />}
                    label={type}
                  />
                ))}
              </RadioGroup>
            </Box>

            {productConditions.length > 0 && (
              <Box className="!mb-2">
                <Table
                  data={productConditions.map((condition, idx) => ({
                    id: condition._index,
                    product_group:
                      condition.product_group ||
                      (condition.product_id
                        ? products.find(p => p.id === condition.product_id)
                            ?.name
                        : '-') ||
                      '-',
                    at_least: `${condition.min_quantity || 0} ${productConditionForm.unit}`,
                    _index: idx,
                  }))}
                  columns={[
                    { id: 'product_group', label: 'Product/Group' },
                    { id: 'at_least', label: 'At least' },
                    {
                      id: 'actions',
                      label: 'Actions',
                      render: (_value, row) => (
                        <Box className="!flex !gap-2">
                          <EditButton
                            onClick={() => {
                              const condition = productConditions[row._index];
                              setSelectedProductConditionIndex(row._index);
                              setProductConditionForm({
                                group: condition.product_group || '',
                                dyn_group: '',
                                product: condition.product_id?.toString() || '',
                                quant_group: '',
                                dyn_prod_groups: '',
                                at_least:
                                  condition.min_quantity?.toString() || '',
                                unit: productConditionForm.unit,
                              });
                            }}
                            tooltip="Edit condition"
                            size="small"
                          />
                          <DeleteButton
                            onClick={() => removeProductCondition(row._index)}
                            tooltip="Delete condition"
                            size="small"
                          />
                        </Box>
                      ),
                    },
                  ]}
                  pagination={false}
                  sortable={false}
                  compact={true}
                />
              </Box>
            )}
            <Box className="!space-y-2 !mt-2">
              <Box className="!grid !grid-cols-2 !gap-2">
                <ProductCategorySelect
                  value={productConditionForm.group ? productCategories.find((c: any) => c.category_name === productConditionForm.group)?.id.toString() : ''}
                  nameToSearch={productConditionForm.group || ''}
                  onChange={(_event, category) =>
                    setProductConditionForm({
                      ...productConditionForm,
                      group: category ? category.category_name : '',
                    })
                  }
                  label="Group"
                  size="small"
                  fullWidth
                />

                <ProductSelect
                  value={productConditionForm.product}
                  onChange={(_event, product) =>
                    setProductConditionForm({
                      ...productConditionForm,
                      product: product ? product.id.toString() : '',
                    })
                  }
                  label="Product"
                  size="small"
                  fullWidth
                />

                <Box className="!flex !gap-2">
                  <Input
                    type="number"
                    value={productConditionForm.at_least}
                    onChange={e =>
                      setProductConditionForm({
                        ...productConditionForm,
                        at_least: e.target.value,
                      })
                    }
                    label="At least"
                    size="small"
                    className="!flex-1"
                    fullWidth={false}
                  />
                  <Select
                    value={productConditionForm.unit}
                    onChange={e =>
                      setProductConditionForm({
                        ...productConditionForm,
                        unit: e.target.value,
                      })
                    }
                    size="small"
                    className="!w-24"
                    fullWidth={false}
                  >
                    <MenuItem value="unit">unit</MenuItem>
                    {units.map((unit: any) => (
                      <MenuItem key={unit.id} value={unit.name}>
                        {unit.name}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>
              </Box>
              <Box className="!flex !gap-2">
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    if (selectedProductConditionIndex !== null) {
                      const idx = selectedProductConditionIndex;
                      updateProductCondition(
                        idx,
                        'product_group',
                        productConditionForm.group
                      );
                      updateProductCondition(
                        idx,
                        'product_id',
                        productConditionForm.product
                          ? parseInt(productConditionForm.product)
                          : undefined
                      );
                      updateProductCondition(
                        idx,
                        'min_quantity',
                        parseFloat(productConditionForm.at_least) || 0
                      );
                      setSelectedProductConditionIndex(null);
                      setProductConditionForm({
                        group: '',
                        dyn_group: '',
                        product: '',
                        quant_group: '',
                        dyn_prod_groups: '',
                        at_least: '',
                        unit: 'unit',
                      });
                      setValidationErrors({});
                    }
                  }}
                  disabled={selectedProductConditionIndex === null}
                >
                  Update
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  onClick={addProductCondition}
                >
                  New
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    if (selectedProductConditionIndex !== null) {
                      removeProductCondition(selectedProductConditionIndex);
                      setSelectedProductConditionIndex(null);
                      setProductConditionForm({
                        group: '',
                        dyn_group: '',
                        product: '',
                        quant_group: '',
                        dyn_prod_groups: '',
                        at_least: '',
                        unit: 'unit',
                      });
                    }
                  }}
                  disabled={selectedProductConditionIndex === null}
                >
                  Del
                </Button>
              </Box>
            </Box>
          </Paper>

          <Paper className="!p-3 !rounded-lg !shadow-sm !border !bg-white !border-gray-200">
            <Typography
              variant="h6"
              className="!font-semibold !text-gray-900 !mb-2 !text-base"
            >
              GIFT <span className="!text-gray-500">({giftRows.length})</span>
            </Typography>
            {giftRows.length > 0 && (
              <Box className="!mb-4">
                <Table
                  data={giftRows.map((row, idx) => ({
                    id: idx,
                    type: row.type,
                    application: row.application,
                    gift: row.gift,
                    _index: idx,
                  }))}
                  columns={[
                    {
                      id: 'type',
                      label: 'Type',
                      render: (_value, row) => {
                        const giftRow = giftRows[row._index];
                        return (
                          <Select
                            value={giftRow.type}
                            onChange={e =>
                              updateGiftRow(row._index, 'type', e.target.value)
                            }
                            size="small"
                            fullWidth={false}
                          >
                            {GIFT_TYPES.map(type => (
                              <MenuItem key={type} value={type}>
                                {type}
                              </MenuItem>
                            ))}
                          </Select>
                        );
                      },
                    },
                    {
                      id: 'application',
                      label: 'Application',
                      render: (_value, row) => {
                        const giftRow = giftRows[row._index];
                        return (
                          <Input
                            value={giftRow.application}
                            onChange={e =>
                              updateGiftRow(
                                row._index,
                                'application',
                                e.target.value
                              )
                            }
                            placeholder="Application"
                            size="small"
                            fullWidth={false}
                          />
                        );
                      },
                    },
                    {
                      id: 'gift',
                      label: 'Gift',
                      render: (_value, row) => {
                        const giftRow = giftRows[row._index];
                        return (
                          <Input
                            value={giftRow.gift}
                            onChange={e =>
                              updateGiftRow(row._index, 'gift', e.target.value)
                            }
                            placeholder="Gift"
                            size="small"
                            fullWidth={false}
                          />
                        );
                      },
                    },
                    {
                      id: 'actions',
                      label: 'Actions',
                      render: (_value, row) => (
                        <DeleteButton
                          onClick={() => removeGiftRow(row._index)}
                          tooltip="Delete gift"
                          size="small"
                        />
                      ),
                    },
                  ]}
                  pagination={false}
                  sortable={false}
                  compact={true}
                />
              </Box>
            )}

            <Box className="!space-y-2 !mt-2">
              <Box>
                <Typography className="!mb-1 !text-xs !font-medium">
                  Type
                </Typography>
                <RadioGroup
                  value={selectedGiftType}
                  onChange={e => {
                    const newType = e.target.value;
                    setSelectedGiftType(newType);
                    giftRows.forEach((_, idx) => {
                      updateGiftRow(idx, 'type', newType);
                    });
                  }}
                  row
                >
                  {GIFT_TYPES.map(type => (
                    <FormControlLabel
                      key={type}
                      value={type}
                      control={<Radio />}
                      label={type}
                    />
                  ))}
                </RadioGroup>
              </Box>
              <Input
                label="Disc. (Amount)"
                type="number"
                value={discAmount}
                onChange={e => setDiscAmount(e.target.value)}
                fullWidth
                size="small"
              />
              <Input
                label="Maximum"
                type="number"
                value={maximum}
                onChange={e => setMaximum(e.target.value)}
                fullWidth
                size="small"
              />
              <Box>
                <Tabs
                  value={giftProductTab}
                  onChange={(_, newValue) => setGiftProductTab(newValue)}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  <Tab label="Product" />
                  <Tab label="Prod. Group" />
                  <Tab label="Dyn. Prod. Gr." />
                  <Tab label="Conditional Products" />
                  <Tab label="Invoice" />
                </Tabs>
              </Box>
              <Input
                label="Code"
                value={giftCode}
                onChange={e => setGiftCode(e.target.value)}
                fullWidth
                size="small"
              />
              <ProductSelect
                label="Name"
                value={giftName}
                onChange={(_event, product) => setGiftName(product ? product.id.toString() : '')}
                fullWidth
                size="small"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={giftProductNotInCondition}
                    onChange={e =>
                      setGiftProductNotInCondition(e.target.checked)
                    }
                    size="small"
                  />
                }
                label="Product may not be in condition"
              />
              <Box className="!flex !gap-2">
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    if (giftRows.length > 0 && giftCode && giftName) {
                      updateGiftRow(
                        giftRows.length - 1,
                        'gift',
                        `${discAmount} ${giftName}`
                      );
                      updateGiftRow(
                        giftRows.length - 1,
                        'product_id',
                        parseInt(giftName)
                      );
                      setDiscAmount('');
                      setGiftCode('');
                      setGiftName('');
                    }
                  }}
                >
                  Update
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    const newRow: GiftRow = {
                      _index: giftRows.length,
                      type: selectedGiftType,
                      application: 'n. Prod. Gr.',
                      gift: discAmount ? `${discAmount} ${giftName || ''}` : '',
                      product_id: giftName ? parseInt(giftName) : undefined,
                      benefit_value: parseFloat(discAmount) || 0,
                      gift_limit: 0,
                    };
                    setGiftRows([...giftRows, newRow]);
                    setDiscAmount('');
                    setGiftCode('');
                    setGiftName('');
                  }}
                >
                  New
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    if (giftRows.length > 0) {
                      removeGiftRow(giftRows.length - 1);
                      setDiscAmount('');
                      setGiftCode('');
                      setGiftName('');
                    }
                  }}
                  disabled={giftRows.length === 0}
                >
                  Del
                </Button>
              </Box>
            </Box>
          </Paper>
        </form>
      </Box>
    </CustomDrawer>
  );
};

export default ManageUpdatedPromotion;
