import { Request, Response } from 'express';
export declare const getApiTokens: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getApiTokenById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const revokeApiToken: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const activateApiToken: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deactivateApiToken: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteApiToken: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const revokeAllUserTokens: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=apiTokens.controller.d.ts.map