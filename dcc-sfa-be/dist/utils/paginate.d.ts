interface PaginationParams {
    model: any;
    filters?: any;
    page?: number;
    limit?: number;
    select?: any;
    include?: any;
    orderBy?: any;
}
export declare function paginate<T>({ model, filters, page, limit, select, include, orderBy, }: PaginationParams): Promise<{
    data: T[];
    pagination: {
        current_page: number;
        total_pages: number;
        total_count: number;
        has_next: boolean;
        has_previous: boolean;
    };
}>;
export {};
//# sourceMappingURL=paginate.d.ts.map