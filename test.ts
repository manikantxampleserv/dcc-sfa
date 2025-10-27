// import { ImportExportService } from '../base/import-export.service';
// import { ColumnDefinition } from '../../../types/import-export.types';
// import { PrismaClient, Prisma } from '@prisma/client';

// const prisma = new PrismaClient({
//   log: ['error', 'warn'],
// });

// export class SalesTargetGroupsImportExportService extends ImportExportService<any> {
//   protected modelName = 'sales_target_groups' as const;
//   protected displayName = 'Sales Target Groups';
//   protected uniqueFields = ['group_name'];
//   protected searchFields = ['group_name', 'description'];

//   protected columns: ColumnDefinition[] = [
//     {
//       key: 'group_name',
//       header: 'Group Name',
//       width: 30,
//       required: true,
//       type: 'string',
//       validation: value => {
//         if (!value || value.length < 2)
//           return 'Group name must be at least 2 characters';
//         if (value.length > 255)
//           return 'Group name must be less than 255 characters';
//         return true;
//       },
//       description:
//         'Name of the sales target group (required, 2-255 characters)',
//     },
//     {
//       key: 'description',
//       header: 'Description',
//       width: 50,
//       type: 'string',
//       validation: value =>
//         !value ||
//         value.length <= 1000 ||
//         'Description must be less than 1000 characters',
//       description:
//         'Description of the sales target group (optional, max 1000 chars)',
//     },
//     {
//       key: 'is_active',
//       header: 'Is Active',
//       width: 12,
//       type: 'string',
//       defaultValue: 'Y',
//       validation: value => {
//         const upperValue = value ? value.toString().toUpperCase() : 'Y';
//         return ['Y', 'N'].includes(upperValue) || 'Must be Y or N';
//       },
//       transform: value => (value ? value.toString().toUpperCase() : 'Y'),
//       description: 'Active status - Y for Yes, N for No (defaults to Y)',
//     },
//   ];

//   protected async getSampleData(): Promise<any[]> {
//     return [
//       {
//         group_name: 'North Region Sales Team',
//         description: 'Sales team covering northern territories',
//         is_active: 'Y',
//       },
//       {
//         group_name: 'South Region Sales Team',
//         description: 'Sales team covering southern territories',
//         is_active: 'Y',
//       },
//       {
//         group_name: 'Enterprise Sales Division',
//         description: 'Specialized team for enterprise-level clients',
//         is_active: 'Y',
//       },
//       {
//         group_name: 'Retail Sales Group',
//         description: 'Team focused on retail customer segment',
//         is_active: 'Y',
//       },
//       {
//         group_name: 'Q1 2024 Target Group',
//         description: 'Special target group for first quarter 2024',
//         is_active: 'Y',
//       },
//     ];
//   }

//   protected getColumnDescription(key: string): string {
//     const column = this.columns.find(col => col.key === key);
//     return column?.description || '';
//   }

//   protected async transformDataForExport(data: any[]): Promise<any[]> {
//     return data.map(group => ({
//       group_name: group.group_name,
//       description: group.description || '',
//       is_active: group.is_active || 'Y',
//       created_date: group.createdate
//         ? new Date(group.createdate).toISOString().split('T')[0]
//         : '',
//       created_by: group.createdby || '',
//       updated_date: group.updatedate
//         ? new Date(group.updatedate).toISOString().split('T')[0]
//         : '',
//       updated_by: group.updatedby || '',
//     }));
//   }

//   protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
//     const model = tx ? tx.sales_target_groups : prisma.sales_target_groups;

//     // Check for duplicate group name
//     if (data.group_name) {
//       const allGroups = await model.findMany({
//         select: {
//           id: true,
//           group_name: true,
//         },
//       });

//       // Case-insensitive comparison
//       const existingGroup = allGroups.find(
//         g => g.group_name.toLowerCase() === data.group_name.toLowerCase()
//       );

//       if (existingGroup) {
//         return `Sales target group with name "${data.group_name}" already exists`;
//       }
//     }

//     return null;
//   }

//   protected async validateForeignKeys(
//     data: any,
//     tx?: any
//   ): Promise<string | null> {
//     // Sales target groups doesn't have foreign keys in the main table
//     return null;
//   }

//   protected async prepareDataForImport(
//     data: any,
//     userId: number
//   ): Promise<any> {
//     const preparedData: any = {
//       group_name: data.group_name,
//       description: data.description || null,
//       is_active: data.is_active || 'Y',
//       createdby: userId,
//       createdate: new Date(),
//       log_inst: 1,
//     };

//     return preparedData;
//   }

//   async importData(
//     data: any[],
//     userId: number,
//     options: any = {}
//   ): Promise<any> {
//     let success = 0;
//     let failed = 0;
//     const errors: string[] = [];
//     const importedData: any[] = [];
//     const detailedErrors: any[] = [];

