import prisma from '../../../configs/prisma.client';
import { ColumnDefinition } from '../../../types/import-export.types';
import { ImportExportService } from '../base/import-export.service';

export class DistrictsImportExportService extends ImportExportService<any> {
  protected modelName = 'districts' as const;
  protected displayName = 'Districts';
  protected uniqueFields = ['code'];
  protected searchFields = ['name', 'code', 'description'];

  protected masterTableConfigs = [
    {
      masterTable: 'regions' as any,
      masterKey: 'id',
      masterDisplayFields: ['id', 'name', 'code'],
      sheetName: 'Ref - Regions',
      description: 'Use the ID from this sheet in the Region ID column',
    },
  ];

  protected columns: ColumnDefinition[] = [
    {
      key: 'region_id',
      header: 'Region ID',
      width: 15,
      required: true,
      type: 'number',
      transform: value => parseInt(value),
      description: 'ID of the associated region (required, refer to Ref - Regions sheet)',
    },
    {
      key: 'name',
      header: 'District Name',
      width: 30,
      required: true,
      type: 'string',
      validation: value => {
        if (!value || value.trim() === '') return 'District name is required';
        if (value.length > 255) return 'District name must be less than 255 characters';
        return true;
      },
      transform: value => (value ? value.trim() : null),
      description: 'Name of the district (required, max 255 chars)',
    },
    {
      key: 'code',
      header: 'District Code',
      width: 20,
      required: true,
      type: 'string',
      validation: value => {
        if (!value || value.trim() === '') return 'District code is required';
        if (value.length > 50) return 'District code must be less than 50 characters';
        return true;
      },
      transform: value => (value ? value.trim().toUpperCase() : null),
      description: 'Unique code for the district (required, max 50 chars)',
    },
    {
      key: 'description',
      header: 'Description',
      width: 40,
      type: 'string',
      validation: value => !value || value.length <= 500 || 'Description must be less than 500 characters',
      description: 'Description of the district (optional, max 500 chars)',
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
    const region = await prisma.regions.findFirst({ select: { id: true } });
    return [
      { region_id: region?.id || 1, name: 'North District 1', code: 'DIST-N1', description: 'First northern district', is_active: 'Y' },
      { region_id: region?.id || 1, name: 'North District 2', code: 'DIST-N2', description: 'Second northern district', is_active: 'Y' },
    ];
  }

  protected getColumnDescription(key: string): string {
    const column = this.columns.find(col => col.key === key);
    return column?.description || '';
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(district => ({
      id: district.id,
      region_id: district.region_id,
      region_name: district.district_regions?.name || '',
      name: district.name,
      code: district.code,
      description: district.description || '',
      is_active: district.is_active,
      created_date: district.createdate ? new Date(district.createdate).toISOString().split('T')[0] : '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const prismaClient = tx || prisma;
    const existing = await prismaClient.districts.findFirst({
      where: { code: data.code },
    });
    return existing ? `District with code '${data.code}' already exists` : null;
  }

  protected async validateForeignKeys(data: any, tx?: any): Promise<string | null> {
    const prismaClient = tx || prisma;
    if (data.region_id) {
      const region = await prismaClient.regions.findUnique({ where: { id: data.region_id } });
      if (!region) return `Region with ID ${data.region_id} does not exist`;
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
    const existing = await prismaClient.districts.findFirst({
      where: { code: data.code },
    });
    if (!existing) return null;
    return await prismaClient.districts.update({
      where: { id: existing.id },
      data: {
        ...data,
        updatedby: userId,
        updatedate: new Date(),
      },
    });
  }
}
