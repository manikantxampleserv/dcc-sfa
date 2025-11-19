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
import { routePriceListController } from '../controllers/routePriceList.controller';
// import { createPriceListItemsValidation } from '../validations/priceListItems.validation';
// import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/route-price-list',
  authenticateToken,
  auditCreate('route_price_lists'),
  requirePermission([{ module: 'pricelist', action: 'create' }]),
  // createPriceListItemsValidation,
  // validate,
  routePriceListController.createRoutePriceList
);

router.get(
  '/route-price-list/:id',
  authenticateToken,
  requirePermission([{ module: 'pricelist', action: 'read' }]),
  routePriceListController.getRoutePriceListById
);
router.get(
  '/route-price-list',
  authenticateToken,
  requirePermission([{ module: 'pricelist', action: 'read' }]),
  routePriceListController.getAllRoutePriceList
);

router.put(
  '/route-price-list/:id',
  authenticateToken,
  auditUpdate('route_price_lists'),
  requirePermission([{ module: 'pricelist', action: 'update' }]),
  routePriceListController.updateRoutePriceList
);

router.delete(
  '/route-price-list/:id',
  authenticateToken,
  auditDelete('route_price_lists'),
  requirePermission([{ module: 'pricelist', action: 'delete' }]),
  routePriceListController.deleteRoutePriceList
);

export default router;
