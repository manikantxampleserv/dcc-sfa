import { Box, MenuItem, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { FileText, Plus } from 'lucide-react';
import React, { useState } from 'react';
import { DeleteButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import { useRolesDropdown } from '../../../../hooks/useRoles';
import {
  useCreateOrUpdateSurvey,
  type Survey,
} from '../../../../hooks/useSurveys';
import { surveyValidationSchema } from '../../../../schemas/survey.schema';

interface ManageSurveyProps {
  selectedSurvey?: Survey | null;
  setSelectedSurvey: (survey: Survey | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

interface SurveyFieldFormData {
  label: string;
  field_type:
    | 'text'
    | 'textarea'
    | 'number'
    | 'select'
    | 'checkbox'
    | 'radio'
    | 'date'
    | 'time'
    | 'photo'
    | 'signature';
  options?: string | null;
  is_required: boolean;
  sort_order?: number;
  id?: number | null;
}

const ManageSurvey: React.FC<ManageSurveyProps> = ({
  selectedSurvey,
  setSelectedSurvey,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedSurvey;
  const [surveyFields, setSurveyFields] = useState<SurveyFieldFormData[]>([]);

  const { data: rolesResponse, isLoading: isLoadingRoles } = useRolesDropdown();
  const roles = rolesResponse?.data || [];

  const handleCancel = () => {
    setSelectedSurvey(null);
    setDrawerOpen(false);
    setSurveyFields([]);
  };

  const createOrUpdateSurveyMutation = useCreateOrUpdateSurvey();

  React.useEffect(() => {
    if (selectedSurvey?.fields && selectedSurvey.fields.length > 0) {
      const fields = selectedSurvey.fields.map(field => ({
        label: field.label,
        field_type: field.field_type || 'text',
        options: field.options || null,
        is_required: field.is_required ?? false,
        sort_order: field.sort_order || 0,
        id: field.id || null,
      }));
      setSurveyFields(fields);
    } else {
      setSurveyFields([]);
    }
  }, [selectedSurvey]);

  const formik = useFormik({
    initialValues: {
      title: selectedSurvey?.title || '',
      description: selectedSurvey?.description || '',
      category: selectedSurvey?.category || 'general',
      target_roles:
        selectedSurvey?.target_roles !== null &&
        selectedSurvey?.target_roles !== undefined
          ? String(selectedSurvey.target_roles)
          : '',
      expires_at: selectedSurvey?.expires_at
        ? new Date(selectedSurvey.expires_at).toISOString().split('T')[0]
        : '',
      is_active: selectedSurvey?.is_active || 'Y',
    },
    validationSchema: surveyValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const surveyData = {
          ...(isEdit && selectedSurvey ? { id: selectedSurvey.id } : {}),
          title: values.title,
          description: values.description || undefined,
          category: values.category,
          target_roles:
            values.target_roles && values.target_roles !== ''
              ? Number(values.target_roles)
              : undefined,
          expires_at: values.expires_at
            ? new Date(values.expires_at).toISOString()
            : undefined,
          is_active: values.is_active,
          survey_fields: surveyFields
            .filter(field => field.label.trim() !== '')
            .map((field, index) => ({
              ...(field.id ? { id: field.id } : {}),
              label: field.label.trim(),
              field_type: field.field_type,
              options: field.options || null,
              is_required: field.is_required,
              sort_order: field.sort_order || index + 1,
            })),
        };

        await createOrUpdateSurveyMutation.mutateAsync(surveyData);
        handleCancel();
      } catch (error) {
        console.error('Error saving survey:', error);
      }
    },
  });

  const addSurveyField = () => {
    const newField: SurveyFieldFormData = {
      label: '',
      field_type: 'text',
      options: null,
      is_required: false,
      sort_order: surveyFields.length + 1,
      id: null,
    };
    setSurveyFields([...surveyFields, newField]);
  };

  const removeSurveyField = (index: number) => {
    const updatedFields = surveyFields.filter((_, i) => i !== index);
    setSurveyFields(updatedFields);
  };

  const updateSurveyField = (
    index: number,
    field: keyof SurveyFieldFormData,
    value: string | boolean
  ) => {
    const updatedFields = [...surveyFields];
    updatedFields[index] = {
      ...updatedFields[index],
      [field]: value,
    };
    setSurveyFields(updatedFields);
  };

  const fieldsWithIndex = surveyFields.map((field, index) => ({
    ...field,
    _index: index,
  }));

  const surveyFieldColumns: TableColumn<
    SurveyFieldFormData & { _index: number }
  >[] = [
    {
      id: 'label',
      label: 'Label',
      width: 200,
      render: (_value, row) => (
        <Input
          value={row.label}
          onChange={e => updateSurveyField(row._index, 'label', e.target.value)}
          size="small"
          fullWidth
          label="Field Label"
          placeholder="Enter field label"
        />
      ),
    },
    {
      id: 'field_type',
      label: 'Type',
      width: 150,
      render: (_value, row) => (
        <Select
          value={row.field_type}
          onChange={e =>
            updateSurveyField(row._index, 'field_type', e.target.value)
          }
          size="small"
          fullWidth
          label="Field Type"
        >
          <MenuItem value="text">Text</MenuItem>
          <MenuItem value="textarea">Textarea</MenuItem>
          <MenuItem value="number">Number</MenuItem>
          <MenuItem value="select">Select</MenuItem>
          <MenuItem value="checkbox">Checkbox</MenuItem>
          <MenuItem value="radio">Radio</MenuItem>
          <MenuItem value="date">Date</MenuItem>
          <MenuItem value="time">Time</MenuItem>
          <MenuItem value="photo">Photo</MenuItem>
          <MenuItem value="signature">Signature</MenuItem>
        </Select>
      ),
    },
    {
      id: 'options',
      label: 'Options',
      width: 200,
      render: (_value, row) => (
        <Input
          value={row.options || ''}
          onChange={e =>
            updateSurveyField(row._index, 'options', e.target.value)
          }
          size="small"
          fullWidth
          label="Options"
          placeholder="Comma-separated for select/radio"
          disabled={
            row.field_type !== 'select' &&
            row.field_type !== 'radio' &&
            row.field_type !== 'checkbox'
          }
        />
      ),
    },
    {
      id: 'is_required',
      label: 'Required',
      width: 100,
      render: (_value, row) => (
        <Select
          value={row.is_required ? 'true' : 'false'}
          onChange={e =>
            updateSurveyField(
              row._index,
              'is_required',
              e.target.value === 'true'
            )
          }
          size="small"
          fullWidth
          label="Required"
        >
          <MenuItem value="true">Yes</MenuItem>
          <MenuItem value="false">No</MenuItem>
        </Select>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      sortable: false,
      width: 80,
      render: (_value, row) => (
        <DeleteButton
          onClick={() => removeSurveyField(row._index)}
          tooltip="Remove field"
          confirmDelete={true}
          size="medium"
          itemName="field"
        />
      ),
    },
  ];

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Survey' : 'Create Survey'}
      size="large"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Box className="md:!col-span-2">
              <Input
                name="title"
                label="Survey Title"
                placeholder="Enter survey title"
                formik={formik}
                required
              />
            </Box>

            <Select name="category" label="Category" formik={formik} required>
              <MenuItem value="general">General</MenuItem>
              <MenuItem value="cooler_inspection">Cooler Inspection</MenuItem>
              <MenuItem value="customer_feedback">Customer Feedback</MenuItem>
              <MenuItem value="outlet_audit">Outlet Audit</MenuItem>
              <MenuItem value="competitor_analysis">
                Competitor Analysis
              </MenuItem>
              <MenuItem value="brand_visibility">Brand Visibility</MenuItem>
            </Select>

            <Select
              name="target_roles"
              label="Target Role"
              formik={formik}
              disabled={isLoadingRoles}
            >
              <MenuItem value="">Select a role (Optional)</MenuItem>
              {roles.map(role => (
                <MenuItem key={role.id} value={String(role.id)}>
                  {role.name}
                </MenuItem>
              ))}
            </Select>

            <Input
              name="expires_at"
              label="Expiry Date"
              placeholder="Select expiry date"
              formik={formik}
              type="date"
            />

            <Select name="is_active" label="Status" formik={formik} required>
              <MenuItem value="Y">Active</MenuItem>
              <MenuItem value="N">Inactive</MenuItem>
            </Select>

            <Box className="md:!col-span-2">
              <Input
                name="description"
                label="Description"
                placeholder="Enter survey description"
                formik={formik}
                multiline
                rows={4}
              />
            </Box>
          </Box>

          <Box className="!space-y-3">
            <Box className="!flex !justify-between !items-center">
              <Typography
                variant="body1"
                className="!font-semibold !text-gray-900"
              >
                Survey Fields
              </Typography>
              <Button
                type="button"
                variant="outlined"
                startIcon={<Plus />}
                onClick={addSurveyField}
                size="small"
              >
                Add Field
              </Button>
            </Box>

            {surveyFields.length > 0 && (
              <Table
                data={fieldsWithIndex}
                columns={surveyFieldColumns}
                getRowId={row => row._index.toString()}
                pagination={false}
                sortable={false}
                emptyMessage="No survey fields added yet."
              />
            )}

            {surveyFields.length === 0 && (
              <Box className="!text-center !py-8 !text-gray-500">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <Typography variant="body2">
                  No survey fields added yet. Click "Add Field" to get started.
                </Typography>
              </Box>
            )}
          </Box>

          <Box className="!flex !justify-end items-center">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              className="!mr-3"
              disabled={createOrUpdateSurveyMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createOrUpdateSurveyMutation.isPending}
            >
              {createOrUpdateSurveyMutation.isPending
                ? isEdit
                  ? 'Updating...'
                  : 'Creating...'
                : isEdit
                  ? 'Update'
                  : 'Create'}{' '}
              Survey
            </Button>
          </Box>
        </form>
      </Box>
    </CustomDrawer>
  );
};

export default ManageSurvey;
