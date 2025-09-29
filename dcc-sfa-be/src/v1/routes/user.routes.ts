import { Router } from 'express';
import {
  authenticateToken,
  requireAnyModulePermission,
} from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validation.middleware';
import { MODULES, ACTIONS } from '../../configs/permissions.config';
import { userController } from '../controllers/user.controller';
import {
  createUserValidation,
  updateUserValidation,
} from '../validations/user.validation';
import { upload } from '../../utils/multer';

const router = Router();

router.post(
  '/users',
  upload.single('profile_image'),
  authenticateToken,
  requireAnyModulePermission([
    { module: MODULES.USER, action: ACTIONS.CREATE },
  ]),
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

  // requireAnyModulePermission([
  //   { module: MODULES.USER, action: ACTIONS.UPDATE },
  // ]),
  updateUserValidation,
  userController.updateUser
);

router.delete(
  '/users/:id',
  authenticateToken,

  userController.deleteUser
);

export default router;
