import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import prisma from '../../../configs/prisma.client';

export class OrdersImportExportService extends ImportExportService<any> {
  protected modelName = 'orders' as const;
  protected displayName = 'Orders';
  protected uniqueFields = ['order_number'];
  protected searchFields = [
    'order_number',
    'status',
    'priority',
    'order_type',
    'payment_method',
  ];

  protected columns: ColumnDefinition[] = [
    {
      key: 'order_number',
      header: 'Order Number',
      width: 20,
      required: true,
      type: 'string',
      validation: value => {
        if (!value || value.length < 3)
          return 'Order number must be at least 3 characters';
        if (value.length > 50)
          return 'Order number must be less than 50 characters';
        return true;
      },
      description: 'Unique order number (required, 3-50 characters)',
    },
    {
      key: 'parent_id',
      header: 'Customer ID',
      width: 15,
      required: true,
      type: 'number',
      validation: value => {
        const num = parseInt(value);
        if (isNaN(num) || num <= 0)
          return 'Customer ID must be a positive number';
        return true;
      },
      description: 'Customer ID (required, must be valid customer)',
    },
    {
      key: 'salesperson_id',
      header: 'Salesperson ID',
      width: 15,
      required: true,
      type: 'number',
      validation: value => {
        const num = parseInt(value);
        if (isNaN(num) || num <= 0)
          return 'Salesperson ID must be a positive number';
        return true;
      },
      description: 'Salesperson ID (required, must be valid user)',
    },
    {
      key: 'order_date',
      header: 'Order Date',
      width: 15,
      type: 'date',
      validation: value => {
        if (!value) return true; // Optional field
        const date = new Date(value);
        if (isNaN(date.getTime())) return 'Invalid date format';
        return true;
      },
      description: 'Order date (optional, YYYY-MM-DD format)',
    },
    {
      key: 'delivery_date',
      header: 'Delivery Date',
      width: 15,
      type: 'date',
      validation: value => {
        if (!value) return true; // Optional field
        const date = new Date(value);
        if (isNaN(date.getTime())) return 'Invalid date format';
        return true;
      },
      description: 'Delivery date (optional, YYYY-MM-DD format)',
    },
    {
      key: 'status',
      header: 'Status',
      width: 15,
      type: 'string',
      defaultValue: 'draft',
      validation: value => {
        const validStatuses = [
          'draft',
          'pending',
          'confirmed',
          'processing',
          'shipped',
          'delivered',
          'cancelled',
        ];
        return validStatuses.includes(value) || 'Invalid status';
      },
      description:
        'Order status (draft, pending, confirmed, processing, shipped, delivered, cancelled)',
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
      description: 'Order priority (low, medium, high, urgent)',
    },
    {
      key: 'order_type',
      header: 'Order Type',
      width: 15,
      type: 'string',
      defaultValue: 'regular',
      validation: value => {
        const validTypes = ['regular', 'urgent', 'promotional', 'sample'];
        return validTypes.includes(value) || 'Invalid order type';
      },
      description: 'Order type (regular, urgent, promotional, sample)',
    },
    {
      key: 'payment_method',
      header: 'Payment Method',
      width: 15,
      type: 'string',
      defaultValue: 'credit',
      validation: value => {
        const validMethods = ['cash', 'credit', 'cheque', 'bank_transfer'];
        return validMethods.includes(value) || 'Invalid payment method';
      },
      description: 'Payment method (cash, credit, cheque, bank_transfer)',
    },
    {
      key: 'payment_terms',
      header: 'Payment Terms',
      width: 20,
      type: 'string',
      defaultValue: 'Net 30',
      validation: value =>
        !value ||
        value.length <= 50 ||
        'Payment terms must be less than 50 characters',
      description: 'Payment terms (optional, max 50 chars)',
    },
    {
      key: 'subtotal',
      header: 'Subtotal',
      width: 15,
      type: 'number',
      defaultValue: 0,
      validation: value => {
        const num = parseFloat(value);
        if (isNaN(num) || num < 0)
          return 'Subtotal must be a non-negative number';
        return true;
      },
      description: 'Order subtotal (defaults to 0)',
    },
    {
      key: 'discount_amount',
      header: 'Discount Amount',
      width: 15,
      type: 'number',
      defaultValue: 0,
      validation: value => {
        const num = parseFloat(value);
        if (isNaN(num) || num < 0)
          return 'Discount amount must be a non-negative number';
        return true;
      },
      description: 'Discount amount (defaults to 0)',
    },
    {
      key: 'tax_amount',
      header: 'Tax Amount',
      width: 15,
      type: 'number',
      defaultValue: 0,
      validation: value => {
        const num = parseFloat(value);
        if (isNaN(num) || num < 0)
          return 'Tax amount must be a non-negative number';
        return true;
      },
      description: 'Tax amount (defaults to 0)',
    },
    {
      key: 'shipping_amount',
      header: 'Shipping Amount',
      width: 15,
      type: 'number',
      defaultValue: 0,
      validation: value => {
        const num = parseFloat(value);
        if (isNaN(num) || num < 0)
          return 'Shipping amount must be a non-negative number';
        return true;
      },
      description: 'Shipping amount (defaults to 0)',
    },
    {
      key: 'total_amount',
      header: 'Total Amount',
      width: 15,
      type: 'number',
      defaultValue: 0,
      validation: value => {
        const num = parseFloat(value);
        if (isNaN(num) || num < 0)
          return 'Total amount must be a non-negative number';
        return true;
      },
      description: 'Total amount (defaults to 0)',
    },
    {
      key: 'notes',
      header: 'Notes',
      width: 30,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 500 ||
        'Notes must be less than 500 characters',
      description: 'Order notes (optional, max 500 chars)',
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
      description: 'Shipping address (optional, max 500 chars)',
    },
    {
      key: 'approval_status',
      header: 'Approval Status',
      width: 15,
      type: 'string',
      defaultValue: 'pending',
      validation: value => {
        const validStatuses = ['pending', 'approved', 'rejected'];
        return validStatuses.includes(value) || 'Invalid approval status';
      },
      description: 'Approval status (pending, approved, rejected)',
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
        order_number: 'ORD-2024-001',
        parent_id: 1,
        salesperson_id: 201,
        order_date: '2024-01-20',
        delivery_date: '2024-01-25',
        status: 'confirmed',
        priority: 'high',
        order_type: 'regular',
        payment_method: 'credit',
        payment_terms: 'Net 30',
        subtotal: 2500.0,
        discount_amount: 125.0,
        tax_amount: 195.0,
        shipping_amount: 50.0,
        total_amount: 2620.0,
        notes: 'Rush order for new product launch',
        shipping_address: '123 Main Street, New York, NY 10001',
        approval_status: 'approved',
        is_active: 'Y',
      },
      {
        order_number: 'ORD-2024-002',
        parent_id: 2,
        salesperson_id: 202,
        order_date: '2024-01-21',
        delivery_date: '2024-01-28',
        status: 'processing',
        priority: 'medium',
        order_type: 'promotional',
        payment_method: 'bank_transfer',
        payment_terms: 'Net 15',
        subtotal: 5000.0,
        discount_amount: 500.0,
        tax_amount: 360.0,
        shipping_amount: 75.0,
        total_amount: 4935.0,
        notes: 'Promotional campaign order',
        shipping_address: '456 Business Ave, New York, NY 10002',
        approval_status: 'approved',
        is_active: 'Y',
      },
      {
        order_number: 'ORD-2024-003',
        parent_id: 3,
        salesperson_id: 203,
        order_date: '2024-01-22',
        status: 'draft',
        priority: 'low',
        order_type: 'sample',
        payment_method: 'cash',
        payment_terms: 'COD',
        subtotal: 150.0,
        discount_amount: 0.0,
        tax_amount: 12.0,
        shipping_amount: 25.0,
        total_amount: 187.0,
        notes: 'Sample order for evaluation',
        shipping_address: '789 Industrial Blvd, Los Angeles, CA 90001',
        approval_status: 'pending',
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
      parent_id: order.parent_id,
      salesperson_id: order.salesperson_id,
      order_date: order.order_date?.toISOString().split('T')[0] || '',
      delivery_date: order.delivery_date?.toISOString().split('T')[0] || '',
      status: order.status || 'draft',
      priority: order.priority || 'medium',
      order_type: order.order_type || 'regular',
      payment_method: order.payment_method || 'credit',
      payment_terms: order.payment_terms || 'Net 30',
      subtotal: order.subtotal ? Number(order.subtotal) : 0,
      discount_amount: order.discount_amount
        ? Number(order.discount_amount)
        : 0,
      tax_amount: order.tax_amount ? Number(order.tax_amount) : 0,
      shipping_amount: order.shipping_amount
        ? Number(order.shipping_amount)
        : 0,
      total_amount: order.total_amount ? Number(order.total_amount) : 0,
      notes: order.notes || '',
      shipping_address: order.shipping_address || '',
      approval_status: order.approval_status || 'pending',
      is_active: order.is_active || 'Y',
      created_date: order.createdate?.toISOString().split('T')[0] || '',
      created_by: order.createdby || '',
      updated_date: order.updatedate?.toISOString().split('T')[0] || '',
      updated_by: order.updatedby || '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const model = tx ? tx.orders : prisma.orders;

    const existingOrder = await model.findFirst({
      where: { order_number: data.order_number },
    });

    if (existingOrder) {
      return `Order with number ${data.order_number} already exists`;
    }

    return null;
  }

  protected async validateForeignKeys(
    data: any,
    tx?: any
  ): Promise<string | null> {
    // Validate customer exists
    const customerModel = tx ? tx.customers : prisma.customers;
    const customer = await customerModel.findFirst({
      where: { id: data.parent_id },
    });

    if (!customer) {
      return `Customer with ID ${data.parent_id} does not exist`;
    }

    // Validate salesperson exists
    const userModel = tx ? tx.users : prisma.users;
    const salesperson = await userModel.findFirst({
      where: { id: data.salesperson_id },
    });

    if (!salesperson) {
      return `Salesperson with ID ${data.salesperson_id} does not exist`;
    }

    return null;
  }

  protected async prepareDataForImport(
    data: any,
    userId: number
  ): Promise<any> {
    return {
      ...data,
      order_date: data.order_date ? new Date(data.order_date) : undefined,
      delivery_date: data.delivery_date
        ? new Date(data.delivery_date)
        : undefined,
      subtotal: parseFloat(data.subtotal) || 0,
      discount_amount: parseFloat(data.discount_amount) || 0,
      tax_amount: parseFloat(data.tax_amount) || 0,
      shipping_amount: parseFloat(data.shipping_amount) || 0,
      total_amount: parseFloat(data.total_amount) || 0,
      parent_id: parseInt(data.parent_id),
      salesperson_id: parseInt(data.salesperson_id),
      createdby: userId,
      createdate: new Date(),
      log_inst: 1,
    };
  }

  protected async updateExisting(
    data: any,
    userId: number,
    tx?: any
  ): Promise<any> {
    const model = tx ? tx.orders : prisma.orders;

    const existing = await model.findFirst({
      where: { order_number: data.order_number },
    });

    if (!existing) return null;

    return await model.update({
      where: { id: existing.id },
      data: {
        ...data,
        order_date: data.order_date ? new Date(data.order_date) : undefined,
        delivery_date: data.delivery_date
          ? new Date(data.delivery_date)
          : undefined,
        subtotal: parseFloat(data.subtotal) || 0,
        discount_amount: parseFloat(data.discount_amount) || 0,
        tax_amount: parseFloat(data.tax_amount) || 0,
        shipping_amount: parseFloat(data.shipping_amount) || 0,
        total_amount: parseFloat(data.total_amount) || 0,
        parent_id: parseInt(data.parent_id),
        salesperson_id: parseInt(data.salesperson_id),
        updatedby: userId,
        updatedate: new Date(),
      },
    });
  }

  async exportToExcel(options: any = {}): Promise<Buffer> {
    const query: any = {
      where: options.filters,
      orderBy: options.orderBy || { id: 'desc' },
      include: {
        orders_customers: true,
        orders_salesperson_users: true,
        order_items: true,
      },
    };

    if (options.limit) query.take = options.limit;

    const data = await this.getModel().findMany(query);

    const workbook = new (await import('exceljs')).Workbook();
    const worksheet = workbook.addWorksheet(this.displayName);

    const exportColumns = [
      ...this.columns,
      { header: 'Customer Name', key: 'customer_name', width: 25 },
      { header: 'Salesperson Name', key: 'salesperson_name', width: 25 },
      { header: 'Item Count', key: 'item_count', width: 12 },
      { header: 'Created Date', key: 'created_date', width: 15 },
      { header: 'Created By', key: 'created_by', width: 15 },
      { header: 'Updated Date', key: 'updated_date', width: 15 },
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
    exportData.forEach((row: any, index: number) => {
      const excelRow = worksheet.addRow({
        ...row,
        customer_name: data[index]?.orders_customers?.name || '',
        salesperson_name: data[index]?.orders_salesperson_users
          ? `${data[index].orders_salesperson_users.first_name || ''} ${data[index].orders_salesperson_users.last_name || ''}`.trim()
          : '',
        item_count: data[index]?.order_items?.length || 0,
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

    const summaryRow = worksheet.addRow([]);
    summaryRow.getCell(1).value = `Total Orders: ${data.length}`;
    summaryRow.getCell(1).font = { bold: true };

    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
