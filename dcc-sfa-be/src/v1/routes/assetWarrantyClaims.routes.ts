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
import { assetWarrantyClaimsController } from '../controllers/assetWarrantyClaims.controller';
import { createAssetWarrantyClaimsValidation } from '../validations/assetWarrantyClaims.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/asset-warranty-claims',
  authenticateToken,
  auditCreate('asset_warranty_claims'),
  requirePermission([{ module: 'maintenance', action: 'create' }]),
  createAssetWarrantyClaimsValidation,
  validate,
  assetWarrantyClaimsController.createAssetWarrantyClaims
);

router.get(
  '/asset-warranty-claims/:id',
  authenticateToken,
  requirePermission([{ module: 'maintenance', action: 'read' }]),
  assetWarrantyClaimsController.getAssetWarrantyClaimsById
);
router.get(
  '/asset-warranty-claims',
  authenticateToken,
  requirePermission([{ module: 'maintenance', action: 'read' }]),
  assetWarrantyClaimsController.getAllAssetWarrantyClaims
);

router.put(
  '/asset-warranty-claims/:id',
  authenticateToken,
  auditUpdate('asset_warranty_claims'),
  requirePermission([{ module: 'maintenance', action: 'update' }]),
  assetWarrantyClaimsController.updateAssetWarrantyClaims
);

router.delete(
  '/asset-warranty-claims/:id',
  authenticateToken,
  auditDelete('asset_warranty_claims'),
  requirePermission([{ module: 'maintenance', action: 'delete' }]),
  assetWarrantyClaimsController.deleteAssetWarrantyClaims
);

export default router;
