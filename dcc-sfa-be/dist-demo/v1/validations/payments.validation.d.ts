import { ValidationChain } from 'express-validator';
/**
 * Validate payment data
 * @param data - Payment data to validate
 * @returns Validation result
 */
export declare const validatePaymentData: (data: any) => {
    isValid: boolean;
    errors: string[];
};
/**
 * Express validation middleware for creating payment
 */
export declare const validateCreatePayment: ValidationChain[];
/**
 * Express validation middleware for updating payment
 */
export declare const validateUpdatePayment: ValidationChain[];
//# sourceMappingURL=payments.validation.d.ts.map