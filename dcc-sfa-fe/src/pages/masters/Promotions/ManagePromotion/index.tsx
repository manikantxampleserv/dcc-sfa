import {
  Alert,
  Box,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Skeleton,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import { useCustomers } from 'hooks/useCustomers';
import { useCustomerTypes } from 'hooks/useCustomerType';
import { useCustomerCategories } from 'hooks/useCustomerCategory';
import { useCustomerChannels } from 'hooks/useCustomerChannel';
import { useDepots } from 'hooks/useDepots';
import { useProductCategories } from 'hooks/useProductCategories';
import { useProducts } from 'hooks/useProducts';
import { useUsers } from 'hooks/useUsers';
import {
  useCreatePromotion,
  usePromotion,
  useUpdatePromotion,
  type Promotion,
} from 'hooks/usePromotions';
import { useRoutes } from 'hooks/useRoutes';
import { useUnitOfMeasurement } from 'hooks/useUnitOfMeasurement';
import { useZones } from 'hooks/useZones';
import React, { useEffect, useRef, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import ProductCategorySelect from 'shared/ProductCategorySelect';
import ProductSelect from 'shared/ProductSelect';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import Table from 'shared/Table';
import * as Yup from 'yup';

interface ManagePromotionProps {
  selectedPromotion?: Promotion | null;
  setSelectedPromotion: (promotion: Promotion | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

interface ProductCondition {
  _index: number;
  id?: number;
  product_id?: number;
  product_group?: string;
  min_quantity?: number;
  unit?: string;
  type?: string;
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
  product_name?: string;
  product_group?: string;
  benefit_value?: number;
  gift_limit?: number;
}

const QUANTITY_TYPES = ['Price', 'Quantity'];
const GIFT_TYPES = ['Free Product', 'Percent', 'Amount'];
const PAY_TYPES = ['Cash', 'Credit', 'Both'];
const SCOPE_TYPES = ['(B) Distributor Channel', '(C) Customer Channel'];
const SLIP_TYPES = ['All', 'Invoice', 'Waybill', 'Order'];
const PROM_CONFLICT_TYPES = ['Normal', 'Exclusive', 'Priority'];
const REG_DISC_CONF_TYPES = ['Normal', 'Override', 'Combine'];

const promotionValidationSchema = Yup.object({
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

const ManagePromotion: React.FC<ManagePromotionProps> = ({
  selectedPromotion,
  setSelectedPromotion,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedPromotion;

  const { data: promotionDetailResponse, isLoading: isLoadingPromotion } =
    usePromotion(selectedPromotion?.id || null);

  const { data: productsResponse } = useProducts({ limit: 1000 });
  const products = productsResponse?.data || [];

  const { data: depotsResponse } = useDepots({ limit: 1000 });
  const depots = depotsResponse?.data || [];

  const { data: zonesResponse } = useZones({ limit: 1000 });
  const zones = zonesResponse?.data || [];

  const { data: customersResponse } = useCustomers({ limit: 1000 });
  const customers = customersResponse?.data || [];

  const { data: customerTypesResponse } = useCustomerTypes({ limit: 1000 });
  const customerTypes = customerTypesResponse?.data || [];

  const { data: customerCategoriesResponse } = useCustomerCategories({
    limit: 1000,
  });
  const customerCategories = customerCategoriesResponse?.data || [];

  const { data: customerChannelsResponse } = useCustomerChannels({
    limit: 1000,
  });
  const customerChannels = customerChannelsResponse?.data || [];

  const { data: routesResponse } = useRoutes({ limit: 1000 });
  const routes = routesResponse?.data || [];

  const { data: usersResponse } = useUsers({ limit: 1000 });
  const users = usersResponse?.data || [];

  const { data: productCategoriesResponse } = useProductCategories({
    limit: 1000,
  });

  const productCategories = productCategoriesResponse?.data || [];

  const { data: unitsResponse } = useUnitOfMeasurement({ limit: 1000 });
  const units = unitsResponse?.data || [];

  const createPromotionMutation = useCreatePromotion();
  const updatePromotionMutation = useUpdatePromotion();

  const [productConditions, setProductConditions] = useState<
    ProductCondition[]
  >([]);
  const [outletRows, setOutletRows] = useState<OutletRow[]>([]);
  const [giftRows, setGiftRows] = useState<GiftRow[]>([]);
  const [locationTab, setLocationTab] = useState(0);
  const [selectedDepots, setSelectedDepots] = useState<number[]>([]);
  const [selectedZones, setSelectedZones] = useState<number[]>([]);
  const [selectedRoutes, setSelectedRoutes] = useState<number[]>([]);
  const [selectedSalesPersons, setSelectedSalesPersons] = useState<number[]>(
    []
  );
  const [selectedOutlets, setSelectedOutlets] = useState<number[]>([]);
  const [selectedCustomerTypes, setSelectedCustomerTypes] = useState<number[]>(
    []
  );
  const [selectedCustomerCategories, setSelectedCustomerCategories] = useState<
    number[]
  >([]);
  const [selectedCustomerChannels, setSelectedCustomerChannels] = useState<
    number[]
  >([]);
  const [locationSearch, setLocationSearch] = useState('');

  const [selectedProductConditionIndex, setSelectedProductConditionIndex] =
    useState<number | null>(null);
  const [conditionProductTab, setConditionProductTab] = useState(0);
  const [selectedConditionType, setSelectedConditionType] =
    useState<string>('Price');

  const [giftProductTab, setGiftProductTab] = useState(0);
  const [giftName, setGiftName] = useState('');
  const [giftNameDisplay, setGiftNameDisplay] = useState('');
  const [giftApplication, setGiftApplication] = useState('n. Prod. Gr.');
  const [discAmount, setDiscAmount] = useState('');
  const [maximumAmount, setMaximumAmount] = useState('');
  const [selectedGiftType, setSelectedGiftType] =
    useState<string>('Free Product');
  const [discAmountError, setDiscAmountError] = useState<string>('');
  const [selectedGiftIndex, setSelectedGiftIndex] = useState<number | null>(
    null
  );
  const [productConditionForm, setProductConditionForm] = useState<{
    group: string;
    product: string;
    at_least: string;
    unit?: string;
  }>({
    group: '',
    product: '',
    at_least: '',
    unit: 'unit',
  });
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const errorAlertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!promotionDetailResponse?.data || !isEdit) {
      setProductConditions(prev => (prev.length > 0 ? [] : prev));
      setOutletRows(prev => (prev.length > 0 ? [] : prev));
      setGiftRows(prev => (prev.length > 0 ? [] : prev));
      setSelectedDepots(prev => (prev.length > 0 ? [] : prev));
      setSelectedZones(prev => (prev.length > 0 ? [] : prev));
      setSelectedRoutes(prev => (prev.length > 0 ? [] : prev));
      setSelectedOutlets(prev => (prev.length > 0 ? [] : prev));
      setSelectedCustomerTypes(prev => (prev.length > 0 ? [] : prev));
      setSelectedCustomerCategories(prev => (prev.length > 0 ? [] : prev));
      setSelectedCustomerChannels(prev => (prev.length > 0 ? [] : prev));
      return;
    }

    const promotion = promotionDetailResponse.data;

    if (promotion.conditions && Array.isArray(promotion.conditions)) {
      const loadedConditions: ProductCondition[] = [];
      promotion.conditions.forEach((condition: any, idx: number) => {
        if (
          condition.promotion_condition_products &&
          Array.isArray(condition.promotion_condition_products) &&
          condition.promotion_condition_products.length > 0
        ) {
          const conditionProduct = condition.promotion_condition_products[0];
          loadedConditions.push({
            _index: idx,
            id: condition.id,
            product_id: conditionProduct.product_id || undefined,
            product_group: conditionProduct.product_group || undefined,
            min_quantity: Number(conditionProduct.condition_quantity) || 0,
            unit: 'unit',
            type:
              condition.condition_type === 'PRICE'
                ? 'Price'
                : condition.condition_type === 'QUANTITY'
                  ? 'Quantity'
                  : 'Quantity',
          });
        }
      });
      setProductConditions(prev => {
        const prevStr = JSON.stringify(prev);
        const newStr = JSON.stringify(loadedConditions);
        return prevStr !== newStr ? loadedConditions : prev;
      });
    } else {
      setProductConditions(prev => (prev.length > 0 ? [] : prev));
    }

    const loadedDepotIds: number[] = [];
    if (promotion.depots && Array.isArray(promotion.depots)) {
      promotion.depots.forEach((depot: any) => {
        if (depot.depot_id) {
          loadedDepotIds.push(depot.depot_id);
        }
      });
    }
    setSelectedDepots(prev => {
      const prevStr = prev.sort().join(',');
      const newStr = loadedDepotIds.sort().join(',');
      return prevStr !== newStr ? loadedDepotIds : prev;
    });

    const loadedRouteIds: number[] = [];
    if (promotion.routes && Array.isArray(promotion.routes)) {
      promotion.routes.forEach((route: any) => {
        if (route.route_id) {
          loadedRouteIds.push(route.route_id);
        }
      });
    }
    setSelectedRoutes(prev => {
      const prevStr = prev.sort().join(',');
      const newStr = loadedRouteIds.sort().join(',');
      return prevStr !== newStr ? loadedRouteIds : prev;
    });

    const loadedSalespersonIds: number[] = [];
    if (promotion.salespersons && Array.isArray(promotion.salespersons)) {
      promotion.salespersons.forEach((salesperson: any) => {
        if (salesperson.salesperson_id) {
          loadedSalespersonIds.push(salesperson.salesperson_id);
        }
      });
    }
    setSelectedSalesPersons(prev => {
      const prevStr = prev.sort().join(',');
      const newStr = loadedSalespersonIds.sort().join(',');
      return prevStr !== newStr ? loadedSalespersonIds : prev;
    });

    const loadedZoneIds: number[] = [];
    if (promotion.zones && Array.isArray(promotion.zones)) {
      promotion.zones.forEach((zone: any) => {
        if (zone.zone_id) {
          loadedZoneIds.push(zone.zone_id);
        }
      });
    }
    setSelectedZones(prev => {
      const prevStr = prev.sort().join(',');
      const newStr = loadedZoneIds.sort().join(',');
      return prevStr !== newStr ? loadedZoneIds : prev;
    });

    if (
      promotion.customer_exclusions &&
      Array.isArray(promotion.customer_exclusions)
    ) {
      const loadedOutletIds: number[] = [];
      promotion.customer_exclusions.forEach((exclusion: any) => {
        if (exclusion.customer_id) {
          loadedOutletIds.push(exclusion.customer_id);
        }
      });
      setSelectedOutlets(prev => {
        const prevStr = prev.sort().join(',');
        const newStr = loadedOutletIds.sort().join(',');
        return prevStr !== newStr ? loadedOutletIds : prev;
      });
    } else {
      setSelectedOutlets(prev => (prev.length > 0 ? [] : prev));
    }

    if (
      promotion.customer_categories &&
      Array.isArray(promotion.customer_categories)
    ) {
      const loadedCategoryIds: number[] = [];
      promotion.customer_categories.forEach((category: any) => {
        if (category.customer_category_id) {
          loadedCategoryIds.push(category.customer_category_id);
        }
      });

      setSelectedCustomerCategories(prev => {
        const prevStr = prev.sort().join(',');
        const newStr = loadedCategoryIds.sort().join(',');
        return prevStr !== newStr ? loadedCategoryIds : prev;
      });

      const loadedOutletRows: OutletRow[] = [];
      loadedCategoryIds.forEach((categoryId, idx) => {
        loadedOutletRows.push({
          _index: idx,
          id: categoryId,
          outlet_condition: 'Distributor',
          dist: '',
          outlet_value: '',
          start: promotion.start_date
            ? new Date(promotion.start_date).toISOString().split('T')[0]
            : '',
          finish: promotion.end_date
            ? new Date(promotion.end_date).toISOString().split('T')[0]
            : '',
          group: categoryId.toString(),
          distributor_id:
            loadedDepotIds.length > 0 ? loadedDepotIds[0].toString() : '',
        });
      });
      setOutletRows(prev => {
        const prevStr = JSON.stringify(prev);
        const newStr = JSON.stringify(loadedOutletRows);
        return prevStr !== newStr ? loadedOutletRows : prev;
      });
    } else {
      setOutletRows(prev => (prev.length > 0 ? [] : prev));
      setSelectedCustomerCategories(prev => (prev.length > 0 ? [] : prev));
    }

    const loadedCustomerTypeIds: number[] = [];
    if (promotion.customer_types && Array.isArray(promotion.customer_types)) {
      promotion.customer_types.forEach((customerType: any) => {
        if (customerType.customer_type_id) {
          loadedCustomerTypeIds.push(customerType.customer_type_id);
        }
      });
    }
    setSelectedCustomerTypes(prev => {
      const prevStr = prev.sort().join(',');
      const newStr = loadedCustomerTypeIds.sort().join(',');
      return prevStr !== newStr ? loadedCustomerTypeIds : prev;
    });

    const loadedCustomerChannelIds: number[] = [];
    if (
      promotion.customer_channels &&
      Array.isArray(promotion.customer_channels)
    ) {
      promotion.customer_channels.forEach((customerChannel: any) => {
        if (customerChannel.customer_channel_id) {
          loadedCustomerChannelIds.push(customerChannel.customer_channel_id);
        }
      });
    }
    setSelectedCustomerChannels(prev => {
      const prevStr = prev.sort().join(',');
      const newStr = loadedCustomerChannelIds.sort().join(',');
      return prevStr !== newStr ? loadedCustomerChannelIds : prev;
    });

    if (promotion.levels && Array.isArray(promotion.levels)) {
      const loadedGiftRows: GiftRow[] = [];
      promotion.levels.forEach((level: any) => {
        if (
          level.promotion_benefit_level &&
          Array.isArray(level.promotion_benefit_level)
        ) {
          level.promotion_benefit_level.forEach((benefit: any) => {
            if (benefit.product_id) {
              const benefitType =
                benefit.benefit_type === 'FREE_PRODUCT'
                  ? 'Free Product'
                  : benefit.benefit_type === 'PERCENT'
                    ? 'Percent'
                    : 'Amount';
              loadedGiftRows.push({
                _index: loadedGiftRows.length,
                id: benefit.id,
                level_id: level.id,
                type: benefitType,
                application: benefit.condition_type || 'n. Prod. Gr.',
                gift: `${benefit.benefit_value || ''} ${benefit.promotion_benefit_products?.name || ''}`,
                product_id: benefit.product_id,
                product_name: benefit.promotion_benefit_products?.name || '',
                benefit_value: Number(benefit.benefit_value) || 0,
                gift_limit: Number(benefit.gift_limit) || 0,
              });
            }
          });
        }
      });
      setGiftRows(prev => {
        const prevStr = JSON.stringify(prev);
        const newStr = JSON.stringify(loadedGiftRows);
        return prevStr !== newStr ? loadedGiftRows : prev;
      });
    } else {
      setGiftRows(prev => (prev.length > 0 ? [] : prev));
    }
  }, [promotionDetailResponse?.data?.id, isEdit]);

  const resetProductConditionForm = () => {
    setProductConditionForm({
      group: '',
      product: '',
      at_least: '0',
      unit: 'unit',
    });
    setSelectedConditionType('Price');
    setConditionProductTab(0);
  };

  const handleCancel = () => {
    setSelectedPromotion(null);
    setDrawerOpen(false);
    setProductConditions([]);
    setOutletRows([]);
    setGiftRows([]);
    setSelectedProductConditionIndex(null);
    setSelectedGiftIndex(null);
    setSelectedDepots([]);
    setSelectedZones([]);
    setSelectedRoutes([]);
    setSelectedSalesPersons([]);
    setSelectedOutlets([]);
    setSelectedCustomerTypes([]);
    setSelectedCustomerCategories([]);
    setSelectedCustomerChannels([]);
    setDiscAmount('');
    setMaximumAmount('');
    setGiftName('');
    setGiftNameDisplay('');
    setGiftApplication('n. Prod. Gr.');
    setDiscAmountError('');
    setSelectedConditionType('Price');
    setConditionProductTab(0);
    resetProductConditionForm();
  };

  const formik = useFormik({
    initialValues: {
      name: selectedPromotion?.name || '',
      short_name: selectedPromotion?.name || '',
      code: selectedPromotion?.code || '',
      pay_type: 'Cash',
      scope: '(B) Distributor Channel',
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
      quantity_type: 'Price',
      description: selectedPromotion?.description || '',
      is_active: selectedPromotion?.is_active || 'Y',
    },
    validationSchema: promotionValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const getUniqueIds = (
          rows: OutletRow[],
          field: 'distributor_id' | 'group'
        ) =>
          Array.from(
            new Set(rows.filter(r => r[field]).map(r => Number(r[field])))
          );

        const outletDepotIds = getUniqueIds(outletRows, 'distributor_id');
        const allDepotIds = Array.from(
          new Set([...selectedDepots, ...outletDepotIds])
        );
        const locationAreas = allDepotIds.length > 0 ? allDepotIds : undefined;
        const outletGroupsFromRows = getUniqueIds(outletRows, 'group');
        const allCustomerCategories = Array.from(
          new Set([...selectedCustomerCategories, ...outletGroupsFromRows])
        );
        const outletGroups =
          allCustomerCategories.length > 0 ? allCustomerCategories : undefined;
        const routes = selectedRoutes.length > 0 ? selectedRoutes : undefined;
        const zones = selectedZones.length > 0 ? selectedZones : undefined;
        const salespersons =
          selectedSalesPersons.length > 0 ? selectedSalesPersons : undefined;
        const customerExclusions =
          selectedOutlets.length > 0 ? selectedOutlets : undefined;
        const customerTypes =
          selectedCustomerTypes.length > 0 ? selectedCustomerTypes : undefined;
        const customerChannels =
          selectedCustomerChannels.length > 0
            ? selectedCustomerChannels
            : undefined;

        const productConditionsData = productConditions
          .filter(c => c.product_id || c.product_group)
          .map(c => {
            const product = c.product_id
              ? products.find(p => p.id === c.product_id)
              : null;
            const defaultCategoryId =
              productCategories.length > 0 ? productCategories[0].id : null;
            return {
              product_id: c.product_group ? undefined : c.product_id,
              category_id: product?.category_id || defaultCategoryId,
              product_group: c.product_group || undefined,
              min_quantity: c.min_quantity || 0,
              min_value: c.min_quantity || 0,
              quantity_type: (c.type || 'Quantity').toUpperCase(),
            };
          });

        const giftBenefits = giftRows
          .filter(g => g.product_id)
          .map(g => ({
            benefit_type:
              g.type === 'Free Product'
                ? 'FREE_PRODUCT'
                : g.type === 'Percent'
                  ? 'PERCENT'
                  : 'AMOUNT',
            product_id: g.product_id,
            benefit_value: g.benefit_value || 0,
            condition_type: g.application || undefined,
            gift_limit: g.gift_limit || 0,
          }));

        const promotionData = {
          name: values.name,
          description: values.description || undefined,
          start_date: values.start_date,
          end_date: values.finish_date,
          platforms: ['Mobile'],
          quantity_type: (values.quantity_type || 'QUANTITY').toUpperCase(),
          product_conditions:
            productConditionsData.length > 0
              ? productConditionsData
              : undefined,
          location_areas: locationAreas,
          routes: routes,
          zones: zones,
          salespersons: salespersons,
          customer_exclusions: customerExclusions,
          outlet1_groups: outletGroups,
          customer_types: customerTypes,
          customer_channels: customerChannels,
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
          const updateOutletDepotIds = getUniqueIds(
            outletRows,
            'distributor_id'
          );
          const updateAllDepotIds = Array.from(
            new Set([...selectedDepots, ...updateOutletDepotIds])
          );
          const updateLocationAreas =
            updateAllDepotIds.length > 0 ? updateAllDepotIds : undefined;
          const updateOutletGroupsFromRows = getUniqueIds(outletRows, 'group');
          const updateAllCustomerCategories = Array.from(
            new Set([
              ...selectedCustomerCategories,
              ...updateOutletGroupsFromRows,
            ])
          );
          const updateOutletGroups =
            updateAllCustomerCategories.length > 0
              ? updateAllCustomerCategories
              : undefined;
          const updateRoutes =
            selectedRoutes.length > 0 ? selectedRoutes : undefined;
          const updateZones =
            selectedZones.length > 0 ? selectedZones : undefined;
          const updateSalespersons =
            selectedSalesPersons.length > 0 ? selectedSalesPersons : undefined;
          const updateCustomerExclusions =
            selectedOutlets.length > 0 ? selectedOutlets : undefined;
          const updateCustomerTypes =
            selectedCustomerTypes.length > 0
              ? selectedCustomerTypes
              : undefined;
          const updateCustomerChannels =
            selectedCustomerChannels.length > 0
              ? selectedCustomerChannels
              : undefined;

          await updatePromotionMutation.mutateAsync({
            id: selectedPromotion.id,
            data: {
              name: values.name,
              start_date: values.start_date,
              end_date: values.finish_date,
              description: values.description || undefined,
              is_active: values.is_active,
              platforms: ['Mobile'],
              quantity_type: (values.quantity_type || 'QUANTITY').toUpperCase(),
              product_conditions:
                productConditionsData.length > 0
                  ? productConditionsData
                  : undefined,
              location_areas: updateLocationAreas,
              routes: updateRoutes,
              zones: updateZones,
              salespersons: updateSalespersons,
              customer_exclusions: updateCustomerExclusions,
              outlet1_groups: updateOutletGroups,
              customer_types: updateCustomerTypes,
              customer_channels: updateCustomerChannels,
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
            },
          });
        } else {
          await createPromotionMutation.mutateAsync(promotionData);
        }

        handleCancel();
        setSelectedDepots([]);
        setSelectedZones([]);
        setSelectedRoutes([]);
        setSelectedSalesPersons([]);
        setSelectedOutlets([]);
        setSelectedCustomerTypes([]);
        setSelectedCustomerCategories([]);
        setSelectedCustomerChannels([]);
      } catch (error) {
        console.error('Error saving promotion:', error);
      }
    },
  });

  const addProductCondition = () => {
    if (!productConditionForm.group && !productConditionForm.product) {
      setValidationErrors({
        ...validationErrors,
        productCondition_new: 'Product or Product Category must be selected',
      });
      setTimeout(() => {
        errorAlertRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
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
      setTimeout(() => {
        errorAlertRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
      return;
    }
    const newCondition: ProductCondition = {
      _index: productConditions.length,
      product_group: productConditionForm.group,
      product_id: productConditionForm.product
        ? parseInt(productConditionForm.product)
        : undefined,
      min_quantity: parseFloat(productConditionForm.at_least) || 0,
      unit:
        selectedConditionType === 'Quantity'
          ? productConditionForm.unit
          : undefined,
      type: selectedConditionType,
    };
    setProductConditions([...productConditions, newCondition]);
    resetProductConditionForm();
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
      >
        <Box className="!p-4">
          <Box className="!grid !grid-cols-2 !gap-3">
            <Paper className="!p-3 !rounded-lg !shadow-sm !border !bg-white !border-gray-200">
              <Skeleton
                variant="text"
                width="60%"
                height={28}
                className="!mb-2"
              />
              <Box className="!grid !grid-cols-2 !gap-4">
                <Skeleton
                  variant="rectangular"
                  height={56}
                  className="!rounded"
                />
                <Skeleton
                  variant="rectangular"
                  height={56}
                  className="!rounded"
                />
                <Skeleton
                  variant="rectangular"
                  height={56}
                  className="!rounded"
                />
                <Skeleton
                  variant="rectangular"
                  height={56}
                  className="!rounded"
                />
                <Skeleton
                  variant="rectangular"
                  height={56}
                  className="!rounded"
                />
                <Skeleton
                  variant="rectangular"
                  height={56}
                  className="!rounded"
                />
                <Skeleton
                  variant="rectangular"
                  height={56}
                  className="!rounded"
                />
                <Skeleton
                  variant="rectangular"
                  height={56}
                  className="!rounded"
                />
                <Skeleton
                  variant="rectangular"
                  height={56}
                  className="!rounded"
                />
                <Skeleton
                  variant="rectangular"
                  height={56}
                  className="!rounded"
                />
                <Skeleton
                  variant="rectangular"
                  height={56}
                  className="!rounded"
                />
                <Skeleton
                  variant="rectangular"
                  height={56}
                  className="!rounded"
                />
                <Skeleton
                  variant="rectangular"
                  height={56}
                  className="!rounded"
                />
                <Skeleton
                  variant="rectangular"
                  height={56}
                  className="!rounded"
                />
              </Box>
            </Paper>

            <Paper className="!p-3 !rounded-lg !shadow-sm !border !bg-white !border-gray-200">
              <Skeleton
                variant="text"
                width="50%"
                height={28}
                className="!mb-2"
              />
              <Skeleton
                variant="rectangular"
                height={48}
                className="!rounded !mb-3"
              />
              <Skeleton
                variant="rectangular"
                height={40}
                className="!rounded !mb-3"
              />
              <Box className="!max-h-64 !overflow-hidden !border !border-gray-200 !rounded !p-2">
                <Skeleton
                  variant="rectangular"
                  height={32}
                  className="!rounded !mb-2"
                />
                <Skeleton
                  variant="rectangular"
                  height={32}
                  className="!rounded !mb-2"
                />
                <Skeleton
                  variant="rectangular"
                  height={32}
                  className="!rounded !mb-2"
                />
                <Skeleton
                  variant="rectangular"
                  height={32}
                  className="!rounded !mb-2"
                />
                <Skeleton
                  variant="rectangular"
                  height={32}
                  className="!rounded !mb-2"
                />
              </Box>
            </Paper>

            <Paper className="!p-3 !rounded-lg !shadow-sm !border !bg-white !border-gray-200">
              <Skeleton
                variant="text"
                width="70%"
                height={28}
                className="!mb-2"
              />
              <Box className="!mb-2">
                <Skeleton
                  variant="text"
                  width="30%"
                  height={20}
                  className="!mb-1"
                />
                <Box className="!flex !gap-4">
                  <Skeleton
                    variant="rectangular"
                    width={100}
                    height={40}
                    className="!rounded"
                  />
                  <Skeleton
                    variant="rectangular"
                    width={100}
                    height={40}
                    className="!rounded"
                  />
                  <Skeleton
                    variant="rectangular"
                    width={100}
                    height={40}
                    className="!rounded"
                  />
                </Box>
              </Box>
              <Box className="!space-y-2 !mt-2">
                <Box className="!grid !grid-cols-2 !gap-4">
                  <Skeleton
                    variant="rectangular"
                    height={40}
                    className="!rounded"
                  />
                  <Skeleton
                    variant="rectangular"
                    height={40}
                    className="!rounded"
                  />
                  <Skeleton
                    variant="rectangular"
                    height={40}
                    className="!rounded"
                  />
                  <Skeleton
                    variant="rectangular"
                    height={40}
                    className="!rounded"
                  />
                </Box>
                <Box className="!flex !gap-2">
                  <Skeleton
                    variant="rectangular"
                    width={80}
                    height={36}
                    className="!rounded"
                  />
                  <Skeleton
                    variant="rectangular"
                    width={80}
                    height={36}
                    className="!rounded"
                  />
                  <Skeleton
                    variant="rectangular"
                    width={80}
                    height={36}
                    className="!rounded"
                  />
                </Box>
              </Box>
            </Paper>

            <Paper className="!p-3 !rounded-lg !shadow-sm !border !bg-white !border-gray-200">
              <Skeleton
                variant="text"
                width="40%"
                height={28}
                className="!mb-2"
              />
              <Box className="!mb-4">
                <Skeleton
                  variant="text"
                  width="20%"
                  height={20}
                  className="!mb-1"
                />
                <Box className="!flex !gap-4">
                  <Skeleton
                    variant="rectangular"
                    width={120}
                    height={40}
                    className="!rounded"
                  />
                  <Skeleton
                    variant="rectangular"
                    width={120}
                    height={40}
                    className="!rounded"
                  />
                  <Skeleton
                    variant="rectangular"
                    width={120}
                    height={40}
                    className="!rounded"
                  />
                </Box>
              </Box>
              <Box className="!space-y-4 !mt-2">
                <Box className="!grid !grid-cols-2 !gap-4">
                  <Skeleton
                    variant="rectangular"
                    height={40}
                    className="!rounded"
                  />
                  <Skeleton
                    variant="rectangular"
                    height={40}
                    className="!rounded"
                  />
                </Box>
                <Skeleton
                  variant="rectangular"
                  height={48}
                  className="!rounded"
                />
                <Skeleton
                  variant="rectangular"
                  height={40}
                  className="!rounded"
                />
                <Box className="!flex !gap-2">
                  <Skeleton
                    variant="rectangular"
                    width={80}
                    height={36}
                    className="!rounded"
                  />
                  <Skeleton
                    variant="rectangular"
                    width={80}
                    height={36}
                    className="!rounded"
                  />
                  <Skeleton
                    variant="rectangular"
                    width={80}
                    height={36}
                    className="!rounded"
                  />
                </Box>
              </Box>
            </Paper>
          </Box>
          <Box className="!mt-2 !flex !gap-2 !justify-end !col-span-2">
            <Skeleton
              variant="rectangular"
              width={100}
              height={40}
              className="!rounded"
            />
            <Skeleton
              variant="rectangular"
              width={100}
              height={40}
              className="!rounded"
            />
          </Box>
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
    >
      <Box className="!p-4">
        {Object.keys(validationErrors).length > 0 && (
          <Box ref={errorAlertRef}>
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
          </Box>
        )}
        <form
          onSubmit={formik.handleSubmit}
          className="!grid !grid-cols-2 !gap-3"
        >
          <Paper className="!p-3 !rounded-lg !shadow-sm !border !bg-white !border-gray-200">
            <Typography
              variant="h6"
              className="!font-semibold !text-gray-900 !mb-2 !text-base"
            >
              Header Information
            </Typography>
            <Box className="!grid !grid-cols-2 !gap-4">
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
              {/* <FormControlLabel
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
              /> */}
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
            </Box>
          </Paper>

          <Paper className="!p-3 !rounded-lg !shadow-sm !border !bg-white !border-gray-200">
            <Typography
              variant="h6"
              className="!font-semibold !text-gray-900 !mb-2 !text-base"
            >
              Suitable Outlets
            </Typography>
            <Box className="!mb-3 !border !border-gray-400/50 !rounded">
              <Tabs
                value={locationTab}
                onChange={(_, newValue) => {
                  setLocationTab(newValue);
                  setLocationSearch('');
                }}
                variant="scrollable"
                scrollButtons="auto"
                className="!min-h-9.5"
              >
                <Tab
                  label={`Depots ${selectedDepots.length > 0 ? `(${selectedDepots.length})` : ''}`}
                  className="!min-h-9.5"
                />
                <Tab
                  label={`Zones ${selectedZones.length > 0 ? `(${selectedZones.length})` : ''}`}
                  className="!min-h-9.5"
                />
                <Tab
                  label={`Routes ${selectedRoutes.length > 0 ? `(${selectedRoutes.length})` : ''}`}
                  className="!min-h-9.5"
                />

                <Tab
                  label={`Sales Persons ${selectedSalesPersons.length > 0 ? `(${selectedSalesPersons.length})` : ''}`}
                  className="!min-h-9.5"
                />
                <Tab
                  label={`Outlet ${selectedOutlets.length > 0 ? `(${selectedOutlets.length})` : ''}`}
                  className="!min-h-9.5"
                />
                <Tab
                  label={`Customer Type ${selectedCustomerTypes.length > 0 ? `(${selectedCustomerTypes.length})` : ''}`}
                  className="!min-h-9.5"
                />
                <Tab
                  label={`Customer Category ${selectedCustomerCategories.length > 0 ? `(${selectedCustomerCategories.length})` : ''}`}
                  className="!min-h-9.5"
                />
                <Tab
                  label={`Customer Channel ${selectedCustomerChannels.length > 0 ? `(${selectedCustomerChannels.length})` : ''}`}
                  className="!min-h-9.5"
                />
              </Tabs>
            </Box>
            <Box className="!mb-3">
              <SearchInput
                value={locationSearch}
                onChange={setLocationSearch}
                placeholder={`Search ${locationTab === 0 ? 'Depots' : locationTab === 1 ? 'Zones' : locationTab === 2 ? 'Routes' : locationTab === 3 ? 'Sales Persons' : locationTab === 4 ? 'Outlets' : locationTab === 5 ? 'Customer Types' : locationTab === 6 ? 'Customer Categories' : 'Customer Channels'}...`}
                fullWidth
                size="small"
                debounceMs={0}
              />
            </Box>
            <Box className="!max-h-64 !overflow-y-auto !border !border-gray-200 !rounded !pl-4 !p-2">
              {locationTab === 0 && (
                <>
                  {depots
                    .filter((depot: any) =>
                      locationSearch
                        ? depot.name
                            ?.toLowerCase()
                            .includes(locationSearch.toLowerCase()) ||
                          depot.code
                            ?.toLowerCase()
                            .includes(locationSearch.toLowerCase())
                        : true
                    )
                    .map((depot: any) => (
                      <FormControlLabel
                        key={depot.id}
                        control={
                          <Checkbox
                            checked={selectedDepots.includes(depot.id)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedDepots([
                                  ...selectedDepots,
                                  depot.id,
                                ]);
                              } else {
                                setSelectedDepots(
                                  selectedDepots.filter(id => id !== depot.id)
                                );
                              }
                            }}
                            size="small"
                          />
                        }
                        label={`${depot.name} (${depot.code})`}
                        className="!block"
                      />
                    ))}
                </>
              )}
              {locationTab === 1 && (
                <>
                  {zones
                    .filter((zone: any) =>
                      locationSearch
                        ? zone.name
                            ?.toLowerCase()
                            .includes(locationSearch.toLowerCase())
                        : true
                    )
                    .map((zone: any) => (
                      <FormControlLabel
                        key={zone.id}
                        control={
                          <Checkbox
                            checked={selectedZones.includes(zone.id)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedZones([...selectedZones, zone.id]);
                              } else {
                                setSelectedZones(
                                  selectedZones.filter(id => id !== zone.id)
                                );
                              }
                            }}
                            size="small"
                          />
                        }
                        label={zone.name}
                        className="!block"
                      />
                    ))}
                </>
              )}
              {locationTab === 2 && (
                <>
                  {routes
                    .filter((route: any) =>
                      locationSearch
                        ? route.name
                            ?.toLowerCase()
                            .includes(locationSearch.toLowerCase()) ||
                          route.code
                            ?.toLowerCase()
                            .includes(locationSearch.toLowerCase())
                        : true
                    )
                    .map((route: any) => (
                      <FormControlLabel
                        key={route.id}
                        control={
                          <Checkbox
                            checked={selectedRoutes.includes(route.id)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedRoutes([
                                  ...selectedRoutes,
                                  route.id,
                                ]);
                              } else {
                                setSelectedRoutes(
                                  selectedRoutes.filter(id => id !== route.id)
                                );
                              }
                            }}
                            size="small"
                          />
                        }
                        label={`${route.name || route.code || `Route ${route.id}`} ${route.code ? `(${route.code})` : ''}`}
                        className="!block"
                      />
                    ))}
                </>
              )}
              {locationTab === 3 && (
                <>
                  {users
                    .filter((user: any) =>
                      locationSearch
                        ? user.name
                            ?.toLowerCase()
                            .includes(locationSearch.toLowerCase()) ||
                          user.email
                            ?.toLowerCase()
                            .includes(locationSearch.toLowerCase())
                        : true
                    )
                    .map((user: any) => (
                      <FormControlLabel
                        key={user.id}
                        control={
                          <Checkbox
                            checked={selectedSalesPersons.includes(user.id)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedSalesPersons([
                                  ...selectedSalesPersons,
                                  user.id,
                                ]);
                              } else {
                                setSelectedSalesPersons(
                                  selectedSalesPersons.filter(
                                    id => id !== user.id
                                  )
                                );
                              }
                            }}
                            size="small"
                          />
                        }
                        label={`${user.name} ${user.email ? `(${user.email})` : ''}`}
                        className="!block"
                      />
                    ))}
                </>
              )}
              {locationTab === 4 && (
                <>
                  {customers
                    .filter((customer: any) =>
                      locationSearch
                        ? customer.name
                            ?.toLowerCase()
                            .includes(locationSearch.toLowerCase()) ||
                          customer.code
                            ?.toLowerCase()
                            .includes(locationSearch.toLowerCase())
                        : true
                    )
                    .map((customer: any) => (
                      <FormControlLabel
                        key={customer.id}
                        control={
                          <Checkbox
                            checked={selectedOutlets.includes(customer.id)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedOutlets([
                                  ...selectedOutlets,
                                  customer.id,
                                ]);
                              } else {
                                setSelectedOutlets(
                                  selectedOutlets.filter(
                                    id => id !== customer.id
                                  )
                                );
                              }
                            }}
                            size="small"
                          />
                        }
                        label={`${customer.name} (${customer.code})`}
                        className="!block"
                      />
                    ))}
                </>
              )}
              {locationTab === 5 && (
                <>
                  {customerTypes
                    .filter((customerType: any) =>
                      locationSearch
                        ? customerType.type_name
                            ?.toLowerCase()
                            .includes(locationSearch.toLowerCase()) ||
                          customerType.type_code
                            ?.toLowerCase()
                            .includes(locationSearch.toLowerCase())
                        : true
                    )
                    .map((customerType: any) => (
                      <FormControlLabel
                        key={customerType.id}
                        control={
                          <Checkbox
                            checked={selectedCustomerTypes.includes(
                              customerType.id
                            )}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedCustomerTypes([
                                  ...selectedCustomerTypes,
                                  customerType.id,
                                ]);
                              } else {
                                setSelectedCustomerTypes(
                                  selectedCustomerTypes.filter(
                                    id => id !== customerType.id
                                  )
                                );
                              }
                            }}
                            size="small"
                          />
                        }
                        label={`${customerType.type_name} (${customerType.type_code})`}
                        className="!block"
                      />
                    ))}
                </>
              )}
              {locationTab === 6 && (
                <>
                  {customerCategories
                    .filter((category: any) =>
                      locationSearch
                        ? category.category_name
                            ?.toLowerCase()
                            .includes(locationSearch.toLowerCase()) ||
                          category.category_code
                            ?.toLowerCase()
                            .includes(locationSearch.toLowerCase())
                        : true
                    )
                    .map((category: any) => (
                      <FormControlLabel
                        key={category.id}
                        control={
                          <Checkbox
                            checked={selectedCustomerCategories.includes(
                              category.id
                            )}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedCustomerCategories([
                                  ...selectedCustomerCategories,
                                  category.id,
                                ]);
                              } else {
                                setSelectedCustomerCategories(
                                  selectedCustomerCategories.filter(
                                    id => id !== category.id
                                  )
                                );
                              }
                            }}
                            size="small"
                          />
                        }
                        label={`${category.category_name} (${category.category_code})`}
                        className="!block"
                      />
                    ))}
                </>
              )}
              {locationTab === 7 && (
                <>
                  {customerChannels
                    .filter((channel: any) =>
                      locationSearch
                        ? channel.channel_name
                            ?.toLowerCase()
                            .includes(locationSearch.toLowerCase()) ||
                          channel.channel_code
                            ?.toLowerCase()
                            .includes(locationSearch.toLowerCase())
                        : true
                    )
                    .map((channel: any) => (
                      <FormControlLabel
                        key={channel.id}
                        control={
                          <Checkbox
                            checked={selectedCustomerChannels.includes(
                              channel.id
                            )}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedCustomerChannels([
                                  ...selectedCustomerChannels,
                                  channel.id,
                                ]);
                              } else {
                                setSelectedCustomerChannels(
                                  selectedCustomerChannels.filter(
                                    id => id !== channel.id
                                  )
                                );
                              }
                            }}
                            size="small"
                          />
                        }
                        label={`${channel.channel_name} (${channel.channel_code})`}
                        className="!block"
                      />
                    ))}
                </>
              )}
            </Box>
          </Paper>

          <Paper className="!p-3 !rounded-lg !shadow-sm !border !bg-white !border-gray-200">
            <Typography
              variant="h6"
              className="!font-semibold !text-gray-900 !mb-2 !text-base"
            >
              Promotion Product Condition{' '}
              <span className="!text-gray-500">
                ({productConditions.length || 0})
              </span>
            </Typography>

            <Box className="!mb-2">
              <Typography className="!mb-1 !text-xs !font-medium">
                Type
              </Typography>
              <RadioGroup
                value={selectedConditionType}
                onChange={e => {
                  const newType = e.target.value;
                  setSelectedConditionType(newType);
                  setProductConditionForm({
                    ...productConditionForm,
                    product: '',
                    group: '',
                    unit:
                      newType === 'Price'
                        ? undefined
                        : productConditionForm.unit || 'unit',
                  });
                }}
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
              <Box className="!mb-4">
                <Table
                  data={productConditions.map((condition, idx) => ({
                    id: condition._index,
                    type: condition.type || 'Quantity',
                    product_group:
                      condition.product_group ||
                      (condition.product_id
                        ? products.find(p => p.id === condition.product_id)
                            ?.name || '-'
                        : '-'),
                    at_least:
                      condition.type === 'Price'
                        ? `${condition.min_quantity || 0}`
                        : `${condition.min_quantity || 0} ${condition.unit || 'unit'}`,
                    _index: idx,
                  }))}
                  columns={[
                    { id: 'type', label: 'Type' },
                    { id: 'product_group', label: 'Product/Category' },
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
                                product: condition.product_id?.toString() || '',
                                at_least:
                                  condition.min_quantity?.toString() || '',
                                unit:
                                  condition.type === 'Price'
                                    ? undefined
                                    : condition.unit || 'unit',
                              });
                              setSelectedConditionType(
                                condition.type || 'Quantity'
                              );
                              if (condition.product_id) {
                                setConditionProductTab(0);
                              } else if (condition.product_group) {
                                setConditionProductTab(1);
                              }
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

            <Box className="!space-y-4 !mt-2">
              <Box className="!grid !grid-cols-2 !gap-4">
                <Input
                  type="number"
                  value={productConditionForm.at_least || ''}
                  onChange={e =>
                    setProductConditionForm({
                      ...productConditionForm,
                      at_least: e.target.value,
                    })
                  }
                  label={`At least (${selectedConditionType === 'Quantity' ? 'Quantity' : 'Price'})`}
                  size="small"
                  fullWidth={true}
                />
                {selectedConditionType === 'Quantity' && (
                  <Select
                    value={productConditionForm.unit}
                    onChange={e =>
                      setProductConditionForm({
                        ...productConditionForm,
                        unit: e.target.value,
                      })
                    }
                    size="small"
                    fullWidth={true}
                  >
                    <MenuItem value="unit">unit</MenuItem>
                    {units.map((unit: any) => (
                      <MenuItem key={unit.id} value={unit.name}>
                        {unit.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              </Box>
              <Box className="rounded border border-gray-400/50">
                <Tabs
                  value={conditionProductTab}
                  onChange={(_, newValue) => {
                    setConditionProductTab(newValue);
                    setProductConditionForm({
                      ...productConditionForm,
                      product: '',
                      group: '',
                    });
                  }}
                  variant="scrollable"
                  scrollButtons="auto"
                  className="!min-h-9.5"
                >
                  <Tab label="Product" className="!min-h-9.5" />
                  <Tab label="Product Category" className="!min-h-9.5" />
                </Tabs>
              </Box>
              {conditionProductTab === 0 ? (
                <ProductSelect
                  label="Product"
                  value={productConditionForm.product}
                  onChange={(_event, product) => {
                    const selectedProduct = product
                      ? product.id.toString()
                      : '';
                    setProductConditionForm({
                      ...productConditionForm,
                      product: selectedProduct,
                      group: '',
                    });
                  }}
                  fullWidth
                  size="small"
                />
              ) : (
                <ProductCategorySelect
                  label="Product Category"
                  value={
                    productConditionForm.group
                      ? productCategories
                          .find(
                            (c: any) =>
                              c.category_name === productConditionForm.group
                          )
                          ?.id.toString()
                      : ''
                  }
                  nameToSearch={productConditionForm.group || ''}
                  onChange={(_event, category) => {
                    const selectedCategoryName = category
                      ? category.category_name
                      : '';
                    setProductConditionForm({
                      ...productConditionForm,
                      group: selectedCategoryName,
                      product: '',
                    });
                  }}
                  fullWidth
                  size="small"
                />
              )}

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
                      updateProductCondition(
                        idx,
                        'unit',
                        selectedConditionType === 'Quantity'
                          ? productConditionForm.unit
                          : undefined
                      );
                      updateProductCondition(
                        idx,
                        'type',
                        selectedConditionType
                      );
                      setSelectedProductConditionIndex(null);
                      resetProductConditionForm();
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
                      resetProductConditionForm();
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
            <Box className="!mb-2">
              <Typography className="!mb-1 !text-xs !font-medium">
                Type
              </Typography>
              <RadioGroup
                value={selectedGiftType}
                onChange={e => {
                  const newType = e.target.value;
                  setSelectedGiftType(newType);
                  if (newType === 'Percent' && discAmount) {
                    const numValue = parseFloat(discAmount);
                    if (!isNaN(numValue) && numValue > 100) {
                      setDiscAmountError(
                        'Percent value cannot be more than 100'
                      );
                    } else {
                      setDiscAmountError('');
                    }
                  } else {
                    setDiscAmountError('');
                  }
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
                    },
                    {
                      id: 'application',
                      label: 'Application',
                    },
                    {
                      id: 'gift',
                      label: 'Gift',
                      render: (_value, row) => {
                        const giftRow = giftRows[row._index];
                        return giftRow.product_name
                          ? `${giftRow.benefit_value || ''} ${giftRow.product_name}`
                          : giftRow.gift;
                      },
                    },
                    {
                      id: 'actions',
                      label: 'Actions',
                      render: (_value, row) => (
                        <Box className="!flex !gap-2">
                          <EditButton
                            onClick={() => {
                              const giftRow = giftRows[row._index];
                              setSelectedGiftIndex(row._index);
                              setDiscAmount(
                                giftRow.benefit_value?.toString() || ''
                              );
                              setMaximumAmount(
                                giftRow.gift_limit?.toString() || ''
                              );
                              setGiftApplication(
                                giftRow.application || 'n. Prod. Gr.'
                              );
                              if (giftRow.type === 'Free Product') {
                                setGiftName(
                                  giftRow.product_id?.toString() || ''
                                );
                                setGiftNameDisplay(giftRow.product_name || '');
                                setGiftProductTab(0);
                              } else {
                                setGiftName(
                                  giftRow.product_id?.toString() || ''
                                );
                                setGiftNameDisplay(giftRow.product_name || '');
                                setGiftProductTab(1);
                              }
                              setSelectedGiftType(giftRow.type);
                            }}
                            tooltip="Edit gift"
                            size="small"
                          />
                          <DeleteButton
                            onClick={() => removeGiftRow(row._index)}
                            tooltip="Delete gift"
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

            <Box className="!space-y-4 !mt-2">
              <Box className="!grid !grid-cols-2 !gap-4">
                <Box>
                  <Input
                    label={`${selectedGiftType === 'Free Product' ? 'Free Product' : selectedGiftType === 'Percent' ? 'Discount (Percent)' : 'Discount (Amount)'}`}
                    type="number"
                    value={discAmount || ''}
                    onChange={e => {
                      const value = e.target.value;
                      setDiscAmount(value);
                      if (selectedGiftType === 'Percent') {
                        const numValue = parseFloat(value);
                        if (value && !isNaN(numValue) && numValue > 100) {
                          setDiscAmountError(
                            'Percent value cannot be more than 100'
                          );
                        } else {
                          setDiscAmountError('');
                        }
                      } else {
                        setDiscAmountError('');
                      }
                    }}
                    fullWidth
                    size="small"
                    error={!!discAmountError}
                  />
                  {discAmountError && (
                    <Typography
                      variant="caption"
                      className="!text-red-500 !mt-1 !block"
                    >
                      {discAmountError}
                    </Typography>
                  )}
                </Box>{' '}
                {selectedGiftType === 'Percent' && (
                  <Input
                    label="Maximum Amount"
                    type="number"
                    value={maximumAmount}
                    onChange={e => setMaximumAmount(e.target.value)}
                    fullWidth
                    size="small"
                  />
                )}
              </Box>
              <Box className="rounded border border-gray-400/50">
                <Tabs
                  value={giftProductTab}
                  onChange={(_, newValue) => {
                    setGiftProductTab(newValue);
                    setGiftName('');
                  }}
                  variant="scrollable"
                  scrollButtons="auto"
                  className="!min-h-9.5"
                >
                  <Tab label="Product" className="!min-h-9.5" />
                  <Tab label="Product Category" className="!min-h-9.5" />
                </Tabs>
              </Box>
              {giftProductTab === 0 ? (
                <ProductSelect
                  label="Product"
                  value={giftName}
                  onChange={(_event, product) => {
                    const selectedId = product ? product.id.toString() : '';
                    setGiftName(selectedId);
                    setGiftNameDisplay(product?.name || '');
                  }}
                  fullWidth
                  size="small"
                />
              ) : (
                <ProductCategorySelect
                  label="Product Category"
                  value={giftName}
                  onChange={(_event, category) => {
                    const selectedId = category ? category.id.toString() : '';
                    setGiftName(selectedId);
                    setGiftNameDisplay(category?.category_name || '');
                  }}
                  fullWidth
                  size="small"
                />
              )}

              <Box className="!flex !gap-2">
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    if (!giftName) {
                      setValidationErrors({
                        ...validationErrors,
                        gift_update:
                          'Product or Product Category must be selected',
                      });
                      setTimeout(() => {
                        errorAlertRef.current?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start',
                        });
                      }, 100);
                      return;
                    }
                    if (!discAmount || parseFloat(discAmount) <= 0) {
                      setValidationErrors({
                        ...validationErrors,
                        gift_disc_update:
                          'Discount value must be greater than 0',
                      });
                      setTimeout(() => {
                        errorAlertRef.current?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start',
                        });
                      }, 100);
                      return;
                    }
                    if (selectedGiftType === 'Percent') {
                      const numValue = parseFloat(discAmount);
                      if (!isNaN(numValue) && numValue > 100) {
                        setDiscAmountError(
                          'Percent value cannot be more than 100'
                        );
                        setValidationErrors({
                          ...validationErrors,
                          gift_disc_update:
                            'Percent value cannot be more than 100',
                        });
                        setTimeout(() => {
                          errorAlertRef.current?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start',
                          });
                        }, 100);
                        return;
                      }
                    }
                    if (selectedGiftIndex !== null && giftName) {
                      updateGiftRow(
                        selectedGiftIndex,
                        'type',
                        selectedGiftType
                      );
                      updateGiftRow(
                        selectedGiftIndex,
                        'application',
                        giftApplication
                      );
                      updateGiftRow(
                        selectedGiftIndex,
                        'gift',
                        discAmount ? `${discAmount} ${giftNameDisplay}` : ''
                      );
                      updateGiftRow(
                        selectedGiftIndex,
                        'product_id',
                        parseInt(giftName)
                      );
                      updateGiftRow(
                        selectedGiftIndex,
                        'product_name',
                        giftNameDisplay
                      );
                      updateGiftRow(
                        selectedGiftIndex,
                        'benefit_value',
                        parseFloat(discAmount) || 0
                      );
                      updateGiftRow(
                        selectedGiftIndex,
                        'gift_limit',
                        parseFloat(maximumAmount) || 0
                      );
                      setSelectedGiftIndex(null);
                      setDiscAmount('');
                      setMaximumAmount('');
                      setGiftName('');
                      setGiftNameDisplay('');
                      setGiftApplication('n. Prod. Gr.');
                      setDiscAmountError('');
                      setValidationErrors({});
                    }
                  }}
                  disabled={!!discAmountError || selectedGiftIndex === null}
                >
                  Update
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    if (!giftName) {
                      setValidationErrors({
                        ...validationErrors,
                        gift_new:
                          'Product or Product Category must be selected',
                      });
                      setTimeout(() => {
                        errorAlertRef.current?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start',
                        });
                      }, 100);
                      return;
                    }
                    if (!discAmount || parseFloat(discAmount) <= 0) {
                      setValidationErrors({
                        ...validationErrors,
                        gift_disc_new: 'Discount value must be greater than 0',
                      });
                      setTimeout(() => {
                        errorAlertRef.current?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start',
                        });
                      }, 100);
                      return;
                    }
                    if (selectedGiftType === 'Percent') {
                      const numValue = parseFloat(discAmount);
                      if (!isNaN(numValue) && numValue > 100) {
                        setDiscAmountError(
                          'Percent value cannot be more than 100'
                        );
                        setValidationErrors({
                          ...validationErrors,
                          gift_disc_new:
                            'Percent value cannot be more than 100',
                        });
                        setTimeout(() => {
                          errorAlertRef.current?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start',
                          });
                        }, 100);
                        return;
                      }
                    }
                    const newRow: GiftRow = {
                      _index: giftRows.length,
                      type: selectedGiftType,
                      application: giftApplication,
                      gift: discAmount
                        ? `${discAmount} ${giftNameDisplay || ''}`
                        : '',
                      product_id: giftName ? parseInt(giftName) : undefined,
                      product_name: giftNameDisplay,
                      benefit_value: parseFloat(discAmount) || 0,
                      gift_limit: parseFloat(maximumAmount) || 0,
                    };
                    setGiftRows([...giftRows, newRow]);
                    setDiscAmount('0');
                    setMaximumAmount('0');
                    setGiftName('');
                    setGiftNameDisplay('');
                    setGiftApplication('n. Prod. Gr.');
                    setDiscAmountError('');
                    setSelectedGiftIndex(null);
                    setValidationErrors({});
                  }}
                  disabled={!!discAmountError}
                >
                  New
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    if (selectedGiftIndex !== null) {
                      removeGiftRow(selectedGiftIndex);
                      setSelectedGiftIndex(null);
                      setDiscAmount('0');
                      setMaximumAmount('0');
                      setGiftName('');
                      setGiftNameDisplay('');
                      setGiftApplication('n. Prod. Gr.');
                      setDiscAmountError('');
                    }
                  }}
                  disabled={selectedGiftIndex === null}
                >
                  Del
                </Button>
              </Box>
            </Box>
          </Paper>

          <Box className="!mt-2 !flex !gap-2 !justify-end !col-span-2">
            <Button
              type="button"
              variant="outlined"
              size="medium"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              size="medium"
              disabled={
                createPromotionMutation.isPending ||
                updatePromotionMutation.isPending
              }
            >
              Save
            </Button>
          </Box>
        </form>
      </Box>
    </CustomDrawer>
  );
};

export default ManagePromotion;
