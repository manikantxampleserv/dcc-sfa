import { Router } from 'express';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
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
  requirePermission([{ module: 'currency', action: 'create' }]),
  createCurrenciesValidation,
  validate,
  currenciesController.createCurrencies
);

router.get(
  '/currencies',
  authenticateToken,
  requirePermission([{ module: 'currency', action: 'read' }]),
  currenciesController.getAllCurrencies
);

router.get(
  '/currencies/:id',
  authenticateToken,
  requirePermission([{ module: 'currency', action: 'read' }]),
  currenciesController.getCurrenciesById
);

router.put(
  '/currencies/:id',
  authenticateToken,
  auditUpdate('currencies'),
  requirePermission([{ module: 'currency', action: 'update' }]),
  currenciesController.updateCurrencies
);

router.delete(
  '/currencies/:id',
  authenticateToken,
  auditDelete('currencies'),
  requirePermission([{ module: 'currency', action: 'delete' }]),
  currenciesController.deleteCurrencies
);

export default router;
