import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import { PrismaClient } from '@prisma/client';
import * as ExcelJS from 'exceljs';

const prisma = new PrismaClient();

export class ProductsImportExportService extends ImportExportService<any> {
  protected modelName = 'products' as const;
  protected displayName = 'Products';
  protected uniqueFields = ['name'];
  protected searchFields = ['name', 'code', 'description'];

  protected columns: ColumnDefinition[] = [
    {
      key: 'name',
      header: 'Product Name',
      width: 25,
      required: true,
      type: 'string',
      validation: value => {
        if (!value) return 'Product name is required';
        if (value.length < 2)
          return 'Product name must be at least 2 characters';
        if (value.length > 255)
          return 'Product name must not exceed 255 characters';
        return true;
      },
      transform: value => value.toString().trim(),
      description: 'Name of the product (required, 2-255 characters)',
    },
    {
      key: 'description',
      header: 'Description',
      width: 30,
      type: 'string',
      validation: value => {
        if (value && value.length > 1000) {
          return 'Description must not exceed 1000 characters';
        }
        return true;
      },
      transform: value => (value ? value.toString().trim() : null),
      description: 'Description of the product (optional, max 1000 characters)',
    },
    {
      key: 'category_name',
      header: 'Category Name',
      width: 20,
      required: true,
      type: 'string',
      validation: value => {
        if (!value) return 'Category name is required';
        return true;
      },
      transform: value => (value ? value.toString().trim() : null),
      description: 'Name of the product category (required)',
    },
    {
      key: 'brand_name',
      header: 'Brand Name',
      width: 20,
      required: true,
      type: 'string',
      validation: value => {
        if (!value) return 'Brand name is required';
        return true;
      },
      transform: value => (value ? value.toString().trim() : null),
      description: 'Name of the brand (required)',
    },
    {
      key: 'unit_name',
      header: 'Unit Name',
      width: 15,
      required: true,
      type: 'string',
      validation: value => {
        if (!value) return 'Unit name is required';
        return true;
      },
      transform: value => (value ? value.toString().trim() : null),
      description: 'Name of the unit of measurement (required)',
    },
    {
      key: 'base_price',
      header: 'Base Price',
      width: 15,
      type: 'number',
      validation: value => {
        if (value !== null && value !== undefined && value !== '') {
          const numValue = Number(value);
          if (isNaN(numValue)) return 'Base price must be a valid number';
          if (numValue < 0) return 'Base price must be at least 0';
        }
        return true;
      },
      transform: value => (value ? Number(value) : null),
      description: 'Base price of the product (optional, must be >= 0)',
    },
    {
      key: 'tax_rate',
      header: 'Tax Rate (%)',
      width: 15,
      type: 'number',
      validation: value => {
        if (value !== null && value !== undefined && value !== '') {
          const numValue = Number(value);
          if (isNaN(numValue)) return 'Tax rate must be a valid number';
          if (numValue < 0) return 'Tax rate must be at least 0';
          if (numValue > 100) return 'Tax rate cannot exceed 100%';
        }
        return true;
      },
      transform: value => (value ? Number(value) : null),
      description: 'Tax rate percentage (optional, 0-100)',
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
        name: 'Coca Cola Classic',
        description: 'Classic Coca Cola soft drink',
        category_name: 'Food & Beverages',
        brand_name: 'Coca Cola',
        unit_name: 'Case',
        base_price: 1.99,
        tax_rate: 6.0,
        is_active: 'Y',
      },
      {
        name: 'Potato Chips',
        description: 'Crispy potato chips snack',
        category_name: 'Food & Beverages',
        brand_name: 'Generic',
        unit_name: 'Case',
        base_price: 2.49,
        tax_rate: 6.0,
        is_active: 'Y',
      },
      {
        name: 'iPhone 15 Pro',
        description: 'Latest Apple iPhone with advanced camera system',
        category_name: 'Electronics',
        brand_name: 'Apple',
        unit_name: 'Piece',
        base_price: 999.99,
        tax_rate: 8.5,
        is_active: 'Y',
      },
      {
        name: 'Nike Running Shoes',
        description: 'High-performance running shoes',
        category_name: 'Clothing & Fashion',
        brand_name: 'Fashion Brand',
        unit_name: 'Piece',
        base_price: 129.99,
        tax_rate: 8.0,
        is_active: 'Y',
      },
      {
        name: 'Office Chair',
        description: 'Ergonomic office chair with lumbar support',
        category_name: 'Home & Garden',
        brand_name: 'Office Furniture',
        unit_name: 'Piece',
        base_price: 199.99,
        tax_rate: 8.0,
        is_active: 'N',
      },
    ];
  }

  protected getColumnDescription(): string {
    return `
# Products Import Template

## Required Fields:
- **Product Name**: Name of the product (2-255 characters)
- **Category Name**: Name of the product category (must exist in system)
- **Brand Name**: Name of the brand (must exist in system)
- **Unit Name**: Name of the unit of measurement (must exist in system)

## Optional Fields:
- **Description**: Description of the product (max 1000 characters)
- **Base Price**: Base price of the product (must be >= 0)
- **Tax Rate (%)**: Tax rate percentage (0-100)
- **Is Active**: Whether the product is active (Y/N, defaults to Y)

## Notes:
- Product names must be unique across the system.
- Category, Brand, and Unit names must match existing records in the system.
- Base price and tax rate are optional but must be valid numbers if provided.
- Active products are available for orders and sales.
- Inactive products are hidden but preserved for historical data.
    `;
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(product => ({
      name: product.name,
      description: product.description || '',
      category_name: product.product_category?.name || '',
      brand_name: product.product_brand?.name || '',
      unit_name: product.product_unit?.name || '',
      base_price: product.base_price || '',
      tax_rate: product.tax_rate || '',
      is_active: product.is_active || 'Y',
      createdate: product.createdate?.toISOString().split('T')[0] || '',
      createdby: product.createdby || '',
      updatedate: product.updatedate?.toISOString().split('T')[0] || '',
      updatedby: product.updatedby || '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const model = tx ? tx.products : prisma.products;

    const existingProduct = await model.findFirst({
      where: {
        name: data.name,
      },
    });

    if (existingProduct) {
      return `Product "${data.name}" already exists`;
    }

    return null;
  }

  protected async transformDataForImport(
    data: any,
    userId: number
  ): Promise<any> {
    // Find category by name
    const category = await prisma.product_categories.findFirst({
      where: {
        category_name: data.category_name,
      },
    });

    if (!category) {
      throw new Error(`Category "${data.category_name}" not found`);
    }

    // Find brand by name
    const brand = await prisma.brands.findFirst({
      where: {
        name: data.brand_name,
      },
    });

    if (!brand) {
      throw new Error(`Brand "${data.brand_name}" not found`);
    }

    // Find unit by name
    const unit = await prisma.unit_of_measurement.findFirst({
      where: {
        name: data.unit_name,
      },
    });

    if (!unit) {
      throw new Error(`Unit of measurement "${data.unit_name}" not found`);
    }

    // Generate product code
    const prefix = data.name.slice(0, 3).toUpperCase();
    const lastProduct = await prisma.products.findFirst({
      orderBy: { id: 'desc' },
      select: { code: true },
    });

    let newNumber = 1;
    if (lastProduct && lastProduct.code) {
      const match = lastProduct.code.match(/(\d+)$/);
      if (match) {
        newNumber = parseInt(match[1], 10) + 1;
      }
    }

    const code = `${prefix}${newNumber.toString().padStart(3, '0')}`;

    return {
      name: data.name,
      code: code,
      description: data.description || null,
      category_id: category.id,
      brand_id: brand.id,
      unit_of_measurement: unit.id,
      base_price: data.base_price || null,
      tax_rate: data.tax_rate || null,
      is_active: data.is_active || 'Y',
      createdate: new Date(),
      createdby: userId,
      log_inst: 1,
    };
  }

  protected async validateForeignKeys(
    data: any,
    tx?: any
  ): Promise<string | null> {
    const errors: string[] = [];

    // Check category exists
    const category = await prisma.product_categories.findFirst({
      where: { category_name: data.category_name },
    });
    if (!category) {
      errors.push(`Category "${data.category_name}" not found`);
    }

    // Check brand exists
    const brand = await prisma.brands.findFirst({
      where: { name: data.brand_name },
    });
    if (!brand) {
      errors.push(`Brand "${data.brand_name}" not found`);
    }

    // Check unit exists
    const unit = await prisma.unit_of_measurement.findFirst({
      where: { name: data.unit_name },
    });
    if (!unit) {
      errors.push(`Unit of measurement "${data.unit_name}" not found`);
    }

    return errors.length > 0 ? errors.join('; ') : null;
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
    const model = tx ? tx.products : prisma.products;

    // Find existing record based on unique fields
    const existing = await model.findFirst({
      where: {
        name: data.name,
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
        product_brands: true,
        product_unit_of_measurement: true,
        product_categories_products: true,
      },
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
