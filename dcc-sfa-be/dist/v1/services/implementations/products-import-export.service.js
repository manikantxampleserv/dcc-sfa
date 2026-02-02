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
exports.ProductsImportExportService = void 0;
const import_export_service_1 = require("../base/import-export.service");
const ExcelJS = __importStar(require("exceljs"));
const prisma_client_1 = __importDefault(require("../../../configs/prisma.client"));
class ProductsImportExportService extends import_export_service_1.ImportExportService {
    modelName = 'products';
    displayName = 'Products';
    uniqueFields = ['name'];
    searchFields = ['name', 'code', 'description'];
    columns = [
        {
            key: 'name',
            header: 'Product Name',
            width: 25,
            required: true,
            type: 'string',
            validation: value => {
                if (!value)
                    return 'Product name is required';
                if (value.length < 2)
                    return 'Product name must be at least 2 characters';
                if (value.length > 255)
                    return 'Product name must not exceed 255 characters';
                return true;
            },
            transform: value => value.toString().trim(),
            description: 'Name of the product (required, 2-255 characters)',
        },
        {
            key: 'code',
            header: 'Code',
            width: 20,
            type: 'string',
            validation: value => {
                if (value && value.trim() !== '') {
                    if (value.length < 2)
                        return 'Code must be at least 2 characters';
                    if (value.length > 100)
                        return 'Code must be less than 100 characters';
                }
                return true;
            },
            description: 'Product code (optional, will be auto-generated if not provided)',
        },
        {
            key: 'description',
            header: 'Description',
            width: 30,
            type: 'string',
            validation: value => {
                if (value && value.length > 1000) {
                    return 'Description must not exceed 1000 characters';
                }
                return true;
            },
            transform: value => (value ? value.toString().trim() : null),
            description: 'Description of the product (optional, max 1000 characters)',
        },
        {
            key: 'category_id',
            header: 'Category ID',
            width: 15,
            required: true,
            type: 'number',
            validation: value => {
                if (!value)
                    return 'Category ID is required';
                const numValue = Number(value);
                if (isNaN(numValue))
                    return 'Category ID must be a valid number';
                if (numValue < 1)
                    return 'Category ID must be greater than 0';
                return true;
            },
            transform: value => (value ? Number(value) : null),
            description: 'ID of the product category (required, must exist in system)',
        },
        {
            key: 'sub_category_id',
            header: 'Sub-Category ID',
            width: 18,
            required: true,
            type: 'number',
            validation: value => {
                if (!value)
                    return 'Sub-category ID is required';
                const numValue = Number(value);
                if (isNaN(numValue))
                    return 'Sub-category ID must be a valid number';
                if (numValue < 1)
                    return 'Sub-category ID must be greater than 0';
                return true;
            },
            transform: value => (value ? Number(value) : null),
            description: 'ID of the product sub-category (required, must exist in system)',
        },
        {
            key: 'brand_id',
            header: 'Brand ID',
            width: 15,
            required: true,
            type: 'number',
            validation: value => {
                if (!value)
                    return 'Brand ID is required';
                const numValue = Number(value);
                if (isNaN(numValue))
                    return 'Brand ID must be a valid number';
                if (numValue < 1)
                    return 'Brand ID must be greater than 0';
                return true;
            },
            transform: value => (value ? Number(value) : null),
            description: 'ID of the brand (required, must exist in system)',
        },
        {
            key: 'unit_of_measurement',
            header: 'Unit ID',
            width: 12,
            required: true,
            type: 'number',
            validation: value => {
                if (!value)
                    return 'Unit ID is required';
                const numValue = Number(value);
                if (isNaN(numValue))
                    return 'Unit ID must be a valid number';
                if (numValue < 1)
                    return 'Unit ID must be greater than 0';
                return true;
            },
            transform: value => (value ? Number(value) : null),
            description: 'ID of the unit of measurement (required, must exist in system)',
        },
        {
            key: 'base_price',
            header: 'Base Price',
            width: 15,
            type: 'number',
            validation: value => {
                if (value !== null && value !== undefined && value !== '') {
                    const numValue = Number(value);
                    if (isNaN(numValue))
                        return 'Base price must be a valid number';
                    if (numValue < 0)
                        return 'Base price must be at least 0';
                }
                return true;
            },
            transform: value => (value ? Number(value) : null),
            description: 'Base price of the product (optional, must be >= 0)',
        },
        {
            key: 'tax_rate',
            header: 'Tax Rate (%)',
            width: 15,
            type: 'number',
            validation: value => {
                if (value !== null && value !== undefined && value !== '') {
                    const numValue = Number(value);
                    if (isNaN(numValue))
                        return 'Tax rate must be a valid number';
                    if (numValue < 0)
                        return 'Tax rate must be at least 0';
                    if (numValue > 100)
                        return 'Tax rate cannot exceed 100%';
                }
                return true;
            },
            transform: value => (value ? Number(value) : null),
            description: 'Tax rate percentage (optional, 0-100)',
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
        {
            key: 'route_type_id',
            header: 'Route Type ID',
            width: 18,
            type: 'number',
            validation: value => {
                if (value !== null && value !== undefined && value !== '') {
                    const numValue = Number(value);
                    if (isNaN(numValue))
                        return 'Route Type ID must be a valid number';
                    if (numValue < 1)
                        return 'Route Type ID must be greater than 0';
                }
                return true;
            },
            transform: value => (value ? Number(value) : null),
            description: 'ID of the route type (optional, must exist in system)',
        },
        {
            key: 'outlet_group_id',
            header: 'Outlet Group ID',
            width: 20,
            type: 'number',
            validation: value => {
                if (value !== null && value !== undefined && value !== '') {
                    const numValue = Number(value);
                    if (isNaN(numValue))
                        return 'Outlet Group ID must be a valid number';
                    if (numValue < 1)
                        return 'Outlet Group ID must be greater than 0';
                }
                return true;
            },
            transform: value => (value ? Number(value) : null),
            description: 'ID of the outlet group (optional, must exist in system)',
        },
        {
            key: 'tracking_type',
            header: 'Tracking Type',
            width: 18,
            type: 'string',
            validation: value => {
                if (value && value.length > 20) {
                    return 'Tracking type must not exceed 20 characters';
                }
                return true;
            },
            transform: value => (value ? value.toString().trim() : null),
            description: 'Tracking type (optional, max 20 characters)',
        },
        {
            key: 'product_type_id',
            header: 'Product Type ID',
            width: 20,
            type: 'number',
            validation: value => {
                if (value !== null && value !== undefined && value !== '') {
                    const numValue = Number(value);
                    if (isNaN(numValue))
                        return 'Product Type ID must be a valid number';
                    if (numValue < 1)
                        return 'Product Type ID must be greater than 0';
                }
                return true;
            },
            transform: value => (value ? Number(value) : null),
            description: 'ID of the product type (optional, must exist in system)',
        },
        {
            key: 'product_target_group_id',
            header: 'Product Target Group ID',
            width: 25,
            type: 'number',
            validation: value => {
                if (value !== null && value !== undefined && value !== '') {
                    const numValue = Number(value);
                    if (isNaN(numValue))
                        return 'Product Target Group ID must be a valid number';
                    if (numValue < 1)
                        return 'Product Target Group ID must be greater than 0';
                }
                return true;
            },
            transform: value => (value ? Number(value) : null),
            description: 'ID of the product target group (optional, must exist in system)',
        },
        {
            key: 'product_web_order_id',
            header: 'Product Web Order ID',
            width: 25,
            type: 'number',
            validation: value => {
                if (value !== null && value !== undefined && value !== '') {
                    const numValue = Number(value);
                    if (isNaN(numValue))
                        return 'Product Web Order ID must be a valid number';
                    if (numValue < 1)
                        return 'Product Web Order ID must be greater than 0';
                }
                return true;
            },
            transform: value => (value ? Number(value) : null),
            description: 'ID of the product web order (optional, must exist in system)',
        },
        {
            key: 'volume_id',
            header: 'Volume ID',
            width: 15,
            type: 'number',
            validation: value => {
                if (value !== null && value !== undefined && value !== '') {
                    const numValue = Number(value);
                    if (isNaN(numValue))
                        return 'Volume ID must be a valid number';
                    if (numValue < 1)
                        return 'Volume ID must be greater than 0';
                }
                return true;
            },
            transform: value => (value ? Number(value) : null),
            description: 'ID of the product volume (optional, must exist in system)',
        },
        {
            key: 'flavour_id',
            header: 'Flavour ID',
            width: 15,
            type: 'number',
            validation: value => {
                if (value !== null && value !== undefined && value !== '') {
                    const numValue = Number(value);
                    if (isNaN(numValue))
                        return 'Flavour ID must be a valid number';
                    if (numValue < 1)
                        return 'Flavour ID must be greater than 0';
                }
                return true;
            },
            transform: value => (value ? Number(value) : null),
            description: 'ID of the product flavour (optional, must exist in system)',
        },
        {
            key: 'shelf_life_id',
            header: 'Shelf Life ID',
            width: 18,
            type: 'number',
            validation: value => {
                if (value !== null && value !== undefined && value !== '') {
                    const numValue = Number(value);
                    if (isNaN(numValue))
                        return 'Shelf Life ID must be a valid number';
                    if (numValue < 1)
                        return 'Shelf Life ID must be greater than 0';
                }
                return true;
            },
            transform: value => (value ? Number(value) : null),
            description: 'ID of the product shelf life (optional, must exist in system)',
        },
        {
            key: 'subunit_id',
            header: 'Subunit ID',
            width: 15,
            type: 'number',
            validation: value => {
                if (value !== null && value !== undefined && value !== '') {
                    const numValue = Number(value);
                    if (isNaN(numValue))
                        return 'Subunit ID must be a valid number';
                    if (numValue < 1)
                        return 'Subunit ID must be greater than 0';
                }
                return true;
            },
            transform: value => (value ? Number(value) : null),
            description: 'ID of the subunit (optional, must exist in system)',
        },
        {
            key: 'tax_id',
            header: 'Tax ID',
            width: 12,
            type: 'number',
            validation: value => {
                if (value !== null && value !== undefined && value !== '') {
                    const numValue = Number(value);
                    if (isNaN(numValue))
                        return 'Tax ID must be a valid number';
                    if (numValue < 1)
                        return 'Tax ID must be greater than 0';
                }
                return true;
            },
            transform: value => (value ? Number(value) : null),
            description: 'ID of the tax master (optional, must exist in system)',
        },
        {
            key: 'vat_percentage',
            header: 'VAT Percentage (%)',
            width: 18,
            type: 'number',
            validation: value => {
                if (value !== null && value !== undefined && value !== '') {
                    const numValue = Number(value);
                    if (isNaN(numValue))
                        return 'VAT percentage must be a valid number';
                    if (numValue < 0)
                        return 'VAT percentage must be at least 0';
                    if (numValue > 100)
                        return 'VAT percentage cannot exceed 100%';
                }
                return true;
            },
            transform: value => (value ? Number(value) : null),
            description: 'VAT percentage (optional, 0-100)',
        },
        {
            key: 'weight_in_grams',
            header: 'Weight (grams)',
            width: 15,
            type: 'number',
            validation: value => {
                if (value !== null && value !== undefined && value !== '') {
                    const numValue = Number(value);
                    if (isNaN(numValue))
                        return 'Weight must be a valid number';
                    if (numValue < 0)
                        return 'Weight must be at least 0';
                }
                return true;
            },
            transform: value => (value ? Number(value) : null),
            description: 'Weight in grams (optional, must be >= 0)',
        },
        {
            key: 'volume_in_liters',
            header: 'Volume (liters)',
            width: 15,
            type: 'number',
            validation: value => {
                if (value !== null && value !== undefined && value !== '') {
                    const numValue = Number(value);
                    if (isNaN(numValue))
                        return 'Volume must be a valid number';
                    if (numValue < 0)
                        return 'Volume must be at least 0';
                }
                return true;
            },
            transform: value => (value ? Number(value) : null),
            description: 'Volume in liters (optional, must be >= 0)',
        },
    ];
    async getSampleData() {
        const category = await prisma_client_1.default.product_categories.findFirst({
            orderBy: { id: 'asc' },
            select: { id: true },
        });
        const subCategory = await prisma_client_1.default.product_sub_categories.findFirst({
            orderBy: { id: 'asc' },
            select: { id: true },
        });
        const brand = await prisma_client_1.default.brands.findFirst({
            orderBy: { id: 'asc' },
            select: { id: true },
        });
        const unit = await prisma_client_1.default.unit_of_measurement.findFirst({
            orderBy: { id: 'asc' },
            select: { id: true },
        });
        const routeType = await prisma_client_1.default.route_type.findFirst({
            orderBy: { id: 'asc' },
            select: { id: true },
        });
        const outletGroup = await prisma_client_1.default.customer_groups.findFirst({
            orderBy: { id: 'asc' },
            select: { id: true },
        });
        const productType = await prisma_client_1.default.product_type.findFirst({
            orderBy: { id: 'asc' },
            select: { id: true },
        });
        const productTargetGroup = await prisma_client_1.default.product_target_group.findFirst({
            orderBy: { id: 'asc' },
            select: { id: true },
        });
        const productWebOrder = await prisma_client_1.default.product_web_order.findFirst({
            orderBy: { id: 'asc' },
            select: { id: true },
        });
        const volume = await prisma_client_1.default.product_volumes.findFirst({
            orderBy: { id: 'asc' },
            select: { id: true },
        });
        const flavour = await prisma_client_1.default.product_flavours.findFirst({
            orderBy: { id: 'asc' },
            select: { id: true },
        });
        const shelfLife = await prisma_client_1.default.product_shelf_life.findFirst({
            orderBy: { id: 'asc' },
            select: { id: true },
        });
        const subunit = await prisma_client_1.default.subunits.findFirst({
            orderBy: { id: 'asc' },
            select: { id: true },
        });
        const tax = await prisma_client_1.default.tax_master.findFirst({
            orderBy: { id: 'asc' },
            select: { id: true },
        });
        return [
            {
                name: 'Coca Cola Classic',
                code: '',
                description: 'Classic Coca Cola soft drink - 355ml can',
                category_id: category?.id || '',
                sub_category_id: subCategory?.id || '',
                brand_id: brand?.id || '',
                unit_of_measurement: unit?.id || '',
                base_price: 1.99,
                tax_rate: 6.0,
                is_active: 'Y',
                route_type_id: routeType?.id || '',
                outlet_group_id: outletGroup?.id || '',
                tracking_type: 'BATCH',
                product_type_id: productType?.id || '',
                product_target_group_id: productTargetGroup?.id || '',
                product_web_order_id: productWebOrder?.id || '',
                volume_id: volume?.id || '',
                flavour_id: flavour?.id || '',
                shelf_life_id: shelfLife?.id || '',
                subunit_id: subunit?.id || '',
                tax_id: tax?.id || '',
                vat_percentage: 5.0,
                weight_in_grams: 355,
                volume_in_liters: 0.355,
            },
            {
                name: 'Potato Chips - Sour Cream & Onion',
                code: 'POT001',
                description: 'Crispy potato chips with sour cream and onion flavoring - 200g bag',
                category_id: category?.id || '',
                sub_category_id: subCategory?.id || '',
                brand_id: brand?.id || '',
                unit_of_measurement: unit?.id || '',
                base_price: 2.49,
                tax_rate: 6.0,
                is_active: 'Y',
                route_type_id: routeType?.id || '',
                outlet_group_id: outletGroup?.id || '',
                tracking_type: 'BATCH',
                product_type_id: productType?.id || '',
                product_target_group_id: productTargetGroup?.id || '',
                product_web_order_id: productWebOrder?.id || '',
                volume_id: volume?.id || '',
                flavour_id: flavour?.id || '',
                shelf_life_id: shelfLife?.id || '',
                subunit_id: subunit?.id || '',
                tax_id: tax?.id || '',
                vat_percentage: 12.0,
                weight_in_grams: 200,
                volume_in_liters: 0.8,
            },
            {
                name: 'iPhone 15 Pro 256GB',
                description: 'Latest Apple iPhone with advanced camera system, 256GB storage - Titanium Blue',
                category_id: category?.id || '',
                sub_category_id: subCategory?.id || '',
                brand_id: brand?.id || '',
                unit_of_measurement: unit?.id || '',
                base_price: 999.99,
                tax_rate: 8.5,
                is_active: 'Y',
                route_type_id: routeType?.id || '',
                outlet_group_id: outletGroup?.id || '',
                tracking_type: 'SERIAL',
                product_type_id: productType?.id || '',
                product_target_group_id: productTargetGroup?.id || '',
                product_web_order_id: productWebOrder?.id || '',
                volume_id: volume?.id || '',
                flavour_id: flavour?.id || '',
                shelf_life_id: shelfLife?.id || '',
                subunit_id: subunit?.id || '',
                tax_id: tax?.id || '',
                vat_percentage: 8.5,
                weight_in_grams: 221,
                volume_in_liters: 0.00015,
            },
            {
                name: 'Nike Air Zoom Pegasus 40',
                description: 'High-performance running shoes with responsive cushioning - Size 10, Black/White',
                category_id: category?.id || '',
                sub_category_id: subCategory?.id || '',
                brand_id: brand?.id || '',
                unit_of_measurement: unit?.id || '',
                base_price: 129.99,
                tax_rate: 8.0,
                is_active: 'Y',
                route_type_id: routeType?.id || '',
                outlet_group_id: outletGroup?.id || '',
                tracking_type: 'BATCH',
                product_type_id: productType?.id || '',
                product_target_group_id: productTargetGroup?.id || '',
                product_web_order_id: productWebOrder?.id || '',
                volume_id: volume?.id || '',
                flavour_id: flavour?.id || '',
                shelf_life_id: shelfLife?.id || '',
                subunit_id: subunit?.id || '',
                tax_id: tax?.id || '',
                vat_percentage: 8.0,
                weight_in_grams: 280,
                volume_in_liters: 0.001,
            },
            {
                name: 'Ergonomic Office Chair - Executive Model',
                description: 'Premium ergonomic office chair with lumbar support, adjustable armrests, and breathable mesh back - Black',
                category_id: category?.id || '',
                sub_category_id: subCategory?.id || '',
                brand_id: brand?.id || '',
                unit_of_measurement: unit?.id || '',
                base_price: 199.99,
                tax_rate: 8.0,
                is_active: 'N',
                route_type_id: routeType?.id || '',
                outlet_group_id: outletGroup?.id || '',
                tracking_type: 'NONE',
                product_type_id: productType?.id || '',
                product_target_group_id: productTargetGroup?.id || '',
                product_web_order_id: productWebOrder?.id || '',
                volume_id: volume?.id || '',
                flavour_id: flavour?.id || '',
                shelf_life_id: shelfLife?.id || '',
                subunit_id: subunit?.id || '',
                tax_id: tax?.id || '',
                vat_percentage: 15.0,
                weight_in_grams: 15000,
                volume_in_liters: 0.05,
            },
        ];
    }
    getColumnDescription() {
        return `
# Products Import Template

## Required Fields:
- **Product Name**: Name of the product (2-255 characters)
- **Category ID**: ID of the product category (must exist in system)
- **Sub-Category ID**: ID of the product sub-category (must exist in system)
- **Brand ID**: ID of the brand (must exist in system)
- **Unit ID**: ID of the unit of measurement (must exist in system)

## Optional Fields:
- **Code**: Product code (will be auto-generated if not provided)
- **Description**: Description of the product (max 1000 characters)
- **Base Price**: Base price of the product (must be >= 0)
- **Tax Rate (%)**: Tax rate percentage (0-100)
- **Is Active**: Whether the product is active (Y/N, defaults to Y)
- **Route Type ID**: ID of the route type (must exist in system)
- **Outlet Group ID**: ID of the outlet group (must exist in system)
- **Tracking Type**: Tracking type (max 20 characters)
- **Product Type ID**: ID of the product type (must exist in system)
- **Product Target Group ID**: ID of the product target group (must exist in system)
- **Product Web Order ID**: ID of the product web order (must exist in system)
- **Volume ID**: ID of the product volume (must exist in system)
- **Flavour ID**: ID of the product flavour (must exist in system)
- **Shelf Life ID**: ID of the product shelf life (must exist in system)
- **Subunit ID**: ID of the subunit (must exist in system)
- **Tax ID**: ID of the tax master (must exist in system)
- **VAT Percentage (%)**: VAT percentage (0-100)
- **Weight (grams)**: Weight in grams (must be >= 0)
- **Volume (liters)**: Volume in liters (must be >= 0)

## Notes:
- Product names must be unique across the system.
- All ID fields (Category, Sub-Category, Brand, Unit, Route Type, Outlet Group, Product Type, Product Target Group, Product Web Order, Volume, Flavour, Shelf Life, Subunit, Tax) must match existing records in the system.
- Base price and tax rate are optional but must be valid numbers if provided.
- Active products are available for orders and sales.
- Inactive products are hidden but preserved for historical data.
- Use the system's master data to get the correct IDs for all related entities.
    `;
    }
    async transformDataForExport(data) {
        return data.map(product => ({
            name: product.name,
            code: product.code || '',
            description: product.description || '',
            category_id: product.category_id || '',
            sub_category_id: product.sub_category_id || '',
            brand_id: product.brand_id || '',
            unit_of_measurement: product.unit_of_measurement || '',
            base_price: product.base_price || '',
            tax_rate: product.tax_rate || '',
            is_active: product.is_active || 'Y',
            route_type_id: product.route_type_id || '',
            outlet_group_id: product.outlet_group_id || '',
            tracking_type: product.tracking_type || '',
            product_type_id: product.product_type_id || '',
            product_target_group_id: product.product_target_group_id || '',
            product_web_order_id: product.product_web_order_id || '',
            volume_id: product.volume_id || '',
            flavour_id: product.flavour_id || '',
            shelf_life_id: product.shelf_life_id || '',
            subunit_id: product.subunit_id || '',
            tax_id: product.tax_id || '',
            vat_percentage: product.vat_percentage || '',
            weight_in_grams: product.weight_in_grams || '',
            volume_in_liters: product.volume_in_liters || '',
            createdate: product.createdate?.toISOString().split('T')[0] || '',
            createdby: product.createdby || '',
            updatedate: product.updatedate?.toISOString().split('T')[0] || '',
            updatedby: product.updatedby || '',
        }));
    }
    async checkDuplicate(data, tx) {
        const model = tx ? tx.products : prisma_client_1.default.products;
        const existingProduct = await model.findFirst({
            where: {
                name: data.name,
            },
        });
        if (existingProduct) {
            return `Product "${data.name}" already exists`;
        }
        if (data.code && data.code.trim() !== '') {
            const existingCode = await model.findFirst({
                where: {
                    code: data.code.trim(),
                },
            });
            if (existingCode) {
                return `Product with code "${data.code}" already exists`;
            }
        }
        return null;
    }
    async transformDataForImport(data, userId) {
        // Batch validate required fields for better performance
        const requiredValidations = (await Promise.race([
            Promise.all([
                prisma_client_1.default.product_categories.findFirst({
                    where: { id: data.category_id },
                    select: { id: true },
                }),
                prisma_client_1.default.product_sub_categories.findFirst({
                    where: { id: data.sub_category_id },
                    select: { id: true },
                }),
                prisma_client_1.default.brands.findFirst({
                    where: { id: data.brand_id },
                    select: { id: true },
                }),
                prisma_client_1.default.unit_of_measurement.findFirst({
                    where: { id: data.unit_of_measurement },
                    select: { id: true },
                }),
            ]),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Required fields validation timeout')), 8000)),
        ]));
        const [category, subCategory, brand, unit] = requiredValidations;
        if (!category) {
            throw new Error(`Category with ID "${data.category_id}" not found`);
        }
        if (!subCategory) {
            throw new Error(`Sub-category with ID "${data.sub_category_id}" not found`);
        }
        if (!brand) {
            throw new Error(`Brand with ID "${data.brand_id}" not found`);
        }
        if (!unit) {
            throw new Error(`Unit of measurement with ID "${data.unit_of_measurement}" not found`);
        }
        if (data.route_type_id) {
            const routeType = await prisma_client_1.default.route_type.findFirst({
                where: { id: data.route_type_id },
            });
            if (!routeType) {
                throw new Error(`Route type with ID "${data.route_type_id}" not found`);
            }
        }
        if (data.outlet_group_id) {
            const outletGroup = await prisma_client_1.default.customer_groups.findFirst({
                where: { id: data.outlet_group_id },
            });
            if (!outletGroup) {
                throw new Error(`Outlet group with ID "${data.outlet_group_id}" not found`);
            }
        }
        if (data.product_type_id) {
            const productType = await prisma_client_1.default.product_type.findFirst({
                where: { id: data.product_type_id },
            });
            if (!productType) {
                throw new Error(`Product type with ID "${data.product_type_id}" not found`);
            }
        }
        if (data.product_target_group_id) {
            const targetGroup = await prisma_client_1.default.product_target_group.findFirst({
                where: { id: data.product_target_group_id },
            });
            if (!targetGroup) {
                throw new Error(`Product target group with ID "${data.product_target_group_id}" not found`);
            }
        }
        if (data.product_web_order_id) {
            const webOrder = await prisma_client_1.default.product_web_order.findFirst({
                where: { id: data.product_web_order_id },
            });
            if (!webOrder) {
                throw new Error(`Product web order with ID "${data.product_web_order_id}" not found`);
            }
        }
        // Batch validation queries for better performance
        const validationPromises = [];
        if (data.volume_id) {
            validationPromises.push(prisma_client_1.default.product_volumes
                .findFirst({
                where: { id: data.volume_id },
                select: { id: true },
            })
                .then(volume => {
                if (!volume)
                    throw new Error(`Volume with ID "${data.volume_id}" not found`);
            }));
        }
        if (data.flavour_id) {
            validationPromises.push(prisma_client_1.default.product_flavours
                .findFirst({
                where: { id: data.flavour_id },
                select: { id: true },
            })
                .then(flavour => {
                if (!flavour)
                    throw new Error(`Flavour with ID "${data.flavour_id}" not found`);
            }));
        }
        if (data.shelf_life_id) {
            validationPromises.push(prisma_client_1.default.product_shelf_life
                .findFirst({
                where: { id: data.shelf_life_id },
                select: { id: true },
            })
                .then(shelfLife => {
                if (!shelfLife)
                    throw new Error(`Shelf life with ID "${data.shelf_life_id}" not found`);
            }));
        }
        if (data.subunit_id) {
            validationPromises.push(prisma_client_1.default.subunits
                .findFirst({
                where: { id: data.subunit_id },
                select: { id: true },
            })
                .then(subunit => {
                if (!subunit)
                    throw new Error(`Subunit with ID "${data.subunit_id}" not found`);
            }));
        }
        if (data.tax_id) {
            validationPromises.push(prisma_client_1.default.tax_master
                .findFirst({
                where: { id: data.tax_id },
                select: { id: true },
            })
                .then(tax => {
                if (!tax)
                    throw new Error(`Tax master with ID "${data.tax_id}" not found`);
            }));
        }
        // Execute all validations in parallel with timeout
        if (validationPromises.length > 0) {
            try {
                await Promise.race([
                    Promise.all(validationPromises),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Validation timeout')), 10000)),
                ]);
            }
            catch (error) {
                throw error;
            }
        }
        let productCode = data.code && data.code.trim() !== '' ? data.code.trim() : null;
        if (!productCode) {
            const prefix = data.name.slice(0, 3).toUpperCase();
            try {
                // Use a simple query with timeout instead of transaction
                const lastProductPromise = prisma_client_1.default.products.findFirst({
                    orderBy: { id: 'desc' },
                    select: { code: true },
                });
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), 3000));
                const lastProduct = (await Promise.race([
                    lastProductPromise,
                    timeoutPromise,
                ]));
                let newNumber = 1;
                if (lastProduct && lastProduct.code) {
                    const match = lastProduct.code.match(/(\d+)$/);
                    if (match) {
                        newNumber = parseInt(match[1], 10) + 1;
                    }
                }
                // Generate unique code with retry logic
                let attempts = 0;
                while (attempts < 10) {
                    productCode = `${prefix}${newNumber.toString().padStart(3, '0')}`;
                    try {
                        const existingCheckPromise = prisma_client_1.default.products.findUnique({
                            where: { code: productCode },
                            select: { id: true },
                        });
                        const checkTimeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Duplicate check timeout')), 1000));
                        const existing = (await Promise.race([
                            existingCheckPromise,
                            checkTimeoutPromise,
                        ]));
                        if (!existing)
                            break;
                        newNumber++;
                        attempts++;
                    }
                    catch (error) {
                        // If check fails, continue with generated code
                        break;
                    }
                }
            }
            catch (error) {
                // Fallback to timestamp-based code if database query fails
                const timestamp = Date.now().toString().slice(-4);
                productCode = `${prefix}${timestamp}`;
            }
        }
        return {
            name: data.name,
            code: productCode,
            description: data.description || null,
            category_id: data.category_id,
            sub_category_id: data.sub_category_id,
            brand_id: data.brand_id,
            unit_of_measurement: data.unit_of_measurement,
            base_price: data.base_price || null,
            tax_rate: data.tax_rate || null,
            is_active: data.is_active || 'Y',
            route_type_id: data.route_type_id || null,
            outlet_group_id: data.outlet_group_id || null,
            tracking_type: data.tracking_type || null,
            product_type_id: data.product_type_id || null,
            product_target_group_id: data.product_target_group_id || null,
            product_web_order_id: data.product_web_order_id || null,
            volume_id: data.volume_id || null,
            flavour_id: data.flavour_id || null,
            shelf_life_id: data.shelf_life_id || null,
            subunit_id: data.subunit_id || null,
            tax_id: data.tax_id || null,
            vat_percentage: data.vat_percentage || null,
            weight_in_grams: data.weight_in_grams || null,
            volume_in_liters: data.volume_in_liters || null,
            createdate: new Date(),
            createdby: userId,
            log_inst: 1,
        };
    }
    async validateForeignKeys(data, tx) {
        const errors = [];
        const category = await prisma_client_1.default.product_categories.findFirst({
            where: { id: data.category_id },
        });
        if (!category) {
            errors.push(`Category with ID "${data.category_id}" not found`);
        }
        const subCategory = await prisma_client_1.default.product_sub_categories.findFirst({
            where: { id: data.sub_category_id },
        });
        if (!subCategory) {
            errors.push(`Sub-category with ID "${data.sub_category_id}" not found`);
        }
        const brand = await prisma_client_1.default.brands.findFirst({
            where: { id: data.brand_id },
        });
        if (!brand) {
            errors.push(`Brand with ID "${data.brand_id}" not found`);
        }
        const unit = await prisma_client_1.default.unit_of_measurement.findFirst({
            where: { id: data.unit_of_measurement },
        });
        if (!unit) {
            errors.push(`Unit of measurement with ID "${data.unit_of_measurement}" not found`);
        }
        if (data.route_type_id) {
            const routeType = await prisma_client_1.default.route_type.findFirst({
                where: { id: data.route_type_id },
            });
            if (!routeType) {
                errors.push(`Route type with ID "${data.route_type_id}" not found`);
            }
        }
        if (data.outlet_group_id) {
            const outletGroup = await prisma_client_1.default.customer_groups.findFirst({
                where: { id: data.outlet_group_id },
            });
            if (!outletGroup) {
                errors.push(`Outlet group with ID "${data.outlet_group_id}" not found`);
            }
        }
        if (data.product_type_id) {
            const productType = await prisma_client_1.default.product_type.findFirst({
                where: { id: data.product_type_id },
            });
            if (!productType) {
                errors.push(`Product type with ID "${data.product_type_id}" not found`);
            }
        }
        if (data.product_target_group_id) {
            const targetGroup = await prisma_client_1.default.product_target_group.findFirst({
                where: { id: data.product_target_group_id },
            });
            if (!targetGroup) {
                errors.push(`Product target group with ID "${data.product_target_group_id}" not found`);
            }
        }
        if (data.product_web_order_id) {
            const webOrder = await prisma_client_1.default.product_web_order.findFirst({
                where: { id: data.product_web_order_id },
            });
            if (!webOrder) {
                errors.push(`Product web order with ID "${data.product_web_order_id}" not found`);
            }
        }
        if (data.volume_id) {
            const volume = await prisma_client_1.default.product_volumes.findFirst({
                where: { id: data.volume_id },
            });
            if (!volume) {
                errors.push(`Volume with ID "${data.volume_id}" not found`);
            }
        }
        if (data.flavour_id) {
            const flavour = await prisma_client_1.default.product_flavours.findFirst({
                where: { id: data.flavour_id },
            });
            if (!flavour) {
                errors.push(`Flavour with ID "${data.flavour_id}" not found`);
            }
        }
        if (data.shelf_life_id) {
            const shelfLife = await prisma_client_1.default.product_shelf_life.findFirst({
                where: { id: data.shelf_life_id },
            });
            if (!shelfLife) {
                errors.push(`Shelf life with ID "${data.shelf_life_id}" not found`);
            }
        }
        if (data.subunit_id) {
            const subunit = await prisma_client_1.default.subunits.findFirst({
                where: { id: data.subunit_id },
            });
            if (!subunit) {
                errors.push(`Subunit with ID "${data.subunit_id}" not found`);
            }
        }
        if (data.tax_id) {
            const tax = await prisma_client_1.default.tax_master.findFirst({
                where: { id: data.tax_id },
            });
            if (!tax) {
                errors.push(`Tax master with ID "${data.tax_id}" not found`);
            }
        }
        return errors.length > 0 ? errors.join('; ') : null;
    }
    async prepareDataForImport(data, userId) {
        return this.transformDataForImport(data, userId);
    }
    async updateExisting(data, userId, tx) {
        const model = tx ? tx.products : prisma_client_1.default.products;
        const existing = await model.findFirst({
            where: {
                name: data.name,
            },
        });
        if (!existing)
            return null;
        const { code, ...restData } = data;
        const updateData = {
            ...restData,
            ...(code && code.trim() !== '' && { code }),
            route_type_id: data.route_type_id || null,
            outlet_group_id: data.outlet_group_id || null,
            tracking_type: data.tracking_type || null,
            product_type_id: data.product_type_id || null,
            product_target_group_id: data.product_target_group_id || null,
            product_web_order_id: data.product_web_order_id || null,
            volume_id: data.volume_id || null,
            flavour_id: data.flavour_id || null,
            shelf_life_id: data.shelf_life_id || null,
            subunit_id: data.subunit_id || null,
            tax_id: data.tax_id || null,
            vat_percentage: data.vat_percentage || null,
            weight_in_grams: data.weight_in_grams || null,
            volume_in_liters: data.volume_in_liters || null,
            updatedby: userId,
            updatedate: new Date(),
        };
        if (updateData.code && updateData.code !== existing.code) {
            const existingCode = await model.findFirst({
                where: {
                    code: updateData.code,
                    id: { not: existing.id },
                },
            });
            if (existingCode) {
                throw new Error(`Product code "${updateData.code}" already exists`);
            }
        }
        return await model.update({
            where: { id: existing.id },
            data: updateData,
        });
    }
    async exportToExcel(options = {}) {
        const query = {
            where: options.filters,
            orderBy: options.orderBy || { id: 'desc' },
            include: {
                product_brands: true,
                product_unit_of_measurement: true,
                product_categories_products: true,
                product_sub_categories_products: true,
            },
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
exports.ProductsImportExportService = ProductsImportExportService;
//# sourceMappingURL=products-import-export.service.js.map