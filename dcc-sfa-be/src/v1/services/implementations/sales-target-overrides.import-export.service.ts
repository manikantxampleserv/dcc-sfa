import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import { Prisma } from '@prisma/client';
import prisma from '../../../configs/prisma.client';

export class SalesTargetOverridesImportExportService extends ImportExportService<any> {
  protected modelName = 'sales_target_overrides' as const;
  protected displayName = 'Sales Target Overrides';
  protected uniqueFields = [
    'sales_person_id',
    'product_category_id',
    'start_date',
  ];
  protected searchFields = [];

  protected columns: ColumnDefinition[] = [
    {
      key: 'sales_person_id',
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
      description: 'ID of the salesperson (required)',
    },
    {
      key: 'product_category_id',
      header: 'Product Category ID',
      width: 20,
      required: true,
      type: 'number',
      validation: value => {
        if (!value) return 'Product Category ID is required';
        const id = parseInt(value);
        if (isNaN(id) || id <= 0)
          return 'Product Category ID must be a positive number';
        return true;
      },
      transform: value => parseInt(value),
      description: 'ID of the product category (required)',
    },
    {
      key: 'target_quantity',
      header: 'Target Quantity',
      width: 18,
      required: true,
      type: 'number',
      validation: value => {
        if (!value && value !== 0) return 'Target quantity is required';
        const qty = parseInt(value);
        if (isNaN(qty) || qty < 0)
          return 'Target quantity must be a non-negative number';
        return true;
      },
      transform: value => parseInt(value),
      description: 'Target quantity to be achieved (required, non-negative)',
    },
    {
      key: 'target_amount',
      header: 'Target Amount',
      width: 18,
      type: 'number',
      validation: value => {
        if (!value && value !== 0) return true;
        const amount = parseFloat(value);
        if (isNaN(amount)) return 'Target amount must be a number';
        if (amount < 0) return 'Target amount cannot be negative';
        if (amount > 9999999999999999.99)
          return 'Target amount exceeds maximum allowed value';
        return true;
      },
      transform: value =>
        value !== null && value !== undefined ? parseFloat(value) : null,
      description: 'Target amount in currency (optional, non-negative)',
    },
    {
      key: 'start_date',
      header: 'Start Date',
      width: 15,
      required: true,
      type: 'date',
      validation: value => {
        if (!value) return 'Start date is required';
        if (isNaN(Date.parse(value)))
          return 'Invalid date format (use YYYY-MM-DD)';
        return true;
      },
      transform: value => new Date(value),
      description: 'Start date of the target override (required, YYYY-MM-DD)',
    },
    {
      key: 'end_date',
      header: 'End Date',
      width: 15,
      required: true,
      type: 'date',
      validation: value => {
        if (!value) return 'End date is required';
        if (isNaN(Date.parse(value)))
          return 'Invalid date format (use YYYY-MM-DD)';
        return true;
      },
      transform: value => new Date(value),
      description: 'End date of the target override (required, YYYY-MM-DD)',
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
    const users = await prisma.users.findMany({
      take: 3,
      select: { id: true },
      orderBy: { id: 'asc' },
    });
    const categories = await prisma.product_categories.findMany({
      take: 3,
      select: { id: true },
      orderBy: { id: 'asc' },
    });

    const userIds = users.map(u => u.id);
    const categoryIds = categories.map(c => c.id);

    const userId1 = userIds[0] || 1;
    const userId2 = userIds[1] || 2;
    const userId3 = userIds[2] || 3;
    const categoryId1 = categoryIds[0] || 1;
    const categoryId2 = categoryIds[1] || 2;
    const categoryId3 = categoryIds[2] || 3;

    return [
      {
        sales_person_id: userId1,
        product_category_id: categoryId1,
        target_quantity: 500,
        target_amount: 50000.0,
        start_date: '2024-01-01',
        end_date: '2024-03-31',
        is_active: 'Y',
      },
      {
        sales_person_id: userId2,
        product_category_id: categoryId2,
        target_quantity: 300,
        target_amount: 30000.0,
        start_date: '2024-01-01',
        end_date: '2024-03-31',
        is_active: 'Y',
      },
      {
        sales_person_id: userId3,
        product_category_id: categoryId3,
        target_quantity: 750,
        target_amount: 75000.0,
        start_date: '2024-04-01',
        end_date: '2024-06-30',
        is_active: 'Y',
      },
      {
        sales_person_id: userId1,
        product_category_id: categoryId2,
        target_quantity: 400,
        target_amount: 40000.0,
        start_date: '2024-04-01',
        end_date: '2024-06-30',
        is_active: 'Y',
      },
    ];
  }

  protected getColumnDescription(key: string): string {
    const column = this.columns.find(col => col.key === key);
    return column?.description || '';
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(override => ({
      sales_person_id: override.sales_person_id || '',
      salesperson_name: override.sales_target_overrides_users?.name || '',
      salesperson_email: override.sales_target_overrides_users?.email || '',
      product_category_id: override.product_category_id || '',
      category_name:
        override.sales_target_overrides_product_categories?.category_name || '',
      target_quantity: override.target_quantity || 0,
      target_amount: override.target_amount
        ? override.target_amount.toString()
        : '',
      start_date: override.start_date
        ? new Date(override.start_date).toISOString().split('T')[0]
        : '',
      end_date: override.end_date
        ? new Date(override.end_date).toISOString().split('T')[0]
        : '',
      is_active: override.is_active || 'Y',
      created_date: override.createdate
        ? new Date(override.createdate).toISOString().split('T')[0]
        : '',
      created_by: override.createdby || '',
      updated_date: override.updatedate
        ? new Date(override.updatedate).toISOString().split('T')[0]
        : '',
      updated_by: override.updatedby || '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const model = tx
      ? tx.sales_target_overrides
      : prisma.sales_target_overrides;

    if (data.sales_person_id && data.product_category_id && data.start_date) {
      const startDate = new Date(data.start_date);
      const endDate = data.end_date ? new Date(data.end_date) : startDate;

      const existingOverride = await model.findFirst({
        where: {
          sales_person_id: data.sales_person_id,
          product_category_id: data.product_category_id,
          OR: [
            {
              AND: [
                { start_date: { lte: startDate } },
                { end_date: { gte: startDate } },
              ],
            },
            {
              AND: [
                { start_date: { lte: endDate } },
                { end_date: { gte: endDate } },
              ],
            },
            {
              AND: [
                { start_date: { gte: startDate } },
                { end_date: { lte: endDate } },
              ],
            },
          ],
        },
      });

      if (existingOverride) {
        return `Sales target override already exists for Salesperson ID ${data.sales_person_id} and Category ID ${data.product_category_id} with overlapping dates`;
      }
    }

    return null;
  }

  protected async validateForeignKeys(
    data: any,
    tx?: any
  ): Promise<string | null> {
    const prismaClient = tx || prisma;

    if (data.sales_person_id) {
      try {
        const user = await prismaClient.users.findUnique({
          where: { id: data.sales_person_id },
        });
        if (!user) {
          return `Salesperson with ID ${data.sales_person_id} does not exist`;
        }
      } catch (error) {
        return `Invalid Salesperson ID ${data.sales_person_id}`;
      }
    }

    if (data.product_category_id) {
      try {
        const category = await prismaClient.product_categories.findUnique({
          where: { id: data.product_category_id },
        });
        if (!category) {
          return `Product Category with ID ${data.product_category_id} does not exist`;
        }
      } catch (error) {
        return `Invalid Product Category ID ${data.product_category_id}`;
      }
    }

    if (data.start_date && data.end_date) {
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);

      if (endDate < startDate) {
        return 'End date cannot be before start date';
      }
    }

    return null;
  }

  protected async prepareDataForImport(
    data: any,
    userId: number
  ): Promise<any> {
    const preparedData: any = {
      sales_person_id: data.sales_person_id,
      product_category_id: data.product_category_id,
      target_quantity: data.target_quantity,
      start_date: data.start_date,
      end_date: data.end_date,
      is_active: data.is_active || 'Y',
      createdby: userId,
      createdate: new Date(),
      log_inst: 1,
    };

    if (data.target_amount !== null && data.target_amount !== undefined) {
      preparedData.target_amount = new Prisma.Decimal(data.target_amount);
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
        const duplicateCheck = await this.checkDuplicate(row);

        if (duplicateCheck) {
          if (options.skipDuplicates) {
            failed++;
            errors.push(`Row ${rowNum}: Skipped - ${duplicateCheck}`);
            continue;
          } else if (options.updateExisting) {
            const updated = await this.updateExisting(row, userId);
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

        const preparedData = await this.prepareDataForImport(row, userId);

        const created = await prisma.sales_target_overrides.create({
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
    const model = tx
      ? tx.sales_target_overrides
      : prisma.sales_target_overrides;

    const startDate = new Date(data.start_date);

    const existing = await model.findFirst({
      where: {
        sales_person_id: data.sales_person_id,
        product_category_id: data.product_category_id,
        start_date: startDate,
      },
    });

    if (!existing) return null;

    const updateData: any = {
      target_quantity: data.target_quantity || existing.target_quantity,
      end_date: data.end_date || existing.end_date,
      is_active: data.is_active || existing.is_active,
      updatedby: userId,
      updatedate: new Date(),
    };

    if (data.target_amount !== null && data.target_amount !== undefined) {
      updateData.target_amount = new Prisma.Decimal(data.target_amount);
    }

    return await model.update({
      where: { id: existing.id },
      data: updateData,
    });
  }

  async exportToExcel(options: any = {}): Promise<Buffer> {
    const query: any = {
      where: options.filters,
      orderBy: options.orderBy || { start_date: 'desc' },
      include: {
        sales_target_overrides_users: {
          select: {
            name: true,
            email: true,
          },
        },
        sales_target_overrides_product_categories: {
          select: {
            category_name: true,
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
      { header: 'Override ID', key: 'id', width: 12 },
      ...this.columns,
      { header: 'Salesperson Name', key: 'salesperson_name', width: 25 },
      { header: 'Salesperson Email', key: 'salesperson_email', width: 30 },
      { header: 'Category Name', key: 'category_name', width: 30 },
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
    let totalOverrides = 0;
    let activeOverrides = 0;
    let inactiveOverrides = 0;
    let totalTargetQuantity = 0;
    let totalTargetAmount = 0;
    const salespersonOverrides: any = {};
    const categoryOverrides: any = {};

    exportData.forEach((row: any, index: number) => {
      const override = data[index] as any;

      row.id = override.id;
      row.salesperson_name = override.sales_target_overrides_users?.name || '';
      row.salesperson_email =
        override.sales_target_overrides_users?.email || '';
      row.category_name =
        override.sales_target_overrides_product_categories?.category_name || '';

      totalOverrides++;
      if (override.is_active === 'Y') activeOverrides++;
      if (override.is_active === 'N') inactiveOverrides++;

      totalTargetQuantity += override.target_quantity || 0;
      if (override.target_amount) {
        totalTargetAmount += parseFloat(override.target_amount.toString());
      }

      const salesperson =
        override.sales_target_overrides_users?.name || 'Unknown';
      salespersonOverrides[salesperson] =
        (salespersonOverrides[salesperson] || 0) + 1;

      const category =
        override.sales_target_overrides_product_categories?.category_name ||
        'Unknown';
      categoryOverrides[category] = (categoryOverrides[category] || 0) + 1;

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

      if (override.is_active === 'N') {
        excelRow.getCell('is_active').font = {
          color: { argb: 'FFFF0000' },
          bold: true,
        };
      }

      if (
        override.target_amount &&
        parseFloat(override.target_amount.toString()) > 50000
      ) {
        excelRow.getCell('target_amount').font = {
          color: { argb: 'FF0000FF' },
          bold: true,
        };
      }

      if (override.end_date && new Date(override.end_date) < new Date()) {
        excelRow.getCell('end_date').font = {
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

    summarySheet.addRow({ metric: 'Total Overrides', value: totalOverrides });
    summarySheet.addRow({ metric: 'Active Overrides', value: activeOverrides });
    summarySheet.addRow({
      metric: 'Inactive Overrides',
      value: inactiveOverrides,
    });
    summarySheet.addRow({ metric: '', value: '' });

    summarySheet.addRow({
      metric: 'Total Target Quantity',
      value: totalTargetQuantity,
    });
    summarySheet.addRow({
      metric: 'Total Target Amount',
      value: totalTargetAmount.toFixed(2),
    });
    summarySheet.addRow({
      metric: 'Average Target Quantity',
      value:
        totalOverrides > 0
          ? (totalTargetQuantity / totalOverrides).toFixed(2)
          : '0',
    });
    summarySheet.addRow({
      metric: 'Average Target Amount',
      value:
        totalOverrides > 0
          ? (totalTargetAmount / totalOverrides).toFixed(2)
          : '0',
    });
    summarySheet.addRow({ metric: '', value: '' });
    summarySheet.addRow({ metric: 'Overrides by Salesperson', value: '' });
    Object.keys(salespersonOverrides)
      .sort((a, b) => salespersonOverrides[b] - salespersonOverrides[a])
      .forEach(salesperson => {
        summarySheet.addRow({
          metric: `  ${salesperson}`,
          value: salespersonOverrides[salesperson],
        });
      });
    summarySheet.addRow({ metric: '', value: '' });

    summarySheet.addRow({ metric: 'Overrides by Category', value: '' });
    Object.keys(categoryOverrides)
      .sort((a, b) => categoryOverrides[b] - categoryOverrides[a])
      .forEach(category => {
        summarySheet.addRow({
          metric: `  ${category}`,
          value: categoryOverrides[category],
        });
      });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
