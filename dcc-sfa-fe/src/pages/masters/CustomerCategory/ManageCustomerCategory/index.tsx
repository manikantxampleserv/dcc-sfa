import { Add, InfoOutline } from '@mui/icons-material';
import { Box, MenuItem, Skeleton, Typography } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateCustomerCategory,
  useCustomerCategoryById,
  useUpdateCustomerCategory,
  type CustomerCategory,
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
  threshold_value: string;
  product_category_id: string;
  condition_description: string;
  is_active: string;
}

const customerCategoryValidationSchema = Yup.object({
  category_name: Yup.string()
    .required('Category name is required')
    .min(2, 'Category name must be at least 2 characters')
    .max(255, 'Category name must be less than 255 characters'),
  category_code: Yup.string()
    .required('Category code is required')
    .min(2, 'Category code must be at least 2 characters')
    .max(50, 'Category code must be less than 50 characters'),
  level: Yup.string()
    .required('Category level is required')
    .min(1, 'Category level must be at least 1 character')
    .max(10, 'Category level must be less than 10 characters'),
  is_active: Yup.string().oneOf(['Y', 'N']).required('Status is required'),
});

const CONDITION_TYPES = [
  'Monthly Sales Amount (₹)',
  'Quarterly Sales Amount (₹)',
  'Monthly Sales Quantity (Crates)',
  'Monthly Sales Quantity (Cases)',
  'Monthly Sales Quantity (Units)',
  'Quarterly Sales Quantity (Crates)',
  'Order Frequency per Month',
  'Order Frequency per Quarter',
  'Payment Terms (Days)',
  'Credit Limit (₹)',
  'Purchase History (Months Active)',
  'Average Order Value (₹)',
  'Last Order Days Ago',
];

const CONDITION_OPERATORS = [
  { value: '>=', label: 'Greater than or equal (>=)' },
  { value: '<=', label: 'Less than or equal (<=)' },
  { value: '>', label: 'Greater than (>)' },
  { value: '<', label: 'Less than (<)' },
  { value: '=', label: 'Equal (=)' },
  { value: '!=', label: 'Not equal (!=)' },
];

// Helper functions for threshold input guidance
const getThresholdPlaceholder = (conditionType: string): string => {
  switch (conditionType) {
    case 'Monthly Sales Amount (₹)':
    case 'Quarterly Sales Amount (₹)':
    case 'Average Order Value (₹)':
    case 'Credit Limit (₹)':
      return 'e.g., 50000';
    case 'Monthly Sales Quantity (Crates)':
    case 'Monthly Sales Quantity (Cases)':
    case 'Monthly Sales Quantity (Units)':
    case 'Quarterly Sales Quantity (Crates)':
      return 'e.g., 1';
    case 'Order Frequency per Month':
    case 'Order Frequency per Quarter':
    case 'Purchase History (Months Active)':
      return 'e.g., 4';
    case 'Payment Terms (Days)':
    case 'Last Order Days Ago':
      return 'e.g., 30';
    default:
      return 'Enter threshold value';
  }
};