//     for (const [index, row] of data.entries()) {
//       const rowNum = index + 2;

//       try {
//         // Validate outside transaction
//         const duplicateCheck = await this.checkDuplicate(row);

//         if (duplicateCheck) {
//           if (options.skipDuplicates) {
//             failed++;
//             errors.push(`Row ${rowNum}: Skipped - ${duplicateCheck}`);
//             continue;
//           } else if (options.updateExisting) {
//             const updated = await this.updateExisting(row, userId);
//             if (updated) {
//               importedData.push(updated);
//               success++;
//             }
//             continue;
//           } else {
//             throw new Error(duplicateCheck);
//           }
//         }

//         const fkValidation = await this.validateForeignKeys(row);
//         if (fkValidation) {
//           throw new Error(fkValidation);
//         }

//         // Create group
//         const preparedData = await this.prepareDataForImport(row, userId);

//         const created = await prisma.sales_target_groups.create({
//           data: preparedData,
//         });

//         importedData.push(created);
//         success++;
//       } catch (error: any) {
//         failed++;
//         const errorMessage = error.message || 'Unknown error';
//         errors.push(`Row ${rowNum}: ${errorMessage}`);
//         detailedErrors.push({
//           row: rowNum,
//           errors: [
//             {
//               type: errorMessage.includes('does not exist')
//                 ? 'foreign_key'
//                 : errorMessage.includes('already exists')
//                   ? 'duplicate'
//                   : 'validation',
//               message: errorMessage,
//               action: 'rejected',
//             },
//           ],
//         });
//       }
//     }

//     return {
//       success,
//       failed,
//       errors,
//       data: importedData,
//       detailedErrors: detailedErrors.length > 0 ? detailedErrors : undefined,
//     };
//   }

//   protected async updateExisting(
//     data: any,
//     userId: number,
//     tx?: any
//   ): Promise<any> {
//     const model = tx ? tx.sales_target_groups : prisma.sales_target_groups;

//     // Find existing group by name (case-insensitive)
//     const allGroups = await model.findMany({
//       select: {
//         id: true,
//         group_name: true,
//         description: true,
//         is_active: true,
//       },
//     });

//     const existing = allGroups.find(
//       g => g.group_name.toLowerCase() === data.group_name.toLowerCase()
//     );

//     if (!existing) return null;

//     const updateData: any = {
//       group_name: data.group_name,
//       description:
//         data.description !== undefined
//           ? data.description
//           : existing.description,
//       is_active: data.is_active || existing.is_active,
//       updatedby: userId,
//       updatedate: new Date(),
//     };

//     return await model.update({
//       where: { id: existing.id },
//       data: updateData,
//     });
//   }

//   async exportToExcel(options: any = {}): Promise<Buffer> {
//     const query: any = {
//       where: options.filters,
//       orderBy: options.orderBy || { id: 'desc' },
//       include: {
//         _count: {
//           select: {
//             sales_target_group_members_id: true,
//             sales_targets_groups: true,
//           },
//         },
//       },
//     };

//     if (options.limit) query.take = options.limit;

//     const data = await this.getModel().findMany(query);

//     const ExcelJS = await import('exceljs');
//     const workbook = new ExcelJS.Workbook();

//     const worksheet = workbook.addWorksheet(this.displayName);

//     const exportColumns = [
//       { header: 'Group ID', key: 'id', width: 12 },
//       ...this.columns,
//       { header: 'Members Count', key: 'members_count', width: 18 },
//       { header: 'Targets Count', key: 'targets_count', width: 18 },
//       { header: 'Created Date', key: 'created_date', width: 20 },
//       { header: 'Created By', key: 'created_by', width: 15 },
//       { header: 'Updated Date', key: 'updated_date', width: 20 },
//       { header: 'Updated By', key: 'updated_by', width: 15 },
//     ];

//     worksheet.columns = exportColumns.map(col => ({
//       header: col.header,
//       key: col.key,
//       width: col.width || 20,
//     }));

//     const headerRow = worksheet.getRow(1);
//     headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
//     headerRow.fill = {
//       type: 'pattern',
//       pattern: 'solid',
//       fgColor: { argb: 'FF4472C4' },
//     };
//     headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
//     headerRow.height = 25;

//     const exportData = await this.transformDataForExport(data);
//     let totalGroups = 0;
//     let activeGroups = 0;
//     let inactiveGroups = 0;
//     let totalMembers = 0;
//     let totalTargets = 0;

//     exportData.forEach((row: any, index: number) => {
//       const group = data[index] as any;

//       row.id = group.id;
//       row.members_count = group._count?.sales_target_group_members_id || 0;
//       row.targets_count = group._count?.sales_targets_groups || 0;

//       totalGroups++;
//       if (group.is_active === 'Y') {
//         activeGroups++;
//       } else {
//         inactiveGroups++;
//       }

