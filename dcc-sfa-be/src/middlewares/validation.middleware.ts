import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map(err => ({
      field: (err as any).path || (err as any).param,
      message: err.msg,
    }));

    return res.error('Validation failed', 422);
  }

  next();
};
