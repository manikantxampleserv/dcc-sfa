import prisma from '../../../configs/prisma.client';
import { ColumnDefinition } from '../../../types/import-export.types';
import { ImportExportService } from '../base/import-export.service';

export class RegionsImportExportService extends ImportExportService<any> {
  protected modelName = 'regions' as const;
  protected displayName = 'Regions';
  protected uniqueFields = ['code'];
  protected searchFields = ['name', 'code', 'description'];

  protected columns: ColumnDefinition[] = [
    {
      key: 'name',
      header: 'Region Name',
      width: 30,
      required: true,
      type: 'string',
      validation: value => {
        if (!value || value.trim() === '') return 'Region name is required';
        if (value.length > 255) return 'Region name must be less than 255 characters';
        return true;
      },
      transform: value => (value ? value.trim() : null),
      description: 'Name of the region (required, max 255 chars)',
    },
    {
      key: 'code',
      header: 'Region Code',
      width: 20,
      required: true,
      type: 'string',
      validation: value => {
        if (!value || value.trim() === '') return 'Region code is required';
        if (value.length > 50) return 'Region code must be less than 50 characters';
        return true;
      },
      transform: value => (value ? value.trim().toUpperCase() : null),
      description: 'Unique code for the region (required, max 50 chars)',
    },
    {
      key: 'description',
      header: 'Description',
      width: 40,
      type: 'string',
      validation: value => !value || value.length <= 500 || 'Description must be less than 500 characters',
      description: 'Description of the region (optional, max 500 chars)',
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
      { name: 'Northern Region', code: 'REG-NORTH', description: 'Northern geographical area', is_active: 'Y' },
      { name: 'Southern Region', code: 'REG-SOUTH', description: 'Southern geographical area', is_active: 'Y' },
    ];
  }

  protected getColumnDescription(key: string): string {
    const column = this.columns.find(col => col.key === key);
    return column?.description || '';
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(region => ({
      id: region.id,
      name: region.name,
      code: region.code,
      description: region.description || '',
      is_active: region.is_active,
      created_date: region.createdate ? new Date(region.createdate).toISOString().split('T')[0] : '',
      created_by: region.createdby,
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const prismaClient = tx || prisma;
    const existing = await prismaClient.regions.findFirst({
      where: { code: data.code },
    });
    return existing ? `Region with code '${data.code}' already exists` : null;
  }

  protected async validateForeignKeys(data: any, tx?: any): Promise<string | null> {
    return null;
  }

  protected async prepareDataForImport(data: any, userId: number): Promise<any> {
    return {
      ...data,
      createdby: userId,
      createdate: new Date(),
      log_inst: 1,
    };
  }

  protected async updateExisting(data: any, userId: number, tx?: any): Promise<any> {
    const prismaClient = tx || prisma;
    const existing = await prismaClient.regions.findFirst({
      where: { code: data.code },
    });
    if (!existing) return null;
    return await prismaClient.regions.update({
      where: { id: existing.id },
      data: {
        ...data,
        updatedby: userId,
        updatedate: new Date(),
      },
    });
  }
}
