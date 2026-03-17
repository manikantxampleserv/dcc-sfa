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
exports.BrandsImportExportService = void 0;
const import_export_service_1 = require("../base/import-export.service");
const ExcelJS = __importStar(require("exceljs"));
const prisma_client_1 = __importDefault(require("../../../configs/prisma.client"));
class BrandsImportExportService extends import_export_service_1.ImportExportService {
    modelName = 'brands';
    displayName = 'Brands';
    uniqueFields = ['name'];
    searchFields = ['name', 'code', 'description'];
    columns = [
        {
            key: 'name',
            header: 'Brand Name',
            width: 25,
            required: true,
            type: 'string',
            validation: value => {
                if (!value)
                    return 'Brand name is required';
                if (value.length < 2)
                    return 'Brand name must be at least 2 characters';
                if (value.length > 100)
                    return 'Brand name must not exceed 100 characters';
                return true;
            },
            transform: value => value.toString().trim(),
            description: 'Name of the brand (required, 2-100 characters)',
        },
        {
            key: 'code',
            header: 'Brand Code',
            width: 15,
            type: 'string',
            validation: value => {
                if (value && value.length > 20) {
                    return 'Brand code must not exceed 20 characters';
                }
                return true;
            },
            transform: value => value ? value.toString().trim().toUpperCase() : null,
            description: 'Brand code (optional, max 20 characters, auto-generated if not provided)',
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
            description: 'Description of the brand (optional, max 500 characters)',
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
                name: 'Coca-Cola',
                code: 'COC001',
                description: 'World famous soft drink brand',
                is_active: 'Y',
            },
            {
                name: 'Pepsi',
                code: 'PEP001',
                description: 'Popular cola brand competitor',
                is_active: 'Y',
            },
            {
                name: 'Nike',
                code: 'NIK001',
                description: 'Athletic footwear and apparel brand',
                is_active: 'Y',
            },
            {
                name: 'Adidas',
                code: 'ADI001',
                description: 'German sportswear manufacturer',
                is_active: 'Y',
            },
            {
                name: 'Apple',
                code: 'APP001',
                description: 'Technology and consumer electronics brand',
                is_active: 'N',
            },
        ];
    }
    getColumnDescription() {
        return `
# Brands Import Template

## Required Fields:
- **Brand Name**: Name of the brand (2-100 characters)

## Optional Fields:
- **Brand Code**: Brand code (max 20 characters, auto-generated if not provided)
- **Description**: Description of the brand (max 500 characters)
- **Is Active**: Whether the brand is active (Y/N, defaults to Y)

## Notes:
- Brand names must be unique across the system.
- Brand codes are auto-generated if not provided (first 3 letters + sequential number).
- Active brands are available for use in products and sales targets.
- Inactive brands are hidden but preserved for historical data.
- Description helps users understand the brand purpose.
    `;
    }
    async transformDataForExport(data) {
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
    async checkDuplicate(data, tx) {
        const model = tx ? tx.brands : prisma_client_1.default.brands;
        const existingBrand = await model.findFirst({
            where: {
                name: data.name,
            },
        });
        if (existingBrand) {
            return `Brand "${data.name}" already exists`;
        }
        return null;
    }
    async transformDataForImport(data, userId) {
        // Generate brand code if not provided
        let code = data.code;
        if (!code) {
            const prefix = data.name.slice(0, 3).toUpperCase();
            const lastBrand = await prisma_client_1.default.brands.findFirst({
                orderBy: { id: 'desc' },
                select: { code: true },
            });
            let newNumber = 1;
            if (lastBrand && lastBrand.code) {
                const match = lastBrand.code.match(/(\d+)$/);
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
            is_active: data.is_active || 'Y',
            createdate: new Date(),
            createdby: userId,
            log_inst: 1,
        };
    }
    async validateForeignKeys(data) {
        // Brands don't have foreign key dependencies
        return null;
    }
    async prepareDataForImport(data, userId) {
        return this.transformDataForImport(data, userId);
    }
    async updateExisting(data, userId, tx) {
        const model = tx ? tx.brands : prisma_client_1.default.brands;
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
exports.BrandsImportExportService = BrandsImportExportService;
//# sourceMappingURL=brands-import-export.service.js.map