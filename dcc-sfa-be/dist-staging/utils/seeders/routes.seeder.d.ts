interface MockRoute {
    code: string;
    name?: string;
    description?: string;
    is_active: string;
}
declare const mockRoutes: MockRoute[];
export declare function seedRoutes(): Promise<void>;
export declare function clearRoutes(): Promise<void>;
export { mockRoutes };
//# sourceMappingURL=routes.seeder.d.ts.map