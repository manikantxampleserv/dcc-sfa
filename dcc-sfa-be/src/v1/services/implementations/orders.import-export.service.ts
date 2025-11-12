import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import { Prisma } from '@prisma/client';
import prisma from '../../../configs/prisma.client';

export class OrdersImportExportService extends ImportExportService<any> {
  protected modelName = 'orders' as const;
  protected displayName = 'Orders';
  protected uniqueFields = ['order_number'];
  protected searchFields = [
    'order_number',
    'status',
    'order_type',
    'payment_method',
    'approval_status',
  ];

  private async generateOrderNumber(tx?: any): Promise<string> {
    try {
      const client = tx || prisma;
      const today = new Date();
      const year = today.getFullYear();
      const month = (today.getMonth() + 1).toString().padStart(2, '0');
      const day = today.getDate().toString().padStart(2, '0');

      const prefix = `ORD${year}${month}${day}`;

      const lastOrder = await client.orders.findFirst({
        where: {
          order_number: {
            startsWith: prefix,
          },
        },
        orderBy: { id: 'desc' },
        select: { order_number: true },
      });

      let newNumber = 1;
      if (lastOrder && lastOrder.order_number) {
        const match = lastOrder.order_number.match(/(\d+)$/);
        if (match) {
          newNumber = parseInt(match[1], 10) + 1;
        }
      }

      const orderNumber = `${prefix}${newNumber.toString().padStart(4, '0')}`;

      const existingOrder = await client.orders.findFirst({
        where: { order_number: orderNumber },
      });

      if (existingOrder) {
        newNumber++;
        return `${prefix}${newNumber.toString().padStart(4, '0')}`;
      }

      return orderNumber;
    } catch (error) {
      console.error('Error generating order number:', error);
      const timestamp = Date.now().toString();
      return `ORD${timestamp}`;
    }
  }

