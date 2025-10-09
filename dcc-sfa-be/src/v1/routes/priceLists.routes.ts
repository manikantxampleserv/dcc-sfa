import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { priceListsController } from '../controllers/priceLists.controller';
import { createPriceListsValidation } from '../validations/priceLists.validation';

import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/price-lists',
  authenticateToken,
  createPriceListsValidation,
  validate,
  priceListsController.createPriceLists
);

router.get(
  '/price-lists/:id',
  authenticateToken,
  priceListsController.getPriceListsById
);
router.get(
  '/price-lists',
  authenticateToken,
  priceListsController.getAllPriceLists
);

router.put(
  '/price-lists/:id',
  authenticateToken,
  priceListsController.updatePriceLists
);

router.delete(
  '/price-lists/:id',
  authenticateToken,
  priceListsController.deletePriceLists
);

export default router;
