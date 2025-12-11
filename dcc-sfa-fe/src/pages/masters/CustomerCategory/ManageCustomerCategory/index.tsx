import { Add } from '@mui/icons-material';
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
import * as Yup from 'yup';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import ProductCategorySelect from 'shared/ProductCategorySelect';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';

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
  is_active: Yup.string().oneOf(['Y', 'N']).required('Status is required'),
});

const CONDITION_TYPES = [
  'Sales Amount',
  'Sales Quantity',
  'Order Frequency',
  'Payment Terms',
  'Credit Limit',
  'Purchase History',
];

const CONDITION_OPERATORS = [
  { value: '>=', label: 'Greater than or equal (>=)' },
  { value: '<=', label: 'Less than or equal (<=)' },
  { value: '>', label: 'Greater than (>)' },
  { value: '<', label: 'Less than (<)' },
  { value: '=', label: 'Equal (=)' },
  { value: '!=', label: 'Not equal (!=)' },
];

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
      is_active: selectedCustomerCategory?.is_active || 'Y',
    },
    validationSchema: customerCategoryValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const categoryData = {
          category_name: values.category_name,
          category_code: values.category_code,
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
      size="larger"
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

            <Select name="is_active" label="Status" formik={formik} required>
              <MenuItem value="Y">Active</MenuItem>
              <MenuItem value="N">Inactive</MenuItem>
            </Select>
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
                <MenuItem value="">Select Condition Type</MenuItem>
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
                placeholder="Enter threshold value"
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

              <Box className="md:!col-span-2">
                <Input
                  value={conditionInput.condition_description}
                  onChange={e =>
                    setConditionInput({
                      ...conditionInput,
                      condition_description: e.target.value,
                    })
                  }
                  label="Description (Optional)"
                  placeholder="Enter condition description"
                  multiline
                  rows={2}
                  size="small"
                  fullWidth
                />
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
