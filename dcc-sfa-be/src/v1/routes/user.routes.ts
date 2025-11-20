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
import { userController } from '../controllers/user.controller';
import {
  createUserValidation,
  updateUserValidation,
} from '../validations/user.validation';
import { upload } from '../../utils/multer';

const router = Router();

// Create user - using dynamic module/action
router.post(
  '/users',
  upload.single('profile_image'),
  authenticateToken,
  auditCreate('users'),
  requirePermission([{ module: 'user', action: 'create' }]),
  createUserValidation,
  userController.createUser
);

// Get own profile - using dynamic module/action
router.get('/users/me', authenticateToken, userController.getUserProfile);

// Update own profile - using dynamic module/action
router.put(
  '/users/me',
  authenticateToken,
  upload.single('profile_image'),
  updateUserValidation,
  userController.updateUserProfile
);

// Get all users - using dynamic module/action
router.get(
  '/users',
  authenticateToken,
  requirePermission([{ module: 'user', action: 'read' }]),
  userController.getUsers
);

// Get user by ID - using dynamic module/action
router.get(
  '/users/:id',
  authenticateToken,
  requirePermission([{ module: 'user', action: 'read' }]),
  userController.getUserById
);

// Update user - using dynamic module/action
router.put(
  '/users/:id',
  authenticateToken,
  upload.single('profile_image'),
  auditUpdate('users'),
  requirePermission([{ module: 'user', action: 'update' }]),
  updateUserValidation,
  userController.updateUser
);

// Delete user - using dynamic module/action
router.delete(
  '/users/:id',
  authenticateToken,
  auditDelete('users'),
  requirePermission([{ module: 'user', action: 'delete' }]),
  userController.deleteUser
);

router.get(
  '/users-dropdown',
  authenticateToken,
  userController.getUsersDropdown
);

export default router;
