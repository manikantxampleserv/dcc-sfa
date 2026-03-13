import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import { useCreateTemplate, useUpdateTemplate } from 'hooks/useTemplates';
import type { Template } from 'services/templates';
import React from 'react';
import { templateValidationSchema } from 'schemas/template.schema';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';

interface ManageEmailTemplatesProps {
  selectedTemplate?: Template | null;
  setSelectedTemplate: (template: Template | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageEmailTemplates: React.FC<ManageEmailTemplatesProps> = ({
  selectedTemplate,
  setSelectedTemplate,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedTemplate;

  const handleCancel = () => {
    setSelectedTemplate(null);
    setDrawerOpen(false);
    formik.resetForm();
  };

  const createTemplateMutation = useCreateTemplate();
  const updateTemplateMutation = useUpdateTemplate();

  const formik = useFormik({
    initialValues: {
      name: selectedTemplate?.name || '',
      key: selectedTemplate?.key || '',
      subject: selectedTemplate?.subject || '',
      body: selectedTemplate?.body || '',
      channel: selectedTemplate?.channel || '',
      type: selectedTemplate?.type || '',
    },
    validationSchema: templateValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const templateData = {
          name: values.name,
          key: values.key,
          subject: values.subject,
          body: values.body,
          channel: values.channel || undefined,
          type: values.type || undefined,
        };

        if (isEdit && selectedTemplate) {
          await updateTemplateMutation.mutateAsync({
            id: selectedTemplate.id,
            data: templateData,
          });
        } else {
          await createTemplateMutation.mutateAsync(templateData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving template:', error);
      }
    },
  });

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Template' : 'Create Template'}
      size="medium"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Input
              name="name"
              label="Template Name"
              placeholder="Enter template name"
              formik={formik}
              required
            />

            <Input
              name="key"
              label="Template Key"
              placeholder="Enter template key"
              formik={formik}
              required
              disabled={isEdit}
            />
            <Box className="md:!col-span-2">
              <Input
                name="subject"
                label="Subject"
                placeholder="Enter email subject"
                formik={formik}
                required
              />
            </Box>

            <Box className="md:!col-span-2">
              <Input
                name="body"
                label="Template Body"
                placeholder="Enter template body content"
                formik={formik}
                multiline
                rows={6}
                required
              />
            </Box>
            <Select
              name="channel"
              label="Channel"
              placeholder="Select channel"
              formik={formik}
            >
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="sms">SMS</MenuItem>
              <MenuItem value="push">Push Notification</MenuItem>
              <MenuItem value="whatsapp">WhatsApp</MenuItem>
            </Select>

            <Select
              name="type"
              label="Type"
              placeholder="Select type"
              formik={formik}
            >
              <MenuItem value="welcome">Welcome</MenuItem>
              <MenuItem value="approval">Approval</MenuItem>
              <MenuItem value="notification">Notification</MenuItem>
              <MenuItem value="alert">Alert</MenuItem>
              <MenuItem value="reminder">Reminder</MenuItem>
              <MenuItem value="transactional">Transactional</MenuItem>
              <MenuItem value="verification">Verification</MenuItem>
            </Select>
          </Box>

          <Box className="!flex !justify-end">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              className="!mr-3"
              disabled={
                createTemplateMutation.isPending ||
                updateTemplateMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createTemplateMutation.isPending ||
                updateTemplateMutation.isPending
              }
            >
              {createTemplateMutation.isPending ||
              updateTemplateMutation.isPending
                ? isEdit
                  ? 'Updating...'
                  : 'Creating...'
                : isEdit
                  ? 'Update'
                  : 'Create'}{' '}
            </Button>
          </Box>
        </form>
      </Box>
    </CustomDrawer>
  );
};

export default ManageEmailTemplates;
