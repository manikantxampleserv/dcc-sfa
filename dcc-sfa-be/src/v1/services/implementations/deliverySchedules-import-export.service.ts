import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import * as ExcelJS from 'exceljs';
import prisma from '../../../configs/prisma.client';

export class DeliverySchedulesImportExportService extends ImportExportService<any> {
  protected modelName = 'delivery_schedules' as const;
  protected displayName = 'Delivery Schedules';
  protected uniqueFields = ['order_id', 'customer_id', 'scheduled_date'];
  protected searchFields = [
    'scheduled_time_slot',
    'delivery_instructions',
    'failure_reason',
    'status',
    'priority',
  ];

  protected columns: ColumnDefinition[] = [
    {
      key: 'order_id',
      header: 'Order ID',
      width: 15,
      required: true,
      type: 'number',
      validation: value => {
        if (!value) return 'Order ID is required';
        const num = parseInt(value);
        if (isNaN(num) || num < 1) return 'Order ID must be a positive integer';
        return true;
      },
      transform: value => parseInt(value),
      description: 'ID of the order (required)',
    },
    {
      key: 'customer_id',
      header: 'Customer ID',
      width: 15,
      required: true,
      type: 'number',
      validation: value => {
        if (!value) return 'Customer ID is required';
        const num = parseInt(value);
        if (isNaN(num) || num < 1)
          return 'Customer ID must be a positive integer';
        return true;
      },
      transform: value => parseInt(value),
      description: 'ID of the customer (required)',
    },
    {
      key: 'scheduled_date',
      header: 'Scheduled Date',
      width: 20,
      required: true,
      type: 'date',
      validation: value => {
        if (!value) return 'Scheduled date is required';
        const date = new Date(value);
        if (isNaN(date.getTime())) return 'Invalid date format';
        return true;
      },
      transform: value => new Date(value),
      description: 'Scheduled delivery date (required, YYYY-MM-DD format)',
    },
    {
      key: 'scheduled_time_slot',
      header: 'Time Slot',
      width: 20,
      type: 'string',
      validation: value => {
        if (value && value.length > 50)
          return 'Time slot must be less than 50 characters';
        return true;
      },
      description: 'Scheduled time slot (optional, e.g., 9:00 AM - 11:00 AM)',
    },
    {
      key: 'assigned_vehicle_id',
      header: 'Vehicle ID',
      width: 15,
      type: 'number',
      validation: value => {
        if (value) {
          const num = parseInt(value);
          if (isNaN(num) || num < 1)
            return 'Vehicle ID must be a positive integer';
        }
        return true;
      },
      transform: value => (value ? parseInt(value) : null),
      description: 'ID of assigned vehicle (optional)',
    },
    {
      key: 'assigned_driver_id',
      header: 'Driver ID',
      width: 15,
      type: 'number',
      validation: value => {
        if (value) {
          const num = parseInt(value);
          if (isNaN(num) || num < 1)
            return 'Driver ID must be a positive integer';
        }
        return true;
      },
      transform: value => (value ? parseInt(value) : null),
      description: 'ID of assigned driver (optional)',
    },
    {
      key: 'status',
      header: 'Status',
      width: 15,
      type: 'string',
      defaultValue: 'scheduled',
      validation: value => {
        const validStatuses = [
          'scheduled',
          'in_transit',
          'delivered',
          'failed',
          'cancelled',
          'rescheduled',
          'returned',
          'refunded',
        ];
        return validStatuses.includes(value) || 'Invalid status';
      },
      description:
        'Delivery status (scheduled, in_transit, delivered, failed, cancelled, rescheduled, returned, refunded)',
    },
    {
      key: 'priority',
      header: 'Priority',
      width: 12,
      type: 'string',
      defaultValue: 'medium',
      validation: value => {
        const validPriorities = ['low', 'medium', 'high', 'urgent'];
        return validPriorities.includes(value) || 'Invalid priority';
      },
      description: 'Delivery priority (low, medium, high, urgent)',
    },
    {
      key: 'delivery_instructions',
      header: 'Delivery Instructions',
      width: 40,
      type: 'string',
      validation: value => {
        if (value && value.length > 500)
          return 'Delivery instructions must be less than 500 characters';
        return true;
      },
      description: 'Special delivery instructions (optional, max 500 chars)',
    },
    {
      key: 'actual_delivery_time',
      header: 'Actual Delivery Time',
      width: 25,
      type: 'date',
      validation: value => {
        if (value) {
          const date = new Date(value);
          if (isNaN(date.getTime())) return 'Invalid datetime format';
        }
        return true;
      },
      transform: value => (value ? new Date(value) : null),
      description: 'Actual delivery time (optional, YYYY-MM-DD HH:MM format)',
    },
    {
      key: 'delivery_proof',
      header: 'Delivery Proof',
      width: 30,
      type: 'string',
      validation: value => {
        if (value && value.length > 255)
          return 'Delivery proof must be less than 255 characters';
        return true;
      },
      description: 'Delivery proof reference (optional, max 255 chars)',
    },
    {
      key: 'failure_reason',
      header: 'Failure Reason',
      width: 40,
      type: 'string',
      validation: value => {
        if (value && value.length > 500)
          return 'Failure reason must be less than 500 characters';
        return true;
      },
      description: 'Reason for delivery failure (optional, max 500 chars)',
    },
    {
      key: 'rescheduled_date',
      header: 'Rescheduled Date',
      width: 20,
      type: 'date',
      validation: value => {
        if (value) {
          const date = new Date(value);
          if (isNaN(date.getTime())) return 'Invalid date format';
        }
        return true;
      },
      transform: value => (value ? new Date(value) : null),
      description: 'Rescheduled delivery date (optional, YYYY-MM-DD format)',
    },
    {
      key: 'is_active',
      header: 'Is Active',
      width: 12,
      type: 'string',
      defaultValue: 'Y',
      validation: value => {
        const upperValue = value ? value.toString().toUpperCase() : 'Y';
        return ['Y', 'N'].includes(upperValue) || 'Must be Y or N';
      },
      transform: value => (value ? value.toString().toUpperCase() : 'Y'),
      description: 'Active status - Y for Yes, N for No (defaults to Y)',
    },
  ];

