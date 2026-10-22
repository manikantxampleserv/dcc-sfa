import { Request, Response, NextFunction } from 'express';
/**
 * Middleware to intercept JSON error responses and log failures to the database,
 * while ignoring routine authentication errors such as access_token_missing.
 *
 * @param req Express Request
 * @param res Express Response
 * @param next Express NextFunction
 */
export declare const errorLogger: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=errorLogger.middleware.d.ts.map