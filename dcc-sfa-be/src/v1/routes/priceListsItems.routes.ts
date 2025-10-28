import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { priceListItemsController } from '../controllers/priceListsItems.controller';
import {
  createPriceListItemsValidation,
  updatePriceListItemsValidation,
} from '../validations/priceListItems.validation';
import { validate } from '../../middlewares/validation.middleware';
import {
  auditCreate,
  auditDelete,
  auditUpdate,
} from '../../middlewares/audit.middleware';

const router = Router();

router.post(
  '/price-list-items',
  authenticateToken,
  auditCreate('price_list_items'),
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
  auditUpdate('price_list_items'),
  updatePriceListItemsValidation,
  validate,
  priceListItemsController.updatePriceListItems
);

router.delete(
  '/price-list-items/:id',
  authenticateToken,
  auditDelete('price_list_items'),
  priceListItemsController.deletePriceListItems
);

export default router;
