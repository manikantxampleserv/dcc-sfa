import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';
import { validate } from '../../middlewares/validation.middleware';
import { currenciesController } from '../controllers/currencies.controller';
import { createCurrenciesValidation } from '../validations/currencies.validation';
const router = Router();

router.post(
  '/currencies',
  authenticateToken,
  auditCreate('currencies'),
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
  auditUpdate('currencies'),
  currenciesController.updateCurrencies
);

router.delete(
  '/currencies/:id',
  authenticateToken,
  auditDelete('currencies'),
  currenciesController.deleteCurrencies
);

export default router;
