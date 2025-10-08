import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export class ProductsImportExportService extends ImportExportService<any> {
  protected modelName = 'products' as const;
  protected displayName = 'Products';
  protected uniqueFields = ['code'];
  protected searchFields = [
    'name',
    'code',
    'description',
    'category',
    'brand',
    'unit_of_measure',
  ];

  private async generateProductCode(name: string, tx?: any): Promise<string> {
    try {
      const client = tx || prisma;
      const prefix = name
        .slice(0, 3)
        .toUpperCase()
        .replace(/[^A-Z]/g, 'X');

      const lastProduct = await client.products.findFirst({
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

      const existingCode = await client.products.findFirst({
        where: { code: code },
      });

      if (existingCode) {
        newNumber++;
        return `${prefix}${newNumber.toString().padStart(3, '0')}`;
      }

      return code;
    } catch (error) {
      console.error('Error generating product code:', error);
      const prefix = name
        .slice(0, 3)
        .toUpperCase()
        .replace(/[^A-Z]/g, 'X');
      const timestamp = Date.now().toString().slice(-6);
      return `${prefix}${timestamp}`;
    }
  }

  protected columns: ColumnDefinition[] = [
    {
      key: 'name',
      header: 'Product Name',
      width: 30,
      required: true,
      type: 'string',
      validation: value => {
        if (!value || value.length < 2)
          return 'Product name must be at least 2 characters';
        if (value.length > 255)
          return 'Product name must be less than 255 characters';
        return true;
      },
      description: 'Name of the product (required, 2-255 characters)',
    },
    {
      key: 'description',
      header: 'Description',
      width: 40,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 1000 ||
        'Description must be less than 1000 characters',
      description: 'Product description (optional, max 1000 chars)',
    },
    {
      key: 'category',
      header: 'Category',
      width: 25,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 100 ||
        'Category must be less than 100 characters',
      description: 'Product category (optional, max 100 chars)',
    },
    {
      key: 'brand',
      header: 'Brand',
      width: 25,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 100 ||
        'Brand must be less than 100 characters',
      description: 'Product brand (optional, max 100 chars)',
    },
    {
      key: 'unit_of_measure',
      header: 'Unit of Measure',
      width: 20,
      type: 'string',
      validation: value => {
        if (!value) return true;
        if (value.length > 50)
          return 'Unit of measure must be less than 50 characters';
        const validUnits = [
          'PCS',
          'KG',
          'LTR',
          'MTR',
          'BOX',
          'PACK',
          'DOZEN',
          'CASE',
          'BOTTLE',
          'CAN',
          'GRAM',
          'POUND',
          'GALLON',
          'UNIT',
        ];
        if (!validUnits.includes(value.toUpperCase())) {
          return `Unit of measure should be one of: ${validUnits.join(', ')}`;
        }
        return true;
      },
      transform: value => (value ? value.toUpperCase() : null),
      description:
        'Unit of measurement: PCS, KG, LTR, MTR, BOX, PACK, DOZEN, CASE, BOTTLE, CAN, GRAM, POUND, GALLON, UNIT (optional)',
    },
    {
      key: 'base_price',
      header: 'Base Price',
      width: 15,
      type: 'number',
      validation: value => {
        if (!value) return true;
        const price = parseFloat(value);
        if (isNaN(price)) return 'Base price must be a number';
        if (price < 0) return 'Base price cannot be negative';
        if (price > 9999999999999999.99)
          return 'Base price exceeds maximum allowed value';
        return true;
      },
      transform: value => (value ? parseFloat(value) : null),
      description:
        'Base selling price (optional, positive number, max 9999999999999999.99)',
    },
    {
      key: 'tax_rate',
      header: 'Tax Rate (%)',
      width: 15,
      type: 'number',
      validation: value => {
        if (!value) return true;
        const rate = parseFloat(value);
        if (isNaN(rate)) return 'Tax rate must be a number';
        if (rate < 0) return 'Tax rate cannot be negative';
        if (rate > 100) return 'Tax rate cannot exceed 100%';
        return true;
      },
      transform: value => (value ? parseFloat(value) : null),
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
        name: 'Coca Cola 500ml',
        description: 'Refreshing cola drink in 500ml bottle',
        category: 'Beverages',
        brand: 'Coca Cola',
        unit_of_measure: 'BOTTLE',
        base_price: 2.5,
        tax_rate: 10.0,
        is_active: 'Y',
      },
    ];
  }

  protected getColumnDescription(key: string): string {
    const column = this.columns.find(col => col.key === key);
    return column?.description || '';
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(product => ({
      name: product.name,
      code: product.code,
      description: product.description || '',
      category: product.category || '',
      brand: product.brand || '',
      unit_of_measure: product.unit_of_measure || '',
      base_price: product.base_price ? product.base_price.toString() : '',
      tax_rate: product.tax_rate ? product.tax_rate.toString() : '',
      is_active: product.is_active || 'Y',
      created_date: product.createdate
        ? new Date(product.createdate).toISOString().split('T')[0]
        : '',
      created_by: product.createdby || '',
      updated_date: product.updatedate
        ? new Date(product.updatedate).toISOString().split('T')[0]
        : '',
      updated_by: product.updatedby || '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const model = tx ? tx.products : prisma.products;

    if (data.name && data.brand) {
      const existingNameBrand = await model.findFirst({
        where: {
          name: data.name,
          brand: data.brand,
        },
      });

      if (existingNameBrand) {
        return `Product with name "${data.name}" already exists for brand "${data.brand}"`;
      }
    }

    if (data.name && !data.brand) {
      const existingName = await model.findFirst({
        where: {
          name: data.name,
        },
      });

      if (existingName) {
        return `Product with name "${data.name}" already exists`;
      }
    }

    return null;
  }

  protected async validateForeignKeys(
    data: any,
    tx?: any
  ): Promise<string | null> {
    return null;
  }

  protected async prepareDataForImport(
    data: any,
    userId: number
  ): Promise<any> {
    const preparedData: any = {
      name: data.name,
      description: data.description || null,
      category: data.category || null,
      brand: data.brand || null,
      unit_of_measure: data.unit_of_measure || null,
      is_active: data.is_active || 'Y',
      createdby: userId,
      createdate: new Date(),
      log_inst: 1,
    };

    if (data.base_price !== null && data.base_price !== undefined) {
      preparedData.base_price = new Prisma.Decimal(data.base_price);
    }

    if (data.tax_rate !== null && data.tax_rate !== undefined) {
      preparedData.tax_rate = new Prisma.Decimal(data.tax_rate);
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
        const result = await prisma.$transaction(async tx => {
          const duplicateCheck = await this.checkDuplicate(row, tx);

          if (duplicateCheck) {
            if (options.skipDuplicates) {
              throw new Error(`Skipped - ${duplicateCheck}`);
            } else if (options.updateExisting) {
              return await this.updateExisting(row, userId, tx);
            } else {
              throw new Error(duplicateCheck);
            }
          }

          const fkValidation = await this.validateForeignKeys(row, tx);
          if (fkValidation) {
            throw new Error(fkValidation);
          }

          const preparedData = await this.prepareDataForImport(row, userId);

          const generatedCode = await this.generateProductCode(row.name, tx);
          preparedData.code = generatedCode;

          const created = await tx.products.create({
            data: preparedData,
          });

          return created;
        });

        if (result) {
          importedData.push(result);
          success++;
        }
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
    const model = tx ? tx.products : prisma.products;

    const existing = await model.findFirst({
      where: {
        name: data.name,
        brand: data.brand || undefined,
      },
    });

    if (!existing) return null;

    const updateData: any = {
      name: data.name,
      description:
        data.description !== undefined
          ? data.description
          : existing.description,
      category: data.category !== undefined ? data.category : existing.category,
      brand: data.brand !== undefined ? data.brand : existing.brand,
      unit_of_measure:
        data.unit_of_measure !== undefined
          ? data.unit_of_measure
          : existing.unit_of_measure,
      is_active: data.is_active || existing.is_active,
      updatedby: userId,
      updatedate: new Date(),
    };

    if (data.base_price !== null && data.base_price !== undefined) {
      updateData.base_price = new Prisma.Decimal(data.base_price);
    }

    if (data.tax_rate !== null && data.tax_rate !== undefined) {
      updateData.tax_rate = new Prisma.Decimal(data.tax_rate);
    }

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
        _count: {
          select: {
            batch_lots_products: true,
            inventory_stock_products: true,
            invoice_items_products: true,
            order_items: true,
            price_history_products: true,
            pricelist_items_products: true,
            stock_movements_products: true,
            serial_numbers_products: true,
            warranty_claims_products: true,
            van_inventory_products: true,
            return_requests_products: true,
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
      { header: 'Product Code', key: 'code', width: 20 },
      ...this.columns,
      { header: 'Total Batches', key: 'total_batches', width: 15 },
      { header: 'Stock Locations', key: 'stock_locations', width: 15 },
      { header: 'Invoice Items', key: 'invoice_items', width: 15 },
      { header: 'Order Items', key: 'order_items', width: 15 },
      { header: 'Price History', key: 'price_history', width: 15 },
      { header: 'Stock Movements', key: 'stock_movements', width: 15 },
      { header: 'Serial Numbers', key: 'serial_numbers', width: 15 },
      { header: 'Warranty Claims', key: 'warranty_claims', width: 15 },
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
    let totalProducts = 0;
    let totalBasePrice = 0;
    let activeCount = 0;
    let inactiveCount = 0;
    const categoryCount: any = {};
    const brandCount: any = {};

    exportData.forEach((row: any, index: number) => {
      const product = data[index] as any;

      row.total_batches = product._count?.batch_lots_products || 0;
      row.stock_locations = product._count?.inventory_stock_products || 0;
      row.invoice_items = product._count?.invoice_items_products || 0;
      row.order_items = product._count?.order_items || 0;
      row.price_history = product._count?.price_history_products || 0;
      row.stock_movements = product._count?.stock_movements_products || 0;
      row.serial_numbers = product._count?.serial_numbers_products || 0;
      row.warranty_claims = product._count?.warranty_claims_products || 0;

      if (product.base_price) {
        totalBasePrice += parseFloat(product.base_price.toString());
      }
      if (product.is_active === 'Y') {
        activeCount++;
      } else {
        inactiveCount++;
      }

      if (product.category) {
        categoryCount[product.category] =
          (categoryCount[product.category] || 0) + 1;
      }
      if (product.brand) {
        brandCount[product.brand] = (brandCount[product.brand] || 0) + 1;
      }

      totalProducts++;

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

      if (product.is_active === 'N') {
        excelRow.getCell('is_active').font = { color: { argb: 'FFFF0000' } };
      }

      if (
        product.base_price &&
        parseFloat(product.base_price.toString()) > 1000
      ) {
        excelRow.getCell('base_price').font = {
          color: { argb: 'FF0000FF' },
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

    // Add summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 30 },
      { header: 'Value', key: 'value', width: 20 },
    ];

    const summaryHeaderRow = summarySheet.getRow(1);
    summaryHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    summaryHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };

    summarySheet.addRow({ metric: 'Total Products', value: totalProducts });
    summarySheet.addRow({ metric: 'Active Products', value: activeCount });
    summarySheet.addRow({ metric: 'Inactive Products', value: inactiveCount });
    summarySheet.addRow({
      metric: 'Average Base Price',
      value:
        totalProducts > 0 ? (totalBasePrice / totalProducts).toFixed(2) : 0,
    });
    summarySheet.addRow({ metric: '', value: '' });
    summarySheet.addRow({ metric: 'Categories Breakdown', value: '' });

    Object.keys(categoryCount).forEach(category => {
      summarySheet.addRow({
        metric: `  ${category}`,
        value: categoryCount[category],
      });
    });

    summarySheet.addRow({ metric: '', value: '' });
    summarySheet.addRow({ metric: 'Brands Breakdown', value: '' });

    Object.keys(brandCount).forEach(brand => {
      summarySheet.addRow({ metric: `  ${brand}`, value: brandCount[brand] });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
