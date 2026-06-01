import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import prisma from '../../../configs/prisma.client';

export class BrandsImportExportService extends ImportExportService<any> {
  protected modelName = 'brands' as const;
  protected displayName = 'Brands';
  protected uniqueFields = ['name'];
  protected searchFields = ['name', 'code', 'description'];

  private lastNumberCache: Map<string, number> = new Map();

  private async generateBrandCode(name: string, tx?: any): Promise<string> {
    const prefix = name.slice(0, 3).toUpperCase();
    const db = tx || prisma;

    if (!this.lastNumberCache.has(prefix)) {
      try {
        const lastBrand = await db.brands.findFirst({
          where: { code: { startsWith: prefix } },
          orderBy: { id: 'desc' },
          select: { code: true },
        });

        let lastNum = 0;
        if (lastBrand && lastBrand.code) {
          const match = lastBrand.code.match(/(\d+)$/);
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
      header: 'Brand Name',
      width: 25,
      required: true,
      type: 'string',
      validation: value => {
        if (!value) return 'Brand name is required';
        if (value.length < 2) return 'Brand name must be at least 2 characters';
        if (value.length > 100) return 'Brand name too long';
        return true;
      },
      transform: value => value.toString().trim(),
      description: 'Name of the brand (required)',
    },
    {
      key: 'code',
      header: 'Brand Code',
      width: 15,
      type: 'string',
      transform: value => value ? value.toString().trim().toUpperCase() : null,
      description: 'Brand code (optional, auto-generated if empty)',
    },
    {
      key: 'description',
      header: 'Description',
      width: 30,
      type: 'string',
      description: 'Description (optional)',
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
      { name: 'Coca-Cola', code: 'COC001', description: 'Soft drink brand', is_active: 'Y' },
    ];
  }

  protected getColumnDescription(key: string): string {
    const column = this.columns.find(col => col.key === key);
    return column?.description || '';
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(brand => ({
      name: brand.name,
      code: brand.code,
      description: brand.description || '',
      is_active: brand.is_active || 'Y',
      createdate: brand.createdate?.toISOString().split('T')[0] || '',
      createdby: brand.createdby || '',
      updatedate: brand.updatedate?.toISOString().split('T')[0] || '',
      updatedby: brand.updatedby || '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const model = tx ? tx.brands : prisma.brands;
    const existing = await model.findFirst({ where: { name: data.name } });
    return existing ? `Brand "${data.name}" already exists` : null;
  }

  protected async validateForeignKeys(data: any, tx?: any): Promise<string | null> {
    return null;
  }

  protected async prepareDataForImport(
    data: any,
    userId: number,
    tx?: any
  ): Promise<any> {
    const code = data.code || await this.generateBrandCode(data.name, tx);
    return {
      name: data.name,
      code,
      description: data.description || null,
      is_active: data.is_active || 'Y',
      createdate: new Date(),
      createdby: userId,
      log_inst: 1,
    };
  }

  protected async updateExisting(
    data: any,
    userId: number,
    tx?: any
  ): Promise<any> {
    const model = tx ? tx.brands : prisma.brands;
    const existing = await model.findFirst({ where: { name: data.name } });
    if (!existing) return null;

    return await model.update({
      where: { id: existing.id },
      data: {
        ...data,
        updatedby: userId,
        updatedate: new Date(),
      },
    });
  }
}