  protected async getSampleData(): Promise<any[]> {
    // Get actual existing data from database for sample
    const orders = await prisma.orders.findMany({
      select: { id: true, order_number: true },
      take: 3,
    });

    const customers = await prisma.customers.findMany({
      select: { id: true, name: true },
      take: 3,
    });

    const vehicles = await prisma.vehicles.findMany({
      select: { id: true, vehicle_number: true },
      take: 2,
    });

    const users = await prisma.users.findMany({
      select: { id: true, name: true },
      take: 2,
    });

    // Use actual IDs from database, fallback to 1 if no data exists
    const order1Id = orders[0]?.id || 1;
    const order2Id = orders[1]?.id || 2;
    const order3Id = orders[2]?.id || 3;
    const customer1Id = customers[0]?.id || 1;
    const customer2Id = customers[1]?.id || 2;
    const customer3Id = customers[2]?.id || 3;
    const vehicle1Id = vehicles[0]?.id || 1;
    const vehicle2Id = vehicles[1]?.id || 2;
    const driver1Id = users[0]?.id || 1;
    const driver2Id = users[1]?.id || 2;

    return [
      {
        order_id: order1Id,
        customer_id: customer1Id,
        scheduled_date: '2024-02-15',
        scheduled_time_slot: '9:00 AM - 11:00 AM',
        assigned_vehicle_id: vehicle1Id,
        assigned_driver_id: driver1Id,
        status: 'scheduled',
        priority: 'high',
        delivery_instructions:
          'Deliver to main entrance, call customer 30 minutes before arrival',
        actual_delivery_time: null,
        delivery_proof: null,
        failure_reason: null,
        rescheduled_date: null,
        is_active: 'Y',
      },
      {
        order_id: order2Id,
        customer_id: customer2Id,
        scheduled_date: '2024-02-16',
        scheduled_time_slot: '2:00 PM - 4:00 PM',
        assigned_vehicle_id: vehicle2Id,
        assigned_driver_id: driver2Id,
        status: 'delivered',
        priority: 'medium',
        delivery_instructions:
          'Leave package at reception if customer not available',
        actual_delivery_time: '2024-02-16T14:30:00',
        delivery_proof: 'PHOTO_20240216_143000.jpg',
        failure_reason: null,
        rescheduled_date: null,
        is_active: 'Y',
      },
      {
        order_id: order3Id,
        customer_id: customer3Id,
        scheduled_date: '2024-02-17',
        scheduled_time_slot: '10:00 AM - 12:00 PM',
        assigned_vehicle_id: null,
        assigned_driver_id: null,
        status: 'failed',
        priority: 'urgent',
        delivery_instructions: 'Fragile items - handle with care',
        actual_delivery_time: null,
        delivery_proof: null,
        failure_reason: 'Customer not available, no one to receive delivery',
        rescheduled_date: '2024-02-18',
        is_active: 'Y',
      },
    ];
  }

