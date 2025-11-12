import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import { Prisma } from '@prisma/client';
import prisma from '../../../configs/prisma.client';

export class VisitsImportExportService extends ImportExportService<any> {
  protected modelName = 'visits' as const;
  protected displayName = 'Visits';
  protected uniqueFields = ['customer_id', 'sales_person_id', 'visit_date'];
  protected searchFields = [
    'purpose',
    'status',
    'visit_notes',
    'customer_feedback',
  ];

  protected columns: ColumnDefinition[] = [
    {
      key: 'customer_id',
      header: 'Customer ID',
      width: 15,
      required: true,
      type: 'number',
      validation: value => {
        if (!value) return 'Customer ID is required';
        const id = parseInt(value);
        if (isNaN(id) || id <= 0)
          return 'Customer ID must be a positive number';
        return true;
      },
      transform: value => parseInt(value),
      description: 'ID of the customer being visited (required)',
    },
    {
      key: 'sales_person_id',
      header: 'Sales Person ID',
      width: 15,
      required: true,
      type: 'number',
      validation: value => {
        if (!value) return 'Sales Person ID is required';
        const id = parseInt(value);
        if (isNaN(id) || id <= 0)
          return 'Sales Person ID must be a positive number';
        return true;
      },
      transform: value => parseInt(value),
      description: 'ID of the salesperson making the visit (required)',
    },
    {
      key: 'route_id',
      header: 'Route ID',
      width: 15,
      type: 'number',
      validation: value => {
        if (!value) return true;
        const id = parseInt(value);
        if (isNaN(id) || id <= 0) return 'Route ID must be a positive number';
        return true;
      },
      transform: value => (value ? parseInt(value) : null),
      description: 'ID of the route (optional)',
    },
    {
      key: 'zones_id',
      header: 'Zone ID',
      width: 15,
      type: 'number',
      validation: value => {
        if (!value) return true;
        const id = parseInt(value);
        if (isNaN(id) || id <= 0) return 'Zone ID must be a positive number';
        return true;
      },
      transform: value => (value ? parseInt(value) : null),
      description: 'ID of the zone (optional)',
    },
    {
      key: 'visit_date',
      header: 'Visit Date',
      width: 20,
      type: 'date',
      validation: value => {
        if (!value) return true;
        if (isNaN(Date.parse(value)))
          return 'Invalid date format (use YYYY-MM-DD)';
        return true;
      },
      transform: value => (value ? new Date(value) : new Date()),
      description: 'Date of visit (optional, defaults to current date)',
    },
    {
      key: 'visit_time',
      header: 'Visit Time',
      width: 15,
      type: 'string',
      validation: value => {
        if (!value) return true;
        if (value.length > 10)
          return 'Visit time must be less than 10 characters';
        // Validate time format HH:MM
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(value) || 'Invalid time format (use HH:MM)';
      },
      description: 'Time of visit in HH:MM format (optional)',
    },
    {
      key: 'purpose',
      header: 'Purpose',
      width: 20,
      type: 'string',
      defaultValue: 'sales',
      validation: value => {
        if (!value) return true;
        const validPurposes = [
          'sales',
          'collection',
          'delivery',
          'survey',
          'support',
          'followup',
        ];
        return (
          validPurposes.includes(value.toLowerCase()) ||
          `Purpose must be one of: ${validPurposes.join(', ')}`
        );
      },
      transform: value => (value ? value.toLowerCase() : 'sales'),
      description:
        'Visit purpose: sales, collection, delivery, survey, support, followup (defaults to sales)',
    },
    {
      key: 'status',
      header: 'Status',
      width: 15,
      type: 'string',
      defaultValue: 'planned',
      validation: value => {
        if (!value) return true;
        const validStatuses = [
          'planned',
          'in-progress',
          'completed',
          'cancelled',
          'missed',
        ];
        return (
          validStatuses.includes(value.toLowerCase()) ||
          `Status must be one of: ${validStatuses.join(', ')}`
        );
      },
      transform: value => (value ? value.toLowerCase() : 'planned'),
      description:
        'Visit status: planned, in-progress, completed, cancelled, missed (defaults to planned)',
    },
    {
      key: 'start_time',
      header: 'Start Time',
      width: 20,
      type: 'date',
      validation: value => {
        if (!value) return true;
        if (isNaN(Date.parse(value)))
          return 'Invalid date format (use YYYY-MM-DD HH:MM:SS)';
        return true;
      },
      transform: value => (value ? new Date(value) : null),
      description: 'Visit start time (optional)',
    },
    {
      key: 'end_time',
      header: 'End Time',
      width: 20,
      type: 'date',
      validation: value => {
        if (!value) return true;
        if (isNaN(Date.parse(value)))
          return 'Invalid date format (use YYYY-MM-DD HH:MM:SS)';
        return true;
      },
      transform: value => (value ? new Date(value) : null),
      description: 'Visit end time (optional)',
    },
    {
      key: 'duration',
      header: 'Duration (minutes)',
      width: 18,
      type: 'number',
      validation: value => {
        if (!value) return true;
        const duration = parseInt(value);
        if (isNaN(duration) || duration < 0)
          return 'Duration must be a positive number';
        return true;
      },
      transform: value => (value ? parseInt(value) : null),
      description: 'Visit duration in minutes (optional)',
    },
    {
      key: 'start_latitude',
      header: 'Start Latitude',
      width: 18,
      type: 'number',
      validation: value => {
        if (!value) return true;
        const lat = parseFloat(value);
        if (isNaN(lat)) return 'Start latitude must be a number';
        if (lat < -90 || lat > 90)
          return 'Start latitude must be between -90 and 90';
        return true;
      },
      transform: value => (value ? parseFloat(value) : null),
      description: 'Start location latitude (optional, -90 to 90)',
    },
    {
      key: 'start_longitude',
      header: 'Start Longitude',
      width: 18,
      type: 'number',
      validation: value => {
        if (!value) return true;
        const lng = parseFloat(value);
        if (isNaN(lng)) return 'Start longitude must be a number';
        if (lng < -180 || lng > 180)
          return 'Start longitude must be between -180 and 180';
        return true;
      },
      transform: value => (value ? parseFloat(value) : null),
      description: 'Start location longitude (optional, -180 to 180)',
    },
    {
      key: 'end_latitude',
      header: 'End Latitude',
      width: 18,
      type: 'number',
      validation: value => {
        if (!value) return true;
        const lat = parseFloat(value);
        if (isNaN(lat)) return 'End latitude must be a number';
        if (lat < -90 || lat > 90)
          return 'End latitude must be between -90 and 90';
        return true;
      },
      transform: value => (value ? parseFloat(value) : null),
      description: 'End location latitude (optional, -90 to 90)',
    },
    {
      key: 'end_longitude',
      header: 'End Longitude',
      width: 18,
      type: 'number',
      validation: value => {
        if (!value) return true;
        const lng = parseFloat(value);
        if (isNaN(lng)) return 'End longitude must be a number';
        if (lng < -180 || lng > 180)
          return 'End longitude must be between -180 and 180';
        return true;
      },
      transform: value => (value ? parseFloat(value) : null),
      description: 'End location longitude (optional, -180 to 180)',
    },
    {
      key: 'check_in_time',
      header: 'Check-In Time',
      width: 20,
      type: 'date',
      validation: value => {
        if (!value) return true;
        if (isNaN(Date.parse(value)))
          return 'Invalid date format (use YYYY-MM-DD HH:MM:SS)';
        return true;
      },
      transform: value => (value ? new Date(value) : null),
      description: 'Check-in timestamp (optional)',
    },
    {
      key: 'check_out_time',
      header: 'Check-Out Time',
      width: 20,
      type: 'date',
      validation: value => {
        if (!value) return true;
        if (isNaN(Date.parse(value)))
          return 'Invalid date format (use YYYY-MM-DD HH:MM:SS)';
        return true;
      },
      transform: value => (value ? new Date(value) : null),
      description: 'Check-out timestamp (optional)',
    },
    {
      key: 'orders_created',
      header: 'Orders Created',
      width: 18,
      type: 'number',
      defaultValue: 0,
      validation: value => {
        if (!value && value !== 0) return true;
        const count = parseInt(value);
        if (isNaN(count) || count < 0)
          return 'Orders created must be a non-negative number';
        return true;
      },
      transform: value =>
        value !== null && value !== undefined ? parseInt(value) : 0,
      description:
        'Number of orders created during visit (optional, defaults to 0)',
    },
    {
      key: 'amount_collected',
      header: 'Amount Collected',
      width: 18,
      type: 'number',
      defaultValue: 0,
      validation: value => {
        if (!value && value !== 0) return true;
        const amount = parseFloat(value);
        if (isNaN(amount)) return 'Amount collected must be a number';
        if (amount < 0) return 'Amount collected cannot be negative';
        if (amount > 9999999999999999.99)
          return 'Amount collected exceeds maximum allowed value';
        return true;
      },
      transform: value =>
        value !== null && value !== undefined ? parseFloat(value) : 0,
      description: 'Amount collected during visit (optional, defaults to 0)',
    },
    {
      key: 'visit_notes',
      header: 'Visit Notes',
      width: 40,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 1000 ||
        'Visit notes must be less than 1000 characters',
      description: 'Notes about the visit (optional, max 1000 chars)',
    },
    {
      key: 'customer_feedback',
      header: 'Customer Feedback',
      width: 40,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 1000 ||
        'Customer feedback must be less than 1000 characters',
      description: 'Feedback from customer (optional, max 1000 chars)',
    },
    {
      key: 'next_visit_date',
      header: 'Next Visit Date',
      width: 20,
      type: 'date',
      validation: value => {
        if (!value) return true;
        if (isNaN(Date.parse(value)))
          return 'Invalid date format (use YYYY-MM-DD)';
        return true;
      },
      transform: value => (value ? new Date(value) : null),
      description: 'Date for next planned visit (optional)',
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
    // Fetch actual IDs from database to ensure validity
    const customers = await prisma.customers.findMany({
      take: 3,
      select: { id: true, name: true },
      orderBy: { id: 'asc' },
    });
    const users = await prisma.users.findMany({
      take: 2,
      select: { id: true, name: true },
      orderBy: { id: 'asc' },
    });
    const routes = await prisma.routes.findMany({
      take: 2,
      select: { id: true, name: true },
      orderBy: { id: 'asc' },
    });
    const zones = await prisma.zones.findMany({
      take: 2,
      select: { id: true, name: true },
      orderBy: { id: 'asc' },
    });

    const customerIds = customers.map(c => c.id);
    const userIds = users.map(u => u.id);
    const routeIds = routes.map(r => r.id);
    const zoneIds = zones.map(z => z.id);

    const customerId1 = customerIds[0] || 999;
    const customerId2 = customerIds[1] || 999;
    const customerId3 = customerIds[2] || 999;
    const userId1 = userIds[0] || 999;
    const userId2 = userIds[1] || 999;
    const routeId1 = routeIds[0] || null;
    const routeId2 = routeIds[1] || null;
    const zoneId1 = zoneIds[0] || null;
    const zoneId2 = zoneIds[1] || null;

    return [
      {
        customer_id: customerId1,
        sales_person_id: userId1,
        route_id: routeId1,
        zones_id: zoneId1,
        visit_date: '2024-01-15',
        visit_time: '10:00',
        purpose: 'sales',
        status: 'completed',
        start_time: '2024-01-15 10:00:00',
        end_time: '2024-01-15 10:45:00',
        duration: 45,
        start_latitude: 40.7128,
        start_longitude: -74.006,
        end_latitude: 40.7138,
        end_longitude: -74.007,
        check_in_time: '2024-01-15 10:00:00',
        check_out_time: '2024-01-15 10:45:00',
        orders_created: 2,
        amount_collected: 500.0,
        visit_notes: 'Productive visit, customer placed new orders',
        customer_feedback: 'Very satisfied with service',
        next_visit_date: '2024-01-22',
        is_active: 'Y',
      },
      {
        customer_id: customerId2,
        sales_person_id: userId1,
        route_id: routeId1,
        zones_id: zoneId1,
        visit_date: '2024-01-16',
        visit_time: '14:00',
        purpose: 'collection',
        status: 'completed',
        start_time: '2024-01-16 14:00:00',
        end_time: '2024-01-16 14:30:00',
        duration: 30,
        start_latitude: 40.758,
        start_longitude: -73.9855,
        end_latitude: 40.7585,
        end_longitude: -73.986,
        check_in_time: '2024-01-16 14:00:00',
        check_out_time: '2024-01-16 14:30:00',
        orders_created: 0,
        amount_collected: 1200.0,
        visit_notes: 'Collected outstanding payment',
        customer_feedback: 'Payment received, thank you',
        next_visit_date: '2024-01-30',
        is_active: 'Y',
      },
      {
        customer_id: customerId3,
        sales_person_id: userId2,
        route_id: routeId2,
        zones_id: zoneId2,
        visit_date: '2024-01-17',
        visit_time: '09:30',
        purpose: 'survey',
        status: 'planned',
        orders_created: 0,
        amount_collected: 0.0,
        visit_notes: 'Customer survey scheduled',
        next_visit_date: '2024-01-24',
        is_active: 'Y',
      },
    ];
  }

  protected getColumnDescription(key: string): string {
    const column = this.columns.find(col => col.key === key);
    return column?.description || '';
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(visit => ({
      customer_id: visit.customer_id || '',
      customer_name: visit.visit_customers?.name || '',
      customer_code: visit.visit_customers?.code || '',
      sales_person_id: visit.sales_person_id || '',
      salesperson_name: visit.visits_salesperson?.name || '',
      route_id: visit.route_id || '',
      route_name: visit.visit_routes?.name || '',
      zones_id: visit.zones_id || '',
      zone_name: visit.visit_zones?.name || '',
      visit_date: visit.visit_date
        ? new Date(visit.visit_date).toISOString().split('T')[0]
        : '',
      visit_time: visit.visit_time || '',
      purpose: visit.purpose || '',
      status: visit.status || '',
      start_time: visit.start_time
        ? new Date(visit.start_time).toISOString()
        : '',
      end_time: visit.end_time ? new Date(visit.end_time).toISOString() : '',
      duration: visit.duration || '',
      start_latitude: visit.start_latitude
        ? visit.start_latitude.toString()
        : '',
      start_longitude: visit.start_longitude
        ? visit.start_longitude.toString()
        : '',
      end_latitude: visit.end_latitude ? visit.end_latitude.toString() : '',
      end_longitude: visit.end_longitude ? visit.end_longitude.toString() : '',
      check_in_time: visit.check_in_time
        ? new Date(visit.check_in_time).toISOString()
        : '',
      check_out_time: visit.check_out_time
        ? new Date(visit.check_out_time).toISOString()
        : '',
      orders_created: visit.orders_created || 0,
      amount_collected: visit.amount_collected
        ? visit.amount_collected.toString()
        : '0',
      visit_notes: visit.visit_notes || '',
      customer_feedback: visit.customer_feedback || '',
      next_visit_date: visit.next_visit_date
        ? new Date(visit.next_visit_date).toISOString().split('T')[0]
        : '',
      is_active: visit.is_active || 'Y',
      created_date: visit.createdate
        ? new Date(visit.createdate).toISOString().split('T')[0]
        : '',
      created_by: visit.createdby || '',
      updated_date: visit.updatedate
        ? new Date(visit.updatedate).toISOString().split('T')[0]
        : '',
      updated_by: visit.updatedby || '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const model = tx ? tx.visits : prisma.visits;

    // Check for duplicate visit (same customer, salesperson, and date)
    if (data.customer_id && data.sales_person_id && data.visit_date) {
      const visitDate = new Date(data.visit_date);
      const startOfDay = new Date(visitDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(visitDate.setHours(23, 59, 59, 999));

      const existingVisit = await model.findFirst({
        where: {
          customer_id: data.customer_id,
          sales_person_id: data.sales_person_id,
          visit_date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      if (existingVisit) {
        return `Visit already exists for Customer ID ${data.customer_id} by Salesperson ID ${data.sales_person_id} on ${data.visit_date}`;
      }
    }

    return null;
  }

  protected async validateForeignKeys(
    data: any,
    tx?: any
  ): Promise<string | null> {
    const prismaClient = tx || prisma;

    // Validate customer exists
    if (data.customer_id) {
      try {
        const customer = await prismaClient.customers.findUnique({
          where: { id: data.customer_id },
        });
        if (!customer) {
          return `Customer with ID ${data.customer_id} does not exist`;
        }
      } catch (error) {
        return `Invalid Customer ID ${data.customer_id}`;
      }
    }

    // Validate salesperson exists
    if (data.sales_person_id) {
      try {
        const salesperson = await prismaClient.users.findUnique({
          where: { id: data.sales_person_id },
        });
        if (!salesperson) {
          return `Salesperson with ID ${data.sales_person_id} does not exist`;
        }
      } catch (error) {
        return `Invalid Salesperson ID ${data.sales_person_id}`;
      }
    }

    // Validate route exists
    if (data.route_id) {
      try {
        const route = await prismaClient.routes.findUnique({
          where: { id: data.route_id },
        });
        if (!route) {
          return `Route with ID ${data.route_id} does not exist`;
        }
      } catch (error) {
        return `Invalid Route ID ${data.route_id}`;
      }
    }

    // Validate zone exists
    if (data.zones_id) {
      try {
        const zone = await prismaClient.zones.findUnique({
          where: { id: data.zones_id },
        });
        if (!zone) {
          return `Zone with ID ${data.zones_id} does not exist`;
        }
      } catch (error) {
        return `Invalid Zone ID ${data.zones_id}`;
      }
    }

    return null;
  }

  protected async prepareDataForImport(
    data: any,
    userId: number
  ): Promise<any> {
    const preparedData: any = {
      customer_id: data.customer_id,
      sales_person_id: data.sales_person_id,
      route_id: data.route_id || null,
      zones_id: data.zones_id || null,
      visit_date: data.visit_date || new Date(),
      visit_time: data.visit_time || null,
      purpose: data.purpose || 'sales',
      status: data.status || 'planned',
      start_time: data.start_time || null,
      end_time: data.end_time || null,
      duration: data.duration || null,
      check_in_time: data.check_in_time || null,
      check_out_time: data.check_out_time || null,
      orders_created:
        data.orders_created !== undefined ? data.orders_created : 0,
      visit_notes: data.visit_notes || null,
      customer_feedback: data.customer_feedback || null,
      next_visit_date: data.next_visit_date || null,
      is_active: data.is_active || 'Y',
      createdby: userId,
      createdate: new Date(),
      log_inst: 1,
    };

    // Handle decimal fields
    if (data.start_latitude !== null && data.start_latitude !== undefined) {
      preparedData.start_latitude = new Prisma.Decimal(data.start_latitude);
    }

    if (data.start_longitude !== null && data.start_longitude !== undefined) {
      preparedData.start_longitude = new Prisma.Decimal(data.start_longitude);
    }

    if (data.end_latitude !== null && data.end_latitude !== undefined) {
      preparedData.end_latitude = new Prisma.Decimal(data.end_latitude);
    }

    if (data.end_longitude !== null && data.end_longitude !== undefined) {
      preparedData.end_longitude = new Prisma.Decimal(data.end_longitude);
    }

    if (data.amount_collected !== null && data.amount_collected !== undefined) {
      preparedData.amount_collected = new Prisma.Decimal(data.amount_collected);
    } else {
      preparedData.amount_collected = new Prisma.Decimal(0);
    }

    return preparedData;
  }

  async importData(
    data: any[],
    userId: number,
    options: any = {}
  ): Promise<any> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];
    const importedData: any[] = [];
    const detailedErrors: any[] = [];

    for (const [index, row] of data.entries()) {
      const rowNum = index + 2;

      try {
        // Validate outside transaction
        const duplicateCheck = await this.checkDuplicate(row);

        if (duplicateCheck) {
          if (options.skipDuplicates) {
            failed++;
            errors.push(`Row ${rowNum}: Skipped - ${duplicateCheck}`);
            continue;
          } else if (options.updateExisting) {
            const updated = await this.updateExisting(row, userId); // ✅ CHANGED from updateExistingDirect
            if (updated) {
              importedData.push(updated);
              success++;
            }
            continue;
          } else {
            throw new Error(duplicateCheck);
          }
        }

        const fkValidation = await this.validateForeignKeys(row);
        if (fkValidation) {
          throw new Error(fkValidation);
        }

        // Create visit
        const preparedData = await this.prepareDataForImport(row, userId);

        const created = await prisma.visits.create({
          data: preparedData,
        });

        importedData.push(created);
        success++;
      } catch (error: any) {
        failed++;
        const errorMessage = error.message || 'Unknown error';
        errors.push(`Row ${rowNum}: ${errorMessage}`);
        detailedErrors.push({
          row: rowNum,
          errors: [
            {
              type: errorMessage.includes('does not exist')
                ? 'foreign_key'
                : errorMessage.includes('already exists')
                  ? 'duplicate'
                  : 'validation',
              message: errorMessage,
              action: 'rejected',
            },
          ],
        });
      }
    }

    return {
      success,
      failed,
      errors,
      data: importedData,
      detailedErrors: detailedErrors.length > 0 ? detailedErrors : undefined,
    };
  }

  protected async updateExisting(
    data: any,
    userId: number,
    tx?: any
  ): Promise<any> {
    const model = tx ? tx.visits : prisma.visits;

    const visitDate = new Date(data.visit_date);
    const startOfDay = new Date(visitDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(visitDate.setHours(23, 59, 59, 999));

    const existing = await model.findFirst({
      where: {
        customer_id: data.customer_id,
        sales_person_id: data.sales_person_id,
        visit_date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (!existing) return null;

    const updateData: any = {
      customer_id: data.customer_id,
      sales_person_id: data.sales_person_id,
      route_id: data.route_id !== undefined ? data.route_id : existing.route_id,
      zones_id: data.zones_id !== undefined ? data.zones_id : existing.zones_id,
      visit_date: data.visit_date || existing.visit_date,
      visit_time:
        data.visit_time !== undefined ? data.visit_time : existing.visit_time,
      purpose: data.purpose || existing.purpose,
      status: data.status || existing.status,
      start_time:
        data.start_time !== undefined ? data.start_time : existing.start_time,
      end_time: data.end_time !== undefined ? data.end_time : existing.end_time,
      duration: data.duration !== undefined ? data.duration : existing.duration,
      check_in_time:
        data.check_in_time !== undefined
          ? data.check_in_time
          : existing.check_in_time,
      check_out_time:
        data.check_out_time !== undefined
          ? data.check_out_time
          : existing.check_out_time,
      orders_created:
        data.orders_created !== undefined
          ? data.orders_created
          : existing.orders_created,
      visit_notes:
        data.visit_notes !== undefined
          ? data.visit_notes
          : existing.visit_notes,
      customer_feedback:
        data.customer_feedback !== undefined
          ? data.customer_feedback
          : existing.customer_feedback,
      next_visit_date:
        data.next_visit_date !== undefined
          ? data.next_visit_date
          : existing.next_visit_date,
      is_active: data.is_active || existing.is_active,
      updatedby: userId,
      updatedate: new Date(),
    };

    // Handle decimal updates
    if (data.start_latitude !== null && data.start_latitude !== undefined) {
      updateData.start_latitude = new Prisma.Decimal(data.start_latitude);
    }

    if (data.start_longitude !== null && data.start_longitude !== undefined) {
      updateData.start_longitude = new Prisma.Decimal(data.start_longitude);
    }

    if (data.end_latitude !== null && data.end_latitude !== undefined) {
      updateData.end_latitude = new Prisma.Decimal(data.end_latitude);
    }

    if (data.end_longitude !== null && data.end_longitude !== undefined) {
      updateData.end_longitude = new Prisma.Decimal(data.end_longitude);
    }

    if (data.amount_collected !== null && data.amount_collected !== undefined) {
      updateData.amount_collected = new Prisma.Decimal(data.amount_collected);
    }

    return await model.update({
      where: { id: existing.id },
      data: updateData,
    });
  }

  protected async updateExistingDirect(
    data: any,
    userId: number
  ): Promise<any> {
    const visitDate = new Date(data.visit_date);
    const startOfDay = new Date(visitDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(visitDate.setHours(23, 59, 59, 999));

    const existing = await prisma.visits.findFirst({
      where: {
        customer_id: data.customer_id,
        sales_person_id: data.sales_person_id,
        visit_date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (!existing) return null;

    const updateData: any = {
      customer_id: data.customer_id,
      sales_person_id: data.sales_person_id,
      route_id: data.route_id !== undefined ? data.route_id : existing.route_id,
      zones_id: data.zones_id !== undefined ? data.zones_id : existing.zones_id,
      visit_date: data.visit_date || existing.visit_date,
      visit_time:
        data.visit_time !== undefined ? data.visit_time : existing.visit_time,
      purpose: data.purpose || existing.purpose,
      status: data.status || existing.status,
      start_time:
        data.start_time !== undefined ? data.start_time : existing.start_time,
      end_time: data.end_time !== undefined ? data.end_time : existing.end_time,
      duration: data.duration !== undefined ? data.duration : existing.duration,
      check_in_time:
        data.check_in_time !== undefined
          ? data.check_in_time
          : existing.check_in_time,
      check_out_time:
        data.check_out_time !== undefined
          ? data.check_out_time
          : existing.check_out_time,
      orders_created:
        data.orders_created !== undefined
          ? data.orders_created
          : existing.orders_created,
      visit_notes:
        data.visit_notes !== undefined
          ? data.visit_notes
          : existing.visit_notes,
      customer_feedback:
        data.customer_feedback !== undefined
          ? data.customer_feedback
          : existing.customer_feedback,
      next_visit_date:
        data.next_visit_date !== undefined
          ? data.next_visit_date
          : existing.next_visit_date,
      is_active: data.is_active || existing.is_active,
      updatedby: userId,
      updatedate: new Date(),
    };

    // Handle decimal updates
    if (data.start_latitude !== null && data.start_latitude !== undefined) {
      updateData.start_latitude = new Prisma.Decimal(data.start_latitude);
    }

    if (data.start_longitude !== null && data.start_longitude !== undefined) {
      updateData.start_longitude = new Prisma.Decimal(data.start_longitude);
    }

    if (data.end_latitude !== null && data.end_latitude !== undefined) {
      updateData.end_latitude = new Prisma.Decimal(data.end_latitude);
    }

    if (data.end_longitude !== null && data.end_longitude !== undefined) {
      updateData.end_longitude = new Prisma.Decimal(data.end_longitude);
    }

    if (data.amount_collected !== null && data.amount_collected !== undefined) {
      updateData.amount_collected = new Prisma.Decimal(data.amount_collected);
    }

    return await prisma.visits.update({
      where: { id: existing.id },
      data: updateData,
    });
  }

  async exportToExcel(options: any = {}): Promise<Buffer> {
    const query: any = {
      where: options.filters,
      orderBy: options.orderBy || { visit_date: 'desc' },
      include: {
        visit_customers: {
          select: {
            name: true,
            code: true,
            phone_number: true,
            city: true,
          },
        },
        visits_salesperson: {
          select: {
            name: true,
            email: true,
          },
        },
        visit_routes: {
          select: {
            name: true,
            code: true,
          },
        },
        visit_zones: {
          select: {
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            competitor_activity: true,
            cooler_inspections: true,
            product_facing: true,
            visit_attachments: true,
            visit_tasks: true,
          },
        },
      },
    };

    if (options.limit) query.take = options.limit;

    const data = await this.getModel().findMany(query);

    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet(this.displayName);

    const exportColumns = [
      { header: 'Visit ID', key: 'id', width: 12 },
      ...this.columns,
      { header: 'Customer Name', key: 'customer_name', width: 25 },
      { header: 'Customer Code', key: 'customer_code', width: 20 },
      { header: 'Customer City', key: 'customer_city', width: 20 },
      { header: 'Salesperson Name', key: 'salesperson_name', width: 25 },
      { header: 'Salesperson Email', key: 'salesperson_email', width: 30 },
      { header: 'Route Name', key: 'route_name', width: 25 },
      { header: 'Zone Name', key: 'zone_name', width: 25 },
      { header: 'Competitor Activities', key: 'competitor_count', width: 20 },
      { header: 'Cooler Inspections', key: 'cooler_count', width: 18 },
      { header: 'Product Facings', key: 'facing_count', width: 18 },
      { header: 'Attachments', key: 'attachment_count', width: 15 },
      { header: 'Tasks', key: 'task_count', width: 15 },
      { header: 'Created Date', key: 'created_date', width: 20 },
      { header: 'Created By', key: 'created_by', width: 15 },
      { header: 'Updated Date', key: 'updated_date', width: 20 },
      { header: 'Updated By', key: 'updated_by', width: 15 },
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
    let totalVisits = 0;
    let completedVisits = 0;
    let plannedVisits = 0;
    let cancelledVisits = 0;
    let totalAmountCollected = 0;
    let totalOrdersCreated = 0;
    const purposeCount: any = {};
    const statusCount: any = {};
    const salespersonVisits: any = {};

    exportData.forEach((row: any, index: number) => {
      const visit = data[index] as any;

      row.id = visit.id;
      row.customer_name = visit.visit_customers?.name || '';
      row.customer_code = visit.visit_customers?.code || '';
      row.customer_city = visit.visit_customers?.city || '';
      row.salesperson_name = visit.visits_salesperson?.name || '';
      row.salesperson_email = visit.visits_salesperson?.email || '';
      row.route_name = visit.visit_routes?.name || '';
      row.zone_name = visit.visit_zones?.name || '';
      row.competitor_count = visit._count?.competitor_activity || 0;
      row.cooler_count = visit._count?.cooler_inspections || 0;
      row.facing_count = visit._count?.product_facing || 0;
      row.attachment_count = visit._count?.visit_attachments || 0;
      row.task_count = visit._count?.visit_tasks || 0;

      totalVisits++;
      if (visit.status === 'completed') completedVisits++;
      if (visit.status === 'planned') plannedVisits++;
      if (visit.status === 'cancelled') cancelledVisits++;

      if (visit.amount_collected) {
        totalAmountCollected += parseFloat(visit.amount_collected.toString());
      }

      totalOrdersCreated += visit.orders_created || 0;

      if (visit.purpose) {
        purposeCount[visit.purpose] = (purposeCount[visit.purpose] || 0) + 1;
      }

      if (visit.status) {
        statusCount[visit.status] = (statusCount[visit.status] || 0) + 1;
      }

      const salesperson = visit.visits_salesperson?.name || 'Unknown';
      salespersonVisits[salesperson] =
        (salespersonVisits[salesperson] || 0) + 1;

      const excelRow = worksheet.addRow(row);

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

      const statusCell = excelRow.getCell('status');
      switch (visit.status?.toLowerCase()) {
        case 'completed':
          statusCell.font = { color: { argb: 'FF008000' }, bold: true };
          break;
        case 'cancelled':
          statusCell.font = { color: { argb: 'FFFF0000' }, bold: true };
          break;
        case 'planned':
          statusCell.font = { color: { argb: 'FF0000FF' }, bold: true };
          break;
        case 'in-progress':
          statusCell.font = { color: { argb: 'FFFF8C00' }, bold: true };
          break;
        case 'missed':
          statusCell.font = { color: { argb: 'FFFF0000' }, bold: true };
          break;
      }

      if (
        visit.amount_collected &&
        parseFloat(visit.amount_collected.toString()) > 1000
      ) {
        excelRow.getCell('amount_collected').font = {
          color: { argb: 'FF008000' },
          bold: true,
        };
      }

      if (visit.orders_created && visit.orders_created > 0) {
        excelRow.getCell('orders_created').font = {
          color: { argb: 'FF0000FF' },
          bold: true,
        };
      }

      if (
        visit.visit_date &&
        new Date(visit.visit_date) < new Date() &&
        visit.status === 'planned'
      ) {
        excelRow.getCell('visit_date').font = {
          color: { argb: 'FFFF0000' },
          bold: true,
        };
      }
    });

    if (data.length > 0) {
      worksheet.autoFilter = {
        from: 'A1',
        to: `${String.fromCharCode(64 + exportColumns.length)}${data.length + 1}`,
      };
    }

    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 35 },
      { header: 'Value', key: 'value', width: 20 },
    ];

    const summaryHeaderRow = summarySheet.getRow(1);
    summaryHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    summaryHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };

    summarySheet.addRow({ metric: 'Total Visits', value: totalVisits });
    summarySheet.addRow({ metric: 'Completed Visits', value: completedVisits });
    summarySheet.addRow({ metric: 'Planned Visits', value: plannedVisits });
    summarySheet.addRow({ metric: 'Cancelled Visits', value: cancelledVisits });
    summarySheet.addRow({
      metric: 'Completion Rate',
      value:
        totalVisits > 0
          ? `${((completedVisits / totalVisits) * 100).toFixed(2)}%`
          : '0%',
    });
    summarySheet.addRow({ metric: '', value: '' });

    summarySheet.addRow({
      metric: 'Total Amount Collected',
      value: totalAmountCollected.toFixed(2),
    });
    summarySheet.addRow({
      metric: 'Total Orders Created',
      value: totalOrdersCreated,
    });
    summarySheet.addRow({
      metric: 'Average Orders Per Visit',
      value:
        totalVisits > 0 ? (totalOrdersCreated / totalVisits).toFixed(2) : '0',
    });
    summarySheet.addRow({
      metric: 'Average Collection Per Visit',
      value:
        totalVisits > 0 ? (totalAmountCollected / totalVisits).toFixed(2) : '0',
    });
    summarySheet.addRow({ metric: '', value: '' });

    summarySheet.addRow({ metric: 'Status Breakdown', value: '' });
    Object.keys(statusCount).forEach(status => {
      summarySheet.addRow({
        metric: `  ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        value: statusCount[status],
      });
    });
    summarySheet.addRow({ metric: '', value: '' });

    summarySheet.addRow({ metric: 'Purpose Breakdown', value: '' });
    Object.keys(purposeCount).forEach(purpose => {
      summarySheet.addRow({
        metric: `  ${purpose.charAt(0).toUpperCase() + purpose.slice(1)}`,
        value: purposeCount[purpose],
      });
    });
    summarySheet.addRow({ metric: '', value: '' });

    summarySheet.addRow({ metric: 'Visits by Salesperson', value: '' });
    Object.keys(salespersonVisits)
      .sort((a, b) => salespersonVisits[b] - salespersonVisits[a])
      .forEach(salesperson => {
        summarySheet.addRow({
          metric: `  ${salesperson}`,
          value: salespersonVisits[salesperson],
        });
      });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
