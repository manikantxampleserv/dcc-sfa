import { ImportExportService } from '../base/import-export.service';
import {
  ColumnDefinition,
  ImportOptions,
  ImportResult,
} from '../../../types/import-export.types';
import prisma from '../../../configs/prisma.client';

export class AssetSubTypesImportExportService extends ImportExportService<any> {
  protected modelName = 'asset_sub_types' as const;
  protected displayName = 'Asset Sub Types';
  protected uniqueFields = ['name', 'asset_type_id'];
  protected searchFields = ['name', 'description', 'code'];

  protected masterTableConfigs = [
    {
      masterTable: 'asset_types' as any,
      masterKey: 'id',
      masterDisplayFields: ['id', 'name', 'description'],
      sheetName: 'Ref - Asset Types',
      description: 'Use the ID from this sheet in the Asset Type ID column',
    },
  ];
  
  private codeCounters = new Map<string, number>();
  private validationCache: Map<string, string | null> = new Map();

  protected columns: ColumnDefinition[] = [
    {
      key: 'name',
      header: 'Asset Sub Type Name',
      width: 30,
      required: true,
      type: 'string',
      validation: value => {
        if (!value || value.length < 2) return 'Name too short';
        if (value.length > 100) return 'Name too long';
        return true;
      },
      description: 'Name of the asset sub type (required)',
    },
    {
      key: 'asset_type_id',
      header: 'Asset Type ID',
      width: 15,
      required: true,
      type: 'number',
      transform: value => (value ? Number(value) : null),
      description: 'Foreign key reference to asset_types.id (required)',
    },
    {
      key: 'description',
      header: 'Description',
      width: 40,
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
    const type = await prisma.asset_types.findFirst({ select: { id: true } });
    return [
      { name: 'Single Door', asset_type_id: type?.id || 1, description: 'Single door cooler', is_active: 'Y' },
    ];
  }

  protected getColumnDescription(key: string): string {
    const column = this.columns.find(col => col.key === key);
    return column?.description || '';
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(subType => ({
      name: subType.name,
      asset_type_id: subType.asset_type_id,
      description: subType.description || '',
      is_active: subType.is_active || 'Y',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const model = tx ? tx.asset_sub_types : prisma.asset_sub_types;
    const existing = await model.findFirst({
      where: { name: data.name, asset_type_id: data.asset_type_id },
    });
    return existing ? `Asset sub type "${data.name}" already exists for this type` : null;
  }

  protected async validateForeignKeys(
    data: any,
    tx?: any
  ): Promise<string | null> {
    const prismaClient = tx || prisma;
    const cacheKey = `assetType_${data.asset_type_id}`;

    if (this.validationCache.has(cacheKey)) {
      return this.validationCache.get(cacheKey)!;
    }

    const assetType = await prismaClient.asset_types.findUnique({
      where: { id: data.asset_type_id },
    });
    const result = assetType ? null : `Asset type ID ${data.asset_type_id} does not exist`;
    this.validationCache.set(cacheKey, result);
    return result;
  }

  private async generateCode(name: string): Promise<string> {
    const words = name.toUpperCase().split(/\s+/);
    const firstWord = words[0];
    const abbreviation = firstWord.substring(0, 4);
    const baseCode = `AST-${abbreviation}`;

    const currentCount = this.codeCounters.get(baseCode) || 0;
    const nextCount = currentCount + 1;
    this.codeCounters.set(baseCode, nextCount);

    return `${baseCode}-${nextCount.toString().padStart(2, '0')}`;
  }

  private async initializeCodeCounters(tx?: any): Promise<void> {
    try {
      const model = tx ? tx.asset_sub_types : prisma.asset_sub_types;
      const existingCodes = await model.findMany({
        select: { code: true },
        where: { code: { startsWith: 'AST-' } },
      });

      for (const item of existingCodes) {
        const match = item.code?.match(/^AST-([A-Z]+)-(\d+)$/);
        if (match) {
          const baseCode = `AST-${match[1]}`;
          const number = parseInt(match[2]);
          const currentMax = this.codeCounters.get(baseCode) || 0;
          if (number > currentMax) this.codeCounters.set(baseCode, number);
        }
      }
    } catch (error) {
      console.error('Error initializing code counters:', error);
    }
  }

  protected async prepareDataForImport(
    data: any,
    userId: number,
    tx?: any
  ): Promise<any> {
    const code = await this.generateCode(data.name);
    return {
      ...data,
      code,
      createdby: userId,
      createdate: new Date(),
      log_inst: 1,
    };
  }

  async importData(
    data: any[],
    userId: number,
    options: ImportOptions = {}
  ): Promise<ImportResult> {
    await this.initializeCodeCounters();
    return super.importData(data, userId, options);
  }

  protected async updateExisting(
    data: any,
    userId: number,
    tx?: any
  ): Promise<any> {
    const model = tx ? tx.asset_sub_types : prisma.asset_sub_types;
    const existing = await model.findFirst({
      where: { name: data.name, asset_type_id: data.asset_type_id },
    });

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
