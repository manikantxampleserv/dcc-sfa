import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import { Prisma } from '@prisma/client';
import prisma from '../../../configs/prisma.client';

export class SubunitsImportExportService extends ImportExportService<any> {
  protected modelName = 'subunits' as const;
  protected displayName = 'Subunits';
  protected uniqueFields = ['code', 'name'];
  protected searchFields = ['name', 'code', 'description'];

  protected columns: ColumnDefinition[] = [
    {
      key: 'name',
      header: 'Subunit Name',
      width: 30,
      required: true,
      type: 'string',
      validation: value => {
        if (!value || value.trim() === '') return 'Subunit name is required';
        if (value.length > 255)
          return 'Subunit name must be less than 255 characters';
        return true;
      },
      transform: value => (value ? value.trim() : null),
      description: 'Name of the subunit (required, max 255 chars)',
    },
    {
      key: 'code',
      header: 'Subunit Code',
      width: 20,
      required: false,
      type: 'string',
      validation: value => {
        if (!value) return true;
        if (value.length > 100)
          return 'Subunit code must be less than 100 characters';
        return true;
      },
      transform: value => (value ? value.trim().toUpperCase() : null),
      description:
        'Unique code for the subunit (optional, max 100 chars, will be auto-generated if not provided)',
    },
    {
      key: 'description',
      header: 'Description',
      width: 50,
      type: 'string',
      validation: value => {
        if (!value) return true;
        if (value.length > 500)
          return 'Description must be less than 500 characters';
        return true;
      },
      transform: value => (value ? value.trim() : null),
      description:
        'Detailed description of the subunit (optional, max 500 chars)',
    },
    {
      key: 'unit_of_measurement_id',
      header: 'Unit of Measurement ID',
      width: 25,
      required: true,
      type: 'number',
      validation: value => {
        if (!value) return 'Unit of measurement ID is required';
        const id = parseInt(value);
        if (isNaN(id) || id <= 0)
          return 'Unit of measurement ID must be a positive number';
        return true;
      },
      transform: value => parseInt(value),
      description:
        'ID of the unit of measurement this subunit belongs to (required)',
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
    const units = await prisma.unit_of_measurement.findMany({
      take: 3,
      select: { id: true, name: true },
      orderBy: { id: 'asc' },
    });

    const unitIds = units.map(u => u.id);
    const unitId1 = unitIds[0] || 1;
    const unitId2 = unitIds[1] || 2;
    const unitId3 = unitIds[2] || 3;

    return [
      {
        name: 'Piece',
        code: 'PCS001',
        description: 'Single piece unit',
        unit_of_measurement_id: unitId1,
        is_active: 'Y',
      },
      {
        name: 'Box',
        code: 'BOX001',
        description: 'Standard box packaging',
        unit_of_measurement_id: unitId2,
        is_active: 'Y',
      },
      {
        name: 'Carton',
        code: 'CRT001',
        description: 'Large carton container',
        unit_of_measurement_id: unitId3,
        is_active: 'Y',
      },
      {
        name: 'Pack',
        code: 'PAK001',
        description: 'Multi-item pack',
        unit_of_measurement_id: unitId1,
        is_active: 'Y',
      },
    ];
  }

  protected getColumnDescription(key: string): string {
    const column = this.columns.find(col => col.key === key);
    return column?.description || '';
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(subunit => ({
      id: subunit.id || '',
      name: subunit.name || '',
      code: subunit.code || '',
      description: subunit.description || '',
      unit_of_measurement_id: subunit.unit_of_measurement_id || '',
      unit_of_measurement_name:
        subunit.subunits_unit_of_measurement?.name || '',
      unit_of_measurement_symbol:
        subunit.subunits_unit_of_measurement?.symbol || '',
      is_active: subunit.is_active || 'Y',
      created_date: subunit.createdate
        ? new Date(subunit.createdate).toISOString().split('T')[0]
        : '',
      created_by: subunit.createdby || '',
      updated_date: subunit.updatedate
        ? new Date(subunit.updatedate).toISOString().split('T')[0]
        : '',
      updated_by: subunit.updatedby || '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const prismaClient = tx || prisma;

    if (data.code) {
      const existingByCode = await prismaClient.subunits.findUnique({
        where: { code: data.code },
      });
      if (existingByCode) {
        return `Subunit with code '${data.code}' already exists`;
      }
    }

    if (data.name) {
      const existingByName = await prismaClient.subunits.findFirst({
        where: {
          name: {
            equals: data.name.trim(),
          },
        },
      });
      if (existingByName) {
        return `Subunit with name '${data.name}' already exists`;
      }
    }

    return null;
  }

  protected async validateForeignKeys(
    data: any,
    tx?: any
  ): Promise<string | null> {
    const prismaClient = tx || prisma;

    if (data.unit_of_measurement_id) {
      try {
        const unit = await prismaClient.unit_of_measurement.findUnique({
          where: { id: data.unit_of_measurement_id },
        });
        if (!unit) {
          return `Unit of measurement with ID ${data.unit_of_measurement_id} does not exist`;
        }
        if (unit.is_active !== 'Y') {
          return `Unit of measurement with ID ${data.unit_of_measurement_id} is not active`;
        }
      } catch (error) {
        return `Invalid Unit of measurement ID ${data.unit_of_measurement_id}`;
      }
    }

    return null;
  }

  protected async prepareDataForImport(
    data: any,
    userId: number
  ): Promise<any> {
    let code = data.code;

    if (!code) {
      const prefix = data.name.slice(0, 3).toUpperCase();
      const lastSubunit = await prisma.subunits.findFirst({
        orderBy: { id: 'desc' },
        select: { code: true },
      });

      let newNumber = 1;
      if (lastSubunit && lastSubunit.code) {
        const match = lastSubunit.code.match(/(\d+)$/);
        if (match) {
          newNumber = parseInt(match[1], 10) + 1;
        }
      }

      code = `${prefix}${newNumber.toString().padStart(3, '0')}`;
    }

    return {
      name: data.name,
      code: code,
      description: data.description || null,
      unit_of_measurement_id: data.unit_of_measurement_id,
      is_active: data.is_active || 'Y',
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
    const prismaClient = tx || prisma;

    const existingSubunit = await prismaClient.subunits.findFirst({
      where: {
        OR: [
          data.code ? { code: data.code } : {},
          { name: data.name.trim() },
        ].filter(condition => Object.keys(condition).length > 0),
      },
    });

    if (!existingSubunit) {
      return null;
    }

    const updated = await prismaClient.subunits.update({
      where: { id: existingSubunit.id },
      data: {
        name: data.name,
        code: data.code || existingSubunit.code,
        description: data.description || null,
        unit_of_measurement_id: data.unit_of_measurement_id,
        is_active: data.is_active || existingSubunit.is_active,
        updatedate: new Date(),
        updatedby: userId,
      },
      include: {
        subunits_unit_of_measurement: true,
      },
    });

    return updated;
  }

  async exportToExcel(options: any = {}): Promise<Buffer> {
    const query: any = {
      where: options.filters,
      orderBy: options.orderBy || { createdate: 'desc' },
      include: {
        subunits_unit_of_measurement: {
          select: {
            name: true,
            symbol: true,
            category: true,
          },
        },
      },
    };

    if (options.limit) query.take = options.limit;

    const data = await this.getModel().findMany(query);

    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet(this.displayName);

    const exportColumns = [
      { header: 'Subunit ID', key: 'id', width: 12 },
      ...this.columns,
      {
        header: 'Unit of Measurement Name',
        key: 'unit_of_measurement_name',
        width: 25,
      },
      { header: 'Unit Symbol', key: 'unit_of_measurement_symbol', width: 15 },
      { header: 'Created Date', key: 'created_date', width: 20 },
      { header: 'Created By', key: 'created_by', width: 15 },
      { header: 'Updated Date', key: 'updated_date', width: 20 },
      { header: 'Updated By', key: 'updated_by', width: 15 },
    ];

    worksheet.columns = exportColumns.map(col => ({
      header: col.header,
      key: col.key,
      width: col.width || 20,
    }));

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 25;

    const exportData = await this.transformDataForExport(data);
    let totalSubunits = 0;
    let activeSubunits = 0;
    let inactiveSubunits = 0;
    const unitCount: any = {};

    exportData.forEach((row: any, index: number) => {
      const subunit = data[index] as any;

      row.id = subunit.id;
      row.unit_of_measurement_name =
        subunit.subunits_unit_of_measurement?.name || '';
      row.unit_of_measurement_symbol =
        subunit.subunits_unit_of_measurement?.symbol || '';

      totalSubunits++;
      if (subunit.is_active === 'Y') activeSubunits++;
      if (subunit.is_active === 'N') inactiveSubunits++;

      if (subunit.subunits_unit_of_measurement?.name) {
        unitCount[subunit.subunits_unit_of_measurement.name] =
          (unitCount[subunit.subunits_unit_of_measurement.name] || 0) + 1;
      }

      const excelRow = worksheet.addRow(row);

      if (index % 2 === 0) {
        excelRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF2F2F2' },
        };
      }

      excelRow.eachCell((cell: any) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });

      if (subunit.is_active === 'N') {
        excelRow.getCell('is_active').font = {
          color: { argb: 'FFFF0000' },
          bold: true,
        };
      }
    });

    if (data.length > 0) {
      worksheet.autoFilter = {
        from: 'A1',
        to: `${String.fromCharCode(64 + exportColumns.length)}${data.length + 1}`,
      };
    }

    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 35 },
      { header: 'Value', key: 'value', width: 20 },
    ];

    const summaryHeaderRow = summarySheet.getRow(1);
    summaryHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    summaryHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };

    summarySheet.addRow({ metric: 'Total Subunits', value: totalSubunits });
    summarySheet.addRow({ metric: 'Active Subunits', value: activeSubunits });
    summarySheet.addRow({
      metric: 'Inactive Subunits',
      value: inactiveSubunits,
    });
    summarySheet.addRow({
      metric: 'Active Rate',
      value:
        totalSubunits > 0
          ? `${((activeSubunits / totalSubunits) * 100).toFixed(2)}%`
          : '0%',
    });
    summarySheet.addRow({ metric: '', value: '' });

    summarySheet.addRow({ metric: 'Unit of Measurement Breakdown', value: '' });
    Object.keys(unitCount)
      .sort((a, b) => unitCount[b] - unitCount[a])
      .forEach(unit => {
        summarySheet.addRow({
          metric: `  ${unit}`,
          value: unitCount[unit],
        });
      });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
