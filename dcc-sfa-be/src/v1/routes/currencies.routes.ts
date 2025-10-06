import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validation.middleware';
import { currenciesController } from '../controllers/currencies.controller';
import { createCurrenciesValidation } from '../validations/currencies.validation';
const router = Router();

router.post(
  '/currencies',
  authenticateToken,
  createCurrenciesValidation,
  validate,
  currenciesController.createCurrencies
);

router.get(
  '/currencies',
  authenticateToken,
  currenciesController.getAllCurrencies
);

router.get(
  '/currencies/:id',
  authenticateToken,
  currenciesController.getCurrenciesById
);

router.put(
  '/currencies/:id',
  authenticateToken,
  currenciesController.updateCurrencies
);

router.delete(
  '/currencies/:id',
  authenticateToken,
  currenciesController.deleteCurrencies
);

export default router;
