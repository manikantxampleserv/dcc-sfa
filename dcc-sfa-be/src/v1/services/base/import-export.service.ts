import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { PrismaClient } from '@prisma/client';
import {
  ColumnDefinition,
  ImportResult,
  ExportOptions,
  ParseResult,
  ImportOptions,
} from '../../../types/import-export.types';

const prisma = new PrismaClient();

export abstract class ImportExportService<T> {
  protected abstract modelName: keyof PrismaClient;
  protected abstract columns: ColumnDefinition[];
  protected abstract displayName: string;
  protected abstract uniqueFields: string[];
  protected abstract searchFields: string[];

  protected getModel() {
    return (prisma as any)[this.modelName];
  }

  async getCount(filters?: any): Promise<number> {
    return await this.getModel().count({
      where: filters,
    });
  }

  getDisplayName(): string {
    return this.displayName;
  }

  getColumns(): ColumnDefinition[] {
    return this.columns;
  }

  getSearchFields(): string[] {
    return this.searchFields;
  }
  private validateValue(value: any, column: ColumnDefinition): string | null {
    if (column.required && !value && value !== 0 && value !== false) {
      return `${column.header} is required`;
    }

    if (!value && !column.required) {
      return null;
    }

    switch (column.type) {
      case 'number':
        if (isNaN(Number(value))) {
          return `${column.header} must be a number`;
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return `${column.header} must be a valid email`;
        }
        break;
      case 'date':
        if (isNaN(Date.parse(value))) {
          return `${column.header} must be a valid date`;
        }
        break;
      case 'boolean':
        const boolValues = ['true', 'false', '1', '0', 'yes', 'no', 'y', 'n'];
        if (!boolValues.includes(value.toString().toLowerCase())) {
          return `${column.header} must be a boolean value`;
        }
        break;
    }

    if (column.validation) {
      const validationResult = column.validation(value);
      if (validationResult !== true) {
        return typeof validationResult === 'string'
          ? validationResult
          : `${column.header} validation failed`;
      }
    }

    return null;
  }

