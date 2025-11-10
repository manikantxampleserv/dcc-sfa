import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import { useCreateRoute, useUpdateRoute, type Route } from 'hooks/useRoutes';
import { useRouteTypes, type RouteType } from 'hooks/useRouteTypes';
import React from 'react';
import { routeValidationSchema } from 'schemas/route.schema';
import type { Depot } from 'services/masters/Depots';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';
import UserSelect from 'shared/UserSelect';

interface Zone {
  id: number;
  name: string;
}

interface ManageRouteProps {
  selectedRoute?: Route | null;
  setSelectedRoute: (route: Route | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
  depots: Depot[];
  zones: Zone[];
}

const ManageRoute: React.FC<ManageRouteProps> = ({
  selectedRoute,
  setSelectedRoute,
  drawerOpen,
  setDrawerOpen,
  depots,
  zones,
}) => {
  const isEdit = !!selectedRoute;

  const handleCancel = () => {
    setSelectedRoute(null);
    setDrawerOpen(false);
  };

  const createRouteMutation = useCreateRoute();
  const updateRouteMutation = useUpdateRoute();

  const { data: routeTypesResponse } = useRouteTypes({ status: 'active' });
  const routeTypes = routeTypesResponse?.data || [];

  const formik = useFormik({
    initialValues: {
      parent_id: selectedRoute?.parent_id?.toString() || '',
      depot_id: selectedRoute?.depot_id?.toString() || '',
      route_type_id: (selectedRoute as any)?.route_type_id?.toString() || '',
      name: selectedRoute?.name || '',
      description: selectedRoute?.description || '',
      salesperson_id: selectedRoute?.salesperson_id?.toString() || '',
      start_location: selectedRoute?.start_location || '',
      end_location: selectedRoute?.end_location || '',
      estimated_distance: selectedRoute?.estimated_distance?.toString() || '',
      estimated_time: selectedRoute?.estimated_time?.toString() || '',
      is_active: selectedRoute?.is_active || 'Y',
    },
    validationSchema: routeValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const routeData = {
          parent_id: Number(values.parent_id),
          depot_id: Number(values.depot_id),
          route_type_id: Number(values.route_type_id),
          name: values.name,
          description: values.description || undefined,
          salesperson_id: values.salesperson_id
            ? Number(values.salesperson_id)
            : undefined,
          start_location: values.start_location || undefined,
          end_location: values.end_location || undefined,
          estimated_distance: values.estimated_distance
            ? Number(values.estimated_distance)
            : undefined,
          estimated_time: values.estimated_time
            ? Number(values.estimated_time)
            : undefined,
          is_active: values.is_active,
        };

        if (isEdit && selectedRoute) {
          await updateRouteMutation.mutateAsync({
            id: selectedRoute.id,
            ...routeData,
          });
        } else {
          await createRouteMutation.mutateAsync(routeData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving route:', error);
      }
    },
  });

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Route' : 'Create Route'}
      size="large"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            {/* Zone Selection */}
            <Select name="parent_id" label="Zone" formik={formik} required>
              <MenuItem value="">Select Zone</MenuItem>
              {zones.map(zone => (
                <MenuItem key={zone.id} value={zone.id.toString()}>
                  {zone.name}
                </MenuItem>
              ))}
            </Select>

            {/* Depot Selection */}
            <Select name="depot_id" label="Depot" formik={formik} required>
              <MenuItem value="">Select Depot</MenuItem>
              {depots.map(depot => (
                <MenuItem key={depot.id} value={depot.id.toString()}>
                  {depot.name} ({depot.code})
                </MenuItem>
              ))}
            </Select>

            {/* Route Type Selection */}
            <Select
              name="route_type_id"
              label="Route Type"
              formik={formik}
              required
            >
              <MenuItem value="">Select Route Type</MenuItem>
              {routeTypes.map((routeType: RouteType) => (
                <MenuItem key={routeType.id} value={routeType.id.toString()}>
                  {routeType.name}
                </MenuItem>
              ))}
            </Select>

            {/* Route Name */}
            <Input
              name="name"
              label="Route Name"
              placeholder="Enter route name"
              formik={formik}
              required
            />

            {/* Salesperson Selection */}
            <UserSelect
              name="salesperson_id"
              label="Salesperson"
              formik={formik}
            />

            {/* Start Location */}
            <Input
              name="start_location"
              label="Start Location"
              placeholder="Enter starting point"
              formik={formik}
            />

            {/* End Location */}
            <Input
              name="end_location"
              label="End Location"
              placeholder="Enter ending point"
              formik={formik}
            />

            {/* Estimated Distance */}
            <Input
              name="estimated_distance"
              label="Estimated Distance (km)"
              type="number"
              placeholder="Enter distance in kilometers"
              formik={formik}
              slotProps={{ htmlInput: { step: '0.1', min: '0' } }}
            />

            {/* Estimated Time */}
            <Input
              name="estimated_time"
              label="Estimated Time (minutes)"
              type="number"
              placeholder="Enter time in minutes"
              formik={formik}
              slotProps={{ htmlInput: { min: '0' } }}
            />

            {/* Status */}
            <Select name="is_active" label="Status" formik={formik} required>
              <MenuItem value="Y">Active</MenuItem>
              <MenuItem value="N">Inactive</MenuItem>
            </Select>

            {/* Description - Full width */}
            <Box className="md:!col-span-2">
              <Input
                name="description"
                label="Description"
                placeholder="Enter route description"
                formik={formik}
                multiline
                rows={3}
              />
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box className="!flex !gap-3 !pt-4">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              className="!flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              loading={
                createRouteMutation.isPending || updateRouteMutation.isPending
              }
              className="!flex-1"
            >
              {isEdit ? 'Update Route' : 'Create Route'}
            </Button>
          </Box>
        </form>
      </Box>
    </CustomDrawer>
  );
};

export default ManageRoute;
