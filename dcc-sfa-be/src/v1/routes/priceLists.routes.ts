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
import { priceListsController } from '../controllers/priceLists.controller';
import {
  createPriceListsValidation,
  updatePriceListValidation,
} from '../validations/priceLists.validation';

import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/price-lists',
  authenticateToken,
  auditCreate('price_lists'),
  requirePermission([{ module: 'pricelist', action: 'create' }]),
  createPriceListsValidation,
  validate,
  priceListsController.upsertPriceList
);

router.get(
  '/price-lists/:id',
  authenticateToken,
  requirePermission([{ module: 'pricelist', action: 'read' }]),
  priceListsController.getPriceListsById
);
router.get(
  '/price-lists',
  authenticateToken,
  requirePermission([{ module: 'pricelist', action: 'read' }]),
  priceListsController.getAllPriceLists
);

router.delete(
  '/price-lists/:id',
  authenticateToken,
  auditDelete('price_lists'),
  requirePermission([{ module: 'pricelist', action: 'delete' }]),
  priceListsController.deletePriceLists
);

export default router;
