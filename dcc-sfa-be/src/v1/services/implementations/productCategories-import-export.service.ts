import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import * as ExcelJS from 'exceljs';
import prisma from '../../../configs/prisma.client';

export class ProductCategoriesImportExportService extends ImportExportService<any> {
  protected modelName = 'product_categories' as const;
  protected displayName = 'Product Categories';
  protected uniqueFields = ['category_name'];
  protected searchFields = ['category_name', 'description'];

  protected columns: ColumnDefinition[] = [
    {
      key: 'category_name',
      header: 'Category Name',
      width: 25,
      required: true,
      type: 'string',
      validation: value => {
        if (!value) return 'Category name is required';
        if (value.length < 2)
          return 'Category name must be at least 2 characters';
        if (value.length > 100)
          return 'Category name must not exceed 100 characters';
        return true;
      },
      transform: value => value.toString().trim(),
      description: 'Name of the product category (required, 2-100 characters)',
    },
    {
      key: 'description',
      header: 'Description',
      width: 30,
      type: 'string',
      validation: value => {
        if (value && value.length > 500) {
          return 'Description must not exceed 500 characters';
        }
        return true;
      },
      transform: value => (value ? value.toString().trim() : null),
      description:
        'Description of the product category (optional, max 500 characters)',
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
        category_name: 'Beverages',
        description:
          'All types of beverages including soft drinks, juices, and water',
        is_active: 'Y',
      },
      {
        category_name: 'Snacks',
        description: 'Various snack items like chips, crackers, and nuts',
        is_active: 'Y',
      },
      {
        category_name: 'Dairy Products',
        description: 'Milk, cheese, yogurt, and other dairy items',
        is_active: 'Y',
      },
      {
        category_name: 'Frozen Foods',
        description: 'Frozen meals, ice cream, and frozen vegetables',
        is_active: 'Y',
      },
      {
        category_name: 'Health & Wellness',
        description: 'Health supplements, vitamins, and wellness products',
        is_active: 'N',
      },
    ];
  }

  protected getColumnDescription(): string {
    return `
# Product Categories Import Template

## Required Fields:
- **Category Name**: Name of the product category (2-100 characters)

## Optional Fields:
- **Description**: Description of the product category (max 500 characters)
- **Is Active**: Whether the category is active (Y/N, defaults to Y)

## Notes:
- Category names must be unique across the system.
- Active categories are available for use in products and sales targets.
- Inactive categories are hidden but preserved for historical data.
- Description helps users understand the category purpose.
    `;
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(category => ({
      category_name: category.category_name,
      description: category.description || '',
      is_active: category.is_active || 'Y',
      createdate: category.createdate?.toISOString().split('T')[0] || '',
      createdby: category.createdby || '',
      updatedate: category.updatedate?.toISOString().split('T')[0] || '',
      updatedby: category.updatedby || '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const model = tx ? tx.product_categories : prisma.product_categories;

    const existingCategory = await model.findFirst({
      where: {
        category_name: data.category_name,
      },
    });

    if (existingCategory) {
      return `Product category "${data.category_name}" already exists`;
    }

    return null;
  }

  protected async transformDataForImport(
    data: any,
    userId: number
  ): Promise<any> {
    return {
      category_name: data.category_name,
      description: data.description || null,
      is_active: data.is_active || 'Y',
      createdate: new Date(),
      createdby: userId,
      log_inst: 1,
    };
  }

  protected async validateForeignKeys(data: any[]): Promise<string | null> {
    // Product categories don't have foreign key dependencies
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
    const model = tx ? tx.product_categories : prisma.product_categories;

    // Find existing record based on unique fields
    const existing = await model.findFirst({
      where: {
        category_name: data.category_name,
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
    };

    if (options.limit) query.take = options.limit;

    const data = await this.getModel().findMany(query);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(this.displayName);

    const exportColumns = [
      ...this.columns,
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

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
