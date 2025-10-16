import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { assetMovementsController } from '../controllers/assetMovements.controller';
import { createAssetMovementsValidation } from '../validations/assetMovements.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/asset-movement',
  authenticateToken,
  createAssetMovementsValidation,
  validate,
  assetMovementsController.createAssetMovements
);

router.get(
  '/asset-movement/:id',
  authenticateToken,
  assetMovementsController.getAssetMovementsById
);
router.get(
  '/asset-movement',
  authenticateToken,
  assetMovementsController.getAllAssetMovements
);

router.put(
  '/asset-movement/:id',
  authenticateToken,
  assetMovementsController.updateAssetMovements
);

router.delete(
  '/asset-movement/:id',
  authenticateToken,
  assetMovementsController.deleteAssetMovements
);

export default router;
