import { Chip } from '@mui/material';
import { useAuth } from 'context/AuthContext';
import { useMockDb } from 'context/MockDataContext';
import dayjs from 'dayjs';
import {
  Clock,
  Edit2,
  FileText,
  MapPin,
  Play,
  Plus,
  Truck,
  User,
  UserCheck,
} from 'lucide-react';
import type { Delivery } from 'mock/data/deliveries';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActionButton, ViewButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import ScheduleDeliveryModal from 'shared/ScheduleDeliveryModal';
import StatsCard from 'shared/StatsCard';
import type { TableColumn } from 'shared/Table';
import Table from 'shared/Table';

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

/**
 * Delivery Schedule page for viewing, dispatching, and assigning drivers to orders.
 */
const DeliverySchedule: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { deliveries, orders } = useMockDb();
  const isCustomer = user?.role === 'customer';
  const [scheduleModalOpen, setScheduleModalOpen] = useState<boolean>(false);
  const [selectedOrderForSchedule, setSelectedOrderForSchedule] = useState<
    string | undefined
  >(undefined);
  const [filterTab, setFilterTab] = useState<
    'all' | 'unassigned' | 'in_transit'
  >('all');

  /** Customer order numbers to isolate data for buyers */
  const customerOrderNumbers = useMemo(() => {
    return new Set(
      orders
        .filter(
          o =>
            !isCustomer ||
            o.customer_sap_code === user?.sapCode ||
            o.customer_name === user?.company ||
            o.customer_name === user?.name
        )
        .map(o => o.order_number)
    );
  }, [orders, isCustomer, user]);

  /** Active deliveries (not delivered/failed) for approved orders, latest on top */
  const activeDeliveries = useMemo(() => {
    return deliveries
      .filter(d => {
        if (
          isCustomer &&
          !customerOrderNumbers.has(d.order_number) &&
          d.customer_name !== user?.company &&
          d.customer_name !== user?.name
        ) {
          return false;
        }
        const matchingOrder = orders.find(
          o => o.order_number === d.order_number
        );
        if (matchingOrder && matchingOrder.status === 'pending_approval') {
          return false;
        }
        return ['scheduled', 'out_for_delivery', 'rescheduled'].includes(
          d.status
        );
      })
      .sort((a, b) => {
        const timeB = new Date(b.scheduled_date || 0).getTime();
        const timeA = new Date(a.scheduled_date || 0).getTime();
        return timeB - timeA || b.id - a.id;
      });
  }, [deliveries, orders, isCustomer, customerOrderNumbers, user]);

  /** Filtered deliveries by selected tab */
  const filteredDeliveries = useMemo(() => {
    if (filterTab === 'unassigned') {
      return activeDeliveries.filter(
        d =>
          !d.driver_name ||
          d.driver_name === 'Pending Assignment' ||
          d.vehicle_plate === 'PENDING'
      );
    }
    if (filterTab === 'in_transit') {
      return activeDeliveries.filter(d => d.status === 'out_for_delivery');
    }
    return activeDeliveries;
  }, [activeDeliveries, filterTab]);

  const unassignedCount = activeDeliveries.filter(
    d =>
      !d.driver_name ||
      d.driver_name === 'Pending Assignment' ||
      d.vehicle_plate === 'PENDING'
  ).length;

  const inTransitCount = activeDeliveries.filter(
    d => d.status === 'out_for_delivery'
  ).length;

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
      label: 'Date & Slot',
      render: (_, row) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-800">
            {dayjs(row.scheduled_date).format('ddd, DD MMM YYYY')}
          </span>
          {row.scheduled_time_slot && (
            <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3 text-gray-400" />
              {row.scheduled_time_slot}
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'driver',
      label: 'Driver & Vehicle',
      render: (_, row) => {
        const isUnassigned =
          !row.driver_name ||
          row.driver_name === 'Pending Assignment' ||
          row.vehicle_plate === 'PENDING';

        if (isUnassigned) {
          if (isCustomer) {
            return (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>Awaiting Dispatch</span>
              </span>
            );
          }
          return (
            <button
              type="button"
              onClick={() => {
                setSelectedOrderForSchedule(row.order_number);
                setScheduleModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-amber-600" />
              <span>Assign Driver & Vehicle</span>
            </button>
          );
        }

        return (
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
        );
      },
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
      label: 'Actions',
      width: isCustomer ? 90 : 140,
      render: (_, row) => {
        if (isCustomer) {
          const matchOrder = orders.find(
            o => o.order_number === row.order_number
          );
          return (
            <ViewButton
              onClick={() => {
                if (matchOrder) navigate(`/orders/${matchOrder.id}`);
                else navigate('/orders');
              }}
              size="small"
              tooltip="View Order Details"
            />
          );
        }
        return (
          <div className="flex items-center gap-1">
            <ActionButton
              icon={<Edit2 className="w-3.5 h-3.5" />}
              tooltip="Assign / Reschedule"
              onClick={() => {
                setSelectedOrderForSchedule(row.order_number);
                setScheduleModalOpen(true);
              }}
              color="secondary"
            />
            <ActionButton
              icon={<Play className="w-4 h-4" />}
              tooltip="Execute Delivery"
              onClick={() => navigate(`/deliveries/execute/${row.id}`)}
              color="primary"
            />
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/** Page Title & Schedule Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {isCustomer ? 'My Deliveries' : 'Delivery Schedule'}
          </h1>
          <p className="text-sm text-gray-500">
            {isCustomer
              ? 'Upcoming and active deliveries for your approved orders'
              : 'Upcoming and active deliveries for approved orders'}
          </p>
        </div>
        {!isCustomer && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setSelectedOrderForSchedule(undefined);
              setScheduleModalOpen(true);
            }}
          >
            Schedule Delivery
          </Button>
        )}
      </div>

      {/** Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Active Deliveries"
          value={activeDeliveries.length}
          icon={<Truck className="w-5 h-5" />}
          color="blue"
        />
        <StatsCard
          title={isCustomer ? 'Awaiting Dispatch' : 'Pending Assignment'}
          value={unassignedCount}
          icon={<Clock className="w-5 h-5" />}
          color="orange"
        />
        <StatsCard
          title="Out for Delivery"
          value={inTransitCount}
          icon={<UserCheck className="w-5 h-5" />}
          color="green"
        />
      </div>

      {/** Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          type="button"
          onClick={() => setFilterTab('all')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            filterTab === 'all'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          All Active ({activeDeliveries.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterTab('unassigned')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            filterTab === 'unassigned'
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {isCustomer
            ? `Awaiting Dispatch (${unassignedCount})`
            : `Needs Driver (${unassignedCount})`}
        </button>
        <button
          type="button"
          onClick={() => setFilterTab('in_transit')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            filterTab === 'in_transit'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Out for Delivery ({inTransitCount})
        </button>
      </div>

      {/** Deliveries Table */}
      <Table
        columns={columns}
        rows={filteredDeliveries}
        emptyMessage="No active deliveries scheduled."
      />

      {/** Schedule Delivery Modal - Sales Officer only */}
      {!isCustomer && (
        <ScheduleDeliveryModal
          open={scheduleModalOpen}
          onClose={() => {
            setScheduleModalOpen(false);
            setSelectedOrderForSchedule(undefined);
          }}
          orderNumber={selectedOrderForSchedule}
        />
      )}
    </div>
  );
};

export default DeliverySchedule;
