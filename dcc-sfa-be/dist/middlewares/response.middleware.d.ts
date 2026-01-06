export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
    errors?: Record<string, string[]>;
    meta?: {
        total?: number;
        page?: number;
        limit?: number;
        totalPages?: number;
        requestDuration?: number;
        timestamp?: string;
    };
    stats?: any;
}
export declare const responseHandler: (req: any, res: any, next: any) => void;
//# sourceMappingURL=response.middleware.d.ts.map