  protected getColumnDescription(): string {
    return `
# Delivery Schedules Import Template

## Required Fields:
- **Order ID**: ID of the order (must exist)
- **Customer ID**: ID of the customer (must exist)
- **Scheduled Date**: Scheduled delivery date (YYYY-MM-DD format)

## Optional Fields:
- **Time Slot**: Scheduled time slot (e.g., 9:00 AM - 11:00 AM)
- **Vehicle ID**: ID of assigned vehicle (must exist if provided)
- **Driver ID**: ID of assigned driver (must exist if provided)
- **Status**: Delivery status (scheduled, in_transit, delivered, failed, cancelled, rescheduled, returned, refunded)
- **Priority**: Delivery priority (low, medium, high, urgent)
- **Delivery Instructions**: Special delivery instructions (max 500 chars)
- **Actual Delivery Time**: Actual delivery time (YYYY-MM-DD HH:MM format)
- **Delivery Proof**: Delivery proof reference (max 255 chars)
- **Failure Reason**: Reason for delivery failure (max 500 chars)
- **Rescheduled Date**: Rescheduled delivery date (YYYY-MM-DD format)
- **Is Active**: Whether the schedule is active (Y/N, defaults to Y)

## Notes:
- Order and Customer must exist in the system
- Vehicle and Driver IDs must exist if provided
- Scheduled date cannot be in the past
- Rescheduled date cannot be in the past
- Status and Priority have predefined values
    `;
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(schedule => ({
      order_id: schedule.order_id,
      customer_id: schedule.customer_id,
      scheduled_date:
        schedule.scheduled_date?.toISOString().split('T')[0] || '',
      scheduled_time_slot: schedule.scheduled_time_slot || '',
      assigned_vehicle_id: schedule.assigned_vehicle_id?.toString() || '',
      assigned_driver_id: schedule.assigned_driver_id?.toString() || '',
      status: schedule.status || 'scheduled',
      priority: schedule.priority || 'medium',
      delivery_instructions: schedule.delivery_instructions || '',
      actual_delivery_time: schedule.actual_delivery_time?.toISOString() || '',
      delivery_proof: schedule.delivery_proof || '',
      failure_reason: schedule.failure_reason || '',
      rescheduled_date:
        schedule.rescheduled_date?.toISOString().split('T')[0] || '',
      is_active: schedule.is_active || 'Y',
      createdate: schedule.createdate?.toISOString().split('T')[0] || '',
      createdby: schedule.createdby || '',
      updatedate: schedule.updatedate?.toISOString().split('T')[0] || '',
      updatedby: schedule.updatedby || '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const model = tx ? tx.delivery_schedules : prisma.delivery_schedules;

    const existingSchedule = await model.findFirst({
      where: {
        order_id: data.order_id,
        customer_id: data.customer_id,
        scheduled_date: data.scheduled_date,
      },
    });

    if (existingSchedule) {
      return `Delivery schedule for order ${data.order_id} and customer ${data.customer_id} on ${data.scheduled_date} already exists`;
    }

    return null;
  }

  protected async transformDataForImport(
    data: any,
    userId: number
  ): Promise<any> {
    return {
      order_id: data.order_id,
      customer_id: data.customer_id,
      scheduled_date: data.scheduled_date,
      scheduled_time_slot: data.scheduled_time_slot || null,
      assigned_vehicle_id: data.assigned_vehicle_id || null,
      assigned_driver_id: data.assigned_driver_id || null,
      status: data.status || 'scheduled',
      priority: data.priority || 'medium',
      delivery_instructions: data.delivery_instructions || null,
      actual_delivery_time: data.actual_delivery_time || null,
      delivery_proof: data.delivery_proof || null,
      failure_reason: data.failure_reason || null,
      rescheduled_date: data.rescheduled_date || null,
      is_active: data.is_active || 'Y',
      createdate: new Date(),
      createdby: userId,
      log_inst: 1,
    };
  }

  protected async validateForeignKeys(data: any): Promise<string | null> {
    // Check if order exists
    const order = await prisma.orders.findFirst({
      where: { id: data.order_id },
    });

    if (!order) {
      return `Order with ID ${data.order_id} does not exist`;
    }

    // Check if customer exists
    const customer = await prisma.customers.findFirst({
      where: { id: data.customer_id },
    });

    if (!customer) {
      return `Customer with ID ${data.customer_id} does not exist`;
    }

    // Check if vehicle exists (if provided)
    if (data.assigned_vehicle_id) {
      const vehicle = await prisma.vehicles.findFirst({
        where: { id: data.assigned_vehicle_id },
      });

      if (!vehicle) {
        return `Vehicle with ID ${data.assigned_vehicle_id} does not exist`;
      }
    }

    // Check if driver exists (if provided)
    if (data.assigned_driver_id) {
      const driver = await prisma.users.findFirst({
        where: { id: data.assigned_driver_id },
      });

      if (!driver) {
        return `Driver with ID ${data.assigned_driver_id} does not exist`;
      }
    }

    // Validate scheduled date is not in the past
    const scheduledDate = new Date(data.scheduled_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (scheduledDate < today) {
      return 'Scheduled date cannot be in the past';
    }

    // Validate rescheduled date is not in the past (if provided)
    if (data.rescheduled_date) {
      const rescheduledDate = new Date(data.rescheduled_date);
      if (rescheduledDate < today) {
        return 'Rescheduled date cannot be in the past';
      }
    }

    return null;
  }

  protected async prepareDataForImport(
    data: any,
    userId: number
  ): Promise<any> {
    return this.transformDataForImport(data, userId);
  }

  protected async updateExisting(
    data: any,
    userId: number,
    tx?: any
  ): Promise<any> {
    const model = tx ? tx.delivery_schedules : prisma.delivery_schedules;

    // Find existing record based on unique fields
    const existing = await model.findFirst({
      where: {
        order_id: data.order_id,
        customer_id: data.customer_id,
        scheduled_date: data.scheduled_date,
      },
    });

    if (!existing) return null;

    const updateData = {
      ...data,
      updatedby: userId,
      updatedate: new Date(),
    };

    return await model.update({
      where: { id: existing.id },
      data: updateData,
    });
  }

  async exportToExcel(options: any = {}): Promise<Buffer> {
    const query: any = {
      where: options.filters,
      orderBy: options.orderBy || { id: 'desc' },
      include: {
        delivery_schedules_customers: true,
        delivery_schedules_customers_orders: true,
        delivery_schedules_vehicles: true,
        delivery_schedules_users: true,
      },
    };

    if (options.limit) query.take = options.limit;

    const data = await this.getModel().findMany(query);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(this.displayName);

    const exportColumns = [
      ...this.columns,
      { header: 'Order Number', key: 'order_number', width: 20 },
      { header: 'Customer Name', key: 'customer_name', width: 25 },
      { header: 'Vehicle Number', key: 'vehicle_number', width: 20 },
      { header: 'Driver Name', key: 'driver_name', width: 25 },
      { header: 'Created Date', key: 'createdate', width: 20 },
      { header: 'Created By', key: 'createdby', width: 15 },
      { header: 'Updated Date', key: 'updatedate', width: 20 },
      { header: 'Updated By', key: 'updatedby', width: 15 },
    ];

    worksheet.columns = exportColumns.map(col => ({
      header: col.header,
      key: col.key,
      width: col.width || 20,
    }));

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 25;

    const exportData = await this.transformDataForExport(data);
    exportData.forEach((row: any, index: number) => {
      const excelRow = worksheet.addRow({
        ...row,
        order_number:
          data[index]?.delivery_schedules_customers_orders?.order_number || '',
        customer_name: data[index]?.delivery_schedules_customers?.name || '',
        vehicle_number:
          data[index]?.delivery_schedules_vehicles?.vehicle_number || '',
        driver_name: data[index]?.delivery_schedules_users?.name || '',
      });

      if (index % 2 === 0) {
        excelRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF2F2F2' },
        };
      }

      excelRow.eachCell((cell: any) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    if (data.length > 0) {
      worksheet.autoFilter = {
        from: 'A1',
        to: `${String.fromCharCode(64 + exportColumns.length)}${data.length + 1}`,
      };
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
