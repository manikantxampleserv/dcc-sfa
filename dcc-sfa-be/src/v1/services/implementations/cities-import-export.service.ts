import prisma from '../../../configs/prisma.client';
import { ColumnDefinition } from '../../../types/import-export.types';
import { ImportExportService } from '../base/import-export.service';

export class CitiesImportExportService extends ImportExportService<any> {
  protected modelName = 'cities' as const;
  protected displayName = 'Cities';
  protected uniqueFields = ['code'];
  protected searchFields = ['name', 'code', 'description'];

  protected masterTableConfigs = [
    {
      masterTable: 'districts' as any,
      masterKey: 'id',
      masterDisplayFields: ['id', 'name', 'code'],
      sheetName: 'Ref - Districts',
      description: 'Use the ID from this sheet in the District ID column',
    },
  ];

  protected columns: ColumnDefinition[] = [
    {
      key: 'district_id',
      header: 'District ID',
      width: 15,
      required: true,
      type: 'number',
      transform: value => parseInt(value),
      description: 'ID of the associated district (required, refer to Ref - Districts sheet)',
    },
    {
      key: 'name',
      header: 'City Name',
      width: 30,
      required: true,
      type: 'string',
      validation: value => {
        if (!value || value.trim() === '') return 'City name is required';
        if (value.length > 255) return 'City name must be less than 255 characters';
        return true;
      },
      transform: value => (value ? value.trim() : null),
      description: 'Name of the city (required, max 255 chars)',
    },
    {
      key: 'code',
      header: 'City Code',
      width: 20,
      required: true,
      type: 'string',
      validation: value => {
        if (!value || value.trim() === '') return 'City code is required';
        if (value.length > 50) return 'City code must be less than 50 characters';
        return true;
      },
      transform: value => (value ? value.trim().toUpperCase() : null),
      description: 'Unique code for the city (required, max 50 chars)',
    },
    {
      key: 'description',
      header: 'Description',
      width: 40,
      type: 'string',
      validation: value => !value || value.length <= 500 || 'Description must be less than 500 characters',
      description: 'Description of the city (optional, max 500 chars)',
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
    const district = await prisma.districts.findFirst({ select: { id: true } });
    return [
      { district_id: district?.id || 1, name: 'Sample City 1', code: 'CITY-001', description: 'Major city center', is_active: 'Y' },
      { district_id: district?.id || 1, name: 'Sample City 2', code: 'CITY-002', description: 'Suburban area', is_active: 'Y' },
    ];
  }

  protected getColumnDescription(key: string): string {
    const column = this.columns.find(col => col.key === key);
    return column?.description || '';
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(city => ({
      id: city.id,
      district_id: city.district_id,
      district_name: city.cities_districts?.name || '',
      name: city.name,
      code: city.code,
      description: city.description || '',
      is_active: city.is_active,
      created_date: city.createdate ? new Date(city.createdate).toISOString().split('T')[0] : '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const prismaClient = tx || prisma;
    const existing = await prismaClient.cities.findFirst({
      where: { code: data.code },
    });
    return existing ? `City with code '${data.code}' already exists` : null;
  }

  protected async validateForeignKeys(data: any, tx?: any): Promise<string | null> {
    const prismaClient = tx || prisma;
    if (data.district_id) {
      const district = await prismaClient.districts.findUnique({ where: { id: data.district_id } });
      if (!district) return `District with ID ${data.district_id} does not exist`;
    }
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
    const existing = await prismaClient.cities.findFirst({
      where: { code: data.code },
    });
    if (!existing) return null;
    return await prismaClient.cities.update({
      where: { id: existing.id },
      data: {
        ...data,
        updatedby: userId,
        updatedate: new Date(),
      },
    });
  }
}