  protected columns: ColumnDefinition[] = [
    {
      key: 'parent_id',
      header: 'Parent ID',
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
      description: 'ID of the customer placing the order (required)',
    },
    {
      key: 'salesperson_id',
      header: 'Salesperson ID',
      width: 15,
      required: true,
      type: 'number',
      validation: value => {
        if (!value) return 'Salesperson ID is required';
        const id = parseInt(value);
        if (isNaN(id) || id <= 0)
          return 'Salesperson ID must be a positive number';
        return true;
      },
      transform: value => parseInt(value),
      description: 'ID of the salesperson handling the order (required)',
    },
    {
      key: 'order_date',
      header: 'Order Date',
      width: 20,
      type: 'date',
      validation: value => {
        if (!value) return true;
        if (isNaN(Date.parse(value)))
          return 'Invalid date format (use YYYY-MM-DD)';
        return true;
      },
      transform: value => (value ? new Date(value) : new Date()),
      description:
        'Date when order was placed (optional, defaults to current date)',
    },
    {
      key: 'delivery_date',
      header: 'Delivery Date',
      width: 20,
      type: 'date',
      validation: value => {
        if (!value) return true;
        if (isNaN(Date.parse(value)))
          return 'Invalid date format (use YYYY-MM-DD)';
        const deliveryDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (deliveryDate < today) return 'Delivery date cannot be in the past';
        return true;
      },
      transform: value => (value ? new Date(value) : null),
      description:
        'Expected delivery date (optional, YYYY-MM-DD format, cannot be past date)',
    },
    {
      key: 'status',
      header: 'Status',
      width: 15,
      type: 'string',
      defaultValue: 'draft',
      validation: value => {
        if (!value) return true;
        const validStatuses = [
          'draft',
          'pending',
          'confirmed',
          'processing',
          'shipped',
          'delivered',
          'cancelled',
          'returned',
        ];
        return (
          validStatuses.includes(value.toLowerCase()) ||
          `Status must be one of: ${validStatuses.join(', ')}`
        );
      },
      transform: value => (value ? value.toLowerCase() : 'draft'),
      description:
        'Order status: draft, pending, confirmed, processing, shipped, delivered, cancelled, returned (defaults to draft)',
    },
    {
      key: 'priority',
      header: 'Priority',
      width: 12,
      type: 'string',
      defaultValue: 'medium',
      validation: value => {
        if (!value) return true;
        const validPriorities = ['low', 'medium', 'high', 'urgent'];
        return (
          validPriorities.includes(value.toLowerCase()) ||
          `Priority must be one of: ${validPriorities.join(', ')}`
        );
      },
      transform: value => (value ? value.toLowerCase() : 'medium'),
      description:
        'Order priority: low, medium, high, urgent (defaults to medium)',
    },
    {
      key: 'order_type',
      header: 'Order Type',
      width: 15,
      type: 'string',
      defaultValue: 'regular',
      validation: value => {
        if (!value) return true;
        const validTypes = [
          'regular',
          'rush',
          'bulk',
          'sample',
          'return',
          'exchange',
        ];
        return (
          validTypes.includes(value.toLowerCase()) ||
          `Order type must be one of: ${validTypes.join(', ')}`
        );
      },
      transform: value => (value ? value.toLowerCase() : 'regular'),
      description:
        'Type of order: regular, rush, bulk, sample, return, exchange (defaults to regular)',
    },
    {
      key: 'payment_method',
      header: 'Payment Method',
      width: 18,
      type: 'string',
      defaultValue: 'credit',
      validation: value => {
        if (!value) return true;
        const validMethods = [
          'cash',
          'credit',
          'debit',
          'check',
          'bank_transfer',
          'online',
        ];
        return (
          validMethods.includes(value.toLowerCase()) ||
          `Payment method must be one of: ${validMethods.join(', ')}`
        );
      },
      transform: value => (value ? value.toLowerCase() : 'credit'),
      description:
        'Payment method: cash, credit, debit, check, bank_transfer, online (defaults to credit)',
    },
    {
      key: 'payment_terms',
      header: 'Payment Terms',
      width: 20,
      type: 'string',
      defaultValue: 'Net 30',
      validation: value => {
        if (!value) return true;
        if (value.length > 50)
          return 'Payment terms must be less than 50 characters';
        return true;
      },
      description:
        'Payment terms (optional, max 50 chars, defaults to "Net 30")',
    },
    {
      key: 'subtotal',
      header: 'Subtotal',
      width: 15,
      type: 'number',
      defaultValue: 0,
      validation: value => {
        if (!value && value !== 0) return true;
        const amount = parseFloat(value);
        if (isNaN(amount)) return 'Subtotal must be a number';
        if (amount < 0) return 'Subtotal cannot be negative';
        if (amount > 9999999999999999.99)
          return 'Subtotal exceeds maximum allowed value';
        return true;
      },
      transform: value =>
        value !== null && value !== undefined ? parseFloat(value) : 0,
      description: 'Order subtotal amount (optional, defaults to 0)',
    },
    {
      key: 'discount_amount',
      header: 'Discount Amount',
      width: 18,
      type: 'number',
      defaultValue: 0,
      validation: value => {
        if (!value && value !== 0) return true;
        const amount = parseFloat(value);
        if (isNaN(amount)) return 'Discount amount must be a number';
        if (amount < 0) return 'Discount amount cannot be negative';
        if (amount > 9999999999999999.99)
          return 'Discount amount exceeds maximum allowed value';
        return true;
      },
      transform: value =>
        value !== null && value !== undefined ? parseFloat(value) : 0,
      description: 'Discount amount applied (optional, defaults to 0)',
    },
    {
      key: 'tax_amount',
      header: 'Tax Amount',
      width: 15,
      type: 'number',
      defaultValue: 0,
      validation: value => {
        if (!value && value !== 0) return true;
        const amount = parseFloat(value);
        if (isNaN(amount)) return 'Tax amount must be a number';
        if (amount < 0) return 'Tax amount cannot be negative';
        if (amount > 9999999999999999.99)
          return 'Tax amount exceeds maximum allowed value';
        return true;
      },
      transform: value =>
        value !== null && value !== undefined ? parseFloat(value) : 0,
      description: 'Tax amount (optional, defaults to 0)',
    },
    {
      key: 'shipping_amount',
      header: 'Shipping Amount',
      width: 18,
      type: 'number',
      defaultValue: 0,
      validation: value => {
        if (!value && value !== 0) return true;
        const amount = parseFloat(value);
        if (isNaN(amount)) return 'Shipping amount must be a number';
        if (amount < 0) return 'Shipping amount cannot be negative';
        if (amount > 9999999999999999.99)
          return 'Shipping amount exceeds maximum allowed value';
        return true;
      },
      transform: value =>
        value !== null && value !== undefined ? parseFloat(value) : 0,
      description: 'Shipping/delivery charges (optional, defaults to 0)',
    },
    {
      key: 'total_amount',
      header: 'Total Amount',
      width: 15,
      type: 'number',
      defaultValue: 0,
      validation: value => {
        if (!value && value !== 0) return true;
        const amount = parseFloat(value);
        if (isNaN(amount)) return 'Total amount must be a number';
        if (amount < 0) return 'Total amount cannot be negative';
        if (amount > 9999999999999999.99)
          return 'Total amount exceeds maximum allowed value';
        return true;
      },
      transform: value =>
        value !== null && value !== undefined ? parseFloat(value) : 0,
      description: 'Total order amount (optional, defaults to 0)',
    },
    {
      key: 'notes',
      header: 'Notes',
      width: 40,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 1000 ||
        'Notes must be less than 1000 characters',
      description:
        'Order notes or special instructions (optional, max 1000 chars)',
    },
    {
      key: 'shipping_address',
      header: 'Shipping Address',
      width: 40,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 500 ||
        'Shipping address must be less than 500 characters',
      description: 'Delivery address (optional, max 500 chars)',
    },
    {
      key: 'approval_status',
      header: 'Approval Status',
      width: 18,
      type: 'string',
      defaultValue: 'pending',
      validation: value => {
        if (!value) return true;
        const validStatuses = ['pending', 'approved', 'rejected', 'review'];
        return (
          validStatuses.includes(value.toLowerCase()) ||
          `Approval status must be one of: ${validStatuses.join(', ')}`
        );
      },
      transform: value => (value ? value.toLowerCase() : 'pending'),
      description:
        'Approval status: pending, approved, rejected, review (defaults to pending)',
    },
    {
      key: 'approved_by',
      header: 'Approved By ID',
      width: 15,
      type: 'number',
      validation: value => {
        if (!value) return true;
        const id = parseInt(value);
        if (isNaN(id) || id <= 0)
          return 'Approved by ID must be a positive number';
        return true;
      },
      transform: value => (value ? parseInt(value) : null),
      description: 'ID of user who approved the order (optional)',
    },
    {
      key: 'approved_at',
      header: 'Approved At',
      width: 20,
      type: 'date',
      validation: value => {
        if (!value) return true;
        if (isNaN(Date.parse(value)))
          return 'Invalid date format (use YYYY-MM-DD HH:MM:SS)';
        return true;
      },
      transform: value => (value ? new Date(value) : null),
      description: 'Date and time when order was approved (optional)',
    },
    {
      key: 'currency_id',
      header: 'Currency ID',
      width: 15,
      type: 'number',
      validation: value => {
        if (!value) return true;
        const id = parseInt(value);
        if (isNaN(id) || id <= 0)
          return 'Currency ID must be a positive number';
        return true;
      },
      transform: value => (value ? parseInt(value) : null),
      description: 'ID of the currency used (optional)',
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
    return [
      {
        parent_id: 1,
        salesperson_id: 1,
        order_date: '2024-01-15',
        delivery_date: '2024-01-20',
        status: 'confirmed',
        priority: 'high',
        order_type: 'regular',
        payment_method: 'credit',
        payment_terms: 'Net 30',
        subtotal: 1000.0,
        discount_amount: 50.0,
        tax_amount: 95.0,
        shipping_amount: 25.0,
        total_amount: 1070.0,
        notes: 'Urgent delivery required',
        shipping_address: '123 Main St, City, State 12345',
        approval_status: 'approved',
        approved_by: 2,
        approved_at: '2024-01-15 10:30:00',
        currency_id: 1,
        is_active: 'Y',
      },
      {
        parent_id: 2,
        salesperson_id: 3,
        order_date: '2024-01-16',
        delivery_date: '2024-01-25',
        status: 'pending',
        priority: 'medium',
        order_type: 'bulk',
        payment_method: 'bank_transfer',
        payment_terms: 'Net 15',
        subtotal: 2500.0,
        discount_amount: 100.0,
        tax_amount: 240.0,
        shipping_amount: 50.0,
        total_amount: 2690.0,
        notes: 'Bulk order for quarterly stock',
        shipping_address: '456 Business Ave, Corporate City, State 67890',
        approval_status: 'pending',
        currency_id: 1,
        is_active: 'Y',
      },
    ];
  }

  protected getColumnDescription(key: string): string {
    const column = this.columns.find(col => col.key === key);
    return column?.description || '';
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(order => ({
      order_number: order.order_number,
      parent_id: order.parent_id || '',
      customer_name: order.orders_customers?.name || '',
      salesperson_id: order.salesperson_id || '',
      salesperson_name: order.orders_salesperson?.name || '',
      order_date: order.order_date
        ? new Date(order.order_date).toISOString().split('T')[0]
        : '',
      delivery_date: order.delivery_date
        ? new Date(order.delivery_date).toISOString().split('T')[0]
        : '',
      status: order.status || '',
      priority: order.priority || '',
      order_type: order.order_type || '',
      payment_method: order.payment_method || '',
      payment_terms: order.payment_terms || '',
      subtotal: order.subtotal ? order.subtotal.toString() : '0',
      discount_amount: order.discount_amount
        ? order.discount_amount.toString()
        : '0',
      tax_amount: order.tax_amount ? order.tax_amount.toString() : '0',
      shipping_amount: order.shipping_amount
        ? order.shipping_amount.toString()
        : '0',
      total_amount: order.total_amount ? order.total_amount.toString() : '0',
      notes: order.notes || '',
      shipping_address: order.shipping_address || '',
      approval_status: order.approval_status || '',
      approved_by: order.approved_by || '',
      approved_by_name: order.orders_approved_by?.name || '',
      approved_at: order.approved_at
        ? new Date(order.approved_at).toISOString()
        : '',
      currency_id: order.currency_id || '',
      currency_name: order.orders_currencies?.name || '',
      is_active: order.is_active || 'Y',
      created_date: order.createdate
        ? new Date(order.createdate).toISOString().split('T')[0]
        : '',
      created_by: order.createdby || '',
      updated_date: order.updatedate
        ? new Date(order.updatedate).toISOString().split('T')[0]
        : '',
      updated_by: order.updatedby || '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const model = tx ? tx.orders : prisma.orders;

    if (data.order_number) {
      const existingOrder = await model.findFirst({
        where: { order_number: data.order_number },
      });

      if (existingOrder) {
        return `Order with number "${data.order_number}" already exists`;
      }
    }

    return null;
  }

  protected async validateForeignKeys(
    data: any,
    tx?: any
  ): Promise<string | null> {
    const prismaClient = tx || prisma;

    if (data.parent_id) {
      try {
        const customer = await prismaClient.customers.findUnique({
          where: { id: data.parent_id },
        });
        if (!customer) {
          return `Customer with ID ${data.parent_id} does not exist`;
        }
      } catch (error) {
        return `Invalid Customer ID ${data.parent_id}`;
      }
    }

    if (data.salesperson_id) {
      try {
        const salesperson = await prismaClient.users.findUnique({
          where: { id: data.salesperson_id },
        });
        if (!salesperson) {
          return `Salesperson with ID ${data.salesperson_id} does not exist`;
        }
      } catch (error) {
        return `Invalid Salesperson ID ${data.salesperson_id}`;
      }
    }

    if (data.approved_by) {
      try {
        const approver = await prismaClient.users.findUnique({
          where: { id: data.approved_by },
        });
        if (!approver) {
          return `Approver with ID ${data.approved_by} does not exist`;
        }
      } catch (error) {
        return `Invalid Approver ID ${data.approved_by}`;
      }
    }

    if (data.currency_id) {
      try {
        const currency = await prismaClient.currencies.findUnique({
          where: { id: data.currency_id },
        });
        if (!currency) {
          return `Currency with ID ${data.currency_id} does not exist`;
        }
      } catch (error) {
        return `Invalid Currency ID ${data.currency_id}`;
      }
    }

    return null;
  }

  protected async prepareDataForImport(
    data: any,
    userId: number
  ): Promise<any> {
    const preparedData: any = {
      parent_id: data.parent_id,
      salesperson_id: data.salesperson_id,
      order_date: data.order_date || new Date(),
      delivery_date: data.delivery_date || null,
      status: data.status || 'draft',
      priority: data.priority || 'medium',
      order_type: data.order_type || 'regular',
      payment_method: data.payment_method || 'credit',
      payment_terms: data.payment_terms || 'Net 30',
      notes: data.notes || null,
      shipping_address: data.shipping_address || null,
      approval_status: data.approval_status || 'pending',
      approved_by: data.approved_by || null,
      approved_at: data.approved_at || null,
      currency_id: data.currency_id || null,
      is_active: data.is_active || 'Y',
      createdby: userId,
      createdate: new Date(),
      log_inst: 1,
    };

    if (data.subtotal !== null && data.subtotal !== undefined) {
      preparedData.subtotal = new Prisma.Decimal(data.subtotal);
    } else {
      preparedData.subtotal = new Prisma.Decimal(0);
    }

    if (data.discount_amount !== null && data.discount_amount !== undefined) {
      preparedData.discount_amount = new Prisma.Decimal(data.discount_amount);
    } else {
      preparedData.discount_amount = new Prisma.Decimal(0);
    }

    if (data.tax_amount !== null && data.tax_amount !== undefined) {
      preparedData.tax_amount = new Prisma.Decimal(data.tax_amount);
    } else {
      preparedData.tax_amount = new Prisma.Decimal(0);
    }

    if (data.shipping_amount !== null && data.shipping_amount !== undefined) {
      preparedData.shipping_amount = new Prisma.Decimal(data.shipping_amount);
    } else {
      preparedData.shipping_amount = new Prisma.Decimal(0);
    }

    if (data.total_amount !== null && data.total_amount !== undefined) {
      preparedData.total_amount = new Prisma.Decimal(data.total_amount);
    } else {
      preparedData.total_amount = new Prisma.Decimal(0);
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
        const result = await prisma.$transaction(async tx => {
          const duplicateCheck = await this.checkDuplicate(row, tx);

          if (duplicateCheck) {
            if (options.skipDuplicates) {
              throw new Error(`Skipped - ${duplicateCheck}`);
            } else if (options.updateExisting) {
              return await this.updateExisting(row, userId, tx);
            } else {
              throw new Error(duplicateCheck);
            }
          }

          const fkValidation = await this.validateForeignKeys(row, tx);
          if (fkValidation) {
            throw new Error(fkValidation);
          }

          const preparedData = await this.prepareDataForImport(row, userId);

          if (!row.order_number) {
            const generatedOrderNumber = await this.generateOrderNumber(tx);
            preparedData.order_number = generatedOrderNumber;
          } else {
            preparedData.order_number = row.order_number;
          }

          const created = await tx.orders.create({
            data: preparedData,
          });

          return created;
        });

        if (result) {
          importedData.push(result);
          success++;
        }
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
    const model = tx ? tx.orders : prisma.orders;

    const existing = await model.findFirst({
      where: {
        order_number: data.order_number,
      },
    });

    if (!existing) return null;

    const updateData: any = {
      parent_id:
        data.parent_id !== undefined ? data.parent_id : existing.parent_id,
      salesperson_id:
        data.salesperson_id !== undefined
          ? data.salesperson_id
          : existing.salesperson_id,
      order_date:
        data.order_date !== undefined ? data.order_date : existing.order_date,
      delivery_date:
        data.delivery_date !== undefined
          ? data.delivery_date
          : existing.delivery_date,
      status: data.status || existing.status,
      priority: data.priority || existing.priority,
      order_type: data.order_type || existing.order_type,
      payment_method: data.payment_method || existing.payment_method,
      payment_terms: data.payment_terms || existing.payment_terms,
      notes: data.notes !== undefined ? data.notes : existing.notes,
      shipping_address:
        data.shipping_address !== undefined
          ? data.shipping_address
          : existing.shipping_address,
      approval_status: data.approval_status || existing.approval_status,
      approved_by:
        data.approved_by !== undefined
          ? data.approved_by
          : existing.approved_by,
      approved_at:
        data.approved_at !== undefined
          ? data.approved_at
          : existing.approved_at,
      currency_id:
        data.currency_id !== undefined
          ? data.currency_id
          : existing.currency_id,
      is_active: data.is_active || existing.is_active,
      updatedby: userId,
      updatedate: new Date(),
    };

    if (data.subtotal !== null && data.subtotal !== undefined) {
      updateData.subtotal = new Prisma.Decimal(data.subtotal);
    }

    if (data.discount_amount !== null && data.discount_amount !== undefined) {
      updateData.discount_amount = new Prisma.Decimal(data.discount_amount);
    }

    if (data.tax_amount !== null && data.tax_amount !== undefined) {
      updateData.tax_amount = new Prisma.Decimal(data.tax_amount);
    }

    if (data.shipping_amount !== null && data.shipping_amount !== undefined) {
      updateData.shipping_amount = new Prisma.Decimal(data.shipping_amount);
    }

    if (data.total_amount !== null && data.total_amount !== undefined) {
      updateData.total_amount = new Prisma.Decimal(data.total_amount);
    }

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
        orders_customers: {
          select: {
            name: true,
            code: true,
            email: true,
            phone_number: true,
          },
        },
        orders_salesperson: {
          select: {
            name: true,
            email: true,
          },
        },
        orders_approved_by: {
          select: {
            name: true,
            email: true,
          },
        },
        orders_currencies: {
          select: {
            name: true,
            code: true,
            symbol: true,
          },
        },
        _count: {
          select: {
            order_items: true,
            invoices: true,
            credit_notes: true,
            delivery_schedules: true,
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
      { header: 'Order Number', key: 'order_number', width: 20 },
      ...this.columns,
      { header: 'Customer Name', key: 'customer_name', width: 25 },
      { header: 'Customer Code', key: 'customer_code', width: 20 },
      { header: 'Customer Email', key: 'customer_email', width: 30 },
      { header: 'Salesperson Name', key: 'salesperson_name', width: 25 },
      { header: 'Approved By Name', key: 'approved_by_name', width: 25 },
      { header: 'Currency Name', key: 'currency_name', width: 20 },
      { header: 'Currency Symbol', key: 'currency_symbol', width: 15 },
      { header: 'Order Items Count', key: 'order_items_count', width: 18 },
      { header: 'Invoices Count', key: 'invoices_count', width: 15 },
      { header: 'Credit Notes Count', key: 'credit_notes_count', width: 18 },
      {
        header: 'Delivery Schedules',
        key: 'delivery_schedules_count',
        width: 18,
      },
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
    let totalOrders = 0;
    let totalAmount = 0;
    let totalTax = 0;
    let totalShipping = 0;
    const statusCount: any = {};
    const priorityCount: any = {};
    const orderTypeCount: any = {};
    const paymentMethodCount: any = {};

    exportData.forEach((row: any, index: number) => {
      const order = data[index] as any;

      row.customer_name = order.orders_customers?.name || '';
      row.customer_code = order.orders_customers?.code || '';
      row.customer_email = order.orders_customers?.email || '';
      row.salesperson_name = order.orders_salesperson?.name || '';
      row.approved_by_name = order.orders_approved_by?.name || '';
      row.currency_name = order.orders_currencies?.name || '';
      row.currency_symbol = order.orders_currencies?.symbol || '';
      row.order_items_count = order._count?.order_items || 0;
      row.invoices_count = order._count?.invoices || 0;
      row.credit_notes_count = order._count?.credit_notes || 0;
      row.delivery_schedules_count = order._count?.delivery_schedules || 0;

      if (order.total_amount) {
        totalAmount += parseFloat(order.total_amount.toString());
      }
      if (order.tax_amount) {
        totalTax += parseFloat(order.tax_amount.toString());
      }
      if (order.shipping_amount) {
        totalShipping += parseFloat(order.shipping_amount.toString());
      }

      if (order.status) {
        statusCount[order.status] = (statusCount[order.status] || 0) + 1;
      }
      if (order.priority) {
        priorityCount[order.priority] =
          (priorityCount[order.priority] || 0) + 1;
      }
      if (order.order_type) {
        orderTypeCount[order.order_type] =
          (orderTypeCount[order.order_type] || 0) + 1;
      }
      if (order.payment_method) {
        paymentMethodCount[order.payment_method] =
          (paymentMethodCount[order.payment_method] || 0) + 1;
      }

      totalOrders++;

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
      switch (order.status?.toLowerCase()) {
        case 'cancelled':
          statusCell.font = { color: { argb: 'FFFF0000' }, bold: true };
          break;
        case 'delivered':
          statusCell.font = { color: { argb: 'FF008000' }, bold: true };
          break;
        case 'pending':
          statusCell.font = { color: { argb: 'FFFF8C00' }, bold: true };
          break;
        case 'confirmed':
          statusCell.font = { color: { argb: 'FF0000FF' }, bold: true };
          break;
      }

      const priorityCell = excelRow.getCell('priority');
      switch (order.priority?.toLowerCase()) {
        case 'urgent':
          priorityCell.font = { color: { argb: 'FFFF0000' }, bold: true };
          break;
        case 'high':
          priorityCell.font = { color: { argb: 'FFFF8C00' }, bold: true };
          break;
      }

      if (
        order.total_amount &&
        parseFloat(order.total_amount.toString()) > 5000
      ) {
        excelRow.getCell('total_amount').font = {
          color: { argb: 'FF0000FF' },
          bold: true,
        };
      }

      if (
        order.delivery_date &&
        new Date(order.delivery_date) < new Date() &&
        !['delivered', 'cancelled'].includes(order.status?.toLowerCase())
      ) {
        excelRow.getCell('delivery_date').font = {
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
      { header: 'Metric', key: 'metric', width: 30 },
      { header: 'Value', key: 'value', width: 20 },
    ];

    const summaryHeaderRow = summarySheet.getRow(1);
    summaryHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    summaryHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };

    summarySheet.addRow({ metric: 'Total Orders', value: totalOrders });
    summarySheet.addRow({
      metric: 'Total Amount',
      value: totalAmount.toFixed(2),
    });
    summarySheet.addRow({ metric: 'Total Tax', value: totalTax.toFixed(2) });
    summarySheet.addRow({
      metric: 'Total Shipping',
      value: totalShipping.toFixed(2),
    });
    summarySheet.addRow({
      metric: 'Average Order Value',
      value: totalOrders > 0 ? (totalAmount / totalOrders).toFixed(2) : 0,
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

    summarySheet.addRow({ metric: 'Priority Breakdown', value: '' });
    Object.keys(priorityCount).forEach(priority => {
      summarySheet.addRow({
        metric: `  ${priority.charAt(0).toUpperCase() + priority.slice(1)}`,
        value: priorityCount[priority],
      });
    });
    summarySheet.addRow({ metric: '', value: '' });

    summarySheet.addRow({ metric: 'Order Type Breakdown', value: '' });
    Object.keys(orderTypeCount).forEach(type => {
      summarySheet.addRow({
        metric: `  ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        value: orderTypeCount[type],
      });
    });
    summarySheet.addRow({ metric: '', value: '' });

    summarySheet.addRow({ metric: 'Payment Method Breakdown', value: '' });
    Object.keys(paymentMethodCount).forEach(method => {
      summarySheet.addRow({
        metric: `  ${method.charAt(0).toUpperCase() + method.slice(1)}`,
        value: paymentMethodCount[method],
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
