"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSchemas = void 0;
exports.swaggerSchemas = {
    User: {
        type: 'object',
        properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            email: { type: 'string' },
            phone_number: { type: 'string' },
            profile_image: { type: 'string' },
        },
    },
    Pagination: {
        type: 'object',
        properties: {
            current_page: { type: 'integer' },
            per_page: { type: 'integer' },
            total_pages: { type: 'integer' },
            total_count: { type: 'integer' },
            has_next: { type: 'boolean' },
            has_prev: { type: 'boolean' },
        },
    },
    ApiResponse: {
        type: 'object',
        properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
            pagination: { $ref: '#/components/schemas/Pagination' },
        },
    },
    VanInventoryItem: {
        type: 'object',
        properties: {
            id: { type: 'integer' },
            parent_id: { type: 'integer' },
            product_id: { type: 'integer' },
            product_name: { type: 'string' },
            unit: { type: 'string' },
            quantity: { type: 'string' },
            unit_price: { type: 'string' },
            discount_amount: { type: 'string' },
            tax_amount: { type: 'string' },
            total_amount: { type: 'string' },
            notes: { type: 'string' },
            batch_number: { type: 'string' },
            lot_number: { type: 'string' },
            expiry_date: { type: 'string', format: 'date' },
        },
    },
};
//# sourceMappingURL=swagger-schemas.js.map