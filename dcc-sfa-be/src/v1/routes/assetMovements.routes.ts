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
import { assetMovementsController } from '../controllers/assetMovements.controller';
import { createAssetMovementsValidation } from '../validations/assetMovements.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/asset-movement',
  authenticateToken,
  auditCreate('asset_movements'),
  requirePermission([{ module: 'asset-movement', action: 'create' }]),
  createAssetMovementsValidation,
  validate,
  assetMovementsController.createAssetMovements
);

router.get(
  '/asset-movement/:id',
  authenticateToken,
  requirePermission([{ module: 'asset-movement', action: 'read' }]),
  assetMovementsController.getAssetMovementsById
);
router.get(
  '/asset-movement',
  authenticateToken,
  requirePermission([{ module: 'asset-movement', action: 'read' }]),
  assetMovementsController.getAllAssetMovements
);

router.put(
  '/asset-movement/:id',
  authenticateToken,
  auditUpdate('asset_movements'),
  requirePermission([{ module: 'asset-movement', action: 'update' }]),
  assetMovementsController.updateAssetMovements
);

router.delete(
  '/asset-movement/:id',
  authenticateToken,
  auditDelete('asset_movements'),
  requirePermission([{ module: 'asset-movement', action: 'delete' }]),
  assetMovementsController.deleteAssetMovements
);

export default router;
