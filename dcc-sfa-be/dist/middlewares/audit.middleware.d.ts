import { Request, Response, NextFunction } from 'express';
/**
 * Audit middleware wrapper functions
 */
export declare const auditMiddleware: {
    logCreate: (tableName: string, recordId: number, data: any, userId: number, req: Request) => Promise<void>;
    logUpdate: (tableName: string, recordId: number, oldData: any, newData: any, userId: number, req: Request) => Promise<void>;
    logDelete: (tableName: string, recordId: number, data: any, userId: number, req: Request) => Promise<void>;
};
/**
 * Audit Route Middleware
 * Automatically logs CRUD operations at the route level
 */
export declare const auditRoute: (tableName: string, action: "CREATE" | "UPDATE" | "DELETE") => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const auditCreate: (tableName: string) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const auditUpdate: (tableName: string) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const auditDelete: (tableName: string) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=audit.middleware.d.ts.map