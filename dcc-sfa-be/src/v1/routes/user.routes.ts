import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validation.middleware';
import {
  createUserValidation,
  updateUserValidation,
} from '../validations/user.validation';
import { userController } from '../controllers/user.controller';

const router = Router();

router.post(
  '/users',
  authenticateToken,
  createUserValidation,
  validate,
  userController.createUser
);

router.get('/users', authenticateToken, userController.getUsers);

router.get('/users/:id', userController.getUserById);

router.put(
  '/users/:id',
  authenticateToken,
  updateUserValidation,
  validate,
  userController.updateUser
);

router.delete('/users/:id', authenticateToken, userController.deleteUser);

export default router;
