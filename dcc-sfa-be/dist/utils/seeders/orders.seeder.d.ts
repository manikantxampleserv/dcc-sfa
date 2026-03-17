interface MockOrder {
    order_number: string;
    order_date?: Date;
    delivery_date?: Date;
    status?: string;
    priority?: string;
    order_type?: string;
    payment_method?: string;
    payment_terms?: string;
    subtotal?: number;
    discount_amount?: number;
    tax_amount?: number;
    shipping_amount?: number;
    total_amount?: number;
    notes?: string;
    shipping_address?: string;
    approval_status?: string;
    approved_at?: Date;
    is_active: string;
}
declare const mockOrders: MockOrder[];
export declare function seedOrders(): Promise<void>;
export declare function clearOrders(): Promise<void>;
export { mockOrders };
//# sourceMappingURL=orders.seeder.d.ts.map