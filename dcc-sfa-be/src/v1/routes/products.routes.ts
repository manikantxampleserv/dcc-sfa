import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
// import { productsController } from '../controllers/products.controller';

const router = Router();

// router.post('/products', authenticateToken, productsController.createProduct);

// router.get('/products', authenticateToken, productsController.getAllProducts);

// router.get(
//   '/products/:id',
//   authenticateToken,
//   productsController.getProductById
// );

// router.delete(
//   '/products/:id',
//   authenticateToken,
//   productsController.deleteProduct
// );

export default router;
