import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';
import { routePriceListController } from '../controllers/routePriceList.controller';
// import { createPriceListItemsValidation } from '../validations/priceListItems.validation';
// import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/route-price-list',
  authenticateToken,
  auditCreate('route_price_lists'),
  // createPriceListItemsValidation,
  // validate,
  routePriceListController.createRoutePriceList
);

router.get(
  '/route-price-list/:id',
  authenticateToken,
  routePriceListController.getRoutePriceListById
);
router.get(
  '/route-price-list',
  authenticateToken,
  routePriceListController.getAllRoutePriceList
);

router.put(
  '/route-price-list/:id',
  authenticateToken,
  auditUpdate('route_price_lists'),
  routePriceListController.updateRoutePriceList
);

router.delete(
  '/route-price-list/:id',
  authenticateToken,
  auditDelete('route_price_lists'),
  routePriceListController.deleteRoutePriceList
);

export default router;
