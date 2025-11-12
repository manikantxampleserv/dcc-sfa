import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import * as ExcelJS from 'exceljs';
import prisma from '../../../configs/prisma.client';

export class ReturnRequestsImportExportService extends ImportExportService<any> {
  protected modelName = 'return_requests' as const;
  protected displayName = 'Return Requests';
  protected uniqueFields = ['customer_id', 'product_id', 'serial_id'];
  protected searchFields = ['reason', 'resolution_notes', 'status'];

  protected columns: ColumnDefinition[] = [
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
      key: 'product_id',
      header: 'Product ID',
      width: 15,
      required: true,
      type: 'number',
      validation: value => {
        if (!value) return 'Product ID is required';
        const num = parseInt(value);
        if (isNaN(num) || num < 1)
          return 'Product ID must be a positive integer';
        return true;
      },
      transform: value => parseInt(value),
      description: 'ID of the product (required)',
    },
    {
      key: 'serial_id',
      header: 'Serial ID',
      width: 15,
      type: 'number',
      validation: value => {
        if (value) {
          const num = parseInt(value);
          if (isNaN(num) || num < 1)
            return 'Serial ID must be a positive integer';
        }
        return true;
      },
      transform: value => (value ? parseInt(value) : null),
      description: 'ID of the serial number (optional)',
    },
    {
      key: 'return_date',
      header: 'Return Date',
      width: 20,
      type: 'date',
      validation: value => {
        if (value) {
          const date = new Date(value);
          if (isNaN(date.getTime())) return 'Invalid date format';
          const today = new Date();
          today.setHours(23, 59, 59, 999);
          if (date > today) return 'Return date cannot be in the future';
        }
        return true;
      },
      transform: value => (value ? new Date(value) : null),
      description: 'Date of return (optional, YYYY-MM-DD format)',
    },
    {
      key: 'reason',
      header: 'Reason',
      width: 40,
      type: 'string',
      validation: value => {
        if (value && value.length > 500)
          return 'Reason must be less than 500 characters';
        return true;
      },
      description: 'Reason for return (optional, max 500 chars)',
    },
    {
      key: 'status',
      header: 'Status',
      width: 15,
      type: 'string',
      defaultValue: 'pending',
      validation: value => {
        const validStatuses = [
          'pending',
          'approved',
          'rejected',
          'processing',
          'completed',
          'cancelled',
        ];
        return validStatuses.includes(value) || 'Invalid status';
      },
      description:
        'Return request status (pending, approved, rejected, processing, completed, cancelled)',
    },
    {
      key: 'approved_by',
      header: 'Approved By ID',
      width: 15,
      type: 'number',
      validation: value => {
        if (value) {
          const num = parseInt(value);
          if (isNaN(num) || num < 1)
            return 'Approved by ID must be a positive integer';
        }
        return true;
      },
      transform: value => (value ? parseInt(value) : null),
      description: 'ID of the user who approved the request (optional)',
    },
    {
      key: 'approved_date',
      header: 'Approved Date',
      width: 20,
      type: 'date',
      validation: value => {
        if (value) {
          const date = new Date(value);
          if (isNaN(date.getTime())) return 'Invalid date format';
          const today = new Date();
          today.setHours(23, 59, 59, 999);
          if (date > today) return 'Approved date cannot be in the future';
        }
        return true;
      },
      transform: value => (value ? new Date(value) : null),
      description: 'Date of approval (optional, YYYY-MM-DD format)',
    },
    {
      key: 'resolution_notes',
      header: 'Resolution Notes',
      width: 40,
      type: 'string',
      validation: value => {
        if (value && value.length > 1000)
          return 'Resolution notes must be less than 1000 characters';
        return true;
      },
      description: 'Resolution notes (optional, max 1000 chars)',
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
    const customers = await prisma.customers.findMany({
      select: { id: true, name: true },
      take: 3,
    });

    const products = await prisma.products.findMany({
      select: { id: true, name: true },
      take: 3,
    });

    const users = await prisma.users.findMany({
      select: { id: true, name: true },
      take: 1,
    });

    // Use actual IDs from database, fallback to 1 if no data exists
    const customer1Id = customers[0]?.id || 1;
    const customer2Id = customers[1]?.id || 2;
    const customer3Id = customers[2]?.id || 3;
    const product1Id = products[0]?.id || 1;
    const product2Id = products[1]?.id || 2;
    const product3Id = products[2]?.id || 3;
    const approverId = users[0]?.id || 1;

    return [
      {
        customer_id: customer1Id,
        product_id: product1Id,
        serial_id: null,
        return_date: '2024-02-15',
        reason: 'Product defective upon delivery',
        status: 'pending',
        approved_by: null,
        approved_date: null,
        resolution_notes: null,
        is_active: 'Y',
      },
      {
        customer_id: customer2Id,
        product_id: product2Id,
        serial_id: null,
        return_date: '2024-02-16',
        reason: 'Wrong product delivered',
        status: 'approved',
        approved_by: approverId,
        approved_date: '2024-02-17',
        resolution_notes: 'Approved for full refund',
        is_active: 'Y',
      },
      {
        customer_id: customer3Id,
        product_id: product3Id,
        serial_id: null,
        return_date: '2024-02-18',
        reason: 'Product damaged during shipping',
        status: 'rejected',
        approved_by: approverId,
        approved_date: '2024-02-19',
        resolution_notes: 'Rejected - damage occurred after delivery',
        is_active: 'Y',
      },
    ];
  }

