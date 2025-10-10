import express from 'express';
import multer from 'multer';
import { brandsController } from '../controllers/brands.controller';
import {
  createBrandValidation,
  updateBrandValidation,
} from '../validations/brands.validation';
import { upload } from '../../utils/multer';
import { validate } from '../../middlewares/validation.middleware';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = express.Router();

router.post(
  '/brands',
  upload.single('logo'),
  authenticateToken,
  createBrandValidation,
  validate,
  brandsController.createBrand
);
router.get('/brands', authenticateToken, brandsController.getAllBrands);
router.get('/brands/:id', authenticateToken, brandsController.getBrandById);
router.put(
  '/brands/:id',
  upload.single('logo'),
  authenticateToken,
  updateBrandValidation,
  validate,
  brandsController.updateBrand
);
router.delete('/brands/:id', authenticateToken, brandsController.deleteBrand);

export default router;