  async parseExcelFile(buffer: Buffer): Promise<ParseResult> {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      const errors: ParseResult['errors'] = [];
      const validData: any[] = [];

      if (jsonData.length === 0) {
        errors.push({
          row: 0,
          column: 'File',
          message: 'The file is empty or has no data rows',
        });
        return { data: [], errors, validCount: 0, totalCount: 0 };
      }

      const fileHeaders = Object.keys(jsonData[0] as any);
      const expectedHeaders = this.columns.map(col => col.header);
      const requiredHeaders = this.columns
        .filter(col => col.required)
        .map(col => col.header);

      const missingHeaders = requiredHeaders.filter(
        header => !fileHeaders.includes(header)
      );

      if (missingHeaders.length > 0) {
        errors.push({
          row: 1,
          column: 'Headers',
          message: `Missing required columns: ${missingHeaders.join(', ')}`,
        });
      }

      jsonData.forEach((row: any, index: number) => {
        const rowNum = index + 2;
        const processedRow: any = {};
        let rowHasError = false;

        this.columns.forEach(column => {
          const value = row[column.header];

          const error = this.validateValue(value, column);
          if (error) {
            errors.push({
              row: rowNum,
              column: column.header,
              message: error,
            });
            rowHasError = true;
            return;
          }

          if (value !== undefined && value !== null && value !== '') {
            if (column.transform) {
              try {
                processedRow[column.key] = column.transform(value);
              } catch (e) {
                errors.push({
                  row: rowNum,
                  column: column.header,
                  message: `Failed to transform value: ${e}`,
                });
                rowHasError = true;
              }
            } else {
              switch (column.type) {
                case 'number':
                  processedRow[column.key] = Number(value);
                  break;
                case 'date':
                  processedRow[column.key] = new Date(value);
                  break;
                case 'boolean':
                  const boolValue = value.toString().toLowerCase();
                  processedRow[column.key] = ['true', '1', 'yes', 'y'].includes(
                    boolValue
                  );
                  break;
                default:
                  processedRow[column.key] = value.toString().trim();
              }
            }
          } else if (column.defaultValue !== undefined) {
            processedRow[column.key] = column.defaultValue;
          }
        });

        if (!rowHasError) {
          validData.push(processedRow);
        }
      });

      return {
        data: validData,
        errors,
        validCount: validData.length,
        totalCount: jsonData.length,
      };
    } catch (error) {
      throw new Error(`Failed to parse Excel file: ${error}`);
    }
  }

  async generateTemplate(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`${this.displayName} Template`);

    worksheet.columns = this.columns.map(col => ({
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

    headerRow.eachCell(cell => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    const sampleData = await this.getSampleData();
    sampleData.forEach((data, index) => {
      const row = worksheet.addRow(data);
      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
      if (index % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF2F2F2' },
        };
      }
    });

    this.columns.forEach((col, colIndex) => {
      if (col.type === 'boolean' || col.key === 'is_active') {
        const column = worksheet.getColumn(colIndex + 1);

        for (
          let rowNum = 2;
          rowNum <= Math.min(sampleData.length + 50, 100);
          rowNum++
        ) {
          const cell = worksheet.getCell(rowNum, colIndex + 1);
          cell.dataValidation = {
            type: 'list',
            allowBlank: !col.required,
            formulae: ['"Y,N"'],
            showErrorMessage: true,
            errorTitle: 'Invalid Value',
            error: 'Please select Y or N',
            prompt: 'Please select Y for Yes or N for No',
            promptTitle: 'Choose Value',
            showInputMessage: true,
          };
        }
      }
    });

    const instructionSheet = workbook.addWorksheet('Instructions');
    instructionSheet.columns = [
      { header: 'Field', key: 'field', width: 25 },
      { header: 'Required', key: 'required', width: 12 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Description', key: 'description', width: 60 },
    ];

    const instructionHeader = instructionSheet.getRow(1);
    instructionHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    instructionHeader.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    instructionHeader.height = 25;

    this.columns.forEach(col => {
      const row = instructionSheet.addRow({
        field: col.header,
        required: col.required ? 'Yes' : 'No',
        type: col.type || 'string',
        description: col.description || this.getColumnDescription(col.key),
      });

      if (col.required) {
        row.getCell('required').font = {
          color: { argb: 'FFFF0000' },
          bold: true,
        };
      }
    });

    instructionSheet.addRow([]);
    instructionSheet.addRow(['GENERAL INSTRUCTIONS:', '', '', '']);
    const instructions = [
      '1. Do not modify the column headers in the template sheet',
      '2. Required fields must be filled for all rows',
      '3. Date format should be YYYY-MM-DD',
      '4. Boolean fields accept: Y/N, Yes/No, True/False, 1/0',
      '5. Remove any empty rows before importing',
      '6. Maximum file size: 10MB',
      '7. Supported formats: .xlsx, .xls, .csv',
    ];

    instructions.forEach(instruction => {
      const row = instructionSheet.addRow([instruction, '', '', '']);
      row.getCell(1).font = { italic: true };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async exportToExcel(options: ExportOptions = {}): Promise<Buffer> {
    const query: any = {
      where: options.filters,
      orderBy: options.orderBy || { id: 'desc' },
    };

    if (options.include) query.include = options.include;
    if (options.select) query.select = options.select;
    if (options.limit) query.take = options.limit;

    const data = await this.getModel().findMany(query);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(this.displayName);

    workbook.creator = 'Import/Export System';
    workbook.created = new Date();
    workbook.modified = new Date();

    worksheet.columns = this.columns.map(col => ({
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
    exportData.forEach((row, index) => {
      const excelRow = worksheet.addRow(row);

      if (index % 2 === 0) {
        excelRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF2F2F2' },
        };
      }

      excelRow.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    if (data.length > 0) {
      worksheet.autoFilter = {
        from: 'A1',
        to: `${String.fromCharCode(64 + this.columns.length)}${data.length + 1}`,
      };
    }

    const summaryRow = worksheet.addRow([]);
    summaryRow.getCell(1).value = `Total Records: ${data.length}`;
    summaryRow.getCell(1).font = { bold: true };

    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async exportToPDF(options: ExportOptions = {}): Promise<Buffer> {
    const query: any = {
      where: options.filters,
      orderBy: options.orderBy || { id: 'desc' },
    };

    if (options.include) query.include = options.include;
    if (options.select) query.select = options.select;
    if (options.limit) query.take = options.limit || 1000;

    const data = await this.getModel().findMany(query);

    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({
          margin: 40,
          size: 'A4',
          layout: this.columns.length > 5 ? 'landscape' : 'portrait',
          bufferPages: true,
        });

        const chunks: Buffer[] = [];
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        doc
          .fontSize(18)
          .font('Helvetica-Bold')
          .text(`${this.displayName} Report`, { align: 'center' });
        doc.moveDown(0.5);

        doc
          .fontSize(10)
          .font('Helvetica')
          .text(`Generated: ${new Date().toLocaleString()}`, {
            align: 'center',
          });
        doc.moveDown(1);

        const pageWidth = doc.page.width - 80;
        const maxColumns = this.columns.length > 7 ? 7 : this.columns.length;
        const columnWidth = pageWidth / maxColumns;
        const startX = 40;
        let currentY = doc.y;

        doc.fontSize(9).font('Helvetica-Bold');
        const pdfColumns = this.columns.slice(0, maxColumns);

        doc.rect(startX, currentY, pageWidth, 20).fill('#4472C4');

        doc.fillColor('white');
        pdfColumns.forEach((col, index) => {
          doc.text(col.header, startX + index * columnWidth + 5, currentY + 5, {
            width: columnWidth - 10,
            height: 20,
            ellipsis: true,
          });
        });

        currentY += 25;
        doc.fillColor('black').font('Helvetica');

        const exportData = await this.transformDataForExport(data);
        let rowCount = 0;

        for (const row of exportData) {
          if (currentY > doc.page.height - 80) {
            doc.addPage();
            currentY = 40;

            doc.fontSize(9).font('Helvetica-Bold');
            doc.rect(startX, currentY, pageWidth, 20).fill('#4472C4');

            doc.fillColor('white');
            pdfColumns.forEach((col, index) => {
              doc.text(
                col.header,
                startX + index * columnWidth + 5,
                currentY + 5,
                {
                  width: columnWidth - 10,
                  height: 20,
                  ellipsis: true,
                }
              );
            });

            currentY += 25;
            doc.fillColor('black').font('Helvetica');
          }

          if (rowCount % 2 === 0) {
            doc.rect(startX, currentY, pageWidth, 18).fill('#F5F5F5');
            doc.fillColor('black');
          }

          doc.fontSize(8);
          pdfColumns.forEach((col, colIndex) => {
            const value = String(row[col.key] || '-');
            doc.text(value, startX + colIndex * columnWidth + 5, currentY + 3, {
              width: columnWidth - 10,
              height: 18,
              ellipsis: true,
            });
          });

          doc
            .moveTo(startX, currentY + 18)
            .lineTo(startX + pageWidth, currentY + 18)
            .stroke('#E0E0E0');

          currentY += 18;
          rowCount++;

          if (rowCount % 30 === 0 && rowCount < exportData.length) {
            doc.addPage();
            currentY = 40;
          }
        }

        const pages = doc.bufferedPageRange();
        for (let i = 0; i < pages.count; i++) {
          doc.switchToPage(i);

          doc
            .fontSize(8)
            .font('Helvetica')
            .text(`Page ${i + 1} of ${pages.count}`, 40, doc.page.height - 30, {
              align: 'center',
            });
        }

        doc.switchToPage(pages.count - 1);
        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .text(`Total Records: ${data.length}`, 40, doc.page.height - 50);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  async importData(
    data: any[],
    userId: number,
    options: ImportOptions = {}
  ): Promise<ImportResult> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];
    const importedData: any[] = [];

    const results = await prisma.$transaction(async tx => {
      for (const [index, row] of data.entries()) {
        try {
          const duplicateCheck = await this.checkDuplicate(row, tx);

          if (duplicateCheck) {
            if (options.skipDuplicates) {
              failed++;
              errors.push(`Row ${index + 2}: Skipped - ${duplicateCheck}`);
              continue;
            } else if (options.updateExisting) {
              const updated = await this.updateExisting(row, userId, tx);
              if (updated) {
                importedData.push(updated);
                success++;
              } else {
                failed++;
                errors.push(
                  `Row ${index + 2}: Failed to update existing record`
                );
              }
              continue;
            } else {
              errors.push(`Row ${index + 2}: ${duplicateCheck}`);
              failed++;
              continue;
            }
          }

          const fkValidation = await this.validateForeignKeys(row, tx);
          if (fkValidation) {
            errors.push(`Row ${index + 2}: ${fkValidation}`);
            failed++;
            continue;
          }

          const preparedData = await this.prepareDataForImport(row, userId);

          const created = await (tx as any)[this.modelName].create({
            data: preparedData,
          });

          importedData.push(created);
          success++;
        } catch (error: any) {
          errors.push(`Row ${index + 2}: ${error.message}`);
          failed++;
        }
      }

      return { success, failed, errors, data: importedData };
    });

    return results;
  }

  async batchImport(
    data: any[],
    userId: number,
    batchSize: number = 100,
    options: ImportOptions = {}
  ): Promise<ImportResult> {
    let totalSuccess = 0;
    let totalFailed = 0;
    const allErrors: string[] = [];
    const allImportedData: any[] = [];

    const batches = Math.ceil(data.length / batchSize);

    for (let i = 0; i < batches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, data.length);
      const batchData = data.slice(start, end);

      const result = await this.importData(batchData, userId, options);

      totalSuccess += result.success;
      totalFailed += result.failed;
      allErrors.push(...result.errors);
      if (result.data) {
        allImportedData.push(...result.data);
      }

      if (options.onProgress) {
        const progress = Math.round(((i + 1) / batches) * 100);
        options.onProgress(progress);
      }
    }

    return {
      success: totalSuccess,
      failed: totalFailed,
      errors: allErrors,
      data: allImportedData,
    };
  }

  protected abstract getSampleData(): Promise<any[]>;
  protected abstract getColumnDescription(key: string): string;
  protected abstract transformDataForExport(data: any[]): Promise<any[]>;
  protected abstract checkDuplicate(
    data: any,
    tx?: any
  ): Promise<string | null>;
  protected abstract validateForeignKeys(
    data: any,
    tx?: any
  ): Promise<string | null>;
  protected abstract prepareDataForImport(
    data: any,
    userId: number
  ): Promise<any>;
  protected abstract updateExisting(
    data: any,
    userId: number,
    tx?: any
  ): Promise<any>;
}
