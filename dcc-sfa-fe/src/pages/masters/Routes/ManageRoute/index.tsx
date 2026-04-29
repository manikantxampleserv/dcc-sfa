import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import { useCreateRoute, useUpdateRoute, type Route } from 'hooks/useRoutes';
import { useRouteTypes, type RouteType } from 'hooks/useRouteTypes';
import React, { useEffect } from 'react';
import { routeValidationSchema } from 'schemas/route.schema';
import type { Depot } from 'services/masters/Depots';
import ActiveInactiveField from 'shared/ActiveInactiveField';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';

interface Zone {
  id: number;
  name: string;
  depot_id?: number;
  zone_depots?: {
    id: number;
    name: string;
    code: string;
  } | null;
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
    formik.resetForm();
    formik.setFieldValue('parent_id', null);
    formik.setFieldValue('depot_id', null);
  };

  const createRouteMutation = useCreateRoute();
  const updateRouteMutation = useUpdateRoute();

  const { data: routeTypesResponse } = useRouteTypes({
    status: 'active',
    limit: 1000,
  });
  const routeTypes = routeTypesResponse?.data || [];

  const formik = useFormik({
    initialValues: {
      parent_id: selectedRoute?.parent_id?.toString() || '',
      depot_id: selectedRoute?.depot_id?.toString() || '',
      route_type_id: selectedRoute?.route_type_id?.toString() || '',
      name: selectedRoute?.name || '',
      description: selectedRoute?.description || '',
      start_location: selectedRoute?.start_location || '',
      end_location: selectedRoute?.end_location || '',
      starting_latitude: selectedRoute?.starting_latitude?.toString() || '',
      starting_longitude: selectedRoute?.starting_longitude?.toString() || '',
      ending_latitude: selectedRoute?.ending_latitude?.toString() || '',
      ending_longitude: selectedRoute?.ending_longitude?.toString() || '',
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
          description: values.description,
          start_location: values.start_location,
          end_location: values.end_location,
          starting_latitude: values.starting_latitude || undefined,
          starting_longitude: values.starting_longitude || undefined,
          ending_latitude: values.ending_latitude || undefined,
          ending_longitude: values.ending_longitude || undefined,
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

  useEffect(() => {
    if (formik.values.parent_id) {
      const selectedZone = zones.find(
        zone => zone.id === Number(formik.values.parent_id)
      );
      if (selectedZone?.zone_depots?.id) {
        formik.setFieldValue(
          'depot_id',
          selectedZone.zone_depots.id.toString()
        );
      } else {
        formik.setFieldValue('depot_id', null);
      }
    } else {
      formik.setFieldValue('depot_id', null);
    }
  }, [formik.values.parent_id, zones]);

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Route' : 'Create Route'}
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            {/* Route Name */}
            <Input
              name="name"
              label="Route Name"
              placeholder="Enter route name"
              formik={formik}
              required
            />
            {/* Route Type Selection */}
            <Select
              name="route_type_id"
              label="Route Type"
              formik={formik}
              required
            >
              {routeTypes.map((routeType: RouteType) => (
                <MenuItem key={routeType.id} value={routeType.id.toString()}>
                  {routeType.name}
                </MenuItem>
              ))}
            </Select>

            {/* Zone Selection */}
            <Select
              name="parent_id"
              label="Zone"
              formik={formik}
              required
              disableClearable={false}
            >
              {zones.map(zone => (
                <MenuItem key={zone.id} value={zone.id.toString()}>
                  {zone.name}
                </MenuItem>
              ))}
            </Select>

            {/* Depot Selection */}
            <Select
              key={`depot-${formik.values.parent_id || 'empty'}`}
              name="depot_id"
              label="Depot"
              formik={formik}
              required
            >
              {depots.map(depot => (
                <MenuItem key={depot.id} value={depot.id.toString()}>
                  {depot.name} ({depot.code})
                </MenuItem>
              ))}
            </Select>
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

            <Input
              name="starting_latitude"
              label="Start Latitude"
              type="number"
              placeholder="e.g., 6.927079"
              formik={formik}
              slotProps={{
                htmlInput: { step: '0.000001', min: '-90', max: '90' },
              }}
            />

            <Input
              name="starting_longitude"
              label="Start Longitude"
              type="number"
              placeholder="e.g., 79.861244"
              formik={formik}
              slotProps={{
                htmlInput: { step: '0.000001', min: '-180', max: '180' },
              }}
            />

            <Input
              name="ending_latitude"
              label="End Latitude"
              type="number"
              placeholder="e.g., 6.900000"
              formik={formik}
              slotProps={{
                htmlInput: { step: '0.000001', min: '-90', max: '90' },
              }}
            />

            <Input
              name="ending_longitude"
              label="End Longitude"
              type="number"
              placeholder="e.g., 79.850000"
              formik={formik}
              slotProps={{
                htmlInput: { step: '0.000001', min: '-180', max: '180' },
              }}
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

            <Box className="md:!col-span-2">
              <ActiveInactiveField name="is_active" formik={formik} required />
            </Box>

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
          <Box className="!flex !justify-end !gap-3 !pt-4">
            <Button type="button" variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              loading={
                createRouteMutation.isPending || updateRouteMutation.isPending
              }
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
