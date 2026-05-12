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
exports.ProductCategoriesImportExportService = void 0;
const import_export_service_1 = require("../base/import-export.service");
const ExcelJS = __importStar(require("exceljs"));
const prisma_client_1 = __importDefault(require("../../../configs/prisma.client"));
class ProductCategoriesImportExportService extends import_export_service_1.ImportExportService {
    modelName = 'product_categories';
    displayName = 'Product Categories';
    uniqueFields = ['category_name'];
    searchFields = ['category_name', 'description'];
    columns = [
        {
            key: 'category_name',
            header: 'Category Name',
            width: 25,
            required: true,
            type: 'string',
            validation: value => {
                if (!value)
                    return 'Category name is required';
                if (value.length < 2)
                    return 'Category name must be at least 2 characters';
                if (value.length > 100)
                    return 'Category name must not exceed 100 characters';
                return true;
            },
            transform: value => value.toString().trim(),
            description: 'Name of the product category (required, 2-100 characters)',
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
            description: 'Description of the product category (optional, max 500 characters)',
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
                category_name: 'Beverages',
                description: 'All types of beverages including soft drinks, juices, and water',
                is_active: 'Y',
            },
            {
                category_name: 'Snacks',
                description: 'Various snack items like chips, crackers, and nuts',
                is_active: 'Y',
            },
            {
                category_name: 'Dairy Products',
                description: 'Milk, cheese, yogurt, and other dairy items',
                is_active: 'Y',
            },
            {
                category_name: 'Frozen Foods',
                description: 'Frozen meals, ice cream, and frozen vegetables',
                is_active: 'Y',
            },
            {
                category_name: 'Health & Wellness',
                description: 'Health supplements, vitamins, and wellness products',
                is_active: 'N',
            },
        ];
    }
    getColumnDescription() {
        return `
# Product Categories Import Template

## Required Fields:
- **Category Name**: Name of the product category (2-100 characters)

## Optional Fields:
- **Description**: Description of the product category (max 500 characters)
- **Is Active**: Whether the category is active (Y/N, defaults to Y)

## Notes:
- Category names must be unique across the system.
- Active categories are available for use in products and sales targets.
- Inactive categories are hidden but preserved for historical data.
- Description helps users understand the category purpose.
    `;
    }
    async transformDataForExport(data) {
        return data.map(category => ({
            category_name: category.category_name,
            description: category.description || '',
            is_active: category.is_active || 'Y',
            createdate: category.createdate?.toISOString().split('T')[0] || '',
            createdby: category.createdby || '',
            updatedate: category.updatedate?.toISOString().split('T')[0] || '',
            updatedby: category.updatedby || '',
        }));
    }
    async checkDuplicate(data, tx) {
        const model = tx ? tx.product_categories : prisma_client_1.default.product_categories;
        const existingCategory = await model.findFirst({
            where: {
                category_name: data.category_name,
            },
        });
        if (existingCategory) {
            return `Product category "${data.category_name}" already exists`;
        }
        return null;
    }
    async transformDataForImport(data, userId) {
        return {
            category_name: data.category_name,
            description: data.description || null,
            is_active: data.is_active || 'Y',
            createdate: new Date(),
            createdby: userId,
            log_inst: 1,
        };
    }
    async validateForeignKeys(data) {
        // Product categories don't have foreign key dependencies
        return null;
    }
    async prepareDataForImport(data, userId) {
        return this.transformDataForImport(data, userId);
    }
    async updateExisting(data, userId, tx) {
        const model = tx ? tx.product_categories : prisma_client_1.default.product_categories;
        // Find existing record based on unique fields
        const existing = await model.findFirst({
            where: {
                category_name: data.category_name,
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
exports.ProductCategoriesImportExportService = ProductCategoriesImportExportService;
//# sourceMappingURL=productCategories-import-export.service.js.map