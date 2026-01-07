import { body } from 'express-validator';
import { getPrisma } from '../../configs/prisma.client';

const checkDuplicateCurrencyCode = async (value: string) => {
  const prisma = getPrisma();
  const existingCurrency = await prisma.currencies.findUnique({
    where: { code: value.toUpperCase() },
  });
  return !existingCurrency;
};

export const createCurrenciesValidation = [
  body('name')
    .notEmpty()
    .isString()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('code')
    .notEmpty()
    .isString()
    .isLength({ min: 3, max: 10 })
    .matches(/^[A-Z]{3}$/)
    .withMessage(
      'Code must be exactly 3 uppercase letters (e.g., USD, EUR, GBP)'
    )
    .custom(checkDuplicateCurrencyCode)
    .withMessage('Currency with this code already exists'),

  body('symbol')
    .optional()
    .isString()
    .isLength({ max: 10 })
    .withMessage('Symbol must be a string with maximum 10 characters'),

  body('exchange_rate_to_base')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Exchange rate must be a positive number'),

  body('is_base')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('Is base must be either Y or N'),

  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('Is active must be either Y or N'),
];
