"use strict";
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
exports.UnitOfMeasurementImportExportService = void 0;
const import_export_service_1 = require("../base/import-export.service");
const ExcelJS = __importStar(require("exceljs"));
const prisma_client_1 = __importDefault(require("../../../configs/prisma.client"));
class UnitOfMeasurementImportExportService extends import_export_service_1.ImportExportService {
    modelName = 'unit_of_measurement';
    displayName = 'Unit of Measurement';
    uniqueFields = ['name'];
    searchFields = ['name', 'description', 'category', 'symbol'];
    columns = [
        {
            key: 'name',
            header: 'Unit Name',
            width: 25,
            required: true,
            type: 'string',
            validation: value => {
                if (!value)
                    return 'Unit name is required';
                if (value.length < 2)
                    return 'Unit name must be at least 2 characters';
                if (value.length > 100)
                    return 'Unit name must not exceed 100 characters';
                return true;
            },
            transform: value => value.toString().trim(),
            description: 'Name of the unit of measurement (required, 2-100 characters)',
        },
        {
            key: 'description',
            header: 'Description',
            width: 30,
            type: 'string',
            validation: value => {
                if (value && value.length > 500) {
                    return 'Description must not exceed 500 characters';
                }
                return true;
            },
            transform: value => (value ? value.toString().trim() : null),
            description: 'Description of the unit (optional, max 500 characters)',
        },
        {
            key: 'category',
            header: 'Category',
            width: 20,
            type: 'string',
            validation: value => {
                if (value && value.length > 50) {
                    return 'Category must not exceed 50 characters';
                }
                return true;
            },
            transform: value => (value ? value.toString().trim() : null),
            description: 'Category of the unit (optional, max 50 characters)',
        },
        {
            key: 'symbol',
            header: 'Symbol',
            width: 15,
            type: 'string',
            validation: value => {
                if (value && value.length > 10) {
                    return 'Symbol must not exceed 10 characters';
                }
                return true;
            },
            transform: value => (value ? value.toString().trim() : null),
            description: 'Symbol for the unit (optional, max 10 characters)',
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
        return [
            {
                name: 'Kilogram',
                description: 'Unit of mass in the metric system',
                category: 'Weight',
                symbol: 'kg',
                is_active: 'Y',
            },
            {
                name: 'Liter',
                description: 'Unit of volume in the metric system',
                category: 'Volume',
                symbol: 'L',
                is_active: 'Y',
            },
            {
                name: 'Meter',
                description: 'Unit of length in the metric system',
                category: 'Length',
                symbol: 'm',
                is_active: 'Y',
            },
            {
                name: 'Piece',
                description: 'Unit for counting individual items',
                category: 'Count',
                symbol: 'pcs',
                is_active: 'Y',
            },
            {
                name: 'Box',
                description: 'Unit for packaged items',
                category: 'Package',
                symbol: 'box',
                is_active: 'N',
            },
        ];
    }
    getColumnDescription() {
        return `
# Unit of Measurement Import Template

## Required Fields:
- **Unit Name**: Name of the unit of measurement (2-100 characters)

## Optional Fields:
- **Description**: Description of the unit (max 500 characters)
- **Category**: Category of the unit (max 50 characters)
- **Symbol**: Symbol for the unit (max 10 characters)
- **Is Active**: Whether the unit is active (Y/N, defaults to Y)

## Notes:
- Unit names must be unique across the system.
- Active units are available for use in products and inventory.
- Inactive units are hidden but preserved for historical data.
- Categories help organize units (e.g., Weight, Volume, Length, Count).
- Symbols are used for display purposes (e.g., kg, L, m, pcs).
    `;
    }
    async transformDataForExport(data) {
        return data.map(unit => ({
            name: unit.name,
            description: unit.description || '',
            category: unit.category || '',
            symbol: unit.symbol || '',
            is_active: unit.is_active || 'Y',
            createdate: unit.createdate?.toISOString().split('T')[0] || '',
            createdby: unit.createdby || '',
            updatedate: unit.updatedate?.toISOString().split('T')[0] || '',
            updatedby: unit.updatedby || '',
        }));
    }
    async checkDuplicate(data, tx) {
        const model = tx ? tx.unit_of_measurement : prisma_client_1.default.unit_of_measurement;
        const existingUnit = await model.findFirst({
            where: {
                name: data.name,
            },
        });
        if (existingUnit) {
            return `Unit of measurement "${data.name}" already exists`;
        }
        return null;
    }
    async transformDataForImport(data, userId) {
        return {
            name: data.name,
            description: data.description || null,
            category: data.category || null,
            symbol: data.symbol || null,
            is_active: data.is_active || 'Y',
            createdate: new Date(),
            createdby: userId,
            log_inst: 1,
        };
    }
    async validateForeignKeys(data) {
        // Unit of measurement doesn't have foreign key dependencies
        return null;
    }
    async prepareDataForImport(data, userId) {
        return this.transformDataForImport(data, userId);
    }
    async updateExisting(data, userId, tx) {
        const model = tx ? tx.unit_of_measurement : prisma_client_1.default.unit_of_measurement;
        // Find existing record based on unique fields
        const existing = await model.findFirst({
            where: {
                name: data.name,
            },
        });
        if (!existing)
            return null;
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
    async exportToExcel(options = {}) {
        const query = {
            where: options.filters,
            orderBy: options.orderBy || { id: 'desc' },
        };
        if (options.limit)
            query.take = options.limit;
        const data = await this.getModel().findMany(query);
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(this.displayName);
        const exportColumns = [
            ...this.columns,
            { header: 'Created Date', key: 'createdate', width: 20 },
            { header: 'Created By', key: 'createdby', width: 15 },
            { header: 'Updated Date', key: 'updatedate', width: 20 },
            { header: 'Updated By', key: 'updatedby', width: 15 },
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
        exportData.forEach((row, index) => {
            const excelRow = worksheet.addRow(row);
            if (index % 2 === 0) {
                excelRow.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFF2F2F2' },
                };
            }
            excelRow.eachCell((cell) => {
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
                to: `${String.fromCharCode(64 + exportColumns.length)}${data.length + 1}`,
            };
        }
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
}
exports.UnitOfMeasurementImportExportService = UnitOfMeasurementImportExportService;
//# sourceMappingURL=unitOfMeasurement-import-export.service.js.map