const getThresholdHelperText = (conditionType: string): string => {
  switch (conditionType) {
    case 'Monthly Sales Amount (₹)':
      return 'Enter amount in rupees (e.g., 50000 for ₹50,000)';
    case 'Quarterly Sales Amount (₹)':
      return 'Enter amount in rupees for 3 months (e.g., 150000 for ₹1.5L)';
    case 'Monthly Sales Quantity (Crates)':
      return 'Enter number of crates per month (e.g., 1 for 1 crate/month)';
    case 'Monthly Sales Quantity (Cases)':
      return 'Enter number of cases per month (e.g., 24 for 24 cases/month)';
    case 'Monthly Sales Quantity (Units)':
      return 'Enter number of individual units per month';
    case 'Quarterly Sales Quantity (Crates)':
      return 'Enter number of crates for 3 months';
    case 'Order Frequency per Month':
      return 'Enter number of orders per month (e.g., 4 for weekly orders)';
    case 'Order Frequency per Quarter':
      return 'Enter number of orders for 3 months';
    case 'Payment Terms (Days)':
      return 'Enter credit period in days (e.g., 30 for 30-day credit)';
    case 'Credit Limit (₹)':
      return 'Enter credit limit in rupees';
    case 'Purchase History (Months Active)':
      return 'Enter months since first purchase';
    case 'Average Order Value (₹)':
      return 'Enter average order value in rupees';
    case 'Last Order Days Ago':
      return 'Enter days since last order (e.g., 7 for last week)';
    default:
      return '';
  }
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
  const [conditionInput, setConditionInput] = useState<ConditionFormData>({
    _index: 0,
    condition_type: '',
    condition_operator: '>=',
    threshold_value: '',
    product_category_id: '',
    condition_description: '',
    is_active: 'Y',
  });

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
        categoryDetailResponse.conditions?.map((cond, index) => ({
          _index: index,
          id: cond.id,
          condition_type: cond.condition_type || '',
          condition_operator: cond.condition_operator || '>=',
          threshold_value: cond.threshold_value?.toString() || '',
          product_category_id: cond.product_category_id?.toString() || '',
          condition_description: cond.condition_description || '',
          is_active: cond.is_active || 'Y',
        })) || [];
      setConditions(loadedConditions);
    } else {
      setConditions([]);
    }
    setSelectedConditionIndex(null);
    setConditionInput({
      _index: 0,
      condition_type: '',
      condition_operator: '>=',
      threshold_value: '',
      product_category_id: '',
      condition_description: '',
      is_active: 'Y',
    });
  }, [categoryDetailResponse, isEdit]);

  const handleCancel = () => {
    setSelectedCustomerCategory(null);
    setDrawerOpen(false);
    setConditions([]);
    setSelectedConditionIndex(null);
    setConditionInput({
      _index: 0,
      condition_type: '',
      condition_operator: '>=',
      threshold_value: '',
      product_category_id: '',
      condition_description: '',
      is_active: 'Y',
    });
    formik.resetForm();
  };

  const createCustomerCategoryMutation = useCreateCustomerCategory();
  const updateCustomerCategoryMutation = useUpdateCustomerCategory();

  const addCondition = () => {
    if (!conditionInput.condition_type.trim()) {
      toast.error('Condition type is required');
      return;
    }

    if (!conditionInput.threshold_value.trim()) {
      toast.error(
        `Threshold value is required for ${conditionInput.condition_type}`
      );
      return;
    }

    // Validate threshold value based on condition type
    const thresholdValue = parseFloat(conditionInput.threshold_value);
    if (isNaN(thresholdValue) || thresholdValue < 0) {
      toast.error('Please enter a valid positive number for threshold value');
      return;
    }

    // Additional validation for specific condition types
    if (
      conditionInput.condition_type.includes('Days') &&
      thresholdValue > 365
    ) {
      toast.error('Days cannot exceed 365 for this condition type');
      return;
    }

    if (
      conditionInput.condition_type.includes('Months') &&
      thresholdValue > 12
    ) {
      toast.error('Months cannot exceed 12 for this condition type');
      return;
    }

    const isDuplicate = conditions.some(
      cond =>
        cond.condition_type === conditionInput.condition_type &&
        cond.condition_operator === conditionInput.condition_operator
    );
    if (isDuplicate) {
      toast.error('A condition with this type and operator already exists');
      return;
    }

    const newCondition: ConditionFormData = {
      _index: conditions.length,
      condition_type: conditionInput.condition_type,
      condition_operator: conditionInput.condition_operator,
      threshold_value: conditionInput.threshold_value,
      product_category_id: conditionInput.product_category_id,
      condition_description: conditionInput.condition_description,
      is_active: conditionInput.is_active,
    };
    setConditions([...conditions, newCondition]);
    setConditionInput({
      _index: conditions.length + 1,
      condition_type: '',
      condition_operator: '>=',
      threshold_value: '',
      product_category_id: '',
      condition_description: '',
      is_active: 'Y',
    });
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

  const updateCondition = (index: number) => {
    const isDuplicate = conditions.some(
      (cond, i) =>
        i !== index &&
        cond.condition_type === conditionInput.condition_type &&
        cond.condition_operator === conditionInput.condition_operator
    );
    if (isDuplicate) {
      toast.error('A condition with this type and operator already exists');
      return;
    }

    const updated = [...conditions];
    updated[index] = {
      ...conditionInput,
      _index: index,
      id: conditions[index].id,
    };
    setConditions(updated);
    setConditionInput({
      _index: conditions.length,
      condition_type: '',
      condition_operator: '>=',
      threshold_value: '',
      product_category_id: '',
      condition_description: '',
      is_active: 'Y',
    });
    setSelectedConditionIndex(null);
  };

  const handleConditionRowClick = (row: ConditionFormData) => {
    setSelectedConditionIndex(row._index);
    setConditionInput({
      _index: row._index,
      id: row.id,
      condition_type: row.condition_type,
      condition_operator: row.condition_operator,
      threshold_value: row.threshold_value,
      product_category_id: row.product_category_id,
      condition_description: row.condition_description,
      is_active: row.is_active,
    });
  };

  const formik = useFormik({
    initialValues: {
      category_name: selectedCustomerCategory?.category_name || '',
      category_code: selectedCustomerCategory?.category_code || '',
      level: selectedCustomerCategory?.level || 0,
      is_active: selectedCustomerCategory?.is_active || 'Y',
    },
    validationSchema: customerCategoryValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const categoryData = {
          category_name: values.category_name,
          category_code: values.category_code,
          level: Number(values.level),
          is_active: values.is_active,
          conditions: conditions.map(cond => ({
            ...(cond.id && { id: cond.id }),
            condition_type: cond.condition_type,
            condition_operator: cond.condition_operator,
            threshold_value: Number(cond.threshold_value),
            product_category_id: cond.product_category_id
              ? Number(cond.product_category_id)
              : null,
            condition_description: cond.condition_description || null,
            is_active: cond.is_active,
          })),
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
        <Typography
          variant="body2"
          className={
            selectedConditionIndex === row._index
              ? '!font-bold !text-primary-600'
              : ''
          }
          onClick={() => handleConditionRowClick(row)}
          style={{ cursor: 'pointer' }}
        >
          {row.condition_type || '-'}
        </Typography>
      ),
    },
    {
      id: 'condition_operator',
      label: 'Operator',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-700">
          {row.condition_operator || '-'}
        </Typography>
      ),
    },
    {
      id: 'threshold_value',
      label: 'Threshold Value',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-700">
          {row.threshold_value || '-'}
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
      title={isEdit ? 'Edit Customer Category' : 'Create Customer Category'}
      size="large"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 lg:!grid-cols-2 !gap-6">
            <Input
              name="category_name"
              label="Category Name"
              placeholder="Enter category name"
              formik={formik}
              required
            />

            <Input
              name="category_code"
              label="Category Code"
              placeholder="Enter category code"
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
              <Button
                type="button"
                variant="outlined"
                startIcon={<Add />}
                onClick={addCondition}
                size="small"
              >
                Add Condition
              </Button>
            </Box>

            <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4 !bg-gray-50 !rounded-lg">
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
              >
                {CONDITION_TYPES.map(type => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
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
              >
                {CONDITION_OPERATORS.map(op => (
                  <MenuItem key={op.value} value={op.value}>
                    {op.label}
                  </MenuItem>
                ))}
              </Select>

              <Input
                value={conditionInput.threshold_value}
                onChange={e =>
                  setConditionInput({
                    ...conditionInput,
                    threshold_value: e.target.value,
                  })
                }
                label="Threshold Value"
                placeholder={getThresholdPlaceholder(
                  conditionInput.condition_type
                )}
                helperText={getThresholdHelperText(
                  conditionInput.condition_type
                )}
                type="number"
                size="small"
                fullWidth
              />

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
              {/* Information Section */}
              <Box className="!bg-blue-50 col-span-2 !border !border-blue-200 !rounded-lg !p-4">
                <Typography
                  variant="subtitle2"
                  className="!font-semibold !text-blue-900 !mb-2"
                >
                  <InfoOutline fontSize="small" /> How Conditions Work:
                </Typography>
                <Typography variant="body2" className="!text-blue-800 !mb-2">
                  <strong>Example 1:</strong> "Monthly Sales Quantity (Crates) ≥
                  1" → Customers who buy at least 1 crate per month
                </Typography>
                <Typography variant="body2" className="!text-blue-800 !mb-2">
                  <strong>Example 2:</strong> "Monthly Sales Amount (₹) ≥ 50000"
                  → Customers with monthly sales of ₹50,000 or more
                </Typography>
                <Typography variant="body2" className="!text-blue-800">
                  <strong>Note:</strong> All conditions are evaluated based on
                  customer's purchase history and behavior patterns.
                </Typography>
              </Box>

              <Box className="md:!col-span-2 !flex !items-center !gap-4">
                {selectedConditionIndex !== null && (
                  <Box className="!flex !gap-2">
                    <Button
                      type="button"
                      variant="outlined"
                      size="small"
                      onClick={() => updateCondition(selectedConditionIndex)}
                    >
                      Update
                    </Button>
                    <Button
                      type="button"
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setSelectedConditionIndex(null);
                        setConditionInput({
                          _index: conditions.length,
                          condition_type: '',
                          condition_operator: '>=',
                          threshold_value: '',
                          product_category_id: '',
                          condition_description: '',
                          is_active: 'Y',
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>

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
