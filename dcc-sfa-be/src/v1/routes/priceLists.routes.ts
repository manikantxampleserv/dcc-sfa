import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { priceListsController } from '../controllers/priceLists.controller';
import {
  createPriceListsValidation,
  updatePriceListValidation,
} from '../validations/priceLists.validation';

import { upload } from '../../utils/multer';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/price-lists',
  authenticateToken,
  createPriceListsValidation,
  validate,
  priceListsController.upsertPriceList
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

router.delete(
  '/price-lists/:id',
  authenticateToken,
  priceListsController.deletePriceLists
);

export default router;
