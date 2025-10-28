import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
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
  createAssetWarrantyClaimsValidation,
  validate,
  assetWarrantyClaimsController.createAssetWarrantyClaims
);

router.get(
  '/asset-warranty-claims/:id',
  authenticateToken,
  assetWarrantyClaimsController.getAssetWarrantyClaimsById
);
router.get(
  '/asset-warranty-claims',
  authenticateToken,
  assetWarrantyClaimsController.getAllAssetWarrantyClaims
);

router.put(
  '/asset-warranty-claims/:id',
  authenticateToken,
  auditUpdate('asset_warranty_claims'),
  assetWarrantyClaimsController.updateAssetWarrantyClaims
);

router.delete(
  '/asset-warranty-claims/:id',
  authenticateToken,
  auditDelete('asset_warranty_claims'),
  assetWarrantyClaimsController.deleteAssetWarrantyClaims
);

export default router;
