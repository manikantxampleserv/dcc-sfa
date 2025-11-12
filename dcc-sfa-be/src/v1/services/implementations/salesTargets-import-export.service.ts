import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import * as ExcelJS from 'exceljs';
import prisma from '../../../configs/prisma.client';

export class SalesTargetsImportExportService extends ImportExportService<any> {
  protected modelName = 'sales_targets' as const;
  protected displayName = 'Sales Targets';
  protected uniqueFields = [
    'sales_target_group_id',
    'product_category_id',
    'start_date',
  ];
  protected searchFields = ['target_quantity', 'target_amount'];

  protected columns: ColumnDefinition[] = [
    {
      key: 'sales_target_group_id',
      header: 'Sales Target Group ID',
      width: 20,
      required: true,
      type: 'number',
      validation: value => {
        if (!value) return 'Sales target group ID is required';
        const num = parseInt(value);
        if (isNaN(num) || num < 1)
          return 'Sales target group ID must be a positive integer';
        return true;
      },
      transform: value => parseInt(value),
      description: 'ID of the sales target group (required)',
    },
    {
      key: 'product_category_id',
      header: 'Product Category ID',
      width: 20,
      required: true,
      type: 'number',
      validation: value => {
        if (!value) return 'Product category ID is required';
        const num = parseInt(value);
        if (isNaN(num) || num < 1)
          return 'Product category ID must be a positive integer';
        return true;
      },
      transform: value => parseInt(value),
      description: 'ID of the product category (required)',
    },
    {
      key: 'target_quantity',
      header: 'Target Quantity',
      width: 15,
      required: true,
      type: 'number',
      validation: value => {
        if (!value) return 'Target quantity is required';
        const num = parseInt(value);
        if (isNaN(num) || num < 1)
          return 'Target quantity must be a positive integer';
        return true;
      },
      transform: value => parseInt(value),
      description:
        'Target quantity for the sales target (required, positive integer)',
    },
    {
      key: 'target_amount',
      header: 'Target Amount',
      width: 15,
      type: 'number',
      validation: value => {
        if (value) {
          const num = parseFloat(value);
          if (isNaN(num)) return 'Target amount must be a valid number';
          if (num < 0) return 'Target amount must be non-negative';
        }
        return true;
      },
      transform: value => (value ? parseFloat(value) : null),
      description:
        'Target amount for the sales target (optional, non-negative)',
    },
    {
      key: 'start_date',
      header: 'Start Date',
      width: 15,
      required: true,
      type: 'date',
      validation: value => {
        if (!value) return 'Start date is required';
        const date = new Date(value);
        if (isNaN(date.getTime())) return 'Start date must be a valid date';
        return true;
      },
      transform: value => new Date(value),
      description:
        'Start date of the sales target period (required, format: YYYY-MM-DD)',
    },
    {
      key: 'end_date',
      header: 'End Date',
      width: 15,
      required: true,
      type: 'date',
      validation: value => {
        if (!value) return 'End date is required';
        const date = new Date(value);
        if (isNaN(date.getTime())) return 'End date must be a valid date';
        return true;
      },
      transform: value => new Date(value),
      description:
        'End date of the sales target period (required, format: YYYY-MM-DD)',
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
        sales_target_group_id: 1,
        product_category_id: 1,
        target_quantity: 100,
        target_amount: 50000.0,
        start_date: '2024-01-01',
        end_date: '2024-03-31',
        is_active: 'Y',
      },
      {
        sales_target_group_id: 1,
        product_category_id: 2,
        target_quantity: 200,
        target_amount: 75000.0,
        start_date: '2024-04-01',
        end_date: '2024-06-30',
        is_active: 'Y',
      },
      {
        sales_target_group_id: 2,
        product_category_id: 1,
        target_quantity: 150,
        target_amount: 60000.0,
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        is_active: 'Y',
      },
    ];
  }

  protected getColumnDescription(): string {
    return `
# Sales Targets Import Template

## Required Fields:
- **Sales Target Group ID**: ID of the sales target group (must exist)
- **Product Category ID**: ID of the product category (must exist)
- **Target Quantity**: Target quantity for the sales target (positive integer)
- **Start Date**: Start date of the sales target period (YYYY-MM-DD)
- **End Date**: End date of the sales target period (YYYY-MM-DD)

## Optional Fields:
- **Target Amount**: Target amount for the sales target (non-negative decimal)
- **Is Active**: Whether the target is active (Y/N, defaults to Y)

## Notes:
- End date must be after start date.
- Sales target group and product category must exist in the system.
- No overlapping targets allowed for the same group and category in the same period.
    `;
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(target => ({
      sales_target_group_id: target.sales_target_group_id,
      sales_target_group_name: target.sales_targets_groups?.group_name || '',
      product_category_id: target.product_category_id,
      product_category_name:
        target.sales_targets_product_categories?.category_name || '',
      target_quantity: target.target_quantity,
      target_amount: target.target_amount?.toString() || '',
      start_date: target.start_date?.toISOString().split('T')[0] || '',
      end_date: target.end_date?.toISOString().split('T')[0] || '',
      is_active: target.is_active || 'Y',
      createdate: target.createdate?.toISOString().split('T')[0] || '',
      createdby: target.createdby || '',
      updatedate: target.updatedate?.toISOString().split('T')[0] || '',
      updatedby: target.updatedby || '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const model = tx ? tx.sales_targets : prisma.sales_targets;

    // Check for overlapping targets for the same group and category
    const existingTarget = await model.findFirst({
      where: {
        sales_target_group_id: data.sales_target_group_id,
        product_category_id: data.product_category_id,
        is_active: 'Y',
        OR: [
          {
            start_date: {
              lte: data.end_date,
            },
            end_date: {
              gte: data.start_date,
            },
          },
        ],
      },
    });

    if (existingTarget) {
      return `Sales target for group ${data.sales_target_group_id} and category ${data.product_category_id} already exists for overlapping period`;
    }

    return null;
  }

  protected async transformDataForImport(
    data: any,
    userId: number
  ): Promise<any> {
    return {
      sales_target_group_id: data.sales_target_group_id,
      product_category_id: data.product_category_id,
      target_quantity: data.target_quantity,
      target_amount: data.target_amount || null,
      start_date: data.start_date,
      end_date: data.end_date,
      is_active: data.is_active || 'Y',
      createdate: new Date(),
      createdby: userId,
      log_inst: 1,
    };
  }

  protected async validateForeignKeys(data: any[]): Promise<string | null> {
    // Check if sales target groups exist
    const groupIds = [...new Set(data.map(item => item.sales_target_group_id))];
    const existingGroups = await prisma.sales_target_groups.findMany({
      where: { id: { in: groupIds } },
      select: { id: true },
    });
    const existingGroupIds = existingGroups.map(group => group.id);
    const missingGroupIds = groupIds.filter(
      id => !existingGroupIds.includes(id)
    );

    if (missingGroupIds.length > 0) {
      return `Sales target groups with IDs ${missingGroupIds.join(', ')} do not exist`;
    }

    // Check if product categories exist
    const categoryIds = [
      ...new Set(data.map(item => item.product_category_id)),
    ];
    const existingCategories = await prisma.product_categories.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true },
    });
    const existingCategoryIds = existingCategories.map(category => category.id);
    const missingCategoryIds = categoryIds.filter(
      id => !existingCategoryIds.includes(id)
    );

    if (missingCategoryIds.length > 0) {
      return `Product categories with IDs ${missingCategoryIds.join(', ')} do not exist`;
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
    const model = tx ? tx.sales_targets : prisma.sales_targets;

    // Find existing record based on unique fields
    const existing = await model.findFirst({
      where: {
        sales_target_group_id: data.sales_target_group_id,
        product_category_id: data.product_category_id,
        start_date: data.start_date,
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
        sales_targets_groups: true,
        sales_targets_product_categories: true,
      },
    };

    if (options.limit) query.take = options.limit;

    const data = await this.getModel().findMany(query);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(this.displayName);

    const exportColumns = [
      ...this.columns,
      { header: 'Group Name', key: 'group_name', width: 25 },
      { header: 'Category Name', key: 'category_name', width: 25 },
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
        group_name: data[index]?.sales_targets_groups?.group_name || '',
        category_name:
          data[index]?.sales_targets_product_categories?.category_name || '',
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
