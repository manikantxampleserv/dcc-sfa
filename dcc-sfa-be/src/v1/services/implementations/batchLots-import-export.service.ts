import { ImportExportService } from '../base/import-export.service';
import {
  ColumnDefinition,
  ImportResult,
  ImportOptions,
} from '../../../types/import-export.types';
import prisma from '../../../configs/prisma.client';
import { PrismaClient } from '@prisma/client';

export class BatchLotsImportExportService extends ImportExportService<any> {
  protected modelName = 'batch_lots' as const;
  protected displayName = 'Batch & Lot Management';
  protected uniqueFields = ['batch_number'];
  protected searchFields = ['batch_number', 'lot_number', 'supplier_name'];

  protected columns: ColumnDefinition[] = [
    {
      key: 'batch_number',
      header: 'Batch Number',
      width: 20,
      required: true,
      type: 'string',
      description: 'Batch number (required, unique, max 50 characters)',
    },
    {
      key: 'lot_number',
      header: 'Lot Number',
      width: 20,
      type: 'string',
      description: 'Lot number (optional, max 50 characters)',
    },
    {
      key: 'manufacturing_date',
      header: 'Manufacturing Date',
      width: 20,
      required: true,
      type: 'date',
      description: 'Manufacturing date (required, YYYY-MM-DD)',
    },
    {
      key: 'expiry_date',
      header: 'Expiry Date',
      width: 20,
      required: true,
      type: 'date',
      description: 'Expiry date (required, YYYY-MM-DD)',
    },
    {
      key: 'quantity',
      header: 'Quantity',
      width: 15,
      required: true,
      type: 'number',
      description: 'Total quantity (required, integer)',
    },
    {
      key: 'remaining_quantity',
      header: 'Remaining Quantity',
      width: 18,
      type: 'number',
      description: 'Remaining quantity (optional, defaults to quantity)',
    },
    {
      key: 'supplier_name',
      header: 'Supplier Name',
      width: 25,
      type: 'string',
      description: 'Supplier name (optional, max 255 characters)',
    },
    {
      key: 'purchase_price',
      header: 'Purchase Price',
      width: 18,
      type: 'number',
      description: 'Purchase price (optional, decimal)',
    },
    {
      key: 'quality_grade',
      header: 'Quality Grade',
      width: 15,
      type: 'string',
      description: 'Quality grade: A, B, C, D, or F (optional, defaults to A)',
    },
    {
      key: 'storage_location',
      header: 'Storage Location',
      width: 25,
      type: 'string',
      description: 'Storage location (optional, max 100 characters)',
    },
    {
      key: 'is_active',
      header: 'Active',
      width: 10,
      type: 'string',
      description: 'Active status: Y or N (defaults to Y)',
    },
  ];

  protected async getSampleData(): Promise<any[]> {
    return [
      {
        batch_number: 'BATCH001',
        lot_number: 'LOT001',
        manufacturing_date: new Date('2024-01-15'),
        expiry_date: new Date('2025-01-15'),
        quantity: 1000,
        remaining_quantity: 850,
        supplier_name: 'ABC Suppliers Ltd.',
        purchase_price: 50.0,
        quality_grade: 'A',
        storage_location: 'Warehouse A - Section 1',
        is_active: 'Y',
      },
      {
        batch_number: 'BATCH002',
        lot_number: 'LOT002',
        manufacturing_date: new Date('2024-03-20'),
        expiry_date: new Date('2025-03-20'),
        quantity: 500,
        remaining_quantity: 500,
        supplier_name: 'XYZ Distributors',
        purchase_price: 52.5,
        quality_grade: 'B',
        storage_location: 'Warehouse B - Section 1',
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
      batch_number: item.batch_number,
      lot_number: item.lot_number || '',
      manufacturing_date: item.manufacturing_date,
      expiry_date: item.expiry_date,
      quantity: item.quantity,
      remaining_quantity: item.remaining_quantity,
      supplier_name: item.supplier_name || '',
      purchase_price: item.purchase_price || '',
      quality_grade: item.quality_grade || 'A',
      storage_location: item.storage_location || '',
      is_active: item.is_active || 'Y',
    }));
  }

  protected async checkDuplicate(
    data: any,
    tx?: Omit<
      PrismaClient,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >
  ): Promise<string | null> {
    const prismaClient = tx || prisma;

    const existingBatch = await prismaClient.batch_lots.findFirst({
      where: {
        batch_number: data.batch_number,
      },
    });

    if (existingBatch) {
      return `Batch number '${data.batch_number}' already exists`;
    }

    return null;
  }

  protected async validateForeignKeys(
    data: any,
    tx?: Omit<
      PrismaClient,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >
  ): Promise<string | null> {
    return null;
  }

  protected async prepareDataForImport(
    data: any,
    userId: number,
    tx?: Omit<
      PrismaClient,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >
  ): Promise<any> {
    const manufacturingDate = new Date(data.manufacturing_date);
    const expiryDate = new Date(data.expiry_date);

    if (expiryDate <= manufacturingDate) {
      throw new Error('Expiry date must be after manufacturing date');
    }

    const qualityGrade = data.quality_grade?.toUpperCase() || 'A';
    if (!['A', 'B', 'C', 'D', 'F'].includes(qualityGrade)) {
      throw new Error('Quality grade must be one of: A, B, C, D, F');
    }

    const remainingQty =
      data.remaining_quantity !== undefined && data.remaining_quantity !== null
        ? Number(data.remaining_quantity)
        : Number(data.quantity);

    if (remainingQty > Number(data.quantity)) {
      throw new Error(
        'Remaining quantity cannot be greater than total quantity'
      );
    }

    return {
      batch_number: String(data.batch_number).trim(),
      lot_number: data.lot_number ? String(data.lot_number).trim() : null,
      manufacturing_date: manufacturingDate,
      expiry_date: expiryDate,
      quantity: Number(data.quantity),
      remaining_quantity: remainingQty,
      supplier_name: data.supplier_name
        ? String(data.supplier_name).trim()
        : null,
      purchase_price: data.purchase_price ? Number(data.purchase_price) : null,
      quality_grade: qualityGrade,
      storage_location: data.storage_location
        ? String(data.storage_location).trim()
        : null,
      is_active: data.is_active ? String(data.is_active).toUpperCase() : 'Y',
      createdate: new Date(),
      createdby: userId,
      log_inst: 1,
    };
  }

  protected async updateExisting(
    id: number,
    data: any,
    userId: number,
    tx?: Omit<
      PrismaClient,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >
  ): Promise<any> {
    const prismaClient = tx || prisma;

    const preparedData = await this.prepareDataForImport(data, userId, tx);

    return await prismaClient.batch_lots.update({
      where: { id },
      data: {
        ...preparedData,
        updatedate: new Date(),
        updatedby: userId,
      },
    });
  }
}
