export declare const swaggerSchemas: {
    User: {
        type: string;
        properties: {
            id: {
                type: string;
            };
            name: {
                type: string;
            };
            email: {
                type: string;
            };
            phone_number: {
                type: string;
            };
            profile_image: {
                type: string;
            };
        };
    };
    Pagination: {
        type: string;
        properties: {
            current_page: {
                type: string;
            };
            per_page: {
                type: string;
            };
            total_pages: {
                type: string;
            };
            total_count: {
                type: string;
            };
            has_next: {
                type: string;
            };
            has_prev: {
                type: string;
            };
        };
    };
    ApiResponse: {
        type: string;
        properties: {
            success: {
                type: string;
            };
            message: {
                type: string;
            };
            data: {
                type: string;
            };
            pagination: {
                $ref: string;
            };
        };
    };
    VanInventoryItem: {
        type: string;
        properties: {
            id: {
                type: string;
            };
            parent_id: {
                type: string;
            };
            product_id: {
                type: string;
            };
            product_name: {
                type: string;
            };
            unit: {
                type: string;
            };
            quantity: {
                type: string;
            };
            unit_price: {
                type: string;
            };
            discount_amount: {
                type: string;
            };
            tax_amount: {
                type: string;
            };
            total_amount: {
                type: string;
            };
            notes: {
                type: string;
            };
            batch_number: {
                type: string;
            };
            lot_number: {
                type: string;
            };
            expiry_date: {
                type: string;
                format: string;
            };
        };
    };
};
//# sourceMappingURL=swagger-schemas.d.ts.map