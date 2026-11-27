import { Box, MenuItem } from '@mui/material';
import dayjs from 'dayjs';
import { Clock } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from 'context/AuthContext';
import { useMockDb } from 'context/MockDataContext';
import type { Delivery } from 'mock/data/deliveries';
import Button from 'shared/Button';
import Drawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';

export interface ScheduleDeliveryModalProps {
  open: boolean;
  onClose: () => void;
  orderNumber?: string;
  initialDate?: string;
  initialDriver?: string;
  initialVehicle?: string;
  initialAddress?: string;
  onSuccess?: (delivery: Delivery) => void;
}

const DRIVER_OPTIONS = [
  {
    name: 'Peter Odhiambo',
    phone: '+255 756 789 012',
    defaultVehicle: 'T 567 ABC',
  },
  {
    name: 'John Mbeki',
    phone: '+255 713 456 789',
    defaultVehicle: 'T 234 XYZ',
  },
  {
    name: 'James Kiiza',
    phone: '+255 768 234 567',
    defaultVehicle: 'T 890 DEF',
  },
  {
    name: 'Emmanuel Swai',
    phone: '+255 784 112 233',
    defaultVehicle: 'T 112 GHI',
  },
  {
    name: 'Rashid Kassim',
    phone: '+255 712 998 877',
    defaultVehicle: 'T 445 JKL',
  },
];

const VEHICLE_OPTIONS = [
  { plate: 'T 567 ABC', label: 'T 567 ABC - Canter 3.5T (Light Duty)' },
  { plate: 'T 234 XYZ', label: 'T 234 XYZ - Isuzu Forward 5T (Medium Duty)' },
  { plate: 'T 890 DEF', label: 'T 890 DEF - Mitsubishi Fuso 7T (Heavy Duty)' },
  { plate: 'T 112 GHI', label: 'T 112 GHI - Toyota HiAce 1.5T (Express Van)' },
  { plate: 'T 445 JKL', label: 'T 445 JKL - Tata Ultra 4T (Standard)' },
];

/**
 * Schedule Delivery Drawer component.
 * Follows the standard SFA drawer pattern with shared Input, Select, and Button components.
 * Strictly lists only APPROVED orders for delivery scheduling.
 * Accessible strictly by sales officers.
 */
