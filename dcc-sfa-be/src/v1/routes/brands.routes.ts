import express from 'express';
import {
  auditCreate,
  auditDelete,
  auditUpdate,
} from '../../middlewares/audit.middleware';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validation.middleware';
import { upload } from '../../utils/multer';
import { brandsController } from '../controllers/brands.controller';
import {
  createBrandValidation,
  updateBrandValidation,
} from '../validations/brands.validation';

const router = express.Router();

router.post(
  '/brands',
  upload.single('logo'),
  authenticateToken,
  auditCreate('brands'),
  requirePermission([{ module: 'brand', action: 'create' }]),
  createBrandValidation,
  validate,
  brandsController.createBrand
);
router.get(
  '/brands',
  authenticateToken,
  requirePermission([{ module: 'brand', action: 'read' }]),
  brandsController.getAllBrands
);
router.get(
  '/brands/:id',
  authenticateToken,
  requirePermission([{ module: 'brand', action: 'read' }]),
  brandsController.getBrandById
);
router.put(
  '/brands/:id',
  upload.single('logo'),
  authenticateToken,
  auditUpdate('brands'),
  requirePermission([{ module: 'brand', action: 'update' }]),
  updateBrandValidation,
  validate,
  brandsController.updateBrand
);
router.delete(
  '/brands/:id',
  authenticateToken,
  auditDelete('brands'),
  requirePermission([{ module: 'brand', action: 'delete' }]),
  brandsController.deleteBrand
);

export default router;
