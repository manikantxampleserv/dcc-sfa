import {
  Box,
  Typography,
  MenuItem,
  IconButton,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import React, { useState } from 'react';
import CustomDrawer from 'shared/Drawer';
import {
  useCreateOrUpdateSurvey,
  type Survey,
} from '../../../../hooks/useSurveys';
import { useFormik, getIn } from 'formik';
import * as yup from 'yup';
import Button from 'shared/Button';
import Input from 'shared/Input';
import Select from 'shared/Select';
import { useRolesDropdown } from '../../../../hooks/useRoles';
import ActiveInactiveField from 'shared/ActiveInactiveField';
import { Plus, ChevronRight, ChevronDown, Trash2, X } from 'lucide-react';
import { ActionButton } from 'shared/ActionButton';
import { useProductsDropdown } from '../../../../hooks/useProducts';
import ProductMultiSelect from 'shared/ProductMultiSelect';

const generateTempId = () => `temp-${Math.random().toString(36).substr(2, 9)}`;

const FieldTreeItem = ({ field, path, formik, level = 0, productMap }: any) => {
  const [expanded, setExpanded] = useState(true);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);

  const fieldPathStr = path.join('.');

  const getProductLabel = (idStr: string) => {
    const id = parseInt(idStr, 10);
    if (isNaN(id)) return idStr;
    const prod = productMap?.get(id);
    return prod ? `${prod.name} (${prod.code})` : `Product #${id}`;
  };

  const handleRemove = () => {
    if (path.length === 2) {
      const newFields = [...formik.values.fields];
      newFields.splice(path[1], 1);
      formik.setFieldValue('fields', newFields);
    } else if (path.length > 2) {
      const parentPathStr = path.slice(0, -2).join('.');
      const parentList = getIn(formik.values, parentPathStr) || [];
      const index = path[path.length - 1];
      const newList = [...parentList];
      newList.splice(index, 1);
      formik.setFieldValue(parentPathStr, newList);
    }
  };

  const [optionDialogOpen, setOptionDialogOpen] = useState(false);
  const [newOptionText, setNewOptionText] = useState('');

  const addOption = () => {
    if (field.field_type === 'product') {
      const ids = field.options
        ? field.options
            .split(',')
            .map((o: string) => parseInt(o.trim(), 10))
            .filter((id: number) => !isNaN(id))
        : [];
      setSelectedProductIds(ids);
    }
    setOptionDialogOpen(true);
  };

  const handleAddOptionSubmit = () => {
    if (field.field_type === 'product') {
      const value = selectedProductIds.join(',');
      formik.setFieldValue(`${fieldPathStr}.options`, value);
    } else {
      if (newOptionText.trim()) {
        const currentOptions = field.options ? field.options.split(',') : [];
        currentOptions.push(newOptionText.trim());
        formik.setFieldValue(
          `${fieldPathStr}.options`,
          currentOptions.join(',')
        );
      }
      setNewOptionText('');
    }
    setOptionDialogOpen(false);
  };

  const removeOption = (optToRemove: string) => {
    const currentOptions = field.options
      ? field.options.split(',').map((o: string) => o.trim())
      : [];
    const newOptions = currentOptions.filter((o: string) => o !== optToRemove);
    formik.setFieldValue(`${fieldPathStr}.options`, newOptions.join(','));
  };

  const addChildQuestion = (optionValue: string) => {
    const childField = {
      id: generateTempId(),
      label: 'New Question',
      field_type: 'text',
      is_required: false,
      parent_option_value: optionValue,
      child_fields: [],
    };
    const currentChildren = field.child_fields || [];
    formik.setFieldValue(`${fieldPathStr}.child_fields`, [
      ...currentChildren,
      childField,
    ]);
  };

  const optionsArray = field.options
    ? field.options
        .split(',')
        .map((o: string) => o.trim())
        .filter(Boolean)
    : [];

  const getQuestionNumber = () => {
    const numbers = path.filter((x: any) => typeof x === 'number');
    if (numbers.length === 0) return '';
    return 'Question ' + numbers.map((n: number) => n + 1).join('.');
  };

  return (
    <Box
      style={{
        paddingBottom: level > 0 ? '4px' : '12px',
        paddingTop: level > 0 ? '8px' : '12px',
      }}
    >
      <Box className="border shadow border-blue-200 rounded-lg px-2 py-2 relative">
        <Typography
          className="absolute !bg-white !px-1.5 !text-[12px] !font-semibold !text-blue-500 !leading-none"
          style={{
            top: '-6px',
            left: '16px',
          }}
        >
          {getQuestionNumber()}
        </Typography>
        <Box className="!flex !items-center !gap-2 !py-1 hover:!bg-gray-50 !rounded">
          <ActionButton
            icon={
              expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />
            }
            onClick={() => setExpanded(!expanded)}
            tooltip={expanded ? 'Collapse' : 'Expand'}
          />
          <Box className="!flex !items-center !gap-2 !flex-1">
            <Select
              name={`${fieldPathStr}.field_type`}
              formik={formik}
              placeholder="Type"
              size="small"
              className="!w-52"
              sx={{
                '& .MuiInputBase-root': { height: '36px', fontSize: '13px' },
              }}
            >
              <MenuItem value="radio">Single Select</MenuItem>
              <MenuItem value="checkbox">Multiple Select</MenuItem>
              <MenuItem value="product">Product Select</MenuItem>
              <MenuItem value="text">Text</MenuItem>
              <MenuItem value="number">Number</MenuItem>
              <MenuItem value="date">Date</MenuItem>
            </Select>

            <Box className="!flex-1">
              <Input
                name={`${fieldPathStr}.label`}
                formik={formik}
                size="small"
                placeholder="Question Label"
                fullWidth
                sx={{
                  '& .MuiInputBase-root': { height: '36px', fontSize: '13px' },
                }}
              />
            </Box>

            {['radio', 'checkbox', 'product'].includes(field.field_type) && (
              <Button
                size="small"
                variant="outlined"
                onClick={addOption}
                startIcon={<Plus size={14} />}
                sx={{
                  height: '36px',
                  fontSize: '12px',
                  textTransform: 'none',
                  minWidth: '115px',
                }}
                className="!border-gray-300 !text-gray-700 hover:!bg-gray-100"
              >
                {field.field_type === 'product'
                  ? 'Select Products'
                  : 'Add Option'}
              </Button>
            )}

            <ActionButton
              icon={<Trash2 size={20} />}
              color="error"
              onClick={handleRemove}
              tooltip="Remove Question"
            />
          </Box>
        </Box>

        <Collapse in={expanded}>
          {['radio', 'checkbox', 'product'].includes(field.field_type) && (
            <Box className="!pl-4">
              {optionsArray.map((opt: string, idx: number) => {
                const optionChildren = (field.child_fields || []).filter(
                  (cf: any) => cf.parent_option_value === opt
                );
                return (
                  <Box key={idx} className="!pl-7 !border-l-2 !border-gray-200">
                    <Box className="!flex !items-center !gap-3 !py-1">
                      <Typography className="!bg-gray-100 min-w-52 !px-2 !py-1 !rounded !text-xs !font-medium !text-gray-700 !border !border-gray-200">
                        {field.field_type === 'product'
                          ? getProductLabel(opt)
                          : opt}
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => addChildQuestion(opt)}
                        sx={{
                          minWidth: 'auto',
                          p: '2px 8px',
                          textTransform: 'none',
                          fontSize: '12px',
                        }}
                        startIcon={<Plus size={14} />}
                        className="!text-primary-600 hover:!bg-primary-50"
                      >
                        Add Question
                      </Button>
                      <ActionButton
                        icon={<Trash2 size={14} />}
                        color="error"
                        onClick={() => removeOption(opt)}
                        tooltip="Remove Option"
                        size="small"
                      />
                    </Box>

                    {optionChildren.map((child: any) => {
                      const childIdx = field.child_fields.findIndex(
                        (cf: any) => cf.id === child.id
                      );
                      return (
                        <FieldTreeItem
                          key={child.id}
                          field={child}
                          path={[...path, 'child_fields', childIdx]}
                          formik={formik}
                          level={level + 1}
                          productMap={productMap}
                        />
                      );
                    })}
                  </Box>
                );
              })}
            </Box>
          )}
        </Collapse>
      </Box>

      <Dialog
        open={optionDialogOpen}
        onClose={() => setOptionDialogOpen(false)}
        maxWidth={field.field_type === 'product' ? 'sm' : 'xs'}
        fullWidth
      >
        <DialogTitle className="!flex !justify-between !items-center !border-b !border-gray-100 !text-lg !font-semibold !p-2">
          {field.field_type === 'product' ? 'Select Products' : 'Add Option'}
          <IconButton size="small" onClick={() => setOptionDialogOpen(false)}>
            <X size={20} className="text-gray-500 hover:text-gray-800" />
          </IconButton>
        </DialogTitle>
        <DialogContent className="!p-5">
          {field.field_type === 'product' ? (
            <ProductMultiSelect
              name="selected_products"
              label="Select Products"
              formik={
                {
                  values: {
                    selected_products: selectedProductIds,
                  },
                  setFieldValue: (name: string, value: any) => {
                    if (name === 'selected_products') {
                      setSelectedProductIds(value);
                    }
                  },
                  touched: {},
                  errors: {},
                } as any
              }
            />
          ) : (
            <Input
              autoFocus
              label="Option"
              type="text"
              fullWidth
              value={newOptionText}
              onChange={(e: any) => setNewOptionText(e.target.value)}
              name="newOptionText"
              onKeyDown={(e: any) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddOptionSubmit();
                }
              }}
            />
          )}
        </DialogContent>
        <DialogActions className="!p-2 !border-t !border-gray-100">
          <Button
            onClick={() => setOptionDialogOpen(false)}
            variant="text"
            className="!capitalize !text-gray-600"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddOptionSubmit}
            color="primary"
            variant="contained"
            className="!capitalize"
          >
            {field.field_type === 'product' ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

interface SAPManageSurveyProps {
  selectedSurvey?: Survey | null;
  setSelectedSurvey: (survey: Survey | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const SAPManageSurvey: React.FC<SAPManageSurveyProps> = ({
  selectedSurvey,
  setSelectedSurvey,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedSurvey;
  const { data: rolesResponse } = useRolesDropdown();
  const roles = rolesResponse?.data || [];

  const { data: productsDropdownResponse } = useProductsDropdown();
  const productsList = productsDropdownResponse?.data || [];
  const productMap = React.useMemo(() => {
    return new Map(productsList.map(p => [p.id, p]));
  }, [productsList]);

  const handleCancel = () => {
    setSelectedSurvey(null);
    setDrawerOpen(false);
    formik.resetForm();
  };

  const createOrUpdateSurveyMutation = useCreateOrUpdateSurvey();

  const buildTree = (flatFields: any[]) => {
    const tree: any[] = [];
    const map = new Map();
    flatFields.forEach(f => map.set(f.id, { ...f, child_fields: [] }));

    flatFields.forEach(f => {
      if (f.parent_field_id) {
        const parent = map.get(f.parent_field_id);
        if (parent) {
          parent.child_fields.push(map.get(f.id));
        }
      } else {
        tree.push(map.get(f.id));
      }
    });
    return tree;
  };

  const initialFields = selectedSurvey?.fields
    ? buildTree(selectedSurvey.fields)
    : [];

  const formik = useFormik({
    initialValues: {
      title: selectedSurvey?.title || '',
      description: selectedSurvey?.description || '',
      category: selectedSurvey?.category || '',
      target_roles: selectedSurvey?.target_roles || '',
      is_active: selectedSurvey?.is_active || 'Y',
      is_matrix: selectedSurvey?.is_matrix || 'N',
      target_products: selectedSurvey?.target_products || [],
      fields: initialFields,
    },
    enableReinitialize: true,
    validationSchema: yup.object({
      title: yup.string().required('Title is required'),
      category: yup.string().required('Category is required'),
    }),
    onSubmit: async values => {
      try {
        await createOrUpdateSurveyMutation.mutateAsync({
          id: selectedSurvey?.id,
          ...values,
          survey_fields: values.fields,
        });
        handleCancel();
      } catch (error) {
        console.error('Failed to save survey', error);
      }
    },
  });

  const addRootQuestion = () => {
    formik.setFieldValue('fields', [
      ...formik.values.fields,
      {
        id: generateTempId(),
        label: 'New Question',
        field_type: 'text',
        is_required: false,
        child_fields: [],
      },
    ]);
  };

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit SAP Survey' : 'Create SAP Survey'}
      size="large"
    >
      <form onSubmit={formik.handleSubmit} className="!flex !flex-col !h-full">
        <Box className="!flex-1 !overflow-y-auto !p-4">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4 !mb-4">
            <Input
              name="title"
              label="Survey Title"
              required
              formik={formik}
              fullWidth
            />
            <Select
              name="category"
              label="Category"
              required
              formik={formik}
              fullWidth
            >
              <MenuItem value="cooler_inspection">Cooler Inspection</MenuItem>
              <MenuItem value="customer_feedback">Customer Feedback</MenuItem>
              <MenuItem value="outlet_audit">Outlet Audit</MenuItem>
              <MenuItem value="competitor_analysis">
                Competitor Analysis
              </MenuItem>
              <MenuItem value="brand_visibility">Brand Visibility</MenuItem>
              <MenuItem value="general">General</MenuItem>
            </Select>
            <Select
              name="target_roles"
              label="Target Roles"
              formik={formik}
              fullWidth
            >
              {roles.map(role => (
                <MenuItem key={role.id} value={role.id}>
                  {role.name}
                </MenuItem>
              ))}
            </Select>
            <ActiveInactiveField
              name="is_active"
              label="Status"
              className="!col-span-2"
              formik={formik}
            />
          </Box>

          <Box className="!mt-4 !mb-2 !flex !items-center !justify-between">
            <Typography variant="h6" className="!font-semibold">
              Survey Form
            </Typography>
            <Button
              variant="contained"
              startIcon={<Plus size={16} />}
              onClick={addRootQuestion}
              className="!capitalize !shadow-none hover:!shadow"
            >
              Add Root Question
            </Button>
          </Box>

          <Box className="!p-2 !bg-white !min-h-[300px] !font-sans">
            {formik.values.fields.length === 0 ? (
              <Typography className="!text-gray-500 italic !text-center !py-8">
                Click "Add Root Question" to start building your SAP Survey.
              </Typography>
            ) : (
              formik.values.fields.map((field: any, idx: number) => (
                <FieldTreeItem
                  key={field.id}
                  field={field}
                  path={['fields', idx]}
                  formik={formik}
                  productMap={productMap}
                />
              ))
            )}
          </Box>
        </Box>
        <Box className="!p-4 !border-t !border-gray-200 !flex !justify-end !gap-2 !bg-gray-50 mt-auto">
          <Button variant="outlined" color="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={createOrUpdateSurveyMutation.isPending}
          >
            {createOrUpdateSurveyMutation.isPending
              ? 'Saving...'
              : 'Save Survey'}
          </Button>
        </Box>
      </form>
    </CustomDrawer>
  );
};

export default SAPManageSurvey;
