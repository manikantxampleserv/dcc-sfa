import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import { Prisma } from '@prisma/client';
import prisma from '../../../configs/prisma.client';

export class PromotionsImportExportService extends ImportExportService<any> {
  protected modelName = 'promotions' as const;
  protected displayName = 'Promotions';
  protected uniqueFields = ['code'];
  protected searchFields = ['name', 'code', 'type', 'description'];

  private async generatePromotionCode(name: string, tx?: any): Promise<string> {
    try {
      const client = tx || prisma;
      const prefix = name
        .slice(0, 3)
        .toUpperCase()
        .replace(/[^A-Z]/g, 'X');

      const lastPromotion = await client.promotions.findFirst({
        orderBy: { id: 'desc' },
        select: { code: true },
      });

      let newNumber = 1;
      if (lastPromotion && lastPromotion.code) {
        const match = lastPromotion.code.match(/(\d+)$/);
        if (match) {
          newNumber = parseInt(match[1], 10) + 1;
        }
      }

      const code = `${prefix}${newNumber.toString().padStart(4, '0')}`;

      const existingCode = await client.promotions.findFirst({
        where: { code: code },
      });

      if (existingCode) {
        newNumber++;
        return `${prefix}${newNumber.toString().padStart(4, '0')}`;
      }

      return code;
    } catch (error) {
      console.error('Error generating promotion code:', error);
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
      header: 'Promotion Name',
      width: 30,
      required: true,
      type: 'string',
      validation: value => {
        if (!value || value.length < 2)
          return 'Promotion name must be at least 2 characters';
        if (value.length > 255)
          return 'Promotion name must be less than 255 characters';
        return true;
      },
      description: 'Name of the promotion (required, 2-255 characters)',
    },
    {
      key: 'type',
      header: 'Promotion Type',
      width: 20,
      required: true,
      type: 'string',
      validation: value => {
        if (!value) return 'Promotion type is required';
        if (value.length > 30)
          return 'Promotion type must be less than 30 characters';
        const validTypes = [
          'discount',
          'bogo',
          'bundle',
          'cashback',
          'seasonal',
          'clearance',
          'loyalty',
          'referral',
          'volume',
          'flash_sale',
        ];
        return (
          validTypes.includes(value.toLowerCase()) ||
          `Promotion type should be one of: ${validTypes.join(', ')}`
        );
      },
      transform: value => (value ? value.toLowerCase() : null),
      description:
        'Type of promotion: discount, bogo, bundle, cashback, seasonal, clearance, loyalty, referral, volume, flash_sale (required)',
    },
    {
      key: 'description',
      header: 'Description',
      width: 50,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 2000 ||
        'Description must be less than 2000 characters',
      description:
        'Detailed description of the promotion (optional, max 2000 chars)',
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
      description: 'Promotion start date (required, YYYY-MM-DD)',
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
      description: 'Promotion end date (required, YYYY-MM-DD)',
    },
    {
      key: 'depot_id',
      header: 'Depot ID',
      width: 15,
      type: 'number',
      validation: value => {
        if (!value) return true;
        const id = parseInt(value);
        if (isNaN(id) || id <= 0) return 'Depot ID must be a positive number';
        return true;
      },
      transform: value => (value ? parseInt(value) : null),
      description: 'ID of the depot (optional)',
    },
    {
      key: 'zone_id',
      header: 'Zone ID',
      width: 15,
      type: 'number',
      validation: value => {
        if (!value) return true;
        const id = parseInt(value);
        if (isNaN(id) || id <= 0) return 'Zone ID must be a positive number';
        return true;
      },
      transform: value => (value ? parseInt(value) : null),
      description: 'ID of the zone (optional)',
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
    const depots = await prisma.depots.findMany({
      take: 2,
      select: { id: true, name: true },
      orderBy: { id: 'asc' },
    });
    const zones = await prisma.zones.findMany({
      take: 2,
      select: { id: true, name: true },
      orderBy: { id: 'asc' },
    });

    const depotIds = depots.map(d => d.id);
    const zoneIds = zones.map(z => z.id);

    const depotId1 = depotIds[0] || null;
    const depotId2 = depotIds[1] || null;
    const zoneId1 = zoneIds[0] || null;
    const zoneId2 = zoneIds[1] || null;

    return [
      {
        name: 'New Year Sale 2024',
        type: 'seasonal',
        description: 'Special discount for New Year celebration',
        start_date: '2024-01-01',
        end_date: '2024-01-31',
        depot_id: depotId1,
        zone_id: zoneId1,
        is_active: 'Y',
      },
      {
        name: 'Buy One Get One Free',
        type: 'bogo',
        description: 'Purchase one product and get another free',
        start_date: '2024-02-01',
        end_date: '2024-02-28',
        depot_id: depotId2,
        zone_id: zoneId2,
        is_active: 'Y',
      },
      {
        name: 'Summer Flash Sale',
        type: 'flash_sale',
        description: '24-hour flash sale with up to 50% discount',
        start_date: '2024-06-15',
        end_date: '2024-06-16',
        depot_id: null,
        zone_id: null,
        is_active: 'Y',
      },
      {
        name: 'Volume Discount Program',
        type: 'volume',
        description: 'Bulk purchase discount for corporate clients',
        start_date: '2024-03-01',
        end_date: '2024-12-31',
        depot_id: depotId1,
        zone_id: null,
        is_active: 'Y',
      },
    ];
  }

  protected getColumnDescription(key: string): string {
    const column = this.columns.find(col => col.key === key);
    return column?.description || '';
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(promo => ({
      name: promo.name,
      code: promo.code,
      type: promo.type,
      description: promo.description || '',
      start_date: promo.start_date
        ? new Date(promo.start_date).toISOString().split('T')[0]
        : '',
      end_date: promo.end_date
        ? new Date(promo.end_date).toISOString().split('T')[0]
        : '',
      depot_id: promo.depot_id || '',
      depot_name: promo.promotion_depots?.name || '',
      zone_id: promo.zone_id || '',
      zone_name: promo.promotion_zones?.name || '',
      is_active: promo.is_active || 'Y',
      created_date: promo.createdate
        ? new Date(promo.createdate).toISOString().split('T')[0]
        : '',
      created_by: promo.createdby || '',
      updated_date: promo.updatedate
        ? new Date(promo.updatedate).toISOString().split('T')[0]
        : '',
      updated_by: promo.updatedby || '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const model = tx ? tx.promotions : prisma.promotions;

    if (data.name && data.start_date && data.end_date) {
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);

      const allPromotions = await model.findMany({
        select: {
          id: true,
          name: true,
          start_date: true,
          end_date: true,
        },
      });

      const existingPromo = allPromotions.find(
        (p: any) =>
          p.name.toLowerCase() === data.name.toLowerCase() &&
          new Date(p.start_date) <= endDate &&
          new Date(p.end_date) >= startDate
      );

      if (existingPromo) {
        return `Promotion with name "${data.name}" already exists with overlapping dates`;
      }
    }

    return null;
  }

  protected async validateForeignKeys(
    data: any,
    tx?: any
  ): Promise<string | null> {
    const prismaClient = tx || prisma;

    if (data.depot_id) {
      try {
        const depot = await prismaClient.depots.findUnique({
          where: { id: data.depot_id },
        });
        if (!depot) {
          return `Depot with ID ${data.depot_id} does not exist`;
        }
      } catch (error) {
        return `Invalid Depot ID ${data.depot_id}`;
      }
    }

    if (data.zone_id) {
      try {
        const zone = await prismaClient.zones.findUnique({
          where: { id: data.zone_id },
        });
        if (!zone) {
          return `Zone with ID ${data.zone_id} does not exist`;
        }
      } catch (error) {
        return `Invalid Zone ID ${data.zone_id}`;
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
    return {
      name: data.name,
      type: data.type,
      description: data.description || null,
      start_date: data.start_date,
      end_date: data.end_date,
      depot_id: data.depot_id || null,
      zone_id: data.zone_id || null,
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
        const generatedCode = await this.generatePromotionCode(row.name);
        preparedData.code = generatedCode;

        const created = await prisma.promotions.create({
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
    const model = tx ? tx.promotions : prisma.promotions;

    const allPromotions = await model.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        description: true,
        start_date: true,
        end_date: true,
        depot_id: true,
        zone_id: true,
        is_active: true,
      },
    });

    const existing = allPromotions.find(
      (p: any) => p.name.toLowerCase() === data.name.toLowerCase()
    );

    if (!existing) return null;

    const updateData: any = {
      name: data.name,
      type: data.type || existing.type,
      description:
        data.description !== undefined
          ? data.description
          : existing.description,
      start_date: data.start_date || existing.start_date,
      end_date: data.end_date || existing.end_date,
      depot_id: data.depot_id !== undefined ? data.depot_id : existing.depot_id,
      zone_id: data.zone_id !== undefined ? data.zone_id : existing.zone_id,
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
      orderBy: options.orderBy || { start_date: 'desc' },
      include: {
        promotion_depots: {
          select: {
            name: true,
            code: true,
          },
        },
        promotion_zones: {
          select: {
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            promotion_customer_types_promotions: true,
            promotion_parameters_promotions: true,
            products_promotion_products: true,
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
      { header: 'Promotion ID', key: 'id', width: 12 },
      ...this.columns,
      { header: 'Depot Name', key: 'depot_name', width: 25 },
      { header: 'Zone Name', key: 'zone_name', width: 25 },
      {
        header: 'Customer Types Count',
        key: 'customer_types_count',
        width: 20,
      },
      { header: 'Parameters Count', key: 'parameters_count', width: 18 },
      { header: 'Products Count', key: 'products_count', width: 15 },
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
    let totalPromotions = 0;
    let activePromotions = 0;
    let inactivePromotions = 0;
    let ongoingPromotions = 0;
    let upcomingPromotions = 0;
    let expiredPromotions = 0;
    const typeCount: any = {};

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    exportData.forEach((row: any, index: number) => {
      const promo = data[index] as any;

      row.id = promo.id;
      row.depot_name = promo.promotion_depots?.name || '';
      row.zone_name = promo.promotion_zones?.name || '';
      row.customer_types_count =
        promo._count?.promotion_customer_types_promotions || 0;
      row.parameters_count = promo._count?.promotion_parameters_promotions || 0;
      row.products_count = promo._count?.products_promotion_products || 0;

      totalPromotions++;
      if (promo.is_active === 'Y') activePromotions++;
      if (promo.is_active === 'N') inactivePromotions++;

      // Check if ongoing, upcoming, or expired
      const startDate = new Date(promo.start_date);
      const endDate = new Date(promo.end_date);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      if (startDate <= today && endDate >= today) {
        ongoingPromotions++;
      } else if (startDate > today) {
        upcomingPromotions++;
      } else if (endDate < today) {
        expiredPromotions++;
      }

      // Count by type
      if (promo.type) {
        typeCount[promo.type] = (typeCount[promo.type] || 0) + 1;
      }

      const excelRow = worksheet.addRow(row);

      // Alternate row colors
      if (index % 2 === 0) {
        excelRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF2F2F2' },
        };
      }

      // Add borders
      excelRow.eachCell((cell: any) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });

      // Highlight inactive promotions
      if (promo.is_active === 'N') {
        excelRow.getCell('is_active').font = {
          color: { argb: 'FFFF0000' },
          bold: true,
        };
      }

      // Highlight ongoing promotions
      if (startDate <= today && endDate >= today) {
        excelRow.getCell('start_date').font = {
          color: { argb: 'FF008000' },
          bold: true,
        };
        excelRow.getCell('end_date').font = {
          color: { argb: 'FF008000' },
          bold: true,
        };
      }

      // Highlight expired promotions
      if (endDate < today) {
        excelRow.getCell('end_date').font = {
          color: { argb: 'FFFF0000' },
          bold: true,
        };
      }

      // Highlight upcoming promotions
      if (startDate > today) {
        excelRow.getCell('start_date').font = {
          color: { argb: 'FF0000FF' },
          bold: true,
        };
      }
    });

    // Add filters
    if (data.length > 0) {
      worksheet.autoFilter = {
        from: 'A1',
        to: `${String.fromCharCode(64 + exportColumns.length)}${data.length + 1}`,
      };
    }

    // Freeze header row
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    // Add summary sheet
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

    // Add summary data
    summarySheet.addRow({ metric: 'Total Promotions', value: totalPromotions });
    summarySheet.addRow({
      metric: 'Active Promotions',
      value: activePromotions,
    });
    summarySheet.addRow({
      metric: 'Inactive Promotions',
      value: inactivePromotions,
    });
    summarySheet.addRow({ metric: '', value: '' });

    summarySheet.addRow({
      metric: 'Ongoing Promotions',
      value: ongoingPromotions,
    });
    summarySheet.addRow({
      metric: 'Upcoming Promotions',
      value: upcomingPromotions,
    });
    summarySheet.addRow({
      metric: 'Expired Promotions',
      value: expiredPromotions,
    });
    summarySheet.addRow({ metric: '', value: '' });

    summarySheet.addRow({ metric: 'Promotion Type Breakdown', value: '' });
    Object.keys(typeCount)
      .sort((a, b) => typeCount[b] - typeCount[a])
      .forEach(type => {
        summarySheet.addRow({
          metric: `  ${type.charAt(0).toUpperCase() + type.slice(1)}`,
          value: typeCount[type],
        });
      });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
