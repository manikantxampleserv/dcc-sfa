import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateRouteType,
  useUpdateRouteType,
  type RouteType,
} from 'hooks/useRouteTypes';
import React from 'react';
import { routeTypeValidationSchema } from 'schemas/routeType.schema';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';

interface ManageRouteTypeProps {
  selectedRouteType?: RouteType | null;
  setSelectedRouteType: (routeType: RouteType | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageRouteType: React.FC<ManageRouteTypeProps> = ({
  selectedRouteType,
  setSelectedRouteType,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedRouteType;

  const createRouteTypeMutation = useCreateRouteType();
  const updateRouteTypeMutation = useUpdateRouteType();

  const handleCancel = () => {
    setSelectedRouteType(null);
    setDrawerOpen(false);
    formik.resetForm();
  };

  const formik = useFormik({
    initialValues: {
      name: selectedRouteType?.name || '',
      is_active: selectedRouteType?.is_active || 'Y',
    },
    validationSchema: routeTypeValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        if (isEdit && selectedRouteType) {
          await updateRouteTypeMutation.mutateAsync({
            id: selectedRouteType.id,
            data: values,
          });
        } else {
          await createRouteTypeMutation.mutateAsync(values);
        }
        handleCancel();
      } catch (error) {
        console.error('Error saving route type:', error);
      }
    },
  });

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Route Type' : 'Create Route Type'}
      size="medium"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Input
              name="name"
              label="Route Type Name"
              placeholder="Enter route type name"
              formik={formik}
              required
            />

            <Select name="is_active" label="Status" formik={formik} required>
              <MenuItem value="Y">Active</MenuItem>
              <MenuItem value="N">Inactive</MenuItem>
            </Select>
          </Box>

          <Box className="!flex !justify-end">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              className="!mr-3"
              disabled={
                createRouteTypeMutation.isPending ||
                updateRouteTypeMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createRouteTypeMutation.isPending ||
                updateRouteTypeMutation.isPending
              }
            >
              {createRouteTypeMutation.isPending ||
              updateRouteTypeMutation.isPending
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

export default ManageRouteType;

