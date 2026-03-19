"use strict";
// import { ImportExportService } from '../base/import-export.service';
// import { ColumnDefinition } from '../../../types/import-export.types';
// import prisma from '../../../configs/prisma.client';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZonesImportExportService = void 0;
// export class ZonesImportExportService extends ImportExportService<any> {
//   protected modelName = 'zones' as const;
//   protected displayName = 'Zones';
//   protected uniqueFields = ['code'];
//   protected searchFields = ['name', 'code', 'description'];
//   protected columns: ColumnDefinition[] = [
//     {
//       key: 'parent_id',
//       header: 'Parent ID',
//       width: 15,
//       required: true,
//       type: 'number',
//       transform: value => parseInt(value),
//       description: 'ID of the parent zone (required)',
//     },
//     {
//       key: 'depot_id',
//       header: 'Depot ID',
//       width: 15,
//       type: 'number',
//       transform: value => (value ? parseInt(value) : null),
//       description: 'ID of the associated depot (optional)',
//     },
//     {
//       key: 'name',
//       header: 'Name',
//       width: 30,
//       required: true,
//       type: 'string',
//       validation: value => {
//         if (value.length > 255) return 'Name must be less than 255 characters';
//         if (value.length < 2) return 'Name must be at least 2 characters';
//         return true;
//       },
//       description: 'Name of the zone (required, 2-255 characters)',
//     },
//     {
//       key: 'code',
//       header: 'Code',
//       width: 20,
//       required: true,
//       type: 'string',
//       validation: value => {
//         if (value.length > 50) return 'Code must be less than 50 characters';
//         if (!/^[A-Z0-9_-]+$/i.test(value))
//           return 'Code can only contain letters, numbers, hyphens and underscores';
//         return true;
//       },
//       transform: value => value.toUpperCase(),
//       description:
//         'Unique code for the zone (required, max 50 chars, alphanumeric)',
//     },
//     {
//       key: 'description',
//       header: 'Description',
//       width: 40,
//       type: 'string',
//       validation: value =>
//         !value ||
//         value.length <= 500 ||
//         'Description must be less than 500 characters',
//       description: 'Description of the zone (optional, max 500 chars)',
//     },
//     {
//       key: 'supervisor_id',
//       header: 'Supervisor ID',
//       width: 15,
//       type: 'number',
//       transform: value => (value ? parseInt(value) : null),
//       description: 'ID of the supervisor user (optional)',
//     },
//     {
//       key: 'is_active',
//       header: 'Is Active',
//       width: 12,
//       type: 'string',
//       defaultValue: 'Y',
//       validation: value => {
//         const upperValue = value.toString().toUpperCase();
//         return ['Y', 'N'].includes(upperValue) || 'Must be Y or N';
//       },
//       transform: value => value.toString().toUpperCase(),
//       description: 'Active status - Y for Yes, N for No (defaults to Y)',
//     },
//   ];
//   protected async getSampleData(): Promise<any[]> {
//     return [
//       {
//         parent_id: 1,
//         depot_id: 1,
//         name: 'Zone North',
//         code: 'ZN001',
//         description: 'Northern region zone covering areas A, B, C',
//         supervisor_id: 1,
//         is_active: 'Y',
//       },
//       {
//         parent_id: 1,
//         depot_id: 2,
//         name: 'Zone South',
//         code: 'ZS001',
//         description: 'Southern region zone covering areas X, Y, Z',
//         supervisor_id: 2,
//         is_active: 'Y',
//       },
//       {
//         parent_id: 2,
//         depot_id: 1,
//         name: 'Zone East',
//         code: 'ZE001',
//         description: 'Eastern region zone',
//         supervisor_id: 3,
//         is_active: 'N',
//       },
//     ];
//   }
//   protected getColumnDescription(key: string): string {
//     const column = this.columns.find(col => col.key === key);
//     return column?.description || '';
//   }
//   protected async transformDataForExport(data: any[]): Promise<any[]> {
//     return data.map(zone => ({
//       parent_id: zone.parent_id,
//       depot_id: zone.depot_id || '',
//       name: zone.name,
//       code: zone.code,
//       description: zone.description || '',
//       supervisor_id: zone.supervisor_id || '',
//       is_active: zone.is_active,
//       created_date: zone.createdate?.toISOString().split('T')[0] || '',
//       created_by: zone.createdby,
//       updated_date: zone.updatedate?.toISOString().split('T')[0] || '',
//       updated_by: zone.updatedby || '',
//     }));
//   }
//   protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
//     const model = tx ? tx.zones : prisma.zones;
//     const existing = await model.findFirst({
//       where: { code: data.code },
//     });
//     return existing ? `Zone with code ${data.code} already exists` : null;
//   }
//   protected async validateForeignKeys(
//     data: any,
//     tx?: any
//   ): Promise<string | null> {
//     const prismaClient = tx || prisma;
//     if (data.depot_id) {
//       const depot = await prismaClient.depots.findUnique({
//         where: { id: data.depot_id },
//       });
//       if (!depot) {
//         return `Depot with ID ${data.depot_id} does not exist`;
//       }
//     }
//     if (data.supervisor_id) {
//       const supervisor = await prismaClient.users.findUnique({
//         where: { id: data.supervisor_id },
//       });
//       if (!supervisor) {
//         return `Supervisor with ID ${data.supervisor_id} does not exist`;
//       }
//     }
//     return null;
//   }
//   protected async prepareDataForImport(
//     data: any,
//     userId: number
//   ): Promise<any> {
//     return {
//       ...data,
//       createdby: userId,
//       createdate: new Date(),
//       log_inst: 1,
//     };
//   }
//   protected async updateExisting(
//     data: any,
//     userId: number,
//     tx?: any
//   ): Promise<any> {
//     const model = tx ? tx.zones : prisma.zones;
//     const existing = await model.findFirst({
//       where: { code: data.code },
//     });
//     if (!existing) return null;
//     return await model.update({
//       where: { id: existing.id },
//       data: {
//         ...data,
//         updatedby: userId,
//         updatedate: new Date(),
//       },
//     });
//   }
// }
const import_export_service_1 = require("../base/import-export.service");
const prisma_client_1 = __importDefault(require("../../../configs/prisma.client"));
class ZonesImportExportService extends import_export_service_1.ImportExportService {
    modelName = 'zones';
    displayName = 'Zones';
    uniqueFields = ['code'];
    searchFields = ['name', 'code', 'description'];
    masterTableConfigs = [
        {
            masterTable: 'depots',
            masterKey: 'id',
            masterDisplayFields: ['id', 'name', 'code'],
            sheetName: 'Ref - Depots',
            description: 'Use the ID from this sheet in the Depot ID column',
        },
        {
            masterTable: 'users',
            masterKey: 'id',
            masterDisplayFields: ['id', 'name', 'email', 'employee_id'],
            sheetName: 'Ref - Supervisors',
            description: 'Use the ID from this sheet in the Supervisor ID column',
        },
    ];
    async generateZoneCode(name, tx) {
        try {
            const client = tx || prisma_client_1.default;
            const prefix = name
                .slice(0, 3)
                .toUpperCase()
                .replace(/[^A-Z]/g, 'Z');
            const lastZone = await client.zones.findFirst({
                orderBy: { id: 'desc' },
                select: { code: true },
            });
            let newNumber = 1;
            if (lastZone && lastZone.code) {
                const match = lastZone.code.match(/(\d+)$/);
                if (match) {
                    newNumber = parseInt(match[1], 10) + 1;
                }
            }
            const code = `${prefix}${newNumber.toString().padStart(3, '0')}`;
            const existingCode = await client.zones.findFirst({
                where: { code: code },
            });
            if (existingCode) {
                newNumber++;
                return `${prefix}${newNumber.toString().padStart(3, '0')}`;
            }
            return code;
        }
        catch (error) {
            console.error('Error generating zone code:', error);
            const prefix = name
                .slice(0, 3)
                .toUpperCase()
                .replace(/[^A-Z]/g, 'Z');
            const timestamp = Date.now().toString().slice(-6);
            return `${prefix}${timestamp}`;
        }
    }
    columns = [
        {
            key: 'parent_id',
            header: 'Parent ID',
            width: 15,
            required: true,
            type: 'number',
            transform: value => parseInt(value),
            description: 'ID of the parent zone (required)',
        },
        {
            key: 'depot_id',
            header: 'Depot ID',
            width: 15,
            type: 'number',
            transform: value => (value ? parseInt(value) : null),
            description: 'ID of the associated depot (optional)',
        },
        {
            key: 'name',
            header: 'Name',
            width: 30,
            required: true,
            type: 'string',
            validation: value => {
                if (value.length > 255)
                    return 'Name must be less than 255 characters';
                if (value.length < 2)
                    return 'Name must be at least 2 characters';
                return true;
            },
            description: 'Name of the zone (required, 2-255 characters)',
        },
        {
            key: 'code',
            header: 'Code',
            width: 20,
            required: false,
            type: 'string',
            validation: value => {
                if (!value)
                    return true;
                if (value.length > 50)
                    return 'Code must be less than 50 characters';
                if (!/^[A-Z0-9_-]+$/i.test(value))
                    return 'Code can only contain letters, numbers, hyphens and underscores';
                return true;
            },
            transform: value => value ? value.toString().trim().toUpperCase() : null,
            description: 'Unique code for the zone (optional, will be auto-generated if not provided, max 50 chars, alphanumeric)',
        },
        {
            key: 'description',
            header: 'Description',
            width: 40,
            type: 'string',
            validation: value => !value ||
                value.length <= 500 ||
                'Description must be less than 500 characters',
            description: 'Description of the zone (optional, max 500 chars)',
        },
        {
            key: 'supervisor_id',
            header: 'Supervisor ID',
            width: 15,
            type: 'number',
            transform: value => (value ? parseInt(value) : null),
            description: 'ID of the supervisor user (optional)',
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
    async getSampleData() {
        const [depots, users, parentZones] = await Promise.all([
            prisma_client_1.default.depots.findFirst({ select: { id: true } }),
            prisma_client_1.default.users.findFirst({ select: { id: true } }),
            prisma_client_1.default.zones.findFirst({ select: { id: true } }),
        ]);
        return [
            {
                parent_id: parentZones?.id || 1,
                depot_id: depots?.id || 1,
                name: 'Zone North',
                code: 'ZN001',
                description: 'Northern region zone covering areas A, B, C',
                supervisor_id: users?.id || 1,
                is_active: 'Y',
            },
            {
                parent_id: parentZones?.id || 1,
                depot_id: depots?.id || 2,
                name: 'Zone South',
                code: 'ZS001',
                description: 'Southern region zone covering areas X, Y, Z',
                supervisor_id: users?.id || 2,
                is_active: 'Y',
            },
            {
                parent_id: parentZones?.id || 2,
                depot_id: depots?.id || 1,
                name: 'Zone East',
                code: 'ZE001',
                description: 'Eastern region zone',
                supervisor_id: users?.id || 3,
                is_active: 'N',
            },
        ];
    }
    getColumnDescription(key) {
        const column = this.columns.find(col => col.key === key);
        return column?.description || '';
    }
    async transformDataForExport(data) {
        return data.map((zone) => ({
            parent_id: zone.parent_id,
            depot_id: zone.depot_id || '',
            name: zone.name,
            code: zone.code,
            description: zone.description || '',
            supervisor_id: zone.supervisor_id || '',
            is_active: zone.is_active,
            created_date: zone.createdate?.toISOString().split('T')[0] || '',
            created_by: zone.createdby,
            updated_date: zone.updatedate?.toISOString().split('T')[0] || '',
            updated_by: zone.updatedby || '',
        }));
    }
    async checkDuplicate(data, tx) {
        if (!data.code) {
            return null;
        }
        const model = tx ? tx.zones : prisma_client_1.default.zones;
        const existing = await model.findFirst({
            where: { code: data.code },
        });
        return existing ? `Zone with code ${data.code} already exists` : null;
    }
    async validateForeignKeys(data, tx) {
        const prismaClient = tx || prisma_client_1.default;
        if (data.parent_id) {
            try {
                const parentZone = await prismaClient.zones.findUnique({
                    where: { id: data.parent_id },
                });
                if (!parentZone) {
                    return `Parent Zone with ID ${data.parent_id} does not exist`;
                }
            }
            catch (error) {
                return `Invalid Parent Zone ID ${data.parent_id}`;
            }
        }
        if (data.depot_id) {
            try {
                const depot = await prismaClient.depots.findUnique({
                    where: { id: data.depot_id },
                });
                if (!depot) {
                    return `Depot with ID ${data.depot_id} does not exist`;
                }
            }
            catch (error) {
                return `Invalid Depot ID ${data.depot_id}`;
            }
        }
        if (data.supervisor_id) {
            try {
                const supervisor = await prismaClient.users.findUnique({
                    where: { id: data.supervisor_id },
                });
                if (!supervisor) {
                    return `Supervisor with ID ${data.supervisor_id} does not exist`;
                }
            }
            catch (error) {
                return `Invalid Supervisor ID ${data.supervisor_id}`;
            }
        }
        return null;
    }
    async prepareDataForImport(data, userId) {
        return {
            ...data,
            createdby: userId,
            createdate: new Date(),
            log_inst: 1,
        };
    }
    async importData(data, userId, options = {}) {
        let success = 0;
        let failed = 0;
        const errors = [];
        const importedData = [];
        const detailedErrors = [];
        for (const [index, row] of data.entries()) {
            const rowNum = index + 2;
            try {
                const result = await prisma_client_1.default.$transaction(async (tx) => {
                    const duplicateCheck = await this.checkDuplicate(row, tx);
                    if (duplicateCheck) {
                        if (options.skipDuplicates) {
                            throw new Error(`Skipped - ${duplicateCheck}`);
                        }
                        else if (options.updateExisting) {
                            return await this.updateExisting(row, userId, tx);
                        }
                        else {
                            throw new Error(duplicateCheck);
                        }
                    }
                    const fkValidation = await this.validateForeignKeys(row, tx);
                    if (fkValidation) {
                        throw new Error(fkValidation);
                    }
                    const preparedData = await this.prepareDataForImport(row, userId);
                    if (!preparedData.code) {
                        const generatedCode = await this.generateZoneCode(row.name, tx);
                        preparedData.code = generatedCode;
                    }
                    const created = await tx.zones.create({
                        data: preparedData,
                    });
                    return created;
                });
                if (result) {
                    importedData.push(result);
                    success++;
                }
            }
            catch (error) {
                failed++;
                const errorMessage = error.message || 'Unknown error';
                errors.push(`Row ${rowNum}: ${errorMessage}`);
                detailedErrors.push({
                    row: rowNum,
                    errors: [
                        {
                            type: errorMessage.includes('does not exist')
                                ? 'foreign_key'
                                : errorMessage.includes('already exists')
                                    ? 'duplicate'
                                    : 'validation',
                            message: errorMessage,
                            action: 'rejected',
                        },
                    ],
                });
            }
        }
        return {
            success,
            failed,
            errors,
            data: importedData,
            detailedErrors: detailedErrors.length > 0 ? detailedErrors : undefined,
        };
    }
    async updateExisting(data, userId, tx) {
        const model = tx ? tx.zones : prisma_client_1.default.zones;
        const existing = await model.findFirst({
            where: { code: data.code },
        });
        if (!existing)
            return null;
        return await model.update({
            where: { id: existing.id },
            data: {
                ...data,
                updatedby: userId,
                updatedate: new Date(),
            },
        });
    }
    async exportToExcel(options = {}) {
        const query = {
            where: options.filters,
            orderBy: options.orderBy || { id: 'desc' },
            include: {
                depots: {
                    select: {
                        name: true,
                        code: true,
                    },
                },
                users: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                parent: {
                    select: {
                        name: true,
                        code: true,
                    },
                },
                children: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
            },
        };
        if (options.limit)
            query.take = options.limit;
        const data = await this.getModel().findMany(query);
        const ExcelJS = await Promise.resolve().then(() => __importStar(require('exceljs')));
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(this.displayName);
        const exportColumns = [
            { header: 'Zone Code', key: 'code', width: 20 },
            ...this.columns,
            { header: 'Depot Name', key: 'depot_name', width: 25 },
            { header: 'Supervisor Name', key: 'supervisor_name', width: 25 },
            { header: 'Parent Zone Name', key: 'parent_name', width: 25 },
            { header: 'Child Zones Count', key: 'child_count', width: 15 },
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
        data.forEach((zone) => {
            worksheet.addRow({
                code: zone.code,
                parent_id: zone.parent_id,
                depot_id: zone.depot_id || '',
                name: zone.name,
                description: zone.description || '',
                supervisor_id: zone.supervisor_id || '',
                is_active: zone.is_active,
                depot_name: zone.depots?.name || '',
                supervisor_name: zone.users?.name || '',
                parent_name: zone.parent?.name || '',
                child_count: zone.children?.length || 0,
                created_date: zone.createdate?.toISOString().split('T')[0] || '',
                created_by: zone.createdby,
                updated_date: zone.updatedate?.toISOString().split('T')[0] || '',
                updated_by: zone.updatedby || '',
            });
        });
        worksheet.columns.forEach(column => {
            column.alignment = { vertical: 'middle', wrapText: true };
        });
        return workbook.xlsx.writeBuffer();
    }
}
exports.ZonesImportExportService = ZonesImportExportService;
//# sourceMappingURL=zones-import-export.service.js.map