import { Add } from '@mui/icons-material';
import {
  Alert,
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import { useApiMutation } from 'hooks/useApiMutation';
import { useDepots } from 'hooks/useDepots';
import { useProductCategories } from 'hooks/useProductCategories';
import { useProducts } from 'hooks/useProducts';
import {
  useCreatePromotion,
  usePromotion,
  useUpdatePromotion,
  type Promotion,
} from 'hooks/usePromotions';
import { useRolesDropdown } from 'hooks/useRoles';
import { useUnitOfMeasurement } from 'hooks/useUnitOfMeasurement';
import { useZones } from 'hooks/useZones';
import React, { useEffect, useState } from 'react';
import * as promotionService from 'services/masters/Promotions';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';
import Table from 'shared/Table';
import * as Yup from 'yup';

interface UpdatedManagePromotionProps {
  selectedPromotion?: Promotion | null;
  setSelectedPromotion: (promotion: Promotion | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

interface ProductCondition {
  _index: number;
  id?: number;
  condition_id?: number;
  product_id?: number;
  category_id?: number;
  product_group?: string;
  min_quantity?: number;
  min_value?: number;
}

interface OutletRow {
  _index: number;
  id?: number;
  outlet_condition: string;
  dist: string;
  outlet_value: string;
  start: string;
  finish: string;
}

interface LevelRow {
  _index: number;
  id?: number;
  level_number?: number;
  level: string;
  step?: string;
  gift_percent?: string;
  threshold_value?: number;
  discount_type?: string;
  discount_value?: number;
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

interface LocationRow {
  _index: number;
  id?: number;
  area: string;
  group: string;
  distributor_id: string;
  role: string;
  slip_limit: boolean;
  disc_limit: boolean;
  date_limit: boolean;
  dc_par: boolean;
}

const promotionValidationSchema = Yup.object({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must not exceed 255 characters'),
  short_name: Yup.string().max(
    100,
    'Short name must not exceed 100 characters'
  ),
  code: Yup.string()
    .required('Code is required')
    .min(1, 'Code is required')
    .max(50, 'Code must not exceed 50 characters'),
  start_date: Yup.string().required('Start date is required'),
  finish_date: Yup.string()
    .required('End date is required')
    .test(
      'is-after-start',
      'End date must be after start date',
      function (value) {
        const { start_date } = this.parent;
        if (!start_date || !value) return true;
        return new Date(value) >= new Date(start_date);
      }
    ),
  description: Yup.string().max(
    1000,
    'Description must not exceed 1000 characters'
  ),
  degree: Yup.string()
    .matches(/^\d+$/, 'Degree must be a positive number')
    .test('is-positive', 'Degree must be greater than 0', value => {
      if (!value) return true;
      return parseInt(value) > 0;
    }),
  nr: Yup.string()
    .matches(/^\d+$/, 'Nr must be a positive number')
    .test('is-positive', 'Nr must be greater than 0', value => {
      if (!value) return true;
      return parseInt(value) > 0;
    }),
  dist_comp_participation_min: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, 'Invalid format')
    .test('is-valid-range', 'Min must be between 0 and 100', value => {
      if (!value) return true;
      const num = parseFloat(value);
      return num >= 0 && num <= 100;
    }),
  dist_comp_participation_max: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, 'Invalid format')
    .test('is-valid-range', 'Max must be between 0 and 100', value => {
      if (!value) return true;
      const num = parseFloat(value);
      return num >= 0 && num <= 100;
    })
    .test(
      'is-greater-than-min',
      'Max must be greater than or equal to min',
      function (value) {
        const { dist_comp_participation_min } = this.parent;
        if (!dist_comp_participation_min || !value) return true;
        return parseFloat(value) >= parseFloat(dist_comp_participation_min);
      }
    ),
  platform: Yup.array()
    .min(1, 'At least one platform must be selected')
    .required('Platform is required'),
});

const QUANTITY_TYPES = ['Quantity', 'Price', 'Weight', 'Volume'];
const LEVEL_TYPES = ['Condition Count', 'Total', 'Species', 'Factor'];
const GIFT_TYPES = ['Free Product', 'Percent', 'Amount'];
const PLATFORMS = ['Office', 'Mobile', 'B2B'];
const PAY_TYPES = ['Cash', 'Credit', 'Both'];
const SCOPE_TYPES = ['(B) Distributor Channel', '(C) Customer Channel'];
const SLIP_TYPES = ['All', 'Invoice', 'Waybill', 'Order'];
const PROM_CONFLICT_TYPES = ['Normal', 'Exclusive', 'Priority'];
const REG_DISC_CONF_TYPES = ['Normal', 'Override', 'Combine'];

const UpdatedManagePromotion: React.FC<UpdatedManagePromotionProps> = ({
  selectedPromotion,
  setSelectedPromotion,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedPromotion;
  const [productConditions, setProductConditions] = useState<
    ProductCondition[]
  >([]);
  const [outletRows, setOutletRows] = useState<OutletRow[]>([]);
  const [levelRows, setLevelRows] = useState<LevelRow[]>([]);
  const [giftRows, setGiftRows] = useState<GiftRow[]>([]);
  const [locationTab, setLocationTab] = useState(0);
  const [locationRows, setLocationRows] = useState<LocationRow[]>([]);
  const [selectedLocationIndex, setSelectedLocationIndex] = useState<
    number | null
  >(null);
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
  const [selectedDepots, setSelectedDepots] = useState<number[]>([]);
  const [selectedRoutes, setSelectedRoutes] = useState<number[]>([]);
  const [selectedCustomerCategories, setSelectedCustomerCategories] = useState<
    number[]
  >([]);
  const [selectedCustomerExclusions, setSelectedCustomerExclusions] = useState<
    number[]
  >([]);

  const [giftProductTab, setGiftProductTab] = useState(0);
  const [giftCode, setGiftCode] = useState('');
  const [giftName, setGiftName] = useState('');
  const [giftProductNotInCondition, setGiftProductNotInCondition] =
    useState(false);
  const [discAmount, setDiscAmount] = useState('');
  const [maximum, setMaximum] = useState('0.00');
  const [selectedGiftType, setSelectedGiftType] = useState<string>('Amount');
  const [selectedProductConditionIndex, setSelectedProductConditionIndex] =
    useState<number | null>(null);
  const [selectedLevelIndex, setSelectedLevelIndex] = useState<number | null>(
    null
  );
  const [productConditionForm, setProductConditionForm] = useState({
    group: '',
    dyn_group: '',
    product: '',
    quant_group: '',
    dyn_prod_groups: '',
    at_least: '',
    unit: '',
  });
  const [levelForm, setLevelForm] = useState({
    level: '',
    unit: '',
    step: false,
  });
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const { data: promotionDetailResponse, isLoading: isLoadingPromotion } =
    usePromotion(selectedPromotion?.id || null);

  const { data: productsResponse } = useProducts({ limit: 1000 });
  const products = productsResponse?.data || [];

  const { data: depotsResponse } = useDepots({ limit: 1000 });
  const depots = depotsResponse?.data || [];

  const { data: zonesResponse } = useZones({ limit: 1000 });
  const zones = zonesResponse?.data || [];

  const { data: productCategoriesResponse } = useProductCategories({
    limit: 1000,
  });
  const productCategories = productCategoriesResponse?.data || [];

  const { data: rolesResponse } = useRolesDropdown();
  const roles = rolesResponse?.data || [];

  const { data: unitsResponse } = useUnitOfMeasurement({ limit: 1000 });
  const units = unitsResponse?.data || [];

  const createPromotionMutation = useCreatePromotion();
  const updatePromotionMutation = useUpdatePromotion();

  const assignChannelsMutation = useApiMutation({
    mutationFn: ({ id, channels }: { id: number; channels: string[] }) =>
      promotionService.assignChannels(id, channels),
    invalidateQueries: [['promotions']],
    loadingMessage: 'Assigning channels...',
  });

  const assignDepotsMutation = useApiMutation({
    mutationFn: ({ id, depot_ids }: { id: number; depot_ids: number[] }) =>
      promotionService.assignDepots(id, depot_ids),
    invalidateQueries: [['promotions']],
    loadingMessage: 'Assigning depots...',
  });

  const assignRoutesMutation = useApiMutation({
    mutationFn: ({ id, route_ids }: { id: number; route_ids: number[] }) =>
      promotionService.assignRoutes(id, route_ids),
    invalidateQueries: [['promotions']],
    loadingMessage: 'Assigning routes...',
  });

  const assignCustomerCategoriesMutation = useApiMutation({
    mutationFn: ({
      id,
      customer_category_ids,
    }: {
      id: number;
      customer_category_ids: number[];
    }) => promotionService.assignCustomerCategories(id, customer_category_ids),
    invalidateQueries: [['promotions']],
    loadingMessage: 'Assigning customer categories...',
  });

  const assignCustomerExclusionsMutation = useApiMutation({
    mutationFn: ({
      id,
      customer_ids,
    }: {
      id: number;
      customer_ids: number[];
    }) => promotionService.assignCustomerExclusions(id, customer_ids),
    invalidateQueries: [['promotions']],
    loadingMessage: 'Assigning customer exclusions...',
  });

  const createConditionMutation = useApiMutation({
    mutationFn: ({ id, conditionData }: { id: number; conditionData: any }) =>
      promotionService.createCondition(id, conditionData),
    invalidateQueries: [['promotions']],
    loadingMessage: 'Creating condition...',
  });

  const assignConditionProductsMutation = useApiMutation({
    mutationFn: ({
      id,
      conditionId,
      products,
    }: {
      id: number;
      conditionId: number;
      products: any[];
    }) => promotionService.assignConditionProducts(id, conditionId, products),
    invalidateQueries: [['promotions']],
    loadingMessage: 'Assigning condition products...',
  });

  const createLevelMutation = useApiMutation({
    mutationFn: ({ id, levelData }: { id: number; levelData: any }) =>
      promotionService.createLevel(id, levelData),
    invalidateQueries: [['promotions']],
    loadingMessage: 'Creating level...',
  });

  const createBenefitMutation = useApiMutation({
    mutationFn: ({
      id,
      levelId,
      benefitData,
    }: {
      id: number;
      levelId: number;
      benefitData: any;
    }) => promotionService.createBenefit(id, levelId, benefitData),
    invalidateQueries: [['promotions']],
    loadingMessage: 'Creating benefit...',
  });

  useEffect(() => {
    if (promotionDetailResponse?.data && isEdit) {
      const promo = promotionDetailResponse.data;
      if (promo.conditions) {
        const conditions = promo.conditions.map((cond: any, idx: number) => ({
          _index: idx,
          id: cond.id,
          condition_id: cond.id,
          product_id:
            cond.promotion_condition_products?.[0]?.product_id || undefined,
          category_id:
            cond.promotion_condition_products?.[0]?.category_id || undefined,
          product_group:
            cond.promotion_condition_products?.[0]?.product_group || '',
          min_quantity:
            cond.promotion_condition_products?.[0]?.condition_quantity || 0,
          min_value: cond.min_value || 0,
        }));
        setProductConditions(conditions);
      }
      if (promo.levels) {
        const levels = promo.levels.map((level: any, idx: number) => ({
          _index: idx,
          id: level.id,
          level_number: level.level_number,
          level: level.threshold_value?.toString() || '',
          step: '',
          gift_percent: level.discount_value?.toString() || '',
          threshold_value: level.threshold_value,
          discount_type: level.discount_type,
          discount_value: level.discount_value,
        }));
        setLevelRows(levels);
        const allGifts: GiftRow[] = [];
        promo.levels.forEach((level: any, idx: number) => {
          if (level.promotion_benefit_level) {
            const gifts = level.promotion_benefit_level.map((benefit: any) => ({
              _index: idx,
              id: benefit.id,
              level_id: level.id,
              type:
                benefit.benefit_type === 'FREE_PRODUCT'
                  ? 'Free Product'
                  : benefit.benefit_type === 'PERCENTAGE'
                    ? 'Percent'
                    : 'Amount',
              application: 'n. Prod. Gr.',
              gift: benefit.benefit_value?.toString() || '',
              product_id: benefit.product_id,
              benefit_value: benefit.benefit_value,
              gift_limit: benefit.gift_limit || 0,
            }));
            allGifts.push(...gifts);
          }
        });
        setGiftRows(allGifts);
        if (allGifts.length > 0) {
          setSelectedGiftType(allGifts[0].type);
        }
      }
      if (promo.depots) {
        setSelectedDepots(promo.depots.map((d: any) => d.depot_id));
      }
      if (promo.routes) {
        setSelectedRoutes(promo.routes.map((r: any) => r.route_id));
      }
      if (promo.customer_categories) {
        setSelectedCustomerCategories(
          promo.customer_categories.map((cc: any) => cc.customer_category_id)
        );
      }
      if (promo.customer_exclusions) {
        setSelectedCustomerExclusions(
          promo.customer_exclusions.map((ce: any) => ce.customer_id)
        );
      }
    }
  }, [promotionDetailResponse, isEdit]);

  const handleCancel = () => {
    setSelectedPromotion(null);
    setDrawerOpen(false);
    setProductConditions([]);
    setOutletRows([]);
    setLevelRows([]);
    setGiftRows([]);
    setSelectedDepots([]);
    setSelectedRoutes([]);
    setSelectedCustomerCategories([]);
    setSelectedCustomerExclusions([]);
    setValidationErrors({});
    setSelectedGiftType('Amount');
  };

  const formik = useFormik({
    initialValues: {
      name: selectedPromotion?.name || '',
      short_name: selectedPromotion?.name || '',
      code: selectedPromotion?.code || '',
      pay_type: '',
      scope: '(B) Distributor Channel',
      slip_type: 'All',
      mandatory: true,
      prom_conflict: 'Normal',
      degree: '1',
      nr: '1',
      reg_disc_conf: 'Normal',
      conflict_with_constant_disc: false,
      start_date: selectedPromotion?.start_date || '',
      finish_date: selectedPromotion?.end_date || '',
      platform: ['Office', 'Mobile', 'B2B'],
      group: '',
      dist_comp_participation_min: '0',
      dist_comp_participation_max: '100',
      level_type: 'Total',
      quantity_type: 'Quantity',
      disabled: selectedPromotion?.is_active === 'N',
      description: selectedPromotion?.description || '',
    },
    validationSchema: promotionValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const errors: Record<string, string> = {};

        for (let i = 0; i < productConditions.length; i++) {
          const condition = productConditions[i];
          if (
            !condition.product_id &&
            !condition.category_id &&
            !condition.product_group
          ) {
            errors[`productCondition_${i}`] =
              'Product, Category, or Product Group must be selected';
          }
          if (
            condition.min_quantity !== undefined &&
            condition.min_quantity <= 0
          ) {
            errors[`productCondition_quantity_${i}`] =
              'Minimum quantity must be greater than 0';
          }
        }

        for (let i = 0; i < levelRows.length; i++) {
          const level = levelRows[i];
          if (!level.level || parseFloat(level.level) <= 0) {
            errors[`level_${i}`] = 'Level value must be greater than 0';
          }
          if (level.gift_percent) {
            const giftPercent = parseFloat(level.gift_percent);
            if (isNaN(giftPercent) || giftPercent < 0) {
              errors[`level_gift_${i}`] =
                'Gift percentage must be a valid positive number';
            }
          }
        }

        for (let i = 0; i < giftRows.length; i++) {
          const gift = giftRows[i];
          if (gift.type === 'Free Product' && !gift.product_id) {
            errors[`gift_product_${i}`] =
              'Product must be selected for Free Product';
          }
          if (gift.gift) {
            const giftValue = parseFloat(gift.gift);
            if (isNaN(giftValue) || giftValue < 0) {
              errors[`gift_value_${i}`] =
                'Gift value must be a valid positive number';
            }
          }
        }

        for (let i = 0; i < outletRows.length; i++) {
          const outlet = outletRows[i];
          if (outlet.start && outlet.finish) {
            if (new Date(outlet.finish) < new Date(outlet.start)) {
              errors[`outlet_dates_${i}`] =
                'Finish date must be after start date';
            }
          }
        }

        if (Object.keys(errors).length > 0) {
          setValidationErrors(errors);
          const firstError = Object.values(errors)[0];
          if (firstError) {
            formik.setFieldError('name', firstError);
          }
          return;
        }

        setValidationErrors({});

        let promotionId: number;

        if (isEdit && selectedPromotion?.id) {
          await updatePromotionMutation.mutateAsync({
            id: selectedPromotion.id,
            data: {
              name: values.name,
              start_date: values.start_date,
              end_date: values.finish_date,
              description: values.description,
              is_active: values.disabled ? 'N' : 'Y',
              platforms: values.platform,
            },
          });
          promotionId = selectedPromotion.id;
        } else {
          const createResponse = await createPromotionMutation.mutateAsync({
            name: values.name,
            code: values.code,
            start_date: values.start_date,
            end_date: values.finish_date,
            description: values.description,
            disabled: values.disabled,
            platforms: values.platform,
            quantity_type: values.quantity_type,
          });
          promotionId = createResponse.data?.id || 0;
        }

        if (!promotionId || promotionId === 0) {
          throw new Error('Failed to create/update promotion');
        }

        if (values.platform && values.platform.length > 0) {
          await assignChannelsMutation.mutateAsync({
            id: promotionId,
            channels: values.platform,
          });
        }

        if (selectedDepots.length > 0) {
          await assignDepotsMutation.mutateAsync({
            id: promotionId,
            depot_ids: selectedDepots,
          });
        }

        if (selectedRoutes.length > 0) {
          await assignRoutesMutation.mutateAsync({
            id: promotionId,
            route_ids: selectedRoutes,
          });
        }

        if (selectedCustomerCategories.length > 0) {
          await assignCustomerCategoriesMutation.mutateAsync({
            id: promotionId,
            customer_category_ids: selectedCustomerCategories,
          });
        }

        if (selectedCustomerExclusions.length > 0) {
          await assignCustomerExclusionsMutation.mutateAsync({
            id: promotionId,
            customer_ids: selectedCustomerExclusions,
          });
        }

        for (const condition of productConditions) {
          if (!condition.condition_id) {
            const conditionResponse = await createConditionMutation.mutateAsync(
              {
                id: promotionId,
                conditionData: {
                  condition_type: formik.values.quantity_type.toUpperCase(),
                  applies_to_type: condition.product_group
                    ? 'PRODUCTGROUP'
                    : condition.category_id
                      ? 'CATEGORY'
                      : 'SINGLEPRODUCT',
                  min_value: condition.min_value || condition.min_quantity || 0,
                  effective_start_date: values.start_date,
                  effective_end_date: values.finish_date,
                },
              }
            );

            const conditionId = conditionResponse.data?.id;
            if (conditionId) {
              await assignConditionProductsMutation.mutateAsync({
                id: promotionId,
                conditionId,
                products: [
                  {
                    product_id: condition.product_id || null,
                    category_id: condition.category_id || null,
                    product_group: condition.product_group || null,
                    condition_quantity: condition.min_quantity || 0,
                  },
                ],
              });
            }
          }
        }

        for (const level of levelRows) {
          if (!level.id) {
            const levelResponse = await createLevelMutation.mutateAsync({
              id: promotionId,
              levelData: {
                level_number: level.level_number || level._index + 1,
                threshold_value: parseFloat(level.level) || 0,
                discount_type: 'PERCENTAGE',
                discount_value: parseFloat(level.gift_percent || '0') || 0,
              },
            });

            const levelId = levelResponse.data?.id;
            if (levelId) {
              const levelGifts = giftRows.filter(
                g => g._index === level._index
              );
              for (const gift of levelGifts) {
                await createBenefitMutation.mutateAsync({
                  id: promotionId,
                  levelId,
                  benefitData: {
                    benefit_type:
                      gift.type === 'Free Product'
                        ? 'FREE_PRODUCT'
                        : gift.type === 'Percent'
                          ? 'PERCENTAGE'
                          : 'AMOUNT',
                    product_id: gift.product_id || null,
                    benefit_value: parseFloat(gift.gift) || 0,
                    gift_limit: gift.gift_limit || 0,
                  },
                });
              }
            }
          }
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving promotion:', error);
      }
    },
  });

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
      dist: '',
      outlet_value: '',
      start: formik.values.start_date,
      finish: formik.values.finish_date,
    };
    setOutletRows([...outletRows, newRow]);
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

  const addLevelRow = () => {
    const newRow: LevelRow = {
      _index: levelRows.length,
      level_number: levelRows.length + 1,
      level: '',
      step: '',
      gift_percent: '',
    };
    setLevelRows([...levelRows, newRow]);
  };

  const removeLevelRow = (index: number) => {
    const levelIndex = levelRows[index]._index;
    setLevelRows(levelRows.filter((_, i) => i !== index));
    setGiftRows(giftRows.filter(g => g._index !== levelIndex));
  };

  const updateLevelRow = (
    index: number,
    field: keyof LevelRow,
    value: string | number
  ) => {
    const updated = [...levelRows];
    updated[index] = { ...updated[index], [field]: value };
    setLevelRows(updated);
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
        title={isEdit ? 'Edit Promotion' : 'Create Promotion'}
        size="extra-large"
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
      title={isEdit ? 'Edit Promotion' : 'Create Promotion'}
      size="extra-large"
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
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formik.values.disabled}
                    onChange={e =>
                      formik.setFieldValue('disabled', e.target.checked)
                    }
                  />
                }
                className="!col-span-2"
                label="Disabled"
              />
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
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formik.values.mandatory}
                    onChange={e =>
                      formik.setFieldValue('mandatory', e.target.checked)
                    }
                  />
                }
                label="Mandatory"
              />
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
                label="Start Date"
                type="date"
                formik={formik}
                required
                fullWidth
              />
              <Input
                name="finish_date"
                label="Finish Date"
                type="date"
                formik={formik}
                required
                fullWidth
              />
              <Box className="!col-span-2">
                <Typography className="!mb-1 !text-xs !font-medium">
                  Platform
                </Typography>
                <FormGroup row>
                  {PLATFORMS.map(platform => (
                    <FormControlLabel
                      key={platform}
                      control={
                        <Checkbox
                          checked={formik.values.platform.includes(platform)}
                          onChange={e => {
                            const current = formik.values.platform;
                            if (e.target.checked) {
                              formik.setFieldValue('platform', [
                                ...current,
                                platform,
                              ]);
                            } else {
                              formik.setFieldValue(
                                'platform',
                                current.filter(p => p !== platform)
                              );
                            }
                          }}
                        />
                      }
                      label={platform}
                    />
                  ))}
                </FormGroup>
              </Box>
              <Input name="group" label="Group" formik={formik} fullWidth />
              <Input
                name="description"
                label="Description"
                formik={formik}
                fullWidth
                multiline
                rows={2}
                className="!col-span-2"
              />
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
              <Box className="!col-span-2">
                <Typography className="!mb-1 !text-xs !font-medium">
                  Level Type
                </Typography>
                <RadioGroup
                  value={formik.values.level_type}
                  onChange={e =>
                    formik.setFieldValue('level_type', e.target.value)
                  }
                  row
                >
                  {LEVEL_TYPES.map(type => (
                    <FormControlLabel
                      key={type}
                      value={type}
                      control={<Radio />}
                      label={type}
                    />
                  ))}
                </RadioGroup>
              </Box>
            </Box>
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
                    product_group: condition.product_group || '-',
                    at_least: `${condition.min_quantity || 0} ${productConditionForm.unit || 'unit'}`,
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
                <Select
                  value={productConditionForm.group}
                  onChange={e =>
                    setProductConditionForm({
                      ...productConditionForm,
                      group: e.target.value,
                    })
                  }
                  label="Group"
                  size="small"
                  fullWidth
                >
                  {products.map((product: any) => (
                    <MenuItem key={product.id} value={product.name}>
                      {product.name}
                    </MenuItem>
                  ))}
                </Select>
                <Select
                  value={productConditionForm.dyn_group}
                  onChange={e => {
                    setProductConditionForm({
                      ...productConditionForm,
                      dyn_group: e.target.value,
                    });
                    setValidationErrors({});
                  }}
                  label="Dyn. Group"
                  size="small"
                  fullWidth
                >
                  <MenuItem value="">Select...</MenuItem>
                </Select>
                <Select
                  value={productConditionForm.product}
                  onChange={e => {
                    setProductConditionForm({
                      ...productConditionForm,
                      product: e.target.value,
                    });
                    setValidationErrors({});
                  }}
                  label="Product"
                  size="small"
                  fullWidth
                >
                  <MenuItem value="">Select...</MenuItem>
                  {products.map((product: any) => (
                    <MenuItem key={product.id} value={product.id.toString()}>
                      {product.name}
                    </MenuItem>
                  ))}
                </Select>
                <Select
                  value={productConditionForm.quant_group}
                  onChange={e =>
                    setProductConditionForm({
                      ...productConditionForm,
                      quant_group: e.target.value,
                    })
                  }
                  label="Quant. Group"
                  size="small"
                  fullWidth
                >
                  <MenuItem value="">Select...</MenuItem>
                </Select>
                <Select
                  value={productConditionForm.dyn_prod_groups}
                  onChange={e =>
                    setProductConditionForm({
                      ...productConditionForm,
                      dyn_prod_groups: e.target.value,
                    })
                  }
                  label="Dyn. Prod. Groups"
                  size="small"
                  fullWidth
                >
                  <MenuItem value="">Select...</MenuItem>
                </Select>
                <Box className="!flex !gap-2">
                  <Input
                    type="number"
                    value={productConditionForm.at_least}
                    onChange={e => {
                      setProductConditionForm({
                        ...productConditionForm,
                        at_least: e.target.value,
                      });
                      setValidationErrors({});
                    }}
                    label="At least"
                    size="small"
                    fullWidth
                  />
                  {/* <Select
                      value={productConditionForm.unit}
                      onChange={e =>
                        setProductConditionForm({
                          ...productConditionForm,
                          unit: e.target.value,
                        })
                      }
                      label="unit"
                      size="small"
                      className="!w-32"
                    >
                      <MenuItem value="unit">unit</MenuItem>
                      {units.map((unit: any) => (
                        <MenuItem key={unit.id} value={unit.name}>
                          {unit.name}
                        </MenuItem>
                      ))}
                    </Select> */}
                </Box>
              </Box>
              <Box className="!flex !gap-2">
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    if (selectedProductConditionIndex !== null) {
                      if (
                        !productConditionForm.group &&
                        !productConditionForm.product
                      ) {
                        setValidationErrors({
                          ...validationErrors,
                          productCondition_update:
                            'Product or Group must be selected',
                        });
                        return;
                      }
                      if (
                        !productConditionForm.at_least ||
                        parseFloat(productConditionForm.at_least) <= 0
                      ) {
                        setValidationErrors({
                          ...validationErrors,
                          productCondition_quantity_update:
                            'At least value must be greater than 0',
                        });
                        return;
                      }
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
                        unit: '',
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
                  onClick={() => {
                    if (
                      !productConditionForm.group &&
                      !productConditionForm.product
                    ) {
                      setValidationErrors({
                        ...validationErrors,
                        productCondition_new:
                          'Product or Group must be selected',
                      });
                      return;
                    }
                    if (
                      !productConditionForm.at_least ||
                      parseFloat(productConditionForm.at_least) <= 0
                    ) {
                      setValidationErrors({
                        ...validationErrors,
                        productCondition_quantity_new:
                          'At least value must be greater than 0',
                      });
                      return;
                    }
                    const newCondition: ProductCondition = {
                      _index: productConditions.length,
                      product_group: productConditionForm.group,
                      product_id: productConditionForm.product
                        ? parseInt(productConditionForm.product)
                        : undefined,
                      min_quantity:
                        parseFloat(productConditionForm.at_least) || 0,
                    };
                    setProductConditions([...productConditions, newCondition]);
                    setProductConditionForm({
                      group: '',
                      dyn_group: '',
                      product: '',
                      quant_group: '',
                      dyn_prod_groups: '',
                      at_least: '',
                      unit: '',
                    });
                    setValidationErrors({});
                  }}
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
                        unit: '',
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
          <Box className="!space-y-3">
            <Paper className="!p-3 !rounded-lg !shadow-sm !border !bg-white !border-gray-200">
              <Typography
                variant="h6"
                className="!font-semibold !text-gray-900 !mb-2 !text-base"
              >
                Suitable Outlets
              </Typography>
              <Box className="!mb-2">
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  startIcon={<Add />}
                  onClick={addOutletRow}
                >
                  Add Outlet
                </Button>
              </Box>
              {outletRows.length > 0 && (
                <Table
                  data={outletRows.map((row, idx) => ({
                    id: row._index,
                    condition: row.outlet_condition || 'Distributor',
                    value: row.outlet_value,
                    start: row.start,
                    finish: row.finish,
                    _index: idx,
                  }))}
                  columns={[
                    {
                      id: 'value',
                      label: 'Value',
                      render: (_value, row) => {
                        const outletRow = outletRows[row._index];
                        return (
                          <Input
                            value={outletRow.outlet_value}
                            onChange={e =>
                              updateOutletRow(
                                row._index,
                                'outlet_value',
                                e.target.value
                              )
                            }
                            placeholder="Value"
                            size="small"
                            className="!w-36"
                            fullWidth={false}
                          />
                        );
                      },
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
                      id: 'actions',
                      label: 'Actions',
                      render: (_value, row) => (
                        <DeleteButton
                          onClick={() => removeOutletRow(row._index)}
                          tooltip="Delete outlet"
                        />
                      ),
                    },
                  ]}
                  pagination={false}
                  sortable={false}
                  compact={true}
                />
              )}
            </Paper>
          </Box>

          <Paper className="!p-3 !rounded-lg !shadow-sm !border !bg-white !border-gray-200">
            <Box className="!mb-2">
              <Tabs
                value={locationTab}
                onChange={(_, newValue) => setLocationTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="Location" />
                <Tab label="Distributor" />
                <Tab label="Seller" />
                <Tab label="Outlet 1" />
                <Tab label="Outlet 2" />
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
                {zones.map((zone: any) => (
                  <MenuItem key={zone.id} value={zone.id.toString()}>
                    {zone.name}
                  </MenuItem>
                ))}
              </Select>
              <Select
                value={locationForm.group}
                onChange={e =>
                  setLocationForm({ ...locationForm, group: e.target.value })
                }
                label="Group"
                fullWidth
              >
                <MenuItem value="">Select Group</MenuItem>
                {productCategories.map((category: any) => (
                  <MenuItem key={category.id} value={category.id.toString()}>
                    {category.category_name}
                  </MenuItem>
                ))}
              </Select>
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
                onClick={() => {
                  const newRow: LocationRow = {
                    _index: locationRows.length,
                    area: locationForm.area,
                    group: locationForm.group,
                    distributor_id: locationForm.distributor_id,
                    role: locationForm.role,
                    slip_limit: locationForm.slip_limit,
                    disc_limit: locationForm.disc_limit,
                    date_limit: locationForm.date_limit,
                    dc_par: locationForm.dc_par,
                  };
                  setLocationRows([...locationRows, newRow]);
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
                }}
              >
                New
              </Button>
              <Button
                type="button"
                variant="outlined"
                size="small"
                onClick={() => {
                  if (selectedLocationIndex !== null) {
                    const updated = [...locationRows];
                    updated[selectedLocationIndex] = {
                      ...updated[selectedLocationIndex],
                      ...locationForm,
                    };
                    setLocationRows(updated);
                    setSelectedLocationIndex(null);
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
                disabled={selectedLocationIndex === null}
              >
                Update
              </Button>
              <Button
                type="button"
                variant="outlined"
                size="small"
                onClick={() => {
                  if (selectedLocationIndex !== null) {
                    setLocationRows(
                      locationRows.filter((_, i) => i !== selectedLocationIndex)
                    );
                    setSelectedLocationIndex(null);
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
                disabled={selectedLocationIndex === null}
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
                label="Slip Lim.:"
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
                label="Date:"
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
                label="D/C Par.:"
              />
            </Box>
            {locationRows.length > 0 && (
              <Table
                data={locationRows.map((row, idx) => ({
                  id: row._index,
                  area:
                    zones.find((z: any) => z.id.toString() === row.area)
                      ?.name || '-',
                  group:
                    productCategories.find(
                      (c: any) => c.id.toString() === row.group
                    )?.category_name || '-',
                  distributor:
                    depots.find(
                      (d: any) => d.id.toString() === row.distributor_id
                    )?.name || '-',
                  role:
                    roles.find((r: any) => r.id.toString() === row.role)
                      ?.name || '-',
                  _index: idx,
                  _row: row,
                }))}
                columns={[
                  { id: 'area', label: 'Area' },
                  { id: 'group', label: 'Group' },
                  { id: 'distributor', label: 'Distributor' },
                  { id: 'role', label: 'Role' },
                  {
                    id: 'actions',
                    label: 'Actions',
                    render: (_value, row) => (
                      <Box className="!flex !gap-2">
                        <EditButton
                          onClick={() => {
                            setSelectedLocationIndex(row._index);
                            setLocationForm({
                              area: row._row.area,
                              group: row._row.group,
                              distributor_id: row._row.distributor_id,
                              role: row._row.role,
                              slip_limit: row._row.slip_limit,
                              disc_limit: row._row.disc_limit,
                              date_limit: row._row.date_limit,
                              dc_par: row._row.dc_par,
                            });
                          }}
                          tooltip="Edit location"
                          size="small"
                        />
                        <DeleteButton
                          onClick={() => {
                            setLocationRows(
                              locationRows.filter((_, i) => i !== row._index)
                            );
                            if (selectedLocationIndex === row._index) {
                              setSelectedLocationIndex(null);
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
                          tooltip="Delete location"
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
            )}
          </Paper>
          <Paper className="!p-3 !rounded-lg !shadow-sm !border !bg-white !border-gray-200">
            <Typography
              variant="h6"
              className="!font-semibold !text-gray-900 !mb-2 !text-base"
            >
              LEVEL
            </Typography>
            <Box className="!mb-2">
              <Button
                type="button"
                variant="outlined"
                size="small"
                startIcon={<Add />}
                onClick={addLevelRow}
              >
                Add Level
              </Button>
            </Box>
            {levelRows.length > 0 && (
              <Box className="!mb-2">
                <Table
                  data={levelRows.map((row, idx) => ({
                    id: row._index,
                    level:
                      row.level && levelForm.unit
                        ? `${row.level} ${levelForm.unit} and above`
                        : row.level || '-',
                    step: row.step || '-',
                    gift_percent: row.gift_percent || '-',
                    _index: idx,
                  }))}
                  columns={[
                    { id: 'level', label: 'Level' },
                    { id: 'step', label: 'Step' },
                    { id: 'gift_percent', label: 'Gift+%' },
                    {
                      id: 'actions',
                      label: 'Actions',
                      render: (_value, row) => (
                        <Box className="!flex !gap-2">
                          <EditButton
                            onClick={() => {
                              const levelRow = levelRows[row._index];
                              setSelectedLevelIndex(row._index);
                              setLevelForm({
                                level: levelRow.level,
                                unit: levelForm.unit,
                                step:
                                  levelRow.step === 'true' ||
                                  levelRow.step === '1',
                              });
                            }}
                            tooltip="Edit level"
                            size="small"
                          />
                          <DeleteButton
                            onClick={() => removeLevelRow(row._index)}
                            tooltip="Delete level"
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
              <Box className="!flex !gap-2 !w-full">
                <Input
                  type="number"
                  value={levelForm.level}
                  onChange={e => {
                    setLevelForm({ ...levelForm, level: e.target.value });
                    setValidationErrors({});
                  }}
                  label="Level"
                  size="small"
                  className="!w-1/2"
                />
                <Select
                  value={levelForm.unit}
                  onChange={e =>
                    setLevelForm({ ...levelForm, unit: e.target.value })
                  }
                  label="unit"
                  size="small"
                  fullWidth
                  className="!w-1/2"
                >
                  <MenuItem value="unit">unit</MenuItem>
                  {units.map((unit: any) => (
                    <MenuItem key={unit.id} value={unit.name}>
                      {unit.name}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={levelForm.step}
                    onChange={e =>
                      setLevelForm({ ...levelForm, step: e.target.checked })
                    }
                    size="small"
                  />
                }
                label="Step"
              />
              <Box className="!flex !gap-2 !w-full">
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    if (selectedLevelIndex !== null) {
                      if (
                        !levelForm.level ||
                        parseFloat(levelForm.level) <= 0
                      ) {
                        setValidationErrors({
                          ...validationErrors,
                          level_update: 'Level value must be greater than 0',
                        });
                        return;
                      }
                      const idx = selectedLevelIndex;
                      updateLevelRow(idx, 'level', levelForm.level);
                      updateLevelRow(idx, 'step', levelForm.step ? '1' : '');
                      setSelectedLevelIndex(null);
                      setLevelForm({
                        level: '',
                        unit: '',
                        step: false,
                      });
                      setValidationErrors({});
                    }
                  }}
                  disabled={selectedLevelIndex === null}
                >
                  Update
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    if (!levelForm.level || parseFloat(levelForm.level) <= 0) {
                      setValidationErrors({
                        ...validationErrors,
                        level_new: 'Level value must be greater than 0',
                      });
                      return;
                    }
                    const newRow: LevelRow = {
                      _index: levelRows.length,
                      level_number: levelRows.length + 1,
                      level: levelForm.level,
                      step: levelForm.step ? '1' : '',
                      gift_percent: '',
                    };
                    setLevelRows([...levelRows, newRow]);
                    setLevelForm({
                      level: '',
                      unit: '',
                      step: false,
                    });
                    setValidationErrors({});
                  }}
                >
                  New
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    if (selectedLevelIndex !== null) {
                      removeLevelRow(selectedLevelIndex);
                      setSelectedLevelIndex(null);
                      setLevelForm({
                        level: '',
                        unit: '',
                        step: false,
                      });
                    }
                  }}
                  disabled={selectedLevelIndex === null}
                >
                  Del
                </Button>
                <Button type="button" variant="outlined" size="small">
                  x3 Türet
                </Button>
              </Box>
            </Box>
          </Paper>

          <Paper className="!p-3 !rounded-lg !shadow-sm !border !bg-white !border-gray-200">
            <Typography
              variant="h6"
              className="!font-semibold !text-gray-900 !mb-2 !text-base"
            >
              GIFT
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
            <Box className="!mb-2">
              <Input
                label="Gift Count"
                type="number"
                value={giftRows.length.toString()}
                disabled
                fullWidth
                size="small"
              />
            </Box>

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
              <Select
                label="Name"
                value={giftName}
                onChange={e => setGiftName(e.target.value)}
                fullWidth
                size="small"
              >
                <MenuItem value="">Select...</MenuItem>
                {products.map((product: any) => (
                  <MenuItem key={product.id} value={product.id.toString()}>
                    {product.name}
                  </MenuItem>
                ))}
              </Select>
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
                label="Product may not be in condtion"
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
                    const levelIndex =
                      levelRows.length > 0
                        ? levelRows[levelRows.length - 1]._index
                        : 0;
                    const newRow: GiftRow = {
                      _index: levelIndex,
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

          <Box className="!flex !justify-end col-span-2 !items-center !gap-2 !mt-2 !pt-2">
            <Button type="button" variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createPromotionMutation.isPending ||
                updatePromotionMutation.isPending
              }
            >
              {createPromotionMutation.isPending ||
              updatePromotionMutation.isPending
                ? 'Submitting...'
                : 'Submit'}
            </Button>
          </Box>
        </form>
      </Box>
    </CustomDrawer>
  );
};

export default UpdatedManagePromotion;
