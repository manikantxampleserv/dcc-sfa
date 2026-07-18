export declare const sapService: {
    createOrUpdateVanInventorySAP(payload: any, userId: number): Promise<{
        finalInventory: {
            id: number | undefined;
            user_id: number | undefined;
            last_updated: Date | null | undefined;
            is_active: string | undefined;
            is_cancelled: string | null | undefined;
            approval_status: string | null | undefined;
            remarks: string | null | undefined;
            createdate: Date | null | undefined;
            createdby: number | undefined;
            updatedate: Date | null | undefined;
            updatedby: number | null | undefined;
            log_inst: number | null | undefined;
            location_id: number | null | undefined;
            location_type: string | null | undefined;
            vehicle_id: number | null | undefined;
            vehicle_code: string | null | undefined;
            sales_person_code: string | null | undefined;
            loading_type: string | undefined;
            status: string | undefined;
            document_date: Date | null | undefined;
            sale_type: string | null | undefined;
            van_inventory_users: {
                name: string;
                id: number;
                email: string;
                employee_id: string;
                sap_code: string | null;
            } | undefined;
            vehicle: {
                model: string | null;
                id: number;
                sap_code: string | null;
                type: string;
                vehicle_number: string;
                make: string | null;
            } | null | undefined;
            van_inventory_depot: {
                name: string;
                id: number;
                sap_code: string | null;
                code: string;
                city: string | null;
            } | null | undefined;
            van_inventory_items_inventory: {
                id: number;
                parent_id: number;
                sap_docnum: string | null;
                sap_docentry: string | null;
                source_system: string | null;
                source_system_label: string | null;
                sap_lineid: string | null;
                remarks: string | null;
                sap_item_code: string | null;
                product_id: number;
                product_name: string | null;
                unit: string | null;
                batch_lot_id: number | null;
                serial_id: number | null;
                quantity: number;
                unit_price: import("@prisma/client-runtime-utils").Decimal;
                discount_amount: import("@prisma/client-runtime-utils").Decimal | null;
                tax_amount: import("@prisma/client-runtime-utils").Decimal | null;
                total_amount: import("@prisma/client-runtime-utils").Decimal | null;
                notes: string | null;
                is_cancelled: string | null;
                van_inventory_items_products: {
                    name: string;
                    id: number;
                    sap_code: string | null;
                    code: string;
                    tracking_type: string | null;
                    product_product_batches: {
                        id: number;
                        quantity: number;
                        batch_lot_product_batches: {
                            id: number;
                            batch_number: string;
                            lot_number: string | null;
                        };
                    }[];
                    product_tax_master: {
                        name: string;
                        id: number;
                        code: string;
                    } | null;
                    product_unit_of_measurement: {
                        name: string;
                        id: number;
                        description: string | null;
                    };
                    serial_numbers_products: {
                        id: number;
                        status: string | null;
                        serial_number: string;
                        warranty_expiry: Date | null;
                        serial_numbers_customers: {
                            name: string;
                            id: number;
                            code: string;
                        } | null;
                    }[];
                };
                van_inventory_items_batch_lot: {
                    id: number;
                    expiry_date: Date;
                    batch_number: string;
                } | null;
                van_inventory_serial: {
                    id: number;
                    serial_number: string;
                } | null;
            }[] | undefined;
            van_inventory_stock_movements: {
                id: number;
                remarks: string | null;
                movement_type: string;
                movement_date: Date | null;
                quantity: number;
            }[] | undefined;
        };
        wasUpdate: boolean;
    }>;
    processApprovedVanInventoryStock(inventoryId: number, userId?: number): Promise<void>;
};
//# sourceMappingURL=sap.service.d.ts.map