const ScheduleDeliveryModal: React.FC<ScheduleDeliveryModalProps> = ({
  open,
  onClose,
  orderNumber,
  initialDate,
  initialDriver,
  initialVehicle,
  initialAddress,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { orders, deliveries, scheduleDelivery } = useMockDb();

  /** Strictly filter for approved orders only */
  const approvedOrders = useMemo(() => {
    return orders.filter(
      o =>
        o.status === 'approved' ||
        (orderNumber &&
          o.order_number === orderNumber &&
          o.status !== 'pending_approval')
    );
  }, [orders, orderNumber]);

  const [selectedOrderNum, setSelectedOrderNum] = useState<string>('');
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [timeSlot, setTimeSlot] = useState<string>('08:00 AM - 12:00 PM');
  const [driverName, setDriverName] = useState<string>('');
  const [driverPhone, setDriverPhone] = useState<string>('');
  const [vehiclePlate, setVehiclePlate] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [priority, setPriority] = useState<string>('medium');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  /** Enforce RBAC: Only sales officers can schedule delivery */
  if (user?.role !== 'sales_officer') {
    return null;
  }

  /** Active order matching selection */
  const activeOrder = useMemo(() => {
    return orders.find(o => o.order_number === selectedOrderNum);
  }, [orders, selectedOrderNum]);

  /** Active existing delivery if already in record */
  const existingDelivery = useMemo(() => {
    return deliveries.find(d => d.order_number === selectedOrderNum);
  }, [deliveries, selectedOrderNum]);

  useEffect(() => {
    if (!open) return;

    const initialOrder = orderNumber || approvedOrders[0]?.order_number || '';

    setSelectedOrderNum(initialOrder);

    const relatedDel = deliveries.find(d => d.order_number === initialOrder);
    const relatedOrd = orders.find(o => o.order_number === initialOrder);

    const defaultDate =
      initialDate ||
      relatedDel?.scheduled_date ||
      relatedOrd?.delivery_date ||
      dayjs().add(1, 'day').format('YYYY-MM-DD');

    setScheduledDate(defaultDate);
    setTimeSlot(relatedDel?.scheduled_time_slot || '08:00 AM - 12:00 PM');

    const defaultDriver =
      initialDriver ||
      (relatedDel?.driver_name &&
      relatedDel.driver_name !== 'Pending Assignment'
        ? relatedDel.driver_name
        : DRIVER_OPTIONS[0].name);

    setDriverName(defaultDriver);
    const matchDriver = DRIVER_OPTIONS.find(d => d.name === defaultDriver);
    setDriverPhone(
      relatedDel?.driver_phone || matchDriver?.phone || DRIVER_OPTIONS[0].phone
    );

    const defaultVeh =
      initialVehicle ||
      (relatedDel?.vehicle_plate && relatedDel.vehicle_plate !== 'PENDING'
        ? relatedDel.vehicle_plate
        : matchDriver?.defaultVehicle || VEHICLE_OPTIONS[0].plate);

    setVehiclePlate(defaultVeh);
    setDeliveryAddress(
      initialAddress ||
        relatedDel?.delivery_address ||
        '45 Kariakoo Market Street, Dar es Salaam'
    );
    setPriority(relatedDel?.priority || 'medium');
    setNotes(relatedDel?.notes || relatedOrd?.notes || '');
  }, [
    open,
    orderNumber,
    initialDate,
    initialDriver,
    initialVehicle,
    initialAddress,
    approvedOrders,
    deliveries,
    orders,
  ]);

  const handleDriverChange = (driver: any) => {
    const driverStr = String(driver || '');
    setDriverName(driverStr);
    const match = DRIVER_OPTIONS.find(d => d.name === driverStr);
    if (match) {
      setDriverPhone(match.phone);
      if (!vehiclePlate || vehiclePlate === 'PENDING') {
        setVehiclePlate(match.defaultVehicle);
      }
    }
  };

  const handleOrderChange = (newOrderNum: any) => {
    const orderStr = String(newOrderNum || '');
    setSelectedOrderNum(orderStr);
    const relatedDel = deliveries.find(d => d.order_number === orderStr);
    const relatedOrd = orders.find(o => o.order_number === orderStr);

    if (relatedDel?.scheduled_date) {
      setScheduledDate(relatedDel.scheduled_date);
    } else if (relatedOrd?.delivery_date) {
      setScheduledDate(relatedOrd.delivery_date);
    }

    if (
      relatedDel?.driver_name &&
      relatedDel.driver_name !== 'Pending Assignment'
    ) {
      setDriverName(relatedDel.driver_name);
      setDriverPhone(relatedDel.driver_phone);
    }
    if (relatedDel?.vehicle_plate && relatedDel.vehicle_plate !== 'PENDING') {
      setVehiclePlate(relatedDel.vehicle_plate);
    }
    if (relatedDel?.delivery_address) {
      setDeliveryAddress(relatedDel.delivery_address);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderNum) {
      toast.error('Please select an approved order to schedule.');
      return;
    }
    if (!scheduledDate) {
      toast.error('Please pick a delivery date.');
      return;
    }
    if (!driverName || driverName === 'Pending Assignment') {
      toast.error('Please assign a valid driver.');
      return;
    }
    if (!vehiclePlate || vehiclePlate === 'PENDING') {
      toast.error('Please assign a fleet vehicle.');
      return;
    }

    setIsSubmitting(true);

    try {
      /** Schedule the delivery and synchronize persistent state */
      const scheduledDel = scheduleDelivery({
        orderNumber: selectedOrderNum,
        scheduled_date: scheduledDate,
        scheduled_time_slot: timeSlot,
        driver_name: driverName,
        driver_phone: driverPhone,
        vehicle_plate: vehiclePlate,
        delivery_address: deliveryAddress,
        priority: priority as any,
        notes,
      });

      toast.success(
        `Delivery for Order ${selectedOrderNum} scheduled for ${dayjs(scheduledDate).format('DD MMM YYYY')}!`
      );

      if (scheduledDel && onSuccess) {
        onSuccess(scheduledDel);
      }

      onClose();
    } catch {
      toast.error('Failed to schedule delivery. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer
      open={open}
      setOpen={isOpen => {
        if (!isOpen) onClose();
      }}
      title={existingDelivery ? 'Edit Delivery Schedule' : 'Schedule Delivery'}
      size="medium"
    >
      <Box className="!p-6 !h-full !flex !flex-col !justify-between">
        <form
          onSubmit={handleFormSubmit}
          className="!space-y-5 !flex-1 !flex !flex-col !justify-between"
        >
          <Box className="!space-y-5">
            {/** Approved Order Selector */}
            {orderNumber ? (
              <Input
                name="order_number"
                label="Selected Order"
                value={`#${orderNumber} - ${activeOrder?.customer_name || 'Customer'}`}
                disabled
                fullWidth
              />
            ) : (
              <Select
                name="order_number"
                label="Approved Order"
                value={selectedOrderNum}
                setValue={handleOrderChange}
                required
                fullWidth
              >
                <MenuItem value="">Select an Approved Order</MenuItem>
                {approvedOrders.map(order => (
                  <MenuItem key={order.order_number} value={order.order_number}>
                    #{order.order_number} - {order.customer_name} (TZS{' '}
                    {order.total_amount.toLocaleString()})
                  </MenuItem>
                ))}
              </Select>
            )}

            {approvedOrders.length === 0 && !orderNumber && (
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <span>
                  <strong>Notice:</strong> Only orders with status{' '}
                  <strong>Approved</strong> can be scheduled for delivery.
                  Please approve orders under{' '}
                  <strong>Approvals &gt; Pending Approvals</strong> first.
                </span>
              </div>
            )}

            {/* Order Details Card */}
            {activeOrder && (
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-3.5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-gray-700">
                    Order Information
                  </span>
                  <span className="font-semibold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Status: {activeOrder.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400 block">Customer:</span>
                    <span className="font-medium text-gray-800">
                      {activeOrder.customer_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">SAP Code:</span>
                    <span className="font-medium text-gray-800">
                      {activeOrder.customer_sap_code}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Items Load:</span>
                    <span className="font-medium text-gray-800">
                      {activeOrder.items.reduce((s, i) => s + i.quantity, 0)}{' '}
                      units ({activeOrder.items.length} SKUs)
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Total Amount:</span>
                    <span className="font-bold text-gray-900">
                      TZS {activeOrder.total_amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/** Delivery Date & Time Slot Grid */}
            <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
              <Input
                name="scheduled_date"
                label="Scheduled Date"
                type="date"
                value={scheduledDate}
                setValue={setScheduledDate}
                required
                fullWidth
              />

              <Select
                name="scheduled_time_slot"
                label="Scheduled Time Slot"
                value={timeSlot}
                setValue={setTimeSlot}
                fullWidth
              >
                <MenuItem value="08:00 AM - 12:00 PM">
                  08:00 AM - 12:00 PM (Morning)
                </MenuItem>
                <MenuItem value="12:00 PM - 04:00 PM">
                  12:00 PM - 04:00 PM (Afternoon)
                </MenuItem>
                <MenuItem value="04:00 PM - 07:00 PM">
                  04:00 PM - 07:00 PM (Evening)
                </MenuItem>
              </Select>
            </Box>

            {/** Vehicle & Driver Grid */}
            <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
              <Select
                name="assigned_driver"
                label="Assigned Driver"
                value={driverName}
                setValue={handleDriverChange}
                required
                fullWidth
              >
                {DRIVER_OPTIONS.map(d => (
                  <MenuItem key={d.name} value={d.name}>
                    {d.name} ({d.phone})
                  </MenuItem>
                ))}
              </Select>

              <Select
                name="assigned_vehicle"
                label="Assigned Vehicle"
                value={vehiclePlate}
                setValue={setVehiclePlate}
                required
                fullWidth
              >
                {VEHICLE_OPTIONS.map(v => (
                  <MenuItem key={v.plate} value={v.plate}>
                    {v.label}
                  </MenuItem>
                ))}
              </Select>
            </Box>

            {/** Delivery Site Address */}
            <Input
              name="delivery_address"
              label="Delivery Site Address"
              value={deliveryAddress}
              setValue={setDeliveryAddress}
              required
              fullWidth
            />

            {/** Priority */}
            <Select
              name="priority"
              label="Priority"
              value={priority}
              setValue={setPriority}
              fullWidth
            >
              <MenuItem value="low">Low (Standard)</MenuItem>
              <MenuItem value="medium">Medium (Normal)</MenuItem>
              <MenuItem value="high">High (Priority)</MenuItem>
              <MenuItem value="urgent">Urgent (Express)</MenuItem>
            </Select>

            {/* Delivery Instructions */}
            <Input
              name="delivery_instructions"
              label="Delivery Instructions"
              placeholder="Enter delivery instructions or site notes"
              value={notes}
              setValue={setNotes}
              multiline
              rows={3}
              fullWidth
            />
          </Box>

          {/* Drawer Footer Actions */}
          <Box className="!flex !justify-end items-center !gap-3 !pt-5 !border-t !border-gray-200">
            <Button
              type="button"
              variant="outlined"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              loading={isSubmitting}
              disabled={approvedOrders.length === 0 && !orderNumber}
            >
              {existingDelivery ? 'Delivery Reschedule' : 'Delivery Schedule'}
            </Button>
          </Box>
        </form>
      </Box>
    </Drawer>
  );
};

export default ScheduleDeliveryModal;
