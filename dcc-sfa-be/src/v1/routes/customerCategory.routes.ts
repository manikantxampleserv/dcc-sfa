import express from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { customerCategoryController } from '../controllers/customerCategory.controller';

const router = express.Router();

router.post(
  '/customer-category/bulk',
  authenticateToken,
  customerCategoryController.bulkCustomerCategory
);

router.get(
  '/customer-category',
  authenticateToken,
  customerCategoryController.getAllCustomerCategory
);

router.get(
  '/customer-category/:id',
  authenticateToken,
  customerCategoryController.getCustomerCategoryById
);

router.delete(
  '/customer-category/:id',
  authenticateToken,
  customerCategoryController.deleteCustomerCategory
);

export default router;
