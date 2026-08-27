import React from 'react';
import { Chip } from '@mui/material';
import dayjs from 'dayjs';
import { mockDeliveries } from 'mock/data/deliveries';
import type { Delivery } from 'mock/data/deliveries';
import Table from 'shared/Table';
import type { TableColumn } from 'shared/Table';
import { Truck, MapPin, User, FileText, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ActionButton } from 'shared/ActionButton';

const statusColors: Record<
  string,
  'default' | 'primary' | 'success' | 'error' | 'warning'
> = {
  scheduled: 'primary',
  out_for_delivery: 'warning',
  delivered: 'success',
  failed: 'error',
  rescheduled: 'default',
};

const statusLabels: Record<string, string> = {
  scheduled: 'Scheduled',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  failed: 'Failed',
  rescheduled: 'Rescheduled',
};

const DeliverySchedule: React.FC = () => {
  const navigate = useNavigate();
  // Active deliveries (not delivered/failed)
  const activeDeliveries = mockDeliveries.filter(d =>
    ['scheduled', 'out_for_delivery', 'rescheduled'].includes(d.status)
  );

  const columns: TableColumn<Delivery>[] = [
    {
      id: 'order_number',
      label: 'Order #',
      render: (_, row) => (
        <span className="font-mono text-xs font-semibold text-blue-600">
          {row.order_number}
        </span>
      ),
    },
    {
      id: 'scheduled_date',
      label: 'Date',
      render: (_, row) => (
        <span className="text-sm font-medium text-gray-800">
          {dayjs(row.scheduled_date).format('ddd, DD MMM YYYY')}
        </span>
      ),
    },
    {
      id: 'driver',
      label: 'Driver & Vehicle',
      render: (_, row) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-sm text-gray-800">
            <User className="w-3.5 h-3.5 text-gray-400" />
            <span>{row.driver_name}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Truck className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-mono">{row.vehicle_plate}</span>
          </div>
        </div>
      ),
    },
    {
      id: 'address',
      label: 'Address',
      render: (_, row) => (
        <div className="flex items-start gap-1 max-w-[200px]">
          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
          <span className="text-xs text-gray-600 truncate">
            {row.delivery_address}
          </span>
        </div>
      ),
    },
    {
      id: 'items',
      label: 'Load',
      render: (_, row) => (
        <div className="flex items-center gap-1 text-sm text-gray-800">
          <FileText className="w-3.5 h-3.5 text-gray-400" />
          <span>{row.items_count} items</span>
        </div>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (_, row) => (
        <Chip
          label={statusLabels[row.status]}
          size="small"
          color={statusColors[row.status]}
          variant="outlined"
        />
      ),
    },
    {
      id: 'actions',
      label: '',
      render: (_, row) => (
        <ActionButton
          icon={<Play className="w-4 h-4" />}
          tooltip="Execute Delivery"
          onClick={() => navigate(`/deliveries/execute/${row.id}`)}
          color="primary"
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Delivery Schedule</h1>
          <p className="text-sm text-gray-500">
            Upcoming and active deliveries
          </p>
        </div>
      </div>

      <Table
        columns={columns}
        rows={activeDeliveries}
        emptyMessage="No active deliveries scheduled."
      />
    </div>
  );
};

export default DeliverySchedule;
