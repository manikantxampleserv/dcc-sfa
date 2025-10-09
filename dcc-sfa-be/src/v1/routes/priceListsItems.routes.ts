import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { priceListItemsController } from '../controllers/priceListsItems.controller';
import { createPriceListItemsValidation } from '../validations/priceListItems.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/price-list-items',
  authenticateToken,
  createPriceListItemsValidation,
  validate,
  priceListItemsController.createPriceListItems
);

router.get(
  '/price-list-items/:id',
  authenticateToken,
  priceListItemsController.getPriceListItemsById
);
router.get(
  '/price-list-items',
  authenticateToken,
  priceListItemsController.getAllPriceListItems
);

router.put(
  '/price-list-items/:id',
  authenticateToken,
  priceListItemsController.updatePriceListItems
);

router.delete(
  '/price-list-items/:id',
  authenticateToken,
  priceListItemsController.deletePriceListItems
);

export default router;
