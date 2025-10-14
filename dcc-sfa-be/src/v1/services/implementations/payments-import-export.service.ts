import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PaymentsImportExportService extends ImportExportService<any> {
  protected modelName = 'payments' as const;
  protected displayName = 'Payments';
  protected uniqueFields = ['payment_number'];
  protected searchFields = ['payment_number', 'reference_number', 'notes'];

  protected columns: ColumnDefinition[] = [
    {
      key: 'customer_id',
      header: 'Customer ID',
      width: 15,
      required: true,
      type: 'number',
      validation: value => {
        const num = Number(value);
        return (
          (!isNaN(num) && num > 0) ||
          'Customer ID must be a valid positive number'
        );
      },
      description: 'ID of the customer making the payment',
    },
    {
      key: 'payment_date',
      header: 'Payment Date',
      width: 20,
      required: true,
      type: 'date',
      validation: value => {
        const date = new Date(value);
        return !isNaN(date.getTime()) || 'Payment date must be a valid date';
      },
      description: 'Date when the payment was made',
    },
    {
      key: 'collected_by',
      header: 'Collected By (User ID)',
      width: 20,
      required: true,
      type: 'number',
      validation: value => {
        const num = Number(value);
        return (
          (!isNaN(num) && num > 0) ||
          'Collected by must be a valid positive number'
        );
      },
      description: 'ID of the user who collected the payment',
    },
    {
      key: 'method',
      header: 'Payment Method',
      width: 20,
      required: true,
      type: 'string',
      validation: value => {
        const validMethods = [
          'cash',
          'credit',
          'debit',
          'check',
          'bank_transfer',
          'online',
        ];
        return (
          validMethods.includes(value) ||
          `Payment method must be one of: ${validMethods.join(', ')}`
        );
      },
      description:
        'Method of payment (cash, credit, debit, check, bank_transfer, online)',
    },
    {
      key: 'reference_number',
      header: 'Reference Number',
      width: 25,
      required: false,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 100 ||
        'Reference number must not exceed 100 characters',
      description: 'Reference number for the payment (optional)',
    },
    {
      key: 'total_amount',
      header: 'Total Amount',
      width: 15,
      required: true,
      type: 'number',
      validation: value => {
        const num = Number(value);
        return (
          (!isNaN(num) && num > 0) ||
          'Total amount must be a valid positive number'
        );
      },
      description: 'Total amount of the payment',
    },
    {
      key: 'notes',
      header: 'Notes',
      width: 30,
      required: false,
      type: 'string',
      validation: value =>
        !value || value.length <= 500 || 'Notes must not exceed 500 characters',
      description: 'Additional notes about the payment (optional)',
    },
    {
      key: 'currency_id',
      header: 'Currency ID',
      width: 15,
      required: false,
      type: 'number',
      validation: value => {
        if (!value) return true; // Optional field
        const num = Number(value);
        return (
          (!isNaN(num) && num > 0) ||
          'Currency ID must be a valid positive number'
        );
      },
      description: 'ID of the currency used for the payment (optional)',
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
    try {
      // Get actual IDs from database
      const [customer, user, currency] = await Promise.all([
        prisma.customers.findFirst({ where: { is_active: 'Y' } }),
        prisma.users.findFirst({ where: { is_active: 'Y' } }),
        prisma.currencies.findFirst({ where: { is_active: 'Y' } }),
      ]);

      return [
        {
          customer_id: customer?.id || 1,
          payment_date: new Date().toISOString().split('T')[0],
          collected_by: user?.id || 1,
          method: 'cash',
          reference_number: 'REF-001',
          total_amount: 1000.0,
          notes: 'Payment received for invoice #INV-001',
          currency_id: currency?.id || 1,
          is_active: 'Y',
        },
        {
          customer_id: customer?.id || 1,
          payment_date: new Date(Date.now() - 86400000)
            .toISOString()
            .split('T')[0], // Yesterday
          collected_by: user?.id || 1,
          method: 'bank_transfer',
          reference_number: 'REF-002',
          total_amount: 2500.5,
          notes: 'Bank transfer payment',
          currency_id: currency?.id || 1,
          is_active: 'Y',
        },
      ];
    } catch (error) {
      // Fallback to default sample data
      return [
        {
          customer_id: 1,
          payment_date: new Date().toISOString().split('T')[0],
          collected_by: 1,
          method: 'cash',
          reference_number: 'REF-001',
          total_amount: 1000.0,
          notes: 'Payment received for invoice #INV-001',
          currency_id: 1,
          is_active: 'Y',
        },
      ];
    }
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const model = tx ? tx.payments : prisma.payments;

    const existing = await model.findFirst({
      where: {
        customer_id: data.customer_id,
        payment_date: new Date(data.payment_date),
        total_amount: data.total_amount,
        method: data.method,
        is_active: 'Y',
      },
    });

    if (existing) {
      return `Payment with same customer, date, amount, and method already exists`;
    }

    return null;
  }

  protected async validateForeignKeys(
    data: any,
    tx?: any
  ): Promise<string | null> {
    // Validate customer exists
    const customerModel = tx ? tx.customers : prisma.customers;
    const customer = await customerModel.findUnique({
      where: { id: data.customer_id },
    });
    if (!customer) {
      return `Customer with ID ${data.customer_id} does not exist`;
    }

    // Validate user exists
    const userModel = tx ? tx.users : prisma.users;
    const user = await userModel.findUnique({
      where: { id: data.collected_by },
    });
    if (!user) {
      return `User with ID ${data.collected_by} does not exist`;
    }

    // Validate currency exists if provided
    if (data.currency_id) {
      const currencyModel = tx ? tx.currencies : prisma.currencies;
      const currency = await currencyModel.findUnique({
        where: { id: data.currency_id },
      });
      if (!currency) {
        return `Currency with ID ${data.currency_id} does not exist`;
      }
    }

    return null;
  }

  protected async prepareDataForImport(
    data: any,
    userId: number
  ): Promise<any> {
    const paymentNumber = await this.generatePaymentNumber();

    return {
      payment_number: paymentNumber,
      customer_id: data.customer_id,
      payment_date: new Date(data.payment_date),
      collected_by: data.collected_by,
      method: data.method,
      reference_number: data.reference_number || null,
      total_amount: data.total_amount,
      notes: data.notes || null,
      currency_id: data.currency_id || null,
      is_active: data.is_active || 'Y',
      createdate: new Date(),
      createdby: userId,
      log_inst: 1,
    };
  }

  private async generatePaymentNumber(): Promise<string> {
    const count = await prisma.payments.count();
    const nextNumber = count + 1;
    return `PAY-${nextNumber.toString().padStart(6, '0')}`;
  }

  protected getColumnDescription(key: string): string {
    const column = this.columns.find(col => col.key === key);
    return column?.description || '';
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(payment => ({
      customer_id: payment.customer_id,
      payment_date: payment.payment_date?.toISOString().split('T')[0] || '',
      collected_by: payment.collected_by,
      method: payment.method,
      reference_number: payment.reference_number || '',
      total_amount: payment.total_amount,
      notes: payment.notes || '',
      currency_id: payment.currency_id || '',
      is_active: payment.is_active || 'Y',
      created_date: payment.createdate?.toISOString().split('T')[0] || '',
      created_by: payment.createdby || '',
      updated_date: payment.updatedate?.toISOString().split('T')[0] || '',
      updated_by: payment.updatedby || '',
    }));
  }

  protected async updateExisting(
    data: any,
    userId: number,
    tx?: any
  ): Promise<any> {
    const model = tx ? tx.payments : prisma.payments;

    const existing = await model.findFirst({
      where: { payment_number: data.payment_number },
    });

    if (!existing) return null;

    return await model.update({
      where: { id: existing.id },
      data: {
        ...data,
        updatedby: userId,
        updatedate: new Date(),
      },
    });
  }
}
