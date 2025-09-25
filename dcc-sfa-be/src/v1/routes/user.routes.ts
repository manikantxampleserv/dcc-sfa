import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validation.middleware';
import {
  createUserValidation,
  updateUserValidation,
} from '../validations/user.validation';
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/user.controller';

const router = Router();

router.post('/users', authenticate, createUserValidation, validate, createUser);

router.get('/users', authenticate, getUsers);
router.get('/users/:id', authenticate, getUserById);

router.put(
  '/users/:id',
  authenticate,
  updateUserValidation,
  validate,
  updateUser
);
router.delete('/users/:id', authenticate, deleteUser);

export default router;
