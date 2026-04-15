export declare class PriceCalculationService {
    static calculateInvoiceLineItem(params: {
        pricelist_item_id: number;
        quantity: number;
    }): Promise<{
        pricelist_item_id: number;
        product_id: number;
        quantity: number;
        unit_price: number;
        discount_percent: number;
        tax_percent: number;
        discounted_price: number;
        tax_amount: number;
        final_unit_price: number;
        line_total: number;
        price_list_used: {
            id: any;
            name: any;
            level: string;
        };
        product_details: {
            id: any;
            name: any;
            code: any;
            tracking_type: any;
        };
    }>;
    static getPriceListForCustomer(customer_id: number, date?: Date): Promise<{
        level: string;
        priceList: {
            name: string;
            id: number;
            depot_id: number | null;
            is_active: string;
            createdate: Date | null;
            createdby: number;
            updatedate: Date | null;
            updatedby: number | null;
            log_inst: number | null;
            priority: string | null;
            description: string | null;
            base_pricelist_id: number | null;
            factor: import("@prisma/client-runtime-utils").Decimal | null;
            is_default: string;
        };
        reason: string;
    }>;
    private static getPriceListLevel;
}
//# sourceMappingURL=priceCalculation.service.d.ts.map