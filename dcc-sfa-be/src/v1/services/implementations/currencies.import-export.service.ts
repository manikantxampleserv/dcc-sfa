import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import { Prisma } from '@prisma/client';
import prisma from '../../../configs/prisma.client';

export class CurrenciesImportExportService extends ImportExportService<any> {
  protected modelName = 'currencies' as const;
  protected displayName = 'Currencies';
  protected uniqueFields = ['code'];
  protected searchFields = ['code', 'name', 'symbol'];

  private lastNumberCache: Map<string, number> = new Map();

  private async generateCurrencyCode(name: string, tx?: any): Promise<string> {
    const prefix = name.slice(0, 3).toUpperCase();
    const db = tx || prisma;

    if (!this.lastNumberCache.has(prefix)) {
      try {
        const lastCurrency = await db.currencies.findFirst({
          where: { code: { startsWith: prefix } },
          orderBy: { id: 'desc' },
          select: { code: true },
        });

        let lastNum = 0;
        if (lastCurrency && lastCurrency.code) {
          const match = lastCurrency.code.match(/(\d+)$/);
          if (match) {
            lastNum = parseInt(match[1], 10);
          }
        }
        this.lastNumberCache.set(prefix, lastNum);
      } catch (error) {
        return `${prefix}${Date.now().toString().slice(-3)}`;
      }
    }

    const nextNum = (this.lastNumberCache.get(prefix) || 0) + 1;
    this.lastNumberCache.set(prefix, nextNum);
    return `${prefix}${nextNum.toString().padStart(3, '0')}`;
  }

  protected columns: ColumnDefinition[] = [
    {
      key: 'name',
      header: 'Currency Name',
      width: 30,
      required: true,
      type: 'string',
      validation: value => {
        if (!value || value.length < 2) return 'Name too short';
        if (value.length > 100) return 'Name too long';
        return true;
      },
      description: 'Name of the currency (required)',
    },
    {
      key: 'symbol',
      header: 'Currency Symbol',
      width: 15,
      type: 'string',
      description: 'Currency symbol (optional)',
    },
    {
      key: 'exchange_rate_to_base',
      header: 'Exchange Rate to Base',
      width: 25,
      type: 'number',
      validation: value => {
        if (!value) return true;
        const rate = parseFloat(value);
        if (isNaN(rate) || rate <= 0) return 'Must be a positive number';
        return true;
      },
      transform: value => (value ? parseFloat(value) : null),
      description: 'Exchange rate relative to base currency (optional)',
    },
    {
      key: 'is_base',
      header: 'Is Base Currency',
      width: 18,
      type: 'string',
      defaultValue: 'N',
      transform: value => (value ? value.toString().toUpperCase() : 'N'),
      description: 'Is this the base currency (Y/N)',
    },
    {
      key: 'is_active',
      header: 'Is Active',
      width: 12,
      type: 'string',
      defaultValue: 'Y',
      transform: value => (value ? value.toString().toUpperCase() : 'Y'),
      description: 'Active status (Y/N)',
    },
  ];

  protected async getSampleData(): Promise<any[]> {
    return [
      { name: 'US Dollar', symbol: '$', exchange_rate_to_base: 1.0, is_base: 'Y', is_active: 'Y' },
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
      exchange_rate_to_base: currency.exchange_rate_to_base?.toString() || '',
      is_base: currency.is_base || 'N',
      is_active: currency.is_active || 'Y',
      created_date: currency.createdate?.toISOString().split('T')[0] || '',
      created_by: currency.createdby || '',
      updated_date: currency.updatedate?.toISOString().split('T')[0] || '',
      updated_by: currency.updatedby || '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const model = tx ? tx.currencies : prisma.currencies;
    if (data.name) {
      const existing = await model.findFirst({ where: { name: data.name } });
      if (existing) return `Currency "${data.name}" already exists`;
    }
    if (data.code) {
      const existing = await model.findFirst({ where: { code: data.code } });
      if (existing) return `Currency code "${data.code}" already exists`;
    }
    return null;
  }

  protected async validateForeignKeys(data: any, tx?: any): Promise<string | null> {
    return null;
  }

  protected async prepareDataForImport(
    data: any,
    userId: number,
    tx?: any
  ): Promise<any> {
    const code = data.code || await this.generateCurrencyCode(data.name, tx);
    return {
      name: data.name,
      code,
      symbol: data.symbol || null,
      is_base: data.is_base || 'N',
      is_active: data.is_active || 'Y',
      exchange_rate_to_base: data.exchange_rate_to_base ? new Prisma.Decimal(data.exchange_rate_to_base) : null,
      createdby: userId,
      createdate: new Date(),
      log_inst: 1,
    };
  }

  protected async updateExisting(
    data: any,
    userId: number,
    tx?: any
  ): Promise<any> {
    const model = tx ? tx.currencies : prisma.currencies;
    const existing = await model.findFirst({ where: { name: data.name } });
    if (!existing) return null;

    return await model.update({
      where: { id: existing.id },
      data: {
        ...data,
        exchange_rate_to_base: data.exchange_rate_to_base ? new Prisma.Decimal(data.exchange_rate_to_base) : existing.exchange_rate_to_base,
        updatedby: userId,
        updatedate: new Date(),
      },
    });
  }
}
