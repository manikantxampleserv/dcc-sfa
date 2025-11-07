import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import { useCreateVisit, useUpdateVisit, type Visit } from 'hooks/useVisits';
import { useRoutes } from 'hooks/useRoutes';
import { useZones } from 'hooks/useZones';
import React from 'react';
import { visitValidationSchema } from 'schemas/visit.schema';
import Button from 'shared/Button';
import CustomerSelect from 'shared/CustomerSelect';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';
import UserSelect from 'shared/UserSelect';
import { formatForDateInput } from 'utils/dateUtils';

interface ManageVisitProps {
  selectedVisit?: Visit | null;
  setSelectedVisit: (visit: Visit | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageVisit: React.FC<ManageVisitProps> = ({
  selectedVisit,
  setSelectedVisit,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedVisit;

  // Fetch data using hooks
  const routesResponse = useRoutes({ limit: 1000 }); // Get all routes
  const zonesResponse = useZones({ limit: 1000 }); // Get all zones

  const routes = routesResponse?.data?.data || [];
  const zones = zonesResponse?.data?.data || [];

  const handleCancel = () => {
    setSelectedVisit(null);
    setDrawerOpen(false);
  };

  const createVisitMutation = useCreateVisit();
  const updateVisitMutation = useUpdateVisit();

  const formik = useFormik({
    initialValues: {
      customer_id: selectedVisit?.customer_id?.toString() || '',
      sales_person_id: selectedVisit?.sales_person_id?.toString() || '',
      route_id: selectedVisit?.route_id?.toString() || '',
      zones_id: selectedVisit?.zones_id?.toString() || '',
      visit_date: formatForDateInput(selectedVisit?.visit_date),
      visit_time: selectedVisit?.visit_time || '',
      purpose: selectedVisit?.purpose || '',
      status: selectedVisit?.status || 'planned',
      start_latitude: selectedVisit?.start_latitude || '',
      start_longitude: selectedVisit?.start_longitude || '',
      end_latitude: selectedVisit?.end_latitude || '',
      end_longitude: selectedVisit?.end_longitude || '',
      orders_created: selectedVisit?.orders_created?.toString() || '',
      amount_collected: selectedVisit?.amount_collected || '',
      visit_notes: selectedVisit?.visit_notes || '',
      customer_feedback: selectedVisit?.customer_feedback || '',
      next_visit_date: formatForDateInput(selectedVisit?.next_visit_date),
      is_active: selectedVisit?.is_active || 'Y',
    },
    validationSchema: visitValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const visitData = {
          customer_id: Number(values.customer_id),
          sales_person_id: Number(values.sales_person_id),
          route_id: values.route_id ? Number(values.route_id) : undefined,
          zones_id: values.zones_id ? Number(values.zones_id) : undefined,
          visit_date: values.visit_date || undefined,
          visit_time: values.visit_time || undefined,
          purpose: values.purpose || undefined,
          status: values.status || undefined,
          start_latitude: values.start_latitude || undefined,
          start_longitude: values.start_longitude || undefined,
          end_latitude: values.end_latitude || undefined,
          end_longitude: values.end_longitude || undefined,
          orders_created: values.orders_created
            ? Number(values.orders_created)
            : undefined,
          amount_collected: values.amount_collected || undefined,
          visit_notes: values.visit_notes || undefined,
          customer_feedback: values.customer_feedback || undefined,
          next_visit_date: values.next_visit_date || undefined,
          is_active: values.is_active,
        };

        if (isEdit && selectedVisit) {
          await updateVisitMutation.mutateAsync({
            id: selectedVisit.id,
            ...visitData,
          });
        } else {
          await createVisitMutation.mutateAsync(visitData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving visit:', error);
      }
    },
  });

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Visit' : 'Create Visit'}
      size="large"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <CustomerSelect
              name="customer_id"
              label="Customer"
              formik={formik}
              required
            />

            <UserSelect
              name="sales_person_id"
              label="Sales Person"
              formik={formik}
              required
            />

            <Select name="route_id" label="Route" formik={formik}>
              <MenuItem value="">Select Route</MenuItem>
              {routes.map(route => (
                <MenuItem key={route.id} value={route.id.toString()}>
                  {route.name} ({route.code})
                </MenuItem>
              ))}
            </Select>

            <Select name="zones_id" label="Zone" formik={formik}>
              <MenuItem value="">Select Zone</MenuItem>
              {zones.map(zone => (
                <MenuItem key={zone.id} value={zone.id.toString()}>
                  {zone.name}
                </MenuItem>
              ))}
            </Select>

            <Input
              name="visit_date"
              label="Visit Date"
              type="date"
              formik={formik}
            />

            <Input
              name="visit_time"
              label="Visit Time"
              type="time"
              formik={formik}
            />

            <Select name="status" label="Status" formik={formik}>
              <MenuItem value="planned">Planned</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>

            <Select
              name="is_active"
              label="Active Status"
              formik={formik}
              required
            >
              <MenuItem value="Y">Active</MenuItem>
              <MenuItem value="N">Inactive</MenuItem>
            </Select>

            <Input
              name="orders_created"
              label="Orders Created"
              placeholder="Enter orders created"
              type="number"
              formik={formik}
            />

            <Input
              type="number"
              name="amount_collected"
              label="Amount Collected"
              placeholder="Enter amount collected"
              formik={formik}
            />

            <Input
              name="next_visit_date"
              label="Next Visit Date"
              type="date"
              formik={formik}
            />

            <Box className="md:!col-span-2">
              <Input
                name="purpose"
                label="Purpose"
                placeholder="Enter visit purpose"
                formik={formik}
                multiline
                rows={2}
              />
            </Box>

            <Box className="md:!col-span-2">
              <Input
                name="visit_notes"
                label="Visit Notes"
                placeholder="Enter visit notes"
                formik={formik}
                multiline
                rows={3}
              />
            </Box>

            <Box className="md:!col-span-2">
              <Input
                name="customer_feedback"
                label="Customer Feedback"
                placeholder="Enter customer feedback"
                formik={formik}
                multiline
                rows={3}
              />
            </Box>
          </Box>

          <Box className="!flex !justify-end items-center gap-2 flex-wrap">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              disabled={
                createVisitMutation.isPending || updateVisitMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              loading={
                createVisitMutation.isPending || updateVisitMutation.isPending
              }
            >
              {createVisitMutation.isPending
                ? 'Creating...'
                : updateVisitMutation.isPending
                  ? 'Updating...'
                  : isEdit
                    ? 'Update Visit'
                    : 'Create Visit'}
            </Button>
          </Box>
        </form>
      </Box>
    </CustomDrawer>
  );
};

export default ManageVisit;
