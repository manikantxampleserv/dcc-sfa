import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import prisma from '../../../configs/prisma.client';

export class RouteTypesImportExportService extends ImportExportService<any> {
  protected modelName = 'route_type' as const;
  protected displayName = 'Route Types';
  protected uniqueFields = ['name'];
  protected searchFields = ['name'];

  protected columns: ColumnDefinition[] = [
    {
      key: 'name',
      header: 'Name',
      width: 30,
      required: true,
      type: 'string',
      validation: value => {
        if (!value || value.length < 1) return 'Name is required';
        if (value.length > 100) return 'Name must be less than 100 characters';
        return true;
      },
      transform: value => value.trim(),
      description: 'Route type name (required, max 100 chars)',
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
        name: 'Primary Route',
        is_active: 'Y',
      },
      {
        name: 'Secondary Route',
        is_active: 'Y',
      },
      {
        name: 'Express Route',
        is_active: 'Y',
      },
      {
        name: 'Local Route',
        is_active: 'Y',
      },
    ];
  }

  protected getColumnDescription(key: string): string {
    const column = this.columns.find(col => col.key === key);
    return column?.description || '';
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(routeType => ({
      name: routeType.name || '',
      is_active: routeType.is_active || 'Y',
      created_date: routeType.createdate?.toISOString().split('T')[0] || '',
      created_by: routeType.createdby || '',
      updated_date: routeType.updatedate?.toISOString().split('T')[0] || '',
      updated_by: routeType.updatedby || '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const model = tx ? tx.route_type : prisma.route_type;

    const existing = await model.findFirst({
      where: { name: data.name },
    });

    if (existing) {
      return `Route type with name ${data.name} already exists`;
    }

    return null;
  }

  protected async transformDataForImport(
    data: any,
    userId: number
  ): Promise<any> {
    return {
      name: data.name,
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
    // No foreign keys to validate for route types
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
    const model = tx ? tx.route_type : prisma.route_type;

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