//       totalMembers += row.members_count;
//       totalTargets += row.targets_count;

//       const excelRow = worksheet.addRow(row);

//       // Alternate row colors
//       if (index % 2 === 0) {
//         excelRow.fill = {
//           type: 'pattern',
//           pattern: 'solid',
//           fgColor: { argb: 'FFF2F2F2' },
//         };
//       }

//       // Add borders
//       excelRow.eachCell((cell: any) => {
//         cell.border = {
//           top: { style: 'thin' },
//           left: { style: 'thin' },
//           bottom: { style: 'thin' },
//           right: { style: 'thin' },
//         };
//       });

//       // Highlight inactive groups
//       if (group.is_active === 'N') {
//         excelRow.getCell('is_active').font = {
//           color: { argb: 'FFFF0000' },
//           bold: true,
//         };
//       }

//       // Highlight groups with many members
//       if (row.members_count > 10) {
//         excelRow.getCell('members_count').font = {
//           color: { argb: 'FF0000FF' },
//           bold: true,
//         };
//       }

//       // Highlight groups with many targets
//       if (row.targets_count > 5) {
//         excelRow.getCell('targets_count').font = {
//           color: { argb: 'FF008000' },
//           bold: true,
//         };
//       }
//     });

//     // Add filters
//     if (data.length > 0) {
//       worksheet.autoFilter = {
//         from: 'A1',
//         to: `${String.fromCharCode(64 + exportColumns.length)}${data.length + 1}`,
//       };
//     }

//     // Freeze header row
//     worksheet.views = [{ state: 'frozen', ySplit: 1 }];

//     // Add summary sheet
//     const summarySheet = workbook.addWorksheet('Summary');
//     summarySheet.columns = [
//       { header: 'Metric', key: 'metric', width: 30 },
//       { header: 'Value', key: 'value', width: 20 },
//     ];

//     const summaryHeaderRow = summarySheet.getRow(1);
//     summaryHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
//     summaryHeaderRow.fill = {
//       type: 'pattern',
//       pattern: 'solid',
//       fgColor: { argb: 'FF4472C4' },
//     };

//     // Add summary data
//     summarySheet.addRow({ metric: 'Total Groups', value: totalGroups });
//     summarySheet.addRow({ metric: 'Active Groups', value: activeGroups });
//     summarySheet.addRow({ metric: 'Inactive Groups', value: inactiveGroups });
//     summarySheet.addRow({ metric: 'Total Members', value: totalMembers });
//     summarySheet.addRow({ metric: 'Total Targets', value: totalTargets });
//     summarySheet.addRow({
//       metric: 'Average Members Per Group',
//       value: totalGroups > 0 ? (totalMembers / totalGroups).toFixed(2) : '0',
//     });
//     summarySheet.addRow({
//       metric: 'Average Targets Per Group',
//       value: totalGroups > 0 ? (totalTargets / totalGroups).toFixed(2) : '0',
//     });

//     const buffer = await workbook.xlsx.writeBuffer();
//     return Buffer.from(buffer);
//   }
// }

// model product_brands {
//     id          Int       @id() @default(autoincrement())
//     name        String    @unique() @db.NVarChar(255)
//     code        String    @unique() @db.NVarChar(50)
//     description String?   @db.NVarChar(500)
//     logo_url    String?   @db.NVarChar(500)
//     website     String?   @db.NVarChar(255)
//     is_active   String    @default("Y") @db.Char(1)
//     createdate  DateTime? @default(now()) @db.DateTime
//     createdby   Int
//     updatedate  DateTime? @db.DateTime
//     updatedby   Int?
//     log_inst    Int?
//     products    products[]
//   }

//   model units_of_measure {
//     id              Int       @id() @default(autoincrement())
//     name            String    @unique() @db.NVarChar(100)
//     code            String    @unique() @db.NVarChar(20)
//     description     String?   @db.NVarChar(255)
//     category        String?   @db.NVarChar(50) // e.g., 'weight', 'volume', 'quantity', 'length'
//     conversion_factor Decimal? @db.Decimal(18, 6) // For conversion to base unit
//     base_unit_id    Int?     // Reference to base unit for conversion
//     symbol          String?   @db.NVarChar(10) // e.g., 'kg', 'L', 'pcs'
//     decimal_places  Int?      @default(2)
//     is_base_unit    Boolean?  @default(false)
//     is_active       String    @default("Y") @db.Char(1)
//     createdate      DateTime? @default(now()) @db.DateTime
//     createdby       Int
//     updatedate      DateTime? @db.DateTime
//     updatedby       Int?
//     log_inst        Int?

//     // Self-relation for base unit reference
//     base_unit       units_of_measure? @relation("UnitToBaseUnit", fields: [base_unit_id], references: [id], onDelete: NoAction, onUpdate: NoAction)
//     derived_units   units_of_measure[] @relation("UnitToBaseUnit")
//   }
