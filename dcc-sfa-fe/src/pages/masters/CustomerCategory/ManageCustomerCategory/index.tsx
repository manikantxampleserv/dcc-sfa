import { Add, InfoOutline } from '@mui/icons-material';
import { Box, Chip, MenuItem, Skeleton, Typography } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateCustomerCategory,
  useCustomerCategoryById,
  useUpdateCustomerCategory,
  type CustomerCategory,
  type ManageCustomerCategoryPayload,
} from 'hooks/useCustomerCategory';
import { useProductCategories } from 'hooks/useProductCategories';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import ActiveInactiveField from 'shared/ActiveInactiveField';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import ProductCategorySelect from 'shared/ProductCategorySelect';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import * as Yup from 'yup';

interface ManageCustomerCategoryProps {
  selectedCustomerCategory?: CustomerCategory | null;
  setSelectedCustomerCategory: (category: CustomerCategory | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

interface ConditionFormData {
  _index: number;
  id?: number;
  condition_type: string;
  condition_operator: string;
  min_threshold_value: string;
  max_threshold_value: string;
  threshold_value?: string;
  product_category_id: string;
  condition_description: string;
  is_active: string;
}

const customerCategoryValidationSchema = Yup.object({
  category_name: Yup.string()
    .required('Outlet category name is required')
    .min(2, 'Outlet category name must be at least 2 characters')
    .max(255, 'Outlet category name must be less than 255 characters'),
  category_code: Yup.string()
    .required('Outlet category code is required')
    .min(2, 'Outlet category code must be at least 2 characters')
    .max(50, 'Outlet category code must be less than 50 characters'),
  level: Yup.number()
    .typeError('Outlet category level must be a number')
    .required('Outlet category level is required')
    .min(1, 'Outlet category level must be at least 1')
    .max(99, 'Outlet category level must be less than 100'),
  logical_condition: Yup.string()
    .oneOf(['AND', 'OR'], 'Logical condition must be AND or OR')
    .required('Logical condition is required'),
  is_active: Yup.string().oneOf(['Y', 'N']).required('Status is required'),
});

const CONDITION_TYPES = [
  { value: 'sales_amount', label: 'Sales Amount (₹)' },
  { value: 'order_count', label: 'Order Count' },
  { value: 'average_order_value', label: 'Average Order Value (₹)' },
];

const CONDITION_OPERATORS = [
  { value: '>=', label: 'Greater than or equal (>=)' },
  { value: '<=', label: 'Less than or equal (<=)' },
  { value: '>', label: 'Greater than (>)' },
  { value: '<', label: 'Less than (<)' },
  { value: '=', label: 'Equal (=)' },
  { value: '!=', label: 'Not equal (!=)' },
  { value: 'BETWEEN', label: 'Between (BETWEEN)' },
];

/**
 * Resolves a readable display label for condition types.
 * @param type - Condition type identifier.
 */
const getConditionTypeLabel = (type: string): string => {
  const found = CONDITION_TYPES.find(t => t.value === type);
  if (found) return found.label;
  return type.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
};

/**
 * Returns placeholder text for threshold inputs.
 * @param conditionType - The condition type.
 * @param field - Field kind: min or max.
 */
const getThresholdPlaceholder = (
  conditionType: string,
  field: 'min' | 'max' = 'min'
): string => {
  if (field === 'min') {
    return conditionType === 'order_count' ? 'e.g., 5' : 'e.g., 500000';
  }
  return conditionType === 'order_count' ? 'e.g., 20' : 'e.g., 1000000';
};

/**
 * Auto-generates a condition description if none was provided by the user.
 */
const generateConditionDescription = (
  type: string,
  operator: string,
  minThreshold?: string,
  maxThreshold?: string,
  productCategoryName?: string
): string => {
  const typeLabel = getConditionTypeLabel(type);
  const catText = productCategoryName ? ` (${productCategoryName})` : '';
  if (operator === 'BETWEEN') {
    const minStr = minThreshold ? Number(minThreshold).toLocaleString() : '0';
    const maxStr = maxThreshold ? Number(maxThreshold).toLocaleString() : '0';
    return `${typeLabel}${catText} between ${minStr} and ${maxStr}`;
  }
  if (operator === '<=' || operator === '<') {
    const maxStr = maxThreshold ? Number(maxThreshold).toLocaleString() : '0';
    return `${typeLabel}${catText} ${operator} ${maxStr}`;
  }
  const minStr = minThreshold ? Number(minThreshold).toLocaleString() : '0';
  return `${typeLabel}${catText} ${operator} ${minStr}`;
};

const defaultConditionInput: ConditionFormData = {
  _index: 0,
  condition_type: 'sales_amount',
  condition_operator: '>=',
  min_threshold_value: '',
  max_threshold_value: '',
  threshold_value: '',
  product_category_id: '',
  condition_description: '',
  is_active: 'Y',
};

const ManageCustomerCategory: React.FC<ManageCustomerCategoryProps> = ({
  selectedCustomerCategory,
  setSelectedCustomerCategory,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedCustomerCategory;
  const [conditions, setConditions] = useState<ConditionFormData[]>([]);
  const [selectedConditionIndex, setSelectedConditionIndex] = useState<
    number | null
  >(null);
  const [conditionInput, setConditionInput] = useState<ConditionFormData>(
    defaultConditionInput
  );

  const { data: productCategoriesResponse } = useProductCategories({
    limit: 1000,
  });
  const productCategories = productCategoriesResponse?.data || [];

  const { data: categoryDetailResponse, isLoading: isLoadingCategoryDetail } =
    useCustomerCategoryById(selectedCustomerCategory?.id || 0, {
      enabled: isEdit && !!selectedCustomerCategory?.id,
    });

  useEffect(() => {
    if (categoryDetailResponse && isEdit) {
      const loadedConditions: ConditionFormData[] =
        categoryDetailResponse.conditions?.map((cond, index) => {
          const op = cond.condition_operator || '>=';
          const isMaxOnly = op === '<=' || op === '<';
          const isMinOnly = op === '>=' || op === '>' || op === '=';

          const minVal =
            cond.min_threshold_value !== null &&
            cond.min_threshold_value !== undefined
              ? cond.min_threshold_value.toString()
              : isMinOnly &&
                  cond.threshold_value !== null &&
                  cond.threshold_value !== undefined
                ? cond.threshold_value.toString()
                : '';

          const maxVal =
            cond.max_threshold_value !== null &&
            cond.max_threshold_value !== undefined
              ? cond.max_threshold_value.toString()
              : isMaxOnly &&
                  cond.threshold_value !== null &&
                  cond.threshold_value !== undefined
                ? cond.threshold_value.toString()
                : '';

          return {
            _index: index,
            id: cond.id,
            condition_type: cond.condition_type || 'sales_amount',
            condition_operator: op,
            min_threshold_value: minVal,
            max_threshold_value: maxVal,
            threshold_value:
              cond.threshold_value?.toString() || minVal || maxVal || '',
            product_category_id: cond.product_category_id?.toString() || '',
            condition_description: cond.condition_description || '',
            is_active: cond.is_active || 'Y',
          };
        }) || [];
      setConditions(loadedConditions);
    } else {
      setConditions([]);
    }
    setSelectedConditionIndex(null);
    setConditionInput(defaultConditionInput);
  }, [categoryDetailResponse, isEdit]);

  const handleCancel = () => {
    setSelectedCustomerCategory(null);
    setDrawerOpen(false);
    setConditions([]);
    setSelectedConditionIndex(null);
    setConditionInput(defaultConditionInput);
    formik.resetForm();
  };

  const createCustomerCategoryMutation = useCreateCustomerCategory();
  const updateCustomerCategoryMutation = useUpdateCustomerCategory();

  const validateCondition = (
    input: ConditionFormData,
    editIndex: number | null = null
  ): boolean => {
    if (!input.condition_type.trim()) {
      toast.error('Condition type is required');
      return false;
    }

    if (input.condition_operator === 'BETWEEN') {
      if (!input.min_threshold_value.trim()) {
        toast.error('Minimum threshold value is required for BETWEEN operator');
        return false;
      }
      if (!input.max_threshold_value.trim()) {
        toast.error('Maximum threshold value is required for BETWEEN operator');
        return false;
      }

      const minVal = parseFloat(input.min_threshold_value);
      const maxVal = parseFloat(input.max_threshold_value);

      if (isNaN(minVal) || minVal < 0) {
        toast.error(
          'Minimum threshold value must be a valid non-negative number'
        );
        return false;
      }
      if (isNaN(maxVal) || maxVal < 0) {
        toast.error(
          'Maximum threshold value must be a valid non-negative number'
        );
        return false;
      }
      if (minVal > maxVal) {
        toast.error(
          'Minimum threshold value cannot be greater than Maximum threshold value'
        );
        return false;
      }
    } else if (
      input.condition_operator === '<=' ||
      input.condition_operator === '<'
    ) {
      if (!input.max_threshold_value.trim()) {
        toast.error(
          `Maximum threshold value is required for ${getConditionTypeLabel(input.condition_type)}`
        );
        return false;
      }
      const maxVal = parseFloat(input.max_threshold_value);
      if (isNaN(maxVal) || maxVal < 0) {
        toast.error(
          'Please enter a valid positive number for maximum threshold value'
        );
        return false;
      }
      if (input.min_threshold_value.trim()) {
        const minVal = parseFloat(input.min_threshold_value);
        if (minVal > maxVal) {
          toast.error(
            'Minimum threshold value cannot be greater than Maximum threshold value'
          );
          return false;
        }
      }
    } else {
      if (!input.min_threshold_value.trim()) {
        toast.error(
          `Minimum threshold value is required for ${getConditionTypeLabel(input.condition_type)}`
        );
        return false;
      }
      const minVal = parseFloat(input.min_threshold_value);
      if (isNaN(minVal) || minVal < 0) {
        toast.error(
          'Please enter a valid positive number for minimum threshold value'
        );
        return false;
      }
      if (input.max_threshold_value.trim()) {
        const maxVal = parseFloat(input.max_threshold_value);
        if (minVal > maxVal) {
          toast.error(
            'Minimum threshold value cannot be greater than Maximum threshold value'
          );
          return false;
        }
      }
    }

    const isDuplicate = conditions.some(
      (cond, i) =>
        (editIndex === null || i !== editIndex) &&
        cond.condition_type === input.condition_type &&
        cond.condition_operator === input.condition_operator &&
        (cond.product_category_id || '') === (input.product_category_id || '')
    );

    if (isDuplicate) {
      toast.error(
        'A condition with this type, operator and product category already exists'
      );
      return false;
    }

    return true;
  };

  const addCondition = () => {
    if (!validateCondition(conditionInput)) return;

    const selectedProductCat = productCategories.find(
      (c: { id?: number; category_name?: string }) =>
        c.id === Number(conditionInput.product_category_id)
    );

    const minStr = conditionInput.min_threshold_value.trim();
    const maxStr = conditionInput.max_threshold_value.trim();
    const threshStr = minStr || maxStr || '0';

    const description =
      conditionInput.condition_description.trim() ||
      generateConditionDescription(
        conditionInput.condition_type,
        conditionInput.condition_operator,
        minStr,
        maxStr,
        selectedProductCat?.category_name
      );

    const newCondition: ConditionFormData = {
      _index: conditions.length,
      condition_type: conditionInput.condition_type,
      condition_operator: conditionInput.condition_operator,
      min_threshold_value: minStr,
      max_threshold_value: maxStr,
      threshold_value: threshStr,
      product_category_id: conditionInput.product_category_id,
      condition_description: description,
      is_active: conditionInput.is_active,
    };

    setConditions([...conditions, newCondition]);
    setConditionInput(defaultConditionInput);
    setSelectedConditionIndex(null);
    toast.success('Condition added successfully');
  };

  const removeCondition = (index: number) => {
    const updated = conditions
      .filter((_, i) => i !== index)
      .map((cond, i) => ({
        ...cond,
        _index: i,
      }));
    setConditions(updated);
    setSelectedConditionIndex(null);
  };

  const handleConditionRowClick = (row: ConditionFormData) => {
    setSelectedConditionIndex(row._index);
    setConditionInput({
      _index: row._index,
      id: row.id,
      condition_type: row.condition_type,
      condition_operator: row.condition_operator,
      min_threshold_value: row.min_threshold_value || '',
      max_threshold_value: row.max_threshold_value || '',
      threshold_value: row.threshold_value || '',
      product_category_id: row.product_category_id,
      condition_description: row.condition_description || '',
      is_active: row.is_active,
    });
  };

  const formik = useFormik({
    initialValues: {
      category_name: selectedCustomerCategory?.category_name || '',
      category_code: selectedCustomerCategory?.category_code || '',
      level: selectedCustomerCategory?.level ?? 1,
      logical_condition: selectedCustomerCategory?.logical_condition || 'AND',
      is_active: selectedCustomerCategory?.is_active || 'Y',
    },
    validationSchema: customerCategoryValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const categoryData: ManageCustomerCategoryPayload = {
          category_name: values.category_name,
          category_code: values.category_code,
          level: Number(values.level),
          logical_condition: values.logical_condition as 'AND' | 'OR',
          is_active: values.is_active,
          conditions: conditions.map(cond => {
            const minNum =
              cond.min_threshold_value !== '' &&
              cond.min_threshold_value !== undefined
                ? Number(cond.min_threshold_value)
                : null;

            const maxNum =
              cond.max_threshold_value !== '' &&
              cond.max_threshold_value !== undefined
                ? Number(cond.max_threshold_value)
                : null;

            const threshNum = minNum ?? maxNum ?? 0;

            return {
              ...(cond.id && { id: cond.id }),
              condition_type: cond.condition_type,
              condition_operator: cond.condition_operator,
              min_threshold_value: minNum,
              max_threshold_value: maxNum,
              threshold_value: threshNum,
              product_category_id: cond.product_category_id
                ? Number(cond.product_category_id)
                : null,
              condition_description: cond.condition_description || null,
              is_active: cond.is_active || 'Y',
            };
          }),
        };

        if (isEdit && selectedCustomerCategory) {
          await updateCustomerCategoryMutation.mutateAsync({
            id: selectedCustomerCategory.id,
            data: categoryData,
          });
        } else {
          await createCustomerCategoryMutation.mutateAsync(categoryData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving customer category:', error);
      }
    },
  });

  const conditionColumns: TableColumn<ConditionFormData>[] = [
    {
      id: 'condition_type',
      label: 'Condition Type',
      render: (_value, row) => (
        <Box
          onClick={() => handleConditionRowClick(row)}
          style={{ cursor: 'pointer' }}
        >
          <Typography
            variant="body2"
            className={
              selectedConditionIndex === row._index
                ? '!font-bold !text-primary-600'
                : '!font-medium !text-gray-900'
            }
          >
            {getConditionTypeLabel(row.condition_type)}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'condition_operator',
      label: 'Operator',
      render: (_value, row) => (
        <Chip
          label={row.condition_operator || '-'}
          size="small"
          variant="outlined"
          className="!font-semibold !text-xs"
        />
      ),
    },
    {
      id: 'min_threshold_value',
      label: 'Min Threshold',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-700 !font-medium">
          {row.min_threshold_value !== '' &&
          row.min_threshold_value !== undefined &&
          row.min_threshold_value !== null
            ? Number(row.min_threshold_value).toLocaleString()
            : '-'}
        </Typography>
      ),
    },
    {
      id: 'max_threshold_value',
      label: 'Max Threshold',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-700 !font-medium">
          {row.max_threshold_value !== '' &&
          row.max_threshold_value !== undefined &&
          row.max_threshold_value !== null
            ? Number(row.max_threshold_value).toLocaleString()
            : '-'}
        </Typography>
      ),
    },
    {
      id: 'product_category',
      label: 'Product Category',
      render: (_value, row) => {
        const category = productCategories.find(
          (cat: { id?: number }) => cat.id === Number(row.product_category_id)
        );
        return (
          <Typography variant="body2" className="!text-gray-700">
            {category?.category_name || '-'}
          </Typography>
        );
      },
    },
    {
      id: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <EditButton
            onClick={() => handleConditionRowClick(row)}
            tooltip="Edit condition"
            size="small"
          />
          <DeleteButton
            onClick={() => removeCondition(row._index)}
            tooltip="Remove condition"
            confirmDelete={true}
            size="small"
            itemName="condition"
          />
        </Box>
      ),
    },
  ];

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Outlet Category' : 'Create Outlet Category'}
      size="large"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 lg:!grid-cols-2 !gap-6">
            <Input
              name="category_name"
              label="Outlet Category Name"
              placeholder="Enter category name"
              formik={formik}
              required
            />

            <Input
              name="category_code"
              label="Outlet Category Code"
              placeholder="Enter outlet category code"
              formik={formik}
              required
            />

            <Input
              type="number"
              name="level"
              label="Category Level"
              placeholder="Enter category level"
              formik={formik}
              required
            />

            <Select
              name="logical_condition"
              label="Logical Condition"
              formik={formik}
              disableClearable
              required
            >
              <MenuItem value="AND">Match ALL Conditions (AND)</MenuItem>
              <MenuItem value="OR">Match ANY Condition (OR)</MenuItem>
            </Select>

            <ActiveInactiveField
              name="is_active"
              formik={formik}
              className="col-span-2"
            />
          </Box>

          <Box className="!space-y-4 !mt-6">
            <Box className="!flex !justify-between !items-center">
              <Typography
                variant="h6"
                className="!font-semibold !text-gray-900"
              >
                Category Conditions
              </Typography>
              {selectedConditionIndex === null && (
                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={addCondition}
                  size="small"
                >
                  Add Condition
                </Button>
              )}
            </Box>

            <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
              <Select
                value={conditionInput.condition_type}
                onChange={e =>
                  setConditionInput({
                    ...conditionInput,
                    condition_type: e.target.value,
                  })
                }
                label="Condition Type"
                size="small"
                fullWidth
                disableClearable
              >
                {CONDITION_TYPES.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
                {conditionInput.condition_type &&
                  !CONDITION_TYPES.some(
                    t => t.value === conditionInput.condition_type
                  ) && (
                    <MenuItem value={conditionInput.condition_type}>
                      {getConditionTypeLabel(conditionInput.condition_type)}
                    </MenuItem>
                  )}
              </Select>

              <Select
                value={conditionInput.condition_operator}
                onChange={e =>
                  setConditionInput({
                    ...conditionInput,
                    condition_operator: e.target.value,
                  })
                }
                label="Operator"
                size="small"
                fullWidth
                disableClearable
              >
                {CONDITION_OPERATORS.map(op => (
                  <MenuItem key={op.value} value={op.value}>
                    {op.label}
                  </MenuItem>
                ))}
              </Select>
            </Box>

            <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
              <Input
                value={conditionInput.min_threshold_value}
                onChange={e =>
                  setConditionInput({
                    ...conditionInput,
                    min_threshold_value: e.target.value,
                  })
                }
                label="Min Threshold Value"
                placeholder={getThresholdPlaceholder(
                  conditionInput.condition_type,
                  'min'
                )}
                helperText={
                  conditionInput.condition_operator === '<=' ||
                  conditionInput.condition_operator === '<'
                    ? 'Optional lower bound'
                    : 'Minimum required value'
                }
                type="number"
                size="small"
                fullWidth
                required={
                  conditionInput.condition_operator !== '<=' &&
                  conditionInput.condition_operator !== '<'
                }
              />

              <Input
                value={conditionInput.max_threshold_value}
                onChange={e =>
                  setConditionInput({
                    ...conditionInput,
                    max_threshold_value: e.target.value,
                  })
                }
                label="Max Threshold Value"
                placeholder={getThresholdPlaceholder(
                  conditionInput.condition_type,
                  'max'
                )}
                helperText={
                  conditionInput.condition_operator === '>=' ||
                  conditionInput.condition_operator === '>'
                    ? 'Optional upper bound'
                    : 'Maximum allowable value'
                }
                type="number"
                size="small"
                fullWidth
                required={
                  conditionInput.condition_operator === 'BETWEEN' ||
                  conditionInput.condition_operator === '<=' ||
                  conditionInput.condition_operator === '<'
                }
              />
            </Box>

            <ProductCategorySelect
              value={conditionInput.product_category_id}
              onChange={(_event, category) =>
                setConditionInput({
                  ...conditionInput,
                  product_category_id: category ? category.id.toString() : '',
                })
              }
              label="Product Category (Optional)"
              size="small"
              fullWidth
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="font-semibold text-blue-900 mb-2 flex items-center gap-1 text-xs">
                <InfoOutline fontSize="small" /> How Conditions Work:
              </div>
              <div className="text-blue-800 text-xs mb-1.5">
                <span className="font-bold">Example 1:</span> "Sales Amount
                BETWEEN 500000 and 1000000" → Customers with sales between
                ₹500,000 and ₹1,000,000
              </div>
              <div className="text-blue-800 text-xs mb-1.5">
                <span className="font-bold">Example 2:</span> "Order Count ≥ 10"
                → Customers who placed at least 10 orders
              </div>
              <div className="text-blue-800 text-xs">
                <span className="font-bold">Condition Logic:</span> If set to{' '}
                <span className="italic font-medium">AND</span>, customer must
                satisfy all conditions. If set to{' '}
                <span className="italic font-medium">OR</span>, satisfying any
                condition qualifies.
              </div>
            </div>

            {isLoadingCategoryDetail && isEdit ? (
              <Box className="!mt-4">
                <Box className="!bg-white !rounded-lg !border !border-gray-200 !p-4">
                  <Box className="!space-y-3">
                    {[1, 2, 3].map(row => (
                      <Box
                        key={row}
                        className="!flex !items-center !gap-4 !pb-3 !border-b !border-gray-100 last:!border-0"
                      >
                        <Skeleton
                          variant="text"
                          width="20%"
                          height={24}
                          className="!flex-1"
                        />
                        <Skeleton
                          variant="text"
                          width="15%"
                          height={24}
                          className="!flex-1"
                        />
                        <Skeleton
                          variant="text"
                          width="15%"
                          height={24}
                          className="!flex-1"
                        />
                        <Skeleton
                          variant="text"
                          width="20%"
                          height={24}
                          className="!flex-1"
                        />
                        <Skeleton
                          variant="circular"
                          width={32}
                          height={32}
                          className="!flex-shrink-0"
                        />
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            ) : (
              conditions.length > 0 && (
                <Box className="!mt-4">
                  <Table
                    data={conditions}
                    columns={conditionColumns}
                    getRowId={row => row._index.toString()}
                    pagination={false}
                    sortable={false}
                    emptyMessage="No conditions added yet."
                  />
                </Box>
              )
            )}
          </Box>

          <Box className="!flex !justify-end">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              className="!mr-3"
              disabled={
                createCustomerCategoryMutation.isPending ||
                updateCustomerCategoryMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createCustomerCategoryMutation.isPending ||
                updateCustomerCategoryMutation.isPending
              }
            >
              {createCustomerCategoryMutation.isPending ||
              updateCustomerCategoryMutation.isPending
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

export default ManageCustomerCategory;
