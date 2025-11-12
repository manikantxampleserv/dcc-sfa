import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import prisma from '../../../configs/prisma.client';

export class CreditNotesImportExportService extends ImportExportService<any> {
  protected modelName = 'credit_notes' as const;
  protected displayName = 'Credit Notes';
  protected uniqueFields = ['credit_note_number'];
  protected searchFields = [
    'credit_note_number',
    'status',
    'reason',
    'payment_method',
  ];

  protected columns: ColumnDefinition[] = [
    {
      key: 'credit_note_number',
      header: 'Credit Note Number',
      width: 20,
      required: true,
      type: 'string',
      validation: value => {
        if (!value || value.length < 3)
          return 'Credit note number must be at least 3 characters';
        if (value.length > 50)
          return 'Credit note number must be less than 50 characters';
        return true;
      },
      description: 'Unique credit note number (required, 3-50 characters)',
    },
    {
      key: 'parent_id',
      header: 'Order ID',
      width: 15,
      required: true,
      type: 'number',
      validation: value => {
        const num = parseInt(value);
        if (isNaN(num) || num <= 0) return 'Order ID must be a positive number';
        return true;
      },
      description: 'Related Order ID (required, must be valid order)',
    },
    {
      key: 'customer_id',
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
      key: 'credit_note_date',
      header: 'Credit Note Date',
      width: 15,
      type: 'date',
      validation: value => {
        if (!value) return true; // Optional field
        const date = new Date(value);
        if (isNaN(date.getTime())) return 'Invalid date format';
        return true;
      },
      description: 'Credit note date (optional, YYYY-MM-DD format)',
    },
    {
      key: 'due_date',
      header: 'Due Date',
      width: 15,
      type: 'date',
      validation: value => {
        if (!value) return true; // Optional field
        const date = new Date(value);
        if (isNaN(date.getTime())) return 'Invalid date format';
        return true;
      },
      description: 'Due date (optional, YYYY-MM-DD format)',
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
          'approved',
          'rejected',
          'cancelled',
        ];
        return validStatuses.includes(value) || 'Invalid status';
      },
      description:
        'Credit note status (draft, pending, approved, rejected, cancelled)',
    },
    {
      key: 'reason',
      header: 'Reason',
      width: 30,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 500 ||
        'Reason must be less than 500 characters',
      description: 'Reason for credit note (optional, max 500 chars)',
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
      description: 'Credit note subtotal (defaults to 0)',
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
      key: 'amount_applied',
      header: 'Amount Applied',
      width: 15,
      type: 'number',
      defaultValue: 0,
      validation: value => {
        const num = parseFloat(value);
        if (isNaN(num) || num < 0)
          return 'Amount applied must be a non-negative number';
        return true;
      },
      description: 'Amount applied (defaults to 0)',
    },
    {
      key: 'balance_due',
      header: 'Balance Due',
      width: 15,
      type: 'number',
      defaultValue: 0,
      validation: value => {
        const num = parseFloat(value);
        if (isNaN(num) || num < 0)
          return 'Balance due must be a non-negative number';
        return true;
      },
      description: 'Balance due (defaults to 0)',
    },
    {
      key: 'notes',
      header: 'Notes',
      width: 30,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 1000 ||
        'Notes must be less than 1000 characters',
      description: 'Credit note notes (optional, max 1000 chars)',
    },
    {
      key: 'billing_address',
      header: 'Billing Address',
      width: 40,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 500 ||
        'Billing address must be less than 500 characters',
      description: 'Billing address (optional, max 500 chars)',
    },
    {
      key: 'currency_id',
      header: 'Currency ID',
      width: 15,
      type: 'number',
      defaultValue: 1,
      validation: value => {
        const num = parseInt(value);
        if (isNaN(num) || num <= 0)
          return 'Currency ID must be a positive number';
        return true;
      },
      description: 'Currency ID (check available currencies in the system)',
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
    const customers = await prisma.customers.findMany({
      take: 3,
      select: { id: true, name: true },
      orderBy: { id: 'asc' },
    });
    const orders = await prisma.orders.findMany({
      take: 3,
      select: { id: true, order_number: true },
      orderBy: { id: 'asc' },
    });
    const currencies = await prisma.currencies.findMany({
      take: 1,
      select: { id: true, code: true },
      orderBy: { id: 'asc' },
    });

    const customerIds = customers.map(c => c.id);
    const orderIds = orders.map(o => o.id);
    const currencyIds = currencies.map(c => c.id);

    const customerId1 = customerIds[0] || 999;
    const customerId2 = customerIds[1] || 999;
    const customerId3 = customerIds[2] || 999;
    const orderId1 = orderIds[0] || 999;
    const orderId2 = orderIds[1] || 999;
    const orderId3 = orderIds[2] || 999;
    const currencyId = currencyIds[0] || 1;

    return [
      {
        credit_note_number: 'CN-2024-001',
        parent_id: orderId1,
        customer_id: customerId1,
        credit_note_date: '2024-01-20',
        due_date: '2024-01-25',
        status: 'approved',
        reason: 'Product defect - customer returned damaged goods',
        payment_method: 'credit',
        subtotal: 500.0,
        discount_amount: 0.0,
        tax_amount: 0.0,
        shipping_amount: 0.0,
        total_amount: 500.0,
        amount_applied: 500.0,
        balance_due: 0.0,
        notes: 'Credit note issued for defective product return',
        billing_address: '123 Main Street, New York, NY 10001',
        currency_id: currencyId,
        is_active: 'Y',
      },
      {
        credit_note_number: 'CN-2024-002',
        parent_id: orderId2,
        customer_id: customerId2,
        credit_note_date: '2024-01-21',
        due_date: '2024-01-28',
        status: 'pending',
        reason: 'Overcharge correction - billing error',
        payment_method: 'bank_transfer',
        subtotal: 250.0,
        discount_amount: 0.0,
        tax_amount: 0.0,
        shipping_amount: 0.0,
        total_amount: 250.0,
        amount_applied: 0.0,
        balance_due: 250.0,
        notes: 'Credit note for billing correction',
        billing_address: '456 Business Ave, New York, NY 10002',
        currency_id: currencyId,
        is_active: 'Y',
      },
      {
        credit_note_number: 'CN-2024-003',
        parent_id: orderId3,
        customer_id: customerId3,
        credit_note_date: '2024-01-22',
        due_date: '2024-01-29',
        status: 'draft',
        reason: 'Service cancellation - early termination',
        payment_method: 'cheque',
        subtotal: 1000.0,
        discount_amount: 100.0,
        tax_amount: 0.0,
        shipping_amount: 0.0,
        total_amount: 900.0,
        amount_applied: 0.0,
        balance_due: 900.0,
        notes: 'Credit note for service cancellation',
        billing_address: '789 Industrial Blvd, Los Angeles, CA 90001',
        currency_id: currencyId,
        is_active: 'Y',
      },
    ];
  }

  protected getColumnDescription(key: string): string {
    const column = this.columns.find(col => col.key === key);
    return column?.description || '';
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(creditNote => ({
      credit_note_number: creditNote.credit_note_number,
      parent_id: creditNote.parent_id,
      customer_id: creditNote.customer_id,
      credit_note_date:
        creditNote.credit_note_date?.toISOString().split('T')[0] || '',
      due_date: creditNote.due_date?.toISOString().split('T')[0] || '',
      status: creditNote.status || 'draft',
      reason: creditNote.reason || '',
      payment_method: creditNote.payment_method || 'credit',
      subtotal: creditNote.subtotal ? Number(creditNote.subtotal) : 0,
      discount_amount: creditNote.discount_amount
        ? Number(creditNote.discount_amount)
        : 0,
      tax_amount: creditNote.tax_amount ? Number(creditNote.tax_amount) : 0,
      shipping_amount: creditNote.shipping_amount
        ? Number(creditNote.shipping_amount)
        : 0,
      total_amount: creditNote.total_amount
        ? Number(creditNote.total_amount)
        : 0,
      amount_applied: creditNote.amount_applied
        ? Number(creditNote.amount_applied)
        : 0,
      balance_due: creditNote.balance_due ? Number(creditNote.balance_due) : 0,
      notes: creditNote.notes || '',
      billing_address: creditNote.billing_address || '',
      currency_id: creditNote.currency_id || 8,
      is_active: creditNote.is_active || 'Y',
      created_date: creditNote.createdate?.toISOString().split('T')[0] || '',
      created_by: creditNote.createdby || '',
      updated_date: creditNote.updatedate?.toISOString().split('T')[0] || '',
      updated_by: creditNote.updatedby || '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const model = tx ? tx.credit_notes : prisma.credit_notes;

    const existingCreditNote = await model.findFirst({
      where: { credit_note_number: data.credit_note_number },
    });

    if (existingCreditNote) {
      return `Credit note with number ${data.credit_note_number} already exists`;
    }

    return null;
  }

  protected async validateForeignKeys(
    data: any,
    tx?: any
  ): Promise<string | null> {
    const customerModel = tx ? tx.customers : prisma.customers;
    const customer = await customerModel.findFirst({
      where: { id: data.customer_id },
      select: { id: true, name: true },
    });

    if (!customer) {
      return `Customer with ID ${data.customer_id} does not exist. Please check the customer ID or create the customer first.`;
    }

    const orderModel = tx ? tx.orders : prisma.orders;
    const order = await orderModel.findFirst({
      where: { id: data.parent_id },
      select: { id: true, order_number: true },
    });

    if (!order) {
      return `Order with ID ${data.parent_id} does not exist. Please check the order ID or create the order first.`;
    }

    const currencyModel = tx ? tx.currencies : prisma.currencies;
    const currency = await currencyModel.findFirst({
      where: { id: data.currency_id },
      select: { id: true, code: true },
    });

    if (!currency) {
      return `Currency with ID ${data.currency_id} does not exist. Please check the currency ID or create the currency first.`;
    }

    return null;
  }

  protected async prepareDataForImport(
    data: any,
    userId: number
  ): Promise<any> {
    return {
      ...data,
      credit_note_date: data.credit_note_date
        ? new Date(data.credit_note_date)
        : undefined,
      due_date: data.due_date ? new Date(data.due_date) : undefined,
      subtotal: parseFloat(data.subtotal) || 0,
      discount_amount: parseFloat(data.discount_amount) || 0,
      tax_amount: parseFloat(data.tax_amount) || 0,
      shipping_amount: parseFloat(data.shipping_amount) || 0,
      total_amount: parseFloat(data.total_amount) || 0,
      amount_applied: parseFloat(data.amount_applied) || 0,
      balance_due: parseFloat(data.balance_due) || 0,
      parent_id: parseInt(data.parent_id),
      customer_id: parseInt(data.customer_id),
      currency_id: parseInt(data.currency_id) || 1,
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
    const model = tx ? tx.credit_notes : prisma.credit_notes;

    const existing = await model.findFirst({
      where: { credit_note_number: data.credit_note_number },
    });

    if (!existing) return null;

    return await model.update({
      where: { id: existing.id },
      data: {
        ...data,
        credit_note_date: data.credit_note_date
          ? new Date(data.credit_note_date)
          : undefined,
        due_date: data.due_date ? new Date(data.due_date) : undefined,
        subtotal: parseFloat(data.subtotal) || 0,
        discount_amount: parseFloat(data.discount_amount) || 0,
        tax_amount: parseFloat(data.tax_amount) || 0,
        shipping_amount: parseFloat(data.shipping_amount) || 0,
        total_amount: parseFloat(data.total_amount) || 0,
        amount_applied: parseFloat(data.amount_applied) || 0,
        balance_due: parseFloat(data.balance_due) || 0,
        parent_id: parseInt(data.parent_id),
        customer_id: parseInt(data.customer_id),
        currency_id: parseInt(data.currency_id) || 1,
        updatedby: userId,
        updatedate: new Date(),
      },
    });
  }

  /**
   * Get available IDs for reference during import.
   */
  async getAvailableIds(): Promise<{
    customers: Array<{ id: number; name: string }>;
    orders: Array<{ id: number; order_number: string }>;
    currencies: Array<{ id: number; code: string }>;
  }> {
    const [customers, orders, currencies] = await Promise.all([
      prisma.customers.findMany({
        select: { id: true, name: true },
        orderBy: { id: 'asc' },
        take: 10,
      }),
      prisma.orders.findMany({
        select: { id: true, order_number: true },
        orderBy: { id: 'asc' },
        take: 10,
      }),
      prisma.currencies.findMany({
        select: { id: true, code: true },
        orderBy: { id: 'asc' },
      }),
    ]);

    return { customers, orders, currencies };
  }

  async exportToExcel(options: any = {}): Promise<Buffer> {
    const query: any = {
      where: options.filters,
      orderBy: options.orderBy || { id: 'desc' },
      include: {
        credit_notes_customers: true,
        credit_notes_orders: true,
        credit_note_currencies: true,
        credit_notes_items: true,
      },
    };

    if (options.limit) query.take = options.limit;

    const data = await this.getModel().findMany(query);

    const workbook = new (await import('exceljs')).Workbook();
    const worksheet = workbook.addWorksheet(this.displayName);

    const exportColumns = [
      ...this.columns,
      { header: 'Customer Name', key: 'customer_name', width: 25 },
      { header: 'Order Number', key: 'order_number', width: 20 },
      { header: 'Currency Code', key: 'currency_code', width: 15 },
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
        customer_name: data[index]?.credit_notes_customers?.name || '',
        order_number: data[index]?.credit_notes_orders?.order_number || '',
        currency_code: data[index]?.credit_note_currencies?.code || '',
        item_count: data[index]?.credit_notes_items?.length || 0,
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
    summaryRow.getCell(1).value = `Total Credit Notes: ${data.length}`;
    summaryRow.getCell(1).font = { bold: true };

    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
