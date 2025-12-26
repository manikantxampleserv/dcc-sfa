interface MockProductWebOrder {
    name: string;
    code: string;
    is_active: string;
}
declare const mockProductWebOrders: MockProductWebOrder[];
export declare function seedProductWebOrders(): Promise<void>;
export declare function clearProductWebOrders(): Promise<void>;
export { mockProductWebOrders };
//# sourceMappingURL=productWebOrders.seeder.d.ts.map