  protected getColumnDescription(): string {
    return `
# Return Requests Import Template

## Required Fields:
- **Customer ID**: ID of the customer (must exist)
- **Product ID**: ID of the product (must exist)

## Optional Fields:
- **Serial ID**: ID of the serial number (must exist if provided)
- **Return Date**: Date of return (YYYY-MM-DD format, cannot be in future)
- **Reason**: Reason for return (max 500 chars)
- **Status**: Return request status (pending, approved, rejected, processing, completed, cancelled)
- **Approved By ID**: ID of the user who approved the request (must exist if provided)
- **Approved Date**: Date of approval (YYYY-MM-DD format, cannot be in future)
- **Resolution Notes**: Resolution notes (max 1000 chars)
- **Is Active**: Whether the request is active (Y/N, defaults to Y)

## Notes:
- Customer and Product must exist in the system
- Serial ID must exist if provided
- Approved By ID must exist if provided
- Return date and approved date cannot be in the future
- Status has predefined values
    `;
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(request => ({
      customer_id: request.customer_id,
      product_id: request.product_id,
      serial_id: request.serial_id?.toString() || '',
      return_date: request.return_date?.toISOString().split('T')[0] || '',
      reason: request.reason || '',
      status: request.status || 'pending',
      approved_by: request.approved_by?.toString() || '',
      approved_date: request.approved_date?.toISOString().split('T')[0] || '',
      resolution_notes: request.resolution_notes || '',
      is_active: request.is_active || 'Y',
      createdate: request.createdate?.toISOString().split('T')[0] || '',
      createdby: request.createdby || '',
      updatedate: request.updatedate?.toISOString().split('T')[0] || '',
      updatedby: request.updatedby || '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const model = tx ? tx.return_requests : prisma.return_requests;

    // Check for duplicate based on customer, product, and serial_id combination
    const whereClause: any = {
      customer_id: data.customer_id,
      product_id: data.product_id,
    };

    if (data.serial_id) {
      whereClause.serial_id = data.serial_id;
    } else {
      whereClause.serial_id = null;
    }

    const existingRequest = await model.findFirst({
      where: whereClause,
    });

    if (existingRequest) {
      return `Return request for customer ${data.customer_id}, product ${data.product_id}${data.serial_id ? `, serial ${data.serial_id}` : ''} already exists`;
    }

    return null;
  }

  protected async transformDataForImport(
    data: any,
    userId: number
  ): Promise<any> {
    return {
      customer_id: data.customer_id,
      product_id: data.product_id,
      serial_id: data.serial_id || null,
      return_date: data.return_date || new Date(),
      reason: data.reason || null,
      status: data.status || 'pending',
      approved_by: data.approved_by || null,
      approved_date: data.approved_date || null,
      resolution_notes: data.resolution_notes || null,
      is_active: data.is_active || 'Y',
      createdate: new Date(),
      createdby: userId,
      log_inst: 1,
    };
  }

  protected async validateForeignKeys(data: any): Promise<string | null> {
    // Check if customer exists
    const customer = await prisma.customers.findFirst({
      where: { id: data.customer_id },
    });

    if (!customer) {
      return `Customer with ID ${data.customer_id} does not exist`;
    }

    // Check if product exists
    const product = await prisma.products.findFirst({
      where: { id: data.product_id },
    });

    if (!product) {
      return `Product with ID ${data.product_id} does not exist`;
    }

    // Check if serial number exists (if provided)
    if (data.serial_id) {
      const serialNumber = await prisma.serial_numbers.findFirst({
        where: { id: data.serial_id },
      });

      if (!serialNumber) {
        return `Serial number with ID ${data.serial_id} does not exist`;
      }
    }

    // Check if approved by user exists (if provided)
    if (data.approved_by) {
      const approver = await prisma.users.findFirst({
        where: { id: data.approved_by },
      });

      if (!approver) {
        return `User with ID ${data.approved_by} does not exist`;
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
    const model = tx ? tx.return_requests : prisma.return_requests;

    // Find existing record based on unique fields
    const whereClause: any = {
      customer_id: data.customer_id,
      product_id: data.product_id,
    };

    if (data.serial_id) {
      whereClause.serial_id = data.serial_id;
    } else {
      whereClause.serial_id = null;
    }

    const existing = await model.findFirst({
      where: whereClause,
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
    // Normalize filters: convert camelCase to snake_case
    const normalizeKey = (key: string): string => {
      return key.replace(/([A-Z])/g, '_$1').toLowerCase();
    };

    const normalizeFilters = (filters: any): any => {
      if (!filters || typeof filters !== 'object') {
        return filters;
      }

      const normalized: any = {};
      Object.keys(filters).forEach(key => {
        const snakeKey = normalizeKey(key);
        const value = filters[key];

        // Handle nested objects (like OR, AND, NOT clauses)
        if (
          value &&
          typeof value === 'object' &&
          !Array.isArray(value) &&
          !(value instanceof Date)
        ) {
          normalized[snakeKey] = normalizeFilters(value);
        } else if (Array.isArray(value)) {
          // Handle arrays (like in OR clauses)
          normalized[snakeKey] = value.map(item =>
            typeof item === 'object' && item !== null
              ? normalizeFilters(item)
              : item
          );
        } else {
          normalized[snakeKey] = value;
        }
      });
      return normalized;
    };

    const normalizedFilters = options.filters
      ? normalizeFilters(options.filters)
      : undefined;

    const query: any = {
      where: normalizedFilters || {},
      orderBy: options.orderBy || { id: 'desc' },
      include: {
        return_requests_customers: true,
        return_requests_products: true,
        return_requests_serial_numbers: true,
        return_requests_users: true,
      },
    };

    if (options.limit) query.take = options.limit;

    const data = await this.getModel().findMany(query);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(this.displayName);

    const exportColumns = [
      ...this.columns,
      { header: 'Customer Name', key: 'customer_name', width: 25 },
      { header: 'Product Name', key: 'product_name', width: 25 },
      { header: 'Serial Number', key: 'serial_number', width: 20 },
      { header: 'Approver Name', key: 'approver_name', width: 25 },
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
        customer_name: data[index]?.return_requests_customers?.name || '',
        product_name: data[index]?.return_requests_products?.name || '',
        serial_number:
          data[index]?.return_requests_serial_numbers?.serial_no || '',
        approver_name: data[index]?.return_requests_users?.name || '',
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
