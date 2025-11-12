import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import * as ExcelJS from 'exceljs';
import prisma from '../../../configs/prisma.client';

export class ProductSubCategoriesImportExportService extends ImportExportService<any> {
  protected modelName = 'product_sub_categories' as const;
  protected displayName = 'Product Sub Categories';
  protected uniqueFields = ['sub_category_name', 'product_category_id'];
  protected searchFields = ['sub_category_name', 'description'];

  protected columns: ColumnDefinition[] = [
    {
      key: 'sub_category_name',
      header: 'Sub Category Name',
      width: 25,
      required: true,
      type: 'string',
      validation: value => {
        if (!value) return 'Sub category name is required';
        if (value.length < 2)
          return 'Sub category name must be at least 2 characters';
        if (value.length > 100)
          return 'Sub category name must not exceed 100 characters';
        return true;
      },
      transform: value => value.toString().trim(),
      description:
        'Name of the product sub category (required, 2-100 characters)',
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
      description: 'ID of the parent product category (required)',
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
        'Description of the product sub category (optional, max 500 characters)',
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
        sub_category_name: 'Soft Drinks',
        product_category_id: 1,
        description: 'Carbonated soft drinks and sodas',
        is_active: 'Y',
      },
      {
        sub_category_name: 'Energy Drinks',
        product_category_id: 1,
        description: 'Energy drinks and sports beverages',
        is_active: 'Y',
      },
      {
        sub_category_name: 'Potato Chips',
        product_category_id: 2,
        description: 'Various flavors of potato chips',
        is_active: 'Y',
      },
      {
        sub_category_name: 'Nuts & Seeds',
        product_category_id: 2,
        description: 'Mixed nuts, almonds, and seeds',
        is_active: 'Y',
      },
      {
        sub_category_name: 'Fresh Milk',
        product_category_id: 3,
        description: 'Fresh dairy milk products',
        is_active: 'N',
      },
    ];
  }

  protected getColumnDescription(): string {
    return `
# Product Sub Categories Import Template

## Required Fields:
- **Sub Category Name**: Name of the product sub category (2-100 characters)
- **Product Category ID**: ID of the parent product category (must exist)

## Optional Fields:
- **Description**: Description of the product sub category (max 500 characters)
- **Is Active**: Whether the sub category is active (Y/N, defaults to Y)

## Notes:
- Sub category names must be unique within each product category.
- Product category ID must reference an existing product category.
- Active sub categories are available for use in products.
- Inactive sub categories are hidden but preserved for historical data.
- Description helps users understand the sub category purpose.
    `;
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(subCategory => ({
      sub_category_name: subCategory.sub_category_name,
      product_category_id: subCategory.product_category_id,
      product_category_name: subCategory.product_category?.category_name || '',
      description: subCategory.description || '',
      is_active: subCategory.is_active || 'Y',
      createdate: subCategory.createdate?.toISOString().split('T')[0] || '',
      createdby: subCategory.createdby || '',
      updatedate: subCategory.updatedate?.toISOString().split('T')[0] || '',
      updatedby: subCategory.updatedby || '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const model = tx
      ? tx.product_sub_categories
      : prisma.product_sub_categories;

    const existingSubCategory = await model.findFirst({
      where: {
        sub_category_name: data.sub_category_name,
        product_category_id: data.product_category_id,
      },
    });

    if (existingSubCategory) {
      return `Product sub category "${data.sub_category_name}" already exists for this product category`;
    }

    return null;
  }

  protected async transformDataForImport(
    data: any,
    userId: number
  ): Promise<any> {
    return {
      sub_category_name: data.sub_category_name,
      product_category_id: data.product_category_id,
      description: data.description || null,
      is_active: data.is_active || 'Y',
      createdate: new Date(),
      createdby: userId,
      log_inst: 1,
    };
  }

  protected async validateForeignKeys(data: any[]): Promise<string | null> {
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
    const model = tx
      ? tx.product_sub_categories
      : prisma.product_sub_categories;

    // Find existing record based on unique fields
    const existing = await model.findFirst({
      where: {
        sub_category_name: data.sub_category_name,
        product_category_id: data.product_category_id,
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
        product_category: true,
      },
    };

    if (options.limit) query.take = options.limit;

    const data = await this.getModel().findMany(query);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(this.displayName);

    const exportColumns = [
      ...this.columns,
      {
        header: 'Product Category Name',
        key: 'product_category_name',
        width: 25,
      },
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
        product_category_name:
          data[index]?.product_category?.category_name || '',
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
