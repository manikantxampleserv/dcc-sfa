/**
 * @fileoverview Promotional Materials Import/Export Service
 * @description Handles bulk Excel importing and exporting for promotional materials catalog
 * @version 1.0.0
 */

import prisma from '../../../configs/prisma.client';
import { ColumnDefinition } from '../../../types/import-export.types';
import { ImportExportService } from '../base/import-export.service';

export class PromotionalMaterialsImportExportService extends ImportExportService<any> {
  protected modelName = 'promotional_materials' as const;
  protected displayName = 'Promotional Materials';
  protected uniqueFields = ['code', 'name'];
  protected searchFields = ['name', 'code', 'description'];

  private lastNumberCache: Map<string, number> = new Map();

  private async generateMaterialCode(name: string, tx?: any): Promise<string> {
    const prefix = 'PM';
    const db = tx || prisma;

    if (!this.lastNumberCache.has(prefix)) {
      try {
        const lastItem = await (db as any).promotional_materials.findFirst({
          where: { code: { startsWith: prefix } },
          orderBy: { id: 'desc' },
          select: { code: true },
        });

        let lastNum = 0;
        if (lastItem && lastItem.code) {
          const match = lastItem.code.match(/(\d+)$/);
          if (match) {
            lastNum = parseInt(match[1], 10);
          }
        }
        this.lastNumberCache.set(prefix, lastNum);
      } catch (error) {
        return `${prefix}-${Date.now().toString().slice(-4)}`;
      }
    }

    const nextNum = (this.lastNumberCache.get(prefix) || 0) + 1;
    this.lastNumberCache.set(prefix, nextNum);
    return `${prefix}-${nextNum.toString().padStart(4, '0')}`;
  }

  protected columns: ColumnDefinition[] = [
    {
      key: 'name',
      header: 'Material Name',
      width: 25,
      required: true,
      type: 'string',
      validation: value => {
        if (!value) return 'Material name is required';
        if (value.length < 2)
          return 'Material name must be at least 2 characters';
        if (value.length > 200) return 'Material name too long';
        return true;
      },
      transform: value => value.toString().trim(),
      description: 'Name of the promotional material (required)',
    },
    {
      key: 'code',
      header: 'Material Code',
      width: 15,
      type: 'string',
      transform: value =>
        value ? value.toString().trim().toUpperCase() : null,
      description: 'Material code (optional, auto-generated if empty)',
    },
    {
      key: 'uom',
      header: 'Unit of Measure',
      width: 15,
      type: 'string',
      defaultValue: 'Pcs',
      transform: value => (value ? value.toString().trim() : 'Pcs'),
      description: 'Unit of measurement (e.g. Pcs, Boxes, Sets)',
    },
    {
      key: 'default_unit_value',
      header: 'Default Unit Value',
      width: 18,
      type: 'number',
      transform: value => {
        if (value === null || value === undefined || value === '') return null;
        const num = parseFloat(value.toString().replace(/[^0-9.-]/g, ''));
        return isNaN(num) ? null : num;
      },
      description: 'Standard value or cost per unit in TZS (optional)',
    },
    {
      key: 'description',
      header: 'Description',
      width: 30,
      type: 'string',
      description: 'Description or specifications (optional)',
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
      {
        name: 'Branded T-Shirt (Large)',
        code: 'PM-0001',
        uom: 'Pcs',
        default_unit_value: 12000,
        description: 'Cotton branded corporate promotional t-shirt',
        is_active: 'Y',
      },
      {
        name: 'Promotional Cap',
        code: 'PM-0002',
        uom: 'Pcs',
        default_unit_value: 6500,
        description: 'Embroidered promotional cap with logo',
        is_active: 'Y',
      },
    ];
  }

  protected getColumnDescription(key: string): string {
    const column = this.columns.find(col => col.key === key);
    return column?.description || '';
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(item => ({
      name: item.name,
      code: item.code,
      uom: item.uom || 'Pcs',
      default_unit_value: item.default_unit_value || '',
      description: item.description || '',
      is_active: item.is_active || 'Y',
      createdate: item.createdate?.toISOString().split('T')[0] || '',
      createdby: item.createdby || '',
      updatedate: item.updatedate?.toISOString().split('T')[0] || '',
      updatedby: item.updatedby || '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const model = tx
      ? (tx as any).promotional_materials
      : (prisma as any).promotional_materials;
    if (data.code) {
      const existingByCode = await model.findUnique({
        where: { code: data.code },
      });
      if (existingByCode) {
        return `Material with code "${data.code}" already exists`;
      }
    }
    const existingByName = await model.findFirst({
      where: { name: data.name },
    });
    return existingByName ? `Material "${data.name}" already exists` : null;
  }

  protected async validateForeignKeys(
    _data: any,
    _tx?: any
  ): Promise<string | null> {
    return null;
  }

  protected async prepareDataForImport(
    data: any,
    userId: number,
    tx?: any
  ): Promise<any> {
    const code = data.code || (await this.generateMaterialCode(data.name, tx));
    return {
      name: data.name,
      code,
      uom: data.uom || 'Pcs',
      default_unit_value:
        data.default_unit_value !== undefined &&
        data.default_unit_value !== null &&
        data.default_unit_value !== ''
          ? Number(data.default_unit_value)
          : null,
      description: data.description || null,
      is_active: data.is_active || 'Y',
      createdate: new Date(),
      createdby: userId,
    };
  }

  protected async updateExisting(
    data: any,
    userId: number,
    tx?: any
  ): Promise<any> {
    const model = tx
      ? (tx as any).promotional_materials
      : (prisma as any).promotional_materials;
    const existing = data.code
      ? await model.findUnique({ where: { code: data.code } })
      : await model.findFirst({ where: { name: data.name } });

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
