import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { MODULES, ACTIONS } from '../../configs/permissions.config';
import { userController } from '../controllers/user.controller';
import {
  createUserValidation,
  updateUserValidation,
} from '../validations/user.validation';
import { upload } from '../../utils/multer';
import { checkPermission } from '../../middlewares/checkPermission';

const router = Router();

router.post(
  '/users',
  upload.single('profile_image'),
  authenticateToken,
  checkPermission(MODULES.USER, ACTIONS.CREATE),
  createUserValidation,
  userController.createUser
);

router.get('/users/me', authenticateToken, userController.getUserProfile);

router.put(
  '/users/me',
  authenticateToken,
  upload.single('profile_image'),
  updateUserValidation,
  userController.updateUserProfile
);

router.get('/users', authenticateToken, userController.getUsers);

router.get('/users/:id', authenticateToken, userController.getUserById);

router.put(
  '/users/:id',
  authenticateToken,
  upload.single('profile_image'),
  checkPermission(MODULES.USER, ACTIONS.UPDATE),
  updateUserValidation,
  userController.updateUser
);

router.delete(
  '/users/:id',
  authenticateToken,
  checkPermission(MODULES.USER, ACTIONS.DELETE),
  userController.deleteUser
);

export default router;
