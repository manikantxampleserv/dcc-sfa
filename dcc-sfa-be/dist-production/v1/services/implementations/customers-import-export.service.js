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
exports.CustomersImportExportService = void 0;
const import_export_service_1 = require("../base/import-export.service");
const client_1 = require("@prisma/client");
const prisma_client_1 = __importDefault(require("../../../configs/prisma.client"));
class CustomersImportExportService extends import_export_service_1.ImportExportService {
    modelName = 'customers';
    displayName = 'Customers';
    uniqueFields = ['code'];
    searchFields = [
        'name',
        'code',
        'email',
        'phone_number',
        'city',
        'contact_person',
    ];
    async generateCustomerCode(name, tx) {
        try {
            const client = tx || prisma_client_1.default;
            const prefix = name
                .slice(0, 3)
                .toUpperCase()
                .replace(/[^A-Z]/g, 'X');
            const lastCustomer = await client.customers.findFirst({
                orderBy: { id: 'desc' },
                select: { code: true },
            });
            let newNumber = 1;
            if (lastCustomer && lastCustomer.code) {
                const match = lastCustomer.code.match(/(\d+)$/);
                if (match) {
                    newNumber = parseInt(match[1], 10) + 1;
                }
            }
            const code = `${prefix}${newNumber.toString().padStart(3, '0')}`;
            const existingCode = await client.customers.findFirst({
                where: { code: code },
            });
            if (existingCode) {
                newNumber++;
                return `${prefix}${newNumber.toString().padStart(3, '0')}`;
            }
            return code;
        }
        catch (error) {
            console.error('Error generating customer code:', error);
            const prefix = name
                .slice(0, 3)
                .toUpperCase()
                .replace(/[^A-Z]/g, 'X');
            const timestamp = Date.now().toString().slice(-6);
            return `${prefix}${timestamp}`;
        }
    }
    columns = [
        {
            key: 'name',
            header: 'Customer Name',
            width: 30,
            required: true,
            type: 'string',
            validation: value => {
                if (!value || value.length < 2)
                    return 'Customer name must be at least 2 characters';
                if (value.length > 255)
                    return 'Customer name must be less than 255 characters';
                return true;
            },
            description: 'Name of the customer (required, 2-255 characters)',
        },
        {
            key: 'short_name',
            header: 'Short Name',
            width: 20,
            type: 'string',
            validation: value => !value ||
                value.length <= 50 ||
                'Short name must be less than 50 characters',
            description: 'Short name of the customer (optional, max 50 chars)',
        },
        {
            key: 'zones_id',
            header: 'Zone ID',
            width: 15,
            type: 'number',
            transform: value => (value ? parseInt(value) : null),
            description: 'ID of the zone this customer belongs to (optional)',
        },
        {
            key: 'customer_type_id',
            header: 'Customer Type ID',
            width: 18,
            type: 'number',
            transform: value => (value ? parseInt(value) : null),
            description: 'ID of the customer type (optional, must exist in system)',
        },
        {
            key: 'customer_channel_id',
            header: 'Customer Channel ID',
            width: 20,
            type: 'number',
            transform: value => (value ? parseInt(value) : null),
            description: 'ID of the customer channel (optional, must exist in system)',
        },
        {
            key: 'type',
            header: 'Customer Type',
            width: 20,
            type: 'string',
            validation: value => {
                if (!value)
                    return true;
                if (value.length > 50)
                    return 'Customer type must be less than 50 characters';
                const validTypes = [
                    'Retail',
                    'Retailer',
                    'Wholesale',
                    'Wholesaler',
                    'Distributor',
                    'Direct',
                    'Online',
                    'Corporate',
                    'Individual',
                ];
                if (!validTypes.includes(value)) {
                    return `Customer type must be one of: ${validTypes.join(', ')}`;
                }
                return true;
            },
            description: 'Type of customer: Retailer, Wholesaler, Distributor, Direct, Online, Corporate, or Individual (optional)',
        },
        {
            key: 'internal_code_one',
            header: 'Internal Code One',
            width: 20,
            type: 'string',
            validation: value => !value ||
                value.length <= 50 ||
                'Internal code one must be less than 50 characters',
            description: 'First internal code (optional, max 50 chars)',
        },
        {
            key: 'internal_code_two',
            header: 'Internal Code Two',
            width: 20,
            type: 'string',
            validation: value => !value ||
                value.length <= 50 ||
                'Internal code two must be less than 50 characters',
            description: 'Second internal code (optional, max 50 chars)',
        },
        {
            key: 'contact_person',
            header: 'Contact Person',
            width: 30,
            type: 'string',
            validation: value => !value ||
                value.length <= 255 ||
                'Contact person must be less than 255 characters',
            description: 'Name of the primary contact person (optional, max 255 chars)',
        },
        {
            key: 'phone_number',
            header: 'Phone Number',
            width: 20,
            type: 'string',
            validation: value => {
                if (!value)
                    return true;
                if (value.length > 20)
                    return 'Phone number must be less than 20 characters';
                const phoneRegex = /^[\d\s\-\+KATEX_INLINE_OPENKATEX_INLINE_CLOSEext.]+$/i;
                return phoneRegex.test(value) || 'Invalid phone number format';
            },
            description: 'Contact phone number (optional, max 20 chars)',
        },
        {
            key: 'email',
            header: 'Email',
            width: 30,
            type: 'email',
            validation: value => {
                if (!value)
                    return true;
                if (value.length > 255)
                    return 'Email must be less than 255 characters';
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(value) || 'Invalid email format';
            },
            transform: value => (value ? value.toLowerCase().trim() : null),
            description: 'Contact email address (optional, valid email format)',
        },
        {
            key: 'address',
            header: 'Address',
            width: 40,
            type: 'string',
            validation: value => !value ||
                value.length <= 500 ||
                'Address must be less than 500 characters',
            description: 'Street address of the customer (optional, max 500 chars)',
        },
        {
            key: 'city',
            header: 'City',
            width: 25,
            type: 'string',
            validation: value => !value ||
                value.length <= 100 ||
                'City must be less than 100 characters',
            description: 'City where customer is located (optional, max 100 chars)',
        },
        {
            key: 'state',
            header: 'State',
            width: 20,
            type: 'string',
            validation: value => !value ||
                value.length <= 100 ||
                'State must be less than 100 characters',
            description: 'State/Province where customer is located (optional, max 100 chars)',
        },
        {
            key: 'zipcode',
            header: 'Zip Code',
            width: 15,
            type: 'string',
            validation: value => {
                if (!value)
                    return true;
                if (value.length > 20)
                    return 'Zip code must be less than 20 characters';
                if (!/^[A-Z0-9\s-]+$/i.test(value))
                    return 'Invalid zip code format';
                return true;
            },
            description: 'Postal/Zip code (optional, max 20 chars)',
        },
        {
            key: 'latitude',
            header: 'Latitude',
            width: 15,
            type: 'number',
            validation: value => {
                if (!value)
                    return true;
                const lat = parseFloat(value);
                if (isNaN(lat))
                    return 'Latitude must be a number';
                if (lat < -90 || lat > 90)
                    return 'Latitude must be between -90 and 90';
                return true;
            },
            transform: value => (value ? parseFloat(value) : null),
            description: 'Geographic latitude (-90 to 90)',
        },
        {
            key: 'longitude',
            header: 'Longitude',
            width: 15,
            type: 'number',
            validation: value => {
                if (!value)
                    return true;
                const lng = parseFloat(value);
                if (isNaN(lng))
                    return 'Longitude must be a number';
                if (lng < -180 || lng > 180)
                    return 'Longitude must be between -180 and 180';
                return true;
            },
            transform: value => (value ? parseFloat(value) : null),
            description: 'Geographic longitude (-180 to 180)',
        },
        {
            key: 'credit_limit',
            header: 'Credit Limit',
            width: 15,
            type: 'number',
            validation: value => {
                if (!value)
                    return true;
                const amount = parseFloat(value);
                if (isNaN(amount))
                    return 'Credit limit must be a number';
                if (amount < 0)
                    return 'Credit limit cannot be negative';
                if (amount > 999999999999.99)
                    return 'Credit limit exceeds maximum allowed value';
                return true;
            },
            transform: value => (value ? parseFloat(value) : null),
            description: 'Maximum credit limit allowed (optional, positive number, max 999999999999.99)',
        },
        {
            key: 'outstanding_amount',
            header: 'Outstanding Amount',
            width: 18,
            type: 'number',
            defaultValue: 0,
            validation: value => {
                if (!value && value !== 0)
                    return true;
                const amount = parseFloat(value);
                if (isNaN(amount))
                    return 'Outstanding amount must be a number';
                if (amount > 999999999999.99)
                    return 'Outstanding amount exceeds maximum allowed value';
                return true;
            },
            transform: value => value !== null && value !== undefined ? parseFloat(value) : 0,
            description: 'Current outstanding balance (optional, defaults to 0)',
        },
        {
            key: 'route_id',
            header: 'Route ID',
            width: 15,
            type: 'number',
            transform: value => (value ? parseInt(value) : null),
            description: 'ID of the assigned route (optional)',
        },
        {
            key: 'salesperson_id',
            header: 'Salesperson ID',
            width: 15,
            type: 'number',
            transform: value => (value ? parseInt(value) : null),
            description: 'ID of the assigned salesperson/user (optional)',
        },
        {
            key: 'nfc_tag_code',
            header: 'NFC Tag Code',
            width: 20,
            type: 'string',
            validation: value => !value ||
                value.length <= 255 ||
                'NFC tag code must be less than 255 characters',
            description: 'NFC tag code for the customer (optional, max 255 chars)',
        },
        {
            key: 'last_visit_date',
            header: 'Last Visit Date',
            width: 20,
            type: 'date',
            validation: value => {
                if (!value)
                    return true;
                if (isNaN(Date.parse(value)))
                    return 'Invalid date format (use YYYY-MM-DD)';
                const visitDate = new Date(value);
                if (visitDate > new Date())
                    return 'Last visit date cannot be in the future';
                return true;
            },
            transform: value => (value ? new Date(value) : null),
            description: 'Date of last visit (optional, YYYY-MM-DD format, cannot be future date)',
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
        const [zones, customerTypes, customerChannels, routes, users] = await Promise.all([
            prisma_client_1.default.zones.findFirst({ select: { id: true } }),
            prisma_client_1.default.customer_type.findFirst({ select: { id: true } }),
            prisma_client_1.default.customer_channel.findFirst({ select: { id: true } }),
            prisma_client_1.default.routes.findFirst({ select: { id: true } }),
            prisma_client_1.default.users.findFirst({ select: { id: true } }),
        ]);
        return [
            {
                name: 'ABC Retail Store',
                short_name: 'ABC',
                zones_id: zones?.id || '',
                customer_type_id: customerTypes?.id || '',
                customer_channel_id: customerChannels?.id || '',
                type: 'Retailer',
                internal_code_one: 'INT001',
                internal_code_two: 'INT002',
                contact_person: 'John Smith',
                phone_number: '+1-555-0100',
                email: 'john@abcstore.com',
                address: '123 Main Street, Suite 100',
                city: 'New York',
                state: 'NY',
                zipcode: '10001',
                latitude: 40.7128,
                longitude: -74.006,
                credit_limit: 50000.0,
                outstanding_amount: 15000.0,
                route_id: routes?.id || '',
                salesperson_id: users?.id || '',
                nfc_tag_code: 'NFC123456',
                last_visit_date: '2024-01-15',
                is_active: 'Y',
            },
        ];
    }
    getColumnDescription(key) {
        const column = this.columns.find(col => col.key === key);
        return column?.description || '';
    }
    async transformDataForExport(data) {
        return data.map(customer => ({
            name: customer.name,
            short_name: customer.short_name || '',
            code: customer.code,
            zones_id: customer.zones_id || '',
            customer_type_id: customer.customer_type_id || '',
            customer_channel_id: customer.customer_channel_id || '',
            type: customer.type || '',
            internal_code_one: customer.internal_code_one || '',
            internal_code_two: customer.internal_code_two || '',
            contact_person: customer.contact_person || '',
            phone_number: customer.phone_number || '',
            email: customer.email || '',
            address: customer.address || '',
            city: customer.city || '',
            state: customer.state || '',
            zipcode: customer.zipcode || '',
            latitude: customer.latitude ? customer.latitude.toString() : '',
            longitude: customer.longitude ? customer.longitude.toString() : '',
            credit_limit: customer.credit_limit
                ? customer.credit_limit.toString()
                : '',
            outstanding_amount: customer.outstanding_amount
                ? customer.outstanding_amount.toString()
                : '0',
            route_id: customer.route_id || '',
            salesperson_id: customer.salesperson_id || '',
            nfc_tag_code: customer.nfc_tag_code || '',
            last_visit_date: customer.last_visit_date
                ? new Date(customer.last_visit_date).toISOString().split('T')[0]
                : '',
            is_active: customer.is_active || 'Y',
            created_date: customer.createdate
                ? new Date(customer.createdate).toISOString().split('T')[0]
                : '',
            created_by: customer.createdby || '',
            updated_date: customer.updatedate
                ? new Date(customer.updatedate).toISOString().split('T')[0]
                : '',
            updated_by: customer.updatedby || '',
        }));
    }
    async checkDuplicate(data, tx) {
        const model = tx ? tx.customers : prisma_client_1.default.customers;
        if (data.name && data.city) {
            const existingNameCity = await model.findFirst({
                where: {
                    name: data.name,
                    city: data.city,
                },
            });
            if (existingNameCity) {
                return `Customer with name "${data.name}" already exists in city "${data.city}"`;
            }
        }
        return null;
    }
    async validateForeignKeys(data, tx) {
        const prismaClient = tx || prisma_client_1.default;
        if (data.zones_id) {
            try {
                const zone = await prismaClient.zones.findUnique({
                    where: { id: data.zones_id },
                });
                if (!zone) {
                    return `Zone with ID ${data.zones_id} does not exist`;
                }
            }
            catch (error) {
                return `Invalid Zone ID ${data.zones_id}`;
            }
        }
        if (data.customer_type_id) {
            try {
                const customerType = await prismaClient.customer_type.findUnique({
                    where: { id: data.customer_type_id },
                });
                if (!customerType) {
                    return `Customer Type with ID ${data.customer_type_id} does not exist`;
                }
            }
            catch (error) {
                return `Invalid Customer Type ID ${data.customer_type_id}`;
            }
        }
        if (data.customer_channel_id) {
            try {
                const customerChannel = await prismaClient.customer_channel.findUnique({
                    where: { id: data.customer_channel_id },
                });
                if (!customerChannel) {
                    return `Customer Channel with ID ${data.customer_channel_id} does not exist`;
                }
            }
            catch (error) {
                return `Invalid Customer Channel ID ${data.customer_channel_id}`;
            }
        }
        if (data.route_id) {
            try {
                const route = await prismaClient.routes.findUnique({
                    where: { id: data.route_id },
                });
                if (!route) {
                    return `Route with ID ${data.route_id} does not exist`;
                }
            }
            catch (error) {
                return `Invalid Route ID ${data.route_id}`;
            }
        }
        if (data.salesperson_id) {
            try {
                const salesperson = await prismaClient.users.findUnique({
                    where: { id: data.salesperson_id },
                });
                if (!salesperson) {
                    return `Salesperson with ID ${data.salesperson_id} does not exist`;
                }
            }
            catch (error) {
                return `Invalid Salesperson ID ${data.salesperson_id}`;
            }
        }
        return null;
    }
    async prepareDataForImport(data, userId) {
        const preparedData = {
            name: data.name,
            short_name: data.short_name || null,
            zones_id: data.zones_id || null,
            customer_type_id: data.customer_type_id || null,
            customer_channel_id: data.customer_channel_id || null,
            type: data.type || null,
            internal_code_one: data.internal_code_one || null,
            internal_code_two: data.internal_code_two || null,
            contact_person: data.contact_person || null,
            phone_number: data.phone_number || null,
            email: data.email || null,
            address: data.address || null,
            city: data.city || null,
            state: data.state || null,
            zipcode: data.zipcode || null,
            route_id: data.route_id || null,
            salesperson_id: data.salesperson_id || null,
            nfc_tag_code: data.nfc_tag_code || null,
            last_visit_date: data.last_visit_date || null,
            is_active: data.is_active || 'Y',
            createdby: userId,
            createdate: new Date(),
            log_inst: 1,
        };
        if (data.latitude !== null && data.latitude !== undefined) {
            preparedData.latitude = new client_1.Prisma.Decimal(data.latitude);
        }
        if (data.longitude !== null && data.longitude !== undefined) {
            preparedData.longitude = new client_1.Prisma.Decimal(data.longitude);
        }
        if (data.credit_limit !== null && data.credit_limit !== undefined) {
            preparedData.credit_limit = new client_1.Prisma.Decimal(data.credit_limit);
        }
        preparedData.outstanding_amount = new client_1.Prisma.Decimal(data.outstanding_amount !== null && data.outstanding_amount !== undefined
            ? data.outstanding_amount
            : 0);
        return preparedData;
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
                    const generatedCode = await this.generateCustomerCode(row.name, tx);
                    preparedData.code = generatedCode;
                    const created = await tx.customers.create({
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
        const model = tx ? tx.customers : prisma_client_1.default.customers;
        const existing = await model.findFirst({
            where: {
                name: data.name,
                city: data.city || undefined,
            },
        });
        if (!existing)
            return null;
        const updateData = {
            name: data.name,
            short_name: data.short_name !== undefined ? data.short_name : existing.short_name,
            zones_id: data.zones_id !== undefined ? data.zones_id : existing.zones_id,
            customer_type_id: data.customer_type_id !== undefined
                ? data.customer_type_id
                : existing.customer_type_id,
            customer_channel_id: data.customer_channel_id !== undefined
                ? data.customer_channel_id
                : existing.customer_channel_id,
            type: data.type || existing.type,
            internal_code_one: data.internal_code_one !== undefined
                ? data.internal_code_one
                : existing.internal_code_one,
            internal_code_two: data.internal_code_two !== undefined
                ? data.internal_code_two
                : existing.internal_code_two,
            contact_person: data.contact_person !== undefined
                ? data.contact_person
                : existing.contact_person,
            phone_number: data.phone_number !== undefined
                ? data.phone_number
                : existing.phone_number,
            email: data.email !== undefined ? data.email : existing.email,
            address: data.address !== undefined ? data.address : existing.address,
            city: data.city !== undefined ? data.city : existing.city,
            state: data.state !== undefined ? data.state : existing.state,
            zipcode: data.zipcode !== undefined ? data.zipcode : existing.zipcode,
            route_id: data.route_id !== undefined ? data.route_id : existing.route_id,
            salesperson_id: data.salesperson_id !== undefined
                ? data.salesperson_id
                : existing.salesperson_id,
            nfc_tag_code: data.nfc_tag_code !== undefined
                ? data.nfc_tag_code
                : existing.nfc_tag_code,
            last_visit_date: data.last_visit_date || existing.last_visit_date,
            is_active: data.is_active || existing.is_active,
            updatedby: userId,
            updatedate: new Date(),
        };
        if (data.latitude !== null && data.latitude !== undefined) {
            updateData.latitude = new client_1.Prisma.Decimal(data.latitude);
        }
        if (data.longitude !== null && data.longitude !== undefined) {
            updateData.longitude = new client_1.Prisma.Decimal(data.longitude);
        }
        if (data.credit_limit !== null && data.credit_limit !== undefined) {
            updateData.credit_limit = new client_1.Prisma.Decimal(data.credit_limit);
        }
        if (data.outstanding_amount !== null &&
            data.outstanding_amount !== undefined) {
            updateData.outstanding_amount = new client_1.Prisma.Decimal(data.outstanding_amount);
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
                customer_zones: {
                    select: {
                        name: true,
                        code: true,
                    },
                },
                customer_type_customer: {
                    select: {
                        type_name: true,
                        type_code: true,
                    },
                },
                customer_channel_customer: {
                    select: {
                        channel_name: true,
                        channel_code: true,
                    },
                },
                customer_routes: {
                    select: {
                        name: true,
                        code: true,
                    },
                },
                customer_users: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        orders_customers: true,
                        invoices_customers: true,
                        payments_customers: true,
                        visit_customers: true,
                        coolers_customers: true,
                        customer_assets_customers: true,
                        serial_numbers_customers: true,
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
            { header: 'Customer Code', key: 'code', width: 20 },
            ...this.columns,
            { header: 'Zone Name', key: 'zone_name', width: 25 },
            { header: 'Customer Type Name', key: 'customer_type_name', width: 25 },
            {
                header: 'Customer Channel Name',
                key: 'customer_channel_name',
                width: 28,
            },
            { header: 'Route Name', key: 'route_name', width: 25 },
            { header: 'Salesperson Name', key: 'salesperson_name', width: 25 },
            { header: 'Total Orders', key: 'total_orders', width: 15 },
            { header: 'Total Invoices', key: 'total_invoices', width: 15 },
            { header: 'Total Payments', key: 'total_payments', width: 15 },
            { header: 'Total Visits', key: 'total_visits', width: 15 },
            { header: 'Total Assets', key: 'total_assets', width: 15 },
            { header: 'Total Coolers', key: 'total_coolers', width: 15 },
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
        let totalCreditLimit = 0;
        let totalOutstanding = 0;
        let activeCount = 0;
        let inactiveCount = 0;
        exportData.forEach((row, index) => {
            const customer = data[index];
            row.zone_name = customer.customer_zones?.name || '';
            row.customer_type_name = customer.customer_type_customer?.type_name || '';
            row.customer_channel_name =
                customer.customer_channel_customer?.channel_name || '';
            row.route_name = customer.customer_routes?.name || '';
            row.salesperson_name = customer.customer_users?.name || '';
            row.total_orders = customer._count?.orders_customers || 0;
            row.total_invoices = customer._count?.invoices_customers || 0;
            row.total_payments = customer._count?.payments_customers || 0;
            row.total_visits = customer._count?.visit_customers || 0;
            row.total_assets = customer._count?.customer_assets_customers || 0;
            row.total_coolers = customer._count?.coolers_customers || 0;
            if (customer.credit_limit) {
                totalCreditLimit += parseFloat(customer.credit_limit.toString());
            }
            if (customer.outstanding_amount) {
                totalOutstanding += parseFloat(customer.outstanding_amount.toString());
            }
            if (customer.is_active === 'Y') {
                activeCount++;
            }
            else {
                inactiveCount++;
            }
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
            if (customer.is_active === 'N') {
                excelRow.getCell('is_active').font = { color: { argb: 'FFFF0000' } };
            }
            if (customer.outstanding_amount &&
                parseFloat(customer.outstanding_amount.toString()) > 50000) {
                excelRow.getCell('outstanding_amount').font = {
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
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
}
exports.CustomersImportExportService = CustomersImportExportService;
//# sourceMappingURL=customers-import-export.service.js.map