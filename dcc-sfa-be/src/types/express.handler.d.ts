import { Request, Response, NextFunction } from 'express';

export type RequestHandler = (req: Request, res: Response, next?: NextFunction) => void | Promise<void>;

export interface Controller {
  [key: string]: RequestHandler;
}
