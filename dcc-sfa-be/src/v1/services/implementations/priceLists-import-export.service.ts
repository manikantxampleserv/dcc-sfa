import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import prisma from '../../../configs/prisma.client';

export class PriceListsImportExportService extends ImportExportService<any> {
  protected modelName = 'pricelists' as const;
  protected displayName = 'Price Lists';
  protected uniqueFields = ['name'];
  protected searchFields = ['name', 'description', 'currency_code'];

  protected columns: ColumnDefinition[] = [
    {
      key: 'name',
      header: 'Name',
      width: 25,
      required: true,
      type: 'string',
      validation: value => {
        if (!value || value.length < 2)
          return 'Name is required (min 2 characters)';
        if (value.length > 100) return 'Name must be less than 100 characters';
        return true;
      },
      transform: value => value.trim(),
      description: 'Name of the price list (required, max 100 chars)',
    },
    {
      key: 'description',
      header: 'Description',
      width: 40,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 255 ||
        'Description must be less than 255 characters',
      transform: value => (value ? value.trim() : null),
      description: 'Description of the price list (optional, max 255 chars)',
    },
    {
      key: 'currency_code',
      header: 'Currency Code',
      width: 15,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 10 ||
        'Currency code must be less than 10 characters',
      transform: value => (value ? value.trim().toUpperCase() : 'INR'),
      description: 'Currency code (optional, max 10 chars, defaults to INR)',
    },
    {
      key: 'valid_from',
      header: 'Valid From',
      width: 15,
      type: 'date',
      validation: value => {
        if (!value) return true;
        const date = new Date(value);
        if (isNaN(date.getTime())) return 'Valid from must be a valid date';
        return true;
      },
      transform: value => (value ? new Date(value) : null),
      description: 'Start date of validity (optional, format: YYYY-MM-DD)',
    },
    {
      key: 'valid_to',
      header: 'Valid To',
      width: 15,
      type: 'date',
      validation: value => {
        if (!value) return true;
        const date = new Date(value);
        if (isNaN(date.getTime())) return 'Valid to must be a valid date';
        return true;
      },
      transform: value => (value ? new Date(value) : null),
      description: 'End date of validity (optional, format: YYYY-MM-DD)',
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
        name: 'Standard Price List',
        description: 'Default pricing for all products',
        currency_code: 'INR',
        valid_from: '2024-01-01',
        valid_to: '2024-12-31',
        is_active: 'Y',
      },
      {
        name: 'Premium Price List',
        description: 'Premium pricing for VIP customers',
        currency_code: 'USD',
        valid_from: '2024-01-01',
        valid_to: '2024-06-30',
        is_active: 'Y',
      },
      {
        name: 'Seasonal Price List',
        description: 'Special seasonal pricing',
        currency_code: 'INR',
        valid_from: '2024-03-01',
        valid_to: '2024-05-31',
        is_active: 'N',
      },
    ];
  }

  protected getColumnDescription(key: string): string {
    const column = this.columns.find(col => col.key === key);
    return column?.description || '';
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(priceList => ({
      name: priceList.name,
      description: priceList.description || '',
      currency_code: priceList.currency_code || 'INR',
      valid_from: priceList.valid_from
        ? priceList.valid_from.toISOString().split('T')[0]
        : '',
      valid_to: priceList.valid_to
        ? priceList.valid_to.toISOString().split('T')[0]
        : '',
      is_active: priceList.is_active || 'Y',
      created_date: priceList.createdate?.toISOString().split('T')[0] || '',
      created_by: priceList.createdby || '',
      updated_date: priceList.updatedate?.toISOString().split('T')[0] || '',
      updated_by: priceList.updatedby || '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const model = tx ? tx.pricelists : prisma.pricelists;

    const existingPriceList = await model.findFirst({
      where: { name: data.name },
    });

    if (existingPriceList) {
      return `Price list with name "${data.name}" already exists`;
    }

    return null;
  }

  protected async transformDataForImport(
    data: any,
    userId: number
  ): Promise<any> {
    return {
      name: data.name,
      description: data.description || null,
      currency_code: data.currency_code || 'INR',
      valid_from: data.valid_from || null,
      valid_to: data.valid_to || null,
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
    // Validate date range if both dates are provided
    if (data.valid_from && data.valid_to) {
      if (data.valid_to <= data.valid_from) {
        return 'Valid to date must be after valid from date';
      }
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
    const model = tx ? tx.pricelists : prisma.pricelists;

    const existing = await model.findFirst({
      where: { name: data.name },
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
}
