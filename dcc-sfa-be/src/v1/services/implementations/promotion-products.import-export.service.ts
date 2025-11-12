import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import { Prisma } from '@prisma/client';
import prisma from '../../../configs/prisma.client';

export class PromotionProductsImportExportService extends ImportExportService<any> {
  protected modelName = 'promotion_products' as const;
  protected displayName = 'Promotion Products';
  protected uniqueFields = ['promotion_id', 'product_id'];
  protected searchFields = [];

  protected columns: ColumnDefinition[] = [
    {
      key: 'promotion_id',
      header: 'Promotion ID',
      width: 15,
      required: true,
      type: 'number',
      validation: value => {
        if (!value) return 'Promotion ID is required';
        const id = parseInt(value);
        if (isNaN(id) || id <= 0)
          return 'Promotion ID must be a positive number';
        return true;
      },
      transform: value => parseInt(value),
      description: 'ID of the promotion (required)',
    },
    {
      key: 'product_id',
      header: 'Product ID',
      width: 15,
      required: true,
      type: 'number',
      validation: value => {
        if (!value) return 'Product ID is required';
        const id = parseInt(value);
        if (isNaN(id) || id <= 0) return 'Product ID must be a positive number';
        return true;
      },
      transform: value => parseInt(value),
      description: 'ID of the product included in promotion (required)',
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
    // Fetch actual IDs from database to ensure validity
    const promotions = await prisma.promotions.findMany({
      take: 3,
      select: { id: true, name: true },
      orderBy: { id: 'asc' },
    });
    const products = await prisma.products.findMany({
      take: 5,
      select: { id: true, name: true },
      orderBy: { id: 'asc' },
    });

    const promotionIds = promotions.map(p => p.id);
    const productIds = products.map(p => p.id);

    const promoId1 = promotionIds[0] || 1;
    const promoId2 = promotionIds[1] || 2;
    const promoId3 = promotionIds[2] || 3;
    const productId1 = productIds[0] || 1;
    const productId2 = productIds[1] || 2;
    const productId3 = productIds[2] || 3;
    const productId4 = productIds[3] || 4;
    const productId5 = productIds[4] || 5;

    return [
      {
        promotion_id: promoId1,
        product_id: productId1,
        is_active: 'Y',
      },
      {
        promotion_id: promoId1,
        product_id: productId2,
        is_active: 'Y',
      },
      {
        promotion_id: promoId2,
        product_id: productId3,
        is_active: 'Y',
      },
      {
        promotion_id: promoId2,
        product_id: productId4,
        is_active: 'Y',
      },
      {
        promotion_id: promoId3,
        product_id: productId5,
        is_active: 'Y',
      },
    ];
  }

  protected getColumnDescription(key: string): string {
    const column = this.columns.find(col => col.key === key);
    return column?.description || '';
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(pp => ({
      promotion_id: pp.promotion_id || '',
      promotion_name: pp.products_promotion_products?.name || '',
      promotion_code: pp.products_promotion_products?.code || '',
      promotion_type: pp.products_promotion_products?.type || '',
      promotion_start_date: pp.products_promotion_products?.start_date
        ? new Date(pp.products_promotion_products.start_date)
            .toISOString()
            .split('T')[0]
        : '',
      promotion_end_date: pp.products_promotion_products?.end_date
        ? new Date(pp.products_promotion_products.end_date)
            .toISOString()
            .split('T')[0]
        : '',
      product_id: pp.product_id || '',
      product_name: pp.promotion_products_products?.name || '',
      product_code: pp.promotion_products_products?.code || '',
      product_category:
        pp.promotion_products_products?.product_categories_products
          ?.category_name || '',
      product_brand: pp.promotion_products_products?.product_brands?.name || '',
      is_active: pp.is_active || 'Y',
      created_date: pp.createdate
        ? new Date(pp.createdate).toISOString().split('T')[0]
        : '',
      created_by: pp.createdby || '',
      updated_date: pp.updatedate
        ? new Date(pp.updatedate).toISOString().split('T')[0]
        : '',
      updated_by: pp.updatedby || '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const model = tx ? tx.promotion_products : prisma.promotion_products;

    if (data.promotion_id && data.product_id) {
      const existing = await model.findFirst({
        where: {
          promotion_id: data.promotion_id,
          product_id: data.product_id,
        },
      });

      if (existing) {
        return `Product ID ${data.product_id} is already linked to Promotion ID ${data.promotion_id}`;
      }
    }

    return null;
  }

  protected async validateForeignKeys(
    data: any,
    tx?: any
  ): Promise<string | null> {
    const prismaClient = tx || prisma;

    if (data.promotion_id) {
      try {
        const promotion = await prismaClient.promotions.findUnique({
          where: { id: data.promotion_id },
        });
        if (!promotion) {
          return `Promotion with ID ${data.promotion_id} does not exist`;
        }
        if (promotion.is_active === 'N') {
          return `Promotion with ID ${data.promotion_id} is inactive`;
        }
      } catch (error) {
        return `Invalid Promotion ID ${data.promotion_id}`;
      }
    }

    if (data.product_id) {
      try {
        const product = await prismaClient.products.findUnique({
          where: { id: data.product_id },
        });
        if (!product) {
          return `Product with ID ${data.product_id} does not exist`;
        }
        if (product.is_active === 'N') {
          return `Product with ID ${data.product_id} is inactive`;
        }
      } catch (error) {
        return `Invalid Product ID ${data.product_id}`;
      }
    }

    return null;
  }

  protected async prepareDataForImport(
    data: any,
    userId: number
  ): Promise<any> {
    return {
      promotion_id: data.promotion_id,
      product_id: data.product_id,
      is_active: data.is_active || 'Y',
      createdby: userId,
      createdate: new Date(),
      log_inst: 1,
    };
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

        const created = await prisma.promotion_products.create({
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
                : errorMessage.includes('already linked')
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
    const model = tx ? tx.promotion_products : prisma.promotion_products;

    const existing = await model.findFirst({
      where: {
        promotion_id: data.promotion_id,
        product_id: data.product_id,
      },
    });

    if (!existing) return null;

    const updateData: any = {
      is_active: data.is_active || existing.is_active,
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
      orderBy: options.orderBy || { createdate: 'desc' },
      include: {
        products_promotion_products: {
          select: {
            name: true,
            code: true,
            type: true,
            start_date: true,
            end_date: true,
            is_active: true,
          },
        },
        promotion_products_products: {
          select: {
            name: true,
            code: true,
            base_price: true,
            is_active: true,
            product_categories_products: {
              select: {
                category_name: true,
              },
            },
            product_brands: {
              select: {
                name: true,
              },
            },
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
      { header: 'ID', key: 'id', width: 12 },
      ...this.columns,
      { header: 'Promotion Name', key: 'promotion_name', width: 30 },
      { header: 'Promotion Code', key: 'promotion_code', width: 20 },
      { header: 'Promotion Type', key: 'promotion_type', width: 20 },
      {
        header: 'Promotion Start Date',
        key: 'promotion_start_date',
        width: 20,
      },
      { header: 'Promotion End Date', key: 'promotion_end_date', width: 20 },
      { header: 'Product Name', key: 'product_name', width: 30 },
      { header: 'Product Code', key: 'product_code', width: 20 },
      { header: 'Product Category', key: 'product_category', width: 20 },
      { header: 'Product Brand', key: 'product_brand', width: 20 },
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
    let totalLinks = 0;
    let activeLinks = 0;
    let inactiveLinks = 0;
    const promotionCount: any = {};
    const productCategoryCount: any = {};
    const promotionTypeCount: any = {};

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    exportData.forEach((row: any, index: number) => {
      const pp = data[index] as any;

      row.id = pp.id;
      row.promotion_name = pp.products_promotion_products?.name || '';
      row.promotion_code = pp.products_promotion_products?.code || '';
      row.promotion_type = pp.products_promotion_products?.type || '';
      row.promotion_start_date = pp.products_promotion_products?.start_date
        ? new Date(pp.products_promotion_products.start_date)
            .toISOString()
            .split('T')[0]
        : '';
      row.promotion_end_date = pp.products_promotion_products?.end_date
        ? new Date(pp.products_promotion_products.end_date)
            .toISOString()
            .split('T')[0]
        : '';
      row.product_name = pp.promotion_products_products?.name || '';
      row.product_code = pp.promotion_products_products?.code || '';
      row.product_category =
        pp.promotion_products_products?.product_categories_products
          ?.category_name || '';
      row.product_brand =
        pp.promotion_products_products?.product_brands?.name || '';

      totalLinks++;
      if (pp.is_active === 'Y') activeLinks++;
      if (pp.is_active === 'N') inactiveLinks++;

      const promoName = pp.products_promotion_products?.name || 'Unknown';
      promotionCount[promoName] = (promotionCount[promoName] || 0) + 1;

      const category =
        pp.promotion_products_products?.product_categories_products
          ?.category_name || 'Unknown';
      productCategoryCount[category] =
        (productCategoryCount[category] || 0) + 1;

      const promoType = pp.products_promotion_products?.type || 'Unknown';
      promotionTypeCount[promoType] = (promotionTypeCount[promoType] || 0) + 1;
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

      if (pp.is_active === 'N') {
        excelRow.getCell('is_active').font = {
          color: { argb: 'FFFF0000' },
          bold: true,
        };
      }

      if (pp.products_promotion_products?.is_active === 'N') {
        excelRow.getCell('promotion_name').font = {
          color: { argb: 'FFFF0000' },
          bold: true,
        };
      }

      if (pp.promotion_products_products?.is_active === 'N') {
        excelRow.getCell('product_name').font = {
          color: { argb: 'FFFF0000' },
          bold: true,
        };
      }

      if (
        pp.products_promotion_products?.end_date &&
        new Date(pp.products_promotion_products.end_date) < today
      ) {
        excelRow.getCell('promotion_end_date').font = {
          color: { argb: 'FFFF0000' },
          bold: true,
        };
      }

      if (
        pp.products_promotion_products?.start_date &&
        pp.products_promotion_products?.end_date
      ) {
        const startDate = new Date(pp.products_promotion_products.start_date);
        const endDate = new Date(pp.products_promotion_products.end_date);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        if (startDate <= today && endDate >= today) {
          excelRow.getCell('promotion_start_date').font = {
            color: { argb: 'FF008000' },
            bold: true,
          };
          excelRow.getCell('promotion_end_date').font = {
            color: { argb: 'FF008000' },
            bold: true,
          };
        }
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
      { header: 'Metric', key: 'metric', width: 40 },
      { header: 'Value', key: 'value', width: 20 },
    ];

    const summaryHeaderRow = summarySheet.getRow(1);
    summaryHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    summaryHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };

    summarySheet.addRow({
      metric: 'Total Promotion-Product Links',
      value: totalLinks,
    });
    summarySheet.addRow({ metric: 'Active Links', value: activeLinks });
    summarySheet.addRow({ metric: 'Inactive Links', value: inactiveLinks });
    summarySheet.addRow({ metric: '', value: '' });

    summarySheet.addRow({ metric: 'Products Per Promotion', value: '' });
    Object.keys(promotionCount)
      .sort((a, b) => promotionCount[b] - promotionCount[a])
      .forEach(promo => {
        summarySheet.addRow({
          metric: `  ${promo}`,
          value: promotionCount[promo],
        });
      });
    summarySheet.addRow({ metric: '', value: '' });

    summarySheet.addRow({ metric: 'Products by Category', value: '' });
    Object.keys(productCategoryCount)
      .sort((a, b) => productCategoryCount[b] - productCategoryCount[a])
      .forEach(category => {
        summarySheet.addRow({
          metric: `  ${category}`,
          value: productCategoryCount[category],
        });
      });
    summarySheet.addRow({ metric: '', value: '' });

    summarySheet.addRow({ metric: 'Products by Promotion Type', value: '' });
    Object.keys(promotionTypeCount)
      .sort((a, b) => promotionTypeCount[b] - promotionTypeCount[a])
      .forEach(type => {
        summarySheet.addRow({
          metric: `  ${type.charAt(0).toUpperCase() + type.slice(1)}`,
          value: promotionTypeCount[type],
        });
      });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
