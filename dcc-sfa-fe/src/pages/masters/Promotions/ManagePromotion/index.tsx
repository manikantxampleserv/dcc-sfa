import { Add, ContentCopy, Description } from '@mui/icons-material';
import {
  Autocomplete,
  Box,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import { useApiMutation } from 'hooks/useApiMutation';
import { useCustomers } from 'hooks/useCustomers';
import { useDepots } from 'hooks/useDepots';
import { useProducts } from 'hooks/useProducts';
import { usePromotion } from 'hooks/usePromotions';
import React, { useEffect, useState } from 'react';
import {
  createPromotion,
  updatePromotion,
  type CreatePromotionPayload,
  type UpdatePromotionPayload,
  type Promotion,
} from 'services/masters/Promotions';
import { DeleteButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';

interface ManagePromotionProps {
  selectedPromotion?: Promotion | null;
  setSelectedPromotion: (promotion: Promotion | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

interface PromotionLevel {
  _index: number;
  level: string;
  step: boolean;
  gift_percent: string;
}

interface PromotionGift {
  _index: number;
  level_index: number;
  type: string;
  application: string;
  gift: string;
  disc_amount: string;
  maximum: string;
  product_code: string;
  product_name: string;
  product_id?: number;
  product_not_in_condition: boolean;
}

interface OutletCondition {
  _index: number;
  outlet_condition: string;
  dist: string;
  outlet_value: string;
  outlet_name: string;
  start: string;
  finish: string;
}

interface ProductCondition {
  _index: number;
  product_group: string;
  product_id?: number;
  category_id?: number;
  at_least: string;
}

interface LocationFormData {
  area: string;
  group: string;
  distributor_id: string;
  distributor_name: string;
  role: string;
  slip_limit: boolean;
  disc_limit: boolean;
  date_limit: boolean;
  dc_par: boolean;
}

const ManagePromotion: React.FC<ManagePromotionProps> = ({
  selectedPromotion,
  setSelectedPromotion,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedPromotion;
  const [locationTab, setLocationTab] = useState(0);
  const [giftProductTab, setGiftProductTab] = useState(0);
  const [quantityType, setQuantityType] = useState('quantity');
  const [levelType, setLevelType] = useState('total');
  const [giftType, setGiftType] = useState('amount');
  const [descriptionDialogOpen, setDescriptionDialogOpen] = useState(false);
  const [selectedLevelIndex, setSelectedLevelIndex] = useState<number | null>(
    null
  );
  const [selectedGiftIndex, setSelectedGiftIndex] = useState<number | null>(
    null
  );

  const [promotionLevels, setPromotionLevels] = useState<PromotionLevel[]>([]);
  const [promotionGifts, setPromotionGifts] = useState<PromotionGift[]>([]);
  const [outletConditions, setOutletConditions] = useState<OutletCondition[]>(
    []
  );
  const [productConditions, setProductConditions] = useState<
    ProductCondition[]
  >([]);
  const [locationForms, setLocationForms] = useState<
    Record<number, LocationFormData>
  >({
    0: {
      area: '',
      group: '',
      distributor_id: '',
      distributor_name: '',
      role: '',
      slip_limit: false,
      disc_limit: false,
      date_limit: false,
      dc_par: false,
    },
  });

  const [levelInput, setLevelInput] = useState({
    level: '',
    unit: '',
    step: false,
  });
  const [giftInput, setGiftInput] = useState({
    code: '',
    name: '',
    product_not_in_condition: false,
  });
  const [dateFilter, setDateFilter] = useState({
    date_from_enabled: true,
    date_from: '',
    date_to_enabled: true,
    date_to: '',
  });
  const [documentTypes, setDocumentTypes] = useState<Record<string, boolean>>({
    'Sales Invoice': true,
    'Hot Sales Invoice': true,
    'Sales Waybill': true,
    'Hot Sales Waybill': true,
    Order: true,
    'Return Invoice From Out': false,
    'Corrupt Return Invoice F': false,
    'Return Waybill From Out': false,
    'Corrupt Return Waybill F': false,
    'Damaged Return From C': false,
    Availability: false,
    'Return Invoice To Headc': false,
    'Corrupt Return Invoice 1': false,
    'NC Return Invoice To He': false,
    'Buv Invoice': false,
  });

  const { data: productsResponse } = useProducts({ limit: 1000 });
  const products = productsResponse?.data || [];
  const { data: customersResponse } = useCustomers({ limit: 1000 });
  const customers = customersResponse?.data || [];
  const { data: depotsResponse } = useDepots({ limit: 1000 });
  const depots = depotsResponse?.data || [];

  const { data: promotionData } = usePromotion(selectedPromotion?.id || null);
  const promotion = promotionData?.data;

  const handleCancel = () => {
    setSelectedPromotion(null);
    setDrawerOpen(false);
    setPromotionLevels([]);
    setPromotionGifts([]);
    setOutletConditions([]);
    setProductConditions([]);
    setSelectedLevelIndex(null);
    setSelectedGiftIndex(null);
    setLevelInput({ level: '', unit: '', step: false });
    setGiftInput({ code: '', name: '', product_not_in_condition: false });
    setQuantityType('quantity');
    setLevelType('total');
    setGiftType('amount');
    setLocationTab(0);
    setGiftProductTab(0);
    setLocationForms({
      0: {
        area: '',
        group: '',
        distributor_id: '',
        distributor_name: '',
        role: '',
        slip_limit: false,
        disc_limit: false,
        date_limit: false,
        dc_par: false,
      },
    });
    formik.resetForm();
  };

  const createMutation = useApiMutation({
    mutationFn: (data: CreatePromotionPayload) => createPromotion(data),
    loadingMessage: 'Creating promotion...',
    invalidateQueries: [['promotions']],
    onSuccess: () => {
      handleCancel();
    },
  });

  const updateMutation = useApiMutation({
    mutationFn: (data: { id: number; payload: UpdatePromotionPayload }) =>
      updatePromotion(data.id, data.payload),
    loadingMessage: 'Updating promotion...',
    invalidateQueries: [['promotions'], ['promotion']],
    onSuccess: () => {
      handleCancel();
    },
  });

  const formik = useFormik({
    initialValues: {
      disabled: false,
      name: promotion?.name || '',
      code: promotion?.code || '',
      start_date: promotion?.start_date
        ? new Date(promotion.start_date).toISOString().split('T')[0]
        : '',
      finish_date: promotion?.end_date
        ? new Date(promotion.end_date).toISOString().split('T')[0]
        : '',
      office:
        promotion?.channels?.some(c => c.channel_type === 'OFFICE') || true,
      mobile:
        promotion?.channels?.some(c => c.channel_type === 'MOBILE') || true,
      b2b: promotion?.channels?.some(c => c.channel_type === 'B2B') || true,
      description: promotion?.description || '',
      disc_amount: '',
      maximum: '0.00',
    },
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const platforms: string[] = [];
        if (values.office) platforms.push('OFFICE');
        if (values.mobile) platforms.push('MOBILE');
        if (values.b2b) platforms.push('B2B');

        const productConditionsData = productConditions.map(condition => {
          const product = products.find(
            p => p.name === condition.product_group
          );
          return {
            product_id: product?.id || condition.product_id || 0,
            category_id: product?.category_id || condition.category_id || 0,
            product_group: condition.product_group || undefined,
            min_quantity: parseFloat(condition.at_least) || 0,
            min_value: parseFloat(condition.at_least) || 0,
          };
        });

        const levelsData = promotionLevels.map((level, index) => {
          const levelGifts = promotionGifts.filter(
            gift => gift.level_index === index
          );
          return {
            level_number: index + 1,
            threshold_value: parseFloat(level.level) || 0,
            discount_type: levelType.toUpperCase(),
            discount_value: parseFloat(level.gift_percent) || 0,
            benefits: levelGifts.map(gift => {
              const product = products.find(p => p.code === gift.product_code);
              return {
                benefit_type: gift.type.toUpperCase(),
                product_id: product?.id || gift.product_id,
                benefit_value: parseFloat(gift.disc_amount) || 0,
                condition_type: gift.application || undefined,
                gift_limit: parseInt(gift.maximum) || 0,
              };
            }),
          };
        });

        const locationAreas = Object.values(locationForms)
          .filter(form => form.distributor_id)
          .map(form => parseInt(form.distributor_id))
          .filter(id => !isNaN(id));

        const customerExclusions = outletConditions
          .filter(condition => condition.outlet_condition === '►Outlet')
          .map(condition => {
            const customer = customers.find(
              c =>
                c.code === condition.outlet_value ||
                c.name === condition.outlet_name
            );
            return customer?.id || parseInt(condition.outlet_value) || 0;
          })
          .filter(id => id > 0);

        if (isEdit && selectedPromotion?.id) {
          const updatePayload: UpdatePromotionPayload = {
            name: values.name,
            start_date: values.start_date,
            end_date: values.finish_date,
            description: values.description,
            is_active: values.disabled ? 'N' : 'Y',
            platforms: platforms.length > 0 ? platforms : undefined,
            quantity_type: quantityType.toUpperCase(),
            product_conditions:
              productConditionsData.length > 0
                ? productConditionsData
                : undefined,
            location_areas:
              locationAreas.length > 0 ? locationAreas : undefined,
            levels: levelsData.length > 0 ? levelsData : undefined,
            customer_exclusions:
              customerExclusions.length > 0 ? customerExclusions : undefined,
          };
          updateMutation.mutate({
            id: selectedPromotion.id,
            payload: updatePayload,
          });
        } else {
          const createPayload: CreatePromotionPayload = {
            name: values.name,
            code: values.code || undefined,
            start_date: values.start_date,
            end_date: values.finish_date,
            description: values.description || undefined,
            disabled: values.disabled,
            platforms: platforms.length > 0 ? platforms : undefined,
            quantity_type: quantityType.toUpperCase(),
            product_conditions:
              productConditionsData.length > 0
                ? productConditionsData
                : undefined,
            location_areas:
              locationAreas.length > 0 ? locationAreas : undefined,
            levels: levelsData.length > 0 ? levelsData : undefined,
            customer_exclusions:
              customerExclusions.length > 0 ? customerExclusions : undefined,
          };
          createMutation.mutate(createPayload);
        }
      } catch (error) {
        console.error('Error submitting promotion:', error);
      }
    },
  });

  useEffect(() => {
    if (!drawerOpen && !isEdit) {
      setPromotionLevels([]);
      setPromotionGifts([]);
      setOutletConditions([]);
      setProductConditions([]);
      setSelectedLevelIndex(null);
      setSelectedGiftIndex(null);
      setLevelInput({ level: '', unit: '', step: false });
      setGiftInput({ code: '', name: '', product_not_in_condition: false });
      setQuantityType('quantity');
      setLevelType('total');
      setGiftType('amount');
      setLocationTab(0);
      setGiftProductTab(0);
    }
  }, [drawerOpen, isEdit]);

  useEffect(() => {
    if (promotion && isEdit && drawerOpen) {
      if (promotion.conditions && promotion.conditions.length > 0) {
        const mappedConditions: ProductCondition[] = promotion.conditions.map(
          (cond, idx) => {
            const condProduct = cond.promotion_condition_products?.[0];
            return {
              _index: idx,
              product_group: condProduct?.product_group || '',
              product_id: condProduct?.product_id,
              category_id: condProduct?.category_id,
              at_least: condProduct?.condition_quantity?.toString() || '0',
            };
          }
        );
        setProductConditions(mappedConditions);
        if (promotion.conditions[0]?.condition_type) {
          setQuantityType(promotion.conditions[0].condition_type.toLowerCase());
        }
      }

      if (promotion.levels && promotion.levels.length > 0) {
        const mappedLevels: PromotionLevel[] = promotion.levels.map(
          (level, idx) => ({
            _index: idx,
            level: level.threshold_value?.toString() || '',
            step: false,
            gift_percent: level.discount_value?.toString() || '',
          })
        );
        setPromotionLevels(mappedLevels);
        if (promotion.levels[0]?.discount_type) {
          setLevelType(promotion.levels[0].discount_type.toLowerCase());
        }

        const allGifts: PromotionGift[] = [];
        promotion.levels.forEach((level, levelIdx) => {
          if (level.promotion_benefit_level) {
            level.promotion_benefit_level.forEach(benefit => {
              const product =
                benefit.promotion_benefit_products ||
                products.find(p => p.id === benefit.product_id);
              allGifts.push({
                _index: allGifts.length,
                level_index: levelIdx,
                type: benefit.benefit_type?.toLowerCase() || 'amount',
                application: benefit.condition_type || 'Product',
                gift: product
                  ? `${product.code} - ${product.name}`
                  : benefit.product_id
                    ? `Product ID: ${benefit.product_id}`
                    : '',
                disc_amount: benefit.benefit_value?.toString() || '0',
                maximum: benefit.gift_limit?.toString() || '0',
                product_code: product?.code || '',
                product_name: product?.name || '',
                product_id: benefit.product_id || undefined,
                product_not_in_condition: false,
              });
            });
          }
        });
        setPromotionGifts(allGifts);
      }

      if (
        promotion.customer_exclusions &&
        promotion.customer_exclusions.length > 0
      ) {
        const mappedExclusions: OutletCondition[] =
          promotion.customer_exclusions.map((excl, idx) => {
            const customer = customers.find(c => c.id === excl.customer_id);
            return {
              _index: idx,
              outlet_condition: '►Outlet',
              dist: '',
              outlet_value: customer?.code || excl.customer_id.toString(),
              outlet_name: customer?.name || '',
              start: promotion.start_date
                ? new Date(promotion.start_date).toISOString().split('T')[0]
                : '',
              finish: promotion.end_date
                ? new Date(promotion.end_date).toISOString().split('T')[0]
                : '',
            };
          });
        setOutletConditions(mappedExclusions);
      }

      if (promotion.depots && promotion.depots.length > 0) {
        const depotForm: LocationFormData = {
          area: '',
          group: '',
          distributor_id: promotion.depots[0].depot_id.toString(),
          distributor_name: promotion.depots[0].depots?.name || '',
          role: '',
          slip_limit: false,
          disc_limit: false,
          date_limit: false,
          dc_par: false,
        };
        setLocationForms({ 0: depotForm });
      }
    } else if (!isEdit && drawerOpen) {
      setPromotionLevels([]);
      setPromotionGifts([]);
      setOutletConditions([]);
      setProductConditions([]);
      setQuantityType('quantity');
      setLevelType('total');
      setGiftType('amount');
      setLocationTab(0);
      setGiftProductTab(0);
      setLocationForms({
        0: {
          area: '',
          group: '',
          distributor_id: '',
          distributor_name: '',
          role: '',
          slip_limit: false,
          disc_limit: false,
          date_limit: false,
          dc_par: false,
        },
      });
    }
  }, [promotion, isEdit, drawerOpen, products, customers]);

  const handleCopyPromotion = () => {
    const copiedData = {
      ...formik.values,
      code: `${formik.values.code}_COPY`,
      name: `${formik.values.name} (Copy)`,
    };
    formik.setValues(copiedData);
  };

  const handleDescription = () => {
    setDescriptionDialogOpen(true);
  };

  const addPromotionLevel = () => {
    if (levelInput.level) {
      const newLevel: PromotionLevel = {
        _index: promotionLevels.length,
        level: levelInput.level,
        step: levelInput.step,
        gift_percent: '',
      };
      setPromotionLevels([...promotionLevels, newLevel]);
      setLevelInput({ level: '', unit: '', step: false });
    }
  };

  const updatePromotionLevel = () => {
    if (levelInput.level && selectedLevelIndex !== null) {
      const updated = [...promotionLevels];
      updated[selectedLevelIndex] = {
        ...updated[selectedLevelIndex],
        level: levelInput.level,
        step: levelInput.step,
      };
      setPromotionLevels(updated);
      setLevelInput({ level: '', unit: '', step: false });
      setSelectedLevelIndex(null);
    }
  };

  const removePromotionLevel = (index: number) => {
    setPromotionLevels(promotionLevels.filter((_, i) => i !== index));
    setPromotionGifts(prevGifts => {
      const filtered = prevGifts.filter(gift => gift.level_index !== index);
      return filtered.map(gift => ({
        ...gift,
        level_index:
          gift.level_index > index ? gift.level_index - 1 : gift.level_index,
      }));
    });
    if (selectedLevelIndex === index) {
      setSelectedLevelIndex(null);
      setLevelInput({ level: '', unit: '', step: false });
    } else if (selectedLevelIndex !== null && selectedLevelIndex > index) {
      setSelectedLevelIndex(selectedLevelIndex - 1);
    }
  };

  const addPromotionGift = () => {
    if (giftInput.code) {
      const product = products.find(p => p.code === giftInput.code);
      const currentLevelIndex =
        selectedLevelIndex !== null
          ? selectedLevelIndex
          : promotionLevels.length - 1;
      const newGift: PromotionGift = {
        _index: promotionGifts.length,
        level_index: currentLevelIndex >= 0 ? currentLevelIndex : 0,
        type: giftType,
        application:
          giftProductTab === 0
            ? 'Product'
            : giftProductTab === 1
              ? 'Prod. Group'
              : giftProductTab === 2
                ? 'Dyn. Prod. Gr.'
                : giftProductTab === 3
                  ? 'Conditional Products'
                  : 'Invoice',
        gift: `${giftInput.code} ${giftInput.name}`,
        disc_amount: formik.values.disc_amount || '',
        maximum: formik.values.maximum || '0.00',
        product_code: giftInput.code,
        product_name: giftInput.name,
        product_id: product?.id,
        product_not_in_condition: giftInput.product_not_in_condition,
      };
      setPromotionGifts([...promotionGifts, newGift]);
      setGiftInput({ code: '', name: '', product_not_in_condition: false });
      formik.setFieldValue('disc_amount', '');
      formik.setFieldValue('maximum', '0.00');
    }
  };

  const updatePromotionGift = () => {
    if (giftInput.code && selectedGiftIndex !== null) {
      const product = products.find(p => p.code === giftInput.code);
      const updated = [...promotionGifts];
      const currentGift = updated[selectedGiftIndex];
      updated[selectedGiftIndex] = {
        ...currentGift,
        type: giftType,
        application:
          giftProductTab === 0
            ? 'Product'
            : giftProductTab === 1
              ? 'Prod. Group'
              : giftProductTab === 2
                ? 'Dyn. Prod. Gr.'
                : giftProductTab === 3
                  ? 'Conditional Products'
                  : 'Invoice',
        gift: `${giftInput.code} ${giftInput.name}`,
        disc_amount: formik.values.disc_amount || '',
        maximum: formik.values.maximum || '0.00',
        product_code: giftInput.code,
        product_name: giftInput.name,
        product_id: product?.id,
        product_not_in_condition: giftInput.product_not_in_condition,
      };
      setPromotionGifts(updated);
      setGiftInput({ code: '', name: '', product_not_in_condition: false });
      formik.setFieldValue('disc_amount', '');
      formik.setFieldValue('maximum', '0.00');
      setSelectedGiftIndex(null);
    }
  };

  const removePromotionGift = (index: number) => {
    setPromotionGifts(promotionGifts.filter((_, i) => i !== index));
    if (selectedGiftIndex === index) {
      setSelectedGiftIndex(null);
      setGiftInput({ code: '', name: '', product_not_in_condition: false });
      formik.setFieldValue('disc_amount', '');
      formik.setFieldValue('maximum', '0.00');
    } else if (selectedGiftIndex !== null && selectedGiftIndex > index) {
      setSelectedGiftIndex(selectedGiftIndex - 1);
    }
  };

  const addOutletCondition = () => {
    const newCondition: OutletCondition = {
      _index: outletConditions.length,
      outlet_condition: '►Distributor',
      dist: '',
      outlet_value: '',
      outlet_name: '',
      start: formik.values.start_date || '',
      finish: formik.values.finish_date || '',
    };
    setOutletConditions([...outletConditions, newCondition]);
  };

  const removeOutletCondition = (index: number) => {
    setOutletConditions(outletConditions.filter((_, i) => i !== index));
  };

  const updateOutletConditionField = (
    index: number,
    field: keyof OutletCondition,
    value: string
  ) => {
    const updated = [...outletConditions];
    updated[index] = { ...updated[index], [field]: value };
    setOutletConditions(updated);
  };

  const addProductCondition = () => {
    const newCondition: ProductCondition = {
      _index: productConditions.length,
      product_group: '',
      at_least: '',
    };
    setProductConditions([...productConditions, newCondition]);
  };

  const removeProductCondition = (index: number) => {
    setProductConditions(productConditions.filter((_, i) => i !== index));
  };

  const updateProductCondition = (
    index: number,
    field: keyof ProductCondition,
    value: string
  ) => {
    const updated = [...productConditions];
    updated[index] = { ...updated[index], [field]: value };
    setProductConditions(updated);
  };

  const handleLocationNew = () => {
    const currentForm = locationForms[locationTab] || {
      area: '',
      group: '',
      distributor_id: '',
      distributor_name: '',
      role: '',
      slip_limit: false,
      disc_limit: false,
      date_limit: false,
      dc_par: false,
    };
    setLocationForms({
      ...locationForms,
      [locationTab]: currentForm,
    });
  };

  const handleLocationUpdate = () => {
    const currentForm = locationForms[locationTab];
    if (currentForm) {
      console.log('Update location form:', currentForm);
    }
  };

  const handleLocationDelete = () => {
    const updated = { ...locationForms };
    delete updated[locationTab];
    setLocationForms(updated);
  };

  const handleApplyDynamicOutletGroups = () => {
    console.log('Apply dynamic outlet groups');
  };

  const levelColumns: TableColumn<PromotionLevel>[] = [
    {
      id: 'level',
      label: 'Level',
      render: (_value, row, index) => (
        <Typography
          variant="body2"
          className={
            selectedLevelIndex === index ? '!font-bold !text-primary-600' : ''
          }
          onClick={() => {
            setSelectedLevelIndex(index);
            setLevelInput({
              level: row.level,
              unit: '',
              step: row.step,
            });
          }}
          style={{ cursor: 'pointer' }}
        >
          {row.level ? `${row.level} unit and above` : '-'}
        </Typography>
      ),
    },
    {
      id: 'step',
      label: 'Step',
      render: (_value, row, index) => (
        <Checkbox
          checked={row.step}
          onChange={e => {
            const updated = [...promotionLevels];
            updated[index] = {
              ...updated[index],
              step: e.target.checked,
            };
            setPromotionLevels(updated);
          }}
          size="small"
        />
      ),
    },
    {
      id: 'gift_percent',
      label: 'Gift+%',
      render: (_value, row, index) => (
        <Input
          value={row.gift_percent}
          onChange={e => {
            const updated = [...promotionLevels];
            updated[index] = {
              ...updated[index],
              gift_percent: e.target.value,
            };
            setPromotionLevels(updated);
          }}
          placeholder="0"
          size="small"
          className="!min-w-20"
        />
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_value, _row, index) => (
        <DeleteButton
          onClick={() => removePromotionLevel(index)}
          tooltip="Remove level"
        />
      ),
    },
  ];

  const giftColumns: TableColumn<PromotionGift>[] = [
    {
      id: 'type',
      label: 'Type',
      render: (_value, row, index) => (
        <Typography
          variant="body2"
          className={
            selectedGiftIndex === index ? '!font-bold !text-primary-600' : ''
          }
          onClick={() => {
            setSelectedGiftIndex(index);
            setGiftInput({
              code: row.product_code,
              name: row.product_name,
              product_not_in_condition: row.product_not_in_condition,
            });
            setGiftType(row.type);
            formik.setFieldValue('disc_amount', row.disc_amount);
            formik.setFieldValue('maximum', row.maximum);
          }}
          style={{ cursor: 'pointer' }}
        >
          {row.type}
        </Typography>
      ),
    },
    {
      id: 'application',
      label: 'Application',
      render: (_value, row) => (
        <Typography variant="body2">{row.application || '-'}</Typography>
      ),
    },
    {
      id: 'gift',
      label: 'Gift',
      render: (_value, row) => (
        <Typography variant="body2">{row.gift || '-'}</Typography>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_value, _row, index) => (
        <DeleteButton
          onClick={() => removePromotionGift(index)}
          tooltip="Remove gift"
        />
      ),
    },
  ];

  const outletColumns: TableColumn<OutletCondition>[] = [
    {
      id: 'outlet_condition',
      label: 'Outlet Condition',
      render: (_value, row, index) => (
        <Select
          value={row.outlet_condition}
          onChange={e =>
            updateOutletConditionField(
              index,
              'outlet_condition',
              e.target.value
            )
          }
          size="small"
          className="!min-w-40"
        >
          <MenuItem value="►Distributor">►Distributor</MenuItem>
          <MenuItem value="►Outlet">►Outlet</MenuItem>
          <MenuItem value="►Outlet Group">►Outlet Group</MenuItem>
        </Select>
      ),
    },
    {
      id: 'dist',
      label: 'Dist.',
      render: (_value, row, index) => (
        <Input
          value={row.dist}
          onChange={e =>
            updateOutletConditionField(index, 'dist', e.target.value)
          }
          placeholder="Dist."
          size="small"
          className="!min-w-20"
        />
      ),
    },
    {
      id: 'outlet_value',
      label: 'Outlet Value',
      render: (_value, row, index) => (
        <Autocomplete
          options={customers}
          getOptionLabel={option => `${option.code} - ${option.name}`}
          value={
            customers.find(
              c => c.code === row.outlet_value || c.name === row.outlet_name
            ) || null
          }
          onChange={(_e, newValue) => {
            if (newValue) {
              updateOutletConditionField(index, 'outlet_value', newValue.code);
              updateOutletConditionField(index, 'outlet_name', newValue.name);
            } else {
              updateOutletConditionField(index, 'outlet_value', '');
              updateOutletConditionField(index, 'outlet_name', '');
            }
          }}
          size="small"
          className="!min-w-40"
          renderInput={params => (
            <TextField {...params} placeholder="Select" size="small" />
          )}
        />
      ),
    },
    {
      id: 'start',
      label: 'Start',
      render: (_value, row, index) => (
        <Input
          value={row.start}
          onChange={e =>
            updateOutletConditionField(index, 'start', e.target.value)
          }
          type="date"
          size="small"
          className="!min-w-32"
          slotProps={{ inputLabel: { shrink: true } }}
        />
      ),
    },
    {
      id: 'finish',
      label: 'Finish',
      render: (_value, row, index) => (
        <Input
          value={row.finish}
          onChange={e =>
            updateOutletConditionField(index, 'finish', e.target.value)
          }
          type="date"
          size="small"
          className="!min-w-32"
          slotProps={{ inputLabel: { shrink: true } }}
        />
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_value, _row, index) => (
        <DeleteButton
          onClick={() => removeOutletCondition(index)}
          tooltip="Remove outlet condition"
        />
      ),
    },
  ];

  const productColumns: TableColumn<ProductCondition>[] = [
    {
      id: 'product_group',
      label: 'Product/Group',
      width: 150,
      className: '!px-2',
      render: (_value, row, index) => (
        <Box className="!overflow-hidden w-[300px] !py-1">
          <Autocomplete
            options={products}
            className="!w-[300px]"
            getOptionLabel={option => option.name}
            value={products.find(p => p.name === row.product_group) || null}
            onChange={(_e, newValue) => {
              if (newValue) {
                updateProductCondition(index, 'product_group', newValue.name);
              }
            }}
            size="small"
            renderInput={params => (
              <TextField
                {...params}
                placeholder="Select Product"
                size="small"
                className="!w-[300px]"
              />
            )}
          />
        </Box>
      ),
    },
    {
      id: 'at_least',
      label: 'At least',
      width: 120,
      className: '!px-2',
      render: (_value, row, index) => (
        <Box className="!flex !items-center !gap-1 !max-w-[120px] !py-1">
          <Input
            value={row.at_least}
            onChange={e =>
              updateProductCondition(index, 'at_least', e.target.value)
            }
            placeholder="0.00"
            type="number"
            size="small"
            className="!w-32 !flex-shrink-0"
          />
          <Typography variant="body2" className="!whitespace-nowrap">
            unit
          </Typography>
        </Box>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      width: 80,
      className: '!px-2',
      sortable: false,
      render: (_value, _row, index) => (
        <Box className="!flex !justify-center !max-w-[80px] !py-1">
          <DeleteButton
            onClick={() => removeProductCondition(index)}
            tooltip="Remove product condition"
            size="small"
          />
        </Box>
      ),
    },
  ];

  const currentLocationForm = locationForms[locationTab] || {
    area: '',
    group: '',
    distributor_id: '',
    distributor_name: '',
    role: '',
    slip_limit: false,
    disc_limit: false,
    date_limit: false,
    dc_par: false,
  };

  return (
    <>
      <CustomDrawer
        open={drawerOpen}
        setOpen={handleCancel}
        title={isEdit ? 'Edit Promotion' : 'Create Promotion'}
        size="extra-large"
        fullWidth={true}
      >
        <Box className="!p-5">
          <form onSubmit={formik.handleSubmit} className="!space-y-5">
            <Box className="!grid !grid-cols-1 lg:!grid-cols-2 !gap-5">
              <Box className="!space-y-5">
                <Typography
                  variant="h6"
                  className="!font-semibold !text-gray-900 !mb-4"
                >
                  Header Information
                </Typography>
                <Box className="!grid !grid-cols-2 !gap-4">
                  <Input
                    name="name"
                    label="Name"
                    placeholder="Enter promotion name"
                    formik={formik}
                    required
                  />

                  <Input
                    name="code"
                    label="Code"
                    placeholder="Enter code"
                    formik={formik}
                    required
                  />

                  <Input
                    name="start_date"
                    label="Start"
                    type="date"
                    formik={formik}
                    required
                    slotProps={{ inputLabel: { shrink: true } }}
                  />

                  <Input
                    name="finish_date"
                    label="Finish"
                    type="date"
                    formik={formik}
                    required
                    slotProps={{ inputLabel: { shrink: true } }}
                  />

                  <Box className="!col-span-2">
                    <Typography variant="body2" className="!mb-2 !font-medium">
                      Platform
                    </Typography>
                    <Box className="!flex !gap-4">
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formik.values.office}
                            onChange={formik.handleChange}
                            name="office"
                          />
                        }
                        label="Office"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formik.values.mobile}
                            onChange={formik.handleChange}
                            name="mobile"
                          />
                        }
                        label="Mobile"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formik.values.b2b}
                            onChange={formik.handleChange}
                            name="b2b"
                          />
                        }
                        label="B2B"
                      />
                    </Box>
                  </Box>

                  <Box className="!col-span-2">
                    <Typography variant="body2" className="!mb-2 !font-medium">
                      Level Type
                    </Typography>
                    <RadioGroup
                      row
                      value={levelType}
                      onChange={e => setLevelType(e.target.value)}
                    >
                      <FormControlLabel
                        value="condition_count"
                        control={<Radio size="small" />}
                        label="Condition Count"
                      />
                      <FormControlLabel
                        value="total"
                        control={<Radio size="small" />}
                        label="Total"
                      />
                      <FormControlLabel
                        value="species"
                        control={<Radio size="small" />}
                        label="Species"
                      />
                      <FormControlLabel
                        value="factor"
                        control={<Radio size="small" />}
                        label="Factor"
                      />
                    </RadioGroup>
                  </Box>
                </Box>

                <Box className="!space-y-4 !mt-5">
                  <Typography
                    variant="h6"
                    className="!font-semibold !text-gray-900"
                  >
                    Promotion Product Condition
                  </Typography>

                  <Box>
                    <Typography variant="body2" className="!mb-2 !font-medium">
                      Quantity Type
                    </Typography>
                    <RadioGroup
                      row
                      value={quantityType}
                      onChange={e => setQuantityType(e.target.value)}
                    >
                      <FormControlLabel
                        value="quantity"
                        control={<Radio size="small" />}
                        label="Quantity"
                      />
                      <FormControlLabel
                        value="price"
                        control={<Radio size="small" />}
                        label="Price"
                      />
                      <FormControlLabel
                        value="weight"
                        control={<Radio size="small" />}
                        label="Weight"
                      />
                      <FormControlLabel
                        value="volume"
                        control={<Radio size="small" />}
                        label="Volume"
                      />
                      <FormControlLabel
                        value="epoint"
                        control={<Radio size="small" />}
                        label="EPoint"
                      />
                    </RadioGroup>
                  </Box>

                  <Box className="!flex !justify-between !items-center">
                    <Typography variant="body2" className="!font-medium">
                      Product/Group
                    </Typography>
                    <Button
                      type="button"
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={addProductCondition}
                      size="small"
                    >
                      Add
                    </Button>
                  </Box>

                  {productConditions.length > 0 && (
                    <Box
                      className="!w-full !mt-2"
                      sx={{
                        '& .MuiTableContainer-root': {
                          overflowX: 'hidden !important',
                          width: '100%',
                        },
                        '& .MuiTable-root': {
                          tableLayout: 'fixed !important',
                          width: '100% !important',
                          minWidth: '0 !important',
                        },
                        '& .MuiTableCell-root': {
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          padding: '8px 8px !important',
                        },
                        '& .MuiTableCell-head': {
                          padding: '12px 8px !important',
                        },
                      }}
                    >
                      <Table
                        data={productConditions}
                        columns={productColumns}
                        getRowId={row => row._index.toString()}
                        pagination={false}
                        sortable={false}
                      />
                    </Box>
                  )}
                </Box>
              </Box>

              <Box className="!space-y-5">
                <Box className="!space-y-4">
                  <Typography
                    variant="h6"
                    className="!font-semibold !text-gray-900"
                  >
                    Suitable Outlets
                  </Typography>
                  <Box className="!flex !justify-end !mb-2">
                    <Button
                      type="button"
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={addOutletCondition}
                      size="small"
                    >
                      Add
                    </Button>
                  </Box>

                  {outletConditions.length > 0 && (
                    <Table
                      data={outletConditions}
                      columns={outletColumns}
                      getRowId={row => row._index.toString()}
                      pagination={false}
                      sortable={false}
                    />
                  )}

                  <Box className="!space-y-2">
                    <Box className="!flex !gap-4 !items-center">
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={dateFilter.date_from_enabled}
                            onChange={e =>
                              setDateFilter({
                                ...dateFilter,
                                date_from_enabled: e.target.checked,
                              })
                            }
                          />
                        }
                        label="Date >="
                      />
                      <Input
                        type="date"
                        className="!w-40"
                        value={dateFilter.date_from}
                        onChange={e =>
                          setDateFilter({
                            ...dateFilter,
                            date_from: e.target.value,
                          })
                        }
                        disabled={!dateFilter.date_from_enabled}
                        slotProps={{ inputLabel: { shrink: true } }}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={dateFilter.date_to_enabled}
                            onChange={e =>
                              setDateFilter({
                                ...dateFilter,
                                date_to_enabled: e.target.checked,
                              })
                            }
                          />
                        }
                        label="Date <="
                      />
                      <Input
                        type="date"
                        className="!w-40"
                        value={dateFilter.date_to}
                        onChange={e =>
                          setDateFilter({
                            ...dateFilter,
                            date_to: e.target.value,
                          })
                        }
                        disabled={!dateFilter.date_to_enabled}
                        slotProps={{ inputLabel: { shrink: true } }}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleApplyDynamicOutletGroups}
                      >
                        Apply Dyn. Outlet Groups
                      </Button>
                    </Box>

                    <Typography variant="body2" className="!font-medium !mt-4">
                      Document Types
                    </Typography>
                    <Box className="!grid !grid-cols-2 !gap-2">
                      {Object.entries(documentTypes).map(([type, checked]) => (
                        <FormControlLabel
                          key={type}
                          control={
                            <Checkbox
                              checked={checked}
                              onChange={e =>
                                setDocumentTypes({
                                  ...documentTypes,
                                  [type]: e.target.checked,
                                })
                              }
                            />
                          }
                          label={type}
                        />
                      ))}
                    </Box>
                  </Box>
                </Box>

                <Box className="!space-y-4 !mt-5">
                  <Box className="!bg-white !rounded-lg !border !border-gray-200">
                    <Tabs
                      value={locationTab}
                      onChange={(_, newValue: number) => {
                        setLocationTab(newValue);
                        if (!locationForms[newValue]) {
                          setLocationForms({
                            ...locationForms,
                            [newValue]: {
                              area: '',
                              group: '',
                              distributor_id: '',
                              distributor_name: '',
                              role: '',
                              slip_limit: false,
                              disc_limit: false,
                              date_limit: false,
                              dc_par: false,
                            },
                          });
                        }
                      }}
                    >
                      <Tab label="LOCATION" />
                      <Tab label="DISTRIBUTOR" />
                      <Tab label="SELLER" />
                      <Tab label="OUTLET 1" />
                      <Tab label="OUTLET 2" />
                    </Tabs>
                  </Box>

                  <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
                    <Select
                      label="Area"
                      value={currentLocationForm.area}
                      onChange={e => {
                        setLocationForms({
                          ...locationForms,
                          [locationTab]: {
                            ...currentLocationForm,
                            area: e.target.value,
                          },
                        });
                      }}
                    >
                      <MenuItem value="">Select Area</MenuItem>
                    </Select>

                    <Select
                      label="Group"
                      value={currentLocationForm.group}
                      onChange={e => {
                        setLocationForms({
                          ...locationForms,
                          [locationTab]: {
                            ...currentLocationForm,
                            group: e.target.value,
                          },
                        });
                      }}
                    >
                      <MenuItem value="">Select Group</MenuItem>
                    </Select>

                    <Autocomplete
                      options={depots}
                      getOptionLabel={option =>
                        `${option.code} - ${option.name}`
                      }
                      value={
                        depots.find(
                          d =>
                            d.id.toString() ===
                            currentLocationForm.distributor_id
                        ) || null
                      }
                      onChange={(_e, newValue) => {
                        setLocationForms({
                          ...locationForms,
                          [locationTab]: {
                            ...currentLocationForm,
                            distributor_id: newValue
                              ? newValue.id.toString()
                              : '',
                            distributor_name: newValue ? newValue.name : '',
                          },
                        });
                      }}
                      fullWidth
                      renderInput={params => (
                        <TextField
                          {...params}
                          label="Distributor"
                          size="small"
                        />
                      )}
                    />

                    <Select
                      label="Role"
                      value={currentLocationForm.role}
                      onChange={e => {
                        setLocationForms({
                          ...locationForms,
                          [locationTab]: {
                            ...currentLocationForm,
                            role: e.target.value,
                          },
                        });
                      }}
                    >
                      <MenuItem value="">Select Role</MenuItem>
                    </Select>

                    <Box className="md:!col-span-2 !flex !gap-2">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleLocationNew}
                      >
                        New
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleLocationUpdate}
                      >
                        Update
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleLocationDelete}
                      >
                        Del
                      </Button>
                    </Box>

                    <Box className="md:!col-span-2 !flex !gap-4">
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={currentLocationForm.slip_limit}
                            onChange={e => {
                              setLocationForms({
                                ...locationForms,
                                [locationTab]: {
                                  ...currentLocationForm,
                                  slip_limit: e.target.checked,
                                },
                              });
                            }}
                          />
                        }
                        label="Slip Lim.:"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={currentLocationForm.disc_limit}
                            onChange={e => {
                              setLocationForms({
                                ...locationForms,
                                [locationTab]: {
                                  ...currentLocationForm,
                                  disc_limit: e.target.checked,
                                },
                              });
                            }}
                          />
                        }
                        label="Disc. Lim."
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={currentLocationForm.date_limit}
                            onChange={e => {
                              setLocationForms({
                                ...locationForms,
                                [locationTab]: {
                                  ...currentLocationForm,
                                  date_limit: e.target.checked,
                                },
                              });
                            }}
                          />
                        }
                        label="Date:"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={currentLocationForm.dc_par}
                            onChange={e => {
                              setLocationForms({
                                ...locationForms,
                                [locationTab]: {
                                  ...currentLocationForm,
                                  dc_par: e.target.checked,
                                },
                              });
                            }}
                          />
                        }
                        label="D/C Par.:"
                      />
                    </Box>
                  </Box>
                </Box>

                <Box className="!space-y-4 !mt-5">
                  <Box className="!flex !justify-between !items-center">
                    <Typography
                      variant="h6"
                      className="!font-semibold !text-gray-900"
                    >
                      LEVEL
                    </Typography>
                    <Button
                      type="button"
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={addPromotionLevel}
                      size="small"
                    >
                      Add
                    </Button>
                  </Box>

                  {promotionLevels.length > 0 && (
                    <Table
                      data={promotionLevels}
                      columns={levelColumns}
                      getRowId={row => row._index.toString()}
                      pagination={false}
                      sortable={false}
                    />
                  )}

                  <Box className="!grid !grid-cols-3 !gap-4 !items-end">
                    <Input
                      label="Level:"
                      placeholder="Level"
                      type="number"
                      value={levelInput.level}
                      onChange={e =>
                        setLevelInput({ ...levelInput, level: e.target.value })
                      }
                    />
                    <Select
                      label="unit"
                      value={levelInput.unit}
                      onChange={e =>
                        setLevelInput({ ...levelInput, unit: e.target.value })
                      }
                    >
                      <MenuItem value="">Select unit</MenuItem>
                      <MenuItem value="unit">unit</MenuItem>
                    </Select>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={levelInput.step}
                          onChange={e =>
                            setLevelInput({
                              ...levelInput,
                              step: e.target.checked,
                            })
                          }
                        />
                      }
                      label="Step:"
                    />
                    <Box className="!col-span-3 !flex !gap-2">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={updatePromotionLevel}
                        disabled={selectedLevelIndex === null}
                      >
                        Update
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={addPromotionLevel}
                      >
                        New
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          if (selectedLevelIndex !== null) {
                            removePromotionLevel(selectedLevelIndex);
                            setSelectedLevelIndex(null);
                            setLevelInput({ level: '', unit: '', step: false });
                          }
                        }}
                        disabled={selectedLevelIndex === null}
                      >
                        Del
                      </Button>
                    </Box>
                  </Box>
                </Box>

                <Box className="!space-y-4 !mt-5">
                  <Box className="!flex !justify-between !items-center">
                    <Typography
                      variant="h6"
                      className="!font-semibold !text-gray-900"
                    >
                      GIFT
                    </Typography>
                    <Button
                      type="button"
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={addPromotionGift}
                      size="small"
                    >
                      Add
                    </Button>
                  </Box>

                  {promotionGifts.length > 0 && (
                    <Table
                      data={promotionGifts}
                      columns={giftColumns}
                      getRowId={row => row._index.toString()}
                      pagination={false}
                      sortable={false}
                    />
                  )}

                  <Box className="!space-y-4">
                    <Typography variant="body2" className="!font-medium">
                      Type
                    </Typography>
                    <RadioGroup
                      row
                      value={giftType}
                      onChange={e => setGiftType(e.target.value)}
                    >
                      <FormControlLabel
                        value="free_product"
                        control={<Radio size="small" />}
                        label="Free Product"
                      />
                      <FormControlLabel
                        value="percent"
                        control={<Radio size="small" />}
                        label="Percent"
                      />
                      <FormControlLabel
                        value="amount"
                        control={<Radio size="small" />}
                        label="Amount"
                      />
                      <FormControlLabel
                        value="epoint"
                        control={<Radio size="small" />}
                        label="EPoint"
                      />
                    </RadioGroup>

                    <Box className="!grid !grid-cols-2 !gap-4">
                      <Input
                        name="disc_amount"
                        label="Disc. (Amount)"
                        type="number"
                        formik={formik}
                      />
                      <Input
                        name="maximum"
                        label="Maximum"
                        type="number"
                        formik={formik}
                      />
                    </Box>

                    <Box className="!bg-white !rounded-lg !border !border-gray-200">
                      <Tabs
                        value={giftProductTab}
                        onChange={(_, newValue: number) =>
                          setGiftProductTab(newValue)
                        }
                      >
                        <Tab label="PRODUCT" />
                        <Tab label="PROD. GROUP" />
                        <Tab label="DYN. PROD. GR." />
                        <Tab label="CONDITIONAL PRODUCTS" />
                        <Tab label="INVOICE" />
                      </Tabs>
                    </Box>

                    <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
                      <Autocomplete
                        options={products}
                        size="small"
                        getOptionLabel={option =>
                          `${option.code} - ${option.name}`
                        }
                        value={
                          products.find(p => p.code === giftInput.code) || null
                        }
                        onChange={(_e, newValue) => {
                          setGiftInput({
                            ...giftInput,
                            code: newValue ? newValue.code : '',
                            name: newValue ? newValue.name : '',
                          });
                        }}
                        renderInput={params => (
                          <TextField
                            {...params}
                            label="Code"
                            placeholder="Product code"
                          />
                        )}
                      />
                      <Input
                        label="Name"
                        placeholder="Product name"
                        value={giftInput.name}
                        onChange={e =>
                          setGiftInput({ ...giftInput, name: e.target.value })
                        }
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={giftInput.product_not_in_condition}
                            onChange={e =>
                              setGiftInput({
                                ...giftInput,
                                product_not_in_condition: e.target.checked,
                              })
                            }
                          />
                        }
                        label="Product may not be in condition"
                      />
                    </Box>

                    <Box className="!flex !gap-2">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={updatePromotionGift}
                        disabled={selectedGiftIndex === null}
                      >
                        Update
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={addPromotionGift}
                      >
                        New
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          if (selectedGiftIndex !== null) {
                            removePromotionGift(selectedGiftIndex);
                            setSelectedGiftIndex(null);
                            setGiftInput({
                              code: '',
                              name: '',
                              product_not_in_condition: false,
                            });
                          }
                        }}
                        disabled={selectedGiftIndex === null}
                      >
                        Del
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>

            <Box className="!flex !justify-end !gap-2 !pt-4 !border-t !border-gray-200">
              <Button type="button" variant="outlined" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="outlined"
                className="!text-gray-600"
                startIcon={<Description />}
                onClick={handleDescription}
              >
                Description
              </Button>
              <Button
                type="button"
                variant="outlined"
                className="!text-gray-600"
                startIcon={<ContentCopy />}
                onClick={handleCopyPromotion}
              >
                Copy
              </Button>
              <Button
                type="submit"
                variant="contained"
                className="!bg-green-600 hover:!bg-green-700"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : 'Save'}
              </Button>
            </Box>
          </form>
        </Box>
      </CustomDrawer>

      <Dialog
        open={descriptionDialogOpen}
        onClose={() => setDescriptionDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Promotion Description</DialogTitle>
        <DialogContent>
          <Input
            name="description"
            label="Description"
            placeholder="Enter promotion description"
            formik={formik}
            multiline
            rows={6}
            className="!mt-4"
          />
          <Box className="!flex !justify-end !gap-2 !mt-4">
            <Button
              variant="outlined"
              onClick={() => setDescriptionDialogOpen(false)}
            >
              Close
            </Button>
            <Button
              variant="contained"
              onClick={() => setDescriptionDialogOpen(false)}
            >
              Save
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ManagePromotion;
