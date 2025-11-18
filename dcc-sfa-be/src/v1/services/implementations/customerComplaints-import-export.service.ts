import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import prisma from '../../../configs/prisma.client';

export class CustomerComplaintsImportExportService extends ImportExportService<any> {
  protected modelName = 'customer_complaints' as const;
  protected displayName = 'Customer Complaints';
  protected uniqueFields: string[] = [];
  protected searchFields = ['complaint_title', 'complaint_description'];

  protected columns: ColumnDefinition[] = [
    {
      key: 'customer_id',
      header: 'Customer ID',
      width: 15,
      required: true,
      type: 'number',
      validation: value => {
        const numValue = Number(value);
        if (!value || isNaN(numValue) || numValue <= 0)
          return 'Customer ID must be a valid positive number';
        return true;
      },
      description:
        'ID of the customer (required, must exist in customers table)',
    },
    {
      key: 'complaint_title',
      header: 'Complaint Title',
      width: 30,
      required: true,
      type: 'string',
      validation: value => {
        if (!value || value.trim().length === 0)
          return 'Complaint title is required';
        if (value.trim().length > 255)
          return 'Complaint title must be less than 255 characters';
        return true;
      },
      description: 'Title of the complaint (required, max 255 characters)',
    },
    {
      key: 'complaint_description',
      header: 'Complaint Description',
      width: 50,
      required: true,
      type: 'string',
      validation: value => {
        if (!value || value.trim().length < 10)
          return 'Complaint description must be at least 10 characters';
        return true;
      },
      description: 'Description of the complaint (required, min 10 characters)',
    },
    {
      key: 'status',
      header: 'Status',
      width: 12,
      type: 'string',
      defaultValue: 'P',
      validation: value => {
        const upperValue = value ? value.toString().toUpperCase() : 'P';
        return ['P', 'R', 'C'].includes(upperValue) || 'Must be P, R, or C';
      },
      transform: value => (value ? value.toString().toUpperCase() : 'P'),
      description:
        'Status - P for Pending, R for Resolved, C for Closed (defaults to P)',
    },
    {
      key: 'submitted_by',
      header: 'Submitted By (User ID)',
      width: 20,
      required: true,
      type: 'number',
      validation: value => {
        const numValue = Number(value);
        if (!value || isNaN(numValue) || numValue <= 0)
          return 'Submitted By must be a valid user ID';
        return true;
      },
      description:
        'ID of the user who submitted the complaint (required, must exist in users table)',
    },
  ];

  protected async getSampleData(): Promise<any[]> {
    try {
      // Fetch actual IDs from database to ensure validity
      const customers = await prisma.customers.findMany({
        take: 3,
        select: { id: true, name: true },
        orderBy: { id: 'asc' },
      });
      const users = await prisma.users.findMany({
        take: 1,
        select: { id: true, name: true },
        orderBy: { id: 'asc' },
      });

      const customerIds = customers.map(c => c.id);
      const userIds = users.map(u => u.id);

      const customerId1 = customerIds[0] || 999;
      const customerId2 = customerIds[1] || 999;
      const customerId3 = customerIds[2] || 999;
      const userId1 = userIds[0] || 999;

      return [
        {
          customer_id: customerId1,
          complaint_title: 'Product Quality Issue',
          complaint_description:
            'Product quality issue - received damaged goods in last delivery',
          status: 'P',
          submitted_by: userId1,
        },
        {
          customer_id: customerId2 || customerId1,
          complaint_title: 'Delivery Delay',
          complaint_description:
            'Delivery delay - order was supposed to arrive on Monday but came on Wednesday',
          status: 'P',
          submitted_by: userId1,
        },
        {
          customer_id: customerId3 || customerId1,
          complaint_title: 'Billing Discrepancy',
          complaint_description:
            'Billing discrepancy - invoice amount does not match order total',
          status: 'R',
          submitted_by: userId1,
        },
      ];
    } catch (error) {
      // Fallback to placeholder data if database query fails
      return [
        {
          customer_id: 999,
          complaint_title: 'Product Quality Issue',
          complaint_description:
            'Product quality issue - received damaged goods in last delivery. Please replace customer_id with a valid customer ID from your database.',
          status: 'P',
          submitted_by: 999,
        },
        {
          customer_id: 999,
          complaint_title: 'Delivery Delay',
          complaint_description:
            'Delivery delay - order was supposed to arrive on Monday but came on Wednesday. Please replace customer_id with a valid customer ID from your database.',
          status: 'P',
          submitted_by: 999,
        },
        {
          customer_id: 999,
          complaint_title: 'Billing Discrepancy',
          complaint_description:
            'Billing discrepancy - invoice amount does not match order total. Please replace customer_id and submitted_by with valid IDs from your database.',
          status: 'R',
          submitted_by: 999,
        },
      ];
    }
  }

  protected getColumnDescription(key: string): string {
    const column = this.columns.find(col => col.key === key);
    return column?.description || '';
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(complaint => ({
      customer_id: complaint.customer_id,
      complaint_title: complaint.complaint_title || '',
      complaint_description: complaint.complaint_description || '',
      status: complaint.status || 'P',
      submitted_by: complaint.submitted_by || '',
      created_date: complaint.createdate?.toISOString().split('T')[0] || '',
      created_by: complaint.createdby || '',
      updated_date: complaint.updatedate?.toISOString().split('T')[0] || '',
      updated_by: complaint.updatedby || '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    return null;
  }

  protected async validateForeignKeys(
    data: any,
    tx?: any
  ): Promise<string | null> {
    const customerModel = tx ? tx.customers : prisma.customers;
    const userModel = tx ? tx.users : prisma.users;

    const customer = await customerModel.findUnique({
      where: { id: Number(data.customer_id) },
    });

    if (!customer) {
      return `Customer with ID ${data.customer_id} does not exist`;
    }

    const user = await userModel.findUnique({
      where: { id: Number(data.submitted_by) },
    });

    if (!user) {
      return `User with ID ${data.submitted_by} does not exist`;
    }

    return null;
  }

  protected async prepareDataForImport(
    data: any,
    userId: number
  ): Promise<any> {
    return {
      customer_id: Number(data.customer_id),
      complaint_title: data.complaint_title,
      complaint_description: data.complaint_description,
      status: data.status || 'P',
      submitted_by: Number(data.submitted_by),
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
    return null;
  }

  async exportToExcel(options: any = {}): Promise<Buffer> {
    const query: any = {
      where: options.filters,
      orderBy: options.orderBy || { createdate: 'desc' },
      include: {
        customer_complaint: true,
        submitted_by_users: true,
      },
    };

    if (options.limit) query.take = options.limit;

    const data = await this.getModel().findMany(query);

    const workbook = new (await import('exceljs')).Workbook();
    const worksheet = workbook.addWorksheet(this.displayName);

    const exportColumns = [
      ...this.columns,
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
    });

    if (data.length > 0) {
      worksheet.autoFilter = {
        from: 'A1',
        to: `${String.fromCharCode(64 + exportColumns.length)}${data.length + 1}`,
      };
    }

    const summaryRow = worksheet.addRow([]);
    summaryRow.getCell(1).value = `Total Customer Complaints: ${data.length}`;
    summaryRow.getCell(1).font = { bold: true };

    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
