import {
  Autocomplete,
  Box,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { getIn, useFormik } from 'formik';
import { useCustomerCategories } from 'hooks/useCustomerCategory';
import { useCustomerChannels } from 'hooks/useCustomerChannel';
import { useCustomers } from 'hooks/useCustomers';
import { useCustomerTypes } from 'hooks/useCustomerType';
import { useDepots } from 'hooks/useDepots';
import { useProductsDropdown } from 'hooks/useProducts';
import { useRolesDropdown } from 'hooks/useRoles';
import { useRoutes } from 'hooks/useRoutes';
import { useCreateOrUpdateSurvey, type Survey } from 'hooks/useSurveys';
import { useZones } from 'hooks/useZones';
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { ActionButton } from 'shared/ActionButton';
import ActiveInactiveField from 'shared/ActiveInactiveField';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import ProductMultiSelect from 'shared/ProductMultiSelect';
import Select from 'shared/Select';
import * as yup from 'yup';

const generateTempId = () => `temp-${Math.random().toString(36).substr(2, 9)}`;

const FieldTreeItem = ({ field, path, formik, level = 0, productMap }: any) => {
  const [expanded, setExpanded] = useState(true);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [commonQuestionLabel, setCommonQuestionLabel] = useState('');
  const [commonQuestionType, setCommonQuestionType] = useState('radio');

  const fieldPathStr = path.join('.');

  const getProductLabel = (idStr: string) => {
    const trimmed = idStr.trim();
    if (/^\d+$/.test(trimmed)) {
      const id = parseInt(trimmed, 10);
      const prod = productMap?.get(id);
      return prod ? `${prod.name} (${prod.code})` : `Product #${id}`;
    }
    return idStr;
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
      const resolvedIds: number[] = [];
      if (field.options) {
        const optionParts = field.options
          .split(',')
          .map((o: string) => o.trim())
          .filter(Boolean);

        const nameToIdMap = new Map<string, number>();
        if (productMap) {
          for (const [id, prod] of productMap.entries()) {
            if (prod?.name) {
              nameToIdMap.set(prod.name.toLowerCase().trim(), id);
            }
          }
        }

        optionParts.forEach((part: string) => {
          if (/^\d+$/.test(part)) {
            const numericId = parseInt(part, 10);
            if (productMap?.has(numericId)) {
              resolvedIds.push(numericId);
            }
          } else {
            const matchedId = nameToIdMap.get(part.toLowerCase());
            if (matchedId !== undefined) {
              resolvedIds.push(matchedId);
            }
          }
        });
      }
      setSelectedProductIds(resolvedIds);
    }
    setOptionDialogOpen(true);
  };

  const handleAddOptionSubmit = () => {
    if (field.field_type === 'product') {
      const names = selectedProductIds
        .map(id => productMap?.get(id)?.name || `Product #${id}`)
        .filter(Boolean);
      const value = names.join(',');
      formik.setFieldValue(`${fieldPathStr}.options`, value);

      if (commonQuestionLabel.trim()) {
        const currentChildren = field.child_fields || [];
        const newChildren = [...currentChildren];

        selectedProductIds.forEach(prodId => {
          const prodName =
            productMap?.get(prodId)?.name || `Product #${prodId}`;
          const exists = currentChildren.some(
            (cf: any) =>
              cf.parent_option_value === prodName &&
              cf.label.toLowerCase() ===
                commonQuestionLabel.trim().toLowerCase()
          );

          if (!exists) {
            newChildren.push({
              id: generateTempId(),
              label: commonQuestionLabel.trim(),
              field_type: commonQuestionType,
              is_required: false,
              parent_option_value: prodName,
              options: ['radio', 'checkbox'].includes(commonQuestionType)
                ? 'Yes, No'
                : '',
              child_fields: [],
            });
          }
        });

        formik.setFieldValue(`${fieldPathStr}.child_fields`, newChildren);
      }

      setCommonQuestionLabel('');
      setCommonQuestionType('radio');
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
      <Box className="border shadow border-primary-200 rounded-lg px-2 py-2 relative">
        <Typography
          className="absolute !bg-white !px-1.5 !text-[12px] !font-semibold !text-primary-500 !leading-none"
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
              <MenuItem value="text">Text</MenuItem>
              <MenuItem value="date">Date</MenuItem>
              <MenuItem value="number">Number</MenuItem>
              <MenuItem value="radio">Single Select</MenuItem>
              <MenuItem value="checkbox">Multiple Select</MenuItem>
              <MenuItem value="product">Product Select</MenuItem>
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
                  <Box key={idx} className="!pl-7 !border-l-2 !border-primary-100">
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
            <Box className="!flex !flex-col !gap-4">
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

              <Box className="!border !border-gray-200 !rounded-lg !p-3 !bg-gray-50/50 !mt-2">
                <Typography
                  variant="subtitle2"
                  className="!font-semibold !text-gray-700 !mb-1"
                >
                  Add Initial Common Question (Optional)
                </Typography>
                <Typography
                  variant="caption"
                  className="!text-gray-500 !block !mb-3"
                >
                  This question will be automatically added under each selected
                  product option.
                </Typography>
                <Box className="!flex !flex-col !gap-3">
                  <Select
                    label="Question Type"
                    value={commonQuestionType}
                    onChange={(e: any) => setCommonQuestionType(e.target.value)}
                    name="commonQuestionType"
                    fullWidth
                    size="small"
                  >
                    <MenuItem value="text">Text</MenuItem>
                    <MenuItem value="number">Number</MenuItem>
                    <MenuItem value="date">Date</MenuItem>
                    <MenuItem value="radio">Single Select</MenuItem>
                    <MenuItem value="checkbox">Multiple Select</MenuItem>
                  </Select>
                  <Input
                    label="Common Question Label"
                    placeholder="e.g. Is the product displayed on the primary shelf?"
                    value={commonQuestionLabel}
                    onChange={(e: any) =>
                      setCommonQuestionLabel(e.target.value)
                    }
                    name="commonQuestionLabel"
                    fullWidth
                    size="small"
                  />
                </Box>
              </Box>
            </Box>
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

interface ManageSurveyProps {
  selectedSurvey?: Survey | null;
  setSelectedSurvey: (survey: Survey | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageSurvey: React.FC<ManageSurveyProps> = ({
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

  const { data: depotsResponse } = useDepots(
    { limit: 1000, isActive: 'Y' },
    { enabled: drawerOpen }
  );
  const depots = depotsResponse?.data || [];

  const { data: zonesResponse } = useZones(
    { limit: 1000, isActive: 'Y' },
    { enabled: drawerOpen }
  );
  const zones = zonesResponse?.data || [];

  const { data: customersResponse } = useCustomers(
    { limit: 1000, isActive: 'Y' },
    { enabled: drawerOpen }
  );
  const customers = customersResponse?.data || [];

  const { data: customerTypesResponse } = useCustomerTypes(
    { limit: 1000, is_active: 'Y' },
    { enabled: drawerOpen }
  );
  const customerTypes = customerTypesResponse?.data || [];

  const { data: customerCategoriesResponse } = useCustomerCategories(
    {
      limit: 1000,
      is_active: 'Y',
    },
    { enabled: drawerOpen }
  );
  const customerCategories = customerCategoriesResponse?.data || [];

  const { data: customerChannelsResponse } = useCustomerChannels(
    {
      limit: 1000,
      is_active: 'Y',
    },
    { enabled: drawerOpen }
  );
  const customerChannels = customerChannelsResponse?.data || [];

  const { data: routesResponse } = useRoutes(
    { limit: 1000, status: 'Active' },
    { enabled: drawerOpen }
  );
  const routes = routesResponse?.data || [];

  const [locationTab, setLocationTab] = useState(0);
  const [selectedDepots, setSelectedDepots] = useState<number[]>([]);
  const [selectedZones, setSelectedZones] = useState<number[]>([]);
  const [selectedRoutes, setSelectedRoutes] = useState<number[]>([]);
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

  const handleCancel = () => {
    setSelectedSurvey(null);
    setDrawerOpen(false);
    formik.resetForm();
    setSelectedDepots([]);
    setSelectedZones([]);
    setSelectedRoutes([]);
    setSelectedOutlets([]);
    setSelectedCustomerTypes([]);
    setSelectedCustomerCategories([]);
    setSelectedCustomerChannels([]);
  };

  const createOrUpdateSurveyMutation = useCreateOrUpdateSurvey();

  React.useEffect(() => {
    if (selectedSurvey) {
      setSelectedDepots(selectedSurvey.depots || []);
      setSelectedZones(selectedSurvey.zones || []);
      setSelectedRoutes(selectedSurvey.routes || []);
      setSelectedOutlets(selectedSurvey.outlets || []);
      setSelectedCustomerTypes(selectedSurvey.customer_types || []);
      setSelectedCustomerCategories(selectedSurvey.customer_categories || []);
      setSelectedCustomerChannels(selectedSurvey.customer_channels || []);
    } else {
      setSelectedDepots([]);
      setSelectedZones([]);
      setSelectedRoutes([]);
      setSelectedOutlets([]);
      setSelectedCustomerTypes([]);
      setSelectedCustomerCategories([]);
      setSelectedCustomerChannels([]);
    }
  }, [selectedSurvey]);

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
          depots: selectedDepots,
          zones: selectedZones,
          routes: selectedRoutes,
          outlets: selectedOutlets,
          customer_types: selectedCustomerTypes,
          customer_categories: selectedCustomerCategories,
          customer_channels: selectedCustomerChannels,
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
      title={isEdit ? 'Edit Survey' : 'Create Survey'}
      size="large"
    >
      <form onSubmit={formik.handleSubmit} className="!flex !flex-col !h-full">
        <Box className="!flex-1 !overflow-y-auto !p-4">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4 !mb-4">
            <Input
              name="title"
              label="Survey Title"
              required
              className="col-span-2"
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

          <Paper className="!p-2 !rounded-lg !shadow-sm !border !bg-white !border-gray-200">
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
              {locationTab === 0 && (
                <Autocomplete
                  multiple
                  options={depots}
                  getOptionLabel={(option: any) =>
                    `${option.name} (${option.code})`
                  }
                  value={depots.filter((d: any) =>
                    selectedDepots.includes(d.id)
                  )}
                  onChange={(_, newValue) => {
                    setSelectedDepots(newValue.map((item: any) => item.id));
                  }}
                  size="small"
                  fullWidth
                  filterOptions={(options, params) => {
                    const filtered = options.filter((option: any) => {
                      const searchLower = params.inputValue.toLowerCase();
                      return (
                        option.name?.toLowerCase().includes(searchLower) ||
                        option.code?.toLowerCase().includes(searchLower)
                      );
                    });
                    return filtered;
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
              {locationTab === 1 && (
                <Autocomplete
                  multiple
                  options={zones}
                  getOptionLabel={(option: any) => option.name}
                  value={zones.filter((z: any) => selectedZones.includes(z.id))}
                  onChange={(_, newValue) => {
                    setSelectedZones(newValue.map((item: any) => item.id));
                  }}
                  size="small"
                  fullWidth
                  filterOptions={(options, params) => {
                    const filtered = options.filter((option: any) => {
                      const searchLower = params.inputValue.toLowerCase();
                      return option.name?.toLowerCase().includes(searchLower);
                    });
                    return filtered;
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
              {locationTab === 2 && (
                <Autocomplete
                  multiple
                  options={routes}
                  getOptionLabel={(option: any) =>
                    `${option.name || option.code || `Route ${option.id}`} ${option.code ? `(${option.code})` : ''}`
                  }
                  value={routes.filter((r: any) =>
                    selectedRoutes.includes(r.id)
                  )}
                  onChange={(_, newValue) => {
                    setSelectedRoutes(newValue.map((item: any) => item.id));
                  }}
                  size="small"
                  fullWidth
                  filterOptions={(options, params) => {
                    const filtered = options.filter((option: any) => {
                      const searchLower = params.inputValue.toLowerCase();
                      return (
                        option.name?.toLowerCase().includes(searchLower) ||
                        option.code?.toLowerCase().includes(searchLower)
                      );
                    });
                    return filtered;
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
              {locationTab === 3 && (
                <Autocomplete
                  multiple
                  options={customers}
                  getOptionLabel={(option: any) =>
                    `${option.name} (${option.code})`
                  }
                  value={customers.filter((c: any) =>
                    selectedOutlets.includes(c.id)
                  )}
                  onChange={(_, newValue) => {
                    setSelectedOutlets(newValue.map((item: any) => item.id));
                  }}
                  size="small"
                  fullWidth
                  filterOptions={(options, params) => {
                    const filtered = options.filter((option: any) => {
                      const searchLower = params.inputValue.toLowerCase();
                      return (
                        option.name?.toLowerCase().includes(searchLower) ||
                        option.code?.toLowerCase().includes(searchLower)
                      );
                    });
                    return filtered;
                  }}
                  renderInput={params => (
                    <TextField
                      {...params}
                      placeholder="Search and select Outlets..."
                      size="small"
                    />
                  )}
                  renderTags={() => null}
                />
              )}
              {locationTab === 4 && (
                <Autocomplete
                  multiple
                  options={customerTypes}
                  getOptionLabel={(option: any) =>
                    `${option.type_name} (${option.type_code})`
                  }
                  value={customerTypes.filter((ct: any) =>
                    selectedCustomerTypes.includes(ct.id)
                  )}
                  onChange={(_, newValue) => {
                    setSelectedCustomerTypes(
                      newValue.map((item: any) => item.id)
                    );
                  }}
                  size="small"
                  fullWidth
                  filterOptions={(options, params) => {
                    const filtered = options.filter((option: any) => {
                      const searchLower = params.inputValue.toLowerCase();
                      return (
                        option.type_name?.toLowerCase().includes(searchLower) ||
                        option.type_code?.toLowerCase().includes(searchLower)
                      );
                    });
                    return filtered;
                  }}
                  renderInput={params => (
                    <TextField
                      {...params}
                      placeholder="Search and select Customer Types..."
                      size="small"
                    />
                  )}
                  renderTags={() => null}
                />
              )}
              {locationTab === 5 && (
                <Autocomplete
                  multiple
                  options={customerCategories}
                  getOptionLabel={(option: any) =>
                    `${option.category_name} (${option.category_code})`
                  }
                  value={customerCategories.filter((cc: any) =>
                    selectedCustomerCategories.includes(cc.id)
                  )}
                  onChange={(_, newValue) => {
                    setSelectedCustomerCategories(
                      newValue.map((item: any) => item.id)
                    );
                  }}
                  size="small"
                  fullWidth
                  filterOptions={(options, params) => {
                    const filtered = options.filter((option: any) => {
                      const searchLower = params.inputValue.toLowerCase();
                      return (
                        option.category_name
                          ?.toLowerCase()
                          .includes(searchLower) ||
                        option.category_code
                          ?.toLowerCase()
                          .includes(searchLower)
                      );
                    });
                    return filtered;
                  }}
                  renderInput={params => (
                    <TextField
                      {...params}
                      placeholder="Search and select Customer Categories..."
                      size="small"
                    />
                  )}
                  renderTags={() => null}
                />
              )}
              {locationTab === 6 && (
                <Autocomplete
                  multiple
                  options={customerChannels}
                  getOptionLabel={(option: any) =>
                    `${option.channel_name} (${option.channel_code})`
                  }
                  value={customerChannels.filter((ch: any) =>
                    selectedCustomerChannels.includes(ch.id)
                  )}
                  onChange={(_, newValue) => {
                    setSelectedCustomerChannels(
                      newValue.map((item: any) => item.id)
                    );
                  }}
                  size="small"
                  fullWidth
                  filterOptions={(options, params) => {
                    const filtered = options.filter((option: any) => {
                      const searchLower = params.inputValue.toLowerCase();
                      return (
                        option.channel_name
                          ?.toLowerCase()
                          .includes(searchLower) ||
                        option.channel_code?.toLowerCase().includes(searchLower)
                      );
                    });
                    return filtered;
                  }}
                  renderInput={params => (
                    <TextField
                      {...params}
                      placeholder="Search and select Customer Channels..."
                      size="small"
                    />
                  )}
                  renderTags={() => null}
                />
              )}
            </Box>
            <Box className="!mt-3 !border !border-gray-200 !rounded !h-52 !flex !flex-col">
              <Box className="!flex-1 !overflow-y-auto">
                {((locationTab === 0 && selectedDepots.length === 0) ||
                  (locationTab === 1 && selectedZones.length === 0) ||
                  (locationTab === 2 && selectedRoutes.length === 0) ||
                  (locationTab === 3 && selectedOutlets.length === 0) ||
                  (locationTab === 4 && selectedCustomerTypes.length === 0) ||
                  (locationTab === 5 &&
                    selectedCustomerCategories.length === 0) ||
                  (locationTab === 6 &&
                    selectedCustomerChannels.length === 0)) && (
                  <Box className="!flex !flex-col !items-center !justify-center !h-full !text-center">
                    <Typography className="!text-gray-400 !text-sm">
                      No{' '}
                      {locationTab === 0
                        ? 'Depots'
                        : locationTab === 1
                          ? 'Zones'
                          : locationTab === 2
                            ? 'Routes'
                            : locationTab === 3
                              ? 'Outlets'
                              : locationTab === 4
                                ? 'Customer Types'
                                : locationTab === 5
                                  ? 'Customer Categories'
                                  : 'Customer Channels'}{' '}
                      selected.
                    </Typography>
                  </Box>
                )}
                {locationTab === 0 &&
                  selectedDepots.map(depotId => {
                    const depot = depots.find((d: any) => d.id === depotId);
                    if (!depot) return null;
                    return (
                      <Box
                        key={depotId}
                        className="!flex !items-center !border-b !border-gray-200 !justify-between !p-2 !bg-gray-50 !rounded !hover:bg-gray-100"
                      >
                        <Typography variant="body2">
                          {depot.name} ({depot.code})
                        </Typography>
                        <ActionButton
                          icon={<Trash2 size={14} />}
                          color="error"
                          size="small"
                          onClick={() => {
                            setSelectedDepots(
                              selectedDepots.filter(id => id !== depotId)
                            );
                          }}
                          tooltip="Remove Depot"
                        />
                      </Box>
                    );
                  })}
                {locationTab === 1 &&
                  selectedZones.map(zoneId => {
                    const zone = zones.find((z: any) => z.id === zoneId);
                    if (!zone) return null;
                    return (
                      <Box
                        key={zoneId}
                        className="!flex !items-center !border-b !border-gray-200 !justify-between !p-2 !bg-gray-50 !rounded !hover:bg-gray-100"
                      >
                        <Typography variant="body2">{zone.name}</Typography>
                        <ActionButton
                          icon={<Trash2 size={14} />}
                          color="error"
                          size="small"
                          onClick={() => {
                            setSelectedZones(
                              selectedZones.filter(id => id !== zoneId)
                            );
                          }}
                          tooltip="Remove Zone"
                        />
                      </Box>
                    );
                  })}
                {locationTab === 2 &&
                  selectedRoutes.map(routeId => {
                    const route = routes.find((r: any) => r.id === routeId);
                    if (!route) return null;
                    return (
                      <Box
                        key={routeId}
                        className="!flex !items-center !border-b !border-gray-200 !justify-between !p-2 !bg-gray-50 !rounded !hover:bg-gray-100"
                      >
                        <Typography variant="body2">
                          {route.name || route.code || `Route ${route.id}`}{' '}
                          {route.code ? `(${route.code})` : ''}
                        </Typography>
                        <ActionButton
                          icon={<Trash2 size={14} />}
                          color="error"
                          size="small"
                          onClick={() => {
                            setSelectedRoutes(
                              selectedRoutes.filter(id => id !== routeId)
                            );
                          }}
                          tooltip="Remove Route"
                        />
                      </Box>
                    );
                  })}
                {locationTab === 3 &&
                  selectedOutlets.map(outletId => {
                    const customer = customers.find(
                      (c: any) => c.id === outletId
                    );
                    if (!customer) return null;
                    return (
                      <Box
                        key={outletId}
                        className="!flex !items-center !border-b !border-gray-200 !justify-between !p-2 !bg-gray-50 !rounded !hover:bg-gray-100"
                      >
                        <Typography variant="body2">
                          {customer.name} ({customer.code})
                        </Typography>
                        <ActionButton
                          icon={<Trash2 size={14} />}
                          color="error"
                          size="small"
                          onClick={() => {
                            setSelectedOutlets(
                              selectedOutlets.filter(id => id !== outletId)
                            );
                          }}
                          tooltip="Remove Outlet"
                        />
                      </Box>
                    );
                  })}
                {locationTab === 4 &&
                  selectedCustomerTypes.map(typeId => {
                    const customerType = customerTypes.find(
                      (ct: any) => ct.id === typeId
                    );
                    if (!customerType) return null;
                    return (
                      <Box
                        key={typeId}
                        className="!flex !items-center !border-b !border-gray-200 !justify-between !p-2 !bg-gray-50 !rounded !hover:bg-gray-100"
                      >
                        <Typography variant="body2">
                          {customerType.type_name} ({customerType.type_code})
                        </Typography>
                        <ActionButton
                          icon={<Trash2 size={14} />}
                          color="error"
                          size="small"
                          onClick={() => {
                            setSelectedCustomerTypes(
                              selectedCustomerTypes.filter(id => id !== typeId)
                            );
                          }}
                          tooltip="Remove Customer Type"
                        />
                      </Box>
                    );
                  })}
                {locationTab === 5 &&
                  selectedCustomerCategories.map(categoryId => {
                    const category = customerCategories.find(
                      (cc: any) => cc.id === categoryId
                    );
                    if (!category) return null;
                    return (
                      <Box
                        key={categoryId}
                        className="!flex !items-center !border-b !border-gray-200 !justify-between !p-2 !bg-gray-50 !rounded !hover:bg-gray-100"
                      >
                        <Typography variant="body2">
                          {category.category_name} ({category.category_code})
                        </Typography>
                        <ActionButton
                          icon={<Trash2 size={14} />}
                          color="error"
                          size="small"
                          onClick={() => {
                            setSelectedCustomerCategories(
                              selectedCustomerCategories.filter(
                                id => id !== categoryId
                              )
                            );
                          }}
                          tooltip="Remove Customer Category"
                        />
                      </Box>
                    );
                  })}
                {locationTab === 6 &&
                  selectedCustomerChannels.map(channelId => {
                    const channel = customerChannels.find(
                      (ch: any) => ch.id === channelId
                    );
                    if (!channel) return null;
                    return (
                      <Box
                        key={channelId}
                        className="!flex !items-center !border-b !border-gray-200 !justify-between !p-2 !bg-gray-50 !rounded !hover:bg-gray-100"
                      >
                        <Typography variant="body2">
                          {channel.channel_name} ({channel.channel_code})
                        </Typography>
                        <ActionButton
                          icon={<Trash2 size={14} />}
                          color="error"
                          size="small"
                          onClick={() => {
                            setSelectedCustomerChannels(
                              selectedCustomerChannels.filter(
                                id => id !== channelId
                              )
                            );
                          }}
                          tooltip="Remove Customer Channel"
                        />
                      </Box>
                    );
                  })}
              </Box>
            </Box>
          </Paper>

          <Box className="!mt-4 !mb-2 !flex !items-center !justify-between">
            <Typography variant="h6" className="!font-semibold">
              Survey Form
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Plus size={16} />}
              onClick={addRootQuestion}
              size="small"
              className="!capitalize !shadow-none hover:!shadow"
            >
              Add Root Question
            </Button>
          </Box>

          <Box className="!py-2 !bg-white !min-h-[300px] !font-sans !mb-4">
            {formik.values.fields.length === 0 ? (
              <Box className="!p-12 !text-center !flex !flex-col !justify-center !items-center !border-2 !border-dashed !border-gray-200 !rounded-xl !bg-gray-50/50">
                <FileText className="!w-12 !h-12 !text-gray-300 !mb-3" />
                <Typography className="!text-gray-700 !text-sm !font-semibold">
                  No Questions Added Yet
                </Typography>
                <Typography className="!text-gray-400 !text-xs !mt-1">
                  Click "Add Root Question" to start building your Survey.
                </Typography>
              </Box>
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

export default ManageSurvey;
