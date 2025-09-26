import { Request, Response, NextFunction } from 'express';
import {
  validationResult,
  ValidationError,
  AlternativeValidationError,
} from 'express-validator';

type MyValidationError = ValidationError | AlternativeValidationError;

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err: MyValidationError) => {
      const field =
        'param' in err ? err.param : 'path' in err ? err.path : 'unknown';

      return {
        field,
        message: err.msg,
      };
    });

    return res.status(422).json({
      success: false,
      message: 'Please fill all required fields',
      errors: extractedErrors,
    });
  }

  next();
};
