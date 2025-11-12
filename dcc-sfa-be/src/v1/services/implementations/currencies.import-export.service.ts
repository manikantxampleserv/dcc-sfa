import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import { Prisma } from '@prisma/client';
import prisma from '../../../configs/prisma.client';

export class CurrenciesImportExportService extends ImportExportService<any> {
  protected modelName = 'currencies' as const;
  protected displayName = 'Currencies';
  protected uniqueFields = ['code'];
  protected searchFields = ['code', 'name', 'symbol'];

  private async generateCurrencyCode(name: string, tx?: any): Promise<string> {
    try {
      const client = tx || prisma;
      const prefix = name.slice(0, 3).toUpperCase();

      const lastCurrency = await client.currencies.findFirst({
        orderBy: { id: 'desc' },
        select: { code: true },
      });

      let newNumber = 1;
      if (lastCurrency && lastCurrency.code) {
        const match = lastCurrency.code.match(/(\d+)$/);
        if (match) {
          newNumber = parseInt(match[1], 10) + 1;
        }
      }

      const code = `${prefix}${newNumber.toString().padStart(3, '0')}`;

      const existingCode = await client.currencies.findFirst({
        where: { code: code },
      });

      if (existingCode) {
        newNumber++;
        return `${prefix}${newNumber.toString().padStart(3, '0')}`;
      }

      return code;
    } catch (error) {
      console.error('Error generating currency code:', error);
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
      header: 'Currency Name',
      width: 30,
      required: true,
      type: 'string',
      validation: value => {
        if (!value || value.length < 2)
          return 'Currency name must be at least 2 characters';
        if (value.length > 100)
          return 'Currency name must be less than 100 characters';
        return true;
      },
      description: 'Name of the currency (required, 2-100 characters)',
    },
    {
      key: 'symbol',
      header: 'Currency Symbol',
      width: 15,
      type: 'string',
      validation: value => {
        if (!value) return true;
        if (value.length > 10)
          return 'Currency symbol must be less than 10 characters';
        return true;
      },
      description: 'Currency symbol like $, €, ¥ (optional, max 10 chars)',
    },
    {
      key: 'exchange_rate_to_base',
      header: 'Exchange Rate to Base',
      width: 25,
      type: 'number',
      validation: value => {
        if (!value) return true;
        const rate = parseFloat(value);
        if (isNaN(rate)) return 'Exchange rate must be a number';
        if (rate <= 0) return 'Exchange rate must be positive';
        if (rate > 999999999999.999999)
          return 'Exchange rate exceeds maximum allowed value';
        return true;
      },
      transform: value => (value ? parseFloat(value) : null),
      description:
        'Exchange rate relative to base currency (optional, positive number)',
    },
    {
      key: 'is_base',
      header: 'Is Base Currency',
      width: 18,
      type: 'string',
      defaultValue: 'N',
      validation: value => {
        const upperValue = value ? value.toString().toUpperCase() : 'N';
        return ['Y', 'N'].includes(upperValue) || 'Must be Y or N';
      },
      transform: value => (value ? value.toString().toUpperCase() : 'N'),
      description:
        'Is this the base currency - Y for Yes, N for No (defaults to N)',
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
        name: 'US Dollar',
        symbol: '$',
        exchange_rate_to_base: 1.0,
        is_base: 'Y',
        is_active: 'Y',
      },
      {
        name: 'Euro',
        symbol: '€',
        exchange_rate_to_base: 0.85,
        is_base: 'N',
        is_active: 'Y',
      },
      {
        name: 'British Pound',
        symbol: '£',
        exchange_rate_to_base: 0.73,
        is_base: 'N',
        is_active: 'Y',
      },
      {
        name: 'Japanese Yen',
        symbol: '¥',
        exchange_rate_to_base: 110.0,
        is_base: 'N',
        is_active: 'Y',
      },
      {
        name: 'Indian Rupee',
        symbol: '₹',
        exchange_rate_to_base: 74.5,
        is_base: 'N',
        is_active: 'Y',
      },
    ];
  }

  protected getColumnDescription(key: string): string {
    const column = this.columns.find(col => col.key === key);
    return column?.description || '';
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(currency => ({
      name: currency.name,
      code: currency.code,
      symbol: currency.symbol || '',
      exchange_rate_to_base: currency.exchange_rate_to_base
        ? currency.exchange_rate_to_base.toString()
        : '',
      is_base: currency.is_base || 'N',
      is_active: currency.is_active || 'Y',
      created_date: currency.createdate
        ? new Date(currency.createdate).toISOString().split('T')[0]
        : '',
      created_by: currency.createdby || '',
      updated_date: currency.updatedate
        ? new Date(currency.updatedate).toISOString().split('T')[0]
        : '',
      updated_by: currency.updatedby || '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const model = tx ? tx.currencies : prisma.currencies;

    // Check for duplicate currency name (SQL Server compatible)
    if (data.name) {
      const existingName = await model.findFirst({
        where: {
          name: data.name, // Remove mode: 'insensitive'
        },
      });

      if (existingName) {
        return `Currency with name "${data.name}" already exists`;
      }
    }

    // Check for duplicate code if provided
    if (data.code) {
      const existingCode = await model.findFirst({
        where: {
          code: data.code,
        },
      });

      if (existingCode) {
        return `Currency with code "${data.code}" already exists`;
      }
    }

    // Check for duplicate symbol if provided
    if (data.symbol) {
      const existingSymbol = await model.findFirst({
        where: {
          symbol: data.symbol,
        },
      });

      if (existingSymbol) {
        return `Currency with symbol "${data.symbol}" already exists`;
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
      symbol: data.symbol || null,
      is_base: data.is_base || 'N',
      is_active: data.is_active || 'Y',
      createdby: userId,
      createdate: new Date(),
      log_inst: 1,
    };

    if (
      data.exchange_rate_to_base !== null &&
      data.exchange_rate_to_base !== undefined
    ) {
      preparedData.exchange_rate_to_base = new Prisma.Decimal(
        data.exchange_rate_to_base
      );
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
        // Do validation checks OUTSIDE transaction first
        const duplicateCheck = await this.checkDuplicate(row);

        if (duplicateCheck) {
          if (options.skipDuplicates) {
            throw new Error(`Skipped - ${duplicateCheck}`);
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

        // Only use transaction for the actual create operation
        const result = await prisma.$transaction(
          async tx => {
            const preparedData = await this.prepareDataForImport(row, userId);
            const generatedCode = await this.generateCurrencyCode(row.name, tx);
            preparedData.code = generatedCode;

            const created = await tx.currencies.create({
              data: preparedData,
            });

            return created;
          },
          {
            maxWait: 5000,
            timeout: 10000,
          }
        );

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
    const model = tx ? tx.currencies : prisma.currencies;

    const existing = await model.findFirst({
      where: {
        name: {
          equals: data.name,
          mode: 'insensitive',
        },
      },
    });

    if (!existing) return null;

    const updateData: any = {
      name: data.name,
      symbol: data.symbol !== undefined ? data.symbol : existing.symbol,
      is_base: data.is_base || existing.is_base,
      is_active: data.is_active || existing.is_active,
      updatedby: userId,
      updatedate: new Date(),
    };

    if (
      data.exchange_rate_to_base !== null &&
      data.exchange_rate_to_base !== undefined
    ) {
      updateData.exchange_rate_to_base = new Prisma.Decimal(
        data.exchange_rate_to_base
      );
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
            credit_notes: true,
            invoices: true,
            payments: true,
            orders_currencies: true,
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
      { header: 'Currency Code', key: 'code', width: 15 },
      ...this.columns,
      { header: 'Credit Notes Count', key: 'credit_notes_count', width: 18 },
      { header: 'Invoices Count', key: 'invoices_count', width: 15 },
      { header: 'Payments Count', key: 'payments_count', width: 15 },
      { header: 'Orders Count', key: 'orders_count', width: 15 },
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
    let totalCurrencies = 0;
    let activeCurrencies = 0;
    let inactiveCurrencies = 0;
    let baseCurrencies = 0;

    exportData.forEach((row: any, index: number) => {
      const currency = data[index] as any;

      row.credit_notes_count = currency._count?.credit_notes || 0;
      row.invoices_count = currency._count?.invoices || 0;
      row.payments_count = currency._count?.payments || 0;
      row.orders_count = currency._count?.orders_currencies || 0;

      if (currency.is_active === 'Y') {
        activeCurrencies++;
      } else {
        inactiveCurrencies++;
      }

      if (currency.is_base === 'Y') {
        baseCurrencies++;
      }

      totalCurrencies++;

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

      // Highlight base currency
      if (currency.is_base === 'Y') {
        excelRow.getCell('is_base').font = {
          color: { argb: 'FF0000FF' },
          bold: true,
        };
      }

      // Highlight inactive currencies
      if (currency.is_active === 'N') {
        excelRow.getCell('is_active').font = {
          color: { argb: 'FFFF0000' },
          bold: true,
        };
      }

      // Highlight exchange rates
      if (currency.exchange_rate_to_base) {
        const rate = parseFloat(currency.exchange_rate_to_base.toString());
        if (rate > 100) {
          excelRow.getCell('exchange_rate_to_base').font = {
            color: { argb: 'FFFF8C00' },
            bold: true,
          };
        }
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

    summarySheet.addRow({ metric: 'Total Currencies', value: totalCurrencies });
    summarySheet.addRow({
      metric: 'Active Currencies',
      value: activeCurrencies,
    });
    summarySheet.addRow({
      metric: 'Inactive Currencies',
      value: inactiveCurrencies,
    });
    summarySheet.addRow({ metric: 'Base Currencies', value: baseCurrencies });
    summarySheet.addRow({ metric: '', value: '' });

    summarySheet.addRow({ metric: 'Usage Breakdown', value: '' });
    data.forEach((currency: any) => {
      const totalUsage =
        (currency._count?.credit_notes || 0) +
        (currency._count?.invoices || 0) +
        (currency._count?.payments || 0) +
        (currency._count?.orders_currencies || 0);

      summarySheet.addRow({
        metric: `  ${currency.name} (${currency.code})`,
        value: totalUsage,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
